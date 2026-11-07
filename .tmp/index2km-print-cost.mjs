/**
 * Мера § 10.9: холодный импорт `index.js` фикстуры 1,4 км² — как его печатает
 * общий принтер `stringifyStable` (566 833 Б) против тех же чисел компактно
 * (202 828 Б). Файлы собирает .tmp/emit-index-2km.mjs.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/index2km-print-cost.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

function serve() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || '3d-game.html';
    const abs = resolve(ROOT, rel);
    let body = null;
    try {
      body = await readFile(abs);
    } catch { /* 404 */ }
    if (body === null) res.writeHead(404).end('нет файла');
    else res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(body);
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}

const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });

const out = await page.evaluate(async (cases) => {
  const rows = [];
  for (const [label, url, constName] of cases) {
    const t = [];
    for (let k = 0; k < 4; k++) {
      const s = performance.now();
      const m = await import(`${url}?v=${Date.now()}-${k}`);
      t.push(+(performance.now() - s).toFixed(1));
      const spec = m[constName];
      const nodes = (spec.map ?? spec)?.skeleton?.nodes?.length ?? 0;
      if (nodes !== 3864) throw new Error(`${label}: скелета в файле нет (узлов ${nodes})`);
    }
    rows.push({ label, best: Math.min(...t), all: t });
  }
  return rows;
}, [
  ['stringifyStable (566 833 Б)', '/.tmp/index-2km/index.js', 'OPEN_2KM'],
  ['JSON.stringify (202 828 Б)', '/.tmp/index-2km/index-compact.js', 'OPEN_2KM'],
]);
for (const r of out) console.log(`${r.label}: лучший ${r.best} мс, прогоны ${r.all.join(' / ')} мс`);
await browser.close();
server.close();
