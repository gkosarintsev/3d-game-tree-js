/* Сравнение районов глав 10 и 12: габарит блоков, шаг улиц и лотов, yaw. */
import fs from 'node:fs';

for (const f of ['level-10.json', 'level-12.json']) {
  const raw = JSON.parse(fs.readFileSync(`src/levels/${f}`, 'utf8'));
  console.log(f);
  for (const d of raw.city.districts) {
    const b = d.block ?? {};
    const poly = d.polygon ? `polygon ${d.polygon.length} точек` : 'block';
    console.log(' ', d.id, `${b.maxX - b.minX} × ${b.maxZ - b.minZ}`,
      `[${b.minX}…${b.maxX}] × [${b.minZ}…${b.maxZ}]`,
      `street.pitch ${d.street?.pitch} w ${d.street?.width}`,
      `lot ${JSON.stringify(d.lot)}`, `yaw ${d.yaw ?? 0}`, poly);
  }
}
