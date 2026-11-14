import * as THREE from 'three';

/**
 * Делает материал травяным: процедурный шейдерный рисунок травы/дерна
 * (дешёвый value/hash-noise в фрагментном шейдере, без текстур и доп.
 * проходов), чтобы зелёные холмы выглядели травянистыми. Шейдер
 * навешивается на MeshStandardMaterial и не меняет геометрию/освещение.
 *
 * @param {THREE.MeshStandardMaterial} material
 * @param {{ scale?: number, strength?: number, dark?: number, slopeFade?: boolean }} [opts]
 * @returns {THREE.MeshStandardMaterial}
 */
export function applyGrass(material, opts = {}) {
  const scale = opts.scale ?? 0.45;
  const strength = opts.strength ?? 0.22;
  const dark = opts.dark ?? 0.18;
  const slopeFade = !!opts.slopeFade;
  material.userData = material.userData || {};
  material.userData.grass = { scale, strength, dark, slopeFade };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uGrassScale = { value: scale };
    shader.uniforms.uGrassStrength = { value: strength };
    shader.uniforms.uGrassDark = { value: dark };
    shader.uniforms.uGrassSlope = { value: slopeFade ? 1.0 : 0.0 };

    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vGrassWorldPos;
varying vec3 vGrassWorldNormal;`
      )
      .replace(
        '#include <worldpos_vertex>',
        `#include <worldpos_vertex>
vGrassWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
vGrassWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec3 vGrassWorldPos;
varying vec3 vGrassWorldNormal;
uniform float uGrassScale;
uniform float uGrassStrength;
uniform float uGrassDark;
uniform float uGrassSlope;

float grassHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float grassNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = grassHash(i);
  float b = grassHash(i + vec2(1.0, 0.0));
  float c = grassHash(i + vec2(0.0, 1.0));
  float d = grassHash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}`
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  vec2 gp = vGrassWorldPos.xz * uGrassScale;
  float n1 = grassNoise(gp);
  float n2 = grassNoise(gp * 2.7 + 19.3);
  float blades = smoothstep(0.45, 0.85, n2) * 0.5 + n1 * 0.5;
  float grassPatch = grassNoise(gp * 0.18 + 7.1);
  float grassK = mix(1.0 - uGrassDark, 1.0 + uGrassStrength, blades);
  grassK *= mix(0.92, 1.08, grassPatch);
  if (uGrassSlope > 0.5) {
    float up = clamp(vGrassWorldNormal.y, 0.0, 1.0);
    float slopeFlat = smoothstep(0.25, 0.85, up);
    grassK = mix(1.0, grassK, slopeFlat);
  }
  diffuseColor.rgb *= grassK;
}`
      );
  };
  material.needsUpdate = true;
  return material;
}

/** Создаёт MeshStandardMaterial с травяным шейдером. */
export function makeGrassMaterial(color, opts = {}) {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.95,
    metalness: opts.metalness ?? 0.0,
  });
  return applyGrass(mat, opts);
}
