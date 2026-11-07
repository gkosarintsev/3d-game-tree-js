/**
 * Мера естественных срезов достройки — то, чем этап 4 закрывает § 7.2 п. 3
 * («проверим, чем влезает: меньшей клеткой или растяжкой на кадры»).
 *
 * Что именно мерится:
 * 1. расклад `merge` (`_rebuildWorld`) на конкатенацию, четыре индекса, габарит
 *    и якоря — потому что атомарность среза решает, какой `budgetMs` достижим;
 * 2. цена полос `_navLattice` и совпадение сети с цельноклеточным вызовом —
 *    полосование решётки законно только если рёбра шва полоса находит сама;
 * 3. цена одной записи в каждом индексе — нужна ли batches внутри индекса;
 * 4. `_navPasses` по фазам и `_release` по мешам — мелкие члены.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/slice-cost.mjs
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
  const { JsonMap } = await import('/src/json-map.js' + v);
  const { CONFIG } = await import('/src/config.js' + v);

  /** Временные обёртки по явному прототипу: `super.x()` внутри `_rebuildWorld`
   *  идёт мимо подкласса, поэтому слой указан для каждого имени. */
  /** Прототипы — из цепочки самой карты: `JsonMap`, импортированный со своим
   *  `?v=`, был бы вторым экземпляром модуля, и обёртка на его прототипе не
   *  поймала бы ни одного вызова (`_navLattice`, картинка, якоря). */
  const WorldMapProto = WorldMap.prototype;
  const JsonMapProto = Object.getPrototypeOf(WorldMapProto);
  const protos = {
    WorldMap: WorldMapProto,
    JsonMap: JsonMapProto,
    SurfaceField: Object.getPrototypeOf(JsonMapProto),
    SolidField: Object.getPrototypeOf(Object.getPrototypeOf(JsonMapProto)),
  };
  const WHERE = {
    _setInputs: 'SurfaceField', _indexPlans: 'SurfaceField', _indexBlockers: 'SurfaceField',
    _indexSurfaces: 'SolidField', indexSolids: 'SolidField',
    _boundsOf: 'WorldMap', _collectAnchors: 'JsonMap',
    _navLattice: 'JsonMap', _navPasses: 'WorldMap', _buildPicture: 'JsonMap', collectPass: 'SurfaceField',
    _navRooms: 'JsonMap', _navRoofs: 'JsonMap', _navStairs: 'JsonMap', _navDecks: 'JsonMap',
    _navWater: 'JsonMap', _navDoors: 'JsonMap', _release: 'JsonMap', _rebuildWorld: 'WorldMap',
  };
  const meter = (map, names) => {
    const ms = {}, calls = {}, restore = [];
    for (const name of names) {
      const owner = protos[WHERE[name] ?? 'WorldMap'];
      if (!Object.prototype.hasOwnProperty.call(owner, name)) {
        throw new Error(`'${name}' не определён в ${WHERE[name] ?? 'WorldMap'}`);
      }
      const inner = owner[name];
      owner[name] = function (...args) {
        const s = performance.now();
        const r = inner.apply(this, args);
        ms[name] = (ms[name] ?? 0) + (performance.now() - s);
        calls[name] = (calls[name] ?? 0) + 1;
        return r;
      };
      restore.push([owner, name, inner]);
    }
    return { ms, calls, stop: () => restore.forEach(([o, n, f]) => { o[n] = f; }) };
  };

  const mk = () => {
    const m = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    m.build(new THREE.Scene());
    return m;
  };
  const cells = OPEN_600.map.cells;
  const data = [];
  for (const c of cells) data.push([c.id, await (await fetch(mk().chunkUrl(c.id))).json()]);

  // ── 1. расклад одной достройки по членам
  const MERGE_PARTS = ['_setInputs', '_indexPlans', 'indexSolids', '_indexSurfaces',
    '_indexBlockers', '_boundsOf', '_collectAnchors'];
  const PARTS = [...MERGE_PARTS, '_navLattice', '_navPasses', '_buildPicture', 'collectPass',
    '_navRooms', '_navRoofs', '_navStairs', '_navDecks', '_navWater', '_navDoors'];
  const rows = [];
  {
    const map = mk();
    const mt = meter(map, PARTS);
    const f = (x) => +((x ?? 0).toFixed ? x.toFixed(1) : 0);
    for (const [id, d] of data) {
      const from = Object.fromEntries(PARTS.map((k) => [k, mt.ms[k] ?? 0]));
      const s = performance.now();
      map.applyChunk(id, d);
      const apply = performance.now() - s;
      const delta = Object.fromEntries(PARTS.map((k) => [k, (mt.ms[k] ?? 0) - from[k]]));
      rows.push({
        id,
        loaded: map.loaded.size,
        solids: map.solids.length,
        merge: f(delta._setInputs + delta._indexPlans + delta.indexSolids
          + delta._indexSurfaces + delta._indexBlockers + delta._boundsOf + delta._collectAnchors),
        parts: Object.fromEntries(Object.entries(delta).map(([k, x]) => [k, f(x)])),
        anchorCalls: mt.calls._collectAnchors ?? 0,
        apply: f(apply),
      });
    }
    mt.stop();
  }

  // ── 2. полосование решётки: та ли сеть
  const strip = [];
  {
    const [c00id, c00] = data.find(([id]) => id === '0_0');
    const [c01id, c01] = data.find(([id]) => id === '0_1');
    const rect = cells.find((c) => c.id === c01id).rect;
    const step = CONFIG.jsonMap.navStep;
    const stat = (m) => ({
      nodes: m.nav.pos.length,
      links: m.nav.adj.reduce((a, l) => a + l.length, 0),
      keys: [...new Set(Object.keys(m.nav.byKey))].length,
    });
    for (const R of ['whole', 1, 4, 8, 16]) {
      const m = mk();
      m.applyChunk(c00id, c00);
      const mt = meter(m, ['_navLattice', '_navPasses']);
      const s = performance.now();
      if (R === 'whole') m._navLattice(m.nav, rect);
      else {
        for (let z0 = rect.minZ; z0 < rect.maxZ; z0 += R * step) {
          m._navLattice(m.nav, {
            minX: rect.minX, maxX: rect.maxX,
            minZ: z0, maxZ: Math.min(rect.maxZ, z0 + R * step),
          });
        }
      }
      m._navPasses();
      strip.push({ rows: R, ms: +(performance.now() - s).toFixed(1), lattice: +(mt.ms._navLattice ?? 0).toFixed(1), ...stat(m) });
      mt.stop();
    }
    // эталон: обе клетки целиком, одним applyChunk на каждую
    const ref = mk();
    ref.applyChunk(c00id, c00);
    ref.applyChunk(c01id, c01);
    strip.push({ rows: 'reference-applyChunk', ...stat(ref) });
  }

  // ── 3. цена одной записи индекса на заполненном окне
  const perRecord = {};
  {
    const m = mk();
    for (const [id, d] of data) m.applyChunk(id, d);
    const time = (fn) => { const s = performance.now(); fn(); return +(performance.now() - s).toFixed(1); };
    const counts = {
      solids: m.solids.length, surfaces: m.surfaces.length, blockers: m.blockers.length,
      buildings: m.buildings.length, prisms: m.prisms.length, holes: m.holes.length,
      railWedges: m.railWedges.length, sweeps: m.sweeps.length, deckPlates: m.deckPlates.length,
    };
    const t = {
      solids: time(() => m.indexSolids()),
      surfaces: time(() => m._indexSurfaces()),
      blockers: time(() => m._indexBlockers()),
      plans: time(() => m._indexPlans()),
      anchorsWholePlate: time(() => m._collectAnchors(null)),
      inputs: time(() => m._setInputs({ buildings: m.buildings, roads: m.roads, channels: m.channels })),
      mergeWhole: time(() => m._rebuildWorld()),
    };
    perRecord.counts = counts;
    perRecord.ms = t;
    perRecord.perRecordUsec = {
      solids: +(t.solids * 1000 / counts.solids).toFixed(2),
      surfaces: +(t.surfaces * 1000 / counts.surfaces).toFixed(2),
      blockers: +(t.blockers * 1000 / counts.blockers).toFixed(2),
    };
  }

  // ── 4. выгрузка: цена снятия мешей отдельно от пересборки
  const release = { cells: 0, objs: 0, releaseMs: 0, unloadMs: 0 };
  {
    const m = mk();
    for (const [id, d] of data) m.applyChunk(id, d);
    const mt = meter(m, ['_release', '_rebuildWorld']);
    const s = performance.now();
    for (const id of [...m.loaded.keys()]) {
      release.objs += m.loaded.get(id).pic.objs.length;
      release.cells++;
      m.unloadChunk(id);
    }
    release.unloadMs = +(performance.now() - s).toFixed(1);
    release.releaseMs = +(mt.ms._release ?? 0).toFixed(1);
    release.rebuildMs = +(mt.ms._rebuildWorld ?? 0).toFixed(1);
    mt.stop();
  }

  return { rows, strip, perRecord, release };
});

console.log('=== 1. расклад одной достройки по членам (мс) ===');
for (const r of out.rows) console.log(JSON.stringify(r));
console.log('=== 2. полосование решётки ===');
for (const r of out.strip) console.log(JSON.stringify(r));
console.log('=== 3. цена индексов на заполненном окне ===');
console.log(JSON.stringify(out.perRecord));
console.log('=== 4. выгрузка ===');
console.log(JSON.stringify(out.release));
await browser.close();
server.close();
