// Разбор схода cut:сход1 и окрестных торцов. Временный файл.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { SurfaceField } from '../src/surfaces.js';
import { CONFIG } from '../src/config.js';
const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const field = new SurfaceField(map); field.collectData();
const step = CONFIG.jsonMap.navStep * 4;
const f = (v) => Math.round(v * 1000) / 1000;
for (const d of field.descents) {
  const pts = field.descentChain(d, step);
  if (!pts) { console.log(d.id, d.kind, 'цепочки нет'); continue; }
  console.log(JSON.stringify({ id: d.id, kind: d.kind, seg: d.seg, axis: d.axis, plan: [f(d.v0 ?? NaN), f(d.v1 ?? NaN)] }));
  console.log('   ', pts.map(p => `(${f(p.x)},${f(p.y)},${f(p.z)})`).join(' '));
}
console.log('\nторцы дорог в радиусе 150 от (-300,135):');
for (const r of field.roads) {
  if (r.type !== 'ground') continue;
  const chains = (r.decks ?? []).flatMap(d => field.deckChain(d, step));
  for (const p of [chains[0], chains[chains.length - 1]]) {
    if (!p) continue;
    const d = Math.hypot(p.x + 300, p.z - 135);
    if (d <= 150) console.log(`   ${r.id} d=${f(d)} (${f(p.x)},${f(p.y)},${f(p.z)})`);
  }
}
