p='docs/open-world-plan.md'
s=open(p,encoding='utf-8').read()
old='  0,26 % и 0,09 %, § 16), и ни одного нарушения гейтов «одна связная сеть» и\n  «маршрут A→B по опорам»; иначе перенос не едет в `main`, а остаётся за флагом.\n'
new=old+'''
**— R2/R3 начаты в этом заходе (скелет):** `physics-index.js` получил `rayHit`
(world.castRay → {x,y,z,nx,ny,nz,dist}) и `bodySweep` (world.castShape капсулой
Capsule(0,35, 0,45) с центром на feet+height/2). `solids.js` переключает
`bodyClearLine` и `raySolid` на Rapier при `CONFIG.physics.mode === 'rapier'`
и готовности индекса; слияние с аналитикой поля/призм/sweeps/holes — TODO (R3).
Вердикт браузерного прогона не изменился (299/299, режим `own`). Критерий
R2 (тёплый конструктор ≤ 0,6 с, потерянных рёбер ≤ 0,3 %) и R3 (удар совпадает
с `own` на сетке проб) — на следующем заходе, после R4 (стриминг) и R5.
'''
assert old in s, 'old not found'
s=s.replace(old,new,1)
open(p,'w',encoding='utf-8').write(s)
print('done')
