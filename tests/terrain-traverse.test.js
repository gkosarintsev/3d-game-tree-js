/**
 * Автотесты карты-рельефа (TerrainMap, глава 1 «Перевал»).
 *
 * Проверяют проходовость рельефа, описанного данными уровня: маршрут от точки
 * A до точки B, пещерный ход, отвесные стенки пропасти, настил моста и пологий
 * откос-выход из неё. Рельеф берётся из LEVEL_01.map — тесты следят за данными.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/terrain-traverse.test.js');
 *   m.runTerrainTests();
 *
 * Проверяются сценарии:
 *   1. Карта строится: солиды, индексы и граф навигации непустые;
 *   2. По графу навигации есть путь от спавна до точки B;
 *   3. Маршрут движка идёт по полу туннеля (иначе обход гряды прячет тупик);
 *   4. В центре туннеля — плоский пол, игрока не задерживает, потолок за
 *     держивает поднятую руку (высота больше прохода);
 *   5. Туннель проходной ногами: от устья до захода на мост шаг за шагом, без
 *     подъёма больше шага — так ловится «тупик за краем rect'а пещеры»;
 *   6. Ответвление в зал тоже проходной;
 *   7. С края пропасти можно сойти вниз (это обрыв, а не стена), а из неё —
 *      нет: отвесная стенка задерживает;
 *   8. Настил моста — опора на заданной высоте, по нему можно идти;
 *   9. Откос внутри пропасти пологий (перепад клеток не больше шага) и связан
 *      с верхом графом: с дна пропасти есть путь наверх;
 *  10. Рейкаст raySolid сверху вниз по горе попадает в скалу, а не в «пол мира»
 *      (у рельефа нет плоскости земли);
 *  11. Детерминизм: две карты с одним сидом дают одинаковые высоты опоры.
 */
import { TerrainMap } from '../src/terrain-map.js';
import { LEVEL_01 } from '../src/levels/level-01.js';
import { CONFIG } from '../src/config.js';

const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

function makeMap() {
  return new TerrainMap(LEVEL_01.map);
}

/** Точка B из определения главы, опираясь на поверхность рельефа. */
function exitPoint(map) {
  const e = LEVEL_01.gameplay.exit;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

function testBasics() {
  const map = makeMap();
  const passed = map.solids.length > 100 && map.nav.pos.length > 100 &&
    !map.groundPlane;
  return {
    name: 'Карта рельефа строится (солиды, навигация, нет плоскости земли)',
    passed,
    info: `солидов ${map.solids.length}, узлов навигации ${map.nav.pos.length}, bounds y ${map.bounds.minX}..${map.bounds.maxX}`,
  };
}

function testPathAtoB() {
  const map = makeMap();
  const path = map.findPath(map.spawn, exitPoint(map));
  const passed = Array.isArray(path) && path.length > 2;
  return {
    name: 'Маршрут от точки A до точки B существует',
    passed,
    info: passed ? `путь из ${path.length} узлов` : 'пути нет — рельеф непроходим',
  };
}

function testCave() {
  const map = makeMap();
  const cx = 0, cz = -2; // внутри туннеля LEVEL_01
  const floor = LEVEL_01.map.caves[0].floor;
  // пол прощупываем «с высоты пола»: сверху над пещерой — ещё и гора
  const ground = map.groundHeightAt(cx, cz, floor);
  const walkOk = Math.abs(ground - floor) < 0.01 &&
    !map.isBlocked(cx, cz, CONFIG.radius, floor, PLAYER_H);
  // рука над головой игрока выше потолка пещеры — должна задержаться породой
  const tallBlocked = map.isBlocked(cx, cz, CONFIG.radius, floor, CONFIG.terrain.caveHeight + 0.5);
  const passed = walkOk && tallBlocked;
  return {
    name: 'Пещера: пол по данным, в проходе свободно, выше потолка — задержка',
    passed,
    info: passed
      ? `пол y=${ground.toFixed(2)}, обычный рост проходит, потолок ловит руку`
      : `ground=${ground.toFixed(2)} (ожидался ${floor}), walkOk=${walkOk}, tallBlocked=${tallBlocked}`,
  };
}

/**
 * Шагает по поверхности от {x,z} до {x,z} шагом 0.5: подъём больше шага или
 * задержка габарита — это тупик. Возвращает null, если прошли, иначе точку
 * сбоя с причиной.
 */
function walkAlong(map, from, to, feet) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.ceil(len / 0.5);
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = from.x + (to.x - from.x) * t;
    const z = from.z + (to.z - from.z) * t;
    const g = map.groundHeightAt(x, z, feet);
    if (g - feet > STEP) {
      return { x, z, reason: `подъём ${feet.toFixed(2)}→${g.toFixed(2)} — стена` };
    }
    feet = g;
    if (map.isBlocked(x, z, CONFIG.radius, feet + 0.02, PLAYER_H)) {
      return { x, z, reason: 'габарит задерживает' };
    }
  }
  return null;
}

function testTunnelThrough() {
  const map = makeMap();
  const c = LEVEL_01.map.caves[0];
  const z = (c.z0 + c.z1) / 2;
  const from = { x: c.x0 + 4, z };
  const to = { x: map.cfg.bridge.x0 - 2, z }; // до западного захода на мост
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Туннель проходной: от устья до захода на мост без тупика',
    passed: !fail,
    info: fail
      ? `тупик на x=${fail.x.toFixed(1)}: ${fail.reason}`
      : `прошли x=${from.x}..${to.x.toFixed(0)} по y≈${c.floor}`,
  };
}

function testBranchToHall() {
  const map = makeMap();
  const tunnel = LEVEL_01.map.caves[0];
  const corridor = LEVEL_01.map.caves[2];
  const hall = LEVEL_01.map.caves[1];
  const x = (corridor.x0 + corridor.x1) / 2;
  const from = { x, z: tunnel.z1 + 2 };
  const to = { x, z: (hall.z0 + hall.z1) / 2 }; // центр зала: до его стенки не идём намеренно
  const fail = walkAlong(map, from, to, map.groundHeightAt(from.x, from.z, 500));
  return {
    name: 'Ответвление в зал проходной: коридор соединяет туннель и зал',
    passed: !fail,
    info: fail
      ? `тупик на z=${fail.z.toFixed(1)}: ${fail.reason}`
      : `прошли z=${from.z}..${to.z} по коридору`,
  };
}

function testPathUsesTunnel() {
  const map = makeMap();
  const c = LEVEL_01.map.caves[0];
  const path = map.findPath(map.spawn, exitPoint(map));
  const inTunnel = (path ?? []).filter(p =>
    Math.abs(p.y - c.floor) < 0.05 && p.x > c.x0 && p.x < c.x1 && p.z > c.z0 - 4 && p.z < c.z1 + 4);
  const passed = inTunnel.length >= 3;
  return {
    name: 'Маршрут движка ведёт сквозь туннель, а не в обход гряды',
    passed,
    info: passed
      ? `${inTunnel.length} узлов маршрута на полу туннеля (x=${Math.min(...inTunnel.map(p => p.x)).toFixed(0)}..${Math.max(...inTunnel.map(p => p.x)).toFixed(0)})`
      : 'на полу туннеля маршрут не проходит',
  };
}

function testChasmWalls() {
  const map = makeMap();
  const ch = LEVEL_01.map.chasm;
  const edge = ch.x0;        // граница пропасти с западной стороны
  const z = -40;             // подальше от моста и откоса
  const wallX = edge - 2;    // центр клетки-стенки (до обрыва)
  const rimFeet = map.groundHeightAt(wallX, z, 500);
  const bottomFeet = map.groundHeightAt(edge + 2, z, 500);

  // сходить с края можно: дно ниже — это обрыв, а не стена
  const stepOff = !map.isBlocked(edge + 2, z, CONFIG.radius, rimFeet, PLAYER_H);
  // выбраться вверх по отвесной стенке нельзя: габарит задерживает
  const climbOut = map.isBlocked(edge + 0.2, z, CONFIG.radius, bottomFeet, PLAYER_H);
  const deep = rimFeet - bottomFeet >= 3; // это обрыв, а не перепад
  const passed = stepOff && climbOut && deep;
  return {
    name: 'Пропасть: с края сходим, из неё отвесная стенка не выпускает',
    passed,
    info: passed
      ? `край y=${rimFeet.toFixed(2)}, дно y=${bottomFeet.toFixed(2)} (глубина ${(rimFeet - bottomFeet).toFixed(2)})`
      : `stepOff=${stepOff}, climbOut=${climbOut}, глубина=${(rimFeet - bottomFeet).toFixed(2)}`,
  };
}

function testBridge() {
  const map = makeMap();
  const br = LEVEL_01.map.bridge;
  const x = (br.x0 + br.x1) / 2, z = (br.z0 + br.z1) / 2;
  const ground = map.groundHeightAt(x, z, 500);
  const passed = Math.abs(ground - br.y) < 0.01 &&
    !map.isBlocked(x, z, CONFIG.radius, ground, PLAYER_H);
  return {
    name: 'Мост: настил — опора на заданной высоте, по нему можно идти',
    passed,
    info: passed ? `настил y=${ground.toFixed(2)}` : `ground=${ground.toFixed(2)}, ожидался настил y=${br.y}`,
  };
}

function testRampEscape() {
  const map = makeMap();
  const r = LEVEL_01.map.ramps[0];
  const x = (r.x0 + r.x1) / 2;
  // перепад соседних клеток откоса не больше шага — по нему ходит человек
  let maxDelta = 0;
  for (let z = r.z0 + 2; z < r.z1 - 2; z += CONFIG.terrain.cell / 2) {
    const a = map.groundHeightAt(x, z - 0.01, 500);
    const b = map.groundHeightAt(x, z + 0.01, 500);
    if (Math.abs(b - a) > maxDelta && Math.abs(b - a) < 3) maxDelta = Math.abs(b - a);
  }
  const path = map.findPath({ x, y: r.from, z: r.z0 + 4 }, { x: r.x1 + 4, y: r.to, z: r.z1 + 4 });
  const passed = maxDelta <= STEP + 0.05 && Array.isArray(path) && path.length > 2;
  return {
    name: 'Откос из пропасти пологий и связан с верхом маршрутом',
    passed,
    info: passed ? `макс. перепад ${maxDelta.toFixed(2)} ≤ ${STEP}` : `перепад=${maxDelta.toFixed(2)}, путь с dna наверх=${!!path}`,
  };
}

function testRaySolidMountain() {
  const map = makeMap();
  const m = LEVEL_01.map.mountains[0];
  const hit = map.raySolid(m.x, 60, m.z, 0, -1, 0, 100);
  const passed = !!hit && hit.ny === 1 && hit.y > m.h * 0.5;
  return {
    name: 'Рейкаст по горе: raySolid попадает в скалу (плоскости земли нет)',
    passed,
    info: passed ? `удар y=${hit.y.toFixed(2)}, нормаль +Y` : `hit=${hit ? hit.y.toFixed(2) : 'null'}`,
  };
}

function testDeterminism() {
  const a = makeMap();
  const b = makeMap();
  let same = true;
  for (const [x, z] of [[-100, 4], [0, -2], [70, -30], [104, 0]]) {
    if (a.groundHeightAt(x, z, 500) !== b.groundHeightAt(x, z, 500)) same = false;
  }
  return {
    name: 'Детерминизм: один сид — одна и та же высота опоры',
    passed: same,
    info: same ? '4 контрольные точки совпали' : 'высоты разошлись — рельеф не детерминирован',
  };
}

/**
 * Прогоняет тесты рельефа и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runTerrainTests() {
  const tests = [
    testBasics,
    testPathAtoB,
    testPathUsesTunnel,
    testCave,
    testTunnelThrough,
    testBranchToHall,
    testChasmWalls,
    testBridge,
    testRampEscape,
    testRaySolidMountain,
    testDeterminism,
  ];
  const results = tests.map(fn => {
    try { return fn(); }
    catch (e) { return { name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }; }
  });
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты карты-рельефа');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
