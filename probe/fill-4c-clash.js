// Замер 4c: что стоит под съездом (план тела насыпи), и где русло относительно
// пластин развязки.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(readFileSync(new URL('../src/levels/level-11.json', import.meta.url), 'utf8'));
const L = normalizeLevel(raw.city ? expandCity(raw) : raw);
const holes = (L.map.channels ?? []).flatMap(c => c.holes ?? []);
console.log('дыр грунта:', holes.length, JSON.stringify(holes.map(h => [h.minX, h.maxX, h.minZ, h.maxZ])));

// план тела насыпи под съездом: world x от −84 до (toe), z 58..66
const fillRect = { minX: -84, maxX: -45.6, minZ: 58, maxZ: 66 };
const hit = (a, b) => a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ;
for (const b of L.map.buildings) {
  const r = { minX: b.bounds.minX, maxX: b.bounds.maxX, minZ: b.bounds.minZ, maxZ: b.bounds.maxZ };
  if (hit(r, fillRect)) console.log('дом в габарите насыпи:', b.id, JSON.stringify(r), 'rotation', b.rotation ?? 0);
}
for (const p of L.map.props) {
  const { x, z } = p.position;
  if (x > fillRect.minX - 1 && x < fillRect.maxX + 1 && z > 57 && z < 67) {
    console.log('объект под съездом:', p.id, p.model, x, z);
  }
}
for (const r of L.map.roads) {
  for (const d of r.decks) {
    if (hit({ minX: d.minX, maxX: d.maxX, minZ: d.minZ, maxZ: d.maxZ }, fillRect)) {
      console.log('дорога под съездом/в габарите:', r.id, r.type, JSON.stringify([d.minX, d.maxX, d.minZ, d.maxZ]));
    }
  }
}
