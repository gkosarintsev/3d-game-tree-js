import * as THREE from 'three';

/**
 * Процедурные фактуры и параметры материалов домов, портированные из docs/houses
 * (`src/engine/textures/proceduralTextures.ts`, `src/core/registries/materialsRegistry.ts`).
 *
 * Зачем порт, а не импорт: docs/houses — отдельное TS/Vite-приложение; движок — ES-модули
 * без сборщика (Three.js 0.160 через importmap), поэтому рецепты/реестры перенесены сюда
 * в рантайм-совместимом виде. Текстуры создаются в браузере (CanvasTexture) и живут до
 * выгрузки главы — библиотека кэширует пары map+bump и отдаёт их по dispose().
 */

// --------------------------------------------------------------------------- реестры

export const WALL_MATERIALS = {
  stucco:    { id: 'stucco',    name: 'Штукатурка',           recipe: 'stucco',    roughness: 0.88, metalness: 0.02, bumpScale: 0.015, repeatScale: 1.2,
    swatches: [{ label: 'Тёплый кремовый', hex: '#f0ece1' }, { label: 'Снежный', hex: '#f4f6f8' }, { label: 'Песочный', hex: '#dfd1ba' }, { label: 'Шалфей', hex: '#cfd6cb' }] },
  brick:     { id: 'brick',     name: 'Кирпич',               recipe: 'brick',     roughness: 0.85, metalness: 0.03, bumpScale: 0.035, repeatScale: 1.4,
    swatches: [{ label: 'Обожжённая глина', hex: '#a95842' }, { label: 'Баварская кладка', hex: '#7b493b' }, { label: 'Клинкер песочный', hex: '#c8ab89' }, { label: 'Графитовый кирпич', hex: '#4b4e54' }] },
  timber:    { id: 'timber',    name: 'Брус / Планкен',       recipe: 'timber',    roughness: 0.72, metalness: 0.04, bumpScale: 0.025, repeatScale: 1.1,
    swatches: [{ label: 'Лиственница', hex: '#c29568' }, { label: 'Медовый дуб', hex: '#a97748' }, { label: 'Сканди-серый', hex: '#8b8e8b' }, { label: 'Обожжённое дерево', hex: '#3b342f' }] },
  concrete:  { id: 'concrete',  name: 'Архитектурный бетон',  recipe: 'concrete',  roughness: 0.78, metalness: 0.06, bumpScale: 0.02,  repeatScale: 0.9,
    swatches: [{ label: 'Светлый бетон', hex: '#d9dde2' }, { label: 'Холодный камень', hex: '#adb5bd' }, { label: 'Тёмный сланец', hex: '#5f6770' }, { label: 'Травертин', hex: '#d5cbb8' }] },
  panel:     { id: 'panel',     name: 'ЖБ панели (СССР)',     recipe: 'panel',     roughness: 0.84, metalness: 0.03, bumpScale: 0.028, repeatScale: 1.0,
    swatches: [{ label: 'Типовой бежевый', hex: '#d6d0c4' }, { label: 'Советский голубой', hex: '#9eb5c4' }, { label: 'Мятно-зелёный', hex: '#9db6a8' }, { label: 'Охристо-жёлтый', hex: '#d4be8c' }, { label: 'Серый бетон', hex: '#b4bac0' }, { label: 'Терракота', hex: '#c5998d' }] },
  curtain:   { id: 'curtain',   name: 'Кассетный металл',     recipe: 'curtain',   roughness: 0.32, metalness: 0.74, bumpScale: 0.018, repeatScale: 1.2,
    swatches: [{ label: 'Титановый графит', hex: '#4b5563' }, { label: 'Серебро сатин', hex: '#b8c2cc' }, { label: 'Тёмная бронза', hex: '#635347' }, { label: 'Холодная сталь', hex: '#8899ab' }, { label: 'Тёплый шампань', hex: '#c9bfae' }] },
  brutalist: { id: 'brutalist', name: 'Мега-бетон',           recipe: 'brutalist', roughness: 0.86, metalness: 0.14, bumpScale: 0.036, repeatScale: 1.4,
    swatches: [{ label: 'Бетон Найт-Сити', hex: '#5c636e' }, { label: 'Тёмный базальт', hex: '#3b414b' }, { label: 'Песчаный монолит', hex: '#8b8378' }, { label: 'Сталь-графит', hex: '#495464' }, { label: 'Оксид ржавчины', hex: '#6e524b' }] },
  corrugated:{ id: 'corrugated',name: 'Гофролист / Шифер',    recipe: 'corrugated',roughness: 0.64, metalness: 0.38, bumpScale: 0.042, repeatScale: 1.5,
    swatches: [{ label: 'Бирюзовая фавела', hex: '#5a8a92' }, { label: 'Ржавый шифер', hex: '#8e5a44' }, { label: 'Оцинковка выцв.', hex: '#8d949b' }, { label: 'Охра выгоревшая', hex: '#b88a56' }, { label: 'Тёмный профлист', hex: '#484e57' }] },
};

export const ROOF_MATERIALS = {
  shingles:        { id: 'shingles',        name: 'Мягкая черепица',       recipe: 'shingles',        roughness: 0.86, metalness: 0.04, bumpScale: 0.03,  repeatScale: 1.6,
    swatches: [{ label: 'Антрацит', hex: '#2e3238' }, { label: 'Грильяж', hex: '#543d32' }, { label: 'Хвойный', hex: '#394b42' }] },
  'standing-seam': { id: 'standing-seam',   name: 'Фальцевая кровля',      recipe: 'standing-seam',   roughness: 0.34, metalness: 0.72, bumpScale: 0.022, repeatScale: 1.5,
    swatches: [{ label: 'Графит RAL 7024', hex: '#2c333a' }, { label: 'Чёрный матовый', hex: '#1e2024' }, { label: 'Оксидированный цинк', hex: '#6c757d' }, { label: 'Тёмная бронза', hex: '#4d3e36' }] },
  terracotta:      { id: 'terracotta',      name: 'Керамическая черепица', recipe: 'terracotta',      roughness: 0.68, metalness: 0.05, bumpScale: 0.04,  repeatScale: 1.6,
    swatches: [{ label: 'Терракота', hex: '#9b4a36' }, { label: 'Красная медь', hex: '#833c2a' }, { label: 'Шоколад', hex: '#4a352e' }] },
  membrane:        { id: 'membrane',        name: 'Кровельная мембрана',   recipe: 'membrane',        roughness: 0.65, metalness: 0.08, bumpScale: 0.01,  repeatScale: 1.0,
    swatches: [{ label: 'Базальт', hex: '#374151' }, { label: 'Светло-серый', hex: '#6b7280' }, { label: 'Гравийный настил', hex: '#8d8b84' }] },
};

/**
 * Соответствие фасадного материала движка/генератора (`facadeMaterial`) материалу стен
 * docs/houses (рецепт фактуры + физика) и цвету по умолчанию. Это мост между данными
 * уровня (строки вроде `panel_block`, `painted_brick`) и реестром docs/houses.
 */
export const FACADE_TO_WALL = {
  panel_block:        { wall: 'panel',     color: '#d6d0c4' },
  painted_brick:      { wall: 'brick',     color: '#a95842' },
  stone_base:         { wall: 'concrete',  color: '#adb5bd' },
  concrete:           { wall: 'concrete',  color: '#d9dde2' },
  glass_and_concrete: { wall: 'curtain',   color: '#b8c2cc' },
  glass_steel:        { wall: 'curtain',   color: '#4b5563' },
  rusted_metal:       { wall: 'corrugated',color: '#8e5a44' },
  neon_panel:         { wall: 'curtain',   color: '#8899ab' },
};

// --------------------------------------------------------------------------- canvas/texture helpers

function createCanvas(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas context unavailable');
  return [canvas, ctx];
}

function seededNoise(x, y, seed = 17) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

function configureTexture(canvas, isColorMap, anisotropy, repeatX = 2, repeatY = 2) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = anisotropy;
  if (isColorMap) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// --------------------------------------------------------------------------- рецепты (порт docs/houses)

function drawStucco(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#f8f8f6'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#808080'; ctxB.fillRect(0, 0, size, size);
  for (let i = 0; i < 2400; i++) {
    const x = seededNoise(i, 1, 3) * size;
    const y = seededNoise(i, 2, 7) * size;
    const r = 1 + seededNoise(i, 3, 11) * 2.5;
    const v = 232 + Math.floor(seededNoise(i, 4, 13) * 22);
    ctxC.fillStyle = `rgb(${v},${v},${v})`; ctxC.fillRect(x, y, r, r);
    const bv = 108 + Math.floor(seededNoise(i, 5, 19) * 44);
    ctxB.fillStyle = `rgb(${bv},${bv},${bv})`; ctxB.fillRect(x, y, r, r);
  }
  return [cColor, cBump];
}

function drawBrick(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#dad6ce'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#484848'; ctxB.fillRect(0, 0, size, size);
  const rows = 8, cols = 4, rowH = size / rows, colW = size / cols, mortar = 3;
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? colW / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      const bx = c * colW + offset + mortar / 2;
      const by = r * rowH + mortar / 2;
      const bw = colW - mortar, bh = rowH - mortar;
      const tone = 224 + Math.floor(seededNoise(r, c, 23) * 28);
      ctxC.fillStyle = `rgb(${tone},${tone - 4},${tone - 6})`; ctxC.fillRect(bx, by, bw, bh);
      const bTone = 175 + Math.floor(seededNoise(r, c, 29) * 45);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`; ctxB.fillRect(bx, by, bw, bh);
    }
  }
  return [cColor, cBump];
}

function drawTimber(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#f2efe9'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#a0a0a0'; ctxB.fillRect(0, 0, size, size);
  const planks = 8, plankH = size / planks;
  for (let p = 0; p < planks; p++) {
    const y = p * plankH;
    const tone = 228 + Math.floor(seededNoise(p, 2, 31) * 24);
    ctxC.fillStyle = `rgb(${tone},${tone - 2},${tone - 5})`; ctxC.fillRect(0, y, size, plankH - 2);
    ctxC.fillStyle = '#b9b2a8'; ctxC.fillRect(0, y + plankH - 2, size, 2);
    ctxB.fillStyle = '#c8c8c8'; ctxB.fillRect(0, y, size, plankH - 2);
    ctxB.fillStyle = '#383838'; ctxB.fillRect(0, y + plankH - 2, size, 2);
    for (let g = 0; g < 18; g++) {
      const gy = y + seededNoise(p, g, 41) * (plankH - 4);
      ctxC.fillStyle = 'rgba(130, 110, 90, 0.14)'; ctxC.fillRect(0, gy, size, 1);
      ctxB.fillStyle = 'rgba(70, 70, 70, 0.18)'; ctxB.fillRect(0, gy, size, 1);
    }
  }
  return [cColor, cBump];
}

function drawConcrete(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#f0f1f3'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#888888'; ctxB.fillRect(0, 0, size, size);
  const half = size / 2;
  ctxC.strokeStyle = 'rgba(120, 128, 138, 0.25)'; ctxC.lineWidth = 2;
  ctxC.strokeRect(1, 1, size - 2, half - 2); ctxC.strokeRect(1, half + 1, size - 2, half - 2);
  ctxB.strokeStyle = '#505050'; ctxB.lineWidth = 2;
  ctxB.strokeRect(1, 1, size - 2, half - 2); ctxB.strokeRect(1, half + 1, size - 2, half - 2);
  for (let i = 0; i < 1600; i++) {
    const x = seededNoise(i, 7, 53) * size, y = seededNoise(i, 9, 59) * size;
    const v = 226 + Math.floor(seededNoise(i, 11, 61) * 24);
    ctxC.fillStyle = `rgba(${v},${v},${v},0.45)`; ctxC.fillRect(x, y, 2, 2);
  }
  return [cColor, cBump];
}

function drawPanel(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#a8adb3'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#303030'; ctxB.fillRect(0, 0, size, size);
  const cols = 2, rows = 2, cellW = size / cols, cellH = size / rows, seam = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * cellW + seam / 2, py = r * cellH + seam / 2;
      const pw = cellW - seam, ph = cellH - seam;
      const baseTone = 232 + Math.floor(seededNoise(r, c, 91) * 16);
      ctxC.fillStyle = `rgb(${baseTone},${baseTone},${baseTone})`; ctxC.fillRect(px, py, pw, ph);
      const bTone = 195 + Math.floor(seededNoise(r, c, 97) * 25);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`; ctxB.fillRect(px, py, pw, ph);
      const tiles = 8, tw = pw / tiles, th = ph / tiles;
      for (let tr = 0; tr < tiles; tr++) {
        for (let tc = 0; tc < tiles; tc++) {
          const jitter = Math.floor(seededNoise(r * 10 + tr, c * 10 + tc, 103) * 14) - 7;
          const tv = Math.min(252, Math.max(210, baseTone + jitter));
          ctxC.fillStyle = `rgb(${tv},${tv},${tv})`; ctxC.fillRect(px + tc * tw + 0.5, py + tr * th + 0.5, tw - 1, th - 1);
        }
      }
    }
  }
  return [cColor, cBump];
}

function drawCurtain(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#eceff2'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#a0a0a0'; ctxB.fillRect(0, 0, size, size);
  const cols = 4, rows = 2, cw = size / cols, ch = size / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tone = 232 + Math.floor(seededNoise(r, c, 121) * 16);
      ctxC.fillStyle = `rgb(${tone},${tone + 1},${tone + 3})`; ctxC.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
      ctxC.strokeStyle = 'rgba(70, 80, 95, 0.35)'; ctxC.lineWidth = 2; ctxC.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
      const bTone = 175 + Math.floor(seededNoise(r, c, 127) * 20);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`; ctxB.fillRect(c * cw + 2, r * ch + 2, cw - 4, ch - 4);
      ctxB.strokeStyle = '#383838'; ctxB.lineWidth = 2; ctxB.strokeRect(c * cw + 1, r * ch + 1, cw - 2, ch - 2);
    }
  }
  return [cColor, cBump];
}

function drawBrutalist(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#dcdedf'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#888888'; ctxB.fillRect(0, 0, size, size);
  const cols = 2, rows = 4, cw = size / cols, ch = size / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const px = c * cw, py = r * ch;
      const tone = 212 + Math.floor(seededNoise(r, c, 151) * 28);
      ctxC.fillStyle = `rgb(${tone},${tone},${tone + 2})`; ctxC.fillRect(px + 2, py + 2, cw - 4, ch - 4);
      ctxC.strokeStyle = 'rgba(45, 50, 58, 0.52)'; ctxC.lineWidth = 3; ctxC.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
      const bTone = 172 + Math.floor(seededNoise(r, c, 157) * 32);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`; ctxB.fillRect(px + 2, py + 2, cw - 4, ch - 4);
      ctxB.strokeStyle = '#323232'; ctxB.lineWidth = 3; ctxB.strokeRect(px + 1.5, py + 1.5, cw - 3, ch - 3);
      for (const tx of [px + 14, px + cw - 14]) {
        for (const ty of [py + 12, py + ch - 12]) {
          ctxC.fillStyle = 'rgba(60, 66, 75, 0.45)'; ctxC.beginPath(); ctxC.arc(tx, ty, 2.6, 0, Math.PI * 2); ctxC.fill();
          ctxB.fillStyle = '#383838'; ctxB.beginPath(); ctxB.arc(tx, ty, 2.8, 0, Math.PI * 2); ctxB.fill();
        }
      }
    }
  }
  for (let i = 0; i < 650; i++) {
    const x = seededNoise(i, 3, 173) * size, y = seededNoise(i, 5, 179) * size;
    const h = 4 + seededNoise(i, 7, 181) * 14;
    ctxC.fillStyle = 'rgba(70, 75, 84, 0.08)'; ctxC.fillRect(x, y, 1.5, h);
  }
  return [cColor, cBump];
}

function drawCorrugated(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#e2e0dc'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#808080'; ctxB.fillRect(0, 0, size, size);
  const ribs = 16, ribW = size / ribs;
  for (let x = 0; x < size; x++) {
    const phase = ((x % ribW) / ribW) * Math.PI * 2;
    const wave = Math.sin(phase);
    const colVal = Math.round(218 + wave * 28);
    ctxC.fillStyle = `rgb(${colVal},${colVal - 2},${colVal - 4})`; ctxC.fillRect(x, 0, 1, size);
    const bumpVal = Math.round(128 + wave * 88);
    ctxB.fillStyle = `rgb(${bumpVal},${bumpVal},${bumpVal})`; ctxB.fillRect(x, 0, 1, size);
  }
  const rows = 2, rowH = size / rows;
  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    ctxC.fillStyle = 'rgba(55, 45, 38, 0.42)'; ctxC.fillRect(0, y, size, 3);
    ctxB.fillStyle = '#363636'; ctxB.fillRect(0, y, size, 3);
    for (let i = 0; i < 42; i++) {
      const rx = seededNoise(r, i, 211) * size, rw = 3 + seededNoise(r, i, 223) * 10, rh = 6 + seededNoise(r, i, 227) * 26;
      ctxC.fillStyle = 'rgba(130, 82, 52, 0.22)'; ctxC.fillRect(rx, y + 2, rw, rh);
    }
  }
  for (let c = 0; c < ribs; c += 2) {
    const rx = c * ribW + ribW * 0.25;
    for (let r = 0; r < rows; r++) {
      const ry = r * rowH + 6;
      ctxC.fillStyle = '#605b55'; ctxC.fillRect(rx, ry, 2, 2);
      ctxB.fillStyle = '#e8e8e8'; ctxB.fillRect(rx, ry, 2, 2);
    }
  }
  return [cColor, cBump];
}

function drawStandingSeam(size) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#eceef0'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#6e6e6e'; ctxB.fillRect(0, 0, size, size);
  const seams = 6, spacing = size / seams;
  for (let i = 0; i < seams; i++) {
    const x = i * spacing;
    ctxC.fillStyle = '#ffffff'; ctxC.fillRect(x, 0, 3, size);
    ctxC.fillStyle = '#c4c8cc'; ctxC.fillRect(x + 3, 0, 3, size);
    ctxB.fillStyle = '#f0f0f0'; ctxB.fillRect(x, 0, 5, size);
    ctxB.fillStyle = '#303030'; ctxB.fillRect(x + 5, 0, 2, size);
  }
  return [cColor, cBump];
}

function drawShinglesOrTerracotta(size, isTerracotta) {
  const [cColor, ctxC] = createCanvas(size);
  const [cBump, ctxB] = createCanvas(size);
  ctxC.fillStyle = '#e8e4df'; ctxC.fillRect(0, 0, size, size);
  ctxB.fillStyle = '#555555'; ctxB.fillRect(0, 0, size, size);
  const rows = isTerracotta ? 8 : 10, cols = isTerracotta ? 8 : 6;
  const rowH = size / rows, colW = size / cols;
  for (let r = 0; r < rows; r++) {
    const offset = isTerracotta ? 0 : (r % 2) * (colW * 0.5);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset, y = r * rowH;
      const tone = 220 + Math.floor(seededNoise(r, c, 73) * 32);
      ctxC.fillStyle = `rgb(${tone},${tone},${tone})`; ctxC.fillRect(x + 1, y + 1, colW - 2, rowH - 2);
      ctxC.fillStyle = 'rgba(70, 65, 60, 0.25)'; ctxC.fillRect(x, y + rowH - 2, colW, 2);
      const bTone = 140 + Math.floor(seededNoise(r, c, 79) * 55);
      ctxB.fillStyle = `rgb(${bTone},${bTone},${bTone})`; ctxB.fillRect(x + 1, y + 1, colW - 2, rowH - 3);
    }
  }
  return [cColor, cBump];
}

const DRAWERS = {
  brick: drawBrick, timber: drawTimber, concrete: drawConcrete, panel: drawPanel,
  curtain: drawCurtain, brutalist: drawBrutalist, corrugated: drawCorrugated,
  'standing-seam': drawStandingSeam,
  shingles: s => drawShinglesOrTerracotta(s, false),
  terracotta: s => drawShinglesOrTerracotta(s, true),
  stucco: drawStucco, membrane: drawStucco,
};

/**
 * Библиотека процедурных текстур (кэш map+bump по recipe+repeat). Живёт на главу и
 * отдаётся при `dispose()` вместе с текстурами — иначе `renderer.info.memory` растёт.
 */
export class HouseTextureLibrary {
  constructor(anisotropy = 4) {
    this.anisotropy = Math.max(1, anisotropy);
    this.cache = new Map();
  }
  getPair(recipe, repeatScale) {
    const key = `${recipe}:${repeatScale}`;
    const ex = this.cache.get(key);
    if (ex) return ex;
    const draw = DRAWERS[recipe] || drawStucco;
    const [c, b] = draw(256);
    const pair = {
      map: configureTexture(c, true, this.anisotropy, repeatScale, repeatScale),
      bumpMap: configureTexture(b, false, this.anisotropy, repeatScale, repeatScale),
    };
    this.cache.set(key, pair);
    return pair;
  }
  dispose() {
    for (const p of this.cache.values()) { p.map.dispose(); p.bumpMap.dispose(); }
    this.cache.clear();
  }
}

/**
 * Материал стены по фасадному ключу движка. Поддерживает суффикс `::#hex` для
 * per-building цвета (рандомизация по свотчам docs/houses) при том же рецепте.
 *
 * @returns {{material: THREE.MeshStandardMaterial, textured: boolean}}
 */
export function makeFacadeMaterial(facadeKey, texLib, fallbackColor = 0xc3c8d0) {
  const [facadeMaterial, colorOverride] = String(facadeKey || '').split('::');
  const map = FACADE_TO_WALL[facadeMaterial];
  if (!map || !texLib) {
    const m = new THREE.MeshStandardMaterial({ color: fallbackColor, roughness: 0.85, metalness: 0.05 });
    return { material: m, textured: false };
  }
  const spec = WALL_MATERIALS[map.wall];
  const pair = texLib.getPair(spec.recipe, spec.repeatScale);
  const color = colorOverride || map.color;
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    map: pair.map,
    bumpMap: pair.bumpMap,
    bumpScale: spec.bumpScale,
    roughness: spec.roughness,
    metalness: spec.metalness,
  });
  return { material: m, textured: true };
}
