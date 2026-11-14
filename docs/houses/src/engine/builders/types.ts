import * as THREE from 'three';
import type { HouseConfig } from '../../types/house';
import type { ProceduralTextureLibrary } from '../textures/proceduralTextures';

export interface HouseMaterialSet {
  wall: THREE.MeshStandardMaterial;
  roof: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  door: THREE.MeshStandardMaterial;
  foundation: THREE.MeshStandardMaterial;
  stoneStep: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  glassBacking: THREE.MeshStandardMaterial;
  metalAccent: THREE.MeshStandardMaterial;
  timberAccent: THREE.MeshStandardMaterial;
  chimney: THREE.MeshStandardMaterial;
}

export interface HouseBuildContext {
  materials: HouseMaterialSet;
  textures: ProceduralTextureLibrary;
  isSoftwareGl: boolean;
  trackGeometry: <T extends THREE.BufferGeometry>(geo: T) => T;
  trackDisposable: (resource: { dispose: () => void }) => void;
}

export interface HousePartBuilder {
  readonly id: string;
  build(config: HouseConfig, ctx: HouseBuildContext): THREE.Group;
}
