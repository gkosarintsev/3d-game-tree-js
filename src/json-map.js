import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { SolidField, circleHitsRect } from './solids.js';
import { NavGraph } from './nav-graph.js';
import { r3, subtractRect } from './geo2d.js';
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
 * Числовой FNV-1a для ритма фасада. Хеш id дома считается один раз на дом, а
 * этаж, грань и номер слота подмешиваются в него числами: строковый ключ на
 * каждое окно (32 тыс. шаблонных литералов на главу) стоил четверть времени
 * вывода, а адрес слота и так целочисленный.
 *
 * По адресу, а не по счёту в обходе, — иначе добавка одного дома сдвигала бы
 * «зажжённые» окна у соседей и ночной кадр главы пересобирался целиком от правки
 * в другом районе.
 */
const FNV_PRIME = 16777619;
function fnvMix(h, v) {
  return Math.imul(h ^ v, FNV_PRIME) >>> 0;
}
function fnvStr(h, s) {
  let x = h;
  for (let i = 0; i < s.length; i++) x = fnvMix(x, s.charCodeAt(i));
  return x;
}
/** Хеш в [0, 1). */
const fnvUnit = h => (h >>> 0) / 4294967296;

/**
 * Ряд детерминированных отсчётов из одного семени: каждое следующее число —
 * хеш предыдущего, а не `slot + 1`. Это важно: два отсчёта, снятые с соседних
 * целых (`k` и `k + 1`), сильно коррелируют в старших битах, а именно старшие
 * биты дают `fnvUnit`. Замер на мусоре кровель: два первых типа из списка
 * забирали 97 % вместо 50 %, потому что «тип» брали из `slot + 1` после того,
 * как «плотность» отсекла `slot`.
 */
const FNV_SALT = 0x9E3779B9;
function makeDraw(seed) {
  let x = seed >>> 0;
  return () => { x = fnvMix(x, FNV_SALT); return fnvUnit(x); };
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
    this.channels = spec.channels ?? [];
    this.props = spec.props ?? [];
    this.lightSpecs = spec.lights ?? [];
    // окна фасадов включаются секцией `windows` в брифе: главы без неё собираются
    // ровно как раньше. Числа — из `J.windows`, переопределение — из брифа.
    this.winCfg = spec.windows ? { ...J.windows, ...spec.windows } : null;
    // мусор кровель и тротуаров — тот же порядок: секция `clutter` включает вывод.
    // Вложенные ритмы merge-ятся по-частям, чтобы бриф правил одну цифру, а не
    // переставлял весь блок.
    this.clutterCfg = spec.clutter ? this._clutterSpec(spec.clutter) : null;
    // неон и билборды — третий выводимый ряд того же механизма (`_signageItems`)
    this.signCfg = spec.signage ? { ...J.signage, ...spec.signage } : null;

    /** @type {{minX,maxX,minZ,maxZ,y0,y1}[]} стены, насыпь, откосы и дно там, где в него нельзя */
    this.blockers = [];
    this.geo = { walls: [], slabs: [], stairs: [], decks: [], earth: [] };
    /** план марша с этажами, между которыми он стоит: клетки пола внутри него не ставятся */
    this.stairCells = [];
    /** плиты полов комнат: опоры, узлы навигации и миникарта */
    this.floorPlates = [];
    /** плиты ходовых кровель (`roof.walkable`): опора уровня roofY и её решётка узлов */
    this.roofPlates = [];
    this.deckPlates = [];
    /** наклонные твёрдости: пролёты настилов и откосы насыпи — призмы профиля (u, y) */
    this.prisms = [];
    /** планы, где грунт уровня прорезан руслом: в них нет «пола мира — ноль» */
    this.holes = [];
    /** сходы в русло и берега-склоны: узлы графа вдоль уклона */
    this.descents = [];
    /** зеркала воды: меш без коллизий на отметке surfaceY */
    this.waterRects = [];
    this._blockIndex = new Map();
    this._blockBucket = J.navStep;

    this._collectBuildings();
    this._collectRoads();
    this._collectWater();
    this._indexPlans();
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
      this._roof(b);
    }
  }

  /**
   * Кровля: плита по союзу прямоугольников footprint, проём там, где сквозь неё
   * проходит марш или стоит здание, опора и парапет — если она ходкая.
   *
   * Ходовая кровля получает `surface`, невходимая остаётся просто солидом. Дело
   * не в аккуратности: `ExitGoal` берёт отметку точки B как `groundHeightAt(x, z,
   * 500)`, то есть самый верх из опор, — сделай мы опорой любую крышу, маяк главы
   * переехал бы на кровлю дома, под которым стоит улица. Там же, где по кровле
   * правда ходят, цель на ней и должна стоять.
   *
   * Парапет — блокер от `roofY` до `roofY + parapet`: идущему по кровле он не
   * препятствие ниже его верха, но у края бракует и узел графа, и сход с плиты
   * (`isBlocked` меряет тело от отметки ног). Где к кровле примыкает настил
   * перехода, в паравете остаёт проём, иначе переход упирался бы в ограждение.
   */
  _roof(b) {
    const walk = b.roof?.walkable === true;
    // настил, чей верх совпал с отметкой кровли (допуск схемы): ему расступаются
    // и плита, и парапет. Берём до `pierce`, пока `walk` не проверено, — у
    // невходимой кровли настил всё равно не должен ложиться на её плиту
    const arrivals = this.roads.filter(r => r.type !== 'ground').flatMap(r => r.decks).filter(d =>
      Math.abs(d.topAtMin - b.roofY) <= J.skybridgeFit || Math.abs(d.topAtMax - b.roofY) <= J.skybridgeFit);
    // чужое здание, выросшее из этой плиты (подиум + башня), марш, выведенный
    // на кровлю, и план примыкающего настила оставляют в ней проём: иначе плита
    // легла бы внутрь первого этажа соседа, а решётка узлов встала бы под ним, и
    // там, где настил идёт поверх плиты, остались бы со-плоскостные верха
    const pierce = [
      ...b.stairs.filter(s => s.connectsFloors[1] === b.floorsCount).map(s => s.rect),
      ...this.buildings.filter(o => o !== b && o.baseY > b.roofY - 0.5 && o.baseY < b.roofY + 1)
        .map(o => o.bounds),
      ...arrivals,
    ];
    for (const rect of b.rects) {
      const pieces = pierce.reduce((list, hole) => list.flatMap(p => subtractRect(p, hole)), [rect]);
      for (const p of pieces) {
        this._box(p, b.roofY - J.slabThickness, b.roofY, 'slabs', { surface: walk });
        if (walk) this.roofPlates.push({ ...p, y: b.roofY, building: b.id });
      }
    }
    if (!walk || !(b.roof.parapet > 0)) return;
    // парапет режем планом настила, растянутым вдоль его оси на толщину стены:
    // полоса паравета стоит СЕРЕДНИНОЙ на фасадной линии (± половина толщины), и
    // обрезка его собственным планом дала бы разрез не поперёк ограждения, а
    // вдоль — проёма бы не осталось, и переход упирался в него габаритом
    const gaps = arrivals.map(d => (d.axis === 'x'
      ? { ...d, minX: d.minX - J.wallThickness, maxX: d.maxX + J.wallThickness }
      : { ...d, minZ: d.minZ - J.wallThickness, maxZ: d.maxZ + J.wallThickness }));
    for (const w of b.walls) {
      if (!w.facade) continue;
      const pieces = gaps.reduce((list, d) => list.flatMap(p => subtractRect(p, d)), [w]);
      for (const p of pieces) this._box(p, b.roofY, r3(b.roofY + b.roof.parapet), 'walls', { collide: true });
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
    for (const st of s.steps) {
      // вертикальный марш: проступь — пластина на СВОЁМ подъёме, а не столб от
      // пола шахты до неё (иначе картинка — монолит, которого глаз не видит,
      // а правило «твёрдость совпадает с картинкой» нарушено)
      const y0 = s.type === 'ladder' ? r3(st.top - J.ladderRung) : s.y0;
      this._box(st, y0, st.top, 'stairs', { surface: true });
    }
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

  /**
   * Русло из данных брифа: дно, берега, сходы и береговые стенки.
   *
   * Дно, откос берега и пандус схода — призма профиля (та же абстракция, что у
   * наклонного настила и откоса насыпи): их верх — наклонная плоскость, и коробка
   * по низу спрятала бы под гладкой картинкой невидимую стену. Береговая стенка
   * карниза — солид с верхом ровно на уровне земли: пуля в неё упирается, идущему
   * по берегу она не препятствие (порог `isBlocked` не видит тела ниже отметки
   * ног), а из русла она и есть стена, обратно через которую не выйти — поэтому
   * сходы в русло схема требует там, где в него можно идти.
   *
   * Там, где `wade: false`, дно получает блокер от дна до уровня земли: вброд
   * такое русло не перейти, и узлы графа в нём не ставятся — остаётся только
   * мост. Вода — меш без коллизий: и луч, и тело идут сквозь неё к дну.
   */
  _collectWater() {
    for (const ch of this.channels) {
      for (const s of ch.segments) {
        const axis = s.axis === 'x' ? 'z' : 'x';   // профиль отложен поперёк русла
        const bed = makePrism(axis, s.lo, s.hi, [
          [s.cross - s.halfW, ch.bedY], [s.cross + s.halfW, ch.bedY],
          [s.cross + s.halfW, r3(ch.bedY - J.bedThickness)], [s.cross - s.halfW, r3(ch.bedY - J.bedThickness)],
        ]);
        this.prisms.push(bed);
        this.geo.earth.push(this._prismGeo(bed));
        this.holes.push(s.bed);
        this.waterRects.push({ ...s.bed, y: ch.surfaceY });
        if (!ch.wade) {
          this.blockers.push({ ...s.bed, y0: r3(ch.bedY - 0.05), y1: r3(this.groundY + 1) });
        }
      }
      for (const d of ch.descents) {
        // у схода плита с толщиной (по ней ходят и она же держит картинку
        // пандуса), у берега — клин под склоном: его верхняя грань ровно на
        // уклоне, а на отметке дна он сходится с руслом в ноль. Треугольник с
        // вертикальной гранью у дна дал бы там опору на уровне земли: `topAt`
        // берёт максимум рёбер профиля, и невидимая стена встала бы у кромки
        // русла там, где глаз видит начало склона
        const w = d.kind === 'ramp'
          ? makePrism(d.axis, d.v0, d.v1, [
            [d.u0, d.y0], [d.u1, d.y1],
            [d.u1, r3(d.y1 - J.bedThickness)], [d.u0, r3(d.y0 - J.bedThickness)],
          ])
          : makePrism(d.axis, d.v0, d.v1, [[d.u0, d.y0], [d.u1, d.y1], [d.u1, d.y0]]);
        this.prisms.push(w);
        // отметка, какой сход призму держит: автотесту нужно пройти сферой по
        // каждому уклону, а русlo и берега лежат в одном списке призм
        w.descentId = d.id;
        this.geo[d.kind === 'ramp' ? 'decks' : 'earth'].push(this._prismGeo(w));
        this.holes.push(d.plan);
        this.descents.push(d);
      }
      for (const wall of ch.walls) {
        this._box(wall.rect, ch.bedY, this.groundY, 'walls', { collide: true });
        this.holes.push(wall.rect);
      }
    }
  }

  // ------------------------------------------------ твёрдость наклонных призм

  /**
   * Отметка верха ближайшей призмы над точкой плана (максимум, если их планы
   * пересекаются); null — ни одна не накрывает.
   */
  _prismTopAt(x, z) {
    let best = null;
    for (const idx of this._planAt(this._prismCells, x, z, 0)) {
      const w = this.prisms[idx];
      // клетка индекса (24 м) гораздо шире плана призмы: без проверки
      // попадания в сам прямоугольник верх настила протекал бы на точки
      // в десятках метров поперёк дороги
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
    if (top === null || top > fromY + this.stepUp) return base;
    // в русле «пол мира — ноль» ноги не держит: дно и склон лежат ниже нуля, и
    // опора там ровно та, что отдаёт призма. Над водой настил моста остаётся
    // опорой — его отметка приходит в `base` и она выше дна
    if (this._inChannel(x, z)) return base > 0 ? Math.max(base, top) : top;
    return top > base ? top : base;
  }

  /**
   * Луч: сначала обычные солиды и земля (базовый механизм), затем — наклонные
   * призмы. Их тел нет в `solids`, иначе коробка по низу пролёта спрятала бы под
   * гладкой картинкой лестницу невидимых ступеней, а коробка откоса — невидимую
   * стену там, где глаз видит склон: пуля и сфера тела Чужого опирались бы на
   * них, а не на наклон.
   *
   * Земля-плоскость при этом отменяется для луча, вошедшего в русло: пол мира
   * лежит выше дна, и луч, уходящий в канал, обязан идти дальше — к стенке, дну
   * или настилу моста. Отвергать уже готовое попадание нельзя: верх береговой
   * стенки лежит ровно на отметке земли, и под тем же углом отбрасывался бы удар
   * в стенку, а не только в воду.
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const len = Math.hypot(dx, dy, dz);
    const groundIsPhantom = this.holes.length > 0 && len > 1e-9 && dy / len < -1e-9
      && this._downwardHitInChannel(ox, oy, oz, dx / len, dy / len, dz / len, maxDist);
    const gp = this.groundPlane;
    if (groundIsPhantom) this.groundPlane = null;
    const base = super.raySolid(ox, oy, oz, dx, dy, dz, maxDist);
    this.groundPlane = gp;
    const limit = base ? base.dist : maxDist;
    let best = null;
    for (const w of this.prisms) {
      const h = rayWedge(w, ox, oy, oz, dx, dy, dz);
      if (h && h.t > 1e-6 && h.t < limit && (!best || h.t < best.t)) best = { ...h, w };
    }
    if (!best) return base;
    return { x: best.x, y: best.y, z: best.z, nx: best.nx, ny: best.ny, nz: best.nz, dist: best.t };
  }

  /** Пересекает ли луч плоскость земли там, где грунт прорезан руслом. */
  _downwardHitInChannel(ox, oy, oz, dx, dy, dz, maxDist) {
    const tg = (this.groundY - oy) / dy;
    if (tg < 0 || tg > maxDist) return false;
    return this._inChannel(ox + dx * tg, oz + dz * tg);
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

  /** Свободные точки уровня: центры плит полов и кровель, пластин настилов и сетки земли. */
  _collectAnchors() {
    const out = [];
    const push = (x, y, z) => out.push({ x, y, z });
    for (const p of this.floorPlates) {
      push((p.minX + p.maxX) / 2, p.y, (p.minZ + p.maxZ) / 2);
    }
    // опорная точка на кровле нужна пулу огней: фонарь, переставленный на верх
    // подиума, светит идущему по крыше, а не его теням внизу
    for (const p of this.roofPlates) {
      push((p.minX + p.maxX) / 2, p.y, (p.minZ + p.maxZ) / 2);
    }
    for (const d of this.deckPlates) {
      if (d.ramp) continue;
      push((d.minX + d.maxX) / 2, d.topY, (d.minZ + d.maxZ) / 2);
    }
    const step = J.navStep * 2;
    for (let z = -this.half + step / 2; z < this.half; z += step) {
      for (let x = -this.half + step / 2; x < this.half; x += step) {
        // опорная точка над руслом не нужна ни пулу огней, ни монетам: фонарь
        // посреди воды освещал бы дно, а предмет там некуда поставить
        if (this._inBuilding(x, z) || this._inChannel(x, z)) continue;
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
      // кровля и её парапет подписываются только у дома с секцией roof: у главы 9
      // её нет, и меток стало бы меньше ровно на столько, сколько их не было
      if (b.roof) {
        put(`${b.id} · кровля · ${b.roof.walkable ? 'ходовая' : 'невходима'}`,
          cx(b.bounds), b.roofY + 1.8, cz(b.bounds));
        if (b.roof.walkable && b.roof.parapet > 0) {
          b.walls.filter(w => w.facade).forEach((w, i) => put(`${b.id} · парапет ${i + 1}`,
            cx(w), b.roofY + b.roof.parapet + 0.4, cz(w)));
        }
      }
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
    for (const ch of this.channels) {
      ch.segments.forEach((s, i) => put(`${ch.id} · русло ${i + 1}`, cx(s.bed), ch.surfaceY + 1.2, cz(s.bed)));
      ch.walls.forEach((w, i) => put(`${ch.id} · береговая стенка ${i + 1}`,
        cx(w.rect), ch.bedY + (this.groundY - ch.bedY) / 2, cz(w.rect)));
      ch.descents.forEach((d, i) => {
        const u = (d.u0 + d.u1) / 2;
        put(`${ch.id} · ${d.kind === 'ramp' ? 'сход' : 'берег'} ${i + 1}`,
          d.axis === 'x' ? u : (d.v0 + d.v1) / 2,
          (d.y0 + d.y1) / 2 + 0.8,
          d.axis === 'x' ? (d.v0 + d.v1) / 2 : u);
      });
    }
    for (const p of this.props) put(`${p.id} · ${p.model}`, p.position.x, p.position.y + 1.5, p.position.z);
    for (const l of this.lightSpecs) put(`${l.id} · ${l.type}`, l.position.x, l.position.y + 1, l.position.z);

    const s = this.spec.spawn;
    if (s) put('spawn · точка A', s.x, this.groundHeightAt(s.x, s.z, this.groundY) + 1.6, s.z);
    return out;
  }

  /**
   * Индекс планов: габариты зданий и призм по клеткам `J.planGrid`. Нужен потому,
   * что `groundHeightAt` зовётся на каждую пробу ребра графа (12 проб на 6 м в обе
   * стороны), а `_inBuilding` — на каждую клетку решётки: на районе 600 × 600 м с
   * сотнями зданий и маршей линейный перебор списков стоит миллионов проверок,
   * индекс — десятки.
   */
  _indexPlans() {
    const g = J.planGrid;
    const put = (map, rect, idx) => {
      const i0 = Math.floor(rect.minX / g), i1 = Math.floor(rect.maxX / g);
      const j0 = Math.floor(rect.minZ / g), j1 = Math.floor(rect.maxZ / g);
      for (let j = j0; j <= j1; j++) {
        for (let i = i0; i <= i1; i++) {
          const key = this._key(i, j);
          let list = map.get(key);
          if (!list) map.set(key, list = []);
          list.push(idx);
        }
      }
    };
    this._buildingCells = new Map();
    this._prismCells = new Map();
    this._holeCells = new Map();
    this.buildings.forEach((b, idx) => put(this._buildingCells, b.bounds, idx));
    this.prisms.forEach((w, idx) => put(this._prismCells, w, idx));
    this.holes.forEach((r, idx) => put(this._holeCells, r, idx));
    this._planGrid = g;
  }

  /** Индексы объектов, чья клетка плана попала в окрестность точки (3×3 клетки). */
  _planAt(map, x, z, ring = 1) {
    const g = this._planGrid;
    const ci = Math.floor(x / g), ck = Math.floor(z / g);
    const out = [];
    for (let j = ck - ring; j <= ck + ring; j++) {
      for (let i = ci - ring; i <= ci + ring; i++) {
        const list = map.get(this._key(i, j));
        if (list) for (const idx of list) out.push(idx);
      }
    }
    return out;
  }

  _inBuilding(x, z, margin = 0.2) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      const b = this.buildings[idx];
      if (x > b.bounds.minX - margin && x < b.bounds.maxX + margin
        && z > b.bounds.minZ - margin && z < b.bounds.maxZ + margin) return true;
    }
    return false;
  }

  /**
   * Лежит ли точка в прорезанном русле. Клетка индекса (`J.planGrid` = 24 м)
   * гораздо шире плана русла, поэтому после клетки обязана идти точная проверка
   * прямоугольника: иначе отмена «пола мира — ноль» распространялась бы на сушу
   * в десятках метров от воды.
   */
  _inChannel(x, z) {
    if (!this.holes.length) return false;
    for (const idx of this._planAt(this._holeCells, x, z, 0)) {
      const r = this.holes[idx];
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return true;
    }
    return false;
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
   * решётка ходовых кровель, цепочка проступей каждого марша, цепочка пластин
   * не-наземных дорог и пары узлов в дверных проёмах.
   *
   * Ребра длиннее шага своей решётки появляются только явно — у двери, у начала
   * и конца марша, на сходе с настила:LINK по радиусу «как можно дальше» связал
   * бы клетки через весь марш, и маршрут повёл врага сквозь ступени.
   *
   * Кровли строятся ДО маршей и настилов: и посадка марша на крышу, и торец
   * перехода связываются с уже существующими узлами (`_linkClosest` не заглядывает
   * в те, что появятся позже).
   */
  _buildNav() {
    const nav = new NavGraph();
    const rstep = J.navRoomStep;
    this._navLattice(nav);
    this._navRooms(nav, rstep);
    this._navRoofs(nav);
    this._navStairs(nav, rstep);
    this._navDecks(nav);
    this._navWater(nav);
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

  /**
   * Сетка полов комнат: клетки внутри rect, кроме плана марша и клеток без опоры.
   *
   * Тесная комната (дома генератора кварталов 7–8 м) решётки `J.navRoomStep`
   * почти не имеет: проём марша посередине, а линия `rect.min + r` — в полосе
   * габарита у стены. Пол при этом есть, марш в комнату выходит, но связывать
   * нечего, и весь верх дома отрезает `_pruneToSpawn`. Если грубый проход дал
   * меньше трёх клеток, сетка повторяется шагом вдвое мельче: её узлы лежат
   * между прежними (ключ — координаты клетки, поэтому совпадающие точки не
   * дублируются) и связываются и друг с другом, и с живыми грубыми клетками.
   */
  _navRooms(nav, rstep) {
    for (const b of this.buildings) {
      for (const room of b.rooms) {
        if (this._roomGrid(nav, b, room, rstep, false) <= 2) {
          this._roomGrid(nav, b, room, rstep / 2, true);
        }
      }
    }
  }

  /**
   * Один проход решётки пола комнаты. `fine` — мельчающая сетка: её узлы тянут
   * рёбра к соседям по своему шагу и к клеткам грубого прохода (`_linkClosest`),
   * потому что общая adjacency-решётка их не связывает — они из разных фаз.
   *
   * @returns {number} число поставленных (или найденных) клеток
   */
  _roomGrid(nav, b, room, step, fine) {
    // отступ решётки — не просто радиус тела: стена стоит СЕРЕДИНОЙ на линии
    // плана (`edgeRect`), поэтому лезёт внутрь на половину толщины, и клетка в
    // `radius + 0,05` от грани оказывается внутри габарита и бракуется. Из-за
    // этого первая линия живой решётки в доме 14,5 × 6 м (nkab_094 главы 10)
    // оставалась одна — ровно под отметку шахты марша, и этаж рассыпался на две
    // несвязные половины: верх дома отрезало `_pruneToSpawn`
    const r = CONFIG.radius + J.wallThickness / 2 + 0.05;
    const cols = [];
    const xs = [];
    for (let x = room.rect.minX + r; x <= room.rect.maxX - r + 1e-6; x += step) xs.push(x);
    const zs = [];
    for (let z = room.rect.minZ + r; z <= room.rect.maxZ - r + 1e-6; z += step) zs.push(z);
    let count = 0;
    for (let j = 0; j < zs.length; j++) {
      const row = [];
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i], z = zs[j];
        if (this._inStair(b, x, z, room.floor)) continue;
        // клетка над проёмом перекрытия (шахта марша) опоры этой комнаты не имеет
        const y = this._floorSupport(x, z, room.y);
        if (y === null) continue;
        if (this.isBlocked(x, z, CONFIG.radius, room.y, CONFIG.eyeHeight)) continue;
        const id = nav.add(x, y, z, `r:${room.id}:${Math.round(x * 100)}:${Math.round(z * 100)}`);
        row[i] = id;
        count++;
        if (fine) this._linkClosest(nav, id, step * 1.8, 3);
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
    return count;
  }

  /**
   * Посадка марша осталась висеть на одном ребре (только на своей ступени): в
   * тесной комнате единственная клетка решётки лежит за проёмом марша, и ребро
   * через проём бракует `_edgeSupported`. Этаж с сеткой мельче и повторная
   * связка посадки — иначе `_pruneToSpawn` отрезает весь верх дома.
   */
  _refineFloor(nav, b, floor, land, rstep) {
    for (const room of b.rooms) {
      if (room.floor === floor) this._roomGrid(nav, b, room, rstep / 2, true);
    }
    this._linkClosest(nav, land, rstep * 1.2, 3);
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

  /**
   * Решётка ходовых кровель: узлы шагом `J.navStep` по плитам на отметке roofY.
   *
   * Клетку бракует то же, что и пол комнаты: нет опоры уровня кровли (проём под
   * шахтой марша, чужое здание) или габариту мешает парапет — он и держит идущего
   * у края, и не даёт сойти с плиты там, где нет ни схода, ни
   * перехода. Связи между плитами одного здания идут через `_link`: ребро над
   * проёмом отбракует `_edgeSupported`, и марш останется единственной дорогой
   * через него.
   */
  _navRoofs(nav) {
    if (!this.roofPlates.length) return;
    const step = J.navStep;
    // тот же отступ, что и у пола комнаты: парапет — фасадная стена той же
    // толщины, стоящая серединой на линии плана, и линия решётки в `radius` от
    // края бракулась бы его габаритом (замер на ходовой кровле 7 × 7,5 м
    // `skit_236` главы 10: при отступе 0,5 м живых клеток не осталось ни одной
    // из четырёх, при 0,675 — две из двух; до правки подъём держался только на
    // цепочке от люка)
    const r = CONFIG.radius + J.wallThickness / 2 + 0.05;
    for (const b of this.buildings) {
      if (b.roof?.walkable !== true) continue;
      const nx = Math.floor((b.bounds.maxX - b.bounds.minX) / step);
      const nz = Math.floor((b.bounds.maxZ - b.bounds.minZ) / step);
      const lat = [];
      for (let j = 0; j <= nz; j++) {
        const row = new Array(nx + 1);
        const z = b.bounds.minZ + r + j * step;
        if (z <= b.bounds.maxZ - r + 1e-6) {
          for (let i = 0; i <= nx; i++) {
            const x = b.bounds.minX + r + i * step;
            if (x > b.bounds.maxX - r + 1e-6) continue;
            const y = this._floorSupport(x, z, b.roofY);
            if (y === null) continue;
            if (this.isBlocked(x, z, CONFIG.radius, b.roofY, CONFIG.eyeHeight)) continue;
            row[i] = nav.add(x, y, z, `k:${b.id}:${i}:${j}`);
          }
        }
        lat.push(row);
      }
      for (let j = 0; j < lat.length; j++) {
        for (let i = 0; i <= nx; i++) {
          const id = lat[j][i];
          if (id === undefined) continue;
          if (i > 0 && lat[j][i - 1] !== undefined) this._link(nav, id, lat[j][i - 1]);
          if (j > 0 && lat[j - 1][i] !== undefined) this._link(nav, id, lat[j - 1][i]);
        }
      }
    }
  }

  /** Цепочка проступей марша + посадки у его начала и конца. */
  _navStairs(nav, rstep) {
    for (const b of this.buildings) {
      for (const s of b.stairs) {
        // верх марша на кровле ищет соседей по решётке кровли (шаг J.navStep), а
        // не по сетке пола (J.navRoomStep): иначе радиус в 3,6 м не дотянет до
        // ближайшего узла, и поднявшийся с марша останется на одной точке
        const roofTop = b.roof?.walkable === true && s.connectsFloors[1] === b.floorsCount;
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
        for (const [land, tread, isTop] of [[bottom, ids[0], false], [top, ids[ids.length - 1], true]]) {
          if (land === undefined) continue;
          this._link(nav, land, tread);
          // цепочка от люка: решётка кровли шагом `J.navStep` не обязана оставить
          // узел СНАРУЖИ шахты (на доме 7 × 7 обе её линии попадают в габарит
          // парапета), а ребро «посадка → узел через проём» бракует
          // `_edgeSupported`. Без цепочки поднявшийся стоит на одной точке, и
          // `_pruneToSpawn` отрезает кровлю вместе с маршем
          if (isTop && roofTop) this._roofChain(nav, b, s, land);
          this._linkClosest(nav, land, isTop && roofTop ? J.navStep * 1.5 : rstep * 1.2, 3);
          // посадка висит на одном ребре (только на своей ступени): в тесной
          // комнате генератора единственная клетка решётки лежит за проёмом
          // марша, и ребро через него бракуется — этаж с кровлей отрезались бы
          // целиком. Сетка этажа повторяется шагом вдвое мельче
          if (!(isTop && roofTop) && nav.adj[land].length <= 1) {
            this._refineFloor(nav, b, isTop ? s.connectsFloors[1] : s.connectsFloors[0], land, rstep);
          }
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
   * Цепочка узлов от люка марша вдоль кровли. Решётка кровли шагом `J.navStep`
   * привязана к габариту дома и отступает в `CONFIG.radius` от его края, поэтому
   * на небольшой плите (7 × 7 м) обе её линии попадают в габарит парапета, а
   * ребро «посадка → единственная клетка через проём шахты» бракует
   * `_edgeSupported`: поднявшийся по лестнице стоит на одной точке, и
   * `_pruneToSpawn` отрезает кровлю вместе с маршем. Здесь шаг `J.navRoomStep`
   * наружу от центра шахты: он короче решёточного и гарантированно держит
   * опору кровли между посадкой и первой живой линией решётки.
   *
   * Цепочка обрывается на первой непригодной клетке — за ней парапет или край
   * плиты, и «прыгнуть через мёртвую точку» нога не перенесёт.
   */
  _roofChain(nav, b, s, land) {
    const from = nav.pos[land];
    const len = Math.hypot(from.x - (s.rect.minX + s.rect.maxX) / 2,
      from.z - (s.rect.minZ + s.rect.maxZ) / 2);
    if (len < 1e-6) return;
    const dx = (from.x - (s.rect.minX + s.rect.maxX) / 2) / len;
    const dz = (from.z - (s.rect.minZ + s.rect.maxZ) / 2) / len;
    let prev = land;
    let added = 0;
    for (let k = 1; k <= 8; k++) {
      const x = from.x + dx * k * J.navRoomStep;
      const z = from.z + dz * k * J.navRoomStep;
      const y = this._floorSupport(x, z, b.roofY);
      if (y === null || this.isBlocked(x, z, CONFIG.radius, b.roofY, CONFIG.eyeHeight)) break;
      const id = nav.add(x, y, z, `k:${b.id}:h:${s.id}:${k}`);
      this._link(nav, prev, id);
      prev = id;
      added++;
    }
    // последняя живая точка дотягивается до решётки кровли: без этого большой
    // пролёт крыши остался бы отдельным островом, а цепочка — тупиком на 8 м
    if (added) this._linkClosest(nav, prev, J.navStep * 1.2, 3);
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

  /**
   * Сход в русло и берег-склон: цепочка узлов вдоль уклона. Решётка земли их не
   * связывает: шаг решётки 6 м при предельном уклоне 0,3 даёт перепад 1,8 м, а
   * `_link` берёт только перешагиваемый, и дно осталось бы недостижимым, хотя
   * нога по склону идёт. Шаг вдоль подбирают так, чтобы перепад соседних узлов
   * не превысил шага ноги — как у наклонных настилов дорог.
   *
   * Концы цепочки связывает `_linkClosest`: низ — с решёткой дна (перепад нулевой,
   * ребро обычное), верх — с решёткой берега. Там, где `wade: false`, рёбра
   * отбраковывает блокер дна, и русло остаётся сухой границей между берегами.
   */
  _navWater(nav) {
    const step = J.navStep;
    for (const d of this.descents) {
      const span = Math.abs(d.u1 - d.u0);
      const rise = Math.abs(d.y1 - d.y0);
      if (span <= 0.01 || rise <= 0.01) continue;
      const v = (d.v0 + d.v1) / 2;
      const count = Math.max(1, Math.ceil(span / Math.min(step, this.stepUp * 0.8 * span / rise)));
      let first, prev;
      for (let k = 0; k <= count; k++) {
        const t = k / count;
        const u = d.u0 + (d.u1 - d.u0) * t;
        const x = d.axis === 'x' ? u : v;
        const z = d.axis === 'x' ? v : u;
        const id = nav.add(x, d.y0 + (d.y1 - d.y0) * t, z, `f:${d.id}:${k}`);
        if (first === undefined) first = id;
        else this._link(nav, prev, id);
        prev = id;
      }
      for (const id of [first, prev]) this._linkClosest(nav, id, step * 1.8, 2);
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
        // наружный узел НАРУЖНОЙ двери обязан выйти на решётку улицы: пол той же
        // комнаты лежит от него ближе (дверь врезана в фасад, а линия решётки —
        // в 0,5 м от стены), и без фильтра лимит в три ребра съедают именно они —
        // дом остаётся связным внутри, но отрезанным от улицы, и `_pruneToSpawn`
        // выбрасывает его целиком (замер на 10 генераторных дверях: 1 дом из 10
        // терял всё). Дверь между комнатами одного дома фильтру не подлежит: её
        // наружная точка стоит внутри плана, и цель её — соединить интерьер
        this._linkClosest(nav, outId, J.navStep * 1.8, 3,
          this._inPlan(b, d.outside) ? null : (p => !this._inPlan(b, p)));
      }
    }
  }

  /**
   * Точка внутри плана здания — по прямоугольникам частей, а не по габариту:
   * Г-образный дом держит двор внутри своего охвата, и он не «комната».
   */
  _inPlan(b, p) {
    return b.rects.some(r => p.x >= r.minX && p.x <= r.maxX && p.z >= r.minZ && p.z <= r.maxZ);
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
   * `filter`, если задан, отсекает кандидатов до сортировки — им пользуются
   * двери, которым нужна решётка улицы, а не пол той же комнаты.
   */
  _linkClosest(nav, id, radius, count, filter) {
    const from = nav.pos[id];
    const near = [];
    // кандидатов берём из пространственной сетки узлов, а не из всего списка:
    // на районе 600 м узлов 10 тыс., а `_linkClosest` зовётся на каждую дверь,
    // посадку марша и конец настила — полный перебор стоил бы миллионы проверок
    for (const i of nav.nearby(from.x, from.z, radius)) {
      if (i === id) continue;
      const p = nav.pos[i];
      const d = Math.hypot(p.x - from.x, p.z - from.z);
      if (d > radius || d < 0.01) continue;
      if (filter && !filter(p)) continue;
      near.push({ i, d });
    }
    // порядок с прежним полным перебором: при равных расстояниях раньше шел
    // узел с меньшим индексом — sort стабилен, а nearby обходит клетки, а не
    // индексы, поэтому равенство дистанций разрешаем явно
    near.sort((a, b) => a.d - b.d || a.i - b.i);
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
    // keep обязан быть индексным сопоставлением (keep[i] — новый узел узла i), а не
    // dense-списком: с `push` после первого отбракованного узла все индексы
    // сдвигаются, и рёбра связывают не те пары — граф покрывается фейковыми
    // скачками через русло и «одна связная сеть» перестаёт быть связной
    const keep = [];
    nav.pos.forEach((p, i) => {
      if (seen[i]) keep[i] = out.add(p.x, p.y, p.z);
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

  /**
   * Картинка грунта: плоскость минус планы русел, где каждый оставшийся
   * прямоугольник — своя пластина. Единая PlaneGeometry не годится: под ней
   * осталась бы сухая клетка там, где глаз видит воду, и нога встала бы на
   * «пол мира — ноль» посреди русла.
   *
   * Плоскость лежит в XY и смотрит вдоль +Z, а меш поворачивается на −90° вокруг
   * X: мировая ось Z выходит из локальной −Y, мировая высота — из локальной Z.
   */
  _groundGeo() {
    let rects = [{ minX: -this.half, maxX: this.half, minZ: -this.half, maxZ: this.half }];
    for (const h of this.holes) rects = rects.flatMap(r => subtractRect(r, h));
    return mergeGeometries(rects.map(r => new THREE.PlaneGeometry(
      r.maxX - r.minX, r.maxZ - r.minZ,
    ).translate((r.minX + r.maxX) / 2, -(r.minZ + r.maxZ) / 2, 0)), false);
  }

  /**
   * Вода: один меш полупрозрачных пластин на отметках `surfaceY`. Коллизий у него
   * нет ни для луча, ни для тела — решение о том, где русло проходимо вброд,
   * принимает геометрия дна и блокер, а не картинка.
   */
  _buildWater(scene) {
    if (!this.waterRects.length) return;
    const geo = mergeGeometries(this.waterRects.map(r => new THREE.PlaneGeometry(
      r.maxX - r.minX, r.maxZ - r.minZ,
    ).translate((r.minX + r.maxX) / 2, -(r.minZ + r.maxZ) / 2, r.y)), false);
    const water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: J.waterColor, roughness: 0.3, metalness: 0.1,
      transparent: true, opacity: J.waterOpacity,
    }));
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    this.sceneObjects.push(water);
  }

  /**
   * Окна фасадов: квады-эмиссия по фасадным полосам и этажам.
   *
   * Так, а не списком в брифе, потому что цена: 34 тыс. окон по 40 байт текста
   * удвоили бы `level-10.js` (и без того 1,8 МБ), а выводятся они из того, что
   * парсер уже посчитал, — габарита стены, высоты этажа и материала фасада.
   * Горит окно или нет решает хеш адреса слота (см. `hash01`), поэтому правка
   * одного дома не перекрашивает соседний квартал.
   *
   * Окно — картинка: ни `solids`, ни `blockers`, ни узлов графа. Пуля проходит
   * сквозь квад, потому что стекло стоит снаружи стены, а решение о проходимости
   * принимает та стена (AGENTS.md о декоре).
   *
   * @returns {Map<number, {x,y,z,c,s,w,h}[]>} цвет → экземпляры; `c`/`s` — косинус
   *   и синус поворота квада (кратные 90°), `w`/`h` — его размеры
   */
  _windowItems() {
    const W = this.winCfg;
    const groups = new Map();
    const put = (color, it) => {
      if (!groups.has(color)) groups.set(color, []);
      groups.get(color).push(it);
    };
    for (const b of this.buildings) {
      const style = W.byMaterial?.[b.facadeMaterial];
      const cfg = style ? { ...W, ...style } : W;
      if (!(cfg.spacing > 0) || !b.floorsCount) continue;
      const h = Math.min(cfg.height, b.floorHeight - cfg.sill - 0.1);
      if (h < 0.5) continue;
      // двери этажа трогает только тот этаж, где они есть: у дома в 40 этажей
      // проёмов не больше четырёх, а слотов — тысячи
      const doorFloors = new Set(b.doors.map(d => Math.round((d.y - b.baseY) / b.floorHeight)));
      const hb = fnvStr(2166136261, b.id);
      for (const w of b.walls) {
        if (!w.facade) continue;
        const face = this._outerFace(b, w);
        if (!face) continue;
        const buried = this._buriedRuns(b, face, cfg.offset);
        const line = face.coord + face.dir * cfg.offset;
        const hf = fnvMix(fnvMix(hb, Math.round(face.coord * 100)), face.axis === 'x' ? 1 : 2);
        for (let k = 0; k < b.floorsCount; k++) {
          const floorY = b.baseY + k * b.floorHeight;
          const cy = floorY + cfg.sill + h / 2;
          if (cy + h / 2 > b.roofY - 0.05) continue;
          let slot = 0;
          for (let p = face.lo + cfg.spacing / 2; p + cfg.width / 2 <= face.hi - 0.1; p += cfg.spacing, slot++) {
            if (doorFloors.has(k) && this._doorOverlaps(b, face, p, floorY, b.floorHeight, cfg.width)) continue;
            if (buried.length && buried.some(r => p > r[0] && p < r[1] && cy > r[2] && cy < r[3])) continue;
            const r = fnvUnit(fnvMix(fnvMix(hf, k), slot));
            const lit = r < cfg.lit;
            put(lit ? W.litColors[Math.min(W.litColors.length - 1, Math.floor(r / cfg.lit * W.litColors.length))]
              : W.darkColor, {
              x: face.axis === 'x' ? p : line,
              y: cy,
              z: face.axis === 'x' ? line : p,
              c: face.c, s: face.s, w: cfg.width, h,
            });
          }
        }
      }
    }
    return groups;
  }

  /**
   * Неон и билборды: панели по фасадным граням тех же домов, что носят окна.
   *
   * Вывод, а не список в брифе — по той же причине, что и окна и мусор: панель
   * влезает в четыре числа, а её адрес считается из габарита стены, который
   * парсер уже посчитал. Ручной путь для этого закрыт форматом: `authoredProp`
   * ставит предмет на опору земли и предупреждает о любой другой высоте, а
   * предупреждение в закоммиченном модуле запрещено (AGENTS.md о пайплайне JSON).
   *
   * От окна панель отличается масштабом и выносом: `offset` больше, чем у окон,
   * иначе два квада лежат в одной плоскости и мигают в z-buffer. Панель бракуется,
   * если её перекрывает объём другого дома (та же `_buriedRuns`, что у окон, но по
   * интервалу ширины, а не по центру слота) и если её нижний этаж — дверной проём:
   * вывеска посреди входа читается второй дверью.
   *
   * @returns {Map<number, {x,y,z,c,s,w,h}[]>} цвет палитры → экземпляры, та же
   *   форма, что у `_windowItems`
   */
  _signageItems() {
    const S = this.signCfg;
    const groups = new Map();
    if (!S) return groups;
    const put = (color, it) => {
      if (!groups.has(color)) groups.set(color, []);
      groups.get(color).push(it);
    };
    for (const b of this.buildings) {
      const style = S.byMaterial?.[b.facadeMaterial];
      const cfg = style ? { ...S, ...style } : S;
      if (!(cfg.keep > 0) || !b.floorsCount || b.floorsCount < cfg.minFloors) continue;
      // двери этажа трогает только тот этаж, где они есть (как у окон)
      const doorFloors = new Set(b.doors.map(d => Math.round((d.y - b.baseY) / b.floorHeight)));
      const hb = fnvStr(2166136261, `${b.id}|sign`);
      for (const w of b.walls) {
        if (!w.facade) continue;
        const face = this._outerFace(b, w);
        if (!face || face.hi - face.lo < cfg.minRun) continue;
        const buried = this._buriedRuns(b, face, cfg.offset);
        const line = face.coord + face.dir * cfg.offset;
        const hf = fnvMix(hb, Math.round(face.coord * 100) + (face.axis === 'x' ? 7 : 13));
        // нижний этаж панели: `max` двух отсчётов смещает выбор к верху фасада —
        // там панель видна через крыши соседних малоэтажных домов, а в цоколе её
        // съедает первый ряд
        // полосы делят полезную ширину грани равномерно, а не садятся на сетку от
        // её угла: на грани в 10 м (медиана района) сетка шагом 6–12 м ставила
        // центр слота так, что панель шириной 4–8 м не влезала никогда, и `keep`
        // на плотность не влиял вовсе (замер: 63 панели при keep 0,4 и 63 при 1)
        const usable = face.hi - face.lo - 2 * cfg.edge;
        if (usable < cfg.minWidth) continue;
        const n = Math.max(1, Math.min(cfg.perFace, Math.floor(usable / cfg.step)));
        for (let k = 0; k < n; k++) {
          const draw = makeDraw(fnvMix(hf, k * 7919));
          if (draw() >= cfg.keep) continue;
          const width = r3(Math.min(cfg.width[0] + (cfg.width[1] - cfg.width[0]) * draw(), usable / n));
          if (width < cfg.minWidth) continue;
          const p = r3(face.lo + cfg.edge + usable * (k + 0.5) / n);
          const floors = Math.min(cfg.panelFloors + (draw() < 0.5 ? 0 : 1), b.floorsCount - 1);
          // пояс выбирается среди этажей, где панель реально влезает: `max` двух
          // отсчётов тянет его вверх, а кламп по `fMax` держит 4-этажный дом (их в
          // районе большинство) — иначе верхний пояс всегда вне этажности и панель
          // не ставится вовсе, как бы ни был велик `keep`
          const fMax = b.floorsCount - floors;
          if (fMax < 1) continue;
          const f = Math.min(fMax, 1 + Math.floor(Math.max(draw(), draw()) * fMax));
          let onDoor = false;
          for (let i = 0; i < floors; i++) if (doorFloors.has(f + i)) onDoor = true;
          if (onDoor) continue;
          const y0 = b.baseY + f * b.floorHeight;
          const h = Math.min(floors * b.floorHeight - 0.4, b.roofY - y0 - 0.3);
          if (h < 1.5) continue;
          const cy = y0 + h / 2;
          // интервал панели по бегу и по высоте против интервалов чужого объёма
          if (buried.some(r => p - width / 2 < r[1] && p + width / 2 > r[0]
            && cy - h / 2 < r[3] && cy + h / 2 > r[2])) continue;
          put(cfg.colors[Math.min(cfg.colors.length - 1, Math.floor(draw() * cfg.colors.length))], {
            x: face.axis === 'x' ? p : line,
            y: cy,
            z: face.axis === 'x' ? line : p,
            c: face.c, s: face.s, w: width, h,
          });
        }
      }
    }
    return groups;
  }

  /**
   * Участки фасада, где окно оказалось бы внутри соседнего здания: башня,
   * выросшая из подиума, фасад дома, впритык поставленного к соседу.
   *
   * Считается один раз на грань, а не на окно, и только по кандидатам с трёх
   * проб вдоль полосы: на 32 тыс. окон проба индекса плана стоила 117 мс из 180
   * всего вывода окон, — а перекрывают фасад единицы зданий, их список короткий.
   *
   * @returns {[lo, hi, y0, y1][]} интервалы вдоль бега стены и по высоте, где
   *   окно не видно
   */
  _buriedRuns(b, face, offset) {
    const line = face.coord + face.dir * offset;
    const out = [];
    const seen = new Set();
    for (const t of [face.lo + 0.5, (face.lo + face.hi) / 2, face.hi - 0.5]) {
      const x = face.axis === 'x' ? t : line;
      const z = face.axis === 'x' ? line : t;
      for (const idx of this._planAt(this._buildingCells, x, z)) {
        if (seen.has(idx)) continue;
        seen.add(idx);
        const o = this.buildings[idx];
        if (o === b || o.baseY >= b.roofY - 0.01 || o.roofY <= b.baseY + 0.01) continue;
        for (const r of o.rects) {
          if (line <= (face.axis === 'x' ? r.minZ : r.minX)
            || line >= (face.axis === 'x' ? r.maxZ : r.maxX)) continue;
          const a = Math.max(face.lo, face.axis === 'x' ? r.minX : r.minZ);
          const c = Math.min(face.hi, face.axis === 'x' ? r.maxX : r.maxZ);
          if (c - a > 0.05) out.push([a, c, o.baseY, o.roofY]);
        }
      }
    }
    return out.sort((p, q) => p[0] - q[0]);
  }

  /**
   * Какая из двух граней фасадной полосы смотрит наружу. Полоса стоит серединой
   * на линии плана, поэтому наружная грань на половину толщины дальше от
   * полигона, и проба за неё обязана остаться вне планов дома.
   *
   * @returns {{axis:'x'|'z', lo:number, hi:number, coord:number, dir:number, c:number, s:number}|null}
   *   `axis` — ось бега стены, `coord` — грань по поперечной оси, `dir` — её
   *   нормаль (−1 или +1), `c`/`s` — косинус и синус поворота квада; null — полоса
   *   не фасад (перегородка между двумя планами, например внутренний двор-щель)
   */
  _outerFace(b, w) {
    const alongX = w.axis === 'x';
    const lo = alongX ? w.minX : w.minZ;
    const hi = alongX ? w.maxX : w.maxZ;
    if (hi - lo < J.windows.width) return null;
    const mid = (lo + hi) / 2;
    const near = alongX ? w.minZ : w.minX;
    const far = alongX ? w.maxZ : w.maxX;
    const d = J.wallThickness / 2 + 0.05;
    const out = (coord, dir) => {
      const x = alongX ? mid : coord + dir * d;
      const z = alongX ? coord + dir * d : mid;
      return !this._rectsHold(b, x, z);
    };
    const a = out(near, -1), c = out(far, 1);
    // обе наружу — вырожденная полоса (дом-лента): выбираем дальнюю от центра
    // габарита, чтобы квады не легли с двух сторон одной стены
    let coord, dir;
    if (a && !c) { coord = near; dir = -1; } else if (c && !a) { coord = far; dir = 1; }
    else if (a && c) {
      const cx = (b.bounds.minX + b.bounds.maxX) / 2, cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
      const mine = alongX ? cz : cx;
      coord = Math.abs(near - mine) >= Math.abs(far - mine) ? near : far;
      dir = coord === near ? -1 : 1;
    } else return null;
    return {
      axis: alongX ? 'x' : 'z', lo, hi, coord, dir,
      // квад лежит в XY и смотрит вдоль +Z: поворот вокруг Y выводит его нормаль
      // на нужную сторону. Точные ±1/0, а не cos(π/2) — матрицы пишутся руками
      c: dir < 0 ? (alongX ? -1 : 0) : (alongX ? 1 : 0),
      s: dir < 0 ? (alongX ? 0 : -1) : (alongX ? 0 : 1),
    };
  }

  /** Есть ли план дома в точке (строгое вхождение: граница плана не считается). */
  _rectsHold(b, x, z) {
    for (const r of b.rects) {
      if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return true;
    }
    return false;
  }

  /** Настройка мусора: `J.clutter` плюс переопределение ритмов из брифа. */
  _clutterSpec(o) {
    const C = { ...J.clutter, ...o };
    C.roof = { ...J.clutter.roof, ...(o.roof ?? {}) };
    C.street = { ...J.clutter.street, ...(o.street ?? {}) };
    return C;
  }

  /**
   * Мусор кровель и тротуаров: позиции, как у окон, выводятся из данных facade и
   * настилов, а не приезжают списком из парсера — 1,2 тыс. записей удвоили бы
   * файл главы. Предметы не создают ни `solids`, ни `blockers`, ни узлов графа
   * (правило о декоре в AGENTS.md): человек проходит сквозь венткороб так же,
   * как сквозь пальму.
   *
   * Два правила, без которых вывод превратился бы в шум:
   *
   * 1. Предмет стоит там, где его держат. На кровле — точка внутри своего плана
   *    с отступом от борта (парапет и сход с края не трогает) и без соседнего
   *    дома, чей объём проходит через эту отметку: иначе бак висел бы внутри
   *    башни, выросшей из подиума. На улице — у борта настила, вне габарита
   *    домов, не ближе `minLamp` к уже поставленному предмету (фонари и деревья
   *    приходят из брифа) и там, где опора совпадает с верхом пролёта.
   * 2. Детерминизм. Случайности нет: выбор слота, типа и масштаба считается
   *    хэшем от id дома или дороги плюс номер слота, поэтому два прогона дают
   *    побитово равные матрицы, а правка `keep` сдвигает только плотность.
   *
   * @returns {object[]} записи в формате нормализованных `props` для `buildProps`
   */
  _clutterItems() {
    const C = this.clutterCfg;
    if (!C) return [];
    const items = [];
    const nearProp = this._propNear();
    const size = h => r3(C.size[0] + (C.size[1] - C.size[0]) * h);
    const pick = (h, list) => list[Math.min(list.length - 1, Math.floor(h * list.length))];
    // над предметом обязано быть пусто: переход или пролёт моста, приходящийся
    // на уровень кровли, прятал бы бак внутри своей картинки
    const clearAbove = (x, y, z) => !this.raySolid(x, y + 0.2, z, 0, 1, 0, C.head);
    const add = (model, x, y, z, draw) => {
      const s = size(draw());
      items.push({
        model,
        source: 'generated',
        rotationY: Math.floor(draw() * 4) * 90,
        position: { x, y, z },
        scale: { x: s, y: s, z: s },
      });
    };

    for (const b of this.buildings) {
      if (!b.floorsCount) continue;
      const models = b.roofY >= C.tall ? C.tallModels : C.roofModels;
      const hb = fnvStr(2166136261, `${b.id}|roof`);
      let n = 0;
      let done = false;
      for (const r of b.rects) {
        if (done) break;
        if (r.maxX - r.minX < 2 * C.roof.edge || r.maxZ - r.minZ < 2 * C.roof.edge) continue;
        let k = 0;
        for (let x = r.minX + C.roof.edge; x <= r.maxX - C.roof.edge + 1e-6; x += C.roof.step) {
          for (let z = r.minZ + C.roof.edge; z <= r.maxZ - C.roof.edge + 1e-6; z += C.roof.step, k++) {
            if (n >= C.roof.perHouse) { done = true; break; }
            const draw = makeDraw(fnvMix(hb, k * 7919));
            if (draw() >= C.roof.keep) continue;
            if (this._roofCovered(b, x, z)) continue;
            if (!clearAbove(x, b.roofY, z)) continue;
            add(pick(draw(), models), r3(x), b.roofY, r3(z), draw);
            n++;
          }
        }
      }
    }

    for (const road of this.roads) {
      // по настилам мостов и переходов мусора нет: там не тротуар, а единственный
      // проход — контейнер посреди пролёта выглядел бы стеной, которой нет
      if (road.type !== 'ground') continue;
      for (const d of road.decks) {
        const alongX = d.axis === 'x';
        const lo = alongX ? d.minX : d.minZ;
        const hi = alongX ? d.maxX : d.maxZ;
        const len = hi - lo;
        if (len < C.street.every) continue;
        const hs = fnvStr(2166136261, `${road.id}|${Math.round(lo * 10)}|${Math.round(hi * 10)}`);
        let k = 0;
        for (let u = lo + C.street.every / 2; u <= hi - C.street.every / 2; u += C.street.every, k++) {
          for (const side of [-1, 1]) {
            const draw = makeDraw(fnvMix(hs, (k * 2 + side + 2) * 7919));
            if (draw() >= C.street.keep) continue;
            const cross = (side < 0 ? (alongX ? d.minZ : d.minX) : (alongX ? d.maxZ : d.maxX)) - side * C.street.inset;
            const x = alongX ? u : cross;
            const z = alongX ? cross : u;
            if (this._planHolds(x, z)) continue;
            if (nearProp(x, z, C.street.minLamp)) continue;
            const top = d.ramp
              ? d.topAtMin + (d.topAtMax - d.topAtMin) * (u - lo) / (hi - lo)
              : d.topY;
            const g = this.groundHeightAt(x, z, r3(top) + 0.4);
            if (Math.abs(g - top) > 0.25) continue;
            if (!clearAbove(x, g, z)) continue;
            add(pick(draw(), C.streetModels), r3(x), g, r3(z), draw);
          }
        }
      }
    }
    return items;
  }

  /** Через эту точку кровли проходит чужой объём: надстройка лота или соседний дом. */
  _roofCovered(b, x, z) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      const o = this.buildings[idx];
      if (o === b || !this._rectsHold(o, x, z)) continue;
      if (o.baseY < b.roofY + 0.05 && o.roofY > b.roofY + 0.05) return true;
    }
    return false;
  }

  /** Есть ли план любого дома в точке (уличному предмету там не место). */
  _planHolds(x, z) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      if (this._rectsHold(this.buildings[idx], x, z)) return true;
    }
    return false;
  }

  /**
   * Сетка уже поставленных предметов: фонари и деревья приходят из брифа, и
   * новый контейнер в трёх метрах от фонарного столба читался бы одной кучей.
   * Строится на один вывод, шаг ячейки — `minLamp`, чтобы проба брала 3×3.
   */
  _propNear() {
    const C = this.clutterCfg;
    // шаг ячейки — `minLamp`, но бриф может задать и ноль; на нулевой ячейке
    // сетка превратилась бы в деление на ноль и бесконечные ключи
    const cell = Math.max(0.5, C.street.minLamp);
    const grid = new Map();
    const key = (i, j) => `${i}|${j}`;
    for (const p of this.props) {
      const i = Math.floor(p.position.x / cell), j = Math.floor(p.position.z / cell);
      const k = key(i, j);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(p.position);
    }
    return (x, z, r) => {
      const i = Math.floor(x / cell), j = Math.floor(z / cell);
      for (let di = -1; di <= 1; di++) {
        for (let dj = -1; dj <= 1; dj++) {
          for (const p of grid.get(key(i + di, j + dj)) ?? []) {
            if (Math.hypot(p.x - x, p.z - z) < r) return true;
          }
        }
      }
      return false;
    };
  }

  /** Попадает ли слот на дверной проём своего этажа: окно в двери выглядело бы вторым проёмом. */
  _doorOverlaps(b, face, p, floorY, floorHeight, width) {
    for (const d of b.doors) {
      if (d.y < floorY - 0.01 || d.y >= floorY + floorHeight) continue;
      const lo = face.axis === 'x' ? d.rect.minX : d.rect.minZ;
      const hi = face.axis === 'x' ? d.rect.maxX : d.rect.maxZ;
      if (p + width / 2 > lo - 0.1 && p - width / 2 < hi + 0.1) return true;
    }
    return false;
  }

  /** Светящиеся окна фасадов: вывод и меши — у `_windowItems` и `_buildQuads`. */
  _buildWindows(scene) {
    this.windowCount = this.winCfg ? this._buildQuads(scene, this._windowItems(), 'windows') : 0;
  }

  /** Неон и билборды: те же квады, другая палитра и вынос за грань. */
  _buildSignage(scene) {
    this.signageCount = this.signCfg ? this._buildQuads(scene, this._signageItems(), 'signage') : 0;
  }

  /**
   * Меши квадов: по одному `InstancedMesh` на цвет палитры, а не на окно, и общая
   * геометрия. Материал — `MeshBasicMaterial`: кваду не нужен свет сцены, он и
   * есть свет, поэтому горящее окно и неон читаются ровно своим цветом независимо
   * от пула огней и остаются видимыми сквозь туман района.
   *
   * Матрица экземпляра пишется в буфер руками: повороты здесь только кратные 90°,
   * и на 32 тыс. окон `Matrix4.compose` с кватернионом стоил больше, чем вся
   * выводимая позиция.
   *
   * @param {'windows'|'signage'} kind — чтобы `dispose()` и тесты отличали один
   *   выводимый ряд от другого: материалы у них одинаковые по классу.
   * @returns {number} число экземпляров
   */
  _buildQuads(scene, groups, kind) {
    if (!groups.size) return 0;
    const geo = new THREE.PlaneGeometry(1, 1);
    let count = 0;
    for (const [color, items] of groups) {
      const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color }), items.length);
      const a = mesh.instanceMatrix.array;
      items.forEach((it, i) => {
        const o = i * 16;
        a[o] = it.c * it.w; a[o + 1] = 0; a[o + 2] = -it.s * it.w; a[o + 3] = 0;
        a[o + 4] = 0; a[o + 5] = it.h; a[o + 6] = 0; a[o + 7] = 0;
        a[o + 8] = it.s; a[o + 9] = 0; a[o + 10] = it.c; a[o + 11] = 0;
        a[o + 12] = it.x; a[o + 13] = it.y; a[o + 14] = it.z; a[o + 15] = 1;
      });
      mesh.instanceMatrix.needsUpdate = true;
      // сфера по экземплярам: без неё frustum culling меряет единичный квад в
      // центре мира и окно исчезает, как только начало координат уходит за экран
      mesh.computeBoundingSphere();
      mesh.userData.quad = kind;
      scene.add(mesh);
      this.sceneObjects.push(mesh);
      count += items.length;
    }
    return count;
  }

  build(scene) {
    this.sceneObjects = [];
    const ground = new THREE.Mesh(
      this.holes.length ? this._groundGeo() : new THREE.PlaneGeometry(this.width, this.depth),
      new THREE.MeshStandardMaterial({ color: this.groundColor, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.groundY;
    ground.receiveShadow = true;
    scene.add(ground);
    this.sceneObjects.push(ground);
    this._buildWater(scene);

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
      this.sceneObjects.push(mesh);
    }

    const clutter = this._clutterItems();
    this.clutterCount = clutter.length;
    for (const mesh of buildProps(scene, this.props.concat(clutter))) {
      // материалы пропов общие на модуль (src/props.js) и переживают загрузку
      // следующей главы — dispose() обязан снимать геометрию, но не их
      mesh.userData.sharedMaterial = true;
      this.sceneObjects.push(mesh);
    }
    this._buildWindows(scene);
    this._buildSignage(scene);
    this._buildLights(scene);
  }

  /**
   * Снимает со сцены всё, что поставил `build`: меши с их геометрия и материалами,
   * настоящие источники и лампы-сферы. Сцена главы пересоздаётся на каждой загрузке
   * (AGENTS.md о жизненном цикле), а на районе 600 м одна утечка — десятки мегабайт
   * буферов, которые больше никто не держит.
   */
  dispose() {
    for (const o of this.sceneObjects ?? []) {
      o.parent?.remove(o);
      o.geometry?.dispose?.();
      // материалы пропов (src/props.js) модульные и переиспользуются следующей
      // главой — их не убираем; всё, что создал `build` для себя, — свои
      if (o.material && !o.userData.sharedMaterial) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose?.());
      }
    }
    for (const l of this.realLights ?? []) {
      l.parent?.remove(l);
      l.target?.parent?.remove(l.target);
    }
    this.sceneObjects = [];
    this.realLights = [];
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
      this.sceneObjects.push(mesh);
    }
  }

  // ------------------------------------------------------------------ миникарта

  /**
   * План уровня на отметке игрока: плиты полов этого этажа, стены, которые его
   * задевают, проёмы маршей и настилы дорог.
   *
   * Окно — локальное: `J.minimapRange` метров вокруг игрока, а не весь город. При стороне
   * 600 м весь план в 336 px даёт 0,52 м/пиксель — стена 0,35 м исчезает меньше пикселя,
   * а «план этажа» превращается в серый квадрат. Главы помельще (176 м) окна не
   * касаются: их разброс меньше окна, и масштаб остаётся прежний.
   */
  drawMinimap(ctx, size, playerPos) {
    ctx.fillStyle = '#1b2128';
    ctx.fillRect(0, 0, size, size);

    const cx = playerPos ? playerPos.x : this.spawn.x;
    const cz = playerPos ? playerPos.z : this.spawn.z;
    const range = Math.min(J.minimapRange, Math.max(this.width, this.depth) / 2);
    const k = size / (2 * range);
    const toPx = (wx, wz) => [(wx - cx + range) * k, (wz - cz + range) * k];
    const rectPx = r => {
      const [x0, z0] = toPx(r.minX, r.minZ);
      const [x1, z1] = toPx(r.maxX, r.maxZ);
      if (x1 < 0 || z1 < 0 || x0 > size || z0 > size) return null;
      return [x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1)];
    };
    const fill = (list, pick) => {
      for (const it of list) {
        const p = pick ? pick(it) : true;
        if (!p) continue;
        const px = rectPx(it);
        if (px) ctx.fillRect(...px);
      }
    };

    const y = playerPos ? playerPos.y : this.spawn.y;
    // этаж игрока = плита пола или кровли, чья отметка ближе всего: у разных
    // домов своя высота этажа, поэтому ориентироваться на floorHeight движку
    // незачем
    let level = this.spawn.y, levelFloor = 0, best = Infinity;
    for (const p of [...this.floorPlates, ...this.roofPlates]) {
      const d = Math.abs(p.y - y);
      if (d < best) { best = d; level = p.y; levelFloor = p.floor ?? 0; }
    }

    // вода — под всем остальным: план русла виден и с уровня дна, и с моста
    ctx.fillStyle = 'rgba(30,86,120,.9)';
    fill(this.waterRects);
    ctx.fillStyle = 'rgba(90,100,116,.5)';
    fill(this.deckPlates, d => !d.ramp && Math.abs(d.topY - y) <= 1);
    ctx.fillStyle = 'rgba(196,212,232,.5)';
    fill(this.floorPlates, p => p.y === level);
    // плита кровли на плане — тот же пол: с неё и ведут маршруты, и миникарта
    // обязана показывать её контур, иначе идущий по крыше видит пустоту
    fill(this.roofPlates, p => p.y === level);
    ctx.fillStyle = '#262f3d';
    fill(this.blockers, w => w.y1 > y + 0.05 && w.y0 < y + CONFIG.eyeHeight);
    ctx.fillStyle = '#5b4a2c';
    fill(this.stairCells, s => s.k0 <= levelFloor && s.k1 >= levelFloor);

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
