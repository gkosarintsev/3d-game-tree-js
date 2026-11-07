// Разведка данных нормализованной фикстуры для скелета (этап 2). Временный файл.
import { readFileSync } from 'node:fs';
import { generateCatalog } from '../tools/build-level.mjs';

const raw = JSON.parse(readFileSync('probe/open-2km.json', 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const g = await generateCatalog(raw, 'probe/open-2km.json');
const m = g.worldMap;

console.log('warnings', g.warnings.length, g.warnings.slice(0, 5));
console.log('size', m.ground.size, 'relief', !!m.relief);
for (const k of Object.keys(m)) if (Array.isArray(m[k])) console.log(' ', k, m[k].length);

const kinds = {};
for (const r of m.roads) kinds[r.type] = (kinds[r.type] ?? 0) + 1;
console.log('road types', kinds);

const sample = m.roads.find(r => (r.decks ?? []).some(d => d.arc));
console.log('\n--- road с дугой:', sample?.id, sample?.type);
console.log(JSON.stringify(sample?.decks?.[0], null, 1).slice(0, 900));
console.log('--- road пластин:', JSON.stringify(m.roads.find(r => (r.decks ?? []).length > 2)?.decks?.[0], null, 1).slice(0, 900));
console.log('\n--- fill:', JSON.stringify(m.roads.flatMap(r => r.fill ?? [])[0], null, 1)?.slice(0, 500));
console.log('\n--- apron:', JSON.stringify(m.roads.flatMap(r => r.aprons ?? [])[0], null, 1)?.slice(0, 500));

const ch = m.channels?.[0];
console.log('\n--- channel keys', ch && Object.keys(ch));
console.log('segment', JSON.stringify(ch?.segments?.[0], null, 1)?.slice(0, 600));
console.log('descent', JSON.stringify(ch?.descents?.[0], null, 1)?.slice(0, 600));
console.log('wall', JSON.stringify(ch?.walls?.[0], null, 1)?.slice(0, 400));

const b = m.buildings?.[0];
console.log('\n--- building keys', b && Object.keys(b));
console.log('rooms[0] keys', b?.rooms && Object.keys(b.rooms[0]));
console.log('floor', JSON.stringify(b?.rooms?.[0]?.floors?.[0], null, 1)?.slice(0, 600));
console.log('doors', JSON.stringify(b?.doors ?? b?.rooms?.[0]?.doors ?? null, null, 1)?.slice(0, 800));
console.log('\n--- props[0]', JSON.stringify(m.props?.[0], null, 1)?.slice(0, 300));
console.log('--- lights[0]', JSON.stringify(m.lights?.[0], null, 1)?.slice(0, 300));
console.log('--- spawn', JSON.stringify(m.spawn), 'bounds', JSON.stringify(m.bounds));
console.log('--- units', m.units, 'kind', m.kind);
