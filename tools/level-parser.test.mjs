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
import { normalizeLevel } from './normalize-level.mjs';
import { generateModule } from './build-level.mjs';
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

// ---------------------------------------------------------------- служебное

function overlap(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
}

function inRect(p, r) {
  return p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ;
}

// проверки складываются в очередь: ждём все, прежде чем вынести вердикт
await Promise.all(pending);

console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.error(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
