import fs from 'node:fs';
import { TRACK_DEFAULTS, expandCity } from '../tools/city.js';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const lvl12 = JSON.parse(fs.readFileSync('src/levels/level-12.json', 'utf8'));
const mild = { baseY: 0, hills: [{ x: -300, z: 0, bx: 300, bz: 0, radius: 400, height: 6 }] };

const level = (relief, districts, seed, track, exit) => ({
  kind: 'json2',
  metadata: { levelName: 'probe', name: 'проба', hint: ' ', units: 'meters' },
  ground: { y: 0, size: 600 },
  ...(relief ? { relief } : {}),
  gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit, enemies: { count: 1 } },
  city: { seed, districts, track: { ...TRACK_DEFAULTS, ...track } },
});

function report(label, relief, seed, entries, block, exitOnRing) {
  const districts = block === null ? [] : [{
    id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 }, ...block,
  }];
  const stats = {};
  let built;
  try {
    built = expandCity(structuredClone(level(relief, districts, seed, { entries }, { x: 1, z: 1 })), stats);
  } catch (e) {
    console.log(`${label}: бросок — ${String(e.message).split('\n')[0]}`);
    return null;
  }
  if (exitOnRing) {
    const p = built.roads.find(r => r.trackRole === 'ring').elements.find(el => el.plate).plate;
    built.gameplay.exit = { x: p.x, z: p.z };
  }
  const { errors, warnings } = validateLevel(built, LEVEL_SPEC_V2);
  const norm = normalizeLevel(structuredClone(built));
  const all = [...errors, ...warnings.map(m => `схема: ${m}`), ...norm.warnings.map(m => `норм: ${m}`)];
  const noses = built.roads.filter(r => r.trackRole === 'entry').map(r => {
    const q = r.elements[r.elements.length - 1].plate;
    const rad = (q.yaw ?? 0) * Math.PI / 180;
    return { x: q.x + Math.cos(rad) * q.length / 2, z: q.z + Math.sin(rad) * q.length / 2 };
  });
  console.log(`${label}: сообщений ${all.length}${all.length ? ' → ' + all.slice(0, 3).join(' | ') : ''}`);
  console.log(`   носы ${JSON.stringify(noses.map(n => [Math.round(n.x), Math.round(n.z)]))} счётчики ${JSON.stringify(stats)}`);
  return { all, noses, stats, built };
}

// 1) один проход: район в дальнем углу — носы видны, улица под ними не стелется
for (const seed of [2, 3, 5, 8, 17]) {
  const far = { block: { minX: 200, maxX: 290, minZ: 200, maxZ: 290 } };
  const r = report(`равнина seed ${seed} район в углу`, null, seed, 2, far, true);
  if (!r) continue;
  const cover = {
    id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 },
    block: {
      minX: Math.round(Math.min(...r.noses.map(n => n.x)) - 60),
      maxX: Math.round(Math.max(...r.noses.map(n => n.x)) + 60),
      minZ: Math.round(Math.min(...r.noses.map(n => n.z)) - 60),
      maxZ: Math.round(Math.max(...r.noses.map(n => n.z)) + 60),
    },
  };
  console.log(`   кандидат ${JSON.stringify(cover.block)}`);
  report(`  → тот же сид, район под носами`, null, seed, 2, cover, true);
}
