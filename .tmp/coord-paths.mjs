import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
const KEYS = /^(x|z|minX|maxX|minZ|maxZ|cx|cz|bx|bz|lo|hi|cross|u0|u1|v0|v1|hx|hz|radius|p0|p1|a0|a1)$/;
const out = new Map();
function walk(v, path, shape) {
  if (Array.isArray(v)) { v.forEach((x) => walk(x, path + '[]', shape)); return; }
  if (v && typeof v === 'object') {
    const numKeys = Object.entries(v).filter(([, val]) => typeof val === 'number').map(([k]) => k).sort().join(',');
    for (const [k, val] of Object.entries(v)) {
      if (typeof val === 'number' && KEYS.test(k)) {
        const p = `${path}.${k}`;
        const rec = out.get(p) ?? new Set();
        rec.add(numKeys); out.set(p, rec);
      } else if (val && typeof val === 'object') walk(val, `${path}.${k}`, shape);
    }
  }
}
for (const f of ['../src/levels/level-09.json', '../src/levels/level-11.json', '../src/levels/level-12.json', '../src/levels/level-13.json', '../probe/open-2km.json']) {
  const raw = JSON.parse(readFileSync(new URL(f, import.meta.url), 'utf8'));
  const lvl = normalizeLevel(expandCity(raw));
  walk(lvl.map, '', null);
}
for (const [p, shapes] of [...out.entries()].sort()) console.log(`${p}\n    ${[...shapes].join('\n    ')}`);
