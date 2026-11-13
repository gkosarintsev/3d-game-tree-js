# План: замена модели врага-человека на soldier из docs/enemy1

Дата: 2026-04-10. Статус: выполнено (MVP).

## Цель
Заменить процедурную box-модель человеческого Enemy на модель солдата из docs/enemy1 (rig/кости, позы), сохранив контракт/геймплей (AI, стрельба, урон, спавн/shift/despawn/dispose, raycast/hitbox-сфера).

## Задачи
- [x] [TASK-001] Порт визуала/поз в JS: src/soldier.js (кости, computeCharacterPose idle/walk, процедурные текстуры bump/contact shadow, сборка рига, flash/pose/dispose).
- [x] [TASK-002] Интеграция в src/enemies.js: Enemy использует soldier rig (варианты по палитре), анимация ходьбы/idle/атаки-отдачи/попадания/завала при смерти, hit/eye/muzzle/физика без изменений, корректный dispose (в т.ч. замена палитрного материала).
- [x] [TASK-003] Проверка: 
ode --check, 
ode tools/check-levels.mjs 28/28, 
ode tools/ci-browser.mjs --level 17 --suites level-contract 8/8 PASS.
