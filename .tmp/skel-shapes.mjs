// Мера (временный файл): три формы скелета — цена узлов и число компонент.
// S1 только магистрали (дороги/настилы/русло/двери), S2 + марши и кровли,
// S3 + решётки полов комнат.
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
import { Proto, build } from './skel-proto-lib.mjs';

const SHAPES = {
  S1: { rooms: false, roofs: false, stairs: false },
  S2: { rooms: false, roofs: true, stairs: true },
  S3: { rooms: true, roofs: true, stairs: true },
};

function comps(nav) {
  const n = nav.pos.length;
  const c = new Int32Array(n).fill(-1);
  let k = 0;
  const sizes = [];
  for (let s = 0; s < n; s++) {
    if (c[s] >= 0) continue;
    const q = [s]; c[s] = k;
    for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (c[nb] < 0) { c[nb] = k; q.push(nb); }
    sizes.push(q.length); k++;
  }
  return { k, sizes: sizes.sort((a, b) => b - a), edges: nav.adj.reduce((s, a) => s + a.length, 0) / 2 };
}

const cases = [];
for (const [label, file, plain] of [
  ['level-12', 'src/levels/level-12.json', true],
  ['level-13', 'src/levels/level-13.json', true],
  ['probe 1400', 'probe/open-2km.json', false],
]) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (plain) cases.push([label, map_of(raw), normalizeLevel(expandCity(structuredClone(raw))).map.ground.size]);
  else {
    raw.kind = 'open';
    raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
    const prepared = await generateCatalog(structuredClone(raw), file);
    cases.push([label, prepared.worldMap, prepared.worldMap.ground.size]);
  }
}
function map_of(raw) { return normalizeLevel(expandCity(structuredClone(raw))).map; }

for (const [label, map, plate] of cases) {
  const rows = [];
  for (const [shape, opts] of Object.entries(SHAPES)) {
    const f = new Proto(map);
    const t = Date.now();
    const nav = build(f, opts);
    const ms = Date.now() - t;
    const c = comps(nav);
    rows.push({
      shape, ms, nodes: nav.pos.length, edges: c.edges, components: c.k,
      perKm2: Math.round(nav.pos.length / (plate ** 2 / 1e6)),
      sizes: c.sizes.slice(0, 5),
    });
  }
  console.log(label + ' plate=' + plate);
  for (const r of rows) console.log('  ' + JSON.stringify(r));
}
