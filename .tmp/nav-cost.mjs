/**
 * Одноразовая диагностика цены: сколько стоила бы полная переразметка графа
 * загруженного окна на каждой достройке против сегодняшнего дополнения.
 *
 * Запуск: node .tmp/nav-cost.mjs
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
  const THREE = await import('three');
  const v = '?v=' + Date.now();
  const { OPEN_600 } = await import('/probe/open-600/index.js' + v);
  const { WorldMap } = await import('/src/world-map.js' + v);
  const { CONFIG } = await import('/src/config.js' + v);
  const J = CONFIG.jsonMap;
  const cells = OPEN_600.map.cells;
  const ids = cells.map((c) => c.id);

  const mk = async (list) => {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    for (const id of list) await map.loadChunk(id);
    return map;
  };

  // 1. сколько стоит решётка и фазы навигации на окне целиком, одной переразметкой
  const full = await mk(ids);
  const t = performance.now();
  for (const id of ids) full._navLattice(full.nav, full.cellById.get(id).rect);
  const lattice9 = performance.now() - t;
  const t2 = performance.now();
  full._navPasses();
  const passes9 = performance.now() - t2;
  const t3 = performance.now();
  full._rebuildWorld();
  const merge9 = performance.now() - t3;

  // 2. сегодняшнее дополнение: сумма цен решётки/фаз по всем 9 достройкам
  const acc = { lattice: 0, passes: 0, merge: 0, total: 0 };
  const proto = WorldMap.prototype;
  const held = {};
  for (const [name, bucket] of [['_navLattice', 'lattice'], ['_navPasses', 'passes'], ['_rebuildWorld', 'merge']]) {
    held[name] = proto[name];
    proto[name] = function (...args) {
      const s = performance.now();
      const r = held[name].apply(this, args);
      acc[bucket] += performance.now() - s;
      return r;
    };
  }
  const t4 = performance.now();
  const inc = await mk(ids);
  acc.total = performance.now() - t4;
  for (const name of Object.keys(held)) proto[name] = held[name];

  // 3. цена переразметки на окне 3×3, если её делать на каждой достройке:
  //    k-я достройка платит решётку и фазы по всем k загруженным клеткам
  const per = { lattice: lattice9 / 9, passes: passes9 / 9 };
  let rederiveTotal = 0;
  for (let k = 1; k <= 9; k++) rederiveTotal += per.lattice * k + per.passes * k;

  return {
    nodes: full.nav.byKey.size,
    lattice9: +lattice9.toFixed(0), passes9: +passes9.toFixed(0), merge9: +merge9.toFixed(0),
    incremental: { lattice: +acc.lattice.toFixed(0), passes: +acc.passes.toFixed(0), merge: +acc.merge.toFixed(0), total: +acc.total.toFixed(0) },
    rederiveEstimated: +rederiveTotal.toFixed(0),
    factor: +(rederiveTotal / (acc.lattice + acc.passes)).toFixed(2),
    nodesSame: full.nav.byKey.size === inc.nav.byKey.size,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
