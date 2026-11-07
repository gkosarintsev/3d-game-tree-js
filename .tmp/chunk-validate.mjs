// Разведка: проходит ли чанк геометрическую валидацию схемы v2 как данные карты.
import { readFileSync } from 'node:fs';
import { validateLevel, LEVEL_SPEC_V2 } from '../tools/level-schema.mjs';

for (const f of ['chunk-1-1.json', 'chunk-0-0.json']) {
  const chunk = JSON.parse(readFileSync(new URL(`./open-catalog/${f}`, import.meta.url), 'utf8'));
  const { errors, warnings } = validateLevel(chunk, LEVEL_SPEC_V2);
  console.log(`${f}: kind=${chunk.kind} ошибок ${errors.length}, предупреждений ${warnings.length}`);
  for (const e of errors.slice(0, 12)) console.log(`  ✖ ${e}`);
}
const index = readFileSync(new URL('./open-catalog/index.js', import.meta.url), 'utf8');
console.log('index.js:', index.length, 'символов; клеток в списке:', (index.match(/"file":/g) ?? []).length);
