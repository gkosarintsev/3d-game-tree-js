import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  BONE_ORDER,
  BONE_SPECS,
  computeCharacterPose,
  computeHitDamage,
  SOLDIER_VARIANTS,
  type AnimationMode,
  type BoneId,
  type SoldierVariantId,
} from './enemyConfig';
import { createProceduralTextures } from './proceduralTextures';
import {
  RagdollPhysicsWorld,
  RANGE_OBSTACLES,
  type WorldBoneTransform,
} from './ragdollPhysics';
import { buildEnemySoldier } from './soldierBuilder';

export type CameraPresetId = 'threeQuarter' | 'front' | 'side' | 'top';

export interface TelemetrySnapshot {
  hp: number;
  maxHp: number;
  isRagdoll: boolean;
  lastHitLabel: string | null;
  lastHitMultiplier: number | null;
  lastDamage: number | null;
  hitCount: number;
}

export interface SceneCallbacks {
  onTelemetry: (snapshot: TelemetrySnapshot) => void;
}

const CAMERA_PRESETS: Record<CameraPresetId, { pos: [number, number, number]; target: [number, number, number] }> = {
  threeQuarter: { pos: [2.1, 1.48, 3.05], target: [0, 0.88, 0] },
  front: { pos: [0, 1.35, 3.25], target: [0, 0.88, 0] },
  side: { pos: [3.15, 1.3, 0.15], target: [0, 0.88, 0] },
  top: { pos: [0.3, 4.1, 1.9], target: [0, 0.5, 0] },
};

// Pre-allocated scratch math objects (zero GC in render loop)
const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _v3C = new THREE.Vector3();
const _qA = new THREE.Quaternion();
const _qB = new THREE.Quaternion();
const _qC = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _m4ParentInv = new THREE.Matrix4();
const _m4World = new THREE.Matrix4();
const _pointerNdc = new THREE.Vector2();

interface ImpactParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
}

interface TracerBeam {
  line: THREE.Line;
  life: number;
}

export class ShooterRangeScene {
  private readonly container: HTMLElement;
  private readonly callbacks: SceneCallbacks;
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly raycaster: THREE.Raycaster;
  private readonly textures: ReturnType<typeof createProceduralTextures>;
  private readonly soldier: ReturnType<typeof buildEnemySoldier>;
  private readonly ragdoll: RagdollPhysicsWorld;
  private readonly envDisposable: { dispose: () => void }[] = [];

  private frameId = 0;
  private disposed = false;
  private lastTimestamp = 0;

  // Simulation state
  private variantId: SoldierVariantId = 'assault';
  private animationMode: AnimationMode = 'walk';
  private walkSpeed = 1.0;
  private timeScale = 1.0;
  private gaitPhase = 0;
  private patrolAngle = 0;
  private isRagdoll = false;
  private hp = SOLDIER_VARIANTS.assault.maxHp;
  private maxHp = SOLDIER_VARIANTS.assault.maxHp;
  private hitCount = 0;
  private lastHitLabel: string | null = null;
  private lastHitMultiplier: number | null = null;
  private lastDamage: number | null = null;

  // Non-lethal stagger flinch spring
  private flinchPitch = 0;
  private flinchYaw = 0;
  private flinchTimer = 0;

  // Camera transition target
  private camTransition: {
    pos: THREE.Vector3;
    target: THREE.Vector3;
  } | null = null;

  // FX pools
  private readonly particles: ImpactParticle[] = [];
  private readonly tracers: TracerBeam[] = [];
  private readonly particleGeo: THREE.BufferGeometry;
  private readonly particleMat: THREE.MeshBasicMaterial;
  private readonly tracerMat: THREE.LineBasicMaterial;

  // Pointer tracking to separate camera orbit drag from click-to-shoot
  private pointerDownPos = { x: 0, y: 0 };

  constructor(container: HTMLElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: this.isSoftwareGl,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.dataset.testid = 'shooter-range-canvas';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const bgColor = 0x11151b;
    this.scene.background = new THREE.Color(bgColor);
    this.scene.fog = new THREE.FogExp2(bgColor, 0.068);

    // Mandatory studio environment map via RoomEnvironment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    this.scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmrem.dispose();
    this.envDisposable.push(envTarget);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 60);
    this.camera.position.set(...CAMERA_PRESETS.threeQuarter.pos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(...CAMERA_PRESETS.threeQuarter.target);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 1.4;
    this.controls.maxDistance = 9.5;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.addEventListener('start', () => {
      this.camTransition = null;
    });
    this.controls.update();

    this.raycaster = new THREE.Raycaster();
    this.raycaster.layers.set(1);

    this.textures = createProceduralTextures(this.renderer.capabilities.getMaxAnisotropy());
    this.buildLighting();
    this.buildRangeEnvironment();

    this.soldier = buildEnemySoldier(
      this.variantId,
      this.textures.armorBump,
      this.textures.contactShadow
    );
    this.scene.add(this.soldier.root);

    this.ragdoll = new RagdollPhysicsWorld();

    // FX resources
    this.particleGeo = new THREE.SphereGeometry(0.018, 6, 6);
    this.particleMat = new THREE.MeshBasicMaterial({ color: 0xffb020 });
    this.tracerMat = new THREE.LineBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.9,
    });

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.emitTelemetry();
    this.lastTimestamp = performance.now();
    this.startLoop();
  }

  private buildLighting(): void {
    // Cool sky / dark concrete ground fill
    const hemi = new THREE.HemisphereLight(0xa3c4f3, 0x1a1d24, 0.95);
    this.scene.add(hemi);

    // Warm key directional light with tight orthographic shadow frustum
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.35);
    keyLight.position.set(4.5, 6.8, 4.2);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 18;
    const d = 4.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool tactical rim light to carve silhouette against dark range backdrop
    const rimLight = new THREE.DirectionalLight(0x7dd3fc, 1.15);
    rimLight.position.set(-4.0, 3.8, -4.5);
    this.scene.add(rimLight);
  }

  private buildRangeEnvironment(): void {
    // Concrete floor
    this.textures.floorAlbedo.repeat.set(28, 28);
    this.textures.floorRoughness.repeat.set(28, 28);
    const floorGeo = new THREE.PlaneGeometry(76, 76);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: this.textures.floorAlbedo,
      roughnessMap: this.textures.floorRoughness,
      roughness: 0.85,
      metalness: 0.08,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.envDisposable.push(floorGeo, floorMat);

    // Subtle range calibration ring at center
    const ringGeo = new THREE.RingGeometry(0.95, 1.0, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.015;
    this.scene.add(ring);
    this.envDisposable.push(ringGeo, ringMat);

    // Concrete cover blocks matching RANGE_OBSTACLES physics colliders
    const blockMat = new THREE.MeshStandardMaterial({
      color: 0x353c47,
      roughness: 0.78,
      metalness: 0.12,
      bumpMap: this.textures.armorBump,
      bumpScale: 0.006,
    });
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.45,
      metalness: 0.2,
    });
    this.envDisposable.push(blockMat, stripeMat);

    for (const obs of RANGE_OBSTACLES) {
      const [hx, hy, hz] = obs.halfExtents;
      const boxGeo = new THREE.BoxGeometry(hx * 2, hy * 2, hz * 2);
      const block = new THREE.Mesh(boxGeo, blockMat);
      block.position.set(...obs.position);
      block.castShadow = true;
      block.receiveShadow = true;
      this.scene.add(block);

      const capGeo = new THREE.BoxGeometry(hx * 2 + 0.02, 0.04, hz * 2 + 0.02);
      const cap = new THREE.Mesh(capGeo, stripeMat);
      cap.position.set(obs.position[0], obs.position[1] + hy - 0.03, obs.position[2]);
      cap.receiveShadow = true;
      this.scene.add(cap);
      this.envDisposable.push(boxGeo, capGeo);
    }

    // Perimeter tactical range stanchions / distance markers
    const pillarGeo = new THREE.BoxGeometry(0.18, 2.8, 0.28);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x222730,
      roughness: 0.5,
      metalness: 0.65,
    });
    const beaconGeo = new THREE.BoxGeometry(0.06, 0.35, 0.04);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.2,
    });
    this.envDisposable.push(pillarGeo, pillarMat, beaconGeo, beaconMat);

    const pillarCoords: [number, number][] = [
      [-4.2, -4.8],
      [-1.4, -5.2],
      [1.4, -5.2],
      [4.2, -4.8],
    ];
    for (const [px, pz] of pillarCoords) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 1.4, pz);
      p.castShadow = true;
      p.receiveShadow = true;
      this.scene.add(p);

      const b = new THREE.Mesh(beaconGeo, beaconMat);
      b.position.set(px, 2.25, pz + 0.145);
      this.scene.add(b);
    }
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.handleResize);
    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointerup', this.handlePointerUp);
  }

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = Math.max(this.container.clientWidth, 1);
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handlePointerDown = (e: PointerEvent): void => {
    this.pointerDownPos.x = e.clientX;
    this.pointerDownPos.y = e.clientY;
  };

  private handlePointerUp = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    const dx = e.clientX - this.pointerDownPos.x;
    const dy = e.clientY - this.pointerDownPos.y;
    if (Math.hypot(dx, dy) > 6) return; // Was an orbit drag, not a shot click

    const rect = this.renderer.domElement.getBoundingClientRect();
    _pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.fireRayShot(_pointerNdc);
  };

  private fireRayShot(ndc: THREE.Vector2): void {
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.soldier.hitboxMeshes, false);

    // Always spawn tracer from slightly below camera center toward shot ray
    const rayOrigin = this.camera.position;
    const rayDir = this.raycaster.ray.direction;

    if (hits.length === 0) {
      _v3A.copy(rayOrigin).addScaledVector(rayDir, 12);
      this.spawnTracer(rayOrigin, _v3A);
      return;
    }

    const hit = hits[0];
    const boneId = (hit.object.userData.boneId as BoneId) || 'torso';
    this.spawnTracer(rayOrigin, hit.point);
    this.spawnImpactSparks(hit.point, rayDir);

    this.applyHitToBone(
      boneId,
      [hit.point.x, hit.point.y, hit.point.z],
      [rayDir.x, rayDir.y, rayDir.z],
      50
    );
  }

  public fireSimulatedBurst(targetBone?: BoneId): void {
    const boneId: BoneId = targetBone ?? (Math.random() < 0.35 ? 'head' : 'torso');
    const boneObj = this.soldier.bones[boneId];
    boneObj.getWorldPosition(_v3A);
    const spec = BONE_SPECS[boneId];
    _v3B.set(...spec.comOffset).applyQuaternion(boneObj.getWorldQuaternion(_qA));
    _v3A.add(_v3B);

    _v3C.copy(_v3A).sub(this.camera.position).normalize();
    this.spawnTracer(this.camera.position, _v3A);
    this.spawnImpactSparks(_v3A, _v3C);

    this.applyHitToBone(
      boneId,
      [_v3A.x, _v3A.y, _v3A.z],
      [_v3C.x, _v3C.y, _v3C.z],
      100
    );
  }

  private applyHitToBone(
    boneId: BoneId,
    hitPoint: [number, number, number],
    direction: [number, number, number],
    baseDamage: number
  ): void {
    const spec = BONE_SPECS[boneId];
    const damage = computeHitDamage(baseDamage, boneId);
    this.hitCount += 1;
    this.lastHitLabel = spec.labelRu;
    this.lastHitMultiplier = spec.damageMultiplier;
    this.lastDamage = damage;
    this.soldier.flashHit(boneId);

    if (!this.isRagdoll) {
      this.hp = Math.max(0, this.hp - damage);
      if (this.hp <= 0) {
        this.triggerRagdoll(boneId, hitPoint, direction, boneId === 'head' ? 36 : 48);
      } else {
        // Non-lethal stagger flinch
        this.flinchTimer = 0.24;
        this.flinchPitch = boneId === 'head' ? -0.35 : -0.22;
        this.flinchYaw = (Math.random() - 0.5) * 0.32;
      }
    } else {
      // Already in ragdoll: apply ballistic impulse on hit bone
      const force = boneId === 'head' ? 30 : 42;
      this.ragdoll.applyBallisticImpulse(boneId, hitPoint, direction, force);
    }

    this.emitTelemetry();
  }

  public triggerRagdoll(
    hitBone: BoneId = 'torso',
    hitPoint?: [number, number, number],
    direction?: [number, number, number],
    impulse = 44
  ): void {
    if (!this.isRagdoll) {
      this.hp = 0;
      this.isRagdoll = true;

      const transforms = this.captureWorldBoneTransforms();
      const rifleWorldPos = new THREE.Vector3();
      const rifleWorldQuat = new THREE.Quaternion();
      this.soldier.rifleGroup.getWorldPosition(rifleWorldPos);
      this.soldier.rifleGroup.getWorldQuaternion(rifleWorldQuat);

      // Detach rifle into world space so it tumbles independently
      this.scene.attach(this.soldier.rifleGroup);

      this.ragdoll.enterRagdoll(
        transforms,
        [rifleWorldPos.x, rifleWorldPos.y, rifleWorldPos.z],
        [rifleWorldQuat.x, rifleWorldQuat.y, rifleWorldQuat.z, rifleWorldQuat.w],
        1 / 60
      );

      // Fade contact shadow smoothly when lying flat
      this.soldier.contactShadow.visible = false;
    }

    const boneBody = this.ragdoll.boneBodies.get(hitBone)!.body;
    const p: [number, number, number] = hitPoint ?? [
      boneBody.position.x,
      boneBody.position.y,
      boneBody.position.z,
    ];
    const dir: [number, number, number] = direction ?? [0.18, 0.25, -0.95];
    this.ragdoll.applyBallisticImpulse(hitBone, p, dir, impulse);
    this.emitTelemetry();
  }

  public triggerShockwave(): void {
    if (!this.isRagdoll) {
      this.hp = 0;
      this.lastHitLabel = 'Ударная волна';
      this.lastHitMultiplier = 1.0;
      this.lastDamage = this.maxHp;
      this.triggerRagdoll('pelvis', [0, 0.4, 0.6], [0, 0.5, -1], 10);
    }
    const pelvis = this.ragdoll.boneBodies.get('pelvis')!.body;
    this.ragdoll.applyShockwave(
      [pelvis.position.x + 0.45, 0.15, pelvis.position.z + 0.85],
      9.2
    );
    this.emitTelemetry();
  }

  public respawn(): void {
    this.isRagdoll = false;
    this.ragdoll.reset();
    this.hp = this.maxHp;
    this.flinchTimer = 0;
    this.flinchPitch = 0;
    this.flinchYaw = 0;

    // Reattach rifle to right hand mount
    this.soldier.rifleAttachmentMount.add(this.soldier.rifleGroup);
    this.soldier.rifleGroup.position.set(0, 0, 0);
    this.soldier.rifleGroup.rotation.set(0, 0, 0);

    // Reset root transform and bone pivots
    this.soldier.root.position.set(0, 0, 0);
    this.soldier.root.rotation.set(0, 0, 0);
    this.patrolAngle = 0;
    for (const boneId of BONE_ORDER) {
      const spec = BONE_SPECS[boneId];
      this.soldier.bones[boneId].position.set(...spec.pivotOffset);
      this.soldier.bones[boneId].rotation.set(0, 0, 0);
    }
    this.soldier.contactShadow.visible = true;
    this.applyKinematicPose(0);
    this.emitTelemetry();
  }

  public setAnimationMode(mode: AnimationMode): void {
    this.animationMode = mode;
    if (this.isRagdoll) {
      this.respawn();
    }
  }

  public setWalkSpeed(speed: number): void {
    this.walkSpeed = speed;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = scale;
  }

  public setVariant(variantId: SoldierVariantId): void {
    this.variantId = variantId;
    this.soldier.applyVariant(variantId);
    const v = SOLDIER_VARIANTS[variantId];
    this.maxHp = v.maxHp;
    if (!this.isRagdoll) {
      this.hp = Math.min(this.hp, this.maxHp);
      if (this.hp === SOLDIER_VARIANTS.assault.maxHp || this.hp === SOLDIER_VARIANTS.recon.maxHp || this.hp === SOLDIER_VARIANTS.heavy.maxHp) {
        this.hp = this.maxHp;
      }
    }
    this.emitTelemetry();
  }

  public setDebugVisible(visible: boolean): void {
    this.soldier.setDebugVisible(visible);
  }

  public setCameraPreset(presetId: CameraPresetId): void {
    const preset = CAMERA_PRESETS[presetId];
    if (this.isSoftwareGl) {
      this.camera.position.set(...preset.pos);
      this.controls.target.set(...preset.target);
      this.controls.update();
      return;
    }
    this.camTransition = {
      pos: new THREE.Vector3(...preset.pos),
      target: new THREE.Vector3(...preset.target),
    };
  }

  private captureWorldBoneTransforms(): Record<BoneId, WorldBoneTransform> {
    this.soldier.root.updateMatrixWorld(true);
    const result = {} as Record<BoneId, WorldBoneTransform>;
    for (const boneId of BONE_ORDER) {
      const obj = this.soldier.bones[boneId];
      obj.getWorldPosition(_v3A);
      obj.getWorldQuaternion(_qA);
      result[boneId] = {
        pivotPos: [_v3A.x, _v3A.y, _v3A.z],
        worldQuat: [_qA.x, _qA.y, _qA.z, _qA.w],
      };
    }
    return result;
  }

  private applyKinematicPose(dt: number): void {
    const scaledDt = dt * this.timeScale;

    if (this.animationMode === 'patrol') {
      this.patrolAngle += scaledDt * 0.55 * this.walkSpeed;
      const rx = 1.05;
      const rz = 1.55;
      const px = Math.sin(this.patrolAngle) * rx;
      const pz = Math.sin(this.patrolAngle * 2) * rz * 0.5;
      const vx = Math.cos(this.patrolAngle) * rx;
      const vz = Math.cos(this.patrolAngle * 2) * rz;
      this.soldier.root.position.set(px, 0, pz);
      this.soldier.root.rotation.y = Math.atan2(vx, vz);
    } else if (this.animationMode === 'walk') {
      // Smoothly return root to center origin for 360° inspection
      const alpha = 1 - Math.exp(-6 * dt);
      this.soldier.root.position.lerp(_v3A.set(0, 0, 0), alpha);
      this.soldier.root.rotation.y = THREE.MathUtils.damp(this.soldier.root.rotation.y, 0, 6, dt);
    }

    const cycleRate = this.animationMode === 'idle' ? 1.4 : 5.4 * this.walkSpeed;
    this.gaitPhase += scaledDt * cycleRate;

    const pose = computeCharacterPose(this.gaitPhase, this.walkSpeed, this.animationMode);

    // Update flinch spring
    if (this.flinchTimer > 0) {
      this.flinchTimer = Math.max(0, this.flinchTimer - dt);
    } else {
      this.flinchPitch = THREE.MathUtils.damp(this.flinchPitch, 0, 12, dt);
      this.flinchYaw = THREE.MathUtils.damp(this.flinchYaw, 0, 12, dt);
    }
    const flinchFactor = this.flinchTimer > 0 ? this.flinchTimer / 0.24 : 1;

    const pelvisSpec = BONE_SPECS.pelvis;
    this.soldier.bones.pelvis.position.set(
      pelvisSpec.pivotOffset[0] + pose.pelvisOffsetX,
      pelvisSpec.pivotOffset[1] + pose.pelvisOffsetY,
      pelvisSpec.pivotOffset[2]
    );

    for (const boneId of BONE_ORDER) {
      const bPose = pose.bones[boneId];
      const boneObj = this.soldier.bones[boneId];
      let rx = bPose.rot[0];
      let ry = bPose.rot[1];
      const rz = bPose.rot[2];

      if (boneId === 'torso') {
        rx += this.flinchPitch * flinchFactor;
        ry += this.flinchYaw * flinchFactor;
      } else if (boneId === 'head') {
        rx += this.flinchPitch * 0.7 * flinchFactor;
      }

      boneObj.rotation.set(rx, ry, rz);
    }

    // Record kinematic velocities into ragdoll engine so death transitions inherit momentum
    const worldTransforms = this.captureWorldBoneTransforms();
    this.soldier.rifleGroup.getWorldPosition(_v3A);
    this.soldier.rifleGroup.getWorldQuaternion(_qA);
    this.ragdoll.recordKinematicPose(
      worldTransforms,
      [_v3A.x, _v3A.y, _v3A.z],
      [_qA.x, _qA.y, _qA.z, _qA.w],
      Math.max(scaledDt, 1 / 120)
    );
  }

  private syncRagdollToVisuals(): void {
    this.soldier.root.updateMatrixWorld(true);

    // Topological order ensures parent world matrices are updated before computing child local transforms
    for (const boneId of BONE_ORDER) {
      const state = this.ragdoll.boneBodies.get(boneId)!;
      const spec = BONE_SPECS[boneId];
      const boneObj = this.soldier.bones[boneId];

      _qA.set(
        state.body.quaternion.x,
        state.body.quaternion.y,
        state.body.quaternion.z,
        state.body.quaternion.w
      );
      _v3A.set(...spec.comOffset).applyQuaternion(_qA);
      // Desired pivot world position = bodyCOM - rotatedComOffset
      _v3B.set(
        state.body.position.x - _v3A.x,
        state.body.position.y - _v3A.y,
        state.body.position.z - _v3A.z
      );

      const parentObj = boneObj.parent!;
      parentObj.updateMatrixWorld(false);
      _m4ParentInv.copy(parentObj.matrixWorld).invert();
      _v3B.applyMatrix4(_m4ParentInv);
      boneObj.position.copy(_v3B);

      parentObj.getWorldQuaternion(_qB);
      _qC.copy(_qB).invert().multiply(_qA);
      boneObj.quaternion.copy(_qC);
      boneObj.updateMatrix();
      _m4World.multiplyMatrices(parentObj.matrixWorld, boneObj.matrix);
      boneObj.matrixWorld.copy(_m4World);
    }

    // Sync detached rifle rigid body
    this.soldier.rifleGroup.position.set(
      this.ragdoll.rifleBody.position.x,
      this.ragdoll.rifleBody.position.y,
      this.ragdoll.rifleBody.position.z
    );
    this.soldier.rifleGroup.quaternion.set(
      this.ragdoll.rifleBody.quaternion.x,
      this.ragdoll.rifleBody.quaternion.y,
      this.ragdoll.rifleBody.quaternion.z,
      this.ragdoll.rifleBody.quaternion.w
    );
  }

  private spawnTracer(start: THREE.Vector3, end: THREE.Vector3): void {
    // Offset origin slightly down-right so tracer reads like a shooter barrel shot
    const origin = start.clone().add(new THREE.Vector3(0.18, -0.14, 0));
    const geo = new THREE.BufferGeometry().setFromPoints([origin, end.clone()]);
    const line = new THREE.Line(geo, this.tracerMat);
    this.scene.add(line);
    this.tracers.push({ line, life: 0.09 });
  }

  private spawnImpactSparks(point: THREE.Vector3, dir: THREE.Vector3): void {
    for (let i = 0; i < 6; i++) {
      const mesh = new THREE.Mesh(this.particleGeo, this.particleMat);
      mesh.position.copy(point);
      const vel = new THREE.Vector3(
        -dir.x * 1.4 + (Math.random() - 0.5) * 2.6,
        1.1 + Math.random() * 2.2,
        -dir.z * 1.4 + (Math.random() - 0.5) * 2.6
      );
      this.scene.add(mesh);
      this.particles.push({ mesh, vel, life: 0.28 + Math.random() * 0.14 });
    }
  }

  private updateFx(dt: number): void {
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.life -= dt;
      if (t.life <= 0) {
        this.scene.remove(t.line);
        t.line.geometry.dispose();
        this.tracers.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
      } else {
        p.vel.y -= 9.8 * dt;
        p.mesh.position.addScaledVector(p.vel, dt);
        const s = Math.max(0.1, p.life / 0.4);
        p.mesh.scale.setScalar(s);
      }
    }
  }

  private emitTelemetry(): void {
    this.callbacks.onTelemetry({
      hp: this.hp,
      maxHp: this.maxHp,
      isRagdoll: this.isRagdoll,
      lastHitLabel: this.lastHitLabel,
      lastHitMultiplier: this.lastHitMultiplier,
      lastDamage: this.lastDamage,
      hitCount: this.hitCount,
    });
  }

  private startLoop(): void {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (this.disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(() => {
            if (!this.disposed) {
              this.frameId = requestAnimationFrame(cb);
            }
          }, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (this.disposed) return;
      const now = performance.now();
      const dt = Math.min((now - this.lastTimestamp) / 1000, 0.05);
      this.lastTimestamp = now;

      // Damped camera preset transition
      if (this.camTransition) {
        const lambda = 7;
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.camTransition.pos.x, lambda, dt);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.camTransition.pos.y, lambda, dt);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.camTransition.pos.z, lambda, dt);
        this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, this.camTransition.target.x, lambda, dt);
        this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, this.camTransition.target.y, lambda, dt);
        this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, this.camTransition.target.z, lambda, dt);

        if (this.camera.position.distanceTo(this.camTransition.pos) < 0.02) {
          this.camTransition = null;
        }
      }

      this.controls.update();

      if (!this.isRagdoll) {
        this.applyKinematicPose(dt);
      } else {
        this.ragdoll.step(dt, this.timeScale);
        this.syncRagdollToVisuals();
      }

      this.soldier.updateFlash(dt);
      this.updateFx(dt);

      this.renderer.render(this.scene, this.camera);
      this.renderer.domElement.dataset.renderCalls = String(this.renderer.info.render.calls);
      this.renderer.domElement.dataset.triangles = String(this.renderer.info.render.triangles);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.handlePointerDown);
    canvas.removeEventListener('pointerup', this.handlePointerUp);

    for (const t of this.tracers) {
      this.scene.remove(t.line);
      t.line.geometry.dispose();
    }
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
    }
    this.particleGeo.dispose();
    this.particleMat.dispose();
    this.tracerMat.dispose();

    this.soldier.dispose();
    this.textures.dispose();
    for (const item of this.envDisposable) item.dispose();
    this.controls.dispose();
    this.renderer.dispose();
    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
