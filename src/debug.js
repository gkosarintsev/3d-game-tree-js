/**
 * Отладочное меню: открывается страницей игры с параметром ?debug=1.
 *
 * Даёт менять параметры CONFIG на лету (движок читает их каждый кадр) и
 * загружать любую главу напрямую. Поля со значком ⟳ влияют только после
 * перезагрузки главы (сущности создаются при загрузке).
 *
 * По кнопке показывает id объектов данных прямо в мире — таблички-спрайты по
 * точкам, которые карта отдаёт через необязательный член контракта `debugIds()`.
 *
 * Это единственная панель UI вне hud.js — осознанное исключение (AGENTS.md):
 * она не участвует в игровом процессе и не открывается без ?debug=1.
 */
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { LEVELS, LEVEL_NUMBERS } from './levels/index.js';

const get = (obj, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
const set = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  let target = obj;
  for (const k of keys) target = target[k];
  target[last] = value;
};

/** Описания полей панели: путь в CONFIG, подпись, шаг, нужна ли перезагрузка. */
const FIELDS = [
  { group: 'Игрок' },
  { path: 'speed.walk', label: 'Скорость шага', step: 0.2 },
  { path: 'speed.run', label: 'Скорость бега', step: 0.2 },
  { path: 'jump', label: 'Высота прыжка', step: 0.2 },
  { path: 'gravity', label: 'Гравитация', step: 0.5 },
  { path: 'health.max', label: 'Максимум HP', step: 5, reload: true },
  { path: 'health.regenRate', label: 'Регенерация, HP/с', step: 1 },

  { group: 'Оружие' },
  { path: 'weapon.damage', label: 'Урон', step: 5 },
  { path: 'weapon.fireDelay', label: 'Пауза огня, с', step: 0.01 },
  { path: 'weapon.range', label: 'Дальность', step: 5 },

  { group: 'Враги' },
  { path: 'enemies.count', label: 'Число людей', step: 1, reload: true, int: true },
  { path: 'alienEnemies.count', label: 'Число Чужих', step: 1, reload: true, int: true },
  { path: 'enemies.health', label: 'HP врага', step: 5 },
  { path: 'enemies.visionRange', label: 'Зрение врага', step: 2 },
  { path: 'enemies.attackRange', label: 'Дальность огня врага', step: 2 },
  { path: 'enemies.damage', label: 'Урон врага', step: 1 },
  { path: 'enemies.fireDelay', label: 'Пауза огня врага, с', step: 0.05 },

  { group: 'Чужой' },
  { path: 'alien.strike.damage', label: 'Удар рукой: урон', step: 5 },
  { path: 'alien.strike.reach', label: 'Удар рукой: длина', step: 0.2 },
  { path: 'alien.strike.cooldown', label: 'Удар рукой: пауза, с', step: 0.05 },
  { path: 'alien.leap.damage', label: 'Прыжок: урон при касании', step: 1 },
  { path: 'alien.leap.speed', label: 'Прыжок: скорость', step: 1 },

  { group: 'Мир' },
  { path: 'sun.intensity', label: 'Солнце', step: 0.1, world: true },
  { path: 'hemi.intensity', label: 'Полусфера', step: 0.05, world: true },
  { path: 'fog.far', label: 'Туман, дальность', step: 10, world: true },
  { path: 'camera.fov', label: 'FOV камеры', step: 1, camera: true },
];

const LABEL_HEIGHT = 0.5;   // м: высота таблички в мире

/**
 * Табличка с текстом: canvas по ширине строки, спрайт с `depthTest: false` —
 * иначе ближайшая стена отрежет половину id, и метку нельзя прочитать из угла.
 */
function makeLabel(text, x, y, z) {
  const font = 'bold 44px "Segoe UI", sans-serif';
  const measure = document.createElement('canvas').getContext('2d');
  measure.font = font;
  const w = Math.ceil(measure.measureText(text).width) + 20;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = 60;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(8,14,22,.78)';
  ctx.fillRect(0, 0, w, 60);
  ctx.strokeStyle = '#5fd0a8';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, 58);
  ctx.font = font;
  ctx.fillStyle = '#d9f2e6';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 10, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, toneMapped: false });
  const sp = new THREE.Sprite(mat);
  sp.position.set(x, y, z);
  sp.center.set(0.5, 0);   // табличка стоит над точкой, а не накрывает её
  const k = LABEL_HEIGHT / 60;
  sp.scale.set(w * k, LABEL_HEIGHT, 1);
  sp.renderOrder = 999;
  return sp;
}

/**
 * Отладочные метки id и координатная сетка на поверхности.
 *
 * Метки берёт у карты через необязательный член контракта `debugIds()` (панель не
 * знает схемы уровня и номеров глав). Чтобы не терять производительность, при
 * включении показываются только id ближайших к камере объектов (а не весь мир), и
 * набор обновляется по мере перемещения камеры/игрока.
 *
 * Вместе с метками включается сетка карты на поверхности с подписью координат
 * (x, z) в узлах — по ней можно понять, где стоят объекты, и ссылаться на
 * координаты. Сетка следует рельефу (высота узлов берётся из `groundHeightAt`).
 *
 * Набор живёт, только пока включён: при выключении/перестройке все текстуры,
 * материалы и геометрии `dispose()`-нятся (объекты сцены — требование AGENTS).
 * При смене главы перестраивается, т.к. `_buildLevel` создаёт новую сцену.
 */
function createIdLabels(game, onChange) {
  let labelsGroup = null;
  let gridGroup = null;
  let shownMap = null;
  let enabled = false;
  let lastCx = NaN, lastCz = NaN;

  const MAX_LABELS = 250;
  const MAX_LABEL_DIST = 350;
  const GRID_STEP = 50;
  const GRID_RADIUS = 200; // от центра камеры, в метрах

  const disposeObject = (obj) => {
    obj.traverse?.((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => { m.map?.dispose(); m.dispose(); });
        else { child.material.map?.dispose(); child.material.dispose(); }
      }
    });
  };

  const clearGroup = (g) => {
    if (!g) return null;
    for (const child of [...g.children]) disposeObject(child);
    g.clear();
    g.removeFromParent();
    return null;
  };

  const clear = () => {
    labelsGroup = clearGroup(labelsGroup);
    gridGroup = clearGroup(gridGroup);
    shownMap = null;
    lastCx = NaN; lastCz = NaN;
  };

  const focusPos = () => {
    // в debug-обзоре камера свободна; позиция камеры — лучший ориентир
    const cam = game.camera?.position;
    if (cam) return { x: cam.x, z: cam.z, y: cam.y };
    const p = game.player?.position;
    return { x: p?.x ?? 0, z: p?.z ?? 0, y: (p?.y ?? 0) };
  };

  const groundYAt = (map, x, z, hintY) => {
    if (!map || typeof map.groundHeightAt !== 'function') return (map?.groundY ?? 0);
    const y = map.groundHeightAt(x, z, hintY);
    return Number.isFinite(y) ? y : (map?.groundY ?? 0);
  };

  const makeGrid = (map, cx, cz, hintY) => {
    const g = new THREE.Group();
    g.name = 'debugGrid';
    const baseY = hintY ?? groundYAt(map, cx, cz, hintY);
    const minX = Math.floor((cx - GRID_RADIUS) / GRID_STEP) * GRID_STEP;
    const maxX = Math.ceil((cx + GRID_RADIUS) / GRID_STEP) * GRID_STEP;
    const minZ = Math.floor((cz - GRID_RADIUS) / GRID_STEP) * GRID_STEP;
    const maxZ = Math.ceil((cz + GRID_RADIUS) / GRID_STEP) * GRID_STEP;

    const yAt = (x, z) => groundYAt(map, x, z, baseY) + 0.05;

    const lineMat = new THREE.LineBasicMaterial({ color: 0x4aa3ff, transparent: true, opacity: 0.45, depthTest: false, toneMapped: false });
    const axisXMat = new THREE.LineBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.7, depthTest: false, toneMapped: false });
    const axisZMat = new THREE.LineBasicMaterial({ color: 0x6bff8a, transparent: true, opacity: 0.7, depthTest: false, toneMapped: false });

    const addLine = (pts, mat) => {
      if (pts.length < 2) return;
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geom, mat);
      line.renderOrder = 998;
      g.add(line);
    };

    // линии сетки вдоль X и Z, с высотой по рельефу
    for (let x = minX; x <= maxX + 1e-6; x += GRID_STEP) {
      const pts = [];
      for (let z = minZ; z <= maxZ + 1e-6; z += GRID_STEP) pts.push(new THREE.Vector3(x, yAt(x, z), z));
      addLine(pts, Math.abs(x) < 1e-6 ? axisZMat : lineMat);
    }
    for (let z = minZ; z <= maxZ + 1e-6; z += GRID_STEP) {
      const pts = [];
      for (let x = minX; x <= maxX + 1e-6; x += GRID_STEP) pts.push(new THREE.Vector3(x, yAt(x, z), z));
      addLine(pts, Math.abs(z) < 1e-6 ? axisXMat : lineMat);
    }

    // подписи координат в узлах (кратно GRID_STEP)
    for (let x = minX; x <= maxX + 1e-6; x += GRID_STEP) {
      for (let z = minZ; z <= maxZ + 1e-6; z += GRID_STEP) {
        const d2 = (x - cx) * (x - cx) + (z - cz) * (z - cz);
        if (d2 > (GRID_RADIUS + GRID_STEP) * (GRID_RADIUS + GRID_STEP)) continue;
        const label = makeLabel(`${Math.round(x)}, ${Math.round(z)}`, x, yAt(x, z) + 0.35, z);
        label.renderOrder = 998;
        g.add(label);
      }
    }
    return g;
  };

  const refresh = (force = false) => {
    const map = game.map;
    if (!enabled || !map || typeof map.debugIds !== 'function') {
      if (enabled) { clear(); onChange?.(); }
      return;
    }
    if (map !== shownMap) {
      clear();
      shownMap = map;
    }
    const pos = focusPos();
    const moved = !Number.isFinite(lastCx) || (pos.x - lastCx) ** 2 + (pos.z - lastCz) ** 2 > 25 * 25;
    if (!force && !moved && labelsGroup && gridGroup) return;
    lastCx = pos.x; lastCz = pos.z;

    // ближайшие id объектов к камере/игроку (ограничение для производительности)
    const all = map.debugIds();
    const withD = all.map(p => ({ p, d2: (p.x - pos.x) ** 2 + (p.z - pos.z) ** 2 }));
    withD.sort((a, b) => a.d2 - b.d2);
    const picked = [];
    const maxD2 = MAX_LABEL_DIST * MAX_LABEL_DIST;
    for (const it of withD) {
      if (picked.length >= MAX_LABELS) break;
      if (it.d2 > maxD2 && picked.length >= 80) break; // дальние — только если совсем пусто рядом
      picked.push(it.p);
    }

    labelsGroup = clearGroup(labelsGroup);
    labelsGroup = new THREE.Group();
    labelsGroup.name = 'debugIds';
    for (const p of picked) labelsGroup.add(makeLabel(p.text, p.x, p.y, p.z));
    game.scene.add(labelsGroup);

    gridGroup = clearGroup(gridGroup);
    gridGroup = makeGrid(map, pos.x, pos.z, pos.y);
    game.scene.add(gridGroup);

    onChange?.();
  };

  // Перестройка после загрузки главы: `_buildLevel` создаёт новую сцену и карта
  // меняется целиком (кнопка панели, смерть, переход к следующей главе).
  const original = game._loadLevel.bind(game);
  game._loadLevel = async (index) => {
    const r = await original(index);
    if (enabled) refresh(true);
    return r;
  };

  return {
    /** Включить/выключить метки и координатную сетку. Состояние переживает смену главы. */
    set(on) {
      enabled = on;
      if (on) refresh(true);
      else clear();
    },
    /** Обновить ближайшие метки/сетку при перемещении камеры (дёшево пропускает, если далеко не ушли). */
    update() { if (enabled) refresh(false); },
    count: () => (labelsGroup ? labelsGroup.children.length : 0),
    /** Включено ли отображение (для подписи/логики панели). */
    isEnabled: () => enabled,
  };
}

/**
 * Состояние клеток открытого мира и накопленная цена достройки (§ 4.4 плана
 * docs/open-world-plan.md): предел бюджета кадра назначается по этим числам,
 * а не по замыслу. Стримящая карта отличается **наличием** `streamStep`
 * (правило AGENTS.md), а не `map.kind`; схему уровня панель не пересобирает —
 * id клеток, их состояние и меры помпы она читает у самой карты.
 *
 * Три состояния клетки: «нет» (файл не прочитан), «грузится» (читается или
 * достраивается — между `commit` и `picture` клетка уже твёрдая, но ещё не
 * нарисованная), «построен» (`pic` есть). Цена — wall-clock последней достройки
 * этой клетки из очереди мер помпы: она включает сеть и разбор, которых в
 * бюджете кадра нет, поэтому рядом стоят худшие цены **срезов**.
 */
function streamText(map) {
  const pump = map.pump;
  const st = pump.stats;
  const cost = new Map();
  for (const c of st.chunks) if (c.kind !== 'unload') cost.set(c.id, c.ms);
  const state = (id) => {
    const entry = map.loaded.get(id);
    if (entry?.pic) return 'построен';
    if (entry || pump.requests.has(id) || pump.task?.id === id) return 'грузится';
    return 'нет';
  };
  const ms = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(0)} мс`);
  const task = pump.task;
  return [
    `Клетки мира: ${map.loaded.size} из ${map.cells.length} загружено`,
    `окно ${pump.radius.toFixed(0)} м, клетка ${map.stream.chunk} м, потолок кадра ${map.stream.budgetMs} мс`,
    `в работе: ${task ? `${task.id} (${task.kind}, срез ${task.sliceDone}/${task.sliceTotal})` : 'нет'}, чтений ${pump.requests.size}`
      + `, срезов ${st.slices}, достроек ${st.built}, выгрузок ${st.unloaded}, ошибок ${st.errors}`,
    `до играбельного окна ${ms(st.firstChunkMs)}, худшая клетка ${st.worstChunkMs.toFixed(0)} мс (${st.worstChunk ?? '—'})`,
    `худший срез ${st.worstSliceMs.toFixed(1)} мс (${st.worstSlice ?? '—'})`,
    `худшие цены срезов: ${[...pump.costWorst].map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ') || '—'}`,
    ...map.cells.map((c) => `${c.id} — ${state(c.id)}${cost.has(c.id) ? `, ${cost.get(c.id).toFixed(0)} мс` : ''}`),
  ].join('\n');
}

export function mountDebug(game) {
  let idsOn = false;
  let idsBtn = null;
  let idsNote = null;
  let streamBox = null;

  // смена подписи — одна функция на кнопку и на перестройку меток после загрузки
  // главы: застывшее число после перехода в другую главу вводило бы в заблуждение
  const syncIdsBtn = () => {
    if (!idsBtn) return;
    if (!idsOn) {
      idsBtn.textContent = 'Показать id объектов';
      idsNote.textContent = '';
      return;
    }
    const n = idLabels.count();
    idsBtn.textContent = `Скрыть id объектов (${n})`;
    idsNote.textContent = n
      ? 'показаны ближайшие id и сетка координат (x,z) на поверхности'
      : 'меток нет: главе нечего подписывать';
  };

  const idLabels = createIdLabels(game, syncIdsBtn);

  const syncStream = () => {
    if (!streamBox) return;
    const map = game.map;
    const on = typeof map?.streamStep === 'function';
    streamBox.style.display = on ? '' : 'none';
    if (on) streamBox.textContent = streamText(map);
  };

  const panel = document.createElement('div');
  panel.id = 'debugPanel';
  panel.style.cssText =
    'position:fixed;top:8px;right:8px;z-index:1000;width:270px;max-height:calc(100vh - 16px);' +
    'overflow-y:auto;background:rgba(10,16,24,.92);color:#cfe0f4;padding:10px 12px;' +
    'font:12px/1.5 "Segoe UI",sans-serif;border:1px solid #2b3d55;border-radius:8px;';

  const render = () => {
    panel.innerHTML = '';

    const title = document.createElement('div');
    title.textContent = 'Отладка';
    title.style.cssText = 'font-weight:700;font-size:14px;margin-bottom:6px;color:#fff;';
    panel.appendChild(title);

    // выбор главы
    const select = document.createElement('select');
    select.style.cssText = 'width:100%;margin-bottom:6px;background:#14202e;color:#cfe0f4;border:1px solid #2b3d55;padding:4px;';
    LEVELS.forEach((l, i) => {
      const opt = document.createElement('option');
      opt.value = String(i);
      const title = l.name.replace(/^Глава\s+\d+\.\s*/, '');
      opt.textContent = `${LEVEL_NUMBERS[i]}. ${title}`;
      if (i === game.levelIndex) opt.selected = true;
      select.appendChild(opt);
    });
    panel.appendChild(select);

    const mkBtn = (text, handler) => {
      const btn = document.createElement('button');
      btn.textContent = text;
      btn.style.cssText =
        'width:100%;margin:2px 0 6px;padding:5px;cursor:pointer;border:1px solid #2b3d55;' +
        'border-radius:5px;background:#1c3550;color:#cfe0f4;';
      btn.addEventListener('click', e => { e.stopPropagation(); handler(); });
      panel.appendChild(btn);
      return btn;
    };
    mkBtn('Загрузить выбранную главу', () => game._loadLevel(Number(select.value)));
    mkBtn('Перезагрузить текущую главу', () => game._loadLevel(game.levelIndex));

    idsBtn = mkBtn('Показать id объектов', () => {
      idsOn = !idsOn;
      idLabels.set(idsOn);
      syncIdsBtn();
    });

    idsNote = document.createElement('div');
    idsNote.style.cssText = 'margin:-4px 0 6px;color:#7d94ad;font-size:11px;';
    panel.appendChild(idsNote);
    syncIdsBtn();

    // блок потока живёт только у стримящей карты: у главы-улицы показывать
    // нечего, а пустая рамка обещала бы механизм, которого в карте нет
    streamBox = document.createElement('div');
    streamBox.style.cssText =
      'display:none;margin:0 0 6px;padding:6px;border:1px solid #22344c;border-radius:5px;'
      + 'background:#101a26;color:#9fd8b8;font:11px/1.45 "Segoe UI",sans-serif;white-space:pre-wrap;';
    panel.appendChild(streamBox);
    syncStream();

    // --- обзор уровня: свободная камера на паузе (симуляция не идёт) ---
    const overview = (label, pos, look, up) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.cssText =
        'flex:1;min-width:0;margin:1px;padding:4px 2px;cursor:pointer;border:1px solid #2b3d55;'
        + 'border-radius:4px;background:#142638;color:#cfe0f4;font:11px "Segoe UI",sans-serif;';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const map = game.map;
        if (!map) return;
        // пауза без карточки: _onUnlock вернётся рано, если state уже не 'playing'
        if (game.state === 'playing') { game.state = 'paused'; game.hud.hide(); }
        game.player?.unlock?.();
        game.camera.up.set(up?.[0] ?? 0, up?.[1] ?? 1, up?.[2] ?? 0);
        game.camera.position.set(pos[0], pos[1], pos[2]);
        game.camera.lookAt(look[0], look[1], look[2]);
        // камера могла уехать далеко — туман не должен резать обзор целиком
        if (game.scene?.fog && game.scene.fog.far < Math.abs(pos[1]) * 3) {
          game.scene.fog.far = Math.abs(pos[1]) * 4;
        }
      });
      return btn;
    };
    const addOverview = () => {
      const h = document.createElement('div');
      h.textContent = 'Обзор уровня';
      h.style.cssText = 'margin:8px 0 4px;font-weight:600;color:#8fb8e8;border-top:1px solid #22344c;padding-top:6px;';
      panel.appendChild(h);
      const map = game.map;
      const half = map?.half ?? map?.width / 2 ?? 100;
      const gy = map?.groundY ?? 0;
      const cy = Math.max(60, half * 0.18) + gy;
      const d = half * 1.35;
      const topY = half * 1.45 + gy;
      const row = (btns) => {
        const r = document.createElement('div');
        r.style.cssText = 'display:flex;gap:2px;margin:2px 0;';
        for (const b of btns) r.appendChild(b);
        panel.appendChild(r);
      };
      row([
        overview('Сверху', [0, topY, 0.01], [0, gy, 0], [0, 0, -1]),
        overview('К спавну', [map?.spawn?.x ?? 0, (map?.spawn?.y ?? gy) + 1.7, (map?.spawn?.z ?? 0) + 0.01], [map?.spawn?.x ?? 0, (map?.spawn?.y ?? gy) + 1.7, (map?.spawn?.z ?? 0)], [0, 1, 0]),
      ]);
      row([
        overview('Сев. +Z', [0, cy, d], [0, gy, 0]),
        overview('Юг −Z', [0, cy, -d], [0, gy, 0]),
      ]);
      row([
        overview('Зап. −X', [-d, cy, 0], [0, gy, 0]),
        overview('Вост. +X', [d, cy, 0], [0, gy, 0]),
      ]);
      row([
        overview('ЮЗ', [-d * 0.8, cy * 1.2, -d * 0.8], [0, gy, 0]),
        overview('СВ', [d * 0.8, cy * 1.2, d * 0.8], [0, gy, 0]),
      ]);
      const note = document.createElement('div');
      note.textContent = 'Обзор ставит паузу и отпускает курсор; клик по игре — вернуться.';
      note.style.cssText = 'margin:2px 0 4px;color:#7d94ad;font-size:11px;';
      panel.appendChild(note);
    };
    addOverview();

    for (const f of FIELDS) {
      if (f.group) {
        const h = document.createElement('div');
        h.textContent = f.group;
        h.style.cssText = 'margin:8px 0 4px;font-weight:600;color:#8fb8e8;border-top:1px solid #22344c;padding-top:6px;';
        panel.appendChild(h);
        continue;
      }
      const row = document.createElement('label');
      row.style.cssText = 'display:flex;align-items:center;gap:6px;margin:3px 0;';
      const text = document.createElement('span');
      text.textContent = f.label + (f.reload ? ' ⟳' : '');
      text.style.cssText = 'flex:1;';
      const input = document.createElement('input');
      input.type = 'number';
      input.step = String(f.step);
      input.value = String(get(CONFIG, f.path));
      input.style.cssText = 'width:64px;background:#14202e;color:#cfe0f4;border:1px solid #2b3d55;border-radius:4px;padding:2px 4px;';
      input.addEventListener('change', () => {
        let v = f.int ? Math.round(Number(input.value)) : Number(input.value);
        if (!Number.isFinite(v)) return;
        if (f.path === 'enemies.count' || f.path === 'alienEnemies.count') v = Math.max(0, v);
        set(CONFIG, f.path, v);
        if (f.camera) {
          game.camera.fov = v;
          game.camera.updateProjectionMatrix();
        }
        if (f.world) {
          // карта теней заморожена — пересчитать после правки света/тумана
          if (game.sun) game.sun.intensity = get(CONFIG, 'sun.intensity');
          if (game.hemi) game.hemi.intensity = get(CONFIG, 'hemi.intensity');
          if (game.scene.fog) game.scene.fog.far = get(CONFIG, 'fog.far');
          game.renderer.shadowMap.needsUpdate = true;
        }
      });
      row.appendChild(text);
      row.appendChild(input);
      panel.appendChild(row);
    }

    const note = document.createElement('div');
    note.textContent = '⟳ — применяется после перезагрузки главы';
    note.style.cssText = 'margin-top:8px;color:#7d94ad;font-size:11px;';
    panel.appendChild(note);
  };

  render();
  document.body.appendChild(panel);

  // Числа помпы и позиция камеры (для ближайших меток/сетки) меняются во времени,
  // поэтому обновление — четыре раза в секунду. Цепочка кадров кончается сама, когда
  // панель снята с документа: отдельного слушателя на window она не оставляет.
  let lastTick = 0;
  const watchStream = (now) => {
    if (!panel.isConnected) return;
    if (now - lastTick >= 250) {
      lastTick = now;
      syncStream();
      if (idsOn) idLabels.update();
    }
    requestAnimationFrame(watchStream);
  };
  requestAnimationFrame(watchStream);
  return panel;
}
