/**
 * Мера естественных срезов достройки — чем этап 4 закрывает § 7.2 п. 3
 * («проверим, чем влезает: меньшей клеткой или растяжкой на кадры»).
 *
 * Отличия от первого промера (.tmp/slice-cost.mjs):
 * 1. владелец меряемого имени берётся из цепочки прототипов самого экземпляра
 *    (`ownerOf`), а не из ручной таблицы слоёв: прошлый промер писал 0 для всех
 *    имён `JsonMap` (`_navLattice`, `_buildPicture`, `_collectAnchors`, фазы
 *    графа, `_release`) — «нет цены» выглядело как «атом дешёвый»;
 * 2. полосование решётки мерится ПОСЛЕ commit-а данных клетки: до него
 *    `WorldMap.isBlocked` истинен в любой точке незастроенной клетки, и полосы
 *    не добавляли ни одного узла (прошлый промер дал 951 узел при любом R);
 * 3. срезы конвейера (данные → commit → решётка → фазы графа → картинка) меряются
 *    по одному, и сумма сравнивается с атомарным `applyChunk`: нужен самый
 *    дорогой естественный атом, чтобы `budgetMs` был назначен замером.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/slice-cost2.mjs
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
  const { DATA_SINKS } = await import('/src/surfaces.js' + v);
  const { CONFIG } = await import('/src/config.js' + v);

  const DRAWN_INPUTS = ['buildings', 'roads', 'channels', 'props', 'lights'];
  const f = (x) => +Number(x ?? 0).toFixed(2);

  /** Класс, чей прототип определяет имя, — из цепочки самого экземпляра. */
  const ownerOf = (obj, name) => {
    let p = Object.getPrototypeOf(obj);
    while (p && p !== Object.prototype) {
      if (Object.prototype.hasOwnProperty.call(p, name)) return p;
      p = Object.getPrototypeOf(p);
    }
    throw new Error(`'${name}' нет в цепочке прототипов карты`);
  };

  const meter = (map, names) => {
    const ms = {}, calls = {}, restore = [];
    for (const name of names) {
      const owner = ownerOf(map, name);
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
    return {
      ms, calls,
      owners: Object.fromEntries(names.map((n) => [n, ownerOf(map, n).constructor.name])),
      stop: () => restore.forEach(([o, n, x]) => { o[n] = x; }),
    };
  };

  const mk = () => {
    const m = new WorldMap({ ...OPEN_600.map, catalog: '/probe/open-600' });
    m.build(new THREE.Scene());
    return m;
  };
  const cells = OPEN_600.map.cells;
  const data = [];
  for (const c of cells) data.push([c.id, await (await fetch(mk().chunkUrl(c.id))).json()]);

  /** Срез «данные + commit» — состояние конвейера ДО решётки: записи клетки уже
   *  в мировом наборе и индексах (значит `isBlocked` внутри неё честен), но
   *  ни узлов, ни мешей. Это шаг 1 `applyChunk` плюс шаг 2a. */
  const commitData = (map, id, d) => {
    const cell = map.cellById.get(id);
    const records = map.collectPass(d, { sinks: DATA_SINKS, geo: null });
    const owned = new Set();
    for (const key of DRAWN_INPUTS) {
      for (const rec of d[key] ?? []) if (rec.owner === true) owned.add(rec);
    }
    map.loaded.set(id, { cell, data: d, records, owned, pic: null, counts: {} });
    map._rebuildWorld();
  };

  const ALL = ['_setInputs', '_indexPlans', 'indexSolids', '_indexSurfaces', '_indexBlockers',
    '_boundsOf', '_collectAnchors', '_rebuildWorld', '_navLattice', '_navPasses',
    '_navRooms', '_navRoofs', '_navStairs', '_navDecks', '_navWater', '_navDoors',
    '_buildPicture', 'collectPass', '_drawOwnersOnly', '_geoGroups', '_release', '_sumCounters'];

  // ── 1. расклад одной достройки по членам (те же имена, что в прошлом промере)
  const PARTS = ALL.filter((n) => !['_rebuildWorld', '_drawOwnersOnly', '_geoGroups', '_sumCounters'].includes(n));
  const rows = [];
  const owners = {};
  {
    const map = mk();
    const mt = meter(map, ALL);
    Object.assign(owners, mt.owners);
    for (const [id, d] of data) {
      const from = Object.fromEntries(ALL.map((k) => [k, mt.ms[k] ?? 0]));
      const s = performance.now();
      map.applyChunk(id, d);
      const apply = performance.now() - s;
      const dt = Object.fromEntries(PARTS.map((k) => [k, f((mt.ms[k] ?? 0) - from[k])]));
      const merge = f(dt._setInputs + dt._indexPlans + dt.indexSolids + dt._indexSurfaces
        + dt._indexBlockers + dt._boundsOf + dt._collectAnchors);
      rows.push({ id, loaded: map.loaded.size, solids: map.solids.length, nodes: map.nav.pos.length, apply: f(apply), merge, ...dt });
    }
    mt.stop();
  }

  // ── 2. полосование решётки: цена и совпадение сети с цельноклеточной
  const strip = [];
  {
    const c00 = data.find(([id]) => id === '0_0');
    const c01 = data.find(([id]) => id === '0_1');
    const rect = cells.find((c) => c.id === c01[0]).rect;
    const step = CONFIG.jsonMap.navStep;
    const stat = (m) => ({ nodes: m.nav.pos.length, links: m.nav.adj.reduce((a, l) => a + l.length, 0), keys: m.nav.byKey.size });

    for (const R of ['whole', 1, 2, 4, 8, 16, 34]) {
      const m = mk();
      m.applyChunk(c00[0], c00[1]);
      const afterC00 = { ...stat(m) };
      commitData(m, c01[0], c01[1]);
      const mt = meter(m, ['_navLattice', '_navPasses']);
      const s = performance.now();
      let calls = 0;
      if (R === 'whole') m._navLattice(m.nav, rect);
      else {
        for (let z0 = rect.minZ; z0 < rect.maxZ; z0 += R * step) {
          calls++;
          m._navLattice(m.nav, {
            minX: rect.minX, maxX: rect.maxX,
            minZ: z0, maxZ: Math.min(rect.maxZ, z0 + R * step),
          });
        }
      }
      m._navPasses();
      strip.push({
        rows: R, strips: calls, totalMs: f(performance.now() - s),
        latticeMs: f(mt.ms._navLattice), perStripMs: f((mt.ms._navLattice ?? 0) / (calls || 1)),
        passesMs: f(mt.ms._navPasses), ...stat(m), afterC00,
      });
      mt.stop();
    }
    const ref = mk();
    ref.applyChunk(c00[0], c00[1]);
    ref.applyChunk(c01[0], c01[1]);
    const want = { ...stat(ref) };
    strip.push({ rows: 'reference-applyChunk', ...want });
    for (const r of strip) {
      if (r.afterC00) r.sameNetwork = (r.nodes === want.nodes && r.links === want.links && r.keys === want.keys);
    }
  }

  // ── 3. срезы конвейера по одной клетке, в середине прогона (окно частично занято)
  const slices = [];
  {
    const m = mk();
    m.applyChunk(data[0][0], data[0][1]);
    m.applyChunk(data[1][0], data[1][1]);
    const [id, d] = data[4];
    const cell = m.cellById.get(id);
    const t = {};
    const at = (label, fn) => { const s = performance.now(); const r = fn(); t[label] = f(performance.now() - s); return r; };
    const records = at('s1_collectPassData', () => m.collectPass(d, { sinks: DATA_SINKS, geo: null }));
    const owned = new Set();
    for (const key of DRAWN_INPUTS) for (const rec of d[key] ?? []) if (rec.owner === true) owned.add(rec);
    at('s2_commit', () => {
      m.loaded.set(id, { cell, data: d, records, owned, pic: null, counts: {} });
      m._rebuildWorld();
    });
    at('s3_lattice', () => m._navLattice(m.nav, cell.rect));
    at('s4_passes', () => m._navPasses());
    const groups = at('s5_geoGroups', () => m._geoGroups());
    const pic = at('s6_picture', () => {
      const pass = m.collectPass(d, { sinks: ['waterRects'], geo: groups, owners: true, own: owned });
      return m._buildPicture(m.scene, groups, cell.rect, pass.waterRects);
    });
    at('s7_counters', () => m._sumCounters());
    slices.push({
      id, windowBefore: 2, meshes: pic.objs.length,
      sumOfSlices: f(Object.values(t).reduce((a, x) => a + x, 0)), ...t,
    });
    // та же клетка целиком, обычным applyChunk — сумма срезов сравнивается с атомарным проходом
    const m2 = mk();
    m2.applyChunk(data[0][0], data[0][1]);
    m2.applyChunk(data[1][0], data[1][1]);
    const s2 = performance.now();
    m2.applyChunk(id, d);
    slices.push({ id, mode: 'applyChunk-atomic', applyMs: f(performance.now() - s2), meshes: m2.loaded.get(id).pic.objs.length });
  }

  // ── 4. фазы на заполненном окне (самый дорогой естественный атом)
  const phases = {};
  {
    const m = mk();
    for (const [id, d] of data) m.applyChunk(id, d);
    const time = (fn) => { const s = performance.now(); fn(); return f(performance.now() - s); };
    const mt = meter(m, ['_navRooms', '_navRoofs', '_navStairs', '_navDecks', '_navWater', '_navDoors', '_release']);
    phases.wholeWindow = {
      lattice9cells: time(() => { for (const c of cells) m._navLattice(m.nav, c.rect); }),
      passes: time(() => m._navPasses()),
      merge: time(() => m._rebuildWorld()),
      anchorsWholePlate: time(() => m._collectAnchors(null)),
    };
    phases.passPhasesMs = Object.fromEntries(Object.entries(mt.ms).map(([k, x]) => [k, f(x)]));
    const one = m.loaded.get('1_1');
    phases.unloadOne = {
      releaseOnly: time(() => m._release(one.pic.objs, one.pic.lights)),
      unloadChunk: time(() => m.unloadChunk('1_1')),
    };
    phases.counts = {
      nodes: m.nav.pos.length, links: m.nav.adj.reduce((a, l) => a + l.length, 0),
      solids: m.solids.length, meshes: [...m.loaded.values()].reduce((a, e) => a + (e.pic?.objs.length ?? 0), 0),
    };
    mt.stop();
  }

  return { owners, rows, strip, slices, phases };
});

console.log('=== 0. где живёт каждый меряемый член ===');
console.log(JSON.stringify(out.owners));
console.log('=== 1. расклад одной достройки по членам (мс) ===');
for (const r of out.rows) console.log(JSON.stringify(r));
console.log('=== 2. полосование решётки (после commit данных) ===');
for (const r of out.strip) console.log(JSON.stringify(r));
console.log('=== 3. срезы конвейера по одной клетке ===');
for (const r of out.slices) console.log(JSON.stringify(r));
console.log('=== 4. фазы на заполненном окне ===');
console.log(JSON.stringify(out.phases));
await browser.close();
server.close();
