import * as THREE from 'three';
import { nice125, autoStep, buildGridLines } from './grid.js';

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }

const COLORS = {
  bg: 0x0d1117,
  plate: 0x1b2430,
  plateLine: 0x2e3d4f,
  authored: 0x4aa3ff,
  generated: 0xffae42,
  derived: 0xb58cff,
  unknown: 0x8b97a8,
  missing: 0xff5c7a,
  engine: 0x5c6b7d,
  selected: 0xffffff,
  hover: 0x6ff2ff,
  diagnostic: 0xff4d4f,
  gridMinor: 0x243040,
  gridMajor: 0x33465f,
  gridAxis: 0x6a86aa,
};

function originColor(origin, status) {
  if (status === 'declared-missing') return COLORS.missing;
  return COLORS[origin] || COLORS.unknown;
}

function setMatColor(mat, hex, opacity = 1) {
  if (mat.color) mat.color.setHex(hex);
  mat.opacity = opacity;
  mat.transparent = opacity < 1;
  mat.needsUpdate = true;
}

export class SceneRenderer {
  constructor(canvas, model) {
    this.canvas = canvas;
    this.model = model;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setClearColor(COLORS.bg, 1);
    this.renderer.localClippingEnabled = true;
    this.scene = new THREE.Scene();
    this.layers = {
      plate: new THREE.Group(),
      districts: new THREE.Group(),
      chunks: new THREE.Group(),
      roads: new THREE.Group(),
      rails: new THREE.Group(),
      buildings: new THREE.Group(),
      props: new THREE.Group(),
      lights: new THREE.Group(),
      channels: new THREE.Group(),
      skeleton: new THREE.Group(),
      anchors: new THREE.Group(),
      diagnostics: new THREE.Group(),
      relief: new THREE.Group(),
      grid: new THREE.Group(),
    };
    for (const g of Object.values(this.layers)) this.scene.add(g);
    this.pickables = [];
    this.selectedId = null;
    this.hoverId = null;
    this.layerState = {
      plate: true, districts: true, chunks: true, roads: true, rails: true,
      buildings: true, props: true, lights: false, channels: true, tunnels: true,
      skeleton: false, anchors: true, diagnostics: true, relief: false, grid: true,
    };
    this.gridOpts = { enabled: true, step: 'auto', opacity: 0.5, extent: 'plate' };
    this.sectionPlane = null;
    this.clippingPlanes = [];
    this._disposables = [];
    this.buildAll();
  }

  buildAll() {
    this.buildPlate();
    this.buildDistricts();
    this.buildChunks();
    this.buildRoads();
    this.buildBuildings();
    this.buildProps();
    this.buildLights();
    this.buildChannels();
    this.buildSkeleton();
    this.buildAnchors();
    this.buildDiagnostics();
    this.buildRelief();
    this.applyLayerState();
  }

  registerPick(mesh, entityRef) {
    mesh.userData.entityRef = entityRef;
    this.pickables.push(mesh);
  }

  track(obj) { this._disposables.push(obj); return obj; }

  buildPlate() {
    const p = this.model.meta.plate;
    const gy = p.groundY || 0;
    const g = new THREE.PlaneGeometry(p.size, p.size);
    const m = new THREE.MeshBasicMaterial({ color: COLORS.plate, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(0, gy - 0.01, 0);
    this.layers.plate.add(mesh);
    this.track(g); this.track(m);
    // bounds outline
    const pts = [
      [p.minX, gy, p.minZ], [p.maxX, gy, p.minZ], [p.maxX, gy, p.maxZ], [p.minX, gy, p.maxZ], [p.minX, gy, p.minZ],
    ].map(a => new THREE.Vector3(...a));
    const lg = new THREE.BufferGeometry().setFromPoints(pts);
    const lm = new THREE.LineBasicMaterial({ color: COLORS.plateLine });
    this.layers.plate.add(new THREE.Line(lg, lm));
    this.track(lg); this.track(lm);
  }

  buildDistricts() {
    const map = this.model.entities.districts || new Map();
    for (const ent of map.values()) {
      const geom = ent.geometry;
      if (!geom || !geom.points || geom.points.length < 3) continue;
      const gy = this.model.meta.plate.groundY || 0;
      const pts = geom.points.map(p => new THREE.Vector3(p.x, gy + 0.03, p.z ?? p.y ?? 0));
      pts.push(pts[0].clone());
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const color = geom.inferred ? COLORS.derived : originColor(ent.origin);
      const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: geom.inferred ? 0.7 : 0.9 });
      const line = new THREE.Line(g, m);
      line.userData.kind = 'district';
      this.layers.districts.add(line);
      this.track(g); this.track(m);
      // fill
      const shape = new THREE.Shape(geom.points.map(p => new THREE.Vector2(p.x, -(p.z ?? p.y ?? 0))));
      const fg = new THREE.ShapeGeometry(shape);
      fg.rotateX(-Math.PI / 2);
      const fm = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false });
      const fmesh = new THREE.Mesh(fg, fm);
      fmesh.position.y = gy + 0.02;
      this.registerPick(fmesh, { kind: 'district', id: ent.id });
      this.layers.districts.add(fmesh);
      this.track(fg); this.track(fm);
    }
  }

  buildChunks() {
    const map = this.model.entities.chunks || new Map();
    for (const ent of map.values()) {
      const r = ent.attrs?.rect || ent.geometry?.rect;
      if (!r) continue;
      const gy = this.model.meta.plate.groundY || 0;
      const pts = [
        [r.minX, gy + 0.04, r.minZ], [r.maxX, gy + 0.04, r.minZ],
        [r.maxX, gy + 0.04, r.maxZ], [r.minX, gy + 0.04, r.maxZ], [r.minX, gy + 0.04, r.minZ],
      ].map(a => new THREE.Vector3(...a));
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({ color: COLORS.engine, transparent: true, opacity: 0.45 });
      const line = new THREE.Line(g, m);
      this.layers.chunks.add(line);
      this.track(g); this.track(m);
    }
  }

  deckMesh(deck, color, opacity = 0.45) {
    if (deck.obb) {
      const hx = deck.obb.hx, hz = deck.obb.hz;
      const h = Math.max(0.2, (deck.topY - deck.bottomY) || 0.6);
      const g = new THREE.BoxGeometry(hx * 2, h, hz * 2);
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(g, m);
      const midY = (deck.topAtMin + deck.topAtMax) / 2 - h / 2;
      mesh.position.set(deck.obb.cx, midY, deck.obb.cz);
      mesh.rotation.y = -Math.atan2(deck.obb.s || 0, deck.obb.c || 1);
      // tilt for ramp
      if (deck.ramp && Math.abs(deck.topAtMax - deck.topAtMin) > 0.01) {
        const tilt = Math.atan2(deck.topAtMax - deck.topAtMin, Math.max(1, deck.length || (hx * 2)));
        mesh.rotation.z = -tilt * Math.cos(mesh.rotation.y);
      }
      this.track(g); this.track(m);
      return mesh;
    }
    const w = Math.max(0.1, deck.maxX - deck.minX);
    const d = Math.max(0.1, deck.maxZ - deck.minZ);
    const h = Math.max(0.2, (deck.topY - deck.bottomY) || 0.6);
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
    const mesh = new THREE.Mesh(g, m);
    const top = (deck.topAtMin + deck.topAtMax) / 2;
    mesh.position.set((deck.minX + deck.maxX) / 2, top - h / 2, (deck.minZ + deck.maxZ) / 2);
    this.track(g); this.track(m);
    return mesh;
  }

  buildRoads() {
    const map = this.model.entities.roads || new Map();
    for (const ent of map.values()) {
      const color = originColor(ent.origin);
      const decks = ent.attrs.decks || [];
      for (const deck of decks) {
        const mesh = this.deckMesh(deck, color, 0.38);
        this.registerPick(mesh, { kind: 'road', id: ent.id });
        this.layers.roads.add(mesh);
      }
      // outline
      for (const deck of decks) {
        const y = deck.topY + 0.02;
        let pts;
        if (deck.obb) {
          const { cx, cz, hx, hz, c, s } = deck.obb;
          const corners = [[-hx, -hz], [hx, -hz], [hx, hz], [-hx, hz], [-hx, -hz]];
          pts = corners.map(([lx, lz]) => new THREE.Vector3(cx + lx * c - lz * s, y, cz + lx * s + lz * c));
        } else {
          pts = [
            [deck.minX, y, deck.minZ], [deck.maxX, y, deck.minZ],
            [deck.maxX, y, deck.maxZ], [deck.minX, y, deck.maxZ], [deck.minX, y, deck.minZ],
          ].map(a => new THREE.Vector3(...a));
        }
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
        this.layers.roads.add(new THREE.Line(g, m));
        this.track(g); this.track(m);
        if (deck.rails) {
          const rg = new THREE.BufferGeometry().setFromPoints(pts);
          const rm = new THREE.LineDashedMaterial({ color: 0xe6edf3, transparent: true, opacity: 0.5, dashSize: 3, gapSize: 2 });
          const rl = new THREE.Line(rg, rm);
          rl.computeLineDistances();
          this.layers.rails.add(rl);
          this.track(rg); this.track(rm);
        }
      }
      for (const f of ent.attrs.fill || []) {
        const y = (isNum(f.topY) ? f.topY : 0) + 0.01;
        const pts = [[f.minX, y, f.minZ], [f.maxX, y, f.minZ], [f.maxX, y, f.maxZ], [f.minX, y, f.maxZ], [f.minX, y, f.minZ]].map(a => new THREE.Vector3(...a));
        const g = new THREE.BufferGeometry().setFromPoints(pts);
        const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.4 });
        this.layers.roads.add(new THREE.Line(g, m));
        this.track(g); this.track(m);
      }
    }
  }

  buildBuildings() {
    const map = this.model.entities.buildings || new Map();
    for (const ent of map.values()) {
      const color = originColor(ent.origin);
      const a = ent.attrs;
      const by = isNum(a.baseY) ? a.baseY : 0;
      const ry = isNum(a.roofY) ? a.roofY : by + 3;
      const h = Math.max(0.5, ry - by);
      let fp = a.footprint;
      if (!fp && a.bounds) {
        const b = a.bounds;
        fp = [{ x: b.minX, z: b.minZ }, { x: b.maxX, z: b.minZ }, { x: b.maxX, z: b.maxZ }, { x: b.minX, z: b.maxZ }];
      }
      if (!fp || fp.length < 3) continue;
      const shape = new THREE.Shape(fp.map(p => new THREE.Vector2(p.x, -p.z)));
      const eg = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
      eg.rotateX(-Math.PI / 2);
      const em = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(eg, em);
      mesh.position.y = by;
      this.registerPick(mesh, { kind: 'building', id: ent.id });
      this.layers.buildings.add(mesh);
      this.track(eg); this.track(em);
      // outline footprint
      const pts = fp.map(p => new THREE.Vector3(p.x, by + 0.05, p.z));
      pts.push(pts[0].clone());
      const lg = new THREE.BufferGeometry().setFromPoints(pts);
      const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95 });
      this.layers.buildings.add(new THREE.Line(lg, lm));
      this.track(lg); this.track(lm);
    }
  }

  buildProps() {
    const map = this.model.entities.props || new Map();
    const pos = [];
    const col = [];
    const ids = [];
    const tmpCol = new THREE.Color();
    for (const ent of map.values()) {
      const p = ent.attrs.position || { x: 0, y: 0, z: 0 };
      pos.push(p.x, (p.y || 0) + 0.5, p.z);
      tmpCol.setHex(originColor(ent.origin));
      col.push(tmpCol.r, tmpCol.g, tmpCol.b);
      ids.push(ent.id);
    }
    if (!pos.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({ size: 4, vertexColors: true, sizeAttenuation: false, transparent: true, opacity: 0.9 });
    const pts = new THREE.Points(g, m);
    pts.userData.propIds = ids;
    this.layers.props.add(pts);
    this.track(g); this.track(m);
  }

  buildLights() {
    const map = this.model.entities.lights || new Map();
    const pos = [];
    for (const ent of map.values()) {
      const p = ent.attrs.position || { x: 0, y: 0, z: 0 };
      pos.push(p.x, p.y || 0, p.z);
    }
    if (!pos.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ size: 5, color: 0xfff2a8, sizeAttenuation: false });
    const pts = new THREE.Points(g, m);
    this.layers.lights.add(pts);
    this.track(g); this.track(m);
  }

  buildChannels() {
    for (const coll of ['channels', 'tunnels']) {
      const map = this.model.entities[coll] || new Map();
      for (const ent of map.values()) {
        const color = originColor(ent.origin);
        if (coll === 'tunnels' && ent.attrs.points?.length) {
          const pts = ent.attrs.points.map(p => new THREE.Vector3(p.x, p.y || 0, p.z));
          const g = new THREE.BufferGeometry().setFromPoints(pts);
          const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
          this.layers.channels.add(new THREE.Line(g, m));
          this.track(g); this.track(m);
        } else if (coll === 'channels') {
          for (const seg of ent.attrs.segments || []) {
            for (const key of ['bed', 'walls']) {
              if (!seg[key]?.length) continue;
              const pts = seg[key].map(p => new THREE.Vector3(p.x, p.y || 0, p.z));
              const g = new THREE.BufferGeometry().setFromPoints(pts);
              const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
              this.layers.channels.add(new THREE.Line(g, m));
              this.track(g); this.track(m);
            }
          }
        }
      }
    }
  }

  buildSkeleton() {
    const sk = this.model.skeleton;
    if (!sk?.nodes?.length || !sk?.edges?.length) return;
    const pos = new Float32Array(sk.edges.length * 6);
    let j = 0;
    for (const [a, b] of sk.edges) {
      const na = sk.nodes[a], nb = sk.nodes[b];
      if (!na || !nb) continue;
      pos[j++] = na[0]; pos[j++] = na[1] + 0.05; pos[j++] = na[2];
      pos[j++] = nb[0]; pos[j++] = nb[1] + 0.05; pos[j++] = nb[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, j), 3));
    const m = new THREE.LineBasicMaterial({ color: COLORS.engine, transparent: true, opacity: 0.35 });
    const lines = new THREE.LineSegments(g, m);
    this.layers.skeleton.add(lines);
    this.track(g); this.track(m);
  }

  buildAnchors() {
    const gy = this.model.meta.plate.groundY || 0;
    for (const ent of (this.model.entities.anchors || new Map()).values()) {
      const g = new THREE.ConeGeometry(3, 8, 6);
      const color = ent.id === 'spawn' ? 0x6ff2ff : 0xffae42;
      const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(g, m);
      const p = ent.attrs || {};
      mesh.position.set(p.x || 0, gy + 4, p.z || 0);
      this.registerPick(mesh, { kind: 'anchor', id: ent.id });
      this.layers.anchors.add(mesh);
      this.track(g); this.track(m);
    }
  }

  buildDiagnostics() {
    // markers for diagnostics with refs that map to anchors/nodes
    // simple: anchor markers already shown; additional markers can be added later
  }

  buildRelief() {
    const r = this.model.meta.relief;
    if (!r?.hills?.length) return;
    const gy = r.baseY ?? this.model.meta.plate.groundY ?? 0;
    for (const h of r.hills) {
      const radius = h.radius || 10;
      const height = h.height || 1;
      const g = new THREE.ConeGeometry(radius, Math.max(1, height), 24, 1, true);
      const m = new THREE.MeshBasicMaterial({ color: 0x5c6b7d, transparent: true, opacity: 0.12, wireframe: false, side: THREE.DoubleSide, depthWrite: false });
      const mesh = new THREE.Mesh(g, m);
      mesh.position.set(h.x || 0, gy + height / 2, h.z || 0);
      this.layers.relief.add(mesh);
      this.track(g); this.track(m);
      const wg = new THREE.CircleGeometry(radius, 48);
      wg.rotateX(-Math.PI / 2);
      const wm = new THREE.MeshBasicMaterial({ color: 0x5c6b7d, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
      const w = new THREE.Mesh(wg, wm);
      w.position.set(h.x || 0, gy + 0.03, h.z || 0);
      this.layers.relief.add(w);
      this.track(wg); this.track(wm);
    }
  }

  updateGrid(viewManager) {
    // clear
    while (this.layers.grid.children.length) {
      const c = this.layers.grid.children.pop();
      c.geometry?.dispose?.();
      c.material?.dispose?.();
    }
    if (!this.gridOpts.enabled || !this.layerState.grid) return;
    const p = this.model.meta.plate;
    const gy = p.groundY || 0;
    const extent = { minX: p.minX, maxX: p.maxX, minZ: p.minZ, maxZ: p.maxZ };
    const mpp = viewManager.metersPerPixel();
    const step = this.gridOpts.step === 'auto' ? autoStep(mpp) : Number(this.gridOpts.step) || 100;
    const { major, minor, axes } = buildGridLines(extent, step, 5);
    const op = this.gridOpts.opacity ?? 0.5;
    const addLines = (arr, color, opacity) => {
      if (!arr.length) return;
      const pts = [];
      for (const l of arr) {
        if (l.axis === 'x') { pts.push(l.v, gy + 0.02, extent.minZ, l.v, gy + 0.02, extent.maxZ); }
        else { pts.push(extent.minX, gy + 0.02, l.v, extent.maxX, gy + 0.02, l.v); }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: opacity * op });
      this.layers.grid.add(new THREE.LineSegments(g, m));
    };
    addLines(minor, COLORS.gridMinor, 0.35);
    addLines(major, COLORS.gridMajor, 0.55);
    addLines(axes, COLORS.gridAxis, 0.9);
    this._gridStep = step;
  }

  applyLayerState() {
    for (const [k, g] of Object.entries(this.layers)) {
      if (k === 'grid') { g.visible = !!(this.layerState.grid && this.gridOpts.enabled); continue; }
      if (k === 'rails') { g.visible = !!this.layerState.roads && !!this.layerState.rails; continue; }
      g.visible = this.layerState[k] !== false;
    }
  }

  setLayer(name, on) { this.layerState[name] = !!on; this.applyLayerState(); }

  pick(screenX, screenY, viewManager) {
    const ray = new THREE.Raycaster();
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((screenX - rect.left) / rect.width) * 2 - 1,
      -((screenY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(ndc, viewManager.camera);
    // allow picking thin lines by threshold? raycaster line precision
    ray.params.Line = { threshold: 2 };
    ray.params.Points = { threshold: 6 };
    const hits = ray.intersectObjects(this.pickables, false);
    if (hits.length) return hits[0].object.userData.entityRef || null;
    return null;
  }

  highlight(selectedId, hoverId) {
    // simple: redraw not necessary; selection shown in UI/labels. keep state for future enhancement.
    this.selectedId = selectedId;
    this.hoverId = hoverId;
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }

  dispose() {
    for (const g of Object.values(this.layers)) {
      this.scene.remove(g);
    }
    for (const obj of this._disposables) { try { obj.dispose?.(); } catch {} }
    this._disposables = [];
    this.renderer.dispose();
  }
}
