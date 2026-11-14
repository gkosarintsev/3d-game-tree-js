import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { HouseConfig } from '../../types/house';
import type { HouseBuildContext } from './types';

type MaterialBucketKey =
  | 'wall'
  | 'roof'
  | 'trim'
  | 'door'
  | 'foundation'
  | 'stoneStep'
  | 'glass'
  | 'glassBacking'
  | 'metalAccent';

class SkyscraperBatcher {
  private readonly buckets: Record<MaterialBucketKey, THREE.BufferGeometry[]> = {
    wall: [],
    roof: [],
    trim: [],
    door: [],
    foundation: [],
    stoneStep: [],
    glass: [],
    glassBacking: [],
    metalAccent: [],
  };

  private readonly unitBox = new THREE.BoxGeometry(1, 1, 1);
  private readonly unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
  private readonly mat4 = new THREE.Matrix4();
  private readonly pos = new THREE.Vector3();
  private readonly quat = new THREE.Quaternion();
  private readonly scale = new THREE.Vector3();
  private readonly euler = new THREE.Euler();

  addBox(
    bucket: MaterialBucketKey,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    rotX = 0,
    rotY = 0,
  ): void {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(rotX, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  addCylinder(
    bucket: MaterialBucketKey,
    radiusBottom: number,
    radiusTop: number,
    height: number,
    x: number,
    y: number,
    z: number,
  ): void {
    const geo =
      radiusBottom === radiusTop
        ? this.unitCyl.clone().toNonIndexed()
        : new THREE.CylinderGeometry(radiusTop, radiusBottom, 1, 16).toNonIndexed();
    this.pos.set(x, y, z);
    this.quat.identity();
    this.scale.set(radiusBottom === radiusTop ? radiusBottom : 1, height, radiusBottom === radiusTop ? radiusBottom : 1);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  addGeometry(
    bucket: MaterialBucketKey,
    rawGeo: THREE.BufferGeometry,
    x: number,
    y: number,
    z: number,
    rotY = 0,
  ): void {
    const geo = rawGeo.index ? rawGeo.toNonIndexed() : rawGeo.clone();
    rawGeo.dispose();
    this.pos.set(x, y, z);
    this.euler.set(0, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(1, 1, 1);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  flushToGroup(group: THREE.Group, ctx: HouseBuildContext): void {
    this.unitBox.dispose();
    this.unitCyl.dispose();

    const entries = Object.entries(this.buckets) as Array<
      [MaterialBucketKey, THREE.BufferGeometry[]]
    >;

    for (const [key, geos] of entries) {
      if (geos.length === 0) continue;
      const merged = mergeGeometries(geos, false);
      for (const g of geos) g.dispose();
      if (!merged) continue;
      ctx.trackGeometry(merged);

      const mesh = new THREE.Mesh(merged, ctx.materials[key]);
      mesh.name = `Skyscraper_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      group.add(mesh);
    }
  }
}

interface TowerTier {
  width: number;
  depth: number;
  startFloor: number;
  endFloor: number;
}

function createSlantedCrownWedge(width: number, depth: number, rise: number): THREE.BufferGeometry {
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hd, 0);
  shape.lineTo(hd, 0);
  shape.lineTo(hd, rise);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a multi-tier modern skyscraper with granite plinth, double-height podium lobby,
 * curtain-wall glazing bands, vertical structural mullions/fins, mechanical louver belts,
 * setback sky-terraces, helipad/slanted glass crown, and telescoping steel spire.
 */
export function buildSkyscraperBuilding(
  config: HouseConfig,
  ctx: HouseBuildContext,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SkyscraperModel';

  const {
    width,
    depth,
    floorHeight,
    floors,
    foundationHeight,
    roofPitchDeg,
  } = config.dimensions;
  const { roofType, windowDensity, windowScale, hasPorch, hasChimney, hasCornerAccents, hasBalcony } =
    config.features;

  const batch = new SkyscraperBatcher();
  const baseY = foundationHeight;

  // 1. Granite Plaza Plinth (grounded at y = 0)
  const plinthW = hasPorch ? width + 4.4 : width + 1.0;
  const plinthD = hasPorch ? depth + 4.0 : depth + 1.0;
  batch.addBox('foundation', plinthW, foundationHeight, plinthD, 0, foundationHeight / 2, 0);
  batch.addBox(
    'stoneStep',
    plinthW + 0.2,
    0.16,
    plinthD + 0.2,
    0,
    foundationHeight - 0.06,
    0,
  );

  // Entrance podium steps on +Z
  const stepCount = 3;
  for (let s = 0; s < stepCount; s++) {
    const sh = foundationHeight * ((stepCount - s) / (stepCount + 1));
    const sd = 0.45;
    batch.addBox(
      'stoneStep',
      Math.min(plinthW * 0.52, 10.5),
      sh,
      sd,
      0,
      sh / 2,
      plinthD / 2 + sd * (s + 0.5),
    );
  }

  // 2. Compute Stepped Tower Tiers
  const tiers: TowerTier[] = [];
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

    // Atrium glass core
    batch.addBox('glassBacking', podW - 0.5, podH - 0.3, podD - 0.5, 0, podY, 0);
    batch.addBox('glass', podW - 0.34, podH - 0.35, podD - 0.34, 0, podY, 0);

    // Podium roof slab + terrace parapet
    batch.addBox('wall', podW + 0.3, 0.36, podD + 0.3, 0, baseY + podH + 0.14, 0);
    batch.addBox('trim', podW + 0.4, 0.14, podD + 0.4, 0, baseY + podH + 0.34, 0);

    if (hasBalcony) {
      // Podium rooftop guardrail terrace
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

    // Perimeter stone colonnade piers around the atrium podium
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

    // Grand cantilevered glass & steel lobby entrance canopy on +Z
    const canopyW = Math.min(podW * 0.48, 9.6);
    const canopyD = 3.1;
    const canopyY = baseY + 4.35;
    batch.addBox('trim', canopyW, 0.18, canopyD, 0, canopyY, podD / 2 + canopyD / 2 - 0.1);
    batch.addBox('glass', canopyW - 0.35, 0.06, canopyD - 0.35, 0, canopyY + 0.09, podD / 2 + canopyD / 2 - 0.1);
    // Steel tension tie rods supporting canopy
    for (const tx of [-canopyW * 0.36, canopyW * 0.36]) {
      batch.addBox('metalAccent', 0.07, 0.07, canopyD * 1.15, tx, canopyY + 0.68, podD / 2 + canopyD * 0.42, 0.42, 0);
    }

    // Atrium main revolving / double lobby doors
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

    // Continuous opaque interior curtain-wall core (prevents any bleed-through)
    batch.addBox(
      'glassBacking',
      tw - 0.16,
      tierH,
      td - 0.16,
      0,
      tierBottomY + tierH / 2,
      0,
    );

    // Floor-by-floor glazing ribbons + spandrel bands + mechanical floor
    for (let f = tierStart; f < tier.endFloor; f++) {
      const fy = baseY + f * floorHeight;
      const isMech = f === mechFloor;

      if (isMech) {
        // Mechanical floor recessed metal louver belt
        batch.addBox('foundation', tw - 0.2, floorHeight * 0.92, td - 0.2, 0, fy + floorHeight / 2, 0);
        for (let lv = 0; lv < 4; lv++) {
          const ly = fy + floorHeight * (0.2 + lv * 0.2);
          batch.addBox('metalAccent', tw - 0.04, 0.08, td - 0.04, 0, ly, 0);
        }
        batch.addBox('trim', tw + 0.08, 0.14, td + 0.08, 0, fy + floorHeight - 0.07, 0);
      } else {
        const glassH = floorHeight * glassRatio;
        const spandrelH = floorHeight - glassH;

        // Opaque cladding spandrel band at floor slab level
        batch.addBox('wall', tw, spandrelH, td, 0, fy + spandrelH / 2, 0);
        // Curtain-wall glass band
        batch.addBox('glass', tw - 0.06, glassH, td - 0.06, 0, fy + spandrelH + glassH / 2, 0);
      }
    }

    // Corner structural columns / accent pilasters
    if (hasCornerAccents) {
      const colSize = 0.62;
      const corners: Array<[number, number]> = [
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

    // Vertical structural curtain-wall mullions / fins on all 4 facades
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

    // Setback roof deck & sky-terrace balustrade between tiers
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

  // 5. Skyscraper Crown, Helipad / Slanted Glass Crown & Telescoping Spire
  const topTier = tiers[tiers.length - 1];
  const topW = topTier.width;
  const topD = topTier.depth;
  const roofY = baseY + floors * floorHeight;

  // Roof slab + top perimeter cornice
  batch.addBox('roof', topW - 0.1, 0.24, topD - 0.1, 0, roofY + 0.1, 0);
  batch.addBox('trim', topW + 0.24, 0.22, topD + 0.24, 0, roofY + 0.11, 0);

  let spireBaseY = roofY + 0.24;

  if (roofType === 'shed') {
    // Dramatic slanted diagonal glass & steel penthouse crown
    const slantRise = Math.max(3.6, Math.tan((roofPitchDeg * Math.PI) / 180) * (topD * 0.48));
    const coreW = topW * 0.92;
    const coreD = topD * 0.92;
    const wedge = createSlantedCrownWedge(coreW, coreD, slantRise);
    batch.addGeometry('wall', wedge, 0, roofY + 0.2, 0);

    // Glazed diagonal skylight slope
    const slopeLen = Math.hypot(coreD, slantRise);
    const slopeAngle = Math.atan2(slantRise, coreD);
    batch.addBox(
      'glass',
      coreW - 0.3,
      0.1,
      slopeLen,
      0,
      roofY + 0.2 + slantRise / 2 + 0.08,
      0,
      -slopeAngle,
      0,
    );
    batch.addBox(
      'trim',
      coreW + 0.15,
      0.24,
      0.28,
      0,
      roofY + 0.2 + slantRise,
      coreD / 2,
    );
    spireBaseY = roofY + 0.2 + slantRise * 0.72;
  } else {
    // Architectural glass & steel crown screen parapet
    const crownH = roofType === 'stepped' ? 2.4 : 1.8;
    const pt = 0.22;
    batch.addBox('glass', topW - 0.2, crownH, 0.08, 0, roofY + 0.2 + crownH / 2, topD / 2 - pt);
    batch.addBox('glass', topW - 0.2, crownH, 0.08, 0, roofY + 0.2 + crownH / 2, -topD / 2 + pt);
    batch.addBox('glass', 0.08, crownH, topD - 0.2, -topW / 2 + pt, roofY + 0.2 + crownH / 2, 0);
    batch.addBox('glass', 0.08, crownH, topD - 0.2, topW / 2 - pt, roofY + 0.2 + crownH / 2, 0);

    // Crown top metallic frame
    const crownTopY = roofY + 0.2 + crownH;
    batch.addBox('trim', topW, 0.18, 0.22, 0, crownTopY, topD / 2 - pt);
    batch.addBox('trim', topW, 0.18, 0.22, 0, crownTopY, -topD / 2 + pt);
    batch.addBox('trim', 0.22, 0.18, topD, -topW / 2 + pt, crownTopY, 0);
    batch.addBox('trim', 0.22, 0.18, topD, topW / 2 - pt, crownTopY, 0);

    if (roofType === 'stepped') {
      // Stepped upper mechanical penthouse lantern
      const pentW = topW * 0.56;
      const pentD = topD * 0.56;
      const pentH = 3.4;
      batch.addBox('wall', pentW, pentH, pentD, 0, roofY + 0.2 + pentH / 2, 0);
      batch.addBox('trim', pentW + 0.2, 0.24, pentD + 0.2, 0, roofY + 0.2 + pentH, 0);
      spireBaseY = roofY + 0.2 + pentH + 0.12;
    } else {
      // Flat roof helipad & HVAC equipment
      const padRadius = Math.min(topW, topD) * 0.34;
      batch.addCylinder('foundation', padRadius, padRadius, 0.18, 0, roofY + 0.28, 0);
      batch.addCylinder('stoneStep', padRadius * 0.88, padRadius * 0.88, 0.2, 0, roofY + 0.29, 0);
      // Bold 'H' marking on helipad
      const hSize = padRadius * 0.9;
      batch.addBox('trim', 0.32, 0.04, hSize, -hSize * 0.3, roofY + 0.4, 0);
      batch.addBox('trim', 0.32, 0.04, hSize, hSize * 0.3, roofY + 0.4, 0);
      batch.addBox('trim', hSize * 0.6, 0.04, 0.32, 0, roofY + 0.4, 0);

      // Corner HVAC chiller units
      batch.addBox('metalAccent', 1.8, 1.1, 1.4, -topW * 0.32, roofY + 0.75, -topD * 0.3);
      batch.addBox('metalAccent', 1.8, 1.1, 1.4, topW * 0.32, roofY + 0.75, -topD * 0.3);
      spireBaseY = roofY + 0.35;
    }
  }

  // Multi-stage telescoping steel spire (Шпиль)
  if (hasChimney) {
    const towerH = floors * floorHeight;
    const totalSpireH = Math.max(10, towerH * 0.16);
    const sx = 0;
    const sz = roofType === 'flat' ? -topD * 0.28 : 0;

    // Base pedestal
    const pedH = totalSpireH * 0.22;
    batch.addBox('trim', 1.9, pedH, 1.9, sx, spireBaseY + pedH / 2, sz);

    // Stage 1 tapered mast
    const s1H = totalSpireH * 0.38;
    batch.addCylinder('metalAccent', 0.52, 0.26, s1H, sx, spireBaseY + pedH + s1H / 2, sz);

    // Stage 2 upper needle spire
    const s2H = totalSpireH * 0.4;
    batch.addCylinder('metalAccent', 0.22, 0.05, s2H, sx, spireBaseY + pedH + s1H + s2H / 2, sz);

    // Subtle structural ring collar
    batch.addCylinder('trim', 0.65, 0.65, 0.25, sx, spireBaseY + pedH, sz);
  }

  batch.flushToGroup(group, ctx);
  return group;
}
