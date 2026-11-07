/**
 * Почему `fetch` файла клетки в странице игры стоит ~330 мс, хотя тот же запрос
 * в той же странице без сборки между ними — 4…6 мс. Три ставки: (а) подряд идущие
 * `applyChunk` (куча и GC), (б) число одновременно живых карт, (в) сам вызов
 * `loadChunk` (fetch+json внутри класса).
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/fetch-why.mjs
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
    else res.writeHead(200, {
      'Content-Type': MIME(extname(abs)), 'Cache-Control': 'no-store',
    }).end(body);
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}
function MIME(e) {
  return { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json' }[e] ?? 'application/octet-stream';
}

const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.game && typeof window.game.createMap === 'function', null, { timeout: 120000 });

const out = await page.evaluate(async () => {
  const THREE = await import('three');
  const { OPEN_600 } = await import('/probe/open-600/index.js');
  const { WorldMap } = await import('/src/world-map.js');
  const cells = OPEN_600.map.cells;
  const url = (id) => `/probe/open-600/chunk-${id.replace('_', '-')}.json`;
  const timed = async (label, fn) => {
    const s = performance.now();
    const kb = await fn();
    return { label, ms: +(performance.now() - s).toFixed(1), kb: kb ?? 0 };
  };
  const rows = [];
  // (а) чистые fetch подряд, без сборки
  const texts = [];
  for (const c of cells.slice(0, 4)) rows.push(await timed('fetch без сборки', async () => {
    const t = await (await fetch(url(c.id))).text(); texts.push(t); return +(t.length / 1024).toFixed(0);
  }));
  // (б) теперь строим из уже прочитанных текстов — цена одной сборки в той же куче
  for (let k = 0; k < 4; k++) {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    rows.push(await timed('applyChunk из памяти (новая карта)', async () => { map.applyChunk(cells[k].id, JSON.parse(texts[k])); return 0; }));
    map.dispose();
  }
  // (в) loadChunk целиком на карте, где уже собраны те же клетки, но не эти
  const map2 = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map2.build(new THREE.Scene());
  for (const c of cells.slice(0, 4)) await map2.loadChunk(c.id);
  for (const c of cells.slice(4, 8)) rows.push(await timed('loadChunk на заполненной карте', async () => { await map2.loadChunk(c.id); return 0; }));
  rows.push(await timed('fetch после 4 сборок той же карты', async () => {
    const t = await (await fetch(url(cells[8].id))).text();
    return +(t.length / 1024).toFixed(0);
  }));
  map2.dispose();
  return rows;
});
for (const r of out) console.log(`${String(r.ms).padStart(7)} мс  ${String(r.kb).padStart(4)} КБ  ${r.label}`);
await browser.close();
await new Promise((d) => server.close(d));
