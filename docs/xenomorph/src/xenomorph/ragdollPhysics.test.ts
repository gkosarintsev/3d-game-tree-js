import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ARENA_OBSTACLES,
  activateRagdollFromPose,
  applyRagdollImpulse,
  createRagdollState,
  evaluateCrawlKinematics,
  evaluateLeapKinematics,
  getZoneDamageMultiplier,
  isValidTransitionState,
  stepRagdoll,
} from './ragdollPhysics';
import type { RagdollNodeId, Vec3 } from './types';

function makeStandingPose(yOffset = 0): Record<RagdollNodeId, Vec3> {
  return {
    pelvis: { x: 0, y: 0.95 + yOffset, z: 0 },
    chest: { x: 0, y: 1.32 + yOffset, z: 0.22 },
    neck: { x: 0, y: 1.52 + yOffset, z: 0.42 },
    head: { x: 0, y: 1.62 + yOffset, z: 0.62 },
    jawTip: { x: 0, y: 1.48 + yOffset, z: 0.86 },
    shoulderL: { x: -0.24, y: 1.38 + yOffset, z: 0.28 },
    elbowL: { x: -0.34, y: 1.05 + yOffset, z: 0.36 },
    handL: { x: -0.3, y: 0.78 + yOffset, z: 0.56 },
    shoulderR: { x: 0.24, y: 1.38 + yOffset, z: 0.28 },
    elbowR: { x: 0.34, y: 1.05 + yOffset, z: 0.36 },
    handR: { x: 0.3, y: 0.78 + yOffset, z: 0.56 },
    hipL: { x: -0.16, y: 0.9 + yOffset, z: -0.02 },
    kneeL: { x: -0.2, y: 0.55 + yOffset, z: 0.16 },
    ankleL: { x: -0.2, y: 0.28 + yOffset, z: -0.05 },
    footL: { x: -0.2, y: 0.06 + yOffset, z: 0.14 },
    hipR: { x: 0.16, y: 0.9 + yOffset, z: -0.02 },
    kneeR: { x: 0.2, y: 0.55 + yOffset, z: 0.16 },
    ankleR: { x: 0.2, y: 0.28 + yOffset, z: -0.05 },
    footR: { x: 0.2, y: 0.06 + yOffset, z: 0.14 },
    tail1: { x: 0, y: 0.92 + yOffset, z: -0.34 },
    tail2: { x: 0, y: 0.85 + yOffset, z: -0.72 },
    tail3: { x: 0, y: 0.75 + yOffset, z: -1.12 },
    tail4: { x: 0, y: 0.68 + yOffset, z: -1.5 },
    tailTip: { x: 0, y: 0.72 + yOffset, z: -1.86 },
  };
}

test('ragdoll initialization creates all anatomical nodes and constraints', () => {
  const ragdoll = createRagdollState();
  const pose = makeStandingPose();
  activateRagdollFromPose(ragdoll, pose, {});

  assert.equal(ragdoll.active, true);
  assert.equal(ragdoll.nodeOrder.length, 24);
  assert.ok(ragdoll.constraints.length >= 23);
  for (const c of ragdoll.constraints) {
    assert.ok(c.restLength > 0.04, `Expected positive rest length for ${c.a}->${c.b}`);
  }
});

test('ragdoll collapses under gravity onto floor without tunneling or NaN', () => {
  const ragdoll = createRagdollState();
  activateRagdollFromPose(ragdoll, makeStandingPose(0.5), {});

  for (let i = 0; i < 120; i++) {
    stepRagdoll(ragdoll, 1 / 60, 0, ARENA_OBSTACLES);
  }

  for (const id of ragdoll.nodeOrder) {
    const node = ragdoll.nodes[id];
    assert.ok(Number.isFinite(node.pos.x) && Number.isFinite(node.pos.y) && Number.isFinite(node.pos.z));
    assert.ok(
      node.pos.y >= node.radius - 0.005,
      `Node ${id} fell below floor: y=${node.pos.y}, radius=${node.radius}`,
    );
  }
  // Chest should have collapsed flat onto floor from initial y=1.82
  assert.ok(ragdoll.nodes.chest.pos.y < 0.45, `Chest did not collapse flat to floor: ${ragdoll.nodes.chest.pos.y}`);
});

test('directional bullet impulse pushes hit bone and settles cleanly', () => {
  const ragdoll = createRagdollState();
  activateRagdollFromPose(ragdoll, makeStandingPose(), {});
  const initialHeadZ = ragdoll.nodes.head.pos.z;

  applyRagdollImpulse(ragdoll, 'head', { x: 0, y: 3.5, z: -16 }, 0.9);
  for (let i = 0; i < 90; i++) {
    stepRagdoll(ragdoll, 1 / 60, 0, ARENA_OBSTACLES);
  }

  assert.ok(
    ragdoll.nodes.head.pos.z < initialHeadZ - 0.25,
    `Expected head to knock backward along -Z, got z=${ragdoll.nodes.head.pos.z}`,
  );

  // Verify bone lengths remain stable after violent impulse
  for (const c of ragdoll.constraints.filter((item) => !item.isStructural)) {
    const a = ragdoll.nodes[c.a].pos;
    const b = ragdoll.nodes[c.b].pos;
    const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    assert.ok(
      Math.abs(d - c.restLength) < 0.12,
      `Bone ${c.a}->${c.b} stretched too far: ${d} vs ${c.restLength}`,
    );
  }
});

test('leap kinematics follows windup -> airborne arc -> landing sequence', () => {
  const windup = evaluateLeapKinematics(0.1);
  assert.equal(windup.phase, 'windup');
  assert.equal(windup.heightOffset, 0);

  const midAir = evaluateLeapKinematics(0.55);
  assert.equal(midAir.phase, 'airborne');
  assert.ok(midAir.heightOffset > 1.3);
  assert.ok(midAir.forwardSpeed > 8);

  const landing = evaluateLeapKinematics(1.0);
  assert.equal(landing.phase, 'landing');
  assert.equal(landing.heightOffset, 0);
});

test('hit zone multipliers and state transition guards behave correctly', () => {
  assert.ok(getZoneDamageMultiplier('head') > getZoneDamageMultiplier('torso'));
  assert.ok(getZoneDamageMultiplier('torso') > getZoneDamageMultiplier('limb'));
  assert.equal(isValidTransitionState('ragdoll', 'walk'), false);
  assert.equal(isValidTransitionState('ragdoll', 'idle'), true);
});

test('crawl kinematics traverses floor, vertical walls, and inverted ceiling continuously', () => {
  const seenSurfaces = new Set<string>();
  let minUpY = 1;
  let maxWallX = 0;

  for (let t = 0; t <= 8.0; t += 0.15) {
    const k = evaluateCrawlKinematics(t);
    seenSurfaces.add(k.surface);
    minUpY = Math.min(minUpY, k.up.y);
    maxWallX = Math.max(maxWallX, Math.abs(k.pos.x));
    const fwdLen = Math.hypot(k.forward.x, k.forward.y, k.forward.z);
    const upLen = Math.hypot(k.up.x, k.up.y, k.up.z);
    const dot = k.forward.x * k.up.x + k.forward.y * k.up.y + k.forward.z * k.up.z;
    assert.ok(Math.abs(fwdLen - 1) < 1e-4);
    assert.ok(Math.abs(upLen - 1) < 1e-4);
    assert.ok(Math.abs(dot) < 1e-4, `Expected orthogonal tangent/normal, dot=${dot}`);
  }

  assert.equal(seenSurfaces.has('floor'), true);
  assert.equal(seenSurfaces.has('wall'), true);
  assert.equal(seenSurfaces.has('ceiling'), true);
  assert.ok(minUpY < -0.99, `Expected inverted ceiling normal (up.y = -1), got ${minUpY}`);
  assert.ok(maxWallX > 6.4, `Expected traversal out to wall plane, got ${maxWallX}`);
});

