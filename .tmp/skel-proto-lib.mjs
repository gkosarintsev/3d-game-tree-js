// Прототип скелета (этап 2) — временный файл, в репозиторий не едет.
// Методы скопированы из src/json-map.js дословно, чтобы measuring showed the
// connectivity of the SAME arithmetic before the shared move.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { SurfaceField } from '../src/surfaces.js';
import { NavGraph } from '../src/nav-graph.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { rotatePoint, unrotatePoint, obbOf, r3, arcBankAt, subtractRect, frameOf, frameAt, obbHitsRect, rotatedBounds, arcDelta } from '../src/geo2d.js';
import { makePrism } from '../src/surfaces.js';

export const STEP = Number(process.env.SK_STEP ?? 24);
export const END_REACH = Number(process.env.SK_REACH ?? STEP * 1.8);
export const END_COUNT = Number(process.env.SK_COUNT ?? 2);
const J = { ...CONFIG.jsonMap, navStep: STEP };
const DEG = Math.PI / 180;

export class Proto extends SurfaceField {
  /** Кадр поворота дома; null — дом стоит по осям мира (все главы v1). */
  _frame(b) {
    return this._frames.get(b) ?? null;
  }

  /** Точка локальных осей дома → мир; при угле 0 — ровно те же числа. */
  _toWorld(b, x, z) {
    const f = this._frame(b);
    return f ? rotatePoint(f, x, z) : { x, z };
  }

  /** Мир → локальные оси дома: только в них его стены, комнаты и марши прямоугольны. */
  _toLocal(b, x, z) {
    const f = this._frame(b);
    return f ? unrotatePoint(f, x, z) : { x, z };
  }

  /**
   * Чужой прямоугольник в осях этого дома. У соосной пары (одинаковый `rotation`
   * — единственно разрешённое валидатором пересечение планов) четыре угла
   * переходят в тот же прямоугольник, сдвинутый на разность центров, поэтому
   * прорезание кровли и отсев «окно внутри соседа» остаются точными. У разных
   * углов план в локальных осях уже не прямоугольник и берётся его охват: такой
   * случай валидатор бракует как пересечение, и здесь он может лишь чуть
   * осторожнее убрать окна у стоящего рядом косого дома.
   */
  _rectIn(o, rect, b) {
    if (!this._frame(o) && !this._frame(b)) return rect;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const [px, pz] of [[rect.minX, rect.minZ], [rect.maxX, rect.minZ],
      [rect.maxX, rect.maxZ], [rect.minX, rect.maxZ]]) {
      const w = this._toWorld(o, px, pz);
      const l = this._toLocal(b, w.x, w.z);
      if (l.x < minX) minX = l.x;
      if (l.x > maxX) maxX = l.x;
      if (l.z < minZ) minZ = l.z;
      if (l.z > maxZ) maxZ = l.z;
    }
    return { minX, maxX, minZ, maxZ };
  }

  /** Все планы чужого дома в осях этого (см. `_rectIn`). */
  _rectsIn(o, b) {
    return o.rects.map(r => this._rectIn(o, r, b));
  }

  /**
   * Квад фасада (`_windowItems`, `_signageItems`) из осей дома в мир: центр —
   * поворотом, а угол поворота самого квада сдвигается на угол корпуса, поэтому
   * окно лежит ровно в своей грани и смотрит наружу при любом угле корпуса. Без
   * угла возвращается та же четвёрка чисел, что и пришла.
   */
  _quadToWorld(b, x, z, c, s) {
    const f = this._frame(b);
    if (!f) return { x, z, c, s };
    const p = rotatePoint(f, x, z);
    // (c, s) — не мировой вектор, а косинус с синусом угла поворота квада: его
    // нормаль есть (s, 0, c), ширина — (c, 0, −s). Поворот корпуса на rad поэтому
    // сдвигает сам угол на −rad, а не вращает пару как стрелку; перепутать знак
    // здесь значило бы поставить окно тылом к стене
    return { x: p.x, z: p.z, c: c * f.c + s * f.s, s: s * f.c - c * f.s };
  }

  /**
   * План дома → мировая запись для списков плит и маршей: габарит повёрнутого
   * прямоугольника плюс `obb`. Угла нет — тот же объект, что и раньше, поэтому
   * миникарта и `_collectAnchors` для глав 9–10 видят ровно прежние числа.
   */
  _worldRect(b, rect) {
    const f = this._frame(b);
    return f ? obbOf(rect, f) : rect;
  }
  /** Общее пересечение двух прямоугольников в плане; null — не пересекаются. */
  _clip(a, b) {
    const minX = Math.max(a.minX, b.minX), maxX = Math.min(a.maxX, b.maxX);
    const minZ = Math.max(a.minZ, b.minZ), maxZ = Math.min(a.maxZ, b.maxZ);
    return maxX - minX > 1e-6 && maxZ - minZ > 1e-6 ? { minX, maxX, minZ, maxZ } : null;
  }

  _collectBuildings() {
    for (const b of this.buildings) {
      const frame = this._frame(b);
      for (const w of b.walls) this._wall(w, b, frame);
      for (const r of b.rooms) this._floorPlate(b, r, frame);
      this._stair(b, frame);
      this._roof(b, frame);
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
   * перехода, в парапете остаётся проём, иначе переход упирался бы в ограждение.
   */
  _roof(b, frame) {
    const walk = b.roof?.walkable === true;
    // настил, чей верх совпал с отметкой кровли (допуск схемы): ему расступаются
    // и плита, и парапет. Берём до `pierce`, пока `walk` не проверено, — у
    // невходимой кровли настил всё равно не должен ложиться на её плиту.
    // У повёрнутого дома примыкающих настилов нет вовсе — такую стыковку бракует
    // валидатор: вырезать плиту мировой пластиной настила в локальных осях косой
    // кровли можно только по габариту этой пластины, а это дыра в парапете там,
    // где перехода нет, то есть сход с крыши в никуда
    const arrivals = frame ? [] : this.roads.filter(r => r.type !== 'ground').flatMap(r => r.decks).filter(d =>
      !d.yaw && !d.arc && d.frame === undefined
      && (Math.abs(d.topAtMin - b.roofY) <= J.skybridgeFit || Math.abs(d.topAtMax - b.roofY) <= J.skybridgeFit));
    // чужое здание, выросшее из этой плиты (подиум + башня), марш, выведенный
    // на кровлю, и план примыкающего настила оставляют в ней проём: иначе плита
    // легла бы внутрь первого этажа соседа, а решётка узлов встала бы под ним, и
    // там, где настил идёт поверх плиты, остались бы со-плоскостные верха
    const pierce = [
      ...b.stairs.filter(s => s.connectsFloors[1] === b.floorsCount).map(s => s.rect),
      ...this.buildings.filter(o => o !== b && o.baseY > b.roofY - 0.5 && o.baseY < b.roofY + 1)
        .map(o => this._rectIn(o, o.bounds, b)),
      ...arrivals,
    ];
    for (const rect of b.rects) {
      const pieces = pierce.reduce((list, hole) => list.flatMap(p => subtractRect(p, hole)), [rect]);
      for (const p of pieces) {
        this._box(p, b.roofY - J.slabThickness, b.roofY, 'slabs', { surface: walk, frame });
        if (walk) this.roofPlates.push({ ...this._worldRect(b, p), y: b.roofY, building: b.id });
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
      for (const p of pieces) {
        this._box(p, b.roofY, r3(b.roofY + b.roof.parapet), 'walls', { collide: true, frame });
      }
    }
  }

  /**
   * Стена полосы: для каждого этажа, чья комната граничит с ней, свой отрезок
   * высоты, а план режется на участки только там, где эта граница есть. Иначе
   * на этаже со свободным пространством выросла бы невидимая перегородка.
   */
  _wall(w, b, frame) {
    const plan = { minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ };
    if (!b.rooms.length) {
      this._wallBand({ ...plan, y0: b.baseY, y1: b.roofY }, b.doors, b.roofY - J.roofSeam, frame);
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
        this._wallBand({ ...plan, ...band, y0: Number(y), y1 }, b.doors, seam, frame);
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
  _wallBand(band, doors, geoTop = null, frame = null) {
    const inBand = doors.filter(d =>
      d.y >= band.y0 - 0.01 && d.y < band.y1 - 0.01 && this._clip(band, d.rect));
    let pieces = [{ minX: band.minX, maxX: band.maxX, minZ: band.minZ, maxZ: band.maxZ }];
    for (const d of inBand) {
      const gap = this._clip(band, d.rect);
      pieces = pieces.flatMap(p => subtractRect(p, gap));
      if (d.y - band.y0 > 0.02) this._box(gap, band.y0, d.y, 'walls', { collide: true, frame });
      const head = d.y + (d.height ?? J.doorHeight);
      // перемычка доходит до верха полосы — шов только у той, что упирается в кровлю
      if (band.y1 - head > 0.02) this._box(gap, head, band.y1, 'walls', { collide: true, geoTop, frame });
    }
    for (const p of pieces) this._box(p, band.y0, band.y1, 'walls', { collide: true, geoTop, frame });
  }

  /**
   * Плита пола комнаты: опора и солид, а вокруг марша, который проходит через
   * этот уровень, — проём. Без проёма перекрытие легло бы на лестницу, и
   * поднявшийся уткнулся бы в пол.
   */
  _floorPlate(b, r, frame) {
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
      this._box(p, top - J.slabThickness, top, 'slabs', { surface: true, frame });
      this.floorPlates.push({
        ...this._worldRect(b, p), y: top, room: r.id, floor: r.floor, building: b.id,
      });
    }
  }

  /** Марш: коробки ступеней от пола, на котором он стоит, до каждой проступи. */
  _stair(b, frame) {
    for (const s of b.stairs) {
      for (const st of s.steps) {
        // вертикальный марш: проступь — пластина на СВОЁМ подъёме, а не столб от
        // пола шахты до неё (иначе картинка — монолит, которого глаз не видит,
        // а правило «твёрдость совпадает с картинкой» нарушено)
        const y0 = s.type === 'ladder' ? r3(st.top - J.ladderRung) : s.y0;
        this._box(st, y0, st.top, 'stairs', { surface: true, frame });
      }
      this.stairCells.push({
        ...this._worldRect(b, s.rect), k0: s.connectsFloors[0], k1: s.connectsFloors[1],
      });
    }
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
  /** Ребро между двумя узлами, если оно проходит проверки (см. `_link`). */
  _linkOk(nav, a, b) {
    const pa = nav.pos[a], pb = nav.pos[b];
    if (Math.abs(pa.y - pb.y) > this.stepUp) return false;
    if (!this.bodyClearLine(pa, pb)) return false;
    if (!this._edgeSupported(pa, pb)) return false;
    nav.link(a, b);
    return true;
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
        // Дуга: цепочка по осевой линии, шаг по углу подбирают под перепад — как
        // у наклонной пластины. Узлы стоят на самой плоскости полотна (на
        // осевой крен нулевой), поэтому `_edgeSupported` и `_link` проверяют ту
        // же опору, что держит ноги; узел на краю полотна не нужен — к краю
        // ведёт сплошная опора, а перила ребро всё равно бы забраковали.
        if (d.arc) {
          const a0r = d.a0 * DEG, spanr = d.span * DEG;
          const len = d.R * Math.abs(spanr);
          const rise = Math.abs(d.y1 - d.y0);
          const perNode = rise > 0.01 ? Math.min(step, this.stepUp * 0.8 * len / rise) : step;
          const count = Math.max(1, Math.ceil(len / perNode));
          let first, last;
          for (let k = 0; k <= count; k++) {
            const t = k / count;
            const ang = a0r + spanr * t;
            const id = nav.add(
              d.cx + Math.cos(ang) * d.R,
              d.y0 + (d.y1 - d.y0) * t,
              d.cz + Math.sin(ang) * d.R,
              `d:${road.id}:${di}:${k}`,
            );
            if (first === undefined) first = id;
            else this._link(nav, last, id);
            last = id;
          }
          if (firstEnd === undefined) firstEnd = first;
          if (prevEnd !== undefined) this._link(nav, prevEnd, first);
          prevEnd = last;
          continue;
        }
        // цепочка идёт по оси полотна: у косой пластины узлы стоят вдоль её
        // длины, а не вдоль мировой оси, иначе маршрут по мосту шёл бы зигзагом
        // от края до края его габарита
        const frame = this._deckFrame(d);
        const u0 = frame ? d.cx - d.length / 2 : (d.axis === 'x' ? d.minX : d.minZ);
        const u1 = frame ? d.cx + d.length / 2 : (d.axis === 'x' ? d.maxX : d.maxZ);
        const cross = frame ? d.cz : (d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2);
        const span = u1 - u0;
        const rise = Math.abs(d.topAtMax - d.topAtMin);
        const perNode = rise > 0.01 ? Math.min(step, this.stepUp * 0.8 * span / rise) : step;
        const count = Math.max(1, Math.ceil(span / perNode));
        const yAt = k => d.topAtMin + (d.topAtMax - d.topAtMin) * (k / count);
        let first, last;
        for (let k = 0; k <= count; k++) {
          const a = u0 + (span * k) / count;
          const p = frame
            ? rotatePoint(frame, a, cross)
            : (d.axis === 'x' ? { x: a, z: cross } : { x: cross, z: a });
          const id = nav.add(p.x, yAt(k), p.z, `d:${road.id}:${di}:${k}`);
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
   *
   * Точка мировая (ею меряют наружный узел двери), а планы частей лежат в осях
   * дома, поэтому сначала разворот.
   */
  _inPlan(b, p) {
    const l = this._toLocal(b, p.x, p.z);
    return b.rects.some(r => l.x >= r.minX && l.x <= r.maxX && l.z >= r.minZ && l.z <= r.maxZ);
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
  _navRooms(nav, rstep) {
    for (const b of this.buildings) {
      for (const room of b.rooms) {
        if (this._roomGrid(nav, b, room, rstep, false) <= 2) {
          this._roomGrid(nav, b, room, rstep / 2, true);
        }
      }
    }
  }
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
  _floorSupport(x, z, level) {
    const y = this.groundHeightAt(x, z, level);
    return Math.abs(y - level) <= J.floorRise + 0.02 ? y : null;
  }
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
}


/** Копия `_navDecks` с двумя правками: наземные улицы тоже, квадратная пластина — цепочкой по обеим осям. */
Proto.prototype._skelDecks = function (nav) {
  const step = STEP;
  for (const road of this.roads) {
    let prevEnd, firstEnd;
    for (const [di, d] of road.decks.entries()) {
      const chains = [];
      if (d.arc) {
        chains.push(chainArc(this, nav, road, di, d, step));
      } else {
        const frame = this._deckFrame(d);
        chains.push(chainPlate(this, nav, road, di, d, step, frame, d.axis ?? 'x'));
        const len = Math.abs((frame ? d.length : (d.axis === 'x' ? d.maxX - d.minX : d.maxZ - d.minZ)));
        const wid = frame ? d.width : (d.axis === 'x' ? d.maxZ - d.minZ : d.maxX - d.minX);
        if (Math.abs(len - wid) < 1e-3) chains.push(chainPlate(this, nav, road, di, d, step, frame, (d.axis ?? 'x') === 'x' ? 'z' : 'x'));
      }
      for (const [first, last] of chains) {
        if (firstEnd === undefined) firstEnd = first;
        if (prevEnd !== undefined) this._link(nav, prevEnd, first);
        prevEnd = last;
      }
    }
    for (const id of [firstEnd, prevEnd]) {
      if (id !== undefined) this._linkClosest(nav, id, END_REACH, END_COUNT);
    }
  }
};

function chainArc(f, nav, road, di, d, step) {
  const a0r = d.a0 * DEG, spanr = d.span * DEG;
  const len = d.R * Math.abs(spanr);
  const rise = Math.abs(d.y1 - d.y0);
  const perNode = rise > 0.01 ? Math.min(step, f.stepUp * 0.8 * len / rise) : step;
  const count = Math.max(1, Math.ceil(len / perNode));
  let first, last;
  for (let k = 0; k <= count; k++) {
    const t = k / count;
    const ang = a0r + spanr * t;
    const id = nav.add(d.cx + Math.cos(ang) * d.R, d.y0 + (d.y1 - d.y0) * t, d.cz + Math.sin(ang) * d.R, `d:${road.id}:${di}:${k}`);
    if (first === undefined) first = id; else f._link(nav, last, id);
    last = id;
  }
  return [first, last];
}

function chainPlate(f, nav, road, di, d, step, frame, axis) {
  const u0 = frame ? d.cx - d.length / 2 : (axis === 'x' ? d.minX : d.minZ);
  const u1 = frame ? d.cx + d.length / 2 : (axis === 'x' ? d.maxX : d.maxZ);
  const cross = frame ? d.cz : (axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2);
  const span = u1 - u0;
  const rise = Math.abs(d.topAtMax - d.topAtMin);
  const perNode = rise > 0.01 ? Math.min(step, f.stepUp * 0.8 * span / rise) : step;
  const count = Math.max(1, Math.ceil(span / perNode));
  const yAt = k => d.topAtMin + (d.topAtMax - d.topAtMin) * (k / count);
  let first, last;
  for (let k = 0; k <= count; k++) {
    const a = u0 + (span * k) / count;
    const p = frame ? rotatePoint(frame, a, cross) : (axis === 'x' ? { x: a, z: cross } : { x: cross, z: a });
    const id = nav.add(p.x, yAt(k), p.z, `d:${road.id}:${di}:${axis}:${k}`);
    if (first === undefined) first = id; else f._link(nav, last, id);
    last = id;
  }
  return [first, last];
}

/** Ребро через склон тем же приёмом, что держит решётку (`_linkRise` в json-map). */
Proto.prototype._skelBridge = function (nav, a, b, tag) {
  const pa = nav.pos[a], pb = nav.pos[b];
  const d = Math.hypot(pb.x - pa.x, pb.z - pa.z);
  const dy = Math.abs(pa.y - pb.y);
  if (dy > J.relief.maxSlope * d) return 0;            // коридор круче предельного уклона мира
  if (dy <= this.stepUp) return this._linkOk(nav, a, b) ? 1 : 0;
  if (!this.relief) return 0;
  const keep = this.stepUp * 0.8;
  const k = Math.max(2, Math.ceil(dy / keep));
  let prev = a, made = 0;
  for (let s = 1; s < k; s++) {
    const t = s / k;
    const x = pa.x + (pb.x - pa.x) * t, z = pa.z + (pb.z - pa.z) * t;
    if (this._inBuilding(x, z)) return 0;
    const fromY = this.relief.heightAt(x, z);
    const y = this.groundHeightAt(x, z, fromY);
    if (this.isBlocked(x, z, CONFIG.radius, y, CONFIG.eyeHeight)) return 0;
    const id = nav.add(x, y, z, `g:${tag}:${s}`);
    if (!this._linkOk(nav, prev, id)) return 0;
    prev = id; made++;
  }
  return this._linkOk(nav, prev, b) ? made + 1 : 0;
};

export function prepare(f) {
  f.floorPlates = []; f.stairCells = []; f.roofPlates = [];
  f._collectBuildings(); f._collectRoads(); f._collectWater();
  f._indexPlans(); f.indexSolids(); f._indexSurfaces(); f._indexBlockers();
  return f;
}

export function build(f, opts = {}) {
  const o = { rooms: true, roofs: true, stairs: true, rescue: true, ...opts };
  prepare(f);
  const nav = new NavGraph();
  if (o.rooms) f._navRooms(nav, CONFIG.jsonMap.navRoomStep);
  if (o.roofs) f._navRoofs(nav);
  if (o.stairs) f._navStairs(nav, CONFIG.jsonMap.navRoomStep);
  f._skelDecks(nav);
  f._navWater(nav);
  f._navDoors(nav, CONFIG.jsonMap.navRoomStep);
  if (o.rescue) for (let i = 0; i < nav.pos.length; i++) if (!nav.adj[i].length) f._linkClosest(nav, i, END_REACH * 2, 3);
  return nav;
}



