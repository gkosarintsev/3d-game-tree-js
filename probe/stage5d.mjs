import { expandCity } from '../tools/city.js';
import { generateModule } from '../tools/build-level.mjs';
import { frameAt, unrotatePoint, rotatePoint } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const level = normalizeLevel(expandCity(structuredClone(CITY_RAW)));
const plates = level.map.roads.filter(r => r.id.startsWith('a_')).flatMap(r => r.decks);
console.log('decks a', plates.length, JSON.stringify(plates[0]));
const lamps = level.map.props.filter(p => p.source === 'lamp' || /lamp/.test(p.source ?? ''));
console.log('sources', [...new Set(level.map.props.map(p => p.source))].join(','));
const aLamps = lamps.filter(l => l.id.startsWith('a_'));
console.log('lamps a', aLamps.length);
for (const l of aLamps.slice(0, 4)) {
  let best = null;
  for (const d of plates) {
    const f = frameAt(d.x ?? (d.minX+d.maxX)/2, d.cz ?? (d.minZ+d.maxZ)/2, d.yaw ?? 0);
    const p = unrotatePoint(f, l.position.x, l.position.z);
    const dist = Math.max(Math.abs(p.x - 0), Math.abs(p.z - 0), 0);
    best = { u: p.x, v: p.z, w: d.width / 2, half: d.length / 2 };
  }
  console.log(l.id, JSON.stringify(l.position), JSON.stringify(best));
}
const code = generateModule(structuredClone(CITY_RAW), 'src/levels/level-12.json').code;
console.log('module bytes', code.length, 'warnings?', code.includes('Предупреждения парсера'), 'districtFrame?', code.includes('districtFrame'));
