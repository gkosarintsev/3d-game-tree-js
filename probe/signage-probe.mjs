/* Одноразовый зонд: панели по граням фасада — сколько слотов и сколько домов реально участвует. Не коммитить. */
import { LEVEL_10 } from '../src/levels/level-10.js';

const T = 0.35 / 2 + 0.05;
const B = LEVEL_10.map.buildings;
const rectsHold = (b, x, z) => b.rects.some(r => x > r.minX && x < r.maxX && z > r.minZ && z < r.maxZ);

function outerFaces(b, minRun) {
  const out = [];
  for (const w of b.walls) {
    if (!w.facade) continue;
    const alongX = w.axis === 'x';
    const lo = alongX ? w.minX : w.minZ;
    const hi = alongX ? w.maxX : w.maxZ;
    if (hi - lo < minRun) continue;
    const mid = (lo + hi) / 2;
    const near = alongX ? w.minZ : w.minX;
    const far = alongX ? w.maxZ : w.maxX;
    const test = (coord, dir) => {
      const x = alongX ? mid : coord + dir * T;
      const z = alongX ? coord + dir * T : mid;
      return !rectsHold(b, x, z);
    };
    const a = test(near, -1), c = test(far, 1);
    if (a && !c) out.push({ lo, hi, run: hi - lo });
    else if (c && !a) out.push({ lo, hi, run: hi - lo });
    else if (a && c) out.push({ lo, hi, run: hi - lo });
  }
  return out;
}

for (const [minFloors, minRun, step, panelW, panelFloors] of [
  [4, 8, 12, 6, 2], [5, 8, 12, 6, 2], [6, 9, 14, 7, 3], [4, 10, 16, 8, 2], [3, 8, 12, 6, 2],
]) {
  let houses = 0, faces = 0, slots = 0, bandSlots = 0;
  const runH = [];
  for (const b of B) {
    if (!b.floorsCount || b.floorsCount < minFloors) continue;
    const fs = outerFaces(b, minRun);
    if (!fs.length) continue;
    houses++;
    faces += fs.length;
    for (const f of fs) {
      runH.push(Math.round(f.run));
      const n = Math.max(1, Math.floor((f.run + step - panelW) / step));
      slots += n;
      bandSlots += n * Math.max(1, b.floorsCount - panelFloors + 1);
    }
  }
  const runs = runH.sort((a, b) => a - b);
  console.log(JSON.stringify({
    minFloors, minRun, step, panelW, panelFloors, houses, faces,
    slots, keep03: Math.round(slots * 0.3), keep05: Math.round(slots * 0.5),
    bandSlots, runMedian: runs[runs.length >> 1], runMax: runs[runs.length - 1],
  }));
}
console.log('этажность:', B.filter(b => b.floorsCount >= 3).length, 'домов ≥3 эт.,', B.filter(b => b.floorsCount >= 4).length, '≥4 эт.');
