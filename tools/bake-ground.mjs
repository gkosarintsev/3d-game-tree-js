/**
 * Запекание геометрии грунта в sidecar-файлы клеток (TASK-004).
 *
 * Почему браузер, а не Node: генератор (`JsonMap._riverGroundGeoData`) — это
 * рантайм-код карты, и запекать надо ровно его вывод. Здесь он вызывается в
 * headless-странице, упаковывается компактно (`src/ground-bake.js`) и
 * кодируется тем же `.l14b` (`src/level-bin.js`). Артефакт —
 * `chunk-X-Y.ground.l14b`; `tools/build-level.mjs` вклеивает его в чанк, а
 * `tools/check-levels.mjs` сверяет. CI этот шаг не запускает: результат
 * коммитится (см. план, вариант 4C).
 *
 * Эквивалентность проверяется прямо на месте: упакованные данные разворачиваются
 * обратно и сравниваются с исходной генерацией — позиции обязаны совпасть
 * побитово, нормали — в пределах квантования Int8, треугольники — один в один.
 *
 * Использование:
 *   node tools/bake-ground.mjs src/levels/level-17.json [--ids=0_0,1_1] [--only-slow=MS]
 *
 * `--ids` — запечь только перечисленные клетки (остальные sidecar'ы не трогаются).
 * `--only-slow=MS` — запечь клетки, чья генерация заняла не меньше MS мс.
 * Требуется Playwright, резолвимый через NODE_PATH (`NODE_PATH=$(npm root -g)`).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, extname, join, basename } from 'node:path';
import { existsSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.css': 'text/css', '.l14b': 'application/octet-stream',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary',
};

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const dirs = [...(process.env.NODE_PATH || '').split(process.platform === 'win32' ? ';' : ':')
    .filter(Boolean).map(d => resolve(d, 'playwright')), 'playwright'];
  for (const x of dirs) { try { return require(x); } catch {} }
  throw new Error('Playwright не найден. Укажите NODE_PATH (например NODE_PATH=$(npm root -g)).');
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('usage: node tools/bake-ground.mjs <src/levels/level-17.json> [--ids=0_0,1_1] [--only-slow=MS]');
    process.exit(1);
  }
  let levelDir = resolve(arg);
  if (levelDir.endsWith('.json')) levelDir = levelDir.replace(/\.json$/i, '');
  if (!existsSync(levelDir)) throw new Error(`Каталог не найден: ${levelDir}`);
  const stem = basename(levelDir); // level-17
  const chapterHint = stem.replace(/^level-/, 'Глава ');
  const idsArg = (process.argv.find(a => a.startsWith('--ids=')) || '').slice(6);
  const wantIds = idsArg ? new Set(idsArg.split(',').map(s => s.trim()).filter(Boolean)) : null;
  const slowArg = (process.argv.find(a => a.startsWith('--only-slow=')) || '').slice(12);
  const onlySlow = slowArg ? Number(slowArg) : 0;

  const { chromium } = loadPlaywright();
  const server = createServer(async (req, res) => {
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    const url = new URL(req.url, 'http://l');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
    const abs = resolve(ROOT, rel);
    if (!abs.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(abs);
      res.writeHead(200, { 'Content-Type': MIME[extname(abs)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end('nf'); }
  });
  await new Promise(d => server.listen(0, '127.0.0.1', d));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/3d-game.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.game, null, { timeout: 120000 });
  const info = await page.evaluate(async (chapterHint) => {
    const { LEVELS } = await import('/src/levels/index.js');
    const idx = LEVELS.findIndex(l => l.name.includes(chapterHint));
    if (idx < 0) throw new Error('level not found: ' + chapterHint);
    await window.game._loadLevel(idx);
    const map = window.game.map;
    const ids = (map.cells ? map.cells.map(c => c.id) : []);
    const t0 = performance.now();
    while (performance.now() - t0 < 60000) {
      for (let k = 0; k < 40; k++) {
        try { window.game._worldPump?.(); } catch {}
        try { map.streamStep?.(8, map.spawn?.x || 0, map.spawn?.z || 0, 0); } catch {}
      }
      if (!map.pump?.task && !(map.streamQueue?.length > 0)) break;
      await new Promise(r => setTimeout(r, 10));
    }
    return { idx, ids };
  }, chapterHint);
  console.log(`level ${chapterHint} (idx ${info.idx}), chunks: ${info.ids.join(', ')}`);

  let written = 0, skipped = 0;
  for (const id of info.ids) {
    if (wantIds && !wantIds.has(id)) { skipped++; continue; }
    const b = await page.evaluate(async (id) => {
      const map = window.game.map;
      const cell = map.cells?.find(c => c.id === id);
      const r = cell?.rect;
      if (!r) return { ok: false, reason: 'no_rect' };
      const t0 = performance.now();
      const d = map._groundGeoData(r);
      const ms = performance.now() - t0;
      if (!d || !d.pos || !d.pos.length) return { ok: false, reason: 'no_data', ms };
      const { packGroundData, unpackGroundData } = await import('/src/ground-bake.js');
      const { encodeChunk } = await import('/src/level-bin.js');
      const packed = packGroundData(d);
      const back = unpackGroundData(packed);

      // Эквивалентность: позиции побитово, нормали — угол, треугольники — 1:1.
      let posDev = 0, nrmDeg = 0, nrmDev = 0;
      const n = back.idx ? back.idx.length : 0;
      for (let i = 0; i < n; i++) {
        const v = back.idx[i] * 3, o = i * 3;
        posDev = Math.max(posDev, Math.abs(back.pos[v] - d.pos[o]), Math.abs(back.pos[v + 1] - d.pos[o + 1]), Math.abs(back.pos[v + 2] - d.pos[o + 2]));
        const ax = back.nrm[v], ay = back.nrm[v + 1], az = back.nrm[v + 2];
        const bx = d.nrm[o], by = d.nrm[o + 1], bz = d.nrm[o + 2];
        nrmDev = Math.max(nrmDev, Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));
        // Угол между направлениями: линейно интерполированные нормали на швах
        // не единичны, поэтому нормируем обе перед acos.
        const la = Math.hypot(ax, ay, az) || 1, lb = Math.hypot(bx, by, bz) || 1;
        const dot = (ax * bx + ay * by + az * bz) / (la * lb);
        nrmDeg = Math.max(nrmDeg, Math.acos(Math.min(1, Math.max(-1, dot))) * 180 / Math.PI);
      }
      const blob = encodeChunk({ groundBaked: packed });
      // base64 кусками: spread на мегабайтах переполняет стек
      let bin = '';
      for (let i = 0; i < blob.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, blob.subarray(i, i + 0x8000));
      }
      return {
        ok: true, ms, posDev, nrmDeg, nrmDev,
        verts: n, uniq: packed.pos.length / 3,
        bytes: blob.length, blob: btoa(bin),
      };
    }, id);
    if (!b.ok) { console.log(`skip ${id}: ${b.reason} (${b.ms?.toFixed(1) ?? '?'} мс)`); skipped++; continue; }
    if (onlySlow && b.ms < onlySlow) {
      console.log(`skip ${id}: ${b.ms.toFixed(1)} мс < ${onlySlow} (не горячая)`);
      skipped++; continue;
    }
    const out = Buffer.from(b.blob, 'base64');
    const sidecarFile = join(levelDir, `chunk-${id.replace('_', '-')}.ground.l14b`);
    await writeFile(sidecarFile, out);
    written++;
    console.log(`baked ${id}: ${b.ms.toFixed(1)} мс, verts ${b.verts}, uniq ${b.uniq}, `
      + `${(b.bytes / 1048576).toFixed(2)} МБ, posDev ${b.posDev.toExponential(1)} м, `
      + `nrmDev ${b.nrmDev.toExponential(1)}, nrmAngle ${b.nrmDeg.toFixed(3)}°`);
  }
  console.log(`done: written=${written} skipped=${skipped}. Run: node tools/build-level.mjs src/levels/${stem}.json`);
  await browser.close();
  server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
