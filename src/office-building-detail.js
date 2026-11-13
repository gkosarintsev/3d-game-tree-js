import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальная визуальная модель офисного здания (docs/houses office-building,
 * `builders/officeBuildingBuilder.ts`). Только картинка — коллизии/навигация
 * остаются у данных здания.
 *
 * Модель строится в локальных координатах: центр XZ в (0,0), низ (уровень земли
 * / основание стилобата) в y=0. Вызывающий код смещает по baseY здания.
 */

class Batcher {
  constructor() {
    this.buckets = {
      wall: [], roof: [], trim: [], door: [],
      foundation: [], stoneStep: [], glass: [], glassBacking: [], metalAccent: [],
    };
    this.unitBox = new THREE.BoxGeometry(1, 1, 1);
    this.unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
    this.mat4 = new THREE.Matrix4();
    this.pos = new THREE.Vector3();
    this.quat = new THREE.Quaternion();
    this.scale = new THREE.Vector3();
    this.euler = new THREE.Euler();
  }
  addBox(bucket, w, h, d, x, y, z, rotX = 0, rotY = 0, rotZ = 0) {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(rotX, rotY, rotZ);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }
  addCylinder(bucket, radiusBottom, radiusTop, height, x, y, z, rotX = 0, rotZ = 0) {
    const geo = radiusBottom === radiusTop
      ? this.unitCyl.clone().toNonIndexed()
      : new THREE.CylinderGeometry(radiusTop, radiusBottom, 1, 16).toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(rotX, 0, rotZ);
    this.quat.setFromEuler(this.euler);
    this.scale.set(
      radiusBottom === radiusTop ? radiusBottom : 1,
      height,
      radiusBottom === radiusTop ? radiusBottom : 1,
    );
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }
  addGeometry(bucket, rawGeo, x, y, z, rotY = 0) {
    const geo = rawGeo.index ? rawGeo.toNonIndexed() : rawGeo.clone();
    rawGeo.dispose?.();
    this.pos.set(x, y, z);
    this.euler.set(0, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(1, 1, 1);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
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
      mesh.name = `Office_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      meshes.push(mesh);
    }
    return meshes;
  }
}

function createClerestoryWedge(width, depth, rise) {
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hd, 0);
  shape.lineTo(hd, 0);
  shape.lineTo(hd, rise);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Строит детальное офисное здание (порт docs/houses officeBuildingBuilder).
 */
export function buildDetailedOfficeBuilding(config, materials) {
  const width = config.width;
  const depth = config.depth;
  const floorHeight = config.floorHeight;
  const floors = config.floors;
  const foundationHeight = config.foundationHeight ?? 0.7;
  const roofPitchDeg = config.roofPitchDeg ?? 10;
  const roofOverhang = config.roofOverhang ?? 0.35;
  const roofType = config.roofType ?? 'flat';
  const windowDensity = config.windowDensity ?? 2;
  const windowScale = config.windowScale ?? 1.08;
  const hasPorch = config.hasPorch !== false;
  const hasChimney = config.hasChimney !== false;
  const hasCornerAccents = config.hasCornerAccents !== false;
  const hasBalcony = config.hasBalcony !== false;

  const batch = new Batcher();
  const baseY = foundationHeight;

  // 1. Granite Stylobate Plinth
  const plinthW = width + 1.8;
  const plinthD = depth + 1.6;
  batch.addBox('foundation', plinthW, foundationHeight, plinthD, 0, foundationHeight / 2, 0);
  batch.addBox('stoneStep', plinthW + 0.16, 0.14, plinthD + 0.16, 0, foundationHeight - 0.05, 0);

  // Broad corporate entry steps on +Z
  const stepCount = 3;
  const stepSpan = Math.min(plinthW * 0.44, 11.0);
  for (let s = 0; s < stepCount; s++) {
    const sh = foundationHeight * ((stepCount - s) / (stepCount + 1));
    const sd = 0.48;
    batch.addBox('stoneStep', stepSpan, sh, sd, 0, sh / 2, plinthD / 2 + sd * (s + 0.5));
  }

  // 2. Massing Tiers
  const hasSteppedTier = roofType === 'stepped' && floors >= 3;
  const lowerFloors = hasSteppedTier ? Math.max(2, Math.floor(floors * 0.68)) : floors;
  const upperFloors = hasSteppedTier ? floors - lowerFloors : 0;

  const tiers = [{ w: width, d: depth, offsetX: 0, offsetZ: 0, startFloor: 0, endFloor: lowerFloors }];
  if (upperFloors > 0) {
    const upW = Math.max(12, width * 0.72);
    const upD = Math.max(9.5, depth * 0.74);
    tiers.push({
      w: upW, d: upD,
      offsetX: -(width - upW) * 0.32,
      offsetZ: -(depth - upD) * 0.36,
      startFloor: lowerFloors, endFloor: floors,
    });
  }

  // 3. Ground-Floor Recessed Corporate Lobby
  const lobbyFloorHeight = floorHeight;
  const getFloorBottomY = (f) => f === 0 ? baseY : baseY + lobbyFloorHeight + (f - 1) * floorHeight;
  const getFloorHeight = (f) => (f === 0 ? lobbyFloorHeight : floorHeight);

  if (hasPorch) {
    const inset = 0.85;
    const lobW = width - inset * 2;
    const lobD = depth - inset * 2;
    const lobY = baseY + lobbyFloorHeight / 2;

    batch.addBox('glassBacking', lobW - 0.16, lobbyFloorHeight - 0.24, lobD - 0.16, 0, lobY, 0);
    batch.addBox('glass', lobW, lobbyFloorHeight - 0.2, lobD, 0, lobY, 0);
    batch.addBox('wall', width + 0.16, 0.34, depth + 0.16, 0, baseY + lobbyFloorHeight - 0.12, 0);

    const pierCols = Math.max(4, Math.round(width / 5.4));
    for (let i = 0; i <= pierCols; i++) {
      const px = -width / 2 + 0.4 + (i / pierCols) * (width - 0.8);
      batch.addBox('stoneStep', 0.56, lobbyFloorHeight, 0.56, px, lobY, depth / 2 - 0.28);
      batch.addBox('stoneStep', 0.56, lobbyFloorHeight, 0.56, px, lobY, -depth / 2 + 0.28);
    }
    const sidePiers = Math.max(2, Math.round(depth / 5.2));
    for (let i = 1; i < sidePiers; i++) {
      const pz = -depth / 2 + 0.4 + (i / sidePiers) * (depth - 0.8);
      batch.addBox('stoneStep', 0.56, lobbyFloorHeight, 0.56, -width / 2 + 0.28, lobY, pz);
      batch.addBox('stoneStep', 0.56, lobbyFloorHeight, 0.56, width / 2 - 0.28, lobY, pz);
    }

    const mullionCols = Math.max(6, Math.round(lobW / 2.6));
    for (let i = 1; i < mullionCols; i++) {
      const mx = -lobW / 2 + (i / mullionCols) * lobW;
      batch.addBox('trim', 0.08, lobbyFloorHeight - 0.25, 0.1, mx, lobY, lobD / 2 + 0.01);
      batch.addBox('trim', 0.08, lobbyFloorHeight - 0.25, 0.1, mx, lobY, -lobD / 2 - 0.01);
    }

    const canopyW = Math.min(width * 0.36, 9.2);
    const canopyD = 3.2;
    const canopyY = baseY + Math.min(lobbyFloorHeight - 0.45, 3.85);
    const canopyZ = depth / 2 + canopyD / 2 - 0.25;
    batch.addBox('trim', canopyW, 0.16, canopyD, 0, canopyY, canopyZ);
    batch.addBox('glass', canopyW - 0.36, 0.05, canopyD - 0.36, 0, canopyY + 0.08, canopyZ);
    batch.addBox('metalAccent', canopyW + 0.06, 0.08, 0.12, 0, canopyY, canopyZ + canopyD / 2);

    for (const rx of [-canopyW * 0.38, canopyW * 0.38]) {
      batch.addBox('metalAccent', 0.06, 0.06, canopyD * 1.12, rx, canopyY + 0.55, depth / 2 + canopyD * 0.38, 0.38, 0);
    }

    const doorW = Math.min(canopyW * 0.56, 4.4);
    const doorH = Math.min(lobbyFloorHeight - 0.65, 3.15);
    const doorZ = lobD / 2 + 0.06;
    batch.addBox('trim', doorW + 0.28, doorH + 0.18, 0.24, 0, baseY + (doorH + 0.18) / 2, doorZ);
    batch.addBox('door', doorW, doorH, 0.14, 0, baseY + doorH / 2, doorZ + 0.02);
    batch.addBox('glassBacking', doorW - 0.48, doorH - 0.36, 0.16, 0, baseY + doorH / 2, doorZ + 0.03);
    batch.addBox('glass', doorW - 0.48, doorH - 0.36, 0.18, 0, baseY + doorH / 2, doorZ + 0.04);
    batch.addBox('metalAccent', 0.1, doorH, 0.22, 0, baseY + doorH / 2, doorZ + 0.06);
    batch.addBox('metalAccent', 0.05, 0.9, 0.14, -0.35, baseY + 1.35, doorZ + 0.12);
    batch.addBox('metalAccent', 0.05, 0.9, 0.14, 0.35, baseY + 1.35, doorZ + 0.12);
  }

  // 4. Upper floors tier by tier
  const glassRatio = Math.min(0.76, Math.max(0.46, 0.62 * windowScale));
  const finSpacing = windowDensity === 1 ? 4.8 : windowDensity === 2 ? 3.2 : 2.2;

  tiers.forEach((tier, tierIdx) => {
    const startF = Math.max(tier.startFloor, hasPorch ? 1 : 0);
    if (startF >= tier.endFloor) return;

    const tw = tier.w, td = tier.d, ox = tier.offsetX, oz = tier.offsetZ;
    const tierBottomY = getFloorBottomY(startF);
    const tierTopY = getFloorBottomY(tier.endFloor);
    const tierH = tierTopY - tierBottomY;

    batch.addBox('glassBacking', tw - 0.24, tierH, td - 0.24, ox, tierBottomY + tierH / 2, oz);

    for (let f = startF; f < tier.endFloor; f++) {
      const fy = getFloorBottomY(f);
      const fh = getFloorHeight(f);
      const glassH = fh * glassRatio;
      const spandrelH = fh - glassH;

      batch.addBox('wall', tw, spandrelH, td, ox, fy + spandrelH / 2, oz);
      batch.addBox('glass', tw - 0.12, glassH, td - 0.12, ox, fy + spandrelH + glassH / 2, oz);

      if (hasBalcony) {
        const sunY = fy + spandrelH + glassH - 0.06;
        const sunD = 0.42;
        batch.addBox('metalAccent', tw + 0.18, 0.06, sunD, ox, sunY, oz + td / 2 + sunD * 0.35);
        batch.addBox('metalAccent', sunD, 0.06, td + 0.18, ox + tw / 2 + sunD * 0.35, sunY, oz);
        batch.addBox('metalAccent', sunD, 0.06, td + 0.18, ox - tw / 2 - sunD * 0.35, sunY, oz);
      }
    }

    batch.addBox('wall', tw + 0.04, 0.32, td + 0.04, ox, tierTopY - 0.16, oz);

    if (hasCornerAccents) {
      const colW = 0.82;
      const corners = [
        [ox - tw / 2 + colW * 0.35, oz - td / 2 + colW * 0.35],
        [ox + tw / 2 - colW * 0.35, oz - td / 2 + colW * 0.35],
        [ox - tw / 2 + colW * 0.35, oz + td / 2 - colW * 0.35],
        [ox + tw / 2 - colW * 0.35, oz + td / 2 - colW * 0.35],
      ];
      for (const [cx, cz] of corners) {
        batch.addBox('wall', colW, tierH + 0.04, colW, cx, tierBottomY + tierH / 2, cz);
        batch.addBox('trim', colW * 0.24, tierH + 0.06, colW * 0.24, cx + (cx > ox ? colW * 0.42 : -colW * 0.42), tierBottomY + tierH / 2, cz + (cz > oz ? colW * 0.42 : -colW * 0.42));
      }
      if (tierIdx === 0 && hasPorch) {
        const portalSpan = Math.min(width * 0.36, 9.2);
        for (const px of [-portalSpan * 0.54, portalSpan * 0.54]) {
          batch.addBox('wall', 0.52, tierH + 0.1, 0.44, ox + px, tierBottomY + tierH / 2, oz + td / 2 + 0.08);
        }
      }
    }

    const countX = Math.max(4, Math.round(tw / finSpacing));
    const usableX = tw - 1.6;
    const finDepth = hasCornerAccents ? 0.24 : 0.13;
    for (let i = 0; i <= countX; i++) {
      const fx = ox - usableX / 2 + (i / countX) * usableX;
      batch.addBox('trim', 0.14, tierH, finDepth, fx, tierBottomY + tierH / 2, oz + td / 2 + finDepth * 0.22);
      batch.addBox('trim', 0.14, tierH, finDepth, fx, tierBottomY + tierH / 2, oz - td / 2 - finDepth * 0.22);
    }
    const countZ = Math.max(3, Math.round(td / finSpacing));
    const usableZ = td - 1.6;
    for (let i = 0; i <= countZ; i++) {
      const fz = oz - usableZ / 2 + (i / countZ) * usableZ;
      batch.addBox('trim', finDepth, tierH, 0.14, ox + tw / 2 + finDepth * 0.22, tierBottomY + tierH / 2, fz);
      batch.addBox('trim', finDepth, tierH, 0.14, ox - tw / 2 - finDepth * 0.22, tierBottomY + tierH / 2, fz);
    }

    if (tierIdx < tiers.length - 1) {
      batch.addBox('roof', tw - 0.1, 0.22, td - 0.1, ox, tierTopY + 0.05, oz);
      batch.addBox('trim', tw + 0.22, 0.18, td + 0.22, ox, tierTopY + 0.09, oz);
      if (hasBalcony) {
        const railH = 1.08;
        const railY = tierTopY + 0.18 + railH / 2;
        batch.addBox('glass', tw - 0.14, railH, 0.05, ox, railY, oz + td / 2 - 0.06);
        batch.addBox('glass', tw - 0.14, railH, 0.05, ox, railY, oz - td / 2 + 0.06);
        batch.addBox('glass', 0.05, railH, td - 0.14, ox - tw / 2 + 0.06, railY, oz);
        batch.addBox('glass', 0.05, railH, td - 0.14, ox + tw / 2 - 0.06, railY, oz);
        batch.addBox('trim', tw, 0.06, 0.09, ox, railY + railH / 2, oz + td / 2 - 0.06);
        batch.addBox('trim', tw, 0.06, 0.09, ox, railY + railH / 2, oz - td / 2 + 0.06);
        batch.addBox('trim', 0.09, 0.06, td, ox - tw / 2 + 0.06, railY + railH / 2, oz);
        batch.addBox('trim', 0.09, 0.06, td, ox + tw / 2 - 0.06, railY + railH / 2, oz);
      }
    }
  });

  // 5. Roof, cornice, parapet, crown
  const topTier = tiers[tiers.length - 1];
  const topW = topTier.w, topD = topTier.d, topOx = topTier.offsetX, topOz = topTier.offsetZ;
  const roofY = getFloorBottomY(floors);

  const corniceExtra = roofOverhang * 1.4;
  batch.addBox('roof', topW + corniceExtra * 0.4, 0.24, topD + corniceExtra * 0.4, topOx, roofY + 0.12, topOz);
  batch.addBox('trim', topW + corniceExtra, 0.26, topD + corniceExtra, topOx, roofY + 0.13, topOz);

  const parapetH = roofType === 'flat' ? 0.85 : 0.72;
  const parapetY = roofY + 0.24 + parapetH / 2;
  const pt = 0.28;
  batch.addBox('wall', topW, parapetH, pt, topOx, parapetY, topOz + topD / 2 - pt / 2);
  batch.addBox('wall', topW, parapetH, pt, topOx, parapetY, topOz - topD / 2 + pt / 2);
  batch.addBox('wall', pt, parapetH, topD - pt * 2, topOx - topW / 2 + pt / 2, parapetY, topOz);
  batch.addBox('wall', pt, parapetH, topD - pt * 2, topOx + topW / 2 - pt / 2, parapetY, topOz);

  const copeY = roofY + 0.24 + parapetH + 0.05;
  batch.addBox('trim', topW + 0.12, 0.1, pt + 0.1, topOx, copeY, topOz + topD / 2 - pt / 2);
  batch.addBox('trim', topW + 0.12, 0.1, pt + 0.1, topOx, copeY, topOz - topD / 2 + pt / 2);
  batch.addBox('trim', pt + 0.1, 0.1, topD + 0.08, topOx - topW / 2 + pt / 2, copeY, topOz);
  batch.addBox('trim', pt + 0.1, 0.1, topD + 0.08, topOx + topW / 2 - pt / 2, copeY, topOz);

  if (roofType === 'shed') {
    const slantRise = Math.max(2.2, Math.tan((roofPitchDeg * Math.PI) / 180) * (topD * 0.35));
    const skyW = topW * 0.84;
    const skyD = topD * 0.72;
    const wedge = createClerestoryWedge(skyW, skyD, slantRise);
    batch.addGeometry('wall', wedge, topOx, roofY + 0.22, topOz);

    if (slantRise > 0.7) {
      batch.addBox('glassBacking', skyW - 0.5, slantRise - 0.32, 0.16, topOx, roofY + 0.22 + slantRise * 0.5, topOz + skyD / 2 - 0.06);
      batch.addBox('glass', skyW - 0.5, slantRise - 0.32, 0.1, topOx, roofY + 0.22 + slantRise * 0.5, topOz + skyD / 2 + 0.02);
      batch.addBox('trim', skyW + 0.6, 0.18, 0.65, topOx, roofY + 0.22 + slantRise, topOz + skyD / 2 + 0.16);
    }

    const slopeLen = Math.hypot(skyD, slantRise);
    const slopeAngle = Math.atan2(slantRise, skyD);
    batch.addBox('glass', skyW - 0.35, 0.09, slopeLen, topOx, roofY + 0.22 + slantRise / 2 + 0.09, topOz, -slopeAngle, 0);
  } else if (hasChimney) {
    const plantW = Math.min(topW * 0.42, 9.6);
    const plantD = Math.min(topD * 0.36, 5.2);
    const plantH = 1.75;
    const px = topOx - topW * 0.16;
    const pz = topOz - topD * 0.12;
    batch.addBox('foundation', plantW, plantH, plantD, px, roofY + 0.24 + plantH / 2, pz);
    batch.addBox('trim', plantW + 0.18, 0.14, plantD + 0.18, px, roofY + 0.24 + plantH, pz);
    for (let lv = 0; lv < 4; lv++) {
      const ly = roofY + 0.48 + lv * 0.34;
      batch.addBox('metalAccent', plantW + 0.08, 0.06, plantD + 0.08, px, ly, pz);
    }

    const chX = topOx + topW * 0.22;
    for (const czOff of [-plantD * 0.24, plantD * 0.24]) {
      batch.addBox('metalAccent', 1.85, 0.95, 1.45, chX, roofY + 0.72, pz + czOff);
      batch.addCylinder('trim', 0.48, 0.48, 0.12, chX, roofY + 1.24, pz + czOff);
    }

    const signW = Math.min(topW * 0.32, 6.4);
    batch.addBox('trim', signW, 0.72, 0.16, topOx, copeY + 0.36, topOz + topD / 2 - 0.12);
    batch.addBox('metalAccent', signW - 0.3, 0.46, 0.18, topOx, copeY + 0.36, topOz + topD / 2 - 0.1);
  }

  return batch.buildMeshes(materials);
}

/** Материалы для детального офисного здания (приближённые к docs/houses). */
export function makeOfficeBuildingMaterials(wallColorHex = '#b8c2cc') {
  const mk = (color, roughness = 0.8, metalness = 0.05, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    wall: mk(new THREE.Color(wallColorHex), 0.45, 0.12),
    roof: mk(0x374151, 0.7, 0.08),
    trim: mk(0x1f2937, 0.4, 0.35),
    door: mk(0x26303d, 0.35, 0.45),
    foundation: mk(0x6b7280, 0.8, 0.08),
    stoneStep: mk(0x9ca3af, 0.75, 0.06),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x87bce0, transparent: true, opacity: 0.38, roughness: 0.04, metalness: 0.0, transmission: 0.2 }),
    glassBacking: mk(0x0b1220, 0.9, 0.0),
    metalAccent: mk(0x6b7280, 0.45, 0.55),
  };
}
