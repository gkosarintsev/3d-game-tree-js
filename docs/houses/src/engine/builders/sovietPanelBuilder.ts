import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { computeRoofRiseMeters } from '../../core/houseMetrics';
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

class GeometryBatcher {
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
  private readonly unitCyl = new THREE.CylinderGeometry(1, 1, 1, 10);
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
    rotY = 0,
  ): void {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(0, rotY, 0);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  addCylinder(
    bucket: MaterialBucketKey,
    radius: number,
    height: number,
    x: number,
    y: number,
    z: number,
  ): void {
    const geo = this.unitCyl.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.quat.identity();
    this.scale.set(radius, height, radius);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  addWindow(
    w: number,
    h: number,
    x: number,
    y: number,
    z: number,
    facingBack: boolean,
    withMullions = true,
  ): void {
    const dir = facingBack ? -1 : 1;
    const frameT = 0.06;
    const frameD = 0.09;

    // Frame bars
    this.addBox('trim', w, frameT, frameD, x, y + h / 2 - frameT / 2, z);
    this.addBox('trim', w, frameT, frameD, x, y - h / 2 + frameT / 2, z);
    this.addBox('trim', frameT, h - frameT * 2, frameD, x - w / 2 + frameT / 2, y, z);
    this.addBox('trim', frameT, h - frameT * 2, frameD, x + w / 2 - frameT / 2, y, z);

    // Concrete sill
    this.addBox('stoneStep', w + 0.12, 0.055, frameD + 0.08, x, y - h / 2 - 0.02, z + dir * 0.03);

    // Opaque dark interior backing + reflective glass pane
    const gw = Math.max(0.2, w - frameT * 1.8);
    const gh = Math.max(0.2, h - frameT * 1.8);
    this.addBox('glassBacking', gw, gh, 0.02, x, y, z - dir * 0.015);
    this.addBox('glass', gw, gh, 0.014, x, y, z + dir * 0.012);

    if (withMullions) {
      if (w >= 1.5) {
        // Classic 3-casement Soviet window
        this.addBox('trim', 0.035, gh, 0.045, x - gw * 0.17, y, z + dir * 0.006);
        this.addBox('trim', 0.035, gh, 0.045, x + gw * 0.17, y, z + dir * 0.006);
      } else {
        this.addBox('trim', 0.035, gh, 0.045, x, y, z + dir * 0.006);
      }
      // Upper transom bar (форточка)
      this.addBox('trim', gw, 0.03, 0.045, x, y + gh * 0.22, z + dir * 0.006);
    }
  }

  addBalcony(
    w: number,
    floorY: number,
    floorH: number,
    x: number,
    wallZ: number,
    facingBack: boolean,
    winScale: number,
  ): void {
    const dir = facingBack ? -1 : 1;
    const balconyD = 1.05;
    const slabH = 0.13;
    const railH = 0.96;
    const screenH = 0.78;
    const centerZ = wallZ + dir * (balconyD / 2);
    const frontZ = wallZ + dir * (balconyD - 0.05);

    // Precast concrete balcony slab
    this.addBox('stoneStep', w, slabH, balconyD, x, floorY - slabH / 2, centerZ);

    // Painted concrete / ribbed parapet screen with drainage gap at bottom
    const screenY = floorY + 0.12 + screenH / 2;
    this.addBox('wall', w, screenH, 0.09, x, screenY, frontZ);
    this.addBox('stoneStep', 0.08, screenH, balconyD - 0.08, x - w / 2 + 0.04, screenY, centerZ);
    this.addBox('stoneStep', 0.08, screenH, balconyD - 0.08, x + w / 2 - 0.04, screenY, centerZ);

    // Top metal handrail & vertical corner posts
    this.addBox('trim', w + 0.04, 0.05, 0.09, x, floorY + railH, frontZ);
    this.addBox('trim', 0.06, 0.05, balconyD, x - w / 2 + 0.04, floorY + railH, centerZ);
    this.addBox('trim', 0.06, 0.05, balconyD, x + w / 2 - 0.04, floorY + railH, centerZ);
    this.addBox('trim', 0.05, railH, 0.05, x - w / 2 + 0.04, floorY + railH / 2, frontZ);
    this.addBox('trim', 0.05, railH, 0.05, x + w / 2 - 0.04, floorY + railH / 2, frontZ);

    // Balcony door + adjacent window behind the balcony
    const doorW = 0.76;
    const doorH = Math.min(2.12, floorH - 0.34);
    const unitW = Math.min(w - 0.25, 1.85);
    const doorX = x - unitW * 0.25;
    const doorY = floorY + doorH / 2;
    const fz = wallZ + dir * 0.025;
    const dFrameT = 0.06;
    const dFrameD = 0.085;

    // 4-bar perimeter frame around balcony door (never occludes glassBacking)
    this.addBox('trim', doorW + dFrameT * 2, dFrameT, dFrameD, doorX, floorY + doorH + dFrameT / 2, fz);
    this.addBox('trim', doorW + dFrameT * 2, dFrameT, dFrameD, doorX, floorY + dFrameT / 2, fz);
    this.addBox('trim', dFrameT, doorH, dFrameD, doorX - doorW / 2 - dFrameT / 2, doorY, fz);
    this.addBox('trim', dFrameT, doorH, dFrameD, doorX + doorW / 2 + dFrameT / 2, doorY, fz);

    // Dark interior backing + glass + lower kick panel
    const innerDoorH = doorH - dFrameT;
    this.addBox('glassBacking', doorW, innerDoorH, 0.02, doorX, doorY + dFrameT * 0.25, fz - dir * 0.01);
    this.addBox('glass', doorW, innerDoorH, 0.014, doorX, doorY + dFrameT * 0.25, fz + dir * 0.015);
    this.addBox('trim', doorW, doorH * 0.3, 0.055, doorX, floorY + doorH * 0.16, fz + dir * 0.02);

    // Window adjacent to balcony door
    const adjW = Math.max(0.65, unitW - doorW - 0.12);
    const adjH = Math.min(1.42 * winScale, floorH * 0.52);
    const adjX = doorX + doorW / 2 + adjW / 2 + 0.05;
    const adjY = floorY + floorH * 0.52;
    this.addWindow(adjW, adjH, adjX, adjY, fz, facingBack, false);
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
      mesh.name = `SovietPanel_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      group.add(mesh);
    }
  }
}

/**
 * Builds a complete multi-story, multi-entrance Soviet prefabricated panel apartment block
 * (Серия П-44 / II-49 / 1-464) using batched merged geometries for high performance & clean GLB export.
 */
export function buildSovietPanelBuilding(
  config: HouseConfig,
  ctx: HouseBuildContext,
): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SovietPanelBuilding';

  const {
    width: sectionW,
    depth,
    floorHeight,
    floors,
    foundationHeight,
  } = config.dimensions;
  const entrances = config.dimensions.entrances ?? 3;
  const { windowDensity, windowScale, hasPorch, hasChimney, hasCornerAccents, hasBalcony } =
    config.features;

  const totalW = sectionW * entrances;
  const totalWallH = floorHeight * floors;
  const baseY = foundationHeight;
  const parapetH = computeRoofRiseMeters(config);
  const batch = new GeometryBatcher();

  // 1. Continuous Plinth / Foundation (grounded at y = 0)
  const plinthOverhang = 0.08;
  batch.addBox(
    'foundation',
    totalW + plinthOverhang * 2,
    foundationHeight,
    depth + plinthOverhang * 2,
    0,
    foundationHeight / 2,
    0,
  );
  batch.addBox(
    'stoneStep',
    totalW + plinthOverhang * 2 + 0.08,
    0.08,
    depth + plinthOverhang * 2 + 0.08,
    0,
    foundationHeight - 0.03,
    0,
  );

  // 2. Per-Entrance Structural Sections (Подъезды)
  for (let e = 0; e < entrances; e++) {
    const sx = -totalW / 2 + sectionW * (e + 0.5);

    // Main section panel volume (leave 4cm vertical gap for expansion seam)
    batch.addBox(
      'wall',
      sectionW - 0.04,
      totalWallH,
      depth,
      sx,
      baseY + totalWallH / 2,
      0,
    );

    // Inter-section vertical expansion joint (температурный шов)
    if (e < entrances - 1) {
      const jointX = -totalW / 2 + sectionW * (e + 1);
      batch.addBox(
        'foundation',
        0.09,
        totalWallH + 0.04,
        depth + 0.04,
        jointX,
        baseY + totalWallH / 2,
        0,
      );
    }

    // Basement vent windows (продухи)
    if (foundationHeight >= 0.55) {
      const ventW = 0.72;
      const ventH = Math.min(0.32, foundationHeight * 0.42);
      const ventY = foundationHeight * 0.52;
      for (const offset of [-sectionW * 0.3, sectionW * 0.3]) {
        batch.addBox('trim', ventW + 0.06, ventH + 0.06, 0.06, sx + offset, ventY, depth / 2 + plinthOverhang);
        batch.addBox('glassBacking', ventW, ventH, 0.08, sx + offset, ventY, depth / 2 + plinthOverhang + 0.01);
        batch.addBox('trim', ventW + 0.06, ventH + 0.06, 0.06, sx + offset, ventY, -depth / 2 - plinthOverhang);
        batch.addBox('glassBacking', ventW, ventH, 0.08, sx + offset, ventY, -depth / 2 - plinthOverhang - 0.01);
      }
    }

    // Entrance vestibule & steel door (Входная группа подъезда)
    const frontZ = depth / 2;
    const stoopW = 2.65;
    const stoopD = 1.35;
    const stoopH = Math.max(0.24, foundationHeight * 0.75);
    batch.addBox(
      'stoneStep',
      stoopW,
      stoopH,
      stoopD,
      sx,
      stoopH / 2,
      frontZ + plinthOverhang + stoopD / 2,
    );

    // Entrance steps descending to courtyard sidewalk
    const steps = foundationHeight > 0.7 ? 3 : 2;
    for (let s = 0; s < steps; s++) {
      const sh = stoopH * ((steps - s) / (steps + 1));
      const sd = 0.32;
      batch.addBox(
        'foundation',
        stoopW * 0.88,
        sh,
        sd,
        sx,
        sh / 2,
        frontZ + plinthOverhang + stoopD + sd * (s + 0.5),
      );
    }

    // Heavy Soviet steel entrance door + 3-bar perimeter frame + intercom panel
    const doorW = 1.36;
    const doorH = Math.min(2.18, floorHeight - 0.35);
    const doorBaseY = stoopH;
    const eFrameT = 0.09;
    const eFrameD = 0.14;
    batch.addBox('trim', doorW + eFrameT * 2, eFrameT, eFrameD, sx, doorBaseY + doorH + eFrameT / 2, frontZ + 0.03);
    batch.addBox('trim', eFrameT, doorH, eFrameD, sx - doorW / 2 - eFrameT / 2, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('trim', eFrameT, doorH, eFrameD, sx + doorW / 2 + eFrameT / 2, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('door', doorW, doorH, 0.08, sx, doorBaseY + doorH / 2, frontZ + 0.03);
    batch.addBox('glassBacking', 0.24, doorH * 0.52, 0.03, sx - doorW * 0.22, doorBaseY + doorH * 0.56, frontZ + 0.065);
    batch.addBox('glass', 0.24, doorH * 0.52, 0.02, sx - doorW * 0.22, doorBaseY + doorH * 0.56, frontZ + 0.082);
    // Steel intercom keypad & handle beside door
    batch.addBox('metalAccent', 0.14, 0.24, 0.04, sx + doorW * 0.56, doorBaseY + 1.28, frontZ + 0.08);
    batch.addBox('metalAccent', 0.04, 0.28, 0.05, sx + doorW * 0.28, doorBaseY + 1.08, frontZ + 0.085);

    // Iconic concrete entrance canopy (Козырёк подъезда)
    if (hasPorch) {
      const canopyW = 2.85;
      const canopyD = 1.35;
      const canopyY = doorBaseY + doorH + 0.24;
      batch.addBox('stoneStep', canopyW, 0.13, canopyD, sx, canopyY, frontZ + canopyD / 2);
      // Side concrete cheek brackets
      batch.addBox('stoneStep', 0.12, 0.65, canopyD - 0.18, sx - canopyW / 2 + 0.06, canopyY - 0.32, frontZ + (canopyD - 0.18) / 2);
      batch.addBox('stoneStep', 0.12, 0.65, canopyD - 0.18, sx + canopyW / 2 - 0.06, canopyY - 0.32, frontZ + (canopyD - 0.18) / 2);
    }

    // Stairwell shaft pilasters & staggered half-floor landing windows (Лестничная клетка)
    batch.addBox('trim', 0.14, totalWallH, 0.08, sx - 0.84, baseY + totalWallH / 2, frontZ + 0.02);
    batch.addBox('trim', 0.14, totalWallH, 0.08, sx + 0.84, baseY + totalWallH / 2, frontZ + 0.02);

    const stairWinW = 1.24;
    const stairWinH = Math.min(1.52, floorHeight * 0.54);
    for (let f = 0; f < floors - 1; f++) {
      const stairY = baseY + (f + 0.92) * floorHeight;
      batch.addWindow(stairWinW, stairWinH, sx, stairY, frontZ + 0.025, false, true);
    }

    // Front (+Z) Apartment Bays flanking the stairwell
    const baysPerSide = windowDensity === 1 ? 1 : windowDensity === 2 ? 2 : sectionW >= 14.5 ? 3 : 2;
    const bayStart = 1.65;
    const bayEnd = sectionW / 2 - 0.72;
    const baySpan = Math.max(1.8, (bayEnd - bayStart) / baysPerSide);
    const winW = Math.min(2.05, baySpan * 0.74) * (0.9 + windowScale * 0.1);
    const winH = Math.min(floorHeight * 0.56, 1.52 * windowScale);
    const balW = Math.min(2.75, baySpan * 0.84);

    for (let f = 0; f < floors; f++) {
      const floorBottomY = baseY + f * floorHeight;
      const winCenterY = floorBottomY + floorHeight * 0.53;

      for (const side of [-1, 1]) {
        for (let b = 0; b < baysPerSide; b++) {
          const bx = sx + side * (bayStart + (b + 0.5) * baySpan);
          const isBalconyBay = hasBalcony && f >= 1 && b === baysPerSide - 1;

          if (isBalconyBay) {
            batch.addBalcony(balW, floorBottomY, floorHeight, bx, frontZ, false, windowScale);
          } else {
            batch.addWindow(winW, winH, bx, winCenterY, frontZ + 0.025, false, true);
          }
        }
      }

      // Rear (-Z) Courtyard Apartment Bays
      const rearCount = Math.max(2, windowDensity * 2);
      const rearUsableW = sectionW - 1.5;
      const rearBaySpan = rearUsableW / rearCount;
      const rearWinW = Math.min(2.0, rearBaySpan * 0.72) * (0.9 + windowScale * 0.1);
      const rearBalW = Math.min(2.65, rearBaySpan * 0.84);

      for (let rb = 0; rb < rearCount; rb++) {
        const rx = sx - rearUsableW / 2 + (rb + 0.5) * rearBaySpan;
        const isRearBalcony =
          hasBalcony &&
          f >= 1 &&
          (rb === 0 || rb === rearCount - 1);

        if (isRearBalcony) {
          batch.addBalcony(rearBalW, floorBottomY, floorHeight, rx, -depth / 2, true, windowScale);
        } else {
          batch.addWindow(rearWinW, winH, rx, winCenterY, -depth / 2 - 0.025, true, true);
        }
      }
    }

    // Rainwater downspouts (Водосточные трубы) on front & rear
    const pipeX = e === 0 ? sx - sectionW / 2 + 0.38 : sx - sectionW / 2 + 0.25;
    batch.addCylinder('metalAccent', 0.065, totalWallH + 0.2, pipeX, baseY + totalWallH / 2, frontZ + 0.09);
    batch.addCylinder('metalAccent', 0.065, totalWallH + 0.2, pipeX, baseY + totalWallH / 2, -depth / 2 - 0.09);
  }

  // 3. Inter-floor panel seam bands & upper frieze cornice
  if (hasCornerAccents) {
    for (let f = 1; f < floors; f++) {
      batch.addBox(
        'foundation',
        totalW + 0.04,
        0.045,
        depth + 0.04,
        0,
        baseY + f * floorHeight,
        0,
      );
    }

    // End-gable vertical panel joint strips (-X and +X walls)
    const sidePanels = 3;
    for (let sp = 1; sp < sidePanels; sp++) {
      const sz = -depth / 2 + (sp / sidePanels) * depth;
      batch.addBox('foundation', 0.04, totalWallH, 0.06, -totalW / 2 - 0.01, baseY + totalWallH / 2, sz);
      batch.addBox('foundation', 0.04, totalWallH, 0.06, totalW / 2 + 0.01, baseY + totalWallH / 2, sz);
    }
  }

  // Optional small end-gable windows when density is high
  if (windowDensity === 3) {
    for (let f = 1; f < floors; f++) {
      const wy = baseY + f * floorHeight + floorHeight * 0.53;
      for (const sideSign of [-1, 1]) {
        const wx = sideSign * (totalW / 2 + 0.02);
        const fz = 0;
        const rotW = 1.0;
        const rotH = 1.25;
        // Build vertical window on end wall directly via rotated boxes
        batch.addBox('trim', 0.08, rotH + 0.1, rotW + 0.1, wx, wy, fz);
        batch.addBox('glassBacking', 0.03, rotH, rotW, wx + sideSign * 0.02, wy, fz);
        batch.addBox('glass', 0.02, rotH, rotW, wx + sideSign * 0.036, wy, fz);
      }
    }
  }

  // 4. Flat Roof Deck, Concrete Parapet, Coping & Rooftop Technical Structures
  const roofY = baseY + totalWallH;
  const parapetT = 0.24;

  // Upper cornice frieze
  batch.addBox('stoneStep', totalW + 0.22, 0.14, depth + 0.22, 0, roofY - 0.05, 0);

  // Tar-and-gravel roof deck
  batch.addBox('roof', totalW - 0.1, 0.18, depth - 0.1, 0, roofY + 0.06, 0);

  // Perimeter precast parapet
  batch.addBox('wall', totalW, parapetH, parapetT, 0, roofY + parapetH / 2, depth / 2 - parapetT / 2);
  batch.addBox('wall', totalW, parapetH, parapetT, 0, roofY + parapetH / 2, -depth / 2 + parapetT / 2);
  batch.addBox('wall', parapetT, parapetH, depth - parapetT * 2, -totalW / 2 + parapetT / 2, roofY + parapetH / 2, 0);
  batch.addBox('wall', parapetT, parapetH, depth - parapetT * 2, totalW / 2 - parapetT / 2, roofY + parapetH / 2, 0);

  // Galvanized steel coping on parapet
  const copingY = roofY + parapetH + 0.03;
  batch.addBox('trim', totalW + 0.06, 0.06, parapetT + 0.06, 0, copingY, depth / 2 - parapetT / 2);
  batch.addBox('trim', totalW + 0.06, 0.06, parapetT + 0.06, 0, copingY, -depth / 2 + parapetT / 2);
  batch.addBox('trim', parapetT + 0.06, 0.06, depth + 0.06, -totalW / 2 + parapetT / 2, copingY, 0);
  batch.addBox('trim', parapetT + 0.06, 0.06, depth + 0.06, totalW / 2 - parapetT / 2, copingY, 0);

  // Rooftop elevator machine rooms (лифтовые шахты), vent shafts & TV mast
  if (hasChimney) {
    for (let e = 0; e < entrances; e++) {
      const sx = -totalW / 2 + sectionW * (e + 0.5);
      const liftW = 3.0;
      const liftD = 2.5;
      const liftH = floors >= 7 ? 2.65 : 2.15;

      // Elevator / stair bulkhead
      batch.addBox('wall', liftW, liftH, liftD, sx, roofY + liftH / 2 + 0.1, -0.6);
      batch.addBox('roof', liftW + 0.18, 0.12, liftD + 0.18, sx, roofY + liftH + 0.16, -0.6);
      batch.addBox('trim', liftW + 0.22, 0.06, liftD + 0.22, sx, roofY + liftH + 0.22, -0.6);
      // Service hatch door on bulkhead
      batch.addBox('door', 0.85, 1.65, 0.08, sx, roofY + 0.95, -0.6 + liftD / 2 + 0.02);

      // Flanking ventilation shafts (вентшахты)
      for (const vxOff of [-sectionW * 0.26, sectionW * 0.26]) {
        const vx = sx + vxOff;
        batch.addBox('stoneStep', 0.9, 1.05, 0.9, vx, roofY + 0.62, 1.1);
        batch.addBox('trim', 1.04, 0.08, 1.04, vx, roofY + 1.18, 1.1);
      }

      // Collective Soviet rooftop TV antenna mast on primary section
      if (e === 0) {
        const mastX = sx + 0.8;
        const mastBaseY = roofY + liftH + 0.24;
        batch.addCylinder('metalAccent', 0.035, 3.2, mastX, mastBaseY + 1.6, -0.6);
        batch.addBox('metalAccent', 1.4, 0.035, 0.035, mastX, mastBaseY + 2.85, -0.6);
        batch.addBox('metalAccent', 0.95, 0.03, 0.03, mastX, mastBaseY + 2.45, -0.6);
      }
    }
  }

  batch.flushToGroup(group, ctx);
  return group;
}
