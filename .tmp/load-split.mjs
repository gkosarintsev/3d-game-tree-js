/**
 * Разложение цены одной достройки на `fetch`, `JSON.parse` и синхронный
 * `applyChunk` — то, что этап 4 обязан уместить в `budgetMs`, и что в этот
 * бюджет не входит (сеть и парсер вне synchronous-контракта карты).
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/load-split.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
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
    try {
      res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(await readFile(abs));
    } catch {
      res.writeHead(404).end('нет файла');
    }
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}

const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.game && typeof window.game.createMap === 'function', null, { timeout: 120000 });

const out = await page.evaluate(async () => {
  const THREE = await import('three');
  const v = '?v=' + Date.now();
  const { OPEN_600 } = await import('/probe/open-600/index.js' + v);
  const { WorldMap } = await import('/src/world-map.js' + v);
  const cells = OPEN_600.map.cells;
  const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map.build(new THREE.Scene());
  const rows = [];
  for (const cell of cells) {
    const s0 = performance.now();
    const res = await fetch(map.chunkUrl(cell.id));
    const text = await res.text();
    const s1 = performance.now();
    const data = JSON.parse(text);
    const s2 = performance.now();
    map.applyChunk(cell.id, data);
    const s3 = performance.now();
    rows.push({
      id: cell.id,
      kb: +(text.length / 1024).toFixed(0),
      fetch: +(s1 - s0).toFixed(1),
      parse: +(s2 - s1).toFixed(1),
      apply: +(s3 - s2).toFixed(1),
      total: +(s3 - s0).toFixed(1),
    });
  }
  return { rows, bytesIndex: 0 };
});
for (const r of out.rows) console.log(JSON.stringify(r));
const sum = (k) => +out.rows.reduce((s, r) => s + r[k], 0).toFixed(0);
console.log('суммы мс:', JSON.stringify({ fetch: sum('fetch'), parse: sum('parse'), apply: sum('apply'), total: sum('total') }));
const mid = (k) => out.rows.map((r) => r[k]).sort((a, b) => a - b)[4];
console.log('медианы мс:', JSON.stringify({ fetch: mid('fetch'), parse: mid('parse'), apply: mid('apply'), total: mid('total') }));
console.log('худшая apply:', Math.max(...out.rows.map((r) => r.apply)), 'худшая total:', Math.max(...out.rows.map((r) => r.total)));
await browser.close();
server.close();
