/**
 * CLI пайплайна «уровень из JSON»:
 *
 *   node tools/build-level.mjs src/levels/level-16.json [--check] [--out path]
 *
 * Читает сырой бриф, разворачивает из него секцию `city` в улицы и дома
 * (`tools/city.js`), валлидирует результат (`tools/level-schema.mjs`),
 * нормализует (`tools/normalize-level.mjs`) и пишет JS-модуль главы рядом с
 * JSON. Браузер JSON не грузит: `createMap` обязан оставаться синхронным
 * (AGENTS.md), поэтому результат парсера — обычный файл-определение главы, как
 * у всех остальных.
 *
 * `kind: 'open'` (этап 1 плана docs/open-world-plan.md) вместо модуля пишет
 * **каталог** `src/levels/level-NN/`: `index.js` — определение главы со списком
 * чанков, `chunk-<i>-<j>.json` — подрезанные данные карты. Модуль на 27 МБ
 * (§ 2.6) браузер прочитал бы целиком, а `fetch` одного чанка — ровно то, ради
 * чего мир режется.
 *
 * `--check` ничего не пишет: сравнивает с существующим модулем и уходит с кодом 2
 * при расхождении — так детерминизм парсера проверяется в автотесте. Для
 * каталога проверяется каждый файл, иначе чанк разошёлся бы с `index.js` молча.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateLevel, LEVEL_SPEC_V2, LEVEL_SPEC_V3, LEVEL_SPEC_V4 } from './level-schema.mjs';
import { normalizeLevel } from './normalize-level.mjs';
import { expandCity } from './city.js';
import { splitLevel, stringifyStable } from './chunk-level.mjs';
import { skeletonOf } from './skeleton.mjs';
import { encodeChunk, encodeSkeleton, SKELETON_FILE } from '../src/level-bin.js';
import { compileCityforge } from './cityforge-compile.mjs';
import { runCitygen } from './citygen/index.mjs';

/** Корень репозитория: от него печатается браузерный путь каталога (`catalog`). */
const ROOT = resolve(import.meta.dirname, '..');

/**
 * Путь брифа до чисел карты — один для каталога: разворот города,
 * схема по версии брифа, валидация, нормализация. Два таких пути разошлись бы
 * при первой же правке, и каталог начал бы собираться не по тем правилам, что
 * проверяет сюжетная валидация.
 *
 * Поддерживаемые исходные/компилируемые форматы: `cityforge` (v3/v4 → каталог)
 * и `kind: 'open'` (каталог). Устаревшие `json`/`json2` источники модуля не
 * поддерживаются.
 *
 * @param {object} raw сырой уровень (может содержать `city`)
 * @param {string} sourceName имя исходника для шапок
 */
function prepare(raw, sourceName) {
  let expanded;
  try {
    // разворот ДО валидации: геометрический проход схемы тогда бесплатно
    // проверяет всё, что нарисовал генератор, а сам валидатор остаётся глух к `city`
    expanded = expandCity(raw);
  } catch (e) {
    throw new ValidationError([String(e?.message ?? e)], []);
  }
  const kind = expanded.kind ?? 'json';
  if (kind === 'json' || kind === 'json2') {
    throw new ValidationError([
      `kind '${kind}' (v1/v2 модуль) не поддерживается: используйте cityforge v3/v4 или kind 'open' (каталог).`,
    ], []);
  }
  // v4 — CityForge с манифестом генератора (`schemaVersion: 4`), валидируется
  // отдельной схемой; скомпилированный/исходный открытый мир — схемой v2/open.
  const spec = expanded.kind === 'cityforge' && expanded.schemaVersion === 4 ? LEVEL_SPEC_V4
    : expanded.kind === 'cityforge' ? LEVEL_SPEC_V3
    : LEVEL_SPEC_V2;
  const { errors, warnings: geoWarnings } = validateLevel(expanded, spec);
  if (errors.length) throw new ValidationError(errors, geoWarnings);
  let level;
  try {
    level = normalizeLevel(expanded);
  } catch (e) {
    // полигон, отвергнутый уже после валидации: оформляем тем же
    // ValidationError, чтобы CLI печатал список, а не стек
    throw new ValidationError([String(e?.message ?? e)], geoWarnings);
  }
  return { expanded, level, warnings: [...geoWarnings, ...level.warnings], constName: exportName(sourceName) };
}

/**
 * Устаревший модуль главы (`json`/`json2`) не поддерживается: v3/v4 используют
 * CityForge → каталог. Оставлено как явная ошибка вместо тихой генерации.
 */
export function generateModule(raw, sourceName) {
  const kind = raw?.kind ?? 'json';
  throw new ValidationError([
    `generateModule: kind '${kind}' не поддерживается. Поддерживаются cityforge v3/v4 и kind 'open' (каталог).`,
  ], []);
}

/**
 * Каталог открытой главы — этап 1 плана docs/open-world-plan.md.
 *
 * Файлов два рода. `index.js` — определение главы: мировая плита, габарит,
 * спавн, рельеф и секции выводимой картинки, список клеток с их прямоугольниками,
 * `stream` с выведенным маргином и скелет (этап 2); его браузер грузит как
 * обычную главу. `chunk-<i>-<j>.json` — данные карты одной клетки в **мировых**
 * осях; их `fetch`ит `WorldMap` по мере пути игрока, и размер одного файла —
 * ровно то, ради чего мир режется.
 *
 * Мировые оси чанка — правка этапа 3 (§ 5.8 плана): местный кадр клетки стоил
 * второму переводчику координат в движке и 17-значащим двойным в байтах, а
 * клеточную цену решётки навигации держит обход прямоугольников загруженных
 * клеток, а не размер плиты.
 *
 * Разрезка идёт по **нормализованной** карте (`tools/chunk-level.mjs`), поэтому
 * отметки на швах считает тот же нормализатор, что и для модуля главы, а не
 * вторая реализация геодезии.
 *
 * @param {object} raw сырой бриф с `kind: 'open'` и секцией `stream`
 * @param {string} sourceName имя исходника (src/levels/level-16.json)
 * @param {{reverse?:boolean, outDir?:string}} opts обход клеток задом наперёд —
 *   knob сюиты; `outDir` — каталог вывода CLI (`--out`), из него же печатается
 *   `catalog`, иначе скопированный каталог звал бы файлы по прежнему пути
 * @returns {{name:string, files:Array, warnings:string[], meta:object, chunks:Array}}
 */
export function generateCatalog(raw, sourceName, opts = {}) {
  const { expanded, level, warnings, constName } = prepare(raw, sourceName);
  let split;
  try {
    split = splitLevel(level.map, expanded.stream, opts);
  } catch (e) {
    // клетка, не делившая плиту, или объект без плана: оформляем тем же
    // ValidationError, чтобы CLI печатал список, а не стек
    throw new ValidationError([String(e?.message ?? e)], warnings);
  }
  // Скелет (§ 4.2) считается по ВСЕМУ миру, а не по чанкам: его смысл —
  // связность за пределами загруженного окна, и из местных копий клеток её не
  // собрать (шов дал бы две несвязанные ветви вместо одного ребра). Здесь, а не
  // внутри разрезки, он нужен затем, чтобы `splitLevel` оставалась пригодной для
  // карты без нормализованных зданий и наклонных настилов — на ручной геометрии
  // мерят шов (п. 4), а скелет ест полные данные нормализатора.
  const sk = skeletonOf(level.map);
  const stem = basename(sourceName, extname(sourceName));
  // Каталог вывода относительно корня репозитория: сайт отдаётся от него
  // (`python -m http.server` в корне, `file://` не поддерживается), поэтому
  // браузерный путь к файлам клеток — это он же с ведущим слэшем.
  const dir = relative(ROOT, resolve(opts.outDir ?? resolve(dirname(sourceName), stem))).replace(/\\/g, '/');
  const meta = { ...split.meta, skeleton: sk.meta };
  const notice = warnings.length
    ? `\n * Предупреждения парсера:\n${warnings.map(w => ` *   — ${w}`).join('\n')}\n *`
    : '';

  // Данные каталога в бинарном виде: чанки и скелет — файлы данных, не JSON.
  // `index.js` остаётся тонким ES-модулем (реестр импортирует его статически),
  // но тяжёлый скелет уезжает в `skeleton.l14b` (плоские typed arrays) и
  // догружается через top-level await. Так «все файлы данных» каталога — бинарные,
  // а точка входа модуля сохраняется.
  const skeletonBytes = encodeSkeleton({ nodes: sk.nodes, edges: sk.edges });
  const chunkFiles = split.chunks.map(c => ({ path: c.file, bytes: encodeChunk(c.map), map: c.map }));
  const skeletonData = { nodes: sk.nodes, edges: sk.edges };
  // В map-литерале index.js скелета нет (он придёт из .l14b), но в объекте,
  // который видят инструменты/тесты в памяти, он есть целиком.
  const indexMapLite = { ...split.indexMap, catalog: `/${dir}` };
  const indexMapFull = { ...indexMapLite, skeleton: skeletonData };
  const levelLite = { name: level.name, hint: level.hint, map: indexMapLite, sky: level.sky, gameplay: level.gameplay };
  const bodyLite = stringifyStable(levelLite).replace(/\n$/, '');
  const indexCode = `/**
 * СГЕНЕРИРОВАННО — руками не править.
 *
 * Источник правки: ${sourceName}. После его изменения запуск
 * \`node tools/build-level.mjs ${sourceName}\` перезаписывает этот файл и все
 * бинарные файлы каталога побайтово одинаково (ГПСЧ в разрезке нет, ключи и
 * объекты отсортированы).
 *
 * Открытая глава: геометрии здесь нет. Мир лежит по клеткам \`cells[]\`, у каждой
 * — прямоугольник в мировых осях и свой файл \`chunk-<i>-<j>.l14b\` с данными
 * \`JsonMap\` в бинарном кодеке (src/level-bin.js) в тех же мировых осях. Скелет
 * — глобальная сеть улиц/русов/дверей — лежит в \`${SKELETON_FILE}\` плоскими
 * typed arrays и догружается top-level await; в браузере и в Node один и тот же
 * модуль, поэтому загрузка идёт через \`fetch\` относительного URL с откатом на
 * \`node:fs\` под Node.
 *
 * Файлы клеток берёт \`WorldMap.chunkUrl\` из \`catalog\` — браузерного пути
 * каталога от корня сайта.${notice}
 */
import { decodeSkeleton } from '../../level-bin.js';

async function loadSkel() {
  const url = new URL('./${SKELETON_FILE}', import.meta.url);
  if (typeof process !== 'undefined' && process.versions?.node) {
    const { readFileSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    return readFileSync(fileURLToPath(url));
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + ': ' + r.status);
  return new Uint8Array(await r.arrayBuffer());
}

export const ${constName} = ${bodyLite};
${constName}.map.skeleton = decodeSkeleton(await loadSkel());
`;
  const files = [
    { path: 'index.js', code: indexCode.replace(/\r\n/g, '\n') },
    { path: SKELETON_FILE, bytes: skeletonBytes },
    ...chunkFiles.map(c => ({ path: c.path, bytes: c.bytes })),
  ];
  return {
    name: constName,
    kind: 'catalog',
    dir,
    files,
    warnings,
    meta,
    indexMap: indexMapFull,
    chunks: split.chunks.map((c, i) => ({ ...c, map: chunkFiles[i].map, bytes: chunkFiles[i].bytes })),
    worldMap: level.map,
  };
}

/**
 * CityForge v3 — формат-источник (docs/world-format.md). Валидируется по
 * V3-схеме, затем компилируется в движковый бриф и собирается обычным пайплайном
 * (normalize → catalog/module), поэтому глава становится играбельной. Неподдержанное
 * содержимое формата — явная ошибка компилятора.
 */
function generateCityforge(raw, sourceName, opts = {}) {
  const isV4 = raw?.schemaVersion === 4;
  const { errors, warnings: v3w } = validateLevel(raw, isV4 ? LEVEL_SPEC_V4 : LEVEL_SPEC_V3);
  if (errors.length) throw new ValidationError(errors, v3w);
  let source = raw;
  let report = null;
  if (isV4) {
    try {
      const cg = runCitygen(raw);
      source = cg.engine ?? raw;
      report = cg.reportJson ?? null;
      if ((cg.report?.summary?.errors ?? 0) > 0) {
        const errs = (cg.report?.diagnostics ?? [])
          .filter(d => d.severity === 'error')
          .map(d => `[${d.stage ?? 'citygen'}] ${d.code}: ${d.message}`);
        throw new ValidationError(errs.length ? errs : ['citygen: generation failed with errors'], v3w);
      }
    } catch (e) {
      if (e instanceof ValidationError) throw e;
      throw new ValidationError([String(e?.message ?? e)], v3w);
    }
  }
  let compiled;
  try {
    compiled = compileCityforge(source);
  } catch (e) {
    throw new ValidationError(e.errors ?? [String(e?.message ?? e)], v3w);
  }
  // Компилируем в открытый движковый мир → каталог с чанками, как у level-02/14.
  // For generated v4 content, placement conflicts (water/road) can slip through
  // coarse stage checks; deterministically drop offending buildings and retry.
  let engine = compiled.engine;
  let out = null;
  let dropped = [];
  let droppedProps = [];
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      out = generateCatalog(engine, sourceName, opts);
    } catch (e) {
      if (!(e instanceof ValidationError)) throw e;
      const ids = new Set();
      for (const msg of e.errors ?? []) {
        const m = String(msg).match(/buildings\[\d+\]\s+\(([^)]+)\):[\s\S]*?(стоит в воде|стоит в улице|легла на план наземной дороги|легла в русло)/);
        if (m) ids.add(m[1]);
      }
      if (!ids.size || !Array.isArray(engine?.buildings) || engine.buildings.length === 0) throw e;
      const before = engine.buildings.length;
      engine = { ...engine, buildings: engine.buildings.filter(b => !ids.has(b?.id)) };
      const removed = before - engine.buildings.length;
      if (removed <= 0) throw e;
      dropped.push(...ids);
      out = null;
      continue;
    }
    // Repair generated landscapeObjects warned by normalize (support mismatch, hidden, etc.)
    // so committed pilot stays parser-warning-free. Prefer snapping y for "position.y ... не совпадает с опорой";
    // drop only when not safely fixable.
    const snapY = new Map(); // id -> snapped y
    const badProps = new Set();
    for (const msg of out.warnings ?? []) {
      const s = String(msg);
      let m = s.match(/^landscapeObjects\s+\(([^)]+)\):\s*position\.y\s+[-\d.]+\s+не совпадает с опорой\s+([-\d.]+)/);
      if (m) { snapY.set(m[1], Number(m[2])); continue; }
      m = s.match(/^landscapeObjects\s+\(([^)]+)\):/);
      if (m) badProps.add(m[1]);
    }
    if ((!snapY.size && !badProps.size) || !Array.isArray(engine?.landscapeObjects) || engine.landscapeObjects.length === 0) break;
    let changed = false;
    let nextObjects = engine.landscapeObjects;
    if (snapY.size) {
      nextObjects = nextObjects.map(o => {
        if (!o || !snapY.has(o.id)) return o;
        const y = snapY.get(o.id);
        if (!Number.isFinite(y)) { badProps.add(o.id); return o; }
        const pos = { ...(o.position ?? {}), y: +y.toFixed(3) };
        changed = true;
        return { ...o, position: pos };
      });
    }
    if (badProps.size) {
      const beforeProps = nextObjects.length;
      nextObjects = nextObjects.filter(o => !badProps.has(o?.id));
      if (nextObjects.length !== beforeProps) changed = true;
      droppedProps.push(...badProps);
    }
    if (!changed) break;
    engine = { ...engine, landscapeObjects: nextObjects };
    out = null;
  }
  if (!out) throw new ValidationError(['generateCatalog: не удалось собрать каталог после repair попыток'], v3w);
  if (dropped.length) {
    const uniq = [...new Set(dropped)].sort();
    if (report) {
      try {
        const r = JSON.parse(report);
        r.diagnostics = r.diagnostics ?? [];
        r.diagnostics.push({ severity: 'warning', code: 'build_conflicting_buildings_dropped', stage: 'build', message: 'dropped buildings conflicting with compiled/normalized placement', count: uniq.length, ids: uniq });
        r.repairs = r.repairs ?? [];
        r.repairs.push(...uniq.map(id => ({ stage: 'build', id, code: 'drop_conflicting_building' })));
        if (r.summary) {
          r.summary.warnings = (r.summary.warnings ?? 0) + 1;
          r.summary.repairs = (r.summary.repairs ?? 0) + uniq.length;
        }
        report = JSON.stringify(r, null, 2) + '\n';
      } catch {}
    }
  }
  if (droppedProps.length) {
    const uniq = [...new Set(droppedProps)].sort();
    if (report) {
      try {
        const r = JSON.parse(report);
        r.diagnostics = r.diagnostics ?? [];
        r.diagnostics.push({ severity: 'warning', code: 'build_conflicting_props_dropped', stage: 'build', message: 'dropped landscapeObjects with parser warnings', count: uniq.length, ids: uniq });
        r.repairs = r.repairs ?? [];
        r.repairs.push(...uniq.map(id => ({ stage: 'build', id, code: 'drop_conflicting_prop' })));
        if (r.summary) {
          r.summary.warnings = (r.summary.warnings ?? 0) + 1;
          r.summary.repairs = (r.summary.repairs ?? 0) + uniq.length;
        }
        report = JSON.stringify(r, null, 2) + '\n';
      } catch {}
    }
  }
  out.warnings = [...v3w, ...compiled.warnings, ...out.warnings];
  out.sourceFormat = isV4 ? 'cityforge-v4' : 'cityforge-v3';
  if (report) out.generationReport = report;
  return out;
}

/** Чем платить бриф: CityForge v3/v4 — компиляция в движок, `open` — каталог. */
export function generateOutput(raw, sourceName, opts = {}) {
  if (raw?.kind === 'cityforge') return generateCityforge(raw, sourceName, opts);
  if (raw?.kind === 'open') return generateCatalog(raw, sourceName, opts);
  const kind = raw?.kind ?? 'json';
  throw new ValidationError([
    `kind '${kind}' не поддерживается: поддерживаются только cityforge v3/v4 и kind 'open' (каталог).`,
  ], []);
}

/** Имя экспорта из имени файла: level-16.json → LEVEL_16, city-3 → CITY_3. */
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

/** Путь модуля главы по пути JSON: src/levels/level-15.json → .../level-15.js */
const defaultOut = jsonPath => resolve(dirname(jsonPath), `${basename(jsonPath, extname(jsonPath))}.js`);

function main(argv) {
  const jsonArg = argv.find(a => !a.startsWith('--'));
  if (!jsonArg) {
    console.error('использование: node tools/build-level.mjs <level.json> [--check] [--out <file.js>|<каталог>]');
    return 1;
  }
  const jsonPath = resolve(jsonArg);
  const outArg = argv.includes('--out') ? resolve(argv[argv.indexOf('--out') + 1]) : null;
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
    generated = generateOutput(raw, jsonArg, outArg && raw?.kind === 'open' ? { outDir: outArg } : {});
  } catch (e) {
    if (!(e instanceof ValidationError)) throw e;
    console.error(`${basename(jsonPath)}: ошибок — ${e.errors.length}`);
    for (const msg of e.errors) console.error(`  ✖ ${msg}`);
    for (const msg of e.warnings) console.error(`  ⚠ ${msg}`);
    return 1;
  }

  for (const msg of generated.warnings) console.log(`  ⚠ ${msg}`);

  if (generated.kind === 'format-test') {
    if (check) {
      console.log(`${basename(jsonPath)}: CityForge v3 — бриф валиден (${generated.name}, предупреждений — ${generated.warnings.length}); движкового вывода нет (тест формата)`);
      return 0;
    }
    console.log(`${basename(jsonPath)}: ${generated.name} — CityForge v3 валиден (${generated.warnings.length} предупреждений); движкового модуля не создаёт (компилятор формата ещё не подключён)`);
    return 0;
  }

  // Модуль — один файл рядом с JSON. Каталог — папка с тем же stem, и `--out`
  // для неё означает каталог, а не файл: чанков много и имя каждого даёт разрезка.
  // Файл каталога несёт либо текст (`code`), либо байты (`bytes`) — чанки и скелет бинарные.
  const catalogDir = generated.kind === 'catalog'
    ? (outArg ?? resolve(dirname(jsonPath), basename(jsonPath, extname(jsonPath))))
    : null;
  const targets = generated.kind === 'catalog'
    ? generated.files.map(f => ({
      path: join(catalogDir, f.path),
      code: f.code, bytes: f.bytes,
    }))
    : [{ path: outArg ?? defaultOut(jsonPath), code: generated.code }];
  if (generated.kind === 'catalog' && generated.generationReport) {
    targets.push({ path: join(catalogDir, 'generation-report.json'), code: generated.generationReport });
  }

  if (check) {
    const stale = [];
    for (const t of targets) {
      if (!existsSync(t.path)) {
        console.error(`${t.path}: файла нет — запустите без --check`);
        return 2;
      }
      if (t.bytes) {
        const cur = readFileSync(t.path);
        const same = cur.length === t.bytes.length && cur.every((v, i) => v === t.bytes[i]);
        if (!same) stale.push(basename(t.path));
      } else if (readFileSync(t.path, 'utf8').replace(/\r\n/g, '\n') !== t.code) stale.push(basename(t.path));
    }
    if (stale.length) {
      console.error(`${stale.join(', ')}: расходится с тем, что даёт парсер (${generated.warnings.length} предупреждений)`);
      return 2;
    }
    const extra = generated.generationReport ? 2 : 1; // index.js + optional report
    console.log(generated.kind === 'catalog'
      ? `каталог ${generated.name}: index.js и ${targets.length - extra} файлов данных совпадают с парсером`
      : `${basename(targets[0].path)}: совпадает с парсером, ${generated.name}`);
    return 0;
  }

  for (const t of targets) {
    mkdirSync(dirname(t.path), { recursive: true });
    if (t.bytes) writeFileSync(t.path, t.bytes);
    else writeFileSync(t.path, t.code, 'utf8');
  }
  if (generated.kind === 'catalog') {
    const m = generated.meta;
    const dataFiles = generated.files.filter(f => f.bytes);
    const chunkBytes = dataFiles.filter(f => f.path.startsWith('chunk-')).map(f => f.bytes.length);
    const skelBytes = (dataFiles.find(f => f.path.includes('skeleton'))?.bytes.length) ?? 0;
    const total = chunkBytes.reduce((s, v) => s + v, 0);
    console.log(`${basename(jsonPath)}: каталог ${dirname(targets[0].path)} записан — ${chunkBytes.length} чанков`
      + ` (сетка ${m.grid}×${m.grid}, сторона клетки ${m.chunk} м, плита ${m.size} м),`
      + ` участников ${m.participants}, владельцев ${m.owners}, маргин ${m.overlap} м`);
    console.log(`  чанки (бинарные) — ${total} Б (средний ${Math.round(total / (chunkBytes.length || 1))} Б, наибольший ${Math.max(0, ...chunkBytes)} Б),`
      + ` скелет ${skelBytes} Б, индекс ${generated.files[0].code.length} Б, предупреждений — ${generated.warnings.length}`);
    const sk = m.skeleton;
    console.log(`  скелет — ${sk.nodes} узлов / ${sk.edges} рёбер, компонент ${sk.components.before} → `
      + `${sk.components.after}, длинных рёбер принято ${sk.joined} (худшее ${sk.longestJoin} м), `
      + `элементов вне большой сети ${sk.covered.missingCount}; построение ${sk.ms.field}+${sk.ms.chains}`
      + `+${sk.ms.cands}+${sk.ms.join}+${sk.ms.report} мс`);
    return 0;
  }
  console.log(`${basename(targets[0].path)}: ${generated.name} записан (${targets[0].code.length} символов, предупреждений — ${generated.warnings.length})`);
  return 0;
}

const invokedDirectly = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));

export { ValidationError, defaultOut };
