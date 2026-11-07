/**
 * Продолжение замера осуществимости Rapier3D: сопоставление ОТВЕТОВ движка с
 * ответами карты (а не только цены вызова), плюс настилы-призмы и heightfield.
 * Черновик, в репозиторий не едет. Стадии: `PB.run('rays')`, `PB.run('decks')`, …
 */
const R = () => window.RB.R;
const PB = { out: {}, worlds: {} };
window.PB = PB;
const now = () => performance.now();

async function stage(key, fn) {
  PB.out[key] = { status: 'running' };
  const t0 = now();
  try { PB.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...(await fn()) }; }
  catch (e) { PB.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String(e && e.message || e) }; }
  return PB.out[key];
}
PB.run = (k) => stage(k, STAGES[k]);

/** Мир из солидов главы + ОБЯЗАТЕЛЬНЫЙ step(), чтобы запросы сцены что-то видели. */
function worldFromSolids(map, limit) {
  const Rp = R();
  const w = new Rp.World({ x: 0, y: -9.81, z: 0 });
  const list = limit ? map.solids.slice(0, limit) : map.solids;
  for (const s of list) {
    const dx = s.maxX - s.minX, dy = s.maxY - s.minY, dz = s.maxZ - s.minZ;
    if (dx <= 0 || dy <= 0 || dz <= 0) continue;
    const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed()
      .setTranslation((s.minX + s.maxX) / 2, (s.minY + s.maxY) / 2, (s.minZ + s.maxZ) / 2));
    w.createCollider(Rp.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb);
  }
  w.step();
  return w;
}

/** 8 углов призмы в мире: профиль (u,y) × [v0,v1] через кадр поворота. */
function prismCorners(w) {
  const P = (u, y, v) => {
    if (w.frame) { const p = rotate(u, v, w.frame); return [p.x, y, p.z]; }
    return w.axis === 'x' ? [u, y, v] : [v, y, u];
  };
  const out = [];
  for (const v of [w.v0, w.v1]) for (const [u, y] of w.poly) out.push(P(u, y, v));
  return out;
}
function rotate(u, v, f) {
  const x = f.cx + u * f.c - v * f.s, z = f.cz + u * f.s + v * f.c;
  return { x, z };
}

const STAGES = {
  /** Луч после step(): сколько попаданий и насколько они сходятся с raySolid. */
  rays: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const w = worldFromSolids(map);
      PB.worlds[k] = w;
      const half = map.width / 2;
      const traces = [];
      for (let i = 0; i < 4000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.8;
        const z = (Math.random() * 2 - 1) * half * 0.8;
        const y = map.groundHeightAt(x, z, 1e6) + 1.6;
        const a = Math.random() * Math.PI * 2;
        const dx = Math.cos(a) * 0.5, dy = -0.5, dz = Math.sin(a) * 0.5;
        const n = Math.hypot(dx, dy, dz);
        traces.push({ x, y, z, dx: dx / n, dy: dy / n, dz: dz / n });
      }
      const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      const set = (t) => { ray.origin.x = t.x; ray.origin.y = t.y; ray.origin.z = t.z; ray.dir.x = t.dx; ray.dir.y = t.dy; ray.dir.z = t.dz; };
      for (const t of traces.slice(0, 300)) { set(t); w.castRay(ray, 30, true); }
      let t0 = now(), rHits = 0; const toi = [];
      for (const t of traces) { set(t); const h = w.castRay(ray, 30, true); if (h) { rHits++; toi.push(h.timeOfImpact); } }
      const rapierUs = Math.round(((now() - t0) * 1000) / traces.length * 10) / 10;

      t0 = now(); let oHits = 0; const own = [];
      for (const t of traces) { const h = map.raySolid(t.x, t.y, t.z, t.dx, t.dy, t.dz, 30); if (h) { oHits++; own.push(h.dist); } }
      const ownUs = Math.round(((now() - t0) * 1000) / traces.length * 10) / 10;

      rec[k] = { colliders: w.colliders.len(), rapierUs, ownUs, rapierHits: rHits, ownHits: oHits };
    }
    return rec;
  },

  /** Настилы-призмы: convexHull против trimesh, и сходятся ли они с аналитикой. */
  decks: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const prisms = map.prisms.filter((p) => p.poly && p.poly.length >= 3 && Number.isFinite(p.v0));
    const corners = prisms.map(prismCorners);
    const nonEmpty = corners.filter((c) => c.length >= 8);

    const w1 = new Rp.World({ x: 0, y: -9.81, z: 0 });
    let t0 = now(), hullOk = 0, hullFail = 0;
    for (const c of nonEmpty) {
      const rb = w1.createRigidBody(Rp.RigidBodyDesc.fixed());
      const pts = [];
      for (const p of c) pts.push({ x: p[0], y: p[1], z: p[2] });
      try {
        w1.createCollider(Rp.ColliderDesc.convexHull(pts), rb);
        hullOk++;
      } catch (e) { hullFail++; }
    }
    const hullMs = Math.round(now() - t0);
    w1.step();

    const w2 = new Rp.World({ x: 0, y: -9.81, z: 0 });
    t0 = now();
    let triOk = 0, triFail = 0;
    for (const p of prisms) {
      const g = map._prismGeo(p);
      if (!g || !g.attributes || !g.attributes.position) { triFail++; continue; }
      const pos = Array.from(g.attributes.position.array);
      const idx = g.index ? Array.from(g.index.array) : pos.map((_, i) => i);
      const verts = [];
      for (let i = 0; i < pos.length; i += 3) verts.push({ x: pos[i], y: pos[i + 1], z: pos[i + 2] });
      try {
        const rb = w2.createRigidBody(Rp.RigidBodyDesc.fixed());
        w2.createCollider(Rp.ColliderDesc.trimesh(new Float32Array(pos), new Uint32Array(idx)), rb);
        triOk++;
      } catch (e) { triFail++; }
    }
    const triMs = Math.round(now() - t0);
    w2.step();

    // расхождение опоры: аналитический верх против луча по hull-коллайдеру
    const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
    let worst = 0, sum = 0, n = 0;
    const samples = [];
    for (const p of prisms.slice(0, 40)) {
      const c = prismCorners(p);
      if (c.length < 8) continue;
      let cx = 0, cz = 0;
      for (const v of c) { cx += v[0]; cz += v[2]; }
      cx /= c.length; cz /= c.length;
      for (let i = 0; i < 40; i++) {
        const x = cx + (Math.random() - 0.5) * 6, z = cz + (Math.random() - 0.5) * 6;
        const own = map.groundHeightAt(x, z, 1e6);
        ray.origin.x = x; ray.origin.y = 60; ray.origin.z = z;
        const h = w1.castRay(ray, 120, true);
        if (!h) continue;
        const y = 60 - h.timeOfImpact;
        const d = Math.abs(y - own);
        if (d > worst) worst = d;
        sum += d; n++;
      }
    }
    return { prisms: prisms.length, hull: { ok: hullOk, fail: hullFail, buildMs: hullMs, colliders: w1.colliders.len() },
      trimesh: { ok: triOk, fail: triFail, buildMs: triMs, colliders: w2.colliders.len() },
      supportDeviation: { samples: n, worstM: Math.round(worst * 1000) / 1000, meanM: Math.round((sum / Math.max(1, n)) * 1000) / 1000 } };
  },

  /** Тело: шар-запрос и castShape против isBlocked / resolveSphere. */
  bodies: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k], w = PB.worlds[k] || worldFromSolids(map);
      const ball = new Rp.Ball(0.45);
      const q = new Rp.Quaternion(0, 0, 0, 1);
      const pts = [];
      for (let i = 0; i < 4000; i++) pts.push({ x: (Math.random() * 2 - 1) * map.width * 0.4, z: (Math.random() * 2 - 1) * map.width * 0.4 });
      const pos = { x: 0, y: 1.0, z: 0 };
      for (const p of pts.slice(0, 200)) { pos.x = p.x; pos.z = p.z; w.intersectionsWithShape(pos, q, ball, () => {}); }
      let t0 = now(), rN = 0;
      for (const p of pts) {
        pos.x = p.x; pos.z = p.z;
        let count = 0;
        w.intersectionsWithShape(pos, q, ball, () => { count++; });
        if (count) rN++;
      }
      const rapierShapeUs = Math.round(((now() - t0) * 1000) / pts.length * 10) / 10;

      t0 = now(); let oN = 0;
      for (const p of pts) if (map.isBlocked(p.x, p.z, 0.45, 0.55, 1.8)) oN++;
      const ownIsBlockedUs = Math.round(((now() - t0) * 1000) / pts.length * 10) / 10;

      t0 = now();
      for (const p of pts) map.groundHeightAt(p.x, p.z, 1.0);
      const ownGroundUs = Math.round(((now() - t0) * 1000) / pts.length * 10) / 10;

      // castShape — то, чем менялся бы resolveSphere: выталкивание шара наружу
      t0 = now();
      let casts = 0;
      for (const p of pts.slice(0, 1000)) {
        pos.x = p.x; pos.z = p.z;
        const hit = w.castShape(pos, q, { x: 0.3, y: 0, z: 0.3 }, ball, 0.0, 1.0, true);
        if (hit) casts++;
      }
      const castShapeUs = Math.round(((now() - t0) * 1000) / 1000 * 10) / 10;

      rec[k] = { rapierShapeUs, ownIsBlockedUs, ownGroundUs, castShapeUs, rapierBlocked: rN, ownBlocked: oN, castHits: casts };
    }
    return rec;
  },

  /** Heightfield рельефа: расхождение с аналитическим полем и цена пробы. */
  relief: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    if (!map.relief) return { skipped: 'no relief' };
    const rec = {};
    for (const cell of [8, 4, 2]) {
      const n = Math.round(map.width / cell);
      const heights = new Float32Array((n + 1) * (n + 1));
      const half = map.width / 2;
      for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
        heights[i * (n + 1) + j] = map.relief.heightAt(-half + i * cell, -half + j * cell);
      }
      const t0 = now();
      const w = new Rp.World({ x: 0, y: -9.81, z: 0 });
      const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed());
      w.createCollider(Rp.ColliderDesc.heightfield(n, n, heights, { x: map.width, y: 1, z: map.width }), rb);
      const buildMs = Math.round(now() - t0);
      w.step();

      const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      let worst = 0, sum = 0, cnt = 0, misses = 0;
      const t1 = now();
      for (let s = 0; s < 8000; s++) {
        const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
        ray.origin.x = x; ray.origin.y = 60; ray.origin.z = z;
        const h = w.castRay(ray, 120, true);
        if (!h) { misses++; continue; }
        const y = 60 - h.timeOfImpact;
        const d = Math.abs(y - map.relief.heightAt(x, z));
        if (d > worst) worst = d;
        sum += d; cnt++;
      }
      const probeUs = Math.round(((now() - t1) * 1000) / 8000 * 10) / 10;
      rec['cell' + cell] = { grid: n + 1, buildMs, probeUs, samples: cnt, misses,
        worstDeviationM: Math.round(worst * 1000) / 1000, meanDeviationM: Math.round((sum / Math.max(1, cnt)) * 10000) / 10000 };
    }
    return rec;
  },

  /** Контроллер: цена, шаг на бордюр и сравнение с нынешней осевой схемой. */
  controller: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const w = PB.worlds.ch12 || worldFromSolids(map);
    const ctrl = w.createCharacterController(0.02);
    ctrl.enableAutostep(0.6, 0.3, true);
    ctrl.enableSnapToGround(0.5);
    ctrl.setMaxSlopeClimbAngle(50);
    ctrl.setMinSlopeSlideAngle(45);
    const half = map.width / 2;

    // посадка на узел графа: там нога гарантированно стоит на опоре
    const nodes = map.nav.pos;
    const pick = [];
    for (let i = 0; i < 400; i++) pick.push(nodes[Math.floor(Math.random() * nodes.length)]);

    const rb = w.createRigidBody(Rp.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 200, 0));
    const col = w.createCollider(Rp.ColliderDesc.capsule(0.9, 0.45), rb);
    const q = new Rp.Quaternion(0, 0, 0, 1);

    let moved = 0, blocked = 0, groundedTrue = 0, usSum = 0, supportGap = 0, gapN = 0;
    for (const p of pick) {
      rb.setTranslation({ x: p.x, y: p.y + 1.2, z: p.z }, true);
      w.step();
      const desired = { x: 0.08, y: -0.02, z: 0.08 };
      const t0 = now();
      ctrl.computeColliderMovement(col, desired);
      usSum += (now() - t0) * 1000;
      const mv = ctrl.computedMovement();
      if (Math.abs(mv.x) < 0.079 || Math.abs(mv.z) < 0.079) blocked++; else moved++;
      if (ctrl.computedGrounded()) groundedTrue++;
      // опора после движения против ответа карты в той же точке
      const nx = p.x + mv.x, nz = p.z + mv.z;
      const own = map.groundHeightAt(nx, nz, p.y + 1.2);
      const ray = new Rp.Ray({ x: nx, y: 60, z: nz }, { x: 0, y: -1, z: 0 });
      const h = w.castRay(ray, 120, true);
      if (h) { supportGap = Math.max(supportGap, Math.abs((60 - h.timeOfImpact) - own)); gapN++; }
    }
    // цена step() на окне и на всём городе, с одним и с восемью телами
    const stepCost = (world, bodies) => {
      for (let i = 0; i < 30; i++) world.step();
      const t = now();
      for (let i = 0; i < 200; i++) world.step();
      const per = Math.round(((now() - t) * 1000) / 200 * 10) / 10;
      for (let i = 0; i < bodies; i++) {
        const b = world.createRigidBody(Rp.RigidBodyDesc.kinematicPositionBased().setTranslation(i * 2, 200, 0));
        world.createCollider(Rp.ColliderDesc.capsule(0.9, 0.45), b);
      }
      world.step();
      const t2 = now();
      for (let i = 0; i < 200; i++) world.step();
      return { us: per, usWithBodies: Math.round(((now() - t2) * 1000) / 200 * 10) / 10, bodies: bodies + 1 };
    };
    const chunkWorld = worldFromSolids(map, 337);
    const fullWorld = PB.worlds.ch12;
    return { usPerMoveWarm: Math.round((usSum / pick.length) * 100) / 100, blocked, moved, groundedTrue, of: pick.length,
      supportGapMaxM: Math.round(supportGap * 1000) / 1000, gapSamples: gapN,
      stepChunk1: stepCost(chunkWorld, 0), stepFull1: stepCost(worldFromSolids(map), 1), stepFull8: stepCost(worldFromSolids(map), 8) };
  },

  /** Профильщик Rapier: из чего складывается step. */
  profiler: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const w = worldFromSolids(map);
    const rb = w.createRigidBody(Rp.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 100, 0));
    rb.setVelocity({ x: 1, y: -1, z: 1 }, true);
    w.createCollider(Rp.ColliderDesc.capsule(0.9, 0.45).setDensity(1), rb);
    let setOk = false;
    try { w.profilerEnabled = true; setOk = true; } catch (e) { setOk = 'ERR ' + e.message; }
    for (let i = 0; i < 300; i++) w.step();
    const read = (n) => { try { return w[n]; } catch (e) { return 'ERR'; } };
    return { setOk, step: read('timingStep'), broad: read('timingBroadPhase'), narrow: read('timingNarrowPhase'), solver: read('timingSolver') };
  },

  /** Детерминизм с попадаями: два прогона луча — те же числа? */
  determinism: async () => {
    const Rp = R();
    const w = PB.worlds.ch12 || worldFromSolids(window.RB.maps.ch12);
    const cast = () => {
      const out = [];
      const ray = new Rp.Ray({ x: -100, y: 40, z: -100 }, { x: 0.4, y: -0.8, z: 0.4 });
      for (let i = 0; i < 800; i++) {
        ray.origin.x = -100 + (i % 25) * 8; ray.origin.z = -100 + Math.floor(i / 25) * 8;
        const h = w.castRay(ray, 80, true);
        out.push(h ? Math.round(h.timeOfImpact * 1e9) : -1);
      }
      return out;
    };
    const a = cast(), b = cast();
    let diff = 0, hits = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) diff++; if (a[i] >= 0) hits++; }
    return { samples: a.length, hits, differing: diff };
  },

  /** Выгрузка окна: removeCollider + free, и остаётся ли память. */
  evict: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const t0 = now();
    const w = new Rp.World({ x: 0, y: -9.81, z: 0 });
    const cols = [];
    for (const s of map.solids.slice(0, 337)) {
      const dx = s.maxX - s.minX, dy = s.maxY - s.minY, dz = s.maxZ - s.minZ;
      if (dx <= 0 || dy <= 0 || dz <= 0) continue;
      const rb = w.createRigidBody(Rp.RigidBodyDesc.fixed().setTranslation((s.minX + s.maxX) / 2, (s.minY + s.maxY) / 2, (s.minZ + s.maxZ) / 2));
      cols.push(w.createCollider(Rp.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb));
    }
    w.step();
    const buildMs = Math.round(now() - t0);
    const heapBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const t1 = now();
    for (const c of cols) w.removeCollider(c, false);
    const evictMs = Math.round(now() - t1);
    const t2 = now();
    w.step();
    const stepAfterMs = Math.round(now() - t2);
    const t3 = now();
    w.free();
    const freeMs = Math.round(now() - t3);
    return { colliders: cols.length, buildMs, evictMs, stepAfterMs, freeMs,
      heapDeltaKB: performance.memory ? Math.round((performance.memory.usedJSHeapSize - heapBefore) / 1024) : null };
  },

  /** Цена одного тела-капсулы при N телах: масштабирование толпы. */
  crowd: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const w = worldFromSolids(map);
    const ctrl = w.createCharacterController(0.02);
    ctrl.enableAutostep(0.6, 0.3, true);
    const nodes = map.nav.pos;
    const bodies = [];
    const add = (n) => {
      for (let i = 0; i < n; i++) {
        const p = nodes[(i * 137) % nodes.length];
        const rb = w.createRigidBody(Rp.RigidBodyDesc.kinematicPositionBased().setTranslation(p.x, p.y + 1.2, p.z));
        const col = w.createCollider(Rp.ColliderDesc.capsule(0.9, 0.45), rb);
        bodies.push({ rb, col, p });
      }
      w.step();
    };
    const measure = () => {
      const t = now();
      for (const b of bodies) ctrl.computeColliderMovement(b.col, { x: 0.08, y: -0.03, z: 0.08 });
      return Math.round(((now() - t) * 1000) / bodies.length * 100) / 100;
    };
    const rec = {};
    for (const n of [1, 4, 8, 16, 32]) { add(n - (n === 1 ? 1 : n === 4 ? 1 : n === 8 ? 4 : n === 16 ? 8 : 16)); rec['bodies' + n] = { count: bodies.length, usPerBody: measure() }; }
    return rec;
  },
};

export default PB;
