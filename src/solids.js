import { CONFIG } from './config.js';

/**
 * Пересекаются ли круг (x, z, radius) и прямоугольник в плане. Общая проверка
 * для всех карт: габарит игрока против стены, колонки или бордюра.
 */
export function circleHitsRect(x, z, minX, maxX, minZ, maxZ, radius) {
  const px = Math.min(Math.max(x, minX), maxX);
  const pz = Math.min(Math.max(z, minZ), maxZ);
  const dx = x - px, dz = z - pz;
  return dx * dx + dz * dz <= radius * radius;
}

/**
 * Ориентированная коробка (OBB) — та же AABB-запись, но с полем `obb`, где лежат
 * центр, полуоси и косинус/синус поворота вокруг Y. Нужна v2 генератора города:
 * дом остаётся прямоугольником **в своих осях** (комнаты, марши, решётка полов —
 * всё прямоугольное), а в мир он ставится под углом к северу.
 *
 * Соглашение о повороте ровно то же, что у `BoxGeometry.rotateY(θ)`: точка мира
 * `(x, z)` переходит в локальную `(lx, lz)` формулами ниже, поэтому картинка и
 * коллизия расходятся только если кто-то перепутает знак — а не потому, что
 * математик разная.
 *
 * `minX/maxX/minZ/maxZ` при этом остаются **габаритом повёрнутой коробки**: он
 * нужен сетке-индексу как broadphase (консервативно — кандидатов становится
 * больше, но узкая фаза точная, и фантомной высоты или невидимой стены не
 * появляется: AGENTS запрещает габарит как *решение о твёрдости*, а не как фильтр).
 */
function toLocal(o, x, z) {
  const dx = x - o.cx, dz = z - o.cz;
  return [dx * o.c + dz * o.s, -dx * o.s + dz * o.c];
}

/** Вектор или точка локальных осей → мир (обратное к `toLocal` линейное). */
function toWorld(o, lx, lz) {
  return [o.cx + lx * o.c - lz * o.s, o.cz + lx * o.s + lz * o.c];
}

/**
 * Пересекаются ли круг и коробка — ориентированная ветка той же общей проверки.
 * Без `obb` вызов побитово равен `circleHitsRect`, чтобы карты 1–10 прошли новый
 * код тем же путём, что шли раньше.
 *
 * Ориентированная ветка обязана допускать шум обратного хода мир → свои оси.
 * Точка, лежащая ровно на общей грани двух повёрнутых коробок (стык соседних
 * проступей марша), после поворота возвращает `±1e-14` м, а проверка
 * «дистанция ≤ радиуса» при радиусе 0 отбрасывает её из **обеих** коробок: опора
 * под ребром графа исчезает на том месте, где планом она гарантирована, и ребро
 * бракуется (замер на косом марше `hy_s1` главы 11: два ребра из шести
 * терялись, верхний этаж и кровля дома отрезались `_pruneToSpawn`). Допуск в
 * 1e-9 м — на порядки меньше шума координат сотни метров и невидим для тела
 * радиусом 0,45 м; плоская ветка в нём не нуждается, там сравнения инклюзивны и
 * точны.
 */
export function circleHitsBox(x, z, box, radius) {
  const o = box.obb;
  if (!o) return circleHitsRect(x, z, box.minX, box.maxX, box.minZ, box.maxZ, radius);
  const [lx, lz] = toLocal(o, x, z);
  const px = Math.min(Math.max(lx, -o.hx), o.hx);
  const pz = Math.min(Math.max(lz, -o.hz), o.hz);
  const dx = lx - px, dz = lz - pz;
  const r = radius + 1e-9;
  return dx * dx + dz * dz <= r * r;
}

/** Лежит ли точка плана внутри коробки (опора без радиуса ноги). */
export function pointHitsBox(x, z, box) {
  return circleHitsBox(x, z, box, 0);
}

/**
 * Общий механизм твёрдых объёмов (AABB) уровня: трёхмерная сетка-индекс,
 * рейкаст к первой грани, выталкивание сферы и маршевый луч до препятствия.
 *
 * Наследуют все типы карты — улицу (TownMap), город (CityMap) и рельеф
 * (TerrainMap), — поэтому физика Чужого (raySolid/resolveSphere) и стрельба
 * (rayHitDistance) работают одинаково на любом типе уровня. Улица и город
 * добавляют землю-плоскость и плоские опоры, рельеф — нет: у него внизу могут
 * быть пропасти глубже нуля, а опора аналитическая.
 */
export class SolidField {
  constructor(bucket = CONFIG.building.cell) {
    /** @type {{minX,maxX,minY,maxY,minZ,maxZ}[]} */
    this.solids = [];
    this.solidBucket = bucket;
    this.solidIndex = new Map();
    this._rayStamp = new Int32Array(0);
    this._mark = 0;
    // плоскость «земли» для рейкаста: {y, half} либо null (рельеф без плоскости)
    this.groundPlane = null;
    /**
     * Аналитический «пол мира» вместо нуля: `floorAt(x, z) → отметка грунта`.
     * null — как раньше (улица, город, район из GLB); картой с плавным рельефом
     * главы ставится поле из `src/relief.js`.
     */
    this.floorAt = null;
    // плоские опоры для ходьбы (полы, тротуары, ступени) — заполняет карта
    /** @type {{minX,maxX,minZ,maxZ,y:number}[]} */
    this.surfaces = [];
    this.bucket = bucket;
    this.index = new Map();
    this.stepUp = CONFIG.building.stepUp;
  }

  /** Ключ ячейки трёхмерной сетки солидов. */
  _key3(i, j, k) {
    return ((i + 2048) * 4096 + (j + 2048)) * 4096 + (k + 2048);
  }

  // ------------------------------------------- опорные поверхности (плоский пол)
  // Пользуются карты с плоскими опорами — улица и город: пол этажа, тротуар,
  // ступень. У рельефа опора аналитическая, он свои groundHeightAt не переопределяет.

  /** Ключ ячейки плоской сетки поверхностей. */
  _key(i, j) {
    return (i + 4096) * 8192 + (j + 4096);
  }

  /** Раскладывает this.surfaces по ячейкам сетки this.bucket (поиск по точке). */
  _indexSurfaces() {
    const b = this.bucket;
    this.surfaces.forEach((s, idx) => {
      const i0 = Math.floor(s.minX / b), i1 = Math.floor(s.maxX / b);
      const j0 = Math.floor(s.minZ / b), j1 = Math.floor(s.maxZ / b);
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const key = this._key(i, j);
          let list = this.index.get(key);
          if (!list) this.index.set(key, list = []);
          list.push(idx);
        }
      }
    });
  }

  /**
   * Высшая плоская опора (плита пола, тротуар, ступень) не выше
   * `fromY + stepUp`. `null` — ни одна плита точку не накрывает: карте с
   * аналитическим грунтом это нужно отличать от «плита на нуле», потому что под
   * руслом прорезанного склона ноль — не опора, а воздух над дном.
   */
  plateHeightAt(x, z, fromY = 0) {
    const list = this.index.get(this._key(Math.floor(x / this.bucket), Math.floor(z / this.bucket)));
    if (!list) return null;
    const limit = fromY + this.stepUp;
    let best = null;
    for (const idx of list) {
      const s = this.surfaces[idx];
      if ((best !== null && s.y <= best) || s.y > limit) continue;
      if (s.obb) {
        if (pointHitsBox(x, z, s)) best = s.y;
        continue;
      }
      if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) best = s.y;
    }
    return best;
  }

  /**
   * Опора под ногами: высшая из плоских плит и «пола мира».
   *
   * Полом мира без рельефа был нуль (`plateHeightAt` стартовал с него), теперь
   * его задаёт `floorAt` — отметка поля под точкой. Плита ниже грунта не мешает
   * (дом на площадке стоит полом заподлицо со склоном), плита выше — держит ногу,
   * и предельный шаг `fromY + stepUp` фильтрует именно плиты: грунт в точке —
   * единственная отметка местности, а не «высшая опора в пределах шага ноги»,
   * иначе спуск с холма отвечал бы нулём и нога повисла бы над склоном.
   */
  groundHeightAt(x, z, fromY = 0) {
    const plate = this.plateHeightAt(x, z, fromY);
    const floor = this.floorAt ? this.floorAt(x, z) : 0;
    return plate === null ? floor : Math.max(plate, floor);
  }

  /**
   * Свободен ли отрезок между точками для тела радиуса radius: пробы габарита
   * вдоль него шагом CONFIG.nav.bodyProbe. Рёбра графа навигации обязаны
   * проверять именно это, а не тонкий луч: луч проходит в зазор у угла дома,
   * а человек с радиусом в него не входит — и маршрут упирается в стену.
   */
  bodyClearLine(a, b, radius = CONFIG.radius, height = CONFIG.eyeHeight) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const feet = Math.max(a.y, b.y);
    const probe = CONFIG.nav.bodyProbe;
    const steps = Math.max(2, Math.ceil(Math.hypot(dx, dz) / probe));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      if (this.isBlocked(a.x + dx * t, a.z + dz * t, radius, feet, height)) return false;
    }
    return true;
  }

  /** Раскладывает AABB солидов по трёхмерным ячейкам (быстрый поиск). */
  indexSolids() {
    const b = this.solidBucket;
    this.solidIndex.clear();
    this.solids.forEach((s, idx) => {
      const i0 = Math.floor(s.minX / b), i1 = Math.floor(s.maxX / b);
      const j0 = Math.floor(s.minY / b), j1 = Math.floor(s.maxY / b);
      const k0 = Math.floor(s.minZ / b), k1 = Math.floor(s.maxZ / b);
      for (let k = k0; k <= k1; k++) {
        for (let j = j0; j <= j1; j++) {
          for (let i = i0; i <= i1; i++) {
            const key = this._key3(i, j, k);
            let list = this.solidIndex.get(key);
            if (!list) this.solidIndex.set(key, list = []);
            list.push(idx);
          }
        }
      }
    });
    this._rayStamp = new Int32Array(this.solids.length);
  }

  /**
   * Пересечение луча с параллелепипедом (метод слэбов).
   * @returns {{t:number, axis:number, sign:number}|null} ближайшая точка входа
   *   (t — расстояние, axis — ось грани, sign — знак нормали вдоль оси)
   */
  _rayAabb(ox, oy, oz, dx, dy, dz, s) {
    if (s.obb) {
      // луч переносится в локальные оси коробки и считается слэбами как обычный
      // AABB; нормаль входит в мир той же формулой, что и геометрия
      const o = s.obb;
      const [lo, lz0] = toLocal(o, ox, oz);
      const r = this._slabs(lo, oy, lz0,
        dx * o.c + dz * o.s, dy, -dx * o.s + dz * o.c,
        -o.hx, o.hx, s.minY, s.maxY, -o.hz, o.hz);
      if (!r) return null;
      // локальная нормаль грани (axis, sign) → мировая: поворот на тот же угол
      const lnx = r.axis === 0 ? r.sign : 0, lnz = r.axis === 2 ? r.sign : 0;
      return {
        t: r.t, axis: -1, sign: 1,
        nx: lnx * o.c - lnz * o.s,
        ny: r.axis === 1 ? r.sign : 0,
        nz: lnx * o.s + lnz * o.c,
      };
    }
    return this._slabs(ox, oy, oz, dx, dy, dz,
      s.minX, s.maxX, s.minY, s.maxY, s.minZ, s.maxZ);
  }

  /**
   * Слэбы по трём парам границ — отдельная функция потому, что у ориентированной
   * коробки и у обычная проверка одна и та же, просто в разных осях.
   * @returns {{t:number, axis:number, sign:number}|null} ближайшая точка входа
   *   (t — расстояние, axis — ось грани, sign — знак нормали вдоль оси)
   */
  _slabs(ox, oy, oz, dx, dy, dz, minX, maxX, minY, maxY, minZ, maxZ) {
    let tmin = -Infinity, tmax = Infinity, axis = 0, t1, t2;
    if (Math.abs(dx) < 1e-9) {
      if (ox < minX || ox > maxX) return null;
    } else {
      t1 = (minX - ox) / dx; t2 = (maxX - ox) / dx;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) { tmin = t1; axis = 0; }
      if (t2 < tmax) tmax = t2;
    }
    if (Math.abs(dy) < 1e-9) {
      if (oy < minY || oy > maxY) return null;
    } else {
      t1 = (minY - oy) / dy; t2 = (maxY - oy) / dy;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) { tmin = t1; axis = 1; }
      if (t2 < tmax) tmax = t2;
    }
    if (Math.abs(dz) < 1e-9) {
      if (oz < minZ || oz > maxZ) return null;
    } else {
      t1 = (minZ - oz) / dz; t2 = (maxZ - oz) / dz;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) { tmin = t1; axis = 2; }
      if (t2 < tmax) tmax = t2;
    }
    if (tmax < tmin || tmax < 0) return null;
    const comp = axis === 0 ? dx : axis === 1 ? dy : dz;
    return { t: tmin >= 0 ? tmin : 0, axis, sign: comp > 0 ? -1 : 1 };
  }

  /**
   * Рейкаст к первой твёрдой поверхности. Если задана groundPlane, она
   * учитывается как плоскость y = groundPlane.y в пределах half по XZ.
   * @returns {{x,y,z,nx,ny,nz,dist:number}|null} точка удара и нормаль поверхности
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-9) return null;
    dx /= len; dy /= len; dz /= len;

    let bestT = Infinity, found = false, bestNx = 0, bestNy = 0, bestNz = 0;

    if (this.solidIndex.size) {
      const b = this.solidBucket;
      const mark = ++this._mark;
      const stamp = this._rayStamp;
      const steps = Math.ceil(maxDist / b) + 1;
      for (let s = 0; s <= steps; s++) {
        const t = s * b;
        if (t > maxDist) break;
        const ci = Math.floor((ox + dx * t) / b);
        const cj = Math.floor((oy + dy * t) / b);
        const ck = Math.floor((oz + dz * t) / b);
        for (let k = ck - 1; k <= ck + 1; k++) {
          for (let j = cj - 1; j <= cj + 1; j++) {
            for (let i = ci - 1; i <= ci + 1; i++) {
              const list = this.solidIndex.get(this._key3(i, j, k));
              if (!list) continue;
              for (const idx of list) {
                if (stamp[idx] === mark) continue;
                stamp[idx] = mark;
                const r = this._rayAabb(ox, oy, oz, dx, dy, dz, this.solids[idx]);
                if (r && r.t <= maxDist && r.t < bestT) {
                  bestT = r.t; found = true;
                  if (r.axis < 0) { bestNx = r.nx; bestNy = r.ny; bestNz = r.nz; }
                  else {
                    bestNx = r.axis === 0 ? r.sign : 0;
                    bestNy = r.axis === 1 ? r.sign : 0;
                    bestNz = r.axis === 2 ? r.sign : 0;
                  }
                }
              }
            }
          }
        }
        if (found && bestT <= t) break; // ближайшая преграда уже пройдена
      }
    }

    // земля: горизонтальная плоскость в пределах карты
    const gp = this.groundPlane;
    if (gp && dy < -1e-9) {
      const tg = (gp.y - oy) / dy;
      if (tg >= 0 && tg <= maxDist && tg < bestT) {
        const gx = ox + dx * tg, gz = oz + dz * tg;
        if (gx >= -gp.half && gx <= gp.half && gz >= -gp.half && gz <= gp.half) {
          return { x: gx, y: gp.y, z: gz, nx: 0, ny: 1, nz: 0, dist: tg };
        }
      }
    }

    if (!found) return null;
    return {
      x: ox + dx * bestT, y: oy + dy * bestT, z: oz + dz * bestT,
      nx: bestNx, ny: bestNy, nz: bestNz,
      dist: bestT,
    };
  }

  /** Выталкивает точку из параллелепипеда по кратчайшему направлению. */
  _pushOut(c, r, s) {
    if (s.obb) {
      // то же выталкивание в локальных осях коробки: направление кратчайшего
      // выхода считается по его собственным граням, а не по граням габарита —
      // иначе сфера, идущая вдоль косой стены, съезжала бы вбок по ступеням AABB
      const o = s.obb;
      const [lx, lz] = toLocal(o, c.x, c.z);
      const py = Math.min(Math.max(c.y, s.minY), s.maxY);
      const dx = lx - Math.min(Math.max(lx, -o.hx), o.hx);
      const dy = c.y - py;
      const dz = lz - Math.min(Math.max(lz, -o.hz), o.hz);
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= r * r) return false;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2), push = (r - d) / d;
        const [wx, wz] = toWorld(o, lx + dx * push, lz + dz * push);
        c.x = wx; c.z = wz; c.y += dy * push;
      } else { // центр внутри объёма — выходим через ближайшую грань (порядок тот же)
        const dl = lx + o.hx, dr = o.hx - lx;
        const dyl = c.y - s.minY, dyr = s.maxY - c.y;
        const dzl = lz + o.hz, dzr = o.hz - lz;
        const m = Math.min(dl, dr, dyl, dyr, dzl, dzr);
        let nx = lx, nz = lz, ny = c.y;
        if (m === dl) nx = -o.hx - r;
        else if (m === dr) nx = o.hx + r;
        else if (m === dyl) ny = s.minY - r;
        else if (m === dyr) ny = s.maxY + r;
        else if (m === dzl) nz = -o.hz - r;
        else nz = o.hz + r;
        const [wx, wz] = toWorld(o, nx, nz);
        c.x = wx; c.y = ny; c.z = wz;
      }
      return true;
    }
    const px = Math.min(Math.max(c.x, s.minX), s.maxX);
    const py = Math.min(Math.max(c.y, s.minY), s.maxY);
    const pz = Math.min(Math.max(c.z, s.minZ), s.maxZ);
    const dx = c.x - px, dy = c.y - py, dz = c.z - pz;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= r * r) return false;
    if (d2 > 1e-10) {
      const d = Math.sqrt(d2);
      const push = (r - d) / d;
      c.x += dx * push; c.y += dy * push; c.z += dz * push;
    } else { // центр внутри объёма — выходим через ближайшую грань
      const dxl = c.x - s.minX, dxr = s.maxX - c.x;
      const dyl = c.y - s.minY, dyr = s.maxY - c.y;
      const dzl = c.z - s.minZ, dzr = s.maxZ - c.z;
      const m = Math.min(dxl, dxr, dyl, dyr, dzl, dzr);
      if (m === dxl) c.x = s.minX - r;
      else if (m === dxr) c.x = s.maxX + r;
      else if (m === dyl) c.y = s.minY - r;
      else if (m === dyr) c.y = s.maxY + r;
      else if (m === dzl) c.z = s.minZ - r;
      else c.z = s.maxZ + r;
    }
    return true;
  }

  /**
   * Выталкивает сферу (центр + радиус) из всех пересекаемых солидов.
   * Используется физикой Чужого вместо сеточных коллизий человека.
   */
  resolveSphere(c, r) {
    if (!this.solidIndex.size) return false;
    const b = this.solidBucket;
    const mark = ++this._mark;
    const stamp = this._rayStamp;
    const ci = Math.floor(c.x / b), cj = Math.floor(c.y / b), ck = Math.floor(c.z / b);
    let moved = false;
    for (let k = ck - 1; k <= ck + 1; k++) {
      for (let j = cj - 1; j <= cj + 1; j++) {
        for (let i = ci - 1; i <= ci + 1; i++) {
          const list = this.solidIndex.get(this._key3(i, j, k));
          if (!list) continue;
          for (const idx of list) {
            if (stamp[idx] === mark) continue;
            stamp[idx] = mark;
            if (this._pushOut(c, r, this.solids[idx])) moved = true;
          }
        }
      }
    }
    return moved;
  }

  /**
   * Дистанция до первой преграды вдоль луча. Маршевый шаг опирается на
   * isBlocked/groundHeightAt конкретной карты — без обхода мешей.
   */
  rayHitDistance(ox, oy, oz, dx, dy, dz, maxDist) {
    const { step, radius, yOffset, height, eps } = CONFIG.ray;
    for (let t = step; t <= maxDist; t += step) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      if (this.isBlocked(x, z, radius, y - yOffset, height)) return t;
      if (this.groundHeightAt(x, z, y) > y + eps) return t;
    }
    return maxDist;
  }
}
