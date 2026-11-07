// Мера сварки итеративно, с общим кэшем проходимости и рёбер (временный файл).
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
  ['probe 1400', 'probe/open-2km.json', false],
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

  // --- общая сетка проходимости и кэш рёбер
  const half = map.ground.size / 2;
  const cells = new Map();
  const key = (i, j) => i * 65536 + j;
  let probed = 0;
  function cell(i, j) {
    const k = key(i, j);
    if (cells.has(k)) return cells.get(k);
    probed++;
    const x = (i + 0.5) * GS - half, z = (j + 0.5) * GS - half;
    if (Math.abs(x) > half || Math.abs(z) > half) { cells.set(k, null); return null; }
    if (f._inBuilding(x, z)) { cells.set(k, null); return null; }
    const fromY = f.relief ? f.relief.heightAt(x, z) : f.groundY;
    const y = f.groundHeightAt(x, z, fromY);
    if (f.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) { cells.set(k, null); return null; }
    const v = { i, j, x, z, y };
    cells.set(k, v);
    return v;
  }
  const edgeMemo = new Map();
  function edgeOk(a, b) {
    const k = a.i < b.i || (a.i === b.i && a.j < b.j) ? `${a.i},${a.j}|${b.i},${b.j}` : `${b.i},${b.j}|${a.i},${a.j}`;
    if (edgeMemo.has(k)) return edgeMemo.get(k);
    const ok = Math.abs(a.y - b.y) <= f.stepUp && f.bodyClearLine(a, b) && f._edgeSupported(a, b);
    edgeMemo.set(k, ok);
    return ok;
  }

  // --- группы и их клетки
  const label2 = () => {
    const c = new Int32Array(nav.pos.length).fill(-1);
    const groups = [];
    let k = 0;
    for (let s = 0; s < nav.pos.length; s++) {
      if (c[s] >= 0) continue;
      const q = [s]; c[s] = k;
      for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (c[nb] < 0) { c[nb] = k; q.push(nb); }
      groups.push(q); k++;
    }
    return { c, groups };
  };
  const cellOf = (p) => cell(Math.floor((p.x + half) / GS), Math.floor((p.z + half) / GS));

  const t0 = Date.now();
  let passes = 0, merges = 0, emitted = 0;
  for (;;) {
    passes++;
    const { c, groups } = label2();
    if (groups.length === 1) break;
    const big = groups.reduce((a, b, i) => (b.length > groups[a].length ? i : a), 0);
    const goals = new Set();
    for (const i of groups[big]) { const p = nav.pos[i]; const cl = cellOf(p); if (cl) goals.add(key(cl.i, cl.j)); }
    const merged = [];
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
        const cl = cellOf(nav.pos[i]);
        if (!cl) continue;
        const k = key(cl.i, cl.j);
        if (!prev.has(k)) { prev.set(k, null); q.push(cl); }
      }
      let hit = null;
      for (let h = 0; h < q.length && !hit; h++) {
        const cc = q[h];
        if (goals.has(key(cc.i, cc.j))) { hit = cc; break; }
        for (const [di, dj] of DIRS) {
          const ii = cc.i + di, jj = cc.j + dj;
          if (ii < i0 || ii > i1 || jj < j0 || jj > j1) continue;
          const nk = key(ii, jj);
          if (prev.has(nk)) continue;
          const nc = cell(ii, jj);
          prev.set(nk, cc);
          if (!nc || goals.has(nk)) continue;
          if (!edgeOk(cc, nc)) continue;
          q.push(nc);
        }
      }
      if (!hit) { merged.push(gi); continue; }
      // путь → клетки
      const path = [];
      let cur = hit;
      while (cur) { path.push(cur); cur = prev.get(key(cur.i, cur.j)); }
      path.reverse();
      // эмиссия каждым every-й клеткой, ребра валидирует `_skelBridge`
      const every = Math.max(1, Math.round(EMIT / GS));
      let prevNode = ids[0];
      const unadd = (id) => {
        const p2 = nav.pos[id];
        const cl = nav._cells.get(nav._cellKey(Math.floor(p2.x / nav.cell), Math.floor(p2.z / nav.cell)));
        const at = cl ? cl.indexOf(id) : -1;
        if (at >= 0) cl.splice(at, 1);
        nav.pos.pop(); nav.adj.pop(); nav.meta.pop();
      };
      let made = 0;
      for (let s = every; s < path.length; s += every) {
        const cl = path[s];
        const id = nav.add(cl.x, cl.y, cl.z, `p:${gi}:${s}`);
        if (!f._skelBridge(nav, prevNode, id, `pw:${gi}:${s}`)) unadd(id);
        else { prevNode = id; made++; emitted++; }
      }
      const last = path[path.length - 1];
      const gid = nav.add(last.x, last.y, last.z, `p:${gi}:end`);
      if (f._skelBridge(nav, prevNode, gid, `pw:${gi}:end`)) emitted++; else unadd(gid);
      merges++;
    }
    const { groups: g2 } = label2();
    if (g2.length >= groups.length) break;   // дальше варить нечем
  }
  const { groups: fin } = label2();
  console.log(JSON.stringify({
    label, nodes0: n0, weldMs: Date.now() - t0, passes, welds: merges, emitted,
    cellsProbed: probed, edgesMemoized: edgeMemo.size, nodesAfter: nav.pos.length,
    components: fin.length, sizes: fin.map(v => v.length).sort((a, b) => b - a).slice(0, 8),
  }, null, 1));
}
