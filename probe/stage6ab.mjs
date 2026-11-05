import { LEVEL_09 } from '../src/levels/level-09.js';
import { LEVEL_10 } from '../src/levels/level-10.js';
import { LEVEL_11 } from '../src/levels/level-11.js';
for (const [name, spec] of [['09', LEVEL_09.map], ['10', LEVEL_10.map], ['11', LEVEL_11.map]]) {
  const rows = [];
  for (const r of spec.roads) for (const d of r.decks) {
    const rise = Math.abs((d.topAtMax ?? d.topAtMin) - d.topAtMin);
    if (rise > 0) rows.push(`${r.id}: rise=${rise.toFixed(4)} ramp=${d.ramp}`);
  }
  console.log(`глава ${name}: пластин с ненулевым подъёмом ${rows.length}`);
  for (const x of rows.slice(0, 12)) console.log('   ', x);
}
