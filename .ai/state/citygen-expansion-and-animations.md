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
- [~] A3.2: улучшение district-правил/баланса — **существенно выполнено**: stage 3 (детерминированное распределение required-типов + гарантия представительности всех профилей, уточнённая `COMPAT`) и stage 4 (лимит normalBudget, pass представительности, recovery-размещение) дают все 14 типов районов в пилоте гл.16 со зданиями/props, **0W/0E**, skeleton 1 компонента, luxury access 0.933. Остаётся точечная донастройка плотности/деталей по типам (при необходимости).
- [ ] A3.3: новые процедурные props/вариации материалов при необходимости (доп. детализация районов)
- [ ] A3.4: perf-gate (`open-world --details`, worst-frame `picture`) и фиксация метрик (не выполнялось в этой сессии)

### M3 — Развязки (прототип)
- [ ] B1–B3: спецификация/шаблоны/валидация

### M4 — Анимации врагов (базовый каркас)
- [ ] C1–C3: аудит, дизайн, базовые состояния

### M5 — Расширение и стабилизация
- [ ] B4, C4–C5: тесты/perf/lifecycle/полировка

## Результаты M1/M2 (пилот гл.16, детерминированно, после M2 A3.2–A3.3)
- Пересборка: `src/levels/level-16.json` → `src/levels/level-16/` + `generation-report.json`.
- Сеть/сводка: roads 134/110, components 1, skeleton 4055/4054 (447→1, 0 вне большой сети), **401** здание / **360** props / **8** lights, chunks 5×5, summary **0E/0W/13R/0D**.
- Типы районов в раскладке: **все 14** (`campus, commercial, forest, industrial, luxury, market, office, old_town, park, parking, residential, slums, sports, suburb`) — представлены, со зданиями и props (включая `suburb/market`); детализация props усилена (A3.3).
- Доступ (report): нет `district_type_poor_road_access`; `anchors_connected_network`. Road-needy ratios: industrial 1.0, luxury **0.933**, office 1.0, parking 0.891, residential 0.995, slums 0.967, sports 0.941. Adjacency/representation warnings устранены. Perf-gate (A3.4) не выполнялся.

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
- 2026-11-12: M2 A3.1/A3.2 (существенно) — нормализация бюджета/представительности (stage 4) и детерминированное распределение + гарантия всех типов/совместимости (stage 3) обеспечили в пилоте гл.16 **все 14 типов районов** (включая `suburb/market`) со зданиями и props, **0E/0W/13R/0D**, skeleton 1 компонента, luxury access **0.933**. Пилот/тесты/артефакты обновлены, node-gates зелёные.
- 2026-11-12: M2 A3.3 (частично) — усилена детализация props (stage 5: budget 360, roadside/district-specific плотность и вариативность в существующих примитивах), пилот пересобран детерминированно. A3.4 perf-gate не выполнен (нет playwright/браузерного раннера). Остаются: A3.4, M3 (развязки), M4–M5 (анимации).