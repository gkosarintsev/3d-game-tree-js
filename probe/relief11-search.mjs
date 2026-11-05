/**
 * Поиск параметров гряды: для каждого набора холмов собирает модуль главы 12 в
 * памяти (`generateModule`) и считает предупреждения парсера.
 *
 * Предупреждение здесь — не косметика: закоммиченный модуль обязан идти без них,
 * а каждое из них говорит, что поле под конкретным настилом/id даёт перепад,
 * которого движок не простит (горб улицы, распорка предмета, нос без улицы).
 * Поэтому критерий приёмки гряды — «предупреждений 0», а не мои собственные
 * порошки расхождения.
 */
import { readFileSync } from 'node:fs';
import { generateModule } from '../tools/build-level.mjs';

const BASE = JSON.parse(readFileSync('probe/level-12-backup-before-11.json', 'utf8'));

export function attempt(label, hills, mutate = null) {
  const raw = JSON.parse(JSON.stringify(BASE));
  const m = raw.map ?? raw;
  m.relief.hills.push(...hills);
  if (mutate) mutate(m);
  let warnings, chars;
  try {
    const out = generateModule(raw, 'src/levels/level-12.json');
    warnings = out.warnings;
    chars = out.code.length;
  } catch (e) {
    console.log(`${label.padEnd(34)} БРАК: ${String(e.message ?? e).slice(0, 140)}`);
    return { warnings: ['брак'], chars: 0 };
  }
  const kinds = {};
  for (const w of warnings) {
    const k = w.includes('перекрёстка держит поле') ? 'перекрёсток'
      : w.includes('прогон держит поле') ? 'прогон'
      : w.includes('улица даёт уклон') ? 'уклон улицы'
      : w.includes('не совпадает с опорой') ? 'предметы'
      : w.includes('нос') ? 'нос'
      : 'другое';
    kinds[k] = (kinds[k] ?? 0) + 1;
  }
  console.log(`${label.padEnd(34)} предупреждений ${String(warnings.length).padStart(3)}  `
    + `${Object.entries(kinds).map(([k, v]) => `${k}:${v}`).join(' ')}  модуль ${chars}`);
  if (warnings.length && process.argv[2] === '-v') {
    for (const w of warnings.slice(0, 6)) console.log('    — ' + w.slice(0, 150));
  }
  return { warnings, chars };
}
