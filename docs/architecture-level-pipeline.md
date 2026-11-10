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
  `src/levels/level.schema.json` (v1), `src/levels/level-v2.schema.json` (json2),
  `src/levels/level-v3.schema.json` + `src/levels/level-common.schema.json`
  (cityforge). Рукописного `.schema.json` нет.
- Экспортёр обязан сходиться побайтово (`node tools/export-schema.mjs --check`).
- Каждый бриф начинается с `$schema` своей версии (`./level.schema.json`,
  `./level-v2.schema.json`, `./level-v3.schema.json`).
- Версии — разные корни (не `allOf`), т.к. `additionalProperties: false` в ветке
  draft-07 не видит внешние `properties`.
- У каждого адресуемого поля v1/v2 обязателен `doc` (смысл, единица, источник
  предела); примитивный элемент массива описывает массив. В v3 `doc` — только у
  неочевидных полей и **на английском**.
- `default` в DSL берётся из того же объекта, который его применяет
  (`CONFIG.jsonMap`, `CONFIG.fog/sun/hemi/night`, `DISTRICT_DEFAULTS`/
  `TRACK_DEFAULTS` из `tools/city.js`), иначе схема станет второй правдой.
  Ключи `city` в схеме равны гейтам генератора.
- **Число, равное `default`, в бриф не пишут.** Исключение-переключатель:
  наличие секции (`windows`, `clutter`, `signage`, `relief`, `city`) — воля
  автора, даже при всех дефолтных числах.
- Rationale главы — `metadata.notes` (в модуль не доезжает). JSONC/комментарии
  в JSON не используются (`JSON.parse` в пайплайне).
- `kind: 'json'` в v1-брифе законен (= отсутствие). Неизвестный `kind` опасен
  (движок может взять `TownMap`), поэтому схема держит перечисление.

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
