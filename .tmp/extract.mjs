// Механический вырез методов из src/json-map.js в класс Proto прототипа, по
// транзитивному замыканию вызовов `this._X(` (временный файл).
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'src/json-map.js';
const LIB = '.tmp/skel-proto-lib.mjs';
const src = readFileSync(SRC, 'utf8').split('\n');
const libRaw = readFileSync(LIB, 'utf8');
const lib = libRaw.replace(/\r\n/g, '\n');

const names = process.argv.slice(2);
const defIndex = new Map();
for (let i = 0; i < src.length; i++) {
  const m = /^  ([A-Za-z_][A-Za-z0-9_]*)\(/.exec(src[i]);
  if (m && !defIndex.has(m[1])) defIndex.set(m[1], i);
}
/** Тело метода — до первой строки `  }`. */
function bodyAt(i) {
  let end = i;
  while (end + 1 < src.length && !/^  \}/.test(src[end + 1])) end++;
  return src.slice(i, end + 2).join('\n');
}
const have = new Set();
for (let i = 0; i < lib.length; i++) {
  const m = /^  ([A-Za-z_][A-Za-z0-9_]*)\(/.exec(lib.split('\n')[i]) || /Proto\.prototype\.([A-Za-z_][A-Za-z0-9_]*) =/.exec(lib.split('\n')[i]);
  if (m) have.add(m[1]);
}
const queue = [...names];
const out = [];
const seen = new Set();
while (queue.length) {
  const n = queue.shift();
  if (seen.has(n) || have.has(n) || !defIndex.has(n)) continue;
  seen.add(n);
  const b = bodyAt(defIndex.get(n));
  out.push(b);
  for (const m of b.matchAll(/this\.(_?[A-Za-z0-9_]+)\(/g)) queue.push(m[1]);
}
const anchor = lib.indexOf('/** Копия `_navDecks`');
if (anchor < 0) { console.error('НЕТ МАРКЕРА'); process.exit(1); }
const close = lib.lastIndexOf('\n}\n', anchor);
if (close < 0) { console.error('НЕТ ЗАКРЫВАЮЩЕЙ СКОБКИ'); process.exit(1); }
const next = lib.slice(0, close) + '\n' + out.join('\n') + lib.slice(close);
writeFileSync(LIB, next.endsWith('\n') ? next + '\n' : next);
console.log(JSON.stringify({ added: [...seen], already: [...have].filter(h => names.includes(h)) }, null, 1));
