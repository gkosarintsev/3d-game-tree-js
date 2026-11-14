import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { computeHouseMetrics } from '../core/houseMetrics';
import type { ArchitecturalStyleId, CameraPresetId, HouseConfig } from '../types/house';
import { buildSiteEnvironment, type SiteEnvironmentResult } from './builders/environmentBuilder';
import { assembleHouseModel, type AssembledHouseResult } from './builders/houseAssembler';
import { downloadHouseAsGlb, exportObjectToGlbBuffer } from './export/glbExporter';
import { ProceduralTextureLibrary } from './textures/proceduralTextures';

const SKY_COLOR = 0xe8eef4;
const CYBER_SKY_COLOR = 0x161f30;

// Pre-allocated scratch vectors for zero-GC animation updates
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export interface SceneControllerCallbacks {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export class HouseSceneController {
  private readonly container: HTMLElement;
  private readonly isSoftwareGl: boolean;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private readonly textures: ProceduralTextureLibrary;
  private readonly envRT: THREE.WebGLRenderTarget;
  private readonly callbacks: SceneControllerCallbacks;
  private hemiLight!: THREE.HemisphereLight;
  private keyLight!: THREE.DirectionalLight;
  private rimLight!: THREE.DirectionalLight;

  private currentHouse: AssembledHouseResult | null = null;
  private currentEnvironment: SiteEnvironmentResult | null = null;
  private currentConfig: HouseConfig | null = null;
  private lastFramedStyleId: ArchitecturalStyleId | null = null;
  private lastFramedSpan = 0;
  private currentPreset: CameraPresetId = 'isometric';

  private frameId = 0;
  private renderBusy = false;
  private renderDirty = false;
  private disposed = false;

  // Smooth camera transition state
  private transitionActive = false;
  private lastTickTime = 0;

  private readonly resizeObserver: ResizeObserver;

  constructor(
    container: HTMLElement,
    initialConfig: HouseConfig,
    callbacks: SceneControllerCallbacks = {},
  ) {
    this.container = container;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    canvas.addEventListener('webglcontextlost', this.handleContextLost);
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SKY_COLOR);
    this.scene.fog = new THREE.Fog(SKY_COLOR, 36, 95);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    this.scene.environment = this.envRT.texture;
    pmremGenerator.dispose();

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.25, 250);
    this.camera.position.set(16.0, 10.6, 18.2);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 7;
    this.controls.maxDistance = 44;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.minPolarAngle = 0.12;
    this.controls.target.set(0, 1.9, 0);

    this.controls.addEventListener('start', () => {
      this.transitionActive = false;
    });
    this.controls.addEventListener('change', () => {
      this.requestRender();
    });

    this.setupLighting();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = new ProceduralTextureLibrary(maxAniso);

    this.updateHouse(initialConfig);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);
    window.addEventListener('resize', this.handleResize);

    this.requestRender();
  }

  private setupLighting(): void {
    // Cool sky / warm earth hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0xd9ebff, 0x8b8478, 0.65);
    hemiLight.position.set(0, 30, 0);
    this.hemiLight = hemiLight;
    this.scene.add(hemiLight);

    // Warm golden key sun light with dynamic shadow frustum
    const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.85);
    keyLight.position.set(18, 24, 16);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 2;
    keyLight.shadow.camera.far = 140;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.keyLight = keyLight;
    this.scene.add(keyLight);

    // Cool subtle rim backlight to sculpt roof and facade edges
    const rimLight = new THREE.DirectionalLight(0xcbe2ff, 0.55);
    rimLight.position.set(-16, 12, -18);
    this.rimLight = rimLight;
    this.scene.add(rimLight);
  }

  private handleContextLost = (e: Event): void => {
    e.preventDefault();
    this.callbacks.onContextLost?.();
  };

  private handleContextRestored = (): void => {
    this.callbacks.onContextRestored?.();
    this.requestRender();
  };

  private handleResize = (): void => {
    if (this.disposed) return;
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  public requestRender(): void {
    if (this.disposed) return;
    if (this.renderBusy) {
      this.renderDirty = true;
      return;
    }
    this.renderBusy = true;
    this.frameId = requestAnimationFrame((now) => {
      if (this.disposed) return;
      this.renderDirty = false;

      const dt = this.lastTickTime > 0 ? Math.min(0.05, (now - this.lastTickTime) / 1000) : 0.016;
      this.lastTickTime = now;

      if (this.transitionActive) {
        if (this.isSoftwareGl) {
          this.camera.position.copy(_targetCamPos);
          this.controls.target.copy(_targetLookAt);
          this.transitionActive = false;
        } else {
          const lambda = 7.5;
          this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _targetCamPos.x, lambda, dt);
          this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _targetCamPos.y, lambda, dt);
          this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _targetCamPos.z, lambda, dt);

          this.controls.target.x = THREE.MathUtils.damp(this.controls.target.x, _targetLookAt.x, lambda, dt);
          this.controls.target.y = THREE.MathUtils.damp(this.controls.target.y, _targetLookAt.y, lambda, dt);
          this.controls.target.z = THREE.MathUtils.damp(this.controls.target.z, _targetLookAt.z, lambda, dt);

          const dist = this.camera.position.distanceTo(_targetCamPos);
          if (dist < 0.04) {
            this.camera.position.copy(_targetCamPos);
            this.controls.target.copy(_targetLookAt);
            this.transitionActive = false;
          } else {
            this.renderDirty = true;
          }
        }
      }

      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      const done = () => {
        this.renderBusy = false;
        if (this.renderDirty && !this.disposed) {
          this.requestRender();
        }
      };

      if (this.isSoftwareGl) {
        this.afterDraw(done);
      } else {
        done();
      }
    });
  }

  public updateHouse(config: HouseConfig): void {
    if (this.disposed) return;
    this.currentConfig = config;

    if (this.currentHouse) {
      this.scene.remove(this.currentHouse.group);
      this.currentHouse.dispose();
      this.currentHouse = null;
    }

    if (this.currentEnvironment) {
      this.scene.remove(this.currentEnvironment.group);
      this.currentEnvironment.dispose();
      this.currentEnvironment = null;
    }

    const assembled = assembleHouseModel(config, this.textures, this.isSoftwareGl);
    this.currentHouse = assembled;
    this.scene.add(assembled.group);

    const env = buildSiteEnvironment(config, this.textures);
    this.currentEnvironment = env;
    this.scene.add(env.group);

    // Dynamically adjust fog, clip planes, shadow frustum, and orbit bounds to building scale
    const metrics = computeHouseMetrics(config);
    const span = Math.max(
      metrics.totalWidthM,
      config.dimensions.depth,
      metrics.totalRidgeHeightM * 1.15,
    );

    const isCyber = config.styleId === 'megabuilding';
    const skyHex = isCyber ? CYBER_SKY_COLOR : SKY_COLOR;
    this.scene.background = new THREE.Color(skyHex);
    this.scene.fog = new THREE.Fog(
      skyHex,
      Math.max(36, span * 2.2),
      Math.max(95, span * 5.2),
    );
    this.hemiLight.color.setHex(isCyber ? 0x8cb4ff : 0xd9ebff);
    this.hemiLight.groundColor.setHex(isCyber ? 0x3b2d4a : 0x8b8478);
    this.hemiLight.intensity = isCyber ? 0.9 : 0.65;
    this.keyLight.color.setHex(isCyber ? 0xe8f1ff : 0xfff1dc);
    this.keyLight.intensity = isCyber ? 1.65 : 1.85;
    this.rimLight.color.setHex(isCyber ? 0x67e8f9 : 0xcbe2ff);
    this.rimLight.intensity = isCyber ? 0.95 : 0.55;

    this.camera.far = Math.max(250, span * 7);
    this.camera.updateProjectionMatrix();

    this.controls.minDistance = Math.max(7, Math.min(26, span * 0.22));
    this.controls.maxDistance = Math.max(44, span * 2.8);

    const shadowD = Math.max(16, span * 0.72);
    this.keyLight.position.set(span * 1.2, span * 1.5, span * 1.05);
    this.keyLight.shadow.camera.left = -shadowD;
    this.keyLight.shadow.camera.right = shadowD;
    this.keyLight.shadow.camera.top = shadowD;
    this.keyLight.shadow.camera.bottom = -shadowD;
    this.keyLight.shadow.camera.far = Math.max(70, span * 4);
    this.keyLight.shadow.camera.updateProjectionMatrix();

    const styleChanged = this.lastFramedStyleId !== config.styleId;
    const majorScaleChanged =
      this.lastFramedSpan > 0 &&
      Math.abs(span - this.lastFramedSpan) / this.lastFramedSpan > 0.3;

    if (styleChanged || majorScaleChanged) {
      this.lastFramedStyleId = config.styleId;
      this.lastFramedSpan = span;
      this.setCameraPreset(this.currentPreset);
      if (this.isSoftwareGl) {
        this.camera.position.copy(_targetCamPos);
        this.controls.target.copy(_targetLookAt);
        this.transitionActive = false;
        this.controls.update();
      }
    }

    this.requestRender();
  }

  public setCameraPreset(preset: CameraPresetId): void {
    this.currentPreset = preset;
    const config = this.currentConfig;
    const metrics = config ? computeHouseMetrics(config) : null;
    const span =
      config && metrics
        ? Math.max(
            metrics.totalWidthM,
            config.dimensions.depth,
            metrics.totalRidgeHeightM * 1.15,
          )
        : 10;
    const isTall = metrics
      ? metrics.totalRidgeHeightM > 25 || metrics.totalWidthM > 25
      : false;
    const targetY = metrics ? metrics.totalRidgeHeightM * (isTall ? 0.30 : 0.44) : 2.6;
    const dist = Math.max(13, span * (isTall ? 1.72 : 1.48));

    _targetLookAt.set(0, targetY, 0);

    switch (preset) {
      case 'front':
        _targetCamPos.set(0, targetY + dist * 0.14, dist * 1.12);
        break;
      case 'side':
        _targetCamPos.set(dist * 1.12, targetY + dist * 0.16, 0);
        break;
      case 'top':
        _targetCamPos.set(0, dist * 1.38, 0.1);
        break;
      case 'isometric':
      default:
        _targetCamPos.set(
          dist * 0.85,
          Math.max(dist * 0.52, targetY + dist * 0.28),
          dist * 0.92,
        );
        break;
    }

    this.transitionActive = true;
    this.requestRender();
  }

  public async exportGlb(projectName: string): Promise<{ filename: string; byteLength: number }> {
    if (!this.currentHouse) {
      throw new Error('Модель дома ещё не построена.');
    }
    return downloadHouseAsGlb(this.currentHouse.group, projectName);
  }

  public async getGlbArrayBuffer(): Promise<ArrayBuffer> {
    if (!this.currentHouse) {
      throw new Error('Модель дома ещё не построена.');
    }
    return exportObjectToGlbBuffer(this.currentHouse.group);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    window.removeEventListener('resize', this.handleResize);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    canvas.removeEventListener('webglcontextrestored', this.handleContextRestored);

    if (this.currentHouse) {
      this.currentHouse.dispose();
      this.currentHouse = null;
    }
    if (this.currentEnvironment) {
      this.currentEnvironment.dispose();
      this.currentEnvironment = null;
    }

    this.textures.dispose();
    this.envRT.dispose();
    this.controls.dispose();
    this.renderer.dispose();

    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
