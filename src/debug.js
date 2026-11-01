/**
 * Отладочное меню: открывается страницей игры с параметром ?debug=1.
 *
 * Даёт менять параметры CONFIG на лету (движок читает их каждый кадр) и
 * загружать любую главу напрямую. Поля со значком ⟳ влияют только после
 * перезагрузки главы (сущности создаются при загрузке).
 *
 * Это единственная панель UI вне hud.js — осознанное исключение (AGENTS.md):
 * она не участвует в игровом процессе и не открывается без ?debug=1.
 */
import { CONFIG } from './config.js';
import { LEVELS } from './levels/index.js';

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

export function mountDebug(game) {
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
      opt.textContent = `${i + 1}. ${l.name}`;
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
  return panel;
}
