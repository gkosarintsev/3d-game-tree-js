/**
 * Индекс твёрдости статики на Rapier3D (Часть II плана открытого мира).
 *
 * Rapier здесь — **индекс**, а не физика тел. Режим `own` (по умолчанию) — наша
 * аналитика, эталон вердиктов; режим `rapier` — этот модуль.
 *
 * Импорт Rapier ленивый: в Node (где пакета нет) модуль грузится без ошибки,
 * а функции возвращают «не готово», пока не вызван `init()` в браузере.
 */
let RAPIER = null;
let world = null;
let initialized = false;

/** chunkId → коллайдеры, созданные для этого чанка (для removeChunk, R4). */
const chunkColliders = new Map();

export async function init() {
  if (initialized) return;
  RAPIER = await import('@dimforge/rapier3d-compat');
  await RAPIER.init();
  world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  initialized = true;
}

export function isReady() {
  return initialized && world !== null && RAPIER !== null;
}

/** Построить индекс из карты (solids → луч, blockers/rails → тело). chunkId — для R4. */
export function buildFrom(map, chunkId) {
  if (!isReady() || !map) return;
  const colliders = chunkId ? [] : null;
  for (const s of (map.solids ?? [])) {
    const hx = (s.maxX - s.minX) / 2;
    const hy = (s.maxY - s.minY) / 2;
    const hz = (s.maxZ - s.minZ) / 2;
    const cx = (s.minX + s.maxX) / 2;
    const cy = (s.minY + s.maxY) / 2;
    const cz = (s.minZ + s.maxZ) / 2;
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz);
    const c = world.createCollider(desc);
    if (colliders) colliders.push(c);
  }
  for (const b of (map.blockers ?? [])) {
    const hx = (b.maxX - b.minX) / 2;
    const hz = (b.maxZ - b.minZ) / 2;
    const hy = (b.y1 - b.y0) / 2;
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.y0 + b.y1) / 2;
    const cz = (b.minZ + b.maxZ) / 2;
    const desc = RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(cx, cy, cz);
    const c = world.createCollider(desc);
    if (colliders) colliders.push(c);
  }
  if (chunkId && colliders) chunkColliders.set(chunkId, colliders);
  // TODO R1: rails (arc/wedge) → convexHull; prisms → convexHull; sweeps → trimesh
}

export function dispose() {
  if (world) {
    world.free();
    world = null;
  }
  initialized = false;
  RAPIER = null;
  chunkColliders.clear();
}

/** Добавить чанк в индекс (R4). */
export function addChunk(id, map) {
  buildFrom(map, id);
}

/** Снять чанк из индекса (R4). Удаляет коллайдеры, созданные для этого чанка. */
export function removeChunk(id) {
  const colliders = chunkColliders.get(id);
  if (colliders) {
    for (const c of colliders) world.removeCollider(c);
    chunkColliders.delete(id);
  }
}

export function rayHit(origin, dir, maxDist) {
  if (!isReady()) return null;
  const ray = new RAPIER.Ray(origin, dir);
  const hit = world.castRay(ray, maxDist, true);
  if (!hit) return null;
  const point = ray.pointAt(hit.toi);
  return {
    x: point.x, y: point.y, z: point.z,
    nx: hit.normal.x, ny: hit.normal.y, nz: hit.normal.z,
    dist: hit.toi,
  };
}

/**
 * Свип тела поясом по отрезку (R2). Возвращает true, если путь свободен.
 *
 * Форма — капсула пояса тела: диск `radius` в вертикальном отрезке
 * `[feet + 0.05; feet + height − 0.05]` (§ 16 плана, «порог 0,05 — ступень
 * стоит ровно под ногами и телу не препятствие»). Капсула с центром на
 * `feet + height/2` и `halfHeight = height/2 − 0.05 − radius`, чтобы её
 * вертикальная протяжённость `2·halfHeight + 2·radius` равнялась `height − 0.1`.
 * При `radius=0.45, height=1.7` это `capsule(0.35, 0.45)` — рабочий эквивалент
 * своей пробы `isBlocked(…, radius, feet, height)`.
 */
export function bodySweep(a, b, radius, height) {
  if (!isReady()) return true;
  const feet = Math.max(a.y, b.y);
  const cx = (a.x + b.x) / 2;
  const cy = feet + height / 2;
  const cz = (a.z + b.z) / 2;
  const halfHeight = Math.max(0, height / 2 - 0.05 - radius);
  const shape = RAPIER.ColliderDesc.capsule(halfHeight, radius);
  const vel = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const targetDist = 0;
  const maxToi = 1;
  const hit = world.castShape(
    { translation: { x: cx, y: cy, z: cz }, rotation: { x: 0, y: 0, z: 0, w: 1 } },
    vel,
    shape,
    targetDist,
    maxToi,
  );
  // hit === null → свободно; иначе есть касание
  return hit === null;
}
