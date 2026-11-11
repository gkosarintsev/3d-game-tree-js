# Состояние: улучшение генератора города и районов

План: `.ai/plans/01-city-generator-districts.md` (v4, 2026-11-11, уточнён). Реализация начата (TASK-001).

## Прогресс

### [TASK-001] Базовая линия, scope/чистка, v4/ADR, пилот (в работе)
- [x] Базовая линия (до чистки): `node tools/check-levels.mjs` — **51/51 зелёные** (включая legacy). CI текущее: node (check-levels + parser/relief/track/chunk suites) + browser (все `tests/*.test.js`), см. `.github/workflows/ci.yml`.
- [x] Решения v4/пилота/clean-up зафиксированы: план §10/§15, ADR `docs/architecture/adr/ADR-001-v4-citygen-districts.md`.
- [x] Чистка legacy §1.1 и scope (основное): удалены главы 01,02,04,06,11,12,13,14 и каталоги/артефакты; `src/levels/index.js` и `tools/check-levels.mjs` приведены к v3-scope (03,05,07,08,09,10,15); удалены `level.schema.json`/`level-v2.schema.json`, `tools/export-schema.mjs` экспортирует v3+common+v4; удалены/заменены заглушками тесты, зависевшие от удалённых глав (json2-level, terrain-traverse, track-city, physics-index, vehicle, relief-terrain/city, rotated-*); адаптированы `tools/level-parser.test.mjs`, `tools/chunk.test.mjs`.
- [x] Спецификация v4: `tools/level-schema.mjs` (`LEVEL_SPEC_V4`, манифест `generator`, опц. `properties`, `schemaVersion:4`), `tools/export-schema.mjs`/`src/levels/level-v4.schema.json`, `tools/build-level.mjs` — валидация/компиляция v4 (`cityforge-v4`) через общий пайплайн в open-каталог.
- [x] Минимальный v4-прогон: фикстура v4 (на базе гл.03 + `generator`) → `generateOutput`/catalog, `--check` совпадает (проверено на `.tmp/v4-minimal.json` → `.tmp/v4-minimal-out`, 25 чанков, 0 предупреждений).
- [ ] Дочистка: v1/v2 ветки/тесты в `tools/level-schema.mjs`/`build-level`/`level-parser.test.mjs` оставлены для совместимости существующих node-тестов (не используются закоммиченными v3/v4 главами; удалить/сузить отдельным решением), вычитка CI/browser-наборов и оставшихся ссылок на legacy, зелёный browser-прогон.
- [ ] Параметры/метрики пилота гл.16 зафиксированы в артефактах (значения приняты в плане: 1280×1280, stream 256/2/200/1200/80; замеры — в TASK-001/008).

**Проверки:** `check-levels` 28/28, `export-schema --check` ok (v3/common/v4), `level-parser.test.mjs` 123/123, `relief.test.mjs` ok, `track.test.mjs` ok, `chunk.test.mjs` 17/17. Browser CI не прогонялся в этой среде.

## Зафиксированные решения
- Базовый формат — **v3/CityForge**; целевой — **v4 с районами**. Обратная совместимость с v1/v2/legacy не требуется.
- **Пилот:** **глава 16 (v4) на базе главы 15**. Параметры: плита `1280×1280 м` (~1,638 км²), `stream { chunk:256, keep:2, aheadMin:200, aheadMax:1200, budgetMs:80 }` (5×5). Метрики: детерминизм/`--check` без ошибок/предупреждений, связность spawn↔exit, старт/окно/p95 помпы и память — не хуже порядка гл.15 и в пределах `docs/open-world-plan.md` (замерить).
- **Формат v4:** `$schema ./level-v4.schema.json`, `kind:"cityforge"`, `schemaVersion:4`; манифест `generator` (seed/generatorVersion, слои 0–6, районы/профили/маски, бюджеты, политики) + переиспользование `level-common.schema.json` и `cityforge/*`/`buildings`; компиляция через общий пайплайн в open-каталог. Детали полей/каталогов — ADR `[TASK-001]`.
- **MVP:** без новых объектов/примитивов движка (только существующие). После стабилизации первый кандидат — «труба над дорогой».
- **Поведение:** статично в MVP; хуки в схеме/IR — опц. `gameplay/properties` (без логики).
- **Ассеты:** GLB предусмотрен в формате (`assets/prefab/source`), **не реализуется** в MVP (процедурная геометрия).
- **`generation-report.json`:** детерминированный (без временных меток), **коммитить для пилота**.
- **Legacy (финально):** §1.1 (01,02,04,06,11,12,13,14) — удалить файлы/каталоги и убрать из `index.js`/тестов/CI атомарно в `[TASK-001]`; удалить `level.schema.json`/`level-v2.schema.json` и неиспользуемые v1/v2-ветки схемы/инструментов.

## Уровни вне scope тестирования (удаляются в [TASK-001])
| № | Файл/каталог | Формат/`map.kind` |
|---:|---|---|
| 01 | `src/levels/level-01.js` | `terrain` |
| 02 | `src/levels/level-02.json`, `level-02/` | `open` (legacy) |
| 04 | `src/levels/level-04.js` | `stream` |
| 06 | `src/levels/level-06.js` | `town` |
| 11 | `src/levels/level-11.json`, `.js` | `json2` |
| 12 | `src/levels/level-12.json`, `.js` | `json2` |
| 13 | `src/levels/level-13.json`, `.js` | `json2` |
| 14 | `src/levels/level-14.json`, `level-14/` | `open` (legacy) |

**В scope:** v3 — 03, 05, 07, 08, 09, 10, 15; **пилот v4 — 16**.

## Задачи
- [~] [TASK-001] Базовая линия (v3-scope), атомарная чистка legacy (§1.1 + v1/v2 схемы/ветки) и scope CI, спецификация v4/ADR, параметры/метрики пилота (гл.16) — v4/pilot инфраструктура и сборка гл.16 готовы, замеры runtime/вычитка CI/browser остаются
- [~] [TASK-002] Каркас `tools/citygen/`, IR/WorldState, RNG/ids, контракт этапа, diagnostics/report, repair, хуки поведения/GLB, пустой v4-прогон
- [~] [TASK-003] Слой 1 — ландшафт и гидрология (рельеф, реки, easement, валидация/repair, emit, тесты)
- [~] [TASK-004] Слой 2 — транспортный граф, мосты, развязки (связность, шаблоны, клиренсы/уклоны, repair)
- [~] [TASK-005] Слой 3 — районы и парцелляция (профили всех типов, соседство/fallback, нарезка, доли)
- [~] [TASK-006] Слой 4 — здания и крупные структуры (каталог типов, размещение, мегастроения/проезды, skybridge)
- [ ] [TASK-007] Слой 5 — инфраструктура и props (только существующие примитивы; новые объекты после MVP, 1-й — труба над дорогой)
- [~] [TASK-008] Слой 6 — финализация, чанки/скелет, связность, детерминированный `generation-report.json`, пилотная глава 16 (v4)
- [ ] [TASK-009] Тесты, документация, CI (v3/v4-scope: детерминизм/инварианты, browser-гейты, docs/ADR)

### [TASK-002] Каркас citygen (в работе)
- [x] `tools/citygen/`: `rng.mjs` (mulberry32/mix/hash), `ids.mjs` (stable id/subseed), `diagnostics.mjs` (Diagnostic/детерминированный report+сортировка), `repair.mjs` (retry/degrade/drop), `context.mjs` (WorldState/IR, хуки behavior/glb), `pipeline/stage.mjs` (контракт prepare→generate→validate→repair), `index.mjs` (оркестратор стадий 0–6).
- [x] Интеграция в `tools/build-level.mjs`: v4 проходит через `runCitygen`, пишет детерминированный `generation-report.json` в каталог (учтён в `--check`), компиляция в open-каталог сохранена.
- [x] Пустой v4-прогон: скелет стадий выполняется, отчёт детерминирован (проверено на `.tmp/v4-minimal.json`, 2 прогона → идентичный report, `--check` ok).
- [ ] Расширение IR/масок/spatial index, реальные стадии 0–6, emit v4→engine (TASK-003..008), node-тесты детерминизма/repair/report.

### [TASK-003] Слой 1 — ландшафт и гидрология (в работе)
- [x] `tools/citygen/pipeline/stage-1-landscape.mjs`: prepare/generate/validate/repair/emit; санитаризация terrain modifiers и hydrology (clamp height/radius/center/width/depth), drop невалидных рек (path < 2), переименование дубликатов id, easement-маска русел, emit в `cityforge.terrain/hydrology`, диагностика/repairs/drops в отчёте.
- [x] Базовая процедурная генерация из `generator.landscape` (детерминированно, seed/subseed): hills (mountain/valley, count/height/radius, размещение с отступом от spawn/exit) и опциональная река (meandering polyline, width/depth/axis/points, carveTerrain). Passthrough, если конфиг отсутствует/генерация не запрошена.
- [x] Геометрическая валидация/repair (базово): clamp точек русла в границы плиты (`clamp_river_path_bounds`), drop самопересекающихся русел (`river_self_intersection`), предупреждение о конфликте русла с якорями spawn/exit (`river_anchor_conflict`), repair крутых модификаторов по отношению |h|/r (`repair_steep_modifier_radius`/`repair_steep_modifier_height`, warning `terrain_steep_modifier_repaired`); easement-коридоры рек в маске.
- [x] `tools/citygen/pipeline/stage.mjs`: поддержка `emit()`; оркестратор использует stage 1.
- [x] Node-тесты: `tools/citygen.test.mjs` (детерминизм/repair/generation/геометрия stage 1) — в CI (node job).
- [ ] Углублённая геометрическая валидация: уклоны/затопление по рельефу, самопересечения контуров/озёр, конфликты easement с обязательными коридорами (с учётом мостов/сети).
- [ ] Расширенный repair (сглаживание/снижение амплитуды, сдвиг/перетрассировка русла, маркировка «нестроевых» зон) и процедурная генерация, достаточная для пилота гл.16.

### [TASK-004] Слой 2 — транспортный граф, мосты, развязки (в работе)
- [x] `tools/citygen/pipeline/stage-2-transport.mjs`: prepare/generate/validate/repair/emit для `networks.roads` (nodes/segments/junctions), uniq id, drop вырожденных сегментов, проверка ссылок `from/to`, предупреждения о крутых участках (`segment_steep`), easement-маска дорог, сводка графа/компонент связности, предупреждения `anchor_far_from_roads`/`road_graph_disconnected`.
- [x] Оркестратор использует stage 2; node-тесты в `tools/citygen.test.mjs` (degenerate/steep, связность/якоря/easement, детерминизм).
- [x] Базовая процедурная генерация `generator.transport.generate` (детерминированно): маршрут spawn↔exit (L-образный), профилирование пересечений русел (подъём/рампы-мост) по easement рек, emit узлов/сегмента; end-to-end v4 (landscape+transport) → open-каталог подтверждён.
- [x] Профилирование по рельефу (аппроксимация высот по `terrain.modifiers`/`reliefOf`) и рекам, мостовой профиль с клиренсом над грунтом/руслом, ограничение уклона (`clamp_segment_slope`/`segment_slope_repaired`) и фиксация концов в якорях с локальным repair; детерминированные диагностики (`transport_generated`, `transport_bridge_profiled`). `tools/cityforge-compile.mjs`: привязка площадок `anchored` — по ближайшей точке (исправляет неверный уровень pad при подходе с перепадом).
- [x] Базовая процедурная генерация связной сети (детерминированно): артерия spawn↔exit + ответвления/коннекторы (`generator.transport.branches`, разбиение артерии в узле), явный граф узлов/сегментов, профилирование/мосты/уклоны на всех сегментах; выбор L-изгиба минимизирует пересечения русел (детерминированно).
- [x] Валидация самопересечений пути сегмента (`segment_self_intersection`, XZ) и конфликтов с руслом (`road_river_conflict` при точках в коридоре на низкой отметке); тесты обновлены под сетевую генерацию.
- [x] Repair связности: при разрыве компонент `spawn↔exit` добавляется профилированный коннектор (`tr_repair_connect`, `connect_spawn_exit_components` / `transport_repaired_connectivity`).
- [x] e2e v4 (landscape+transport) компилируется в open-каталог стабильно (`node --test tools/citygen.test.mjs` 11/11, `node tools/check-levels.mjs` 28/28).
- [ ] Процедурная трассировка сети (классы дорог, сетка/артерии, мосты над водой/оврагами с корректными клиренсами, развязки/рампы), гарантированная достижимость spawn↔exit по навигации, валидация клиренсов/уклонов/самопересечений уровней, repair (перетрассировка, понижение класса, локальная правка высоты).

### [TASK-005] Слой 3 — районы и парцелляция (в работе)
- [x] `tools/citygen/pipeline/stage-3-districts.mjs`: ingest/нормализация объявленных районов и профилей (`generator.districts/profiles`), merge с базовыми профилями, детерминированная автогенерация сетки районов при отсутствии объявлений, базовые правила совместимости/выбора типов, нарезка parcel-слотов (AABB) по профилю участка, валидация границ/профилей/соседства (warn) и repair fallback профиля, emit сводки в report/IR.
- [x] Базовый набор профилей расширен (office/park/industrial/luxury/residential/slums/forest/parking/sports) с весами, материалами и параметрами зданий/участков.
- [x] Оркестратор использует stage 3; node-тест `tools/citygen.test.mjs` (детерминизм, авто-районы/парцеллы, разнообразие типов, статус стадии).
- [ ] Полный набор профилей/параметров под задачу и MVP-пилот (семантика всех требуемых районов/объектов), матрица соседства/совместимости и fallback-цепочки по плану, целевые доли/ограничения размещения.
- [ ] Парцелляция с учётом доступа к сети/дорогам и резервов, более точные геометрии/маски/ячейки, бюджеты/плотности, связь с TASK-004/006 (emit для зданий/структур).

### [TASK-006] Слой 4 — здания и крупные структуры (в работе)
- [x] `tools/citygen/pipeline/stage-4-buildings.mjs`: детерминированная генерация простых невводимых зданий (`isEnterable:false`, `foundation:terrain`, прямоугольный footprint, этажность/материал по профилю района) из parcel-слотов с бюджетом плотности.
- [x] Конфликтная фильтрация размещения: избегание русел (консервативный river easement/берега), коридоров/сегментов дорог и зон `spawn/exit`; emit в `input.buildings` для прохождения общего пайплайна (compile → normalize → catalog).
- [x] `tools/build-level.mjs`: детерминированный build-repair — при конфликтах размещения зданий в normalize/валидации (вода/улица/русло/план дороги) конфликтующие здания удаляются и каталог пересобирается; факт фиксируется в `generation-report.json` (без parser-warnings).
- [x] Оркестратор использует stage 4; e2e v4 (landscape+transport+districts+buildings) компилируется в open-каталог (`node --test tools/citygen.test.mjs` 12/12).
- [ ] Каталог типов/архетипов и размещение по правилам районов (вкл. высотные/плотностные ограничения), вводимые здания/проходы, мегастроения с проездами, skybridge; валидация доступа/опоры/бюджетов на чанк.

### [TASK-008] Слой 6 — финализация и пилот гл.16 (в работе)
- [x] Пилотный источник `src/levels/level-16.json` (v4, на базе гл.15): плита 1280×1280 м, `stream {chunk:256, keep:2, aheadMin:200, aheadMax:1200, budgetMs:80}`, goal exit spawn↔exit, `generator` (landscape hills+river, transport с ветвлениями, авто districts/buildings).
- [x] Сборка: `node tools/build-level.mjs src/levels/level-16.json` → каталог `src/levels/level-16/` (25 чанков 5×5×256 м, 443 участника/401 владелец) + детерминированный `generation-report.json`; `--check` совпадает, предупреждений парсера 0 (2 конфликтующих здания сняты build-repair).
- [x] Регистрация пилота: `src/levels/index.js`/`LEVEL_NUMBERS` (+16). Проверки: `node --test tools/citygen.test.mjs` 12/12, `node tools/check-levels.mjs` 32/32.
- [ ] Замеры метрик пилота (старт/окно/p95 помпы, память/узлы, связность/достижимость spawn↔exit в рантайме) относительно гл.15 и `docs/open-world-plan.md`; итеративная настройка генератора/параметров под бюджеты.
- [ ] Финализация слоя 6 в генераторе (полная связность/emit/кросс-стадийные проверки) и доведение состава районов/застройки до требований MVP-пилота.

## Остаётся уточнить
- (нет — решения зафиксированы в плане §10, §15; при реализации допустимы уточнения в ADR без изменения принятых решений)
