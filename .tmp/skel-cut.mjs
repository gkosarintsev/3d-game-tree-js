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
f._coarse(nav, STEP2);
const n = nav.pos.length;
const comp = new Int32Array(n).fill(-1);
const groups = [];
for (let s = 0; s < n; s++) {
  if (comp[s] >= 0) continue;
  const q = [s]; comp[s] = groups.length;
  for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = groups.length; q.push(nb); }
  groups.push(q);
}
console.log(JSON.stringify({ nodes: n, components: groups.length, sizes: groups.map(g => g.length).sort((a, b) => b - a).slice(0, 8) }));
groups.sort((a, b) => b.length - a.length);
const A = groups[0], B = groups[1];
// Ближайшая пара двух крупнейших грунтовых компонент и что между ними.
// грубый перебор: сетка по 24 м между двумя множествами
const cellOf = (x, z) => Math.floor(x / 24) + ',' + Math.floor(z / 24);
const mapA = new Map();
for (const i of A) { const p = nav.pos[i]; const k = cellOf(p.x, p.z); if (!mapA.has(k)) mapA.set(k, []); mapA.get(k).push(i); }
let pair = null, dmin = Infinity;
for (const i of B) {
  const p = nav.pos[i];
  const gi = Math.floor(p.x / 24), gj = Math.floor(p.z / 24);
  for (let di = -6; di <= 6; di++) for (let dj = -6; dj <= 6; dj++) {
    for (const j of mapA.get((gi + di) + ',' + (gj + dj)) || []) {
      const q = nav.pos[j];
      const d = Math.hypot(p.x - q.x, p.z - q.z);
      if (d < dmin) { dmin = d; pair = [i, j]; }
    }
  }
}
const [bi, aj] = pair;
const p = nav.pos[bi], q = nav.pos[aj];
console.log(JSON.stringify({
  A: A.length, B: B.length, gap: +dmin.toFixed(2),
  a: [+q.x.toFixed(1), +q.y.toFixed(2), +q.z.toFixed(1)],
  b: [+p.x.toFixed(1), +p.y.toFixed(2), +p.z.toFixed(1)],
  dy: +(p.y - q.y).toFixed(2),
  clear: f.bodyClearLine(q, p),
  support: f._edgeSupported(q, p),
  inBuildingA: f._inBuilding(q.x, q.z), inBuildingB: f._inBuilding(p.x, p.z),
  midBlocked: (() => { const m = { x: (p.x + q.x) / 2, z: (p.z + q.z) / 2 };
    const fromY = f.relief ? f.relief.heightAt(m.x, m.z) : f.groundY;
    const y = f.groundHeightAt(m.x, m.z, fromY);
    return { y: +y.toFixed(2), blocked: f.isBlocked(m.x, m.z, CONFIG.radius, y, CONFIG.eyeHeight), inBuilding: f._inBuilding(m.x, m.z) }; })(),
  waterways: (f.waterways || []).length,
  holes: (f.holes || []).length,
}, null, 1));
// Где разрез: projects both components' bounding boxes.
const bb = (g) => { const xs = g.map(i => nav.pos[i].x), zs = g.map(i => nav.pos[i].z);
  return [+Math.min(...xs).toFixed(0), +Math.max(...xs).toFixed(0), +Math.min(...zs).toFixed(0), +Math.max(...zs).toFixed(0)]; };
console.log(JSON.stringify({ bbA: bb(A), bbB: bb(B) }));
