import test from 'node:test';
import assert from 'node:assert/strict';
import { BONE_ORDER, BONE_SPECS, type BoneId } from './enemyConfig';
import { RagdollPhysicsWorld, type WorldBoneTransform } from './ragdollPhysics';

function makeStandingTransforms(): Record<BoneId, WorldBoneTransform> {
  const worldPivot: Record<string, [number, number, number]> = {};
  const result = {} as Record<BoneId, WorldBoneTransform>;

  for (const boneId of BONE_ORDER) {
    const spec = BONE_SPECS[boneId];
    const parentPos = spec.parent ? worldPivot[spec.parent] : [0, 0, 0];
    const pos: [number, number, number] = [
      parentPos[0] + spec.pivotOffset[0],
      parentPos[1] + spec.pivotOffset[1],
      parentPos[2] + spec.pivotOffset[2],
    ];
    worldPivot[boneId] = pos;
    result[boneId] = {
      pivotPos: pos,
      worldQuat: [0, 0, 0, 1],
    };
  }
  return result;
}

test('ragdoll world constructs 11 bones, 10 joint constraints, and rifle body', () => {
  const ragdoll = new RagdollPhysicsWorld();
  assert.equal(ragdoll.boneBodies.size, 11);
  assert.equal(ragdoll.constraints.length, 10);
  assert.equal(ragdoll.isRifleDetached(), false);
});

test('entering ragdoll and applying ballistic impulse simulates stably without NaN or ground tunneling', () => {
  const ragdoll = new RagdollPhysicsWorld();
  const standing = makeStandingTransforms();

  // Simulate two kinematic frames to generate forward walk velocity
  ragdoll.recordKinematicPose(standing, [-0.15, 1.15, 0.25], [0, 0, 0, 1], 1 / 60);
  const moved = makeStandingTransforms();
  for (const id of BONE_ORDER) {
    moved[id].pivotPos[2] += 0.03;
  }

  ragdoll.enterRagdoll(moved, [-0.15, 1.15, 0.28], [0, 0, 0, 1], 1 / 60);
  assert.equal(ragdoll.isRifleDetached(), true);

  ragdoll.applyBallisticImpulse('head', [0, 1.65, 0.1], [0.2, 0.15, -1], 28);

  const headVelZ = ragdoll.boneBodies.get('head')!.body.velocity.z;
  assert.ok(headVelZ < -1, `Expected backward head impulse, got ${headVelZ}`);

  // Step 2 seconds of physics at 60Hz
  for (let i = 0; i < 120; i++) {
    ragdoll.step(1 / 60, 1);
  }

  for (const id of BONE_ORDER) {
    const pos = ragdoll.boneBodies.get(id)!.body.position;
    assert.ok(Number.isFinite(pos.x) && Number.isFinite(pos.y) && Number.isFinite(pos.z));
    assert.ok(pos.y > -0.15, `Bone ${id} tunneled under ground: y=${pos.y}`);
    assert.ok(pos.y < 1.2, `Bone ${id} stayed floating high after collapse: y=${pos.y}`);
  }
});
