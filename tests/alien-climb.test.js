/**
 * Автотесты механики лазания Чужого (Alien).
 *
 * Тесты полностью изолированы от игрового мира: собственный дом генерируется
 * здесь же через generateBuilding + TownMap и собирается в отдельной сцене,
 * поэтому правки карты/улицы в config.js не ломают эти тесты.
 *
 * Тестовый дом: 10×10 клеток по 3 юнита (контур 30×30, центр в начале
 * координат), один этаж высотой 6 → крыша на y = 6, наружная южная грань на
 * z = +15.
 *
 * Запуск в браузере (через MCP или консоль страницы, где есть importmap):
 *   const m = await import('/tests/alien-climb.test.js');
 *   m.runAlienClimbTests();
 *
 * Проверяются сценарии:
 *   1. Чужой залезает на стену (прилипает и лезет вверх);
 *   2. Чужой залезает с земли на крышу;
 *   3. Чужой спускается с крыши обратно на стену;
 *   4. Чужой спускается со стены на землю;
 *   5. Чужой вылезает с потолка верхнего этажа через лаз в крыше на крышу;
 *   6. Чужой спускается с крыши через тот же лаз обратно на потолок;
 *   7. Чужой обходит наружный угол дома по стене: с южной стены перебирается на
 *      смежную восточную через угол и не падает вниз.
 */
import * as THREE from 'three';
import { Alien } from '../src/alien.js';
import { TownMap } from '../src/map.js';
import { generateBuilding } from '../src/building.js';
import { CONFIG } from '../src/config.js';

const DT = 1 / 60;                 // фиксированный шаг физики — тесты детерминированы
const RADIUS = CONFIG.alien.radius; // 0.5
const FLOOR_HEIGHT = 6;
const ROOF_Y = FLOOR_HEIGHT;        // один этаж → верх крыши на y = 6
const WALL_Z = 15;                  // наружная грань южной стены тестового дома

const SLAB = 0.3;                   // толщина перекрытия (как в building.js)
const CEIL_Y = ROOF_Y - SLAB - RADIUS; // центр тела, прилипшего к потолку (5.2)
const ROOF_BODY_Y = ROOF_Y + RADIUS;   // центр тела на крыше (6.5)

/** Параметры тестового дома (не связаны с CONFIG.building.houses). */
export const TEST_BUILDING = {
  cols: 10, rows: 10, cell: 3, floors: 1,
  floorHeight: FLOOR_HEIGHT, stepUp: 0.6, wallThickness: 0.5,
  offsetX: 0, offsetZ: 0,
};

/**
 * Прямоугольный лаз в крыше тестового дома — одна клетка (i=7, j=5).
 * При cell=3 и origin=(-15,-15) ей соответствуют мир x∈[6,9], z∈[0,3].
 */
export const TEST_ROOF_HOLE = { i0: 7, i1: 7, j0: 5, j1: 5 };
const HOLE_X = -15 + (TEST_ROOF_HOLE.i0 + 0.5) * 3;        // центр лаза по X = 7.5
const HOLE_Z_IN = -15 + TEST_ROOF_HOLE.j0 * 3;             // ближний край по Z = 0
const HOLE_Z_OUT = -15 + (TEST_ROOF_HOLE.j1 + 1) * 3;      // дальний край по Z = 3

/** Собирает изолированный тестовый мир. */
function buildTestWorld() {
  const building = generateBuilding({ ...TEST_BUILDING });
  const map = new TownMap([building]);
  map.build(new THREE.Scene()); // сцена-пустышка: тестовая геометрия не попадает в игру
  return { building, map };
}

/** Собирает тестовый мир с прямоугольным лазом в крыше. */
function buildHoleWorld() {
  const building = generateBuilding({ ...TEST_BUILDING, roofHole: TEST_ROOF_HOLE });
  const map = new TownMap([building]);
  map.build(new THREE.Scene());
  return { building, map };
}

function makeAlien(map) {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const dom = document.createElement('canvas');
  return new Alien(camera, dom, map, () => null);
}

/** Ставит Чужого в заданное состояние и нажимает клавиши. */
function placeAlien(alien, opts) {
  const { x, y, z, up, fwd, pitch = 0, keys = ['KeyW'] } = opts;
  alien.pos.set(x, y, z);
  alien.up.set(up[0], up[1], up[2]).normalize();
  alien.fwd.set(fwd[0], fwd[1], fwd[2]);
  alien.pitch = pitch;
  alien.vel.set(0, 0, 0);
  alien.grounded = true;
  alien.leapTimer = 0;
  alien.keys.clear();
  for (const k of keys) alien.keys.add(k);
  alien._replanar();
  alien._updateCamera();
}

/** Прогоняет физику на steps кадров и возвращает телеметрию. */
function simulate(alien, steps) {
  const trace = [];
  for (let i = 0; i < steps; i++) {
    alien.update(DT);
    trace.push({
      t: i,
      x: alien.pos.x, y: alien.pos.y, z: alien.pos.z,
      upX: alien.up.x, upY: alien.up.y, upZ: alien.up.z,
      grounded: alien.grounded,
    });
  }
  return trace;
}

const onWall = s => Math.abs(s.upY) <= 0.5;      // нормаль почти горизонтальна → стоим на стене
const onFlat = s => s.upY >= 0.9;                // нормаль почти вертикальна → пол/крыша/земля
const upStr = s => `(${s.upX.toFixed(2)},${s.upY.toFixed(2)},${s.upZ.toFixed(2)})`;

/** 1. Залезает на стену: прилипает к вертикальной поверхности и лезет вверх. */
function testClimbWall() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, { x: 0, y: RADIUS, z: WALL_Z + 1.5, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0.9 });
  const trace = simulate(alien, 180);

  const attached = trace.find(onWall);
  const climbed = trace.some(s => onWall(s) && s.y > 1.5);
  const top = trace.filter(onWall).reduce((m, s) => Math.max(m, s.y), -Infinity);
  const passed = !!attached && climbed;
  return {
    name: 'Чужой залезает на стену',
    passed,
    info: passed
      ? `прилип на кадре ${attached.t}, поднялся по стене до y=${top.toFixed(2)}`
      : attached
        ? `прилип, но не поднялся (макс. y=${top.toFixed(2)})`
        : 'не прилип к стене за 180 кадров',
  };
}

/** 2. Залезает с земли на крышу через ту же стену. */
function testClimbRoof() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, { x: 0, y: RADIUS, z: WALL_Z + 1.5, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0.9 });
  const trace = simulate(alien, 240);

  const wallIdx = trace.findIndex(onWall);
  const roofIdx = trace.findIndex(s => onFlat(s) && s.y >= ROOF_Y + RADIUS - 0.4);
  const passed = wallIdx >= 0 && roofIdx > wallIdx;
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой залезает с земли на крышу',
    passed,
    info: passed
      ? `встал на крышу на кадре ${roofIdx} (y=${trace[roofIdx].y.toFixed(2)}, up=${upStr(trace[roofIdx])})`
      : `крыша не достигнута; итог y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/** 3. Спускается с крыши на стену (сход через кромку). */
function testRoofToWall() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: 0, y: ROOF_Y + RADIUS, z: WALL_Z - 2.5,
    up: [0, 1, 0], fwd: [0, 0, 1], pitch: 0,
  });
  const trace = simulate(alien, 120);

  const wallIdx = trace.findIndex(s => onWall(s) && s.y < ROOF_Y);
  const passed = wallIdx >= 0;
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой спускается с крыши на стену',
    passed,
    info: passed
      ? `перешёл на стену на кадре ${wallIdx} (y=${trace[wallIdx].y.toFixed(2)}, up=${upStr(trace[wallIdx])})`
      : `остался на крыше; итог y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/** 4. Спускается со стены на землю. */
function testWallToGround() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: 0, y: 3, z: WALL_Z + RADIUS,
    up: [0, 0, 1], fwd: [0, -1, 0], pitch: 0,
  });
  const trace = simulate(alien, 150);

  const startedOnWall = onWall(trace[0]);
  const groundIdx = trace.findIndex(s => onFlat(s) && Math.abs(s.y - RADIUS) <= 0.15);
  const passed = startedOnWall && groundIdx >= 0;
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой спускается со стены на землю',
    passed,
    info: passed
      ? `встал на землю на кадре ${groundIdx} (y=${trace[groundIdx].y.toFixed(2)}, up=${upStr(trace[groundIdx])})`
      : `не добрался до земли; итог y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 5. Вылезает с потолка через лаз в крыше на крышу. Тело ползёт по низу
 * перекрытия (up = −Y) к проёму и должно оказаться на крыше (up = +Y).
 */
function testCeilToRoof() {
  const { map } = buildHoleWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: HOLE_X, y: CEIL_Y, z: HOLE_Z_IN - 2.5,
    up: [0, -1, 0], fwd: [0, 0, 1], pitch: 0,
  });
  const trace = simulate(alien, 150);

  const startedOnCeil = trace[0].upY <= -0.9;
  const roofIdx = trace.findIndex(s => s.upY >= 0.9 && Math.abs(s.y - ROOF_BODY_Y) <= 0.3);
  const passed = startedOnCeil && roofIdx > 0;
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой вылезает с потолка через лаз на крышу',
    passed,
    info: passed
      ? `оказался на крыше на кадре ${roofIdx} (y=${trace[roofIdx].y.toFixed(2)}, up=${upStr(trace[roofIdx])})`
      : `не вышел на крышу; итог y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 6. Спускается с крыши через лаз обратно на потолок. Тело ползёт по крыше
 * (up = +Y) к проёму и должно оказаться на низу перекрытия (up = −Y).
 */
function testRoofToCeil() {
  const { map } = buildHoleWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: HOLE_X, y: ROOF_BODY_Y, z: HOLE_Z_OUT + 2.5,
    up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0,
  });
  const trace = simulate(alien, 150);

  const startedOnRoof = trace[0].upY >= 0.9;
  const ceilIdx = trace.findIndex(s => s.upY <= -0.9 && Math.abs(s.y - CEIL_Y) <= 0.3);
  const passed = startedOnRoof && ceilIdx > 0;
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой спускается с крыши через лаз на потолок',
    passed,
    info: passed
      ? `оказался на потолке на кадре ${ceilIdx} (y=${trace[ceilIdx].y.toFixed(2)}, up=${upStr(trace[ceilIdx])})`
      : `не спустился на потолок; итог y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 7. Обходит наружный угол дома по стене. Тело ползёт по южной стене вдоль неё
 * к восточному углу дома; дойдя до торца стены, должно перебраться на смежную
 * восточную стену (перпендикулярную) и не упасть на землю.
 */
function testWallCornerWrap() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: 11, y: 4, z: WALL_Z + RADIUS,   // середина высоты южной стены, южнее угла
    up: [0, 0, 1], fwd: [1, 0, 0], pitch: 0, // взгляд на восток → движение вдоль стены к углу
  });
  const trace = simulate(alien, 150);

  const startedOnSouth = onWall(trace[0]) && trace[0].upZ > 0.7;
  const eastIdx = trace.findIndex(s => onWall(s) && s.upX > 0.7); // стоим на восточной стене
  const minY = trace.reduce((m, s) => Math.min(m, s.y), Infinity);
  const passed = startedOnSouth && eastIdx > 0 && minY > 3; // до земли не сполз
  const last = trace[trace.length - 1];
  return {
    name: 'Чужой обходит наружный угол дома по стене',
    passed,
    info: passed
      ? `перешёл на смежную стену на кадре ${eastIdx} (x=${trace[eastIdx].x.toFixed(2)}, ` +
        `up=${upStr(trace[eastIdx])}), минимум y=${minY.toFixed(2)}`
      : `не перебрался на смежную стену; итог x=${last.x.toFixed(2)}, y=${last.y.toFixed(2)}, ` +
        `up=${upStr(last)}, минимум y=${minY.toFixed(2)}`,
  };
}

/**
 * Прогоняет все тесты лазания и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runAlienClimbTests() {
  const tests = [
    testClimbWall, testClimbRoof, testRoofToWall, testWallToGround,
    testCeilToRoof, testRoofToCeil, testWallCornerWrap,
  ];
  const results = tests.map(fn => {
    try { return fn(); }
    catch (e) { return { name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }; }
  });
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты лазания Чужого');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
