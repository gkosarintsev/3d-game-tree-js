# Состояние: расширение citygen, детали, развязки, анимации врагов

План: `.ai/plans/02-citygen-expansion-and-animations.md` (2026-11-12). Статус: **M1 (базово) завершён** — добавлены новые типы районов и параметризованные типы/архетипы зданий, пилот гл.16 пересобран детерминированно, node-gates зелёные. M2–M5 не начаты.

## Задачи

### M1 — Районы и типы домов (текущий инкремент)
- [x] A1.1: новые профили районов (stage 3) `commercial`, `suburb`, `old_town`, `campus`, `market` + `COMPAT`/`FALLBACK_CHAINS`/target counts/road-needy|averse/bias
- [x] A1.2: правила props для новых районов (stage 5) + веса квот/палитры
- [x] A1.3: отчёт/диагностики покрывают новые типы (`districtTypes`, `byDistrictType`, `propsByDistrictType`, `roadAccessByType` по отчётным типам), pilot-тест обновлён (docs без отдельного изменения — поведение описано кодом/отчётом)
- [x] A2.1: таблица архетипов зданий в stage 4 (`ARCHETYPES`, материалы/диапазоны floors/floorHeight/scale/aspect)
- [x] A2.2: детерминированный выбор kind/формы и разнообразие footprint (пропорции/масштаб) в пределах конфликт-проверок
- [ ] A2.3: композиции из нескольких зданий на участке (опц., не делалось)
- [x] A2.4: `--check`/пересборка пилота и node-gates зелёные

### M2 — Детали и perf-gate (в работе)
- [x] A3.1: аудит текущей детализации/баланса (выявлено: отсутствие зданий в части районов из-за бюджетного насыщения/конфликтов easement-масок, `suburb` не попал в раскладку гл.16 при 4×4, luxury access 0.573 без порогового предупреждения)
- [~] A3.2: улучшение district-правил/баланса — **частично**: stage 4 (лимит normalBudget, pass представительности, детерминированное recovery-размещение с игнорированием только easement-AABB при проверке реальных сегментов дорог) устранил `district_without_buildings` в пилоте гл.16; остаются баланс типов/раскладки (`suburb`), luxury access и возможная донастройка конфликт-логики
- [ ] A3.3: новые процедурные props/вариации материалов при необходимости (доп. детализация районов)
- [ ] A3.4: perf-gate (`open-world --details`, worst-frame `picture`) и фиксация метрик (не выполнялось в этой сессии)

### M3 — Развязки (прототип)
- [ ] B1–B3: спецификация/шаблоны/валидация

### M4 — Анимации врагов (базовый каркас)
- [ ] C1–C3: аудит, дизайн, базовые состояния

### M5 — Расширение и стабилизация
- [ ] B4, C4–C5: тесты/perf/lifecycle/полировка

## Результаты M1/M2 (пилот гл.16, детерминированно, после баланс-прохода)
- Пересборка: `src/levels/level-16.json` → `src/levels/level-16/` + `generation-report.json`.
- Сеть/сводка: roads 134/110, components 1, skeleton 3965/3963 (441→2, 37 вне большой сети), **401** здание / **320** props / **8** lights, chunks 5×5, summary **0E/0W/12R/0D** (нет `district_without_buildings`).
- Новые типы в пилоте: `commercial`, `campus`, `market`, `old_town` (+ `suburb` в профилях/генераторе, в данной раскладке 4×4 может не выпадать). Props/buildings присутствуют для commercial/campus/market/old_town.
- Доступ (report): нет `district_type_poor_road_access`; `anchors_connected_network`. Road-needy ratios: industrial 0.922, luxury 0.573, office 1.0, parking 0.981, residential 0.988, sports 1.0 (luxury ниже прочих, без порогового предупреждения; требуется M2 A3.2).

## Проверки
- `node --check` stage 3/4/5 ok
- `node tools/build-level.mjs src/levels/level-16.json` + `--check` ok
- `node tools/export-schema.mjs --check` ok
- `node tools/check-levels.mjs` — 24/24
- `node tools/build-level.mjs src/levels/level-15.json --check` ok
- `node --test tools/citygen.test.mjs` — 36/36 (pilot assertions обновлены под новый детерминированный результат)
- `node tools/level-parser.test.mjs` — 8/8
- `node --test tools/relief.test.mjs tools/track.test.mjs tools/chunk.test.mjs` — 3/3 pass

## Лог
- 2026-11-12: создан план и состояние. Реализован M1 базово (stage 3/4/5, пилот пересобран, тесты/артефакты обновлены, gates зелёные).
- 2026-11-12: начат M2 — аудит баланса/деталей пилота гл.16, добавлен pass представительности районов в stage 4; выявлены `district_without_buildings` (campus/residential) из-за бюджетного насыщения и конфликтов easement-масок.
- 2026-11-12: M2 A3.1/A3.2 (частично) — нормализация бюджета размещения и детерминированное recovery-размещение (проверка реальных сегментов дорог, игнорирование только easement-AABB в recovery) устранили `district_without_buildings` в гл.16 (401 здание, 0W). Пилот/тесты/артефакты обновлены, node-gates зелёные. Остаются: баланс типов/`suburb`/luxury access (A3.2), доп. детали/props (A3.3), perf-gate (A3.4), M3 (развязки), M4–M5 (анимации).