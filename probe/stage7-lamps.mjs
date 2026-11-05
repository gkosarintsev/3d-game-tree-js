/* Куда смотрит голова `lamp_post` относительно СВОЕГО полотна.

   Фонарь привязывается к деке по факту размещения: он стоит за бортом на
   `J.lampOffset`, поэтому в осях деки его локальное `v` лежит в полосе
   `[halfW, halfW + lampOffset + допуск]`, а `u` — внутри длины. Прежняя привязка
   «к ближайшей осевой» путала деки многопластинчатых дорог и дугу с прямым
   прогоном.

   Вектор от столба к осевой в осях пластины — `(v·s, −v·c)`, мировой вектор
   головы — `(sin θ, cos θ)`. Классы: «на дорогу» dot ≥ 0,9, «прочь» ≤ −0,9,
   «вдоль» — остальное. */
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { CONFIG } from '../src/config.js';
import { readFileSync } from 'node:fs';

const DEG = Math.PI / 180;
const OFF = CONFIG.jsonMap.lampOffset;

/** Локальные оси деки: `(c, s)` — поворот, `half` — полуоси плана. */
function frameOf(deck) {
  if (deck.arc) return null;
  // у в1-прогона нет `yaw`: длина живёт вдоль `axis`, поэтому ось Z трактуем как
  // поворот на 90° и берём полуоси из мировых габаритов
  const along = deck.axis === 'z' ? 90 : 0;
  const yaw = (deck.yaw ?? along) * DEG;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const cx = deck.cx ?? (deck.minX + deck.maxX) / 2;
  const cz = deck.cz ?? (deck.minZ + deck.maxZ) / 2;
  const runX = deck.maxX - deck.minX, runZ = deck.maxZ - deck.minZ;
  const len = deck.length ?? (deck.axis === 'z' ? runZ : runX);
  const wid = deck.width ?? (deck.axis === 'z' ? runX : runZ);
  return { c, s, cx, cz, half: len / 2, halfW: wid / 2 };
}

function classify(mod) {
  const out = { along: 0, onto: 0, away: 0, total: 0, unmatched: 0 };
  for (const road of mod.map.roads ?? []) {
    for (const lamp of road.lamps ?? []) {
      let hit = null;
      for (const d of road.decks ?? []) {
        const f = frameOf(d);
        if (!f) continue;
        const dx = lamp.position.x - f.cx, dz = lamp.position.z - f.cz;
        const u = dx * f.c + dz * f.s, v = -dx * f.s + dz * f.c;
        if (Math.abs(u) > f.half + 0.6) continue;
        if (Math.abs(v) < f.halfW - 0.6 || Math.abs(v) > f.halfW + OFF + 0.6) continue;
        hit = { f, v };
        break;
      }
      if (!hit) { out.unmatched++; continue; }
      const th = lamp.rotationY * DEG;
      const { f, v } = hit;
      const tx = v * f.s, tz = -v * f.c;
      const dot = (Math.sin(th) * tx + Math.cos(th) * tz) / Math.hypot(tx, tz);
      out.total++;
      if (dot >= 0.9) out.onto++;
      else if (dot <= -0.9) out.away++;
      else out.along++;
    }
  }
  return out;
}

for (const file of ['src/levels/level-09.json', 'src/levels/level-10.json', 'src/levels/level-11.json']) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const level = normalizeLevel(expandCity(raw));
  console.log(file, JSON.stringify(classify(level)));
}
const head = await import('../probe/level-11-head.js');
console.log('level-11 HEAD (старый −yaw)', JSON.stringify(classify({ map: head.LEVEL_11.map })));
const cur = await import('../src/levels/level-11.js');
console.log('level-11 сейчас (новый atan2)', JSON.stringify(classify({ map: cur.LEVEL_11.map })));
