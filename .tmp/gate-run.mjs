/**
 * Мера гейта § 7.2 п. 3 **в контексте сюиты**: та же страница, тот же порядок
 * тестов, что видит CI, — и полный `info` последней проверки без обрезки
 * `ci-browser.mjs` (300 символов). Нужна потому, что в первом прогоне атом
 * `picture` дал 38,8 мс против 24,6 мс в изолированном свипе `.tmp/pump-run.mjs`,
 * и надо понять: это хвост, контекст (9 сюжеток перед этим строят и бросят
 * миры в той же странице) или норма.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/gate-run.mjs [число повторов]
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.glb': 'application/octet-stream', '.png': 'image/png',
};

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

const repeats = Number(process.argv[2] ?? 1);
const { server, port } = await serve();
const browser = await chromium.launch({ args: ['--no-sandbox', '--enable-precise-memory-info'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => { if (m.text().startsWith('#')) console.log(m.text().slice(1)); });
await page.addInitScript(() => {
  // метки самой сюиты не обрезаны: печатаем полный info через console.log с #
  const orig = console.group;
  console.group = (...a) => { orig.apply(console, a); };
});
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.game && typeof window.game.createMap === 'function', null, { timeout: 120000 });

for (let n = 0; n < repeats; n++) {
  const res = await page.evaluate(async () => {
    const mod = await import('/tests/open-world.test.js?v=' + Date.now());
    const r = await mod.runOpenWorldTests();
    return r.results.map((x) => ({ name: x.name, passed: x.passed, info: x.info }));
  });
  console.log(`===== повтор ${n + 1} =====`);
  for (const x of res) console.log(`${x.passed ? 'PASS' : 'FAIL'} ${x.name}\n     ${x.info}\n`);
}
await browser.close();
server.close();
