// Одноразовый зонд масштаба: сколько весит и сколько считается город из N
// непроходимых коробок через существующий парсер. Новых фич не использует.
import { writeFileSync } from 'node:fs';

const SIZE = Number(process.argv[2] ?? 600);
const CAP = Number(process.argv[3] ?? 400);
const half = SIZE / 2;
const pitch = 40;
const roadW = 12;

const roads = [];
for (let k = -half + pitch; k < half; k += pitch) {
  roads.push({ id: `road_x_${k}`, type: 'ground', width: roadW,
    points: [{ x: -half + 4, y: 0.12, z: k }, { x: half - 4, y: 0.12, z: k }] });
}
const roadZs = roads.map(r => r.points[0].z);

const buildings = [];
let i = 0, n = 0;
for (let gz = -half + 6; gz < half - 20; gz += 12) {
  for (let gx = -half + 6; gx < half - 20; gx += 12, i++) {
    if (n >= CAP) break;
    const w = 8 + (i % 3) * 2, d = 8 + ((i + 1) % 4) * 2;
    if (roadZs.some(rz => gz < rz + roadW / 2 + 1 && gz + d > rz - roadW / 2 - 1)) continue;
    if (i % 11 < 3) continue;                       // дворы/площади
    buildings.push({
      id: `b_${n}`, name: `Block ${n}`, isEnterable: false,
      floorsCount: 1 + (n % 6), floorHeight: 3.2 + (n % 4) * 0.3,
      footprint: [{ x: gx, z: gz }, { x: gx + w, z: gz }, { x: gx + w, z: gz + d }, { x: gx, z: gz + d }],
      rooms: [],
    });
    n++;
  }
}

const raw = {
  metadata: { levelName: 'ProbeCity', name: 'Зонд', hint: 'зонд масштаба', units: 'meters' },
  ground: { y: 0, size: SIZE, color: '#23262c' },
  roads, buildings, landscapeObjects: [],
  lights: [{ id: 'sun_light', type: 'directional', position: { x: 120, y: 220, z: 80 }, color: '#bcd0ff', intensity: 0.55 }],
  sky: { sky: '#0b1020', fog: { color: '#0e1424', near: 40, far: 260 },
    hemi: { sky: '#1b2a44', ground: '#0a0d12', intensity: 0.4 },
    lights: { count: 6, reach: 55, height: 5.4, spacing: 20, intensity: 70 } },
  gameplay: { goal: 'exit', spawn: { x: -20, z: -20 }, exit: { x: 20, z: 20 },
    exitRadius: 4, enemies: { count: 3 }, alienEnemies: { count: 1 } },
};
writeFileSync('probe/city.json', JSON.stringify(raw, null, 1));
console.log(`зданий ${buildings.length}, дорог ${roads.length}, сторона ${SIZE}`);
