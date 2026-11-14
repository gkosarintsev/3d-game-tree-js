# Пайплайн уровней из брифа: схема, сборка, правила данных

Дополнение к [AGENTS.md](../AGENTS.md), раздел «Уровни — это данные», и к
[docs/architecture-json-levels.md](architecture-json-levels.md). Нормативные
правила здесь обязательны.

## Пайплайн «JSON → Node → движок»

- Автор правит `src/levels/level-NN.json`, сборка:
  `node tools/build-level.mjs <путь>` → валидирует (`tools/level-schema.mjs`),
  нормализует (`tools/normalize-level.mjs`) и пишет `src/levels/level-NN.js`.
- В репозитории живут оба файла; модуль — производное. Совпадение с парсером
  проверяет `tools/level-parser.test.mjs`.
- Закоммиченный модуль обязан сходиться **побайтово** и **не нести
  предупреждений парсера** (предупреждение = геометрия ушла в обходной путь,
  в браузере может быть не видно).
- `JsonMap` не знает ни номера главы, ни схемы: ест нормализованные данные.

## Схема: один DSL

- Источник правды — DSL в `tools/level-schema.mjs`. JSON Schema draft-07
  экспортируется из него: `node tools/export-schema.mjs` →
  `src/levels/level-v3.schema.json`, `src/levels/level-common.schema.json`,
  `src/levels/level-v4.schema.json` (актуальный scope v3/v4). Рукописного `.schema.json` нет.
- Экспортёр обязан сходиться побайтово (`node tools/export-schema.mjs --check`).
- Каждый бриф начинается с `$schema` своей версии (в текущем scope — `./level-v3.schema.json` или `./level-v4.schema.json`; у v4 дополнительно `schemaVersion: 4`).
- Версии — разные корни (не `allOf`), т.к. `additionalProperties: false` в ветке
  draft-07 не видит внешние `properties`.
- У адресуемых полей обязателен `doc` (смысл, единица, источник предела) там, где это требуется DSL/экспортёром; примитивный элемент массива описывает массив. В v3/v4 `doc` — по правилам соответствующих спекификаций (в v3 неочевидные поля — на английском).
- `default` в DSL берётся из того же объекта, который его применяет
  (`CONFIG.jsonMap`, `CONFIG.fog/sun/hemi/night`, `DISTRICT_DEFAULTS`/
  `TRACK_DEFAULTS` из `tools/city.js` и др.), иначе схема станет второй правдой.
  Ключи `city` в схеме равны гейтам генератора (где применимо).
- **Число, равное `default`, в бриф не пишут.** Исключение-переключатель:
  наличие секции (`windows`, `clutter`, `signage`, `relief`, `city`) — воля
  автора, даже при всех дефолтных числах.
- Rationale главы — `metadata.notes` (в модуль не доезжает). JSONC/комментарии
  в JSON не используются (`JSON.parse` в пайплайне).
- Неизвестный/несогласованный `kind` опасен, поэтому схема держит перечисление и версионные ограничения. (Legacy v1/v2 схемы и брифы выведены из scope; поддержка в инструментах может сохраняться отдельно по решению плана.)

## Процедурные ряды вывода (json/json2)

- **Окна** (`windows`): секция включает механизм; `JsonMap` расставляет квады по
  фасадам. Числа — `CONFIG.jsonMap.windows` с `byMaterial`, не литералы в модуле.
  Меши — по одному на цвет палитры (`MeshBasicMaterial`). Квад — декор (без
  `solids`/`blockers`/узлов графа).
- **Мусор/props** (`clutter`): тот же вывод; сетка по кровлям/настилам; in-memory
  список в `props`. Браковка: запас `head`, перекрытие планом, внутри плана,
  ближе `minLamp`, несходство `groundHeightAt` с настилом. Меши — по паре
  «тип+материал»; `dispose()` снимает геометрию, но не модульные материалы.
  ГПСЧ — солёный шаг на отсчёт (`makeDraw`), не коррелирующий `fnvMix(hb, k+1)`.
- **Вывески** (`signage`): третий ряд (`windows`→`clutter`→`signage`), слоты по
  фасадам; `userData.quad = 'signage'`. Браковка: перекрытие объёма, дверной
  проём, не влезает под кровлю, лимит `perFace`. `byMaterial` — надстройка над
  базой; вертикальный пояс клампуется по `floorsCount − floors`.

## Генератор кварталов (`city`)

- Разворачивает **парсер** (`expandCity` в `tools/city.js`) до валидатора:
  `JsonMap` видит обычные `buildings`/`roads`, секция `city` в модуль не попадает.
- Детерминизм: единственный источник случайности — ГПСЧ с `city.seed`; **порядок
  вызовов значим** (правка → перегенерировать и коммитить модуль вместе).
- Авторская запись вытесняет сгенерированную по id и по префиксу `<лот>_`.
- Отказы — счётчики, не молчание (`house_not_rect`, `house_no_stair`,
  `house_no_entrance`, `lot_outside_polygon` и др.).
- Тесные комнаты, уклон маршей, посадки, внешние двери, кровельные цепочки,
  опоры рёбер графа — см. [architecture-json-levels.md](architecture-json-levels.md).

## Трасса-кольцо (`city.track`, v2)

- Разворачивает парсер (`trackCenterline` → `trackProfile/trackFit` → `trackToes`
  → `trackDecks`); на выходе — обычные v2-дороги `plate/arc` с `rails`.
  Служебные `trackRole/trackId` живут до валидатора.
- Детали геометрии, профиля, носов съездов, окон перил, индексации, света и
  проверок хребта маршрута — в [level13-track-plan.md](level13-track-plan.md) и
  [architecture-json-levels.md](architecture-json-levels.md).

## Главы CityForge v3

v3 (`kind: 'cityforge'`) компилируется в v2-бриф и разрезается в `kind: 'open'`
каталог: [architecture-cityforge-v3.md](architecture-cityforge-v3.md). Движковая
арифметика данных — [architecture-surfaces.md](architecture-surfaces.md).

## Citygen v4 (районы, процедурная генерация)

v4 (`kind: 'cityforge'`, `schemaVersion: 4`, манифест `generator`) проходит
`tools/citygen` (детерминированные стадии 0–6, IR/отчёт/repair) → компиляция
в open-каталог общим пайплайном, с коммитируемым `generation-report.json` для
пилота. Текущее устройство и ограничения: [architecture-citygen.md](architecture-citygen.md),
решения — [ADR-001](architecture/adr/ADR-001-v4-citygen-districts.md).

## Бинарные данные chunked/open глав (`.l14b`)

- Кодек: `src/level-bin.js` (чанки `chunk-*-*.l14b`, скелет `skeleton.l14b`). Текущая версия формата **v2** (несовместима с v1; каталоги регенерируются `tools/build-level.mjs`).
- v2 добавляет бинарные блобы typed arrays (теги `F32`/`F64A`/`U32A`/`I8A`/`U8A`: длина в элементах + сырые LE-байты) для компактного хранения больших числовых буферов без поэлементной сериализации. Декодер обязан прочитать файл до конца: хвост после значения — ошибка (`level-bin: после значения осталось N Б`), иначе потеря поля проходит молча.
- Опционально чанк содержит `groundBaked` — запечённую ground-геометрию relief-пути (река/дорожные коридоры), чтобы не гонять `_riverGroundGeoData` в рантайме. Компактная раскладка (`src/ground-bake.js`): `{version, pos: Float32Array, nrmq: Int8Array, idxq: Uint8Array, ic: number}` — позиции без потерь, нормали квантованы Int8 (≤0.5/127 на компоненту, ≈0.37° на швах), индексы упакованы delta-varint (1–2 Б на индекс). `_geoFromGroundData` разворачивает её в `pos/nrm/idx`; сырой вид `{pos,nrm[,idx]}` тоже принимается. Нет поля — работает обычная генерация (fallback).
- Bake — разовый инструмент `tools/bake-ground.mjs` (headless-браузер + Playwright, `NODE_PATH=$(npm root -g)`): пишет sidecar `chunk-*-*.ground.l14b`, `tools/build-level.mjs` вклеивает его в чанк. Sidecar коммитится, поэтому `build-level --check` герметичен без браузера; CI bake не запускает. Инструмент сам печатает эквивалентность (позиции побитово, угол нормалей, один-в-один треугольники), а кодирование/чтение и закоммиченные артефакты проверяет `node tools/ground-bake.test.mjs`. `tools/check-levels.mjs` не считает sidecar runtime-чанком в бюджете.
- Размер/выигрыш (гл.17, 4 клетки): чанки 595 КБ → 7.31 МБ (наибольший 2.69 МБ ≤ 3 МБ), sidecar 6.7 МБ; `build:picture-ground-geo` 655.9–722.1 мс (max 335–373) → 26.5 мс total (max 10.8) за 3 клетки в помпе; изолированный fetch всех 4 чанков 100 мс, декод 1.4–4.8 мс на чанк. Остаточный хотспот помпы — `build:geometry` (80 мс), не ground.

## Визуализатор уровней (read-only dev tool)

- Страница: `tools/level-visualizer.html` (ES-модули `tools/visualizer/*.js`, Three.js 0.160 importmap, без сборщика).
- Читает исходный бриф `src/levels/level-NN.json` и собранный каталог `src/levels/level-NN/` (`index.js`, `chunk-*.l14b`, `skeleton.l14b`, `generation-report.json`); пайплайн/движок/форматы не меняет.
- Режимы `source` / `compiled` / `compare`, виды top/front/side/free, происхождение authored/generated/derived/unknown, районы и диагностика из отчёта.
- Чистая модель тестируется `node --test tools/visualizer/model.test.mjs`; подробности и ограничения — `tools/visualizer/README.md`.
