/**
 * Три одиночных узла загруженного окна 3×3 — свойство данных или следствие
 * достройки по чанкам. Эталон («тот же город одним `JsonMap`») сравнивается по
 * ПОЗИЦИЯМ, а не по ключам: `_pruneToSpawn` пересобирает граф вызовом
 * `out.add(x, y, z)` без ключа, поэтому у эталона `byKey` пуст по построению.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/orphans3.mjs
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

  // --- мир из 9 клеток (стриминг, append-only граф)
  const map = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
  map.build(new THREE.Scene());
  for (const c of cells) await map.loadChunk(c.id);
  const nav = map.nav;
  const seen = new Set(); const comps = [];
  const keyOf = new Map([...nav.byKey.entries()].map(([k, i]) => [i, k]));
  for (const [, i] of nav.byKey) {
    if (seen.has(i)) continue;
    const q = [i]; seen.add(i); const members = [i];
    while (q.length) { const k = q.pop(); for (const j of nav.adj[k]) if (!seen.has(j)) { seen.add(j); members.push(j); q.push(j); } }
    comps.push(members);
  }
  comps.sort((a, b) => b.length - a.length);
  const orphanIdx = comps.filter((m) => m.length === 1).map((m) => m[0]);

  // --- эталон: тот же город, собранный одним JsonMap (с _pruneToSpawn)
  const spec = { kind: 'json2', units: 'meters', ground: OPEN_600.map.ground, bounds: OPEN_600.map.bounds,
    spawn: OPEN_600.map.spawn, windows: OPEN_600.map.windows, clutter: OPEN_600.map.clutter, signage: OPEN_600.map.signage };
  for (const k of COLLECTIONS) spec[k] = [];
  for (const c of cells) {
    const d = await (await fetch(`/probe/open-600/${c.file}`)).json();
    for (const k of COLLECTIONS) for (const rec of d[k] ?? []) if (rec.owner === true) spec[k].push(rec);
  }
  const whole = new JsonMap(spec);
  whole.build(new THREE.Scene());
  const wp = whole.nav.pos;
  const nearestWhole = (p) => {
    let best = -1, bd = Infinity;
    for (let i = 0; i < wp.length; i++) {
      const d = Math.hypot(wp[i].x - p.x, wp[i].y - p.y, wp[i].z - p.z);
      if (d < bd) { bd = d; best = i; }
    }
    return { i: best, d: +bd.toFixed(4) };
  };
  const detail = orphanIdx.map((i) => {
    const p = nav.pos[i];
    const cand = nav.nearby(p.x, p.z, 12).filter((j) => j !== i);
    const nw = nearestWhole(p);
    return {
      key: keyOf.get(i), x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2),
      deg: nav.adj[i].length, near12: cand.length,
      nearOk: cand.filter((j) => map.edgeOk(p, nav.pos[j])).length,
      inWhole: nw.d < 1e-6, wholeNearestDist: nw.d,
      wholeDeg: nw.d < 1e-6 ? whole.nav.adj[nw.i].length : null,
    };
  });

  // сколько узлов стримингового графа нет в отрезанном эталоне, и наоборот —
  // квантованным ключом позиции, а не O(n²) поиском соседа
  const pk = (p) => `${p.x.toFixed(6)}|${p.y.toFixed(6)}|${p.z.toFixed(6)}`;
  const wholeKeys = new Set(wp.map(pk));
  const streamKeys = new Set(nav.pos.map(pk));
  let inStreamNotWhole = 0;
  for (const k of streamKeys) if (!wholeKeys.has(k)) inStreamNotWhole++;
  let wholeNotStream = 0;
  for (const k of wholeKeys) if (!streamKeys.has(k)) wholeNotStream++;

  return {
    streamed: { nodes: nav.byKey.size, comps: comps.length, sizes: comps.map((m) => m.length).slice(0, 8) },
    whole: { nodes: wp.length, byKey: whole.nav.byKey.size },
    spawnCompSize: (comps.find((m) => m.includes(nav.nearestNode(map.spawn.x, map.spawn.y, map.spawn.z))) || []).length,
    orphanCount: orphanIdx.length, detail,
    streamUniquePos: streamKeys.size, wholeUniquePos: wholeKeys.size,
    inStreamNotWhole, wholeNotStream,
  };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
