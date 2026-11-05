/**
 * Замер этапа 6b: держит ли профиль улиц генератора поле после нормализации.
 *
 * Для каждой пластины — провал настила под поле (опорой тогда отвечает грунт),
 * невязку стыка с соседом вдоль ряда и уклон самой пластины.
 */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';
import { CONFIG } from '../src/config.js';
import { CITY_RAW } from './city-fixture.mjs';

const J = CONFIG.jsonMap;
const raw = structuredClone(CITY_RAW);
raw.city.districts[0].polygon = [
  { x: -140, z: -140 }, { x: -20, z: -140 }, { x: -20, z: -20 }, { x: -140, z: -20 }];
const expanded = expandCity(raw);
const level = normalizeLevel(expanded);
const field = reliefOf(level.map.relief);

const roads = level.map.roads;
console.log('дорог:', roads.length, 'пластин:', roads.reduce((s, r) => s + r.decks.length, 0));
console.log('предупреждений:', level.warnings.length, level.warnings.slice(0, 4));

function ends(d) {
  const half = d.length / 2;
  if (d.yaw === undefined) {
    const cz = (d.minZ + d.maxZ) / 2;
    return [{ x: d.minX, z: cz }, { x: d.maxX, z: cz }];
  }
  const rad = d.yaw * Math.PI / 180, c = Math.cos(rad), s = Math.sin(rad);
  return [
    { x: d.cx - c * half, z: d.cz - s * half },
    { x: d.cx + c * half, z: d.cz + s * half },
  ];
}

let worstBurial = 0, buried = 0, worstSlope = 0, lifted = 0;
const deckYs = [];
for (const r of roads) {
  for (const d of r.decks) {
    if (d.length === undefined) continue;
    const [a, b] = ends(d);
    const run = Math.hypot(b.x - a.x, b.z - a.z);
    const k = Math.max(2, Math.round(run / J.navStep));
    let bur = 0, high = 0;
    for (let i = 0; i <= k; i++) {
      const t = i / k;
      const x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
      const chord = d.topAtMin + (d.topAtMax - d.topAtMin) * t;
      bur = Math.max(bur, field.heightAt(x, z) - chord);
      high = Math.max(high, chord - field.heightAt(x, z));
    }
    worstBurial = Math.max(worstBurial, bur);
    if (bur > 0.02) buried++;
    if (high > 0.3) lifted++;
    worstSlope = Math.max(worstSlope, Math.abs(d.topAtMax - d.topAtMin) / Math.max(run, 1e-6));
    deckYs.push(+d.topY.toFixed(2));
  }
}

// стыки: для каждой пластины ищем соседа, чей торец лежит в 0,05 м от её торца
let worstJoint = 0, joints = 0;
const flat = [];
for (const r of roads) for (const d of r.decks) if (d.length !== undefined) flat.push({ id: r.id, d, e: ends(d) });
for (const A of flat) {
  for (const B of flat) {
    if (A === B) continue;
    for (const pa of A.e) {
      for (const pb of B.e) {
        if (Math.hypot(pa.x - pb.x, pa.z - pb.z) > 0.05) continue;
        const ya = A.d.topAtMin + (A.d.topAtMax - A.d.topAtMin) * (pa === A.e[0] ? 0 : 1);
        const yb = B.d.topAtMin + (B.d.topAtMax - B.d.topAtMin) * (pb === B.e[0] ? 0 : 1);
        joints++;
        worstJoint = Math.max(worstJoint, Math.abs(ya - yb));
      }
    }
  }
}
console.log(JSON.stringify({
  'провал настила под поле > 0,02': buried, 'худший провал м': +worstBurial.toFixed(3),
  'настил выше поля > 0,3': lifted, 'худший уклон': +worstSlope.toFixed(3),
  стыков: joints, 'худший стык м': +worstJoint.toFixed(4),
  'отметки пластин': deckYs.slice(0, 8),
}, null, 1));
