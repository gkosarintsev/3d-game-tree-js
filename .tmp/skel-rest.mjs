// Что именно остаётся несшитым после прохода Крускала (временный файл).
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { Proto, STEP, build } from './skel-proto-lib.mjs';

const MAXGAP = Number(process.env.SK_GAP ?? 250);
const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const prepared = await generateCatalog(structuredClone(raw), 'probe/open-2km.json');
const f = new Proto(prepared.worldMap);
const nav = build(f);
const n = nav.pos.length;

// та же метка компонент, что в проходе, + сам проход (нужны остаточные группы)
const label = () => {
  const c = new Int32Array(n).fill(-1);
  let k = 0;
  for (let s = 0; s < n; s++) {
    if (c[s] >= 0) continue;
    const q = [s]; c[s] = k;
    for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (c[nb] < 0) { c[nb] = k; q.push(nb); }
    k++;
  }
  const g = [];
  for (let i = 0; i < n; i++) (g[c[i]] ??= []).push(i);
  return { c, g };
};
const first = label();
const J = CONFIG.jsonMap;
const grid = new Map();
const gk = (i, j) => i * 65536 + j;
for (let i = 0; i < n; i++) {
  const p = nav.pos[i];
  const key = gk(Math.floor(p.x / MAXGAP), Math.floor(p.z / MAXGAP));
  (grid.get(key) ?? grid.set(key, []).get(key)).push(i);
}
const cands = [];
for (let i = 0; i < n; i++) {
  const p = nav.pos[i];
  const ci = Math.floor(p.x / MAXGAP), ck = Math.floor(p.z / MAXGAP);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    for (const j of grid.get(gk(ci + di, ck + dj)) ?? []) {
      if (j <= i || first.c[j] === first.c[i]) continue;
      const q = nav.pos[j];
      if (Math.abs(q.y - p.y) > f.stepUp) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d > MAXGAP || d < 0.01) continue;
      cands.push({ a: i, b: j, d });
    }
  }
}
cands.sort((x, y) => x.d - y.d);
const uf = Int32Array.from({ length: first.g.length }, (_, i) => i);
const find = (x) => { while (uf[x] !== x) x = uf[x] = uf[uf[x]]; return x; };
const verdict = new Map();
for (const c of cands) {
  const ra = find(first.c[c.a]), rb = find(first.c[c.b]);
  if (ra === rb) continue;
  const pa = nav.pos[c.a], pb = nav.pos[c.b];
  const clear = f.bodyClearLine(pa, pb);
  const sup = clear ? f._edgeSupported(pa, pb) : false;
  const key = `${Math.min(ra, rb)}-${Math.max(ra, rb)}`;
  const v = verdict.get(key) ?? { bestAccepted: null, clearOnly: null, dy: null, supFail: 0, clearFail: 0, dyFail: 0 };
  if (clear && sup) {
    if (!v.bestAccepted) v.bestAccepted = +c.d.toFixed(1);
    uf[ra] = rb;
  } else if (clear) { if (!v.clearOnly) v.clearOnly = +c.d.toFixed(1); v.supFail++; }
  else v.clearFail++;
  verdict.set(key, v);
}
const rest = label();
console.log('остаток компонент:', rest.g.length, 'размеры', rest.g.map(v => v.length).sort((a, b) => b - a).join(','));
const boxOf = (ids) => {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const i of ids) { const p = nav.pos[i]; a = Math.min(a, p.x); b = Math.min(b, p.z); c = Math.max(c, p.x); d = Math.max(d, p.z); }
  return [Math.round(a), Math.round(b), Math.round(c), Math.round(d)];
};
// чем были остатки: id дорог рядом с узлами
const roadIdsNear = (ids, r = 40) => {
  const set = new Set();
  for (const road of f.roads) for (const d of road.decks) {
    let x, z;
    if (d.arc) { const ang = (d.a0 + d.span / 2) * Math.PI / 180; x = d.cx + Math.cos(ang) * d.R; z = d.cz + Math.sin(ang) * d.R; }
    else { x = (d.minX + d.maxX) / 2; z = (d.minZ + d.maxZ) / 2; }
    for (const i of ids) if (Math.hypot(nav.pos[i].x - x, nav.pos[i].z - z) <= r) { set.add(road.id); break; }
  }
  return [...set].slice(0, 8);
};
console.log('\nиспытания пар компонент (в порядке расстояний, ≤', MAXGAP, 'м):');
for (const [k, v] of [...verdict.entries()].sort()) {
  console.log(`  ${k}: принято с ${v.bestAccepted ?? '—'} м | только габарит свободен с ${v.clearOnly ?? '—'} м | отказ габарит ${v.clearFail} | отказ опора ${v.supFail}`);
}
console.log('\nостаточные группы:');
for (const [c, ids] of rest.g.entries()) console.log(`  #${c}: узлов ${ids.length}, план ${boxOf(ids).join('…')}, дороги ${roadIdsNear(ids).join(' ')}`);
