import { getDimensionsConstraints } from '../../core/houseMetrics';
import type { ArchitecturalStyleId, HouseDimensions } from '../../types/house';

export interface DimensionsTabProps {
  styleId: ArchitecturalStyleId;
  dimensions: HouseDimensions;
  isFlatRoof: boolean;
  onChange: (patch: Partial<HouseDimensions>) => void;
}

interface SliderRowProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function SliderControl({
  id,
  label,
  value,
  unit,
  min,
  max,
  step,
  disabled,
  onChange,
}: SliderRowProps) {
  return (
    <div className={`flex flex-col gap-1 ${disabled ? 'opacity-45' : ''}`}>
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <label htmlFor={id} className="truncate font-medium text-slate-700 whitespace-nowrap">
          {label}
        </label>
        <span className="font-mono text-xs font-medium text-slate-900 whitespace-nowrap shrink-0">
          {value.toFixed(step >= 1 ? 0 : step < 0.1 ? 2 : 1)} {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="arch-slider w-full"
      />
    </div>
  );
}

export function DimensionsTab({
  styleId,
  dimensions,
  isFlatRoof,
  onChange,
}: DimensionsTabProps) {
  const c = getDimensionsConstraints(styleId);
  const isSovietPanel = styleId === 'soviet-panel';
  const isOfficeBuilding = styleId === 'office-building';
  const isSkyscraper = styleId === 'skyscraper';
  const isMegabuilding = styleId === 'megabuilding';
  const isSlumShack = styleId === 'slum-shack';
  const hasMultiFloorSlider =
    isSovietPanel || isOfficeBuilding || isSkyscraper || isMegabuilding || isSlumShack;
  const entrances = dimensions.entrances ?? 1;

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-6">
      <SliderControl
        id="dim-width"
        label={isSovietPanel ? 'Ширина секции' : 'Ширина'}
        value={dimensions.width}
        unit="м"
        min={c.width.min}
        max={c.width.max}
        step={c.width.step}
        onChange={(width) => onChange({ width })}
      />

      <SliderControl
        id="dim-depth"
        label="Глубина"
        value={dimensions.depth}
        unit="м"
        min={c.depth.min}
        max={c.depth.max}
        step={c.depth.step}
        onChange={(depth) => onChange({ depth })}
      />

      <SliderControl
        id="dim-floor-height"
        label="Высота этажа"
        value={dimensions.floorHeight}
        unit="м"
        min={c.floorHeight.min}
        max={c.floorHeight.max}
        step={c.floorHeight.step}
        onChange={(floorHeight) => onChange({ floorHeight })}
      />

      {hasMultiFloorSlider ? (
        <SliderControl
          id="dim-floors"
          label="Этажность"
          value={dimensions.floors}
          unit="эт."
          min={c.floors.min}
          max={c.floors.max}
          step={c.floors.step}
          onChange={(floors) => onChange({ floors })}
        />
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-700">Этажность</span>
          <div
            role="group"
            aria-label="Этажность"
            className="grid grid-cols-2 gap-1 rounded-lg bg-slate-200/70 p-0.5"
          >
            {[1, 2].map((count) => {
              const active = dimensions.floors === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChange({ floors: count })}
                  className={`rounded-md py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {count} эт.
                </button>
              );
            })}
          </div>
        </div>
      )}

      {isSovietPanel ? (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-700">Подъезды</span>
          <div
            role="group"
            aria-label="Количество подъездов"
            className="grid grid-cols-6 gap-0.5 rounded-lg bg-slate-200/70 p-0.5"
          >
            {[1, 2, 3, 4, 5, 6].map((count) => {
              const active = entrances === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChange({ entrances: count })}
                  aria-label={`${count} подъезд${count === 1 ? '' : count < 5 ? 'а' : 'ов'}`}
                  className={`rounded-md py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <SliderControl
          id="dim-roof-pitch"
          label={
            isMegabuilding
              ? 'Уклон клина'
              : isOfficeBuilding
                ? 'Уклон атриума'
                : isSkyscraper
                  ? 'Уклон короны'
                  : 'Уклон крыши'
          }
          value={dimensions.roofPitchDeg}
          unit="°"
          min={c.roofPitchDeg.min}
          max={c.roofPitchDeg.max}
          step={c.roofPitchDeg.step}
          disabled={isFlatRoof}
          onChange={(roofPitchDeg) => onChange({ roofPitchDeg })}
        />
      )}

      <SliderControl
        id="dim-foundation"
        label="Цоколь"
        value={dimensions.foundationHeight}
        unit="м"
        min={c.foundationHeight.min}
        max={c.foundationHeight.max}
        step={c.foundationHeight.step}
        onChange={(foundationHeight) => onChange({ foundationHeight })}
      />
    </div>
  );
}
