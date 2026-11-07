// Мера присоединения компонент скелета (этап 2) — временный файл, в репозиторий не едет.
// Тот же прототип, что .tmp/skel-proto-class.mjs, плюс проход «сшить компоненты»:
// кандидаты — все пары узлов разных компонент в сетке грубого шага, порядок по
// расстоянию (Крускал), ребро принимает только та же проверка, что держит карта.
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { NavGraph } from '../src/nav-graph.js';
import { generateCatalog } from '../tools/build-level.mjs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { Proto, STEP, build } from './skel-proto-lib.mjs';

const MAXGAP = Number(process.env.SK_GAP ?? 200);
const raw = JSON.parse(readFileSync(process.env.SK_FIXTURE ?? 'probe/open-2km.json', 'utf8'));
if (process.env.SK_PLAIN !== '1') {
  raw.kind = 'open';
  raw.stream = { chunk: 350, keep: 1, aheadMin: 300, aheadMax: 900, budgetMs: 8 };
}
let t = Date.now();
const prepared = process.env.SK_PLAIN === '1'
  ? { worldMap: normalizeLevel(expandCity(structuredClone(raw))).map }
  : await generateCatalog(structuredClone(raw), 'probe/open-2km.json');
const map = prepared.worldMap;
const tFix = Date.now() - t;

const f = new Proto(map);
t = Date.now();
const SHAPE = process.env.SK_SHAPE === 'full' ? { rooms: true } : { rooms: false, roofs: false, stairs: false };
const nav = build(f, SHAPE);
const tSkel = Date.now() - t;

// --- компоненты
const n = nav.pos.length;
const comp = new Int32Array(n).fill(-1);
let comps = 0;
const sizes = [];
for (let s = 0; s < n; s++) {
  if (comp[s] >= 0) continue;
  const q = [s]; comp[s] = comps; let size = 0;
  for (let h = 0; h < q.length; h++) { size++; for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = comps; q.push(nb); } }
  sizes.push(size); comps++;
}

// --- кандидаты: пары узлов разных компонент в сетке MAXGAP
t = Date.now();
const g = new Map();
const gk = (i, j) => i * 65536 + j;
for (let i = 0; i < n; i++) {
  const p = nav.pos[i];
  const key = gk(Math.floor(p.x / MAXGAP), Math.floor(p.z / MAXGAP));
  let list = g.get(key);
  if (!list) g.set(key, list = []);
  list.push(i);
}
const cands = [];
const stepUp = f.stepUp;
for (let i = 0; i < n; i++) {
  const p = nav.pos[i];
  const ci = Math.floor(p.x / MAXGAP), ck = Math.floor(p.z / MAXGAP);
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      const list = g.get(gk(ci + di, ck + dj));
      if (!list) continue;
      for (const j of list) {
        if (j <= i || comp[j] === comp[i]) continue;
        const q = nav.pos[j];
        if (Math.abs(q.y - p.y) > CONFIG.jsonMap.relief.maxSlope * MAXGAP) continue;
        const d = Math.hypot(q.x - p.x, q.z - p.z);
        if (d > MAXGAP || d < 0.01) continue;
        cands.push({ a: i, b: j, d });
      }
    }
  }
}
const tCand = Date.now() - t;

// --- Крускал с проверкой тем же `_linkOk`
t = Date.now();
cands.sort((x, y) => x.d - y.d);
const uf = Int32Array.from({ length: comps }, (_, i) => i);
const find = (x) => { while (uf[x] !== x) x = uf[x] = uf[uf[x]]; return x; };
const accepted = [];
let rejClear = 0, rejSup = 0, bridgeNodes = 0;
let checks = 0;
for (const c of cands) {
  const ra = find(comp[c.a]), rb = find(comp[c.b]);
  if (ra === rb) continue;
  const pa = nav.pos[c.a], pb = nav.pos[c.b];
  checks++;
  const before = nav.pos.length;
  const made = f._skelBridge(nav, c.a, c.b, `${c.a}_${c.b}`);
  if (!made) { const q2 = nav.pos[c.b]; if (!f.bodyClearLine(pa, q2)) rejClear++; else rejSup++; continue; }
  bridgeNodes += nav.pos.length - before;
  accepted.push({ d: +c.d.toFixed(2), a: c.a, b: c.b, nodes: made });
  uf[ra] = rb;
  if (accepted.length === comps - 1) break;
}
const tJoin = Date.now() - t;

// --- пересчёт компонент
const comp2 = new Int32Array(n).fill(-1);
let comps2 = 0;
const sizes2 = [];
for (let s = 0; s < n; s++) {
  if (comp2[s] >= 0) continue;
  const q = [s]; comp2[s] = comps2; let size = 0;
  for (let h = 0; h < q.length; h++) { size++; for (const nb of nav.adj[q[h]]) if (comp2[nb] < 0) { comp2[nb] = comps2; q.push(nb); } }
  sizes2.push(size); comps2++;
}
sizes2.sort((a, b) => b - a);

// --- покрытие клеток и осмотры
const chunk = raw.stream?.chunk ?? 350;
const half = map.ground.size / 2, nn = Math.round(map.ground.size / chunk);
let cellsEmpty = 0;
const cellMiss = [];
for (let i = 0; i < nn; i++) for (let j = 0; j < nn; j++) {
  const cx = -half + (i + 0.5) * chunk, cz = -half + (j + 0.5) * chunk;
  let inside = 0;
  for (let k = 0; k < n; k++) { const p = nav.pos[k]; if (Math.abs(p.x - cx) <= chunk / 2 && Math.abs(p.z - cz) <= chunk / 2) inside++; }
  if (!inside) { cellsEmpty++; if (cellMiss.length < 8) cellMiss.push(`${i}_${j}`); }
}

// причины отказа по каждой паре оставшихся компонент
const left = [...new Set([...comp2].filter(v => v >= 0))];
const rep = new Map();
for (let i = 0; i < n; i++) if (!rep.has(comp2[i]) || comp2[i] === comp2[i]) {}
const info = [];
for (const c of left) {
  const ids = [];
  for (let i = 0; i < n; i++) if (comp2[i] === c) ids.push(i);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const i of ids) { const p = nav.pos[i]; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  info.push({ c, size: ids.length, box: [Math.round(minX), Math.round(minZ), Math.round(maxX), Math.round(maxZ)], ids });
}
const closest = [];
for (let a = 0; a < info.length; a++) for (let b = a + 1; b < info.length; b++) {
  let best = null;
  for (const i of info[a].ids) for (const j of info[b].ids) {
    const p = nav.pos[i], q = nav.pos[j];
    if (Math.abs(q.y - p.y) > f.stepUp) continue;
    const d = Math.hypot(q.x - p.x, q.z - p.z);
    if (!best || d < best.d) best = { d, i, j };
  }
  if (!best) { closest.push({ pair: `${info[a].c}-${info[b].c}`, none: true }); continue; }
  const p = nav.pos[best.i], q = nav.pos[best.j];
  closest.push({ pair: `${info[a].c}-${info[b].c}`, d: +best.d.toFixed(1), clear: f.bodyClearLine(p, q), sup: f._edgeSupported(p, q) });
}

const keyOf = new Map();
for (const [k, i] of nav.byKey) if (!keyOf.has(i)) keyOf.set(i, k);
const resid = info.filter(v => v.size < n).map(v => {
  const hist = new Map();
  for (const i of v.ids) {
    const parts = String(keyOf.get(i) ?? '?').split(':');
    const tag = parts[0] === 'd' ? 'deck:' + String(parts[1]).split('_')[0] : parts[0] + ':' + String(parts[1]).split('_')[0];
    hist.set(tag, (hist.get(tag) ?? 0) + 1);
  }
  return { size: v.size, box: v.box, top: [...hist].sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0] + '×' + e[1]) };
});
console.log(JSON.stringify({ resid }, null, 1));
console.log(JSON.stringify({
  fixture: process.env.SK_FIXTURE ?? 'probe/open-2km.json', plate: map.ground.size, step: STEP, maxGap: MAXGAP,
  ms: { fixture: tFix, skeleton: tSkel, candidates: tCand, join: tJoin },
  nodes: n, before: { comps, sizes: sizes.slice(0, 12) },
  cands: cands.length, checks, rejClear, rejSup,
  nodesAfter: nav.pos.length, bridgeNodes, accepted: accepted.length,
  gaps: accepted.map(a => `${a.d}(${a.nodes})`),
  after: { comps: comps2, sizes: sizes2.slice(0, 8) },
  cellsEmpty, cellMiss,
}, null, 1));
