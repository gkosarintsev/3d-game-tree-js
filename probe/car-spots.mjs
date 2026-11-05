// Зонд стоянок авто: длины настилов петли, окна периль, путь по настилу от
// въезда (нос ring_e1) до каждой точки, и сколько опор петли попадает в
// openPositions() (движущийся аргумент против авторских точек).
import { LEVEL_13 } from '../src/levels/level-13.js';

const DEG = Math.PI / 180;
const spec = LEVEL_13.map;
const ring = spec.roads.find(r => /^ring/.test(r.id));
const CAR_HALF_W = 0.95, CAR_HALF_L = 2.25;

const arcLen = d => d.arc ? d.R * Math.abs(d.span * DEG) : d.length;
let total = 0;
const cum = [];
for (const d of ring.decks) { total += arcLen(d); cum.push(total); }
console.log(`петля: ${ring.decks.length} настилов, длина по осевой = ${total.toFixed(1)} м`);
console.log('настилы (· — окно периль):');
ring.decks.forEach((d, i) => {
  const l = arcLen(d);
  console.log(` [${String(i).padStart(2)}] ${d.rails ? ' ' : '·'} ${d.arc ? 'ARC' : 'PLT'} len=${l.toFixed(2)} центр=(${(d.arc ? d.cx + Math.cos((d.a0 + d.span / 2) * DEG) * d.R : d.cx).toFixed(2)}, ${(d.arc ? d.cz + Math.sin((d.a0 + d.span / 2) * DEG) * d.R : d.cz).toFixed(2)}) yaw=${(d.arc ? 0 : d.yaw).toFixed(2)} верхсередины=${(((d.topAtMin ?? d.y0 ?? 0) + (d.topAtMax ?? d.y1 ?? 0)) / 2).toFixed(2)} зазордопериль=${((d.width ?? 2 * d.halfW) / 2 - CAR_HALF_W).toFixed(2)}`);
});

// путь по настилу от окна въезда (первый настил с rails=false после nosa e1) до центра каждого настила
const windowIdx = ring.decks.map((d, i) => (!d.rails ? i : -1)).filter(i => i >= 0);
console.log('\nокна периль (носы съездов):', windowIdx.join(', '));
for (const w of windowIdx) {
  for (const i of [13, 27, 9, 15, 19]) {
    const along = i > w ? cum[i] - (w > 0 ? cum[w - 1] : 0) : total - (cum[w - 1] - cum[i]);
    console.log(`  от носа [${w}] до центра [${i}] по настилу: ${along.toFixed(1)} м`);
  }
}

const sp = spec.spawn;
for (const i of [13, 27]) {
  const d = ring.decks[i];
  const x = d.arc ? d.cx + Math.cos((d.a0 + d.span / 2) * DEG) * d.R : d.cx;
  const z = d.arc ? d.cz + Math.sin((d.a0 + d.span / 2) * DEG) * d.R : d.cz;
  console.log(`\[${i}] прямая от спавна (${sp.x}, ${sp.z}) до (${x.toFixed(2)}, ${z.toFixed(2)}): ${Math.hypot(x - sp.x, z - sp.z).toFixed(1)} м`);
}

// съезд e1: от земли до петли
for (const r of spec.roads.filter(x => /^ring_e/.test(x.id))) {
  console.log(`\n${r.id}: настилов ${r.decks.length}, длина ${r.decks.reduce((a, d) => a + d.length, 0).toFixed(1)} м`);
  for (const d of r.decks) {
    console.log(`  len=${d.length.toFixed(2)} центр=(${d.cx.toFixed(2)},${d.cz.toFixed(2)}) yaw=${d.yaw.toFixed(2)} верх ${d.topAtMin.toFixed(2)}→${d.topAtMax.toFixed(2)} rails=${d.rails}`);
  }
}

// наземные улицы у спавна — сколько машин можно было бы поставить «сразу видно»
const ground = spec.roads.filter(r => r.type === 'ground');
console.log(`\nназемных улиц: ${ground.length}, пластин в них ${ground.reduce((a, r) => a + r.decks.length, 0)}`);
const near = ground.flatMap(r => r.decks).filter(d => d.obb
  && Math.hypot(d.obb.cx - sp.x, d.obb.cz - sp.z) < 60);
for (const d of near.slice(0, 8)) {
  console.log(`  рядом со спавном: len=${d.length.toFixed(1)} центр=(${d.cx.toFixed(1)},${d.cz.toFixed(1)}) yaw=${d.yaw.toFixed(1)} y=${d.topAtMin}→${d.topAtMax}`);
}
