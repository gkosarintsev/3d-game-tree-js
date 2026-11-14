import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const VIEW_NAMES = ['top', 'front', 'side', 'free'];

export class ViewManager {
  constructor(renderer, canvas, model) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.model = model;
    this.view = 'top';
    this.stack = [];
    this.anim = null;
    this._listeners = new Set();
    this._size = { w: 1, h: 1 };
    this._safe = { left: 0, right: 0, top: 0, bottom: 0 };

    const aspect = 1;
    this.ortho = {
      top: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20000),
      front: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20000),
      side: new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 20000),
    };
    this.persp = new THREE.PerspectiveCamera(55, aspect, 0.5, 20000);
    this.controls = new OrbitControls(this.persp, canvas);
    this.controls.enableDamping = false;
    this.controls.screenSpacePanning = true;
    this.controls.enabled = false;

    this.target = new THREE.Vector3(0, model?.meta?.plate?.groundY || 0, 0);
    this.orthoZoom = 1;
    this._onWheel = (e) => this.handleWheel(e);
    this._onMouseDown = (e) => this.handleMouseDown(e);
    this._onMouseMove = (e) => this.handleMouseMove(e);
    this._onMouseUp = (e) => this.handleMouseUp(e);
    this._onResize = () => this.resize();

    canvas.addEventListener('wheel', this._onWheel, { passive: false });
    canvas.addEventListener('mousedown', this._onMouseDown);
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
    window.addEventListener('resize', this._onResize);
    this.controls.addEventListener('change', () => this.emit());

    this.panning = false;
    this.didDrag = false;
    this.panButton = -1;
    this.panStart = { x: 0, y: 0 };
    this.panTargetStart = new THREE.Vector3();
    this.resize();
    this.fitAll();
  }

  onChange(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); }
  emit() { for (const fn of this._listeners) try { fn(); } catch {} }

  setSafeArea(s) { this._safe = { left: 0, right: 0, top: 0, bottom: 0, ...(s || {}) }; this.resize(); }

  get camera() { return this.view === 'free' ? this.persp : this.ortho[this.view]; }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    this._size = { w, h };
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const aspect = w / h;
    this.persp.aspect = aspect;
    this.persp.updateProjectionMatrix();
    this.updateOrthoFrustum();
  }

  plateSpan() {
    const p = this.model?.meta?.plate;
    return p?.size || 1280;
  }

  updateOrthoFrustum() {
    const { w, h } = this._size;
    const aspect = w / h;
    const span = this.plateSpan() / this.orthoZoom;
    const halfW = span / 2;
    const halfH = halfW / aspect;
    for (const cam of Object.values(this.ortho)) {
      cam.left = -halfW; cam.right = halfW; cam.top = halfH; cam.bottom = -halfH;
      cam.near = 0.1; cam.far = 30000;
      cam.updateProjectionMatrix();
    }
    this.positionOrthoCameras();
  }

  positionOrthoCameras() {
    const gy = this.model?.meta?.plate?.groundY || 0;
    const d = 10000;
    const t = this.target;
    const top = this.ortho.top;
    top.position.set(t.x, gy + d, t.z);
    top.up.set(0, 0, -1);
    top.lookAt(t.x, gy, t.z);
    top.updateMatrixWorld();

    const front = this.ortho.front;
    front.position.set(t.x, t.y || gy, t.z + d);
    front.up.set(0, 1, 0);
    front.lookAt(t.x, t.y || gy, t.z);
    front.updateMatrixWorld();

    const side = this.ortho.side;
    side.position.set(t.x + d, t.y || gy, t.z);
    side.up.set(0, 1, 0);
    side.lookAt(t.x, t.y || gy, t.z);
    side.updateMatrixWorld();
  }

  setView(name, push = true) {
    if (!VIEW_NAMES.includes(name) || name === this.view) return;
    if (push) this.pushStack();
    this.view = name;
    this.controls.enabled = name === 'free';
    if (name === 'free') this.syncPerspective();
    this.updateOrthoFrustum();
    this.emit();
  }

  syncPerspective() {
    const gy = this.model?.meta?.plate?.groundY || 0;
    const dist = this.plateSpan() * 0.9 / Math.max(0.2, this.orthoZoom);
    const dir = new THREE.Vector3(1, 0.8, 1).normalize();
    this.persp.position.copy(this.target).addScaledVector(dir, dist);
    this.persp.lookAt(this.target);
    this.controls.target.copy(this.target);
    this.controls.update();
  }

  pushStack() {
    this.stack.push({ view: this.view, target: this.target.clone(), zoom: this.orthoZoom, perspPos: this.persp.position.clone(), perspTarget: this.controls.target.clone() });
    if (this.stack.length > 10) this.stack.shift();
  }

  back() {
    const s = this.stack.pop();
    if (!s) return;
    this.view = s.view;
    this.target.copy(s.target);
    this.orthoZoom = s.zoom;
    this.controls.enabled = this.view === 'free';
    if (this.view === 'free') {
      this.persp.position.copy(s.perspPos);
      this.controls.target.copy(s.perspTarget);
      this.controls.update();
    }
    this.updateOrthoFrustum();
    this.emit();
  }

  reset() {
    this.pushStack();
    this.view = 'top';
    this.controls.enabled = false;
    this.target.set(0, this.model?.meta?.plate?.groundY || 0, 0);
    this.orthoZoom = 1;
    this.updateOrthoFrustum();
    this.emit();
  }

  fitAll() {
    this.target.set(0, this.model?.meta?.plate?.groundY || 0, 0);
    this.orthoZoom = 1;
    this.updateOrthoFrustum();
    if (this.view === 'free') this.syncPerspective();
    this.emit();
  }

  fitBox(box, margin = 1.1) {
    if (!box) return;
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    const cz = (box.minZ + box.maxZ) / 2;
    const sx = Math.max(1, box.maxX - box.minX);
    const sz = Math.max(1, box.maxZ - box.minZ);
    const sy = Math.max(1, box.maxY - box.minY);
    this.target.set(cx, cy, cz);
    const plate = this.plateSpan();
    const span = Math.max(sx, sz) * margin;
    this.orthoZoom = Math.max(0.05, plate / span);
    this.updateOrthoFrustum();
    if (this.view === 'free') {
      const dist = Math.max(sx, sy, sz) * 2.2 + 10;
      this.persp.position.set(cx + dist * 0.7, cy + dist * 0.6, cz + dist * 0.7);
      this.controls.target.copy(this.target);
      this.controls.update();
    }
    this.emit();
  }

  focusFacade(entity) {
    if (!entity || entity.kind !== 'building') { this.fitBox(entity?.bbox); return; }
    this.pushStack();
    const walls = (entity.attrs?.walls || []).filter(w => w.facade);
    let wall = walls[0];
    if (!wall && entity.attrs?.walls?.length) wall = entity.attrs.walls[0];
    if (!wall && Array.isArray(entity.attrs?.footprint) && entity.attrs.footprint.length >= 2) {
      // longest edge
      const fp = entity.attrs.footprint;
      let best = null, bestLen = -1;
      for (let i = 0; i < fp.length; i++) {
        const a = fp[i], b = fp[(i + 1) % fp.length];
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        if (len > bestLen) { bestLen = len; best = { a, b }; }
      }
      if (best) {
        const cx = (best.a.x + best.b.x) / 2, cz = (best.a.z + best.b.z) / 2;
        const dx = best.b.x - best.a.x, dz = best.b.z - best.a.z;
        const len = Math.max(1, Math.hypot(dx, dz));
        let nx = dz / len, nz = -dx / len; // one normal
        const bcx = (entity.bbox.minX + entity.bbox.maxX) / 2, bcz = (entity.bbox.minZ + entity.bbox.maxZ) / 2;
        if ((cx + nx - bcx) * nx + (cz + nz - bcz) * nz < 0) { nx = -nx; nz = -nz; }
        const by = entity.attrs.baseY || 0, ry = entity.attrs.roofY || by + 3;
        const dist = Math.max(bestLen, ry - by) * 1.2 + 20;
        this.view = 'free';
        this.controls.enabled = true;
        this.target.set(cx, (by + ry) / 2, cz);
        this.persp.position.set(cx + nx * dist, (by + ry) / 2, cz + nz * dist);
        this.controls.target.copy(this.target);
        this.controls.update();
        this.emit();
        return;
      }
    }
    if (wall) {
      const cx = (wall.minX + wall.maxX) / 2, cz = (wall.minZ + wall.maxZ) / 2;
      const len = Math.max(wall.maxX - wall.minX, wall.maxZ - wall.minZ);
      const by = entity.attrs.baseY || 0, ry = entity.attrs.roofY || by + 3;
      const dist = Math.max(len, ry - by) * 1.2 + 20;
      const nx = wall.axis === 'z' ? 1 : 0, nz = wall.axis === 'x' ? 1 : 0;
      this.view = 'free'; this.controls.enabled = true;
      this.target.set(cx, (by + ry) / 2, cz);
      this.persp.position.set(cx + nx * dist, (by + ry) / 2, cz + nz * dist);
      this.controls.target.copy(this.target);
      this.controls.update();
      this.emit();
      return;
    }
    this.fitBox(entity.bbox);
  }

  handleWheel(e) {
    e.preventDefault();
    const delta = -Math.sign(e.deltaY) * 0.15;
    if (this.view === 'free') {
      // orbit controls handles it mostly, but keep consistent
      return;
    }
    const factor = Math.exp(delta);
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const before = this.screenToWorld(mx, my);
    this.orthoZoom = Math.max(0.02, Math.min(200, this.orthoZoom * factor));
    this.updateOrthoFrustum();
    const after = this.screenToWorld(mx, my);
    if (before && after) {
      this.target.x += before.x - after.x;
      this.target.z += before.z - after.z;
      this.updateOrthoFrustum();
    }
    this.emit();
  }

  handleMouseDown(e) {
    if (this.view === 'free') return;
    if (e.button === 0 || e.button === 1 || e.button === 2) {
      this.panning = true;
      this.panButton = e.button;
      this.didDrag = false;
      this.panStart = { x: e.clientX, y: e.clientY };
      this.panTargetStart.copy(this.target);
      // prevent text selection / default drag, but allow click to still be handled if no movement
      if (e.button !== 0) e.preventDefault();
    }
  }
  handleMouseMove(e) {
    if (!this.panning || this.view === 'free') return;
    const dx = e.clientX - this.panStart.x;
    const dy = e.clientY - this.panStart.y;
    if (!this.didDrag && Math.hypot(dx, dy) > 3) {
      this.didDrag = true;
      try { this.canvas.setPointerCapture?.(this.panButton); } catch {}
    }
    if (!this.didDrag) return;
    const mpp = this.metersPerPixel();
    // top: screen x -> world x, screen y -> world -z? up=(0,0,-1) means screen up is -z
    if (this.view === 'top') {
      this.target.x = this.panTargetStart.x - dx * mpp;
      this.target.z = this.panTargetStart.z - dy * mpp;
    } else if (this.view === 'front') {
      this.target.x = this.panTargetStart.x - dx * mpp;
      this.target.y = this.panTargetStart.y + dy * mpp;
    } else if (this.view === 'side') {
      this.target.z = this.panTargetStart.z + dx * mpp;
      this.target.y = this.panTargetStart.y + dy * mpp;
    }
    this.updateOrthoFrustum();
    this.emit();
  }
  handleMouseUp(e) {
    if (!this.panning) return;
    this.panning = false;
    this.panButton = -1;
    // keep didDrag true briefly so click handler can ignore selection after drag
    setTimeout(() => { this.didDrag = false; }, 0);
  }

  consumeDragFlag() {
    const d = this.didDrag;
    this.didDrag = false;
    return d;
  }

  screenToWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    if (this.view === 'free') {
      const ray = new THREE.Raycaster();
      ray.setFromCamera({ x, y }, this.persp);
      const gy = this.model?.meta?.plate?.groundY || 0;
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -gy);
      const out = new THREE.Vector3();
      return ray.ray.intersectPlane(plane, out) ? out : null;
    }
    const cam = this.ortho[this.view];
    const v = new THREE.Vector3(x, y, 0).unproject(cam);
    return v;
  }

  metersPerPixel() {
    if (this.view === 'free') {
      const dist = this.persp.position.distanceTo(this.controls.target);
      const vFov = (this.persp.fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFov / 2) * dist;
      return height / Math.max(1, this._size.h);
    }
    const cam = this.ortho[this.view];
    return (cam.right - cam.left) / Math.max(1, this._size.w);
  }

  worldToScreen(x, y, z) {
    const v = new THREE.Vector3(x, y, z).project(this.camera);
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (v.x * 0.5 + 0.5) * rect.width,
      y: (-v.y * 0.5 + 0.5) * rect.height,
      visible: v.z >= -1 && v.z <= 1,
    };
  }

  dispose() {
    this.canvas.removeEventListener('wheel', this._onWheel);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
    window.removeEventListener('resize', this._onResize);
    this.controls.dispose();
  }
}
