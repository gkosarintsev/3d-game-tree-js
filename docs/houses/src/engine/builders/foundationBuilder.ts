import * as THREE from 'three';
import type { HouseConfig } from '../../types/house';
import type { HouseBuildContext, HousePartBuilder } from './types';

/**
 * Builds the foundation plinth, perimeter drip cap, and optional front entrance porch & steps.
 * Everything is grounded strictly at y = 0 so the house sits flush on the plot.
 */
export const foundationBuilder: HousePartBuilder = {
  id: 'foundation',
  build(config: HouseConfig, ctx: HouseBuildContext): THREE.Group {
    const group = new THREE.Group();
    group.name = 'Foundation';

    const { width, depth, foundationHeight } = config.dimensions;
    const plinthOverhang = 0.08;

    // 1. Primary concrete plinth base (grounded at y = 0)
    const plinthGeo = ctx.trackGeometry(
      new THREE.BoxGeometry(width + plinthOverhang * 2, foundationHeight, depth + plinthOverhang * 2),
    );
    const plinthMesh = new THREE.Mesh(plinthGeo, ctx.materials.foundation);
    plinthMesh.name = 'FoundationPlinth';
    plinthMesh.position.set(0, foundationHeight / 2, 0);
    plinthMesh.castShadow = true;
    plinthMesh.receiveShadow = true;
    group.add(plinthMesh);

    // 2. Perimeter water-table / drip cap ledge between foundation and walls
    const capH = 0.06;
    const capGeo = ctx.trackGeometry(
      new THREE.BoxGeometry(width + plinthOverhang * 2 + 0.06, capH, depth + plinthOverhang * 2 + 0.06),
    );
    const capMesh = new THREE.Mesh(capGeo, ctx.materials.stoneStep);
    capMesh.name = 'FoundationCap';
    capMesh.position.set(0, foundationHeight - capH / 2 + 0.01, 0);
    capMesh.castShadow = true;
    capMesh.receiveShadow = true;
    group.add(capMesh);

    // 3. Entrance porch landing + steps on the +Z front facade
    if (config.features.hasPorch) {
      const porchW = Math.min(2.6, Math.max(1.8, width * 0.28));
      const porchD = 1.25;
      const porchH = Math.max(0.16, foundationHeight * 0.88);
      const frontZ = depth / 2 + plinthOverhang;

      const landingGeo = ctx.trackGeometry(new THREE.BoxGeometry(porchW, porchH, porchD));
      const landingMesh = new THREE.Mesh(landingGeo, ctx.materials.stoneStep);
      landingMesh.name = 'PorchLanding';
      landingMesh.position.set(0, porchH / 2, frontZ + porchD / 2);
      landingMesh.castShadow = true;
      landingMesh.receiveShadow = true;
      group.add(landingMesh);

      // Two tiered concrete steps descending to ground y = 0
      const stepCount = foundationHeight > 0.45 ? 2 : 1;
      for (let i = 0; i < stepCount; i++) {
        const ratio = (stepCount - i) / (stepCount + 1);
        const stepH = porchH * ratio;
        const stepD = 0.34;
        const stepGeo = ctx.trackGeometry(new THREE.BoxGeometry(porchW * 0.86, stepH, stepD));
        const stepMesh = new THREE.Mesh(stepGeo, ctx.materials.foundation);
        stepMesh.name = `PorchStep_${i + 1}`;
        stepMesh.position.set(0, stepH / 2, frontZ + porchD + stepD * (i + 0.5));
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        group.add(stepMesh);
      }
    }

    return group;
  },
};
