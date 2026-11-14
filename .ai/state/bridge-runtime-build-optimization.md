# Состояние: ускорение рантайм-построения сложной мостовой геометрии

Дата: 2026-11-14. Статус: **завершено** (решение владельца 1A+2D+3B+4B+4C, см. § 0.1 плана).

План: `.ai/plans/08-bridge-runtime-build-optimization.md`.

## Решение

1. Приёмка — **объективные счётчики** (байты, число срезов, декоды, число вершин); headless-время — справка (шумно).
2. Стратегия **D**: bake горячих клеток + точечные рантайм-оптимизации.
3. Бюджет: чанк ≤ 3 МБ, загрузка ≤ 5 с; квантование нормалей + varint-индексы обязательны.
4. Эквивалентность численная: позиции ≤ 1e-4 м (факт — побитово), высоты ≤ 1 мм, nav ≤ 1 см, визуал без щелей.
5. Bake — разовый инструмент, артефакт коммитится; CI bake не запускает, но проверяет закоммиченный результат.
6. `.l14b` → **v2**, каталоги 07–10, 15–19 регенерированы.

## Задачи

- [x] **[TASK-001]** Базовый замер и профилирование — методика: инструментация `JsonMap` (`collectData/nav/totalData/navPhases/pictureMs`) и `WorldMap` (`sliceStats` помпы), прогоны headless + `ci-browser`; числа «до/после» — ниже.
- [x] **[TASK-002]** Рантайм-оптимизации без смены формата — `_railsBlock` по spatial candidates (`src/surfaces.js`), prealloc `_sweepGeo`/`_riverGroundGeo`, `fullySimple` lattice fast-path (`src/json-map.js`), picture-срезы помпы разбиты (`picture-ground`→geo/mesh, `picture-details`→props/detailed/decor/finish, per-building). Arc-дискретизация проверена — не хотспот, шаг не менялся.
- [x] **[TASK-003]** Укрупнение taper/rail — `jsonMap.taperStep=1`, `taperWidthStep=0.25`, `taperCrossStep=0.25` (`src/config.js`), дискретизация в `tools/normalize-level.mjs`; гл.18 пересобрана.
- [x] **[TASK-004]** Bake визуальной геометрии грунта — `.l14b` v2 (typed arrays `F32/F64A/U32A/I8A/U8A`, чтение файла до конца), `src/ground-bake.js` (компакт: pos Float32, нормали Int8, индексы delta-varint), `_geoFromGroundData` разворачивает компакт, fast-path `groundBaked` в `src/world-map.js`, sidecar merge в `tools/build-level.mjs`, `tools/bake-ground.mjs`, CI-сюита `tools/ground-bake.test.mjs`.
- [x] **[TASK-005]** Bake коллизий/навигации — **не нужен**: nav уже ускорена (гл.18 ×4.5; l17 lattice 621 мс при 321 срезе, max 6.8), второй формат не окупается.
- [x] **[TASK-006]** Валидация, регрессии, документация — гейты зелёные, «до/после» и решения зафиксированы; pre-existing падения перечислены отдельно.

## Замеры «до/после»

### Структура/данные (гл.18, TASK-003)

| Метрика | До | После |
|---|---|---|
| деков | 211 | 101 |
| `rails: true` | 206 | 93 |
| `bridge_taper` сегментов | 200 | 80 |
| чанки (total) | ~169 КБ | 105 231 Б |
| skeleton | 498/497 | 178/177 |

### Монолит/`JsonMap` (headless, медианы)

| Фаза | Гл.18 до | Гл.18 после | Гл.17 после |
|---|---|---|---|
| `navMs` | ~4839 | ~1065 (**×4.5**) | ~1119 |
| `collectDataMs` | 15.3 | 17.1–18.1 | 192.5–202.8 |
| `lattice` | — | 1006.6–1049.2 | 1021.1–1103.6 |

### Помпа `WorldMap` гл.18 (4 чанка)

- До split `picture-details`: worst-slice **185.8 мс**, `build:lattice` 1321.3 мс.
- После (4 прогона, `errors 0`): worst-slice **9.8–13.8 мс**, `build:lattice` total 752.4–945.7, `build:geometry` 6.9–7.5, `build:picture-ground-geo` 8.5–11.4.
- Финальный подтверждающий прогон: `errors 0`, firstChunk **297 мс**, worstChunk **388 мс**, worstSlice **12.4 мс** (`build:lattice`), `build:lattice` 855 мс (321 срез, max 12.4), `build:geometry` 8.7, `build:picture-ground-geo` 10.3.

### Помпа `WorldMap` гл.17 (4 чанка) — эффект bake

| Метрика | До bake | После bake (v2, финал) |
|---|---|---|
| `picture-ground-geo` total | 655.9–722.1 мс | **26.5 мс** (3 клетки) |
| `picture-ground-geo` max | 335.0–373.0 мс | **10.8 мс** |
| `build:geometry` | 135.1–175.3 мс | 167.2 мс (max **80.3**) |
| `build:lattice` | 466.2–532.0 мс | 621.3 мс (321 срез, max 6.8) |
| firstChunk | 346.2–415.0 мс | **241 мс** |
| worstChunk | 831.7–914.1 мс | **787 мс** |
| worstSlice | 335–373 мс (ground) | **80.3 мс** (`build:geometry`) |

- Изолированный fetch 4 чанков: **100 мс** total, max 47 мс; декод 1.4–4.8 мс/чанк. Прежние 8–12 с — голодание event loop в стенде, не формат.
- Эквивалентность bake (все 4 клетки): `posDev 0` (побитово), `nrmDev 3.9e-3` (≤0.5/127), `nrmAngle 0.370–0.372°`, треугольники 1:1.
- Размер: чанки 595 КБ → **7.31 МБ total / 2.69 МБ max** (≤3 МБ), sidecar 6.7 МБ (в бюджете не считается).

## Валидация (финальный набор)

- `node tools/check-levels.mjs` — **36/36**.
- `node tools/ground-bake.test.mjs` — **6/6** (round-trip typed arrays, хвост файла = ошибка, компакт-эквивалентность, артефакты гл.17).
- `node --test tools/visualizer/model.test.mjs` — **11/11**.
- `node tools/build-level.mjs <level>.json --check` для 07–10, 15–19 — **все совпадают с парсером** (гл.17 — 5 файлов: 4 чанка со вклеенным bake + sidecar).
- Browser (`NODE_PATH=$(npm root -g)`): `ci-browser.mjs --fast --level 17,18 --suites level-contract,streaming-build,level-lifecycle,open-world` — **13/13** (`level-contract 8/8`, `level-lifecycle 4/4`, `open-world 1/1`, `streaming-build` — skip по фильтру главы).

### Вне scope (не связано с правками, файлы сюжетов не менялись)

- `node tools/export-schema.mjs --check` — `level-v3/level-common/level-v4.schema.json` расходятся с экспортёром (дрейф в HEAD: `wallColor`, описание пластины).
- `level-parser.test` **7/8**, `chunk.test` **16/17** — падают на том же дрейфе схем.
- `citygen.test` — `fin.buildings 402` против `401` (гл.16).

## Найденный и исправленный дефект

Теги `T.F64A`/`T.U32A` писались, но отсутствовали в таблице чтения → `idx` декодировался как `null`, запечённая земля рендерилась неполной. Исправлено: добавлены `F64A/U32A/I8A/U8A`, декодер требует чтения файла до конца (`level-bin: после значения осталось N Б`), версия поднята до 2.

## Файлы

- Код: `src/level-bin.js`, `src/ground-bake.js`, `src/json-map.js`, `src/world-map.js`, `src/surfaces.js`, `src/config.js`, `tools/normalize-level.mjs`, `tools/build-level.mjs`, `tools/check-levels.mjs`, `tools/bake-ground.mjs`, `tools/ground-bake.test.mjs`, `tools/visualizer/detail.js`.
- Данные: `src/levels/level-{07..10,15..19}/*` (v2), `src/levels/level-17/chunk-*.ground.l14b`.
- Документация: `docs/architecture-level-pipeline.md`, `.ai/plans/08-bridge-runtime-build-optimization.md`, этот файл, `.github/workflows/ci.yml`.

## Остаток/рекомендации

- Остаточный хотспот помпы — `build:geometry` (80 мс, визуальная геометрия владельцев); вынесен в § 7 плана.
- Профилирование headless шумное: приёмка — по счётчикам/байтам/числу срезов, время — справка.
- Не коммитить несвязанные файлы: `M src/grass-material.js`, `M docs/prompts/007.md`, `?? .ai/state/port-all-houses.md`, `?? docs/houses/`, `?? docs/prompts/008-010.md`, `?? docs/roads.html`.
