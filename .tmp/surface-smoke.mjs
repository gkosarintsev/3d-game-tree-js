// Дым: SurfaceField строится в Node на нормализованной карте и отдаёт опорные списки.
import { readFileSync } from 'node:fs';
import { SurfaceField } from '../src/surfaces.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

for (const file of ['src/levels/level-09.json', 'src/levels/level-12.json', 'src/levels/level-13.json']) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const map = normalizeLevel(expandCity(structuredClone(raw))).map;
  const t = Date.now();
  const f = new SurfaceField(map);
  f._collectBuildings(); f._collectRoads(); f._collectWater();
  f._indexPlans(); f.indexSolids(); f._indexSurfaces(); f._indexBlockers();
  const ms = Date.now() - t;
  const y = f.groundHeightAt(map.spawn.x, map.spawn.z, 500);
  console.log(JSON.stringify({ file, ms, solids: f.solids.length, surfaces: f.surfaces.length,
    blockers: f.blockers.length, prisms: f.prisms.length, sweeps: f.sweeps.length, rails: f.rails.length,
    floorPlates: f.floorPlates.length, roofPlates: f.roofPlates.length, stairCells: f.stairCells.length,
    spawnY: +y.toFixed(3), blocked: f.isBlocked(map.spawn.x, map.spawn.z, 0.45, y, 1.7) }));
}
