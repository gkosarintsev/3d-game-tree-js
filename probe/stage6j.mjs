import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW);
raw.kind = 'json2';
raw.relief = { baseY: 0, hills: [
  { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
  { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
raw.city.districts[0].yaw = 18;
raw.city.districts[0].polygon = [
  { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
  { x: -37, z: -51 }, { x: -78, z: -34 }];
const level = normalizeLevel(expandCity(raw));
const field = reliefOf(level.map.relief);
const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
let worstBur = 0, worstDev = 0, wbId = '';
for (const { id, d } of decks) {
  const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
  const cx = d.cx ?? (d.minX + d.maxX) / 2, cz = d.cz ?? (d.minZ + d.maxZ) / 2;
  const a = { x: cx - c * half, z: cz - s * half }, b = { x: cx + c * half, z: cz + s * half };
  const y0 = d.topAtMin, y1 = d.topAtMax;
  const k = Math.max(2, Math.round(d.length / J.navStep));
  for (let i = 1; i < k; i++) {
    const t = i / k;
    const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
    const diff = field.heightAt(x, z) + J.streetRise - (y0 + (y1 - y0) * t);
    if (diff > worstBur) { worstBur = diff; wbId = id; }
    worstDev = Math.max(worstDev, Math.abs(diff));
  }
}
console.log('пластин', decks.length, 'худший провал', worstBur.toFixed(4), wbId, 'худшая невязка', worstDev.toFixed(4));
console.log('предупреждений', level.warnings.length, level.warnings.slice(0,3));
for (const fit of [0.0005, 0.001, 0.002, 0.005, 0.01]) {
  J.streetFit = fit;
  const l = normalizeLevel(expandCity(structuredClone(raw)));
  const split = l.map.roads.filter(r => r.decks.length > 1).length;
  console.log('fit', fit, 'дорог с резкой', split, 'пластин', l.map.roads.flatMap(r=>r.decks).length);
}
