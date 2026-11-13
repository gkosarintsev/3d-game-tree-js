# План: промышленные дома (warehouse/factory/workshop) для industrial-района

Дата: 2026-04-10. Статус: выполнено (MVP).

## Цель
- В районе industrial (v4 citygen) дома типов warehouse, factory, workshop имеют особый вид.
- Текстуры/узор фасадных элементов (окон) генерируются процедурно в шейдере.
- На карте 17 район industrial присутствует.

## Наблюдения
- Уровень 17 уже содержит district_0_1 (industrial). Уровень 16 также содержит industrial-район.

## Задачи
- [x] [TASK-001] Stage 4: назначение facadeMaterial industrial_warehouse/factory/workshop для соответствующих kind.
- [x] [TASK-002] Рантайм: процедурные шейдерные узоры окон/фасадных квадов в json-map + стили byMaterial в config.
- [x] [TASK-003] Пересборка level 16/17, --check OK (район industrial есть).
- [x] [TASK-004] Верификация: build-level --check 16,17; check-levels 28/28; ci-browser level-contract 17 8/8.
