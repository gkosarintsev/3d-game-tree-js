import * as THREE from 'three';
import { computeRoofRiseMeters } from '../../core/houseMetrics';
import { STYLES_REGISTRY } from '../../core/registries/stylesRegistry';
import type { HouseConfig } from '../../types/house';
import type { HouseBuildContext, HousePartBuilder } from './types';

function createGableTriangleGeometry(spanWidth: number, riseHeight: number, thickness: number): THREE.BufferGeometry {
  const half = spanWidth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  shape.lineTo(0, riseHeight);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.computeVertexNormals();
  return geo;
}

function createMansardGableGeometry(spanWidth: number, riseHeight: number, thickness: number): THREE.BufferGeometry {
  const half = spanWidth / 2;
  const kneeX = half * 0.56;
  const kneeY = riseHeight * 0.68;

  const shape = new THREE.Shape();
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  shape.lineTo(kneeX, kneeY);
  shape.lineTo(0, riseHeight);
  shape.lineTo(-kneeX, kneeY);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -thickness / 2);
  geo.computeVertexNormals();
  return geo;
}

function createShedWallWedgeGeometry(depth: number, riseHeight: number, width: number): THREE.BufferGeometry {
  const halfD = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-halfD, 0);
  shape.lineTo(halfD, 0);
  shape.lineTo(-halfD, riseHeight);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -width / 2);
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds the primary wall shell (including two-tone alpine chalet upper timber walls),
 * A-frame triangular body, gable/mansard/shed upper walls, belt course, and corner pilasters.
 */
export const wallsBuilder: HousePartBuilder = {
  id: 'walls',
  build(config: HouseConfig, ctx: HouseBuildContext): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Walls';

    const styleDef = STYLES_REGISTRY[config.styleId] ?? STYLES_REGISTRY['classic-cottage'];
    const { width, depth, floorHeight, floors, foundationHeight } = config.dimensions;
    const baseY = foundationHeight;
    const roofRise = computeRoofRiseMeters(config);
    const roofType = config.features.roofType;

    if (roofType === 'aframe') {
      // Low perimeter knee-wall + tall triangular A-frame body
      const kneeH = 0.45;
      const kneeGeo = ctx.trackGeometry(new THREE.BoxGeometry(width, kneeH, depth));
      const kneeWall = new THREE.Mesh(kneeGeo, ctx.materials.foundation);
      kneeWall.name = 'AFrameKneeWall';
      kneeWall.position.set(0, baseY + kneeH / 2, 0);
      kneeWall.castShadow = true;
      kneeWall.receiveShadow = true;
      group.add(kneeWall);

      const prismGeo = ctx.trackGeometry(createGableTriangleGeometry(width, roofRise, depth));
      const prismMesh = new THREE.Mesh(prismGeo, ctx.materials.wall);
      prismMesh.name = 'AFrameGableBody';
      prismMesh.position.set(0, baseY + kneeH, 0);
      prismMesh.castShadow = true;
      prismMesh.receiveShadow = true;
      group.add(prismMesh);
      return group;
    }

    const totalWallH = floorHeight * floors;
    const useTwoToneTimber = styleDef.hasTwoToneTimberUpper && floors === 2;

    if (useTwoToneTimber) {
      // Ground floor in primary wall material, 2nd floor in warm timber cladding
      const lowerGeo = ctx.trackGeometry(new THREE.BoxGeometry(width, floorHeight, depth));
      const lowerWall = new THREE.Mesh(lowerGeo, ctx.materials.wall);
      lowerWall.name = 'LowerWalls';
      lowerWall.position.set(0, baseY + floorHeight / 2, 0);
      lowerWall.castShadow = true;
      lowerWall.receiveShadow = true;

      const upperGeo = ctx.trackGeometry(
        new THREE.BoxGeometry(width, floorHeight, depth),
      );
      const upperWall = new THREE.Mesh(upperGeo, ctx.materials.timberAccent);
      upperWall.name = 'UpperTimberWalls';
      upperWall.position.set(0, baseY + floorHeight * 1.5, 0);
      upperWall.castShadow = true;
      upperWall.receiveShadow = true;

      group.add(lowerWall, upperWall);
    } else {
      const mainWallGeo = ctx.trackGeometry(new THREE.BoxGeometry(width, totalWallH, depth));
      const mainWall = new THREE.Mesh(mainWallGeo, ctx.materials.wall);
      mainWall.name = 'MainWalls';
      mainWall.position.set(0, baseY + totalWallH / 2, 0);
      mainWall.castShadow = true;
      mainWall.receiveShadow = true;
      group.add(mainWall);
    }

    const upperMaterial = useTwoToneTimber ? ctx.materials.timberAccent : ctx.materials.wall;

    // Upper gable / mansard / shed wall extensions
    if (roofType === 'gable') {
      const ridgeAlongX = width >= depth;
      if (ridgeAlongX) {
        const gableGeo = ctx.trackGeometry(createGableTriangleGeometry(depth, roofRise, width));
        const gableMesh = new THREE.Mesh(gableGeo, upperMaterial);
        gableMesh.name = 'GableWalls';
        gableMesh.rotation.y = Math.PI / 2;
        gableMesh.position.set(0, baseY + totalWallH, 0);
        gableMesh.castShadow = true;
        gableMesh.receiveShadow = true;
        group.add(gableMesh);
      } else {
        const gableGeo = ctx.trackGeometry(createGableTriangleGeometry(width, roofRise, depth));
        const gableMesh = new THREE.Mesh(gableGeo, upperMaterial);
        gableMesh.name = 'GableWalls';
        gableMesh.position.set(0, baseY + totalWallH, 0);
        gableMesh.castShadow = true;
        gableMesh.receiveShadow = true;
        group.add(gableMesh);
      }
    } else if (roofType === 'mansard') {
      const ridgeAlongX = width >= depth;
      if (ridgeAlongX) {
        const gableGeo = ctx.trackGeometry(createMansardGableGeometry(depth, roofRise, width));
        const gableMesh = new THREE.Mesh(gableGeo, upperMaterial);
        gableMesh.name = 'MansardGableWalls';
        gableMesh.rotation.y = Math.PI / 2;
        gableMesh.position.set(0, baseY + totalWallH, 0);
        gableMesh.castShadow = true;
        gableMesh.receiveShadow = true;
        group.add(gableMesh);
      } else {
        const gableGeo = ctx.trackGeometry(createMansardGableGeometry(width, roofRise, depth));
        const gableMesh = new THREE.Mesh(gableGeo, upperMaterial);
        gableMesh.name = 'MansardGableWalls';
        gableMesh.position.set(0, baseY + totalWallH, 0);
        gableMesh.castShadow = true;
        gableMesh.receiveShadow = true;
        group.add(gableMesh);
      }
    } else if (roofType === 'shed') {
      const wedgeGeo = ctx.trackGeometry(createShedWallWedgeGeometry(depth, roofRise, width));
      const wedgeMesh = new THREE.Mesh(wedgeGeo, upperMaterial);
      wedgeMesh.name = 'ShedUpperWall';
      wedgeMesh.position.set(0, baseY + totalWallH, 0);
      wedgeMesh.castShadow = true;
      wedgeMesh.receiveShadow = true;
      group.add(wedgeMesh);
    }

    // Inter-story horizontal cornice band for 2-story houses
    if (floors === 2) {
      const bandH = 0.12;
      const bandGeo = ctx.trackGeometry(new THREE.BoxGeometry(width + 0.1, bandH, depth + 0.1));
      const bandMesh = new THREE.Mesh(bandGeo, ctx.materials.trim);
      bandMesh.name = 'FloorBeltCourse';
      bandMesh.position.set(0, baseY + floorHeight, 0);
      bandMesh.castShadow = true;
      bandMesh.receiveShadow = true;
      group.add(bandMesh);
    }

    // Optional corner architectural pilasters / edge reveals
    if (config.features.hasCornerAccents) {
      const pilasterW = 0.22;
      const pilasterGeo = ctx.trackGeometry(
        new THREE.BoxGeometry(pilasterW, totalWallH + 0.02, pilasterW),
      );
      const corners: Array<[number, number]> = [
        [-width / 2 + pilasterW * 0.35, -depth / 2 + pilasterW * 0.35],
        [width / 2 - pilasterW * 0.35, -depth / 2 + pilasterW * 0.35],
        [-width / 2 + pilasterW * 0.35, depth / 2 - pilasterW * 0.35],
        [width / 2 - pilasterW * 0.35, depth / 2 - pilasterW * 0.35],
      ];
      corners.forEach(([cx, cz], idx) => {
        const pilaster = new THREE.Mesh(pilasterGeo, ctx.materials.trim);
        pilaster.name = `CornerPilaster_${idx + 1}`;
        pilaster.position.set(cx, baseY + totalWallH / 2, cz);
        pilaster.castShadow = true;
        pilaster.receiveShadow = true;
        group.add(pilaster);
      });
    }

    return group;
  },
};
