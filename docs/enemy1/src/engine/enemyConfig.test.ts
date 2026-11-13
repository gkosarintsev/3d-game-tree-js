import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BONE_ORDER,
  BONE_SPECS,
  computeCharacterPose,
  computeHitDamage,
} from './enemyConfig';

test('walk gait produces symmetric opposite-phase leg swing and natural knee flexion', () => {
  const p0 = computeCharacterPose(0, 1.0, 'walk');
  const pHalf = computeCharacterPose(Math.PI, 1.0, 'walk');

  // At phase 0 vs PI, thigh X rotations swap signs (excluding constant lean bias)
  assert.ok(Math.abs(p0.bones.thighL.rot[0] - pHalf.bones.thighR.rot[0]) < 1e-6);
  assert.ok(Math.abs(p0.bones.thighR.rot[0] - pHalf.bones.thighL.rot[0]) < 1e-6);

  // Knees must never hyperextend negatively across the entire cycle
  for (let i = 0; i < 32; i++) {
    const phase = (i / 32) * Math.PI * 2;
    const pose = computeCharacterPose(phase, 1.4, 'walk');
    assert.ok(pose.bones.shinL.rot[0] >= 0, `shinL hyperextended at phase ${phase}`);
    assert.ok(pose.bones.shinR.rot[0] >= 0, `shinR hyperextended at phase ${phase}`);
    assert.ok(Number.isFinite(pose.pelvisOffsetY));
  }
});

test('idle stance keeps balanced low-ready posture with all 11 bones populated', () => {
  const idle = computeCharacterPose(0.5, 0, 'idle');
  for (const id of BONE_ORDER) {
    assert.ok(idle.bones[id], `missing bone pose for ${id}`);
    assert.equal(idle.bones[id].rot.length, 3);
  }
});

test('hit damage applies headshot and limb multipliers accurately', () => {
  assert.equal(computeHitDamage(40, 'head'), 100);
  assert.equal(computeHitDamage(40, 'torso'), 40);
  assert.equal(computeHitDamage(40, 'shinL'), 28);
  assert.equal(BONE_SPECS.head.damageMultiplier, 2.5);
});
