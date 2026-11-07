/**
 * Третий заход: мир Rapier из **тех же источников твёрдости, что и карта**
 * (солиды + призмы + перила + свипы для луча, блокеры для тела), и сравнение
 * ОТВЕТОВ с `raySolid` / `isBlocked` / `groundHeightAt`, а не только цен.
 * Черновик. Стадии: `P3.run('build')`, `P3.run('agree')`, `P3.run('lattice')`,
 * `P3.run('hull')`, `P3.run('stream')`.
 */
const R = () => window.RB.R;
const P3 = { out: {}, W: {} };
window.P3 = P3;
const now = () => performance.now();

async function stage(key, fn) {
  P3.out[key] = { status: 'running' };
  const t0 = now();
  try { P3.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...(await fn()) }; }
  catch (e) { P3.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String(e && e.stack ? String(e.stack).slice(0, 300) : e) }; }
  return P3.out[key];
}
P3.run = (k) => stage(k, STAGES[k]);

/**
 * Роль коллайдера в битовой группе Rapier: `(membership << 16) | filter`.
 * Луч видит «твёрдость для пули» (солиды, призмы, перила, свипы), тело — только
 * блокер-стены: это ровно то разделение источников, что держит карта.
 */
const M_RAY = 0x0001, M_BODY = 0x0002;
const g = (mem) => ((mem << 16) | 0xffff);
const Q_RAY = (0xffff << 16) | M_RAY;
const Q_BODY = (0xffff << 16) | M_BODY;

function boxCollider(Rp, w, desc, t, rot) {
  const rbDesc = Rp.RigidBodyDesc.fixed().setTranslation(t.x, t.y, t.z);
  if (rot) rbDesc.setRotation(rot);
  const rb = w.createRigidBody(rbDesc);
  return w.createCollider(desc, rb);
}

/** Куб из прямоугольника плана и вертикальной полосы: точный OBB, если есть `obb`. */
function addBox(Rp, w, plan, y0, y1, groups, rotSign) {
  const obb = plan.obb;
  let desc, center, rot = null;
  const hy = (y1 - y0) / 2;
  if (obb && rotSign !== 0) {
    const ang = Math.atan2(obb.s, obb.c) * rotSign;
    rot = { x: 0, y: Math.sin(ang / 2), z: 0, w: Math.cos(ang / 2) };
    desc = Rp.ColliderDesc.cuboid(obb.hx, hy, obb.hz).setCollisionGroups(groups);
    center = { x: obb.cx, y: (y0 + y1) / 2, z: obb.cz };
  } else {
    desc = Rp.ColliderDesc.cuboid((plan.maxX - plan.minX) / 2, hy, (plan.maxZ - plan.minZ) / 2).setCollisionGroups(groups);
    center = { x: (plan.minX + plan.maxX) / 2, y: (y0 + y1) / 2, z: (plan.minZ + plan.maxZ) / 2 };
  }
  return boxCollider(Rp, w, desc, center, rot);
}

function prismCorners(p) {
  const P = (u, y, v) => {
    if (p.frame) {
      const x = p.frame.cx + u * p.frame.c - v * p.frame.s;
      const z = p.frame.cz + u * p.frame.s + v * p.frame.c;
      return [x, y, z];
    }
    return p.axis === 'x' ? [u, y, v] : [v, y, u];
  };
  const out = [];
  for (const v of [p.v0, p.v1]) for (const [u, y] of p.poly) out.push(P(u, y, v));
  return out;
}

const STAGES = {
  /** Полная твёрдость главы в Rapier: сольы+призмы+перила+свипы (луч) и блокеры (тело). */
  build: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const rotSigns = {};
      for (const rotSign of [0, 1, -1]) {
        const t0 = now();
        const w = new Rp.World({ x: 0, y: 0, z: 0 });
        let nSolids = 0, nBlockers = 0, nPrisms = 0, nRails = 0, nSweeps = 0;
        for (const s of map.solids) {
          addBox(Rp, w, s, s.minY, s.maxY, g(M_RAY | M_BODY), rotSign);
          nSolids++;
        }
        for (const b of map.blockers) {
          addBox(Rp, w, b, b.y0, b.y1, g(M_BODY), rotSign);
          nBlockers++;
        }
        for (const p of map.prisms) {
          const c = prismCorners(p);
          if (c.length < 8) continue;
          const pos = new Float32Array(c.flat());
          try {
            const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed());
            w.createCollider(Rp.ColliderDesc.convexHull(pos).setCollisionGroups(g(M_RAY)), rb);
            nPrisms++;
          } catch (e) { /* не выпуклый профиль */ }
        }
        for (const r of map.rails) {
          const p = r.kind === 'wedge' ? r.w : r.s;
          if (!p || !p.poly) continue;
          const c = prismCorners(p);
          if (c.length < 8) continue;
          try {
            const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed());
            w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_RAY | M_BODY)), rb);
            nRails++;
          } catch (e) { /* пропускаем */ }
        }
        const buildMs = Math.round(now() - t0);
        const t1 = now();
        w.step();
        const firstStepMs = Math.round(now() - t1);
        if (rotSign !== 0) {
          // проверка знака yaw: сверка одного блока isBlocked на 2000 точек
          const q = new Rp.Quaternion(0, 0, 0, 1);
          const ball = new Rp.Ball(0.45);
          const pos = { x: 0, y: 1.4, z: 0 };
          let mism = 0;
          const pts = [];
          for (let i = 0; i < 2000; i++) pts.push({ x: (Math.random() * 2 - 1) * map.width * 0.45, z: (Math.random() * 2 - 1) * map.width * 0.45 });
          for (const p of pts) {
            pos.x = p.x; pos.z = p.z;
            let hit = false;
            w.intersectionsWithShape(pos, q, ball, () => { hit = true; }, undefined, Q_BODY);
            const own = map.isBlocked(p.x, p.z, 0.45, 0.55, 1.8);
            if (hit !== own) mism++;
          }
          rotSigns['sign' + rotSign] = { mismatches: mism, of: pts.length };
        }
        w.free();
        rec[k] = { colliders: { solids: nSolids, blockers: nBlockers, prisms: nPrisms, rails: nRails, sweeps: nSweeps },
          buildMs, firstStepMs, rotSigns };
      }
    }
    return rec;
  },

  /** Согласие ответов: луч, тело, опора — на одном и том же наборе проб. */
  agree: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const w = new Rp.World({ x: 0, y: 0, z: 0 });
      for (const s of map.solids) addBox(Rp, w, s, s.minY, s.maxY, g(M_RAY | M_BODY), 1);
      for (const b of map.blockers) addBox(Rp, w, b, b.y0, b.y1, g(M_BODY), 1);
      for (const p of map.prisms) {
        const c = prismCorners(p);
        if (c.length < 8) continue;
        try { const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed()); w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_RAY)), rb); } catch (e) {}
      }
      w.step();
      P3.W[k] = w;
      const half = map.width / 2;

      // луч: 4000 трасс вниз-в-сторону, сравнение факта попадания и дистанции
      const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      const set = (t) => { ray.origin.x = t.x; ray.origin.y = t.y; ray.origin.z = t.z; ray.dir.x = t.dx; ray.dir.y = t.dy; ray.dir.z = t.dz; };
      const traces = [];
      for (let i = 0; i < 4000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
        const y = map.groundHeightAt(x, z, 1e6) + 1.6;
        const a = Math.random() * Math.PI * 2;
        const dx = Math.cos(a) * 0.4, dy = -0.9, dz = Math.sin(a) * 0.4;
        const n = Math.hypot(dx, dy, dz);
        traces.push({ x, y, z, dx: dx / n, dy: dy / n, dz: dz / n });
      }
      for (const t of traces.slice(0, 200)) { set(t); w.castRay(ray, 25, true, undefined, Q_RAY); }
      let t0 = now();
      const devs = [];
      let rHit = 0, oHit = 0, both = 0, onlyR = 0, onlyO = 0;
      for (const t of traces) {
        set(t);
        const h = w.castRay(ray, 25, true, undefined, Q_RAY);
        const o = map.raySolid(t.x, t.y, t.z, t.dx, t.dy, t.dz, 25);
        if (h) rHit++;
        if (o) oHit++;
        if (h && o) { both++; devs.push(Math.abs(h.timeOfImpact - o.dist)); }
        else if (h) onlyR++;
        else if (o) onlyO++;
      }
      const rapierRayUs = Math.round(((now() - t0) * 1000) / traces.length * 10) / 10;
      t0 = now();
      for (const t of traces) map.raySolid(t.x, t.y, t.z, t.dx, t.dy, t.dz, 25);
      const ownRayUs = Math.round(((now() - t0) * 1000) / traces.length * 10) / 10;
      devs.sort((a, b) => a - b);

      // тело: capsule-запрос против isBlocked (ноги на опоре точки)
      const q = new Rp.Quaternion(0, 0, 0, 1);
      const cap = new Rp.Capsule(0.9, 0.45);
      const pos = { x: 0, y: 0, z: 0 };
      let mism = 0, bothB = 0, onlyRB = 0, onlyOB = 0;
      t0 = now();
      const bodyPts = [];
      for (let i = 0; i < 4000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
        bodyPts.push({ x, z, y: map.groundHeightAt(x, z, 1e6) });
      }
      for (const p of bodyPts) {
        const own = map.isBlocked(p.x, p.z, 0.45, p.y + 0.05, 1.8);
        pos.x = p.x; pos.y = p.y + 0.05 + 1.35; pos.z = p.z;
        let hit = false;
        w.intersectionsWithShape(pos, q, cap, () => { hit = true; }, undefined, Q_BODY);
        if (hit && own) bothB++;
        else if (hit) onlyRB++;
        else if (own) onlyOB++;
        else mism++;
        if (hit !== own) mism++;
      }
      const rapierBodyUs = Math.round(((now() - t0) * 1000) / bodyPts.length * 10) / 10;

      // опора: луч вниз от feet + stepUp против groundHeightAt(fromY=feet)
      const stepUp = 0.6;
      let sMism = 0, sWorst = 0, sSum = 0, sN = 0, sNoHit = 0;
      t0 = now();
      for (const p of bodyPts.slice(0, 2000)) {
        const own = map.groundHeightAt(p.x, p.z, p.y);
        ray.origin.x = p.x; ray.origin.y = p.y + stepUp + 0.02; ray.origin.z = p.z;
        ray.dir.x = 0; ray.dir.y = -1; ray.dir.z = 0;
        const h = w.castRay(ray, stepUp + 60, true, undefined, Q_RAY);
        if (!h) { sNoHit++; if (own > p.y - 0.05) sMism++; continue; }
        const y = p.y + stepUp + 0.02 - h.timeOfImpact;
        const d = Math.abs(y - own);
        if (d > 0.05) sMism++;
        if (d > sWorst) sWorst = d;
        sSum += d; sN++;
      }
      const rapierGroundUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;
      t0 = now();
      for (const p of bodyPts.slice(0, 2000)) map.groundHeightAt(p.x, p.z, p.y);
      const ownGroundUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      rec[k] = {
        colliders: w.colliders.len(),
        ray: { rapierUs: rapierRayUs, ownUs: ownRayUs, rapierHits: rHit, ownHits: oHit, both, onlyRapier: onlyR, onlyOwn: onlyO,
          devMedianM: devs.length ? Math.round(devs[devs.length >> 1] * 1000) / 1000 : null,
          devP95M: devs.length ? Math.round(devs[Math.floor(devs.length * 0.95)] * 1000) / 1000 : null,
          devMaxM: devs.length ? Math.round(devs[devs.length - 1] * 100) / 100 : null },
        body: { rapierUs: rapierBodyUs, both: bothB, onlyRapier: onlyRB, onlyOwn: onlyOB, mismatch: mism, of: bodyPts.length },
        ground: { rapierUs: rapierGroundUs, ownUs: ownGroundUs, mismatch: sMism, noHit: sNoHit, samples: sN,
          worstM: Math.round(sWorst * 100) / 100, meanM: Math.round((sSum / Math.max(1, sN)) * 1000) / 1000, of: 2000 },
      };
    }
    return rec;
  },

  /** Валидация рёбер графа: то, что сегодня съедает 52–89 % конструктора. */
  lattice: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k], w = P3.W[k];
      if (!w) continue;
      const nav = map.nav;
      const edges = [];
      for (let i = 0; i < nav.adj.length && edges.length < 4000; i++) {
        for (const j of nav.adj[i]) {
          if (j > i) {
            const a = nav.pos[i], b = nav.pos[j];
            if (Math.hypot(a.x - b.x, a.z - b.z) < 12) edges.push([a, b]);
          }
        }
      }
      let t0 = now(), clear = 0;
      for (const [a, b] of edges) if (map.bodyClearLine(a, b, 0.45, 1.8)) clear++;
      const ownClearUs = Math.round(((now() - t0) * 1000) / edges.length * 10) / 10;

      const ball = new Rp.Ball(0.45), q = new Rp.Quaternion(0, 0, 0, 1);
      t0 = now();
      let rClear = 0;
      for (const [a, b] of edges) {
        const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
        const from = { x: a.x, y: Math.max(a.y, b.y) + 1.35, z: a.z };
        const hit = w.castShape(from, q, { x: dx / len * (len + 0.9), y: 0, z: dz / len * (len + 0.9) }, ball, 0, 1, true, undefined, Q_BODY);
        if (!hit) rClear++;
      }
      const rapierSweepUs = Math.round(((now() - t0) * 1000) / edges.length * 10) / 10;

      t0 = now();
      for (const [a, b] of edges) { map._edgeSupported(a, b); }
      const ownSupportUs = map._edgeSupported ? Math.round(((now() - t0) * 1000) / edges.length * 10) / 10 : null;

      rec[k] = { edges: edges.length, ownClearUs, rapierSweepUs, ownSupportUs, ownClearPasses: clear, rapierPasses: rClear };
    }
    return rec;
  },

  /** Hull против trimesh для призм: цена сборки и расхождение верха. */
  hull: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const prisms = map.prisms.filter((p) => p.poly && p.poly.length >= 3);
    const mk = (mode) => {
      const w = new Rp.World({ x: 0, y: 0, z: 0 });
      const t = now();
      let ok = 0, fail = 0;
      for (const p of prisms) {
        const c = prismCorners(p);
        if (c.length < 8) { fail++; continue; }
        try {
          const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed());
          if (mode === 'hull') w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())), rb);
          else {
            const g = map._prismGeo(p);
            const pos = new Float32Array(g.attributes.position.array);
            const idx = new Uint32Array(g.index ? g.index.array : pos.map((_, i) => i));
            w.createCollider(Rp.ColliderDesc.trimesh(pos, idx), rb);
          }
          ok++;
        } catch (e) { fail++; }
      }
      const ms = Math.round(now() - t);
      w.step();
      return { w, ok, fail, ms };
    };
    const a = mk('hull'), b = mk('trimesh');
    const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
    const tops = (w, p) => {
      const c = prismCorners(p);
      let cx = 0, cz = 0;
      for (const v of c) { cx += v[0]; cz += v[2]; }
      cx /= c.length; cz /= c.length;
      const out = [];
      for (let i = 0; i < 12; i++) {
        const x = cx + (Math.random() - 0.5) * 4, z = cz + (Math.random() - 0.5) * 4;
        ray.origin.x = x; ray.origin.y = 60; ray.origin.z = z;
        const h = w.castRay(ray, 120, true);
        if (h) out.push({ x, z, y: 60 - h.timeOfImpact, own: map.groundHeightAt(x, z, 1e6) });
      }
      return out;
    };
    let hullWorst = 0, triWorst = 0, n = 0, hullSum = 0, triSum = 0, step = 0;
    for (const p of prisms.slice(0, 30)) {
      const ha = tops(a.w, p), tb = tops(b.w, p);
      const m = Math.min(ha.length, tb.length);
      for (let i = 0; i < m; i++) {
        const dh = Math.abs(ha[i].y - ha[i].own), dt = Math.abs(tb[i].y - tb[i].own);
        if (dh > hullWorst) hullWorst = dh;
        if (dt > triWorst) triWorst = dt;
        hullSum += dh; triSum += dt; n++;
      }
      step++;
    }
    return { prisms: prisms.length,
      hull: { ok: a.ok, fail: a.fail, buildMs: a.ms },
      trimesh: { ok: b.ok, fail: b.fail, buildMs: b.ms },
      vsAnalyticTop: { samples: n, hullWorstM: Math.round(hullWorst * 1000) / 1000, hullMeanM: Math.round((hullSum / Math.max(1, n)) * 1000) / 1000,
        trimeshWorstM: Math.round(triWorst * 1000) / 1000, trimeshMeanM: Math.round((triSum / Math.max(1, n)) * 1000) / 1000 } };
  },

  /** Цена достройки/выгрузки окна для стриминга: добавление чанка и шаг индекса. */
  stream: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const w = new Rp.World({ x: 0, y: 0, z: 0 });
    const half = map.width / 2;
    const inWin = (s, cx, cz) => !(s.maxX < cx - 150 || s.minX > cx + 150 || s.maxZ < cz - 150 || s.minZ > cz + 150);
    const addChunk = (cx, cz) => {
      const cols = [];
      for (const s of map.solids) if (inWin(s, cx, cz)) cols.push(addBox(Rp, w, s, s.minY, s.maxY, g(M_RAY | M_BODY), 1));
      return cols;
    };
    const rec = { chunks: [] };
    const centers = [[0, 0], [150, 0], [150, 150], [-150, -150]];
    for (const [cx, cz] of centers) {
      const t0 = now();
      const cols = addChunk(cx, cz);
      const addMs = Math.round(now() - t0);
      const t1 = now();
      w.step();
      const stepMs = Math.round(now() - t1);
      const t2 = now();
      let probe = 0;
      const ray = new Rp.Ray({ x: cx, y: 60, z: cz }, { x: 0, y: -1, z: 0 });
      for (let i = 0; i < 500; i++) { ray.origin.x = cx + (Math.random() - 0.5) * 200; ray.origin.z = cz + (Math.random() - 0.5) * 200; if (w.castRay(ray, 120, true)) probe++; }
      const queryUs = Math.round(((now() - t2) * 1000) / 500 * 10) / 10;
      const t3 = now();
      for (const c of cols) w.removeCollider(c, false);
      const removeMs = Math.round(now() - t3);
      rec.chunks.push({ cx, cz, added: cols.length, addMs, stepMs, queryUs, hits: probe, removeMs, totalColliders: w.colliders.len() });
    }
    const t = now();
    for (let i = 0; i < 200; i++) w.step();
    rec.steadyStepUs = Math.round(((now() - t) * 1000) / 200 * 10) / 10;
    w.free();
    return rec;
  },

  /** Профильщик: из чего складывается шаг. */
  profiler: async () => {
    const Rp = R();
    const w = P3.W.ch12;
    if (!w) return { skipped: 'run agree first' };
    const rb = w.createRigidBody(Rp.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 100, 0));
    w.createCollider(Rp.ColliderDesc.capsule(0.9, 0.45).setDensity(1), rb);
    let setErr = null;
    try { rb.setLinvel({ x: 1, y: -2, z: 1 }, true); } catch (e) { setErr = String(e.message || e); }
    try { w.profilerEnabled = true; } catch (e) { setErr = (setErr || '') + ' | profiler: ' + String(e.message || e); }
    for (let i = 0; i < 200; i++) w.step();
    const grab = (n) => { try { const v = w[n]; return typeof v === 'function' ? v.call(w) : v; } catch (e) { return 'n/a'; } };
    return { setErr, colliders: w.colliders.len(), step: grab('timingStep'), broad: grab('timingBroadPhase'),
      narrow: grab('timingNarrowPhase'), solver: grab('timingSolver'), userChanges: grab('timingUserChanges') };
  },
};

export default P3;
