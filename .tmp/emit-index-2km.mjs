/**
 * Мера § 10.9 на фикстуре 1,4 км² (скелет ~546 КБ при общем принтере против
 * ~194 КБ компактом): собирает каталог открытой главы в памяти и пишет рядом
 * два `index.js` — каким его печатает `stringifyStable`, и тем же объектом,
 * напечатанным `JSON.stringify`, чтобы браузер импортировал их как есть.
 *
 * Запуск: node .tmp/emit-index-2km.mjs
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateCatalog } from '../tools/build-level.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(await readFile(resolve(ROOT, 'probe/open-2km.json'), 'utf8'));
raw.kind = 'open';
raw.stream = { chunk: 200, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
const gen = generateCatalog(raw, 'open-2km.json');
const idx = gen.files.find((f) => f.path === 'index.js');
if (!idx) throw new Error('generateCatalog не вернул index.js');
const dir = resolve(ROOT, '.tmp/index-2km');
await mkdir(dir, { recursive: true });
const compact = `export const OPEN_2KM = ${JSON.stringify(gen.indexMap)};\n`;
await writeFile(resolve(dir, 'index.js'), idx.code);
await writeFile(resolve(dir, 'index-compact.js'), compact);
const sk = gen.indexMap.skeleton;
console.log('pretty Б:', idx.code.length, ' compact Б:', compact.length, ' разница:', idx.code.length - compact.length);
console.log('скелет:', sk.nodes.length, 'узлов /', sk.edges.length, 'рёбер; клеток', gen.indexMap.cells.length,
  '; предупреждений', gen.warnings.length);
