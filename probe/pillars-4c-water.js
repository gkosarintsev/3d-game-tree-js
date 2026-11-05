// Замеры 4c: лежат ли кандидаты в опоры съезда в руслах (дно/стенки/сходы).
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-11.json', import.meta.url), 'utf8'));
const L = normalizeLevel(expandCity(raw));
console.log('map keys:', Object.keys(L.map).join(' '));
console.log('roads[0] waterways field:', JSON.stringify(Object.keys(L.map.roads[0])));
const cands = [[-62, 59.2], [-62, 64.8], [-74, 59.2], [-74, 64.8]];
for (const c of (L.map.waterways ?? L.map.channels ?? [])) {
  console.log(c.id, 'bedY', c.bedY, 'wade', c.wade);
  for (const s of c.segments) console.log('  seg', s.axis, 'cross', s.cross, 'halfW', s.halfW, s.lo, '…', s.hi, JSON.stringify(s.bed));
  for (const w of c.walls ?? []) console.log('  wall', JSON.stringify(w.rect));
  for (const d of c.descents ?? []) console.log('  descent', d.kind, JSON.stringify(d.plan ?? d));
}
console.log('\nкандидаты в план дна:');
for (const [x, z] of cands) {
  const hits = (L.map.waterways ?? []).flatMap(c => (c.segments ?? []).map(s => [c.id, s.bed]))
    .filter(([, b]) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);
  console.log(x, z, hits.length ? 'В РУСЛЕ ' + hits.map(h => h[0]).join(',') : 'чисто');
}
