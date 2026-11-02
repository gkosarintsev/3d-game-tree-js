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
   * Ближайшая опорная поверхность не выше fromY + допустимого шага. Пол мира —
   * ноль: всё, что ниже (яма, подвал), опорой для ходьбы не считается.
   */
  groundHeightAt(x, z, fromY = 0) {
    const list = this.index.get(this._key(Math.floor(x / this.bucket), Math.floor(z / this.bucket)));
    let best = 0;
    if (!list) return best;
    const limit = fromY + this.stepUp;
    for (const idx of list) {
      const s = this.surfaces[idx];
      if (s.y <= best || s.y > limit) continue;
      if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) best = s.y;
    }
    return best;
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
    let tmin = -Infinity, tmax = Infinity, axis = 0, t1, t2;
    if (Math.abs(dx) < 1e-9) {
      if (ox < s.minX || ox > s.maxX) return null;
    } else {
      t1 = (s.minX - ox) / dx; t2 = (s.maxX - ox) / dx;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) { tmin = t1; axis = 0; }
      if (t2 < tmax) tmax = t2;
    }
    if (Math.abs(dy) < 1e-9) {
      if (oy < s.minY || oy > s.maxY) return null;
    } else {
      t1 = (s.minY - oy) / dy; t2 = (s.maxY - oy) / dy;
      if (t1 > t2) { const tt = t1; t1 = t2; t2 = tt; }
      if (t1 > tmin) { tmin = t1; axis = 1; }
      if (t2 < tmax) tmax = t2;
    }
    if (Math.abs(dz) < 1e-9) {
      if (oz < s.minZ || oz > s.maxZ) return null;
    } else {
      t1 = (s.minZ - oz) / dz; t2 = (s.maxZ - oz) / dz;
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

    let bestT = Infinity, bestAxis = 0, bestSign = 1, found = false;

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
                  bestT = r.t; bestAxis = r.axis; bestSign = r.sign; found = true;
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
      nx: bestAxis === 0 ? bestSign : 0,
      ny: bestAxis === 1 ? bestSign : 0,
      nz: bestAxis === 2 ? bestSign : 0,
      dist: bestT,
    };
  }

  /** Выталкивает точку из параллелепипеда по кратчайшему направлению. */
  _pushOut(c, r, s) {
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
    const step = 0.6;
    for (let t = step; t <= maxDist; t += step) {
      const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t;
      if (this.isBlocked(x, z, 0.18, y - 0.15, 0.3)) return t;
      if (this.groundHeightAt(x, z, y) > y + 0.02) return t;
    }
    return maxDist;
  }
}
