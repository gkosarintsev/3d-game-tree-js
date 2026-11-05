import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { frameAt, rotatePoint, unrotatePoint, pointInPoly, obbOf, obbHitsObb, polyBounds } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';

const raw = structuredClone(CITY_RAW);
const blk = raw.city.districts[0].block;
const poly = [
  { x: blk.minX + 14, z: blk.minZ + 62 }, { x: blk.minX + 58, z: blk.minZ + 11 },
  { x: blk.maxX - 11, z: blk.minZ + 17 }, { x: blk.maxX - 17, z: blk.maxZ - 71 },
  { x: blk.minX + 62, z: blk.maxZ - 14 },
];
raw.city.districts[0].polygon = poly;
console.log('poly bounds', JSON.stringify(polyBounds(poly)), 'block', JSON.stringify(blk));
const stats = {};
const expanded = expandCity(raw, stats);
console.log('stats', JSON.stringify(stats));
const v = validateLevel(expanded, LEVEL_SPEC_V2);
console.log('v2 errors', v.errors.length, v.errors.slice(0, 5), 'warnings', v.warnings.length, v.warnings.slice(0,3));
const level = normalizeLevel(expanded);
console.log('norm warnings', level.warnings.length, level.warnings.slice(0, 5));
const f = frameAt(-80, -80, 18);
const recs = expanded.buildings.filter(b => b.id.startsWith('a_'));
let outside = 0;
for (const b of recs) {
  const cx = (Math.min(...b.footprint.map(p=>p.x)) + Math.max(...b.footprint.map(p=>p.x))) / 2;
  const cz = (Math.min(...b.footprint.map(p=>p.z)) + Math.max(...b.footprint.map(p=>p.z))) / 2;
  const l = unrotatePoint(f, cx, cz);  // footprint уже мировой; развернём к локальным осям района? нет: τ-сдвиг
  if (!pointInPoly(poly, l.x, l.z)) { outside++; console.log('вне', b.id, JSON.stringify(l)); }
}
console.log('за полигоном', outside, 'из', recs.length);
const stem = id => id.split('_').slice(0, 2).join('_');
const obb = b => {
  const r = { minX: Math.min(...b.footprint.map(p=>p.x)), maxX: Math.max(...b.footprint.map(p=>p.x)),
    minZ: Math.min(...b.footprint.map(p=>p.z)), maxZ: Math.max(...b.footprint.map(p=>p.z)) };
  return obbOf(r, frameAt((r.minX+r.maxX)/2, (r.minZ+r.maxZ)/2, b.rotation ?? 0));
};
let hits = [];
for (let i=0;i<recs.length;i++) for (let k=i+1;k<recs.length;k++) {
  if (stem(recs[i].id) === stem(recs[k].id)) continue;
  if (obbHitsObb(obb(recs[i]), obb(recs[k]), 0.05)) hits.push([recs[i].id, recs[k].id, recs[i].rotation, recs[k].rotation].join(' '));
}
console.log('пересечений между лотами', hits.length, hits.slice(0,5));
const brecs = expanded.buildings.filter(b => b.id.startsWith('b_'));
console.log('b (осевой) домов', brecs.length, 'с districtFrame', brecs.filter(b=>b.districtFrame).length);
