import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CITY_RAW } from './city-fixture.mjs';

/** План настила: точный четырёхугольник (для повёрнутого — его OBB), а не габарит. */
function planOf(d) {
  if (d.obb) {
    const o = d.obb;
    const pts = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      pts.push({ x: o.cx + o.hx * sx * o.c - o.hz * sz * o.s, z: o.cz + o.hx * sx * o.s + o.hz * sz * o.c });
    }
    // порядок обхода: как в obbOf — (-1,-1), (-1,1), (1,1), (1,-1)
    return [pts[0], pts[2], pts[3], pts[1]];
  }
  return [
    { x: d.minX, z: d.minZ }, { x: d.maxX, z: d.minZ },
    { x: d.maxX, z: d.maxZ }, { x: d.minX, z: d.maxZ },
  ];
}

/** Sutherland–Hodgman: сечение subject полуплоскостями выпуклого clip-многоугольника. */
function clipArea(subject, clip) {
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const side = p => (b.x - a.x) * (p.z - a.z) - (b.z - a.z) * (p.x - a.x);
    const src = out;
    out = [];
    for (let k = 0; k < src.length; k++) {
      const p = src[k], q = src[(k + 1) % src.length];
      const sp = side(p), sq = side(q);
      if (sp >= 0) out.push(p);
      if ((sp >= 0) !== (sq >= 0)) {
        const t = sp / (sp - sq);
        out.push({ x: p.x + t * (q.x - p.x), z: p.z + t * (q.z - p.z) });
      }
    }
  }
  let s = 0;
  for (let i = 0; i < out.length; i++) {
    const a = out[i], b = out[(i + 1) % out.length];
    s += a.x * b.z - b.x * a.z;
  }
  return Math.abs(s) / 2;
}

/** Пары настилов на одной отметке, реально перекрывающиеся в плане. */
function overlapPairs(decks) {
  const pairs = [];
  let area = 0;
  for (let i = 0; i < decks.length; i++) {
    for (let k = i + 1; k < decks.length; k++) {
      const A = decks[i], B = decks[k];
      if (Math.abs(A.d.topY - B.d.topY) > 0.01) continue;
      const s = clipArea(planOf(A.d), planOf(B.d));
      if (s < 0.01) continue;
      pairs.push(`${A.id} × ${B.id} — ${s.toFixed(1)} м²`);
      area += s;
    }
  }
  return { pairs, area };
}

const raw = structuredClone(CITY_RAW);
const expanded = expandCity(raw, {});
console.log('ошибки валидатора:', validateLevel(expanded, LEVEL_SPEC_V2).errors.length);
const norm = normalizeLevel(expanded);
console.log('предупреждения:', norm.warnings.length, norm.warnings.slice(0, 4));
const decks = norm.map.roads.filter(r => r.type === 'ground')
  .flatMap(r => r.decks.map(d => ({ id: r.id, d })));
const { pairs, area } = overlapPairs(decks);
console.log(`наст.: ${decks.length} · со-плоскостных наложений: ${pairs.length} · ${area.toFixed(0)} м²`);
console.log(pairs.slice(0, 8).join('\n'));

// глава 10: воспроизведение замера плана (158 пар, 24 367 м²) метрикой плана
const ten = JSON.parse(readFileSync('src/levels/level-10.json', 'utf8'));
const n10 = normalizeLevel(expandCity(structuredClone(ten), {}));
const decks10 = n10.map.roads.filter(r => r.type === 'ground')
  .flatMap(r => r.decks.map(d => ({ id: r.id, d })));
const m10 = overlapPairs(decks10);
console.log(`глава 10: пластин ${decks10.length}, наложений ${m10.pairs.length}, ${m10.area.toFixed(0)} м²`);
