import { expandCity } from '../tools/city.js';
import { CITY_RAW } from './city-fixture.mjs';

for (const withPoly of [false, true]) {
  const raw = structuredClone(CITY_RAW);
  raw.kind = 'json2';
  raw.city.districts[0].yaw = 18;
  if (withPoly) raw.city.districts[0].polygon = [
    { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
    { x: -37, z: -51 }, { x: -78, z: -34 }];
  const level = expandCity(raw);
  console.log('polygon =', withPoly);
  for (const r of level.roads) {
    if (!r.id.startsWith('a_')) continue;
    const p = r.elements.map(e => e.plate);
    console.log('  ', r.id, r.crossing ? 'CROSS' : '     ',
      p.map(q => `[${q.x},${q.z} L${q.length}]`).join(' '));
  }
}
