/* Профиль рельефного поля главы 12: отметки и уклон по линиям, чтобы ярус
   района выбирался по числу, а не по формуле. */
import { reliefOf } from '../src/relief.js';

const cfg = JSON.parse(process.argv[2] ?? '{"hills":[{"x":-150,"z":210,"bx":150,"bz":210,"radius":270,"height":14}]}');
const field = reliefOf({ baseY: 0, hills: cfg.hills, pads: cfg.pads ?? [] });

function line(from, to, n = 13) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = from.x + (to.x - from.x) * t, z = from.z + (to.z - from.z) * t;
    pts.push({ x: Math.round(x), z: Math.round(z), y: +field.heightAt(x, z).toFixed(2) });
  }
  let worst = 0, at = null;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    const g = Math.abs(pts[i].y - pts[i - 1].y) / d;
    if (g > worst) { worst = g; at = `${pts[i - 1].x},${pts[i - 1].z}→${pts[i].x},${pts[i].z}`; }
  }
  return { from: `${from.x},${from.z}`, to: `${to.x},${to.z}`, pts, maxGrad: +worst.toFixed(3), at };
}

const rects = cfg.rects ?? [
  { id: 'ncc', minX: -292, maxX: 26, minZ: 60, maxZ: 292 },
  { id: 'nkab', minX: 44, maxX: 292, minZ: 60, maxZ: 292 },
  { id: 'sind', minX: -292, maxX: -44, minZ: -292, maxZ: -60 },
  { id: 'skit', minX: 26, maxX: 292, minZ: -292, maxZ: -60 },
];
for (const r of rects) {
  const samples = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = 0; j <= 6; j++) {
      samples.push(field.heightAt(r.minX + (r.maxX - r.minX) * i / 6, r.minZ + (r.maxZ - r.minZ) * j / 6));
    }
  }
  const min = Math.min(...samples), max = Math.max(...samples);
  const centre = field.heightAt((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2);
  console.log(`${r.id}: разброс поля ${min.toFixed(2)}…${max.toFixed(2)} (Δ ${(max - min).toFixed(2)}), центр ${centre.toFixed(2)}, 1,5·Δ/120 = ${(1.5 * (max - min) / 120).toFixed(3)} м/м при пределе ${cfg.maxSlope ?? 0.12}`);
}
let worstField = { mag: 0, x: 0, z: 0 };
for (let x = -300; x <= 300; x += 10) {
  for (let z = -300; z <= 300; z += 10) {
    const s = field.slopeAt(x, z);
    if (s.mag > worstField.mag) worstField = { mag: s.mag, x, z };
  }
}
console.log(`поле: худший уклон ${worstField.mag.toFixed(3)} м/м в ${worstField.x},${worstField.z} (предел ${cfg.maxSlope ?? 0.12})`);
for (const l of cfg.lines ?? [
  { from: { x: -100, z: -300 }, to: { x: -100, z: 300 } },
  { from: { x: 0, z: -300 }, to: { x: 0, z: 300 } },
  { from: { x: 100, z: -300 }, to: { x: 100, z: 300 } },
]) {
  const r = line(l.from, l.to);
  console.log(`линия ${r.from} → ${r.to}: ${r.pts.map(p => p.y).join(' ')}, худший уклон ${r.maxGrad} в ${r.at}`);
}
