// Сверка перенесённых методов: тело каждого в src/surfaces.js обязано быть
// дословно тем, что в HEAD:src/json-map.js. Временный файл.
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const NAMES = ['_frame', '_toWorld', '_toLocal', '_rectIn', '_rectsIn', '_quadToWorld',
  '_worldRect', '_clip', '_collectBuildings', '_roof', '_wall', '_wallSegment',
  '_wallBand', '_floorPlate', '_stair'];

/** Вынуть метод вместе с doc-блоком: от `  /**`/сигнатуры до `  }` при двух отступах. */
function cut(lines, name) {
  const at = lines.findIndex((l, i) => /^  (get |static )?[_A-Za-z$][\w$]*\s*\(/.test(l)
    && new RegExp(`^  (get |static )?${name}\\s*\\(`).test(l));
  if (at < 0) return null;
  let from = at;
  if (lines[at - 1] === '   */') {
    from = at - 1;
    while (from > 0 && !/^  \/\*\*/.test(lines[from - 1])) from--;
    from--;
  }
  let to = at;
  while (to < lines.length && lines[to] !== '  }') to++;
  return lines.slice(from, to + 1).join('\n');
}

const head = execSync('git show HEAD:src/json-map.js', { encoding: 'utf8', maxBuffer: 64e6 }).split('\n');
const now = readFileSync('src/surfaces.js', 'utf8').split('\n');
const jsonMap = readFileSync('src/json-map.js', 'utf8').split('\n');
let bad = 0;
for (const n of NAMES) {
  const a = cut(head, n), b = cut(now, n), c = cut(jsonMap, n);
  const same = a !== null && b !== null && a === b;
  if (!same || c !== null) {
    bad++;
    console.log(`${n}: ${same ? 'OK' : 'РАЗОШЛОСЬ'}${c !== null ? ' + остался в json-map' : ''}`);
    if (!same && a && b) {
      const al = a.split('\n'), bl = b.split('\n');
      for (let i = 0; i < Math.max(al.length, bl.length); i++) {
        if (al[i] !== bl[i]) console.log(`  L${i}\n   HEAD: ${JSON.stringify(al[i])}\n   NOW : ${JSON.stringify(bl[i])}`);
      }
    }
  }
}
console.log(bad ? `ПЛОХО: ${bad}` : `дословно перенесено ${NAMES.length} методов, в json-map.js их больше нет`);
