import { CONFIG } from './config.js';
import { NavGraph } from './nav-graph.js';
import { DATA_SINKS } from './surfaces.js';
import { JsonMap } from './json-map.js';

const J = CONFIG.jsonMap;

/** Коллекции чанка, которые читает картинка: у `JsonMap` они приходят прямо из
 *  брифа, у открытого мира — из файла клетки. */
const DRAWN_INPUTS = Object.freeze(['buildings', 'roads', 'channels', 'props', 'lights']);

/**
 * Данные стартовых клеток открытых глав, прочитанные до `createMap` (ключ — URL
 * файла). Кеш без вытеснения и на одну клетку главу: `build` обязан собрать тот
 * же мир при повторном заходе (сюита `level-contract` меряет число детей сцены
 * на двух сборках подряд), а второе чтение того же файла платило бы сетью за
 * каждый заход в главу. Цена памяти — один чанк на открытую главу реестра
 * (на клетке 200 м это 199 КБ в среднем, 350 КБ в худшем).
 *
 * @type {Map<string, object>}
 */
const startCells = new Map();

/**
 * Клетка, в которой стоит спавн (или первая из списка): одна арифметика на
 * предзагрузку и на карту — иначе движок читал бы файл одной клетки, а `build`
 * ставил другую.
 */
function startCellOf(cells, spawn) {
  for (const cell of cells) {
    const r = cell.rect;
    if (spawn && spawn.x >= r.minX && spawn.x <= r.maxX && spawn.z >= r.minZ && spawn.z <= r.maxZ) {
      return cell;
    }
  }
  return cells[0] ?? null;
}

/**
 * Читает файл стартовой клетки открытой главы — единственное чтение её данных
 * до синхронной сборки. Зовётся из `_loadLevel` рядом с `preloadMapAsset`:
 * контракт карты синхронный, поэтому `await` живёт в загрузке главы, а `build`
 * собирает клетку из уже прочитанного (`WorldMap.build`).
 *
 * Триггер — **данные** (`cells` и `catalog`), а не `kind`: глава без них не
 * платит ничего, и движок не знает номеров глав. Ошибка чтения летит наверх, в
 * `showLoadError` с повтором, — молча оставить мир пустым значило бы показать
 * игроку плиту без улицы и без объяснения.
 */
export async function preloadWorldCells(spec) {
  if (!spec?.catalog || !spec.cells?.length) return;
  const cell = startCellOf(spec.cells, spec.spawn);
  if (!cell) return;
  const url = `${spec.catalog}/${cell.file}`;
  if (startCells.has(url)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  startCells.set(url, await res.json());
}

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
 * - `isBuiltAt(x, z)` — **четвёртый опциональный член контракта**: тот же
 *   предикат, но названный, потому что движку нужен именно он, а не «стена»:
 *   `bounds` (габарит загруженного содержимого) на гнутом окне накрывает
 *   незастроенные углы своего AABB, а `isBlocked` истинен и там, где тело
 *   легально висит на фасаде (замеры — § 6, этап 5);
 * - `bounds` — габарит загруженного содержимого (AABB объединения клеток): им
 *   HUD отсекает метку точки B, упёршуюся за окно, и им же меряется, насколько
 *   дисковое окно `keep · chunk + ahead` шире своего габарита;
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
 *
 * Достройка растягивается на кадры (`streamStep`, третий опциональный член
 * контракта): клетка — не атом, а список естественных атомов, из которых
 * дороже всего `commit` (пересборка мирового набора и индексов; цена ∝
 * площади загруженного окна) и картинка. Метод ничего не возвращает и не
 * сдвигает мир, поэтому кадр симуляции не пропускается — в отличие от окна
 * главы 4 (план § 4.4, § 5.3).
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
    // здесь. Вопросов у него два, и оба обязательны: «клетка загружена» снимает
    // узел выгруженной клетки сразу (граф только дополняется, узел остаётся в
    // списке), а достижимость от спавна — изолированный карман, который AGENTS
    // запрещает держать в сети. На фикстуре 600 м это 3 узла из 10 113 без
    // единого ребра: по одной загруженности `navFit` считал их годными, и враг,
    // севший туда, стоял на месте (§ 10.12 плана, вариант (а)). Пересчёт —
    // отдельный срез (`reach`), а не работа внутри `commit`: всё, что помпа
    // делает вне среза, не попадает ни в её меру, ни в бюджет кадра.
    /** @type {Uint8Array} узел достижим от спавна по загруженному графу */
    this.reach = new Uint8Array(0);
    this.navFit = (idx) => this.reach[idx] === 1
      && this.isBuiltAt(this.nav.pos[idx].x, this.nav.pos[idx].z);
    // Состояние помпы (§ 4.4 плана). `task` — одна клетка в работе: достройка
    // идёт по одной, потому что `commit` (набор + индексы) платит полную цену
    // окна за раз, и две «половинки» в одном кадра стоили бы двух перестроек.
    // `requests` — файлы, которые читаются: сеть и `JSON.parse` вне бюджета
    // кадра, поэтому у них своя очередь и своя мера.
    this.pump = {
      task: null,
      /** @type {Map<string, {data: object|null, t0: number}>} id -> читалка клетки */
      requests: new Map(),
      /** @type {Map<string, number>} метка среза -> мс: **худшая из измеренных**
       *  цен среза этим же мире, им помпа решает «этот срез в кадр уже не
       *  влезет» (см. `streamStep`). EMA для гейта отвергнут: он разрешает
       *  начать срез, цена которого потом окажется хвостом распределения, и
       *  накопление кадра вылезало за просьбу движка (замер гейта § 7.2 п. 3 —
       *  13,9 мс при просьбе 12). Худшая цена даёт предел по построению:
       *  каждый начатый после первого срез гарантированно в него влезает */
      costWorst: new Map(),
      radius: 0,
      stats: {
        slices: 0, built: 0, unloaded: 0, dropped: 0, errors: 0,
        fetches: 0, fetchMs: 0, fetchWorstMs: 0,
        worstSliceMs: 0, worstSlice: null,
        worstChunkMs: 0, worstChunk: null,
        startedAt: null, firstChunkMs: null,
        /** @type {Array<object>} последние 64 завершённых достроек/выгрузок;
         *  `kind: 'start'` — стартовая клетка, собранная синхронно в `build`
         *  тем же конвейером срезов, поэтому мера у неё полная */
        chunks: [],
      },
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
    if (this.loaded && !this.isBuiltAt(x, z)) return true;
    return super.isBlocked(x, z, radius, feetY, height);
  }

  /**
   * Четвёртый опциональный член контракта: клетка под точкой **застроена** —
   * её опоры, меши и узлы графа есть (границы прямоугольника включены).
   *
   * Движку нужен именно этот вопрос, и ни один из двух прежних ответов его не
   * даёт (замеры — § 6, этап 5; маршрут гнутый, сторона 150 м, 8 тел с
   * настоящим ИИ):
   * - `bounds` — AABB объединения загруженных клеток, а окно дисковое
   *   (`keep · chunk + ahead`), поэтому на гнутом маршруте габарит накрывает
   *   незастроенные углы: **3 732 из 15 688** образцов тела вне застроенной
   *   клетки лежат внутри `bounds` (23,8 %) — их правило по габариту не сняло
   *   бы вовсе;
   * - `isBlocked(своей позиции)` — достаточный признак дыры (все 15 689
   *   образцов другой секции того же маршрута истинны), но не необходимый: тот
   *   же ответ дают тела, легально висящие на фасаде. На главе 12, где
   *   стриминга нет и снимаемых вообще быть не может, проба истинна на
   *   **2 054 и 643 из 18 000** кадров-тел (два прогона: маршрут врагов
   *   стохастичен, как и вынесенный из вердикта `model-level`-флейк), из них
   *   почти всё — Чужой в состоянии «на опоре» (не на перевале: 1 974 и 625),
   *   а подряд до **1 776 и 479** кадров; на фикстуре внутри застроенных
   *   клеток — 3 934 из 15 812 тем же прогоном. Правило «снимать, если
   *   `isBlocked`» стирало бы легальных Чужих в тысячах кадров, а не в одном.
   */
  isBuiltAt(x, z) {
    for (const entry of this.loaded.values()) {
      const r = entry.cell.rect;
      if (x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ) return true;
    }
    return false;
  }

  // ------------------------------------------------------------- жизненный цикл

  /**
   * Сцена, в которую клетки ставят свои меши, и **стартовая клетка** в ней.
   *
   * Клетка спавна обязана быть построена здесь, а не первым кадром помпы:
   * `_buildLevel` ставит тела сразу после `build` — `Enemies` берёт узлы от
   * `map.spawn`, `ExitGoal` опору точки B, `Player` — пол под ногами. На пустом
   * мире все трое остались бы без опоры (замер этапа 6: узлов 0,
   * `isBlocked(spawn)` истинен, `isBuiltAt(spawn)` ложен), а первый кадр помпы
   * случается только после захвата курсора, то есть за интертитром.
   *
   * Данные читает `preloadWorldCells` до `createMap` — контракт карты синхронный
   * (правило «внешние ассеты» AGENTS.md). Без предзагрузки мир начинает пустым:
   * так меряет сюита открытого мира, которая строит клетки сама и в своём
   * порядке.
   *
   * Срезы клетки идут **тем же** конвейером с мерой, что и у помпы
   * (`_runSlice`), а не голым `slice.run()`: иначе первый кадр помпы начинался
   * бы с пустой `costWorst`, и все немеряные метки прошли бы в один кадр —
   * замер этапа 6 на главе 14: кадр 50,6 мс при просьбе движка 12 и потолке
   * главы 40 (`data` + `commit` 21,1 + первая полоса решётки). Здесь же клетка
   * попадает в `stats` (`kind: 'start'`), поэтому «время до играбельного окна»
   * и накопленная цена достройки считаются одним кодом для обоих путей.
   */
  build(scene) {
    this.scene = scene;
    const cell = this.spawnCell();
    const data = cell && this.catalog ? startCells.get(`${this.catalog}/${cell.file}`) : null;
    if (!data) return;
    const { slices } = this._buildSlices(cell.id, data);
    this._runTask(cell.id, 'start', slices);
  }

  /** Снимает всё, что поставили клетки; сцена главы при этом пересоздаётся. */
  dispose() {
    // незавершённая задача и очередь чтения снимаются первыми: их срезы
    // строили бы меши в уже выброшенную сцену, а разрешённый `fetch` позднее
    // оставил бы в куче данные клетки, которой больше нет. Это единственное
    // место, где задача бросается недделанной, и оно безопасно ровно потому,
    // что мир целиком уходит (`_syncTask` для остальных случаев)
    if (this.pump.task) {
      this.pump.stats.dropped += 1;
      this.pump.task = null;
    }
    this.pump.requests.clear();
    for (const id of [...this.loaded.keys()]) this.unloadChunk(id);
    this.scene = null;
  }

  // ------------------------------------------------------------------ миникарта

  /**
   * План открытого мира — **вся плита**, а не окно вокруг игрока: охват ровно
   * тот же, что у `worldToNormalized`, поэтому метки HUD (враги, кузовы, точка
   * B, сам игрок) ложатся на план пиксель в пиксель.
   *
   * Локальное окно `JsonMap` обошлось бы здесь двумя дефектами, и оба мерятся
   * числом (§ 6, этап 5): масштаб плана и масштаб меток разошлись бы в
   * `viewHalf / range = 324 / 130` = **2,49** раза (0,77 против 1,93 м/пиксель),
   * а «этаж плана», который `JsonMap` выбирает по ближайшей загруженной плите,
   * переключился бы **2 раза за пеший маршрут** (0 плит → 13 → 26, отметка
   * 0 → 0,04 м) — то есть план прыгал бы на каждом шаге окна, а это ровно
   * критерий этапа 5.
   */
  _minimapView() {
    return { cx: 0, cz: 0, range: this.viewHalf };
  }

  /**
   * План рисуется по компактному слою `index.js` (оси дорог скелета), а
   * загруженность клеток — поверх. Плит пола, стен и маршей здесь нет не по
   * лени: они существуют только у загруженных клеток, и план начал бы
   * перестраиваться на каждом шаге окна.
   *
   * Граница клетки меняет цвет **один раз** за достройку и не двигается вовсе,
   * поэтому «дыра в застроенном» читается на плане как квадрат, а не как
   * мелкий шум: окно дисковое (`keep · chunk + ahead`), а `bounds` — его AABB,
   * и угловые клетки внутри габарита бывают незастроенными (мера — § 6, этап 5).
   */
  drawMinimap(ctx, size, playerPos) {
    const { cx, cz, range } = this._minimapView(playerPos);
    const k = size / (2 * range);
    const toPx = (x, z) => [(x - cx + range) * k, (z - cz + range) * k];

    ctx.fillStyle = '#12161c';
    ctx.fillRect(0, 0, size, size);

    for (const cell of this.cells) {
      const r = cell.rect;
      const [x0, z0] = toPx(r.minX, r.minZ);
      const [x1, z1] = toPx(r.maxX, r.maxZ);
      ctx.fillStyle = this.loaded.has(cell.id) ? 'rgba(72,86,104,.55)' : 'rgba(20,24,30,.7)';
      ctx.fillRect(x0, z0, Math.max(x1 - x0, 1), Math.max(z1 - z0, 1));
    }

    const sk = this.skeleton;
    if (sk) {
      ctx.strokeStyle = 'rgba(150,200,236,.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [i, j] of sk.edges) {
        const a = sk.nodes[i];
        const b = sk.nodes[j];
        if (!a || !b) continue;
        const [ax, az] = toPx(a[0], a[2]);
        const [bx, bz] = toPx(b[0], b[2]);
        ctx.moveTo(ax, az);
        ctx.lineTo(bx, bz);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255,255,255,.14)';
    ctx.lineWidth = 1;
    for (const cell of this.cells) {
      const r = cell.rect;
      const [x0, z0] = toPx(r.minX, r.minZ);
      const [x1, z1] = toPx(r.maxX, r.maxZ);
      ctx.strokeRect(x0, z0, x1 - x0, z1 - z0);
    }
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
   * Здесь помпы нет: прогон всех срезов подряд даёт ровно те же вызовы и в том
   * же порядке, что и до этапа 4, поэтому числа этапа 3 (§ 6.3 плана) остаются
   * числами этого метода.
   *
   * @param {string} id клетка из `cells[]`
   * @param {object} data содержимое `chunk-<i>-<j>.json` (подрезанный бриф)
   */
  applyChunk(id, data) {
    const cell = this.cellById.get(id);
    if (!cell) throw new Error(`клетки '${id}' нет в index.js`);
    if (!this.scene) throw new Error(`WorldMap.applyChunk('${id}'): сцены нет — вызывать после build(scene)`);
    // помпа могла держать эту клетку в работе: прямой вызов её доделывает, а не
    // начинает второй раз (см. `_syncTask`)
    this._syncTask(id);
    if (this.loaded.has(id)) return this.loaded.get(id);
    this.pump.requests.delete(id);
    const { entry, slices } = this._buildSlices(id, data);
    this._runTask(id, 'build', slices);
    return entry;
  }

  /** Выгрузку клетки: меши сняты и `dispose()`-нуты, набор и индексы пересобраны. */
  unloadChunk(id) {
    const had = this.loaded.has(id);
    this._syncTask(id);
    if (!this.loaded.has(id)) return had;
    this._runTask(id, 'unload', this._unloadSlices(id));
    return true;
  }

  /**
   * Задача целиком в этом же вызове — синхронная точка входа (`build`,
   * `applyChunk`, `unloadChunk`) идёт **тем же** конвейером с мерой, что и
   * помпа. Иначе `costWorst` и `stats` зависели бы от того, кто строил клетку:
   * голый `slice.run()` не оставляет ни цены метки (первый кадр помпы тогда
   * слепой, замер этапа 6 — 50,6 мс при просьбе 12), ни записи в `chunks`.
   */
  _runTask(id, kind, slices, readAt = undefined) {
    this.pump.task = {
      id, kind, slices, sliceTotal: slices.length, sliceDone: 0,
      startedAt: performance.now(), readAt,
    };
    this._syncTask(id);
  }

  /**
   * Доделать начатую помпой задачу этой клетки до конца и вернуть, была ли она.
   *
   * Бросать её нельзя именно потому, что прямой вызов — точка синхронизации
   * тестов и движка: после `commit` записи клетки уже в мировом наборе, и
   * второй `_buildSlices` удвоил бы их, а снятая на середине выгрузка оставила
   * бы клетку в `loaded` без мешей — и то, и другое не видно ни в одном члене
   * контракта, кроме `isBlocked` без картинки.
   */
  _syncTask(id) {
    const task = this.pump.task;
    if (!task || task.id !== id) return false;
    while (task.slices.length) this._runSlice(task.slices[0]);
    return true;
  }

  // ------------------------------------------------------------- срезы достройки

  /**
   * Клетка, разложенная на **естественные атомы** — на то, что нельзя разорвать,
   * не трогая общий код `JsonMap`/`SolidField` и не вводя вторую арифметику
   * опоры. Порядок ровно тот, что держал `applyChunk` до этапа 4, и срез — ровно
   * один прежний вызов, поэтому список даёт ту же сеть и ту же картинку, а
   * помпа вправе выполнить за кадр только его начало.
   *
   * Цены срезов меряются гейтом § 7.2 п. 3 на этой же фикстуре (клетка 200 м,
   * окно ≤ 4 клетки, 6 достроек + 2 выгрузки за прогон; шесть прогонов этого
   * захода): медиана…хвост — `commit` 13,7…39,0 мс, `picture` 5,1…25,0 мс,
   * `geometry` 2,6…10,9 мс, одна полоса решётки `lattice` 4,3…14,9 мс; `data`,
   * фазы графа и `counters` в худшие три метки не попадают, то есть дешевле
   * `geometry`. Из этого следуют два предела, и оба — данные, а не надежда:
   * `budgetMs` не может быть меньше хвоста `commit` (он ∝ **площади загруженного
   * окна**, а не размеру клетки — § 6.4, и именно его держит открытое решение
   * § 10.14), а число полос держит цену решётки — самой длинной разделимой
   * работы одной клетки.
   *
   * Клетка между `commit` и `picture` несколько кадров **проходима, но не
   * нарисована**: порядок срезов выбран так, потому что решётка ставит узлы
   * только по закоммиченной твёрдости (обратный порядок дал бы 0 узлов на
   * полосе — мера отменена на этапе 3, § 6.3.1), а `isBlocked`/`navFit` держат
   * предикат «данные закоммичены» и не заводят третьего состояния. Поп-ин на
   * 3…6 кадров (мера `unbuiltFrames` того же гейта — кадры, где клетка под
   * ногами уже закоммичена, но картинки ещё нет) — осознанная цена: «голый
   * грунт» за границей чанка отвергнут (§ 5.6) как раз потому, что опора
   * расходилась бы с картинкой.
   *
   * @returns {{entry: object, slices: Array<{label: string, run: function}>}}
   */
  _buildSlices(id, data) {
    const cell = this.cellById.get(id);
    if (!cell) throw new Error(`клетки '${id}' нет в index.js`);
    const entry = { cell, data, records: null, owned: new Set(), pic: null, counts: {} };
    const slices = [];

    // 1. данные клетки: твёрдость, опоры и проходы — по всем участникам,
    //    геометрия глушится (она нужна картинке и только владельцам)
    slices.push({ label: 'data', run: () => {
      entry.records = this.collectPass(data, { sinks: DATA_SINKS, geo: null });
      for (const key of DRAWN_INPUTS) {
        for (const rec of data[key] ?? []) if (rec.owner === true) entry.owned.add(rec);
      }
    } });

    // 2. мировой набор и все четыре индекса — атом, который резать нельзя:
    //    `indexSolids()` перетирает индекс целиком, а `_indexSurfaces`/
    //    `_indexBlockers`/`_indexPlans` не очищают его вовсе, поэтому «новые
    //    списки + старый индекс» дали бы врущие пробы на несколько кадров
    slices.push({ label: 'commit', run: () => {
      this.loaded.set(id, entry);
      this._rebuildWorld();
    } });

    // 3. решётка этой клетки полосами: цена ∝ площадь, и только она делает
    //    клетку дороже кадра — полосы покрывают её ровно теми же индексами
    for (const strip of this._latticeStrips(cell.rect)) {
      slices.push({ label: 'lattice', run: () => this._navLattice(this.nav, strip) });
    }

    // 4. фазы связывания — по одной на срез (худшая из мерявшихся, `_navRooms`,
    //    стоит 6,7 мс на заполненном окне)
    slices.push(...this._navPassSlices());

    // 5. картинка в два среза, потому что это **два** естественных атома: сбор
    //    геометрии владельцев (`collectPass` с `geo`) и сборка мешей
    //    (`_buildPicture` с её `mergeGeometries`). Разрыв между ними не виден
    //    контракту: `entry.pic` появляется только вторым срезом, а группы лежат
    //    в записи клетки и ни в каком мировом наборе. Те же сборщики, но
    //    геометрия и свет — только владельцам (дом на шве лежит в данных обеих
    //    клеток, а нарисуется один раз), пробы рядов идут по мировому полю,
    //    собранному срезом 2
    slices.push({ label: 'geometry', run: () => {
      const groups = this._geoGroups();
      const pass = this.collectPass(data, { sinks: ['waterRects'], geo: groups, owners: true, own: entry.owned });
      entry.groups = groups;
      entry.waterRects = pass.waterRects;
    } });
    slices.push({ label: 'picture', run: () => {
      entry.pic = this._drawOwnersOnly(
        () => this._buildPicture(this.scene, entry.groups, cell.rect, entry.waterRects), entry.owned);
    } });

    // 6. счётчики выводимых рядов — по загруженным клеткам
    slices.push({ label: 'counters', run: () => {
      entry.counts = { windows: entry.pic.windows, signage: entry.pic.signage, clutter: entry.pic.clutter };
      this._sumCounters();
    } });

    // 7. достижимость от спавна — последним, потому что обход обязан видеть все
    //    узлы и рёбра клетки: раньше `counters` их больше не появится, а раньше
    //    фаз графа клетка ещё не связана с соседями и обход пришлось бы повторить
    slices.push({ label: 'reach', run: () => this._markReachable() });

    return { entry, slices };
  }

  /**
   * Полосы решётки, покрывающие клетку **ровно теми же** целыми индексами
   * мировой решётки, что и один вызов `_navLattice` на неё целиком: отсчёт идёт
   * индексами (`ceil` снизу, `floor` сверху — та же арифметика внутри
   * `_navLattice`), поэтому набор узлов и рёбер от числа полос не зависит, а
   * обвязка на один индекс за край берёт соседнюю полосу по ключу — та и
   * создаст ребро, если её очередь ещё не пришла.
   */
  _latticeStrips(rect) {
    const step = J.navStep;
    const rows = Math.max(1, Math.round(J.pump.latticeRows));
    const n = Math.floor(this.width / step);
    const j0 = Math.max(0, Math.ceil((rect.minZ + this.half) / step));
    const j1 = Math.min(n, Math.floor((rect.maxZ + this.half) / step));
    const out = [];
    for (let a = j0; a <= j1; a += rows) {
      const b = Math.min(j1, a + rows - 1);
      out.push({
        minX: rect.minX, maxX: rect.maxX,
        minZ: -this.half + a * step, maxZ: -this.half + b * step,
      });
    }
    return out;
  }

  /**
   * Фазы графа по одной: каждая идемпотентна (ключ узла + дедуп рёбер), поэтому
   * разрыв между ними стоит ровно «часть рёбер ещё не создана», но не второй
   * копией узла. `seal()` — отдельный срез, потому что буферы поиска sized by
   * узлам и `add` их не растит: пропущенный `seal` оставил бы BFS гонять
   * очередь по кругу.
   */
  _navPassSlices() {
    const nav = this.nav;
    const rstep = J.navRoomStep;
    return [
      { label: 'rooms', run: () => this._navRooms(nav, rstep) },
      { label: 'roofs', run: () => this._navRoofs(nav) },
      { label: 'stairs', run: () => this._navStairs(nav, rstep) },
      { label: 'decks', run: () => this._navDecks(nav) },
      { label: 'water', run: () => this._navWater(nav) },
      { label: 'doors', run: () => this._navDoors(nav, rstep) },
      { label: 'seal', run: () => nav.seal() },
    ];
  }

  /** Срезы выгрузки: снятие мешей и `dispose()` отдельно от перестройки набора. */
  _unloadSlices(id) {
    const entry = this.loaded.get(id);
    if (!entry) return [];
    const out = [];
    // достроенная наполовину клетка ещё не рисовалась: снимать нечего, а
    // `_release` по null развалил бы и без того редкий путь
    if (entry.pic) out.push({ label: 'release', run: () => this._release(entry.pic.objs, entry.pic.lights) });
    out.push({ label: 'commit', run: () => {
      this.loaded.delete(id);
      this._rebuildWorld();
      this._sumCounters();
    } });
    // выгрузка тоже рвёт связность: узел, потерявший единственного соседа,
    // становится одиноким, и обход обязан это увидеть (вариант (б) § 10.12 —
    // браковка по нулевой степени — такого случая не отличает вовсе)
    out.push({ label: 'reach', run: () => this._markReachable() });
    return out;
  }

  /**
   * Один BFS достижимости от спавна по загруженному графу — вариант (а) § 10.12.
   *
   * Зачем он нужен: `_pruneToSpawn`, которым `JsonMap` отсекает изолированные
   * карманы при сборке целого мира, открытому миру недоступен — граф append-only,
   * и карман появляется не только при достройке (решёточный узел, которому
   * `_navLattice` не создал рёбер), но и при выгрузке соседа, когда связный узел
   * остаётся один. Браковка по нулевой степени (вариант (б)) дешевле и на
   * фикстуре даёт те же три узла, но молчит на кармане из двух и более.
   *
   * Цена измерена (`.tmp/orphan-bfs.mjs`, окно 3×3): 0,25…0,91 мс, медиана
   * 0,39 мс при 10 113 узлах и 18 407 рёбрах — 3,5 мс на круг из девяти достроек
   * против 709 мс их синхронной работы (0,5 %). Поэтому обход идёт одним срезом:
   * резать его на полосы значило бы держать состояние «обход не закончен»,
   * которого ни один член контракта не объясняет.
   *
   * Старт ищется **без** `navFit`: этот предикат и есть массив `reach`, поэтому
   * до первого обхода годных узлов нет вовсе, и поиск с ним не нашёл бы ничего.
   */
  _markReachable() {
    const nav = this.nav;
    const n = nav.pos.length;
    if (this.reach.length < n) {
      const grown = new Uint8Array(n);
      grown.set(this.reach);
      this.reach = grown;
    }
    this.reach.fill(0);
    const inCell = (idx) => this.isBuiltAt(nav.pos[idx].x, nav.pos[idx].z);
    const start = nav.nearestNode(this.spawn.x, this.spawn.y ?? 0, this.spawn.z, inCell);
    if (start < 0) return;
    const queue = [start];
    this.reach[start] = 1;
    for (let head = 0; head < queue.length; head++) {
      for (const nb of nav.adj[queue[head]]) {
        // через узел выгруженной клетки путь не идёт: он остался в списке, но
        // опираться на него нельзя — `isBlocked` там истинен
        if (this.reach[nb] === 1 || !inCell(nb)) continue;
        this.reach[nb] = 1;
        queue.push(nb);
      }
    }
  }

  /**
   * Читает файл клетки и строит её. Единственный асинхронный член класса:
   * контракт карты синхронный, поэтому `await` живёт до вызова (`_loadLevel` и
   * помпа этапа 4), а `applyChunk` — всегда синхронный.
   */
  async loadChunk(id) {
    if (this.loaded.has(id)) return this.loaded.get(id);
    return this.applyChunk(id, await this._readCell(id));
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
    return startCellOf(this.cells, this.spawn);
  }

  // ------------------------------------------------------------------- помпа

  /**
   * Третий опциональный член контракта (план § 4.4): движок зовёт её каждый
   * кадр **до физики**, карта сама решает, что достроить и что выгрузить, тратит
   * не больше бюджета и ничего не возвращает — мир не сдвигается, и кадр
   * симуляции не пропускается (в отличие от `updateStreaming` главы 4, где
   * перестройка окна стоила кадра).
   *
   * Правила, и каждое — из замера § 6.4:
   *
   * - окно одно для достройки и выгрузки: `keep · chunk + ahead(speed)`.
   *   Отдельного «радиуса выгрузки» нет, а есть запас `J.pump.unloadMargin`:
   *   без него тело на границе клетки платило бы перестройкой мира (3…26 мс)
   *   за каждый шаг туда-сюда;
   * - бюджет кадра — меньшее из двух: просьба движка (сколько кадра 60 Гц он
   *   готов отдать) и `stream.budgetMs` главы. Данные ограничивают машину, а
   *   не наоборот, иначе глава с медленным железом краснела бы по правилу,
   *   которого автор не выбирал;
   * - срез начинается, только если его **худшая из измеренных** цена по этому
   *   же срезу в этом же мире влезает в остаток бюджета. Первый срез кадра
   *   выполняется всегда: `commit` дороже любого честного бюджета, и с запретом
   *   «начинать то, что не влезет» мир не построился бы никогда. Худшая, а не
   *   средняя: EMA разрешал начать полосу решётки, цена которой потом оказывалась
   *   хвостом распределения, и накопление вылезало за просьбу движка (замер
   *   гейта § 7.2 п. 3 — 13,9 мс при просьбе 12);
   * - в работе одна клетка, ближайшая к телу: две «половинки» означали бы две
   *   перестройки набора в кадре, а набор — самый дорогой атом.
   *
   * Что помпа **не** обещает: что за кадр влезет целая клетка. На клетке 200 м
   * их 22 (1 + commit + 9 полос решётки + 7 фаз графа + geometry + picture +
   * counters + reach), поэтому клетка достраивается несколько кадров — по замеру
   * гейта § 7.2 п. 3 wall-clock худшей клетки 92…231 мс, и всё это время она
   * проходима, но ещё не нарисована (поп-ин 3…6 кадров, см. `_buildSlices`).
   * Последние кадры достройки клетка ещё и не годна для графа: `reach` считает
   * достижимость от спавна последним срезом, и до него её новые узлы `navFit`
   * бракует — враг не сядет в клетку, чья связность ещё не проверена.
   *
   * Что она обещает вместо этого: кадр либо укладывается в просьбу движка, либо
   * состоит из **одного** неразделимого среза, начавшего его (`commit`
   * 13,7…39,0 мс или `picture` 5,1…25,0 мс). Это и есть предел
   * `stream.budgetMs` главы: после первого среза кадра следующий начинается,
   * только если его худшая из измеренных цена влезает в остаток, поэтому
   * накопление ≤ просьбы (замер — ≤ 11,8 мс при 12) и хвост кадра — это всегда
   * ровно один атом. Метка, которой ещё не мерили, считается не влезшей: на
   * холодном мире цен нет вовсе, и «не спрошено» читалось бы как «бесплатно»
   * (замер этапа 6 — кадр 50,6 мс при просьбе 12). Стартовую клетку поэтому
   * строит `build` тем же конвейером с мерой: первый кадр помпы движка знает
   * цену каждой метки, а не начинает окно вслепую.
   *
   * @param {number} budgetMs мс, которые движок готов отдать на этом кадре
   * @param {number} x мировая координата тела
   * @param {number} z мировая координата тела
   * @param {number} [speed] м/с: горизонтальная скорость тела — она выбирает
   *   между `stream.aheadMin` (пешком) и `stream.aheadMax` (на машине)
   */
  streamStep(budgetMs, x, z, speed = 0) {
    const budget = Math.min(budgetMs ?? this.stream.budgetMs, this.stream.budgetMs);
    const radius = this._windowRadius(speed);
    this.pump.radius = radius;
    const want = this._windowCells(x, z, radius);
    console.error('[WM-DEBUG] streamStep: want=', want.length, 'radius=', radius.toFixed(0), 'loaded=', this.loaded.size, 'task=', this.pump.task?.id);
    this._prefetch(want, radius, x, z);
    const started = performance.now();
    let run = 0;
    for (;;) {
      const slice = this._nextSlice(x, z, radius, want);
      if (!slice) break;
      const est = this.pump.costWorst.get(slice.label);
      // немеряная метка — тоже «не влезет»: обещание кадра («либо в просьбу,
      // либо один атом») иначе ложно на холодном мире, где цен ещё нет вовсе.
      // Замер этапа 6: первый кадр помпы после `build` без меры стоил 50,6 мс
      // при просьбе 12 — `data`, `commit` 21,1 и полоса решётки прошли подряд,
      // потому что условие `est !== undefined` их не спрашивало
      if (run > 0 && (est === undefined || performance.now() - started + est > budget)) break;
      this._runSlice(slice);
      run += 1;
    }
  }

  /** Радиус окна: удержание плюс упреждение, линейно растущий от `aheadMin` при
   *  `CONFIG.speed.run` до `aheadMax` при `CONFIG.car.maxSpeed` (§ 4.4: иначе
   *  машина въезжает в незастроенную клетку раньше, чем та достроится). */
  _windowRadius(speed = 0) {
    const s = this.stream;
    const from = CONFIG.speed.run;
    const to = CONFIG.car.maxSpeed;
    const k = to > from ? Math.min(1, Math.max(0, (Math.abs(speed) - from) / (to - from))) : 1;
    return s.keep * s.chunk + s.aheadMin + (s.aheadMax - s.aheadMin) * k;
  }

  /** Расстояние от мировой точки до прямоугольника клетки: 0 внутри и на шве —
   *  окно растёт слоями, а не «домами вдали». */
  _distToRect(x, z, r) {
    const dx = Math.max(r.minX - x, 0, x - r.maxX);
    const dz = Math.max(r.minZ - z, 0, z - r.maxZ);
    return Math.hypot(dx, dz);
  }

  _cellDistance(x, z, id) {
    const cell = this.cellById.get(id);
    return cell ? this._distToRect(x, z, cell.rect) : Infinity;
  }

  /** Клетки окна, ближайшие первыми (при равных расстояниях — по id, чтобы
   *  порядок достройки не зависел от порядка обхода `cells[]`).
   *
   * Обход всех клеток на каждый кадр — O(число клеток): на 10 км² клетки по
   * 300 м это ~1 100 итераций арифметики за кадр, доля миллисекунды, и она
   * окупается тем, что окно не держит второй правды о том, где игрок. */
  _windowCells(x, z, radius) {
    const out = [];
    for (const cell of this.cells) {
      const d = this._distToRect(x, z, cell.rect);
      if (d <= radius) out.push({ cell, d });
    }
    out.sort((a, b) => a.d - b.d || (a.cell.id < b.cell.id ? -1 : a.cell.id > b.cell.id ? 1 : 0));
    return out;
  }

  /** Файлы, которые стоит прочитать: не больше `J.pump.fetchMax` за раз.
   *  Сеть и разбор вне бюджета кадра, но не вне кадра вовсе — их цена
   *  (`stats.fetchWorstMs`) мерится здесь же.
   *
   *  сюда же попадает и уборка очереди: разобранный JSON клетки, выехавшей за
   *  `discard`, больше не будет построен (его сюда не позовут), а без снятия
   *  `requests` рос бы как след всего пройденного маршрута — ~700 КБ на клетку.
   *  Снимается только то, чего нет в `loaded` и в работе: держатель у прочитанной
   *  клетки один — эта очередь. */
  _prefetch(want, radius, x, z) {
    const pump = this.pump;
    const discard = radius + J.pump.unloadMargin;
    for (const id of [...pump.requests.keys()]) {
      if (pump.task && pump.task.id === id) continue;
      if (this._cellDistance(x, z, id) > discard) pump.requests.delete(id);
    }
    let reading = 0;
    for (const req of pump.requests.values()) if (req.data === null) reading += 1;
    for (const { cell } of want) {
      if (reading >= J.pump.fetchMax) break;
      // клетка в работе уже прочитана: запрос снят при создании задачи
      // (`_nextSlice`), а `loaded` появится только срезом `commit`, поэтому без
      // этой проверки окно между ними звало бы второй `fetch` той же клетки —
      // замер этапа 6: 7 чтений на 4 построенные клетки, и три «готовых» запроса
      // висели в очереди после того, как помпа успокоилась
      if (pump.task?.id === cell.id) continue;
      if (this.loaded.has(cell.id) || pump.requests.has(cell.id)) continue;
      this._fetchCell(cell.id);
      reading += 1;
    }
  }

  /** wall-clock чтения одного файла: сеть + `JSON.parse`. */
  async _readCell(id) {
    const url = this.chunkUrl(id);
    const t0 = performance.now();
    console.error('[WM-DEBUG] _readCell fetch start, url=', url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url}: ${res.status}`);
      return await res.json();
    } finally {
      const ms = performance.now() - t0;
      console.error('[WM-DEBUG] _readCell fetch done, url=', url, 'ms=', ms.toFixed(0));
      const st = this.pump.stats;
      st.fetches += 1;
      st.fetchMs += ms;
      if (ms > st.fetchWorstMs) st.fetchWorstMs = ms;
    }
  }

  /** Запрос файла клетки с сохранением результата в очередь помпы. Ошибка
   *  снимает запрос, а не чистит окно: следующий кадр попробует снова, а
   *  молчаливый отказ здесь означал бы «мир за углом не построился» без
   *  объяснения ни в HUD, ни в `stats`. */
  _fetchCell(id) {
    const req = { data: null, t0: performance.now() };
    this.pump.requests.set(id, req);
    console.error('[WM-DEBUG] _fetchCell start, id=', id, 'url=', this.chunkUrl(id));
    this._readCell(id).then(
      (data) => { req.data = data; console.error('[WM-DEBUG] _fetchCell done, id=', id); },
      (e) => {
        const st = this.pump.stats;
        st.errors += 1;
        st.lastError = String(e?.message ?? e);
        this.pump.requests.delete(id);
      },
    );
  }

  /** Важнейший сейчас срез или `null`, если делать нечего: сначала достройка
   *  ближайшей клетки, чьи данные уже прочитаны, потом — самая дальняя клетка
   *  за запасом выгрузки.
   *
   * Начатая задача **всегда доделывается до конца** и не снимается даже тогда,
   *  когда её клетка уехала из окна. Причина не экономия, а состояние: между
   *  `commit` и `picture` клетка уже твёрдая, но ещё не нарисованная, и у
   *  половину задачи нет третьего члена, который вернул бы её в окно, —
   *  сброшенная после `commit` достройка оставила бы невидимое, но непроходимое
   *  тело навсегда (клетка в `loaded`, значит `want` её больше не зовёт). Цена
   *  правила конечна и измерена: одна задача — 20 срезов и 35…124 мс,
   *  растянутых на кадры.
   *
   * До этого правила проверка «задача уехала за `discard`» убивала выгрузку на
   *  корню: клетку-то выбирают именно за запасом, значит условие истинно всегда,
   *  и помпа на каждом кадре пересоздавала ту же задачу, снимала её и платила
   *  бюджет целиком, никогда не выгружая ничего (мера: 14,5 млн сбросов за
   *  прогон, `unloaded` 0, медианный кадр = весь бюджет).
   */
  _nextSlice(x, z, radius, want) {
    const pump = this.pump;
    if (pump.task) return pump.task.slices[0];
    for (const { cell } of want) {
      if (this.loaded.has(cell.id)) continue;
      const req = pump.requests.get(cell.id);
      if (!req || req.data === null) continue;
      const built = this._buildSlices(cell.id, req.data);
      pump.requests.delete(cell.id);
      pump.task = {
        id: cell.id, kind: 'build', slices: built.slices, sliceTotal: built.slices.length,
        sliceDone: 0, startedAt: performance.now(), readAt: req.t0,
      };
      return pump.task.slices[0];
    }
    const discard = radius + J.pump.unloadMargin;
    let far = null;
    for (const id of this.loaded.keys()) {
      const d = this._cellDistance(x, z, id);
      if (d > discard && (!far || d > far.d)) far = { id, d };
    }
    if (far) {
      const slices = this._unloadSlices(far.id);
      pump.task = {
        id: far.id, kind: 'unload', slices, sliceTotal: slices.length,
        sliceDone: 0, startedAt: performance.now(), readAt: undefined,
      };
      return pump.task.slices[0];
    }
    return null;
  }

  /** Срез с мерой: худший срез кадра (гейт § 7.2 п. 3) и **худшая из измеренных**
   *  цена метки среза, по которой `streamStep` решает, останавливаться ли до
   *  следующего среза. Среднее для этого гейта отвергнуто: оно позволяет начать
   *  срез, чья цена — хвост распределения, и кадр полезнее просьбы движка
   *  (замер — 13,9 мс накопления при просьбе 12). */
  _runSlice(slice) {
    const pump = this.pump;
    const st = pump.stats;
    const task = pump.task;
    task.slices.shift();
    task.sliceDone += 1;
    const t0 = performance.now();
    slice.run();
    const ms = performance.now() - t0;
    if (st.startedAt === null) st.startedAt = t0;
    st.slices += 1;
    if (ms > st.worstSliceMs) {
      st.worstSliceMs = ms;
      st.worstSlice = `${task.kind}:${slice.label}`;
    }
    const prev = pump.costWorst.get(slice.label);
    // цена `commit` растёт с окном, и её максимум обязан уйти за новый предел
    // вместе с ней: держать среднее вместо максимума — значит каждый раз
    // начинать дорогой срез «вслепую»
    pump.costWorst.set(slice.label, prev === undefined ? ms : Math.max(prev, ms));
    if (!task.slices.length) this._finishTask();
  }

  /** Достройка или выгрузка закончена: wall-clock клетки и очередь мер, из
   *  которых назначаются пределы § 8 («время до худшего чанка», «время до
   *  играбельного окна»). */
  _finishTask() {
    const pump = this.pump;
    const task = pump.task;
    const st = pump.stats;
    if (st.startedAt === null) st.startedAt = task.startedAt;
    const now = performance.now();
    const ms = now - task.startedAt;
    // 'start' — та же достройка, только синхронная в `build`: счётчик и
    // `firstChunkMs` обязаны видеть обе, иначе «время до играбельного окна»
    // начиналось бы с первой клетки помпы, а не со стартовой
    if (task.kind !== 'unload') {
      st.built += 1;
      if (st.firstChunkMs === null) st.firstChunkMs = now - st.startedAt;
    } else {
      st.unloaded += 1;
    }
    if (ms > st.worstChunkMs) {
      st.worstChunkMs = ms;
      st.worstChunk = `${task.kind}:${task.id}`;
    }
    st.chunks.push({
      id: task.id, kind: task.kind, ms,
      slices: `${task.sliceDone}/${task.sliceTotal}`,
      // от запроса файла до готовой картинки — то, что видит игрок, включая
      // сеть и разбор, которые в бюджет кадра не входят
      sinceReadMs: task.readAt === undefined ? null : now - task.readAt,
      readyAtMs: now - st.startedAt,
    });
    if (st.chunks.length > 64) st.chunks.shift();
    pump.task = null;
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
