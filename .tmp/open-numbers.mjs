/**
 * Одноразовый сборщик чисел этапа 3: полный прогон сюиты open-world без
 * обрезки `info` плюс разложение цены достройки.
 *
 * Запуск: node .tmp/open-numbers.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.glb': 'application/octet-stream', '.png': 'image/png' };

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

const r = await page.evaluate(async () => {
  const t = await import('/tests/open-world.test.js?v=' + Date.now());
  const out = await t.runOpenWorldTests();
  // цена: одна достройка и всё окно, с разложением по членам работы
  const THREE = await import('three');
  const { OPEN_600 } = await import('/probe/open-600/index.js');
  const { WorldMap } = await import('/src/world-map.js');
  const mk = async (list) => {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    const rows = [];
    for (const id of list) {
      const s = performance.now();
      await map.loadChunk(id);
      rows.push({ id, ms: performance.now() - s, nodes: map.nav.byKey.size });
    }
    return { map, rows };
  };
  const one = await mk([OPEN_600.map.cells.find((c) => c.objects.buildings).id]);
  const window9 = await mk(OPEN_600.map.cells.map((c) => c.id));
  return {
    passed: out.passed, total: out.total,
    results: out.results.map((x) => `${x.passed ? 'PASS' : 'FAIL'} — ${x.name}\n    ${x.info}`),
    oneCell: one.rows, window9: window9.rows,
    nodesWindow: window9.map.nav.byKey.size, edgesWindow: window9.map.nav.adj.reduce((s, a) => s + a.length, 0) / 2,
  };
});
console.log(`${r.passed}/${r.total} зелёные`);
for (const line of r.results) console.log(line);
console.log('цена одной достройки:', JSON.stringify(r.oneCell));
console.log('цена окна 3×3 по порядку:', JSON.stringify(r.window9));
console.log('окно: узлов', r.nodesWindow, 'рёбер', r.edgesWindow);
await browser.close();
server.close();
