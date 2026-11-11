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
- [ ] A3.4: perf-gate (`open-world --details`, worst-frame `picture`) и фиксация метрик — **blocked** (в среде нет playwright/browser runner; `node tools/ci-browser.mjs` не запускается без playwright). Требуется прогон в браузерном окружении/CI.

### M3 — Развязки (прототип, в работе)
- [~] B1: спецификация/шаблоны (черновик)
  - Целевые шаблоны (MVP-прототип): (1) **эстакада + пандус** (overpass) — поднятый прямой сегмент над пересечением + 2–4 съезда с уклоном ≤ `MAX_ROAD_SLOPE`, клиренс под путепроводом ≥ габарит транспорта + запас; (2) **diamond-like (упрощ.)** — пересечение разных уровней с парой ромбовидных съездов без плетения; (3) **T/Y-развязка** — разделение потоков по уровням на тройнике.
  - Параметры (данные/константы): уровни (0/1), высота пролёта, длина рампы = Δh/slope, радиусы/минимальные длины прямых вставок, ширины по профилю, вертикальный/боковой клиренс, запрет пересечений в одном уровне, резерв под опоры (easement).
  - Интеграция: stage 2 `networks.roads`/IR — узлы с `layer/grade`, сегменты с 3D path/профилем, совместимость с `roadCorridors`, мостами/terrain-following, проверка воды/застройки/рельефа.
  - Валидация/repair (B3): уклон сегмента/рампы, самопересечения по уровням, клиренс под/над, связность графа и достижимость, деградация к плоскому перекрёстку при невалидности.
- [ ] B2: реализация в stage 2/network (шаблоны/размещение/стыковка) — **не начата** (требует осторожной интеграции с генерацией/IR, nav/roadCorridors, связностью и компиляцией; высокий риск регрессий)
- [ ] B3: валидация/repair + тесты/perf-gate

### M4 — Анимации врагов (базовый каркас, в работе)
- [~] C1: аудит `src/enemies.js`/`src/alien.js` (частично)
  - Human `Enemy` (`src/enemies.js`): процедурный единый меш (`BODY_GEOMETRY`, merged boxes) в `group`, состояние ИИ `patrol/chase/attack/dead`, движение/коллизии по XZ + ступени/гравитация, поворот `group.rotation.y`, смерть — завал `group.rotation.x`, respawn/offstage, HP-bar billboard, эффекты hitFlash/emitters; нет `AnimationMixer`/клипов/скелета, отдельные конечности не анимируемы без рефакторинга модели.
  - `AlienEnemy` расширяет `AlienBody` (`src/alien.js`): 3D-прилипание к поверхностям, переходы/скачки/ориентация по нормали, визуал синхронизируется через `_syncMesh()`; логика значительно сложнее (нельзя ломать ориентацию/физику), также процедурный merged меш.
  - Lifecycle: сущности управляются менеджером врагов/стримингом (offstage/respawn/shift/dispose сценарии заданы движком), визуальные трансформации должны оставаться локальными и не влиять на симуляцию.
- [~] C2: дизайн (черновик) — минимум состояний idle/locomotion/attack/hit/death; процедурный драйвер на `dt` для текущих мешей (bob/sway/lean/recoil) + сохранение существующей death-поза; будущий путь: артикулированная процедурная модель частей или GLB-клипы (`GLTFLoader`+`AnimationMixer`) с fallback и обязательной атрибуцией/`dispose()`. Блендинг/приоритеты (attack/hit/death) и интеграция с `_syncMesh()` Alien — отдельная задача.
- [~] C3: базовый каркас/состояния (частично) — процедурная визуальная анимация (dt, mesh-local, без влияния на симуляцию): human `Enemy` (idle/locomotion/attack lean, bob/sway, recoil/hit-flinch, reset при respawn/death) и `AlienEnemy` (bob/sway/lean, leap pose, hit-flinch от `hurt`, после `_syncMesh`, reset при death/respawn). Игрок-Чужой, приоритетный блендинг состояний и ассетный путь (GLB/`AnimationMixer`) не реализованы.

### M5 — Расширение и стабилизация
- [ ] B4, C4–C5: тесты/perf/lifecycle/полировка (для анимаций — fallback/dispose/стриминг/визуальная проверка)

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
- 2026-11-12: M2 A3.3 (частично) — усилена детализация props (stage 5: budget 360, roadside/district-specific плотность и вариативность в существующих примитивах), пилот пересобран детерминированно. A3.4 perf-gate не выполнен (нет playwright/браузерного раннера).
- 2026-11-12: M4 C1–C3 (частично) — аудит `src/enemies.js`/`src/alien.js`, черновик дизайна, процедурная визуальная анимация human `Enemy` и `AlienEnemy` (idle/locomotion/attack/leap, hit/recoil cues; mesh-local, после `_syncMesh`, без влияния на симуляцию/lifecycle). Остаются: C2/C3–C5 (игрок-Чужой, приоритеты/блендинг, ассетный путь GLB+`AnimationMixer`, fallback/dispose, проверки).
- 2026-11-12: M3 B1 (черновик) — спецификация прототипных шаблонов развязок (эстакада+пандусы, diamond/T-Y упрощ.), параметры/клиренсы/уклоны, интеграция stage 2 и валидация/repair/деградация. B2–B4 не начата (требует сложной реализации/валидации в stage 2/IR/nav). A3.4 perf-gate **blocked** (нет playwright/browser runner в среде).