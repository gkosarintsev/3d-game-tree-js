// Замеры 4c: пересекает ли план съезда русло, и где именно низ пластины выше нуля.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-11.json', import.meta.url), 'utf8'));
const L = normalizeLevel(expandCity(raw));
const ch = L.map.waterways ?? [];
for (const c of ch) {
  console.log(c.id, 'bedY', c.bedY, 'surface', c.surfaceY, 'segs:', JSON.stringify(c.segments.map(s => ({
    axis: s.axis, cross: s.cross, halfW: s.halfW, lo: s.lo, hi: s.hi,
  }))));
}
const road = L.map.roads.find(r => r.id === 'rd_interchange');
for (const [i, d] of road.decks.entries()) {
  if (d.arc) { console.log(i, 'arc cx', d.cx, 'cz', d.cz, 'R', d.R, 'halfW', d.halfW, 'a0', d.a0, 'span', d.span); continue; }
  console.log(i, 'plate', JSON.stringify({ cx: d.cx, cz: d.cz, yaw: d.yaw, length: d.length, width: d.width,
    world: [d.minX, d.maxX, d.minZ, d.maxZ], top: [d.topAtMin, d.topAtMax], grounded: !!d.grounded, ramp: d.ramp }));
}
console.log('pillars под съездом:', road.pillars.filter(p => p.position.x < -40 && p.position.z > 50).length);
