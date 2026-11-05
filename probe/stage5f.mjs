import { expandCity } from '../tools/city.js';
import { CITY_RAW } from './city-fixture.mjs';
const POLY = [{x:-126,z:-78},{x:-82,z:-129},{x:-31,z:-123},{x:-37,z:-51},{x:-78,z:-34}];
for (const withPoly of [false, true]) {
  const raw = structuredClone(CITY_RAW);
  if (withPoly) raw.city.districts[0].polygon = POLY;
  const stats = {};
  const e = expandCity(raw, stats);
  console.log(withPoly ? 'С полигоном' : 'Без полигона',
    'roads', e.roads.length, 'a_roads', e.roads.filter(r=>r.id.startsWith('a_')).length,
    'buildings', e.buildings.length, 'a', e.buildings.filter(b=>b.id.startsWith('a_')).length,
    JSON.stringify(stats));
}
