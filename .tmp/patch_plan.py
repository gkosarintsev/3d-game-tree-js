p='docs/open-world-plan.md'
s=open(p,encoding='utf-8').read()
old='  = 0), память меряется числом, а не кучей.\n- **R2'
new='''**— R1 начат в этом заходе (скелет):** создан `src/physics-index.js` (init/buildFrom/
dispose/rayHit/bodySweep/isReady), `src/game.js` вызывает `PhysicsIndex.init()` при
`CONFIG.physics.mode === 'rapier'` и `buildFrom`/`dispose` вокруг `createMap`.
`buildFrom` пока создаёт cuboid-коллайдеры для `solids` и `blockers`; rails/prisms/
sweeps (convexHull/trimesh) — TODO. Вердикт браузерного прогона не изменился
(299/299, режим `own` по умолчанию). Критерий коллайдеров (2 050/934) и
`dispose()` без сирот — на следующем заходе, вместе с R2/R3.

'''+old
assert old in s, 'old not found'
s=s.replace(old,new,1)
open(p,'w',encoding='utf-8').write(s)
print('done')
