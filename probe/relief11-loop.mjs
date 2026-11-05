/**
 * Приёмка гряды полным циклом: бриф → модуль → автораскладка дорог по собранному
 * полю → отметки предметов → снова модуль, и в конце — счёт предупреждений.
 *
 * Порядок не выдумка: `probe/stage8-author.mjs` берёт поле из **закоммиченного**
 * модуля (там уже террасы районов), поэтому сначала обязан отписаться модуль,
 * потом улицы, потом — предметы, чью отметку нормализатор правит с
 * предупреждением. Закоммиченный модуль предупреждений нести не может, поэтому
 * критерий приёмки — «0», а не «красиво».
 *
 *   node probe/relief11-loop.mjs '<json с списком холмов>' [--keep]
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { generateModule } from '../tools/build-level.mjs';

const BRIEF = 'src/levels/level-12.json';
const BACKUP = 'probe/level-12-backup-before-11.json';

const hills = JSON.parse(process.argv[2] ?? '[]');
const keep = process.argv.includes('--keep');

copyFileSync(BACKUP, BRIEF);
const raw = JSON.parse(readFileSync(BRIEF, 'utf8'));
const m = raw.map ?? raw;
m.relief.hills.push(...hills);
writeFileSync(BRIEF, JSON.stringify(raw, null, 2) + '\n');

const build = () => execFileSync('node', ['tools/build-level.mjs', BRIEF, '--write'], { encoding: 'utf8' });
const author = () => execFileSync('node', ['probe/stage8-author.mjs', '--write'], { encoding: 'utf8' });

const warnOf = () => {
  const cur = JSON.parse(readFileSync(BRIEF, 'utf8'));
  try {
    return generateModule(cur, BRIEF).warnings;
  } catch (e) {
    return [`БРАК: ${String(e.message ?? e).slice(0, 160)}`];
  }
};

build();
author();
build();

/** Отметки предметов — те, что требует нормализатор, поWarn-за-warn. */
for (let pass = 0; pass < 4; pass++) {
  const warnings = warnOf();
  const fixable = warnings.filter(w => w.includes('не совпадает с опорой'));
  if (!fixable.length) break;
  const cur = JSON.parse(readFileSync(BRIEF, 'utf8'));
  const mm = cur.map ?? cur;
  let done = 0;
  for (const w of fixable) {
    const id = /landscapeObjects \(([^)]+)\)/.exec(w)?.[1];
    const y = Number(/опорой (-?[\d.]+)/.exec(w)?.[1]);
    const obj = (mm.landscapeObjects ?? []).find(o => o.id === id);
    if (obj && Number.isFinite(y)) { obj.position.y = y; done++; }
  }
  if (!done) break;
  writeFileSync(BRIEF, JSON.stringify(cur, null, 2) + '\n');
  build();
}

const final = warnOf();
console.log(`\nитог: предупреждений ${final.length}`);
for (const w of final.slice(0, 14)) console.log('  — ' + w.slice(0, 170));
if (final.length) console.log(`  … всего ${final.length}`);
console.log(keep ? '(бриф оставлен: ' + BRIEF + ')' : '(бриф не закоммичен — правка в рабочем дереве)');
