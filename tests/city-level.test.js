/**
 * Автотесты карты города (CityMap, глава 2 «Ночной город»).
 *
 * Проверяют каркас нового типа карты: планировка из данных, общий механизм
 * опор/коллизий/солидов, граф навигации (улицы, тротуары, входы в дома и
 * марши), маршрут главы от точки A до точки B — и то, что он физически проходим
 * ногами. Город берётся из LEVEL_02.map — тесты следят за данными уровня.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/city-level.test.js?v=1');
 *   await m.runCityTests();
 *
 * Проверяются сценарии:
 *   1. Контракт карты закрыт полностью (движок знает только его члены);
 *   2. Планировка из данных: размер города, число кварталов и домов, дом стоит
 *      внутри квартала с отступом тротуара;
 *   3. Каркас построен: солиды, опоры и граф навигации непустые, асфальт —
 *      плоская земля;
 *   4. Асфальт улицы — опора на нуле и проходимо;
 *   5. Тротуар поднят на бордюр и перешагивается (не стена);
 *   6. Фасадная стена держит габарит, а дверной проём — нет;
 *   7. По графу навигации есть путь от точки A до точки B;
 *   8. Маршрут главы физически проходим ногами на всём протяжении;
 *   9. С улицы можно войти в дом и подняться на следующий этаж (граф ведёт);
 *  10. Рейкаст: над улицей — земля, над домом — крыша рисованной высоты;
 *  11. Сфера тела выталкивается из стены дома;
 *  12. Меш города собирается и не содержит NaN-вершин;
 *  13. Миникарта рисует план города и подписывает этаж/улицу;
 *  14. Свободные точки для объектов уровня действительно свободны и опираются;
 *  15. Детерминизм: один сид — те же дома и те же высоты опор.
 */
import * as THREE from 'three';
import { CityMap } from '../src/city-map.js';
import { LEVEL_02 } from '../src/levels/level-02.js';
import { CONFIG } from '../src/config.js';
import { WALL, WINDOW, FLOOR, VOID, HOLE, outerSides } from '../src/building.js';

const STEP = CONFIG.building.stepUp;
const PLAYER_H = CONFIG.eyeHeight + 0.35;

function makeMap() {
  return new CityMap(LEVEL_02.map);
}

/** Карта с построенной геометрией: только тогда собраны и солиды (как в игре). */
let built = null;
function builtMap() {
  if (!built) {
    built = makeMap();
    built.build(new THREE.Scene());
  }
  return built;
}

/** Точка B из определения главы, опираясь на поверхность города. */
function exitPoint(map) {
  const e = LEVEL_02.gameplay.exit;
  return { x: e.x, y: map.groundHeightAt(e.x, e.z, 500), z: e.z };
}

/** Точка тротуара у края квартала: внутри квартала, но вне габарита дома. */
function sidewalkPoint(map, n = 0) {
  const blk = map.blocks[n], b = map.buildings[n];
  const x = blk.minX + 1.5;
  const z = (blk.minZ + blk.maxZ) / 2;
  return { x, z, y: map.groundHeightAt(x, z, 0), outsideHouse: x < b.originX };
}

/** Центр клетки-двери первого этажа (проём в западном фасаде). */
function doorCell(b) {
  for (let j = 0; j < b.rows; j++) {
    if (b.levels[0][j][0] !== FLOOR) continue;
    const o = outerSides(b.levels[0], b.cols, b.rows, 0, j);
    if (o.W) return { x: b.originX + 0.5 * b.cell, z: b.originZ + (j + 0.5) * b.cell };
  }
  return null;
}

/** Центр клетки глухого фасада первого этажа (стена или окно, но не проём). */
function facadeCell(b) {
  for (let j = 0; j < b.rows; j++) {
    const c = b.levels[0][j][0];
    if (c === WALL || c === WINDOW) return { x: b.originX + 0.5 * b.cell, z: b.originZ + (j + 0.5) * b.cell };
  }
  return null;
}

/** Центр первой клетки верхнего этажа, над которой есть крыша (не проём). */
function roofCell(b) {
  const grid = b.levels[b.floors - 1];
  for (let j = 0; j < b.rows; j++) {
    for (let i = 0; i < b.cols; i++) {
      const c = grid[j][i];
      if (c === VOID || c === HOLE) continue;
      return { x: b.originX + (i + 0.5) * b.cell, z: b.originZ + (j + 0.5) * b.cell };
    }
  }
  return null;
}

/**
 * Шагает по опорным поверхностям от узла до узла шагом 0.5: подъём больше шага
 * или задержка габарита — тупик. Возвращает null, если прошли.
 */
function walkAlong(map, from, to, feet) {
  const len = Math.hypot(to.x - from.x, to.z - from.z);
  const steps = Math.max(1, Math.ceil(len / 0.5));
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

function testContract() {
  const map = makeMap();
  const fields = ['width', 'depth', 'spawn', 'bounds', 'solids'];
  const methods = ['groundHeightAt', 'isBlocked', 'openPositions', 'worldToNormalized',
    'build', 'drawMinimap', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath',
    'randomNavPoint'];
  const missing = [...fields.filter(f => map[f] === undefined),
    ...methods.filter(m => typeof map[m] !== 'function')];
  return {
    name: 'Контракт карты закрыт (движок знает только его члены)',
    passed: missing.length === 0,
    info: missing.length ? `нет членов: ${missing.join(', ')}` : `${fields.length + methods.length} членов на месте`,
  };
}

function testLayout() {
  const map = makeMap();
  const c = map.cfg;
  const extentOk = map.width === c.grid * c.block + (c.grid + 1) * c.street &&
    map.depth === map.width;
  const countOk = map.buildings.length === c.grid * c.grid && map.blocks.length === c.grid * c.grid;
  // дом внутри квартала: от края тротуара отступ не меньше половины заданного
  let insetOk = true;
  for (let n = 0; n < map.buildings.length; n++) {
    const blk = map.blocks[n], b = map.buildings[n], bx = map.boxes[n];
    if (bx.minX < blk.minX + 1 || bx.maxX > blk.maxX - 1 ||
        bx.minZ < blk.minZ + 1 || bx.maxZ > blk.maxZ - 1) insetOk = false;
    if (b.cols * b.cell > c.block - 2 * (c.sidewalk - 1)) insetOk = false;
  }
  const passed = extentOk && countOk && insetOk;
  return {
    name: 'Планировка из данных: размер города, число кварталов и домов, отступ тротуара',
    passed,
    info: `город ${map.width}×${map.depth}, кварталов ${map.blocks.length}, домов ${map.buildings.length}, ` +
      `габарит дома ${map.boxes[0].maxX - map.boxes[0].minX}×${map.boxes[0].maxZ - map.boxes[0].minZ}`,
  };
}

function testBasics() {
  const map = builtMap();
  const passed = map.solids.length > 100 && map.nav.pos.length > 100 &&
    map.surfaces.length > 100 && map.index.size > 0 && !!map.groundPlane;
  return {
    name: 'Каркас построен: солиды, опоры, индексы, граф навигации, плоскость земли',
    passed,
    info: `солидов ${map.solids.length}, опор ${map.surfaces.length}, узлов ${map.nav.pos.length}, ячеек индекса ${map.index.size}`,
  };
}

function testStreetFree() {
  const map = makeMap();
  const s = map.spawn;
  const ground = map.groundHeightAt(s.x, s.z, 0);
  const walkable = !map.isBlocked(s.x, s.z, CONFIG.radius, ground, PLAYER_H);
  const passed = Math.abs(ground) < 0.01 && walkable &&
    Math.abs(s.x) < map.half && Math.abs(s.z) < map.half;
  return {
    name: 'Улица: спавн внутри города, асфальт — опора на нуле, проходимо',
    passed,
    info: `спавн (${s.x}, ${s.z}) y=${ground.toFixed(2)}, свободно=${walkable}`,
  };
}

function testCurb() {
  const map = makeMap();
  const p = sidewalkPoint(map);
  const asphalt = map.groundHeightAt(map.spawn.x, map.spawn.z, 0);
  const stepOver = p.y - asphalt <= STEP;
  const walkable = !map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, PLAYER_H);
  const passed = Math.abs(p.y - map.cfg.curb) < 0.01 && stepOver && walkable && p.outsideHouse;
  return {
    name: 'Тротуар: поднят на бордюр, перешагивается и не считается стеной',
    passed,
    info: `тротуар y=${p.y.toFixed(2)} (бордюр ${map.cfg.curb}), вне дома=${p.outsideHouse}, подъём=${(p.y - asphalt).toFixed(2)}, свободно=${walkable}`,
  };
}

function testWallAndDoor() {
  const map = makeMap();
  const b = map.buildings[0];
  // глухой фасад: тонкая стена обязана держать габарит
  const wall = facadeCell(b);
  const wallHolds = wall && map.isBlocked(wall.x, wall.z, CONFIG.radius, 0, PLAYER_H);
  const door = doorCell(b);
  const doorOpen = !!door && !map.isBlocked(door.x, door.z, CONFIG.radius, 0, PLAYER_H);
  const passed = wallHolds && doorOpen;
  return {
    name: 'Дом: фасадная стена держит габарит, дверной проём свободен',
    passed,
    info: `стена (${wall?.x.toFixed(1)}, ${wall?.z.toFixed(1)}) держит=${wallHolds}, ` +
      `дверь (${door?.x.toFixed(1)}, ${door?.z.toFixed(1)}) свободна=${doorOpen}`,
  };
}

function testPathAtoB() {
  const map = makeMap();
  const path = map.findPath(map.spawn, exitPoint(map));
  const passed = Array.isArray(path) && path.length > 2;
  return {
    name: 'Маршрут от точки A до точки B существует',
    passed,
    info: passed ? `путь из ${path.length} узлов` : 'пути нет — город непроходим',
  };
}

function testPathWalkable() {
  const map = makeMap();
  const path = map.findPath(map.spawn, exitPoint(map));
  if (!Array.isArray(path)) return { name: 'Маршрут главы физически проходим ногами', passed: false, info: 'нет маршрута' };
  let feet = map.groundHeightAt(path[0].x, path[0].z, 0);
  for (let i = 1; i < path.length; i++) {
    const fail = walkAlong(map, path[i - 1], path[i], feet);
    if (fail) {
      return {
        name: 'Маршрут главы физически проходим ногами',
        passed: false,
        info: `тупик на ребре ${i - 1}→${i} в (${fail.x.toFixed(1)}, ${fail.z.toFixed(1)}): ${fail.reason}`,
      };
    }
    feet = map.groundHeightAt(path[i].x, path[i].z, feet);
  }
  return {
    name: 'Маршрут главы физически проходим ногами',
    passed: true,
    info: `${path.length} узлов пройдены пешком без тупика`,
  };
}

function testIntoHouseUpstairs() {
  const map = makeMap();
  const b = map.buildings[0];
  // северный торец марша первого этажа — площадка второго этажа над шахтой
  const i = b.stair.i0, j = b.stair.j1 + 1;
  const to = {
    x: b.originX + (i + 0.5) * b.cell,
    y: b.baseY + CONFIG.building.floorHeight,
    z: b.originZ + (j + 0.5) * b.cell,
  };
  const street = { x: map.spawn.x, y: 0, z: map.spawn.z };
  const path = map.findPath(street, to);
  const last = path ? path[path.length - 1] : null;
  const reached = !!last && Math.hypot(last.x - to.x, last.z - to.z) < b.cell &&
    Math.abs(last.y - to.y) < 0.01;
  return {
    name: 'С улицы есть маршрут в дом и на второй этаж (марш в графе)',
    passed: reached,
    info: reached ? `путь из ${path.length} узлов, финал y=${last.y.toFixed(2)}` : 'в дом или на этаж не попасть',
  };
}

function testRaySolid() {
  const map = builtMap();
  const s = map.spawn;
  const street = map.raySolid(s.x, 6, s.z, 0, -1, 0, 12);
  const b = map.buildings[0];
  const rc = roofCell(b);
  const roofY = b.baseY + b.floors * CONFIG.building.floorHeight;
  const roof = map.raySolid(rc.x, roofY + 6, rc.z, 0, -1, 0, 12);
  const passed = !!street && Math.abs(street.y) < 0.01 && !!roof && Math.abs(roof.y - roofY) < 0.01;
  return {
    name: 'Рейкаст: над улицей — асфальт, над домом — крыша рисованной высоты',
    passed,
    info: `улица y=${street?.y.toFixed(2)}, крыша y=${roof?.y.toFixed(2)} (ожидалось ${roofY})`,
  };
}

function testSpherePushOutOfWall() {
  const map = builtMap();
  const wall = facadeCell(map.buildings[0]);
  const r = CONFIG.alien.radius;
  const c = { x: wall.x, y: CONFIG.building.floorHeight / 2, z: wall.z };
  const moved = map.resolveSphere(c, r);
  const again = map.resolveSphere(c, r); // после выталкивания пересечений быть не должно
  const free = !map.isBlocked(c.x, c.z, r * 0.8, c.y - r, r * 2);
  const passed = moved && !again && free;
  return {
    name: 'Сфера Чужого выталкивается из стены дома и остаётся снаружи',
    passed,
    info: `вытолкнута=${moved}, без повторного выталкивания=${!again}, габарит свободен=${free} (центр ${c.x.toFixed(2)}, ${c.z.toFixed(2)})`,
  };
}

async function testMesh() {
  const map = makeMap();
  const THREE = await import('three');
  const scene = new THREE.Scene();
  map.build(scene);
  let verts = 0, bad = 0, meshes = 0;
  scene.traverse((o) => {
    const p = o.geometry?.attributes?.position;
    if (!p) return;
    meshes++;
    verts += p.count;
    for (let k = 0; k < p.count; k++) {
      if (!Number.isFinite(p.getX(k)) || !Number.isFinite(p.getY(k)) || !Number.isFinite(p.getZ(k))) bad++;
    }
  });
  const passed = meshes >= 4 && bad === 0 && verts > 5000;
  return {
    name: 'Меш города собирается: асфальт, тротуары, дома — вершины конечны',
    passed,
    info: passed ? `${meshes} меш(ей), ${verts} вершин, NaN нет` : `meshes=${meshes}, verts=${verts}, NaN=${bad}`,
  };
}

function testMinimap() {
  const map = makeMap();
  const calls = { rect: 0, text: '' };
  const ctx = {
    fillStyle: '',
    font: '',
    textAlign: '',
    textBaseline: '',
    fillRect: () => { calls.rect++; },
    fillText: (t) => { calls.text = t; },
  };
  const s = map.spawn;
  map.drawMinimap(ctx, 256, { x: s.x, y: 0, z: s.z });
  const streetLabel = calls.text === 'Улица';
  calls.rect = 0;
  const b = map.buildings[1];
  map.drawMinimap(ctx, 256, {
    x: b.originX + b.cols * b.cell / 2, y: CONFIG.building.floorHeight, z: b.originZ + b.rows * b.cell / 2,
  });
  const floorLabel = /^Этаж /.test(calls.text);
  const [u, v] = map.worldToNormalized(s.x, s.z);
  const passed = streetLabel && floorLabel && calls.rect > 0 && u >= 0 && u <= 1 && v >= 0 && v <= 1;
  return {
    name: 'Миникарта: план города, подпись «Улица» и подпись этажа внутри дома',
    passed,
    info: `на улице — «${calls.text}», клеток за последний прогон ${calls.rect}, нормализация (${u.toFixed(2)}, ${v.toFixed(2)})`,
  };
}

function testOpenPositions() {
  const map = makeMap();
  const pts = map.openPositions();
  let bad = 0, noSupport = 0;
  for (const p of pts) {
    if (map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, PLAYER_H)) bad++;
    // точка обязана стоять на своей опоре, а не висеть над ней
    if (Math.abs(map.groundHeightAt(p.x, p.z, p.y) - p.y) > 0.02) noSupport++;
  }
  const passed = pts.length > 50 && bad === 0 && noSupport === 0;
  return {
    name: 'Свободные точки для объектов: не задержаны габаритом и опираются на пол',
    passed,
    info: `точек ${pts.length}, задержанных ${bad}, без опоры ${noSupport}`,
  };
}

function testDeterminism() {
  const a = makeMap();
  const b = makeMap();
  const sameHouses = a.buildings.every((h, n) =>
    h.cols === b.buildings[n].cols && h.rows === b.buildings[n].rows && h.floors === b.buildings[n].floors);
  let sameHeights = true;
  for (const [x, z] of [[-68, -68], [0, 0], [-40, 20], [68, 68]]) {
    if (a.groundHeightAt(x, z, 0) !== b.groundHeightAt(x, z, 0)) sameHeights = false;
  }
  const passed = sameHouses && sameHeights;
  return {
    name: 'Детерминизм: один сид — те же дома и те же высоты опор',
    passed,
    info: passed ? `дома и 4 контрольные точки совпали` : 'дома или опоры разошлись — город не детерминирован',
  };
}

/**
 * Прогоняет тесты города и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export async function runCityTests() {
  const tests = [
    testContract,
    testLayout,
    testBasics,
    testStreetFree,
    testCurb,
    testWallAndDoor,
    testPathAtoB,
    testPathWalkable,
    testIntoHouseUpstairs,
    testRaySolid,
    testSpherePushOutOfWall,
    testMesh,
    testMinimap,
    testOpenPositions,
    testDeterminism,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }); }
  }
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты карты города');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
