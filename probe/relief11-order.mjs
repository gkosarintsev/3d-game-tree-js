/** Тот же расклад, что в relief11-attrib.mjs, но в обратном порядке: гряда измеряется
 * первой. Если разрыв «гряда дешевле HEAD» разворачивается — это разогрев, а не данные. */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 as HEAD } from './bak/level-12-head.js';
import { LEVEL_12 as NOW } from '../src/levels/level-12.js';
const half = NOW.map.ground.size / 2;
const pts = [];
for (let i = 0; i < 2000; i++) pts.push([-half + (i * 7.13) % (2 * half), -half + (i * 11.77) % (2 * half)]);
const ease = t => t * t * (3 - 2 * t);
const segDist = (x, z, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, len2 = dx * dx + dz * dz;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
};
function oldArithmetic(spec) {
  const f = reliefOf(spec);
  const hills = (spec.hills ?? []).map(h => ({ ...h, bx: h.bx ?? h.x, bz: h.bz ?? h.z }));
  return (x, z) => {
    let y = f.baseY;
    for (const h of hills) { const d = segDist(x, z, h.x, h.z, h.bx, h.bz); if (d < h.radius) y += h.height * ease(1 - d / h.radius); }
    for (const p of f.padsAt(x, z)) y += (p.pad.y - y) * p.weight;
    return y;
  };
}
function time(label, fn) {
  let best = Infinity;
  for (let pass = 0; pass < 8; pass++) {
    const t0 = process.hrtime.bigint(); let acc = 0;
    for (const p of pts) acc += fn(p[0], p[1]);
    if (acc === -1) throw new Error('!');
    best = Math.min(best, Number(process.hrtime.bigint() - t0) / 1e3 / pts.length);
  }
  console.log(`  ${label}: ${best.toFixed(3)} мкс/проба`); return best;
}
const headSpec = HEAD.map.relief, nowSpec = NOW.map.relief;
const headField = reliefOf(headSpec), nowField = reliefOf(nowSpec);
console.log('обратный порядок: сначала гряда');
time('гряда + новая', (x, z) => nowField.heightAt(x, z));
time('HEAD + новая', (x, z) => headField.heightAt(x, z));
time('гряда + старая', oldArithmetic(nowSpec));
time('HEAD + старая', oldArithmetic(headSpec));
console.log(`холмов: HEAD ${headSpec.hills.length}, гряда ${nowSpec.hills.length}`);
let hc = 0, nc = 0;
for (const p of pts) { hc += headField.hillsAt ? 1 : 0; }
