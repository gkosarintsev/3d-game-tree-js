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
 *  2b. Перевал на крышу оставляет тело на крыше и ведёт внутрь дома (взгляд
 *      переносится поворотом корпуса, а не сохраняется в мире);
 *  2c. Тот же перевал не доворачивает корпус вокруг вертикали мира: курс идёт
 *      вдоль подъёма, единственный разворот — тангаж;
 *   3. Чужой спускается с крыши обратно на стену;
 *   4. Чужой спускается со стены на землю;
 *   5. Чужой вылезает с потолка верхнего этажа через лаз в крыше на крышу;
 *  5b. Плоскость перевала сквозь лаз содержит направление бега: горизонтальная
 *      проекция нормали идёт вдоль бега, а голова в середине дуги смотрит вверх
 *      (бочка вокруг линии взгляда — старая вырожденная ось (0,0,−1));
 *   6. Чужой спускается с крыши через тот же лаз обратно на потолок;
 *   7. Чужой обходит наружный угол дома по стене: с южной стены перебирается на
 *      смежную восточную через угол и не падает вниз;
 *   8. Прыжок вплотную к стене останавливается и прилипает, не пробивая фасад;
 *   9. Прыжок сквозь врага ранит его слегка (config.alien.leap), а не убивает сразу;
 *  10. Падение с большой высоты на крышу не пробивает перекрытие (подшаги);
 *  11. Урон, регенерация и смерть: хп не уходит ниже нуля, мёртвого не ранят;
 *  12. Сквозной проход по НАСТОЯЩЕМУ лазу (лестничная шахта 2×5 клеток) вдоль
 *      длинной оси: с потолка верхнего этажа на крышу;
 *  13. То же обратно: с крыши через шахту на потолок;
 *  14. «Пробел» по взгляду на стену: со земли прыжок доводит до стены и прилипает;
 *  15. «Пробел» несёт вперёд (а не только вверх) и не повторяется при удержании;
 *  16. Удар рукой по ЛКМ снимает config.alien.strike.damage и даёт отметку на HUD;
 *  17. Удар рукой не проходит сквозь стену и не бьёт дальше досягаемости;
 *  18. Между ударами есть пауза: второй замах сразу не проходит.
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

function makeAlien(map, getEnemies, onHit) {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const dom = document.createElement('canvas');
  return new Alien(camera, dom, map, getEnemies || (() => null), onHit || null);
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
  // состояние ввода/удара обнуляем: тесты обязаны стартовать одинаково,
  // даже если предыдущий тест оставил невзыгранную паузу между замахами
  alien.strikeCd = 0;
  alien.strikeAnim = 0;
  alien._spaceHeld = false;
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

/**
 * Прогоняет кадры и оставляет только те, где тело шло плавным переходом
 * (`_tween` активен ДО шага — последний кадр перехода ещё считается переходным).
 * Собирает полную рамку тела, потому что мерить надо плоскость вращения, а не
 * только нормаль.
 */
function simulateTransition(alien, steps) {
  const trace = [];
  for (let i = 0; i < steps; i++) {
    const inTween = !!alien._tween;
    alien.update(DT);
    if (!inTween) continue;
    trace.push({
      t: i,
      x: alien.pos.x, y: alien.pos.y, z: alien.pos.z,
      up: alien.up.clone(), fwd: alien.fwd.clone(),
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
 * 8. Прыжок вплотную к стене: удар в преграду должен останавливать полёт и
 * прилипать к стене, а не проносить тело сквозь фасад.
 */
function testLeapSticksToWall() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: 0, y: RADIUS, z: WALL_Z + 3, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
  });
  alien._leap(); // прыжок в сторону стены
  const trace = simulate(alien, 90);

  const stuck = trace.some(s => onWall(s) && s.upZ > 0.7);   // прилип к южной стене
  const noTunnel = trace.every(s => s.z > WALL_Z);           // сквозь дом не пролетел
  const passed = stuck && noTunnel;
  const last = trace[trace.length - 1];
  return {
    name: 'Прыжок в стену останавливается и прилипает',
    passed,
    info: passed
      ? `прилип к стене (итог z=${last.z.toFixed(2)}, up=${upStr(last)})`
      : `не прилип или пробил стену; итог z=${last.z.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 9. Прыжок сквозь врага ранит его слегка: здоровье снимается ровно на
 * config.alien.leap.damage (и только один раз за прыжок), это меньше урона
 * выстрела человека, а смерть наступает только после полного курса прыжков.
 */
function testLeapHurtsEnemy() {
  const { map } = buildTestWorld();
  const D = CONFIG.alien.leap.damage;
  const hitsToKill = Math.ceil(CONFIG.enemies.health / D);
  const enemy = {
    dead: false,
    health: CONFIG.enemies.health,
    position: new THREE.Vector3(0, 0.9, WALL_Z + 6),
    takeDamage(n) { this.health -= n; if (this.health <= 0) this.dead = true; },
  };
  const alien = makeAlien(map, () => ({ items: [enemy] }));

  // один прыжок в сторону врага
  const leapAtEnemy = () => {
    placeAlien(alien, {
      x: 0, y: RADIUS, z: WALL_Z + 10, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
    });
    alien._leap();
    simulate(alien, 40);
  };

  leapAtEnemy();
  const hurtOnce = !enemy.dead && enemy.health === CONFIG.enemies.health - D;
  leapAtEnemy();
  const hurtTwice = !enemy.dead && enemy.health === CONFIG.enemies.health - 2 * D;
  for (let i = 2; i < hitsToKill; i++) leapAtEnemy();
  const deadAfter = enemy.dead;

  const small = D < CONFIG.weapon.damage;
  const passed = hurtOnce && hurtTwice && deadAfter && small;
  return {
    name: 'Прыжок ранит врага слегка и только один раз за прыжок',
    passed,
    info: passed
      ? `прыжок даёт ${D} (выстрел человека ${CONFIG.weapon.damage}): ` +
        `после 1 хп=${CONFIG.enemies.health - D}, мёртв после ${hitsToKill}`
      : `1 прыжок: хп=${enemy.health}, жив=${!enemy.dead}; урон ровно за один раз=${hurtOnce}; ` +
        `малый урон=${small}`,
  };
}

/**
 * 10. Падение с большой высоты на крышу. Скорость к моменту удара ~38 ед/с,
 * перекрытие толщиной 0.3 — без подшагов тело пробило бы плиту насквозь.
 */
function testRoofStopsFall() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, { x: 0, y: 40, z: 0, up: [0, 1, 0], fwd: [0, 0, 1], pitch: 0, keys: [] });
  alien.grounded = false; // падаем с высоты
  const trace = simulate(alien, 120);

  const minY = trace.reduce((m, s) => Math.min(m, s.y), Infinity);
  const landed = trace.some(s => onFlat(s) && Math.abs(s.y - ROOF_BODY_Y) <= 0.3);
  const passed = landed && minY > ROOF_Y - 0.1; // сквозь крышу не пролетел
  const last = trace[trace.length - 1];
  return {
    name: 'Падение с высоты останавливает крыша (подшаги)',
    passed,
    info: passed
      ? `приземлился на крышу (y=${last.y.toFixed(2)}), минимум y=${minY.toFixed(2)}`
      : `не остановился на крыше; итог y=${last.y.toFixed(2)}, минимум y=${minY.toFixed(2)}`,
  };
}

/** 11. Урон, регенерация и смерть: хп не уходит ниже нуля, мёртвого не ранят. */
function testDamageAndRegen() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);

  alien.takeDamage(30);
  const hurtApplied = Math.abs(alien.health - (alien.maxHealth - 30)) < 1e-6;

  alien.health = 10;
  alien._lastDamage = -1e9;   // затишье заведомо прошло
  alien._regen(1);            // dt = 1 c
  const regenerated = Math.abs(alien.health - (10 + CONFIG.health.regenRate)) < 1e-6;
  const hurtDecayed = alien.hurt === 0;

  alien.takeDamage(1000);
  const dead = alien.dead && alien.health === 0;
  alien.takeDamage(50);       // по мёртвому урон не проходит
  const ignoreAfterDeath = alien.health === 0 && alien.dead;

  const passed = hurtApplied && regenerated && hurtDecayed && dead && ignoreAfterDeath;
  return {
    name: 'Урон, регенерация и смерть Чужого',
    passed,
    info: passed
      ? 'урон снят, регенерация сработала, смерть необратима'
      : `урон=${hurtApplied}, регенерация=${regenerated}, затухание=${hurtDecayed}, ` +
        `смерть=${dead}, игнор после смерти=${ignoreAfterDeath}`,
  };
}

/**
 * Дом в два этажа: в перекрытии верхнего этажа остаётся НАСТОЯЩИЙ сквозной лаз —
 * лестничная шахта (2 клетки в ширину, 5 в длину), а не искусственная дырка 1×1.
 * Возвращает её координаты: длинная ось лаза идёт по Z и равна 15 юнитам.
 */
function buildShaftWorld() {
  const building = generateBuilding({ ...TEST_BUILDING, floors: 2 });
  const map = new TownMap([building]);
  map.build(new THREE.Scene());
  const cell = building.cell;
  const s = building.stair;
  return {
    map,
    holeX: building.originX + (s.i0 + 0.5) * cell,   // центр клетки шахты по X
    holeZIn: building.originZ + s.j0 * cell,         // ближний край лаза по Z
    roofY: 2 * FLOOR_HEIGHT,                         // верх крыши = 12
  };
}

/**
 * 12. С потолка верхнего этажа через настоящую шахту на крышу, двигаясь вдоль
 * её длинной оси (15 юнитов). Именно этот случай ломался: поиск дальнего края
 * проёма ограничивался 7 юнитами, до края не доставал и Чужой падал в шахту.
 */
function testShaftHoleToRoof() {
  const w = buildShaftWorld();
  const alien = makeAlien(w.map);
  const ceilY = w.roofY - SLAB - RADIUS;
  const roofBodyY = w.roofY + RADIUS;
  placeAlien(alien, {
    x: w.holeX, y: ceilY, z: w.holeZIn - 2, up: [0, -1, 0], fwd: [0, 0, 1],
  });

  // Идём, пока не окажемся на крыше (дальше Чужой просто уйдёт с её края).
  let minY = Infinity;
  let reachedRoof = false;
  for (let i = 0; i < 150 && !reachedRoof; i++) {
    alien.update(DT);
    minY = Math.min(minY, alien.pos.y);
    if (alien.up.y >= 0.9 && Math.abs(alien.pos.y - roofBodyY) <= 0.4) reachedRoof = true;
  }
  const noFall = minY > ceilY - 0.3; // не провалился в шахту
  const passed = reachedRoof && noFall;
  return {
    name: 'С потолка через настоящую шахту на крышу (длинная ось)',
    passed,
    info: passed
      ? `вылез на крышу (y=${roofBodyY.toFixed(2)})`
      : `не вылез: минимум y=${minY.toFixed(2)}, итог y=${alien.pos.y.toFixed(2)}`,
  };
}

/** 13. Обратно: с крыши через ту же шахту на потолок верхнего этажа. */
function testShaftHoleToCeiling() {
  const w = buildShaftWorld();
  const alien = makeAlien(w.map);
  const ceilY = w.roofY - SLAB - RADIUS;
  placeAlien(alien, {
    x: w.holeX, y: w.roofY + RADIUS, z: w.holeZIn - 2, up: [0, 1, 0], fwd: [0, 0, 1],
  });

  let minY = Infinity;
  let reachedCeiling = false;
  for (let i = 0; i < 150 && !reachedCeiling; i++) {
    alien.update(DT);
    minY = Math.min(minY, alien.pos.y);
    if (alien.up.y <= -0.9 && Math.abs(alien.pos.y - ceilY) <= 0.4) reachedCeiling = true;
  }
  const noFall = minY > ceilY - 0.3; // не провалился на нижние этажи
  const passed = reachedCeiling && noFall;
  return {
    name: 'С крыши через настоящую шахту на потолок (длинная ось)',
    passed,
    info: passed
      ? `спустился на потолок (y=${ceilY.toFixed(2)})`
      : `не спустился: минимум y=${minY.toFixed(2)}, итог y=${alien.pos.y.toFixed(2)}`,
  };
}

/**
 * 14. «Пробел» по взгляду на стену: Чужой стоит на земле и смотрит прямо на
 * стену дома, по нажатию прыжка летит вперёд и прилипает к стене, оставаясь на
 * ней (не сползает обратно на землю).
 */
function testLeapOntoWallFromGround() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: 0, y: RADIUS, z: WALL_Z + 5, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
  });

  alien._leap(); // прыжок в сторону взгляда (в игре — «пробел»)
  const trace = simulate(alien, 90);

  const stickIdx = trace.findIndex(s => onWall(s) && s.upZ > 0.7); // прилип к южной стене
  const last = trace[trace.length - 1];
  const stayedOnWall = onWall(last) && last.upZ > 0.7 && last.y > RADIUS + 1;
  const passed = stickIdx >= 0 && trace[stickIdx].y > RADIUS + 1 && stayedOnWall;
  return {
    name: 'Прыжок на стену по «пробелу»: прилипает и остаётся на ней',
    passed,
    info: passed
      ? `прилип к стене на кадре ${stickIdx} (y=${trace[stickIdx].y.toFixed(2)}), ` +
        `остался на ней (y=${last.y.toFixed(2)}, up=${upStr(last)})`
      : `не прилип; итог z=${last.z.toFixed(2)}, y=${last.y.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 15. Прыжок по «пробелу» несёт вперёд, а не только вверх, и берётся один раз:
 * удержание клавиши не должно превращать каждое приземление в новый прыжок.
 */
function testSpaceLeapForward() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  // Дом занимает x∈[-15,15] — встаем снаружи, чтобы в полёте не мешала стена.
  placeAlien(alien, {
    x: 25, y: RADIUS, z: 25, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: ['Space'],
  });

  let leaps = 0;          // сколько раз взводился таймер прыжка
  let prevTimer = 0;
  let maxY = alien.pos.y;
  for (let i = 0; i < 200; i++) {
    alien.update(DT);     // «пробел» держим всё это время
    if (alien.leapTimer > prevTimer) leaps++;
    prevTimer = alien.leapTimer;
    maxY = Math.max(maxY, alien.pos.y);
  }

  const travelled = 25 - alien.pos.z; // смещение вдоль fwd
  const rise = maxY - RADIUS;
  const passed = leaps === 1 && travelled >= 8 && rise >= 1.5;
  return {
    name: 'Прыжок по «пробелу» летит вперёд и не повторяется при удержании',
    passed,
    info: passed
      ? `пролетел ${travelled.toFixed(2)} юнита, поднялся на ${rise.toFixed(2)}, отрывов ${leaps}`
      : `пролетел ${travelled.toFixed(2)}, поднялся на ${rise.toFixed(2)}, отрывов ${leaps} (нужен 1)`,
  };
}

/**
 * Враг для тестов удара: только интерфейс, который использует Alien._strike, —
 * позиция, хп и габариты поражения.
 */
function makeFakeEnemy(x, y, z) {
  return {
    dead: false,
    health: CONFIG.enemies.health,
    position: new THREE.Vector3(x, y, z),
    hitOffsetY: 1.0,
    hitRadius: 1.0,
    takeDamage(n) { this.health -= n; if (this.health <= 0) this.dead = true; },
  };
}

/**
 * Заглушка менеджера врагов: тот же raycast(луч × сфера корпуса), что у
 * Enemies, но без сцены. Дополнительно запоминает дальность, которой его
 * ограничил удар, — так видно, что луч упирается в стену, а не летит сквозь неё.
 */
function makeTargetManager(...enemies) {
  const ray = new THREE.Ray();
  const sphere = new THREE.Sphere();
  const point = new THREE.Vector3();
  const manager = {
    items: enemies,
    maxDistAsked: Infinity,
    raycast(origin, direction, maxDist) {
      manager.maxDistAsked = maxDist;
      ray.origin.copy(origin);
      ray.direction.copy(direction);
      let best = null;
      for (const e of enemies) {
        if (e.dead) continue;
        sphere.center.set(e.position.x, e.position.y + e.hitOffsetY, e.position.z);
        sphere.radius = e.hitRadius;
        const p = ray.intersectSphere(sphere, point);
        if (!p) continue;
        const d = origin.distanceTo(p);
        if (d > maxDist) continue;
        if (!best || d < best.distance) best = { enemy: e, distance: d };
      }
      return best;
    },
  };
  return manager;
}

/**
 * 16. Удар рукой по ЛКМ: враг в досягаемости получает config.alien.strike.damage
 * (это основной урон Чужого — больше прыжка) и срабатывает отметка попадания.
 */
function testStrikeDamagesInRange() {
  const { map } = buildTestWorld();
  const near = makeFakeEnemy(25, 0.4, 23.4);  // ~1.6 юнита впереди взгляда
  const manager = makeTargetManager(near);
  let marks = 0;
  const alien = makeAlien(map, () => manager, () => { marks++; });
  placeAlien(alien, {
    x: 25, y: RADIUS, z: 25, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
  });

  const swung = alien._strike();
  const hurt = near.health === CONFIG.enemies.health - CONFIG.alien.strike.damage;
  const passed = swung && hurt && marks === 1;
  return {
    name: 'Удар рукой по ЛКМ ранит врага в досягаемости',
    passed,
    info: passed
      ? `хп=${near.health} (удар ${CONFIG.alien.strike.damage}), отметок попадания ${marks}`
      : `замах=${swung}, хп=${near.health} (ожидалось ${CONFIG.enemies.health - CONFIG.alien.strike.damage}), отметок=${marks}`,
  };
}

/**
 * 17. Удар короткий и честный: дальше strike.reach рука не бьёт, а стена
 * ограничивает луч — враг за стеной не получает урона, хотя стоит ближе reach.
 */
function testStrikeLimits() {
  const { map } = buildTestWorld();
  const far = makeFakeEnemy(0, 0.4, WALL_Z + 10); // в 15 юнитах впереди — дальше reach
  const manager = makeTargetManager(far);
  const alien = makeAlien(map, () => manager);
  placeAlien(alien, {
    x: 0, y: RADIUS, z: WALL_Z + 25, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
  });
  alien._strike();
  const outOfReach = far.health === CONFIG.enemies.health
    && manager.maxDistAsked <= CONFIG.alien.strike.reach + 1e-6;

  // враг за западным фасадом дома (сплошной участок стены, z∈[-12,-9]): корпус в
  // 2.1 юнитах от глаз — без учёта стены рука достала бы его, но луч обрывается
  // фасадом на 0.6 юнита
  const behind = makeFakeEnemy(-12.5, 0.4, -10.5);
  const wallManager = makeTargetManager(behind);
  const alien2 = makeAlien(map, () => wallManager);
  placeAlien(alien2, {
    x: -15.6, y: RADIUS, z: -10.5, up: [0, 1, 0], fwd: [1, 0, 0], pitch: 0, keys: [],
  });
  alien2._strike();
  const blockedByWall = behind.health === CONFIG.enemies.health
    && wallManager.maxDistAsked < CONFIG.alien.strike.reach;

  const passed = outOfReach && blockedByWall;
  return {
    name: 'Удар руки не бьёт дальше досягаемости и не проходит сквозь стену',
    passed,
    info: passed
      ? `дальний цел не задет (луч ≤ ${manager.maxDistAsked.toFixed(2)}), за стеной цел не задет (луч ${wallManager.maxDistAsked.toFixed(2)} < ${CONFIG.alien.strike.reach})`
      : `дальний=${far.health}, луч ${manager.maxDistAsked.toFixed(2)}; за стеной=${behind.health}, луч ${wallManager.maxDistAsked.toFixed(2)}`,
  };
}

/**
 * 18. Пауза между ударами: второй замах сразу не проходит, а после
 * config.alien.strike.cooldown — снова работает.
 */
function testStrikeCooldown() {
  const { map } = buildTestWorld();
  const enemy = makeFakeEnemy(0, 0.4, WALL_Z + 6);
  const manager = makeTargetManager(enemy);
  const alien = makeAlien(map, () => manager);
  placeAlien(alien, {
    x: 0, y: RADIUS, z: WALL_Z + 7.4, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0, keys: [],
  });

  const first = alien._strike();
  const second = alien._strike();  // сразу — отказ
  const oneHit = enemy.health === CONFIG.enemies.health - CONFIG.alien.strike.damage;

  for (let i = 0; i < Math.ceil(CONFIG.alien.strike.cooldown / DT) + 2; i++) alien.update(DT);
  const third = alien._strike();
  const twoHits = enemy.health === CONFIG.enemies.health - 2 * CONFIG.alien.strike.damage;

  const passed = first && !second && oneHit && third && twoHits;
  return {
    name: 'Второй удар сразу не проходит, после паузы — проходит',
    passed,
    info: passed
      ? `пауза ${CONFIG.alien.strike.cooldown} с: 1-й замах=${first}, 2-й=${second}, 3-й=${third}, хп=${enemy.health}`
      : `замахи ${first}/${second}/${third}, хп=${enemy.health} (ожидалось ${CONFIG.enemies.health - 2 * CONFIG.alien.strike.damage})`,
  };
}

/**
 * 2b. Перевал на крышу разворачивает корпус внутрь строения. Наклон взгляда,
 * нужный для подъёма (pitch > climbPitch), на стене откинут вдоль нормали стены
 * — наружу. Если при перевале сохранить эту линию взгляда в мире, на крыше
 * «вперёд» смотрит ОТ здания, и с зажатой «вперёд» Чужой сходит с только что
 * взятой кромки и сползает назад по стене: на башнях с уступами подъём обрывается
 * на каждой полке. Проверяем, что после перевала тело удержало крышу и ушло вглубь
 * дома.
 */
function testMantleKeepsRoof() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, { x: 0, y: RADIUS, z: WALL_Z + 1.5, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0.9 });
  const trace = simulate(alien, 240);

  const roofIdx = trace.findIndex(s => onFlat(s) && s.y >= ROOF_Y + RADIUS - 0.4);
  const last = trace[trace.length - 1];
  const flatTail = trace.slice(-60).filter(onFlat).length;
  const inward = last.z < WALL_Z - 1; // ушёл вглубь дома, а не за кромку
  const passed = roofIdx >= 0 && flatTail >= 55 && Math.abs(last.y - ROOF_BODY_Y) <= 0.3 && inward;
  return {
    name: 'Перевал на крышу оставляет тело на крыше и ведёт внутрь дома',
    passed,
    info: passed
      ? `крыша с кадра ${roofIdx}, из последних 60 кадров на крыше ${flatTail}, итог y=${last.y.toFixed(2)}, z=${last.z.toFixed(2)} (фасад на ${WALL_Z})`
      : `крыша с кадра ${roofIdx}, из последних 60 на крыше ${flatTail}, итог y=${last.y.toFixed(2)}, z=${last.z.toFixed(2)}, up=${upStr(last)}`,
  };
}

/**
 * 5b. Перевал сквозь лаз вращается в плоскости направления бега. Старая
 * реализация строила всю ориентацию одним `setFromUnitVectors(fromUp, toUp)`, и
 * при антипараллельных нормах (потолок ↔ кровля) Three.js брал вырожденную ось
 * `(0,0,−1)` — мировую Z. Чужой бежит к лазу именно вдоль Z, поэтому ось
 * совпадала с линией взгляда и перевал читался бочкой: нормаль уходила вбок (по
 * X), а «вперёд» оставалось горизонтальным. Мерим признаки честного перевала:
 * горизонтальная проекция нормали остаётся вдоль бега, в середине дуги голова
 * смотрит вверх, на новую опору. Третье — итог: дуга через кромку разворачивает
 * «вперёд» против бега, и с зажатой «вперёд» тело тут же вернулось бы в лаз
 * назад; переход обязан довернуть корпус по ходу, а не оставить его задом наперёд.
 */
function testHoleSweepFollowsRun() {
  const { map } = buildHoleWorld();
  const alien = makeAlien(map);
  placeAlien(alien, {
    x: HOLE_X, y: CEIL_Y, z: HOLE_Z_IN - 2.5, up: [0, -1, 0], fwd: [0, 0, 1], pitch: 0,
  });
  const tw = simulateTransition(alien, 150);

  let sideways = 0;   // доля X в горизонтальной проекции нормали (у бочки → 1)
  let headUp = -1;    // сколько раз корпус смотрел «вверх» по ходу дуги
  for (const s of tw) {
    const lat = Math.abs(s.up.x);
    const hor = Math.hypot(s.up.x, s.up.z);
    if (hor > 0.15) sideways = Math.max(sideways, lat / hor);
    headUp = Math.max(headUp, s.fwd.y);
  }

  // «вперёд» удерживается: тело должно уйти с лаза, а не перевернуться обратно
  const tail = simulate(alien, 90);
  const fellBack = tail.some(s => s.upY <= -0.9);
  const along = alien.fwd.z;

  const passed = tw.length >= 3 && sideways <= 0.35 && headUp >= 0.5
    && !fellBack && along > 0.5;
  return {
    name: 'Перевал сквозь лаз идёт в плоскости бега и оставляет курс по ходу',
    passed,
    info: passed
      ? `${tw.length} кадров перехода, максимум боковой доли нормали ${sideways.toFixed(2)}, ` +
        `голова поднималась до fwd.y=${headUp.toFixed(2)}, итог fwd.z=${along.toFixed(2)}, ` +
        `z=${alien.pos.z.toFixed(2)} (лаз на ${HOLE_Z_IN}…${HOLE_Z_OUT})`
      : `${tw.length} кадров перехода, боковая доля ${sideways.toFixed(2)} (нужно ≤ 0.35), ` +
        `fwd.y вверх ${headUp.toFixed(2)} (нужно ≥ 0.5), итог fwd.z=${along.toFixed(2)} ` +
        `(нужно > 0.5), вернулся на потолок: ${fellBack}`,
  };
}

/**
 * 2c. Перевал со стены на крышу не доворачивает корпус вокруг вертикали мира.
 * Ось дуги — касательная кромки, поэтому горизонтальное «вперёд» идёт вдоль
 * подъёма всё время перехода; единственный разрешённый разворот — тангаж. Прыжок
 * курса на одном кадре даёт ровно то «поворот вбок», который видно на косом
 * фасаде, если взгляд в середине дуги стал параллельно нормали (старый путь
 * бросал «вперёд» на мировую ось через `_replanar`).
 */
function testMantleKeepsHeading() {
  const { map } = buildTestWorld();
  const alien = makeAlien(map);
  placeAlien(alien, { x: 0, y: RADIUS, z: WALL_Z + 1.5, up: [0, 1, 0], fwd: [0, 0, -1], pitch: 0.9 });
  const tw = simulateTransition(alien, 240);

  const yawOf = v => Math.atan2(v.x, -v.z); // курс в мире: −Z = 0
  let jump = 0;
  let prev = null;
  for (const s of tw) {
    if (Math.hypot(s.fwd.x, s.fwd.z) < 0.25) { prev = null; continue; } // курс не определён в вертикальной стойке
    const y = yawOf(s.fwd);
    if (prev !== null) {
      let d = Math.abs(y - prev);
      if (d > Math.PI) d = 2 * Math.PI - d;
      jump = Math.max(jump, d);
    }
    prev = y;
  }
  // итоговый курс после выхода на крышу — внутрь дома (−Z), как и подъём
  simulate(alien, 60);
  const inward = alien.fwd.z < -0.2;
  const passed = tw.length >= 3 && jump <= 0.3 && inward;
  return {
    name: 'Перевал со стены на крышу не доворачивает корпус вокруг вертикали',
    passed,
    info: passed
      ? `${tw.length} кадров перехода, максимальный скачок курса за кадр ${jump.toFixed(2)} рад, ` +
        `итог fwd=(${alien.fwd.x.toFixed(2)},0,${alien.fwd.z.toFixed(2)})`
      : `скачок курса ${jump.toFixed(2)} рад за кадр (нужно ≤ 0.3), кадров ${tw.length}, ` +
        `итог fwd=(${alien.fwd.x.toFixed(2)},0,${alien.fwd.z.toFixed(2)}), внутрь=${inward}`,
  };
}

/**
 * Прогоняет все тесты лазания и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runAlienClimbTests(arg) {
  const filter = parseLevelFilter(arg);
  if (filter) return SKIPPED;
  const tests = [
    testClimbWall, testClimbRoof, testMantleKeepsRoof, testMantleKeepsHeading,
    testRoofToWall, testWallToGround,
    testCeilToRoof, testRoofToCeil, testHoleSweepFollowsRun, testWallCornerWrap,
    testLeapSticksToWall, testLeapHurtsEnemy, testRoofStopsFall, testDamageAndRegen,
    testShaftHoleToRoof, testShaftHoleToCeiling,
    testLeapOntoWallFromGround, testSpaceLeapForward,
    testStrikeDamagesInRange, testStrikeLimits, testStrikeCooldown,
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
