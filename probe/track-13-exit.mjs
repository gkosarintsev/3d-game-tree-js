// Разведка точки B главы 13: какие кровли у носа второго съезда вводимы и ходовы.
import fs from 'node:fs';
import { TRACK_DEFAULTS, expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const raw = JSON.parse(fs.readFileSync(process.argv[3] ?? 'probe/level-13-candidate.json', 'utf8'));
const stats = {};
const built = expandCity(structuredClone(raw), stats);
const { errors } = validateLevel(built, LEVEL_SPEC_V2);
const norm = normalizeLevel(built);
console.log(`ошибок ${errors.length}: ${errors.slice(0, 3).join(' | ')}`);
console.log(`предупреждений ${norm.warnings.length}: ${norm.warnings.slice(0, 3).join(' | ')}`);
console.log(`счётчики: ${JSON.stringify(stats)}`);

const noses = built.roads.filter(r => r.trackRole === 'entry').map(r => {
  const p = r.elements[0].plate;
  const rad = (p.yaw ?? 0) * Math.PI / 180;
  return { id: r.id, x: p.x + Math.cos(rad) * p.length / 2, z: p.z + Math.sin(rad) * p.length / 2,
    ringTop: p.y, streetTop: p.y + p.rise, len: p.length };
});
for (const n of noses) console.log(`${n.id}: нос ${n.x.toFixed(1)}, ${n.z.toFixed(1)} полотно ${n.ringTop.toFixed(2)} → улица ${n.streetTop.toFixed(2)} (пролёт ${n.len.toFixed(1)} м)`);

const map = norm.map;
for (const b of map.buildings) {
  const near = noses.map(n => ({ n, d: Math.hypot((b.bounds.minX + b.bounds.maxX) / 2 - n.x, (b.bounds.minZ + b.bounds.maxZ) / 2 - n.z) }))
    .sort((a, c) => a.d - c.d)[0];
  if (near.d > 90) continue;
  console.log(`${b.id} enterable=${!!b.isEnterable} roof=${b.roof?.walkable} y=${(b.roofY ?? b.baseY + b.floorsCount * b.floorHeight)?.toFixed?.(2) ?? b.roofY}`
    + ` план ${b.bounds.minX}…${b.bounds.maxX} × ${b.bounds.minZ}…${b.bounds.maxZ} floors=${b.floorsCount} до носа ${near.d.toFixed(0)} (${near.n.id})`);
}
const decks = map.roads.filter(r => r.trackRole);
for (const r of decks) console.log(`${r.id} ${r.trackRole}: настилов ${r.decks?.length ?? 0} тип ${r.type} ширина ${r.width}`);
console.log(`узлов нормализовано: дорог ${map.roads.length}, домов ${map.buildings.length}, опор ${(map.props ?? []).filter(p => p.model === 'concrete_pillar').length}, фонарей ${(map.props ?? []).filter(p => p.model === 'lamp_post').length}`);
