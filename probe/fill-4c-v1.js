// Замер 4c для в1: пересекают ли наклонные пролёты глав 9 и 10 русло, и какова
// пустота под ними там, где грунт есть.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const inRect = (r, x, z) => x >= r.minX - 1e-6 && x <= r.maxX + 1e-6 && z >= r.minZ - 1e-6 && z <= r.maxZ + 1e-6;

for (const n of ['09', '10']) {
  const raw = JSON.parse(readFileSync(new URL(`../src/levels/level-${n}.json`, import.meta.url), 'utf8'));
  const L = normalizeLevel(raw.city ? expandCity(raw) : raw);
  const holes = (L.map.channels ?? []).flatMap(c => c.holes ?? []);
  const groundY = L.map.ground?.y ?? 0;
  console.log(`--- глава ${n}: грунтовых дыр (русло) ${holes.length}`);
  for (const r of L.map.roads) {
    for (const [i, d] of r.decks.entries()) {
      if (!d.ramp || d.arc) continue;
      const corners = [[d.minX, d.minZ], [d.maxX, d.minZ], [d.minX, d.maxZ], [d.maxX, d.maxZ]];
      const overWater = corners.some(([x, z]) => holes.some(h => inRect(h, x, z)));
      const high = Math.max(d.topAtMin, d.topAtMax) - 0.6;
      const low = Math.min(d.topAtMin, d.topAtMax) - 0.6;
      console.log(`${r.id}#${i} тип ${r.type}: низ ${low.toFixed(2)}..${high.toFixed(2)} над грунтом ${groundY}, план ${overWater ? 'НАД руслом' : 'на грунте'}, fill ${r.fill.length}, pillars ${r.pillars.length}`);
    }
  }
}
