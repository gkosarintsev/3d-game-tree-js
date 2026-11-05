/**
 * Стоимость подгонки площадок на масштабе главы 12: развёрнутый город 600 × 600
 * с рельефом. Замеряем время normalizeLevel, число площадок, итоговый уклон поля
 * и предупреждения. usage: node probe/relief-scale.mjs
 */
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';

const raw = JSON.parse(readFileSync('probe/city-600.json', 'utf8'));
raw.kind = 'json2';
// широкие пологие холмы: район 200–250 м требует, чтобы природа под его кварталом
// менялась на метры, а не на десятки — иначе террасу не свести в предел
raw.relief = {
  baseY: 0,
  hills: [
    { id: 'plyos', x: -200, z: 160, bx: 40, bz: 220, radius: 520, height: 14 },
    { id: 'sopka', x: 240, z: -40, bx: 240, bz: 160, radius: 420, height: 10 },
    { id: 'dolina', x: -140, z: -220, bx: 120, bz: -260, radius: 460, height: -8 },
  ],
};
const t0 = Date.now();
const expanded = expandCity(raw);
const t1 = Date.now();
const { errors } = validateLevel(expanded, LEVEL_SPEC_V2);
const t2 = Date.now();
const level = normalizeLevel(expanded);
const t3 = Date.now();
console.log(`домов ${level.map.buildings.length}, улиц ${level.map.roads.length}, площадок ${level.map.relief.pads.length}`);
console.log(`expand ${t1 - t0} мс, validate ${t2 - t1} мс, normalize ${t3 - t2} мс`);
console.log(`ошибок ${errors.length}`, errors.slice(0, 5));
const byKind = {};
for (const w of level.warnings) {
  const key = w.slice(0, 60);
  byKind[key] = (byKind[key] || 0) + 1;
}
console.log(`предупреждений ${level.warnings.length}:`, Object.entries(byKind).slice(0, 8));
const blends = level.map.relief.pads.map(p => p.blend).sort((a, b) => a - b);
console.log(`кольца: минимум ${blends[0]}, медиана ${blends[blends.length >> 1]}, максимум ${blends[blends.length - 1]}`);
for (const p of level.map.relief.pads) {
  console.log(`${p.id}: y=${p.y} blend=${p.blend} план=[${p.minX}…${p.maxX} × ${p.minZ}…${p.maxZ}]`);
}
const f = reliefOf(structuredClone(level.map.relief));
let max = 0; let at = null;
for (let x = -296; x <= 296; x += 8) {
  for (let z = -296; z <= 296; z += 8) {
    const m = f.slopeAt(x, z).mag;
    if (m > max) { max = m; at = [x, z]; }
  }
}
console.log(`макс уклон поля ${max.toFixed(4)} в ${at} (${(max / level.map.relief.maxSlope).toFixed(2)} предела)`);
