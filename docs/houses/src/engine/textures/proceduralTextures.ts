import * as THREE from 'three';
import type { TextureRecipe } from '../../core/registries/materialsRegistry';

export interface ProceduralTexturePair {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

function createCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  return [canvas, ctx];
}

function seededNoise(x: number, y: number, seed = 17): number {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function configureTexture(
  canvas: HTMLCanvasElement,
  isColorMap: boolean,
  anisotropy: number,
  repeatX = 2,
  repeatY = 2,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  if (isColorMap) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

function drawStucco(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#f8f8f6';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, size, size);

  for (let i = 0; i < 2400; i++) {
    const x = seededNoise(i, 1, 3) * size;
    const y = seededNoise(i, 2, 7) * size;
    const r = 1 + seededNoise(i, 3, 11) * 2.5;
    const v = 232 + Math.floor(seededNoise(i, 4, 13) * 22);
    ctxC.fillStyle = `rgb(${v},${v},${v})`;
    ctxC.fillRect(x, y, r, r);

    const bv = 108 + Math.floor(seededNoise(i, 5, 19) * 44);
    ctxB.fillStyle = `rgb(${bv},${bv},${bv})`;
    ctxB.fillRect(x, y, r, r);
  }
  return [cColor, cBump];
}

function drawBrick(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  // Mortar base
  ctxC.fillStyle = '#dad6ce';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#484848';
  ctxB.fillRect(0, 0, size, size);

  const rows = 8;
  const cols = 4;
  const rowH = size / rows;
  const colW = size / cols;
  const mortar = 3;

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? colW / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      const bx = c * colW + offset + mortar / 2;
      const by = r * rowH + mortar / 2;
      const bw = colW - mortar;
      const bh = rowH - mortar;

      const tone = 224 + Math.floor(seededNoise(r, c, 23) * 28);
      ctxC.fillStyle = `rgb(${tone},${tone - 4},${tone - 6})`;
      ctxC.fillRect(bx, by, bw, bh);

      const bTone = 175 + Math.floor(seededNoise(r, c, 29) * 45);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`;
      ctxB.fillRect(bx, by, bw, bh);
    }
  }
  return [cColor, cBump];
}

function drawTimber(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#f2efe9';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#a0a0a0';
  ctxB.fillRect(0, 0, size, size);

  const planks = 8;
  const plankH = size / planks;

  for (let p = 0; p < planks; p++) {
    const y = p * plankH;
    const tone = 228 + Math.floor(seededNoise(p, 2, 31) * 24);
    ctxC.fillStyle = `rgb(${tone},${tone - 2},${tone - 5})`;
    ctxC.fillRect(0, y, size, plankH - 2);

    // Plank seam
    ctxC.fillStyle = '#b9b2a8';
    ctxC.fillRect(0, y + plankH - 2, size, 2);

    ctxB.fillStyle = '#c8c8c8';
    ctxB.fillRect(0, y, size, plankH - 2);
    ctxB.fillStyle = '#383838';
    ctxB.fillRect(0, y + plankH - 2, size, 2);

    // Wood grain streaks
    for (let g = 0; g < 18; g++) {
      const gy = y + seededNoise(p, g, 41) * (plankH - 4);
      ctxC.fillStyle = 'rgba(130, 110, 90, 0.14)';
      ctxC.fillRect(0, gy, size, 1);
      ctxB.fillStyle = 'rgba(70, 70, 70, 0.18)';
      ctxB.fillRect(0, gy, size, 1);
    }
  }
  return [cColor, cBump];
}

function drawConcrete(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#f0f1f3';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#888888';
  ctxB.fillRect(0, 0, size, size);

  // Subtle architectural panel grid
  const half = size / 2;
  ctxC.strokeStyle = 'rgba(120, 128, 138, 0.25)';
  ctxC.lineWidth = 2;
  ctxC.strokeRect(1, 1, size - 2, half - 2);
  ctxC.strokeRect(1, half + 1, size - 2, half - 2);

  ctxB.strokeStyle = '#505050';
  ctxB.lineWidth = 2;
  ctxB.strokeRect(1, 1, size - 2, half - 2);
  ctxB.strokeRect(1, half + 1, size - 2, half - 2);

  for (let i = 0; i < 1600; i++) {
    const x = seededNoise(i, 7, 53) * size;
    const y = seededNoise(i, 9, 59) * size;
    const v = 226 + Math.floor(seededNoise(i, 11, 61) * 24);
    ctxC.fillStyle = `rgba(${v},${v},${v},0.45)`;
    ctxC.fillRect(x, y, 2, 2);
  }
  return [cColor, cBump];
}

function drawPanel(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  // Recessed joint base
  ctxC.fillStyle = '#a8adb3';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#303030';
  ctxB.fillRect(0, 0, size, size);

  const cols = 2;
  const rows = 2;
  const cellW = size / cols;
  const cellH = size / rows;
  const seam = 4;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * cellW + seam / 2;
      const py = r * cellH + seam / 2;
      const pw = cellW - seam;
      const ph = cellH - seam;

      const baseTone = 232 + Math.floor(seededNoise(r, c, 91) * 16);
      ctxC.fillStyle = `rgb(${baseTone},${baseTone},${baseTone})`;
      ctxC.fillRect(px, py, pw, ph);

      const bTone = 195 + Math.floor(seededNoise(r, c, 97) * 25);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`;
      ctxB.fillRect(px, py, pw, ph);

      // Subtle Soviet square ceramic/pebble-dash micro-tile grid inside each panel
      const tiles = 8;
      const tw = pw / tiles;
      const th = ph / tiles;
      for (let tr = 0; tr < tiles; tr++) {
        for (let tc = 0; tc < tiles; tc++) {
          const jitter = Math.floor(seededNoise(r * 10 + tr, c * 10 + tc, 103) * 14) - 7;
          const tv = Math.min(252, Math.max(210, baseTone + jitter));
          ctxC.fillStyle = `rgb(${tv},${tv},${tv})`;
          ctxC.fillRect(px + tc * tw + 0.5, py + tr * th + 0.5, tw - 1, th - 1);
        }
      }
    }
  }
  return [cColor, cBump];
}

function drawCurtain(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#eceff2';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#a0a0a0';
  ctxB.fillRect(0, 0, size, size);

  // Architectural aluminum cassette cladding panels (4x2 grid)
  const cols = 4;
  const rows = 2;
  const cw = size / cols;
  const ch = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tone = 232 + Math.floor(seededNoise(r, c, 121) * 16);
      ctxC.fillStyle = `rgb(${tone},${tone + 1},${tone + 3})`;
      ctxC.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);

      ctxC.strokeStyle = 'rgba(70, 80, 95, 0.35)';
      ctxC.lineWidth = 2;
      ctxC.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);

      const bTone = 175 + Math.floor(seededNoise(r, c, 127) * 20);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`;
      ctxB.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
      ctxB.strokeStyle = '#383838';
      ctxB.lineWidth = 2;
      ctxB.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
    }
  }
  return [cColor, cBump];
}

function drawBrutalist(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#dcdedf';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#888888';
  ctxB.fillRect(0, 0, size, size);

  // Heavy monolithic concrete cast-in-place panel blocks
  const cols = 2;
  const rows = 4;
  const cw = size / cols;
  const ch = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * cw;
      const py = r * ch;
      const tone = 212 + Math.floor(seededNoise(r, c, 151) * 28);
      ctxC.fillStyle = `rgb(${tone},${tone},${tone + 2})`;
      ctxC.fillRect(px + 2, py + 2, cw - 4, ch - 4);

      // Deep expansion seam
      ctxC.strokeStyle = 'rgba(45, 50, 58, 0.52)';
      ctxC.lineWidth = 3;
      ctxC.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);

      const bTone = 172 + Math.floor(seededNoise(r, c, 157) * 32);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`;
      ctxB.fillRect(px + 2, py + 2, cw - 4, ch - 4);
      ctxB.strokeStyle = '#323232';
      ctxB.lineWidth = 3;
      ctxB.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);

      // Formwork tie-rod indentations
      for (const tx of [px + 14, px + cw - 14]) {
        for (const ty of [py + 12, py + ch - 12]) {
          ctxC.fillStyle = 'rgba(60, 66, 75, 0.45)';
          ctxC.beginPath();
          ctxC.arc(tx, ty, 2.6, 0, Math.PI * 2);
          ctxC.fill();

          ctxB.fillStyle = '#383838';
          ctxB.beginPath();
          ctxB.arc(tx, ty, 2.8, 0, Math.PI * 2);
          ctxB.fill();
        }
      }
    }
  }

  // Subtle vertical rain-streak weathering & concrete aggregate grain
  for (let i = 0; i < 650; i++) {
    const x = seededNoise(i, 3, 173) * size;
    const y = seededNoise(i, 5, 179) * size;
    const h = 4 + seededNoise(i, 7, 181) * 14;
    ctxC.fillStyle = 'rgba(70, 75, 84, 0.08)';
    ctxC.fillRect(x, y, 1.5, h);
  }
  return [cColor, cBump];
}

function drawCorrugated(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#e2e0dc';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#808080';
  ctxB.fillRect(0, 0, size, size);

  // Corrugated vertical ribs with sinusoidal highlight/shadow + sheet overlap seam
  const ribs = 16;
  const ribW = size / ribs;
  for (let x = 0; x < size; x++) {
    const phase = ((x % ribW) / ribW) * Math.PI * 2;
    const wave = Math.sin(phase);
    const colVal = Math.round(218 + wave * 28);
    ctxC.fillStyle = `rgb(${colVal},${colVal - 2},${colVal - 4})`;
    ctxC.fillRect(x, 0, 1, size);

    const bumpVal = Math.round(128 + wave * 88);
    ctxB.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`;
    ctxB.fillRect(x, 0, 1, size);
  }

  // Horizontal overlapping sheet seams & rust weathering patches
  const rows = 2;
  const rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctxC.fillStyle = 'rgba(55, 45, 38, 0.42)';
    ctxC.fillRect(0, y, size, 3);
    ctxB.fillStyle = '#363636';
    ctxB.fillRect(0, y, size, 3);

    // Rust & grime streaks near sheet overlaps
    for (let i = 0; i < 42; i++) {
      const rx = seededNoise(r, i, 211) * size;
      const rw = 3 + seededNoise(r, i, 223) * 10;
      const rh = 6 + seededNoise(r, i, 227) * 26;
      ctxC.fillStyle = 'rgba(130, 82, 52, 0.22)';
      ctxC.fillRect(rx, y + 2, rw, rh);
    }
  }

  // Rivets along seams
  for (let c = 0; c < ribs; c += 2) {
    const rx = c * ribW + ribW * 0.25;
    for (let r = 0; r < rows; r++) {
      const ry = r * rowH + 6;
      ctxC.fillStyle = '#605b55';
      ctxC.fillRect(rx, ry, 2, 2);
      ctxB.fillStyle = '#e8e8e8';
      ctxB.fillRect(rx, ry, 2, 2);
    }
  }
  return [cColor, cBump];
}

function drawStandingSeam(size: number): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#eceef0';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#6e6e6e';
  ctxB.fillRect(0, 0, size, size);

  const seams = 6;
  const spacing = size / seams;
  for (let i = 0; i < seams; i++) {
    const x = i * spacing;
    ctxC.fillStyle = '#ffffff';
    ctxC.fillRect(x, 0, 3, size);
    ctxC.fillStyle = '#c4c8cc';
    ctxC.fillRect(x + 3, 0, 3, size);

    ctxB.fillStyle = '#f0f0f0';
    ctxB.fillRect(x, 0, 5, size);
    ctxB.fillStyle = '#303030';
    ctxB.fillRect(x + 5, 0, 2, size);
  }
  return [cColor, cBump];
}

function drawShinglesOrTerracotta(size: number, isTerracotta: boolean): [HTMLCanvasElement, HTMLCanvasElement] {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);

  ctxC.fillStyle = '#e8e4df';
  ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#555555';
  ctxB.fillRect(0, 0, size, size);

  const rows = isTerracotta ? 8 : 10;
  const cols = isTerracotta ? 8 : 6;
  const rowH = size / rows;
  const colW = size / cols;

  for (let r = 0; r < rows; r++) {
    const offset = isTerracotta ? 0 : (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      const tone = 220 + Math.floor(seededNoise(r, c, 73) * 32);
      ctxC.fillStyle = `rgb(${tone},${tone},${tone})`;
      ctxC.fillRect(x + 1, y + 1, colW - 2, rowH - 2);

      // Shadow line at bottom edge of shingle/tile
      ctxC.fillStyle = 'rgba(70, 65, 60, 0.25)';
      ctxC.fillRect(x, y + rowH - 2, colW, 2);

      const bTone = 140 + Math.floor(seededNoise(r, c, 79) * 55);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`;
      ctxB.fillRect(x + 1, y + 1, colW - 2, rowH - 3);
    }
  }
  return [cColor, cBump];
}

export class ProceduralTextureLibrary {
  private readonly cache = new Map<string, ProceduralTexturePair>();
  private readonly anisotropy: number;

  constructor(anisotropy: number) {
    this.anisotropy = Math.max(1, anisotropy);
  }

  getTexturePair(recipe: TextureRecipe, repeatScale: number): ProceduralTexturePair {
    const key = `${recipe}:${repeatScale}`;
    const existing = this.cache.get(key);
    if (existing) return existing;

    const size = 256;
    let canvases: [HTMLCanvasElement, HTMLCanvasElement];
    switch (recipe) {
      case 'brick':
        canvases = drawBrick(size);
        break;
      case 'timber':
        canvases = drawTimber(size);
        break;
      case 'concrete':
        canvases = drawConcrete(size);
        break;
      case 'panel':
        canvases = drawPanel(size);
        break;
      case 'curtain':
        canvases = drawCurtain(size);
        break;
      case 'brutalist':
        canvases = drawBrutalist(size);
        break;
      case 'corrugated':
        canvases = drawCorrugated(size);
        break;
      case 'standing-seam':
        canvases = drawStandingSeam(size);
        break;
      case 'shingles':
        canvases = drawShinglesOrTerracotta(size, false);
        break;
      case 'terracotta':
        canvases = drawShinglesOrTerracotta(size, true);
        break;
      case 'membrane':
      case 'stucco':
      default:
        canvases = drawStucco(size);
        break;
    }

    const pair: ProceduralTexturePair = {
      map: configureTexture(canvases[0], true, this.anisotropy, repeatScale, repeatScale),
      bumpMap: configureTexture(canvases[1], false, this.anisotropy, repeatScale, repeatScale),
    };
    this.cache.set(key, pair);
    return pair;
  }

  createContactShadowTexture(): THREE.CanvasTexture {
    const [canvas, ctx] = createCanvas(256);
    const grad = ctx.createRadialGradient(128, 128, 16, 128, 128, 124);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.42)');
    grad.addColorStop(0.6, 'rgba(15, 23, 42, 0.18)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  createCyberBillboardTexture(variant: 'magenta' | 'cyan' | 'amber'): THREE.CanvasTexture {
    const isVertical = variant === 'magenta';
    const w = isVertical ? 256 : 384;
    const h = isVertical ? 384 : 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D canvas context unavailable');

    const palette =
      variant === 'magenta'
        ? { bg: '#16091b', fg: '#ff2e88', accent: '#00e5ff', label: 'H10', sub: 'NIGHT CITY' }
        : variant === 'cyan'
          ? { bg: '#071824', fg: '#00e5ff', accent: '#ffb020', label: 'NC-2077', sub: 'WATSON // SEC-04' }
          : { bg: '#1c1406', fg: '#ffb020', accent: '#ff3b5c', label: '010', sub: 'TRANSIT BAY' };

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Outer neon frame
    ctx.strokeStyle = palette.fg;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Corner brackets & cyber stripes
    ctx.fillStyle = palette.accent;
    ctx.fillRect(22, 22, w * 0.25, 14);
    ctx.fillRect(w - 22 - w * 0.25, 22, w * 0.25, 14);
    ctx.fillRect(22, h - 36, w - 44, 12);

    // Geometric cyber emblem bars
    const barCount = isVertical ? 5 : 7;
    const barSpacing = (w - 48) / barCount;
    for (let i = 0; i < barCount; i++) {
      ctx.fillStyle = i % 2 === 0 ? palette.fg : palette.accent;
      ctx.fillRect(24 + i * barSpacing, 52, barSpacing * 0.68, 20);
    }

    // Bold megabuilding designation
    ctx.fillStyle = palette.fg;
    ctx.font = `bold ${isVertical ? 84 : 68}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(palette.label, w / 2, h * 0.48);

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${isVertical ? 24 : 22}px monospace`;
    ctx.fillText(palette.sub, w / 2, h * 0.71);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.anisotropy;
    tex.needsUpdate = true;
    return tex;
  }

  dispose(): void {
    for (const pair of this.cache.values()) {
      pair.map.dispose();
      pair.bumpMap.dispose();
    }
    this.cache.clear();
  }
}
