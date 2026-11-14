import { Box, Download } from 'lucide-react';
import { STYLES_REGISTRY } from '../core/registries/stylesRegistry';
import type { CameraPresetId, ComputedHouseMetrics, HouseConfig } from '../types/house';

export interface TopHudBarProps {
  projectName: string;
  config: HouseConfig;
  metrics: ComputedHouseMetrics;
  activePreset: CameraPresetId;
  onSelectPreset: (preset: CameraPresetId) => void;
  onExportGlb: () => void;
  isExporting: boolean;
  exportMessage: string | null;
}

const CAMERA_PRESETS: Array<{ id: CameraPresetId; label: string }> = [
  { id: 'isometric', label: 'Изометрия' },
  { id: 'front', label: 'Фасад' },
  { id: 'side', label: 'Сбоку' },
  { id: 'top', label: 'Сверху' },
];

export function TopHudBar({
  projectName,
  config,
  metrics,
  activePreset,
  onSelectPreset,
  onExportGlb,
  isExporting,
  exportMessage,
}: TopHudBarProps) {
  const styleName = STYLES_REGISTRY[config.styleId]?.name ?? 'Проект';

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-3 p-4">
      {/* Left: Minimal Brand + Live Tabular Specs (unboxed metadata, no pills) */}
      <div className="pointer-events-auto rounded-xl border border-slate-900/10 bg-[#fafaf9]/95 px-4 py-2.5 shadow-sm">
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            АрхиФорм
          </span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="max-w-[200px] truncate text-sm font-medium text-slate-700">
            {projectName}
          </span>
        </div>
        <div
          data-testid="house-metrics-summary"
          className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500"
        >
          <span>{styleName}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-700">
            {metrics.totalWidthM.toFixed(1)}×{config.dimensions.depth.toFixed(1)} м
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-700">{metrics.grossFloorAreaM2} м²</span>
          {(metrics.entrances > 1 || config.styleId === 'soviet-panel') && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700">{metrics.entrances} под.</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-700">{config.dimensions.floors} эт.</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-slate-700">H {metrics.totalRidgeHeightM.toFixed(1)} м</span>
        </div>
      </div>

      {/* Right: Camera Views + Primary GLB Export Action */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-900/10 bg-[#fafaf9]/95 p-1.5 shadow-sm">
          <div role="group" aria-label="Ракурсы камеры" className="hidden sm:flex items-center gap-1">
            {CAMERA_PRESETS.map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-600 ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="hidden sm:block h-5 w-px bg-slate-200" aria-hidden="true" />

          <button
            type="button"
            onClick={onExportGlb}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-60 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
          >
            {isExporting ? (
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isExporting ? 'Экспорт...' : 'Экспорт GLB'}</span>
          </button>
        </div>

        {exportMessage && (
          <div
            role="status"
            data-testid="export-status-message"
            className="rounded-lg border border-slate-900/10 bg-[#fafaf9]/95 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            {exportMessage}
          </div>
        )}
      </div>
    </header>
  );
}
