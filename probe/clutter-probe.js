/**
 * Зонд этапа 6b: сколько мусора встанет на кровлях и тротуарах по правилам,
 * которые потом попадут в `JsonMap`. Одноразовый, в репозиторий не коммитится.
 */
const FNV = 16777619;
const mix = (h, v) => Math.imul(h ^ v, FNV) >>> 0;
const str = (h, s) => { let x = h; for (let i = 0; i < s.length; i++) x = mix(x, s.charCodeAt(i)); return x; };
const unit = h => (h >>> 0) / 4294967296;
const inR = (r, x, z) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ;

/** Крышевые предметы: сетка по своим планам, отказ там, где кровлю перекрывает сосед или надстройка. */
export function roofClutter(map, { edge = 1.2, step = 5, keep = 0.5, maxPerHouse = 3 } = {}) {
  const out = [];
  const stats = { buried: 0, stacked: 0, thin: 0, full: 0, houses: 0 };
  for (const b of map.buildings) {
    if (!b.floorsCount) continue;
    let n = 0;
    let done = false;
    for (const r of b.rects) {
      if (done) break;
      if (r.maxX - r.minX < 2 * edge || r.maxZ - r.minZ < 2 * edge) { stats.thin++; continue; }
      const hb = str(2166136261, b.id);
      let k = 0;
      for (let x = r.minX + edge; x <= r.maxX - edge + 1e-6; x += step) {
        for (let z = r.minZ + edge; z <= r.maxZ - edge + 1e-6; z += step, k++) {
          if (n >= maxPerHouse) { done = true; stats.full++; break; }
          if (unit(mix(hb, k * 7919)) >= keep) continue;
          let why = null;
          for (const idx of map._planAt(map._buildingCells, x, z)) {
            const o = map.buildings[idx];
            if (o === b) continue;
            // `_planAt` отдаёт кандидатов по габариту, поэтому проверяют план
            // соседнего дома: надстройка того же лота (башня стоит основанием на
            // нашей кровле) иначе скрыла бы предмет внутри своего объёма
            if (!o.rects.some(q => inR(q, x, z))) continue;
            if (o.baseY < b.roofY + 0.05 && o.roofY > b.roofY + 0.05) { why = 'buried'; break; }
          }
          if (why) { stats[why]++; continue; }
          out.push({ x, z, y: b.roofY, house: b.id, slot: k });
          n++;
        }
      }
    }
    if (n) stats.houses++;
  }
  return { items: out, stats };
}

/** Уличные предметы: вдоль настила, вне габарита домов и не ближе шага к фонарю. */
export function streetClutter(map, { every = 22, inset = 1.4, minLamp = 3 } = {}) {
  const out = [];
  const stats = { rejectedBuilding: 0, rejectedLamp: 0, noSupport: 0 };
  const lamps = [];
  for (const rd of map.roads) for (const l of rd.lamps ?? []) lamps.push(l);
  for (const rd of map.roads) {
    // по настилам мостов и переходов мусор не ставится: там нет тротуара, а
    // контейнер посреди пролёта перекрыл бы единственную переправу
    if (rd.type !== 'ground') continue;
    for (const d of rd.decks) {
      const alongX = d.axis === 'x';
      const lo = alongX ? d.minX : d.minZ;
      const hi = alongX ? d.maxX : d.maxZ;
      const near = alongX ? d.minZ : d.minX;
      const far = alongX ? d.maxZ : d.maxX;
      const len = hi - lo;
      if (len < every) continue;
      const k0 = Math.round(len / every);
      for (let i = 0; i <= k0; i++) {
        const u = lo + (i + 0.5) * (len / (k0 + 1));
        for (const side of [-1, 1]) {
          const cross = (side < 0 ? near : far) + side * -1 * inset;
          const x = alongX ? u : cross;
          const z = alongX ? cross : u;
          if (map.buildings.some(b => b.rects.some(r => inR(r, x, z)))) { stats.rejectedBuilding++; continue; }
          if (lamps.some(l => Math.hypot(l.position.x - x, l.position.z - z) < minLamp)) { stats.rejectedLamp++; continue; }
          const top = d.ramp ? (d.topAtMin + (d.topAtMax - d.topAtMin) * ((u - lo) / len)) : d.topY;
          const g = map.groundHeightAt(x, z, top + 0.4);
          if (Math.abs(g - top) > 0.25) { stats.noSupport++; continue; }
          out.push({ x, z, y: g, road: rd.id });
        }
      }
    }
  }
  return { items: out, stats };
}
