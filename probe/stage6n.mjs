/** Разброс поля в квадрате перекрёстка без подъёма плоскости. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;
const mk = () => { const raw = structuredClone(CITY_RAW); raw.kind = 'json2';
  raw.relief = { baseY: 0, hills: [ { id: 'hrub', x: -80, z: -80, radius: 400, height: 3 }, { id: 'lon', x: 90, z: 90, radius: 400, height: -2 }] };
  raw.city.districts[0].yaw = 18;
  raw.city.districts[0].polygon = [ { x: -126, z: -78 }, { x: -82, z: -129 }, { x: -31, z: -123 }, { x: -37, z: -51 }, { x: -78, z: -34 }];
  return raw; };
// подъём плоскости отключаем нулевым допуском: lifting считается от streetFit
const before = J.streetFit;
const level = normalizeLevel(expandCity(mk()));
J.streetFit = before;
const field = level.map.relief; // данные поля
const { reliefOf } = await import('../src/relief.js');
const F = reliefOf(field);
const rows = level.map.roads.filter(r => /_x\d+_\d+/.test(r.id));
for (const r of rows) {
  const d = r.decks[0];
  const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
  const half = d.length / 2, w = d.width / 2;
  let hi = -9, lo = 9;
  for (let iu = 0; iu <= 4; iu++) for (let iv = 0; iv <= 4; iv++) {
    const u = 2 * half * (iu / 4) - half, v = 2 * w * (iv / 4) - w;
    const x = d.cx + u * c - v * s, z = d.cz + u * s + v * c;
    const plane = d.topAtMin + (d.topAtMax - d.topAtMin) * ((u + half) / (2 * half));
    const dev = F.heightAt(x, z) + J.streetRise - plane;
    hi = Math.max(hi, dev); lo = Math.min(lo, dev);
  }
  console.log(r.id, 'провал', hi.toFixed(3), 'горб', (-lo).toFixed(3), 'разброс', (hi - lo).toFixed(3));
}
