import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportObjectToGlbBuffer(object: THREE.Object3D): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(result);
        } else {
          reject(new Error('GLTFExporter did not return binary ArrayBuffer'));
        }
      },
      (error) => {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
      {
        binary: true,
        onlyVisible: true,
      },
    );
  });
}

export function sanitizeGlbFilename(rawName: string): string {
  const cleaned = rawName
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, '-');
  const base = cleaned.length > 0 ? cleaned : 'archiform-house';
  return base.toLowerCase().endsWith('.glb') ? base : `${base}.glb`;
}

export async function downloadHouseAsGlb(
  houseGroup: THREE.Object3D,
  projectName: string,
): Promise<{ filename: string; byteLength: number }> {
  const buffer = await exportObjectToGlbBuffer(houseGroup);
  const filename = sanitizeGlbFilename(projectName);

  const blob = new Blob([buffer], { type: 'model/gltf-binary' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);

  return { filename, byteLength: buffer.byteLength };
}
