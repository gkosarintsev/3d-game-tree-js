/**
 * Рост цены отдельных членов достройки по мере наполнения окна: `_rebuildWorld`
 * (склейка набора + четыре индекса + якоря), `_navLattice`, `_navPasses`,
 * картинка — и синхронный `applyChunk` целиком. Это числа для § 10.10 плана
 * («перестройка индексов против чистки по чанку») и для предела `budgetMs`
 * этапа 4.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/per-load-parts.mjs
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
    let body = null;
    try {
      body = await readFile(abs);
    } catch { /* 404 */ }
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
  const v = '?v=' + Date.now();
  const { OPEN_600 } = await import('/probe/open-600/index.js' + v);
  const { WorldMap } = await import('/src/world-map.js' + v);
  const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map.build(new THREE.Scene());
  const cells = OPEN_600.map.cells;
  const data = [];
  for (const c of cells) data.push([c.id, await (await fetch(map.chunkUrl(c.id))).json()]);

  const rows = [];
  let cur = null;
  // `_buildPicture` живёт на JsonMap.prototype, а `_rebuildWorld` — на
  // WorldMap.prototype: обёртку вешаем на тот прототип, где метод действительно
  // определён, иначе own-свойство только затенило бы унаследованный метод.
  const ownerOf = (name) => {
    let p = Object.getPrototypeOf(map);
    while (p && !Object.prototype.hasOwnProperty.call(p, name)) p = Object.getPrototypeOf(p);
    return p;
  };
  const held = {};
  const owners = {};
  for (const [name, bucket] of [
    ['_rebuildWorld', 'merge'], ['_navLattice', 'lattice'], ['_navPasses', 'passes'],
    ['_buildPicture', 'picture'], ['collectPass', 'collect'],
  ]) {
    owners[name] = ownerOf(name);
    held[name] = owners[name][name];
    owners[name][name] = function (...args) {
      const s = performance.now();
      const r = held[name].apply(this, args);
      const d = performance.now() - s;
      if (cur) {
        if (name === 'collectPass' && args[1]) cur[args[1].owners ? 'picData' : 'data'] += d;
        else if (name !== 'collectPass') cur[bucket] += d;
      }
      return r;
    };
  }
  for (const [id, d] of data) {
    cur = { id, loaded: map.loaded.size, data: 0, picData: 0, merge: 0, lattice: 0, passes: 0, picture: 0 };
    const s = performance.now();
    map.applyChunk(id, d);
    cur.apply = +(performance.now() - s).toFixed(1);
    rows.push(cur);
  }
  for (const name of Object.keys(held)) owners[name][name] = held[name];
  const rnd = (o) => Object.fromEntries(Object.entries(o)
    .map(([k, x]) => [k, typeof x === 'number' ? +x.toFixed(1) : x]));
  return rows.map(rnd);
});
for (const r of out) console.log(JSON.stringify(r));
await browser.close();
server.close();
