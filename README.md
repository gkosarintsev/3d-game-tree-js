# 3D Шутер

Небольшая игра на Three.js (ES-модули, без сборщика): открытые уровни в форматах CityForge v3/v4, сбор целей, враги и две играбельные роли — **Человек** (автомат) и **Чужой** (лазает по стенам и потолку, бьёт рукой, прыгает вперёд). Игра состоит из глав-уровней, идущих одна за другой (интертитр главы → цель главы → следующая глава, см. `src/levels/`).

## Актуальные главы (реестр `src/levels/index.js`)

Номера глав в реестре не совпадают с позицией массива (часть legacy-глав удалена, см. ADR-001 и `.ai/plans/01-city-generator-districts.md`). В scope остаются v3 CityForge/open и пилот v4:

| № | Глава | Формат / карта | Цель |
| ---: | --- | --- | --- |
| 7 | Глава 7. Горный туннель (CityForge v3) | `open` (v3) | дойти до точки B |
| 8 | Глава 8. Холмистая равнина (CityForge v3) | `open` (v3) | дойти до точки B |
| 9 | Глава 9. Плотная застройка (CityForge v3) | `open` (v3) | дойти до точки B |
| 10 | Глава 10. Река и мосты (CityForge v3) | `open` (v3) | дойти до точки B |
| 15 | Глава 15. Река, горы и туннель (CityForge v3) | `open` (v3) | дойти до точки B |
| 16 | Глава 16. Районы города (v4, pilot) | `open` (v4 citygen, `level-16.json` → `level-16/`) | дойти до точки B |

Все текущие главы — открытый мир (`kind: 'open'`): источник `src/levels/level-NN.json`, скомпилированный каталог `src/levels/level-NN/`. Смерть перезапускает текущую главу.

## Запуск игры

Проект использует ES-модули и `importmap`, поэтому открывать `3d-game.html` напрямую через `file://` нельзя — нужен локальный HTTP-сервер. Из корня проекта выполните:

```bash
python -m http.server 8124
```

и откройте в браузере:

```
http://localhost:8124/3d-game.html
```

Подойдёт любой статический сервер (`npx serve`, `php -S localhost:8124` и т.п.). Единственная внешняя зависимость — Three.js 0.160, подгружается с CDN по `importmap` (нужен доступ в интернет).

### Отладочное меню

Добавьте к адресу `?debug=1`:

```
http://localhost:8124/3d-game.html?debug=1
```

Справа появится панель (`src/debug.js`): выбор и загрузка любой главы, перезагрузка текущей главы и live-правка параметров CONFIG. Поля со значком ⟳ применяются после перезагрузки главы.

Кнопка «Показать id объектов» подписывает в мире id объектов уровня (если карта реализует `debugIds()`). У открытых глав (`kind: 'open'`, карта со `streamStep`) панель показывает блок «Клетки мира» (загружено/радиус/бюджет, состояние клеток, цены срезов).

## Управление

| Клавиши | Человек | Чужой |
| --- | --- | --- |
| `W` `A` `S` `D` | движение | движение |
| `Shift` | бег | бег |
| `Space` | прыжок | прыжок вперёд (по взгляду) |
| `ЛКМ` | огонь | удар рукой (рука видна только в замахе) |
| `Esc` | пауза | пауза |

## Запуск тестов

Тесты — браузерные модули (импортируют `three` по `importmap`) и Node-тесты инструментов. Браузерные тесты запускаются на странице игры, а не в Node.

1. Запустите сервер и откройте `http://localhost:8124/3d-game.html`.
2. Откройте консоль разработчика (`F12`) и выполните, например:

```js
// механика лазания Чужого
const climb = await import('/tests/alien-climb.test.js');
climb.runAlienClimbTests();

// враги-Чужие
const enemy = await import('/tests/alien-enemy.test.js');
enemy.runAlienEnemyTests();

// ночной свет
const lights = await import('/tests/night-lights.test.js');
lights.runNightLightsTests();

// контракт/жизненный цикл по всем главам реестра
const contract = await import('/tests/level-contract.test.js');
await contract.runLevelContractTests();
const lifecycle = await import('/tests/level-lifecycle.test.js');
await lifecycle.runLevelLifecycleTests();
```

Полный прогон браузерных сюит: `node tools/ci-browser.mjs` (каждая сюита в свежей странице). Полезные флаги: `--fast` (пропустить тяжёлые/perf-проверки), `--suites <name>` (одна сюита), `--level <N>` (фильтр главы для сюит реестра; при запуске тестов уровня по возможности указывайте `--level`, по всем уровням — редко), `--flake файл::проверка` (вынести известную стохастическую проверку из вердикта).

Node-проверки:

| Команда | Что проверяет |
| --- | --- |
| `node tools/check-levels.mjs` | приёмка закоммиченных брифов в scope (детерминизм, 0 предупреждений, `--check` совпадение, спавн/B, таблица бюджета) |
| `node tools/build-level.mjs src/levels/level-15.json [--check]` | сборка/проверка конкретной главы |
| `node tools/level-parser.test.mjs` | арифметика/валидация парсера и схем |
| `node tools/relief.test.mjs` · `node tools/track.test.mjs` · `node tools/chunk.test.mjs` | рельеф, трасса, разрезка на чанки |
| `node --test tools/citygen.test.mjs` | citygen v4 (IR/стадии, детерминизм/repair/report), в т.ч. запрет дороги через реку без моста |
| `node tools/export-schema.mjs --check` | JSON Schema совпадают с DSL (`level-common`, `level-v3`, `level-v4`) |

### Чек-лист автора новой главы (v3/v4 open-каталог)

| Этап | Проверка | Команда |
| --- | --- | --- |
| 1 | бриф валиден, предупреждений парсера 0 | `node tools/build-level.mjs src/levels/level-NN.json` |
| 2 | закоммиченный каталог совпадает с парсером | `node tools/build-level.mjs src/levels/level-NN.json --check` |
| 3 | детерминизм/приёмка брифа | `node tools/check-levels.mjs src/levels/level-NN.json` |
| 4 | контракт/проходимость/жизненный цикл по реестру | `node tools/ci-browser.mjs --suites level-contract` и `--suites level-lifecycle` (с `--level NN` при точечной проверке) |
| 5 | бюджет/инвентарь главы | таблица `check-levels` (предел — по замеру) |
| 6 | Node-гейты пайплайна | `node tools/check-levels.mjs`, `node tools/level-parser.test.mjs`, `node --test tools/citygen.test.mjs` (для v4/citygen), др. по затронутой области |

Новая глава добавляется файлом-источником в `src/levels/` и записью в `src/levels/index.js`; движок и типы карт править не нужно при использовании существующего контракта/формата.

## Структура

```
3d-game.html        разметка, стили и importmap
AGENTS.md           архитектурные ограничения проекта (обязательны к чтению)
src/
  main.js           точка входа (и отладочный window.game)
  debug.js          отладочное меню (?debug=1)
  game.js           движок: последовательность глав, игровой цикл и состояния
  config.js         настройки по умолчанию
  levels/
    index.js        реестр глав (v3: 07,08,09,10,15; v4 pilot: 16)
    level-NN.json   бриф главы (v3/v4)
    level-NN/       скомпилированный open-каталог (index.js + чанки/данные)
    level-common.schema.json  общая JSON Schema (производное export-schema.mjs)
    level-v3.schema.json      схема v3 (CityForge)
    level-v4.schema.json      схема v4 (citygen/районы)
  world-map.js      открытый мир (стриминг чанков)
  json-map.js       карта из брифа (JsonMap/WorldMap-механизмы)
  cityforge-*.js / city-map.js / model-map.js / stream-map.js / terrain-map.js / map.js
                    реализации карт и общие механизмы
  relief.js         плавный рельеф
  nav-graph.js      общий граф навигации
  solids.js, surfaces.js  твёрдость/опоры
  building.js, props.js, decor.js, night-lights.js
  player.js, alien.js, enemies.js, weapon.js, coins.js, exit.js
  hud.js, effects.js, audio.js, glb.js
  assets/           внешние ассеты (см. атрибуцию)
tests/              браузерные автотесты (*.test.js) и общие хелперы (level-filter.js)
tools/
  level-schema.mjs        DSL схем/валидации
  export-schema.mjs       экспорт JSON Schema (--check)
  normalize-level.mjs     нормализация брифа
  build-level.mjs         сборка модуля/каталога (--check)
  check-levels.mjs        приёмка закоммиченных брифов
  level-parser.test.mjs   Node-тесты парсера/схем
  citygen.test.mjs        Node-тесты citygen v4
  chunk.test.mjs, relief.test.mjs, track.test.mjs
  citygen/                генератор v4 (IR, стадии, диагностика/repair/report)
  cityforge-compile.mjs   компиляция CityForge → движковый бриф/каталог
  ci-browser.mjs          прогон браузерных сюит
docs/               архитектура, планы, ADR, заметки
.ai/                планы/состояние/промпты (рабочие артефакты)
```

## Внешние ассеты и атрибуция

### «Cyberpunk 2077 Night City 3D Map» — `src/assets/cyberpunk_2077_night_city_map.glb`

Макет ночного города (исторически использовался главами стриминга/района; в текущем scope реестра не задействован).

- Автор: **Cpt.Kirk** — <https://sketchfab.com/CommanderCodyfromCoruscant>
- Источник: <https://sketchfab.com/3d-models/cyberpunk-2077-night-city-3d-map-618a4016b4d04ee4adccb1a2076d178d>
- Лицензия: **CC-BY-4.0** — <http://creativecommons.org/licenses/by/4.0/>

Аттестация (title/author/license/source) записана и в метаданных самого `.glb` (`asset.extras`).

### «@dimforge/rapier3d-compat@0.21.0» — индекс твёрдости статики (RAP, Часть II)

Используется в режиме `rapier` через `?physics=rapier` как индекс твёрдости статики (солиды/блокеры → коллайдеры, луч и свип тела), а не как физика тел. Подключается через `importmap`, не попадает в репозиторий.

- Автор: **dimforge (Sébastien Crozet)** — <https://github.com/dimforge/rapier>
- Источник: <https://www.npmjs.com/package/@dimforge/rapier3d-compat>
- Лицензия: **Apache-2.0** — <https://www.apache.org/licenses/LICENSE-2.0>

Режим `own` (по умолчанию) — аналитика проекта, эталон вердиктов. Режим `rapier` не становится default до зелёных R2/R3 в обоих режимах (см. `docs/open-world-plan.md` § 22.2).
