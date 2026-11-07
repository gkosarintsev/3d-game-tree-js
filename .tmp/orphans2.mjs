/**
 * Те же три одиночных узла — свойство данных или следствие достройки по чанкам:
 * сравнение разбиения на компоненты у мира из 9 клеток и у того же города,
 * собранного одним `JsonMap` (эталон сюиты).
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/orphans2.mjs
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
  const { JsonMap } = await import('/src/json-map.js');
  const COLLECTIONS = ['buildings', 'roads', 'channels', 'props', 'lights'];
  const cells = OPEN_600.map.cells;

  const compsOf = (nav) => {
    const seen = new Set(); const sizes = []; const keys = [];
    for (const [key, i] of nav.byKey) {
      if (seen.has(i)) continue;
      const q = [i]; seen.add(i); const m = [key];
      while (q.length) { const k = q.pop(); for (const j of nav.adj[k]) if (!seen.has(j)) { seen.add(j); m.push([...nav.byKey.entries()].find(([, v]) => v === j)?.[0]); q.push(j); } }
      sizes.push(m.length); keys.push(m);
    }
    return { n: sizes.length, sizes: sizes.sort((a, b) => b - a), members: keys };
  };

  const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map.build(new THREE.Scene());
  for (const c of cells) await map.loadChunk(c.id);
  const streamed = compsOf(map.nav);

  const spec = { kind: 'json2', units: 'meters', ground: OPEN_600.map.ground, bounds: OPEN_600.map.bounds,
    spawn: OPEN_600.map.spawn, windows: OPEN_600.map.windows, clutter: OPEN_600.map.clutter, signage: OPEN_600.map.signage };
  spec.buildings = []; spec.roads = []; spec.channels = []; spec.props = []; spec.lights = [];
  for (const c of cells) {
    const d = await (await fetch(`/probe/open-600/${c.file}`)).json();
    for (const k of COLLECTIONS) for (const rec of d[k] ?? []) if (rec.owner === true) spec[k].push(rec);
  }
  const wholeScene = new THREE.Scene();
  const whole = new JsonMap(spec);
  // граф у `JsonMap` строится в `build(scene)` — без него сравнивать нечего
  whole.build(wholeScene);
  const single = compsOf(whole.nav);

  // есть ли те же ключи-одиночки в эталоне
  const orphanKeysStreamed = streamed.members.filter((m) => m.length === 1).map((m) => m[0]);
  const orphanKeysWhole = single.members.filter((m) => m.length === 1).map((m) => m[0]);
  const inWhole = orphanKeysStreamed.filter((k) => single.members.some((m) => m.includes(k)));
  return {
    streamed: { comps: streamed.n, sizes: streamed.sizes.slice(0, 6), nodes: map.nav.byKey.size },
    whole: { comps: single.n, sizes: single.sizes.slice(0, 6), nodes: whole.nav.byKey.size },
    orphanKeysStreamed, orphanKeysWhole,
    orphanStillOrphanKeys: inWhole.length,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
