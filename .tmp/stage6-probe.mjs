/**
 * Разведка этапа 6: что видят общие сюиты реестра на стримящей главе.
 * Не входит в репозиторий (.tmp). Запуск — .tmp/stage6-run.mjs.
 */
import * as THREE from 'three';
import { CONFIG } from '/src/config.js';
import { OPEN_600 } from '/probe/open-600/index.js';
import { LEVEL_14 } from '/src/levels/level-14/index.js';
import { WorldMap, preloadWorldCells } from '/src/world-map.js';

const CATALOG = OPEN_600.map.catalog;
const J = CONFIG.jsonMap;
const BODY_H = 1.9;
const TOL = Math.max(J.floorRise, 0.05);
const spec = () => OPEN_600.map;
const gp = OPEN_600.gameplay;
const exitPoint = (map) => ({ x: gp.exit.x, y: map.groundHeightAt(gp.exit.x, gp.exit.z, 500), z: gp.exit.z });

function fresh() {
  const map = new WorldMap(spec());
  map.build(new THREE.Scene());
  return map;
}

/** Узлы, достижимые от спавна по рёбрам (без navFit) — как в level-contract. */
function reachable(map) {
  const nav = map.nav;
  const seen = new Uint8Array(nav.pos.length);
  const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
  if (start < 0) return { seen, start };
  const q = [start];
  seen[start] = 1;
  for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
  return { seen, start };
}

function orphans(map) {
  const { seen, start } = reachable(map);
  const out = [];
  for (let i = 0; i < seen.length; i++) {
    if (!seen[i]) out.push({ i, ...map.nav.pos[i], deg: map.nav.adj[i].length, fit: map.navFit(i) });
  }
  const fit = out.filter(o => o.fit);
  const brief = (o) => ({ x: +o.x.toFixed(1), y: +o.y.toFixed(2), z: +o.z.toFixed(1), deg: o.deg, fit: o.fit });
  return {
    start, count: out.length, sample: out.slice(0, 6).map(brief),
    fitCount: fit.length, fitSample: fit.slice(0, 6).map(brief),
    unfit: out.length - fit.length,
  };
}

/** Мерка respawn-room из level-contract: аннулус 30…180 м, тело своей роли. */
function room(map) {
  let total = 0, human = 0, alien = 0;
  for (const p of map.nav.pos) {
    const d = Math.hypot(p.x - map.spawn.x, p.z - map.spawn.z);
    if (d < CONFIG.enemies.spawnDistance || d >= 180) continue;
    total++;
    if (!map.isBlocked(p.x, p.z, CONFIG.radius, p.y + 0.02, BODY_H)) human++;
    if (!map.isBlocked(p.x, p.z, CONFIG.alien.radius, p.y + 0.02, BODY_H)) alien++;
  }
  const need = ((gp.enemies?.count ?? 0) + (gp.alienEnemies?.count ?? 0)) * 3;
  return { total, human, alien, need };
}

/** Точки объектов: опора под каждой (мера points-on-plate). */
function anchors(map) {
  let n = 0, floating = 0, worst = 0, unbuilt = 0;
  for (const p of map.openPositions()) {
    n++;
    const g = map.groundHeightAt(p.x, p.z, 500);
    if (!Number.isFinite(g)) { floating++; continue; }
    if (p.y - g > CONFIG.building.stepUp) floating++;
    worst = Math.max(worst, p.y - g);
    if (!map.isBuiltAt(p.x, p.z)) unbuilt++;
  }
  return { n, floating, worst: +worst.toFixed(3), unbuilt };
}

function route(map) {
  const to = exitPoint(map);
  const t0 = performance.now();
  const path = map.findPath(map.spawn, to);
  const ms = performance.now() - t0;
  if (!path || path.length < 2) return { found: false, ms: +ms.toFixed(1), nodes: map.nav.pos.length };
  const cells = [];
  let len = 0, off = 0, worst = 0;
  for (let k = 0; k < path.length; k++) {
    const p = path[k];
    const id = map.cellAt(p.x, p.z)?.id ?? 'вне';
    if (!cells.includes(id)) cells.push(id);
    if (k) len += Math.hypot(p.x - path[k - 1].x, p.y - path[k - 1].y, p.z - path[k - 1].z);
    const g = map.groundHeightAt(p.x, p.z, p.y + TOL);
    const d = Math.abs(g - p.y);
    worst = Math.max(worst, d);
    if (d > CONFIG.building.stepUp) off++;
  }
  const last = path[path.length - 1];
  return {
    found: true, ms: +ms.toFixed(1), nodes: path.length, len: +len.toFixed(1), cells,
    offSupport: off, worstSupport: +worst.toFixed(3),
    toExit: +Math.hypot(last.x - to.x, last.z - to.z).toFixed(2),
    exitRadius: gp.exitRadius ?? CONFIG.terrain.exitRadius,
  };
}

/** Помпа до покоя в точке — то, что движок делает за интертитром и первые кадры. */
async function pumpTo(map, x, z, speed = 0, maxFrames = 900) {
  const t0 = performance.now();
  let frames = 0, worstFrame = 0, idleAt = null;
  for (;;) {
    const before = map.pump.stats.slices;
    const f0 = performance.now();
    map.streamStep(J.pump.frameBudgetMs, x, z, speed);
    worstFrame = Math.max(worstFrame, performance.now() - f0);
    frames++;
    const idle = map.pump.stats.slices === before && !map.pump.task && map.pump.requests.size === 0;
    if (idle && idleAt === null) idleAt = frames;
    if (idle || frames >= maxFrames) break;
    await new Promise(r => setTimeout(r, 0));
  }
  return {
    frames, idleAt, ms: +(performance.now() - t0).toFixed(1), worstFrame: +worstFrame.toFixed(1),
    radius: +map.pump.radius.toFixed(1),
    requests: [...map.pump.requests.entries()].map(([id, r]) => `${id}:${r.data ? 'готово' : 'читается'}`),
    task: map.pump.task ? `${map.pump.task.kind}:${map.pump.task.id} ${map.pump.task.sliceDone}/${map.pump.task.sliceTotal}` : null,
  };
}

const ids = (map) => [...map.loaded.keys()];

export async function probe(sections) {
  const out = {};
  const want = (k) => sections.includes(k);

  if (want('empty')) {
    const map = fresh();
    out.empty = {
      nodes: map.nav.pos.length,
      edges: map.nav.adj.reduce((s, a) => s + a.length, 0) / 2,
      anchors: map.openPositions().length,
      blockedAtSpawn: map.isBlocked(map.spawn.x, map.spawn.z, CONFIG.radius, map.spawn.y ?? 0, BODY_H),
      builtAtSpawn: map.isBuiltAt(map.spawn.x, map.spawn.z),
      groundAtSpawn: map.groundHeightAt(map.spawn.x, map.spawn.z, 500),
      bounds: map.bounds,
      width: map.width, depth: map.depth,
      spawn: map.spawn,
      spawnCell: map.spawnCell()?.id ?? null,
      route: route(map),
      hasUpdateStreaming: typeof map.updateStreaming,
      members: ['streamStep', 'isBuiltAt', 'debugIds', 'updateStreaming'].map(k => `${k}:${typeof map[k]}`),
    };
    map.dispose();
  }

  if (want('spawnCell')) {
    const map = fresh();
    const id = map.spawnCell().id;
    const url = map.chunkUrl(id);
    const f0 = performance.now();
    const res = await fetch(url);
    const data = await res.json();
    const fetchMs = performance.now() - f0;
    const t0 = performance.now();
    map.applyChunk(id, data);
    const wall = performance.now() - t0;
    out.spawnCell = {
      id, url, bytes: JSON.stringify(data).length, fetchMs: +fetchMs.toFixed(1), syncMs: +wall.toFixed(1),
      nodes: map.nav.pos.length,
      edges: map.nav.adj.reduce((s, a) => s + a.length, 0) / 2,
      builtAtSpawn: map.isBuiltAt(map.spawn.x, map.spawn.z),
      groundAtSpawn: +map.groundHeightAt(map.spawn.x, map.spawn.z, 500).toFixed(3),
      spawnY: map.spawn.y,
      orphans: orphans(map), room: room(map), anchors: anchors(map),
      route: route(map),
      sceneChildren: map.scene.children.length,
      counters: { windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount },
    };
    map.dispose();
  }

  if (want('window')) {
    const map = fresh();
    const pump = await pumpTo(map, map.spawn.x, map.spawn.z, 0, 120);
    out.window = {
      pump, cells: ids(map), nodes: map.nav.pos.length,
      orphans: orphans(map), room: room(map), anchors: anchors(map),
      route: route(map),
      stats: { ...map.pump.stats, chunks: map.pump.stats.chunks.length },
    };
    map.dispose();
  }

  if (want('all')) {
    const map = fresh();
    const t0 = performance.now();
    const data = new Map();
    await Promise.all(map.cells.map(async (c) => {
      const res = await fetch(map.chunkUrl(c.id));
      data.set(c.id, await res.json());
    }));
    const fetchMs = performance.now() - t0;
    const per = [];
    const s0 = performance.now();
    for (const c of map.cells) {
      const c0 = performance.now();
      map.applyChunk(c.id, data.get(c.id));
      per.push({ id: c.id, ms: +(performance.now() - c0).toFixed(1) });
    }
    const wall = performance.now() - s0;
    const r = route(map);
    out.all = {
      cells: ids(map), fetchMs: +fetchMs.toFixed(1), syncMs: +wall.toFixed(1), per,
      nodes: map.nav.pos.length,
      edges: map.nav.adj.reduce((s, a) => s + a.length, 0) / 2,
      orphans: orphans(map), room: room(map), anchors: anchors(map), route: r,
      counters: { windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount },
      sceneChildren: map.scene.children.length,
      bounds: map.bounds,
    };
    // цена BFS достижимости — вариант (а) § 10.12 на том же графе
    const nav = map.nav;
    const bfs = () => {
      const seen = new Uint8Array(nav.pos.length);
      const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
      if (start < 0) return seen;
      const q = [start]; seen[start] = 1;
      for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
      return seen;
    };
    const runs = [];
    for (let k = 0; k < 7; k++) {
      const t = performance.now();
      for (let rep = 0; rep < 10; rep++) bfs();
      runs.push(+((performance.now() - t) / 10).toFixed(3));
    }
    out.all.bfsMs = runs.slice().sort((a, b) => a - b)[3];
    out.all.bfsRuns = runs;
    // коридор маршрута: только клетки, по которым он идёт
    out.all.corridor = r.cells.filter(c => c !== 'вне');
    map.dispose();
  }

  if (want('corridor') && out.all?.corridor) {
    const map = fresh();
    const t0 = performance.now();
    for (const id of out.all.corridor) await map.loadChunk(id);
    out.corridor = {
      cells: ids(map), wallMs: +(performance.now() - t0).toFixed(1),
      nodes: map.nav.pos.length, orphans: orphans(map), room: room(map), route: route(map),
    };
    map.dispose();
  }

  // Глава 14 глазами движка: загрузка до интертитра, тела на опорах, окно за кадром
  if (want('engine')) {
    const game = window.game;
    const t0 = performance.now();
    await game._loadLevel(13);
    const loadMs = performance.now() - t0;
    const map = game.map;
    const bodies = () => game.enemies.items.map((e) => {
      const p = e.position;
      const near = map.nav.nearestNode(p.x, p.y ?? map.groundHeightAt(p.x, p.z, 500), p.z, map.navFit);
      const np = near >= 0 ? map.nav.pos[near] : null;
      return {
        alien: e instanceof Object && !!e.cfg?.leap,
        x: +p.x.toFixed(1), z: +p.z.toFixed(1),
        built: map.isBuiltAt(p.x, p.z),
        nodeGap: np ? +Math.hypot(np.x - p.x, np.z - p.z).toFixed(3) : null,
        offstage: !!e.offstage, dead: !!e.dead,
      };
    });
    const atLoad = {
      state: game.state, loadMs: +loadMs.toFixed(1),
      kind: map.kind ?? 'open', cells: [...map.loaded.keys()],
      nodes: map.nav.pos.length,
      fit: map.nav.pos.reduce((s, _, i) => s + (map.navFit(i) ? 1 : 0), 0),
      spawnCell: map.spawnCell()?.id ?? null,
      builtAtSpawn: map.isBuiltAt(map.spawn.x, map.spawn.z),
      blockedAtSpawn: map.isBlocked(map.spawn.x, map.spawn.z, CONFIG.radius, map.spawn.y ?? 0, BODY_H),
      playerY: +game.player.position.y.toFixed(3),
      playerXZ: { x: +game.player.position.x.toFixed(1), z: +game.player.position.z.toFixed(1) },
      spawnY: map.spawn.y,
      exit: game.exit ? { x: game.exit.x, y: +game.exit.y.toFixed(3), z: game.exit.z, built: map.isBuiltAt(game.exit.x, game.exit.z) } : null,
      cars: game.cars?.count ?? 0,
      enemies: bodies(),
      counters: { windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount },
      bounds: map.bounds,
      camera: { x: +game.camera.position.x.toFixed(1), y: +game.camera.position.y.toFixed(1), z: +game.camera.position.z.toFixed(1) },
      firstChunkMs: map.pump.stats.firstChunkMs === null ? null : +map.pump.stats.firstChunkMs.toFixed(1),
      worstChunk: map.pump.stats.worstChunk,
      sceneChildren: game.scene.children.length,
    };
    // кадры за интертитром: движок зовёт `_worldPump` в состоянии 'chapter'
    let frames = 0, worstFrame = 0, idleAt = null;
    let inFrame = [], worstSlices = null, worstAccum = 0;
    const heldSlice = map._runSlice;
    const coldAt = map.pump.costWorst.size;
    map._runSlice = function (slice) {
      const t = performance.now();
      heldSlice.call(this, slice);
      inFrame.push({ label: slice.label, ms: +(performance.now() - t).toFixed(2) });
    };
    const p0 = performance.now();
    for (;;) {
      const before = map.pump.stats.slices;
      inFrame = [];
      const f0 = performance.now();
      game._worldPump();
      const fMs = performance.now() - f0;
      if (fMs > worstFrame) {
        worstFrame = fMs;
        worstSlices = inFrame.slice();
        const atom = inFrame.reduce((m, s) => Math.max(m, s.ms), 0);
        worstAccum = fMs - atom;
      }
      frames++;
      const idle = map.pump.stats.slices === before && !map.pump.task && map.pump.requests.size === 0;
      if (idle && idleAt === null) idleAt = frames;
      if (idle || frames >= 400) break;
      await new Promise(r => setTimeout(r, 0));
    }
    delete map._runSlice;
    out.engine = {
      atLoad,
      intertitle: {
        frames, idleAt, wallMs: +(performance.now() - p0).toFixed(1),
        worstFrameMs: +worstFrame.toFixed(1),
        worstFrameSlices: worstSlices, worstAccumMs: +worstAccum.toFixed(1),
        coldLabelsAtFirstFrame: coldAt,
        costWorst: [...map.pump.costWorst.entries()].map(([k, v]) => `${k} ${v.toFixed(1)}`).sort(),
        cells: [...map.loaded.keys()], nodes: map.nav.pos.length,
        fit: map.nav.pos.reduce((s, _, i) => s + (map.navFit(i) ? 1 : 0), 0),
        enemies: bodies(),
        exitY: game.exit ? +game.exit.y.toFixed(3) : null,
        counters: { windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount },
        stats: { ...map.pump.stats, chunks: map.pump.stats.chunks.map(c => `${c.kind}:${c.id} ${c.ms.toFixed(0)}мс`) },
        orphans: orphans(map), room: room(map), route: route(map),
      },
    };
  }

  // Достижимость (§ 10.12(а)) и цена среза `reach` на полном мире главы
  if (want('reach')) {
    await preloadWorldCells(LEVEL_14.map);
    const map = new WorldMap(LEVEL_14.map);
    const scene = new THREE.Scene();
    const b0 = performance.now();
    map.build(scene);
    const startMs = performance.now() - b0;
    const startCells = [...map.loaded.keys()];
    const data = new Map();
    await Promise.all(map.cells.map(async (c) => {
      if (map.loaded.has(c.id)) return;
      const res = await fetch(map.chunkUrl(c.id));
      data.set(c.id, await res.json());
    }));
    const per = [];
    for (const c of map.cells) {
      if (!data.has(c.id)) continue;
      const c0 = performance.now();
      map.applyChunk(c.id, data.get(c.id));
      per.push({ id: c.id, ms: +(performance.now() - c0).toFixed(1) });
    }
    const nav = map.nav;
    const runs = [];
    for (let k = 0; k < 7; k++) {
      const t = performance.now();
      for (let rep = 0; rep < 10; rep++) map._markReachable();
      runs.push(+((performance.now() - t) / 10).toFixed(3));
    }
    let fit = 0;
    for (let i = 0; i < nav.pos.length; i++) if (map.navFit(i)) fit++;
    out.reach = {
      catalog: map.catalog, startCells, startMs: +startMs.toFixed(1),
      nodes: nav.pos.length, edges: nav.adj.reduce((s, a) => s + a.length, 0) / 2,
      fit, orphans: orphans(map), room: room(map), anchors: anchors(map), route: route(map),
      counters: { windows: map.windowCount, clutter: map.clutterCount, signage: map.signageCount },
      reachMs: runs.slice().sort((a, b) => a - b)[3], reachRuns: runs,
      per, sceneChildren: scene.children.length,
      fetches: map.pump.stats.fetches, built: map.pump.stats.built,
    };
    map.dispose();
    out.reach.afterDispose = scene.children.length;
  }

  if (want('leaks')) {
    const counts = [];
    for (let round = 0; round < 2; round++) {
      const map = fresh();
      const scene = map.scene;
      counts.push(scene.children.length);
      map.dispose();
      counts.push(scene.children.length);
    }
    // и с полной загрузкой: build/dispose на всех клетках
    const full = [];
    for (let round = 0; round < 2; round++) {
      const map = fresh();
      const scene = map.scene;
      for (const c of map.cells) await map.loadChunk(c.id);
      full.push(scene.children.length);
      map.dispose();
      full.push(scene.children.length);
    }
    out.leaks = { emptyBuildDispose: counts, fullBuildDispose: full };
  }

  return out;
}