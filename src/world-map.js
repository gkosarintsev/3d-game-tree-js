import { CONFIG } from './config.js';
import { NavGraph } from './nav-graph.js';
import { DATA_SINKS } from './surfaces.js';
import { JsonMap } from './json-map.js';

const J = CONFIG.jsonMap;

/** Коллекции чанка, которые читает картинка: у `JsonMap` они приходят прямо из
 *  брифа, у открытого мира — из файла клетки. */
const DRAWN_INPUTS = Object.freeze(['buildings', 'roads', 'channels', 'props', 'lights']);

/**
 * Карта открытого мира: тот же `JsonMap`, но собранный не по плите, а по
 * загруженным клеткам.
 *
 * Причина одна и измерена (план docs/open-world-plan.md § 3): единственный этап
 * сборки, цена которого растёт с **площадью**, — решётка навигации. На 1,96 км²
 * она стоит 22 366 мс из 26 с конструктора, и ни один гейт «построить мир
 * целиком при загрузке» с такой ценой не проходит. Всё остальное растёт с
 * числом объектов, поэтому мир режется парсером на клетки (`stream.chunk`), и
 * каждая клетка — законный v2-бриф в **мировых** осях: её строят прежние фазы
 * прежними числами, второй арифметики опоры в этом файле нет.
 *
 * Что отсюда следует для контрактных членов:
 *
 * - `width`/`depth` — плита мира из `index.js` (за ней `isBlocked` истинен, как
 *   у любой другой карты), а не габарит окна: координаты чанка мировые, значит
 *   сдвигать тело при достройке нечем (прецедент главы 4 с `shiftWorld` здесь
 *   не воспроизводится);
 * - `isBlocked` дополнительно истинен **вне загруженных клеток** — незастроенная
 *   клетка не имеет ни опоры настилов, ни русла, ни графа, и «голый грунт» за
 *   её границей (§ 5.6 плана) отвергнут вместе с расхождением картинки и опоры;
 * - `bounds` — габарит загруженного содержимого: по нему `Enemies` снимает вне
 *   окна тех, кто остался в выгруженной клетке;
 * - граф **только дополняется** (`NavGraph.add` дедуплицирует узлы по ключу,
 *   `link` — рёбра), поэтому узел выгруженной клетки не удаляется, а помечается
 *   непригодным через `navFit`; `findPath`, `randomNavPoint` и `nearestNode`
 *   идут с этим предикатом.
 *
 * Клетка собирается двумя проходами одних и тех же сборщиков (`collectPass`):
 * проход данных даёт твёрдость, опоры и проходы **всем** участникам клетки
 * (дом, вставший на шов, иначе дал бы половину стены), проход картинки даёт меши
 * и свет **только владеющим** копиям (флаг `owner: true` ставит разрезка), и
 * потому дом на шве нарисован ровно один раз.
 */
export class WorldMap extends JsonMap {
  /**
   * @param {object} spec map-секция определения открытой главы (`index.js`):
   *   мировая плита, рельеф, `stream`, `cells[]` и скелет — без коллекций
   *   содержимого, которые лежат в файлах клеток
   */
  constructor(spec) {
    // Ни одной записи содержимого: `JsonMap` в конструкторе собрал бы по ним
    // весь мир, а смысл класса ровно в том, чтобы этого не делать.
    super(spec);
    this.stream = spec.stream;
    // Глобальная сеть улиц, русел и наружных дверей (`index.js`, § 4.2 плана):
    // узлы в мировых осях, рёбра проверены `edgeOk` на парсере. Конструктор
    // обязан её прочитать — это тот каркас, на который помпа (этап 4) цепляет
    // решётки загруженных клеток, и без него «мир связан до первой достройки»
    // было бы обещанием, а не данными.
    this.skeleton = spec.skeleton ?? null;
    this.catalog = spec.catalog ?? null;
    this.cells = spec.cells ?? [];
    this.cellById = new Map(this.cells.map((c) => [c.id, c]));
    /** @type {Map<string, {cell:object, data:object, records:object, owned:Set, pic:object, counts:object}>} */
    this.loaded = new Map();
    // `sceneObjects` у главы собирает `build()`, здесь их держат клетки
    this.sceneObjects = [];
    this.realLights = [];
    this.windowCount = 0;
    this.signageCount = 0;
    this.clutterCount = 0;
    // Граф пуст до первой клетки, поэтому предикат годности ставится один раз
    // здесь и отвечает «узел стоит в загруженной клетке» — маршрут через узел
    // выгруженной повёл бы врага туда, где `isBlocked` истинен.
    this.navFit = (idx) => {
      const p = this.nav.pos[idx];
      return this._loadedAt(p.x, p.z);
    };
    this._rebuildWorld();
  }

  // ------------------------------------------------------------------ контракт

  /**
   * Габарит загруженного содержимого — по нему движок снимает врагов вне окна
   * (§ 4.4 плана). Отдельного поля «габарит мира» нет: `JsonMap` в конструкторе
   * кладёт в `bounds` мировой габарит содержимого из `index.js`, им же держится
   * обзорная камера `_buildLevel` до первой клетки — пустой прямоугольник она
   * увидеть не имеет права.
   */
  get bounds() {
    return this._bounds;
  }

  set bounds(v) {
    this._bounds = v;
  }

  /** Проходимость: базовая проба плюс запрет на незастроенную клетку. */
  isBlocked(x, z, radius = CONFIG.radius, feetY = 0, height = CONFIG.eyeHeight) {
    // `loaded` появляется после `super(spec)`, а базовый конструктор ещё ничего
    // не знает о клетках: до первой из них проходимость — обычная `JsonMap`
    if (this.loaded && !this._loadedAt(x, z)) return true;
    return super.isBlocked(x, z, radius, feetY, height);
  }

  /** Лежит ли точка в прямоугольнике загруженной клетки (границы включены). */
  _loadedAt(x, z) {
    for (const entry of this.loaded.values()) {
      const r = entry.cell.rect;
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return true;
    }
    return false;
  }

  // ------------------------------------------------------------- жизненный цикл

  /** Сцена, в которую клетки ставят свои меши. */
  build(scene) {
    this.scene = scene;
  }

  /** Снимает всё, что поставили клетки; сцена главы при этом пересоздаётся. */
  dispose() {
    for (const id of [...this.loaded.keys()]) this.unloadChunk(id);
    this.scene = null;
  }

  // ------------------------------------------------------------------ клетки

  /** Порядок клеток для слияния — канонический, каким их вывел парсер. */
  _order() {
    return this.cells.filter((c) => this.loaded.has(c.id)).map((c) => c.id);
  }

  /**
   * Один чанк целиком: данные, картинка, граф и индексы.
   *
   * Идемпотентен: повторный вызов той же клетки — пустая работа, а не второй
   * слой мешей. Порядок достройки на результат не влияет — мировой набор
   * пересобирается из `cells[]` (§ 7.2 п. 8 плана), а граф дополняется ключами.
   *
   * @param {string} id клетка из `cells[]`
   * @param {object} data содержимое `chunk-<i>-<j>.json` (подрезанный бриф)
   */
  applyChunk(id, data) {
    const cell = this.cellById.get(id);
    if (!cell) throw new Error(`клетки '${id}' нет в index.js`);
    if (!this.scene) throw new Error(`WorldMap.applyChunk('${id}'): сцены нет — вызывать после build(scene)`);
    if (this.loaded.has(id)) return this.loaded.get(id);

    // 1. данные клетки: твёрдость, опоры и проходы — по всем участникам,
    //    геометрия глушится (она нужна второму проходу и только владельцам)
    const records = this.collectPass(data, { sinks: DATA_SINKS, geo: null });
    const owned = new Set();
    for (const key of DRAWN_INPUTS) {
      for (const rec of data[key] ?? []) if (rec.owner === true) owned.add(rec);
    }
    const entry = { cell, data, records, owned, pic: null, counts: {} };
    this.loaded.set(id, entry);

    // 2. мировой набор, индексы, решётка этой клетки и якоря
    this._rebuildWorld();
    this._navLattice(this.nav, cell.rect);
    this._navPasses();

    // 3. картинка: те же сборщики, но геометрия и свет — только владельцам
    //    клетки (дом на шве лежит в данных обеих, а нарисуется один раз), а
    //    пробы рядов идут по мировому полю, собранному шагом 2
    const groups = this._geoGroups();
    const pic = this._drawOwnersOnly(() => {
      const pass = this.collectPass(data, { sinks: ['waterRects'], geo: groups, owners: true, own: owned });
      return this._buildPicture(this.scene, groups, cell.rect, pass.waterRects);
    }, owned);
    entry.pic = pic;
    entry.counts = { windows: pic.windows, signage: pic.signage, clutter: pic.clutter };
    this._sumCounters();
    return entry;
  }

  /** Выгрузку клетки: меши сняты и `dispose()`-нуты, набор и индексы пересобраны. */
  unloadChunk(id) {
    const entry = this.loaded.get(id);
    if (!entry) return false;
    this._release(entry.pic.objs, entry.pic.lights);
    this.loaded.delete(id);
    this._rebuildWorld();
    this._sumCounters();
    return true;
  }

  /**
   * Читает файл клетки и строит её. Единственный асинхронный член класса:
   * контракт карты синхронный, поэтому `await` живёт до вызова (`_loadLevel` и
   * помпа этапа 4), а `applyChunk` — всегда синхронный.
   */
  async loadChunk(id) {
    if (this.loaded.has(id)) return this.loaded.get(id);
    const url = this.chunkUrl(id);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    return this.applyChunk(id, await res.json());
  }

  /** URL файла клетки: каталог из `index.js` плюс имя, выведенное разрезкой. */
  chunkUrl(id) {
    const cell = this.cellById.get(id);
    if (!cell) throw new Error(`клетки '${id}' нет в index.js`);
    if (!this.catalog) {
      throw new Error('index.js открытой главы без `catalog`: парсер обязан печатать путь каталога — '
        + 'движок не знает, где лежат файлы, и не должен догадываться');
    }
    return `${this.catalog}/${cell.file}`;
  }

  /** Клетка, к которой принадлежит мировая точка (или null). */
  cellAt(x, z) {
    for (const cell of this.cells) {
      const r = cell.rect;
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return cell;
    }
    return null;
  }

  /** Клетка, в которой стоит точка спавна, — первая, которую обязан построить движок. */
  spawnCell() {
    return this.cellAt(this.spawn.x, this.spawn.z) ?? this.cells[0] ?? null;
  }

  // ------------------------------------------------------------- пересборка мира

  /**
   * Склейка загруженных клеток в мировой набор и полная перестройка индексов.
   *
   * Слияние — конкатенация участников в каноническом порядке `cells[]`, а не
   * «чистка по чанку»: `indexSolids()` перетирает индекс целиком, а
   * `_indexSurfaces`/`_indexBlockers`/`_indexPlans` не очищают его вовсе, так что
   * второй вызов на растущем наборе удвоил бы каждую запись (§ 6.3.1 плана).
   * Полная перестройка держит детерминизм (разный порядок достройки даёт один и
   * тот же индекс) и не требует помнить, «кто куда положил» объект; её цена —
   * четыре обхода загруженного набора, измерена в конце этапа 3.
   *
   * Дубликаты участников по швам НЕ вычитаются: объект, попавший в k загруженных
   * клеток, лежит в поле k раз, и это цена монотонной выгрузки — исчезновение
   * одной клетки убирает ровно её записи (§ 4.1 плана).
   */
  _rebuildWorld() {
    const order = this._order();
    const take = (key, field) => {
      const out = [];
      for (const id of order) {
        const entry = this.loaded.get(id);
        const list = field ? entry.records[key] : (entry.data[key] ?? []);
        for (const rec of list) out.push(rec);
      }
      return out;
    };
    const inputs = { buildings: take('buildings'), roads: take('roads'), channels: take('channels') };
    this._setInputs(inputs);
    // Кеш кадров настила ключуется записью клетки: после `loaded.delete` он
    // остался бы единственным держателем её пластин и удерживал бы данные
    // выгруженной клетки в куче (`renderer.info.memory` этого не видит, поэтому
    // мера — число записей кеша). У глав 9–13 перестройки нет, и они его не платят.
    this._deckFrames = new Map();
    this.props = take('props');
    this.lightSpecs = take('lights');
    for (const key of DATA_SINKS) this[key] = take(key, true);
    this._indexPlans();
    this.indexSolids();
    this._indexSurfaces();
    this._indexBlockers();

    const b = this._boundsOf(order);
    this._bounds = b ?? this.spec.bounds;

    // Якоря (`openPositions`) считаются по загруженным клеткам, а не по плите:
    // решётка опоры ∝ площадь, и на 1,4 км² это 13 689 проб на каждую достройку.
    // Пересборка всего списка — цена детерминизма: та же точка в той же клетке
    // обязана отдавать тот же якорь, в каком бы порядке клетки ни строились.
    const anchors = [];
    for (const id of order) anchors.push(...super._collectAnchors(this.loaded.get(id).cell.rect));
    this.anchors = anchors;
  }

  /** Объединение прямоугольников загруженных клеток (null — ничего не загружено). */
  _boundsOf(order) {
    let b = null;
    for (const id of order) {
      const r = this.loaded.get(id).cell.rect;
      b = b
        ? {
          minX: Math.min(b.minX, r.minX), maxX: Math.max(b.maxX, r.maxX),
          minZ: Math.min(b.minZ, r.minZ), maxZ: Math.max(b.maxZ, r.maxZ),
        }
        : { ...r };
    }
    return b;
  }

  /** Фазы навигации по склеенному набору: все они идемпотентны (ключ узла + дедуп рёбер). */
  _navPasses() {
    const nav = this.nav;
    const rstep = J.navRoomStep;
    this._navRooms(nav, rstep);
    this._navRoofs(nav);
    this._navStairs(nav, rstep);
    this._navDecks(nav);
    this._navWater(nav);
    this._navDoors(nav, rstep);
    // Буферы поиска sized by узлам: `add` их не растит, а BFS по короткому
    // `_seen` молча перестал бы метить новые узлы и гонял бы очередь по кругу.
    nav.seal();
  }

  /** Суммарные счётчики выводимых рядов — по загруженным клеткам. */
  _sumCounters() {
    let w = 0, s = 0, c = 0;
    for (const entry of this.loaded.values()) {
      w += entry.counts.windows ?? 0;
      s += entry.counts.signage ?? 0;
      c += entry.counts.clutter ?? 0;
    }
    this.windowCount = w;
    this.signageCount = s;
    this.clutterCount = c;
  }

  // ------------------------------------------------------- переопределения фаз

  /**
   * Решётка улицы ставится по клеткам (`_navLattice(nav, rect)` при достройке),
   * а не по плите: обход всей плиты шагом 6 м — это тот этап, цену которого
   * открытый мир и снимает (§ 3.1 плана).
   */
  _buildNav() {
    return new NavGraph().seal();
  }

  /**
   * Пока идёт конструктор `JsonMap`, списка загруженных клеток ещё нет: он
   * появляется только после `super(spec)`, а обход плиты тогда стоил бы 13 689
   * проб по пустому миру. После первой клетки — `_collectAnchors(rect)` по каждой
   * загруженной.
   */
  _collectAnchors(rect = null) {
    return this.loaded ? super._collectAnchors(rect) : [];
  }
}

/**
 * Создаёт карту открытого мира по map-секции определения главы (`index.js`
 * каталога). Файлы клеток читаются по `catalog` + `cells[].file`.
 */
export function createWorldMap(spec) {
  return new WorldMap(spec);
}
