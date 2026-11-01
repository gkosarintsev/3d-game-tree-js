/** Слой интерфейса: статистика, здоровье, миникарта, оверлеи всех экранов игры. */
export class Hud {
  constructor() {
    this.overlay = document.getElementById('overlay');
    this.card = this.overlay.querySelector('.card');
    this.helpEl = document.getElementById('help');
    this.coinsEl = document.getElementById('coins');
    this.timeEl = document.getElementById('time');
    this.hpEl = document.getElementById('hp');
    this.hpFill = document.getElementById('hpFill');
    this.killsEl = document.getElementById('kills');
    this.damageEl = document.getElementById('damage');
    this.hitEl = document.getElementById('hitmark');
    this.minimap = document.getElementById('minimap');
    this.ctx = this.minimap.getContext('2d');
    this.coinsLbl = this.coinsEl.parentElement.querySelector('.lbl');
    this._exitMode = false;
    this._hitTimer = 0;
    this._lockHandler = null;

    // постоянная метка текущей главы над игровым экраном
    this.chapterEl = document.createElement('div');
    this.chapterEl.style.cssText =
      'position:absolute;top:8px;left:50%;transform:translateX(-50%);' +
      'color:#e8f1ff;font:600 15px "Segoe UI",sans-serif;' +
      'text-shadow:0 1px 4px rgba(0,0,0,.65);pointer-events:none;';
    document.body.appendChild(this.chapterEl);
  }

  /** Клик по оверлею запрашивает захват курсора (обработчик задаёт игра). */
  requestLock(handler) {
    this._lockHandler = handler;
    this.overlay.addEventListener('click', () => handler());
  }

  /** Экран выбора персонажа: две карточки с ролями. */
  showCharacterSelect(onPick) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>3D <span>Шутер</span></h1>
      <p class="lead">Выберите, за кого играть</p>
      <div class="roles">
        <div class="role" data-role="human">
          <h2>Человек</h2>
          <p>Автомат, огонь по <kbd>ЛКМ</kbd>. Ходит по полу и лестницам, укрывается за стенами.</p>
        </div>
        <div class="role" data-role="alien">
          <h2>Чужой</h2>
          <p>Быстрее человека, лазает по стенам и потолку. <kbd>ЛКМ</kbd> — прыжок-скачок (~20 юнитов): попадёт во врага — тот получит урон.</p>
        </div>
      </div>`;
    this.card.querySelectorAll('.role').forEach(el => {
      el.addEventListener('click', e => {
        e.stopPropagation();
        onPick(el.dataset.role);
      });
    });
  }

  /** Подсказки управления под выбранную роль. */
  setRole(role) {
    if (role === 'alien') {
      this.helpEl.innerHTML = `
        <b>Чужой</b><br>
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> — движение<br>
        <kbd>Мышь</kbd> — обзор, <kbd>Shift</kbd> — бег<br>
        <kbd>ЛКМ</kbd> — скачок, <kbd>Space</kbd> — отрыв, <kbd>Esc</kbd> — пауза`;
    } else {
      this.helpEl.innerHTML = `
        <b>Управление</b><br>
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> — движение<br>
        <kbd>Мышь</kbd> — обзор, <kbd>Shift</kbd> — бег<br>
        <kbd>ЛКМ</kbd> — огонь, <kbd>Space</kbd> — прыжок, <kbd>Esc</kbd> — пауза`;
    }
  }

  /** Метка текущей главы в углу игрового экрана. */
  setChapter(name) {
    this.chapterEl.textContent = name ?? '';
  }

  /** Интертитр главы перед стартом: название, подсказка, кнопка начала. */
  showChapter(level, onGo) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>${level.name}</h1>
      <p class="lead">${level.hint ?? 'Кликните, чтобы начать.'}</p>
      <div class="btn" id="go">Начать главу</div>`;
    document.getElementById('go').addEventListener('click', e => {
      e.stopPropagation();
      onGo();
    });
  }

  /** Глава пройдена: время главы и переход к следующей. */
  showLevelComplete(level, timeText, nextLevel, onNext) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Глава пройдена</h1>
      <p>${level.name} — время ${timeText}. Впереди: ${nextLevel.name}.</p>
      <div class="btn" id="next">Далее</div>`;
    document.getElementById('next').addEventListener('click', e => {
      e.stopPropagation();
      onNext();
    });
  }

  hide() { this.overlay.classList.add('hidden'); }

  showPause() {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Пауза</h1>
      <p>Кликните, чтобы вернуться в игру.</p>
      <div class="actions">
        <div class="btn" id="btn">Продолжить</div>
        <div class="btn ghost" id="restart">Играть снова</div>
      </div>`;
    document.getElementById('btn').addEventListener('click', e => {
      e.stopPropagation();
      if (this._lockHandler) this._lockHandler();
    });
    // «Играть снова» — с начала: возврат к выбору персонажа
    document.getElementById('restart').addEventListener('click', e => {
      e.stopPropagation();
      location.reload();
    });
  }

  showWin(timeText) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Все главы пройдены!</h1>
      <p>Общее время забега — ${timeText}.</p>
      <div class="btn" id="again">Играть снова</div>`;
    document.getElementById('again').addEventListener('click', e => { e.stopPropagation(); location.reload(); });
  }

  /** Смерть: «Заново» перезапускает текущую главу (onRetry), без onRetry — весь забег. */
  showDeath(onRetry) {
    this.overlay.classList.remove('hidden');
    this.card.innerHTML = `
      <h1>Вы <span>погибли</span></h1>
      <p>Враги оказались быстрее. Попробуйте ещё раз.</p>
      <div class="btn" id="again">Заново</div>`;
    document.getElementById('again').addEventListener('click', e => {
      e.stopPropagation();
      if (onRetry) onRetry();
      else location.reload();
    });
  }

  /**
   * Режим цели главы: 'exit' — строка статистики показывает расстояние до
   * точки B вместо монет.
   */
  setGoalMode(isExit) {
    this._exitMode = isExit;
    this.coinsLbl.textContent = isExit ? 'До точки B' : 'Монеты';
    this.coinsEl.textContent = isExit ? '—' : '0 / 0';
  }

  setExitDistance(meters) {
    if (!this._exitMode) return;
    this.coinsEl.textContent = `${Math.max(0, Math.round(meters))} м`;
  }

  setCoins(collected, total) {
    if (this._exitMode) return;
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

  /** Рисует миникарту: план текущего этажа, монеты, врагов, точку B и маркер игрока. */
  drawMinimap(map, coins, playerPos, forward, enemies, exit = null) {
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

    if (exit) {
      const [eu, ev] = map.worldToNormalized(exit.x, exit.z);
      ctx.strokeStyle = 'rgba(111,232,221,.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eu * size, ev * size, size * 0.03, 0, Math.PI * 2);
      ctx.stroke();
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
