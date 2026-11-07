// Одноразовый перенос three-free кластера домов из src/json-map.js в
// src/surfaces.js (этап 2). Временный файл, в репозиторий не едет.
import { readFileSync, writeFileSync } from 'node:fs';

const JM = 'src/json-map.js';
const SF = 'src/surfaces.js';
const names = process.argv[2].split(',');

const jm = readFileSync(JM, 'utf8').split('\n');
const sf = readFileSync(SF, 'utf8').split('\n');

/** Начало метода — `  name(`; конец — первая `  }`. Захватывает JSDoc над ним. */
function rangeOf(lines, name) {
  const i = lines.findIndex(l => l.startsWith(`  ${name}(`));
  if (i < 0) throw new Error('НЕ НАЙДЕН ' + name);
  let e = i;
  while (e + 1 < lines.length && !/^  \}/.test(lines[e + 1])) e++;
  let s = i;
  if (lines[i - 1] && lines[i - 1].trim() === '*/') {
    let k = i - 1;
    while (k >= 0 && !lines[k].trim().startsWith('/**')) k--;
    if (k >= 0) s = k;
  }
  return [s, e];
}

const chunks = [];
for (const n of names) {
  const [s, e] = rangeOf(jm, n);
  chunks.push({ name: n, lines: jm.slice(s, e + 1), from: s + 1, to: e + 1 });
}
// удаление снизу вверх, чтобы индексы не съехали
for (const c of [...chunks].sort((a, b) => b.from - a.from)) {
  jm.splice(c.from - 1, c.to - c.from + 1);
}
// вставка в SurfaceField перед закрывающей скобкой класса (первая `}` в колонке 0)
const close = sf.findIndex(l => l === '}');
if (close < 0) throw new Error('НЕТ ЗАКРЫВАЮЩЕЙ СКОБКИ В surfaces.js');
const block = [];
for (const c of chunks) block.push(...c.lines, '');
sf.splice(close, 0, ...block, '');

writeFileSync(JM, jm.join('\n'));
writeFileSync(SF, sf.join('\n'));
console.log(JSON.stringify(chunks.map(c => `${c.name}:${c.from}..${c.to}`), null, 1));
