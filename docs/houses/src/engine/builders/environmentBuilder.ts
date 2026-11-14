import * as THREE from 'three';
import type { HouseConfig } from '../../types/house';
import type { ProceduralTextureLibrary } from '../textures/proceduralTextures';

export interface SiteEnvironmentResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Builds the non-exported architectural plot environment:
 * - Soft ground terrain disc fading into fog
 * - Soft radial contact shadow beneath the house footprint
 * - Paving walkway from the front porch
 * - Composite multi-part stylized trees framing the plot
 */
export function buildSiteEnvironment(
  config: HouseConfig,
  textures: ProceduralTextureLibrary,
): SiteEnvironmentResult {
  const group = new THREE.Group();
  group.name = 'SiteEnvironment';

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const disposables: THREE.Texture[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const entrances = config.dimensions.entrances ?? 1;
  const totalW = config.dimensions.width * entrances;
  const depth = config.dimensions.depth;
  const isApartment = config.styleId === 'soviet-panel';
  const isOffice = config.styleId === 'office-building';
  const isSkyscraper = config.styleId === 'skyscraper';
  const isMegabuilding = config.styleId === 'megabuilding';
  const isSlum = config.styleId === 'slum-shack';
  const isHighrise = isSkyscraper || isMegabuilding;
  const isUrban = isHighrise || isOffice;
  const maxSpan = Math.max(totalW, depth);

  // 1. Expansive ground terrain (extends well past fog.far so horizon blends seamlessly)
  const groundRadius = Math.max(isHighrise ? 1800 : isOffice ? 500 : 140, maxSpan * 45);
  const groundGeo = trackGeo(new THREE.CircleGeometry(groundRadius, 64));
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        isMegabuilding
          ? '#172031'
          : isSlum
            ? '#cfc5b4'
            : isSkyscraper || isOffice
              ? '#cfd6e0'
              : isApartment
                ? '#d5dcd0'
                : '#dfe5dc',
      ),
      roughness: 0.94,
      metalness: 0.0,
    }),
  );
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.position.y = -0.02;
  groundMesh.receiveShadow = true;
  group.add(groundMesh);

  // 2. Architectural lot terrace / stone plaza around the building
  const padW = totalW + (isMegabuilding ? 24 : isSkyscraper ? 18 : isOffice ? 15 : isApartment ? 10 : isSlum ? 4.8 : 6.5);
  const padD = depth + (isMegabuilding ? 24 : isSkyscraper ? 18 : isOffice ? 15 : isApartment ? 12 : isSlum ? 5.2 : 6.5);
  const padGeo = trackGeo(new THREE.BoxGeometry(padW, 0.04, padD));
  const padMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(
        isMegabuilding
          ? '#2c3445'
          : isSlum
            ? '#a9a295'
            : isSkyscraper || isOffice
              ? '#bfc7d3'
              : '#c8d2c3',
      ),
      roughness: 0.92,
      metalness: isMegabuilding ? 0.08 : 0.0,
    }),
  );
  const padMesh = new THREE.Mesh(padGeo, padMat);
  padMesh.position.set(0, -0.02, isUrban ? 1.8 : isApartment ? 2.2 : 0.4);
  padMesh.receiveShadow = true;
  group.add(padMesh);

  // 3. Soft radial contact shadow plane directly beneath the building
  const shadowTex = textures.createContactShadowTexture();
  disposables.push(shadowTex);
  const shadowGeo = trackGeo(new THREE.PlaneGeometry(totalW * 1.32, depth * 1.45));
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: isMegabuilding ? 0.7 : 0.55,
    }),
  );
  const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
  shadowPlane.position.y = 0.004;
  group.add(shadowPlane);

  // 4. Front walkway(s), courtyard road, or urban avenue
  const walkMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(isMegabuilding ? '#3a4457' : '#b8bec7'),
      roughness: 0.85,
      metalness: 0.04,
    }),
  );

  const hw = totalW / 2;
  const hd = depth / 2;

  if (isUrban) {
    // Broad entrance promenade from podium steps to city avenue
    const promW = Math.min(totalW * 0.48, isMegabuilding ? 15.0 : isOffice ? 11.0 : 10.2);
    const promGeo = trackGeo(new THREE.BoxGeometry(promW, 0.036, isMegabuilding ? 10.2 : 7.6));
    const prom = new THREE.Mesh(promGeo, walkMat);
    prom.position.set(0, 0.008, depth / 2 + (isMegabuilding ? 8.2 : 6.9));
    prom.receiveShadow = true;
    group.add(prom);

    // City avenue asphalt carriageway in front of the plaza
    const roadW = Math.max(220, totalW + (isMegabuilding ? 180 : 140));
    const roadD = isMegabuilding ? 11.0 : 7.2;
    const roadGeo = trackGeo(new THREE.BoxGeometry(roadW, 0.03, roadD));
    const roadMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(isMegabuilding ? '#171c26' : '#5a6270'),
        roughness: 0.85,
        metalness: 0.05,
      }),
    );
    const roadZ = depth / 2 + (isMegabuilding ? 18.0 : 14.2);
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.004, roadZ);
    road.receiveShadow = true;
    group.add(road);

    // Dashed avenue lane markings (amber cyber markings for megabuilding)
    const dashGeo = trackGeo(new THREE.BoxGeometry(3.8, 0.034, 0.24));
    const dashMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(isMegabuilding ? '#f59e0b' : '#e5e7eb'),
        emissive: new THREE.Color(isMegabuilding ? '#b45309' : '#000000'),
        emissiveIntensity: isMegabuilding ? 0.45 : 0,
        roughness: 0.7,
      }),
    );
    const dashCount = Math.floor(roadW / 7.5);
    for (let i = -Math.floor(dashCount / 2); i <= Math.floor(dashCount / 2); i++) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(i * 7.2, 0.006, roadZ);
      group.add(dash);
    }

    if (isMegabuilding) {
      // Glowing cyan cyber-curb guide strips along highway edge
      const curbGlowGeo = trackGeo(new THREE.BoxGeometry(roadW, 0.06, 0.22));
      const curbGlowMat = trackMat(
        new THREE.MeshStandardMaterial({
          color: new THREE.Color('#00e5ff'),
          emissive: new THREE.Color('#00d8ff'),
          emissiveIntensity: 1.25,
        }),
      );
      const curb = new THREE.Mesh(curbGlowGeo, curbGlowMat);
      curb.position.set(0, 0.015, roadZ - roadD / 2 - 0.12);
      group.add(curb);
    }
  } else if (isApartment) {
    // Concrete sidewalk along the entire +Z front facade
    const sidewalkGeo = trackGeo(new THREE.BoxGeometry(totalW + 4.0, 0.035, 2.2));
    const sidewalk = new THREE.Mesh(sidewalkGeo, walkMat);
    sidewalk.position.set(0, 0.008, depth / 2 + 3.4);
    sidewalk.receiveShadow = true;
    group.add(sidewalk);

    // Asphalt courtyard driveway in front of sidewalk
    const roadGeo = trackGeo(new THREE.BoxGeometry(totalW + 10.0, 0.025, 4.4));
    const roadMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#6b7280'),
        roughness: 0.92,
        metalness: 0.02,
      }),
    );
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0.004, depth / 2 + 6.7);
    road.receiveShadow = true;
    group.add(road);

    // Individual walkways connecting each entrance stoop to the sidewalk
    const entryWalkGeo = trackGeo(new THREE.BoxGeometry(2.1, 0.035, 2.4));
    const sectionW = config.dimensions.width;
    for (let e = 0; e < entrances; e++) {
      const sx = -totalW / 2 + sectionW * (e + 0.5);
      const ew = new THREE.Mesh(entryWalkGeo, walkMat);
      ew.position.set(sx, 0.009, depth / 2 + 1.8);
      ew.receiveShadow = true;
      group.add(ew);
    }
  } else if (isSlum) {
    // Cracked alley lane in front + wooden utility pole with sagging power lines + scrap barrels
    const alleyGeo = trackGeo(new THREE.BoxGeometry(totalW + 18, 0.028, 3.2));
    const alleyMat = trackMat(
      new THREE.MeshStandardMaterial({ color: '#8f897f', roughness: 0.94, metalness: 0.02 }),
    );
    const alley = new THREE.Mesh(alleyGeo, alleyMat);
    alley.position.set(0, 0.004, depth / 2 + 4.4);
    alley.receiveShadow = true;
    group.add(alley);

    // Wooden utility pole + crossarm + overhead sagging power cables connected to house corner
    const poleMat = trackMat(new THREE.MeshStandardMaterial({ color: '#5c4636', roughness: 0.88 }));
    const wireMat = trackMat(new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.6 }));
    const poleX = -hw - 2.6;
    const poleZ = hd + 2.8;
    const poleH = Math.max(5.6, config.dimensions.floors * config.dimensions.floorHeight + 1.8);

    const poleGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.16, poleH, 8));
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(poleX, poleH / 2, poleZ);
    pole.castShadow = true;
    group.add(pole);

    const armGeo = trackGeo(new THREE.BoxGeometry(1.5, 0.1, 0.1));
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(poleX, poleH - 0.35, poleZ);
    group.add(arm);

    const hookY =
      config.dimensions.foundationHeight +
      Math.min(config.dimensions.floors, 2) * config.dimensions.floorHeight -
      0.35;
    for (const [ox, oy] of [
      [-0.45, 0],
      [0.45, -0.15],
    ]) {
      const start = new THREE.Vector3(poleX + ox, poleH - 0.35, poleZ);
      const end = new THREE.Vector3(-hw * 0.86, hookY + oy, hd * 0.55);
      const mid = start.clone().lerp(end, 0.5);
      mid.y -= 0.75;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const tubeGeo = trackGeo(new THREE.TubeGeometry(curve, 12, 0.022, 6, false));
      group.add(new THREE.Mesh(tubeGeo, wireMat));
    }

    // Scrap oil drums and stacked wooden crates near the shack wall
    const drumGeo = trackGeo(new THREE.CylinderGeometry(0.28, 0.28, 0.88, 12));
    const drumMat = trackMat(new THREE.MeshStandardMaterial({ color: '#7c4331', roughness: 0.72, metalness: 0.3 }));
    const crateGeo = trackGeo(new THREE.BoxGeometry(0.68, 0.52, 0.56));
    for (const [dx, dz] of [
      [-hw - 0.55, -hd * 0.25],
      [-hw - 0.6, -hd * 0.25 + 0.62],
    ]) {
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.position.set(dx, 0.44, dz);
      drum.castShadow = true;
      group.add(drum);
    }
    const crate = new THREE.Mesh(crateGeo, poleMat);
    crate.position.set(hw + 0.55, 0.26, -hd * 0.1);
    crate.castShadow = true;
    group.add(crate);
  } else {
    const walkGeo = trackGeo(new THREE.BoxGeometry(1.5, 0.03, 4.6));
    const walkMesh = new THREE.Mesh(walkGeo, walkMat);
    walkMesh.position.set(0, 0.006, depth / 2 + 3.2);
    walkMesh.receiveShadow = true;
    group.add(walkMesh);
  }

  // 5. Composite 3-part stylized trees (or cyberpunk street light pylons for megabuilding)
  if (isMegabuilding) {
    const poleGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.24, 6.2, 8));
    const armGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.22, 1.8));
    const lampGeo = trackGeo(new THREE.BoxGeometry(0.32, 0.14, 1.1));
    const poleMat = trackMat(
      new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.7 }),
    );
    const lampMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: '#00e5ff',
        emissive: '#00d8ff',
        emissiveIntensity: 1.5,
      }),
    );

    const pylonPositions: Array<[number, number]> = [
      [-hw - 8, hd + 11.5],
      [hw + 8, hd + 11.5],
      [-hw * 0.45, hd + 11.5],
      [hw * 0.45, hd + 11.5],
      [-hw - 10, 0],
      [hw + 10, 0],
      [-hw - 8, -hd - 8],
      [hw + 8, -hd - 8],
    ];
    for (const [px, pz] of pylonPositions) {
      const pylon = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.1;
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0, 6.1, 0.7);
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, 5.95, 1.2);
      pylon.add(pole, arm, lamp);
      pylon.position.set(px, 0, pz);
      group.add(pylon);
    }
  } else {
    const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.11, 0.16, 1.5, 10));
    const trunkMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#6c5340'),
        roughness: 0.88,
        metalness: 0.02,
      }),
    );
    const crownGeo1 = trackGeo(new THREE.ConeGeometry(0.95, 1.9, 10));
    const crownGeo2 = trackGeo(new THREE.ConeGeometry(0.72, 1.5, 10));
    const foliageMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5a7d5c'),
        roughness: 0.78,
        metalness: 0.0,
      }),
    );

    const treeScaleBoost = isSkyscraper ? 1.85 : isOffice ? 1.55 : isApartment ? 1.45 : isSlum ? 0.85 : 1.0;
    const treeCoords: Array<[number, number, number]> =
      isSkyscraper || isOffice
        ? [
            [-hw - 6.2, hd + 8.0, 1.05 * treeScaleBoost],
            [hw + 6.2, hd + 8.0, 1.05 * treeScaleBoost],
            [-hw - 11.5, hd + 8.0, 1.15 * treeScaleBoost],
            [hw + 11.5, hd + 8.0, 1.15 * treeScaleBoost],
            [-hw - 7.2, 0, 1.1 * treeScaleBoost],
            [hw + 7.2, 0, 1.1 * treeScaleBoost],
            [-hw - 6.0, -hd - 5.8, 1.2 * treeScaleBoost],
            [hw + 6.0, -hd - 5.8, 1.2 * treeScaleBoost],
          ]
      : isApartment
        ? [
            [-hw - 3.6, -hd - 2.0, 1.2 * treeScaleBoost],
            [-hw - 4.2, 2.5, 1.0 * treeScaleBoost],
            [hw + 3.6, -hd - 2.0, 1.25 * treeScaleBoost],
            [hw + 4.2, 2.5, 1.05 * treeScaleBoost],
            [-hw * 0.65, -hd - 4.5, 1.15 * treeScaleBoost],
            [0, -hd - 4.8, 1.2 * treeScaleBoost],
            [hw * 0.65, -hd - 4.5, 1.1 * treeScaleBoost],
          ]
        : isSlum
          ? [
              [-hw - 3.8, -hd - 1.6, 0.9],
              [hw + 3.2, -hd - 1.8, 0.8],
            ]
          : [
              [-hw - 3.2, -hd - 1.5, 1.15],
              [-hw - 4.0, 1.8, 0.9],
              [hw + 3.5, -hd - 1.8, 1.2],
              [hw + 3.8, 2.2, 0.95],
              [-hw - 1.2, -hd - 4.2, 1.05],
              [hw + 1.6, -hd - 4.0, 0.88],
            ];

    for (const [tx, tz, scale] of treeCoords) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      trunk.castShadow = true;

      const c1 = new THREE.Mesh(crownGeo1, foliageMat);
      c1.position.y = 2.0;
      c1.castShadow = true;
      c1.receiveShadow = true;

      const c2 = new THREE.Mesh(crownGeo2, foliageMat);
      c2.position.y = 2.95;
      c2.castShadow = true;

      tree.add(trunk, c1, c2);
      tree.position.set(tx, 0, tz);
      tree.scale.setScalar(scale);
      group.add(tree);
    }
  }

  const dispose = () => {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    disposables.forEach((t) => t.dispose());
  };

  return { group, dispose };
}
