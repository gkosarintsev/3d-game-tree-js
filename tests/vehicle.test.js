import { parseLevelFilter, SKIPPED } from './level-filter.js';

export async function runVehicleTests() {
  if (parseLevelFilter() !== null) return SKIPPED;
  console.log('vehicle.test.js: пропущено (legacy главы 11/12/13 удалены в TASK-001, scope v3/v4)');
  return { passed: 0, total: 0, skipped: true, results: [] };
}