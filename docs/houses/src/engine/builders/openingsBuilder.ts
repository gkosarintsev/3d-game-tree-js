import * as THREE from 'three';
import { computeRoofRiseMeters } from '../../core/houseMetrics';
import { STYLES_REGISTRY } from '../../core/registries/stylesRegistry';
import type { HouseConfig } from '../../types/house';
import type { HouseBuildContext, HousePartBuilder } from './types';

interface WindowSpec {
  w: number;
  h: number;
  hasMullions: boolean;
  hasShutters: boolean;
}

function createWindowAssembly(spec: WindowSpec, ctx: HouseBuildContext): THREE.Group {
  const win = new THREE.Group();
  win.name = 'WindowAssembly';

  const frameT = 0.065;
  const frameD = 0.11;

  const hBarGeo = ctx.trackGeometry(new THREE.BoxGeometry(spec.w, frameT, frameD));
  const vBarGeo = ctx.trackGeometry(new THREE.BoxGeometry(frameT, spec.h - frameT * 2, frameD));

  const topBar = new THREE.Mesh(hBarGeo, ctx.materials.trim);
  topBar.position.set(0, spec.h / 2 - frameT / 2, 0);
  const botBar = new THREE.Mesh(hBarGeo, ctx.materials.trim);
  botBar.position.set(0, -spec.h / 2 + frameT / 2, 0);
  const leftBar = new THREE.Mesh(vBarGeo, ctx.materials.trim);
  leftBar.position.set(-spec.w / 2 + frameT / 2, 0, 0);
  const rightBar = new THREE.Mesh(vBarGeo, ctx.materials.trim);
  rightBar.position.set(spec.w / 2 - frameT / 2, 0, 0);

  const sillGeo = ctx.trackGeometry(new THREE.BoxGeometry(spec.w + 0.14, 0.06, frameD + 0.09));
  const sill = new THREE.Mesh(sillGeo, ctx.materials.stoneStep);
  sill.position.set(0, -spec.h / 2 - 0.02, 0.035);
  sill.castShadow = true;

  const glassW = Math.max(0.2, spec.w - frameT * 1.8);
  const glassH = Math.max(0.2, spec.h - frameT * 1.8);
  const backingGeo = ctx.trackGeometry(new THREE.BoxGeometry(glassW, glassH, 0.02));
  const backing = new THREE.Mesh(backingGeo, ctx.materials.glassBacking);
  backing.position.set(0, 0, -0.02);

  const glassGeo = ctx.trackGeometry(new THREE.BoxGeometry(glassW, glassH, 0.015));
  const glass = new THREE.Mesh(glassGeo, ctx.materials.glass);
  glass.position.set(0, 0, 0.008);

  win.add(topBar, botBar, leftBar, rightBar, sill, backing, glass);

  if (spec.hasMullions) {
    const mullionV = new THREE.Mesh(
      ctx.trackGeometry(new THREE.BoxGeometry(0.032, glassH, 0.045)),
      ctx.materials.trim,
    );
    const mullionH = new THREE.Mesh(
      ctx.trackGeometry(new THREE.BoxGeometry(glassW, 0.032, 0.045)),
      ctx.materials.trim,
    );
    win.add(mullionV, mullionH);
  }

  if (spec.hasShutters) {
    const shutterW = Math.min(0.26, spec.w * 0.26);
    const shutterGeo = ctx.trackGeometry(new THREE.BoxGeometry(shutterW, spec.h, 0.04));
    const leftShutter = new THREE.Mesh(shutterGeo, ctx.materials.door);
    leftShutter.position.set(-spec.w / 2 - shutterW / 2 - 0.03, 0, 0.015);
    leftShutter.castShadow = true;
    const rightShutter = new THREE.Mesh(shutterGeo, ctx.materials.door);
    rightShutter.position.set(spec.w / 2 + shutterW / 2 + 0.03, 0, 0.015);
    rightShutter.castShadow = true;
    win.add(leftShutter, rightShutter);
  }

  return win;
}

function createDoorAssembly(
  doorW: number,
  doorH: number,
  canopyStyle: 'pitched' | 'cantilever' | 'timber-pergola',
  hasPorch: boolean,
  ctx: HouseBuildContext,
): THREE.Group {
  const door = new THREE.Group();
  door.name = 'FrontDoorAssembly';

  const frameT = 0.08;
  const frameD = 0.14;

  const topFrame = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(doorW + frameT * 2, frameT, frameD)),
    ctx.materials.trim,
  );
  topFrame.position.set(0, doorH + frameT / 2, 0);

  const sideGeo = ctx.trackGeometry(new THREE.BoxGeometry(frameT, doorH, frameD));
  const leftFrame = new THREE.Mesh(sideGeo, ctx.materials.trim);
  leftFrame.position.set(-doorW / 2 - frameT / 2, doorH / 2, 0);
  const rightFrame = new THREE.Mesh(sideGeo, ctx.materials.trim);
  rightFrame.position.set(doorW / 2 + frameT / 2, doorH / 2, 0);

  const leafGeo = ctx.trackGeometry(new THREE.BoxGeometry(doorW, doorH, 0.06));
  const leaf = new THREE.Mesh(leafGeo, ctx.materials.door);
  leaf.position.set(0, doorH / 2, -0.02);
  leaf.castShadow = true;

  const glassSlit = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(0.16, doorH * 0.62, 0.075)),
    ctx.materials.glass,
  );
  glassSlit.position.set(-doorW * 0.22, doorH * 0.54, -0.01);

  const handle = new THREE.Mesh(
    ctx.trackGeometry(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 12)),
    ctx.materials.metalAccent,
  );
  handle.position.set(doorW * 0.32, doorH * 0.46, 0.045);

  door.add(topFrame, leftFrame, rightFrame, leaf, glassSlit, handle);

  if (hasPorch) {
    const canopyW = Math.max(1.9, doorW + 0.9);
    const canopyD = 1.15;
    const canopyY = doorH + 0.26;

    if (canopyStyle === 'cantilever') {
      const slab = new THREE.Mesh(
        ctx.trackGeometry(new THREE.BoxGeometry(canopyW, 0.12, canopyD)),
        ctx.materials.trim,
      );
      slab.position.set(0, canopyY, canopyD / 2);
      slab.castShadow = true;
      door.add(slab);
    } else if (canopyStyle === 'timber-pergola') {
      const beam = new THREE.Mesh(
        ctx.trackGeometry(new THREE.BoxGeometry(canopyW, 0.1, canopyD)),
        ctx.materials.trim,
      );
      beam.position.set(0, canopyY, canopyD / 2);
      beam.castShadow = true;
      const postGeo = ctx.trackGeometry(new THREE.BoxGeometry(0.11, canopyY, 0.11));
      const postL = new THREE.Mesh(postGeo, ctx.materials.trim);
      postL.position.set(-canopyW / 2 + 0.1, canopyY / 2, canopyD - 0.1);
      const postR = new THREE.Mesh(postGeo, ctx.materials.trim);
      postR.position.set(canopyW / 2 - 0.1, canopyY / 2, canopyD - 0.1);
      door.add(beam, postL, postR);
    } else {
      const slopeAngle = 0.34;
      const halfSpan = canopyW * 0.5;
      const rise = Math.tan(slopeAngle) * halfSpan;
      const slopeLen = Math.hypot(halfSpan, rise) + 0.14;

      const slopeL = new THREE.Mesh(
        ctx.trackGeometry(new THREE.BoxGeometry(slopeLen, 0.08, canopyD)),
        ctx.materials.roof,
      );
      slopeL.position.set(-halfSpan * 0.5, canopyY + rise * 0.5 + 0.02, canopyD / 2);
      slopeL.rotation.z = slopeAngle;
      slopeL.castShadow = true;

      const slopeR = new THREE.Mesh(
        ctx.trackGeometry(new THREE.BoxGeometry(slopeLen, 0.08, canopyD)),
        ctx.materials.roof,
      );
      slopeR.position.set(halfSpan * 0.5, canopyY + rise * 0.5 + 0.02, canopyD / 2);
      slopeR.rotation.z = -slopeAngle;
      slopeR.castShadow = true;

      const gableShape = new THREE.Shape();
      gableShape.moveTo(-halfSpan + 0.06, 0);
      gableShape.lineTo(halfSpan - 0.06, 0);
      gableShape.lineTo(0, rise);
      gableShape.closePath();
      const gableGeo = ctx.trackGeometry(
        new THREE.ExtrudeGeometry(gableShape, { depth: canopyD - 0.1, bevelEnabled: false }),
      );
      const gableInfill = new THREE.Mesh(gableGeo, ctx.materials.trim);
      gableInfill.position.set(0, canopyY, 0.04);
      gableInfill.castShadow = true;

      const colGeo = ctx.trackGeometry(new THREE.BoxGeometry(0.12, canopyY, 0.12));
      const colL = new THREE.Mesh(colGeo, ctx.materials.trim);
      colL.position.set(-canopyW / 2 + 0.14, canopyY / 2, canopyD - 0.12);
      colL.castShadow = true;
      const colR = new THREE.Mesh(colGeo, ctx.materials.trim);
      colR.position.set(canopyW / 2 - 0.14, canopyY / 2, canopyD - 0.12);
      colR.castShadow = true;

      door.add(slopeL, slopeR, gableInfill, colL, colR);
    }
  }

  return door;
}

function createUpperBalcony(balconyW: number, floorY: number, ctx: HouseBuildContext): THREE.Group {
  const balcony = new THREE.Group();
  balcony.name = 'UpperBalcony';

  const balconyD = 1.25;
  const deckH = 0.14;
  const railH = 0.92;

  const deck = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(balconyW, deckH, balconyD)),
    ctx.materials.timberAccent,
  );
  deck.position.set(0, floorY - deckH / 2, balconyD / 2);
  deck.castShadow = true;
  deck.receiveShadow = true;
  balcony.add(deck);

  // Corner & mid railing posts
  const postGeo = ctx.trackGeometry(new THREE.BoxGeometry(0.08, railH, 0.08));
  const postXs = [-balconyW / 2 + 0.06, 0, balconyW / 2 - 0.06];
  for (const px of postXs) {
    const p = new THREE.Mesh(postGeo, ctx.materials.timberAccent);
    p.position.set(px, floorY + railH / 2, balconyD - 0.06);
    p.castShadow = true;
    balcony.add(p);
  }

  // Side return posts near wall
  for (const sx of [-balconyW / 2 + 0.06, balconyW / 2 - 0.06]) {
    const p = new THREE.Mesh(postGeo, ctx.materials.timberAccent);
    p.position.set(sx, floorY + railH / 2, 0.08);
    balcony.add(p);
  }

  // Top & mid horizontal rails
  const frontRailGeo = ctx.trackGeometry(new THREE.BoxGeometry(balconyW, 0.07, 0.08));
  const topFront = new THREE.Mesh(frontRailGeo, ctx.materials.trim);
  topFront.position.set(0, floorY + railH, balconyD - 0.06);
  const midFront = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(balconyW, 0.05, 0.05)),
    ctx.materials.timberAccent,
  );
  midFront.position.set(0, floorY + railH * 0.45, balconyD - 0.06);
  balcony.add(topFront, midFront);

  const sideRailGeo = ctx.trackGeometry(new THREE.BoxGeometry(0.07, 0.07, balconyD));
  for (const sx of [-balconyW / 2 + 0.06, balconyW / 2 - 0.06]) {
    const sr = new THREE.Mesh(sideRailGeo, ctx.materials.trim);
    sr.position.set(sx, floorY + railH, balconyD / 2);
    balcony.add(sr);
  }

  // Vertical balusters
  const balGeo = ctx.trackGeometry(new THREE.BoxGeometry(0.035, railH * 0.88, 0.035));
  const balCount = Math.max(6, Math.floor(balconyW * 3));
  for (let i = 1; i < balCount; i++) {
    const bx = -balconyW / 2 + 0.1 + (i / balCount) * (balconyW - 0.2);
    const bal = new THREE.Mesh(balGeo, ctx.materials.timberAccent);
    bal.position.set(bx, floorY + railH * 0.45, balconyD - 0.06);
    balcony.add(bal);
  }

  // Balcony French door centered on 2nd floor
  const bDoorW = 1.4;
  const bDoorH = 2.05;
  const bDoorFrame = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(bDoorW + 0.12, bDoorH + 0.08, 0.06)),
    ctx.materials.trim,
  );
  bDoorFrame.position.set(0, floorY + bDoorH / 2, 0.01);
  const bBacking = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(bDoorW, bDoorH, 0.02)),
    ctx.materials.glassBacking,
  );
  bBacking.position.set(0, floorY + bDoorH / 2, 0.045);
  const bGlass = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(bDoorW, bDoorH, 0.015)),
    ctx.materials.glass,
  );
  bGlass.position.set(0, floorY + bDoorH / 2, 0.062);
  const bCenterBar = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(0.05, bDoorH, 0.04)),
    ctx.materials.trim,
  );
  bCenterBar.position.set(0, floorY + bDoorH / 2, 0.07);

  balcony.add(bDoorFrame, bBacking, bGlass, bCenterBar);
  return balcony;
}

/**
 * Builds the front entry door, porch canopy, A-frame gable glazing,
 * optional 2nd-floor balcony, and multi-floor facade windows.
 */
export const openingsBuilder: HousePartBuilder = {
  id: 'openings',
  build(config: HouseConfig, ctx: HouseBuildContext): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Openings';

    const styleDef = STYLES_REGISTRY[config.styleId] ?? STYLES_REGISTRY['classic-cottage'];
    const { width, depth, floorHeight, floors, foundationHeight } = config.dimensions;
    const { windowDensity, windowScale, hasPorch, hasBalcony, roofType } = config.features;

    // 1. Front entry door centered on +Z facade
    const doorW = 1.05;
    const doorH = Math.min(2.25, floorHeight - 0.35);
    const doorGroup = createDoorAssembly(
      doorW,
      doorH,
      styleDef.porchCanopyStyle,
      hasPorch,
      ctx,
    );
    doorGroup.position.set(0, foundationHeight, depth / 2 + 0.02);
    group.add(doorGroup);

    const baseWinH = Math.min(floorHeight * 0.56, 1.55 * windowScale);
    const baseWinW = Math.min(2.2, baseWinH * styleDef.windowAspectRatio);
    const winSpec: WindowSpec = {
      w: baseWinW,
      h: baseWinH,
      hasMullions: styleDef.hasWindowMullions,
      hasShutters: styleDef.hasWindowShutters,
    };

    // 2. Special A-frame gable glazing (front & back only; side walls are covered by roof slopes)
    if (roofType === 'aframe') {
      const roofRise = computeRoofRiseMeters(config);
      const kneeY = foundationHeight + 0.45;
      const groundWinY = kneeY + 1.25;

      // Flanking ground-floor windows on front & back gable ends
      const flankX = Math.min(width * 0.27, doorW + baseWinW * 0.72);
      if (flankX > doorW * 0.65 + baseWinW * 0.4) {
        const narrowSpec: WindowSpec = { ...winSpec, w: Math.min(1.05, baseWinW * 0.85) };
        for (const sign of [-1, 1]) {
          const fWin = createWindowAssembly(narrowSpec, ctx);
          fWin.position.set(sign * flankX, groundWinY, depth / 2 + 0.02);
          const bWin = createWindowAssembly(narrowSpec, ctx);
          bWin.position.set(sign * flankX, groundWinY, -depth / 2 - 0.02);
          bWin.rotation.y = Math.PI;
          group.add(fWin, bWin);
        }
      }

      // Upper loft panoramic gable windows
      if (roofRise > 3.2) {
        const loftW = Math.min(width * 0.36, 2.2 * windowScale);
        const loftH = Math.min(roofRise * 0.34, 1.65);
        const loftSpec: WindowSpec = {
          w: loftW,
          h: loftH,
          hasMullions: true,
          hasShutters: false,
        };
        const loftY = kneeY + roofRise * 0.56;

        const frontLoft = createWindowAssembly(loftSpec, ctx);
        frontLoft.position.set(0, loftY, depth / 2 + 0.02);
        const backLoft = createWindowAssembly(loftSpec, ctx);
        backLoft.position.set(0, loftY, -depth / 2 - 0.02);
        backLoft.rotation.y = Math.PI;
        group.add(frontLoft, backLoft);
      }
      return group;
    }

    // 3. Optional 2nd-floor balcony (chalet / 2-story cottages)
    const showUpperBalcony = hasBalcony && floors === 2;
    if (showUpperBalcony) {
      const balconyW = Math.min(width - 1.8, Math.max(3.4, width * 0.44));
      const balconyGroup = createUpperBalcony(
        balconyW,
        foundationHeight + floorHeight + 0.06,
        ctx,
      );
      balconyGroup.position.set(0, 0, depth / 2 + 0.02);
      group.add(balconyGroup);
    }

    // 4. Standard multi-floor facade windows
    const shutterExtra = styleDef.hasWindowShutters ? 0.32 : 0;
    const pilasterExtra = config.features.hasCornerAccents ? 0.34 : 0.16;
    const marginEdge = Math.max(1.15, baseWinW * 0.55 + shutterExtra + pilasterExtra);

    for (let floor = 0; floor < floors; floor++) {
      const winCenterY = foundationHeight + floor * floorHeight + floorHeight * 0.54;
      const usableW = Math.max(1.2, width - marginEdge * 2);
      const countFB = windowDensity + (width > 11 ? 1 : 0);

      for (let i = 0; i < countFB; i++) {
        const t = countFB === 1 ? 0.5 : i / (countFB - 1);
        const wx = -usableW / 2 + t * usableW;

        const backWin = createWindowAssembly(winSpec, ctx);
        backWin.position.set(wx, winCenterY, -depth / 2 - 0.02);
        backWin.rotation.y = Math.PI;
        group.add(backWin);

        const collidesDoor = floor === 0 && Math.abs(wx) < doorW * 0.85 + baseWinW * 0.55;
        const collidesBalcony =
          floor === 1 && showUpperBalcony && Math.abs(wx) < Math.max(1.8, width * 0.22);

        if (!collidesDoor && !collidesBalcony) {
          const frontWin = createWindowAssembly(winSpec, ctx);
          frontWin.position.set(wx, winCenterY, depth / 2 + 0.02);
          group.add(frontWin);
        } else if (floor === 0 && countFB === 1) {
          const flankOffset = Math.min(width / 2 - baseWinW * 0.75, doorW * 0.9 + baseWinW * 0.7);
          if (flankOffset > doorW * 0.75 + baseWinW * 0.45) {
            const leftWin = createWindowAssembly(winSpec, ctx);
            leftWin.position.set(-flankOffset, winCenterY, depth / 2 + 0.02);
            const rightWin = createWindowAssembly(winSpec, ctx);
            rightWin.position.set(flankOffset, winCenterY, depth / 2 + 0.02);
            group.add(leftWin, rightWin);
          }
        }
      }

      const usableD = Math.max(1.0, depth - marginEdge * 2);
      const countLR = Math.max(1, Math.min(3, windowDensity));
      for (let i = 0; i < countLR; i++) {
        const t = countLR === 1 ? 0.5 : i / (countLR - 1);
        const wz = -usableD / 2 + t * usableD;

        const rightWin = createWindowAssembly(winSpec, ctx);
        rightWin.position.set(width / 2 + 0.02, winCenterY, wz);
        rightWin.rotation.y = Math.PI / 2;

        const leftWin = createWindowAssembly(winSpec, ctx);
        leftWin.position.set(-width / 2 - 0.02, winCenterY, wz);
        leftWin.rotation.y = -Math.PI / 2;

        group.add(rightWin, leftWin);
      }
    }

    return group;
  },
};
