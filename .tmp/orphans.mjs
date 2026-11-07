/**
 * Чем являются три одиночных узла графа при полностью загруженном окне 3×3:
 * ключи, координаты и вердикт `navFit` / `edgeOk` для ближайшего соседа.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/orphans.mjs
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
  const seen = new Set(); const comps = [];
  for (const [key, i] of nav.byKey) {
    if (seen.has(i)) continue;
    const q = [i]; seen.add(i); const members = [key];
    while (q.length) { const k = q.pop(); for (const j of nav.adj[k]) if (!seen.has(j)) { seen.add(j); const kk = [...nav.byKey.entries()].find(([, v]) => v === j)?.[0]; members.push(kk); q.push(j); } }
    comps.push(members);
  }
  comps.sort((a, b) => b.length - a.length);
  const orphans = comps.filter((m) => m.length === 1);
  const detail = orphans.map(([key]) => {
    const i = nav.byKey.get(key); const p = nav.pos[i];
    const cand = nav.nearby(p.x, p.z, 12).filter((j) => j !== i);
    const why = cand.map((j) => ({ k: key, to: j, ok: map.edgeOk(p, nav.pos[j]) }));
    return { key, x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), fit: map.navFit(i),
      near12: cand.length, nearOk: why.filter((w) => w.ok).length };
  });
  return { comps: comps.length, sizes: comps.map((m) => m.length), detail };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
server.close();
