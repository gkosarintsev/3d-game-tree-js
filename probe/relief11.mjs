/**
 * Замер перед этапом 11: насколько поле главы 12 одномерно и каково расхождение
 * картинки грунта (сетка `J.relief.meshCell`) с самим полем.
 *
 * Поле берётся из нормализованного модуля — там уже террасы районов, а не только
 * авторские холмы брифа, — поэтому проба отвечает про движок, а не про намерение
 * автора.
 */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { CONFIG } from '../src/config.js';

const J = CONFIG.jsonMap;
let m = LEVEL_12.map;
let half = m.ground.size / 2;

/**
 * Мерить другой модуль (например, закоммиченный HEAD) тем же арифметиком: `m` и
 * `half` меняются вместе, иначе «до» и «после» сравнивали бы разные дороги.
 */
export function useModule(mod) {
  m = mod.map;
  half = m.ground.size / 2;
}

/** Холмы брифа + кандидаты этого замера → поле так, как его увидит движок. */
export function fieldOf(extraHills = [], spec = m.relief) {
  return reliefOf({ ...spec, hills: [...spec.hills, ...extraHills] });
}

/** Разброс поля вдоль x при фиксированном z: ноль — поле функция только z. */
export function spreadAlongX(f) {
  const rows = [];
  for (const z of [-260, -160, -60, 0, 60, 140, 200, 260]) {
    let lo = Infinity, hi = -Infinity;
    for (let x = -half; x <= half; x += 5) {
      const y = f.heightAt(x, z);
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
    rows.push({ z, lo, hi, span: hi - lo });
  }
  return rows;
}

/**
 * Худшее расхождение линейной картинки по сетке `cell` с аналитическим полем.
 *
 * Диагональ разбиения клетки — та же, что у `PlaneGeometry` (проверено в браузере
 * на сетке 2 × 2: индексы идут `(a, b, d)`, `(b, c, d)` при `a = (i, j)`,
 * `b = (i, j+1)`, `c = (i+1, j+1)`, `d = (i+1, j)`), то есть общая диагональ —
 * **анти-диагональ** `b–d`. Взять не ту значит приписать мешу расхождение в
 * половину скручивания клетки, которого на самом деле нет: на кандидате гряды
 * это давало 0,33 м вместо 0,05.
 */
export function pictureError(f, cell = J.relief.meshCell) {
  let worst = 0, wx = 0, wz = 0;
  const n = Math.round((2 * half) / cell);
  const step = (2 * half) / n;
  const H = new Float64Array((n + 1) * (n + 1));
  for (let j = 0; j <= n; j++) {
    for (let i = 0; i <= n; i++) H[j * (n + 1) + i] = f.heightAt(-half + i * step, -half + j * step);
  }
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const x0 = -half + i * step, z0 = -half + j * step;
      const hA = H[j * (n + 1) + i], hB = H[j * (n + 1) + i + 1];
      const hC = H[(j + 1) * (n + 1) + i], hD = H[(j + 1) * (n + 1) + i + 1];
      for (const [s, t] of [[0.5, 0.5], [0.25, 0.25], [0.75, 0.75], [0.75, 0.25], [0.25, 0.75],
        [0.5, 0.2], [0.2, 0.5], [0.8, 0.5], [0.5, 0.8]]) {
        // `s` — доля вдоль x, `t` — вдоль z; `s + t <= 1` — треугольник (A, C, B)
        const lin = s + t <= 1
          ? hA + s * (hB - hA) + t * (hC - hA)
          : hD + (1 - s) * (hC - hD) + (1 - t) * (hB - hD);
        const x = x0 + s * step, z = z0 + t * step;
        const d = Math.abs(f.heightAt(x, z) - lin);
        if (d > worst) { worst = d; wx = x; wz = z; }
      }
    }
  }
  return { worst, wx, wz, verts: n + 1, step };
}

/** Максимальный уклон поля по карте (тот же `slopeAt`, что видит нога). */
export function maxSlope(f) {
  let best = 0, bx = 0, bz = 0;
  for (let x = -half + 2; x < half - 2; x += 4) {
    for (let z = -half + 2; z < half - 2; z += 4) {
      const s = f.slopeAt(x, z).mag;
      if (s > best) { best = s; bx = x; bz = z; }
    }
  }
  return { best, bx, bz };
}

/** Полотно обязан держаться выше грунта: зазор поперёк и вдоль каждой пластины. */
export function deckBurial(f) {
  let worst = Infinity, where = null, buried = 0, probes = 0;
  for (const r of m.roads) {
    for (const d of (r.decks ?? [])) {
      const rad = (d.yaw * Math.PI) / 180;
      const ux = Math.cos(rad), uz = Math.sin(rad);
      const vx = -Math.sin(rad), vz = Math.cos(rad);
      for (const u of [-0.5, -0.25, 0, 0.25, 0.5]) {
        for (const v of [-0.5, 0, 0.5]) {
          const x = d.cx + ux * d.length * u + vx * d.width * v;
          const z = d.cz + uz * d.length * u + vz * d.width * v;
          const top = d.topAtMin + (d.topAtMax - d.topAtMin) * (u + 0.5);
          const gap = top - f.heightAt(x, z);
          probes++;
          if (gap < 0) buried++;
          if (gap < worst) { worst = gap; where = `${r.id} в (${x.toFixed(1)}; ${z.toFixed(1)})`; }
        }
      }
    }
  }
  return { worst, where, buried, probes };
}

/** Цоколь здания не смеет уйти под грунт: пробы по вершинам плана и центру. */
export function buildingFooting(f) {
  let worst = Infinity, where = null, buried = 0, probes = 0;
  for (const b of m.buildings) {
    const pts = b.footprint.map(p => [p.x, p.z]);
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    pts.push([cx, cz]);
    for (const [x, z] of pts) {
      const gap = b.baseY - f.heightAt(x, z);
      probes++;
      if (gap < 0) buried++;
      if (gap < worst) { worst = gap; where = `${b.id} в (${x.toFixed(1)}; ${z.toFixed(1)})`; }
    }
  }
  return { worst, where, buried, probes };
}

/**
 * Силуэт горизонта: для каждой колонки x — высшая отметка поля на «дальнем
 * плане» (полоса z). Одномерное поле даёт один и тот же профиль в любой колонке.
 */
export function skyline(f, z0, z1) {
  const ys = [];
  for (let x = -half; x <= half; x += 20) {
    let hi = -Infinity;
    for (let z = z0; z <= z1; z += 10) hi = Math.max(hi, f.heightAt(x, z));
    ys.push(hi);
  }
  const min = Math.min(...ys), max = Math.max(...ys);
  const mean = ys.reduce((a, y) => a + y, 0) / ys.length;
  const rms = Math.sqrt(ys.reduce((a, y) => a + (y - mean) ** 2, 0) / ys.length);
  return { min, max, spread: max - min, rms };
}

export function report(label, extraHills, cell = J.relief.meshCell) {
  const f = fieldOf(extraHills);
  const e = pictureError(f, cell);
  const sl = maxSlope(f);
  const d = deckBurial(f);
  const b = buildingFooting(f);
  const far = skyline(f, 200, 300);
  console.log(`\n### ${label}`);
  console.log(`  поле: холмов ${f.hills.length}, площадок ${f.pads.length}`);
  console.log(`  картинка ${cell} м: расхождение с полем ≤ ${e.worst.toFixed(4)} м в (${e.wx.toFixed(0)}; ${e.wz.toFixed(0)}), вершин ${e.verts}²`);
  console.log(`  уклон: ≤ ${sl.best.toFixed(4)} (предел ${J.relief.hillMaxSlope}) в (${sl.bx.toFixed(0)}; ${sl.bz.toFixed(0)})`);
  console.log(`  полотна: ${d.probes} проб, закопанных ${d.buried}, худший зазор ${d.worst.toFixed(3)} м (${d.where})`);
  console.log(`  здания: ${b.probes} проб, закопанных ${b.buried}, худший цоколь ${b.worst.toFixed(3)} м (${b.where})`);
  console.log(`  горизонт z 200…300: разброс по x ${far.spread.toFixed(3)} м, СКО ${far.rms.toFixed(3)} м (${far.min.toFixed(2)}…${far.max.toFixed(2)})`);
  const sp = spreadAlongX(f);
  console.log(`  разброс вдоль x по слоям: ${sp.map(r => `${r.z}:${r.span.toFixed(2)}`).join('  ')}`);
  return { f, e, sl, d, b, far };
}

if (process.argv[2] === 'base') report('база: закоммиченное поле главы 12', []);
