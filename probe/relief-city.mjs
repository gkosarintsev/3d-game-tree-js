/**
 * Террасы районов генератора: один пэд на район, общая отметка полов всех лотов,
 * предупреждений нет. usage: node probe/relief-city.mjs
 */
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';

const CITY = {
  kind: 'json2',
  metadata: { levelName: 'cityGen', name: 'Кварталы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  relief: {
    baseY: 0,
    hills: [
      { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
      { id: 'lon', x: 90, z: 90, radius: 400, height: -2 },
    ],
  },
  city: {
    seed: 70707,
    districts: [
      {
        id: 'a', block: { minX: -140, maxX: -20, minZ: -140, maxZ: -20 }, style: 'corporate',
        street: { pitch: 40, width: 12 }, lot: { pitch: 10, inset: 1.5, merge: 0.4 },
        height: { minFloors: 2, maxFloors: 8, floorHeight: 3.4 }, enterableEvery: 5,
      },
      {
        id: 'b', block: { minX: 20, maxX: 140, minZ: 20, maxZ: 140 }, style: 'kitsch',
        street: { pitch: 34, width: 12 }, lot: { pitch: 9, inset: 1.5, merge: 0.45 },
        height: { minFloors: 2, maxFloors: 6, floorHeight: 3.2 }, enterableEvery: 6,
        roofs: { walkable: true, access: 0.5, parapet: 0.9 },
      },
    ],
  },
  roads: [], buildings: [], landscapeObjects: [], lights: [],
  gameplay: { goal: 'exit', spawn: { x: -100, z: -100 }, exit: { x: 100, z: 100 }, exitRadius: 4,
    enemies: { count: 2 }, alienEnemies: { count: 1 } },
};

const t0 = Date.now();
const expanded = expandCity(structuredClone(CITY));
const { errors } = validateLevel(expanded, LEVEL_SPEC_V2);
const level = normalizeLevel(expanded);
const ms = Date.now() - t0;
console.log(`домов ${level.map.buildings.length}, площадок ${level.map.relief.pads.length}, ошибок ${errors.length}, ${ms} мс`);
console.log('ошибки:', errors.slice(0, 3));
const byHead = {};
for (const w of level.warnings) byHead[w.slice(0, 52)] = (byHead[w.slice(0, 52)] || 0) + 1;
console.log(`предупреждений ${level.warnings.length}:`, Object.entries(byHead).slice(0, 10));
for (const p of level.map.relief.pads) {
  console.log(`пэд ${p.id}: [${p.minX}…${p.maxX} × ${p.minZ}…${p.maxZ}] y=${p.y} blend=${p.blend}`);
}
for (const d of ['a', 'b']) {
  const ys = [...new Set(level.map.buildings.filter(b => b.id.startsWith(`${d}_`)).map(b => b.baseY))];
  console.log(`район ${d}: отметок полов ${ys.length} → ${ys.slice(0, 4)}`);
}
console.log('служебное поле в модуле:', level.map.buildings.some(b => b.district !== undefined));
const f = reliefOf(structuredClone(level.map.relief));
let max = 0; let at = null;
for (let x = -148; x <= 148; x += 4) for (let z = -148; z <= 148; z += 4) {
  const m = f.slopeAt(x, z).mag;
  if (m > max) { max = m; at = [x, z]; }
}
console.log(`макс уклон поля ${max.toFixed(4)} в ${at} (${(max / level.map.relief.maxSlope).toFixed(2)} предела)`);
