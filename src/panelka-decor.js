import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Декоративные элементы панельных домов (docs/houses, soviet-panel): балконы,
 * межэтажные швы и карнизный пояс. Только картинка — без solids/blockers/навигации
 * (AGENTS.md о декоре). Геометрия батчится по материалам в один меш на группу,
 * чтобы не плодить объекты на дом.
 */

const boxGeo = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);

function push(geos, key, geo) {
  if (!geos[key]) geos[key] = [];
  geos[key].push(geo);
}

/** Дет. seed по адресу дома/элемента: без смещения ночного ритма соседей. */
function hash32(h) { return Math.imul(h ^ (h >>> 16), 2246822507) >>> 0; }
function seedOf(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rnd01(h) { return (hash32(h) >>> 0) / 4294967296; }

/**
 * Направление «наружу» для фасадной стены в осях дома: по короткой оси полосы
 * стены, в сторону от центра плана здания.
 */
function outwardSign(b, w) {
  if (w.axis === 'x') {
    const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
    return (w.minZ + w.maxZ) / 2 > cz ? 1 : -1;
  }
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  return (w.minX + w.maxX) / 2 > cx ? 1 : -1;
}

/** Балкон: плита, экран-парапет, боковины и металлические ограждения (по образцу soviet-panel). */
function addBalcony(geos, mats, cx, cy, wallCoord, axis, dir, w, d, floorH) {
  const slabH = 0.13;
  const railH = 0.92;
  const screenH = Math.min(0.78, floorH * 0.28);
  // ось вдоль фасада = другая; выступ в dir
  if (axis === 'x') {
    // стена вдоль X (нормаль ±Z = dir), центр по X = cx, стена на wallCoord (Z)
    const centerZ = wallCoord + dir * (d / 2);
    const frontZ = wallCoord + dir * (d - 0.05);
    push(geos, 'concrete', boxGeo(w, slabH, d, cx, cy - slabH / 2, centerZ));
    const screenY = cy + 0.12 + screenH / 2;
    push(geos, 'panel', boxGeo(w, screenH, 0.09, cx, screenY, frontZ));
    push(geos, 'concrete', boxGeo(0.08, screenH, d - 0.08, cx - w / 2 + 0.04, screenY, centerZ));
    push(geos, 'concrete', boxGeo(0.08, screenH, d - 0.08, cx + w / 2 - 0.04, screenY, centerZ));
    push(geos, 'metal', boxGeo(w + 0.04, 0.05, 0.09, cx, cy + railH, frontZ));
    push(geos, 'metal', boxGeo(0.06, 0.05, d, cx - w / 2 + 0.04, cy + railH, centerZ));
    push(geos, 'metal', boxGeo(0.06, 0.05, d, cx + w / 2 - 0.04, cy + railH, centerZ));
    push(geos, 'metal', boxGeo(0.05, railH, 0.05, cx - w / 2 + 0.04, cy + railH / 2, frontZ));
    push(geos, 'metal', boxGeo(0.05, railH, 0.05, cx + w / 2 - 0.04, cy + railH / 2, frontZ));
  } else {
    // стена вдоль Z (нормаль ±X = dir), центр по Z = cx(param), стена на wallCoord (X)
    const centerX = wallCoord + dir * (d / 2);
    const frontX = wallCoord + dir * (d - 0.05);
    const cz = cx; // здесь cx — координата вдоль фасада (Z)
    push(geos, 'concrete', boxGeo(d, slabH, w, centerX, cy - slabH / 2, cz));
    const screenY = cy + 0.12 + screenH / 2;
    push(geos, 'panel', boxGeo(0.09, screenH, w, frontX, screenY, cz));
    push(geos, 'concrete', boxGeo(d - 0.08, screenH, 0.08, centerX, screenY, cz - w / 2 + 0.04));
    push(geos, 'concrete', boxGeo(d - 0.08, screenH, 0.08, centerX, screenY, cz + w / 2 - 0.04));
    push(geos, 'metal', boxGeo(0.09, 0.05, w + 0.04, frontX, cy + railH, cz));
    push(geos, 'metal', boxGeo(d, 0.05, 0.06, centerX, cy + railH, cz - w / 2 + 0.04));
    push(geos, 'metal', boxGeo(d, 0.05, 0.06, centerX, cy + railH, cz + w / 2 - 0.04));
    push(geos, 'metal', boxGeo(0.05, railH, 0.05, frontX, cy + railH / 2, cz - w / 2 + 0.04));
    push(geos, 'metal', boxGeo(0.05, railH, 0.05, frontX, cy + railH / 2, cz + w / 2 - 0.04));
  }
}

/**
 * Собирает декоративные меши для панелек. Возвращает массив мешей (добавить в сцену,
 * записать в objs; геометрию и не-shared материалы отдаёт dispose карты).
 */
export function buildPanelkaDecor(scene, buildings, panelMatColor = 0xd6d0c4) {
  const geos = { concrete: [], metal: [], panel: [] };
  let count = 0;
  for (const b of buildings) {
    const isPanelka = b.houseKind === 'panelka' || b.facadeMaterial === 'panel_block';
    if (!isPanelka || !b.walls || b.floorsCount < 2) continue;
    const h = hash32(seedOf(b.id));
    const floorH = b.floorHeight || 2.8;
    // Фасадные стены, годные для балконов (достаточно длинные)
    const facades = b.walls.filter(w => w.facade);
    for (const w of facades) {
      const dir = outwardSign(b, w);
      const alongLen = w.axis === 'x' ? (w.maxX - w.minX) : (w.maxZ - w.minZ);
      if (alongLen < 6) continue;
      const wallCoord = w.axis === 'x' ? ((dir > 0 ? w.maxZ : w.minZ)) : ((dir > 0 ? w.maxX : w.minX));
      const alongMin = w.axis === 'x' ? w.minX : w.minZ;
      const alongMax = w.axis === 'x' ? w.maxX : w.maxZ;
      // Шаг/ширина балконов по образцу панельки: несколько секций вдоль фасада
      const bay = 3.2;
      const balW = 2.3;
      const balD = 1.05;
      const nBays = Math.max(1, Math.floor(alongLen / bay));
      const start = (alongMin + alongMax) / 2 - (nBays * bay) / 2 + bay / 2;
      // Паттерн балконов детерминирован по дому и фасаду (не все ячейки, чтобы было живее)
      const faceSeed = hash32(h ^ Math.round(wallCoord * 10) ^ (w.axis === 'x' ? 1 : 2));
      for (let bi = 0; bi < nBays; bi++) {
        const cx = start + bi * bay;
        // на длинных фасадах ставим балконы чаще (панельный ритм), на торцах реже
        const prob = alongLen > 20 ? 0.65 : alongLen > 12 ? 0.5 : 0.35;
        if (rnd01(faceSeed ^ (bi * 101)) > prob) continue;
        // балконы со 2-го этажа и выше (f=1..floorsCount-1)
        for (let f = 1; f < b.floorsCount; f++) {
          // редкие пропуски для разнообразия
          if (rnd01(faceSeed ^ (bi * 101) ^ (f * 997)) < 0.08) continue;
          const cy = b.baseY + f * floorH;
          addBalcony(geos, null, cx, cy, wallCoord, w.axis, dir, balW, balD, floorH);
          count++;
        }
      }
    }
    // Межэтажные швы-пояса (горизонтальные линии панелей)
    const bw = b.bounds.maxX - b.bounds.minX;
    const bd = b.bounds.maxZ - b.bounds.minZ;
    const cxB = (b.bounds.minX + b.bounds.maxX) / 2;
    const czB = (b.bounds.minZ + b.bounds.maxZ) / 2;
    for (let f = 1; f < b.floorsCount; f++) {
      const y = b.baseY + f * floorH;
      push(geos, 'concrete', boxGeo(bw + 0.06, 0.045, bd + 0.06, cxB, y, czB));
    }
    // Верхний карниз/фриз под кровлей
    push(geos, 'concrete', boxGeo(bw + 0.18, 0.12, bd + 0.18, cxB, b.roofY - 0.04, czB));
  }

  if (!count) return [];
  const mats = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.88, metalness: 0.04 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x4a5563, roughness: 0.55, metalness: 0.45 }),
    panel: new THREE.MeshStandardMaterial({ color: panelMatColor, roughness: 0.84, metalness: 0.03 }),
  };
  const out = [];
  for (const [key, list] of Object.entries(geos)) {
    if (!list.length) continue;
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, mats[key]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.panelkaDecor = true;
    scene.add(mesh);
    out.push(mesh);
  }
  return out;
}
