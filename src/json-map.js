import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { CONFIG } from './config.js';
import { NavGraph } from './nav-graph.js';
import {
  SurfaceField, sweepFractions, sweepSurfaceAt,
  rayWedge, raySweep, pushOutWedge, pushOutSweep, pushOutSweepRails,
} from './surfaces.js';
import { r3, subtractRect, rotatePoint, arcBankAt } from './geo2d.js';
import { buildProps } from './props.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;

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
 * посчитать без движка: AABB-солиды и плоские опоры, коллизии габарита (стена
 * минус дверной проём), граф навигации и меш. Твёрдость настилов, призм и русел
 * с их опорой, лучом и сферой держит `src/surfaces.js` — тот же код читается и
 * в Node, где парсер валидирует рёбра скелета open-world.
 *
 * Контракт карты (см. AGENTS.md) держится полностью: движок не знает, что уровень
 * пришёл из JSON, и отличает его только по `map.kind` в `Game.createMap`.
 */
export class JsonMap extends SurfaceField {
  /** @param {object} spec map-секция определения главы (LEVEL_09.map) */
  constructor(spec) {
    // грунт, рельеф, дома, дороги и русла с их твёрдостью — в `SurfaceField`;
    // здесь остаются только те поля, которые нужны картинке и навигации
    super(spec);
    // `json2` — карта с поворотными домами (v2): тот же класс, тот же контракт,
    // только у зданий появляется угол. При `kind: 'json'` угол absent и каждый
    // путь ниже идёт прежней арифметикой — главы 9 и 10 собираются побитово.
    this.kind = spec.kind ?? 'json';
    this.spec = spec;
    this.groundColor = spec.ground.color ?? J.asphalt;
    this.bounds = spec.bounds;
    this.viewHalf = this.half + 24;
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

    this.geo = this._geoGroups();

    this.collectData();

    const s = spec.spawn ?? { x: 0, z: 0 };
    this.spawn = { x: s.x, y: this.groundHeightAt(s.x, s.z, this.groundY), z: s.z };
    this.anchors = this._collectAnchors();
    // Предикат пригодности узла для движка (`randomNavPoint` и `findPath`). У
    // `JsonMap` он `null`: глава собирается целиком, а изолированные карманы уже
    // отрезаны `_pruneToSpawn`, поэтому годен каждый узел графа. `WorldMap`
    // ставит проверку «узел стоит в загруженной клетке»: его граф достраивается
    // по чанкам и остаётся append-only, так что узел выгруженной клетки никуда
    // не девается — маршрут через него повёл бы врага в несобранный район.
    this.navFit = null;
    this.nav = this._buildNav();
  }

  // ---------------------------------------------------------------- картинка
  // Данные (солиды, опоры, блоке́ры, призмы, дуги) собирает `SurfaceField`; сюда
  // приходят только заявки на геометрию — и ровно в той же точке обхода, где
  // геометрия создавалась до разделения фаз, поэтому `mergeGeometries` склеивает
  // группы в прежнем порядке.

  /**
   * Пустые группы картинки — один список ключей на весь класс. Он нужен и
   * открытому миру, который заводит группы клетки тем же вызовом: группа,
   * пропущенная во втором перечислении, потеряла бы меш молча, а не бросила бы
   * ошибку.
   */
  _geoGroups() {
    return { walls: [], slabs: [], stairs: [], decks: [], earth: [], rails: [] };
  }

  /**
   * Картинка по заявке фазы данных: `group` — группа `this.geo`, `d` — созданная
   * запись (`{kind:'box'|'prism'|'arc', …}`).
   *
   * В проходе данных (`_muteGeo`, ставит `collectPass`) геометрия не нужна ни
   * одному приёмнику, кроме дуги: её `_sweepMesh` пишет `s.tris` и `s.hitTris`,
   * и по ним, а не по мешу, судит луч. Поэтому глушение — на выходе меша, а не
   * на обходе: пропущенная дуга оставила бы полотно без твёрдости.
   */
  _addGeo(group, d) {
    // дуга отрабатывает и в глушении: `_sweepMesh` пишет `s.tris` и `s.hitTris`,
    // и это твёрдость полотна, а не картинка
    if (d.kind === 'arc') { this._sweepMesh(d.s); return; }
    if (this._muteGeo) return;
    if (d.kind === 'box') this.geo[group].push(this._boxGeo(d.plan, d.y0, d.g1, d.frame));
    else this.geo[group].push(this._prismGeo(d.w));
  }

  /**
   * Коробка уровня по своей локальной грани: `g1` — уже сдвинутый вниз верх
   * картинки (правило со-плоскостных швов держит `SurfaceField._box`, здесь
   * только рисование).
   *
   * `frame` — поворотный кадр дома (v2). Знак — то же соглашение, что у
   * `rotatePoint` и у `obb`: мировой вектор `(dx, dz)` переходит в
   * `(dx·c − dz·s, dx·s + dz·c)`, а `rotateY(θ)` делает `(x·cosθ + z·sinθ,
   * −x·sinθ + z·cosθ)`, значит θ = −rad.
   */
  _boxGeo(plan, y0, g1, frame) {
    const cx = (plan.minX + plan.maxX) / 2, cz = (plan.minZ + plan.maxZ) / 2;
    const geo = new THREE.BoxGeometry(plan.maxX - plan.minX, g1 - y0, plan.maxZ - plan.minZ);
    if (frame) {
      geo.translate(cx - frame.cx, (y0 + g1) / 2, cz - frame.cz);
      geo.rotateY(-frame.rad);
      geo.translate(frame.cx, 0, frame.cz);
    } else {
      geo.translate(cx, (y0 + g1) / 2, cz);
    }
    return geo;
  }

  /**
   * Лента дуги: полотно нарезано на секторы ≤ `J.sweepSlice`, верх и низ —
   * четырёхугольники, бока и торцы закрывают объём. Треугольники хранятся в
   * `s.tris` и идут **в обе стороны**: из них собирается меш и по ним же бьёт
   * луч, поэтому «картинка совпадает с опорой» — не соглашение, а один и тот же
   * набор граней. Отклонение ленты от точной поверхности (хорда 5° при R 40 м)
   * равно 3,8 см, опора при этом остаётся аналитической (`topAt`).
   *
   * Крен берётся из `arcBankAt` по доле развёртки, поэтому торец ленты — вертикаль
   * с **горизонтальным** верхом: примыкающий прямой настил плоский, и линия их
   * контакта обязана быть горизонталью, а не диагональю на всю ширину.
   */
  _sweepMesh(s) {
    const t = J.deckThickness;
    const fr = sweepFractions(s);
    const rings = fr.map(f => {
      const delta = s.spanr * f;
      const ang = s.a0r + delta;
      const bank = arcBankAt(delta, s.spanr, s.tanBank, s.transr);
      const y = s.y0 + (s.y1 - s.y0) * f;
      return [s.R - s.halfW, s.R + s.halfW].map(rho => [
        s.cx + Math.cos(ang) * rho,
        y + bank * (rho - s.R),
        s.cz + Math.sin(ang) * rho,
      ]);
    });
    const tris = [];
    const add = (a, b, c, ref) => {
      const nv = faceNormal(a, b, c);
      if (nv[0] * ref[0] + nv[1] * ref[1] + nv[2] * ref[2] < 0) {
        tris.push({ a, b: c, c: b, n: faceNormal(a, c, b) });
      } else {
        tris.push({ a, b, c, n: nv });
      }
    };
    const quad = (a, b, c, d, ref) => { add(a, b, c, ref); add(a, c, d, ref); };
    const down = p => [p[0], p[1] - t, p[2]];
    for (let i = 0; i + 1 < fr.length; i++) {
      const [ti0, to0] = rings[i], [ti1, to1] = rings[i + 1];
      const [bi0, bo0, bi1, bo1] = [down(ti0), down(to0), down(ti1), down(to1)];
      const ang = s.a0r + s.spanr * (fr[i] + fr[i + 1]) / 2;
      const rx = Math.cos(ang), rz = Math.sin(ang);
      quad(ti0, to0, to1, ti1, [0, 1, 0]);
      quad(bi0, bi1, bo1, bo0, [0, -1, 0]);
      quad(to0, to1, bo1, bo0, [rx, 0, rz]);
      quad(ti0, bi0, bi1, ti1, [-rx, 0, -rz]);
    }
    const cap = (row, out) => {
      const [ti, to] = row;
      quad(ti, to, down(to), down(ti), out);
    };
    const dir = Math.sign(s.spanr) || 1;
    const tang = a => [-Math.sin(a) * dir, 0, Math.cos(a) * dir];
    const t0 = tang(s.a0r), t1 = tang(s.a0r + s.spanr);
    cap(rings[0], [-t0[0], 0, -t0[2]]);
    cap(rings[rings.length - 1], t1);
    s.tris = tris;
    if (!this._muteGeo) this.geo.decks.push(this._sweepGeo(tris));
    if (s.rails) this._sweepRails(s, fr);
  }

  /** Меш ленты: плоские нормали граней — та же нарезка, что у луча. */
  _sweepGeo(tris) {
    const pos = [], nor = [], uv = [];
    for (const { a, b, c, n } of tris) {
      pos.push(...a, ...b, ...c);
      nor.push(...n, ...n, ...n);
      uv.push(0, 0, 1, 0, 0.5, 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    // индекс обязателен: в общем ключе `decks` лента лежит рядом с призмами
    // настилов, а `mergeGeometries` отказывает смеси индексированных и нет
    // (возвращает null, и глава падает без единого меша)
    geo.setIndex(Array.from({ length: pos.length / 3 }, (_, i) => i));
    return geo;
  }

  /**
   * Перила дуги — стенка как продолжение полотна: и её низ, и верх идут по
   * фактической высоте **кромки** (с креном и его раскруткой), а не по осевой,
   * поэтому ограждение — гладкая лента. Прежние секции-коробки мерили высоту по
   * оси и на 8 м полотна с креном 6° висели над асфальтом / уходили в него на
   * ±0,42 м, а по подъёму были лесенкой.
   *
   * Нарезка та же, что у полотна (`sweepFractions`): стенка стоит на тех же
   * кольцах, что лента, и в зоне раскрутки крена не отстаёт от него. Грани идут в
   * `s.hitTris` вместе с лентой — луч бьёт ровно в нарисованное, а опора и
   * проходимость берут аналитику (`ρ = const`), как у настила.
   */
  _sweepRails(s, fr) {
    const t = J.railThickness, h = J.railHeight, sink = J.railSink;
    const tris = [];
    const add = (a, b, c, ref) => {
      const nv = faceNormal(a, b, c);
      if (nv[0] * ref[0] + nv[1] * ref[1] + nv[2] * ref[2] < 0) {
        tris.push({ a, b: c, c: b, n: faceNormal(a, c, b) });
      } else {
        tris.push({ a, b, c, n: nv });
      }
    };
    const quad = (a, b, c, d, ref) => { add(a, b, c, ref); add(a, c, d, ref); };
    // сечение стенки — прямоугольник в (ρ, y): толщиной t, высотой h, низ на
    // `sink` ниже полотна, чтобы его нижняя грань не легла в одну плоскость с
    // асфальтом (со-плоскостные грани мигают в z-buffer — правило швов)
    const section = (ang, rhoEdge) => {
      const y0 = sweepSurfaceAt(s, ang, rhoEdge) - sink;
      const P = (rho, y) => [s.cx + Math.cos(ang) * rho, y, s.cz + Math.sin(ang) * rho];
      return [
        P(rhoEdge - t / 2, y0), P(rhoEdge + t / 2, y0),
        P(rhoEdge + t / 2, y0 + h), P(rhoEdge - t / 2, y0 + h),
      ];
    };
    const dir = Math.sign(s.spanr) || 1;
    const tang = a => [-Math.sin(a) * dir, 0, Math.cos(a) * dir];
    for (const side of [-1, 1]) {
      const rhoEdge = s.R + side * s.halfW;
      const rings = fr.map(f => section(s.a0r + s.spanr * f, rhoEdge));
      for (let i = 0; i + 1 < rings.length; i++) {
        const [p0, p1] = [rings[i], rings[i + 1]];
        const ang = s.a0r + s.spanr * (fr[i] + fr[i + 1]) / 2;
        const rad = [Math.cos(ang), 0, Math.sin(ang)];
        quad(p0[0], p1[0], p1[1], p0[1], [0, -1, 0]);
        quad(p0[1], p1[1], p1[2], p0[2], rad);
        quad(p0[2], p1[2], p1[3], p0[3], [0, 1, 0]);
        quad(p0[3], p1[3], p1[0], p0[0], [-rad[0], 0, -rad[2]]);
      }
      const t0 = tang(s.a0r), t1 = tang(s.a0r + s.spanr);
      const cap = (ring, ref) => quad(ring[0], ring[1], ring[2], ring[3], ref);
      cap(rings[0], [-t0[0], 0, -t0[2]]);
      cap(rings[rings.length - 1], t1);
    }
    s.hitTris = s.tris.concat(tris);
    if (!this._muteGeo) this.geo.rails.push(this._sweepGeo(tris));
  }

  /**
   * Призма: выпуклый профиль в плоскости `(u, y)`, протянутый поперёк на
   * `[v0, v1]`. 4 вершины на грань — иначе `mergeGeometries` гладко сошьёт
   * нормали по ребру; обход каждой грани разворачивается от центра объёма
   * (многогранник выпуклый, значит «наружу» — то, что от центра). Без индекса
   * соседние коробки в смеси отказались бы сливаться.
   */
  _prismGeo(w) {
    const P = w.frame
      ? (u, y, v) => { const p = rotatePoint(w.frame, u, v); return [p.x, y, p.z]; }
      : (u, y, v) => (w.axis === 'x' ? [u, y, v] : [v, y, u]);
    const pc = [0, 1].map(i => w.poly.reduce((a, p) => a + p[i], 0) / w.poly.length);
    const mid = (w.v0 + w.v1) / 2;
    const vol = P(pc[0], pc[1], mid);
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
   * Луч: сначала обычные солиды и земля (базовый механизм), затем — наклонные
   * призмы и стенки перил. Их тел нет в `solids`, иначе коробка по низу пролёта
   * спрятала бы под гладкой картинкой лестницу невидимых ступеней, а коробка
   * откоса — невидимую стену там, где глаз видит склон: пуля и сфера тела Чужого
   * опирались бы на них, а не на наклон.
   *
   * Земля-плоскость при этом отменяется для луча, вошедшего в русло: пол мира
   * лежит выше дна, и луч, уходящий в канал, обязан идти дальше — к стенке, дну
   * или настилу моста. Отвергать уже готовое попадание нельзя: верх береговой
   * стенки лежит ровно на отметке земли, и под тем же углом отбрасывался бы удар
   * в стенку, а не только в воду.
   */
  raySolid(ox, oy, oz, dx, dy, dz, maxDist) {
    const len = Math.hypot(dx, dy, dz);
    const groundIsPhantom = this.groundPlane && this.holes.length > 0 && len > 1e-9
      && dy / len < -1e-9
      && this._downwardHitInChannel(ox, oy, oz, dx / len, dy / len, dz / len, maxDist);
    const gp = this.groundPlane;
    if (groundIsPhantom) this.groundPlane = null;
    const base = super.raySolid(ox, oy, oz, dx, dy, dz, maxDist);
    this.groundPlane = gp;
    const limit = base ? base.dist : maxDist;
    const ux = len > 1e-9 ? dx / len : 0;
    const uy = len > 1e-9 ? dy / len : 0;
    const uz = len > 1e-9 ? dz / len : 0;
    const cand = this._rayCand;
    let best = null;
    cand.length = 0;
    this._plansOnSegment(this._prismCells, ox, oz, ux, uz, limit, cand);
    for (const idx of cand) {
      const h = rayWedge(this.prisms[idx], ox, oy, oz, dx, dy, dz);
      if (h && h.t > 1e-6 && h.t < limit && (!best || h.t < best.dist)) best = { ...h, dist: h.t };
    }
    cand.length = 0;
    this._plansOnSegment(this._railCells, ox, oz, ux, uz, limit, cand);
    for (const idx of cand) {
      const h = rayWedge(this.railWedges[idx], ox, oy, oz, dx, dy, dz);
      if (h && h.t > 1e-6 && h.t < limit && (!best || h.t < best.dist)) best = { ...h, dist: h.t };
    }
    // дуга — по тем же треугольникам, что её меш: луч видит ровно нарисованную
    // поверхность, а не габарит и не трансцендентное уравнение с `atan2`
    cand.length = 0;
    this._plansOnSegment(this._sweepCells, ox, oz, ux, uz, limit, cand);
    for (const idx of cand) {
      const h = raySweep(this.sweeps[idx], ox, oy, oz, dx, dy, dz);
      if (h && h.dist < limit && (!best || h.dist < best.dist)) best = h;
    }
    // грунт-поле: у луча, уходящего в холм, нет «плоскости земли», куда ему
    // упасть, — он обязан остановиться на склоне
    if (this.relief && len > 1e-9) {
      const h = this._reliefRay(ox, oy, oz, ux, uy, uz, limit);
      if (h && (!best || h.dist < best.dist)) best = h;
    }
    if (!best) return base;
    return { x: best.x, y: best.y, z: best.z, nx: best.nx, ny: best.ny, nz: best.nz, dist: best.dist };
  }

  /**
   * Удар луча в поле рельефа: марш шагом `relief.meshCell / 2` по знаку
   * разности «луч минус грунт», затем половинное деление на найденном интервале.
   *
   * Шаг — половина клетки картинки, а не «до первой пробы ниже грунта»: на
   * пологом склоне луч входит под малым углом и один шаг в клетку мог бы
   * проскочить бугор целиком. Предел `limit` уже задан сольюдом или призмой,
   * поэтому марш не тянется на всю землю.
   *
   * Аналитика, а не треугольники меша: картинка строится из той же функции по
   * той же сетке, и расхождение хорды с дугой на радиусах главы — сотые долями
   * метра (замер — `tests/relief-terrain.test.js`), тогда как вторая копия
   * поверхности в луче разошлась бы с опорой ноги.
   */
  _reliefRay(ox, oy, oz, dx, dy, dz, maxDist) {
    const step = J.relief.meshCell / 2;
    const gap = (t) => (oy + dy * t) - this.relief.heightAt(ox + dx * t, oz + dz * t);
    let prev = gap(0);
    // шаг считается целым числом проб, а не условием `t <= maxDist` со `min`:
    // иначе граница отсечки совпадает с первой же пробой и марш обрывается на
    // первых метрах, оставляя луч без грунта ровно там, где склон пологий
    const n = Math.max(1, Math.ceil(maxDist / step));
    for (let i = 1; i <= n; i++) {
      const tc = Math.min(i * step, maxDist);
      const cur = gap(tc);
      if (prev >= 0 && cur < 0) {
        let lo = tc - step, hi = tc;
        for (let k = 0; k < 16 && hi - lo > 1e-4; k++) {
          const mid = (lo + hi) / 2;
          if (gap(mid) >= 0) lo = mid; else hi = mid;
        }
        const x = ox + dx * hi, z = oz + dz * hi;
        if (Math.abs(x) > this.half || Math.abs(z) > this.half) return null;
        // русло: грунт в его плане прорезан, и «отметка природы» там — воздух
        // над водой. Луч обязан идти дальше, к дну, стенке или настилу моста
        if (this.holes.length && this._inChannel(x, z)) { prev = cur; continue; }
        const nrm = this.relief.normalAt(x, z);
        return { x, y: this.relief.heightAt(x, z), z, nx: nrm.x, ny: nrm.y, nz: nrm.z, dist: hi };
      }
      prev = cur;
    }
    return null;
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
    const cand = this._sphereCand;
    let fromWedge = false;
    // радиус тела Чужого (`CONFIG.alien.radius` = 0,5 м) на порядок меньше
    // клетки `J.planGrid`, поэтому пояс в одну клетку берёт все прикосновения и
    // отбрасывает дальние настилы: полная перепись списков стоила 21,7 мкс на
    // главе 12 против 5,8 на главе 11 при тех же телах
    cand.length = 0;
    this._plansAround(this._prismCells, c.x, c.z, cand);
    for (const idx of cand) {
      if (pushOutWedge(c, r, this.prisms[idx])) fromWedge = true;
    }
    cand.length = 0;
    this._plansAround(this._railCells, c.x, c.z, cand);
    for (const idx of cand) {
      if (pushOutWedge(c, r, this.railWedges[idx])) fromWedge = true;
    }
    // дуги: та же логика «точное расстояние до поверхности», только сектор
    // кольцевой, поэтому планарная и вертикальная части складываются через hypot
    let fromSweep = false;
    cand.length = 0;
    this._plansAround(this._sweepCells, c.x, c.z, cand);
    for (const idx of cand) {
      const s = this.sweeps[idx];
      if (pushOutSweep(c, r, s)) fromSweep = true;
      // кромка полотна с перилами: сфера обязана остановиться о стенку, а не
      // соскользнуть за край — пояс берётся по фактической высоте края
      if (s.rails && pushOutSweepRails(c, r, s)) fromSweep = true;
    }
    return moved || fromWedge || fromSweep || this._reliefPush(c, r);
  }

  /**
   * Выталкивание тела из грунта-поля: по нормали поля на точном расстоянии до
   * него. Вертикальный зазор `c.y − h` — это `r / cos уклона`, а не `r` (то же
   * правило, что у сферы на наклонной пластине), поэтому в уклоне 0,12 тело не
   * сносит вверх по склону на сантиметр за сантиметром.
   *
   * В русле поля нет: грунт там срезан, и над дном держит призма — иначе сфера,
   * идущая по берегу вброд, всплывала бы на отметку «природы» над водой.
   */
  _reliefPush(c, r) {
    if (!this.relief || (this.holes.length && this._inChannel(c.x, c.z))) return false;
    const h = this.relief.heightAt(c.x, c.z);
    const n = this.relief.normalAt(c.x, c.z);
    const d = (c.y - h) * n.y;
    if (d >= r) return false;
    const s = r - d;
    c.x += n.x * s;
    c.y += n.y * s;
    c.z += n.z * s;
    return true;
  }

  /**
   * Свободные точки уровня: центры плит полов и кровель, пластин настилов и
   * сетки земли.
   *
   * `rect` — область (для открытого мира точки собирает каждая загруженная
   * клетка, и плита, чей центр лежит в соседней, обязана попасть в список
   * соседа, а не в оба списка сразу: узлы решётки различаются ключом, а якорь —
   * точка без ключа). Плита кровли на шве принадлежит одной клетке по центру,
   * хотя сама пересекает границу, — это точка для пула огней и монет, а не
   * объём.
   */
  _collectAnchors(rect = null) {
    const out = [];
    const inRect = (x, z) => !rect || (x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ);
    const push = (x, y, z) => { if (inRect(x, z)) out.push({ x, y, z }); };
    for (const p of this.floorPlates) {
      push((p.minX + p.maxX) / 2, p.y, (p.minZ + p.maxZ) / 2);
    }
    // опорная точка на кровле нужна пулу огней: фонарь, переставленный на верх
    // подиума, светит идущему по крыше, а не его теням внизу
    for (const p of this.roofPlates) {
      push((p.minX + p.maxX) / 2, p.y, (p.minZ + p.maxZ) / 2);
    }
    for (const d of this.deckPlates) {
      // у дуги центр габарита лежит вне полотна: опорную точку ставят по её
      // осевой линии на середине развёртки, а не по AABB
      if (d.arc) {
        const a = (d.a0 + d.span / 2) * DEG;
        push(d.cx + Math.cos(a) * d.R, (d.y0 + d.y1) / 2, d.cz + Math.sin(a) * d.R);
        continue;
      }
      if (d.ramp) continue;
      push((d.minX + d.maxX) / 2, d.topY, (d.minZ + d.maxZ) / 2);
    }
    const step = J.navStep * 2;
    // фаза той же мировой решётки, что и у `_navLattice`: `k`-й узел сетки земли
    // лежит на `-half + step/2 + k·step` и не зависит от того, какая клетка его
    // берёт, иначе две соседние клетки поставили бы якоря в двух метрах друг
    // от друга вместо шага
    const k0 = rect ? Math.ceil((rect.minX + this.half - step / 2) / step) : 0;
    const k1 = rect ? Math.floor((rect.maxX + this.half - step / 2) / step) : Math.ceil((this.width - step / 2) / step) - 1;
    const m0 = rect ? Math.ceil((rect.minZ + this.half - step / 2) / step) : 0;
    const m1 = rect ? Math.floor((rect.maxZ + this.half - step / 2) / step) : Math.ceil((this.width - step / 2) / step) - 1;
    for (let m = m0; m <= m1; m++) {
      const z = -this.half + step / 2 + m * step;
      for (let k = k0; k <= k1; k++) {
        const x = -this.half + step / 2 + k * step;
        // опорная точка над руслом не нужна ни пулу огней, ни монетам: фонарь
        // посреди воды освещал бы дно, а предмет там некуда поставить
        if (this._inBuilding(x, z) || this._inChannel(x, z)) continue;
        const y = this.groundHeightAt(x, z, this.groundY);
        if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
        out.push({ x, y, z });
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

    // метки рельефа: холм подписывается отметкой ПОСЛЕ площадок (той, что видит
    // нога), а не высотой из брифа — иначе по метке не найти расхождение поля с
    // опорой. Площадка показывает свою целевую отметку: у неё ядро ровное, и по
    // числу видно, встал ли на неё дом
    if (this.relief) {
      for (const h of this.relief.hills) {
        const x = (h.x + h.bx) / 2, z = (h.z + h.bz) / 2;
        put(`рельеф ${h.id ?? '?'} · ${h.height} м`, x, this.relief.heightAt(x, z) + 2, z);
      }
      for (const p of this.relief.pads) {
        const c = p.frame ? rotatePoint(p.frame, cx(p), cz(p)) : { x: cx(p), z: cz(p) };
        put(`площадка ${p.id ?? '?'} · ${p.y} м`, c.x, this.relief.heightAt(c.x, c.z) + 2, c.z);
      }
    }

    for (const b of this.buildings) {
      // центр мировой: у косого дома план лежит в его осях, а метка обязана
      // стоять над корпусом, который видно в кадре (дверные узлы парсер уже
      // выносит в мир, поэтому им разворот не нужен)
      const mark = (text, rect, y) => {
        const p = this._toWorld(b, cx(rect), cz(rect));
        put(text, p.x, y, p.z);
      };
      mark(b.id, b.bounds, b.roofY + 1);
      for (const r of b.rooms) mark(`${r.id} · эт ${r.floor}`, r.rect, r.y + 1.2);
      for (const s of b.stairs) mark(`${s.id} · ${s.type}`, s.rect, s.y1 + 0.7);
      for (const d of b.doors) put(`${d.id} · ${d.linkType}`, d.outside.x, d.y + d.height + 0.4, d.outside.z);
      // кровля и её парапет подписываются только у дома с секцией roof: у главы 9
      // её нет, и меток стало бы меньше ровно на столько, сколько их не было
      if (b.roof) {
        mark(`${b.id} · кровля · ${b.roof.walkable ? 'ходовая' : 'невходима'}`, b.bounds, b.roofY + 1.8);
        if (b.roof.walkable && b.roof.parapet > 0) {
          b.walls.filter(w => w.facade).forEach((w, i) => mark(`${b.id} · парапет ${i + 1}`, w, b.roofY + b.roof.parapet + 0.4));
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
      road.decks.forEach((d, i) => {
        if (d.arc) {
          // центр габарита у дуги лежит в центре кольца — метка встала бы в
          // газон; точка берётся на осевой линии посередине развёртки
          const a = (d.a0 + d.span / 2) * DEG;
          put(`${road.id} · дуга ${i + 1} · ${r3(d.span)}°`,
            d.cx + Math.cos(a) * d.R, (d.topAtMin + d.topAtMax) / 2 + 0.6, d.cz + Math.sin(a) * d.R);
          return;
        }
        put(`${road.id} · пл ${i + 1}`
          + `${d.yaw ? ` · yaw ${d.yaw}°` : ''}${d.ramp ? ' · наклон' : ''}`,
          cx(d), (d.topAtMin + d.topAtMax) / 2 + 0.6, cz(d));
      });
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

  /**
   * Решётка улиц и дворов: шаг `J.navStep`, узел там, где есть опора и габарит
   * свободен.
   *
   * `rect` — область обхода (открытый мир строит решётку по загруженным
   * клеткам, а не по плите: цена решётки ∝ площади плиты, и на 1,96 км² это
   * 54 756 проб на каждый чанк). Ключи узлов — мировые (`w:i:j`, узел `i` лежит
   * на `-half + i·step`), поэтому соседние клетки сходятся на шве одними и теми
   * же узлами и `nav.add` склеивает их по ключу, а не ставит два в одной точке.
   * Границы — `ceil` снизу и `floor` сверху: узел достаётся той клетке, внутри
   * которой лежит его точка. Когда `chunk` не кратен шагу (клетка 200 м при
   * шаге 6 м: узел 133 на x = 98 и 134 на x = 104, а шов — на x = 100), шов
   * попадает МЕЖДУ узлами, и ребро через него не создала бы ни одна из двух
   * клеток, линкуй каждая только своих. Поэтому обвязка идёт на один индекс за
   * край: чужой узел берётся по ключу, а если его ещё нет (чанк не загружен или
   * клетка отбракована пробой), ребро создаёт сосед со своей стороны — порядок
   * загрузки не важен, а `nav.link` дедуплицирует ребро при втором заходе.
   */
  _navLattice(nav, rect = null) {
    const step = J.navStep;
    const n = Math.floor(this.width / step);
    const box = rect ?? { minX: -this.half, maxX: this.half, minZ: -this.half, maxZ: this.half };
    const i0 = Math.max(0, Math.ceil((box.minX + this.half) / step));
    const i1 = Math.min(n, Math.floor((box.maxX + this.half) / step));
    const j0 = Math.max(0, Math.ceil((box.minZ + this.half) / step));
    const j1 = Math.min(n, Math.floor((box.maxZ + this.half) / step));
    if (i1 < i0 || j1 < j0) return;
    const lat = [];
    for (let j = j0; j <= j1; j++) {
      const row = new Array(i1 - i0 + 1);
      const z = -this.half + j * step;
      for (let i = i0; i <= i1; i++) {
        const x = -this.half + i * step;
        if (this._inBuilding(x, z)) continue;
        // на склоне отсчёт опоры ведётся от местности, а не от `groundY`: плита
        // тротуара на холме +14 м лежит в пределе шага от поля и обязана быть
        // принята, иначе узел встал бы на голый склон под ногами
        const fromY = this.relief ? this.relief.heightAt(x, z) : this.groundY;
        const y = this.groundHeightAt(x, z, fromY);
        if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) continue;
        row[i - i0] = nav.add(x, y, z, `w:${i}:${j}`);
      }
      lat.push(row);
    }
    for (let jj = 0; jj < lat.length; jj++) {
      for (let ii = 0; ii < lat[jj].length; ii++) {
        const id = lat[jj][ii];
        if (id === undefined) continue;
        const i = i0 + ii, j = j0 + jj;
        if (ii > 0 && lat[jj][ii - 1] !== undefined) this._linkRise(nav, id, lat[jj][ii - 1], `x${i}:${j}`);
        if (jj > 0 && lat[jj - 1][ii] !== undefined) this._linkRise(nav, id, lat[jj - 1][ii], `z${i}:${j}`);
      }
    }
    if (!rect) return;
    // Шов: внутренняя обвязка берёт только пары, чей бо́льший конец лежит
    // внутри клетки, поэтому у клетки в 200 м при шаге 6 м (шов на x = 100,
    // узлы на x = 98 и на x = 104) ребро «133 → 134» не создала бы ни одна из
    // двух сторон. Здесь тянутся четыре полосы — по одному индексу за каждый
    // край, — а чужой узел берётся по мировому ключу: если соседа ещё нет,
    // `nav.id` отдаёт `undefined`, и ребро создаст он сам со своей полосы, то
    // есть порядок загрузки клеток не важен. Ребро названо бо́льшим из концов,
    // как и внутри обвязки, поэтому обе стороны дают ОДИН ключ и ОДНО
    // направление обхода: промежуточные узлы склонного ребра склеивает
    // `nav.add`, а повторное ребро — `nav.link` (край, совпавший с узлом,
    // попадает в диапазоны обеих клеток и его внутренняя пара создаётся
    // дважды).
    const at = (i, j) => (i < i0 || i > i1 || j < j0 || j > j1)
      ? nav.id(`w:${i}:${j}`)
      : lat[j - j0][i - i0];
    for (let j = j0; j <= j1; j++) {
      this._linkSeam(nav, at(i1 + 1, j), at(i1, j), `x${i1 + 1}:${j}`);
      this._linkSeam(nav, at(i0, j), at(i0 - 1, j), `x${i0}:${j}`);
    }
    for (let i = i0; i <= i1; i++) {
      this._linkSeam(nav, at(i, j1 + 1), at(i, j1), `z${i}:${j1 + 1}`);
      this._linkSeam(nav, at(i, j0), at(i, j0 - 1), `z${i}:${j0}`);
    }
  }

  /** Ребро шва между двумя узлами — только если оба уже стоят в графе. */
  _linkSeam(nav, a, b, tag) {
    if (a === undefined || b === undefined) return;
    this._linkRise(nav, a, b, tag);
  }


  /**
   * Ребро решётки через склон: перепад соседних узлов обязан остаться в шаге
   * ноги, иначе `_link` его бракует, и на уклоне круче `stepUp / navStep`
   * (0,6 м на 6 м = 0,1 м/м, а рельеф главы держит до 0,12) решётка рассыпается
   * на изолированные полки — `_pruneToSpawn` срезает весь склон, и враг не
   * доходит между ярусами города.
   *
   * Поэтому вдоль такого ребра вставляются промежуточные узлы (тот же приём, что
   * держит наклонные настилы и марши), а ставится узел только там, где опора есть
   * и габарит свободен: середина ребра может лечь в план дома или за край откоса,
   * и тогда цепочка обрывается, а не ведёт врага сквозь стену.
   */
  _linkRise(nav, a, b, tag) {
    const pa = nav.pos[a], pb = nav.pos[b];
    if (!this.relief || Math.abs(pa.y - pb.y) <= this.stepUp) {
      this._link(nav, a, b);
      return;
    }
    const keep = this.stepUp * 0.8;
    const k = Math.max(2, Math.ceil(Math.abs(pa.y - pb.y) / keep));
    let prev = a;
    for (let s = 1; s < k; s++) {
      const t = s / k;
      const x = pa.x + (pb.x - pa.x) * t;
      const z = pa.z + (pb.z - pa.z) * t;
      if (this._inBuilding(x, z)) return;
      const fromY = this.relief.heightAt(x, z);
      const y = this.groundHeightAt(x, z, fromY);
      if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) return;
      const id = nav.add(x, y, z, `ws:${tag}:${s}`);
      if (!this._linkOk(nav, prev, id)) return;
      prev = id;
    }
    this._linkOk(nav, prev, b);
  }

  /**
   * Ребро между двумя узлами, если оно проходит проверки (см. `_link` и
   * `SurfaceField.edgeOk` — та же проба валидирует и длинные рёбра скелета у
   * парсера).
   */
  _linkOk(nav, a, b) {
    if (!this.edgeOk(nav.pos[a], nav.pos[b])) return false;
    nav.link(a, b);
    return true;
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
        // клетка считается в осях дома (решётка прямоугольна именно в них, и план
        // марша прямоуголен тоже), а в граф и в пробы тела идёт мировая точка
        const p = this._toWorld(b, x, z);
        // клетка над проёмом перекрытия (шахта марша) опоры этой комнаты не имеет
        const y = this._floorSupport(p.x, p.z, room.y);
        if (y === null) continue;
        if (this.isBlocked(p.x, p.z, CONFIG.radius, room.y, CONFIG.eyeHeight)) continue;
        const id = nav.add(p.x, y, p.z, `r:${room.id}:${Math.round(x * 100)}:${Math.round(z * 100)}`);
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

  /**
   * Есть ли у посадки сосед — пол этажа, а не ступень своего марша. Число
   * соседей для этого слишком грубый признак: `_linkClosest` охотно берёт
   * предпоследнюю проступь, «всего два ребра» становится «оба на лестнице», и
   * `adj.length <= 1` не замечает, что решётка комнаты к посадке не приросла.
   * Узел того же уровня, что и посадка, стоит на полу, если его точка не в
   * плане марша: клетки решётки над шахтой бракует `_inStair`, поэтому за
   * габаритом лестницы на этой отметке остаётся только пол.
   */
  _landingHasFloor(nav, b, land, floor, level) {
    for (const i of nav.adj[land]) {
      const p = nav.pos[i];
      if (Math.abs(p.y - level) > J.floorRise + 0.02) continue;
      const l = this._toLocal(b, p.x, p.z);
      if (this._inStair(b, l.x, l.z, floor)) continue;
      return true;
    }
    return false;
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
            // решётка кровли — по осям дома: плита и парапет прямоугольны в них,
            // а узел графа обязан стоять там, где его держит мировая опора
            const p = this._toWorld(b, x, z);
            const y = this._floorSupport(p.x, p.z, b.roofY);
            if (y === null) continue;
            if (this.isBlocked(p.x, p.z, CONFIG.radius, b.roofY, CONFIG.eyeHeight)) continue;
            row[i] = nav.add(p.x, y, p.z, `k:${b.id}:${i}:${j}`);
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
          const w = this._toWorld(b, (st.minX + st.maxX) / 2, (st.minZ + st.maxZ) / 2);
          const id = nav.add(w.x, st.top, w.z, `s:${s.id}:${k}`);
          if (prev !== undefined) this._link(nav, prev, id);
          prev = id;
          ids.push(id);
        });
        if (!ids.length) continue;
        const bottom = this._landing(nav, b, s, -1);
        const top = this._landing(nav, b, s, 1);
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
          if (!(isTop && roofTop)) {
            const landFloor = isTop ? s.connectsFloors[1] : s.connectsFloors[0];
            const landLevel = isTop ? s.y1 : s.y0;
            if (!this._landingHasFloor(nav, b, land, landFloor, landLevel)) {
              this._refineFloor(nav, b, landFloor, land, rstep);
            }
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
  _landing(nav, b, s, sign) {
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
      // направление — локальное: марш и его проступи прямоугольны в осях дома, а
      // «есть ли здесь пол и свободно ли тело» спрашивает мир
      const x = ax ? (ax > 0 ? s.rect.maxX : s.rect.minX) + ax * pad : tread.x;
      const z = az ? (az > 0 ? s.rect.maxZ : s.rect.minZ) + az * pad : tread.z;
      const p = this._toWorld(b, x, z);
      const y = this._floorSupport(p.x, p.z, level);
      if (y === null) continue;
      if (this.isBlocked(p.x, p.z, CONFIG.radius, level, CONFIG.eyeHeight)) continue;
      // посадка обязана не просто найтись: от неё нога дотягивается до своей
      // проступи. У винта первая ступень стоит на дуге, и ближайшее направление
      // по большей из осей даёт точку в полутора метрах от неё через весь проём
      // перекрытия — `_edgeSupported` такое ребро бракует, и весь верх дома
      // отрезает `_pruneToSpawn`
      const w = this._toWorld(b, tread.x, tread.z);
      if (!this._edgeSupported({ x: p.x, y, z: p.z }, { x: w.x, y: tread.y, z: w.z })) continue;
      const id = nav.add(p.x, y, p.z, `p:${s.id}:${sign > 0 ? 't' : 'b'}`);
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
    // центр шахты — в мир: посадка уже мировая точка, и направление цепочки
    // обязана соединять две мировые, а не локальную с мировой
    const c = this._toWorld(b, (s.rect.minX + s.rect.maxX) / 2, (s.rect.minZ + s.rect.maxZ) / 2);
    const len = Math.hypot(from.x - c.x, from.z - c.z);
    if (len < 1e-6) return;
    const dx = (from.x - c.x) / len;
    const dz = (from.z - c.z) / len;
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
  /**
   * Цепочки настилов не-наземных дорог: узлы по оси полотна (`SurfaceField
   * .deckChain` — тот же обход берёт и скелет парсера), связи внутри цепочки и
   * между элементами дороги, а концы выходят на решётку земли.
   */
  _navDecks(nav) {
    const step = J.navStep;
    for (const road of this.roads) {
      if (road.type === 'ground') continue;
      let prevEnd, firstEnd;
      for (const [di, d] of road.decks.entries()) {
        const chain = this.deckChain(d, step);
        let first, last;
        for (let k = 0; k < chain.length; k++) {
          const p = chain[k];
          const id = nav.add(p.x, p.y, p.z, `d:${road.id}:${di}:${k}`);
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
   * Сход в русло и берег-склон: цепочка узлов вдоль уклона (`SurfaceField
   * .descentChain` — тот же подбор шага, что у наклонных настилов дорог).
   * Решётка земли их не связывает: шаг решётки 6 м при предельном уклоне 0,3
   * даёт перепад 1,8 м, а `_link` берёт только перешагиваемый, и дно осталось бы
   * недостижимым, хотя нога по склону идёт.
   *
   * Концы цепочки связывает `_linkClosest`: низ — с решёткой дна (перепад
   * нулевой, ребро обычное), верх — с решёткой берега. Там, где `wade: false`,
   * рёбра отбраковывает блокер дна, и русло остаётся сухой границей между
   * берегами.
   */
  _navWater(nav) {
    const step = J.navStep;
    for (const d of this.descents) {
      const chain = this.descentChain(d, step);
      if (!chain) continue;
      let first, prev;
      for (let k = 0; k < chain.length; k++) {
        const p = chain[k];
        const id = nav.add(p.x, p.y, p.z, `f:${d.id}:${k}`);
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

  /** Ребро между двумя узлами: перепад в один шаг, габарит свободен, опора держит. */
  _link(nav, a, b) {
    this._linkOk(nav, a, b);
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
    return this.nav.randomPoint(x, z, radius, this.navFit);
  }

  /** Маршрут по узлам графа (поиск в ширину). null — пути нет. */
  findPath(from, to) {
    return this.nav.findPath(from, to, this.navFit);
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
   *
   * С рельефом та же сетка прямоугольников, но вершины берут отметку поля, а
   * нормали — его аналитический градиент (`normalAt`), а не
   * `computeVertexNormals`: у совпадающих вершин двух пластин, нарезанных от
   * разных прямоугольников русла, общий нормальный вектор один и тот же, поэтому
   * на стыке не появляется световой шов, а картинка остаётся той же поверхностью,
   * по которой ходит нога и которую видит луч.
   *
   * `rect` — область плиты (открытый мир режет грунт по клеткам). Сетка
   * нарезки обязана быть кратна шагу: при `stream.chunk`, кратном
   * `J.relief.meshCell`, границы клеток попадают на те же вершины мировой
   * нарезки, и на шве не остаётся T-стыка — иначе соседние клетки сошлись бы
   * разными отсчётами поля и граница читалась световой полосой.
   */
  _groundGeo(rect = null) {
    let rects = [rect ?? { minX: -this.half, maxX: this.half, minZ: -this.half, maxZ: this.half }];
    for (const h of this.holes) rects = rects.flatMap(r => subtractRect(r, h));
    if (!this.relief) {
      return mergeGeometries(rects.map(r => new THREE.PlaneGeometry(
        r.maxX - r.minX, r.maxZ - r.minZ,
      ).translate((r.minX + r.maxX) / 2, -(r.minZ + r.maxZ) / 2, 0)), false);
    }
    const cell = J.relief.meshCell;
    return mergeGeometries(rects.map(r => {
      const g = new THREE.PlaneGeometry(
        r.maxX - r.minX, r.maxZ - r.minZ,
        Math.max(1, Math.round((r.maxX - r.minX) / cell)),
        Math.max(1, Math.round((r.maxZ - r.minZ) / cell)),
      ).translate((r.minX + r.maxX) / 2, -(r.minZ + r.maxZ) / 2, 0);
      const pos = g.attributes.position;
      const nrm = g.attributes.normal;
      for (let k = 0; k < pos.count; k++) {
        const x = pos.getX(k), z = -pos.getY(k);
        // позиция задаётся относительно `ground.position.y = groundY`
        pos.setZ(k, this.relief.heightAt(x, z) - this.groundY);
        const n = this.relief.normalAt(x, z);
        nrm.setXYZ(k, n.x, -n.z, n.y);
      }
      return g;
    }), false);
  }

  /**
   * Вода: один меш полупрозрачных пластин на отметках `surfaceY`. Коллизий у него
   * нет ни для луча, ни для тела — решение о том, где русло проходимо вброд,
   * принимает геометрия дна и блокер, а не картинка.
   *
   * `rects` — зеркала одной области: у клетки их отдаёт проход картинки, потому
   * что мировое поле содержит и чужие копии русел, а пластина воды на шве
   * обязана быть одна.
   */
  _buildWater(scene, rects, objs) {
    if (!rects.length) return;
    const geo = mergeGeometries(rects.map(r => new THREE.PlaneGeometry(
      r.maxX - r.minX, r.maxZ - r.minZ,
    ).translate((r.minX + r.maxX) / 2, -(r.minZ + r.maxZ) / 2, r.y)), false);
    const water = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
      color: J.waterColor, roughness: 0.3, metalness: 0.1,
      transparent: true, opacity: J.waterOpacity,
    }));
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
    objs.push(water);
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
      if (!this._drawn(b)) continue;
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
            const q = this._quadToWorld(b, face.axis === 'x' ? p : line, face.axis === 'x' ? line : p, face.c, face.s);
            put(lit ? W.litColors[Math.min(W.litColors.length - 1, Math.floor(r / cfg.lit * W.litColors.length))]
              : W.darkColor, {
              x: q.x,
              y: cy,
              z: q.z,
              c: q.c, s: q.s, w: cfg.width, h,
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
      if (!this._drawn(b)) continue;
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
          // квад живёт в осях дома, а экземпляр — в мире: тот же поворот, что у окна
          const q = this._quadToWorld(b, face.axis === 'x' ? p : line,
            face.axis === 'x' ? line : p, face.c, face.s);
          put(cfg.colors[Math.min(cfg.colors.length - 1, Math.floor(draw() * cfg.colors.length))], {
            x: q.x,
            y: cy,
            z: q.z,
            c: q.c, s: q.s, w: width, h,
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
      // проба индекса — мировая: клетка `_buildingCells` раскладывает планы по
      // габаритам повёрнутых корпусов
      const probe = this._toWorld(b, x, z);
      for (const idx of this._planAt(this._buildingCells, probe.x, probe.z)) {
        if (seen.has(idx)) continue;
        seen.add(idx);
        const o = this.buildings[idx];
        if (o === b || o.baseY >= b.roofY - 0.01 || o.roofY <= b.baseY + 0.01) continue;
        // планы соседа — в осях этого дома: полоса и `line` локальные, а индекс
        // `_buildingCells` расложен по мировым габаритам
        for (const r of this._rectsIn(o, b)) {
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

  /** Есть ли план дома в точке его локальных осей (граница плана не считается). */
  _rectsHold(b, x, z) {
    for (const r of b.rects) {
      if (x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ) return true;
    }
    return false;
  }

  /** Тот же тест для мировой точки: планы частей лежат в осях дома, поэтому разворот. */
  _rectsHoldAt(b, x, z) {
    const l = this._toLocal(b, x, z);
    return this._rectsHold(b, l.x, l.z);
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
    const add = (model, x, y, z, draw, yaw = 0) => {
      const s = size(draw());
      items.push({
        model,
        source: 'generated',
        // косой дом поворачивает и свой мусор: сетка слотов лежит в его осях,
        // и бак, провёрнутый на 90° относительно кровли, торчал бы по сторонам
        // света. `rotationY` — угол `Object3D.rotation.y`, а `rotateY(θ)` крутит план
        // на −θ по нашему соглашению, поэтому знак здесь обратный: картинка пропов
        // обязана совпасть с поворотом стен
        rotationY: r3(-yaw + Math.floor(draw() * 4) * 90),
        position: { x, y, z },
        scale: { x: s, y: s, z: s },
      });
    };

    for (const b of this.buildings) {
      if (!this._drawn(b)) continue;
      if (!b.floorsCount) continue;
      const frame = this._frame(b);
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
            // слот — в осях дома, а «накрыт ли он» и «есть ли над ним воздух»
            // решает мир: чужой объём и луч живут в мировых координатах
            const p = this._toWorld(b, x, z);
            if (this._roofCovered(b, p.x, p.z)) continue;
            // шахта марши-люка — проём во всю плиту: предмет над ней повис бы в
            // воздухе (опора отвечает на подъём ниже плиты) и закрыл единственный
            // спуск с кровли
            if (this._inStair(b, x, z, b.floorsCount)) continue;
            if (!clearAbove(p.x, b.roofY, p.z)) continue;
            add(pick(draw(), models), r3(p.x), b.roofY, r3(p.z), draw, frame?.deg ?? 0);
            n++;
          }
        }
      }
    }

    for (const road of this.roads) {
      if (!this._drawn(road)) continue;
      // по настилам мостов и переходов мусора нет: там не тротуар, а единственный
      // проход — контейнер посреди пролёта выглядел бы стеной, которой нет
      if (road.type !== 'ground') continue;
      for (const d of road.decks) {
        // у дуги нет оси: слоты вдоль неё ставятся по tangent-рамке, а по AABB
        // предмет попал бы в газон под кольцом, а не на асфальт
        if (d.arc) continue;
        // у косой улицы слоты лежат в осях полотна, а мир получается поворотом:
        // предмет, поставленный по габариту, оказался бы на встречной полосе
        const frame = this._deckFrame(d);
        const alongX = d.axis === 'x';
        const lo = frame ? d.cx - d.length / 2 : (alongX ? d.minX : d.minZ);
        const hi = frame ? d.cx + d.length / 2 : (alongX ? d.maxX : d.maxZ);
        const len = hi - lo;
        if (len < C.street.every) continue;
        const hs = fnvStr(2166136261, `${road.id}|${Math.round(lo * 10)}|${Math.round(hi * 10)}`);
        let k = 0;
        for (let u = lo + C.street.every / 2; u <= hi - C.street.every / 2; u += C.street.every, k++) {
          for (const side of [-1, 1]) {
            const draw = makeDraw(fnvMix(hs, (k * 2 + side + 2) * 7919));
            if (draw() >= C.street.keep) continue;
            const cross = frame
              ? d.cz + side * (d.width / 2 - C.street.inset)
              : (side < 0 ? (alongX ? d.minZ : d.minX) : (alongX ? d.maxZ : d.maxX)) - side * C.street.inset;
            const p = frame ? rotatePoint(frame, u, cross) : {
              x: alongX ? u : cross,
              z: alongX ? cross : u,
            };
            const x = p.x, z = p.z;
            if (this._planHolds(x, z)) continue;
            if (nearProp(x, z, C.street.minLamp)) continue;
            const top = d.ramp
              ? d.topAtMin + (d.topAtMax - d.topAtMin) * (u - lo) / (hi - lo)
              : d.topY;
            const g = this.groundHeightAt(x, z, r3(top) + 0.4);
            if (Math.abs(g - top) > 0.25) continue;
            if (!clearAbove(x, g, z)) continue;
            add(pick(draw(), C.streetModels), r3(x), g, r3(z), draw, d.yaw ?? 0);
          }
        }
      }
    }
    return items;
  }

  /**
   * Через эту мировую точку кровли проходит чужой объём: надстройка лота или
   * соседний дом.
   */
  _roofCovered(b, x, z) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      const o = this.buildings[idx];
      if (o === b || !this._rectsHoldAt(o, x, z)) continue;
      if (o.baseY < b.roofY + 0.05 && o.roofY > b.roofY + 0.05) return true;
    }
    return false;
  }

  /** Есть ли план любого дома в мировой точке (уличному предмету там не место). */
  _planHolds(x, z) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      if (this._rectsHoldAt(this.buildings[idx], x, z)) return true;
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

  /**
   * Светящиеся окна фасадов: вывод и меши — у `_windowItems` и `_buildQuads`.
   *
   * `objs` — список созданного: у клетки открытого мира он свой, и выгрузка
   * обязана снять со сцены квады одной клетки, не трогая остальные.
   *
   * @returns {number} число экземпляров
   */
  _buildWindows(scene, objs) {
    return this.winCfg ? this._buildQuads(scene, this._windowItems(), 'windows', objs) : 0;
  }

  /** Неон и билборды: те же квады, другая палитра и вынос за грань. */
  _buildSignage(scene, objs) {
    return this.signCfg ? this._buildQuads(scene, this._signageItems(), 'signage', objs) : 0;
  }

  /**
   * Меши квадов: по одному `InstancedMesh` на цвет палитры, а не на окно, и общая
   * геометрия. Материал — `MeshBasicMaterial`: кваду не нужен свет сцены, он и
   * есть свет, поэтому горящее окно и неон читаются ровно своим цветом независимо
   * от пула огней и остаются видимыми сквозь туман района.
   *
   * Матрица экземпляра пишется в буфер руками: окна задают поворот косинусом с
   * синусом напрямую, и на 32 тыс. окон `Matrix4.compose` с кватернионом стоил
   * больше, чем вся выводимая позиция. Запись годится и для косого дома (v2) —
   * угол в ней любой, а не только кратный 90°.
   *
   * @param {'windows'|'signage'} kind — чтобы `dispose()` и тесты отличали один
   *   выводимый ряд от другого: материалы у них одинаковые по классу.
   * @returns {number} число экземпляров
   */
  _buildQuads(scene, groups, kind, objs) {
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
      objs.push(mesh);
      count += items.length;
    }
    return count;
  }

  build(scene) {
    const pic = this._buildPicture(scene, this.geo, null, this.waterRects);
    this.sceneObjects = pic.objs;
    this.realLights = pic.lights;
    this.windowCount = pic.windows;
    this.signageCount = pic.signage;
    this.clutterCount = pic.clutter;
  }

  /**
   * Картинка одной области: грунт, вода, группы геометрии, пропы и три
   * выводимых ряда. Хозяина у неё два — `build()` на весь мир и `WorldMap` на
   * одну клетку, — поэтому всё созданное возвращается списком: выгрузка клетки
   * обязана снять со сцены и отдать буферы только свои, а не весь уровень.
   *
   * `groups` — геометрия области (`this.geo` у главы, группы прохода картинки у
   * клетки); `rect` — её плита грунта (`null` = вся плита мира); `water` —
   * зеркала воды этой области.
   *
   * Выводимые ряды берутся с отбором владельца (`_drawn`), поэтому там, где мир
   * собран из клеток, метод зовётся через `_drawOwnersOnly`: дом на шве лежит в
   * данных обеих клеток, а нарисован обязан быть в одной. Сами ряды при этом
   * пробуют твёрдость по **мировому** полю, поэтому их нельзя считать внутри
   * `collectPass`, где входы подменены списком одной клетки.
   *
   * @returns {{objs: object[], lights: object[], windows: number, signage: number, clutter: number}}
   */
  _buildPicture(scene, groups, rect, water) {
    const objs = [];
    const ground = new THREE.Mesh(
      (rect || this.holes.length || this.relief)
        ? this._groundGeo(rect)
        : new THREE.PlaneGeometry(this.width, this.depth),
      new THREE.MeshStandardMaterial({ color: this.groundColor, roughness: 1, metalness: 0 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = this.groundY;
    ground.receiveShadow = true;
    scene.add(ground);
    objs.push(ground);
    this._buildWater(scene, water, objs);

    const mats = {
      walls: new THREE.MeshStandardMaterial({ color: J.walls, roughness: 0.85, metalness: 0.05 }),
      slabs: new THREE.MeshStandardMaterial({ color: J.slabs, roughness: 0.9, metalness: 0.05 }),
      stairs: new THREE.MeshStandardMaterial({ color: J.stairs, roughness: 0.9, metalness: 0.05 }),
      decks: new THREE.MeshStandardMaterial({ color: J.asphalt, roughness: 0.95, metalness: 0 }),
      earth: new THREE.MeshStandardMaterial({ color: J.earth, roughness: 1, metalness: 0 }),
      rails: new THREE.MeshStandardMaterial({ color: J.railColor, roughness: 0.55, metalness: 0.5 }),
    };
    for (const key of Object.keys(groups)) {
      const geos = groups[key];
      if (!geos.length) continue;
      const mesh = new THREE.Mesh(mergeGeometries(geos, false), mats[key]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      objs.push(mesh);
    }

    const clutter = this._clutterItems();
    for (const mesh of buildProps(scene, this._drawable(this.props).concat(clutter))) {
      // материалы пропов общие на модуль (src/props.js) и переживают загрузку
      // следующей главы — dispose() обязан снимать геометрию, но не их
      mesh.userData.sharedMaterial = true;
      objs.push(mesh);
    }
    const windows = this._buildWindows(scene, objs);
    const signage = this._buildSignage(scene, objs);
    const lights = this._buildLights(scene, objs);
    return { objs, lights, windows, signage, clutter: clutter.length };
  }

  /**
   * Снимает со сцены объекты одной области и отдаёт её буферы: меши с их
   * геометрией и материалами, настоящие источники вместе с их `target`. Сцена
   * главы пересоздаётся на каждой загрузке (AGENTS.md о жизненном цикле), а на
   * районе 600 м одна утечка — десятки мегабайт буферов, которые больше никто
   * не держит.
   */
  _release(objs, lights) {
    for (const o of objs ?? []) {
      o.parent?.remove(o);
      o.geometry?.dispose?.();
      // материалы пропов (src/props.js) модульные и переиспользуются следующей
      // главой — их не убираем; всё, что создал `build` для себя, — свои
      if (o.material && !o.userData.sharedMaterial) {
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose?.());
      }
    }
    for (const l of lights ?? []) {
      l.parent?.remove(l);
      l.target?.parent?.remove(l.target);
    }
  }

  /**
   * Отдача всего, что поставил `build`.
   */
  dispose() {
    this._release(this.sceneObjects, this.realLights);
    this.sceneObjects = [];
    this.realLights = [];
  }

  /**
   * Настоящие источники из данных главы: point и spot (directional парсер
   * превращает в «луну» неба). Тени у них выключены — тень держит одна
   * направленная, как на всех ночных главах.
   *
   * Отбор владельца обязателен и здесь: фонарь на шве лежит в двух клетках, а
   * `light` в сцене — не картинка, а лимит: удвоенный пул отнял бы половину
   * числа источников у соседних улиц, ничего им не добавив.
   *
   * @returns {object[]} источники — их `dispose()` обязан снять и `target`
   */
  _buildLights(scene, objs) {
    const lights = [];
    const bulbs = [];
    for (const l of this._drawable(this.lightSpecs)) {
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
      lights.push(light);

      const bulb = new THREE.SphereGeometry(0.35, 8, 6).translate(
        l.position.x, l.position.y, l.position.z);
      bulbs.push(bulb);
    }
    if (bulbs.length) {
      const mesh = new THREE.Mesh(mergeGeometries(bulbs, false), new THREE.MeshBasicMaterial({
        color: 0xffe6c0,
      }));
      scene.add(mesh);
      objs.push(mesh);
    }
    return lights;
  }

  // ------------------------------------------------------------------ миникарта

  /**
   * Окно, которым карта рисует план миникарты: `{cx, cz, range}` — центр и
   * полуразмер в метрах.
   *
   * Дефолт — **локальное** окно `J.minimapRange` вокруг игрока: при стороне 600 м
   * весь план в 336 px даёт 0,52…1,79 м/пиксель, и стена 0,35 м исчезает меньше
   * пикселя. Из-за этого план и метки HUD живут в разных системах: метки идут
   * через `worldToNormalized` (нормировка по плите, `viewHalf`), а план — по
   * окну, и при `viewHalf / range = 324 / 130` расходятся в 2,49 раза (замер
   * главы 12: свой же игрок — 168 px планом против 173…178 px меткой).
   * Стримящая карта это переопределяет (§ 4.4 плана открытого мира), обычные
   * главы правку не платят.
   */
  _minimapView(playerPos) {
    return {
      cx: playerPos ? playerPos.x : this.spawn.x,
      cz: playerPos ? playerPos.z : this.spawn.z,
      range: Math.min(J.minimapRange, Math.max(this.width, this.depth) / 2),
    };
  }

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

    const { cx, cz, range } = this._minimapView(playerPos);
    const k = size / (2 * range);
    const toPx = (wx, wz) => [(wx - cx + range) * k, (wz - cz + range) * k];
    const rectPx = r => {
      const [x0, z0] = toPx(r.minX, r.minZ);
      const [x1, z1] = toPx(r.maxX, r.maxZ);
      if (x1 < 0 || z1 < 0 || x0 > size || z0 > size) return null;
      return [x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1)];
    };
    const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    const fill = (list, pick) => {
      for (const it of list) {
        const p = pick ? pick(it) : true;
        if (!p) continue;
        const px = rectPx(it);
        if (!px) continue;
        if (!it.obb) { ctx.fillRect(...px); continue; }
        // косая плита — четырёхугольник по своим осям, а не его габарит: квадрат
        // за углами повёрнутого дома рисовал бы стену там, где её нет, и прятал
        // проём, через который человек как раз идёт
        const o = it.obb;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const [lx, lz] = corners[i];
          const [x, z] = toPx(o.cx + lx * o.hx * o.c - lz * o.hz * o.s,
            o.cz + lx * o.hx * o.s + lz * o.hz * o.c);
          if (i) ctx.lineTo(x, z); else ctx.moveTo(x, z);
        }
        ctx.closePath();
        ctx.fill();
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
    fill(this.deckPlates, d => !d.ramp && !d.arc && Math.abs(d.topY - y) <= 1);
    // дуга — кольцевой сектор по своим углам и радиусам, а не габарит: квадрат
    // вокруг развязки закрыл бы двор под ней и не показал бы, куда ведёт съезд
    for (const s of this.sweeps) {
      if (y < s.topAtMin - 1 || y > s.topAtMax + 1) continue;
      const [px, pz] = toPx(s.cx, s.cz);
      const ro = (s.R + s.halfW) * k, ri = (s.R - s.halfW) * k;
      if (px + ro < 0 || pz + ro < 0 || px - ro > size || pz - ro > size) continue;
      ctx.beginPath();
      ctx.arc(px, pz, ro, s.a0r, s.a0r + s.spanr, s.spanr < 0);
      ctx.arc(px, pz, ri, s.a0r + s.spanr, s.a0r, s.spanr >= 0);
      ctx.closePath();
      ctx.fill();
    }
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
