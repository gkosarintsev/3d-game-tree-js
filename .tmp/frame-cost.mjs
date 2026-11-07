/**
 * Что такое ~330 мс в этих замерах: цена запроса или кадр страницы. Три пробы на
 * одной уже запустившейся игре: `setTimeout(0)`, период `requestAnimationFrame`
 * и длительность одного игрового кадра.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/frame-cost.mjs
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
      'Content-Type': { '.json': 'application/json', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.glb': 'application/octet-stream', '.png': 'image/png' }[extname(abs)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    }).end(body);
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
  const rows = [];
  for (let k = 0; k < 3; k++) {
    const s = performance.now();
    await new Promise((r) => setTimeout(r, 0));
    rows.push(`setTimeout(0): ${(performance.now() - s).toFixed(1)} мс`);
  }
  const raf = [];
  let prev = performance.now();
  await new Promise((done) => {
    let n = 0;
    const tick = () => {
      const now = performance.now();
      raf.push(+(now - prev).toFixed(1));
      prev = now;
      if (++n < 6) requestAnimationFrame(tick); else done();
    };
    requestAnimationFrame(tick);
  });
  rows.push(`rAF промежутки: ${raf.join(' / ')} мс`);
  // чистый fetch того же файла, что мерил load-split, на этой же странице
  const s = performance.now();
  const t = await (await fetch('/probe/open-600/chunk-1-1.json')).text();
  rows.push(`fetch чанка 80 КБ: ${(performance.now() - s).toFixed(1)} мс (${(t.length / 1024).toFixed(0)} КБ)`);
  // и то же при остановленном цикле: кадр не мешает промису разрешиться
  window.game.paused = true;
  const s2 = performance.now();
  await new Promise((r) => setTimeout(r, 0));
  rows.push(`setTimeout(0) после paused=true: ${(performance.now() - s2).toFixed(1)} мс`);
  const s3 = performance.now();
  await (await fetch('/probe/open-600/chunk-0-0.json')).text();
  rows.push(`fetch чанка 237 КБ после paused=true: ${(performance.now() - s3).toFixed(1)} мс`);
  return rows;
});
for (const r of out) console.log(r);
await browser.close();
await new Promise((d) => server.close(d));
