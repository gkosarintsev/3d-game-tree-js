import { decodeChunk } from '../../src/level-bin.js';
import { parseLevelNumbers, levelFileName } from './model.js';

function isBrowser() { return typeof window !== 'undefined' && typeof document !== 'undefined'; }

export async function loadRegistry() {
  try {
    const url = new URL('../../src/levels/index.js', import.meta.url);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`index.js: ${res.status}`);
    const text = await res.text();
    const nums = parseLevelNumbers(text);
    if (nums?.length) return { numbers: nums, source: 'index.js' };
  } catch {}
  return { numbers: [7, 8, 9, 10, 15, 16, 17, 18, 19], source: 'fallback' };
}

async function fetchJson(url, { optional = false, cacheBust = 0 } = {}) {
  const u = cacheBust ? `${url}${url.includes('?') ? '&' : '?'}v=${cacheBust}` : url;
  const res = await fetch(u, { cache: cacheBust ? 'no-store' : 'default' });
  if (!res.ok) {
    if (optional && res.status === 404) return { data: null, status: 404, url: u };
    throw new Error(`${u}: ${res.status}`);
  }
  return { data: await res.json(), status: res.status, url: u };
}

async function fetchBytes(url, { cacheBust = 0 } = {}) {
  const u = cacheBust ? `${url}${url.includes('?') ? '&' : '?'}v=${cacheBust}` : url;
  const res = await fetch(u, { cache: cacheBust ? 'no-store' : 'default' });
  if (!res.ok) throw new Error(`${u}: ${res.status}`);
  return { data: new Uint8Array(await res.arrayBuffer()), status: res.status, url: u };
}

export async function loadSource(level, { cacheBust = 0 } = {}) {
  const name = levelFileName(level);
  const url = new URL(`../../src/levels/${name}.json`, import.meta.url);
  const r = await fetchJson(url.href, { cacheBust });
  return { source: r.data, url: r.url };
}

export async function loadCompiled(level, { cacheBust = 0, onProgress } = {}) {
  const name = levelFileName(level);
  const dirUrl = new URL(`../../src/levels/${name}/index.js`, import.meta.url);
  let mod;
  try {
    mod = await import(dirUrl.href + (cacheBust ? `?v=${cacheBust}` : ''));
  } catch (e) {
    throw new Error(`catalog import: ${e?.message || e}`);
  }
  const key = `LEVEL_${String(level).padStart(2, '0')}`;
  const levelDef = mod[key] || mod.default || mod[Object.keys(mod).find(k => k.startsWith('LEVEL_'))];
  if (!levelDef?.map) throw new Error(`catalog: LEVEL_* export not found`);
  const map = levelDef.map;
  const indexUrl = dirUrl;

  let report = null;
  try {
    const rr = await fetchJson(new URL('./generation-report.json', indexUrl).href, { optional: true, cacheBust });
    report = rr.data;
  } catch {
    report = null;
  }

  const cells = (map.cells || []).map(c => ({ ...c, decoded: null, error: null }));
  let done = 0;
  const total = cells.length;
  const notify = () => { try { onProgress?.({ done, total }); } catch {} };
  notify();
  const concurrency = 4;
  let i = 0;
  let cancelled = false;
  const cancel = () => { cancelled = true; };

  async function worker() {
    while (!cancelled) {
      const idx = i++;
      if (idx >= cells.length) return;
      const cell = cells[idx];
      try {
        const u = new URL(`./${cell.file}`, indexUrl);
        const b = await fetchBytes(u.href, { cacheBust });
        // decode in microtask; could be heavy but chunks are small
        cell.decoded = decodeChunk(b.data);
      } catch (e) {
        cell.error = e?.message || String(e);
      }
      done++;
      notify();
      await Promise.resolve();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, total)) }, () => worker()));

  const compiledIndex = {
    kind: map.kind,
    bounds: map.bounds,
    catalog: map.catalog,
    cells: map.cells,
    ground: map.ground,
    spawn: map.spawn,
    stream: map.stream,
    units: map.units,
    windows: map.windows,
    skeleton: map.skeleton || { nodes: [], edges: [] },
    relief: map.relief || null,
  };
  return { compiledIndex, decodedCells: cells, report, indexUrl: indexUrl.href, cancel };
}

export async function loadLevel(level, mode, { cacheBust = 0, onProgress, onPhase } = {}) {
  const phases = {};
  const mark = (name, ok, err) => { phases[name] = { ok: !!ok, error: err ? String(err) : null }; try { onPhase?.(name, phases[name]); } catch {} };

  let source = null;
  try {
    const s = await loadSource(level, { cacheBust });
    source = s.source;
    mark('source', true);
  } catch (e) {
    mark('source', false, e);
    throw e;
  }

  let compiled = null;
  let decodedCells = null;
  let report = null;
  if (mode === 'compiled' || mode === 'compare') {
    try {
      const c = await loadCompiled(level, { cacheBust, onProgress });
      compiled = c.compiledIndex;
      decodedCells = c.decodedCells;
      report = c.report;
      mark('catalog', true);
      mark('chunks', decodedCells.every(x => !x.error), decodedCells.some(x => x.error) ? 'some chunks failed' : null);
      mark('report', !!report, report ? null : 'not found');
    } catch (e) {
      mark('catalog', false, e);
      if (mode === 'compiled') throw e;
    }
  }
  return { source, compiledIndex: compiled, decodedCells, report, phases };
}
