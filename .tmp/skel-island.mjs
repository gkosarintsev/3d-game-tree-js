// Мера (временный файл): чем являются оставшиеся компоненты скелета на shipping-главах.
import { readFileSync } from 'node:fs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
import { Proto, build } from './skel-proto-lib.mjs';

for (const file of ['src/levels/level-12.json', 'src/levels/level-13.json']) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const map = normalizeLevel(expandCity(structuredClone(raw))).map;
  const f = new Proto(map);
  const nav = build(f);
  const n = nav.pos.length;
  const comp = new Int32Array(n).fill(-1);
  const groups = [];
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    const q = [s]; comp[s] = groups.length;
    for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = groups.length; q.push(nb); }
    groups.push(q);
  }
  const keyOf = new Map();
  for (const [k, i] of nav.byKey) if (!keyOf.has(i)) keyOf.set(i, k);
  let bigIdx = 0; for (let i = 1; i < groups.length; i++) if (groups[i].length > groups[bigIdx].length) bigIdx = i;
  const big = groups[bigIdx];
  console.log(JSON.stringify({ file, nodes: n, components: groups.length, sizes: groups.map(g => g.length).sort((a, b) => b - a).slice(0, 6) }));
  for (const g of groups) {
    if (g.length === big.length && g[0] === big[0]) continue;
    console.log(JSON.stringify({ size: g.length, nodes: g.map(i => ({ k: keyOf.get(i), p: [+nav.pos[i].x.toFixed(1), +nav.pos[i].y.toFixed(2), +nav.pos[i].z.toFixed(1)] })) }).slice(0, 700));
  }
}
