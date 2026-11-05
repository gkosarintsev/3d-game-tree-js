/**
 * Чем платит гряда: расхождение картинки грунта с полем (`meshCell`) против
 * разброса рельефа вдоль x. Три формы одних и тех же трёх капсул — текущая,
 * ниже и шире, и «один большой холм» (вопрос 2 владельцу).
 */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
const m = LEVEL_12.map;
const RIDGE = ['ridge_crest_west', 'ridge_crest_centre', 'ridge_crest_east'];
const base = m.relief.hills.filter(h => !RIDGE.includes(h.id));

/** Полоса силуэта: разброс высшей отметки поля по колонкам x (z 200…300). */
function skylineSpread(f, z0 = 200, z1 = 300) {
  const half = m.ground.size / 2;
  const ys = [];
  for (let x = -half; x <= half; x += 20) {
    let hi = -Infinity;
    for (let z = z0; z <= z1; z += 10) hi = Math.max(hi, f.heightAt(x, z));
    ys.push(hi);
  }
  return Math.max(...ys) - Math.min(...ys);
}

/** Худшее расхождение линейной картинки с полем (тот же интерполянт, что в замере этапа 11). */
function pictureError(f, cell = J.relief.meshCell) {
  const half = m.ground.size / 2;
  const n = Math.round((2 * half) / cell);
  const step = (2 * half) / n;
  const H = new Float64Array((n + 1) * (n + 1));
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) H[j * (n + 1) + i] = f.heightAt(-half + i * step, -half + j * step);
  }
  let worst = 0, wx = 0, wz = 0;
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x0 = -half + i * step, z0 = -half + j * step;
      const hA = H[j * (n + 1) + i], hB = H[j * (n + 1) + i + 1];
      const hC = H[(j + 1) * (n + 1) + i], hD = H[(j + 1) * (n + 1) + i + 1];
      for (const [s, t] of [[0.5, 0.5], [0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75],
        [0.5, 0.2], [0.2, 0.5], [0.8, 0.5], [0.5, 0.8]]) {
        const lin = s + t <= 1
          ? hA + s * (hB - hA) + t * (hC - hA)
          : hD + (1 - s) * (hC - hD) + (1 - t) * (hB - hD);
        const d = Math.abs(f.heightAt(x0 + s * step, z0 + t * step) - lin);
        if (d > worst) { worst = d; wx = x0 + s * step; wz = z0 + t * step; }
      }
    }
  }
  return { worst, wx, wz };
}

const variants = {
  'база: гряды нет': [],
  'текущая (h 2,2/2,0 · r 60)': m.relief.hills.filter(h => RIDGE.includes(h.id)),
  'ниже и шире (×0,7 h, ×1,5 r)': m.relief.hills.filter(h => RIDGE.includes(h.id))
    .map(h => ({ ...h, height: +(h.height * 0.7).toFixed(2), radius: Math.round(h.radius * 1.5) })),
  'один холм на весь верх (r 300, h 3,6)': [{ id: 'ridge_one', x: -140, z: 290, bx: 140, bz: 290, radius: 300, height: 3.6 }],
};

console.log('форма гряды → разброс силуэта по x и расхождение картинки (сетка ' + J.relief.meshCell + ' м):');
for (const [label, ridge] of Object.entries(variants)) {
  const f = reliefOf({ ...m.relief, hills: [...base, ...ridge] });
  const e = pictureError(f);
  console.log(`  ${label}: горизонт ${skylineSpread(f).toFixed(2)} м, картинка ≤ ${e.worst.toFixed(4)} м в (${e.wx.toFixed(0)}; ${e.wz.toFixed(0)}), уклон ≤ ${maxSlope(f).toFixed(4)} (предел ${J.relief.hillMaxSlope})`);
}

function maxSlope(f) {
  const half = m.ground.size / 2;
  let best = 0;
  for (let x = -half + 2; x < half - 2; x += 4) {
    for (let z = -half + 2; z < half - 2; z += 4) best = Math.max(best, f.slopeAt(x, z).mag);
  }
  return best;
}
