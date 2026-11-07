// Мера (временный файл): из чего складывается цена скелета S2 — префиксы ключей узлов.
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { expandCity } from '../tools/city.js';
import { Proto, build } from './skel-proto-lib.mjs';

const kind = (k) => {
  const p = String(k).split(':');
  if (p[0] === 'd') return 'deck/street chain';
  if (p[0] === 'r' && /^r:.+_r\d+:/.test(k)) return 'room grid';
  if (p[0] === 'r') return 'roof lattice';
  if (p[0] === 's') return 'stair steps';
  if (p[0] === 'p') return 'landing / roof access';
  if (p[0] === 'e') return 'door';
  if (p[0] === 'f') return 'channel bank/descent';
  if (p[0] === 'w') return 'ground lattice';
  return p[0];
};
for (const [label, file, plain, opts] of [
  ['level-12 S2', 'src/levels/level-12.json', true, { rooms: false }],
  ['level-12 S3', 'src/levels/level-12.json', true, { rooms: true }],
  ['probe S2', 'probe/open-2km.json', false, { rooms: false }],
]) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  let map;
  if (plain) map = normalizeLevel(expandCity(structuredClone(raw))).map;
  else { raw.kind = 'open'; raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 }; map = (await generateCatalog(structuredClone(raw), file)).worldMap; }
  const nav = build(new Proto(map), opts);
  const keyOf = new Map();
  for (const [k, i] of nav.byKey) if (!keyOf.has(i)) keyOf.set(i, k);
  const hist = new Map();
  for (let i = 0; i < nav.pos.length; i++) {
    const kk = kind(keyOf.get(i) ?? '?');
    hist.set(kk, (hist.get(kk) ?? 0) + 1);
  }
  console.log(label, JSON.stringify({ nodes: nav.pos.length, ...Object.fromEntries([...hist].sort((a, b) => b[1] - a[1])) }));
  console.log('   пример ключа кровли:', [...keyOf.values()].find(v => /^r:/.test(String(v))));
}
