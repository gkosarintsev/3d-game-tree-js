import type {
  ColliderBox,
  HitZone,
  RagdollBendConstraint,
  RagdollDistanceConstraint,
  RagdollMinDistanceConstraint,
  RagdollNode,
  RagdollNodeId,
  RagdollState,
  Vec3,
  XenomorphAnimState,
} from './types';

export const ARENA_RADIUS = 10.5;
export const DEFAULT_FLOOR_Y = 0;

export const ARENA_OBSTACLES: ColliderBox[] = [
  {
    id: 'crate-north-west',
    minX: -5.4,
    maxX: -3.2,
    minY: 0,
    maxY: 1.05,
    minZ: -4.8,
    maxZ: -2.8,
  },
  {
    id: 'crate-east',
    minX: 3.4,
    maxX: 5.5,
    minY: 0,
    maxY: 0.85,
    minZ: -1.6,
    maxZ: 0.8,
  },
  {
    id: 'crate-south-west',
    minX: -4.6,
    maxX: -2.8,
    minY: 0,
    maxY: 0.72,
    minZ: 2.6,
    maxZ: 4.4,
  },
];

const NODE_SPECS: Array<{ id: RagdollNodeId; radius: number; mass: number }> = [
  { id: 'pelvis', radius: 0.22, mass: 3.4 },
  { id: 'chest', radius: 0.26, mass: 4.5 },
  { id: 'neck', radius: 0.14, mass: 1.6 },
  { id: 'head', radius: 0.2, mass: 2.6 },
  { id: 'jawTip', radius: 0.12, mass: 0.9 },
  { id: 'shoulderL', radius: 0.13, mass: 1.5 },
  { id: 'elbowL', radius: 0.1, mass: 1.1 },
  { id: 'handL', radius: 0.09, mass: 0.8 },
  { id: 'shoulderR', radius: 0.13, mass: 1.5 },
  { id: 'elbowR', radius: 0.1, mass: 1.1 },
  { id: 'handR', radius: 0.09, mass: 0.8 },
  { id: 'hipL', radius: 0.15, mass: 2.0 },
  { id: 'kneeL', radius: 0.12, mass: 1.5 },
  { id: 'ankleL', radius: 0.09, mass: 1.0 },
  { id: 'footL', radius: 0.09, mass: 0.9 },
  { id: 'hipR', radius: 0.15, mass: 2.0 },
  { id: 'kneeR', radius: 0.12, mass: 1.5 },
  { id: 'ankleR', radius: 0.09, mass: 1.0 },
  { id: 'footR', radius: 0.09, mass: 0.9 },
  { id: 'tail1', radius: 0.1, mass: 1.1 },
  { id: 'tail2', radius: 0.085, mass: 0.9 },
  { id: 'tail3', radius: 0.07, mass: 0.7 },
  { id: 'tail4', radius: 0.055, mass: 0.5 },
  { id: 'tailTip', radius: 0.05, mass: 0.45 },
];

export const PRIMARY_BONE_LINKS: Array<[RagdollNodeId, RagdollNodeId]> = [
  ['pelvis', 'chest'],
  ['chest', 'neck'],
  ['neck', 'head'],
  ['head', 'jawTip'],
  ['chest', 'shoulderL'],
  ['shoulderL', 'elbowL'],
  ['elbowL', 'handL'],
  ['chest', 'shoulderR'],
  ['shoulderR', 'elbowR'],
  ['elbowR', 'handR'],
  ['pelvis', 'hipL'],
  ['hipL', 'kneeL'],
  ['kneeL', 'ankleL'],
  ['ankleL', 'footL'],
  ['pelvis', 'hipR'],
  ['hipR', 'kneeR'],
  ['kneeR', 'ankleR'],
  ['ankleR', 'footR'],
  ['pelvis', 'tail1'],
  ['tail1', 'tail2'],
  ['tail2', 'tail3'],
  ['tail3', 'tail4'],
  ['tail4', 'tailTip'],
];

const STRUCTURAL_BRACE_LINKS: Array<{
  a: RagdollNodeId;
  b: RagdollNodeId;
  stiffness: number;
}> = [
  { a: 'shoulderL', b: 'shoulderR', stiffness: 0.9 },
  { a: 'hipL', b: 'hipR', stiffness: 0.9 },
  { a: 'shoulderL', b: 'pelvis', stiffness: 0.55 },
  { a: 'shoulderR', b: 'pelvis', stiffness: 0.55 },
  { a: 'shoulderL', b: 'neck', stiffness: 0.65 },
  { a: 'shoulderR', b: 'neck', stiffness: 0.65 },
  { a: 'head', b: 'chest', stiffness: 0.22 },
  { a: 'jawTip', b: 'neck', stiffness: 0.36 },
];

function dist3(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function createRagdollState(): RagdollState {
  const nodes = {} as Record<RagdollNodeId, RagdollNode>;
  const nodeOrder: RagdollNodeId[] = [];
  for (const spec of NODE_SPECS) {
    nodes[spec.id] = {
      id: spec.id,
      pos: { x: 0, y: 1, z: 0 },
      prevPos: { x: 0, y: 1, z: 0 },
      radius: spec.radius,
      mass: spec.mass,
    };
    nodeOrder.push(spec.id);
  }
  return {
    active: false,
    nodes,
    nodeOrder,
    constraints: [],
    minConstraints: [],
    bendConstraints: [],
    settledTime: 0,
  };
}

export function activateRagdollFromPose(
  state: RagdollState,
  worldPositions: Record<RagdollNodeId, Vec3>,
  worldVelocities: Partial<Record<RagdollNodeId, Vec3>>,
  dtEstimate = 1 / 60,
): void {
  const clampedDt = Math.max(1 / 120, Math.min(dtEstimate, 1 / 20));
  for (const id of state.nodeOrder) {
    const p = worldPositions[id];
    const v = worldVelocities[id] ?? { x: 0, y: 0, z: 0 };
    const node = state.nodes[id];
    node.pos.x = p.x;
    node.pos.y = p.y;
    node.pos.z = p.z;
    node.prevPos.x = p.x - v.x * clampedDt;
    node.prevPos.y = p.y - v.y * clampedDt;
    node.prevPos.z = p.z - v.z * clampedDt;
  }

  const constraints: RagdollDistanceConstraint[] = [];
  for (const [a, b] of PRIMARY_BONE_LINKS) {
    const restLength = Math.max(0.05, dist3(worldPositions[a], worldPositions[b]));
    constraints.push({
      a,
      b,
      restLength,
      stiffness: 0.98,
      isStructural: false,
    });
  }

  for (const brace of STRUCTURAL_BRACE_LINKS) {
    const restLength = Math.max(0.05, dist3(worldPositions[brace.a], worldPositions[brace.b]));
    constraints.push({
      a: brace.a,
      b: brace.b,
      restLength,
      stiffness: brace.stiffness,
      isStructural: true,
    });
  }

  // Soft anti-collapse separation only between opposite knees and pelvis-head
  const minConstraints: RagdollMinDistanceConstraint[] = [
    { a: 'pelvis', b: 'head', minLength: dist3(worldPositions.pelvis, worldPositions.head) * 0.5, stiffness: 0.25 },
    { a: 'kneeL', b: 'kneeR', minLength: 0.18, stiffness: 0.25 },
  ];

  // Bend constraints keep spine & tail smooth while allowing limp floor collapse
  const bendConstraints: RagdollBendConstraint[] = [
    { a: 'pelvis', pivot: 'chest', b: 'neck', minDot: -0.99, maxDot: 0.25, stiffness: 0.1 },
    { a: 'chest', pivot: 'neck', b: 'head', minDot: -0.99, maxDot: 0.25, stiffness: 0.1 },
    { a: 'pelvis', pivot: 'tail1', b: 'tail2', minDot: -0.99, maxDot: 0.35, stiffness: 0.06 },
    { a: 'tail1', pivot: 'tail2', b: 'tail3', minDot: -0.99, maxDot: 0.35, stiffness: 0.06 },
    { a: 'tail2', pivot: 'tail3', b: 'tail4', minDot: -0.99, maxDot: 0.35, stiffness: 0.06 },
    { a: 'tail3', pivot: 'tail4', b: 'tailTip', minDot: -0.99, maxDot: 0.35, stiffness: 0.06 },
  ];

  state.constraints = constraints;
  state.minConstraints = minConstraints;
  state.bendConstraints = bendConstraints;
  state.settledTime = 0;
  state.active = true;
}

export function applyRagdollImpulse(
  state: RagdollState,
  hitNodeId: RagdollNodeId,
  impulse: Vec3,
  spreadRadius = 0.75,
): void {
  if (!state.active) return;
  const origin = state.nodes[hitNodeId]?.pos;
  if (!origin) return;

  for (const id of state.nodeOrder) {
    const node = state.nodes[id];
    const d = dist3(node.pos, origin);
    if (d > spreadRadius) continue;
    const falloff = id === hitNodeId ? 1.0 : Math.pow(1 - d / spreadRadius, 1.4) * 0.65;
    const invMass = 1 / Math.max(0.4, node.mass);
    // Adjust prevPos opposite to velocity delta so Verlet adds velocity immediately
    const dvx = impulse.x * falloff * invMass * 0.024;
    const dvy = impulse.y * falloff * invMass * 0.024;
    const dvz = impulse.z * falloff * invMass * 0.024;
    node.prevPos.x -= dvx;
    node.prevPos.y -= dvy;
    node.prevPos.z -= dvz;
  }
  state.settledTime = 0;
}

function solveDistanceConstraint(
  a: RagdollNode,
  b: RagdollNode,
  restLength: number,
  stiffness: number,
): void {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dz = b.pos.z - a.pos.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 1e-6) return;

  const diff = ((len - restLength) / len) * stiffness;
  const invMassA = a.pinned ? 0 : 1 / a.mass;
  const invMassB = b.pinned ? 0 : 1 / b.mass;
  const totalInvMass = invMassA + invMassB;
  if (totalInvMass <= 0) return;

  const wA = invMassA / totalInvMass;
  const wB = invMassB / totalInvMass;

  a.pos.x += dx * diff * wA;
  a.pos.y += dy * diff * wA;
  a.pos.z += dz * diff * wA;

  b.pos.x -= dx * diff * wB;
  b.pos.y -= dy * diff * wB;
  b.pos.z -= dz * diff * wB;
}

function solveMinDistanceConstraint(
  a: RagdollNode,
  b: RagdollNode,
  minLength: number,
  stiffness: number,
): void {
  const dx = b.pos.x - a.pos.x;
  const dy = b.pos.y - a.pos.y;
  const dz = b.pos.z - a.pos.z;
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 1e-6 || len >= minLength) return;

  const diff = ((len - minLength) / len) * stiffness;
  const invMassA = 1 / a.mass;
  const invMassB = 1 / b.mass;
  const total = invMassA + invMassB;
  const wA = invMassA / total;
  const wB = invMassB / total;

  a.pos.x += dx * diff * wA;
  a.pos.y += dy * diff * wA;
  a.pos.z += dz * diff * wA;
  b.pos.x -= dx * diff * wB;
  b.pos.y -= dy * diff * wB;
  b.pos.z -= dz * diff * wB;
}

function solveBendConstraint(
  a: RagdollNode,
  pivot: RagdollNode,
  b: RagdollNode,
  minDot: number,
  maxDot: number,
  stiffness: number,
): void {
  const ax = a.pos.x - pivot.pos.x;
  const ay = a.pos.y - pivot.pos.y;
  const az = a.pos.z - pivot.pos.z;
  const lenA = Math.sqrt(ax * ax + ay * ay + az * az);

  const bx = b.pos.x - pivot.pos.x;
  const by = b.pos.y - pivot.pos.y;
  const bz = b.pos.z - pivot.pos.z;
  const lenB = Math.sqrt(bx * bx + by * by + bz * bz);

  if (lenA < 1e-5 || lenB < 1e-5) return;

  const uaX = ax / lenA;
  const uaY = ay / lenA;
  const uaZ = az / lenA;
  const ubX = bx / lenB;
  const ubY = by / lenB;
  const ubZ = bz / lenB;

  const dot = uaX * ubX + uaY * ubY + uaZ * ubZ;
  if (dot <= maxDot && dot >= minDot) return;

  // Gently push endpoints apart along opposite chord when bent too sharply
  const targetDot = dot > maxDot ? maxDot : minDot;
  const push = (dot - targetDot) * stiffness * 0.14;
  const dirX = bx - ax;
  const dirY = by - ay;
  const dirZ = bz - az;
  const dLen = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
  if (dLen < 1e-5) return;

  const nx = dirX / dLen;
  const ny = dirY / dLen;
  const nz = dirZ / dLen;

  a.pos.x -= nx * push;
  a.pos.y -= ny * push;
  a.pos.z -= nz * push;
  b.pos.x += nx * push;
  b.pos.y += ny * push;
  b.pos.z += nz * push;
}

function resolveNodeCollisions(
  node: RagdollNode,
  floorY: number,
  obstacles: ColliderBox[],
  arenaRadius: number,
  applyFriction: boolean,
): void {
  const minY = floorY + node.radius;
  if (node.pos.y < minY) {
    const vy = node.pos.y - node.prevPos.y;
    node.pos.y = minY;
    if (applyFriction) {
      // Apply sliding ground friction once per substep (not every solver iteration!)
      const vx = node.pos.x - node.prevPos.x;
      const vz = node.pos.z - node.prevPos.z;
      node.prevPos.x = node.pos.x - vx * 0.91;
      node.prevPos.z = node.pos.z - vz * 0.91;
      node.prevPos.y = node.pos.y + vy * 0.1;
    }
  }

  for (const box of obstacles) {
    const cx = Math.max(box.minX, Math.min(node.pos.x, box.maxX));
    const cy = Math.max(box.minY, Math.min(node.pos.y, box.maxY));
    const cz = Math.max(box.minZ, Math.min(node.pos.z, box.maxZ));

    const dx = node.pos.x - cx;
    const dy = node.pos.y - cy;
    const dz = node.pos.z - cz;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < node.radius * node.radius) {
      if (distSq > 1e-8) {
        const d = Math.sqrt(distSq);
        const pen = node.radius - d;
        const nx = dx / d;
        const ny = dy / d;
        const nz = dz / d;
        node.pos.x += nx * pen;
        node.pos.y += ny * pen;
        node.pos.z += nz * pen;
        if (applyFriction) {
          const vx = node.pos.x - node.prevPos.x;
          const vz = node.pos.z - node.prevPos.z;
          node.prevPos.x = node.pos.x - vx * 0.9;
          node.prevPos.z = node.pos.z - vz * 0.9;
        }
      } else {
        node.pos.y = box.maxY + node.radius;
      }
    }
  }

  const radialSq = node.pos.x * node.pos.x + node.pos.z * node.pos.z;
  const maxR = arenaRadius - node.radius;
  if (radialSq > maxR * maxR) {
    const r = Math.sqrt(radialSq);
    node.pos.x = (node.pos.x / r) * maxR;
    node.pos.z = (node.pos.z / r) * maxR;
  }
}

export function stepRagdoll(
  state: RagdollState,
  rawDt: number,
  floorY = DEFAULT_FLOOR_Y,
  obstacles: ColliderBox[] = ARENA_OBSTACLES,
  arenaRadius = ARENA_RADIUS,
): void {
  if (!state.active) return;

  const dt = Math.min(Math.max(rawDt, 0.001), 0.12);
  const substeps = dt > 0.05 ? 8 : 4;
  const subDt = dt / substeps;
  const gravity = -24.0;
  const airDamping = 0.992;

  for (let s = 0; s < substeps; s++) {
    let maxSpeedSq = 0;

    for (const id of state.nodeOrder) {
      const node = state.nodes[id];
      if (node.pinned) continue;

      const vx = (node.pos.x - node.prevPos.x) * airDamping;
      const vy = (node.pos.y - node.prevPos.y) * airDamping;
      const vz = (node.pos.z - node.prevPos.z) * airDamping;

      maxSpeedSq = Math.max(maxSpeedSq, vx * vx + vy * vy + vz * vz);

      node.prevPos.x = node.pos.x;
      node.prevPos.y = node.pos.y;
      node.prevPos.z = node.pos.z;

      node.pos.x += vx;
      node.pos.y += vy + gravity * subDt * subDt;
      node.pos.z += vz;
    }

    const solverIterations = 10;
    for (let iter = 0; iter < solverIterations; iter++) {
      for (const c of state.constraints) {
        solveDistanceConstraint(
          state.nodes[c.a],
          state.nodes[c.b],
          c.restLength,
          c.stiffness,
        );
      }
      for (const mc of state.minConstraints) {
        solveMinDistanceConstraint(
          state.nodes[mc.a],
          state.nodes[mc.b],
          mc.minLength,
          mc.stiffness,
        );
      }
      for (const bc of state.bendConstraints) {
        solveBendConstraint(
          state.nodes[bc.a],
          state.nodes[bc.pivot],
          state.nodes[bc.b],
          bc.minDot,
          bc.maxDot,
          bc.stiffness,
        );
      }
      const isLastIter = iter === solverIterations - 1;
      for (const id of state.nodeOrder) {
        resolveNodeCollisions(state.nodes[id], floorY, obstacles, arenaRadius, isLastIter);
      }
    }

    if (maxSpeedSq < 0.00004) {
      state.settledTime += subDt;
    } else {
      state.settledTime = 0;
    }
  }
}

export function getZoneDamageMultiplier(zone: HitZone): number {
  switch (zone) {
    case 'head':
      return 2.5;
    case 'torso':
      return 1.0;
    case 'limb':
      return 0.7;
    case 'tail':
      return 0.5;
  }
}

export interface LeapKinematics {
  phase: 'windup' | 'airborne' | 'landing';
  heightOffset: number;
  forwardSpeed: number;
  normalizedAir: number;
}

/**
 * Pure kinematic profile for the long forward leap animation (total duration 1.15s).
 */
export function evaluateLeapKinematics(elapsed: number): LeapKinematics {
  const total = 1.15;
  const t = Math.min(Math.max(elapsed, 0), total);
  const windupEnd = 0.22;
  const landStart = 0.88;

  if (t < windupEnd) {
    return {
      phase: 'windup',
      heightOffset: 0,
      forwardSpeed: 0.4,
      normalizedAir: 0,
    };
  }
  if (t <= landStart) {
    const u = (t - windupEnd) / (landStart - windupEnd); // 0..1
    const heightOffset = 4 * 1.48 * u * (1 - u); // peak ~1.48m
    return {
      phase: 'airborne',
      heightOffset,
      forwardSpeed: 9.2,
      normalizedAir: u,
    };
  }
  return {
    phase: 'landing',
    heightOffset: 0,
    forwardSpeed: 1.8 * (1 - (t - landStart) / (total - landStart)),
    normalizedAir: 1,
  };
}

export function isValidTransitionState(
  from: XenomorphAnimState,
  to: XenomorphAnimState,
): boolean {
  if (from === 'ragdoll' && to !== 'idle') {
    // Respawn resets to idle; ragdoll stays in ragdoll until respawned
    return false;
  }
  return true;
}

export const CRAWL_ARCH_HALF_WIDTH = 6.45;
export const CRAWL_CEILING_Y = 5.05;
export const CRAWL_Z = 1.25;
export const CRAWL_SPEED = 5.6; // m/s

export interface CrawlKinematics {
  pos: Vec3;
  forward: Vec3;
  up: Vec3;
  surface: 'floor' | 'wall' | 'ceiling';
  speed: number;
}

/**
 * Pure closed-loop path across floor -> left wall -> inverted ceiling -> right wall -> floor.
 */
export function evaluateCrawlKinematics(elapsed: number): CrawlKinematics {
  const W = CRAWL_ARCH_HALF_WIDTH;
  const H = CRAWL_CEILING_Y;
  const R = 1.1;
  const xInner = W - R; // 5.35
  const yLow = R; // 1.1
  const yHigh = H - R; // 3.95
  const z = CRAWL_Z;

  const lFloorHalf = xInner;
  const lWall = yHigh - yLow;
  const lCeil = xInner * 2;
  const lArc = (Math.PI * 0.5) * R;
  const totalLen = lFloorHalf * 2 + lWall * 2 + lCeil + lArc * 4;

  const rawDist = Math.max(0, elapsed) * CRAWL_SPEED;
  let d = rawDist % totalLen;

  // 1. Floor-Left: (0, 0) -> (-xInner, 0)
  if (d < lFloorHalf) {
    return {
      pos: { x: -d, y: 0, z },
      forward: { x: -1, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      surface: 'floor',
      speed: CRAWL_SPEED,
    };
  }
  d -= lFloorHalf;

  // 2. Corner Bottom-Left
  if (d < lArc) {
    const u = d / R;
    return {
      pos: { x: -xInner - R * Math.sin(u), y: yLow - R * Math.cos(u), z },
      forward: { x: -Math.cos(u), y: Math.sin(u), z: 0 },
      up: { x: Math.sin(u), y: Math.cos(u), z: 0 },
      surface: u > Math.PI * 0.25 ? 'wall' : 'floor',
      speed: CRAWL_SPEED,
    };
  }
  d -= lArc;

  // 3. Left Wall Climb UP
  if (d < lWall) {
    return {
      pos: { x: -W, y: yLow + d, z },
      forward: { x: 0, y: 1, z: 0 },
      up: { x: 1, y: 0, z: 0 },
      surface: 'wall',
      speed: CRAWL_SPEED,
    };
  }
  d -= lWall;

  // 4. Corner Top-Left
  if (d < lArc) {
    const u = d / R;
    return {
      pos: { x: -xInner - R * Math.cos(u), y: yHigh + R * Math.sin(u), z },
      forward: { x: Math.sin(u), y: Math.cos(u), z: 0 },
      up: { x: Math.cos(u), y: -Math.sin(u), z: 0 },
      surface: u > Math.PI * 0.25 ? 'ceiling' : 'wall',
      speed: CRAWL_SPEED,
    };
  }
  d -= lArc;

  // 5. Ceiling Crawl (Upside-Down!)
  if (d < lCeil) {
    return {
      pos: { x: -xInner + d, y: H, z },
      forward: { x: 1, y: 0, z: 0 },
      up: { x: 0, y: -1, z: 0 },
      surface: 'ceiling',
      speed: CRAWL_SPEED,
    };
  }
  d -= lCeil;

  // 6. Corner Top-Right
  if (d < lArc) {
    const u = d / R;
    return {
      pos: { x: xInner + R * Math.sin(u), y: yHigh + R * Math.cos(u), z },
      forward: { x: Math.cos(u), y: -Math.sin(u), z: 0 },
      up: { x: -Math.sin(u), y: -Math.cos(u), z: 0 },
      surface: u > Math.PI * 0.25 ? 'wall' : 'ceiling',
      speed: CRAWL_SPEED,
    };
  }
  d -= lArc;

  // 7. Right Wall Crawl DOWN
  if (d < lWall) {
    return {
      pos: { x: W, y: yHigh - d, z },
      forward: { x: 0, y: -1, z: 0 },
      up: { x: -1, y: 0, z: 0 },
      surface: 'wall',
      speed: CRAWL_SPEED,
    };
  }
  d -= lWall;

  // 8. Corner Bottom-Right
  if (d < lArc) {
    const u = d / R;
    return {
      pos: { x: xInner + R * Math.cos(u), y: yLow - R * Math.sin(u), z },
      forward: { x: -Math.sin(u), y: -Math.cos(u), z: 0 },
      up: { x: -Math.cos(u), y: Math.sin(u), z: 0 },
      surface: u > Math.PI * 0.25 ? 'floor' : 'wall',
      speed: CRAWL_SPEED,
    };
  }
  d -= lArc;

  // 9. Floor-Right returning to (0, 0)
  return {
    pos: { x: Math.max(0, xInner - d), y: 0, z },
    forward: { x: -1, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    surface: 'floor',
    speed: CRAWL_SPEED,
  };
}

