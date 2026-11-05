/** Перекрёстки фикстуры: координаты, ядро террасы, перепад поля. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { r3, frameAt, unrotatePoint } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const skewRaw = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.ground.size = 320;
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw; };
const terraceY = normalizeLevel(expandCity(skewRaw())).map.relief.pads.find(p => p.id === 'b:терраса').y;
const raw = skewRaw();
raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4, baseY: r3(terraceY + 0.55),
  footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }], rooms: [] });
const expanded = expandCity(raw);
const level = normalizeLevel(expandCity(raw));
const field = reliefOf(level.map.relief);
console.log('pads', level.map.relief.pads.map(p => `${p.id} y=${p.y} [${p.minX}..${p.maxX}]x[${p.minZ}..${p.maxZ}] blend=${p.blend} yaw=${p.yaw}`).join('\n     '));
const cr = expanded.roads.filter(r => r.crossing);
for (const r of cr) {
  const p = r.elements[0].plate;
  const rad = (p.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
  const hl = p.length / 2, hw = p.width / 2;
  const pts = [[hl, 0], [-hl, 0], [0, hw], [0, -hw], [hl, hw], [-hl, -hw], [hl, -hw], [-hl, hw]]
    .map(([u, v]) => ({ x: p.x + u * c - v * s, z: p.z + u * s + v * c }));
  const f = pts.map(q => field.heightAt(q.x, q.z));
  const inPad = level.map.relief.pads.filter(pd => {
    const q = pd.frame ? unrotatePoint(pd.frame, p.x, p.z) : { x: p.x, z: p.z };
    return q.x >= pd.minX && q.x <= pd.maxX && q.z >= pd.minZ && q.z <= pd.maxZ;
  }).map(pd => pd.id);
  console.log(r.id, `(${p.x}, ${p.z})`, 'y', p.y, 'rise', p.rise, 'поле', Math.min(...f).toFixed(3), '…', Math.max(...f).toFixed(3),
    'разброс', (Math.max(...f) - Math.min(...f)).toFixed(3), 'ядро', inPad.join('+') || 'НЕТ');
}
