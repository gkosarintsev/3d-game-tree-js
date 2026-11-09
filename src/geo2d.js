/**
 * Плоская геометрия уровня в плане (XZ): полигоны с рёбрами по осям, растер
 * клеток и раскладка полигона в союз прямоугольников. THREE не зависит, поэтому
 * модуль общий для обоих берегов пайплайна: его берут и инструменты Node
 * (валидатор схемы и нормализатор), и карта браузера (src/json-map.js).
 *
 * Одно и то же решение «комната внутри footprint», «пролёт лестницы не в
 * комнате», «перекрытие минус проём» должно быть у парсера и у карты: иначе
 * парсер пропускает то, на чём карта строит невидимую стену или дыру в полу.
 */

/** Округление координаты до миллиметра: детерминизм выхода парсера. */
export const r3 = v => Math.round(v * 1000) / 1000;

/** Допуск «ребро по оси»: косое ребро в схеме запрещено, но float может дать 1e-12. */
export const AXIS_EPS = 0.01;

/** Ключ клетки растра. */
export const cellKey = (i, j) => `${i}:${j}`;

/** Площадь полигона со знаком (знак — ориентация обхода в плане XZ). */
export function signedArea(poly) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    s += a.x * b.z - b.x * a.z;
  }
  return s / 2;
}

/**
 * Приводит полигон к виду «без повторов, против часовой, без лишних вершин на
 * прямых участках, рёбра по осям». Возвращает список ошибок — их текст собирает
 * валидатор схемы.
 * @param {{x:number, z:number}[]} points первый и последний узлы могут
 *   совпадать (явное замыкание из брифа) — дубликат убирается
 */
export function normalizePolygon(points, label, errors) {
  if (!Array.isArray(points) || points.length < 4) {
    errors.push(`${label}: в полигоне меньше четырёх вершин — фигура не замкнута`);
    return null;
  }
  const p = points.map(v => ({ x: r3(v.x), z: r3(v.z) }));
  // явное замыкание (первая == последняя) не считается вершиной
  if (p.length > 1 && p[0].x === p[p.length - 1].x && p[0].z === p[p.length - 1].z) p.pop();
  for (let i = p.length - 1; i >= 1; i--) {
    if (p[i].x === p[i - 1].x && p[i].z === p[i - 1].z) {
      errors.push(`${label}: вершина ${i} совпадает с ${i - 1} — нулевое ребро`);
      p.splice(i, 1);
    }
  }
  if (p.length < 3) {
    errors.push(`${label}: после удаления дублей осталось меньше трёх вершин`);
    return null;
  }
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    if (Math.abs(a.x - b.x) > AXIS_EPS && Math.abs(a.z - b.z) > AXIS_EPS) {
      errors.push(`${label}: ребро ${i}→${(i + 1) % p.length} не по оси X или Z — `
        + 'косые стены дают ступенчатую коллизию, схема их запрещает');
    }
  }
  if (signedArea(p) < 0) p.reverse();
  // три последовательные вершины на одной прямой — средняя лишняя: стена из
  // двух сегментов вместо одной (и лишний солид)
  for (let i = p.length - 1; i >= 0 && p.length > 3; i--) {
    const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length];
    const collinear = (a.x === b.x && b.x === c.x) || (a.z === b.z && b.z === c.z);
    if (collinear) p.splice(i, 1);
  }
  return p;
}

/** Прямоугольник вокруг полигона. */
export function polyBounds(poly) {
  const out = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const p of poly) {
    out.minX = Math.min(out.minX, p.x); out.maxX = Math.max(out.maxX, p.x);
    out.minZ = Math.min(out.minZ, p.z); out.maxZ = Math.max(out.maxZ, p.z);
  }
  return out;
}

/**
 * Лежит ли точка внутри полигона с осевыми рёбрами. Граница считается
 * внутренней: комнаты стыкуются фасадами, и «на границе» — это «внутри».
 */
export function pointInPoly(poly, x, z) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    // на горизонтальном или вертикальном ребре: луч может «перепрыгнуть»
    // вершину дважды — проверяем принадлежность грани отдельно
    if (onEdge(a, b, x, z)) return true;
    if ((a.z > z) !== (b.z > z)) {
      const t = (z - a.z) / (b.z - a.z);
      if (x < a.x + t * (b.x - a.x)) inside = !inside;
    }
  }
  return inside;
}

/** Точка на отрезке (оба конца — осевой отрезок, поэтому проверка простая). */
function onEdge(a, b, x, z) {
  if (a.x === b.x && a.x === x) return Math.min(a.z, b.z) - 1e-6 <= z && z <= Math.max(a.z, b.z) + 1e-6;
  if (a.z === b.z && a.z === z) return Math.min(a.x, b.x) - 1e-6 <= x && x <= Math.max(a.x, b.x) + 1e-6;
  return false;
}

/**
 * Растер полигона в клетки сетки шагом cell (центр клетки внутри полигона).
 * @returns {Set<string>} ключи клеток
 */
export function rasterPoly(poly, cell) {
  const b = polyBounds(poly);
  const out = new Set();
  const i0 = Math.floor(b.minX / cell), i1 = Math.floor(b.maxX / cell);
  const j0 = Math.floor(b.minZ / cell), j1 = Math.floor(b.maxZ / cell);
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      if (pointInPoly(poly, (i + 0.5) * cell, (j + 0.5) * cell)) out.add(cellKey(i, j));
    }
  }
  return out;
}

/** Растер прямоугольника теми же клетками (минимальная клетка — 1×1×cell). */
export function rasterRect(rect, cell) {
  const out = new Set();
  const i0 = Math.floor(rect.minX / cell), i1 = Math.floor((rect.maxX - 1e-9) / cell);
  const j0 = Math.floor(rect.minZ / cell), j1 = Math.floor((rect.maxZ - 1e-9) / cell);
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) out.add(cellKey(i, j));
  }
  return out;
}

/** Пересечение множеств клеток — пересекаются ли две фигуры в плане. */
export function cellsIntersect(a, b) {
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  for (const k of small) if (big.has(k)) return true;
  return false;
}

/**
 * Раскладка полигона с осевыми рёбрами в союз прямоугольников: горизонтальными
 * полосами по всем различающимся координатам Z (для L-образного — 2 прямоугольника,
 * для П-образного — 3). Полоса берётся по центру высоты, поэтому стык полос
 * не порождает ни щели, ни наложения.
 */
export function polyRects(poly) {
  const zs = [...new Set(poly.map(p => p.z))].sort((a, b) => a - b);
  const rects = [];
  for (let k = 0; k + 1 < zs.length; k++) {
    const minZ = zs[k], maxZ = zs[k + 1];
    const zc = (minZ + maxZ) / 2;
    const xs = [...new Set(poly.map(p => p.x))].sort((a, b) => a - b);
    let run = null;
    for (let i = 0; i + 1 < xs.length; i++) {
      const inside = pointInPoly(poly, (xs[i] + xs[i + 1]) / 2, zc);
      const cover = { minX: xs[i], maxX: xs[i + 1] };
      if (inside && run) run.maxX = cover.maxX;
      else if (inside) run = cover;
      else if (run) { rects.push({ ...run, minZ, maxZ }); run = null; }
    }
    if (run) rects.push({ ...run, minZ, maxZ });
  }
  // соседние полосы с одинаковым X-прогоном сливаем: лишний прямоугольник —
  // лишний солид и лишняя граница в миникарте
  const merged = [];
  for (const r of rects.sort((a, b) => a.minZ - b.minZ || a.minX - b.minX)) {
    const prev = merged[merged.length - 1];
    if (prev && prev.maxZ === r.minZ && prev.minX === r.minX && prev.maxX === r.maxX) prev.maxZ = r.maxZ;
    else merged.push({ ...r });
  }
  return merged;
}

/** Пересекаются ли прямоугольники (касание гранью — не пересечение). */
export function rectsIntersect(a, b, margin = 0) {
  return a.minX < b.maxX - margin && a.maxX > b.minX + margin &&
    a.minZ < b.maxZ - margin && a.maxZ > b.minZ + margin;
}

/**
 * Прямоугольник минус прямоугольник-проём: до четырёх полос вокруг дыры.
 * Так из плиты перекрытия вырезается лестничная шахта без дробления на сетку.
 */
export function subtractRect(rect, hole) {
  if (!rectsIntersect(rect, hole)) return [rect];
  const out = [];
  const minX = Math.max(rect.minX, hole.minX), maxX = Math.min(rect.maxX, hole.maxX);
  const minZ = Math.max(rect.minZ, hole.minZ), maxZ = Math.min(rect.maxZ, hole.maxZ);
  if (rect.minX < minX) out.push({ minX: rect.minX, maxX: minX, minZ: rect.minZ, maxZ: rect.maxZ });
  if (maxX < rect.maxX) out.push({ minX: maxX, maxX: rect.maxX, minZ: rect.minZ, maxZ: rect.maxZ });
  if (rect.minZ < minZ) out.push({ minX, maxX, minZ: rect.minZ, maxZ: minZ });
  if (maxZ < rect.maxZ) out.push({ minX, maxX, minZ: maxZ, maxZ: rect.maxZ });
  return out.filter(r => r.maxX - r.minX > 1e-6 && r.maxZ - r.minZ > 1e-6);
}

/** Габарит двух прямоугольников (для быстрой отбраковки в коллизиях карты). */
export function unionBounds(a, b) {
  return {
    minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
    minZ: Math.min(a.minZ, b.minZ), maxZ: Math.max(a.maxZ, b.maxZ),
  };
}

// ------------------------------------------------- поворот объекта в плане (v2)
// Дом v2 остаётся прямоугольником **в своих осях**: весь расчёт парсера (стены,
// комнаты, шахты маршей, проёмы дверей) идёт в неразвёрнутом кадре, а в мир
// координаты превращает поворот вокруг центра габарита. Соглашение то же, что у
// `BoxGeometry.rotateY(θ)` и у `obb` в src/solids.js, поэтому картинка, коллизия
// и валидатор расходятся только если кто-то перепутает знак — а не потому, что
// математик две.

/**
 * Кадр поворота дома: центр его габарита и косинус с синусом. Возвращает null
 * при нулевом (или отсутствующем) угле — тогда объект живёт ровно как в v1, и
 * ни одна проверка не платит за поворот.
 */
export function frameOf(bounds, rotationDeg) {
  return frameAt((bounds.minX + bounds.maxX) / 2, (bounds.minZ + bounds.maxZ) / 2, rotationDeg);
}

/**
 * Кадр поворота по центру: пластина настила задана центром, длиной, шириной и
 * углом, а не парой точек, и собирать её габарит ради `frameOf` значило бы
 * округлять центр там, где он и так известен.
 */
export function frameAt(cx, cz, rotationDeg) {
  if (!rotationDeg) return null;
  const rad = rotationDeg * Math.PI / 180;
  return { cx, cz, deg: rotationDeg, rad, c: Math.cos(rad), s: Math.sin(rad) };
}

/** Неразвёрнутая мировая точка → точка повёрнутого объекта. */
export function rotatePoint(f, x, z) {
  if (!f) return { x, z };
  const dx = x - f.cx, dz = z - f.cz;
  return { x: f.cx + dx * f.c - dz * f.s, z: f.cz + dx * f.s + dz * f.c };
}

/** Обратное к `rotatePoint`: мировая точка → неразвёрнутый кадр объекта. */
export function unrotatePoint(f, x, z) {
  if (!f) return { x, z };
  const dx = x - f.cx, dz = z - f.cz;
  return { x: f.cx + dx * f.c + dz * f.s, z: f.cz - dx * f.s + dz * f.c };
}

/** Габарит повёрнутого прямоугольника — только broadphase'у сетки и лимиту земли. */
export function rotatedBounds(rect, f) {
  if (!f) return { minX: rect.minX, maxX: rect.maxX, minZ: rect.minZ, maxZ: rect.maxZ };
  const hx = (rect.maxX - rect.minX) / 2, hz = (rect.maxZ - rect.minZ) / 2;
  const c = Math.abs(f.c), s = Math.abs(f.s);
  const bx = f.cx + ((rect.minX + rect.maxX) / 2 - f.cx) * f.c - ((rect.minZ + rect.maxZ) / 2 - f.cz) * f.s;
  const bz = f.cz + ((rect.minX + rect.maxX) / 2 - f.cx) * f.s + ((rect.minZ + rect.maxZ) / 2 - f.cz) * f.c;
  const ex = hx * c + hz * s, ez = hx * s + hz * c;
  return { minX: bx - ex, maxX: bx + ex, minZ: bz - ez, maxZ: bz + ez };
}

/**
 * Прямоугольник неразвёрнутого кадра как ориентированная коробка в мире: габарит
 * для фильтра сетки плюс точные полуоси и угол для узкой фазы (`obb` читает
 * src/solids.js). Сам габарит решением о твёрдости не становится — это ровно то
 * запретительное правило AGENTS про внешний ассет.
 */
export function obbOf(rect, f) {
  const bounds = rotatedBounds(rect, f);
  if (!f) return { ...bounds };
  const hx = (rect.maxX - rect.minX) / 2, hz = (rect.maxZ - rect.minZ) / 2;
  const p = rotatePoint(f, (rect.minX + rect.maxX) / 2, (rect.minZ + rect.maxZ) / 2);
  return { ...bounds, obb: { cx: p.x, cz: p.z, hx, hz, c: f.c, s: f.s } };
}

/**
 * Пересечение двух фигур в плане по опорным осям (SAT): у прямоугольников,
 * вписанных в одну сетку осей, это ровно `rectsIntersect`, а с поворотным
 * объектом добавляются его собственные две оси — всего до четырёх.
 * Касание гранью, как и в `rectsIntersect`, пересечением не считается; `margin`
 * требует нахлёста глубже этого значения.
 */
function satOverlap(a, b, axes, margin) {
  for (const [ax, az] of axes) {
    const gap = Math.abs((a.cx - b.cx) * ax + (a.cz - b.cz) * az);
    if (gap >= a.r(ax, az) + b.r(ax, az) - margin) return false;
  }
  return true;
}

/** Проекция фигуры на ось: у прямоугольника — полуширина по осям мира, у OBB — по своим. */
function rectFigure(rect) {
  return {
    cx: (rect.minX + rect.maxX) / 2, cz: (rect.minZ + rect.maxZ) / 2,
    hx: (rect.maxX - rect.minX) / 2, hz: (rect.maxZ - rect.minZ) / 2,
    obb: null,
    r(ax, az) { return Math.abs(this.hx * ax) + Math.abs(this.hz * az); },
  };
}
function obbFigure(box) {
  const o = box.obb;
  if (!o) return rectFigure(box);
  return {
    cx: o.cx, cz: o.cz, hx: o.hx, hz: o.hz, obb: o,
    r(ax, az) { return Math.abs(o.hx * (ax * o.c + az * o.s)) + Math.abs(o.hz * (-ax * o.s + az * o.c)); },
  };
}

/** Повёрнутая коробка против прямоугольника мировой сетки. */
export function obbHitsRect(box, rect, margin = 0) {
  const a = obbFigure(box), b = rectFigure(rect);
  const axes = [[1, 0], [0, 1]];
  if (a.obb) axes.push([a.obb.c, a.obb.s], [-a.obb.s, a.obb.c]);
  return satOverlap(a, b, axes, margin);
}

/** Две повёрнутые коробки (дом против дома, пластина дороги против дома). */
export function obbHitsObb(aBox, bBox, margin = 0) {
  const a = obbFigure(aBox), b = obbFigure(bBox);
  const axes = [[1, 0], [0, 1]];
  if (a.obb) axes.push([a.obb.c, a.obb.s], [-a.obb.s, a.obb.c]);
  if (b.obb) axes.push([b.obb.c, b.obb.s], [-b.obb.s, b.obb.c]);
  // оси двух одинаково повёрнутых фигур повторяются — SAT от этого не ломается,
  // просто зря проверяет ту же пару интервалов
  return satOverlap(a, b, axes, margin);
}

// ------------------------------------------------------ sweep: кольцевой сектор (v2)
// Дуга дороги — не полилиния: у неё непрерывны касательная и кривизна, и только
// поэтому по ней сможет ехать машина. Планарная арифметика живёт здесь одна на
// валидатор, парсер и движок: разойдись они в знаке угла, и «точка B на настиле»
// окажется вне полотна, которое видно.

/**
 * Угол точки в секторе: `dth` со знаком (в радианах) от `a0` вдоль обхода, или
 * `null`, если угол вне `span`. `span` — знаковый размах: положительный обход
 * против часовой стрелки в плане (x, z), отрицательный — по ней.
 *
 * Срез дуги обязан входить в сектор, и остаток от деления на `TAU` не даёт этого
 * сам: узел цепочки на `a0` — это `cos`/`sin` того же угла, обратно `atan2`
 * возвращает его с шумом в 1e-16 рад, и если шум оказался отрицательным, разность
 * переносится добавлением полного круга и превращается в `TAU` (замер главы 13:
 * `6.283185307179586` против ожидаемого `2.5e-16`). Сравнение с `span` тогда
 * бракует **собственный срез дуги**, `sweepTopAt` отвечает `null`, и под первым
 * узлом цепочки опоры нет — ребро «предыдущий настил → этот» бракуется, цепочка
 * рвётся, а `_pruneToSpawn` выбрасывает дугу из сети. Тот же шум на том же
 * срезе у пластин закрыт допуском обратного хода в `circleHitsBox` и в
 * `_prismTopAt`; здесь допуск — `1e-9` рад (при радиусе 50 м это 50 нм).
 */
export function arcDelta(angle, a0, span) {
  const TAU = Math.PI * 2, EPS = 1e-12, CUT = 1e-9;
  if (span >= 0) {
    let d = (angle - a0) % TAU;
    if (d < 0) d += TAU;
    if (d <= span + EPS) return d;
    return d >= TAU - CUT ? 0 : null;
  }
  let d = (a0 - angle) % TAU;
  if (d < 0) d += TAU;
  if (d <= -span + EPS) return -d;
  return d >= TAU - CUT ? 0 : null;
}

/**
 * Габарит кольцевого сектора для broadphase и валидатора (радианы). Экстремумы
 * x и z у окружности бывают только на осях, поэтому достаточно концов сектора
 * и тех четырёх направлений, что попали внутрь обхода.
 */
export function arcBounds(cx, cz, R, halfW, a0, a1) {
  const span = a1 - a0;
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  const push = (r, a) => {
    const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  };
  const radii = [R - halfW, R + halfW];
  for (const a of [a0, a1]) for (const r of radii) push(r, a);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    if (arcDelta(a, a0, span) === null) continue;
    for (const r of radii) push(r, a);
  }
  return { minX, maxX, minZ, maxZ };
}

/**
 * Крен полотна дуги (v2) на пройденном угле: тангенс поперечного уклона в точке,
 * отстоящей от начала сектора на `delta` (рад; знаковый, как `span`).
 *
 * Авторский `tanBank` держится в середине развёртки, а у **обоих** торцов сходится
 * к нулю по косинусоиде за угол `trans` (рад). Переход нужен стыку: прямой настил,
 * примыкающий к торцу, плоский, и постоянный крен делал линию контакта диагональю
 * (замер — 0,84 м перепада на 8 м ширины, `docs/defects-v2-plan.md`). Половинная
 * косинусоида выбрана потому, что её производная обращается в ноль и у торца, и у
 * plateau: край полотна не получает излома на границах перехода, а его продольный
 * уклон в середине перехода ровно `maxSlope` — тот же предел, которым схема
 * ограничивает ось (длину перехода считает нормализатор и пишет в данные).
 */
export function arcBankAt(delta, span, tanBank, trans) {
  if (!tanBank || !trans) return tanBank;
  const d = Math.abs(delta);
  const e = Math.max(0, Math.min(d, Math.abs(span) - d));
  if (e >= trans) return tanBank;
  return (tanBank * (1 - Math.cos((Math.PI * e) / trans))) / 2;
}

/** Рёбра полигона как отрезки в плане: {x0,z0,x1,z1,axis}. */
export function polyEdges(poly) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (a.z === b.z) out.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, axis: 'x' });
    else out.push({ x0: a.x, z0: a.z, x1: b.x, z1: b.z, axis: 'z' });
  }
  return out;
}

/**
 * Локальные координаты точки плана относительно сегмента русла: `along` вдоль
 * (от a), `cross` поперёк (знак слева от направления). Осевой сегмент (`axis`)
 * хранит прежнюю форму — арифметика обязана дать то же, что до обобщения, иначе
 * закоммиченные главы 02/11/12/13/14 разъедутся. Общий сегмент несёт кадр
 * `(ax,az,tx,tz)`.
 */
export function waterwaySegLocal(s, x, z) {
  if (s.axis === 'x' || s.axis === 'z') {
    const along = s.axis === 'x' ? x : z;
    const cross = s.axis === 'x' ? z : x;
    return { along, cross };
  }
  const dx = x - s.ax, dz = z - s.az;
  return { along: dx * s.tx + dz * s.tz, cross: -dx * s.tz + dz * s.tx };
}

/** Точка плана внутри полосы русла сегмента (дно + продолжение на углах). */
export function inWaterwaySeg(s, x, z) {
  const L = waterwaySegLocal(s, x, z);
  if (s.axis === 'x' || s.axis === 'z') {
    return L.along >= s.lo && L.along <= s.hi && Math.abs(L.cross - s.cross) <= s.halfW;
  }
  return L.along >= s.lo && L.along <= s.hi && Math.abs(L.cross) <= s.halfW;
}

/** Отметка верха на береговом склоне/сходе русла в точке (u поперёк, v вдоль). */
export function waterwayDescentY(d, u) {
  const t = d.u1 === d.u0 ? 0 : (u - d.u0) / (d.u1 - d.u0);
  return d.y0 + (d.y1 - d.y0) * t;
}
