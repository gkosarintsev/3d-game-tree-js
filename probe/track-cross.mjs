import { makeRng } from '../src/rng.js';
import { TRACK_DEFAULTS, trackSpec, trackCenterline, trackAxisAt } from '../tools/city.js';

const tr = trackCenterline(trackSpec({ ...TRACK_DEFAULTS, turns: 12, curvatureJitter: 0.49 }), { rng: makeRng(20261105), bump: () => {} });
const pts = [];
for (let i = 0; i < 600; i++) {
  const at = trackAxisAt(tr, (i / 600) * tr.length);
  pts.push({ i, s: at.s, x: at.x, z: at.z, el: at.el ? `${at.el.kind}${at.el.i}` : '-' });
}
for (const k of [298, 299, 300, 301, 302, 303, 304, 305, 306, 307]) {
  const p = pts[k], q = pts[k + 1];
  console.log(`${p.i} ${p.el} (${p.x.toFixed(2)}, ${p.z.toFixed(2)}) → ${q.i} ${q.el} (${q.x.toFixed(2)}, ${q.z.toFixed(2)})  d=${Math.hypot(q.x - p.x, q.z - p.z).toFixed(3)}`);
}
console.log('элементы:', tr.elements.map(e => `${e.kind}${e.i}:${e.len.toFixed(1)}`).join(' '));
console.log('R:', tr.R.map(v => v.toFixed(1)).join(' '), '\nturn°:', tr.turn.map(v => (v * 180 / Math.PI).toFixed(1)).join(' '));
