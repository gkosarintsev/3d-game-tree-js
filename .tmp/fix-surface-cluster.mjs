// Починка вставки кластера в src/surfaces.js: у каждого перенесённого метода потерян
// закрывающий `  }` (ASI прятал это от --check). Временный файл.
import { readFileSync, writeFileSync } from 'node:fs';

const NAMES = ['_frame', '_toWorld', '_toLocal', '_rectIn', '_rectsIn', '_quadToWorld',
  '_worldRect', '_clip', '_collectBuildings', '_roof', '_wall', '_wallSegment',
  '_wallBand', '_floorPlate', '_stair'];

const path = 'src/surfaces.js';
const lines = readFileSync(path, 'utf8').split('\n');
const start = lines.findIndex((l) => l === '  _frame(b) {');
if (start < 0) throw new Error('_frame not found');
let cls = lines.findIndex((l, i) => i > start && l === '}');
if (cls < 0) throw new Error('class close not found');
let end = cls;
while (lines[end - 1].trim() === '') end--;

const isBoundary = (l, prev) => /^  \/\*\*/.test(l)
  || (/^  [_A-Za-z$][\w$]*\s*\(/.test(l) && prev !== '   */');
const chunks = [];
let cur = null;
for (let i = start; i < end; i++) {
  const prev = cur ? [...cur].reverse().find((x) => x.trim() !== '') : null;
  if (isBoundary(lines[i], prev)) { cur = []; chunks.push(cur); }
  if (!cur) throw new Error(`строка ${i + 1} вне метода: ${JSON.stringify(lines[i])}`);
  cur.push(lines[i]);
}
const names = chunks.map((c) => {
  const sig = c.find((l) => /^  [_A-Za-z$][\w$]*\s*\(/.test(l));
  if (!sig) throw new Error('чанк без сигнатуры: ' + c[0]);
  return /^  ([_A-Za-z$][\w$]*)/.exec(sig)[1];
});
if (names.join(',') !== NAMES.join(',')) throw new Error('порядок не тот: ' + names.join(','));

const out = [];
for (const c of chunks) {
  const body = c.slice();
  while (body[body.length - 1].trim() === '') body.pop();
  out.push(...body, '  }', '');
}
out.pop();
writeFileSync(path, [...lines.slice(0, start), ...out, '', ...lines.slice(cls)].join('\n'));
console.log(`регион ${start + 1}…${end}, методы ${names.length}, строк ${lines.length} → ${start + out.length + 1 + (lines.length - cls)}`);
