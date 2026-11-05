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

/** Блок, накрывающий все носы съездов, и точка B — на пластине кольца. */
function trial(relief, seed, entries, half) {
  let blocks = null;
  let last = null;
  for (let pass = 0; pass < 4; pass++) {
    const stats = {};
    let built;
    try {
      built = expandCity(structuredClone(level(relief, blocks ?? [{
        id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 },
        block: { minX: 140, maxX: 290, minZ: -75, maxZ: 75 },
      }], seed, { entries }, { x: 1, z: 1 })), stats);
    } catch (e) {
      return { err: String(e.message).split('\n')[0] };
    }
    const ring = built.roads.find(r => r.trackRole === 'ring');
    const p = ring.elements.find(el => el.plate).plate;
    const exits = [{ x: p.x, z: p.z }];
    const { errors, warnings } = validateLevel(built, LEVEL_SPEC_V2);
    const norm = normalizeLevel(structuredClone(built));
    last = { errors, warnings, norm, stats, built, exits };
    const noses = built.roads.filter(r => r.trackRole === 'entry').map(r => {
      const q = r.elements[r.elements.length - 1].plate;
      const rad = (q.yaw ?? 0) * Math.PI / 180;
      return { x: q.x + Math.cos(rad) * q.length / 2, z: q.z + Math.sin(rad) * q.length / 2 };
    });
    if (!noses.length) break;
    const xs = noses.map(n => n.x), zs = noses.map(n => n.z);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
    const next = [{
      id: 'd0', street: { pitch: 44, width: 14, grade: 0.06 },
      block: {
        minX: Math.round(Math.min(...xs) - half), maxX: Math.round(Math.max(...xs) + half),
        minZ: Math.round(Math.min(...zs) - half), maxZ: Math.round(Math.max(...zs) + half),
      },
    }];
    if (blocks && JSON.stringify([next, cx]) === JSON.stringify([blocks, cx])) break;
    blocks = next;
  }
  return last;
}

const reliefs = [['равнина', null], ['мягкая гряда', mild], ['гряда 12', lvl12.relief]];
for (const [label, relief] of reliefs) {
  for (const entries of [1, 2]) {
    let best = null, n = 0;
    const bucket = new Map();
    for (let seed = 1; seed <= 120; seed++) {
      const r = trial(relief, seed, entries, 60);
      if (r.err) continue;
      const all = [...r.errors, ...r.warnings, ...r.norm.warnings.map(m => `норм: ${m}`)];
      if (all.length === 0) { n++; if (!best) best = [seed, JSON.stringify(r.stats)]; }
      for (const m of all) {
        const k = m.replace(/\d/g, '#').slice(0, 100);
        bucket.set(k, (bucket.get(k) ?? 0) + 1);
      }
    }
    console.log(`${label} | съездов ${entries}: чистых ${n}/120, первый сид ${best ? best.join(' ') : '—'}`);
    for (const [k, v] of [...bucket.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)) console.log(`   ${v}× ${k}`);
  }
}
