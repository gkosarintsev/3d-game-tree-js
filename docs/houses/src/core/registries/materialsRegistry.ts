import type {
  RoofMaterialId,
  TrimFinishId,
  WallMaterialId,
} from '../../types/house';

export type TextureRecipe =
  | 'stucco'
  | 'brick'
  | 'timber'
  | 'concrete'
  | 'panel'
  | 'curtain'
  | 'brutalist'
  | 'corrugated'
  | 'shingles'
  | 'standing-seam'
  | 'terracotta'
  | 'membrane';

export interface MaterialSpec<T extends string> {
  id: T;
  name: string;
  recipe: TextureRecipe;
  roughness: number;
  metalness: number;
  bumpScale: number;
  repeatScale: number;
  swatches: Array<{ label: string; hex: string }>;
}

export interface TrimFinishSpec {
  id: TrimFinishId;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  doorColor: string;
}

export const WALL_MATERIALS_REGISTRY: Record<WallMaterialId, MaterialSpec<WallMaterialId>> = {
  stucco: {
    id: 'stucco',
    name: 'Штукатурка',
    recipe: 'stucco',
    roughness: 0.88,
    metalness: 0.02,
    bumpScale: 0.015,
    repeatScale: 1.2,
    swatches: [
      { label: 'Тёплый кремовый', hex: '#f0ece1' },
      { label: 'Снежный', hex: '#f4f6f8' },
      { label: 'Песочный', hex: '#dfd1ba' },
      { label: 'Шалфей', hex: '#cfd6cb' },
    ],
  },
  brick: {
    id: 'brick',
    name: 'Кирпич',
    recipe: 'brick',
    roughness: 0.85,
    metalness: 0.03,
    bumpScale: 0.035,
    repeatScale: 1.4,
    swatches: [
      { label: 'Обожжённая глина', hex: '#a95842' },
      { label: 'Баварская кладка', hex: '#7b493b' },
      { label: 'Клинкер песочный', hex: '#c8ab89' },
      { label: 'Графитовый кирпич', hex: '#4b4e54' },
    ],
  },
  timber: {
    id: 'timber',
    name: 'Брус / Планкен',
    recipe: 'timber',
    roughness: 0.72,
    metalness: 0.04,
    bumpScale: 0.025,
    repeatScale: 1.1,
    swatches: [
      { label: 'Лиственница', hex: '#c29568' },
      { label: 'Медовый дуб', hex: '#a97748' },
      { label: 'Сканди-серый', hex: '#8b8e8b' },
      { label: 'Обожжённое дерево', hex: '#3b342f' },
    ],
  },
  concrete: {
    id: 'concrete',
    name: 'Архитектурный бетон',
    recipe: 'concrete',
    roughness: 0.78,
    metalness: 0.06,
    bumpScale: 0.02,
    repeatScale: 0.9,
    swatches: [
      { label: 'Светлый бетон', hex: '#d9dde2' },
      { label: 'Холодный камень', hex: '#adb5bd' },
      { label: 'Тёмный сланец', hex: '#5f6770' },
      { label: 'Травертин', hex: '#d5cbb8' },
    ],
  },
  panel: {
    id: 'panel',
    name: 'ЖБ панели (СССР)',
    recipe: 'panel',
    roughness: 0.84,
    metalness: 0.03,
    bumpScale: 0.028,
    repeatScale: 1.0,
    swatches: [
      { label: 'Типовой бежевый', hex: '#d6d0c4' },
      { label: 'Советский голубой', hex: '#9eb5c4' },
      { label: 'Мятно-зелёный', hex: '#9db6a8' },
      { label: 'Охристо-жёлтый', hex: '#d4be8c' },
      { label: 'Серый бетон', hex: '#b4bac0' },
      { label: 'Терракота', hex: '#c5998d' },
    ],
  },
  curtain: {
    id: 'curtain',
    name: 'Кассетный металл',
    recipe: 'curtain',
    roughness: 0.32,
    metalness: 0.74,
    bumpScale: 0.018,
    repeatScale: 1.2,
    swatches: [
      { label: 'Титановый графит', hex: '#4b5563' },
      { label: 'Серебро сатин', hex: '#b8c2cc' },
      { label: 'Тёмная бронза', hex: '#635347' },
      { label: 'Холодная сталь', hex: '#8899ab' },
      { label: 'Тёплый шампань', hex: '#c9bfae' },
    ],
  },
  brutalist: {
    id: 'brutalist',
    name: 'Мега-бетон',
    recipe: 'brutalist',
    roughness: 0.86,
    metalness: 0.14,
    bumpScale: 0.036,
    repeatScale: 1.4,
    swatches: [
      { label: 'Бетон Найт-Сити', hex: '#5c636e' },
      { label: 'Тёмный базальт', hex: '#3b414b' },
      { label: 'Песчаный монолит', hex: '#8b8378' },
      { label: 'Сталь-графит', hex: '#495464' },
      { label: 'Оксид ржавчины', hex: '#6e524b' },
    ],
  },
  corrugated: {
    id: 'corrugated',
    name: 'Гофролист / Шифер',
    recipe: 'corrugated',
    roughness: 0.64,
    metalness: 0.38,
    bumpScale: 0.042,
    repeatScale: 1.5,
    swatches: [
      { label: 'Бирюзовая фавела', hex: '#5a8a92' },
      { label: 'Ржавый шифер', hex: '#8e5a44' },
      { label: 'Оцинковка выцв.', hex: '#8d949b' },
      { label: 'Охра выгоревшая', hex: '#b88a56' },
      { label: 'Тёмный профлист', hex: '#484e57' },
    ],
  },
};

export const ROOF_MATERIALS_REGISTRY: Record<RoofMaterialId, MaterialSpec<RoofMaterialId>> = {
  shingles: {
    id: 'shingles',
    name: 'Мягкая черепица',
    recipe: 'shingles',
    roughness: 0.86,
    metalness: 0.04,
    bumpScale: 0.03,
    repeatScale: 1.6,
    swatches: [
      { label: 'Антрацит', hex: '#2e3238' },
      { label: 'Грильяж', hex: '#543d32' },
      { label: 'Хвойный', hex: '#394b42' },
    ],
  },
  'standing-seam': {
    id: 'standing-seam',
    name: 'Фальцевая кровля',
    recipe: 'standing-seam',
    roughness: 0.34,
    metalness: 0.72,
    bumpScale: 0.022,
    repeatScale: 1.5,
    swatches: [
      { label: 'Графит RAL 7024', hex: '#2c333a' },
      { label: 'Чёрный матовый', hex: '#1e2024' },
      { label: 'Оксидированный цинк', hex: '#6c757d' },
      { label: 'Тёмная бронза', hex: '#4d3e36' },
    ],
  },
  terracotta: {
    id: 'terracotta',
    name: 'Керамическая черепица',
    recipe: 'terracotta',
    roughness: 0.68,
    metalness: 0.05,
    bumpScale: 0.04,
    repeatScale: 1.6,
    swatches: [
      { label: 'Терракота', hex: '#9b4a36' },
      { label: 'Красная медь', hex: '#833c2a' },
      { label: 'Шоколад', hex: '#4a352e' },
    ],
  },
  membrane: {
    id: 'membrane',
    name: 'Кровельная мембрана',
    recipe: 'membrane',
    roughness: 0.65,
    metalness: 0.08,
    bumpScale: 0.01,
    repeatScale: 1.0,
    swatches: [
      { label: 'Базальт', hex: '#374151' },
      { label: 'Светло-серый', hex: '#6b7280' },
      { label: 'Гравийный настил', hex: '#8d8b84' },
    ],
  },
};

export const TRIM_FINISHES_REGISTRY: Record<TrimFinishId, TrimFinishSpec> = {
  charcoal: {
    id: 'charcoal',
    name: 'Антрацит',
    color: '#252a30',
    roughness: 0.36,
    metalness: 0.55,
    doorColor: '#1e2329',
  },
  'warm-white': {
    id: 'warm-white',
    name: 'Молочный белый',
    color: '#f5f4ef',
    roughness: 0.42,
    metalness: 0.12,
    doorColor: '#5c4033',
  },
  'natural-oak': {
    id: 'natural-oak',
    name: 'Натуральный дуб',
    color: '#9c7148',
    roughness: 0.58,
    metalness: 0.05,
    doorColor: '#7a5230',
  },
  bronze: {
    id: 'bronze',
    name: 'Тёмная бронза',
    color: '#4e3f35',
    roughness: 0.32,
    metalness: 0.68,
    doorColor: '#3a2d25',
  },
};

export const WALL_MATERIAL_LIST = Object.values(WALL_MATERIALS_REGISTRY);
export const ROOF_MATERIAL_LIST = Object.values(ROOF_MATERIALS_REGISTRY);
export const TRIM_FINISH_LIST = Object.values(TRIM_FINISHES_REGISTRY);
