import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { SolidField } from './solids.js';
import { circleHitsRect } from './map.js';

/**
 * Реализация контракта карты для уровней со сложным рельефом: холмы, горы с
 * пещерами, пропасти с мостами и пологими выходами. Домов нет — весь мир это
 * сетка «колонок» по клеткам, в каждой колонке лежат твёрдые слои: грунт от
 * «постели» до поверхности и накладные слои (перекрытие пещеры, настил моста).
 *
 * Семантика опоры и задержки та же, что у TownMap: перепад высот не больше
 * stepUp — проходимо (ступени, пологие склоны), больше — стена. Поэтому рельеф
 * даёт стены и потолки бесплатно: край пропасти непроходим вбок, крутой склон
 * горы — стена, по которой лазает Чужой (он видит те же AABB через raySolid).
 */

/** ГПСЧ mulberry32: рельеф детерминирован сидом уровня (см. AGENTS.md). */
function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = t => t * t * (3 - 2 * t);

export class TerrainMap extends SolidField {
  /**
   * @param {object} spec определение map из уровня (см. levels/level-01.js):
   *   width, cell, seed, hills, mountains[], caves[], chasm, ramps[],
   *   bridge, spawn — недостающие значения берутся из CONFIG.terrain
   */
  constructor(spec = {}) {
    const t = { ...CONFIG.terrain, ...spec };
    super(t.cell);
    this.cfg = t;
    this.width = t.width;
    this.depth = t.width;
    this.decor = {}; // уличной декорации на рельефе нет
    const cell = this.cell = t.cell;
    const half = this.half = t.width / 2;
    const N = this.N = Math.round(t.width / cell);
    this.stepUp = CONFIG.building.stepUp;

    const rng = makeRng(t.seed ?? 1);
    const n1 = this._noise(rng, t.hills.scale);
    const n2 = this._noise(rng, t.hills.scale / 2);
    // фоновые холмы: два октава value-noise, высота от 0.4 до amp+0.4
    const hills = (x, z) => 0.4 + t.hills.amp * (0.7 * n1(x, z) + 0.3 * n2(x, z));
    const mountains = t.mountains ?? [];
    const bump = (x, z) => {
      let s = 0;
      for (const m of mountains) {
        const dx = x - m.x, dz = z - m.z;
        s += m.h * Math.exp(-(dx * dx + dz * dz) / (m.r * m.r));
      }
      return s;
    };

    // колонки: грунт от постели до поверхности рельефа
    /** @type {{y0:number,y1:number,wood?:boolean}[][]} слои каждой клетки */
    this.layers = new Array(N * N);
    this.caveFlags = new Uint8Array(N * N);
    this.woodFlags = new Uint8Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = -half + (i + 0.5) * cell, z = -half + (j + 0.5) * cell;
        this.layers[j * N + i] = [{ y0: t.bedrock, y1: hills(x, z) + bump(x, z) }];
      }
    }

    // порядок фичей важен: площадки выравнивают, пещеры вырезают, пропасть
    // прорезает, откосы засыпают выход из неё, мост накрывает пролёт
    this._flats(t.flats);
    this._caves(t.caves, hills);
    this._chasm(t.chasm);
    this._ramps(t.ramps);
    this._bridge(t.bridge);

    // каждая колонка и каждый слой — отдельный AABB: физика Чужого и стрельба
    // видят рельеф так же, как дома (индекс и луч — в SolidField)
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const minX = -half + i * cell, minZ = -half + j * cell;
        for (const L of this.layers[j * N + i]) {
          this.solids.push({
            minX, maxX: minX + cell, minZ, maxZ: minZ + cell, minY: L.y0, maxY: L.y1,
          });
          if (L.wood) this.woodFlags[j * N + i] = 1;
        }
      }
    }
    this.indexSolids();
    // плоской земли-плоскости у рельефа нет: внизу могут быть пропасти глубже нуля

    this.bounds = { minX: -half, maxX: half, minZ: -half, maxZ: half };
    this.viewHalf = half + 24;
    const sx = t.spawn.x, sz = t.spawn.z;
    this.spawn = { x: sx, z: sz, y: this.groundHeightAt(sx, sz, 500) };

    this.nav = this._buildNav();
    this._bfsSeen = new Uint8Array(this.nav.pos.length);
    this._bfsPrev = new Int32Array(this.nav.pos.length);
  }

  /** Решёточный value-noise с гладкой интерполяцией в мировых координатах. */
  _noise(rng, scale) {
    const n = Math.ceil(this.width / scale) + 3;
    const g = new Float64Array(n * n);
    for (let i = 0; i < g.length; i++) g[i] = rng();
    return (x, z) => {
      const u = (x + this.half) / scale + 1, v = (z + this.half) / scale + 1;
      const i0 = Math.floor(u), j0 = Math.floor(v);
      const s = smooth(u - i0), q = smooth(v - j0);
      const a = g[j0 * n + i0], b = g[j0 * n + i0 + 1];
      const c = g[(j0 + 1) * n + i0], d = g[(j0 + 1) * n + i0 + 1];
      return (a + (b - a) * s) * (1 - q) + (c + (d - c) * s) * q;
    };
  }

  _eachCell(rect, fn) {
    const { cell, half, N } = this;
    const i0 = Math.max(0, Math.floor((rect.x0 + half) / cell));
    const i1 = Math.min(N - 1, Math.floor((rect.x1 + half) / cell) - 1);
    const j0 = Math.max(0, Math.floor((rect.z0 + half) / cell));
    const j1 = Math.min(N - 1, Math.floor((rect.z1 + half) / cell) - 1);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) fn(i, j);
    }
  }

  /** Выравнивает площадки в постоянную высоту (под мост, спавн, точку B). */
  _flats(list = []) {
    for (const f of list) {
      this._eachCell(f, (i, j) => {
        this.layers[j * this.N + i] = [{ y0: this.cfg.bedrock, y1: f.y }];
      });
    }
  }

  /**
   * Вырезает пещеры: в клетках внутри прямоугольника колонка делится на пол и
   * (если над проходом достаточно породы) перекрытие. Где породы меньше высоты
   * прохода, колонка срезается до пола — так в склоне горы получается прорезан
   * коридор-вход, а не глухой тупик.
   */
  _caves(list = [], hills) {
    for (const c of list) {
      const ch = c.height ?? this.cfg.caveHeight;
      const f = c.floor ?? (hills(c.x0, (c.z0 + c.z1) / 2) + hills(c.x1, (c.z0 + c.z1) / 2)) / 2;
      this._eachCell(c, (i, j) => {
        const idx = j * this.N + i;
        const L = this.layers[idx];
        if (L.length !== 1) return;
        const h = L[0].y1;
        if (h <= f + this.stepUp) return; // ниже порога — врезать нечего
        this.caveFlags[idx] = 1;
        if (h >= f + ch + this.cfg.roofMin) {
          this.layers[idx] = [
            { y0: this.cfg.bedrock, y1: f },
            { y0: f + ch, y1: h },
          ];
        } else {
          this.layers[idx] = [{ y0: this.cfg.bedrock, y1: f }];
        }
      });
    }
  }

  /** Прорезает пропасть: дно — поверхность рельефа минус глубина. */
  _chasm(chasm) {
    if (!chasm) return;
    this._eachCell(chasm, (i, j) => {
      const idx = j * this.N + i;
      for (const L of this.layers[idx]) {
        if (L.y0 === this.cfg.bedrock) L.y1 -= chasm.depth;
      }
    });
  }

  /** Засыпает пологие откосы (выход из пропасти без прыжков). */
  _ramps(list = []) {
    for (const r of list) {
      const a0 = r.axis === 'x' ? r.x0 : r.z0;
      const a1 = r.axis === 'x' ? r.x1 : r.z1;
      this._eachCell(r, (i, j) => {
        const w = r.axis === 'x' ? -this.half + i * this.cell : -this.half + j * this.cell;
        const tt = Math.min(Math.max((w - a0) / (a1 - a0), 0), 1);
        const y = r.from + (r.to - r.from) * tt;
        const idx = j * this.N + i;
        for (const L of this.layers[idx]) {
          if (L.y0 === this.cfg.bedrock && y > L.y1) L.y1 = y;
        }
      });
    }
  }

  /** Накладывает деревянный настил моста поверх пропасти. */
  _bridge(bridge) {
    if (!bridge) return;
    const th = bridge.thickness ?? this.cfg.bridgeThickness;
    this._eachCell(bridge, (i, j) => {
      this.layers[j * this.N + i].push({ y0: bridge.y - th, y1: bridge.y, wood: true });
    });
  }

  /** Индекс клетки по мировой точке; null — за краем мира. */
  _cell(x, z) {
    const i = Math.floor((x + this.half) / this.cell);
    const j = Math.floor((z + this.half) / this.cell);
    if (i < 0 || j < 0 || i >= this.N || j >= this.N) return null;
    return this.layers[j * this.N + i];
  }

  /**
   * Ближайшая опорная поверхность не выше fromY + шаг. Если под ногами ничего
   * нет (крутая стена при спавне/залипании) — опора на нижний край клетки,
   * оттуда тело дотянет рейкаст или падение.
   */
  groundHeightAt(x, z, fromY = 0) {
    const L = this._cell(x, z);
    if (!L) return this.cfg.bedrock;
    const limit = fromY + this.stepUp;
    let best = -Infinity;
    for (const s of L) if (s.y1 <= limit && s.y1 > best) best = s.y1;
    if (best === -Infinity) {
      // ничего не подошло — опора на нижний край клетки (падать дальше некуда)
      best = L[0].y1;
      for (const s of L) if (s.y1 < best) best = s.y1;
    }
    return best;
  }

  /** Коллизии габарита: слой, чья верхняя грань выше допустимого шага, — стена. */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;

    const y0 = feetY, y1 = feetY + height;
    const { cell, N } = this;
    const i0 = Math.max(0, Math.floor((x - radius + half) / cell));
    const i1 = Math.min(N - 1, Math.floor((x + radius + half) / cell));
    const j0 = Math.max(0, Math.floor((z - radius + half) / cell));
    const j1 = Math.min(N - 1, Math.floor((z + radius + half) / cell));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const minX = -half + i * cell, minZ = -half + j * cell;
        if (!circleHitsRect(x, z, minX, minX + cell, minZ, minZ + cell, radius)) continue;
        for (const L of this.layers[j * N + i]) {
          if (L.y1 <= y0 + this.stepUp || L.y0 >= y1) continue;
          return true;
        }
      }
    }
    return false;
  }

  /** Все опорные поверхности клеток — кандидаты для размещения монет. */
  openPositions() {
    const out = [];
    const { cell, half, N } = this;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        for (const L of this.layers[j * N + i]) {
          out.push({ x: -half + (i + 0.5) * cell, y: L.y1, z: -half + (j + 0.5) * cell });
        }
      }
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
   * Граф навигации: узел — каждая опорная поверхность клетки (пол пещеры,
   * крыша горного перекрытия, настил моста, дно пропасти — отдельные узлы),
   * ребро — соседство по клеткам, если перепад не больше navStep. Так маршрут
   * сам обходит отвесные стены и находит мосты, откосы и пещерные ходы.
   */
  _buildNav() {
    const pos = [];
    const adj = [];
    const ids = new Array(this.N * this.N);
    for (let j = 0; j < this.N; j++) {
      for (let i = 0; i < this.N; i++) {
        const idx = j * this.N + i;
        ids[idx] = [];
        const cx = -this.half + (i + 0.5) * this.cell;
        const cz = -this.half + (j + 0.5) * this.cell;
        for (const L of this.layers[idx]) {
          ids[idx].push(pos.length);
          pos.push({ x: cx, y: L.y1, z: cz });
          adj.push([]);
        }
      }
    }
    const link = (a, b) => { adj[a].push(b); adj[b].push(a); };
    const maxStep = this.cfg.navStep;
    for (let j = 0; j < this.N; j++) {
      for (let i = 0; i < this.N; i++) {
        const here = ids[j * this.N + i];
        for (const [di, dj] of [[1, 0], [0, 1]]) {
          const ni = i + di, nj = j + dj;
          if (ni >= this.N || nj >= this.N) continue;
          const there = ids[nj * this.N + ni];
          for (const a of here) {
            for (const b of there) {
              if (Math.abs(pos[a].y - pos[b].y) <= maxStep) link(a, b);
            }
          }
        }
      }
    }
    return { pos, adj };
  }

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

  randomNavPoint(x, z, radius, tries = 60) {
    const pos = this.nav.pos;
    for (let i = 0; i < tries; i++) {
      const p = pos[Math.floor(Math.random() * pos.length)];
      if (Math.hypot(p.x - x, p.z - z) <= radius) return p;
    }
    return null;
  }

  findPath(from, to) {
    const a = this._nearestNode(from.x, from.y, from.z);
    const b = this._nearestNode(to.x, to.y, to.z);
    if (a < 0 || b < 0) return null;
    if (a === b) return [this.nav.pos[b]];

    const { pos, adj } = this.nav;
    const seen = this._bfsSeen, prev = this._bfsPrev;
    const queue = [a];
    seen[a] = 1;
    prev[a] = -1;
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
    for (const i of queue) seen[i] = 0;
    if (!found) return null;
    const path = [];
    for (let cur = b; cur !== -1; cur = prev[cur]) path.push(pos[cur]);
    return path.reverse();
  }

  // ---------------------------------------------------------------- отрисовка

  /** Колонки клеток: скала и деревянный настил — по два слитых меша. */
  build(scene) {
    const rockGeos = [];
    const woodGeos = [];
    const { cell, half, N } = this;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const cx = -half + (i + 0.5) * cell, cz = -half + (j + 0.5) * cell;
        for (const L of this.layers[j * N + i]) {
          const g = new THREE.BoxGeometry(cell, L.y1 - L.y0, cell);
          g.translate(cx, (L.y0 + L.y1) / 2, cz);
          (L.wood ? woodGeos : rockGeos).push(g);
        }
      }
    }
    const add = (geos, mat) => {
      if (!geos.length) return;
      const mesh = new THREE.Mesh(mergeGeometries(geos, false), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    };
    add(rockGeos, new THREE.MeshStandardMaterial({ color: 0x8f8577, roughness: 0.95, metalness: 0 }));
    add(woodGeos, new THREE.MeshStandardMaterial({ color: 0x6e4b2c, roughness: 0.85, metalness: 0 }));
  }

  /** План: высота — оттенком, пещеры и настил — своим цветом. */
  drawMinimap(ctx, size, playerPos) {
    const { N, cell, half } = this;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const L = this.layers[idx];
        let top = -Infinity;
        for (const s of L) if (s.y1 > top) top = s.y1;
        let color;
        if (this.woodFlags[idx]) color = '#a97c3f';
        else if (this.caveFlags[idx]) color = '#4a3826';
        else if (top < -0.5) color = '#16324f';
        else color = top > 12 ? '#8a8578' : top > 6 ? '#6f7d4f' : '#3f6b2c';
        ctx.fillStyle = color;
        const [u, v] = this.worldToNormalized(-half + i * cell, -half + j * cell);
        const [u2, v2] = this.worldToNormalized(-half + (i + 1) * cell, -half + (j + 1) * cell);
        ctx.fillRect(u * size, v * size, Math.max((u2 - u) * size, 1), Math.max((v2 - v) * size, 1));
      }
    }
  }
}

/**
 * Создаёт карту-рельеф по определению уровня (см. src/levels/).
 * @param {object} spec map-секция главы с kind: 'terrain'
 */
export function createTerrainMap(spec = {}) {
  return new TerrainMap(spec);
}
