/** Перебор позиции и подъёма авторского цоколя: нужен наклон улиц без предупреждений. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const base = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw; };
const terraceY = normalizeLevel(expandCity(base())).map.relief.pads.find(p => p.id === 'b:терраса').y;
function ends(d) {
  if (d.yaw === undefined) { const cz = (d.minZ + d.maxZ) / 2; return [{ x: d.minX, z: cz }, { x: d.maxX, z: cz }]; }
  const rad = d.yaw * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
  return [{ x: d.cx - c * half, z: d.cz - s * half }, { x: d.cx + c * half, z: d.cz + s * half }];
}
for (const [x, z, lift] of [[100,60,0.55],[100,60,0.6],[112,60,0.5],[100,43,0.55],[124,60,0.6],[100,75,0.55],[56,60,0.55],[100,60,0.45]]) {
  const raw = base();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: +(terraceY + lift).toFixed(3),
    footprint: [{ x, z: z - 6 }, { x: x + 12, z: z - 6 }, { x: x + 12, z: z + 6 }, { x, z: z + 6 }], rooms: [] });
  const level = normalizeLevel(expandCity(raw));
  const field = reliefOf(level.map.relief);
  const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
  let tilted = 0, slope = 0, dev = 0;
  const split = level.map.roads.filter(r => r.decks.length > 1).length;
  for (const { d } of decks) { const [a, b] = ends(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    if (Math.abs(d.topAtMax - d.topAtMin) > 0.01) tilted++;
    slope = Math.max(slope, Math.abs(d.topAtMax - d.topAtMin) / Math.max(run, 1e-6));
    const k = Math.max(2, Math.round(run / J.navStep));
    for (let i = 1; i < k; i++) { const t = i / k; const x2 = a.x + (b.x - a.x) * t, z2 = a.z + (b.z - a.z) * t;
      dev = Math.max(dev, Math.abs(field.heightAt(x2, z2) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t))); } }
  console.log(`(${x},${z}) +${lift}`.padEnd(16), 'пластин', decks.length, 'резано дорог', split, 'tilted', tilted,
    'slope', slope.toFixed(3), 'dev', dev.toFixed(3), 'предупр', level.warnings.length, level.warnings.slice(0,2).map(w=>w.slice(0,32)).join(' / '));
}
