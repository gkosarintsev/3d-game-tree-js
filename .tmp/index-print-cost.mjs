/**
 * Мера для § 10.9 плана (компактная печать скелета против общего принтера):
 * сколько стоит холодный импорт `index.js` в браузере — такого, какой печатает
 * `stringifyStable` (по числу на строку), и такого, где те же числа лежат
 * компактно. Разница и есть цена 343 КБ formatting-шума.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/index-print-cost.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.glb': 'application/octet-stream', '.png': 'image/png' };

function serve() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || '3d-game.html';
    const abs = resolve(ROOT, rel);
    let body = null;
    try {
      body = await readFile(abs);
    } catch { /* 404 */ }
    if (body === null) res.writeHead(404).end('нет файла');
    else res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}

// компактная копия: тот же объект, числа printing-шумом не раздуты
const src = await readFile(resolve(ROOT, 'probe/open-600/index.js'), 'utf8');
const mod = await import(`data:text/javascript;base64,${Buffer.from(src).toString('base64')}`);
const compact = `export const OPEN_600 = ${JSON.stringify(mod.OPEN_600)};\n`;
await writeFile(resolve(ROOT, '.tmp/index-compact.js'), compact);
const prettyBytes = src.length, compactBytes = compact.length;

const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });

const out = await page.evaluate(async (urls) => {
  const rows = [];
  for (const [label, url] of urls) {
    const t = [];
    for (let k = 0; k < 3; k++) {
      const s = performance.now();
      const m = await import(`${url}?v=${Date.now()}-${k}`);
      const ms = performance.now() - s;
      const nodes = m.OPEN_600.map.skeleton?.nodes?.length ?? 0;
      t.push({ ms: +ms.toFixed(1), kb: 0, nodes });
    }
    rows.push({ label, best: Math.min(...t.map((x) => x.ms)), all: t.map((x) => x.ms), nodes: t[0].nodes });
  }
  return rows;
}, [
  ['index.js как печатает stringifyStable', '/probe/open-600/index.js'],
  ['те же числа компактно', '/.tmp/index-compact.js'],
]);
console.log(`байтов: общий принтер ${prettyBytes} Б, компактный ${compactBytes} Б, разница ${prettyBytes - compactBytes} Б`);
for (const r of out) console.log(`${r.label}: лучший ${r.best} мс, прогоны ${r.all.join(' / ')} мс, узлов скелета ${r.nodes}`);
await browser.close();
server.close();
await import('node:fs/promises').then((fs) => fs.unlink(resolve(ROOT, '.tmp/index-compact.js')));
