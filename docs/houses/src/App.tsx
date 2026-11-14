import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ControlDock } from './components/ControlDock';
import { TopHudBar } from './components/TopHudBar';
import { ViewportCanvas } from './components/ViewportCanvas';
import {
  clampHouseConfig,
  computeHouseMetrics,
  createDefaultConfigForStyle,
} from './core/houseMetrics';
import type { HouseSceneController } from './engine/sceneController';
import { LocalProjectRepository } from './storage/projectStorage';
import type {
  ArchitecturalStyleId,
  CameraPresetId,
  HouseConfig,
  HouseDimensions,
  HouseFeatures,
  HouseMaterials,
  SavedProject,
} from './types/house';

export default function App() {
  const repositoryRef = useRef<LocalProjectRepository | null>(null);
  if (!repositoryRef.current) {
    repositoryRef.current = new LocalProjectRepository();
  }

  const [projects, setProjects] = useState<SavedProject[]>(() =>
    repositoryRef.current!.listProjects(),
  );
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    () => projects[0]?.id ?? null,
  );
  const [projectName, setProjectName] = useState<string>(
    () => projects[0]?.name ?? 'Новый проект',
  );
  const [config, setConfig] = useState<HouseConfig>(
    () => projects[0]?.config ?? createDefaultConfigForStyle('classic-cottage'),
  );

  const [activePreset, setActivePreset] = useState<CameraPresetId>('isometric');
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const sceneControllerRef = useRef<HouseSceneController | null>(null);

  const metrics = useMemo(() => computeHouseMetrics(config), [config]);

  // Keyboard shortcut 'H' to toggle Zen Mode / dock collapse
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleChangeDimensions = useCallback((patch: Partial<HouseDimensions>) => {
    setConfig((prev) =>
      clampHouseConfig({
        ...prev,
        dimensions: { ...prev.dimensions, ...patch },
      }),
    );
  }, []);

  const handleChangeMaterials = useCallback((patch: Partial<HouseMaterials>) => {
    setConfig((prev) =>
      clampHouseConfig({
        ...prev,
        materials: { ...prev.materials, ...patch },
      }),
    );
  }, []);

  const handleSelectStyle = useCallback((styleId: ArchitecturalStyleId) => {
    setConfig(createDefaultConfigForStyle(styleId));
  }, []);

  const handleChangeFeatures = useCallback((patch: Partial<HouseFeatures>) => {
    setConfig((prev) =>
      clampHouseConfig({
        ...prev,
        features: { ...prev.features, ...patch },
      }),
    );
  }, []);

  const handleSelectCameraPreset = useCallback((preset: CameraPresetId) => {
    setActivePreset(preset);
    sceneControllerRef.current?.setCameraPreset(preset);
  }, []);

  const handleExportGlb = useCallback(async () => {
    const ctrl = sceneControllerRef.current;
    if (!ctrl || isExporting) return;

    setIsExporting(true);
    setExportMessage(null);
    try {
      const { filename, byteLength } = await ctrl.exportGlb(projectName);
      const kb = Math.max(1, Math.round(byteLength / 1024));
      setExportMessage(`Скачан ${filename} (${kb} КБ)`);
      window.setTimeout(() => setExportMessage(null), 4000);
    } catch (err) {
      setExportMessage(
        err instanceof Error ? err.message : 'Ошибка экспорта в GLB',
      );
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, projectName]);

  const handleSaveProject = useCallback(
    (name: string) => {
      const repo = repositoryRef.current!;
      const saved = repo.saveProject(name, config);
      setProjects(repo.listProjects());
      setActiveProjectId(saved.id);
      setProjectName(saved.name);
      setExportMessage(`Проект «${saved.name}» сохранён`);
      window.setTimeout(() => setExportMessage(null), 3000);
    },
    [config],
  );

  const handleLoadProject = useCallback((project: SavedProject) => {
    setConfig(clampHouseConfig(project.config));
    setActiveProjectId(project.id);
    setProjectName(project.name);
  }, []);

  const handleDuplicateProject = useCallback((id: string) => {
    const repo = repositoryRef.current!;
    const copy = repo.duplicateProject(id);
    if (copy) {
      setProjects(repo.listProjects());
      setActiveProjectId(copy.id);
      setProjectName(copy.name);
    }
  }, []);

  const handleDeleteProject = useCallback(
    (id: string) => {
      const repo = repositoryRef.current!;
      const next = repo.deleteProject(id);
      setProjects(next);
      if (activeProjectId === id && next.length > 0) {
        setActiveProjectId(next[0].id);
        setProjectName(next[0].name);
        setConfig(clampHouseConfig(next[0].config));
      }
    },
    [activeProjectId],
  );

  const handleExportJson = useCallback((project: SavedProject) => {
    const repo = repositoryRef.current!;
    const json = repo.serializeProject(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.trim().replace(/\s+/g, '-') || 'house-project'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  const handleImportJson = useCallback((rawJson: string): { error?: string } => {
    const repo = repositoryRef.current!;
    const result = repo.parseImportedProject(rawJson);
    if (result.project) {
      setProjects(repo.listProjects());
      setActiveProjectId(result.project.id);
      setProjectName(result.project.name);
      setConfig(clampHouseConfig(result.project.config));
      return {};
    }
    return { error: result.error };
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#e8eef4]">
      <ViewportCanvas
        config={config}
        activeCameraPreset={activePreset}
        onControllerReady={(ctrl) => {
          sceneControllerRef.current = ctrl;
        }}
      />

      <TopHudBar
        projectName={projectName}
        config={config}
        metrics={metrics}
        activePreset={activePreset}
        onSelectPreset={handleSelectCameraPreset}
        onExportGlb={() => void handleExportGlb()}
        isExporting={isExporting}
        exportMessage={exportMessage}
      />

      <ControlDock
        config={config}
        collapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((c) => !c)}
        onChangeDimensions={handleChangeDimensions}
        onChangeMaterials={handleChangeMaterials}
        onSelectStyle={handleSelectStyle}
        onChangeFeatures={handleChangeFeatures}
        projects={projects}
        activeProjectId={activeProjectId}
        onSaveProject={handleSaveProject}
        onLoadProject={handleLoadProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />
    </main>
  );
}
