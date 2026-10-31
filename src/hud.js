import { CONFIG } from './config.js';

/** Слой интерфейса: статистика, здоровье, миникарта, оверлеи старта/паузы/победы. */
export class Hud {
  constructor() {
    this.overlay = document.getElementById('overlay');
    this.card = this.overlay.querySelector('.card');
    this.btn = document.getElementById('btn');
    this.subtitle = document.getElementById('subtitle');
    this.coinsEl = document.getElementById('coins');
    this.timeEl = document.getElementById('time');
    this.hpEl = document.getElementById('hp');
    this.hpFill = document.getElementById('hpFill');
    this.killsEl = document.getElementById('kills');
    this.damageEl = document.getElementById('damage');
    this.hitEl = document.getElementById('hitmark');
    this.minimap = document.getElementById('minimap');
    this.ctx = this.minimap.getContext('2d');
    this._hitTimer = 0;
  }

  /** Клик по оверлею или кнопке запрашивает захват курсора. */
  requestLock(handler) {
    this.btn.addEventListener('click', e => { e.stopPropagation(); handler(); });
    this.overlay.addEventListener('click', () => handler());
  }

  hide() { this.overlay.classList.add('hidden'); }

  showPause() {
    this.overlay.classList.remove('hidden');
    this.btn.textContent = 'Продолжить';
    this.subtitle.textContent = 'Пауза. Клик — вернуться в дом.';
  }

  showWin(timeText) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Победа!</h1>
      <p>Все ${CONFIG.totalCoins} монет собраны за ${timeText}.</p>
      <div class="btn" id="again">Играть снова</div>`;
    document.getElementById('again').addEventListener('click', e => { e.stopPropagation(); location.reload(); });
  }

  showDeath() {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Вы <span>погибли</span></h1>
      <p>Враги оказались быстрее. Попробуйте ещё раз.</p>
      <div class="btn" id="again">Заново</div>`;
    document.getElementById('again').addEventListener('click', e => { e.stopPropagation(); location.reload(); });
  }

  setCoins(collected, total) {
    this.coinsEl.textContent = `${collected} / ${total}`;
  }

  setTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    this.timeEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  }

  /** Полоса здоровья: длина и цвет зависят от остатка. */
  setHealth(hp, max) {
    const pct = Math.max(0, Math.min(1, hp / max));
    this.hpFill.style.width = `${pct * 100}%`;
    this.hpEl.textContent = String(Math.max(0, Math.ceil(hp)));
    this.hpFill.style.background = pct > 0.5 ? '#4ad06b' : pct > 0.25 ? '#e2b13c' : '#e2503c';
  }

  setKills(kills) {
    this.killsEl.textContent = String(kills);
  }

  /** Красная вспышка по краям экрана при получении урона (0..1). */
  flashDamage(intensity) {
    this.damageEl.style.opacity = String(Math.max(0, Math.min(1, intensity)) * 0.9);
  }

  /** Кратковременный маркер попадания у прицела. */
  hitMarker() {
    this.hitEl.style.opacity = '1';
    clearTimeout(this._hitTimer);
    this._hitTimer = setTimeout(() => { this.hitEl.style.opacity = '0'; }, 100);
  }

  /** Рисует миникарту: план текущего этажа, монеты, врагов и маркер игрока. */
  drawMinimap(map, coins, playerPos, forward, enemies) {
    const size = this.minimap.width;
    const ctx = this.ctx;

    ctx.fillStyle = '#0a1018';
    ctx.fillRect(0, 0, size, size);

    map.drawMinimap(ctx, size, playerPos);

    ctx.fillStyle = 'rgba(255,215,106,.95)';
    coins.forEachVisible(pos => {
      const [u, v] = map.worldToNormalized(pos.x, pos.z);
      ctx.beginPath();
      ctx.arc(u * size, v * size, size * 0.012, 0, Math.PI * 2);
      ctx.fill();
    });

    if (enemies) {
      ctx.fillStyle = 'rgba(255,84,72,.95)';
      enemies.forEachVisible(pos => {
        const [u, v] = map.worldToNormalized(pos.x, pos.z);
        ctx.beginPath();
        ctx.arc(u * size, v * size, size * 0.014, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const [pu, pv] = map.worldToNormalized(playerPos.x, playerPos.z);
    ctx.save();
    ctx.translate(pu * size, pv * size);
    ctx.rotate(Math.atan2(forward.x, -forward.z));
    ctx.fillStyle = '#5aa9ff';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.022);
    ctx.lineTo(size * 0.015, size * 0.018);
    ctx.lineTo(-size * 0.015, size * 0.018);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
