/**
 * Одноразовая диагностика: есть ли в графе достроенного мира рёбра, которые
 * отказывается признать поле **итогового** набора клеток (то есть рёбра,
 * созданные, когда соседа ещё не было), и сколько их при разных порядках.
 *
 * Запуск: node .tmp/nav-stale.mjs
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
  const { OPEN_600 } = await import('/probe/open-600/index.js?v=' + Date.now());
  const { WorldMap } = await import('/src/world-map.js?v=' + Date.now());
  const cells = OPEN_600.map.cells;

  const mk = async (ids) => {
    const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    map.build(new THREE.Scene());
    for (const id of ids) await map.loadChunk(id);
    return map;
  };
  /** рёбра, которые поле итогового набора клеток уже не признаёт */
  const staleOf = (map) => {
    const nav = map.nav;
    const keyOf = new Map();
    for (const [k, i] of nav.byKey) keyOf.set(i, k);
    const bad = [];
    for (const [k, i] of nav.byKey) {
      for (const j of nav.adj[i]) {
        if (j <= i) continue;
        if (!map.edgeOk(nav.pos[i], nav.pos[j])) bad.push(`${k}~${keyOf.get(j)}`);
      }
    }
    return bad;
  };
  const edgeSet = (map) => {
    const nav = map.nav;
    const keyOf = new Map();
    for (const [k, i] of nav.byKey) keyOf.set(i, k);
    const s = new Set();
    for (const [k, i] of nav.byKey) for (const j of nav.adj[i]) if (keyOf.get(j) > k) s.add(`${k}~${keyOf.get(j)}`);
    return s;
  };

  const subset = [cells[0].id, cells[4].id, cells[8].id, cells[3].id];
  const a = await mk(subset);
  const b = await mk([...subset].reverse());
  const all = await mk(cells.map((c) => c.id));
  const sa = edgeSet(a), sb = edgeSet(b);
  const staleA = staleOf(a), staleB = staleOf(b), staleAll = staleOf(all);

  /** компоненты + расстояния в рёбрах от стартового узла: что реально видит маршрут */
  const reachOf = (map) => {
    const nav = map.nav;
    const start = nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z);
    const d = new Map([[start, 0]]);
    const q = [start];
    while (q.length) {
      const i = q.shift();
      for (const j of nav.adj[i]) if (!d.has(j)) { d.set(j, d.get(i) + 1); q.push(j); }
    }
    const keyOf = new Map();
    for (const [k, i] of nav.byKey) keyOf.set(i, k);
    const out = new Map();
    for (const [i, steps] of d) out.set(keyOf.get(i), steps);
    return { reached: out.size, dist: out, maxSteps: Math.max(...out.values()) };
  };
  // компоненты всего графа
  const compsOf = (map) => {
    const nav = map.nav;
    const seen = new Set();
    const comps = [];
    for (const [, i] of nav.byKey) {
      if (seen.has(i)) continue;
      const q = [i];
      seen.add(i);
      let n = 0;
      while (q.length) {
        const k = q.pop();
        n++;
        for (const j of nav.adj[k]) if (!seen.has(j)) { seen.add(j); q.push(j); }
      }
      comps.push(n);
    }
    return comps.sort((x, y) => y - x);
  };
  const ra = reachOf(a), rb = reachOf(b);
  let distDiff = 0, worst = null;
  for (const [k, d] of ra.dist) {
    const e = rb.dist.get(k);
    if (e === undefined) { distDiff++; continue; }
    if (e !== d) { distDiff++; if (!worst || Math.abs(e - d) > worst.delta) worst = { key: k, a: d, b: e, delta: Math.abs(e - d) }; }
  }
  for (const k of rb.dist.keys()) if (!ra.dist.has(k)) distDiff++;

  // весь мир одной сборкой (тот же набор клеток, но 9 достроек против эталона)

  return {
    subset,
    nodes: [a.nav.byKey.size, b.nav.byKey.size, all.nav.byKey.size],
    edges: [sa.size, sb.size, edgeSet(all).size],
    diffAB: [...sa].filter((x) => !sb.has(x)).length,
    diffBA: [...sb].filter((x) => !sa.has(x)).length,
    staleA: staleA.length, staleB: staleB.length, staleAll: staleAll.length,
    compsA: compsOf(a), compsB: compsOf(b), compsAll: compsOf(all),
    reached: [ra.reached, rb.reached], maxSteps: [ra.maxSteps, rb.maxSteps],
    distDiff, worst,
    sampleStaleA: staleA.slice(0, 8),
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
