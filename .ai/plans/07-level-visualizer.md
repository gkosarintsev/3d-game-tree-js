# План: визуализатор уровней (level visualizer)

Дата: 2026-11-14. Статус: **план уточнён и принят к реализации; код не начат**.  
Связанный контекст: `.ai/plans/01-06`, `docs/architecture-level-pipeline.md`, `docs/architecture-json-levels.md`, `docs/open-world-plan.md`, `docs/architecture-map-contract.md`, `docs/architecture-testing.md`, `docs/editor-plan.md`, `docs/roads.html`, `src/level-bin.js`, `src/json-map.js` (`debugIds`), `src/world-map.js`, `tools/build-level.mjs`, `tools/chunk-level.mjs`, `tools/cityforge-compile.mjs`, `tools/normalize-level.mjs`, `tools/citygen/*`, `src/levels/index.js`, `src/levels/level-NN.json`, `src/levels/level-NN/*`.

## 0. Краткое решение

- **Форма:** отдельная dev-страница `tools/level-visualizer.html` + ES-модули `tools/visualizer/*.js`, без сборщика и npm-зависимостей. Three.js 0.160 — тем же importmap/CDN, что игра.
- **Данные:** инструмент читает **и исходный бриф** (`src/levels/level-NN.json`), **и собранный open-каталог** (`index.js`, `chunk-*.l14b`, `skeleton.l14b`, `generation-report.json`). Исходник грузится всегда (он лёгкий и даёт районы, anchors, JSON-pointer’ы), чанки — в режимах `compiled`/`compare`.
- **Охват:** 9 глав реестра — `07,08,09,10,15` (CityForge v3, без `generation-report.json` и без `generator.districts`) и `16,17,18,19` (v4 citygen, с отчётом). Для v3 районный слой и диагностика честно деградируют; для 16/17 авто-районы есть только в отчёте, без геометрии.
- **Режимы:** `source` (только авторские данные), `compiled` (то, что реально собрано; по умолчанию), `compare` (собранное + «объявлено, но не собрано» + сводка расхождений).
- **Основной вид:** план XZ сверху, ортогональная камера. Дополнительно: `front`/`side` (ортогональные проекции), `free` (orbit), фокус на объект и **фасад дома**, опционально секущая плоскость.
- **Происхождение:** цвет = **редактируемость**, штрих = характер происхождения, бейдж = «изменено стадией». Четыре класса: `authored` / `generated` / `derived` / `unknown` плюс статус `declared-missing` (red ghost в `compare`).
- **Районы:** границы из `generator.districts[].geometry` (rect/polygon). Для авто-районов `district_i_j` геометрия в каталоге и отчёте **не сохраняется** — это ограничение фиксируется честно, см. [TASK-005]/[TASK-009].
- **Метки:** DOM-пул с экранным declutter: приоритет, минимальная площадь на экране, бюджет, гистерезис; на отдалении — только районы/anchors/крупные дома, при приближении раскрываются дороги, пропы и узлы.
- **Проверка:** чистые функции — `node --test tools/visualizer/model.test.mjs`; опциональный браузерный smoke `tools/visualizer/smoke.mjs`; ручной чек-лист по level 19/18/16. Игровые тесты и пайплайн не меняются.

## 1. Цель, границы, критерии приёмки

### 1.1 Цель

Быстро понимать устройство главы без запуска игры: где дороги/рампы/мосты, какие дома и районы есть в данных, что сгенерировано, а что авторское, где расходятся бриф и сборка, и как выглядит фасад/разрез выбранного объекта.

### 1.2 Критерии приёмки (запрос владельца → проверка)

- [ ] **Основной вид — сверху (план).** Открытие страницы с `?level=19` даёт XZ-план всей плиты, подписи осей, масштабную линейку.
- [ ] **Виды по плоскостям/ортогональные.** `1` top, `2` front (XY), `3` side (ZY); переключение без потери выбора; `4` free (perspective orbit).
- [ ] **Свободный 3D-обзор.** Orbit/pan/zoom, высоты мостов и рамп читаются, здания экструдированы, слои переключаются.
- [ ] **Сетка настраиваемая и отключаемая.** Шаг `auto` (1-2-5) или фиксированный, охват «плита/вид/радиус», подписи координат, `G` — вкл/выкл.
- [ ] **Сгенерированное vs авторское.** Разные цвета и штрихи, легенда с числами, фильтры по классам, инспектор объясняет правило и JSON-pointer.
- [ ] **Границы районов.** Контуры и подписи из `generator.districts`; для отсутствующей геометрии — явное предупреждение, а не пустое место.
- [ ] **Удобный зум и переключение видов.** Зум к курсору, fit-all, `F` — фокус, `Shift+F` — фасад дома/профиль дороги, `Backspace` — назад, сохранение камеры в URL.
- [ ] **Метки без перегрузки.** На отдалении только крупные объекты; далёкие/мелкие скрыты; лимит и declutter; выбранная метка видна всегда.
- [ ] **Производительность.** Level 19 (16 чанков, ~1.3 МБ) открывается < 2.5 с локально; план ≥ 55 fps; смена главы не растит память.
- [ ] **Честность данных.** Никаких «додуманных» границ без пометки; `unknown` и `declared-missing` видны в отчёте; ошибки чанков не скрываются.

### 1.3 Не входит

- Редактирование и запись уровней, пересборка citygen в браузере, «второй редактор».
- Точная игровая картинка (текстуры, окна, декор, GLB-ассеты) и проверка коллизий/навигации как в движке.
- Legacy-главы `json`/`terrain`/`town`/`city` (v1/v2 без open-каталога) — только явное сообщение «не поддержано»; приоритет — v3/v4 `cityforge`/`open`.
- Замена `?debug=1` и `map.debugIds()`; визуализатор — отдельный инструмент.

### 1.4 Ограничения

- ES-модули, без сборщика; Three.js 0.160 из importmap; никаких новых npm-пакетов.
- Только чтение: не менять `src/levels/*`, `tools/build-level.mjs`, формат `.l14b`, контракт карты.
- Запуск по HTTP из корня репозитория (`python -m http.server 8124`), `file://` не работает из-за importmap.
- Все внешние строки (id, имена) вставлять через `textContent`, не `innerHTML`.

## 2. Проверенные факты репозитория (2026-11-14)

| Факт | Источник | Следствие для визуализатора |
|---|---|---|
| Level 19: плита 2560 м, 16 клеток 640 м, каталог 19 файлов (16 чанков + `index.js` + `skeleton.l14b` + `generation-report.json`), ~1.32 МБ без source | `src/levels/level-19/index.js`, `level-19/*.l14b` | Все чанки можно грузить целиком с прогрессом; ленивость — задел на будущее |
| В собранных чанках level 19: **28 уникальных домов**, **122 дороги**, **2626 пропов**, 1936 узлов / 1832 ребра скелета | прогон `decodeChunk`/`decodeSkeleton` (2026-11-14) | Голден-инварианты для тестов модели |
| 54 объекта level 19 встречаются в двух чанках; в каждой паре ровно одна копия имеет `owner: true`, вторая — без поля | прогон по 16 чанкам | Dedupe: `owner === true` — надёжный маркер владельца (число owner-объектов = unique); `index.cells[].objects` — это **instances**, не unique |
| В `index.cells[].objects` level 19: 35 домов, 169 дорог, 2626 пропов | `src/levels/level-19/index.js` | Сумма по клеткам — ровно число instances (включая копии на швах), её нельзя показывать как «уникальные» |
| Источник: 84 сегмента / 80 узлов дорог; отчёт финализации: 120 сегментов / 98 узлов; собранных дорог 122 | `level-19.json`, `generation-report.json` (`finalize_counts`), чанки | 58 id совпали точно, 62 — сплиты `*_a/_b`, 2 — `spawn_pad`/`exit_pad`; происхождение обязано учитывать сплиты |
| Все 84 исходных сегмента представлены в сборке (после снятия суффиксов сплитов) | прогон сопоставления | В `compare` нет «потерянных» дорог; это хороший тест-инвариант |
| 28 домов имеют id `b_d0_<n>`; отчёт: `buildings_generated: 28` | чанки, `generation-report.json` | Дома — сгенерированные; правятся параметрами района, а не объектом |
| Все 2626 пропов — `model: concrete_pillar`, `source: bridge_pillar`, id `pillar_<roadId>_x_z` | чанки, `src/props.js`, `tools/normalize-level.mjs` | Пропы — **производные** от авторских настилов, а не «сгенерированные citygen»; в отчёте `props: 0` |
| `generator.districts` level 19: один `d0/forest` с `geometry.rect` на всю плиту | `level-19.json` | Границы районов берутся из source; полная плита — нормальный случай |
| `generation-report.json.districts[]` содержит `id/type/profileId/cells/parcels/reservedParcels`, **без геометрии** | `level-16/17/18/19/generation-report.json` | У 16/17 — 16 авто-районов (`district_i_j`, `cells:1`); у 18/19 — один `d0` (`cells:0`); геометрии нет ни в отчёте, ни в чанках |
| Отчёт level 19: 18 repairs (`resolve_road_crossing`: `node` + `segments[]`), 5 warn-диагностик; level 16/17: repairs с `id` + `target`, 8/11 warn | прогон по отчётам | Парсер диагностики должен поддерживать разные наборы полей, а не только `id`/`to` |
| `cityforge.districts/blocks/parcels` — `SUPPORTED_EMPTY`; районы приходят только из v4 `generator.districts` | `tools/cityforge-compile.mjs` | Не искать границы в `cityforge.*` |
| `src/level-bin.js`: `decodeChunk`, `decodeSkeleton`, `CHUNK_EXT`, `SKELETON_FILE`; скелет — плоские массивы | `src/level-bin.js`, `index.js` level-19 | Использовать готовый кодек, свой декодер не писать |
| `index.js` каталога — ESM с top-level await загрузки скелета; в `map.skeleton` лежит `decodeSkeleton` | `src/levels/level-19/index.js:574` | Динамический `import()` каталога даёт и определение, и скелет; кэш модуля — учитывать при reload |
| Дороги в чанках: `decks[]` с `rect`/`obb`, `topY`, `topAtMin/Max`, `ramp`, `rails`, `width`, `length` | `tools/normalize-level.mjs`, чанк level 19 | Рисовать OBB и наклонные настилы, а не только AABB |
| Дома: `bounds`, `footprint`, `roofY`, `baseY`, `floorsCount`, `walls[]` (`facade`) | чанк level 19 | 3D-экструзия и выбор фасада — по `walls`/`footprint` |
| Источник объявляет `coordinateSystem.up: "Z"`, но данные — Y-up: `world.bounds` по Y −80…160, узлы `[x, y, z]`, `nb_b1 [−12,10,−50]` | `level-19.json` | Визуализатор нормализует в **Y-up** и показывает предупреждение о расхождении; формат не правим |
| Сплиты дорог дают id `*_a`/`*_b` (финализация пересечений), площадки — `spawn_pad`/`exit_pad`, столбы — `pillar_<road>…` | `tools/citygen/pipeline/stage-6-finalize.mjs:588`, `cityforge-compile.mjs`, `normalize-level.mjs:1753` | Правила `derived` с родителем, а не «сгенерировано» |
| Отчёт содержит `repairs[]` и `diagnostics[]` с разными наборами ссылок: `segments[]`, `node`, `id`, `target`, `from`/`to`, `anchor` | `level-16/17/18/19/generation-report.json` | Кликабельные диагностические маркеры и подсветка сегментов; извлекать **любые** известные поля, а не одно |
| Реестр глав — литерал `LEVEL_NUMBERS` в `src/levels/index.js` | `src/levels/index.js` | Список глав парсить текстом регуляркой; fallback — ввод номера |

### 2.1 Матрица поддержки и проверенные объёмы (2026-11-14)

Файлы глав — **с ведущим нулём**: `level-07.json`, `level-08.json`, `level-09.json`; загрузчик обязан делать
`level-${String(n).padStart(2, '0')}`, иначе 07–09 не найдутся. Все 9 глав — `kind: 'open'` в каталоге.

| Глава | Схема | Плита | Клетки | Source | Каталог: chunks / index / skeleton / report, КБ | Уникальные b/r/p/l/ch/t | Skeleton узлы/рёбра | Отчёт warn/repairs/diag | Районы |
|---|---|---|---|---|---|---|---|---|---|
| 07 | v3 | 1280 | 5×5×256 | 18 КБ | 25 / 11 / 12 / — | 1/10/146/0/0/1 | 360/358 | — | нет |
| 08 | v3 | 1280 | 5×5×256 | 43 КБ | 25 / 16 / 84 / — | 14/10/0/0/0/0 | 2611/2610 | — | нет |
| 09 | v3 | 1280 | 5×5×256 | 541 КБ | 25 / 16 / 71 / — | 892/10/0/0/0/0 | 2211/2210 | — | нет |
| 10 | v3 | 1280 | 5×5×256 | 57 КБ | 25 / 31 / 98 / — | 7/17/16/0/1/0 | 3065/3064 | — | нет |
| 15 | v3 | 1280 | 5×5×256 | 76 КБ | 25 / 32 / 97 / — | 27/23/16/0/1/1 | 3026/3024 | — | нет |
| 16 | v4 | 1280 | 5×5×256 | 4 КБ | 25 / 180 / 140 / 52 | 392/174/562/8/1/0 | 4388/4384 | 8/19/150 | 16 авто, без геометрии |
| 17 | v4 | 1280 | 2×2×640 | 4 КБ | 4 / 174 / 137 / 53 | 396/173/382/8/1/0 | 4292/4289 | 11/18/153 | 16 авто, без геометрии |
| 18 | v4 | 1280 | 2×2×640 | 10 КБ | 4 / 5 / 16 / 6 | 15/12/152/0/0/0 | 498/497 | 2/0/19 | 1 × `d0` rect |
| 19 | v4 | 2560 | 4×4×640 | 84 КБ | 16 / 13 / 61 / 15 | 28/122/2626/0/0/0 | 1936/1832 | 5/18/40 | 1 × `d0` rect |

`b/r/p/l/ch/t` = buildings / roads / props / lights / channels / tunnels; это **unique** после dedupe,
а не сумма по клеткам. Для 16/17 `channels` — русла, `tunnels` в каталоге отсутствуют; для 07/15 тоннель
приходит из source `structures.tunnels` и/или compiled `tunnels`.

**Замеры декодирования** (Node 24, тёплый процесс, `decodeChunk` всех чанков + `decodeSkeleton`):

| Глава | 07 | 08 | 09 | 10 | 15 | 16 | 17 | 18 | 19 |
|---|---|---|---|---|---|---|---|---|---|
| decode, мс | 9 | 10 | 17 | 9 | 7 | 18 | 9 | 3 | 18 |
| весь payload, МБ | 0.18 | 0.53 | 1.63 | 0.80 | 0.81 | 1.31 | 0.96 | 0.29 | 1.41 |

Холодный браузерный старт ожидаемо в 2–4 раза медленнее; бюджет §10 (ready < 2.5 с) всё равно
достижим, если чанки грузить конкурентно (4) и не ждать последовательно все 25.

**Что откуда берётся (не путать source и compiled):**

| Глава | Authored в source | Generated / derived в сборке | Особенности |
|---|---|---|---|
| 07 | 1 дом `spawn_house`, 6 сегментов / 9 узлов, тоннель `tunnel_mountain` | 10 дорог (6 exact + 2 pad + 2 `tunnel_*_pN`), 146 `pillar_*`, 1 тоннель | source `cityforge.chunks[]` — манифест `chunks/i_j/chunk.json`, **не** путь к `.l14b` |
| 08 | 14 домов `h8_*`, 8 сегментов | 10 дорог (8 + 2 pad), пропов нет | 32 дубля на швах |
| 09 | 892 дома `h9_*`, 8 сегментов | 10 дорог (8 + 2 pad) | самый большой source (541 КБ), 152 дубля |
| 10 | 7 домов, 16 сегментов | 17 дорог (16 exact + 1 `exit_pad`), 16 `pillar_*`, русло | `bounds` шире плиты (±645.885) — плита всё равно 1280 |
| 15 | 27 домов (`h15_*`, `tower_*`), 19 сегментов, тоннель `mountain_tunnel` | 23 дороги (19 exact + 2 pad + 2 `tunnel_*_pN`), 16 `pillar_*`, русло, 1 тоннель | `tower_*` и тоннель — отдельные слои |
| 16 | только metadata/generator; 0 дорог/домов/пропов | 392 дома `b_district_i_j_n`, 174 дороги `tr_*`, 562 пропа (202 pillar + 360 stage5), 8 `sl_*`, русло | 16 авто-районов только в отчёте |
| 17 | то же, 0 геометрии | 396 домов, 173 дороги, 382 пропа (24 pillar + 358 stage5), 8 `sl_*`, русло | 4 клетки 640; 9 дублей |
| 18 | 10 сегментов, `d0` rect, 0 домов | 15 домов `b_d0_*`, 12 дорог (10 source + 2 pad), 152 `pillar_*` | отчёт: `props: 0`, хотя 152 столба derived |
| 19 | 84 сегмента / 80 узлов, `d0` rect, 0 домов | 28 домов `b_d0_*`, 122 дороги (58 exact + 62 split + 2 pad), 2626 `pillar_*` | 54 дубля; 47 родительских дорог у столбов; 18 вложенных split-суффиксов |

**Проверенные ловушки данных:**

- `owner` — не «флаг копии», а маркер владельца: число объектов с `owner: true` **равно** unique
  (L19 2776, L16 1137, L17 960, L18 179, L07 158, L08 24, L09 902, L10 41, L15 68). Копии на шве
  владельца не имеют. Dedupe: сначала `owner === true`, иначе группировка по `(коллекция,id)`.
- `roads[].pillars` — **те же** объекты, что top-level `props` (L19: 2626 = 2626, L18: 152 = 152;
  вложенных вхождений 4656/330 из-за копий дорог). Рисовать и считать только top-level `props`,
  вложенные использовать для связи `parentId`, иначе двойной счёт и z-fighting.
- `props[].source: 'authored'` у `prop_<n>` (16/17) **врёт**: эти пропы создаёт stage 5. Правило —
  `^prop_\d+$` → `generated`.
- `generation-report.finalize_counts.buildings` — это до drops: L16 402 − 10 = 392, L17 403 − 7 = 396.
  `props` в отчёте — только stage-5 (360), без `pillar_*`: L16 360 + 202 = 562, L17 360 − 2 + 24 = 382.
- `metadata.notes` может отставать от данных (L19 пишет «без домов», а в сборке 28 домов) — не источник истины.
- `map.relief.hills[]` (`x,z,radius,height`, `baseY`, `cell`) — компактный рельеф для опционального слоя;
  это не коллизия и не точная игровая картинка.

## 3. Решения (ADR-стиль)

| ID | Решение | Почему |
|---|---|---|
| D1 | `tools/level-visualizer.html` + `tools/visualizer/*.js`, без сборщика | Рядом с пайплайном, не засоряет `src/`; открывается статическим сервером |
| D2 | Одна Three.js-сцена, три камеры (ortho top/front/side, perspective free), общий model | Не дублировать 2D/3D-отрисовку и не расходиться в геометрии |
| D3 | Исходник грузится **всегда**; чанки — по режиму | Исходник даёт районы, anchors, JSON-pointer’ы и диагностику; это дёшево (4–541 КБ) |
| D4 | `source` / `compiled` / `compare`; по умолчанию `compiled`, если `index.js` каталога существует, иначе `source` с баннером | Основной вопрос — «что реально собрано», но авторская правда рядом |
| D5 | Цвет = редактируемость; штрих = характер; бейдж = модификация | Не смешивать «сгенерировано» и «производно»; пользователь видит, что править |
| D6 | Сплиты авторской дороги наследуют `authored` + `parentId` | `eb_5_a` — та же редактируемая дорога `eb_5`, а не новый объект |
| D7 | Районы: rect/polygon из source; авто-районы — hull-подсказка с пометкой или пусто | Честность важнее красивой картинки; см. TASK-009 |
| D8 | Метки — свой DOM-пул, не CSS2DRenderer | Нужны экранные прямоугольники для declutter и бюджет; CSS2D всё равно не решает окклюзию |
| D9 | Подписи координат — по краям плиты/вида и в статусбаре, не на каждой линии | Сетка не должна конкурировать с метками объектов |
| D10 | Пикинг — экранный (polygon/polyline/point), не `Raycaster` | В плане тонкие линии и точки; экранный допуск 4–8 px надёжнее |
| D11 | Чистая модель без Three.js в `model.js` | Тестируется `node --test`, не тянет браузер |
| D12 | Никаких изменений пайплайна в рамках TASK-001…008 | Визуализатор read-only; экспорт районов — отдельное решение (TASK-009) |
| D13 | `owner === true` — первичный dedupe, `(kind,id)` — fallback | На каждый unique-объект ровно одна копия с `owner: true`; копии шва идут без поля |
| D14 | Вложенные `roads[].pillars` не рисуются отдельно | Это те же top-level `props`; иначе двойной счёт/мерцание, а связь с дорогой берём из `parentId` |
| D15 | Метки не заходят под панели/статусбар | Панели — DOM поверх canvas; без safe-area declutter считает невидимые пиксели занятыми |
| D16 | Рельеф — отдельный опциональный слой из `map.relief.hills` | Для 07/10/16 горы объясняют тоннели и уклоны, но это не коллизия и не игровой рендер |

## 4. Архитектура и файлы

```
tools/level-visualizer.html          — importmap, разметка панелей, подключение main.js/style.css
tools/visualizer/main.js             — bootstrap, URL state, связывание модулей
tools/visualizer/loader.js           — список глав, fetch source/report/index, decode chunks, прогресс/ошибки
tools/visualizer/model.js            — ЧИСТЫЙ: нормализация, dedupe, provenance, districts, matching, counts
tools/visualizer/grid.js             — ЧИСТЫЙ: шаг 1-2-5, генерация линий/подписей
tools/visualizer/labels.js           — приоритеты, eligibility, declutter, DOM-пул
tools/visualizer/views.js            — камеры, pan/zoom, fit/focus/facade, секущие плоскости, URL
tools/visualizer/render.js           — сцена, слои, геометрия дорог/домов/пропов/районов, подсветка
tools/visualizer/ui.js               — панель, легенда, фильтры, поиск, инспектор, диагностика, статус
tools/visualizer/style.css
tools/visualizer/model.test.mjs      — node:test (без Three)
tools/visualizer/smoke.mjs           — опционально: Playwright smoke
tools/visualizer/README.md           — запуск, режимы, легенда, горячие клавиши, ограничения
```

### 4.1 Поток данных

1. URL: `?level=19&mode=compiled&view=top&x=…&z=…&zoom=…&layers=…&labels=1&grid=1`.
2. `loader.js`: `fetch('../src/levels/index.js')` → regex `LEVEL_NUMBERS = [7, 8, …]`; при неудаче — числовой ввод.
   Валидные номера: `07,08,09,10,15,16,17,18,19`; имя файла — `String(n).padStart(2, '0')`.
3. Всегда: `fetch('../src/levels/level-NN.json')` → `source` (4–541 КБ). Ошибка source — фатальна:
   без него нет плиты, anchors и JSON-pointer’ов; показываем экран ошибки с URL и статусом.
4. `compiled`/`compare`: `await import('../src/levels/level-NN/index.js')` (даёт `map` + `skeleton`
   через top-level await), `fetch(new URL('./generation-report.json', indexUrl))` (404 допустим только для v3),
   затем чанки `new URL(cell.file, indexUrl)` → `decodeChunk`.
5. `model.js`: `buildModel({ source, compiled, report, level })` → единая модель.
6. `render.js`: группы слоёв; `ui.js`/`labels.js`/`grid.js` — представления модели.

#### 4.1.1 Загрузчик: фазы, ошибки, кэш

| Фаза | Что делает | Ошибка |
|---|---|---|
| `registry` | fetch `src/levels/index.js`, regex `LEVEL_NUMBERS`, fallback — числовой ввод | Показать ввод номера, не падать |
| `source` | fetch `level-NN.json`, проверка `kind: 'open'`, `ground.size`, `gameplay.spawn/exit` | Фатально: баннер с URL/статусом |
| `catalog` | динамический `import(index.js)`; взять `map.cells`, `map.catalog`, `map.skeleton` | Фатально для `compiled`; предложить `source` |
| `report` | fetch `generation-report.json`; для v3 — тихий `null` + бейдж «v3: отчёта нет» | Warn: рисуем остальное |
| `chunks` | 4 конкурентных `fetch` + `decodeChunk`; прогресс «N/M»; отмена при смене главы | Строка ошибки на файл; остальные чанки рисуются |

- `index.js` каталога в браузере сам грузит `skeleton.l14b` (fetch относительного URL) — отдельно
  скелет не качаем; после импорта используем только `map.skeleton`, не `this.level`.
- Кэш ESM: повторный выбор той же главы после пересборки требует hard refresh; кнопка **Reload**
  делает `import(indexUrl + '?v=' + Date.now())` и `fetch(..., { cache: 'no-store' })` для source/report/чанков.
  В README — явное предупреждение про Ctrl+F5.
- `map.catalog` — корневой путь (`/src/levels/level-19`); не склеивать его с `tools/`, иначе 404.
  `new URL(cell.file, indexUrl)` безопасен, потому что `indexUrl` уже в каталоге главы.
- Для v3 source `cityforge.chunks[]` — это манифест `chunks/i_j/chunk.json` (25 записей), а **не**
  фактические `.l14b`; источник путей к чанкам — только `map.cells[].file`.
- Ошибка одного чанка не отменяет сцену: чанк помечается красным, в статистике
  `loaded/total` и `failed[]`; `model.meta.warnings` получает запись.

### 4.2 Внутренняя модель (контракт модулей)

```js
{
  meta: {
    level: 19, mode: 'source'|'compiled'|'compare',
    plate: { size, minX, maxX, minZ, maxZ, groundY },
    bounds: { minX, minY, minZ, maxX, maxY, maxZ },
    spawn: { x, z }, exit: { x, z },
    coordinate: { engine: 'Y-up', declared: 'Z'|null, mismatch: true },
    report: { present, version, seed, stages, summary } | null,
    relief: { baseY, cell, hills: [...] } | null,
    gameplay: { goal, enemies, alienEnemies, cars } | null,
    warnings: [], files: [], phases: { registry, source, catalog, report, chunks }
  },
  entities: {
    roads: Map<id, Entity>, buildings: Map, props: Map, lights: Map,
    channels: Map, tunnels: Map, districts: Map, chunks: Map,
    nodes: Map, anchors: Map, cars: Map
  },
  skeleton: { nodes: Array<[x,y,z]>, edges: Array<[i,j]> },
  diagnostics: { list, byEntity: Map<id, Item[]>, counts: { warn, info, byCode } },
  sourceIndex: Map<id, { kind, pointer, raw }>,
  stats: { unique, instances, duplicates, byOrigin, byKind, decodeMs, buildMs, failedChunks }
}
```

```js
Entity = {
  id, kind,                       // 'road'|'building'|'prop'|'district'|'chunk'|'anchor'|'node'|...
  origin: 'authored'|'generated'|'derived'|'unknown',
  status: 'present'|'declared-missing'|'inferred',
  originRule,                     // 'source:/cityforge/.../segments/3', 'regex:^tr_', 'parent:eb_5'
  parentId: string|null,
  nestedFrom: 'road.pillars'|null,// вложенный объект, не рисовать отдельно
  sourcePointer: string|null,     // RFC 6901, например /cityforge/networks/roads/segments/3
  chunkIds: string[], ownerChunk: string|null,
  instances: number,              // сколько раз объект встретился в чанках
  geometry: Geometry,             // rect|obb|polygon|polyline|plate|arc|point|box|channel|hull
  attrs: object,
  bbox: { minX,minY,minZ,maxX,maxY,maxZ },
  labelPriority: number
}
```

### 4.3 Нормализация

- **Y-up**: `x`/`z` — план, `y` — высота. Если в source `coordinateSystem.up === 'Z'` — баннер «источник объявляет Z-up, данные читаются как Y-up (проверено по bounds/узлам)».
  `cityforge.world.bounds` — массив `[minX,minY,minZ]`/`[maxX,maxY,maxZ]`; Y — высота, несмотря на `up: "Z"`.
- Плита — `ground.size`, `ground.y` (1280 для 07–18, 2560 для 19); габарит содержимого — `cityforge.world.bounds` /
  `map.bounds`, он может быть шире плиты (10/15: X −645.885…643.186). Пределы камеры — по **плите**, не по bounds.
- Дороги: `decks[]` (rect или `obb: {cx,cz,hx,hz,c,s}`), `topY`, `topAtMin/topAtMax`, `ramp`, `rails`;
  `fill`/`aprons` — отдельные слои. `roads[].pillars` и `roads[].lamps` — вложенные массивы, не отдельные сущности.
- Дома: `footprint` (полигон) + `bounds` + `baseY`/`roofY`; `walls[]` — для выбора фасада (`facade: true`);
  `rects`/`rooms`/`stairs`/`doors` — опциональные под-слои, если пригодятся для фасада.
- Пропы/свет: точки + `scale`/`model`/`rotationY`. `props` — top-level; `roads[].pillars` только связь.
- Русла: `segments[].bed`, `walls`, `descents`, `holes`; тоннели — `points`.
- Скелет: `nodes`/`edges` в мировых метрах; узлы без id — синтетические `node:<i>` только для выбора/отладки.
  Для 16 skeleton — 4388 узлов (больше, чем в 19), поэтому `LineSegments` и frustum — обязательны.
- Чанк: `rect`, `objects`; слияние с декодированными `counts` и проверкой `objects` ↔ `counts`.
  `objects` — это instances: L19 35 домов / 169 дорог / 2626 пропов, а unique — 28/122/2626.
- Рельеф: `map.relief.hills[]` (`x,z,radius,height`) + `baseY`/`cell`; строим грубую сетку/контуры только для контекста.
- Source `cityforge.structures.tunnels[]` (07/15) и `cityforge.hydrology` (10/15/16/17) — источник для слоёв,
  если в compiled нет эквивалента; для 16/17 русла есть в `channels`.
- `cityforge.instances[]` пуст во всех главах; не полагаться на него.

## 5. Происхождение: правила, цвета, легенда

### 5.1 Определения

- **authored** — идентичность объявлена в source и не создана стадией: сегменты/узлы дорог, top-level `buildings`, авторские `props`/`lights`, `generator.districts`, `gameplay.spawn/exit`. Геометрия может быть собрана (deck), но правится source.
- **generated** — создано стадией citygen: `tr_*` (стадия 2), `b_<district>_<n>` (стадия 4), `sl_*`/`prop_*` (стадия 5), авто-районы `district_i_j` (стадия 3). В source объекта нет; правится параметрами/профилем.
- **derived** — детерминированное произведение компилятора/нормализатора: сплиты `*_a/_b`, `spawn_pad`/`exit_pad`, `pillar_<road>…`, скелет, клетки чанков, настилы как геометрия. Указывается `parentId`.
- **unknown** — не совпало ни с source, ни с известными правилами; серый + предупреждение, попадает в «Требует внимания».
- **declared-missing** — идентичность есть в source, но в сборке нет (только `compare`); красный ghost.

> Важно: **цвет отвечает на «что править»**, а не на «кто нарисовал пиксель». Сплит `eb_5_a` — `authored` с `parentId: eb_5` (геометрия производная). Столб `pillar_eb_5_…` — `derived` с родителем `eb_5`.

Районы — отдельный случай: `d0` (18/19) — `authored`, pointer `/generator/districts/0`, геометрия `geometry.rect`;
`district_i_j` (16/17) — `generated`, источник — `generation-report.json`, pointer `/districts/<i>`, геометрии нет.
Для 07–15 района нет вовсе: это не ошибка, а свойство v3; слой показывает «нет данных (v3)».

### 5.2 Таблица правил (порядок важен)

| Условие | origin | parent/pointer | Примечание |
|---|---|---|---|
| id точно в source (`roads.segments`, `buildings`, `props`, `lights`, districts) | authored | JSON-pointer | Геометрия — из сборки |
| id — сплит source-сегмента (`*_a`, `*_b`, в т.ч. вложенный `*_b_b`) | authored | base id (снимать суффиксы до конца) | Пометить `split` и `splitDepth`; не менять цвет; L19 62 split-объекта, 18 вложенных |
| `repairs[]` с кодом `duplicate_id_renamed` (`id` + `to`) | authored/generated по базе | `repairs.id` → `to` | Бейдж «переименован»; в текущих отчётах 16–19 такого кода нет, правило — на будущее |
| `repairs[].segments[]` (L19 `resolve_road_crossing`) | по сегментам | `node` | Бейдж «замечание», подсветка обоих сегментов |
| `/^spawn_pad$|^exit_pad$/` | derived | `gameplay.spawn/exit` | Площадки компилятора |
| `/^tunnel_(.+)_p\d+$/` | derived | tunnel id из группы 1 | Портальные площадки тоннеля: 07 `tunnel_mountain`, 15 `mountain_tunnel`; 2 шт. |
| `/^pillar_(.+)_(-?\d+(?:\.\d+)?)_(-?\d+(?:\.\d+)?)$/` | derived | road id из группы 1 | Столбы нормализатора; x/z могут быть дробными; 47 родительских дорог в L19 |
| `/^tr_/` | generated | стадия 2 | Дороги/узлы генератора |
| `/^b_(.+)_\d+$/` | generated | district id | Дом стадии 4: `b_d0_15`, `b_district_0_0_110` |
| `/^sl_\d+$/` | generated | стадия 5 | Фонари (только 16/17) |
| `/^prop_\d+$/` | generated | стадия 5 | Пропы; игнорировать `source: 'authored'` (16/17 — 360 шт.) |
| `/^district_\d+_\d+$/` | generated | стадия 3 | Авто-район, геометрии нет (16/17 — 16 шт.) |
| иначе в compiled | unknown | — | В отчёт «Требует внимания» |
| source-объект без compiled-пары | authored + `declared-missing` | pointer | Только `compare` |

Дополнительно: `diagnostics[]` может содержать `id`, `from`/`to`, `segments[]`, `node`, `anchor`, `target`;
`repairs[]` — `id`/`to`/`target`/`segments[]`/`node`. Все известные поля превращаются в ссылки
`byEntity`, бейдж «изменено/замечание»; `origin` при этом не меняется. Неизвестные поля сохраняются
в `attrs` и показываются в инспекторе, чтобы не терять новые коды отчёта.

`compare` не должен считать «потерянным» то, что компилятор создал законно: сплиты, `*_pad`,
`pillar_*`. Для source-дороги, представленной только сплитами, статус `present`, а не `declared-missing`.

### 5.3 Палитра и стили

| Класс | Цвет | Линия | Заливка |
|---|---|---|---|
| authored | `#4aa3ff` | solid 2 px | 14% |
| generated | `#ffae42` | dashed `[6,4]` | 12% |
| derived | `#b58cff` | dash-dot `[3,2,1,2]` | 8% |
| unknown | `#8b97a8` | dotted `[1,4]` | 6% |
| declared-missing | `#ff5c7a` | dashed 2 px | 0% (контур) |
| engine (chunks/skeleton) | `#5c6b7d` | 1 px, alpha 0.5 | 0% |
| selected | `#ffffff` | 3 px + halo | 20% |
| hover | `#6ff2ff` | 2 px | 10% |
| diagnostic | `#ff4d4f` | marker/ring | — |

Фон `#0d1117`, плита `#1b2430`/`#2e3d4f`, текст `#e6edf3`. Дороги по высоте не меняют цвет (иначе конфликт с provenance): высота показывается толщиной/подписью `+16 м` и в 3D. Легенда показывает цвет, штрих, число объектов и кликабельна как фильтр.

## 6. Виды и навигация

### 6.1 Камеры

| Вид | Проекция | Позиция/ориентация | Управление |
|---|---|---|---|
| `top` | ortho | взгляд −Y, `up = (0,0,-1)` (север — −Z) | wheel к курсору, MMB/RMB pan, LMB select |
| `front` | ortho | взгляд −Z, `up=(0,1,0)` | то же |
| `side` | ortho | взгляд −X, `up=(0,1,0)` | то же |
| `free` | perspective 55° | orbit вокруг цели | OrbitControls: LMB rotate, RMB pan, wheel zoom |

- `top`: орто-камера над `plate`; `left/right = ±halfW`, `top/bottom = ±halfW/aspect`, `near=0.1`, `far=plate*4`;
  цель — `(x, groundY, z)`, `up=(0,0,-1)` (север — −Z). `front`: взгляд −Z, `up=(0,1,0)`, ширина по X,
  высота по Y (плита + `maxY-minY`); `side`: взгляд −X, `up=(0,1,0)`, ширина по Z, высота по Y.
- `free`: perspective `fov=55`, `near=0.5`, `far=20000`, цель — центр плиты на `groundY`, дистанция `plate*0.9`.
- `fitAll()` — плита + 8% отступ **с учётом safe-area** (панели слева/справа сверху); `reset()` — `top` + fitAll.
- Зум ограничен: минимум — плита в кадре, максимум — 0.03 м/пиксель (в free — дистанция 5…`plate*3`).
- Зум к курсору: сохранять мировую точку под курсором; в ortho пересчитывать `left/right/top/bottom` от
  `zoom` и `target`; в free — двигать камеру вдоль луча к цели. Pan — MMB/RMB, `Shift+LMB` — pan в ortho.
- Плавный переход 180 мс, отменяется любым вводом; `prefers-reduced-motion` — без анимации.
- Масштабная линейка (1-2-5), координаты курсора, `м/пиксель` и `fps` — в статусбаре; URL обновляется throttle 200 мс.

### 6.2 Фокус и фасад

- `F` — fit bbox выбранного объекта (дом/дорога/район/чанк), с сохранением текущего вида.
- `Shift+F` для дома: выбрать `walls[]` с `facade: true`; при нескольких — ближайшую к камере, иначе самое длинное
  ребро `footprint`. Нормаль — наружу (по знаку от центра footprint), камера перпендикулярно стене,
  ortho-рамка `length × (roofY−baseY)` + 10%, `up=+Y`; в инспекторе — id, этажность, материал, высота,
  `rooms`/`doors` (если есть). Для 07 `spawn_house` высота 4 м, 1 этаж — рамка не должна схлопнуться.
- `Shift+F` для дороги: боковая проекция вдоль оси сегмента; подсветить профиль высот (`topAtMin/topAtMax`), ширину, слой, rails.
- `Backspace` — предыдущая камера/вид (стек 10), `Esc` — снять выбор.

### 6.3 Секущие плоскости (опционально в TASK-006)

- Горизонтальная `Y=const` (полезно для эстакад) и вертикальные `X`/`Z`.
- `renderer.localClippingEnabled`, плоскости на материалах; сетка/метки не клипаются, метки за плоскостью скрываются.
- Слайдер + числовой ввод, кнопка «показать плоскость»; только в `free`/`front`/`side`.

## 7. Сетка и координаты

- Шаг: `auto` (1-2-5) по формуле `raw = 90 px * metersPerPixel`, `step = nice125(raw)`; ручной выбор `1/5/10/25/50/100/250/500`.
- Малые линии — `step/5`, основные — `step`; оси `X=0`/`Z=0` толще; подписи — на пересечениях с краем плиты/вида (не на каждой линии), формат `−1280`, `0`, `+640`, при необходимости `1.25 км`.
- Охват: `плита` (по умолчанию), `вид` (clip по камере), `радиус` (N метров от цели).
- Отключение — `G` или чекбокс; прозрачность 0–100%; в 3D сетка лежит на `ground.y + 0.02`, не клипается и не перекрывает настилы.
- Подписи координат — только по краям видимой области/плиты и в статусбаре, не на каждой линии; не заходят
  под левую/правую панель и статусбар (та же safe-area, что у меток).
- Координаты курсора: экран → луч на плоскость `Y=ground.y` (в free — на выбранную плоскость), показ `x/z` с точностью 0.1 м.
- Шаг `auto` зависит от `м/пиксель` **текущего вида**, поэтому при переключении top/front/side сетка пересчитывается;
  ручной шаг сохраняется в URL и не сбрасывается.

## 8. Метки: приоритеты и declutter

### 8.1 Содержимое по зуму

| Tier | Когда | Метка |
|---|---|---|
| far | весь мир в кадре | район (`type`), anchors, только крупные дома (`id`) |
| mid | 1/4 плиты | + дороги (`id`, тип), крупные дома (`id`, этажи) |
| near | < 300 м в кадре | + пропы, узлы скелета, чанки; у дома `id · kind · N эт.`; у дороги `id · W м · +H м` |

### 8.2 Приоритеты

`selected=95`, `anchor=100`, `diagnostic=95`, `district=90`, `building=80 + sizeRank(0..15)`, `major road=70`, `minor road=45`, `chunk=30`, `prop=20`, `skeleton node=10`.

### 8.3 Алгоритм (камера изменилась / слой переключён, throttle 80 мс)

1. Для каждой сущности с меткой: проекция bbox в экран, `areaPx`, `visible` (в кадре + 32 px), дистанция (free).
2. Eligibility:
   - selected/hovered/diagnostic — всегда;
   - far: `district|anchor` или `building.areaPx ≥ 3000`;
   - mid: `building.areaPx ≥ 1200`, дорога `widthPx ≥ 8` или `lengthPx ≥ 120`;
   - near: `building.areaPx ≥ 300`, дорога `widthPx ≥ 4`, проп `areaPx ≥ 30`, узел — только при `metersPerPixel < 0.5`.
3. Сортировка: приоритет ↓, затем площадь ↓, затем id.
4. Declutter: spatial hash 48 px; прямоугольник метки + 4 px; если пересекается с принятой — пропустить; бюджет `N=60` (слайдер 20…200).
5. Гистерезис: ранее видимая метка остаётся, если всё ещё eligible и не конфликтует с более приоритетной; не мигать при мелком сдвиге.
6. DOM-пул 200 элементов, `textContent`, `pointer-events:none`; обновление `transform` без layout-read (ширина — `canvas.measureText`, кэш по тексту/тиру).
7. Выбранная/наведённая метка добавляется первой и не вытесняется; при клике по геометрии — автоскролл в инспекторе.

### 8.4 Safe area, позиция и текст

- Safe area = `canvasRect` минус прямоугольники левой панели, правой панели, тулбара и статусбара
  (`getBoundingClientRect` кэшируется при resize/панель-toggle). Метка, чей якорь попал под панель,
  не показывается; выбранная — прижимается к ближайшему краю safe area с пунктирной линией-выноской.
- Якорь метки: дом — центроид `footprint` + `(0, roofY+2, 0)`; дорога — середина самого длинного `deck`
  + `(0, topY+1, 0)`; проп — точка; район — центроид geometry; anchor — маркер spawn/exit.
- Позиция в DOM: `translate3d(anchorX+8, anchorY-14, 0)`; при выходе за правый край — сдвиг влево на ширину
  текста + 16 px; максимальная ширина 180 px, `text-overflow: ellipsis`, полный текст — в `title`.
- Текст: far — `d0 · forest`, `spawn`, `b_d0_11`; mid — `b_d0_11 · 1 эт.`, `eb_1 · local`;
  near — `b_d0_11 · 1 эт. · 3.3 м`, `lt1_s1_a · 8 м · +16 м`, `pillar_…` (короткий id).
- Бюджет по умолчанию 60, но на 16 (392 дома) far-тир всё равно даёт ≤ 60; бюджет не повышается
  автоматически — только слайдером. Метки диагностик считаются как `anchor`, но рисуются красным рингом.
- `prefers-reduced-motion` и `document.hidden` — обновление меток только по `requestAnimationFrame` при
  видимой вкладке; при скрытой — пауза, чтобы не тратить CPU.

## 9. UI

- **Левая панель:** глава (список + номер), режим, вид, слои, отображение (окраска: provenance/материал/тип), сетка, метки, легенда, поиск, диагностика.
- **Правая панель (инспектор):** id, kind, origin + правило, source-pointer, parent, chunkIds, bbox/высота/ширина, ключевые attrs, связанные diagnostics, кнопки `Focus`, `Facade`, `Copy id`, `Показать пару source/compiled`.
- **Статусбар:** координаты, масштаб, `unique/instances`, видимые метки, fps, `renderer.info` (calls/triangles/memory), прогресс загрузки.
- **Оверлеи:** загрузка с прогрессом по чанкам; баннеры (Z-up, нет геометрии районов, ошибки чанков); help `?`.
- **Поиск:** подстрока по id/name/type, максимум 50, Enter — фокус, ↑/↓ — выбор; фильтр по слою/классу.
- **Ссылка:** кнопка «Copy link» сериализует уровень/режим/вид/камеру/слои; состояние читается при старте.

### 9.0 Каркас и состояния

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ toolbar 44px: [level ▼] [source|compiled|compare] [1 top][2 front][3 side][4 free] │
│               [grid] [labels 60] [search…] [Copy link] [?]                    │
├──────────────┬───────────────────────────────────────────────┬───────────────┤
│ left 280px   │ canvas (WebGL + DOM labels)                   │ right 340px   │
│ level list   │                                               │ inspector     │
│ mode / view  │  banners: Z-up · v3 no report · no districts  │ id / kind     │
│ layers       │                                               │ origin+rule   │
│ legend       │                                               │ pointer/parent│
│ diagnostics  │                                               │ Focus Facade  │
│ filters      │                                               │ Copy id       │
├──────────────┴───────────────────────────────────────────────┴───────────────┤
│ status 28px: x/z · m/px · unique/instances · labels · fps · calls/tris · load │
└──────────────────────────────────────────────────────────────────────────────┘
```

- При ширине < 1100 px панели становятся overlay-панелями с кнопками; canvas не ресдается под ними
  (safe area пересчитывается), чтобы камера не «прыгала».
- Empty/error состояния: `source only` (нет каталога), `v3` (нет отчёта/районов), `report only`
  (районы есть, геометрии нет), `chunk failed` (красная строка + retry), `source failed` (fatal).
- Все динамические строки — `textContent`; никаких `innerHTML` из id/name/type/сообщений отчёта.
- Инспектор не пересобирает DOM на каждый кадр: обновление только при смене выбора/диагностики;
  списки диагностики — лимит 200 + «показать все».

### 9.1 Горячие клавиши

`1` top · `2` front · `3` side · `4` free · `F` focus · `Shift+F` facade/profile · `G` grid · `L` labels · `P` props · `S` skeleton · `D` districts · `C` chunks · `R` reset · `Backspace` back · `Esc` clear · `/` search · `?` help.

### 9.2 Слои (по умолчанию)

| Слой | Default | Примечание |
|---|---|---|
| plate/bounds | on | контур плиты |
| districts | on | контур + подпись; заливка опционально |
| chunks | on | тонкие контуры + counts; heatmap по числу объектов опционально |
| roads/decks | on | fill/aprons отдельными под-слоями |
| rails | on | линии по `rails` |
| buildings | on | footprint + 3D-экструзия |
| props | on | точки/instanced; на отдалении скрываются; `roads[].pillars` не дублируются |
| lights | off | точки `sl_*` (16/17 — 8) |
| channels/tunnels | auto | если есть: 10/15/16/17 русла, 07/15 тоннели |
| relief | off | грубые холмы из `map.relief.hills` (07 — гора 140 м) |
| cars | off | точки `gameplay.cars.spots`, если есть |
| skeleton | off | сеть навигации; для 16 — 4388 узлов |
| anchors | on | spawn/exit + маркеры |
| diagnostics | on | маркеры/подсветка |
| grid | on | — |
| labels | on | — |

## 10. Производительность

- Чанки грузятся пулом 4: `fetch` конкурентно, `decodeChunk` — по одному с `await nextFrame()` между ними;
  прогресс и отмена при смене главы. Level 19 — 16 чанков / 1.23 МБ, level 16 — 25 / 0.93 МБ, level 09 — 25 / 1.0 МБ;
  авто-«всё» до 64 чанков, иначе приоритет видимых.
- Замеры тёплого Node: все чанки 3–18 мс (`decodeChunk`), скелет 0.3–1.3 мс. В браузере ожидаем 2–4×;
  бюджет decode < 300 мс в §10.1 оставляем с запасом.
- Дороги/полосы: merged `BufferGeometry` по (стиль, слой); дома — merged по чанку при > 200, иначе отдельные meshes; пропы — `InstancedMesh` (box), в плане — точки; скелет — один `LineSegments`.
- Frustum culling — по группам чанков; скрытые слои `visible=false`; материалы и geometry `dispose()` при смене главы.
- Рендер по требованию (dirty flag) + анимация только при диагностике/переходах; DPR ≤ 2.
- Метки: бюджет и throttle; не более ~2 мс на обновление.
### 10.1 Бюджеты (local, Chrome, DPR 1)

| Метрика | Бюджет | Как мерить |
|---|---|---|
| ready level 19 | < 2.5 с | `performance.now()` от навигации до `__viz.ready` |
| ready level 16 (25 чанков) | < 3.0 с | то же |
| decode всех чанков | < 300 мс | `stats.decodeMs` |
| модель (dedupe/provenance) | < 120 мс | `stats.buildMs` |
| план (fit-all) | ≥ 55 fps | 120 кадров, среднее |
| free 3D | ≥ 30 fps | 120 кадров, среднее |
| метки | ≤ 2 мс/обновление, ≤ 60 видимых | `stats.labelsMs` |
| память после 5 переключений 19→18→16→07→19 | +< 10 МБ | `renderer.info.memory`, `performance.memory` |

Мерить `window.__viz.stats()`; в статусбаре — `calls/triangles/geometries/textures`, чтобы регрессия была видна.

## 11. Задачи

### [TASK-001] Каркас, загрузка, модель — [ ]
- [ ] `tools/level-visualizer.html`: importmap (`three@0.160.0`, `three/addons/`), панели, canvas, `style.css`.
- [ ] `loader.js`: список глав из `LEVEL_NUMBERS` (regex + fallback), **zero-pad** `level-${String(n).padStart(2,'0')}`, source JSON, `generation-report.json` (404 → `null`), динамический `import()` каталога, `decodeChunk`/`decodeSkeleton`, пул 4, прогресс/ошибки/отмена, cache-bust по Reload.
- [ ] `model.js`: Y-up нормализация, dedupe `owner === true` + fallback `(kind,id)`, слияние decks/walls/fill/aprons, вложенные `roads[].pillars` только как parentId, bbox, anchors, chunks, skeleton, relief, stats.
- [ ] `sourceIndex`: id → `{kind, pointer, raw}` для roads/nodes/buildings/props/lights/districts/gameplay/relief.
- [ ] `window.__viz = { ready, stats(), counts(), select(id) }` — для smoke/ручной отладки.
- **Файлы:** `level-visualizer.html`, `visualizer/{main,loader,model}.js`, `style.css`.
- **Приёмка:** level 19 `compiled` грузится; `unique` = 28 домов / 122 дороги / 2626 пропов; 54 дубля схлопнуты; 84 source-дороги представлены (58 exact + 62 split + 2 pad); скелет 1936/1832; level 07/09/16/18 тоже грузятся с матрицей §2.1; консоль без ошибок; повторный выбор главы не течёт.

### [TASK-002] План, навигация, слои, выбор — [ ]
- [ ] Top-камера, fitAll/reset, wheel-zoom к курсору, pan, клик/ховер, подсветка.
- [ ] Отрисовка: плита, чанки, districts-контуры, дороги (OBB/rect, ramp, rails, fill/aprons), дома (footprint), пропы (точки), anchors, диагностические маркеры.
- [ ] Экранный пикинг: polygon → building/district; polyline/rect → road; point → prop/anchor; допуск 4–8 px.
- [ ] Инспектор, статусбар, URL-состояние.
- **Приёмка:** level 19 — видны 4×4 клетки, обе магистрали, 4 спиральные рампы на разных высотах; клик по дому/дороге/рампе выбирает и показывает атрибуты; `R`/`F` работают; слои скрываются без ошибок.

### [TASK-003] Сетка — [ ]
- [ ] `grid.js`: `nice125`, minor/major, охват, подписи по краям, оси, формат координат.
- [ ] Включение/отключение/прозрачность/ручной шаг; сохранение в URL.
- [ ] В 3D — на `ground.y`, без клиппинга; в плане — под объектами.
- **Приёмка:** на масштабе плиты шаг 100/250 м, при приближении — 10/5/1 м; подписи не наезжают на метки; `G` мгновенно скрывает; оси 0 выделены.

### [TASK-004] Происхождение, легенда, фильтры, инспектор — [ ]
- [ ] `provenance.js` (в `model.js` или отдельно): правила §5.2, `parentId`, `sourcePointer`, `repairs/duplicates`.
- [ ] Цвет/штрих/заливка по §5.3; легенда с числами; клик по легенде — фильтр.
- [ ] Инспектор: origin + правило + «что править» (JSON-pointer или параметр генератора), parent, modified-by.
- [ ] «Требует внимания»: `unknown`, конфликты id, `declared-missing` в compare.
- **Приёмка:** level 19: 84 source-дороги представлены 120 authored-сущностями (58 exact + 62 split) + 2 derived pad;
  28 generated домов; 2626 derived пропов; 0 unknown. `eb_5_a` — authored, parent `eb_5`; `lt1_s2_b_b` — authored,
  parent `lt1_s2` (двойной split); `pillar_…` — derived, parent-дорога (47 родительских); `b_d0_12` — generated,
  pointer на район/профиль; `d0` — authored rect.
  level 16: 392 generated домов, 562 пропа (202 derived pillar + 360 generated stage5), 8 generated `sl_*`, 16 авто-районов;
  level 18: 10 authored дорог + 2 pad, 15 generated домов, 152 derived pillar; v3 07/08/09: дома/дороги — authored;
  07/15: `tunnel_*_pN` — derived с parent-тоннелем, не unknown.

### [TASK-005] Районы и диагностика — [ ]
- [ ] District geometry: `geometry.rect`, `geometry.polygon`/`points`; `cells` — только если у клетки есть `rect`/координаты, иначе центры `{cx,cy}` точками с пометкой `inferred`; `mask` — предупреждение «не поддержано».
- [ ] Сводка из `generation-report.districts` (type/profile/cells/parcels) + source pointer; клик — фильтр домов по `b_<district>_*`.
- [ ] Авто-районы без геометрии: список + баннер «геометрия не сохранена»; опционально hull/AABB из домов
  `b_<districtId>_*` с штрихом `inferred`, явно отличимым от source; пустой авто-район — только строка в списке.
  Не выводить rect из `district_i_j`: сетка районов не совпадает с сеткой чанков (16: 4×4 района при 5×5 чанках).
- [ ] `repairs[]`/`diagnostics[]`: список, фильтр по severity/code/stage, разбор `id`/`to`/`target`/`segments[]`/`node`/`anchor`;
  клик — фокус и подсветка сегментов/узла/anchor; маркеры на плане.
- **Приёмка:** level 19 `d0/forest` — rect на всю плиту, подпись, сводка 441 parcel; level 18 — 121 parcel;
  level 16/17 — 16 авто-районов в списке, баннер «геометрия не сохранена», 0 ложных полигонов;
  предупреждения `anchor_far_from_roads`, `road_conflicts_unresolved`, `segment_self_intersection` видны и кликабельны;
  для v3 — честный баннер «v3: отчёт/районы не предусмотрены», не пустая сцена.

### [TASK-006] Проекции, фасад, секущие плоскости, free 3D — [ ]
- [ ] `front`/`side` ортогональные камеры с pan/zoom; `free` + OrbitControls; плавный переход и стек `Backspace`.
- [ ] `F` fit bbox; `Shift+F` фасад дома (walls/footprint) и профиль дороги; подсветка выбранного.
- [ ] 3D: экструзия домов, настилы с `topAtMin/Max`, стороны/толщина, props instanced, скелет, русла/тоннели, опциональный рельеф.
- [ ] (Опц.) Секущие плоскости X/Y/Z со слайдером; метки за плоскостью скрываются.
- **Приёмка:** фасад дома level 19 кадрируется по стене, видно этажность/высоту; рампа `+16…+22 м` читается в free;
  side-вид показывает профиль моста level 18 (`topY=8`); секущая Y=18 не ломает сцену; гора level 07 (`height=140`,
  `radius=520`) видна в free и не перекрывает тоннель; `spawn_house` (4 м) кадрируется без нулевой рамки.

### [TASK-007] Метки и declutter — [ ]
- [ ] Приоритеты/eligibility/declutter/бюджет/гистерезис по §8.
- [ ] DOM-пул, измерение текста, tiers far/mid/near, настройки (бюджет, минимальный размер, показывать пропы/узлы).
- [ ] Метки anchors/districts всегда; выбранная/наведённая — вне бюджета; клик по метке = выбор.
- **Приёмка:** на fit-all level 19 видно ≤ 60 меток (район, anchors, крупные дома); level 16 — ≤ 60 (16 районов
  + крупные дома, без 392 подписей); при зуме появляются дороги; при `< 300 м` — пропы/узлы; нет наложений;
  метки не заходят под панели; при панораме не «прыгают» чаще, чем раз в 80 мс; выбранная видна всегда.

### [TASK-008] Полировка, производительность, тесты, документация — [ ]
- [ ] Поиск, hotkeys, help, copy-link, touch (pinch/pan), resize/DPR.
- [ ] Профилирование и оптимизации по §10; `dispose()` при смене главы; проверка `renderer.info.memory`.
- [ ] `model.test.mjs`: dedupe/owner, provenance-кейсы, nested pillars, district rect/missing, `nice125`,
  label eligibility/declutter/safe-area, parse `LEVEL_NUMBERS`, zero-pad, matching сплитов, count reconciliation;
  интеграция по level 19 + табличные снапшоты §2.1 (07/09/16/18).
- [ ] (Опц.) `smoke.mjs` (Playwright): открыть `?level=19&mode=compiled&smoke=1`, дождаться `__viz.ready`,
  проверить counts/labels/нет ошибок; то же для `?level=16` и `?level=07`; шаг в CI — только если стабилен.
- [ ] `node --test tools/visualizer/model.test.mjs` в CI (node job); обновить `docs/architecture-level-pipeline.md`
  (короткая секция «Визуализатор») и `tools/visualizer/README.md`.
- **Приёмка:** тесты зелёные; ручной чек-лист §13 пройден на 19/18/16/07; `node tools/check-levels.mjs` и игровые
  сюиты не затронуты; README объясняет режимы/легенду/ограничения (v3, авто-районы, Z-up, hard refresh).

### [TASK-009] (Отложено, требует решения) Экспорт геометрии авто-районов — [ ]
- [ ] Вариант A: добавить в `generation-report.json.districts[]` поля `geometry`/`cells`/`grid` (versioned report), обновить тесты citygen/check-levels.
- [ ] Вариант B: sidecar `districts.json` в каталоге главы (без смены версии отчёта).
- [ ] Только после явного согласования: это изменение пайплайна, а не визуализатора. До него — честный баннер/hull-подсказка.
- **Критерий:** авто-районы (`district_i_j`) видны как настоящие полигоны, а не как hull-догадка.

## 12. Тесты и проверка

### 12.1 Node (`tools/visualizer/model.test.mjs`)

- [ ] `levelFile(n)`: `7→level-07.json`, `9→level-09.json`, `10→level-10.json`, `15→level-15.json`, `19→level-19.json`.
- [ ] `dedupeOwner`: L19 54 дубля → 28/122/2626; `owner` выбран, decks объединены, `instances` (35/169/2626) > unique;
  таблица unique для всех глав: 07 1/10/146, 08 14/10/0, 09 892/10/0, 10 7/17/16, 15 27/23/16,
  16 392/174/562, 17 396/173/382, 18 15/12/152, 19 28/122/2626.
- [ ] `nestedPillars`: top-level `props` и `roads[].pillars` дают одно множество id; L19 2626, L18 152;
  вложенных вхождений больше (4656/330), но `unique` не растёт.
- [ ] `provenance`: `eb_1` authored; `eb_5_a` authored + parent `eb_5`; `lt1_s2_b_b` authored + parent `lt1_s2`;
  `spawn_pad` derived; `tr_gb_1` generated; `b_d0_12` generated; `b_district_0_0_110` generated;
  `prop_111` generated (несмотря на `source:'authored'`); `pillar_eb_1_…` derived;
  `tunnel_tunnel_mountain_p0` derived parent `tunnel_mountain`; `unknown_42` unknown.
- [ ] `districtGeometry`: L19/L18 rect; L16/17 report district → `{geometry:null, reason:'geometry-not-persisted'}`;
  v3 → `{geometry:null, reason:'v3-no-districts'}`; `cells` → hull только с флагом `inferred`.
- [ ] `countReconciliation`: L16 `402−10=392`, `360+202=562`; L17 `403−7=396`, `360−2+24=382`;
  L18 `15`, `152`; L19 `28`, `2626`; `cells.objects` суммы = instances, не unique.
- [ ] `splitMatch`: L19 58 exact + 62 split (18 вложенных) + 2 pad = 122; 84 source представлены; 0 unknown/0 missing;
  L18 10 exact + 2 pad = 12; L07 6 exact + 2 pad + 2 tunnel = 10; L10 16 exact + 1 pad = 17;
  L15 19 exact + 2 pad + 2 tunnel = 23; L08/09 8 exact + 2 pad = 10.
- [ ] `nice125`: 7→10, 23→25, 61→100, 0.3→0.5.
- [ ] `labelPlan`: приоритет/бюджет/пересечение/selected override/гистерезис; safe-area (панели) исключает метку;
  выбранная не вытесняется.
- [ ] `parseLevelNumbers` на реальном `src/levels/index.js` → `[7,8,9,10,15,16,17,18,19]`.
- [ ] Интеграция: декодировать 16 чанков L19; каждое `id` уникально после dedupe; skeleton 1936/1832;
  табличный прогон L07/09/16/18 с counts/skeleton из §2.1; нет исключений.
- [ ] Тест не импортирует Three.js/DOM; работает `node --test` на Node 22/24; полный прогон < 2 с.

### 12.2 Браузер (smoke/manual)

- [ ] `?level=19&mode=compiled`: 16/16 чанков, нет ошибок, counts совпадают с `index.cells[].objects` после dedupe (уникальные/инстансы).
- [ ] `?level=19&mode=compare`: source 84 дороги, нет `declared-missing`; ghosts не появляются ложно.
- [ ] `?level=18&mode=compiled` и `?level=16&mode=compiled`: каталог грузится, районы/дороги/дома рисуются, предупреждения честные.
- [ ] `?level=16&mode=compiled`: 16 авто-районов в списке, баннер «геометрия не сохранена», 0 ложных полигонов;
  `?level=17` — 4 клетки 640, 16 районов, 396 домов.
- [ ] `?level=07&mode=compiled`: гора/тоннель, 1 authored дом, 146 pillar; `?level=10` — bounds шире плиты, но камера по плите.
- [ ] `?level=19&mode=source`: только авторские 84 дороги/`d0`/anchors, без чанков; баннер Z-up.
- [ ] `?level=16&mode=source`: баннер «source без геометрии; откройте compiled», без пустой сцены.
- [ ] Grid: auto/1/10/100, off; labels: off/20/200; facade дома; side-профиль; section Y; free orbit; resize/DPR.
- [ ] Смена главы 19→18→16→07→19: нет роста `renderer.info.memory` > 10 МБ, камера сбрасывается, старые метки исчезают.
- [ ] Hard refresh после пересборки чанков (Ctrl+F5) — ожидаемое поведение, зафиксировать в README.

### 12.3 CI

- [ ] В node-job добавить `node --test tools/visualizer/model.test.mjs`.
- [ ] Опционально в browser-job — `smoke.mjs`, если он стабилен; иначе smoke остаётся ручным.
- [ ] Существующие `check-levels`, `level-parser`, `relief`, `track`, `chunk`, `citygen` не менять; визуализатор не добавляет сюит в `tests/`.

## 13. Ручной чек-лист приёмки (level 19)

- [ ] Fit-all: плита 2560, 4×4 клетки, район `d0`, spawn `(−1180,−12)`, exit `(−12,1180)`.
- [ ] Земляная магистраль З–В и мост С–Ю видны; 4 правых съезда и 4 спиральные рампы различаются по высоте.
- [ ] Дороги: solid blue (authored), split-части не выглядят «чужими», `spawn_pad`/`exit_pad` — derived violet.
- [ ] Дома: amber dashed, `b_d0_*`, при приближении видно этажность; 28 уникальных.
- [ ] Пропы: violet points, `pillar_*`, в инспекторе parent-дорога; на отдалении скрыты.
- [ ] Диагностика: 5 warnings и 18 repairs; `anchor_far_from_roads` фокусирует spawn/exit; `road_crossing_repair_skipped` подсвечивает `nb_9`/`lt1_s4`.
- [ ] Сетка: шаг 100/250 на fit; подписи по краю; `G` работает.
- [ ] Метки: ≤ 60 на fit; при `< 300 м` появляются дороги/пропы; нет наложений.
- [ ] `Shift+F` на доме — фасад; `Shift+F` на рампе — профиль; `Backspace` возвращает.
- [ ] `compare`: нет ложных ghosts; счётчики source/compiled сходятся с §2.
- [ ] Free 3D: эстакады на +16/+18/+20/+22, столбы, настилы; секущая Y=18 работает.
- [ ] Консоль чистая; после смены глав память не растёт.

### 13.1 Дополнительно: 16 / 18 / 07

- [ ] L16: 25 чанков, 392 дома, 562 пропа, 8 `sl_*`; 16 авто-районов — список, но без полигонов; hull-подсказка
  помечена `inferred` и не выглядит как source-граница.
- [ ] L18: 4 чанка, 15 домов `b_d0_*`, 12 дорог (10 + 2 pad), 152 pillar; мост `topY=8` читается в side/free.
- [ ] L07: 25 чанков, гора `height=140`/`radius=520`, тоннель и порталы, 1 дом `spawn_house`, 146 pillar;
  source-манифест `cityforge.chunks` не используется для загрузки.
- [ ] L09: 892 authored дома, 10 дорог; на fit-all метки не превращаются в «кашу» (бюджет 60).
- [ ] L10: `bounds` X шире плиты, но `fitAll` кадрирует 1280 и не улетает за плиту.

## 14. Риски и меры

| Риск | Мера |
|---|---|
| Геометрия авто-районов отсутствует в каталоге/отчёте | Честный баннер + hull как `inferred`; TASK-009 только по согласованию |
| Неоднозначное происхождение | Явные правила §5.2, `unknown` + отчёт, `parentId`, тесты; инспектор показывает правило |
| `up: "Z"` в source vs Y-up в данных | Нормализация Y-up + баннер; не править формат в этом плане |
| Дубли на швах чанков | Dedupe `owner === true` + fallback `(kind,id)`, слияние decks; счётчики unique/instances |
| `roads[].pillars` дублируют `props` | Не рисовать вложенные; связь `parentId`; тест `nestedPillars` |
| Отчёт и сборка расходятся (drops/pillars/pads) | Формулы §2.1 в тестах; в UI — `source/report/compiled` раздельно, без «одного числа» |
| Тяжёлые миры/пропы | Instancing, merged geometry, lazy/frustum, бюджет меток, on-demand render |
| Перегруз меток | Экранный declutter, приоритеты, бюджет, гистерезис, tiers |
| Кэш ESM после пересборки | Кнопка Reload с cache-bust + README про Ctrl+F5 |
| Секущие плоскости ломают материалы | Только опциональный режим, отдельные материалы/`clippingPlanes`, сброс при выключении |
| Неточная «игровая» картинка | В README: визуализация по данным (decks/footprint), не рендер движка |
| Большой `generation-report` | Списки с лимитом 200 + «показать все», фильтры |
| Legacy-главы без каталога | Явное сообщение, не пытаться строить `JsonMap` |
| Устаревшие `metadata.notes` | Считать источником истины только данные/отчёт; notes — подсказка |
| Three.js CDN недоступен | То же ограничение, что у игры; сообщение об ошибке загрузки |

## 15. Порядок и зависимости

1. **M1:** TASK-001 → TASK-002 → TASK-003 — уже полезный план.
2. **M2:** TASK-004 → TASK-005 — аналитика данных и диагностика.
3. **M3:** TASK-006 → TASK-007 — фасады/3D и читаемые метки.
4. **M4:** TASK-008 — полировка, тесты, CI, README.
5. **Отложено:** TASK-009 — только если нужны авто-районы как полигоны.

Зависимости: TASK-002…007 используют модель TASK-001; TASK-005 опирается на source+report; TASK-006/007 не зависят друг от друга; TASK-008 — после 001…007.

## 16. Definition of Done

- [ ] Все критерии §1.2 и чек-листы §13/§13.1 закрыты.
- [ ] Матрица §2.1 подтверждена на 07/09/16/18/19; 08/10/15/17 открываются без ошибок (даже если без ручной проверки).
- [ ] `node --test tools/visualizer/model.test.mjs` зелёный; CI node-job обновлён.
- [ ] `node tools/check-levels.mjs` и игровые сюиты не изменились (визуализатор не трогает `src/`, кроме чтения).
- [ ] README описывает запуск, режимы, легенду, hotkeys, ограничения (районы, Z-up, hard refresh).
- [ ] В `docs/architecture-level-pipeline.md` есть короткая ссылка на инструмент.
- [ ] В рабочем дереве нет изменений уровней/пайплайна, кроме явно согласованного TASK-009.
