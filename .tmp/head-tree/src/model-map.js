import * as THREE from 'three';
import { CONFIG } from './config.js';
import { SolidField, circleHitsRect } from './solids.js';
import { NavGraph } from './nav-graph.js';
import { getGltfScene, trianglesFromScene } from './glb.js';

/**
 * Реализация контракта карты для главы из внешнего GLB-макета города: район
 * макета («ночной город», глава 3) с улицами, по которым идёт человек, и
 * строениями, по которым лазает Чужой.
 *
 * Движок ничего не знает о содержимом модели — он знает сетку колонок: клетка
 * `cell` метров с одним числом, верхом колонки. Семантика та же, что у рельефа:
 * перепад не больше `stepUp` — опора, больше — стена. Колонки растеризуются из
 * тех же треугольников, что и видимый меш, поэтому «твёрдость = картинка»
 * держится по построению, а не по совпадению (см. AGENTS.md, «Внешние ассеты
 * уровня (GLB)»).
 *
 * `solids` при этом остаётся пустым, как аналитический верх у рельефа: чужая
 * модель дала бы сотни тысяч AABB, раздувающих индекс и маршевый луч. Опора
 * улицы — плита самого макета, её отметка измеряется по ассету (`groundY`), а
 * не вписывается в главу числом.
 */

/**
 * Растеризация треугольников района в сетку колонок твёрдости.
 *
 * Каждая грань отвечает за свою XZ-проекцию — так «твёрдость = картинка»
 * держится по построению (см. AGENTS.md, «Внешние ассеты уровня (GLB)»):
 *
 * - обычная грань (крыша, пол, наклонная плоскость) пишет высоту своей
 *   плоскости в центр каждой клетки, чей центр попал внутрь проекции;
 * - грань с вырожденной проекцией — отвесная стена-«лента», так в макетах
 *   рисуют фасад без толщины — обходит свой отрезок полосой в полклетки и
 *   пишет максимум по высоте. Полоса выпуклая, поэтому её клетки сходятся
 *   сторонами: стена непрерывна, и невидимого зазора, в который проваливалось
 *   бы тело Чужого, в ней нет.
 *
 * Прямоугольник вокруг проекции (прежняя консервативная растерка) запрещён:
 * вокруг косого фасада он давал полосу башен — на главе 3 23.6% занятых клеток
 * оказались невидимыми стенами до 116 м.
 *
 * Крупные плоскости макета (покрышка улиц на километры и его отвесный борт) в
 * колонки не пишутся: покрышка питает только `plateTop` — отметку опоры улицы.
 * Забитая ими сетка не дала бы ни одной новой стены, а разбираться каждый кадр
 * по 25 км² было бы нельзя.
 *
 * @param {Float32Array} pos девять координат на треугольник — либо в метрах
 *   главы (тогда `o.scale` не задают), либо сырые координаты файла, если вместе
 *   с ними переданы `o.idx`, `o.scale` и центр окна
 * @param {Float32Array} nh доля горизонтальности нормали каждого треугольника
 * @param {number} count треугольников в массиве (или в списке `o.idx`)
 * @param {object} o { half, cell, groundY, horizonNormal, skipSpan, wallArea,
 *   idx?, scale?, ox?, oy?, oz? }
 * @returns {{n:number, top:Float32Array, occupied:number, maxTop:number, plateTop:number}}
 */
export function columnsFromTriangles(pos, nh, count, o) {
  const { cell, horizonNormal, skipSpan } = o;
  // Стриминг передаёт сырые координаты файла и центр окна: пересчёт в локальные
  // метры обязан оставаться в двойной точности, потому что класс грани («стена»
  // или «плоскость») решается по площади её проекции у порога wallArea, а
  // округление до float32 на координатах ~2 000 м сдвигает её на 0,12 мм² —
  // этого хватает, чтобы на стыке двух окон стена то появлялась, то исчезала
  // (замер — docs/plan.md, F0). Без idx/ox/oz выражения ниже дают ровно те же
  // числа, что и достриминговый вариант: x * 1 - 0 в double тождественно x.
  const sc = o.scale ?? 1, ox = o.ox ?? 0, oy = o.oy ?? 0, oz = o.oz ?? 0;
  const idx = o.idx ?? null;
  const n = Math.max(1, Math.round((o.half * 2) / cell));
  const top = new Float32Array(n * n).fill(o.groundY);
  let occupied = 0, maxTop = o.groundY, plateTop = -Infinity;

  for (let q = 0; q < count; q++) {
    const t = idx === null ? q : idx[q];
    const b = t * 9;
    const ax = pos[b] * sc - ox, ay = pos[b + 1] * sc - oy, az = pos[b + 2] * sc - oz;
    const bx = pos[b + 3] * sc - ox, by = pos[b + 4] * sc - oy, bz = pos[b + 5] * sc - oz;
    const cx = pos[b + 6] * sc - ox, cy = pos[b + 7] * sc - oy, cz = pos[b + 8] * sc - oz;
    const minX = Math.min(ax, bx, cx), maxX = Math.max(ax, bx, cx);
    const minZ = Math.min(az, bz, cz), maxZ = Math.max(az, bz, cz);
    const maxY = Math.max(ay, by, cy);
    if (maxY <= o.groundY) continue; // грань ниже опоры улицы: стены из неё нет
    const flat = nh[t] >= horizonNormal;
    const span = Math.max(maxX - minX, maxZ - minZ);
    if (span > skipSpan) {
      // макетная геометрия в натуре района не переносится: покрышка улиц даёт
      // только отметку опоры, а отвесный борт макета — стену в 4 км длиной
      if (flat && maxY > plateTop) plateTop = maxY;
      continue;
    }

    let i0 = Math.floor((minX + o.half) / cell), i1 = Math.floor((maxX + o.half) / cell);
    let j0 = Math.floor((minZ + o.half) / cell), j1 = Math.floor((maxZ + o.half) / cell);
    if (i1 < 0 || j1 < 0 || i0 >= n || j0 >= n) continue;
    i0 = Math.max(0, i0); j0 = Math.max(0, j0);
    i1 = Math.min(n - 1, i1); j1 = Math.min(n - 1, j1);

    // площадь XZ-проекции: меньше wallArea — грань является лентой (отрезком)
    const abx = bx - ax, abz = bz - az, acx = cx - ax, acz = cz - az;
    const den = abx * acz - abz * acx;
    if (Math.abs(den) < o.wallArea) {
      // стена-лента: самый длинный рёберный отрезок проекции, полоса в полклетки
      const seg = longestXZ(ax, az, bx, bz, cx, cz);
      const dx = seg[2] - seg[0], dz = seg[3] - seg[1];
      const l2 = dx * dx + dz * dz;
      if (l2 < 1e-12) continue;
      const margin = cell * 0.5 + cell * 1e-3;
      for (let j = j0; j <= j1; j++) {
        const pz = -o.half + (j + 0.5) * cell;
        for (let i = i0; i <= i1; i++) {
          const px = -o.half + (i + 0.5) * cell;
          const s = Math.max(0, Math.min(1, ((px - seg[0]) * dx + (pz - seg[1]) * dz) / l2));
          if (Math.hypot(px - (seg[0] + dx * s), pz - (seg[1] + dz * s)) > margin) continue;
          const idx = j * n + i;
          if (maxY > top[idx]) top[idx] = maxY;
        }
      }
      continue;
    }

    for (let j = j0; j <= j1; j++) {
      const pz = -o.half + (j + 0.5) * cell;
      for (let i = i0; i <= i1; i++) {
        const px = -o.half + (i + 0.5) * cell;
        const apx = px - ax, apz = pz - az;
        const s = (apx * acz - apz * acx) / den;
        const u = (abx * apz - abz * apx) / den;
        if (s < 0 || u < 0 || s + u > 1) continue;
        const y = ay + s * (by - ay) + u * (cy - ay);
        const idx = j * n + i;
        if (y > top[idx]) top[idx] = y;
      }
    }
  }

  const limit = o.groundY + CONFIG.building.stepUp;
  for (let idx = 0; idx < top.length; idx++) {
    if (top[idx] > limit) occupied++;
    if (top[idx] > maxTop) maxTop = top[idx];
  }
  return { n, top, occupied, maxTop, plateTop };
}

/** Самый длинный отрезок XZ-проекции вырожденной грани — её «ось стены». */
function longestXZ(ax, az, bx, bz, cx, cz) {
  const ab = (bx - ax) * (bx - ax) + (bz - az) * (bz - az);
  const ac = (cx - ax) * (cx - ax) + (cz - az) * (cz - az);
  const bc = (cx - bx) * (cx - bx) + (cz - bz) * (cz - bz);
  if (ab >= ac && ab >= bc) return [ax, az, bx, bz];
  return ac >= bc ? [ax, az, cx, cz] : [bx, bz, cx, cz];
}

export class ModelMap extends SolidField {
  /**
   * @param {object} spec map-секция главы (см. levels/level-03.js): asset,
   *   window { x, z, size } в метрах макета, scale/scaleFrom, cell, spawn —
   *   недостающее из CONFIG.model
   */
  constructor(spec = {}) {
    const m = { ...CONFIG.model, ...spec };
    super(CONFIG.building.cell);
    if (!m.asset) throw new Error('ModelMap: в определении главы нет map.asset (путь к .glb)');
    this.cfg = m;
    this.decor = {}; // уличной декорации в районе нет: макет приносит всё сам
    this.stepUp = CONFIG.building.stepUp;

    const scene = getGltfScene(m.asset);
    const tris = trianglesFromScene(scene);
    this.tris = tris;
    this.fileBbox = tris.bbox;
    this.materials = tris.materials;

    // масштаб: высота самой высокой башни макета становится метрами главы
    const fileHeight = tris.bbox.maxY - tris.bbox.minY;
    const target = m.scale != null ? null : m.scaleFrom?.tallestTower;
    this.scale = m.scale ?? (target != null && fileHeight > 0 ? target / fileHeight : 1);

    // окно района в метрах макета; его центр — (0, 0) мира главы, низ модели — её
    // собственный minY, чтобы плита улицы легла на измеренную отметку groundY
    const win = m.window ?? {
      x: ((tris.bbox.minX + tris.bbox.maxX) / 2) * this.scale,
      z: ((tris.bbox.minZ + tris.bbox.maxZ) / 2) * this.scale,
      size: m.district,
    };
    const s = this.scale;
    const ox = win.x, oz = win.z, oy = tris.bbox.minY * s;
    this.window = win;
    const half = this.half = win.size / 2;
    this.size = win.size;
    this.width = this.depth = win.size;

    this._loadWindow();

    // плоскость опоры улицы — та же отметка, что у колонок: луч вниз над
    // асфальтом обязан дать плиту макета, а не «ничего»
    this.groundPlane = { y: this.groundY, half };

    this.bounds = { minX: -half, maxX: half, minZ: -half, maxZ: half };
    this.viewHalf = half + 24;
    this.spawn = this._findSpawn(m.spawn);
    this._minimapBlocks();
    this.nav = this._buildNav();
  }

  /**
   * Содержимое текущего окна (`this.window`): треугольники района в координатах
   * главы, отметка опоры улицы из его плиты и сетка колонок твёрдости.
   *
   * Выделено в метод потому, что стриминг (src/stream-map.js) собирает ровно те
   * же поля из корзин тайлов и в координатах файла, не округляя вершины под
   * каждое окно, — а опора, колонки, граф и меш наследуются без копий.
   */
  _loadWindow() {
    const m = this.cfg, tris = this.tris, s = this.scale, half = this.half;
    const ox = this.window.x, oz = this.window.z, oy = tris.bbox.minY * s;

    // треугольники района в координатах главы: те, чей XZ-габарит пересекает окно
    const pos = new Float32Array(tris.count * 9);
    const nh = new Float32Array(tris.count);
    const mid = new Int16Array(tris.count);
    const v = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    let kept = 0, plateTop = -Infinity;
    for (let t = 0; t < tris.count; t++) {
      const fb = t * 9;
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, maxY = -Infinity;
      for (let k = 0; k < 3; k++) {
        const o3 = k * 3;
        const x = tris.pos[fb + o3] * s - ox;
        const y = tris.pos[fb + o3 + 1] * s - oy;
        const z = tris.pos[fb + o3 + 2] * s - oz;
        v[o3] = x; v[o3 + 1] = y; v[o3 + 2] = z;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        if (y > maxY) maxY = y;
      }
      if (maxX < -half || minX > half || maxZ < -half || minZ > half) continue;
      const gb = kept * 9;
      for (let k = 0; k < 9; k++) pos[gb + k] = v[k];
      nh[kept] = tris.nh[t];
      mid[kept] = tris.mid[t];
      if (tris.nh[t] >= m.horizonNormal &&
          Math.max(maxX - minX, maxZ - minZ) > m.skipSpan && maxY > plateTop) plateTop = maxY;
      kept++;
    }
    this.pos = pos.subarray(0, kept * 9);
    this.nh = nh.subarray(0, kept);
    this.mid = mid.subarray(0, kept);
    this.triCount = kept;

    this.groundY = m.groundY ?? (Number.isFinite(plateTop) ? plateTop : 0);
    const col = columnsFromTriangles(this.pos, this.nh, this.triCount, {
      half, cell: m.cell, groundY: this.groundY,
      horizonNormal: m.horizonNormal, skipSpan: m.skipSpan, wallArea: m.wallArea,
    });
    this.cells = col.n;
    this.top = col.top;
    this.occupiedCells = col.occupied;
    this.maxTop = col.maxTop;
  }

  /** Индекс колонки по мировой точке; -1 — за краем района. */
  _cellIndex(x, z) {
    const i = Math.floor((x + this.half) / this.cfg.cell);
    const j = Math.floor((z + this.half) / this.cfg.cell);
    if (i < 0 || j < 0 || i >= this.cells || j >= this.cells) return -1;
    return j * this.cells + i;
  }

  /**
   * Опора под точкой: верх колонки, если на него можно встать с отметки fromY
   * (перепад не больше шага), иначе — плита улицы. Колонка ниже шага — крыша
   * соседнего уступа, на неё и встаём; колонка выше — стена, в ней опоры нет, и
   * ноги идут по асфальту.
   */
  groundHeightAt(x, z, fromY = 0) {
    const idx = this._cellIndex(x, z);
    if (idx < 0) return this.groundY;
    const t = this.top[idx];
    return t <= fromY + this.stepUp ? t : this.groundY;
  }

  /**
   * Коллизии габарита: колонка, чей верх выше ног больше чем на шаг, — стена.
   * Высота тела в вердикт не входит: колонка сплошная от плиты до верха,
   * поэтому «под ней пусто» не бывает (интерьеров макет не даёт).
   */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;
    const cell = this.cfg.cell, n = this.cells;
    const limit = feetY + this.stepUp;
    const i0 = Math.max(0, Math.floor((x - radius + half) / cell));
    const i1 = Math.min(n - 1, Math.floor((x + radius + half) / cell));
    const j0 = Math.max(0, Math.floor((z - radius + half) / cell));
    const j1 = Math.min(n - 1, Math.floor((z + radius + half) / cell));
    for (let j = j0; j <= j1; j++) {
      const minZ = -half + j * cell;
      for (let i = i0; i <= i1; i++) {
        const minX = -half + i * cell;
        if (!circleHitsRect(x, z, minX, minX + cell, minZ, minZ + cell, radius)) continue;
        if (this.top[j * n + i] > limit) return true;
      }
    }
    return false;
  }

  /**
   * Опора под идущим по улице: с отметки плиты. Мерить от нуля нельзя — ноги
   * идут по асфальту (groundY), а не по нулю, и тогда низкая колонка в шаг
   * высотой давала бы узлу одну высоту, а стоящему на ней — другую.
   */
  _streetY(x, z) {
    return this.groundHeightAt(x, z, this.groundY);
  }

  /**
   * Твёрдость колонки в точке: столб от плиты до верха клетки. Тот же смысл,
   * что у аналитической породы рельефа, — картинка и тело из одного числа,
   * потому что `solids` у района пуст и вестись должен маршем по сетке.
   */
  _columnAt(x, y, z) {
    const idx = this._cellIndex(x, z);
    if (idx < 0) return false;
    return y >= this.groundY - this.cfg.cell * 1e-3 && y < this.top[idx];
  }

  /**
   * Ближайшая грань колонки вокруг точки — нормаль удара. Берём сторону, до
   * которой меньше всего: луч, вошедший в фасад, даёт отвесную грань, луч
   * сверху — крышу (`ny = 1`), а тело, застрявшее в стене, выталкивается
   * наружу, а не «в пол».
   */
  _faceNormal(x, y, z, idx) {
    const cell = this.cfg.cell, half = this.half;
    const i = Math.floor((x + half) / cell), j = Math.floor((z + half) / cell);
    const minX = -half + i * cell, minZ = -half + j * cell;
    const d = [
      x - minX,                 // грань −x
      minX + cell - x,          // грань +x
      this.top[idx] - y,        // крыша
      Infinity,                 // низ колонки — тела под плитой не бывает, грань не выбираем
      z - minZ,                 // грань −z
      minZ + cell - z,          // грань +z
    ];
    let k = 0;
    for (let q = 1; q < d.length; q++) if (d[q] < d[k]) k = q;
    const nx = k === 0 ? -1 : k === 1 ? 1 : 0;
    const nz = k === 4 ? -1 : k === 5 ? 1 : 0;
    const ny = k === 2 ? 1 : 0;
    const l = Math.hypot(nx, ny, nz) || 1;
    return { nx: nx / l, ny: ny / l, nz: nz / l };
  }

  /**
   * Рейкаст к первой твёрдой точке района: колонки и плита улицы меряются
   * вместе, побеждает удар ближе — порядок тот же, что у рельефа. Солидов у
   * карты нет, поэтому базовый класс приносит сюда только плоскость плиты.
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const plate = super.raySolid(ox, oy, oz, dx, dy, dz, maxDist);
    const col = this._rayColumns(ox, oy, oz, dx, dy, dz, plate ? plate.dist : maxDist);
    if (!col) return plate;
    if (!plate || col.dist < plate.dist) return col;
    return plate;
  }

  /**
   * Марш по колонкам: первый переход «пусто → тело», граница уточняется
   * половинным делением, так что шаг марша не портит точность удара (проверено
   * сравнением с `THREE.Raycaster` по тому же мешу в tests/model-level.test.js).
   */
  _rayColumns(ox, oy, oz, dx, dy, dz, limit) {
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-9 || limit <= 0) return null;
    const ux = dx / len, uy = dy / len, uz = dz / len;
    if (this._columnAt(ox, oy, oz)) return this._columnHit(ox, oy, oz, 0);
    const step = this.cfg.rayStep;
    let prev = 0;
    for (let t = step; t <= limit + step; t += step) {
      const tt = Math.min(t, limit);
      if (this._columnAt(ox + ux * tt, oy + uy * tt, oz + uz * tt)) {
        let lo = prev, hi = tt;
        for (let k = 0; k < 8; k++) {
          const mid = (lo + hi) / 2;
          if (this._columnAt(ox + ux * mid, oy + uy * mid, oz + uz * mid)) hi = mid;
          else lo = mid;
        }
        return this._columnHit(ox + ux * hi, oy + uy * hi, oz + uz * hi, hi);
      }
      prev = tt;
      if (tt >= limit) break;
    }
    return null;
  }

  /** Точка удара в колонку и нормаль её ближайшей грани. */
  _columnHit(x, y, z, dist) {
    const idx = this._cellIndex(x, z);
    if (idx < 0) return null;
    const n = this._faceNormal(x, y, z, idx);
    return { x, y, z, ...n, dist };
  }

  /**
   * Выталкивание сферы тела: каждая колонка — параллелепипед от плиты до своего
   * верха, и она проходит через общий `_pushOut` базового класса. Клетка 1 м
   * уже радиуса Чужого, поэтому за один проход тело может выскочить в соседнюю
   * занятую клетку — проходы повторяем, пока есть движение.
   */
  resolveSphere(c, r) {
    const cell = this.cfg.cell, half = this.half, n = this.cells;
    let moved = false;
    for (let pass = 0; pass < this.cfg.spherePasses; pass++) {
      // границы пересчитываем на каждом проходе: после выталкивания тело
      // оказывается в других клетках, и их тоже надо разобрать
      const i0 = Math.max(0, Math.floor((c.x - r + half) / cell));
      const i1 = Math.min(n - 1, Math.floor((c.x + r + half) / cell));
      const j0 = Math.max(0, Math.floor((c.z - r + half) / cell));
      const j1 = Math.min(n - 1, Math.floor((c.z + r + half) / cell));
      let any = false;
      for (let j = j0; j <= j1; j++) {
        const minZ = -half + j * cell;
        for (let i = i0; i <= i1; i++) {
          const top = this.top[j * n + i];
          if (top <= this.groundY) continue; // плита, а не строение
          const minX = -half + i * cell;
          if (this._pushOut(c, r, {
            minX, maxX: minX + cell, minZ, maxZ: minZ + cell, minY: this.groundY, maxY: top,
          })) any = true;
        }
      }
      moved = moved || any;
      if (!any) break;
    }
    return moved;
  }

  /** Свободна ли точка для объекта: улица под ней и габарит не задержан. */
  _walkable(x, z) {
    const y = this._streetY(x, z);
    return Math.abs(y - this.groundY) <= this.stepUp &&
      !this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight);
  }

  /**
   * Точка появления: улица рядом с указанной в данных отметкой. Данные главы
   * говорят «юго-западный угол района», а не конкретную клетку: сетка колонок
   * известна только здесь, и спавн обязан попасть на асфальт, а не в башню.
   */
  _findSpawn(pos) {
    const want = {
      x: pos?.x ?? -this.half + this.cfg.spawnSearch,
      z: pos?.z ?? -this.half + this.cfg.spawnSearch,
    };
    if (this._walkable(want.x, want.z)) {
      return { x: want.x, z: want.z, y: this._streetY(want.x, want.z) };
    }
    const q = this.cfg.navStep / 2, r = this.cfg.spawnSearch;
    for (let ring = 1; ring * q <= r; ring++) {
      for (let di = -ring; di <= ring; di++) {
        for (let dj = -ring; dj <= ring; dj++) {
          if (Math.max(Math.abs(di), Math.abs(dj)) !== ring) continue;
          const x = want.x + di * q, z = want.z + dj * q;
          if (Math.hypot(x - want.x, z - want.z) > r) continue;
          if (this._walkable(x, z)) return { x, z, y: this._streetY(x, z) };
        }
      }
    }
    throw new Error(`ModelMap: в радиусе ${r} м от (${want.x}, ${want.z}) нет проходимой улицы`);
  }

  /** Узлы для объектов уровня: только реально опертые точки улиц. */
  openPositions() {
    const out = [];
    for (const p of this.nav.pos) {
      if (Math.abs(this.groundHeightAt(p.x, p.z, p.y) - p.y) <= 0.02) out.push(p);
    }
    return out;
  }

  worldToNormalized(x, z) {
    const v = this.viewHalf;
    return [
      Math.min(Math.max((x + v) / (2 * v), 0), 1),
      Math.min(Math.max((z + v) / (2 * v), 0), 1),
    ];
  }

  // ---------------------------------------------------------------- навигация

  /**
   * Решётка улиц района: узел — в точке, где габариту человека свободно и есть
   * опора плиты, ребро — если перепад перешагиваем и отрезок между центрами
   * свободен для тела (`bodyClearLine`). Тот же порядок, что в городе: граф не
   * должен вести врагов сквозь фасад, вписанный в клетку решётки.
   */
  _buildNav() {
    const nav = new NavGraph();
    const step = this.cfg.navStep;
    const key = (i, j) => `g:${i}:${j}`;
    const count = Math.floor(this.size / step);
    for (let i = 0; i <= count; i++) {
      for (let j = 0; j <= count; j++) {
        const x = -this.half + (i + 0.5) * step, z = -this.half + (j + 0.5) * step;
        if (!this._walkable(x, z)) continue;
        nav.add(x, this._streetY(x, z), z, key(i, j));
      }
    }
    const clear = (a, b) => Math.abs(a.y - b.y) <= this.stepUp && this.bodyClearLine(a, b);
    for (let i = 0; i <= count; i++) {
      for (let j = 0; j <= count; j++) {
        const a = nav.id(key(i, j));
        if (a === undefined) continue;
        for (const [di, dj] of [[1, 0], [0, 1]]) {
          const b = nav.id(key(i + di, j + dj));
          if (b !== undefined && clear(nav.pos[a], nav.pos[b])) nav.link(a, b);
        }
      }
    }
    return this._largestNetwork(nav.seal());
  }

  /**
   * Оставляет в графе крупнейшую связную сеть улиц. Район из макета расколот
   * дворами-карманами: по замерам 111 компонент на 8706 узлов, 4% узлов не имеют
   * маршрута ни к точке A, ни к точке B. Враг, возрождённый в кармане, стоит
   * на месте (маршрута к игроку нет), а `openPositions` предложил бы точку объекта
   * там, куда человек не дойдёт. Карманы при этом проходимы внутри себя и
   * выглядят как улицы, поэтому
   * отбраковка по `isBlocked` их не убирает — отсекается только то, до чего из
   * основной сети нельзя дойти пешком. Чужому это не мешает: он залезает в двор
   * через стену механикой лазанья, а графом не пользуется (в `AlienEnemy._control`
   * цель — сам игрок, маршрута там нет).
   */
  _largestNetwork(nav) {
    const n = nav.pos.length;
    if (n < 2) return nav;
    const comp = new Int32Array(n).fill(-1);
    const queue = [];
    const sizes = [];
    for (let s = 0; s < n; s++) {
      if (comp[s] >= 0) continue;
      comp[s] = sizes.length;
      queue.push(s);
      for (let head = 0; head < queue.length; head++) {
        for (const b of nav.adj[queue[head]]) if (comp[b] < 0) { comp[b] = sizes.length; queue.push(b); }
      }
      sizes.push(queue.length);
      queue.length = 0;
    }
    let best = 0;
    for (let i = 1; i < sizes.length; i++) if (sizes[i] > sizes[best]) best = i;
    if (sizes[best] === n) return nav; // район и так одна сеть — ничего не убираем

    const out = new NavGraph();
    const keep = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) {
      if (comp[i] !== best) continue;
      const p = nav.pos[i];
      keep[i] = out.add(p.x, p.y, p.z);
    }
    for (let i = 0; i < n; i++) {
      if (keep[i] < 0) continue;
      for (const j of nav.adj[i]) if (keep[j] >= 0) out.link(keep[i], keep[j]);
    }
    return out.seal();
  }

  randomNavPoint(x, z, radius) {
    return this.nav.randomPoint(x, z, radius);
  }

  findPath(from, to) {
    return this.nav.findPath(from, to);
  }

  // ---------------------------------------------------------------- постройка

  /**
   * Ночная диффузия макета: `map.albedo` затемняет цвета материалов ассета.
   *
   * Макет пришёл белым: эмиссии (`emissive` 0x000000) в файле нет ни у одного из
   * 56 материалов района, а текстуры несёт только плита `material_0` да `Plaster`
   * с `CorrogateRust` (окна не рисует ни одна). При полной диффузии район выглядит
   * дневным: замер кадра в главе — плита улицы 46 и фасады 51 в sRGB против
   * неба 14, то есть район ярче неба, а ночного контраста между светом фонарей
   * и тенью нет (он заливался светом). С `albedo` 0,45 (замер того же кадра с
   * включённым пулом и с выключенным): улица под фонарём 80, та же улица без
   * огней — 40, фасад башни 39…65, улица вдали за пулом 21, небо 15.
   *
   * Эмиссии окон по материалу здесь нет намеренно: в этом макете именные цветные
   * материалы — линии нулевой площади (замер: 3440 «фасадных» граней Color_D05,
   * Beige_1, Color_M0x дают 0,1 м² на все), а настоящие поверхности держат два
   * материала — общий `material` на здание целиком (фасад и остекление не
   * разделены) и плита `material_0`: из 56 материалов района площадь ≥ 1 м² несёт
   * только 4 (считает автотест). Светить нечего (см. AGENTS.md).
   *
   * Материалы в кэше GLTF общие на все заходы главы, поэтому цвет собирается
   * из исходного, а не умножается снова: второй `build` затемняет ровно так же,
   * как первый.
   */
  _applyAlbedo() {
    const albedo = this.cfg.albedo ?? 1;
    for (const m of this.materials) {
      if (!m.color) continue;
      if (!m.userData.dayColor) m.userData.dayColor = m.color.clone();
      m.color.copy(m.userData.dayColor).multiplyScalar(albedo);
    }
  }

  /**
   * Видимый меш района: те же треугольники, что дали колонки, сгруппированные
   * по материалам макета. Нормали — по граням (модель архитектурных коробок,
   * сглаживание не скрывает стыков), тени — выключены: направленный свет в
   * 150-метровых башнях даёт мыло без перенастройки shadow.camera, а ночной вид
   * делают «луна» из sky и пул огней (src/night-lights.js).
   */
  build(scene) {
    this._applyAlbedo();
    this.modelMeshes = [];
    const counts = new Map();
    for (let t = 0; t < this.triCount; t++) {
      counts.set(this.mid[t], (counts.get(this.mid[t]) ?? 0) + 1);
    }
    const buffers = new Map();
    for (const [mi, n] of counts) buffers.set(mi, { arr: new Float32Array(n * 9), at: 0 });
    for (let t = 0; t < this.triCount; t++) {
      const buf = buffers.get(this.mid[t]);
      const fb = t * 9;
      for (let k = 0; k < 9; k++) buf.arr[buf.at + k] = this.pos[fb + k];
      buf.at += 9;
    }
    for (const [mi, buf] of buffers) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(buf.arr, 3));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, this.materials[mi]);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      scene.add(mesh);
      this.modelMeshes.push(mesh);
    }
  }

  /**
   * План района для миникарты: занятость колонок укрупняется до ~48 блоков по
   * стороне (холст 168 px, т.е. ~3.5 px на блок) и считается один раз — рисовать
   * 700-метровый район клеткой в 1 м каждый кадр нельзя.
   */
  _minimapBlocks() {
    const n = this.cells;
    const stride = Math.max(1, Math.round(n / 48));
    const limit = this.groundY + this.stepUp;
    const out = [];
    for (let bj = 0; bj * stride < n; bj++) {
      for (let bi = 0; bi * stride < n; bi++) {
        let built = false;
        const iEnd = Math.min(n, (bi + 1) * stride), jEnd = Math.min(n, (bj + 1) * stride);
        for (let j = bj * stride; j < jEnd && !built; j++) {
          for (let i = bi * stride; i < iEnd; i++) {
            if (this.top[j * n + i] > limit) { built = true; break; }
          }
        }
        if (!built) continue;
        const x0 = -this.half + bi * stride * this.cfg.cell;
        const z0 = -this.half + bj * stride * this.cfg.cell;
        const x1 = -this.half + iEnd * stride * this.cfg.cell;
        const z1 = -this.half + jEnd * stride * this.cfg.cell;
        const [u0, v0] = this.worldToNormalized(x0, z0);
        const [u1, v1] = this.worldToNormalized(x1, z1);
        out.push(u0, v0, u1, v1);
      }
    }
    this.minimapBlocks = new Float32Array(out);
  }

  /** План района: асфальт, занятые строениями блоки и подпись режима. */
  drawMinimap(ctx, size, playerPos) {
    ctx.fillStyle = '#12161d';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#3a4250';
    const bl = this.minimapBlocks;
    for (let i = 0; i < bl.length; i += 4) {
      ctx.fillRect(bl[i] * size, bl[i + 1] * size, (bl[i + 2] - bl[i]) * size, (bl[i + 3] - bl[i]) * size);
    }
    const onStreet = (playerPos?.y ?? 0) <= this.groundY + this.stepUp;
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(onStreet ? 'Улица' : 'Крыша', 10, 10);
  }

  /**
   * Снимает со сцену меши района и их геометрии. Материалы приходят из кэша
   * GLTFLoader (src/glb.js) и переживают смену главы — их не убираем, как и
   * пропы в JsonMap (AGENTS.md про «не трогать общие материалы»).
   */
  dispose() {
    for (const mesh of this.modelMeshes ?? []) {
      mesh.parent?.remove(mesh);
      mesh.geometry?.dispose?.();
    }
    this.modelMeshes = [];
  }
}

/**
 * Создаёт карту района по определению уровня (см. src/levels/level-03.js).
 * Ассет обязан быть предзагружен (preloadMapAsset в game.js): контракт карты
 * синхронный.
 */
export function createModelMap(spec = {}) {
  return new ModelMap(spec);
}
