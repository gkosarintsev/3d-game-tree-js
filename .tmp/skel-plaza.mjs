// Разведка плаз: терминалы улиц районов и поле между ними. Временный файл.
import { readFileSync } from 'node:fs';
import { expandCity } from '../tools/city.js';
import { normalizeLevel } from '../tools/normalize-level.mjs';
import { skeletonOf } from '../tools/skeleton.mjs';
import { SurfaceField } from '../src/surfaces.js';

const raw = JSON.parse(readFileSync(process.env.F || 'probe/open-2km.json', 'utf8'));
const map = normalizeLevel(expandCity(structuredClone(raw))).map;
const field = new SurfaceField(map);
field.collectData();
const sk = skeletonOf(map, { field });

// узлы скелета с ключами
const nodes = sk.meta; // noqa
console.log('roads:', field.roads.length, field.roads.map(r => `${r.id}[${r.type}]×${(r.decks||[]).length}`).join(' '));
