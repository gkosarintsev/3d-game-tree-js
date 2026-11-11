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
- [~] A3.1: аудит текущей детализации/баланса (выявлено: `district_without_buildings` для `district_1_1` campus и `district_1_2` residential; `suburb` не попал в раскладку гл.16 при 4×4; luxury access 0.573 без предупреждения)
- [~] A3.2: улучшение district-правил/баланса (stage 4: добавлен pass представительности районов; для проблемных районов конфликт/геометрия пока блокирует установку — требуется доработка)
- [ ] A3.3: новые процедурные props/вариации материалов при необходимости
- [ ] A3.4: perf-gate (`open-world --details`, worst-frame `picture`) и фиксация метрик

### M3 — Развязки (прототип)
- [ ] B1–B3: спецификация/шаблоны/валидация

### M4 — Анимации врагов (базовый каркас)
- [ ] C1–C3: аудит, дизайн, базовые состояния

### M5 — Расширение и стабилизация
- [ ] B4, C4–C5: тесты/perf/lifecycle/полировка

## Результаты M1 (пилот гл.16, детерминированно)
- Пересборка: `src/levels/level-16.json` (car spot скорректирован) → `src/levels/level-16/` + `generation-report.json`.
- Сеть/сводка: roads 134/110, components 1, skeleton 3965/3963 (441→2, 37 вне большой сети), 400 зданий / 320 props / 8 lights, chunks 5×5, summary 0E/3W/12R/0D.
- Новые типы в пилоте: `commercial`, `campus`, `market`, `old_town` (+ `suburb` в профилях/генераторе, в данной раскладке может не выпадать из-за сетки/target mix). Props/buildings присутствуют для commercial/campus/market/old_town.
- Доступ (report): нет `district_type_poor_road_access`; `anchors_connected_network`. Road-needy ratios: industrial 0.922, luxury 0.573, office 1.0, parking 0.981, residential 0.988, sports 1.0 (luxury ниже прочих, но без порогового предупреждения).
- Предупреждения: `district_without_buildings` для `district_1_1` (campus) и `district_1_2` (residential) — баланс/покрытие зданий в части районов можно доработать в M2.

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
- 2026-11-12: начат M2 — аудит баланса/деталей пилота гл.16, добавлен pass представительности районов в stage 4 (без изменения текущего детерминированного вывода; `district_without_buildings` для campus/residential сохраняется из-за конфликтов/размещения), требуется дальнейшая доработка A3.2–A3.4 и perf-замеры. M3 (развязки), M4–M5 (анимации) запланированы.