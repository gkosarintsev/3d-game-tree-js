import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const g = await generateCatalog(raw, 'probe/open-2km.json');
const m = g.worldMap;
const b = m.buildings[0];
console.log('keys', Object.keys(b));
console.log('isEnterable', b.isEnterable, 'doors', b.doors?.length, 'rooms', b.rooms?.length);
const ent = m.buildings.find(x => x.isEnterable);
console.log('\nenterable', ent?.id);
console.log(JSON.stringify(ent, null, 1).slice(0, 2500));
