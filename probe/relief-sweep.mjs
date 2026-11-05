/**
 * Выбор чисел террасы фиксатура: перебор отметок и прямоугольников, чтобы
 * собранное поле было в предел с запасом, а косой дом стоял вне её кольца.
 * usage: node probe/relief-sweep.mjs
 */
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';

const hills = [
  { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 320, height: 9 },
  { id: 'lovchina', x: -80, z: -70, radius: 320, height: -5 },
];
const nature = reliefOf({ baseY: 0, hills });
console.log('природа: (10,60)=', nature.heightAt(10, 60).toFixed(3),
  ' (-20,60)=', nature.heightAt(-20, 60).toFixed(3),
  ' (40,60)=', nature.heightAt(40, 60).toFixed(3),
  ' (10,45)=', nature.heightAt(10, 45).toFixed(3),
  ' (10,72)=', nature.heightAt(10, 72).toFixed(3),
  ' (0,100)=', nature.heightAt(0, 100).toFixed(3),
  ' (-80,-60)=', nature.heightAt(-80, -60).toFixed(3));

const base = (terrace) => ({
  kind: 'json2',
  metadata: { levelName: 'reliefHouse', name: 'Ярусы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  relief: { baseY: 0, hills: structuredClone(hills), pads: [terrace] },
  roads: [
    { id: 'st_high', type: 'ground', width: 8, lamps: true,
      points: [{ x: -40, y: terrace.y, z: 60 }, { x: 100, y: terrace.y, z: 60 }] },
    { id: 'br_span', type: 'bridge', width: 8,
      elements: [{ plate: { x: -20, z: -40, length: 80, width: 8, yaw: 0, y: 4.2, rise: 2.4 } }] },
  ],
  buildings: [
    { id: 'h_ridge', isEnterable: false, floorsCount: 2, floorHeight: 3.4, rotation: 30,
      footprint: [{ x: -12, z: 97 }, { x: 12, z: 97 }, { x: 12, z: 103 }, { x: -12, z: 103 }], rooms: [] },
    { id: 'h_low', isEnterable: false, floorsCount: 2, floorHeight: 3.4,
      footprint: [{ x: -92, z: -63 }, { x: -68, z: -63 }, { x: -68, z: -57 }, { x: -92, z: -57 }], rooms: [] },
  ],
  gameplay: { goal: 'exit', spawn: { x: -120, z: -110 }, exit: { x: 100, z: 120 }, exitRadius: 4 },
});

for (const [minZ, maxZ, y] of [[45, 72, 7], [45, 72, 6.8], [42, 70, 6.7], [40, 68, 6.6], [40, 68, 7], [38, 66, 6.8]]) {
  const raw = base({ id: 'terrace', minX: -20, maxX: 40, minZ, maxZ, y });
  const level = normalizeLevel(raw);
  const f = reliefOf(structuredClone(level.map.relief));
  let max = 0; let at = null;
  for (let x = -148; x <= 148; x += 4) for (let z = -148; z <= 148; z += 4) {
    const m = f.slopeAt(x, z).mag;
    if (m > max) { max = m; at = [x, z]; }
  }
  const terracePad = level.map.relief.pads.find(p => p.id === 'terrace');
  const ridge = level.map.buildings.find(b => b.id === 'h_ridge');
  const low = level.map.buildings.find(b => b.id === 'h_low');
  console.log(`z ${minZ}…${maxZ} y=${y}: кольцо ${terracePad.blend}, поле ${max.toFixed(4)} (${(max / 0.12).toFixed(2)} предела) в ${at}, `
    + `предупреждений ${level.warnings.length} [${level.warnings.map(w => w.slice(0, 40)).join(' | ')}], `
    + `baseY ${ridge.baseY}/${low.baseY} Δ=${(ridge.baseY - low.baseY).toFixed(2)}, край кольца ${(terracePad.maxZ + terracePad.blend).toFixed(1)}`);
}

// три капсулы в ряд — поштучно в пределе, вместе круче предела поля
const stacked = reliefOf({
  baseY: 0,
  hills: [
    { id: 'a', x: 0, z: -120, radius: 320, height: 12 },
    { id: 'b', x: 0, z: -110, radius: 320, height: 12 },
    { id: 'c', x: 0, z: -100, radius: 320, height: 12 },
  ],
});
let m2 = 0; let a2 = null;
for (let x = -148; x <= 148; x += 3) for (let z = -148; z <= 148; z += 3) {
  const m = stacked.slopeAt(x, z).mag;
  if (m > m2) { m2 = m; a2 = [x, z]; }
}
console.log('три капсулы в ряд: природа макс', m2.toFixed(4), 'в', a2, 'поштучный пик', (1.5 * 12 / 320).toFixed(4));
