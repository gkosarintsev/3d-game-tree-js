// Мера (временный файл): Чем являются компоненты скелета probe-фикстуры —
// разрез по данным (кольцо не трогает кварталы) или покрытие (мои цепочки не
// сцепились). Узлы помечены ключами NavGraph: `d:<road>:…`, `e:<door>:…`,
// `f:<bank>:…`.
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { Proto, build } from './skel-proto-lib.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const prepared = await generateCatalog(structuredClone(raw), 'probe/open-2km.json');
const map = prepared.worldMap;
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
/** Район из id: `q3_…` / `ring_…` / `<id>_<лот>`. */
const distOf = (key) => {
  const m = /^(?:d|e|f):([a-z0-9]+?)_/.exec(key);
  return m ? m[1] : key.split(':')[1]?.slice(0, 12) ?? '?';
};
const keyOf = new Map();
for (const [k, i] of nav.byKey) if (!keyOf.has(i)) keyOf.set(i, k);
const rows = groups.map((q, gi) => {
  const d = new Map();
  for (const i of q) {
    const dd = distOf(String(keyOf.get(i) ?? '?'));
    d.set(dd, (d.get(dd) ?? 0) + 1);
  }
  const xs = q.map(i => nav.pos[i].x), zs = q.map(i => nav.pos[i].z);
  return {
    gi, size: q.length,
    bbox: [Math.min(...xs).toFixed(0), Math.max(...xs).toFixed(0), Math.min(...zs).toFixed(0), Math.max(...zs).toFixed(0)],
    top: [...d.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4),
  };
}).sort((a, b) => b.size - a.size);
console.log(JSON.stringify({ nodes: n, components: groups.length }, null, 1));
for (const r of rows.slice(0, 14)) console.log(JSON.stringify(r));
