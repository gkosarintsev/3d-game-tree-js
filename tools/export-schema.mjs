/**
 * Экспорт JSON Schema (draft-07) из DSL схемы брифа:
 *
 *   node tools/export-schema.mjs [--check]
 *
 * Пишет `src/levels/level.schema.json` (v1, `kind: 'json'`) и
 * `src/levels/level-v2.schema.json` (v2, `kind: 'json2'`). Оба файла —
 * производное от `tools/level-schema.mjs`: единственный источник правды остаётся
 * DSL, а JSON Schema — его вывод для тех, кто читает бриф ДО запуска пайплайна
 * (редактор, ИИ, ревьюер). Поэтому файл, написанный руками, был бы вторым
 * домом для тех же чисел и описаний и разошёлся бы при первой правке.
 *
 * Поля DSL переводятся так: `kind` → `type`, `req` → вхождение в `required`,
 * `min`/`max` → `minimum`/`maximum`, `enum` → `enum`, `minItems`/`maxItems` →
 * они же, `doc` → `description`, `default` → `default`, а объект получает
 * `additionalProperties: false` — то же самое делает `checkValue` («поле не
 * описано в схеме» есть у обоих версий).
 *
 * `color` — union: валидатор принимает и число `0x…`, и строку `'#rrggbb'`, и
 * схема обязана принимать то же, иначе редактор подсветит ошибкой законный бриф.
 *
 * Две схемы, а не одна с `allOf`: `additionalProperties: false` внутри ветки
 * draft-07 не видит `properties` outside, и объединённая схема отвергала бы
 * `relief` и `elements` у законного v2-брифа.
 *
 * `--check` ничего не пишет и уходит с кодом 2 при расхождении — так
 * детерминизм вывода проверяется в автотесте (сюжет «схемные файлы совпадают с
 * экспортёром»).
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVEL_SPEC, LEVEL_SPEC_V2 } from './level-schema.mjs';

const DRAFT = 'http://json-schema.org/draft-07/schema#';
const COLOR_PATTERN = '^#[0-9a-fA-F]{6}$';

/** @param {object} spec узел DSL @returns {object} фрагмент JSON Schema */
function toJson(spec) {
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
      out.items = toJson(spec.items);
      break;
    case 'object': {
      out.type = 'object';
      const props = {};
      const required = [];
      for (const [key, sub] of Object.entries(spec.fields ?? {})) {
        props[key] = toJson(sub);
        if (sub.req) required.push(key);
      }
      out.properties = props;
      // пустой `required` draft-07 tolerates, но печатать его незачем: поле
      // «обязательных нет» читается как недосмотр
      if (required.length) out.required = required;
      out.additionalProperties = false;
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
export function renderSchema(spec, title) {
  const body = toJson(spec);
  return {
    $schema: DRAFT,
    title,
    ...body,
  };
}

/** Побайтово одинаковый текст файла: \n, два пробела, хвостовой перевод строки. */
export function schemaText(spec, title) {
  return `${JSON.stringify(renderSchema(spec, title), null, 2).replace(/\r\n/g, '\n')}\n`;
}

const ROOT = resolve(import.meta.dirname, '..');
/** Куда кладём вывод — рядом с брифами, чтобы `./level.schema.json` из брифа резолвился. */
export const SCHEMA_FILES = [
  { spec: LEVEL_SPEC, title: 'Level brief v1 (kind: json)', out: resolve(ROOT, 'src/levels/level.schema.json') },
  { spec: LEVEL_SPEC_V2, title: 'Level brief v2 (kind: json2 | open)', out: resolve(ROOT, 'src/levels/level-v2.schema.json') },
];

function main(argv) {
  const check = argv.includes('--check');
  let code = 0;
  for (const { spec, title, out } of SCHEMA_FILES) {
    const text = schemaText(spec, title);
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
    const fields = Object.keys(renderSchema(spec, title).properties).length;
    console.log(`${out.split(/[\\/]/).pop()}: записан (${text.length} символов, полей верхнего уровня — ${fields})`);
  }
  return code;
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
