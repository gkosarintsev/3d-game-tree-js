/* Подбор рельефа главы 12: для candidate-набора холмов и прямоугольников районов
   считает террасы так же, как парсер (подгонка кольца до maxBlend, вердикт по
   собранному полю), и печатает, сойдётся ли каждая терраса в предел. */
import { reliefOf } from '../src/relief.js';

const cfg = JSON.parse(process.argv[2] ?? '{}');
const maxSlope = cfg.maxSlope ?? 0.12;
const maxBlend = 120;

function ringProbes(p, blend) {
  const out = [];
  for (const fraction of [0.4, 0.55, 0.7]) {
    const d = blend * fraction;
    const nx = Math.max(2, Math.min(6, Math.ceil((p.maxX - p.minX) / d)));
    const nz = Math.max(2, Math.min(6, Math.ceil((p.maxZ - p.minZ) / d)));
    for (let i = 0; i <= nx; i++) {
      const z = p.minZ + (p.maxZ - p.minZ) * (i / nx);
      out.push({ x: p.minX - d, z });
      out.push({ x: p.maxX + d, z });
    }
    for (let i = 1; i < nz; i++) {
      const x = p.minX + (p.maxX - p.minX) * (i / nz);
      out.push({ x, z: p.minZ - d });
      out.push({ x, z: p.maxZ + d });
    }
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const cx = sx < 0 ? p.minX : p.maxX;
        const cz = sz < 0 ? p.minZ : p.maxZ;
        for (const t of [0.25, 0.5, 0.75]) {
          const a = (Math.PI / 2) * t;
          out.push({ x: cx + sx * d * Math.cos(a), z: cz + sz * d * Math.sin(a) });
        }
      }
    }
  }
  return out;
}

function ringSlope(p, field) {
  return ringProbes(p, p.blend).reduce((m, q) => Math.max(m, field.slopeAt(q.x, q.z).mag), 0);
}

const spec = { baseY: 0, blend: 14, hills: cfg.hills, pads: [] };

/** Подгонка кольца площадки — ровно как в парсере: проба, потолок 120, вердикт по финалу. */
function fitPad(p, others) {
  for (let i = 0; i < 6; i++) {
    const trial = reliefOf({ ...spec, pads: [...others, p] });
    const slope = ringSlope(p, trial);
    if (slope <= maxSlope * 1.02 || p.blend >= maxBlend) break;
    p.blend = Math.round(Math.min(p.blend * Math.max(slope / maxSlope, 1.2), maxBlend) * 1000) / 1000;
  }
  return p;
}

// авторские площадки (пойма) — с заданной отметкой, подгоняются первыми
for (const f of cfg.fixed ?? []) {
  spec.pads.push(fitPad({ ...f, blend: 14 }, spec.pads));
}
const pads = cfg.rects.map((r) => {
  const pre = reliefOf(spec);
  const y = pre.heightAt((r.minX + r.maxX) / 2, (r.minZ + r.maxZ) / 2);
  const p = { id: r.id, minX: r.minX, maxX: r.maxX, minZ: r.minZ, maxZ: r.maxZ,
    y: Math.round(y * 1000) / 1000, blend: 14 };
  spec.pads.push(fitPad(p, spec.pads));
  return p;
});

const field = reliefOf(spec);
const nat = reliefOf({ ...spec, pads: [] });
let natWorst = { mag: 0, x: 0, z: 0 };
for (let x = -300; x <= 300; x += 10) {
  for (let z = -300; z <= 300; z += 10) {
    const s = nat.slopeAt(x, z);
    if (s.mag > natWorst.mag) natWorst = { mag: s.mag, x, z };
  }
}
for (const l of cfg.profile ?? []) {
  const src = l.pads === false ? nat : field;
  const row = [];
  for (let q = l.from; q <= l.to; q += l.step ?? 20) {
    row.push(`${q}:${(l.axis === 'x' ? src.heightAt(q, l.at) : src.heightAt(l.at, q)).toFixed(2)}`);
  }
  console.log(`${l.id ?? (l.axis === 'x' ? `x @ z=${l.at}` : `z @ x=${l.at}`)}: ${row.join(' ')}`);
}
console.log(`поле природы: худший уклон ${natWorst.mag.toFixed(3)} в ${natWorst.x},${natWorst.z}; `
  + `отметки ${nat.heightAt(-300, -300).toFixed(1)}…${Math.max(...[...Array(61)].flatMap((_, i) => [...Array(61)].map((__, j) => nat.heightAt(-300 + i * 10, -300 + j * 10)))).toFixed(1)}`);
for (let round = 0; round < 2; round++) {
  let widened = false;
  for (const p of spec.pads) {
    if (ringSlope(p, field) <= maxSlope * 1.02) continue;
    let blend = p.blend;
    for (let i = 0; i < 6; i++) {
      const trial = reliefOf({ ...spec, pads: spec.pads.map(q => q === p ? { ...q, blend } : q) });
      const slope = ringSlope({ ...p, blend }, trial);
      if (slope <= maxSlope * 1.02 || blend >= maxBlend) break;
      blend = Math.min(blend * Math.max(slope / maxSlope, 1.2), maxBlend);
    }
    p.blend = blend;
    spec.field = null;
    widened = true;
  }
  if (!widened) break;
}
const final = reliefOf(spec);

let worst = { mag: 0, x: 0, z: 0 };
for (let x = -300; x <= 300; x += 10) {
  for (let z = -300; z <= 300; z += 10) {
    const s = final.slopeAt(x, z);
    if (s.mag > worst.mag) worst = { mag: s.mag, x, z };
  }
}
console.log(`поле с террасами: худший уклон ${worst.mag.toFixed(3)} в ${worst.x},${worst.z}`);
for (const p of spec.pads) {
  const samples = [];
  for (let i = 0; i <= 8; i++) {
    for (let j = 0; j <= 8; j++) {
      samples.push(final.heightAt(p.minX + (p.maxX - p.minX) * i / 8, p.minZ + (p.maxZ - p.minZ) * j / 8));
    }
  }
  const slope = ringSlope(p, final);
  console.log(`${p.id}: y ${p.y.toFixed(2)} кольцо ${p.blend.toFixed(0)} м → ${slope.toFixed(3)} м/м `
    + `${slope > maxSlope * 1.15 ? 'НЕ СХОДИТСЯ' : slope > maxSlope * 1.02 ? 'гранично' : 'ок'}, `
    + `Δ в ядре ${(Math.max(...samples) - Math.min(...samples)).toFixed(2)}`);
}
for (const r of cfg.lines ?? []) {
  const row = [];
  for (let q = r.from; q <= r.to; q += r.step ?? 20) {
    row.push(`${q}:${(r.axis === 'x' ? final.heightAt(q, r.at) : final.heightAt(r.at, q)).toFixed(1)}`);
  }
  console.log(`${r.id ?? (r.axis === 'x' ? `x @ z=${r.at}` : `z @ x=${r.at}`)}: ${row.join(' ')}`);
}
