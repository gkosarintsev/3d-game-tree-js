import type { AnimationMode } from '../engine/enemyConfig';
import type { TelemetrySnapshot } from '../engine/shooterRangeScene';

interface HudOverlayProps {
  telemetry: TelemetrySnapshot;
  animationMode: AnimationMode;
  variantName: string;
}

const MODE_LABELS: Record<AnimationMode, string> = {
  walk: 'Ходьба',
  patrol: 'Патруль',
  idle: 'Стойка',
};

export function HudOverlay({ telemetry, animationMode, variantName }: HudOverlayProps) {
  const hpPercent = Math.max(0, Math.min(100, (telemetry.hp / telemetry.maxHp) * 100));
  const stateLabel = telemetry.isRagdoll ? 'Ragdoll' : MODE_LABELS[animationMode];

  return (
    <header
      className="pointer-events-none fixed top-4 left-4 right-4 z-10 flex flex-wrap items-start justify-between gap-4"
      data-testid="hud-telemetry"
      data-ragdoll={String(telemetry.isRagdoll)}
      data-hp={telemetry.hp}
    >
      <div className="bg-[#11151c]/90 border border-white/10 rounded-lg px-4 py-3 max-w-md">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-xl font-bold tracking-wide text-slate-100 whitespace-nowrap">
            Манекен противника
          </h1>
          <span className="text-xs text-slate-400 whitespace-nowrap">{variantName}</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-300 font-mono-num">
          <div className="flex items-center gap-2 min-w-[120px]">
            <span className="text-slate-400">HP</span>
            <div className="w-20 h-1.5 bg-slate-800 rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  telemetry.isRagdoll
                    ? 'bg-red-500'
                    : hpPercent > 50
                      ? 'bg-amber-400'
                      : 'bg-orange-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-slate-100">
              {telemetry.hp}/{telemetry.maxHp}
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-600">
            /
          </span>

          <span className={telemetry.isRagdoll ? 'text-amber-400 font-semibold' : 'text-slate-200'}>
            {stateLabel}
          </span>

          {telemetry.lastHitLabel && (
            <>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="text-slate-200 truncate max-w-[190px]">
                {telemetry.lastHitLabel} (-{telemetry.lastDamage}
                {telemetry.lastHitMultiplier && telemetry.lastHitMultiplier > 1
                  ? ` · x${telemetry.lastHitMultiplier}`
                  : ''}
                )
              </span>
            </>
          )}
        </div>
      </div>

      <div className="hidden md:block bg-[#11151c]/85 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-slate-300">
        Клик по бойцу — выстрел · Перетаскивание — обзор · H — скрыть панель
      </div>
    </header>
  );
}
