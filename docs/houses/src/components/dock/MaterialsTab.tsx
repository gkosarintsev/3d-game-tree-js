import {
  ROOF_MATERIAL_LIST,
  ROOF_MATERIALS_REGISTRY,
  TRIM_FINISH_LIST,
  WALL_MATERIAL_LIST,
  WALL_MATERIALS_REGISTRY,
} from '../../core/registries/materialsRegistry';
import type { HouseMaterials, RoofMaterialId, WallMaterialId } from '../../types/house';

export interface MaterialsTabProps {
  materials: HouseMaterials;
  onChange: (patch: Partial<HouseMaterials>) => void;
}

export function MaterialsTab({ materials, onChange }: MaterialsTabProps) {
  const activeWallSpec = WALL_MATERIALS_REGISTRY[materials.wallMaterial];
  const activeRoofSpec = ROOF_MATERIALS_REGISTRY[materials.roofMaterial];

  const handleWallTypeChange = (wallMaterial: WallMaterialId) => {
    const spec = WALL_MATERIALS_REGISTRY[wallMaterial];
    onChange({
      wallMaterial,
      wallColor: spec.swatches[0].hex,
    });
  };

  const handleRoofTypeChange = (roofMaterial: RoofMaterialId) => {
    const spec = ROOF_MATERIALS_REGISTRY[roofMaterial];
    onChange({
      roofMaterial,
      roofColor: spec.swatches[0].hex,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Wall material & swatch */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="wall-material-select" className="text-xs font-semibold text-slate-800">
            Материал стен
          </label>
          <div className="flex items-center gap-1.5" role="group" aria-label="Цвет стен">
            {activeWallSpec.swatches.map((swatch) => {
              const selected = materials.wallColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  title={swatch.label}
                  aria-label={`Цвет стен: ${swatch.label}`}
                  onClick={() => onChange({ wallColor: swatch.hex })}
                  className={`h-5 w-5 rounded-full border transition-transform ${
                    selected
                      ? 'scale-110 border-slate-900 ring-2 ring-amber-500/60'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>
        </div>
        <select
          id="wall-material-select"
          value={materials.wallMaterial}
          onChange={(e) => handleWallTypeChange(e.target.value as WallMaterialId)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-600 focus:outline-none"
        >
          {WALL_MATERIAL_LIST.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Roof material & swatch */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="roof-material-select" className="text-xs font-semibold text-slate-800">
            Кровля
          </label>
          <div className="flex items-center gap-1.5" role="group" aria-label="Цвет кровли">
            {activeRoofSpec.swatches.map((swatch) => {
              const selected = materials.roofColor.toLowerCase() === swatch.hex.toLowerCase();
              return (
                <button
                  key={swatch.hex}
                  type="button"
                  title={swatch.label}
                  aria-label={`Цвет кровли: ${swatch.label}`}
                  onClick={() => onChange({ roofColor: swatch.hex })}
                  className={`h-5 w-5 rounded-full border transition-transform ${
                    selected
                      ? 'scale-110 border-slate-900 ring-2 ring-amber-500/60'
                      : 'border-slate-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>
        </div>
        <select
          id="roof-material-select"
          value={materials.roofMaterial}
          onChange={(e) => handleRoofTypeChange(e.target.value as RoofMaterialId)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-amber-600 focus:outline-none"
        >
          {ROOF_MATERIAL_LIST.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Trim / window frame finish */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-800">Рамы, отливы и декор</span>
        <div role="group" aria-label="Отделка рам и карнизов" className="grid grid-cols-2 gap-1.5">
          {TRIM_FINISH_LIST.map((trim) => {
            const active = materials.trimFinish === trim.id;
            return (
              <button
                key={trim.id}
                type="button"
                onClick={() => onChange({ trimFinish: trim.id })}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-black/20"
                  style={{ backgroundColor: trim.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{trim.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
