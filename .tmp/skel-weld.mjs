// Мера «сварочного поиска»: связывает ли лишний решёточный поиск по проходимости
// то, что не сварила прямая линия. Решётка — только структура поиска, в скелет
// идут узлы найденного коридора (шаг эмиссии — шаг скелета). Временный файл.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { Proto, STEP, build, prepare } from './skel-proto-lib.mjs';

const J = CONFIG.jsonMap;
const GS = Number(process.env.SK_GS ?? J.navStep);      // шаг решётки поиска
const EMIT = Number(process.env.SK_EMIT ?? STEP);       // шаг эмиссии узлов
const BOX = Number(process.env.SK_BOX ?? 400);          // предел раздувания окна поиска

/** Lazily built passability grid over a bounded box, in the engine's own predicate. */
function makeGrid(f, box) {
  const cells = new Map();
  const key = (i, j) => i * 65536 + j;
  let probed = 0;
  return {
    cells, probed: () => probed,
    at(x, z) {
      const i = Math.floor(x / GS), j = Math.floor(z / GS), k = key(i, j);
      if (cells.has(k)) return cells.get(k);
      probed++;
      if (Math.abs(x - box.cx) > box.hw || Math.abs(z - box.cz) > box.hz) { cells.set(k, null); return null; }
      if (f._inBuilding(x, z)) { cells.set(k, null); return null; }
      const fromY = f.relief ? f.relief.heightAt(x, z) : f.groundY;
      const y = f.groundHeightAt(x, z, fromY);
      if (f.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) { cells.set(k, null); return null; }
      const v = { i, j, x, z, y };
      cells.set(k, v);
      return v;
    },
    key,
  };
}

/** Поиск в ширину от исходных узлов до любой клетки цели; соседи — 4, порядок фиксирован. */
function weldSearch(f, grid, sources, goalCells) {
  const prev = new Map();
  const q = [];
  for (const s of sources) {
    const c = grid.at(s.x, s.z);
    if (!c) continue;
    const k = grid.key(c.i, c.j);
    if (prev.has(k)) continue;
    prev.set(k, null);
    q.push(c);
  }
  const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let h = 0; h < q.length; h++) {
    const c = q[h];
    const k = grid.key(c.i, c.j);
    if (goalCells.has(k)) return { hit: c, prev };
    for (const [di, dj] of DIRS) {
      const nk = grid.key(c.i + di, c.j + dj);
      if (prev.has(nk)) continue;
      const nc = grid.at(c.x + di * GS, c.z + dj * GS);
      if (!nc) { prev.set(nk, c); continue; }        // непроходимую клетку тожеmemo: не звать дважды
      if (Math.abs(nc.y - c.y) > f.stepUp) { prev.set(nk, c); continue; }
      if (!f.bodyClearLine(c, nc) || !f._edgeSupported(c, nc)) { prev.set(nk, c); continue; }
      prev.set(nk, c);
      q.push(nc);
    }
  }
  return null;
}

function pathFrom(prev, grid, hit) {
  const out = [];
  let k = grid.key(hit.i, hit.j);
  while (k !== undefined && k !== null) {
    const c = prev.get(k);
    const [i, j] = [Math.floor(k / 65536), ((k % 65536) + 65536) % 65536];
    out.push(grid.cells.get(k));
    if (c === null || c === undefined) break;
    k = grid.key(c.i, c.j);
    if (out.length > 100000) break;
  }
  return out.reverse().filter(Boolean);
}

for (const [label, file, plain] of [
  ['probe 1400', 'probe/open-2km.json', false],
  ['level-12', 'src/levels/level-12.json', true],
]) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  let map;
  if (plain) map = normalizeLevel(expandCity(structuredClone(raw))).map;
  else { raw.kind = 'open'; raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 }; map = (await generateCatalog(structuredClone(raw), file)).worldMap; }
  const f = prepare(new Proto(map));
  const nav = build(f);
  const n = nav.pos.length;
  const comp = new Int32Array(n).fill(-1);
  let k = 0;
  const groups = [];
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    const q2 = [s]; comp[s] = k;
    for (let h = 0; h < q2.length; h++) for (const nb of nav.adj[q2[h]]) if (comp[nb] < 0) { comp[nb] = k; q2.push(nb); }
    groups.push(q2); k++;
  }
  const bigIdx = groups.reduce((a, b, i) => (b.length > groups[a].length ? i : a), 0);
  const t0 = Date.now();
  let found = 0, emitted = 0, probed = 0, linked = 0;
  const report = [];
  for (let gi = 0; gi < groups.length; gi++) {
    if (gi === bigIdx) continue;
    const ids = groups[gi];
    const xs = ids.map(i => nav.pos[i].x), zs = ids.map(i => nav.pos[i].z);
    const bx = xs; const bz = zs;   // окно — только осиротевшая группа, раздуто на BOX
    const box = { cx: (Math.min(...bx) + Math.max(...bx)) / 2, cz: (Math.min(...bz) + Math.max(...bz)) / 2,
      hw: (Math.max(...bx) - Math.min(...bx)) / 2 + BOX, hz: (Math.max(...bz) - Math.min(...bz)) / 2 + BOX };
    if (box.hw * box.hz > 1_200_000) { report.push(`#${gi}: окно ${Math.round(box.hw * 2)}×${Math.round(box.hz * 2)} м больше предела — не искал`); continue; }
    const grid = makeGrid(f, box);
    const goal = new Set();
    for (const i of groups[bigIdx]) { const p = nav.pos[i]; goal.add(grid.key(Math.floor(p.x / GS), Math.floor(p.z / GS))); }
    const r = weldSearch(f, grid, ids.map(i => nav.pos[i]), goal);
    probed += grid.probed();
    if (!r) { report.push(`#${gi} (${ids.length} узлов): поиск в окне ${Math.round(box.hw * 2)}×${Math.round(box.hz * 2)} м — коридора нет`); continue; }
    const path = pathFrom(r.prev, grid, r.hit);
    found++;
    // эмиссия: каждый k-й узел пути, связываемый `_skelBridge` (он сам вставит
    // промежуточные на подъёме)
    const every = Math.max(1, Math.round(EMIT / GS));
    let prevNode = null;
    for (let s = 0; s < path.length; s += every) {
      const c = path[s];
      const id = nav.add(c.x, c.y, c.z, `p:${gi}:${s}`);
      if (prevNode !== null) { const made = f._skelBridge(nav, prevNode, id, `pw:${gi}:${s}`); if (made) linked++; else nav.adj[id] = []; }
      prevNode = id;
      emitted++;
    }
    const last = path[path.length - 1];
    const goalId = nav.add(last.x, last.y, last.z, `p:${gi}:goal`);
    if (f._skelBridge(nav, prevNode, goalId, `pw:${gi}:end`)) linked++;
    report.push(`#${gi} (${ids.length} узлов): путь ${path.length} клеток (${(path.length * GS).toFixed(0)} м), эмиссия ${emitted}`);
  }
  console.log(JSON.stringify({ label, nodes0: n, comps0: k, weldFound: found, weldMs: Date.now() - t0, cellsProbed: probed, emitted, report }, null, 1));
}
