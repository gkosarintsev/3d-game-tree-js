/**
 * Браузерный тест стриминга: замер времени построения каждого тайла (чанка)
 * открытого мира и принудительная загрузка всех тайлов.
 *
 * Запуск: import('/tests/streaming-build.test.js').then(m => m.runStreamingBuildTests())
 * или через ci-browser (suite streaming-build). Для level 16: --level 16.
 *
 * Что делает:
 *   - строит level 16 (open/WorldMap) и стартовую клетку;
 *   - последовательно загружает все чанки (`loadChunk`), чтобы каждый тайл был построен;
 *   - собирает времена из `map.pump.stats.chunks` и худшие срезы из `map.pump.costWorst`;
 *   - проверяет, что все клетки загружены/застроены (`loaded.size === cells.length`, `isBuiltAt`).
 */
import * as THREE from 'three';
import { LEVELS, LEVEL_NUMBERS } from '../src/levels/index.js';
import { preloadWorldCells } from '../src/world-map.js';
import { parseLevelFilter, SKIPPED } from './level-filter.js';

function fmtMs(v) {
  return Number.isFinite(v) ? `${v.toFixed(1)}ms` : 'n/a';
}

export async function runStreamingBuildTests(arg) {
  const filter = parseLevelFilter(arg ?? (typeof globalThis.TEST_LEVEL !== 'undefined' ? globalThis.TEST_LEVEL : null));
  if (filter && !filter.has(16)) return SKIPPED;

  const idx16 = LEVEL_NUMBERS.indexOf(16);
  const level = idx16 >= 0 ? LEVELS[idx16] : null;
  const results = [];
  const push = (name, passed, info) => results.push({ name, passed, info: String(info) });

  if (!level) {
    push('level-16 present', false, 'глава 16 не найдена в реестре');
  } else {
    const name = 'level-16 all tiles build timing';
    try {
      const factory = globalThis.game?.createMap?.bind(globalThis.game);
      await preloadWorldCells(level.map);
      const map = factory ? factory(level.map) : null;
      if (!map) throw new Error('нет window.game.createMap (запускать в контексте 3d-game.html)');
      const scene = new THREE.Scene();
      map.build(scene);

      // Загружаем все тайлы с имитацией бюджетной помпы: выполняем срезы батчами
      // (как streamStep) и измеряем максимальную блокировку одного батча/кадра.
      const ids = map.cells.map(c => c.id);
      const budgetMs = Math.max(8, +(map.stream?.budgetMs ?? 8));
      let maxBatchMs = 0;
      const runSlicesBudgetedTask = (id, kind, slices) => {
        map.pump.task = {
          id, kind,
          slices: slices.slice(),
          sliceTotal: slices.length,
          sliceDone: 0,
          startedAt: performance.now(),
        };
        while (map.pump.task && map.pump.task.slices.length) {
          const t0 = performance.now();
          // первый срез батча — всегда
          map._runSlice(map.pump.task.slices[0]);
          // добираем по бюджету/оценке (как streamStep)
          while (map.pump.task && map.pump.task.slices.length) {
            const label = map.pump.task.slices[0].label;
            const est = map.pump.costWorst.get(label);
            if (est === undefined || performance.now() - t0 + est > budgetMs) break;
            map._runSlice(map.pump.task.slices[0]);
          }
          const dt = performance.now() - t0;
          if (dt > maxBatchMs) maxBatchMs = dt;
        }
      };

      // Стартовая клетка уже собрана; для остальных строим через _buildSlices и выполняем бюджетно
      for (const id of ids) {
        if (map.loaded.has(id)) continue;
        const data = await map._readCell(id);
        if (typeof map._buildSlices === 'function' && typeof map._runSlice === 'function') {
          const built = map._buildSlices(id, data);
          const slices = built?.slices || [];
          runSlicesBudgetedTask(id, 'build', slices);
        } else {
          await map.loadChunk(id);
        }
      }
      // страховка
      for (const id of ids) {
        if (!map.loaded.has(id)) await map.loadChunk(id);
      }

      const allLoaded = map.loaded.size === ids.length;
      let allBuilt = true;
      for (const c of map.cells) {
        const cx = (c.rect.minX + c.rect.maxX) / 2;
        const cz = (c.rect.minZ + c.rect.maxZ) / 2;
        if (typeof map.isBuiltAt === 'function' && !map.isBuiltAt(cx, cz)) { allBuilt = false; break; }
      }

      const stats = map.pump?.stats ?? {};
      const chunks = Array.isArray(stats.chunks) ? stats.chunks : [];
      const perTile = chunks
        .filter(r => r.kind !== 'unload')
        .map(r => ({
          id: r.id, kind: r.kind, ms: +(+r.ms).toFixed(2), slices: r.slices,
          readyAtMs: r.readyAtMs != null ? +(+r.readyAtMs).toFixed(2) : null,
          costTotal: r.costTotal || null,
        }));
      const totalMs = perTile.reduce((s, r) => s + (r.ms || 0), 0);
      const worst = perTile.reduce((a, b) => (b.ms > (a?.ms ?? -1) ? b : a), null);
      const worstSlice = { label: stats.worstSlice, ms: stats.worstSliceMs };
      const costWorst = {};
      if (map.pump?.costWorst && typeof map.pump.costWorst.forEach === 'function') {
        map.pump.costWorst.forEach((v, k) => { costWorst[k] = +(+v).toFixed(2); });
      }
      // Кумулятивное время по меткам на тайл (сумма срезов) — для профилирования TASK-001
      const labelTotals = {};
      const labelMax = {};
      const labelCount = {};
      const tileLabelTotals = perTile.map(r => {
        const src = r.costTotal || {};
        const out = {};
        for (const [k, v] of Object.entries(src)) {
          const ms = +v || 0;
          out[k] = +ms.toFixed(2);
          labelTotals[k] = (labelTotals[k] || 0) + ms;
          labelMax[k] = Math.max(labelMax[k] || 0, ms);
          labelCount[k] = (labelCount[k] || 0) + 1;
        }
        return [r.id, out];
      });
      const labelTotalsRounded = Object.fromEntries(Object.entries(labelTotals).map(([k, v]) => [k, +v.toFixed(2)]));
      const labelAvg = Object.fromEntries(Object.entries(labelTotals).map(([k, v]) => [k, +(v / Math.max(1, labelCount[k] || 1)).toFixed(2)]));
      const labelMaxRounded = Object.fromEntries(Object.entries(labelMax).map(([k, v]) => [k, +v.toFixed(2)]));
      const labelShare = Object.fromEntries(Object.entries(labelTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => [k, +((v / Math.max(1, totalMs)) * 100).toFixed(2)]));
      const topLabelsByTotal = Object.entries(labelTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([k, v]) => ({ label: k, totalMs: +v.toFixed(2), avgPerTileMs: labelAvg[k], maxPerTileMs: labelMaxRounded[k], sharePct: labelShare[k] }));

      console.group('[streaming-build] per-tile build times (budgeted batches)');
      console.table(perTile.map(r => ({ id: r.id, kind: r.kind, ms: r.ms, slices: r.slices, readyAtMs: r.readyAtMs })));
      console.log('costWorst', costWorst);
      console.log('topLabelsByTotal', topLabelsByTotal);
      console.log('labelTotals', labelTotalsRounded);
      console.log('labelAvgPerTileMs', labelAvg);
      console.log('labelMaxPerTileMs', labelMaxRounded);
      console.log('summary', { tiles: perTile.length, totalMs: +totalMs.toFixed(2), worst, worstSlice, maxBatchMs: +maxBatchMs.toFixed(2), budgetMs });
      console.groupEnd();

      const perTileCompact = perTile.map(r => [r.id, r.ms]);
      const tilePeakMs = worst?.ms ?? 0; // суммарная работа тайла (распределена по батчам/кадрам)
      const slicePeakMs = Number.isFinite(worstSlice?.ms) ? worstSlice.ms : 0;
      const batchPeakMs = +maxBatchMs.toFixed(2);
      // Пик блокировки: ни один батч (кадр помпы) и ни один атомарный срез не > 1s
      const noPeaks = batchPeakMs < 1000 && slicePeakMs < 1000;
      const info = {
        cells: ids.length,
        loaded: map.loaded.size,
        allLoaded,
        allBuilt,
        tilesMeasured: perTile.length,
        totalBuildMs: +totalMs.toFixed(2),
        budgetMs,
        maxBatchMs: batchPeakMs,
        worstTile: worst,
        worstSlice,
        costWorst,
        labelTotals: labelTotalsRounded,
        labelAvgPerTileMs: labelAvg,
        labelMaxPerTileMs: labelMaxRounded,
        labelSharePct: labelShare,
        topLabelsByTotal,
        tileLabelTotals,
        tilePeakMs: +tilePeakMs.toFixed(2), // cumulative, not a blocking peak when budgeted
        slicePeakMs: +slicePeakMs.toFixed(2),
        perTile: perTileCompact,
      };
      const report = JSON.stringify(info);
      console.log('[streaming-build-report]', report);
      push(
        name,
        allLoaded && allBuilt && perTile.length >= ids.length && noPeaks,
        report + (!noPeaks ? ' (FAIL: >1s blocking peak)' : ''),
      );

      try { map.dispose?.(); } catch {}
      try { scene.clear?.(); } catch {}
    } catch (e) {
      push(name, false, `ошибка: ${e?.message || e}\n${e?.stack || ''}`);
    }
  }

  const passed = results.filter(r => r.passed).length;
  console.group('Автесты стриминга: построение всех тайлов');
  for (const r of results) {
    const head = `${r.passed ? 'PASS' : 'FAIL'} — ${r.name}`;
    if (r.passed) console.log(head);
    else console.log(head + ':', r.info);
  }
  console.log(`Итого: ${passed}/${results.length}`);
  console.groupEnd();
  return { passed, total: results.length, results };
}
