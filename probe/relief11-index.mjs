/**
 * Проверка индекса холмов: поле после правки обязано совпадать с полем «перебор
 * всех холмов» (старая арифметика) и быть дешевле.
 */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const spec = LEVEL_12.map.relief;
const ease = t => t * t * (3 - 2 * t);

function segDist(x, z, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const len2 = dx * dx + dz * dz;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2)) : 0;
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}

/** Поле старой арифметики: холмы перебором, площадки — тем же индексом. */
function reference(spec) {
  const hills = (spec.hills ?? []).map(h => ({ ...h, bx: h.bx ?? h.x, bz: h.bz ?? h.z }));
  const f = reliefOf(spec);
  return (x, z) => {
    let y = f.baseY;
    for (const h of hills) {
      const d = segDist(x, z, h.x, h.z, h.bx, h.bz);
      if (d < h.radius) y += h.height * ease(1 - d / h.radius);
    }
    for (const p of f.padsAt(x, z)) y += (p.pad.y - y) * p.weight;
    return y;
  };
}

const f = reliefOf(spec);
const ref = reference(spec);
let worst = 0, wx = 0, wz = 0, probes = 0;
for (let x = -300; x <= 300; x += 3) {
  for (let z = -300; z <= 300; z += 3) {
    const d = Math.abs(f.heightAt(x, z) - ref(x, z));
    probes++;
    if (d > worst) { worst = d; wx = x; wz = z; }
  }
}
console.log(`совпадение с перебором всех холмов: ${probes} проб, худшее расхождение ${worst.toExponential(3)} м в (${wx}; ${wz})`);

const time = (label, fn) => {
  let best = Infinity;
  for (let pass = 0; pass < 5; pass++) {
    const t0 = process.hrtime.bigint();
    let acc = 0;
    for (let k = 0; k < 200000; k++) {
      const x = ((k * 7919) % 600) - 300, z = ((k * 104729) % 600) - 300;
      acc += fn(x, z);
    }
    const dt = Number(process.hrtime.bigint() - t0) / 1e3 / 200000;
    if (acc === 0) console.log('!');
    if (dt < best) best = dt;
  }
  console.log(`  ${label}: ${best.toFixed(4)} мкс/проба`);
  return best;
};

console.log('проба поля по всей карте (600 × 600 м, холмов ' + (spec.hills ?? []).length + '):');
const a = time('с индексом', (x, z) => f.heightAt(x, z));
const b = time('перебором всех холмов', ref);
console.log(`  выигрыш ${(b / a).toFixed(2)}×`);
