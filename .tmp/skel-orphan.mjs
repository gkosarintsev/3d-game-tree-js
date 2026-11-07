// Остаток скелета вShipping-главах: чем именно осиротевшие группы (временный файл).
import { readFileSync } from 'node:fs';
import { CONFIG } from '../src/config.js';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { Proto, STEP, build } from './skel-proto-lib.mjs';

const MAXGAP = Number(process.env.SK_GAP ?? 250);
for (const file of (process.env.SK_FILES ?? 'src/levels/level-12.json,src/levels/level-13.json').split(',')) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  const map = normalizeLevel(expandCity(structuredClone(raw))).map;
  const f = new Proto(map);
  const nav = build(f);
  const n = nav.pos.length;
  const comp = new Int32Array(n).fill(-1);
  let k = 0;
  for (let s = 0; s < n; s++) {
    if (comp[s] >= 0) continue;
    const q = [s]; comp[s] = k;
    for (let h = 0; h < q.length; h++) for (const nb of nav.adj[q[h]]) if (comp[nb] < 0) { comp[nb] = k; q.push(nb); }
    k++;
  }
  const groups = [];
  for (let i = 0; i < n; i++) (groups[comp[i]] ??= []).push(i);
  const big = groups.findIndex(v => v.length === Math.max(...groups.map(v => v.length)));
  console.log(`\n=== ${file}: узлов ${n}, компонент ${k}`);
  for (const [c, ids] of groups.entries()) {
    if (ids.length === groups[big].length && c === big) continue;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const i of ids) { const p = nav.pos[i]; minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
    console.log(`  осиротевшая #${c}: узлов ${ids.length}, план ${[minX, minZ, maxX, maxZ].map(v => Math.round(v)).join('…')}, y ${Math.min(...ids.map(i => nav.pos[i].y)).toFixed(2)}…${Math.max(...ids.map(i => nav.pos[i].y)).toFixed(2)}`);
    // ключи узлов взять нечем (nav их не хранит), ищем по позиции среди сходов и дверей
    for (const d of f.descents) {
      for (const i of ids) {
        const p = nav.pos[i];
        const u = d.axis === 'x' ? p.x : p.z, v = d.axis === 'x' ? p.z : p.x;
        if (u >= d.u0 - 1 && u <= d.u1 + 1 && v >= d.v0 - 1 && v <= d.v1 + 1) {
          console.log(`    → узел ${i} (${p.x.toFixed(1)}, ${p.y.toFixed(2)}, ${p.z.toFixed(1)}) лежит в плане схода ${d.id} (kind ${d.kind}, y ${d.y0.toFixed(2)}…${d.y1.toFixed(2)})`);
          break;
        }
      }
    }
    // ближайшее расстояние до большой компоненты и вердикт проверки
    let best = null;
    for (const i of ids) for (const j of groups[big]) {
      const p = nav.pos[i], q2 = nav.pos[j];
      const d = Math.hypot(q2.x - p.x, q2.z - p.z);
      if (!best || d < best.d) best = { d, i, j };
    }
    if (best) {
      const p = nav.pos[best.i], q2 = nav.pos[best.j];
      const clear = f.bodyClearLine(p, q2);
      console.log(`    ближайший узел сети в ${best.d.toFixed(1)} м: габарит ${clear ? 'свободен' : 'задет'}` +
        (clear ? `, опора ${f._edgeSupported(p, q2) ? 'держит' : 'бракует'}` : '') +
        `, y ${p.y.toFixed(2)} → ${q2.y.toFixed(2)}`);
    }
  }
  console.log('  сходов в главе:', f.descents.length, '| дорог:', f.roads.length, '| канал:', f.channels.length);
}
