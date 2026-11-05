// Временная диагностика (не коммитится): карта сюиты против новой карты на том же
// модуле LEVEL_13, после полного прогона сюиты.
import { LEVEL_13 } from '/src/levels/level-13.js';
import { createJsonMap } from '/src/json-map.js';

const stats = (label, map) => {
  const nav = map.nav;
  let north = 0;
  for (const p of nav.pos) if (p.z > 150) north++;
  const ex = LEVEL_13.gameplay.exit;
  let nearExit = Infinity;
  for (const p of nav.pos) nearExit = Math.min(nearExit, Math.hypot(p.x - ex.x, p.z - ex.z));
  return {
    label, nodes: nav.pos.length,
    edges: nav.adj.reduce((a, x) => a + x.length, 0),
    north, nearExit: +nearExit.toFixed(2),
  };
};

const m = await import('/tests/track-city.test.js?probe=1');
const res = await m.runTrackCityTests();
const suiteMap = m.__fixtureMap();
const fresh = createJsonMap(LEVEL_13.map);
fresh.build(new (await import('three')).Scene());
window.__x18 = {
  fail: res.filter((r) => !r.passed).map((r) => `${r.name}: ${r.info}`),
  suite: stats('suite', suiteMap),
  fresh: stats('fresh', fresh),
  decks: LEVEL_13.map.roads.filter((r) => /^ring/.test(r.id)).reduce((a, r) => a + r.decks.length, 0),
  roads: LEVEL_13.map.roads.length,
};
