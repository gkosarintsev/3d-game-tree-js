/** Фикстура с цоколем: валидатор, предупреждения и метрики для теста. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel } from '../tools/level-schema.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { r3, frameAt, unrotatePoint } from '../src/geo2d.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;
const base = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  raw.ground.size = 320;
  return raw; };
const skewRaw = base;
const terraceY = normalizeLevel(expandCity(skewRaw())).map.relief.pads.find(p => p.id === 'b:терраса').y;
console.log('терраса b', terraceY);
function mk(lift) {
  const raw = skewRaw();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: r3(terraceY + lift),
    footprint: [{ x: 56, z: 54 }, { x: 68, z: 54 }, { x: 68, z: 66 }, { x: 56, z: 66 }], rooms: [] });
  return raw;
}
function ends(d) {
  if (d.yaw === undefined) { const cz = (d.minZ + d.maxZ) / 2; return [{ x: d.minX, z: cz }, { x: d.maxX, z: cz }]; }
  const rad = d.yaw * DEG, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
  return [{ x: d.cx - c * half, z: d.cz - s * half }, { x: d.cx + c * half, z: d.cz + s * half }];
}
for (const lift of [0.55]) {
  const raw = mk(lift);
  const expanded = expandCity(raw);
  console.log('валидатор', JSON.stringify(validateLevel(expanded, undefined)));
  const level = normalizeLevel(expanded);
  console.log('предупр', level.warnings.length, level.warnings.slice(0, 4).join(' | '));
  const field = reliefOf(level.map.relief);
  const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
  let tilted = 0, slope = 0, dev = 0, burial = 0, ys = [];
  for (const { d } of decks) { const [a, b] = ends(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    ys.push(d.topY);
    if (Math.abs(d.topAtMax - d.topAtMin) > 0.01) tilted++;
    slope = Math.max(slope, Math.abs(d.topAtMax - d.topAtMin) / Math.max(run, 1e-6));
    const k = Math.max(2, Math.round(run / J.navStep));
    for (let i = 1; i < k; i++) { const t = i / k; const x2 = a.x + (b.x - a.x) * t, z2 = a.z + (b.z - a.z) * t;
      dev = Math.max(dev, Math.abs(field.heightAt(x2, z2) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t)));
      burial = Math.max(burial, field.heightAt(x2, z2) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t));
    } }
  console.log('пластин', decks.length, 'tilted', tilted, 'slope', slope.toFixed(4), 'dev', dev.toFixed(4),
    'burial', burial.toFixed(4), 'разброс отметок', (Math.max(...ys) - Math.min(...ys)).toFixed(3));
  // инвариант ядра: пластины района внутри террасы
  for (const [id, terr] of level.map.relief.pads.filter(p => p.id.endsWith(':терраса')).map(p => [p.id.slice(0,1), p])) {
    const plates = expanded.roads.filter(r => r.district === id).flatMap(r => r.elements.map(e => e.plate));
    const f = terr.yaw ? frameAt((terr.minX+terr.maxX)/2, (terr.minZ+terr.maxZ)/2, terr.yaw) : null;
    let worst = 0;
    for (const p of plates) {
      const k = p.yaw * DEG, ax = Math.cos(k)*p.length/2, az = Math.sin(k)*p.length/2, bx = -Math.sin(k)*p.width/2, bz = Math.cos(k)*p.width/2;
      for (const [dx, dz] of [[ax+bx,az+bz],[ax-bx,az-bz],[-ax+bx,-az+bz],[-ax-bx,-az-bz]]) {
        const q = f ? unrotatePoint(f, p.x+dx, p.z+dz) : { x: p.x+dx, z: p.z+dz };
        worst = Math.max(worst, terr.minX - q.x, q.x - terr.maxX, terr.minZ - q.z, q.z - terr.maxZ);
      }
    }
    console.log('ядро', id, 'пластин', plates.length, 'выпало', worst.toFixed(6));
  }
  // резка при тугом допуске
  const fit = J.streetFit; J.streetFit = 0.005;
  const tight = normalizeLevel(expandCity(mk(lift)));
  console.log('tight: разрезано дорог', tight.map.roads.filter(r => r.decks.length > 1).length, 'предупр', tight.warnings.length, tight.warnings.slice(0,2).map(w=>w.slice(0,60)).join(' | '));
  J.streetGrade = 0.004; J.streetFit = fit;
  const grad = normalizeLevel(expandCity(mk(lift)));
  console.log('grade: предупреждений', grad.warnings.length, grad.warnings.slice(0,3).map(w=>w.slice(0,70)).join(' | '));
  J.streetGrade = 0.06;
}
