// Мера сварки v4 (временный файл). Клетка поиска представлена либо центром грунта
// (если он проходим), либо узлом скелета, в ней стоящим — иначе «путь» упирался бы
// в клетку настила, до которого нога не дотягивается. Сварка засчитывается только
// после пересчёта компонент.
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
  const half = map.ground.size / 2;
  const key = (i, j) => i * 65536 + j;
  const ix = (x) => Math.floor((x + half) / GS);

  // узлы скелета по клеткам поиска
  const nodeCells = new Map();
  for (let i = 0; i < n0; i++) {
    const p = nav.pos[i];
    const k = key(ix(p.x), ix(p.z));
    (nodeCells.get(k) ?? nodeCells.set(k, []).get(k)).push(i);
  }

  const cells = new Map();
  let probed = 0;
  function cell(i, j) {
    const k = key(i, j);
    if (cells.has(k)) return cells.get(k);
    probed++;
    const ids = nodeCells.get(k);
    if (ids) {                                     // узел в клетке — клетка проходима по нему
      const x = (i + 0.5) * GS - half, z = (j + 0.5) * GS - half;
      let best = ids[0], bd = Infinity;
      for (const id of ids) { const d = Math.hypot(nav.pos[id].x - x, nav.pos[id].z - z); if (d < bd) { bd = d; best = id; } }
      const p = nav.pos[best];
      const v = { i, j, x: p.x, z: p.z, y: p.y, node: best, ids };
      cells.set(k, v);
      return v;
    }
    const x = (i + 0.5) * GS - half, z = (j + 0.5) * GS - half;
    let v = null;
    if (Math.abs(x) <= half && Math.abs(z) <= half && !f._inBuilding(x, z)) {
      const fromY = f.relief ? f.relief.heightAt(x, z) : f.groundY;
      const y = f.groundHeightAt(x, z, fromY);
      if (!f.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) v = { i, j, x, z, y, node: null, ids: null };
    }
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
    return groups;
  };

  let keep0 = 0;
  // узлы сварки добавляются хвостом, поэтому отказ отрезает весь хвост попыток:
  // `_skelBridge` сам вставляет промежуточные узлы подъёма, и удалять по одному —
  // оставить висячие индексы
  const unadd = () => {
    for (let id = nav.pos.length - 1; id >= keep0; id--) {
      const p = nav.pos[id];
      const list = nav._cells.get(nav._cellKey(Math.floor(p.x / nav.cell), Math.floor(p.z / nav.cell)));
      const at = list ? list.indexOf(id) : -1;
      if (at >= 0) list.splice(at, 1);
      nav.pos.pop(); nav.adj.pop(); nav.meta.pop();
    }
    for (const [k, v] of nav.byKey) if (v >= keep0) nav.byKey.delete(k);
  };

  const t0 = Date.now();
  let passes = 0, welds = 0, emitted = 0, cellsOnPath = 0, failures = [];
  for (;;) {
    passes++;
    const groups = comps();
    if (groups.length === 1) break;
    const big = groups.reduce((a, b, i) => (b.length > groups[a].length ? i : a), 0);
    const goal = new Map();                       // клетка → узел большой компоненты
    for (const i of groups[big]) {
      const p = nav.pos[i];
      const k = key(ix(p.x), ix(p.z));
      if (!goal.has(k)) goal.set(k, i);
    }
    const before = welds;
    for (let gi = 0; gi < groups.length; gi++) {
      if (gi === big) continue;
      const ids = groups[gi];
      const xs = ids.map(i => nav.pos[i].x), zs = ids.map(i => nav.pos[i].z);
      const i0 = ix(Math.min(...xs)) - Math.ceil(BOX / GS), i1 = ix(Math.max(...xs)) + Math.ceil(BOX / GS);
      const j0 = ix(Math.min(...zs)) - Math.ceil(BOX / GS), j1 = ix(Math.max(...zs)) + Math.ceil(BOX / GS);
      const prev = new Map();
      const q = [];
      let seedNode = null;
      for (const i of ids) {
        const cl = cell(ix(nav.pos[i].x), ix(nav.pos[i].z));
        if (!cl) continue;
        const k = key(cl.i, cl.j);
        if (prev.has(k)) continue;
        prev.set(k, null);
        q.push(cl);
        if (seedNode === null) seedNode = cl.node ?? i;
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
          if (goal.has(nk)) { hitCell = cc; hitGoal = goal.get(nk); break; }
          if (!nc || !edgeOk(cc, nc)) continue;
          q.push(nc);
        }
      }
      if (!hitCell) { failures.push(`#${gi} (${ids.length} узлов): коридора в окне ${Math.round((i1 - i0) * GS)}×${Math.round((j1 - j0) * GS)} м нет`); continue; }
      const path = [];
      let cur = hitCell;
      while (cur) { path.push(cur); cur = prev.get(key(cur.i, cur.j)); }
      path.reverse();
      cellsOnPath += path.length;
      const every = Math.max(1, Math.round(EMIT / GS));
      let prevNode = seedNode;
      let made = 0;
      keep0 = nav.pos.length;
      for (let s = every; s < path.length; s += every) {
        const cl = path[s];
        if (cl.node !== null) { prevNode = cl.node; made++; continue; }
        const id = nav.add(cl.x, cl.y, cl.z, `p:${gi}:${s}`);
        if (f._skelBridge(nav, prevNode, id, `pw:${gi}:${s}`)) { prevNode = id; made++; emitted++; keep0 = nav.pos.length; } else { unadd(); keep0 = nav.pos.length; }
      }
      if (prevNode !== null && f._skelBridge(nav, prevNode, hitGoal, `pw:${gi}:tail`)) { welds++; keep0 = nav.pos.length; }
      else { unadd(); failures.push(`#${gi} (${ids.length}): путь ${path.length} клеток есть, последнее ребро не проходит`); }
    }
    if (welds === before) break;
  }
  const fin = comps();
  console.log(JSON.stringify({
    label, nodes0: n0, weldMs: Date.now() - t0, passes, welds, emitted, cellsOnPath,
    cellsProbed: probed, edgeChecks, nodesAfter: nav.pos.length,
    components: fin.length, sizes: fin.map(v => v.length).sort((a, b) => b - a).slice(0, 6),
    failures: failures.slice(0, 8),
  }, null, 1));
}
