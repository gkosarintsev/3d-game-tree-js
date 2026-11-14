import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultConfigForStyle } from '../core/houseMetrics';
import { LocalProjectRepository, type StorageAdapter } from './projectStorage';

function createMemoryStorage(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

test('LocalProjectRepository seeds starter presets and persists saved projects', () => {
  const storage = createMemoryStorage();
  const repo = new LocalProjectRepository(storage);

  const initial = repo.listProjects();
  assert.equal(initial.length, 11);
  assert.equal(initial[0].isBuiltInPreset, true);
  assert.ok(initial.some((p) => p.config.styleId === 'soviet-panel'));
  assert.ok(initial.some((p) => p.config.styleId === 'office-building'));
  assert.ok(initial.some((p) => p.config.styleId === 'skyscraper'));
  assert.ok(initial.some((p) => p.config.styleId === 'megabuilding'));
  assert.ok(initial.some((p) => p.config.styleId === 'slum-shack'));

  const customConfig = createDefaultConfigForStyle('nordic-barn');
  customConfig.dimensions.width = 9.4;

  const saved = repo.saveProject('Дача у озера', customConfig);
  assert.equal(saved.name, 'Дача у озера');
  assert.equal(saved.isBuiltInPreset, false);

  // Re-instantiate repository with same storage adapter to simulate page reload
  const reloadedRepo = new LocalProjectRepository(storage);
  const reloadedProjects = reloadedRepo.listProjects();
  assert.equal(reloadedProjects.length, 12);
  assert.equal(reloadedProjects[0].name, 'Дача у озера');
  assert.equal(reloadedProjects[0].config.dimensions.width, 9.4);
});

test('LocalProjectRepository persists multi-entrance multi-story soviet-panel, office-building, skyscraper, megabuilding, and slum-shack projects', () => {
  const storage = createMemoryStorage();
  const repo = new LocalProjectRepository(storage);
  const config = createDefaultConfigForStyle('soviet-panel');
  config.dimensions.floors = 12;
  config.dimensions.entrances = 4;

  const saved = repo.saveProject('Серия П-44 Юбилейный', config);
  assert.equal(saved.config.dimensions.floors, 12);
  assert.equal(saved.config.dimensions.entrances, 4);

  const officeConfig = createDefaultConfigForStyle('office-building');
  officeConfig.dimensions.floors = 9;
  officeConfig.features.roofType = 'stepped';
  repo.saveProject('БЦ Премьер-9', officeConfig);

  const towerConfig = createDefaultConfigForStyle('skyscraper');
  towerConfig.dimensions.floors = 45;
  towerConfig.features.roofType = 'shed';
  repo.saveProject('Башня Меркурий-45', towerConfig);

  const megaConfig = createDefaultConfigForStyle('megabuilding');
  megaConfig.dimensions.floors = 50;
  megaConfig.features.roofType = 'flat';
  repo.saveProject('Мегастроение H12', megaConfig);

  const slumConfig = createDefaultConfigForStyle('slum-shack');
  slumConfig.dimensions.floors = 3;
  slumConfig.features.roofType = 'stepped';
  repo.saveProject('Сектор Фавела-3', slumConfig);

  const reloaded = new LocalProjectRepository(storage).listProjects();
  assert.equal(reloaded[0].config.styleId, 'slum-shack');
  assert.equal(reloaded[0].config.dimensions.floors, 3);
  assert.equal(reloaded[0].config.features.roofType, 'stepped');
  assert.equal(reloaded[1].config.styleId, 'megabuilding');
  assert.equal(reloaded[1].config.dimensions.floors, 50);
  assert.equal(reloaded[1].config.features.roofType, 'flat');
  assert.equal(reloaded[2].config.styleId, 'skyscraper');
  assert.equal(reloaded[2].config.dimensions.floors, 45);
  assert.equal(reloaded[3].config.styleId, 'office-building');
  assert.equal(reloaded[3].config.dimensions.floors, 9);
  assert.equal(reloaded[3].config.features.roofType, 'stepped');
  assert.equal(reloaded[4].config.dimensions.floors, 12);
  assert.equal(reloaded[4].config.dimensions.entrances, 4);
});

test('LocalProjectRepository serializes and imports JSON project files safely', () => {
  const repo = new LocalProjectRepository(createMemoryStorage());
  const config = createDefaultConfigForStyle('modern-pavilion');
  const saved = repo.saveProject('Вилла Модерн', config);

  const json = repo.serializeProject(saved);
  const imported = repo.parseImportedProject(json);
  assert.equal(imported.error, undefined);
  assert.ok(imported.project);
  assert.equal(imported.project?.name, 'Вилла Модерн');

  const badImport = repo.parseImportedProject('{broken');
  assert.ok(badImport.error);
});

