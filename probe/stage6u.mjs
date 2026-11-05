/** Где живут перекрёстки относительно террасы района. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
raw.ground.size = 320;
for (const d of raw.city.districts) { d.yaw = 18;
  d.polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }]; }
const level = normalizeLevel(expandCity(raw));
const field = reliefOf(level.map.relief);
console.log('pads:', level.map.relief.pads.map(p => `${p.id} [${p.minX},${p.maxX}]x[${p.minZ},${p.maxZ}] y=${p.y} blend=${p.blend} yaw=${p.yaw}`).join('\n '));
console.log('дистRICTS:', JSON.stringify(raw.city.districts.map(d => ({ id: d.id, x: d.x, z: d.z, block: d.block }))));
for (const r of level.map.roads.filter(x => /_x\d+_\d+$/.test(x.id))) {
  const d = r.decks[0];
  const hx = Math.cos(d.yaw * Math.PI / 180) * d.length / 2, hz = Math.sin(d.yaw * Math.PI / 180) * d.length / 2;
  const [x, z] = [d.cx, d.cz];
  const f = [field.heightAt(x - hx, z - hz), field.heightAt(x + hx, z + hz), field.heightAt(x - hz*0, z - 0)];
  const inside = level.map.relief.pads.filter(p => x >= p.minX && x <= p.maxX && z >= p.minZ && z <= p.maxZ).map(p => p.id);
  console.log(r.id, `(${x}, ${z})`, 'y', d.topAtMin, 'rise', d.rise, 'поле', f.map(v => v.toFixed(3)).join('/'), 'в ядре', inside.join('+') || 'НЕТ');
}
