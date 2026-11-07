// Аудит: все пути данных, чьё имя похоже на координату, с классификацией формы.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';

const KEYS = /^(x|z|minX|maxX|minZ|maxZ|cx|cz|bx|bz|lo|hi|cross|u0|u1|v0|v1|y0|y1|height|hx|hz|radius)$/;
const out = new Map();
function walk(v, path) {
  if (Array.isArray(v)) { v.forEach((x) => walk(x, path + '[]')); return; }
  if (v && typeof v === 'object') {
    const numKeys = Object.entries(v).filter(([, val]) => typeof val === 'number').map(([k]) => k);
    for (const [k, val] of Object.entries(v)) {
      if (!KEYS.test(k)) { if (typeof val === 'object') walk(val, `${path}.${k}`); continue; }
      const shape = typeof val === 'number' ? `num{siblings:${numKeys.sort().join(',')}}` : typeof val;
      const p = `${path}.${k}`;
      const rec = out.get(p) ?? { n: 0, shapes: new Set() };
      rec.n++; rec.shapes.add(shape); out.set(p, rec);
      if (typeof val === 'object') walk(val, p);
    }
    return;
  }
}
for (const f of ['../src/levels/level-13.js']) {}
const files = ['../src/levels/level-09.json', '../src/levels/level-10.json', '../src/levels/level-11.json', '../src/levels/level-12.json', '../src/levels/level-13.json', '../probe/open-2km.json'];
for (const f of files) {
  const raw = JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
  const lvl = normalizeLevel(expandCity(raw));
  out.clear();
  walk(lvl.map, '');
  console.log(`=== ${f} (kind ${lvl.map.kind}) ===`);
  for (const [p, r] of [...out.entries()].sort()) console.log(`${String(r.n).padStart(6)}  ${p}  ${[...r.shapes].slice(0, 2).join(' | ')}`);
}
