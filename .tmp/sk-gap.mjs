// Дыры между сетками районов: есть ли там что-нибудь, кроме грунта?
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const decks = [];
for (const r of map.roads) for (const [di, d] of r.decks.entries()) decks.push({ id: `${r.id}:${di}`, r, d });

// полосы между габаритами районов: сколько настилов попадает между соседними районами
const boxes = new Map();
for (const d of decks) {
  const b = d.d.arc ? { minX: d.d.cx - d.d.R, maxX: d.d.cx + d.d.R, minZ: d.d.cz - d.d.R, maxZ: d.d.cz + d.d.R } : d.d;
  const head = d.r.id.split('_')[0];
  let s = boxes.get(head);
  if (!s) boxes.set(head, s = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, n: 0 });
  s.minX = Math.min(s.minX, b.minX); s.maxX = Math.max(s.maxX, b.maxX);
  s.minZ = Math.min(s.minZ, b.minZ); s.maxZ = Math.max(s.maxZ, b.maxZ); s.n++;
}
console.log('габариты сетей настилов по районам:');
for (const [k, v] of [...boxes.entries()].sort()) {
  console.log(`  ${k}: [${Math.round(v.minX)}…${Math.round(v.maxX)}] × [${Math.round(v.minZ)}…${Math.round(v.maxZ)}], настилов ${v.n}`);
}
// сколько настилов лежит вне всех районов (то есть в междурядье)
const inBox = (b, v, m = 1) => b.minX > v.minX - m && b.maxX < v.maxX + m && b.minZ > v.minZ - m && b.maxZ < v.maxZ + m;
const outside = decks.filter(d => {
  const b = d.d.arc ? { minX: d.d.cx - d.d.R, maxX: d.d.cx + d.d.R, minZ: d.d.cz - d.d.R, maxZ: d.d.cz + d.d.R } : d.d;
  return ![...boxes.values()].some(v => inBox(b, v));
});
console.log('настилов вне габаритов районов:', outside.length, outside.slice(0, 12).map(d => `${d.id}(${d.r.type})`).join(' '));
console.log('distrits в брифе:', (raw.city?.districts ?? []).length, (raw.city?.districts ?? []).map(d => `${d.id}@${Math.round(d.x ?? 0)},${Math.round(d.z ?? 0)} ${d.yaw ?? 0}`).join(' '));
console.log('bridge-дороги:', map.roads.filter(r => r.type !== 'ground').map(r => `${r.id} (${r.decks.length} эл.)`).join(', '));
