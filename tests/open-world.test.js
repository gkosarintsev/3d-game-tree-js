/**
 * Автотест открытого мира — `WorldMap` (этапы 3–6 плана docs/open-world-plan.md).
 *
 * Меряет критерий этапа дословно: «один чанк собирается в мире из `index.js` и
 * одного файла, незастроенная область `isBlocked` истинен по всей плите, а
 * `renderer.info.memory` после круга по 9 чанкам равен значению до круга» — и
 * список § 7.2, который к этому критерию ведёт. Фикстура — `probe/open-600.json`
 * (тот же город, что `probe/city-600.json`, но разрезанный парсером на 3×3
 * клетки по 200 м): полный каталог 1,96 км² весит 6,4 МБ и в браузерной сюите
 * не нужен (§ 10.11 плана решён в пользу уменьшенной фикстуры).
 *
 * Этап 5 добавляет сюда сущности и HUD: враг, кузов и маяк точки B обязаны
 * исчезать там, где клетка выгружена, и не исчезать там, где тело стоит
 * легально. Дыра моделируется **выгрузкой средней клетки при восьми загруженных
 * соседях**: `bounds` при этом остаётся габаритом всей плиты и дыру не видит —
 * ровно тот случай, ради которого введён `isBuiltAt` (мера гнутого окна, § 6
 * этапа 5: 3 732 дыр из 15 688 остались бы внутри габарита).
 *
 * Первые тринадцать проверок идут картой и её сценой: фикстура `probe/open-600`
 * строится в своём порядке, а не тем, каким её строит глава. Кадр берётся у
 * `window.game.renderer` — `renderer.info.memory` считает буферы только того,
 * что реально уехало в WebGL, а без отрисовки наши меши так и остались бы
 * необъявленными, и гейт «память вернулась» был бы пустой проверкой.
 *
 * Последняя проверка — этап 6 (§ 7.2 п. 2): та же плита, но главой **из реестра**
 * и глазами движка (`_loadLevel` до интертитра, затем `_worldPump` за ним).
 * Она обязана идти последней: заглушка `_tick` не переназначает
 * `requestAnimationFrame`, поэтому кадр страницы после неё не наступает.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const t = await import('/tests/open-world.test.js');
 *   await t.runOpenWorldTests();
 */
import * as THREE from 'three';
import { CONFIG } from '../src/config.js';
import { JsonMap } from '../src/json-map.js';
import { WorldMap } from '../src/world-map.js';
import { Enemies, AlienEnemy } from '../src/enemies.js';
import { Cars } from '../src/vehicle.js';
import { ExitGoal } from '../src/exit.js';
import { LEVELS } from '../src/levels/index.js';
import { OPEN_600 } from '../probe/open-600/index.js';

/** Путь к файлам клеток берётся из данных главы (`catalog`, § 10.13 плана). */
const CATALOG = OPEN_600.map.catalog;
const J = CONFIG.jsonMap;
/** Шаг опроса проходимости по плите: 60 × 60 точек на 600 м. */
const PLATE_STEP = 10;
/** Коллекции чанка, из которых собирается эталон «тот же город целиком». */
const COLLECTIONS = ['buildings', 'roads', 'channels', 'props', 'lights'];

const cache = new Map();

/** Читает файл клетки один раз на прогон (сюита строит несколько миров). */
async function chunkData(file) {
  if (!cache.has(file)) {
    const res = await fetch(`${CATALOG}/${file}`);
    if (!res.ok) throw new Error(`${CATALOG}/${file}: ${res.status}`);
    cache.set(file, await res.json());
  }
  return cache.get(file);
}

/** Открытая карта поверх чистой сцены; кадр — у рендерера движка. */
async function makeWorld(order = null) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const map = new WorldMap(OPEN_600.map);
  map.build(scene);
  const cells = order ? order.map((k) => OPEN_600.map.cells[k]) : OPEN_600.map.cells;
  return { map, scene, camera, cells };
}

/** Достройка списка клеток; возвращает пометку времени каждой. */
async function loadCells(world, ids) {
  const byId = new Map(world.map.cells.map((c) => [c.id, c]));
  const ms = [];
  for (const id of ids) {
    const t = performance.now();
    await world.map.loadChunk(id);
    ms.push({ id, ms: performance.now() - t });
  }
  return ms;
}

/** Клетка, чьим прямоугольником лежит мировая точка. */
function cellOf(map, x, z) {
  const c = map.cellAt(x, z);
  return c ? c.id : null;
}

/**
 * Есть ли точка в прямоугольнике загруженной клетки. Это **четвёртый** член
 * контракта (`isBuiltAt`), а не габарит и не проходимость: см. документацию
 * метода в src/world-map.js и меру § 6 этапа 5.
 */
const inLoaded = (map, x, z) => map.isBuiltAt(x, z);

/** Точка внутри габарита загруженного содержимого (`bounds`) — предикат главы 4. */
const inBounds = (b, x, z) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ;

/**
 * Игрок-заглушка: `Enemies.update` крутит ИИ, а `Enemy._shoot` ранит цель и
 * зовёт `findPath` по `player.feetY` — без этих полей сюжет падал на середине
 * первого же кадра.
 */
function fakePlayer(map) {
  const y = map.spawn.y ?? 0;
  return {
    position: new THREE.Vector3(map.spawn.x, y, map.spawn.z),
    feetY: y, velocity: new THREE.Vector3(), dead: false, vehicle: null,
    keys: new Set(),
    takeDamage() { return 0; },
  };
}

/**
 * Ставит тело на узел графа руками: `respawn` выбирает узел сам и не слушается.
 *
 * Ветки разные, и это не аккуратность: у Чужого `position`, `feetY` и `dead` —
 * **геттеры** (src/alien.js:99–102), поэтому запись `feetY = …` или `dead = false`
 * бросила бы TypeError в строгом модуле, а тело осталось бы на прежнем месте.
 * Чужой ставится через `pos` и `health` ровно тем же приёмом, что его собственный
 * `respawn`.
 */
function placeOn(body, p) {
  if (body.pos) {
    body.pos.set(p.x, p.y + body.cfg.radius, p.z);
    body.up.set(0, 1, 0);
    body.fwd.set(0, 0, 1);
    body.pitch = 0;
    body.vel.set(0, 0, 0);
    body.grounded = true;
    body.health = body.maxHealth;
    body.offstage = false;
    body.respawnTimer = 0;
    body.group.visible = true;
    body._syncMesh();
    return;
  }
  body.group.position.set(p.x, p.y, p.z);
  body.feetY = p.y;
  body.path = null;
  body.pathIndex = 0;
  body.wander = null;
  body.repathTimer = 0;
  body.offstage = false;
  body.dead = false;
  body.respawnTimer = 0;
  body.group.visible = true;
}

/**
 * Карта **обычной** главы — контроль, что правку открытого мира эти главы не
 * платят: ни `streamStep`, ни `isBuiltAt` у них нет, и гейт по `typeof` обязан
 * обойти правило стороной. Плита 40 м: граф строится за кадр, а меряется ровно
 * наличие члена. `bounds` обязана быть — по ней клампится кузов.
 */
function plainSpec() {
  return {
    kind: 'json2', units: 'meters',
    ground: { size: 40, y: 0 },
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    spawn: { x: 0, z: 0 }, buildings: [], roads: [], channels: [],
  };
}

/** Буферы WebGL, досчитанные после кадра нашей сцены. */
function sceneBudget(world) {
  const r = window.game.renderer;
  r.render(world.scene, world.camera);
  return { geometries: r.info.memory.geometries, textures: r.info.memory.textures };
}

/** Разлом графа на подписи: узлы по ключам и рёбра по парам ключей. */
function navSignature(nav) {
  const keyOf = new Map();
  for (const [key, i] of nav.byKey) keyOf.set(i, key);
  const nodes = [...nav.byKey.keys()].sort();
  const edges = [];
  for (const [key, i] of nav.byKey) {
    for (const j of nav.adj[i]) if (keyOf.get(j) > key) edges.push(`${key}|${keyOf.get(j)}`);
  }
  return { nodes, edges: edges.sort() };
}

/**
 * Разбиение графа на компоненты, помеченное ключами узлов: что обязано совпасть
 * при двух порядках достройки. Рёбра-выбор (`_linkClosest` берёт не больше трёх
 * ближайших) совпадать не обязаны — совпадать обязано «откуда куда дойдёшь».
 */
function partitionOf(map) {
  const nav = map.nav;
  const keyOf = new Map();
  for (const [key, i] of nav.byKey) keyOf.set(i, key);
  const seen = new Set();
  const groups = [];
  for (const [, i] of nav.byKey) {
    if (seen.has(i)) continue;
    const q = [i];
    seen.add(i);
    const members = [];
    while (q.length) {
      const cur = q.pop();
      members.push(keyOf.get(cur));
      for (const j of nav.adj[cur]) if (!seen.has(j)) { seen.add(j); q.push(j); }
    }
    members.sort();
    groups.push(members);
  }
  groups.sort((a, b) => (b.length - a.length) || (a[0] < b[0] ? -1 : 1));
  const byKey = new Map();
  groups.forEach((g, n) => g.forEach((k) => byKey.set(k, n)));
  return { byKey, sizes: groups.map((g) => g.length) };
}

/** Рёбра, которые поле **итогового** набора клеток уже не признаёт. */
function staleEdgesOf(map) {
  const nav = map.nav;
  const keyOf = new Map();
  for (const [key, i] of nav.byKey) keyOf.set(i, key);
  const bad = [];
  for (const [key, i] of nav.byKey) {
    for (const j of nav.adj[i]) {
      if (j <= i) continue;
      if (!map.edgeOk(nav.pos[i], nav.pos[j])) bad.push(`${key}|${keyOf.get(j)}`);
    }
  }
  return bad;
}

/** Длина маршрута между двумя узлами по ключам (null — пути нет). */
function routeOf(map, fromKey, toKey) {
  const nav = map.nav;
  const i = nav.byKey.get(fromKey), j = nav.byKey.get(toKey);
  if (i === undefined || j === undefined) return null;
  const route = map.findPath(nav.pos[i], nav.pos[j]);
  if (!route) return null;
  let m = 0;
  for (let k = 1; k < route.length; k++) m += Math.hypot(route[k].x - route[k - 1].x, route[k].z - route[k - 1].z);
  return { nodes: route.length, m };
}

/** Эталон: тот же город, собранный одним `JsonMap` из владеющих копий чанков. */
async function makeWholeWorld(scene) {
  const spec = {
    kind: 'json2', units: 'meters', ground: OPEN_600.map.ground, bounds: OPEN_600.map.bounds,
    spawn: OPEN_600.map.spawn, windows: OPEN_600.map.windows, clutter: OPEN_600.map.clutter,
    signage: OPEN_600.map.signage,
  };
  for (const key of COLLECTIONS) spec[key] = [];
  for (const cell of OPEN_600.map.cells) {
    const data = await chunkData(cell.file);
    for (const key of COLLECTIONS) {
      for (const rec of data[key] ?? []) if (rec.owner === true) spec[key].push(rec);
    }
  }
  const map = new JsonMap(spec);
  // картинка обязательна: счётчики выводимых рядов (`windowCount` и два других)
  // живёт в `_buildPicture`, а без неё сравнение «мир из клеток рисует то же»
  // было бы сравнением с `undefined`
  if (scene) map.build(scene);
  return map;
}

/** Сетка точек внутри плиты, по которой сравниваются опора и проходимость. */
function plateSamples(map, step = PLATE_STEP) {
  const pts = [];
  const h = map.width / 2;
  for (let x = -h + step / 2; x < h; x += step) {
    for (let z = -h + step / 2; z < h; z += step) pts.push({ x, z });
  }
  return pts;
}

/**
 * Цена одной достройки по членам работы: обёртки навешиваются на прототип на
 * время замера и снимаются в `finally` — числа идут в § 6.3 плана, и «сколько
 * стоит чанк» без разложения на склейку, решётку и картинку ничего не решает.
 */
async function timedLoad(world, id) {
  const acc = { data: 0, picturePass: 0, merge: 0, lattice: 0, nav: 0, picture: 0 };
  const proto = WorldMap.prototype;
  const held = {};
  const wrap = (name, bucket) => {
    held[name] = proto[name];
    proto[name] = function (...args) {
      const t = performance.now();
      const r = held[name].apply(this, args);
      acc[bucket] += performance.now() - t;
      return r;
    };
  };
  // `applyChunk` зовёт `collectPass` ровно дважды: первый вызов — проход
  // данных клетки, второй — проход картинки (геометрия и вода по владельцам)
  let pass = 0;
  held.collectPass = proto.collectPass;
  proto.collectPass = function (...args) {
    const t = performance.now();
    const r = held.collectPass.apply(this, args);
    const dt = performance.now() - t;
    pass++;
    if (pass === 1) acc.data += dt; else acc.picturePass += dt;
    return r;
  };
  wrap('_rebuildWorld', 'merge');
  wrap('_navLattice', 'lattice');
  // фазы связывания с этапа 4 — отдельные срезы, общего вызова `_navPasses`
  // больше нет; `nav.seal()` (0,03…0,14 мс по той же мере) здесь не учтён,
  // потому что живёт на `NavGraph`, а не на карте
  for (const phase of ['_navRooms', '_navRoofs', '_navStairs', '_navDecks', '_navWater', '_navDoors']) {
    wrap(phase, 'nav');
  }
  wrap('_buildPicture', 'picture');
  try {
    const t = performance.now();
    await world.map.loadChunk(id);
    acc.total = performance.now() - t;
  } finally {
    for (const name of Object.keys(held)) proto[name] = held[name];
  }
  return acc;
}

// ------------------------------------------------------------------ проверки

async function testCatalogShape() {
  const map = new WorldMap(OPEN_600.map);
  const cells = map.cells;
  const plate = OPEN_600.map.ground.size;
  const infoWorld = COLLECTIONS.filter((k) => (OPEN_600.map[k] ?? []).length > 0);
  const grid = Math.sqrt(cells.length);
  const rectsTouch = cells.every((c) => c.rect.minX >= -plate / 2 - 1e-6 && c.rect.maxX <= plate / 2 + 1e-6);
  const overlap = map.stream.overlap;
  return {
    name: 'index.js: 9 клеток, мировая плита, выводимые ряды один раз',
    passed: cells.length === 9 && grid === 3 && rectsTouch && infoWorld.length === 0
      && !!map.stream && !!map.skeleton && overlap > 0,
    info: `клеток ${cells.length} (сетка ${grid}×${grid}), плита ${plate} м, коллекций содержимого в index.js — ${infoWorld.length},`
      + ` скелет ${map.skeleton.nodes.length} узлов / ${map.skeleton.edges.length} рёбер, маргин ${overlap} м`,
  };
}

async function testOneChunkFromTwoFiles() {
  const world = await makeWorld();
  const id = world.map.spawnCell().id;
  const t = await timedLoad(world, id);
  const cell = world.map.cellById.get(id);
  const data = await chunkData(cell.file);
  const merged = COLLECTIONS.reduce((s, k) => s + (world.map[k] ?? []).length, 0);
  const owned = COLLECTIONS.reduce((s, k) => s + (data[k] ?? []).filter((r) => r.owner === true).length, 0);
  const participants = COLLECTIONS.reduce((s, k) => s + (data[k] ?? []).length, 0);
  const meshes = world.scene.children.filter((o) => o.isMesh).length;
  const ok = merged === participants && world.map.nav.pos.length > 0 && meshes > 0
    && t.total > 0 && owned > 0;
  world.map.dispose();
  return {
    name: 'один чанк собирается из index.js и одного файла',
    passed: ok,
    info: `клетка '${id}': файл даёт ${participants} записей (${owned} владеющих), мировой набор ${merged},`
      + ` узлов ${world.map.nav.pos.length}, рёбер ${world.map.nav.adj.reduce((s, a) => s + a.length, 0) / 2},`
      + ` мешей в сцене ${meshes}, окон ${world.map.windowCount}, неона ${world.map.signageCount},`
      + ` мусора ${world.map.clutterCount}; сборка ${t.total.toFixed(0)} мс`
      + ` (данные ${t.data.toFixed(0)}, склейка+индексы ${t.merge.toFixed(0)}, решётка ${t.lattice.toFixed(0)},`
      + ` фазы навигации ${t.nav.toFixed(0)}, проход картинки ${t.picturePass.toFixed(0)},`
      + ` меши ${t.picture.toFixed(0)})`,
  };
}

async function testUnloadedIsBlocked() {
  const world = await makeWorld();
  const id = world.map.spawnCell().id;
  await world.map.loadChunk(id);
  const pts = plateSamples(world.map);
  let blockedOut = 0, openOut = 0, openIn = 0, blockedIn = 0;
  for (const p of pts) {
    const b = world.map.isBlocked(p.x, p.z, CONFIG.radius, world.map.groundHeightAt(p.x, p.z), CONFIG.eyeHeight);
    if (inLoaded(world.map, p.x, p.z)) (b ? blockedIn++ : openIn++); else (b ? blockedOut++ : openOut++);
  }
  const anchors = world.map.openPositions();
  const badAnchor = anchors.filter((a) => !inLoaded(world.map, a.x, a.z)).length;
  const navNodes = world.map.nav.pos.length;
  // Годность узла — это **два** условия, и гейт сверяет их оба, а не одно:
  // «внутри загруженной клетки» и «достижим от спавна» (§ 10.12(а) плана).
  // Свес за край — законные длинные объекты (настил и сход русла едут в каталог
  // целиком, § 4.1 плана): они непроходимы, пока их клетка не построена.
  // Достижимость считается здесь своим обходом **без** navFit — иначе гейт
  // проверял бы предикат им же самим. Замер стартовой клетки 0_1: 10 узлов
  // свеса (все вне клетки) и один внутри — (−222, −1,72, 42), deg 0: решётка
  // поставила узел на дно русла, а `wade: false` забраковал все его рёбра.
  const nav = world.map.nav;
  const start = nav.nearestNode(world.map.spawn.x, world.map.spawn.y ?? 0, world.map.spawn.z);
  const reached = new Uint8Array(navNodes);
  if (start >= 0) {
    const q = [start];
    reached[start] = 1;
    for (let h = 0; h < q.length; h++) {
      for (const nb of nav.adj[q[h]]) if (!reached[nb]) { reached[nb] = 1; q.push(nb); }
    }
  }
  let mismatch = 0, unfitInside = 0, fitOutside = 0, stray = 0, isolated = 0;
  nav.pos.forEach((p, i) => {
    const inside = inLoaded(world.map, p.x, p.z);
    const fit = world.map.navFit(i);
    if (fit !== (inside && reached[i] === 1)) mismatch++;
    if (!inside) { stray++; if (fit) fitOutside++; } else if (!fit) { unfitInside++; if (!nav.adj[i].length) isolated++; }
  });
  world.map.dispose();
  return {
    name: 'незастроенная клетка непроходима по всей плите, якорей и узлов чужих нет',
    passed: openOut === 0 && badAnchor === 0 && anchors.length > 0 && openIn > 0
      && mismatch === 0 && fitOutside === 0,
    info: `${pts.length} точек плиты: вне загруженной клетки ${blockedOut} заблокировано / ${openOut} открыто,`
      + ` внутри — ${openIn} открыто / ${blockedIn} заблокировано; якорей ${anchors.length} (чужих ${badAnchor}),`
      + ` узлов графа ${navNodes}, из них вне загруженной клетки ${stray} (годных среди них ${fitOutside}),`
      + ` внутри недостижимых от спавна ${unfitInside} (без рёбер вовсе ${isolated}),`
      + ` годных ${navNodes - stray - unfitInside}, расхождений navFit с «в клетке и достижим» ${mismatch}`,
  };
}

async function testWorldDoesNotShift() {
  const world = await makeWorld();
  const spawn0 = { ...world.map.spawn };
  const plate0 = { width: world.map.width, depth: world.map.depth };
  // `worldToNormalized` отдаёт пару `[u, w]` (тот же контракт, что у остальных карт)
  const norm0 = [world.map.worldToNormalized(spawn0.x, spawn0.z),
    world.map.worldToNormalized(OPEN_600.gameplay.exit.x, OPEN_600.gameplay.exit.z)];
  await loadCells(world, world.map.cells.map((c) => c.id));
  const spawn1 = { ...world.map.spawn };
  const norm1 = [world.map.worldToNormalized(spawn1.x, spawn1.z),
    world.map.worldToNormalized(OPEN_600.gameplay.exit.x, OPEN_600.gameplay.exit.z)];
  const moved = Math.hypot(spawn1.x - spawn0.x, spawn1.z - spawn0.z);
  const normMoved = Math.max(
    Math.abs(norm1[0][0] - norm0[0][0]), Math.abs(norm1[0][1] - norm0[0][1]),
    Math.abs(norm1[1][0] - norm0[1][0]), Math.abs(norm1[1][1] - norm0[1][1]),
  );
  world.map.dispose();
  return {
    name: 'мир не сдвигается: спавн, плита и нормировка миникараты постоянны',
    passed: moved === 0 && world.map.width === plate0.width && world.map.depth === plate0.depth
      && normMoved === 0,
    info: `спавн (${spawn0.x}, ${spawn0.z}) → (${spawn1.x}, ${spawn1.z}): сдвиг ${moved} м при 9 достройках;`
      + ` плита ${plate0.width}×${plate0.depth} м; worldToNormalized спавна и точки B сдвинулся на ${normMoved}`,
  };
}

async function testSeamEdge() {
  const world = await makeWorld();
  const a = world.map.spawnCell().id;
  await world.map.loadChunk(a);
  const before = world.map.nav.adj.reduce((s, x) => s + x.length, 0) / 2;
  const keysBefore = new Set(world.map.nav.byKey.keys());
  // сосед по x: клетка той же строки правее — через её шов идёт улица
  const [i, j] = a.split('_').map(Number);
  const right = world.map.cellById.get(`${i + 1}_${j}`) ? `${i + 1}_${j}` : `${i}_${j + 1}`;
  await world.map.loadChunk(right);
  const after = world.map.nav.adj.reduce((s, x) => s + x.length, 0) / 2;
  let crossing = 0;
  for (const [, idx] of world.map.nav.byKey) {
    const p = world.map.nav.pos[idx];
    for (const k of world.map.nav.adj[idx]) {
      const q = world.map.nav.pos[k];
      if (cellOf(world.map, p.x, p.z) !== cellOf(world.map, q.x, q.z)) crossing++;
    }
  }
  const route = world.map.findPath(
    { x: world.map.spawn.x, y: world.map.spawn.y, z: world.map.spawn.z },
    { x: world.map.cellById.get(right).rect.minX + 40, y: 0, z: world.map.spawn.z },
  );
  const crossed = route ? route.some((p, k) => k > 0
    && cellOf(world.map, p.x, p.z) !== cellOf(world.map, route[k - 1].x, route[k - 1].z)) : false;
  const newNodes = world.map.nav.byKey.size - keysBefore.size;
  world.map.dispose();
  return {
    name: 'шов: ребро между клетками появляется только когда загружены обе',
    passed: crossing >= 4 && route !== null && crossed && newNodes > 0,
    info: `клетки '${a}' + '${right}': рёбер ${before} → ${after} (+${after - before}),`
      + ` новых узлов ${newNodes}, рёбер через шов ${crossing}, маршрут через границу`
      + ` ${route ? `${route.length} узлов, пересечение шва ${crossed ? 'есть' : 'нет'}` : 'не найден'}`,
  };
}

async function testSameAsWholeWorld() {
  const world = await makeWorld();
  await loadCells(world, world.map.cells.map((c) => c.id));
  const refScene = new THREE.Scene();
  const whole = await makeWholeWorld(refScene);
  const countersWorld = {
    windows: world.map.windowCount, signage: world.map.signageCount, clutter: world.map.clutterCount,
  };
  const countersWhole = { windows: whole.windowCount, signage: whole.signageCount, clutter: whole.clutterCount };
  const lists = ['solids', 'surfaces', 'blockers', 'prisms', 'railWedges', 'sweeps', 'holes', 'deckPlates'];
  const diff = lists.map((k) => [k, (world.map[k] ?? []).length - (whole[k] ?? []).length]);
  const maxDiff = diff.reduce((s, [k, v]) => (Math.abs(v) > Math.abs(s[1]) ? [k, v] : s), ['—', 0]);
  // дубликаты по швам: участник, попавший в k загруженных клеток, лежит в поле
  // k раз (§ 4.1), поэтому с эталоном сравнивается не длина списка, а число
  // РАЗЛИЧАЮЩИХСЯ записей и вердикты опоры/проходимости
  const uniqWorld = new Set(world.map.surfaces.map((s) => `${s.minX}|${s.minZ}|${s.topY}`)).size;
  const uniqWhole = new Set(whole.surfaces.map((s) => `${s.minX}|${s.minZ}|${s.topY}`)).size;
  let supportDiff = 0, blockDiff = 0, n = 0;
  for (let x = -290; x <= 290; x += 20) {
    for (let z = -290; z <= 290; z += 20) {
      n++;
      const a = world.map.groundHeightAt(x, z), b = whole.groundHeightAt(x, z);
      if (Math.abs(a - b) > 1e-6) supportDiff++;
      const wa = world.map.isBlocked(x, z, CONFIG.radius, a, CONFIG.eyeHeight);
      const wb = whole.isBlocked(x, z, CONFIG.radius, b, CONFIG.eyeHeight);
      if (wa !== wb) blockDiff++;
    }
  }
  const quadsOf = (scene) => {
    const sum = { windows: 0, signage: 0 };
    scene.traverse((o) => {
      if (o.isInstancedMesh && o.userData.quad) sum[o.userData.quad] += o.count;
    });
    return sum;
  };
  // снимается до `dispose()`: выгрузка обязана оставить ровно ту же картинку,
  // а после неё в сцене мира не остаётся ничего
  const qWorld = quadsOf(world.scene);
  world.map.dispose();
  const qWhole = quadsOf(refScene);
  whole.dispose();
  return {
    name: 'девять клеток рисуют и держат то же, что тот же город целиком',
    passed: countersWorld.windows === countersWhole.windows
      && countersWorld.signage === countersWhole.signage
      && countersWorld.clutter === countersWhole.clutter
      && qWorld.windows === qWhole.windows && qWorld.signage === qWhole.signage
      && uniqWorld === uniqWhole && supportDiff === 0 && blockDiff === 0,
    info: `ряды: окон ${countersWorld.windows} против ${countersWhole.windows}, неон ${countersWorld.signage}`
      + ` против ${countersWhole.signage}, мусор ${countersWorld.clutter} против ${countersWhole.clutter};`
      + ` инстансов в сценах ${qWorld.windows} + ${qWorld.signage} против ${qWhole.windows} + ${qWhole.signage};`
      + ` опор (различающихся записей) ${uniqWorld} против ${uniqWhole}; опора и проходимость совпали на ${n}`
      + ` пробах (расхождений ${supportDiff} / ${blockDiff}); длины списков мира относительно эталона:`
      + ` ${diff.map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`).join(', ')} (максимум по ${maxDiff[0]})`,
  };
}

async function testMemoryCircle() {
  const world = await makeWorld();
  const base = sceneBudget(world);
  const ids = world.map.cells.map((c) => c.id);
  const loads = [];
  const timers = [];
  for (let round = 0; round < 2; round++) {
    for (const id of ids) {
      const t = performance.now();
      await world.map.loadChunk(id);
      timers.push(performance.now() - t);
      loads.push(world.map.loaded.size);
      // кадр после каждой достройки: без него меши не уехали бы в WebGL, и
      // «буферы вернулись» считалось бы по счётчику никогда не рендеренной сцены
      sceneBudget(world);
    }
  }
  const full = sceneBudget(world);
  const t0 = performance.now();
  for (const id of ids) world.map.unloadChunk(id);
  const unloadMs = performance.now() - t0;
  const after = sceneBudget(world);
  const sorted = timers.slice().sort((a, b) => a - b);
  world.map.dispose();
  return {
    name: 'круг по 9 чанкам возвращает renderer.info.memory к исходному',
    passed: after.geometries === base.geometries && after.textures === base.textures
      && full.geometries > base.geometries && world.map.loaded.size === 0,
    info: `буферов до ${base.geometries} геометрий / ${base.textures} текстур → при 9 клетках`
      + ` ${full.geometries} / ${full.textures} → после выгрузки ${after.geometries} / ${after.textures};`
      + ` выгрузка 9 клеток ${unloadMs.toFixed(0)} мс; 18 достроек: медиана`
      + ` ${sorted[Math.floor(sorted.length / 2)].toFixed(0)} мс, худшая ${sorted[sorted.length - 1].toFixed(0)} мс`,
  };
}

async function testTwoOrders() {
  const ids = OPEN_600.map.cells.map((c) => c.id);
  const subset = [ids[0], ids[4], ids[8], ids[3]];
  const fw = await makeWorld();
  const rv = await makeWorld();
  await loadCells(fw, subset);
  await loadCells(rv, [...subset].reverse());
  const a = navSignature(fw.map.nav);
  const b = navSignature(rv.map.nav);
  const sameNodes = a.nodes.length === b.nodes.length && a.nodes.every((k, i) => k === b.nodes[i]);
  const edgesA = new Set(a.edges), edgesB = new Set(b.edges);
  const edgeDiff = a.edges.filter((k) => !edgesB.has(k)).length + b.edges.filter((k) => !edgesA.has(k)).length;
  const pa = partitionOf(fw.map), pb = partitionOf(rv.map);
  let partDiff = 0;
  for (const [k, n] of pa.byKey) if (pb.byKey.get(k) !== n) partDiff++;
  const stale = staleEdgesOf(fw.map).length + staleEdgesOf(rv.map).length;
  const listsSame = ['solids', 'surfaces', 'blockers', 'prisms', 'sweeps', 'holes']
    .every((k) => fw.map[k].length === rv.map[k].length);
  let supportDiff = 0;
  for (let x = -290; x <= 290; x += 20) {
    for (let z = -290; z <= 290; z += 20) {
      if (Math.abs(fw.map.groundHeightAt(x, z) - rv.map.groundHeightAt(x, z)) > 1e-9) supportDiff++;
    }
  }
  // маршруты между одними и теми же узлами: выбор ребра (`_linkClosest` берёт
  // не больше трёх ближайших) зависит от того, что уже стоит в графе, поэтому
  // мера — длина маршрута, а не совпадение рёбер. Предел не выдуманный: шаг
  // своей решётки (`J.navStep`), то есть длиннее на один узел маршрута.
  const keys = a.nodes;
  let worstNodes = 0, worstMeters = 0, routePairs = 0;
  for (let n = 0; n < 7; n++) {
    const pair = [keys[Math.floor(n * keys.length / 7)], keys[Math.floor((6 - n) * keys.length / 7)]];
    const ra = routeOf(fw.map, pair[0], pair[1]);
    const rb = routeOf(rv.map, pair[0], pair[1]);
    if ((ra === null) !== (rb === null)) { worstNodes = Infinity; continue; }
    if (!ra) continue;
    routePairs++;
    worstNodes = Math.max(worstNodes, Math.abs(ra.nodes - rb.nodes));
    worstMeters = Math.max(worstMeters, Math.abs(ra.m - rb.m));
  }
  fw.map.dispose();
  rv.map.dispose();
  return {
    name: 'порядок достройки не меняет ни узлов, ни связности, ни опор',
    passed: sameNodes && partDiff === 0 && stale === 0 && listsSame && supportDiff === 0
      && worstMeters <= J.navStep,
    info: `клетки ${subset.join(', ')} прямо и обратно: узлов ${a.nodes.length} / ${b.nodes.length}`
      + ` (ключи равны — ${sameNodes}), разбиение на компоненты совпало (${partDiff} расхождений из ${pa.byKey.size},`
      + ` компонент ${pa.sizes.length} / ${pb.sizes.length}, крупнейшая ${pa.sizes[0]}), рёбер ${a.edges.length} /`
      + ` ${b.edges.length}, расхождение выбора ${edgeDiff} (${(edgeDiff * 100 / a.edges.length).toFixed(2)} %),`
      + ` просроченных рёбер ${stale}; маршруты ${routePairs} пар разошлись не больше чем на ${worstNodes} узел`
      + ` и ${worstMeters.toFixed(1)} м при решётке ${J.navStep} м; индексы равны — ${listsSame},`
      + ` опоры разошлись на ${supportDiff} пробах`,
  };
}

async function testNavRestricted() {
  const world = await makeWorld();
  const loaded = [world.map.spawnCell().id];
  await world.map.loadChunk(loaded[0]);
  const far = OPEN_600.map.cells.find((c) => c.id !== loaded[0]
    && Math.hypot(c.rect.minX - world.map.spawn.x, c.rect.minZ - world.map.spawn.z) > 250);
  const target = { x: (far.rect.minX + far.rect.maxX) / 2, y: 0, z: (far.rect.minZ + far.rect.maxZ) / 2 };
  const route = world.map.findPath(
    { x: world.map.spawn.x, y: world.map.spawn.y, z: world.map.spawn.z }, target,
  );
  // цель вне загруженной клетки либо не имеет годного узла вовсе (маршрута нет),
  // либо подтягивается к ближнему годному — но ни одна точка маршрута не смеет
  // лежать там, где `isBlocked` истинен по признаку «клетка не построена»
  const outside = route ? route.filter((p) => !inLoaded(world.map, p.x, p.z)).length : 0;
  const distToTarget = route ? Math.hypot(route[route.length - 1].x - target.x, route[route.length - 1].z - target.z) : null;
  let wanderOut = 0;
  for (let k = 0; k < 40; k++) {
    const p = world.map.randomNavPoint(world.map.spawn.x, world.map.spawn.z, 400);
    if (p && !inLoaded(world.map, p.x, p.z)) wanderOut++;
  }
  const overhang = world.map.nav.pos.filter((p) => !inLoaded(world.map, p.x, p.z)).length;
  world.map.dispose();
  return {
    name: 'маршрут и блуждание не заходят в незастроенную клетку',
    passed: outside === 0 && wanderOut === 0 && (route === null || distToTarget > 20),
    info: `цель в центре клетки '${far.id}' при загруженной '${loaded[0]}': findPath →`
      + ` ${route === null ? 'пути нет' : `${route.length} узлов, последний в ${distToTarget.toFixed(0)} м от цели (годного узла в клетке цели нет)`};`
      + ` точек маршрута вне загруженной — ${outside}; 40 случайных точек в радиусе 400 м вне загруженного — ${wanderOut};`
      + ` узлов-свесов за краем загруженной клетки ${overhang} (все отвергнуты navFit)`,
  };
}

/**
 * Гейт этапа 5, часть 1 — сам член контракта и дыра, ради которой он введён.
 *
 * Дыра строится **выгрузкой средней клетки при восьми загруженных соседях**:
 * `bounds` (габарит загруженного содержимого) при этом остаётся примерно всей
 * плитой, а застроенности в центре нет — ровно тот класс случаев, который
 * гнутое окно выдаёт как 3 732 дыр из 15 688 (23,8 %, § 6 этапа 5). Второй
 * предел — вердикт `isBuiltAt` обязан совпадать с независимым перебором
 * прямоугольников загруженных клеток: иначе член контракта стал бы второй
 * правдой о застроенности, а не её вопросом.
 */
async function testBuiltMemberAndBoundsHole() {
  const world = await makeWorld();
  const map = world.map;
  await loadCells(world, map.cells.map((c) => c.id));
  const centre = '1_1';
  map.unloadChunk(centre);
  const loadedCount = map.loaded.size;
  const b = map.bounds;
  let holes = 0, insideBounds = 0, outsideBounds = 0, fitInHole = 0;
  map.nav.pos.forEach((p, i) => {
    if (inLoaded(map, p.x, p.z)) return;
    holes++;
    if (inBounds(b, p.x, p.z)) insideBounds++; else outsideBounds++;
    if (map.navFit(i)) fitInHole++;
  });
  const rects = [...map.loaded.values()].map((e) => e.cell.rect);
  let verdictDiff = 0, probes = 0;
  for (let x = -295; x <= 295; x += 25) {
    for (let z = -295; z <= 295; z += 25) {
      probes++;
      const want = rects.some((r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ);
      if (want !== map.isBuiltAt(x, z)) verdictDiff++;
    }
  }
  const cRect = map.cellById.get(centre).rect;
  const holeInsideBounds = inBounds(b, (cRect.minX + cRect.maxX) / 2, (cRect.minZ + cRect.maxZ) / 2);
  // обычный тип карты члена не имеет, и правило снятия обязано gated-иться
  // наличием `streamStep`, а не этим методом: иначе карта из брифа упала бы на
  // первом же кадре с «isBuiltAt is not a function»
  const memberHere = typeof map.isBuiltAt;
  const jsonHasIt = typeof JsonMap.prototype.isBuiltAt;
  const jsonStreamless = typeof new JsonMap(plainSpec()).streamStep;
  map.dispose();
  return {
    name: 'isBuiltAt — член контракта открытого мира, и он точнее габарита',
    passed: memberHere === 'function' && jsonHasIt === 'undefined' && jsonStreamless === 'undefined'
      && holes > 0 && insideBounds > 0 && fitInHole === 0 && verdictDiff === 0 && holeInsideBounds,
    info: `клетка '${centre}' выгружена при ${loadedCount} загруженных: узлов графа в дыре ${holes}, из`
      + ` них внутри bounds ${insideBounds} (габарит их не видит, и дыра лежит в его середине —`
      + ` ${holeInsideBounds ? 'да' : 'нет'}), снаружи ${outsideBounds}; годных по navFit из дыры`
      + ` ${fitInHole} (обязано быть ноль, иначе маршрут ведёт в несобранный район); вердикт isBuiltAt`
      + ` совпал с независимым перебором ${rects.length} прямоугольников на ${probes} точках (расхождений`
      + ` ${verdictDiff}); у JsonMap ни isBuiltAt (${jsonHasIt}), ни streamStep (${jsonStreamless}) нет.`,
  };
}

/**
 * Гейт этапа 5, часть 2 — «враги вне окна сняты молча и не в raycast/миникарте».
 *
 * Тела ставятся **на узлы выгруженной клетки руками**: правило обязано сработать
 * по одному кадру, а не «когда-нибудь, когда ИИ выведет их за окно». Молчаливость
 * меряется тремя числами: `kills` не изменился (убийство не засчитано), ни у
 * кого не выставлен флаг `dead` (не запущена анимация падения), и `group.visible`
 * снят. Второй предел — обратный: кто стоит на застроенной клетке, тот снят не
 * был, иначе правило оказалось бы стиралкой легальных врагов (замер `isBlocked`
 * как кандидата: на главе 12 без стриминга — 2 054 и 643 «стеновых» проба из
 * 18 000 в двух прогонах, подряд до 1 776 и 479 кадров; разброс даёт
 * стохастический маршрут врагов). Третий — `respawn` обязан вернуть тело в
 * застроенную клетку, иначе снятие превратилось бы в мигание на границе окна.
 *
 * И четвёртый, для обычных глав: `Enemies` поверх `JsonMap` за правило платит
 * **ноль вызовов** — гейт по `typeof map.streamStep`, а не по `map.kind`.
 */
async function testEnemiesOffstageInUnbuiltCell() {
  const world = await makeWorld();
  const map = world.map;
  await loadCells(world, map.cells.map((c) => c.id));
  map.unloadChunk('1_1');
  const holeNodes = [];
  const builtNodes = [];
  map.nav.pos.forEach((p) => {
    if (inLoaded(map, p.x, p.z)) {
      // «контроль» берётся только из узлов **вдалеке** от дыры (центр клетки
      // 1_1 — это (0,0), шаг 160 м): за один кадр ИИ не успевает сойти в дыру,
      // и «не снят» означает ровно «правило не тронуло законное тело»
      if (Math.hypot(p.x, p.z) > 160) builtNodes.push(p);
    } else holeNodes.push(p);
  });
  const player = fakePlayer(map);
  const tracers = { spawn() {} };
  const enemies = new Enemies(world.scene, map, player, world.camera, tracers, {
    count: OPEN_600.gameplay.enemies.count,
    alienCount: OPEN_600.gameplay.alienEnemies.count,
  });
  const items = enemies.items;
  const half = Math.ceil(items.length / 2);
  const pick = (list, n) => {
    const out = [];
    for (let i = 0; i < n; i++) out.push(list[Math.floor(i * list.length / n)]);
    return out;
  };
  const inHole = items.slice(0, half);
  const onBuilt = items.slice(half);
  inHole.forEach((e, i) => placeOn(e, pick(holeNodes, half)[i]));
  onBuilt.forEach((e, i) => placeOn(e, pick(builtNodes, onBuilt.length)[i]));
  const killsBefore = enemies.kills;
  enemies.update(1 / 60);
  const removed = inHole.filter((e) => e.offstage);
  const deathsStarted = items.filter((e) => e.dead).length;
  const hidden = removed.every((e) => e.group.visible === false);
  const survivorsKept = onBuilt.every((e) => !e.offstage);
  // инвариант правила: видимого тела в незастроенной клетке не остаётся
  const leftInHole = items.filter((e) => !e.offstage && !e.dead
    && !inLoaded(map, e.position.x, e.position.z)).length;
  let shown = 0, shownUnbuilt = 0;
  enemies.forEachVisible((p) => { shown++; if (!inLoaded(map, p.x, p.z)) shownUnbuilt++; });
  // raycast: вертикальный луч сквозь грудь снятого тела обязан промахнуться,
  // сквозь стоящее — попасть (иначе «промах» ничего не доказывает)
  const down = new THREE.Vector3(0, -1, 0);
  const rayAt = (e) => {
    const cy = e.hitOffsetY !== undefined ? e.hitOffsetY : 1.0;
    const o = new THREE.Vector3(e.position.x, e.position.y + cy + 8, e.position.z);
    return enemies.raycast(o, down, 12);
  };
  const human = (list) => list.filter((e) => e.hitOffsetY === undefined && !e.dead);
  const holeHit = human(inHole).map(rayAt).filter(Boolean).length;
  const builtHit = human(onBuilt).map(rayAt).filter(Boolean).length;
  // возрождение: таймер обнулён, следующий кадр должен поставить тело на узел
  // **застроенной** клетки (navFit) — проверка «нет мигания»
  for (const e of removed) e.respawnTimer = 0;
  enemies.update(1 / 60);
  const back = removed.filter((e) => !e.offstage);
  const backUnbuilt = back.filter((e) => !inLoaded(map, e.position.x, e.position.z)).length;
  // обычные главы: того же кода на JsonMap обязан проходить без единого вызова
  const plainMap = new JsonMap(plainSpec());
  const plainScene = new THREE.Scene();
  plainMap.build(plainScene);
  const plainPlayer = fakePlayer(plainMap);
  const plain = new Enemies(plainScene, plainMap, plainPlayer, world.camera, tracers,
    { count: 2, alienCount: 1 });
  let plainErr = null;
  try {
    plain.items.forEach((e, i) => placeOn(e, { x: i * 2, y: 0, z: 0 }));
    plain.update(1 / 60);
  } catch (err) {
    plainErr = err.message;
  }
  const plainSwept = plain.items.filter((e) => e.offstage).length;
  map.dispose();
  return {
    name: 'враг в выгруженной клетке снят молча, вне луча и миникарты, и возвращается застроенным',
    passed: plainErr === null && plain._streamed === false && plainSwept === 0
      && removed.length === half && survivorsKept && hidden && deathsStarted === 0
      && enemies.kills === killsBefore && leftInHole === 0 && shownUnbuilt === 0
      && shown === items.length - removed.length && holeHit === 0 && builtHit > 0
      && back.length > 0 && backUnbuilt === 0,
    info: `тел всего ${items.length} (дыра + застроенное окно пополам): из дыры снято ${removed.length}`
      + ` из ${half}, молча (смертей ${deathsStarted}, засчитанных убийств ${enemies.kills - killsBefore},`
      + ` скрытых групп ${hidden ? 'все' : 'не все'}); на застроенных клетках снято ${half - removed.length}`
      + ` (кандидат по bounds стёр бы их: узлы дыры лежат внутри габарита), видимых в дыре`
      + ` после кадра ${leftInHole}; forEachVisible отдал ${shown} позиций, незастроенных среди них`
      + ` ${shownUnbuilt}; лучей сквозь снятых ${holeHit} попаданий, сквозь стоящих ${builtHit} из`
      + ` ${human(onBuilt).length}; возрождений из снятых ${back.length}, вне застроенных ${backUnbuilt};`
      + ` на JsonMap: _streamed ${plain._streamed}, вызовов правила ${plainSwept === 0 ? 'ноль' : plainSwept},`
      + ` ошибка ${plainErr === null ? 'нет' : plainErr}`,
  };
}

/**
 * Гейт этапа 5, часть 3 — «точка B и маяк появляются только в загруженном
 * чанке» плюс то же правило для кузовов.
 *
 * Без него незастроенная клетка отвечает опорой «пол мира» — на фикстуре 0
 * против 0,12 м у построенной, а по всей плите расхождение доходит до 10,54 м
 * и в 1,3 % точек больше допуска `reached` по высоте (§ 6 этапа 5). Отсюда два
 * предела: не застроено — не видно и не достигается, а на достройке отметка
 * обязана пересечься со своей опорой (пересадка, а не прежний ноль). Для
 * кузовов тот же предел в двух дополнительных местах: `nearest` не смеет
 * предлагать посадку в невидимый корпус (мера: 868 кадров кузова из 2 400,
 * 36 %), а `forEachVisible` не смеет давать метку туда, куда человек не дойдёт.
 */
async function testExitAndCarsOnlyInBuiltCells() {
  const world = await makeWorld();
  const map = world.map;
  const spawnCell = map.spawnCell().id;
  await map.loadChunk(spawnCell);
  const ex = OPEN_600.gameplay.exit;
  const exitCell = map.cellAt(ex.x, ex.z).id;
  const goal = new ExitGoal(world.scene, map, ex, OPEN_600.gameplay.exitRadius);
  goal.update(0);
  const yBefore = goal.y;
  const hiddenBefore = goal.group.visible === false && goal.built === false;
  const reachedUnbuilt = goal.reached({ x: ex.x, z: ex.z, y: goal.y });
  const spots = [
    { x: map.spawn.x + 6, z: map.spawn.z + 6, yaw: 0.2 },
    { x: ex.x - 3, z: ex.z + 4, yaw: -0.4 },
  ];
  for (const s of spots) s.y = map.groundHeightAt(s.x, s.z, 500);
  const cars = new Cars(world.scene, map, { count: spots.length, spots });
  cars.update(1 / 60);
  const far = cars.items[1];
  const carHidden = far.built === false && far.group.visible === false;
  const yUnbuilt = far.pos.y;
  const boardable = cars.nearest(far.pos);
  let shownCars = 0, shownUnbuilt = 0;
  cars.forEachVisible((p) => {
    shownCars++;
    if (!inLoaded(map, p.x, p.z)) shownUnbuilt++;
  });
  await map.loadChunk(exitCell);
  goal.update(0.05);
  cars.update(1 / 60);
  const yBuilt = map.groundHeightAt(ex.x, ex.z, 500);
  // пересадка: отметка маяка обязана равняться опоре, которую карта отдаёт
  // **теперь** (тот же проба-сверху, что в конструкторе), а кузов — стоять на
  // своей опоре неподвижно (повторный проба с его отметки даёт то же число),
  // а не на «полу мира», который был у выгруженной клетки
  const reseedY = Math.abs(goal.y - yBuilt) < 1e-9
    && Math.abs(far.pos.y - far._support(0, 0, far.pos.y + CONFIG.building.stepUp)) < 1e-9;
  const reachedBuilt = goal.reached({ x: ex.x, z: ex.z, y: goal.y });
  const boardableAfter = cars.nearest(far.pos);
  const litAfterLoad = goal.built && goal.group.visible === true && far.built && far.group.visible === true;
  // на back-edge (снова выгрузить клетку) маяк обязан погаснуть, а не остаться
  // видимым с уехавшей опорой
  map.unloadChunk(exitCell);
  goal.update(0.1);
  cars.update(1 / 60);
  const hiddenAgain = goal.built === false && goal.group.visible === false && far.built === false;
  // обычные главы (9–13): правило отсекается отсутствием помпы, кузов обязан
  // остаться видимым и предлагаемым, а `isBuiltAt` у их карты не существует
  const plainScene = new THREE.Scene();
  const plainMap = new JsonMap(plainSpec());
  plainMap.build(plainScene);
  const plainCars = new Cars(plainScene, plainMap,
    { count: 1, spots: [{ x: 1, z: 1, yaw: 0, y: plainMap.groundHeightAt(1, 1, 500) }] });
  plainCars.update(1 / 60);
  const plainHidden = plainCars.items.filter((c) => !c.built).length;
  const plainBoardable = plainCars.nearest(plainCars.items[0].pos) !== null;
  goal.dispose(world.scene);
  cars.dispose();
  map.dispose();
  return {
    name: 'маяк точки B и кузов существуют только в застроенной клетке',
    passed: hiddenBefore && !reachedUnbuilt && carHidden && boardable === null
      && shownUnbuilt === 0 && litAfterLoad && reachedBuilt && boardableAfter && reseedY
      && hiddenAgain && plainCars._streamed === false && plainHidden === 0
      && plainBoardable && yBefore !== yBuilt,
    info: `точка B в клетке '${exitCell}' при загруженной '${spawnCell}': опора незастроенной клетки`
      + ` отвечает ${yBefore}, построенной — ${yBuilt} (разница ${(yBuilt - yBefore).toFixed(2)} м при`
      + ` допуске reached 3 м); до достройки: видимости нет (${hiddenBefore}), reached=${reachedUnbuilt};`
      + ` кузов в той же клетке: скрыт ${carHidden}, nearest отдал ${boardable === null ? 'null' : 'машину'},`
      + ` pos.y ${yUnbuilt}; меток миникарты ${shownCars}, из них незастроенных ${shownUnbuilt}; после`
      + ` достройки: маяк и кузов видны, reached=${reachedBuilt}, посадка ${boardableAfter ? 'доступна' : 'нет'},`
      + ` отметки пересажены на свою опору (${reseedY}); после повторной выгрузки снова скрыты`
      + ` (${hiddenAgain}); на JsonMap (главы 9–13): _streamed ${plainCars._streamed}, скрытых кузовов`
      + ` ${plainHidden}, посадка доступна — ${plainBoardable}.`,
  };
}

/**
 * Гейт этапа 5, часть 4 — «план миникараты не прыгает при перемещении окна».
 *
 * Прыгало две вещи. Масштаб: план `JsonMap` рисуется в локальном окне
 * `J.minimapRange` (130 м), а метки HUD идут через `worldToNormalized` по плите
 * (`viewHalf` = 324 м) — расхождение **2,492 раза**, свой игрок попадал на
 * 168 px планом против 173…178 px меткой. И «этаж»: выбор плиты по ближайшей
 * застроенной опорной поверхности менялся **2 раза за пеший маршрут** (0 плит →
 * 13 → 26). Открытый мир обязан держать одну систему координат — всю плиту, тот
 * же охват, что у нормировки, — поэтому мера здесь побайтовая: план при двух
 * разных `playerPos` в одном состоянии окна обязан сойтись байт в байт, а
 * пиксель мировой точки обязан не измениться после реального сдвига окна
 * помпой и сойтись с меткой (`worstPx` 0). Обычные главы правку не платят: у
 * них хук обязан остаться локальным окном вокруг игрока.
 */
async function testMinimapPlanFrame() {
  const world = await makeWorld();
  const map = world.map;
  await map.loadChunk(map.spawnCell().id);
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const draw = (px) => {
    const ctx = canvas.getContext('2d');
    map.drawMinimap(ctx, size, px);
    return ctx.getImageData(0, 0, size, size).data;
  };
  const a = draw({ x: map.spawn.x, y: 0, z: map.spawn.z });
  const b = draw({ x: 260, y: 0, z: -240 });
  const c = draw({ x: -280, y: 0, z: 280 });
  let differingBytes = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i] || a[i] !== c[i]) differingBytes++;
  const viewOf = () => map._minimapView({ x: 0, z: 0 });
  const pxOf = (v, x) => (x - v.cx + v.range) * size / (2 * v.range);
  const probe = 137.5;
  const v0 = viewOf();
  // реальный сдвиг окна помпой (машина, 120 м): застроенный набор меняется,
  // система координат плана — нет
  const walk = await pumpRoute(map, { speed: CONFIG.car.maxSpeed, distance: 120, ping: false });
  const v1 = viewOf();
  const frameMovedPx = Math.abs(pxOf(v1, probe) - pxOf(v0, probe));
  const ex = OPEN_600.gameplay.exit;
  const pts = [[map.spawn.x, map.spawn.z], [ex.x, ex.z], [probe, -probe], [-299, 299]];
  for (let i = 0; i < map.nav.pos.length; i += Math.max(1, Math.floor(map.nav.pos.length / 12))) {
    const p = map.nav.pos[i];
    pts.push([p.x, p.z]);
  }
  let worstPx = 0;
  for (const [x, z] of pts) {
    const [u, w] = map.worldToNormalized(x, z);
    worstPx = Math.max(worstPx, Math.abs(pxOf(v1, x) - u * size), Math.abs(pxOf(v1, z) - w * size));
  }
  const costs = [];
  for (let k = 0; k < 12; k++) {
    const t = performance.now();
    draw({ x: (k % 3) * 120 - 240, y: 0, z: (k % 2) * 200 - 100 });
    costs.push(performance.now() - t);
  }
  costs.sort((x, y) => x - y);
  const medCost = costs[costs.length >> 1];
  // дефолтная ветка хука — ею пользуются главы 9–13, не переопределявшие его:
  // обязана остаться **локальным** окном вокруг игрока (130 м при плите 600 —
  // то самое расхождение 2,49 с метками, которое открытому миру не годится)
  const pv = JsonMap.prototype._minimapView.call(map, { x: 10, z: -20 });
  const plainLocal = pv.cx === 10 && pv.cz === -20
    && pv.range === Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2);
  map.dispose();
  return {
    name: 'план миникараты держится одной системы координат и не прыгает',
    passed: differingBytes === 0 && frameMovedPx === 0 && worstPx < 0.5
      && v1.cx === 0 && v1.cz === 0 && v1.range === map.viewHalf && plainLocal && walk.steps > 0,
    info: `${pts.length} мировых точек: план и метка worldToNormalized разошлись худшим на ${worstPx.toFixed(3)} px`
      + ` (предел 0,5); план при трёх разных playerPos в одном окне совпал побайтно (расходящихся байтов из`
      + ` ${a.length} — ${differingBytes}); после сдвига окна помпой (${walk.steps} кадров, клеток в окне`
      + ` ${walk.maxLoaded}) центр и масштаб плана те же (cx ${v1.cx}, cz ${v1.cz}, range ${v1.range} против`
      + ` viewHalf ${map.viewHalf}), пиксель probe-точки сдвинулся на ${frameMovedPx} px; отрисовка плана`
      + ` ${medCost.toFixed(2)} мс (медиана 12); у не переопределяющей главы хук остался локальным:`
      + ` ${JSON.stringify(pv)} при плите ${map.width} м.`,
  };
}

/**
 * Прогон помпы по маршруту туда-обратно. `streamStep` зовётся ровно так, как
 * его зовёт `Game._tick` — до физики, аргументами `budgetMs, x, z, speed`, — а
 * кадром служит настоящая макрозадача: между кадрами разрешается `fetch` файла
 * клетки, и без этого помпа не сдвинулась бы с места (первая мера этапа 4
 * дала ровно нули на 4 000 кадров).
 *
 * Собственный rAF-цикл страницы на время прогона глушится: кадр главы на стенде
 * стоит **95…108 мс** ожидания макрозадачи (замер `.tmp/pump-run.mjs`, где та же
 * ставка глушила рендер явно), и 2 400 кадров пешего маршрута вылезли бы за
 * таймаут сюиты (420 с на прогон — первая попытка безглушения именно туда и
 * упёрлась). Мере это не мешает: меряется **синхронная работа** `streamStep` за
 * кадр, а не частота кадров, и глушение делает прогон даже строже по сети —
 * медианный шаг кадра стенда 4,6…15,6 мс (`gapMedianMs` в отчёте) всегда короче
 * настоящих 16,7 мс, так что у `fetch` клетки остаётся меньше wall-clock времени
 * на разбор, и `blockedLate === 0` на таком кадре сильнее, чем было бы в игре.
 *
 * Возвращает разложение худшего кадра на **атом** (один самый дорогой срез) и
 * **накопление** (всё остальное). Именно эта пара и есть вердикт § 7.2 п. 3:
 * накопление ограничено бюджетом, а атом (`commit` или `picture`) — нет, и
 * «влезает ли достройка в кадр» без разделения означало бы «платим чем: меньшей
 * клеткой или растяжкой».
 */
async function pumpRoute(map, opts) {
  const budget = opts.budget ?? CONFIG.jsonMap.pump.frameBudgetMs;
  const held = map._runSlice;
  // рендер главы — единственная тяжёлая работа, которая мешает кадрам прогона;
  // window.game здесь только потому, что сюита живёт на странице игры
  const game = typeof window !== 'undefined' ? window.game : null;
  const heldTick = game ? game._tick : null;
  if (game) game._tick = () => {};
  let inFrame = [];
  // цена каждого **среза** по всему прогону: из неё и назначается потолок атома,
  // а не из одного худшего кадра (хвост без распределения — это догадка)
  const sliceMs = new Map();
  map._runSlice = function (slice) {
    const t = performance.now();
    held.call(this, slice);
    const ms = performance.now() - t;
    const a = sliceMs.get(slice.label) ?? [];
    a.push(ms);
    sliceMs.set(slice.label, a);
    inFrame.push({ label: slice.label, ms });
  };
  const out = {
    steps: 0, worstFrameMs: 0, worstAtomMs: 0, worstAtomLabel: null, worstAccumMs: 0,
    overBudget: 0, workFrames: 0, idleMedianMs: null, medianWorkFrameMs: null,
    gapMedianMs: 0, gapWorstMs: 0, sliceWorst: null,
    blockedLate: 0, playableAtStep: null, unbuiltFrames: 0, maxLoaded: 0, maxRequests: 0,
    radius: 0, returned: true, built: 0, unloaded: 0, errors: 0,
    firstChunkMs: null, worstChunkMs: 0, fetchWorstMs: 0,
  };
  // снимок счётчиков **значениями**: `map.pump.stats` — тот же объект, что и
  // `st` ниже, и «дельта» по ссылке дала бы ноль на всех трёх полях
  const st0 = { built: map.pump.stats.built, unloaded: map.pump.stats.unloaded, errors: map.pump.stats.errors };
  try {
    const dt = 1 / 60;
    const leg = opts.distance / 2;
    const steps = opts.steps ?? Math.ceil(opts.distance / (opts.speed * dt));
    const frameMs = [];
    const workMs = [];
    const gapMs = [];
    let prevAt = performance.now();
    for (let k = 0; k < steps; k++) {
      await new Promise((r) => setTimeout(r, 0));
      const nowAt = performance.now();
      gapMs.push(nowAt - prevAt);
      prevAt = nowAt;
      inFrame = [];
      const raw = Math.min(opts.distance, k * opts.speed * dt);
      const back = raw % (2 * leg);
      const d = opts.ping ? (back <= leg ? back : 2 * leg - back) : raw;
      const x = map.spawn.x + d;
      const z = map.spawn.z;
      const t = performance.now();
      const ret = map.streamStep(budget, x, z, opts.speed);
      const ms = performance.now() - t;
      if (ret !== undefined) out.returned = false;
      frameMs.push(ms);
      let atom = 0;
      let atomLabel = null;
      for (const s of inFrame) {
        if (s.ms > atom) { atom = s.ms; atomLabel = s.label; }
      }
      if (inFrame.length) {
        out.workFrames += 1;
        workMs.push(ms);
      }
      out.steps += 1;
      out.worstFrameMs = Math.max(out.worstFrameMs, ms);
      out.worstAccumMs = Math.max(out.worstAccumMs, ms - atom);
      if (atom > out.worstAtomMs) { out.worstAtomMs = atom; out.worstAtomLabel = atomLabel; }
      if (ms > budget) out.overBudget += 1;
      out.maxLoaded = Math.max(out.maxLoaded, map.loaded.size);
      out.maxRequests = Math.max(out.maxRequests, map.pump.requests.size);
      out.radius = map.pump.radius;
      const own = map.cellAt(x, z);
      const entry = own ? map.loaded.get(own.id) : null;
      if (entry && entry.pic && out.playableAtStep === null) out.playableAtStep = k;
      // кадр, в котором клетка под ногами закоммичена, но ещё не нарисована, —
      // поп-ин, которым платят за растяжку; он не блокирует путь, поэтому и не
      // предел, а число в отчёте
      if (entry && !entry.pic) out.unbuiltFrames += 1;
      if (out.playableAtStep !== null && !entry) out.blockedLate += 1;
    }
    const med = (a) => {
      if (!a.length) return 0;
      const s = [...a].sort((x2, y2) => x2 - y2);
      return s[Math.floor(s.length / 2)];
    };
    out.idleMedianMs = med(frameMs.slice(-60));
    out.medianWorkFrameMs = med(workMs);
    // что стоил один «кадр» стенда на самом деле: при заглушённом рендере это
    // кламп `setTimeout(0)`, а не 16,7 мс, и мера обязана это показывать
    out.gapMedianMs = med(gapMs);
    out.gapWorstMs = gapMs.length ? Math.max(...gapMs) : 0;
    // распределение по меткам срезов: `med` — половина прогонов дешевле неё,
    // `p90` — 90 %; хвост (`worst`) без них выглядит случайностью
    const q = (a, p) => {
      if (!a.length) return 0;
      const s = [...a].sort((x2, y2) => x2 - y2);
      return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
    };
    out.sliceWorst = {};
    for (const [label, a] of sliceMs) {
      out.sliceWorst[label] = { n: a.length, med: q(a, 0.5), p90: q(a, 0.9), worst: Math.max(...a) };
    }
  } finally {
    delete map._runSlice;
    if (game) game._tick = heldTick;
  }
  const st = map.pump.stats;
  out.built = st.built - st0.built;
  out.unloaded = st.unloaded - st0.unloaded;
  out.errors = st.errors - st0.errors;
  // wall-clock клетки и цена `fetch` — максимумы, а не счётчики: разность двух
  // максимумов («дельта за прогон») не имела бы смысла
  out.worstChunkMs = st.worstChunkMs;
  out.fetchWorstMs = st.fetchWorstMs;
  if (out.firstChunkMs === null && st.firstChunkMs !== null) out.firstChunkMs = st.firstChunkMs;
  return out;
}

/**
 * Гейт этапа 4 (§ 7.2 п. 3): достройка окна влезает в кадр **растяжкой на
 * кадры**, а не меньшей клеткой, и за это не платит ни пропуском кадра
 * симуляции, ни сдвигом мира.
 *
 * Два предела, и оба — данные, а не надежда: `budget = stream.budgetMs` главы
 * обязывает **кадр целиком** (к нему относятся и `worstFrameMs`, и `worstAtomMs`:
 * атом обязан влезть в кадр один), а `CONFIG.jsonMap.pump.frameBudgetMs` —
 * предложение движка, которым он клампит **разделимую** работу между атомами.
 * Числа замера (§ 6.4, шесть прогонов этого захода на клетке 200 м): атомы
 * `commit` 13,7…39,0 мс и `picture` 5,1…25,0 мс не режутся, накопление при
 * клампе 12 мс — ≤ 11,8 мс, wall-clock худшей клетки — 92…231 мс. Отсюда и
 * третий предел — `chunkCap`: он в 1,3 раза выше худшего замера и в 4,7 раза
 * ниже цены худшего чанка 300 м из § 2.7 (1 401 мс), то есть меряет не железо,
 * а то, что растяжка осталась растяжкой, а не одним кадром по полсекунды.
 */
async function testPumpFrameBudget() {
  const engineAsk = CONFIG.jsonMap.pump.frameBudgetMs;
  const chunkCap = 300;
  const world = await makeWorld();
  const map = world.map;
  const frameCap = map.stream.budgetMs;
  const chunk = map.stream.chunk;
  // клетка обязана остаться в тех же осях, что и до помпы: сдвиг мира — это
  // глава 4 со `updateStreaming`, а помпа открытого мира права на него не имеет
  const spawn0 = { ...map.spawn };
  const width0 = map.width;
  const half0 = map.half;
  const walk = await pumpRoute(map, { speed: CONFIG.speed.run, distance: 340, ping: true });
  const car = await pumpRoute(map, { speed: CONFIG.car.maxSpeed, distance: 300, ping: true });
  const shifted = map.spawn.x !== spawn0.x || map.spawn.z !== spawn0.z
    || map.width !== width0 || map.half !== half0;
  const idle = await pumpRoute(map, { speed: 0, distance: 0, steps: 120 });
  // предельное число клеток окна: диск радиуса `radius` на решётке `chunk`
  // пересекает не больше (⌈2·radius/chunk⌉ + 1)² клеток
  const bound = (radius) => Math.pow(Math.ceil((2 * radius) / chunk) + 1, 2);
  const spawnCell = map.spawnCell().id;
  // срезы от самых дорогих: потолок атома назначается по этому списку, и он
  // обязан быть виден в отчёте, а не только в заметке захода
  const dist = (() => {
    const rows = [];
    for (const [label, s] of Object.entries(walk.sliceWorst)) {
      const carS = car.sliceWorst[label];
      rows.push({ label, n: s.n + (carS?.n ?? 0), med: Math.max(s.med, carS?.med ?? 0), worst: Math.max(s.worst, carS?.worst ?? 0) });
    }
    rows.sort((a, b) => b.worst - a.worst);
    return rows.slice(0, 3).map((r) => `${r.label} ${r.med.toFixed(1)}…${r.worst.toFixed(1)} мс (${r.n})`).join(', ');
  })();
  const ok = walk.errors === 0 && car.errors === 0 && walk.returned && car.returned && !shifted
    && walk.blockedLate === 0 && car.blockedLate === 0
    && walk.playableAtStep !== null && car.playableAtStep !== null
    && walk.worstAccumMs <= engineAsk && car.worstAccumMs <= engineAsk
    && walk.worstAtomMs <= frameCap && car.worstAtomMs <= frameCap
    && walk.worstFrameMs <= frameCap && car.worstFrameMs <= frameCap
    && walk.worstChunkMs <= chunkCap && car.worstChunkMs <= chunkCap
    && walk.unloaded >= 1 && walk.built >= 5
    && walk.maxLoaded <= bound(walk.radius) && car.maxLoaded <= bound(car.radius)
    && walk.maxRequests <= CONFIG.jsonMap.pump.fetchMax + 2
    && idle.idleMedianMs < 1 && map.loaded.get(spawnCell)?.pic
    && typeof map.streamStep === 'function' && typeof map.updateStreaming !== 'function';
  map.dispose();
  return {
    name: 'помпа укладывает достройку в кадр растяжкой, не сдвигая мир',
    passed: ok,
    info: `потолок кадра ${frameCap} мс (данные главы), кламп разделимой работы ${engineAsk} мс (просьба`
      + ` движка); срезы пешком+машина (медиана…худший, число прогонов): ${dist};`
      + ` шаг кадров стенда ${walk.gapMedianMs.toFixed(1)} мс (медиана, худший ${walk.gapWorstMs.toFixed(0)}),`
      + ` потому что rAF-рендер страницы на время прогона заглушён; пешком 340 м туда-обратно`
      + ` (${walk.steps} кадров): худший кадр ${walk.worstFrameMs.toFixed(1)} мс, в нём`
      + ` самый дорогой срез ${walk.worstAtomMs.toFixed(1)} («${walk.worstAtomLabel}»), отдельно`
      + ` накопление без атома ≤ ${walk.worstAccumMs.toFixed(1)} (это разные кадры — максимумы по`
      + ` каждому показателю), кадров сверх просьбы ${walk.overBudget} из`
      + ` ${walk.workFrames} рабочих, playable на кадре ${walk.playableAtStep}, поп-ин`
      + ` ${walk.unbuiltFrames} кадров, достроек ${walk.built}, выгрузок ${walk.unloaded}, wall-clock`
      + ` худшей клетки ${walk.worstChunkMs.toFixed(0)} мс (предел ${chunkCap}), до играбельного окна`
      + ` ${walk.firstChunkMs === null ? 'нет' : walk.firstChunkMs.toFixed(0) + ' мс'}, клеток в окне ≤ ${walk.maxLoaded}`
      + ` (предел ${bound(walk.radius)} при радиусе ${walk.radius.toFixed(0)} м), запросов ≤ ${walk.maxRequests};`
      + ` машина 300 м (${car.steps} кадров): кадр ${car.worstFrameMs.toFixed(1)} (атом`
      + ` ${car.worstAtomMs.toFixed(1)} + ${car.worstAccumMs.toFixed(1)} накопления), playable на ${car.playableAtStep},`
      + ` накопленный максимум клетки ${car.worstChunkMs.toFixed(0)} мс (тот же предел ${chunkCap}),`
      + ` клеток в окне ≤ ${car.maxLoaded} (предел ${bound(car.radius)} при радиусе`
      + ` ${car.radius.toFixed(0)} м), запросов ≤ ${car.maxRequests},`
      + ` блокирующих клеток под ногами после старта ${car.blockedLate}; стоя (${idle.steps} кадров) медиана`
      + ` ${idle.idleMedianMs.toFixed(2)} мс; spawn/плита не сдвинулись — ${!shifted};`
      + ` errors ${walk.errors + car.errors}, ` +
      (typeof map.updateStreaming === 'function' ? 'у карты есть updateStreaming (пропуск кадров!)' : 'пропуска кадров нет'),
  };
}

/**
 * Гейт этапа 6 (§ 7.2 п. 2 и критерий «глава грузится движком до интертитра»):
 * та же плита, но главой **из реестра** и глазами движка.
 *
 * Что может показать только `_loadLevel`: спавн, цель, число врагов и кузовов
 * равны данным `index.js`, тела стоят на узлах застроенной клетки, а счётчики
 * выводимых рядов — сумма по загруженным клеткам (до правки § 6.3.1 формат
 * каталога терял секции `windows`/`clutter`/`signage`, и открытая глава не
 * выводила бы ни одного ряда — п. 2 § 7.2 плана называл это незакрытым).
 *
 * Окно за интертитром меряется тем же `_worldPump`, которым его зовёт `_tick`:
 * центр — `map.spawn`, а не обзорная камера (замер главы 14: камера стоит в
 * (−800, 160, 592), спавн в (−800, 800), и окно по камере — шесть клеток вместо
 * четырёх: две лишние, `0_2`/`1_2`, лежат в пустоши южнее и не несут ничего).
 * Пределы кадра те же, что у
 * гейта этапа 4: неразделимый атом ≤ `stream.budgetMs` главы, накопление ≤
 * просьбы движка. Маршрут до точки B здесь **частичный** — её клетка за окном
 * спавна, поэтому мера «путь не идёт дырой» берётся по каждому узлу пути, а
 * критерий «≥ 3 чанка» мерит `level-contract` на мире целиком (замер главы 14 —
 * 9 клеток, 528 узлов / 3 191 м, опора ±0,00 м).
 *
 * Проверка идёт последней в сюите: заглушка `_tick` не переназначает
 * `requestAnimationFrame`, поэтому кадр страницы после неё не наступает (тот же
 * приём, что у `pumpRoute`).
 */
async function testEngineChapter() {
  const game = window.game;
  if (!game) throw new Error('сюита гоняет главу движком: откройте 3d-game.html, где main.js создал window.game');
  // глава ищется по форме данных, а не по номеру: номер 14 — не свойство
  // открытого мира, и следующая такая глава должна попадать в гейт сама
  const index = LEVELS.findIndex((l) => l.map?.cells?.length && l.map?.catalog);
  if (index < 0) throw new Error("в реестре нет главы с каталогом клеток (kind: 'open')");
  const level = LEVELS[index];
  const gp = level.gameplay ?? {};
  const engineAsk = CONFIG.jsonMap.pump.frameBudgetMs;
  const wantEnemies = (gp.enemies?.count ?? CONFIG.enemies.count)
    + (gp.alienEnemies?.count ?? CONFIG.alienEnemies.count);
  const wantCars = gp.cars?.count ?? 0;
  const wantExit = gp.goal === 'exit';
  // допуск тот же, что у `level-lifecycle` (NODE_GAP): `respawn` берёт узел без
  // округления, поэтому зазор меряется до узла, а не до клетки решётки
  const nodeGap = 0.02;
  const rows = ['windows', 'clutter', 'signage'];
  const heldTick = game._tick;
  game._tick = () => {};
  let loadMs = 0;
  let map = null;
  let at = null;
  let rest = null;
  try {
    const tLoad0 = performance.now();
    await game._loadLevel(index);
    loadMs = performance.now() - tLoad0;
    map = game.map;
    const startId = map.spawnCell()?.id ?? null;
    // тела — той же формулой, что и `level-lifecycle`: у Чужого `position` есть
    // радиус корпуса, у человека нога лежит в `feetY`
    const bodies = () => game.enemies.items.map((e) => {
      const alien = e instanceof AlienEnemy;
      const feet = alien ? e.position.y - CONFIG.alien.radius : e.feetY;
      const node = map.nav.nearestNode(e.position.x, feet, e.position.z, map.navFit);
      const np = map.nav.pos[node];
      return {
        built: map.isBuiltAt(e.position.x, e.position.z),
        gap: np ? Math.hypot(np.x - e.position.x, np.y - feet, np.z - e.position.z) : Infinity,
        offstage: !!e.offstage,
      };
    });
    const sums = () => {
      const out = { windows: 0, clutter: 0, signage: 0 };
      for (const entry of map.loaded.values()) {
        out.windows += entry.counts.windows ?? 0;
        out.clutter += entry.counts.clutter ?? 0;
        out.signage += entry.counts.signage ?? 0;
      }
      return out;
    };
    const counters = () => ({ windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount });
    const beacon = () => (game.exit ? {
      built: game.exit.built,
      visible: game.exit.group.visible,
      here: map.isBuiltAt(game.exit.x, game.exit.z),
      ok: game.exit.x === gp.exit.x && game.exit.z === gp.exit.z
        && game.exit.radius === (gp.exitRadius ?? CONFIG.terrain.exitRadius),
    } : null);
    const fitCount = () => map.nav.pos.reduce((n, _, i) => n + (map.navFit(i) ? 1 : 0), 0);
    at = {
      state: game.state,
      chapter: game.levelIndex === index && game.level === level,
      cells: [...map.loaded.keys()],
      startId,
      startPic: !!map.loaded.get(startId)?.pic,
      spawnOk: map.spawn.x === level.map.spawn.x && map.spawn.z === level.map.spawn.z,
      builtAtSpawn: map.isBuiltAt(map.spawn.x, map.spawn.z),
      blockedAtSpawn: map.isBlocked(map.spawn.x, map.spawn.z, CONFIG.radius, map.spawn.y ?? 0, CONFIG.eyeHeight),
      nodes: map.nav.pos.length,
      fit: fitCount(),
      enemies: bodies(),
      cars: game.cars?.count ?? 0,
      beacon: beacon(),
      counters: counters(),
      sums: sums(),
      warm: map.pump.costWorst.size,
      firstChunkMs: map.pump.stats.firstChunkMs,
      sceneChildren: game.scene.children.length,
    };
    let frames = 0;
    let idleAt = null;
    let worstFrameMs = 0;
    let worstAtomMs = 0;
    let atomLabel = null;
    let worstAccumMs = 0;
    let inFrame = [];
    const heldSlice = map._runSlice;
    map._runSlice = function (slice) {
      const t = performance.now();
      heldSlice.call(this, slice);
      inFrame.push({ label: slice.label, ms: performance.now() - t });
    };
    try {
      for (let frameIdx = 0; ; frameIdx++) {
        const before = map.pump.stats.slices;
        inFrame = [];
        const f0 = performance.now();
        game._worldPump();
        const ms = performance.now() - f0;
        frames += 1;
        let atom = 0;
        let label = null;
        for (const s of inFrame) if (s.ms > atom) { atom = s.ms; label = s.label; }
        worstFrameMs = Math.max(worstFrameMs, ms);
        worstAccumMs = Math.max(worstAccumMs, ms - atom);
        if (atom > worstAtomMs) { worstAtomMs = atom; atomLabel = label; }
        const idle = map.pump.stats.slices === before && !map.pump.task && map.pump.requests.size === 0;
        if (idle && idleAt === null) idleAt = frames;
        if (idle || frames >= 400) break;
        // макрозадача между кадрами: без неё `fetch` клетки не успевает вернуться
        await new Promise((r) => setTimeout(r, 0));
      }
    } finally {
      delete map._runSlice;
    }
    const want = map._windowCells(map.spawn.x, map.spawn.z, map.pump.radius).map((w) => w.cell.id).sort();
    const to = { x: gp.exit.x, y: map.groundHeightAt(gp.exit.x, gp.exit.z, 500), z: gp.exit.z };
    const path = map.findPath(map.spawn, to) ?? [];
    const cells = [];
    let len = 0;
    let unbuilt = 0;
    let offSupport = 0;
    path.forEach((p, k) => {
      const id = map.cellAt(p.x, p.z)?.id ?? 'вне';
      if (!cells.includes(id)) cells.push(id);
      if (k) len += Math.hypot(p.x - path[k - 1].x, p.z - path[k - 1].z);
      if (!map.isBuiltAt(p.x, p.z)) unbuilt += 1;
      if (Math.abs(map.groundHeightAt(p.x, p.z, p.y + J.floorRise) - p.y) > CONFIG.building.stepUp) offSupport += 1;
    });
    const last = path[path.length - 1];
    rest = {
      frames, idleAt, worstFrameMs, worstAtomMs, atomLabel, worstAccumMs,
      cells: [...map.loaded.keys()].sort(),
      want,
      drawn: [...map.loaded.values()].every((e) => e.pic),
      nodes: map.nav.pos.length,
      fit: fitCount(),
      enemies: bodies(),
      beacon: beacon(),
      counters: counters(),
      sums: sums(),
      route: {
        nodes: path.length, cells, m: len, unbuilt, offSupport,
        toExit: last ? Math.hypot(last.x - to.x, last.z - to.z) : null,
      },
      errors: map.pump.stats.errors,
      built: map.pump.stats.built,
      slices: map.pump.stats.slices,
      fetches: map.pump.stats.fetches,
      worstChunkMs: map.pump.stats.worstChunkMs,
    };
  } finally {
    game._tick = heldTick;
  }
  const frameCap = map.stream.budgetMs;
  // ряд обязан выводиться, если его секция есть в данных главы: ноль при секции
  // — это потерянный формат каталога, а не воля автора
  const rowsOk = (snap) => rows.every((key) => snap.counters[key] === snap.sums[key]
    && (!level.map[key] || snap.counters[key] > 0));
  const bodiesOk = (list) => list.length === wantEnemies
    && list.every((e) => e.built && !e.offstage && e.gap <= nodeGap);
  const beaconOk = (b) => (wantExit
    ? !!b && b.ok && b.built === b.here && b.visible === b.built
    : b === null);
  const ok = at.state === 'chapter' && at.chapter && at.spawnOk
    && at.builtAtSpawn && !at.blockedAtSpawn
    && at.startId !== null && at.startPic && at.cells.length === 1 && at.cells[0] === at.startId
    && at.nodes > 0 && at.fit > 0 && at.firstChunkMs !== null && at.warm > 0
    && bodiesOk(at.enemies) && at.cars === wantCars && beaconOk(at.beacon) && rowsOk(at)
    && rest.idleAt !== null && rest.drawn && rest.want.length > 1
    && rest.cells.join(',') === rest.want.join(',')
    && rest.worstFrameMs <= frameCap && rest.worstAtomMs <= frameCap && rest.worstAccumMs <= engineAsk
    && bodiesOk(rest.enemies) && beaconOk(rest.beacon) && rowsOk(rest)
    && rest.route.nodes >= 2 && rest.route.cells.length >= 2
    && rest.route.unbuilt === 0 && rest.route.offSupport === 0 && rest.errors === 0;
  const worstGap = (list) => list.reduce((m, e) => Math.max(m, e.gap), 0);
  const rowText = (snap) => rows.map((key) => `${key} ${snap.counters[key]}`).join('/');
  return {
    name: 'глава из реестра грузится движком: спавн, цель, тела и ряды по данным, окно за интертитром в бюджете',
    passed: ok,
    info: `глава ${index + 1} («${level.name}»), загрузка до '${at.state}' ${loadMs.toFixed(0)} мс;`
      + ` спавн (${map.spawn.x}, ${map.spawn.z}) равен данным — ${at.spawnOk}, застроен ${at.builtAtSpawn},`
      + ` проходим ${!at.blockedAtSpawn}; стартовая клетка ${at.startId} нарисована ${at.startPic},`
      + ` до играбельного окна ${at.firstChunkMs === null ? 'нет' : at.firstChunkMs.toFixed(0) + ' мс'},`
      + ` мереных меток после build ${at.warm}; узлов ${at.nodes} (годных ${at.fit}), объектов сцены`
      + ` ${at.sceneChildren}; врагов ${at.enemies.length} при данных ${wantEnemies} (вне застроенных`
      + ` ${at.enemies.filter((e) => !e.built).length}, снятых ${at.enemies.filter((e) => e.offstage).length},`
      + ` худший зазор до узла ${worstGap(at.enemies).toFixed(3)} м при допуске ${nodeGap}), кузовов`
      + ` ${at.cars} при данных ${wantCars}; маяк ${at.beacon === null ? 'не нужен' : `в (${gp.exit?.x ?? 0}, ${gp.exit?.z ?? 0})`}`
      + `; ряды на старте ${rowText(at)} (сумма по клеткам ${rowText({ counters: at.sums })});`
      + ` за интертитром ${rest.frames} кадров, покой на ${rest.idleAt ?? 'не наступил'}, срезов ${rest.slices},`
      + ` достроек ${rest.built}, чтений ${rest.fetches}, ошибок ${rest.errors}; окно ${rest.cells.join(',')}`
      + ` против расчётного ${rest.want.join(',')} (радиус ${map.pump.radius.toFixed(0)} м), все нарисованы`
      + ` ${rest.drawn}; худший кадр ${rest.worstFrameMs.toFixed(1)} мс при потолке главы ${frameCap}`
      + ` (атом ${rest.worstAtomMs.toFixed(1)} «${rest.atomLabel}», накопление ≤ ${rest.worstAccumMs.toFixed(1)}`
      + ` при просьбе движка ${engineAsk}), wall-clock худшей клетки ${rest.worstChunkMs.toFixed(0)} мс;`
      + ` узлов ${rest.nodes} (годных ${rest.fit}), ряды ${rowText(rest)}, врагов вне застроенных`
      + ` ${rest.enemies.filter((e) => !e.built).length}, маяк застроен ${rest.beacon?.built ?? '—'} и видим`
      + ` ${rest.beacon?.visible ?? '—'}; маршрут к B частичный: ${rest.route.nodes} узлов /`
      + ` ${rest.route.m.toFixed(1)} м через ${rest.route.cells.join('→')}, до маяка`
      + ` ${rest.route.toExit === null ? '—' : rest.route.toExit.toFixed(1) + ' м'}, узлов вне застроенных`
      + ` ${rest.route.unbuilt}, без своей опоры ${rest.route.offSupport}`,
  };
}

/**
 * Туннель в данных стрим-чанка: коридор должен дойти до мировых списков
 * (`solids`/`blockers`/`surfaces`) через проход данных и оставаться проходимым
 * на середине. Без `_collectTunnels` в `collectPass` стриминги-ветка молча
 * не собирала туннели: мир из брифа это давало, стрим — нет.
 */
async function testStreamedTunnel() {
  const world = await makeWorld();
  const id = world.map.spawnCell().id;
  const cell = world.map.cellById.get(id);
  const data = await chunkData(cell.file);
  const z = cell.rect.minZ + 30;
  const x0 = cell.rect.minX + 30;
  const x1 = cell.rect.minX + 130;
  const y = world.map.groundHeightAt(x0, z);
  data.tunnels = [{
    id: 'tunnel_stream', owner: true,
    points: [ { x: x0, y, z }, { x: x1, y, z } ],
    width: 8, height: 3.2,
  }];
  world.map.applyChunk(id, data);
  const inside = (r) => r.minX < x1 && r.maxX > x0 && r.minZ < z + 4 && r.maxZ > z - 4;
  const solids = world.map.solids.filter(inside);
  const blockers = world.map.blockers.filter(inside);
  const surfaces = world.map.surfaces.filter(inside);
  const midBlocked = world.map.isBlocked((x0 + x1) / 2, z, CONFIG.radius, y, CONFIG.eyeHeight);
  world.map.dispose();
  return {
    name: 'стрим: туннель чанка доходит до мировых списков и коридор проходит',
    passed: solids.length > 0 && blockers.length > 0 && surfaces.length > 0 && !midBlocked,
    info: `коридор x[${x0.toFixed(0)}, ${x1.toFixed(0)}] z=${z}: твёрдость тела ${solids.length}, блокеров ${blockers.length},`
      + ` опор пола ${surfaces.length}, середина коридора ${midBlocked ? 'заблокирована' : 'проходима'}`,
  };
}

export async function runOpenWorldTests() {
  const tests = [
    testCatalogShape,
    testOneChunkFromTwoFiles,
    testUnloadedIsBlocked,
    testWorldDoesNotShift,
    testSeamEdge,
    testSameAsWholeWorld,
    testMemoryCircle,
    testTwoOrders,
    testNavRestricted,
    testBuiltMemberAndBoundsHole,
    testEnemiesOffstageInUnbuiltCell,
    testExitAndCarsOnlyInBuiltCells,
    testMinimapPlanFrame,
    testPumpFrameBudget,
    testStreamedTunnel,
    // последней: заглушка `_tick` обрывает цепочку кадров страницы (см. выше)
    testEngineChapter,
  ];
  const results = [];
  for (const fn of tests) {
    const t = performance.now();
    try {
      const r = await fn();
      results.push({ ...r, info: `${r.info} [${Math.round(performance.now() - t)} мс]` });
    } catch (e) {
      results.push({ name: fn.name, passed: false, info: `ошибка: ${e && e.message}` });
    }
  }
  const passed = results.filter((r) => r.passed).length;
  console.group('Автесты открытого мира (WorldMap, probe/open-600)');
  for (const r of results) console.log(`${r.passed ? 'PASS' : 'FAIL'} — ${r.name}: ${r.info}`);
  console.log(`Итого: ${passed}/${results.length}`);
  console.groupEnd();
  return { passed, total: results.length, results };
}
