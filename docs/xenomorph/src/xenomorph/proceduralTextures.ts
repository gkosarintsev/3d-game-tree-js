import * as THREE from 'three';

export interface ProceduralTextureSet {
  chitinBump: THREE.CanvasTexture;
  chitinRoughness: THREE.CanvasTexture;
  floorAlbedo: THREE.CanvasTexture;
  floorBump: THREE.CanvasTexture;
  floorRoughness: THREE.CanvasTexture;
  crateAlbedo: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Biomechanical Chitin Bump & Roughness
  const chitinCanvas = document.createElement('canvas');
  chitinCanvas.width = 256;
  chitinCanvas.height = 256;
  const cCtx = chitinCanvas.getContext('2d')!;
  cCtx.fillStyle = '#6e7278';
  cCtx.fillRect(0, 0, 256, 256);

  // Horizontal biomechanical ribbing + organic striations
  for (let y = 0; y < 256; y += 16) {
    const grad = cCtx.createLinearGradient(0, y, 0, y + 16);
    grad.addColorStop(0, '#2a2d33');
    grad.addColorStop(0.35, '#9ea4ad');
    grad.addColorStop(0.7, '#d8dde4');
    grad.addColorStop(1, '#24272c');
    cCtx.fillStyle = grad;
    cCtx.fillRect(0, y, 256, 16);
  }
  // Longitudinal tendon ridges
  cCtx.strokeStyle = 'rgba(255,255,255,0.22)';
  cCtx.lineWidth = 2;
  for (let x = 8; x < 256; x += 24) {
    cCtx.beginPath();
    cCtx.moveTo(x, 0);
    for (let y = 0; y <= 256; y += 32) {
      cCtx.lineTo(x + Math.sin(y * 0.08 + x) * 4, y);
    }
    cCtx.stroke();
  }
  // Organic micro-pitting
  for (let i = 0; i < 450; i++) {
    const px = (i * 73) % 256;
    const py = (i * 137) % 256;
    cCtx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.12)';
    cCtx.fillRect(px, py, 2, 3);
  }

  const chitinBump = new THREE.CanvasTexture(chitinCanvas);
  chitinBump.wrapS = THREE.RepeatWrapping;
  chitinBump.wrapT = THREE.RepeatWrapping;
  chitinBump.repeat.set(2, 2);
  chitinBump.anisotropy = maxAnisotropy;

  // Chitin roughness map (crevices rougher, raised ribs slicker & wetter)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 256;
  roughCanvas.height = 256;
  const rCtx = roughCanvas.getContext('2d')!;
  for (let y = 0; y < 256; y += 16) {
    const grad = rCtx.createLinearGradient(0, y, 0, y + 16);
    grad.addColorStop(0, '#9a9a9a');
    grad.addColorStop(0.5, '#2b2b2b');
    grad.addColorStop(1, '#a8a8a8');
    rCtx.fillStyle = grad;
    rCtx.fillRect(0, y, 256, 16);
  }
  const chitinRoughness = new THREE.CanvasTexture(roughCanvas);
  chitinRoughness.wrapS = THREE.RepeatWrapping;
  chitinRoughness.wrapT = THREE.RepeatWrapping;
  chitinRoughness.repeat.set(2, 2);
  chitinRoughness.anisotropy = maxAnisotropy;

  // 2. Industrial Containment Bay Floor Grating
  const floorCanvas = document.createElement('canvas');
  floorCanvas.width = 512;
  floorCanvas.height = 512;
  const fCtx = floorCanvas.getContext('2d')!;
  fCtx.fillStyle = '#181e26';
  fCtx.fillRect(0, 0, 512, 512);

  // Sub-panel grid
  fCtx.strokeStyle = '#0d1117';
  fCtx.lineWidth = 6;
  fCtx.strokeRect(3, 3, 506, 506);
  fCtx.lineWidth = 3;
  fCtx.beginPath();
  fCtx.moveTo(256, 0);
  fCtx.lineTo(256, 512);
  fCtx.moveTo(0, 256);
  fCtx.lineTo(512, 256);
  fCtx.stroke();

  // Diamond / industrial tread grating slots
  fCtx.fillStyle = '#0b0f14';
  for (let gx = 24; gx < 512; gx += 32) {
    for (let gy = 24; gy < 512; gy += 32) {
      if ((gx > 235 && gx < 277) || (gy > 235 && gy < 277)) continue;
      fCtx.fillRect(gx - 8, gy - 3, 16, 6);
    }
  }
  // Subtle worn metal highlights & rivets
  fCtx.fillStyle = '#33404f';
  const rivets = [20, 236, 276, 492];
  for (const rx of rivets) {
    for (const ry of rivets) {
      fCtx.beginPath();
      fCtx.arc(rx, ry, 4, 0, Math.PI * 2);
      fCtx.fill();
    }
  }
  // Subtle hazard edge stripe on one edge
  fCtx.fillStyle = 'rgba(217, 119, 6, 0.28)';
  fCtx.fillRect(0, 0, 512, 10);

  const floorAlbedo = new THREE.CanvasTexture(floorCanvas);
  floorAlbedo.colorSpace = THREE.SRGBColorSpace;
  floorAlbedo.wrapS = THREE.RepeatWrapping;
  floorAlbedo.wrapT = THREE.RepeatWrapping;
  floorAlbedo.repeat.set(9, 9);
  floorAlbedo.anisotropy = maxAnisotropy;

  // Floor bump map
  const fBumpCanvas = document.createElement('canvas');
  fBumpCanvas.width = 512;
  fBumpCanvas.height = 512;
  const fbCtx = fBumpCanvas.getContext('2d')!;
  fbCtx.fillStyle = '#b0b0b0';
  fbCtx.fillRect(0, 0, 512, 512);
  fbCtx.strokeStyle = '#303030';
  fbCtx.lineWidth = 6;
  fbCtx.strokeRect(3, 3, 506, 506);
  fbCtx.fillStyle = '#181818';
  for (let gx = 24; gx < 512; gx += 32) {
    for (let gy = 24; gy < 512; gy += 32) {
      if ((gx > 235 && gx < 277) || (gy > 235 && gy < 277)) continue;
      fbCtx.fillRect(gx - 8, gy - 3, 16, 6);
    }
  }
  const floorBump = new THREE.CanvasTexture(fBumpCanvas);
  floorBump.wrapS = THREE.RepeatWrapping;
  floorBump.wrapT = THREE.RepeatWrapping;
  floorBump.repeat.set(9, 9);
  floorBump.anisotropy = maxAnisotropy;

  const floorRoughness = new THREE.CanvasTexture(fBumpCanvas);
  floorRoughness.wrapS = THREE.RepeatWrapping;
  floorRoughness.wrapT = THREE.RepeatWrapping;
  floorRoughness.repeat.set(9, 9);
  floorRoughness.anisotropy = maxAnisotropy;

  // 3. Industrial Crate Albedo with diagonal caution stripes
  const crateCanvas = document.createElement('canvas');
  crateCanvas.width = 256;
  crateCanvas.height = 256;
  const crCtx = crateCanvas.getContext('2d')!;
  crCtx.fillStyle = '#252d38';
  crCtx.fillRect(0, 0, 256, 256);
  crCtx.strokeStyle = '#131820';
  crCtx.lineWidth = 10;
  crCtx.strokeRect(5, 5, 246, 246);
  // Caution band
  crCtx.save();
  crCtx.beginPath();
  crCtx.rect(16, 198, 224, 34);
  crCtx.clip();
  crCtx.fillStyle = '#d97706';
  crCtx.fillRect(16, 198, 224, 34);
  crCtx.fillStyle = '#11161d';
  for (let sx = -40; sx < 280; sx += 28) {
    crCtx.beginPath();
    crCtx.moveTo(sx, 198);
    crCtx.lineTo(sx + 14, 198);
    crCtx.lineTo(sx - 6, 232);
    crCtx.lineTo(sx - 20, 232);
    crCtx.closePath();
    crCtx.fill();
  }
  crCtx.restore();
  // Recessed panel lines
  crCtx.strokeStyle = '#3a4656';
  crCtx.lineWidth = 3;
  crCtx.strokeRect(24, 24, 208, 156);

  const crateAlbedo = new THREE.CanvasTexture(crateCanvas);
  crateAlbedo.colorSpace = THREE.SRGBColorSpace;
  crateAlbedo.anisotropy = maxAnisotropy;

  // 4. Radial Contact Shadow
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const rad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  rad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  rad.addColorStop(0.55, 'rgba(0, 0, 0, 0.38)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  sCtx.fillStyle = rad;
  sCtx.fillRect(0, 0, 128, 128);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  return {
    chitinBump,
    chitinRoughness,
    floorAlbedo,
    floorBump,
    floorRoughness,
    crateAlbedo,
    contactShadow,
    dispose: () => {
      chitinBump.dispose();
      chitinRoughness.dispose();
      floorAlbedo.dispose();
      floorBump.dispose();
      floorRoughness.dispose();
      crateAlbedo.dispose();
      contactShadow.dispose();
    },
  };
}
