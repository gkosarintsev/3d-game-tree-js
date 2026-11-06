/**
 * Автотест открытого мира — `WorldMap` (этап 3 плана docs/open-world-plan.md).
 *
 * Меряет критерий этапа дословно: «один чанк собирается в мире из `index.js` и
 * одного файла, незастроенная область `isBlocked` истинен по всей плите, а
 * `renderer.info.memory` после круга по 9 чанкам равен значению до круга» — и
 * список § 7.2, который к этому критерию ведёт. Фикстура — `probe/open-600.json`
 * (тот же город, что `probe/city-600.json`, но разрезанный парсером на 3×3
 * клетки по 200 м): полный каталог 1,96 км² весит 6,4 МБ и в браузерной сюите
 * не нужен (§ 10.11 плана решён в пользу уменьшенной фикстуры).
 *
 * Движок здесь не задействован: глава `kind: 'open'` в реестр ещё не добавлена
 * (это этап 6), поэтому проверка идёт напрямую картой и её сценой. Кадр берётся
 * у `window.game.renderer` — `renderer.info.memory` считает буферы только того,
 * что реально уехало в WebGL, а без отрисовки наши меши так и остались бы
 * необъявленными, и гейт «память вернулась» был бы пустой проверкой.
 *
 * Запуск в браузере (через консоль страницы игры, где есть importmap):
 *   const t = await import('/tests/open-world.test.js');
 *   await t.runOpenWorldTests();
 */
import * as THREE from 'three';
import { CONFIG } from '../src/config.js';
import { JsonMap } from '../src/json-map.js';
import { WorldMap } from '../src/world-map.js';
import { OPEN_600 } from '../probe/open-600/index.js';

const CATALOG = '/probe/open-600';
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
  const map = new WorldMap({ ...OPEN_600.map, catalog: CATALOG });
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

/** Есть ли точка в прямоугольнике загруженной клетки. */
const inLoaded = (map, x, z) => map._loadedAt(x, z);

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
  wrap('_navPasses', 'nav');
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
  const map = new WorldMap({ ...OPEN_600.map, catalog: CATALOG });
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
  // узел обязан быть годным, если лежит внутри загруженной клетки, и быть
  // отвергнутым, если нет; «свес» за край — законные длинные объекты (настил и
  // сход русла едут в каталог целиком, § 4.1 плана), они непроходимы, пока их
  // клетка не построена
  let unfitInside = 0, fitOutside = 0;
  world.map.nav.pos.forEach((p, i) => {
    const inside = inLoaded(world.map, p.x, p.z);
    if (inside && !world.map.navFit(i)) unfitInside++;
    if (!inside && world.map.navFit(i)) fitOutside++;
  });
  const stray = world.map.nav.pos.filter((p) => !inLoaded(world.map, p.x, p.z)).length;
  world.map.dispose();
  return {
    name: 'незастроенная клетка непроходима по всей плите, якорей и узлов чужих нет',
    passed: openOut === 0 && badAnchor === 0 && anchors.length > 0 && openIn > 0 && unfitInside === 0 && fitOutside === 0,
    info: `${pts.length} точек плиты: вне загруженной клетки ${blockedOut} заблокировано / ${openOut} открыто,`
      + ` внутри — ${openIn} открыто / ${blockedIn} заблокировано; якорей ${anchors.length} (чужих ${badAnchor}),`
      + ` узлов графа ${navNodes}, из них вне загруженной клетки ${stray} (все отвергнуты navFit),`
      + ` годных внутри ${navNodes - stray}`,
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
