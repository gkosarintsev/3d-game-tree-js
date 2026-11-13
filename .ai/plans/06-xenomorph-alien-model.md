# План: замена модели Чужого на xenomorph (docs/xenomorph)

Дата: 2026-04-10. Статус: выполнено (MVP визуала/анимаций для AlienEnemy).

## Задачи
- [x] [TASK-001] Порт рига/текстур/анимаций из docs/xenomorph в JS: src/xenomorph-rig.js, src/xenomorph-textures.js, src/xenomorph.js (XenoAnimator: idle/walk/run/leap/attack/crawl).
- [x] [TASK-002] Интеграция в AlienEnemy (src/enemies.js): модель ксеноморфа, анимации покой/ходьба/бег/прыжок/удар, отдельный crawl при движении по стенам/потолку; hit-flash, dispose. Игрок-Alien (FP) оставлен без смены тела (видна только рука).
- [x] [TASK-003] Проверки: `node --check` (xenomorph*, enemies) OK, `node tools/check-levels.mjs` 28/28, `node tools/ci-browser.mjs --level 17 --suites level-contract` 8/8 PASS. Фиксы при интеграции: JS-сигнатура/импорт рига, удаление TS `!` в текстурах.
