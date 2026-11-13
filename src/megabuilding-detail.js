import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Детальная визуальная модель мегабилдинга (docs/houses megabuilding).
 * Только картинка — коллизии/навигация остаются у данных здания.
 * Локальные координаты: центр XZ в (0,0), низ в y=0.
 */

class MegabuildingBatcher {
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
    neonCyan: [],
    neonMagenta: [],
    neonAmber: [],
    billboardMagenta: [],
    billboardCyan: [],
  };

  unitBox = new THREE.BoxGeometry(1, 1, 1);
  unitCyl = new THREE.CylinderGeometry(1, 1, 1, 16);
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
    rotX = 0,
    rotZ = 0,
  ) {
    const geo =
      radiusBottom === radiusTop
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
    const entries = Object.entries(this.buckets);

    for (const [key, geos] of entries) {
      if (geos.length === 0) continue;
      const merged = mergeGeometries(geos, false);
      for (const g of geos) g.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, materials[key]);
      mesh.name = `Megabuilding_${key}`;
      const isTransparentOrNeon = key === 'glass' || key === 'glassBacking' || key.startsWith('neon') || key.startsWith('billboard');
      mesh.castShadow = !isTransparentOrNeon;
      mesh.receiveShadow = !key.startsWith('neon') && key !== 'glass';
      meshes.push(mesh);
    }
    return meshes;
  }
}

/**
 * Creates a tapered brutalist buttress fin / exoskeleton leg via ExtrudeGeometry.
 */
function createTaperedButtressGeometry(
  bottomDepth,
  topDepth,
  height,
  thickness,
) {
  const shape = new THREE.Shape();
  shape.moveTo(-bottomDepth / 2, 0);
  shape.lineTo(bottomDepth / 2, 0);
  shape.lineTo(topDepth / 2, height);
  shape.lineTo(-topDepth / 2, height);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a sloped armored wedge crown for 'shed' roof variant.
 */
function createArmoredWedgeCrown(width, depth, rise) {
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hd, 0);
  shape.lineTo(hd, 0);
  shape.lineTo(hd, rise);
  shape.lineTo(-hd * 0.45, rise * 0.35);
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
 * Builds a Cyberpunk 2077 style Megabuilding (e.g. Megabuilding H10):
 * - Flared brutalist concrete bastion plinth & street transit arcade
 * - Twin-wing H-plan massing with deep central atrium chasm & skybridges
 * - Tapered concrete exoskeleton buttresses & periodic mechanical louver decks
 * - Modular cantilevered living capsule pods, external riser ducts & armored shutters
 * - Procedural emissive neon billboards, vertical light strips, AV landing pads & relay spire
 */
export function buildDetailedMegabuilding(config, materials) {
  const group = new THREE.Group();
  group.name = 'MegabuildingModel';

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

  // материалы (в т.ч. неон/билборды) передаются снаружи via materials

  const batch = new MegabuildingBatcher();
  const baseY = foundationHeight;

  // 1. Sloped Brutalist Bastion Plinth (grounded flush at y = 0)
  const plinthW = width + 5.6;
  const plinthD = depth + 5.2;
  batch.addBox('foundation', plinthW, foundationHeight * 0.65, plinthD, 0, foundationHeight * 0.325, 0);
  batch.addBox(
    'stoneStep',
    width + 3.0,
    foundationHeight * 0.4,
    depth + 2.6,
    0,
    foundationHeight * 0.8,
    0,
  );

  // Sloped brutalist bastion ribs along plinth perimeter
  const plinthRibCount = Math.max(4, Math.round(width / 7.5));
  for (let i = 0; i <= plinthRibCount; i++) {
    const rx = -width * 0.45 + (i / plinthRibCount) * (width * 0.9);
    const ribZ = createTaperedButtressGeometry(2.6, 0.9, foundationHeight, 0.85);
    batch.addGeometry('foundation', ribZ, rx, 0, plinthD / 2 - 1.1);
    const ribZBack = createTaperedButtressGeometry(2.6, 0.9, foundationHeight, 0.85);
    batch.addGeometry('foundation', ribZBack, rx, 0, -plinthD / 2 + 1.1);
  }

  // 2. Street Transit Arcade / Cyber-Stilobate Portal (Трасса-стилобат)
  if (hasPorch) {
    const portalW = Math.min(width * 0.48, 16.5);
    const portalH = Math.max(4.6, floorHeight * 1.45);
    const portalD = 5.4;
    const portalZ = depth / 2 + portalD / 2 - 0.8;

    // Massive armored overhang canopy & flank piers
    batch.addBox('foundation', portalW + 2.2, 1.0, portalD, 0, baseY + portalH + 0.35, portalZ);
    batch.addBox('trim', portalW + 2.6, 0.32, portalD + 0.3, 0, baseY + portalH + 0.95, portalZ);
    batch.addBox('wall', 1.6, portalH, portalD - 0.6, -portalW / 2 - 0.4, baseY + portalH / 2, portalZ);
    batch.addBox('wall', 1.6, portalH, portalD - 0.6, portalW / 2 + 0.4, baseY + portalH / 2, portalZ);

    // Recessed transit garage shutters & glowing lobby entry
    batch.addBox('door', portalW - 1.0, portalH - 0.6, 0.25, 0, baseY + (portalH - 0.6) / 2, depth / 2 + 0.05);
    batch.addBox('glassBacking', portalW - 2.8, portalH - 1.1, 0.3, 0, baseY + (portalH - 1.1) / 2, depth / 2 + 0.1);
    batch.addBox('glass', portalW - 2.8, portalH - 1.1, 0.32, 0, baseY + (portalH - 1.1) / 2, depth / 2 + 0.14);

    // Cyber entry archway neon strips & security bollards
    if (hasCornerAccents) {
      batch.addBox('neonCyan', portalW + 1.6, 0.2, 0.18, 0, baseY + portalH + 0.22, portalZ + portalD / 2 + 0.05);
      batch.addBox('neonAmber', 0.22, portalH - 0.2, 0.18, -portalW / 2 + 0.25, baseY + portalH / 2, portalZ + portalD / 2 - 0.35);
      batch.addBox('neonAmber', 0.22, portalH - 0.2, 0.18, portalW / 2 - 0.25, baseY + portalH / 2, portalZ + portalD / 2 - 0.35);
    }

    // Heavy entrance steps & street bollards
    for (let s = 0; s < 3; s++) {
      const sh = foundationHeight * ((3 - s) / 4);
      batch.addBox('stoneStep', portalW * 0.9, sh, 0.6, 0, sh / 2, plinthD / 2 + 0.3 + s * 0.6);
    }
    for (let b = -2; b <= 2; b++) {
      if (b === 0) continue;
      batch.addCylinder('metalAccent', 0.16, 0.14, 1.05, b * (portalW * 0.22), 0.525, plinthD / 2 + 2.2);
    }
  }

  // 3. Split-Wing H-Plan Massing with Central Atrium Chasm & Skybridges
  // Two flanking mega-wings + recessed central spine core
  const lowerTierEnd = roofType === 'stepped' ? Math.max(10, Math.floor(floors * 0.68)) : floors;
  const upperTierStart = lowerTierEnd;
  const lowerH = lowerTierEnd * floorHeight;

  const wingW = width * 0.34;
  const wingCenterX = width * 0.33; // Leaves a central canyon of width * 0.32 between inner faces
  const canyonW = Math.max(4.0, width - wingW * 2);
  const spineD = depth * 0.52;

  // Left Wing, Right Wing, and Recessed Central Spine
  for (const sign of [-1, 1]) {
    const wx = sign * wingCenterX;
    // Opaque recessed window backing core
    batch.addBox('glassBacking', wingW - 0.24, lowerH, depth - 0.24, wx, baseY + lowerH / 2, 0);

    // Brutalist concrete vertical corner piers on each wing
    const pierW = 1.5;
    for (const pxOff of [-wingW / 2 + pierW / 2, wingW / 2 - pierW / 2]) {
      for (const pzOff of [-depth / 2 + pierW / 2, depth / 2 - pierW / 2]) {
        batch.addBox('wall', pierW, lowerH + 0.08, pierW, wx + pxOff, baseY + lowerH / 2, pzOff);
      }
    }
  }

  // Central spine connecting the two wings deep inside the atrium chasm
  batch.addBox('glassBacking', canyonW + 0.4, lowerH, spineD - 0.2, 0, baseY + lowerH / 2, 0);
  batch.addBox('wall', canyonW + 0.2, lowerH, spineD * 0.64, 0, baseY + lowerH / 2, 0);

  // Exposed vertical elevator cores inside the +Z & -Z atrium canyon
  for (const ez of [spineD / 2 + 0.55, -spineD / 2 - 0.55]) {
    for (const ex of [-canyonW * 0.22, canyonW * 0.22]) {
      batch.addBox('trim', 1.35, lowerH, 1.15, ex, baseY + lowerH / 2, ez);
      if (hasCornerAccents) {
        batch.addBox(
          'neonCyan',
          0.16,
          lowerH - 2.0,
          0.14,
          ex,
          baseY + lowerH / 2,
          ez + (ez > 0 ? 0.6 : -0.6),
        );
      }
    }
  }

  // Multi-level skybridges spanning the central canyon (every ~6 floors)
  const bridgeInterval = 6;
  for (let f = 5; f < lowerTierEnd - 2; f += bridgeInterval) {
    const by = baseY + f * floorHeight + floorHeight * 0.5;
    for (const bz of [depth * 0.34, -depth * 0.34]) {
      batch.addBox('foundation', canyonW + 0.8, floorHeight * 0.78, 3.0, 0, by, bz);
      batch.addBox('glass', canyonW + 0.3, floorHeight * 0.42, 3.12, 0, by, bz);
      batch.addBox('trim', canyonW + 1.0, 0.22, 3.22, 0, by + floorHeight * 0.42, bz);
      if (hasCornerAccents) {
        batch.addBox(
          f % 12 === 5 ? 'neonAmber' : 'neonCyan',
          canyonW * 0.85,
          0.14,
          0.12,
          0,
          by - floorHeight * 0.28,
          bz + (bz > 0 ? 1.58 : -1.58),
        );
      }
    }
  }

  // 4. Floor-by-Floor Brutalist Spandrels, Armored Glazing & Service Louver Belts
  const glassRatio = Math.min(0.66, Math.max(0.4, 0.52 * windowScale));
  const mechInterval = 9;
  const mullionCols = windowDensity === 1 ? 3 : windowDensity === 2 ? 5 : 7;

  for (let f = 0; f < lowerTierEnd; f++) {
    const fy = baseY + f * floorHeight;
    const isMechDeck = f > 3 && f < lowerTierEnd - 2 && f % mechInterval === 0;

    if (isMechDeck) {
      // Colossal horizontal mechanical service collar wrapping the whole megablock
      batch.addBox('foundation', width + 1.2, floorHeight * 0.94, depth + 1.2, 0, fy + floorHeight / 2, 0);
      batch.addBox('trim', width + 1.5, 0.26, depth + 1.5, 0, fy + floorHeight - 0.13, 0);
      batch.addBox('trim', width + 1.5, 0.26, depth + 1.5, 0, fy + 0.13, 0);
      if (hasCornerAccents) {
        batch.addBox('neonAmber', width + 1.58, 0.15, depth + 1.58, 0, fy + floorHeight * 0.5, 0);
      }
      continue;
    }

    const glassH = floorHeight * glassRatio;
    const spandrelH = floorHeight - glassH;

    // Wing floor spandrels & glazed bays
    for (const sign of [-1, 1]) {
      const wx = sign * wingCenterX;
      batch.addBox('wall', wingW + 0.08, spandrelH, depth + 0.08, wx, fy + spandrelH / 2, 0);
      batch.addBox('glass', wingW - 0.04, glassH, depth - 0.04, wx, fy + spandrelH + glassH / 2, 0);

      // Subtle glowing interior apartment window accents on selected floors/rooms
      if (hasCornerAccents && (f * 7 + (sign > 0 ? 3 : 1)) % 5 === 0) {
        const roomOff = ((f * 3) % 3 - 1) * (wingW * 0.24);
        batch.addBox(
          f % 2 === 0 ? 'neonCyan' : 'neonAmber',
          wingW * 0.22,
          glassH * 0.72,
          depth + 0.04,
          wx + roomOff,
          fy + spandrelH + glassH / 2,
          0,
        );
      }
    }

    // Spine floor band
    batch.addBox('wall', canyonW + 0.3, spandrelH, spineD + 0.08, 0, fy + spandrelH / 2, 0);
    batch.addBox('glass', canyonW + 0.1, glassH, spineD - 0.04, 0, fy + spandrelH + glassH / 2, 0);
  }

  // Vertical armored structural mullions & exterior utility pipes on both wings
  for (const sign of [-1, 1]) {
    const wx = sign * wingCenterX;
    for (let i = 1; i < mullionCols; i++) {
      const mx = wx - wingW / 2 + (i / mullionCols) * wingW;
      batch.addBox('trim', 0.24, lowerH, depth + 0.32, mx, baseY + lowerH / 2, 0);
    }

    // Outer side flank industrial pipe risers & vertical mullions
    const flankX = sign * (width / 2 + 0.22);
    const sideCount = windowDensity + 2;
    for (let i = 1; i < sideCount; i++) {
      const pz = -depth / 2 + (i / sideCount) * depth;
      batch.addBox('metalAccent', 0.32, lowerH, 0.32, flankX, baseY + lowerH / 2, pz);
    }
  }

  // 5. Monumental Tapered Brutalist Concrete Buttress Pylons on 4 Corners
  const buttressH = lowerH * 0.78;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const buttress = createTaperedButtressGeometry(4.2, 1.3, buttressH, 2.2);
      const bx = sx * (width / 2 - 0.6);
      const bz = sz * (depth / 2 + 0.35);
      batch.addGeometry('foundation', buttress, bx, baseY, bz);

      // Sloped structural brace cap + vertical neon light strip along outer edge
      if (hasCornerAccents) {
        batch.addBox(
          sx === sz ? 'neonCyan' : 'neonMagenta',
          0.22,
          buttressH * 0.9,
          0.22,
          sx * (width / 2 + 0.52),
          baseY + buttressH * 0.45,
          sz * (depth / 2 + 0.72),
        );
      }
    }
  }

  // 6. Cantilevered Modular Living Capsule Pods (Жилые капсулы)
  if (hasBalcony) {
    for (let f = 4; f < lowerTierEnd - 3; f += 3) {
      const py = baseY + f * floorHeight + floorHeight * 0.48;
      for (const sign of [-1, 1]) {
        const podW = wingW * 0.46;
        const podX = sign * wingCenterX + ((f % 2 === 0 ? 1 : -1) * wingW * 0.14);
        const pz = (f % 6 < 3 ? 1 : -1) * (depth / 2 + 0.75);
        // Box pod module + industrial railing + glowing visor slit
        batch.addBox('stoneStep', podW, floorHeight * 0.76, 1.5, podX, py, pz);
        batch.addBox('trim', podW + 0.15, 0.18, 1.62, podX, py - floorHeight * 0.36, pz);
        batch.addBox('glass', podW - 0.45, floorHeight * 0.38, 1.56, podX, py + 0.08, pz);
      }
    }
  }

  // 7. Towering Cyberpunk Neon Billboards & Signage (Неон и вывески)
  if (hasCornerAccents) {
    // Vertical 2:3 holographic billboard centered on right wing (+Z facade)
    const bbW = Math.min(7.6, wingW * 0.62);
    const bbH = bbW * 1.5;
    const bbY1 = baseY + lowerH * 0.54;
    const bbX1 = wingCenterX;
    batch.addBox('trim', bbW + 0.55, bbH + 0.55, 0.6, bbX1, bbY1, depth / 2 + 0.4);
    batch.addBox('billboardMagenta', bbW, bbH, 0.12, bbX1, bbY1, depth / 2 + 0.74);

    // Wide 3:2 horizontal cyan cyber-banner centered on left wing lower-mid facade (+Z)
    const bbW2 = Math.min(8.8, wingW * 0.66);
    const bbH2 = bbW2 * 0.66;
    const bbY2 = baseY + lowerH * 0.3;
    const bbX2 = -wingCenterX;
    batch.addBox('trim', bbW2 + 0.55, bbH2 + 0.55, 0.6, bbX2, bbY2, depth / 2 + 0.4);
    batch.addBox('billboardCyan', bbW2, bbH2, 0.12, bbX2, bbY2, depth / 2 + 0.74);

    // Side flank 3:2 neon billboard (+X)
    const sideBbW = Math.min(11.0, depth * 0.38);
    const sideBbH = sideBbW * 0.66;
    batch.addBox('trim', 0.6, sideBbH + 0.55, sideBbW + 0.55, width / 2 + 0.4, baseY + lowerH * 0.64, 0);
    batch.addBox('billboardCyan', 0.12, sideBbH, sideBbW, width / 2 + 0.74, baseY + lowerH * 0.64, 0);
  }

  // 8. Upper Stepped Megablocks & Crown Structures
  let topCrownBaseY = baseY + lowerH;
  const upperFloors = floors - upperTierStart;

  if (roofType === 'stepped' && upperFloors > 0) {
    // Upper tier narrows into twin asymmetric brutalist penthouse towers + sky-bridge
    const upH = upperFloors * floorHeight;
    const upWingW = wingW * 0.84;
    const upWingD = depth * 0.78;
    const upX = wingCenterX * 0.92;

    // Stepped transition slab
    batch.addBox('foundation', width + 0.8, 0.9, depth + 0.6, 0, topCrownBaseY + 0.45, 0);

    for (const sign of [-1, 1]) {
      const hMod = sign === 1 ? upH : upH * 0.82;
      const uy = topCrownBaseY + hMod / 2;
      batch.addBox('glassBacking', upWingW - 0.2, hMod, upWingD - 0.2, sign * upX, uy, 0);
      batch.addBox('wall', upWingW + 0.1, hMod * 0.22, upWingD + 0.1, sign * upX, topCrownBaseY + hMod * 0.9, 0);

      for (let uf = 0; uf < Math.floor(hMod / floorHeight); uf++) {
        const ufy = topCrownBaseY + uf * floorHeight;
        batch.addBox('wall', upWingW + 0.08, floorHeight * 0.45, upWingD + 0.08, sign * upX, ufy + floorHeight * 0.225, 0);
        batch.addBox('glass', upWingW - 0.04, floorHeight * 0.55, upWingD - 0.04, sign * upX, ufy + floorHeight * 0.725, 0);
      }

      batch.addBox('roof', upWingW + 0.3, 0.45, upWingD + 0.3, sign * upX, topCrownBaseY + hMod + 0.22, 0);
      if (hasCornerAccents) {
        batch.addBox('neonCyan', upWingW + 0.4, 0.22, upWingD + 0.4, sign * upX, topCrownBaseY + hMod - 0.35, 0);
      }
    }

    // Upper high-altitude truss skybridge linking the twin upper towers
    const highBridgeY = topCrownBaseY + upH * 0.64;
    batch.addBox('foundation', canyonW + 2.4, floorHeight * 1.15, upWingD * 0.42, 0, highBridgeY, 0);
    batch.addBox('glass', canyonW + 1.8, floorHeight * 0.55, upWingD * 0.44, 0, highBridgeY, 0);
    if (hasCornerAccents) {
      batch.addBox('neonMagenta', canyonW + 1.6, 0.2, upWingD * 0.46, 0, highBridgeY - floorHeight * 0.45, 0);
    }

    // Rooftop AV Landing Pad on left upper tower (flush at upH * 0.82)
    const leftRoofY = topCrownBaseY + upH * 0.82 + 0.52;
    const padR = Math.min(upWingW, upWingD) * 0.36;
    batch.addCylinder('foundation', padR, padR, 0.28, -upX, leftRoofY, 0);
    batch.addBox('trim', 0.45, 0.08, padR * 0.9, -upX - padR * 0.28, leftRoofY + 0.16, 0);
    batch.addBox('trim', 0.45, 0.08, padR * 0.9, -upX + padR * 0.28, leftRoofY + 0.16, 0);
    batch.addBox('trim', padR * 0.56, 0.08, 0.45, -upX, leftRoofY + 0.16, 0);
    if (hasCornerAccents) {
      batch.addCylinder('neonAmber', padR * 0.94, padR * 0.94, 0.06, -upX, leftRoofY + 0.15, 0);
    }

    // Flush anchor base for relay tower on taller right upper tower (+upX)
    topCrownBaseY += upH + 0.42;
  } else if (roofType === 'shed') {
    // Slanted brutalist armored wedge crown
    batch.addBox('foundation', width + 0.8, 0.9, depth + 0.6, 0, topCrownBaseY + 0.45, 0);
    const slantRise = Math.max(4.5, Math.tan((roofPitchDeg * Math.PI) / 180) * (depth * 0.42));
    for (const sign of [-1, 1]) {
      const wedge = createArmoredWedgeCrown(wingW * 0.96, depth * 0.94, slantRise);
      batch.addGeometry('wall', wedge, sign * wingCenterX, topCrownBaseY + 0.8, 0);
      batch.addBox('trim', wingW + 0.2, 0.36, 0.45, sign * wingCenterX, topCrownBaseY + 0.8 + slantRise, depth * 0.47);
      if (hasCornerAccents) {
        batch.addBox('neonMagenta', wingW * 0.9, 0.22, 0.22, sign * wingCenterX, topCrownBaseY + 0.8 + slantRise - 0.2, depth * 0.49);
      }
    }
    // Central armored roof bridge
    batch.addBox('foundation', canyonW + 2.0, 2.2, spineD * 0.9, 0, topCrownBaseY + 1.9, 0);
    topCrownBaseY += 3.0;
  } else {
    // Broad flat industrial deck with twin AV pads & pressurized sphere tanks
    batch.addBox('foundation', width + 0.9, 0.95, depth + 0.9, 0, topCrownBaseY + 0.48, 0);
    batch.addBox('roof', width + 0.4, 0.35, depth + 0.4, 0, topCrownBaseY + 1.05, 0);
    batch.addBox('foundation', canyonW + 2.5, 2.8, spineD * 0.85, 0, topCrownBaseY + 2.4, 0);

    // Dual AV Landing Pads on left and right wing roofs
    const padR = Math.min(wingW, depth) * 0.32;
    for (const sign of [-1, 1]) {
      const px = sign * wingCenterX;
      batch.addCylinder('foundation', padR, padR, 0.24, px, topCrownBaseY + 1.3, depth * 0.16);
      batch.addBox('trim', 0.42, 0.07, padR * 0.85, px - padR * 0.26, topCrownBaseY + 1.44, depth * 0.16);
      batch.addBox('trim', 0.42, 0.07, padR * 0.85, px + padR * 0.26, topCrownBaseY + 1.44, depth * 0.16);
      batch.addBox('trim', padR * 0.52, 0.07, 0.42, px, topCrownBaseY + 1.44, depth * 0.16);
      if (hasCornerAccents) {
        batch.addCylinder('neonCyan', padR * 0.94, padR * 0.94, 0.06, px, topCrownBaseY + 1.43, depth * 0.16);
      }
      // HVAC condenser banks at rear of roof
      batch.addBox('metalAccent', wingW * 0.55, 1.8, 3.2, px, topCrownBaseY + 2.1, -depth * 0.28);
    }

    // Pressurized industrial sphere tank
    const tankGeo = new THREE.SphereGeometry(2.1, 16, 12);
    batch.addGeometry('metalAccent', tankGeo, -wingCenterX * 0.35, topCrownBaseY + 3.2, -depth * 0.18);
    topCrownBaseY += 3.6;
  }

  // 9. Communications & Microwave Relay Spire Tower (Вышка и антенны)
  if (hasChimney) {
    const towerH = floors * floorHeight;
    const totalSpireH = Math.max(12, towerH * 0.16);
    const sx = roofType === 'stepped' ? wingCenterX * 0.92 : 0;
    const sz = 0;

    // Armored hexagonal pedestal & relay equipment bunker
    const pedH = totalSpireH * 0.22;
    batch.addBox('foundation', 3.4, pedH, 3.4, sx, topCrownBaseY + pedH / 2, sz);
    batch.addBox('trim', 3.7, 0.3, 3.7, sx, topCrownBaseY + pedH, sz);

    // Lower lattice mast & microwave dish collar
    const s1H = totalSpireH * 0.38;
    batch.addCylinder('metalAccent', 0.72, 0.38, s1H, sx, topCrownBaseY + pedH + s1H / 2, sz);
    batch.addCylinder('trim', 1.45, 1.45, 0.55, sx, topCrownBaseY + pedH + s1H * 0.65, sz);

    // Upper needle whip & aviation warning beacon
    const s2H = totalSpireH * 0.4;
    batch.addCylinder('metalAccent', 0.3, 0.06, s2H, sx, topCrownBaseY + pedH + s1H + s2H / 2, sz);

    if (hasCornerAccents) {
      batch.addCylinder('neonMagenta', 0.42, 0.42, 0.45, sx, topCrownBaseY + pedH + s1H, sz);
      batch.addBox('neonAmber', 0.28, 0.55, 0.28, sx, topCrownBaseY + totalSpireH, sz);
    }
  }
  return batch.buildMeshes(materials);
}



export function makeMegabuildingMaterials(wallColorHex = '#49505b') {
  const mk = (color, roughness = 0.8, metalness = 0.05, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
  return {
    wall: mk(new THREE.Color(wallColorHex), 0.78, 0.12),
    roof: mk(0x2f3540, 0.8, 0.1),
    trim: mk(0x5b6472, 0.5, 0.35),
    door: mk(0x242933, 0.4, 0.45),
    foundation: mk(0x3a414d, 0.85, 0.14),
    stoneStep: mk(0x4d5563, 0.75, 0.12),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x457b9d, transparent: true, opacity: 0.36, roughness: 0.04, metalness: 0.0, transmission: 0.18 }),
    glassBacking: mk(0x0b1220, 0.9, 0.0),
    metalAccent: mk(0x6b7280, 0.5, 0.55),
    neonCyan: new THREE.MeshBasicMaterial({ color: 0x00ffff, toneMapped: false }),
    neonMagenta: new THREE.MeshBasicMaterial({ color: 0xff00ff, toneMapped: false }),
    neonAmber: new THREE.MeshBasicMaterial({ color: 0xffaa00, toneMapped: false }),
    billboardMagenta: new THREE.MeshBasicMaterial({ color: 0xff2d78, toneMapped: false }),
    billboardCyan: new THREE.MeshBasicMaterial({ color: 0x00e5ff, toneMapped: false }),
  };
}
