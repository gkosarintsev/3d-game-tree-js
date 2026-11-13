import { useEffect, useRef, useState } from 'react';
import { ControlDock } from './components/ControlDock';
import { HudOverlay } from './components/HudOverlay';
import {
  SOLDIER_VARIANTS,
  type AnimationMode,
  type SoldierVariantId,
} from './engine/enemyConfig';
import {
  ShooterRangeScene,
  type CameraPresetId,
  type TelemetrySnapshot,
} from './engine/shooterRangeScene';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ShooterRangeScene | null>(null);

  const [collapsed, setCollapsed] = useState(false);
  const [animationMode, setAnimationMode] = useState<AnimationMode>('walk');
  const [walkSpeed, setWalkSpeed] = useState(1.0);
  const [timeScale, setTimeScale] = useState(1.0);
  const [variantId, setVariantId] = useState<SoldierVariantId>('assault');
  const [debugVisible, setDebugVisible] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('threeQuarter');

  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    hp: SOLDIER_VARIANTS.assault.maxHp,
    maxHp: SOLDIER_VARIANTS.assault.maxHp,
    isRagdoll: false,
    lastHitLabel: null,
    lastHitMultiplier: null,
    lastDamage: null,
    hitCount: 0,
  });

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const controller = new ShooterRangeScene(mount, {
      onTelemetry: (snap) => {
        setTelemetry(snap);
      },
    });
    sceneRef.current = controller;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H' || e.key === 'р' || e.key === 'Р') {
        setCollapsed((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'к' || e.key === 'К') {
        controller.respawn();
      } else if (e.code === 'Space') {
        e.preventDefault();
        controller.fireSimulatedBurst();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      controller.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleModeChange = (mode: AnimationMode) => {
    setAnimationMode(mode);
    sceneRef.current?.setAnimationMode(mode);
  };

  const handleWalkSpeedChange = (speed: number) => {
    setWalkSpeed(speed);
    sceneRef.current?.setWalkSpeed(speed);
  };

  const handleTimeScaleChange = (scale: number) => {
    setTimeScale(scale);
    sceneRef.current?.setTimeScale(scale);
  };

  const handleVariantChange = (id: SoldierVariantId) => {
    setVariantId(id);
    sceneRef.current?.setVariant(id);
  };

  const handleToggleDebug = () => {
    const next = !debugVisible;
    setDebugVisible(next);
    sceneRef.current?.setDebugVisible(next);
  };

  const handleCameraPreset = (preset: CameraPresetId) => {
    setCameraPreset(preset);
    sceneRef.current?.setCameraPreset(preset);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#0d1014]">
      <div
        ref={canvasMountRef}
        className="w-full h-full cursor-crosshair"
        aria-label="3D-сцена полигона с моделью врага"
      />

      <HudOverlay
        telemetry={telemetry}
        animationMode={animationMode}
        variantName={SOLDIER_VARIANTS[variantId].name}
      />

      <ControlDock
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        animationMode={animationMode}
        onChangeMode={handleModeChange}
        walkSpeed={walkSpeed}
        onChangeWalkSpeed={handleWalkSpeedChange}
        timeScale={timeScale}
        onChangeTimeScale={handleTimeScaleChange}
        variantId={variantId}
        onChangeVariant={handleVariantChange}
        debugVisible={debugVisible}
        onToggleDebug={handleToggleDebug}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={handleCameraPreset}
        isRagdoll={telemetry.isRagdoll}
        onFireShot={() => sceneRef.current?.fireSimulatedBurst()}
        onTriggerRagdoll={() => sceneRef.current?.triggerRagdoll()}
        onShockwave={() => sceneRef.current?.triggerShockwave()}
        onRespawn={() => sceneRef.current?.respawn()}
      />
    </main>
  );
}
