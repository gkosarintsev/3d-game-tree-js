import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальные визуальные модели домов из docs/houses, собираемых generic-пайплайном
 * (classic-cottage, nordic-barn, modern-pavilion, a-frame, alpine-chalet, mansard-house).
 * Только картинка — коллизии/навигация остаются у данных здания.
 * Локальные координаты: центр XZ в (0,0), низ (основание/фундамент) в y=0.
 */

const DEG = Math.PI / 180;

function computeRoofRise(width, depth, roofPitchDeg, roofType) {
  const pitch = (roofPitchDeg || 0) * DEG;
  if (roofType === 'flat') return Math.max(0.25, Math.min(0.45, Math.tan(pitch) * 2.2));
  if (roofType === 'shed') {
    const span = Math.min(width, depth);
    return Math.max(0.5, Math.tan(pitch) * span * 0.72);
  }
  if (roofType === 'aframe') {
    const span = Math.min(width, depth);
    return Math.max(2.2, Math.tan(Math.max(pitch, 58 * DEG)) * (span / 2));
  }
  const span = Math.min(width, depth);
  return Math.max(0.8, Math.tan(pitch) * (span / 2));
}

function gableTri(spanW, riseH, thickness) {
  const half = spanW / 2;
  const sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, riseH); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  g.computeVertexNormals();
  return g;
}
function mansardTri(spanW, riseH, thickness) {
  const half = spanW / 2, kneeX = half * 0.56, kneeY = riseH * 0.68;
  const sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(kneeX, kneeY);
  sh.lineTo(0, riseH); sh.lineTo(-kneeX, kneeY); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: thickness, bevelEnabled: false });
  g.translate(0, 0, -thickness / 2);
  g.computeVertexNormals();
  return g;
}
function shedWedge(depth, riseH, width) {
  const halfD = depth / 2;
  const sh = new THREE.Shape();
  sh.moveTo(-halfD, 0); sh.lineTo(halfD, 0); sh.lineTo(-halfD, riseH); sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: false });
  g.translate(0, 0, -width / 2); g.rotateY(Math.PI / 2); g.computeVertexNormals();
  return g;
}

function hipRoofGeo(spanX, spanZ, riseH, ridgeLen, ridgeAlongX) {
  const hx = spanX / 2, hz = spanZ / 2;
  const rx = ridgeAlongX ? ridgeLen / 2 : 0, rz = ridgeAlongX ? 0 : ridgeLen / 2;
  const p0=[-hx,0,hz], p1=[hx,0,hz], p2=[hx,0,-hz], p3=[-hx,0,-hz];
  const r0 = ridgeAlongX ? [-rx,riseH,0] : [0,riseH,-rz];
  const r1 = ridgeAlongX ? [rx,riseH,0] : [0,riseH,rz];
  const pos=[], uvs=[];
  const tri=(a,b,c)=>{ pos.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]); uvs.push(a[0]*.25,a[2]*.25,b[0]*.25,b[2]*.25,c[0]*.25,c[2]*.25); };
  if (ridgeAlongX) { tri(p0,p1,r1); tri(p0,r1,r0); tri(p2,p3,r0); tri(p2,r0,r1); tri(p1,p2,r1); tri(p3,p0,r0); }
  else { tri(p1,p2,r0); tri(p1,r0,r1); tri(p3,p0,r1); tri(p3,r1,r0); tri(p0,p1,r1); tri(p2,p3,r0); }
  tri(p0,p3,p2); tri(p0,p2,p1);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs,2));
  g.computeVertexNormals();
  return g;
}

class Collector {
  constructor(materials) {
    this.mats = materials;
    this.geos = {}; // matKey -> geos
  }
  _push(key, geo) { (this.geos[key] ||= []).push(geo); }
  box(key, w, h, d, x, y, z, rx=0, ry=0, rz=0) {
    const g = new THREE.BoxGeometry(w,h,d).toNonIndexed();
    const m = new THREE.Matrix4();
    m.compose(new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)), new THREE.Vector3(1,1,1));
    g.applyMatrix4(m); this._push(key,g); return g;
  }
  cyl(key, r1, r2, h, x, y, z, rx=0, rz=0) {
    const g = new THREE.CylinderGeometry(r2,r1,h,12).toNonIndexed();
    const m = new THREE.Matrix4();
    m.compose(new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,0,rz)), new THREE.Vector3(1,1,1));
    g.applyMatrix4(m); this._push(key,g); return g;
  }
  geo(key, raw, x, y, z, ry=0, rx=0, rz=0) {
    const g = raw.index ? raw.toNonIndexed() : raw;
    const m = new THREE.Matrix4();
    m.compose(new THREE.Vector3(x,y,z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)), new THREE.Vector3(1,1,1));
    g.applyMatrix4(m); this._push(key,g); return g;
  }
  meshes() {
    const out = [];
    for (const [key, geos] of Object.entries(this.geos)) {
      if (!geos.length || !this.mats[key]) continue;
      const merged = mergeGeometries(geos, false);
      for (const g of geos) g.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, this.mats[key]);
      mesh.name = `Generic_${key}`;
      const glass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !glass;
      mesh.receiveShadow = key !== 'glass';
      out.push(mesh);
    }
    return out;
  }
}

function addWindow(c, cx, cy, cz, w, h, mullions, shutters) {
  const ft=0.065, fd=0.11;
  c.box('trim', w, ft, fd, cx, cy + h/2 - ft/2, cz);
  c.box('trim', w, ft, fd, cx, cy - h/2 + ft/2, cz);
  c.box('trim', ft, h - ft*2, fd, cx - w/2 + ft/2, cy, cz);
  c.box('trim', ft, h - ft*2, fd, cx + w/2 - ft/2, cy, cz);
  c.box('stoneStep', w+0.14, 0.06, fd+0.09, cx, cy - h/2 - 0.02, cz+0.035);
  const gw = Math.max(0.2, w-ft*1.8), gh = Math.max(0.2, h-ft*1.8);
  c.box('glassBacking', gw, gh, 0.02, cx, cy, cz-0.02);
  c.box('glass', gw, gh, 0.015, cx, cy, cz+0.008);
  if (mullions) { c.box('trim', 0.032, gh, 0.045, cx, cy, cz+0.01); c.box('trim', gw, 0.032, 0.045, cx, cy, cz+0.01); }
  if (shutters) {
    const sw = Math.min(0.26, w*0.26);
    c.box('door', sw, h, 0.04, cx - w/2 - sw/2 - 0.03, cy, cz+0.015);
    c.box('door', sw, h, 0.04, cx + w/2 + sw/2 + 0.03, cy, cz+0.015);
  }
}

function addDoor(c, cx, baseY, doorW, doorH, hasPorch, canopyStyle) {
  const frameT=0.08, frameD=0.14;
  c.box('trim', doorW + frameT*2, frameT, frameD, cx, baseY + doorH + frameT/2, 0);
  c.box('trim', frameT, doorH, frameD, cx - doorW/2 - frameT/2, baseY + doorH/2, 0);
  c.box('trim', frameT, doorH, frameD, cx + doorW/2 + frameT/2, baseY + doorH/2, 0);
  c.box('door', doorW, doorH, 0.06, cx, baseY + doorH/2, -0.02);
  c.box('glass', 0.16, doorH*0.62, 0.075, cx - doorW*0.22, baseY + doorH*0.54, -0.01);
  c.cyl('metalAccent', 0.018, 0.018, 0.42, cx + doorW*0.32, baseY + doorH*0.46, 0.045);
  if (hasPorch) {
    if (canopyStyle === 'pitched' || canopyStyle === 'timber-pergola') {
      const cw = doorW + 0.9, cd = 1.0, cy = baseY + doorH + 0.35;
      c.box('trim', cw, 0.08, cd, cx, cy, cd/2 - 0.1);
      c.box('roof', cw+0.1, 0.06, cd+0.1, cx, cy+0.12, cd/2 - 0.1, -0.35, 0);
      c.box('timberAccent', 0.1, doorH+0.3, 0.1, cx - cw/2 + 0.1, baseY + (doorH+0.3)/2, cd-0.2);
      c.box('timberAccent', 0.1, doorH+0.3, 0.1, cx + cw/2 - 0.1, baseY + (doorH+0.3)/2, cd-0.2);
    } else {
      const cw = doorW + 0.7, cd = 0.8, cy = baseY + doorH + 0.25;
      c.box('trim', cw, 0.06, cd, cx, cy, cd/2 - 0.05);
      c.box('glass', cw-0.1, 0.03, cd-0.1, cx, cy+0.04, cd/2 - 0.05);
    }
  }
}

export function buildDetailedGenericHouse(config, materials) {
  const { width, depth, floorHeight, floors, foundationHeight = 0.45, roofPitchDeg = 30, roofOverhang = 0.55 } = config.dimensions;
  const { roofType = 'gable', windowDensity = 2, windowScale = 1, hasPorch = true, hasChimney = true, hasCornerAccents = true, hasBalcony = false, hasDormers = false } = config.features || {};
  const styleId = config.styleId || 'classic-cottage';
  const isAFrame = roofType === 'aframe';
  const isChalet = styleId === 'alpine-chalet';
  const baseY = foundationHeight;
  const totalWallH = floorHeight * floors;
  const roofRise = computeRoofRise(width, depth, roofPitchDeg, roofType);
  const ridgeAlongX = width >= depth;

  const styleOpts = {
    'classic-cottage': { mullions:true, shutters:true, canopy:'pitched', winAspect:0.78 },
    'nordic-barn':    { mullions:false, shutters:false, canopy:'timber-pergola', winAspect:0.65 },
    'modern-pavilion':{ mullions:true, shutters:false, canopy:'cantilever', winAspect:1.25 },
    'a-frame':        { mullions:true, shutters:false, canopy:'timber-pergola', winAspect:0.9 },
    'alpine-chalet':  { mullions:true, shutters:true, canopy:'timber-pergola', winAspect:0.75 },
    'mansard-house':  { mullions:true, shutters:true, canopy:'pitched', winAspect:0.8 },
  }[styleId] || { mullions:true, shutters:false, canopy:'pitched', winAspect:0.8 };

  const c = new Collector(materials);

  // Foundation / plinth
  const plinthOver = 0.08;
  c.box('foundation', width + plinthOver*2, foundationHeight, depth + plinthOver*2, 0, foundationHeight/2, 0);
  c.box('stoneStep', width + plinthOver*2 + 0.06, 0.06, depth + plinthOver*2 + 0.06, 0, foundationHeight - 0.02, 0);
  if (hasPorch) {
    const porchW = Math.min(2.6, Math.max(1.8, width * 0.28));
    const porchD = 1.25;
    const porchH = Math.max(0.16, foundationHeight * 0.88);
    const frontZ = depth/2 + plinthOver;
    c.box('stoneStep', porchW, porchH, porchD, 0, porchH/2, frontZ + porchD/2);
    const stepCount = foundationHeight > 0.45 ? 2 : 1;
    for (let i=0;i<stepCount;i++) {
      const ratio = (stepCount - i) / (stepCount + 1);
      const stepH = porchH * ratio;
      const stepD = 0.34;
      c.box('foundation', porchW*0.86, stepH, stepD, 0, stepH/2, frontZ + porchD + stepD*(i+0.5));
    }
  }

  // Walls
  if (isAFrame) {
    const kneeH = 0.45;
    c.box('foundation', width, kneeH, depth, 0, baseY + kneeH/2, 0);
    c.geo('wall', gableTri(width, roofRise, depth), 0, baseY + kneeH, 0);
  } else {
    const useTwoTone = isChalet && floors === 2;
    if (useTwoTone) {
      c.box('wall', width, floorHeight, depth, 0, baseY + floorHeight/2, 0);
      c.box('timberAccent', width, floorHeight, depth, 0, baseY + floorHeight*1.5, 0);
    } else {
      c.box('wall', width, totalWallH, depth, 0, baseY + totalWallH/2, 0);
    }
    const upperKey = useTwoTone ? 'timberAccent' : 'wall';
    if (roofType === 'gable') {
      if (ridgeAlongX) c.geo(upperKey, gableTri(depth, roofRise, width), 0, baseY + totalWallH, 0, Math.PI/2);
      else c.geo(upperKey, gableTri(width, roofRise, depth), 0, baseY + totalWallH, 0);
    } else if (roofType === 'mansard') {
      if (ridgeAlongX) c.geo(upperKey, mansardTri(depth, roofRise, width), 0, baseY + totalWallH, 0, Math.PI/2);
      else c.geo(upperKey, mansardTri(width, roofRise, depth), 0, baseY + totalWallH, 0);
    } else if (roofType === 'shed') {
      c.geo(upperKey, shedWedge(depth, roofRise, width), 0, baseY + totalWallH, 0);
    }
    if (floors === 2) c.box('trim', width + 0.1, 0.12, depth + 0.1, 0, baseY + floorHeight, 0);
    if (hasCornerAccents) {
      const pw = 0.22;
      [[-width/2+pw*0.35,-depth/2+pw*0.35],[width/2-pw*0.35,-depth/2+pw*0.35],[-width/2+pw*0.35,depth/2-pw*0.35],[width/2-pw*0.35,depth/2-pw*0.35]].forEach(([cx,cz])=>{
        c.box('trim', pw, totalWallH+0.02, pw, cx, baseY + totalWallH/2, cz);
      });
    }
  }

  // Roof
  const eaveY = isAFrame ? baseY + 0.45 : baseY + totalWallH;
  if (roofType === 'flat') {
    const deckW = width + roofOverhang*1.1, deckD = depth + roofOverhang*1.1;
    c.box('roof', deckW, 0.22, deckD, 0, eaveY + 0.11, 0);
    const ph = roofRise, pt = 0.22;
    c.box('wall', deckW, ph, pt, 0, eaveY + 0.22 + ph/2, deckD/2 - pt/2);
    c.box('wall', deckW, ph, pt, 0, eaveY + 0.22 + ph/2, -deckD/2 + pt/2);
    c.box('wall', pt, ph, deckD - pt*2, -deckW/2 + pt/2, eaveY + 0.22 + ph/2, 0);
    c.box('wall', pt, ph, deckD - pt*2, deckW/2 - pt/2, eaveY + 0.22 + ph/2, 0);
  } else if (roofType === 'shed') {
    const slopeLen = Math.hypot(depth, roofRise) + roofOverhang*2;
    const angle = Math.atan2(roofRise, depth);
    c.box('roof', width + roofOverhang*2, 0.16, slopeLen, 0, eaveY + roofRise/2 + 0.07, 0, angle, 0);
  } else if (roofType === 'hip') {
    const spanX = width + roofOverhang*2, spanZ = depth + roofOverhang*2;
    const ridgeLen = Math.max(0.4, Math.abs(spanX - spanZ) + 0.4);
    c.geo('roof', hipRoofGeo(spanX, spanZ, roofRise + 0.14, ridgeLen, ridgeAlongX), 0, eaveY - 0.06, 0);
    const fH=0.14,fT=0.08;
    c.box('trim', spanX+0.04,fH,fT,0,eaveY-fH*0.35,spanZ/2); c.box('trim', spanX+0.04,fH,fT,0,eaveY-fH*0.35,-spanZ/2);
    c.box('trim', fT,fH,spanZ+0.04,-spanX/2,eaveY-fH*0.35,0); c.box('trim', fT,fH,spanZ+0.04,spanX/2,eaveY-fH*0.35,0);
  } else if (roofType === 'aframe') {
    const runHalf = width/2;
    const ridgeLength = depth + roofOverhang*2;
    const slopeAngle = Math.atan2(roofRise, runHalf);
    const panelSlopeLen = Math.hypot(runHalf, roofRise) + 0.32;
    const midX = runHalf*0.5 - Math.cos(slopeAngle)*0.08;
    const midY = eaveY + roofRise*0.5 + 0.06 - Math.sin(slopeAngle)*0.08;
    c.box('roof', panelSlopeLen, 0.16, ridgeLength, midX, midY, 0, 0, 0, -slopeAngle);
    c.box('roof', panelSlopeLen, 0.16, ridgeLength, -midX, midY, 0, 0, 0, slopeAngle);
    c.box('trim', 0.22, 0.14, ridgeLength+0.04, 0, eaveY + roofRise + 0.08, 0);
  } else if (roofType === 'mansard') {
    const runHalf = (ridgeAlongX ? depth : width) / 2;
    const ridgeLength = (ridgeAlongX ? width : depth) + roofOverhang*2;
    const kneeRun = runHalf*0.56, kneeY = roofRise*0.68;
    const dx1 = runHalf - kneeRun, dy1 = kneeY, a1 = Math.atan2(dy1, dx1), len1 = Math.hypot(dx1,dy1)+0.3;
    const dx2 = kneeRun, dy2 = roofRise - kneeY, a2 = Math.atan2(dy2, dx2), len2 = Math.hypot(dx2,dy2)+0.16;
    const midRun1 = (runHalf + kneeRun)/2 + 0.04, midY1 = eaveY + dy1/2 + 0.04;
    const midRun2 = kneeRun/2, midY2 = eaveY + kneeY + dy2/2 + 0.06;
    if (ridgeAlongX) {
      c.box('roof', ridgeLength, 0.16, len1, 0, midY1, midRun1, a1, 0);
      c.box('roof', ridgeLength, 0.16, len1, 0, midY1, -midRun1, -a1, 0);
      c.box('roof', ridgeLength, 0.16, len2, 0, midY2, midRun2, a2, 0);
      c.box('roof', ridgeLength, 0.16, len2, 0, midY2, -midRun2, -a2, 0);
    } else {
      c.box('roof', len1, 0.16, ridgeLength, midRun1, midY1, 0, 0, 0, -a1);
      c.box('roof', len1, 0.16, ridgeLength, -midRun1, midY1, 0, 0, 0, a1);
      c.box('roof', len2, 0.16, ridgeLength, midRun2, midY2, 0, 0, 0, -a2);
      c.box('roof', len2, 0.16, ridgeLength, -midRun2, midY2, 0, 0, 0, a2);
    }
    c.box('trim', (ridgeAlongX?ridgeLength:0.16)+0.04, 0.08, (ridgeAlongX?0.16:ridgeLength)+0.04, 0, eaveY + roofRise + 0.08, 0);
  } else { // gable
    const runHalf = (ridgeAlongX ? depth : width) / 2;
    const ridgeLength = (ridgeAlongX ? width : depth) + roofOverhang*2;
    const slopeLen = Math.hypot(runHalf, roofRise) + roofOverhang*1.2;
    const angle = Math.atan2(roofRise, runHalf);
    const mid = runHalf*0.5;
    if (ridgeAlongX) {
      c.box('roof', ridgeLength, 0.16, slopeLen, 0, eaveY + roofRise/2 + 0.06, mid, angle, 0);
      c.box('roof', ridgeLength, 0.16, slopeLen, 0, eaveY + roofRise/2 + 0.06, -mid, -angle, 0);
    } else {
      c.box('roof', slopeLen, 0.16, ridgeLength, mid, eaveY + roofRise/2 + 0.06, 0, 0, 0, -angle);
      c.box('roof', slopeLen, 0.16, ridgeLength, -mid, eaveY + roofRise/2 + 0.06, 0, 0, 0, angle);
    }
    c.box('trim', (ridgeAlongX?ridgeLength:0.18)+0.04, 0.1, (ridgeAlongX?0.18:ridgeLength)+0.04, 0, eaveY + roofRise + 0.06, 0);
  }

  // Front facade openings (simple, centered) - windows and door on +Z
  const frontZ = depth/2 + 0.02;
  const doorW = Math.min(1.1, width*0.14), doorH = Math.min(2.2, floorHeight*0.78);
  // door centered on front
  addDoor(c, 0, baseY, doorW, doorH, hasPorch, styleOpts.canopy);
  // windows: left/right on ground and upper floors
  const winW = Math.min(1.4, width * 0.16) * windowScale;
  const winH = Math.min(1.6, floorHeight * 0.55) * (1/styleOpts.winAspect < 1 ? 1 : 1);
  const winH2 = Math.max(0.8, Math.min(1.6, winW / styleOpts.winAspect));
  const cols = windowDensity >= 2 ? [-width*0.28, width*0.28] : [-width*0.25];
  if (windowDensity >= 3) cols.push(-width*0.12, width*0.12);
  for (let fl=0; fl<floors; fl++) {
    const cy = baseY + floorHeight*fl + floorHeight*0.55;
    // skip if aframe upper floors are inside triangle - keep simple
    if (isAFrame && fl > 0) continue;
    for (const wx of cols) {
      if (Math.abs(wx) < doorW*0.9 && fl===0) continue;
      addWindow(c, wx, cy, frontZ, winW, winH2, styleOpts.mullions, styleOpts.shutters && fl===0);
    }
  }
  // back windows
  const backZ = -depth/2 - 0.02;
  for (let fl=0; fl<floors; fl++) {
    if (isAFrame && fl > 0) continue;
    const cy = baseY + floorHeight*fl + floorHeight*0.55;
    for (const wx of cols) addWindow(c, wx, cy, backZ, winW, winH2, styleOpts.mullions, false);
  }
  // side windows
  for (const side of [-1,1]) {
    const sx = side*(width/2 + 0.02);
    for (let fl=0; fl<floors; fl++) {
      if (isAFrame && fl > 0) continue;
      const cy = baseY + floorHeight*fl + floorHeight*0.55;
      addWindow(c, 0, cy, 0, winW*0.9, winH2, styleOpts.mullions, false); // placeholder at center, oriented - easier: draw on Z via rotation not trivial here
    }
  }

  // Chimney
  if (hasChimney) {
    const chW=0.55,chD=0.45,chH=roofRise*0.55+0.6;
    const chX = width*0.22, chY = eaveY + chH/2 - 0.1, chZ = -depth*0.15;
    c.box('chimney', chW, chH, chD, chX, chY, chZ);
    c.box('stoneStep', chW+0.12, 0.1, chD+0.12, chX, eaveY + chH - 0.1, chZ);
  }

  // Balcony (simple)
  if (hasBalcony && floors >= 2 && !isAFrame) {
    const by = baseY + floorHeight + 0.02;
    c.box('stoneStep', width*0.5, 0.12, 1.0, 0, by, depth/2 + 0.5);
    c.box('metalAccent', width*0.5, 0.9, 0.04, 0, by + 0.45, depth/2 + 0.98);
  }

  return c.meshes();
}

export function makeGenericHouseMaterials(styleId, wallColorHex) {
  const wc = wallColorHex ? new THREE.Color(wallColorHex) : null;
  const wall = new THREE.MeshStandardMaterial({ color: wc || 0xe8e2d6, roughness: 0.85, metalness: 0.02 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x8b4a3a, roughness: 0.8, metalness: 0.05 });
  const trim = new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.6, metalness: 0.02 });
  const door = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.5, metalness: 0.05 });
  const foundation = new THREE.MeshStandardMaterial({ color: 0x7b8088, roughness: 0.9, metalness: 0.04 });
  const stoneStep = new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.8, metalness: 0.05 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9ec5d8, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0.0, transmission: 0.15 });
  const glassBacking = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.95 });
  const metalAccent = new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.5, metalness: 0.5 });
  const timberAccent = new THREE.MeshStandardMaterial({ color: 0x8b6a4a, roughness: 0.85, metalness: 0.02 });
  const chimney = new THREE.MeshStandardMaterial({ color: 0x7a6a5a, roughness: 0.9, metalness: 0.03 });
  // style tweaks
  if (styleId === 'nordic-barn') { wall.color.set(0x3a3f45); roof.color.set(0x2f3540); }
  if (styleId === 'modern-pavilion') { wall.color.set(wc||0xdfe5ea); roof.color.set(0x4b5563); }
  if (styleId === 'a-frame') { wall.color.set(wc||0xc9bfae); roof.color.set(0x5a4030); }
  if (styleId === 'alpine-chalet') { wall.color.set(wc||0xf0e6d8); roof.color.set(0x6b4a3a); }
  if (styleId === 'mansard-house') { wall.color.set(wc||0xe6ddd0); roof.color.set(0x4a5568); }
  return { wall, roof, trim, door, foundation, stoneStep, glass, glassBacking, metalAccent, timberAccent, chimney };
}
