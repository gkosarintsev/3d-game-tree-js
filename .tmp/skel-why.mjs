// Почему_components_не сшиваются:Geom_и_профиль_поля_между_остатками (временный файл).
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { NavGraph } from '../src/nav-graph.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { Proto, STEP, build } from './skel-proto-lib.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const prepared = process.env.SK_OPEN === '0'
  ? { worldMap: normalizeLevel(expandCity(structuredClone(raw))).map }
  : await generateCatalog(structuredClone(raw), 'probe/open-2km.json');
const f = new Proto(prepared.worldMap);
const map = prepared.worldMap;
const nav = build(f);
const n = nav.pos.length;
const comp = new Int32Array(n).fill(-1);
let comps = 0;
for (let s = 0; s < n; s++) {
  if (comp[s] >= 0) continue;
  const q = [s]; comp[s] = comps;
  for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = comps; q.push(nb); }
  comps++;
}
const groups = [];
for (let i = 0; i < n; i++) (groups[comp[i]] ??= []).push(i);

console.log('J.navEdgeDrop =', CONFIG.jsonMap.navEdgeDrop, '| J.navEdgeProbe =', CONFIG.jsonMap.navEdgeProbe,
  '| stepUp =', f.stepUp, '| relief =', map.relief ? 'есть' : 'нет',
  '| groundY =', map.groundY, '| groundPlane =', map.groundPlane);
console.log('холмов в рельефе:', map.relief?.hills?.length ?? 0, '| террас:', map.relief?.flats?.length ?? 0);

const stats = groups.map((ids, c) => {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const ys = ids.map(i => nav.pos[i].y);
  ys.sort((a, b) => a - b);
  for (const i of ids) { const p = nav.pos[i]; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  return { c, size: ids.length, box: [Math.round(minX), Math.round(minZ), Math.round(maxX), Math.round(maxZ)],
    yMed: +ys[ys.length >> 1].toFixed(2), yMin: +ys[0].toFixed(2), yMax: +ys[ys.length - 1].toFixed(2), ids };
});
console.log('компоненты:', JSON.stringify(stats.map(({ ids, ...v }) => v), null, 0));

// ближайшие пары между всеми компонентами + профиль опоры вдоль линии
const pairs = [];
for (let a = 0; a < stats.length; a++) for (let b = a + 1; b < stats.length; b++) {
  let best = null;
  for (const i of stats[a].ids) for (const j of stats[b].ids) {
    const p = nav.pos[i], q = nav.pos[j];
    const d = Math.hypot(q.x - p.x, q.z - p.z);
    if (!best || d < best.d) best = { d, i, j };
  }
  if (!best) continue;
  const p = nav.pos[best.i], q = nav.pos[best.j];
  const clear = f.bodyClearLine(p, q);
  const sup = f._edgeSupported(p, q);
  // профиль опоры по линии
  const steps = Math.max(1, Math.ceil(best.d / CONFIG.jsonMap.navEdgeProbe));
  const prof = [];
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const x = p.x + (q.x - p.x) * t, z = p.z + (q.z - p.z) * t;
    prof.push(+f.groundHeightAt(x, z, Math.max(p.y, q.y)).toFixed(2));
  }
  pairs.push({ pair: `${stats[a].c}-${stats[b].c}`, d: +best.d.toFixed(1), clear, sup,
    ends: [+p.y.toFixed(2), +q.y.toFixed(2)], prof: prof.length > 14 ? [...prof.slice(0, 7), '…', ...prof.slice(-6)] : prof });
}
pairs.sort((x, y) => x.d - y.d);
console.log('\nближайшие пары компонент:');
for (const v of pairs.slice(0, 14)) console.log(' ', JSON.stringify(v));
