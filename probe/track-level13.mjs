// Разведка брифа главы 13: два квартала ловят по носу съезда, третий держит
// спавн. Кандидаты, где сборка не несёт ни ошибки, ни предупреждения.
import { CONFIG } from '../src/config.js';
import { TRACK_DEFAULTS, expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const relief = {
  baseY: 0, hillMaxSlope: 0.06, maxSlope: 0.12, blend: 30,
  hills: [
    { id: 'shelf_south', x: -220, z: -190, bx: 220, bz: -190, radius: 240, height: -3.2 },
    { id: 'bench_centre', x: -180, z: 20, bx: 180, bz: 20, radius: 260, height: 2.4 },
    { id: 'crest_north', x: -140, z: 230, bx: 200, bz: 230, radius: 220, height: 7.4 },
  ],
  pads: [{ id: 'terrace_south', minX: -240, maxX: 240, minZ: -300, maxZ: -140, y: -1.2 }],
};

const level = (districts, seed, track) => ({
  kind: 'json2',
  metadata: { levelName: 'level-13', name: 'проба', hint: ' ', engine: 'three', units: 'meters' },
  ground: { y: 0, size: 600 },
  relief,
  gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 1, z: 1 }, enemies: { count: 1 } },
  city: { seed, districts, track: { ...TRACK_DEFAULTS, ...track } },
});

const box = (x, z, h) => ({
  minX: Math.round(x - h), maxX: Math.round(x + h),
  minZ: Math.round(z - h), maxZ: Math.round(z + h),
});

const district = (id, block, yaw) => ({
  id, block, street: { pitch: 40, width: 14, grade: 0.06 },
  ...(yaw === undefined ? {} : { yaw }),
});

/** Квартал ставится в центр съезда: нос лежит на его торце, пластина — поперёк. */
function coverOf(e) {
  const p = e.elements[0].plate;
  const rad = (p.yaw ?? 0) * Math.PI / 180;
  return { x: p.x + Math.cos(rad) * p.length / 2, z: p.z + Math.sin(rad) * p.length / 2, yaw: p.yaw };
}

function trial(seed, half, turns, entries) {
  let blocks = [box(-200, -220, half), box(200, -220, half)];
  let last = null;
  for (let pass = 0; pass < 5; pass++) {
    const stats = {};
    const districts = blocks.map((b, i) => district(`d${i}`, b));
    let built;
    try {
      built = expandCity(structuredClone(level(districts, seed, { entries, turns })), stats);
    } catch (e) {
      return { err: String(e.message).split('\n')[0] };
    }
    const { errors } = validateLevel(built, LEVEL_SPEC_V2);
    const norm = normalizeLevel(built);
    last = { errors, warnings: norm.warnings, stats, built, blocks };
    const entriesOut = built.roads.filter(r => r.trackRole === 'entry').map(coverOf);
    if (entriesOut.length !== blocks.length) break;
    const moved = entriesOut.some((c, i) =>
      Math.abs(c.x - (blocks[i].minX + blocks[i].maxX) / 2) > 1 || Math.abs(c.z - (blocks[i].minZ + blocks[i].maxZ) / 2) > 1);
    blocks = entriesOut.map(c => box(c.x, c.z, half));
    if (!moved) break;
  }
  return last;
}

const half = Number(process.argv[2] ?? 70);
const turns = Number(process.argv[3] ?? 12);
for (let seed = 1; seed <= 60; seed++) {
  const r = trial(seed, half, turns, 2);
  if (r.err) { console.log(`${seed}: ${r.err}`); continue; }
  const n = r.errors.length + r.warnings.length;
  const houses = r.built.buildings.length;
  console.log(`${seed}: шум ${n} домов ${houses}${n ? ' — ' + [r.errors[0], r.warnings[0]].filter(Boolean).join(' | ').slice(0, 150) : ''}`
    + ` | блоки ${JSON.stringify(r.blocks)}`);
}
