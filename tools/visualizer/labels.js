import { planLabels } from './model.js';

export class LabelLayer {
  constructor(container) {
    this.container = container;
    this.pool = [];
    this.used = 0;
    this.budget = 60;
    this.enabled = true;
    this.lastUpdate = 0;
    this._measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
    this._measureCtx = this._measureCanvas ? this._measureCanvas.getContext('2d') : null;
    this._widthCache = new Map();
  }

  setBudget(n) { this.budget = Math.max(10, Math.min(200, n | 0)); }
  setEnabled(v) { this.enabled = !!v; if (!this.enabled) this.clear(); }

  widthOf(text) {
    const t = String(text || '');
    if (this._widthCache.has(t)) return this._widthCache.get(t);
    let w = t.length * 7;
    if (this._measureCtx) {
      this._measureCtx.font = '12px "Segoe UI", system-ui, sans-serif';
      w = this._measureCtx.measureText(t).width;
    }
    if (this._widthCache.size > 2000) this._widthCache.clear();
    this._widthCache.set(t, w);
    return w;
  }

  ensure(n) {
    while (this.pool.length < n) {
      const el = document.createElement('div');
      el.className = 'viz-label';
      el.style.position = 'absolute';
      el.style.pointerEvents = 'none';
      el.style.whiteSpace = 'nowrap';
      el.style.display = 'none';
      this.container.appendChild(el);
      this.pool.push(el);
    }
  }

  clear() {
    for (let i = 0; i < this.used; i++) this.pool[i].style.display = 'none';
    this.used = 0;
  }

  update(candidates, { safeArea } = {}) {
    if (!this.enabled) { this.clear(); return; }
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (now - this.lastUpdate < 80) return;
    this.lastUpdate = now;
    const placed = planLabels(candidates, {
      budget: this.budget,
      widthOf: (t) => this.widthOf(t),
      safeArea,
    });
    this.ensure(placed.length);
    this.clear();
    for (let i = 0; i < placed.length; i++) {
      const p = placed[i];
      const el = this.pool[i];
      el.textContent = p.text;
      el.title = p.fullText || p.text;
      el.className = 'viz-label' + (p.selected ? ' selected' : '') + (p.diagnostic ? ' diagnostic' : '') + (p.origin ? ` origin-${p.origin}` : '');
      el.style.display = 'block';
      el.style.transform = `translate3d(${Math.round(p.x)}px,${Math.round(p.y)}px,0)`;
      el.style.maxWidth = '180px';
    }
    this.used = placed.length;
    return placed.length;
  }

  dispose() {
    for (const el of this.pool) try { el.remove(); } catch {}
    this.pool = [];
    this.used = 0;
  }
}

export function labelText(entity, tier) {
  if (!entity) return '';
  const a = entity.attrs || {};
  if (entity.kind === 'anchor') return entity.id;
  if (entity.kind === 'district') return `${entity.id} · ${a.type || 'district'}`;
  if (entity.kind === 'chunk') return entity.id;
  if (entity.kind === 'building') {
    if (tier === 'far') return entity.id;
    if (tier === 'mid') return `${entity.id} · ${a.floorsCount ?? '?'} эт.`;
    const h = (isNum(a.roofY) && isNum(a.baseY)) ? ` · ${(a.roofY - a.baseY).toFixed(1)} м` : '';
    return `${entity.id} · ${a.floorsCount ?? '?'} эт.${h}`;
  }
  if (entity.kind === 'road') {
    if (tier === 'mid') return `${entity.id} · ${a.type || ''}`.trim();
    const w = isNum(a.width) ? ` · ${a.width} м` : '';
    const top = (a.decks || [])[0]?.topY;
    const h = isNum(top) ? ` · +${top} м` : '';
    return `${entity.id}${w}${h}`;
  }
  if (entity.kind === 'prop') return shortId(entity.id);
  if (entity.kind === 'tunnel') return entity.id;
  if (entity.kind === 'channel') return entity.id;
  return entity.id;
}

function isNum(v) { return typeof v === 'number' && Number.isFinite(v); }
function shortId(id) {
  const s = String(id);
  if (s.length <= 18) return s;
  return s.slice(0, 15) + '…';
}

export function labelEligible(entity, tier, areaPx, metersPerPixel, selected) {
  if (selected) return true;
  if (entity.kind === 'anchor') return true;
  if (entity.kind === 'diagnostic') return true;
  if (tier === 'far') {
    if (entity.kind === 'district') return true;
    if (entity.kind === 'building') return areaPx >= 3000;
    return false;
  }
  if (tier === 'mid') {
    if (entity.kind === 'district') return true;
    if (entity.kind === 'building') return areaPx >= 1200;
    if (entity.kind === 'road') return areaPx >= 120 || metersPerPixel < 2;
    if (entity.kind === 'chunk') return false;
    return false;
  }
  // near
  if (entity.kind === 'district') return true;
  if (entity.kind === 'chunk') return true;
  if (entity.kind === 'building') return areaPx >= 300;
  if (entity.kind === 'road') return areaPx >= 40;
  if (entity.kind === 'prop') return areaPx >= 30 || metersPerPixel < 1.2;
  if (entity.kind === 'light' || entity.kind === 'node') return metersPerPixel < 0.5;
  return areaPx >= 40;
}

export function tierFromMetersPerPixel(mpp, plateSize) {
  const viewMeters = mpp * 1200; // rough
  if (viewMeters >= plateSize * 0.7) return 'far';
  if (viewMeters >= 300) return 'mid';
  return 'near';
}
