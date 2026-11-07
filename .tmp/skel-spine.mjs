// Мера (временный файл): S4 — магистрали + марши + кровли БЕЗ решёток полов
// (отключённый `_refineFloor`), то есть форма, которую парсер и собирается
// испускать: цена ∝ длина содержимого и высота маршей.
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
import { Proto, build } from './skel-proto-lib.mjs';

const kind = (k) => {
  const p = String(k).split(':');
  return ({ d: 'deck/street', r: 'room/roof grid', s: 'stair steps', p: 'landing/access', e: 'door', f: 'bank', w: 'ground' })[p[0]] || p[0];
};
function comps(nav) {
  const c = new Int32Array(nav.pos.length).fill(-1);
  const sizes = [];
  for (let s = 0; s < nav.pos.length; s++) {
    if (c[s] >= 0) continue;
    const q = [s]; c[s] = sizes.length;
    for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (c[nb] < 0) { c[nb] = sizes.length; q.push(nb); }
    sizes.push(q.length);
  }
  return { components: sizes.length, sizes: sizes.sort((a, b) => b - a).slice(0, 6) };
}
for (const [label, file, plain] of [
  ['level-12', 'src/levels/level-12.json', true],
  ['level-13', 'src/levels/level-13.json', true],
  ['probe 1400', 'probe/open-2km.json', false],
]) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  let map;
  if (plain) map = normalizeLevel(expandCity(structuredClone(raw))).map;
  else { raw.kind = 'open'; raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 }; map = (await generateCatalog(structuredClone(raw), file)).worldMap; }
  const f = new Proto(map);
  f._refineFloor = () => {};
  const t = Date.now();
  const nav = build(f, { rooms: false, roofs: true, stairs: true });
  const ms = Date.now() - t;
  const keyOf = new Map();
  for (const [k, i] of nav.byKey) if (!keyOf.has(i)) keyOf.set(i, k);
  const hist = new Map();
  for (let i = 0; i < nav.pos.length; i++) {
    const kk = kind(keyOf.get(i) ?? '?');
    hist.set(kk, (hist.get(kk) ?? 0) + 1);
  }
  const plate = map.ground.size;
  console.log(label, JSON.stringify({
    ms, nodes: nav.pos.length, perKm2: Math.round(nav.pos.length / (plate ** 2 / 1e6)),
    ...comps(nav), kinds: Object.fromEntries([...hist].sort((a, b) => b[1] - a[1])),
  }));
}
