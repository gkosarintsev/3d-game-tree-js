import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { SolidField, circleHitsRect } from './solids.js';
import { NavGraph } from './nav-graph.js';
import { subtractRect } from './geo2d.js';
import { buildProps } from './props.js';

const J = CONFIG.jsonMap;

/** Нормаль грани по обходу (правая рука), единичная. */
function faceNormal(p0, p1, p2) {
  const a = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const b = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
  const n = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const l = Math.hypot(n[0], n[1], n[2]) || 1;
  return [n[0] / l, n[1] / l, n[2] / l];
}

/**
 * Карта уровня, собранного из брифа (глава 9): дома с комнатами и этажами, три
 * типа дорог, лестницы трёх видов, двери, насыпи и откосы.
 *
 * Числа и топологию готовит Node-парсер (`tools/normalize-level.mjs`): он
 * замывает полигоны, режет footprint на союз прямоугольников, считает высоты
 * этажей, проступи маршей и пластины настилов. Здесь остаётся то, что нельзя
 * посчитать без движка: AABB-солиды и плоские опоры для `SolidField`,
 * коллизии габарита (стена минус дверной проём), граф навигации и меш.
 *
 * Контракт карты (см. AGENTS.md) держится полностью: движок не знает, что уровень
 * пришёл из JSON, и отличает его только по `map.kind` в `Game.createMap`.
 */
export class JsonMap extends SolidField {
  /** @param {object} spec map-секция определения главы (LEVEL_09.map) */
  constructor(spec) {
    super(J.solidBucket);
    this.kind = 'json';
    this.spec = spec;

    const ground = spec.ground;
    this.groundY = ground.y;
    this.width = ground.size;
    this.depth = ground.size;
    this.half = ground.size / 2;
    this.groundColor = ground.color ?? J.asphalt;
    this.stepUp = CONFIG.building.stepUp;
    this.bounds = spec.bounds;
    this.viewHalf = this.half + 24;
    // земля уровня — общая плоскость: рейкаст вниз опирается на неё, а не на
    // сетку солидов (плит полов под ногами всё равно хватает, но луч из-за
    // предела высоты должен иметь куда упасть)
    this.groundPlane = { y: this.groundY, half: this.half };

    this.buildings = spec.buildings ?? [];
    this.roads = spec.roads ?? [];
    this.props = spec.props ?? [];
    this.lightSpecs = spec.lights ?? [];

    /** @type {{minX,maxX,minZ,maxZ,y0,y1}[]} стены, насыпь и откосы */
    this.blockers = [];
    this.geo = { walls: [], slabs: [], stairs: [], decks: [], earth: [] };
    /** план марша с этажами, между которыми он стоит: клетки пола внутри него не ставятся */
    this.stairCells = [];
    /** плиты полов комнат: опоры, узлы навигации и миникарта */
    this.floorPlates = [];
    this.deckPlates = [];
    /** наклонные твёрдости: пролёты настилов и откосы насыпи — призмы профиля (u, y) */
    this.prisms = [];
    this._blockIndex = new Map();
    this._blockBucket = J.navStep;

    this._collectBuildings();
    this._collectRoads();
    this.indexSolids();
    this._indexSurfaces();
    this._indexBlockers();

    const s = spec.spawn ?? { x: 0, z: 0 };
    this.spawn = { x: s.x, y: this.groundHeightAt(s.x, s.z, this.groundY), z: s.z };
    this.anchors = this._collectAnchors();
    this.nav = this._buildNav();
  }

  // ------------------------------------------------------------- твёрдость уровня

  /**
   * Параллелепипед уровня: геометрия, солид и — по флагу — опора или коллизия.
   * `geoTop` опускает верхнюю грань картинки ниже верха солида: там, где грань
   * другого тела лежит ровно на той же отметке (стена примыкает к кровле),
   * со-плоскостные грани мигают в глубине; сдвиг в 3 см не виден, а коллизия
   * обязана остаться на месте — срезанный солид пропустил бы идущего с крыши
   * сквозь парапет.
   */
  _box(plan, y0, y1, group, { collide = false, surface = false, geoTop = null } = {}) {
    if (plan.maxX - plan.minX <= 1e-6 || plan.maxZ - plan.minZ <= 1e-6 || y1 - y0 <= 1e-6) return;
    const g1 = Math.max(y0 + 1e-6, geoTop ?? y1);
    this.geo[group].push(new THREE.BoxGeometry(
      plan.maxX - plan.minX, g1 - y0, plan.maxZ - plan.minZ,
    ).translate(
      (plan.minX + plan.maxX) / 2, (y0 + g1) / 2, (plan.minZ + plan.maxZ) / 2,
    ));
    this.solids.push({
      minX: plan.minX, maxX: plan.maxX, minY: y0, maxY: y1, minZ: plan.minZ, maxZ: plan.maxZ,
    });
    if (collide) {
      this.blockers.push({ ...plan, y0, y1 });
    }
    if (surface) {
      this.surfaces.push({ minX: plan.minX, maxX: plan.maxX, minZ: plan.minZ, maxZ: plan.maxZ, y: y1 });
    }
  }

  /** Общее пересечение двух прямоугольников в плане; null — не пересекаются. */
  _clip(a, b) {
    const minX = Math.max(a.minX, b.minX), maxX = Math.min(a.maxX, b.maxX);
    const minZ = Math.max(a.minZ, b.minZ), maxZ = Math.min(a.maxZ, b.maxZ);
    return maxX - minX > 1e-6 && maxZ - minZ > 1e-6 ? { minX, maxX, minZ, maxZ } : null;
  }

  _collectBuildings() {
    for (const b of this.buildings) {
      for (const w of b.walls) this._wall(w, b);
      for (const r of b.rooms) this._floorPlate(b, r);
      for (const s of b.stairs) this._stair(s);
      // крыша — солид, но НЕ опора: ExitGoal берёт отметку точки B как
      // groundHeightAt(x, z, 500), то есть самый верх из опор. Сделав крышу
      // опорой, точку B подняли бы на кровлю, а цель ищут на последнем этаже
      for (const rect of b.rects) {
        this._box(rect, b.roofY - J.slabThickness, b.roofY, 'slabs');
      }
    }
  }

  /**
   * Стена полосы: для каждого этажа, чья комната граничит с ней, свой отрезок
   * высоты, а план режется на участки только там, где эта граница есть. Иначе
   * на этаже со свободным пространством выросла бы невидимая перегородка.
   */
  _wall(w, b) {
    const plan = { minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ };
    if (!b.rooms.length) {
      this._wallBand({ ...plan, y0: b.baseY, y1: b.roofY }, b.doors, b.roofY - J.roofSeam);
      return;
    }
    const byLevel = new Map();
    for (const r of b.rooms) {
      const seg = this._wallSegment(w, r);
      if (!seg) continue;
      const key = `${r.y}`;
      if (!byLevel.has(key)) byLevel.set(key, []);
      byLevel.get(key).push(seg);
    }
    // участки одного этажа сливаем: две соседние комнаты дают одну перегородку,
    // а два солида вместо одного — лишний AABB и лишняя граница на миникарте
    const along = w.axis === 'z' ? ['minZ', 'maxZ'] : ['minX', 'maxX'];
    for (const [y, runs] of byLevel) {
      runs.sort((a, c) => a[along[0]] - c[along[0]]);
      let cur = null;
      const bands = [];
      for (const r of runs) {
        if (cur && r[along[0]] <= cur[along[1]] + 0.02) {
          cur[along[1]] = Math.max(cur[along[1]], r[along[1]]);
          continue;
        }
        cur = r;
        bands.push(r);
      }
      for (const band of bands) {
        const y1 = Number(y) + b.floorHeight;
        // кровля всегда на отметке верхнего этажа + floorHeight (считает парсер),
        // поэтому верх последней полосы совпадает с верхом её плиты — картинку
        // полосы опускаем на шов, солид остаётся до кровли
        const seam = Math.abs(y1 - b.roofY) < 1e-6 ? y1 - J.roofSeam : null;
        this._wallBand({ ...plan, ...band, y0: Number(y), y1 }, b.doors, seam);
      }
    }
  }

  /** Участок полосы стены, которым граничит комната; null — комната не при стене. */
  _wallSegment(w, r, eps = 0.02) {
    if (w.axis === 'z') {
      const x = (w.minX + w.maxX) / 2;
      if (Math.abs(r.rect.minX - x) > eps && Math.abs(r.rect.maxX - x) > eps) return null;
      const minZ = Math.max(w.minZ, r.rect.minZ), maxZ = Math.min(w.maxZ, r.rect.maxZ);
      return maxZ - minZ > eps ? { minZ, maxZ } : null;
    }
    const z = (w.minZ + w.maxZ) / 2;
    if (Math.abs(r.rect.minZ - z) > eps && Math.abs(r.rect.maxZ - z) > eps) return null;
    const minX = Math.max(w.minX, r.rect.minX), maxX = Math.min(w.maxX, r.rect.maxX);
    return maxX - minX > eps ? { minX, maxX } : null;
  }

  /**
   * Полоса стены с проёмами: план минус дыры дверей, а над и под каждой дырой
   * остаёт свой блок — перемычка (до потолка этажа) и подоконник, если дверь
   * не на уровне пола.
   */
  _wallBand(band, doors, geoTop = null) {
    const inBand = doors.filter(d =>
      d.y >= band.y0 - 0.01 && d.y < band.y1 - 0.01 && this._clip(band, d.rect));
    let pieces = [{ minX: band.minX, maxX: band.maxX, minZ: band.minZ, maxZ: band.maxZ }];
    for (const d of inBand) {
      const gap = this._clip(band, d.rect);
      pieces = pieces.flatMap(p => subtractRect(p, gap));
      if (d.y - band.y0 > 0.02) this._box(gap, band.y0, d.y, 'walls', { collide: true });
      const head = d.y + (d.height ?? J.doorHeight);
      // перемычка доходит до верха полосы — шов только у той, что упирается в кровлю
      if (band.y1 - head > 0.02) this._box(gap, head, band.y1, 'walls', { collide: true, geoTop });
    }
    for (const p of pieces) this._box(p, band.y0, band.y1, 'walls', { collide: true, geoTop });
  }

  /**
   * Плита пола комнаты: опора и солид, а вокруг марша, который проходит через
   * этот уровень, — проём. Без проёма перекрытие легло бы на лестницу, и
   * поднявшийся уткнулся бы в пол.
   */
  _floorPlate(b, r) {
    let pieces = [{ ...r.rect }];
    for (const s of b.stairs) {
      const [k0, k1] = s.connectsFloors;
      if (!(k0 < r.floor && r.floor <= k1)) continue;
      pieces = pieces.flatMap(p => subtractRect(p, s.rect));
    }
    // пол комнаты — на J.floorRise выше её отметки: у первого этажа отметка
    // равна земле уровня, и верх плиты лёг бы с её mesh в одну плоскость
    const top = r.y + J.floorRise;
    for (const p of pieces) {
      this._box(p, top - J.slabThickness, top, 'slabs', { surface: true });
      this.floorPlates.push({ ...p, y: top, room: r.id, floor: r.floor, building: b.id });
    }
  }

  /** Марш: коробки ступеней от пола, на котором он стоит, до каждой проступи. */
  _stair(s) {
    for (const st of s.steps) this._box(st, s.y0, st.top, 'stairs', { surface: true });
    this.stairCells.push({ ...s.rect, k0: s.connectsFloors[0], k1: s.connectsFloors[1] });
  }

  _collectRoads() {
    for (const road of this.roads) {
      for (const d of road.decks) {
        // знак разницы — направление подъёма: спуск с пролёта тоже наклонный
        if (Math.abs(d.topAtMax - d.topAtMin) > 0.01) this._incline(d);
        else this._box(d, d.bottomY, d.topY, 'decks', { surface: true });
        this.deckPlates.push({ ...d, road: road.id, roadType: road.type });
      }
      // насыпь: грунт под настилом — и опора быть не может, и идти сквозь него нельзя
      for (const f of road.fill) this._box(f, f.bottomY, f.topY, 'earth', { collide: true });
      for (const a of road.aprons) this._apron(a);
    }
  }

  /**
   * Наклонный пролёт настила: призма, верх которой — плоскость `y = k·u + c`
   * (u — координата вдоль оси пролёта), низ параллелен ей на толщине
   * `deckThickness`. Под пролётом остаётся воздух, как у плоской пластины той
   * же отметки, поэтому проходимость уровня не меняется.
   *
   * В `solids` пролёт не попадает: коробка с верхом по низу пролёта прятала бы
   * под гладкой картинкой лестницу невидимых ступеней (правило AGENTS «твёрдость
   * обязана совпадать с картинкой», ровно как у аналитического верха рельефа).
   * Его держат `groundHeightAt`, `raySolid` и `resolveSphere` по аналитике.
   */
  _incline(d) {
    const lo = d.axis === 'x' ? d.minX : d.minZ;
    const hi = d.axis === 'x' ? d.maxX : d.maxZ;
    const v0 = d.axis === 'x' ? d.minZ : d.minX;
    const v1 = d.axis === 'x' ? d.maxZ : d.maxX;
    if (hi - lo <= 1e-6 || v1 - v0 <= 1e-6) return;
    const k = (d.topAtMax - d.topAtMin) / (hi - lo);
    const c = d.topAtMin - k * lo;
    const t = J.deckThickness;
    const w = makePrism(d.axis, v0, v1, [[lo, k * lo + c], [hi, k * hi + c], [hi, k * hi + c - t], [lo, k * lo + c - t]]);
    this.prisms.push(w);
    this.geo.decks.push(this._prismGeo(w));
  }

  /**
   * Призма: выпуклый профиль в плоскости `(u, y)`, протянутый поперёк на
   * `[v0, v1]`. 4 вершины на грань — иначе `mergeGeometries` гладко сошьёт
   * нормали по ребру; обход каждой грани разворачивается от центра объёма
   * (многогранник выпуклый, значит «наружу» — то, что от центра). Без индекса
   * соседние коробки в смеси отказались бы сливаться.
   */
  _prismGeo(w) {
    const P = (u, y, v) => (w.axis === 'x' ? [u, y, v] : [v, y, u]);
    const pc = [0, 1].map(i => w.poly.reduce((a, p) => a + p[i], 0) / w.poly.length);
    const mid = (w.v0 + w.v1) / 2;
    const vol = w.axis === 'x' ? [pc[0], pc[1], mid] : [mid, pc[1], pc[0]];
    const pos = [], nor = [], uv = [], idx = [];
    const face = pts => {
      const n = faceNormal(pts[0], pts[1], pts[2]);
      const ref = [0, 1, 2].map(i => pts.reduce((a, p) => a + p[i], 0) / pts.length - vol[i]);
      const s = n[0] * ref[0] + n[1] * ref[1] + n[2] * ref[2] < 0 ? -1 : 1;
      const q = s < 0 ? [...pts].reverse() : pts;
      const base = pos.length / 3;
      for (const p of q) {
        pos.push(p[0], p[1], p[2]);
        nor.push(n[0] * s, n[1] * s, n[2] * s);
      }
      uv.push(0, 0, 1, 0, 0.5, 1, 0, 1);
      for (let k = 1; k + 1 < q.length; k++) idx.push(base, base + k, base + k + 1);
    };
    const n = w.poly.length;
    for (let i = 0; i < n; i++) {
      const p = w.poly[i], q = w.poly[(i + 1) % n];
      face([P(p[0], p[1], w.v0), P(q[0], q[1], w.v0), P(q[0], q[1], w.v1), P(p[0], p[1], w.v1)]);
    }
    for (const v of [w.v0, w.v1]) {
      for (let i = 1; i + 1 < n; i++) face([P(w.poly[0][0], w.poly[0][1], v), P(w.poly[i][0], w.poly[i][1], v), P(w.poly[i + 1][0], w.poly[i + 1][1], v)]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  }

  /**
   * Откос насыпи: призма с треугольным профилем — вертикальная грань в плане
   * полотна (её заглушает сама насыпь), гипотенуза — склон, основание на
   * грунте. Верхний край склона совпадает с **верхом** настила, поэтому с
   * полотна на откос и обратно сходятся ноги: коробка во всю высоту откоса
   * рисовала прямоугольник вместо скоса, опоры не имела вовсе и превращала
   * шаг за край в падение внутрь грунта, из которого нет дороги.
   *
   * Ни в `solids`, ни в `blockers` откос не попадает: твёрдость держит аналитика
   * призмы (опора, луч и сфера), и она обязана совпадать с картинкой.
   */
  _apron(a) {
    const run = Math.abs(a.run);
    const rise = a.topY - a.groundY;
    if (run <= 0.01 || rise <= 0.01) return;
    const toe = a.cross + a.dir * run;
    const axis = a.axis === 'x' ? 'z' : 'x';   // уклон идёт поперёк полотна
    const v = a.axis === 'x' ? [a.minX, a.maxX] : [a.minZ, a.maxZ];
    const w = makePrism(axis, Math.min(v[0], v[1]), Math.max(v[0], v[1]),
      [[a.cross, a.topY], [toe, a.groundY], [a.cross, a.groundY]]);
    this.prisms.push(w);
    this.geo.earth.push(this._prismGeo(w));
  }

  // ------------------------------------------------ твёрдость наклонных призм

  /**
   * Отметка верха ближайшей призмы над точкой плана (максимум, если их планы
   * пересекаются); null — ни одна не накрывает.
   */
  _prismTopAt(x, z) {
    let best = null;
    for (const w of this.prisms) {
      if (x < w.minX || x > w.maxX || z < w.minZ || z > w.maxZ) continue;
      const t = w.topAt(w.axis === 'x' ? x : z);
      if (t !== null && (best === null || t > best)) best = t;
    }
    return best;
  }

  /**
   * Опора: плоские плиты как у базового механизма, плюс верх наклонных призм —
   * у них нет одной отметки на весь план, поэтому в `surfaces` они не стоят.
   */
  groundHeightAt(x, z, fromY = 0) {
    const base = super.groundHeightAt(x, z, fromY);
    const top = this._prismTopAt(x, z);
    if (top === null || top <= base || top > fromY + this.stepUp) return base;
    return top;
  }

  /**
   * Луч: сначала обычные солиды и земля (базовый механизм), затем — наклонные
   * призмы. Их тел нет в `solids`, иначе коробка по низу пролёта спрятала бы под
   * гладкой картинкой лестницу невидимых ступеней, а коробка откоса — невидимую
   * стену там, где глаз видит склон: пуля и сфера тела Чужого опирались бы на
   * них, а не на наклон.
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const base = super.raySolid(ox, oy, oz, dx, dy, dz, maxDist);
    const limit = base ? base.dist : maxDist;
    let best = null;
    for (const w of this.prisms) {
      const h = rayWedge(w, ox, oy, oz, dx, dy, dz);
      if (h && h.t > 1e-6 && h.t < limit && (!best || h.t < best.t)) best = { ...h, w };
    }
    if (!best) return base;
    return { x: best.x, y: best.y, z: best.z, nx: best.nx, ny: best.ny, nz: best.nz, dist: best.t };
  }

  /**
   * Сфера тела (физика Чужого): солиды как обычно, затем выталкивание из призм
   * по ближайшей к центру точке их поверхности — вдоль неё нога и лапа идут
   * по подъёму, а не цепляются за ступени, которых нет.
   */
  resolveSphere(c, r) {
    const moved = super.resolveSphere(c, r);
    let fromWedge = false;
    for (const w of this.prisms) {
      if (pushOutWedge(c, r, w)) fromWedge = true;
    }
    return moved || fromWedge;
  }

  // -------------------------------------------------- коллизии габарита и опоры

  /** Коллизии габарита: стены этажей (с проёмами), грунт насыпи и откосы. */
  isBlocked(x, z, radius = CONFIG.radius, feetY = 0, height = CONFIG.eyeHeight) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;
    const b = this._blockBucket;
    const i0 = Math.floor((x - radius) / b), i1 = Math.floor((x + radius) / b);
    const j0 = Math.floor((z - radius) / b), j1 = Math.floor((z + radius) / b);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const list = this._blockIndex.get(this._key(i, j));
        if (!list) continue;
        for (const idx of list) {
          const w = this.blockers[idx];
          // порог 0.05: ступень стоит ровно под ногами и телу не препятствие
          if (w.y1 <= feetY + 0.05 || w.y0 >= feetY + height - 0.05) continue;
          if (circleHitsRect(x, z, w.minX, w.maxX, w.minZ, w.maxZ, radius)) return true;
        }
      }
    }
    return false;
  }

  _indexBlockers() {
    const b = this._blockBucket;
    this._blockIndex.clear();
    this.blockers.forEach((w, idx) => {
      const i0 = Math.floor(w.minX / b), i1 = Math.floor(w.maxX / b);
      const j0 = Math.floor(w.minZ / b), j1 = Math.floor(w.maxZ / b);
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const key = this._key(i, j);
          let list = this._blockIndex.get(key);
          if (!list) this._blockIndex.set(key, list = []);
          list.push(idx);
        }
      }
    });
  }

  /** Свободные точки уровня: центры плит полов, пластин настилов и сетки земли. */
  _collectAnchors() {
    const out = [];
    const push = (x, y, z) => out.push({ x, y, z });
    for (const p of this.floorPlates) {
      push((p.minX + p.maxX) / 2, p.y, (p.minZ + p.maxZ) / 2);
    }
    for (const d of this.deckPlates) {
      if (d.ramp) continue;
      push((d.minX + d.maxX) / 2, d.topY, (d.minZ + d.maxZ) / 2);
    }
    const step = J.navStep * 2;
    for (let z = -this.half + step / 2; z < this.half; z += step) {
      for (let x = -this.half + step / 2; x < this.half; x += step) {
        if (this._inBuilding(x, z)) continue;
        const y = this.groundHeightAt(x, z, this.groundY);
        if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
        push(x, y, z);
      }
    }
    return out;
  }

  openPositions() {
    return this.anchors.map(a => ({ ...a }));
  }

  /**
   * Метки для отладочного режима (`?debug=1`): по одной точке на каждый объект
   * данных, из которых собран уровень. Текст начинается с `id` из брифа, чтобы по
   * метке поле находилось в `level-09.json` поиском; у пластин настила, тела
   * насыпи и откосов своего `id` нет (их считает парсер), поэтому они подписываются
   * `id` дороги и своим видом.
   *
   * Точки берутся из той же геометрии, что и солиды с опорами: отладочный вывод
   * обязан отвечать про реальное тело уровня, а не пересчитывать высоты второй
   * копией арифметики парсера.
   *
   * @returns {{text: string, x: number, y: number, z: number}[]}
   */
  debugIds() {
    const out = [];
    const cx = r => (r.minX + r.maxX) / 2;
    const cz = r => (r.minZ + r.maxZ) / 2;
    const put = (text, x, y, z) => out.push({ text, x, y, z });

    for (const b of this.buildings) {
      put(b.id, cx(b.bounds), b.roofY + 1, cz(b.bounds));
      for (const r of b.rooms) put(`${r.id} · эт ${r.floor}`, cx(r.rect), r.y + 1.2, cz(r.rect));
      for (const s of b.stairs) put(`${s.id} · ${s.type}`, cx(s.rect), s.y1 + 0.7, cz(s.rect));
      for (const d of b.doors) put(`${d.id} · ${d.linkType}`, d.outside.x, d.y + d.height + 0.4, d.outside.z);
    }
    for (const road of this.roads) {
      const plan = road.decks.reduce((a, d) => ({
        minX: Math.min(a.minX, d.minX), maxX: Math.max(a.maxX, d.maxX),
        minZ: Math.min(a.minZ, d.minZ), maxZ: Math.max(a.maxZ, d.maxZ),
        top: Math.max(a.top, d.topAtMin, d.topAtMax),
      }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity, top: -Infinity });
      put(`${road.id} · ${road.type}`, cx(plan), plan.top + 1.3, cz(plan));
      road.decks.forEach((d, i) => put(`${road.id} · пл ${i + 1}${d.ramp ? ' · наклон' : ''}`,
        cx(d), (d.topAtMin + d.topAtMax) / 2 + 0.6, cz(d)));
      road.fill.forEach((f, i) => put(`${road.id} · тело насыпи ${i + 1}`, cx(f), f.topY + 0.6, cz(f)));
      road.aprons.forEach((a, i) => {
        const toe = a.cross + a.dir * Math.abs(a.run);
        put(`${road.id} · откос ${i + 1}`,
          a.axis === 'x' ? cx(a) : (a.cross + toe) / 2,
          (a.topY + a.groundY) / 2 + 0.5,
          a.axis === 'x' ? (a.cross + toe) / 2 : cz(a));
      });
    }
    for (const p of this.props) put(`${p.id} · ${p.model}`, p.position.x, p.position.y + 1.5, p.position.z);
    for (const l of this.lightSpecs) put(`${l.id} · ${l.type}`, l.position.x, l.position.y + 1, l.position.z);

    const s = this.spec.spawn;
    if (s) put('spawn · точка A', s.x, this.groundHeightAt(s.x, s.z, this.groundY) + 1.6, s.z);
    return out;
  }

  _inBuilding(x, z, margin = 0.2) {
    return this.buildings.some(b => x > b.bounds.minX - margin && x < b.bounds.maxX + margin
      && z > b.bounds.minZ - margin && z < b.bounds.maxZ + margin);
  }

  worldToNormalized(x, z) {
    const v = this.viewHalf;
    const u = (x + v) / (2 * v);
    const w = (z + v) / (2 * v);
    return [Math.min(Math.max(u, 0), 1), Math.min(Math.max(w, 0), 1)];
  }

  // ---------------------------------------------------------------- навигация

  /**
   * Граф навигации: решётка по открытой земле, сетка полов каждой комнаты,
   * цепочка проступей каждого марша, цепочка пластин не-наземных дорог и пары
   * узлов в дверных проёмах.
   *
   * Ребра длиннее шага своей решётки появляются только явно — у двери, у начала
   * и конца марша, на сходе с настила:LINK по радиусу «как можно дальше» связал
   * бы клетки через весь марш, и маршрут повёл врага сквозь ступени.
   */
  _buildNav() {
    const nav = new NavGraph();
    const rstep = J.navRoomStep;
    this._navLattice(nav);
    this._navRooms(nav, rstep);
    this._navStairs(nav, rstep);
    this._navDecks(nav);
    this._navDoors(nav, rstep);
    return this._pruneToSpawn(nav);
  }

  /** Решётка улиц и дворов: шаг J.navStep, узел там, где есть опора и габарит свободен. */
  _navLattice(nav) {
    const step = J.navStep;
    const n = Math.floor(this.width / step);
    const lat = [];
    for (let j = 0; j <= n; j++) {
      const row = new Array(n + 1);
      const z = -this.half + j * step;
      for (let i = 0; i <= n; i++) {
        const x = -this.half + i * step;
        if (this._inBuilding(x, z)) continue;
        const y = this.groundHeightAt(x, z, this.groundY);
        if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
        row[i] = nav.add(x, y, z, `w:${i}:${j}`);
      }
      lat.push(row);
    }
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const id = lat[j][i];
        if (id === undefined) continue;
        if (i > 0 && lat[j][i - 1] !== undefined) this._link(nav, id, lat[j][i - 1]);
        if (j > 0 && lat[j - 1][i] !== undefined) this._link(nav, id, lat[j - 1][i]);
      }
    }
  }

  /** Сетка полов комнат: клетки внутри rect, кроме плана марша и клеток без опоры. */
  _navRooms(nav, rstep) {
    const r = CONFIG.radius + 0.05;
    for (const b of this.buildings) {
      for (const room of b.rooms) {
        const cols = [];
        const xs = [];
        for (let x = room.rect.minX + r; x <= room.rect.maxX - r + 1e-6; x += rstep) xs.push(x);
        const zs = [];
        for (let z = room.rect.minZ + r; z <= room.rect.maxZ - r + 1e-6; z += rstep) zs.push(z);
        for (let j = 0; j < zs.length; j++) {
          const row = [];
          for (let i = 0; i < xs.length; i++) {
            const x = xs[i], z = zs[j];
            if (this._inStair(b, x, z, room.floor)) continue;
            // клетка над проёмом перекрытия (шахта марша) опоры этой комнаты не имеет
            const y = this._floorSupport(x, z, room.y);
            if (y === null) continue;
            if (this.isBlocked(x, z, CONFIG.radius, room.y, CONFIG.eyeHeight)) continue;
            row[i] = nav.add(x, y, z, `r:${room.id}:${i}:${j}`);
          }
          cols.push(row);
        }
        for (let j = 0; j < zs.length; j++) {
          for (let i = 0; i < xs.length; i++) {
            const id = cols[j][i];
            if (id === undefined) continue;
            if (i > 0 && cols[j][i - 1] !== undefined) this._link(nav, id, cols[j][i - 1]);
            if (j > 0 && cols[j - 1][i] !== undefined) this._link(nav, id, cols[j - 1][i]);
          }
        }
      }
    }
  }

  _inStair(b, x, z, floor) {
    return b.stairs.some(s => floor >= s.connectsFloors[0] && floor <= s.connectsFloors[1]
      && x > s.rect.minX && x < s.rect.maxX && z > s.rect.minZ && z < s.rect.maxZ);
  }

  /**
   * Опора пола комнаты под (x, z): плита стоит на J.floorRise выше отметки этажа
   * (её верх совпадал бы с плоскостью земли уровня, и пол мерцал бы по всей
   * комнате), поэтому «пол этого уровня здесь есть» — ответ `groundHeightAt`
   * в пределах шва, а не точное равенство. Отметку отдаём ту, что реально держит
   * ноги: узел графа обязан стоять на своей опоре, иначе `_edgeSupported`
   * бракует ребро из-за провала в 4 см.
   *
   * @returns {number|null} отметка опоры, null — пола уровня нет
   */
  _floorSupport(x, z, level) {
    const y = this.groundHeightAt(x, z, level);
    return Math.abs(y - level) <= J.floorRise + 0.02 ? y : null;
  }

  /** Цепочка проступей марша + посадки у его начала и конца. */
  _navStairs(nav, rstep) {
    for (const b of this.buildings) {
      for (const s of b.stairs) {
        let prev;
        const ids = [];
        s.steps.forEach((st, k) => {
          const x = (st.minX + st.maxX) / 2, z = (st.minZ + st.maxZ) / 2;
          const id = nav.add(x, st.top, z, `s:${s.id}:${k}`);
          if (prev !== undefined) this._link(nav, prev, id);
          prev = id;
          ids.push(id);
        });
        if (!ids.length) continue;
        const bottom = this._landing(nav, s, -1);
        const top = this._landing(nav, s, 1);
        for (const [land, tread] of [[bottom, ids[0]], [top, ids[ids.length - 1]]]) {
          if (land === undefined) continue;
          this._link(nav, land, tread);
          this._linkClosest(nav, land, rstep * 1.2, 3);
        }
      }
    }
  }

  /**
   * Посадка марша: пол этажа сразу за его габаритом, со стороны проступи, что к
   * ней ведёт. Без неё верхней ступени некуда выйти: плита пола имеет вокруг
   * марша проём во весь его план, а решётка комнаты шагом rstep не обязана дать
   * клетку в полоске между проёмом и стеной — `_linkClosest` от последней
   * ступени тянул бы ребром через весь веер нижних проступей к клетке с другой
   * стороны, и нога на таком ребре проваливалась бы в проём перекрытия.
   *
   * Candidate-направления упорядочены по тому, куда смотрит проступь: для
   * прямой и Г-образной это конец марша, для винта — сторона, где верхняя
   * сектор-ступень выходит за габарит. Посадкой становится первое направление,
   * где пол уровня есть и габариту свободно.
   *
   * @returns {number|undefined} индекс узла графа
   */
  _landing(nav, s, sign) {
    const tread = sign > 0 ? s.top : s.bottom;
    const level = sign > 0 ? s.y1 : s.y0;
    const cx = (s.rect.minX + s.rect.maxX) / 2;
    const cz = (s.rect.minZ + s.rect.maxZ) / 2;
    const pad = CONFIG.radius + 0.1;
    const dirs = [
      [Math.sign(tread.x - cx) || 1, 0],
      [0, Math.sign(tread.z - cz) || 1],
      [-Math.sign(tread.x - cx) || -1, 0],
      [0, -Math.sign(tread.z - cz) || -1],
    ];
    for (const [ax, az] of dirs) {
      const x = ax ? (ax > 0 ? s.rect.maxX : s.rect.minX) + ax * pad : tread.x;
      const z = az ? (az > 0 ? s.rect.maxZ : s.rect.minZ) + az * pad : tread.z;
      const y = this._floorSupport(x, z, level);
      if (y === null) continue;
      if (this.isBlocked(x, z, CONFIG.radius, level, CONFIG.eyeHeight)) continue;
      const id = nav.add(x, y, z, `p:${s.id}:${sign > 0 ? 't' : 'b'}`);
      return id;
    }
    return undefined;
  }

  /**
   * Цепочка узлов по настилам эстакады и насыпи. Плоская пластина даёт узлы
   * шагом решётки; наклонный пролёт — чаще: шаг вдоль подбирают так, чтобы
   * перепад соседних узлов не превысил шага ноги (`stepUp · 0,8`), иначе `_link`
   * забракует все рёбра подъёма и пролёт останется недостижимым для пеших
   * маршрутов. Отметка узла — та же наклонная плоскость, что держит ноги.
   * Наземные улицы не нужны: их держит решётка земли, чья отметка берётся из
   * опоры под ногами (0,12 м асфальта).
   */
  _navDecks(nav) {
    const step = J.navStep;
    for (const road of this.roads) {
      if (road.type === 'ground') continue;
      let prevEnd, firstEnd;
      for (const [di, d] of road.decks.entries()) {
        const along = d.axis === 'x' ? ['minX', 'maxX'] : ['minZ', 'maxZ'];
        const cross = d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2;
        const span = d[along[1]] - d[along[0]];
        const rise = Math.abs(d.topAtMax - d.topAtMin);
        const perNode = rise > 0.01 ? Math.min(step, this.stepUp * 0.8 * span / rise) : step;
        const count = Math.max(1, Math.ceil(span / perNode));
        const yAt = k => d.topAtMin + (d.topAtMax - d.topAtMin) * (k / count);
        let first, last;
        for (let k = 0; k <= count; k++) {
          const a = d[along[0]] + (span * k) / count;
          const x = d.axis === 'x' ? a : cross;
          const z = d.axis === 'x' ? cross : a;
          const id = nav.add(x, yAt(k), z, `d:${road.id}:${di}:${k}`);
          if (first === undefined) first = id;
          else this._link(nav, last, id);
          last = id;
        }
        if (firstEnd === undefined) firstEnd = first;
        if (prevEnd !== undefined) this._link(nav, prevEnd, first);
        prevEnd = last;
      }
      // сход с настила и подъём на него — к решётке земли; середина цепочки
      // сама ведёт вверх по ступеням пластин
      for (const id of [firstEnd, prevEnd]) {
        if (id !== undefined) this._linkClosest(nav, id, step * 1.8, 2);
      }
    }
  }

  /** Пара узлов в проёме двери + связи с полом комнаты снаружи и с решёткой улицы. */
  _navDoors(nav, rstep) {
    for (const b of this.buildings) {
      for (const d of b.doors) {
        const iy = this.groundHeightAt(d.inside.x, d.inside.z, d.y);
        const inId = nav.add(d.inside.x, iy, d.inside.z, `e:${d.id}:i`);
        const oy = this.groundHeightAt(d.outside.x, d.outside.z, d.y);
        const outId = nav.add(d.outside.x, oy, d.outside.z, `e:${d.id}:o`);
        nav.link(inId, outId);
        this._linkClosest(nav, inId, rstep * 2.4, 3);
        this._linkClosest(nav, outId, J.navStep * 1.8, 3);
      }
    }
  }

  /**
   * Свободен ли отрезок для тела И держит ли его опора под каждым шагом.
   * Проверяет то, чего `bodyClearLine` не видит: отрезок верхней ступени к
   * клетке пола через весь марш проходит между проступями (габариту свободно),
   * но под ногой там проём перекрытия — и идущий по такому ребру падает с этажа
   * на грунт, а обратно ему подняться нечем.
   *
   * Шагаем пробами `J.navEdgeProbe`: подъём между пробами не больше stepUp (это
   * держит уже `groundHeightAt` — выше ступени он не отвечает), спуск допустим,
   * но провал глубже `J.navEdgeDrop` бракует ребро. На конце нога обязана
   * дотянуться до узла; оказаться выше него не беда — под узлом просто есть
   * плита выше (тротуар, настил насыпи), и идущий встанет на неё.
   */
  _edgeSupported(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const dist = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(dist / J.navEdgeProbe));
    let feet = a.y;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const y = this.groundHeightAt(a.x + dx * t, a.z + dz * t, Math.max(feet, a.y));
      if (feet - y > J.navEdgeDrop) return false;
      feet = y;
    }
    return b.y - feet <= this.stepUp;
  }

  /** Ребро между двумя узлами: перепад в один шаг, габарит свободен, опора держит. */
  _link(nav, a, b) {
    const pa = nav.pos[a], pb = nav.pos[b];
    if (Math.abs(pa.y - pb.y) > this.stepUp) return;
    if (!this.bodyClearLine(pa, pb)) return;
    if (!this._edgeSupported(pa, pb)) return;
    nav.link(a, b);
  }

  /**
   * Связывает узел с несколькими ближайшими подходящими: так дверь выходит на
   * решётку, а марш — на пол комнаты, не имея ребра длиннее шага своей сетки.
   */
  _linkClosest(nav, id, radius, count) {
    const from = nav.pos[id];
    const near = [];
    for (let i = 0; i < nav.pos.length; i++) {
      if (i === id) continue;
      const p = nav.pos[i];
      const d = Math.hypot(p.x - from.x, p.z - from.z);
      if (d > radius || d < 0.01) continue;
      near.push({ i, d });
    }
    near.sort((a, b) => a.d - b.d);
    let linked = 0;
    for (const cand of near) {
      if (linked >= count) break;
      if (nav.adj[id].includes(cand.i)) continue;
      if (Math.abs(nav.pos[cand.i].y - from.y) > this.stepUp) continue;
      if (!this.bodyClearLine(from, nav.pos[cand.i])) continue;
      if (!this._edgeSupported(from, nav.pos[cand.i])) continue;
      nav.link(id, cand.i);
      linked++;
    }
  }

  /**
   * Оставляет одну связную сеть: узлы, до которых нельзя дойти от точки
   * появления, из графа выбрасываются (правило AGENTS — изолированный карман
   * превращает возрождённого врага в статую).
   */
  _pruneToSpawn(nav) {
    const start = nav.nearestNode(this.spawn.x, this.spawn.y, this.spawn.z);
    const seen = new Uint8Array(nav.pos.length);
    if (start >= 0) {
      const queue = [start];
      seen[start] = 1;
      for (let head = 0; head < queue.length; head++) {
        for (const nb of nav.adj[queue[head]]) if (!seen[nb]) { seen[nb] = 1; queue.push(nb); }
      }
    }
    const out = new NavGraph();
    const keep = [];
    nav.pos.forEach((p, i) => {
      if (seen[i]) keep.push(out.add(p.x, p.y, p.z));
    });
    nav.pos.forEach((p, i) => {
      const a = keep[i];
      if (a === undefined) return;
      for (const nb of nav.adj[i]) if (nb < i && keep[nb] !== undefined) out.link(a, keep[nb]);
    });
    return out.seal();
  }

  /** Случайная точка графа в радиусе от (x, z); если не нашлось — null. */
  randomNavPoint(x, z, radius) {
    return this.nav.randomPoint(x, z, radius);
  }

  /** Маршрут по узлам графа (поиск в ширину). null — пути нет. */
  findPath(from, to) {
    return this.nav.findPath(from, to);
  }

  // ---------------------------------------------------------------- сборка сцены

  build(scene) {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width, this.depth),
      new THREE.MeshStandardMaterial({ color: this.groundColor, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.groundY;
    ground.receiveShadow = true;
    scene.add(ground);

    const mats = {
      walls: new THREE.MeshStandardMaterial({ color: J.walls, roughness: 0.85, metalness: 0.05 }),
      slabs: new THREE.MeshStandardMaterial({ color: J.slabs, roughness: 0.9, metalness: 0.05 }),
      stairs: new THREE.MeshStandardMaterial({ color: J.stairs, roughness: 0.9, metalness: 0.05 }),
      decks: new THREE.MeshStandardMaterial({ color: J.asphalt, roughness: 0.95, metalness: 0 }),
      earth: new THREE.MeshStandardMaterial({ color: J.earth, roughness: 1, metalness: 0 }),
    };
    for (const key of Object.keys(this.geo)) {
      const geos = this.geo[key];
      if (!geos.length) continue;
      const mesh = new THREE.Mesh(mergeGeometries(geos, false), mats[key]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    }

    buildProps(scene, this.props);
    this._buildLights(scene);
  }

  /**
   * Настоящие источники из данных главы: point и spot (directional парсер
   * превращает в «луну» неба). Тени у них выключены — тень держит одна
   * направленная, как на всех ночных главах.
   */
  _buildLights(scene) {
    this.realLights = [];
    const bulbs = [];
    for (const l of this.lightSpecs) {
      const color = new THREE.Color(l.color ?? 0xffcf9a);
      let light;
      if (l.type === 'spot') {
        light = new THREE.SpotLight(color, l.intensity ?? 60, l.distance ?? 0, l.angle ?? 0.7, 0.4, 2);
        const t = l.target ?? { x: l.position.x, y: 0, z: l.position.z };
        light.target.position.set(t.x, t.y, t.z);
        scene.add(light.target);
      } else {
        light = new THREE.PointLight(color, l.intensity ?? 60, l.distance ?? 0, 2);
      }
      light.position.set(l.position.x, l.position.y, l.position.z);
      light.castShadow = false;
      scene.add(light);
      this.realLights.push(light);

      const bulb = new THREE.SphereGeometry(0.35, 8, 6).translate(
        l.position.x, l.position.y, l.position.z);
      bulbs.push(bulb);
    }
    if (bulbs.length) {
      const mesh = new THREE.Mesh(mergeGeometries(bulbs, false), new THREE.MeshBasicMaterial({
        color: 0xffe6c0,
      }));
      scene.add(mesh);
    }
  }

  // ------------------------------------------------------------------ миникарта

  /**
   * План уровня на отметке игрока: плиты полов этого этажа, стены, которые его
   * задевают, проёмы маршей и настилы дорог.
   */
  drawMinimap(ctx, size, playerPos) {
    ctx.fillStyle = '#1b2128';
    ctx.fillRect(0, 0, size, size);

    const toPx = (wx, wz) => {
      const [u, v] = this.worldToNormalized(wx, wz);
      return [u * size, v * size];
    };
    const rectPx = r => {
      const [x0, z0] = toPx(r.minX, r.minZ);
      const [x1, z1] = toPx(r.maxX, r.maxZ);
      return [x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1)];
    };

    const y = playerPos ? playerPos.y : this.spawn.y;
    // этаж игрока = плита пола, чья отметка ближе всего: у разных домов своя
    // высота этажа, поэтому ориентироваться на floorHeight движку незачем
    let level = this.spawn.y, levelFloor = 0, best = Infinity;
    for (const p of this.floorPlates) {
      const d = Math.abs(p.y - y);
      if (d < best) { best = d; level = p.y; levelFloor = p.floor; }
    }

    for (const d of this.deckPlates) {
      if (d.ramp || Math.abs(d.topY - y) > 1) continue;
      ctx.fillStyle = 'rgba(90,100,116,.5)';
      ctx.fillRect(...rectPx(d));
    }
    ctx.fillStyle = 'rgba(196,212,232,.5)';
    for (const p of this.floorPlates) {
      if (p.y !== level) continue;
      ctx.fillRect(...rectPx(p));
    }

    ctx.fillStyle = '#262f3d';
    for (const w of this.blockers) {
      if (w.y1 <= y + 0.05 || w.y0 >= y + CONFIG.eyeHeight) continue;
      ctx.fillRect(...rectPx(w));
    }
    ctx.fillStyle = '#5b4a2c';
    for (const s of this.stairCells) {
      if (s.k0 > levelFloor || s.k1 < levelFloor) continue;
      ctx.fillRect(...rectPx(s));
    }

    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.font = 'bold 22px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Отметка ${level.toFixed(1)} м`, 10, 10);
  }
}

/**
 * Создаёт карту уровня из JSON по map-секции определения главы.
 * @param {object} spec {kind:'json', ground, bounds, spawn, buildings, roads, props, lights}
 */
export function createJsonMap(spec) {
  return new JsonMap(spec);
}

// ------------------------------------------------ наклонная твёрдость: призма
// выпуклого профиля (u, y), протянутого поперёк на [v0, v1]. Один и тот же
// набор граней кормит геометрию, луч (метод слэбов, как `_rayAabb` у солидов)
// и выталкивание сферы тела.

/**
 * Призма над профилем. `poly` — вершины выпуклого профиля в `(u, y)` по обходу;
 * `axis` — мировая ось, вдоль которой отложена `u` (`'x'`: u=x, v=z).
 * Грани считаются один раз: наружные нормали профиля, они же полупространства
 * луча, и границы плана.
 */
function makePrism(axis, v0, v1, poly) {
  const isX = axis === 'x';
  const us = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const edges = poly.map((p, i) => {
    const q = poly[(i + 1) % poly.length];
    const du = q[0] - p[0], dy = q[1] - p[1];
    let nx = dy, ny = -du;                       // перпендикуляр к ребру
    const l = Math.hypot(nx, ny) || 1;
    nx /= l; ny /= l;
    // наружу: у выпуклого профиля центроид лежит внутри, значит нормаль,
    // смотрящая на него, развёрнута
    const cx = us.reduce((a, b) => a + b, 0) / us.length;
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
    if (nx * (cx - p[0]) + ny * (cy - p[1]) > 0) { nx = -nx; ny = -ny; }
    return { p, q, nx, ny };
  });
  const planes = edges.map(e => ({
    n: isX ? [e.nx, e.ny, 0] : [0, e.ny, e.nx],
    d: e.nx * e.p[0] + e.ny * e.p[1],            // внутри ⟺ n·p ≤ d
  }));
  planes.push({ n: isX ? [0, 0, -1] : [-1, 0, 0], d: -v0 });
  planes.push({ n: isX ? [0, 0, 1] : [1, 0, 0], d: v1 });
  return {
    axis, v0, v1, poly, edges, planes,
    lo: Math.min(...us), hi: Math.max(...us), yLo: Math.min(...ys), yHi: Math.max(...ys),
    minX: isX ? Math.min(...us) : v0, maxX: isX ? Math.max(...us) : v1,
    minZ: isX ? v0 : Math.min(...us), maxZ: isX ? v1 : Math.max(...us),
    /** Отметка верха профиля над `u`; null — над этой точкой профиля нет. */
    topAt(u) {
      let best = null;
      for (const e of this.edges) {
        const [p, q] = [e.p, e.q];
        const lo = Math.min(p[0], q[0]), hi = Math.max(p[0], q[0]);
        if (u < lo - 1e-9 || u > hi + 1e-9) continue;
        const y = Math.abs(q[0] - p[0]) < 1e-9
          ? Math.max(p[1], q[1])
          : p[1] + (q[1] - p[1]) * (u - p[0]) / (q[0] - p[0]);
        if (best === null || y > best) best = y;
      }
      return best;
    },
  };
}

/**
 * Знаковое расстояние точки `(u, y)` до профиля: снаружи — до ближайшей точки
 * границы (вектор к ней), внутри — глубина до ближайшей грани (её наружная
 * нормаль). Вертикальный луч от центра сферы до дна призмы не доходит, поэтому
 * и направление, и величина берутся из одного и того же обхода рёбер.
 */
function profileDistance(w, u, y) {
  let inside = true, pen = Infinity, pnx = 0, pny = 0;
  let best = Infinity, bx = 0, by = 0;
  for (const e of w.edges) {
    const s = e.nx * (u - e.p[0]) + e.ny * (y - e.p[1]);
    if (s > 0) inside = false;
    if (-s < pen) { pen = -s; pnx = e.nx; pny = e.ny; }
    const du = e.q[0] - e.p[0], dy = e.q[1] - e.p[1];
    const len2 = du * du + dy * dy;
    const t = len2 > 1e-12 ? Math.min(1, Math.max(0, ((u - e.p[0]) * du + (y - e.p[1]) * dy) / len2)) : 0;
    const qx = e.p[0] + du * t, qy = e.p[1] + dy * t;
    const d = Math.hypot(u - qx, y - qy);
    if (d < best) { best = d; bx = u - qx; by = y - qy; }
  }
  return inside ? { inside: true, pen, nx: pnx, ny: pny } : { inside: false, d: best, nx: bx, ny: by };
}

/**
 * Пересечение луча с призмой: слэбы по всем её граням (профиль + два торца
 * поперёк). Направление обязано быть единичным — тогда `t` и есть расстояние
 * в метрах.
 *
 * @returns {{t:number,x:number,y:number,z:number,nx:number,ny:number,nz:number}|null}
 */
function rayWedge(w, ox, oy, oz, dx, dy, dz) {
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-9) return null;
  dx /= len; dy /= len; dz /= len;
  let tmin = -Infinity, tmax = Infinity, entry = null;
  for (const p of w.planes) {
    const nd = p.n[0] * dx + p.n[1] * dy + p.n[2] * dz;
    const f0 = p.n[0] * ox + p.n[1] * oy + p.n[2] * oz - p.d;
    if (Math.abs(nd) < 1e-12) {
      if (f0 > 0) return null; // луч параллелен грани и идёт снаружи неё
      continue;
    }
    const t = -f0 / nd;
    if (nd < 0) {
      if (t > tmin) { tmin = t; entry = p.n; }
    } else if (t < tmax) tmax = t;
  }
  if (tmax < tmin || tmax < 0 || !entry) return null;
  const t = tmin > 0 ? tmin : 0;
  const l = Math.hypot(entry[0], entry[1], entry[2]);
  return {
    t,
    x: ox + dx * t, y: oy + dy * t, z: oz + dz * t,
    nx: entry[0] / l, ny: entry[1] / l, nz: entry[2] / l,
  };
}

/**
 * Выталкивает сферу из призмы — по **точному** расстоянию до её поверхности.
 * Призма есть декартово произведение выпуклого профиля и отрезка поперёк,
 * поэтому расстояние раскладывается: `hypot(dпрофиля, dпоперёк)`, а направление
 * — тот же вектор, разложенный по этим двум осям. Прежний мерял грани от
 * бесконечных плоскостей: у пятки подъёма ближайшей оказывалась вертикальная
 * грань торца, и тело выталкивало назад по оси пролёта вместо того, чтобы
 * взойти по наклону, а на верхней границе тот же торец браковал сход с моста.
 *
 * @param {{x,y,z}} c центр (мутабельно)
 * @returns {boolean} сдвинули ли
 */
function pushOutWedge(c, r, w) {
  const isX = w.axis === 'x';
  const u = isX ? c.x : c.z;
  const v = isX ? c.z : c.x;
  if (u < w.lo - r || u > w.hi + r || v < w.v0 - r || v > w.v1 + r
    || c.y < w.yLo - r || c.y > w.yHi + r) return false;
  const p = profileDistance(w, u, c.y);
  const dv = Math.max(0, w.v0 - v, v - w.v1);
  // сдвиг центра в координатах призмы (du — вдоль уклона, dv — поперёк)
  let du = 0, dy = 0, dvPush = 0;
  if (!p.inside) {
    // снаружи: расстояние до поверхности = hypot(до профиля, поперёк); у точки
    // вне замкнутого выпуклого профиля `p.d` всегда положителен
    const d = Math.hypot(p.d, dv);
    if (d >= r) return false;
    const s = r - d;
    du = p.nx * s / d;
    dy = p.ny * s / d;
    dvPush = (dv > 0 ? (v < w.v0 ? -1 : 1) : 0) * dv * s / d;
  } else if (dv > 0) {
    // внутри профиля, снаружи поперёк: выход через ближайший торец
    dvPush = (v < w.v0 ? -1 : 1) * (r - dv);
  } else {
    // центр внутри объёма — разводимся через наименьшую из двух глубин
    const penV = Math.min(v - w.v0, w.v1 - v);
    if (p.pen <= penV) { du = p.nx * (r + p.pen); dy = p.ny * (r + p.pen); }
    else dvPush = (v - w.v0 <= w.v1 - v ? -1 : 1) * (r + penV);
  }
  if (isX) { c.x += du; c.y += dy; c.z += dvPush; }
  else { c.z += du; c.y += dy; c.x += dvPush; }
  return true;
}
