# Состояние: оптимизация стриминга и сборки (level 16)

План: `.ai/plans/03-streaming-build-optimization.md`

## Текущее состояние

- **Блокирующие/атомарные пики:** под контролем (multi-run, 25/25), типично `maxBatchMs/slicePeakMs` ~220–350 ms, worst `build:picture-ground`.
- **Кумулятивный пик тайла:** `tilePeakMs` ~1620–2530 ms (не < 1000), высокая дисперсия среды.
- **Корректность:** `level-contract` 8/8, `check-levels` 24/24, `citygen` 42/42, `build-level --check` 15/16 зелёные (на проверенных состояниях).
- **Профиль суммы (TASK-001, `758fb64`, 1 прогон post-commit, 25/25):** `totalBuildMs 25617.0`, `tilePeakMs 1623.3`, `maxBatchMs 257.8`, `slicePeakMs 227.9` (`picture-ground`). Доли по сумме: `lattice 92.58%` (23715.9 ms total, 948.64 avg/tile, 1328.9 max/tile), `picture-ground 4.05%` (1038.3), `commit-swap 1.22%` (313.8), `geometry 0.80%` (204.7), остальное <0.3% каждое. **Вывод:** для снижения `tilePeakMs` приоритет — кумулятивная стоимость `lattice` (кол-во срезов × стоимость узлов/рёбер), затем `picture-ground`/`geometry`.

## Выполнено (инкрементально)

- Staged commit/срезы сборки, бюджетная помпа; `tests/streaming-build.test.js` (25/25, отчёт per-tile/costWorst, гейт по блокирующим пикам).
- Append-safe (канонический хвост): мировые массивы/производные и spatial-index solids/surfaces/blockers, prealloc merge/concat — фикс эквивалентности (ранее append давал регрессию `points-on-plate`).
- Fast-paths `groundHeightAt`/`plateHeightAt`/`isBlocked`, reuse `terrainY` в lattice, фильтр кривых каналов по rect в `_plainGroundGeo`, параметризация mesh-сетки рельефа (default-поведение сохранено), упрощение `groundGeo` при одном rect.
- **[TASK-001]** Инструментация суммы по меткам на задачу/тайл: `costTotal` в `src/world-map.js`, агрегация/отчёт `labelTotals/Avg/Max/Share`, `topLabelsByTotal`, `tileLabelTotals` в `tests/streaming-build.test.js`.
- **[TASK-002, частично]** `src/json-map.js`: hoist/fast-path в `_navLattice` (локальные флаги/константы, пропуск `_inBuilding` при отсутствии зданий, упрощённый расчёт опоры/блокировки для простого грунта без поверхностей/блокеров/рельс), аналогичные fast-paths в `_linkRise` для split-точек. Эквивалентность подтверждена гейтами.
- Коммиты (основные): `187d066`, `82f3a75`, `8585cb4`, `3416dce`, `6d02b17`, `53abef5`, `58a5510`, `758fb64`.

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
| exp* | временно `riverMeshCell:2` (откачено, ломало `--check`) | 118.3 | 76.9 | 1624.9 | 28298.6 |

Доминируют по сумме (P): `lattice` 92.58% (23715.9 ms), `picture-ground` 4.05%, `commit-swap` 1.22%, `geometry` 0.80%, `commit-solids` 0.27%, `decks` 0.26%, `picture-details` 0.26% (остальное ≤0.16%). `commit-merge` снижен на append-path.

## Открытые задачи

- [x] [TASK-001] Разбивка **суммарного** времени по меткам/тайл и фиксация долей (1 прогон с диагностикой: см. профиль выше; при необходимости доп. прогоны для дисперсии).
- [~] [TASK-002] Существенно снизить суммарную стоимость `lattice` (эквивалентно). Сделано: fast-paths/hoist в `_navLattice` и `_linkRise`; доля lattice остаётся доминирующей (~92.6%).
- [ ] [TASK-003] Снизить суммарную стоимость `picture-ground`.
- [ ] [TASK-004] Убрать дублирование `collectPass`/geometry и удешевить picture-фазы.
- [ ] [TASK-005] Добрать хвосты commit/nav/reach.
- [ ] [TASK-006] Оценить/подобрать параметры стриминга/чанков (через данные, с parity).
- [ ] [TASK-007] (Опц.) worker/бэкинг при приемлемой сложности.
- [ ] [TASK-008] Достичь и подтвердить `tilePeakMs < 1000` (multi-run) при `maxBatchMs/slicePeakMs < 1000` и всех гейтах зелёных.

## Риски/заметки

- Append-индексация корректна только при строгой эквивалентности порядку/offset (иначе `points-on-plate`).
- Высокая дисперсия замеров: решения по нескольким прогонам.
- Изменения визуальной сетки/артефактов требуют parity через пайплайн (`--check`). Exp с `riverMeshCell:2` полезен по perf, но требует легитимного пути в данных/инструментах.
