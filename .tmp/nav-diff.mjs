/**
 * Одноразовая диагностика: чем различаются графы при двух порядках достройки и
 * где лежат узлы, которые `navFit` считает годными вне загруженных клеток.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/nav-diff.mjs
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

const out = await page.evaluate(async () => {
  const { OPEN_600 } = await import('/probe/open-600/index.js');
  const { WorldMap } = await import('/src/world-map.js');
  const cells = OPEN_600.map.cells;
  const mk = async (ids) => {
    const THREE = await import('three');
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    for (const id of ids) await map.loadChunk(id);
    return map;
  };
  const sig = (map) => {
    const keyOf = new Map();
    for (const [k, i] of map.nav.byKey) keyOf.set(i, k);
    const edges = new Set();
    for (const [k, i] of map.nav.byKey) {
      for (const j of map.nav.adj[i]) if (keyOf.get(j) > k) edges.add(`${k}~${keyOf.get(j)}`);
    }
    return edges;
  };
  const subset = [cells[0].id, cells[4].id, cells[8].id, cells[3].id];
  const a = await mk(subset);
  const b = await mk([...subset].reverse());
  const ea = sig(a), eb = sig(b);
  const onlyA = [...ea].filter((x) => !eb.has(x));
  const onlyB = [...eb].filter((x) => !ea.has(x));
  const kind = (k) => k.split(':')[0];
  const tally = (list) => {
    const t = {};
    for (const e of list) {
      const [x, y] = e.split('~');
      const key = `${kind(x)}|${kind(y)}`;
      t[key] = (t[key] ?? 0) + 1;
    }
    return t;
  };
  // узлы вне загруженных прямоугольников при одной клетке
  const one = await mk([cells[4].id]);
  const stray = [];
  for (const [k, i] of one.nav.byKey) {
    const p = one.nav.pos[i];
    if (!one._loadedAt(p.x, p.z)) stray.push({ key: k, x: +p.x.toFixed(1), y: +p.y.toFixed(2), z: +p.z.toFixed(1) });
  }
  return {
    nodesA: a.nav.byKey.size, nodesB: b.nav.byKey.size,
    edgesA: ea.size, edgesB: eb.size,
    onlyA: onlyA.length, onlyB: onlyB.length,
    tallyOnlyA: tally(onlyA), tallyOnlyB: tally(onlyB),
    sampleOnlyA: onlyA.slice(0, 12), sampleOnlyB: onlyB.slice(0, 12),
    strayCount: stray.length, stray: stray.slice(0, 20),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
