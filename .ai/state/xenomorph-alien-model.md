# Состояние: модель Чужого (xenomorph)

План: .ai/plans/06-xenomorph-alien-model.md

- [x] TASK-001: src/xenomorph-rig.js, src/xenomorph-textures.js, src/xenomorph.js
- [x] TASK-002: AlienEnemy использует xenomorph rig + XenoAnimator (idle/walk/run/leap/attack, crawl при up.y стены/потолка)
- [x] TASK-003: syntax/check-levels OK, `ci-browser --level 17 --suites level-contract` 8/8 PASS (после фиксов: JS-сигнатура/импорт рига, снятие TS `!` в текстурах)
- Примечание: игрок Alien — first-person (тело не отображается), замена визуала выполнена для AlienEnemy.
