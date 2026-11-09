/**
 * Компилятор CityForge v3 (`kind: 'cityforge'`, docs/world-format.md) в бриф
 * движка (`kind: 'open'` / json2), который умеют `normalizeLevel` → `splitLevel`
 * → `generateCatalog`. «Сделать играбельным» = прогнать через обычный пайплайн,
 * а не писать второй движок.
 *
 * Поддерживается подмножество, достаточное для пустой плоской главы со
 * стримингом (level-03): плита, цель A→B, чанки 256×256, без инстансов, сетей,
 * рельефа-модификаторов и воды. Неподдержанное содержимое — явная ошибка, чтобы
 * формат не «компилировался» с потерей данных.
 */

const SUPPORTED_EMPTY = (arr, name, errors) => {
  if (Array.isArray(arr) && arr.length) errors.push(`${name}: компилятор движка пока не умеет непустые '${name}' (${arr.length} шт.) — глава не может быть собрана без потерь`);
};
const SUPPORTED_NONE = (val, name, errors) => {
  if (val && (Array.isArray(val) ? val.length : typeof val === 'object' && Object.keys(val).length)) {
    errors.push(`${name}: компилятор движка пока не поддерживает '${name}'`);
  }
};

/**
 * @param {object} raw бриф CityForge v3
 * @returns {{ engine: object, warnings: string[] }}
 */
export function compileCityforge(raw) {
  const errors = [];
  const warnings = [];
  const cf = raw.cityforge ?? {};
  SUPPORTED_EMPTY(raw.instances ?? cf.instances, 'instances', errors);
  SUPPORTED_EMPTY(cf.districts, 'cityforge.districts', errors);
  SUPPORTED_EMPTY(cf.blocks, 'cityforge.blocks', errors);
  SUPPORTED_EMPTY(cf.parcels, 'cityforge.parcels', errors);
  SUPPORTED_EMPTY(cf.caves?.systems ?? cf.caves, 'cityforge.caves', errors);
  SUPPORTED_NONE(cf.networks, 'cityforge.networks', errors);
  SUPPORTED_NONE(cf.structures, 'cityforge.structures', errors);
  SUPPORTED_NONE(cf.hydrology, 'cityforge.hydrology', errors);
  SUPPORTED_NONE(cf.terrain, 'cityforge.terrain', errors);
  if (errors.length) {
    const e = new Error(errors.join('\n'));
    e.name = 'CityforgeCompileError';
    e.errors = errors;
    throw e;
  }

  const ground = raw.ground ?? {};
  const gp = raw.gameplay ?? {};
  const stream = raw.stream;
  if (!stream) throw Object.assign(new Error('stream: для открытого мира CityForge нужен stream (chunk/keep/ahead/budget)'), { name: 'CityforgeCompileError', errors: ['нет stream'] });

  // Небо — не часть формата CityForge v0.1; движку нужен вид. Дефолт — простой день.
  const sky = raw.sky ?? {
    sky: 12575732,
    fog: { color: 14230008, near: 120, far: 900 },
    sun: { color: 16771932, intensity: 2.2, position: [-200, 260, -140] },
    hemi: { sky: 13613055, ground: 5527871, intensity: 1.0 },
  };

  const sx = gp.spawn?.x ?? 0, sz = gp.spawn?.z ?? 0;
  const ex = gp.exit?.x ?? 0, ez = gp.exit?.z ?? 0;
  // Плоские площадки под A и B: иначе нормализатор предупреждает, что маяк
  // повиснет без настила, а check-levels требует ноль предупреждений. Мир
  // остаётся пустым — это только маркеры цели.
  const pad = (id, x, z) => ({ id, type: 'ground', width: 6, points: [{ x: x - 3, z, y: ground.y ?? 0 }, { x: x + 3, z, y: ground.y ?? 0 }] });

  const engine = {
    $schema: './level-v2.schema.json',
    kind: 'open',
    metadata: {
      levelName: raw.metadata?.levelName,
      name: raw.metadata?.name,
      hint: raw.metadata?.hint,
      units: 'meters',
      notes: (raw.metadata?.notes ? raw.metadata.notes + ' ' : '') + '[скомпилировано из CityForge v3]',
    },
    ground: {
      size: ground.size,
      y: ground.y ?? 0,
      ...(ground.color != null ? { color: ground.color } : { color: 7322954 }),
    },
    stream: {
      chunk: stream.chunk,
      keep: stream.keep,
      aheadMin: stream.aheadMin,
      aheadMax: stream.aheadMax,
      budgetMs: stream.budgetMs,
    },
    buildings: [],
    roads: [pad('spawn_pad', sx, sz), pad('exit_pad', ex, ez)],
    lights: [],
    gameplay: {
      goal: gp.goal ?? 'exit',
      spawn: { x: sx, z: sz },
      exit: { x: ex, z: ez },
      ...(gp.exitRadius != null ? { exitRadius: gp.exitRadius } : {}),
      enemies: { count: gp.enemies?.count ?? 0 },
      alienEnemies: { count: gp.alienEnemies?.count ?? 0 },
      ...(gp.cars ? { cars: gp.cars } : {}),
    },
    sky,
  };
  return { engine, warnings };
}
