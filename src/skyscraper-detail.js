import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальная визуальная модель небоскрёба (по образцу docs/houses skyscraper,
 * `builders/skyscraperBuilder.ts`). Только картинка — коллизии/навигация
 * остаются у данных здания. Геометрия батчится по материалам.
 *
 * Модель строится в локальных координатах: центр XZ в (0,0), низ (уровень земли
 * площадки/основания стилобата) в y=0. Вызывающий код смещает по baseY здания.
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
  addBox(bucket, w, h, d, x, y, z, rotX = 0, rotY = 0) {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(rotX, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }
  addCylinder(bucket, radiusBottom, radiusTop, height, x, y, z) {
    const geo = radiusBottom === radiusTop
      ? this.unitCyl.clone().toNonIndexed()
      : new THREE.CylinderGeometry(radiusTop, radiusBottom, 1, 16).toNonIndexed();
    this.pos.set(x, y, z);
    this.quat.identity();
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
      mesh.name = `Skyscraper_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      meshes.push(mesh);
    }
    return meshes;
  }
}

function createSlantedCrownWedge(width, depth, rise) {
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
 * Строит детальный небоскрёб (порт docs/houses skyscraperBuilder).
 * @param {object} config
 * @param {number} config.width
 * @param {number} config.depth
 * @param {number} config.floorHeight
 * @param {number} config.floors
 * @param {number} [config.foundationHeight]
 * @param {number} [config.roofPitchDeg]
 * @param {'stepped'|'flat'|'shed'} [config.roofType]
 * @param {number} [config.windowDensity]
 * @param {number} [config.windowScale]
 * @param {boolean} [config.hasPorch]
 * @param {boolean} [config.hasChimney]
 * @param {boolean} [config.hasCornerAccents]
 * @param {boolean} [config.hasBalcony]
 * @param {object} materials
 */
export function buildDetailedSkyscraper(config, materials) {
  const width = config.width;
  const depth = config.depth;
  const floorHeight = config.floorHeight;
  const floors = config.floors;
  const foundationHeight = config.foundationHeight ?? 1.2;
  const roofPitchDeg = config.roofPitchDeg ?? 28;
  const roofType = config.roofType ?? 'stepped';
  const windowDensity = config.windowDensity ?? 2;
  const windowScale = config.windowScale ?? 1.05;
  const hasPorch = config.hasPorch !== false;
  const hasChimney = config.hasChimney !== false;
  const hasCornerAccents = config.hasCornerAccents !== false;
  const hasBalcony = config.hasBalcony !== false;

  const batch = new Batcher();
  // Низ модели в y=0 (площадка). Башня начинается над фундаментом/стилобатом.
  const baseY = foundationHeight;

  // 1. Granite Plaza Plinth (grounded at y = 0)
  const plinthW = hasPorch ? width + 4.4 : width + 1.0;
  const plinthD = hasPorch ? depth + 4.0 : depth + 1.0;
  batch.addBox('foundation', plinthW, foundationHeight, plinthD, 0, foundationHeight / 2, 0);
  batch.addBox('stoneStep', plinthW + 0.2, 0.16, plinthD + 0.2, 0, foundationHeight - 0.06, 0);

  // Entrance podium steps on +Z
  const stepCount = 3;
  for (let s = 0; s < stepCount; s++) {
    const sh = foundationHeight * ((stepCount - s) / (stepCount + 1));
    const sd = 0.45;
    batch.addBox('stoneStep', Math.min(plinthW * 0.52, 10.5), sh, sd, 0, sh / 2, plinthD / 2 + sd * (s + 0.5));
  }

  // 2. Compute Stepped Tower Tiers
  const tiers = [];
  if (roofType === 'stepped') {
    const f1 = Math.max(4, Math.floor(floors * 0.46));
    const f2 = Math.max(3, Math.floor(floors * 0.32));
    tiers.push({ width, depth, startFloor: 0, endFloor: f1 });
    tiers.push({
      width: Math.max(10, width * 0.8),
      depth: Math.max(10, depth * 0.8),
      startFloor: f1,
      endFloor: f1 + f2,
    });
    tiers.push({
      width: Math.max(7.5, width * 0.6),
      depth: Math.max(7.5, depth * 0.6),
      startFloor: f1 + f2,
      endFloor: floors,
    });
  } else {
    tiers.push({ width, depth, startFloor: 0, endFloor: floors });
  }

  // 3. Double-Height Atrium Podium (Стилобат) wrapping bottom 2 floors
  const podiumStartFloor = hasPorch ? 2 : 0;
  if (hasPorch) {
    const podW = width + 3.4;
    const podD = depth + 3.0;
    const podH = floorHeight * 2.05;
    const podY = baseY + podH / 2;

    batch.addBox('glassBacking', podW - 0.5, podH - 0.3, podD - 0.5, 0, podY, 0);
    batch.addBox('glass', podW - 0.34, podH - 0.35, podD - 0.34, 0, podY, 0);
    batch.addBox('wall', podW + 0.3, 0.36, podD + 0.3, 0, baseY + podH + 0.14, 0);
    batch.addBox('trim', podW + 0.4, 0.14, podD + 0.4, 0, baseY + podH + 0.34, 0);

    if (hasBalcony) {
      const railH = 1.0;
      const railY = baseY + podH + 0.36 + railH / 2;
      batch.addBox('glass', podW, railH, 0.04, 0, railY, podD / 2 - 0.08);
      batch.addBox('glass', podW, railH, 0.04, 0, railY, -podD / 2 + 0.08);
      batch.addBox('glass', 0.04, railH, podD, -podW / 2 + 0.08, railY, 0);
      batch.addBox('glass', 0.04, railH, podD, podW / 2 - 0.08, railY, 0);
      batch.addBox('trim', podW + 0.06, 0.06, 0.08, 0, railY + railH / 2, podD / 2 - 0.08);
      batch.addBox('trim', podW + 0.06, 0.06, 0.08, 0, railY + railH / 2, -podD / 2 + 0.08);
      batch.addBox('trim', 0.08, 0.06, podD + 0.06, -podW / 2 + 0.08, railY + railH / 2, 0);
      batch.addBox('trim', 0.08, 0.06, podD + 0.06, podW / 2 - 0.08, railY + railH / 2, 0);
    }

    const pierColsX = Math.max(4, Math.round(podW / 4.2));
    for (let i = 0; i <= pierColsX; i++) {
      const px = -podW / 2 + 0.25 + (i / pierColsX) * (podW - 0.5);
      batch.addBox('stoneStep', 0.48, podH + 0.1, 0.48, px, podY, podD / 2 - 0.14);
      batch.addBox('stoneStep', 0.48, podH + 0.1, 0.48, px, podY, -podD / 2 + 0.14);
    }
    const pierColsZ = Math.max(3, Math.round(podD / 4.2));
    for (let i = 1; i < pierColsZ; i++) {
      const pz = -podD / 2 + 0.25 + (i / pierColsZ) * (podD - 0.5);
      batch.addBox('stoneStep', 0.48, podH + 0.1, 0.48, -podW / 2 + 0.14, podY, pz);
      batch.addBox('stoneStep', 0.48, podH + 0.1, 0.48, podW / 2 - 0.14, podY, pz);
    }

    const canopyW = Math.min(podW * 0.48, 9.6);
    const canopyD = 3.1;
    const canopyY = baseY + 4.35;
    batch.addBox('trim', canopyW, 0.18, canopyD, 0, canopyY, podD / 2 + canopyD / 2 - 0.1);
    batch.addBox('glass', canopyW - 0.35, 0.06, canopyD - 0.35, 0, canopyY + 0.09, podD / 2 + canopyD / 2 - 0.1);
    for (const tx of [-canopyW * 0.36, canopyW * 0.36]) {
      batch.addBox('metalAccent', 0.07, 0.07, canopyD * 1.15, tx, canopyY + 0.68, podD / 2 + canopyD * 0.42, 0.42, 0);
    }

    const lobbyDoorW = 4.2;
    const lobbyDoorH = 3.2;
    batch.addBox('trim', lobbyDoorW + 0.3, 0.18, 0.25, 0, baseY + lobbyDoorH + 0.08, podD / 2);
    batch.addBox('door', lobbyDoorW, lobbyDoorH, 0.12, 0, baseY + lobbyDoorH / 2, podD / 2 - 0.02);
    batch.addBox('glassBacking', lobbyDoorW - 0.5, lobbyDoorH - 0.4, 0.14, 0, baseY + lobbyDoorH / 2, podD / 2 - 0.01);
    batch.addBox('glass', lobbyDoorW - 0.5, lobbyDoorH - 0.4, 0.16, 0, baseY + lobbyDoorH / 2, podD / 2);
    batch.addBox('metalAccent', 0.1, lobbyDoorH, 0.2, 0, baseY + lobbyDoorH / 2, podD / 2 + 0.02);
  }

  // 4. Build Each Tower Tier Floor by Floor
  const mechFloor = floors >= 18 ? Math.floor(floors * 0.54) : -1;
  const glassRatio = Math.min(0.74, Math.max(0.46, 0.62 * windowScale));
  const finSpacing = windowDensity === 1 ? 4.4 : windowDensity === 2 ? 3.1 : 2.15;

  tiers.forEach((tier, tierIdx) => {
    const tierStart = Math.max(tier.startFloor, podiumStartFloor);
    if (tierStart >= tier.endFloor) return;

    const tw = tier.width;
    const td = tier.depth;
    const tierFloors = tier.endFloor - tierStart;
    const tierBottomY = baseY + tierStart * floorHeight;
    const tierH = tierFloors * floorHeight;

    batch.addBox('glassBacking', tw - 0.16, tierH, td - 0.16, 0, tierBottomY + tierH / 2, 0);

    for (let f = tierStart; f < tier.endFloor; f++) {
      const fy = baseY + f * floorHeight;
      const isMech = f === mechFloor;
      if (isMech) {
        batch.addBox('foundation', tw - 0.2, floorHeight * 0.92, td - 0.2, 0, fy + floorHeight / 2, 0);
        for (let lv = 0; lv < 4; lv++) {
          const ly = fy + floorHeight * (0.2 + lv * 0.2);
          batch.addBox('metalAccent', tw - 0.04, 0.08, td - 0.04, 0, ly, 0);
        }
        batch.addBox('trim', tw + 0.08, 0.14, td + 0.08, 0, fy + floorHeight - 0.07, 0);
      } else {
        const glassH = floorHeight * glassRatio;
        const spandrelH = floorHeight - glassH;
        batch.addBox('wall', tw, spandrelH, td, 0, fy + spandrelH / 2, 0);
        batch.addBox('glass', tw - 0.06, glassH, td - 0.06, 0, fy + spandrelH + glassH / 2, 0);
      }
    }

    if (hasCornerAccents) {
      const colSize = 0.62;
      const corners = [
        [-tw / 2 + colSize * 0.35, -td / 2 + colSize * 0.35],
        [tw / 2 - colSize * 0.35, -td / 2 + colSize * 0.35],
        [-tw / 2 + colSize * 0.35, td / 2 - colSize * 0.35],
        [tw / 2 - colSize * 0.35, td / 2 - colSize * 0.35],
      ];
      for (const [cx, cz] of corners) {
        batch.addBox('wall', colSize, tierH + 0.04, colSize, cx, tierBottomY + tierH / 2, cz);
        batch.addBox('metalAccent', 0.12, tierH + 0.06, 0.12, cx * 1.01, tierBottomY + tierH / 2, cz * 1.01);
      }
    }

    const countX = Math.max(3, Math.round(tw / finSpacing));
    const usableX = tw - 1.4;
    for (let i = 0; i <= countX; i++) {
      const fx = -usableX / 2 + (i / countX) * usableX;
      const finDepth = hasCornerAccents ? 0.22 : 0.12;
      batch.addBox('trim', 0.13, tierH, finDepth, fx, tierBottomY + tierH / 2, td / 2 + finDepth * 0.2);
      batch.addBox('trim', 0.13, tierH, finDepth, fx, tierBottomY + tierH / 2, -td / 2 - finDepth * 0.2);
    }

    const countZ = Math.max(3, Math.round(td / finSpacing));
    const usableZ = td - 1.4;
    for (let i = 0; i <= countZ; i++) {
      const fz = -usableZ / 2 + (i / countZ) * usableZ;
      const finDepth = hasCornerAccents ? 0.22 : 0.12;
      batch.addBox('trim', finDepth, tierH, 0.13, tw / 2 + finDepth * 0.2, tierBottomY + tierH / 2, fz);
      batch.addBox('trim', finDepth, tierH, 0.13, -tw / 2 - finDepth * 0.2, tierBottomY + tierH / 2, fz);
    }

    if (tierIdx < tiers.length - 1) {
      const terraceY = baseY + tier.endFloor * floorHeight;
      batch.addBox('roof', tw - 0.1, 0.22, td - 0.1, 0, terraceY + 0.06, 0);
      batch.addBox('trim', tw + 0.18, 0.18, td + 0.18, 0, terraceY + 0.09, 0);
      if (hasBalcony) {
        const railH = 1.05;
        const railY = terraceY + 0.18 + railH / 2;
        batch.addBox('glass', tw - 0.12, railH, 0.04, 0, railY, td / 2 - 0.06);
        batch.addBox('glass', tw - 0.12, railH, 0.04, 0, railY, -td / 2 + 0.06);
        batch.addBox('glass', 0.04, railH, td - 0.12, -tw / 2 + 0.06, railY, 0);
        batch.addBox('glass', 0.04, railH, td - 0.12, tw / 2 - 0.06, railY, 0);
        batch.addBox('trim', tw, 0.06, 0.08, 0, railY + railH / 2, td / 2 - 0.06);
        batch.addBox('trim', tw, 0.06, 0.08, 0, railY + railH / 2, -td / 2 + 0.06);
        batch.addBox('trim', 0.08, 0.06, td, -tw / 2 + 0.06, railY + railH / 2, 0);
        batch.addBox('trim', 0.08, 0.06, td, tw / 2 - 0.06, railY + railH / 2, 0);
      }
    }
  });

  // 5. Crown / roof
  const topTier = tiers[tiers.length - 1];
  const topW = topTier.width;
  const topD = topTier.depth;
  const roofY = baseY + floors * floorHeight;

  batch.addBox('roof', topW - 0.1, 0.24, topD - 0.1, 0, roofY + 0.1, 0);
  batch.addBox('trim', topW + 0.24, 0.22, topD + 0.24, 0, roofY + 0.11, 0);

  let spireBaseY = roofY + 0.24;

  if (roofType === 'shed') {
    const slantRise = Math.max(3.6, Math.tan((roofPitchDeg * Math.PI) / 180) * (topD * 0.48));
    const coreW = topW * 0.92;
    const coreD = topD * 0.92;
    const wedge = createSlantedCrownWedge(coreW, coreD, slantRise);
    batch.addGeometry('wall', wedge, 0, roofY + 0.2, 0);
    const slopeLen = Math.hypot(coreD, slantRise);
    const slopeAngle = Math.atan2(slantRise, coreD);
    batch.addBox('glass', coreW - 0.3, 0.1, slopeLen, 0, roofY + 0.2 + slantRise / 2 + 0.08, 0, -slopeAngle, 0);
    batch.addBox('trim', coreW + 0.15, 0.24, 0.28, 0, roofY + 0.2 + slantRise, coreD / 2);
    spireBaseY = roofY + 0.2 + slantRise * 0.72;
  } else {
    const crownH = roofType === 'stepped' ? 2.4 : 1.8;
    const pt = 0.22;
    batch.addBox('glass', topW - 0.2, crownH, 0.08, 0, roofY + 0.2 + crownH / 2, topD / 2 - pt);
    batch.addBox('glass', topW - 0.2, crownH, 0.08, 0, roofY + 0.2 + crownH / 2, -topD / 2 + pt);
    batch.addBox('glass', 0.08, crownH, topD - 0.2, -topW / 2 + pt, roofY + 0.2 + crownH / 2, 0);
    batch.addBox('glass', 0.08, crownH, topD - 0.2, topW / 2 - pt, roofY + 0.2 + crownH / 2, 0);
    const crownTopY = roofY + 0.2 + crownH;
    batch.addBox('trim', topW, 0.18, 0.22, 0, crownTopY, topD / 2 - pt);
    batch.addBox('trim', topW, 0.18, 0.22, 0, crownTopY, -topD / 2 + pt);
    batch.addBox('trim', 0.22, 0.18, topD, -topW / 2 + pt, crownTopY, 0);
    batch.addBox('trim', 0.22, 0.18, topD, topW / 2 - pt, crownTopY, 0);

    if (roofType === 'stepped') {
      const pentW = topW * 0.56;
      const pentD = topD * 0.56;
      const pentH = 3.4;
      batch.addBox('wall', pentW, pentH, pentD, 0, roofY + 0.2 + pentH / 2, 0);
      batch.addBox('trim', pentW + 0.2, 0.24, pentD + 0.2, 0, roofY + 0.2 + pentH, 0);
      spireBaseY = roofY + 0.2 + pentH + 0.12;
    } else {
      const padRadius = Math.min(topW, topD) * 0.34;
      batch.addCylinder('foundation', padRadius, padRadius, 0.18, 0, roofY + 0.28, 0);
      batch.addCylinder('stoneStep', padRadius * 0.88, padRadius * 0.88, 0.2, 0, roofY + 0.29, 0);
      const hSize = padRadius * 0.9;
      batch.addBox('trim', 0.32, 0.04, hSize, -hSize * 0.3, roofY + 0.4, 0);
      batch.addBox('trim', 0.32, 0.04, hSize, hSize * 0.3, roofY + 0.4, 0);
      batch.addBox('trim', hSize * 0.6, 0.04, 0.32, 0, roofY + 0.4, 0);
      batch.addBox('metalAccent', 1.8, 1.1, 1.4, -topW * 0.32, roofY + 0.75, -topD * 0.3);
      batch.addBox('metalAccent', 1.8, 1.1, 1.4, topW * 0.32, roofY + 0.75, -topD * 0.3);
      spireBaseY = roofY + 0.35;
    }
  }

  // Spire
  if (hasChimney) {
    const towerH = floors * floorHeight;
    const totalSpireH = Math.max(10, towerH * 0.16);
    const sx = 0;
    const sz = roofType === 'flat' ? -topD * 0.28 : 0;
    const pedH = totalSpireH * 0.22;
    batch.addBox('trim', 1.9, pedH, 1.9, sx, spireBaseY + pedH / 2, sz);
    const s1H = totalSpireH * 0.38;
    batch.addCylinder('metalAccent', 0.52, 0.26, s1H, sx, spireBaseY + pedH + s1H / 2, sz);
    const s2H = totalSpireH * 0.4;
    batch.addCylinder('metalAccent', 0.22, 0.05, s2H, sx, spireBaseY + pedH + s1H + s2H / 2, sz);
    batch.addCylinder('trim', 0.65, 0.65, 0.25, sx, spireBaseY + pedH, sz);
  }

  return batch.buildMeshes(materials);
}

/** Материалы для детального небоскрёба (приближённые к docs/houses). */
export function makeSkyscraperMaterials(wallColorHex = '#4b5563') {
  const mk = (color, roughness = 0.8, metalness = 0.05, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    wall: mk(new THREE.Color(wallColorHex), 0.45, 0.15),
    roof: mk(0x374151, 0.7, 0.08),
    trim: mk(0x1f2937, 0.4, 0.35),
    door: mk(0x1f2937, 0.35, 0.4),
    foundation: mk(0x6b7280, 0.8, 0.08),
    stoneStep: mk(0x9ca3af, 0.75, 0.06),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x7fa7ba, transparent: true, opacity: 0.42, roughness: 0.04, metalness: 0.0, transmission: 0.22 }),
    glassBacking: mk(0x0b1220, 0.9, 0.0),
    metalAccent: mk(0x4b5563, 0.45, 0.55),
  };
}
