import {
  ROOF_TYPE_LABELS,
  STYLE_LIST,
  STYLES_REGISTRY,
} from '../../core/registries/stylesRegistry';
import {
  HOUSE_CONSTRAINTS,
  type ArchitecturalStyleId,
  type HouseFeatures,
  type RoofTypeId,
} from '../../types/house';

export interface StyleTabProps {
  styleId: ArchitecturalStyleId;
  features: HouseFeatures;
  floors: number;
  roofOverhang: number;
  onSelectStyle: (styleId: ArchitecturalStyleId) => void;
  onChangeFeatures: (patch: Partial<HouseFeatures>) => void;
  onChangeOverhang: (overhang: number) => void;
}

export function StyleTab({
  styleId,
  features,
  floors,
  roofOverhang,
  onSelectStyle,
  onChangeFeatures,
  onChangeOverhang,
}: StyleTabProps) {
  const activeStyle = STYLES_REGISTRY[styleId];
  const isSovietPanel = styleId === 'soviet-panel';
  const isOfficeBuilding = styleId === 'office-building';
  const isSkyscraper = styleId === 'skyscraper';
  const isMegabuilding = styleId === 'megabuilding';
  const isSlumShack = styleId === 'slum-shack';

  const getRoofOptionLabel = (rType: RoofTypeId): string => {
    if (isMegabuilding) {
      if (rType === 'stepped') return 'Ярусная';
      if (rType === 'flat') return 'Пром-плато';
      if (rType === 'shed') return 'Клин-корона';
    }
    if (isOfficeBuilding) {
      if (rType === 'flat') return 'Плоская';
      if (rType === 'stepped') return 'Террасная';
      if (rType === 'shed') return 'Атриум-скос';
    }
    if (isSlumShack) {
      if (rType === 'shed') return 'Шиферный скат';
      if (rType === 'flat') return 'Настил и бак';
      if (rType === 'stepped') return 'Ярусная хижина';
    }
    if (isSkyscraper && rType === 'shed') return 'Скос короны';
    return ROOF_TYPE_LABELS[rType];
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Left: 11 Architectural style archetypes */}
      <div className="lg:col-span-7">
        <span className="mb-1.5 block text-xs font-semibold text-slate-800">
          Архитектурный стиль
        </span>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {STYLE_LIST.map((style) => {
            const active = style.id === styleId;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onSelectStyle(style.id)}
                className={`flex flex-col items-start rounded-lg border px-2.5 py-1 text-left transition-colors ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className="w-full truncate text-xs font-semibold leading-tight">
                  {style.name}
                </span>
                <span
                  className={`mt-0.5 w-full truncate text-[11px] leading-tight ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {style.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Middle: Roof shape & Overhang */}
      <div className="flex flex-col justify-between gap-2.5 lg:col-span-2">
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-800">
            {isMegabuilding
              ? 'Корона мегаблока'
              : isSkyscraper
                ? 'Завершение башни'
                : isOfficeBuilding
                  ? 'Кровля здания'
                  : isSlumShack
                    ? 'Крыша постройки'
                    : 'Форма кровли'}
          </span>
          <div role="group" aria-label="Форма кровли" className="grid grid-cols-1 gap-1.5">
            {activeStyle.supportedRoofTypes.map((rType: RoofTypeId) => {
              const active = features.roofType === rType;
              const label = getRoofOptionLabel(rType);
              return (
                <button
                  key={rType}
                  type="button"
                  onClick={() => onChangeFeatures({ roofType: rType })}
                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`flex flex-col gap-1 ${
            isSovietPanel || isSkyscraper || isMegabuilding ? 'opacity-45' : ''
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="roof-overhang" className="font-medium text-slate-700">
              {isOfficeBuilding ? 'Карниз крыши' : 'Свес крыши'}
            </label>
            <span className="font-mono text-slate-900">{roofOverhang.toFixed(2)} м</span>
          </div>
          <input
            id="roof-overhang"
            type="range"
            min={HOUSE_CONSTRAINTS.roofOverhang.min}
            max={HOUSE_CONSTRAINTS.roofOverhang.max}
            step={HOUSE_CONSTRAINTS.roofOverhang.step}
            value={roofOverhang}
            disabled={isSovietPanel || isSkyscraper || isMegabuilding}
            onChange={(e) => onChangeOverhang(parseFloat(e.target.value))}
            className="arch-slider w-full"
          />
        </div>
      </div>

      {/* Right: Windows & Architectural Details */}
      <div className="flex flex-col justify-between gap-2.5 lg:col-span-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs font-medium text-slate-700">
              {isMegabuilding
                ? 'Плотность секций'
                : isSkyscraper
                  ? 'Плотность рёбер'
                  : isOfficeBuilding
                    ? 'Шаг стоек'
                    : isSlumShack
                      ? 'Плотность окон'
                      : isSovietPanel
                        ? 'Секции окон'
                        : 'Окна на фасад'}
            </span>
            <div
              role="group"
              aria-label="Количество окон на фасад"
              className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200/70 p-0.5"
            >
              {[1, 2, 3].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChangeFeatures({ windowDensity: d })}
                  className={`rounded-md py-1 text-xs font-medium transition-colors ${
                    features.windowDensity === d
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end gap-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="win-scale" className="font-medium text-slate-700">
                {isMegabuilding
                  ? 'Размер проёмов'
                  : isSkyscraper || isOfficeBuilding
                    ? 'Высота стекла'
                    : 'Размер окон'}
              </label>
              <span className="font-mono text-slate-900">
                {Math.round(features.windowScale * 100)}%
              </span>
            </div>
            <input
              id="win-scale"
              type="range"
              min={HOUSE_CONSTRAINTS.windowScale.min}
              max={HOUSE_CONSTRAINTS.windowScale.max}
              step={HOUSE_CONSTRAINTS.windowScale.step}
              value={features.windowScale}
              onChange={(e) => onChangeFeatures({ windowScale: parseFloat(e.target.value) })}
              className="arch-slider w-full"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
            <input
              type="checkbox"
              checked={features.hasPorch}
              onChange={(e) => onChangeFeatures({ hasPorch: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
            />
            <span>
              {isMegabuilding
                ? 'Трасса-стилобат'
                : isOfficeBuilding
                  ? 'Входная группа'
                  : isSlumShack
                    ? 'Навес и лестница'
                    : isSkyscraper
                      ? 'Стилобат'
                      : isSovietPanel
                        ? 'Козырьки'
                        : 'Крыльцо'}
            </span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
            <input
              type="checkbox"
              checked={features.hasChimney}
              onChange={(e) => onChangeFeatures({ hasChimney: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
            />
            <span>
              {isMegabuilding
                ? 'Вышка связи'
                : isOfficeBuilding
                  ? 'Техблок крыши'
                  : isSlumShack
                    ? 'Бак и трубы'
                    : isSkyscraper
                      ? 'Шпиль'
                      : isSovietPanel
                        ? 'Надстройки'
                        : 'Дымоход'}
            </span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
            <input
              type="checkbox"
              checked={features.hasCornerAccents}
              onChange={(e) => onChangeFeatures({ hasCornerAccents: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
            />
            <span>
              {isMegabuilding
                ? 'Неон и вывески'
                : isSlumShack
                  ? 'Заплатки и блоки'
                  : isSkyscraper || isOfficeBuilding
                    ? 'Рёбра фасада'
                    : isSovietPanel
                      ? 'Швы панелей'
                      : 'Пилястры'}
            </span>
          </label>
          {floors >= 2 && features.roofType !== 'aframe' && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
              <input
                type="checkbox"
                checked={features.hasBalcony}
                onChange={(e) => onChangeFeatures({ hasBalcony: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
              />
              <span>
                {isMegabuilding
                  ? 'Жилые капсулы'
                  : isOfficeBuilding
                    ? 'Ламели / террасы'
                    : isSlumShack
                      ? 'Настил и перила'
                      : isSkyscraper
                        ? 'Террасы'
                        : isSovietPanel
                          ? 'Балконы'
                          : 'Балкон'}
              </span>
            </label>
          )}
          {features.roofType === 'mansard' && (
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
              <input
                type="checkbox"
                checked={features.hasDormers}
                onChange={(e) => onChangeFeatures({ hasDormers: e.target.checked })}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-slate-900"
              />
              <span>Люкарны</span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
