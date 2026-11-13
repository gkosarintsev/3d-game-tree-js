import * as THREE from 'three';
import {
  BONE_ORDER,
  BONE_SPECS,
  SOLDIER_VARIANTS,
  type BoneId,
  type SoldierVariantId,
} from './enemyConfig';

export interface SoldierRig {
  root: THREE.Group;
  bones: Record<BoneId, THREE.Group>;
  rifleGroup: THREE.Group;
  rifleAttachmentMount: THREE.Group;
  hitboxMeshes: THREE.Mesh[];
  debugGroup: THREE.Group;
  contactShadow: THREE.Mesh;
  materials: {
    armorPrimary: THREE.MeshStandardMaterial;
    armorSecondary: THREE.MeshStandardMaterial;
    fabric: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
    visor: THREE.MeshStandardMaterial;
    bootRubber: THREE.MeshStandardMaterial;
    riflePolymer: THREE.MeshStandardMaterial;
    opticGlass: THREE.MeshStandardMaterial;
    hitboxMat: THREE.MeshBasicMaterial;
    debugEdgeMat: THREE.LineBasicMaterial;
    debugJointMat: THREE.MeshBasicMaterial;
  };
  applyVariant: (variantId: SoldierVariantId) => void;
  setDebugVisible: (visible: boolean) => void;
  flashHit: (boneId: BoneId) => void;
  updateFlash: (dt: number) => void;
  dispose: () => void;
}

function makeRoundedPlateGeo(
  width: number,
  height: number,
  depth: number,
  bevel = 0.015
): THREE.ExtrudeGeometry {
  const hw = width / 2;
  const hh = height / 2;
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
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 4,
  });
  geo.center();
  return geo;
}

export function buildEnemySoldier(
  variantId: SoldierVariantId,
  armorBump: THREE.Texture,
  contactShadowTex: THREE.Texture
): SoldierRig {
  const variant = SOLDIER_VARIANTS[variantId];
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometriesToDispose.push(g);
    return g;
  };

  // Materials calibrated across distinct roughness/metalness tiers
  const armorPrimary = new THREE.MeshStandardMaterial({
    color: variant.armorPrimary,
    roughness: 0.42,
    metalness: 0.28,
    bumpMap: armorBump,
    bumpScale: 0.004,
  });
  const armorSecondary = new THREE.MeshStandardMaterial({
    color: variant.armorSecondary,
    roughness: 0.56,
    metalness: 0.16,
    bumpMap: armorBump,
    bumpScale: 0.005,
  });
  const fabric = new THREE.MeshStandardMaterial({
    color: variant.fabricColor,
    roughness: 0.88,
    metalness: 0.03,
    bumpMap: armorBump,
    bumpScale: 0.008,
  });
  const metal = new THREE.MeshStandardMaterial({
    color: variant.metalAccent,
    roughness: 0.24,
    metalness: 0.85,
  });
  const visor = new THREE.MeshStandardMaterial({
    color: variant.visorColor,
    emissive: variant.visorEmissive,
    emissiveIntensity: 1.5,
    roughness: 0.12,
    metalness: 0.3,
  });
  const bootRubber = new THREE.MeshStandardMaterial({
    color: 0x15171b,
    roughness: 0.92,
    metalness: 0.05,
  });
  const riflePolymer = new THREE.MeshStandardMaterial({
    color: 0x1d2026,
    roughness: 0.65,
    metalness: 0.12,
  });
  const opticGlass = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.4,
  });
  const hitboxMat = new THREE.MeshBasicMaterial({
    visible: false,
  });
  const debugEdgeMat = new THREE.LineBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.85,
  });
  const debugJointMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
  });

  const root = new THREE.Group();
  root.name = 'EnemySoldierRoot';

  const bones = {} as Record<BoneId, THREE.Group>;
  const hitboxMeshes: THREE.Mesh[] = [];
  const debugGroup = new THREE.Group();
  debugGroup.visible = false;
  root.add(debugGroup);

  const debugColliderBoxes: { boneId: BoneId; wire: THREE.LineSegments; joint: THREE.Mesh }[] = [];

  // Create bone hierarchy
  for (const boneId of BONE_ORDER) {
    const spec = BONE_SPECS[boneId];
    const group = new THREE.Group();
    group.name = `Bone_${boneId}`;
    group.position.set(...spec.pivotOffset);

    if (spec.parent) {
      bones[spec.parent].add(group);
    } else {
      root.add(group);
    }
    bones[boneId] = group;

    // Invisible simplified hitbox proxy for fast raycasting on Layer 1
    const [hx, hy, hz] = spec.halfExtents;
    const hitGeo = trackGeo(new THREE.BoxGeometry(hx * 2.15, hy * 2.05, hz * 2.15));
    const hitMesh = new THREE.Mesh(hitGeo, hitboxMat);
    hitMesh.position.set(...spec.comOffset);
    hitMesh.layers.set(1);
    hitMesh.userData.boneId = boneId;
    hitMesh.name = `Hitbox_${boneId}`;
    group.add(hitMesh);
    hitboxMeshes.push(hitMesh);

    // Debug collider wireframe + joint pivot marker
    const wireGeo = trackGeo(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(hx * 1.84, hy * 1.68, hz * 1.84))
    );
    const wire = new THREE.LineSegments(wireGeo, debugEdgeMat);
    wire.position.set(...spec.comOffset);
    wire.visible = false;
    group.add(wire);

    const jointGeo = trackGeo(new THREE.SphereGeometry(0.026, 10, 10));
    const joint = new THREE.Mesh(jointGeo, debugJointMat);
    joint.visible = false;
    group.add(joint);

    debugColliderBoxes.push({ boneId, wire, joint });
  }

  // Helper to attach shadow-casting visual meshes
  const addPart = (
    parent: THREE.Object3D,
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    pos: [number, number, number] = [0, 0, 0],
    rot: [number, number, number] = [0, 0, 0]
  ) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // ---------------- 1. PELVIS (Composite tactical belt, buckle, hip holsters, groin flap) ----------------
  const pelvisG = bones.pelvis;
  addPart(pelvisG, trackGeo(makeRoundedPlateGeo(0.27, 0.14, 0.16, 0.015)), fabric, [0, 0, 0]);
  addPart(pelvisG, trackGeo(makeRoundedPlateGeo(0.295, 0.055, 0.19, 0.008)), armorSecondary, [0, 0.03, 0]);
  addPart(pelvisG, trackGeo(new THREE.BoxGeometry(0.08, 0.05, 0.03)), metal, [0, 0.03, 0.105]); // Buckle
  addPart(pelvisG, trackGeo(makeRoundedPlateGeo(0.14, 0.12, 0.025, 0.008)), armorPrimary, [0, -0.05, 0.095], [0.1, 0, 0]); // Groin guard
  addPart(pelvisG, trackGeo(new THREE.BoxGeometry(0.055, 0.10, 0.10)), armorSecondary, [0.16, 0.01, 0.02]); // Left mag pouch
  addPart(pelvisG, trackGeo(new THREE.BoxGeometry(0.055, 0.10, 0.10)), armorSecondary, [-0.16, 0.01, 0.02]); // Right pouch

  // ---------------- 2. TORSO (Under-suit, beveled plate carrier, pouches, comms pack, pauldrons) ----------------
  const torsoG = bones.torso;
  addPart(torsoG, trackGeo(makeRoundedPlateGeo(0.29, 0.42, 0.17, 0.02)), fabric, [0, 0.22, 0]);
  // Front & back ballistic ceramic plate carrier
  addPart(torsoG, trackGeo(makeRoundedPlateGeo(0.27, 0.28, 0.055, 0.016)), armorPrimary, [0, 0.25, 0.095]);
  addPart(torsoG, trackGeo(makeRoundedPlateGeo(0.26, 0.27, 0.05, 0.014)), armorPrimary, [0, 0.25, -0.095]);
  // Chest MOLLE triple mag pouches
  for (let i = -1; i <= 1; i++) {
    addPart(torsoG, trackGeo(new THREE.BoxGeometry(0.068, 0.11, 0.042)), armorSecondary, [i * 0.078, 0.18, 0.135]);
  }
  // Shoulder harness straps & collar armor
  addPart(torsoG, trackGeo(new THREE.BoxGeometry(0.06, 0.09, 0.22)), armorSecondary, [0.105, 0.41, 0]);
  addPart(torsoG, trackGeo(new THREE.BoxGeometry(0.06, 0.09, 0.22)), armorSecondary, [-0.105, 0.41, 0]);
  addPart(torsoG, trackGeo(new THREE.CylinderGeometry(0.085, 0.10, 0.06, 12)), armorSecondary, [0, 0.43, 0]);
  // Back tactical comms pack & radio antenna
  addPart(torsoG, trackGeo(makeRoundedPlateGeo(0.18, 0.22, 0.08, 0.012)), armorSecondary, [0, 0.26, -0.155]);
  addPart(torsoG, trackGeo(new THREE.CylinderGeometry(0.006, 0.008, 0.24, 8)), metal, [0.065, 0.45, -0.17]);
  addPart(torsoG, trackGeo(new THREE.BoxGeometry(0.04, 0.016, 0.012)), visor, [0, 0.34, -0.20]); // Rear IFF strip

  // ---------------- 3. HEAD & TACTICAL HELMET (Neck, balaclava, Lathe dome, ARC rails, glowing visor, respirator) ----------------
  const headG = bones.head;
  addPart(headG, trackGeo(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 12)), fabric, [0, 0.03, 0]);
  // Inner skull/balaclava
  addPart(headG, trackGeo(new THREE.SphereGeometry(0.095, 16, 14)), fabric, [0, 0.15, 0.005]);
  // Ballistic helmet outer shell via LatheGeometry
  const helmetPoints = [
    new THREE.Vector2(0.001, 0.105),
    new THREE.Vector2(0.072, 0.10),
    new THREE.Vector2(0.112, 0.068),
    new THREE.Vector2(0.12, 0.018),
    new THREE.Vector2(0.115, -0.028),
  ];
  const helmetGeo = trackGeo(new THREE.LatheGeometry(helmetPoints, 18));
  addPart(headG, helmetGeo, armorPrimary, [0, 0.158, -0.008], [-0.06, 0, 0]);
  // Helmet brow shield & NVG mount shroud
  addPart(headG, trackGeo(makeRoundedPlateGeo(0.155, 0.036, 0.055, 0.008)), armorSecondary, [0, 0.205, 0.082], [0.2, 0, 0]);
  addPart(headG, trackGeo(new THREE.BoxGeometry(0.042, 0.04, 0.022)), metal, [0, 0.218, 0.11]);
  // Side ARC accessory rails & ear comms pods
  addPart(headG, trackGeo(new THREE.BoxGeometry(0.024, 0.06, 0.09)), metal, [0.112, 0.155, -0.01]);
  addPart(headG, trackGeo(new THREE.BoxGeometry(0.024, 0.06, 0.09)), metal, [-0.112, 0.155, -0.01]);
  // Glowing tactical panoramic visor
  addPart(headG, trackGeo(makeRoundedPlateGeo(0.155, 0.045, 0.04, 0.007)), visor, [0, 0.165, 0.086]);
  // Lower jaw respirator / mandible mask
  addPart(headG, trackGeo(makeRoundedPlateGeo(0.12, 0.07, 0.065, 0.01)), armorSecondary, [0, 0.095, 0.072], [0.12, 0, 0]);
  addPart(headG, trackGeo(new THREE.CylinderGeometry(0.022, 0.025, 0.03, 10)), metal, [0.042, 0.085, 0.105], [Math.PI / 2, 0, 0]);
  addPart(headG, trackGeo(new THREE.CylinderGeometry(0.022, 0.025, 0.03, 10)), metal, [-0.042, 0.085, 0.105], [Math.PI / 2, 0, 0]);

  // ---------------- 4. ARMS (Shoulder pauldrons, bicep sleeves, elbow pads, forearm bracers, hands) ----------------
  const buildArm = (upperG: THREE.Group, foreG: THREE.Group, sideSign: 1 | -1) => {
    // Deltoid shoulder pauldron
    addPart(upperG, trackGeo(new THREE.SphereGeometry(0.062, 12, 10)), fabric, [0, -0.02, 0]);
    addPart(
      upperG,
      trackGeo(makeRoundedPlateGeo(0.105, 0.11, 0.115, 0.014)),
      armorPrimary,
      [sideSign * 0.022, -0.045, 0],
      [0, 0, sideSign * -0.18]
    );
    // Upper arm sleeve + bicep band
    addPart(upperG, trackGeo(new THREE.CylinderGeometry(0.052, 0.046, 0.25, 12)), fabric, [0, -0.145, 0]);
    addPart(upperG, trackGeo(new THREE.CylinderGeometry(0.056, 0.054, 0.04, 12)), armorSecondary, [0, -0.18, 0]);

    // Forearm elbow pad + tactical bracer + gloved hand
    addPart(foreG, trackGeo(new THREE.SphereGeometry(0.045, 10, 10)), armorSecondary, [0, 0.0, -0.02]);
    addPart(foreG, trackGeo(new THREE.CylinderGeometry(0.045, 0.036, 0.22, 12)), fabric, [0, -0.11, 0]);
    addPart(
      foreG,
      trackGeo(makeRoundedPlateGeo(0.075, 0.14, 0.07, 0.01)),
      armorPrimary,
      [sideSign * 0.012, -0.12, 0.01]
    );
    addPart(foreG, trackGeo(makeRoundedPlateGeo(0.058, 0.075, 0.075, 0.01)), bootRubber, [0, -0.25, 0.01]);
  };
  buildArm(bones.upperArmL, bones.forearmL, 1);
  buildArm(bones.upperArmR, bones.forearmR, -1);

  // ---------------- 5. LEGS (Thigh sleeves, holsters, knee pads, shin greaves, multi-part boots) ----------------
  const buildLeg = (thighG: THREE.Group, shinG: THREE.Group, sideSign: 1 | -1) => {
    // Hip ball + thigh cylinder + thigh armor plate/holster
    addPart(thighG, trackGeo(new THREE.SphereGeometry(0.072, 12, 10)), fabric, [0, -0.02, 0]);
    addPart(thighG, trackGeo(new THREE.CylinderGeometry(0.074, 0.06, 0.38, 12)), fabric, [0, -0.21, 0]);
    addPart(
      thighG,
      trackGeo(makeRoundedPlateGeo(0.095, 0.18, 0.095, 0.014)),
      armorSecondary,
      [sideSign * 0.035, -0.20, 0.01]
    );
    addPart(thighG, trackGeo(new THREE.CylinderGeometry(0.066, 0.064, 0.035, 12)), armorPrimary, [0, -0.26, 0]);

    // Knee pad + shin cylinder + shin greave
    addPart(shinG, trackGeo(makeRoundedPlateGeo(0.095, 0.10, 0.055, 0.014)), armorPrimary, [0, -0.01, 0.055]);
    addPart(shinG, trackGeo(new THREE.CylinderGeometry(0.058, 0.045, 0.36, 12)), fabric, [0, -0.20, 0]);
    addPart(shinG, trackGeo(makeRoundedPlateGeo(0.095, 0.24, 0.06, 0.012)), armorSecondary, [0, -0.21, 0.035]);

    // Combat Boot (ankle collar, upper boot, toe cap, heavy rubber tread sole)
    addPart(shinG, trackGeo(new THREE.CylinderGeometry(0.05, 0.054, 0.09, 12)), bootRubber, [0, -0.40, 0]);
    addPart(shinG, trackGeo(makeRoundedPlateGeo(0.095, 0.055, 0.19, 0.01)), bootRubber, [0, -0.445, 0.042]);
    addPart(shinG, trackGeo(new THREE.BoxGeometry(0.102, 0.028, 0.21)), metal, [0, -0.476, 0.044]); // Reinforced sole
  };
  buildLeg(bones.thighL, bones.shinL, 1);
  buildLeg(bones.thighR, bones.shinR, -1);

  // ---------------- 6. COMPOSITE TACTICAL CARBINE RIFLE (Detaches on Ragdoll) ----------------
  const rifleAttachmentMount = new THREE.Group();
  rifleAttachmentMount.name = 'RifleMount';
  rifleAttachmentMount.position.set(0.02, -0.25, 0.055);
  // Orient rifle forward (+Z world) and slightly across chest toward left support hand
  rifleAttachmentMount.rotation.set(Math.PI / 2 + 0.18, 0.1, 0.62);
  bones.forearmR.add(rifleAttachmentMount);

  const rifleGroup = new THREE.Group();
  rifleGroup.name = 'TacticalCarbine';
  // Receiver
  addPart(rifleGroup, trackGeo(makeRoundedPlateGeo(0.048, 0.085, 0.26, 0.006)), riflePolymer, [0, 0, 0]);
  // Handguard rail
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.042, 0.052, 0.22)), metal, [0, 0.015, 0.22]);
  // Barrel & muzzle suppressor
  addPart(
    rifleGroup,
    trackGeo(new THREE.CylinderGeometry(0.011, 0.013, 0.24, 10)),
    metal,
    [0, 0.015, 0.38],
    [Math.PI / 2, 0, 0]
  );
  addPart(
    rifleGroup,
    trackGeo(new THREE.CylinderGeometry(0.018, 0.018, 0.11, 12)),
    riflePolymer,
    [0, 0.015, 0.49],
    [Math.PI / 2, 0, 0]
  );
  // Curved magazine
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.032, 0.14, 0.058)), armorSecondary, [0, -0.095, 0.06], [0.22, 0, 0]);
  // Pistol grip
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.034, 0.10, 0.042)), bootRubber, [0, -0.075, -0.08], [-0.32, 0, 0]);
  // Tactical stock
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.036, 0.095, 0.18)), riflePolymer, [0, -0.005, -0.21]);
  // Holographic Red-Dot Optic
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.036, 0.042, 0.07)), metal, [0, 0.062, 0.02]);
  addPart(rifleGroup, trackGeo(new THREE.BoxGeometry(0.028, 0.026, 0.012)), opticGlass, [0, 0.066, 0.045]);

  rifleAttachmentMount.add(rifleGroup);

  // ---------------- 7. GROUND CONTACT SHADOW ----------------
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(1.1, 1.1));
  const shadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.012;
  root.add(contactShadow);

  // Hit flash state
  let flashTimer = 0;
  const baseEmissives = {
    armorPrimary: new THREE.Color(0x000000),
    armorSecondary: new THREE.Color(0x000000),
  };

  return {
    root,
    bones,
    rifleGroup,
    rifleAttachmentMount,
    hitboxMeshes,
    debugGroup,
    contactShadow,
    materials: {
      armorPrimary,
      armorSecondary,
      fabric,
      metal,
      visor,
      bootRubber,
      riflePolymer,
      opticGlass,
      hitboxMat,
      debugEdgeMat,
      debugJointMat,
    },
    applyVariant: (nextId: SoldierVariantId) => {
      const v = SOLDIER_VARIANTS[nextId];
      armorPrimary.color.setHex(v.armorPrimary);
      armorSecondary.color.setHex(v.armorSecondary);
      fabric.color.setHex(v.fabricColor);
      metal.color.setHex(v.metalAccent);
      visor.color.setHex(v.visorColor);
      visor.emissive.setHex(v.visorEmissive);
    },
    setDebugVisible: (visible: boolean) => {
      for (const item of debugColliderBoxes) {
        item.wire.visible = visible;
        item.joint.visible = visible;
      }
      debugGroup.visible = visible;
    },
    flashHit: (boneId: BoneId) => {
      flashTimer = 0.14;
      if (boneId === 'head') {
        visor.emissiveIntensity = 3.2;
      }
      armorPrimary.emissive.setHex(0x551812);
      armorSecondary.emissive.setHex(0x551812);
    },
    updateFlash: (dt: number) => {
      if (flashTimer > 0) {
        flashTimer = Math.max(0, flashTimer - dt);
        const t = flashTimer / 0.14;
        armorPrimary.emissive.copy(baseEmissives.armorPrimary).lerp(new THREE.Color(0x661a14), t);
        armorSecondary.emissive.copy(baseEmissives.armorSecondary).lerp(new THREE.Color(0x661a14), t);
        visor.emissiveIntensity = 1.5 + t * 1.6;
      }
    },
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
      armorPrimary.dispose();
      armorSecondary.dispose();
      fabric.dispose();
      metal.dispose();
      visor.dispose();
      bootRubber.dispose();
      riflePolymer.dispose();
      opticGlass.dispose();
      hitboxMat.dispose();
      debugEdgeMat.dispose();
      debugJointMat.dispose();
      shadowMat.dispose();
    },
  };
}
