import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { makeRng } from './rng.js';
import { SolidField, circleHitsRect } from './solids.js';
import { NavGraph } from './nav-graph.js';
import { makeGrassMaterial } from './grass-material.js';

/**
 * Реализация контракта карты для уровней со сложным рельефом: холмы, горы с
 * пещерами, пропасти с мостами и пологими выходами. Домов нет — весь мир это
 * сетка «колонок» по клеткам, в каждой колонке лежат твёрдые слои: грунт от
 * «постели» до поверхности и накладные слои (перекрытие пещеры, настил моста).
 *
 * Семантика опоры и задержки та же, что у TownMap: перепад высот не больше
 * stepUp — проходимо (ступени, пологие склоны), больше — стена. Клетки, не
 * тронутые фичами, меряются по аналитической поверхности: меш, опора, габарит и
 * твёрдость для луча и сферы тела — один и тот же рельеф. Поэтому склон гладкий
 * и на вид, и на шаг, а стеной остаётся только то, что круче climbSlope. То же и
 * для свода пещеры: под ходом колонки держат пол и перекрытие, а гряда над ним
 * живёт поверхностью — иначе весь хребет, сквозь который идёт туннель, оставался
 * бы ступеньками. Колоночные фичи дают стены и потолки по-прежнему: край пропасти
 * непроходим вбок, вырезы пещер держат устья.
 */

const smooth = t => t * t * (3 - 2 * t);

/**
 * Пробы габарита: центр и восемь направлений на расстоянии радиуса. По ним
 * меряется уклон аналитической поверхности — так подъём остаётся плавным, а
 * отвесный участок всё равно блокирует независимо от сетки колонок.
 */
const PROBE_RING = [
  [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1],
  [0.707, 0.707], [0.707, -0.707], [-0.707, 0.707], [-0.707, -0.707],
];

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
    // предел подъёма: юнитов высоты на юнит пути — физика и маршруты меряют его
    // одинаково, иначе граф ведёт врагов там, где человек не влезает
    this.climb = t.climbSlope ?? 1.3;

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
    // клетка не тронута features: её опорную высоту даёт аналитическая
    // поверхность, а не центр колонки — иначе склон выглядит ступеньками
    this.smoothFlags = new Uint8Array(N * N).fill(1);
    // клетка отдаёт гладкую сетку поверхности (см. _smoothCellTris): это все
    // клетки, кроме тех, где фича меняет верхний край мира (площадка, пропасть,
    // откос, настил, прорез входа). Свод пещеры верхний край не меняет — гряда
    // над туннелем остаётся гладкой и снаружи, и для ходьбы.
    this.renderFlags = new Uint8Array(N * N).fill(1);
    // под клеткой вырезан ход с перекрытием: тогда сверху это ещё и гряда
    this.roofFlags = new Uint8Array(N * N);
    /** уровень свода пещеры под клеткой (пол + высота прохода) */
    this.caveCeil = new Float64Array(N * N);
    this._surface = (x, z) => hills(x, z) + bump(x, z);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = -half + (i + 0.5) * cell, z = -half + (j + 0.5) * cell;
        this.layers[j * N + i] = [{ y0: t.bedrock, y1: this._surface(x, z) }];
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
    // видят рельеф так же, как дома (индекс и луч — в SolidField). Кроме клеток,
    // чей верх — аналитическая поверхность: у неё нет «плоской крыши по центру
    // клетки», иначе под гладкой сеткой пряталась бы лестница из коробок, и
    // Чужой с пулями ходили бы по ступеням, которых не видно (см. _rockAt).
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const minX = -half + i * cell, minZ = -half + j * cell;
        const idx = j * N + i;
        for (const L of this.layers[idx]) {
          // аналитический верх (грунт гладкой клетки или каменный панцирь над
          // сводом) в солиды не попадает — его держит _rockAt; пол и стены хода,
          // настил моста, площадки и стенки пропасти остаются коробками
          if (this._isSurfaceNode(idx, L)) continue;
          this.solids.push({
            minX, maxX: minX + cell, minZ, maxZ: minZ + cell, minY: L.y0, maxY: L.y1,
          });
          if (L.wood) this.woodFlags[idx] = 1;
        }
      }
    }
    this.indexSolids();
    // плоской земли-плоскости у рельефа нет: внизу могут быть пропасти глубже нуля

    this.bounds = { minX: -half, maxX: half, minZ: -half, maxZ: half };
    this.viewHalf = half + 24;
    const sx = t.spawn.x, sz = t.spawn.z;
    this.spawn = { x: sx, z: sz, y: this.groundHeightAt(sx, sz, 500) };

    // граф навигации для врагов (узлы, рёбра и поиск маршрута — в NavGraph)
    this.nav = this._buildNav();
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

  /** Клетка тронута feature: опора и сетка берутся из колонок, а не из Surface. */
  _hard(idx) {
    this.smoothFlags[idx] = 0;
    this.renderFlags[idx] = 0;
  }

  /**
   * Над этой клеткой человек идёт по аналитической поверхности, а не по
   * колонке: либо это нетронутая клетка, либо свод пещеры под ногами (ноги
   * выше перекрытия — там, откуда видна гряда).
   */
  _isSurfaceAt(idx, feetY) {
    return this.smoothFlags[idx] === 1 || (this.roofFlags[idx] === 1 && feetY >= this.caveCeil[idx]);
  }

  /**
   * Слой колонки, верх которого — аналитическая поверхность, а не край
   * колонки: грунт нетронутой клетки или свод пещеры (его верх под сеткой
   * гряды, поэтому и опора, и узел навигации берутся из поверхности).
   */
  _isSurfaceNode(idx, L) {
    return this.smoothFlags[idx] === 1
      || (this.roofFlags[idx] === 1 && L.y0 >= this.caveCeil[idx]);
  }

  /** Опорная высота верхнего края слоя для ходьбы, маршрутов и монет. */
  _nodeHeight(idx, L, x, z) {
    return this._isSurfaceNode(idx, L) ? this._surface(x, z) : L.y1;
  }

  /**
   * Минимум и максимум верха клетки. Вырезать надо, если порода поднимается
   * выше порога в любой точке клетки, а не только в центре: иначе «гладкая»
   * клетка с горбом у границы остаётся нетронутой, и кольцевая проба `isBlocked`
   * упирается в неё ровно у устья — тот самый тупик. Перекрытие пещеры, в свою
   * очередь, режем по минимуму, чтобы его верх не торчал над гладкой сеткой.
   */
  _cellTopSpan(i, j) {
    const idx = j * this.N + i;
    const L = this.layers[idx];
    if (!this.smoothFlags[idx]) {
      let flat = -Infinity;
      for (const s of L) if (s.y1 > flat) flat = s.y1;
      return { min: flat, max: flat };
    }
    const { cell, half } = this;
    const x0 = -half + i * cell, z0 = -half + j * cell;
    let min = Infinity, max = -Infinity;
    for (let b = 0; b <= 2; b++) {
      for (let a = 0; a <= 2; a++) {
        const y = this._surface(x0 + (a * cell) / 2, z0 + (b * cell) / 2);
        if (y < min) min = y;
        if (y > max) max = y;
      }
    }
    return { min, max };
  }

  /** Выравнивает площадки в постоянную высоту (под мост, спавн, точку B). */
  _flats(list = []) {
    for (const f of list) {
      this._eachCell(f, (i, j) => {
        const idx = j * this.N + i;
        this.layers[idx] = [{ y0: this.cfg.bedrock, y1: f.y }];
        this._hard(idx);
      });
    }
  }

  /**
   * Вырезает пещеры: в клетках внутри прямоугольника колонка делится на пол и
   * перекрытие. Свод ставим так, чтобы над ним всегда оставался каменный панцирь
   * толщиной `roofCap`: иначе порода тоньше человека, и под нарисованным склоном
   * появляется невидимая плита — идущий проваливается в ход или упирается в неё.
   * Не хватает места и на ход (`caveMinHeight`), и на панцирь — свод не делаем,
   * это прорез-выемка (как у входа в туннель).
   */
  _caves(list = [], hills) {
    for (const c of list) {
      const ch = c.height ?? this.cfg.caveHeight;
      const f = c.floor ?? (hills(c.x0, (c.z0 + c.z1) / 2) + hills(c.x1, (c.z0 + c.z1) / 2)) / 2;
      this._eachCell(c, (i, j) => {
        const idx = j * this.N + i;
        const L = this.layers[idx];
        if (L.length !== 1) return;
        const { min, max } = this._cellTopSpan(i, j);
        if (max <= f + this.stepUp) return; // ниже порога — врезать нечего
        this.caveFlags[idx] = 1;
        this._hard(idx);
        const ceil = Math.min(f + ch, min - this.cfg.roofCap);
        if (ceil >= f + this.cfg.caveMinHeight) {
          this.layers[idx] = [
            { y0: this.cfg.bedrock, y1: f },
            { y0: ceil, y1: min },
          ];
          // над сводом — снова гряда: её рисует и держит аналитическая
          // поверхность, а колонки остаются только полом хода
          this.roofFlags[idx] = 1;
          this.caveCeil[idx] = ceil;
          this.renderFlags[idx] = 1;
        } else {
          this.layers[idx] = [{ y0: this.cfg.bedrock, y1: f }];
        }
      });
    }
  }

  /**
   * Прорезает пропасть: дно — поверхность рельефа минус глубина либо
   * постоянная отметка `floor` (плоское дно: по нему можно дойти до откоса со
   * любой точки, а бугры холмов не превращаются в ловушки-карманы).
   */
  _chasm(chasm) {
    if (!chasm) return;
    this._eachCell(chasm, (i, j) => {
      const idx = j * this.N + i;
      for (const L of this.layers[idx]) {
        if (L.y0 === this.cfg.bedrock) {
          L.y1 = chasm.floor ?? L.y1 - chasm.depth;
        }
      }
      this._hard(idx);
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
          if (L.y0 === this.cfg.bedrock && y > L.y1) { L.y1 = y; this._hard(idx); }
        }
      });
    }
  }

  /** Накладывает деревянный настил моста поверх пропасти. */
  _bridge(bridge) {
    if (!bridge) return;
    const th = bridge.thickness ?? this.cfg.bridgeThickness;
    this._eachCell(bridge, (i, j) => {
      const idx = j * this.N + i;
      this.layers[idx].push({ y0: bridge.y - th, y1: bridge.y, wood: true });
      this._hard(idx);
    });
  }

  /** Индекс клетки по мировой точке; -1 — за краем мира. */
  _cellIndex(x, z) {
    const i = Math.floor((x + this.half) / this.cell);
    const j = Math.floor((z + this.half) / this.cell);
    if (i < 0 || j < 0 || i >= this.N || j >= this.N) return -1;
    return j * this.N + i;
  }

  /** Слои клетки по мировой точке; null — за краем мира. */
  _cell(x, z) {
    const idx = this._cellIndex(x, z);
    return idx < 0 ? null : this.layers[idx];
  }

  /**
   * Ближайшая опорная поверхность не выше fromY + шаг. Если под ногами ничего
   * нет (крутая стена при спавне/залипании) — опора на нижний край клетки,
   * оттуда тело дотянет рейкаст или падение.
   *
   * Клетки, не тронутые features, отвечают точным значением аналитической
   * поверхности: опора непрерывна между клетками, поэтому на склоне человек
   * идёт, а не перешагивает ступени колонок. Стены, пещеры и пропасти остаются
   * колоночными — там ступенька и должна быть стеной.
   */
  groundHeightAt(x, z, fromY = 0) {
    const idx = this._cellIndex(x, z);
    if (idx < 0) return this.cfg.bedrock;
    if (this._isSurfaceAt(idx, fromY)) return this._surface(x, z);
    const L = this.layers[idx];
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

  /**
   * Коллизии габарита. Гладкий рельеф держит только там, где поверхность
   * растёт быстрее, чем нога перешагивает в пределах радиуса (climbSlope):
   * пробы снимаются по кольцу вокруг точки, поэтому подъём плавный и без
   * невидимой грани ровно на границе колонок. Колонки фичей (пещеры, настил
   * моста, стенки пропасти, площадки) остаются как были — там ступенька и
   * должна быть стеной.
   */
  isBlocked(x, z, radius, feetY = 0, height = 2) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;

    const climb = this.climb;
    for (const [ox, oz] of PROBE_RING) {
      const sx = x + ox * radius, sz = z + oz * radius;
      const idx = this._cellIndex(sx, sz);
      if (idx < 0) return true;
      if (this._isSurfaceAt(idx, feetY) && this._surface(sx, sz) > feetY + climb * radius) return true;
    }

    const y0 = feetY, y1 = feetY + height;
    const { cell, N } = this;
    const i0 = Math.max(0, Math.floor((x - radius + half) / cell));
    const i1 = Math.min(N - 1, Math.floor((x + radius + half) / cell));
    const j0 = Math.max(0, Math.floor((z - radius + half) / cell));
    const j1 = Math.min(N - 1, Math.floor((z + radius + half) / cell));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const minX = -half + i * cell, minZ = -half + j * cell;
        const idx = j * N + i;
        if (this._isSurfaceAt(idx, y0)) continue; // его разобрало кольцо проб выше
        if (!circleHitsRect(x, z, minX, minX + cell, minZ, minZ + cell, radius)) continue;
        for (const L of this.layers[idx]) {
          if (L.y1 <= y0 + this.stepUp || L.y0 >= y1) continue;
          return true;
        }
      }
    }
    return false;
  }

  // ------------------------------------------------- твёрдость как у картинки

  /**
   * Порода в точке — ровно то, что нарисовано: столб гладкой клетки сплошной до
   * аналитической поверхности, а у клетки со сводом пещеры сплошным является
   * каменный панцирь от перекрытия до поверхности (сам ход под ним — коробки,
   * их разбирает SolidField). Без этого солиды оставались вершинами колонок по
   * центру клетки: гладкая гора на вид и лестница из ступеней для тела Чужого и
   * для пуль.
   */
  _rockAt(x, y, z) {
    const idx = this._cellIndex(x, z);
    if (idx < 0) return false;
    if (this.smoothFlags[idx]) return y < this._surface(x, z);
    if (!this.roofFlags[idx]) return false;
    return y >= this.caveCeil[idx] && y < this._surface(x, z);
  }

  /** Наклон аналитической поверхности (для нормалей удара и выталкивания). */
  _gradient(x, z) {
    const e = this.cfg.normalEps;
    return {
      x: (this._surface(x + e, z) - this._surface(x - e, z)) / (2 * e),
      z: (this._surface(x, z + e) - this._surface(x, z - e)) / (2 * e),
    };
  }

  /**
   * Рейкаст к первой твёрдой точке рельефа: коробка фичи и аналитическая
   * порода меряются вместе, побеждает удар ближе. Так и Чужой, и стрельба
   * видят тот же край горы, что и камера.
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const box = super.raySolid(ox, oy, oz, dx, dy, dz, maxDist);
    const rock = this._rayRock(ox, oy, oz, dx, dy, dz, box ? box.dist : maxDist);
    if (!rock) return box;
    if (!box || rock.dist < box.dist) return rock;
    return box;
  }

  /**
   * Маршевый луч по аналитической породе: первый переход «пусто → порода»,
   * положение уточняем половинным делением, поэтому шаг марша не влияет на
   * точность удара.
   */
  _rayRock(ox, oy, oz, dx, dy, dz, limit) {
    const len = Math.hypot(dx, dy, dz);
    if (len < 1e-9 || limit <= 0) return null;
    const ux = dx / len, uy = dy / len, uz = dz / len;
    if (this._rockAt(ox, oy, oz)) return this._rockHit(ox, oy, oz, 0);
    const step = this.cfg.rayStep;
    let prev = 0;
    for (let t = step; t <= limit + step; t += step) {
      const tt = Math.min(t, limit);
      if (this._rockAt(ox + ux * tt, oy + uy * tt, oz + uz * tt)) {
        let lo = prev, hi = tt;
        for (let k = 0; k < 6; k++) {
          const mid = (lo + hi) / 2;
          if (this._rockAt(ox + ux * mid, oy + uy * mid, oz + uz * mid)) hi = mid;
          else lo = mid;
        }
        return this._rockHit(ox + ux * hi, oy + uy * hi, oz + uz * hi, hi);
      }
      prev = tt;
      if (tt >= limit) break;
    }
    return null;
  }

  /** Точка удара в аналитическую породу и её нормаль. */
  _rockHit(x, y, z, dist) {
    const idx = this._cellIndex(x, z);
    // снизу в перекрытие хода — грань горизонтальна, нормаль смотрит вниз.
    // Допуск покрывает ошибку половинного деления луча: точка удара лежит
    // чуть выше свода, а не ровно на нём.
    if (idx >= 0 && this.roofFlags[idx] && y <= this.caveCeil[idx] + 0.05) {
      return { x, y, z, nx: 0, ny: -1, nz: 0, dist };
    }
    const g = this._gradient(x, z);
    const inv = 1 / Math.hypot(g.x, 1, g.z);
    return { x, y, z, nx: -g.x * inv, ny: inv, nz: -g.z * inv, dist };
  }

  /**
   * Выталкивание сферы тела: коробки фичей — как в SolidField, наклонённый
   * край аналитической породы — вдоль её нормали. По коробкам колонок сфера
   * цеплялась за невидимые уступы и Чужому приходилось прыгать там, где глазу
   * виден плавный склон.
   */
  resolveSphere(c, r) {
    const moved = super.resolveSphere(c, r);
    const idx = this._cellIndex(c.x, c.z);
    if (idx < 0) return moved;
    // колонки фичей (площадки, пропасти, мосты) к склону отношения не имеют, а
    // внутри хода сферу держат его пол и перекрытие — тоже коробки
    if (!this.smoothFlags[idx] && (!this.roofFlags[idx] || c.y < this.caveCeil[idx])) return moved;
    const s = this._surface(c.x, c.z);
    // панцирь над ходом — плита с двумя сторонами: если центр тела оказался
    // внутри неё, выталкиваем к ближайшей грани. Ближе низ — возвращаем в ход,
    // а не выбрасываем Чужого сквозь перекрытие на гряду.
    if (!this.smoothFlags[idx] && c.y < s) {
      const ceil = this.caveCeil[idx];
      if (c.y - ceil < s - c.y) {
        c.y = ceil - r;
        return true;
      }
    }
    const g = this._gradient(c.x, c.z);
    const inv = 1 / Math.hypot(g.x, 1, g.z);
    const nx = -g.x * inv, ny = inv, nz = -g.z * inv;
    const dist = (c.y - s) * ny;
    if (dist >= r) return moved;
    const k = r - dist;
    c.x += nx * k;
    c.y += ny * k;
    c.z += nz * k;
    return true;
  }

  /** Все опорные поверхности клеток — кандидаты для размещения монет. */
  openPositions() {
    const out = [];
    const { cell, half, N } = this;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        const x = -half + (i + 0.5) * cell;
        const z = -half + (j + 0.5) * cell;
        for (const L of this.layers[idx]) {
          out.push({ x, y: this._nodeHeight(idx, L, x, z), z });
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
   * гряда над её сводом, настил моста, дно пропасти — отдельные узлы), ребро —
   * соседство по клеткам, если перепад не больше navStep. Так маршрут сам
   * обходит отвесные стены и находит мосты, откосы и пещерные ходы.
   *
   * Узлы, стоящие на аналитической поверхности (нетронутая клетка или свод
   * пещеры), связываются тем же уклоном, что и физика, и берут высоту из неё:
   * иначе враги не видели бы пологого хребта над туннелем, а пол хода
   * соединялся бы с крышей.
   */
  _buildNav() {
    const nav = new NavGraph();
    const ids = new Array(this.N * this.N);
    for (let j = 0; j < this.N; j++) {
      for (let i = 0; i < this.N; i++) {
        const idx = j * this.N + i;
        ids[idx] = [];
        const cx = -this.half + (i + 0.5) * this.cell;
        const cz = -this.half + (j + 0.5) * this.cell;
        for (const L of this.layers[idx]) {
          // meta узла — «стоим на аналитической поверхности», а не на краю колонки
          const id = nav.add(cx, this._nodeHeight(idx, L, cx, cz), cz, undefined,
            this._isSurfaceNode(idx, L));
          ids[idx].push(id);
        }
      }
    }
    const link = (a, b) => nav.link(a, b);
    const pos = nav.pos;
    const surf = nav.meta;
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
              // пара поверхностных узлов меряется тем же уклоном, что и физика:
              // иначе маршрут вёл бы врагов сквозь невидимую стену (или мимо
              // реального пологого подъёма); перепад центров там ничего не решает
              if (surf[a] && surf[b]) {
                if (this._smoothLink(i, j, ni, nj)) link(a, b);
              } else if (Math.abs(pos[a].y - pos[b].y) <= maxStep) {
                link(a, b);
              }
            }
          }
        }
      }
    }
    return nav.seal();
  }

  /**
   * Проходимо ли между центрами двух гладких клеток: поверхность прощупывается
   * вдоль отрезка, и если подъём на одном шаге пробы больше climb × расстояния
   * между пробами — это стена, а не склон.
   */
  _smoothLink(i, j, ni, nj) {
    const { cell, half } = this;
    const ax = -half + (i + 0.5) * cell, az = -half + (j + 0.5) * cell;
    const bx = -half + (ni + 0.5) * cell, bz = -half + (nj + 0.5) * cell;
    const steps = 4, spacing = cell / steps;
    let prev = this._surface(ax, az);
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const y = this._surface(ax + (bx - ax) * t, az + (bz - az) * t);
      if (Math.abs(y - prev) > this.climb * spacing) return false;
      prev = y;
    }
    return true;
  }

  randomNavPoint(x, z, radius) {
    return this.nav.randomPoint(x, z, radius);
  }

  findPath(from, to) {
    return this.nav.findPath(from, to);
  }

  // ---------------------------------------------------------------- отрисовка

  /**
   * Колонки клеток: скала и деревянный настил — по два слитых меша. Нетронутые
   * features клетки вместо колонки дают гладкую поверхность (см. _smoothCellTris)
   * — силуэт горы не распадается на ступени по 4 юнита.
   */
  build(scene) {
    this.sceneObjects = [];
    const rockGeos = [];
    const woodGeos = [];
    const { cell, half, N } = this;
    const tri = [];
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const idx = j * N + i;
        if (this.renderFlags[idx]) this._smoothCellTris(i, j, tri);
        if (this.smoothFlags[idx]) continue; // нет колонок — только сетка
        const cx = -half + (i + 0.5) * cell, cz = -half + (j + 0.5) * cell;
        for (const L of this.layers[idx]) {
          const g = new THREE.BoxGeometry(cell, L.y1 - L.y0, cell);
          g.translate(cx, (L.y0 + L.y1) / 2, cz);
          (L.wood ? woodGeos : rockGeos).push(g);
        }
      }
    }

    const rockMat = new THREE.MeshStandardMaterial({ color: 0x8f8577, roughness: 0.95, metalness: 0 });
    // гладкая поверхность рельефа (зелёные холмы) — травяной шейдерный материал
    const grassMat = makeGrassMaterial(0x4f7a35, { scale: 0.42, strength: 0.24, dark: 0.2 });
    if (tri.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3));
      const welded = mergeVertices(g);
      welded.computeVertexNormals();
      const mesh = new THREE.Mesh(welded, grassMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      this.sceneObjects.push({ mesh, geo: welded, mat: grassMat });
    }

    const add = (geos, mat) => {
      if (!geos.length) return;
      const g = mergeGeometries(geos, false);
      const mesh = new THREE.Mesh(g, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      this.sceneObjects.push({ mesh, geo: g, mat });
    };
    add(rockGeos, rockMat);
    add(woodGeos, new THREE.MeshStandardMaterial({ color: 0x6e4b2c, roughness: 0.85, metalness: 0 }));
  }

  /**
   * Снимает со сцены меши рельефа и их геометрии/материалы: всё создано
   * `build` для себя, общих материалов у рельефа нет (AGENTS.md про
   * dispose-контракт классов карт).
   */
  dispose() {
    for (const o of this.sceneObjects ?? []) {
      o.mesh.parent?.remove(o.mesh);
      o.geo?.dispose?.();
      o.mat?.dispose?.();
    }
    this.sceneObjects = [];
  }

  /**
   * Треугольники одной «гладкой» клетки: сетка renderSub×renderSub, чьи вершины
   * берутся прямо из аналитической поверхности рельефа, — соседние клетки делят
   * одни и те же значения на общей границе, поэтому стык непрерывен и ступеньки
   * нет. Там, где сосед — feature (пещера, пропасть, площадка, край мира),
   * опускаем «юбку» до постели: иначе между сеткой и колонкой видна дырка.
   * Обход вершин — против часовой, если смотреть со стороны нормали.
   */
  _smoothCellTris(i, j, tri) {
    const { cell, half, N } = this;
    const sub = Math.max(1, Math.round(this.cfg.renderSub ?? 3));
    const step = cell / sub;
    const x0 = -half + i * cell, z0 = -half + j * cell;
    const bed = this.cfg.bedrock;

    // сетка высот (sub+1)², включая границы клетки
    const h = new Float64Array((sub + 1) * (sub + 1));
    for (let b = 0; b <= sub; b++) {
      for (let a = 0; a <= sub; a++) {
        h[b * (sub + 1) + a] = this._surface(x0 + a * step, z0 + b * step);
      }
    }
    const at = (a, b) => h[b * (sub + 1) + a];
    const X = a => x0 + a * step, Z = b => z0 + b * step;
    const push = (v) => { for (let k = 0; k < 9; k++) tri.push(v[k]); };

    for (let b = 0; b < sub; b++) {
      for (let a = 0; a < sub; a++) {
        push([X(a), at(a, b), Z(b), X(a), at(a, b + 1), Z(b + 1), X(a + 1), at(a + 1, b + 1), Z(b + 1)]);
        push([X(a), at(a, b), Z(b), X(a + 1), at(a + 1, b + 1), Z(b + 1), X(a + 1), at(a + 1, b), Z(b)]);
      }
    }

    // Сосед закрывает стык своей сеткой, только если у него под сеткой сплошная
    // порода. Свод пещеры — не сплошная: под ним полый ход, и убери юбку — в
    // стене коридора появилась бы дыра насквозь в склон. Обе клетки пещерные —
    // юбку тоже не ставим: общая плоскость — часть одного хода, и панель
    // перерезала бы коридор ровно там, где он уходит под свод.
    const here = this.caveFlags[j * N + i];
    const skinned = (ni, nj) => {
      if (ni < 0 || nj < 0 || ni >= N || nj >= N) return false;
      const n = nj * N + ni;
      if (this.renderFlags[n] && this.smoothFlags[n]) return true;
      return here && this.caveFlags[n] === 1;
    };
    const quad = (p) => {
      push([p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8]]);
      push([p[0], p[1], p[2], p[6], p[7], p[8], p[9], p[10], p[11]]);
    };
    // Грань сдвигаем внутрь клетки: сосед-колонка имеет ровно ту же грань на
    // границе, и две соударяющиеся плоскости мерцают (z-fighting).
    const inset = 0.02;
    // грань при постоянном x (нормаль ±X), идёт вдоль Z по столбцу col
    const faceX = (x, col, dir) => {
      for (let b = 0; b < sub; b++) {
        const Ta = [x, at(col, b), Z(b)], Tb = [x, at(col, b + 1), Z(b + 1)];
        const Ba = [x, bed, Z(b)], Bb = [x, bed, Z(b + 1)];
        if (dir > 0) quad([...Ta, ...Tb, ...Bb, ...Ba]); // +X
        else quad([...Ta, ...Ba, ...Bb, ...Tb]); // −X
      }
    };
    // грань при постоянном z (нормаль ±Z), идёт вдоль X по строке row
    const faceZ = (z, row, dir) => {
      for (let a = 0; a < sub; a++) {
        const Ta = [X(a), at(a, row), z], Tb = [X(a + 1), at(a + 1, row), z];
        const Ba = [X(a), bed, z], Bb = [X(a + 1), bed, z];
        if (dir > 0) quad([...Ta, ...Ba, ...Bb, ...Tb]); // +Z
        else quad([...Ta, ...Tb, ...Bb, ...Ba]); // −Z
      }
    };
    // запад — грань при a=0 (нормаль −X), восток — при a=sub (+X)
    if (!skinned(i - 1, j)) faceX(x0 + inset, 0, -1);
    if (!skinned(i + 1, j)) faceX(x0 + cell - inset, sub, +1);
    // север (z0) — нормаль −Z, юг (z1) — +Z
    if (!skinned(i, j - 1)) faceZ(z0 + inset, 0, -1);
    if (!skinned(i, j + 1)) faceZ(z0 + cell - inset, sub, +1);
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
