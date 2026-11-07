/**
 * Шестой заход: то, что в плане осталось границами вместо мер. Стадии:
 * `P6.run('api')` — сигнатура castShape на этом же билде,
 * `P6.run('ctor')` — тёплый конструктор в ЭТОЙ сессии (провенанс чисел 2 257/4 971),
 * `P6.run('idx')` — цена сборки коллайдер-индекса главы (без конструктора карты),
 * `P6.run('edges')` — чистая раздельная сумма свипа по ВСЕМ рёбрам графа,
 * `P6.run('chunk')` — число коллайдеров на окно 300×300 м в плотном месте.
 * Результаты — `P6.out`; каждая стадия пишет и время, и счётчики, и ошибку текстом.
 */
const R = () => window.RB.R;
const P6 = { out: {} };
window.P6 = P6;
const now = () => performance.now();

async function stage(key, fn) {
  P6.out[key] = { status: 'running' };
  const t0 = now();
  try { P6.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...(await fn()) }; }
  catch (e) { P6.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String(e && e.message || e) }; }
  return P6.out[key];
}
P6.run = (k) => stage(k, STAGES[k]);

const M_RAY = 0x0001, M_BODY = 0x0002, M_BOTH = 0x0003;
const g = (mem) => ((mem << 16) | 0xffff);
const Q_BODY = (0xffff << 16) | M_BODY;

function prismCorners(p) {
  const P = (u, y, v) => (p.frame
    ? [p.frame.cx + u * p.frame.c - v * p.frame.s, y, p.frame.cz + u * p.frame.s + v * p.frame.c]
    : (p.axis === 'x' ? [u, y, v] : [v, y, u]));
  const out = [];
  for (const v of [p.v0, p.v1]) for (const [u, y] of p.poly) out.push(P(u, y, v));
  return out;
}

/** Мир ровно как в bench5: сольды — лучу, блокеры — телу, перила обоим, призмы hull, свипы trimesh. */
function buildWorld(map, opts = {}) {
  const Rp = R();
  const w = new Rp.World({ x: 0, y: 0, z: 0 });
  const shared = w.createRigidBody(Rp.RigidBodyDesc.fixed());
  const counts = { box: 0, hull: 0, tri: 0, hullFail: 0, triFail: 0 };
  const box = (plan, y0, y1, mem) => {
    const hy = (y1 - y0) / 2, cy = (y0 + y1) / 2, obb = plan.obb;
    const desc = obb
      ? Rp.ColliderDesc.cuboid(obb.hx, hy, obb.hz)
        .setRotation({ x: 0, y: Math.sin(-Math.atan2(obb.s, obb.c) / 2), z: 0, w: Math.cos(-Math.atan2(obb.s, obb.c) / 2) })
        .setTranslation(obb.cx, cy, obb.cz)
      : Rp.ColliderDesc.cuboid((plan.maxX - plan.minX) / 2, hy, (plan.maxZ - plan.minZ) / 2)
        .setTranslation((plan.minX + plan.maxX) / 2, cy, (plan.minZ + plan.maxZ) / 2);
    w.createCollider(desc.setCollisionGroups(g(mem)), shared);
    counts.box++;
  };
  const inWindow = (s, win) => !win
    || !(s.maxX < win.cx - win.h || s.minX > win.cx + win.h || s.maxZ < win.cz - win.h || s.minZ > win.cz + win.h);
  const planOf = (o) => (o.obb ? { minX: o.obb.cx - o.obb.hx, maxX: o.obb.cx + o.obb.hx, minZ: o.obb.cz - o.obb.hz, maxZ: o.obb.cz + o.obb.hz } : o);
  for (const s of map.solids) if (inWindow(planOf(s), opts.win)) box(s, s.minY, s.maxY, M_RAY);
  for (const b of map.blockers) if (inWindow(planOf(b), opts.win)) box(b, b.y0, b.y1, M_BODY);
  for (const r of map.rails) {
    const p = r.kind === 'wedge' ? r.w : r.s;
    if (!p || !p.poly || !inWindow(planOf({ obb: p.frame ? null : { cx: (p.minX + p.maxX) / 2, hx: (p.maxX - p.minX) / 2, cz: (p.minZ + p.maxZ) / 2, hz: (p.maxZ - p.minZ) / 2 } }), opts.win)) continue;
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try { w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_BOTH)), shared); counts.hull++; }
    catch (e) { counts.hullFail++; }
  }
  for (const p of map.prisms) {
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try { w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_RAY)), shared); counts.hull++; }
    catch (e) { counts.hullFail++; }
  }
  for (const sw of (map.sweeps || [])) {
    if (!sw.tris || !sw.tris.length) continue;
    const pos = [], idx = [];
    sw.tris.forEach((tri, i) => {
      const base = pos.length / 3;
      pos.push(...tri.a, ...tri.b, ...tri.c);
      idx.push(base, base + 1, base + 2);
    });
    try { w.createCollider(Rp.ColliderDesc.trimesh(new Float32Array(pos), new Uint32Array(idx)).setCollisionGroups(g(M_RAY)), shared); counts.tri++; }
    catch (e) { counts.triFail++; }
  }
  w.step();
  return { w, shared, counts };
}

/** Все рёбра существующего графа (без дублей), как их видит `_link`. */
function edgesOf(map) {
  const nav = map.nav, out = [];
  const seen = new Set();
  for (let i = 0; i < nav.adj.length; i++) {
    for (const j of nav.adj[i]) {
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push([nav.pos[i], nav.pos[j]]);
    }
  }
  return out;
}

const STAGES = {
  /** Сигнатура castShape на этом билде + проверка, что она вообще находит заведомое. */
  api: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const { w } = buildWorld(map);
    const probe = { arity: w.castShape.length, names: Object.getOwnPropertyNames(Object.getPrototypeOf(w)).filter(n => /cast|intersect/i.test(n)) };
    const a = { x: 0, y: 1.6, z: 0 };
    const attempts = [];
    const variants = [
      ['shapePos,rot,vel,shape,targetDistance,maxToi,solid,groups', () => w.castShape(a, { x: 0, y: 0, z: 0, w: 1 }, { x: 10, y: 0, z: 0 }, new Rp.Ball(0.45), 20, true, undefined, Q_BODY)],
      ['shapePos,rot,vel,shape,targetDistance,maxToi,solid,flags,groups', () => w.castShape(a, { x: 0, y: 0, z: 0, w: 1 }, { x: 10, y: 0, z: 0 }, new Rp.Ball(0.45), 20, 20, true, 0, Q_BODY)],
    ];
    for (const [label, f] of variants) {
      try { const r = f(); attempts.push({ label, ok: true, hit: !!r, toi: r && r.toi }); }
      catch (e) { attempts.push({ label, ok: false, error: String(e.message || e).slice(0, 160) }); }
    }
    w.free();
    return { probe, attempts };
  },

  ctor: async () => {
    const { createJsonMap } = await import('/src/json-map.js');
    const rec = {};
    for (const n of ['12', '13']) {
      const mod = await import(`/src/levels/level-${n}.js`);
      const level = Object.values(mod).find(v => v && v.map);
      const warm = [];
      for (let i = 0; i < 3; i++) {
        const t0 = now();
        const map = createJsonMap(level.map);
        warm.push(Math.round(now() - t0));
        if (i === 2) window.RB.maps['ch' + n] = map;
      }
      rec['ch' + n] = warm;
    }
    return rec;
  },

  idx: async () => {
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const heap0 = performance.memory ? performance.memory.usedJSHeapSize : null;
      const runs = [];
      const made = [];
      for (let i = 0; i < 3; i++) {
        const t0 = now();
        const b = buildWorld(map);
        runs.push(Math.round(now() - t0));
        made.push(b);
      }
      const heap1 = performance.memory ? performance.memory.usedJSHeapSize : null;
      rec[k] = {
        colliders: made[2].w.colliders.len(), counts: made[2].counts,
        buildMs: runs, heapKB: heap0 === null ? null : Math.round((heap1 - heap0) / 1024 / 3),
      };
      for (const b of made) b.w.free();
    }
    return rec;
  },

  /** Чистая раздельная сумма: своё `bodyClearLine` против Rapier-свипа и против probes-марша. */
  edges: async () => {
    const Rp = R();
    const cfg = await import('/src/config.js');
    const radius = cfg.CONFIG.radius, probe = cfg.CONFIG.nav.bodyProbe, height = cfg.CONFIG.eyeHeight;
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const edges = edgesOf(map);
      const { w } = buildWorld(map);
      const ball = new Rp.Ball(radius);
      const capsule = new Rp.Capsule((height - radius) / 2, radius);
      const rot = { x: 0, y: 0, z: 0, w: 1 };
      // декодированная семантика: time_of_impact = (дистанция_до_препятствия − targetDistance) / |shapeVel|
      const rapCast = (a, b) => {
        const vel = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
        const len = Math.hypot(vel.x, vel.y, vel.z);
        if (len < 1e-6) return false;
        const r = w.castShape({ x: a.x, y: a.y, z: a.z }, rot, vel, capsule, 0, 1, true, undefined, Q_BODY);
        return !!r && r.time_of_impact * len < len;
      };
      const rapMarch = (a, b) => {
        const dx = b.x - a.x, dz = b.z - a.z;
        const steps = Math.max(2, Math.ceil(Math.hypot(dx, dz) / probe));
        const feet = Math.max(a.y, b.y);
        const q = { x: 0, y: 0, z: 0, w: 1 };
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          let hit = false;
          w.intersectionsWithShape({ x: a.x + dx * t, y: feet, z: a.z + dz * t }, q, capsule, () => { hit = true; }, undefined, Q_BODY);
          if (hit) return true;
        }
        return false;
      };
      const loop = (fn, warm = 300) => {
        for (let i = 0; i < warm; i++) fn(edges[i % edges.length][0], edges[i % edges.length][1]);
        const t = now();
        let blocked = 0;
        const verdicts = [];
        for (const [a, b] of edges) { const v = fn(a, b); if (v) blocked++; verdicts.push(!!v); }
        return { ms: Math.round(now() - t), us: Math.round(((now() - t) * 1000) / edges.length * 100) / 100, blocked, verdicts };
      };
      const own = loop((a, b) => map.bodyClearLine(a, b));
      const cast = loop(rapCast);
      const march = loop(rapMarch);
      const mm = cast.verdicts.reduce((acc, v, i) => acc + (v !== own.verdicts[i] ? 1 : 0), 0);
      const mmMarch = march.verdicts.reduce((acc, v, i) => acc + (v !== own.verdicts[i] ? 1 : 0), 0);
      rec[k] = {
        edges: edges.length,
        ownTotalMs: own.ms, ownUsPerEdge: own.us, ownBlocked: own.blocked,
        castTotalMs: cast.ms, castUsPerEdge: cast.us, castBlocked: cast.blocked, castMismatch: mm,
        marchTotalMs: march.ms, marchUsPerEdge: march.us, marchBlocked: march.blocked, marchMismatch: mmMarch,
      };
      w.free();
    }
    return rec;
  },

  chunk: async () => {
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      // окно 300×300 вокруг спавна и вокруг самой плотной точки солда
      const dense = map.solids.reduce((best, s) => {
        const area = (s.maxX - s.minX) * (s.maxZ - s.minZ);
        return !best || area < best.area ? { area, x: (s.minX + s.maxX) / 2, z: (s.minZ + s.maxZ) / 2 } : best;
      }, null);
      const spots = { spawn: { cx: map.spawn.x, cz: map.spawn.z, h: 150 }, dense: { cx: dense.x, cz: dense.z, h: 150 } };
      const per = {};
      for (const name of Object.keys(spots)) {
        const t0 = now();
        const b = buildWorld(map, { win: spots[name] });
        per[name] = { ms: Math.round(now() - t0), colliders: b.w.colliders.len(), counts: b.counts };
        b.w.free();
      }
      rec[k] = per;
    }
    return rec;
  },
};

export default P6;
