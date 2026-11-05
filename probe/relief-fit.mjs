/**
 * Подгонка чисел фиксатура рельефа: природа (макс уклон и отметки), ошибки/
 * предупреждения парсера, подобранные кольца и максимальный уклон собранного поля.
 * usage: node probe/relief-fit.mjs
 */
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { reliefOf } from '../src/relief.js';

const A = [
  { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 320, height: 9 },
  { id: 'lovchina', x: -80, z: -70, radius: 320, height: -5 },
];
const B = [
  { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 250, height: 10 },
  { id: 'lovchina', x: -80, z: -70, radius: 300, height: -6 },
];

function natureStats(hills, label) {
  const n = reliefOf({ baseY: 0, hills });
  let max = 0; let at = null;
  for (let x = -148; x <= 148; x += 4) for (let z = -148; z <= 148; z += 4) {
    const m = n.slopeAt(x, z).mag;
    if (m > max) { max = m; at = [x, z]; }
  }
  console.log(`${label}: природа макс ${max.toFixed(4)} в ${at}; `
    + `(0,100)=${n.heightAt(0, 100).toFixed(2)} (-80,-60)=${n.heightAt(-80, -60).toFixed(2)} `
    + `(10,60)=${n.heightAt(10, 60).toFixed(2)} (0,-40)=${n.heightAt(0, -40).toFixed(2)} (-60,-40)=${n.heightAt(-60, -40).toFixed(2)}`);
  return n;
}

function run(raw, hills, label) {
  const { errors } = validateLevel(structuredClone(raw), LEVEL_SPEC_V2);
  const t0 = Date.now();
  const level = normalizeLevel(structuredClone(raw));
  const ms = Date.now() - t0;
  const f = reliefOf(structuredClone(level.map.relief));
  let max = 0; let at = null;
  for (let x = -148; x <= 148; x += 6) for (let z = -148; z <= 148; z += 6) {
    const m = f.slopeAt(x, z).mag;
    if (m > max) { max = m; at = [x, z]; }
  }
  const ridge = level.map.buildings.find(b => b.id === 'h_ridge');
  const low = level.map.buildings.find(b => b.id === 'h_low');
  const author = level.map.relief.pads.filter(p => !p.id.endsWith(':площадка'));
  const withAuthor = reliefOf({ baseY: 0, hills: structuredClone(hills), pads: structuredClone(author) });
  const pillars = level.map.props.filter(p => p.source === 'bridge_pillar');
  const feet = pillars.map(p => p.position.y);
  console.log(`\n${label}`);
  console.log(`  ошибки ${errors.length} ${errors.slice(0, 3)}`);
  console.log(`  предупреждения ${level.warnings.length} ${level.warnings.join(' | ')}`);
  console.log(`  кольца: ${level.map.relief.pads.map(p => `${p.id}=${p.blend}`).join('  ')}`);
  console.log(`  макс уклон поля ${max.toFixed(4)} в ${at} (${(max / level.map.relief.maxSlope).toFixed(2)} предела), ${ms} мс`);
  console.log(`  h_ridge baseY ${ridge.baseY} | поле с авторской террасой ${withAuthor.heightAt(0, 100).toFixed(3)} | природа ${reliefOf({ baseY: 0, hills: structuredClone(hills) }).heightAt(0, 100).toFixed(3)}`);
  console.log(`  h_low baseY ${low.baseY} | разница ярусов ${(ridge.baseY - low.baseY).toFixed(2)}`);
  console.log(`  колонн ${pillars.length}, пятки ${Math.min(...(feet.length ? feet : [0])).toFixed(2)}…${Math.max(...(feet.length ? feet : [0])).toFixed(2)}`);
}

function fixture(hills, terrace, extraPads = []) {
  return {
    kind: 'json2',
    metadata: { levelName: 'reliefHouse', name: 'Ярусы', hint: '—', units: 'meters' },
    ground: { y: 0, size: 300 },
    relief: { baseY: 0, hills: structuredClone(hills), pads: [terrace, ...extraPads] },
    roads: [
      { id: 'st_high', type: 'ground', width: 8, lamps: true,
        points: [{ x: -40, y: 8.6, z: 60 }, { x: 100, y: 8.6, z: 60 }] },
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
  };
}

natureStats(A, 'A (r320/h9 + r320/h−5)');
natureStats(B, 'B (r250/h10 + r300/h−6)');

run(fixture(A, { id: 'terrace', minX: -20, maxX: 40, minZ: 45, maxZ: 72, y: 6.4 }), A, 'A терраса 6.4');
run(fixture(A, { id: 'terrace', minX: -20, maxX: 40, minZ: 45, maxZ: 72, y: 7 }), A, 'A терраса 7');
run(fixture(B, { id: 'terrace', minX: -20, maxX: 40, minZ: 45, maxZ: 72, y: 7.2 }), B, 'B терраса 7.2');
run(fixture(A, { id: 'terrace', minX: -20, maxX: 40, minZ: 45, maxZ: 72, y: 6.4 },
  [{ id: 'уступ', minX: -10, maxX: 10, minZ: 10, maxZ: 30, y: 4, blend: 2 }]), A, 'A + уступ blend 2');
run(fixture(A, { id: 'terrace', minX: -20, maxX: 40, minZ: 45, maxZ: 72, y: 22 }), A, 'A терраса 22 (должна предупредить)');
