/**
 * Прогон осуществимости Rapier3D (одноразовый черновик, в репозиторий не едет).
 *
 * Ганзяется порциями из консоли страницы: `await import('/.tmp/rapier-bench.js')`
 * затем `RB.run('init')`, `RB.run('maps')`, … Результаты — `RB.out`.
 * Каждая стадия пишет и время, и число объектов, и ошибку текстом: план обязан
 * стоять на числах, а не на предположении, что API работает как в документации.
 */

const CDN = 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/+esm';

const RB = {
  out: {},
  R: null,
  maps: {},
  worlds: {},
  log: [],
};
window.RB = RB;

const now = () => performance.now();
const push = (s) => { RB.log.push(s); };

async function stage(key, fn) {
  RB.out[key] = { status: 'running' };
  const t0 = now();
  try {
    const r = await fn();
    RB.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...r };
  } catch (e) {
    RB.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String(e && e.message || e) };
  }
  push(`${key}: ${RB.out[key].status}`);
  return RB.out[key];
}

RB.run = (key) => stage(key, STAGES[key]);

async function loadRapier() {
  if (RB.R) return RB.R;
  const t0 = now();
  const mod = await import(CDN);
  const R = mod.default ?? mod;
  const tImport = now() - t0;
  const t1 = now();
  await R.init();
  const tInit = now() - t1;
  const res = performance.getEntriesByType('resource').filter((r) => r.name.includes('rapier'))
    .map((r) => ({ name: r.name.slice(-60), transferSize: r.transferSize, encodedBodySize: r.encodedBodySize, decodedBodySize: r.decodedBodySize, duration: Math.round(r.duration) }));
  RB.R = R;
  return { tImport: Math.round(tImport), tInit: Math.round(tInit), resources: res, version: R.version ? R.version() : 'n/a' };
}

/** Карта главы целиком + срез чанка 300×300 по XZ. */
function solidsInWindow(map, cx, cz, half) {
  const out = [];
  for (const s of map.solids) {
    if (s.maxX < cx - half || s.minX > cx + half) continue;
    if (s.maxZ < cz - half || s.minZ > cz + half) continue;
    out.push(s);
  }
  return out;
}

function blockersInWindow(map, cx, cz, half) {
  const out = [];
  for (const b of map.blockers) {
    if (b.maxX < cx - half || b.minX > cx + half) continue;
    if (b.maxZ < cz - half || b.minZ > cz + half) continue;
    out.push(b);
  }
  return out;
}

const STAGES = {
  init: async () => loadRapier(),

  maps: async () => {
    const { createJsonMap } = await import('/src/json-map.js');
    const rec = {};
    for (const n of ['12', '13']) {
      const mod = await import(`/src/levels/level-${n}.js`);
      const level = Object.values(mod).find((v) => v && v.map) || mod.default;
      const t0 = now();
      const map = createJsonMap(level.map);
      const ctorMs = Math.round(now() - t0);
      RB.maps['ch' + n] = map;
      rec['ch' + n] = {
        ctorMs,
        solids: map.solids.length,
        blockers: map.blockers.length,
        surfaces: map.surfaces.length,
        prisms: map.prisms.length,
        rails: map.rails.length,
        sweeps: map.sweeps ? map.sweeps.length : 0,
        holes: map.holes ? map.holes.length : 0,
        nodes: map.nav ? map.nav.adj.length : 0,
        relief: !!map.relief,
        groundSize: map.width,
        obbKeys: (() => { const o = map.solids.find((s) => s.obb); return o ? Object.keys(o.obb) : null; })(),
      };
    }
    return rec;
  },

  /** Сколько геометрии в чанке 300 × 300 (то, во что ударится сборка коллайдеров). */
  chunk: async () => {
    const rec = {};
    for (const k of Object.keys(RB.maps)) {
      const map = RB.maps[k];
      const half = map.width / 2;
      const cells = {};
      for (const [cx, cz] of [[0, 0], [half * 0.4, -half * 0.4]]) {
        const s = solidsInWindow(map, cx, cz, 150);
        const b = blockersInWindow(map, cx, cz, 150);
        cells[`c${cx},${cz}`] = { solids: s.length, blockers: b.length, obb: s.filter((x) => x.obb).length };
      }
      rec[k] = cells;
    }
    return rec;
  },

  /** Сборка мира Rapier: чанк 300×300 и весь город, солиды + блокер-копии. */
  colliders: async () => {
    const R = RB.R;
    const rec = {};
    for (const k of Object.keys(RB.maps)) {
      const map = RB.maps[k];
      const half = map.width / 2;
      const cx = 0, cz = 0, win = 150;
      const chunkSolids = solidsInWindow(map, cx, cz, win);
      const chunkBlockers = blockersInWindow(map, cx, cz, win);

      const t0 = now();
      const w1 = new R.World({ x: 0, y: -9.81, z: 0 });
      for (const s of chunkSolids) {
        const dx = s.maxX - s.minX, dy = s.maxY - s.minY, dz = s.maxZ - s.minZ;
        if (dx <= 0 || dy <= 0 || dz <= 0) continue;
        const rb = w1.createRigidBody(R.RigidBodyDesc.fixed()
          .setTranslation((s.minX + s.maxX) / 2, (s.minY + s.maxY) / 2, (s.minZ + s.maxZ) / 2));
        w1.createCollider(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb);
      }
      const chunkMs = Math.round(now() - t0);

      const t1 = now();
      const w2 = new R.World({ x: 0, y: -9.81, z: 0 });
      for (const s of map.solids) {
        const dx = s.maxX - s.minX, dy = s.maxY - s.minY, dz = s.maxZ - s.minZ;
        if (dx <= 0 || dy <= 0 || dz <= 0) continue;
        const rb = w2.createRigidBody(R.RigidBodyDesc.fixed()
          .setTranslation((s.minX + s.maxX) / 2, (s.minY + s.maxY) / 2, (s.minZ + s.maxZ) / 2));
        w2.createCollider(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb);
      }
      const fullMs = Math.round(now() - t1);

      rec[k] = {
        chunk: { solids: chunkSolids.length, blockers: chunkBlockers.length, buildMs: chunkMs,
          colliders: w1.colliders.len(), bodies: w1.bodies.len() },
        full: { solids: map.solids.length, buildMs: fullMs, colliders: w2.colliders.len(), bodies: w2.bodies.len() },
        heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      };
      RB.worlds[k + '_chunk'] = w1;
      RB.worlds[k + '_full'] = w2;
      RB.worlds[k + '_chunkBlockers'] = (() => {
        const t = now();
        const w = new R.World({ x: 0, y: -9.81, z: 0 });
        for (const b of chunkBlockers) {
          const dx = b.maxX - b.minX, dy = b.y1 - b.y0, dz = b.maxZ - b.minZ;
          if (dx <= 0 || dy <= 0 || dz <= 0) continue;
          const rb = w.createRigidBody(R.RigidBodyDesc.fixed()
            .setTranslation((b.minX + b.maxX) / 2, (b.y0 + b.y1) / 2, (b.minZ + b.maxZ) / 2));
          w.createCollider(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb);
        }
        RB.worlds[k + '_chunkMsBlockers'] = Math.round(now() - t);
        return w;
      })();
    }
    return rec;
  },

  /** Луч: Rapier против нынешних raySolid / rayHitDistance на тех же трассах. */
  rays: async () => {
    const R = RB.R;
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = RB.maps[k], w = RB.worlds[k + '_full'];
      if (!map || !w) continue;
      const half = map.width / 2;
      const origins = [];
      for (let i = 0; i < 2000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.8;
        const z = (Math.random() * 2 - 1) * half * 0.8;
        const y = map.groundHeightAt(x, z, 1e6) + 1.6;
        const a = Math.random() * Math.PI * 2;
        origins.push({ x, y, z, dx: Math.cos(a) * 0.4, dy: -0.6, dz: Math.sin(a) * 0.4 });
      }
      const ray = new R.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      // разогрев
      for (let i = 0; i < 200; i++) {
        const o = origins[i];
        ray.origin.x = o.x; ray.origin.y = o.y; ray.origin.z = o.z;
        ray.dir.x = o.dx; ray.dir.y = o.dy; ray.dir.z = o.dz;
        w.castRay(ray, 30, true);
      }
      let t0 = now(), hits = 0;
      for (let i = 0; i < 2000; i++) {
        const o = origins[i];
        ray.origin.x = o.x; ray.origin.y = o.y; ray.origin.z = o.z;
        ray.dir.x = o.dx; ray.dir.y = o.dy; ray.dir.z = o.dz;
        if (w.castRay(ray, 30, true)) hits++;
      }
      const rapierRayUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      t0 = now();
      let ownHits = 0;
      for (const o of origins) if (map.raySolid(o.x, o.y, o.z, o.dx, o.dy, o.dz, 30)) ownHits++;
      const ownRayUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      rec[k] = { rapierRayUs, ownRayUs, rapierHits: hits, ownHits };
    }
    return rec;
  },

  /** Тело: шар-запрос Rapier против isBlocked и resolveSphere. */
  bodies: async () => {
    const R = RB.R;
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = RB.maps[k], w = RB.worlds[k + '_chunk'];
      if (!map || !w) continue;
      const ball = new R.Ball(0.45);
      const pts = [];
      for (let i = 0; i < 2000; i++) {
        pts.push({ x: (Math.random() * 2 - 1) * 140, z: (Math.random() * 2 - 1) * 140 });
      }
      const pos = new R.Vector(0, 0, 0);
      const q = new R.Quaternion(0, 0, 0, 1);
      let t0 = now(), n = 0;
      for (const p of pts) {
        pos.x = p.x; pos.y = 1.0; pos.z = p.z;
        let count = 0;
        w.intersectionsWithShape(pos, q, ball, () => { count++; });
        if (count) n++;
      }
      const rapierShapeUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      t0 = now();
      let ownN = 0;
      for (const p of pts) if (map.isBlocked(p.x, p.z, 0.45, 0.2, 1.8)) ownN++;
      const ownIsBlockedUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      // опора: одиночный вызов нынешней и поиск вниз лучом Rapier
      t0 = now();
      for (const p of pts) map.groundHeightAt(p.x, p.z, 1.0);
      const ownGroundUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;
      const ray = new R.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      t0 = now();
      for (const p of pts) {
        ray.origin.x = p.x; ray.origin.y = 60; ray.origin.z = p.z;
        w.castRay(ray, 120, true);
      }
      const rapierDownUs = Math.round(((now() - t0) * 1000) / 2000 * 10) / 10;

      rec[k] = { rapierShapeUs, ownIsBlockedUs, ownGroundUs, rapierDownUs, rapierContacts: n, ownBlocked: ownN };
    }
    return rec;
  },

  /** Контроллер персонажа: цена computeColliderMovement и шаг на бордюр. */
  controller: async () => {
    const R = RB.R;
    const map = RB.maps.ch12, w = RB.worlds.ch12_chunk;
    if (!map || !w) return { skipped: true };
    const ctrl = w.createCharacterController(0.01);
    const api = ['enableAutostep', 'enableSnapToGround', 'setMaxSlopeClimbAngle', 'setMinSlopeSlideAngle',
      'computedMovement', 'computedGrounded', 'numComputedCollisions', 'debugRender'].filter((m) => typeof ctrl[m] === 'function');
    const rb = w.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 2, 0));
    const col = w.createCollider(R.ColliderDesc.capsule(0.9, 0.45), rb);
    for (let i = 0; i < 300; i++) ctrl.computeColliderMovement(col, { x: 0.05, y: -0.05, z: 0.05 });
    let t0 = now();
    for (let i = 0; i < 3000; i++) ctrl.computeColliderMovement(col, { x: 0.05, y: -0.05, z: 0.05 });
    const usPerMove = Math.round(((now() - t0) * 1000) / 3000 * 100) / 100;

    t0 = now();
    for (let i = 0; i < 1000; i++) w.step();
    const stepUs = Math.round(((now() - t0) * 1000) / 1000 * 10) / 10;

    // бордюр: есть ли в чанке плоская опора и как её отвечает контроллер
    ctrl.enableAutostep(0.6, 0.3, true);
    ctrl.enableSnapToGround(0.6);
    ctrl.setMaxSlopeClimbAngle(50);
    ctrl.setMinSlopeSlideAngle(45);
    const grounded = ctrl.computedGrounded();
    const mv = ctrl.computedMovement();
    return { api, usPerMove, stepUs, grounded, movement: { x: mv.x, y: mv.y, z: mv.z }, colliders: w.colliders.len() };
  },

  /** Рельеф: heightfield-коллайдер против аналитического поля — расхождение опоры. */
  relief: async () => {
    const R = RB.R;
    const map = RB.maps.ch12;
    if (!map || !map.relief) return { skipped: 'no relief' };
    const cell = 8;
    const n = Math.round(map.width / cell);
    const heights = new Float32Array((n + 1) * (n + 1));
    const half = map.width / 2;
    let worst = 0, sum = 0, cnt = 0;
    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const x = -half + i * cell, z = -half + j * cell;
        const h = map.relief.heightAt(x, z);
        heights[i * (n + 1) + j] = h;
      }
    }
    const t0 = now();
    const w = new R.World({ x: 0, y: -9.81, z: 0 });
    const rb = w.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(0, 0, 0));
    w.createCollider(R.ColliderDesc.heightfield(n, n, heights, { x: map.width, y: 1, z: map.width }), rb);
    const buildMs = Math.round(now() - t0);

    const ray = new R.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
    let t1 = now(), misses = 0;
    for (let k = 0; k < 20000; k++) {
      const x = (Math.random() * 2 - 1) * half * 0.9;
      const z = (Math.random() * 2 - 1) * half * 0.9;
      ray.origin.x = x; ray.origin.y = 40; ray.origin.z = z;
      const hit = w.castRay(ray, 80, true);
      if (!hit) { misses++; continue; }
      const y = 40 - hit.timeOfImpact * 1.0;
      const own = map.relief.heightAt(x, z);
      const d = Math.abs(y - own);
      if (d > worst) worst = d;
      sum += d; cnt++;
    }
    const probeUs = Math.round(((now() - t1) * 1000) / 20000 * 10) / 10;
    return { buildMs, grid: n + 1, cell, worstDeviationM: Math.round(worst * 1000) / 1000,
      meanDeviationM: Math.round((sum / Math.max(1, cnt)) * 1000) / 1000, samples: cnt, misses, probeUs,
      ownGroundUs: (() => { const t = now(); for (let i = 0; i < 20000; i++) map.groundHeightAt((Math.random() * 2 - 1) * half, (Math.random() * 2 - 1) * half, 1e6); return Math.round(((now() - t) * 1000) / 20000 * 10) / 10; })() };
  },

  /** Детерминизм: два одинаковых прогона луча дают бит-в-бит те же числа? */
  determinism: async () => {
    const R = RB.R;
    const map = RB.maps.ch12, w = RB.worlds.ch12_full;
    if (!map || !w) return { skipped: true };
    const cast = () => {
      const out = [];
      const ray = new R.Ray({ x: -100, y: 30, z: -100 }, { x: 0.4, y: -0.6, z: 0.4 });
      for (let i = 0; i < 500; i++) {
        ray.origin.x = -100 + (i % 25) * 8; ray.origin.z = -100 + Math.floor(i / 25) * 8;
        const h = w.castRay(ray, 60, true);
        out.push(h ? Math.round(h.timeOfImpact * 1e9) : -1);
      }
      return out;
    };
    const a = cast(), b = cast();
    let diff = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
    return { samples: a.length, differing: diff };
  },

  /** Выгрузка чанка: цена removal + остаётся ли память. */
  evict: async () => {
    const R = RB.R;
    const map = RB.maps.ch12;
    if (!map) return { skipped: true };
    const half = map.width / 2;
    const win = 150;
    const t0 = now();
    const w = new R.World({ x: 0, y: -9.81, z: 0 });
    const cols = [];
    for (const s of solidsInWindow(map, 0, 0, win)) {
      const dx = s.maxX - s.minX, dy = s.maxY - s.minY, dz = s.maxZ - s.minZ;
      if (dx <= 0 || dy <= 0 || dz <= 0) continue;
      const rb = w.createRigidBody(R.RigidBodyDesc.fixed()
        .setTranslation((s.minX + s.maxX) / 2, (s.minY + s.maxY) / 2, (s.minZ + s.maxZ) / 2));
      cols.push(w.createCollider(R.ColliderDesc.cuboid(dx / 2, dy / 2, dz / 2), rb));
    }
    const buildMs = Math.round(now() - t0);
    const heapBefore = performance.memory ? performance.memory.usedJSHeapSize : 0;
    const t1 = now();
    for (const c of cols) w.removeCollider(c, false);
    const evictMs = Math.round(now() - t1);
    const t2 = now();
    w.free();
    const freeMs = Math.round(now() - t2);
    return { colliders: cols.length, buildMs, evictMs, freeMs,
      heapDeltaKB: performance.memory ? Math.round((performance.memory.usedJSHeapSize - heapBefore) / 1024) : null };
  },
};

function rngUnused() { /* место под будущий солёный шаг */ }

export default RB;
