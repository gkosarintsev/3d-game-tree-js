/**
 * CLI пайплайна «уровень из JSON» (docs/json-pipeline-plan.md):
 *
 *   node tools/build-level.mjs src/levels/level-09.json [--check] [--out path]
 *
 * Читает сырой бриф, валлидирует его (`tools/level-schema.mjs`), нормализует
 * (`tools/normalize-level.mjs`) и пишет JS-модуль главы рядом с JSON. Браузер
 * JSON не грузит: `createMap` обязан оставаться синхронным (AGENTS.md), поэтому
 * результат парсера — обычный файл-определение главы, как у всех остальных.
 *
 * `--check` ничего не пишет: сравнивает с существующим модулем и уходит с кодом 2
 * при расхождении — так детерминизм парсера проверяется в автотесте.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLevel } from './level-schema.mjs';
import { normalizeLevel } from './normalize-level.mjs';

/**
 * @param {object} raw сырой уровень (уже прочитанный JSON)
 * @param {string} sourceName имя исходника для шапки (src/levels/level-09.json)
 * @returns {{name:string, code:string, warnings:string[]}} текст модуля главы
 */
export function generateModule(raw, sourceName) {
  const { errors, warnings: geoWarnings } = validateLevel(raw);
  if (errors.length) throw new ValidationError(errors, geoWarnings);
  let level;
  try {
    level = normalizeLevel(raw);
  } catch (e) {
    // полигон, отвергнутый уже после валидации: оформляем тем же
    // ValidationError, чтобы CLI печатал список, а не стек
    throw new ValidationError([String(e?.message ?? e)], geoWarnings);
  }
  const warnings = [...geoWarnings, ...level.warnings];
  const constName = exportName(sourceName);
  const body = JSON.stringify(
    { name: level.name, hint: level.hint, map: level.map, sky: level.sky, gameplay: level.gameplay },
    null, 2,
  );
  const notice = warnings.length
    ? `\n * Предупреждения парсера:\n${warnings.map(w => ` *   — ${w}`).join('\n')}\n *`
    : '';
  const code = `/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: ${sourceName}. После его изменения запуск
 * \`node tools/build-level.mjs ${sourceName}\` перезаписывает этот файл
 * побайтово одинаково (ГПСЧ в парсере нет, ключи объектов отсортированы).
 *
 * Тип карты — \`kind: 'json'\`: числа и топологию готовит Node-парсер
 * (замкнутые полигоны, союз прямоугольников footprint, абсолютные высоты
 * этажей, проступи лестниц, пластины настилов, автогенерированные опоры и
 * фонари, проёмы дверей), браузер строит из них только солиды, опоры,
 * навигацию и меш.${notice}
 */
export const ${constName} = ${body};
`;
  return { name: constName, code: code.replace(/\r\n/g, '\n'), warnings };
}

/** Имя экспорта из имени файла: level-09.json → LEVEL_09, city-3 → CITY_3. */
function exportName(sourceName) {
  const stem = basename(sourceName, extname(sourceName));
  return stem.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'LEVEL';
}

class ValidationError extends Error {
  constructor(errors, warnings) {
    super(errors.join('\n'));
    this.name = 'ValidationError';
    this.errors = errors;
    this.warnings = warnings;
  }
}

/** Путь модуля главы по пути JSON: src/levels/level-09.json → .../level-09.js */
const defaultOut = jsonPath => resolve(dirname(jsonPath), `${basename(jsonPath, extname(jsonPath))}.js`);

function main(argv) {
  const jsonArg = argv.find(a => !a.startsWith('--'));
  if (!jsonArg) {
    console.error('использование: node tools/build-level.mjs <level.json> [--check] [--out <file.js>]');
    return 1;
  }
  const jsonPath = resolve(jsonArg);
  const outPath = argv.includes('--out') ? resolve(argv[argv.indexOf('--out') + 1]) : defaultOut(jsonPath);
  const check = argv.includes('--check');

  let raw;
  try {
    raw = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error(`${basename(jsonPath)}: не читается как JSON — ${e.message}`);
    return 1;
  }

  let generated;
  try {
    generated = generateModule(raw, jsonArg);
  } catch (e) {
    if (!(e instanceof ValidationError)) throw e;
    console.error(`${basename(jsonPath)}: ошибок — ${e.errors.length}`);
    for (const msg of e.errors) console.error(`  ✖ ${msg}`);
    for (const msg of e.warnings) console.error(`  ⚠ ${msg}`);
    return 1;
  }

  for (const msg of generated.warnings) console.log(`  ⚠ ${msg}`);

  const current = existsSync(outPath) ? readFileSync(outPath, 'utf8').replace(/\r\n/g, '\n') : null;
  if (check) {
    if (current === null) {
      console.error(`${outPath}: модуль не сгенерирован — запустите без --check`);
      return 2;
    }
    if (current !== generated.code) {
      console.error(`${basename(outPath)}: расходится с тем, что даёт парсер (${generated.warnings.length} предупреждений)`);
      return 2;
    }
    console.log(`${basename(outPath)}: совпадает с парсером, ${generated.name}`);
    return 0;
  }

  writeFileSync(outPath, generated.code, 'utf8');
  console.log(`${basename(outPath)}: ${generated.name} записан (${generated.code.length} символов, предупреждений — ${generated.warnings.length})`);
  return 0;
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));

export { ValidationError, defaultOut };
