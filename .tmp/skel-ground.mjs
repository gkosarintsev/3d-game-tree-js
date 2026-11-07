// Мера (временный файл): связен ли ПРОБЕЖНЫЙ мир решёткой грунта вengine-шаге 6 м.
// Если да — скелет обязан уметь пересекать открытое пространство, если нет —
// districts в фикстуре разрезаны самими данными, и «одна связная сеть» от скелета
// не зависит.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { Proto, prepare, build } from './skel-proto-lib.mjs';

const GS = Number(process.env.SK_GS ?? CONFIG.jsonMap.navStep);
const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const map = (await generateCatalog(structuredClone(raw), 'probe/open-2km.json')).worldMap;
const f = prepare(new Proto(map));
f.navStep = GS;
const nav = build(f, { lattice: GS });
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
const big = groups.reduce((a, b) => (b.length > groups[a].length ? b : a), 0);
console.log(JSON.stringify({
  gs: GS, nodes: n, components: groups.length,
  sizes: groups.map(v => v.length).sort((a, b) => b - a).slice(0, 14),
  bigSize: big.length,
  roads: map.roads.length, buildings: map.buildings.length,
}, null, 1));
