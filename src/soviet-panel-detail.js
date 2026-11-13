import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальная визуальная модель панельного дома (по образцу docs/houses soviet-panel,
 * `builders/sovietPanelBuilder.ts`). Только картинка — коллизии/навигация остаются
 * у данных здания. Геометрия батчится по материалам.
 */

class Batcher {
  constructor() {
    this.buckets = { wall: [], roof: [], trim: [], door: [], foundation: [], stoneStep: [], glass: [], glassBacking: [], metalAccent: [] };
    this.unitBox = new THREE.BoxGeometry(1, 1, 1);
    this.unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10);
    this.mat4 = new THREE.Matrix4();
    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.scale = new THREE.Vector3();
    this.euler = new THREE.Euler();
  }
  addBox(bucket, w, h, d, x, y, z, rotY = 0) {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(0, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }
  addCylinder(bucket, radius, height, x, y, z) {
    const geo = this.unitCyl.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.quat.identity();
    this.scale.set(radius, height, radius);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }
  addWindow(w, h, x, y, z, facingBack, withMullions = true) {
    const dir = facingBack ? -1 : 1;
    const frameT = 0.06, frameD = 0.09;
    this.addBox('trim', w, frameT, frameD, x, y + h / 2 - frameT / 2, z);
    this.addBox('trim', w, frameT, frameD, x, y - h / 2 + frameT / 2, z);
    this.addBox('trim', frameT, h - frameT * 2, frameD, x - w / 2 + frameT / 2, y, z);
    this.addBox('trim', frameT, h - frameT * 2, frameD, x + w / 2 - frameT / 2, y, z);
    this.addBox('stoneStep', w + 0.12, 0.055, frameD + 0.08, x, y - h / 2 - 0.02, z + dir * 0.03);
    const gw = Math.max(0.2, w - frameT * 1.8), gh = Math.max(0.2, h - frameT * 1.8);
    this.addBox('glassBacking', gw, gh, 0.02, x, y, z - dir * 0.015);
    this.addBox('glass', gw, gh, 0.014, x, y, z + dir * 0.012);
    if (withMullions) {
      if (w >= 1.5) {
        this.addBox('trim', 0.035, gh, 0.045, x - gw * 0.17, y, z + dir * 0.006);
        this.addBox('trim', 0.035, gh, 0.045, x + gw * 0.17, y, z + dir * 0.006);
      } else {
        this.addBox('trim', 0.035, gh, 0.045, x, y, z + dir * 0.006);
      }
      this.addBox('trim', gw, 0.03, 0.045, x, y + gh * 0.22, z + dir * 0.006);
    }
  }
  addBalcony(w, floorY, floorH, x, wallZ, facingBack, winScale) {
    const dir = facingBack ? -1 : 1;
    const balconyD = 1.05, slabH = 0.13, railH = 0.96, screenH = 0.78;
    const centerZ = wallZ + dir * (balconyD / 2);
    const frontZ = wallZ + dir * (balconyD - 0.05);
    this.addBox('stoneStep', w, slabH, balconyD, x, floorY - slabH / 2, centerZ);
    const screenY = floorY + 0.12 + screenH / 2;
    this.addBox('wall', w, screenH, 0.09, x, screenY, frontZ);
    this.addBox('stoneStep', 0.08, screenH, balconyD - 0.08, x - w / 2 + 0.04, screenY, centerZ);
    this.addBox('stoneStep', 0.08, screenH, balconyD - 0.08, x + w / 2 - 0.04, screenY, centerZ);
    this.addBox('trim', w + 0.04, 0.05, 0.09, x, floorY + railH, frontZ);
    this.addBox('trim', 0.06, 0.05, balconyD, x - w / 2 + 0.04, floorY + railH, centerZ);
    this.addBox('trim', 0.06, 0.05, balconyD, x + w / 2 - 0.04, floorY + railH, centerZ);
    this.addBox('trim', 0.05, railH, 0.05, x - w / 2 + 0.04, floorY + railH / 2, frontZ);
    this.addBox('trim', 0.05, railH, 0.05, x + w / 2 - 0.04, floorY + railH / 2, frontZ);
    const doorW = 0.76, doorH = Math.min(2.12, floorH - 0.34), unitW = Math.min(w - 0.25, 1.85);
    const doorX = x - unitW * 0.25, doorY = floorY + doorH / 2, fz = wallZ + dir * 0.025;
    const dFrameT = 0.06, dFrameD = 0.085;
    this.addBox('trim', doorW + dFrameT * 2, dFrameT, dFrameD, doorX, floorY + doorH + dFrameT / 2, fz);
    this.addBox('trim', doorW + dFrameT * 2, dFrameT, dFrameD, doorX, floorY + dFrameT / 2, fz);
    this.addBox('trim', dFrameT, doorH, dFrameD, doorX - doorW / 2 - dFrameT / 2, doorY, fz);
    this.addBox('trim', dFrameT, doorH, dFrameD, doorX + doorW / 2 + dFrameT / 2, doorY, fz);
    const innerDoorH = doorH - dFrameT;
    this.addBox('glassBacking', doorW, innerDoorH, 0.02, doorX, doorY + dFrameT * 0.25, fz - dir * 0.01);
    this.addBox('glass', doorW, innerDoorH, 0.014, doorX, doorY + dFrameT * 0.25, fz + dir * 0.015);
    this.addBox('trim', doorW, doorH * 0.3, 0.055, doorX, floorY + doorH * 0.16, fz + dir * 0.02);
    const adjW = Math.max(0.65, unitW - doorW - 0.12);
    const adjH = Math.min(1.42 * winScale, floorH * 0.52);
    const adjX = doorX + doorW / 2 + adjW / 2 + 0.05;
    const adjY = floorY + floorH * 0.52;
    this.addWindow(adjW, adjH, adjX, adjY, fz, facingBack, false);
  }
  buildMeshes(materials) {
    this.unitBox.dispose();
    this.unitCyl.dispose();
    const meshes = [];
    for (const [key, geos] of Object.entries(this.buckets)) {
      if (!geos.length) continue;
      const merged = mergeGeometries(geos, false);
      for (const g of geos) g.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, materials[key]);
      mesh.name = `SovietPanel_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      meshes.push(mesh);
    }
    return meshes;
  }
}

/** Строит детальную панельку в локальных координатах (центр XZ в 0,0, основание на baseY). */
export function buildDetailedSovietPanel(config, materials) {
  const sectionW = config.width, depth = config.depth, floorHeight = config.floorHeight, floors = config.floors;
  const entrances = config.entrances ?? 3;
  const foundationHeight = config.foundationHeight ?? 0.85;
  const windowDensity = config.windowDensity ?? 2;
  const windowScale = config.windowScale ?? 1.0;
  const hasPorch = config.hasPorch !== false;
  const hasChimney = config.hasChimney !== false;
  const hasCornerAccents = config.hasCornerAccents !== false;
  const hasBalcony = config.hasBalcony !== false;
  const totalW = sectionW * entrances;
  const totalWallH = floorHeight * floors;
  const baseY = config.baseY ?? foundationHeight;
  const parapetH = 0.55;
  const batch = new Batcher();

  const plinthOverhang = 0.08;
  batch.addBox('foundation', totalW + plinthOverhang * 2, foundationHeight, depth + plinthOverhang * 2, 0, baseY - foundationHeight + foundationHeight / 2, 0);
  batch.addBox('stoneStep', totalW + plinthOverhang * 2 + 0.08, 0.08, depth + plinthOverhang * 2 + 0.08, 0, baseY - 0.03, 0);

  for (let e = 0; e < entrances; e++) {
    const sx = -totalW / 2 + sectionW * (e + 0.5);
    batch.addBox('wall', sectionW - 0.04, totalWallH, depth, sx, baseY + totalWallH / 2, 0);
    if (e < entrances - 1) {
      const jointX = -totalW / 2 + sectionW * (e + 1);
      batch.addBox('foundation', 0.09, totalWallH + 0.04, depth + 0.04, jointX, baseY + totalWallH / 2, 0);
    }
    if (foundationHeight >= 0.55) {
      const ventW = 0.72, ventH = Math.min(0.32, foundationHeight * 0.42), ventY = baseY - foundationHeight + foundationHeight * 0.52;
      for (const offset of [-sectionW * 0.3, sectionW * 0.3]) {
        batch.addBox('trim', ventW + 0.06, ventH + 0.06, 0.06, sx + offset, ventY, depth / 2 + plinthOverhang);
        batch.addBox('glassBacking', ventW, ventH, 0.08, sx + offset, ventY, depth / 2 + plinthOverhang + 0.01);
        batch.addBox('trim', ventW + 0.06, ventH + 0.06, 0.06, sx + offset, ventY, -depth / 2 - plinthOverhang);
        batch.addBox('glassBacking', ventW, ventH, 0.08, sx + offset, ventY, -depth / 2 - plinthOverhang - 0.01);
      }
    }
    const frontZ = depth / 2;
    const stoopW = 2.65, stoopD = 1.35, stoopH = Math.max(0.24, foundationHeight * 0.75);
    batch.addBox('stoneStep', stoopW, stoopH, stoopD, sx, baseY - foundationHeight + stoopH / 2, frontZ + plinthOverhang + stoopD / 2);
    const steps = foundationHeight > 0.7 ? 3 : 2;
    for (let s = 0; s < steps; s++) {
      const sh = stoopH * ((steps - s) / (steps + 1));
      const sd = 0.32;
      batch.addBox('foundation', stoopW * 0.88, sh, sd, sx, baseY - foundationHeight + sh / 2, frontZ + plinthOverhang + stoopD + sd * (s + 0.5));
    }
    const doorW = 1.36, doorH = Math.min(2.18, floorHeight - 0.35), doorBaseY = baseY - foundationHeight + stoopH;
    const eFrameT = 0.09, eFrameD = 0.14;
    batch.addBox('trim', doorW + eFrameT * 2, eFrameT, eFrameD, sx, doorBaseY + doorH + eFrameT / 2, frontZ + 0.03);
    batch.addBox('trim', eFrameT, doorH, eFrameD, sx - doorW / 2 - eFrameT / 2, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('trim', eFrameT, doorH, eFrameD, sx + doorW / 2 + eFrameT / 2, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('door', doorW, doorH, 0.08, sx, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('glassBacking', 0.24, doorH * 0.52, 0.03, sx - doorW * 0.22, doorBaseY + doorH * 0.56, frontZ + 0.065);
    batch.addBox('glass', 0.24, doorH * 0.52, 0.02, sx - doorW * 0.22, doorBaseY + doorH * 0.56, frontZ + 0.082);
    batch.addBox('metalAccent', 0.14, 0.24, 0.04, sx + doorW * 0.56, doorBaseY + 1.28, frontZ + 0.08);
    batch.addBox('metalAccent', 0.04, 0.28, 0.05, sx + doorW * 0.28, doorBaseY + 1.08, frontZ + 0.085);
    if (hasPorch) {
      const canopyW = 2.85, canopyD = 1.35, canopyY = doorBaseY + doorH + 0.24;
      batch.addBox('stoneStep', canopyW, 0.13, canopyD, sx, canopyY, frontZ + canopyD / 2);
      batch.addBox('stoneStep', 0.12, 0.65, canopyD - 0.18, sx - canopyW / 2 + 0.06, canopyY - 0.32, frontZ + (canopyD - 0.18) / 2);
      batch.addBox('stoneStep', 0.12, 0.65, canopyD - 0.18, sx + canopyW / 2 - 0.06, canopyY - 0.32, frontZ + (canopyD - 0.18) / 2);
    }
    batch.addBox('trim', 0.14, totalWallH, 0.08, sx - 0.84, baseY + totalWallH / 2, frontZ + 0.02);
    batch.addBox('trim', 0.14, totalWallH, 0.08, sx + 0.84, baseY + totalWallH / 2, frontZ + 0.02);
    const stairWinW = 1.24, stairWinH = Math.min(1.52, floorHeight * 0.54);
    for (let f = 0; f < floors - 1; f++) {
      batch.addWindow(stairWinW, stairWinH, sx, baseY + (f + 0.92) * floorHeight, frontZ + 0.025, false, true);
    }
    const baysPerSide = windowDensity === 1 ? 1 : windowDensity === 2 ? 2 : sectionW >= 14.5 ? 3 : 2;
    const bayStart = 1.65, bayEnd = sectionW / 2 - 0.72, baySpan = Math.max(1.8, (bayEnd - bayStart) / baysPerSide);
    const winW = Math.min(2.05, baySpan * 0.74) * (0.9 + windowScale * 0.1), winH = Math.min(floorHeight * 0.56, 1.52 * windowScale), balW = Math.min(2.75, baySpan * 0.84);
    for (let f = 0; f < floors; f++) {
      const floorBottomY = baseY + f * floorHeight, winCenterY = floorBottomY + floorHeight * 0.53;
      for (const side of [-1, 1]) {
        for (let b = 0; b < baysPerSide; b++) {
          const bx = sx + side * (bayStart + (b + 0.5) * baySpan);
          const isBalconyBay = hasBalcony && f >= 1 && b === baysPerSide - 1;
          if (isBalconyBay) batch.addBalcony(balW, floorBottomY, floorHeight, bx, frontZ, false, windowScale);
          else batch.addWindow(winW, winH, bx, winCenterY, frontZ + 0.025, false, true);
        }
      }
      const rearCount = Math.max(2, windowDensity * 2), rearUsableW = sectionW - 1.5, rearBaySpan = rearUsableW / rearCount;
      const rearWinW = Math.min(2.0, rearBaySpan * 0.72) * (0.9 + windowScale * 0.1), rearBalW = Math.min(2.65, rearBaySpan * 0.84);
      for (let rb = 0; rb < rearCount; rb++) {
        const rx = sx - rearUsableW / 2 + (rb + 0.5) * rearBaySpan;
        const isRearBalcony = hasBalcony && f >= 1 && (rb === 0 || rb === rearCount - 1);
        if (isRearBalcony) batch.addBalcony(rearBalW, floorBottomY, floorHeight, rx, -depth / 2, true, windowScale);
        else batch.addWindow(rearWinW, winH, rx, winCenterY, -depth / 2 - 0.025, true, true);
      }
    }
    const pipeX = e === 0 ? sx - sectionW / 2 + 0.38 : sx - sectionW / 2 + 0.25;
    batch.addCylinder('metalAccent', 0.065, totalWallH + 0.2, pipeX, baseY + totalWallH / 2, frontZ + 0.09);
    batch.addCylinder('metalAccent', 0.065, totalWallH + 0.2, pipeX, baseY + totalWallH / 2, -depth / 2 - 0.09);
  }

  if (hasCornerAccents) {
    for (let f = 1; f < floors; f++) batch.addBox('foundation', totalW + 0.04, 0.045, depth + 0.04, 0, baseY + f * floorHeight, 0);
    for (let sp = 1; sp < 3; sp++) {
      const sz = -depth / 2 + (sp / 3) * depth;
      batch.addBox('foundation', 0.04, totalWallH, 0.06, -totalW / 2 - 0.01, baseY + totalWallH / 2, sz);
      batch.addBox('foundation', 0.04, totalWallH, 0.06, totalW / 2 + 0.01, baseY + totalWallH / 2, sz);
    }
  }
  if (windowDensity === 3) {
    for (let f = 1; f < floors; f++) {
      const wy = baseY + f * floorHeight + floorHeight * 0.53;
      for (const sideSign of [-1, 1]) {
        const wx = sideSign * (totalW / 2 + 0.02);
        batch.addBox('trim', 0.08, 1.35, 1.1, wx, wy, 0);
        batch.addBox('glassBacking', 0.03, 1.25, 1.0, wx + sideSign * 0.02, wy, 0);
        batch.addBox('glass', 0.02, 1.25, 1.0, wx + sideSign * 0.036, wy, 0);
      }
    }
  }

  const roofY = baseY + totalWallH, parapetT = 0.24;
  batch.addBox('stoneStep', totalW + 0.22, 0.14, depth + 0.22, 0, roofY - 0.05, 0);
  batch.addBox('roof', totalW - 0.1, 0.18, depth - 0.1, 0, roofY + 0.06, 0);
  batch.addBox('wall', totalW, parapetH, parapetT, 0, roofY + parapetH / 2, depth / 2 - parapetT / 2);
  batch.addBox('wall', totalW, parapetH, parapetT, 0, roofY + parapetH / 2, -depth / 2 + parapetT / 2);
  batch.addBox('wall', parapetT, parapetH, depth - parapetT * 2, -totalW / 2 + parapetT / 2, roofY + parapetH / 2, 0);
  batch.addBox('wall', parapetT, parapetH, depth - parapetT * 2, totalW / 2 - parapetT / 2, roofY + parapetH / 2, 0);
  const copingY = roofY + parapetH + 0.03;
  batch.addBox('trim', totalW + 0.06, 0.06, parapetT + 0.06, 0, copingY, depth / 2 - parapetT / 2);
  batch.addBox('trim', totalW + 0.06, 0.06, parapetT + 0.06, 0, copingY, -depth / 2 + parapetT / 2);
  batch.addBox('trim', parapetT + 0.06, 0.06, depth + 0.06, -totalW / 2 + parapetT / 2, copingY, 0);
  batch.addBox('trim', parapetT + 0.06, 0.06, depth + 0.06, totalW / 2 - parapetT / 2, copingY, 0);
  if (hasChimney) {
    for (let e = 0; e < entrances; e++) {
      const sx = -totalW / 2 + sectionW * (e + 0.5);
      const liftW = 3.0, liftD = 2.5, liftH = floors >= 7 ? 2.65 : 2.15;
      batch.addBox('wall', liftW, liftH, liftD, sx, roofY + liftH / 2 + 0.1, -0.6);
      batch.addBox('roof', liftW + 0.18, 0.12, liftD + 0.18, sx, roofY + liftH + 0.16, -0.6);
      batch.addBox('trim', liftW + 0.22, 0.06, liftD + 0.22, sx, roofY + liftH + 0.22, -0.6);
      batch.addBox('door', 0.85, 1.65, 0.08, sx, roofY + 0.95, -0.6 + liftD / 2 + 0.02);
      for (const vxOff of [-sectionW * 0.26, sectionW * 0.26]) {
        const vx = sx + vxOff;
        batch.addBox('stoneStep', 0.9, 1.05, 0.9, vx, roofY + 0.62, 1.1);
        batch.addBox('trim', 1.04, 0.08, 1.04, vx, roofY + 1.18, 1.1);
      }
      if (e === 0) {
        const mastX = sx + 0.8, mastBaseY = roofY + liftH + 0.24;
        batch.addCylinder('metalAccent', 0.035, 3.2, mastX, mastBaseY + 1.6, -0.6);
        batch.addBox('metalAccent', 1.4, 0.035, 0.035, mastX, mastBaseY + 2.85, -0.6);
        batch.addBox('metalAccent', 0.95, 0.03, 0.03, mastX, mastBaseY + 2.45, -0.6);
      }
    }
  }

  return batch.buildMeshes(materials);
}

/** Материалы для детальной панельки (приближённые к docs/houses). */
export function makeSovietPanelMaterials(wallColorHex = '#d6d0c4') {
  const mk = (color, roughness = 0.8, metalness = 0.05, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    wall: mk(new THREE.Color(wallColorHex), 0.84, 0.03),
    roof: mk(0x4b5563, 0.65, 0.08),
    trim: mk(0xf5f4ef, 0.42, 0.12),
    door: mk(0x2c4a3e, 0.45, 0.45),
    foundation: mk(0x6b7280, 0.88, 0.04),
    stoneStep: mk(0x9ca3af, 0.78, 0.05),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x6f8a99, transparent: true, opacity: 0.48, roughness: 0.05, metalness: 0.0, transmission: 0.2 }),
    glassBacking: mk(0x0f1520, 0.9, 0.0),
    metalAccent: mk(0x555b63, 0.5, 0.55),
  };
}
