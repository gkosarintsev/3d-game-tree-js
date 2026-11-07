import { Game } from './game.js';

const game = new Game();
game.start();
// отладочная точка входа для консоли страницы (см. AGENTS.md); модули её не используют
window.game = game;

// отладочное меню (выбор глав, live-параметры) — только с ?debug=1, см. src/debug.js
if (new URLSearchParams(location.search).has('debug')) {
  import('./debug.js').then(m => m.mountDebug(game));
}
