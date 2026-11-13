import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/**
 * Декоративные элементы панельных домов (по образцу docs/houses soviet-panel):
 * балконы, подъездные группы (козырёк/дверь/ступени), лестничные/цокольные
 * акценты, водостоки, межэтажные швы, карниз и техобъёмы на кровле.
 * Только визуал — без solids/blockers/навигации (AGENTS.md о декоре).
 * Геометрия батчится по материалам.
 */

const boxGeo = (w, h, d, x, y, z) => new THREE.BoxGeometry(w, h, d).translate(x, y, z);
const cylGeo = (r, h, x, y, z, segs = 8) => new THREE.CylinderGeometry(r, r, h, segs).translate(x, y, z);

function push(geos, key, geo) {
  if (!geos[key]) geos[key] = [];
  geos[key].push(geo);
}

function hash32(h) { return Math.imul(h ^ (h >>> 16), 2246822507) >>> 0; }
function seedOf(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
function rnd01(h) { return (hash32(h) >>> 0) / 4294967296; }

/** Наружная нормаль фасадной стены относительно центра плана. */
function outwardSign(b, w) {
  if (w.axis === 'x') {
    const cz = (b.bounds.minZ + b.bounds.maxZ) / 2;
    return (w.minZ + w.maxZ) / 2 > cz ? 1 : -1;
  }
  const cx = (b.bounds.minX + b.bounds.maxX) / 2;
  return (w.minX + w.maxX) / 2 > cx ? 1 : -1;
}

/** Балкон: плита, экран-парапет, боковины и металлические ограждения. */
function addBalcony(geos, cx, cy, wallCoord, axis, dir, w, d, floorH) {
  const slabH = 0.13;
  const railH = 0.92;
  const screenH = Math.min(0.78, floorH * 0.28);
  if (axis === 'x') {
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
    const centerX = wallCoord + dir * (d / 2);
    const frontX = wallCoord + dir * (d - 0.05);
    const cz = cx;
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

/** Подъездная группа: площадка, ступени, дверь, рама, козырёк (визуал). */
function addEntrance(geos, ax, baseY, floorH, wallCoord, axis, dir) {
  const doorW = 1.3, doorH = Math.min(2.15, floorH - 0.35);
  const stoopW = 2.4, stoopD = 1.2, stoopH = 0.38;
  const stepH = 0.16, stepD = 0.28;
  if (axis === 'x') {
    const z0 = wallCoord;
    const out = dir;
    const cz = z0 + out * (stoopD / 2 + 0.02);
    push(geos, 'concrete', boxGeo(stoopW, stoopH, stoopD, ax, baseY + stoopH / 2, cz));
    for (let s = 0; s < 2; s++) {
      const sh = stepH * (2 - s);
      push(geos, 'concrete', boxGeo(stoopW * 0.9, sh, stepD, ax, baseY + sh / 2, z0 + out * (stoopD + stepD * (s + 0.5) + 0.02)));
    }
    const fz = z0 + out * 0.03;
    push(geos, 'door', boxGeo(doorW, doorH, 0.08, ax, baseY + stoopH + doorH / 2, fz));
    push(geos, 'metal', boxGeo(doorW + 0.18, 0.09, 0.12, ax, baseY + stoopH + doorH + 0.045, fz));
    push(geos, 'metal', boxGeo(0.09, doorH, 0.12, ax - doorW / 2 - 0.045, baseY + stoopH + doorH / 2, fz));
    push(geos, 'metal', boxGeo(0.09, doorH, 0.12, ax + doorW / 2 + 0.045, baseY + stoopH + doorH / 2, fz));
    const canopyY = baseY + stoopH + doorH + 0.22;
    push(geos, 'concrete', boxGeo(2.7, 0.12, 1.25, ax, canopyY, z0 + out * 0.65));
    push(geos, 'concrete', boxGeo(0.1, 0.55, 1.0, ax - 1.25, canopyY - 0.28, z0 + out * 0.55));
    push(geos, 'concrete', boxGeo(0.1, 0.55, 1.0, ax + 1.25, canopyY - 0.28, z0 + out * 0.55));
  } else {
    const x0 = wallCoord;
    const out = dir;
    const cx = x0 + out * (stoopD / 2 + 0.02);
    push(geos, 'concrete', boxGeo(stoopD, stoopH, stoopW, cx, baseY + stoopH / 2, ax));
    for (let s = 0; s < 2; s++) {
      const sh = stepH * (2 - s);
      push(geos, 'concrete', boxGeo(stepD, sh, stoopW * 0.9, x0 + out * (stoopD + stepD * (s + 0.5) + 0.02), baseY + sh / 2, ax));
    }
    const fx = x0 + out * 0.03;
    push(geos, 'door', boxGeo(0.08, doorH, doorW, fx, baseY + stoopH + doorH / 2, ax));
    push(geos, 'metal', boxGeo(0.12, 0.09, doorW + 0.18, fx, baseY + stoopH + doorH + 0.045, ax));
    push(geos, 'metal', boxGeo(0.12, doorH, 0.09, fx, baseY + stoopH + doorH / 2, ax - doorW / 2 - 0.045));
    push(geos, 'metal', boxGeo(0.12, doorH, 0.09, fx, baseY + stoopH + doorH / 2, ax + doorW / 2 + 0.045));
    const canopyY = baseY + stoopH + doorH + 0.22;
    push(geos, 'concrete', boxGeo(1.25, 0.12, 2.7, x0 + out * 0.65, canopyY, ax));
    push(geos, 'concrete', boxGeo(1.0, 0.55, 0.1, x0 + out * 0.55, canopyY - 0.28, ax - 1.25));
    push(geos, 'concrete', boxGeo(1.0, 0.55, 0.1, x0 + out * 0.55, canopyY - 0.28, ax + 1.25));
  }
}

export function buildPanelkaDecor(scene, buildings, panelMatColor = 0xd6d0c4) {
  const geos = { concrete: [], metal: [], panel: [], door: [], dark: [] };
  let count = 0;
  for (const b of buildings) {
    const isPanelka = b.houseKind === 'panelka' || b.facadeMaterial === 'panel_block';
    if (!isPanelka || !b.walls || b.floorsCount < 2) continue;
    const h = hash32(seedOf(b.id));
    const floorH = b.floorHeight || 2.8;
    const bw = b.bounds.maxX - b.bounds.minX;
    const bd = b.bounds.maxZ - b.bounds.minZ;
    const cxB = (b.bounds.minX + b.bounds.maxX) / 2;
    const czB = (b.bounds.minZ + b.bounds.maxZ) / 2;
    const facades = b.walls.filter(w => w.facade);
    if (!facades.length) continue;

    // Выбор «главного» длинного фасада для подъездов
    let main = facades[0];
    for (const w of facades) {
      const l = w.axis === 'x' ? (w.maxX - w.minX) : (w.maxZ - w.minZ);
      const lm = main.axis === 'x' ? (main.maxX - main.minX) : (main.maxZ - main.minZ);
      if (l > lm) main = w;
    }
    const mainDir = outwardSign(b, main);
    const mainLen = main.axis === 'x' ? (main.maxX - main.minX) : (main.maxZ - main.minZ);
    const mainWallCoord = main.axis === 'x' ? (mainDir > 0 ? main.maxZ : main.minZ) : (mainDir > 0 ? main.maxX : main.minX);
    const mainMin = main.axis === 'x' ? main.minX : main.minZ;
    const mainMax = main.axis === 'x' ? main.maxX : main.maxZ;

    // Подъезды вдоль главного фасада (параметр дома, рандомизируемый; fallback по длине)
    let entrances = Number.isFinite(b.entrances) ? Math.max(1, Math.round(b.entrances)) : Math.max(1, Math.min(4, Math.round(mainLen / 13)));
    entrances = Math.max(1, Math.min(entrances, Math.max(1, Math.floor(mainLen / 6))));
    for (let e = 0; e < entrances; e++) {
      const t = (e + 0.5) / entrances;
      const ax = mainMin + (mainMax - mainMin) * t;
      addEntrance(geos, ax, b.baseY, floorH, mainWallCoord, main.axis, mainDir);
      count++;
      // Вертикальные пилоны лестничной клетки над подъездом
      const totalWallH = b.roofY - b.baseY;
      if (main.axis === 'x') {
        const fz = mainWallCoord + mainDir * 0.03;
        push(geos, 'metal', boxGeo(0.12, totalWallH, 0.08, ax - 0.85, b.baseY + totalWallH / 2, fz));
        push(geos, 'metal', boxGeo(0.12, totalWallH, 0.08, ax + 0.85, b.baseY + totalWallH / 2, fz));
        // Лестничные площадочные окна (прямоугольные вставки)
        for (let f = 0; f < b.floorsCount - 1; f++) {
          const wy = b.baseY + (f + 0.9) * floorH;
          push(geos, 'dark', boxGeo(1.1, Math.min(1.35, floorH * 0.48), 0.05, ax, wy, fz));
        }
      } else {
        const fx = mainWallCoord + mainDir * 0.03;
        push(geos, 'metal', boxGeo(0.08, totalWallH, 0.12, fx, b.baseY + totalWallH / 2, ax - 0.85));
        push(geos, 'metal', boxGeo(0.08, totalWallH, 0.12, fx, b.baseY + totalWallH / 2, ax + 0.85));
        for (let f = 0; f < b.floorsCount - 1; f++) {
          const wy = b.baseY + (f + 0.9) * floorH;
          push(geos, 'dark', boxGeo(0.05, Math.min(1.35, floorH * 0.48), 1.1, fx, wy, ax));
        }
      }
    }

    // Балконы на фасадах
    for (const w of facades) {
      const dir = outwardSign(b, w);
      const alongLen = w.axis === 'x' ? (w.maxX - w.minX) : (w.maxZ - w.minZ);
      if (alongLen < 6) continue;
      const wallCoord = w.axis === 'x' ? (dir > 0 ? w.maxZ : w.minZ) : (dir > 0 ? w.maxX : w.minX);
      const alongMin = w.axis === 'x' ? w.minX : w.minZ;
      const alongMax = w.axis === 'x' ? w.maxX : w.maxZ;
      const bay = 3.1, balW = 2.35, balD = 1.05;
      const nBays = Math.max(1, Math.floor(alongLen / bay));
      const start = (alongMin + alongMax) / 2 - (nBays * bay) / 2 + bay / 2;
      const faceSeed = hash32(h ^ Math.round(wallCoord * 10) ^ (w.axis === 'x' ? 1 : 2));
      for (let bi = 0; bi < nBays; bi++) {
        const ax = start + bi * bay;
        // не ставим балкон прямо на подъездную зону главного фасада
        let nearEntrance = false;
        if (w === main) {
          for (let e = 0; e < entrances; e++) {
            const t = (e + 0.5) / entrances;
            const ex = mainMin + (mainMax - mainMin) * t;
            if (Math.abs(ax - ex) < 2.0) { nearEntrance = true; break; }
          }
        }
        if (nearEntrance) continue;
        const prob = alongLen > 18 ? 0.6 : alongLen > 10 ? 0.45 : 0.3;
        if (rnd01(faceSeed ^ (bi * 101)) > prob) continue;
        for (let f = 1; f < b.floorsCount; f++) {
          if (rnd01(faceSeed ^ (bi * 101) ^ (f * 997)) < 0.1) continue;
          addBalcony(geos, ax, b.baseY + f * floorH, wallCoord, w.axis, dir, balW, balD, floorH);
          count++;
        }
      }
      // Водосточные трубы на торцах длинного фасада
      if (alongLen > 12) {
        const p1 = alongMin + 0.5, p2 = alongMax - 0.5;
        for (const p of [p1, p2]) {
          if (w.axis === 'x') {
            push(geos, 'metal', cylGeo(0.06, b.roofY - b.baseY, p, (b.baseY + b.roofY) / 2, wallCoord + dir * 0.08));
          } else {
            push(geos, 'metal', cylGeo(0.06, b.roofY - b.baseY, wallCoord + dir * 0.08, (b.baseY + b.roofY) / 2, p));
          }
        }
      }
    }

    // Межэтажные швы-пояса и цокольный выступ
    push(geos, 'concrete', boxGeo(bw + 0.12, 0.08, bd + 0.12, cxB, b.baseY + 0.04, czB));
    for (let f = 1; f < b.floorsCount; f++) {
      const y = b.baseY + f * floorH;
      push(geos, 'concrete', boxGeo(bw + 0.06, 0.045, bd + 0.06, cxB, y, czB));
    }
    // Верхний карниз/фриз
    push(geos, 'concrete', boxGeo(bw + 0.22, 0.14, bd + 0.22, cxB, b.roofY - 0.05, czB));
    // Парапет кровли (обрамление)
    const ph = 0.55, pt = 0.18;
    push(geos, 'panel', boxGeo(bw, ph, pt, cxB, b.roofY + ph / 2, b.bounds.maxZ - pt / 2));
    push(geos, 'panel', boxGeo(bw, ph, pt, cxB, b.roofY + ph / 2, b.bounds.minZ + pt / 2));
    push(geos, 'panel', boxGeo(pt, ph, bd - pt * 2, b.bounds.minX + pt / 2, b.roofY + ph / 2, czB));
    push(geos, 'panel', boxGeo(pt, ph, bd - pt * 2, b.bounds.maxX - pt / 2, b.roofY + ph / 2, czB));
    push(geos, 'metal', boxGeo(bw + 0.06, 0.05, pt + 0.06, cxB, b.roofY + ph + 0.025, b.bounds.maxZ - pt / 2));
    push(geos, 'metal', boxGeo(bw + 0.06, 0.05, pt + 0.06, cxB, b.roofY + ph + 0.025, b.bounds.minZ + pt / 2));

    // Техобъём/машинное отделение на кровле (характерный элемент панельки)
    const liftW = Math.min(3.2, bw * 0.35), liftD = Math.min(2.6, bd * 0.45), liftH = b.floorsCount >= 7 ? 2.4 : 2.0;
    const lx = cxB + (rnd01(h ^ 7) - 0.5) * Math.max(0, bw * 0.2);
    const lz = czB + (rnd01(h ^ 11) - 0.5) * Math.max(0, bd * 0.15);
    push(geos, 'panel', boxGeo(liftW, liftH, liftD, lx, b.roofY + liftH / 2, lz));
    push(geos, 'concrete', boxGeo(liftW + 0.2, 0.12, liftD + 0.2, lx, b.roofY + liftH + 0.06, lz));
    push(geos, 'door', boxGeo(0.8, 1.6, 0.06, lx, b.roofY + 0.8, lz + liftD / 2 + 0.03));
  }

  if (!count) return [];
  const pcol = new THREE.Color(panelMatColor);
  const mats = {
    concrete: new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.88, metalness: 0.04 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x4a5563, roughness: 0.55, metalness: 0.45 }),
    panel: new THREE.MeshStandardMaterial({ color: pcol, roughness: 0.84, metalness: 0.03 }),
    door: new THREE.MeshStandardMaterial({ color: 0x2c4a3e, roughness: 0.5, metalness: 0.35 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x1a2430, roughness: 0.6, metalness: 0.1, emissive: 0x101820, emissiveIntensity: 0.15 }),
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
