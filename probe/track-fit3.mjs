import fs from 'node:fs';
import { CONFIG } from '../src/config.js';
import { reliefOf } from '../src/relief.js';
import { TRACK_DEFAULTS, trackSpec, trackCenterline, trackProfile, trackFittedAt, expandCity } from '../tools/city.js';
import { makeRng } from '../src/rng.js';
import { roadCapsOf } from '../tools/normalize-level.mjs';

const J = CONFIG.jsonMap;
const lvl12 = JSON.parse(fs.readFileSync('src/levels/level-12.json', 'utf8'));
const field = reliefOf({ ...lvl12.relief, baseY: 0 });

console.log('--- подгонка отметок на стыках ---');
let worst = { slope: 0 };
for (const seed of [20261105, 1, 7, 42, 99991, 555, 2024, 31337]) {
  const tr = trackCenterline(trackSpec({ ...TRACK_DEFAULTS }), { rng: makeRng(seed), bump: () => {} });
  trackProfile(tr, field, 0);
  const f = tr.fit;
  for (let k = 0; k < f.m; k++) {
    const s = Math.abs(f.v[(k + 1) % f.m] - f.v[k]) / f.len[k];
    if (s > worst.slope) worst = { slope: s, len: f.len[k], seed, k, rise: f.v[(k + 1) % f.m] - f.v[k] };
  }
  if (seed === 20261105) {
    const short = f.len.map((l, i) => [l, i]).filter(([l]) => l < 2).sort((x, y) => x[0] - y[0]);
    console.log('узлов', f.m, '| короче 2 м:', short.slice(0, 4).map(x => x[0].toFixed(3)).join(' ')
      || 'нет', '| liftMax', f.liftMax.toFixed(3), '| остаточный прогиб', f.dip.toExponential(2),
      '| spread', f.spread.toFixed(2), 'при бюджете', (TRACK_DEFAULTS.grade * tr.length / 2).toFixed(1));
  }
}
console.log('худший уклон до округления', JSON.stringify(worst), 'при grade', TRACK_DEFAULTS.grade);

console.log('\n--- эмиссия: стыки и уклоны в данных ---');
const level = (block, over = {}) => ({
  kind: 'json2',
  metadata: { levelName: 'probe', name: 'проба', hint: 'х', units: 'meters' },
  ground: { y: 0, size: 600 },
  relief: lvl12.relief,
  gameplay: { goal: 'exit', spawn: { x: 0, z: 0 }, exit: { x: 1, z: 1 }, enemies: { count: 1 } },
  city: { seed: 20261105, districts: [{ id: 'd0', block }], track: { ...TRACK_DEFAULTS, entries: 2, ...over } },
});
for (const [label, block] of [
  ['восток (нос вне улицы)', { minX: 150, maxX: 285, minZ: -140, maxZ: 140 }],
  ['запад (носы на улицах)', { minX: -150, maxX: -50, minZ: -130, maxZ: 10 }],
]) {
  const stats = {};
  const out = expandCity(structuredClone(level(block)), stats);
  const ring = out.roads.find(r => r.trackRole === 'ring');
  const caps = roadCapsOf(ring);
  let worstJoint = { step: 0 }, worstSlope = { slope: 0 };
  for (const [i, c] of caps.entries()) {
    const n = caps[(i + 1) % caps.length];
    const gap = Math.hypot(n.x - c.x, n.z - c.z);
    if (gap > 1e-6 && gap < J.deckJoint) {
      const step = Math.abs(n.top - c.top);
      if (step > worstJoint.step) worstJoint = { step, gap: +gap.toFixed(3), i };
    }
  }
  for (const [i, el] of ring.elements.entries()) {
    const len = el.plate ? el.plate.length : el.arc.radius * Math.abs((el.arc.to - el.arc.from) * Math.PI / 180);
    const slope = Math.abs(el.plate ? el.plate.rise : el.arc.y[1] - el.arc.y[0]) / len;
    if (slope > worstSlope.slope) worstSlope = { slope, len: +len.toFixed(3), i };
  }
  console.log(`${label}: стык max ${worstJoint.step.toFixed(5)} м (зазор ${worstJoint.gap} м, элемент ${worstJoint.i})`
    + ` | уклон max ${worstSlope.slope.toFixed(5)} на ${worstSlope.len} м`);
  for (const e of out.roads.filter(r => r.trackRole === 'entry')) {
    const c = roadCapsOf(e);
    const near = caps.map(k => ({ d: Math.hypot(k.x - c[0].x, k.z - c[0].z), top: k.top }))
      .sort((x, y) => x.d - y.d)[0];
    console.log(`  ${e.id}: уход ${c[0].x},${c[0].z} @ ${c[0].top.toFixed(3)} | ближайшее кольцо в ${near.d.toFixed(3)} м @ ${near.top.toFixed(3)} (ступень ${Math.abs(near.top - c[0].top).toFixed(3)})`);
  }
  console.log('  счётчики:', JSON.stringify(stats));
}
