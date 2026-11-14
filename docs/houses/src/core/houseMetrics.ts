import {
  HOUSE_CONSTRAINTS,
  MEGABUILDING_CONSTRAINTS,
  OFFICE_CONSTRAINTS,
  SKYSCRAPER_CONSTRAINTS,
  SLUM_SHACK_CONSTRAINTS,
  SOVIET_PANEL_CONSTRAINTS,
  type ArchitecturalStyleId,
  type ComputedHouseMetrics,
  type HouseConfig,
} from '../types/house';
import { STYLES_REGISTRY } from './registries/stylesRegistry';

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getDimensionsConstraints(styleId: ArchitecturalStyleId) {
  if (styleId === 'soviet-panel') return SOVIET_PANEL_CONSTRAINTS;
  if (styleId === 'office-building') return OFFICE_CONSTRAINTS;
  if (styleId === 'skyscraper') return SKYSCRAPER_CONSTRAINTS;
  if (styleId === 'megabuilding') return MEGABUILDING_CONSTRAINTS;
  if (styleId === 'slum-shack') return SLUM_SHACK_CONSTRAINTS;
  return HOUSE_CONSTRAINTS;
}

export function cloneHouseConfig(config: HouseConfig): HouseConfig {
  return {
    styleId: config.styleId,
    dimensions: { ...config.dimensions },
    materials: { ...config.materials },
    features: { ...config.features },
  };
}

export function createDefaultConfigForStyle(styleId: ArchitecturalStyleId): HouseConfig {
  const def = STYLES_REGISTRY[styleId] ?? STYLES_REGISTRY['classic-cottage'];
  return cloneHouseConfig(def.defaultConfig);
}

export function clampHouseConfig(config: HouseConfig): HouseConfig {
  const styleDef = STYLES_REGISTRY[config.styleId] ?? STYLES_REGISTRY['classic-cottage'];
  const c = getDimensionsConstraints(styleDef.id);
  const roofType = styleDef.supportedRoofTypes.includes(config.features.roofType)
    ? config.features.roofType
    : styleDef.supportedRoofTypes[0];

  const rawEntrances = config.dimensions.entrances ?? styleDef.defaultConfig.dimensions.entrances ?? 1;

  return {
    styleId: styleDef.id,
    dimensions: {
      width: roundTo(clamp(config.dimensions.width, c.width.min, c.width.max), 2),
      depth: roundTo(clamp(config.dimensions.depth, c.depth.min, c.depth.max), 2),
      floorHeight: roundTo(clamp(config.dimensions.floorHeight, c.floorHeight.min, c.floorHeight.max), 2),
      floors: Math.round(clamp(config.dimensions.floors, c.floors.min, c.floors.max)),
      entrances: Math.round(clamp(rawEntrances, c.entrances.min, c.entrances.max)),
      foundationHeight: roundTo(
        clamp(config.dimensions.foundationHeight, c.foundationHeight.min, c.foundationHeight.max),
        2,
      ),
      roofPitchDeg: Math.round(clamp(config.dimensions.roofPitchDeg, c.roofPitchDeg.min, c.roofPitchDeg.max)),
      roofOverhang: roundTo(clamp(config.dimensions.roofOverhang, c.roofOverhang.min, c.roofOverhang.max), 2),
    },
    materials: { ...config.materials },
    features: {
      roofType,
      windowDensity: Math.round(
        clamp(config.features.windowDensity, c.windowDensity.min, c.windowDensity.max),
      ),
      windowScale: roundTo(clamp(config.features.windowScale, c.windowScale.min, c.windowScale.max), 2),
      hasPorch: Boolean(config.features.hasPorch),
      hasChimney: Boolean(config.features.hasChimney),
      hasCornerAccents: Boolean(config.features.hasCornerAccents),
      hasBalcony: Boolean(config.features.hasBalcony),
      hasDormers: Boolean(config.features.hasDormers),
    },
  };
}

export function computeRoofRiseMeters(config: HouseConfig): number {
  const { width, depth, roofPitchDeg, floors, floorHeight } = config.dimensions;
  const { roofType, hasChimney } = config.features;

  if (config.styleId === 'soviet-panel') {
    return 0.55; // Parapet wall above roof deck
  }

  if (config.styleId === 'office-building') {
    const rad = (roofPitchDeg * Math.PI) / 180;
    const crownRise =
      roofType === 'shed'
        ? Math.max(2.2, Math.tan(rad) * (depth * 0.35))
        : roofType === 'stepped'
          ? 1.4
          : 0.9;
    const penthouseRise = hasChimney ? 1.8 : 0;
    return roundTo(crownRise + penthouseRise, 2);
  }

  if (config.styleId === 'slum-shack') {
    const rad = (roofPitchDeg * Math.PI) / 180;
    const roofBase =
      roofType === 'shed'
        ? roundTo(Math.tan(rad) * depth * 0.52, 2)
        : roofType === 'stepped'
          ? roundTo(floorHeight * 0.85, 2)
          : 0.45;
    const tankH = hasChimney ? 1.35 : 0;
    return roundTo(roofBase + tankH, 2);
  }

  if (config.styleId === 'skyscraper') {
    const towerH = floors * floorHeight;
    const crownParapet = roofType === 'shed'
      ? Math.max(3.6, Math.tan((roofPitchDeg * Math.PI) / 180) * (depth * 0.48))
      : roofType === 'stepped'
        ? 4.2
        : 2.2;
    const spireH = hasChimney ? roundTo(Math.max(10, towerH * 0.16), 2) : 0;
    return roundTo(crownParapet + spireH, 2);
  }

  if (config.styleId === 'megabuilding') {
    const towerH = floors * floorHeight;
    const crownRise = roofType === 'shed'
      ? Math.max(4.5, Math.tan((roofPitchDeg * Math.PI) / 180) * (depth * 0.42))
      : roofType === 'stepped'
        ? 6.5
        : 3.2;
    const relayMastH = hasChimney ? roundTo(Math.max(12, towerH * 0.16), 2) : 0;
    return roundTo(crownRise + relayMastH, 2);
  }

  if (roofType === 'flat') {
    return 0.35; // Parapet height
  }

  const rad = (roofPitchDeg * Math.PI) / 180;
  if (roofType === 'shed') {
    return roundTo(Math.tan(rad) * depth * 0.55, 2);
  }

  if (roofType === 'aframe') {
    // Steep A-frame spans full width from low knee-wall up to ridge
    const effectivePitch = Math.max(48, roofPitchDeg);
    return roundTo(Math.tan((effectivePitch * Math.PI) / 180) * (width / 2), 2);
  }

  if (roofType === 'mansard') {
    // Two-tier gambrel/mansard attic rise proportional to span and pitch
    const span = Math.min(width, depth);
    return roundTo(Math.max(2.4, Math.tan(rad) * (span / 2) * 1.15), 2);
  }

  // Gable & Hip span across the shorter horizontal axis
  const span = Math.min(width, depth);
  return roundTo(Math.tan(rad) * (span / 2), 2);
}

export function computeHouseMetrics(rawConfig: HouseConfig): ComputedHouseMetrics {
  const config = clampHouseConfig(rawConfig);
  const { width, depth, floorHeight, floors, foundationHeight } = config.dimensions;
  const entrances = config.dimensions.entrances ?? 1;
  const totalWidthM = roundTo(width * entrances, 1);

  const footprintAreaM2 = roundTo(totalWidthM * depth, 1);
  const isMansardAttic = config.features.roofType === 'mansard';
  const isAFrame = config.features.roofType === 'aframe';
  const isSteppedTower = config.styleId === 'skyscraper' && config.features.roofType === 'stepped';
  const isSteppedOffice =
    config.styleId === 'office-building' && config.features.roofType === 'stepped';
  const isSteppedSlum =
    config.styleId === 'slum-shack' && config.features.roofType === 'stepped';
  const isMegabuilding = config.styleId === 'megabuilding';
  const megaFillFactor = config.features.roofType === 'stepped' ? 0.76 : 0.82;
  const effectiveFloors = isMansardAttic
    ? floors + 0.75
    : isAFrame
      ? 1.5
      : isSteppedTower
        ? floors * 0.84
        : isSteppedOffice
          ? floors * 0.88
          : isSteppedSlum
            ? floors + 0.45
            : isMegabuilding
              ? floors * megaFillFactor
              : floors;
  const grossFloorAreaM2 = roundTo(footprintAreaM2 * effectiveFloors, 1);
  const wallHeightTotalM = isAFrame ? 0.45 : roundTo(floorHeight * floors, 2);
  const roofRiseM = computeRoofRiseMeters(config);
  const totalRidgeHeightM = roundTo(foundationHeight + wallHeightTotalM + roofRiseM, 2);

  // Volume includes main box + roof approximation
  const roofVolumeFactor =
    config.features.roofType === 'flat'
      ? 0.25
      : config.features.roofType === 'hip'
        ? 0.38
        : config.features.roofType === 'mansard'
          ? 0.72
          : config.styleId === 'skyscraper' ||
              config.styleId === 'office-building' ||
              isMegabuilding
            ? 0.22
            : 0.5;
  const wallFillFactor = isSteppedTower
    ? 0.84
    : isSteppedOffice
      ? 0.88
      : isMegabuilding
        ? megaFillFactor
        : 1;
  const estimatedVolumeM3 = roundTo(
    footprintAreaM2 * (wallHeightTotalM * wallFillFactor + roofRiseM * roofVolumeFactor),
    1,
  );

  return {
    totalWidthM,
    entrances,
    footprintAreaM2,
    grossFloorAreaM2,
    wallHeightTotalM,
    roofRiseM,
    totalRidgeHeightM,
    estimatedVolumeM3,
  };
}

export interface ProjectNameValidationResult {
  valid: boolean;
  trimmedName: string;
  error?: string;
}

export function validateProjectName(name: string): ProjectNameValidationResult {
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return {
      valid: false,
      trimmedName,
      error: 'Введите название проекта перед сохранением.',
    };
  }
  if (trimmedName.length < 2) {
    return {
      valid: false,
      trimmedName,
      error: 'Название должно содержать минимум 2 символа.',
    };
  }
  if (trimmedName.length > 60) {
    return {
      valid: false,
      trimmedName,
      error: 'Название не должно превышать 60 символов.',
    };
  }
  return { valid: true, trimmedName };
}
