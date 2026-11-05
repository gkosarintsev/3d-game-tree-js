import { LEVEL_10 } from '../src/levels/level-10.js';
const b = LEVEL_10.map.buildings.find(x => x.id === 'nkab_094');
console.log(JSON.stringify({
  id: b.id, bounds: b.bounds, floorsCount: b.floorsCount, floorHeight: b.floorHeight, roofY: b.roofY, roof: b.roof,
}, null, 1));
for (const r of b.rooms) console.log('room', r.id, r.floor, JSON.stringify(r.rect), r.y);
for (const s of b.stairs) console.log('stair', s.id, JSON.stringify(s.connectsFloors), 'y0', s.y0, 'y1', s.y1, 'rect', JSON.stringify(s.rect), 'top', JSON.stringify(s.top), 'bottom', JSON.stringify(s.bottom), 'steps', s.steps && s.steps.length, 'type', s.type);
for (const d of b.doors) console.log('door', d.id, JSON.stringify(d.inside), JSON.stringify(d.outside), d.y);
