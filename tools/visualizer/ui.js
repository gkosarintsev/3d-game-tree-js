import { labelText } from './labels.js';

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export class UI {
  constructor(root, { onChange, onAction }) {
    this.root = root;
    this.onChange = onChange || (() => {});
    this.onAction = onAction || (() => {});
    this.state = {};
    this.selected = null;
    this.build();
  }

  build() {
    this.root.innerHTML = '';
    this.toolbar = el('div', 'viz-toolbar');
    this.left = el('div', 'viz-left');
    this.right = el('div', 'viz-right');
    this.status = el('div', 'viz-status');
    this.canvasWrap = el('div', 'viz-canvas-wrap');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'viz-canvas';
    this.canvas.tabIndex = 0;
    this.labelsHost = el('div', 'viz-labels-host');
    this.bannerHost = el('div', 'viz-banners');
    this.canvasWrap.append(this.canvas, this.labelsHost, this.bannerHost);

    const mid = el('div', 'viz-mid');
    mid.append(this.left, this.canvasWrap, this.right);
    this.root.append(this.toolbar, mid, this.status);

    this.buildToolbar();
    this.buildLeft();
    this.buildRight();
  }

  buildToolbar() {
    this.levelSelect = document.createElement('select');
    this.levelSelect.addEventListener('change', () => this.onChange({ type: 'level', value: Number(this.levelSelect.value) }));

    this.modeSelect = document.createElement('select');
    for (const m of ['source', 'compiled', 'compare']) {
      const o = document.createElement('option'); o.value = m; o.textContent = m; this.modeSelect.append(o);
    }
    this.modeSelect.addEventListener('change', () => this.onChange({ type: 'mode', value: this.modeSelect.value }));

    const views = el('div', 'viz-view-btns');
    this.viewBtns = {};
    for (const [id, label] of [['top', '1 top'], ['front', '2 front'], ['side', '3 side'], ['free', '4 free']]) {
      const b = el('button', 'viz-btn', label);
      b.addEventListener('click', () => this.onChange({ type: 'view', value: id }));
      this.viewBtns[id] = b;
      views.append(b);
    }

    const gridWrap = el('label', 'viz-inline');
    this.gridCheck = document.createElement('input'); this.gridCheck.type = 'checkbox'; this.gridCheck.checked = true;
    this.gridCheck.addEventListener('change', () => this.onChange({ type: 'grid', value: this.gridCheck.checked }));
    gridWrap.append(this.gridCheck, ' grid');

    const labelsWrap = el('label', 'viz-inline');
    this.labelsCheck = document.createElement('input'); this.labelsCheck.type = 'checkbox'; this.labelsCheck.checked = true;
    this.labelsCheck.addEventListener('change', () => this.onChange({ type: 'labels', value: this.labelsCheck.checked }));
    labelsWrap.append(this.labelsCheck, ' labels');

    this.labelBudget = document.createElement('input');
    this.labelBudget.type = 'range'; this.labelBudget.min = 20; this.labelBudget.max = 200; this.labelBudget.value = 60;
    this.labelBudget.title = 'budget';
    this.labelBudget.addEventListener('input', () => this.onChange({ type: 'labelBudget', value: Number(this.labelBudget.value) }));

    this.search = document.createElement('input');
    this.search.type = 'search'; this.search.placeholder = 'search id… (/ )';
    this.search.className = 'viz-search';
    this.search.addEventListener('input', () => this.onChange({ type: 'search', value: this.search.value }));

    const detailWrap = el('label', 'viz-inline');
    this.detailCheck = document.createElement('input'); this.detailCheck.type = 'checkbox'; this.detailCheck.checked = false;
    this.detailCheck.title = 'Детальная визуализация (текстуры/меши как в игре, тяжело для больших карт)';
    this.detailCheck.addEventListener('change', () => this.onChange({ type: 'detail', value: this.detailCheck.checked }));
    detailWrap.append(this.detailCheck, ' detail');

    const copyBtn = el('button', 'viz-btn', 'Copy link');
    copyBtn.addEventListener('click', () => this.onAction({ type: 'copyLink' }));
    const reloadBtn = el('button', 'viz-btn', 'Reload');
    reloadBtn.addEventListener('click', () => this.onAction({ type: 'reload' }));

    this.toolbar.append(
      el('span', 'viz-tool-label', 'Level'), this.levelSelect,
      el('span', 'viz-tool-label', 'Mode'), this.modeSelect,
      views, gridWrap, labelsWrap, detailWrap, this.labelBudget, this.search, copyBtn, reloadBtn,
    );
  }

  setLevels(nums, selected) {
    this.levelSelect.innerHTML = '';
    for (const n of nums) {
      const o = document.createElement('option'); o.value = String(n); o.textContent = `level ${n}`; this.levelSelect.append(o);
    }
    this.levelSelect.value = String(selected);
  }

  buildLeft() {
    this.legend = el('div', 'viz-panel');
    this.legendTitle = el('div', 'viz-panel-title', 'Легенда');
    this.legendBody = el('div', 'viz-legend-body');
    this.legend.append(this.legendTitle, this.legendBody);

    this.layersPanel = el('div', 'viz-panel');
    this.layersPanel.append(el('div', 'viz-panel-title', 'Слои'));
    this.layerChecks = {};
    const layerDefs = [
      ['plate', 'plate/bounds', true], ['districts', 'districts', true], ['chunks', 'chunks', true],
      ['roads', 'roads/decks', true], ['rails', 'rails', true], ['buildings', 'buildings', true],
      ['props', 'props', true], ['lights', 'lights', false], ['channels', 'channels/tunnels', true],
      ['skeleton', 'skeleton', false], ['anchors', 'anchors', true], ['diagnostics', 'diagnostics', true],
      ['relief', 'relief', false], ['grid', 'grid', true], ['labels', 'labels', true],
    ];
    for (const [k, label, def] of layerDefs) {
      const row = el('label', 'viz-check-row');
      const c = document.createElement('input'); c.type = 'checkbox'; c.checked = def;
      c.addEventListener('change', () => this.onChange({ type: 'layer', key: k, value: c.checked }));
      row.append(c, ' ', label);
      this.layersPanel.append(row);
      this.layerChecks[k] = c;
    }

    this.diagPanel = el('div', 'viz-panel');
    this.diagPanel.append(el('div', 'viz-panel-title', 'Диагностика'));
    this.diagBody = el('div', 'viz-diag-body');
    this.diagPanel.append(this.diagBody);

    this.left.append(this.legend, this.layersPanel, this.diagPanel);
  }

  buildRight() {
    this.inspector = el('div', 'viz-panel viz-inspector');
    this.inspector.append(el('div', 'viz-panel-title', 'Инспектор'));
    this.inspectorBody = el('div', 'viz-inspector-body', 'Выберите объект на плане.');
    this.inspector.append(this.inspectorBody);
    this.right.append(this.inspector);
  }

  setLegend(counts) {
    this.legendBody.innerHTML = '';
    const items = [
      ['authored', '#4aa3ff', counts?.authored ?? 0],
      ['generated', '#ffae42', counts?.generated ?? 0],
      ['derived', '#b58cff', counts?.derived ?? 0],
      ['unknown', '#8b97a8', counts?.unknown ?? 0],
    ];
    for (const [name, color, n] of items) {
      const row = el('div', 'viz-legend-row');
      const sw = el('span', 'viz-swatch'); sw.style.background = color;
      row.append(sw, ` ${name}: ${n}`);
      this.legendBody.append(row);
    }
  }

  setDiagnostics(diag, { onFocus } = {}) {
    this.diagBody.innerHTML = '';
    if (!diag || !diag.list?.length) {
      this.diagBody.append(el('div', 'viz-muted', 'Нет диагностики'));
      return;
    }
    const sum = el('div', 'viz-muted', `warn: ${diag.counts.warn || 0}, info: ${diag.counts.info || 0}, repairs: ${(diag.list.filter(x=>x.group==='repair').length)}`);
    this.diagBody.append(sum);
    const list = diag.list.slice(0, 120);
    for (const d of list) {
      const row = el('div', 'viz-diag-row ' + (d.severity === 'warn' ? 'warn' : 'info'));
      const text = `[${d.group}] ${d.code}${d.refs?.length ? ' · ' + d.refs.slice(0, 2).join(',') : ''}`;
      row.textContent = text;
      row.title = d.message || text;
      row.addEventListener('click', () => onFocus?.(d));
      this.diagBody.append(row);
    }
    if (diag.list.length > list.length) this.diagBody.append(el('div', 'viz-muted', `… ещё ${diag.list.length - list.length}`));
  }

  setInspector(entity, diagnostics, model) {
    this.selected = entity;
    this.inspectorBody.innerHTML = '';
    if (!entity) {
      this.inspectorBody.textContent = 'Выберите объект на плане.';
      return;
    }
    const add = (k, v) => {
      if (v == null || v === '') return;
      const row = el('div', 'viz-kv');
      row.append(el('span', 'viz-k', k), el('span', 'viz-v', String(v)));
      this.inspectorBody.append(row);
    };
    add('id', entity.id);
    add('kind', entity.kind);
    add('origin', `${entity.origin}${entity.originRule ? ' · ' + entity.originRule : ''}`);
    add('status', entity.status);
    add('pointer', entity.sourcePointer);
    add('parent', entity.parentId);
    add('chunks', (entity.chunkIds || []).join(', '));
    add('instances', entity.instances);
    if (entity.bbox) add('bbox', `${fmt(entity.bbox.minX)},${fmt(entity.bbox.minZ)} → ${fmt(entity.bbox.maxX)},${fmt(entity.bbox.maxZ)}`);
    const a = entity.attrs || {};
    if (entity.kind === 'building') {
      add('floors', a.floorsCount);
      add('roofY', a.roofY);
      add('baseY', a.baseY);
      add('facade', a.facadeMaterial);
    }
    if (entity.kind === 'road') {
      add('type', a.type);
      add('width', a.width);
      add('decks', (a.decks || []).length);
      const top = a.decks?.[0]?.topY;
      if (top != null) add('topY', top);
      add('ramp', a.ramp);
      add('rails', a.rails);
    }
    if (entity.kind === 'prop') { add('model', a.model); add('source', a.source); }
    if (entity.kind === 'district') { add('district type', a.type); add('parcels', a.parcels); add('cells', a.cells); add('geometry', entity.geometry?.type); }

    const actions = el('div', 'viz-actions');
    const focusBtn = el('button', 'viz-btn', 'Focus');
    focusBtn.addEventListener('click', () => this.onAction({ type: 'focus', id: entity.id }));
    const facadeBtn = el('button', 'viz-btn', 'Facade');
    facadeBtn.addEventListener('click', () => this.onAction({ type: 'facade', id: entity.id }));
    const copyBtn = el('button', 'viz-btn', 'Copy id');
    copyBtn.addEventListener('click', () => this.onAction({ type: 'copyId', id: entity.id }));
    actions.append(focusBtn, facadeBtn, copyBtn);
    this.inspectorBody.append(actions);

    const refs = diagnostics?.byEntity?.get(entity.id) || [];
    if (refs.length) {
      this.inspectorBody.append(el('div', 'viz-panel-title', `Диагностика (${refs.length})`));
      for (const r of refs.slice(0, 20)) {
        const row = el('div', 'viz-diag-row ' + (r.severity === 'warn' ? 'warn' : 'info'), `[${r.group}] ${r.code}: ${r.message || ''}`);
        this.inspectorBody.append(row);
      }
    }
  }

  setStatus(text) { this.status.textContent = text; }

  addBanner(text, kind = 'warn') {
    const b = el('div', `viz-banner ${kind}`);
    const span = el('span', 'viz-banner-text', text);
    const close = el('button', 'viz-banner-close', '×');
    close.type = 'button';
    close.title = 'Закрыть';
    close.addEventListener('click', () => b.remove());
    b.append(span, close);
    this.bannerHost.append(b);
    return b;
  }
  clearBanners() { this.bannerHost.innerHTML = ''; this._loadingBanner = null; }

  setLoading(text) {
    let b = this._loadingBanner;
    if (!text) { if (b) b.remove(); this._loadingBanner = null; return; }
    if (!b) {
      b = el('div', 'viz-banner info');
      const span = el('span', 'viz-banner-text');
      const close = el('button', 'viz-banner-close', '×');
      close.type = 'button';
      close.title = 'Закрыть';
      close.addEventListener('click', () => { b.remove(); if (this._loadingBanner === b) this._loadingBanner = null; });
      b.append(span, close);
      this.bannerHost.prepend(b);
      this._loadingBanner = b;
    }
    const span = b.querySelector('.viz-banner-text');
    if (span) span.textContent = text; else b.textContent = text;
  }

  updateViewButtons(view) {
    for (const [k, b] of Object.entries(this.viewBtns)) b.classList.toggle('active', k === view);
  }
}

function fmt(v) { return typeof v === 'number' ? (Math.round(v * 10) / 10).toString() : String(v); }
