// Подгонка брифа главы 13: кварталы d0/d1 едут к носам съездов, пока не сойдутся.
// --write кладёт сошедшийся бриф в src/levels/level-13.json (точка B — по кровле).
import fs from 'node:fs';
import { expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const SRC = 'probe/level-13-candidate.json';
const write = process.argv.includes('--write');

function build(raw) {
  const stats = {};
  const built = expandCity(structuredClone(raw), stats);
  const { errors, warnings: geo } = validateLevel(built, LEVEL_SPEC_V2);
  const norm = errors.length ? null : normalizeLevel(built);
  return { built, stats, errors, warnings: [...geo, ...(norm?.warnings ?? [])], norm };
}

const toeOf = (e) => {
  const p = e.elements[0].plate;
  const rad = (p.yaw ?? 0) * Math.PI / 180;
  return { x: p.x + Math.cos(rad) * p.length / 2, z: p.z + Math.sin(rad) * p.length / 2,
    ringTop: p.y, streetTop: p.y + p.rise, len: p.length, deg: p.yaw };
};

const raw = JSON.parse(fs.readFileSync(SRC, 'utf8'));
let r = build(raw);
if (r.errors.length) {
  console.log('стартовый бриф брак:', r.errors.slice(0, 6).join('\n  '));
  process.exit(1);
}
// Квартал, уткнувшийся в нос, двигает террасу, терраса двигает нос — на крутом
// поле это цикл из двух состояний, а не сходимость. Поэтому собираем ОБА и
// выбираем то, где сборка чище и домов больше.
const samples = [{ blocks: structuredClone(raw.city.districts.map(d => d.block)), r }];
for (let pass = 0; pass < 6; pass++) {
  const entries = r.built.roads.filter(x => x.trackRole === 'entry');
  const byId = new Map(raw.city.districts.map(d => [d.id, d]));
  const moved = [];
  entries.forEach((e, i) => {
    const t = toeOf(e);
    const d = byId.get(`d${i}`);
    const w = d.block.maxX - d.block.minX, h = d.block.maxZ - d.block.minZ;
    const cx = (d.block.minX + d.block.maxX) / 2, cz = (d.block.minZ + d.block.maxZ) / 2;
    if (Math.abs(cx - t.x) < 1 && Math.abs(cz - t.z) < 1) return;
    // центр не должен вылезти за плиту: повёрнутый блок занимает больше, чем его
    // стороны, и гейт `expandCity` бракует габарит вне ±300
    const rad = (d.yaw ?? 0) * Math.PI / 180;
    const hx = (w / 2) * Math.abs(Math.cos(rad)) + (h / 2) * Math.abs(Math.sin(rad));
    const hz = (w / 2) * Math.abs(Math.sin(rad)) + (h / 2) * Math.abs(Math.cos(rad));
    const nx = Math.max(-300 + hx + 1, Math.min(300 - hx - 1, t.x));
    const nz = Math.max(-300 + hz + 1, Math.min(300 - hz - 1, t.z));
    d.block = {
      minX: Math.round(nx - w / 2), maxX: Math.round(nx + w / 2),
      minZ: Math.round(nz - h / 2), maxZ: Math.round(nz + h / 2),
    };
    moved.push(`d${i} → ${Math.round(nx)},${Math.round(nz)}`);
  });
  r = build(raw);
  samples.push({ blocks: structuredClone(raw.city.districts.map(d => d.block)), r });
  console.log(`проход ${pass}: ${moved.join(', ') || 'сошлось'} | ошибок ${r.errors.length} предупреждений ${r.warnings.length} домов ${r.norm?.map.buildings.length}`);
  if (r.errors.length) { console.log('брак:', r.errors.slice(0, 4).join('\n  ')); process.exit(1); }
  if (!moved.length) break;
}
const best = samples.reduce((a, s) => {
  const noise = s.r.warnings.length + s.r.errors.length;
  const houses = s.r.norm.map.buildings.length;
  const an = a.r.warnings.length + a.r.errors.length, ah = a.r.norm.map.buildings.length;
  return (noise < an || (noise === an && houses > ah)) ? s : a;
});
for (const [i, d] of best.blocks.entries()) raw.city.districts[i].block = d;
r = best.r;
console.log(`выбран вариант: блоки ${JSON.stringify(best.blocks)} (шум ${r.warnings.length}, домов ${r.norm.map.buildings.length})`);

const entries = r.built.roads.filter(x => x.trackRole === 'entry').map(e => ({ id: e.id, ...toeOf(e) }));
for (const e of entries) console.log(`${e.id}: нос ${e.x.toFixed(1)}, ${e.z.toFixed(1)} полотно ${e.ringTop.toFixed(2)} → улица ${e.streetTop.toFixed(2)} (пролёт ${e.len.toFixed(1)} м)`);

const ring = r.built.roads.find(x => x.trackRole === 'ring');
console.log(`кольцо: ${ring.elements.length} элементов (дуг ${ring.elements.filter(e => e.arc).length})`);
console.log(`инвентарь: дорог ${r.norm.map.roads.length} настилов ${r.norm.map.roads.reduce((m, x) => m + (x.decks?.length ?? 0), 0)} домов ${r.norm.map.buildings.length} опор ${(r.norm.map.props ?? []).filter(p => p.model === 'concrete_pillar').length} фонарей ${(r.norm.map.props ?? []).filter(p => p.model === 'lamp_post').length}`);
console.log(`счётчики: ${JSON.stringify(r.stats)}`);
console.log(`шум: ${r.warnings.slice(0, 6).join(' | ') || 'нет'}`);

// Кровли вводимого дома у северного носа — кандидат на точку B.
const north = entries.reduce((a, b) => (a.ringTop > b.ringTop ? a : b));
const inNorth = r.norm.map.buildings
  .map(b => ({ b, d: Math.hypot((b.bounds.minX + b.bounds.maxX) / 2 - north.x, (b.bounds.minZ + b.bounds.maxZ) / 2 - north.z) }))
  .filter(x => x.d < 100 && x.b.isEnterable && x.b.roof?.walkable)
  .sort((a, b) => a.d - b.d)
  .slice(0, 8);
for (const { b, d } of inNorth) {
  console.log(`  кровля ${b.id} до носа ${d.toFixed(0)} м roofY ${b.roofY?.toFixed(2)} этажей ${b.floorsCount} план ${b.bounds.minX}…${b.bounds.maxX} × ${b.bounds.minZ}…${b.bounds.maxZ} пов ${b.rotation?.toFixed(1)}`);
}

if (write && inNorth.length) {
  const pick = inNorth[0].b;
  raw.gameplay.exit = {
    x: Number(((pick.bounds.minX + pick.bounds.maxX) / 2).toFixed(2)),
    z: Number(((pick.bounds.minZ + pick.bounds.maxZ) / 2).toFixed(2)),
  };
  const south = entries.find(e => e !== north);
  const rad = south.deg * Math.PI / 180;
  raw.gameplay.spawn = {
    x: Number((south.x - Math.cos(rad) * 6).toFixed(2)),
    z: Number((south.z - Math.sin(rad) * 6).toFixed(2)),
  };
  fs.writeFileSync('src/levels/level-13.json', `${JSON.stringify(raw, null, 2)}\n`);
  console.log(`записан src/levels/level-13.json: spawn ${JSON.stringify(raw.gameplay.spawn)} exit ${JSON.stringify(raw.gameplay.exit)}`);
}
