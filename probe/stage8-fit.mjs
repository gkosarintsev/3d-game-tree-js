/* Подбор гряды главы 12: ищет набор E-W капсул (поле зависит только от z), чей
   профиль проходит через контрольные точки двух ярусов и не превышает предел
   уклона. Цель — плоская пойма под руслом и плоское плато под районами, чтобы
   кольцам террас нечем было «догонять» природу. */
import { reliefOf } from '../src/relief.js';

const J = { hillMaxSlope: 0.06, maxSlope: 0.12 };
// нижний ярус у воды ≈ 0 (пойма держится площадкой), плато ≈ +14, между ними —
// монотонный склон; крутизна природы оставляет запас под кольца террас.
// Пойма обязана быть плоской ПРИРОДОЙ до самой бровки: площадка с кольцом 120 м
// не успевает погасить склон, который начинается у её края.
const ctrl = [
  [-300, -0.2], [-200, -0.1], [-120, 0.0], [-90, 0.2], [-60, 0.9], [-20, 3.4],
  [30, 6.8], [80, 10.8], [120, 13.4], [170, 14.6], [230, 14.9], [300, 14.5],
];
const target = z => {
  for (let i = 0; i + 1 < ctrl.length; i++) {
    const [a, va] = ctrl[i], [b, vb] = ctrl[i + 1];
    if (z <= b) return va + (vb - va) * (z - a) / (b - a);
  }
  return ctrl[ctrl.length - 1][1];
};

let state = 0x12c3e4f5;
const rnd = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 4294967296;
};

function make(n) {
  const hills = [];
  for (let i = 0; i < n; i++) {
    const z = -260 + rnd() * 560;
    const radius = 160 + rnd() * 360;
    const h = (rnd() * 2 - 1) * 7;
    hills.push({ x: -340, z: +z.toFixed(1), bx: 340, bz: +z.toFixed(1), radius: Math.round(radius), height: +h.toFixed(2) });
  }
  return hills;
}

/** Штраф: профиль против цели, предел уклона природы и крутизна капсул. */
function cost(hills) {
  let over = 0;
  for (const h of hills) {
    const steep = 1.5 * Math.abs(h.height) / h.radius;
    if (steep > J.hillMaxSlope) over += (steep - J.hillMaxSlope) * 4000;
  }
  const f = reliefOf({ baseY: 0, hills, pads: [] });
  let e = 0, worst = 0;
  for (let z = -300; z <= 300; z += 5) {
    e += (f.heightAt(0, z) - target(z)) ** 2;
    worst = Math.max(worst, f.slopeAt(0, z).mag);
  }
  return e / 121 + (worst > 0.09 ? (worst - 0.09) * 3000 : 0) + over;
}

let best = make(6), bc = cost(best);
for (let round = 0; round < 60000; round++) {
  const cand = best.map(h => ({ ...h }));
  const k = Math.floor(rnd() * cand.length);
  const mode = rnd();
  if (mode < 0.4) cand[k].z = +(+cand[k].z + (rnd() * 2 - 1) * 18).toFixed(1);
  else if (mode < 0.7) cand[k].radius = +Math.max(140, cand[k].radius + (rnd() * 2 - 1) * 36).toFixed(0);
  else cand[k].height = +(+cand[k].height + (rnd() * 2 - 1) * 1.1).toFixed(2);
  cand[k].bz = cand[k].z;
  const c = cost(cand);
  if (c < bc) { best = cand; bc = c; }
}

const f = reliefOf({ baseY: 0, hills: best, pads: [] });
const row = [];
for (let z = -300; z <= 300; z += 20) row.push(`${z}:${f.heightAt(0, z).toFixed(2)}`);
console.log('невязка', bc.toFixed(4));
console.log('профиль', row.join(' '));
let worst = 0;
for (let z = -300; z <= 300; z += 2) worst = Math.max(worst, f.slopeAt(0, z).mag);
console.log('худший уклон природы', worst.toFixed(3));
const named = best.map((h, i) => ({ id: `swath_${i + 1}`, ...h }));
console.log(JSON.stringify(named));
