import * as THREE from 'three';
import {
  ROOF_MATERIALS_REGISTRY,
  TRIM_FINISHES_REGISTRY,
  WALL_MATERIALS_REGISTRY,
} from '../../core/registries/materialsRegistry';
import type { HouseConfig } from '../../types/house';
import type { ProceduralTextureLibrary } from '../textures/proceduralTextures';
import { foundationBuilder } from './foundationBuilder';
import { openingsBuilder } from './openingsBuilder';
import { roofBuilder } from './roofBuilder';
import { buildMegabuilding } from './megabuildingBuilder';
import { buildOfficeBuilding } from './officeBuildingBuilder';
import { buildSkyscraperBuilding } from './skyscraperBuilder';
import { buildSlumShack } from './slumShackBuilder';
import { buildSovietPanelBuilding } from './sovietPanelBuilder';
import type { HouseBuildContext, HouseMaterialSet, HousePartBuilder } from './types';
import { wallsBuilder } from './wallsBuilder';

/**
 * Ordered pipeline of house part builders for single-family houses.
 */
const HOUSE_PART_BUILDERS: HousePartBuilder[] = [
  foundationBuilder,
  wallsBuilder,
  roofBuilder,
  openingsBuilder,
];

export interface AssembledHouseResult {
  group: THREE.Group;
  dispose: () => void;
}

function createHouseMaterials(
  config: HouseConfig,
  textures: ProceduralTextureLibrary,
  isSoftwareGl: boolean,
): { materials: HouseMaterialSet; disposeMaterials: () => void } {
  const wallSpec = WALL_MATERIALS_REGISTRY[config.materials.wallMaterial];
  const roofSpec = ROOF_MATERIALS_REGISTRY[config.materials.roofMaterial];
  const trimSpec = TRIM_FINISHES_REGISTRY[config.materials.trimFinish];

  const wallTex = textures.getTexturePair(wallSpec.recipe, wallSpec.repeatScale);
  const roofTex = textures.getTexturePair(roofSpec.recipe, roofSpec.repeatScale);

  const wall = new THREE.MeshStandardMaterial({
    name: `Wall_${wallSpec.id}`,
    color: new THREE.Color(config.materials.wallColor),
    map: wallTex.map,
    bumpMap: wallTex.bumpMap,
    bumpScale: wallSpec.bumpScale,
    roughness: wallSpec.roughness,
    metalness: wallSpec.metalness,
  });

  const roof = new THREE.MeshStandardMaterial({
    name: `Roof_${roofSpec.id}`,
    color: new THREE.Color(config.materials.roofColor),
    map: roofTex.map,
    bumpMap: roofTex.bumpMap,
    bumpScale: roofSpec.bumpScale,
    roughness: roofSpec.roughness,
    metalness: roofSpec.metalness,
  });

  const trim = new THREE.MeshStandardMaterial({
    name: `Trim_${trimSpec.id}`,
    color: new THREE.Color(trimSpec.color),
    roughness: trimSpec.roughness,
    metalness: trimSpec.metalness,
  });

  const door = new THREE.MeshStandardMaterial({
    name: 'DoorLeaf',
    color: new THREE.Color(
      config.styleId === 'soviet-panel'
        ? '#2c4a3e'
        : config.styleId === 'office-building'
          ? '#26303d'
          : config.styleId === 'skyscraper'
            ? '#334155'
            : config.styleId === 'megabuilding'
              ? '#242933'
              : config.styleId === 'slum-shack'
                ? '#5e4332'
                : trimSpec.doorColor,
    ),
    roughness: 0.45,
    metalness:
      config.styleId === 'soviet-panel' ||
      config.styleId === 'office-building' ||
      config.styleId === 'skyscraper' ||
      config.styleId === 'megabuilding'
        ? 0.45
        : 0.08,
  });

  const foundation = new THREE.MeshStandardMaterial({
    name: 'FoundationConcrete',
    color: new THREE.Color(config.styleId === 'megabuilding' ? '#3a414d' : '#6b7280'),
    roughness: 0.88,
    metalness: config.styleId === 'megabuilding' ? 0.14 : 0.04,
  });

  const stoneStep = new THREE.MeshStandardMaterial({
    name: 'StoneCap',
    color: new THREE.Color(config.styleId === 'megabuilding' ? '#4d5563' : '#9ca3af'),
    roughness: 0.78,
    metalness: config.styleId === 'megabuilding' ? 0.12 : 0.05,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    name: 'ArchitecturalGlass',
    color: new THREE.Color(
      config.styleId === 'megabuilding'
        ? '#457b9d'
        : config.styleId === 'office-building'
          ? '#87bce0'
          : config.styleId === 'skyscraper'
            ? '#7eb2d6'
            : '#9fc5e0',
    ),
    roughness: 0.06,
    metalness:
      config.styleId === 'skyscraper' ||
      config.styleId === 'megabuilding' ||
      config.styleId === 'office-building'
        ? 0.26
        : 0.16,
    ior: 1.52,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: isSoftwareGl
      ? config.styleId === 'skyscraper' ||
        config.styleId === 'megabuilding' ||
        config.styleId === 'office-building'
        ? 0.66
        : 0.58
      : 0.72,
    transmission: isSoftwareGl ? 0 : 0.25,
    envMapIntensity: 1.45,
  });

  const glassBacking = new THREE.MeshStandardMaterial({
    name: 'InteriorWindowBacking',
    color: new THREE.Color('#1a2634'),
    roughness: 0.9,
    metalness: 0.04,
  });

  const metalAccent = new THREE.MeshStandardMaterial({
    name: 'BrushedSteelAccent',
    color: new THREE.Color('#cbd5e1'),
    roughness: 0.22,
    metalness: 0.88,
  });

  const timberTex = textures.getTexturePair('timber', 1.2);
  const timberAccent = new THREE.MeshStandardMaterial({
    name: 'ArchitecturalTimberAccent',
    color: new THREE.Color('#9a6a42'),
    map: timberTex.map,
    bumpMap: timberTex.bumpMap,
    bumpScale: 0.025,
    roughness: 0.7,
    metalness: 0.04,
  });

  const chimneyTex = textures.getTexturePair('brick', 1.4);
  const chimney = new THREE.MeshStandardMaterial({
    name: 'ChimneyMasonry',
    color: new THREE.Color('#7a5347'),
    map: chimneyTex.map,
    bumpMap: chimneyTex.bumpMap,
    bumpScale: 0.03,
    roughness: 0.86,
    metalness: 0.03,
  });

  const materials: HouseMaterialSet = {
    wall,
    roof,
    trim,
    door,
    foundation,
    stoneStep,
    glass,
    glassBacking,
    metalAccent,
    timberAccent,
    chimney,
  };

  const disposeMaterials = () => {
    for (const mat of Object.values(materials)) {
      mat.dispose();
    }
  };

  return { materials, disposeMaterials };
}

export function assembleHouseModel(
  config: HouseConfig,
  textures: ProceduralTextureLibrary,
  isSoftwareGl: boolean,
): AssembledHouseResult {
  const houseGroup = new THREE.Group();
  houseGroup.name = 'HouseModel';

  const geometries: THREE.BufferGeometry[] = [];
  const extraDisposables: Array<{ dispose: () => void }> = [];
  const { materials, disposeMaterials } = createHouseMaterials(config, textures, isSoftwareGl);

  const ctx: HouseBuildContext = {
    materials,
    textures,
    isSoftwareGl,
    trackGeometry: <T extends THREE.BufferGeometry>(geo: T): T => {
      geometries.push(geo);
      return geo;
    },
    trackDisposable: (resource: { dispose: () => void }) => {
      extraDisposables.push(resource);
    },
  };

  if (config.styleId === 'soviet-panel') {
    houseGroup.add(buildSovietPanelBuilding(config, ctx));
  } else if (config.styleId === 'office-building') {
    houseGroup.add(buildOfficeBuilding(config, ctx));
  } else if (config.styleId === 'skyscraper') {
    houseGroup.add(buildSkyscraperBuilding(config, ctx));
  } else if (config.styleId === 'megabuilding') {
    houseGroup.add(buildMegabuilding(config, ctx));
  } else if (config.styleId === 'slum-shack') {
    houseGroup.add(buildSlumShack(config, ctx));
  } else {
    for (const builder of HOUSE_PART_BUILDERS) {
      const partGroup = builder.build(config, ctx);
      houseGroup.add(partGroup);
    }
  }

  const dispose = () => {
    for (const geo of geometries) {
      geo.dispose();
    }
    for (const res of extraDisposables) {
      res.dispose();
    }
    disposeMaterials();
  };

  return { group: houseGroup, dispose };
}
