import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eye,
  RotateCcw,
  Skull,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type {
  HitZone,
  InteractionMode,
  XenomorphAnimState,
  XenomorphHudSnapshot,
} from './xenomorph/types';
import {
  XenomorphViewport,
  type XenomorphViewportHandle,
} from './xenomorph/XenomorphViewport';

const ANIM_BUTTONS: Array<{
  id: XenomorphAnimState;
  label: string;
  keyHint: string;
}> = [
  { id: 'idle', label: 'Покой', keyHint: '1' },
  { id: 'walk', label: 'Ходит', keyHint: '2' },
  { id: 'run', label: 'Бежит', keyHint: '3' },
  { id: 'attack', label: 'Атака руками', keyHint: '4' },
  { id: 'leap', label: 'Прыжок вперёд', keyHint: '5' },
  { id: 'crawl', label: 'Стены / потолок', keyHint: '7' },
  { id: 'death', label: 'Смерть + Ragdoll', keyHint: '6' },
];

const STATE_LABELS: Record<XenomorphAnimState, string> = {
  idle: 'Покой',
  walk: 'Ходьба',
  run: 'Бег',
  attack: 'Атака руками',
  leap: 'Длинный прыжок',
  crawl: 'Ползание по стенам и потолку',
  death: 'Агония',
  ragdoll: 'Ragdoll-физика',
};

const ZONE_LABELS: Record<HitZone, string> = {
  head: 'Голова x2.5',
  torso: 'Торс x1.0',
  limb: 'Конечность x0.7',
  tail: 'Хвост x0.5',
};

const INITIAL_HUD: XenomorphHudSnapshot = {
  animState: 'idle',
  mode: 'showcase',
  cameraMode: 'orbit',
  hp: 180,
  maxHp: 180,
  kills: 0,
  shotsFired: 0,
  shotsHit: 0,
  lastHitZone: null,
  lastDamage: 0,
  showPhysicsDebug: false,
  muted: false,
  speedMultiplier: 1,
};

export default function App() {
  const viewportRef = useRef<XenomorphViewportHandle | null>(null);
  const [hud, setHud] = useState<XenomorphHudSnapshot>(INITIAL_HUD);
  const [ghostHp, setGhostHp] = useState(INITIAL_HUD.hp);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [hitPopup, setHitPopup] = useState<{
    zone: HitZone;
    damage: number;
    killed: boolean;
    key: number;
  } | null>(null);

  // Sync body dataset attributes for deterministic testing & state tracking
  useEffect(() => {
    document.body.dataset.state = 'playing';
    document.body.dataset.anim = hud.animState;
    document.body.dataset.mode = hud.mode;
  }, [hud.animState, hud.mode]);

  // Delayed trailing HP ghost bar
  useEffect(() => {
    if (ghostHp <= hud.hp) {
      setGhostHp(hud.hp);
      return;
    }
    const timer = window.setTimeout(() => {
      setGhostHp(hud.hp);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [hud.hp, ghostHp]);

  // Auto-fade hit marker popup
  useEffect(() => {
    if (!hitPopup) return;
    const timer = window.setTimeout(() => setHitPopup(null), 650);
    return () => window.clearTimeout(timer);
  }, [hitPopup]);

  const handleHudUpdate = useCallback((snapshot: XenomorphHudSnapshot) => {
    setHud(snapshot);
  }, []);

  const handleHitMarker = useCallback(
    (zone: HitZone, damage: number, killed: boolean) => {
      setHitPopup({ zone, damage, killed, key: Date.now() });
    },
    [],
  );

  const selectAnim = useCallback((state: XenomorphAnimState) => {
    viewportRef.current?.setAnimState(state);
  }, []);

  const handleRespawn = useCallback(() => {
    viewportRef.current?.respawn();
  }, []);

  const handleModeChange = useCallback((mode: InteractionMode) => {
    viewportRef.current?.setMode(mode);
  }, []);

  const toggleCamera = useCallback(() => {
    viewportRef.current?.setCameraMode(
      hud.cameraMode === 'orbit' ? 'follow' : 'orbit',
    );
  }, [hud.cameraMode]);

  const togglePhysicsDebug = useCallback(() => {
    viewportRef.current?.setShowPhysicsDebug(!hud.showPhysicsDebug);
  }, [hud.showPhysicsDebug]);

  const toggleMute = useCallback(() => {
    viewportRef.current?.setMuted(!hud.muted);
  }, [hud.muted]);

  const setSpeed = useCallback((speed: number) => {
    viewportRef.current?.setSpeedMultiplier(speed);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === '1') selectAnim('idle');
      else if (key === '2') selectAnim('walk');
      else if (key === '3') selectAnim('run');
      else if (key === '4') selectAnim('attack');
      else if (key === '5') selectAnim('leap');
      else if (key === '6') selectAnim('death');
      else if (key === '7') selectAnim('crawl');
      else if (key === 'r' || key === 'к') handleRespawn();
      else if (key === 'v' || key === 'м') togglePhysicsDebug();
      else if (key === 'm' || key === 'ь') toggleMute();
      else if (key === 'h' || key === 'р') setDockCollapsed((c) => !c);
      else if (key === ' ' && hud.mode === 'shooter') {
        e.preventDefault();
        viewportRef.current?.fireAtCenter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    hud.mode,
    selectAnim,
    handleRespawn,
    togglePhysicsDebug,
    toggleMute,
  ]);

  const hpPct = Math.round((hud.hp / hud.maxHp) * 100);
  const ghostPct = Math.round((ghostHp / hud.maxHp) * 100);
  const accuracyPct =
    hud.shotsFired > 0
      ? Math.round((hud.shotsHit / hud.shotsFired) * 100)
      : 0;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#080c11] text-slate-100">
      {/* Isolated Full-Bleed Three.js Canvas */}
      <div className="absolute inset-0">
        <XenomorphViewport
          ref={viewportRef}
          onHudUpdate={handleHudUpdate}
          onHitMarker={handleHitMarker}
        />
      </div>

      {/* Pointer-transparent HUD Overlay Layer */}
      <div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-4 sm:p-5">
        {/* Top Row: Brand Title + Compact Utility Controls */}
        <div className="flex items-start justify-between gap-4">
          <div className="px-3.5 py-2 rounded-lg bg-[#0a0e14]/88 border border-white/10">
            <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-50 leading-tight">
              Xenomorph XX121
            </h1>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
              <span>{STATE_LABELS[hud.animState]}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular text-amber-400">
                {hud.mode === 'shooter' ? 'Режим шутера' : 'Обзор и анимации'}
              </span>
            </div>
          </div>

          {/* Shooter Target HP Bar (Top Center when in Shooter Mode) */}
          {hud.mode === 'shooter' && (
            <div
              data-testid="shooter-hp-panel"
              className="hidden md:flex flex-col items-center w-72 px-4 py-2 rounded-lg bg-[#0a0e14]/90 border border-white/12"
            >
              <div className="w-full flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300">
                  Особь XX121
                </span>
                <span className="font-mono-tabular text-slate-200 font-semibold">
                  {hud.hp} / {hud.maxHp}
                </span>
              </div>
              <div className="relative w-full h-2 rounded-sm bg-slate-800 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-amber-400/60 transition-all duration-300"
                  style={{ width: `${ghostPct}%` }}
                />
                <div
                  className="relative h-full bg-lime-400 transition-all duration-75"
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <div className="w-full flex items-center justify-between mt-1.5 text-[11px] text-slate-400 font-mono-tabular">
                <span>Убито: {hud.kills}</span>
                <span>Точность: {accuracyPct}%</span>
              </div>
            </div>
          )}

          {/* Top-Right Compact Icon Utilities */}
          <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-lg bg-[#0a0e14]/88 border border-white/10">
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleCamera();
              }}
              aria-label={
                hud.cameraMode === 'orbit'
                  ? 'Включить следящую камеру'
                  : 'Включить свободную камеру'
              }
              title={
                hud.cameraMode === 'orbit'
                  ? 'Камера: Свободная (Orbit)'
                  : 'Камера: Следящая (Follow)'
              }
              className={`h-9 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                hud.cameraMode === 'follow'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">
                {hud.cameraMode === 'follow' ? 'Следящая' : 'Орбита'}
              </span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                togglePhysicsDebug();
              }}
              aria-label="Показать скелет и Ragdoll-ограничения"
              title="Скелет и Ragdoll (V)"
              className={`h-9 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                hud.showPhysicsDebug
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Кости [V]</span>
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                toggleMute();
              }}
              aria-label={hud.muted ? 'Включить звук' : 'Выключить звук'}
              title="Звук (M)"
              className="w-9 h-9 rounded-md flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
            >
              {hud.muted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.currentTarget.blur();
                handleRespawn();
              }}
              aria-label="Возродить особь"
              title="Возродить (R)"
              className="h-9 px-2.5 rounded-md flex items-center gap-1.5 text-xs font-medium text-slate-200 bg-white/8 hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сброс [R]</span>
            </button>
          </div>
        </div>

        {/* Center Crosshair & Hit Marker (Shooter Mode Only) */}
        {hud.mode === 'shooter' && (
          <div className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              aria-hidden="true"
              className="opacity-90"
            >
              <circle
                cx="18"
                cy="18"
                r="8"
                stroke={hitPopup ? '#a3e635' : '#38bdf8'}
                strokeWidth="1.4"
                strokeOpacity="0.85"
              />
              <line x1="18" y1="2" x2="18" y2="8" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="18" y1="28" x2="18" y2="34" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="2" y1="18" x2="8" y2="18" stroke="#e2e8f0" strokeWidth="1.5" />
              <line x1="28" y1="18" x2="34" y2="18" stroke="#e2e8f0" strokeWidth="1.5" />
              <circle cx="18" cy="18" r="1.5" fill={hitPopup ? '#a3e635' : '#f59e0b'} />
            </svg>

            {hitPopup && (
              <div
                key={hitPopup.key}
                className="mt-2 px-2 py-0.5 rounded bg-[#0a0e14]/90 border border-lime-400/40 text-[11px] font-mono-tabular text-lime-300 whitespace-nowrap"
              >
                -{hitPopup.damage} · {ZONE_LABELS[hitPopup.zone]}
                {hitPopup.killed ? ' · RAGDOLL' : ''}
              </div>
            )}
          </div>
        )}

        {/* Unified Collapsible Bottom Control Dock */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              setDockCollapsed((prev) => !prev);
            }}
            aria-expanded={!dockCollapsed}
            className="pointer-events-auto mb-1.5 px-3 py-1 rounded-md bg-[#0a0e14]/90 border border-white/12 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Показать управление [H]</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Скрыть панель [H]</span>
              </>
            )}
          </button>

          <div
            className={`pointer-events-auto w-full max-w-[1060px] rounded-xl bg-[#0a0e14]/92 border border-white/12 p-3 transition-transform duration-200 ease-out ${
              dockCollapsed ? 'translate-y-[120%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
            }`}
          >
            {/* Row 1: Mode Switcher + Speed + Shooter Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-white/10">
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleModeChange('showcase');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    hud.mode === 'showcase'
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Анимации и обзор
                </button>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleModeChange('shooter');
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    hud.mode === 'shooter'
                      ? 'bg-lime-400 text-slate-950 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Тест в 3D-шутере</span>
                </button>
              </div>

              <div className="hidden md:block text-xs text-slate-400 truncate max-w-[380px]">
                {hud.mode === 'shooter'
                  ? 'ЛКМ — выстрел (голова 2.5x · смерть включает Ragdoll)'
                  : 'ЛКМ — орбита · Колёсико — зум · 1–7 — анимации'}
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10">
                {[0.5, 1, 1.5].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.currentTarget.blur();
                      setSpeed(spd);
                    }}
                    className={`px-2 py-1 rounded text-[11px] font-mono-tabular transition-colors ${
                      hud.speedMultiplier === spd
                        ? 'bg-white/18 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Animation State Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {ANIM_BUTTONS.map((btn) => {
                  const isDeathBtn = btn.id === 'death';
                  const isActive =
                    hud.animState === btn.id ||
                    (isDeathBtn && hud.animState === 'ragdoll');
                  return (
                    <button
                      key={btn.id}
                      type="button"
                      tabIndex={-1}
                      data-anim-btn={btn.id}
                      onClick={(e) => {
                        e.currentTarget.blur();
                        selectAnim(btn.id);
                      }}
                      className={`h-10 px-3 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap ${
                        isActive
                          ? isDeathBtn
                            ? 'bg-red-500/25 text-red-200 border border-red-400/60'
                            : 'bg-amber-500/20 text-amber-200 border border-amber-400/50'
                          : 'bg-white/6 text-slate-300 border border-white/8 hover:bg-white/12 hover:text-white'
                      }`}
                    >
                      {isDeathBtn && <Skull className="w-3.5 h-3.5 text-red-400" />}
                      <span>{btn.label}</span>
                      <span className="font-mono-tabular text-[10px] text-slate-400">
                        [{btn.keyHint}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {hud.animState === 'ragdoll' && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    handleRespawn();
                  }}
                  className="h-10 px-3.5 rounded-lg bg-lime-400 text-slate-950 text-xs font-semibold hover:bg-lime-300 transition-colors whitespace-nowrap"
                >
                  Возродить [R]
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
