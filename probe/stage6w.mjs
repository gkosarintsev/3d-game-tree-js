/** Перебор позиции/подъёма цоколя: наклон улиц БЕЗ предупреждений и без цоколя в перекрёстке. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { r3 } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const skewRaw = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.ground.size = 320;
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw; };
const terraceY = normalizeLevel(expandCity(skewRaw())).map.relief.pads.find(p => p.id === 'b:терраса').y;
function ends(d) { const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), h = d.length / 2;
  const cx = d.cx ?? (d.minX + d.maxX) / 2, cz = d.cz ?? (d.minZ + d.maxZ) / 2;
  return [{ x: cx - c * h, z: cz - s * h }, { x: cx + c * h, z: cz + s * h }]; }
function joints(decks) { let n = 0, w = 0;
  const at = (d, x, z) => { const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), h = d.length / 2;
    const cx = d.cx ?? (d.minX + d.maxX) / 2, cz = d.cz ?? (d.minZ + d.maxZ) / 2;
    const u = (x - cx) * c + (z - cz) * s, v = -(x - cx) * s + (z - cz) * c;
    return { u, v, half: h, w: d.width / 2, y: d.topAtMin + (d.topAtMax - d.topAtMin) * ((u + h) / (2 * h)) }; };
  for (const A of decks) for (const p of ends(A.d)) { const ya = at(A.d, p.x, p.z).y;
    for (const B of decks) { if (B === A) continue; const q = at(B.d, p.x, p.z);
      if (Math.abs(q.u) > q.half + 0.02 || Math.abs(q.v) > q.w + 0.02) continue; n++; w = Math.max(w, Math.abs(ya - q.y)); } }
  return { n, w }; }
for (const [px, pz, size, lift] of [[45,45,10,0.3],[45,45,10,0.5],[45,45,8,0.5],[40,45,8,0.6],[45,40,8,0.6],[112,45,8,0.6],[45,112,8,0.6],[40,40,8,0.8],[45,45,10,0.8],[120,120,8,0.6]]) {
  const h = size / 2;
  const raw = skewRaw();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4, baseY: r3(terraceY + lift),
    footprint: [{ x: px - h, z: pz - h }, { x: px + h, z: pz - h }, { x: px + h, z: pz + h }, { x: px - h, z: pz + h }], rooms: [] });
  const expanded = expandCity(raw);
  const v = validateLevel(expanded, LEVEL_SPEC_V2);
  const level = normalizeLevel(expanded);
  const field = reliefOf(level.map.relief);
  const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
  let tilted = 0, dev = 0, burial = 0, below = 0;
  for (const { d } of decks) { const [a, b] = ends(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    if (Math.abs(d.topAtMax - d.topAtMin) > 0.01) tilted++;
    const k = Math.max(2, Math.round(run / J.navStep));
    for (let i = 1; i < k; i++) { const t = i / k; const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const dd = field.heightAt(x, z) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t);
      dev = Math.max(dev, Math.abs(dd)); burial = Math.max(burial, dd); }
    below = Math.max(below, field.heightAt(a.x, a.z) - d.topAtMin, field.heightAt(b.x, b.z) - d.topAtMax);
  }
  const j = joints(decks);
  console.log(`(${px},${pz}) ${size}м +${lift}`.padEnd(18), 'ошибк', v.errors.length, 'пластин', decks.length,
    'tilted', tilted, 'dev', dev.toFixed(4), 'провал', burial.toFixed(4), 'под грунтом', below.toFixed(3),
    'стыков', j.n, 'худш', j.w.toFixed(4), 'предупр', level.warnings.length,
    level.warnings.slice(0, 2).map(w => w.slice(0, 40)).join(' / '));
}
