import * as THREE from 'three';
import { createXenomorphRig } from './xenomorph-rig.js';
import { createProceduralTextures } from './xenomorph-textures.js';

export { createXenomorphRig, createProceduralTextures };

function damp(current, target, lambda, dt) {
  return THREE.MathUtils.damp(current, target, lambda, dt);
}
function dampTuple(group, target, lambda, dt) {
  group.rotation.x = damp(group.rotation.x, target[0], lambda, dt);
  group.rotation.y = damp(group.rotation.y, target[1], lambda, dt);
  group.rotation.z = damp(group.rotation.z, target[2], lambda, dt);
}
function basePose() {
  return {
    pelvisY: 0.92, pelvisRotX: 0.16, pelvisRotY: 0, pelvisRotZ: 0,
    chestRotX: 0.38, chestRotY: 0, chestRotZ: 0,
    neckRotX: -0.24, neckRotY: 0,
    headRotX: -0.22, headRotY: 0, headRotZ: 0,
    jawRotX: 0.22, innerJawZ: 0.06,
    shoulderL: [0.16, 0.22, 0.34], elbowL: [-0.68, 0, -0.18], handL: [0.22, 0, -0.16],
    shoulderR: [0.16, -0.22, -0.34], elbowR: [-0.68, 0, 0.18], handR: [0.22, 0, 0.16],
    hipL: [-0.32, 0.08, 0.08], kneeL: [0.46, 0, 0], ankleL: [-0.3, 0, 0], footL: [0.06, 0, 0],
    hipR: [-0.32, -0.08, -0.08], kneeR: [0.46, 0, 0], ankleR: [-0.3, 0, 0], footR: [0.06, 0, 0],
    tail1: [-0.14, 0.12, 0], tail2: [0.08, 0.16, 0], tail3: [0.16, 0.18, 0], tail4: [0.22, 0.14, 0],
  };
}

/**
 * Аниматор позы ксеноморфа (визуал): idle/walk/run/leap/attack/crawl.
 * Позицию и ориентацию тела в мире задаёт физика вызывающего кода; здесь только кости.
 */
export class XenoAnimator {
  constructor() {
    this.time = 0;
    this.cycle = 0;
    this.attackTime = 0;
    this.leapTime = 0;
  }

  /** @param {{joints:any}} rig */
  update(rig, dt, { move = 0, run = false, attack = 0, leap = 0, crawling = false, dead = 0 } = {}) {
    this.time += dt;
    this.cycle += dt * (crawling ? 13.5 : run ? 10.6 : 5.2) * Math.max(0.15, move || (crawling ? 1 : 0));
    if (attack > 0) this.attackTime += dt; else this.attackTime = 0;
    if (leap > 0) this.leapTime += dt; else this.leapTime = 0;

    const p = basePose();
    let lambda = 14;
    const ph = this.cycle;
    const s = Math.sin(ph);
    const c = Math.cos(ph);

    if (dead > 0.01) {
      const u = Math.min(1, dead);
      p.pelvisY = 0.94 - u * 0.34;
      p.pelvisRotX = -0.22 * u;
      p.pelvisRotZ = 0.36 * u;
      p.chestRotX = 0.3 - u * 0.55;
      p.chestRotZ = 0.28 * u;
      p.headRotX = -0.55 * u;
      p.jawRotX = 0.68 * u;
      p.innerJawZ = 0.14;
      p.shoulderL = [0.3 - 0.9 * u, 0.35 * u, 0.85 * u];
      p.shoulderR = [0.3 - 0.9 * u, -0.35 * u, -0.85 * u];
      p.hipL = [-0.25 - 0.55 * u, 0.15, 0.25];
      p.kneeL = [0.42 + 0.85 * u, 0, 0];
      p.hipR = [-0.25 + 0.35 * u, -0.15, -0.22];
      p.kneeR = [0.42 + 0.45 * u, 0, 0];
      p.tail1 = [-0.2, Math.sin(this.time * 12) * 0.35 * (1 - u), 0];
      lambda = 18;
    } else if (crawling && move > 0.05) {
      // Отдельная анимация ползания по стенам/потолку: низкая распластанная поза.
      p.pelvisY = 0.40 + Math.abs(c) * 0.04;
      p.pelvisRotX = 1.08 + s * 0.05;
      p.pelvisRotY = s * 0.18;
      p.pelvisRotZ = c * 0.09;
      p.chestRotX = 0.24; p.chestRotY = -s * 0.24;
      p.neckRotX = -0.62; p.headRotX = -0.64 + Math.sin(ph * 2) * 0.05; p.headRotY = s * 0.14;
      p.jawRotX = 0.28 + Math.max(0, c) * 0.14; p.innerJawZ = 0.08;
      p.shoulderL = [-1.6 + s * 0.54, -0.18, 0.62]; p.elbowL = [-0.55 - Math.max(0, s) * 0.45, 0, -0.25]; p.handL = [0.22, 0, -0.15];
      p.shoulderR = [-1.6 - s * 0.54, 0.18, -0.62]; p.elbowR = [-0.55 - Math.max(0, -s) * 0.45, 0, 0.25]; p.handR = [0.22, 0, 0.15];
      p.hipL = [-1.55 - s * 0.48, 0.18, 0.55]; p.kneeL = [0.95 + Math.max(0, -s) * 0.35, 0, 0]; p.ankleL = [-0.62, 0, 0]; p.footL = [0.2, 0, 0];
      p.hipR = [-1.55 + s * 0.48, -0.18, -0.55]; p.kneeR = [0.95 + Math.max(0, s) * 0.35, 0, 0]; p.ankleR = [-0.62, 0, 0]; p.footR = [0.2, 0, 0];
      p.tail1 = [-0.88, -s * 0.25, 0]; p.tail2 = [-0.08, Math.sin(ph - 0.8) * -0.32, 0]; p.tail3 = [0.06, Math.sin(ph - 1.6) * -0.38, 0]; p.tail4 = [0.1, Math.sin(ph - 2.4) * -0.42, 0];
      lambda = 22;
    } else if (leap > 0.01) {
      // Прыжок (leap): разбег/полёт/приземление по фазе.
      const T = 1.15; const u = (this.leapTime % T) / T;
      if (u < 0.19) {
        const w = u / 0.19;
        p.pelvisY = 0.94 - w * 0.28; p.pelvisRotX = 0.22 + w * 0.25; p.chestRotX = 0.42 + w * 0.3;
        p.headRotX = -0.38; p.jawRotX = 0.15 + w * 0.25;
        p.hipL = [-0.75 * w - 0.28, 0.1, 0.12]; p.kneeL = [0.42 + 0.72 * w, 0, 0]; p.ankleL = [-0.28 - 0.48 * w, 0, 0];
        p.hipR = [-0.75 * w - 0.28, -0.1, -0.12]; p.kneeR = [0.42 + 0.72 * w, 0, 0]; p.ankleR = [-0.28 - 0.48 * w, 0, 0];
        p.shoulderL = [-0.35 * w, 0.18, 0.25]; p.shoulderR = [-0.35 * w, -0.18, -0.25];
      } else if (u < 0.76) {
        const a = (u - 0.19) / 0.57;
        p.pelvisY = 0.96; p.pelvisRotX = THREE.MathUtils.lerp(-0.28, 0.44, a);
        p.chestRotX = 0.28; p.headRotX = -0.32; p.jawRotX = 0.52; p.innerJawZ = 0.16;
        p.shoulderL = [1.35, 0.18, 0.25]; p.elbowL = [-0.35, 0, -0.05]; p.handL = [0.35, 0, 0];
        p.shoulderR = [1.35, -0.18, -0.25]; p.elbowR = [-0.35, 0, 0.05]; p.handR = [0.35, 0, 0];
        const legSweep = THREE.MathUtils.lerp(0.65, -0.75, a);
        p.hipL = [legSweep, 0.08, 0.08]; p.kneeL = [a < 0.5 ? 0.18 : 0.78, 0, 0]; p.ankleL = [a < 0.5 ? -0.1 : -0.55, 0, 0];
        p.hipR = [legSweep, -0.08, -0.08]; p.kneeR = [a < 0.5 ? 0.18 : 0.78, 0, 0]; p.ankleR = [a < 0.5 ? -0.1 : -0.55, 0, 0];
        p.tail1 = [0.1, 0, 0]; p.tail2 = [0.05, 0, 0]; p.tail3 = [-0.04, 0, 0]; p.tail4 = [-0.06, 0, 0];
      } else {
        const l = (u - 0.76) / 0.24; const squash = Math.sin(l * Math.PI);
        p.pelvisY = 0.92 - squash * 0.26; p.pelvisRotX = 0.24; p.chestRotX = 0.55 + squash * 0.15; p.jawRotX = 0.24 * (1 - l);
        p.hipL = [-0.55 - squash * 0.3, 0.08, 0.1]; p.kneeL = [0.75 + squash * 0.35, 0, 0]; p.ankleL = [-0.55, 0, 0];
        p.hipR = [-0.55 - squash * 0.3, -0.08, -0.1]; p.kneeR = [0.75 + squash * 0.35, 0, 0]; p.ankleR = [-0.55, 0, 0];
        p.shoulderL = [0.55, 0.15, 0.22]; p.elbowL = [-1.0, 0, -0.1];
        p.shoulderR = [0.55, -0.15, -0.22]; p.elbowR = [-1.0, 0, 0.1];
      }
      lambda = 26;
    } else if (attack > 0.01) {
      // Удар (strike/attack): взмах когтями + укус.
      const cyc = 0.84; const u = (this.attackTime % cyc) / cyc; const handSign = 1;
      if (u < 0.24) {
        const w = u / 0.24;
        p.pelvisY = 0.86 - w * 0.08; p.chestRotX = 0.25 - w * 0.22; p.chestRotY = handSign * w * 0.42; p.jawRotX = 0.18 + w * 0.34;
        p.shoulderR = [-0.85 * w, -0.45 * w, -0.65 * w]; p.elbowR = [-1.25, 0, 0.2]; p.shoulderL = [0.4, 0.2, 0.25];
        p.tail1 = [-0.2, -handSign * 0.35 * w, 0];
      } else if (u < 0.56) {
        const a = (u - 0.24) / 0.32; const snap = Math.sin(a * Math.PI);
        p.pelvisY = 0.88 + snap * 0.08; p.chestRotX = 0.52 + snap * 0.24; p.chestRotY = handSign * (0.42 - a * 0.95);
        p.jawRotX = 0.56; p.innerJawZ = 0.08 + snap * 0.16;
        p.shoulderR = [1.25 * snap + 0.35, 0.55 * a - 0.2, -0.25 + 0.55 * a]; p.elbowR = [-0.35 - (1 - snap) * 0.4, 0, -0.2]; p.handR = [0.5, 0, -0.3];
        p.hipL = [-0.45, 0.1, 0.1]; p.hipR = [-0.15, -0.1, -0.1]; p.tail1 = [-0.1, handSign * 0.45 * snap, 0]; p.tail2 = [0.15, handSign * 0.35 * snap, 0];
      } else {
        const r = (u - 0.56) / 0.44;
        p.pelvisY = 0.9 + r * 0.04; p.chestRotX = 0.44 - r * 0.08; p.chestRotY = -handSign * 0.4 * (1 - r);
        p.jawRotX = 0.45 * (1 - r) + 0.1; p.innerJawZ = 0.06;
        p.shoulderL = [0.35, 0.15, 0.22]; p.shoulderR = [0.35, -0.15, -0.22];
      }
      lambda = 26;
    } else if (move > 0.05 && run) {
      // Бег
      const liftL = Math.max(0, c), liftR = Math.max(0, -c);
      p.pelvisY = 0.84 + Math.abs(c) * 0.11; p.pelvisRotX = 0.34; p.pelvisRotY = s * 0.14; p.pelvisRotZ = c * 0.08;
      p.chestRotX = 0.58; p.chestRotY = -s * 0.22; p.neckRotX = -0.36; p.headRotX = -0.42; p.jawRotX = 0.26 + Math.abs(s) * 0.12; p.innerJawZ = 0.09;
      p.shoulderL = [0.45 - s * 0.85, 0.14, 0.28]; p.elbowL = [-1.05 + Math.max(0, -s) * 0.4, 0, -0.16]; p.handL = [0.55, 0, 0];
      p.shoulderR = [0.45 + s * 0.85, -0.14, -0.28]; p.elbowR = [-1.05 + Math.max(0, s) * 0.4, 0, 0.16]; p.handR = [0.55, 0, 0];
      p.hipL = [-0.36 + s * 0.88, 0.04, 0.05]; p.kneeL = [0.5 + liftL * 0.72, 0, 0]; p.ankleL = [-0.34 - liftL * 0.55 + s * 0.26, 0, 0]; p.footL = [0.14 - liftL * 0.45, 0, 0];
      p.hipR = [-0.36 - s * 0.88, -0.04, -0.05]; p.kneeR = [0.5 + liftR * 0.72, 0, 0]; p.ankleR = [-0.34 - liftR * 0.55 - s * 0.26, 0, 0]; p.footR = [0.14 - liftR * 0.45, 0, 0];
      p.tail1 = [-0.04, -s * 0.22, 0]; p.tail2 = [0.04, Math.sin(ph - 0.8) * -0.28, 0]; p.tail3 = [0.06, Math.sin(ph - 1.5) * -0.34, 0]; p.tail4 = [0.05, Math.sin(ph - 2.2) * -0.36, 0];
      lambda = 22;
    } else if (move > 0.05) {
      // Ходьба
      const liftL = Math.max(0, c), liftR = Math.max(0, -c);
      p.pelvisY = 0.9 + Math.abs(c) * 0.055; p.pelvisRotX = 0.2; p.pelvisRotY = s * 0.1; p.pelvisRotZ = c * 0.06;
      p.chestRotX = 0.44 + Math.abs(s) * 0.04; p.chestRotY = -s * 0.14; p.neckRotX = -0.28; p.headRotX = -0.28 + Math.sin(ph * 2) * 0.05; p.headRotY = s * 0.08; p.jawRotX = 0.12 + Math.abs(s) * 0.08;
      p.shoulderL = [0.35 - s * 0.45, 0.1, 0.22]; p.elbowL = [-0.95 + Math.max(0, -s) * 0.3, 0, -0.12];
      p.shoulderR = [0.35 + s * 0.45, -0.1, -0.22]; p.elbowR = [-0.95 + Math.max(0, s) * 0.3, 0, 0.12];
      p.hipL = [-0.32 + s * 0.52, 0.05, 0.05]; p.kneeL = [0.46 + liftL * 0.48, 0, 0]; p.ankleL = [-0.3 - liftL * 0.42 + s * 0.18, 0, 0]; p.footL = [0.1 - liftL * 0.3, 0, 0];
      p.hipR = [-0.32 - s * 0.52, -0.05, -0.05]; p.kneeR = [0.46 + liftR * 0.48, 0, 0]; p.ankleR = [-0.3 - liftR * 0.42 - s * 0.18, 0, 0]; p.footR = [0.1 - liftR * 0.3, 0, 0];
      p.tail1 = [-0.1, -s * 0.28, 0]; p.tail2 = [0.08, Math.sin(ph - 0.9) * -0.34, 0]; p.tail3 = [0.14, Math.sin(ph - 1.7) * -0.4, 0]; p.tail4 = [0.18, Math.sin(ph - 2.5) * -0.42, 0];
      lambda = 16;
    } else {
      // Покой (idle)
      const t = this.time; const breath = Math.sin(t * 2.1);
      p.pelvisY = 0.93 + breath * 0.018; p.chestRotX = 0.36 + breath * 0.04;
      p.headRotY = Math.sin(t * 0.9) * 0.28; p.headRotX = -0.22 + Math.sin(t * 1.6) * 0.06;
      p.jawRotX = 0.08 + Math.max(0, Math.sin(t * 1.4)) * 0.14; p.innerJawZ = 0.06;
      p.shoulderL = [0.24 + breath * 0.05, 0.14, 0.2]; p.shoulderR = [0.24 + breath * 0.05, -0.14, -0.2];
      p.tail1 = [-0.15, Math.sin(t * 1.7) * 0.24, 0]; p.tail2 = [0.1, Math.sin(t * 1.7 - 0.8) * 0.32, 0]; p.tail3 = [0.18, Math.sin(t * 1.7 - 1.6) * 0.38, 0]; p.tail4 = [0.22, Math.sin(t * 1.7 - 2.3) * 0.42, 0];
      lambda = 10;
    }

    this._apply(rig.joints, p, dt, lambda);
  }

  _apply(joints, p, dt, lambda) {
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
    dampTuple(joints.shoulderL, p.shoulderL, lambda, dt); dampTuple(joints.elbowL, p.elbowL, lambda, dt); dampTuple(joints.handL, p.handL, lambda, dt);
    dampTuple(joints.shoulderR, p.shoulderR, lambda, dt); dampTuple(joints.elbowR, p.elbowR, lambda, dt); dampTuple(joints.handR, p.handR, lambda, dt);
    dampTuple(joints.hipL, p.hipL, lambda, dt); dampTuple(joints.kneeL, p.kneeL, lambda, dt); dampTuple(joints.ankleL, p.ankleL, lambda, dt); dampTuple(joints.footL, p.footL, lambda, dt);
    dampTuple(joints.hipR, p.hipR, lambda, dt); dampTuple(joints.kneeR, p.kneeR, lambda, dt); dampTuple(joints.ankleR, p.ankleR, lambda, dt); dampTuple(joints.footR, p.footR, lambda, dt);
    dampTuple(joints.tail1, p.tail1, lambda, dt); dampTuple(joints.tail2, p.tail2, lambda, dt); dampTuple(joints.tail3, p.tail3, lambda, dt); dampTuple(joints.tail4, p.tail4, lambda, dt);
  }
}
