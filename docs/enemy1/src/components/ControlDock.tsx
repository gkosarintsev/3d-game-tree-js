import { ChevronDown, ChevronUp, Crosshair, RotateCcw, Zap } from 'lucide-react';
import {
  SOLDIER_VARIANTS,
  type AnimationMode,
  type SoldierVariantId,
} from '../engine/enemyConfig';
import type { CameraPresetId } from '../engine/shooterRangeScene';

interface ControlDockProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  animationMode: AnimationMode;
  onChangeMode: (mode: AnimationMode) => void;
  walkSpeed: number;
  onChangeWalkSpeed: (speed: number) => void;
  timeScale: number;
  onChangeTimeScale: (scale: number) => void;
  variantId: SoldierVariantId;
  onChangeVariant: (id: SoldierVariantId) => void;
  debugVisible: boolean;
  onToggleDebug: () => void;
  cameraPreset: CameraPresetId;
  onChangeCameraPreset: (preset: CameraPresetId) => void;
  isRagdoll: boolean;
  onFireShot: () => void;
  onTriggerRagdoll: () => void;
  onShockwave: () => void;
  onRespawn: () => void;
}

const MODE_OPTIONS: { id: AnimationMode; label: string }[] = [
  { id: 'walk', label: 'Ходьба' },
  { id: 'patrol', label: 'Патруль' },
  { id: 'idle', label: 'Стойка' },
];

const TIME_SCALES = [1.0, 0.5, 0.25];

const CAMERA_OPTIONS: { id: CameraPresetId; label: string }[] = [
  { id: 'threeQuarter', label: '3/4' },
  { id: 'front', label: 'Фронт' },
  { id: 'side', label: 'Профиль' },
  { id: 'top', label: 'Сверху' },
];

export function ControlDock({
  collapsed,
  onToggleCollapse,
  animationMode,
  onChangeMode,
  walkSpeed,
  onChangeWalkSpeed,
  timeScale,
  onChangeTimeScale,
  variantId,
  onChangeVariant,
  debugVisible,
  onToggleDebug,
  cameraPreset,
  onChangeCameraPreset,
  isRagdoll,
  onFireShot,
  onTriggerRagdoll,
  onShockwave,
  onRespawn,
}: ControlDockProps) {
  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center w-[min(960px,95vw)] pointer-events-none"
      data-testid="control-dock-wrapper"
    >
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Показать панель управления' : 'Скрыть панель управления'}
        className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#141921]/95 hover:bg-[#1c232e] border border-white/15 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400"
      >
        {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{collapsed ? 'Панель управления' : 'Скрыть панель'}</span>
      </button>

      {!collapsed && (
        <section
          aria-label="Управление моделью и физикой Ragdoll"
          className="pointer-events-auto w-full bg-[#11151c]/95 border border-white/12 rounded-xl px-4 py-3 shadow-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5">
            {/* Animation Mode */}
            <div className="flex items-center gap-1 bg-[#0b0e13] p-1 rounded-lg border border-white/5">
              {MODE_OPTIONS.map((m) => {
                const active = !isRagdoll && animationMode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onChangeMode(m.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* Walk Speed Slider */}
            <div className="flex items-center gap-2.5">
              <label htmlFor="walk-speed-slider" className="text-xs text-slate-400 whitespace-nowrap">
                Темп
              </label>
              <input
                id="walk-speed-slider"
                type="range"
                min={0.4}
                max={1.8}
                step={0.1}
                value={walkSpeed}
                onChange={(e) => onChangeWalkSpeed(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
              <span className="text-xs text-slate-200 font-mono-num w-9 text-right">
                {walkSpeed.toFixed(1)}x
              </span>
            </div>

            {/* Combat & Ragdoll Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onFireShot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Выстрел</span>
              </button>

              <button
                type="button"
                onClick={onTriggerRagdoll}
                className="px-3 py-1.5 text-xs font-medium text-slate-100 bg-[#1e2530] hover:bg-[#283140] border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Ragdoll
              </button>

              <button
                type="button"
                onClick={onShockwave}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-100 bg-[#1e2530] hover:bg-[#283140] border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Взрыв</span>
              </button>

              <button
                type="button"
                onClick={onRespawn}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-200 bg-[#181d25] hover:bg-[#232a36] border border-white/10 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сброс</span>
              </button>
            </div>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-white/8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {/* Soldier Variant */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 whitespace-nowrap">Боец:</span>
              {(Object.keys(SOLDIER_VARIANTS) as SoldierVariantId[]).map((vId) => {
                const v = SOLDIER_VARIANTS[vId];
                const active = variantId === vId;
                return (
                  <button
                    key={vId}
                    type="button"
                    onClick={() => onChangeVariant(vId)}
                    className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-slate-200 text-slate-950 font-semibold'
                        : 'text-slate-300 bg-[#181d25] hover:bg-[#232a36]'
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>

            {/* Slow-mo Time Scale */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">Время:</span>
              {TIME_SCALES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeTimeScale(s)}
                  className={`px-2 py-1 text-xs font-mono-num rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    timeScale === s
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'text-slate-300 bg-[#181d25] hover:bg-[#232a36]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Camera Presets & Debug Hitboxes */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                {CAMERA_OPTIONS.map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => onChangeCameraPreset(cam.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      cameraPreset === cam.id
                        ? 'bg-white/18 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-pressed={debugVisible}
                onClick={onToggleDebug}
                className={`px-2.5 py-1 text-xs rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  debugVisible
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-medium'
                    : 'bg-[#181d25] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                Хитбоксы
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
