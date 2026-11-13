import { CONFIG } from './config.js';
import { SolidField, circleHitsBox } from './solids.js';
import { r3, frameAt, frameOf, obbOf, obbHitsRect, rotatePoint, rotatedBounds, subtractRect, unrotatePoint, arcDelta, arcBankAt, inWaterwaySeg } from './geo2d.js';
import { reliefOf } from './relief.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;

/**
 * Поля-приёмники фазы данных: всё, куда пишут `_collect*`.
 *
 * Это не удобства ради, а контракт `collectChunk`: подменяются ровно эти поля,
 * и позабытое в списке означало бы, что чанк дописался в мировое поле поверх
 * собранного ранее. Такой дефект не краснеет на вердикте опоры (дубликат
 * солида даёт тот же ответ), а стоит удвоением кандидатов на каждую пробу,
 * поэтому список проверяет мера: после `collectChunk` мировые списки обязаны
 * остаться ровно теми, что были (`tools/chunk.test.mjs`).
 */
export const DATA_SINKS = Object.freeze([
  'solids', 'surfaces', 'blockers', 'stairCells', 'floorPlates', 'roofPlates',
  'deckPlates', 'sweeps', 'prisms', 'railWedges', 'rails', 'holes', 'tunnelHoles', 'tunnelZones', 'descents',
  'waterRects',
]);

/**
 * Наклонные поверхности уровня и всё, что из них читается: опора ноги, луч,
 * сфера тела, проходимость габарита и **проба рёбер навигации**.
 *
 * Модуль намеренно не импортирует three — так же, как `solids.js` и `relief.js`.
 * Причина не в стиле, а в достижимости: план открытого мира (§ 4.2) требует,
 * чтобы скелет улиц валидировался тем же кодом, что и собранная карта, а
 * валидатор скелета живёт в Node-парсере, где `src/json-map.js` не грузится
 * вовсе. Одна арифметика опоры — единственное, чем это выполнимо без второй
 * правды о рельефе; вторая реализация запрещена так же, как у формулы поля
 * рельефа.
 *
 * Поэтому фаза здесь разделена ровно по той границе, по которой её придётся
 * звать из Node: данные (призмы, дуги, перила, дыры, блоке́ры, солиды, плиты)
 * собираются здесь, а картинка — в крючке `_addGeo(group, spec)`, который
 * `JsonMap` реализует созданием геометрии. `SurfaceField` сам мешей не заводит:
 * там, где нужна только опора (скелет улиц парсера), хук остаётся пустым, и
 * опорные списки от этого не меняются ни на число.
 */
export class SurfaceField extends SolidField {
  /** @param {object} spec map-секция определения главы (или её нормализованный вид) */
  constructor(spec) {
    super(J.solidBucket);

    const ground = spec.ground;
    this.groundY = ground.y;
    this.width = ground.size;
    this.depth = ground.size;
    this.half = ground.size / 2;
    this.stepUp = CONFIG.building.stepUp;
    this.navEdgeProbe = J.navEdgeProbe;
    this.navEdgeDrop = J.navEdgeDrop;

    /**
     * Плавный рельеф главы (секция `relief`, `src/relief.js`): null у глав без
     * неё, поэтому весь код ниже — и грунт, и опора, и луч, и решётка навигации —
     * для них идёт ровно прежней ветвью. Формула поля та же, что у парсера, и
     * вторая реализация запрещена: отметка ноги и картинка холма обязаны
     * сходиться на первом же брифе.
     */
    this.relief = spec.relief ? reliefOf(spec.relief) : null;
    // «пол мира — ноль» заменяется отметкой поля: `groundHeightAt` базового
    // механизма отвечает через этот крючок
    if (this.relief) this.floorAt = (x, z) => this.relief.heightAt(x, z);
    // земля уровня — общая плоскость: рейкаст вниз опирается на неё, а не на
    // сетку солидов (плит полов под ногами всё равно хватает, но луч из-за
    // предела высоты должен иметь куда упасть). С рельефом плоскости нет: грунт
    // для луча — поле, и `raySolid` марширует по нему сам
    this.groundPlane = this.relief ? null : { y: this.groundY, half: this.half };
    /** прямые туннели коридорами: порталы {x,y,z} + ширина/высота коридора */
    this.tunnels = [];

    this._setInputs(spec);

    /** план марша с этажами, между которыми он стоит: клетки пола внутри него не ставятся */
    this.stairCells = [];
    /** плиты полов комнат: опоры, узлы навигации и миникарта */
    this.floorPlates = [];
    /** плиты ходовых кровель (`roof.walkable`): опора уровня roofY и её решётка узлов */
    this.roofPlates = [];

    /** @type {{minX,maxX,minZ,maxZ,y0,y1}[]} насыпь, откосы и дно там, где в него нельзя */
    this.blockers = [];
    this.deckPlates = [];
    /** кадры повёрнутых пластин настила: считаются один раз на запись */
    this._deckFrames = new Map();
    /** дуги полотна (v2): отметка и коллизия считаются по кольцевому сектору */
    this.sweeps = [];
    /** наклонные твёрдости: пролёты настилов и откосы насыпи — призмы профиля (u, y) */
    this.prisms = [];
    /**
     * Перила настилов: стенка-прямая (призма) у пластины и цилиндрическая стенка
     * у дуги. Отдельно от `prisms`, потому что верх перила опорой не является —
     * иначе `groundHeightAt` поднял бы узел графа и маяк точки B на ограждение.
     */
    this.railWedges = [];
    /** перила для проходимости: и то, и другое с точной высотой края под точкой */
    this.rails = [];
    /** планы, где грунт уровня прорезан руслом: в них нет «пола мира — ноль» */
    this.holes = [];
    /** планы туннелей: вырез в меше земли (чтобы рельеф не перекрывал коридор), но НЕ русло для _inChannel */
    this.tunnelHoles = [];
    /** зоны тоннелей для подавления рельефа-опоры (полный план+потолок). */
    this.tunnelZones = [];
    /** сходы в русло и берега-склоны: узлы графа вдоль уклона */
    this.descents = [];
    /** зеркала воды: план на отметке surfaceY (меш без коллизий рисует карта) */
    this.waterRects = [];
    this._blockIndex = new Map();
    this._blockBucket = J.navStep;
    /** рисовать только записи-владелеццев (`WorldMap` при картинке клетки) */
    this._ownerOnly = false;
    /** множество владельцев текущего прохода — второй слой того же отбора */
    this._drawOwn = null;
  }

  /**
   * Входы фазы данных: списки брифа плюс производные от них кадры поворотов и
   * мировые планы домов.
   *
   * Отдельным методом, потому что планы домов обязаны соответствовать именно
   * тому списку, по которому идёт обход: `_buildingBoxes` индексируется
   * позицией в `buildings`, и подмена списка без подмены кеша заставила бы
   * `_inBuilding` читать чужой корпус.
   */
  _setInputs(src) {
    this.buildings = src.buildings ?? [];
    // Кадр поворота каждого дома (`buildings[].rotation`, v2): null у дома без
    // угла, поэтому весь код ниже для модулей v1-глав идёт ровно прежней веткой.
    // Считается один раз на дом — `cos`/`sin` нужны и картинке, и твёрдости, и
    // навигации, и выводить их дважды значило бы держать два разных угла.
    if (!this._frameCache) this._frameCache = new WeakMap();
    if (!this._boxCache) this._boxCache = new WeakMap();
    if (!this._channelSegCache) this._channelSegCache = new WeakMap();
    this._frames = new Map(this.buildings.map(b => {
      let f = this._frameCache.get(b);
      if (f === undefined) { f = frameOf(b.bounds, b.rotation ?? 0); this._frameCache.set(b, f); }
      return [b, f];
    }));
    // мировой план каждого дома: габарит повёрнутого корпуса плюс `obb`. По нему
    // раскладываются клетки `_buildingCells` (индекс — broadphase, консервативно),
    // а точку «внутри плана» решает `obbHitsRect` уже по своим осям
    this._buildingBoxes = this.buildings.map(b => {
      let box = this._boxCache.get(b);
      if (box === undefined) { box = obbOf(b.bounds, this._frames.get(b)); this._boxCache.set(b, box); }
      return box;
    });
    this.roads = src.roads ?? [];
    this.channels = src.channels ?? [];
    this.tunnels = src.tunnels ?? [];
    /** сегменты кривых русел (плоская принадлежность по расстоянию до оси) */
    this.channelSegs = this.channels.flatMap(ch => {
      let segs = this._channelSegCache.get(ch);
      if (segs === undefined) { segs = (ch.segments ?? []).filter(s => !s.axis); this._channelSegCache.set(ch, segs); }
      return segs;
    });
  }

  /**
   * Крючок фазы мешей: сюда приходят созданные записи (`{kind:'box'|'prism'|
   * 'arc', …}`) и только карта, которой нужна картинка, превращает их в
   * геометрию. Вызывается ровно в той же точке обхода, в которой геометрия
   * создавалась до разделения фаз, поэтому порядок записей в группах не
   * меняется — а с ним и порядок слияния `mergeGeometries`.
   */
  _addGeo() {}

  /**
   * Фаза данных целиком, в единственном месте: порядок вызовов значим
   * (`_collect*` пишут списки, по которым строятся индексы), и парсер, которому
   * нужна только опора (скелет улиц § 4.2), обязан получать ровно то же поле,
   * что собирает движок. Поэтому вызов живёт здесь, а не в конструкторе `JsonMap`.
   */
  collectData() {
    this._collectBuildings();
    this._collectRoads();
    this._collectTunnels();
    this._collectWater();
    this._indexPlans();
    this.indexSolids();
    this._indexSurfaces();
    this._indexBlockers();
  }

  /**
   * Даёт ли эта запись выход в текущем проходе.
   *
   * Флаг `owner: true` ставит разрезка парсера (`tools/chunk-level.mjs`):
   * картинку и свет объекта рисует одна владеющая клетка, иначе дом на шве
   * оказался бы в мешах дважды. Проверка короткая и для глав из брифа не
   * срабатывает вовсе — там `_ownerOnly` не ставится, а флага `owner` у
   * записей нет.
   *
   * `_drawOwn` — второй слой того же правила, нужный `WorldMap`: выводимые ряды
   * (окна, мусор, неон, пропы, фонари) считаются по **мировому** набору, потому
   * что пробуют твёрдость и соседние планы именно в нём, а рисовать обязаны
   * только объекты этой клетки. Множество владельцев даёт фильтр, не трогая
   * набор: отбор по одному флагу `owner` на склеенном мире рисовал бы в каждой
   * клетке весь загруженный мир.
   */
  _drawn(rec) {
    if (!this._ownerOnly) return true;
    return this._drawOwn ? this._drawOwn.has(rec) : rec.owner === true;
  }

  /**
   * Записи списка, дошедшие до картинки этого прохода.
   *
   * Ветка без отбора не аллоцирует: у глав из брифа `build()` рисует по мировым
   * спискам целиком, и копия массива на каждый ряд была бы ценой за ничего.
   */
  _drawable(list) {
    return this._ownerOnly ? list.filter((rec) => this._drawn(rec)) : list;
  }

  /**
   * Картинка считается вне `collectPass`: выводимые ряды пробуют твёрдость и
   * опору по **мировому** полю (бак посреди чужой кровли — тот же дефект, что
   * окно внутри соседнего корпуса), поэтому флаг владельца им даёт этот
   * обёртыватель и держит его ровно на время расчёта слотов.
   *
   * `own` — множество владельцев для открытого мира: там список мировой, и флаг
   * `owner` на нём не различает клеток. Обычным главам он не передан, и они
   * остаются на проборе флага.
   */
  _drawOwnersOnly(fn, own) {
    const held = [this._ownerOnly, this._drawOwn, this._iterBuildings, this._iterRoads];
    this._ownerOnly = true;
    this._drawOwn = own ?? null;
    // для WorldMap: выводимые ряды по зданиям/дорогам могут итерироваться
    // только по владельцам клетки, не сканируя весь загруженный мир
    if (own) {
      this._iterBuildings = [];
      this._iterRoads = [];
      for (const r of own) {
        if (!r) continue;
        if (r.bounds && Array.isArray(r.rooms)) this._iterBuildings.push(r);
        else if (Array.isArray(r.decks) || r.type === 'ground' || r.type === 'elevated') this._iterRoads.push(r);
      }
    } else {
      this._iterBuildings = null;
      this._iterRoads = null;
    }
    try {
      return fn();
    } finally {
      [this._ownerOnly, this._drawOwn, this._iterBuildings, this._iterRoads] = held;
    }
  }

  /**
   * Подмена входов — и, если они переданы в `src`, приёмников — на время `fn`.
   * Индексы (твёрдость, опоры, планы, блоке́ры) при этом остаются **мировые**:
   * именно это нужно открытому миру, где клетка строит своё содержимое (граф,
   * якоря, картинку), пробуя опору и габарит по всему загруженному миру, а не
   * по своему списку.
   *
   * Кеш кадров настила обнуляется на каждый вызов: он ключуется объектом записи,
   * чанковые копии живут меньше мира, и оставленный кеш держал бы их после
   * выгрузки (мера `renderer.info.memory` по кругу клеток отвалилась бы на нём).
   *
   * @param {object} src входы: `{buildings, roads, channels}` и, если нужно,
   *   любые поля из `DATA_SINKS`
   * @param {() => any} fn обход, идущий по этим входам
   * @param {{geo?: object, muteGeo?: boolean, owners?: boolean, own?: Set}} opts
   *   подмена картинки и отбора владельца
   */
  _withInputs(src, fn, opts = {}) {
    const keys = [...DATA_SINKS, 'buildings', 'roads', 'channels', '_frames', '_buildingBoxes',
      '_deckFrames', 'geo', '_muteGeo', '_ownerOnly', '_drawOwn'];
    const held = keys.map((k) => [k, this[k]]);
    this._setInputs(src);
    for (const k of DATA_SINKS) if (src[k] !== undefined) this[k] = src[k];
    this._deckFrames = new Map();
    if (opts.geo) this.geo = opts.geo;
    if (opts.muteGeo !== undefined) this._muteGeo = opts.muteGeo;
    if (opts.owners !== undefined) this._ownerOnly = opts.owners;
    if (opts.own !== undefined) this._drawOwn = opts.own;
    try {
      return fn();
    } finally {
      for (const [k, v] of held) this[k] = v;
    }
  }

  /**
   * Один обход сборщиков над **чужим** набором данных: те же `_collect*`, та же
   * арифметика, но входы, приёмники и картинка подменены, а индексы не
   * перестраиваются. Нужен открытому миру, которому одна клетка обязана дать
   * две половины одного и того же механизма разными наборами:
   *
   * - **проход данных** (`sinks = DATA_SINKS`, `geo = null`) идёт по всем
   *   участникам клетки — твёрдость, опора и проходы чужой стены на шве иначе
   *   видны наполовину, — геометрии не даёт вовсе и возвращает списки, из
   *   которых карта соберёт мировые поля;
   * - **проход картинки** (`geo = группы клетки`, `owners = true`) берёт из
   *   тех же данных только копии с `owner: true` (дом на шве иначе нарисуется
   *   дважды), а твёрдость и опоры выбрасывает: они уже лежат в мировом поле.
   *
   * Оба прохода видят **один и тот же** список участников, и различаются только
   * тем, кто из него даёт выход: сборщик кровли вычитает из неё соседние корпуса
   * и примыкающие настилы (`this.buildings`/`this.roads` целиком), и второй
   * проход, оставь он в входах одних владельцев, посчитал бы кровлю иначе, чем
   * первый. Поэтому отбор владельца — это фильтр записи в цикле, а не урезанный
   * вход.
   *
   * Подмена сделана полями, а не новыми сигнатурами сборщиков: главы 9–13 идут
   * прямым `collectData` и обязаны собраться ровно как раньше. Два следствия
   * кода, а не замысла:
   *
   * - индексы здесь не строятся вовсе: они принадлежат мировому полю, которое
   *   карта пересобирает сама после склейки, — перестройка по списку одной
   *   клетки обесценила бы пробу опоры в том же проходе;
   * - дуга обязана остаться и в проходе данных: её `_sweepMesh` пишет `s.tris`
   *   и `s.hitTris`, по которым луч и перила судят о полотне, — это не меш.
   *
   * @param {object} src входы прохода: `{buildings, roads, channels}`
   * @param {{sinks?: string[], geo?: object|null, owners?: boolean}} opts
   *   `sinks` — какие приёмники вернуть (обычно `DATA_SINKS`, для прохода
   *   картинки — `[]` или нужные картинке), остальные пишутся в одноразовые
   *   массивы; `geo` — группы картинки этой клетки, `null` — геометрия глушится;
   *   `owners` — пропускать записи без флага `owner: true`
   * @returns {object} выбранные приёмники: `имя → массив собранных записей`
   */
  collectPass(src, { sinks = DATA_SINKS, geo = null, owners = false } = {}) {
    const out = {};
    const fresh = {};
    for (const k of DATA_SINKS) fresh[k] = sinks.includes(k) ? (out[k] = []) : [];
    return this._withInputs({ ...src, ...fresh }, () => {
      this._collectBuildings();
      this._collectRoads();
      this._collectTunnels();
      this._collectWater();
      return out;
    }, { geo, muteGeo: !geo, owners: owners === true });
  }

  // -------------------------------------------------- твёрдость: плоские объёмы

  /**
   * Коробка плана над `[y0, y1)`: солид, опора, блокер — по флагам — и заявка на
   * картинку. План остаётся локальным прямоугольником, картинка доворачивается
   * вокруг центра кадра, а в `solids`, `blockers` и `surfaces` идёт габарит
   * повёрнутого прямоугольника плюс `obb`: узкая фаза (`SolidField`) по ней и
   * решает луч, сфера и опора. Габарит сам решения не принимает ни о чём: это
   * фильтр сетки-индекса, а не стена и не высота (AGENTS о фантомах).
   *
   * Картинка стены у кровли срезана на `J.roofSeam` ниже, а пол — поднят на
   * `J.floorRise` выше своей отметки: со-плоскостные грани мигают в z-buffer, а
   * коллизия обязана остаться на настоящей отметке — срезанный солид пропустил
   * бы идущего с крыши сквозь парапет.
   */
  _box(plan, y0, y1, group, { collide = false, surface = false, geoTop = null, frame = null, material = null } = {}) {
    if (plan.maxX - plan.minX <= 1e-6 || plan.maxZ - plan.minZ <= 1e-6 || y1 - y0 <= 1e-6) return;
    const g1 = Math.max(y0 + 1e-6, geoTop ?? y1);
    this._addGeo(group, { kind: 'box', plan, y0, g1, frame, material });
    const world = frame ? obbOf(plan, frame) : plan;
    this.solids.push({
      minX: world.minX, maxX: world.maxX, minY: y0, maxY: y1, minZ: world.minZ, maxZ: world.maxZ,
      ...(world.obb ? { obb: world.obb } : {}),
    });
    if (collide) {
      this.blockers.push({ ...world, y0, y1 });
    }
    if (surface) {
      this.surfaces.push({
        minX: world.minX, maxX: world.maxX, minZ: world.minZ, maxZ: world.maxZ, y: y1,
        ...(world.obb ? { obb: world.obb } : {}),
      });
    }
  }

  // ------------------------------------------------ настил: пластина и дуга

  /**
   * Кадр поворота полотна (v2): пластина задана центром и углом, а не парой
   * точек. Кэш — по самой записи: `_collectRoads`, навигация и мусор спрашивают
   * один и тот же кадр, а `Math.cos` на каждый вызов стоил бы в цикле слотов.
   */
  _deckFrame(d) {
    if (d.frame !== undefined) return d.frame;
    if (!d.yaw) return null;
    let f = this._deckFrames.get(d);
    if (!f) {
      f = frameAt(d.cx, d.cz, d.yaw);
      this._deckFrames.set(d, f);
    }
    return f;
  }

  /**
   * План пластины в её осях. Кадр поворачивает **мировые до поворота** точки
   * вокруг центра пластины (то же соглашение, что у домов), поэтому у повёрнутой
   * пластины план — её прямоугольник с центром `(cx, cz)`, а не центрированный в
   * нуле: иначе `_box`, призмы и луч развернули бы её вокруг чужой точки.
   */
  _deckPlan(d, frame) {
    return frame
      ? {
        minX: d.cx - d.length / 2, maxX: d.cx + d.length / 2,
        minZ: d.cz - d.width / 2, maxZ: d.cz + d.width / 2,
      }
      : d;
  }

  _collectRoads() {
    for (const road of this.roads) {
      if (!this._drawn(road)) continue;
      for (const d of road.decks) {
        // дуга: ни коробки, ни призмы — её верх и коллизию держит sweep, а
        // габарит остаётся только фильтром индексов и миникарты
        if (d.arc) {
          const s = {
            ...d, road: road.id, roadType: road.type,
            a0r: d.a0 * DEG, spanr: d.span * DEG, transr: d.bankTrans * DEG,
          };
          this.sweeps.push(s);
          if (s.rails) this.rails.push({ kind: 'arc', s });
          // лента нарезается один раз и кормит обе стороны правила «картинка
          // совпадает с опорой»: тот же треугольник, что виден, принимает и луч
          this._addGeo('decks', { kind: 'arc', s });
          this.deckPlates.push({ ...d, road: road.id, roadType: road.type });
          continue;
        }
        const frame = this._deckFrame(d);
        // знак разницы — направление подъёма: спуск с пролёта тоже наклонный.
        // Порог общий с нормализатором (`J.rampEps`): подъём меньше него лист
        // получает плоским и в данных, иначе `topAtMin/topAtMax` обещали бы
        // наклон, которого нет ни в картинке, ни в опоре
        if (Math.abs(d.topAtMax - d.topAtMin) > J.rampEps) this._incline(d, frame);
        else this._box(this._deckPlan(d, frame), d.bottomY, d.topY, 'decks', { surface: true, frame });
        if (d.rails) this._deckRails(d, frame);
        this.deckPlates.push({ ...d, road: road.id, roadType: road.type });
      }
      // насыпь: грунт под настилом — и опора быть не может, и идти сквозь него нельзя
      for (const f of road.fill) this._box(f, f.bottomY, f.topY, 'earth', { collide: true });
      for (const a of road.aprons) this._apron(a);
    }
  }

  /**
   * Прямые туннели коридорами: пол (настил), стены и потолок. Коридор прямой —
   * от первого портаала до последнего, поэтому его план — прямоугольник оси ± полуширины
   * коридора (у оси X — срез поперёк по Z, у оси Z — по X). Пол отдаёт опору
   * (`surface`) и твёрдость луча (как у настилов: без `collide` он не блокирует
   * тело, его держит опора), стены и потолок — твёрдость тела (`collide`) и картина
   * той же коробкой `_box` (`_addGeo` рисует её в группу) — правило «твёрдость
   * обязана совпадать с картинкой» не даёт нам рисовать меш из габаритов.
   */
  _collectTunnels() {
    for (const t of this.tunnels ?? []) {
      const pts = t.points ?? [];
      const from = pts[0], to = pts[pts.length - 1];
      if (!from || !to) continue;
      const dx = to.x - from.x, dz = to.z - from.z;
      const len = Math.hypot(dx, dz);
      if (len < 1e-6) continue;
      const halfW = (t.width ?? 0) / 2;
      const floorY = from.y;
      const ceilY = floorY + (t.height ?? 0);
      const axisX = Math.abs(dx) >= Math.abs(dz);
      const plan = axisX
        ? { minX: from.x, maxX: to.x, minZ: from.z - halfW, maxZ: from.z + halfW }
        : { minX: from.x - halfW, maxX: from.x + halfW, minZ: from.z, maxZ: to.z };
      const drawn = this._drawn(t);
      // Туннель может участвовать в нескольких чанках, но рисуется владельцем один раз.
      // Зону подавления рельефа и вырез меша регистрируем у всех участников, иначе
      // в не-владельце остаётся неразрезанный склон и портал «закрыт» горой.
      const zone = { minX: plan.minX, maxX: plan.maxX, minZ: plan.minZ, maxZ: plan.maxZ, floorY, ceilY };
      // Зона подавления опоры — всегда (иначе на уровне тоннеля рельеф-«гора»
      // возвращается как пол). Вырез меша рельефа — только если тоннель не погребён
      // целиком: у глубоко зарытого коридора рельеф выше потолка на всём плане, и
      // полный вырез дал бы сквозную прозрачную «шахту» в горе; гору сверху оставляем.
      this.tunnelZones.push(zone);
      for (const h of this._tunnelCarveRects(zone)) this.tunnelHoles.push({ ...h, floorY, ceilY });
      if (!drawn) continue;
      // пол коридора: опора для ног и твёрдость для луча (deck), collide не ставим —
      // тело держит опора, как у любого настилом
      this._box(plan, floorY - J.deckThickness, floorY, 'decks', { surface: true });
      this.deckPlates.push({
        minX: plan.minX, maxX: plan.maxX, minZ: plan.minZ, maxZ: plan.maxZ,
        topY: floorY, bottomY: floorY - J.deckThickness,
        topAtMin: floorY, topAtMax: floorY, ramp: false, arc: false,
      });
      // стены: две боковые стенки вдоль коридора, с проёмами у порталов. Полная
      // длина стены (до торцов min/max по оси) перекрывала бы вход/выход — тело и
      // навигация не могли пересечь плоскость портала (bodyClearLine/edgeOk рвало
      // цепочку настила на границе). Отступаем от каждого портала на зазор прохода:
      // геометрия и коллизия режутся одинаково, твёрдость совпадает с картинкой.
      const wallT = J.wallThickness;
      const portalGap = Math.max(CONFIG.radius * 2, 1.2);
      const u0 = axisX ? Math.min(plan.minX, plan.maxX) : Math.min(plan.minZ, plan.maxZ);
      const u1 = axisX ? Math.max(plan.minX, plan.maxX) : Math.max(plan.minZ, plan.maxZ);
      const s0 = u0 + portalGap, s1 = u1 - portalGap;
      const sideSpecs = axisX
        ? [
          { minZ: from.z - halfW, maxZ: from.z - halfW + wallT },
          { minZ: from.z + halfW - wallT, maxZ: from.z + halfW },
        ]
        : [
          { minX: from.x - halfW, maxX: from.x - halfW + wallT },
          { minX: from.x + halfW - wallT, maxX: from.x + halfW },
        ];
      for (const side of sideSpecs) {
        if (s1 > s0 + 1e-6) {
          const w = axisX
            ? { minX: s0, maxX: s1, ...side, y0: floorY, y1: ceilY }
            : { ...side, minZ: s0, maxZ: s1, y0: floorY, y1: ceilY };
          this._box(w, w.y0, w.y1, 'walls', { collide: true });
        }
      }
      // потолок: твёрдость тела, картинка в своей группе
      const ceilingPlan = axisX
        ? { minX: plan.minX, maxX: plan.maxX, minZ: plan.minZ, maxZ: plan.maxZ }
        : { minX: plan.minX, maxX: plan.maxX, minZ: plan.minZ, maxZ: plan.maxZ };
      this._box(ceilingPlan, ceilY - J.deckThickness, ceilY, 'ceilings', { collide: true });
    }
  }

  /**
   * Сегменты выреза меша рельефа над тоннелем: режем только там, где рельеф
   * пересекает/близок к потолку (портал, неглубокий участок). Глубоко погребённый
   * отрезок не трогаем — иначе получилась бы сквозная прозрачная «шахта» в горе.
   * Без рельефа вырезаем весь план (плоский мир).
   */
  _tunnelCarveRects(zone) {
    const { minX, maxX, minZ, maxZ, ceilY } = zone;
    if (!this.relief) return [{ minX, maxX, minZ, maxZ }];
    const m = 1.5;
    const axisX = (maxX - minX) >= (maxZ - minZ);
    const a0 = axisX ? minX : minZ, a1 = axisX ? maxX : maxZ;
    const b0 = axisX ? minZ : minX, b1 = axisX ? maxZ : maxX;
    const step = 4;
    const near = (a) => {
      const x = axisX ? a : (b0 + b1) / 2, z = axisX ? (b0 + b1) / 2 : a;
      return this.relief.heightAt(x, z) <= ceilY + m
        || this.relief.heightAt(axisX ? a : b0, axisX ? b0 : a) <= ceilY + m
        || this.relief.heightAt(axisX ? a : b1, axisX ? b1 : a) <= ceilY + m;
    };
    const rects = [];
    let run = null;
    for (let a = a0; a <= a1 + 1e-6; a += step) {
      const aa = Math.min(a, a1);
      if (near(aa)) { if (!run) run = { a0: aa, a1: aa }; else run.a1 = aa; }
      else if (run) { rects.push(run); run = null; }
      if (aa >= a1 - 1e-6) break;
    }
    if (run) rects.push(run);
    return rects.map(r => axisX
      ? { minX: Math.max(minX, r.a0 - step / 2), maxX: Math.min(maxX, r.a1 + step / 2), minZ, maxZ }
      : { minX, maxX, minZ: Math.max(minZ, r.a0 - step / 2), maxZ: Math.min(maxZ, r.a1 + step / 2) }
    );
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
  _incline(d, frame = null) {
    const plan = this._deckPlan(d, frame);
    const lo = d.axis === 'x' ? plan.minX : plan.minZ;
    const hi = d.axis === 'x' ? plan.maxX : plan.maxZ;
    const v0 = d.axis === 'x' ? plan.minZ : plan.minX;
    const v1 = d.axis === 'x' ? plan.maxZ : plan.maxX;
    if (hi - lo <= 1e-6 || v1 - v0 <= 1e-6) return;
    const k = (d.topAtMax - d.topAtMin) / (hi - lo);
    const c = d.topAtMin - k * lo;
    const t = J.deckThickness;
    const w = makePrism(d.axis, v0, v1, [[lo, k * lo + c], [hi, k * hi + c], [hi, k * hi + c - t], [lo, k * lo + c - t]], frame);
    this.prisms.push(w);
    this._addGeo('decks', { kind: 'prism', w });
  }

  /**
   * Перила прямой пластины: две стенки-призмы по кромкам, чей профиль параллелен
   * подъёму полотна, — поэтому у съезда ограждение идёт по наклону непрерывной
   * стеной, а не лесенкой коробок. Призма лежит в осях пластины и поворачивается
   * тем же кадром, что и настил, поэтому луч и сфера берут общий механизм
   * `rayWedge`/`pushOutWedge` без новой арифметики.
   */
  _deckRails(d, frame) {
    const plan = this._deckPlan(d, frame);
    const t = J.railThickness, h = J.railHeight, sink = J.railSink;
    const axis = d.axis ?? 'x';
    const isX = axis === 'x';
    const lo = isX ? plan.minX : plan.minZ, hi = isX ? plan.maxX : plan.maxZ;
    const vMid = isX ? (plan.minZ + plan.maxZ) / 2 : (plan.minX + plan.maxX) / 2;
    const halfV = (isX ? plan.maxZ - plan.minZ : plan.maxX - plan.minX) / 2;
    if (hi - lo <= 1e-6 || halfV <= 0) return;
    // подъём вдоль оси — та же прямая, что держит настил (`topAtMin` → `topAtMax`)
    const k = (d.topAtMax - d.topAtMin) / (hi - lo);
    const c = d.topAtMin - k * lo;
    for (const side of [-1, 1]) {
      const vEdge = vMid + side * halfV;
      const y = u => k * u + c - sink;
      const w = makePrism(axis, vEdge - t / 2, vEdge + t / 2, [
        [lo, y(lo)], [hi, y(hi)], [hi, y(hi) + h], [lo, y(lo) + h],
      ], frame);
      this.railWedges.push(w);
      this.rails.push({ kind: 'wedge', w });
      this._addGeo('rails', { kind: 'prism', w });
    }
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
    this._addGeo('earth', { kind: 'prism', w });
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
   * мост. Вода — меш без коллизий на отметке surfaceY: и луч, и тело идут сквозь
   * неё к дну.
   */
  _collectWater() {
    const DEG = 180 / Math.PI;
    for (const ch of this.channels) {
      if (!this._drawn(ch)) continue;
      for (const s of ch.segments) {
        if (s.axis) {
          const axis = s.axis === 'x' ? 'z' : 'x';   // профиль отложен поперёк русла
          const bed = makePrism(axis, s.lo, s.hi, [
            [s.cross - s.halfW, ch.bedY], [s.cross + s.halfW, ch.bedY],
            [s.cross + s.halfW, r3(ch.bedY - J.bedThickness)], [s.cross - s.halfW, r3(ch.bedY - J.bedThickness)],
          ]);
          this.prisms.push(bed);
          this._addGeo('earth', { kind: 'prism', w: bed });
          this.holes.push(s.bed);
          this.waterRects.push({ ...s.bed, y: ch.surfaceY });
          if (!ch.wade) {
            this.blockers.push({ ...s.bed, y0: r3(ch.bedY - 0.05), y1: r3(this.groundY + 1) });
          }
        } else {
          // кривой сегмент: призма дна в локальном кадре (u=вдоль, v=поперёк)
          const frame = frameAt(s.ax, s.az, Math.atan2(s.tz, s.tx) * DEG);
          const bed = makePrism('x', -s.halfW, s.halfW, [
            [s.lo, ch.bedY], [s.hi, ch.bedY],
            [s.hi, r3(ch.bedY - J.bedThickness)], [s.lo, r3(ch.bedY - J.bedThickness)],
          ], frame);
          this.prisms.push(bed);
          // strip-дыра: broadphase-габарит для индекса; точность — inWaterwaySeg
          this.holes.push({ ...s.bed, strip: true, seg: s.bed.seg ?? s });
          this.waterRects.push({ ...s.bed, y: ch.surfaceY, strip: true, seg: s.bed.seg ?? s });
          // Картинка ложа — лента на `bedY`, а не призма каждого сегмента:
          // соседние призмы продлены на полширины, и на повороте их со-плоскостные
          // верхние грани мигали друг сквозь друга. Твёрдость по-прежнему держит
          // призма выше (`prisms`), картинка её только повторяет.
          this.waterRects.push({ ...s.bed, y: ch.bedY, strip: true, bed: true, seg: s.bed.seg ?? s });
          // непроходимое кривое русло: блока rect-габаритом не ставим (он режет за
          // пределами полосы); физику держит дно-призма (−4 м) + _inChannel для нав.
        }
      }
      for (const d of ch.descents) {
        if (d.strip) {
          const s = d.s;
          const frame = frameAt(s.ax, s.az, Math.atan2(s.tz, s.tx) * DEG);
          const inner = d.side * s.halfW, outer = inner + d.side * s.run;
          const w = makePrism('z', s.lo, s.hi, [[inner, d.y0], [outer, d.y1], [outer, d.y0]], frame);
          this.prisms.push(w);
          w.descentId = d.id;
          this._addGeo('earth', { kind: 'prism', w });
          this.descents.push(d);
          continue;
        }
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
        // каждому уклону, а русло и берега лежат в одном списке призм
        w.descentId = d.id;
        this._addGeo(d.kind === 'ramp' ? 'decks' : 'earth', { kind: 'prism', w });
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
    const out = this._tmpIdx;
    out.length = 0;
    this._plansAround(this._prismCells, x, z, out, 0);
    let best = null;
    for (const idx of out) {
      const w = this.prisms[idx];
      // клетка индекса (24 м) гораздо шире плана призмы: без проверки
      // попадания в сам прямоугольник верх настила протекал бы на точки
      // в десятках метров поперёк дороги. У повёрнутой призмы проверка идёт в
      // её осях: габарит за её торцами — не настил
      const l = w.frame ? unrotatePoint(w.frame, x, z) : null;
      const u = l ? l.x : (w.axis === 'x' ? x : z);
      const v = l ? l.z : (w.axis === 'x' ? z : x);
      // допуск обратного хода — те же 1e-9, что внутри `topAt`: узел цепочки
      // ставится вращением кадра и обратный ход возвращает его на грань плана с
      // шумом в 1e-16 м, а без допуска собственный торец настила опору не даёт
      // (замер главы 13: узел `d:ring_ring:9:0` — `null` на грани и 14,388 м в
      // миллиметре от неё, из-за чего `_edgeSupported` браковал ребро шва)
      if (u < w.lo - 1e-9 || u > w.hi + 1e-9 || v < w.v0 - 1e-9 || v > w.v1 + 1e-9) continue;
      const t = w.topAt(Math.min(w.hi, Math.max(w.lo, u)));
      if (t !== null && (best === null || t > best)) best = t;
    }
    return best;
  }

  /**
   * Точная отметка верха дуги под точкой; null — точка вне её сектора. Опора
   * ноги, луч и сфера считают полотно одной арифметикой (`sweepTopAt`): второй
   * копии «верха полотна» в коде быть не должно.
   *
   * Кандидаты берутся из бакетов плана (`J.planGrid`), а не из всего списка
   * `sweeps`: та же причина, что привела туда призмы и перила — цена пробы
   * обязана зависеть от того, где точка, а не от числа дуг во всём городе
   * (замер главы 12: 0,111 мкс против 0,315 при двух дугах, а перебор по 14
   * дугам — уже 1,758). Точка внутри сектора лежит внутри габарита дуги, а
   * `put` растеризует габарит по клеткам — поэтому пояс нулевой (клетка самой
   * точки) полон; лишний кандидат числу не вредит, `sweepTopAt` для него
   * отдаёт null.
   *
   * Клетка читается напрямую, а не через `_planAt`, как это делает сосед
   * `_prismTopAt`: `_planAt` плодит массив на каждую пробу, а опора зовётся на
   * каждый кадр каждого идущего тела — на коротком списке дуг плата за
   * аллокацию съедала всю экономию (замер на фикстуре 300 × 300 м: 3,68 мкс
   * против 1,31 у перебора и 1,20…1,47 здесь; бюджет сюжета — 2 мкс).
   */
  topAt(x, z) {
    const g = this._planGrid;
    const list = this._sweepCells.get(this._key(Math.floor(x / g), Math.floor(z / g)));
    if (!list) return null;
    let best = null;
    for (const idx of list) {
      const y = sweepTopAt(this.sweeps[idx], x, z);
      if (y !== null && (best === null || y > best)) best = y;
    }
    return best;
  }

  _sweepTopAt(x, z) {
    return this.topAt(x, z);
  }

  /**
   * Опора: плоские плиты как у базового механизма, плюс верх наклонных призм —
   * у них нет одной отметки на весь план, поэтому в `surfaces` они не стоят.
   *
   * С секцией `relief` «полом мира» становится отметка поля (`floorAt` в
   * `SolidField`), и она НЕ фильтруется пределом шага: местность в точке —
   * единственная отметка, а не «высшая опора в пределах ноги». Иначе спуск с
   * холма отвечал бы нулём, и нога повисла бы над склоном.
   */
  groundHeightAt(x, z, fromY = 0, terrainY) {
    const relief = terrainY !== undefined ? terrainY : (this.relief ? this.relief.heightAt(x, z) : 0);
    const hasPrisms = !!this.prisms?.length;
    const hasSweeps = !!this.sweeps?.length;
    const hasTunnel = !!(this.tunnelZones?.length || this.tunnelHoles?.length);
    const hasChannels = !!(this.holes?.length || this.channelSegs?.length);
    const simple = !hasPrisms && !hasSweeps && !hasTunnel && !hasChannels;
    const plate = this.surfaces?.length ? this.plateHeightAt(x, z, fromY) : null;
    if (simple) return plate === null ? relief : Math.max(plate, relief);

    const lim = fromY + this.stepUp;
    // берётся высшая опора в пределах шага ноги, а не просто высшая: на развязке
    // полотно дуги висит над улицей, и её 8 м не должны прятать асфальт под ногой
    let top = null;
    if (hasPrisms) {
      const t = this._prismTopAt(x, z);
      if (t !== null && t <= lim) top = t;
    }
    if (hasSweeps) {
      const t = this._sweepTopAt(x, z);
      if (t !== null && t <= lim && (top === null || t > top)) top = t;
    }
    // Тоннель: подавляем аналитический рельеф только в «коридоре» (диапазон ног
    // у пола и до потолка), чтобы (а) внутри/на полу получать опору пола тоннеля,
    // (б) над потолком (проба с горы) — реальный рельеф/гору, (в) под поднятым
    // полом на выходе портала — рельеф/грунт, а не пол; иначе решётка навигации
    // и опора ломаются (ложные узлы/залипание).
    const th = hasTunnel ? this._tunnelHoleAt(x, z, fromY) : null;
    if (th && th.ceilY != null) {
      const { floorY, ceilY } = th;
      const inBand = lim <= ceilY + 1e-6 && fromY >= floorY - this.stepUp - 0.05;
      if (inBand) {
        const tf = floorY <= lim ? floorY : -Infinity;
        const hold = plate !== null ? plate : null;
        const cand = [tf, hold, top].filter(v => v !== null && v > -Infinity);
        return cand.length ? Math.max(...cand) : floorY;
      }
      // над потолком — горный рельеф как есть (не подавляем)
    }
    const floor = relief;
    const base = plate === null ? floor : Math.max(plate, floor);
    if (top === null) return base;
    // в русле «пол мира» (ноль без рельефа, отметка поля с ним) ноги не держит:
    // грунт там срезан руслом, и опора ровно та, что отдаёт призма дна или схода.
    // Над водой настил моста остаётся опорой — его плита выше дна
    if (hasChannels && this._inChannel(x, z)) {
      const hold = plate !== null && plate > floor ? plate : null;
      return hold !== null && hold > top ? hold : top;
    }
    return top > base ? top : base;
  }

  // -------------------------------------------------- коллизии габарита и опоры

  /**
   * Коллизии габарита: стены этажей (с проёмами), грунт насыпи и откосы.
   * Сетка `_blockIndex` раскладывает блоки по габариту — она только отбирает
   * кандидатов, а решение принимает `circleHitsBox`: у повёрнутого дома по его
   * собственным граням, иначе тело стояло бы в метре от косой стены, где глаз
   * видит свободный тротуар.
   */
  isBlocked(x, z, radius = CONFIG.radius, feetY = 0, height = CONFIG.eyeHeight) {
    const half = this.half;
    if (x - radius < -half || x + radius > half || z - radius < -half || z + radius > half) return true;
    if (this.blockers?.length) {
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
            if (circleHitsBox(x, z, w, radius)) return true;
          }
        }
      }
    }
    return this.rails?.length ? this._railsBlock(x, z, radius, feetY, height) : false;
  }

  /**
   * Перила настилов — блокер, но не в списке `blockers`: их пояс по высоте
   * меняется вдоль полотна (у дуги — по крену, у съезда — по подъёму), и
   * коробка-габарит отняла бы воздух под настилом. Решение принимает точная
   * геометрия стенки: кольцевая полоса у дуги, призма — у пластины.
   */
  _railsBlock(x, z, radius, feetY, height) {
    for (const rail of this.rails) {
      if (rail.kind === 'arc') {
        if (sweepRailsBlock(rail.s, x, z, radius, feetY, height)) return true;
      } else if (railWedgeBlocks(rail.w, x, z, radius, feetY, height)) return true;
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

  // -------------------------------------------------------------- индекс планов

  /**
   * Индекс планов: габариты зданий, призм, перил, дуг и планов русла по клеткам
   * `J.planGrid`. Нужен потому, что `groundHeightAt` зовётся на каждую пробу
   * ребра графа (12 проб на 6 м в обе стороны), а `_inBuilding` — на каждую
   * клетку решётки: на районе 600 × 600 м с сотнями зданий и маршей линейный
   * перебор списков стоит миллионов проверок, индекс — десятки. Те же списки
   * перебирали `raySolid` и `resolveSphere` по всем призмам, перилам и дугам на
   * каждый вызов — на главе 12 проба луча в 2,7 м стоила 208 мкс, то есть цена
   * вызова зависела от числа настилов во всём городе, а не от того, что луч
   * летит три метра (замеры бюджета — в разделе «рельеф» docs/architecture-json-levels.md).
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
    this._railCells = new Map();
    this._sweepCells = new Map();
    this.buildings.forEach((b, idx) => put(this._buildingCells, this._buildingBoxes[idx], idx));
    this.prisms.forEach((w, idx) => put(this._prismCells, w.world ?? w, idx));
    this.railWedges.forEach((w, idx) => put(this._railCells, w.world ?? w, idx));
    this.sweeps.forEach((s, idx) => put(this._sweepCells, s, idx));
    this.holes.forEach((r, idx) => put(this._holeCells, r, idx));
    this._planGrid = g;
    /** буферы луча и сферы: перебор кандидатов не должен плодить массивы на кадр */
    this._planSeen = new Set();
    this._rayCand = [];
    this._sphereCand = [];
    /** временный буфер индексов планов: _prismTopAt и _inChannel берутся из
     *  groundHeightAt каждый кадр каждого тела — без него каждый вызов плодил
     *  массив в _planAt (см. комментарий у topAt) */
    this._tmpIdx = [];
  }

  /**
   * Объекты вокруг точки: клетка её плана и соседи (пояс `ring`). В отличие от
   * `_planAt` список без повторов: потребитель, который двигает саму точку
   * (выталкивание сферы), применив один объект дважды, вытолкнул бы тело вдвое
   * сильнее.
   */
  _plansAround(cells, x, z, out, ring = 1) {
    const g = this._planGrid;
    const ci = Math.floor(x / g), ck = Math.floor(z / g);
    const seen = this._planSeen;
    seen.clear();
    for (let j = ck - ring; j <= ck + ring; j++) {
      for (let i = ci - ring; i <= ci + ring; i++) {
        const list = cells.get(this._key(i, j));
        if (!list) continue;
        for (const idx of list) {
          if (seen.has(idx)) continue;
          seen.add(idx);
          out.push(idx);
        }
      }
    }
    return out;
  }

  /**
   * Объекты, чей план попал в прямоугольник отрезка луча. Кандидатов отдаёт
   * ровно столько же, сколько находит полная перепись списка: точка удара лежит
   * внутри плана объекта, поэтому клетка её плана стоит и в списке этого
   * объекта (пределы растра считаются `floor` от обоих концов, поэтому граница
   * плана не теряет клетку).
   */
  _plansOnSegment(cells, ox, oz, ux, uz, limit, out) {
    const g = this._planGrid;
    const ex = ox + ux * limit, ez = oz + uz * limit;
    const i0 = Math.floor(Math.min(ox, ex) / g), i1 = Math.floor(Math.max(ox, ex) / g);
    const j0 = Math.floor(Math.min(oz, ez) / g), j1 = Math.floor(Math.max(oz, ez) / g);
    const seen = this._planSeen;
    seen.clear();
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const list = cells.get(this._key(i, j));
        if (!list) continue;
        for (const idx of list) {
          if (seen.has(idx)) continue;
          seen.add(idx);
          out.push(idx);
        }
      }
    }
    return out;
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

  /**
   * Точка мира внутри плана дома. Тест — по мировой коробке (`obb` у косого
   * корпуса, обычный прямоугольник у соосного), а не по его охвату: у дома под
   * 30° габарит шире фасадов углами, и решётка улиц начала бы бракаться там,
   * где глаз видит асфальт.
   */
  _inBuilding(x, z, margin = 0.2) {
    for (const idx of this._planAt(this._buildingCells, x, z)) {
      if (obbHitsRect(this._buildingBoxes[idx], { minX: x, maxX: x, minZ: z, maxZ: z }, -margin)) return true;
    }
    return false;
  }

  /**
   * Лежит ли точка в прорезанном русле. Клетка индекса (`J.planGrid` = 24 м)
   * гораздо шире плана русла, поэтому после клетки обязана идти точная проверка
   * прямоугольника: иначе отмена «пола мира — ноль» распространялась бы на сушу
   * в десятках метров от воды.
   */
  _tunnelHoleAt(x, z, fromY = Infinity) {
    // зоны подавления опоры: полный план тоннеля (даже погребённого, без выреза
    // меша), с малым допуском на границе портала — иначе шаг на x=maxX+eps при
    // fromY на уровне пола даёт рельеф-«гору» и выбрасывает тело на поверхность.
    const list = this.tunnelZones?.length ? this.tunnelZones : this.tunnelHoles;
    if (!list?.length) return null;
    const lim = fromY + (this.stepUp ?? CONFIG.building.stepUp ?? 0.6);
    const eps = 1.2;
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (x < r.minX - eps || x > r.maxX + eps || z < r.minZ - eps || z > r.maxZ + eps) continue;
      if (r.ceilY != null) { if (lim <= r.ceilY + 1e-6) return r; }
      else return r;
    }
    return null;
  }

  _inTunnelHole(x, z, fromY = Infinity) {
    return !!this._tunnelHoleAt(x, z, fromY);
  }

  _inChannel(x, z) {
    if (!this.holes.length && !(this.channelSegs?.length)) return false;
    // кривые сегменты: точная принадлежность по расстоянию до оси (полоса)
    if (this.channelSegs?.length) {
      for (const s of this.channelSegs) if (inWaterwaySeg(s, x, z)) return true;
    }
    if (!this.holes.length) return false;
    const out = this._tmpIdx;
    out.length = 0;
    this._plansAround(this._holeCells, x, z, out, 0);
    for (const idx of out) {
      const r = this.holes[idx];
      if (r.strip) { if (inWaterwaySeg(r.seg ?? r, x, z)) return true; continue; }
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return true;
    }
    return false;
  }

  /** Отметка дна/берега русла в точке канала (для выреза меша рельефа). */
  _channelBedY(x, z) {
    for (const ch of this.channels ?? []) {
      for (const s of ch.segments ?? []) {
        if (!s.axis && inWaterwaySeg(s, x, z)) return ch.bedY;
        if (s.axis) {
          const L = s.axis === 'x' ? { along: x, cross: z } : { along: z, cross: x };
          if (L.along >= s.lo && L.along <= s.hi && Math.abs(L.cross - s.cross) <= s.halfW) return ch.bedY;
        }
      }
    }
    return this.groundY - 4;
  }

  // ------------------------------------------------------- проба рёбер графа

  /**
   * Есть ли опора под всем ребром, а не только на его концах. Решётка ставит
   * узлы на плитах, но соединяет их по прямой: без этой пробы идущий сходил бы с
   * этажа в проём перекрытия под лестницей, а через разрыв настила — в пропасть.
   *
   * Свободен ли отрезок для тела, проверяет `SolidField.bodyClearLine` — вместе
   * они дают то, чего по отдельности не видно: габариту марш свободен, а под
   * ногой там проём.
   *
   * Двусторонняя, потому что ребро графа неориентированное: вниз нога идёт по
   * склону призмы, а вверх — по её же верху, и предел `navEdgeDrop` меряется от
   * той опоры, с которой стартуешь. Проба «вверх через высокую проступь»
   * проходит: подъём разрешён, а спуск по тому же ребру даёт провал глубже
   * `navEdgeDrop` — так шахта марша связалась с полом, и идущий с площадки
   * падал на этаж.
   */
  _edgeSupported(a, b) {
    return this._edgeWalk(a, b) && this._edgeWalk(b, a);
  }

  /**
   * Обход опоры вдоль ребра в одном направлении (см. `_edgeSupported`).
   * Направление обязано быть симметричным результату.
   *
   * Шагаем пробами `J.navEdgeProbe`: подъём между пробами не больше `stepUp` (это
   * держит уже `groundHeightAt` — выше ступени он не отвечает), спуск допустим,
   * но провал глубже `J.navEdgeDrop` бракует ребро. На конце нога обязана
   * дотянуться до узла; оказаться выше него не беда — под узлом просто есть
   * плита выше (тротуар, настил насыпи), и идущий встанет на неё.
   *
   * Нога не поднимается выше цели ребра (`cap`): проба внутри шахты видит
   * следующую проступь, и без потолка из спуска по краю шахты получался провал
   * глубже `navEdgeDrop` уже после подъёма на ступень, которой на этом ребре нет
   * (замер — docs/defects-v2-plan.md).
   */
  _edgeWalk(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z;
    const dist = Math.hypot(dx, dz);
    const navEdgeProbe = this.navEdgeProbe ?? J.navEdgeProbe;
    const navEdgeDrop = this.navEdgeDrop ?? J.navEdgeDrop;
    const steps = Math.max(1, Math.ceil(dist / navEdgeProbe));
    const cap = Math.max(a.y, b.y);
    let feet = a.y;
    const simpleGround = !this.prisms?.length && !this.sweeps?.length && !(this.tunnelZones?.length || this.tunnelHoles?.length) && !(this.holes?.length || this.channelSegs?.length);
    const noSurfaces = !this.surfaces?.length;
    const simple = simpleGround && noSurfaces;
    const relief = this.relief;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const x = a.x + dx * t, z = a.z + dz * t;
      const y = simple ? (relief ? relief.heightAt(x, z) : 0) : this.groundHeightAt(x, z, Math.max(feet, a.y));
      if (feet - y > navEdgeDrop) return false;
      feet = Math.min(y, cap);
    }
    return b.y - feet <= this.stepUp;
  }

  /**
   * Свободен ли отрезок для тела: в простом мире без блокеров/рельс и внутри
   * границ плиты промежуточные пробы `isBlocked` всегда ложны (эквивалентно
   * базовой геометрической проверке), поэтому цикл проб можно пропустить.
   * Rapier-ветка и иные случаи делегируются базовой реализации.
   */
  bodyClearLine(a, b, radius = CONFIG.radius, height = CONFIG.eyeHeight) {
    if (CONFIG.physics?.mode === 'rapier') return super.bodyClearLine(a, b, radius, height);
    if (!this.blockers?.length && !this.rails?.length) {
      const h = this.half;
      if (a.x >= -h && a.x <= h && a.z >= -h && a.z <= h && b.x >= -h && b.x <= h && b.z >= -h && b.z <= h) {
        return true;
      }
    }
    return super.bodyClearLine(a, b, radius, height);
  }

  /**
   * Проходит ли ребро между двумя точками: перепад в один шаг ноги, габарит
   * свободен, опора держит весь отрезок.
   *
   * Одна формула на движок и на парсер: `_linkOk` зовёт её на узлах графа, а
   * скелет улиц (§ 4.2 плана открытого мира) проверяет ею длинные рёбра. Вторая
   * реализация сделала бы скелет правдой, которой карта не делится, — ровно то,
   * из-за чего проба опоры вообще уехала из `json-map.js` сюда.
   */
  edgeOk(a, b) {
    if (Math.abs(a.y - b.y) > this.stepUp) return false;
    if (!this.bodyClearLine(a, b)) return false;
    return this._edgeSupported(a, b);
  }

  /**
   * Точки цепочки вдоль оси настила шагом не больше `step`; торцы обязательны.
   *
   * Дуга — цепочка по осевой линии, шаг по углу подбирают под перепад, как у
   * наклонной пластины. Узлы стоят на самой плоскости полотна (на осевой крен
   * нулевой), поэтому `edgeOk` и `_edgeSupported` проверяют ту же опору, что
   * держит ноги; узел на краю полотна не нужен — к краю ведёт сплошная опора, а
   * перила ребро всё равно бы забраковали.
   *
   * Цепочка идёт по оси полотна: у косой пластины точки стоят вдоль её длины, а
   * не вдоль мировой оси, иначе маршрут по мосту шёл бы зигзагом от края до края
   * его габарита. Перепад соседних точек не выше шага ноги, поэтому на уклоне
   * точек больше, чем дал бы шаг.
   */
  deckChain(d, step) {
    const pts = [];
    if (d.arc) {
      const a0r = d.a0 * DEG, spanr = d.span * DEG;
      const len = d.R * Math.abs(spanr);
      const rise = Math.abs(d.y1 - d.y0);
      const perNode = rise > 0.01 ? Math.min(step, this.stepUp * 0.8 * len / rise) : step;
      const count = Math.max(1, Math.ceil(len / perNode));
      for (let k = 0; k <= count; k++) {
        const t = k / count;
        const ang = a0r + spanr * t;
        pts.push({
          x: d.cx + Math.cos(ang) * d.R,
          y: d.y0 + (d.y1 - d.y0) * t,
          z: d.cz + Math.sin(ang) * d.R,
        });
      }
      return pts;
    }
    const frame = this._deckFrame(d);
    const u0 = frame ? d.cx - d.length / 2 : (d.axis === 'x' ? d.minX : d.minZ);
    const u1 = frame ? d.cx + d.length / 2 : (d.axis === 'x' ? d.maxX : d.maxZ);
    const cross = frame ? d.cz : (d.axis === 'x' ? (d.minZ + d.maxZ) / 2 : (d.minX + d.maxX) / 2);
    const span = u1 - u0;
    const rise = Math.abs(d.topAtMax - d.topAtMin);
    const perNode = rise > 0.01 ? Math.min(step, this.stepUp * 0.8 * span / rise) : step;
    const count = Math.max(1, Math.ceil(span / perNode));
    for (let k = 0; k <= count; k++) {
      const a = u0 + (span * k) / count;
      const p = frame
        ? rotatePoint(frame, a, cross)
        : (d.axis === 'x' ? { x: a, z: cross } : { x: cross, z: a });
      pts.push({ x: p.x, y: d.topAtMin + (d.topAtMax - d.topAtMin) * (k / count), z: p.z });
    }
    return pts;
  }

  /**
   * Точки схода в русло вдоль его уклона (тот же подбор шага, что у `deckChain`);
   * null — схода нет (плоский или вырожденный). Концы связывает решётка берега и
   * дна, здесь только сама цепочка.
   */
  descentChain(d, step) {
    if (d.strip) {
      const s = d.s, rise = Math.abs(d.y1 - d.y0), span = Math.abs(s.run);
      if (span <= 0.01 || rise <= 0.01) return null;
      const inner = d.side * s.halfW, outer = inner + d.side * s.run;
      const uMid = (s.lo + s.hi) / 2; // середина по длине (упрощённо)
      const count = Math.max(1, Math.ceil(span / Math.min(step, this.stepUp * 0.8 * span / rise)));
      const pts = [];
      for (let k = 0; k <= count; k++) {
        const t = k / count, v = inner + (outer - inner) * t;
        pts.push({ x: s.ax + s.tx * uMid + s.nx * v, y: d.y0 + (d.y1 - d.y0) * t, z: s.az + s.tz * uMid + s.nz * v });
      }
      return pts;
    }
    const span = Math.abs(d.u1 - d.u0);
    const rise = Math.abs(d.y1 - d.y0);
    if (span <= 0.01 || rise <= 0.01) return null;
    const v = (d.v0 + d.v1) / 2;
    const count = Math.max(1, Math.ceil(span / Math.min(step, this.stepUp * 0.8 * span / rise)));
    const pts = [];
    for (let k = 0; k <= count; k++) {
      const t = k / count;
      const u = d.u0 + (d.u1 - d.u0) * t;
      const x = d.axis === 'x' ? u : v;
      const z = d.axis === 'x' ? v : u;
      pts.push({ x, y: d.y0 + (d.y1 - d.y0) * t, z });
    }
    return pts;
  }

  _frame(b) {
    return this._frames.get(b) ?? null;
  }

  _toWorld(b, x, z) {
    const f = this._frame(b);
    return f ? rotatePoint(f, x, z) : { x, z };
  }

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
   * миникарта и `_collectAnchors` для модулей v1-глав видят ровно прежние числа.
   */
  _worldRect(b, rect) {
    const f = this._frame(b);
    return f ? obbOf(rect, f) : rect;
  }

  _clip(a, b) {
    const minX = Math.max(a.minX, b.minX), maxX = Math.min(a.maxX, b.maxX);
    const minZ = Math.max(a.minZ, b.minZ), maxZ = Math.min(a.maxZ, b.maxZ);
    return maxX - minX > 1e-6 && maxZ - minZ > 1e-6 ? { minX, maxX, minZ, maxZ } : null;
  }

  /**
   * Точка внутри плана здания — по прямоугольникам частей, а не по габариту:
   * Г-образный дом держит двор внутри своего охвата, и он не «комната».
   *
   * Точка мировая (ею меряют наружный узел двери), а планы частей лежат в осях
   * дома, поэтому сначала разворот.
   *
   * Здесь, а не в `json-map.js`, потому что скелет улиц (§ 4.2 плана открытого
   * мира) отбирает ею наземные двери в Node: «дверь наружная» обязана означать
   * одно и то же у движка и у парсера, иначе гейт «скелет проходит каждую дверь»
   * мерил бы другой набор дверей, чем карта связывает ногами.
   */
  _inPlan(b, p) {
    const l = this._toLocal(b, p.x, p.z);
    return b.rects.some(r => l.x >= r.minX && l.x <= r.maxX && l.z >= r.minZ && l.z <= r.maxZ);
  }

  _collectBuildings() {
    for (const b of this.buildings) {
      if (!this._drawn(b)) continue;
      const frame = this._frame(b);
      const wallMat = b.facadeMaterial
        ? b.facadeMaterial + (b.wallColor ? `::${b.wallColor}` : '')
        : null;
      // Детальная визуальная модель (панелька из docs/houses): стены/плиты/кровля/
      // фундамент рендерятся отдельным мешем, но коллизии и навигация должны
      // остаться по данным здания — подавляем только картинку (_addGeo).
      const detailed = b.detailedVisual === 'soviet_panel';
      const prevMute = this._muteGeo;
      if (detailed) this._muteGeo = true;
      try {
        // Фундамент дома на неровной поверхности (baseY поднят до наивысшей точки
        // контакта, дом не зарывается). podium — плоский прямоугольный блок от
        // нижней точки земли до baseY (уходит в склон); terrain — низ следует
        // форме ландшафта (картинка/твёрдость ячейками по рельефу).
        // Для детальной панели terrain-фундамент не рисуем как ступенчатые earth-
        // блоки (визуал даёт модель), но солиды/blockers нужны для опоры на склоне.
        if (b.foundation === 'terrain') {
          const step = 2;
          for (const rect of b.rects) {
            const sx = rect.maxX - rect.minX, sz = rect.maxZ - rect.minZ;
            const nx = Math.max(1, Math.ceil(sx / step));
            const nz = Math.max(1, Math.ceil(sz / step));
            for (let i = 0; i < nx; i++) {
              for (let j = 0; j < nz; j++) {
                const x0 = rect.minX + (sx * i) / nx, x1 = rect.minX + (sx * (i + 1)) / nx;
                const z0 = rect.minZ + (sz * j) / nz, z1 = rect.minZ + (sz * (j + 1)) / nz;
                const wc = rotatePoint(frame, (x0 + x1) / 2, (z0 + z1) / 2);
                const th = this.relief ? this.relief.heightAt(wc.x, wc.z) : this.groundY;
                const y0 = Math.min(th, b.baseY - 0.01);
                if (b.baseY - y0 > 0.01) {
                  this._box({ minX: x0, maxX: x1, minZ: z0, maxZ: z1 }, y0, b.baseY, 'earth', { collide: true, frame });
                }
              }
            }
          }
        } else if (b.foundationBottomY != null && b.baseY - b.foundationBottomY > 0.01) {
          for (const rect of b.rects) {
            this._box(rect, b.foundationBottomY, b.baseY, 'earth', { collide: true, frame });
          }
        }
        for (const w of b.walls) this._wall(w, b, frame, wallMat);
        for (const r of b.rooms) this._floorPlate(b, r, frame);
        this._stair(b, frame);
        this._roof(b, frame);
      } finally {
        this._muteGeo = prevMute;
      }
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
  _wall(w, b, frame, material = null) {
    const plan = { minX: w.minX, maxX: w.maxX, minZ: w.minZ, maxZ: w.maxZ };
    if (!b.rooms.length) {
      this._wallBand({ ...plan, y0: b.baseY, y1: b.roofY }, b.doors, b.roofY - J.roofSeam, frame, material);
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
        this._wallBand({ ...plan, ...band, y0: Number(y), y1 }, b.doors, seam, frame, material);
      }
    }
  }

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
  _wallBand(band, doors, geoTop = null, frame = null, material = null) {
    const inBand = doors.filter(d =>
      d.y >= band.y0 - 0.01 && d.y < band.y1 - 0.01 && this._clip(band, d.rect));
    let pieces = [{ minX: band.minX, maxX: band.maxX, minZ: band.minZ, maxZ: band.maxZ }];
    for (const d of inBand) {
      const gap = this._clip(band, d.rect);
      pieces = pieces.flatMap(p => subtractRect(p, gap));
      if (d.y - band.y0 > 0.02) this._box(gap, band.y0, d.y, 'walls', { collide: true, frame, material });
      const head = d.y + (d.height ?? J.doorHeight);
      // перемычка доходит до верха полосы — шов только у той, что упирается в кровлю
      if (band.y1 - head > 0.02) this._box(gap, head, band.y1, 'walls', { collide: true, geoTop, frame, material });
    }
    for (const p of pieces) this._box(p, band.y0, band.y1, 'walls', { collide: true, geoTop, frame, material });
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
export function makePrism(axis, v0, v1, poly, frame = null) {
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
  const prism = {
    axis, v0, v1, poly, edges, planes, frame: frame ?? null,
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
  // мировой габарит нужен сетке планов: она отбирает кандидатов по клеткам и
  // обязана видеть, где призма лежит на карте, а узкая фаза всё равно считает
  // в осях профиля (`frame`)
  prism.world = frame
    ? rotatedBounds({ minX: prism.minX, maxX: prism.maxX, minZ: prism.minZ, maxZ: prism.maxZ }, frame)
    : null;
  return prism;
}

/**
 * Знаковое расстояние точки `(u, y)` до профиля: снаружи — до ближайшей точки
 * границы (вектор к ней), внутри — глубина до ближайшей грани (её наружная
 * нормаль). Вертикальный луч от центра сферы до дна призмы не доходит, поэтому
 * и направление, и величина берутся из одного и того же обхода рёбер.
 */
export function profileDistance(w, u, y) {
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
export function rayWedge(w, ox, oy, oz, dx, dy, dz) {
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-9) return null;
  dx /= len; dy /= len; dz /= len;
  // повёрнутая призма: луч переводится в её оси, а попадание и нормаль — обратно.
  // Поворот не меняет длин, поэтому `t` остаётся расстоянием в метрах
  if (w.frame) {
    const f = w.frame, o = unrotatePoint(f, ox, oz);
    const nx = dx * f.c + dz * f.s, nz = -dx * f.s + dz * f.c;
    const h = rayWedgeLocal(w, o.x, oy, o.z, nx, dy, nz);
    if (!h) return null;
    const p = rotatePoint(f, h.x, h.z);
    return {
      t: h.t, x: p.x, y: h.y, z: p.z,
      nx: h.nx * f.c - h.nz * f.s, ny: h.ny, nz: h.nx * f.s + h.nz * f.c,
    };
  }
  return rayWedgeLocal(w, ox, oy, oz, dx, dy, dz);
}

/** Пересечение луча с призмой в её собственных осях (слэбы по граням). */
export function rayWedgeLocal(w, ox, oy, oz, dx, dy, dz) {
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
export function pushOutWedge(c, r, w) {
  if (w.frame) {
    // центр переводится в оси призмы, выталкивание считается там же (профиль и
    // ширина — её собственные), а результат — обратно
    const l = unrotatePoint(w.frame, c.x, c.z);
    const p = { x: l.x, y: c.y, z: l.z };
    if (!pushOutWedgeLocal(p, r, w)) return false;
    const q = rotatePoint(w.frame, p.x, p.z);
    c.x = q.x; c.z = q.z; c.y = p.y;
    return true;
  }
  return pushOutWedgeLocal(c, r, w);
}

export function pushOutWedgeLocal(c, r, w) {
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

/**
 * Бракуют ли перила пластины тело в точке: расстояние в плане — до стенки в её
 * собственных осях, а пояс по высоте — из профиля **под ближайшей точкой**, а не
 * из габарита: у съезда с перепадом 12 м коробка «от низа до верха» перекрыла бы
 * улицу, идущую под его верхним концом.
 */
export function railWedgeBlocks(w, x, z, r, feetY, height) {
  const p = w.frame ? unrotatePoint(w.frame, x, z) : { x, z };
  const isX = w.axis === 'x';
  const u = isX ? p.x : p.z, v = isX ? p.z : p.x;
  const d = Math.hypot(Math.max(0, w.lo - u, u - w.hi), Math.max(0, w.v0 - v, v - w.v1));
  if (d >= r) return false;
  const top = w.topAt(Math.min(w.hi, Math.max(w.lo, u)));
  if (top === null) return false;
  const bottom = top - J.railHeight;
  return !(top <= feetY + 0.05 || bottom >= feetY + height - 0.05);
}

/**
 * Доли развёртки для нарезки ленты: ровная сетка ≤ `J.sweepSlice` плюс мелкие
 * полосы в обеих переходных зонах крена.
 *
 * Четырёхугольник ленты, у которого крен на концах разный, — седло: высота растёт
 * как произведение доли длины на отступ от осевой, и никакой диагональю двумя
 * плоскими треугольниками его не покрыть — зазор грани и точной поверхности
 * доходит до `Δкрен · ширина полотна`. Поэтому в переходе полоса мельчает ровно
 * настолько, чтобы этот зазор остался в `J.sweepRibbonTwist`: иначе картинка
 * разошлась бы с опорой именно там, где крен набирается.
 */
export function sweepFractions(s) {
  const absSpan = Math.abs(s.spanr);
  const pts = [0, 1];
  const coarse = Math.max(1, Math.ceil(absSpan / (J.sweepSlice * DEG)));
  for (let k = 1; k < coarse; k++) pts.push(k / coarse);
  if (s.transr > 0 && s.tanBank) {
    const nr = Math.max(2, Math.ceil(Math.abs(s.tanBank) * Math.PI * s.halfW / J.sweepRibbonTwist));
    const band = s.transr / absSpan / nr;
    for (let k = 0; k <= nr; k++) {
      pts.push(k * band);
      pts.push(1 - k * band);
    }
  }
  pts.sort((a, b) => a - b);
  const out = [];
  for (const f of pts) {
    if (!out.length || f - out[out.length - 1] > 1e-9) out.push(f);
  }
  return out;
}

/**
 * Верх полотна дуги под мировой точкой: null — точка вне сектора. Угол считается
 * `atan2(dz, dx)` — тем же обходом, что у `yaw` пластин, поэтому и развёртка
 * назад (`span < 0`) читается `arcDelta` без второй ветки арифметики.
 *
 * Подъём линеен по длине дуги, то есть по углу; крен — по отступу от осевой и по
 * тому же углу (`arcBankAt`: у торцов ноль, в середине авторский).
 */
export function sweepTopAt(s, x, z) {
  const dx = x - s.cx, dz = z - s.cz;
  const delta = arcDelta(Math.atan2(dz, dx), s.a0r, s.spanr);
  if (delta === null) return null;
  const rho = Math.hypot(dx, dz);
  if (Math.abs(rho - s.R) > s.halfW + 1e-9) return null;
  return s.y0 + (s.y1 - s.y0) * delta / s.spanr
    + arcBankAt(delta, s.spanr, s.tanBank, s.transr) * (rho - s.R);
}

/** Верх полотна на известных угле и радиусе (без обратного `atan2`). */
export function sweepSurfaceAt(s, ang, rho) {
  const delta = ang - s.a0r;
  return s.y0 + (s.y1 - s.y0) * delta / s.spanr
    + arcBankAt(delta, s.spanr, s.tanBank, s.transr) * (rho - s.R);
}

/**
 * Пояс перила дуги у кромки: стенка стоит на **краю** полотна (там, где полотно
 * уже ушло по крену), а не на осевой, и уходит в настил на `J.railSink` — иначе
 * её нижняя грань легла бы в одну плоскость с асфальтом.
 */
export function sweepRailBand(s, ang, rhoEdge) {
  const bottom = sweepSurfaceAt(s, ang, rhoEdge) - J.railSink;
  return { bottom, top: bottom + J.railHeight };
}

/** Ближайший торец развёртки: за её пределами стенка кончается плоским срезом. */
export function sweepEndAngle(s, x, z) {
  const d = a => Math.hypot(x - (s.cx + Math.cos(a) * s.R), z - (s.cz + Math.sin(a) * s.R));
  const a1 = s.a0r + s.spanr;
  return d(s.a0r) <= d(a1) ? s.a0r : a1;
}

/**
 * Бракуют ли перила дуги тело в точке. План стенки — кольцевая полоса, поэтому
 * ближайшая к центру точка берётся прижатием угла к развёртке, а радиуса — к
 * толщине; пояс по высоте — под этой точкой, а не «от низкого конца до высокого
 * на всю дугу», как у прежних коробок: иначе под верхним краем подъёма стена
 * отняла бы проход у того, кто идёт по земле под мостом.
 */
export function sweepRailsBlock(s, x, z, r, feetY, height) {
  const dx = x - s.cx, dz = z - s.cz;
  const rho = Math.hypot(dx, dz);
  const theta = Math.atan2(dz, dx);
  const inside = arcDelta(theta, s.a0r, s.spanr) !== null;
  const half = J.railThickness / 2;
  for (const side of [-1, 1]) {
    const rhoEdge = s.R + side * s.halfW;
    const ang = inside ? theta : sweepEndAngle(s, x, z);
    const rc = Math.min(rhoEdge + half, Math.max(rhoEdge - half, rho));
    const d = Math.hypot(x - (s.cx + Math.cos(ang) * rc), z - (s.cz + Math.sin(ang) * rc));
    if (d >= r) continue;
    const band = sweepRailBand(s, ang, rhoEdge);
    if (band.top <= feetY + 0.05 || band.bottom >= feetY + height - 0.05) continue;
    return true;
  }
  return false;
}

/**
 * Выталкивание сферы из стенки перила: сечение — прямоугольник в `(ρ, y)`, значит
 * расстояние раскладывается на радиальное и вертикальное, как у призмы
 * (`pushOutWedge`). Обе кромки полотна отстоят на `2 · halfW`, и радиус тела до
 * них не доходит, поэтому срабатывает не более одной стороны.
 *
 * @param {{x,y,z}} c центр (мутабельно)
 * @returns {boolean} сдвинули ли
 */
export function pushOutSweepRails(c, r, s) {
  const dx = c.x - s.cx, dz = c.z - s.cz;
  const rho = Math.hypot(dx, dz);
  const theta = Math.atan2(dz, dx);
  if (arcDelta(theta, s.a0r, s.spanr) === null) return false;
  const half = J.railThickness / 2;
  for (const side of [-1, 1]) {
    const rhoEdge = s.R + side * s.halfW;
    const band = sweepRailBand(s, theta, rhoEdge);
    const rMin = rhoEdge - half, rMax = rhoEdge + half;
    const dr = Math.max(0, rMin - rho, rho - rMax);
    const dy = Math.max(0, band.bottom - c.y, c.y - band.top);
    const k = rho > 1e-9 ? 1 / rho : 0;
    if (dr === 0 && dy === 0) {
      // центр внутри сечения: разводимся через наименьшую из двух глубин
      const penR = Math.min(rho - rMin, rMax - rho);
      const penY = Math.min(c.y - band.bottom, band.top - c.y);
      if (penR <= penY) {
        const shift = (r + penR) * (rho >= rhoEdge ? 1 : -1) * k;
        c.x += dx * shift; c.z += dz * shift;
      } else {
        c.y += (c.y >= (band.bottom + band.top) / 2 ? 1 : -1) * (r + penY);
      }
      return true;
    }
    const d = Math.hypot(dr, dy);
    if (d >= r) continue;
    const push = r - d;
    c.x += dx * (dr * push / d) * k;
    c.z += dz * (dr * push / d) * k;
    c.y += (c.y > band.top ? 1 : c.y < band.bottom ? -1 : 0) * push * dy / d;
    return true;
  }
  return false;
}

/**
 * Пересечение луча с лентой дуги: те же треугольники, что у меша, плюс грани
 * перил, если они у дуги есть (`hitTris`). Отклонение
 * от точной поверхности — хорда нарезки (≤ 3,8 см при 5° и R 40), поэтому луч
 * без трансцендентного `atan2` совпадает с картинкой, а опора ноги остаётся по
 * `topAt`. Направление обязано быть единичным — `t` в метрах.
 */
export function raySweep(s, ox, oy, oz, dx, dy, dz) {
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-9) return null;
  dx /= len; dy /= len; dz /= len;
  let best = null, bn = null;
  for (const { a, b, c, n } of (s.hitTris ?? s.tris)) {
    const t = rayTriangle(a, b, c, ox, oy, oz, dx, dy, dz);
    if (t !== null && t > 1e-6 && (!best || t < best)) { best = t; bn = n; }
  }
  if (best === null) return null;
  return {
    x: ox + dx * best, y: oy + dy * best, z: oz + dz * best,
    nx: bn[0], ny: bn[1], nz: bn[2], dist: best,
  };
}

/** Пересечение луча с треугольником (Мёллер–Трамбёр), `t` в метрах. */
export function rayTriangle(a, b, c, ox, oy, oz, dx, dy, dz) {
  const e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2];
  const e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
  const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-12) return null;
  const inv = 1 / det;
  const tx = ox - a[0], ty = oy - a[1], tz = oz - a[2];
  const u = (tx * px + ty * py + tz * pz) * inv;
  if (u < 0 || u > 1) return null;
  const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
  return t;
}

/**
 * Ближайшая к точке часть кольцевой плиты: планарное расстояние до сектора, верх
 * в этой точке и её план. Внутри сектора `dp = 0`; дальше — до радиальной кромки
 * (радиус прижат к полосе) или до торца развёртки, смотря что ближе.
 */
export function sweepNear(s, x, z) {
  const dx = x - s.cx, dz = z - s.cz;
  const rho = Math.hypot(dx, dz);
  const rMin = s.R - s.halfW, rMax = s.R + s.halfW;
  const delta = arcDelta(Math.atan2(dz, dx), s.a0r, s.spanr);
  if (delta !== null) {
    const rc = Math.min(rMax, Math.max(rMin, rho));
    const k = rho > 1e-9 ? rc / rho : 1;
    return {
      dp: Math.max(0, Math.abs(rho - s.R) - s.halfW),
      top: s.y0 + (s.y1 - s.y0) * delta / s.spanr
        + arcBankAt(delta, s.spanr, s.tanBank, s.transr) * (rc - s.R),
      px: s.cx + dx * k, pz: s.cz + dz * k,
    };
  }
  // вне развёртки: ближайший торец — отрезок от внутреннего радиуса к внешнему.
  // Крен на нём ровно ноль (переход начинается с торца), поэтому верх торца —
  // отметка оси без поправки на радиус
  let best = null;
  for (const [a, yEnd] of [[s.a0r, s.y0], [s.a0r + s.spanr, s.y1]]) {
    const ux = Math.cos(a), uz = Math.sin(a);
    const t = Math.min(rMax, Math.max(rMin, dx * ux + dz * uz));
    const px = s.cx + ux * t, pz = s.cz + uz * t;
    const dp = Math.hypot(x - px, z - pz);
    if (!best || dp < best.dp) {
      best = { dp, top: yEnd, px, pz };
    }
  }
  return best;
}

/**
 * Выталкивание сферы из кольцевой плиты по точному расстоянию до её поверхности:
 * центр снаружи сектора — по `hypot(планарное, вертикальное)`, внутри плиты — по
 * наименьшей из трёх глубин (вверх, вниз, к радиальной кромке). Пустой угол
 * габарита при этом не трогается вовсе: решает сектор, а не AABB.
 *
 * @param {{x,y,z}} c центр (мутабельно)
 * @returns {boolean} сдвинули ли
 */
export function pushOutSweep(c, r, s) {
  const n = sweepNear(s, c.x, c.z);
  const bot = n.top - J.deckThickness;
  const above = c.y > n.top, below = c.y < bot;
  if (n.dp === 0 && !above && !below) {
    // центр внутри объёма плиты: разводимся через наименьшую глубину
    const penUp = n.top - c.y + r;
    const penDown = c.y - bot + r;
    const rho = Math.hypot(c.x - s.cx, c.z - s.cz);
    const penSide = s.halfW - Math.abs(rho - s.R) + r;
    if (penUp <= penDown && penUp <= penSide) { c.y += penUp; return true; }
    if (penDown <= penSide) { c.y -= penDown; return true; }
    const dir = rho >= s.R ? 1 : -1;
    const k = rho > 1e-9 ? dir / rho : 0;
    c.x += (c.x - s.cx) * k * penSide;
    c.z += (c.z - s.cz) * k * penSide;
    return true;
  }
  const dy = above ? c.y - n.top : below ? bot - c.y : 0;
  const d = Math.hypot(n.dp, dy);
  if (d >= r || d < 1e-9) return false;
  const push = r - d;
  c.x += (c.x - n.px) / d * push;
  c.z += (c.z - n.pz) / d * push;
  c.y += (above ? 1 : below ? -1 : 0) * dy / d * push;
  return true;
}
