export type BoneId =
  | 'pelvis'
  | 'torso'
  | 'head'
  | 'upperArmL'
  | 'forearmL'
  | 'upperArmR'
  | 'forearmR'
  | 'thighL'
  | 'shinL'
  | 'thighR'
  | 'shinR';

export type AnimationMode = 'walk' | 'patrol' | 'idle';

export type SoldierVariantId = 'assault' | 'recon' | 'heavy';

export interface SoldierVariant {
  id: SoldierVariantId;
  name: string;
  subtitle: string;
  armorPrimary: number;
  armorSecondary: number;
  fabricColor: number;
  metalAccent: number;
  visorEmissive: number;
  visorColor: number;
  maxHp: number;
}

export const SOLDIER_VARIANTS: Record<SoldierVariantId, SoldierVariant> = {
  assault: {
    id: 'assault',
    name: 'Штурмовик',
    subtitle: 'Графитовая броня · Красный визор',
    armorPrimary: 0x262b33,
    armorSecondary: 0x3b424d,
    fabricColor: 0x1a1e24,
    metalAccent: 0x5c6675,
    visorColor: 0xff3b2f,
    visorEmissive: 0xff2a1f,
    maxHp: 100,
  },
  recon: {
    id: 'recon',
    name: 'Разведчик',
    subtitle: 'Пустынный койот · Янтарный визор',
    armorPrimary: 0x73634f,
    armorSecondary: 0x4f4437,
    fabricColor: 0x3a332b,
    metalAccent: 0x787168,
    visorColor: 0xffaa2b,
    visorEmissive: 0xff9500,
    maxHp: 85,
  },
  heavy: {
    id: 'heavy',
    name: 'Тяжелый боец',
    subtitle: 'Тактическая олива · Голубой визор',
    armorPrimary: 0x394538,
    armorSecondary: 0x252d24,
    fabricColor: 0x1e241e,
    metalAccent: 0x677368,
    visorColor: 0x38bdf8,
    visorEmissive: 0x0ea5e9,
    maxHp: 150,
  },
};

export interface BoneSpec {
  id: BoneId;
  labelRu: string;
  parent: BoneId | null;
  /** Pivot position relative to parent's pivot (meters) */
  pivotOffset: [number, number, number];
  /** Center of mass offset relative to this bone's pivot (meters) */
  comOffset: [number, number, number];
  /** Half-extents [hx, hy, hz] for rigid body box/capsule collider */
  halfExtents: [number, number, number];
  /** Mass in kg for ragdoll simulation */
  mass: number;
  /** Damage multiplier for shooter hit detection */
  damageMultiplier: number;
}

export const BONE_SPECS: Record<BoneId, BoneSpec> = {
  pelvis: {
    id: 'pelvis',
    labelRu: 'Таз',
    parent: null,
    pivotOffset: [0, 0.94, 0],
    comOffset: [0, 0, 0],
    halfExtents: [0.14, 0.09, 0.10],
    mass: 12,
    damageMultiplier: 1.0,
  },
  torso: {
    id: 'torso',
    labelRu: 'Грудь и корпус',
    parent: 'pelvis',
    pivotOffset: [0, 0.09, 0],
    comOffset: [0, 0.23, 0],
    halfExtents: [0.17, 0.22, 0.12],
    mass: 24,
    damageMultiplier: 1.0,
  },
  head: {
    id: 'head',
    labelRu: 'Голова (Шлем)',
    parent: 'torso',
    pivotOffset: [0, 0.46, 0],
    comOffset: [0, 0.14, 0],
    halfExtents: [0.105, 0.13, 0.115],
    mass: 5.5,
    damageMultiplier: 2.5,
  },
  upperArmL: {
    id: 'upperArmL',
    labelRu: 'Левое плечо',
    parent: 'torso',
    pivotOffset: [0.225, 0.41, 0],
    comOffset: [0, -0.145, 0],
    halfExtents: [0.06, 0.145, 0.06],
    mass: 3.2,
    damageMultiplier: 0.75,
  },
  forearmL: {
    id: 'forearmL',
    labelRu: 'Левое предплечье',
    parent: 'upperArmL',
    pivotOffset: [0, -0.29, 0],
    comOffset: [0, -0.14, 0],
    halfExtents: [0.05, 0.14, 0.05],
    mass: 2.2,
    damageMultiplier: 0.65,
  },
  upperArmR: {
    id: 'upperArmR',
    labelRu: 'Правое плечо',
    parent: 'torso',
    pivotOffset: [-0.225, 0.41, 0],
    comOffset: [0, -0.145, 0],
    halfExtents: [0.06, 0.145, 0.06],
    mass: 3.2,
    damageMultiplier: 0.75,
  },
  forearmR: {
    id: 'forearmR',
    labelRu: 'Правое предплечье',
    parent: 'upperArmR',
    pivotOffset: [0, -0.29, 0],
    comOffset: [0, -0.14, 0],
    halfExtents: [0.05, 0.14, 0.05],
    mass: 2.4,
    damageMultiplier: 0.65,
  },
  thighL: {
    id: 'thighL',
    labelRu: 'Левое бедро',
    parent: 'pelvis',
    pivotOffset: [0.105, -0.03, 0],
    comOffset: [0, -0.21, 0],
    halfExtents: [0.075, 0.21, 0.075],
    mass: 8.5,
    damageMultiplier: 0.8,
  },
  shinL: {
    id: 'shinL',
    labelRu: 'Левая голень',
    parent: 'thighL',
    pivotOffset: [0, -0.42, 0],
    comOffset: [0, -0.24, 0.02],
    halfExtents: [0.065, 0.24, 0.08],
    mass: 5.5,
    damageMultiplier: 0.7,
  },
  thighR: {
    id: 'thighR',
    labelRu: 'Правое бедро',
    parent: 'pelvis',
    pivotOffset: [-0.105, -0.03, 0],
    comOffset: [0, -0.21, 0],
    halfExtents: [0.075, 0.21, 0.075],
    mass: 8.5,
    damageMultiplier: 0.8,
  },
  shinR: {
    id: 'shinR',
    labelRu: 'Правая голень',
    parent: 'thighR',
    pivotOffset: [0, -0.42, 0],
    comOffset: [0, -0.24, 0.02],
    halfExtents: [0.065, 0.24, 0.08],
    mass: 5.5,
    damageMultiplier: 0.7,
  },
};

export const BONE_ORDER: BoneId[] = [
  'pelvis',
  'torso',
  'head',
  'upperArmL',
  'forearmL',
  'upperArmR',
  'forearmR',
  'thighL',
  'shinL',
  'thighR',
  'shinR',
];

export interface BonePose {
  /** Local Euler XYZ angles in radians */
  rot: [number, number, number];
}

export interface CharacterPose {
  pelvisOffsetY: number;
  pelvisOffsetX: number;
  bones: Record<BoneId, BonePose>;
}

/**
 * Computes a realistic, physically grounded bipedal shooter walk/patrol/idle pose.
 * Convention (Three.js right-handed, character facing +Z):
 *  - Negative X rotation swings limbs forward (+Z).
 *  - Positive X rotation swings limbs backward (-Z) and bends knees naturally.
 *  - Negative X rotation bends elbows naturally forward (+Z).
 */
export function computeCharacterPose(
  phase: number,
  walkSpeed: number,
  mode: AnimationMode
): CharacterPose {
  const isMoving = mode !== 'idle' && walkSpeed > 0.05;
  const speedNorm = isMoving ? Math.min(Math.max(walkSpeed, 0.2), 2.2) : 0;

  if (!isMoving) {
    // Combat ready idle breathing & rifle aim stance
    const breath = Math.sin(phase * 1.6);
    const subtleShift = Math.sin(phase * 0.8);
    return {
      pelvisOffsetY: -0.025 + breath * 0.005,
      pelvisOffsetX: subtleShift * 0.008,
      bones: {
        pelvis: { rot: [0.04, -0.18, 0] },
        torso: { rot: [0.07 + breath * 0.015, 0.18, 0] },
        head: { rot: [-0.04 - breath * 0.01, 0.02 + subtleShift * 0.05, 0] },
        // Rifle-ready two-handed carriage (low-ready across chest)
        upperArmR: { rot: [-0.42, -0.14, -0.16] },
        forearmR: { rot: [-1.18, 0.08, 0.14] },
        upperArmL: { rot: [-0.62, 0.48, 0.12] },
        forearmL: { rot: [-1.05, -0.18, -0.22] },
        // Balanced combat stance
        thighL: { rot: [-0.16, 0.08, 0.04] },
        shinL: { rot: [0.22, 0, 0] },
        thighR: { rot: [0.12, -0.08, -0.04] },
        shinR: { rot: [0.16, 0, 0] },
      },
    };
  }

  // Walking / tactical patrol gait cycle
  const strideAmp = 0.46 * (0.55 + 0.45 * Math.min(speedNorm, 1.5));
  const leftSwing = Math.sin(phase);
  const rightSwing = Math.sin(phase + Math.PI);

  // Knee flexion peaks during swing phase (when foot lifts forward) and mildly cushions stance
  const kneeL = Math.max(0.06, Math.sin(phase - 0.85) * 0.68 + 0.22);
  const kneeR = Math.max(0.06, Math.sin(phase + Math.PI - 0.85) * 0.68 + 0.22);

  // Double-frequency vertical bob (lowest at double-support, highest at mid-stance)
  const bobY = -0.045 + Math.abs(Math.cos(phase)) * 0.036 * Math.min(speedNorm, 1.4);
  const swayX = Math.sin(phase) * 0.022;

  // Pelvis yaw & roll counter-rotated by upper torso for realistic locomotion
  const pelvisYaw = Math.sin(phase) * 0.09;
  const pelvisRoll = Math.cos(phase) * 0.035;
  const torsoYaw = -Math.sin(phase) * 0.11;
  const torsoLean = 0.08 + 0.05 * Math.min(speedNorm, 1.4);

  // Arms hold tactical carbine at low-ready while swaying organically with gait
  const armBounce = Math.cos(phase * 2) * 0.03;
  const armSway = Math.sin(phase) * 0.055;

  return {
    pelvisOffsetY: bobY,
    pelvisOffsetX: swayX,
    bones: {
      pelvis: { rot: [0.03, pelvisYaw, pelvisRoll] },
      torso: { rot: [torsoLean, torsoYaw, -pelvisRoll * 0.7] },
      head: { rot: [-torsoLean * 0.75, -torsoYaw * 0.6, 0] },
      // Right arm holds rifle grip/stock with subtle recoil/stride cadence
      upperArmR: { rot: [-0.40 + armBounce + armSway * 0.45, -0.14, -0.16] },
      forearmR: { rot: [-1.14 - armBounce * 0.5, 0.08, 0.14] },
      // Left arm supports handguard
      upperArmL: { rot: [-0.60 + armBounce - armSway * 0.45, 0.48, 0.12] },
      forearmL: { rot: [-1.02 - armBounce * 0.5, -0.18, -0.22] },
      // Legs: negative X swings forward
      thighL: { rot: [-leftSwing * strideAmp - 0.05, 0.03, 0.025] },
      shinL: { rot: [kneeL, 0, 0] },
      thighR: { rot: [-rightSwing * strideAmp - 0.05, -0.03, -0.025] },
      shinR: { rot: [kneeR, 0, 0] },
    },
  };
}

export function computeHitDamage(baseDamage: number, boneId: BoneId): number {
  const mult = BONE_SPECS[boneId]?.damageMultiplier ?? 1.0;
  return Math.round(baseDamage * mult);
}
