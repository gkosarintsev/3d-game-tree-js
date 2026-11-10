# Правила архитектуры проекта (3D-шутер на Three.js)

Этот файл — источник обязательных ограничений. Любой код, попадающий в репозиторий,
должен им следовать. Если задача противоречит правилу — сначала измени правило
осознанно и обсудив, потом код.

Правила здесь — в сжатом виде; полные формулировки с замерами и историей
(«почему») вынесены в `docs/` и **действуют так же обязательно**:
- контракт карты и стриминг/открытый мир — [docs/architecture-map-contract.md](docs/architecture-map-contract.md), план — [docs/open-world-plan.md](docs/open-world-plan.md);
- внешние ассеты (GLB), колонки, стрим окна, ночной свет — [docs/architecture-glb.md](docs/architecture-glb.md);
- уровни из брифа (json/json2): геометрия, навигация, рельеф, кровли, вода, косые районы, трасса и замеры — [docs/architecture-json-levels.md](docs/architecture-json-levels.md), планы — [docs/level12-relief-plan.md](docs/level12-relief-plan.md), [docs/level13-track-plan.md](docs/level13-track-plan.md), дефекты — [docs/defects-v2-plan.md](docs/defects-v2-plan.md);
- пайплайн брифа, схема DSL, процедурные ряды, генератор — [docs/architecture-level-pipeline.md](docs/architecture-level-pipeline.md);
- v3 CityForge (чанки/каталог) и движковая арифметика поверхностей (`SurfaceField`, `src/surfaces.js`) — [docs/open-world-plan.md](docs/open-world-plan.md), контекст в [docs/architecture-json-levels.md](docs/architecture-json-levels.md);
- рельеф TerrainMap — [docs/architecture-terrain.md](docs/architecture-terrain.md);
- сущности и жизненный цикл — [docs/architecture-entities.md](docs/architecture-entities.md);
- автомобили — [docs/architecture-vehicles.md](docs/architecture-vehicles.md), план/замеры — [docs/vehicle-plan.md](docs/vehicle-plan.md);
- тесты и CI — [docs/architecture-testing.md](docs/architecture-testing.md);
- физика Rapier (Часть II, условно) — [docs/architecture-rapier.md](docs/architecture-rapier.md).


# Agent Directives & Repository Operations

You operate in this repository as an autonomous engineer. Maintain project context, track progress, and write deliverables directly to disk following these rules:

## 1. Directory Structure
- `.ai/prompts/`: Store reusable prompts, system directives, and prompt templates (`.yaml` or `.md`).
- `.ai/plans/`: Store feature specifications, technical designs, and step-by-step implementation plans (`.md`).
- `.ai/state/`: Maintain active execution state using `.md` checklists or `task_tracker.json`.

## 2. Knowledge Base & State Management
- **Plan First:** Before implementing any complex feature, write a detailed plan into `.ai/plans/XX-feature-name.md` with incremental task IDs (e.g., `[TASK-001]`).
- **Update Progress:** As you complete steps, immediately update task statuses in `.ai/state/` or directly inside the corresponding plan file (`- [ ]` -> `- [x]`).
- **Capture Artifacts:** If a prompt structure, query template, or workflow proves effective, save it to `.ai/prompts/` for future iterations.
- **Log Decisions:** Save critical technical trade-offs and architecture choices in `docs/architecture/adr/`.

## 3. Execution Standard
- Keep all documentation clear, concise, and machine-readable.
- Do not ask for user confirmation for internal file updates unless a requirements conflict arises.


## База

- ES-модули без сборщика. Единственная внешняя зависимость — Three.js 0.160 через
  importmap (CDN). Новые npm-зависимости, сборщики и фреймворки — только по явной
  просьбе владельца проекта.
- Игра и автотесты запускаются в браузере: `python -m http.server 8124` →
  `http://localhost:8124/3d-game.html`. `file://` не поддерживается (importmap).
- Для отладки в консоли страницы открыт `window.game`; модули полагаться на него
  не должны. Отладочное меню главы/параметров — `http://localhost:8124/3d-game.html?debug=1`
  (`src/debug.js`).

## Контракт карты (src/map.js)

Движок (player, alien, enemies, coins, hud, game, exit) знает о карте **только**
члены контракта: `width`, `depth`, `spawn`, `groundHeightAt`, `isBlocked`,
`openPositions`, `worldToNormalized`, `build`, `drawMinimap`, `raySolid`,
`resolveSphere`, `rayHitDistance`, `findPath`, `randomNavPoint`, `bounds`, `solids`.
Сигнатуры менять только вместе со всеми потребителями и автотестами.

Опциональные члены (отличать по `typeof`, не по `map.kind`):
- `updateStreaming(x, z)` — стримящая карта; при сдвиге окна движок переносит мир на `-(dx,dz)`, переставляет огни/тени и **не ведёт кадр симуляции**.
- `debugIds()` — карта из брифа (метки id в `?debug=1` отдаёт карта, панель не пересобирает схему).
- `streamStep(budgetMs, x, z, speed)` и `isBuiltAt(x, z)` — открытый мир (`WorldMap`): помпа достраивает/выгружает клетки в бюджет кадра (без сдвига мира и без пропуска симуляции), `isBuiltAt` — именованный предикат «клетка застроена» (не `bounds` и не `isBlocked`).

Ключевые инварианты:
- Предел «не вылететь за карту» — **плита** `width`/`depth` (не `bounds`, который у разных карт — габарит содержимого). Вертикальная сеть тела — **опора карты** `groundHeightAt(x, z, y) + radius`, а не виртуальный ноль (русла/пропасти имеют отрицательную опору).
- Граф навигации — **одна связная сеть** пешком достижимых точек (изолированные карманы отсекаются). `randomNavPoint` собирает кандидатов **одним проходом по радиусу**, не угадыванием.
- Декор (`src/decor.js`, выводимые квады, кузова машин) — чистая визуализация: без `solids`/`blockers`/влияния на навигацию и проходовость.
- Сущности открытого мира (только при `streamStep`): враги/маяк/кузова вне застроенных клеток скрываются или не используются; снятие врага — **молча** (без смерти/звука/зачёта), возрождение и посадка — по застроенной опоре/узлу; план миникарты берёт всю плиту. Подробности — [docs/architecture-map-contract.md](docs/architecture-map-contract.md).

Реализации (7 классов, 8 ключей: `json`/`json2` → `JsonMap`, `cityforge` компилируется в `open`): `TownMap`, `TerrainMap`, `CityMap`, `ModelMap`, `StreamedModelMap`, `JsonMap` (v1/v2), `WorldMap` (подкласс `JsonMap`, `open`). Все строятся на общих механизмах без копий: `SolidField` (src/solids.js) → `SurfaceField` (src/surfaces.js) → `JsonMap` → `WorldMap`; граф/поиск — `NavGraph` (src/nav-graph.js); дом — `src/building.js`. Новый тип — класс с контрактом, выбор по `map.kind` в `Game.createMap()`.

## Внешние ассеты уровня (GLB)

- Геометрию в проект приносит только `.glb` через `GLTFLoader` из importmap (`src/glb.js`, кэш). npm-пакеты коллизий запрещены.
- Твёрдость извлекается в те же механизмы: **сетка колонок** шагом `cell` из данных главы; верх — максимум перекрывающих треугольников; `isBlocked`/`groundHeightAt` по колонкам (пределы `CONFIG.building.stepUp` / `CONFIG.alien.stepUp`); `solids` пуст, `raySolid`/`resolveSphere` — марш по колонкам.
- Растеризация — по XZ-проекции каждой грани (плоскость → центры клеток внутри, отвесная лента → DDA с запасом полклетки). **Габарит вокруг проекции запрещён** (фантомные колонны). Огромные плоскости-землю макета в колонки не пишут (`groundPlane`/`groundY`).
- `resolveSphere` выталкивает по **собственному верху каждой клетки**, не по максимуму соседних. Сетка детерминирована: растерка читает сырые координаты файла и вычитает центр окна в double (в твёрдость — double, в mesh — float32).
- Стримящий макет (`StreamedModelMap`): для движка уровень = активное окно; перестановка кратна **тайлу**, окно — нечётное число тайлов; за плитой макета `isBlocked`; враги вне окна снимаются молча и респавнятся в новом окне; старое окно `dispose()`-нится. Загрузка ассета — единственный разрешённый `await` (`preloadMapAsset` до `createMap`, состояние `loading`); после `await` использовать только локальные данные (не `this.level`).
- Ночь — данные главы (`map.albedo`, `sky.lights/sun/hemi/fog`): правка альбедо идемпотентна (`userData.dayColor`), пул огней `src/night-lights.js` по `sky.lights` с `dispose()`, тени только у «луны» (`shadowMap.autoUpdate = false`), проверка — фотометрия (sRGB после readback).
- Каждый внешний ассет — с атрибуцией (лицензия/автор в `README.md` и в определении уровня). Детали/замеры — [docs/architecture-glb.md](docs/architecture-glb.md).

## Уровни — это данные (src/levels/)

- Каждая глава — файл-определение: `name`, `map` (kind и содержимое), `decor`, `sky`, `gameplay` (цель/монеты/выход/враги/авто). Регистрация — `src/levels/index.js` по порядку прохождения.
- Содержимое уровня и декор детерминированы (ГПСЧ с сидом из определения; разброс монет может использовать `Math.random`). Запрещено хардкодить содержимое конкретной главы в `game.js`, `map.js`, `terrain-map.js`, `enemies.js`, `decor.js`. `config.js` — только значения по умолчанию.
- Цель из `gameplay.goal`: `exit` (дойти до точки B) или `coins`; следующая глава загружается без перезагрузки, смерть перезапускает текущую.
- Типы/главы (по данным): `terrain` (перевал/рельеф, `TerrainMap`), `stream` (GLB-окно по макету), город/улица (`TownMap`/`CityMap`), `json`/`json2` (бриф → `JsonMap`), `open` (WorldMap, в т.ч. v3 CityForge). Район GLB — `asset/window/cell/scale/spawn`; рельеф TerrainMap — `hills/mountains/caves/chasm/ramps/bridge/flats/spawn`; город — `grid/block/street/curb/sidewalk/house/seed/spawn`.

### Брифы и пайплайн (json/json2/open/v3)

- Пайплайн: `src/levels/level-NN.json` → `node tools/build-level.mjs` (валидация, нормализация, запись `level-NN.js`). Оба файла в репозитории; модуль — производное, обязан сходиться **побайтово** и **без предупреждений парсера**. `JsonMap` ест нормализованные данные и не знает номеров глав/схем.
- Схема — один DSL (`tools/level-schema.mjs`) → экспорт JSON Schema (`tools/export-schema.mjs --check`); бриф с `$schema` своей версии. `default` берётся из применяющего объекта; числа, равные default, в бриф не пишут (кроме наличия секции-переключателя). Rationale — `metadata.notes`. Детали — [docs/architecture-level-pipeline.md](docs/architecture-level-pipeline.md).
- Процедурные ряды (окна/мусор/вывески), генератор кварталов/трасс — вывод из данных/ГПСЧ, без роста модуля; детерминизм и порядок вызовов значимы. Счётчики отказов, а не молчание.
- Ключевые геометрические/навигационные инварианты (v2/рельеф): поворотные дома в своих осях (OBB/SAT, допуск обратного хода 1e-9 м), аналитические призмы/дуги/рельеф кормят ногу, пулю, сферу, картинку и навигацию **одним полем**; наклонные пролёты — не в `solids`, а в аналитике; рёбра графа держат габарит и опору под шагом; проходовость русла/кровель/маршей/настилов — свойство данных и общих механизмов. Полные правила и замеры — [docs/architecture-json-levels.md](docs/architecture-json-levels.md).
- Автомобили (`gameplay.cars`) — данные брифа, декор без коллизий, неуязвимость/поведение — в [docs/architecture-vehicles.md](docs/architecture-vehicles.md).

## Сущности и жизненный цикл

- `Game` пересоздаёт сцену и сущности при загрузке уровня. Любой класс со слушателями `window/document` обязан иметь `dispose()` и сниматься при выгрузке. Любые буферы/меши/тени, созданные на главу, отдавать при выгрузке (`renderer.info.memory` не растёт; гейт `reload-scene-budget`).
- Первая посадка врагов — от `map.spawn` (не от позиции игрока до lock). Допуск опоры тела — по худшему узлу графа **своей** главы; свобода узла — по радиусу роли (человек/Чужой).
- Переход Чужого между поверхностями — дуга вокруг касательной кромки с точной доводкой в нормаль цели и корректной обработкой переворотов/взгляда. Детали — [docs/architecture-entities.md](docs/architecture-entities.md), [docs/defects-v2-plan.md](docs/defects-v2-plan.md).

## Тесты

- Изменения физики, коллизий, навигации или контракта карты — браузерные автотесты `tests/*.test.js`, зелёный прогон обязателен. Новая механика — новый автотест.
- Новая глава не требует отдельного файла: покрывается `node tools/check-levels.mjs` и браузерными гейтами реестра `tests/level-contract.test.js`, `tests/level-lifecycle.test.js`. Пределы бюджета — по замеру, не выдумывать.
- CI (`.github/workflows/ci.yml`): `node` + `browser` (`tools/ci-browser.mjs`, каждая сюита в свежей странице). Фильтры: `--level`, `--fast`, ручной `--flake`. Сюиты реестра вручную — с фильтром главы. Подробности — [docs/architecture-testing.md](docs/architecture-testing.md).

## Стиль

- Русские doc-комментарии в формате «что + почему»; тривиальный код не комментируем.
- UI только через `src/hud.js`; остальные модули не трогают DOM (кроме переданного `domElement` для pointer lock). Исключение — `src/debug.js` (только `?debug=1`, вне игрового процесса/тестов): метки id берёт из `map.debugIds()`, не пересобирает схему; снимает/перестраивает свои объекты сцены.
- Настраиваемые значения — в `config.js` (по умолчанию) и в определении уровня; числа не дублируются в модулях.
- Коммиты: `feat:` / `fix:` с одной строкой о причине изменения (см. git log).

## Физика Rapier (Часть II открытого мира)

Условная интеграция `rapier3d-compat` (importmap/CI, не в репозитории; `?physics=own|rapier`, `own` — эталон). Индекс твёрдости не заменяет аналитику (`raySolid`/`groundHeightAt`/рельеф), снимается с картой (`dispose()`), проба тела — капсула-пояс. Default не меняется до зелёных R2/R3. Детали — [docs/architecture-rapier.md](docs/architecture-rapier.md).
