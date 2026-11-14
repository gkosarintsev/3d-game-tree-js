import { useEffect, useRef, useState } from 'react';
import { HouseSceneController } from '../engine/sceneController';
import type { CameraPresetId, HouseConfig } from '../types/house';

export interface ViewportCanvasProps {
  config: HouseConfig;
  onControllerReady: (controller: HouseSceneController | null) => void;
  activeCameraPreset: CameraPresetId;
}

export function ViewportCanvas({ config, onControllerReady }: ViewportCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<HouseSceneController | null>(null);
  const initialConfigRef = useRef<HouseConfig>(config);
  const onReadyRef = useRef(onControllerReady);
  onReadyRef.current = onControllerReady;

  const [contextLost, setContextLost] = useState(false);

  // Mount Three.js renderer and scene strictly once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const controller = new HouseSceneController(container, initialConfigRef.current, {
      onContextLost: () => setContextLost(true),
      onContextRestored: () => setContextLost(false),
    });

    controllerRef.current = controller;
    onReadyRef.current(controller);

    return () => {
      onReadyRef.current(null);
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  // Push house configuration updates cleanly without tearing down WebGL context
  useEffect(() => {
    controllerRef.current?.updateHouse(config);
  }, [config]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8eef4]">
      <div
        ref={mountRef}
        data-testid="house-3d-viewport"
        className="h-full w-full cursor-grab active:cursor-grabbing"
      />
      {contextLost && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex items-center justify-center bg-[#e8eef4]/95 p-6 text-center"
        >
          <div className="max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              Восстановление 3D-контекста
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Графический контекст WebGL был временно приостановлен браузером. Подождите секунду или
              обновите страницу.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
