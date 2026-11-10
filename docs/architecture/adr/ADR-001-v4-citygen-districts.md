# ADR-001: Генератор города v4 (районы), scope и чистка legacy

- Статус: **принято** (планирование, TASK-001)
- Дата: 2026-11-11
- Связано: `.ai/plans/01-city-generator-districts.md` (v4)

## Контекст

Нужен многослойный процедурный генератор города с явными районами, валидацией/repair и детерминизмом, без внедрения новых примитивов движка в MVP. Актуальная база — v3/CityForge (`kind: "cityforge"`, open-каталог). В репозитории остаются legacy-форматы/главы (terrain/stream/town, json/json2, open-legacy), обратная совместимость с ними не требуется.

## Решения

1. **Целевой формат — v4 с районами (развитие CityForge), пилот — глава 16 на базе главы 15.**
   - Идентификация: `$schema: "./level-v4.schema.json"`, `kind: "cityforge"`, `schemaVersion: 4`.
   - Верхний уровень: `metadata`, `ground`, `gameplay`, `stream`, опц. `buildings`, `cityforge` (v3-совместимые сущности/мир) + манифест `generator`.
   - `generator`: `{ generatorVersion, seed, deterministic, stages/layers(0–6), budgets, districts[{id,type/profileId,geometry|mask|cells,priority,overrides,fallbackChain}], profiles/catalog refs, policies }`.
   - Компиляция: v4-источник → `tools/citygen`/компилятор → engine-бриф/open-каталог через общий пайплайн `validate/normalize/skeleton/split/generateCatalog` (без дублирования арифметики). Переиспользование `level-common.schema.json`.
   - v3-главы в scope (03,05,07,08,09,10,15) не ломать без цели.

2. **Пилот (глава 16):** плита `1280×1280 м` (~1,638 км²), `stream { chunk:256, keep:2, aheadMin:200, aheadMax:1200, budgetMs:80 }` (5×5), на базе концепции гл.15. Метрики: `--check`/валидация без ошибок/предупреждений, детерминизм, связность spawn↔exit, старт/окно/p95 помпы и память/узлы — не хуже порядка гл.15 и в пределах `docs/open-world-plan.md` (замерить).

3. **MVP без новых примитивов движка.** Только существующие примитивы; сложные объекты (в т.ч. «труба над дорогой») — после стабилизации (первый кандидат — труба над дорогой, отдельная задача/ADR при расширении).

4. **Поведение и ассеты — хуки, не реализация.** Статично в MVP; опциональные `gameplay`/`properties` в схеме/IR. GLB зарезервирован в формате (`assets` prefab/`geometry.source` или `source`), загрузка не реализуется.

5. **`generation-report.json`** — детерминированный (без временных меток), коммитится для пилота рядом с источником/каталогом.

6. **Scope и чистка legacy (атомарно в TASK-001).**
   - Удалить уровни §1.1: `level-01.js`, `level-02.json`+`level-02/`, `level-04.js`, `level-06.js`, `level-11.json`+`.js`, `level-12.json`+`.js`, `level-13.json`+`.js`, `level-14.json`+`level-14/`; убрать из `src/levels/index.js` и из `check-levels`/browser/CI/фильтров.
   - Удалить `src/levels/level.schema.json`, `src/levels/level-v2.schema.json` и убрать v1/v2 из `tools/level-schema.mjs`, `tools/export-schema.mjs`, валидаторов/веток `build-level`, если v3/v4-scope от них не зависит (иначе — пометить неиспользуемыми).
   - Scope после чистки: v3 — 03,05,07,08,09,10,15; пилот — 16 (v4).

## Последствия

- Упрощение пайплайна/схем вокруг v3/v4, но требуется правка реестра, скриптов, CI и тестов, завязанных на legacy-главы (удалить/адаптировать тесты, специфичные для удалённых глав, в рамках scope).
- Детерминизм и побайтовый `--check` остаются обязательными для v3/v4-артефактов.