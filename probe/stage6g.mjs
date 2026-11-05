/**
 * Диагноз этапа 6b: какие пары пластин дают нестыковку торцов.
 */
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

function deckEnds(d) {
  if (d.yaw === undefined) {
    const cz = (d.minZ + d.maxZ) / 2;
    return [{ x: d.minX, z: cz }, { x: d.maxX, z: cz }];
  }
  const rad = d.yaw * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad), half = d.length / 2;
  return [{ x: d.cx - c * half, z: d.cz - s * half }, { x: d.cx + c * half, z: d.cz + s * half }];
}
function deckAt(d, x, z) {
  const rad = (d.yaw ?? 0) * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
  const half = d.length / 2, w = d.width / 2;
  const cx = d.yaw === undefined ? (d.minX + d.maxX) / 2 : d.cx;
  const cz = d.yaw === undefined ? (d.minZ + d.maxZ) / 2 : d.cz;
  const u = (x - cx) * c + (z - cz) * s, v = -(x - cx) * s + (z - cz) * c;
  return { u, v, half, w, y: d.topAtMin + (d.topAtMax - d.topAtMin) * ((u + half) / (2 * half)) };
}
const decks = level.map.roads
  .flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
const bad = [];
for (const A of decks) {
  for (const p of deckEnds(A.d)) {
    const ya = deckAt(A.d, p.x, p.z).y;
    for (const B of decks) {
      if (B === A) continue;
      const qb = deckAt(B.d, p.x, p.z);
      if (Math.abs(qb.u) > qb.half + 0.02 || Math.abs(qb.v) > qb.w + 0.02) continue;
      if (Math.abs(ya - qb.y) <= 0.002) continue;
      bad.push({ A: A.id, B: B.id, yA: +ya.toFixed(3), yB: +qb.y.toFixed(3),
        field: +field.heightAt(p.x, p.z).toFixed(3),
        u: +qb.u.toFixed(2), half: +qb.half.toFixed(2), v: +qb.v.toFixed(2), w: +qb.w.toFixed(2),
        p: [+p.x.toFixed(1), +p.z.toFixed(1)] });
    }
  }
}
console.log('нестыковок:', bad.length);
for (const b of bad.slice(0, 8)) console.log(JSON.stringify(b));
