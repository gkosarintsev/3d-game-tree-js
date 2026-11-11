/**
 * Экспорт JSON Schema (draft-07) из DSL схемы брифа:
 *
 *   node tools/export-schema.mjs [--check]
 *
 * Пишет производные файлы схем в `src/levels/`:
 * - `level-v3.schema.json` (v3, `kind: 'cityforge'`)
 * - `level-common.schema.json` (общие определения v3/v4, `$ref`-цели)
 * - `level-v4.schema.json` (v4, `kind: 'cityforge'`, `schemaVersion: 4`)
 *
 * Все файлы — производное от `tools/level-schema.mjs`: единственный источник правды
 * остаётся DSL, а JSON Schema — его вывод для тех, кто читает бриф до запуска пайплайна
 * (редактор, ИИ, ревьюер). Поэтому файл, написанный руками, был бы вторым домом для тех же
 * чисел и описаний и разошёлся бы при первой правке.
 *
 * Поля DSL переводятся так: `kind` → `type`, `req` → вхождение в `required`,
 * `min`/`max` → `minimum`/`maximum`, `enum` → `enum`, `minItems`/`maxItems` →
 * они же, `doc` → `description`, `default` → `default`, а объект получает
 * `additionalProperties: false` — то же самое делает `checkValue`.
 *
 * `color` — union: валидатор принимает и число `0x…`, и строку `'#rrggbb'`, и
 * схема обязана принимать то же.
 *
 * `level-common.schema.json` содержит общие определения (point3/area/network и др.),
 * на которые корневые схемы ссылаются через `$ref`, чтобы CityForge-элементы и вложенные
 * объекты не дублировались по секциям.
 *
 * `--check` ничего не пишет и уходит с кодом 2 при расхождении — так детерминизм
 * вывода проверяется в автотесте.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVEL_SPEC_V3, LEVEL_SPEC_V4, LEVEL_COMMON_V3 } from './level-schema.mjs';

const DRAFT = 'http://json-schema.org/draft-07/schema#';
const COLOR_PATTERN = '^#[0-9a-fA-F]{6}$';

/** @param {object} spec узел DSL @param {string} refBase куда ведут $ref @returns {object} фрагмент JSON Schema */
function toJson(spec, refBase = '') {
  const out = {};
  switch (spec.kind) {
    case 'number':
      out.type = 'number';
      if (spec.min !== undefined) out.minimum = spec.min;
      if (spec.max !== undefined) out.maximum = spec.max;
      break;
    case 'string':
      out.type = 'string';
      if (spec.enum) out.enum = [...spec.enum];
      if (spec.pattern) out.pattern = spec.pattern;
      break;
    case 'boolean':
      out.type = 'boolean';
      break;
    case 'color':
      out.oneOf = [{ type: 'number' }, { type: 'string', pattern: COLOR_PATTERN }];
      break;
    case 'array':
      out.type = 'array';
      if (spec.minItems !== undefined) out.minItems = spec.minItems;
      if (spec.maxItems !== undefined) out.maxItems = spec.maxItems;
      out.items = toJson(spec.items, refBase);
      break;
    case 'ref':
      out.$ref = `${refBase}${spec.name}`;
      break;
    case 'object': {
      out.type = 'object';
      const props = {};
      const required = [];
      for (const [key, sub] of Object.entries(spec.fields ?? {})) {
        props[key] = toJson(sub, refBase);
        if (sub.req) required.push(key);
      }
      out.properties = props;
      // пустой `required` draft-07 tolerates, но печатать его незачем: поле
      // «обязательных нет» читается как недосмотр
      if (required.length) out.required = required;
      // открытая карта (parameters/properties) не ограничивает ключи
      if (!spec.open) out.additionalProperties = false;
      break;
    }
    default:
      throw new Error(`export-schema: неизвестный kind '${spec.kind}'`);
  }
  if (spec.doc) out.description = spec.doc;
  if (spec.default !== undefined) out.default = spec.default;
  return out;
}

/**
 * Корневой документ: `$schema` обязана быть здесь (это и есть объявление
 * draft-07), `title` и `description` — чтобы редактор показал, какую версию
 * брифа он проверяет.
 */
export function renderSchema(spec, title, opts = {}) {
  if (opts.definitions) {
    const definitions = {};
    for (const [name, sub] of Object.entries(spec.definitions)) {
      definitions[name] = toJson(sub, '#/definitions/');
    }
    return { $schema: DRAFT, title, definitions };
  }
  const body = toJson(spec, opts.refBase ?? '');
  return {
    $schema: DRAFT,
    title,
    ...body,
  };
}

/** Побайтово одинаковый текст файла: \n, два пробела, хвостовой перевод строки. */
export function schemaText(spec, title, opts = {}) {
  return `${JSON.stringify(renderSchema(spec, title, opts), null, 2).replace(/\r\n/g, '\n')}\n`;
}

/** Текст файла из записи SCHEMA_FILES. */
export function schemaTextFor(entry) {
  return schemaText(entry.spec, entry.title, entry);
}

const ROOT = resolve(import.meta.dirname, '..');
/** Куда кладём вывод — рядом с брифами, чтобы `./level-v3.schema.json` из брифа резолвился. */
export const SCHEMA_FILES = [
  {
    spec: LEVEL_SPEC_V3,
    title: 'Level brief v3 (kind: cityforge)',
    out: resolve(ROOT, 'src/levels/level-v3.schema.json'),
    refBase: './level-common.schema.json#/definitions/',
  },
  {
    spec: LEVEL_COMMON_V3,
    title: 'Level brief v3 shared definitions',
    out: resolve(ROOT, 'src/levels/level-common.schema.json'),
    definitions: true,
  },
  {
    spec: LEVEL_SPEC_V4,
    title: 'Level brief v4 (kind: cityforge, schemaVersion: 4)',
    out: resolve(ROOT, 'src/levels/level-v4.schema.json'),
    refBase: './level-common.schema.json#/definitions/',
  },
];

function main(argv) {
  const check = argv.includes('--check');
  let code = 0;
  for (const entry of SCHEMA_FILES) {
    const { title, out } = entry;
    const text = schemaTextFor(entry);
    const current = existsSync(out) ? readFileSync(out, 'utf8').replace(/\r\n/g, '\n') : null;
    if (check) {
      if (current === null) {
        console.error(`${out}: файл не создан — запустите без --check`);
        code = 2;
        continue;
      }
      if (current !== text) {
        console.error(`${out.split(/[\\/]/).pop()}: расходится с тем, что даёт экспортёр`);
        code = 2;
        continue;
      }
      console.log(`${out.split(/[\\/]/).pop()}: совпадает с DSL, ${title}`);
      continue;
    }
    writeFileSync(out, text, 'utf8');
    const rendered = renderSchema(entry.spec, entry.title, entry);
    const fields = rendered.properties ? Object.keys(rendered.properties).length : 0;
    console.log(`${out.split(/[\\/]/).pop()}: записан (${text.length} символов, полей верхнего уровня — ${fields})`);
  }
  return code;
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
