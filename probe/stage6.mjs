import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { CITY_RAW } from './city-fixture.mjs';

const raw = structuredClone(CITY_RAW);
raw.kind = 'json2';
const expanded = expandCity(raw, {});
const errs = validateLevel(expanded, LEVEL_SPEC_V2).errors;
console.log('ошибки валидатора:', errs.length, errs.slice(0, 3));
const norm = normalizeLevel(expanded);
console.log('предупреждения:', norm.warnings.length, norm.warnings.slice(0, 4));

const decks = norm.map.roads.filter(r => r.type === 'ground').flatMap(r => r.decks.map(d => ({ id: r.id, d })));
console.log('настилов наземных улиц:', decks.length, '| записей улиц:', norm.map.roads.filter(r => r.type === 'ground').length);

const area = (a, b) => {
  const w = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX);
  const h = Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ);
  return w > 1e-6 && h > 1e-6 ? w * h : 0;
};
let coplanar = 0, anyOverlap = 0, worst = 0;
const pairs = [];
for (let i = 0; i < decks.length; i++) {
  for (let k = i + 1; k < decks.length; k++) {
    const a = decks[i].d, b = decks[k].d;
    const s = area(a, b);
    if (s <= 0) continue;
    anyOverlap++;
    const sameTop = Math.abs(Math.min(a.topAtMin, a.topAtMax) - Math.min(b.topAtMin, b.topAtMax)) < 0.01
      && Math.abs(Math.max(a.topAtMin, a.topAtMax) - Math.max(b.topAtMin, b.topAtMax)) < 0.01;
    if (sameTop) { coplanar++; worst = Math.max(worst, s); if (pairs.length < 6) pairs.push(`${decks[i].id} × ${decks[k].id} — ${s.toFixed(1)} м²`); }
  }
}
console.log('наложений пар:', anyOverlap, '| со-плоскостных:', coplanar, '| худшее:', worst.toFixed(1), 'м²');
console.log(pairs.join('\n'));

// отметка настила против поля под ним
const relief = norm.map.relief;
console.log('relief в модуле:', relief ? 'да' : 'нет');
const gaps = decks.map(({ id, d }) => {
  const cx = (d.minX + d.maxX) / 2, cz = (d.minZ + d.maxZ) / 2;
  return { id, top: Math.min(d.topAtMin, d.topAtMax), y: d.topY };
});
const tops = [...new Set(gaps.map(g => g.y))].sort((a, b) => a - b);
console.log('отметки настилов (уникальные):', tops.join(', '));
