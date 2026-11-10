import { parseLevelFilter, SKIPPED } from './level-filter.js';

export async function runRotatedHouseTests() {
  if (parseLevelFilter() !== null) return SKIPPED;
  console.log('rotated-house.test.js: пропущено (legacy глава 11 удалена в TASK-001, scope v3/v4)');
  return { passed: 0, total: 0, skipped: true, results: [] };
}