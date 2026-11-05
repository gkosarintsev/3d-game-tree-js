import fs from 'node:fs';
import { CONFIG } from '../src/config.js';
import { TRACK_DEFAULTS, expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel, roadCapsOf } from '../tools/normalize-level.mjs';

const J = CONFIG.jsonMap;
const lvl12 = JSON.parse(fs.readFileSync('src/levels/level-12.json', 'utf8'));

const level = (over = {}, districts = [{ id: 'd0', block: { minX: 150, maxX: 285, minZ: -140, maxZ: 140 }, street: { pitch: 45 } }]) => {
  const { noRelief, ...tOver } = over;
  return {
    kind: 'json2',
    metadata: { levelName: 'probe', name: 'проба', hint: ' ', units: 'meters' },
    ground: { y: 0, size: 600 },
    ...(noRelief ? {} : { relief: lvl12.relief }),
    gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 1, z: 1 }, enemies: { count: 1 } },
    city: { seed: 20261105, districts, track: { ...TRACK_DEFAULTS, entries: 2, ...tOver } },
  };
};

const run = (label, over, districts) => {
  const stats = {};
  let expanded;
  try {
    expanded = expandCity(structuredClone(level(over, districts)), stats);
  } catch (e) {
    console.log(`${label}: ОШИБКА РАЗВОРОТА — ${String(e.message).split('\n')[0]}`);
    return;
  }
  const ring = expanded.roads.find(r => r.trackRole === 'ring');
  const entries = expanded.roads.filter(r => r.trackRole === 'entry');
  const caps = roadCapsOf(ring);
  let joint = 0, seam = 0, slope = 0;
  for (const [i, c] of caps.entries()) {
    const n = caps[(i + 1) % caps.length];
    const gap = Math.hypot(n.x - c.x, n.z - c.z);
    if (gap > 1e-6 && gap < J.deckJoint) joint = Math.max(joint, Math.abs(n.top - c.top));
  }
  for (const el of ring.elements) {
    const len = el.plate ? el.plate.length : el.arc.radius * Math.abs((el.arc.to - el.arc.from) * Math.PI / 180);
    slope = Math.max(slope, Math.abs(el.plate ? el.plate.rise : el.arc.y[1] - el.arc.y[0]) / len);
  }
  seam = Math.abs(caps[0].top - caps[caps.length - 1].top);
  console.log(`${label}: элементов кольца ${ring.elements.length}`
    + ` (дуг ${ring.elements.filter(e => e.arc).length}, пластин ${ring.elements.filter(e => e.plate).length})`
    + ` | съездов ${entries.length} | улиц района ${expanded.roads.filter(r => r.district !== undefined).length}`
    + ` | домов ${expanded.buildings.length}`);
  console.log(`  полотно: ступень на стыке max ${joint.toFixed(5)} м | перепад шва ${seam.toFixed(5)} м`
    + ` | уклон max ${slope.toFixed(5)} при grade ${over.grade ?? TRACK_DEFAULTS.grade}`);
  const { errors, warnings } = validateLevel(expanded, LEVEL_SPEC_V2);
  const norm = normalizeLevel(expanded);
  console.log(`  схема: ошибок ${errors.length}, предупреждений ${warnings.length}`);
  for (const m of errors.slice(0, 6)) console.log(`   ✗ ${m}`);
  for (const m of warnings.slice(0, 6)) console.log(`   ! ${m}`);
  console.log(`  нормализатор: предупреждений ${norm.warnings.length}`);
  for (const m of norm.warnings.slice(0, 8)) console.log(`   ! ${m}`);
  console.log(`  счётчики: ${JSON.stringify(stats)}`);
  for (const e of entries) {
    const p = e.elements[0].plate;
    const c = roadCapsOf(e);
    console.log(`  ${e.id}: длина ${p.length} уклон ${(Math.abs(p.rise) / p.length).toFixed(4)}`
      + ` | кольцо @ ${c[0].top.toFixed(3)} в (${c[0].x}, ${c[0].z}) → нос @ ${c[1].top.toFixed(3)} в (${c[1].x}, ${c[1].z})`);
  }
};

run('дефолты, район на весь восток', {});
run('petit', { radius: 80, turns: 8, minRadius: 30, entries: 2 });
run('район ловит носы', {}, [{ id: 'd0', block: { minX: -150, maxX: -50, minZ: -130, maxZ: 10 } }]);
run('четыре съезда', { entries: 4 }, [
  { id: 'd0', block: { minX: -150, maxX: -50, minZ: -130, maxZ: 10 } },
  { id: 'd1', block: { minX: 15, maxX: 120, minZ: 60, maxZ: 180 } },
]);
run('без рельефа', {}, [{ id: 'd0', block: { minX: -280, maxX: 280, minZ: -280, maxZ: 280 }, street: { pitch: 60 } }]);
