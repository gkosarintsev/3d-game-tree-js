import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const mk = () => {
  const raw = structuredClone(CITY_RAW);
  raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [
    { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 },
    { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [
    { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 },
    { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw;
};
const expanded = expandCity(mk());
const r0 = expanded.roads.find(r => r.id === 'b_s_h0_0');
console.log('сырая пластина:', JSON.stringify(r0.elements[0].plate));
for (const fit of [0.05, 0.01]) {
  J.streetFit = fit;
  const level = normalizeLevel(expandCity(mk()));
  const road = level.map.roads.find(r => r.id === 'b_s_h0_0');
  console.log('fit', fit, 'decks', JSON.stringify(road.decks.map(d => ({ y: d.topAtMin, y1: d.topAtMax, len: d.length, yaw: d.yaw }))));
  const field = reliefOf(level.map.relief);
  for (const d of road.decks) {
    const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
    const a = { x: d.cx - c * half, z: d.cz - s * half }, b = { x: d.cx + c * half, z: d.cz + s * half };
    const k = Math.max(2, Math.round(d.length / J.navStep));
    let bur = 0;
    for (let i = 1; i < k; i++) { const t = i / k;
      bur = Math.max(bur, field.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t)); }
    console.log('   пластина', d.length, 'провал', bur.toFixed(4));
  }
}

const exp = expandCity(mk());
const p = exp.roads.find(r => r.id === 'b_s_h0_0').elements[0].plate;
const lvl = normalizeLevel(expandCity(mk()));
const F = reliefOf(lvl.map.relief);
const rad = (p.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = p.length / 2;
const a = { x: p.x - c * half, z: p.z - s * half }, b = { x: p.x + c * half, z: p.z + s * half };
const y0 = F.heightAt(a.x, a.z) + J.streetRise, y1 = F.heightAt(b.x, b.z) + J.streetRise;
const k = Math.max(2, Math.round(p.length / J.navStep));
let dev = 0, bur = 0;
for (let i = 1; i < k; i++) { const t = i / k;
  const d = F.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) - (y0 + (y1 - y0) * t);
  dev = Math.max(dev, Math.abs(d + J.streetRise)); bur = Math.max(bur, d);
  console.log('  t', t.toFixed(2), 'field', F.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t).toFixed(4),
    'chord', (y0 + (y1 - y0) * t).toFixed(4), 'd', d.toFixed(4)); }
console.log('y0', y0.toFixed(4), 'y1', y1.toFixed(4), 'dev', dev.toFixed(4), 'bur', bur.toFixed(4), 'navStep', J.navStep, 'k', k);
