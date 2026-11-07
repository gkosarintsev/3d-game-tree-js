/**
 * Цена варианта (а) из § 10.12: один BFS достижимости от спавна по загруженному
 * графу на каждую достройку. Мера — на окне 3×3 (10 113 узлов), где живут все
 * три одиночки.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/orphan-bfs.mjs
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
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || '3d-game.html';
    const abs = resolve(ROOT, rel);
    let body = null;
    try { body = await readFile(abs); } catch { body = null; }
    if (body === null) res.writeHead(404).end('нет файла');
    else res.writeHead(200, { 'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
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
  const { OPEN_600 } = await import('/probe/open-600/index.js');
  const { WorldMap } = await import('/src/world-map.js');
  const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map.build(new THREE.Scene());
  for (const c of OPEN_600.map.cells) await map.loadChunk(c.id);
  const nav = map.nav;

  const bfs = () => {
    const seen = new Uint8Array(nav.pos.length);
    const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
    if (start < 0) return seen;
    const q = [start]; seen[start] = 1;
    for (let head = 0; head < q.length; head++) {
      for (const nb of nav.adj[q[head]]) if (!seen[nb]) { seen[nb] = 1; q.push(nb); }
    }
    return seen;
  };

  const seen = bfs();
  let unreachable = 0;
  for (let i = 0; i < seen.length; i++) if (!seen[i]) unreachable++;

  // семь прогонов, чтобы увидеть разброс; время — мс на один BFS
  const runs = [];
  for (let k = 0; k < 7; k++) {
    const t = performance.now();
    for (let rep = 0; rep < 10; rep++) bfs();
    runs.push(+((performance.now() - t) / 10).toFixed(3));
  }
  // цена на круг из 9 достроек и доля в цене синхронной работы (67…114 мс)
  const perBfs = runs.slice().sort((a, b) => a - b)[3];
  map.dispose();
  return {
    nodes: nav.pos.length, edges: nav.adj.reduce((s, a) => s + a.length, 0) / 2,
    unreachable, perBfsMs: perBfs, runs, nineLoadsMs: +(perBfs * 9).toFixed(1),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
