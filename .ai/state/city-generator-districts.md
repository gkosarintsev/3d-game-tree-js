# Состояние: улучшение генератора города и районов

План: `.ai/plans/01-city-generator-districts.md` (v4, 2026-11-11, уточнён). Реализация начата (TASK-001).

## Прогресс

### [TASK-001] Базовая линия, scope/чистка, v4/ADR, пилот (в работе)
- [x] Базовая линия (до чистки): `node tools/check-levels.mjs` — **51/51 зелёные** (включая legacy). CI текущее: node (check-levels + parser/relief/track/chunk suites) + browser (все `tests/*.test.js`), см. `.github/workflows/ci.yml`.
- [x] Решения v4/пилота/clean-up зафиксированы: план §10/§15, ADR `docs/architecture/adr/ADR-001-v4-citygen-districts.md`.
- [x] Чистка legacy §1.1 и scope (частично/основное): удалены главы 01,02,04,06,11,12,13,14 и каталоги/артефакты; `src/levels/index.js` и `tools/check-levels.mjs` приведены к v3-scope (03,05,07,08,09,10,15); удалены `level.schema.json`/`level-v2.schema.json`, `tools/export-schema.mjs` экспортирует только v3+common; удалены/заменены заглушками тесты, зависевшие от удалённых глав (json2-level, terrain-traverse, track-city, physics-index, vehicle, relief-terrain/city, rotated-*); адаптированы `tools/level-parser.test.mjs`, `tools/chunk.test.mjs`.
- [ ] Дочистка: v1/v2 ветки в `tools/level-schema.mjs`/`build-level`/валидаторах (оставлены как неиспользуемые в v3/v4-scope, удалить при подтверждении), вычитка CI/browser-наборов и оставшихся ссылок, зелёный browser-прогон.
- [ ] Спецификация v4 в `tools/level-schema.mjs`/экспорт схем + пустой/минимальный прогон (TASK-001/002 стык).
- [ ] Параметры/метрики пилота гл.16 зафиксированы в артефактах (значения приняты в плане; замеры — в TASK-001/008).

**Проверки (после чистки):** `check-levels` 28/28, `export-schema --check` ok, `level-parser.test.mjs` 123/123, `relief.test.mjs` ok, `track.test.mjs` ok, `chunk.test.mjs` 17/17. Browser CI не прогонялся в этой среде.

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
- [~] [TASK-001] Базовая линия (v3-scope), атомарная чистка legacy (§1.1 + v1/v2 схемы/ветки) и scope CI, спецификация v4/ADR, параметры/метрики пилота (гл.16)
- [ ] [TASK-002] Каркас `tools/citygen/`, IR/WorldState, RNG/ids, контракт этапа, diagnostics/report, repair, хуки поведения/GLB, пустой v4-прогон
- [ ] [TASK-003] Слой 1 — ландшафт и гидрология (рельеф, реки, easement, валидация/repair, emit, тесты)
- [ ] [TASK-004] Слой 2 — транспортный граф, мосты, развязки (связность, шаблоны, клиренсы/уклоны, repair)
- [ ] [TASK-005] Слой 3 — районы и парцелляция (профили всех типов, соседство/fallback, нарезка, доли)
- [ ] [TASK-006] Слой 4 — здания и крупные структуры (каталог типов, размещение, мегастроения/проезды, skybridge)
- [ ] [TASK-007] Слой 5 — инфраструктура и props (только существующие примитивы; новые объекты после MVP, 1-й — труба над дорогой)
- [ ] [TASK-008] Слой 6 — финализация, чанки/скелет, связность, детерминированный `generation-report.json`, пилотная глава 16 (v4)
- [ ] [TASK-009] Тесты, документация, CI (v3/v4-scope: детерминизм/инварианты, browser-гейты, docs/ADR)

## Остаётся уточнить
- (нет — решения зафиксированы в плане §10, §15; при реализации допустимы уточнения в ADR без изменения принятых решений)
