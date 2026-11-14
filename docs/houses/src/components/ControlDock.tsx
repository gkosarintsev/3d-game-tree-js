import { ChevronDown, ChevronUp, FolderKanban, Layers, Palette, Ruler } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import type {
  ArchitecturalStyleId,
  HouseConfig,
  HouseDimensions,
  HouseFeatures,
  HouseMaterials,
  SavedProject,
} from '../types/house';
import { DimensionsTab } from './dock/DimensionsTab';
import { MaterialsTab } from './dock/MaterialsTab';
import { ProjectsTab } from './dock/ProjectsTab';
import { StyleTab } from './dock/StyleTab';

export type DockTabId = 'dimensions' | 'materials' | 'style' | 'projects';

export interface ControlDockProps {
  config: HouseConfig;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChangeDimensions: (patch: Partial<HouseDimensions>) => void;
  onChangeMaterials: (patch: Partial<HouseMaterials>) => void;
  onSelectStyle: (styleId: ArchitecturalStyleId) => void;
  onChangeFeatures: (patch: Partial<HouseFeatures>) => void;
  projects: SavedProject[];
  activeProjectId: string | null;
  onSaveProject: (name: string) => void;
  onLoadProject: (project: SavedProject) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onExportJson: (project: SavedProject) => void;
  onImportJson: (rawJson: string) => { error?: string };
}

const TABS: Array<{ id: DockTabId; label: string; icon: ReactNode }> = [
  { id: 'dimensions', label: 'Габариты', icon: <Ruler className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: 'materials', label: 'Материалы', icon: <Palette className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: 'style', label: 'Стиль и детали', icon: <Layers className="h-3.5 w-3.5" aria-hidden="true" /> },
  { id: 'projects', label: 'Проекты', icon: <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" /> },
];

export function ControlDock({
  config,
  collapsed,
  onToggleCollapse,
  onChangeDimensions,
  onChangeMaterials,
  onSelectStyle,
  onChangeFeatures,
  projects,
  activeProjectId,
  onSaveProject,
  onLoadProject,
  onDuplicateProject,
  onDeleteProject,
  onExportJson,
  onImportJson,
}: ControlDockProps) {
  const [activeTab, setActiveTab] = useState<DockTabId>('dimensions');

  return (
    <aside
      aria-label="Панель параметров дома"
      className="pointer-events-none fixed inset-x-0 bottom-2 z-20 flex flex-col items-center px-3"
    >
      <div
        className={`pointer-events-auto flex w-full max-w-[min(1060px,95vw)] flex-col items-center transition-transform duration-200 ease-out ${
          collapsed ? 'translate-y-[calc(100%-32px)]' : 'translate-y-0'
        }`}
      >
        {/* Attached Collapse / Expand Tab */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-expanded={!collapsed}
          className="inline-flex h-8 items-center gap-1.5 rounded-t-xl border border-b-0 border-slate-900/10 bg-[#fafaf9]/95 px-4 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-amber-600"
        >
          {collapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Показать настройки (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Скрыть панель (H)</span>
            </>
          )}
        </button>

        {/* Main Solid Architectural Dock (no backdrop-filter over WebGL) */}
        <div className="w-full rounded-2xl border border-slate-900/10 bg-[#fafaf9]/96 px-4 py-3 shadow-lg">
          {/* Tab Strip */}
          <div
            role="tablist"
            aria-label="Разделы настроек"
            className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2"
          >
            <div className="flex items-center gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={active}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (collapsed) onToggleCollapse();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-600 ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="hidden md:inline text-[11px] text-slate-400">
              ЛКМ — вращение · ПКМ — панорама · Колесо — зум
            </span>
          </div>

          {/* Active Tab Content */}
          <div>
            {activeTab === 'dimensions' && (
              <DimensionsTab
                styleId={config.styleId}
                dimensions={config.dimensions}
                isFlatRoof={
                  config.features.roofType === 'flat' ||
                  config.features.roofType === 'stepped'
                }
                onChange={onChangeDimensions}
              />
            )}
            {activeTab === 'materials' && (
              <MaterialsTab materials={config.materials} onChange={onChangeMaterials} />
            )}
            {activeTab === 'style' && (
              <StyleTab
                styleId={config.styleId}
                features={config.features}
                floors={config.dimensions.floors}
                roofOverhang={config.dimensions.roofOverhang}
                onSelectStyle={onSelectStyle}
                onChangeFeatures={onChangeFeatures}
                onChangeOverhang={(roofOverhang) => onChangeDimensions({ roofOverhang })}
              />
            )}
            {activeTab === 'projects' && (
              <ProjectsTab
                projects={projects}
                activeProjectId={activeProjectId}
                onSaveProject={onSaveProject}
                onLoadProject={onLoadProject}
                onDuplicateProject={onDuplicateProject}
                onDeleteProject={onDeleteProject}
                onExportJson={onExportJson}
                onImportJson={onImportJson}
              />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
