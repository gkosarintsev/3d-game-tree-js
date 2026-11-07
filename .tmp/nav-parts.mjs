/**
 * Одноразовая диагностика: совпадает ли РАЗБИЕНИЕ на компоненты при двух
 * порядках достройки (узлы сравниваются ключами), и чем отличаются длины
 * маршрутов между одними и теми же точками.
 *
 * Запуск: node .tmp/nav-parts.mjs
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
  const cells = OPEN_600.map.cells;
  const mk = async (list) => {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    for (const id of list) await map.loadChunk(id);
    return map;
  };
  /** ключ узла → id компоненты (по размеру и минимальному ключу — каноническая метка) */
  const partition = (map) => {
    const nav = map.nav;
    const keyOf = new Map();
    for (const [k, i] of nav.byKey) keyOf.set(i, k);
    const seen = new Set();
    const byKey = new Map();
    const groups = [];
    for (const [k, i] of nav.byKey) {
      if (seen.has(i)) continue;
      const q = [i];
      seen.add(i);
      const members = [];
      while (q.length) {
        const cur = q.pop();
        members.push(keyOf.get(cur));
        for (const j of nav.adj[cur]) if (!seen.has(j)) { seen.add(j); q.push(j); }
      }
      members.sort();
      groups.push(members);
    }
    groups.sort((a, b) => (b.length - a.length) || (a[0] < b[0] ? -1 : 1));
    groups.forEach((g, n) => g.forEach((k) => byKey.set(k, n)));
    return { byKey, sizes: groups.map((g) => g.length) };
  };
  const routeMeters = (map, fromKey, toKey) => {
    const nav = map.nav;
    const i = nav.byKey.get(fromKey), j = nav.byKey.get(toKey);
    if (i === undefined || j === undefined) return null;
    const route = map.findPath(nav.pos[i], nav.pos[j]);
    if (!route) return null;
    let m = 0;
    for (let k = 1; k < route.length; k++) m += Math.hypot(route[k].x - route[k - 1].x, route[k].z - route[k - 1].z);
    return { nodes: route.length, m: +m.toFixed(1) };
  };

  const subset = [cells[0].id, cells[4].id, cells[8].id, cells[3].id];
  const a = await mk(subset);
  const b = await mk([...subset].reverse());
  const pa = partition(a), pb = partition(b);
  let partDiff = 0;
  for (const [k, n] of pa.byKey) if (pb.byKey.get(k) !== n) partDiff++;
  const all9 = await mk(cells.map((c) => c.id));
  const p9 = partition(all9);
  // пары точек для маршрутов: спавн и узлы из других клеток
  const probes = [];
  const keys = [...a.nav.byKey.keys()];
  const pick = (n) => keys[Math.floor((n * keys.length) / 7)];
  for (let n = 0; n < 7; n++) probes.push([pick(n), pick(6 - n)]);
  const routes = probes.map(([x, y]) => ({ pair: `${x}~${y}`, a: routeMeters(a, x, y), b: routeMeters(b, x, y), all: routeMeters(all9, x, y) }));
  return {
    sizesA: pa.sizes.slice(0, 6), sizesB: pb.sizes.slice(0, 6), sizes9: p9.sizes.slice(0, 6),
    sizesEqual: JSON.stringify(pa.sizes) === JSON.stringify(pb.sizes),
    partDiff,
    compsA: pa.sizes.length, compsB: pb.sizes.length, comps9: p9.sizes.length,
    routes,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
