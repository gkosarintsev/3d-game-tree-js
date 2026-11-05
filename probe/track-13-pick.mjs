// Разведка брифа главы 13: два квартала ловят по носу съезда, третий (seaward)
// держит спавн. Для кандидата печатает носы, отметки и инвентарь полотен.
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
  city: { seed, districts, track: { ...TRACK_DEFAULTS, entries: 2, ...track } },
});

const box = (x, z, h) => ({
  minX: Math.round(x - h), maxX: Math.round(x + h),
  minZ: Math.round(z - h), maxZ: Math.round(z + h),
});

const district = (id, block, extra) => ({
  id, block, street: { pitch: 40, width: 14, grade: 0.06 }, ...extra,
});

function coverOf(e) {
  const p = e.elements[0].plate;
  const rad = (p.yaw ?? 0) * Math.PI / 180;
  return { x: p.x + Math.cos(rad) * p.length / 2, z: p.z + Math.sin(rad) * p.length / 2 };
}

/** Два квартала едут за носами, третий стоит на месте. */
function trial(seed, half, turns, third) {
  let blocks = [box(-160, 180, half), box(160, -180, half)];
  let last = null;
  for (let pass = 0; pass < 5; pass++) {
    const stats = {};
    const districts = [
      district('d0', blocks[0]), district('d1', blocks[1]),
      district('s0', third.block, third.extra),
    ];
    let built;
    try {
      built = expandCity(structuredClone(level(districts, seed, { turns })), stats);
    } catch (e) {
      return { err: String(e.message).split('\n')[0] };
    }
    const { errors } = validateLevel(built, LEVEL_SPEC_V2);
    const norm = normalizeLevel(built);
    const entriesOut = built.roads.filter(r => r.trackRole === 'entry').map(coverOf);
    last = { errors, warnings: norm.warnings, stats, built, norm, blocks };
    if (entriesOut.length !== 2) break;
    const moved = entriesOut.some((c, i) =>
      Math.abs(c.x - (blocks[i].minX + blocks[i].maxX) / 2) > 1
      || Math.abs(c.z - (blocks[i].minZ + blocks[i].maxZ) / 2) > 1);
    blocks = entriesOut.map(c => box(c.x, c.z, half));
    if (!moved) break;
  }
  return last;
}

const half = Number(process.argv[2] ?? 70);
const turns = Number(process.argv[3] ?? 12);
const third = { block: box(-230, -230, 60), extra: { name: 'Нижний квартал' } };
const only = Number(process.argv[4] ?? 0);
for (let seed = only || 1; seed <= (only || 60); seed++) {
  const r = trial(seed, half, turns, third);
  if (r.err) { console.log(`${seed}: ${r.err}`); continue; }
  const n = r.errors.length + r.warnings.length;
  if (only) {
    const ring = r.built.roads.find(x => x.trackRole === 'ring');
    const arcs = ring.elements.filter(e => e.arc).length, plates = ring.elements.length - arcs;
    const decks = r.norm.map.roads.reduce((m, x) => m + (x.decks?.length ?? 0), 0);
    const props = r.norm.map.props ?? [];
    const pillars = props.filter(p => p.model === 'concrete_pillar').length;
    const lamps = props.filter(p => p.model === 'lamp_post').length;
    console.log(`seed ${seed}: шум ${n} домов ${r.built.buildings.length} лотов ${JSON.stringify(r.stats.lots)}`
      + ` | настилов ${decks} | опор ${pillars} | фонарей ${lamps}`);
    console.log(`  кольцо: ${ring.elements.length} элементов (дуг ${arcs}, пластин ${plates}) | настилов в норме ${decks} | опор ${pillars}`);
    for (const e of r.built.roads.filter(x => x.trackRole === 'entry')) {
      const p = e.elements[0].plate;
      console.log(`  ${e.id}: центр ${p.x.toFixed(1)},${p.z.toFixed(1)} yaw ${p.yaw?.toFixed(2)} длина ${p.length.toFixed(1)} y ${p.y.toFixed(3)} rise ${p.rise.toFixed(3)}`);
    }
    console.log(`  блоки ${JSON.stringify(r.blocks)}`);
    console.log(`  шум: ${[...r.errors, ...r.warnings].join(' | ').slice(0, 400)}`);
  } else if (n === 0) console.log(`${seed}: шум 0 домов ${r.built.buildings.length} | ${JSON.stringify(r.blocks)}`);
}
