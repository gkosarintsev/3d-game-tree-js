/** Фикстура с цоколем против валидатора v2. */
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const base = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  raw.ground.size = 320;
  return raw; };
const terraceY = normalizeLevel(expandCity(base())).map.relief.pads.find(p => p.id === 'b:терраса').y;
for (const lift of [0.55, 0.5, 0.6]) {
  const raw = base();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: r3(terraceY + lift),
    footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }], rooms: [] });
  const expanded = expandCity(raw);
  const v = validateLevel(expanded, LEVEL_SPEC_V2);
  console.log(lift, 'ошибок', v.errors.length, v.errors.slice(0, 6).join(' | '), 'предупр', v.warnings.length, v.warnings.slice(0,3).join(' | '));
}
