import * as THREE from 'three';

/**
 * Данные и процедурная модель солдата-врага, портированная из docs/enemy1
 * (enemyConfig/soldierBuilder/proceduralTextures/позы). Визуал без влияния на
 * физику/коллизии игры: попадания и стрельба по-прежнему считают сферу Enemy.
 */

export const BONE_ORDER = [
  'pelvis', 'torso', 'head',
  'upperArmL', 'forearmL', 'upperArmR', 'forearmR',
  'thighL', 'shinL', 'thighR', 'shinR',
];

export const SOLDIER_VARIANTS = {
  assault: {
    id: 'assault',
    armorPrimary: 0x262b33, armorSecondary: 0x3b424d, fabricColor: 0x1a1e24,
    metalAccent: 0x5c6675, visorColor: 0xff3b2f, visorEmissive: 0xff2a1f,
  },
  recon: {
    id: 'recon',
    armorPrimary: 0x73634f, armorSecondary: 0x4f4437, fabricColor: 0x3a332b,
    metalAccent: 0x787168, visorColor: 0xffaa2b, visorEmissive: 0xff9500,
  },
  heavy: {
    id: 'heavy',
    armorPrimary: 0x394538, armorSecondary: 0x252d24, fabricColor: 0x1e241e,
    metalAccent: 0x677368, visorColor: 0x38bdf8, visorEmissive: 0x0ea5e9,
  },
};

export const BONE_SPECS = {
  pelvis:   { parent: null,       pivotOffset: [0, 0.94, 0],     comOffset: [0, 0, 0],       halfExtents: [0.14, 0.09, 0.10] },
  torso:    { parent: 'pelvis',   pivotOffset: [0, 0.09, 0],     comOffset: [0, 0.23, 0],    halfExtents: [0.17, 0.22, 0.12] },
  head:     { parent: 'torso',    pivotOffset: [0, 0.46, 0],     comOffset: [0, 0.14, 0],    halfExtents: [0.105, 0.13, 0.115] },
  upperArmL:{ parent: 'torso',    pivotOffset: [0.225, 0.41, 0], comOffset: [0, -0.145, 0],  halfExtents: [0.06, 0.145, 0.06] },
  forearmL: { parent: 'upperArmL',pivotOffset: [0, -0.29, 0],    comOffset: [0, -0.14, 0],   halfExtents: [0.05, 0.14, 0.05] },
  upperArmR:{ parent: 'torso',    pivotOffset: [-0.225, 0.41, 0],comOffset: [0, -0.145, 0],  halfExtents: [0.06, 0.145, 0.06] },
  forearmR: { parent: 'upperArmR',pivotOffset: [0, -0.29, 0],    comOffset: [0, -0.14, 0],   halfExtents: [0.05, 0.14, 0.05] },
  thighL:   { parent: 'pelvis',   pivotOffset: [0.105, -0.03, 0],comOffset: [0, -0.21, 0],   halfExtents: [0.075, 0.21, 0.075] },
  shinL:    { parent: 'thighL',   pivotOffset: [0, -0.42, 0],    comOffset: [0, -0.24, 0.02],halfExtents: [0.065, 0.24, 0.08] },
  thighR:   { parent: 'pelvis',   pivotOffset: [-0.105, -0.03, 0],comOffset:[0, -0.21, 0],   halfExtents: [0.075, 0.21, 0.075] },
  shinR:    { parent: 'thighR',   pivotOffset: [0, -0.42, 0],    comOffset: [0, -0.24, 0.02],halfExtents: [0.065, 0.24, 0.08] },
};

/** Поза (локальные повороты костей) для idle/run. */
export function computeCharacterPose(phase, walkSpeed, mode) {
  const isMoving = mode !== 'idle' && walkSpeed > 0.05;

  if (!isMoving) {
    const breath = Math.sin(phase * 1.6);
    const subtleShift = Math.sin(phase * 0.8);
    return {
      pelvisOffsetY: -0.025 + breath * 0.005,
      pelvisOffsetX: subtleShift * 0.008,
      bones: {
        pelvis:    { rot: [0.04, -0.18, 0] },
        torso:     { rot: [0.07 + breath * 0.015, 0.18, 0] },
        head:      { rot: [-0.04 - breath * 0.01, 0.02 + subtleShift * 0.05, 0] },
        upperArmR: { rot: [-0.42, -0.14, -0.16] },
        forearmR:  { rot: [-1.18, 0.08, 0.14] },
        upperArmL: { rot: [-0.62, 0.48, 0.12] },
        forearmL:  { rot: [-1.05, -0.18, -0.22] },
        thighL:    { rot: [-0.16, 0.08, 0.04] },
        shinL:     { rot: [0.22, 0, 0] },
        thighR:    { rot: [0.12, -0.08, -0.04] },
        shinR:     { rot: [0.16, 0, 0] },
      },
    };
  }

  // Бег вместо ходьбы: больший вынос/подъём ног и выраженный мах рук,
  // чтобы не было «скольжения на лыжах» при перемещении.
  const speedNorm = Math.min(Math.max(walkSpeed, 0.4), 2.4);
  const run = Math.min(1, (speedNorm - 0.2) / 1.4);
  const strideAmp = 0.62 + 0.22 * run; // амплитуда бедра
  const leftSwing = Math.sin(phase);
  const rightSwing = Math.sin(phase + Math.PI);
  const liftL = Math.max(0, -Math.cos(phase));
  const liftR = Math.max(0, Math.cos(phase));
  const kneeL = 0.18 + liftL * (0.95 + 0.25 * run) + Math.max(0, -Math.sin(phase)) * 0.18;
  const kneeR = 0.18 + liftR * (0.95 + 0.25 * run) + Math.max(0, Math.sin(phase)) * 0.18;
  const bobY = -0.05 + Math.abs(Math.sin(phase)) * (0.055 + 0.02 * run);
  const swayX = Math.sin(phase) * 0.03;
  const pelvisYaw = Math.sin(phase) * 0.12;
  const pelvisRoll = Math.cos(phase) * 0.055;
  const torsoYaw = -Math.sin(phase) * 0.14;
  const torsoLean = 0.16 + 0.08 * run;
  const armSwing = Math.sin(phase) * (0.22 + 0.12 * run);
  const armBounce = Math.cos(phase * 2) * 0.04;

  return {
    pelvisOffsetY: bobY,
    pelvisOffsetX: swayX,
    bones: {
      pelvis:    { rot: [0.05, pelvisYaw, pelvisRoll] },
      torso:     { rot: [torsoLean, torsoYaw, -pelvisRoll * 0.6] },
      head:      { rot: [-torsoLean * 0.55, -torsoYaw * 0.45, 0] },
      // Правая рука держит оружие — мах умеренный, левая работает свободнее.
      upperArmR: { rot: [-0.34 + armBounce + armSwing * 0.25, -0.12, -0.14] },
      forearmR:  { rot: [-1.08 - armBounce * 0.4, 0.08, 0.12] },
      upperArmL: { rot: [-0.45 + armBounce - armSwing * 0.75, 0.38, 0.10] },
      forearmL:  { rot: [-0.95 - armBounce * 0.5 - Math.max(0, armSwing) * 0.15, -0.14, -0.18] },
      thighL:    { rot: [-leftSwing * strideAmp - 0.04, 0.03, 0.03] },
      shinL:     { rot: [kneeL, 0, 0] },
      thighR:    { rot: [-rightSwing * strideAmp - 0.04, -0.03, -0.03] },
      shinR:     { rot: [kneeR, 0, 0] },
    },
  };
}

// --- процедурные текстуры (общие на всех солдат) ---
let _tex = null;
function getTextures() {
  if (_tex) return _tex;
  // bump брони/ткани (linear)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 128; bumpCanvas.height = 128;
  const bctx = bumpCanvas.getContext('2d');
  bctx.fillStyle = '#808080'; bctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      const alt = ((x + y) / 4) % 2 === 0;
      bctx.fillStyle = alt ? '#9c9c9c' : '#686868';
      bctx.fillRect(x, y, 3, 3);
    }
  }
  const armorBump = new THREE.CanvasTexture(bumpCanvas);
  armorBump.wrapS = armorBump.wrapT = THREE.RepeatWrapping;
  armorBump.repeat.set(6, 6);

  // мягкая контактная тень
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128; shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.85)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad; sctx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  _tex = { armorBump, contactShadow };
  return _tex;
}

function makeRoundedPlateGeo(width, height, depth, bevel = 0.015) {
  const hw = width / 2, hh = height / 2;
  const chamfer = Math.min(hw, hh) * 0.28;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + chamfer, -hh);
  shape.lineTo(hw - chamfer, -hh);
  shape.lineTo(hw, -hh + chamfer);
  shape.lineTo(hw, hh - chamfer);
  shape.lineTo(hw - chamfer, hh);
  shape.lineTo(-hw + chamfer, hh);
  shape.lineTo(-hw, hh - chamfer);
  shape.lineTo(-hw, -hh + chamfer);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel,
    bevelSegments: 2, curveSegments: 4,
  });
  geo.center();
  return geo;
}

/**
 * Строит модель винтовки солдата (визуал) — та же, что у врага; используется
 * и как оружие от первого лица у игрока-человека (видно только оружие).
 * @returns {{group: THREE.Group, dispose: Function}}
 */
export function buildRifleModel() {
  const geos = [];
  const t = (g) => { geos.push(g); return g; };
  const armorSecondary = new THREE.MeshStandardMaterial({ color: 0x3b424d, roughness: 0.56, metalness: 0.16 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x5c6675, roughness: 0.24, metalness: 0.85 });
  const bootRubber = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.92, metalness: 0.05 });
  const riflePolymer = new THREE.MeshStandardMaterial({ color: 0x1d2026, roughness: 0.65, metalness: 0.12 });
  const opticGlass = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.4 });
  const mats = [armorSecondary, metal, bootRubber, riflePolymer, opticGlass];
  const group = new THREE.Group();
  const addPart = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos); mesh.rotation.set(...rot);
    mesh.castShadow = false; mesh.receiveShadow = false;
    parent.add(mesh);
    return mesh;
  };
  addPart(group, t(makeRoundedPlateGeo(0.048, 0.085, 0.26, 0.006)), riflePolymer, [0, 0, 0]);
  addPart(group, t(new THREE.BoxGeometry(0.042, 0.052, 0.22)), metal, [0, 0.015, 0.22]);
  addPart(group, t(new THREE.CylinderGeometry(0.011, 0.013, 0.24, 10)), metal, [0, 0.015, 0.38], [Math.PI / 2, 0, 0]);
  addPart(group, t(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 12)), riflePolymer, [0, 0.015, 0.49], [Math.PI / 2, 0, 0]);
  addPart(group, t(new THREE.BoxGeometry(0.032, 0.14, 0.058)), armorSecondary, [0, -0.095, 0.06], [0.22, 0, 0]);
  addPart(group, t(new THREE.BoxGeometry(0.034, 0.10, 0.042)), bootRubber, [0, -0.075, -0.08], [-0.32, 0, 0]);
  addPart(group, t(new THREE.BoxGeometry(0.036, 0.095, 0.18)), riflePolymer, [0, -0.005, -0.21]);
  addPart(group, t(new THREE.BoxGeometry(0.036, 0.042, 0.07)), metal, [0, 0.062, 0.02]);
  addPart(group, t(new THREE.BoxGeometry(0.028, 0.026, 0.012)), opticGlass, [0, 0.066, 0.045]);
  return {
    group,
    dispose() {
      for (const g of geos) g.dispose();
      for (const m of mats) m.dispose();
    },
  };
}

/** Создаёт визуальный риг солдата (кости/меши/материалы). */
export function buildEnemySoldier(variantId = 'assault') {
  const variant = SOLDIER_VARIANTS[variantId] || SOLDIER_VARIANTS.assault;
  const { armorBump, contactShadow: contactShadowTex } = getTextures();
  const geos = [];
  const track = (g) => { geos.push(g); return g; };

  const armorPrimary = new THREE.MeshStandardMaterial({ color: variant.armorPrimary, roughness: 0.42, metalness: 0.28, bumpMap: armorBump, bumpScale: 0.004 });
  const armorSecondary = new THREE.MeshStandardMaterial({ color: variant.armorSecondary, roughness: 0.56, metalness: 0.16, bumpMap: armorBump, bumpScale: 0.005 });
  const fabric = new THREE.MeshStandardMaterial({ color: variant.fabricColor, roughness: 0.88, metalness: 0.03, bumpMap: armorBump, bumpScale: 0.008 });
  const metal = new THREE.MeshStandardMaterial({ color: variant.metalAccent, roughness: 0.24, metalness: 0.85 });
  const visor = new THREE.MeshStandardMaterial({ color: variant.visorColor, emissive: variant.visorEmissive, emissiveIntensity: 1.5, roughness: 0.12, metalness: 0.3 });
  const bootRubber = new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.92, metalness: 0.05 });
  const riflePolymer = new THREE.MeshStandardMaterial({ color: 0x1d2026, roughness: 0.65, metalness: 0.12 });
  const opticGlass = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0.4 });

  const root = new THREE.Group();
  root.name = 'EnemySoldierRoot';
  const bones = {};
  for (const boneId of BONE_ORDER) {
    const spec = BONE_SPECS[boneId];
    const g = new THREE.Group();
    g.name = `Bone_${boneId}`;
    g.position.set(...spec.pivotOffset);
    if (spec.parent) bones[spec.parent].add(g); else root.add(g);
    bones[boneId] = g;
  }

  const addPart = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos); mesh.rotation.set(...rot);
    mesh.castShadow = false; mesh.receiveShadow = false; // тени карты заморожены
    parent.add(mesh);
    return mesh;
  };

  // pelvis
  const pelvisG = bones.pelvis;
  addPart(pelvisG, track(makeRoundedPlateGeo(0.27, 0.14, 0.16, 0.015)), fabric, [0, 0, 0]);
  addPart(pelvisG, track(makeRoundedPlateGeo(0.295, 0.055, 0.19, 0.008)), armorSecondary, [0, 0.03, 0]);
  addPart(pelvisG, track(new THREE.BoxGeometry(0.08, 0.05, 0.03)), metal, [0, 0.03, 0.105]);
  addPart(pelvisG, track(makeRoundedPlateGeo(0.14, 0.12, 0.025, 0.008)), armorPrimary, [0, -0.05, 0.095], [0.1, 0, 0]);
  addPart(pelvisG, track(new THREE.BoxGeometry(0.055, 0.10, 0.10)), armorSecondary, [0.16, 0.01, 0.02]);
  addPart(pelvisG, track(new THREE.BoxGeometry(0.055, 0.10, 0.10)), armorSecondary, [-0.16, 0.01, 0.02]);

  // torso
  const torsoG = bones.torso;
  addPart(torsoG, track(makeRoundedPlateGeo(0.29, 0.42, 0.17, 0.02)), fabric, [0, 0.22, 0]);
  addPart(torsoG, track(makeRoundedPlateGeo(0.27, 0.28, 0.055, 0.016)), armorPrimary, [0, 0.25, 0.095]);
  addPart(torsoG, track(makeRoundedPlateGeo(0.26, 0.27, 0.05, 0.014)), armorPrimary, [0, 0.25, -0.095]);
  for (let i = -1; i <= 1; i++) addPart(torsoG, track(new THREE.BoxGeometry(0.068, 0.11, 0.042)), armorSecondary, [i * 0.078, 0.18, 0.135]);
  addPart(torsoG, track(new THREE.BoxGeometry(0.06, 0.09, 0.22)), armorSecondary, [0.105, 0.41, 0]);
  addPart(torsoG, track(new THREE.BoxGeometry(0.06, 0.09, 0.22)), armorSecondary, [-0.105, 0.41, 0]);
  addPart(torsoG, track(new THREE.CylinderGeometry(0.085, 0.10, 0.06, 12)), armorSecondary, [0, 0.43, 0]);
  addPart(torsoG, track(makeRoundedPlateGeo(0.18, 0.22, 0.08, 0.012)), armorSecondary, [0, 0.26, -0.155]);
  addPart(torsoG, track(new THREE.CylinderGeometry(0.006, 0.008, 0.24, 8)), metal, [0.065, 0.45, -0.17]);
  addPart(torsoG, track(new THREE.BoxGeometry(0.04, 0.016, 0.012)), visor, [0, 0.34, -0.20]);

  // head
  const headG = bones.head;
  addPart(headG, track(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 12)), fabric, [0, 0.03, 0]);
  addPart(headG, track(new THREE.SphereGeometry(0.095, 16, 14)), fabric, [0, 0.15, 0.005]);
  const helmetPoints = [
    new THREE.Vector2(0.001, 0.105), new THREE.Vector2(0.072, 0.10), new THREE.Vector2(0.112, 0.068),
    new THREE.Vector2(0.12, 0.018), new THREE.Vector2(0.115, -0.028),
  ];
  addPart(headG, track(new THREE.LatheGeometry(helmetPoints, 18)), armorPrimary, [0, 0.158, -0.008], [-0.06, 0, 0]);
  addPart(headG, track(makeRoundedPlateGeo(0.155, 0.036, 0.055, 0.008)), armorSecondary, [0, 0.205, 0.082], [0.2, 0, 0]);
  addPart(headG, track(new THREE.BoxGeometry(0.042, 0.04, 0.022)), metal, [0, 0.218, 0.11]);
  addPart(headG, track(new THREE.BoxGeometry(0.024, 0.06, 0.09)), metal, [0.112, 0.155, -0.01]);
  addPart(headG, track(new THREE.BoxGeometry(0.024, 0.06, 0.09)), metal, [-0.112, 0.155, -0.01]);
  addPart(headG, track(makeRoundedPlateGeo(0.155, 0.045, 0.04, 0.007)), visor, [0, 0.165, 0.086]);
  addPart(headG, track(makeRoundedPlateGeo(0.12, 0.07, 0.065, 0.01)), armorSecondary, [0, 0.095, 0.072], [0.12, 0, 0]);
  addPart(headG, track(new THREE.CylinderGeometry(0.022, 0.025, 0.03, 10)), metal, [0.042, 0.085, 0.105], [Math.PI / 2, 0, 0]);
  addPart(headG, track(new THREE.CylinderGeometry(0.022, 0.025, 0.03, 10)), metal, [-0.042, 0.085, 0.105], [Math.PI / 2, 0, 0]);

  // arms
  const buildArm = (upperG, foreG, sideSign) => {
    addPart(upperG, track(new THREE.SphereGeometry(0.062, 12, 10)), fabric, [0, -0.02, 0]);
    addPart(upperG, track(makeRoundedPlateGeo(0.105, 0.11, 0.115, 0.014)), armorPrimary, [sideSign * 0.022, -0.045, 0], [0, 0, sideSign * -0.18]);
    addPart(upperG, track(new THREE.CylinderGeometry(0.052, 0.046, 0.25, 12)), fabric, [0, -0.145, 0]);
    addPart(upperG, track(new THREE.CylinderGeometry(0.056, 0.054, 0.04, 12)), armorSecondary, [0, -0.18, 0]);
    addPart(foreG, track(new THREE.SphereGeometry(0.045, 10, 10)), armorSecondary, [0, 0.0, -0.02]);
    addPart(foreG, track(new THREE.CylinderGeometry(0.045, 0.036, 0.22, 12)), fabric, [0, -0.11, 0]);
    addPart(foreG, track(makeRoundedPlateGeo(0.075, 0.14, 0.07, 0.01)), armorPrimary, [sideSign * 0.012, -0.12, 0.01]);
    addPart(foreG, track(makeRoundedPlateGeo(0.058, 0.075, 0.075, 0.01)), bootRubber, [0, -0.25, 0.01]);
  };
  buildArm(bones.upperArmL, bones.forearmL, 1);
  buildArm(bones.upperArmR, bones.forearmR, -1);

  // legs
  const buildLeg = (thighG, shinG, sideSign) => {
    addPart(thighG, track(new THREE.SphereGeometry(0.072, 12, 10)), fabric, [0, -0.02, 0]);
    addPart(thighG, track(new THREE.CylinderGeometry(0.074, 0.06, 0.38, 12)), fabric, [0, -0.21, 0]);
    addPart(thighG, track(makeRoundedPlateGeo(0.095, 0.18, 0.095, 0.014)), armorSecondary, [sideSign * 0.035, -0.20, 0.01]);
    addPart(thighG, track(new THREE.CylinderGeometry(0.066, 0.064, 0.035, 12)), armorPrimary, [0, -0.26, 0]);
    addPart(shinG, track(makeRoundedPlateGeo(0.095, 0.10, 0.055, 0.014)), armorPrimary, [0, -0.01, 0.055]);
    addPart(shinG, track(new THREE.CylinderGeometry(0.058, 0.045, 0.36, 12)), fabric, [0, -0.20, 0]);
    addPart(shinG, track(makeRoundedPlateGeo(0.095, 0.24, 0.06, 0.012)), armorSecondary, [0, -0.21, 0.035]);
    addPart(shinG, track(new THREE.CylinderGeometry(0.05, 0.054, 0.09, 12)), bootRubber, [0, -0.40, 0]);
    addPart(shinG, track(makeRoundedPlateGeo(0.095, 0.055, 0.19, 0.01)), bootRubber, [0, -0.445, 0.042]);
    addPart(shinG, track(new THREE.BoxGeometry(0.102, 0.028, 0.21)), metal, [0, -0.476, 0.044]);
  };
  buildLeg(bones.thighL, bones.shinL, 1);
  buildLeg(bones.thighR, bones.shinR, -1);

  // rifle (визуал)
  const rifleAttachmentMount = new THREE.Group();
  rifleAttachmentMount.position.set(0.02, -0.25, 0.055);
  rifleAttachmentMount.rotation.set(Math.PI / 2 + 0.18, 0.1, 0.62);
  bones.forearmR.add(rifleAttachmentMount);
  const rifleGroup = new THREE.Group();
  addPart(rifleGroup, track(makeRoundedPlateGeo(0.048, 0.085, 0.26, 0.006)), riflePolymer, [0, 0, 0]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.042, 0.052, 0.22)), metal, [0, 0.015, 0.22]);
  addPart(rifleGroup, track(new THREE.CylinderGeometry(0.011, 0.013, 0.24, 10)), metal, [0, 0.015, 0.38], [Math.PI / 2, 0, 0]);
  addPart(rifleGroup, track(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 12)), riflePolymer, [0, 0.015, 0.49], [Math.PI / 2, 0, 0]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.032, 0.14, 0.058)), armorSecondary, [0, -0.095, 0.06], [0.22, 0, 0]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.034, 0.10, 0.042)), bootRubber, [0, -0.075, -0.08], [-0.32, 0, 0]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.036, 0.095, 0.18)), riflePolymer, [0, -0.005, -0.21]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.036, 0.042, 0.07)), metal, [0, 0.062, 0.02]);
  addPart(rifleGroup, track(new THREE.BoxGeometry(0.028, 0.026, 0.012)), opticGlass, [0, 0.066, 0.045]);
  rifleAttachmentMount.add(rifleGroup);

  // contact shadow
  const shadowGeo = track(new THREE.PlaneGeometry(1.1, 1.1));
  const shadowMat = new THREE.MeshBasicMaterial({ map: contactShadowTex, transparent: true, opacity: 0.48, depthWrite: false });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.012;
  root.add(contactShadow);

  let flashTimer = 0;
  let locPhase = 0;
  return {
    root, bones, rifleGroup, contactShadow,
    applyPose(dt, t, move01, attackW, deadW) {
      // Фаза локомоции накапливается от скорости движения: частота шага
      // совпадает с перемещением и убирает визуальное «скольжение на лыжах».
      if (move01 > 0.05) {
        locPhase = (locPhase + dt * (7.5 + move01 * 5.5)) % (Math.PI * 200);
      } else {
        // в покое медленно выравниваем фазу к нейтральной стойке
        locPhase += (0 - Math.sin(locPhase)) * Math.min(1, dt * 4);
      }
      const mode = move01 > 0.08 ? 'run' : 'idle';
      const speed = 0.8 + move01 * 1.4;
      const pose = computeCharacterPose(mode === 'idle' ? t : locPhase, speed, mode);
      // pelvis base
      const ps = BONE_SPECS.pelvis.pivotOffset;
      bones.pelvis.position.set(ps[0] + pose.pelvisOffsetX, ps[1] + pose.pelvisOffsetY, ps[2]);
      for (const boneId of BONE_ORDER) {
        const bp = pose.bones[boneId];
        const obj = bones[boneId];
        if (!bp || !obj) continue;
        obj.rotation.set(bp.rot[0], bp.rot[1], bp.rot[2]);
      }
      // атака/прицеливание: чуть поднимаем корпус и руки при стрельбе
      if (attackW > 0.01) {
        bones.torso.rotation.x += -0.04 * attackW;
        bones.upperArmR.rotation.x += -0.08 * attackW;
        bones.upperArmL.rotation.x += -0.06 * attackW;
        bones.head.rotation.x += -0.03 * attackW;
      }
      // смерть: заваливаем (визуально), если нужен доп. эффект
      if (deadW > 0.01) {
        bones.pelvis.rotation.x += -1.1 * deadW;
        bones.head.rotation.x += 0.25 * deadW;
      }
      // вспышка попадания
      if (flashTimer > 0) {
        flashTimer = Math.max(0, flashTimer - dt);
        const k = flashTimer / 0.14;
        armorPrimary.emissive.setHex(0x551812).multiplyScalar(k);
        armorSecondary.emissive.setHex(0x551812).multiplyScalar(k);
        visor.emissiveIntensity = 1.5 + k * 1.6;
      } else {
        armorPrimary.emissive.setHex(0x000000);
        armorSecondary.emissive.setHex(0x000000);
        visor.emissiveIntensity = 1.5;
      }
    },
    flashHit() { flashTimer = 0.14; },
    dispose() {
      for (const g of geos) g.dispose();
      armorPrimary.dispose(); armorSecondary.dispose(); fabric.dispose(); metal.dispose();
      visor.dispose(); bootRubber.dispose(); riflePolymer.dispose(); opticGlass.dispose();
      shadowMat.dispose();
      // shared textures (armorBump/contactShadowTex) не освобождаем — общие
    },
  };
}
