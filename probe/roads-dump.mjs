/* Печать авторских дорог брифов: ось, отметки и тип — чтобы видеть, как главы 10 и 11
   обходятся с пересечениями настилов (со-плоскостные наложения в движке мигают). */
import { readFileSync } from 'node:fs';

for (const file of process.argv.slice(2)) {
  const j = JSON.parse(readFileSync(file, 'utf8'));
  console.log('=====', file);
  for (const r of j.roads ?? []) {
    const axis = r.points
      ? r.points.map(p => `(${p.x}, ${p.y}, ${p.z})`).join(' → ')
      : (r.elements ?? []).map(e => e.plate
        ? `[plate x${e.plate.x} z${e.plate.z} L${e.plate.length} w${e.plate.width} yaw${e.plate.yaw ?? 0} y${e.plate.y} rise${e.plate.rise ?? 0}]`
        : e.arc ? `[arc c(${e.arc.cx}, ${e.arc.cz}) R${e.arc.radius} ${e.arc.from}..${e.arc.to} w${e.arc.width} y${JSON.stringify(e.arc.y)} bank${e.arc.bank ?? 0}]`
        : `[${JSON.stringify(e)}]`).join(' ');
    console.log(String(r.id).padEnd(14), String(r.type).padEnd(11), 'w', String(r.width).padEnd(5), 'lamps', String(r.lamps).padEnd(6), axis);
  }
}
