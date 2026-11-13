export type XenomorphAnimState =
  | 'idle'
  | 'walk'
  | 'run'
  | 'attack'
  | 'leap'
  | 'crawl'
  | 'death'
  | 'ragdoll';

export type InteractionMode = 'showcase' | 'shooter';

export type CameraMode = 'orbit' | 'follow';

export type HitZone = 'head' | 'torso' | 'limb' | 'tail';

export type RagdollNodeId =
  | 'pelvis'
  | 'chest'
  | 'neck'
  | 'head'
  | 'jawTip'
  | 'shoulderL'
  | 'elbowL'
  | 'handL'
  | 'shoulderR'
  | 'elbowR'
  | 'handR'
  | 'hipL'
  | 'kneeL'
  | 'ankleL'
  | 'footL'
  | 'hipR'
  | 'kneeR'
  | 'ankleR'
  | 'footR'
  | 'tail1'
  | 'tail2'
  | 'tail3'
  | 'tail4'
  | 'tailTip';

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RagdollNode {
  id: RagdollNodeId;
  pos: Vec3;
  prevPos: Vec3;
  radius: number;
  mass: number;
  pinned?: boolean;
}

export interface RagdollDistanceConstraint {
  a: RagdollNodeId;
  b: RagdollNodeId;
  restLength: number;
  stiffness: number; // 0..1
  isStructural?: boolean;
}

export interface RagdollMinDistanceConstraint {
  a: RagdollNodeId;
  b: RagdollNodeId;
  minLength: number;
  stiffness: number;
}

export interface RagdollBendConstraint {
  a: RagdollNodeId;
  pivot: RagdollNodeId;
  b: RagdollNodeId;
  minDot: number; // minimum dot product between dir(pivot->a) and dir(pivot->b) (prevents folding past limit)
  maxDot: number; // maximum dot product (prevents hyperextension)
  stiffness: number;
}

export interface ColliderBox {
  id: string;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface RagdollState {
  active: boolean;
  nodes: Record<RagdollNodeId, RagdollNode>;
  nodeOrder: RagdollNodeId[];
  constraints: RagdollDistanceConstraint[];
  minConstraints: RagdollMinDistanceConstraint[];
  bendConstraints: RagdollBendConstraint[];
  settledTime: number;
}

export interface XenomorphHudSnapshot {
  animState: XenomorphAnimState;
  mode: InteractionMode;
  cameraMode: CameraMode;
  hp: number;
  maxHp: number;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  lastHitZone: HitZone | null;
  lastDamage: number;
  showPhysicsDebug: boolean;
  muted: boolean;
  speedMultiplier: number;
}
