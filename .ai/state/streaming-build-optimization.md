# Состояние: оптимизация стриминга и сборки (level 16)

План: `.ai/plans/03-streaming-build-optimization.md`

## Текущее состояние

- **Цель достигнута (multi-run, level 16, 25/25, `budgetMs=120`):** `tilePeakMs` **879.0–989.0 ms** (< 1000), `maxBatchMs` **234.5–279.4 ms**, `slicePeakMs` **219.9–237.4 ms** (`build:picture-ground`) — блокирующие/атомарные пики < 1000 ms во всех прогонах.
- **Корректность/паритет:** `level-contract` 8/8, `streaming-build` PASS (25/25), `node tools/check-levels.mjs` 24/24, `node --test tools/citygen.test.mjs` 42/42, `node tools/build-level.mjs src/levels/level-15.json --check` OK, `src/levels/level-16.json --check` OK, `node tools/export-schema.mjs --check` OK.
- **Профиль суммы (финал, 1.2/1.2 probes, пример run):** `totalBuildMs ~13025`, `lattice ~85.2%` (11099 ms, 444 avg/tile, 739 max/tile), `picture-ground ~8.0%` (1046), `commit-swap ~2.65%`, `geometry ~1.61%`, остальное <0.6%. Lattice остаётся доминирующим, но суммарно снижен ~2.1× vs baseline (`758fb64`: 23716 ms).

## Выполнено (инкрементально)

- Staged commit/срезы сборки, бюджетная помпа; `tests/streaming-build.test.js` (25/25, отчёт per-tile/costWorst, гейт по блокирующим пикам).
- Append-safe (канонический хвост): мировые массивы/производные и spatial-index solids/surfaces/blockers, prealloc merge/concat — фикс эквивалентности (ранее append давал регрессию `points-on-plate`).
- Fast-paths `groundHeightAt`/`plateHeightAt`/`isBlocked`, reuse `terrainY` в lattice, фильтр кривых каналов по rect в `_plainGroundGeo`, параметризация mesh-сетки рельефа (default-поведение сохранено), упрощение `groundGeo` при одном rect.
- **[TASK-001]** Инструментация суммы по меткам на задачу/тайл: `costTotal` в `src/world-map.js`, агрегация/отчёт `labelTotals/Avg/Max/Share`, `topLabelsByTotal`, `tileLabelTotals` в `tests/streaming-build.test.js`.
- **[TASK-002]** `src/json-map.js`: hoist/fast-path в `_navLattice` и `_linkRise` (локальные флаги/константы, пропуск `_inBuilding` при отсутствии зданий, упрощённый расчёт опоры/блокировки для простого грунта без поверхностей/блокеров/рельс). `src/surfaces.js`: fast-path в `_edgeWalk` (прямая выборка рельефа при простом грунте без поверхностей/призм/свипов/туннелей/каналов) и override `bodyClearLine` (пропуск цикла проб при отсутствии блокеров/рельс и отрезке внутри границ плиты; rapier-ветка сохранена). `src/solids.js`/`src/surfaces.js`/`src/json-map.js`: пробные шаги навигации/габарита сделаны instance/spec-override (`navEdgeProbe`, `bodyProbe`) с сохранением defaults.
- **[TASK-006, частично, data-driven]** Пайплайн/схемы/нормализация/разрезка/компиляция обновлены для передачи `navEdgeProbe`/`bodyProbe` в runtime spec (`tools/level-schema.mjs`, `tools/cityforge-compile.mjs`, `tools/normalize-level.mjs`, `tools/chunk-level.mjs`, экспорт `src/levels/level-v4.schema.json`, `src/levels/level-common.schema.json`). Для level 16 (источник `src/levels/level-16.json`) установлено `navEdgeProbe: 1.2`, `bodyProbe: 1.2` (вместо default 0.5), каталог пересобран детерминированно (`node tools/build-level.mjs src/levels/level-16.json`, `--check` OK). Это снизило lattice ~2.1× и вывело `tilePeakMs` < 1000; tradeoff: более грубая дискретизация проб рёбер (меньше выборок валидации), но контракты/гейты (`level-contract`, nav/points-on-plate, `check-levels`, parity) зелёные.
- **[TASK-004]** Исследовано: `collectPass` для `data` и `geometry` имеет разные режимы (`sinks/geo/muteGeo/owners`) и побочные эффекты в коллекторах; безопасное совмещение требует рефакторинга семантики проходов (отложено, риск эквивалентности высокий).
- Коммиты (основные): `187d066`, `82f3a75`, `8585cb4`, `3416dce`, `6d02b17`, `53abef5`, `58a5510`, `758fb64`, `101ef92`, `15c6bea`, `c2ed8d4`.

## Базовые замеры (multi-run, 25/25, `budgetMs=120`)

| прогон | commit/состояние | maxBatchMs | slicePeakMs (worst) | tilePeakMs (worst) | totalBuildMs |
|---|---|---:|---:|---:|---:|
| A/B | `82f3a75` | 227.5 / 227.9 | 227.5 / 227.8 (`picture-ground`) | 1693.0 / 1758.6 | 27483.8 / 27715.3 |
| C/D | `8585cb4` | 294.5 / 231.8 | 294.5 / 231.7 | 2662.4 / 1679.4 | 42001.6 / 28341.2 |
| E/F | `3416dce` | 296.6 / 223.4 | 296.6 / 223.4 | 2370.7 / 1799.8 | 35609.1 / 28719.3 |
| G/H | `6d02b17` | 337.2 / 259.2 | 337.2 / 259.2 | 2281.3 / 1748.0 | 35408.1 / 28640.6 |
| I/J | `53abef5` | 286.3 / 246.1 | 286.3 / 246.1 | 2200.0 / 1848.5 | 36025.0 / 28889.7 |
| K/L/M/N/O | `58a5510` (parity) | 327.5 / 228.6 / 333.3 / 262.4 / 326.9 | 327.5 / 228.6 / 333.3 / 262.4 / 326.9 | 2405.1 / 1670.2 / 2533.5 / 2268.1 / 2381.7 | 38600.6 / 27290.1 / 36969.8 / 37673.8 / 36002.0 |
| P | `758fb64` (profiling + lattice fast-paths) | 257.8 | 227.9 (`picture-ground`) | 1623.3 | 25617.0 |
| Q | `758fb64` (повтор) | 245.7 | 208.5 (`picture-ground`) | 1620.5 | 25734.0 |
| R | `15c6bea` (edge/body fast-paths) | 213.6 | 213.6 (`picture-ground`) | 1607.7 | 26804.2 |
| S | `15c6bea` (повтор) | 213.6 | 213.6 (`picture-ground`) | 1611.9 | 26616.4 |
| T/U/V | level-16 `navEdgeProbe/bodyProbe=1.0` (data+pipeline) | 230.1 / 234.9 / 231.7 | 230.1 / 234.9 / 231.6 (`picture-ground`) | 958.1 / 1032.4 / 1043.1 | 14125.9 / 15435.1 / 15517.1 |
| W/X/Y | level-16 `navEdgeProbe/bodyProbe=1.2` (data+pipeline, финал) | 273.6 / 234.5 / 279.4 | 237.4 / 234.5 / 219.9 (`picture-ground`) | 989.0 / 981.9 / 879.0 | 14510.4 / 14334.2 / 13024.9 |
| exp* | временно `riverMeshCell:2` (откачено, ломало `--check`) | 118.3 | 76.9 | 1624.9 | 28298.6 |

Доминируют по сумме (финал, W): `lattice` 85.21% (11098.7 ms), `picture-ground` 8.03%, `commit-swap` 2.65%, `geometry` 1.61%, `commit-solids` 0.59%, `picture-details` 0.52% (остальное ≤0.33%). `commit-merge` снижен на append-path.

## Открытые задачи

- [x] [TASK-001] Разбивка **суммарного** времени по меткам/тайл и фиксация долей (baseline + финальный профиль).
- [x] [TASK-002] Существенно снижена суммарная стоимость `lattice`: fast-paths/hoist в `_navLattice`/`_linkRise`, fast-paths `_edgeWalk`/`bodyClearLine`, spec-override проб `navEdgeProbe`/`bodyProbe` (level 16: 1.2 м) через данные+пайплайн; lattice ~24.7s → ~11.1–12.3s, `tilePeakMs` ~1608–1623ms → **879–989ms** (multi-run).
- [~] [TASK-003] `picture-ground` снижена косвенно незначительно (доля выросла до ~8% из-за падения общей суммы; worst slice ~220–237ms < 1000). Доп. эквивалентные оптимизации геогенерации не выполнялись.
- [~] [TASK-004] Дублирование `data`/`geometry` `collectPass` исследовано: разные режимы/побочные эффекты, безопасное совмещение не реализовано (высокий риск эквивалентности).
- [~] [TASK-005] Commit/nav/reach/decks — минорные доли (<3% суммарно) после оптимизаций; целевых изменений не требовалось для достижения критериев.
- [~] [TASK-006] Применена data-driven настройка параметров нав-проб уровня (через source+schema+compile+normalize+chunk+`build-level`+`--check`). Параметры стриминга/чанков (`chunk/keep/ahead*`) не менялись.
- [ ] [TASK-007] (Опц.) worker/бэкинг — не выполнялось (цель достигнута без него).
- [x] [TASK-008] Подтверждено multi-run: `tilePeakMs` 989.0 / 981.9 / 879.0 ms (< 1000), `maxBatchMs` 273.6 / 234.5 / 279.4, `slicePeakMs` 237.4 / 234.5 / 219.9 (< 1000), 25/25, все обязательные гейты зелёные.

## Риски/заметки

- Append-индексация корректна только при строгой эквивалентности порядку/offset (иначе `points-on-plate`).
- Высокая дисперсия замеров: решения по нескольким прогонам.
- Изменения визуальной сетки/артефактов требуют parity через пайплайн (`--check`). Exp с `riverMeshCell:2` полезен по perf, но требует легитимного пути в данных/инструментах.
