// Мера «грубой решётки проходимости» (этап 2): связна ли плита, если мерить
// проходимость шагом скелета, а не шагом решётки чанка. Временный файл.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { NavGraph } from '../src/nav-graph.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { Proto, prepare } from './skel-proto-lib.mjs';

const STEP2 = Number(process.env.SK_LATTICE ?? 24);
const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const prepared = await generateCatalog(structuredClone(raw), 'probe/open-2km.json');
const f = prepare(new Proto(prepared.worldMap));
const J = CONFIG.jsonMap;

// `_navLattice` из src/json-map.js дословно, только шаг — параметр
f._coarse = function (nav, step) {
  const n = Math.floor(this.width / step);
  const lat = [];
  let t = Date.now();
  for (let j = 0; j <= n; j++) {
    const row = new Array(n + 1);
    const z = -this.half + j * step;
    for (let i = 0; i <= n; i++) {
      const x = -this.half + i * step;
      if (this._inBuilding(x, z)) continue;
      const fromY = this.relief ? this.relief.heightAt(x, z) : this.groundY;
      const y = this.groundHeightAt(x, z, fromY);
      if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
      row[i] = nav.add(x, y, z, `w:${i}:${j}`);
    }
    lat.push(row);
  }
  const tAdd = Date.now() - t;
  t = Date.now();
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) {
      const id = lat[j][i];
      if (id === undefined) continue;
      if (i > 0 && lat[j][i - 1] !== undefined) this._skelBridge(nav, id, lat[j][i - 1], `x${i}:${j}`);
      if (j > 0 && lat[j - 1][i] !== undefined) this._skelBridge(nav, id, lat[j - 1][i], `z${i}:${j}`);
    }
  }
  return { tAdd, tLink: Date.now() - t, cells: (n + 1) * (n + 1) };
};

const nav = new NavGraph();
const timing = f._coarse(nav, STEP2);
const n = nav.pos.length;
const comp = new Int32Array(n).fill(-1);
let k = 0;
const sizes = [];
for (let s = 0; s < n; s++) {
  if (comp[s] >= 0) continue;
  const q = [s]; comp[s] = k; let size = 0;
  for (let h = 0; h < q.length; h++) { size++; for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = k; q.push(nb); } }
  sizes.push(size); k++;
}
sizes.sort((a, b) => b - a);
const edges = nav.adj.reduce((s, a) => s + a.length, 0) / 2;
console.log(JSON.stringify({
  plate: prepared.worldMap.ground.size, step: STEP2, cells: timing.cells,
  ms: timing, nodes: n, edges, components: k, sizes: sizes.slice(0, 10),
  densityPerKm2: Math.round(n / (prepared.worldMap.ground.size ** 2 / 1e6)),
}, null, 1));

// то же на Shipping-главах — сопоставимость меры
for (const file of ['src/levels/level-12.json', 'src/levels/level-13.json']) {
  const r2 = JSON.parse(readFileSync(file, 'utf8'));
  const { normalizeLevel } = await import('../tools/normalize-level.mjs');
  const { expandCity } = await import('../tools/city.js');
  const map2 = normalizeLevel(expandCity(structuredClone(r2))).map;
  const f2 = prepare(new Proto(map2));
  const nav2 = new NavGraph();
  const t2 = Date.now();
  const tm = f2._coarse(nav2, STEP2);
  const n2 = nav2.pos.length;
  const c2 = new Int32Array(n2).fill(-1);
  let k2 = 0;
  const sz = [];
  for (let s = 0; s < n2; s++) {
    if (c2[s] >= 0) continue;
    const q = [s]; c2[s] = k2; let size = 0;
    for (let h = 0; h < q.length; h++) { size++; for (const nb of nav2.adj[q[h]]) if (c2[nb] < 0) { c2[nb] = k2; q.push(nb); } }
    sz.push(size); k2++;
  }
  sz.sort((a, b) => b - a);
  console.log(JSON.stringify({ file, plate: map2.ground.size, step: STEP2, ms: tm + (Date.now() - t2) - tm.tLink - tm.tAdd, ...tm, nodes: n2, components: k2, sizes: sz.slice(0, 6) }));
}
