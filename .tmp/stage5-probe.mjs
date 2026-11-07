/**
 * Разведка этапа 5 (не входит в репозиторий): что делает помпа с сущностями,
 * точкой B, кузовами и миникартой, когда клетка под ними выгружается.
 *
 * Запуск на странице игры:
 *   await import('/.tmp/stage5-probe.mjs').then(m => m.probe())
 */
import * as THREE from 'three';
import { CONFIG } from '/src/config.js';
import { WorldMap } from '/src/world-map.js';
import { Enemies } from '/src/enemies.js';
import { Cars } from '/src/vehicle.js';
import { ExitGoal } from '/src/exit.js';
import { JsonMap } from '/src/json-map.js';
import { OPEN_600 } from '/probe/open-600/index.js';

const CATALOG = '/probe/open-600';
const J = CONFIG.jsonMap;

async function makeWorld() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const map = new WorldMap({ ...OPEN_600.map, catalog: CATALOG });
  map.build(scene);
  await map.loadChunk(map.spawnCell().id);
  return { map, scene, camera };
}

/** Тот же шаг кадра, что в сюите: streamStep до физики, макрозадача = кадр. */
async function route(map, onFrame, opts) {
  const game = window.game;
  const heldTick = game ? game._tick : null;
  if (game) game._tick = () => {};
  const out = { frames: 0, unloads: 0, loads: 0 };
  try {
    const dt = 1 / 60;
    const leg = opts.distance / 2;
    const steps = Math.ceil(opts.distance / (opts.speed * dt));
    let prevUnloaded = map.pump.stats.unloaded;
    let prevBuilt = map.pump.stats.built;
    for (let k = 0; k < steps; k++) {
      await new Promise((r) => setTimeout(r, 0));
      const raw = Math.min(opts.distance, k * opts.speed * dt);
      const back = raw % (2 * leg);
      const d = opts.ping === false ? raw : (back <= leg ? back : 2 * leg - back);
      const p = opts.path ? opts.path(map, d, raw) : { x: map.spawn.x + d, z: map.spawn.z };
      map.streamStep(J.pump.frameBudgetMs, p.x, p.z, opts.speed);
      out.frames += 1;
      out.unloads += map.pump.stats.unloaded - prevUnloaded;
      out.loads += map.pump.stats.built - prevBuilt;
      prevUnloaded = map.pump.stats.unloaded;
      prevBuilt = map.pump.stats.built;
      onFrame(k, { x: p.x, z: p.z, d });
    }
  } finally {
    if (game) game._tick = heldTick;
  }
  return out;
}

const feetOf = (e) => (e.feetY !== undefined ? e.feetY : e.position.y - (e.cfg?.radius ?? CONFIG.radius));
const radiusOf = (e) => (e.cfg?.radius ?? CONFIG.radius);

/**
 * Игрок-заглушка: `Enemies.update` зовёт `enemy.update(dt, this.player, …)`, а
 * `Enemy._shoot` ранит его — без метода секция падала на середине прогона и
 * теряла все числа (enemies.js:480).
 */
function fakePlayer(map) {
  return {
    position: new THREE.Vector3(map.spawn.x, map.spawn.y ?? 0, map.spawn.z),
    velocity: new THREE.Vector3(), dead: false, vehicle: null, keys: new Set(),
    takeDamage() { return 0; },
  };
}

/** Враги: три кандидата на правило снятия и их расхождение на маршруте. */
async function probeEnemies(opts) {
  const { map, scene, camera } = await makeWorld();
  const player = {
    position: new THREE.Vector3(map.spawn.x, map.spawn.y, map.spawn.z),
    velocity: new THREE.Vector3(), dead: false, vehicle: null, keys: new Set(),
  };
  const tracers = { spawn() {} };
  const enemies = new Enemies(scene, map, player, camera, tracers, {
    count: OPEN_600.gameplay.enemies.count,
    alienCount: OPEN_600.gameplay.alienEnemies.count,
  });
  const st = {
    holeFrames: 0, holeMax: 0, holeSamples: 0, samples: 0,
    sweptByBounds: 0, outsideLoaded: 0, walkedOutOfWindow: 0,
    blockedInsideLoaded: 0, samplesInsideLoaded: 0,
    offstageFrames: 0, aliveAtEnd: 0, perType: {}, route: opts,
  };
  const dt = 1 / 60;
  const wasLoaded = new Map();
  await route(map, (k, pos) => {
    player.position.set(pos.x, map.groundHeightAt(pos.x, pos.z, 500), pos.z);
    if (opts.update) enemies.update(dt, player, camera, tracers);
    const b = map.bounds;
    let holes = 0;
    for (const e of enemies.items) {
      if (e.offstage || e.dead) continue;
      const p = e.position;
      const loaded = map.isBuiltAt(p.x, p.z);
      const bounded = !!b && p.x >= b.minX && p.x <= b.maxX && p.z >= b.minZ && p.z <= b.maxZ;
      st.samples += 1;
      const kind = e.constructor.name;
      st.perType[kind] ??= { samples: 0, holes: 0, blockedInLoaded: 0, outsideLoaded: 0 };
      st.perType[kind].samples += 1;
      if (loaded) {
        st.samplesInsideLoaded += 1;
        if (map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8)) {
          st.blockedInsideLoaded += 1;
          st.perType[kind].blockedInLoaded += 1;
        }
      }
      if (!loaded && bounded) {
        holes += 1;
        st.holeSamples += 1;
        st.perType[kind].holes += 1;
      }
      if (!loaded && !bounded) st.sweptByBounds += 1;
      if (!loaded) {
        st.outsideLoaded += 1;
        st.perType[kind].outsideLoaded += 1;
        // «сам вышел за окно»: в прошлом кадре точка была построена
        if (wasLoaded.get(e) === true) st.walkedOutOfWindow += 1;
      }
      wasLoaded.set(e, loaded);
    }
    if (holes) {
      st.holeFrames += 1;
      st.holeMax = Math.max(st.holeMax, holes);
    }
    st.offstageFrames += enemies.items.filter((e) => e.offstage).length;
  }, opts);
  st.aliveAtEnd = enemies.items.filter((e) => !e.offstage && !e.dead).length;
  st.count = enemies.items.length;
  map.dispose();
  return st;
}

/** Кузова: сколько стоит в незагруженной клетке и сажает ли туда `nearest`. */
async function probeCars(opts) {
  const { map, scene } = await makeWorld();
  const spots = [
    { x: map.spawn.x + 6, z: map.spawn.z + 6, yaw: 0 },
    { x: map.spawn.x + 150, z: map.spawn.z - 20, yaw: 0.4 },
    { x: map.spawn.x - 140, z: map.spawn.z + 30, yaw: -0.3 },
  ];
  for (const s of spots) s.y = map.groundHeightAt(s.x, s.z, 500);
  const cars = new Cars(scene, map, { count: spots.length, spots });
  const st = { frames: 0, unloadedCarFrames: 0, worstAtOnce: 0, boardsIntoNothing: 0, yDrift: [] };
  await route(map, (k, pos) => {
    st.frames += 1;
    let n = 0;
    for (const car of cars.items) {
      if (map.isBuiltAt(car.pos.x, car.pos.z)) continue;
      n += 1;
      st.yDrift.push(+(map.groundHeightAt(car.pos.x, car.pos.z, 500) - car.pos.y).toFixed(3));
      const d = Math.hypot(car.pos.x - pos.x, car.pos.z - pos.z);
      if (d <= CONFIG.car.enterRadius) st.boardsIntoNothing += 1;
    }
    if (n) {
      st.unloadedCarFrames += 1;
      st.worstAtOnce = Math.max(st.worstAtOnce, n);
    }
  }, opts);
  st.yDrift = st.yDrift.length
    ? { count: st.yDrift.length, min: Math.min(...st.yDrift), max: Math.max(...st.yDrift) }
    : { count: 0 };
  cars.dispose();
  map.dispose();
  return st;
}

/** Точка B: чем отвечает карта, когда её клетки нет, и что это меняет в маяке. */
async function probeExit() {
  const { map, scene } = await makeWorld();
  const ex = OPEN_600.gameplay.exit;
  const out = { exit: ex, cellOfExit: null, frames: 0, readyFrames: 0 };
  out.cellOfExit = map.cellAt(ex.x, ex.z)?.id ?? null;
  out.yNoCell = map.groundHeightAt(ex.x, ex.z, 500);
  out.blockedNoCell = map.isBlocked(ex.x, ex.z, CONFIG.radius, 0, 1.8);
  const goal = new ExitGoal(scene, map, ex, OPEN_600.gameplay.exitRadius);
  const own = out.cellOfExit;
  const r = await route(map, () => {
    out.frames += 1;
    if (map.isBuiltAt(ex.x, ex.z)) out.readyFrames += 1;
  }, { distance: 340, speed: 8.5 });
  out.route = r;
  if (own && !map.loaded.has(own)) await map.loadChunk(own);
  out.yLoaded = map.groundHeightAt(ex.x, ex.z, 500);
  out.blockedLoaded = map.isBlocked(ex.x, ex.z, CONFIG.radius, 0, 1.8);
  out.goalY = goal.y;
  out.navNodesNear = map.nav.pos.filter(
    (p) => Math.hypot(p.x - ex.x, p.z - ex.z) < 20).length;
  goal.dispose(scene);
  map.dispose();
  return out;
}

/** Миникарта: Choice «этажа плана» и расхождение плана с метками. */
async function probeMinimap() {
  const { map } = await makeWorld();
  const ex = OPEN_600.gameplay.exit;
  const size = 336;
  const range = Math.min(J.minimapRange, Math.max(map.width, map.depth) / 2);
  const out = {
    viewHalf: map.viewHalf, plate: map.width, range, mismatchK: +(map.viewHalf / range).toFixed(3),
    playerMarkerPx: null, playerPlanPx: null, samplesPerPlanPx: null, samplesPerMarkerPx: null,
    levelStates: [], flips: 0, frames: 0, platesNoCells: 0,
  };
  /** Тот же выбор «этажа плана», что делает JsonMap.drawMinimap: plate ближайший к y. */
  const levelAt = (y) => {
    let level = map.spawn.y, best = Infinity;
    const plates = [...map.floorPlates, ...map.roofPlates];
    for (const p of plates) {
      const d = Math.abs(p.y - y);
      if (d < best) { best = d; level = p.y; }
    }
    return { level: +level.toFixed(2), plates: plates.length };
  };
  out.platesNoCells = levelAt(0).plates;
  const seen = new Map();
  let prevKey = null;
  await route(map, (k, pos) => {
    out.frames += 1;
    const l = levelAt(0);
    const key = `${l.level}|${l.plates}`;
    if (prevKey !== null && key !== prevKey) out.flips += 1;
    prevKey = key;
    if (!seen.has(key)) seen.set(key, { first: k, count: 0 });
    seen.get(key).count += 1;
  }, { distance: 340, speed: 8.5 });
  out.levelStates = [...seen.entries()].map(([key, v]) => `${key}: ${v.count} кадров, первый ${v.first}`);
  const k = size / (2 * range);
  const p = { x: 10, z: 20 };
  out.playerPlanPx = [Math.round((p.x - p.x + range) * k), Math.round((p.z - p.z + range) * k)];
  const [nu, nv] = map.worldToNormalized(p.x, p.z);
  out.playerMarkerPx = [Math.round(nu * size), Math.round(nv * size)];
  out.samplesPerPlanPx = +(2 * range / size).toFixed(2);
  out.samplesPerMarkerPx = +(2 * map.viewHalf / size).toFixed(2);
  map.dispose();
  return out;
}

/**
 * Миникарта **после** правки: тот же маршрут, но вопрос уже не «расходятся ли
 * план с метками», а три числа, которые гейт обязан назвать:
 *   1) расхождение плана и меток в пикселях (после правки — нулевое по построению,
 *      и мера это обязана показать, а не вера в формулу);
 *   2) «прыжок» плана при перемещении окна: два кадра с разными `playerPos` и
 *      тем же составом клеток обязаны дать **побайтово** тот же рисунок;
 *   3) цена `drawMinimap` на кадр — при 1 314 рёбрах скелета на 600 м и при
 *      бóльшем окне клеток, плюс контроль главы 12 (её план теперь идёт через
 *      хук `_minimapView`, и цена не должна измениться).
 */
async function probeMinimapFixed(opts = {}) {
  const size = 336;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const out = { size, cost: {}, agreement: null, identical: null, ch12: {} };

  const { map } = await makeWorld();
  const time = (label, calls) => {
    const t = [];
    for (let i = 0; i < calls; i++) {
      const a = performance.now();
      map.drawMinimap(ctx, size, { x: (i * 7) % 300 - 150, y: 0, z: (i * 11) % 300 - 150 });
      t.push(performance.now() - a);
    }
    t.sort((a, b) => a - b);
    out.cost[label] = {
      calls, loaded: map.loaded.size, edges: map.skeleton?.edges.length ?? 0,
      med: +t[t.length >> 1].toFixed(3), p95: +t[Math.floor(t.length * 0.95)].toFixed(3),
      max: +t[t.length - 1].toFixed(3),
    };
  };
  time('oneCell', 200);
  // то же окно, что держит движок на маршруте: 4 клетки
  for (const id of ['0_1', '1_1', '1_2', '0_2']) if (!map.loaded.has(id)) await map.loadChunk(id);
  time('fourCells', 400);

  // 1) план против меток: одна и та же точка в пикселях обеих систем
  let worstPx = 0;
  const view = map._minimapView({ x: 0, z: 0 });
  const k = size / (2 * view.range);
  for (let x = -280; x <= 280; x += 23) {
    for (let z = -280; z <= 280; z += 29) {
      const planPx = [(x - view.cx + view.range) * k, (z - view.cz + view.range) * k];
      const [nu, nv] = map.worldToNormalized(x, z);
      worstPx = Math.max(worstPx, Math.abs(planPx[0] - nu * size), Math.abs(planPx[1] - nv * size));
    }
  }
  out.agreement = { view, k: +k.toFixed(4), worstPx: +worstPx.toFixed(6) };

  // 2) план не зависит от playerPos: два кадра с разными точками, тот же состав
  map.drawMinimap(ctx, size, { x: -150, y: 0, z: -150 });
  const a = ctx.getImageData(0, 0, size, size).data;
  map.drawMinimap(ctx, size, { x: 120, y: 0, z: 90 });
  const b = ctx.getImageData(0, 0, size, size).data;
  let diff = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff += 1;
  out.identical = { bytes: a.length, differingBytes: diff };

  // 3) выгрузка половины окна: план обязан перестать заливать снятые клетки,
  //    но геометрия скелета остаётся — цена на кадр меняется только за счёт заливки
  map.unloadChunk('0_2');
  map.unloadChunk('1_2');
  time('twoCells', 200);

  // масштаб: та же сеть, нарезанная в 15 раз больше (1,96 км² скелета — 19 318
  // чисел, § 8 плана; на 600 м их в ~15 раз меньше). Стоимость строки плана
  // линейна по числу рёбер, поэтому это и есть цена на 10 км² без сборки каталога
  const realSk = map.skeleton;
  const fat = { nodes: realSk.nodes, edges: [] };
  for (let r = 0; r < 15; r++) fat.edges.push(...realSk.edges);
  map.skeleton = fat;
  time('skeleton15x', 200);
  map.skeleton = realSk;
  map.dispose();

  // контроль главы 12: тот же метод через хук, числа прежние
  const { LEVEL_12 } = await import('/src/levels/level-12.js');
  const scene12 = new THREE.Scene();
  const m12 = new JsonMap(LEVEL_12.map);
  m12.build(scene12);
  const v12 = m12._minimapView({ x: 10, z: -20 });
  const t12 = [];
  for (let i = 0; i < 200; i++) {
    const s = performance.now();
    m12.drawMinimap(ctx, size, { x: m12.spawn.x + i, y: 0, z: m12.spawn.z - i });
    t12.push(performance.now() - s);
  }
  t12.sort((x, y) => x - y);
  out.ch12 = {
    view: v12,
    rangeFormula: +(Math.min(J.minimapRange, Math.max(m12.width, m12.depth) / 2)).toFixed(3),
    plates: [...m12.floorPlates, ...m12.roofPlates].length,
    med: +t12[t12.length >> 1].toFixed(3), max: +t12[t12.length - 1].toFixed(3),
  };
  m12.dispose();
  return out;
}

/** Контроль на главе 12: частота ложных «в стене» у той же пробы isBlocked. */
async function probeChapter12Control() {
  const { LEVEL_12 } = await import('/src/levels/level-12.js');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const map = new JsonMap(LEVEL_12.map);
  map.build(scene);
  const player = {
    position: new THREE.Vector3(map.spawn.x, 0, map.spawn.z),
    velocity: new THREE.Vector3(), dead: false, vehicle: null, keys: new Set(),
  };
  const enemies = new Enemies(scene, map, player, camera, { spawn() {} }, {
    count: LEVEL_12.gameplay.enemies?.count ?? 6,
    alienCount: LEVEL_12.gameplay.alienEnemies?.count ?? 2,
  });
  const st = { samples: 0, blockedInWindow: 0, perType: {}, offBounds: 0 };
  const b = map.bounds;
  for (let k = 0; k < 600; k++) {
    await new Promise((r) => setTimeout(r, 0));
    player.position.set(map.spawn.x, map.spawn.y, map.spawn.z);
    enemies.update(1 / 60, player, camera, null);
    for (const e of enemies.items) {
      if (e.offstage || e.dead) continue;
      const p = e.position;
      st.samples += 1;
      const kind = e.constructor.name;
      st.perType[kind] ??= { samples: 0, blocked: 0 };
      st.perType[kind].samples += 1;
      if (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ) { st.offBounds += 1; continue; }
      if (map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8)) {
        st.blockedInWindow += 1;
        st.perType[kind].blocked += 1;
      }
    }
  }
  enemies.items.forEach((e) => e.dispose?.());
  return st;
}

/**
 * Помпа без сущностей: что реально происходит с `loaded`, `built` и `unloaded`
 * за тот же пеший маршрут. Нужна потому, что в секции врагов маршрут дал
 * `loads 75 / unloads 0` при девяти клетках, а в секции точки B — `loads 5 /
 * unloads 2`: либо счётчики помпы врут, либо маршрут в двух секциях разный.
 */
async function probePumpOnly(opts) {
  const { map } = await makeWorld();
  const ids = new Set();
  const st = {
    frames: 0, built: 0, unloaded: 0, errors: 0, fetches: 0,
    loadedMax: 0, radius: 0, checkpoints: [], cellIds: map.cells.map((c) => c.id),
  };
  await route(map, (k) => {
    st.frames += 1;
    for (const id of map.loaded.keys()) ids.add(id);
    const s = map.pump.stats;
    st.built = s.built;
    st.unloaded = s.unloaded;
    st.errors = s.errors;
    st.fetches = s.fetches;
    st.loadedMax = Math.max(st.loadedMax, map.loaded.size);
    st.radius = map.pump.radius;
    if (k % 600 === 0) st.checkpoints.push(`${k}: loaded [${[...map.loaded.keys()].join(' ')}] built ${s.built} unloaded ${s.unloaded}`);
  }, opts);
  st.distinctEverBuilt = ids.size;
  st.loadedAtEnd = [...map.loaded.keys()];
  map.dispose();
  return st;
}

/**
 * Природа «дыр»: для каждой пробы врага вне загруженной клетки — расстояние до
 * ближайшего прямоугольника loaded, владеющая клетка и расстояние до ближайшего
 * узла графа. Если дыры лежат в 0…2 м от застроенного прямоугольника, это шов
 * (узел законен, а `isBuiltAt` его не видит); если в 50…150 м — настоящий
 * незастроенный район.
 */
async function probeHoles(opts) {
  const { map, scene, camera } = await makeWorld();
  const player = {
    position: new THREE.Vector3(map.spawn.x, map.spawn.y, map.spawn.z),
    velocity: new THREE.Vector3(), dead: false, vehicle: null, keys: new Set(),
  };
  const tracers = { spawn() {} };
  const enemies = new Enemies(scene, map, player, camera, tracers, {
    count: OPEN_600.gameplay.enemies.count,
    alienCount: OPEN_600.gameplay.alienEnemies.count,
  });
  const nearRect = (x, z) => {
    let best = Infinity;
    for (const entry of map.loaded.values()) best = Math.min(best, map._distToRect(x, z, entry.cell.rect));
    return best;
  };
  const nearNode = (x, z) => {
    let best = Infinity;
    for (const p of map.nav.pos) {
      const d = Math.hypot(p.x - x, p.z - z);
      if (d < best) best = d;
    }
    return best;
  };
  const hist = new Map();
  const st = {
    samples: 0, holes: 0, sweptByBounds: 0, blockedInHole: 0, blockedInsideLoaded: 0,
    insideLoaded: 0, perType: {}, frames: 0, built: 0, unloaded: 0, loaded: 0,
    blockedInsideLoadedBy: {}, standingBlockedInsideLoaded: 0, holesBy: {},
  };
  const stateOf = (e) => (e._tween ? 'transition' : (e.grounded === false ? 'air' : 'ground'));
  await route(map, (k, pos) => {
    st.frames += 1;
    player.position.set(pos.x, map.groundHeightAt(pos.x, pos.z, 500), pos.z);
    if (opts.update) enemies.update(1 / 60);
    for (const e of enemies.items) {
      if (e.offstage || e.dead) continue;
      const p = e.position;
      st.samples += 1;
      if (map.isBuiltAt(p.x, p.z)) {
        st.insideLoaded += 1;
        if (map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8)) {
          st.blockedInsideLoaded += 1;
          const s = stateOf(e);
          const key = `${e.constructor.name}/${s}`;
          st.blockedInsideLoadedBy[key] = (st.blockedInsideLoadedBy[key] ?? 0) + 1;
          if (s === 'ground') st.standingBlockedInsideLoaded += 1;
        }
        continue;
      }
      st.holes += 1;
      const hs = `${e.constructor.name}/${stateOf(e)}`;
      st.holesBy[hs] = (st.holesBy[hs] ?? 0) + 1;
      // сколько из них ловит **нынешнее** правило (снятие по `bounds` при
      // перестановке окна): `bounds` — AABB объединения загруженных клеток
      const bb = map.bounds;
      if (p.x < bb.minX || p.x > bb.maxX || p.z < bb.minZ || p.z > bb.maxZ) st.sweptByBounds += 1;
      if (map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8)) st.blockedInHole += 1;
      const kind = e.constructor.name;
      st.perType[kind] ??= { holes: 0, inLoadedCell: 0 };
      st.perType[kind].holes += 1;
      // точка стоит в клетке, которая **загружена**, но `isBuiltAt` её не нашёл?
      const own = map.cellAt(p.x, p.z);
      if (own && map.loaded.has(own.id)) { st.perType[kind].inLoadedCell += 1; }
      const dr = nearRect(p.x, p.z);
      const bucket = dr <= 2 ? '≤2 м (шов)' : dr <= 20 ? '2…20 м' : dr <= 60 ? '20…60 м' : dr <= 120 ? '60…120 м' : '>120 м';
      hist.set(bucket, (hist.get(bucket) ?? 0) + 1);
      if (st.holes <= 8) {
        hist.set(`sample ${st.holes}`, `${kind} (${p.x.toFixed(1)}, ${p.z.toFixed(1)}) клетка ${own?.id ?? 'нет'}`
          + ` loaded=${own ? map.loaded.has(own.id) : false} до застроенного ${dr.toFixed(2)} м`
          + ` узел графа в ${nearNode(p.x, p.z).toFixed(2)} м`
          + ` isBlocked=${map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8)}`);
      }
    }
    const s = map.pump.stats;
    st.built = s.built;
    st.unloaded = s.unloaded;
    st.loaded = map.loaded.size;
  }, opts);
  st.buckets = Object.fromEntries(hist);
  map.dispose();
  return st;
}

/**
 * Контроль предиката на **движущемся** игроке (глава 12, стриминга нет — всё
 * застроено, значит любое «в стене» здесь ложно по построению). Прежняя версия
 * держала игрока на спавне, и Чужие не лезли по фасадам: именно подъём по стене
 * и прыжок в упор прижимают тело к коробке, и именно там проба
 * `isBlocked(своя позиция)` обязана остаться ложной, иначе правило снятия
 * стирало бы легальных врагов.
 */
async function probeCh12Moving(opts = {}) {
  const { LEVEL_12 } = await import('/src/levels/level-12.js');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  const map = new JsonMap(LEVEL_12.map);
  map.build(scene);
  const player = {
    position: new THREE.Vector3(map.spawn.x, map.spawn.y, map.spawn.z),
    velocity: new THREE.Vector3(), dead: false, vehicle: null, keys: new Set(),
    // `Enemy._shoot` ранит игрока; без метода секция падала на половине
    // прогона и теряла числа (enemies.js:480)
    takeDamage() { return 0; },
  };
  const enemies = new Enemies(scene, map, player, camera, { spawn() {} }, {
    count: LEVEL_12.gameplay.enemies?.count ?? 6,
    alienCount: LEVEL_12.gameplay.alienEnemies?.count ?? 2,
  });
  const st = {
    frames: 0, samples: 0, blocked: 0, byKind: {}, byState: {}, offBounds: 0,
    tween: 0, ungrounded: 0, runMax: 0, nodeDistMax: 0, nodeDistSamples: 0,
    feetVsPos: { mismatch: 0 }, byKindState: {}, standingBlocked: 0,
  };
  const dt = 1 / 60;
  const speed = opts.speed ?? 4.5;
  const frames = opts.frames ?? 1800;
  const leg = opts.distance ?? 170;
  const streak = new Map();
  for (let k = 0; k < frames; k++) {
    await new Promise((r) => setTimeout(r, 0));
    const raw = k * speed * dt;
    const back = raw % (2 * leg);
    const d = back <= leg ? back : 2 * leg - back;
    const px = map.spawn.x + d;
    const pz = map.spawn.z;
    player.position.set(px, map.groundHeightAt(px, pz, 500), pz);
    enemies.update(dt);
    st.frames += 1;
    const b = map.bounds;
    for (const e of enemies.items) {
      if (e.offstage || e.dead) { streak.set(e, 0); continue; }
      const p = e.position;
      st.samples += 1;
      if (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ) { st.offBounds += 1; continue; }
      if (e._tween) st.tween += 1;
      if (e.grounded === false) st.ungrounded += 1;
      if (e.feetY !== undefined && Math.abs(e.feetY - (p.y - radiusOf(e))) > 0.6) st.feetVsPos.mismatch += 1;
      const blocked = map.isBlocked(p.x, p.z, radiusOf(e), feetOf(e), 1.8);
      if (!blocked) { streak.set(e, 0); continue; }
      st.blocked += 1;
      const kind = e.constructor.name;
      st.byKind[kind] = (st.byKind[kind] ?? 0) + 1;
      const state = e._tween ? 'transition' : (e.state ?? (e.grounded ? 'ground' : 'air'));
      st.byState[state] = (st.byState[state] ?? 0) + 1;
      const key = `${kind}/${state}`;
      st.byKindState[key] = (st.byKindState[key] ?? 0) + 1;
      // кандидат правила: снимать только стоячих — висящий на фасаде Чужой
      // легально даёт «в стене», и правило стирало бы легальных врагов
      if (state === 'ground') st.standingBlocked += 1;
      // скан по всему графу платит O(узлов) на каждую пробу, поэтому расстояние
      // до ближайшего узла мерится подвыборкой, а не всеми пробами
      if (st.nodeDistSamples < 400) {
        st.nodeDistSamples += 1;
        let nd = Infinity;
        for (const q of map.nav.pos) {
          const dd = Math.hypot(q.x - p.x, q.z - p.z);
          if (dd < nd) nd = dd;
        }
        st.nodeDistMax = Math.max(st.nodeDistMax, nd);
      }
      const n = (streak.get(e) ?? 0) + 1;
      streak.set(e, n);
      st.runMax = Math.max(st.runMax, n);
    }
  }
  enemies.items.forEach((e) => e.dispose?.());
  return st;
}

/**
 * Насколько **опора** точки меняется между «её клетка не построена» и
 * «построена»: тем же числом мерится, чем платит `ExitGoal` и `Cars`, если
 * берут отметку один раз на загрузку главы. `reached` у маяка сравнивает
 * отметку игрока с `this.y` допуском 3 м, поэтому интересен не средний сдвиг,
 * а худший и доля точек, где он этот допуск переводит в «цель недостижима».
 */
async function probeSupportGap() {
  const { map } = await makeWorld();
  const ids = map.cells.map((c) => c.id);
  for (const id of ids) await map.loadChunk(id);
  const pts = [];
  const step = 20;
  const halfX = map.width / 2;
  const halfZ = map.depth / 2;
  for (let x = -halfX + 10; x < halfX; x += step) {
    for (let z = -halfZ + 10; z < halfZ; z += step) {
      pts.push({ x, z, cell: map.cellAt(x, z)?.id });
    }
  }
  const built = pts.map((p) => map.groundHeightAt(p.x, p.z, 500));
  // остаёмся ровно на клетке спавна — то, что видит движок до первой помпы
  for (const id of ids) {
    if (id === map.spawnCell().id) continue;
    map.unloadChunk(id);
  }
  const gaps = [];
  let over3 = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (map.isBuiltAt(p.x, p.z)) continue;
    const g = Math.abs(map.groundHeightAt(p.x, p.z, 500) - built[i]);
    gaps.push(g);
    if (g >= 3) over3 += 1;
  }
  gaps.sort((a, b) => a - b);
  const q = (pr) => gaps[Math.min(gaps.length - 1, Math.floor(pr * (gaps.length - 1)))];
  const out = {
    points: pts.length, sampledUnbuilt: gaps.length,
    med: +q(0.5).toFixed(3), p90: +q(0.9).toFixed(3), worst: +gaps[gaps.length - 1].toFixed(3),
    over3, over3pct: +(100 * over3 / gaps.length).toFixed(1),
    zero: gaps.filter((g) => g === 0).length,
  };
  map.dispose();
  return out;
}

export async function probe(which) {
  const w = new Set(which ?? ['ch12', 'static', 'liveFoot', 'liveCar', 'cars', 'exit', 'minimap']);
  const foot = { distance: 340, speed: 8.5 };
  const car = { distance: 600, speed: 16 };
  const t0 = performance.now();
  const res = { seconds: 0 };
  // секция печатается сразу, как сошлась: падение или таймаут последней не
  // должно стоить всех предыдущих чисел
  const sec = async (label, fn) => {
    if (!w.has(label)) return;
    let v;
    try {
      v = await fn();
    } catch (e) {
      v = { error: String(e && e.stack || e) };
    }
    res[label] = v;
    console.log('SECTION ' + label + ' ' + JSON.stringify(v));
  };
  await sec('ch12', probeChapter12Control);
  await sec('ch12move', probeCh12Moving);
  await sec('static', () => probeEnemies({ ...foot }));
  await sec('liveFoot', () => probeEnemies({ ...foot, update: true }));
  await sec('liveCar', () => probeEnemies({ ...car, update: true }));
  await sec('cars', () => probeCars(foot));
  await sec('pumpOnly', () => probePumpOnly(foot));
  await sec('supportGap', probeSupportGap);
  await sec('holes', () => probeHoles({ ...foot }));
  await sec('holesLive', () => probeHoles({ ...foot, update: true }));
  // изогнутый маршрут: окно гнётся, его AABB накрывает незастроенные углы, и
  // именно тогда видно, сколько дыр правило по `bounds` не замечает
  const side = 150;
  const zigPath = (map, _d, raw) => {
    const c = map.spawn;
    const leg = Math.floor(raw / side) % 4;
    const t = raw % side;
    if (leg === 0) return { x: c.x + t, z: c.z };
    if (leg === 1) return { x: c.x + side, z: c.z + t };
    if (leg === 2) return { x: c.x + side - t, z: c.z + side };
    return { x: c.x, z: c.z + side - t };
  };
  const zig = { distance: 600, speed: 8.5, update: true, ping: false, path: zigPath };
  await sec('holesZig', () => probeHoles(zig));
  await sec('enemiesZig', () => probeEnemies(zig));
  await sec('exit', probeExit);
  await sec('minimap', probeMinimap);
  await sec('minimap2', probeMinimapFixed);
  res.seconds = +((performance.now() - t0) / 1000).toFixed(1);
  return res;
}
