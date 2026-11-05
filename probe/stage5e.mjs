import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { frameAt, unrotatePoint } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';

const level = normalizeLevel(expandCity(structuredClone(CITY_RAW)));
const lamps = level.map.props.filter(p => p.source === 'road_lamp');
console.log('lamps total', lamps.length, lamps.slice(0,3).map(l=>[l.id,l.position.y]).join(' | '));
const plates = level.map.roads.flatMap(r => r.decks).filter(d => d.yaw);
console.log('skewed decks', plates.length);
const f0 = plates[0];
for (const l of lamps.slice(0, 8)) {
  const near = plates.map(d => {
    const f = frameAt(d.cx, d.cz, d.yaw);
    const p = unrotatePoint(f, l.position.x, l.position.z);
    return { id: d.id ?? '', dx: Math.abs(Math.abs(p.x) - d.length/2), dz: Math.abs(Math.abs(p.z) - d.width/2), p, y: d.topY };
  }).sort((a,b) => (a.dx+a.dz) - (b.dx+b.dz))[0];
  console.log(l.id, l.position, 'u=', near.p.x.toFixed(1), 'v=', near.p.z.toFixed(1), 'y', l.position.y, 'deck top', near.y);
}
