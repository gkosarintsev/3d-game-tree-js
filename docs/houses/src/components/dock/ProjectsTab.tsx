import { useRef, useState, type FormEvent } from 'react';
import { Copy, FileDown, FileUp, FolderOpen, Save, Trash2 } from 'lucide-react';
import { validateProjectName } from '../../core/houseMetrics';
import { STYLES_REGISTRY } from '../../core/registries/stylesRegistry';
import type { SavedProject } from '../../types/house';

export interface ProjectsTabProps {
  projects: SavedProject[];
  activeProjectId: string | null;
  onSaveProject: (name: string) => void;
  onLoadProject: (project: SavedProject) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onExportJson: (project: SavedProject) => void;
  onImportJson: (rawJson: string) => { error?: string };
}

export function ProjectsTab({
  projects,
  activeProjectId,
  onSaveProject,
  onLoadProject,
  onDuplicateProject,
  onDeleteProject,
  onExportJson,
  onImportJson,
}: ProjectsTabProps) {
  const [nameInput, setNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = validateProjectName(nameInput);
    if (!result.valid) {
      setErrorMsg(result.error ?? 'Некорректное название проекта.');
      return;
    }
    setErrorMsg(null);
    onSaveProject(result.trimmedName);
    setNameInput('');
  };

  const handleFileImport = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    const res = onImportJson(text);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setErrorMsg(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Save / Import toolbar */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-wrap items-center gap-2 min-w-[240px]">
          <label htmlFor="project-name-input" className="sr-only">
            Название нового проекта
          </label>
          <input
            id="project-name-input"
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Название проекта (например, Дом на холме)"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-amber-600 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Сохранить проект</span>
          </button>
        </form>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => {
              void handleFileImport(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            <FileUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Импорт JSON</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <p role="alert" className="text-xs font-medium text-red-700">
          {errorMsg}
        </p>
      )}

      {/* Saved projects & starter templates list */}
      <div
        data-testid="saved-projects-list"
        className="grid max-h-[120px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((proj) => {
          const active = proj.id === activeProjectId;
          const styleLabel = STYLES_REGISTRY[proj.config.styleId]?.name ?? 'Проект';
          const entrances = proj.config.dimensions.entrances ?? 1;
          const totalW = proj.config.dimensions.width * entrances;
          return (
            <div
              key={proj.id}
              className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                active
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => onLoadProject(proj)}
                className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-amber-600"
              >
                <span className="truncate text-xs font-semibold text-slate-900">
                  {proj.name}
                </span>
                <span className="truncate text-[11px] text-slate-500">
                  {styleLabel} · {totalW.toFixed(1)}×
                  {proj.config.dimensions.depth.toFixed(1)} м · {proj.config.dimensions.floors} эт.
                </span>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onLoadProject(proj)}
                  aria-label={`Открыть проект "${proj.name}"`}
                  title="Открыть проект"
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onDuplicateProject(proj.id)}
                  aria-label={`Дублировать проект "${proj.name}"`}
                  title="Дублировать"
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onExportJson(proj)}
                  aria-label={`Скачать JSON "${proj.name}"`}
                  title="Экспорт JSON"
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                {!proj.isBuiltInPreset && (
                  <button
                    type="button"
                    onClick={() => onDeleteProject(proj.id)}
                    aria-label={`Удалить проект "${proj.name}"`}
                    title="Удалить"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
