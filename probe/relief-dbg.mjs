import { reliefOf } from '../src/relief.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';

const RELIEF_RAW = {
  kind: 'json2',
  metadata: { levelName: 'reliefHouse', name: 'Ярусы', hint: '—', units: 'meters' },
  ground: { y: 0, size: 300 },
  relief: {
    baseY: 0,
    hills: [
      { id: 'gryada', x: -30, z: 60, bx: 60, bz: 60, radius: 250, height: 10 },
      { id: 'lovchina', x: -80, z: -70, radius: 300, height: -6 },
    ],
    pads: [{ id: 'terrace', minX: -20, maxX: 40, minZ: 40, maxZ: 70, y: 8.6 }],
  },
  roads: [
    { id: 'st_high', type: 'ground', width: 8, lamps: true,
      points: [{ x: -40, y: 8.6, z: 60 }, { x: 100, y: 8.6, z: 60 }] },
    { id: 'br_span', type: 'bridge',
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
const v = validateLevel(structuredClone(RELIEF_RAW), LEVEL_SPEC_V2);
console.log('errors:', v.errors, 'warn:', v.warnings);
const level = normalizeLevel(structuredClone(RELIEF_RAW));
console.log('warnings:', level.warnings);
console.log('pads:', JSON.stringify(level.map.relief.pads));
const f = reliefOf(structuredClone(level.map.relief));
let max = 0, at = null;
for (let x = -148; x <= 148; x += 4) for (let z = -148; z <= 148; z += 4) {
  const s = f.slopeAt(x, z).mag;
  if (s > max) { max = s; at = [x, z]; }
}
console.log('макс уклон', max.toFixed(3), 'в', at, '| nature', f.reliefHeightAt(at[0], at[1]).toFixed(2),
  'pad contribution weight', JSON.stringify(f.padsAt(at[0], at[1]).map(q => [q.pad.id, +q.weight.toFixed(2)])));
const br = level.map.roads.find(r => r.id === 'br_span');
console.log('decks:', JSON.stringify(br.decks));
console.log('pillars:', level.map.props.filter(p => p.source === 'bridge_pillar').map(p => [p.id, p.position.y, p.scale.y]));
console.log('land(−60,−40)=', f.heightAt(-60, -40), 'land(−20,−40)=', f.heightAt(-20, -40), 'land(20,−40)=', f.heightAt(20, -40));
