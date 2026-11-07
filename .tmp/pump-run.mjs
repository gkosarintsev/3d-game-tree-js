/**
 * Мера помпы открытого мира — чем этап 4 закрывает § 7.2 п. 3 и назначает
 * пределы § 8 (`budgetMs`, `keep`, `aheadMin`/`aheadMax`, wall-clock до худшего
 * чанка и до играбельного окна).
 *
 * Прогон scripted: тело идёт по фикстуре с постоянной скоростью, помпа зовётся
 * ровно так, как её зовёт `Game._tick` (до физики, аргументами `budgetMs, x, z,
 * speed`), и каждый её вызов меряется `performance.now()`. Никакой настоящей
 * физики здесь нет: критерий — цена кадра *сборки*, а не шаг тела.
 *
 * Запуск: NODE_PATH=.tmp/ci/node_modules node .tmp/pump-run.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(resolve(fileURLToPath(import.meta.url), '../../.tmp/ci/node_modules/playwright'));
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.glb': 'application/octet-stream', '.png': 'image/png',
};

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
const browser = await chromium.launch({ args: ['--no-sandbox', '--enable-precise-memory-info'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.exposeFunction('say', (text) => console.log(text));
page.addInitScript(`window.__only = ${JSON.stringify(process.env.ONLY ?? '')};`);
await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load' });
await page.waitForFunction(() => window.game && typeof window.game.createMap === 'function', null, { timeout: 120000 });

const out = await page.evaluate(async () => {
  // игровой цикл глушится: `_tick` перепланирует себя через rAF, поэтому
  // замена свойства после первого кадра обрывает цепочку. Без этого каждый мой
  // кадр ждёт рендера настоящей главы (16 мс), и прогон меряет скорость
  // коммита страницы, а не помпы
  window.game._tick = () => {};
  const THREE = await import('three');
  const v = '?v=' + Date.now();
  const { OPEN_600 } = await import('/probe/open-600/index.js' + v);
  const { WorldMap } = await import('/src/world-map.js' + v);
  const { CONFIG } = await import('/src/config.js' + v);

  const f = (x) => (x === null || x === undefined ? x : +Number(x).toFixed(2));
  const med = (a) => {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y);
    return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
  };
  const q = (a, p) => {
    if (!a.length) return null;
    const s = [...a].sort((x, y) => x - y);
    return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))];
  };

  /**
   * Один прогон: ломаная длиной `distance` от `from` в направлении `heading` на
   * скорости `speed` (шаг кадра 1/60 с), `ping` — туда-обратно (без него окно
   * ни разу не обязано ничего выгрузить), `stream` — переопределённая секция
   * главы, `budget` — аргумент движка (`CONFIG.jsonMap.pump.frameBudgetMs`).
   */
  async function run(opts) {
    const spec = {
      ...OPEN_600.map,
      catalog: '/probe/open-600',
      stream: { ...OPEN_600.map.stream, budgetMs: 100, ...(opts.stream ?? {}) },
    };
    const map = new WorldMap(spec);
    const scene = new THREE.Scene();
    map.build(scene);

    // обёртка нужна одной мерой: из каких срезов сложился кадр. Снимается в
    // конце прогона, чтобы `stats` оставался числами самого класса
    const heldSlice = map._runSlice;
    let inFrame = [];
    map._runSlice = function (slice) {
      const t = performance.now();
      heldSlice.call(this, slice);
      inFrame.push(performance.now() - t);
    };

    const dt = 1 / 60;
    const total = opts.distance;
    const steps = opts.steps ?? Math.ceil(total / (opts.speed * dt));
    const x0 = opts.from.x;
    const z0 = opts.from.z;
    const ux = Math.cos(opts.heading);
    const uz = Math.sin(opts.heading);
    const leg = total / 2;
    const at = (k) => {
      const d = Math.min(total, k * opts.speed * dt);
      if (!opts.ping) return d;
      const r = d % (2 * leg);
      return r <= leg ? r : 2 * leg - r;
    };
    // кадры: `tick` — макрозадача (сеть разрешает `fetch`, но время кадра не
    // тянет), `raf` — настоящая частота 60 Гц, ей меряется wall-clock до
    // играбельного окна так, как его увидит игрок
    const frame = opts.frame === 'raf'
      ? () => new Promise((r) => requestAnimationFrame(r))
      : () => new Promise((r) => setTimeout(r, 0));

    const stepMs = [];
    const sliceMs = [];
    const workMs = [];
    let inFrameMaxMs = 0;
    let worstAtomMs = 0;
    let worstAccumMs = 0;
    let overBudget = 0;
    let workFrames = 0;
    let maxRequests = 0;
    let unbuiltFrames = 0;
    let playableAtStep = null;
    let blockedAtOwn = null;
    const spawnCell = map.spawnCell().id;

    for (let k = 0; k < steps; k++) {
      await frame();
      const d = at(k);
      const x = x0 + ux * d;
      const z = z0 + uz * d;
      inFrame = [];
      inFrameMaxMs = 0;
      const t = performance.now();
      map.streamStep(opts.budget, x, z, opts.speed);
      const ms = performance.now() - t;
      stepMs.push(ms);
      for (const s of inFrame) {
        sliceMs.push(s);
        inFrameMaxMs = Math.max(inFrameMaxMs, s);
      }
      if (inFrame.length) {
        workFrames += 1;
        workMs.push(ms);
      }
      worstAtomMs = Math.max(worstAtomMs, inFrameMaxMs);
      // накопление — всё, что кадр заплатил сверх своего самого дорогого среза;
      // его обязан ограничивать бюджет, атом неделим по построению
      worstAccumMs = Math.max(worstAccumMs, ms - inFrameMaxMs);
      if (ms > opts.budget) overBudget += 1;
      maxRequests = Math.max(maxRequests, map.pump.requests.size);

      const own = map.cellAt(x, z);
      const entry = own ? map.loaded.get(own.id) : null;
      // кадр, в котором клетка под ногами закоммичена, но картинки ещё нет, —
      // это и есть поп-ин, который платят за растяжку достройки
      if (entry && !entry.pic) unbuiltFrames += 1;
      if (entry && entry.pic && playableAtStep === null) playableAtStep = k;
      if (!entry && blockedAtOwn === null) blockedAtOwn = k;
    }
    map._runSlice = heldSlice;

    const st = map.pump.stats;
    const nodes = map.nav.pos.length;
    const links = map.nav.adj.reduce((a, l) => a + l.length, 0);
    const meshes = scene.children.filter((o) => o.isMesh || o.isInstancedMesh).length;
    const mem = performance.memory
      ? { heapMb: f(performance.memory.usedJSHeapSize / 1048576), totalMb: f(performance.memory.totalJSHeapSize / 1048576) }
      : null;
    const res = {
      case: opts.name, stream: { ...spec.stream }, budget: opts.budget, speed: opts.speed,
      steps, distance: total, ping: !!opts.ping,
      worstFrameMs: f(Math.max(...stepMs)), p99FrameMs: f(q(stepMs, 0.99)),
      medianFrameMs: f(med(stepMs)), medianWorkFrameMs: f(med(workMs)),
      idleMedianMs: f(med(stepMs.slice(-30))), workFrames, overBudget,
      worstAccumMs: f(worstAccumMs), worstAtomMs: f(worstAtomMs),
      worstSliceMs: f(sliceMs.length ? Math.max(...sliceMs) : 0),
      medianSliceMs: f(med(sliceMs)), sliceCount: sliceMs.length,
      loaded: map.loaded.size, cells: map.cells.length, radiusLast: f(map.pump.radius),
      maxRequests,
      stats: {
        slices: st.slices, built: st.built, unloaded: st.unloaded, dropped: st.dropped, errors: st.errors,
        worstSliceMs: f(st.worstSliceMs), worstSlice: st.worstSlice,
        worstChunkMs: f(st.worstChunkMs), worstChunk: st.worstChunk,
        firstChunkMs: f(st.firstChunkMs), fetchWorstMs: f(st.fetchWorstMs), fetches: st.fetches,
        lastError: st.lastError ?? null,
      },
      chunks: st.chunks.map((c) => ({ ...c, ms: f(c.ms), sinceReadMs: f(c.sinceReadMs), readyAtMs: f(c.readyAtMs) })),
      graph: { nodes, links, solids: map.solids.length, meshes, heapMb: mem },
      playableAtStep, blockedAtOwn, unbuiltFrames,
      spawnCellBuilt: !!map.loaded.get(spawnCell)?.pic,
      requestsLeft: map.pump.requests.size,
      pumpCost: Object.fromEntries([...map.pump.cost.entries()].map(([k2, x2]) => [k2, f(x2)])),
    };
    map.dispose();
    return res;
  }

  const spawn = OPEN_600.map.spawn;
  const cases = [];
  /** Прогон с печатью его же wall-clock: без неё 25 000 кадров выглядят зависанием. */
  async function one(opts) {
    const t0 = performance.now();
    const r = await run(opts);
    r.wallClockMs = Math.round(performance.now() - t0);
    window.say(`сделан: ${opts.name} — ${r.wallClockMs} мс на ${opts.steps ?? '?'} кадров`);
    return r;
  }
  // A. пешком, как глава стоит в данных: keep 0, aheadMin 40, aheadMax 300 —
  //    на плите 600 м это «загрузить весь мир» уже на первом кадре
  cases.push(await one({
    name: 'A пешком keep0 ahead 40/300, budget 8', budget: 8, speed: CONFIG.speed.run,
    from: spawn, heading: 0, distance: 400, ping: true,
  }));
  // B. тот же маршрут с бюджетом движка 12 мс (CONFIG.frameBudgetMs)
  cases.push(await one({
    name: 'B пешком keep0 ahead 40/300, budget 12', budget: 12, speed: CONFIG.speed.run,
    from: spawn, heading: 0, distance: 400, ping: true,
  }));
  // C. окно поменьше упреждением: aheadMax 120 (машина 7,5 с хода) — предельная
  //    цена commit на 4 клетках
  cases.push(await one({
    name: 'C пешком keep0 ahead 40/120, budget 12', budget: 12, speed: CONFIG.speed.run,
    from: spawn, heading: 0, distance: 400, ping: true, stream: { aheadMax: 120 },
  }));
  // D. машина на том же окне: упреждение обязано успевать за 16 м/с
  cases.push(await one({
    name: 'D машина keep0 ahead 40/120, budget 12', budget: 12, speed: CONFIG.car.maxSpeed,
    from: spawn, heading: 0, distance: 400, ping: true, stream: { aheadMax: 120 },
  }));
  // E. ring: keep 1 при малом ahead — окно 3×3, то есть весь мир, но удержание
  //    вместо перестройки туда-сюда
  cases.push(await one({
    name: 'E пешком keep1 ahead 40/120, budget 12', budget: 12, speed: CONFIG.speed.run,
    from: spawn, heading: 0, distance: 400, ping: true, stream: { keep: 1, aheadMax: 120 },
  }));
  // F. стоя на месте: помпа не должна платить ничего, когда строить нечего
  //    (200 кадров = 3,3 с, клетка спавна за это время достраивается, дальше
  //    очередь пуста)
  cases.push(await one({
    name: 'F стоя keep0 ahead 40/300, budget 12', budget: 12, speed: 0, steps: 600,
    from: spawn, heading: 0, distance: 0,
  }));
  // G. клетка дороже бюджета: ahead 300, но budget 24 — сколько кадров идёт
  //    одна достройка и каков худший срез при «взрослом» бюджете
  cases.push(await one({
    name: 'G пешком keep0 ahead 40/120, budget 24', budget: 24, speed: CONFIG.speed.run,
    from: spawn, heading: 0, distance: 400, ping: true, stream: { aheadMax: 120 },
  }));
  return cases;
});

for (const c of out) {
  console.log('=== ' + c.case + ' ===');
  const { stats, graph, chunks, ...rest } = c;
  console.log(JSON.stringify(rest));
  console.log('stats ' + JSON.stringify(stats));
  console.log('graph ' + JSON.stringify(graph));
  console.log('cost  ' + JSON.stringify(c.pumpCost));
  console.log('chunks ' + JSON.stringify(chunks));
}
await browser.close();
server.close();
