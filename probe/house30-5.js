// Замеры §5: где свободное место вокруг house_yaw30 и как далеко до улицы.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { obbOf, frameOf } from '../src/geo2d.js';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-11.json', import.meta.url), 'utf8'));
const L = normalizeLevel(expandCity(raw));
for (const b of L.map.buildings) {
  const w = obbOf(b.bounds, frameOf(b.bounds, b.rotation ?? 0));
  console.log(b.id.padEnd(20), 'rot', String(b.rotation ?? 0).padEnd(6), b.isEnterable ? 'ENTER' : '     ',
    `x ${w.minX.toFixed(1)}..${w.maxX.toFixed(1)}`, `z ${w.minZ.toFixed(1)}..${w.maxZ.toFixed(1)}`, 'fl', b.floorsCount);
}
console.log('--- roads ---');
for (const r of L.map.roads) {
  const kinds = r.decks.map(d => (d.arc ? 'arc' : (d.ramp ? 'ramp' : 'flat'))).join(',');
  const ext = r.decks.map(d => `[x ${d.minX.toFixed(1)}..${d.maxX.toFixed(1)} z ${d.minZ.toFixed(1)}..${d.maxZ.toFixed(1)}]`).join(' ');
  console.log(r.id.padEnd(18), r.type.padEnd(11), kinds.padEnd(14), ext);
}
console.log('--- corners house_yaw30 ---');
const h = L.map.buildings.find(b => b.id === 'house_yaw30');
const c = { x: (h.bounds.minX + h.bounds.maxX) / 2, z: (h.bounds.minZ + h.bounds.maxZ) / 2 };
const a = (h.rotation ?? 0) * Math.PI / 180;
for (const p of h.footprint) {
  const dx = p.x - c.x, dz = p.z - c.z;
  console.log(`local (${p.x}, ${p.z}) -> world (${(c.x + dx * Math.cos(a) - dz * Math.sin(a)).toFixed(2)}, ${(c.z + dx * Math.sin(a) + dz * Math.cos(a)).toFixed(2)})`);
}
console.log('центр', c, 'bounds', h.bounds);
