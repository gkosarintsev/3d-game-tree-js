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
import { validateLevel } from './level-schema.mjs';
import { normalizeLevel, waterwayFoot } from './normalize-level.mjs';
import { generateModule } from './build-level.mjs';
import { expandCity, ARCHETYPE_NAMES } from './city.js';
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

t('вертикальный марш: проступи в одном плане шахты, подъём ≤ maxRise, верх ровно на отметку', () => {
  const level = normalizeLevel(vertLevel());
  const s = vertBuilding(level, 'tower').stairs.find(x => x.id === 'tw_ladder');
  eq(s.steps.length, Math.ceil(s.height / J.maxRise), 'число проступей');
  for (const st of s.steps) {
    eq(st.minX, s.rect.minX, 'план проступи по X');
    eq(st.maxZ, s.rect.maxZ, 'план проступи по Z');
  }
  let prev = s.y0;
  for (const st of s.steps) {
    assert(st.top - prev <= J.maxRise + 1e-9, `подъём проступи ${st.top - prev} круче ${J.maxRise}`);
    prev = st.top;
  }
  eq(prev, s.y1, 'последняя проступь не пришла на этаж');
  const up = vertBuilding(level, 'tower').stairs.find(x => x.id === 'tw_roof');
  eq(up.steps[up.steps.length - 1].top, vertBuilding(level, 'tower').roofY, 'верхний марш не пришёл на кровлю');
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

// ---------------------------------------------------------------- генератор кварталов

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
  const victim = generated.find(b => b.id.endsWith('_a') || b.id.endsWith('_b'));
  assert(victim, 'генератор не дал составного лота — проверять вытеснение нечего');
  const stem = victim.id.replace(/_[ab]$/, '');
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
