import * as THREE from 'three';

export interface ProceduralTextureSet {
  floorAlbedo: THREE.CanvasTexture;
  floorRoughness: THREE.CanvasTexture;
  armorBump: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  const aniso = Math.max(1, Math.min(maxAnisotropy, 8));

  // 1. Tactical concrete shooting-range floor tile (albedo + subtle grid lines)
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fctx = floorCanvas.getContext('2d')!;

  fctx.fillStyle = '#20252d';
  fctx.fillRect(0, 0, 512, 512);

  // Subtle concrete speckle noise
  for (let i = 0; i < 4800; i++) {
    const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    const y = (Math.sin(i * 78.233) * 19341.123) % 1;
    const px = Math.abs(x) * 512;
    const py = Math.abs(y) * 512;
    const shade = i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.09)';
    fctx.fillStyle = shade;
    fctx.fillRect(px, py, 2, 2);
  }

  // Expansion joint seams
  fctx.strokeStyle = 'rgba(10, 12, 16, 0.72)';
  fctx.lineWidth = 3;
  fctx.strokeRect(1.5, 1.5, 509, 509);

  // Sub-grid lines
  fctx.strokeStyle = 'rgba(148, 163, 184, 0.10)';
  fctx.lineWidth = 1;
  for (let step = 128; step < 512; step += 128) {
    fctx.beginPath();
    fctx.moveTo(step, 0);
    fctx.lineTo(step, 512);
    fctx.stroke();

    fctx.beginPath();
    fctx.moveTo(0, step);
    fctx.lineTo(512, step);
    fctx.stroke();
  }

  // Corner tactical crosshairs
  fctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  fctx.lineWidth = 2;
  fctx.beginPath();
  fctx.moveTo(0, 14);
  fctx.lineTo(0, 0);
  fctx.lineTo(14, 0);
  fctx.stroke();

  const floorAlbedo = new THREE.CanvasTexture(floorCanvas);
  floorAlbedo.colorSpace = THREE.SRGBColorSpace;
  floorAlbedo.wrapS = THREE.RepeatWrapping;
  floorAlbedo.wrapT = THREE.RepeatWrapping;
  floorAlbedo.repeat.set(16, 16);
  floorAlbedo.anisotropy = aniso;

  // 2. Concrete floor roughness variation map (linear)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rctx = roughCanvas.getContext('2d')!;
  rctx.fillStyle = '#c4c4c4';
  rctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2400; i++) {
    const px = Math.abs((Math.sin(i * 41.23) * 9182.3) % 1) * 256;
    const py = Math.abs((Math.sin(i * 19.71) * 4123.7) % 1) * 256;
    const v = 165 + (i % 70);
    rctx.fillStyle = `rgb(${v},${v},${v})`;
    rctx.fillRect(px, py, 3, 3);
  }
  const floorRoughness = new THREE.CanvasTexture(roughCanvas);
  floorRoughness.wrapS = THREE.RepeatWrapping;
  floorRoughness.wrapT = THREE.RepeatWrapping;
  floorRoughness.repeat.set(16, 16);
  floorRoughness.anisotropy = aniso;

  // 3. Ballistic Cordura / Micro-Hex weave bump map for armor & fabric (linear)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 128;
  bumpCanvas.height = 128;
  const bctx = bumpCanvas.getContext('2d')!;
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) {
    for (let x = 0; x < 128; x += 4) {
      const alt = ((x + y) / 4) % 2 === 0;
      bctx.fillStyle = alt ? '#9c9c9c' : '#686868';
      bctx.fillRect(x, y, 3, 3);
    }
  }
  const armorBump = new THREE.CanvasTexture(bumpCanvas);
  armorBump.wrapS = THREE.RepeatWrapping;
  armorBump.wrapT = THREE.RepeatWrapping;
  armorBump.repeat.set(6, 6);
  armorBump.anisotropy = aniso;

  // 4. Soft radial contact shadow disc texture
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d')!;
  const grad = sctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  return {
    floorAlbedo,
    floorRoughness,
    armorBump,
    contactShadow,
    dispose: () => {
      floorAlbedo.dispose();
      floorRoughness.dispose();
      armorBump.dispose();
      contactShadow.dispose();
    },
  };
}
