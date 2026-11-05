/**
 * Браузерная сюита автомобилей уровня (`src/vehicle.js`).
 *
 * Сюита отвечает на два разных вопроса, и для каждого у неё своя фикстура.
 *
 * «Едет ли машина по данным главы» — меряется на СОБРАННОЙ главе 13: точки
 * стоянок лежат на настиле петли, и только настоящая карта знает, где там опора,
 * где перила и насколько полотно выше грунта под ним. Синтетический пол такой
 * проверки не даёт: машина, законно вставшая на петлю, на плоскости не отличает
 * настил от террасы.
 *
 * «Слушается ли аркадная поступь клавиш» — меряется на плоской фикстуре
 * (`flatMap`), где нет ни периль, ни стыков, ни уклона: там предел скорости,
 * знак поворота руля, задний ход и отсутствие разворота на месте нельзя
 * получить случайно, и падение машины в колейник не маскирует дефект физики под
 * дефект геометрии.
 *
 * Кузов по правилу о декоре НЕ создаёт ни `solids`, ни `blockers`, поэтому пуля
 * проходит сквозь него насквозь — сюжет 3 фиксирует это проверенным свойством, а
 * не молчаливым допущением: сравниваются лучи и счётчики коллизий ДО и ПОСЛЕ
 * сборки машин, так что случайная правка, добавившая машине габарит, будет
 * названа числом.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const m = await import('/tests/vehicle.test.js?v=1');
 *   await m.runVehicleTests();
 *
 * Проверяются сценарии:
 *   1. Число машин и их точки приходят данными главы; главы без секции не
 *      получают ни одного кузова, `CONFIG.car.count` держит ноль, геометрия
 *      общая на все машины;
 *   2. Точка стоянки получает отметку СВОЕЙ опоры, и кузов на ней стоит, а не
 *      проваливается под настил;
 *   3. Кузов не добавляет ни `solids`, ни `blockers`, ни попадания луча;
 *   4. Посадка/выход человека: `nearest` в радиусе, связка водитель ↔ машина,
 *      подсказка гаснет, выход на ту же опору лицом вдоль носа;
 *   5. Урон не проходит за рулём у обеих ролей и возвращается после высадки;
 *      замах Чужого (`_strike`) за рулём молчит;
 *   6. Поездка по настилу петли: каждый кадр машина стоит на своей опоре и не
 *      отрывается от полотна;
 *   7. Поступь на плоской фикстуре: предел скорости, знак руля, тормоз и
 *      задний ход, на месте — никакого разворота;
 *   8. Преследующая камера: за кормой на `back`, над опорой не ниже
 *      `minClearance`, смотрит ровно в кузов;
 *   9. Сброс с высоты — падение до своей опоры, а не телепорт;
 *  10. Перила держат машину на настиле: поперёк полотна она упирается и не
 *      сходит в пропасть;
 *  11. Точка выхода масштабируется под тело водителя (сфера Чужого крупнее);
 *  12. `shiftWorld` переносит кузова вместе с миром, `dispose` снимает меши,
 *      оставляя общие геометрии следующим машинам;
 *  13. Детерминизм: одинаковые клавиши на одинаковых точках дают побитово равную
 *      траекторию.
 *
 * Чего здесь НЕТ: срабатывание клавиши `F` на фронте (это `Game._rideToggle` в
 * `src/game.js`) и текст подсказки с иконкой миникарты (`src/hud.js`) — оба
 * живут в сборке всей страницы и проверены живым прогоном в браузере на
 * порту 8200/8210 (глава 13: 2 машины, `F` сажает, `W` везёт по настилу, камера
 * сверху-сзади, `F` высаживает, урон в машине не проходит).
 */
import * as THREE from 'three';
import { createJsonMap } from '../src/json-map.js';
import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { LEVEL_13 } from '../src/levels/level-13.js';
import { CONFIG } from '../src/config.js';
import { Player } from '../src/player.js';
import { Alien } from '../src/alien.js';
import { Car, Cars } from '../src/vehicle.js';

const DT = 1 / 60;              // фиксированный шаг — сюита детерминирована
const C = CONFIG.car;
const STEP = CONFIG.building.stepUp;
const BODY_CHILDREN = 8;        // 4 детали кузова + 4 колеса

/** Все сущности, повесившие слушателей на window; снимаются в конце прогона. */
const entities = [];

// ------------------------------------------------------------------- фикстуры

let chapterCache = null;

/** Собранная глава 13: карта, сцена и её `gameplay.cars` (строятся один раз). */
function chapter() {
  if (chapterCache) return chapterCache;
  const scene = new THREE.Scene();
  const map = createJsonMap(LEVEL_13.map);
  map.build(scene);
  chapterCache = { scene, map, data: LEVEL_13.gameplay.cars, groundY: LEVEL_13.map.ground.y };
  return chapterCache;
}

/**
 * Плоская фикстура для физики: пол на `deckY`, ничего не заблокировано, за
 * плиту (`width`/`depth`) не выпустить. Держит ровно те члены контракта, о
 * которых знает `Car`, — лишнего машина спросить не может, и сюжет это сторожит.
 */
function flatMap(half = 500, deckY = 0) {
  return {
    width: half * 2,
    depth: half * 2,
    bounds: { minX: -half, maxX: half, minZ: -half, maxZ: half },
    groundHeightAt: () => deckY,
    isBlocked: () => false,
    raySolid: () => null,
    rayHitDistance: () => Infinity,
  };
}

/** Машины на плоской фикстуре в указанных точках. */
function flatCars(spots, half = 500, deckY = 0) {
  return new Cars(new THREE.Scene(), flatMap(half, deckY), { count: spots.length, spots });
}

function mkPlayer(map) {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const p = new Player(camera, document.createElement('canvas'), map);
  p.controls.isLocked = true;
  entities.push(p);
  return p;
}

function mkAlien(map) {
  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const a = new Alien(camera, document.createElement('canvas'), map, () => null, null);
  a.controls.isLocked = true;
  entities.push(a);
  return a;
}

/** Опора под точкой ровно так, как её спрашивает машина. */
const supportOf = (map, x, z, y) => map.groundHeightAt(x, z, y + STEP);

function verdict(name, problems, info) {
  return { name, passed: problems.length === 0, info: problems.length ? problems.join(' | ') : info };
}

// ------------------------------------------------------------------ сценарии

/** 1. Число машин и их точки — данные главы; без секции машин нет. */
function testCarsComeFromTheBrief() {
  const { scene, map, data } = chapter();
  const problems = [];
  const base = scene.children.length;

  if (CONFIG.car.count !== 0) {
    problems.push(`CONFIG.car.count = ${CONFIG.car.count} — глава без секции получила бы машины из конфига`);
  }
  const cars = new Cars(scene, map, data);
  const builtCount = cars.count;
  if (cars.count !== data.count || cars.count !== data.spots.length) {
    problems.push(`машин ${cars.count}, в брифе count ${data.count} и точек ${data.spots.length}`);
  }
  if (scene.children.length !== base + cars.count) {
    problems.push(`в сцену добавлено ${scene.children.length - base} объектов вместо ${cars.count} групп`);
  }
  for (const [i, car] of cars.items.entries()) {
    if (car.group.children.length !== BODY_CHILDREN) {
      problems.push(`машина ${i}: мешей ${car.group.children.length}, ожидалось ${BODY_CHILDREN} (кузов + колёса)`);
    }
  }
  // геометрия одна на все машины: кузов не плодит по мешу на экземпляр
  if (cars.count > 1) {
    const a = cars.items[0].group.children, b = cars.items[1].group.children;
    for (let i = 0; i < a.length; i++) {
      if (a[i].geometry !== b[i].geometry) { problems.push(`меш[${i}] у машин разные геометрии — общее не переиспользуется`); break; }
    }
  }
  // секция обещает больше, чем точек: берётся меньшее, а не падает
  const clamped = new Cars(new THREE.Scene(), flatMap(), { count: 5, spots: [{ x: 1, z: 1 }] });
  if (clamped.count !== 1) problems.push(`count 5 при одной точке дал ${clamped.count} машин`);

  // главы без `gameplay.cars` — ни одного кузова
  for (const [name, level] of [['9', LEVEL_09], ['10', LEVEL_10], ['11', LEVEL_11], ['12', LEVEL_12]]) {
    const n = new Cars(new THREE.Scene(), flatMap(), level.gameplay?.cars).count;
    if (n !== 0) problems.push(`глава ${name} без секции cars дала ${n} машин`);
  }
  cars.dispose(); clamped.dispose();
  return verdict('автомобили приходят данными главы', problems,
    `${builtCount} машины из ${data.spots.length} точек, ${BODY_CHILDREN} мешей на кузов с общей геометрией, главы 9–12 — 0 машин`);
}

/** 2. Отметка точки — её собственная опора, и кузов на ней стоит. */
function testSpotTakesItsOwnSupport() {
  const { map, data, groundY } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const lines = [];
  for (const [i, spot] of data.spots.entries()) {
    const y = supportOf(map, spot.x, spot.z, spot.y);
    if (Math.abs(y - spot.y) > 1e-3) {
      problems.push(`точка ${i}: парсер отдал опору ${spot.y}, движок под ней отвечает ${y} — расход ${Math.abs(y - spot.y).toFixed(3)} м`);
    }
    if (!(spot.y > groundY + 1)) {
      problems.push(`точка ${i} встала на грунт (${spot.y} против ${groundY}), а не на полотно над ним`);
    }
    // кадр без водителя не должен сдвинуть кузов с ОТДАННОЙ парсером отметки:
    // `r3` в нормализаторе округляет до миллиметра, и первый же кадр притягивает
    // кузов к опоре, которую отвечает движок (3,7525 против 3,753 в брифе)
    cars.items[i].idle(DT);
    const rest = cars.items[i].pos.y;
    if (Math.abs(rest - y) > 1e-9) problems.push(`точка ${i}: после первого кадра кузов на ${rest}, опора движка ${y}`);
    lines.push(`(${spot.x}, ${spot.z}) y=${spot.y}`);
  }
  cars.dispose();
  return verdict('точка стоянки получает отметку СВОЕЙ опоры', problems, `обе точки на настиле выше грунта: ${lines.join('; ')}`);
}

/** 3. Кузов — декор: ни сольюда, ни блокера, ни попадания луча он не добавляет. */
function testCarAddsNoSolidsOrOcclusion() {
  const { map, data } = chapter();
  const spot = data.spots[0];
  const d = { x: Math.cos(-(spot.yaw ?? 0) * Math.PI / 180), z: -Math.sin(-(spot.yaw ?? 0) * Math.PI / 180) };
  const rays = [
    ['вертикальный вниз через кузов', [spot.x, spot.y + 3, spot.z, 0, -1, 0, 8]],
    ['вдоль носа сквозь кузов', [spot.x - d.x * C.length, spot.y + 0.7, spot.z - d.z * C.length, d.x, 0, d.z, C.length * 2]],
    ['поперёк борта', [spot.x, spot.y + 0.7, spot.z, -d.z, 0, d.x, 6]],
  ];
  const before = {
    solids: map.solids.length,
    blockers: map.blockers.length,
    rays: rays.map(([n, a]) => [n, map.raySolid(...a)]),
  };
  const cars = new Cars(chapter().scene, map, data);
  for (let i = 0; i < 30; i++) cars.update(DT);   // и в движении ничего не добавляется
  const problems = [];
  if (map.solids.length !== before.solids) problems.push(`solids вырос с ${before.solids} до ${map.solids.length}`);
  if (map.blockers.length !== before.blockers) problems.push(`blockers вырос с ${before.blockers} до ${map.blockers.length}`);
  for (const [n, a] of rays) {
    const hit = map.raySolid(...a);
    const prev = before.rays.find(r => r[0] === n)[1];
    const same = (!hit && !prev) || (hit && prev && Math.abs(hit.dist - prev.dist) < 1e-6);
    if (!same) problems.push(`луч «${n}» после сборки машин отвечает ${hit ? hit.dist.toFixed(3) : 'null'}, было ${prev ? prev.dist.toFixed(3) : 'null'}`);
  }
  // и ноге машина не стена: точка под кузовом свободна
  if (map.isBlocked(spot.x, spot.z, CONFIG.radius, spot.y, CONFIG.eyeHeight + 0.35)) {
    problems.push('под кузовом точка стала заблокированной — машина встала стеной посреди полотна');
  }
  cars.dispose();
  return verdict('кузов не создаёт коллизий и не заслоняет луч', problems,
    `solids ${before.solids}, blockers ${before.blockers}, ${rays.length} луча совпали до и после; тело под кузовом свободно`);
}

/** 4. Посадка и выход человека: связка, подсказка, опора и разворот лицом к носу. */
function testEnterAndExitHuman() {
  const { map, data } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const player = mkPlayer(map);
  const spot = data.spots[0];
  player.spawnAt({ x: spot.x + 1, y: spot.y, z: spot.z });

  const near = cars.nearest(player.position);
  if (!near) problems.push(`у машины (${spot.x}, ${spot.z}) никто не сел: nearest не нашёл кузова в ${C.enterRadius} м`);
  else if (near.car !== cars.items[0]) problems.push('nearest вернул не ту машину');
  else if (near.distance > C.enterRadius) problems.push(`дистанция ${near.distance.toFixed(2)} м больше радиуса посадки ${C.enterRadius}`);
  if (problems.length) return verdict('посадка и выход человека', problems, '');

  cars.enter(near.car, player);
  if (player.vehicle !== near.car) problems.push('водитель не получил машину');
  if (near.car.rider !== player) problems.push('машина не получила водителя');
  if (cars.driven !== near.car) problems.push('менеджер не считает машину ведомой');
  // свободных машин рядом больше нет — подсказка обязана переключиться на «выйти»
  if (cars.nearest(player.position)) problems.push('занятая машина всё ещё предлагается для посадки');

  const car = near.car;
  const deckY = car.pos.y;
  if (!cars.exit()) problems.push('выход не вернулся истинным');
  if (player.vehicle || car.rider || cars.driven) problems.push('после выхода связка не распалась');
  const feet = supportOf(map, player.position.x, player.position.z, deckY);
  if (Math.abs(player.feetY - feet) > 1e-6) problems.push(`ноги на ${player.feetY.toFixed(3)}, карта отвечает ${feet.toFixed(3)}`);
  if (!(player.feetY > chapter().groundY + 1)) {
    problems.push(`водитель вышел на ${player.feetY.toFixed(2)} — это грунт под настилом (${chapter().groundY}), а не полотно`);
  }
  if (map.isBlocked(player.position.x, player.position.z, CONFIG.radius, player.feetY, CONFIG.eyeHeight + 0.35)) {
    problems.push('точка выхода заблокирована — человек встал в перила');
  }
  const offset = Math.hypot(player.position.x - car.pos.x, player.position.z - car.pos.z);
  if (offset < C.width / 2 + CONFIG.radius - 1e-6) {
    problems.push(`точка выхода в ${offset.toFixed(2)} м от центра: кузов на ${C.width / 2} м, тело бы осталось внутри`);
  }
  player.update(DT);
  const dot = player.direction.x * car.direction.x + player.direction.z * car.direction.z;
  if (dot < 0.999) problems.push(`после выхода взгляд не вдоль носа (косой ${dot.toFixed(4)})`);

  cars.dispose();
  return verdict('посадка и выход человека', problems,
    `радиус ${near.distance.toFixed(2)} м ≤ ${C.enterRadius}, выход в ${offset.toFixed(2)} м от оси кузова на отметке ${player.feetY.toFixed(2)} (полотно), взгляд вдоль носа ${dot.toFixed(4)}`);
}

/** 5. За рулём урона нет — у обеих ролей; замах Чужого тоже молчит. */
function testNoDamageBehindTheWheel() {
  const { map, data } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const spot = data.spots[0];
  const info = [];

  for (const [role, rider] of [['человек', mkPlayer(map)], ['Чужой', mkAlien(map)]]) {
    rider.spawnAt({ x: spot.x, y: spot.y, z: spot.z });
    const car = cars.items[0];
    rider.health = CONFIG.health.max;
    rider.takeDamage(10);
    const walked = rider.health;
    if (walked >= CONFIG.health.max) problems.push(`${role}: урон пешком не прошёл (${walked})`);

    cars.enter(car, rider);
    rider.health = CONFIG.health.max;
    rider.takeDamage(60);
    if (rider.health !== CONFIG.health.max) problems.push(`${role}: за рулём урон снял ${CONFIG.health.max - rider.health} хп`);
    if (role === 'Чужой') {
      rider.strikeCd = 0;
      if (rider._strike() !== false) problems.push('Чужой ударил лапой за рулём');
      if (rider.strikeCd !== 0) problems.push('замаха не было, но пауза всё равно запускалась');
    }
    // кадри физики за рулём не должны уронить тело ниже пола кузова
    for (let i = 0; i < 10; i++) rider.update(DT);
    if (rider.health !== CONFIG.health.max) problems.push(`${role}: здоровье поехало во время езды (${rider.health})`);

    cars.exit();
    rider.strikeCd = 0;
    rider.takeDamage(25);
    if (rider.health > CONFIG.health.max - 25 + 1e-6) problems.push(`${role}: после выхода урон так и не проходит (${rider.health})`);
    if (role === 'Чужой' && rider._strike() !== true) problems.push('Чужой не может ударить после выхода');
    info.push(`${role}: пешком ${walked}, в машине ${CONFIG.health.max}, после выхода ${rider.health.toFixed(1)}`);
  }
  cars.dispose();
  return verdict('урон не проходит за рулём (обе роли)', problems, info.join('; '));
}

/** 6. Поездка по настилу петли: каждый кадр — на своей опоре, без отрыва от полотна. */
function testRideStaysOnItsDeck() {
  const { map, data, groundY } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const player = mkPlayer(map);
  const car = cars.items[0];
  player.spawnAt({ x: data.spots[0].x, y: data.spots[0].y, z: data.spots[0].z });
  cars.enter(car, player);

  player.keys.add('KeyW');
  let minSupport = Infinity, moved = 0, offDeck = 0;
  const start = { x: car.pos.x, z: car.pos.z };
  for (let i = 0; i < 120; i++) {
    cars.update(DT);
    const y = car.pos.y;
    const support = supportOf(map, car.pos.x, car.pos.z, y);
    if (!Number.isFinite(y) || !Number.isFinite(car.speed) || !Number.isFinite(car.yaw)) {
      problems.push(`кадр ${i}: нечисловые значения (y ${y}, speed ${car.speed}, yaw ${car.yaw})`);
      break;
    }
    if (Math.abs(y - support) > 1e-3) {
      offDeck++;
      if (offDeck <= 2) problems.push(`кадр ${i}: кузов на ${y.toFixed(3)}, опора под ним ${support.toFixed(3)} — провал ${Math.abs(y - support).toFixed(3)} м`);
    }
    if (y <= groundY + 1) { problems.push(`кадр ${i}: машина ушла с полотна (y ${y.toFixed(2)} против грунта ${groundY})`); break; }
    if (!car.grounded) problems.push(`кадр ${i}: машина оторвалась от настила`);
    minSupport = Math.min(minSupport, y);
    moved = Math.hypot(car.pos.x - start.x, car.pos.z - start.z);
  }
  player.keys.clear();
  const finalY = supportOf(map, car.pos.x, car.pos.z, car.pos.y);
  if (car.speed < 8) problems.push(`за 2 с разгона скорость лишь ${car.speed.toFixed(2)} м/с — газ не работает`);
  if (moved < 10) problems.push(`машина проехала ${moved.toFixed(1)} м за 2 с — её что-то держит`);
  if (Math.abs(car.pos.y - finalY) > 1e-3) problems.push(`в конце прогона кузов ${car.pos.y.toFixed(3)}, опора ${finalY.toFixed(3)}`);
  cars.dispose();
  return verdict('поездка по настилу: опора под каждым кадром', problems,
    `${moved.toFixed(1)} м за 120 кадров, скорость ${car.speed.toFixed(2)} м/с, полотно держит (низшая отметка ${minSupport.toFixed(2)} > грунт ${groundY}), отрыва и провала нет`);
}

/** 7. Поступь на плоской фикстуре: предел, знак руля, тормоз и реверс, покой. */
function testThrottleSteerAndReverse() {
  const problems = [];
  const spots = [{ x: 0, z: 0, yaw: 0, y: 0 }];

  // покой: без газа руль не крутит машину и она не едет
  const idle = flatCars(spots).items[0];
  const yaw0 = idle.yaw;
  for (let i = 0; i < 120; i++) idle.drive(DT, new Set(['KeyA']));
  if (Math.abs(idle.yaw - yaw0) > 1e-9) problems.push(`на месте повернула на ${(idle.yaw - yaw0).toFixed(6)} рад — bicycle-модель обязана гаснуть при нулевой скорости`);
  if (idle.pos.x !== 0 || idle.pos.z !== 0) problems.push('на месте машина сместилась');

  // разгон до предела
  const keys = new Set(['KeyW']);
  let speedMax = 0;
  for (let i = 0; i < 600; i++) { idle.drive(DT, keys); speedMax = Math.max(speedMax, idle.speed); }
  if (idle.speed > C.maxSpeed + 1e-9) problems.push(`скорость ${idle.speed} превысила предел ${C.maxSpeed}`);
  if (idle.speed < C.maxSpeed * 0.99) problems.push(`за 10 с разгон лишь ${idle.speed.toFixed(2)} м/с при пределе ${C.maxSpeed}`);

  // знак руля: A — в одну сторону, D — в другую
  const mk = () => flatCars(spots).items[0];
  const left = mk(), right = mk();
  for (const [car, k] of [[left, 'KeyA'], [right, 'KeyD']]) {
    const set = new Set(['KeyW', k]);
    for (let i = 0; i < 60; i++) car.drive(DT, set);
  }
  if (!(left.yaw > 0.05)) problems.push(`«A» не повернула (yaw ${left.yaw.toFixed(4)})`);
  if (!(right.yaw < -0.05)) problems.push(`«D» не повернула (yaw ${right.yaw.toFixed(4)})`);

  // тормоз с ходу, потом задний ход
  const braked = mk();
  const fwd = new Set(['KeyW']);
  for (let i = 0; i < 60; i++) braked.drive(DT, fwd);
  const moving = braked.speed;
  const back = new Set(['KeyS']);
  for (let i = 0; i < 30; i++) braked.drive(DT, back);
  if (braked.speed >= moving) problems.push(`«S» не тормозит: ${moving.toFixed(2)} → ${braked.speed.toFixed(2)}`);
  for (let i = 0; i < 300; i++) braked.drive(DT, back);
  if (braked.speed >= -0.1) problems.push(`задний ход не появился (speed ${braked.speed.toFixed(3)})`);
  if (braked.speed < -C.maxReverse - 1e-9) problems.push(`реверс ${braked.speed.toFixed(2)} превысил предел ${-C.maxReverse}`);
  const d = braked.direction;
  const travel = (braked.pos.x - 0) * d.x + (braked.pos.z - 0) * d.z;
  if (travel > 0) problems.push(`машина отъехала ВПЕРЁД на ${travel.toFixed(2)} м при заднем ходе`);

  // выбег: без газа скорость гаснет к нулю и не уходит в отрицательную
  const coast = mk();
  for (let i = 0; i < 60; i++) coast.drive(DT, fwd);
  const released = coast.speed;
  let coasted = 0;
  while (coast.speed !== 0 && coasted < 600) { coast.drive(DT, new Set()); coasted++; }
  if (coast.speed !== 0) problems.push(`накат не погас за ${coasted} кадров: ${coast.speed.toFixed(4)} м/с`);
  if (coasted < 2) problems.push(`погас за ${coasted} кадров — сопротивления почти нет`);
  if (coasted > 400) problems.push(`погас лишь за ${coasted} кадров (${(coasted / 60).toFixed(1)} с) с ${released.toFixed(1)} м/с — торможение невнятное`);
  return verdict('газ, руль, тормоз и задний ход', problems,
    `предел ${C.maxSpeed} м/с держится (пик ${speedMax.toFixed(2)}), на месте yaw не меняется, «A»/«D» расходятся знаками, реверс в пределах ${C.maxReverse}, накат ${released.toFixed(1)} → 0 за ${(coasted / 60).toFixed(1)} с`);
}

/** 8. Преследующая камера: за кормой, над своей опорой, смотрит в кузов. */
function testChaseCameraPose() {
  const { map, data } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const player = mkPlayer(map);
  const car = cars.items[0];
  player.spawnAt({ x: data.spots[0].x, y: data.spots[0].y, z: data.spots[0].z });
  cars.enter(car, player);
  const keys = new Set(['KeyW']);
  for (let i = 0; i < 30; i++) { car.drive(DT, keys); }
  const camera = player.camera;
  camera.position.set(0, 0, 0);          // поза до вызова не должна ничего оправдывать
  cars.applyCamera(camera);

  const d = car.direction;
  const dx = camera.position.x - car.pos.x, dz = camera.position.z - car.pos.z;
  const behind = -(dx * d.x + dz * d.z);
  const lateral = Math.abs(dx * -d.z + dz * d.x);
  if (Math.abs(behind - C.camera.back) > 1e-6) problems.push(`камера в ${behind.toFixed(3)} м за кормой, ждали ${C.camera.back}`);
  if (lateral > 1e-6) problems.push(`камера смещена вбок на ${lateral.toFixed(3)} м — преследование обязано быть по оси`);
  const support = map.groundHeightAt(camera.position.x, camera.position.z, car.pos.y + C.camera.up);
  const expected = Math.max(car.pos.y + C.camera.up, (Number.isFinite(support) ? support : car.pos.y) + C.camera.minClearance);
  if (Math.abs(camera.position.y - expected) > 1e-6) {
    problems.push(`отметка камеры ${camera.position.y.toFixed(3)}, ждали ${expected.toFixed(3)} (кузов ${car.pos.y.toFixed(2)} + ${C.camera.up}, опора за кормой ${support.toFixed(2)} + ${C.camera.minClearance})`);
  }
  if (camera.position.y - support < C.camera.minClearance - 1e-6) {
    problems.push(`камера в ${((camera.position.y - support)).toFixed(3)} м над своей опорой — ушла бы в настил (ждали ≥ ${C.camera.minClearance})`);
  }
  const look = new THREE.Vector3();
  camera.getWorldDirection(look);
  const to = new THREE.Vector3(car.pos.x - camera.position.x, car.pos.y + C.camera.look - camera.position.y, car.pos.z - camera.position.z).normalize();
  const dot = look.dot(to);
  if (dot < 0.999) problems.push(`взгляд камеры не в кузов (косой ${dot.toFixed(4)})`);

  // без ведомой машины камера не трогается (сам выход её переставляет — `spawnAt`
  // ставит человека на опору, и мерить надо именно вызов applyCamera). Числа для
  // отчёта снимаются ДО выхода: после него в камере другая поза, и строка
  //metrics врала бы про позу преследования.
  const camY = camera.position.y, carY = car.pos.y;
  cars.exit();
  const afterExit = camera.position.clone();
  cars.applyCamera(camera);
  if (!camera.position.equals(afterExit)) problems.push('applyCamera сдвинул камеру, хотя водитель вышел');
  cars.dispose();
  return verdict('камера сверху и сзади кузова', problems,
    `${C.camera.back} м за кормой, отметка ${camY.toFixed(2)} м = max(кузов ${carY.toFixed(2)} + ${C.camera.up}, опора за кормой ${support.toFixed(2)} + ${C.camera.minClearance}), зазор ${((camY - support)).toFixed(2)} м, взгляд в кузов ${dot.toFixed(5)}`);
}

/** 9. Сброс с высоты — падение до своей опоры, а не телепорт. */
function testFallLandsOnItsSupport() {
  const { map, data } = chapter();
  const spot = data.spots[0];
  const problems = [];
  const car = new Cars(new THREE.Scene(), map, { count: 1, spots: [spot] }).items[0];
  car.pos.y = spot.y + 20;
  // `grounded` — результат касания, а не разрешение на падение: первый же кадр
  // `_fall` обязан снять флаг, и только тогда цикл считает полёт, а не телепорт
  let frames = 0, airborne = 0;
  while (frames < 600) {
    car.idle(DT);
    frames++;
    if (!car.grounded) airborne++;
    else if (frames > 1) break;
  }
  const support = supportOf(map, car.pos.x, car.pos.z, car.pos.y);
  if (airborne < 2) problems.push(`полёт занял ${airborne} кадров из ${frames} — кузов переместился телепортом`);
  if (!car.grounded) problems.push(`за ${frames} кадров машина не долетела до опоры (ещё ${car.pos.y.toFixed(2)} против ${support.toFixed(2)})`);
  if (Math.abs(car.pos.y - support) > 1e-3) problems.push(`приземлилась на ${car.pos.y.toFixed(3)}, опора ${support.toFixed(3)}`);
  if (Math.abs(support - spot.y) > 0.05) problems.push(`приземлилась не на своё полотно: ${support.toFixed(2)} против точки ${spot.y}`);
  if (!Number.isFinite(car.vertical) || car.vertical !== 0) problems.push(`вертикальная скорость после касания ${car.vertical}`);
  if (!Number.isFinite(car.pos.x) || !Number.isFinite(car.pos.z)) problems.push('координаты после падения нечисловые');
  return verdict('падение с высоты кончается на своей опоре', problems,
    `${airborne} кадров полёта с +20 м (${(frames / 60).toFixed(1)} с), приземление на ${car.pos.y.toFixed(3)} м (полотно точки ${spot.y}), vertical ${car.vertical}`);
}

/** 10. Перила держат кузов на настиле: поперёк полотна машина упирается. */
function testRailsHoldTheCarOnTheDeck() {
  const { map, data, groundY } = chapter();
  const problems = [];
  const car = new Cars(new THREE.Scene(), map, { count: 1, spots: [data.spots[0]] }).items[0];
  car.yaw += Math.PI / 2;                 // нос поперёк полотна, на перила
  const keys = new Set(['KeyW']);
  const start = { x: car.pos.x, z: car.pos.z };
  let lowest = Infinity, stoppedAt = -1;
  for (let i = 0; i < 300; i++) {
    car.drive(DT, keys);
    lowest = Math.min(lowest, car.pos.y);
    if (car.speed === 0 && stoppedAt < 0 && i > 2) stoppedAt = i;
    if (car.pos.y <= groundY + 1) { problems.push(`кадр ${i}: машина сошла с полотна (y ${car.pos.y.toFixed(2)})`); break; }
  }
  const travelled = Math.hypot(car.pos.x - start.x, car.pos.z - start.z);
  if (stoppedAt < 0) problems.push(`за 5 с газ не упёрся ни во что: машина проехала ${travelled.toFixed(1)} м сквозь перила`);
  if (travelled > C.length * 3) problems.push(`ушла на ${travelled.toFixed(1)} м поперёк полосы 10 м — преграда не сработала`);
  if (Math.abs(car.pos.y - supportOf(map, car.pos.x, car.pos.z, car.pos.y)) > 1e-3) {
    problems.push('в конце прогона кузов не на своей опоре');
  }
  return verdict('перила бракают сход с кромки', problems,
    `упёрлась на кадре ${stoppedAt} (${travelled.toFixed(2)} м поперёк полотна), ниже ${groundY} не упала (низшая отметка ${lowest.toFixed(2)})`);
}

/** 11. Точка выхода держит зазор по телу водителя, а не по человеку. */
function testExitRoomScalesWithTheRider() {
  const { map, data } = chapter();
  const problems = [];
  const cars = new Cars(new THREE.Scene(), map, data);
  const human = mkPlayer(map), alien = mkAlien(map);
  const out = [];
  for (const [role, rider] of [['человек', human], ['Чужой', alien]]) {
    // радиус тела — тот же доступ, что у `_exitPoint`: у Чужого он в `cfg`,
    // у человека в `CONFIG.radius` (у Player своего cfg нет)
    const r = rider.cfg?.radius ?? CONFIG.radius;
    rider.spawnAt({ x: data.spots[0].x, y: data.spots[0].y, z: data.spots[0].z });
    const car = cars.items[0];
    cars.enter(car, rider);
    cars.exit();
    const p = rider.position;
    const offset = Math.hypot(p.x - car.pos.x, p.z - car.pos.z);
    const need = C.width / 2 + r;
    if (offset < need - 1e-6) {
      problems.push(`${role}: вышел в ${offset.toFixed(2)} м от оси кузова, нужно ≥ ${need.toFixed(2)} (полуборт + тело)`);
    }
    if (map.isBlocked(p.x, p.z, r, rider.feetY, CONFIG.eyeHeight + 0.35)) {
      problems.push(`${role}: точка выхода не свободна для его тела — resolveSphere вытолкнул бы в кузов`);
    }
    out.push(`${role} ${offset.toFixed(2)} м (радиус ${r})`);
  }
  // у Чужого «вперёд» после выхода — вдоль носа
  const car2 = cars.items[0];
  cars.enter(car2, alien);
  cars.exit();
  const d = car2.direction;
  const dot = alien.fwd.x * d.x + alien.fwd.z * d.z;
  if (dot < 0.999) problems.push(`Чужой смотрит не вдоль носа (${dot.toFixed(4)})`);
  if (Math.abs(alien.up.y - 1) > 1e-6) problems.push('после выхода нормаль Чужого не вертикальна');
  cars.dispose();
  return verdict('выход учитывает тело водителя', problems, out.join(', ') + `, взгляд Чужого вдоль носа ${dot.toFixed(5)}`);
}

/** 12. `shiftWorld` переносит кузова, `dispose` снимает меши и бережёт общее. */
function testShiftWorldAndDispose() {
  const { map, data, scene } = chapter();
  const problems = [];
  const base = scene.children.length;
  const cars = new Cars(scene, map, data);
  const builtCount = cars.count;
  const before = cars.items.map(c => ({ x: c.pos.x, z: c.pos.z, gx: c.group.position.x, gz: c.group.position.z }));
  cars.shiftWorld(30, -12);
  for (const [i, car] of cars.items.entries()) {
    if (Math.abs(car.pos.x - (before[i].x - 30)) > 1e-9 || Math.abs(car.pos.z - (before[i].z + 12)) > 1e-9) {
      problems.push(`машина ${i} после сдвига мира в (${car.pos.x.toFixed(2)}, ${car.pos.z.toFixed(2)}), ждали (${(before[i].x - 30).toFixed(2)}, ${(before[i].z + 12).toFixed(2)})`);
    }
    if (Math.abs(car.group.position.x - car.pos.x) > 1e-9 || Math.abs(car.group.position.z - car.pos.z) > 1e-9) {
      problems.push(`машина ${i}: меш остался на старом месте (group ${car.group.position.x.toFixed(2)}, ${car.group.position.z.toFixed(2)}) — расчётная поза не перенесена в картинку`);
    }
  }
  cars.dispose();
  if (scene.children.length !== base) problems.push(`после dispose в сцене ${scene.children.length} объектов, базовых было ${base}`);
  if (cars.count !== 0 || cars.driven) problems.push('dispose не почистил список или ведомую машину');
  // общие геометрии живут: вторая сборка после dispose обязана дать те же меши
  const again = new Cars(scene, map, data);
  if (scene.children.length !== base + again.count) {
    problems.push(`пересборка после dispose добавила ${scene.children.length - base} объектов вместо ${again.count}`);
  }
  if (again.count === builtCount && again.items[0].group.children.length !== BODY_CHILDREN) {
    problems.push('пересобранная машина потеряла части кузова — общее было снято вместе с экземпляром');
  }
  again.dispose();
  return verdict('перенос мира и снятие машин', problems,
    `обе машины сдвинулись на (−30, +12) вместе с мешами, dispose вернул сцену к ${base} объектам, пересборка работает`);
}

/** 13. Детерминизм: те же клавиши — та же траектория. */
function testSameInputsSameTrajectory() {
  const problems = [];
  const script = [
    ['KeyW', 90], ['KeyW+KeyD', 45], ['KeyW', 60], ['KeyS', 40], ['', 60],
  ];
  const run = () => {
    const car = flatCars([{ x: 12, z: -8, yaw: 37.5, y: 0 }]).items[0];
    for (const [keys, frames] of script) {
      const set = new Set(keys ? keys.split('+') : []);
      for (let i = 0; i < frames; i++) car.drive(DT, set);
    }
    return { x: car.pos.x, z: car.pos.z, yaw: car.yaw, speed: car.speed, pitch: car.pitch, roll: car.roll, spin: car.spin };
  };
  const a = run(), b = run();
  for (const k of Object.keys(a)) {
    if (Math.abs(a[k] - b[k]) > 1e-12) problems.push(`${k}: ${a[k]} против ${b[k]}`);
  }
  if (Math.abs(a.x - 12) < 1e-6 && Math.abs(a.z + 8) < 1e-6) problems.push('сценарий клавиш не сдвинул машину — тест ничего не измеряет');
  return verdict('одинаковые клавиши дают одинаковую поездку', problems,
    `2 × ${script.reduce((n, s) => n + s[1], 0)} кадров сошлись до 1e-12 (финал ${a.x.toFixed(3)}, ${a.z.toFixed(3)}, yaw ${a.yaw.toFixed(4)})`);
}

// --------------------------------------------------------------------- запуск

export async function runVehicleTests() {
  const tests = [
    testCarsComeFromTheBrief,
    testSpotTakesItsOwnSupport,
    testCarAddsNoSolidsOrOcclusion,
    testEnterAndExitHuman,
    testNoDamageBehindTheWheel,
    testRideStaysOnItsDeck,
    testThrottleSteerAndReverse,
    testChaseCameraPose,
    testFallLandsOnItsSupport,
    testRailsHoldTheCarOnTheDeck,
    testExitRoomScalesWithTheRider,
    testShiftWorldAndDispose,
    testSameInputsSameTrajectory,
  ];
  const results = [];
  for (const fn of tests) {
    try { results.push(await fn()); }
    catch (e) { results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message} | ${e && e.stack && e.stack.split('\n')[1]}` }); }
  }
  // сюита создаёт игроков и Чужих — их слушатели на window не должны
  // пережить прогон иначе следующий запуск ловит клавиши дважды
  for (const e of entities) { try { e.dispose(); } catch (_) { /* уже снято */ } }
  entities.length = 0;

  const passed = results.filter(r => r.passed).length;
  if (typeof console !== 'undefined') {
    console.group('Автотесты автомобилей уровня (gameplay.cars, src/vehicle.js)');
    for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
    console.log(`Итого: ${passed}/${results.length}`);
    console.groupEnd();
  }
  return { passed, total: results.length, results };
}
