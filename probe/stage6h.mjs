import { expandCity } from '../tools/city.js';
import { reliefOf } from '../src/relief.js';
import { CITY_RAW } from './city-fixture.mjs';

const raw = structuredClone(CITY_RAW);
raw.kind = 'json2';
raw.relief = { baseY: 0, hills: [
  { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
  { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
raw.city.districts[0].yaw = 18;
raw.city.districts[0].polygon = [
  { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
  { x: -37, z: -51 }, { x: -78, z: -34 }];
const level = expandCity(raw);
for (const r of level.roads) {
  if (!['a_s_h2', 'a_s_v2_1', 'a_s_v1_1', 'a_s_h1'].includes(r.id)) continue;
  console.log(r.id, 'crossing=', !!r.crossing, 'grade=', r.grade, 'district=', r.district);
  for (const el of r.elements) {
    const p = el.plate;
    console.log('   ', JSON.stringify({ x: p.x, z: p.z, length: p.length, width: p.width, yaw: p.yaw, y: p.y, rise: p.rise }));
  }
}
