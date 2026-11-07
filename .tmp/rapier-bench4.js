/**
 * Четвёртый заход: корректные роли коллайдеров (солид — только пуле, блокер —
 * телу, перила — обоим), оба знака yaw, и **точная** доля конструктора, которую
 * съедает валидация рёбер графа. Черновик. Стадии: `P4.run('roles')`,
 * `P4.run('edges')`, `P4.run('support')`, `P4.run('evict')`, `P4.run('mem')`.
 */
const R = () => window.RB.R;
const P4 = { out: {}, W: {} };
window.P4 = P4;
const now = () => performance.now();
const M_RAY = 0x0001, M_BODY = 0x0002, M_BOTH = 0x0003;
const g = (mem) => ((mem << 16) | 0xffff);
const Q_RAY = (0xffff << 16) | M_RAY;
const Q_BODY = (0xffff << 16) | M_BODY;

async function stage(key, fn) {
  P4.out[key] = { status: 'running' };
  const t0 = now();
  try { P4.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...(await fn()) }; }
  catch (e) { P4.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String((e && e.stack) ? String(e.stack).slice(0, 300) : e) }; }
  return P4.out[key];
}
P4.run = (k) => stage(k, STAGES[k]);

function prismCorners(p) {
  const P = (u, y, v) => (p.frame
    ? [p.frame.cx + u * p.frame.c - v * p.frame.s, y, p.frame.cz + u * p.frame.s + v * p.frame.c]
    : (p.axis === 'x' ? [u, y, v] : [v, y, u]));
  const out = [];
  for (const v of [p.v0, p.v1]) for (const [u, y] of p.poly) out.push(P(u, y, v));
  return out;
}

/**
 * Полный твёрдостный мир главы. `rot` — знак yaw для OBB, `oneBody` — все
 * коллайдеры на одном fixed-теле (то, что нужно стримингу: выгрузка = один вызов).
 */
function buildWorld(map, rot, oneBody) {
  const Rp = R();
  const w = new Rp.World({ x: 0, y: 0, z: 0 });
  const shared = oneBody ? w.createRigidBody(Rp.RigidBodyDesc.fixed()) : null;
  const boxes = (plan, y0, y1, mem) => {
    const hy = (y1 - y0) / 2, cy = (y0 + y1) / 2;
    let rb, desc;
    const obb = plan.obb;
    if (obb && rot !== 0) {
      const ang = Math.atan2(obb.s, obb.c) * rot;
      desc = Rp.ColliderDesc.cuboid(obb.hx, hy, obb.hz).setCollisionGroups(g(mem));
      rb = oneBody ? shared : w.createRigidBody(Rp.RigidBodyDesc.fixed()
        .setTranslation(obb.cx, cy, obb.cz).setRotation({ x: 0, y: Math.sin(ang / 2), z: 0, w: Math.cos(ang / 2) }));
      if (oneBody) w.createCollider(desc.setRotation(descRot(ang)).setTranslation(obb.cx, cy, obb.cz), rb);
      else w.createCollider(desc, rb);
      return;
    }
    desc = Rp.ColliderDesc.cuboid((plan.maxX - plan.minX) / 2, hy, (plan.maxZ - plan.minZ) / 2).setCollisionGroups(g(mem));
    rb = oneBody ? shared : w.createRigidBody(Rp.RigidBodyDesc.fixed().setTranslation((plan.minX + plan.maxX) / 2, cy, (plan.minZ + plan.maxZ) / 2));
    w.createCollider(oneBody ? desc.setTranslation((plan.minX + plan.maxX) / 2, cy, (plan.minZ + plan.maxZ) / 2) : desc, rb);
  };
  for (const s of map.solids) boxes(s, s.minY, s.maxY, M_RAY);
  for (const b of map.blockers) boxes(b, b.y0, b.y1, M_BODY);
  for (const r of map.rails) {
    const p = r.kind === 'wedge' ? r.w : r.s;
    if (!p || !p.poly) continue;
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try {
      const rb = oneBody ? shared : w.createRigidBody(Rp.RigidBodyDesc.fixed());
      w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_BOTH)), rb);
    } catch (e) { /* не выпуклый профиль */ }
  }
  for (const p of map.prisms) {
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try {
      const rb = oneBody ? shared : w.createRigidBody(Rp.RigidBodyDesc.fixed());
      w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_RAY)), rb);
    } catch (e) { /* пропускаем */ }
  }
  w.step();
  return { w, shared };
}
function descRot(ang) { return { x: 0, y: Math.sin(ang / 2), z: 0, w: Math.cos(ang / 2) }; }

const STAGES = {
  /** Согласие тело/луч при корректных ролях, для обоих знаков yaw. */
  roles: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const half = map.width / 2;
      const per = {};
      for (const rot of [1, -1]) {
        const { w } = buildWorld(map, rot, false);
        const q = new Rp.Quaternion(0, 0, 0, 1);
        const cap = new Rp.Capsule(0.9, 0.45);
        const pos = { x: 0, y: 0, z: 0 };
        const pts = [];
        for (let i = 0; i < 4000; i++) {
          const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
          pts.push({ x, z, y: map.groundHeightAt(x, z, 1e6) });
        }
        let t0 = now(), onlyR = 0, onlyO = 0, bothB = 0, free = 0;
        for (const p of pts) {
          const own = map.isBlocked(p.x, p.z, 0.45, p.y + 0.05, 1.8);
          pos.x = p.x; pos.y = p.y + 0.05 + 1.35; pos.z = p.z;
          let hit = false;
          w.intersectionsWithShape(pos, q, cap, () => { hit = true; }, undefined, Q_BODY);
          if (hit && own) bothB++; else if (hit) onlyR++; else if (own) onlyO++; else free++;
        }
        const rapierBodyUs = Math.round(((now() - t0) * 1000) / pts.length * 10) / 10;
        const tOwn = now();
        for (const p of pts) map.isBlocked(p.x, p.z, 0.45, p.y + 0.05, 1.8);
        const ownBodyUs = Math.round(((now() - tOwn) * 1000) / pts.length * 10) / 10;

        // луч: разложение только-наших-попаданий на «грунт/поле» и «стена»
        const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
        let rHit = 0, oHit = 0, bothHit = 0, ownGroundOnly = 0, ownWallOnly = 0, devMed = 0, devMax = 0;
        const devs = [];
        t0 = now();
        for (const t of pts.slice(0, 2000)) {
          const a = Math.random() * Math.PI * 2;
          const dx = Math.cos(a) * 0.4, dy = -0.9, dz = Math.sin(a) * 0.4;
          const n = Math.hypot(dx, dy, dz);
          const oy = t.y + 1.6;
          ray.origin.x = t.x; ray.origin.y = oy; ray.origin.z = t.z;
          ray.dir.x = dx / n; ray.dir.y = dy / n; ray.dir.z = dz / n;
          const h = w.castRay(ray, 25, true, undefined, Q_RAY);
          const o = map.raySolid(t.x, oy, t.z, dx / n, dy / n, dz / n, 25);
          if (h) rHit++;
          if (o) oHit++;
          if (h && o) { bothHit++; devs.push(Math.abs(h.timeOfImpact - o.dist)); }
          else if (o) {
            // наше попадание в поле/грунт: нормаль вертикальна и отметка = опоре точки
            const fld = Math.abs(o.ny) > 0.7 && Math.abs(o.y - map.relief.heightAt(o.x, o.z)) < 0.2;
            if (fld) ownGroundOnly++; else ownWallOnly++;
          }
        }
        const rapierRayUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;
        devs.sort((a, b) => a - b);
        devMed = devs.length ? devs[devs.length >> 1] : 0;
        devMax = devs.length ? devs[devs.length - 1] : 0;
        const colliders = w.colliders.len();
        if (rot === -1) P4.W[k] = w;
        else w.free();
        per['rot' + rot] = { colliders,
          body: { both: bothB, onlyRapier: onlyR, onlyOwn: onlyO, free, of: pts.length, rapierUs: rapierBodyUs, ownUs: ownBodyUs },
          ray: { rapierHits: rHit, ownHits: oHit, both: bothHit, ownFieldOnly: ownGroundOnly, ownWallOnly, of: 2000,
            rapierUs: rapierRayUs, devMedianM: Math.round(devMed * 1000) / 1000, devMaxM: Math.round(devMax * 100) / 100 } };
      }
      rec[k] = per;
    }
    return rec;
  },

  /** Полная цена валидации ВСЕХ рёбер графа главы: our bodyClearLine против sweep. */
  edges: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k], w = P4.W[k];
      if (!w) throw new Error('roles не отработал: нет мира ' + k);
      const nav = map.nav;
      const edges = [];
      for (let i = 0; i < nav.adj.length; i++) {
        for (const j of nav.adj[i]) if (j > i) edges.push([nav.pos[i], nav.pos[j]]);
      }
      const t0 = now();
      let ownClear = 0;
      for (const [a, b] of edges) if (map.bodyClearLine(a, b, 0.45, 1.8)) ownClear++;
      const ownMs = Math.round(now() - t0);

      const ball = new Rp.Ball(0.45), q = new Rp.Quaternion(0, 0, 0, 1);
      const t1 = now();
      let rClear = 0, disagreeBlocked = 0, disagreeFree = 0;
      const ownSet = new Set();
      let i = 0;
      for (const [a, b] of edges) {
        const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz) || 1;
        const from = { x: a.x, y: Math.max(a.y, b.y) + 1.35, z: a.z };
        const hit = w.castShape(from, q, { x: dx / len * (len + 0.9), y: 0, z: dz / len * (len + 0.9) }, ball, 0, 1, true, undefined, Q_BODY);
        const own = map.bodyClearLine(a, b, 0.45, 1.8);
        if (!hit) rClear++;
        if (hit && own) disagreeBlocked++;
        if (!hit && !own) disagreeFree++;
        i++;
      }
      const rapierMs = Math.round(now() - t1);
      const t2 = now();
      for (const [a, b] of edges) map._edgeSupported(a, b);
      const supportMs = Math.round(now() - t2);

      rec[k] = { edges: edges.length, ownClearMs: ownMs, rapierSweepMs: rapierMs, ownSupportMs: supportMs,
        ownClearPasses: ownClear, rapierClearPasses: rClear,
        rapierBlocksButOwnClear: disagreeBlocked, ownBlocksButRapierClear: disagreeFree,
        mapCtorMs: window.RB.out.maps[k].ctorMs };
    }
    return rec;
  },

  /** Опора:Rapier-луч вниз против groundHeightAt, раздельно «плита» и «поле». */
  support: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k], w = P4.W[k];
      if (!w) throw new Error('roles не отработал: нет мира ' + k);
      const half = map.width / 2;
      const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      let plateN = 0, plateMismatch = 0, plateWorst = 0, plateSum = 0;
      let fieldN = 0, fieldNoHit = 0;
      const t0 = now();
      for (let i = 0; i < 8000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
        const feet = map.groundHeightAt(x, z, 1e6);
        const own = map.groundHeightAt(x, z, feet);
        const onField = Math.abs(own - map.relief.heightAt(x, z)) < 0.001;
        if (onField) { fieldN++; ray.origin.x = x; ray.origin.y = feet + 0.62; ray.origin.z = z; if (!w.castRay(ray, 30, true, undefined, Q_RAY)) fieldNoHit++; continue; }
        plateN++;
        ray.origin.x = x; ray.origin.y = feet + 0.62; ray.origin.z = z;
        const h = w.castRay(ray, 30, true, undefined, Q_RAY);
        if (!h) { plateMismatch++; continue; }
        const d = Math.abs((feet + 0.62 - h.timeOfImpact) - own);
        if (d > 0.02) plateMismatch++;
        if (d > plateWorst) plateWorst = d;
        plateSum += d;
      }
      const us = Math.round(((now() - t0) * 1000) / 8000 * 10) / 10;
      rec[k] = { plateSamples: plateN, plateMismatch, plateWorstM: Math.round(plateWorst * 1000) / 1000,
        plateMeanM: Math.round((plateSum / Math.max(1, plateN)) * 1000) / 1000,
        fieldSamples: fieldN, fieldNoHitFromRapier: fieldNoHit, perProbeUs: us };
    }
    return rec;
  },

  /** Выгрузка окна: один body на чанк против тела-на-коллайдер. */
  evict: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const rec = {};
    for (const oneBody of [false, true]) {
      const t0 = now();
      const { w, shared } = buildWorld(map, -1, oneBody);
      const buildMs = Math.round(now() - t0);
      const t1 = now();
      if (oneBody) w.removeRigidBody(shared, false);
      else { const bs = []; w.forEachRigidBody((b) => bs.push(b)); for (const b of bs) w.removeRigidBody(b, false); }
      const removeMs = Math.round(now() - t1);
      const t2 = now();
      w.step();
      const stepMs = Math.round(now() - t2);
      rec[oneBody ? 'oneBody' : 'bodyPerCollider'] = { colliders: w.colliders.len(), bodies: w.bodies.len(), buildMs, removeMs, stepAfterRemoveMs: stepMs };
      w.free();
    }
    return rec;
  },

  /** Память: сколько JS-кучи и сколько объектов на 0,36 км² и на 10 км² экstrapолированно. */
  mem: async () => {
    const Rp = R();
    const map = window.RB.maps.ch12;
    const before = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const worlds = [];
    for (let i = 0; i < 8; i++) worlds.push(buildWorld(map, -1, true).w);
    const after = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const perWorldKB = performance.memory ? Math.round((after - before) / 1024 / worlds.length) : null;
    const wasm = Rp.scratchBuffer ? 'scratch ok' : 'n/a';
    for (const w of worlds) w.free();
    return { worlds: worlds.length, collidersEach: map.solids.length + map.blockers.length, perWorldHeapKB: perWorldKB, wasm,
      heapMBNow: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null };
  },
};

export default P4;
