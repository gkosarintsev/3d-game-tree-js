import * as THREE from 'three';
import {
  ARENA_OBSTACLES,
  ARENA_RADIUS,
  evaluateCrawlKinematics,
  evaluateLeapKinematics,
} from './ragdollPhysics';
import type { XenomorphAnimState } from './types';
import type { XenomorphJoints, XenomorphRig } from './xenomorphRig';

// Pre-allocated scratch math for surface orientation (zero GC)
const _crawlFwd = new THREE.Vector3();
const _crawlUp = new THREE.Vector3();
const _crawlSide = new THREE.Vector3();
const _crawlMat = new THREE.Matrix4();
const _crawlQuat = new THREE.Quaternion();
const _uprightQuat = new THREE.Quaternion();
const _euler = new THREE.Euler();

export interface AnimPoseTarget {
  pelvisY: number;
  pelvisRotX: number;
  pelvisRotY: number;
  pelvisRotZ: number;
  chestRotX: number;
  chestRotY: number;
  chestRotZ: number;
  neckRotX: number;
  neckRotY: number;
  headRotX: number;
  headRotY: number;
  headRotZ: number;
  jawRotX: number;
  innerJawZ: number;
  shoulderL: [number, number, number];
  elbowL: [number, number, number];
  handL: [number, number, number];
  shoulderR: [number, number, number];
  elbowR: [number, number, number];
  handR: [number, number, number];
  hipL: [number, number, number];
  kneeL: [number, number, number];
  ankleL: [number, number, number];
  footL: [number, number, number];
  hipR: [number, number, number];
  kneeR: [number, number, number];
  ankleR: [number, number, number];
  footR: [number, number, number];
  tail1: [number, number, number];
  tail2: [number, number, number];
  tail3: [number, number, number];
  tail4: [number, number, number];
}

function damp(current: number, target: number, lambda: number, dt: number): number {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}

function dampTuple(
  group: THREE.Group,
  target: [number, number, number],
  lambda: number,
  dt: number,
): void {
  group.rotation.x = damp(group.rotation.x, target[0], lambda, dt);
  group.rotation.y = damp(group.rotation.y, target[1], lambda, dt);
  group.rotation.z = damp(group.rotation.z, target[2], lambda, dt);
}

function createBasePose(): AnimPoseTarget {
  return {
    pelvisY: 0.92,
    pelvisRotX: 0.16,
    pelvisRotY: 0,
    pelvisRotZ: 0,
    chestRotX: 0.38,
    chestRotY: 0,
    chestRotZ: 0,
    neckRotX: -0.24,
    neckRotY: 0,
    headRotX: -0.22,
    headRotY: 0,
    headRotZ: 0,
    jawRotX: 0.22,
    innerJawZ: 0.06,
    shoulderL: [0.16, 0.22, 0.34],
    elbowL: [-0.68, 0, -0.18],
    handL: [0.22, 0, -0.16],
    shoulderR: [0.16, -0.22, -0.34],
    elbowR: [-0.68, 0, 0.18],
    handR: [0.22, 0, 0.16],
    hipL: [-0.32, 0.08, 0.08],
    kneeL: [0.46, 0, 0],
    ankleL: [-0.3, 0, 0],
    footL: [0.06, 0, 0],
    hipR: [-0.32, -0.08, -0.08],
    kneeR: [0.46, 0, 0],
    ankleR: [-0.3, 0, 0],
    footR: [0.06, 0, 0],
    tail1: [-0.14, 0.12, 0],
    tail2: [0.08, 0.16, 0],
    tail3: [0.16, 0.18, 0],
    tail4: [0.22, 0.14, 0],
  };
}

export class XenomorphAnimator {
  public state: XenomorphAnimState = 'idle';
  public stateTime = 0;
  public cyclePhase = 0;
  public attackComboIndex = 0;
  public leapCount = 0;
  public rootPos = new THREE.Vector3(0, 0, 0);
  public rootYaw = 0; // radians, 0 faces +Z
  public forwardSpeed = 0;
  public surfaceNormal = new THREE.Vector3(0, 1, 0);

  private pose: AnimPoseTarget = createBasePose();
  private prevLeapPhase: 'windup' | 'airborne' | 'landing' = 'windup';
  private prevAttackSwing = false;
  private deathFromCrawl = false;
  private deathImpulsePending: THREE.Vector3 | null = null;
  private deathHitNode: Parameters<typeof import('./ragdollPhysics').applyRagdollImpulse>[1] = 'chest';

  public setState(
    nextState: XenomorphAnimState,
    options?: {
      deathImpulse?: THREE.Vector3;
      deathHitNode?: Parameters<typeof import('./ragdollPhysics').applyRagdollImpulse>[1];
    },
  ): void {
    if (nextState === 'ragdoll') return;
    if (this.state === 'ragdoll' && nextState !== 'idle') return;

    const prevState = this.state;
    this.state = nextState;
    this.stateTime = 0;
    this.prevLeapPhase = 'windup';
    this.prevAttackSwing = false;

    if (nextState === 'death') {
      this.deathFromCrawl = prevState === 'crawl' || this.rootPos.y > 0.25;
      const sideSign = Math.random() > 0.5 ? 1 : -1;
      const fwdX = Math.sin(this.rootYaw);
      const fwdZ = Math.cos(this.rootYaw);
      const sideX = Math.cos(this.rootYaw) * sideSign;
      const sideZ = -Math.sin(this.rootYaw) * sideSign;
      this.deathImpulsePending = options?.deathImpulse
        ? options.deathImpulse.clone()
        : this.deathFromCrawl
          ? new THREE.Vector3(sideX * 3.5, -6.5, sideZ * 2.5)
          : new THREE.Vector3(
              fwdX * -11.0 + sideX * 7.5,
              0.8,
              fwdZ * -11.0 + sideZ * 7.5,
            );
      this.deathHitNode = options?.deathHitNode ?? 'chest';
    } else {
      this.deathFromCrawl = false;
    }
  }

  public reset(rig: XenomorphRig): void {
    rig.resetRig();
    this.state = 'idle';
    this.stateTime = 0;
    this.cyclePhase = 0;
    this.forwardSpeed = 0;
    this.deathFromCrawl = false;
    this.surfaceNormal.set(0, 1, 0);
    this.rootPos.set(0, 0, 0);
    this.rootYaw = 0;
    rig.group.position.set(0, 0, 0);
    rig.group.rotation.set(0, 0, 0);
    rig.group.quaternion.identity();
    this.deathImpulsePending = null;
  }

  public update(
    rig: XenomorphRig,
    dt: number,
    callbacks?: {
      onLeapLaunch?: () => void;
      onLeapLand?: (pos: THREE.Vector3) => void;
      onAttackStrike?: () => void;
      onEnterRagdoll?: (
        hitNode: Parameters<typeof import('./ragdollPhysics').applyRagdollImpulse>[1],
        impulse: THREE.Vector3,
      ) => void;
      onFootstep?: () => void;
    },
  ): void {
    if (rig.isRagdollActive) {
      this.state = 'ragdoll';
      return;
    }

    // Snapshot previous world anchor positions before advancing FK for exact momentum transfer
    rig.capturePrevAnchors();

    this.stateTime += dt;
    const p = this.pose;
    const base = createBasePose();
    Object.assign(p, base);

    let targetForwardSpeed = 0;
    let blendLambda = 12;

    switch (this.state) {
      case 'idle': {
        const t = this.stateTime;
        const breath = Math.sin(t * 2.1);
        p.pelvisY = 0.93 + breath * 0.018;
        p.chestRotX = 0.36 + breath * 0.04;
        p.headRotY = Math.sin(t * 0.9) * 0.28;
        p.headRotX = -0.22 + Math.sin(t * 1.6) * 0.06;
        p.jawRotX = 0.08 + Math.max(0, Math.sin(t * 1.4)) * 0.14;
        p.innerJawZ = 0.06;
        p.shoulderL = [0.24 + breath * 0.05, 0.14, 0.2];
        p.shoulderR = [0.24 + breath * 0.05, -0.14, -0.2];
        p.tail1 = [-0.15, Math.sin(t * 1.7) * 0.24, 0];
        p.tail2 = [0.1, Math.sin(t * 1.7 - 0.8) * 0.32, 0];
        p.tail3 = [0.18, Math.sin(t * 1.7 - 1.6) * 0.38, 0];
        p.tail4 = [0.22, Math.sin(t * 1.7 - 2.3) * 0.42, 0];
        targetForwardSpeed = 0;
        blendLambda = 10;
        break;
      }

      case 'walk': {
        targetForwardSpeed = 2.45;
        const prevPhase = this.cyclePhase;
        this.cyclePhase += dt * 5.2;
        if (Math.floor(this.cyclePhase / Math.PI) !== Math.floor(prevPhase / Math.PI)) {
          callbacks?.onFootstep?.();
        }
        const ph = this.cyclePhase;
        const s = Math.sin(ph);
        const c = Math.cos(ph);

        p.pelvisY = 0.9 + Math.abs(c) * 0.055;
        p.pelvisRotX = 0.2;
        p.pelvisRotY = s * 0.1;
        p.pelvisRotZ = c * 0.06;
        p.chestRotX = 0.44 + Math.abs(s) * 0.04;
        p.chestRotY = -s * 0.14;
        p.neckRotX = -0.28;
        p.headRotX = -0.28 + Math.sin(ph * 2) * 0.05;
        p.headRotY = s * 0.08;
        p.jawRotX = 0.12 + Math.abs(s) * 0.08;

        // Counter-swinging clawed arms
        p.shoulderL = [0.35 - s * 0.45, 0.1, 0.22];
        p.elbowL = [-0.95 + Math.max(0, -s) * 0.3, 0, -0.12];
        p.shoulderR = [0.35 + s * 0.45, -0.1, -0.22];
        p.elbowR = [-0.95 + Math.max(0, s) * 0.3, 0, 0.12];

        // Digitigrade stride
        const liftL = Math.max(0, c);
        const liftR = Math.max(0, -c);
        p.hipL = [-0.32 + s * 0.52, 0.05, 0.05];
        p.kneeL = [0.46 + liftL * 0.48, 0, 0];
        p.ankleL = [-0.3 - liftL * 0.42 + s * 0.18, 0, 0];
        p.footL = [0.1 - liftL * 0.3, 0, 0];

        p.hipR = [-0.32 - s * 0.52, -0.05, -0.05];
        p.kneeR = [0.46 + liftR * 0.48, 0, 0];
        p.ankleR = [-0.3 - liftR * 0.42 - s * 0.18, 0, 0];
        p.footR = [0.1 - liftR * 0.3, 0, 0];

        // Undulating counterbalance tail
        p.tail1 = [-0.1, -s * 0.28, 0];
        p.tail2 = [0.08, Math.sin(ph - 0.9) * -0.34, 0];
        p.tail3 = [0.14, Math.sin(ph - 1.7) * -0.4, 0];
        p.tail4 = [0.18, Math.sin(ph - 2.5) * -0.42, 0];
        blendLambda = 16;
        break;
      }

      case 'run': {
        targetForwardSpeed = 6.4;
        const prevPhase = this.cyclePhase;
        this.cyclePhase += dt * 10.6;
        if (Math.floor(this.cyclePhase / Math.PI) !== Math.floor(prevPhase / Math.PI)) {
          callbacks?.onFootstep?.();
        }
        const ph = this.cyclePhase;
        const s = Math.sin(ph);
        const c = Math.cos(ph);

        p.pelvisY = 0.84 + Math.abs(c) * 0.11;
        p.pelvisRotX = 0.34;
        p.pelvisRotY = s * 0.14;
        p.pelvisRotZ = c * 0.08;
        p.chestRotX = 0.58;
        p.chestRotY = -s * 0.22;
        p.neckRotX = -0.36;
        p.headRotX = -0.42;
        p.jawRotX = 0.26 + Math.abs(s) * 0.12;
        p.innerJawZ = 0.09;

        // Powerful predator claw drive
        p.shoulderL = [0.45 - s * 0.85, 0.14, 0.28];
        p.elbowL = [-1.05 + Math.max(0, -s) * 0.4, 0, -0.16];
        p.handL = [0.55, 0, 0];

        p.shoulderR = [0.45 + s * 0.85, -0.14, -0.28];
        p.elbowR = [-1.05 + Math.max(0, s) * 0.4, 0, 0.16];
        p.handR = [0.55, 0, 0];

        // Long digitigrade gallop stride
        const liftL = Math.max(0, c);
        const liftR = Math.max(0, -c);
        p.hipL = [-0.36 + s * 0.88, 0.04, 0.05];
        p.kneeL = [0.5 + liftL * 0.72, 0, 0];
        p.ankleL = [-0.34 - liftL * 0.55 + s * 0.26, 0, 0];
        p.footL = [0.14 - liftL * 0.45, 0, 0];

        p.hipR = [-0.36 - s * 0.88, -0.04, -0.05];
        p.kneeR = [0.5 + liftR * 0.72, 0, 0];
        p.ankleR = [-0.34 - liftR * 0.55 - s * 0.26, 0, 0];
        p.footR = [0.14 - liftR * 0.45, 0, 0];

        // Whipping horizontal stabilizer tail
        p.tail1 = [-0.04, -s * 0.22, 0];
        p.tail2 = [0.04, Math.sin(ph - 0.8) * -0.28, 0];
        p.tail3 = [0.06, Math.sin(ph - 1.5) * -0.34, 0];
        p.tail4 = [0.05, Math.sin(ph - 2.2) * -0.36, 0];
        blendLambda = 22;
        break;
      }

      case 'attack': {
        const cycleDuration = 0.84;
        const cycleIdx = Math.floor(this.stateTime / cycleDuration);
        const handSign = cycleIdx % 2 === 0 ? 1 : -1; // Alternate R / L slash
        const u = (this.stateTime % cycleDuration) / cycleDuration;

        if (u < 0.24) {
          // Windup coil
          const w = u / 0.24;
          p.pelvisY = 0.86 - w * 0.08;
          p.chestRotX = 0.25 - w * 0.22;
          p.chestRotY = handSign * w * 0.42;
          p.headRotX = -0.18;
          p.jawRotX = 0.18 + w * 0.34;
          if (handSign > 0) {
            p.shoulderR = [-0.85 * w, -0.45 * w, -0.65 * w];
            p.elbowR = [-1.25, 0, 0.2];
            p.shoulderL = [0.4, 0.2, 0.25];
          } else {
            p.shoulderL = [-0.85 * w, 0.45 * w, 0.65 * w];
            p.elbowL = [-1.25, 0, -0.2];
            p.shoulderR = [0.4, -0.2, -0.25];
          }
          p.tail1 = [-0.2, -handSign * 0.35 * w, 0];
          this.prevAttackSwing = false;
        } else if (u < 0.56) {
          // Violent claw slash + inner jaw snap
          const s = (u - 0.24) / 0.32;
          const snap = Math.sin(s * Math.PI);
          if (!this.prevAttackSwing) {
            this.prevAttackSwing = true;
            callbacks?.onAttackStrike?.();
          }
          targetForwardSpeed = 2.6 * snap;
          p.pelvisY = 0.88 + snap * 0.08;
          p.chestRotX = 0.52 + snap * 0.24;
          p.chestRotY = handSign * (0.42 - s * 0.95);
          p.neckRotX = -0.15;
          p.headRotX = -0.22;
          p.jawRotX = 0.56;
          p.innerJawZ = 0.08 + snap * 0.16;

          if (handSign > 0) {
            p.shoulderR = [1.25 * snap + 0.35, 0.55 * s - 0.2, -0.25 + 0.55 * s];
            p.elbowR = [-0.35 - (1 - snap) * 0.4, 0, -0.2];
            p.handR = [0.5, 0, -0.3];
            p.shoulderL = [0.35, 0.25, 0.3];
            p.elbowL = [-1.1, 0, -0.15];
          } else {
            p.shoulderL = [1.25 * snap + 0.35, -0.55 * s + 0.2, 0.25 - 0.55 * s];
            p.elbowL = [-0.35 - (1 - snap) * 0.4, 0, 0.2];
            p.handL = [0.5, 0, 0.3];
            p.shoulderR = [0.35, -0.25, -0.3];
            p.elbowR = [-1.1, 0, 0.15];
          }

          p.hipL = [-0.45, 0.1, 0.1];
          p.hipR = [-0.15, -0.1, -0.1];
          p.tail1 = [-0.1, handSign * 0.45 * snap, 0];
          p.tail2 = [0.15, handSign * 0.35 * snap, 0];
        } else {
          // Recovery back to predatory guard
          const r = (u - 0.56) / 0.44;
          p.pelvisY = 0.9 + r * 0.04;
          p.chestRotX = 0.44 - r * 0.08;
          p.chestRotY = -handSign * 0.4 * (1 - r);
          p.jawRotX = 0.45 * (1 - r) + 0.1;
          p.innerJawZ = 0.06;
          p.shoulderL = [0.35, 0.15, 0.22];
          p.shoulderR = [0.35, -0.15, -0.22];
        }
        blendLambda = 26;
        break;
      }

      case 'leap': {
        const total = 1.15;
        if (this.stateTime >= total) {
          this.stateTime = 0;
          this.leapCount += 1;
          this.prevLeapPhase = 'windup';
        }
        const kin = evaluateLeapKinematics(this.stateTime);

        if (kin.phase === 'windup') {
          const w = this.stateTime / 0.22;
          p.pelvisY = 0.94 - w * 0.28;
          p.pelvisRotX = 0.22 + w * 0.25;
          p.chestRotX = 0.42 + w * 0.3;
          p.neckRotX = -0.35;
          p.headRotX = -0.38;
          p.jawRotX = 0.15 + w * 0.25;
          p.hipL = [-0.75 * w - 0.28, 0.1, 0.12];
          p.kneeL = [0.42 + 0.72 * w, 0, 0];
          p.ankleL = [-0.28 - 0.48 * w, 0, 0];
          p.hipR = [-0.75 * w - 0.28, -0.1, -0.12];
          p.kneeR = [0.42 + 0.72 * w, 0, 0];
          p.ankleR = [-0.28 - 0.48 * w, 0, 0];
          p.shoulderL = [-0.35 * w, 0.18, 0.25];
          p.shoulderR = [-0.35 * w, -0.18, -0.25];
          p.tail1 = [0.22 * w, 0, 0];
          targetForwardSpeed = kin.forwardSpeed;
          blendLambda = 24;
        } else if (kin.phase === 'airborne') {
          if (this.prevLeapPhase !== 'airborne') {
            this.prevLeapPhase = 'airborne';
            callbacks?.onLeapLaunch?.();
          }
          const u = kin.normalizedAir;
          p.pelvisY = 0.96 + kin.heightOffset;
          // Pitch body up on ascent, level, then dive slightly before landing
          p.pelvisRotX = THREE.MathUtils.lerp(-0.28, 0.44, u);
          p.chestRotX = 0.28;
          p.neckRotX = -0.18;
          p.headRotX = -0.32;
          p.jawRotX = 0.52;
          p.innerJawZ = 0.16;

          // Outstretched pouncing claws forward!
          p.shoulderL = [1.35, 0.18, 0.25];
          p.elbowL = [-0.35, 0, -0.05];
          p.handL = [0.35, 0, 0];
          p.shoulderR = [1.35, -0.18, -0.25];
          p.elbowR = [-0.35, 0, 0.05];
          p.handR = [0.35, 0, 0];

          // Hind legs kick back on launch then tuck forward for landing
          const legSweep = THREE.MathUtils.lerp(0.65, -0.75, u);
          p.hipL = [legSweep, 0.08, 0.08];
          p.kneeL = [u < 0.5 ? 0.18 : 0.78, 0, 0];
          p.ankleL = [u < 0.5 ? -0.1 : -0.55, 0, 0];
          p.hipR = [legSweep, -0.08, -0.08];
          p.kneeR = [u < 0.5 ? 0.18 : 0.78, 0, 0];
          p.ankleR = [u < 0.5 ? -0.1 : -0.55, 0, 0];

          // Tail streams straight behind
          p.tail1 = [0.1, 0, 0];
          p.tail2 = [0.05, 0, 0];
          p.tail3 = [-0.04, 0, 0];
          p.tail4 = [-0.06, 0, 0];

          targetForwardSpeed = kin.forwardSpeed;
          blendLambda = 28;
        } else {
          if (this.prevLeapPhase !== 'landing') {
            this.prevLeapPhase = 'landing';
            callbacks?.onLeapLand?.(this.rootPos);
          }
          const l = (this.stateTime - 0.88) / (1.15 - 0.88);
          const squash = Math.sin(l * Math.PI);
          p.pelvisY = 0.92 - squash * 0.26;
          p.pelvisRotX = 0.24;
          p.chestRotX = 0.55 + squash * 0.15;
          p.jawRotX = 0.24 * (1 - l);
          p.hipL = [-0.55 - squash * 0.3, 0.08, 0.1];
          p.kneeL = [0.75 + squash * 0.35, 0, 0];
          p.ankleL = [-0.55, 0, 0];
          p.hipR = [-0.55 - squash * 0.3, -0.08, -0.1];
          p.kneeR = [0.75 + squash * 0.35, 0, 0];
          p.ankleR = [-0.55, 0, 0];
          p.shoulderL = [0.55, 0.15, 0.22];
          p.elbowL = [-1.0, 0, -0.1];
          p.shoulderR = [0.55, -0.15, -0.22];
          p.elbowR = [-1.0, 0, 0.1];
          targetForwardSpeed = kin.forwardSpeed;
          blendLambda = 26;
        }
        break;
      }

      case 'crawl': {
        const kin = evaluateCrawlKinematics(this.stateTime);
        const prevPhase = this.cyclePhase;
        this.cyclePhase += dt * 13.5;
        if (Math.floor(this.cyclePhase / Math.PI) !== Math.floor(prevPhase / Math.PI)) {
          callbacks?.onFootstep?.();
        }
        const ph = this.cyclePhase;
        const s = Math.sin(ph);
        const c = Math.cos(ph);

        // Low, flat reptilian quadruped pose clinging to floor/wall/ceiling
        p.pelvisY = 0.40 + Math.abs(c) * 0.04;
        p.pelvisRotX = 1.08 + s * 0.05;
        p.pelvisRotY = s * 0.18;
        p.pelvisRotZ = c * 0.09;
        p.chestRotX = 0.24;
        p.chestRotY = -s * 0.24;
        p.neckRotX = -0.62;
        p.headRotX = -0.64 + Math.sin(ph * 2) * 0.05;
        p.headRotY = s * 0.14;
        p.jawRotX = 0.28 + Math.max(0, c) * 0.14;
        p.innerJawZ = 0.08;

        // Splayed diagonal forelimb grip
        p.shoulderL = [-1.6 + s * 0.54, -0.18, 0.62];
        p.elbowL = [-0.55 - Math.max(0, s) * 0.45, 0, -0.25];
        p.handL = [0.22, 0, -0.15];

        p.shoulderR = [-1.6 - s * 0.54, 0.18, -0.62];
        p.elbowR = [-0.55 - Math.max(0, -s) * 0.45, 0, 0.25];
        p.handR = [0.22, 0, 0.15];

        // Splayed diagonal hind leg drive
        p.hipL = [-1.55 - s * 0.48, 0.18, 0.55];
        p.kneeL = [0.95 + Math.max(0, -s) * 0.35, 0, 0];
        p.ankleL = [-0.62, 0, 0];
        p.footL = [0.2, 0, 0];

        p.hipR = [-1.55 + s * 0.48, -0.18, -0.55];
        p.kneeR = [0.95 + Math.max(0, s) * 0.35, 0, 0];
        p.ankleR = [-0.62, 0, 0];
        p.footR = [0.2, 0, 0];

        // Tail streaming flat along wall/ceiling surface behind pelvis
        p.tail1 = [-0.88, -s * 0.25, 0];
        p.tail2 = [-0.08, Math.sin(ph - 0.8) * -0.32, 0];
        p.tail3 = [0.06, Math.sin(ph - 1.6) * -0.38, 0];
        p.tail4 = [0.1, Math.sin(ph - 2.4) * -0.42, 0];

        const posLambda = this.stateTime < 0.45 ? 11 : 28;
        this.rootPos.x = damp(this.rootPos.x, kin.pos.x, posLambda, dt);
        this.rootPos.y = damp(this.rootPos.y, kin.pos.y, posLambda, dt);
        this.rootPos.z = damp(this.rootPos.z, kin.pos.z, posLambda, dt);

        _crawlFwd.set(kin.forward.x, kin.forward.y, kin.forward.z).normalize();
        _crawlUp.set(kin.up.x, kin.up.y, kin.up.z).normalize();
        this.surfaceNormal.copy(_crawlUp);
        _crawlSide.crossVectors(_crawlUp, _crawlFwd).normalize();
        _crawlMat.makeBasis(_crawlSide, _crawlUp, _crawlFwd);
        _crawlQuat.setFromRotationMatrix(_crawlMat);

        const slerpAlpha = 1 - Math.exp(-16 * dt);
        rig.group.quaternion.slerp(_crawlQuat, slerpAlpha);
        this.rootYaw = Math.atan2(_crawlFwd.x, _crawlFwd.z);
        this.forwardSpeed = kin.speed;
        rig.group.position.copy(this.rootPos);
        this.applyPoseToJoints(rig.joints, dt, 22);
        return;
      }

      case 'death': {
        const deathAnimDuration = 0.16;
        const u = Math.min(1, this.stateTime / deathAnimDuration);
        if (!this.deathFromCrawl) {
          // Dramatic recoil arch + leg buckle before full ragdoll physics takes over
          p.pelvisY = 0.94 - u * 0.34;
          p.pelvisRotX = -0.22 * u;
          p.pelvisRotZ = 0.36 * u;
          p.chestRotX = 0.3 - u * 0.55;
          p.chestRotZ = 0.28 * u;
          p.neckRotX = -0.35 * u;
          p.headRotX = -0.55 * u;
          p.jawRotX = 0.68 * u;
          p.innerJawZ = 0.14;
          p.shoulderL = [0.3 - 0.9 * u, 0.35 * u, 0.85 * u];
          p.elbowL = [-0.55, 0, -0.2];
          p.shoulderR = [0.3 - 0.9 * u, -0.35 * u, -0.85 * u];
          p.elbowR = [-0.55, 0, 0.2];
          p.hipL = [-0.25 - 0.55 * u, 0.15, 0.25];
          p.kneeL = [0.42 + 0.85 * u, 0, 0];
          p.hipR = [-0.25 + 0.35 * u, -0.15, -0.22];
          p.kneeR = [0.42 + 0.45 * u, 0, 0];
          p.tail1 = [-0.2, Math.sin(u * 12) * 0.35, 0];
        } else {
          // Release grip from wall/ceiling into ragdoll drop
          p.pelvisY = 0.4;
          p.jawRotX = 0.65;
          p.shoulderL = [-0.8, 0.3, 0.7];
          p.shoulderR = [-0.8, -0.3, -0.7];
        }
        targetForwardSpeed = 0;
        blendLambda = 32;

        if (this.stateTime >= deathAnimDuration) {
          this.applyPoseToJoints(rig.joints, dt, blendLambda);
          rig.enterRagdoll(dt);
          this.state = 'ragdoll';
          const impulse = this.deathImpulsePending ?? new THREE.Vector3(0, 1, -10);
          callbacks?.onEnterRagdoll?.(this.deathHitNode, impulse);
          return;
        }
        break;
      }

      case 'ragdoll':
        return;
    }

    // Smooth forward locomotion + arena perimeter/crate steering
    this.forwardSpeed = damp(this.forwardSpeed, targetForwardSpeed, 14, dt);
    if (this.forwardSpeed > 0.05) {
      this.steerInsideArena(dt);
      this.rootPos.x += Math.sin(this.rootYaw) * this.forwardSpeed * dt;
      this.rootPos.z += Math.cos(this.rootYaw) * this.forwardSpeed * dt;
      this.resolveActorFloorBounds();
    }

    // If transitioning out of wall/ceiling crawl back to floor states, smoothly land & right upright
    if (!this.deathFromCrawl) {
      if (this.rootPos.y > 0.005) {
        this.rootPos.y = damp(this.rootPos.y, 0, 12, dt);
      } else {
        this.rootPos.y = 0;
      }
      this.surfaceNormal.set(0, 1, 0);
      _euler.set(0, this.rootYaw, 0);
      _uprightQuat.setFromEuler(_euler);
      const uprightAlpha = 1 - Math.exp(-14 * dt);
      rig.group.quaternion.slerp(_uprightQuat, uprightAlpha);
    }

    rig.group.position.copy(this.rootPos);

    this.applyPoseToJoints(rig.joints, dt, blendLambda);
  }

  private steerInsideArena(dt: number): void {
    const dirX = Math.sin(this.rootYaw);
    const dirZ = Math.cos(this.rootYaw);
    const lookAhead = this.state === 'leap' ? 2.8 : 1.9;
    const probeX = this.rootPos.x + dirX * lookAhead;
    const probeZ = this.rootPos.z + dirZ * lookAhead;

    let needTurn = false;
    let desiredYaw = this.rootYaw;

    // 1. Arena boundary turn
    const probeR = Math.hypot(probeX, probeZ);
    if (probeR > ARENA_RADIUS - 2.3) {
      needTurn = true;
      desiredYaw = Math.atan2(-this.rootPos.x, -this.rootPos.z);
    }

    // 2. Obstacle crate avoidance (unless airborne in leap!)
    if (!needTurn && !(this.state === 'leap' && evaluateLeapKinematics(this.stateTime).phase === 'airborne')) {
      for (const box of ARENA_OBSTACLES) {
        const margin = 0.85;
        if (
          probeX > box.minX - margin &&
          probeX < box.maxX + margin &&
          probeZ > box.minZ - margin &&
          probeZ < box.maxZ + margin
        ) {
          needTurn = true;
          const cx = (box.minX + box.maxX) * 0.5;
          const cz = (box.minZ + box.maxZ) * 0.5;
          desiredYaw = Math.atan2(this.rootPos.x - cx, this.rootPos.z - cz);
          break;
        }
      }
    }

    if (needTurn) {
      let diff = desiredYaw - this.rootYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      const turnRate = this.state === 'run' || this.state === 'leap' ? 5.2 : 3.2;
      this.rootYaw += THREE.MathUtils.clamp(diff, -turnRate * dt, turnRate * dt);
    }
  }

  private resolveActorFloorBounds(): void {
    const maxR = ARENA_RADIUS - 1.1;
    const r = Math.hypot(this.rootPos.x, this.rootPos.z);
    if (r > maxR) {
      this.rootPos.x = (this.rootPos.x / r) * maxR;
      this.rootPos.z = (this.rootPos.z / r) * maxR;
    }
    // Keep actor outside ground crates when not airborne above them
    const airborneHeight = this.pose.pelvisY - 0.96;
    if (airborneHeight < 0.75) {
      const radius = 0.65;
      for (const box of ARENA_OBSTACLES) {
        const cx = Math.max(box.minX, Math.min(this.rootPos.x, box.maxX));
        const cz = Math.max(box.minZ, Math.min(this.rootPos.z, box.maxZ));
        const dx = this.rootPos.x - cx;
        const dz = this.rootPos.z - cz;
        const dSq = dx * dx + dz * dz;
        if (dSq < radius * radius) {
          const d = Math.sqrt(dSq) || 0.001;
          const push = radius - d;
          this.rootPos.x += (dx / d) * push;
          this.rootPos.z += (dz / d) * push;
        }
      }
    }
  }

  private applyPoseToJoints(joints: XenomorphJoints, dt: number, lambda: number): void {
    const p = this.pose;
    joints.pelvis.position.y = damp(joints.pelvis.position.y, p.pelvisY, lambda, dt);
    joints.pelvis.rotation.x = damp(joints.pelvis.rotation.x, p.pelvisRotX, lambda, dt);
    joints.pelvis.rotation.y = damp(joints.pelvis.rotation.y, p.pelvisRotY, lambda, dt);
    joints.pelvis.rotation.z = damp(joints.pelvis.rotation.z, p.pelvisRotZ, lambda, dt);

    joints.chest.rotation.x = damp(joints.chest.rotation.x, p.chestRotX, lambda, dt);
    joints.chest.rotation.y = damp(joints.chest.rotation.y, p.chestRotY, lambda, dt);
    joints.chest.rotation.z = damp(joints.chest.rotation.z, p.chestRotZ, lambda, dt);

    joints.neck.rotation.x = damp(joints.neck.rotation.x, p.neckRotX, lambda, dt);
    joints.neck.rotation.y = damp(joints.neck.rotation.y, p.neckRotY, lambda, dt);

    joints.head.rotation.x = damp(joints.head.rotation.x, p.headRotX, lambda, dt);
    joints.head.rotation.y = damp(joints.head.rotation.y, p.headRotY, lambda, dt);
    joints.head.rotation.z = damp(joints.head.rotation.z, p.headRotZ, lambda, dt);

    joints.jaw.rotation.x = damp(joints.jaw.rotation.x, p.jawRotX, lambda, dt);
    joints.innerJaw.position.z = damp(joints.innerJaw.position.z, p.innerJawZ, lambda * 1.4, dt);

    dampTuple(joints.shoulderL, p.shoulderL, lambda, dt);
    dampTuple(joints.elbowL, p.elbowL, lambda, dt);
    dampTuple(joints.handL, p.handL, lambda, dt);

    dampTuple(joints.shoulderR, p.shoulderR, lambda, dt);
    dampTuple(joints.elbowR, p.elbowR, lambda, dt);
    dampTuple(joints.handR, p.handR, lambda, dt);

    dampTuple(joints.hipL, p.hipL, lambda, dt);
    dampTuple(joints.kneeL, p.kneeL, lambda, dt);
    dampTuple(joints.ankleL, p.ankleL, lambda, dt);
    dampTuple(joints.footL, p.footL, lambda, dt);

    dampTuple(joints.hipR, p.hipR, lambda, dt);
    dampTuple(joints.kneeR, p.kneeR, lambda, dt);
    dampTuple(joints.ankleR, p.ankleR, lambda, dt);
    dampTuple(joints.footR, p.footR, lambda, dt);

    dampTuple(joints.tail1, p.tail1, lambda, dt);
    dampTuple(joints.tail2, p.tail2, lambda, dt);
    dampTuple(joints.tail3, p.tail3, lambda, dt);
    dampTuple(joints.tail4, p.tail4, lambda, dt);
  }
}
