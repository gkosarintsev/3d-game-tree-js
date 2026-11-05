import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel } from '../tools/level-schema.mjs';

const CITY_RAW = {
  metadata: { levelName: 'cityGen', name: 'Кварталы', hint: '—', units: 'meters' },
  kind: 'json2',
  ground: { y: 0, size: 320 },
  city: {
    seed: 70707,
    districts: [
      { id: 'a', block: { minX: -140, maxX: -20, minZ: -140, maxZ: -20 }, style: 'corporate',
        street: { pitch: 40, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.4 },
        height: { minFloors: 2, maxFloors: 8, floorHeight: 3.4 }, enterableEvery: 5, yaw: 18 },
      { id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
        street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
        height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
        roofs: { walkable: true, access: 0.5, parapet: 0.9 } },
    ],
  },
  roads: [], buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
    enemies: { count: 2 }, alienEnemies: { count: 1 } },
};
const stats = {};
const expanded = expandCity(structuredClone(CITY_RAW), stats);
console.log('stats', JSON.stringify(stats));
const va = expanded.roads.filter(r => r.id.startsWith('a_'));
console.log('a roads', va.length, JSON.stringify(va[0]));
const flat = expanded.roads.filter(r => r.id.startsWith('b_'));
console.log('b roads', JSON.stringify(flat[0]).slice(0, 200));
const ba = expanded.buildings.filter(b => b.id.startsWith('a_'));
console.log('a buildings', ba.length, JSON.stringify(ba[0].footprint), ba[0].rotation, JSON.stringify(ba[0].districtFrame));
const v = validateLevel(expanded);
console.log('errors', v.errors.length, v.errors.slice(0, 6));
console.log('warnings', v.warnings.length, v.warnings.slice(0, 6));
