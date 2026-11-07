/**
 * Замер цены отвергнутой альтернативы: полная переразметка графа загруженного
 * окна на каждой достройке (строгий детерминизм выбора рёбер) против сегодняшнего
 * дополнения append-only.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/nav-rederive.mjs
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
  const cells = OPEN_600.map.cells;
  const ids = cells.map((c) => c.id);

  const mk = () => {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    return map;
  };

  // 1. сегодняшнее дополнение: суммарное время навигационной части всех 9 достроек
  const inc = mk();
  const incRows = [];
  for (const id of ids) {
    const s = performance.now();
    await inc.loadChunk(id);
    incRows.push(+(performance.now() - s).toFixed(1));
  }

  // 2. полная переразметка: та же карта, но перед каждой достройкой граф
  //    собирается заново по всем уже загруженным клеткам окна
  const re = mk();
  const reRows = [];
  let reNavMs = 0;
  for (const id of ids) {
    const s = performance.now();
    await re.loadChunk(id);
    // переразметка: новый граф поверх всего загруженного набора клеток
    const t = performance.now();
    const nav = re._buildNav();
    re.nav = nav;
    for (const c of re.cells) if (re.loaded.has(c.id)) re._navLattice(nav, c.rect);
    re._navPasses();
    reNavMs += performance.now() - t;
    reRows.push(+(performance.now() - s).toFixed(1));
  }

  const sum = (a) => +a.reduce((x, y) => x + y, 0).toFixed(0);
  return {
    incTotalMs: sum(incRows),
    incFirst: incRows[0], incWorst: Math.max(...incRows),
    reTotalMs: sum(reRows),
    reNavOnlyMs: +reNavMs.toFixed(0),
    reFirst: reRows[0], reWorst: Math.max(...reRows),
    nodesInc: inc.nav.byKey.size, nodesRe: re.nav.byKey.size,
    edgesInc: inc.nav.adj.reduce((s2, a) => s2 + a.length, 0) / 2,
    edgesRe: re.nav.adj.reduce((s2, a) => s2 + a.length, 0) / 2,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
