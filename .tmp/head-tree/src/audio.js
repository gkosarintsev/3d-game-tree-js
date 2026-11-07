let actx = null;

/** Короткий синтезированный звук (Web Audio). */
export function beep(freq, dur = 0.09, type = 'sine') {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.12, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + dur);
  } catch (_) { /* звук не критичен для игры */ }
}

/** Победная мелодия. */
export function winTune() {
  beep(660, 0.12);
  setTimeout(() => beep(880, 0.12), 130);
  setTimeout(() => beep(1180, 0.22), 260);
}
