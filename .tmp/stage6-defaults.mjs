/**
 * Какие числа брифа равны `default` схемы (правило AGENTS: их в бриф не пишут).
 * Запуск: node .tmp/stage6-defaults.mjs probe/open-600.json
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const file = process.argv[2] ?? 'probe/open-600.json';
const raw = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
const schema = JSON.parse(readFileSync(resolve(ROOT, 'src/levels/level-v2.schema.json'), 'utf8'));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const hits = [];

// `city` разворачивается генератором до валидатора — схема её геометрию не видит
function walk(node, spec, path) {
  if (!spec || node == null) return;
  if (Object.prototype.hasOwnProperty.call(spec, 'default') && same(spec.default, node)) {
    hits.push(`${path} = ${JSON.stringify(node)}`);
  }
  if (Array.isArray(node)) {
    const items = spec.items;
    node.forEach((v, i) => walk(v, items, `${path}[${i}]`));
    return;
  }
  if (typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      const sub = spec.properties?.[k] ?? spec.additionalProperties;
      walk(v, sub, path ? `${path}.${k}` : k);
    }
  }
}
walk(raw, schema, '');
console.log(`${file}: значений, равных default — ${hits.length}`);
for (const h of hits) console.log('  ' + h);