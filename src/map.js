import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import {
  WALL, FLOOR, VOID, HOLE, WINDOW,
  generateBuilding, buildBuildingGeometry, buildingSurfaces, outerSides,
} from './building.js';

/** Пересекаются ли круг игрока (x,z,radius) и прямоугольник. */
function circleHitsRect(x, z, minX, maxX, minZ, maxZ, radius) {
  const px = Math.min(Math.max(x, minX), maxX);
  const pz = Math.min(Math.max(z, minZ), maxZ);
  const dx = x - px, dz = z - pz;
  return dx * dx + dz * dz <= radius * radius;
}

/**
 * Контракт карты (расширен по вертикали — в мире несколько этажей).
 *
 * Игрок, монеты и интерфейс зависят только от этого набора членов:
 *
 *   width, depth                   — размеры мира в юнитах
 *   spawn                          — { x, z } точка появления игрока
 *   groundHeightAt(x, z, fromY)    — высота опоры под ногами: ближайшая
 *                                    поверхность не выше fromY + допустимый шаг
 *   isBlocked(x, z, r, feetY, h)   — коллизии габарита: стены этажей,
 *                                    пересекающие игрока по высоте
 *   openPositions()                — свободные точки { x, y, z } для объектов
 *   worldToNormalized(x, z)        — [u, v] в диапазоне 0..1 (для миникарты)
 *   build(scene)                   — построить статическую геометрию уровня
 *   drawMinimap(ctx, size, playerPos) — отрисовать план текущего этажа
 *
 * Чтобы снова сменить тип уровня, достаточно реализовать контракт в новом
 * классе и подменить его в Game.createMap().
 */

/**
 * Карта-улица: плоская земля и несколько домов в ряд. Геометрия всех домов
 * сливается в общие меши, поэтому число вызовов отрисовки не зависит от
 * количества домов. Опорные поверхности индексируются в пространственную
 * сетку — поиск высоты пола под ногами не зависит от их числа.
 */
export class TownMap {
  constructor(buildings) {
    this.buildings = buildings;
    this.width = CONFIG.ground.size;
    this.depth = CONFIG.ground.size;
    this.stepUp = CONFIG.building.stepUp;

    // габариты каждого дома — для быстрой отбраковки в проверке коллизий
    this.boxes = buildings.map(b => ({
      minX: b.originX,
      maxX: b.originX + b.cols * b.cell,
      minZ: b.originZ,
      maxZ: b.originZ + b.rows * b.cell,
    }));

    // все опорные поверхности домов + пространственный индекс по ним
    this.surfaces = [];
    for (const b of buildings) this.surfaces.push(...buildingSurfaces(b));
    this.bucket = CONFIG.building.cell * 2;
    this.index = new Map();
    this._indexSurfaces();

    // твёрдые объёмы (AABB) для 3D-физики Чужого: заполняются в build()
    this.solids = [];
    this.solidBucket = CONFIG.building.cell;
    this.solidIndex = new Map();
    this._rayStamp = new Int32Array(0);
    this._mark = 0;

    this.bounds = this._worldBounds();
    this.viewHalf = Math.max(
      Math.abs(this.bounds.minX), Math.abs(this.bounds.maxX),
      Math.abs(this.bounds.minZ), Math.abs(this.bounds.maxZ),
    ) + 24;
    this.spawn = this._findSpawn();

    // граф навигации для врагов и рабочие буферы поиска пути
    this.nav = this._buildNav();
    this._bfsSeen = new Uint8Array(this.nav.pos.length);
    this._bfsPrev = new Int32Array(this.nav.pos.length);
  }

  /** Раскладывает поверхности по ячейкам сетки (быстрый поиск по точке). */
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

  _key(i, j) {
    return (i + 4096) * 8192 + (j + 4096);
  }

  // ---------------------------------------------------- твёрдые тела (солиды)

  /** Ключ ячейки трёхмерной сетки солидов. */
  _key3(i, j, k) {
    return ((i + 2048) * 4096 + (j + 2048)) * 4096 + (k + 2048);
  }

  /** Раскладывает AABB солидов по трёхмерным ячейкам (быстрый поиск). */
  _indexSolids() {
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
   * Рейкаст к первой твёрдой поверхности. Пол мира — бесконечная плоскость
   * y = 0 в пределах габаритов карты.
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

    // земля: плоскость y = 0
    if (dy < -1e-9) {
      const tg = (0 - oy) / dy;
      if (tg >= 0 && tg <= maxDist && tg < bestT) {
        const gx = ox + dx * tg, gz = oz + dz * tg;
        const half = this.width / 2;
        if (gx >= -half && gx <= half && gz >= -half && gz <= half) {
          return { x: gx, y: 0, z: gz, nx: 0, ny: 1, nz: 0, dist: tg };
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

  /** Общий габарит всех домов (по земле). */
  _worldBounds() {
    const out = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    for (const box of this.boxes) {
      out.minX = Math.min(out.minX, box.minX);
      out.maxX = Math.max(out.maxX, box.maxX);
      out.minZ = Math.min(out.minZ, box.minZ);
      out.maxZ = Math.max(out.maxZ, box.maxZ);
    }
    return out;
  }

  /** Точка появления — на улице, перед входом центрального дома. */
  _findSpawn() {
    const b = this.buildings.reduce((a, c) => Math.abs(c.doorX) < Math.abs(a.doorX) ? c : a);
    return { x: b.doorX, z: this.bounds.minZ - 10 };
  }

  /** Ближайшая опорная поверхность не выше fromY + допустимого шага. */
  groundHeightAt(x, z, fromY = 0) {
    const list = this.index.get(this._key(Math.floor(x / this.bucket), Math.floor(z / this.bucket)));
    let best = 0; // плоская земля под всем миром
    if (!list) return best;
    const limit = fromY + this.stepUp;
    for (const idx of list) {
      const s = this.surfaces[idx];
      if (s.y <= best || s.y > limit) continue;
      if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) best = s.y;
    }
    return best;
  }

  /** Коллизии габарита игрока: стены (и окна) этажей, пересекающие его по высоте. */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.width / 2;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;

    const y0 = feetY;
    const y1 = feetY + height;

    for (let n = 0; n < this.buildings.length; n++) {
      const box = this.boxes[n];
      if (x + radius < box.minX || x - radius > box.maxX ||
          z + radius < box.minZ || z - radius > box.maxZ) continue;

      const { cols, rows, cell, floors, floorHeight, originX, originZ, levels, wallThickness } = this.buildings[n];
      const i0 = Math.floor((x - radius - originX) / cell);
      const i1 = Math.floor((x + radius - originX) / cell);
      const j0 = Math.floor((z - radius - originZ) / cell);
      const j1 = Math.floor((z + radius - originZ) / cell);

      const thick = cell * wallThickness;

      for (let j = j0; j <= j1; j++) {
        if (j < 0 || j >= rows) continue;
        for (let i = i0; i <= i1; i++) {
          if (i < 0 || i >= cols) continue;

          const cx = originX + i * cell;
          const cz = originZ + j * cell;
          // грубая отбраковка: круг игрока не касается клетки
          if (!circleHitsRect(x, z, cx, cx + cell, cz, cz + cell, radius)) continue;

          for (let k = 0; k < floors; k++) {
            const c = levels[k][j][i];
            if (c !== WALL && c !== WINDOW) continue;
            const wy0 = k * floorHeight;
            if (y0 >= wy0 + floorHeight || y1 <= wy0) continue;

            // проверяем тонкие стены по их фактической толщине; внутренние
            // стены и колонны остаются сплошными
            const o = outerSides(levels[k], cols, rows, i, j);
            if (!o.W && !o.E && !o.N && !o.S) return true;
            if (o.W && circleHitsRect(x, z, cx, cx + thick, cz, cz + cell, radius)) return true;
            if (o.E && circleHitsRect(x, z, cx + cell - thick, cx + cell, cz, cz + cell, radius)) return true;
            if (o.N && circleHitsRect(x, z, cx, cx + cell, cz, cz + thick, radius)) return true;
            if (o.S && circleHitsRect(x, z, cx, cx + cell, cz + cell - thick, cz + cell, radius)) return true;
          }
        }
      }
    }
    return false;
  }

  /** Свободные точки на полах этажей всех домов (вне лестничных шахт). */
  openPositions() {
    const out = [];
    for (const b of this.buildings) {
      const { cols, rows, cell, floors, floorHeight, originX, originZ, levels, stair } = b;
      for (let k = 0; k < floors; k++) {
        for (let j = 1; j < rows - 1; j++) {
          for (let i = 1; i < cols - 1; i++) {
            if (levels[k][j][i] !== FLOOR) continue;
            if (i >= stair.i0 - 1 && i <= stair.i1 + 1 && j >= stair.j0 - 1 && j <= stair.j1 + 1) continue;
            out.push({
              x: originX + (i + 0.5) * cell,
              z: originZ + (j + 0.5) * cell,
              y: k * floorHeight,
            });
          }
        }
      }
    }
    return out;
  }

  worldToNormalized(x, z) {
    const v = this.viewHalf;
    const u = (x + v) / (2 * v);
    const w = (z + v) / (2 * v);
    return [Math.min(Math.max(u, 0), 1), Math.min(Math.max(w, 0), 1)];
  }

  // ---------------------------------------------------------------- навигация

  /**
   * Граф навигации для врагов. Узлы — проходимые клетки пола каждого этажа
   * каждого дома и регулярная сетка точек на земле улицы. Рёбра — соседство
   * по клеткам и лестничные марши (южный торец этажа k ↔ северный торец
   * этажа k + 1), поэтому по графу можно ходить и между этажами.
   */
  _buildNav() {
    const pos = [];
    const adj = [];
    const byKey = new Map();

    const add = (x, y, z, key) => {
      const known = byKey.get(key);
      if (known !== undefined) return known;
      const idx = pos.length;
      pos.push({ x, y, z });
      adj.push([]);
      byKey.set(key, idx);
      return idx;
    };
    const link = (a, b) => {
      if (a === undefined || b === undefined || a === b) return;
      adj[a].push(b);
      adj[b].push(a);
    };
    const cellKey = (n, k, i, j) => `b${n}:${k}:${i}:${j}`;

    // 1. полы домов: узел на каждой проходимой клетке, связи с соседями
    for (let n = 0; n < this.buildings.length; n++) {
      const b = this.buildings[n];
      const { cols, rows, cell, floors, floorHeight, originX, originZ, levels, stair } = b;
      const nodeAt = (k, i, j) => add(
        originX + (i + 0.5) * cell, k * floorHeight, originZ + (j + 0.5) * cell,
        cellKey(n, k, i, j),
      );
      const walk = (k, i, j) =>
        i >= 0 && j >= 0 && i < cols && j < rows && levels[k][j][i] === FLOOR;

      for (let k = 0; k < floors; k++) {
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            if (levels[k][j][i] !== FLOOR) continue;
            const id = nodeAt(k, i, j);
            if (walk(k, i - 1, j)) link(id, nodeAt(k, i - 1, j));
            if (walk(k, i + 1, j)) link(id, nodeAt(k, i + 1, j));
            if (walk(k, i, j - 1)) link(id, nodeAt(k, i, j - 1));
            if (walk(k, i, j + 1)) link(id, nodeAt(k, i, j + 1));
          }
        }
      }

      // марш: со южного торца этажа k поднимается к северному торцу этажа k+1
      for (let k = 0; k + 1 < floors; k++) {
        for (const i of [stair.i0, stair.i1]) {
          link(
            byKey.get(cellKey(n, k, i, stair.j0 - 1)),
            byKey.get(cellKey(n, k + 1, i, stair.j1 + 1)),
          );
        }
      }
    }

    // 2. земля улицы: регулярная сетка вне габаритов домов
    const step = CONFIG.nav.streetStep;
    const half = this.width / 2;
    const count = Math.floor(this.width / step);
    const gx = ix => -half + ix * step;
    const inBox = (x, z) => this.boxes.some(b =>
      x > b.minX - 1 && x < b.maxX + 1 && z > b.minZ - 1 && z < b.maxZ + 1);
    const groundKey = (ix, iz) => `g:${ix}:${iz}`;
    for (let ix = 0; ix <= count; ix++) {
      for (let iz = 0; iz <= count; iz++) {
        const x = gx(ix), z = gx(iz);
        if (inBox(x, z)) continue;
        const id = add(x, 0, z, groundKey(ix, iz));
        link(id, byKey.get(groundKey(ix - 1, iz)));
        link(id, byKey.get(groundKey(ix, iz - 1)));
      }
    }

    // 3. выходы: пороговые клетки первого этажа соединяем с улицей
    for (let n = 0; n < this.buildings.length; n++) {
      const b = this.buildings[n];
      const { cols, rows, originX, originZ, levels } = b;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          if (levels[0][j][i] !== FLOOR) continue;
          const o = outerSides(levels[0], cols, rows, i, j);
          if (!o.W && !o.E && !o.N && !o.S) continue; // не порог, а внутренняя клетка
          const id = byKey.get(cellKey(n, 0, i, j));
          if (id === undefined) continue;
          const p = pos[id];
          const ci = Math.round((p.x + half) / step);
          const cj = Math.round((p.z + half) / step);
          for (let ix = ci - 2; ix <= ci + 2; ix++) {
            for (let iz = cj - 2; iz <= cj + 2; iz++) {
              const g = byKey.get(groundKey(ix, iz));
              if (g === undefined) continue;
              const q = pos[g];
              const d = Math.hypot(q.x - p.x, q.z - p.z);
              if (d > step * 1.6) continue;
              if (this.rayHitDistance(p.x, p.y + 0.9, p.z,
                (q.x - p.x) / d, 0, (q.z - p.z) / d, d) < d - 0.1) continue;
              link(id, g);
            }
          }
        }
      }
    }

    return { pos, adj };
  }

  /** Ближайший узел графа к точке (этаж учитывается весом по вертикали). */
  _nearestNode(x, y, z) {
    const pos = this.nav.pos;
    let best = -1, bestD = Infinity;
    for (let i = 0; i < pos.length; i++) {
      const p = pos[i];
      const dy = (p.y - y) * 2;
      const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) + dy * dy;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  /** Случайная точка графа в радиусе от (x, z); если не нашлось — null. */
  randomNavPoint(x, z, radius, tries = 60) {
    const pos = this.nav.pos;
    for (let i = 0; i < tries; i++) {
      const p = pos[Math.floor(Math.random() * pos.length)];
      if (Math.hypot(p.x - x, p.z - z) <= radius) return p;
    }
    return null;
  }

  /** Маршрут по узлам графа (поиск в ширину). null — пути нет. */
  findPath(from, to) {
    const a = this._nearestNode(from.x, from.y, from.z);
    const b = this._nearestNode(to.x, to.y, to.z);
    if (a < 0 || b < 0) return null;
    if (a === b) return [this.nav.pos[b]];

    const { pos, adj } = this.nav;
    const seen = this._bfsSeen;
    const prev = this._bfsPrev;
    const queue = [a];
    seen[a] = 1;
    prev[a] = -1; // источник: возврат по prev должен на нём остановиться

    for (let head = 0; head < queue.length; head++) {
      const cur = queue[head];
      if (cur === b) break;
      for (const nb of adj[cur]) {
        if (seen[nb]) continue;
        seen[nb] = 1;
        prev[nb] = cur;
        queue.push(nb);
      }
    }

    const found = seen[b] === 1;
    for (const i of queue) seen[i] = 0; // буферы переиспользуются
    if (!found) return null;

    const path = [];
    for (let cur = b; cur !== -1; cur = prev[cur]) path.push(pos[cur]);
    return path.reverse();
  }

  // ---------------------------------------------------------------- стрельба

  /**
   * Дистанция до первой преграды вдоль луча (стены, перекрытия, земля).
   * Считается по той же сетке, что и коллизии, — без обхода мешей.
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

  /** Плоская земля и слитая геометрия всех домов. */
  build(scene) {
    const size = this.width;
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({ color: CONFIG.ground.color, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // геометрия всех домов сливается по материалам → постоянное число мешей.
    // Попутно собираем твёрдые объёмы (AABB) для 3D-физики Чужого.
    this.solids = [];
    const parts = { walls: [], slabs: [], stairs: [] };
    for (const b of this.buildings) {
      const g = buildBuildingGeometry(b, this.solids);
      for (const key of Object.keys(parts)) if (g[key]) parts[key].push(g[key]);
    }
    this._indexSolids();

    const mats = {
      walls: new THREE.MeshStandardMaterial({ color: 0xd6dae0, roughness: .85, metalness: .05 }),
      slabs: new THREE.MeshStandardMaterial({ color: 0xb9bec6, roughness: .9, metalness: .05 }),
      stairs: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: .9, metalness: .05 }),
    };

    for (const key of Object.keys(parts)) {
      if (!parts[key].length) continue;
      const mesh = new THREE.Mesh(mergeGeometries(parts[key], false), mats[key]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }
  }

  /** План текущего этажа всех домов. */
  drawMinimap(ctx, size, playerPos) {
    ctx.fillStyle = '#3f6b2c';
    ctx.fillRect(0, 0, size, size);

    const toPx = (wx, wz) => {
      const [u, v] = this.worldToNormalized(wx, wz);
      return [u * size, v * size];
    };

    const floorHeight = CONFIG.building.floorHeight;
    const label = playerPos ? Math.max(0, Math.floor(playerPos.y / floorHeight)) : 0;

    for (const b of this.buildings) {
      const { cols, rows, cell, floors, originX, originZ, levels } = b;
      const k = Math.min(label, floors - 1);
      const grid = levels[k];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const c = grid[j][i];
          if (c === VOID) continue;
          const [x0, z0] = toPx(originX + i * cell, originZ + j * cell);
          const [x1, z1] = toPx(originX + (i + 1) * cell, originZ + (j + 1) * cell);
          if (c === WALL) ctx.fillStyle = '#262f3d';
          else if (c === WINDOW) ctx.fillStyle = '#33475e';
          else if (c === HOLE) ctx.fillStyle = '#5b4a2c';
          else ctx.fillStyle = 'rgba(196,212,232,.55)';
          ctx.fillRect(x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1));
        }
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Этаж ${label + 1}`, 10, 10);
  }
}

/** Создаёт карту-улицу по списку домов из CONFIG. */
export function createTownMap() {
  const base = CONFIG.building;
  const buildings = base.houses.map(h => generateBuilding({ ...base, ...h }));
  return new TownMap(buildings);
}
