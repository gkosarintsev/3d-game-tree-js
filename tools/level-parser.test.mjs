/**
 * Автотест пайплайна «уровень из JSON» на Node: `node tools/level-parser.test.mjs`.
 *
 * Проверяет то, что нельзя проверить в браузере дешевле, чем здесь: схему и
 * геометрия бэкенда (запрещённые случаи), геодезия нормализатора (союз
 * прямоугольников, проступи, опоры, проёмы) и детерминизм CLI — побайтово
 * одинаковый файл при повторном запуске.
 *
 * Браузерные автотесты карты (tests/*.test.js) стоят отдельно: здесь Three.js не
 * нужен и не запускается.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateLevel, LEVEL_SPEC_V2 } from './level-schema.mjs';
import { normalizeLevel, waterwayFoot, stairRun } from './normalize-level.mjs';
import { generateModule } from './build-level.mjs';
import { expandCity, ARCHETYPE_NAMES } from './city.js';
import { reliefOf } from '../src/relief.js';
import { r3, frameOf, frameAt, rotatePoint, unrotatePoint, obbHitsRect, obbHitsObb, obbOf, rectsIntersect, rotatedBounds, pointInPoly } from '../src/geo2d.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const ROOT = resolve(import.meta.dirname, '..');
const LEVEL_PATH = resolve(ROOT, 'src/levels/level-09.json');
const rawLevel = JSON.parse(readFileSync(LEVEL_PATH, 'utf8'));

let passed = 0;
const failures = [];
const pending = [];

/** Проверка; `fn` может быть асинхронным — одна проверка читает модуль главы импортом. */
function t(name, fn) {
  pending.push((async () => {
    try {
      await fn();
      passed++;
      console.log(`  ok  ${name}`);
    } catch (e) {
      failures.push(name);
      console.log(`FAIL  ${name}\n      ${String(e.message).split('\n')[0]}`);
    }
  })());
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

function eq(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: ожидалось ${JSON.stringify(expected)}, получено ${JSON.stringify(actual)}`);
  }
}

/** Копия главы с правкой → список ошибок валидатора. */
function errorsOf(mutate) {
  const raw = structuredClone(rawLevel);
  mutate(raw);
  return validateLevel(raw).errors;
}

/** Ищёт в списке ошибок хотя бы одну, содержащую все подстроки. */
function hasError(errors, ...needles) {
  const hit = errors.find(e => needles.every(n => e.includes(n)));
  assert(hit, `ошибка не найдена.\nожидались подстроки: ${needles.join(' + ')}\nполучены: ${errors.join('\n') || '(нет ошибок)'}`);
  return hit;
}

// ---------------------------------------------------------------- глава 9 как данные

t('исходная глава проходит валидатор без ошибок и предупреждений', () => {
  const { errors, warnings } = validateLevel(rawLevel);
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  eq(warnings.length, 0, `предупреждения: ${warnings.join(' | ')}`);
});

t('нормализация главы не бросает и даёт все секции карты', () => {
  const level = normalizeLevel(rawLevel);
  eq(level.map.kind, 'json', 'kind карты');
  assert(level.map.buildings.length === 4, `зданий ${level.map.buildings.length}, ожидалось 4`);
  assert(level.map.roads.length === 4, `дорог ${level.map.roads.length}, ожидалось 4`);
  assert(level.map.props.length > 0, 'предметов нет ни одного');
  assert(level.map.lights.length > 0, 'настоящих огней нет');
});

// ---------------------------------------------------------------- запрещённые случаи

t('схема бракует отсутствующие и лишние поля, неверные типы и enum', () => {
  hasError(errorsOf(r => { delete r.ground.size; }), 'ground.size', 'обязательное');
  hasError(errorsOf(r => { r.ground.size = '176'; }), 'ground.size');
  hasError(errorsOf(r => { r.roads[0].type = 'tunnel'; }), 'roads[0]', 'type');
  hasError(errorsOf(r => { r.roads[0].width = 1; }), 'roads[0].width');
  hasError(errorsOf(r => { r.gameplay.goal = 'coins'; }), 'gameplay.goal');
  hasError(errorsOf(r => { r.landscapeObjects[0].model = 'pyramid'; }), 'model');
  hasError(errorsOf(r => { r.ground.color = 'red'; }), 'color');
  hasError(errorsOf(r => { r.extraKey = 1; }), 'extraKey');
});

t('косой сегмент дороги — ошибка', () => {
  hasError(errorsOf(r => { r.roads[0].points[1] = { x: 5, y: 0.12, z: 3 }; }), 'косой');
});

t('настил с уклоном круче maxSlope — ошибка', () => {
  hasError(
    errorsOf(r => { r.roads[3].points[1] = { x: -29.4, y: 3.2, z: 56 }; }),
    'уклон',
  );
});

t('эстакада с верхом ниже bridgeMinHeight — ошибка', () => {
  hasError(errorsOf(r => {
    for (const p of r.roads[2].points) p.y = 0.5;
  }), 'не поднимается над землёй');
});

t('комната вне периметра footprint — ошибка', () => {
  hasError(errorsOf(r => {
    r.buildings[0].rooms[0].polygon = [
      { x: 4, z: 4 }, { x: 20, z: 4 }, { x: 20, z: 30 }, { x: 4, z: 30 },
    ];
  }), 'за периметр footprint');
});

t('пересечение комнат одного этажа — ошибка, разных этажей — норма', () => {
  hasError(errorsOf(r => {
    r.buildings[0].rooms[1].polygon = r.buildings[0].rooms[0].polygon.map(p => ({ ...p }));
  }), 'пересекается с комнатой');
  const ok = errorsOf(r => {
    r.buildings[0].rooms[3].polygon = r.buildings[0].rooms[0].polygon.map(p => ({ ...p }));
  });
  assert(!ok.some(e => e.includes('пересекается')), 'комнаты разных этажей ложно забракованы');
});

t('лестница вне footprint — ошибка', () => {
  hasError(errorsOf(r => { r.buildings[0].stairs[0].position = { x: 100, z: 100 }; }), 'вне footprint');
});

t('низ и верх марша обязаны попадать в комнаты своих этажей', () => {
  // зал кафе урезан так, что марш (x 28…34, z 27…33) стоит над пустотой этажа 0
  hasError(errorsOf(r => {
    r.buildings[0].rooms[1].polygon = [
      { x: 24, z: 8 }, { x: 38, z: 8 }, { x: 38, z: 26 }, { x: 24, z: 26 },
    ];
  }), 'низ марша');
  // коридор второго этажа свёрнут в угол: на его плите марш и закончится
  hasError(errorsOf(r => {
    r.buildings[0].rooms[2].polygon = [
      { x: 24, z: 8 }, { x: 26, z: 8 }, { x: 26, z: 9 }, { x: 24, z: 9 },
    ];
    r.buildings[0].rooms[2].connections = [];
  }), 'верх марша');
});

t('косой марш (rotation не кратен 90°) отклоняется парсером', () => {
  const raw = structuredClone(rawLevel);
  raw.buildings[0].stairs[0].rotation = 45;
  const errs = validateLevel(raw).errors;
  if (errs.length) {
    assert(errs.some(e => e.includes('rotation')), `rotation не пойман валидатором: ${errs.join(' | ')}`);
    return;
  }
  // схема числового enum не держит — бракует нормализатор, и CLI обязан
  // показать это списком, а не упасть на середине записи
  let thrown = null;
  try {
    generateModule(raw, 'src/levels/level-09.json');
  } catch (e) {
    thrown = e;
  }
  assert(thrown && /rotation/.test(thrown.message), 'парсер молчит на косой марш');
});

t('дверь не на ребре комнаты — ошибка', () => {
  hasError(errorsOf(r => {
    r.buildings[0].rooms[0].connections[0].portalPosition = { x: 16, y: 0, z: 12 };
  }), 'не на ребре комнаты');
});

t('неизвестный connections.target — ошибка', () => {
  hasError(errorsOf(r => {
    r.buildings[0].rooms[0].connections[0].target = 'plaza_garden';
  }), 'не улица, не комната и не лестница');
});

t('повторный id — ошибка', () => {
  hasError(errorsOf(r => { r.buildings[2].id = r.buildings[0].id; }), 'уже занят');
  hasError(errorsOf(r => { r.landscapeObjects[1].id = r.landscapeObjects[0].id; }), 'уже занят');
});

t('больше maxRealLights настоящих источников — ошибка', () => {
  hasError(errorsOf(r => {
    for (let i = 0; i < J.maxRealLights; i++) {
      r.lights.push({ id: `extra_${i}`, type: 'point', position: { x: 1, y: 3, z: 1 }, intensity: 10 });
    }
  }), 'максимум');
});

t('второй directional — ошибка', () => {
  hasError(errorsOf(r => {
    r.lights.push({ id: 'sun2', type: 'directional', position: { x: -120, y: 220, z: 80 }, intensity: 0.2 });
  }), 'больше одного directional');
});

t('дом, вставший в план наземной улицы, — ошибка', () => {
  hasError(errorsOf(r => {
    const fp = r.buildings[2].footprint;
    for (const p of fp) p.z -= 6; // facade переезжает через полосу road_main (z −5…5)
    for (const p of r.buildings[2].rooms[0].polygon) p.z -= 6;
    r.buildings[2].rooms[0].connections[0].portalPosition.z = 2;
  }), 'дом стоит в улице');
});

t('авторская опора в плане наземной улицы — ошибка', () => {
  hasError(errorsOf(r => {
    r.landscapeObjects.push({
      id: 'pillar_in_road', model: 'concrete_pillar',
      position: { x: 0, y: 0, z: 0 }, scale: { x: 1.6, y: 4, z: 1.6 },
    });
  }), 'опора стоит в плане наземной дороги');
});

t('footprint с косым ребром — ошибка', () => {
  hasError(errorsOf(r => {
    r.buildings[2].footprint = [
      { x: 44, z: 8 }, { x: 58, z: 8 }, { x: 54, z: 14 }, { x: 44, z: 22 },
    ];
    r.buildings[2].rooms[0].polygon = r.buildings[2].footprint.slice(0, 4);
  }), 'ребро');
});

t('точка главы вне земли — ошибка', () => {
  hasError(errorsOf(r => { r.gameplay.spawn = { x: -400, z: 0 }; }), 'gameplay.spawn');
  hasError(errorsOf(r => { r.gameplay.exit = { x: 0, z: 400 }; }), 'gameplay.exit');
});

// ---------------------------------------------------------------- геодезия нормализатора

t('L-образный footprint → союз ровно двух прямоугольников', () => {
  const l = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_l');
  eq(l.rects.length, 2, 'прямоугольников плана');
  const area = l.rects.reduce((s, r) => s + (r.maxX - r.minX) * (r.maxZ - r.minZ), 0);
  // полоса z −34…−20 шириной 40 плюс отросток z −20…−8 шириной 14
  eq(area, 40 * 14 + 14 * 12, 'площадь союза');
});

t('наружные рёбра footprint — стены-фасады, рёбра комнат — перегородки', () => {
  const plaza = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_plaza');
  const half = J.wallThickness / 2;
  assert(plaza.walls.some(w => w.facade && w.axis === 'x' && Math.abs(w.minZ - (8 - half)) < 1e-9),
    'южный фасад не найден');
  assert(plaza.walls.some(w => !w.facade && w.axis === 'z' && Math.abs(w.minX - (24 - half)) < 1e-9),
    'перегородка x=24 не найдена');
  // фасад и наружное ребро комнаты, стоящей вплотную, дают один прямоугольник
  eq(plaza.walls.filter(w => w.axis === 'z' && Math.abs(w.minX - 7.825) < 1e-6).length, 1, 'дубль западного фасада');
});

t('марш 3,5 м разбит на ступени не круче maxRise и приходит ровно на этаж', () => {
  const plaza = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_plaza');
  const st = plaza.stairs.find(s => s.id === 'plaza_stair_a');
  eq(st.y0, 0, 'низ марша');
  eq(st.y1, 3.5, 'верх марша');
  assert(st.steps.length >= Math.ceil(3.5 / J.maxRise), `ступеней ${st.steps.length}, должно быть не меньше 7`);
  let prev = st.y0;
  for (const s of st.steps) {
    assert(s.top - prev <= J.maxRise + 1e-9, `подъём ступени ${(s.top - prev).toFixed(3)} больше ${J.maxRise}`);
    prev = s.top;
  }
  eq(prev, 3.5, 'верх последней проступи');
});

t('винтовая лестница — проступи по кругу внутри своего прямоугольника', () => {
  const l = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_l');
  const st = l.stairs.find(s => s.type === 'spiral');
  assert(st.steps.length >= Math.ceil((2 * Math.PI) / J.spiralAngle), `проступей винта ${st.steps.length}`);
  for (const s of st.steps) {
    assert(s.minX >= st.rect.minX - 1e-6 && s.maxX <= st.rect.maxX + 1e-6
      && s.minZ >= st.rect.minZ - 1e-6 && s.maxZ <= st.rect.maxZ + 1e-6, 'проступь винта вышла за прямоугольник лестницы');
  }
  eq(st.steps[st.steps.length - 1].top, st.y1, 'верх винта');
});

t('Г-образный марш даёт площадку между двумя прогонами', () => {
  const l = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_l');
  const st = l.stairs.find(s => s.type === 'l_shape');
  const tops = st.steps.map(s => s.top);
  eq(tops[tops.length - 1], st.y1, 'верх Г-образного марша');
  assert(st.rect.maxX - st.rect.minX > 0 && st.rect.maxZ - st.rect.minZ > 0, 'прямоугольник марша вырожден');
  // второй прогон идёт по Z: хотя бы одна ступень шире по Z, чем по X
  assert(st.steps.some(s => (s.maxZ - s.minZ) < (s.maxX - s.minX) - 0.2), 'нет перпендикулярного прогона');
});

t('проём двери — полоса doorWidth на ребре комнаты, inside/outside по разные стороны', () => {
  const plaza = normalizeLevel(rawLevel).map.buildings.find(b => b.id === 'building_plaza');
  const door = plaza.doors.find(d => d.target === 'road_main' && d.linkType === 'main_entrance');
  eq(Math.round((door.rect.maxX - door.rect.minX) * 1000) / 1000, J.doorWidth, 'ширина проёма по X');
  eq(door.axis, 'x', 'ось стены проёма');
  const hall = plaza.rooms.find(r => r.id === door.room);
  assert(inRect(door.inside, hall.rect), 'точка inside не в своей комнате');
  assert(!inRect(door.outside, plaza.bounds), 'точка outside не вышла за габарит здания');
  eq(Math.round((Math.abs(door.outside.z - door.inside.z)) * 100) / 100, 2.8, 'отступы inside/outside');
  assert(door.height <= J.doorHeight && door.height <= plaza.floorHeight - J.slabThickness,
    `высота двери ${door.height} выше пролёта`);
  // внутренняя дверь hall→cafe прорезает перегородку, а не фасад
  const inner = plaza.doors.find(d => d.target === 'plaza_cafe');
  assert(Math.abs(inner.rect.minX - (24 - J.wallThickness / 2 - 0.01)) < 1e-6, 'дверь в перегородку не встала');
});

t('уклон эстакады — единые наклонные пластины, перешагиваемые по уклону', () => {
  const road = normalizeLevel(rawLevel).map.roads.find(r => r.id === 'road_overpass');
  eq(road.decks.length, 3, 'пластин настила (два пролёта с уклоном + плоский верх)');
  const ramps = road.decks.filter(d => d.ramp);
  eq(ramps.length, 2, 'наклонных пластин');
  for (const d of road.decks) {
    const run = d.axis === 'x' ? d.maxX - d.minX : d.maxZ - d.minZ;
    const rise = Math.abs(d.topAtMax - d.topAtMin);
    assert(run <= 0 || rise / run <= J.maxSlope + 1e-9,
      `уклон ${(rise / run).toFixed(3)} м/м круче ${J.maxSlope}`);
    // плоский пролёт обязан быть плоским: перепад живёт в topAtMin/topAtMax, а не в topY
    eq(d.topY, Math.min(d.topAtMin, d.topAtMax), 'верх пластины ниже её конца');
    if (!d.ramp) eq(d.topAtMin, d.topAtMax, 'плоская пластина с перепадом');
  }
  eq(Math.max(...road.decks.map(d => Math.max(d.topAtMin, d.topAtMax))), 8, 'верх пролёта');
  eq(Math.min(...road.decks.map(d => Math.min(d.topAtMin, d.topAtMax))), 0.12, 'настил возвращается к земле');
  // концы пролётов сходятся: у соседних пластин общая граница держит одну отметку
  for (let i = 0; i + 1 < road.decks.length; i++) {
    const a = road.decks[i], b = road.decks[i + 1];
    if (a.axis !== 'x' || b.axis !== 'x') continue;
    if (Math.abs(a.maxX - b.minX) > 1e-6) continue;
    assert(Math.abs(a.topAtMax - b.topAtMin) < 1e-6,
      `стык пролётов ${i}→${i + 1} разошёлся: ${a.topAtMax} против ${b.topAtMin}`);
  }
});

t('опоры наклонного пролёта и пластина на грунте', () => {
  const level = normalizeLevel(rawLevel).map;
  const overpass = level.roads.find(r => r.id === 'road_overpass');
  const bank = level.roads.find(r => r.id === 'road_bank');
  assert(bank.decks.some(d => d.grounded), 'пластина насыпи не помечена стоящей на грунте');
  const pillars = level.props.filter(p => p.source === 'bridge_pillar' && p.id.startsWith('pillar_road_overpass_'));
  assert(pillars.length > 0, 'у эстакады нет ни одной опоры');
  for (const p of pillars) {
    for (const d of overpass.decks.filter(x => x.ramp)) {
      assert(!inRect({ x: p.position.x, z: p.position.z }, d), `опора ${p.id} под наклонным пролётом`);
    }
    // опора стоит ПОД настилом, а не сбоку от него: её габарит целиком в плане пластины
    const flat = overpass.decks.find(d => !d.ramp);
    const rect = {
      minX: p.position.x - p.scale.x / 2, maxX: p.position.x + p.scale.x / 2,
      minZ: p.position.z - p.scale.z / 2, maxZ: p.position.z + p.scale.z / 2,
    };
    assert(rect.minX >= flat.minX && rect.maxX <= flat.maxX
      && rect.minZ >= flat.minZ && rect.maxZ <= flat.maxZ,
      `опора ${p.id} вышла за план настила: ${JSON.stringify(rect)} vs ${JSON.stringify(flat)}`);
    // и отступлена от края не дальше pillarEdge (иначе снова висит за бортом)
    const crossMargin = Math.min(rect.minZ - flat.minZ, flat.maxZ - rect.maxZ);
    assert(crossMargin <= J.pillarEdge + 1e-6,
      `опора ${p.id} отстоит от края настила на ${crossMargin.toFixed(2)} м — дальше ${J.pillarEdge}`);
  }
});

t('опоры эстакады есть, и ни одна не в плане наземной улицы и не в здании', () => {
  const level = normalizeLevel(rawLevel).map;
  const pillars = level.props.filter(p => p.source === 'bridge_pillar');
  assert(pillars.length > 0, 'ни одной автогенерированной опоры');
  const groundRects = level.roads.filter(r => r.type === 'ground').flatMap(r => r.decks);
  for (const p of pillars) {
    const rect = {
      minX: p.position.x - p.scale.x / 2, maxX: p.position.x + p.scale.x / 2,
      minZ: p.position.z - p.scale.z / 2, maxZ: p.position.z + p.scale.z / 2,
    };
    for (const g of groundRects) {
      assert(!overlap(rect, g), `опора ${p.id} в плане наземной улицы`);
    }
    for (const b of level.buildings) {
      assert(!overlap(rect, b.bounds), `опора ${p.id} внутри габарита ${b.id}`);
    }
    assert(p.scale.y <= 8, `опора ${p.id} длиннее пролёта: ${p.scale.y}`);
  }
});

t('насыпь даёт тело и откосы, наземная улица — только настил', () => {
  const level = normalizeLevel(rawLevel).map;
  const bank = level.roads.find(r => r.id === 'road_bank');
  assert(bank.fill.length > 0, 'насыпи без тела');
  assert(bank.aprons.length > 0, 'насыпи без откосов');
  const main = level.roads.find(r => r.id === 'road_main');
  eq(main.fill.length, 0, 'тело у наземной улицы');
  eq(main.aprons.length, 0, 'откосы у наземной улицы');
});

t('фонари вдоль дорог стоят за краем настила и не в зданиях', () => {
  const level = normalizeLevel(rawLevel).map;
  const lamps = level.props.filter(p => p.source === 'road_lamp');
  assert(lamps.length > 0, 'ни одного автогенерированного фонаря');
  for (const lamp of lamps) {
    for (const b of level.buildings) {
      assert(!inRect(lamp.position, b.bounds), `фонарь ${lamp.id} внутри ${b.id}`);
    }
  }
  eq(lamps.every(l => l.model === 'lamp_post'), true, 'модель фонаря');
});

t('предмет ставится на свою опору: скапливается отметка настила, а не земля', () => {
  const level = normalizeLevel(rawLevel);
  const road = level.map.roads.find(r => r.id === 'road_main');
  const onDeck = level.map.props.find(p => p.source === 'authored'
    && road.decks.some(d => inRect(p.position, d)));
  if (onDeck) assert(Math.abs(onDeck.position.y - 0.12) < 0.01, `${onDeck.id}: y ${onDeck.position.y} вместо верха настила`);
  const off = level.map.props.find(p => p.source === 'authored' && p.model === 'tree');
  eq(off.position.y, 0, 'дерево вне настилов');
});

t('directional-свет сворачивается в sky.sun, остальные — в map.lights', () => {
  const level = normalizeLevel(rawLevel);
  eq(level.sky.sun.intensity, 0.55, 'интенсивность солнца из lights');
  assert(level.map.lights.every(l => l.type !== 'directional'), 'directional остался в источниках');
  const spot = level.map.lights.find(l => l.type === 'spot');
  assert(spot?.target, 'у прожектора нет цели — он светит вниз');
});

t('габарит мира покрывает землю, здания и настилы', () => {
  const level = normalizeLevel(rawLevel).map;
  for (const b of level.buildings) {
    assert(b.bounds.minX >= level.bounds.minX && b.bounds.maxX <= level.bounds.maxX, `${b.id} вышел за bounds по X`);
    assert(b.bounds.minZ >= level.bounds.minZ && b.bounds.maxZ <= level.bounds.maxZ, `${b.id} вышел за bounds по Z`);
  }
});

// ---------------------------------------------------------------- вода: схема, русло, опоры

/**
 * Полигон воды: канал с набережной и двумя бродами, река с откосами (в неё не
 * войти), наземная улица и мост над каналом. Глав с руслом ещё нет — проверка
 * геометрии не может ждать, пока их напишут, поэтому глава-полигон живёт здесь.
 */
function waterLevel(mutate) {
  const raw = {
    metadata: { levelName: 'water', name: 'Полигон воды', hint: '—', units: 'meters' },
    ground: { size: 160 },
    waterways: [
      {
        id: 'canal_quay', width: 20, bedY: -3, surfaceY: -1, bank: 'quay', wade: true,
        ramps: [{ at: { x: -12, z: 24 } }, { at: { x: -12, z: 56 }, width: 6 }],
        points: [{ x: -80, z: 40 }, { x: 80, z: 40 }],
      },
      {
        id: 'river_slope', width: 16, bedY: -2.5, surfaceY: -0.7, bank: 'slope', bankRun: 10, wade: false,
        points: [{ x: -80, z: -40 }, { x: 80, z: -40 }],
      },
    ],
    roads: [
      { id: 'road_bank', type: 'ground', width: 8, points: [{ x: -60, y: 0, z: 0 }, { x: 60, y: 0, z: 0 }] },
      { id: 'road_bridge', type: 'bridge', width: 6, points: [{ x: 0, y: 5, z: 22 }, { x: 0, y: 5, z: 58 }] },
    ],
    buildings: [],
    landscapeObjects: [],
    lights: [],
    gameplay: { goal: 'exit', spawn: { x: -30, z: 10 }, exit: { x: 30, z: 0 } },
  };
  if (mutate) mutate(raw);
  return raw;
}

function waterErrors(mutate) {
  return validateLevel(waterLevel(mutate)).errors;
}

t('полигон воды проходит валидатор и нормализатор без ошибок и предупреждений', () => {
  const { errors, warnings } = validateLevel(waterLevel());
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  eq(warnings.length, 0, `предупреждения: ${warnings.join(' | ')}`);
  const level = normalizeLevel(waterLevel());
  eq(level.map.channels.length, 2, 'каналов в данных');
  eq(level.map.channels[0].holes.length, 7, 'планов прорези у канала (дно + 2 схода + 4 куска стенки)');
});

/**
 * В русло сбрасывается только фонарь наземной улицы: настил моста и эстакады
 * сам держит свою опору света над водой, и фонарь на нём — не ошибка. Прежнее
 * правило, одинаковое для всех типов дороги, молчало на главе 10 восемнадцатью
 * «фонарь встал в русло» на трёх мостах, то есть браковало законные огни.
 */
t('фонарь моста над руслом остаётся, фонарь наземной улицы в русло не ставится', () => {
  const level = normalizeLevel(waterLevel(r => {
    r.roads[1].lamps = true;                       // мост через канал
    r.roads.push({
      id: 'road_quay', type: 'ground', width: 8, lamps: true,
      points: [{ x: -40, y: 0, z: 24 }, { x: 40, y: 0, z: 24 }],
    });
  }));
  const dropped = level.warnings.filter(w => w.includes('встал в русло'));
  eq(dropped.length, 1, `сброшенных фонарей не один: ${dropped.join(' | ')}`);
  assert(dropped[0].startsWith('road_quay'), `сброшен не наземный фонарь: ${dropped[0]}`);
  const bridge = level.map.roads.find(rod => rod.id === 'road_bridge');
  assert(bridge.lamps.length > 0, 'фонари настила моста пропали');
});

t('схема бракует косую ось русла, мелкое дно и воду выше земли', () => {
  hasError(waterErrors(r => { r.waterways[0].points[1] = { x: 78, z: 44 }; }), 'косой');
  hasError(waterErrors(r => { r.waterways[0].bedY = -0.1; }), 'мельче 0,2');
  hasError(waterErrors(r => { r.waterways[0].surfaceY = -3.5; }), 'не выше дна');
  hasError(waterErrors(r => { r.waterways[0].surfaceY = 0.5; }), 'выше земли');
  hasError(waterErrors(r => { r.waterways[0].points[0] = { x: -120, z: 40 }; }), 'вне земли');
  hasError(waterErrors(r => { r.waterways[1].bank = 'tunnel'; }), 'bank');
  hasError(waterErrors(r => { r.waterways[1].id = r.waterways[0].id; }), 'уже занят');
});

t('крутой откос берега — ошибка: берег обязан перешагиваться', () => {
  // перепад 2,5 м при bankRun 6 даёт 0,42 м/м против предела 0,3
  hasError(waterErrors(r => { r.waterways[1].bankRun = 6; }), 'уклон берега');
});

t('набережная с бродом обязана иметь не меньше двух сходов', () => {
  hasError(waterErrors(r => { r.waterways[0].ramps = [{ at: { x: -12, z: 24 } }]; }), 'не меньше двух');
  // то же русло без брода стенкой карниза законно: в него не входят
  const dry = waterErrors(r => { r.waterways[0].wade = false; r.waterways[0].ramps = []; });
  assert(!dry.some(e => e.includes('не меньше двух')), `сухое русло забраковано: ${dry.join(' | ')}`);
});

t('сход в стороне от русла — ошибка', () => {
  hasError(waterErrors(r => { r.waterways[0].ramps[0].at = { x: -12, z: -70 }; }), 'дальше, чем');
});

t('дом в русле и наземная улица через русло — ошибки; мост над руслом — норма', () => {
  hasError(waterErrors(r => {
    r.buildings = [{
      id: 'in_canal', floorsCount: 1, floorHeight: 3,
      footprint: [{ x: 60, z: 28 }, { x: 76, z: 28 }, { x: 76, z: 52 }, { x: 60, z: 52 }],
      rooms: [{ id: 'r1', floor: 0, type: 'room', polygon: [{ x: 61, z: 29 }, { x: 75, z: 29 }, { x: 75, z: 51 }, { x: 61, z: 51 }] }],
    }];
  }), 'дом стоит в воде');
  hasError(waterErrors(r => { r.roads[0].points = [{ x: -60, y: 0, z: 40 }, { x: 60, y: 0, z: 40 }]; }), 'наземной улицы пересёкся с руслом');
});

t('карниз: стенка прорезана ровно в местах сходов, по куску на сторону', () => {
  const canal = normalizeLevel(waterLevel()).map.channels[0];
  eq(canal.walls.length, 4, 'кусков береговой стенки');
  eq(canal.descents.filter(d => d.kind === 'ramp').length, 2, 'сходов');
  for (const w of canal.walls) {
    for (const d of canal.descents) {
      assert(!overlap(w.rect, d.plan), `стенка ${fmt(w.rect)} не прорезана сходом ${fmt(d.plan)}`);
    }
    assert(Math.abs(w.rect.maxZ - w.rect.minZ - J.wallThickness) < 1e-6, 'стенка не той толщины');
    // кусок обязан лежать ровно на одной из граней дна: 30 − толщина (юг) или 50 (север)
    const onFace = [30 - J.wallThickness, 50].some(f => Math.abs(w.rect.minZ - f) < 1e-6);
    assert(onFace, `кусок стенки ушёл с грани русла: ${fmt(w.rect)}`);
  }
});

t('сход в русло: нос на rampNose за грань берега, длина по maxSlope', () => {
  const canal = normalizeLevel(waterLevel()).map.channels[0];
  const cross = canal.segments[0].cross;
  const near = canal.descents.find(d => d.u0 < cross);
  const far = canal.descents.find(d => d.u0 > cross);
  eq(near.kind, 'ramp', 'вид схода');
  eq(near.u0, cross - (canal.segments[0].halfW - J.rampNose), 'нос ближнего схода по оси русла');
  eq(far.u0, cross + (canal.segments[0].halfW - J.rampNose), 'нос дальнего схода по оси русла');
  for (const d of [near, far]) {
    const side = Math.sign(d.u1 - d.u0);
    const inner = cross + side * canal.segments[0].halfW;
    const outer = cross + side * (canal.segments[0].halfW + J.wallThickness);
    eq(Math.abs(d.u1 - d.u0), Math.max(3 / J.maxSlope, J.wallThickness + 1), `длина пандуса ${d.id}`);
    eq(d.y0, -3, `низ схода ${d.id}`);
    eq(d.y1, 0, `верх схода ${d.id}`);
    assert(Math.abs((d.y1 - d.y0) / (d.u1 - d.u0)) <= J.maxSlope + 1e-9, `сход ${d.id} круче предела`);
    // нос заходит за грань дна в русло, пятка выходит за наружную грань стенки:
    // между ними пандус перекрывает карниз, иначе сход кончался бы в воздухе
    assert(side * (d.u0 - inner) < 0, `${d.id}: нос не зашёл за грань дна`);
    assert(side * (d.u1 - outer) > 0, `${d.id}: пятка не вышла за стенку`);
  }
});

t('берег-откос: по склону на каждую сторону, уклон в пределе, план по всей длине русла', () => {
  const river = normalizeLevel(waterLevel()).map.channels[1];
  eq(river.walls.length, 0, 'стенок у откоса');
  eq(river.descents.length, 2, 'склонов');
  for (const d of river.descents) {
    eq(d.kind, 'bank', 'вид берега');
    eq(Math.abs(d.u1 - d.u0), 10, 'заложение склона');
    assert(Math.abs((d.y1 - d.y0) / (d.u1 - d.u0)) <= J.maxSlope + 1e-9, 'склон круче предела');
    eq(d.v0, river.segments[0].lo, 'начало склона по длине русла');
    eq(d.v1, river.segments[0].hi, 'конец склона по длине русла');
  }
});

t('опоры моста над руслом опускаются до дна, вне русла — до земли', () => {
  const level = normalizeLevel(waterLevel());
  const pillars = level.map.props.filter(p => p.source === 'bridge_pillar');
  assert(pillars.length >= 3, `опор ${pillars.length}`);
  const inBed = pillars.filter(p => p.position.y === -3);
  assert(inBed.length === 2, `опор на дне ${inBed.length}, ожидалось 2 (оба ряда над руслом)`);
  for (const p of inBed) eq(p.scale.y, 7.4, `высота опоры ${p.id} над дном`);
  for (const p of pillars.filter(x => x.position.y === 0)) eq(p.scale.y, 4.4, 'высота опоры на земле');
  // ни одна опора не втиснута в береговую стенку и не висит над сушей ниже настила
  const canal = level.map.channels[0];
  for (const p of pillars) {
    const rect = {
      minX: p.position.x - p.scale.x / 2, maxX: p.position.x + p.scale.x / 2,
      minZ: p.position.z - p.scale.z / 2, maxZ: p.position.z + p.scale.z / 2,
    };
    for (const w of canal.walls) assert(!overlap(rect, w.rect), `опора ${p.id} в береговой стенке`);
    for (const d of canal.descents) assert(!overlap(rect, d.plan), `опора ${p.id} в плане схода`);
  }
});

t('waterwayFoot: дно, склон и сход отдают свою отметку, вне русла — null', () => {
  const foot = waterwayFoot(normalizeLevel(waterLevel()).map.channels);
  eq(foot(0, 40), -3, 'дно канала');
  eq(foot(0, -40), -2.5, 'дно реки');
  eq(foot(0, -27), -1.25, 'середина склона берега');
  eq(foot(-12, 25.6), -1.5, 'середина схода');
  eq(foot(0, 0), null, 'вне русла');
});

t('секция channels появляется только у главы с руслом', () => {
  const withWater = generateModule(waterLevel(), 'src/levels/level-10.json').code;
  assert(withWater.includes('"channels"'), 'каналов в модуле нет');
  assert(!generateModule(structuredClone(rawLevel), 'src/levels/level-09.json').code.includes('"channels"'),
    'у главы 9 появилась секция channels');
});

t('парсер воды детерминирован: два прогона дают побайтово равный модуль', () => {
  const a = generateModule(waterLevel(), 'src/levels/level-10.json');
  const b = generateModule(waterLevel(), 'src/levels/level-10.json');
  eq(a.code, b.code, 'текст модуля различится');
});

// ---------------------------------------------------------------- вертикаль: кровли, марши, переходы

/**
 * Полигон вертикали: подиум с ходовой кровлей, башня на нём (её пол первого этажа
 * = кровля подиума), марш на кровлю подиума, вертикальный марш в башне до её
 * кровли, skybridge от кровли подиума к дверью ангарa на отметке 8 м и мост,
 * который обязан остаться с опорами (переход — без).
 */
function vertLevel(mutate) {
  const box = (minX, minZ, maxX, maxZ) => [
    { x: minX, z: minZ }, { x: maxX, z: minZ }, { x: maxX, z: maxZ }, { x: minX, z: maxZ },
  ];
  const raw = {
    metadata: { levelName: 'vertical', name: 'Полигон вертикали', hint: '—', units: 'meters' },
    ground: { size: 160 },
    roads: [
      { id: 'street_0', type: 'ground', width: 8, lamps: true,
        points: [{ x: -70, y: 0.12, z: -44 }, { x: 70, y: 0.12, z: -44 }] },
      { id: 'sb_podium', type: 'skybridge', width: 3.4, lamps: true,
        points: [{ x: -10, y: 8, z: 0 }, { x: 20, y: 8, z: 0 }] },
      { id: 'br_0', type: 'bridge', width: 6,
        points: [{ x: 55, y: 5, z: 10 }, { x: 55, y: 5, z: 60 }] },
    ],
    buildings: [
      {
        id: 'podium', name: 'Подиум', floorsCount: 2, floorHeight: 4,
        footprint: box(-60, -30, -10, 30), roof: { walkable: true },
        rooms: [
          { id: 'pod_r0', floor: 0, type: 'hall', polygon: box(-60, -30, -10, 30),
            connections: [{ target: 'street_0', portalPosition: { x: -35, y: 0, z: -30 }, linkType: 'main_entrance' }] },
          { id: 'pod_r1', floor: 1, type: 'office', polygon: box(-60, -30, -10, 30) },
        ],
        stairs: [
          { id: 'pod_s01', type: 'straight', connectsFloors: [0, 1], position: { x: -52, z: 24 },
            dimensions: { width: 6, length: 4 } },
          { id: 'pod_roof', type: 'straight', connectsFloors: [1, 2], position: { x: -16, z: 0 },
            dimensions: { width: 6, length: 4 } },
        ],
      },
      {
        id: 'tower', name: 'Башня', baseY: 8, floorsCount: 4, floorHeight: 4,
        footprint: box(-45, -10, -25, 10), roof: { walkable: true },
        rooms: [
          { id: 'tw_r0', floor: 0, type: 'hall', polygon: box(-45, -10, -25, 10),
            connections: [{ target: 'street_0', portalPosition: { x: -45, y: 8, z: 0 }, linkType: 'door' }] },
          { id: 'tw_r1', floor: 1, type: 'office', polygon: box(-45, -10, -25, 10) },
          { id: 'tw_r2', floor: 2, type: 'office', polygon: box(-45, -10, -25, 10) },
          { id: 'tw_r3', floor: 3, type: 'utility', polygon: box(-45, -10, -25, 10) },
        ],
        stairs: [
          { id: 'tw_ladder', type: 'ladder', connectsFloors: [0, 2], position: { x: -35, z: 0 } },
          { id: 'tw_roof', type: 'ladder', connectsFloors: [2, 4], position: { x: -35, z: 0 } },
        ],
      },
      {
        id: 'annex', name: 'Ангар', floorsCount: 3, floorHeight: 4,
        footprint: box(20, -15, 50, 15),
        rooms: [
          { id: 'an_r2', floor: 2, type: 'office', polygon: box(20, -15, 50, 15),
            connections: [{ target: 'sb_podium', portalPosition: { x: 20, y: 8, z: 0 }, linkType: 'door' }] },
        ],
      },
    ],
    landscapeObjects: [],
    lights: [],
    gameplay: { goal: 'exit', spawn: { x: 0, z: -44 }, exit: { x: -50, z: 0 } },
  };
  if (mutate) mutate(raw);
  return raw;
}

function vertErrors(mutate) {
  return validateLevel(vertLevel(mutate)).errors;
}

function vertRoad(level, id) {
  return level.map.roads.find(r => r.id === id);
}

function vertBuilding(level, id) {
  return level.map.buildings.find(b => b.id === id);
}

t('полигон вертикали проходит валидатор и нормализатор без ошибок и предупреждений', () => {
  const { errors, warnings } = validateLevel(vertLevel());
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  eq(warnings.length, 0, `предупреждения: ${warnings.join(' | ')}`);
  const level = normalizeLevel(vertLevel());
  eq(vertBuilding(level, 'podium').roofY, 8, 'отметка кровли подиума');
  eq(vertBuilding(level, 'tower').roofY, 24, 'отметка кровли башни');
});

t('секция roof есть только у заданного дома, парапет по умолчанию — J.parapetHeight', () => {
  const level = normalizeLevel(vertLevel());
  eq(vertBuilding(level, 'podium').roof.walkable, true, 'ходовая кровля');
  eq(vertBuilding(level, 'podium').roof.parapet, J.parapetHeight, 'парапет по умолчанию');
  assert(vertBuilding(level, 'annex').roof === undefined, 'roof появилась у дома, где её не задавали');
  const low = normalizeLevel(vertLevel(r => { r.buildings[0].roof = { walkable: true, parapet: 0.4 }; }));
  eq(low.map.buildings[0].roof.parapet, 0.4, 'парапет из брифа');
});

t('глава 9 остаётся без секции roof — и в данных, и в байтах модуля', () => {
  const level = normalizeLevel(rawLevel);
  for (const b of level.map.buildings) {
    assert(b.roof === undefined, `${b.id}: roof там, где её не задавали`);
  }
  const mod = generateModule(structuredClone(rawLevel), 'src/levels/level-09.json').code;
  assert(!mod.includes('"roof"'), 'ключ roof завёлся в модуле главы 9 — байты не сойдутся');
});

t('этажи: вводимый дом ограничен enterableFloors, невводимая башня — до 60', () => {
  hasError(vertErrors(r => { r.buildings[0].floorsCount = 13; }), 'этажей во вводимом доме');
  const towerTall = vertErrors(r => {
    r.buildings[0].floorsCount = 60;
    r.buildings[0].isEnterable = false;
    r.buildings[0].rooms = [{ id: 'pod_r0', floor: 0, type: 'hall', polygon: r.buildings[0].footprint.map(p => ({ ...p })) }];
    r.buildings[0].stairs = [];
  });
  assert(!towerTall.some(e => e.includes('этажей во вводимом доме')), `невводимая башня в 60 этажей бракуется: ${towerTall.join(' | ')}`);
});

t('марш выше кровли и марш на невходовую кровлю — ошибки', () => {
  hasError(vertErrors(r => { r.buildings[0].stairs[1].connectsFloors = [1, 3]; }), 'марш ушёл выше кровли');
  hasError(vertErrors(r => { r.buildings[0].roof.walkable = false; }), 'она не ходкая');
});

t('план марша: dimensions обязательна всем, кроме ladder', () => {
  const errors = vertErrors(r => {
    delete r.buildings[1].stairs[0].dimensions;
    r.buildings[1].stairs[0].type = 'straight';
  });
  hasError(errors, 'tw_ladder', 'без dimensions');
  const level = normalizeLevel(vertLevel());
  const s = vertBuilding(level, 'tower').stairs.find(x => x.id === 'tw_ladder');
  // габарит шахты из `r3` координат, поэтому сравниваем с допуском: 1,4 − 1,4 в float даёт хвост
  assert(Math.abs((s.rect.maxX - s.rect.minX) - J.ladderShaft) < 1e-6,
    `ширина шахты ladder ${s.rect.maxX - s.rect.minX}, ожидалось ${J.ladderShaft}`);
});

t('вертикальный марш: проступи в одном плане шахты, подъём ≤ maxRise, верх на rise ниже отметки', () => {
  const level = normalizeLevel(vertLevel());
  const tower = vertBuilding(level, 'tower');
  const s = tower.stairs.find(x => x.id === 'tw_ladder');
  // проступей на одну меньше, чем подъёмов: верхний остаётся между последней
  // пластиной и этажом, иначе проём шахты читал бы опорой заподлицо
  eq(s.steps.length, Math.ceil(s.height / J.maxRise) - 1, 'число проступей');
  for (const st of s.steps) {
    eq(st.minX, s.rect.minX, 'план проступи по X');
    eq(st.maxZ, s.rect.maxZ, 'план проступи по Z');
  }
  const rise = s.height / (s.steps.length + 1);
  assert(rise <= J.maxRise + 1e-9, `подъём ${rise} круче ${J.maxRise}`);
  let prev = s.y0;
  for (const st of s.steps) {
    assert(st.top - prev <= J.maxRise + 1e-9, `подъём проступи ${st.top - prev} круче ${J.maxRise}`);
    prev = st.top;
  }
  // и вверх, и вниз последний переход — в шаге ноги: без зазора дыра односторонняя
  assert(Math.abs(prev - (s.y1 - rise)) < 1e-3,
    `верхняя проступь на ${prev}, ожидался подъём ниже этажа на ${rise}`);
  assert(s.y1 - prev <= CONFIG.building.stepUp + 1e-9, `этаж на ${s.y1 - prev} выше последней проступи — спуск не перешагнуть`);
  const up = tower.stairs.find(x => x.id === 'tw_roof');
  const upRise = up.height / (up.steps.length + 1);
  const upTop = up.steps[up.steps.length - 1].top;
  assert(Math.abs(upTop - (tower.roofY - upRise)) < 1e-3, `люк кровли: верхняя проступь на ${upTop}, плита на ${tower.roofY}`);
  assert(tower.roofY - upTop <= CONFIG.building.stepUp + 1e-9, 'спуск в люк круче шага ноги');
});

t('свисяющий торец skybridge — ошибка; торец у двери или у ходовой кровли — норма', () => {
  const both = vertErrors(r => {
    r.roads[1].points = [{ x: -10, y: 8, z: 60 }, { x: 20, y: 8, z: 60 }];
  });
  eq(both.filter(e => e.includes('не имеет опоры')).length, 2, `оба торца браковались иначе чем двумя ошибками: ${both.join(' | ')}`);
  // один конец зацепляется за кровлю, другой уходит в пустоту: проверка обязана
  // брать конец пластины, а не её план целиком
  const far = vertErrors(r => { r.roads[1].points[1] = { x: 70, y: 8, z: 0 }; });
  eq(far.filter(e => e.includes('не имеет опоры')).length, 1, `висячий конец среди принятых: ${far.join(' | ')}`);
  assert(far.some(e => e.includes('конечный')), 'бракуется не тот конец: ' + far.join(' | '));
  const noRoof = vertErrors(r => { r.buildings[0].roof.walkable = false; });
  eq(noRoof.filter(e => e.includes('не имеет опоры')).length, 1, `без ходовой кровли обязан браковаться только западный ворот: ${noRoof.join(' | ')}`);
  assert(noRoof.some(e => e.includes('начальный')), 'бракуется не кровля-опора: ' + noRoof.join(' | '));
});

/**
 * План наземной улицы кончается концом пластины, а не выступает за него на
 * полширины: дом, приставленный вровень с торцом, стоит на земле рядом с
 * асфальтом, а не на асфальте. Заодно это чинит 24 ложных «дома в улице» на
 * развёрнутом городе главы 10, где тупики улиц обрамлены кварталами.
 */
t('план дороги — конец пластины: дом вровень с её торцом не «в улице»', () => {
  const level = normalizeLevel(vertLevel());
  const street = vertRoad(level, 'street_0');
  eq(street.decks[0].minX, -70, 'план улицы выступает за её начало');
  eq(street.decks[0].maxX, 70, 'план улицы выступает за её конец');
  const kerb = (minX, maxX) => ({
    id: 'kerb', name: 'Пристройка у торца', floorsCount: 1, floorHeight: 4,
    footprint: [{ x: minX, z: -48 }, { x: maxX, z: -48 }, { x: maxX, z: -40 }, { x: minX, z: -40 }],
    rooms: [{
      id: 'kerb_r0', floor: 0, type: 'utility',
      polygon: [{ x: minX, z: -48 }, { x: maxX, z: -48 }, { x: maxX, z: -40 }, { x: minX, z: -40 }],
    }],
  });
  const flush = vertErrors(r => { r.buildings.push(kerb(70, 78)); })
    .filter(e => e.includes('в улице'));
  eq(flush.length, 0, `дом вровень с торцом улицы бракуется: ${flush.join(' | ')}`);
  const inside = vertErrors(r => { r.buildings.push(kerb(67, 75)); })
    .filter(e => e.includes('в улице'));
  eq(inside.length, 1, `дом, наехавший на торец пластины, не забракован: ${inside.join(' | ')}`);
});

/**
 * Торец перехода опирается в план с допуском `J.skybridgeFit` и симметрично по
 * высоте: главу 10 сборка отвергала на стыке «ровно в ноль» — кровля подиума
 * заканчивается там же, где начинается пластина перехода, и строгое пересечение
 * с габаритом не прощало нулевой нахлёст. Дверь при этом меряется проёмом
 * (`door.rect`), а не точкой портала, вынесенной на 1,4 м за фасад.
 */
t('торец перехода держит кровля вровень; щель больше допуска — опора теряется', () => {
  eq(vertErrors(() => {}).filter(e => e.includes('не имеет опоры')).length, 0,
    'чистый полигон вертикали уже бракуется торцами перехода');
  const gap = vertErrors(r => {
    const pull = p => { if (p.x === -10) p.x = -11; };
    r.buildings[0].footprint.forEach(pull);
    for (const room of r.buildings[0].rooms) room.polygon.forEach(pull);
  });
  const lost = gap.filter(e => e.includes('не имеет опоры'));
  eq(lost.length, 1, `щель в 1 м не стоила перехода опоры: ${gap.join(' | ')}`);
  assert(lost[0].includes('начальный'), `бракуется не западный ворот: ${gap.join(' | ')}`);
});

t('под skybridge опор нет, под мостом — есть; фонари разрешены и там, и там', () => {
  const level = normalizeLevel(vertLevel());
  eq(vertRoad(level, 'sb_podium').pillars.length, 0, 'колонны под переходом');
  assert(vertRoad(level, 'br_0').pillars.length > 0, 'мост остался без опор');
  assert(vertRoad(level, 'sb_podium').lamps.length > 0, 'фонари на переходе пропали');
});

t('парсер вертикали детерминирован: два прогона дают побайтово равный модуль', () => {
  const a = generateModule(vertLevel(), 'src/levels/level-10.json');
  const b = generateModule(vertLevel(), 'src/levels/level-10.json');
  eq(a.code, b.code, 'текст модуля различится');
});

// ---------------------------------------------------------------- CLI и детерминизм

t('парсер детерминирован: два прогона дают побайтово равный модуль', () => {
  const a = generateModule(structuredClone(rawLevel), 'src/levels/level-09.json');
  const b = generateModule(structuredClone(rawLevel), 'src/levels/level-09.json');
  eq(a.code, b.code, 'текст модуля различится');
});

t('закоммиченный level-09.js совпадает с тем, что даёт парсер', () => {
  const committed = readFileSync(resolve(ROOT, 'src/levels/level-09.js'), 'utf8').replace(/\r\n/g, '\n');
  const fresh = generateModule(rawLevel, 'src/levels/level-09.json').code;
  assert(committed === fresh,
    `level-09.js устарел на ${(committed.length - fresh.length)} символов — перезапустите node tools/build-level.mjs src/levels/level-09.json`);
});

// Глава 10 несёт то, чего глава 9 не проверяла: развёрнутый парсером город
// (секция `city`) плюс русло, мосты и авторские доминанты в одном брифе. Здесь
// пайплайн обязан сойтись побайтово И не оставить предупреждений: расхождение
// модуля с парсером значит, что глава в репозитории собрана из другого брифа,
// а предупреждение — что геометрия отдана на откуп обходному пути (пропущенный
// фонарь, бракованный торец перехода), и в браузере её уже не видно.
const LEVEL10_PATH = resolve(ROOT, 'src/levels/level-10.json');

t('закоммиченный level-10.js совпадает с парсером и собран без предупреждений', () => {
  const raw = JSON.parse(readFileSync(LEVEL10_PATH, 'utf8'));
  const fresh = generateModule(raw, 'src/levels/level-10.json');
  eq(fresh.warnings.length, 0, `парсер дал предупреждения: ${fresh.warnings.slice(0, 3).join(' | ')}`);
  const committed = readFileSync(resolve(ROOT, 'src/levels/level-10.js'), 'utf8').replace(/\r\n/g, '\n');
  assert(committed === fresh.code,
    `level-10.js расходится с парсером на ${committed.length - fresh.code.length} символов — перезапустите node tools/build-level.mjs src/levels/level-10.json`);
});

t('модуль главы 10 — валидный ES-модуль с экспортом LEVEL_10', async () => {
  const mod = await import(new URL('../src/levels/level-10.js', import.meta.url).href);
  assert(mod.LEVEL_10?.map?.kind === 'json', 'экспорт LEVEL_10 с kind=json не найден');
  assert(mod.LEVEL_10.gameplay.goal === 'exit', 'цель главы 10 не exit');
  assert(mod.LEVEL_10.map.buildings.length > 200, `домов ${mod.LEVEL_10.map.buildings.length}`);
});

t('модуль главы — валидный ES-модуль с экспортом LEVEL_09', async () => {
  const url = new URL('../src/levels/level-09.js', import.meta.url).href;
  const mod = await import(url);
  assert(mod.LEVEL_09?.map?.kind === 'json', 'экспорт LEVEL_09 с kind=json не найден');
  assert(mod.LEVEL_09.gameplay.goal === 'exit', 'цель главы не exit');
});

t('ошибка валидации не оставляет частичного модуля', () => {
  const raw = structuredClone(rawLevel);
  raw.buildings[0].rooms[0].floor = 9;
  let thrown = null;
  try { generateModule(raw, 'src/levels/level-09.json'); } catch (e) { thrown = e; }
  assert(thrown && thrown.errors.length > 0, 'кривой уровень прошёл');
  assert(!/\bexport const/.test(thrown.message), 'текст модуля попал в сообщение об ошибке');
});

// -------------------------------------------------- заморозка v1 (docs/city-v2-plan.md)

/**
 * Глава 10 и её генератор — v1: права на поворотные дома и кривые настилы у них нет,
 * и поля v2 обязаны отбраковываться здесь, а не молча игнорироваться нормализатором.
 * Иначе побайтовая сверка `level-10.js` перестаёт быть защитой: бриф с `rotation`
 * собрался бы, но собрался бы прямоугольником, и автор косого города получил бы
 * тихую подмену вместо ошибки.
 */
t('v1 заморожен: rotation у дома и elements у дороги — чужие поля для главы 9-10', () => {
  const rot = structuredClone(rawLevel);
  rot.buildings[0].rotation = 30;
  const e1 = validateLevel(rot).errors;
  assert(e1.some(x => /buildings\[0\]\.rotation: поле не описано в схеме/.test(x)),
    `rotation принят v1-схемой: ${e1[0] || 'ошибок нет'}`);

  const el = structuredClone(rawLevel);
  el.roads[0].elements = [{ plate: { x: 0, z: 0, length: 40, width: 12, yaw: 30 } }];
  const e2 = validateLevel(el).errors;
  assert(e2.some(x => /roads\[0\]\.elements: поле не описано в схеме/.test(x)),
    `elements принят v1-схемой: ${e2[0] || 'ошибок нет'}`);

  // кадр косого района — служебное поле генератора: у v1 его быть не может, и
  // схема обязана это назвать, а не пропустить в нормализатор
  const framed = structuredClone(rawLevel);
  framed.buildings[0].districtFrame = { cx: 0, cz: 0, yaw: 18 };
  const e3 = validateLevel(framed).errors;
  assert(e3.some(x => /buildings\[0\]\.districtFrame: поле не описано в схеме/.test(x)),
    `districtFrame принят v1-схемой: ${e3[0] || 'ошибок нет'}`);
});

t('v1 заморожен: relief, yaw района, полигон и профиль улицы — чужие поля для v1', () => {
  const relief = structuredClone(rawLevel);
  relief.relief = { baseY: 0, hills: [{ x: 0, z: 0, radius: 60, height: 8 }] };
  hasError(validateLevel(relief).errors, 'relief', 'поле не описано в схеме');

  // генератор читает `city` раньше схемы, поэтому его молчание опаснее ошибки:
  // район с `yaw` собрался бы осевым, а автор правил бы несуществующее поле
  const cityRaw = JSON.parse(readFileSync(resolve(ROOT, 'src/levels/level-10.json'), 'utf8'));
  const cases = [
    ['yaw', r => { r.city.districts[0].yaw = 18; }],
    ['polygon', r => {
      r.city.districts[0].polygon = [
        { x: -100, z: -100 }, { x: 100, z: -100 }, { x: 100, z: 100 }, { x: -100, z: 100 },
      ];
    }],
    ['grade', r => { r.city.districts[0].street.grade = 0.05; }],
  ];
  for (const [key, mutate] of cases) {
    const raw = structuredClone(cityRaw);
    mutate(raw);
    let thrown = null;
    try {
      expandCity(raw);
    } catch (e) {
      thrown = e;
    }
    assert(thrown && String(thrown.message).includes(key),
      `генератор принял '${key}' молча: район с ним собрался бы осевым и без профиля, а поле пропало бы без ошибки`);
  }
});

t('v1 заморожен: служебные поля metadata не попадают в модуль главы', () => {
  const base = generateModule(structuredClone(rawLevel), 'src/levels/level-09.json').code;
  const withFlag = structuredClone(rawLevel);
  withFlag.metadata.engine = 'city-v1';
  assert(generateModule(withFlag, 'src/levels/level-09.json').code === base,
    'модуль главы изменился от служебной строки метаданных');
});

// ------------------------------------------------------- поворотный дом (v2, этап 2)

/**
 * Компактный бриф v2: один косой корпус 24 × 6 м под 30° в земле 120 м и улица,
 * которая в базовом варианте стоит в стороне. Угол поворачивает план вокруг
 * центра его габарита, поэтому весь внутренний расчёт (стены, комнаты, марши)
 * идёт в локальных осях, а в мир выходят только границы — здесь и проверяется,
 * что наружные тесты смотрят на повёрнутый корпус, а не на его охватывающий
 * прямоугольник.
 */
const V2_RAW = {
  kind: 'json2',
  metadata: { levelName: 'v2House', name: 'Косой квартал', hint: '—', units: 'meters' },
  ground: { y: 0, size: 120 },
  roads: [
    { id: 'st_main', type: 'ground', width: 6, points: [{ x: -50, y: 0.12, z: 26 }, { x: 50, y: 0.12, z: 26 }] },
  ],
  buildings: [{
    id: 'h_slant', isEnterable: false, floorsCount: 2, floorHeight: 3.4, rotation: 30,
    footprint: [{ x: -12, z: -3 }, { x: 12, z: -3 }, { x: 12, z: 3 }, { x: -12, z: 3 }],
    rooms: [],
  }],
  gameplay: { goal: 'exit', spawn: { x: 0, z: 34 }, exit: { x: 40, z: 29 }, exitRadius: 4 },
};

/** Полоса наземной улицы вдоль X (ширина 2 ⇒ z ∈ [7, 9]) на данном участке x. */
const band = (id, x0, x1) => ({
  id, type: 'ground', width: 2,
  points: [{ x: x0, y: 0.12, z: 8 }, { x: x1, y: 0.12, z: 8 }],
});
/** План настила той полосы — так же его считает валидатор и нормализатор. */
const bandRect = b => ({
  minX: b.points[0].x, maxX: b.points[1].x,
  minZ: b.points[0].z - b.width / 2, maxZ: b.points[0].z + b.width / 2,
});
// «дальний» конец косого корпуса реально достаёт до z = 8,6 — сюда полоса легла бы
// на фасад, а тот же участок её на противоположном конце охвата пуст: дом смотрит углом
const BAND_ON = band('st_on', 6, 14);
const BAND_CORNER = band('st_corner', -14, -8);
/** План дома из V2_RAW (24 × 6 м) в его локальных осях, центр в (0, 0). */
const SLANT_RECT = { minX: -12, maxX: 12, minZ: -3, maxZ: 3 };

const v2Errors = (mutate = () => {}) => {
  const raw = structuredClone(V2_RAW);
  mutate(raw);
  return validateLevel(raw, LEVEL_SPEC_V2).errors;
};

t('v2 принимает rotation: валидатор молчит, а модуль несёт угол и kind', () => {
  const errors = v2Errors();
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  const level = normalizeLevel(structuredClone(V2_RAW));
  eq(level.map.kind, 'json2', 'kind карты');
  eq(level.map.buildings[0].rotation, 30, 'rotation в данных карты');
  // план, стены и комнаты остаются неразвёрнутыми: угол — единственная новая запись
  eq(level.map.buildings[0].bounds.maxX, 12, 'габарит дома остался локальным');
  const code = generateModule(structuredClone(V2_RAW), 'src/levels/level-11.json').code;
  assert(code.includes(`kind: 'json2'`), 'в шапке модуля не стало видно типа карты json2');
  assert(code.includes('"rotation": 30'), 'модуль главы не донёс угол дома');
  assert(/Поворотные дома/.test(code), 'шапка модуля v2 не объясняет, что поворачивается');
});

t('v1 не принимает ни kind json2, ни сам бриф v2', () => {
  const errors = validateLevel(structuredClone(V2_RAW)).errors;
  hasError(errors, 'kind', 'поле не описано в схеме');
});

t('косой дом, доставший углом до улицы, — ошибка; тот же план без поворота — норма', () => {
  hasError(v2Errors(r => { r.roads.push(BAND_ON); }), 'дом стоит в улице');
  const flat = v2Errors(r => { r.buildings[0].rotation = 0; r.roads.push(BAND_ON); });
  eq(flat.length, 0, `плоский дом в той же полосе дал ошибки: ${flat.join(' | ')}`);
});

t('охватывающий прямоугольник косого дома не бракует улицу в его пустом углу', () => {
  // довод, что тест выше не случайность: габарит повёрнутого плана в эту полосу
  // действительно заходит, а сам корпус — нет
  const f = frameOf(SLANT_RECT, 30);
  assert(rectsIntersect(rotatedBounds(SLANT_RECT, f), bandRect(BAND_CORNER), 0.05),
    'габарит косого дома не пересекает полосу — тест ничего не доказывает');
  assert(!obbHitsRect(obbOf(SLANT_RECT, f), bandRect(BAND_CORNER), 0.05),
    'корпус реально пересекает полосу — проверка стала бы бессмысленной');
  const errors = v2Errors(r => { r.roads.push(BAND_CORNER); });
  eq(errors.length, 0, `дом под углом отбракован по габариту: ${errors.join(' | ')}`);
});

t('поворот выбрасывает дом за землю, хотя его план целиком внутри', () => {
  const shift = r => {
    r.buildings[0].footprint = [{ x: -12, z: 53 }, { x: 12, z: 53 }, { x: 12, z: 59 }, { x: -12, z: 59 }];
  };
  const flat = v2Errors(r => { shift(r); r.buildings[0].rotation = 0; });
  eq(flat.length, 0, `план без поворота дал ошибки: ${flat.join(' | ')}`);
  // ez = 12·sin30° + 3·cos30° ≈ 8,6 ⇒ верх повёрнутого корпуса на 64,6 м при земле 120 м
  hasError(v2Errors(shift), 'выходит за землю');
});

t('пересечение планов разрешено только соосной паре домов', () => {
  const twin = rot => r => {
    r.buildings.push({
      id: 'h_twin', isEnterable: false, floorsCount: 2, floorHeight: 3.4, rotation: rot,
      footprint: [{ x: -12, z: 1 }, { x: 12, z: 1 }, { x: 12, z: 7 }, { x: -12, z: 7 }],
      rooms: [],
    });
  };
  const same = v2Errors(twin(30));
  eq(same.length, 0, `соосная пара домов дала ошибки: ${same.join(' | ')}`);
  hasError(v2Errors(twin(90)), 'h_slant', 'h_twin', 'разных rotation');
});

t('торец перехода не опирается на косой дом', () => {
  const bridge = r => {
    r.buildings[0].footprint = [{ x: -2, z: -4 }, { x: 10, z: -4 }, { x: 10, z: 4 }, { x: -2, z: 4 }];
    r.buildings[0].floorsCount = 1;
    r.buildings[0].roof = { walkable: true };
    r.buildings.push({
      id: 'h_far', isEnterable: false, floorsCount: 1, floorHeight: 3.4, roof: { walkable: true },
      footprint: [{ x: 26, z: -4 }, { x: 38, z: -4 }, { x: 38, z: 4 }, { x: 26, z: 4 }],
      rooms: [],
    });
    r.roads.push({ id: 'br_1', type: 'skybridge', width: 4, points: [{ x: -2, y: 3.4, z: 0 }, { x: 30, y: 3.4, z: 0 }] });
  };
  const flat = v2Errors(r => { bridge(r); r.buildings[0].rotation = 0; });
  eq(flat.length, 0, `переход между соосными домами дал ошибки: ${flat.join(' | ')}`);
  hasError(v2Errors(r => { bridge(r); r.buildings[0].rotation = 15; }), 'br_1', 'начальный', 'не имеет опоры');
});

t('автогенерация видит косой дом его планом, а не габаритом', () => {
  const raw = structuredClone(V2_RAW);
  // подиум: отметка опоры под предметом тогда различима (пол дома 1 м против земли 0)
  raw.buildings[0].baseY = 1;
  raw.landscapeObjects = [
    { id: 'in_body', model: 'container', position: { x: 9, y: 1, z: 7.2 } },
    { id: 'in_corner', model: 'container', position: { x: -11, y: 0, z: 8 } },
  ];
  const { errors } = validateLevel(raw, LEVEL_SPEC_V2);
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  const level = normalizeLevel(raw);
  const body = level.map.props.find(p => p.id === 'in_body');
  const corner = level.map.props.find(p => p.id === 'in_corner');
  assert(level.warnings.some(w => w.includes('in_body') && w.includes('внутри плана h_slant')),
    `предмет в корпусе не отмечен: ${level.warnings.join(' | ') || '(предупреждений нет)'}`);
  assert(!level.warnings.some(w => w.includes('in_corner')),
    `пустой угол габарита косого дома был принят за дом: ${level.warnings.join(' | ')}`);
  eq(corner.position.y, 0, 'предмет в пустом углу габарита встал на отметку дома');
  eq(body.position.y, 1, 'предмет на грунте у угла корпуса не встал на пол дома');
});

// ------------------------------------------------------- прямые настилы (v2, этап 3)

/**
 * Дорога из пластин: у каждой свой центр, длина, ширина и угол к северу. Проверки
 * здесь держат два свойства, на которых стоит и валидатор, и нормализатор:
 * план считается по осям полотна, а не по габариту, и весь автоген (опоры,
 * фонари, опора предмета) ставится в этих же осях.
 */
const plateRoad = (id, plate, extra = {}) => ({ id, type: 'ground', ...extra, elements: [{ plate }] });
const v2Raw = mutate => {
  const raw = structuredClone(V2_RAW);
  mutate(raw);
  return raw;
};

t('v2: косая пластина настила принимается и доносит до модуля yaw, obb и размеры', () => {
  const raw = v2Raw(r => {
    r.roads = [plateRoad('st_yaw', { x: 0, z: 10, yaw: 30, length: 40, width: 6, y: 0.12 })];
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял косую пластину');
  const level = normalizeLevel(raw);
  const d = level.map.roads[0].decks[0];
  eq(d.yaw, 30, 'yaw пластины');
  eq(d.length, 40, 'длина');
  eq(d.width, 6, 'ширина');
  eq(d.cx, 0, 'центр x');
  eq(d.cz, 10, 'центр z');
  assert(d.obb && Math.abs(d.obb.hx - 20) < 1e-9 && Math.abs(d.obb.hz - 3) < 1e-9,
    'obb не той полуоси');
  // габарит повёрнутой пластины — AABB: он шире полотна, и держать по нему ногу
  // или ставить точку B нельзя
  assert(Math.abs(d.maxX - (20 * Math.cos(Math.PI / 6) + 3 * Math.sin(Math.PI / 6))) < 0.01,
    `габарит по X: ${d.maxX}`);
  assert(Math.abs(d.maxZ - (10 + 20 * Math.sin(Math.PI / 6) + 3 * Math.cos(Math.PI / 6))) < 0.01,
    `габарит по Z: ${d.maxZ}`);
  assert(d.maxX > d.width / 2 + 1, 'габарит не шире самой пластины');
  const code = generateModule(raw, 'src/levels/level-11.json').code;
  assert(code.includes('"yaw": 30'), 'модуль главы не донёс угол пластины');
  assert(code.includes('"obb"'), 'модуль главы не донёс OBB пластины');
});

/**
 * Перила прямых настилов — тот же флаг, что у дуги: движок по нему строит
 * стенку-призму по кромкам, и терять его в нормализаторе нельзя.
 */
t('v2: флаг перил доходит до модуля и у пластины, а без записи его нет', () => {
  const deck = rails => normalizeLevel(v2Raw(r => {
    r.roads = [plateRoad('st_rails',
      { x: 0, z: 10, yaw: 30, length: 40, width: 6, y: 0.12, ...(rails ? { rails: true } : {}) })];
  })).map.roads[0].decks[0];
  eq(validateLevel(v2Raw(r => {
    r.roads = [plateRoad('st_rails', { x: 0, z: 10, yaw: 30, length: 40, width: 6, y: 0.12, rails: true })];
  }), LEVEL_SPEC_V2).errors.length, 0, 'схема отбраковала пластину с перилами');
  eq(deck(true).rails, true, 'перила пластины не дошли до модуля');
  eq(deck(false).rails, false, 'у пластины без записи появились перила');
});

t('v2: пластина круче maxSlope — ошибка, перепад в пределах — норма', () => {
  const steep = v2Raw(r => {
    r.roads = [plateRoad('st_ramp', { x: 0, z: 10, yaw: 30, length: 10, width: 6, y: 0.12, rise: 5 })];
  });
  hasError(validateLevel(steep, LEVEL_SPEC_V2).errors, 'st_ramp', 'уклон');
  const ok = v2Raw(r => {
    r.roads = [plateRoad('st_ramp', { x: 0, z: 10, yaw: 30, length: 20, width: 6, y: 0.12, rise: 3 })];
  });
  eq(validateLevel(ok, LEVEL_SPEC_V2).errors.length, 0, 'пологий косой уклон отбракован');
});

t('габарит косой улицы не бракует дом в своём пустом углу', () => {
  const plate = { x: 0, z: 30, yaw: 45, length: 60, width: 6, y: 0.12 };
  const houseRect = { minX: 16, maxX: 24, minZ: 16, maxZ: 24 };
  // довод, что тест не пустой: габарит пластины в дом заходит, а само полотно —
  // нет, потому что дом стоит в углу его AABB
  const f = frameAt(plate.x, plate.z, plate.yaw);
  const local = {
    minX: plate.x - plate.length / 2, maxX: plate.x + plate.length / 2,
    minZ: plate.z - plate.width / 2, maxZ: plate.z + plate.width / 2,
  };
  assert(rectsIntersect(rotatedBounds(local, f), houseRect, 0.05),
    'габарит косой улицы не заходит в дом — тест ничего не доказывает');
  assert(!obbHitsObb(obbOf(local, f), houseRect, 0.05),
    'полотно реально пересекает дом — проверка стала бы бессмысленной');
  const raw = v2Raw(r => {
    r.roads = [plateRoad('st_diag', plate)];
    r.buildings = [{
      id: 'h_corner', isEnterable: false, floorsCount: 2, floorHeight: 3.4,
      footprint: [{ x: 16, z: 16 }, { x: 24, z: 16 }, { x: 24, z: 24 }, { x: 16, z: 24 }],
      rooms: [],
    }];
  });
  const errors = validateLevel(raw, LEVEL_SPEC_V2).errors;
  eq(errors.length, 0, `дом в пустом углу габарита отбракован: ${errors.join(' | ')}`);
});

t('v2: elements и points не совмещаются; насыпь и переход из пластин не поддержаны', () => {
  const both = v2Raw(r => {
    r.roads[0].elements = [{ plate: { x: 0, z: 10, yaw: 0, length: 20, width: 6, y: 0.12 } }];
  });
  hasError(validateLevel(both, LEVEL_SPEC_V2).errors, 'points и elements одновременно');
  for (const type of ['embankment', 'skybridge']) {
    const raw = v2Raw(r => {
      r.roads = [{
        id: `r_${type}`, type,
        elements: [{ plate: { x: 0, z: 10, yaw: 0, length: 20, width: 6, y: 6 } }],
      }];
    });
    hasError(validateLevel(raw, LEVEL_SPEC_V2).errors, type, 'не поддержан');
  }
});

t('поворот выбрасывает пластину за землю, хотя неразвёрнутая помещается', () => {
  const plate = yaw => v2Raw(r => {
    r.roads = [plateRoad('st_edge', { x: 48, z: 48, yaw, length: 20, width: 20, y: 0.12 })];
  });
  eq(validateLevel(plate(0), LEVEL_SPEC_V2).errors.length, 0,
    'неразвёрнутая пластина 20 × 20 в (48, 48) не поместилась в землю 120 м');
  // ex = 10·cos45° + 10·sin45° ≈ 14,14 ⇒ дальний край на 62,1 м при половине земли 60
  hasError(validateLevel(plate(45), LEVEL_SPEC_V2).errors, 'st_edge', 'выходит за землю');
});

t('опоры косой эстакады стоят вдоль полотна и повёрнуты с ним', () => {
  const raw = v2Raw(r => {
    r.roads = [{
      id: 'br_yaw', type: 'bridge',
      elements: [{ plate: { x: 0, z: 45, yaw: 30, length: 40, width: 8, y: 6 } }],
    }];
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял косую эстакаду');
  const level = normalizeLevel(raw);
  const pillars = level.map.props.filter(p => p.model === 'concrete_pillar');
  // J.pillarSpacing = 12 ⇒ t ∈ {−14, −2, 10}; два ряда на ширине 8 (отступ 2,8 м)
  eq(pillars.length, 6, `опор ${pillars.length}, ожидалось 6`);
  const f = frameAt(0, 45, 30);
  for (const p of pillars) {
    const l = unrotatePoint(f, p.position.x, p.position.z);
    assert(Math.abs(l.x) <= 20.001,
      `опора вышла за торец полотна: локальное u = ${l.x}`);
    assert(Math.abs(Math.abs(l.z - 45) - 2.8) < 2e-3,
      `опора не на борту полотна: поперёк ${l.z - 45}`);
    eq(p.rotationY, -30, 'опора не повёрнута с полотном');
  }
});

/**
 * Наклонная пластина v2 держится колоннами: подъём на 12 м ничем, кроме них, не
 * держится, а `bottomY` такой пластины — самый низкий срез (у съезда главы 11 это
 * −0,48 м), поэтому де́ковый гейт «колонна короче метра» отрезал бы весь подъём.
 * Низ каждой опоры — соffit наклонной плоскости в её собственной точке.
 */
t('v2: наклонная пластина держит опоры, и низ каждой — соffit в своей точке', () => {
  const plate = { x: 0, z: 45, yaw: 0, length: 48, width: 8, y: 0.12, rise: 12 };
  const raw = v2Raw(r => {
    r.roads = [{ id: 'br_ramp', type: 'bridge', elements: [{ plate }] }];
    r.gameplay.exit = { x: 0, z: 45 };
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял наклонную пластину');
  const level = normalizeLevel(raw);
  eq(level.warnings.length, 0, `предупреждения: ${level.warnings.join(' | ')}`);
  const pillars = level.map.props.filter(p => p.model === 'concrete_pillar');
  // u ∈ [−24, 24], шаг 12 ⇒ линии −18, −6, 6, 18 и два ряда (отступ 2,8 м). У линии
  // −18 низ полотна 1,02 м — гейт её ещё пропускает, ближе к земле опоры не будет
  eq(pillars.length, 8, `опор ${pillars.length}, ожидалось 8`);
  const lo = plate.x - plate.length / 2;
  const topAt = x => plate.y + plate.rise * (x - lo) / plate.length;
  const rows = new Map();
  for (const p of pillars) {
    eq(p.position.y, 0, 'пятка опоры не на грунте');
    assert(Math.abs(p.position.y + p.scale.y + J.deckThickness - topAt(p.position.x)) < 2e-3,
      `опора на u=${p.position.x}: высота ${p.scale.y}, а соffit ${(topAt(p.position.x) - J.deckThickness).toFixed(2)}`);
    assert(Math.abs(Math.abs(p.position.z - plate.z) - 2.8) < 2e-3, `опора не на борту: z=${p.position.z}`);
    rows.set(p.position.x, Math.max(rows.get(p.position.x) ?? 0, p.scale.y));
  }
  const us = [...rows.keys()].sort((a, b) => a - b);
  eq(us.length, 4, `линий опор ${us.length}, ожидалось 4`);
  for (let i = 1; i < us.length; i++) {
    assert(rows.get(us[i]) > rows.get(us[i - 1]), `высоты не растут вдоль подъёма: ${us[i - 1]} → ${us[i]}`);
  }
  // линия, у которой полотно уже легло на грунт, опоры не получает: колонну
  // короче метра не видно, и она не держит ничего
  eq(us[0], -18, 'первая линия опор не там, где низ полотна выше гейта');
  assert(topAt(-24) - J.deckThickness <= 1.0, 'у торца подъёма полотно уже выше метра над землёй');
});

/**
 * Съезд перекрывает улицу: колонна в её плане — не ошибка автора, а свойство
 * перекрёстка, поэтому она не ставится и молчит (правило предупреждения остаётся
 * для плоского настила, где асфальт под колонной значит, что автор положил
 * настил на улицу).
 */
t('v2: опора наклонного схода в план наземной улицы пропускается молча', () => {
  const plate = { x: 0, z: 8, yaw: 0, length: 48, width: 8, y: 0.12, rise: 12 };
  const raw = v2Raw(r => {
    r.buildings = [];
    r.roads = [
      { id: 'br_ramp', type: 'bridge', elements: [{ plate }] },
      { id: 'st_band', type: 'ground', width: 8, points: [{ x: -14, y: 0.12, z: 8 }, { x: 14, y: 0.12, z: 8 }] },
    ];
    r.gameplay.exit = { x: 0, z: 8 };
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял съезд над улицей');
  const level = normalizeLevel(raw);
  eq(level.warnings.length, 0, `сход заговорил: ${level.warnings.join(' | ')}`);
  const pillars = level.map.props.filter(p => p.model === 'concrete_pillar');
  // улицы перекрывают линии −6 и 6 (обе их кромки в плане полосы z 4…12), −18 и 18
  // остаются за её торцами
  eq(pillars.length, 4, `опор ${pillars.length}, ожидалось 4 (две линии вне плана улицы)`);
  for (const p of pillars) {
    assert(Math.abs(p.position.x) > 14 - J.pillarSection / 2,
      `опора ${p.id} всё-таки в плане улицы: x=${p.position.x}`);
  }
});

t('фонари косой улицы стоят на её бортах и повёрнуты с полотном', () => {
  const raw = v2Raw(r => {
    r.roads = [plateRoad('st_lamps',
      { x: 0, z: 40, yaw: 30, length: 40, width: 6, y: 0.12 }, { width: 6, lamps: true })];
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял улицу с фонарями');
  const level = normalizeLevel(raw);
  const lamps = level.map.props.filter(p => p.model === 'lamp_post');
  // J.lampSpacing = 20 ⇒ t ∈ {−10, 10}, по обе стороны на ширину/2 + 1,4 м
  eq(lamps.length, 4, `фонарей ${lamps.length}, ожидалось 4`);
  const f = frameAt(0, 40, 30);
  for (const l of lamps) {
    const p = unrotatePoint(f, l.position.x, l.position.z);
    assert(Math.abs(Math.abs(p.z - 40) - 4.4) < 2e-3, 'фонарь не на борту полотна');
    assert(Math.abs(p.x) <= 20.001, 'фонарь за торцом полотна');
    eq(l.rotationY, -30, 'фонарь не повёрнут с полотном');
  }
});

t('предмет на косом уклоне встаёт на плоскость полотна, а за торцом — на грунт', () => {
  const f = frameAt(20, 40, 30);
  // верх полотна 0,5 м на u = 0 и 6,5 м на u = 40 (уклон 0,15); предмет на
  // u = 30 обязан встать на 0,5 + 6·30/40 = 5,0, а тот же участок за торцом
  // (u = 45) держит только земля
  const on = rotatePoint(f, 30, 41);
  const off = rotatePoint(f, 45, 40);
  const raw = v2Raw(r => {
    r.roads = [plateRoad('st_ramp',
      { x: 20, z: 40, yaw: 30, length: 40, width: 6, y: 0.5, rise: 6 })];
    r.landscapeObjects = [
      { id: 'on_deck', model: 'container', position: { x: on.x, y: 5, z: on.z } },
      { id: 'off_end', model: 'container', position: { x: off.x, y: 0, z: off.z } },
    ];
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял предметы у уклона');
  const level = normalizeLevel(raw);
  const onDeck = level.map.props.find(p => p.id === 'on_deck');
  assert(Math.abs(onDeck.position.y - 5) < 1e-6,
    `предмет на уклоне встал на ${onDeck.position.y}, а не на 5`);
  const offEnd = level.map.props.find(p => p.id === 'off_end');
  eq(offEnd.position.y, 0, 'предмет за торцом удержан габаритом пластины');
});

// ------------------------------------------------------- дуги полотна (v2, этап 4)

/**
 * Дуга — кольцевой сектор с продольным уклоном и поперечным креном. Проверки
 * держат три свойства, на которых стоит вся развязка: углы живут в градусах, как
 * `yaw` пластины; верх над точкой — функция угла и радиуса, а не AABB; опора
 * предмета и точка B видят сектор, а не его пустой угол.
 */
const arcRoad = (id, arc, extra = {}) => ({ id, type: 'ground', ...extra, elements: [{ arc }] });
const ARC = {
  cx: 0, cz: 0, radius: 40, from: 0, to: 215,
  width: 8, y: [0.12, 12], bank: 6, rails: true,
};
/** Точка сектора в мире по независимой арифметике теста. */
const arcPoint = (arc, deg, rho = arc.radius) => ({
  x: arc.cx + Math.cos(deg * Math.PI / 180) * rho,
  z: arc.cz + Math.sin(deg * Math.PI / 180) * rho,
});
/**
 * Переходный угол крена (градусы): своя арифметика — два предела, уклон края в
 * `maxSlope` и монотонный гребень (раскрутка крена не круче подъёма оси).
 * Крен берётся округлённым, как его пишет парсер (`r3` до деления на радиус):
 * иначе проверка меряет расхождение округления, а не формулы.
 */
const arcTrans = (arc) => {
  const D = Math.PI / 180;
  const tanBank = Math.round(Math.tan((arc.bank ?? 0) * D) * 1000) / 1000;
  const bankLen = Math.abs(tanBank) * arc.width / 2;
  if (!bankLen) return 0;
  const len = arc.radius * Math.abs((arc.to - arc.from) * D);
  const slope = len > 0 ? Math.abs(arc.y[1] - arc.y[0]) / len : 0;
  const spare = Math.max(J.maxSlope - slope, J.maxSlope * 0.25);
  const rate = slope > 0 ? Math.min(spare, slope) : spare;
  const trans = ((Math.PI / 2) * bankLen / rate / arc.radius) / D;
  return Math.min(trans, 0.4 * Math.abs(arc.to - arc.from));
};
/** Доля авторского крена на угле `deg`: у обоих торцов ноль, в середине — 1. */
const arcBankFrac = (arc, deg) => {
  const tr = arcTrans(arc);
  if (!tr) return 1;
  const e = Math.min(Math.abs(deg - arc.from), Math.abs(arc.to - deg));
  return e >= tr ? 1 : (1 - Math.cos(Math.PI * e / tr)) / 2;
};
/** Верх полотна на угле `deg` и радиусе `rho` (уклон по длине дуги + переходный крен). */
const arcTop = (arc, deg, rho = arc.radius) => {
  const t = (deg - arc.from) / (arc.to - arc.from);
  return arc.y[0] + (arc.y[1] - arc.y[0]) * t
    + Math.tan((arc.bank ?? 0) * Math.PI / 180) * arcBankFrac(arc, deg) * (rho - arc.radius);
};
const arcExit = arc => arcPoint(arc, arc.from + (arc.to - arc.from) * 0.5);

t('v2: дуга настила принимается и доносит до модуля сектор, уклон и крен', () => {
  const raw = v2Raw(r => {
    r.roads = [arcRoad('rp_arc', ARC, { type: 'bridge' })];
    r.gameplay.exit = arcExit(ARC);
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял дугу');
  const level = normalizeLevel(raw);
  const d = level.map.roads[0].decks[0];
  eq(d.arc, true, 'дуга не помечена в данных карты');
  eq(d.R, 40, 'радиус');
  eq(d.halfW, 4, 'полуширина');
  eq(d.a0, 0, 'начальный угол');
  eq(d.a1, 215, 'конечный угол');
  eq(d.span, 215, 'размах');
  eq(d.y0, 0.12, 'верх в начале');
  eq(d.y1, 12, 'верх в конце');
  eq(d.rails, true, 'перила');
  assert(Math.abs(d.tanBank - Math.tan(6 * Math.PI / 180)) < 1e-3, `крен ${d.tanBank}`);
  assert(Math.abs(d.bankTrans - arcTrans(ARC)) < 2e-3, `переходный угол ${d.bankTrans}° вместо ${arcTrans(ARC).toFixed(3)}°`);
  // отметки дуги — торцы (срезы) без крена: гребень середины не смеет завышать мост
  eq(d.topAtMin, 0.12, 'отметка начала с гребнем крена');
  eq(d.topAtMax, 12, 'отметка конца с гребнем крена');
  // AABB — только фильтр: он шире сектора и не смеет решать, где полотно
  assert(Math.abs(d.maxX - 44) < 1e-6 && Math.abs(d.minX + 44) < 1e-6, `габарит по X: ${d.minX}…${d.maxX}`);
  assert(d.maxZ > 40 && d.minZ < -20, `габарит по Z не покрывает дугу: ${d.minZ}…${d.maxZ}`);
  const code = generateModule(raw, 'src/levels/level-11.json').code;
  assert(code.includes('"arc": true'), 'модуль главы не донёс дугу');
  assert(code.includes('"span": 215'), 'модуль главы не донёс размах дуги');
});

t('v2: крутая дуга, нулевой размах и выворот через центр — ошибки', () => {
  const steep = v2Raw(r => {
    r.roads = [arcRoad('rp_steep', { ...ARC, from: 0, to: 90, y: [0.12, 30] }, { type: 'bridge' })];
    r.gameplay.exit = arcPoint({ ...ARC, from: 0, to: 90 }, 45);
  });
  hasError(validateLevel(steep, LEVEL_SPEC_V2).errors, 'rp_steep', 'уклон дуги');
  // тот же размах с подъёмом 12 м на ~150 м дуги — норма
  const ok = v2Raw(r => {
    r.roads = [arcRoad('rp_ok', ARC, { type: 'bridge' })];
    r.gameplay.exit = arcExit(ARC);
  });
  eq(validateLevel(ok, LEVEL_SPEC_V2).errors.length, 0, 'пологий подъём дуги отбракован');
  for (const [name, arc] of [
    ['нулевой', { ...ARC, from: 30, to: 30 }],
    ['сверх 360°', { ...ARC, from: -360, to: 360 }],
    ['выворот', { ...ARC, radius: 3, width: 8 }],
  ]) {
    const raw = v2Raw(r => {
      r.roads = [arcRoad('rp_bad', arc, { type: 'bridge' })];
      r.gameplay.exit = { x: 0, z: 34 };
    });
    const errors = validateLevel(raw, LEVEL_SPEC_V2).errors;
    assert(errors.length > 0, `дуга (${name}) прошла валидатор`);
  }
});

t('v2: дуга не смешивается с пластиной в элементе и не выходит за землю', () => {
  const both = v2Raw(r => {
    r.roads = [{
      id: 'rp_both', type: 'bridge',
      elements: [{ plate: { x: 0, z: 10, length: 20, width: 6, y: 6 }, arc: ARC }],
    }];
    r.gameplay.exit = arcExit(ARC);
  });
  hasError(validateLevel(both, LEVEL_SPEC_V2).errors, 'plate и arc одновременно');
  const neither = v2Raw(r => {
    r.roads = [{ id: 'rp_none', type: 'ground', elements: [{}] }];
  });
  hasError(validateLevel(neither, LEVEL_SPEC_V2).errors, 'без plate или arc');
  // дуга целиком внутри земли 120 м, но её сектор 0…90° от cx = 30 уходит на 70
  const out = v2Raw(r => {
    r.roads = [arcRoad('rp_out', { ...ARC, cx: 30, from: 0, to: 90 }, { type: 'bridge' })];
    r.gameplay.exit = { x: 0, z: 34 };
  });
  hasError(validateLevel(out, LEVEL_SPEC_V2).errors, 'rp_out', 'выходит за землю');
});

t('предмет на дуге встаёт на её плоскость с креном, а вне развёртки — на грунт', () => {
  const arc = { ...ARC, from: 0, to: 90, y: [0.12, 6] };
  const on = arcPoint(arc, 45, 38);
  const off = arcPoint(arc, 120, 40);
  const top = arcTop(arc, 45, 38);
  const raw = v2Raw(r => {
    r.roads = [arcRoad('rp_props', arc)];
    // дом из фикстуры стоит в центре кольца, а его план попал бы в AABB сектора:
    // проверка «дом в улице» консервативна по габариту, и предметный тест к ней
    // отношения не имеет
    r.buildings = [];
    r.landscapeObjects = [
      { id: 'on_arc', model: 'container', position: { x: on.x, y: Number(top.toFixed(3)), z: on.z } },
      { id: 'off_arc', model: 'container', position: { x: off.x, y: 0, z: off.z } },
    ];
    r.gameplay.exit = arcExit(arc);
  });
  const { errors } = validateLevel(raw, LEVEL_SPEC_V2);
  eq(errors.length, 0, `валидатор не принял предметы на дуге: ${errors.join(' | ')}`);
  const level = normalizeLevel(raw);
  const onArc = level.map.props.find(p => p.id === 'on_arc');
  const offArc = level.map.props.find(p => p.id === 'off_arc');
  assert(Math.abs(onArc.position.y - top) < 1e-2,
    `предмет на дуге встал на ${onArc.position.y}, а не на ${top.toFixed(3)}`);
  eq(offArc.position.y, 0, 'предмет вне развёртки удержан габаритом сектора');
  assert(!level.warnings.some(w => w.includes('on_arc')),
    `верный предмет на дуге отмечен: ${level.warnings.join(' | ')}`);
});

/**
 * Крен — функция угла, а не константа секции: у обоих торцов он ноль, поэтому
 * срез ленты горизонтален и примыкающий прямой настил касается полотна по всей
 * ширине, а не по диагонали (замер прежней сборки — 0,84 м перепада на 8 м).
 * Проверяются оба предела, из которых считается переход: край полотна едет и по
 * подъёму, и по раскрутке крена сразу, поэтому его суммарный уклон обязан остаться
 * в `J.maxSlope`, а гребень кромки обязан заключаться между отметками торцов —
 * к срезу приходить снизу и не зарываться в грунт у схода.
 */
t('v2: крен дуги сходит к нулю на торцах: край полотна в maxSlope и приходит к стыку снизу', () => {
  const raw = v2Raw(r => {
    r.buildings = [];
    r.roads = [arcRoad('rp_bank', ARC)];
    // у самого торца угол `atan2` может выйти за развёртку на последнюю двойку,
    // а предмет обязан стоять внутри сектора — берём 0,02° от края
    const onEnd = arcPoint(ARC, ARC.to - 0.02, ARC.radius + ARC.width / 2 - 0.05);
    const onMid = arcPoint(ARC, ARC.from + (ARC.to - ARC.from) / 2, ARC.radius + ARC.width / 2 - 0.05);
    r.landscapeObjects = [
      { id: 'edge_end', model: 'container', position: { x: onEnd.x, y: 0, z: onEnd.z } },
      { id: 'edge_mid', model: 'container', position: { x: onMid.x, y: 0, z: onMid.z } },
    ];
    r.gameplay.exit = arcExit(ARC);
  });
  const { errors } = validateLevel(raw, LEVEL_SPEC_V2);
  eq(errors.length, 0, `валидатор не принял креновую дугу: ${errors.join(' | ')}`);
  const level = normalizeLevel(raw);
  const bad = [];
  // торец: оба края полотна на отметке оси — линия стыка с прямым настилом горизонтальна
  for (const [deg, y] of [[ARC.from, ARC.y[0]], [ARC.to, ARC.y[1]]]) {
    for (const rho of [ARC.radius - ARC.width / 2, ARC.radius + ARC.width / 2]) {
      const top = arcTop(ARC, deg, rho);
      if (Math.abs(top - y) > 1e-9) bad.push(`край среза ${deg}° на ${top.toFixed(3)} вместо ${y}`);
    }
  }
  // середина: полный крен на месте — внешний край выше внутреннего на tan(bank)·ширину
  const mid = ARC.from + (ARC.to - ARC.from) / 2;
  const across = arcTop(ARC, mid, ARC.radius + ARC.width / 2) - arcTop(ARC, mid, ARC.radius - ARC.width / 2);
  const wantAcross = Math.tan(ARC.bank * Math.PI / 180) * ARC.width;
  if (Math.abs(across - wantAcross) > 1e-6) {
    bad.push(`крен поперёк полотна ${across.toFixed(3)} вместо ${wantAcross.toFixed(3)}`);
  }
  // предмет у торца встаёт на отметку оси (постоянный крен поднимал бы его на
  // `tan(bank) · halfW` = 0,42 м выше стыкуемого настила), а в середине — на край
  // с полным креном
  const edgeRho = ARC.radius + ARC.width / 2 - 0.05;
  const end = level.map.props.find(p => p.id === 'edge_end');
  const middle = level.map.props.find(p => p.id === 'edge_mid');
  if (Math.abs(end.position.y - ARC.y[1]) > 0.02) {
    bad.push(`у торца предмет на ${end.position.y}, а не на отметке оси ${ARC.y[1]}`);
  }
  const wantMid = arcTop(ARC, mid, edgeRho);
  if (Math.abs(middle.position.y - wantMid) > 1e-2) {
    bad.push(`в середине предмет на ${middle.position.y}, а не на ${wantMid.toFixed(3)}`);
  }
  // суммарный уклон внешнего края: подъём оси плюс максимум производной крена
  const len = ARC.radius * Math.abs(ARC.to - ARC.from) * Math.PI / 180;
  const degAt = s => ARC.from + (ARC.to - ARC.from) * (s / len);
  const edgeAt = s => arcTop(ARC, degAt(s), ARC.radius + ARC.width / 2);
  const innerAt = s => arcTop(ARC, degAt(s), ARC.radius - ARC.width / 2);
  const h = 0.02;
  let worst = 0;
  for (let s = h; s < len - h; s += h) worst = Math.max(worst, (edgeAt(s + h) - edgeAt(s - h)) / (2 * h));
  if (worst > J.maxSlope + 2e-3) bad.push(`уклон края полотна ${worst.toFixed(3)} м/м круче ${J.maxSlope}`);
  // гребень кромки заключён между отметками торцов: к срезу он приходит снизу, а
  // у схода не зарывается в грунт (короткий переход только по maxSlope поднимал
  // внешний край на 0,202 м выше моста и ронял внутренний на 0,053 м ниже земли)
  const lo = Math.min(ARC.y[0], ARC.y[1]), hi = Math.max(ARC.y[0], ARC.y[1]);
  for (const [name, at] of [['внешний', edgeAt], ['внутренний', innerAt]]) {
    let over = 0, under = 0;
    for (let s = 0; s <= len; s += len / 2000) {
      const cur = at(s);
      over = Math.max(over, cur - hi);
      under = Math.max(under, lo - cur);
    }
    if (over > 1e-6) bad.push(`${name} край полотна переваливает через отметку среза на ${over.toFixed(3)} м`);
    if (under > 1e-6) bad.push(`${name} край полотна уходит ниже отметки схода на ${under.toFixed(3)} м`);
  }
  eq(bad.length, 0, bad.slice(0, 3).join(' | '));
});

// ------------------------------------------------------ развязка (v2, этап 6)

/**
 * `connect: 'tangent'` не несёт угла сам: он велит следующей пластине принять
 * касательную предыдущего элемента. Проверяется оба направления обхода — у дуги,
 * развёрнутой назад, касательная смотрит противоположно, — и то, что позицию
 * автор задаёт сам: парсер доводит только угол (G1 по направлению).
 */
t("v2: connect:'tangent' даёт пластине касательную дуги в обоих направлениях обхода", () => {
  const fwd = { ...ARC, from: 0, to: 90, y: [6, 6], bank: 0 };
  const rev = { ...ARC, from: 90, to: 0, y: [6, 6], bank: 0 };
  const end = arcPoint(fwd, 90), start = arcPoint(rev, 0);
  const raw = v2Raw(r => {
    r.roads = [
      { id: 'rp_fwd', type: 'bridge', elements: [
        { arc: fwd },
        { connect: 'tangent' },
        { plate: { x: end.x - 5, z: end.z, length: 10, width: 8, y: 6 } },
      ] },
      { id: 'rp_rev', type: 'bridge', elements: [
        { arc: rev },
        { connect: 'tangent' },
        { plate: { x: start.x, z: start.z - 5, length: 10, width: 8, y: 6 } },
      ] },
    ];
    r.gameplay.exit = arcPoint(fwd, 45);
  });
  const { errors } = validateLevel(raw, LEVEL_SPEC_V2);
  eq(errors.length, 0, `валидатор не принял tangent-стык: ${errors.join(' | ')}`);
  const level = normalizeLevel(raw);
  const fwdPlate = level.map.roads[0].decks[1];
  const revPlate = level.map.roads[1].decks[1];
  eq(fwdPlate.yaw, -180, 'пластина после дуги 0→90 не продолжила касательную (+90°)');
  eq(revPlate.yaw, -90, 'пластина после дуги 90→0 не развернулась по касательной (−90°)');
  // продолжение оси: начало пластины совпало с концом дуги
  const back = { x: fwdPlate.cx - Math.cos(fwdPlate.yaw * Math.PI / 180) * fwdPlate.length / 2,
    z: fwdPlate.cz - Math.sin(fwdPlate.yaw * Math.PI / 180) * fwdPlate.length / 2 };
  assert(Math.abs(back.x - end.x) < 1e-6 && Math.abs(back.z - end.z) < 1e-6,
    `пластина не примкнула к концу дуги: ${back.x}, ${back.z}`);
  const code = generateModule(raw, 'src/levels/level-11.json').code;
  assert(!code.includes('"connect"'), 'маркер касательной доехал до модуля главы');
});

t("v2: connect:'tangent' без соседа, перед дугой и с явным yaw — ошибки", () => {
  const plate = { x: 0, z: 10, length: 20, width: 6, y: 0.12 };
  const cases = [
    ['первым', [{ connect: 'tangent' }, { plate }], 'первым'],
    ['дважды', [{ plate }, { connect: 'tangent' }, { connect: 'tangent' }, { plate }], 'дважды подряд'],
    ['перед дугой', [{ plate }, { connect: 'tangent' }, { arc: { ...ARC, from: 0, to: 90 } }], 'перед дугой'],
    ['в конце', [{ plate }, { connect: 'tangent' }], 'в конце'],
    ['с yaw', [{ plate }, { connect: 'tangent' }, { plate: { ...plate, yaw: 30 } }], 'одновременно'],
    ['с формой', [{ plate }, { connect: 'tangent', plate }], 'одновременно'],
  ];
  for (const [name, elements, needle] of cases) {
    const raw = v2Raw(r => { r.roads = [{ id: 'rp_bad', type: 'ground', elements }]; });
    const hit = hasError(validateLevel(raw, LEVEL_SPEC_V2).errors, 'rp_bad', needle);
    assert(hit.includes('connect'), `${name}: ошибка не про маркер: ${hit}`);
  }
});

/**
 * Опоры дуги: шаг отмеряется по длине осевой, а не по мировым осям, колонны стоят
 * на двух рядах у бортов (тот же отступ `pillarEdge`), низ — по верхней плоскости
 * дуги в её точке, а не по общему `bottomY` кольца. Обход назад даёт те же опоры:
 * угол считается по знаковому размаху.
 */
t('v2: опоры дуги стоят двумя рядами по tangent-рамке и растут от грунта до её низа', () => {
  const arc = { ...ARC, from: 0, to: 90, y: [0.12, 6] };
  const raw = v2Raw(r => {
    r.buildings = [];
    r.roads = [arcRoad('rp_pil', arc, { type: 'bridge' })];
    r.gameplay.exit = arcExit(arc);
  });
  const { errors } = validateLevel(raw, LEVEL_SPEC_V2);
  eq(errors.length, 0, `валидатор не принял дугу: ${errors.join(' | ')}`);
  const level = normalizeLevel(raw);
  const pillars = level.map.props.filter(p => p.model === 'concrete_pillar');
  const len = arc.radius * (arc.to - arc.from) * Math.PI / 180;
  const inset = arc.width / 2 - J.pillarSection / 2 - J.pillarEdge;
  let want = 0;
  for (let s = J.pillarSpacing / 2; s < len - 0.01; s += J.pillarSpacing) {
    const deg = arc.from + (arc.to - arc.from) * (s / len);
    for (const o of (inset >= J.pillarSection ? [-inset, inset] : [0])) {
      if (arcTop(arc, deg, arc.radius + o) - J.deckThickness > 1.0) want++;
    }
  }
  eq(pillars.length, want, `опор ${pillars.length}, по шагу дуги ожидалось ${want}`);
  for (const p of pillars) {
    const rho = Math.hypot(p.position.x - arc.cx, p.position.z - arc.cz);
    assert(Math.abs(Math.abs(rho - arc.radius) - inset) < 2e-3, `опора не на борту: радиус ${rho}`);
    eq(p.position.y, 0, 'опора не встала на грунт');
    const deg = Math.atan2(p.position.z - arc.cz, p.position.x - arc.cx) * 180 / Math.PI;
    assert(Math.abs(p.rotationY + deg + 90) < 0.01, `опора не повёрнута по касательной: ${p.rotationY} при ${deg}`);
    assert(Math.abs(p.position.y + p.scale.y + J.deckThickness - arcTop(arc, deg, rho)) < 2e-3,
      `опора ${p.id} не доросла до низа полотна`);
  }
});

t('v2: фонари дуги стоят на бортах по tangent-рамке', () => {
  const arc = { ...ARC, from: 0, to: 90, y: [6, 6], bank: 0 };
  const raw = v2Raw(r => {
    r.buildings = [];
    r.roads = [arcRoad('rp_lamps', arc, { type: 'bridge', lamps: true })];
    r.gameplay.exit = arcExit(arc);
  });
  eq(validateLevel(raw, LEVEL_SPEC_V2).errors.length, 0, 'валидатор не принял дугу с фонарями');
  const level = normalizeLevel(raw);
  const lamps = level.map.props.filter(p => p.model === 'lamp_post');
  const len = arc.radius * (arc.to - arc.from) * Math.PI / 180;
  let want = 0;
  for (let s = J.lampSpacing / 2; s < len - 0.01; s += J.lampSpacing) want += 2;
  eq(lamps.length, want, `фонарей ${lamps.length}, ожидалось ${want}`);
  const edge = arc.width / 2 + J.lampOffset;
  for (const l of lamps) {
    const rho = Math.hypot(l.position.x - arc.cx, l.position.z - arc.cz);
    assert(Math.abs(Math.abs(rho - arc.radius) - edge) < 2e-3, `фонарь не на борту: радиус ${rho}`);
    eq(l.position.y, 6, 'фонарь не встал на полотно');
    const deg = Math.atan2(l.position.z - arc.cz, l.position.x - arc.cx) * 180 / Math.PI;
    assert(Math.abs(l.rotationY + deg + 90) < 0.01, `фонарь не повёрнут по касательной: ${l.rotationY} при ${deg}`);
  }
});

// Компактный бриф с секцией `city`: два района по 120 × 120 м в земле 300 × 300.
// Проверяет сам разворот (детерминизм, формы, вытеснение авторской записью) и
// то, что его выход проходит валидатор и не оставляет служебных полей в модуле.
const CITY_RAW = {
  metadata: { levelName: 'cityGen', name: 'Кварталы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  city: {
    seed: 70707,
    districts: [
      {
        id: 'a', block: { minX: -140, maxX: -20, minZ: -140, maxZ: -20 }, style: 'corporate',
        street: { pitch: 40, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.4 },
        height: { minFloors: 2, maxFloors: 8, floorHeight: 3.4 }, enterableEvery: 5,
      },
      {
        id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
        street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
        height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
        roofs: { walkable: true, access: 0.5, parapet: 0.9 },
      },
    ],
  },
  roads: [], buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
    enemies: { count: 2 }, alienEnemies: { count: 1 } },
};

const cityErrors = mutate => {
  const raw = structuredClone(CITY_RAW);
  mutate(raw);
  let message = null;
  try { expandCity(raw); } catch (e) { message = String(e.message); }
  assert(message, 'генератор принял невозможную конфигурацию района');
  return message;
};

t('генератор детерминирован: сид задаёт кварталы целиком', () => {
  const a = JSON.stringify(expandCity(structuredClone(CITY_RAW)));
  const b = JSON.stringify(expandCity(structuredClone(CITY_RAW)));
  eq(a, b, 'два разворота одного сида разошлись');
});

t('разворот даёт кварталы, которые принимает валидатор', () => {
  const expanded = expandCity(structuredClone(CITY_RAW));
  const { errors, warnings } = validateLevel(expanded);
  const steep = (expanded.buildings ?? []).flatMap(b => (b.stairs ?? [])
    .filter(s => s.type !== 'ladder' && s.dimensions)
    .map(s => {
      const L = Math.max(s.dimensions.width, s.dimensions.length);
      const W = Math.min(s.dimensions.width, s.dimensions.length);
      const height = (s.connectsFloors[1] - s.connectsFloors[0]) * b.floorHeight;
      return { b, s, slope: height / stairRun(s.type, L, W) };
    })
    .filter(({ slope }) => slope > CONFIG.jsonMap.maxStairSlope + 1e-6));
  eq(steep.length, 0, `марши круче J.maxStairSlope: ${steep.map(({ b, s }) => `${b.id}/${s.id}`).join(' ')}`);
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  eq(warnings.length, 0, `предупреждения: ${warnings.join(' | ')}`);
  assert(expanded.buildings.length >= 35, `домов ${expanded.buildings.length}, ожидалось не меньше 35`);
  assert(expanded.roads.length >= 8, `улиц ${expanded.roads.length}`);
  assert(!expanded.city, 'секция city осталась в развёрнутом брифе');
});

t('формы домов: архетипы представлены, id уникальны, дворы не залиты коробкой', () => {
  const expanded = expandCity(structuredClone(CITY_RAW));
  const ids = expanded.buildings.map(b => b.id);
  eq(new Set(ids).size, ids.length, 'id домов повторяются');
  const kinds = new Set(expanded.buildings.map(b => b.archetype));
  assert(kinds.size >= 5, `архетипов ${kinds.size} (${[...kinds].join(',')}), ожидалось не меньше пяти`);
  for (const name of kinds) assert(ARCHETYPE_NAMES.includes(name), `архетип '${name}' вне списка схемы`);
  // вводимый дом обязан быть прямоугольником: плиту пола парсер режет по её AABB,
  // и Г-образная комната залила бы полвесь двор
  for (const b of expanded.buildings.filter(x => x.isEnterable)) {
    const xs = b.footprint.map(p => p.x), zs = b.footprint.map(p => p.z);
    const area = b.footprint.reduce((acc, p, i) => {
      const q = b.footprint[(i + 1) % b.footprint.length];
      return acc + (p.x * q.z - q.x * p.z);
    }, 0) / 2;
    const box = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...zs) - Math.min(...zs));
    assert(Math.abs(area) >= box - 0.01, `${b.id}: вводимый дом не прямоугольник (площадь ${Math.abs(area).toFixed(1)} против охвата ${box.toFixed(1)})`);
    assert(b.rooms.length === b.floorsCount, `${b.id}: этажей ${b.floorsCount}, комнат ${b.rooms.length}`);
    assert(b.stairs.length >= 1, `${b.id}: вводимый дом без марша`);
  }
});

t('авторская запись вытесняет сгенерированный лот вместе с его надстройками', () => {
  const generated = expandCity(structuredClone(CITY_RAW)).buildings;
  const victim = generated.find(b => /_(a|b|top)$/.test(b.id));
  assert(victim, 'генератор не дал составного лота — проверять вытеснение нечего');
  const stem = victim.id.replace(/_(a|b|top)$/, '');
  const raw = structuredClone(CITY_RAW);
  raw.buildings = [{
    id: stem, name: 'Авторский дом', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    footprint: [{ x: -140, z: -140 }, { x: -132, z: -140 }, { x: -132, z: -132 }, { x: -140, z: -132 }],
    rooms: [],
  }];
  const out = expandCity(raw).buildings.filter(b => b.id === stem || b.id.startsWith(`${stem}_`));
  eq(out.length, 1, `от лота '${stem}' осталось ${out.length} записей: ${out.map(b => b.id).join(',')}`);
  eq(out[0].name, 'Авторский дом', 'вместо автора встал генератор');
});

t('невозможная конфигурация района отбракована до первого вызова ГПСЧ', () => {
  hasError(cityErrors(raw => { raw.city.districts[0].street.pitch = 14; }).split('\n'),
    'street.pitch', 'пересеклись');
  hasError(cityErrors(raw => { raw.city.districts[0].block.maxX = 200; }).split('\n'),
    'вне земли');
  hasError(cityErrors(raw => { raw.city.districts[0].archetypes = ['not_a_house']; }).split('\n'),
    'архетип', 'не описан');
  hasError(cityErrors(raw => { raw.city.districts.push(structuredClone(raw.city.districts[0])); }).split('\n'),
    'id района', 'уже занят');
  hasError(cityErrors(raw => { raw.city.districts[1].block = { minX: -100, maxX: -20, minZ: -60, maxZ: 140 }; }).split('\n'),
    'пересекаются');
  hasError(cityErrors(raw => { raw.city.seed = 1.5; }).split('\n'), 'seed', 'не целое');
  const empty = (() => {
    const raw = structuredClone(CITY_RAW);
    raw.city.districts = [];
    try { expandCity(raw); } catch (e) { return String(e.message); }
    return '';
  })();
  hasError(empty.split('\n'), 'districts пуст');
});

t('развёрнутый город нормализуется и не несёт служебных полей в модуле', () => {
  const level = normalizeLevel(expandCity(structuredClone(CITY_RAW)));
  assert(level.map.buildings.length > 0, 'нормализатор не собрал домов');
  assert(level.map.buildings.every(b => b.archetype === undefined), 'в модуль попало поле архетипа');
  assert(level.map.roads.every(r => r.archetype === undefined), 'в модуль попало поле архетипа улицы');
  let thrown = null;
  try { normalizeLevel(structuredClone(CITY_RAW)); } catch (e) { thrown = e; }
  assert(thrown && /expandCity/.test(thrown.message), 'нормализатор принял неравёрнутую секцию city');
});

t('глава без секции city разворачивается без изменений', () => {
  const without = structuredClone(rawLevel);
  const out = expandCity(without);
  eq(out.buildings.length, without.buildings.length, 'генератор тронул главу без city');
  eq(JSON.stringify(out), JSON.stringify(without), 'разворот без city изменил бриф');
});

// ------------------------------------------------- рельеф главы (v2, этап 2)

/**
 * Компактный бриф с плавным рельефом: гряда-капсула держит верхний ярус (~6,6 м),
 * левина в противоположном углу опускает землю (~ +0,8 м), между ними — авторская
 * площадка террасы, косой корпус на склоне, корпус у чашы и мост через склон.
 *
 * Радиусы выбраны по пределу `крутизна = 1,5 · height / radius` (замер —
 * `tools/relief.test.mjs`): 9 м на 320 м — это 0,042 м/м одиночной капсулы при
 * пределе холма 0,06, и вместе с противоположно наклонённой левиной поле держит
 * `relief.maxSlope` 0,12 с запасом на переходы площадок — плоская терраса
 * сходит в склон множителем ~1,25 от его собственного уклона, поэтому холмы
 * фиксатура заведомо положе предела, иначе площадка была бы нечем сведена.
 *
 * Улица верхнего яруса стоит ровно на отметке террасы: наземный настил,
 * приподнятый над своим полем больше чем на метр, парсер вооружает колоннами, а
 * они попадают в план той же улицы.
 */
const RELIEF_RAW = {
  kind: 'json2',
  metadata: { levelName: 'reliefHouse', name: 'Ярусы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  relief: {
    baseY: 0,
    hills: [
      { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 320, height: 9 },
      { id: 'lovchina', x: -80, z: -70, radius: 320, height: -5 },
    ],
    pads: [{ id: 'terrace', minX: -20, maxX: 40, minZ: 40, maxZ: 68, y: 6.6 }],
  },
  roads: [
    { id: 'st_high', type: 'ground', width: 8, lamps: true,
      points: [{ x: -40, y: 6.6, z: 60 }, { x: 100, y: 6.6, z: 60 }] },
    { id: 'br_span', type: 'bridge', width: 8,
      elements: [{ plate: { x: -20, z: -40, length: 80, width: 8, yaw: 0, y: 4.2, rise: 2.4 } }] },
  ],
  buildings: [
    { id: 'h_ridge', isEnterable: false, floorsCount: 2, floorHeight: 3.4, rotation: 30,
      footprint: [{ x: -12, z: 97 }, { x: 12, z: 97 }, { x: 12, z: 103 }, { x: -12, z: 103 }],
      rooms: [] },
    { id: 'h_low', isEnterable: false, floorsCount: 2, floorHeight: 3.4,
      footprint: [{ x: -92, z: -63 }, { x: -68, z: -63 }, { x: -68, z: -57 }, { x: -92, z: -57 }],
      rooms: [] },
  ],
  gameplay: { goal: 'exit', spawn: { x: -120, z: -110 }, exit: { x: 100, z: 120 }, exitRadius: 4 },
};

/** Природа поля без площадок — точки брига выбраны вне её колец, там она и есть итог. */
const NATURE = reliefOf({ baseY: 0, hills: structuredClone(RELIEF_RAW.relief.hills) });

/** Сравнение округлённых отметок: parсер пишет `r3`, допуск — только на float-хвост. */
function close(actual, expected, tol, message) {
  if (!(Math.abs(actual - expected) <= tol)) {
    throw new Error(`${message}: ожидалось ${expected} ± ${tol}, получено ${actual}`);
  }
}

const reliefErrors = (mutate = () => {}) => {
  const raw = structuredClone(RELIEF_RAW);
  mutate(raw);
  return validateLevel(raw, LEVEL_SPEC_V2).errors;
};

/** Максимальный уклон собранного поля по сетке внутри земли. */
function maxFieldSlope(reliefPlain, step = 6) {
  const f = reliefOf(structuredClone(reliefPlain));
  let max = 0, at = null;
  for (let x = -148; x <= 148; x += step) {
    for (let z = -148; z <= 148; z += step) {
      const mag = f.slopeAt(x, z).mag;
      if (mag > max) { max = mag; at = [r3(x), r3(z)]; }
    }
  }
  return { max, at };
}

t('рельеф v2: валидатор и нормализатор молчат, модуль несёт поле', () => {
  const errors = reliefErrors();
  eq(errors.length, 0, `ошибки: ${errors.join(' | ')}`);
  const level = normalizeLevel(structuredClone(RELIEF_RAW));
  eq(level.warnings.length, 0, `предупреждения: ${level.warnings.join(' | ')}`);
  eq(level.map.relief.hills.length, 2, 'в данных карты не оказалось холмов');
  eq(level.map.relief.baseY, 0, 'опорная отметка поля уехала');
  // точка B (100, 120) стоит на открытом склоне: ни настила, ни здания под ней
  // нет, и без поля это дало бы «маяк повиснет» — с полем то же предупреждение
  // было бы ложным
  const noRelief = structuredClone(RELIEF_RAW);
  delete noRelief.relief;
  const flat = normalizeLevel(noRelief);
  assert(flat.warnings.some(w => w.includes('маяк повиснет')),
    'без рельефа та же точка не пожаловалась — проверка склона ничего не доказывает');
  const code = generateModule(structuredClone(RELIEF_RAW), 'src/levels/level-12.json').code;
  assert(code.includes('"relief"'), 'модуль главы не донёс секцию рельефа');
  assert(code.includes('"gryada"'), 'модуль главы не донёс холм');
});

t('дом без baseY встаёт на отметку поля в центре плана, и под ним — его площадка', () => {
  const level = normalizeLevel(structuredClone(RELIEF_RAW));
  const ridge = level.map.buildings.find(b => b.id === 'h_ridge');
  const low = level.map.buildings.find(b => b.id === 'h_low');
  // центр плана косого дома — неподвижная точка его поворота, поэтому природа
  // мерится прямо по нему: (0, 100) и (−80, −60)
  close(ridge.baseY, r3(NATURE.heightAt(0, 100)), 1e-9, 'косой корпус встал не на поле');
  close(low.baseY, r3(NATURE.heightAt(-80, -60)), 1e-9, 'корпус в низине встал не на поле');
  assert(ridge.baseY - low.baseY > 5,
    `два яруса главы сошлись в одну отметку: перепад ${(ridge.baseY - low.baseY).toFixed(2)} м`);
  const pad = level.map.relief.pads.find(p => p.id === 'h_ridge:площадка');
  assert(pad, 'под косым домом не появилось площадки');
  eq(pad.y, ridge.baseY, 'отметка площадки разошлась с полом дома');
  eq(pad.yaw, 30, 'площадка повёрнутого дома не наследует его угол');
  // ядро площадки = габарит плана в его собственных осях: без поворота кольцо
  // срезало бы угол корпуса, и склон торчал бы из-под пола
  eq(pad.minX, -12, 'площадка не по локальному плану дома');
  eq(pad.maxZ, 103, 'площадка не по локальному плану дома');
});

t('переход площадки держит предел уклона поля: кольцо раздувается, а не обрезается', () => {
  const level = normalizeLevel(structuredClone(RELIEF_RAW));
  const maxSlope = level.map.relief.maxSlope;
  const fitted = maxFieldSlope(level.map.relief);
  assert(fitted.max <= maxSlope * 1.05,
    `поле после площадок даёт ${fitted.max.toFixed(3)} м/м в точке ${fitted.at} при пределе ${maxSlope}`);
  // узкое кольцо парсер обязан раздуть: площадка в 4 м на фланге гряды, где
  // природа ~6,5 м, за 2 м перехода дала бы склон круче предела
  const tight = structuredClone(RELIEF_RAW);
  tight.relief.pads.push({ id: 'уступ', minX: -10, maxX: 10, minZ: 10, maxZ: 30, y: 4, blend: 2 });
  const widened = normalizeLevel(tight);
  eq(widened.warnings.length, 0, `предупреждения при раздутом кольце: ${widened.warnings.join(' | ')}`);
  const pad = widened.map.relief.pads.find(p => p.id === 'уступ');
  assert(pad.blend > 2, `кольцо осталось ${pad.blend} м — подгонка не сработала`);
  const after = maxFieldSlope(widened.map.relief);
  assert(after.max <= maxSlope * 1.05,
    `раздутое кольцо дало ${after.max.toFixed(3)} м/м в точке ${after.at}`);
  // отметку, которую нечем свести в предел, парсер обязан назвать, а не
  // нарисовать молча: 22 м над полем на радиусах этого брифа просят перехода
  // больше `relief.maxBlend`
  const steep = structuredClone(RELIEF_RAW);
  steep.relief.pads[0].y = 22;
  const warned = normalizeLevel(steep);
  assert(warned.warnings.some(w => w.includes('не хватает переходной зоны')),
    `площадка выше предела не названа: ${warned.warnings.join(' | ')}`);
});

t('крутизна: одиночный холм назван с требуемым радиусом, стопка холмов — точкой поля', () => {
  hasError(reliefErrors(r => { r.relief.hills[0] = { id: 'bugry', x: 0, z: 0, radius: 100, height: 10 }; }),
    'relief.hills[0]', 'радиус обязан быть не меньше 250');
  // каждый поштучно в своём пределе капсулы (1,5 · 12 / 320 = 0,056 < 0,06),
  // вместе на одном фланге — 0,169: поштучная аналитика этого не видит, поэтому
  // поле стоит пробывать сеткой
  const stacked = reliefErrors(r => {
    r.relief.hills = [
      { id: 'a', x: 0, z: -120, radius: 320, height: 12 },
      { id: 'b', x: 0, z: -110, radius: 320, height: 12 },
      { id: 'c', x: 0, z: -100, radius: 320, height: 12 },
    ];
  });
  hasError(stacked, 'поле в точке', 'холмы складываются');
  hasError(reliefErrors(r => { r.relief.pads[0].maxX = 140; }), 'выходит за землю');
  hasError(reliefErrors(r => { r.relief.pads[0].minX = 40; r.relief.pads[0].maxX = 40; }),
    'вырожденная площадка');
});

t('колонны моста растут от поля, а не от нулевой плоскости главы', () => {
  const level = normalizeLevel(structuredClone(RELIEF_RAW));
  const field = reliefOf(structuredClone(level.map.relief));
  const pillars = level.map.props.filter(p => p.source === 'bridge_pillar' && p.id.includes('br_span'));
  assert(pillars.length >= 2, `мост через склон дал ${pillars.length} колонн`);
  for (const p of pillars) {
    close(p.position.y, r3(field.heightAt(p.position.x, p.position.z)), 1e-9,
      `опора ${p.id} встала не на поле`);
  }
  const feet = pillars.map(p => p.position.y);
  assert(Math.min(...feet) > 0.5,
    `колонна встала на нулевую плоскость пола мира, а не на поле: минимум ${Math.min(...feet)}`);
  assert(Math.max(...feet) - Math.min(...feet) > 1,
    `пятки колонн не следуют склону: от ${Math.min(...feet)} до ${Math.max(...feet)}`);
  const deck = level.map.roads.find(r => r.id === 'br_span').decks[0];
  for (const p of pillars) {
    assert(p.scale.y > 1, `колонна ${p.id} короче метра: ${p.scale.y}`);
    assert(p.position.y + p.scale.y <= deck.topAtMax - J.deckThickness + 1e-6,
      `колонна ${p.id} проткнула настил`);
  }
});

/** Кварталы генератора на пологине: тот же сид, но глава `json2` с рельефом. */
const cityReliefRaw = () => {
  const raw = structuredClone(CITY_RAW);
  raw.kind = 'json2';
  raw.relief = {
    baseY: 0,
    hills: [
      { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
      { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
    ],
  };
  return raw;
};

t('терраса района: одна площадка на квартал, а не островок под каждым домом', () => {
  // 357 корпусов на склоне своими плоскими пятачками дают поле в разы круче
  // предела (замер — `probe/relief-scale.mjs`), поэтому район выравнивается
  // ОДНОЙ террасой, а её отметка — уровень местности в центре квартала
  const raw = cityReliefRaw();
  const nature = reliefOf({ baseY: 0, hills: structuredClone(raw.relief.hills) });
  const level = normalizeLevel(expandCity(raw));
  eq(level.warnings.length, 0, `предупреждения: ${level.warnings.join(' | ')}`);
  const terraces = level.map.relief.pads.filter(p => p.id.endsWith(':терраса'));
  eq(terraces.length, 2, `террас вышло ${terraces.length}, а районов два`);
  eq(terraces.map(p => p.id).sort().join(','), 'a:терраса,b:терраса', 'терраса не названа районом');
  // под лотами района своих площадок не остаётся: их пол и так на террасе
  eq(level.map.relief.pads.filter(p => p.id.endsWith(':площадка')).length, 0,
    'генераторским лотам выросли отдельные пятачки');
  // габарит террасы — союз планов лотов района, поэтому улицы между кварталами
  // попадают под неё вместе с домами
  const a = terraces.find(p => p.id === 'a:терраса');
  const aLots = level.map.buildings.filter(b => b.id.startsWith('a_'));
  assert(a.minX <= Math.min(...aLots.map(b => b.bounds.minX)) + 1e-9
    && a.maxX >= Math.max(...aLots.map(b => b.bounds.maxX)) - 1e-9
    && a.minZ <= Math.min(...aLots.map(b => b.bounds.minZ)) + 1e-9
    && a.maxZ >= Math.max(...aLots.map(b => b.bounds.maxZ)) - 1e-9,
    `терраса ${fmt(a)} не накрыла квартал из ${aLots.length} лотов`);
  close(a.y, r3(nature.heightAt((a.minX + a.maxX) / 2, (a.minZ + a.maxZ) / 2)), 1e-9,
    'отметка террасы взята не с уровня местности в центре квартала');
  // одиночный блок района стоит на её уровне весь: ни одному лоту не пришлось бы
  // требовать своего пятачка
  const singles = level.map.buildings.filter(b => /^a_\d\d\d$/.test(b.id));
  assert(singles.length >= 5, `одиночных блоков района ${singles.length} — проверка ничего не доказывает`);
  assert(singles.every(b => b.baseY === a.y),
    `полы лотов разъехались по террасе: ${[...new Set(singles.map(b => b.baseY))].join(', ')}`);
  // ярусы стека (`_a`, `_b`, `_top`) поднимаются над террасой своими отметками
  const stacked = level.map.buildings.filter(b => /^a_\d\d\d_/.test(b.id));
  assert(stacked.every(b => b.baseY >= a.y), 'ярус стека ушёл под отметку района');
  // служебное поле генератора не доезжает в модуль — как `archetype`
  assert(level.map.buildings.every(b => b.district === undefined), 'в модуль попало поле района');
  assert(!generateModule(cityReliefRaw(), 'src/levels/level-12.json').code.includes('"district"'),
    'в закоммиченный модуль доехало служебное поле');
});

// ------------------------------------------------- косой район (этап 5, v2)

/**
 * Тот же сид и те же кварталы, но район 'a' повёрнут на 18° вокруг центра своего
 * блока (−80, −80) и ограничен пятиугольником в **локальных** осях. Земля —
 * 320 м, а не 300: габарит повёрнутого блока это 120·(|cos 18| + |sin 18|) ≈
 * 151 м в поперечнике, и на 300 метрах квартал не влез бы — валидатор обязан
 * назвать это ошибкой, а не молча обрезать район.
 */
const SKEW_YAW = 18;
const SKEW_FRAME = frameAt(-80, -80, SKEW_YAW);
const SKEW_POLY = [
  { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
  { x: -37, z: -51 }, { x: -78, z: -34 },
];

function skewRaw() {
  const raw = cityReliefRaw();
  raw.ground.size = 320;
  raw.city.districts[0].yaw = SKEW_YAW;
  raw.city.districts[0].polygon = SKEW_POLY.map(p => ({ ...p }));
  return raw;
}

/** Удаление точки от контура: за границей района прощён только шаг пробы. */
function polyDist(poly, x, z) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x, dz = b.z - a.z, len2 = dx * dx + dz * dz;
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / len2)) : 0;
    best = Math.min(best, Math.hypot(x - (a.x + t * dx), z - (a.z + t * dz)));
  }
  return best;
}

/** Концы и углы пластины в локальных осях района — по её же `yaw`, без копии формулы движка. */
function plateCorners(p) {
  const k = p.yaw * Math.PI / 180;
  const ax = Math.cos(k) * p.length / 2, az = Math.sin(k) * p.length / 2;
  const bx = -Math.sin(k) * p.width / 2, bz = Math.cos(k) * p.width / 2;
  return [[ax + bx, az + bz], [ax - bx, az - bz], [-ax + bx, -az + bz], [-ax - bx, -az - bz]]
    .map(([dx, dz]) => unrotatePoint(SKEW_FRAME, p.x + dx, p.z + dz));
}

t('косой район: улицы — пластины вдоль своих осей, дома — неразвёрнутые планы с rotation', () => {
  const expanded = expandCity(skewRaw());
  const skew = expanded.roads.filter(r => r.id.startsWith('a_'));
  const flat = expanded.roads.filter(r => r.id.startsWith('b_'));
  assert(skew.length >= 4, `косых улиц ${skew.length}, ожидалось не меньше четырёх`);
  assert(flat.every(r => r.points && !r.elements), 'соосный район уехал в пластины');
  for (const r of skew) {
    eq(r.elements.length, 1, `улица ${r.id}: пластин ${r.elements.length}, а прогон один`);
    const p = r.elements[0].plate;
    const cs = plateCorners(p);
    // концы ОДНОГО борта: углы `plateCorners` различаются поперёк полотна, а
    // сравнивать надо вдоль него
    const [a, b] = [cs[0], cs[2]];
    // поперёк прогона концы совпадают: пластина обязана идти ВДОЛЬ локальной оси
    // улицы, а не поперёк (замер этапа 5: без +90° у вертикальных прогонов их
    // настил ложился поперёк района, и дома на лотах «вставали в улицу»)
    if (r.id.includes('_h')) {
      close(b.z, a.z, 1e-3, `улица ${r.id}: концы в осях района имеют разные z — полотно не вдоль X`);
      assert(Math.abs(b.x - a.x) > p.length * 0.99, `улица ${r.id}: длина не легла вдоль X`);
    } else {
      close(b.x, a.x, 1e-3, `улица ${r.id}: концы в осях района имеют разные x — полотно не вдоль Z`);
      assert(Math.abs(b.z - a.z) > p.length * 0.99, `улица ${r.id}: длина не легла вдоль Z`);
    }
  }
  const houses = expanded.buildings.filter(b => b.id.startsWith('a_'));
  assert(houses.length >= 8, `косых корпусов ${houses.length}`);
  for (const b of houses) {
    assert(b.rotation >= SKEW_YAW - 6.01 && b.rotation <= SKEW_YAW + 6.01,
      `дом ${b.id} вышел за угол района плюс джиттер: ${b.rotation}`);
    // запись остаётся неразвёрнутой (соглашение v2): стены, комнаты и марши
    // считаются в осях плана, в мир едет один угол
    const skewEdges = b.footprint.filter((q, i) => {
      const n = b.footprint[(i + 1) % b.footprint.length];
      return Math.abs(q.x - n.x) > 1e-6 && Math.abs(q.z - n.z) > 1e-6;
    });
    eq(skewEdges.length, 0, `дом ${b.id}: footprint пошёл наискось — парсер считает стены в осях плана`);
    const c = unrotatePoint(SKEW_FRAME,
      (Math.min(...b.footprint.map(p => p.x)) + Math.max(...b.footprint.map(p => p.x))) / 2,
      (Math.min(...b.footprint.map(p => p.z)) + Math.max(...b.footprint.map(p => p.z))) / 2);
    assert(Math.abs(c.x) < 160 && Math.abs(c.z) < 160, `дом ${b.id} уехал за землю: ${fmt({ minX: c.x, maxX: c.x, minZ: c.z, maxZ: c.z })}`);
  }
  assert(expanded.buildings.filter(b => b.id.startsWith('b_')).every(b => b.rotation === undefined),
    'соосный район получил поворот домов');
  // пересечение планов разрешено только соосным корпусам (правило SAT валидатора
  // v2): лоты косого района имеют РАЗНЫЕ углы, поэтому ни один чужой план не
  // обязан их пересекать — габарит тут не аргумент, нужен точный OBB
  const stem = id => id.split('_').slice(0, 2).join('_');
  const obbOfRecord = b => {
    const r = {
      minX: Math.min(...b.footprint.map(p => p.x)), maxX: Math.max(...b.footprint.map(p => p.x)),
      minZ: Math.min(...b.footprint.map(p => p.z)), maxZ: Math.max(...b.footprint.map(p => p.z)),
    };
    return obbOf(r, frameAt((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2, b.rotation ?? 0));
  };
  const clash = [];
  for (let i = 0; i < houses.length; i++) {
    for (let k = i + 1; k < houses.length; k++) {
      if (stem(houses[i].id) === stem(houses[k].id)) continue;
      if (obbHitsObb(obbOfRecord(houses[i]), obbOfRecord(houses[k]), 0.05)) {
        clash.push(`${houses[i].id}×${houses[k].id}`);
      }
    }
  }
  eq(clash.length, 0, `планы чужих лотов пересеклись: ${clash.join(' ')}`);
  const v = validateLevel(expanded, LEVEL_SPEC_V2);
  eq(v.errors.length, 0, `ошибки валидатора: ${v.errors.join(' | ')}`);
  eq(v.warnings.length, 0, `предупреждения валидатора: ${v.warnings.join(' | ')}`);
  const level = normalizeLevel(expanded);
  eq(level.warnings.length, 0, `предупреждения нормализатора: ${level.warnings.join(' | ')}`);
});

t('терраса косого района живёт в его осях, а не в габарите поворота', () => {
  const level = normalizeLevel(expandCity(skewRaw()));
  const pad = level.map.relief.pads.find(p => p.id === 'a:терраса');
  assert(pad, 'косой район не получил террасы');
  eq(pad.yaw, SKEW_YAW, 'терраса не унаследовала угол района');
  const frame = frameAt((pad.minX + pad.maxX) / 2, (pad.minZ + pad.maxZ) / 2, pad.yaw);
  // каждый план лота района обязан лечь в ядро террасы **в её собственных
  // осях**: в мировых координатах тот же союз — габарит повёрнутого квартала, он
  // больше самого квартала и накрыл бы чужие улицы (у 18° на 13 %, у 45° в 1,41)
  const lots = level.map.buildings.filter(b => b.id.startsWith('a_'));
  const outside = [];
  for (const b of lots) {
    for (const p of b.footprint) {
      const l = unrotatePoint(frame, p.x, p.z);
      // допуск в сантиметр, а не в микрон: координаты террасы округлены `r3`, и
      // вершина на грани союза отличается от неё на шум этого округления
      if (l.x < pad.minX - 0.01 || l.x > pad.maxX + 0.01 || l.z < pad.minZ - 0.01 || l.z > pad.maxZ + 0.01) {
        outside.push(`${b.id} ${JSON.stringify(l)}`);
      }
    }
  }
  eq(outside.length, 0, `планы лотов не легли в террасу района: ${outside.slice(0, 3).join(' | ')}`);
  eq(pad.y, lots.find(b => /^a_\d\d\d$/.test(b.id)).baseY, 'отметка террасы разошлась с полом лота');
  // плоский район рядом террасу не повернул
  const flat = level.map.relief.pads.find(p => p.id === 'b:терраса');
  eq(flat.yaw, undefined, 'осевой район получил поворот террасы');
  // служебный кадр района не доезжает ни в нормализованные данные, ни в модуль
  assert(level.map.buildings.every(b => b.districtFrame === undefined),
    'в данные карты доехал служебный кадр района');
  const code = generateModule(skewRaw(), 'src/levels/level-12.json').code;
  assert(!code.includes('districtFrame') && !code.includes('"district"'),
    'в закоммиченный модуль доехали служебные поля генератора');
  assert(!code.includes('Предупреждения парсера'), 'модуль косого района несёт предупреждение');
});

t('полигон района режет улицы по краю и отбраковывает лоты счётчиком', () => {
  const plain = expandCity(cityReliefRaw());
  const stats = {};
  const expanded = expandCity(skewRaw(), stats);
  assert(stats.lot_outside_polygon >= 1, `лоты вне границы не отбракованы: ${JSON.stringify(stats)}`);
  const roots = expanded.buildings.filter(b => /^a_\d\d\d$/.test(b.id));
  const plainRoots = plain.buildings.filter(b => /^a_\d\d\d$/.test(b.id));
  assert(roots.length < plainRoots.length,
    `район с границей дал не меньше корпусов, чем без неё: ${roots.length} против ${plainRoots.length}`);
  for (const b of roots) {
    const l = unrotatePoint(SKEW_FRAME,
      (Math.min(...b.footprint.map(p => p.x)) + Math.max(...b.footprint.map(p => p.x))) / 2,
      (Math.min(...b.footprint.map(p => p.z)) + Math.max(...b.footprint.map(p => p.z))) / 2);
    assert(pointInPoly(SKEW_POLY, l.x, l.z), `корпус ${b.id} стоит за границей района: ${JSON.stringify(l)}`);
  }
  // полотно обязано лежать в границе; наружу его может выставить только шаг
  // пробы `polyOutsideCuts` (0,5 м) — не габарит и не «примерно»
  for (const r of expanded.roads.filter(x => x.id.startsWith('a_'))) {
    for (const c of plateCorners(r.elements[0].plate)) {
      if (!pointInPoly(SKEW_POLY, c.x, c.z)) {
        const d = polyDist(SKEW_POLY, c.x, c.z);
        assert(d <= 0.5 + 1e-6, `улица ${r.id}: угол настила торчит за границу на ${d.toFixed(2)} м`);
      }
    }
  }
  const lengths = expanded.roads.filter(r => r.id.startsWith('a_')).map(r => r.elements[0].plate.length);
  assert(lengths.length < plain.roads.filter(r => r.id.startsWith('a_')).length,
    `граница не убрала ни одного прогона: ${lengths.join(', ')}`);
  assert(Math.max(...lengths) < 120, `ни один прогон не укоротился: ${lengths.join(', ')}`);
});

t('район без yaw и с yaw = 0 собираются одинаково: осевая ветка не тронута', () => {
  const plain = JSON.stringify(expandCity(cityReliefRaw()));
  const zero = cityReliefRaw();
  for (const d of zero.city.districts) d.yaw = 0;
  eq(JSON.stringify(expandCity(zero)), plain, 'yaw = 0 сдвинул кварталы осевого города');
  eq(JSON.stringify(expandCity(cityReliefRaw())), plain, 'осевой город разбежался между прогонами');
});

t('глава с рельефом детерминирована: два прогона дают побайтово равный модуль', () => {
  const a = generateModule(structuredClone(RELIEF_RAW), 'src/levels/level-12.json').code;
  const b = generateModule(structuredClone(RELIEF_RAW), 'src/levels/level-12.json').code;
  eq(a, b, 'парсер рельефа разбежался между прогонами');
  assert(!a.includes('Предупреждения парсера'), 'в закоммиченный модуль попало предупреждение');
  // порядок площадок значим: кольцо следующего подгоняется против поля с
  // предыдущими, поэтому он детерминирован списком брифа, а не сортировкой
  const swapped = structuredClone(RELIEF_RAW);
  swapped.buildings = [swapped.buildings[1], swapped.buildings[0]];
  const code = generateModule(swapped, 'src/levels/level-12.json').code;
  assert(code.includes('h_ridge:площадка') && code.includes('h_low:площадка'),
    'перестановка домов уронила чужую площадку');
});
// ---------------------------------------------------------------- служебное

function overlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function inRect(p, r) {
  return p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;
}

/** Прямоугольник в текст проверки — по координатам видно, где именно разошлось. */
function fmt(r) {
  return `[${r.minX}…${r.maxX} × ${r.minZ}…${r.maxZ}]`;
}

// проверки складываются в очередь: ждём все, прежде чем вынести вердикт
await Promise.all(pending);

console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.error(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
