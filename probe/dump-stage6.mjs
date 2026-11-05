/** Бриф смоука этапа 6b: косой район + рельеф + авторский цоколь (тот же, что в тестах). */
import { writeFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { r3 } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';

const raw = structuredClone(CITY_RAW);
delete raw.kind; delete raw.relief;
raw.ground.size = 320;
raw.kind = 'json2';
raw.relief = { baseY: 0, hills: [
  { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
  { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
raw.city.districts[0].yaw = 18;
raw.city.districts[0].polygon = [
  { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
  { x: -37, z: -51 }, { x: -78, z: -34 }];
raw.buildings = [];
const terraceY = normalizeLevel(expandCity(structuredClone(raw))).map.relief.pads.find(p => p.id === 'b:терраса').y;
raw.buildings.push({
  id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4, baseY: r3(terraceY + 0.55),
  footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }], rooms: [],
});
writeFileSync('probe/city-relief-12.json', JSON.stringify(raw, null, 2), 'utf8');
console.log('терраса b', terraceY, '→ цоколь', r3(terraceY + 0.55));
