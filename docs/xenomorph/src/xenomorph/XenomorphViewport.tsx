import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createProceduralTextures } from './proceduralTextures';
import {
  ARENA_OBSTACLES,
  ARENA_RADIUS,
  CRAWL_ARCH_HALF_WIDTH,
  CRAWL_CEILING_Y,
  CRAWL_Z,
  applyRagdollImpulse,
  getZoneDamageMultiplier,
  stepRagdoll,
} from './ragdollPhysics';
import { SoundSynth } from './soundEffects';
import type {
  CameraMode,
  HitZone,
  InteractionMode,
  RagdollNodeId,
  XenomorphAnimState,
  XenomorphHudSnapshot,
} from './types';
import { XenomorphAnimator } from './xenomorphAnimations';
import { createXenomorphRig } from './xenomorphRig';

export interface XenomorphViewportHandle {
  setAnimState: (state: XenomorphAnimState) => void;
  respawn: () => void;
  setMode: (mode: InteractionMode) => void;
  setCameraMode: (mode: CameraMode) => void;
  setShowPhysicsDebug: (show: boolean) => void;
  setMuted: (muted: boolean) => void;
  setSpeedMultiplier: (speed: number) => void;
  fireAtCenter: () => void;
}

interface XenomorphViewportProps {
  onHudUpdate: (snapshot: XenomorphHudSnapshot) => void;
  onHitMarker: (zone: HitZone, damage: number, killed: boolean) => void;
}

interface PooledParticle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

const MAX_HP = 180;
const PARTICLE_COUNT = 128;

// Pre-allocated scratch math helpers (zero GC inside tick)
const _scratchV1 = new THREE.Vector3();
const _scratchV2 = new THREE.Vector3();
const _scratchDir = new THREE.Vector3();
const _scratchMat = new THREE.Matrix4();
const _scratchQuat = new THREE.Quaternion();
const _scratchScale = new THREE.Vector3();
const _shadowDefaultUp = new THREE.Vector3(0, 0, 1);
const _ndc = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
}

export const XenomorphViewport = forwardRef<
  XenomorphViewportHandle,
  XenomorphViewportProps
>(function XenomorphViewport({ onHudUpdate, onHitMarker }, ref) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const callbacksRef = useRef({ onHudUpdate, onHitMarker });
  callbacksRef.current = { onHudUpdate, onHitMarker };

  const controllerRef = useRef<{
    setAnimState: (s: XenomorphAnimState) => void;
    respawn: () => void;
    setMode: (m: InteractionMode) => void;
    setCameraMode: (c: CameraMode) => void;
    setShowPhysicsDebug: (v: boolean) => void;
    setMuted: (m: boolean) => void;
    setSpeedMultiplier: (s: number) => void;
    fireRayFromNdc: (nx: number, ny: number) => void;
  } | null>(null);

  useImperativeHandle(ref, () => ({
    setAnimState: (s) => controllerRef.current?.setAnimState(s),
    respawn: () => controllerRef.current?.respawn(),
    setMode: (m) => controllerRef.current?.setMode(m),
    setCameraMode: (c) => controllerRef.current?.setCameraMode(c),
    setShowPhysicsDebug: (v) => controllerRef.current?.setShowPhysicsDebug(v),
    setMuted: (m) => controllerRef.current?.setMuted(m),
    setSpeedMultiplier: (s) => controllerRef.current?.setSpeedMultiplier(s),
    fireAtCenter: () => controllerRef.current?.fireRayFromNdc(0, 0),
  }));

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: isSoftwareGl,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const bgHex = 0x05090e;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.028);

    // Mandatory Studio Reflection Environment (RoomEnvironment on every device)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(
      46,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      120,
    );
    camera.position.set(2.8, 1.55, 3.7);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.0, 0.05);
    controls.minDistance = 1.8;
    controls.maxDistance = 18.0;
    controls.maxPolarAngle = Math.PI * 0.485;

    // Spaceship Corridor Cool-White / Ice-Cyan Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xe0f2fe, 2.5);
    keyLight.position.set(5, 10, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.camera.left = -11;
    keyLight.shadow.camera.right = 11;
    keyLight.shadow.camera.top = 11;
    keyLight.shadow.camera.bottom = -11;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.25);
    rimLight.position.set(-5, 4.5, -7);
    scene.add(rimLight);

    const corridorFill = new THREE.PointLight(0x93c5fd, 3.2, 18, 1.5);
    corridorFill.position.set(0, 5.2, 0);
    scene.add(corridorFill);

    // Procedural Textures
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);

    // --- Sci-Fi Spaceship Containment Corridor Arena ---
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const outerFloorGeo = new THREE.PlaneGeometry(140, 140);
    const outerFloorMat = new THREE.MeshStandardMaterial({
      color: 0x060a0f,
      roughness: 0.85,
      metalness: 0.25,
    });
    const outerFloor = new THREE.Mesh(outerFloorGeo, outerFloorMat);
    outerFloor.rotation.x = -Math.PI / 2;
    outerFloor.position.y = -0.02;
    arenaGroup.add(outerFloor);

    const deckGeo = new THREE.CircleGeometry(ARENA_RADIUS + 2.4, 48);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0xbcd0e4,
      map: textures.floorAlbedo,
      bumpMap: textures.floorBump,
      bumpScale: 0.022,
      roughnessMap: textures.floorRoughness,
      roughness: 0.34,
      metalness: 0.72,
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.rotation.x = -Math.PI / 2;
    deckMesh.position.y = 0;
    deckMesh.receiveShadow = !isSoftwareGl;
    arenaGroup.add(deckMesh);

    // Perimeter Warning & LED Floor Trim Ring
    const ringGeo = new THREE.RingGeometry(ARENA_RADIUS - 0.12, ARENA_RADIUS + 0.06, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      roughness: 0.35,
      metalness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = 0.008;
    arenaGroup.add(ringMesh);

    // Angled Octagonal Sci-Fi Corridor Bulkhead Ribs + Cool-White/Cyan LED Light Bars
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x131b26,
      roughness: 0.45,
      metalness: 0.74,
    });
    const pillarTrimMat = new THREE.MeshStandardMaterial({
      color: 0x283548,
      roughness: 0.3,
      metalness: 0.85,
    });
    const ledStripMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x7dd3fc,
      emissiveIntensity: 2.3,
      roughness: 0.15,
    });

    const pillarBaseGeo = new THREE.BoxGeometry(1.1, 3.2, 0.85);
    const pillarUpperArchGeo = new THREE.BoxGeometry(1.05, 3.4, 0.75);
    const pillarCapGeo = new THREE.BoxGeometry(1.3, 0.36, 1.15);
    const pillarStripGeo = new THREE.BoxGeometry(0.18, 2.5, 0.08);
    const ceilingStripGeo = new THREE.BoxGeometry(0.18, 2.7, 0.08);
    const pillarCount = 8;
    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2 + Math.PI / 8;
      const dist = ARENA_RADIUS + 1.15;
      const pGroup = new THREE.Group();
      pGroup.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      pGroup.rotation.y = -angle + Math.PI / 2;

      const body = new THREE.Mesh(pillarBaseGeo, pillarMat);
      body.position.y = 1.6;
      body.castShadow = !isSoftwareGl;
      body.receiveShadow = !isSoftwareGl;
      pGroup.add(body);

      const foot = new THREE.Mesh(pillarCapGeo, pillarTrimMat);
      foot.position.y = 0.18;
      pGroup.add(foot);

      // Angled octagonal upper bulkhead rib leaning inward overhead
      const upperRib = new THREE.Mesh(pillarUpperArchGeo, pillarMat);
      upperRib.position.set(0, 4.35, -0.82);
      upperRib.rotation.x = 0.52;
      pGroup.add(upperRib);

      // Vertical glowing cyan/white corridor LED strip
      const vStrip = new THREE.Mesh(pillarStripGeo, ledStripMat);
      vStrip.position.set(0, 1.75, -0.44);
      pGroup.add(vStrip);

      // Angled overhead ceiling LED strip
      const cStrip = new THREE.Mesh(ceilingStripGeo, ledStripMat);
      cStrip.position.set(0, 4.2, -1.16);
      cStrip.rotation.x = 0.52;
      pGroup.add(cStrip);

      arenaGroup.add(pGroup);
    }

    // Open-Ended Arched Containment Corridor Walls & Overhead Ceiling (for Wall & Ceiling Crawl!)
    const archWallX = CRAWL_ARCH_HALF_WIDTH + 0.08; // 6.53
    const archCeilY = CRAWL_CEILING_Y + 0.08; // 5.13
    const archCenterZ = CRAWL_Z - 0.55; // spans z = -1.2 to +2.6 (clear front/back view!)
    const archDepth = 3.8;

    const corridorPanelMat = new THREE.MeshStandardMaterial({
      color: 0x263242,
      map: textures.floorAlbedo,
      bumpMap: textures.floorBump,
      bumpScale: 0.018,
      roughness: 0.48,
      metalness: 0.72,
    });

    const archGeos: THREE.BufferGeometry[] = [];
    const trackArchGeo = <T extends THREE.BufferGeometry>(g: T): T => {
      archGeos.push(g);
      return g;
    };

    // Left & Right Structural Wall Panels
    const sideWallGeo = trackArchGeo(new THREE.BoxGeometry(0.18, archCeilY - 0.85, archDepth));
    for (const side of [-1, 1]) {
      const wall = new THREE.Mesh(sideWallGeo, corridorPanelMat);
      wall.position.set(side * (archWallX + 0.09), (archCeilY - 0.85) * 0.5, archCenterZ);
      wall.receiveShadow = !isSoftwareGl;
      arenaGroup.add(wall);
    }

    // Overhead Ribbed Ceiling Deck Slab
    const ceilSlabGeo = trackArchGeo(new THREE.BoxGeometry(archWallX * 2 - 1.6, 0.18, archDepth));
    const ceilSlab = new THREE.Mesh(ceilSlabGeo, corridorPanelMat);
    ceilSlab.position.set(0, archCeilY + 0.09, archCenterZ);
    arenaGroup.add(ceilSlab);

    // Upper Chamfered Corner Bulkheads connecting Walls -> Ceiling
    const cornerPanelGeo = trackArchGeo(new THREE.BoxGeometry(0.16, 1.56, archDepth));
    for (const side of [-1, 1]) {
      const corner = new THREE.Mesh(cornerPanelGeo, pillarMat);
      corner.position.set(side * (archWallX - 0.42), archCeilY - 0.42, archCenterZ);
      corner.rotation.z = side * (Math.PI / 4);
      arenaGroup.add(corner);
    }

    // 4 Arched Corridor Structural Ribs + Glowing Cyan Ceiling/Wall LED Light Strips
    const archVertGeo = trackArchGeo(new THREE.BoxGeometry(0.32, archCeilY - 0.9, 0.28));
    const archDiagGeo = trackArchGeo(new THREE.BoxGeometry(0.32, 1.65, 0.28));
    const archTopGeo = trackArchGeo(new THREE.BoxGeometry(archWallX * 2 - 1.8, 0.3, 0.28));
    const archLedVertGeo = trackArchGeo(new THREE.BoxGeometry(0.08, 2.5, 0.12));
    const archLedCeilGeo = trackArchGeo(new THREE.BoxGeometry(3.6, 0.08, 0.14));

    const ribZs = [archCenterZ - 1.75, archCenterZ - 0.58, archCenterZ + 0.58, archCenterZ + 1.75];
    for (const rz of ribZs) {
      for (const side of [-1, 1]) {
        const vRib = new THREE.Mesh(archVertGeo, pillarTrimMat);
        vRib.position.set(side * (archWallX - 0.1), (archCeilY - 0.9) * 0.5, rz);
        arenaGroup.add(vRib);

        const dRib = new THREE.Mesh(archDiagGeo, pillarTrimMat);
        dRib.position.set(side * (archWallX - 0.52), archCeilY - 0.52, rz);
        dRib.rotation.z = side * (Math.PI / 4);
        arenaGroup.add(dRib);

        const vLed = new THREE.Mesh(archLedVertGeo, ledStripMat);
        vLed.position.set(side * (archWallX - 0.26), 2.15, rz);
        arenaGroup.add(vLed);
      }

      const tRib = new THREE.Mesh(archTopGeo, pillarTrimMat);
      tRib.position.set(0, archCeilY - 0.1, rz);
      arenaGroup.add(tRib);

      const cLed = new THREE.Mesh(archLedCeilGeo, ledStripMat);
      cLed.position.set(0, archCeilY - 0.24, rz);
      arenaGroup.add(cLed);
    }

    // Physical Cover Crates (shared directly with ARENA_OBSTACLES so Ragdoll drapes over them!)
    const crateMat = new THREE.MeshStandardMaterial({
      color: 0xd0dce8,
      map: textures.crateAlbedo,
      roughness: 0.5,
      metalness: 0.55,
    });
    const crateTrimMat = new THREE.MeshStandardMaterial({
      color: 0x2c3a4c,
      roughness: 0.32,
      metalness: 0.82,
    });
    const crateGeos: THREE.BufferGeometry[] = [];
    for (const box of ARENA_OBSTACLES) {
      const w = box.maxX - box.minX;
      const h = box.maxY - box.minY;
      const d = box.maxZ - box.minZ;
      const cGroup = new THREE.Group();
      cGroup.position.set(
        (box.minX + box.maxX) * 0.5,
        box.minY,
        (box.minZ + box.maxZ) * 0.5,
      );

      const cGeo = new THREE.BoxGeometry(w, h, d);
      crateGeos.push(cGeo);
      const crateMesh = new THREE.Mesh(cGeo, crateMat);
      crateMesh.position.y = h * 0.5;
      crateMesh.castShadow = !isSoftwareGl;
      crateMesh.receiveShadow = !isSoftwareGl;
      cGroup.add(crateMesh);

      const lidGeo = new THREE.BoxGeometry(w + 0.08, 0.09, d + 0.08);
      crateGeos.push(lidGeo);
      const lidMesh = new THREE.Mesh(lidGeo, crateTrimMat);
      lidMesh.position.y = h - 0.045;
      cGroup.add(lidMesh);

      arenaGroup.add(cGroup);
    }

    // Contact shadow disc under the Xenomorph
    const contactShadowGeo = new THREE.CircleGeometry(1.15, 24);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.y = 0.015;
    scene.add(contactShadowMesh);

    // --- Xenomorph Rig & Animator ---
    const rig = createXenomorphRig(textures, isSoftwareGl);
    scene.add(rig.group);
    scene.add(rig.ragdollWorldGroup);

    const animator = new XenomorphAnimator();
    const sound = new SoundSynth();

    // --- Pooled Acid Blood & Spark Particle Ring Buffer (InstancedMesh) ---
    const particleGeo = new THREE.IcosahedronGeometry(0.036, 0);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const particleInstanced = new THREE.InstancedMesh(
      particleGeo,
      particleMat,
      PARTICLE_COUNT,
    );
    particleInstanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particleInstanced.frustumCulled = false;
    scene.add(particleInstanced);

    const particles: PooledParticle[] = Array.from(
      { length: PARTICLE_COUNT },
      () => ({
        active: false,
        x: 0,
        y: -10,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 0.5,
        size: 1,
        color: new THREE.Color(0x84cc16),
      }),
    );
    let particleCursor = 0;

    // Hide all particles initially
    _scratchMat.makeScale(0, 0, 0);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleInstanced.setMatrixAt(i, _scratchMat);
      particleInstanced.setColorAt(i, particles[i].color);
    }
    particleInstanced.instanceMatrix.needsUpdate = true;
    if (particleInstanced.instanceColor) {
      particleInstanced.instanceColor.needsUpdate = true;
    }

    const spawnParticles = (
      ox: number,
      oy: number,
      oz: number,
      count: number,
      hex: number,
      speed = 4.2,
    ) => {
      for (let i = 0; i < count; i++) {
        const p = particles[particleCursor];
        particleCursor = (particleCursor + 1) % PARTICLE_COUNT;
        p.active = true;
        p.x = ox;
        p.y = oy;
        p.z = oz;
        const theta = Math.random() * Math.PI * 2;
        const up = 0.25 + Math.random() * 0.95;
        const spd = speed * (0.45 + Math.random() * 0.85);
        p.vx = Math.cos(theta) * spd * 0.7;
        p.vy = up * spd;
        p.vz = Math.sin(theta) * spd * 0.7;
        p.life = 0;
        p.maxLife = 0.35 + Math.random() * 0.45;
        p.size = 0.7 + Math.random() * 1.1;
        p.color.setHex(hex);
      }
    };

    const spawnAcidSpit = (
      ox: number,
      oy: number,
      oz: number,
      dx: number,
      dy: number,
      dz: number,
      count: number,
      speed: number,
    ) => {
      for (let i = 0; i < count; i++) {
        const p = particles[particleCursor];
        particleCursor = (particleCursor + 1) % PARTICLE_COUNT;
        p.active = true;
        p.x = ox + (Math.random() - 0.5) * 0.04;
        p.y = oy + (Math.random() - 0.5) * 0.03;
        p.z = oz + (Math.random() - 0.5) * 0.04;
        const spd = speed * (0.65 + Math.random() * 0.55);
        p.vx = dx * spd + (Math.random() - 0.5) * 0.65;
        p.vy = dy * spd + (Math.random() - 0.5) * 0.45;
        p.vz = dz * spd + (Math.random() - 0.5) * 0.65;
        p.life = 0;
        p.maxLife = 0.28 + Math.random() * 0.35;
        p.size = 0.55 + Math.random() * 0.85;
        p.color.setHex(i % 3 === 0 ? 0xa3ff33 : 0x65e815);
      }
    };

    // Pulse Rifle Tracer Line
    const tracerGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    const tracerMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
    });
    const tracerLine = new THREE.Line(tracerGeo, tracerMat);
    tracerLine.frustumCulled = false;
    scene.add(tracerLine);
    let tracerLife = 0;

    // --- Physics / Ragdoll Debug Overlay (Bone Links + Joint Nodes) ---
    const debugGroup = new THREE.Group();
    debugGroup.visible = false;
    scene.add(debugGroup);

    const maxDebugSegments = 38;
    const debugLinePos = new Float32Array(maxDebugSegments * 6);
    const debugLineGeo = new THREE.BufferGeometry();
    debugLineGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(debugLinePos, 3),
    );
    const debugLineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8 });
    const debugLines = new THREE.LineSegments(debugLineGeo, debugLineMat);
    debugLines.frustumCulled = false;
    debugGroup.add(debugLines);

    const nodeJointGeo = new THREE.SphereGeometry(0.052, 8, 6);
    const nodeJointMat = new THREE.MeshBasicMaterial({ color: 0xa3e635 });
    const debugJointsMesh = new THREE.InstancedMesh(
      nodeJointGeo,
      nodeJointMat,
      rig.ragdoll.nodeOrder.length,
    );
    debugJointsMesh.frustumCulled = false;
    debugGroup.add(debugJointsMesh);

    // --- Runtime Simulation State ---
    let interactionMode: InteractionMode = 'showcase';
    let cameraMode: CameraMode = 'orbit';
    let showPhysicsDebug = false;
    let speedMultiplier = 1;
    let hp = MAX_HP;
    let kills = 0;
    let shotsFired = 0;
    let shotsHit = 0;
    let lastHitZone: HitZone | null = null;
    let lastDamage = 0;
    let hitFlashTimer = 0;
    let hitstopTimer = 0;
    let cameraTrauma = 0;
    let lastHudSync = 0;

    const raycaster = new THREE.Raycaster();

    const syncHud = (force = false) => {
      const now = performance.now();
      if (!force && now - lastHudSync < 100) return;
      lastHudSync = now;
      callbacksRef.current.onHudUpdate({
        animState: animator.state,
        mode: interactionMode,
        cameraMode,
        hp,
        maxHp: MAX_HP,
        kills,
        shotsFired,
        shotsHit,
        lastHitZone,
        lastDamage,
        showPhysicsDebug,
        muted: sound.muted,
        speedMultiplier,
      });
    };

    const fireRayFromNdc = (nx: number, ny: number) => {
      shotsFired += 1;
      sound.playPulseShot();
      cameraTrauma = Math.min(1, cameraTrauma + 0.16);

      _ndc.set(nx, ny);
      raycaster.setFromCamera(_ndc, camera);
      const hits = raycaster.intersectObjects(rig.hitMeshes, false);

      // Show brief muzzle tracer from bottom-right rifle offset to hit or far point
      const tracerStart = _scratchV1
        .set(0.28, -0.22, -0.5)
        .applyMatrix4(camera.matrixWorld);
      const tracerEnd = _scratchV2;
      if (hits.length > 0) {
        tracerEnd.copy(hits[0].point);
      } else {
        tracerEnd
          .copy(raycaster.ray.origin)
          .addScaledVector(raycaster.ray.direction, 22);
      }
      const posAttr = tracerGeo.attributes.position as THREE.BufferAttribute;
      posAttr.setXYZ(0, tracerStart.x, tracerStart.y, tracerStart.z);
      posAttr.setXYZ(1, tracerEnd.x, tracerEnd.y, tracerEnd.z);
      posAttr.needsUpdate = true;
      tracerLife = 0.08;
      tracerMat.opacity = 0.9;

      if (hits.length > 0) {
        const hit = hits[0];
        const zone = (hit.object.userData.hitZone as HitZone) ?? 'torso';
        const nodeId =
          (hit.object.userData.ragdollNode as RagdollNodeId) ?? 'chest';
        const dmg = Math.round(28 * getZoneDamageMultiplier(zone));
        shotsHit += 1;
        lastHitZone = zone;
        lastDamage = dmg;
        hitFlashTimer = 0.075;
        rig.setHitFlash(1);

        // Acid blood spray along surface normal + shot direction
        spawnParticles(
          hit.point.x,
          hit.point.y,
          hit.point.z,
          zone === 'head' ? 24 : 14,
          0x84cc16,
          5.2,
        );
        sound.playAcidHit(zone === 'head');

        const shotImpulse = raycaster.ray.direction
          .clone()
          .multiplyScalar(zone === 'head' ? 14 : 11);
        shotImpulse.y += 2.2;

        if (rig.isRagdollActive) {
          // Shoot dead ragdoll body directly!
          applyRagdollImpulse(rig.ragdoll, nodeId, shotImpulse, 0.85);
          cameraTrauma = Math.min(1, cameraTrauma + 0.14);
          callbacksRef.current.onHitMarker(zone, dmg, false);
        } else if (hp > 0) {
          hp = Math.max(0, hp - dmg);
          const killed = hp === 0;
          if (killed) {
            kills += 1;
            hitstopTimer = 0.048;
            cameraTrauma = Math.min(1, cameraTrauma + 0.55);
            sound.playXenomorphHiss(true);
            animator.setState('death', {
              deathImpulse: shotImpulse.multiplyScalar(1.35),
              deathHitNode: nodeId,
            });
          } else {
            cameraTrauma = Math.min(1, cameraTrauma + 0.22);
          }
          callbacksRef.current.onHitMarker(zone, dmg, killed);
        }
      }
      syncHud(true);
    };

    let autoFrameGoal: {
      camPos: THREE.Vector3;
      target: THREE.Vector3;
    } | null = null;

    const onControlsStart = () => {
      autoFrameGoal = null;
    };
    controls.addEventListener('start', onControlsStart);

    const setAnimState = (next: XenomorphAnimState) => {
      if (next === 'ragdoll') return;
      if (rig.isRagdollActive) {
        animator.reset(rig);
        hp = MAX_HP;
      }
      if (next === 'attack') {
        sound.playXenomorphHiss(true);
      } else if (next === 'leap') {
        sound.playXenomorphHiss(false);
      } else if (next === 'crawl') {
        sound.playXenomorphHiss(false);
        if (interactionMode === 'showcase' && cameraMode === 'orbit') {
          autoFrameGoal = {
            camPos: new THREE.Vector3(0, 2.85, 13.4),
            target: new THREE.Vector3(0, 2.35, CRAWL_Z),
          };
        }
      } else if (next === 'death') {
        hp = 0;
        sound.playXenomorphHiss(true);
      }
      animator.setState(next);
      syncHud(true);
    };

    const respawn = () => {
      animator.reset(rig);
      hp = MAX_HP;
      lastHitZone = null;
      lastDamage = 0;
      hitFlashTimer = 0;
      rig.setHitFlash(0);
      syncHud(true);
    };

    controllerRef.current = {
      setAnimState,
      respawn,
      setMode: (m) => {
        interactionMode = m;
        if (m === 'shooter') {
          cameraMode = 'follow';
        }
        syncHud(true);
      },
      setCameraMode: (c) => {
        cameraMode = c;
        syncHud(true);
      },
      setShowPhysicsDebug: (v) => {
        showPhysicsDebug = v;
        debugGroup.visible = v;
        syncHud(true);
      },
      setMuted: (m) => {
        sound.muted = m;
        syncHud(true);
      },
      setSpeedMultiplier: (s) => {
        speedMultiplier = s;
        syncHud(true);
      },
      fireRayFromNdc,
    };

    // Pointer Shooting in Shooter Mode
    let pointerDownPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
      if (interactionMode === 'shooter' && e.button === 0) {
        const rect = renderer.domElement.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        fireRayFromNdc(nx, ny);
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      // Allow quick click in showcase mode without interfering with orbit drag
      const distMoved = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y,
      );
      if (distMoved < 4 && interactionMode === 'shooter' && e.button === 2) {
        fireRayFromNdc(0, 0);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    // Resize Observer
    const onResize = () => {
      if (!container) return;
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Pre-warm shaders on GPU (skip on software WebGL)
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // --- Main Simulation Loop (GPU rAF / Software-WebGL afterDraw) ---
    let disposed = false;
    let frameId = 0;
    let lastTime = performance.now();
    let prevRagdollFloorHits = 0;
    let acidDripTimer = 0;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const updateDebugOverlay = () => {
      if (!showPhysicsDebug) return;
      const posAttr = debugLineGeo.attributes.position as THREE.BufferAttribute;
      let idx = 0;

      if (rig.isRagdollActive) {
        for (const c of rig.ragdoll.constraints) {
          if (idx >= maxDebugSegments) break;
          const a = rig.ragdoll.nodes[c.a].pos;
          const b = rig.ragdoll.nodes[c.b].pos;
          posAttr.setXYZ(idx * 2, a.x, a.y, a.z);
          posAttr.setXYZ(idx * 2 + 1, b.x, b.y, b.z);
          idx++;
        }
        debugLineGeo.setDrawRange(0, idx * 2);
        posAttr.needsUpdate = true;

        rig.ragdoll.nodeOrder.forEach((id, i) => {
          const p = rig.ragdoll.nodes[id].pos;
          _scratchMat.makeTranslation(p.x, p.y, p.z);
          debugJointsMesh.setMatrixAt(i, _scratchMat);
        });
        debugJointsMesh.instanceMatrix.needsUpdate = true;
      } else {
        rig.group.updateMatrixWorld(true);
        // Draw primary FK bone anchors
        const pairs: Array<[RagdollNodeId, RagdollNodeId]> = [
          ['pelvis', 'chest'],
          ['chest', 'neck'],
          ['neck', 'head'],
          ['head', 'jawTip'],
          ['chest', 'shoulderL'],
          ['shoulderL', 'elbowL'],
          ['elbowL', 'handL'],
          ['chest', 'shoulderR'],
          ['shoulderR', 'elbowR'],
          ['elbowR', 'handR'],
          ['pelvis', 'hipL'],
          ['hipL', 'kneeL'],
          ['kneeL', 'ankleL'],
          ['ankleL', 'footL'],
          ['pelvis', 'hipR'],
          ['hipR', 'kneeR'],
          ['kneeR', 'ankleR'],
          ['ankleR', 'footR'],
          ['pelvis', 'tail1'],
          ['tail1', 'tail2'],
          ['tail2', 'tail3'],
          ['tail3', 'tail4'],
          ['tail4', 'tailTip'],
        ];
        for (const [aId, bId] of pairs) {
          rig.anchors[aId].getWorldPosition(_scratchV1);
          rig.anchors[bId].getWorldPosition(_scratchV2);
          posAttr.setXYZ(idx * 2, _scratchV1.x, _scratchV1.y, _scratchV1.z);
          posAttr.setXYZ(idx * 2 + 1, _scratchV2.x, _scratchV2.y, _scratchV2.z);
          idx++;
        }
        debugLineGeo.setDrawRange(0, idx * 2);
        posAttr.needsUpdate = true;

        rig.ragdoll.nodeOrder.forEach((id, i) => {
          rig.anchors[id].getWorldPosition(_scratchV1);
          _scratchMat.makeTranslation(_scratchV1.x, _scratchV1.y, _scratchV1.z);
          debugJointsMesh.setMatrixAt(i, _scratchMat);
        });
        debugJointsMesh.instanceMatrix.needsUpdate = true;
      }
    };

    const tick = () => {
      if (disposed) return;

      const now = performance.now();
      const rawDt = Math.min((now - lastTime) / 1000, isSoftwareGl ? 0.18 : 0.05);
      lastTime = now;

      // Hitstop freezes simulation physics briefly while camera shake & hit flash continue in real dt
      if (hitstopTimer > 0) {
        hitstopTimer = Math.max(0, hitstopTimer - rawDt);
      } else {
        const simDt = rawDt * speedMultiplier;

        if (rig.isRagdollActive) {
          const prevChestY = rig.ragdoll.nodes.chest.pos.y;
          stepRagdoll(rig.ragdoll, simDt, 0, ARENA_OBSTACLES, ARENA_RADIUS);
          rig.syncRagdollVisuals();
          const newChestY = rig.ragdoll.nodes.chest.pos.y;
          if (prevChestY > 0.36 && newChestY <= 0.36 && prevRagdollFloorHits === 0) {
            prevRagdollFloorHits += 1;
            sound.playBodyThud();
            spawnParticles(
              rig.ragdoll.nodes.chest.pos.x,
              0.08,
              rig.ragdoll.nodes.chest.pos.z,
              10,
              0x64748b,
              2.5,
            );
          }
          // Track contact shadow under ragdoll chest/pelvis
          contactShadowMesh.position.x = rig.ragdoll.nodes.pelvis.pos.x;
          contactShadowMesh.position.z = rig.ragdoll.nodes.pelvis.pos.z;
          contactShadowMesh.scale.set(1.25, 1.45, 1);
          contactShadowMat.opacity = 0.5;
        } else {
          prevRagdollFloorHits = 0;
          const animSteps = simDt > 0.05 ? 3 : 1;
          const subAnimDt = simDt / animSteps;
          for (let s = 0; s < animSteps; s++) {
            animator.update(rig, subAnimDt, {
              onLeapLaunch: () => {
                sound.playXenomorphHiss(true);
              },
              onLeapLand: (pos) => {
                sound.playBodyThud();
                cameraTrauma = Math.min(1, cameraTrauma + 0.25);
                spawnParticles(pos.x, 0.08, pos.z, 14, 0xf59e0b, 3.8);
              },
              onAttackStrike: () => {
                sound.playXenomorphHiss(true);
              },
              onFootstep: () => {
                // Subtle light footstep audio when unmuted
              },
              onEnterRagdoll: (hitNode, impulse) => {
                applyRagdollImpulse(rig.ragdoll, hitNode, impulse, 0.9);
                sound.playBodyThud();
                syncHud(true);
              },
            });
          }

          // Ground / Wall / Ceiling contact shadow tracks actor & aligns with surface normal
          if (animator.state === 'crawl') {
            contactShadowMesh.position
              .copy(animator.rootPos)
              .addScaledVector(animator.surfaceNormal, 0.02);
            contactShadowMesh.quaternion.setFromUnitVectors(
              _shadowDefaultUp,
              animator.surfaceNormal,
            );
            contactShadowMesh.scale.setScalar(0.95);
            contactShadowMat.opacity = 0.56;
          } else {
            const pelvisWorldY = rig.joints.pelvis.position.y;
            const heightFactor = Math.max(0.45, 1 - Math.max(0, pelvisWorldY - 0.95) * 0.38);
            contactShadowMesh.position.set(animator.rootPos.x, 0.015, animator.rootPos.z);
            contactShadowMesh.rotation.set(-Math.PI / 2, 0, 0);
            contactShadowMesh.scale.setScalar(heightFactor);
            contactShadowMat.opacity = 0.58 * heightFactor;
          }

          // Live glowing acid saliva drip / forward spray from Xenomorph jaws
          acidDripTimer += rawDt;
          const isAggressive = animator.state === 'attack' || animator.state === 'leap';
          const interval = isAggressive ? 0.06 : 0.28;
          if (acidDripTimer >= interval) {
            acidDripTimer = 0;
            rig.anchors.jawTip.getWorldPosition(_scratchV1);
            rig.joints.head.getWorldQuaternion(_scratchQuat);
            _scratchDir.set(0, -0.15, 1).applyQuaternion(_scratchQuat).normalize();
            if (isAggressive) {
              spawnAcidSpit(
                _scratchV1.x,
                _scratchV1.y,
                _scratchV1.z,
                _scratchDir.x,
                _scratchDir.y,
                _scratchDir.z,
                4,
                3.6,
              );
            } else {
              spawnAcidSpit(_scratchV1.x, _scratchV1.y, _scratchV1.z, 0, -1, 0.15, 1, 0.55);
            }
          }
        }
      }

      // Hit flash decay
      if (hitFlashTimer > 0) {
        hitFlashTimer = Math.max(0, hitFlashTimer - rawDt);
        rig.setHitFlash(hitFlashTimer / 0.075);
      }

      // Tracer fade
      if (tracerLife > 0) {
        tracerLife = Math.max(0, tracerLife - rawDt);
        tracerMat.opacity = (tracerLife / 0.08) * 0.9;
      }

      // Update pooled InstancedMesh particles
      let particlesDirty = false;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particles[i];
        if (!p.active) continue;
        particlesDirty = true;
        p.life += rawDt;
        if (p.life >= p.maxLife) {
          p.active = false;
          _scratchMat.makeScale(0, 0, 0);
          particleInstanced.setMatrixAt(i, _scratchMat);
          continue;
        }
        p.vy -= 14 * rawDt;
        p.x += p.vx * rawDt;
        p.y += p.vy * rawDt;
        p.z += p.vz * rawDt;
        if (p.y < 0.03) {
          p.y = 0.03;
          p.vy *= -0.35;
          p.vx *= 0.65;
          p.vz *= 0.65;
        }
        const s = p.size * (1 - p.life / p.maxLife);
        _scratchScale.set(s, s, s);
        _scratchQuat.identity();
        _scratchV1.set(p.x, p.y, p.z);
        _scratchMat.compose(_scratchV1, _scratchQuat, _scratchScale);
        particleInstanced.setMatrixAt(i, _scratchMat);
        particleInstanced.setColorAt(i, p.color);
      }
      if (particlesDirty) {
        particleInstanced.instanceMatrix.needsUpdate = true;
        if (particleInstanced.instanceColor) {
          particleInstanced.instanceColor.needsUpdate = true;
        }
      }

      // Smooth Camera Tracking / Follow + Crawl Auto-Frame + Trauma Shake
      const focusX = rig.isRagdollActive
        ? rig.ragdoll.nodes.chest.pos.x
        : animator.rootPos.x;
      const focusY = rig.isRagdollActive
        ? rig.ragdoll.nodes.chest.pos.y + 0.2
        : animator.state === 'crawl'
          ? animator.rootPos.y + animator.surfaceNormal.y * 0.4
          : 1.05;
      const focusZ = rig.isRagdollActive
        ? rig.ragdoll.nodes.chest.pos.z
        : animator.rootPos.z;

      if (autoFrameGoal) {
        const alpha = 1 - Math.exp(-5.0 * rawDt);
        camera.position.lerp(autoFrameGoal.camPos, alpha);
        controls.target.lerp(autoFrameGoal.target, alpha);
        if (camera.position.distanceTo(autoFrameGoal.camPos) < 0.06) {
          autoFrameGoal = null;
        }
      } else if (cameraMode === 'follow') {
        const dampAlpha = 1 - Math.exp(-5.5 * rawDt);
        controls.target.x += (focusX - controls.target.x) * dampAlpha;
        controls.target.y += (focusY - controls.target.y) * dampAlpha;
        controls.target.z += (focusZ - controls.target.z) * dampAlpha;

        if (interactionMode === 'shooter') {
          const desiredCamX = focusX + 2.1;
          const desiredCamY = Math.max(1.4, focusY + 1.15);
          const desiredCamZ = focusZ + 4.4;
          const camDamp = 1 - Math.exp(-3.6 * rawDt);
          camera.position.x += (desiredCamX - camera.position.x) * camDamp;
          camera.position.y += (desiredCamY - camera.position.y) * camDamp;
          camera.position.z += (desiredCamZ - camera.position.z) * camDamp;
        }
      }

      controls.update();

      // Apply decaying trauma^2 camera shake offset safely after controls.update
      if (cameraTrauma > 0.001) {
        const shake = cameraTrauma * cameraTrauma * 0.14;
        camera.position.x += (Math.random() - 0.5) * shake;
        camera.position.y += (Math.random() - 0.5) * shake;
        cameraTrauma = Math.max(0, cameraTrauma - rawDt * 2.4);
      }

      updateDebugOverlay();
      syncHud(false);

      renderer.render(scene, camera);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    syncHud(true);
    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.removeEventListener('start', onControlsStart);
      controls.dispose();
      sound.dispose();
      rig.dispose();
      textures.dispose();
      envTarget.dispose();
      outerFloorGeo.dispose();
      outerFloorMat.dispose();
      deckGeo.dispose();
      deckMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pillarBaseGeo.dispose();
      pillarUpperArchGeo.dispose();
      pillarCapGeo.dispose();
      pillarStripGeo.dispose();
      ceilingStripGeo.dispose();
      pillarMat.dispose();
      pillarTrimMat.dispose();
      ledStripMat.dispose();
      corridorPanelMat.dispose();
      archGeos.forEach((g) => g.dispose());
      crateGeos.forEach((g) => g.dispose());
      crateMat.dispose();
      crateTrimMat.dispose();
      contactShadowGeo.dispose();
      contactShadowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      tracerGeo.dispose();
      tracerMat.dispose();
      debugLineGeo.dispose();
      debugLineMat.dispose();
      nodeJointGeo.dispose();
      nodeJointMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="xenomorph-viewport"
      className="w-full h-full cursor-crosshair"
    />
  );
});
