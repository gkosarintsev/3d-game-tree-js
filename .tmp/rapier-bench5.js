/**
 * Пятый заход: чистые (раздельные) цены луча и **фактическая** загрузка кадра
 * тела-запросами в живом движке. Черновик. Стадии: `P5.run('clean')`,
 * `P5.run('frame')`.
 */
const R = () => window.RB.R;
const P5 = { out: {} };
window.P5 = P5;
const now = () => performance.now();

async function stage(key, fn) {
  P5.out[key] = { status: 'running' };
  const t0 = now();
  try { P5.out[key] = { status: 'ok', ms: Math.round(now() - t0), ...(await fn()) }; }
  catch (e) { P5.out[key] = { status: 'error', ms: Math.round(now() - t0), message: String((e && e.stack) ? String(e.stack).slice(0, 300) : e) }; }
  return P5.out[key];
}
P5.run = (k) => stage(k, STAGES[k]);

const M_RAY = 0x0001, M_BODY = 0x0002, M_BOTH = 0x0003;
const g = (mem) => ((mem << 16) | 0xffff);
const Q_RAY = (0xffff << 16) | M_RAY;
const Q_BODY = (0xffff << 16) | M_BODY;

function prismCorners(p) {
  const P = (u, y, v) => (p.frame
    ? [p.frame.cx + u * p.frame.c - v * p.frame.s, y, p.frame.cz + u * p.frame.s + v * p.frame.c]
    : (p.axis === 'x' ? [u, y, v] : [v, y, u]));
  const out = [];
  for (const v of [p.v0, p.v1]) for (const [u, y] of p.poly) out.push(P(u, y, v));
  return out;
}

/** Тот же мир, что в bench4: сольды пуле, блокеры телу, перила обоим, призмы hull + свипы три. */
function buildWorld(map) {
  const Rp = R();
  const w = new Rp.World({ x: 0, y: 0, z: 0 });
  const shared = w.createRigidBody(Rp.RigidBodyDesc.fixed());
  const box = (plan, y0, y1, mem) => {
    const hy = (y1 - y0) / 2, cy = (y0 + y1) / 2, obb = plan.obb;
    const desc = obb
      ? Rp.ColliderDesc.cuboid(obb.hx, hy, obb.hz)
        .setRotation({ x: 0, y: Math.sin(-Math.atan2(obb.s, obb.c) / 2), z: 0, w: Math.cos(-Math.atan2(obb.s, obb.c) / 2) })
        .setTranslation(obb.cx, cy, obb.cz)
      : Rp.ColliderDesc.cuboid((plan.maxX - plan.minX) / 2, hy, (plan.maxZ - plan.minZ) / 2)
        .setTranslation((plan.minX + plan.maxX) / 2, cy, (plan.minZ + plan.maxZ) / 2);
    w.createCollider(desc.setCollisionGroups(g(mem)), shared);
  };
  for (const s of map.solids) box(s, s.minY, s.maxY, M_RAY);
  for (const b of map.blockers) box(b, b.y0, b.y1, M_BODY);
  for (const r of map.rails) {
    const p = r.kind === 'wedge' ? r.w : r.s;
    if (!p || !p.poly) continue;
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try { w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_BOTH)), shared); } catch (e) {}
  }
  for (const p of map.prisms) {
    const c = prismCorners(p);
    if (c.length < 8) continue;
    try { w.createCollider(Rp.ColliderDesc.convexHull(new Float32Array(c.flat())).setCollisionGroups(g(M_RAY)), shared); } catch (e) {}
  }
  // свипы (ленты дуг) — trimesh'ем из тех же треугольников, что и картинка:
  // выпуклого представления у ленты нет, и дуговые перила держат её же tris
  for (const sw of (map.sweeps || [])) {
    if (!sw.tris || !sw.tris.length) continue;
    const pos = [], idx = [];
    sw.tris.forEach((tri, i) => {
      const base = pos.length / 3;
      pos.push(...tri.a, ...tri.b, ...tri.c);
      idx.push(base, base + 1, base + 2);
    });
    try { w.createCollider(Rp.ColliderDesc.trimesh(new Float32Array(pos), new Uint32Array(idx)).setCollisionGroups(g(M_RAY)), shared); } catch (e) {}
  }
  w.step();
  return { w, shared };
}

const STAGES = {
  /** Раздельные тёплые циклы: каждый движок меряется сам по себе. */
  clean: async () => {
    const Rp = R();
    const rec = {};
    for (const k of ['ch12', 'ch13']) {
      const map = window.RB.maps[k];
      const { w } = buildWorld(map);
      const half = map.width / 2;
      const traces = [];
      for (let i = 0; i < 4000; i++) {
        const x = (Math.random() * 2 - 1) * half * 0.9, z = (Math.random() * 2 - 1) * half * 0.9;
        const y = map.groundHeightAt(x, z, 1e6) + 1.6;
        const a = Math.random() * Math.PI * 2;
        const dx = Math.cos(a) * 0.4, dy = -0.9, dz = Math.sin(a) * 0.4;
        const n = Math.hypot(dx, dy, dz);
        traces.push({ x, y, z, dx: dx / n, dy: dy / n, dz: dz / n });
      }
      const ray = new Rp.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 });
      const set = (t) => { ray.origin.x = t.x; ray.origin.y = t.y; ray.origin.z = t.z; ray.dir.x = t.dx; ray.dir.y = t.dy; ray.dir.z = t.dz; };
      const loop = (fn, warm = 400) => {
        for (let i = 0; i < warm; i++) fn(traces[i % traces.length]);
        const t = now();
        const hits = { n: 0 };
        for (const tr of traces) if (fn(tr)) hits.n++;
        return { us: Math.round(((now() - t) * 1000) / traces.length * 10) / 10, hits: hits.n };
      };
      const cast = loop((t) => { set(t); return !!w.castRay(ray, 25, true, undefined, Q_RAY); });
      const castN = loop((t) => { set(t); return !!w.castRayAndGetNormal(ray, 25, true, undefined, Q_RAY); });
      const own = loop((t) => !!map.raySolid(t.x, t.y, t.z, t.dx, t.dy, t.dz, 25));
      const ownDist = loop((t) => map.rayHitDistance(t.x, t.y, t.z, t.dx, t.dy, t.dz, 25) < 25);
      const ownDistShort = loop((t) => map.rayHitDistance(t.x, t.y, t.z, t.dx, t.dy, t.dz, 12) < 12);
      const ownBlocked = loop((t) => map.isBlocked(t.x, t.z, 0.45, t.y - 1.6, 1.8));
      const q = new Rp.Quaternion(0, 0, 0, 1), cap = new Rp.Capsule(0.9, 0.45);
      const rapBlocked = loop((t) => { let h = false; w.intersectionsWithShape({ x: t.x, y: t.y - 0.25, z: t.z }, q, cap, () => { h = true; }, undefined, Q_BODY); return h; });
      rec[k] = { colliders: w.colliders.len(), castRayUs: cast.us, castRayHits: cast.hits,
        castRayNormalUs: castN.us, ownRaySolidUs: own.us, ownRaySolidHits: own.hits,
        ownRayHitDistanceUs: ownDist.us, ownRayHitDistanceHits: ownDist.hits,
        ownRayHitDistance12Us: ownDistShort.us, ownBlockedUs: ownBlocked.us, rapBlockedUs: rapBlocked.us };
      w.free();
    }
    return rec;
  },

  /** Сколько запросов к карте делает кадр в живом движке и сколько это микросекунд. */
  frame: async () => {
    const game = window.game;
    if (!game || !game.map) return { skipped: 'нет живого движка' };
    if (game.levelIndex !== 11) { await game._loadLevel(11); for (let i = 0; i < 40; i++) { if (game.state === 'chapter') break; await new Promise(r => setTimeout(r, 250)); } }
    const map = game.map;
    const names = ['isBlocked', 'groundHeightAt', 'raySolid', 'resolveSphere', 'rayHitDistance', 'findPath', 'randomNavPoint'];
    const stat = Object.fromEntries(names.map((n) => [n, { calls: 0, ms: 0 }]));
    const orig = {};
    for (const n of names) {
      if (typeof map[n] !== 'function') continue;
      orig[n] = map[n].bind(map);
      map[n] = (...a) => { const t = now(); const r = orig[n](...a); const d = now() - t; stat[n].calls++; stat[n].ms += d; return r; };
    }
    if (game.player && game.player.spawnAt) game.player.spawnAt(game.map.spawn);
    const DT = 1 / 60;
    const frames = 240;
    const t0 = now();
    for (let f = 0; f < frames; f++) {
      if (game.player) game.player.update(DT);
      if (game.enemies) game.enemies.update(DT);
      if (game.cars) game.cars.update(DT);
    }
    const wall = now() - t0;
    for (const n of names) if (orig[n]) map[n] = orig[n];
    const per = (n) => ({ callsPerFrame: Math.round(stat[n].calls / frames * 100) / 100, usPerFrame: Math.round(stat[n].ms * 1000 / frames * 10) / 10 });
    const total = names.reduce((a, n) => a + stat[n].ms, 0);
    return { level: game.level?.name, kind: map.kind, enemies: game.enemies?.enemies?.length ?? null,
      playerRole: game.player?.constructor?.name, frames, wallMsPerFrame: Math.round(wall / frames * 10) / 10,
      physicsMsPerFrame: Math.round(total * 1000 / frames * 10) / 10,
      perFrame: Object.fromEntries(names.map((n) => [n, per(n)])) };
  },
};

export default P5;
