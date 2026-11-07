/**
 * Проверка фиксированной цены одного запроса к локальному серверу: повторный
 * fetch того же URL, fetch мелкого файла и fetch с включённым кэшем.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/fetch-cost.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' };

function serve() {
  const server = createServer(async (req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
    const abs = resolve(ROOT, rel);
    let body;
    try {
      body = await readFile(abs);
    } catch {
      body = null;
    }
    if (body === null) {
      res.writeHead(404).end('нет файла');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}

const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });

const out = await page.evaluate(async () => {
  const one = async (url, label) => {
    const s = performance.now();
    const r = await fetch(url);
    const t = await r.text();
    const ms = +(performance.now() - s).toFixed(1);
    return { label, url, kb: +(t.length / 1024).toFixed(0), ms };
  };
  const rows = [];
  rows.push(await one('/probe/open-600/index.js', 'index.js 0,57 МБ'));
  rows.push(await one('/probe/open-600/chunk-1-1.json', 'чанк 80 КБ впервые'));
  rows.push(await one('/probe/open-600/chunk-1-1.json', 'тот же чанк повторно'));
  rows.push(await one('/probe/open-600/chunk-1-1.json', 'и ещё раз'));
  rows.push(await one('/favicon.ico', 'несуществующий файл'));
  rows.push(await one('/probe/open-600/chunk-0-0.json', 'чанк 237 КБ впервые'));
  // десять параллельных запросов — что из них последовательная цена
  const s = performance.now();
  await Promise.all([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => fetch('/probe/open-600/chunk-1-1.json').then((r) => r.text())));
  rows.push({ label: '10 параллельно (суммарно)', url: '-', kb: '-', ms: +(performance.now() - s).toFixed(1) });
  return rows;
});
for (const r of out) console.log(`${String(r.ms).padStart(7)} мс  ${String(r.kb).padStart(5)} КБ  ${r.label}`);
await browser.close();
server.close();
