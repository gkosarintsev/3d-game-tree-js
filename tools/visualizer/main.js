import * as THREE from 'three';
import { loadRegistry, loadLevel } from './loader.js';
import { buildModel } from './model.js';
import { SceneRenderer } from './render.js';
import { ViewManager } from './views.js';
import { LabelLayer, labelText, labelEligible, tierFromMetersPerPixel } from './labels.js';
import { UI } from './ui.js';

const appEl = document.getElementById('app');
const ui = new UI(appEl, { onChange: handleUiChange, onAction: handleAction });

let state = {
  level: 19,
  mode: 'compiled',
  view: 'top',
  labels: true,
  grid: true,
  labelBudget: 60,
  selectedId: null,
  selectedKind: null,
};

let registry = { numbers: [7,8,9,10,15,16,17,18,19] };
let raw = { source: null, compiledIndex: null, decodedCells: null, report: null };
let model = null;
let renderer = null;
let viewManager = null;
let labelLayer = null;
let raf = 0;
let dirty = true;
let loadingToken = 0;

function readUrl() {
  const p = new URLSearchParams(location.search);
  if (p.has('level')) state.level = Number(p.get('level')) || state.level;
  if (p.has('mode')) state.mode = p.get('mode') || state.mode;
  if (p.has('view')) state.view = p.get('view') || state.view;
  if (p.has('labels')) state.labels = p.get('labels') !== '0';
  if (p.has('grid')) state.grid = p.get('grid') !== '0';
  if (p.has('budget')) state.labelBudget = Number(p.get('budget')) || state.labelBudget;
}

function writeUrl() {
  const p = new URLSearchParams();
  p.set('level', String(state.level));
  p.set('mode', state.mode);
  p.set('view', state.view);
  if (!state.labels) p.set('labels', '0');
  if (!state.grid) p.set('grid', '0');
  if (state.labelBudget !== 60) p.set('budget', String(state.labelBudget));
  const url = `${location.pathname}?${p.toString()}`;
  history.replaceState(null, '', url);
}

function markDirty() { dirty = true; }

function findEntity(ref) {
  if (!ref || !model) return null;
  const collMap = {
    road: 'roads', building: 'buildings', prop: 'props', light: 'lights',
    channel: 'channels', tunnel: 'tunnels', district: 'districts', chunk: 'chunks', anchor: 'anchors',
  };
  const map = model.entities[collMap[ref.kind] || ref.kind];
  return map?.get(ref.id) || null;
}

function selectEntity(ref) {
  if (!ref) { state.selectedId = null; state.selectedKind = null; }
  else { state.selectedId = ref.id; state.selectedKind = ref.kind; }
  const ent = ref ? findEntity(ref) : null;
  ui.setInspector(ent, model?.diagnostics, model);
  renderer?.highlight(state.selectedId, null);
  markDirty();
}

async function boot() {
  readUrl();
  exposeDebug();
  registry = await loadRegistry();
  ui.setLevels(registry.numbers, state.level);
  ui.modeSelect.value = state.mode;
  ui.gridCheck.checked = state.grid;
  ui.labelsCheck.checked = state.labels;
  ui.labelBudget.value = String(state.labelBudget);
  ui.updateViewButtons(state.view);
  labelLayer = new LabelLayer(ui.labelsHost);
  labelLayer.setBudget(state.labelBudget);
  labelLayer.setEnabled(state.labels);
  bindEvents();
  await reloadLevel();
  loop();
}

async function reloadLevel(cacheBust = 0) {
  const token = ++loadingToken;
  ui.clearBanners();
  ui.setLoading(`Загрузка level ${state.level}…`);
  try {
    const result = await loadLevel(state.level, state.mode, {
      cacheBust,
      onProgress: ({ done, total }) => ui.setLoading(`Загрузка level ${state.level}: чанки ${done}/${total}`),
    });
    if (token !== loadingToken) return;
    raw = result;
    buildAndMount();
    ui.setLoading('');
  } catch (e) {
    if (token !== loadingToken) return;
    ui.setLoading('');
    ui.addBanner(`Ошибка загрузки: ${e?.message || e}`, 'error');
    // fallback: if compiled failed, try source
    if (state.mode !== 'source') {
      try {
        ui.addBanner('Пробую source-режим…', 'warn');
        const s = await loadLevel(state.level, 'source', { cacheBust });
        if (token !== loadingToken) return;
        raw = s;
        state.mode = 'source';
        ui.modeSelect.value = 'source';
        buildAndMount();
      } catch {}
    }
  }
}

function buildAndMount() {
  const t0 = performance.now();
  model = buildModel({
    level: state.level,
    mode: state.mode,
    source: raw.source,
    compiledIndex: raw.compiledIndex,
    decodedCells: raw.decodedCells,
    report: raw.report,
  });
  model.stats.buildMs = Math.round((performance.now() - t0) * 10) / 10;
  model.meta.phases = raw.phases || {};
  if (raw.decodedCells) model.stats.decodeMs = 0; // decode time not tracked per-chunk in loader; approximate later if needed

  if (renderer) renderer.dispose();
  if (viewManager) viewManager.dispose();
  renderer = new SceneRenderer(ui.canvas, model);
  viewManager = new ViewManager(renderer.renderer, ui.canvas, model);
  viewManager.onChange(markDirty);
  viewManager.setView(state.view, false);
  renderer.setLayer('grid', state.grid);
  renderer.setLayer('labels', state.labels);
  renderer.gridOpts.enabled = state.grid;
  renderer.updateGrid(viewManager);
  renderer.applyLayerState();

  for (const w of model.meta.warnings || []) ui.addBanner(w.message, 'warn');
  if (!raw.report && state.mode !== 'source') {
    if (raw.source?.schemaVersion == null || raw.source?.schemaVersion < 4) ui.addBanner('v3: generation-report.json отсутствует (норма для v3).', 'info');
  }
  if (raw.source && !raw.compiledIndex && state.mode === 'source') {
    // ok
  }
  ui.setLegend(model.stats.byOrigin);
  ui.setDiagnostics(model.diagnostics, { onFocus: focusDiagnostic });
  selectEntity(null);
  ui.updateViewButtons(state.view);
  writeUrl();
  markDirty();
  if (window.__viz) window.__viz.ready = true;
  console.log('visualizer ready', state.level, model.stats);
}

function focusDiagnostic(d) {
  if (!d?.refs?.length) return;
  // try to focus first known entity
  for (const ref of d.refs) {
    const ent = findAnyEntity(ref);
    if (ent) { selectEntity({ kind: ent.kind, id: ent.id }); focusEntity(ent); return; }
  }
  // anchor refs
  if (d.refs.includes('spawn') || d.refs.includes('exit')) {
    const ent = findAnyEntity(d.refs.includes('spawn') ? 'spawn' : 'exit');
    if (ent) { selectEntity({ kind: ent.kind, id: ent.id }); focusEntity(ent); }
  }
}

function findAnyEntity(id) {
  if (!model) return null;
  for (const map of Object.values(model.entities)) {
    if (!(map instanceof Map)) continue;
    if (map.has(id)) return map.get(id);
  }
  return null;
}

function focusEntity(ent, facade = false) {
  if (!ent || !viewManager) return;
  if (facade) viewManager.focusFacade(ent); else viewManager.fitBox(ent.bbox);
  markDirty();
}

function handleUiChange(ev) {
  if (!ev) return;
  if (ev.type === 'level') { state.level = ev.value; writeUrl(); reloadLevel(); }
  if (ev.type === 'mode') { state.mode = ev.value; writeUrl(); reloadLevel(); }
  if (ev.type === 'view') { state.view = ev.value; viewManager?.setView(ev.value); ui.updateViewButtons(ev.value); renderer?.updateGrid(viewManager); writeUrl(); markDirty(); }
  if (ev.type === 'grid') { state.grid = !!ev.value; renderer.gridOpts.enabled = state.grid; renderer.setLayer('grid', state.grid); renderer.updateGrid(viewManager); writeUrl(); markDirty(); }
  if (ev.type === 'labels') { state.labels = !!ev.value; labelLayer.setEnabled(state.labels); ui.layerChecks.labels.checked = state.labels; writeUrl(); markDirty(); }
  if (ev.type === 'labelBudget') { state.labelBudget = ev.value; labelLayer.setBudget(ev.value); writeUrl(); markDirty(); }
  if (ev.type === 'layer') {
    if (ev.key === 'labels') { state.labels = !!ev.value; labelLayer.setEnabled(state.labels); ui.labelsCheck.checked = state.labels; }
    else if (ev.key === 'grid') { state.grid = !!ev.value; renderer.gridOpts.enabled = state.grid; ui.gridCheck.checked = state.grid; renderer.setLayer('grid', state.grid); renderer.updateGrid(viewManager); }
    else renderer.setLayer(ev.key, ev.value);
    markDirty();
  }
  if (ev.type === 'search') { /* could implement search highlight; for now focus on exact id */ }
}

function handleAction(ev) {
  if (!ev) return;
  if (ev.type === 'focus' || ev.type === 'facade') {
    const ent = findAnyEntity(ev.id);
    if (ent) { selectEntity({ kind: ent.kind, id: ent.id }); focusEntity(ent, ev.type === 'facade'); }
  }
  if (ev.type === 'copyId') {
    navigator.clipboard?.writeText(ev.id || '').catch(() => {});
  }
  if (ev.type === 'copyLink') {
    navigator.clipboard?.writeText(location.href).catch(() => {});
  }
  if (ev.type === 'reload') {
    reloadLevel(Date.now());
  }
}

function bindEvents() {
  ui.canvas.addEventListener('click', (e) => {
    if (!renderer || !viewManager) return;
    const ref = renderer.pick(e.clientX, e.clientY, viewManager);
    selectEntity(ref);
  });
  window.addEventListener('keydown', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === '1') handleUiChange({ type: 'view', value: 'top' });
    else if (e.key === '2') handleUiChange({ type: 'view', value: 'front' });
    else if (e.key === '3') handleUiChange({ type: 'view', value: 'side' });
    else if (e.key === '4') handleUiChange({ type: 'view', value: 'free' });
    else if (e.key === 'g' || e.key === 'G') { ui.gridCheck.checked = !ui.gridCheck.checked; handleUiChange({ type: 'grid', value: ui.gridCheck.checked }); }
    else if (e.key === 'l' || e.key === 'L') { ui.labelsCheck.checked = !ui.labelsCheck.checked; handleUiChange({ type: 'labels', value: ui.labelsCheck.checked }); }
    else if (e.key === 'f' || e.key === 'F') {
      const ent = state.selectedId ? findAnyEntity(state.selectedId) : null;
      if (ent) focusEntity(ent, e.shiftKey);
      else viewManager?.fitAll();
    }
    else if (e.key === 'r' || e.key === 'R') { viewManager?.reset(); ui.updateViewButtons('top'); state.view = 'top'; writeUrl(); markDirty(); }
    else if (e.key === 'Backspace') { viewManager?.back(); ui.updateViewButtons(viewManager.view); state.view = viewManager.view; writeUrl(); markDirty(); }
    else if (e.key === 'Escape') { selectEntity(null); }
    else if (e.key === '/') { e.preventDefault(); ui.search.focus(); }
  });
  window.addEventListener('resize', () => { viewManager?.resize(); renderer?.updateGrid(viewManager); markDirty(); });
}

function collectLabelCandidates() {
  if (!model || !viewManager || !state.labels) return [];
  const mpp = viewManager.metersPerPixel();
  const tier = tierFromMetersPerPixel(mpp, model.meta.plate.size);
  const rect = ui.canvas.getBoundingClientRect();
  const safe = {
    minX: 8, minY: 52,
    maxX: rect.width - 8, maxY: rect.height - 36,
  };
  // adjust safe by side panels on wide layout roughly? using DOM rects is better but keep simple
  const out = [];
  const pushEnt = (ent, kindOverride) => {
    if (!ent) return;
    const b = ent.bbox;
    if (!b) return;
    const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2, cy = (b.minY + b.maxY) / 2 + 1;
    const s = viewManager.worldToScreen(cx, cy, cz);
    if (!s.visible) return;
    const areaPx = Math.max(1, ((b.maxX - b.minX) * (b.maxZ - b.minZ)) / (mpp * mpp));
    const selected = state.selectedId === ent.id;
    const eligible = labelEligible({ ...ent, kind: ent.kind }, tier, areaPx, mpp, selected);
    if (!eligible) return;
    const prioBase = { anchor: 100, district: 90, building: 80, road: ent.attrs?.type === 'arterial' || ent.attrs?.type === 'main' ? 70 : 45, chunk: 30, prop: 20 }[ent.kind] || 10;
    out.push({
      id: `${ent.kind}:${ent.id}`,
      entityId: ent.id,
      text: labelText(ent, tier),
      fullText: `${ent.kind} ${ent.id}`,
      priority: selected ? 120 : prioBase,
      areaPx,
      screenX: s.x,
      screenY: s.y,
      selected,
      origin: ent.origin,
      eligible: true,
    });
  };
  const layers = renderer.layerState;
  if (layers.districts) for (const e of model.entities.districts.values()) pushEnt(e);
  if (layers.anchors) for (const e of model.entities.anchors.values()) pushEnt(e);
  if (layers.buildings) for (const e of model.entities.buildings.values()) pushEnt(e);
  if (layers.roads && tier !== 'far') for (const e of model.entities.roads.values()) pushEnt(e);
  if (layers.chunks && tier === 'near') for (const e of model.entities.chunks.values()) pushEnt(e);
  if (layers.props && tier === 'near') for (const e of model.entities.props.values()) pushEnt(e);
  return out;
}

function updateStatus(fps) {
  if (!model || !viewManager) return;
  const mpp = viewManager.metersPerPixel();
  const stats = model.stats || {};
  const u = stats.unique || {};
  const inst = stats.instances || {};
  const uniqSum = (u.buildings || 0) + (u.roads || 0) + (u.props || 0);
  const instSum = (inst.buildings || 0) + (inst.roads || 0) + (inst.props || 0);
  const info = renderer?.renderer?.info;
  ui.setStatus(`level ${state.level} · ${state.mode} · ${viewManager.view} · m/px ${mpp.toFixed(mpp < 1 ? 2 : 1)} · unique ${uniqSum} / inst ${instSum} · dups ${stats.duplicates || 0} · fps ${fps.toFixed(0)} · calls ${info?.render?.calls ?? '?'} · tris ${info?.render?.triangles ?? '?'}`);
}

let lastFpsTime = performance.now();
let frames = 0;
let fps = 0;
function loop() {
  raf = requestAnimationFrame(loop);
  frames++;
  const now = performance.now();
  if (now - lastFpsTime >= 500) {
    fps = (frames * 1000) / (now - lastFpsTime);
    frames = 0; lastFpsTime = now;
  }
  if (!dirty && viewManager?.view !== 'free') {
    // still update status occasionally
  }
  if (renderer && viewManager) {
    if (viewManager.view === 'free') viewManager.controls.update();
    if (dirty || viewManager.view === 'free') {
      renderer.render(viewManager.camera);
      const candidates = collectLabelCandidates();
      const rect = ui.canvas.getBoundingClientRect();
      labelLayer.update(candidates, { safeArea: { minX: 8, minY: 52, maxX: rect.width - 8, maxY: rect.height - 36 } });
      updateStatus(fps);
      dirty = false;
    }
  }
}

function exposeDebug() {
  window.__viz = {
    ready: false,
    get model() { return model; },
    get state() { return state; },
    stats() { return model?.stats; },
    counts() { return model?.stats?.unique; },
    select(id) {
      const ent = findAnyEntity(String(id));
      if (ent) { selectEntity({ kind: ent.kind, id: ent.id }); focusEntity(ent); }
      return ent;
    },
  };
}

boot().catch(e => {
  console.error(e);
  ui.addBanner(`Fatal: ${e?.message || e}`, 'error');
});
