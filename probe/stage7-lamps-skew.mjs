/* Лампы косых (|yaw| > 0) пластин: HEAD против нового поворота. */
import { CONFIG } from '../src/config.js';
const DEG = Math.PI / 180, OFF = CONFIG.jsonMap.lampOffset;
function frameOf(deck) {
  if (deck.arc) return null;
  const yaw = (deck.yaw ?? (deck.axis === 'z' ? 90 : 0)) * DEG;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  const runX = deck.maxX - deck.minX, runZ = deck.maxZ - deck.minZ;
  return { c, s,
    cx: deck.cx ?? (deck.minX + deck.maxX) / 2, cz: deck.cz ?? (deck.minZ + deck.maxZ) / 2,
    half: (deck.length ?? (deck.axis === 'z' ? runZ : runX)) / 2,
    halfW: (deck.width ?? (deck.axis === 'z' ? runX : runZ)) / 2, skewed: !!deck.yaw };
}
function classify(map) {
  const t = { skew: { along: 0, onto: 0, away: 0, total: 0 }, straight: { along: 0, onto: 0, away: 0, total: 0 } };
  for (const road of map.roads ?? []) {
    const fr = (road.decks ?? []).map(frameOf);
    for (const lamp of road.lamps ?? []) {
      for (const f of fr) {
        if (!f) continue;
        const dx = lamp.position.x - f.cx, dz = lamp.position.z - f.cz;
        const u = dx * f.c + dz * f.s, v = -dx * f.s + dz * f.c;
        if (Math.abs(u) > f.half + 0.6) continue;
        if (Math.abs(v) < f.halfW - 0.6 || Math.abs(v) > f.halfW + OFF + 0.6) continue;
        const th = lamp.rotationY * DEG;
        const tx = v * f.s, tz = -v * f.c;
        const dot = (Math.sin(th) * tx + Math.cos(th) * tz) / Math.hypot(tx, tz);
        const k = f.skewed ? t.skew : t.straight;
        k.total++;
        if (dot >= 0.9) k.onto++; else if (dot <= -0.9) k.away++; else k.along++;
        break;
      }
    }
  }
  return t;
}
const head = await import('../probe/level-11-head.js');
console.log('HEAD   ', JSON.stringify(classify(head.LEVEL_11.map)));
const cur = await import('../src/levels/level-11.js');
console.log('сейчас ', JSON.stringify(classify(cur.LEVEL_11.map)));
