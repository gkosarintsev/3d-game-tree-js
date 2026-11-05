/* Авторские дороги главы 12 (этап 8a, docs/level12-relief-plan.md).

   Отметки берутся из СОБРАННОГО поля (`LEVEL_12.map.relief` — тот же кадр, что
   видит движок), поэтому террасы районов уже учтены: ни одна авторская улица не
   входит в блок района, лоты не удаляются, и поле от сборки к сборке не едет.

   Наземные улицы — полилиния, вписанная в профиль поля (Дуглас—Пекер по
   ВЕРТИКАЛЬНОМУ отклонению хорды, допуск меньше `streetFit`). Подъёмные —
   цепочка пластин и дуг, чьи отметки решает двухпроходная раскатка границ
   (`lo`/`hi`) при ограничении уклона: нижняя огибающая даёт минимальный профиль,
   поэтому настил идёт впритирку над склоном и не горбится над долиной (прямая
   хорда «низ ↔ верх» на вогнутой ветке поля закапывается).

   Прогон: `node probe/stage8-author.mjs [--write]` — печатает диагностику
   (уклоны, зазоры, опоры, фонари) и, с `--write`, правит `roads` и
   `waterways[].ramps` в брифе, затем собирает главу тем же `generateModule`, что
   и CLI: предупреждения парсера — единственный судья. */
import fs from 'node:fs';
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';
import { generateModule } from '../tools/build-level.mjs';

const PATH = 'src/levels/level-12.json';
const WRITE = process.argv.includes('--write');

const raw = JSON.parse(fs.readFileSync(PATH, 'utf8'));
const q = reliefOf({ ...LEVEL_12.map.relief });
const F = (x, z) => q.heightAt(x, z);
const DEG = Math.PI / 180;
const r3 = v => Math.round(v * 1000) / 1000;
const RISE = 0.12;      // CONFIG.jsonMap.streetRise — асфальт над полем
const CLEAR = 0.15;     // зазор подъёмного настила над полем в узлах
const MIN_GAP = 0.02;   // настил обязан остаться над полем и между узлами
const FIT_EPS = 0.04;   // допуск вписания полилинии (меньше streetFit 0,05)

const report = [];
const say = (...lines) => report.push(...lines);

// ------------------------------------------------------------ наземные улицы

/** Дуглас—Пекер по вертикали: отклонение точки от хорды, а не от её проекции. */
function decimateV(pts, eps) {
  if (pts.length < 3) return pts;
  const a = pts[0], b = pts[pts.length - 1];
  const len2 = (b.x - a.x) ** 2 + (b.z - a.z) ** 2 || 1;
  let worst = -1, idx = -1;
  for (let i = 1; i < pts.length - 1; i++) {
    const t = ((pts[i].x - a.x) * (b.x - a.x) + (pts[i].z - a.z) * (b.z - a.z)) / len2;
    const dev = Math.abs(pts[i].y - (a.y + t * (b.y - a.y)));
    if (dev > worst) { worst = dev; idx = i; }
  }
  if (worst <= eps) return [a, b];
  const left = decimateV(pts.slice(0, idx + 1), eps);
  const right = decimateV(pts.slice(idx), eps);
  return [...left.slice(0, -1), ...right];
}

/**
 * Поле ПОД КОРИТОМ дороги: максимум поперёк полосы шириной `2·hw` в точке оси.
 *
 * Тот же эталон, что `fieldAcross` в `tools/normalize-level.mjs`: пластина держит
 * одну плоскость и поперёк себя, поэтому улица, идущая поперёк склона, при
 * фиттинге по осевой закапывает один борт (замер главы 12: `rd_plate_ave`
 * шириной 10 м на склоне 0,048 м/м уходил северной половиной под грунт на
 * 0,11–0,24 м, а в переходном кольце террасы района — на 0,456 м). Автор и
 * парсер обязаны мерить один и тот же коридор, иначе отметка улицы разойдётся с
 * его же допусками.
 */
function fieldBed(x, z, tx, tz, hw) {
  const cx = -tz, cz = tx;
  return Math.max(F(x, z), F(x + cx * hw, z + cz * hw), F(x - cx * hw, z - cz * hw));
}

/** Наземная улица вдоль мировой оси, вписанная в корыто поля. `endTop` — отметка
 *  чужого полотна на стыке: без неё последний узел берёт «поле + подъём», и на
 *  Т-стыке вырастает бордюр (у проспекта плато асфальт на 0,16 м выше, чем поле
 *  под его собственным бортом). */
function ground(id, axis, at, from, to, width, { lamps = true, endTop = null, endBlend = 8 } = {}) {
  const n = Math.round(Math.abs(to - from));
  const tx = axis === 'x' ? 1 : 0, tz = axis === 'x' ? 0 : 1;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = from + (to - from) * (i / n);
    const x = axis === 'x' ? t : at;
    const z = axis === 'x' ? at : t;
    pts.push({ x, y: fieldBed(x, z, tx, tz, width / 2) + RISE, z });
  }
  if (endTop !== null) {
    // Чужое полотно на стыке — не ступень, а подъём: пин только крайнего узла
    // оставлял бы перепад в 0,31 м на последнем метре (схема красит это в
    // «уклон 0,31 круче 0,3 — неперешагиваем»), поэтому разница разливается по
    // последним `endBlend` метрам и сходит на нет к границе зоны.
    for (let i = 0; i < pts.length; i++) {
      const d = Math.abs((axis === 'x' ? pts[i].x : pts[i].z) - to);
      if (d > endBlend) continue;
      pts[i].y += (endTop - pts[i].y) * (1 - d / endBlend);
    }
    pts[pts.length - 1].y = endTop;
  }
  return {
    id, type: 'ground', width, lamps,
    points: decimateV(pts, FIT_EPS).map(p => ({ x: r3(p.x), y: r3(p.y), z: r3(p.z) })),
  };
}

/** Отметка верха наземной улицы на её осевой — та же хорда, что считает схема. */
function topAt(road, x, z) {
  const p = road.points;
  for (let i = 0; i + 1 < p.length; i++) {
    const a = p[i], b = p[i + 1];
    if (Math.abs(a.z - b.z) < 1e-6 && Math.abs(z - a.z) < 1e-6 && Math.min(a.x, b.x) - 1e-6 <= x && x <= Math.max(a.x, b.x) + 1e-6) {
      return a.y + (b.y - a.y) * (x - a.x) / ((b.x - a.x) || 1);
    }
    if (Math.abs(a.x - b.x) < 1e-6 && Math.abs(x - a.x) < 1e-6 && Math.min(a.z, b.z) - 1e-6 <= z && z <= Math.max(a.z, b.z) + 1e-6) {
      return a.y + (b.y - a.y) * (z - a.z) / ((b.z - a.z) || 1);
    }
  }
  throw new Error(`${road.id}: точки ${x}, ${z} нет на осевой`);
}

// ------------------------------------------------------ подъёмные цепочки

/**
 * Двухпроходная раскатка границ: forward ограничивает подъём (`hi`) и задаёт пол
 * (`lo` — корыто + зазор, авторский `pin`, конечная отметка), backward доводит `lo`
 * («до следующего узла обязан дотянуть») и `hi`. Ответ `lo` — минимальный
 * профиль, удовлетворяющий уклону в обе стороны.
 *
 * `monotone` — подъём между ярусами: профиль не смеет идти вниз там, где цель
 * выше старта. Без этой правки нижняя огибающая садится в каждую седловину
 * склона, и «эстакада» на середине пути ложится на грунт (замер: 0,43 м над
 * полем у z=-50), а потом снова набирает высоту — пролёт, который не является ни
 * мостом, ни насыпью. `riseMin` держит тот же подъём НЕ Horizontalнее заданного:
 * плоский пролёт над улицей не получает льготы «съезда перекрывает дорогу»
 * (`d.ramp && hit.kind === 'road'` в нормализаторе), поэтому колонна в плане
 * набережной стала бы предупреждением, а не молчанием.
 */
function solvePath(nodes, { grade, yStart, yEnd, monotone = false, riseMin = 0 }) {
  const m = nodes.length;
  const L = i => nodes[i].s - nodes[i - 1].s;
  const pinOf = i => (nodes[i].pin !== undefined ? nodes[i].pin : (i === m - 1 ? yEnd : undefined));
  const lo = new Array(m), hi = new Array(m);
  lo[0] = hi[0] = pinOf(0) ?? yStart;
  for (let i = 1; i < m; i++) {
    const pin = pinOf(i);
    // Пин — это отметка чужого полотна (улица, к которой прижат нос), и она
    // держит над полем ровно `streetRise`. Требовать сверху ещё и `CLEAR`
    // значит спорить с собственной стыковкой: на плоском плато pin < поле+0,15,
    // и огибающая стала бы пустой. Полевой запас действует только для узла,
    // который ни к чему не прижат.
    lo[i] = Math.max(pin ?? ((nodes[i].bed ?? F(nodes[i].x, nodes[i].z)) + CLEAR), nodes[i].floor ?? -Infinity, lo[i - 1] - grade * L(i));
    hi[i] = hi[i - 1] + grade * L(i);
    if (pin !== undefined) { lo[i] = Math.max(lo[i], pin); hi[i] = Math.min(hi[i], pin); }
  }
  for (let i = m - 2; i >= 0; i--) {
    lo[i] = Math.max(lo[i], lo[i + 1] - grade * L(i + 1));
    hi[i] = Math.min(hi[i], hi[i + 1] + grade * L(i + 1));
    if (pinOf(i) !== undefined) lo[i] = hi[i] = pinOf(i);
  }
  for (let i = 0; i < m; i++) {
    if (lo[i] > hi[i] + 1e-6) {
      throw new Error(`узел ${i} (${nodes[i].x}, ${nodes[i].z}): уклон ${grade} не примиряет [${lo[i].toFixed(2)}, ${hi[i].toFixed(2)}]`);
    }
  }
  if (monotone) {
    for (let i = 1; i < m; i++) {
      // подъём наращивается ровно до потолка: верхний узел и так прижат пином
      // (полотном принимающей улицы), а требовать от него ещё и `riseMin` —
      // значит поставить нос выше того асфальта, к которому он пристыкован
      const v = Math.min(hi[i], Math.max(lo[i], lo[i - 1] + riseMin * L(i)));
      if (v > hi[i] + 1e-6) {
        throw new Error(`узел ${i} (${nodes[i].x}, ${nodes[i].z}): монотонный подъём требует ${v.toFixed(2)} м при потолке ${hi[i].toFixed(2)} м`);
      }
      lo[i] = v;
    }
  }
  return lo;
}

/** Нарастающая длина пути: у дуги — по её осевой, у прямой — хордой. */
function reindex(nodes) {
  nodes[0].s = 0;
  let s = 0;
  for (let k = 1; k < nodes.length; k++) {
    s += nodes[k].arc ? nodes[k].arcLen : Math.hypot(nodes[k].x - nodes[k - 1].x, nodes[k].z - nodes[k - 1].z);
    nodes[k].s = s;
  }
  return nodes;
}

/**
 * Цепочка → элементы. Пластину мельчим вставкой узла там, где хорда полезла под
 * склон (между узлами поле ничем не ограничено), дугу разбить нельзя — ей
 * поднимаем оба конца на промах профиля, иначе сектор закапается в середину
 * холма, а картинка настила и опора перестанут сходиться с полем.
 */
function buildRun(name, nodes, { grade, rails = true, width, yEnd, monotone = false, riseMin = 0, splitMax = 80 }) {
  reindex(nodes);
  const hw = width / 2;
  // Касательная узла — по соседним узлам: `cornerArc` строит дугу касательной к
  // обеим ногам, поэтому средняя по ногам даёт и направление дуги на её срезах.
  const tangent = (ax, az, bx, bz) => {
    const L = Math.hypot(bx - ax, bz - az) || 1;
    return { tx: (bx - ax) / L, tz: (bz - az) / L };
  };
  const tagBeds = () => {
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[Math.max(0, i - 1)], q = nodes[Math.min(nodes.length - 1, i + 1)];
      const g = tangent(p.x, p.z, q.x, q.z);
      nodes[i].bed = fieldBed(nodes[i].x, nodes[i].z, g.tx, g.tz, hw);
    }
  };
  tagBeds();
  const opts = { grade, yStart: nodes[0].pin, yEnd, monotone, riseMin };
  let marks = solvePath(nodes, opts);
  let dips = 0, arcLifts = 0;
  const profileGap = (i, k) => {
    const a = nodes[i], b = nodes[i + 1];
    let worst = Infinity;
    if (b.arc) {
      const ar = b.arc, span = (ar.to - ar.from) * DEG, sgn = ar.to > ar.from ? 1 : -1;
      for (let s = 0; s <= 40; s++) {
        const t = s / 40, th = ar.from * DEG + span * t;
        const px = ar.cx + ar.R * Math.cos(th), pz = ar.cz + ar.R * Math.sin(th);
        worst = Math.min(worst, marks[i] + (marks[i + 1] - marks[i]) * t
          - fieldBed(px, pz, -Math.sin(th) * sgn, Math.cos(th) * sgn, hw) - MIN_GAP);
      }
    } else {
      const g = tangent(a.x, a.z, b.x, b.z);
      for (let s = 0; s <= 40; s++) {
        const t = s / 40;
        const px = a.x + (b.x - a.x) * t, pz = a.z + (b.z - a.z) * t;
        worst = Math.min(worst, marks[i] + (marks[i + 1] - marks[i]) * t
          - fieldBed(px, pz, g.tx, g.tz, hw) - MIN_GAP);
      }
    }
    return worst;
  };
  for (let iter = 0; iter < splitMax; iter++) {
    let worst = 0, wi = -1, wt = 0.5;
    for (let i = 0; i + 1 < nodes.length; i++) {
      if (nodes[i + 1].arc) continue;
      const a = nodes[i], b = nodes[i + 1];
      const g = tangent(a.x, a.z, b.x, b.z);
      for (let k = 1; k < 20; k++) {
        const t = k / 20;
        const px = a.x + (b.x - a.x) * t, pz = a.z + (b.z - a.z) * t;
        const gap = marks[i] + (marks[i + 1] - marks[i]) * t - fieldBed(px, pz, g.tx, g.tz, hw) - MIN_GAP;
        if (gap < 0 && -gap > worst) { worst = -gap; wi = i; wt = t; }
      }
    }
    if (wi >= 0) {
      dips++;
      const a = nodes[wi], b = nodes[wi + 1];
      nodes.splice(wi + 1, 0, { x: r3(a.x + (b.x - a.x) * wt), z: r3(a.z + (b.z - a.z) * wt) });
      reindex(nodes);
      tagBeds();
      marks = solvePath(nodes, opts);
      continue;
    }
    // провисающая дуга: поднимаем её концы на мерку промаха
    let ai = -1, ad = 0;
    for (let i = 0; i + 1 < nodes.length; i++) {
      if (!nodes[i + 1].arc) continue;
      const g = profileGap(i);
      if (g < 0 && -g > ad) { ad = -g; ai = i; }
    }
    if (ai < 0) break;
    arcLifts++;
    for (const k of [ai, ai + 1]) {
      nodes[k].floor = Math.max(nodes[k].floor ?? -Infinity, r3(marks[k] + ad + 0.1));
    }
    marks = solvePath(nodes, opts);
  }
  const elements = [];
  let worstGrade = 0, worstGap = Infinity;
  for (let i = 0; i + 1 < nodes.length; i++) {
    const a = nodes[i], b = nodes[i + 1];
    if (b.arc) {
      const ar = b.arc;
      elements.push({
        arc: {
          cx: r3(ar.cx), cz: r3(ar.cz), radius: r3(ar.R), width,
          from: r3(ar.from), to: r3(ar.to), y: [r3(marks[i]), r3(marks[i + 1])],
          bank: ar.bank, rails,
        },
      });
      worstGap = Math.min(worstGap, profileGap(i));
      worstGrade = Math.max(worstGrade, Math.abs(marks[i + 1] - marks[i]) / b.arcLen);
      continue;
    }
    const L = Math.hypot(b.x - a.x, b.z - a.z);
    elements.push({
      plate: {
        x: r3((a.x + b.x) / 2), z: r3((a.z + b.z) / 2),
        yaw: r3(Math.atan2(b.z - a.z, b.x - a.x) / DEG),
        length: r3(L), width, y: r3(marks[i]), rise: r3(marks[i + 1] - marks[i]), rails,
      },
    });
    worstGrade = Math.max(worstGrade, Math.abs(marks[i + 1] - marks[i]) / L);
    worstGap = Math.min(worstGap, profileGap(i));
  }
  // излом в стыке: касательная конца элемента против касательной начала
  // следующего. Дуга изгибается плавно, пластина прямая, поэтому угол считается
  // по направлению оси — он и есть «сломался ли поворот» на глаз
  let worstKink = 0, kinkAt = '';
  for (let i = 0; i + 1 < elements.length; i++) {
    const a = elements[i], b = elements[i + 1];
    const dirAt = (el, end) => (el.arc
      ? (() => {
        const th = (end ? el.arc.to : el.arc.from) * DEG, sgn = el.arc.to > el.arc.from ? 1 : -1;
        return { x: -Math.sin(th) * sgn, z: Math.cos(th) * sgn };
      })()
      : { x: Math.cos(el.plate.yaw * DEG), z: Math.sin(el.plate.yaw * DEG) });
    const u = dirAt(a, true), v = dirAt(b, false);
    const ang = Math.abs(Math.atan2(u.x * v.z - u.z * v.x, u.x * v.x + u.z * v.z)) / DEG;
    if (ang > worstKink) { worstKink = ang; kinkAt = `${i}→${i + 1}`; }
  }
  say(`  · ${name}: элементов ${elements.length} (разбиений по склону ${dips}, подъёмов дуги ${arcLifts}), уклон ≤ ${worstGrade.toFixed(3)} м/м, полотно над полем не ниже ${worstGap.toFixed(2)} м, излом в стыке ≤ ${worstKink.toFixed(1)}° (${kinkAt})`);
  return { elements, marks, nodes };
}

/** Узел прямой ветки: координаты плюс опциональный `pin`/`floor`. */
const n = (x, z, extra = {}) => ({ x, z, ...extra });
/** Дуга-переход: её `x, z` — конец обхода, `arc` — параметры сектора. */
const arcNode = (x, z, arc) => ({ x, z, arc, arcLen: r3(arc.R * Math.abs(arc.to - arc.from) * DEG) });

const unit = (x, z) => { const L = Math.hypot(x, z); return { x: x / L, z: z / L }; };

/**
 * Дуга В УГЛУ ломаной, касающаяся обеих ног: узлы-концы вставляются вместо
 * вершины, поэтому стык пластина↔дуга касательный по построению, а не «примерно
 * сошёлся координатами» (перебор `turn`/`R`, чтобы конец дуги попал в нужный
 * узел, давал либо вырожденный заход, либо разрыв в полметра).
 *
 * `R` — радиус по осевой, `bank` — крен в середине сектора. Знак поворота берётся
 * из вектора ног: `cross > 0` — налево (при беге на `+z` поворот к `−x`), и центр
 * лежит с той же стороны от касательной. Касательная ноги `T = R·tan(|Δ|/2)` не
 * должна съедать ногу: иначе дуга «проглотит» соседний узел и пластина нулевой
 * длины уйдёт в данные.
 */
function cornerArc(prev, vertex, next, { R, bank, name = '' }) {
  const u1 = unit(vertex.x - prev.x, vertex.z - prev.z);
  const u2 = unit(next.x - vertex.x, next.z - vertex.z);
  const cross = u1.x * u2.z - u1.z * u2.x;
  const d = Math.atan2(cross, u1.x * u2.x + u1.z * u2.z);
  if (Math.abs(d) < 0.02 * DEG) throw new Error(`${name}: вершина ${vertex.x}, ${vertex.z} прямая — дуга не нужна`);
  const T = R * Math.tan(Math.abs(d) / 2);
  const leg = Math.min(Math.hypot(vertex.x - prev.x, vertex.z - prev.z), Math.hypot(next.x - vertex.x, next.z - vertex.z));
  if (T > 0.45 * leg) throw new Error(`${name}: дуга R=${R} при повороте ${(d / DEG).toFixed(0)}° съедает ногу — касательная ${T.toFixed(1)} м против ${leg.toFixed(1)} м`);
  const A = { x: vertex.x - u1.x * T, z: vertex.z - u1.z * T };
  const B = { x: vertex.x + u2.x * T, z: vertex.z + u2.z * T };
  const s = d > 0 ? 1 : -1;
  const C = { x: A.x - s * u1.z * R, z: A.z + s * u1.x * R };
  // `pos(θ) = C + R·(cos θ, sin θ)` даёт направление `(−sin θ, cos θ)` при РАСТУЩЕМ
  // θ и противоположное при убывающем: у поворота направо угол уменьшается, и θ
  // входа берётся из другой ветки, иначе сектор стартует диаметрально
  // противоположной точкой и едет не туда, где его ждёт пластина
  const th1 = (s > 0 ? Math.atan2(-u1.x, u1.z) : Math.atan2(u1.x, -u1.z)) / DEG;
  return [
    n(r3(A.x), r3(A.z)),
    arcNode(r3(B.x), r3(B.z), { cx: r3(C.x), cz: r3(C.z), R, from: r3(th1), to: r3(th1 + d / DEG), bank }),
  ];
}

// ------------------------------------------------------------- сеть главы 12

const roads = [];
const NOTE = [];

// — ярус 0: набережные и улицы низины (подушка `lowland_port` держит поле 0,000).
//   Русло по `z` занимает −150…−90, поэтому береговой улицей низины является
//   набережная: отдельная `rd_bank_ave` между каналом и набережной попала бы под
//   горбы мостов там, где настил уже опустился до 0,97 м, и под ним не пройти.
//   Парсер об этом молчит: он меряет зазор от плоскости земли (`ground.y`), а не
//   от асфальта улицы, которую перекрыл чужой пролёт.
const quayS = ground('rd_quay_s', 'x', -170, -280, 280, 10);
const quayN = ground('rd_quay_n', 'x', -69, -280, 280, 10);
const portAve = ground('rd_port_ave', 'z', -20, -290, -175, 8);
const lowLink = ground('rd_low_link', 'x', -250, -90, 50, 8);
roads.push(quayS, quayN, portAve, lowLink);

// — ярус 1: avenues плато и склона
const plateAve = ground('rd_plate_ave', 'x', 118, -280, 280, 10);
// Нос склоновой авеню прижат к асфальту проспекта плато: поле под бортом
// проспекта на 0,16 м ниже его же полотна, и «поле + подъём» дало бы на стыке
// бордюр, по которому нога идёт с ступенью.
const scarpAve = ground('rd_scarp_ave', 'z', -160, -64, 113, 10, { endTop: topAt(plateAve, -160, 118) });
roads.push(plateAve, scarpAve);

// — переправы: три горбатых моста, торцы строго на борта набережных
const hump = (id, x) => {
  const P = (z0, z1, y, rise) => ({
    plate: { x, z: r3((z0 + z1) / 2), yaw: 90, length: r3(z1 - z0), width: 12, y, rise, rails: true },
  });
  return {
    id, type: 'bridge', width: 12, lamps: true,
    elements: [P(-165, -135, RISE, 2.88), P(-135, -104.5, 3, 0), P(-104.5, -74, 3, -2.88)],
  };
};
roads.push(hump('br_west', -192), hump('br_mid', 60), hump('br_east', 170));

// — эстакада: связка ярусов над берегом. Пол на середине русла держит проход
//   ≥ 1,6 м над «полем — подушка низины» (схема требует ≥ `bridgeMinHeight`),
//   узел -117, а не -120, — чтобы станции опор (⋅⋅⋅ ≡ начало + 6 mod 12) не встали
//   в береговую стенку на -90. Над подэстакадной улицей — 3,4 м как ПОЛ, а не как
//   отметка: цепочка обязана набирать ход (`riseMin`), иначе над набережной
//   ляжет плоский пролёт, и его колонна в асфальте улицы станет предупреждением,
//   а не молчанием съезда.
const flyTop = r3(topAt(plateAve, -60, 118));
const fly = buildRun('rd_fly_e', [
  n(-60, -165, { pin: RISE }),
  n(-60, -117, { floor: 1.6 }),
  n(-60, -83, { floor: 3.4 }),
  n(-60, -50),
  n(-60, -20),
  n(-60, 20),
  n(-60, 60),
  n(-60, 113, { pin: flyTop }),
], { grade: 0.06, width: 8, monotone: true, riseMin: 0.045 });
roads.push({ id: 'rd_fly_e', type: 'bridge', width: 8, lamps: false, elements: fly.elements });
NOTE.push(`эстакада x=-60: 0,12 → ${flyTop} м на ${r3(fly.nodes.at(-1).s)} м пути`);

// — развязка: длинный диагональный подъём по склону с двумя банкованными дугами.
//   Поле главы зависит от `z` (капсулы идут из −340 в +340 по X), поэтому прямо
//   на север склон набирается круче 6 %: максимум `0,117 м/м` в полосе z ≈ −25…−5.
//   Чтобы полотно шло по склону, а не над ним на колоннах, нога обязана в этой
//   полосе идти под 70° к меридиану (0,117·cos70 = 0,040) и распрямляться к 50°
//   там, где склон пологий (0,079·cos50 = 0,051). Два поворота — дугами с креном,
//   вписанными в углы ломаной (`cornerArc`): стык пластина↔дуга касательный, а не
//   подобранный координатами. Хвост касается восточного конца набережной, нос —
//   асфальта проспекта плато.
//   Первый узел после хвоста поднят `floor`-ом: схема v2 меряет «мост» от плоской
//   земли (`ground.y = 0`), а не от поля, и настил над низиной обязан торчать на
//   `bridgeMinHeight`, иначе предупреждение «под ним не пройти». Нога хвоста ради
//   этого удлинена: набрать 1,2 м при 6 % можно не раньше чем через 20 м пути.
const xTop = r3(topAt(plateAve, 19, 118));
const p0 = n(272, -64, { pin: RISE });
const v1 = n(238, -28), v2 = n(147, 5), v3 = n(19, 113);
const [a1, g1] = cornerArc(p0, v1, v2, { R: 90, bank: 6, name: 'развязка/низ' });
const [a2, g2] = cornerArc(v1, v2, v3, { R: 100, bank: 6, name: 'развязка/верх' });
a1.floor = 1.35;
const xs = buildRun('rd_x_east', [
  p0, a1, g1, a2, g2,
  n(19, 113, { pin: xTop }),
], { grade: 0.06, width: 8, yEnd: xTop });
roads.push({ id: 'rd_x_east', type: 'bridge', width: 8, lamps: false, elements: xs.elements });
NOTE.push(`развязка: 0,12 → ${xTop} м на ${r3(xs.nodes.at(-1).s)} м пути, дуги `
  + (xs.elements.some(e => e.arc)
    ? xs.elements.filter(e => e.arc).map(e => `R ${r3(e.arc.radius)} м на ${r3(Math.abs(e.arc.to - e.arc.from))}°, крен ${e.arc.bank}°`).join(' + ')
    : 'без дуг'));

// — сходы в русло: южный берег и x, не совпадающие со станциями фонарей
//   (те стоят на `from + 10 + 20k`, при начале −280 это x ≡ 10 mod 20)
raw.waterways[0].ramps = [
  { at: { x: -260, z: -125 }, width: 6 },
  { at: { x: -20, z: -125 }, width: 6 },
  { at: { x: 100, z: -125 }, width: 6 },
  { at: { x: 260, z: -125 }, width: 6 },
];
raw.roads = roads;

// ------------------------------------------------- доминанты верхнего яруса

// Иглы делового центра стоят севернее проспекта плато (его асфальт — z 113…123),
// фасадом на него. Косой дом торцом перехода не отпускается: и дверь, и плита
// кровли лежат в осях дома, а мировой прямоугольник настила сравнивается с его
// локальным планом (схема требует `!b.rotation`), поэтому мост дают соосная
// неповёрнутая пара, а третья игла стоит под 12° — авторская застройка тоже не
// параллельна северу.
const FH = 4;            // м: этаж иглы — и ритм фасада, и подъём марша
const NEEDLES = [
  { id: 'corp_needle_a', name: 'Игла западная', x0: -34, x1: -12, z0: 127, z1: 149, floors: 6, rot: 0 },
  { id: 'corp_needle_b', name: 'Игла восточная', x0: 6, x1: 28, z0: 127, z1: 149, floors: 8, rot: 0 },
  { id: 'corp_needle_c', name: 'Башня под углом', x0: 70, x1: 92, z0: 127, z1: 149, floors: 5, rot: 12 },
];
// Общая подошва пары: у двух башен под переходом кровли и этажи обязаны сойтись
// в допуске `skybridgeFit`. Берём её равной отметке террасы `ncc`, а не полю под
// собственным центром: фронт застройки лежит на склоне между проспектом (13,1) и
// кварталом (14,78), и площадка корпуса с отметкой «как поле в моём центре»
// вырыла бы яму у южного края района — перекрёстки и прогоны `ncc` получили бы
// расхождение с полем 0,10–0,27 м при пределе 0,05. Одна отметка на квартал и
// фронт — терраса, а не отдельные пятачки.
const NCC_TERRACE = (LEVEL_12.map.relief.pads.find(p => p.id === 'ncc:терраса') ?? {}).y;
const BASE_Y = r3(NCC_TERRACE ?? Math.max(
  F((NEEDLES[0].x0 + NEEDLES[0].x1) / 2, (NEEDLES[0].z0 + NEEDLES[0].z1) / 2),
  F((NEEDLES[1].x0 + NEEDLES[1].x1) / 2, (NEEDLES[1].z0 + NEEDLES[1].z1) / 2)));
const RECT = t => [{ x: t.x0, z: t.z0 }, { x: t.x1, z: t.z0 }, { x: t.x1, z: t.z1 }, { x: t.x0, z: t.z1 }];
const FLOOR_TYPE = k => (k === 0 ? 'lobby' : k % 4 === 3 ? 'utility' : 'office');

/** Дом-башня: комнаты по всем этажам (план = footprint), цепочка маршей от пола
 *  до кровли и вход в фасад, обращённый на проспект. Шахты маршей стоят у двух
 *  внутренних граней и чередуются — тот же ритм, что у иглы главы 10. */
function needle(t, { doorBridge = false } = {}) {
  const fp = RECT(t);
  const rooms = [];
  const stairs = [];
  for (let k = 0; k < t.floors; k++) {
    const conns = [];
    if (k === 0) {
      conns.push({ target: 'rd_plate_ave', portalPosition: { x: r3((t.x0 + t.x1) / 2), y: 0, z: t.z0 }, linkType: 'main_entrance' });
    }
    if (doorBridge && k === 4) {
      // проём перехода — в стене, обращённой к соседу по мосту
      const east = t.x0 < 0;
      conns.push({
        target: 'sb_needles',
        portalPosition: { x: east ? t.x1 : t.x0, y: r3(BASE_Y + 4 * FH), z: (t.z0 + t.z1) / 2 },
        linkType: 'door',
      });
    }
    rooms.push({ id: `${t.id}_r${k}`, floor: k, type: FLOOR_TYPE(k), polygon: fp, ...(conns.length ? { connections: conns } : {}) });
    if (k < t.floors - 1) {
      const west = k % 2 === 0;
      stairs.push({
        id: `${t.id}_s${k}`, type: 'straight', connectsFloors: [k, k + 1],
        position: { x: west ? r3(t.x0 + 6) : r3(t.x1 - 6), z: west ? r3(t.z1 - 6) : r3(t.z0 + 6) },
        dimensions: { width: 6, length: 4 },
      });
    }
  }
  stairs.push({
    id: `${t.id}_roof`, type: 'ladder', connectsFloors: [t.floors - 1, t.floors],
    position: { x: r3((t.x0 + t.x1) / 2 - (t.x0 < 0 ? 5 : -5)), z: r3((t.z0 + t.z1) / 2) },
  });
  return {
    id: t.id, name: t.name, floorsCount: t.floors, floorHeight: FH, baseY: BASE_Y,
    facadeMaterial: 'glass_steel', roof: { walkable: true, parapet: 1.1 },
    ...(t.rot ? { rotation: t.rot } : {}),
    footprint: fp, rooms, stairs,
  };
}

const buildings = NEEDLES.map((t, i) => needle(t, { doorBridge: i < 2 }));
const bridgeY = r3(BASE_Y + 4 * FH);
roads.push({
  id: 'sb_needles', type: 'skybridge', width: 3.4, lamps: true,
  points: [{ x: NEEDLES[0].x1 - 1, y: bridgeY, z: (NEEDLES[0].z0 + NEEDLES[0].z1) / 2 },
    { x: NEEDLES[1].x0 + 1, y: bridgeY, z: (NEEDLES[1].z0 + NEEDLES[1].z1) / 2 }],
});
raw.roads = roads;
raw.buildings = buildings;

// — площадка фронта: одна плоская площадь перед иглами, а не три отдельных
//   пятачка. Отметка корпуса 14,78 над полем 13,86 требует кольца ~20 м, и
//   нормализатор честно говорит «не хватает переходной зоны 120 м»: у одиночной
//   площадки на склоне уклон перехода 0,142 при пределе 0,12. Под общей
//   площадкой поле уже выровнено, поэтому площадки корпусов вносят нулевой перепад.
const FRONT = { id: 'plate_front', minX: -50, maxX: 100, minZ: 122, maxZ: 152, y: BASE_Y };
raw.relief.pads = (raw.relief.pads ?? []).filter(p => p.id !== FRONT.id);
raw.relief.pads.push(FRONT);

// — площадь между восточной иглой и башней под углом и крона набережной:
//   отметку каждого предмета берём из собранного поля, иначе нормализатор
//   поставит его на опору и назовёт расхождение предупреждением
const prop = (id, model, x, z, scale = 1) => ({
  id, model, position: { x: r3(x), y: r3(F(x, z)), z: r3(z) },
  ...(scale !== 1 ? { scale: { x: scale, y: scale, z: scale } } : {}),
});
raw.landscapeObjects = [
  ...[-140, -100, -20, 100, 160, 220].map(x => prop(`tree_quay_${x}`, 'tree', x, -56)),
  ...[40, 48, 56].map(x => prop(`bench_plaza_${x}`, 'bench', x, 134)),
  ...[40, 56].map(x => prop(`tree_plaza_${x}`, 'tree', x, 144)),
];

// — два прожектора на иглы: ночной город читается по вертикали, а пул `sky.lights`
//   ставит огни на опорные точки улиц и башню не осветит
raw.lights = [
  raw.lights[0],
  { id: 'wash_needle_a', type: 'spot', position: { x: -23, y: r3(F(-23, 124) + 0.2), z: 124 },
    target: { x: -23, y: r3(BASE_Y + 20), z: 138 }, color: '#8ec9ff', intensity: 90, distance: 60, angle: 0.6 },
  { id: 'wash_needle_b', type: 'spot', position: { x: 17, y: r3(F(17, 124) + 0.2), z: 124 },
    target: { x: 17, y: r3(BASE_Y + 28), z: 138 }, color: '#ffd9a8', intensity: 90, distance: 70, angle: 0.6 },
];

// — точка B: кровля восточной иглы (верхний ярус), спавн — подушка порта
const exitTower = NEEDLES[1];
raw.gameplay.exit = { x: r3((exitTower.x0 + exitTower.x1) / 2), z: r3((exitTower.z0 + exitTower.z1) / 2) };
raw.metadata.hint = 'Два яруса города: порт и набережные внизу, деловой центр на холме +14 м. '
  + 'Три горбатых моста через реку, эстакада вдоль берега и развязка с банкованными дугами ведут на '
  + 'плато; оттуда — в западную иглу, по переходу между башнями и на её кровлю, где маяк.';
NOTE.push(`иглы: ${BASE_Y} м подошва, ${buildings.map(b => `${b.id} ${b.floorsCount}·${FH} м → кровля ${r3(b.baseY + b.floorsCount * FH)}`).join(', ')}, `
  + `переход sb_needles на ${bridgeY} м, точка B — кровля ${exitTower.id}`);

// ------------------------------------------------------------- диагностика

say('наземные улицы: вершин ' + roads.filter(r => r.points).reduce((a, r) => a + r.points.length, 0)
  + ' (допуск вписания ' + FIT_EPS + ' м), пластин и дуг подъёмных '
  + roads.filter(r => r.elements).reduce((a, r) => a + r.elements.length, 0));
say(...NOTE.map(t => '  · ' + t));

// Станции опор и фонарей — те же формулы, что у `bridgePillars`/`roadLamps`.
const J = { pillarSpacing: 12, pillarSection: 1.6, pillarEdge: 0.4, lampSpacing: 20, lampOffset: 1.4, deckThickness: 0.6 };
const BED = raw.waterways[0];
/** Полосы, в которых опора даёт предупреждение: береговые стенки и сходы —
 *  `kind: 'waterway'`, для них молчания нет (молчит лишь съезд над улицей). */
const FORBID = [
  { id: 'берег-юг', minX: -300, maxX: 300, minZ: -151.2, maxZ: -149.15 },
  { id: 'берег-север', minX: -300, maxX: 300, minZ: -90.85, maxZ: -88.8 },
  ...BED.ramps.map((rp, i) => ({ id: `сход${i + 1}`, minX: rp.at.x - 3.8, maxX: rp.at.x + 3.8, minZ: -164.8, maxZ: -149.8 })),
];
const ROAD_SEGS = [];
for (const r of roads.filter(r => r.type === 'ground')) {
  for (let i = 0; i + 1 < r.points.length; i++) {
    const a = r.points[i], b = r.points[i + 1], hw = r.width / 2;
    ROAD_SEGS.push({
      id: r.id, kind: 'road', road: r, a, b,
      minX: Math.min(a.x, b.x) - hw, maxX: Math.max(a.x, b.x) + hw,
      minZ: Math.min(a.z, b.z) - hw, maxZ: Math.max(a.z, b.z) + hw,
    });
  }
}
const hitsRect = (a, b, tol = 0.05) => !(a.maxX < b.minX - tol || a.minX > b.maxX + tol || a.maxZ < b.minZ - tol || a.maxZ > b.maxZ + tol);
/** Пятка опоры: над руслом — дно, иначе поле (`waterwayFoot ?? landY`). */
const footUnder = (x, z) => (x >= -300 && x <= 300
  && z > BED.points[0].z - BED.width / 2 && z < BED.points[0].z + BED.width / 2 ? BED.bedY : F(x, z));

function pillarStations(el) {
  const out = [];
  const half = J.pillarSection / 2;
  if (el.arc) {
    const ar = el.arc, span = (ar.to - ar.from) * DEG, len = ar.radius * Math.abs(span);
    const inset = ar.width / 2 - half - J.pillarEdge;
    const offs = inset >= J.pillarSection ? [-inset, inset] : [0];
    for (let s = J.pillarSpacing / 2; s < len - 0.01; s += J.pillarSpacing) {
      const th = ar.from * DEG + span * (s / len);
      for (const o of offs) {
        const rho = ar.radius + o;
        out.push({ x: ar.cx + rho * Math.cos(th), z: ar.cz + rho * Math.sin(th), top: ar.y[0] + (ar.y[1] - ar.y[0]) * (s / len) });
      }
    }
    return out;
  }
  const pl = el.plate, L = pl.length;
  const inset = pl.width / 2 - half - J.pillarEdge;
  const offs = inset >= J.pillarSection ? [-inset, inset] : [0];
  const dx = Math.cos(pl.yaw * DEG), dz = Math.sin(pl.yaw * DEG);
  for (let s = J.pillarSpacing / 2; s < L - 0.01; s += J.pillarSpacing) {
    const t = s - L / 2;
    for (const o of offs) out.push({ x: pl.x + dx * t - dz * o, z: pl.z + dz * t + dx * o, top: pl.y + (pl.rise ?? 0) * (s / L) });
  }
  return out;
}

const problems = [];
let pillarCount = 0;
for (const r of roads.filter(r => r.elements)) {
  for (const el of r.elements) {
    const inclined = el.plate ? Math.abs(el.plate.rise ?? 0) > 0.01 : Math.abs(el.arc.y[1] - el.arc.y[0]) > 0.01;
    for (const p of pillarStations(el)) {
      const bottom = p.top - J.deckThickness;
      const foot = footUnder(p.x, p.z);
      if (bottom - foot <= 1.0) continue;
      pillarCount++;
      const rect = { minX: p.x - 0.8, maxX: p.x + 0.8, minZ: p.z - 0.8, maxZ: p.z + 0.8 };
      const hit = [...FORBID, ...ROAD_SEGS].find(b => hitsRect(rect, b));
      if (hit && !(inclined && hit.kind === 'road')) problems.push(`${r.id}: опора ${r3(p.x)}, ${r3(p.z)} в ${hit.id} (низ ${r3(bottom)}, пятка ${r3(foot)})`);
    }
  }
}
say(problems.length ? `  ! опоры подъёмных в препятствиях (${problems.length}):`
  : `  · опор подъёмных ${pillarCount}: ни одна не в береговой стенке, сходе или плане улицы`,
  ...problems.map(h => '    ' + h));

/**
 * Проход под чужим пролётом: схема v2 меряет `bridgeMinHeight` от ПЛОСКОСТИ земли
 * (`ground.y`), а не от асфальта улицы, которую настил перекрывает, поэтому мост,
 * входящий в набережную под косой горкой, молча делает над чужой улицей низкий
 * свод. Здесь — та арифметика, которой нога реально упирается в потолок: подошва
 * пролёта над асфальтом не ниже `2·CONFIG.radius + запас`, иначе сфера тела
 * застревает между покрытиями.
 */
const PASS = 2 * 0.45 + 1.1;   // 2·радиус игрока + запас на выпрямленный шаг
const bottomOver = (el, x, z) => {
  const deg = DEG;
  if (el.arc) {
    const a = el.arc, rho = Math.hypot(x - a.cx, z - a.cz);
    if (Math.abs(rho - a.radius) > a.width / 2) return null;
    let th = Math.atan2(z - a.cz, x - a.cx) / deg;
    let lo = Math.min(a.from, a.to), hi = Math.max(a.from, a.to);
    while (th < lo) th += 360;
    while (th > hi + 360) th -= 360;
    if (th < lo - 1e-6 || th > hi + 1e-6) return null;
    const t = (th - a.from) / (a.to - a.from);
    return a.y[0] + (a.y[1] - a.y[0]) * t - J.deckThickness;
  }
  const p = el.plate, dx = Math.cos(p.yaw * deg), dz = Math.sin(p.yaw * deg);
  const u = (x - p.x) * dx + (z - p.z) * dz, v = -(x - p.x) * dz + (z - p.z) * dx;
  if (Math.abs(u) > p.length / 2 || Math.abs(v) > p.width / 2) return null;
  return p.y + (p.rise ?? 0) * (u + p.length / 2) / p.length - J.deckThickness;
};
const tight = [];
for (const seg of ROAD_SEGS) {
  const { a, b, road } = seg;
  const alongX = Math.abs(a.z - b.z) < 1e-6;
  const from = alongX ? a.x : a.z, to = alongX ? b.x : b.z, cross = alongX ? a.z : a.x;
  if (to - from < 0.01) continue;
  for (let t = from; t <= to + 1e-9; t += 1) {
    const x = alongX ? t : cross, z = alongX ? cross : t;
    let lowest = Infinity, who = '';
    for (const r of roads.filter((q) => q.elements)) {
      for (const el of r.elements) {
        const bottom = bottomOver(el, x, z);
        if (bottom !== null && bottom < lowest) { lowest = bottom; who = r.id; }
      }
    }
    if (lowest === Infinity) continue;
    const free = lowest - topAt(road, x, z);
    if (free < PASS) tight.push(`${road.id} @ ${r3(x)},${r3(z)}: пролёт ${who} оставляет ${r3(free)} м (норма ${r3(PASS)})`);
  }
}
say(tight.length ? `  ! низкие своды над наземными улицами (${tight.length}):`
  : `  · своды над наземными улицами: ни один пролёт не ниже ${r3(PASS)} м над чужим асфальтом`,
  ...[...new Set(tight)].map((h) => '    ' + h));

/**
 * Фонари: станции считает каждый НАСТИЛ, пластина с подъёмом фонарей не носит
 * вовсе (`roadLamps` пропускает `d.ramp`) — поэтому у подъёмных цепочек тут
 * пусто по построению.
 */
const HOLES = [...FORBID, { id: 'русло', minX: -300, maxX: 300, minZ: -150, maxZ: -90 }];
const lampBad = [];
let lampCount = 0;
for (const seg of ROAD_SEGS) {
  const { a, b, road } = seg;
  if (!road.lamps) continue;
  const alongX = Math.abs(a.z - b.z) < 1e-6;
  const from = alongX ? a.x : a.z, to = alongX ? b.x : b.z, cross = alongX ? a.z : a.x;
  if (to - from < 0.01) continue;
  const off = road.width / 2 + J.lampOffset;
  for (let t = from + J.lampSpacing / 2; t < to - 0.01; t += J.lampSpacing) {
    for (const o of [-off, off]) {
      lampCount++;
      const x = alongX ? t : cross + o, z = alongX ? cross + o : t;
      const hit = HOLES.find(h => x > h.minX && x < h.maxX && z > h.minZ && z < h.maxZ);
      if (hit) lampBad.push(`${road.id}: фонарь ${r3(x)}, ${r3(z)} в ${hit.id}`);
    }
  }
}
say(lampBad.length ? `  ! фонари наземных улиц в русле/стенке/сходе (${lampBad.length}):`
  : `  · фонарей наземных улиц ${lampCount}: ни один не встал в русло, стенку или сход`,
  ...lampBad.map(h => '    ' + h));

// --------------------------------------------------------------- сборка

if (WRITE) {
  fs.writeFileSync(PATH, JSON.stringify(raw, null, 2) + '\n', 'utf8');
  say('бриф записан: ' + PATH);
}
try {
  const built = generateModule(raw, PATH);
  const w = built.warnings;
  say(w.length ? `  ! предупреждений парсера — ${w.length}:\n` + w.map(m => '    ⚠ ' + m).join('\n')
    : '  · сборка: предупреждений парсера — 0');
  const map = JSON.parse(built.code.slice(built.code.indexOf('{'), built.code.lastIndexOf('}') + 1)).map;
  const decks = map.roads.reduce((a, r) => a + r.decks.length, 0);
  const plates = map.roads.reduce((a, r) => a + r.decks.filter(d => d.length !== undefined || d.arc).length, 0);
  const props = map.props ?? [];
  say(`  · модуль: дорог ${map.roads.length}, настилов ${decks} (пластины/дуги ${plates}), опоры ${props.filter(p => p.source === 'bridge_pillar').length}, фонари ${props.filter(p => p.model === 'lamp_post').length}, предметов ${props.length}, узлов навигации ${map.nav?.nodes?.length ?? 0}, символов ${built.code.length}`);
  say('  · авторские дороги в модуле: ' + map.roads.filter(r => /^rd_|^br_/.test(r.id)).map(r => `${r.id}:${r.decks.length}`).join(' '));
} catch (e) {
  say('  ✖ сборка не прошла:\n    ' + String(e.message ?? e).split('\n').slice(0, 40).join('\n    '));
}

console.log(report.join('\n'));
if (WRITE) console.log('\n(в бриф правятся только `roads` и `waterways[].ramps`; сборка выше — уже по новому содержимому)');
