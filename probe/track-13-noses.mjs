// Проверка README-чисел главы 13: чем именно съезды входят в наземные улицы.
// Для каждой пластины съезда печатает низший торец (ноз) и пластину улицы, чей
// план накрывает эту точку, с её отметкой под носом.
import { LEVEL_13 } from '../src/levels/level-13.js';

const roads = LEVEL_13.map.roads;
const D2R = Math.PI / 180;

/** мировые точки локальных концов пластины и отметки верха там */
function ends(d) {
  if (d.yaw === undefined) {
    // осевая пластина: ось — `axis`, начала и концы по габариту
    const y = d.topAtMin;
    return d.axis === 'x'
      ? [{ x: d.minX, z: (d.minZ + d.maxZ) / 2, y, where: 'начало' }, { x: d.maxX, z: (d.minZ + d.maxZ) / 2, y, where: 'конец' }]
      : [{ x: (d.minX + d.maxX) / 2, z: d.minZ, y, where: 'начало' }, { x: (d.minX + d.maxX) / 2, z: d.maxZ, y, where: 'конец' }];
  }
  const a = d.yaw * D2R;
  const half = d.length / 2;
  return [
    { x: d.cx - Math.cos(a) * half, z: d.cz - Math.sin(a) * half, y: d.topAtMin, where: 'начало' },
    { x: d.cx + Math.cos(a) * half, z: d.cz + Math.sin(a) * half, y: d.topAtMax, where: 'конец' },
  ];
}

/** отметка верха пластины-улицы в мировой точке; null — точка вне плана */
function yOn(d, x, z) {
  if (d.yaw === undefined) {
    if (x < d.minX - 1e-6 || x > d.maxX + 1e-6 || z < d.minZ - 1e-6 || z > d.maxZ + 1e-6) return null;
    return { y: d.topAtMin, u: 0, v: 0 };
  }
  const a = d.yaw * D2R;
  const dx = x - d.cx, dz = z - d.cz;
  const u = dx * Math.cos(a) + dz * Math.sin(a);
  const v = -dx * Math.sin(a) + dz * Math.cos(a);
  if (Math.abs(u) > d.length / 2 + 1e-6 || Math.abs(v) > d.width / 2 + 1e-6) return null;
  const t = (u + d.length / 2) / d.length;
  return { y: d.topAtMin + (d.topAtMax - d.topAtMin) * t, u, v };
}

for (const road of roads) {
  if (!/^ring_e/.test(road.id)) continue;
  for (const d of road.decks) {
    const [a, b] = ends(d);
    const nose = a.y <= b.y ? a : b;
    const ringEnd = a.y <= b.y ? b : a;
    const hits = [];
    for (const other of roads) {
      if (/^ring/.test(other.id)) continue;
      for (const o of other.decks) {
        if (o.arc) continue;
        const at = yOn(o, nose.x, nose.z);
        if (at) hits.push(`${other.id}: верх ${at.y.toFixed(3)} (u ${at.u.toFixed(2)}, v ${at.v.toFixed(2)} из ширины ${o.width})`);
      }
    }
    console.log(`${road.id}: нос ${nose.x.toFixed(1)}, ${nose.z.toFixed(1)} на ${nose.y.toFixed(3)} м | кольцо на ${ringEnd.y.toFixed(3)} м | пролёт ${Math.hypot(nose.x - ringEnd.x, nose.z - ringEnd.z).toFixed(1)} м | перепад ${(ringEnd.y - nose.y).toFixed(3)} м | уклон ${((ringEnd.y - nose.y) / Math.hypot(nose.x - ringEnd.x, nose.z - ringEnd.z)).toFixed(3)}`);
    console.log(`  улиц под носом: ${hits.length ? hits.join(' | ') : 'НЕТ'}`);
  }
}
const decks = roads.reduce((a, r) => a + r.decks.length, 0);
console.log(`\nдорог ${roads.length}, настилов ${decks}, трасса: ${roads.filter((r) => /^ring/.test(r.id)).map((r) => `${r.id} (${r.decks.length})`).join(', ')}`);
console.log(`дуг ${roads.flatMap((r) => r.decks).filter((d) => d.arc).length}, пластин ${roads.flatMap((r) => r.decks).filter((d) => !d.arc).length}, подъёмных ${roads.flatMap((r) => r.decks).filter((d) => d.ramp).length}`);
console.log(`фонарей ${roads.flatMap((r) => r.lamps ?? []).length}, опор ${roads.flatMap((r) => r.pillars ?? []).length}`);
