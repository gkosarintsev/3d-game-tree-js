// Мера сварки v7 (временный файл). Клетка поиска имеет несколько представителей —
// центр грунта (если проходим) и узлы скелета, в ней стоящие; ребро поиска
// проходит, если какая-то пара представителей соседних клеток проходит проверки
// карты. Целью считается не «клетка с узлом», а состоявшееся ребро к узлу большой
// компоненты: под виадуком коридор проходит, не сцепляясь с его настилом.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { Proto, STEP, build, prepare } from './skel-proto-lib.mjs';

const J = CONFIG.jsonMap;
const GS = Number(process.env.SK_GS ?? J.navStep);
const EMIT = Number(process.env.SK_EMIT ?? STEP);
const BOX = Number(process.env.SK_BOX ?? 260);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

for (const [label, file, plain] of [
  ['level-12', 'src/levels/level-12.json', true],
  ['probe 1400', 'probe/open-2km.json', false],
  ['level-13', 'src/levels/level-13.json', true],
]) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  let map;
  if (plain) map = normalizeLevel(expandCity(structuredClone(raw))).map;
  else { raw.kind = 'open'; raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 }; map = (await generateCatalog(structuredClone(raw), file)).worldMap; }
  const f = prepare(new Proto(map));
  const nav = build(f);
  const n0 = nav.pos.length;
  const half = map.ground.size / 2;
  const key = (i, j) => i * 65536 + j;
  const ix = (x) => Math.floor((x + half) / GS);

  const nodeCells = new Map();
  for (let i = 0; i < n0; i++) {
    const p = nav.pos[i];
    (nodeCells.get(key(ix(p.x), ix(p.z))) ?? nodeCells.set(key(ix(p.x), ix(p.z)), []).get(key(ix(p.x), ix(p.z)))).push(i);
  }

  /** Представители клетки: центр грунта (если проходим) + узлы скелета в клетке. */
  const cells = new Map();
  let probed = 0;
  function cell(i, j) {
    const k = key(i, j);
    if (cells.has(k)) return cells.get(k);
    probed++;
    const x = (i + 0.5) * GS - half, z = (j + 0.5) * GS - half;
    const reps = [];
    if (Math.abs(x) <= half && Math.abs(z) <= half && !f._inBuilding(x, z)) {
      const fromY = f.relief ? f.relief.heightAt(x, z) : f.groundY;
      const y = f.groundHeightAt(x, z, fromY);
      if (!f.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) reps.push({ x, z, y, node: null });
    }
    for (const id of nodeCells.get(k) ?? []) {
      const p = nav.pos[id];
      reps.push({ x: p.x, z: p.z, y: p.y, node: id });
    }
    const v = reps.length ? { i, j, reps } : null;
    cells.set(k, v);
    return v;
  }
  const pts = (c) => c.reps.map(r => ({ x: r.x, z: r.z, y: r.y }));
  const edgeCache = new Map();
  let edgeChecks = 0;
  /** Проходит ли хоть одна пара представителей соседних клеток проверки карты. */
  function edgeOk(a, b) {
    const kk = a.i < b.i || (a.i === b.i && a.j <= b.j) ? `${a.i},${a.j}|${b.i},${b.j}` : `${b.i},${b.j}|${a.i},${a.j}`;
    if (edgeCache.has(kk)) return edgeCache.get(kk);
    let ok = false, win = null;
    for (const ra of a.reps) {
      for (const rb of b.reps) {
        edgeChecks++;
        if (Math.abs(ra.y - rb.y) > f.stepUp) continue;
        if (!f.bodyClearLine(ra, rb)) continue;
        if (!f._edgeSupported(ra, rb)) continue;
        ok = true; win = [ra, rb]; break;
      }
      if (ok) break;
    }
    edgeCache.set(kk, ok ? win : false);
    return ok ? edgeCache.get(kk) : false;
  }

  const comps = () => {
    const n = nav.pos.length;
    const c = new Int32Array(n).fill(-1);
    const groups = [];
    let k = 0;
    for (let s = 0; s < n; s++) {
      if (c[s] >= 0) continue;
      const q = [s]; c[s] = k;
      for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (c[nb] < 0) { c[nb] = k; q.push(nb); }
      groups.push(q); k++;
    }
    return groups;
  };
  let keep0 = 0;
  const unadd = () => {
    for (let id = nav.pos.length - 1; id >= keep0; id--) {
      const p = nav.pos[id];
      const list = nav._cells.get(nav._cellKey(Math.floor(p.x / nav.cell), Math.floor(p.z / nav.cell)));
      const at = list ? list.indexOf(id) : -1;
      if (at >= 0) list.splice(at, 1);
      nav.pos.pop(); nav.adj.pop(); nav.meta.pop();
    }
    for (const [k, v] of nav.byKey) if (v >= keep0) nav.byKey.delete(k);
    keep0 = nav.pos.length;
  };

  const t0 = Date.now();
  let passes = 0, emitted = 0, cellsOnPath = 0, failures = [], mergedTotal = 0;
  for (;;) {
    passes++;
    const groups = comps();
    if (groups.length === 1) break;
    const bigIdx = groups.reduce((a, b, i) => (b.length > groups[a].length ? i : a), 0);
    const big = new Set([bigIdx]);
    const before = mergedTotal;
    for (let gi = 0; gi < groups.length; gi++) {
      if (big.has(gi)) continue;
      const ids = groups[gi];
      const xs = ids.map(i => nav.pos[i].x), zs = ids.map(i => nav.pos[i].z);
      const i0 = ix(Math.min(...xs)) - Math.ceil(BOX / GS), i1 = ix(Math.max(...xs)) + Math.ceil(BOX / GS);
      const j0 = ix(Math.min(...zs)) - Math.ceil(BOX / GS), j1 = ix(Math.max(...zs)) + Math.ceil(BOX / GS);
      const inBig = new Set(groups[bigIdx]);
      const prev = new Map();
      const q = [];
      for (const i of ids) {
        const cl = cell(ix(nav.pos[i].x), ix(nav.pos[i].z));
        if (!cl) continue;
        const k = key(cl.i, cl.j);
        if (prev.has(k)) continue;
        prev.set(k, { from: null, via: null, self: cl.reps.find(r => r.node === i) ?? cl.reps[0] });
        q.push(cl);
      }
      let win = null;                                   // {клетка, репа-из, узел цели}
      for (let h = 0; h < q.length && !win; h++) {
        const cc = q[h];
        for (const [di, dj] of DIRS) {
          const ii = cc.i + di, jj = cc.j + dj;
          if (ii < i0 || ii > i1 || jj < j0 || jj > j1) continue;
          const nk = key(ii, jj);
          if (prev.has(nk)) continue;
          const nc = cell(ii, jj);
          if (!nc) { prev.set(nk, { from: cc, via: null, dead: true }); continue; }
          // цель: репа клетки — узел большой компоненты, и к нему есть ребро из репы cc
          let hit = null;
          for (const rb of nc.reps) {
            if (rb.node === null || !inBig.has(rb.node)) continue;
            for (const ra of cc.reps) {
              if (Math.abs(ra.y - rb.y) > f.stepUp) continue;
              if (!f.bodyClearLine(ra, rb) || !f._edgeSupported(ra, rb)) continue;
              hit = { ra, rb }; break;
            }
            if (hit) break;
          }
          if (hit) { prev.set(nk, { from: cc, via: hit }); win = { cell: nc, hit }; break; }
          const v = edgeOk(cc, nc);
          prev.set(nk, v ? { from: cc, via: v } : { from: cc, via: null, blocked: true });
          if (v) q.push(nc);
        }
      }
      if (!win) { failures.push(`#${gi} (${ids.length}): коридора с ребром в окне ${Math.round((i1 - i0) * GS)}×${Math.round((j1 - j0) * GS)} м нет (клеток visited ${prev.size})`); continue; }
      const path = [];
      let ck = key(win.cell.i, win.cell.j);
      while (prev.get(ck)?.from) { path.push(prev.get(ck).from); ck = key(prev.get(ck).from.i, prev.get(ck).from.j); }
      path.reverse();
      cellsOnPath += path.length + 1;
      keep0 = nav.pos.length;
      const every = Math.max(1, Math.round(EMIT / GS));
      // голова: от узла группы к первому эмиссийному узлу
      let prevNode = null;
      const headRep = prev.get(key(path[0]?.i ?? -1, path[0]?.j ?? -1))?.self;
      let joinedHead = headRep?.node ?? ids[0];
      let lastRep = win.hit.ra;
      const steps = [];
      for (let s = every; s < path.length; s += every) steps.push(s);
      for (const s of steps) {
        const cl = path[s];
        const rep = cl.reps[0];
        const id = rep.node !== null ? rep.node : nav.add(rep.x, rep.y, rep.z, `p:${gi}:${s}`);
        const okEdge = prevNode === null
          ? f._skelBridge(nav, joinedHead, id, `ph:${gi}:${s}`)
          : f._skelBridge(nav, prevNode, id, `pw:${gi}:${s}`);
        if (okEdge) { prevNode = id; if (id >= n0) emitted++; keep0 = nav.pos.length; }
        else if (id >= n0) unadd();
      }
      const goalNode = win.hit.rb.node;
      const fromNode = prevNode ?? joinedHead;
      if (f._skelBridge(nav, fromNode, goalNode, `pt:${gi}`)) mergedTotal++;
      else { unadd(); failures.push(`#${gi} (${ids.length}): путь ${path.length + 1} клеток, ребро к узлу ${goalNode} не проходит`); }
    }
    if (mergedTotal === before) break;
  }
  const fin = comps();
  console.log(JSON.stringify({
    label, gs: GS, box: BOX, nodes0: n0, weldMs: Date.now() - t0, passes, mergedTotal, emitted,
    cellsOnPath, cellsProbed: probed, edgeChecks, nodesAfter: nav.pos.length,
    components: fin.length, sizes: fin.map(v => v.length).sort((a, b) => b - a).slice(0, 6),
    failures: failures.slice(0, 6),
  }, null, 1));
}
