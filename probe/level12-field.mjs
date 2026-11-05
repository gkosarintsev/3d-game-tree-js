/* Отметки СОБРАННОГО поля главы 12 (холмы + террасы районов + площадки корпусов),
   которыми парсер клал улицы: для автора дорог это единственный честный источник
   `y`. Зонд принимает JSON: {"points":[{x,z,label}…],"lines":[{axis,at,from,to,step}…]}. */
import { reliefOf } from '../src/relief.js';
import { LEVEL_12 } from '../src/levels/level-12.js';

const plain = { ...LEVEL_12.map.relief };
const cfg = JSON.parse(process.argv[2] ?? '{}');
const query = reliefOf(plain);
const y = (x, z) => query.heightAt(x, z).toFixed(3);

for (const p of cfg.points ?? []) {
  console.log(`${p.label ?? `${p.x},${p.z}`}: поле ${y(p.x, p.z)}, верх полотна ${(+y(p.x, p.z) + 0.12).toFixed(3)}`);
}
for (const l of cfg.lines ?? []) {
  const row = [];
  for (let q = l.from; q <= l.to; q += l.step) {
    row.push(`${q}:${l.axis === 'x' ? y(q, l.at) : y(l.at, q)}`);
  }
  console.log(`${l.axis === 'x' ? `x @ z=${l.at}` : `z @ x=${l.at}`}: ${row.join(' ')}`);
}
let worst = { mag: 0, x: 0, z: 0 };
for (let x = -300; x <= 300; x += 10) {
  for (let z = -300; z <= 300; z += 10) {
    const s = query.slopeAt(x, z);
    if (s.mag > worst.mag) worst = { mag: s.mag, x, z };
  }
}
console.log(`поле главы: худший уклон ${worst.mag.toFixed(3)} м/м в ${worst.x},${worst.z}`);
