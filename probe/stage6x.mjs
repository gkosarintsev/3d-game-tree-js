/** Почему пластина улицы стоит за габаритом террасы: смотрим на сырой прогон. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
raw.ground.size = 320;
const expanded = expandCity(raw);
for (const r of expanded.roads.filter(r => r.district === 'b')) {
  for (const el of r.elements) {
    const p = el.plate;
    if (p.z - Math.cos(p.yaw * Math.PI / 180) * p.length / 2 < 21 || p.z + Math.sin(p.length * 0) > 1e9) {
      console.log(r.id, 'crossing' in r ? 'X' : ' ', JSON.stringify(p));
    }
  }
}
console.log('площадки лотов b (первые 3):');
const lvl = normalizeLevel(expanded);
console.log(lvl.map.relief.pads.map(p => `${p.id} [${p.minX}..${p.maxX}]x[${p.minZ}..${p.maxZ}] y=${p.y} blend=${p.blend} yaw=${p.yaw}`).join('\n'));
