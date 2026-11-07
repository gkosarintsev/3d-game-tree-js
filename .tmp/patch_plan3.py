p='docs/open-world-plan.md'
s=open(p,encoding='utf-8').read()
old='  «маршрут A→B по опорам»; иначе перенос не едет в `main`, а остаётся за флагом.\n'
new=old+'''
**— R4/R5 начаты в этом заходе (скелет):** `physics-index.js` получил `addChunk`/
`removeChunk` (R4, пока полная перестройка; снятие коллайдеров чанка — TODO).
R5 (переназначение пределов `relief-city`, правила в AGENTS, атрибуция в README)
остаётся открытым: режим `rapier` не становится default до зелёных R2/R3 в обоих
режимах, и `?physics=own` остаётся эталоном. Вердикт браузерного прогона не
изменился (299/299, режим `own`). Полная реализация R2 (мера четырёх форм,
свип-против-марша), R3 (слияние луча с аналитикой поля/призм/sweeps/holes) и
R4 (снятие коллайдеров чанка) — на следующем заходе.
'''
assert old in s, 'old not found'
s=s.replace(old,new,1)
open(p,'w',encoding='utf-8').write(s)
print('done')
