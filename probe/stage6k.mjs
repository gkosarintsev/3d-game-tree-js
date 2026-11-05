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

function deckEnds(d) {
  if (d.yaw === undefined) { const cz = (d.minZ + d.maxZ) / 2; return [{ x: d.minX, z: cz }, { x: d.maxX, z: cz }]; }
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
for (const grade of [0.06, 0.02, 0.01, 0.004]) {
  J.streetGrade = grade;
  const level = normalizeLevel(expandCity(structuredClone(raw)));
  const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
  let joints = 0, worst = 0, bur = 0;
  const field = reliefOf(level.map.relief);
  for (const A of decks) for (const p of deckEnds(A.d)) {
    const ya = deckAt(A.d, p.x, p.z).y;
    for (const B of decks) { if (B === A) continue;
      const qb = deckAt(B.d, p.x, p.z);
      if (Math.abs(qb.u) > qb.half + 0.02 || Math.abs(qb.v) > qb.w + 0.02) continue;
      joints++; worst = Math.max(worst, Math.abs(ya - qb.y)); }
  }
  for (const { d } of decks) { const [a, b] = deckEnds(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    const k = Math.max(2, Math.round(run / J.navStep));
    for (let i = 0; i <= k; i++) { const t = i / k;
      bur = Math.max(bur, field.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t)); } }
  console.log('grade', grade, 'пластин', decks.length, 'дорог', level.map.roads.length,
    'стыков', joints, 'худший', worst.toFixed(4), 'провал', bur.toFixed(4), 'предупр', level.warnings.length);
}

J.streetGrade = 0.06;
{
  const level = normalizeLevel(expandCity(structuredClone(raw)));
  const field = reliefOf(level.map.relief);
  const rows = level.map.roads.map(r => {
    let bur = 0;
    for (const d of r.decks.filter(x => x.length !== undefined)) {
      const [a, b] = deckEnds(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
      const k = Math.max(2, Math.round(run / J.navStep));
      for (let i = 0; i <= k; i++) { const t = i / k;
        bur = Math.max(bur, field.heightAt(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t) - (d.topAtMin + (d.topAtMax - d.topAtMin) * t)); }
    }
    return { id: r.id, bur: +bur.toFixed(4), n: r.decks.length };
  }).sort((x, y) => y.bur - x.bur);
  console.log('худшие по провалу:', rows.slice(0, 6).map(r => `${r.id} ${r.bur} (${r.n})`).join(' | '));
}
