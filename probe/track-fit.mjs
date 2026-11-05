/**
 * Зонд формы трассы (одноразовый): сколько дуг и пластин даёт замкнутый
 * центробежный Catmull-Rom демо-алгоритма
 * (`tools/procedural_3d_track_generator.html`), если раскладывать его полотно
 * примитивами v2 (`{plate}` + `{arc}`), и что делает с профилем предел уклона.
 *
 * Что зонд обязан ответить, до того как план главы 13 станет кодом:
 *   1. число дуг на кольцо — у каждой свой `sweep`, а `topAt` сегодня перебирает
 *      ВСЕ дуги без индекса (src/json-map.js:917);
 *   2. боковое расхождение фитa «дуга постоянного радиуса» против сплайна при
 *      допуске `J.streetFit` (0,05 м) и при грубом (0,2 м);
 *   3. профиль высот: наименьшая g-липшицева мажоранта `max_j (f_j − g·d(i,j))`
 *      держит полотно над полем и в пределах уклона, а подвес появляется только
 *      там, где поле падает быстрее, чем трасса able climb.
 *
 * Запуск: node probe/track-fit.mjs
 */
import { makeRng } from '../src/rng.js';

const DEG = Math.PI / 180;

/** Замкнутый центробежный Catmull-Rom — тот же, что `CatmullRomCurve3(p, true, 'centripetal')`. */
function crPoint(p, i, t) {
  const n = p.length;
  const at = k => p[((k % n) + n) % n];
  const d = (a, b) => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1e-6;
  const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
  const t0 = 0, t1 = t0 + Math.sqrt(d(p0, p1)), t2 = t1 + Math.sqrt(d(p1, p2)), t3 = t2 + Math.sqrt(d(p2, p3));
  const tt = t1 + (t2 - t1) * t;
  const L = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u });
  const A1 = L(p0, p1, (tt - t0) / (t1 - t0));
  const A2 = L(p1, p2, (tt - t1) / (t2 - t1));
  const A3 = L(p2, p3, (tt - t2) / (t3 - t2));
  const B1 = L(A1, A2, (tt - t0) / (t2 - t0));
  const B2 = L(A2, A3, (tt - t1) / (t3 - t1));
  return L(B1, B2, (tt - t0) / (t3 - t0));
}

/** Контрольные узлы — формула демо (`hilly`), но в метрах главы и с одним сидом. */
function controlNodes({ count, radius, jitter, ampA, ampB, rng }) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const r = radius + (rng() - 0.5) * 2 * jitter;
    out.push({
      x: Math.cos(a) * r + (rng() - 0.5) * 2 * jitter,
      z: Math.sin(a) * r + (rng() - 0.5) * 2 * jitter,
      y: Math.sin(i * 1.5) * ampA + Math.cos(i * 0.8) * ampB,
    });
  }
  return out;
}

/** Плотная выборка равномерными шагами по длине дуги; `pts` замкнут (последняя проба ≠ первой). */
function sample(nodes, step) {
  const raw = [];
  for (let i = 0; i < nodes.length; i++) for (let k = 0; k < 240; k++) raw.push(crPoint(nodes, i, k / 240));
  raw.push({ ...raw[0] });
  const cum = [0];
  for (let i = 1; i < raw.length; i++) cum.push(cum[i - 1] + Math.hypot(raw[i].x - raw[i - 1].x, raw[i].z - raw[i - 1].z));
  const total = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let s = 0; s < total - 1e-6; s += step) {
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const u = (s - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
    const a = raw[j], b = raw[j + 1];
    out.push({ s, x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, z: a.z + (b.z - a.z) * u });
  }
  return { pts: out, total };
}

/** Подписанный радиус кривизны по трём точкам (∞ на прямой), центр и знак поворота. */
function circum(a, b, c) {
  const A = Math.hypot(b.x - a.x, b.z - a.z), B = Math.hypot(c.x - b.x, c.z - b.z), C = Math.hypot(c.x - a.x, c.z - a.z);
  const cross = (b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z);
  if (Math.abs(cross) < 1e-9) return { R: Infinity, center: null, sign: 0 };
  const d = 2 * cross;
  const a2 = a.x * a.x + a.z * a.z, b2 = b.x * b.x + b.z * b.z, c2 = c.x * c.x + c.z * c.z;
  return {
    R: (A * B * C) / Math.abs(d),
    center: {
      x: (a2 * (b.z - c.z) + b2 * (c.z - a.z) + c2 * (a.z - b.z)) / d,
      z: (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d,
    },
    sign: Math.sign(cross),
  };
}

/** Отстояние interior-точек [i0+1, i1) от дуги (центр, радиус) или от хорды, если центра нет. */
function dev(pts, i0, i1, center, R) {
  const n = pts.length;
  let worst = 0;
  for (let k = i0 + 1; k < i1; k++) {
    const p = pts[k % n];
    if (center) worst = Math.max(worst, Math.abs(Math.hypot(p.x - center.x, p.z - center.z) - R));
    else {
      const a = pts[i0 % n], b = pts[i1 % n];
      const dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz || 1e-9;
      const t = ((p.x - a.x) * dx + (p.z - a.z) * dz) / L2;
      worst = Math.max(worst, Math.hypot(p.x - (a.x + dx * t), p.z - (a.z + dz * t)));
    }
  }
  return worst;
}

/** Длина по развёрнутой выборке между её индексами. */
const along = (pts, a, b) => pts[b].s - pts[a].s;

/**
 * Кусочно-постоянная кривизна. Сглаженная кривизна режет кольцо на прогоны одного
 * знака; внутри прогона дуга растёт, пока её вписанная окружность держит и боковой
 * допуск, и полосу радиуса; прямые прогоны отдают пластины, резанные тем же
 * допуском по хорде. Индексы — из развёртки на два витка, чтобы сегмент через шов
 * не обрывался.
 */
function fit(pts, { tol = 0.05, win = 5, maxLen = 160, straightR = 400, band = 0.35 }) {
  const n = pts.length;
  const ptsU = pts.concat(pts.map(p => ({ ...p, s: p.s + along(pts, 0, n - 1) + 1 })));
  const rad = i => {
    const { R, sign } = circum(ptsU[i - win], ptsU[i], ptsU[i + win]);
    return sign * R;
  };
  const segs = [];
  let i = n;                      // старт со второго витка: слева есть полный запас проб
  const stop = n + n - win - 1;
  let guard = 0;
  while (i < stop && guard++ < 500) {
    const straightNow = Math.abs(rad(i)) > straightR;
    let j = i + 1;
    while (j < stop && j - i < 4000) {
      const r = rad(j);
      if (Math.abs(r) > straightR !== straightNow || (!straightNow && Math.sign(r) !== Math.sign(rad(i)))) break;
      j++;
    }
    if (straightNow) {
      let a = i;
      while (a < j - 1) {
        let b = Math.min(a + 2, j);
        while (b + 1 <= j && dev(ptsU, a, b + 1, null, 0) <= tol && along(ptsU, a, b + 1) <= maxLen) b++;
        segs.push({ kind: 'plate', i0: a - n, i1: b - n, len: along(ptsU, a, b), d: dev(ptsU, a, b, null, 0) });
        a = b;
      }
      i = j;
      continue;
    }
    let a = i;
    while (a < j - 3) {
      let b = a + 3;
      let cur = circum(ptsU[a], ptsU[(a + b) >> 1], ptsU[b]);
      while (b + 1 <= j && along(ptsU, a, b + 1) <= maxLen) {
        const next = circum(ptsU[a], ptsU[(a + b + 1) >> 1], ptsU[b + 1]);
        if (next.R === Infinity || Math.sign(next.R) !== Math.sign(cur.R)) break;
        if (Math.abs(next.R - cur.R) > band * cur.R) break;
        if (dev(ptsU, a, b + 1, next.center, next.R) > tol) break;
        b++; cur = next;
      }
      segs.push({ kind: 'arc', i0: a - n, i1: b - n, R: cur.R, center: cur.center, d: dev(ptsU, a, b, cur.center, cur.R), turn: Math.abs(along(ptsU, a, b)) / cur.R });
      a = b;
    }
    i = j;
  }
  return { segs, ptsU };
}

/**
 * Наименьшая g-липшицева мажоранта требования f на окружности:
 * `deck_i = max_j (f_j − g·d(i,j))`, d — короткое расстояние вокруг петли.
 * Полотно ≥ f (зазор), |Δполотна| ≤ g·Δs (уклон), и лишнего подвеса нет нигде,
 * кроме мест, где f падает быстрее, чем трасса able climb.
 */
function deckProfile(pts, f, g, total) {
  const n = pts.length;
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    let best = -Infinity;
    for (let j = 0; j < n; j++) {
      const raw = Math.abs(pts[j].s - pts[i].s);
      best = Math.max(best, f[j] - g * Math.min(raw, total - raw));
    }
    out[i] = best;
  }
  return out;
}

// ---- прогоны ----------------------------------------------------------------

for (const c of [{ count: 12, jitter: 18 }, { count: 10, jitter: 14 }, { count: 8, jitter: 10 }, { count: 6, jitter: 0 }]) {
  for (const tol of [0.05, 0.2]) {
    const rng = makeRng(20261104);
    const nodes = controlNodes({ ...c, radius: 110, ampA: 4, ampB: 3, rng });
    const { pts, total } = sample(nodes, 1);
    const { segs } = fit(pts, { tol });
    const arcs = segs.filter(s => s.kind === 'arc');
    const plates = segs.filter(s => s.kind === 'plate');
    const covered = segs.reduce((a, s) => a + Math.abs(s.i1 - s.i0), 0);
    const worst = Math.max(0, ...segs.map(s => s.d));
    console.log(`узлов ${String(c.count).padStart(2)} джиттер ±${String(c.jitter).padStart(2)} допуск ${tol}: `
      + `элементов ${String(segs.length).padStart(3)} (дуг ${String(arcs.length).padStart(2)} + пластин ${String(plates.length).padStart(2)}), `
      + `длина ${total.toFixed(0)} м, R ${arcs.length ? `${Math.min(...arcs.map(a => a.R)).toFixed(0)}…${Math.max(...arcs.map(a => a.R)).toFixed(0)}` : '—'} м, `
      + `макс. угол дуги ${(arcs.length ? Math.max(...arcs.map(a => Math.abs(a.turn) / DEG)) : 0).toFixed(0)}°, `
      + `худшее отклонение ${worst.toFixed(3)} м, покрыто ${covered}/${pts.length}`);
  }
}

// профиль высот на том же кольце: поле-синусоида с уклоном ≤ relief.maxSlope
{
  const rng = makeRng(20261104);
  const nodes = controlNodes({ count: 10, jitter: 14, radius: 110, ampA: 4, ampB: 3, rng });
  const { pts, total } = sample(nodes, 1);
  const CLEAR = 3;
  const field = pts.map(p => 6 * Math.sin(2 * Math.PI * p.s / 300));
  const req = pts.map((p, i) => Math.max(field[i] + CLEAR, p.y));
  const range = Math.max(...req) - Math.min(...req);
  console.log(`\nпетля ${total.toFixed(0)} м, требование (поле+зазор ∪ авторский профиль) `
    + `${Math.min(...req).toFixed(2)}…${Math.max(...req).toFixed(2)} м, разброс ${range.toFixed(2)} м`);
  console.log(`предел уклона без подвеса: g ≥ 2·разброс/длину = ${(2 * range / total).toFixed(4)}`);
  for (const g of [0.03, 0.05, 0.08]) {
    const deck = deckProfile(pts, req, g, total);
    let slope = 0, clearMin = Infinity, clearMax = 0, lift = 0;
    for (let i = 0; i < deck.length; i++) {
      const ni = (i + 1) % deck.length;
      slope = Math.max(slope, Math.abs(deck[ni] - deck[i]) / (Math.abs(pts[ni].s - pts[i].s) || 1e-9));
      clearMin = Math.min(clearMin, deck[i] - field[i]);
      clearMax = Math.max(clearMax, deck[i] - field[i]);
      lift = Math.max(lift, deck[i] - req[i]);
    }
    console.log(`g=${g}: уклон полотна ${slope.toFixed(4)}, зазор до поля ${clearMin.toFixed(2)}…${clearMax.toFixed(2)} м, `
      + `подвес над требованием максимум ${lift.toFixed(2)} м, отметки полотна ${Math.min(...deck).toFixed(2)}…${Math.max(...deck).toFixed(2)} м`);
  }
}
