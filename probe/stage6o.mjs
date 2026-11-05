/** Фикстура с авторским цоколем внутри квартала: его площадка гнёт поле под улицами. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';
const J = CONFIG.jsonMap;

function base() {
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
}
const terraceY = normalizeLevel(expandCity(base())).map.relief.pads.find(p => p.id === 'b:терраса').y;
console.log('терраса b', terraceY);

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
for (const [name, x, z, lift] of [['без цоколя', null, null, 0], ['цоколь (100,60)+0,9', 100, 60, 0.9],
                                  ['цоколь (60,100)+1,2', 60, 100, 1.2], ['цоколь (75,75)+0,6', 75, 75, 0.6]]) {
  const raw = base();
  if (x !== null) {
    raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
      baseY: +(terraceY + lift).toFixed(3),
      footprint: [{ x, z: z - 6 }, { x: x + 12, z: z - 6 }, { x: x + 12, z: z + 6 }, { x, z: z + 6 }],
      rooms: [] });
  }
  const level = normalizeLevel(expandCity(raw));
  const field = reliefOf(level.map.relief);
  const decks = level.map.roads.flatMap(r => r.decks.filter(d => d.length !== undefined).map(d => ({ id: r.id, d })));
  let tilted = 0, worstSlope = 0, bur = 0, dev = 0;
  for (const { d } of decks) {
    const [a, b] = deckEnds(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    if (Math.abs(d.topAtMax - d.topAtMin) > 0.01) tilted++;
    worstSlope = Math.max(worstSlope, Math.abs(d.topAtMax - d.topAtMin) / Math.max(run, 1e-6));
    const k = Math.max(2, Math.round(run / J.navStep));
    for (let i = 0; i <= k; i++) { const t = i / k;
      const x2 = a.x + (b.x - a.x) * t, z2 = a.z + (b.z - a.z) * t;
      const dv = field.heightAt(x2, z2) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t);
      bur = Math.max(bur, -dv); dev = Math.max(dev, Math.abs(dv)); }
  }
  let joints = 0, worst = 0;
  for (const A of decks) for (const p of deckEnds(A.d)) {
    const ya = deckAt(A.d, p.x, p.z).y;
    for (const B of decks) { if (B === A) continue;
      const qb = deckAt(B.d, p.x, p.z);
      if (Math.abs(qb.u) > qb.half + 0.02 || Math.abs(qb.v) > qb.w + 0.02) continue;
      joints++; worst = Math.max(worst, Math.abs(ya - qb.y)); } }
  const ys = decks.map(x2 => x2.d.topY);
  console.log(name.padEnd(22), 'пластин', decks.length, 'tilted', tilted, 'slope', worstSlope.toFixed(3),
    'провал', bur.toFixed(3), 'невязка', dev.toFixed(3), 'стыков', joints, 'худший', worst.toFixed(4),
    'разброс', (Math.max(...ys) - Math.min(...ys)).toFixed(2), 'предупр', level.warnings.length,
    level.warnings.slice(0, 2).map(w => w.slice(0, 40)).join(' / '));
}

// где именно провал: показать худшие пластины и их сырые прогоны
{
  const raw = base();
  raw.buildings.push({ id: 'plinth', isEnterable: false, floorsCount: 3, floorHeight: 3.4,
    baseY: +(terraceY + 0.9).toFixed(3),
    footprint: [{ x: 100, z: 54 }, { x: 112, z: 54 }, { x: 112, z: 66 }, { x: 100, z: 66 }], rooms: [] });
  const expanded = expandCity(raw);
  const level = normalizeLevel(expanded);
  const field = reliefOf(level.map.relief);
  const rows = [];
  for (const r of level.map.roads) for (const d of r.decks.filter(x => x.length !== undefined)) {
    const [a, b] = deckEnds(d); const run = Math.hypot(b.x - a.x, b.z - a.z);
    const k = Math.max(2, Math.round(run / J.navStep));
    let bur = 0;
    for (let i = 0; i <= k; i++) { const t = i / k;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      bur = Math.max(bur, field.heightAt(x, z) + J.streetRise - (d.topAtMin + (d.topAtMax - d.topAtMin) * t)); }
    rows.push({ id: r.id, deck: `${d.length}×${d.width}`, bur: +(-bur).toFixed(3), y: d.topAtMin, y1: d.topAtMax,
      p: [+a.x.toFixed(1), +a.z.toFixed(1)] });
  }
  rows.sort((x, y) => x.bur - y.bur);
  for (const r of rows.slice(0, 6)) console.log(JSON.stringify(r));
  const src = expanded.roads.filter(r => /^b_s_(h1_2|v1_2|h2)/.test(r.id));
  for (const s of src) console.log('сырой прогон', s.id, JSON.stringify(s.elements.map(e => e.plate)));
}
