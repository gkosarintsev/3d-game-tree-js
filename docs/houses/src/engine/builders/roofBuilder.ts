import * as THREE from 'three';
import { computeRoofRiseMeters } from '../../core/houseMetrics';
import { STYLES_REGISTRY } from '../../core/registries/stylesRegistry';
import type { HouseConfig } from '../../types/house';
import type { HouseBuildContext, HousePartBuilder } from './types';

function createHipRoofGeometry(
  spanX: number,
  spanZ: number,
  riseH: number,
  ridgeLen: number,
  ridgeAlongX: boolean,
): THREE.BufferGeometry {
  const hx = spanX / 2;
  const hz = spanZ / 2;
  const rx = ridgeAlongX ? ridgeLen / 2 : 0;
  const rz = ridgeAlongX ? 0 : ridgeLen / 2;

  const p0 = [-hx, 0, hz];
  const p1 = [hx, 0, hz];
  const p2 = [hx, 0, -hz];
  const p3 = [-hx, 0, -hz];

  const r0 = ridgeAlongX ? [-rx, riseH, 0] : [0, riseH, -rz];
  const r1 = ridgeAlongX ? [rx, riseH, 0] : [0, riseH, rz];

  const positions: number[] = [];
  const uvs: number[] = [];

  const pushTri = (a: number[], b: number[], c: number[]) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    uvs.push(a[0] * 0.25, a[2] * 0.25, b[0] * 0.25, b[2] * 0.25, c[0] * 0.25, c[2] * 0.25);
  };

  if (ridgeAlongX) {
    pushTri(p0, p1, r1);
    pushTri(p0, r1, r0);
    pushTri(p2, p3, r0);
    pushTri(p2, r0, r1);
    pushTri(p1, p2, r1);
    pushTri(p3, p0, r0);
  } else {
    pushTri(p1, p2, r0);
    pushTri(p1, r0, r1);
    pushTri(p3, p0, r1);
    pushTri(p3, r1, r0);
    pushTri(p0, p1, r1);
    pushTri(p2, p3, r0);
  }

  pushTri(p0, p3, p2);
  pushTri(p0, p2, p1);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

function createDormerWindow(ctx: HouseBuildContext): THREE.Group {
  const dormer = new THREE.Group();
  dormer.name = 'MansardDormer';

  const dw = 1.15;
  const dh = 1.18;
  const dd = 1.38;

  // Dormer body
  const boxMesh = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(dw, dh, dd)),
    ctx.materials.wall,
  );
  boxMesh.position.set(0, dh / 2, 0);
  boxMesh.castShadow = true;
  boxMesh.receiveShadow = true;

  // Mini gable roof slopes on dormer
  const roofW = dw + 0.22;
  const slopeAngle = 0.5;
  const slopeLen = (roofW / 2) / Math.cos(slopeAngle) + 0.08;
  const slopeL = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(slopeLen, 0.07, dd + 0.24)),
    ctx.materials.roof,
  );
  slopeL.position.set(-roofW * 0.24, dh + 0.16, 0.04);
  slopeL.rotation.z = slopeAngle;
  slopeL.castShadow = true;

  const slopeR = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(slopeLen, 0.07, dd + 0.24)),
    ctx.materials.roof,
  );
  slopeR.position.set(roofW * 0.24, dh + 0.16, 0.04);
  slopeR.rotation.z = -slopeAngle;
  slopeR.castShadow = true;

  // Dormer gable tympanum
  const gShape = new THREE.Shape();
  gShape.moveTo(-dw / 2, 0);
  gShape.lineTo(dw / 2, 0);
  gShape.lineTo(0, Math.tan(slopeAngle) * (dw / 2));
  gShape.closePath();
  const gGeo = ctx.trackGeometry(
    new THREE.ExtrudeGeometry(gShape, { depth: dd, bevelEnabled: false }),
  );
  const gMesh = new THREE.Mesh(gGeo, ctx.materials.wall);
  gMesh.position.set(0, dh, -dd / 2);

  // Dormer window frame + backing + glass
  const winW = dw * 0.68;
  const winH = dh * 0.68;
  const frame = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(winW + 0.08, winH + 0.08, 0.06)),
    ctx.materials.trim,
  );
  frame.position.set(0, dh * 0.52, dd / 2 + 0.01);

  const backing = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(winW, winH, 0.04)),
    ctx.materials.glassBacking,
  );
  backing.position.set(0, dh * 0.52, dd / 2 + 0.025);

  const glass = new THREE.Mesh(
    ctx.trackGeometry(new THREE.BoxGeometry(winW, winH, 0.02)),
    ctx.materials.glass,
  );
  glass.position.set(0, dh * 0.52, dd / 2 + 0.045);

  dormer.add(boxMesh, slopeL, slopeR, gMesh, frame, backing, glass);
  return dormer;
}

/**
 * Builds the roof assembly (gable, hip, flat, shed, aframe, mansard),
 * perimeter trim, exposed chalet rafters, mansard dormers, and optional chimney.
 */
export const roofBuilder: HousePartBuilder = {
  id: 'roof',
  build(config: HouseConfig, ctx: HouseBuildContext): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Roof';

    const styleDef = STYLES_REGISTRY[config.styleId] ?? STYLES_REGISTRY['classic-cottage'];
    const { width, depth, floorHeight, floors, foundationHeight, roofOverhang } = config.dimensions;
    const { roofType, hasChimney, hasDormers } = config.features;
    const isAFrame = roofType === 'aframe';
    const eaveY = isAFrame ? foundationHeight + 0.45 : foundationHeight + floorHeight * floors;
    const roofRise = computeRoofRiseMeters(config);
    const slabThickness = 0.16;

    if (roofType === 'flat') {
      const deckW = width + roofOverhang * 1.1;
      const deckD = depth + roofOverhang * 1.1;
      const deckGeo = ctx.trackGeometry(new THREE.BoxGeometry(deckW, 0.22, deckD));
      const deckMesh = new THREE.Mesh(deckGeo, ctx.materials.roof);
      deckMesh.name = 'FlatRoofDeck';
      deckMesh.position.set(0, eaveY + 0.11, 0);
      deckMesh.castShadow = true;
      deckMesh.receiveShadow = true;
      group.add(deckMesh);

      const parapetH = roofRise;
      const parapetT = 0.22;
      const parapetGeoFB = ctx.trackGeometry(new THREE.BoxGeometry(deckW, parapetH, parapetT));
      const parapetGeoLR = ctx.trackGeometry(
        new THREE.BoxGeometry(parapetT, parapetH, deckD - parapetT * 2),
      );

      const frontParapet = new THREE.Mesh(parapetGeoFB, ctx.materials.wall);
      frontParapet.position.set(0, eaveY + 0.22 + parapetH / 2, deckD / 2 - parapetT / 2);
      const backParapet = new THREE.Mesh(parapetGeoFB, ctx.materials.wall);
      backParapet.position.set(0, eaveY + 0.22 + parapetH / 2, -deckD / 2 + parapetT / 2);
      const leftParapet = new THREE.Mesh(parapetGeoLR, ctx.materials.wall);
      leftParapet.position.set(-deckW / 2 + parapetT / 2, eaveY + 0.22 + parapetH / 2, 0);
      const rightParapet = new THREE.Mesh(parapetGeoLR, ctx.materials.wall);
      rightParapet.position.set(deckW / 2 - parapetT / 2, eaveY + 0.22 + parapetH / 2, 0);

      for (const p of [frontParapet, backParapet, leftParapet, rightParapet]) {
        p.castShadow = true;
        p.receiveShadow = true;
        group.add(p);
      }

      const copingH = 0.06;
      const copingGeoFB = ctx.trackGeometry(
        new THREE.BoxGeometry(deckW + 0.06, copingH, parapetT + 0.06),
      );
      const copingGeoLR = ctx.trackGeometry(
        new THREE.BoxGeometry(parapetT + 0.06, copingH, deckD + 0.06),
      );
      const copingY = eaveY + 0.22 + parapetH + copingH / 2;

      const cFront = new THREE.Mesh(copingGeoFB, ctx.materials.trim);
      cFront.position.set(0, copingY, deckD / 2 - parapetT / 2);
      const cBack = new THREE.Mesh(copingGeoFB, ctx.materials.trim);
      cBack.position.set(0, copingY, -deckD / 2 + parapetT / 2);
      const cLeft = new THREE.Mesh(copingGeoLR, ctx.materials.trim);
      cLeft.position.set(-deckW / 2 + parapetT / 2, copingY, 0);
      const cRight = new THREE.Mesh(copingGeoLR, ctx.materials.trim);
      cRight.position.set(deckW / 2 - parapetT / 2, copingY, 0);
      group.add(cFront, cBack, cLeft, cRight);
    } else if (roofType === 'shed') {
      const totalRun = depth + roofOverhang * 2;
      const slopeLen = Math.hypot(depth, roofRise) + roofOverhang * 2;
      const angle = Math.atan2(roofRise, depth);
      const roofW = width + roofOverhang * 2;

      const panelGeo = ctx.trackGeometry(new THREE.BoxGeometry(roofW, slabThickness, slopeLen));
      const panelMesh = new THREE.Mesh(panelGeo, ctx.materials.roof);
      panelMesh.name = 'ShedRoofSlope';
      panelMesh.position.set(0, eaveY + roofRise / 2 + slabThickness * 0.45, 0);
      panelMesh.rotation.x = angle;
      panelMesh.castShadow = true;
      panelMesh.receiveShadow = true;
      group.add(panelMesh);

      const fasciaGeo = ctx.trackGeometry(new THREE.BoxGeometry(roofW + 0.04, 0.14, 0.06));
      const frontFascia = new THREE.Mesh(fasciaGeo, ctx.materials.trim);
      frontFascia.position.set(0, eaveY + roofRise + Math.sin(angle) * roofOverhang, totalRun / 2);
      const backFascia = new THREE.Mesh(fasciaGeo, ctx.materials.trim);
      backFascia.position.set(0, eaveY - Math.sin(angle) * roofOverhang, -totalRun / 2);
      group.add(frontFascia, backFascia);
    } else if (roofType === 'hip') {
      const spanX = width + roofOverhang * 2;
      const spanZ = depth + roofOverhang * 2;
      const ridgeAlongX = width >= depth;
      const ridgeLen = Math.max(0.4, Math.abs(spanX - spanZ) + 0.4);
      const hipGeo = ctx.trackGeometry(
        createHipRoofGeometry(spanX, spanZ, roofRise + 0.14, ridgeLen, ridgeAlongX),
      );
      const hipMesh = new THREE.Mesh(hipGeo, ctx.materials.roof);
      hipMesh.name = 'HipRoofBody';
      hipMesh.position.set(0, eaveY - 0.06, 0);
      hipMesh.castShadow = true;
      hipMesh.receiveShadow = true;
      group.add(hipMesh);

      const fasciaH = 0.14;
      const fasciaT = 0.08;
      const fGeoFB = ctx.trackGeometry(new THREE.BoxGeometry(spanX + 0.04, fasciaH, fasciaT));
      const fGeoLR = ctx.trackGeometry(new THREE.BoxGeometry(fasciaT, fasciaH, spanZ + 0.04));

      const f1 = new THREE.Mesh(fGeoFB, ctx.materials.trim);
      f1.position.set(0, eaveY - fasciaH * 0.35, spanZ / 2);
      const f2 = new THREE.Mesh(fGeoFB, ctx.materials.trim);
      f2.position.set(0, eaveY - fasciaH * 0.35, -spanZ / 2);
      const f3 = new THREE.Mesh(fGeoLR, ctx.materials.trim);
      f3.position.set(-spanX / 2, eaveY - fasciaH * 0.35, 0);
      const f4 = new THREE.Mesh(fGeoLR, ctx.materials.trim);
      f4.position.set(spanX / 2, eaveY - fasciaH * 0.35, 0);
      group.add(f1, f2, f3, f4);

      const ridgeCapGeo = ctx.trackGeometry(
        ridgeAlongX
          ? new THREE.BoxGeometry(ridgeLen + 0.12, 0.08, 0.16)
          : new THREE.BoxGeometry(0.16, 0.08, ridgeLen + 0.12),
      );
      const ridgeCap = new THREE.Mesh(ridgeCapGeo, ctx.materials.trim);
      ridgeCap.position.set(0, eaveY + roofRise + 0.08, 0);
      group.add(ridgeCap);
    } else if (roofType === 'aframe') {
      // Steep A-frame slopes always run ridge along Z so the triangle faces +Z front
      const runHalf = width / 2;
      const ridgeLength = depth + roofOverhang * 2;
      const slopeHalf = Math.hypot(runHalf, roofRise);
      const slopeAngle = Math.atan2(roofRise, runHalf);
      const sideExtension = 0.32;
      const panelSlopeLen = slopeHalf + sideExtension;

      const panelGeo = ctx.trackGeometry(
        new THREE.BoxGeometry(panelSlopeLen, slabThickness, ridgeLength),
      );
      const midX = runHalf * 0.5 - Math.cos(slopeAngle) * (sideExtension * 0.25);
      const midY = eaveY + roofRise * 0.5 + slabThickness * 0.4 - Math.sin(slopeAngle) * (sideExtension * 0.25);

      const slopeR = new THREE.Mesh(panelGeo, ctx.materials.roof);
      slopeR.name = 'AFrameSlopeRight';
      slopeR.position.set(midX, midY, 0);
      slopeR.rotation.z = -slopeAngle;
      slopeR.castShadow = true;
      slopeR.receiveShadow = true;

      const slopeL = new THREE.Mesh(panelGeo, ctx.materials.roof);
      slopeL.name = 'AFrameSlopeLeft';
      slopeL.position.set(-midX, midY, 0);
      slopeL.rotation.z = slopeAngle;
      slopeL.castShadow = true;
      slopeL.receiveShadow = true;

      const ridgeCap = new THREE.Mesh(
        ctx.trackGeometry(new THREE.BoxGeometry(0.22, 0.14, ridgeLength + 0.04)),
        ctx.materials.trim,
      );
      ridgeCap.name = 'AFrameRidgeCap';
      ridgeCap.position.set(0, eaveY + roofRise + 0.08, 0);
      ridgeCap.castShadow = true;

      group.add(slopeR, slopeL, ridgeCap);
    } else if (roofType === 'mansard') {
      // Two-slope gambrel/mansard roof matching wallsBuilder MansardGableGeometry
      const ridgeAlongX = width >= depth;
      const runHalf = (ridgeAlongX ? depth : width) / 2;
      const ridgeLength = (ridgeAlongX ? width : depth) + roofOverhang * 2;

      const kneeRun = runHalf * 0.56;
      const kneeY = roofRise * 0.68;

      // Lower steep slope
      const dx1 = runHalf - kneeRun;
      const dy1 = kneeY;
      const angle1 = Math.atan2(dy1, dx1);
      const len1 = Math.hypot(dx1, dy1) + roofOverhang / Math.cos(angle1) * 0.5 + 0.14;
      const midRun1 = (runHalf + kneeRun) / 2 + 0.04;
      const midY1 = eaveY + dy1 / 2 + 0.04;

      // Upper gentle slope
      const dx2 = kneeRun;
      const dy2 = roofRise - kneeY;
      const angle2 = Math.atan2(dy2, dx2);
      const len2 = Math.hypot(dx2, dy2) + 0.16;
      const midRun2 = kneeRun / 2;
      const midY2 = eaveY + kneeY + dy2 / 2 + 0.06;

      const lowerGeo = ctx.trackGeometry(
        ridgeAlongX
          ? new THREE.BoxGeometry(ridgeLength, slabThickness, len1)
          : new THREE.BoxGeometry(len1, slabThickness, ridgeLength),
      );
      const upperGeo = ctx.trackGeometry(
        ridgeAlongX
          ? new THREE.BoxGeometry(ridgeLength, slabThickness, len2)
          : new THREE.BoxGeometry(len2, slabThickness, ridgeLength),
      );

      const lA = new THREE.Mesh(lowerGeo, ctx.materials.roof);
      const lB = new THREE.Mesh(lowerGeo, ctx.materials.roof);
      const uA = new THREE.Mesh(upperGeo, ctx.materials.roof);
      const uB = new THREE.Mesh(upperGeo, ctx.materials.roof);

      if (ridgeAlongX) {
        lA.position.set(0, midY1, midRun1);
        lA.rotation.x = angle1;
        lB.position.set(0, midY1, -midRun1);
        lB.rotation.x = -angle1;
        uA.position.set(0, midY2, midRun2);
        uA.rotation.x = angle2;
        uB.position.set(0, midY2, -midRun2);
        uB.rotation.x = -angle2;
      } else {
        lA.position.set(midRun1, midY1, 0);
        lA.rotation.z = -angle1;
        lB.position.set(-midRun1, midY1, 0);
        lB.rotation.z = angle1;
        uA.position.set(midRun2, midY2, 0);
        uA.rotation.z = -angle2;
        uB.position.set(-midRun2, midY2, 0);
        uB.rotation.z = angle2;
      }

      for (const s of [lA, lB, uA, uB]) {
        s.castShadow = true;
        s.receiveShadow = true;
        group.add(s);
      }

      const ridgeCap = new THREE.Mesh(
        ctx.trackGeometry(
          ridgeAlongX
            ? new THREE.BoxGeometry(ridgeLength + 0.04, 0.14, 0.24)
            : new THREE.BoxGeometry(0.24, 0.14, ridgeLength + 0.04),
        ),
        ctx.materials.trim,
      );
      ridgeCap.position.set(0, eaveY + roofRise + 0.05, 0);
      group.add(ridgeCap);

      // Optional mansard dormer windows on front/back lower steep slopes
      if (hasDormers) {
        const dormerCount = ridgeLength > 8.5 ? 2 : 1;
        const span = ridgeLength - roofOverhang * 2 - 2.6;
        for (let i = 0; i < dormerCount; i++) {
          const offset =
            dormerCount === 1 ? 0 : -span / 2 + (i / (dormerCount - 1)) * span;
          const frontDormer = createDormerWindow(ctx);
          if (ridgeAlongX) {
            frontDormer.position.set(offset, eaveY + 0.34, runHalf * 0.78);
          } else {
            frontDormer.position.set(runHalf * 0.78, eaveY + 0.34, offset);
            frontDormer.rotation.y = Math.PI / 2;
          }
          group.add(frontDormer);
        }
      }
    } else {
      // Standard Gable roof
      const ridgeAlongX = width >= depth;
      const runHalf = (ridgeAlongX ? depth : width) / 2;
      const ridgeLength = (ridgeAlongX ? width : depth) + roofOverhang * 2;
      const slopeHalf = Math.hypot(runHalf, roofRise);
      const slopeAngle = Math.atan2(roofRise, runHalf);
      const overhangAlongSlope = roofOverhang / Math.cos(slopeAngle);
      const panelSlopeLen = slopeHalf + overhangAlongSlope + 0.06;

      const panelGeo = ctx.trackGeometry(
        ridgeAlongX
          ? new THREE.BoxGeometry(ridgeLength, slabThickness, panelSlopeLen)
          : new THREE.BoxGeometry(panelSlopeLen, slabThickness, ridgeLength),
      );

      const midRun = (runHalf + roofOverhang) / 2 - roofOverhang * 0.18;
      const midY = eaveY + roofRise / 2 + slabThickness * 0.45 - Math.tan(slopeAngle) * (roofOverhang * 0.18);

      const slopeA = new THREE.Mesh(panelGeo, ctx.materials.roof);
      slopeA.name = 'GableSlopeA';
      const slopeB = new THREE.Mesh(panelGeo, ctx.materials.roof);
      slopeB.name = 'GableSlopeB';

      if (ridgeAlongX) {
        slopeA.position.set(0, midY, midRun);
        slopeA.rotation.x = slopeAngle;
        slopeB.position.set(0, midY, -midRun);
        slopeB.rotation.x = -slopeAngle;
      } else {
        slopeA.position.set(midRun, midY, 0);
        slopeA.rotation.z = -slopeAngle;
        slopeB.position.set(-midRun, midY, 0);
        slopeB.rotation.z = slopeAngle;
      }

      slopeA.castShadow = true;
      slopeA.receiveShadow = true;
      slopeB.castShadow = true;
      slopeB.receiveShadow = true;
      group.add(slopeA, slopeB);

      const ridgeCapGeo = ctx.trackGeometry(
        ridgeAlongX
          ? new THREE.BoxGeometry(ridgeLength + 0.04, 0.1, 0.18)
          : new THREE.BoxGeometry(0.18, 0.1, ridgeLength + 0.04),
      );
      const ridgeCap = new THREE.Mesh(ridgeCapGeo, ctx.materials.trim);
      ridgeCap.name = 'GableRidgeCap';
      ridgeCap.position.set(0, eaveY + roofRise + slabThickness * 0.6, 0);
      ridgeCap.castShadow = true;
      group.add(ridgeCap);

      // Exposed timber purlin beams under alpine chalet eaves
      if (styleDef.hasExposedRafters) {
        const purlinLen = ridgeLength + 0.16;
        const purlinGeo = ctx.trackGeometry(
          ridgeAlongX
            ? new THREE.BoxGeometry(purlinLen, 0.16, 0.16)
            : new THREE.BoxGeometry(0.16, 0.16, purlinLen),
        );
        const offsets = [0.0, 0.52, 0.94];
        offsets.forEach((frac, idx) => {
          const py = eaveY + roofRise * frac - 0.08;
          const runOff = runHalf * (1 - frac);
          if (idx === 0) {
            const pA = new THREE.Mesh(purlinGeo, ctx.materials.timberAccent);
            const pB = new THREE.Mesh(purlinGeo, ctx.materials.timberAccent);
            if (ridgeAlongX) {
              pA.position.set(0, py, runHalf);
              pB.position.set(0, py, -runHalf);
            } else {
              pA.position.set(runHalf, py, 0);
              pB.position.set(-runHalf, py, 0);
            }
            group.add(pA, pB);
          } else {
            const pA = new THREE.Mesh(purlinGeo, ctx.materials.timberAccent);
            const pB = new THREE.Mesh(purlinGeo, ctx.materials.timberAccent);
            if (ridgeAlongX) {
              pA.position.set(0, py, runOff);
              pB.position.set(0, py, -runOff);
            } else {
              pA.position.set(runOff, py, 0);
              pB.position.set(-runOff, py, 0);
            }
            group.add(pA, pB);
          }
        });
      }
    }

    // Optional architectural chimney stack
    if (hasChimney) {
      const chimneyGroup = new THREE.Group();
      chimneyGroup.name = 'Chimney';
      const chW = 0.62;
      const chD = 0.62;
      const chBaseY = eaveY + roofRise * 0.45;
      const chTopY = eaveY + roofRise + 0.95;
      const chH = Math.max(1.1, chTopY - chBaseY);

      const shaftGeo = ctx.trackGeometry(new THREE.BoxGeometry(chW, chH, chD));
      const shaftMesh = new THREE.Mesh(shaftGeo, ctx.materials.chimney);
      shaftMesh.position.set(0, chH / 2, 0);
      shaftMesh.castShadow = true;
      shaftMesh.receiveShadow = true;

      const capGeo = ctx.trackGeometry(new THREE.BoxGeometry(chW + 0.14, 0.1, chD + 0.14));
      const capMesh = new THREE.Mesh(capGeo, ctx.materials.trim);
      capMesh.position.set(0, chH + 0.05, 0);
      capMesh.castShadow = true;

      const flueGeo = ctx.trackGeometry(new THREE.CylinderGeometry(0.11, 0.12, 0.24, 16));
      const flueMesh = new THREE.Mesh(flueGeo, ctx.materials.metalAccent);
      flueMesh.position.set(0, chH + 0.2, 0);
      flueMesh.castShadow = true;

      chimneyGroup.add(shaftMesh, capMesh, flueMesh);
      chimneyGroup.position.set(width * 0.22, chBaseY, -depth * 0.16);
      group.add(chimneyGroup);
    }

    return group;
  },
};
