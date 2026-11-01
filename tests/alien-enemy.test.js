/**
 * Автотесты врагов-Чужих (AlienEnemy) — подвижных противников, которые
 * используют ту же физику лазания, что и играбельный Чужой: прилипают к
 * стенам/потолкам и атакуют прыжком в упор.
 *
 * Тесты изолированы от игрового мира: собственный дом генерируется здесь же
 * через generateBuilding + TownMap и собирается в отдельной сцене. Игрок
 * подменяется минимальной заглушкой (position, dead, takeDamage), поэтому
 * тесты не зависят от реализаций Player/Alien.
 *
 * Тестовый дом: 10×10 клеток по 3 юнита (контур 30×30, центр в начале
 * координат), один этаж высотой 6 → крыша на y = 6, наружная южная грань на
 * z = +15.
 *
 * Запуск в браузере (через MCP или консоль страницы, где есть importmap):
 *   const m = await import('/tests/alien-enemy.test.js');
 *   m.runAlienEnemyTests();
 *
 * Проверяются сценарии:
 *   1. Менеджер врагов создаёт нескольких Чужих рядом с людьми-врагами;
 *   2. Враг-Чужой сам залезает по стене дома (полное 3D-лазание);
 *   3. Враг-Чужой прыгает в упор на игрока и наносит ему урон;
 *   4. Враг-Чужой получает урон, умирает и возрождается;
 *   5. Скачок играбельного Чужого ранит врага-Чужого (тот же интерфейс).
 */
import * as THREE from 'three';
import { Enemy, Enemies, AlienEnemy } from '../src/enemies.js';
import { Alien } from '../src/alien.js';
import { TownMap } from '../src/map.js';
import { generateBuilding } from '../src/building.js';
import { CONFIG } from '../src/config.js';

const DT = 1 / 60;                    // фиксированный шаг физики — тесты детерминированы
const RADIUS = CONFIG.alien.radius;   // 0.5
const FLOOR_HEIGHT = 6;
const ROOF_Y = FLOOR_HEIGHT;          // один этаж → верх крыши на y = 6
const WALL_Z = 15;                    // наружная грань южной стены тестового дома

const TEST_BUILDING = {
  cols: 10, rows: 10, cell: 3, floors: 1,
  floorHeight: FLOOR_HEIGHT, stepUp: 0.6, wallThickness: 0.5,
  offsetX: 0, offsetZ: 0,
};

/** Собирает изолированный тестовый мир (дом + карта в отдельной сцене). */
function buildTestWorld() {
  const building = generateBuilding({ ...TEST_BUILDING });
  const map = new TownMap([building]);
  map.build(new THREE.Scene());
  return { building, map };
}

/** Заглушка игрока: то, что нужно восприятию и прыжку врага-Чужего. */
function makeFakePlayer(pos) {
  return {
    position: pos.clone(),
    feetY: pos.y - CONFIG.eyeHeight,
    maxHealth: CONFIG.health.max,
    health: CONFIG.health.max,
    hurt: 0,
    dead: false,
    takeDamage(n) {
      if (this.dead) return;
      this.health = Math.max(0, this.health - n);
      this.hurt = 1;
      if (this.health <= 0) this.dead = true;
    },
  };
}

function makeCamera() {
  return new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
}

const TRACERS = { spawn() {} };

/** Создаёт врага-Чужего в отдельной сцене и ставит его на свободную точку. */
function makeAlienEnemy(map, player, onDeath) {
  const scene = new THREE.Scene();
  const material = new THREE.MeshStandardMaterial({ color: 0x4a6b2a });
  const p = player || makeFakePlayer(new THREE.Vector3(0, 1, 40));
  const enemy = new AlienEnemy(scene, map, material, p, onDeath || (() => {}));
  enemy.respawn(new THREE.Vector3(0, 0, 40));
  return enemy;
}

/** Ставит врага в заданное состояние (позиция, нормаль опоры, взгляд). */
function placeEnemy(enemy, opts) {
  const { x, y, z, up = [0, 1, 0], fwd = [0, 0, 1] } = opts;
  enemy.pos.set(x, y, z);
  enemy.up.set(up[0], up[1], up[2]).normalize();
  enemy.fwd.set(fwd[0], fwd[1], fwd[2]);
  enemy.pitch = 0;
  enemy.vel.set(0, 0, 0);
  enemy.grounded = true;
  enemy.leapTimer = 0;
  enemy._leapCd = 0;
  enemy._leapHits.clear();
  enemy._replanar();
}

/** Прогоняет физику/ИИ врага на steps кадров и возвращает телеметрию. */
function simulateEnemy(enemy, steps, camera) {
  const cam = camera || makeCamera();
  const trace = [];
  for (let i = 0; i < steps; i++) {
    enemy.update(DT, enemy.player, cam, TRACERS);
    trace.push({
      t: i,
      x: enemy.pos.x, y: enemy.pos.y, z: enemy.pos.z,
      upX: enemy.up.x, upY: enemy.up.y, upZ: enemy.up.z,
      grounded: enemy.grounded,
    });
  }
  return trace;
}

/** 1. Менеджер создаёт нескольких Чужих рядом с людьми, а не вместо них. */
function testAlienEnemiesInManager() {
  const { map } = buildTestWorld();
  const scene = new THREE.Scene();
  const player = makeFakePlayer(new THREE.Vector3(0, CONFIG.eyeHeight, 40));
  const enemies = new Enemies(scene, map, player, makeCamera(), TRACERS);

  const aliens = enemies.items.filter(e => e instanceof AlienEnemy);
  const humans = enemies.items.filter(e => e instanceof Enemy);

  const passed =
    aliens.length === CONFIG.alienEnemies.count &&
    humans.length === CONFIG.enemies.count &&
    aliens.every(e => !e.dead && e.health === CONFIG.alienEnemies.health) &&
    aliens.every(e => e.group && e.group.parent === scene);
  return {
    name: 'В игре несколько врагов-Чужих рядом с людьми-врагами',
    passed,
    info: passed
      ? `Чужих: ${aliens.length}, людей: ${humans.length}, все живы и в сцене`
      : `Чужих: ${aliens.length} (ожидалось ${CONFIG.alienEnemies.count}), ` +
        `людей: ${humans.length} (ожидалось ${CONFIG.enemies.count})`,
  };
}

/**
 * 2. Враг-Чужой сам залезает по стене: цель (игрок) находится на крыше дома,
 * враг стартует на земле перед южной стеной и должен прилипнуть к вертикальной
 * поверхности и подняться по ней (полное 3D-лазание под управлением ИИ).
 */
function testAlienEnemyClimbsWall() {
  const { map } = buildTestWorld();
  const player = makeFakePlayer(new THREE.Vector3(0, ROOF_Y + CONFIG.eyeHeight, 0));
  const enemy = makeAlienEnemy(map, player);
  placeEnemy(enemy, { x: 0, y: RADIUS, z: WALL_Z + 1.5, up: [0, 1, 0], fwd: [0, 0, -1] });

  const trace = simulateEnemy(enemy, 240);
  const attached = trace.find(s => Math.abs(s.upY) <= 0.5);
  const maxY = trace.reduce((m, s) => Math.max(m, s.y), -Infinity);
  const passed = !!attached && maxY > 4.0;
  const last = trace[trace.length - 1];
  return {
    name: 'Враг-Чужой залезает по стене дома',
    passed,
    info: passed
      ? `прилип к стене на кадре ${attached.t}, поднялся до y=${maxY.toFixed(2)}`
      : attached
        ? `прилип, но поднялся лишь до y=${maxY.toFixed(2)}`
        : `не прилип; итог y=${last.y.toFixed(2)}, up=(${last.upX.toFixed(2)},${last.upY.toFixed(2)},${last.upZ.toFixed(2)})`,
  };
}

/**
 * 3. Враг-Чужой атакует прыжком в упор: приблизившись к игроку, он прыгает на
 * него и наносит урон при контакте в полёте.
 */
function testAlienEnemyLeapsAtPlayer() {
  const { map } = buildTestWorld();
  const player = makeFakePlayer(new THREE.Vector3(0, 1.0, 24));
  const enemy = makeAlienEnemy(map, player);
  placeEnemy(enemy, { x: 0, y: RADIUS, z: 30, up: [0, 1, 0], fwd: [0, 0, -1] });

  const before = player.health;
  const trace = simulateEnemy(enemy, 90);
  const leapt = trace.some(s => !s.grounded);
  const passed = leapt && player.health < before;
  return {
    name: 'Враг-Чужой прыгает в упор на игрока и наносит урон',
    passed,
    info: passed
      ? `прыгнул и снял ${(before - player.health).toFixed(0)} хп (осталось ${player.health.toFixed(0)})`
      : `прыжок=${leapt}, урон=${(before - player.health).toFixed(0)}`,
  };
}

/** 4. Урон, смерть и возрождение врага-Чужего. */
function testAlienEnemyDamageAndDeath() {
  const { map } = buildTestWorld();
  let deaths = 0;
  const enemy = makeAlienEnemy(map, null, () => { deaths++; });

  const spawned = !enemy.dead && enemy.health === CONFIG.alienEnemies.health;

  enemy.takeDamage(30);
  const hurt = !enemy.dead && enemy.health === CONFIG.alienEnemies.health - 30;

  enemy.takeDamage(1000);
  const dead = enemy.dead && deaths === 1;
  enemy.takeDamage(50); // по мёртвому урон не проходит
  const ignoreAfterDeath = enemy.dead && deaths === 1;

  enemy.respawn(new THREE.Vector3(0, 0, 40));
  const respawned = !enemy.dead && enemy.health === CONFIG.alienEnemies.health && enemy.group.visible;

  const passed = spawned && hurt && dead && ignoreAfterDeath && respawned;
  return {
    name: 'Враг-Чужой получает урон, умирает и возрождается',
    passed,
    info: passed
      ? 'урон снят, смерть засчитана, респавн восстановил здоровье'
      : `респавн=${spawned}, урон=${hurt}, смерть=${dead}, ` +
        `игнор после смерти=${ignoreAfterDeath}, возрождение=${respawned}`,
  };
}

/**
 * 5. Совместимость интерфейса: скачок играбельного Чужого ранит врага-Чужего
 * (как и любого врага из менеджера), а не убивает сразу.
 */
function testPlayerLeapHurtsAlienEnemy() {
  const { map } = buildTestWorld();
  const enemy = makeAlienEnemy(map);
  placeEnemy(enemy, { x: 0, y: 0.9, z: WALL_Z + 6, up: [0, 1, 0], fwd: [0, 0, -1] });

  const camera = makeCamera();
  const alien = new Alien(camera, document.createElement('canvas'), map, () => ({ items: [enemy] }));
  // Старт в 2 юнитах от врага: скачок идёт по крутой дуге (мин. угол возвышения
  // 32°), поэтому с дальней дистанции он пронёсся бы над целью. В упор — попадает.
  alien.pos.set(0, RADIUS, WALL_Z + 8);
  alien.up.set(0, 1, 0);
  alien.fwd.set(0, 0, -1);
  alien.pitch = 0;
  alien.vel.set(0, 0, 0);
  alien.grounded = true;
  alien._replanar();
  alien._updateCamera();

  alien._leap(); // «огонь» в сторону врага
  for (let i = 0; i < 60; i++) alien.update(DT);

  const damaged = !enemy.dead && enemy.health === CONFIG.alienEnemies.health - CONFIG.weapon.damage;
  const passed = damaged;
  return {
    name: 'Скачок играбельного Чужого ранит врага-Чужего',
    passed,
    info: passed
      ? `хп врага ${enemy.health} (−${CONFIG.weapon.damage}), жив`
      : `хп=${enemy.health}, жив=${!enemy.dead} (ожидалось ${CONFIG.alienEnemies.health - CONFIG.weapon.damage})`,
  };
}

/**
 * Прогоняет все тесты врагов-Чужих и печатает отчёт в консоль.
 * @returns {{passed:number, total:number, results:Array<{name:string,passed:boolean,info:string}>}}
 */
export function runAlienEnemyTests() {
  const tests = [
    testAlienEnemiesInManager,
    testAlienEnemyClimbsWall,
    testAlienEnemyLeapsAtPlayer,
    testAlienEnemyDamageAndDeath,
    testPlayerLeapHurtsAlienEnemy,
  ];
  const results = tests.map(fn => {
    try { return fn(); }
    catch (e) { return { name: fn.name, passed: false, info: `ошибка: ${e && e.message}` }; }
  });
  const passed = results.filter(r => r.passed).length;

  if (typeof console !== 'undefined') {
    console.group('Автотесты врагов-Чужих');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
