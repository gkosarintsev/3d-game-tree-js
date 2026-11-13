import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальная визуальная модель трущобной лачуги (docs/houses slum-shack).
 * Только картинка — коллизии/навигация остаются у данных здания.
 * Локальные координаты: центр XZ в (0,0), низ в y=0.
 */

class SlumBatcher {
  buckets = {
    wall: [],
    roof: [],
    trim: [],
    door: [],
    foundation: [],
    stoneStep: [],
    glass: [],
    glassBacking: [],
    metalAccent: [],
    timberAccent: [],
    chimney: [],
    rustPlate: [],
    waterTank: [],
  };

  unitBox = new THREE.BoxGeometry(1, 1, 1);
  unitCyl = new THREE.CylinderGeometry(1, 1, 1, 14);
  mat4 = new THREE.Matrix4();
  pos = new THREE.Vector3();
  quat = new THREE.Quaternion();
  scale = new THREE.Vector3();
  euler = new THREE.Euler();

  addBox(
    bucket,
    w,
    h,
    d,
    x,
    y,
    z,
    rotX = 0,
    rotY = 0,
    rotZ = 0,
  ) {
    const geo = this.unitBox.clone().toNonIndexed();
    this.pos.set(x, y, z);
    this.euler.set(rotX, rotY, rotZ);
    this.quat.setFromEuler(this.euler);
    this.scale.set(w, h, d);
    this.mat4.compose(this.pos, this.quat, this.scale);
    geo.applyMatrix4(this.mat4);
    this.buckets[bucket].push(geo);
  }

  addCylinder(
    bucket,
    radiusBottom,
    radiusTop,
    height,
    x,
    y,
    z,
  ) {
    const geo =
      radiusBottom === radiusTop
        ? this.unitCyl.clone().toNonIndexed()
        : new THREE.CylinderGeometry(radiusTop, radiusBottom, 1, 14).toNonIndexed();
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

  addGeometry(
    bucket,
    rawGeo,
    x,
    y,
    z,
    rotY = 0,
  ) {
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
      mesh.name = `Slum_${key}`;
      const isGlass = key === 'glass' || key === 'glassBacking';
      mesh.castShadow = !isGlass;
      mesh.receiveShadow = key !== 'glass';
      meshes.push(mesh);
    }
    return meshes;
  }
}

function createShedWedge(width, depth, rise) {
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hd, 0);
  shape.lineTo(hd, 0);
  shape.lineTo(-hd, rise);
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
 * Builds an informal shantytown / favela dwelling:
 * - Rough concrete plinth & cinderblock steps
 * - Stacked asymmetric patchwork stories with cantilevered extensions & timber support stilts
 * - Mismatched corrugated metal / timber / concrete wall patches & exterior conduit pipes
 * - Asymmetric barred windows, wooden shutters, and protruding window AC units
 * - Lean-to corrugated entry awning & external staircase with landing
 * - Sloped sheet-metal roof weighted with concrete blocks, rooftop water tank on steel frame,
 *   crooked stovepipe chimney, TV antenna, or offset upper shack hut ('stepped')
 */
export function buildDetailedSlumShack(config, materials) {
  const width = config.width;
  const depth = config.depth;
  const floorHeight = config.floorHeight;
  const floors = config.floors;
  const foundationHeight = config.foundationHeight ?? 0.2;
  const roofPitchDeg = config.roofPitchDeg ?? 18;
  const roofOverhang = config.roofOverhang ?? 0.5;
  const roofType = config.roofType ?? 'shed';
  const windowDensity = config.windowDensity ?? 1;
  const windowScale = config.windowScale ?? 0.9;
  const hasPorch = config.hasPorch === true;
  const hasChimney = config.hasChimney !== false;
  const hasCornerAccents = config.hasCornerAccents === true;
  const hasBalcony = config.hasBalcony === true;

  // материалы передаются снаружи (rustPlate, waterTank)

  const batch = new SlumBatcher();
  const baseY = foundationHeight;

  // 1. Uneven Concrete Slab Plinth + Cinderblock Steps (grounded at y = 0)
  batch.addBox('foundation', width + 0.36, foundationHeight, depth + 0.36, 0, foundationHeight / 2, 0);
  batch.addBox('stoneStep', width + 0.44, 0.08, depth + 0.44, 0, foundationHeight - 0.03, 0);

  const doorX = -width * 0.22;
  const stepCount = 2;
  for (let s = 0; s < stepCount; s++) {
    const sh = foundationHeight * ((stepCount - s) / (stepCount + 1));
    batch.addBox('stoneStep', 1.65, sh, 0.42, doorX, sh / 2, depth / 2 + 0.21 + s * 0.42);
  }

  // Helper to place a patched shanty window with security bars & optional AC unit
  const addShackWindow = (
    cx,
    cy,
    cz,
    w,
    h,
    rotY,
    withAc,
    withShutters,
  ) => {
    const frameThick = 0.08;
    const nx = Math.sin(rotY);
    const nz = Math.cos(rotY);

    batch.addBox('glassBacking', w, h, 0.08, cx + nx * 0.03, cy, cz + nz * 0.03, 0, rotY);
    batch.addBox('glass', w - 0.08, h - 0.08, 0.06, cx + nx * 0.055, cy, cz + nz * 0.055, 0, rotY);

    // Timber / scrap metal window casing
    batch.addBox('timberAccent', w + 0.14, frameThick, 0.12, cx + nx * 0.085, cy + h / 2, cz + nz * 0.085, 0, rotY);
    batch.addBox('timberAccent', w + 0.14, frameThick, 0.14, cx + nx * 0.095, cy - h / 2, cz + nz * 0.095, 0, rotY);

    // Vertical security rebar grilles
    const bars = Math.max(2, Math.round(w / 0.32));
    for (let b = 0; b <= bars; b++) {
      const along = -w / 2 + 0.08 + (b / bars) * (w - 0.16);
      const bx = cx + Math.cos(rotY) * along + nx * 0.105;
      const bz = cz - Math.sin(rotY) * along + nz * 0.105;
      batch.addBox('trim', 0.03, h - 0.06, 0.03, bx, cy, bz, 0, rotY);
    }

    if (withShutters) {
      const shW = Math.min(0.45, w * 0.42);
      const sx = cx + Math.cos(rotY) * (w / 2 + shW / 2 + 0.04) + nx * 0.085;
      const sz = cz - Math.sin(rotY) * (w / 2 + shW / 2 + 0.04) + nz * 0.085;
      batch.addBox('rustPlate', shW, h, 0.05, sx, cy, sz, 0, rotY, 0.04);
    }

    if (withAc) {
      // Boxy window AC unit protruding below sill
      batch.addBox(
        'stoneStep',
        0.58,
        0.38,
        0.46,
        cx + nx * 0.24,
        cy - h / 2 + 0.22,
        cz + nz * 0.24,
        0,
        rotY,
      );
      batch.addBox(
        'trim',
        0.48,
        0.28,
        0.04,
        cx + nx * 0.48,
        cy - h / 2 + 0.22,
        cz + nz * 0.48,
        0,
        rotY,
      );
    }
  };

  // 2. Build Each Level with Asymmetric Favela Overhangs & Patchwork Facades
  const levels = [];

  for (let f = 0; f < floors; f++) {
    const isUpper = f > 0;
    const ox = isUpper ? (f % 2 === 1 ? 0.42 : -0.35) : 0;
    const oz = isUpper ? (f % 2 === 1 ? 0.32 : -0.22) : 0;
    const lw = isUpper ? Math.max(4.8, width * (f === 1 ? 0.96 : 0.88)) : width;
    const ld = isUpper ? Math.max(4.4, depth * (f === 1 ? 0.94 : 0.86)) : depth;
    const bottomY = baseY + f * floorHeight;
    const cy = bottomY + floorHeight / 2;

    levels.push({ w: lw, d: ld, ox, oz, bottomY });

    // Main story box
    batch.addBox('wall', lw, floorHeight, ld, ox, cy, oz);

    // Intermediate timber/metal floor joist belt
    batch.addBox('timberAccent', lw + 0.14, 0.14, ld + 0.14, ox, bottomY + floorHeight - 0.05, oz);

    // Timber / steel support stilts under cantilevered upper edges
    if (isUpper) {
      const prev = levels[f - 1];
      const overhangRight = ox + lw / 2 - (prev.ox + prev.w / 2);
      const overhangFront = oz + ld / 2 - (prev.oz + prev.d / 2);
      if (overhangRight > 0.15) {
        for (const pz of [oz - ld * 0.34, oz + ld * 0.34]) {
          batch.addBox('timberAccent', 0.16, bottomY - baseY + 0.05, 0.16, ox + lw / 2 - 0.14, baseY + (bottomY - baseY) / 2, pz);
          batch.addBox('timberAccent', 0.1, 0.65, 0.1, ox + lw / 2 - 0.25, bottomY - 0.28, pz, 0, 0, -0.55);
        }
      }
      if (overhangFront > 0.15) {
        for (const px of [ox - lw * 0.32, ox + lw * 0.25]) {
          batch.addBox('timberAccent', 0.15, bottomY - baseY + 0.05, 0.15, px, baseY + (bottomY - baseY) / 2, oz + ld / 2 - 0.14);
        }
      }
    }

    // Mismatched patchwork sheet-metal, rust & plywood plates + vertical plumbing risers
    if (hasCornerAccents) {
      const patchMat = f % 2 === 0 ? 'rustPlate' : 'timberAccent';
      batch.addBox(
        patchMat,
        lw * 0.38,
        floorHeight * 0.72,
        0.028,
        ox + (f % 2 === 0 ? lw * 0.22 : -lw * 0.2),
        cy + 0.08,
        oz + ld / 2 + 0.015,
      );
      batch.addBox(
        'stoneStep',
        0.028,
        floorHeight * 0.62,
        ld * 0.42,
        ox - lw / 2 - 0.015,
        cy - 0.1,
        oz + (f % 2 === 0 ? -ld * 0.18 : ld * 0.16),
      );
      batch.addBox(
        'metalAccent',
        0.028,
        floorHeight * 0.78,
        ld * 0.36,
        ox + lw / 2 + 0.015,
        cy,
        oz - ld * 0.16,
      );

      // Exterior PVC / steel drainpipe along corner
      batch.addCylinder('trim', 0.06, 0.06, floorHeight + 0.1, ox - lw / 2 - 0.08, cy, oz + ld / 2 - 0.35);
      // Exposed horizontal conduit wire/pipe
      batch.addBox('trim', lw * 0.82, 0.05, 0.05, ox, bottomY + floorHeight * 0.84, oz + ld / 2 + 0.06);
    }

    // Main doorway on floor 0 (and upper terrace door on floor 1)
    if (f === 0) {
      const dH = Math.min(floorHeight - 0.35, 2.02);
      const dW = 0.96;
      const dx = doorX;
      const dz = oz + ld / 2 + 0.02;
      batch.addBox('trim', dW + 0.18, dH + 0.12, 0.14, dx, bottomY + (dH + 0.12) / 2, dz);
      batch.addBox('door', dW, dH, 0.1, dx, bottomY + dH / 2, dz + 0.02);
      batch.addBox('metalAccent', 0.24, 0.45, 0.12, dx, bottomY + dH * 0.68, dz + 0.03);
    } else if (f === 1 && hasPorch) {
      const dH = Math.min(floorHeight - 0.35, 1.94);
      const dW = 0.88;
      const dx = ox + lw * 0.24;
      const dz = oz + ld / 2 + 0.02;
      batch.addBox('trim', dW + 0.16, dH + 0.1, 0.12, dx, bottomY + (dH + 0.1) / 2, dz);
      batch.addBox('door', dW, dH, 0.1, dx, bottomY + dH / 2, dz + 0.02);
    }

    // Windows across front, back & side walls
    const winH = Math.min(floorHeight * 0.56, 1.15 * windowScale);
    const winW = 1.05 * windowScale;
    const wy = bottomY + floorHeight * 0.54;

    // Front (+Z) windows (avoid doorway overlap)
    const frontSlots = windowDensity === 1 ? [0.18] : windowDensity === 2 ? [-0.02, 0.28] : [-0.36, 0.02, 0.32];
    frontSlots.forEach((frac, idx) => {
      const wx = ox + lw * frac;
      if (f === 0 && Math.abs(wx - doorX) < 1.15) return;
      if (f === 1 && hasPorch && Math.abs(wx - (ox + lw * 0.24)) < 1.05) return;
      addShackWindow(
        wx,
        wy + (idx % 2 === 0 ? 0.04 : -0.06),
        oz + ld / 2,
        winW * (idx % 2 === 0 ? 1.0 : 0.82),
        winH * (idx % 2 === 0 ? 1.0 : 0.85),
        0,
        f === 0 && idx === 0,
        idx % 2 === 1,
      );
    });

    // Side windows (+X and -X)
    const sideCount = Math.max(1, windowDensity);
    for (let s = 0; s < sideCount; s++) {
      const sz = oz - ld * 0.26 + (sideCount === 1 ? ld * 0.26 : (s / (sideCount - 1)) * ld * 0.52);
      addShackWindow(
        ox + lw / 2,
        wy + (s % 2 === 0 ? 0.05 : -0.04),
        sz,
        winW * 0.88,
        winH * 0.9,
        Math.PI / 2,
        f === 1 && s === 0,
        false,
      );
      addShackWindow(
        ox - lw / 2,
        wy,
        sz,
        winW * 0.84,
        winH * 0.85,
        -Math.PI / 2,
        false,
        s === 0,
      );
    }

    // Back (-Z) windows
    addShackWindow(ox - lw * 0.2, wy, oz - ld / 2, winW, winH, Math.PI, false, false);
    if (windowDensity >= 2) {
      addShackWindow(ox + lw * 0.22, wy - 0.06, oz - ld / 2, winW * 0.82, winH * 0.88, Math.PI, false, true);
    }
  }

  // 3. Lean-To Entry Canopy & External Crooked Staircase (hasPorch)
  if (hasPorch) {
    const f0 = levels[0];
    const awW = 2.55;
    const awD = 1.65;
    const awY = baseY + Math.min(floorHeight - 0.22, 2.24);
    const awZ = f0.oz + f0.d / 2 + awD / 2;

    batch.addBox('rustPlate', awW, 0.07, awD, doorX, awY, awZ, 0.22, 0, 0);
    // Support timber posts
    for (const px of [doorX - awW * 0.42, doorX + awW * 0.42]) {
      batch.addBox('timberAccent', 0.1, awY - 0.18, 0.1, px, (awY - 0.18) / 2, awZ + awD * 0.42);
    }

    // External steel/timber staircase up to floor 1 landing when floors >= 2
    if (floors >= 2) {
      const f1 = levels[1];
      const landW = 1.75;
      const landD = 1.25;
      const landX = f1.ox + f1.w * 0.24;
      const landZ = f1.oz + f1.d / 2 + landD / 2;
      const landY = f1.bottomY;

      batch.addBox('timberAccent', landW, 0.12, landD, landX, landY - 0.04, landZ);
      // Support posts under landing
      batch.addBox('trim', 0.09, landY, 0.09, landX + landW / 2 - 0.08, landY / 2, landZ + landD / 2 - 0.08);
      batch.addBox('trim', 0.09, landY, 0.09, landX - landW / 2 + 0.08, landY / 2, landZ + landD / 2 - 0.08);

      // Sloped stair stringer & stepped treads descending toward +X along front facade
      const stairSteps = 8;
      const stairSpanX = 2.6;
      const stairStartX = landX + landW / 2 - 0.1;
      for (let s = 0; s < stairSteps; s++) {
        const frac = (s + 0.5) / stairSteps;
        const sx = stairStartX + frac * stairSpanX;
        const sy = landY - frac * (landY - foundationHeight * 0.2);
        batch.addBox('timberAccent', 0.32, 0.07, 0.92, sx, sy, landZ - 0.08);
      }
      // Diagonal steel stair stringer & handrail
      const stairLen = Math.hypot(stairSpanX, landY - 0.1);
      const stairAngle = Math.atan2(landY - 0.1, stairSpanX);
      batch.addBox(
        'trim',
        stairLen,
        0.09,
        0.08,
        stairStartX + stairSpanX / 2,
        landY / 2,
        landZ + 0.36,
        0,
        0,
        -stairAngle,
      );
      batch.addBox(
        'trim',
        stairLen,
        0.05,
        0.05,
        stairStartX + stairSpanX / 2,
        landY / 2 + 0.85,
        landZ + 0.36,
        0,
        0,
        -stairAngle,
      );
      batch.addBox('trim', 0.06, 0.9, 0.06, stairStartX, landY + 0.42, landZ + 0.36);
      batch.addBox('trim', 0.06, 0.9, 0.06, stairStartX + stairSpanX, 0.45, landZ + 0.36);
    }
  }

  // 4. Cantilevered Upper Catwalk Balcony & Clothesline Tarp (hasBalcony)
  if (hasBalcony && floors >= 2) {
    const targetLv = levels[floors >= 3 ? 2 : 1];
    const balW = targetLv.w * 0.58;
    const balD = 1.15;
    const balX = targetLv.ox - targetLv.w * 0.18;
    const balZ = targetLv.oz + targetLv.d / 2 + balD / 2;
    const balY = targetLv.bottomY;

    batch.addBox('timberAccent', balW, 0.12, balD, balX, balY, balZ);
    // Diagonal timber brackets beneath balcony
    for (const bx of [balX - balW * 0.38, balX, balX + balW * 0.38]) {
      batch.addBox('timberAccent', 0.09, 0.95, 0.09, bx, balY - 0.38, balZ - 0.15, 0.62, 0, 0);
      batch.addBox('timberAccent', 0.07, 0.92, 0.07, bx, balY + 0.46, balZ + balD / 2 - 0.06);
    }
    // Scrap metal/wood railing + hung tarp sheet
    batch.addBox('trim', balW, 0.06, 0.06, balX, balY + 0.92, balZ + balD / 2 - 0.06);
    batch.addBox('timberAccent', balW, 0.06, 0.04, balX, balY + 0.5, balZ + balD / 2 - 0.06);
    batch.addBox('rustPlate', 0.72, 0.65, 0.03, balX - balW * 0.2, balY + 0.55, balZ + balD / 2 - 0.02);
  }

  // 5. Roof Systems & Rooftop Shack / Water Tank / Weighted Concrete Blocks
  const topLv = levels[levels.length - 1];
  const roofY = topLv.bottomY + floorHeight;

  if (roofType === 'stepped') {
    // Flat lower deck + crooked upper rooftop shanty cabin
    batch.addBox('roof', topLv.w + 0.3, 0.16, topLv.d + 0.3, topLv.ox, roofY + 0.06, topLv.oz);

    const hutW = Math.max(3.2, topLv.w * 0.56);
    const hutD = Math.max(3.0, topLv.d * 0.6);
    const hutH = floorHeight * 0.86;
    const hutX = topLv.ox - topLv.w * 0.16;
    const hutZ = topLv.oz - topLv.d * 0.12;

    batch.addBox('rustPlate', hutW, hutH, hutD, hutX, roofY + 0.12 + hutH / 2, hutZ);
    batch.addBox('door', 0.82, hutH * 0.76, 0.08, hutX + hutW * 0.22, roofY + 0.12 + hutH * 0.38, hutZ + hutD / 2 + 0.02);
    addShackWindow(hutX - hutW * 0.22, roofY + 0.12 + hutH * 0.54, hutZ + hutD / 2, 0.78, 0.68, 0, false, false);

    // Sloped corrugated roof over the rooftop hut
    const hutRise = Math.max(0.55, Math.tan((roofPitchDeg * Math.PI) / 180) * hutD * 0.5);
    const hutWedge = createShedWedge(hutW, hutD, hutRise);
    batch.addGeometry('rustPlate', hutWedge, hutX, roofY + 0.12 + hutH, hutZ);

    const slopeLen = Math.hypot(hutD + roofOverhang * 1.1, hutRise);
    const slopeAng = Math.atan2(hutRise, hutD);
    batch.addBox(
      'roof',
      hutW + roofOverhang * 1.2,
      0.08,
      slopeLen,
      hutX,
      roofY + 0.12 + hutH + hutRise / 2 + 0.05,
      hutZ,
      slopeAng,
      0,
    );
  } else if (roofType === 'flat') {
    // Flat scrap-board parapet roof + wooden crates / pallets
    batch.addBox('roof', topLv.w + 0.24, 0.16, topLv.d + 0.24, topLv.ox, roofY + 0.06, topLv.oz);
    const pt = 0.12;
    const ph = 0.42;
    batch.addBox('timberAccent', topLv.w, ph, pt, topLv.ox, roofY + 0.12 + ph / 2, topLv.oz + topLv.d / 2 - pt / 2);
    batch.addBox('timberAccent', topLv.w, ph, pt, topLv.ox, roofY + 0.12 + ph / 2, topLv.oz - topLv.d / 2 + pt / 2);
    batch.addBox('timberAccent', pt, ph, topLv.d, topLv.ox - topLv.w / 2 + pt / 2, roofY + 0.12 + ph / 2, topLv.oz);
    batch.addBox('timberAccent', pt, ph, topLv.d, topLv.ox + topLv.w / 2 - pt / 2, roofY + 0.12 + ph / 2, topLv.oz);

    // Stacked scrap crates & timber planks on roof
    batch.addBox('timberAccent', 1.1, 0.55, 0.9, topLv.ox - topLv.w * 0.24, roofY + 0.4, topLv.oz + topLv.d * 0.14);
    batch.addBox('rustPlate', 0.85, 0.45, 0.75, topLv.ox - topLv.w * 0.18, roofY + 0.9, topLv.oz + topLv.d * 0.12, 0, 0.25);
  } else {
    // Slanted overhanging corrugated sheet-metal roof weighted with concrete blocks
    const rise = Math.max(0.75, Math.tan((roofPitchDeg * Math.PI) / 180) * (topLv.d * 0.52));
    const wedge = createShedWedge(topLv.w, topLv.d, rise);
    batch.addGeometry('wall', wedge, topLv.ox, roofY, topLv.oz);

    const slopeLen = Math.hypot(topLv.d, rise) + roofOverhang * 1.6;
    const slopeAng = Math.atan2(rise, topLv.d);
    const roofMidY = roofY + rise / 2 + 0.08;
    batch.addBox(
      'roof',
      topLv.w + roofOverhang * 1.7,
      0.09,
      slopeLen,
      topLv.ox,
      roofMidY,
      topLv.oz,
      slopeAng,
      0,
    );

    // Exposed timber rafters under eaves
    const rafterCount = 5;
    for (let r = 0; r < rafterCount; r++) {
      const rx = topLv.ox - topLv.w / 2 + (r / (rafterCount - 1)) * topLv.w;
      batch.addBox('timberAccent', 0.09, 0.12, slopeLen, rx, roofMidY - 0.09, topLv.oz, slopeAng, 0);
    }

    // Concrete cinderblocks / scrap weights holding corrugated roof sheets down
    for (const bx of [topLv.ox - topLv.w * 0.34, topLv.ox + 0.2, topLv.ox + topLv.w * 0.36]) {
      batch.addBox(
        'stoneStep',
        0.38,
        0.18,
        0.24,
        bx,
        roofY + rise * 0.22 + 0.18,
        topLv.oz + topLv.d * 0.28,
        slopeAng,
        0.15,
      );
    }
  }

  // 6. Rooftop Water Tank Drum on Steel Frame, Stovepipe & TV Antenna (hasChimney)
  if (hasChimney) {
    const shedRise =
      roofType === 'shed'
        ? Math.max(0.75, Math.tan((roofPitchDeg * Math.PI) / 180) * (topLv.d * 0.52))
        : 0;
    const roofSurfaceY = (zAbs) => {
      if (roofType === 'shed') {
        const zRel = zAbs - topLv.oz;
        return roofY + shedRise * Math.max(0, Math.min(1, 0.5 - zRel / topLv.d)) + 0.1;
      }
      return roofY + 0.14;
    };

    const tx = topLv.ox + topLv.w * 0.27;
    const tz = roofType === 'stepped' ? topLv.oz + topLv.d * 0.16 : topLv.oz - topLv.d * 0.18;
    const tankDeckY = roofSurfaceY(tz);
    const frameH = 0.85;

    // 4-leg angle-iron scaffold stand
    for (const lx of [-0.42, 0.42]) {
      for (const lz of [-0.42, 0.42]) {
        batch.addBox('trim', 0.07, frameH, 0.07, tx + lx, tankDeckY + frameH / 2, tz + lz);
      }
    }
    batch.addBox('trim', 0.96, 0.07, 0.96, tx, tankDeckY + frameH, tz);

    // Cylindrical blue water barrel tank
    const tankH = 1.15;
    batch.addCylinder('waterTank', 0.46, 0.46, tankH, tx, tankDeckY + frameH + tankH / 2 + 0.02, tz);
    batch.addCylinder('trim', 0.48, 0.48, 0.06, tx, tankDeckY + frameH + tankH * 0.35, tz);
    batch.addCylinder('trim', 0.48, 0.48, 0.06, tx, tankDeckY + frameH + tankH * 0.72, tz);
    batch.addCylinder('trim', 0.22, 0.22, 0.08, tx, tankDeckY + frameH + tankH + 0.05, tz);

    // Crooked sheet-metal stovepipe chimney on opposite side
    const chX = roofType === 'stepped' ? topLv.ox + topLv.w * 0.28 : topLv.ox - topLv.w * 0.36;
    const chZ = roofType === 'stepped' ? topLv.oz - topLv.d * 0.2 : topLv.oz + topLv.d * 0.15;
    const chDeckY = roofSurfaceY(chZ);
    const chH = 1.45;
    batch.addCylinder('chimney', 0.11, 0.1, chH, chX, chDeckY + chH / 2, chZ);
    batch.addCylinder('metalAccent', 0.2, 0.05, 0.12, chX, chDeckY + chH + 0.08, chZ);

    // Improvised Yagi TV antenna mast on high edge
    const antX = roofType === 'stepped' ? topLv.ox + topLv.w * 0.18 : topLv.ox - topLv.w * 0.18;
    const antZ = topLv.oz - topLv.d * 0.36;
    const antBaseY = roofSurfaceY(antZ);
    batch.addCylinder('metalAccent', 0.03, 0.025, 1.85, antX, antBaseY + 0.92, antZ);
    batch.addBox('metalAccent', 0.04, 0.04, 0.95, antX, antBaseY + 1.72, antZ, 0.1, 0.3);
    batch.addBox('metalAccent', 0.72, 0.03, 0.03, antX, antBaseY + 1.72, antZ - 0.35, 0, 0.3);
    batch.addBox('metalAccent', 0.56, 0.03, 0.03, antX, antBaseY + 1.72, antZ + 0.15, 0, 0.3);
  }

  return batch.buildMeshes(materials);
}



export function makeSlumShackMaterials(wallColorHex = '#8d949b') {
  const mk = (color, roughness = 0.85, metalness = 0.08, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    wall: mk(new THREE.Color(wallColorHex), 0.9, 0.05),
    roof: mk(0x6b7280, 0.85, 0.15),
    trim: mk(0x5a4a3a, 0.8, 0.1),
    door: mk(0x5e4332, 0.7, 0.05),
    foundation: mk(0x6b7280, 0.9, 0.04),
    stoneStep: mk(0x8a8a8a, 0.85, 0.05),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9db4c0, transparent: true, opacity: 0.3, roughness: 0.1, metalness: 0.0, transmission: 0.1 }),
    glassBacking: mk(0x111827, 0.95, 0.0),
    metalAccent: mk(0x6b7280, 0.6, 0.4),
    timberAccent: mk(0x7a5a3a, 0.85, 0.05),
    chimney: mk(0x4b5563, 0.8, 0.2),
    rustPlate: mk(0x8b5a2b, 0.92, 0.35),
    waterTank: mk(0x1e3a5f, 0.55, 0.08),
  };
}
