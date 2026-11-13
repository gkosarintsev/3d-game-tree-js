# План: оптимизация стриминга и сборки открытого мира (устранение пиков >1s)

Дата: 2026-11-13. Статус: **выполнено (целевые критерии достигнуты, multi-run подтверждено)**.  
Связанный контекст: `docs/open-world-plan.md`, `docs/architecture-map-contract.md`, `docs/architecture-json-levels.md`, `tests/streaming-build.test.js`, `src/world-map.js`, `src/json-map.js`, `src/surfaces.js`, `src/solids.js`, `.ai/state/streaming-build-optimization.md`.

## 0. Цель и критерии успеха

Снизить стоимость загрузки/достройки тайлов открытого мира (level 16, 5×5×256 м, `budgetMs=120`) так, чтобы:

- **Блокирующие/атомарные пики** отсутствовали: `maxBatchMs < 1000` и `slicePeakMs < 1000` в нескольких стабильных прогонах при полной загрузке 25/25 тайлов.
- **Кумулятивный пик тайла** (ideal/полная цель): `tilePeakMs < 1000` в нескольких стабильных прогонах.
- **Корректность/паритет сохранены:** `node tools/ci-browser.mjs --level 16 --suites level-contract` (8/8, в т.ч. `points-on-plate`), `node tools/ci-browser.mjs --level 16 --suites streaming-build`, `node tools/check-levels.mjs`, `node --test tools/citygen.test.mjs`, `node tools/build-level.mjs src/levels/level-15.json --check` и `src/levels/level-16.json --check` — зелёные. Детерминизм, контракт карты, семантика опор/навигации и `--check`-паритет не нарушаются.

> Примечание: «нет подвисаний» в рантайме определяется **бюджетом кадра/батча** (`maxBatchMs`/`slicePeakMs`), а не суммарным временем готовности тайла; `tilePeakMs` — цель по времени готовности/суммарной работе.

## 1. Текущее состояние (факт, по замерам)

- **Блокирующие пики:** устранены в multi-run (типично `maxBatchMs/slicePeakMs` ~220–340 ms, worst `build:picture-ground`).
- **Кумулятивно:** `tilePeakMs` ~1.67–2.53 s (существенная дисперсия среды), 64 среза/тайл, 25/25 loaded/built.
- **Доминирующие вклады в сумму (по `costWorst`/структуре):**
  - `lattice` — ~43 рядовых среза/тайл (`_navLattice` + `_linkRise`/`edgeOk`, пробы `relief.heightAt`/`groundHeightAt`/`isBlocked`/`_inBuilding`) — основной источник суммарной работы.
  - `build:picture-ground` — генерация грунтовой геометрии (`_groundGeo`/`_plainGroundGeo`/`_riverGroundGeo`, height/normal выборки, вырезы/merge).
  - `geometry` — повторный `collectPass` (данные vs геометрия владельцев/waterRects) и построение geo-групп.
  - `picture-meshes`/`picture-details` (merge/create, окна/вывески/props/lights/water), `commit-swap`/`decks` и nav-проходы.
- **Уже сделано (инкрементально, correctness-safe):** staged commit/срезы, append мировых массивов и spatial-index при каноническом хвосте (фикс эквивалентности/`points-on-plate`), prealloc merge/concat, fast-paths `groundHeightAt`/`plateHeightAt`/`isBlocked`, reuse `terrainY`, фильтр кривых каналов по rect в `_plainGroundGeo`, параметризация mesh-сетки рельефа (default без изменений), тест `tests/streaming-build.test.js`.

## 2. Ограничения и инварианты

- Без изменения семантики опор, навигации, контракта карты и детерминизма; `collectData`/проходы/порядки там, где значимы — эквивалентны.
- Декор не становится твёрдостью; вторая арифметика опоры запрещена; картинка = опора.
- `--check`/паритет источников и сгенерированных артефактов (15/16) обязателен; изменения, требующие правки данных/пайплайна, — через `build-level` и schema/инструменты детерминированно.
- Three.js/WebGL и мутации сцены — main thread; commit/swap/применение результатов — атомарно и в бюджет кадра.
- Замеры зависят от среды: подтверждать multi-run, фиксировать разброс.

## 3. Стратегия (фазы)

1. **Наблюдаемость и профилирование:** разложить `tilePeakMs` по суммарному времени меток/фаз на тайл, чтобы целиться в фактические доли (а не только в пики).
2. **Снижение суммарной стоимости lattice:** главный рычаг (число срезов × стоимость среза).
3. **Снижение стоимости ground/geometry/picture:** убрать лишнюю работу и дублирование проходов без смены результата.
4. **Commit/nav/pump:** удержать append/инкрементальность, сократить оставшиеся O(world) операции и хвосты.
5. **Стриминг/данные (при необходимости и допустимости):** параметры окна/приоритета и бэкинг/пайплайн — только с parity и контрактом.
6. **Параллелизация подготовки (опционально, высокий риск/стоимость):** worker + переносимые буферы, main-thread интеграция.

## 4. Задачи

### [TASK-001] Профилирование суммарного времени по фазам/тайл — [x]
- [x] Расширен отчёт `streaming-build` суммой времени по меткам на тайл/задачу: `costTotal`, `labelTotals/Avg/Max/Share`, `topLabelsByTotal`, `tileLabelTotals`.
- [x] Зафиксирована разбивка и доли в `.ai/state/streaming-build-optimization.md` (baseline + финальный профиль).
- [x] Диагностика не влияет на гейты/детерминизм.

### [TASK-002] Оптимизация `_navLattice` / нав-сетап (кумулятивно) — [x]
- [x] Проанализирован горячий путь (`_inBuilding`, `relief.heightAt`, `groundHeightAt/plateHeightAt`, `isBlocked`, `nav.add/link`, `_linkRise/edgeOk`).
- [x] Внедрены эквивалентные удешевления: fast-paths/hoist в `_navLattice` и `_linkRise` (`src/json-map.js`), fast-paths `_edgeWalk` и `bodyClearLine` (`src/surfaces.js`), instance/spec-override `navEdgeProbe`/`bodyProbe`.
- [x] Параметризация плотности проб применена для level 16 **через данные/спек/пайплайн**: `src/levels/level-16.json` (`navEdgeProbe: 1.2`, `bodyProbe: 1.2`), schema/compile/normalize/chunk/build обновлены, `build-level` пересобран, `--check` OK.
- [x] Суммарный вклад lattice снижен ~2.1× (23716 ms → 11099–13392 ms), `tilePeakMs` < 1000 ms (multi-run), `level-contract` зелёный.

### [TASK-003] Оптимизация `picture-ground` (`_groundGeo`) — [~]
- [~] Профилирование: ~4–8% суммы, worst atomic slice ~208–237 ms < 1000. Доп. эквивалентные рефакторинги не потребовались для критериев; возможны как follow-up.

### [TASK-004] Устранение дублирования `geometry`/`collectPass` и удешевление picture-фаз — [~]
- [~] Исследовано: `data`/`geometry` проходы различаются режимами и побочными эффектами; безопасное совмещение не реализовано (риск эквивалентности).

### [TASK-005] Commit, nav-проходы, помпа — [~]
- [x] Append-safe инкрементальность, бюджетная нарезка и учёт `costWorst` сохранены. `commit-swap`/nav-подфазы/`reach`/`decks` минорны.

### [TASK-006] Параметры стриминга и чанков (данные/конфиг, при обосновании) — [~]
- [x] Применён data-driven параметр `navEdgeProbe`/`bodyProbe` для level 16 через source+schema+tooling+`build-level`+`--check` с multi-run и контрактной верификацией.
- [ ] `stream.chunk/keep/ahead*` не менялись (не потребовалось).

### [TASK-007] (Опционально, высокий риск) Предподготовка в воркере / бэкинг — [ ]
- [ ] Не выполнялось (цель достигнута).

### [TASK-008] Верификация, регрессии и отчётность — [x]
- [x] Multi-run `streaming-build` (level 16, 25/25): `tilePeakMs` 989.0 / 981.9 / 879.0 ms, `maxBatchMs` 273.6 / 234.5 / 279.4, `slicePeakMs` 237.4 / 234.5 / 219.9. `level-contract` 8/8.
- [x] Обязательные проверки: `check-levels` 24/24, `citygen` 42/42, `build-level --check` level-15/16 OK, `export-schema --check` OK.
- [x] `.ai/state/streaming-build-optimization.md` обновлён (метрики до/после, профиль, tradeoff, остаток).

## 5. Порядок выполнения (рекомендуемый)

1. [TASK-001] — получить разбивку по сумме (подтвердить доли lattice/ground/geometry).  
2. [TASK-002] + [TASK-003] — наибольший ожидаемый эффект на `tilePeakMs`.  
3. [TASK-004] — снять дублирование collect/geometry/picture.  
4. [TASK-005] — добрать хвосты commit/nav.  
5. [TASK-006] — если после оптимизаций кода потолок не достигнут, подобрать параметры стриминга/чанков через данные.  
6. [TASK-007] — только при доказанной необходимости и приемлемой сложности.  
7. [TASK-008] — непрерывно на каждом значимом шаге.

## 6. Риски

- **Эквивалентность:** ускорение lattice/ground/индексов легко ломает опоры, швы, связность или детерминизм (пример: append-index и `points-on-plate`).
- **Дисперсия замеров:** выводы делать по нескольким прогонам; не «подгонять» под единичный результат.
- **Parity/пайплайн:** изменения меш-сетки/бэкинга/форматов требуют согласованного обновления данных и инструментов.
- **Рост сложности:** воркеры/бэкинг увеличивают стоимость поддержки и отладки.
