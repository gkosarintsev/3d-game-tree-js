import { Game } from './game.js';

import { CONFIG } from './config.js';

const game = new Game();
game.start();
// отладочная точка входа для консоли страницы (см. AGENTS.md); модули её не используют
window.game = game;

// отладочное меню (выбор глав, live-параметры) — только с ?debug=1, см. src/debug.js
if (new URLSearchParams(location.search).has('debug')) {
  import('./debug.js').then(m => m.mountDebug(game));
}

// отладочный переключатель физики (Часть II плана открытого мира): 'own' по
// умолчанию и эталон вердиктов; 'rapier' — @dimforge/rapier3d-compat. Читается
// до загрузки главы, чтобы первая сборка уже шла в выбранном режиме.
const physicsMode = new URLSearchParams(location.search).get('physics');
if (physicsMode === 'own' || physicsMode === 'rapier') {
  CONFIG.physics.mode = physicsMode;
}
