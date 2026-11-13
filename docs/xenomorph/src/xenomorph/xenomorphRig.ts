import * as THREE from 'three';
import type { ProceduralTextureSet } from './proceduralTextures';
import {
  activateRagdollFromPose,
  createRagdollState,
} from './ragdollPhysics';
import type { HitZone, RagdollNodeId, RagdollState, Vec3 } from './types';

export interface XenomorphJoints {
  root: THREE.Group;
  pelvis: THREE.Group;
  chest: THREE.Group;
  neck: THREE.Group;
  head: THREE.Group;
  jaw: THREE.Group;
  innerJaw: THREE.Group;
  shoulderL: THREE.Group;
  elbowL: THREE.Group;
  handL: THREE.Group;
  shoulderR: THREE.Group;
  elbowR: THREE.Group;
  handR: THREE.Group;
  hipL: THREE.Group;
  kneeL: THREE.Group;
  ankleL: THREE.Group;
  footL: THREE.Group;
  hipR: THREE.Group;
  kneeR: THREE.Group;
  ankleR: THREE.Group;
  footR: THREE.Group;
  tail1: THREE.Group;
  tail2: THREE.Group;
  tail3: THREE.Group;
  tail4: THREE.Group;
  tailTip: THREE.Group;
}

interface RagdollVisualBinding {
  visualGroup: THREE.Group;
  fkParent: THREE.Group;
  nodeA: RagdollNodeId;
  nodeB: RagdollNodeId;
  sideA: RagdollNodeId;
  sideB: RagdollNodeId;
  restBasisInv: THREE.Matrix4;
}

export interface XenomorphRig {
  group: THREE.Group;
  ragdollWorldGroup: THREE.Group;
  joints: XenomorphJoints;
  anchors: Record<RagdollNodeId, THREE.Object3D>;
  hitMeshes: THREE.Mesh[];
  chitinMaterials: THREE.MeshPhysicalMaterial[];
  ragdoll: RagdollState;
  isRagdollActive: boolean;
  enterRagdoll: (dtEstimate: number) => void;
  resetRig: () => void;
  capturePrevAnchors: () => void;
  syncRagdollVisuals: () => void;
  setHitFlash: (amount: number) => void;
  dispose: () => void;
}

// Pre-allocated scratch math objects (zero GC in loop)
const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vSideA = new THREE.Vector3();
const _vSideB = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _side = new THREE.Vector3();
const _up = new THREE.Vector3();
const _matBasis = new THREE.Matrix4();
const _matWorld = new THREE.Matrix4();

function createTeethRow(
  count: number,
  radiusX: number,
  radiusZ: number,
  toothHeight: number,
  flipDown: boolean,
  material: THREE.Material,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.Group {
  const g = new THREE.Group();
  const stdGeo = trackGeo(new THREE.ConeGeometry(0.0085, toothHeight, 5));
  const canineGeo = trackGeo(new THREE.ConeGeometry(0.0105, toothHeight * 1.42, 5));

  for (let i = 0; i < count; i++) {
    const t = i / Math.max(1, count - 1);
    const angle = (t - 0.5) * Math.PI * 0.94;
    const isCanine = Math.abs(Math.abs(t - 0.5) - 0.18) < 0.08;
    const h = isCanine ? toothHeight * 1.42 : toothHeight;
    const m = new THREE.Mesh(isCanine ? canineGeo : stdGeo, material);
    m.position.set(
      Math.sin(angle) * radiusX,
      flipDown ? -h * 0.42 : h * 0.42,
      Math.cos(angle) * radiusZ,
    );
    // Curve fangs slightly inward toward throat
    m.rotation.x = flipDown ? Math.PI - 0.18 : 0.18;
    m.rotation.z = -Math.sin(angle) * 0.16;
    g.add(m);
  }
  return g;
}

function createPredatorFinger(
  length: number,
  chitinMat: THREE.Material,
  clawMat: THREE.Material,
  trackGeo: <T extends THREE.BufferGeometry>(g: T) => T,
): THREE.Group {
  const g = new THREE.Group();
  const phalanx1Geo = trackGeo(new THREE.CapsuleGeometry(0.014, length * 0.44, 5, 8));
  const phalanx1 = new THREE.Mesh(phalanx1Geo, chitinMat);
  phalanx1.position.set(0, -length * 0.24, length * 0.06);
  phalanx1.rotation.x = -0.25;
  g.add(phalanx1);

  const phalanx2Geo = trackGeo(new THREE.CapsuleGeometry(0.011, length * 0.36, 5, 7));
  const phalanx2 = new THREE.Mesh(phalanx2Geo, chitinMat);
  phalanx2.position.set(0, -length * 0.62, length * 0.14);
  phalanx2.rotation.x = 0.36;
  g.add(phalanx2);

  // Sharp hooked talon curving inward/downward
  const clawGeo = trackGeo(new THREE.ConeGeometry(0.012, length * 0.45, 6));
  const claw = new THREE.Mesh(clawGeo, clawMat);
  claw.position.set(0, -length * 0.92, length * 0.03);
  claw.rotation.x = Math.PI + 0.58;
  g.add(claw);

  return g;
}

function createSleekDomeGeometry(): THREE.BufferGeometry {
  // Continuous glossy obsidian dome sweeping seamlessly from front brow/snout tip back into elongated cranium
  const pts: THREE.Vector2[] = [];
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 = rear dome tip, 1 = front snout tip
    const zPos = t * 0.96;
    // Smooth single-curve profile: rounded bulbous rear, broad forehead, clean rounded snout
    const s = Math.sin(t * Math.PI);
    const r = Math.pow(Math.max(0, s), 0.46) * (0.125 + 0.028 * Math.sin(t * Math.PI * 0.85));
    pts.push(new THREE.Vector2(Math.max(0.002, r), zPos));
  }

  const geo = new THREE.LatheGeometry(pts, 28);
  // Rotate so Lathe +Y (t=1 front snout) points toward +Z, and rear dome extends along -Z
  geo.rotateX(Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i); // 0 (rear) .. 0.96 (front)
    const frontT = Math.max(0, Math.min(1, z / 0.96));
    const backT = 1 - frontT;
    // Shift so front tip sits cleanly around z = +0.26 above teeth, rear dome sweeps to z = -0.70
    const shiftedZ = z - 0.70;
    // Arch crown cleanly upward and taper downward slightly at rear
    const archY = Math.sin(backT * Math.PI * 0.92) * 0.068 - Math.pow(backT, 2) * 0.035;
    const scaleY = y > 0 ? 1.15 : 0.74;
    const scaleX = 0.78 - backT * 0.06;
    pos.setXYZ(i, x * scaleX, y * scaleY + archY, shiftedZ);
  }
  geo.computeVertexNormals();
  return geo;
}

function computeRestBasisInverse(
  fkParent: THREE.Group,
  anchorA: THREE.Object3D,
  anchorB: THREE.Object3D,
  sideA: THREE.Object3D,
  sideB: THREE.Object3D,
): THREE.Matrix4 {
  fkParent.updateMatrixWorld(true);
  const pA = new THREE.Vector3();
  const pB = new THREE.Vector3();
  const sA = new THREE.Vector3();
  const sB = new THREE.Vector3();
  anchorA.getWorldPosition(pA);
  anchorB.getWorldPosition(pB);
  sideA.getWorldPosition(sA);
  sideB.getWorldPosition(sB);

  const invParent = new THREE.Matrix4().copy(fkParent.matrixWorld).invert();
  pA.applyMatrix4(invParent);
  pB.applyMatrix4(invParent);
  sA.applyMatrix4(invParent);
  sB.applyMatrix4(invParent);

  const fwd = pB.sub(pA).normalize();
  const sideRaw = sB.sub(sA);
  const up = new THREE.Vector3().crossVectors(fwd, sideRaw);
  if (up.lengthSq() < 1e-6) {
    up.set(0, 1, 0).cross(fwd);
  }
  up.normalize();
  const side = new THREE.Vector3().crossVectors(up, fwd).normalize();

  const restBasis = new THREE.Matrix4().makeBasis(side, up, fwd);
  return restBasis.invert();
}

export function createXenomorphRig(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): XenomorphRig {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'XenomorphRoot';

  const ragdollWorldGroup = new THREE.Group();
  ragdollWorldGroup.name = 'XenomorphRagdollWorld';

  // Calibrated Glossy Obsidian Chitin & Biomechanical Materials
  const chitinMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0d12,
    roughness: 0.17,
    metalness: 0.42,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    bumpMap: textures.chitinBump,
    bumpScale: 0.02,
    roughnessMap: textures.chitinRoughness,
  });

  const ribChitinMat = new THREE.MeshPhysicalMaterial({
    color: 0x151b24,
    roughness: 0.24,
    metalness: 0.48,
    clearcoat: 0.85,
    clearcoatRoughness: 0.14,
    bumpMap: textures.chitinBump,
    bumpScale: 0.028,
  });

  const sinewMat = new THREE.MeshPhysicalMaterial({
    color: 0x171a20,
    roughness: 0.6,
    metalness: 0.14,
    clearcoat: 0.24,
    bumpMap: textures.chitinBump,
    bumpScale: 0.015,
  });

  // Ultra-glossy jet-black obsidian carapace dome
  const domeMat = new THREE.MeshPhysicalMaterial({
    color: 0x05070b,
    roughness: 0.05,
    metalness: 0.22,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.55,
  });

  const fangMat = new THREE.MeshPhysicalMaterial({
    color: 0xb8c4cf,
    roughness: 0.22,
    metalness: 0.78,
    clearcoat: 0.65,
  });

  const clawTipMat = new THREE.MeshPhysicalMaterial({
    color: 0x3b4552,
    roughness: 0.2,
    metalness: 0.85,
    clearcoat: 0.55,
  });

  // Glowing neon acid-green mouth cavity & saliva
  const acidGlowMat = new THREE.MeshStandardMaterial({
    color: 0x84ff2e,
    emissive: 0x65e815,
    emissiveIntensity: 2.1,
    roughness: 0.14,
    metalness: 0.05,
  });

  const hitMeshes: THREE.Mesh[] = [];
  const disposableGeos: THREE.BufferGeometry[] = [];

  const registerHitMesh = (
    mesh: THREE.Mesh,
    hitZone: HitZone,
    ragdollNode: RagdollNodeId,
  ) => {
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    mesh.userData.hitZone = hitZone;
    mesh.userData.ragdollNode = ragdollNode;
    hitMeshes.push(mesh);
  };

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposableGeos.push(g);
    return g;
  };

  // --- Joint Hierarchy ---
  const joints: XenomorphJoints = {
    root: rootGroup,
    pelvis: new THREE.Group(),
    chest: new THREE.Group(),
    neck: new THREE.Group(),
    head: new THREE.Group(),
    jaw: new THREE.Group(),
    innerJaw: new THREE.Group(),
    shoulderL: new THREE.Group(),
    elbowL: new THREE.Group(),
    handL: new THREE.Group(),
    shoulderR: new THREE.Group(),
    elbowR: new THREE.Group(),
    handR: new THREE.Group(),
    hipL: new THREE.Group(),
    kneeL: new THREE.Group(),
    ankleL: new THREE.Group(),
    footL: new THREE.Group(),
    hipR: new THREE.Group(),
    kneeR: new THREE.Group(),
    ankleR: new THREE.Group(),
    footR: new THREE.Group(),
    tail1: new THREE.Group(),
    tail2: new THREE.Group(),
    tail3: new THREE.Group(),
    tail4: new THREE.Group(),
    tailTip: new THREE.Group(),
  };

  // Joint rest positions (digitigrade hunched predator stance facing +Z)
  joints.pelvis.position.set(0, 0.96, 0);
  joints.chest.position.set(0, 0.34, 0.14);
  joints.neck.position.set(0, 0.32, 0.18);
  joints.head.position.set(0, 0.14, 0.18);
  joints.jaw.position.set(0, -0.05, 0.06);
  joints.innerJaw.position.set(0, -0.025, 0.08);

  joints.shoulderL.position.set(0.25, 0.23, 0.06);
  joints.elbowL.position.set(0.08, -0.34, 0.04);
  joints.handL.position.set(-0.02, -0.32, 0.16);

  joints.shoulderR.position.set(-0.25, 0.23, 0.06);
  joints.elbowR.position.set(-0.08, -0.34, 0.04);
  joints.handR.position.set(0.02, -0.32, 0.16);

  joints.hipL.position.set(0.16, -0.04, 0.0);
  joints.kneeL.position.set(0.03, -0.36, 0.18);
  joints.ankleL.position.set(0, -0.31, -0.22);
  joints.footL.position.set(0, -0.22, 0.16);

  joints.hipR.position.set(-0.16, -0.04, 0.0);
  joints.kneeR.position.set(-0.03, -0.36, 0.18);
  joints.ankleR.position.set(0, -0.31, -0.22);
  joints.footR.position.set(0, -0.22, 0.16);

  joints.tail1.position.set(0, 0.0, -0.24);
  joints.tail2.position.set(0, -0.06, -0.38);
  joints.tail3.position.set(0, -0.05, -0.4);
  joints.tail4.position.set(0, 0.02, -0.38);
  joints.tailTip.position.set(0, 0.06, -0.36);

  // Assemble FK tree
  rootGroup.add(joints.pelvis);
  joints.pelvis.add(joints.chest);
  joints.chest.add(joints.neck);
  joints.neck.add(joints.head);
  joints.head.add(joints.jaw);
  joints.head.add(joints.innerJaw);

  joints.chest.add(joints.shoulderL);
  joints.shoulderL.add(joints.elbowL);
  joints.elbowL.add(joints.handL);

  joints.chest.add(joints.shoulderR);
  joints.shoulderR.add(joints.elbowR);
  joints.elbowR.add(joints.handR);

  joints.pelvis.add(joints.hipL);
  joints.hipL.add(joints.kneeL);
  joints.kneeL.add(joints.ankleL);
  joints.ankleL.add(joints.footL);

  joints.pelvis.add(joints.hipR);
  joints.hipR.add(joints.kneeR);
  joints.kneeR.add(joints.ankleR);
  joints.ankleR.add(joints.footR);

  joints.pelvis.add(joints.tail1);
  joints.tail1.add(joints.tail2);
  joints.tail2.add(joints.tail3);
  joints.tail3.add(joints.tail4);
  joints.tail4.add(joints.tailTip);

  // --- Visual Segment Groups (FK -> detached to ragdollWorldGroup on death) ---
  const pelvisVisual = new THREE.Group();
  const chestVisual = new THREE.Group();
  const neckVisual = new THREE.Group();
  const headVisual = new THREE.Group();
  const upperArmLVisual = new THREE.Group();
  const forearmLVisual = new THREE.Group();
  const upperArmRVisual = new THREE.Group();
  const forearmRVisual = new THREE.Group();
  const thighLVisual = new THREE.Group();
  const shinLVisual = new THREE.Group();
  const footLVisual = new THREE.Group();
  const thighRVisual = new THREE.Group();
  const shinRVisual = new THREE.Group();
  const footRVisual = new THREE.Group();
  const tail1Visual = new THREE.Group();
  const tail2Visual = new THREE.Group();
  const tail3Visual = new THREE.Group();
  const tail4Visual = new THREE.Group();
  const tailTipVisual = new THREE.Group();

  joints.pelvis.add(pelvisVisual);
  joints.chest.add(chestVisual);
  joints.neck.add(neckVisual);
  joints.head.add(headVisual);
  joints.shoulderL.add(upperArmLVisual);
  joints.elbowL.add(forearmLVisual);
  joints.shoulderR.add(upperArmRVisual);
  joints.elbowR.add(forearmRVisual);
  joints.hipL.add(thighLVisual);
  joints.kneeL.add(shinLVisual);
  joints.ankleL.add(footLVisual);
  joints.hipR.add(thighRVisual);
  joints.kneeR.add(shinRVisual);
  joints.ankleR.add(footRVisual);
  joints.pelvis.add(tail1Visual);
  joints.tail1.add(tail2Visual);
  joints.tail2.add(tail3Visual);
  joints.tail3.add(tail4Visual);
  joints.tail4.add(tailTipVisual);

  // --- 1. Lean Athletic Pelvis & Iliac Hip Crests ---
  const pelvisCore = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.118, 0.2, 6, 12)),
    sinewMat,
  );
  pelvisCore.position.set(0, 0.08, 0.03);
  pelvisCore.rotation.x = 0.25;
  registerHitMesh(pelvisCore, 'torso', 'pelvis');
  pelvisVisual.add(pelvisCore);

  // Sculpted iliac hip arches on both sides
  const iliacCrestGeo = trackGeo(new THREE.TorusGeometry(0.115, 0.032, 7, 14, Math.PI * 1.1));
  for (const side of [-1, 1]) {
    const crest = new THREE.Mesh(iliacCrestGeo, chitinMat);
    crest.position.set(side * 0.1, 0.04, 0.01);
    crest.rotation.y = side * Math.PI * 0.45;
    crest.rotation.x = 0.35;
    registerHitMesh(crest, 'torso', 'pelvis');
    pelvisVisual.add(crest);
  }

  // Narrow segmented waist/abdomen rings
  const abdomenRingGeo = trackGeo(new THREE.TorusGeometry(0.105, 0.024, 7, 14));
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(abdomenRingGeo, ribChitinMat);
    ring.position.set(0, 0.11 + i * 0.068, 0.04 + i * 0.03);
    ring.rotation.x = Math.PI / 2 + 0.35;
    ring.scale.set(1.04 - i * 0.02, 0.85, 1);
    registerHitMesh(ring, 'torso', 'pelvis');
    pelvisVisual.add(ring);
  }

  // --- 2. V-Tapered Ribcage, Shoulder Conduits & 4 Curved Dorsal Pipes ---
  const chestCore = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.155, 0.25, 8, 14)),
    sinewMat,
  );
  chestCore.position.set(0, 0.16, 0.06);
  chestCore.rotation.x = 0.42;
  chestCore.scale.set(1.16, 1.0, 0.88);
  registerHitMesh(chestCore, 'torso', 'chest');
  chestVisual.add(chestCore);

  // 7 Crisp Curved Rib Arches
  const ribCurveGeo = trackGeo(new THREE.TorusGeometry(0.165, 0.021, 7, 16, Math.PI * 1.42));
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const rib = new THREE.Mesh(ribCurveGeo, ribChitinMat);
    rib.position.set(0, 0.02 + i * 0.048, 0.025 + i * 0.018);
    rib.rotation.x = Math.PI / 2 + 0.42;
    rib.rotation.z = -Math.PI * 0.21;
    // V-taper: narrower near waist, broader at upper chest
    const widthScale = 0.86 + Math.sin(t * Math.PI * 0.72) * 0.34;
    rib.scale.set(widthScale, 0.92, 1);
    registerHitMesh(rib, 'torso', 'chest');
    chestVisual.add(rib);
  }

  // Sternum keel spine
  const sternum = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.036, 0.22, 6, 10)),
    chitinMat,
  );
  sternum.position.set(0, 0.17, 0.185);
  sternum.rotation.x = 0.32;
  sternum.scale.set(1.15, 1.0, 0.65);
  registerHitMesh(sternum, 'torso', 'chest');
  chestVisual.add(sternum);

  // Heavy Biomechanical Collarbone / Shoulder Conduit Arches (signature reference feature!)
  for (const side of [-1, 1]) {
    const collarCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.07, 0.34, 0.14),
      new THREE.Vector3(side * 0.2, 0.34, 0.16),
      new THREE.Vector3(side * 0.27, 0.28, 0.04),
      new THREE.Vector3(side * 0.21, 0.18, -0.14),
      new THREE.Vector3(side * 0.09, 0.02, -0.15),
    ]);
    const collarGeo = trackGeo(new THREE.TubeGeometry(collarCurve, 18, 0.035, 9, false));
    const collarMesh = new THREE.Mesh(collarGeo, chitinMat);
    registerHitMesh(collarMesh, 'torso', 'chest');
    chestVisual.add(collarMesh);

    // Secondary ribbed collar ring accent
    const collarRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.042, 0.014, 6, 12)),
      ribChitinMat,
    );
    collarRing.position.set(side * 0.21, 0.31, 0.12);
    collarRing.rotation.y = side * 0.6;
    collarRing.rotation.x = 0.5;
    chestVisual.add(collarRing);
  }

  // 4 Iconic Curved Cylindrical Dorsal Tubes (TubeGeometry + Spherical Caps)
  const dorsalPipeConfigs = [
    {
      side: -1,
      radius: 0.036,
      points: [
        new THREE.Vector3(-0.075, 0.24, -0.08),
        new THREE.Vector3(-0.13, 0.38, -0.22),
        new THREE.Vector3(-0.17, 0.55, -0.29),
        new THREE.Vector3(-0.20, 0.69, -0.35),
      ],
    },
    {
      side: 1,
      radius: 0.036,
      points: [
        new THREE.Vector3(0.075, 0.24, -0.08),
        new THREE.Vector3(0.13, 0.38, -0.22),
        new THREE.Vector3(0.17, 0.55, -0.29),
        new THREE.Vector3(0.20, 0.69, -0.35),
      ],
    },
    {
      side: -1,
      radius: 0.029,
      points: [
        new THREE.Vector3(-0.055, 0.1, -0.11),
        new THREE.Vector3(-0.11, 0.18, -0.25),
        new THREE.Vector3(-0.15, 0.32, -0.33),
        new THREE.Vector3(-0.18, 0.43, -0.37),
      ],
    },
    {
      side: 1,
      radius: 0.029,
      points: [
        new THREE.Vector3(0.055, 0.1, -0.11),
        new THREE.Vector3(0.11, 0.18, -0.25),
        new THREE.Vector3(0.15, 0.32, -0.33),
        new THREE.Vector3(0.18, 0.43, -0.37),
      ],
    },
  ];
  const pipeCapGeo = trackGeo(new THREE.SphereGeometry(1, 10, 8));
  for (const cfg of dorsalPipeConfigs) {
    const curve = new THREE.CatmullRomCurve3(cfg.points);
    const pipeGeo = trackGeo(new THREE.TubeGeometry(curve, 16, cfg.radius, 9, false));
    const pipeMesh = new THREE.Mesh(pipeGeo, chitinMat);
    registerHitMesh(pipeMesh, 'torso', 'chest');
    chestVisual.add(pipeMesh);

    const tip = cfg.points[cfg.points.length - 1];
    const cap = new THREE.Mesh(pipeCapGeo, ribChitinMat);
    cap.scale.setScalar(cfg.radius * 0.98);
    cap.position.copy(tip);
    registerHitMesh(cap, 'torso', 'chest');
    chestVisual.add(cap);
  }

  // --- 3. Ribbed Biomechanical Neck ---
  const neckMesh = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.078, 0.105, 0.26, 10)),
    sinewMat,
  );
  neckMesh.position.set(0, 0.08, 0.08);
  neckMesh.rotation.x = 0.78;
  registerHitMesh(neckMesh, 'torso', 'neck');
  neckVisual.add(neckMesh);

  const neckRingGeo = trackGeo(new THREE.TorusGeometry(0.092, 0.015, 6, 12));
  for (let i = 0; i < 4; i++) {
    const nRing = new THREE.Mesh(neckRingGeo, ribChitinMat);
    nRing.position.set(0, 0.02 + i * 0.045, 0.02 + i * 0.045);
    nRing.rotation.x = 0.85;
    nRing.scale.setScalar(1.0 - i * 0.06);
    neckVisual.add(nRing);
  }

  // --- 4. Iconic Sleek Obsidian Dome, Ribbed Temples, Acid-Green Oral Cavity & Fangs ---
  const domeGeo = trackGeo(createSleekDomeGeometry());
  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  domeMesh.position.set(0, 0.068, 0.0);
  registerHitMesh(domeMesh, 'head', 'head');
  headVisual.add(domeMesh);

  // Biomechanical ribbed side-temple ridges underneath the dome margins (matches reference!)
  const templeRibGeo = trackGeo(new THREE.TorusGeometry(0.056, 0.014, 6, 10));
  for (const side of [-1, 1]) {
    for (let r = 0; r < 9; r++) {
      const t = r / 8;
      const rib = new THREE.Mesh(templeRibGeo, ribChitinMat);
      rib.position.set(
        side * (0.066 - t * 0.014),
        0.042 + Math.sin(t * Math.PI) * 0.025,
        -0.02 - t * 0.42,
      );
      rib.rotation.y = side * 0.28;
      rib.rotation.x = 0.22;
      rib.scale.set(0.6, 1.0, 0.85);
      registerHitMesh(rib, 'head', 'head');
      headVisual.add(rib);
    }

    // Cheekbone / jaw-hinge flange & sinew tendon cords
    const cheekTendon = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.014, 0.022, 0.16, 7)),
      sinewMat,
    );
    cheekTendon.rotation.x = Math.PI / 2 + 0.22;
    cheekTendon.rotation.z = side * 0.15;
    cheekTendon.position.set(side * 0.072, -0.025, 0.12);
    headVisual.add(cheekTendon);
  }

  // Upper Maxilla Rim + Glowing Acid-Green Palate Cavity
  const upperRim = new THREE.Mesh(
    trackGeo(new THREE.TorusGeometry(0.078, 0.02, 7, 14, Math.PI * 1.1)),
    chitinMat,
  );
  upperRim.position.set(0, -0.015, 0.165);
  upperRim.rotation.x = Math.PI / 2;
  upperRim.rotation.z = -Math.PI * 0.05;
  upperRim.scale.set(0.88, 1.28, 1);
  registerHitMesh(upperRim, 'head', 'head');
  headVisual.add(upperRim);

  const upperOralGlow = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(0.056, 10, 8)),
    acidGlowMat,
  );
  upperOralGlow.scale.set(0.95, 0.45, 1.45);
  upperOralGlow.position.set(0, -0.024, 0.15);
  headVisual.add(upperOralGlow);

  // Subtle Acid-Green Mouth PointLight illuminating fangs, jaw & chest
  const mouthLight = new THREE.PointLight(0x76ff03, 1.35, 2.3, 1.6);
  mouthLight.position.set(0, -0.035, 0.28);
  headVisual.add(mouthLight);

  // Upper Needle Fangs (11 teeth)
  const upperTeeth = createTeethRow(
    11,
    0.062,
    0.095,
    0.044,
    true,
    fangMat,
    trackGeo,
  );
  upperTeeth.position.set(0, -0.028, 0.158);
  headVisual.add(upperTeeth);

  // Stretchy Acid Saliva Strands bridging upper & lower jaw corners
  const salivaStrandGeo = trackGeo(new THREE.CylinderGeometry(0.003, 0.005, 0.075, 5));
  for (const sx of [-0.052, -0.028, 0.032, 0.054]) {
    const strand = new THREE.Mesh(salivaStrandGeo, acidGlowMat);
    strand.position.set(sx, -0.058, 0.205);
    strand.rotation.x = 0.15;
    headVisual.add(strand);
  }

  // Lower Articulated Mandible + Glowing Acid Tongue + Needle Fangs
  const lowerJawMesh = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.048, 0.145, 6, 10)),
    chitinMat,
  );
  lowerJawMesh.rotation.x = Math.PI / 2;
  lowerJawMesh.scale.set(1.04, 1.0, 0.58);
  lowerJawMesh.position.set(0, -0.018, 0.115);
  registerHitMesh(lowerJawMesh, 'head', 'jawTip');
  joints.jaw.position.set(0, -0.05, 0.075);
  joints.jaw.add(lowerJawMesh);

  const lowerAcidBed = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.032, 0.1, 5, 8)),
    acidGlowMat,
  );
  lowerAcidBed.rotation.x = Math.PI / 2;
  lowerAcidBed.scale.set(1.0, 1.0, 0.35);
  lowerAcidBed.position.set(0, 0.002, 0.11);
  joints.jaw.add(lowerAcidBed);

  // Dripping acid droplet under chin tip
  const chinDrop = new THREE.Mesh(
    trackGeo(new THREE.ConeGeometry(0.007, 0.036, 5)),
    acidGlowMat,
  );
  chinDrop.rotation.x = Math.PI;
  chinDrop.position.set(0.008, -0.04, 0.195);
  joints.jaw.add(chinDrop);

  const lowerTeeth = createTeethRow(
    10,
    0.052,
    0.084,
    0.038,
    false,
    fangMat,
    trackGeo,
  );
  lowerTeeth.position.set(0, 0.004, 0.112);
  joints.jaw.add(lowerTeeth);
  headVisual.add(joints.jaw);

  // Inner Pharyngeal Jaw (extends on attack & death!)
  const innerJawStalk = new THREE.Mesh(
    trackGeo(new THREE.CylinderGeometry(0.022, 0.028, 0.22, 8)),
    sinewMat,
  );
  innerJawStalk.rotation.x = Math.PI / 2;
  innerJawStalk.position.set(0, 0, -0.05);
  joints.innerJaw.add(innerJawStalk);
  const innerJawHead = new THREE.Mesh(
    trackGeo(new THREE.CapsuleGeometry(0.028, 0.048, 5, 8)),
    fangMat,
  );
  innerJawHead.rotation.x = Math.PI / 2;
  innerJawHead.position.set(0, 0, 0.06);
  joints.innerJaw.add(innerJawHead);
  joints.innerJaw.position.set(0, -0.028, 0.11);
  headVisual.add(joints.innerJaw);

  // --- 5. Forelimbs & Large Splayed 4-Fingered Hooked Claws ---
  const buildArm = (
    side: 1 | -1,
    upperVisual: THREE.Group,
    forearmVisual: THREE.Group,
    handJoint: THREE.Group,
    nodeShoulder: RagdollNodeId,
    nodeElbow: RagdollNodeId,
    nodeHand: RagdollNodeId,
  ) => {
    const pauldron = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.092, 10, 10)),
      chitinMat,
    );
    pauldron.scale.set(1.12, 0.88, 1.18);
    registerHitMesh(pauldron, 'limb', nodeShoulder);
    upperVisual.add(pauldron);

    const upperArm = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.052, 0.26, 6, 10)),
      ribChitinMat,
    );
    upperArm.position.set(side * 0.04, -0.17, 0.02);
    upperArm.rotation.z = side * 0.22;
    registerHitMesh(upperArm, 'limb', nodeShoulder);
    upperVisual.add(upperArm);

    const forearm = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.044, 0.26, 6, 10)),
      chitinMat,
    );
    forearm.position.set(-side * 0.01, -0.16, 0.08);
    forearm.rotation.x = -0.45;
    registerHitMesh(forearm, 'limb', nodeElbow);
    forearmVisual.add(forearm);

    // Forearm elbow spur blade
    const elbowBlade = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.028, 0.2, 5)),
      chitinMat,
    );
    elbowBlade.position.set(side * 0.02, 0.04, -0.07);
    elbowBlade.rotation.x = -0.78;
    registerHitMesh(elbowBlade, 'limb', nodeElbow);
    forearmVisual.add(elbowBlade);

    // Splayed 4-fingered predatory claw hand
    handJoint.position.set(-side * 0.02, -0.32, 0.16);
    const palm = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.036, 0.055, 5, 8)),
      chitinMat,
    );
    palm.scale.set(1.25, 1.0, 0.68);
    palm.position.set(0, -0.035, 0.01);
    registerHitMesh(palm, 'limb', nodeHand);
    handJoint.add(palm);

    // 3 long splayed hooked main fingers
    const fingerOffsets = [-0.036, 0, 0.036];
    const fingerSplayZ = [-0.34, 0, 0.34];
    const fingerLengths = [0.21, 0.24, 0.20];
    for (let f = 0; f < 3; f++) {
      const finger = createPredatorFinger(
        fingerLengths[f],
        ribChitinMat,
        clawTipMat,
        trackGeo,
      );
      finger.position.set(fingerOffsets[f], -0.055, 0.025);
      finger.rotation.z = fingerSplayZ[f];
      finger.rotation.x = 0.18;
      handJoint.add(finger);
    }

    // Opposable inner thumb talon
    const thumb = createPredatorFinger(0.16, ribChitinMat, clawTipMat, trackGeo);
    thumb.position.set(-side * 0.042, -0.035, 0.045);
    thumb.rotation.z = -side * 0.72;
    thumb.rotation.x = -0.18;
    handJoint.add(thumb);

    forearmVisual.add(handJoint);
  };

  buildArm(1, upperArmLVisual, forearmLVisual, joints.handL, 'shoulderL', 'elbowL', 'handL');
  buildArm(-1, upperArmRVisual, forearmRVisual, joints.handR, 'shoulderR', 'elbowR', 'handR');

  // --- 6. Athletic Digitigrade Hind Legs ---
  const buildLeg = (
    side: 1 | -1,
    thighVisual: THREE.Group,
    shinVisual: THREE.Group,
    footVisual: THREE.Group,
    footJoint: THREE.Group,
    nodeHip: RagdollNodeId,
    nodeKnee: RagdollNodeId,
    nodeAnkle: RagdollNodeId,
    nodeFoot: RagdollNodeId,
  ) => {
    const thigh = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.084, 0.3, 7, 10)),
      ribChitinMat,
    );
    thigh.position.set(side * 0.015, -0.18, 0.09);
    thigh.rotation.x = -0.46;
    registerHitMesh(thigh, 'limb', nodeHip);
    thighVisual.add(thigh);

    // Angular armored kneecap
    const kneeArmor = new THREE.Mesh(
      trackGeo(new THREE.ConeGeometry(0.068, 0.15, 5)),
      chitinMat,
    );
    kneeArmor.position.set(0, 0.025, 0.045);
    kneeArmor.rotation.x = Math.PI * 0.42;
    registerHitMesh(kneeArmor, 'limb', nodeKnee);
    shinVisual.add(kneeArmor);

    const shin = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.056, 0.28, 6, 10)),
      chitinMat,
    );
    shin.position.set(0, -0.155, -0.11);
    shin.rotation.x = 0.62;
    registerHitMesh(shin, 'limb', nodeKnee);
    shinVisual.add(shin);

    const meta = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.04, 0.2, 6, 8)),
      sinewMat,
    );
    meta.position.set(0, -0.11, 0.08);
    meta.rotation.x = -0.62;
    registerHitMesh(meta, 'limb', nodeAnkle);
    footVisual.add(meta);

    footJoint.position.set(0, -0.22, 0.16);
    const footPad = new THREE.Mesh(
      trackGeo(new THREE.CapsuleGeometry(0.046, 0.08, 5, 8)),
      chitinMat,
    );
    footPad.rotation.x = Math.PI / 2;
    footPad.scale.set(1.28, 1.0, 0.5);
    footPad.position.set(0, 0.024, 0.04);
    registerHitMesh(footPad, 'limb', nodeFoot);
    footJoint.add(footPad);

    for (let t = -1; t <= 1; t++) {
      const toe = new THREE.Mesh(
        trackGeo(new THREE.ConeGeometry(0.022, 0.16, 5)),
        clawTipMat,
      );
      toe.position.set(t * 0.042, 0.02, 0.15);
      toe.rotation.x = Math.PI / 2 + 0.08;
      toe.rotation.z = -t * 0.22;
      registerHitMesh(toe, 'limb', nodeFoot);
      footJoint.add(toe);
    }
    footVisual.add(footJoint);
  };

  buildLeg(1, thighLVisual, shinLVisual, footLVisual, joints.footL, 'hipL', 'kneeL', 'ankleL', 'footL');
  buildLeg(-1, thighRVisual, shinRVisual, footRVisual, joints.footR, 'hipR', 'kneeR', 'ankleR', 'footR');

  // --- 7. Heavily Segmented Vertebral Whip Tail (20+ Chitin Vertebral Rings + Serrated Stinger) ---
  const vertebraRingGeo = trackGeo(new THREE.TorusGeometry(1, 0.34, 6, 12));
  const vertebraSpineGeo = trackGeo(new THREE.ConeGeometry(0.45, 1.4, 4));

  const buildSegmentedTailPart = (
    visual: THREE.Group,
    rStart: number,
    rEnd: number,
    length: number,
    offsetZ: number,
    offsetY: number,
    ringCount: number,
    nodeId: RagdollNodeId,
  ) => {
    const core = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(rEnd * 0.72, rStart * 0.72, length, 8)),
      sinewMat,
    );
    core.rotation.x = Math.PI / 2;
    core.position.set(0, offsetY * 0.5, offsetZ * 0.5);
    registerHitMesh(core, 'tail', nodeId);
    visual.add(core);

    for (let i = 0; i < ringCount; i++) {
      const frac = (i + 0.5) / ringCount;
      const r = THREE.MathUtils.lerp(rStart, rEnd, frac);
      const px = 0;
      const py = offsetY * frac;
      const pz = offsetZ * frac;

      const ring = new THREE.Mesh(vertebraRingGeo, chitinMat);
      ring.position.set(px, py, pz);
      ring.scale.set(r * 0.88, r * 1.1, r * 1.15);
      registerHitMesh(ring, 'tail', nodeId);
      visual.add(ring);

      const spine = new THREE.Mesh(vertebraSpineGeo, ribChitinMat);
      spine.position.set(px, py + r * 1.15, pz);
      spine.scale.setScalar(r * 0.9);
      spine.rotation.x = -0.35;
      registerHitMesh(spine, 'tail', nodeId);
      visual.add(spine);
    }
  };

  buildSegmentedTailPart(tail1Visual, 0.088, 0.072, 0.28, -0.24, 0, 4, 'tail1');
  buildSegmentedTailPart(tail2Visual, 0.072, 0.056, 0.39, -0.38, -0.06, 5, 'tail2');
  buildSegmentedTailPart(tail3Visual, 0.056, 0.044, 0.41, -0.4, -0.05, 5, 'tail3');
  buildSegmentedTailPart(tail4Visual, 0.044, 0.032, 0.39, -0.38, 0.02, 5, 'tail4');

  // Segmented stinger shaft + razor curved blade
  buildSegmentedTailPart(tailTipVisual, 0.032, 0.02, 0.32, -0.32, 0.04, 4, 'tailTip');

  const stingerShape = new THREE.Shape();
  stingerShape.moveTo(0, 0);
  stingerShape.lineTo(0.3, 0.02);
  stingerShape.lineTo(0.06, 0.095);
  stingerShape.lineTo(-0.04, 0.03);
  stingerShape.closePath();
  const stingerGeo = trackGeo(
    new THREE.ExtrudeGeometry(stingerShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelThickness: 0.007,
      bevelSize: 0.007,
      bevelSegments: 2,
    }),
  );
  stingerGeo.translate(0, -0.02, -0.007);
  stingerGeo.rotateY(Math.PI / 2);
  const stingerBlade = new THREE.Mesh(stingerGeo, clawTipMat);
  stingerBlade.position.set(0, 0.05, -0.33);
  stingerBlade.rotation.x = 0.1;
  registerHitMesh(stingerBlade, 'tail', 'tailTip');
  tailTipVisual.add(stingerBlade);

  // --- Attach Exact Anatomical Anchor Nodes for FK -> Ragdoll Handoff ---
  const anchors = {} as Record<RagdollNodeId, THREE.Object3D>;
  const addAnchor = (id: RagdollNodeId, parent: THREE.Object3D, x = 0, y = 0, z = 0) => {
    const obj = new THREE.Object3D();
    obj.position.set(x, y, z);
    parent.add(obj);
    anchors[id] = obj;
  };

  addAnchor('pelvis', joints.pelvis);
  addAnchor('chest', joints.chest);
  addAnchor('neck', joints.neck);
  addAnchor('head', joints.head);
  addAnchor('jawTip', joints.head, 0, -0.04, 0.28);

  addAnchor('shoulderL', joints.shoulderL);
  addAnchor('elbowL', joints.elbowL);
  addAnchor('handL', joints.handL);

  addAnchor('shoulderR', joints.shoulderR);
  addAnchor('elbowR', joints.elbowR);
  addAnchor('handR', joints.handR);

  addAnchor('hipL', joints.hipL);
  addAnchor('kneeL', joints.kneeL);
  addAnchor('ankleL', joints.ankleL);
  addAnchor('footL', joints.footL);

  addAnchor('hipR', joints.hipR);
  addAnchor('kneeR', joints.kneeR);
  addAnchor('ankleR', joints.ankleR);
  addAnchor('footR', joints.footR);

  addAnchor('tail1', joints.tail1);
  addAnchor('tail2', joints.tail2);
  addAnchor('tail3', joints.tail3);
  addAnchor('tail4', joints.tail4);
  addAnchor('tailTip', joints.tailTip, 0, 0.05, -0.36);

  // Precompute rest basis inverse for every ragdoll-synced visual group
  const bindings: RagdollVisualBinding[] = [
    {
      visualGroup: pelvisVisual,
      fkParent: joints.pelvis,
      nodeA: 'pelvis',
      nodeB: 'chest',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.pelvis, anchors.pelvis, anchors.chest, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: chestVisual,
      fkParent: joints.chest,
      nodeA: 'chest',
      nodeB: 'neck',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.chest, anchors.chest, anchors.neck, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: neckVisual,
      fkParent: joints.neck,
      nodeA: 'neck',
      nodeB: 'head',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.neck, anchors.neck, anchors.head, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: headVisual,
      fkParent: joints.head,
      nodeA: 'head',
      nodeB: 'jawTip',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.head, anchors.head, anchors.jawTip, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: upperArmLVisual,
      fkParent: joints.shoulderL,
      nodeA: 'shoulderL',
      nodeB: 'elbowL',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.shoulderL, anchors.shoulderL, anchors.elbowL, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: forearmLVisual,
      fkParent: joints.elbowL,
      nodeA: 'elbowL',
      nodeB: 'handL',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.elbowL, anchors.elbowL, anchors.handL, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: upperArmRVisual,
      fkParent: joints.shoulderR,
      nodeA: 'shoulderR',
      nodeB: 'elbowR',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.shoulderR, anchors.shoulderR, anchors.elbowR, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: forearmRVisual,
      fkParent: joints.elbowR,
      nodeA: 'elbowR',
      nodeB: 'handR',
      sideA: 'shoulderR',
      sideB: 'shoulderL',
      restBasisInv: computeRestBasisInverse(joints.elbowR, anchors.elbowR, anchors.handR, anchors.shoulderR, anchors.shoulderL),
    },
    {
      visualGroup: thighLVisual,
      fkParent: joints.hipL,
      nodeA: 'hipL',
      nodeB: 'kneeL',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.hipL, anchors.hipL, anchors.kneeL, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: shinLVisual,
      fkParent: joints.kneeL,
      nodeA: 'kneeL',
      nodeB: 'ankleL',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.kneeL, anchors.kneeL, anchors.ankleL, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: footLVisual,
      fkParent: joints.ankleL,
      nodeA: 'ankleL',
      nodeB: 'footL',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.ankleL, anchors.ankleL, anchors.footL, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: thighRVisual,
      fkParent: joints.hipR,
      nodeA: 'hipR',
      nodeB: 'kneeR',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.hipR, anchors.hipR, anchors.kneeR, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: shinRVisual,
      fkParent: joints.kneeR,
      nodeA: 'kneeR',
      nodeB: 'ankleR',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.kneeR, anchors.kneeR, anchors.ankleR, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: footRVisual,
      fkParent: joints.ankleR,
      nodeA: 'ankleR',
      nodeB: 'footR',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.ankleR, anchors.ankleR, anchors.footR, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: tail1Visual,
      fkParent: joints.pelvis,
      nodeA: 'pelvis',
      nodeB: 'tail1',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.pelvis, anchors.pelvis, anchors.tail1, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: tail2Visual,
      fkParent: joints.tail1,
      nodeA: 'tail1',
      nodeB: 'tail2',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.tail1, anchors.tail1, anchors.tail2, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: tail3Visual,
      fkParent: joints.tail2,
      nodeA: 'tail2',
      nodeB: 'tail3',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.tail2, anchors.tail2, anchors.tail3, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: tail4Visual,
      fkParent: joints.tail3,
      nodeA: 'tail3',
      nodeB: 'tail4',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.tail3, anchors.tail3, anchors.tail4, anchors.hipR, anchors.hipL),
    },
    {
      visualGroup: tailTipVisual,
      fkParent: joints.tail4,
      nodeA: 'tail4',
      nodeB: 'tailTip',
      sideA: 'hipR',
      sideB: 'hipL',
      restBasisInv: computeRestBasisInverse(joints.tail4, anchors.tail4, anchors.tailTip, anchors.hipR, anchors.hipL),
    },
  ];

  const ragdoll = createRagdollState();
  const prevAnchorPos: Record<RagdollNodeId, Vec3> = {} as Record<RagdollNodeId, Vec3>;
  let hasPrevSnapshot = false;
  let lastSnapshotDt = 1 / 60;

  const capturePrevAnchors = () => {
    rootGroup.updateMatrixWorld(true);
    for (const id of ragdoll.nodeOrder) {
      anchors[id].getWorldPosition(_vA);
      if (!prevAnchorPos[id]) {
        prevAnchorPos[id] = { x: _vA.x, y: _vA.y, z: _vA.z };
      } else {
        prevAnchorPos[id].x = _vA.x;
        prevAnchorPos[id].y = _vA.y;
        prevAnchorPos[id].z = _vA.z;
      }
    }
    hasPrevSnapshot = true;
  };

  capturePrevAnchors();

  const rig: XenomorphRig = {
    group: rootGroup,
    ragdollWorldGroup,
    joints,
    anchors,
    hitMeshes,
    chitinMaterials: [chitinMat, ribChitinMat, sinewMat],
    ragdoll,
    isRagdollActive: false,

    capturePrevAnchors: () => {
      capturePrevAnchors();
    },

    enterRagdoll: (dtEstimate: number) => {
      if (rig.isRagdollActive) return;
      lastSnapshotDt = Math.max(1 / 120, Math.min(dtEstimate, 0.05));
      rootGroup.updateMatrixWorld(true);

      const worldPos = {} as Record<RagdollNodeId, Vec3>;
      const worldVel = {} as Partial<Record<RagdollNodeId, Vec3>>;

      for (const id of ragdoll.nodeOrder) {
        anchors[id].getWorldPosition(_vA);
        worldPos[id] = { x: _vA.x, y: _vA.y, z: _vA.z };
        if (hasPrevSnapshot && prevAnchorPos[id]) {
          worldVel[id] = {
            x: (_vA.x - prevAnchorPos[id].x) / lastSnapshotDt,
            y: (_vA.y - prevAnchorPos[id].y) / lastSnapshotDt,
            z: (_vA.z - prevAnchorPos[id].z) / lastSnapshotDt,
          };
        }
      }

      activateRagdollFromPose(ragdoll, worldPos, worldVel, lastSnapshotDt);

      for (const b of bindings) {
        ragdollWorldGroup.add(b.visualGroup);
      }
      joints.jaw.rotation.x = 0.45;
      joints.innerJaw.position.z = 0.16;

      rig.isRagdollActive = true;
      rig.syncRagdollVisuals();
    },

    syncRagdollVisuals: () => {
      if (!rig.isRagdollActive) return;
      for (const b of bindings) {
        const pA = ragdoll.nodes[b.nodeA].pos;
        const pB = ragdoll.nodes[b.nodeB].pos;
        const sA = ragdoll.nodes[b.sideA].pos;
        const sB = ragdoll.nodes[b.sideB].pos;

        _vA.set(pA.x, pA.y, pA.z);
        _vB.set(pB.x, pB.y, pB.z);
        _vSideA.set(sA.x, sA.y, sA.z);
        _vSideB.set(sB.x, sB.y, sB.z);

        _fwd.subVectors(_vB, _vA);
        if (_fwd.lengthSq() < 1e-8) continue;
        _fwd.normalize();

        _side.subVectors(_vSideB, _vSideA);
        _up.crossVectors(_fwd, _side);
        if (_up.lengthSq() < 1e-6) {
          _up.set(0, 1, 0).cross(_fwd);
          if (_up.lengthSq() < 1e-6) _up.set(1, 0, 0);
        }
        _up.normalize();
        _side.crossVectors(_up, _fwd).normalize();

        _matBasis.makeBasis(_side, _up, _fwd);
        _matWorld.multiplyMatrices(_matBasis, b.restBasisInv);

        b.visualGroup.position.copy(_vA);
        b.visualGroup.quaternion.setFromRotationMatrix(_matWorld);
      }
    },

    resetRig: () => {
      rig.isRagdollActive = false;
      ragdoll.active = false;
      for (const b of bindings) {
        b.fkParent.add(b.visualGroup);
        b.visualGroup.position.set(0, 0, 0);
        b.visualGroup.quaternion.identity();
      }
      joints.pelvis.position.set(0, 0.96, 0);
      joints.pelvis.rotation.set(0, 0, 0);
      joints.chest.rotation.set(0, 0, 0);
      joints.neck.rotation.set(0, 0, 0);
      joints.head.rotation.set(0, 0, 0);
      joints.jaw.rotation.set(0, 0, 0);
      joints.innerJaw.position.set(0, -0.028, 0.11);
      joints.shoulderL.rotation.set(0, 0, 0);
      joints.elbowL.rotation.set(0, 0, 0);
      joints.handL.rotation.set(0, 0, 0);
      joints.shoulderR.rotation.set(0, 0, 0);
      joints.elbowR.rotation.set(0, 0, 0);
      joints.handR.rotation.set(0, 0, 0);
      joints.hipL.rotation.set(0, 0, 0);
      joints.kneeL.rotation.set(0, 0, 0);
      joints.ankleL.rotation.set(0, 0, 0);
      joints.footL.rotation.set(0, 0, 0);
      joints.hipR.rotation.set(0, 0, 0);
      joints.kneeR.rotation.set(0, 0, 0);
      joints.ankleR.rotation.set(0, 0, 0);
      joints.footR.rotation.set(0, 0, 0);
      joints.tail1.rotation.set(0, 0, 0);
      joints.tail2.rotation.set(0, 0, 0);
      joints.tail3.rotation.set(0, 0, 0);
      joints.tail4.rotation.set(0, 0, 0);
      joints.tailTip.rotation.set(0, 0, 0);
      capturePrevAnchors();
    },

    setHitFlash: (amount: number) => {
      const clamped = Math.max(0, Math.min(1, amount));
      for (const m of rig.chitinMaterials) {
        m.emissive.setRGB(0.28 * clamped, 0.85 * clamped, 0.22 * clamped);
        m.emissiveIntensity = clamped * 1.4;
      }
    },

    dispose: () => {
      for (const g of disposableGeos) g.dispose();
      chitinMat.dispose();
      ribChitinMat.dispose();
      sinewMat.dispose();
      domeMat.dispose();
      fangMat.dispose();
      clawTipMat.dispose();
      acidGlowMat.dispose();
    },
  };

  return rig;
}
