/**
 * A/B одной и той же цены запроса: `fetch` против `import()` на одном и том же
 * файле в одной и той же странице. Нужна потому, что два замера дали разные
 * числа (385 мс на fetch против 9,5 мс на import), а этап 4 обязан планировать
 * wall-clock достройки по настоящему числу.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/fetch-vs-import.mjs
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
      'Content-Type': extname(abs) === '.json' ? 'application/json' : 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    }).end(body);
  });
  return new Promise((d) => server.listen(0, '127.0.0.1', () => d({ server, port: server.address().port })));
}

const { server, port } = await serve();
// Гипотеза о ~385 мс на запрос: в headless-Chromium на Windows это поиск
// системного прокси (PAC/«автоматически определять параметры»), а не сервер и
// не размер файла. Вторая ставка — `--no-proxy-server`.
for (const args of [['--no-sandbox'], ['--no-sandbox', '--no-proxy-server']]) {
  const browser = await chromium.launch({ args });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });
  const out = await page.evaluate(async () => {
    const rows = [];
    const url = '/probe/open-600/chunk-0-0.json';
    const mod = '/.tmp/index-2km/index-compact.js';
    for (let k = 0; k < 3; k++) {
      let s = performance.now();
      await (await fetch(`${url}?v=${k}`)).text();
      rows.push(`fetch json #${k}: ${(performance.now() - s).toFixed(1)} мс`);
      s = performance.now();
      await import(`${mod}?v=j${k}`);
      rows.push(`import js  #${k}: ${(performance.now() - s).toFixed(1)} мс`);
      s = performance.now();
      const r = await fetch(`${mod.replace('.js', '.js')}?v=f${k}`);
      await r.text();
      rows.push(`fetch  js  #${k}: ${(performance.now() - s).toFixed(1)} мс`);
    }
    return rows;
  });
  console.log("--- набор флагов: " + args.join(" "));
  for (const line of out) console.log('  ' + line);
  await browser.close();
}
await new Promise((d) => server.close(d));
