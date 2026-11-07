// Мера сварки v3: сетка поиска, где клетка с узлом скелета проходима по определению
// (настил над водой грунтом непроходим, а враг на нём стоит). Временный файл.
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
const DIRS = process.env.SK_DIRS ? JSON.parse(process.env.SK_DIRS) : [[1, 0], [-1, 0], [0, 1], [0, -1]];

for (const [label, file, plain] of [
  ['level-12', 'src/levels/level-12.json', true],
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

  // --- клетка: проходима, если грунт держит ИЛИ в ней стоит узел скелета
  const cells = new Map();
  let probed = 0;
  function cell(i, j) {
    const k = key(i, j);
    if (cells.has(k)) return cells.get(k);
    probed++;
    const x = (i + 0.5) * GS - half, z = (j + 0.5) * GS - half;
    let rep = null;
    if (Math.abs(x) <= half && Math.abs(z) <= half && !f._inBuilding(x, z)) {
      const fromY = f.relief ? f.relief.heightAt(x, z) : f.groundY;
      const y = f.groundHeightAt(x, z, fromY);
      if (!f.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) rep = { x, z, y, node: null };
    }
    if (!rep) {
      // узел скелета ближе к центру клетки, чем предел шага: клетка проходима по нему
      let best = null;
      for (const idx of nav.nearby(x, z, GS)) {
        const p = nav.pos[idx];
        const d = Math.hypot(p.x - x, p.z - z);
        if (!best || d < best.d) best = { d, idx, p };
      }
      if (best && best.d <= GS * 0.75) rep = { x: best.p.x, z: best.p.z, y: best.p.y, node: best.idx };
    }
    const v = rep ? { i, j, ...rep } : null;
    cells.set(k, v);
    return v;
  }
  const edges = new Map();
  let edgeChecks = 0;
  function edgeOk(a, b) {
    const k = a.i < b.i || (a.i === b.i && a.j <= b.j) ? `${a.i},${a.j}|${b.i},${b.j}` : `${b.i},${b.j}|${a.i},${a.j}`;
    if (edges.has(k)) return edges.get(k);
    edgeChecks++;
    const ok = Math.abs(a.y - b.y) <= f.stepUp && f.bodyClearLine(a, b) && f._edgeSupported(a, b);
    edges.set(k, ok);
    return ok;
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
    return { c, groups };
  };

  const t0 = Date.now();
  let passes = 0, welds = 0, emitted = 0, failed = [];
  for (;;) {
    passes++;
    const { groups } = comps();
    if (groups.length === 1) break;
    const big = groups.reduce((a, b, i) => (b.length > groups[a].length ? i : a), 0);
    const goalNode = new Map();
    for (const i of groups[big]) {
      const p = nav.pos[i];
      const k = key(Math.floor((p.x + half) / GS), Math.floor((p.z + half) / GS));
      const c = cell(Math.floor((p.x + half) / GS), Math.floor((p.z + half) / GS));
      const d = c ? Math.hypot(p.x - c.x, p.z - c.z) : 0;
      if (!goalNode.has(k) || d < goalNode.get(k).d) goalNode.set(k, { i, d });
    }
    const goalKeys = new Set(goalNode.keys());
    const before = welds;
    for (let gi = 0; gi < groups.length; gi++) {
      if (gi === big) continue;
      const ids = groups[gi];
      const xs = ids.map(i => nav.pos[i].x), zs = ids.map(i => nav.pos[i].z);
      const i0 = Math.floor((Math.min(...xs) + half) / GS) - Math.ceil(BOX / GS);
      const i1 = Math.floor((Math.max(...xs) + half) / GS) + Math.ceil(BOX / GS);
      const j0 = Math.floor((Math.min(...zs) + half) / GS) - Math.ceil(BOX / GS);
      const j1 = Math.floor((Math.max(...zs) + half) / GS) + Math.ceil(BOX / GS);
      const prev = new Map();
      const q = [];
      for (const i of ids) {
        const cl = cell(Math.floor((nav.pos[i].x + half) / GS), Math.floor((nav.pos[i].z + half) / GS));
        if (!cl) continue;
        const k = key(cl.i, cl.j);
        if (!prev.has(k)) { prev.set(k, null); q.push(cl); }
      }
      let hitCell = null, hitGoal = null;
      for (let h = 0; h < q.length && !hitCell; h++) {
        const cc = q[h];
        for (const [di, dj] of DIRS) {
          const ii = cc.i + di, jj = cc.j + dj;
          if (ii < i0 || ii > i1 || jj < j0 || jj > j1) continue;
          const nk = key(ii, jj);
          if (prev.has(nk)) continue;
          const nc = cell(ii, jj);
          prev.set(nk, cc);
          if (goalKeys.has(nk)) { hitCell = cc; hitGoal = goalNode.get(nk); break; }
          if (!nc || !edgeOk(cc, nc)) continue;
          q.push(nc);
        }
      }
      if (!hitCell) { failed.push(`#${gi}:${ids.length}`); continue; }
      const path = [];
      let cur = hitCell;
      while (cur) { path.push(cur); cur = prev.get(key(cur.i, cur.j)); }
      path.reverse();
      const every = Math.max(1, Math.round(EMIT / GS));
      let prevNode = path[0].node ?? ids[0];
      const unadd = (id) => {
        const p = nav.pos[id];
        const list = nav._cells.get(nav._cellKey(Math.floor(p.x / nav.cell), Math.floor(p.z / nav.cell)));
        const at = list ? list.indexOf(id) : -1;
        if (at >= 0) list.splice(at, 1);
        nav.pos.pop(); nav.adj.pop(); nav.meta.pop();
      };
      for (let s = every; s < path.length; s += every) {
        const cl = path[s];
        if (cl.node !== null && cl.node !== undefined) { prevNode = cl.node; continue; }
        const id = nav.add(cl.x, cl.y, cl.z, `p:${gi}:${s}`);
        if (f._skelBridge(nav, prevNode, id, `pw:${gi}:${s}`)) { prevNode = id; emitted++; } else unadd(id);
      }
      const tail = hitGoal?.i ?? null;
      if (tail !== null && f._skelBridge(nav, prevNode, tail, `pw:${gi}:tail`)) welds++;
      else if (tail === null) {
        const k2 = key(hitCell.i, hitCell.j);
        const nk2 = key(hitCell.i + 1, hitCell.j);
        failed.push(`#${gi}: цель без узла`);
        if (process.env.SK_DBG) {
          // клетка цели: центр, узлы рядом, почему cell() отдал null
          for (const [ii, jj] of [[hitCell.i + 1, hitCell.j], [hitCell.i - 1, hitCell.j], [hitCell.i, hitCell.j + 1], [hitCell.i, hitCell.j - 1]]) {
            const x = (ii + 0.5) * GS - half, z = (jj + 0.5) * GS - half;
            const cand = nav.nearby(x, z, GS).map(i => ({ i, d: +Math.hypot(nav.pos[i].x - x, nav.pos[i].z - z).toFixed(2), inB: f._inBuilding(nav.pos[i].x, nav.pos[i].z) }));
            console.error(`клетка ${ii},${jj} центр (${x.toFixed(1)},${z.toFixed(1)}) inB=${f._inBuilding(x, z)} узлы ${JSON.stringify(cand.slice(0, 5))} cached=${JSON.stringify(cells.get(key(ii, jj)))}`);
          }
        }
      }
    }
    if (welds === before) break;
  }
  const { groups: fin } = comps();
  console.log(JSON.stringify({
    label, nodes0: n0, weldMs: Date.now() - t0, passes, welds, emitted,
    cellsProbed: probed, edgeChecks, nodesAfter: nav.pos.length,
    components: fin.length, sizes: fin.map(v => v.length).sort((a, b) => b - a).slice(0, 6),
    failed: failed.slice(0, 12),
  }, null, 1));
}
