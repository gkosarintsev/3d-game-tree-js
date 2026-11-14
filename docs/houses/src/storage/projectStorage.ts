import { clampHouseConfig, createDefaultConfigForStyle } from '../core/houseMetrics';
import type { HouseConfig, SavedProject } from '../types/house';

export const PROJECTS_STORAGE_KEY = 'archiform_saved_projects_v1';

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ProjectRepository {
  listProjects(): SavedProject[];
  saveProject(name: string, config: HouseConfig, existingId?: string): SavedProject;
  deleteProject(id: string): SavedProject[];
  duplicateProject(id: string): SavedProject | null;
  serializeProject(project: SavedProject): string;
  parseImportedProject(rawJson: string): { project?: SavedProject; error?: string };
}

export function createBuiltInStarterProjects(): SavedProject[] {
  const now = '2026-11-10T10:00:00.000Z';
  return [
    {
      id: 'preset-classic-cottage',
      name: 'Коттедж «Ясенево»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('classic-cottage'),
    },
    {
      id: 'preset-nordic-barn',
      name: 'Сканди-барн «Норд»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('nordic-barn'),
    },
    {
      id: 'preset-modern-pavilion',
      name: 'Павильон «Горизонт»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('modern-pavilion'),
    },
    {
      id: 'preset-a-frame',
      name: 'А-фрейм «Таёжный»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('a-frame'),
    },
    {
      id: 'preset-alpine-chalet',
      name: 'Шале «Тироль»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('alpine-chalet'),
    },
    {
      id: 'preset-mansard-house',
      name: 'Усадьба «Мансарда»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('mansard-house'),
    },
    {
      id: 'preset-soviet-panel',
      name: 'Панелька П-44 (9 эт.)',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('soviet-panel'),
    },
    {
      id: 'preset-office-building',
      name: 'Бизнес-центр «Атриум»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('office-building'),
    },
    {
      id: 'preset-skyscraper',
      name: 'Башня «Горизонт-Сити»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('skyscraper'),
    },
    {
      id: 'preset-megabuilding',
      name: 'Мегастроение H10 (Уотсон)',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('megabuilding'),
    },
    {
      id: 'preset-slum-shack',
      name: 'Самострой «Фавела-7»',
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: true,
      config: createDefaultConfigForStyle('slum-shack'),
    },
  ];
}

function getBrowserStorageAdapter(): StorageAdapter {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  const memory = new Map<string, string>();
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
    },
  };
}

function generateProjectId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `proj-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export class LocalProjectRepository implements ProjectRepository {
  private readonly storage: StorageAdapter;

  constructor(storage?: StorageAdapter) {
    this.storage = storage ?? getBrowserStorageAdapter();
  }

  private writeAll(projects: SavedProject[]): void {
    this.storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  }

  listProjects(): SavedProject[] {
    const raw = this.storage.getItem(PROJECTS_STORAGE_KEY);
    const builtIns = createBuiltInStarterProjects();
    if (!raw) {
      this.writeAll(builtIns);
      return builtIns;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.writeAll(builtIns);
        return builtIns;
      }
      const existingIds = new Set(parsed.map((item) => item?.id));
      const missingPresets = builtIns.filter((preset) => !existingIds.has(preset.id));
      const merged = [...parsed, ...missingPresets].map((item) => ({
        ...item,
        config: clampHouseConfig(item.config),
      }));
      if (missingPresets.length > 0) {
        this.writeAll(merged);
      }
      return merged;
    } catch {
      this.writeAll(builtIns);
      return builtIns;
    }
  }

  saveProject(name: string, config: HouseConfig, existingId?: string): SavedProject {
    const projects = this.listProjects();
    const now = new Date().toISOString();
    const normalizedConfig = clampHouseConfig(config);

    if (existingId) {
      const idx = projects.findIndex((p) => p.id === existingId);
      if (idx !== -1 && !projects[idx].isBuiltInPreset) {
        const updated: SavedProject = {
          ...projects[idx],
          name: name.trim(),
          updatedAt: now,
          config: normalizedConfig,
        };
        projects[idx] = updated;
        this.writeAll(projects);
        return updated;
      }
    }

    const created: SavedProject = {
      id: generateProjectId(),
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: false,
      config: normalizedConfig,
    };

    const next = [created, ...projects];
    this.writeAll(next);
    return created;
  }

  deleteProject(id: string): SavedProject[] {
    const projects = this.listProjects();
    const next = projects.filter((p) => p.id !== id);
    this.writeAll(next);
    return next;
  }

  duplicateProject(id: string): SavedProject | null {
    const projects = this.listProjects();
    const source = projects.find((p) => p.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const copy: SavedProject = {
      id: generateProjectId(),
      name: `${source.name} (копия)`,
      createdAt: now,
      updatedAt: now,
      isBuiltInPreset: false,
      config: clampHouseConfig(source.config),
    };
    const next = [copy, ...projects];
    this.writeAll(next);
    return copy;
  }

  serializeProject(project: SavedProject): string {
    return JSON.stringify(
      {
        schema: 'archiform-house-project-v1',
        name: project.name,
        config: clampHouseConfig(project.config),
      },
      null,
      2,
    );
  }

  parseImportedProject(rawJson: string): { project?: SavedProject; error?: string } {
    try {
      const parsed = JSON.parse(rawJson);
      if (!parsed || typeof parsed !== 'object' || !parsed.config || !parsed.name) {
        return { error: 'Некорректный формат файла проекта JSON.' };
      }
      const config = clampHouseConfig(parsed.config as HouseConfig);
      const saved = this.saveProject(String(parsed.name), config);
      return { project: saved };
    } catch {
      return { error: 'Не удалось прочитать JSON-файл проекта.' };
    }
  }
}
