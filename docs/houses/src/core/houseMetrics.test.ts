import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clampHouseConfig,
  computeHouseMetrics,
  createDefaultConfigForStyle,
  validateProjectName,
} from './houseMetrics';

test('computeHouseMetrics calculates accurate footprint, gross floor area, and ridge height', () => {
  const config = createDefaultConfigForStyle('classic-cottage');
  config.dimensions.width = 10;
  config.dimensions.depth = 8;
  config.dimensions.floors = 2;
  config.dimensions.floorHeight = 3;
  config.dimensions.foundationHeight = 0.5;
  config.dimensions.roofPitchDeg = 45;
  config.features.roofType = 'gable';

  const metrics = computeHouseMetrics(config);
  assert.equal(metrics.footprintAreaM2, 80);
  assert.equal(metrics.grossFloorAreaM2, 160);
  assert.equal(metrics.wallHeightTotalM, 6);
  // tan(45deg) * (8 / 2) = 4.0m
  assert.equal(metrics.roofRiseM, 4);
  assert.equal(metrics.totalRidgeHeightM, 10.5);
});

test('clampHouseConfig enforces parameter bounds and supported roof types', () => {
  const config = createDefaultConfigForStyle('modern-pavilion');
  config.dimensions.width = 100;
  config.dimensions.depth = 1;
  config.dimensions.floors = 10;
  // classic 'hip' is unsupported for modern-pavilion
  config.features.roofType = 'hip';

  const clamped = clampHouseConfig(config);
  assert.equal(clamped.dimensions.width, 16);
  assert.equal(clamped.dimensions.depth, 4.5);
  assert.equal(clamped.dimensions.floors, 2);
  assert.equal(clamped.features.roofType, 'flat');
});

test('validateProjectName rejects empty or short names and trims valid names', () => {
  const emptyResult = validateProjectName('   ');
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.error);

  const shortResult = validateProjectName('А');
  assert.equal(shortResult.valid, false);

  const validResult = validateProjectName('  Мой коттедж  ');
  assert.equal(validResult.valid, true);
  assert.equal(validResult.trimmedName, 'Мой коттедж');
});

test('computeHouseMetrics supports A-frame and Mansard house geometries', () => {
  const aframe = createDefaultConfigForStyle('a-frame');
  const aframeMetrics = computeHouseMetrics(aframe);
  assert.equal(aframeMetrics.wallHeightTotalM, 0.45);
  assert.ok(aframeMetrics.roofRiseM > 5.0);
  assert.ok(aframeMetrics.grossFloorAreaM2 > aframeMetrics.footprintAreaM2);

  const mansard = createDefaultConfigForStyle('mansard-house');
  const mansardMetrics = computeHouseMetrics(mansard);
  assert.ok(mansardMetrics.roofRiseM >= 2.4);
  assert.ok(mansardMetrics.grossFloorAreaM2 > mansardMetrics.footprintAreaM2);
});

test('computeHouseMetrics and clampHouseConfig support multi-story multi-entrance soviet-panel buildings', () => {
  const panel = createDefaultConfigForStyle('soviet-panel');
  panel.dimensions.width = 14.0;
  panel.dimensions.depth = 12.0;
  panel.dimensions.floors = 12;
  panel.dimensions.entrances = 4;
  panel.dimensions.floorHeight = 2.8;
  panel.dimensions.foundationHeight = 0.9;

  const clamped = clampHouseConfig(panel);
  assert.equal(clamped.dimensions.floors, 12);
  assert.equal(clamped.dimensions.entrances, 4);

  const metrics = computeHouseMetrics(clamped);
  assert.equal(metrics.entrances, 4);
  assert.equal(metrics.totalWidthM, 56);
  assert.equal(metrics.footprintAreaM2, 672);
  assert.equal(metrics.grossFloorAreaM2, 8064);
  assert.equal(metrics.wallHeightTotalM, 33.6);
  assert.equal(metrics.totalRidgeHeightM, 35.05);

  // Verify out-of-range floors/entrances clamp cleanly to [3..16] and [1..6]
  panel.dimensions.floors = 99;
  panel.dimensions.entrances = 12;
  const maxClamped = clampHouseConfig(panel);
  assert.equal(maxClamped.dimensions.floors, 16);
  assert.equal(maxClamped.dimensions.entrances, 6);

  panel.dimensions.floors = 1;
  panel.dimensions.entrances = 0;
  const minClamped = clampHouseConfig(panel);
  assert.equal(minClamped.dimensions.floors, 3);
  assert.equal(minClamped.dimensions.entrances, 1);
});

test('computeHouseMetrics and clampHouseConfig support 12-60 story skyscrapers with stepped spire', () => {
  const tower = createDefaultConfigForStyle('skyscraper');
  tower.dimensions.width = 24;
  tower.dimensions.depth = 20;
  tower.dimensions.floors = 45;
  tower.dimensions.floorHeight = 3.6;
  tower.dimensions.foundationHeight = 1.2;
  tower.features.roofType = 'stepped';
  tower.features.hasChimney = true;

  const clamped = clampHouseConfig(tower);
  assert.equal(clamped.dimensions.floors, 45);
  assert.equal(clamped.dimensions.entrances, 1);
  assert.equal(clamped.features.roofType, 'stepped');

  const metrics = computeHouseMetrics(clamped);
  assert.equal(metrics.footprintAreaM2, 480);
  // 480 * (45 * 0.84) = 18144
  assert.equal(metrics.grossFloorAreaM2, 18144);
  assert.equal(metrics.wallHeightTotalM, 162);
  // Stepped crown (4.2) + spire (162 * 0.16 = 25.92) = 30.12
  assert.equal(metrics.roofRiseM, 30.12);
  assert.equal(metrics.totalRidgeHeightM, 193.32);

  // Verify out-of-range floors clamp cleanly to [12..60]
  tower.dimensions.floors = 4;
  assert.equal(clampHouseConfig(tower).dimensions.floors, 12);
  tower.dimensions.floors = 120;
  assert.equal(clampHouseConfig(tower).dimensions.floors, 60);
});

test('computeHouseMetrics and clampHouseConfig support Cyberpunk 2077 megabuilding constraints and massing', () => {
  const mega = createDefaultConfigForStyle('megabuilding');
  mega.dimensions.width = 40;
  mega.dimensions.depth = 34;
  mega.dimensions.floors = 42;
  mega.dimensions.floorHeight = 3.3;
  mega.dimensions.foundationHeight = 2.5;
  mega.features.roofType = 'stepped';
  mega.features.hasChimney = true;

  const clamped = clampHouseConfig(mega);
  assert.equal(clamped.dimensions.floors, 42);
  assert.equal(clamped.dimensions.width, 40);

  const metrics = computeHouseMetrics(clamped);
  assert.equal(metrics.footprintAreaM2, 1360);
  // 1360 * (42 * 0.76) = 43411.2
  assert.equal(metrics.grossFloorAreaM2, 43411.2);
  assert.equal(metrics.wallHeightTotalM, 138.6);
  // Stepped crown (6.5) + relay mast (138.6 * 0.16 = 22.18) = 28.68
  assert.equal(metrics.roofRiseM, 28.68);
  assert.equal(metrics.totalRidgeHeightM, 169.78);

  // Verify out-of-range floors/width clamp cleanly to [16..64] and [26..56]
  mega.dimensions.floors = 5;
  mega.dimensions.width = 10;
  const minClamped = clampHouseConfig(mega);
  assert.equal(minClamped.dimensions.floors, 16);
  assert.equal(minClamped.dimensions.width, 26);

  mega.dimensions.floors = 120;
  mega.dimensions.width = 90;
  const maxClamped = clampHouseConfig(mega);
  assert.equal(maxClamped.dimensions.floors, 64);
  assert.equal(maxClamped.dimensions.width, 56);
});

test('computeHouseMetrics and clampHouseConfig support corporate office-building constraints and roof options', () => {
  const office = createDefaultConfigForStyle('office-building');
  office.dimensions.width = 30;
  office.dimensions.depth = 18;
  office.dimensions.floors = 8;
  office.dimensions.floorHeight = 3.8;
  office.dimensions.foundationHeight = 0.7;
  office.features.roofType = 'flat';
  office.features.hasChimney = true;

  const clamped = clampHouseConfig(office);
  assert.equal(clamped.dimensions.floors, 8);
  assert.equal(clamped.dimensions.width, 30);

  const flatMetrics = computeHouseMetrics(clamped);
  assert.equal(flatMetrics.footprintAreaM2, 540);
  assert.equal(flatMetrics.grossFloorAreaM2, 4320);
  assert.equal(flatMetrics.wallHeightTotalM, 30.4);
  // flat crown (0.9) + rooftop mechanical penthouse (1.8) = 2.7
  assert.equal(flatMetrics.roofRiseM, 2.7);
  assert.equal(flatMetrics.totalRidgeHeightM, 33.8);

  // Stepped office terrace applies 0.88 floor fill factor
  office.features.roofType = 'stepped';
  const steppedMetrics = computeHouseMetrics(office);
  assert.equal(steppedMetrics.grossFloorAreaM2, 3801.6);

  // Verify out-of-range floors/width clamp cleanly to [3..18] and [18..46]
  office.dimensions.floors = 1;
  office.dimensions.width = 10;
  const minClamped = clampHouseConfig(office);
  assert.equal(minClamped.dimensions.floors, 3);
  assert.equal(minClamped.dimensions.width, 18);

  office.dimensions.floors = 40;
  office.dimensions.width = 80;
  const maxClamped = clampHouseConfig(office);
  assert.equal(maxClamped.dimensions.floors, 18);
  assert.equal(maxClamped.dimensions.width, 46);
});

test('computeHouseMetrics and clampHouseConfig support slum-shack favela constraints and roof modes', () => {
  const slum = createDefaultConfigForStyle('slum-shack');
  slum.dimensions.width = 8.4;
  slum.dimensions.depth = 7.0;
  slum.dimensions.floors = 2;
  slum.dimensions.floorHeight = 2.6;
  slum.dimensions.foundationHeight = 0.35;
  slum.features.roofType = 'flat';
  slum.features.hasChimney = true;

  const clamped = clampHouseConfig(slum);
  assert.equal(clamped.dimensions.floors, 2);
  assert.equal(clamped.materials.wallMaterial, 'corrugated');

  const flatMetrics = computeHouseMetrics(clamped);
  assert.equal(flatMetrics.footprintAreaM2, 58.8);
  assert.equal(flatMetrics.grossFloorAreaM2, 117.6);
  assert.equal(flatMetrics.wallHeightTotalM, 5.2);
  // flat roof base (0.45) + water tank/stovepipe (1.35) = 1.8
  assert.equal(flatMetrics.roofRiseM, 1.8);
  assert.equal(flatMetrics.totalRidgeHeightM, 7.35);

  // Stepped slum shack adds rooftop cabin (+0.45 effective floors, rounded to 1 decimal)
  slum.features.roofType = 'stepped';
  const steppedMetrics = computeHouseMetrics(slum);
  assert.equal(steppedMetrics.grossFloorAreaM2, 144.1);

  // Verify out-of-range floors/width clamp cleanly to [1..4] and [5.5..14.0]
  slum.dimensions.floors = 0;
  slum.dimensions.width = 2;
  const minClamped = clampHouseConfig(slum);
  assert.equal(minClamped.dimensions.floors, 1);
  assert.equal(minClamped.dimensions.width, 5.5);

  slum.dimensions.floors = 12;
  slum.dimensions.width = 30;
  const maxClamped = clampHouseConfig(slum);
  assert.equal(maxClamped.dimensions.floors, 4);
  assert.equal(maxClamped.dimensions.width, 14);
});
