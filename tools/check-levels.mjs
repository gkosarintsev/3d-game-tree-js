/**
 * Приёмка каждого закоммиченного брифа на Node: `node tools/check-levels.mjs [file.json …]`.
 *
 * Файл ничего не правит и устроен так, чтобы новая глава (`level-14.json`) попала
 * в него сама: список брифов берётся из `src/levels/level-*.json`, а не из
 * перечня в коде. Сюита `tools/level-parser.test.mjs` проверяет арифметику
 * парсера на фикстурах, здесь же проверяются именно закоммиченные главы — то,
 * что у владельца уже живёт в репозитории и увидит браузер.
 *
 * Проверяется только то, что доказывается из данных без Three.js. Контракт
 * карты, опоры под узлами, связность графа и утечки мешей живут в браузерной
 * сюите `tests/level-contract.test.js`: `src/json-map.js:1` импортирует `three`,
 * а npm-зависимостей в проекте нет (AGENTS.md, «База»), поэтому карта в Node
 * не собирается в принципе.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generateOutput, ValidationError } from './build-level.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const README = readFileSync(resolve(ROOT, 'README.md'), 'utf8');

let passed = 0;
const failures = [];
const notes = [];

const pending = [];

/** Проверка; `fn` может быть асинхронной — одна проверка читает модуль импортом. */
function t(name, fn) {
  pending.push((async () => {
    try {
      await fn();
      passed++;
      console.log(`  ok  ${name}`);
    } catch (e) {
      failures.push(name);
      console.log(`FAIL  ${name}\n      ${String(e.message).split('\n')[0]}`);
    }
  })());
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

/** Все брифы главы-JSON в порядке номеров; аргументы CLI сужают список. */
function discoverBriefs(argv) {
  const found = readdirSync(resolve(ROOT, 'src/levels'))
    .filter(f => /^level-.*\.json$/.test(f) && !/schema\.json$/.test(f))
    .sort()
    .map(f => `src/levels/${f}`);
  if (!argv.length) return found;
  const wanted = argv.map(a => a.replace(/\\/g, '/').replace(/^\.\//, ''));
  const missing = wanted.filter(w => !found.includes(w));
  assert(missing.length === 0, `бриф(ов) нет в списке закоммиченных: ${missing.join(', ')}`);
  return found.filter(f => wanted.includes(f));
}

/**
 * Один прогон парсера на брифе: файлы вывода, предупреждения и повторный прогон
 * для сверки детерминизма. Открытая глава (`kind: 'open'`) даёт не один модуль, а
 * каталог, поэтому меряют все файлы: сравнивать только `index.js` значило бы
 * допустить расхождение чанка с его списком клеток. Ошибки валидатора — провал
 * проверки, а не исключение из сюиты: текст ошибки валидатора и есть полезный
 * отчёт.
 */
function parseBrief(file) {
  const raw = JSON.parse(readFileSync(resolve(ROOT, file), 'utf8'));
  let first;
  try {
    first = generateOutput(structuredClone(raw), file);
  } catch (e) {
    if (!(e instanceof ValidationError)) throw e;
    throw new Error(`парсер отверг бриф: ${e.errors.slice(0, 2).join(' | ')}`);
  }
  const again = generateOutput(structuredClone(raw), file);
  // имя файла входит в сравнение: перестановка чанков местами не сойдёт за
  // совпадение, а без неё два прогона различить нельзя
  const joined = (files) => files.map(f => `${f.path}\n${f.code}`).join('');
  return {
    raw,
    dir: first.dir,
    files: first.files,
    warnings: first.warnings,
    code: joined(first.files),
    again: joined(again.files),
  };
}

/** Плита уровня из брифа: `ground.size` на стороны, центрированная в (0, 0). */
const plateHalf = map => (map.ground && map.ground.size ? map.ground.size / 2 : null);

/** Точка внутри плиты и внутри габарита содержимого — то, что видно из данных. */
function pointInExtents(label, p, map, errors) {
  if (!Number.isFinite(p?.x) || !Number.isFinite(p?.z)) {
    errors.push(`${label}: координат нет или они не числа (${JSON.stringify(p)})`);
    return;
  }
  const half = plateHalf(map);
  if (half !== null && (Math.abs(p.x) > half || Math.abs(p.z) > half)) {
    errors.push(`${label} (${p.x}, ${p.z}) вне плиты мира ±${half} м — за ней isBlocked истинен у всех типов карт`);
  }
  const b = map.bounds;
  if (b && (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ)) {
    errors.push(`${label} (${p.x}, ${p.z}) вне габарита ${JSON.stringify(b)}`);
  }
}

// ---------------------------------------------------------------- брифы

const briefs = discoverBriefs(process.argv.slice(2).filter(a => !a.startsWith('--')));
assert(briefs.length > 0, 'в src/levels нет ни одного брифа — список пуст');

/**
 * Сборка и байт-соответствие. Три факта, которые раньше держались перечислением
 * глав в `level-parser.test.mjs` (и потому пропускали 11 и 12):
 * детерминизм на самом брифе, ноль предупреждений и совпадение закоммиченного
 * модуля с парсером.
 */
const moduleCache = new Map();
/** Определение главы из закоммиченного модуля (единственный экспорт — объект главы). */
async function importLevelModule(js) {
  if (!moduleCache.has(js)) {
    const mod = await import(pathToFileURL(resolve(ROOT, js)).href);
    const key = Object.keys(mod).find(k => k !== 'default');
    assert(key, `${js}: модуль ничего не экспортирует`);
    moduleCache.set(js, mod[key]);
  }
  return moduleCache.get(js);
}

for (const file of briefs) {
  const stem = basename(file, '.json');
  t(`${stem}: два прогона парсера дают побайтово одинаковый модуль`, () => {
    const p = parseBrief(file);
    assert(p.code === p.again, `${p.dir}: повторный прогон отличается — в парсере появился источник случайности`);
  });

  t(`${stem}: парсер молчит (предупреждений ноль)`, () => {
    const p = parseBrief(file);
    assert(p.warnings.length === 0,
      `предупреждений — ${p.warnings.length}: ${p.warnings.slice(0, 3).join(' | ')}`
      + ' — предупреждение в закоммиченной главе значит, что геометрию отдали обходному пути');
  });

  t(`${stem}: закоммиченный вывод совпадает с парсером побайтово`, () => {
    const p = parseBrief(file);
    const stale = [];
    for (const f of p.files) {
      const rel = `${p.dir}/${f.path}`;
      if (!existsSync(resolve(ROOT, rel))) {
        stale.push(`${rel}: файла нет — запустите node tools/build-level.mjs ${file}`);
        continue;
      }
      const committed = readFileSync(resolve(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
      if (committed !== f.code) stale.push(`${rel} устарел на ${committed.length - f.code.length} символов`);
    }
    assert(stale.length === 0, stale.join(' | '));
  });

  t(`${stem}: спавн и точка B лежат в плите и габарите, и не совпадают`, async () => {
    // модуль главы — обычный ES-экспорт чисел, Three.js ему не нужен, поэтому
    // импорт в Node законен и берёт ровно те же числа, что увидит движок
    const p = parseBrief(file);
    const level = await importLevelModule(`${p.dir}/${p.files[0].path}`);
    const map = level.map;
    const errors = [];
    const exit = level.gameplay?.exit;
    pointInExtents('spawn', map.spawn, map, errors);
    if (level.gameplay?.goal === 'exit') {
      pointInExtents('gameplay.exit', exit, map, errors);
      if (Number.isFinite(map.spawn?.x) && Number.isFinite(exit?.x)
        && Math.hypot(exit.x - map.spawn.x, exit.z - map.spawn.z) < 1) {
        errors.push('точка B совпала со спавном — глава проходится одним шагом');
      }
    }
    assert(errors.length === 0, errors.join(' | '));
  });
}

// ---------------------------------------------------------------- открытая глава

/**
 * Каталог открытой главы (`kind: 'open'`): путь к файлам клеток движок берёт из
 * данных (`map.catalog`, § 10.13 плана docs/open-world-plan.md), а не выводит из
 * URL модуля главы — определение обычный объект, `import.meta` у него нет.
 * Поэтому сверяются два факта, которые побайтовость не ловит: `catalog` ведёт
 * именно в каталог вывода (иначе скопированная глава звала бы файлы по прежнему
 * пути), и каждая клетка зовёт файл, который парсер действительно печатает.
 */
for (const file of briefs) {
  if (JSON.parse(readFileSync(resolve(ROOT, file), 'utf8')).kind !== 'open') continue;
  const stem = basename(file, '.json');
  t(`${stem}: catalog ведёт в каталог вывода, и клетки зовут напечатанные файлы`, async () => {
    const p = parseBrief(file);
    const level = await importLevelModule(`${p.dir}/${p.files[0].path}`);
    const map = level.map;
    const errors = [];
    if (map.catalog !== `/${p.dir}`) {
      errors.push(`catalog «${map.catalog}» не равен каталогу вывода «/${p.dir}»`);
    }
    const emitted = new Set(p.files.map(f => f.path));
    for (const c of map.cells ?? []) {
      if (!emitted.has(c.file)) errors.push(`клетка ${c.id}: файла ${c.file} в выводе парсера нет`);
    }
    const chunks = p.files.filter(f => f.path.startsWith('chunk-')).length;
    if (chunks !== (map.cells ?? []).length) {
      errors.push(`чанков напечатано ${chunks}, а клеток в списке ${(map.cells ?? []).length}`);
    }
    assert(errors.length === 0, errors.join(' | '));
  });
}

// ---------------------------------------------------------------- атрибуция GLB

/**
 * Правило AGENTS.md «каждый ассет коммитится только с атрибуцией» раньше
 * сторожился только глазами. Здесь сверяются три места, где attribution обязана
 * быть одинаковой: определение главы, раздел README и метаданные самого `.glb`.
 */
const registry = await import(pathToFileURL(resolve(ROOT, 'src/levels/index.js')).href);
const assets = [...new Set(registry.LEVELS.map(l => l.map?.asset).filter(Boolean))];

/** Подраздел README, описывающий ассет по пути в заголовке. */
function readmeBlockFor(assetPath) {
  const blocks = README.split(/^### /m).slice(1);
  return blocks.find(b => b.includes(assetPath)) ?? null;
}

/** Заголовок `asset.extras` прочитанного `.glb` — JSON-чанк без разбора модели. */
function glbExtras(assetPath) {
  const buf = readFileSync(resolve(ROOT, assetPath));
  assert(buf.readUInt32LE(0) === 0x46546C67, `${assetPath}: это не GLB (magic не 'glTF')`);
  assert(buf.readUInt32LE(4) === 2, `${assetPath}: GLB версии ${buf.readUInt32LE(4)}, загрузчик читает 2.0`);
  const jsonLen = buf.readUInt32LE(12);
  assert(buf.readUInt32LE(16) === 0x4E4F534A, `${assetPath}: первый чанк не JSON ('NOJS') — extras негде читать`);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  return json.asset?.extras ?? {};
}

if (assets.length === 0) {
  notes.push('в реестре нет ни одной главы с `map.asset` — проверку атрибуции пропущено');
}
for (const asset of assets) {
  t(`${basename(asset)}: атрибуция в README и в метаданных файла`, () => {
    assert(existsSync(resolve(ROOT, asset)), `${asset}: файла нет на диске`);
    const block = readmeBlockFor(asset);
    assert(block, `README.md: нет подраздела про ${asset} (правило «внешние ассеты»)`);
    assert(/Автор[:：]/.test(block), `README.md (${asset}): строки «Автор:» нет`);
    assert(/Лицензи(я|и)/.test(block), `README.md (${asset}): строки «Лицензия:» нет`);
    const extras = glbExtras(asset);
    for (const key of ['author', 'license']) {
      assert(typeof extras[key] === 'string' && extras[key].length > 0,
        `${asset}: asset.extras.${key} пуст — атрибуция обязана быть и в файле`);
    }
    // README и файл не должны расходиться: переписали автора в одном месте —
    // второй источник правды остался старым
    const readmeAuthor = block.match(/Автор:\s*\*\*([^*]+)\*\*/)?.[1]?.trim();
    if (readmeAuthor && extras.author) {
      assert(extras.author.includes(readmeAuthor),
        `${asset}: автор в README «${readmeAuthor}» не совпадает с extras «${extras.author}»`);
    }
  });
}

// ---------------------------------------------------------------- бюджеты (отчёт)

/**
 * Числы уровня печатаются, но ничего не запрещают: предел, придуманный без
 * замера, краснеет на законной главе (предложенный «модуль ≤ 500 КБ» нарушают
 * уже level-12.js). Пороги владелец назначает по этому отчёту.
 */
function budgetRows() {
  const rows = [];
  for (let i = 0; i < registry.LEVELS.length; i++) {
    const level = registry.LEVELS[i];
    const map = level.map ?? {};
    // номер главы берётся из реестра, а не из позиции: после удаления части
    // глав `i + 1` указывал бы на чужой файл
    const stem = `src/levels/level-${String(registry.LEVEL_NUMBERS[i]).padStart(2, '0')}`;
    // открытая глава не имеет одного «модуля»: её вывод — каталог, и для бюджета
    // интересен наибольший чанк, потому что его и читает движок по ходу пути
    const chunks = existsSync(resolve(ROOT, `${stem}.js`)) ? []
      : (existsSync(resolve(ROOT, stem)) ? readdirSync(resolve(ROOT, stem)).filter(f => f.startsWith('chunk-')) : []);
    const bytes = chunks.length
      ? Math.max(...chunks.map(f => statSync(resolve(ROOT, stem, f)).size))
      : (existsSync(resolve(ROOT, `${stem}.js`)) ? statSync(resolve(ROOT, `${stem}.js`)).size : 0);
    const decks = Array.isArray(map.roads) ? map.roads.reduce((s, r) => s + (r.decks?.length ?? 0), 0) : 0;
    const pillars = Array.isArray(map.roads) ? map.roads.reduce((s, r) => s + (r.pillars?.length ?? 0), 0) : 0;
    const lamps = Array.isArray(map.roads) ? map.roads.reduce((s, r) => s + (r.lamps?.length ?? 0), 0) : 0;
    rows.push({
      глава: i + 1,
      kind: map.kind ?? 'town',
      'модуль/чанк, КБ': Math.round(bytes / 1024),
      чанков: chunks.length || '',
      домов: Array.isArray(map.buildings) ? map.buildings.length : '',
      дорог: Array.isArray(map.roads) ? map.roads.length : '',
      настилов: decks || '',
      опор: pillars || '',
      фонарей: lamps || '',
      props: Array.isArray(map.props) ? map.props.length : '',
      плита: map.ground?.size ?? map.world?.size ?? map.width ?? map.window?.size ?? '',
      врагов: (level.gameplay?.enemies?.count ?? 0) + (level.gameplay?.alienEnemies?.count ?? 0),
    });
  }
  return rows;
}

// ---------------------------------------------------------------- вердикт

// проверки складываются в очередь: ждём все, прежде чем вынести вердикт
await Promise.all(pending);

console.log('\nбюджет глав (отчёт, пределы не назначаются):');
console.table(budgetRows());

for (const note of notes) console.log(`  · ${note}`);
console.log(`\n${passed}/${passed + failures.length} проверок зелёные`);
if (failures.length) {
  console.error(`провалено: ${failures.join(', ')}`);
  process.exitCode = 1;
}
