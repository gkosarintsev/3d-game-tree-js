import * as CANNON from 'cannon-es';
import { BONE_ORDER, BONE_SPECS, type BoneId } from './enemyConfig';

export interface WorldBoneTransform {
  pivotPos: [number, number, number];
  worldQuat: [number, number, number, number];
}

export interface RangeObstacleSpec {
  id: string;
  position: [number, number, number];
  halfExtents: [number, number, number];
}

export const RANGE_OBSTACLES: RangeObstacleSpec[] = [
  // Low tactical concrete barrier behind/beside the patrol lane so ragdolls can drape over it
  {
    id: 'cover_block_left',
    position: [-1.35, 0.35, -0.55],
    halfExtents: [0.65, 0.35, 0.28],
  },
  // Low concrete step platform on the right
  {
    id: 'step_platform_right',
    position: [1.55, 0.2, -0.35],
    halfExtents: [0.6, 0.2, 0.65],
  },
];

const GROUP_ENV = 1;
const GROUP_CORE = 2; // pelvis, torso
const GROUP_HEAD = 4;
const GROUP_UPPER_LIMB = 8; // upperArmL/R, thighL/R
const GROUP_LOWER_LIMB = 16; // forearmL/R, shinL/R
const GROUP_PROP = 32; // dropped rifle

export interface BoneBodyState {
  id: BoneId;
  body: CANNON.Body;
  comOffset: CANNON.Vec3;
  halfExtents: [number, number, number];
}

export class RagdollPhysicsWorld {
  public readonly world: CANNON.World;
  public readonly groundBody: CANNON.Body;
  public readonly obstacleBodies: CANNON.Body[] = [];
  public readonly boneBodies = new Map<BoneId, BoneBodyState>();
  public readonly rifleBody: CANNON.Body;
  public readonly constraints: CANNON.Constraint[] = [];

  private readonly boneMat: CANNON.Material;
  private readonly envMat: CANNON.Material;
  private prevBoneTransforms = new Map<BoneId, WorldBoneTransform>();
  private rifleDetached = false;

  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    const solver = new CANNON.GSSolver();
    solver.iterations = 14;
    solver.tolerance = 0.001;
    this.world.solver = solver;

    this.boneMat = new CANNON.Material('ragdollBone');
    this.envMat = new CANNON.Material('rangeEnv');

    const contactMat = new CANNON.ContactMaterial(this.boneMat, this.envMat, {
      friction: 0.65,
      restitution: 0.08,
    });
    const boneSelfMat = new CANNON.ContactMaterial(this.boneMat, this.boneMat, {
      friction: 0.45,
      restitution: 0.05,
    });
    this.world.addContactMaterial(contactMat);
    this.world.addContactMaterial(boneSelfMat);

    // Ground plane y = 0
    this.groundBody = new CANNON.Body({
      mass: 0,
      material: this.envMat,
      collisionFilterGroup: GROUP_ENV,
      collisionFilterMask: GROUP_CORE | GROUP_HEAD | GROUP_UPPER_LIMB | GROUP_LOWER_LIMB | GROUP_PROP,
    });
    this.groundBody.addShape(new CANNON.Plane());
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    this.world.addBody(this.groundBody);

    // Static tactical cover blocks
    for (const obs of RANGE_OBSTACLES) {
      const body = new CANNON.Body({
        mass: 0,
        material: this.envMat,
        collisionFilterGroup: GROUP_ENV,
        collisionFilterMask: GROUP_CORE | GROUP_HEAD | GROUP_UPPER_LIMB | GROUP_LOWER_LIMB | GROUP_PROP,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(...obs.halfExtents)));
      body.position.set(...obs.position);
      this.world.addBody(body);
      this.obstacleBodies.push(body);
    }

    // Create 11 articulated ragdoll bodies
    for (const boneId of BONE_ORDER) {
      const spec = BONE_SPECS[boneId];
      let group = GROUP_CORE;
      let mask = GROUP_ENV;

      if (boneId === 'head') {
        group = GROUP_HEAD;
        mask = GROUP_ENV | GROUP_LOWER_LIMB;
      } else if (
        boneId === 'upperArmL' ||
        boneId === 'upperArmR' ||
        boneId === 'thighL' ||
        boneId === 'thighR'
      ) {
        group = GROUP_UPPER_LIMB;
        mask = GROUP_ENV;
      } else if (
        boneId === 'forearmL' ||
        boneId === 'forearmR' ||
        boneId === 'shinL' ||
        boneId === 'shinR'
      ) {
        group = GROUP_LOWER_LIMB;
        mask = GROUP_ENV | GROUP_CORE | GROUP_HEAD;
      }

      // Slightly inset length along Y so adjacent joint colliders never interpenetrate in rest pose
      const [hx, hy, hz] = spec.halfExtents;
      const body = new CANNON.Body({
        mass: spec.mass,
        material: this.boneMat,
        linearDamping: 0.16,
        angularDamping: 0.35,
        sleepSpeedLimit: 0.12,
        sleepTimeLimit: 1.0,
        collisionFilterGroup: group,
        collisionFilterMask: mask,
      });
      body.addShape(new CANNON.Box(new CANNON.Vec3(hx * 0.92, hy * 0.84, hz * 0.92)));
      body.sleep();
      this.world.addBody(body);

      this.boneBodies.set(boneId, {
        id: boneId,
        body,
        comOffset: new CANNON.Vec3(...spec.comOffset),
        halfExtents: spec.halfExtents,
      });
    }

    // Rifle rigid body (detaches when ragdoll activates)
    this.rifleBody = new CANNON.Body({
      mass: 3.4,
      material: this.boneMat,
      linearDamping: 0.08,
      angularDamping: 0.2,
      sleepSpeedLimit: 0.12,
      sleepTimeLimit: 1.0,
      collisionFilterGroup: GROUP_PROP,
      collisionFilterMask: GROUP_ENV,
    });
    this.rifleBody.addShape(new CANNON.Box(new CANNON.Vec3(0.035, 0.09, 0.34)));
    this.rifleBody.sleep();
    this.world.addBody(this.rifleBody);

    this.buildJointConstraints();
    this.setBodiesActive(false);
  }

  private buildJointConstraints(): void {
    const addConeJoint = (
      parentId: BoneId,
      childId: BoneId,
      axisA: CANNON.Vec3,
      axisB: CANNON.Vec3,
      angle: number,
      twistAngle: number
    ) => {
      const parentState = this.boneBodies.get(parentId)!;
      const childState = this.boneBodies.get(childId)!;
      const childSpec = BONE_SPECS[childId];
      const parentSpec = BONE_SPECS[parentId];

      const pivotA = new CANNON.Vec3(
        childSpec.pivotOffset[0] - parentSpec.comOffset[0],
        childSpec.pivotOffset[1] - parentSpec.comOffset[1],
        childSpec.pivotOffset[2] - parentSpec.comOffset[2]
      );
      const pivotB = new CANNON.Vec3(
        -childSpec.comOffset[0],
        -childSpec.comOffset[1],
        -childSpec.comOffset[2]
      );

      axisA.normalize();
      axisB.normalize();

      const c = new CANNON.ConeTwistConstraint(parentState.body, childState.body, {
        pivotA,
        pivotB,
        axisA,
        axisB,
        angle,
        twistAngle,
        maxForce: 1e6,
        collideConnected: false,
      });
      this.world.addConstraint(c);
      this.constraints.push(c);
    };

    // Spine: pelvis -> torso
    addConeJoint(
      'pelvis',
      'torso',
      new CANNON.Vec3(0, 1, 0),
      new CANNON.Vec3(0, 1, 0),
      Math.PI / 5,
      Math.PI / 6
    );

    // Neck: torso -> head
    addConeJoint(
      'torso',
      'head',
      new CANNON.Vec3(0, 1, 0),
      new CANNON.Vec3(0, 1, 0),
      Math.PI / 4,
      Math.PI / 4
    );

    // Shoulders: torso -> upperArmL / upperArmR (angled slightly outward & forward)
    addConeJoint(
      'torso',
      'upperArmL',
      new CANNON.Vec3(0.35, -0.85, 0.3),
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.55,
      Math.PI / 3
    );
    addConeJoint(
      'torso',
      'upperArmR',
      new CANNON.Vec3(-0.35, -0.85, 0.3),
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.55,
      Math.PI / 3
    );

    // Elbows: upperArm -> forearm (tilted forward +Z so forearm bends naturally forward, never backward)
    const elbowBendTilt = 0.92;
    addConeJoint(
      'upperArmL',
      'forearmL',
      new CANNON.Vec3(0, -Math.cos(elbowBendTilt), Math.sin(elbowBendTilt)),
      new CANNON.Vec3(0, -1, 0),
      1.02,
      0.22
    );
    addConeJoint(
      'upperArmR',
      'forearmR',
      new CANNON.Vec3(0, -Math.cos(elbowBendTilt), Math.sin(elbowBendTilt)),
      new CANNON.Vec3(0, -1, 0),
      1.02,
      0.22
    );

    // Hips: pelvis -> thighL / thighR (biased slightly forward so legs swing forward more than hyperextending back)
    addConeJoint(
      'pelvis',
      'thighL',
      new CANNON.Vec3(0.14, -0.92, 0.36),
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.42,
      Math.PI / 5
    );
    addConeJoint(
      'pelvis',
      'thighR',
      new CANNON.Vec3(-0.14, -0.92, 0.36),
      new CANNON.Vec3(0, -1, 0),
      Math.PI * 0.42,
      Math.PI / 5
    );

    // Knees: thigh -> shin (tilted backward -Z so shin bends backward naturally, never hyperextending forward)
    const kneeBendTilt = 0.95;
    addConeJoint(
      'thighL',
      'shinL',
      new CANNON.Vec3(0, -Math.cos(kneeBendTilt), -Math.sin(kneeBendTilt)),
      new CANNON.Vec3(0, -1, 0),
      1.04,
      0.14
    );
    addConeJoint(
      'thighR',
      'shinR',
      new CANNON.Vec3(0, -Math.cos(kneeBendTilt), -Math.sin(kneeBendTilt)),
      new CANNON.Vec3(0, -1, 0),
      1.04,
      0.14
    );
  }

  public setBodiesActive(active: boolean): void {
    const type = active ? CANNON.Body.DYNAMIC : CANNON.Body.KINEMATIC;
    for (const state of this.boneBodies.values()) {
      state.body.type = type;
      state.body.collisionResponse = active;
      if (active) {
        state.body.wakeUp();
      } else {
        state.body.velocity.setZero();
        state.body.angularVelocity.setZero();
        state.body.sleep();
      }
    }
    this.rifleBody.type = active ? CANNON.Body.DYNAMIC : CANNON.Body.KINEMATIC;
    this.rifleBody.collisionResponse = active;
    if (active) {
      this.rifleBody.wakeUp();
    } else {
      this.rifleBody.velocity.setZero();
      this.rifleBody.angularVelocity.setZero();
      this.rifleBody.sleep();
    }
    this.rifleDetached = active;
  }

  /**
   * Records kinematic bone transforms each frame while animated so that transitioning
   * to ragdoll inherits real linear velocity from the walk cycle.
   */
  public recordKinematicPose(
    transforms: Record<BoneId, WorldBoneTransform>,
    rifleWorldPos: [number, number, number],
    rifleWorldQuat: [number, number, number, number],
    dt: number
  ): void {
    const safeDt = Math.max(dt, 1 / 120);

    for (const boneId of BONE_ORDER) {
      const state = this.boneBodies.get(boneId)!;
      const t = transforms[boneId];
      const q = new CANNON.Quaternion(...t.worldQuat);
      const rotatedCom = q.vmult(state.comOffset);
      const nextPos = new CANNON.Vec3(
        t.pivotPos[0] + rotatedCom.x,
        t.pivotPos[1] + rotatedCom.y,
        t.pivotPos[2] + rotatedCom.z
      );

      const prev = this.prevBoneTransforms.get(boneId);
      if (prev) {
        const prevQ = new CANNON.Quaternion(...prev.worldQuat);
        const prevRotatedCom = prevQ.vmult(state.comOffset);
        const prevPosX = prev.pivotPos[0] + prevRotatedCom.x;
        const prevPosY = prev.pivotPos[1] + prevRotatedCom.y;
        const prevPosZ = prev.pivotPos[2] + prevRotatedCom.z;
        state.body.velocity.set(
          clampVel((nextPos.x - prevPosX) / safeDt, 6),
          clampVel((nextPos.y - prevPosY) / safeDt, 6),
          clampVel((nextPos.z - prevPosZ) / safeDt, 6)
        );
      }

      state.body.position.copy(nextPos);
      state.body.quaternion.copy(q);
      this.prevBoneTransforms.set(boneId, {
        pivotPos: [...t.pivotPos],
        worldQuat: [...t.worldQuat],
      });
    }

    this.rifleBody.position.set(...rifleWorldPos);
    this.rifleBody.quaternion.set(...rifleWorldQuat);
  }

  public enterRagdoll(
    transforms: Record<BoneId, WorldBoneTransform>,
    rifleWorldPos: [number, number, number],
    rifleWorldQuat: [number, number, number, number],
    dt: number
  ): void {
    this.recordKinematicPose(transforms, rifleWorldPos, rifleWorldQuat, dt);
    this.setBodiesActive(true);
    // Give the dropped rifle a subtle natural release tumble
    const torsoVel = this.boneBodies.get('torso')!.body.velocity;
    this.rifleBody.velocity.set(
      torsoVel.x + 0.35,
      torsoVel.y + 0.45,
      torsoVel.z + 0.55
    );
    this.rifleBody.angularVelocity.set(1.8, -1.2, 2.4);
  }

  public applyBallisticImpulse(
    boneId: BoneId,
    hitWorldPoint: [number, number, number],
    direction: [number, number, number],
    impulseMagnitude: number
  ): void {
    const state = this.boneBodies.get(boneId);
    if (!state) return;
    state.body.wakeUp();

    const len = Math.hypot(direction[0], direction[1], direction[2]) || 1;
    const impulse = new CANNON.Vec3(
      (direction[0] / len) * impulseMagnitude,
      (direction[1] / len) * impulseMagnitude + impulseMagnitude * 0.14,
      (direction[2] / len) * impulseMagnitude
    );

    const worldPoint = new CANNON.Vec3(...hitWorldPoint);
    const relativePoint = worldPoint.vsub(state.body.position);
    state.body.applyImpulse(impulse, relativePoint);

    // Wake connected bodies so force propagates cleanly through the skeleton
    for (const other of this.boneBodies.values()) {
      other.body.wakeUp();
    }
  }

  public applyShockwave(origin: [number, number, number], strength: number): void {
    const o = new CANNON.Vec3(...origin);
    for (const state of this.boneBodies.values()) {
      state.body.wakeUp();
      const diff = state.body.position.vsub(o);
      const dist = Math.max(diff.length(), 0.45);
      diff.normalize();
      const mag = (strength * state.body.mass) / (dist * 1.15);
      const impulse = new CANNON.Vec3(
        diff.x * mag,
        Math.abs(diff.y) * mag + mag * 0.65,
        diff.z * mag
      );
      state.body.applyImpulse(impulse);
    }
    this.rifleBody.wakeUp();
    this.rifleBody.applyImpulse(new CANNON.Vec3(1.5, 4.5, -2.0));
  }

  public step(dt: number, timeScale = 1): void {
    const clampedDt = Math.min(Math.max(dt, 0), 0.05) * timeScale;
    if (clampedDt <= 0) return;
    this.world.step(1 / 120, clampedDt, 8);
  }

  public isRifleDetached(): boolean {
    return this.rifleDetached;
  }

  public reset(): void {
    this.prevBoneTransforms.clear();
    this.setBodiesActive(false);
  }
}

function clampVel(v: number, limit: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(-limit, Math.min(limit, v));
}
