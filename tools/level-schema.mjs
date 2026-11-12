/**
 * Схема уровня (JSON, который выдаёт LLM) и её проверка — бэкенд-валидатор
 * пайплайна из docs/editor-plan.md.
 *
 * Ajv в проект не ставится (правило «новых npm-зависимостей» в AGENTS.md),
 * поэтому поля описаны декларативно и обходятся руками. Проверка делится на
 * два прохода: структура (типы, обязательность, enum, диапазоны, плюс правила
 * `stream`, где вердикт зависит сразу от нескольких полей) и геометрия
 * (осевые рёбра, замкнутость, «комната внутри footprint», пересечения, уклоны
 * дорог, опоры в плане дороги, лимит настоящих источников света).
 */
import { CONFIG } from '../src/config.js';
import {
  AXIS_EPS, arcBounds, cellKey, frameAt, frameOf, normalizePolygon, obbHitsObb, obbHitsRect, obbOf,
  polyBounds, polyEdges, polyRects, r3, rasterPoly, rasterRect, rectsIntersect, cellsIntersect,
  rotatedBounds,
} from '../src/geo2d.js';
import { bridgeNoses, normalizeBuilding, normalizeWaterway, resolveRoadElements, roadCapsOf, toWorld, isV2Kind } from './normalize-level.mjs';
import { ARCHETYPE_NAMES, STYLE_NAMES, DISTRICT_DEFAULTS, TRACK_DEFAULTS, TRACK_MAX_JITTER } from './city.js';
import { cellGrid, CHUNK_MIN, CHUNK_MAX } from './chunk-level.mjs';
import { reliefOf } from '../src/relief.js';

const J = CONFIG.jsonMap;
const DEG = Math.PI / 180;
// тип комнаты — подпись назначения: парсер и JsonMap его не читают (пол, солид и
// граф от него не зависят), но автору брифа он нужен, чтобы по id и типу
// различать вестибюль, рынок и склад — и чтобы этап неона мог вешать витрины
// на торговые, а не на первые попавшиеся
const ROOM_TYPES = ['office', 'corridor', 'hall', 'room', 'cafe', 'utility', 'lobby', 'market', 'warehouse'];
// skybridge — не-наземный настил без опор: его держат здания, поэтому у каждого
// его торца обязана быть дверь или ходовая кровля на той же отметке
const ROAD_TYPES = ['ground', 'bridge', 'embankment', 'skybridge'];
// ladder — вертикальный марш: план шахты не меняется с высотой, подъём одной
// проступи тот же, что у ступени (J.maxRise), поэтому нога идёт им, как лестницей
const STAIR_TYPES = ['straight', 'l_shape', 'spiral', 'ladder'];
const BANK_TYPES = ['quay', 'slope'];
const LIGHT_TYPES = ['point', 'spot', 'directional'];
const LINK_TYPES = ['main_entrance', 'door', 'back_entrance'];

// ------------------------------------------------------------- описание полей

const num = (opts = {}) => ({ kind: 'number', ...opts });
const str = (opts = {}) => ({ kind: 'string', ...opts });
const bool = (opts = {}) => ({ kind: 'boolean', ...opts });
const color = (opts = {}) => ({ kind: 'color', ...opts });
const obj = (fields, opts = {}) => ({ kind: 'object', fields, ...opts });
const arr = (items, opts = {}) => ({ kind: 'array', items, ...opts });
const ref = (name, opts = {}) => ({ kind: 'ref', name, ...opts });
const V2XZ = obj({ x: num({ req: true, doc: 'м: мировая координата X' }), z: num({ req: true, doc: 'м: мировая координата Z' }) }, { doc: 'точка в плане (метры)' });
const V3XYZ = obj({ x: num({ req: true, doc: 'м: мировая координата X' }), y: num({ req: true, doc: 'м: мировая отметка' }), z: num({ req: true, doc: 'м: мировая координата Z' }) }, { doc: 'точка в мире (метры)' });
/**
 * Описание полей брифа. У v1/v2 каждый лист несёт `doc` — смысл, единицу и
 * источник предела или дефолта; у v3 (`level-common.schema.json`) `doc` есть
 * только у неочевидных полей и только на английском. `default` ставится, лишь
 * если код действительно подставляет значение при отсутствии поля. Ни `doc`, ни `default` не участвуют в проверке:
 * `checkValue` читает `kind/min/max/enum/req/items/fields` и больше ничего. Они
 * нужны `tools/export-schema.mjs`, который печатает JSON Schema draft-07 —
 * единственный артефакт, который автор (или ИИ) может прочитать ДО запуска
 * пайплайна. Отсюда правило брифа: число, равное `default` из схемы, в бриф не
 * пишут — ср. `city.track` главы 13, где 14 полей из 15 дословно повторяли
 * `TRACK_DEFAULTS`, и правка радиуса в генераторе осталась бы невидимой в данных
 * главы.
 *
 * `default` обязан приходить из того же объекта, который подставляет его в коде
 * (`CONFIG.jsonMap`, `CONFIG.fog/sun/hemi/night/terrain`, `DISTRICT_DEFAULTS` и
 * `TRACK_DEFAULTS` из tools/city.js), иначе схема станет второй правдой.
 */

/**
 * Секция `city` описана здесь ради экспортируемой схемы: `expandCity` вырезает
 * `city` из брифа ДО валидатора, поэтому `validateLevel` её не видит и это
 * описание ничего не проверяет. Без него JSON Schema отвергал бы каждый бриф
 * с секцией `city`.
 *
 * Списки ключей живут в гейтах генератора (`CITY_KEYS`, `DISTRICT_KEYS`,
 * `DISTRICT_SECTION_KEYS`, `V2_DISTRICT_KEYS`, `V2_DISTRICT_SECTION_KEYS` и
 * `TRACK_KEYS` в tools/city.js), а совпадение описания с гейтом сторожит сюита
 * `ключи city в схеме равны гейтам генератора`: расхождение означает, что
 * редактор подсказывает автору ключ, который пайплайн бракует, или наоборот —
 * молчит о ключе, который генератор не читает.
 */
const DISTRICT_STREET_V1 = obj({
  pitch: num({ min: 8, default: DISTRICT_DEFAULTS.street.pitch, doc: 'м: шаг улиц квартала' }),
  width: num({ min: 2, default: DISTRICT_DEFAULTS.street.width, doc: 'м: ширина проезжей части' }),
}, { doc: 'сетка улиц района' });

/** Район v1 — тот же, без косого квартала и профиля улицы. */
const CITY_DISTRICT_V1 = obj({
  id: str({ req: true, doc: 'имя района: по нему строятся id лотов `<id>_<номер>` и префикс вытеснения авторской записи' }),
  name: str({ doc: 'название для человека' }),
  style: str({ enum: STYLE_NAMES, default: DISTRICT_DEFAULTS.style, doc: 'набор материалов фасада квартала' }),
  block: obj({
    minX: num({ req: true, doc: 'м: граница AABB квартала в мировых осях' }),
    maxX: num({ req: true, doc: 'м: граница AABB квартала' }),
    minZ: num({ req: true, doc: 'м: граница AABB квартала' }),
    maxZ: num({ req: true, doc: 'м: граница AABB квартала' }),
  }, { req: true, doc: 'прямоугольник квартала; при `polygon` (v2) это габарит полигона, и по нему мелится сетка' }),
  street: DISTRICT_STREET_V1,
  lot: obj({
    pitch: num({ min: 4, default: DISTRICT_DEFAULTS.lot.pitch, doc: 'м: шаг лотов' }),
    inset: num({ min: 0, default: DISTRICT_DEFAULTS.lot.inset, doc: 'м: отступ корпуса от границы лота' }),
    merge: num({ min: 0, max: 1, default: DISTRICT_DEFAULTS.lot.merge, doc: 'доля лотов, склеенных в один корпус' }),
  }, { doc: 'сетка лотов квартала' }),
  height: obj({
    minFloors: num({ min: 1, default: DISTRICT_DEFAULTS.height.minFloors, doc: 'эт: нижний предел этажности' }),
    maxFloors: num({ min: 1, default: DISTRICT_DEFAULTS.height.maxFloors, doc: 'эт: верхний предел этажности (вводимый дом ограничен J.enterableFloors)' }),
    floorHeight: num({ min: 2.4, max: 8, default: DISTRICT_DEFAULTS.height.floorHeight, doc: 'м: высота этажа' }),
  }, { doc: 'разброс этажности квартала' }),
  tower: obj({
    chance: num({ min: 0, max: 1, default: DISTRICT_DEFAULTS.tower.chance, doc: 'доля лотов, ставших башней' }),
    floors: arr(num({ min: 1 }), { minItems: 2, maxItems: 2, default: DISTRICT_DEFAULTS.tower.floors, doc: 'эт: [min, max] этажности башни' }),
    floorHeight: num({ min: 2.4, max: 8, default: DISTRICT_DEFAULTS.tower.floorHeight, doc: 'м: высота этажа башни' }),
  }, { doc: 'башни района: доля лотов и их этажность' }),
  archetypes: arr(str({ enum: ARCHETYPE_NAMES }), { default: DISTRICT_DEFAULTS.archetypes, doc: 'разрешённые формы корпуса; ритм ГПСЧ района значим: снять форму — сдвинуть счётчики всех последующих лотов' }),
  enterableEvery: num({ min: 1, default: DISTRICT_DEFAULTS.enterableEvery, doc: 'лот-кандидат (ровно один прямоугольник плана, не башня) открывается каждому N-му; отказ — счётчик house_not_rect / house_no_stair / house_no_entrance, а не молчание' }),
  skip: num({ min: 0, max: 1, default: DISTRICT_DEFAULTS.skip, doc: 'доля лотов, оставленных пустыми' }),
  courtyard: num({ min: 0, max: 1, default: DISTRICT_DEFAULTS.courtyard, doc: 'доля лотов, ставших замкнутым двором (формы u / t / l / bar_pair)' }),
  roofs: obj({
    walkable: bool({ default: DISTRICT_DEFAULTS.roofs.walkable, doc: 'true — кровля становится опорой и по ней идёт граф навигации' }),
    access: num({ min: 0, max: 1, default: DISTRICT_DEFAULTS.roofs.access, doc: 'доля домов с выходом на кровлю' }),
    parapet: num({ min: 0, max: 1.5, default: DISTRICT_DEFAULTS.roofs.parapet, doc: 'м: высота парапета кровли' }),
  }, { doc: 'кровля квартала: ходовая ли она и у скольких домов есть выход на неё' }),
}, { doc: 'квартал генератора (v1): размеры лота, отметки и план марша никогда не берутся из Math.random' });

/** Район v2: тот же плюс косой квартал и профиль улицы по полю. */
const CITY_DISTRICT_V2 = obj({
  ...CITY_DISTRICT_V1.fields,
  street: obj({
    ...DISTRICT_STREET_V1.fields,
    grade: num({ min: 0, max: J.maxSlope, default: J.streetGrade, doc: 'м/м: подъём проезжей части района по профилю поля. Это НЕ крутизна грунта (relief.maxSlope) и не уклон настила' }),
  }, { doc: 'сетка улиц квартала (v2: плюс профиль улицы по рельефу)' }),
  yaw: num({ min: -180, max: 180, default: 0, doc: 'град: поворот всего квартала вокруг центра блока; buildings[].rotation района тогда = yaw + джиттер ±6°' }),
  polygon: arr(V2XZ, { minItems: 3, doc: 'м: контур квартала; режет прогоны улиц и отбраковывает лоты, чей центр вне контура (счётчик lot_outside_polygon)' }),
}, { doc: CITY_DISTRICT_V1.doc });

const CITY_TRACK = obj({
  id: str({ default: TRACK_DEFAULTS.id, doc: 'приставка id настилов трассы' }),
  center: arr(num({}), { minItems: 2, maxItems: 2, default: TRACK_DEFAULTS.center, doc: 'м: центр звезды оси [x, z]' }),
  radius: num({ min: 10, default: TRACK_DEFAULTS.radius, doc: 'м: радиус вершины звезды. Это НЕ радиус дуги: дуга стоит на биссектрисе угла вершины, а её радиус даёт скругление' }),
  turns: num({ min: 3, default: TRACK_DEFAULTS.turns, doc: 'вершин звезды = число поворотов петли; внешние углы замкнутого контура обязаны дать ровно 2π' }),
  minRadius: num({ min: 2, default: TRACK_DEFAULTS.minRadius, doc: 'м: радиус САМОГО КРУТОГО поворота — нижний предел скругления, а не «радиус петли»; внутренняя кромка требует minRadius − width/2 > 0,5 м, иначе полотно сложится на повороте' }),
  curvatureJitter: num({ min: 0, max: TRACK_MAX_JITTER, default: TRACK_DEFAULTS.curvatureJitter, doc: 'доля дрожью радиуса между minRadius и radius; предел — гейт, а не кламп: при ≥ 0,5 звезду можно свернуть невыпуклой' }),
  width: num({ min: 2, max: 30, default: TRACK_DEFAULTS.width, doc: 'м: ширина полотна' }),
  bank: num({ min: -30, max: 30, default: TRACK_DEFAULTS.bank, doc: 'град: крен на дугах (ноль на обоих срезах, переход — половиной косинуса)' }),
  grade: num({ min: 0, max: J.maxSlope, default: TRACK_DEFAULTS.grade, doc: 'м/м: продольный уклон оси; он же ограничивает раскрутку крена' }),
  clearance: num({ min: 0, default: TRACK_DEFAULTS.clearance, doc: 'м: зазор полотна над корытом поля; обязан превышать J.streetRise, иначе съезд стартует ниже асфальта, который принимает' }),
  amplitude: num({ min: 0, default: TRACK_DEFAULTS.amplitude, doc: 'м: половина высоты высотной волны; вместе с `waves` ограничена пределом grade · Lmin, чтобы волна не нарушила уклон' }),
  waves: num({ min: 1, default: TRACK_DEFAULTS.waves, doc: 'число полуволн волны по длине петли' }),
  rails: bool({ default: TRACK_DEFAULTS.rails, doc: 'перила на настилах; на стыке съезда генератор режет окно без периль (11 м на петле и 5,5 м на подъёме у каждого носа)' }),
  lamps: bool({ default: TRACK_DEFAULTS.lamps, doc: 'фонари на полотне. Правило «уклонный настил фонарей не носит» снимает свет со всех наклонных пластин, а высотная волна делает наклонным каждый настил трассы — поэтому в главе 13 стоит false (закрытый вопрос § 10.5)' }),
  entries: num({ min: 0, default: TRACK_DEFAULTS.entries, doc: 'число съездов; каждый обязан найти наземную улицу (bridgeNoses), иначе подъём кончится в воздухе' }),
}, { doc: 'кольцевая трасса: ось — скруглением звезды, профиль — наименьшая g-липшицева мажоранта требования, эмиссия — одна дорога type bridge с разрезом в одном шве' });

const CITY_SPEC_V1 = obj({
  seed: num({ req: true, doc: 'целое: сид ГПСЧ mulberry32. Единственный источник случайности квартала, и **порядок вызовов значим**: снять один гейт — сдвинуть счётчики всех последующих районов, поэтому перегенерированный модуль коммитится вместе с правкой' }),
  districts: arr(CITY_DISTRICT_V1, { minItems: 1, req: true, doc: 'районы генератора' }),
}, { doc: 'секция генератора кварталов (tools/city.js): разворачивается парсером в обычные roads/buildings и в модуль главы не доезжает. Для `validateLevel` невидима, необязательна и описана ради JSON Schema брифа' });

const CITY_SPEC_V2 = obj({
  seed: CITY_SPEC_V1.fields.seed,
  districts: arr(CITY_DISTRICT_V2, { minItems: 1, req: true, doc: CITY_SPEC_V1.fields.districts.doc }),
  track: CITY_TRACK,
}, { doc: CITY_SPEC_V1.doc });

const LEVEL_SPEC = obj({
  // путь к exported-схеме: подсказка редактору и ИИ, где лежат описания полей.
  // Значение выбирается по `kind` (`./level.schema.json` для v1,
  // `./level-v2.schema.json` для `json2`); в модуль главы ключ не доезжает
  $schema: str({ doc: 'путь к JSON Schema этого брифа; v1 — ./level.schema.json, v2 — ./level-v2.schema.json' }),
  // переключатель версии живёт в брифе, поэтому v1 обязан принимать и явную
  // подпись: `normalizeLevel` ставит `raw.kind ?? 'json'`, и автор, написавший
  // 'json' честно, получал бы «поле не описано в схеме» за то же самое значение
  kind: str({ enum: ['json'], doc: 'версия брифа: v1 (оси мира); в v2 поле обязательное и принимает `json2` и `open`' }),
  metadata: obj({
    levelName: str({ req: true, doc: 'имя главы для пайплайна (например, level-16) — по нему CLI выводит имя экспорта' }),
    name: str({ req: true, doc: 'заголовок главы в HUD' }),
    hint: str({ req: true, doc: 'подсказка игроку о пути A→B' }),
    engine: str({ doc: 'служебная подпись исходника, движок не читает' }),
    units: str({ enum: ['meters'], req: true, doc: 'единицы брифа: все длины и высоты — метры, углы — градусы' }),
    notes: str({ doc: 'зачем в главе такие числа и куда сядет игрок (например, «spawn — на стыке двух настилов подъёма»); движок не читает, это rationale для правящего главу' }),
  }, { req: true, doc: 'шапка брифа: имя для пайплайна, заголовок и подсказка для игрока; в модуль доезжают name и hint' }),
  ground: obj({
    y: num({ default: 0, doc: 'отметка «пола мира»; с `relief` гасится (см. src/relief.js)' }),
    size: num({ min: 20, req: true, doc: 'сторона квадратной плиты грунта в метрах; за её краем isBlocked истинна' }),
    color: color({ default: J.asphalt, doc: 'цвет грунта' }),
  }, { doc: 'плита мира' }),
  roads: arr(obj({
    id: str({ req: true, doc: 'уникальный id улицы; узлы графа и метки debugIds привязаны к нему' }),
    type: str({ enum: ROAD_TYPES, req: true, doc: 'ground — по грунту, bridge — настил над водой/улицей, embankment — полотно на откосе, skybridge — настил без опор с земли, торцы в дверь или кровлю' }),
    width: num({ min: 2, max: 30, req: true, doc: 'м: ширина полотна; в v2 при `elements` ширина живёт в каждом элементе (здесь можно не указывать)' }),
    lamps: bool({ default: false, doc: 'ставить ли автогенерированные фонари вдоль улицы (шаг J.lampSpacing)' }),
    points: arr(V3XYZ, { minItems: 2, req: true, doc: 'осевая polyline в метрах; в v2 альтернатива `elements`' }),
  }, { doc: 'одна улица: id, тип, ширина и ось — либо (v1) polyline, либо (v2) цепочка `elements`' }), { req: true, doc: 'авторские улицы; генератор добавляет свои кварталы поверх' }),
  // река, канал, сточная канава: осевые рёбра в плане, дно ниже уровня земли;
  // берег — отвесная набережная (quay) или откос (slope), брод — сходы в русло
  waterways: arr(obj({
    id: str({ req: true, doc: 'уникальный id русла' }),
    width: num({ min: 2, max: 120, req: true, doc: 'м: ширина между береговыми рёбрами' }),
    bedY: num({ req: true, doc: 'м: отметка дна; ниже `ground.y`, иначе русло не прорежет плиту' }),
    surfaceY: num({ req: true, doc: 'м: отметка зеркала воды (картинка, не опора)' }),
    bank: str({ enum: BANK_TYPES, req: true, doc: 'quay — отвесная набережная, slope — откос с заложением из J.maxSlope' }),
    bankRun: num({ min: 1, doc: 'м: заложение откоса; по умолчанию (ground.y − bedY) / J.maxSlope для slope, 0 для quay' }),
    wade: bool({ default: true, doc: 'true — дно свободно (нужно ≥ 2 схода), false — поперёк дна блокер, и граф обрывается у уреза' }),
    ramps: arr(obj({
      at: obj({ x: num({ req: true, doc: 'м: мировая X центра схода' }), z: num({ req: true, doc: 'м: мировая Z центра схода' }) }, { req: true, doc: 'м: центр схода на береговом рёбре' }),
      width: num({ min: 2, max: 12, default: J.rampWidth, doc: 'м: ширина пандуса схода' }),
    }, { doc: 'один сход: центр на берегу и ширина пандуса' }), { doc: 'сходы в русло; без них карниз береговой стенки не отпускает обратно' }),
    points: arr(V2XZ, { minItems: 2, req: true, doc: 'м: осевая polyline русла в плане' }),
  }, { doc: 'одно русло: ширина, отметки дна и воды, берег и сходы' }), { doc: 'русла: прорезают плиту грунта планами дна и держат твёрдость призмами' }),
  buildings: arr(obj({
    id: str({ req: true, doc: 'уникальный id дома; лоты генератора имеют форму `<id района>_<номер>`' }),
    name: str({ doc: 'название для метки debugIds; по умолчанию — id' }),
    // «чем построен этот корпус» — поле брифа и генератора (tools/city.js);
    // нормализатор его не читает, в модуль главы он не доезжает
    archetype: str({ enum: ARCHETYPE_NAMES, doc: 'форма корпуса у генератора; в брифе — только подпись происхождения, в модуль не доезжает' }),
    buildingType: str({ doc: 'тип дома (жилой, офис, торговый, башня и т.п.); сохраняется в модуле и используется движком для параметров фасада/окон' }),
    // «к какому району генератора относится лот» — то же служебное поле: по нему
    // нормализатор ставит одну террасу района, в модуль главы не доезжает
    district: str({ doc: 'id района, чью террасу и кадр получает лот; в модуль не доезжает' }),
    isEnterable: bool({ default: true, doc: 'false — корпус только декор фасада: этажи считаются ритмом, плит и маршей нет (потолок этажей тогда J.shellFloorsMax)' }),
    // потолок этажей — J.shellFloorsMax только для невводимых башен (их этажи —
    // ритм фасада, плит нет); вводимый дом ограничен J.enterableFloors — проверется геометрией
    floorsCount: num({ min: 1, max: J.shellFloorsMax, req: true, doc: 'эт: число этажей; вводимый дом ограничен J.enterableFloors (проверяется геометрией, а не этим максимумом)' }),
    floorHeight: num({ min: 2.4, max: 8, req: true, doc: 'м: высота этажа; все отметки перекрытий и маршей считаются от baseY + floorsCount · floorHeight' }),
    baseY: num({ doc: 'м: пол первого этажа; по умолчанию — опора грунта под центром дома' }),
    foundation: str({
      enum: ['podium', 'terrain'],
      doc: 'вариант фундамента на неровной поверхности: podium — прямоугольный блок до нижней точки земли (уходит в склон); terrain — низ следует форме ландшафта. baseY в обоих случаях поднимается до наивысшей точки контакта (дом не зарывается)',
    }),
    facadeMaterial: str({ default: 'concrete', doc: 'имя материала фасада; по нему ряды окон и вывесок берут надстройку из byMaterial' }),
    roof: obj({
      walkable: bool({ default: false, doc: 'true — кровля становится опорой (парапет J.parapetHeight по краю, маяк точки B может встать на неё); false — плита только картинка' }),
      parapet: num({ min: 0, max: 1.5, default: J.parapetHeight, doc: 'м: высота парапета ходовой кровли; 0 у non-walkable' }),
    }, { doc: 'кровля: плита на союзе footprint минус шахты маршей' }),
    footprint: arr(V2XZ, { minItems: 4, req: true, doc: 'м: замкнутый полигон плана дома (ГПСЧ-сетка комнат вписывается в него)' }),
    rooms: arr(obj({
      id: str({ req: true, doc: 'уникальный id комнаты' }),
      floor: num({ min: 0, req: true, doc: 'эт: этаж комнаты (0 — пол на baseY)' }),
      type: str({ enum: ROOM_TYPES, req: true, doc: 'назначение: выводимый ряд витрин неона опирается на торговые типы' }),
      polygon: arr(V2XZ, { minItems: 4, req: true, doc: 'м: план комнаты; обязан лежать внутри footprint и не пересекать другие комнаты' }),
      connections: arr(obj({
        target: str({ req: true, doc: 'id комнаты или улицы/настила по ту сторону проёма' }),
        portalPosition: V3XYZ,
        linkType: str({ enum: LINK_TYPES, doc: 'main_entrance / door / back_entrance: по нему нормализатор ставит проём и связывает внешний узел с решёткой дома' }),
      }, { doc: 'одна дверь: id цели за проёмом, точка портала и тип связки' }), { doc: 'двери комнаты; проём (rect), а не точка портала, решает связность' }),
    }, { doc: 'одна комната: этаж, назначение, план и двери' }), { req: true, doc: 'комнаты дома: решётка пола и граф навигации строятся по ним' }),
    stairs: arr(obj({
      id: str({ req: true, doc: 'уникальный id марша' }),
      connectsFloors: arr(num({ min: 0 }), { minItems: 2, maxItems: 2, req: true, doc: 'эт: [с, по] — концы марша; цепочка обязана быть непрерывной от пола до кровли, иначе _pruneToSpawn отсечёт решётку' }),
      type: str({ enum: STAIR_TYPES, req: true, doc: 'straight / l_shape / spiral / ladder; беговая длина ограничена stairRun (J.maxStairSlope), у ladder — J.maxRise на проступь' }),
      position: V2XZ,
      rotation: num({ default: 0, doc: 'град: поворот марша в собственных осях дома' }),
      dimensions: obj({ width: num({ min: 1, req: true, doc: 'м: ширина марша (для лестницы) или сторона шахты' }), length: num({ min: 1, req: true, doc: 'м: беговая длина марша' }), height: num({ doc: 'м: высота подъёма; по умолчанию шаг этажа' }) }, { doc: 'габарит шахты марша; для ladder по умолчанию J.ladderShaft × J.ladderShaft' }),
    }, { doc: 'один марш: какие этажи связывает, какой формы и где стоит его шахта' }), { doc: 'марши дома' }),
  }, { doc: 'один дом: план footprint, этажность, комнаты с дверями и марши; отметки считаются от baseY' }), { doc: 'авторские дома; кварталы генератора добавляются через `city`' }),
  landscapeObjects: arr(obj({
    id: str({ req: true, doc: 'уникальный id предмета' }),
    model: str({ enum: J.models, req: true, doc: 'имя модели из src/props.js; набор моделей открыт наружу как CONFIG.jsonMap.models' }),
    position: V3XYZ,
    rotation: obj({ x: num({ default: 0, doc: 'град' }), y: num({ default: 0, doc: 'град: азимут модели' }), z: num({ default: 0, doc: 'град' }) }, { doc: 'поворот по осям Object3D' }),
    scale: obj({ x: num({ min: 0.05, default: 1, doc: 'доля исходного размера модели' }), y: num({ min: 0.05, default: 1, doc: 'доля исходного размера модели' }), z: num({ min: 0.05, default: 1, doc: 'доля исходного размера модели' }) }, { doc: 'масштаб модели по осям Object3D' }),
  }, { doc: 'авторский декор: solids и навигации не создаёт (правило про декор в AGENTS.md)' }), { doc: 'предметы ландшафта' }),
  lights: arr(obj({
    id: str({ req: true, doc: 'уникальный id источника' }),
    type: str({ enum: LIGHT_TYPES, req: true, doc: 'point / spot / directional; настоящий directional в сцене один — «луна», она держит тени' }),
    position: V3XYZ,
    target: V3XYZ,
    color: color({ default: 0xffcf9a, doc: 'цвет огня' }),
    intensity: num({ min: 0, max: 400, default: CONFIG.night.intensity, doc: 'безразмерная яркость Three.js; предел на главу — J.maxRealLights настоящих источников' }),
    distance: num({ min: 0, default: CONFIG.night.reach, doc: 'м: радиус гасания (0 — без гасания)' }),
    angle: num({ min: 0, max: 1.57, default: 0.7, doc: 'рад: раствор пятна только для spot' }),
  }, { doc: 'один источник: тип, позиция, цель, цвет, яркость и радиус гасания' }), { doc: 'статичные источники света уровня; мойки направлены вверх, на корпуса' }),
  // светящиеся окна фасадов: само наличие секции включает ритм, числа — это
  // переопределение `CONFIG.jsonMap.windows` (включатель по той же причине, что у
  // `waterways`: бриф без окон обязан собраться ровно как раньше)
  windows: obj({
    spacing: num({ min: 0, max: 12, default: J.windows.spacing, doc: 'м: ритм окон вдоль грани; 0 — дому окна не рисуются вовсе' }),
    width: num({ min: 0.2, max: 6, default: J.windows.width, doc: 'м: ширина квада' }),
    height: num({ min: 0.2, max: 6, default: J.windows.height, doc: 'м: высота квада' }),
    sill: num({ min: 0, max: 3, default: J.windows.sill, doc: 'м: подоконник от пола этажа' }),
    offset: num({ min: 0.01, max: 1, default: J.windows.offset, doc: 'м: вынос квада за грань стены' }),
    lit: num({ min: 0, max: 1, default: J.windows.lit, doc: 'доля окон светящимися (ГПСЧ вывода, солёный шаг на каждый отсчёт)' }),
  }, { doc: 'включатель + переопределение ряда окон: картинку выводит JsonMap, модуль главы этих чисел не содержит; по facadeMaterial работает надстройка byMaterial' }),
  // мусор кровель и тротуаров: наличие секции включает вывод, ритмы —
  // переопределение `CONFIG.jsonMap.clutter` (картинка считается картой, как окна)
  clutter: obj({
    tall: num({ min: 3, max: 200, default: J.clutter.tall, doc: 'м: предмет выше этого считается высоким и бракуется над кровлей' }),
    head: num({ min: 1.5, max: 12, default: J.clutter.head, doc: 'м: свободный зазор над предметом, иначе он бракуется' }),
    roof: obj({
      edge: num({ min: 0.4, max: 8, default: J.clutter.roof.edge, doc: 'м: отступ предмета от борта кровли' }),
      step: num({ min: 1, max: 20, default: J.clutter.roof.step, doc: 'м: шаг сетки на кровле' }),
      keep: num({ min: 0, max: 1, default: J.clutter.roof.keep, doc: 'доля слотов, занятая мусором' }),
      perHouse: num({ min: 0, max: 12, default: J.clutter.roof.perHouse, doc: 'штук: не больше этого на дом' }),
    }, { doc: 'сетка мусора на кровле дома' }),
    street: obj({
      every: num({ min: 4, max: 60, default: J.clutter.street.every, doc: 'м: шаг вдоль настила' }),
      inset: num({ min: 0.3, max: 6, default: J.clutter.street.inset, doc: 'м: насколько предмет уйдёт с полотна к борту' }),
      minLamp: num({ min: 0, max: 12, default: J.clutter.street.minLamp, doc: 'м: не ближе этого к уже поставленному предмету или фонарю' }),
      keep: num({ min: 0, max: 1, default: J.clutter.street.keep, doc: 'доля слотов, занятая мусором' }),
    }, { doc: 'ряд мусора вдоль тротуара/настила' }),
  }, { doc: 'включатель + переопределение ряда мусора кровель и тротуаров' }),
  // неон и билборды: наличие секции включает вывод, числа — переопределение
  // `CONFIG.jsonMap.signage` (панели считает карта, как окна и мусор)
  signage: obj({
    minFloors: num({ min: 1, max: 40, default: J.signage.minFloors, doc: 'эт: дома ниже вывесок не носят' }),
    minRun: num({ min: 2, max: 40, default: J.signage.minRun, doc: 'м: минимальный бег фасадной грани' }),
    edge: num({ min: 0.2, max: 8, default: J.signage.edge, doc: 'м: отступ панели от угла фасада' }),
    step: num({ min: 2, max: 40, default: J.signage.step, doc: 'м: шаг слотов вдоль грани' }),
    width: arr(num({ min: 0.5, max: 30 }), { minItems: 2, maxItems: 2, default: J.signage.width, doc: '[min, max] м: разброс ширины панели' }),
    minWidth: num({ min: 0.5, max: 20, default: J.signage.minWidth, doc: 'м: уже этого панель — полоска, слот прочёркнут' }),
    panelFloors: num({ min: 1, max: 12, default: J.signage.panelFloors, doc: 'эт: высота панели через этажи; пояс клампится по floorsCount − floors' }),
    perFace: num({ min: 1, max: 8, default: J.signage.perFace, doc: 'штук: не больше N панелей на грань' }),
    keep: num({ min: 0, max: 1, default: J.signage.keep, doc: 'доля слотов, занятая вывесками' }),
    offset: num({ min: 0.02, max: 2, default: J.signage.offset, doc: 'м: вынос за грань стены' }),
  }, { doc: 'включатель + переопределение ряда вывесок; byMaterial — надстройка над базой, а не замена' }),
  sky: obj({
    sky: color({ default: CONFIG.sky, doc: 'цвет неба (фон сцены)' }),
    fog: obj({
      color: color({ default: CONFIG.fog.color, doc: 'цвет тумана' }),
      near: num({ min: 1, default: CONFIG.fog.near, doc: 'м: начало тумана' }),
      far: num({ min: 2, default: CONFIG.fog.far, doc: 'м: полное затемнение; правки этой пары — стиль главы, дефолта в брифе не требуется' }),
    }, { doc: 'туман; секция мержится как { ...CONFIG.fog, ...sky.fog }' }),
    sun: obj({
      color: color({ default: CONFIG.sun.color, doc: 'цвет «луны»' }),
      intensity: num({ min: 0, max: 10, default: CONFIG.sun.intensity, doc: 'яркость «луны»: единственный источник теней и яркость улицы (правило «достоинство луны, а не подсветок»)' }),
      position: arr(num({}), { minItems: 3, maxItems: 3, default: CONFIG.sun.position, doc: '[x, y, z] мир: направление «луны»' }),
    }, { doc: 'мержится как { ...CONFIG.sun, ...sky.sun }' }),
    hemi: obj({
      sky: color({ default: CONFIG.hemi.sky, doc: 'цвет верхнего полусферического света' }),
      ground: color({ default: CONFIG.hemi.ground, doc: 'цвет нижнего полусферического света' }),
      intensity: num({ min: 0, max: 10, default: CONFIG.hemi.intensity, doc: 'яркость полусферического света' }),
    }, { doc: 'мержится как { ...CONFIG.hemi, ...sky.hemi }' }),
    // пул огней, переставляемых на опорные точки рядом с камерой (src/night-lights.js)
    lights: obj({
      count: num({ min: 0, max: 8, default: CONFIG.night.count, doc: 'штук: настоящих источников в пуле; по наличию этой секции заводится NightLights, без неё глава живёт на «луне» (глава 12)' }),
      reach: num({ min: 1, default: CONFIG.night.reach, doc: 'м: радиус поиска опорных точек вокруг камеры' }),
      height: num({ min: 0, default: CONFIG.night.height, doc: 'м: подъём огня над опорной точкой' }),
      spacing: num({ min: 1, default: CONFIG.night.spacing, doc: 'м: минимальное разнос огней' }),
      intensity: num({ min: 0, max: 400, default: CONFIG.night.intensity, doc: 'яркость одного огня пула' }),
    }, { doc: 'пул src/night-lights.js переставляет count огней на map.openPositions() рядом с камерой' }),
  }, { doc: 'ночь главы как данные: слияние с дефолтами делает game.js, номеров глав карта не знает' }),
  gameplay: obj({
    goal: str({ enum: ['exit'], req: true, doc: 'цель главы; в брифах только exit (дойти до точки B), coin-главы живут в уровнях-улицах глав 5–8' }),
    spawn: V2XZ,
    exit: V2XZ,
    exitRadius: num({ min: 1, max: 40, default: CONFIG.terrain.exitRadius, doc: 'м: радиус зачётной зоны точки B' }),
    enemies: obj({ count: num({ min: 0, max: 30, doc: 'штук: человек-противники; без секции — CONFIG.enemies.count' }) }, { doc: 'число пеших противников главы' }),
    alienEnemies: obj({ count: num({ min: 0, max: 30, doc: 'штук: Чужие; без секции — CONFIG.alienEnemies.count' }) }, { doc: 'число Чужих главы' }),
    // Автомобили уровня: сколько их и где они стоят (src/vehicle.js). Точки задаёт
    // автор, а не генератор: на кольце главы 13 все настилы наклонные, а
    // `_collectAnchors` снимает наклонные из `openPositions()`, поэтому опорных
    // точек, откуда стоянка взялась бы сама, на петле нет вовсе.
    cars: obj({
      count: num({ min: 0, max: 8, req: true, doc: 'штук: обязан равняться длине spots, иначе невыполнимое обещание — ошибка схемы' }),
      spots: arr(obj({ x: num({ req: true, doc: 'м' }), z: num({ req: true, doc: 'м' }), yaw: num({ min: -360, max: 360, default: 0, doc: 'град: азимут кузова' }) },
        { doc: 'одна стоянка: центр кузова в плане и его азимут' }),
        { minItems: 0, maxItems: 8, doc: 'точки стоянок: отметку y дописывает нормализатор по опоре точки, автор её не пишет' }),
    }, { doc: 'машины главы; без секции список пуст, поэтому главы 9–12 побайтовы без неё' }),
  }, { req: true, doc: 'цель главы: точка A (spawn), точка B (exit), противники и автомобили' }),
  // описание для экспортируемой схемы: валидатор этой секции не видит
  // (`expandCity` вырезает её до `validateLevel`)
  city: CITY_SPEC_V1,
}, { doc: 'бриф главы v1 (`kind: json`): улицы и дома в осях мира, русла, свет и цель A→B. Длины и высоты — метры, углы — градусы; чего в брифе не написано, берётся из CONFIG.jsonMap' });

/**
 * Схема v2 — поворотный город (`kind: 'json2'`, глава 11). От v1 отличается ровно
 * двумя полями: обязательным переключателем `kind` и `buildings[].rotation`.
 *
 * Клон, а не второй литерал: топология у версий общая, и расхождение в списке
 * типов комнат, лимите этажей или диапазонах стен всплыло бы тогда, когда его
 * никто не ищет, — после правки одного из двух текстов.
 *
 * `rotation` — градусы вокруг центра габарита footprint, любой angle. Дом от этого
 * не перестаёт быть прямоугольным: footprint, комнаты, стены и марши лежат в его
 * собственных осях (поэтому осевая арифметика парсера к ним применяется как
 * раньше), а в мировом плане их поворачивает один угол.
 */
// Прямая пластина настила v2: центр, длина вдоль собственной оси и угол к
// северу. `y` — верх на начале оси (`u = -length/2`), `rise` — перепад до её
// конца; так пластины стыкуются цепочкой (верх конца = `y + rise` следующей), а
// «наклон» остаётся тем же одним пролётом, что и в v1, только повёрнутым.
const V2_PLATE = obj({
  x: num({ req: true, doc: 'м: мировой центр пластины' }),
  z: num({ req: true, doc: 'м: мировой центр пластины' }),
  yaw: num({ min: -360, max: 360, default: 0, doc: 'град: поворот вокруг центра; `connect: tangent` переносит только угол, позицию автор задаёт сам' }),
  length: num({ min: 1, req: true, doc: 'м: длина вдоль собственной оси (ось от −length/2 до +length/2)' }),
  width: num({ min: 2, max: 30, req: true, doc: 'м: ширина полотна поперёк оси' }),
  y: num({ req: true, doc: 'м: верх наса **на локальном начале** (u = −length/2), не в мировом minX; при yaw = −180 начало смотрит на восток' }),
  rise: num({ default: 0, doc: 'м: перепад верха от начала к концу; уклон = rise / length, предел J.maxSlope' }),
  rails: bool({ default: false, doc: 'перила по обеим кромкам; `railSide` в v2 сознательно не вводится (закрытый вопрос § 10.7 плана главы 13)' }),
}, { doc: 'прямая пластина настила v2' });

// Дуга-настил v2: кольцевой сектор с продольным подъёмом и поперечным наклоном.
// Углы — градусы (как `yaw` и `rotation`), обход от `from` к `to`; `y` — верх на
// начале и конце дуги, `bank` — крен: положительный поднимает внешний край.
// Дуга, а не цепочка пластин: касательная и кривизна у неё непрерывны, и по ней
// поедет машина; у полилинии рамка рвётся на каждом стыке.
const V2_ARC = obj({
  cx: num({ req: true, doc: 'м: мировой центр окружности дуги' }),
  cz: num({ req: true, doc: 'м: мировой центр окружности дуги' }),
  radius: num({ min: 2, req: true, doc: 'м: радиус осевой дуги; при ширине полотна 8 м радиус < 4 м даёт отрицательную внутреннюю кромку и бракуется схемой' }),
  from: num({ min: -360, max: 360, req: true, doc: 'град: начало обхода' }),
  to: num({ min: -360, max: 360, req: true, doc: 'град: конец обхода' }),
  width: num({ min: 2, max: 30, req: true, doc: 'м: ширина полотна' }),
  y: arr(num(), { minItems: 2, maxItems: 2, req: true, doc: 'м: [верх на from, верх на to]; продольный уклон — перепад / длина дуги' }),
  bank: num({ min: -30, max: 30, default: 0, doc: 'град: крен в середине сектора, ноль на обоих срезах, переход — половиной косинуса; длина перехода считается из двух пределов (остаток J.maxSlope после продольного уклона и сам продольный уклон)' }),
  rails: bool({ default: false, doc: 'перила по обеим кромкам' }),
}, { doc: 'дуга-настил v2: точная поверхность по углу, радиусу и крену' });

// Плавный рельеф v2 (`docs/level12-relief-plan.md`, п. 4.1). Холм и долина —
// одна запись: капсула в плане (`x, z` — начало, `bx, bz` — конец; без них это
// точка) с радиусом и высотой. Отрицательная высота — провал, поэтому отдельной
// секции `basins` в данных нет: две списочные формы одного и того же поля
// разошлись бы при первой правке.
const V2_HILL = obj({
  id: str({ doc: 'имя для метки и для текста ошибки предельного уклона' }),
  x: num({ req: true, doc: 'м: начало капсулы' }),
  z: num({ req: true, doc: 'м: начало капсулы' }),
  bx: num({ doc: 'м: конец капсулы; без пары к (x,z) это круг' }),
  bz: num({ doc: 'м: конец капсулы' }),
  radius: num({ min: 2, req: true, doc: 'м: радиус capsule' }),
  height: num({ min: -300, max: 300, req: true, doc: 'м: подъём над полем; отрицательное — провал (долина). Крутизна холма ограничена relief.hillMaxSlope' }),
}, { doc: 'холм-капсула поля высот' });

// Авторская площадка: терраса района, площадь, насыпь. Отметка `y` держится в
// ядре прямоугольника, а к полю переход идёт за `blend` (по умолчанию —
// `relief.blend`). Поворот — вокруг центра прямоугольника, тем же кадром, что у
// дома и пластины настила.
const V2_PAD = obj({
  id: str({ doc: 'имя для текста предупреждения о нехватке переходной зоны' }),
  minX: num({ req: true, doc: 'м: сторона ядра площадки (ось X, мировая до yaw)' }),
  maxX: num({ req: true, doc: 'м: сторона ядра площадки' }),
  minZ: num({ req: true, doc: 'м: сторона ядра площадки' }),
  maxZ: num({ req: true, doc: 'м: сторона ядра площадки' }),
  y: num({ req: true, doc: 'м: отметка ядра; смешивается с полем весом, поэтому соседние террасы обязаны не перекрываться произвольно' }),
  blend: num({ min: 1, max: 200, doc: 'м: ширина переходной зоны к полю; по умолчанию relief.blend, предел J.relief.maxBlend' }),
  yaw: num({ min: -360, max: 360, default: 0, doc: 'град: поворот вокруг центра прямоугольника' }),
}, { doc: 'площадка поля высот (терраса района, площадь, насыпь)' });

const V2_ROAD_CORRIDOR = obj({
  id: str({ doc: 'имя коридора для отладки' }),
  width: num({ min: 2, max: 60, default: 8, doc: 'м: ширина полотна дороги' }),
  shoulder: num({ min: 0, max: 20, default: 2, doc: 'м: ширина обочины с мягким уклоном' }),
  blend: num({ min: 0.5, max: 120, default: 10, doc: 'м: ширина плавного перехода от обочины к природному полю' }),
  crossLevel: bool({ default: false, doc: 'выравнивать поперёк полотна по отметке оси, сохраняя продольный профиль по рельефу' }),
  points: arr(obj({
    x: num({ req: true, doc: 'м: ось дороги' }),
    y: num({ default: 0, doc: 'м: отметка профиля дороги в точке (при crossLevel берётся отметка рельефа на оси)' }),
    z: num({ req: true, doc: 'м: ось дороги' }),
  }, { doc: 'точка оси коридора' }), { minItems: 2, req: true, doc: 'ломаная оси коридора' }),
}, { doc: 'коридор предварительного выравнивания ландшафта под дорогой (cut-and-fill)' });

const V2_RELIEF = obj({
  baseY: num({ doc: 'м: нулевая отметка поля; по умолчанию ground.y' }),
  maxSlope: num({ min: 0.01, max: 1.5, default: J.relief.maxSlope, doc: 'м/м: предел крутизны **поля** (уклон грунта). Не путать с `J.maxSlope` — пределом настила, и с `city.districts[].street.grade` — подъёмом проезжей части' }),
  hillMaxSlope: num({ min: 0.01, max: 1.5, default: J.relief.hillMaxSlope, doc: 'м/м: предел крутизны отдельного холма (1,5 · height / radius); умножение на 1,5 — аналитический максимум производной капсулы' }),
  blend: num({ min: 1, max: 200, default: J.relief.blend, doc: 'м: ширина перехода площадки к полю по умолчанию' }),
  cell: num({ min: 2, max: 60, default: J.planGrid, doc: 'м: сторона клетки индекса рельефа (цена пробы, не геометрия)' }),
  hills: arr(V2_HILL, { minItems: 1, maxItems: J.relief.maxHills, doc: 'холмы поля; лимит J.relief.maxHills' }),
  pads: arr(V2_PAD, { minItems: 1, doc: 'площадки поля' }),
  roadCorridors: arr(V2_ROAD_CORRIDOR, { minItems: 1, doc: 'коридоры выравнивания ландшафта под дорогами' }),
}, { doc: 'аналитическое поле высот: при наличии секции гасится groundPlane («пол мира — ноль» больше не опора)' });

export const LEVEL_SPEC_V2 = {
  ...LEVEL_SPEC,
  doc: 'бриф главы v2 (`kind: json2`) и открытого мира (`kind: open`): тот же формат плюс поворотные дома, пластины и дуги настилов, аналитический рельеф, косые районы, `city.track` и секция `stream`',
  fields: {
    ...LEVEL_SPEC.fields,
    kind: str({
      enum: ['json2', 'open'],
      req: true,
      doc: 'версия брифа: json2 — поворотные дома, пластины и дуги настилов, рельеф, косые районы и city.track; open — те же данные v2, но разрезанные парсером на чанки (§ 4.1 плана docs/open-world-plan.md) и собираемые `WorldMap` по мере движения, поэтому `stream` при нём обязателен. v1 бракует эти поля явно, чтобы косой бриф не собрался молча прямоугольником',
    }),
    // `stream` — переключатель разрезки (§ 4.1): наличие секции есть воля автора
    // (правило AGENTS), числа — только те, что двигают поведение движка. Маргин
    // дублирования чанков (`chunkOverlap` в tools/chunk-level.mjs) из этих чисел
    // НЕ выводится и в схему не попадает: он арифметика проходовости, а не воля
    // автора, и вторая запись разошлась бы с `bodyClearLine` при первой же правке
    stream: obj({
      chunk: num({
        min: CHUNK_MIN,
        max: CHUNK_MAX,
        req: true,
        doc: 'м: сторона квадратной клетки разрезки; обязана делить `ground.size` нацело — для малых плит (глава 2) кратность `J.relief.meshCell` (8 м) снимается, T-стык на шве несущественен и приоритет отдаётся размеру чанка, заданному автором (гейт в `cellGrid`, `tools/chunk-level.mjs`). 600 — плита существующих глав 12–13 (§ 2.1: решётка 3 303…5 581 мс); больше 600 нет смысла, потому что цена клетки растёт с её площадью',
      }),
      keep: num({
        min: 0,
        max: 4,
        req: true,
        doc: 'клеток во все стороны от клетки игрока, которые держатся загруженными: окно (2·keep+1)². Предел — память и цена первого окна (§ 2.7: 3×3 клетки по 300 м = 22 801 точка и 12,3 с худшей сборки), 4 — 81 клетка, то есть 7,3 км² загруженного мира; при 0 мир за спиной игрока исчезает, и возврат к предыдущей клетке стоит новой сборки',
      }),
      aheadMin: num({
        min: 0,
        max: 1200,
        req: true,
        doc: 'м: радиус догрузки вперёд по скорости тела на ногах; `CONFIG.speed.run` 8,5 м/с, значит 40 м — ~4,7 с хода против 0,231 с худшей достройки клетки (замер этапа 4, § 6). Больше запас не платит ничем, кроме лишних клеток в окне',
      }),
      aheadMax: num({
        min: 0,
        max: 1200,
        req: true,
        doc: 'м: тот же радиус для машины (`CONFIG.car.maxSpeed` 16 м/с); обязан быть не меньше `aheadMin` — иначе машина главы 13 въезжает в непроходимый чанк раньше, чем он достроится (§ 4.4). По замеру этапа 4 120 м — 7,5 с хода против 0,231 с достройки, и это уже без запаса: 300 м на фикстуре держали в окне лишние клетки, не уменьшая ни одного из трёх рисков (въезд в недостроенное, поп-ин, цена первого окна)',
      }),
      budgetMs: num({
        min: 1,
        max: 200,
        req: true,
        doc: 'мс: потолок одного кадра достройки. Разделимая работа (полосы решётки, фазы графа) останавливается раньше — на меньшем из этого числа и просьбы движка (`CONFIG.jsonMap.pump.frameBudgetMs`), а неразделимый атом обязан влезть в кадр один: по шести прогонам гейта этапа 4 на клетке 200 м медиана…хвост у `commit` 13,7…39,0 мс, у `picture` — 5,1…25,0 мс, и на кадры они не режутся (цена `commit` ∝ **площади загруженного окна**, § 6.4; 30 мс отсеяны именно его хвостом, и потолок 40 держит худший замер с запасом 2,5 % — это не запас по железу, а признак того, что предел стоит на хвосте `commit` и остаётся открытым решением § 10.14). Кадр 60 Гц — 16,7 мс, а худший чанк (§ 2.7) стоил 1 401 мс, поэтому достройка растягивается на кадры в любом случае: на клетке 200 м это 92…231 мс wall-clock',
      }),
    }, { doc: 'разрезка и достройка открытого мира (`kind: open`): парсер режет мир на клетки `chunk`, движок держит окно `keep` и догружает вперёд на `aheadMin`/`aheadMax`, тратя на кадр не больше `budgetMs`. Числа — воля автора; маргин дублирования чанков выводится из проходовости (tools/chunk-level.mjs), а не отсюда' }),
    relief: V2_RELIEF,
    city: CITY_SPEC_V2,
    roads: {
      ...LEVEL_SPEC.fields.roads,
      items: {
        ...LEVEL_SPEC.fields.roads.items,
        fields: {
          ...LEVEL_SPEC.fields.roads.items.fields,
          // у дороги из пластин ширина живёт в каждой пластине: полотно развязки
          // законно расширяется, и дублировать его в двух местах — значит дать
          // им разойтись при первой правке
          width: num({ min: 2, max: 30, doc: 'м: ширина полотна; при `elements` живёт в каждом элементе, здесь можно не указывать (нормализатор тогда берёт максимум пластин)' }),
          points: arr(V3XYZ, { minItems: 2, doc: 'м: осевая polyline; в v2 альтернатива `elements`, оба сразу — ошибка' }),
          // `connect:'tangent'` — маркер, а не форма: следующий элемент обязан
          // быть пластиной, чей `yaw` даст касательная предыдущего
          elements: arr(obj({ plate: V2_PLATE, arc: V2_ARC, connect: str({ enum: ['tangent'], doc: 'маркер: следующему элементу переносится только угол (касательная предыдущего), позицию автор задаёт сам' }) },
            { doc: 'один элемент цепочки: пластина ИЛИ дуга (или маркер касательной) — ровно одна форма на запись' }), { minItems: 1, doc: 'цепочка пластин и дуг вместо polyline: полотно развязки, мост, подъём съезда' }),
          // служебные поля улиц генератора (v2): по первому нормализатор
          // отличает настил квартала от авторской дороги, по второму берёт
          // предел уклона района, третье помечает перекрёсток — пластину,
          // обрезаемую прогонами с четырёх сторон. В модуль главы не доезжают
          district: str({ doc: 'id района-владельца (служебное поле генератора): по нему нормализатор отличает настил квартала от авторской дороги; в модуль не доезжает' }),
          grade: num({ min: 0, max: J.maxSlope, doc: 'м/м: предел уклона района для этой улицы; разрез и подгонка пластин по профилю поля (`profileDistrictStreets`) считаются от него' }),
          crossing: bool({ default: false, doc: 'true — перекрёсток: одна квадратная пластина с id `<район>_x<i>_<j>`, к плоскости которой пинятся торцы прогонов' }),
          // служебные поля трассы (`city.track`): петля и съезд различаются по
          // первому, второй держит id секции — по ним метка `debugIds` подписывает
          // шов и носы, а сюита считает крылья. В модуль главы не доезжают
          trackRole: str({ enum: ['ring', 'entry'], doc: 'роль настила трассы: петля или съезд; нужна debugIds и сюите, в модуль не доезжает' }),
          trackId: str({ doc: 'id секции city.track, чей это настил; в модуль не доезжает' }),
          filletRadius: num({ min: 0, doc: 'м: радиус автоматического скругления поворотов path-дороги (филет дугой). 0/отсутствие — без скругления; обрабатывается нормализатором.' }),
          fillet: num({ min: 0, doc: 'м: то же, что filletRadius (псевдоним).' }),
        },
      },
    },
    buildings: {
      ...LEVEL_SPEC.fields.buildings,
      items: {
        ...LEVEL_SPEC.fields.buildings.items,
        fields: {
          ...LEVEL_SPEC.fields.buildings.items.fields,
          rotation: num({ min: -360, max: 360, default: 0, doc: 'град: поворот дома вокруг центра габарита footprint; весь внутренний расчёт идёт в своих осях, в мире корпус держит OBB (габарит в коллизиях запретил бы невидимые стены по пустым углам)' }),
          // кадр косого района — служебное поле генератора рядом с `district`: по
          // нему нормализатор собирает террасу квартала в **осях района** (в
          // мировых координатах габарит повёрнутого блока больше самого блока).
          // В модуль главы не доезжает, как и `district`
          districtFrame: obj({
            cx: num({ req: true, doc: 'м: центр поворота района' }),
            cz: num({ req: true, doc: 'м: центр поворота района' }),
            yaw: num({ min: -180, max: 180, req: true, doc: 'град: yaw района; терраса квартала собирается в осях района, а не мира' }),
          }, { doc: 'кадр косого района (служебное поле генератора): в модуль не доезжает' }),
        },
      },
    },
    // Туннель — движок-конкретная сущность брифа v2, а не свойство дороги: прямой
    // коридор через рельеф/город, пол которого — обычный настил, стены и потолок —
    // призмы/солиды (правило «твёрдость обязана совпадать с картинкой»). Прямой
    // коридор задаётся двумя порталами {x,y,z} на отметке пола и шириной/высотой
    // коридора. В модуль главы туннель не доезжает: он живёт в дорогах (пол) и в
    // новых коллекциях физики, поэтому секция добавлена в v2 наряду с relief и
    // `stream` — v1-бриф без туннелей обязан собраться побайтово как раньше.
    tunnels: arr(obj({
      id: str({ req: true, doc: 'уникальный id туннеля' }),
      points: arr(obj({
        x: num({ req: true, doc: 'м: мировая координата X портала' }),
        y: num({ req: true, doc: 'м: отметка пола коридора на портале' }),
        z: num({ req: true, doc: 'м: мировая координата Z портала' }),
      }, { doc: 'портал коридора: отметка пола на его торце' }), { minItems: 2, maxItems: 2, req: true, doc: 'м: порталы коридора (открытый и закрытый конец) — прямой коридор' }),
      width: num({ min: 2, max: 30, req: true, doc: 'м: ширина коридора' }),
      height: num({ min: 0.5, max: 60, req: true, doc: 'м: высота коридора над полом' }),
      lamps: bool({ default: false, doc: 'ставить ли автогенерированные фонари внутри коридора' }),
    }, { doc: 'прямой туннель: коридор между двумя порталами, пол — настил, стены и потолок — призмы' }), { doc: 'прямые туннели: коридор между двумя порталами, пол — настил, стены/потолок — призмы' }),
  },
};

// ------------------------------------------------------------- CityForge v3 (`kind: 'cityforge'`)

// v3 is a new source format: the city is described by CityForge entities from
// docs/world-format.md, not by the flat v2 lists (roads / buildings / relief /
// city). All reusable definitions live in `level-common.schema.json`; the root
// file only wires them together. Descriptions are English and kept only where
// the field name alone does not explain the meaning or the constraint.

// --- shared primitives -----------------------------------------------------

const CF_COLOR = color({});
const V3_XZ = obj({ x: num({ req: true }), z: num({ req: true }) });
const CF_POINT2 = arr(num({}), { minItems: 2, maxItems: 2 });
const CF_POINT3 = arr(num({}), { minItems: 3, maxItems: 3 });
const CF_POINT4 = arr(num({}), { minItems: 4, maxItems: 4 });
const CF_RING = arr(ref('point2'), { minItems: 3 });
const CF_AREA = obj({
  type: str({ enum: ['polygon'], req: true }),
  rings: arr(ref('ring'), { minItems: 1, req: true }),
});
const CF_PARAMETERS = obj({}, {
  open: true,
  doc: 'Descriptors keyed by parameter name: type, min, max, values, default.',
});
const CF_OPEN = obj({}, { open: true });
// суффикс _N — многоярусный стек (§4.1 world-format: bridge_01, bridge_02)
const CF_LAYER_PATTERN = '^(ground|embankment|bridge|skybridge|underground)(_[0-9]+)?$';

const CF_SOCKET = obj({
  id: str({ req: true }),
  position: ref('point3'),
  rotation: ref('point4'),
});

// --- chapter envelope ------------------------------------------------------

const V3_METADATA = obj({
  levelName: str({ req: true, doc: 'Pipeline name; selects the generated module name.' }),
  name: str({ req: true }),
  hint: str({ req: true }),
  engine: str({}),
  units: str({ enum: ['meters'], req: true, doc: 'All lengths are meters and angles are degrees.' }),
  notes: str({ doc: 'Free-form rationale; the engine does not read it.' }),
}, { doc: 'Chapter header; only name and hint reach the engine.' });

const V3_GROUND = obj({
  y: num({ default: 0 }),
  size: num({ min: 20, req: true, doc: 'Ground plate side in meters; outside the plate the world is blocked.' }),
  color: ref('color'),
}, { doc: 'Flat ground plate; CityForge terrain modifiers sit on top of it.' });

const V3_GAMEPLAY = obj({
  goal: str({ enum: ['exit'], req: true, doc: 'CityForge briefs use A-to-B (exit) goals.' }),
  spawn: ref('vec2', { req: true }),
  exit: ref('vec2', { req: true }),
  exitRadius: num({ min: 1, max: 40, default: 3.5 }),
  enemies: obj({ count: num({ min: 0, max: 30 }) }),
  alienEnemies: obj({ count: num({ min: 0, max: 30 }) }),
  cars: obj({
    count: num({ min: 0, max: 8, req: true, doc: 'Must equal spots length.' }),
    spots: arr(obj({
      x: num({ req: true }),
      z: num({ req: true }),
      yaw: num({ min: -360, max: 360, default: 0 }),
    }), { maxItems: 8 }),
  }),
}, { doc: 'Objective, spawn, enemies and parked cars for the chapter.' });

const V3_STREAM = obj({
  chunk: num({ min: CHUNK_MIN, max: CHUNK_MAX, req: true, doc: 'Cell side in meters; must divide ground.size.' }),
  keep: num({ min: 0, max: 4, req: true, doc: 'Loaded cells around the player: window (2*keep + 1)^2.' }),
  aheadMin: num({ min: 0, max: 1200, req: true, doc: 'Look-ahead radius on foot, in meters.' }),
  aheadMax: num({ min: 0, max: 1200, req: true, doc: 'Look-ahead radius for vehicles; must be >= aheadMin.' }),
  budgetMs: num({ min: 1, max: 200, req: true, doc: 'Per-frame build budget in milliseconds.' }),
}, { doc: 'Open-world streaming window; omit for a single-cell world.' });

// --- CityForge entities ----------------------------------------------------

const CF_WORLD = obj({
  units: str({ enum: ['meters'], req: true }),
  coordinateSystem: obj({
    type: str({ enum: ['local'], req: true }),
    handedness: str({ enum: ['right'], req: true }),
    up: str({ enum: ['Z'], req: true }),
  }, { req: true }),
  origin: ref('point3'),
  bounds: obj({ min: ref('point3'), max: ref('point3') }, { req: true }),
}, { req: true, doc: 'Local right-handed meter space, Z up.' });

const CF_GENERATION = obj({
  seed: num({ req: true, doc: 'Deterministic seed; local seeds derive from it and entity ids.' }),
  generatorVersion: str({ req: true, doc: 'Part of the seed: bumping it resets the generated layout.' }),
  deterministic: bool({ default: true }),
});

const CF_ASSET = obj({
  id: str({ req: true }),
  kind: str({
    enum: ['procedural', 'prefab', 'composite'],
    req: true,
    doc: 'procedural builds geometry, prefab references a GLB, composite assembles children.',
  }),
  generator: str({}),
  geometry: obj({
    source: str({ req: true, doc: 'GLB path or procedural source id.' }),
  }, {}),
  parameters: ref('parameters'),
  bounds: ref('point3'),
  children: arr(str({}), { minItems: 1 }),
  sockets: arr(ref('socket'), { minItems: 0 }),
}, { doc: 'Asset Library template.' });

const CF_PALETTE_ENTRY = obj({
  template: str({ req: true }),
  weight: num({ min: 0 }),
  parameterRanges: CF_OPEN,
});

const CF_DISTRICT = obj({
  id: str({ req: true }),
  type: str({ enum: ['residential', 'industrial', 'commercial', 'park', 'downtown'], req: true }),
  area: ref('area', { req: true }),
  style: str({}),
  rules: obj({
    buildingDensity: num({ min: 0, max: 1 }),
    heightRange: arr(num({ min: 1 }), { minItems: 2, maxItems: 2 }),
    maxFootprintRatio: num({ min: 0, max: 1 }),
    setback: num({ min: 0 }),
    buildingPalette: arr(CF_PALETTE_ENTRY, { minItems: 1 }),
    vegetation: obj({
      density: num({ min: 0, max: 1 }),
      palette: arr(str({}), { minItems: 1 }),
    }),
    roadStyle: obj({
      type: str({ enum: ['local', 'collector', 'arterial', 'highway'] }),
      speedLimit: num({ min: 0 }),
    }),
  }),
}, { doc: 'District extent plus generation rules and style.' });

const CF_BLOCK = obj({
  id: str({ req: true }),
  districtRef: str({ req: true }),
  area: ref('area', { req: true }),
  parcels: arr(str({}), { minItems: 0 }),
});

const CF_PARCEL = obj({
  id: str({ req: true }),
  blockRef: str({ req: true }),
  area: ref('area', { req: true }),
  buildable: bool({ default: true }),
  buildingRules: obj({ maxFloors: num({ min: 1 }) }),
});

const CF_TERRAIN_MODIFIER = obj({
  id: str({ req: true }),
  type: str({ enum: ['mountain', 'valley', 'terrain_modifier'], req: true }),
  center: ref('point2'),
  radius: num({ min: 2 }),
  height: num({ min: -300, max: 300 }),
  falloff: str({ enum: ['smooth', 'linear', 'step'] }),
  path: arr(ref('point2'), { minItems: 2 }),
  width: num({ min: 2 }),
  depth: num({ min: 0 }),
  operation: str({ enum: ['add', 'subtract', 'replace'] }),
  sourceRef: str({}),
  parameters: CF_OPEN,
}, { doc: 'Applied in array order after the base heightfield.' });

const CF_TERRAIN = obj({
  base: obj({
    type: str({ enum: ['heightfield'] }),
    source: str({ req: true }),
    resolution: num({ min: 1 }),
  }, { req: true }),
  modifiers: arr(ref('terrainModifier'), { minItems: 1 }),
}, { doc: 'Base heightfield plus sequential modifiers.' });

const CF_WATERWAY = obj({
  id: str({ req: true }),
  path: arr(ref('point3'), { minItems: 2, req: true }),
  width: num({ min: 2, max: 120, req: true }),
  widthProfile: arr(arr(num({}), { minItems: 2, maxItems: 2 }), { minItems: 2, doc: '[t, width]: riverbed width at normalized distance t along path.' }),
  depth: num({ min: 0, req: true }),
  flow: str({ enum: ['start_to_end', 'end_to_start', 'cyclic'] }),
  carveTerrain: bool({ default: false, doc: 'Carve the riverbed into the terrain.' }),
});

const CF_LAKE = obj({
  id: str({ req: true }),
  area: ref('area', { req: true }),
  waterLevel: num({}),
});

const CF_HYDROLOGY = obj({
  rivers: arr(ref('waterway'), { minItems: 0 }),
  lakes: arr(ref('lake'), { minItems: 0 }),
});

const CF_CAVE = obj({
  id: str({ req: true }),
  chambers: arr(obj({
    id: str({ req: true }),
    center: ref('point3'),
    radius: ref('point3'),
  }), { minItems: 1 }),
  passages: arr(obj({
    id: str({ req: true }),
    from: str({ req: true }),
    to: str({ req: true }),
    path: arr(ref('point3'), { minItems: 2 }),
    radius: num({ min: 0 }),
  }), { minItems: 0 }),
  entrances: arr(obj({
    id: str({ req: true }),
    chamberRef: str({ req: true }),
    surfacePosition: ref('point3'),
    openingRadius: num({ min: 0 }),
  }), { minItems: 0 }),
}, { doc: 'Chambers, passages and surface entrances of one cave system.' });

const CF_CAVES = obj({
  systems: arr(ref('cave'), { minItems: 1 }),
}, { doc: 'Collection of cave systems.' });

const CF_NODE = obj({
  id: str({ req: true }),
  position: ref('point3', { req: true }),
  layer: str({
    pattern: CF_LAYER_PATTERN,
    doc: 'Logical topology label; physical height comes from position.z. Multi-tier stacks append _N (bridge_01).',
  }),
});

const CF_LANE = obj({
  id: str({ req: true }),
  direction: str({ enum: ['forward', 'backward'], req: true }),
  width: num({ min: 0 }),
  type: str({ enum: ['vehicle', 'bus', 'tram', 'bike', 'pedestrian', 'rail'] }),
});

const CF_SEGMENT = obj({
  id: str({ req: true }),
  from: str({ req: true }),
  to: str({ req: true }),
  type: str({ enum: ['local', 'collector', 'arterial', 'highway', 'ramp', 'merge', 'split', 'connector'] }),
  layer: str({ pattern: CF_LAYER_PATTERN, doc: 'Logical topology label; the _N suffix marks a stacked tier.' }),
  path: arr(ref('point3'), { minItems: 2 }),
  // v2 arc/plate chain for smooth turns (like chapter 13 track); alternative to axis-aligned path.
  elements: arr(obj({
    plate: V2_PLATE,
    arc: V2_ARC,
    connect: str({ enum: ['tangent'] }),
  })),
  lanes: arr(ref('lane'), { minItems: 0 }),
  shoulderWidth: num({ min: 0 }),
  sidewalk: bool({ default: false }),
  surface: str({ enum: ['asphalt', 'gravel', 'earth'] }),
  speedLimit: num({ min: 0 }),
});

const CF_JUNCTION = obj({
  id: str({ req: true }),
  connections: arr(obj({
    from: obj({
      segment: str({ req: true }),
      lane: str({ req: true }),
      end: str({ enum: ['to', 'from'], req: true }),
    }),
    to: obj({
      segment: str({ req: true }),
      lane: str({ req: true }),
      end: str({ enum: ['to', 'from'], req: true }),
    }),
    movement: str({ enum: ['straight', 'left', 'right', 'uturn'], req: true }),
  }), { minItems: 1 }),
  type: str({ enum: ['signalized', 'roundabout', 'uncontrolled'] }),
}, { doc: 'Allowed lane-to-lane movements through a junction.' });

const CF_NETWORK = obj({
  nodes: arr(ref('node'), { minItems: 0 }),
  segments: arr(ref('segment'), { minItems: 0 }),
  junctions: arr(ref('junction'), { minItems: 0 }),
});

const CF_NETWORKS = obj({
  roads: ref('network'),
  railways: ref('network'),
  paths: ref('network'),
});

const CF_DECK = obj({
  id: str({ req: true }),
  roadRefs: arr(str({}), { minItems: 1 }),
  clearance: num({ min: 0 }),
});

const CF_BRIDGE = obj({
  id: str({ req: true }),
  type: str({ enum: ['bridge', 'embankment', 'skybridge'], req: true }),
  template: str({ req: true }),
  decks: arr(ref('deck'), { minItems: 1 }),
  supportPoints: arr(ref('point3'), { minItems: 1 }),
  parameters: obj({
    pierSpacing: num({ min: 0 }),
    railings: bool({ default: false }),
    supports: str({ enum: ['auto', 'manual'] }),
  }),
}, { doc: 'Deck geometry and supports; the road itself stays in networks.' });

const CF_TUNNEL = obj({
  id: str({ req: true }),
  type: str({ enum: ['tunnel'] }),
  template: str({ req: true }),
  roadRefs: arr(str({}), { minItems: 1 }),
  portals: arr(obj({
    id: str({ req: true }),
    position: ref('point3'),
    networkRef: str({}),
    roadRef: str({}),
    layer: str({ pattern: CF_LAYER_PATTERN, doc: 'Logical topology label; the _N suffix marks a stacked tier.' }),
    tangent: ref('point3'),
  }), { minItems: 2 }),
  parameters: obj({
    lining: str({ enum: ['concrete', 'rock', 'plastic'] }),
    lighting: bool({ default: false }),
  }),
}, { doc: 'Portals and lining; the road itself stays in networks.' });

const CF_STRUCTURES = obj({
  bridges: arr(ref('bridge'), { minItems: 0 }),
  tunnels: arr(ref('tunnel'), { minItems: 0 }),
});

const CF_INSTANCE = obj({
  id: str({ req: true }),
  template: str({ req: true }),
  transform: obj({
    position: ref('point3', { req: true }),
    rotation: ref('point4'),
    scale: ref('point3'),
  }, { req: true }),
  overrides: CF_OPEN,
  districtRef: str({}),
  parcelRef: str({}),
  homeChunk: str({ doc: 'The chunk that owns this instance; only it stores the full record.' }),
  coverageChunks: arr(str({}), { minItems: 1, doc: 'Chunks whose area the instance overlaps; loading any of them keeps the instance alive.' }),
  generation: obj({
    source: str({ enum: ['procedural', 'prefab', 'hybrid'] }),
    seed: num({}),
    generator: str({}),
    generatorVersion: str({}),
  }, { doc: 'Provenance of a generated instance.' }),
  locked: bool({ default: false, doc: 'Keep this instance as-is on regeneration.' }),
  gameplay: obj({
    interactable: bool({ default: false }),
    collision: bool({ default: true }),
  }, { doc: 'Separates appearance from interaction and collision.' }),
  properties: CF_OPEN,
  bounds: obj({ min: ref('point3'), max: ref('point3') }),
}, { doc: 'Placed template with transform and per-instance overrides.' });

const CF_CHUNK = obj({
  id: str({ req: true }),
  bounds: obj({ min: ref('point3'), max: ref('point3') }, { req: true }),
  file: str({ req: true }),
}, { doc: 'Spatial storage unit of the city.' });

const CF_CHUNK_ENTRY = obj({
  id: str({ req: true }),
  bounds: obj({ min: ref('point3'), max: ref('point3') }, { req: true }),
  neighbors: arr(str({}), { minItems: 0 }),
  files: obj({
    terrain: str({}),
    roads: str({}),
    water: str({}),
    instances: str({}),
    collision: str({}),
  }),
  entities: arr(str({}), { minItems: 0 }),
  fragments: arr(str({}), { minItems: 0 }),
  portals: arr(str({}), { minItems: 0 }),
  dependencies: arr(str({}), { minItems: 0 }),
});

const CF_CHUNK_INDEX = obj({
  version: str({ req: true }),
  chunks: arr(ref('chunkEntry'), { minItems: 1 }),
}, { doc: 'Manifest of chunk files for partial loading; the runtime streaming window lives in stream.' });

const CF_CITYFORGE = obj({
  format: str({ enum: ['cityforge'], req: true }),
  version: str({ req: true }),
  world: ref('world', { req: true }),
  generation: ref('generation'),
  assets: arr(ref('asset'), { minItems: 1 }),
  districts: arr(ref('district'), { minItems: 0 }),
  blocks: arr(ref('block'), { minItems: 0 }),
  parcels: arr(ref('parcel'), { minItems: 0 }),
  terrain: ref('terrain'),
  hydrology: ref('hydrology'),
  caves: ref('caves'),
  networks: ref('networks'),
  structures: ref('structures'),
  instances: arr(ref('instance'), { minItems: 0 }),
  chunks: arr(ref('chunk'), { minItems: 0 }),
  chunkIndex: ref('chunkIndex'),
  extensions: CF_OPEN,
}, { doc: 'CityForge source city from docs/world-format.md.' });

const COMMON_V3_DEFS = {
  color: CF_COLOR,
  vec2: V3_XZ,
  point2: CF_POINT2,
  point3: CF_POINT3,
  point4: CF_POINT4,
  ring: CF_RING,
  area: CF_AREA,
  parameters: CF_PARAMETERS,
  socket: CF_SOCKET,
  metadata: V3_METADATA,
  ground: V3_GROUND,
  gameplay: V3_GAMEPLAY,
  stream: V3_STREAM,
  world: CF_WORLD,
  generation: CF_GENERATION,
  asset: CF_ASSET,
  district: CF_DISTRICT,
  block: CF_BLOCK,
  parcel: CF_PARCEL,
  terrainModifier: CF_TERRAIN_MODIFIER,
  terrain: CF_TERRAIN,
  waterway: CF_WATERWAY,
  lake: CF_LAKE,
  hydrology: CF_HYDROLOGY,
  cave: CF_CAVE,
  caves: CF_CAVES,
  node: CF_NODE,
  lane: CF_LANE,
  segment: CF_SEGMENT,
  junction: CF_JUNCTION,
  network: CF_NETWORK,
  networks: CF_NETWORKS,
  deck: CF_DECK,
  bridge: CF_BRIDGE,
  tunnel: CF_TUNNEL,
  structures: CF_STRUCTURES,
  instance: CF_INSTANCE,
  chunk: CF_CHUNK,
  chunkEntry: CF_CHUNK_ENTRY,
  chunkIndex: CF_CHUNK_INDEX,
  cityforge: CF_CITYFORGE,
};

/** Reusable definitions for `level-common.schema.json`. */
export const LEVEL_COMMON_V3 = { definitions: COMMON_V3_DEFS };

/** Root of `level-v3.schema.json`; every section is a `$ref` into the common file. */
export const LEVEL_SPEC_V3 = obj({
  $schema: str({ doc: 'Path to this brief schema: ./level-v3.schema.json.' }),
  kind: str({
    enum: ['cityforge'],
    req: true,
    doc: 'CityForge source brief; entities are compiled into the level module.',
  }),
  metadata: ref('metadata', { req: true }),
  ground: ref('ground', { req: true }),
  gameplay: ref('gameplay', { req: true }),
  stream: ref('stream'),
  cityforge: ref('cityforge', { req: true }),
  // Движковые дома в формате v2, пропускаемые компилятором в engine.buildings
  // (до полноценной компиляции instances). Валидация структуры — нормализатором.
  buildings: LEVEL_SPEC_V2.fields.buildings,
}, { doc: 'CityForge source level from docs/world-format.md.' });

// ------------------------------------------------------------- CityForge v4 (district generator manifest, ADR-001)

const V4_OPEN = obj({}, { open: true });

const V4_DISTRICT = obj({
  id: str({ req: true }),
  type: str({}),
  profileId: str({}),
  geometry: V4_OPEN,
  mask: V4_OPEN,
  cells: arr(V4_OPEN, { minItems: 0 }),
  priority: num({}),
  overrides: V4_OPEN,
  fallbackChain: arr(str({}), { minItems: 0 }),
}, { open: true, doc: 'District declaration for generator stages/layer 3 (geometry|mask|cells as applicable).' });

const V4_GENERATOR = obj({
  generatorVersion: str({ req: true }),
  seed: num({ req: true }),
  deterministic: bool({ default: true }),
  stages: arr(obj({ id: str({}), enabled: bool({}) }, { open: true }), { minItems: 0, maxItems: 7 }),
  layers: arr(V4_OPEN, { minItems: 0, maxItems: 7 }),
  budgets: V4_OPEN,
  districts: arr(V4_DISTRICT, { minItems: 0 }),
  profiles: V4_OPEN,
  catalogs: V4_OPEN,
  refs: V4_OPEN,
  policies: V4_OPEN,
}, { open: true, doc: 'v4 city generator manifest (IR/stages/districts/policies). Details refined in TASK-002+; open for forward-compatible fields.' });

/** Root of `level-v4.schema.json`; reuses v3 common definitions plus v4 generator manifest. */
export const LEVEL_SPEC_V4 = obj({
  $schema: str({ doc: 'Path to this brief schema: ./level-v4.schema.json.' }),
  kind: str({
    enum: ['cityforge'],
    req: true,
    doc: 'CityForge v4 source brief with district generator manifest.',
  }),
  schemaVersion: num({ enum: [4], req: true, doc: 'Format version: v4 (district-aware generator).' }),
  metadata: ref('metadata', { req: true }),
  ground: ref('ground', { req: true }),
  gameplay: ref('gameplay', { req: true }),
  stream: ref('stream'),
  windows: LEVEL_SPEC_V2.fields.windows,
  sky: LEVEL_SPEC_V2.fields.sky,
  // Optional hooks for future behavior/assets; static in MVP (ADR-001).
  properties: V4_OPEN,
  buildings: LEVEL_SPEC_V2.fields.buildings,
  cityforge: ref('cityforge', { req: true }),
  generator: V4_GENERATOR,
}, { open: false, doc: 'CityForge v4 source level with district generator manifest (ADR-001).' });

// ------------------------------------------------------------- обход схемы

function typeOf(v) {
  if (Array.isArray(v)) return 'array';
  if (v === null) return 'null';
  return typeof v;
}

function checkValue(value, spec, path, errors) {
  switch (spec.kind) {
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        errors.push(`${path}: ожидалось число, получено ${JSON.stringify(value)}`);
        return;
      }
      if (spec.min !== undefined && value < spec.min) errors.push(`${path}: ${value} меньше минимума ${spec.min}`);
      if (spec.max !== undefined && value > spec.max) errors.push(`${path}: ${value} больше максимума ${spec.max}`);
      return;
    case 'string':
      if (typeof value !== 'string') { errors.push(`${path}: ожидалась строка`); return; }
      if (spec.enum && !spec.enum.includes(value)) {
        errors.push(`${path}: '${value}' вне перечисления ${spec.enum.join('|')}`);
      }
      if (spec.pattern && !new RegExp(spec.pattern).test(value)) {
        errors.push(`${path}: '${value}' не соответствует шаблону ${spec.pattern}`);
      }
      return;
    case 'boolean':
      if (typeof value !== 'boolean') errors.push(`${path}: ожидалось true|false`);
      return;
    case 'color':
      if (typeof value === 'number') return;
      if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        errors.push(`${path}: цвет — число 0x… или строка '#rrggbb'`);
      }
      return;
    case 'array': {
      if (!Array.isArray(value)) { errors.push(`${path}: ожидался массив`); return; }
      if (spec.minItems !== undefined && value.length < spec.minItems) {
        errors.push(`${path}: элементов меньше ${spec.minItems}`);
      }
      if (spec.maxItems !== undefined && value.length > spec.maxItems) {
        errors.push(`${path}: элементов больше ${spec.maxItems}`);
      }
      value.forEach((v, i) => checkValue(v, spec.items, `${path}[${i}]`, errors));
      return;
    }
    case 'ref': {
      const target = COMMON_V3_DEFS[spec.name];
      if (!target) { errors.push(`${path}: $ref '${spec.name}' не найден`); return; }
      checkValue(value, target, path, errors);
      return;
    }
    case 'object': {
      if (typeOf(value) !== 'object') { errors.push(`${path}: ожидался объект`); return; }
      for (const [key, sub] of Object.entries(spec.fields)) {
        if (value[key] === undefined) {
          if (sub.req) errors.push(`${path}.${key}: обязательное поле отсутствует`);
          continue;
        }
        checkValue(value[key], sub, `${path}.${key}`, errors);
      }
      if (!spec.open) {
        for (const key of Object.keys(value)) {
          if (!(key in spec.fields)) errors.push(`${path}.${key}: поле не описано в схеме`);
        }
      }
      return;
    }
    default:
      errors.push(`${path}: спецификация сломана (kind=${spec.kind})`);
  }
}

/** Проверка структуры: только типы, обязательность, enum и диапазоны. */
export function validateSpec(raw, spec = LEVEL_SPEC_V2) {
  const errors = [];
  checkValue(raw, spec, '', errors);
  return errors;
}

// ------------------------------------------------------------- разрезка (stream)

/**
 * Правила секции `stream` — то, что видно только по нескольким её полям сразу.
 * Здесь уместна ошибка, а не предупреждение: `kind: 'open'` без `stream` парсер
 * резал бы молча (клетки по умолчанию нет), а `chunk`, не делящий плиту, дал бы
 * клетки разного размера — и `keep` означал бы разный запас времени достройки в
 * разных концах мира.
 */
function streamErrors(raw, spec) {
  const errors = [];
  const stream = raw.stream;
  // `stream` описан только в v2-спецификации: для v1 его присутствие — та же
  // история, что `relief` и `yaw`, только с последствиями в двух модулях
  const v2 = !!(spec && spec.fields && spec.fields.stream);
  if (stream && !v2) {
    errors.push('stream: поле v2 («kind: \'json2\'» или «\'open\'»), а глава «kind: \'' + (raw.kind ?? 'json') + '\'»: '
      + 'схема v1 разрезку не принимает, потому что косой бриф собрался бы осевым прямоугольником');
    return errors;
  }
  if (raw.kind === 'open' && !stream) {
    errors.push("stream: `kind: 'open'` без секции — парсеру нечем резать мир; задайте `stream.chunk` и `stream.keep`");
  }
  if (raw.kind === 'json2' && stream) {
    errors.push('stream: секция есть, а `kind: \'json2\'` — `JsonMap` собрал бы весь мир целиком и не посмотрел бы на чанки; для разрезки нужен `kind: \'open\'`');
  }
  if (!stream) return errors;
  const size = raw.ground?.size ?? 176;
  try {
    // деление клетки проверяет тот же код, что её строит: подсказка с делителями
    // и формулировка ошибки не разъедутся с разрезкой при первой правке
    cellGrid(size, stream.chunk);
  } catch (e) {
    errors.push(String(e.message ?? e));
  }
  if (stream.aheadMax < stream.aheadMin) {
    errors.push(`stream.aheadMax ${stream.aheadMax} меньше aheadMin ${stream.aheadMin}: упреждение на машине не обязано быть короче пешего, иначе машина въезжает в незастроенный чанк (§ 4.4)`);
  }
  return errors;
}

// ------------------------------------------------------------- проверка геометрии

/**
 * Второй проход — то, что видно только по всей картине: комнаты внутри
 * footprint, пересечения комнат, лестницы в комнатах, осевые рёбра дорог,
 * уклоны, опоры под настилом, лимит огней.
 * @param {object} raw бриф уровня
 * @param {object} spec схема (по умолчанию `LEVEL_SPEC_V2` — open/v2; для
 *   CityForge передаётся `LEVEL_SPEC_V3`/`LEVEL_SPEC_V4`) — структуру и
 *   геометрию обязан проверять один и тот же набор правил.
 * @returns {{errors:string[], warnings:string[]}}
 */
export function validateLevel(raw, spec = LEVEL_SPEC_V2) {
  const errors = validateSpec(raw, spec);
  const warnings = [];
  if (errors.length) return { errors, warnings, geometryOnly: false };

  // Разрезка — поле с последствиями в двух других модулях (парсер режет клетки,
  // движок держит окно), поэтому проверяется отдельным проходом: структурный
  // обход видит только типы и диапазоны, а «`chunk` делит плиту нацело» и
  // «`aheadMax` не меньше `aheadMin`» — свойства сразу двух чисел.
  errors.push(...streamErrors(raw, spec));
  if (errors.length) return { errors, warnings, geometryOnly: false };

  const size = raw.ground?.size ?? 176;
  const half = size / 2;
  const groundY = raw.ground?.y ?? 0;
  const cell = J.probeCell;
  // Поле местности для отметки грунта ПОД ТОЧКОЙ: правила вроде «нос подъёма
  // опознаётся по земле под ним, а не по нулю пола мира» берут его со всеми
  // авторскими площадками (терраса района — тот же грунт). Проба предельного
  // уклона ниже строит своё поле по одним холмам: у неё другой смысл, см.
  // комментарий там. Генератор кварталов (`bridgeNoses` в tools/city.js) меряет
  // пятку по этому же полю, иначе схема и разворот разъехались бы на первом же
  // брифе с рельефом.
  const reliefField = raw.relief
    ? reliefOf({ ...raw.relief, baseY: raw.relief.baseY ?? groundY })
    : null;

  // --- рельеф: крутизна поля и разумность площадок ---
  // Поле проверяется аналитикой, а не пробой сетки: у холма максимум производной
  // известен на бумаге (`1,5 · height / radius` на половине радиуса — замер в
  // `tools/relief.test.mjs`), и автор обязан получить число в тексте ошибки, а не
  // «где-то круто» после растеризации 600 × 600 м.
  if (raw.relief) {
    const r = raw.relief;
    const maxSlope = r.maxSlope ?? J.relief.maxSlope;
    // Предел ОДНОЙ капсулы — свой, `hillMaxSlope`: площадка плоская, а переход к
    // ней даёт 1,5 · |Δ| / blend поверх собственного склона холма, поэтому поле
    // сойдётся в `maxSlope` только если капсула заведомо пологое предела поля
    const hillMax = r.hillMaxSlope ?? J.relief.hillMaxSlope;
    if ((r.baseY ?? 0) !== groundY) {
      warnings.push(`relief.baseY ${r.baseY ?? 0} не совпал с ground.y ${groundY}: опорным верхом главы станет baseY`);
    }
    for (const [n, h] of (r.hills ?? []).entries()) {
      const label = `relief.hills[${n}] (${h.id ?? 'без id'})`;
      if ((h.bx === undefined) !== (h.bz === undefined)) {
        errors.push(`${label}: у капсулы задан только один конец (bx/bz) — второй парсер взял бы как центр холма`);
      }
      const peak = 1.5 * Math.abs(h.height) / h.radius;
      if (peak > hillMax + 1e-9) {
        errors.push(`${label}: склон круче предела холма — максимум ${peak.toFixed(3)} м/м (1,5 · ${Math.abs(h.height)} / ${h.radius}) `
          + `при допустимых ${hillMax}; радиус обязан быть не меньше ${(1.5 * Math.abs(h.height) / hillMax).toFixed(0)} м `
          + 'или высота меньше');
      }
    }
    // Суммарный склон поля — пробой по сетке, а не только аналитика каждой
    // капсулы: два соседних холма складываются, и предел одной (`1,5 · h / r`)
    // не видит, что их фланги дают вместе круче. Зона пробы — габарит холмов с
    // их радиусами, обрезанный по земле: вне его поле константно и проверять нечего.
    if ((r.hills ?? []).length) {
      // Предел уклона меряется по ХОЛМАМ, а не по собранному полю с площадками:
      // парсер раздувает кольцо blend каждой площадки подгонкой (`fitPadBlend`),
      // и статический проба по финальному полю брак бы вал авторский бриф за
      // переход, который нормализатор сам же и исправит. Отметка грунта под
      // объектом (`reliefField` выше) берётся наоборот — со всеми площадками.
      const field = reliefOf({ baseY: r.baseY ?? groundY, hills: r.hills ?? [] });
      let lo = { x: -half, z: -half }, hi = { x: half, z: half };
      for (const h of r.hills) {
        lo = { x: Math.max(lo.x, Math.min(h.x, h.bx ?? h.x) - h.radius),
               z: Math.max(lo.z, Math.min(h.z, h.bz ?? h.z) - h.radius) };
        hi = { x: Math.min(hi.x, Math.max(h.x, h.bx ?? h.x) + h.radius),
               z: Math.min(hi.z, Math.max(h.z, h.bz ?? h.z) + h.radius) };
      }
      const step = Math.min(J.relief.meshCell, J.planGrid);
      let worst = { mag: 0, x: 0, z: 0 };
      for (let x = lo.x; x <= hi.x + 1e-9; x += step) {
        for (let z = lo.z; z <= hi.z + 1e-9; z += step) {
          const mag = field.slopeAt(x, z).mag;
          if (mag > worst.mag) worst = { mag, x: r3(x), z: r3(z) };
        }
      }
      if (worst.mag > maxSlope * 1.02) {
        errors.push(`relief: поле в точке (${worst.x}, ${worst.z}) даёт уклон ${worst.mag.toFixed(3)} м/м `
          + `круче предела ${maxSlope} — холмы складываются, и поштучный предел капсулы этого не видит; `
          + 'уменьшите высоту или раздвиньте радиусы');
      }
    }
    for (const [n, p] of (r.pads ?? []).entries()) {
      const label = `relief.pads[${n}] (${p.id ?? 'без id'})`;
      if (!(p.minX < p.maxX) || !(p.minZ < p.maxZ)) {
        errors.push(`${label}: вырожденная площадка (${p.minX}…${p.maxX} × ${p.minZ}…${p.maxZ}) — опора в её ядре нечем не держится`);
      }
      const reach = Math.max(p.blend ?? r.blend ?? J.relief.blend, 0);
      // Кольцо обрезано лишь тогда, когда ЯДРО площадки ещё лежит внутри земли:
      // тогда в кадре остаётся оборванный переход, и его уклон нечем ограничить.
      // Ядро, дотянутое до самого края, перехода в кадре не имеет вовсе — так
      // держится коридор поймы, который обязан пересекать карту целиком
      const cut = (lo, hi, edge) => (edge === 'lo' ? lo - reach < -half : hi + reach > half)
        && (edge === 'lo' ? lo > -half : hi < half);
      if (cut(p.minX, p.maxX, 'lo') || cut(p.minX, p.maxX, 'hi')
        || cut(p.minZ, p.maxZ, 'lo') || cut(p.minZ, p.maxZ, 'hi')) {
        errors.push(`${label}: площадка с переходной зоной ${reach} м выходит за землю ${size} м — `
          + 'кольцо blend обрезано внутри кадра, и у её края уклон не ограничен');
      }
    }
  }

  // --- дороги: осевые последовательные точки и разумные уклоны ---
  const roadRects = [];
  for (const [n, road] of (raw.roads ?? []).entries()) {
    const label = `roads[${n}] (${road.id})`;
    if (road.elements) {
      errors.push(...checkRoadElements(road, label, half, groundY, warnings));
      roadRects.push(...roadRectsOf(road));
      continue;
    }
    if (!road.points) {
      errors.push(`${label}: ни points, ни elements — у дороги нет осевой линии`);
      continue;
    }
    for (let i = 0; i + 1 < road.points.length; i++) {
      const a = road.points[i], b = road.points[i + 1];
      const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z);
      if (dx > AXIS_EPS && dz > AXIS_EPS) {
        errors.push(`${label}: отрезок ${i}→${i + 1} косой — настил дороги обязан идти по оси X или Z`);
        continue;
      }
      const run = Math.max(dx, dz);
      const rise = Math.abs(b.y - a.y);
      if (run < 0.01) errors.push(`${label}: отрезок ${i}→${i + 1} нулевой длины`);
      // настил с подъёмом — одна наклонная пластина (не лестница коробок), и её
      // крутизна ограничена тем, что перешагивает нога и что берёт сфера Чужого
      if (run > 0.01 && rise / run > J.maxSlope + 1e-9) {
        errors.push(`${label}: отрезок ${i}→${i + 1} даёт уклон ${(rise / run).toFixed(2)} м/м — `
          + `круче ${J.maxSlope} (подъём ${rise.toFixed(2)} м на ${run.toFixed(2)} м неперешагиваем)`);
      }
      if (road.type !== 'ground' && Math.max(a.y, b.y) - groundY < J.bridgeMinHeight) {
        warnings.push(`${label}: настил на ${road.id} ниже ${J.bridgeMinHeight} м над землёй — под ним не пройти`);
      }
    }
    if (road.type !== 'ground') {
      const top = Math.max(...road.points.map(p => p.y));
      if (top - groundY < J.bridgeMinHeight) {
        errors.push(`${label}: ${road.type} с верхом ${top} не поднимается над землёй на ${J.bridgeMinHeight} м`);
      }
    }
    roadRects.push(...roadRectsOf(road));
  }

  // --- туннели: прямые коридоры, проверка порталов и уклона пола ---
  // Коридор прямой, поэтому у него нет «кривых» профилей: проверяем только, что
  // порталы стоят на земле (в пределах плиты) и что пол коридора — настил над
  // землёй (не «пол под землёй»), а высота туннеля позволяла стенам быть высокими
  // над полом человека.
  for (const [n, t] of (raw.tunnels ?? []).entries()) {
    const label = `tunnels[${n}] (${t.id})`;
    const [a, b] = t.points;
    for (const [i, p] of t.points.entries()) {
      const plabel = `${label}.points[${i}]`;
      if (Math.abs(p.x) > half || Math.abs(p.z) > half) {
        errors.push(`${plabel}: портал (${p.x}, ${p.z}) вне земли ${size} м`);
      }
      if (p.y < -1e-9) errors.push(`${plabel}: портал ниже земли ${groundY} — коридор должен стоять над полом`);
    }
    const run = Math.hypot(b.x - a.x, b.z - a.z);
    if (run < 0.01) errors.push(`${label}: порталы совпадают — коридор пуст`);
    const rise = Math.abs(b.y - a.y);
    if (run > 0.01 && rise / run > J.maxSlope + 1e-9) {
      errors.push(`${label}: коридор даёт уклон ${(rise / run).toFixed(2)} м/м — круче ${J.maxSlope}`);
    }
    if (Math.abs(a.x - b.x) > AXIS_EPS && Math.abs(a.z - b.z) > AXIS_EPS) {
      errors.push(`${label}: коридор не идёт по оси X или Z — прямой туннель должен лежать по оси`);
    }
    if (t.height < J.tunnelMinHeight) {
      errors.push(`${label}: высота коридора ${t.height} м — ниже минимума ${J.tunnelMinHeight} м (человеческий глаз+тело)`);
    }
  }

  // --- вода: русло, берега, сходы ---
  // Планы берёт нормализатор: проверять «дом не в русле» по своей копии
  // арифметики берега значило бы держать её в двух местах и разъезжаться с
  // парсером при первой же правке.
  const channelRects = [];
  for (const [n, w] of (raw.waterways ?? []).entries()) {
    const label = `waterways[${n}] (${w.id})`;
    for (let i = 0; i + 1 < w.points.length; i++) {
      const a = w.points[i], b = w.points[i + 1];
      const dx = Math.abs(a.x - b.x), dz = Math.abs(a.z - b.z);
      if (dx < AXIS_EPS && dz < AXIS_EPS) errors.push(`${label}: отрезок ${i}→${i + 1} нулевой длины`);
    }
    for (const [i, p] of w.points.entries()) {
      if (Math.abs(p.x) > half || Math.abs(p.z) > half) {
        errors.push(`${label}: точка русла ${i} (${p.x}, ${p.z}) вне земли ${size} м`);
      }
    }
    const rise = groundY - w.bedY;
    if (rise < 0.2) {
      errors.push(`${label}: дно ${w.bedY} мельче 0,2 м под землёй ${groundY} — русла нет, есть канава в полшага`);
    }
    if (w.bedY >= w.surfaceY) errors.push(`${label}: surfaceY ${w.surfaceY} не выше дна ${w.bedY} — воде негде лечь`);
    if (w.surfaceY > groundY) {
      errors.push(`${label}: surfaceY ${w.surfaceY} выше земли ${groundY} — вода стояла бы поверх улиц`);
    }

    let ch = null;
    try {
      ch = normalizeWaterway(w, { y: groundY });
    } catch (e) {
      errors.push(`${label}: ${e.message}`);
    }
    if (!ch) continue;

    const seg0 = ch.segments[0];
    if (w.bank === 'slope' && rise > 0 && seg0.run > 0 && rise / seg0.run > J.maxSlope + 1e-9) {
      errors.push(`${label}: bankRun ${seg0.run} при перепаде ${rise} даёт уклон берега `
        + `${(rise / seg0.run).toFixed(2)} м/м — круче ${J.maxSlope}, нога и сфера Чужого склон не возьмут`);
    }
    if (w.bank === 'quay' && ch.wade && (w.ramps ?? []).length < 2) {
      errors.push(`${label}: набережная с бродом и ${(w.ramps ?? []).length} сходами — в русло войти можно,`
        + ' а стенка карниза не отпускает обратно: сходов нужно не меньше двух');
    }
    for (const [i, r] of (w.ramps ?? []).entries()) {
      const rlabel = `${label}.ramps[${i}]`;
      const reach = Math.max(...ch.segments.map(s => s.halfW + s.depth + s.rampRun + 2));
      const d = Math.min(...ch.segments.map(s => {
        const along = s.axis === 'x' ? r.at.x : r.at.z;
        const cross = s.axis === 'x' ? r.at.z : r.at.x;
        const outAlong = Math.max(s.lo - along, along - s.hi, 0);
        return Math.hypot(outAlong, Math.abs(cross - s.cross));
      }));
      if (d > reach) {
        errors.push(`${rlabel}: сход ${r.at.x}, ${r.at.z} в ${d.toFixed(1)} м от русла — дальше, чем `
          + `${reach.toFixed(1)} м (полширины + берег + длина пандуса); пандус ушёл бы в никуда`);
      }
    }
    for (const h of ch.holes) channelRects.push({ id: w.id, rect: h });
  }
  // наземная улица в русле — асфальт лег бы на воду: опоры у настила нет, и
  // ни ноги, ни маршруты через такое место не проходят
  for (const rr of roadRects) {
    if (!rr.ground) continue;
    for (const c of channelRects) {
      // план улицы из пластин повёрнут: его габарит заходит в воду углами, где
      // асфальта нет, и `rectsIntersect` браковал бы улицу, ни разу не коснувшуюся
      // русла. SAT по собственным осям полотна — та же проверка, что у парсера
      if (obbHitsRect(rr.rect, c.rect, 0.05)) {
        errors.push(`roads (${rr.id}): план наземной улицы пересёкся с руслом ${c.id} — дорогу через воду делает мост`);
      }
    }
  }

  // --- здания: footprint, комнаты, лестницы, двери ---
  const roadIds = new Set((raw.roads ?? []).map(r => r.id));
  // наземная улица под домом — дом посреди проезжей части: маршруты идут по
  // настилу, а габарит стоит в нём, поэтому такое здание бракуется
  const groundRects = roadRects.filter(r => r.ground);
  // нормализованные копии зданий: торцы переходов проверяются по тем же отметкам
  // полов, кровель и дверей, что считает парсер, — своя копия этой арифметики
  // разъехалась бы с ним при первой же правке
  const normBuildings = [];
  // планы домов в мировых осях (OBB для косых) — для проверки «соседями не
  // пересечься»; собирается всегда, а сравнивается только если в брифе есть
  // хотя бы один поворот: район из 600 соосных домов сверялся бы по габаритам,
  // которые и так не пересекаются
  const planBoxes = [];
  for (const [n, b] of (raw.buildings ?? []).entries()) {
    const label = `buildings[${n}] (${b.id})`;
    const enterable = b.isEnterable !== false;
    if (enterable && b.floorsCount > J.enterableFloors) {
      errors.push(`${label}: ${b.floorsCount} этажей во вводимом доме — максимум ${J.enterableFloors}`
        + ' (механизм маршей: посадка и проёмы перекрытий считаются по этажам)');
    }
    if (b.roof && b.roof.walkable !== true && (b.roof.parapet ?? 0) > 0) {
      warnings.push(`${label}: парапет ${b.roof.parapet} при невходимой кровле — по ней никто не ходит, ограждения парсер не ставит`);
    }
    try {
      normBuildings.push(normalizeBuilding(b, { y: groundY, size }, []));
    } catch {
      // разбор полигона упадёт уже в ошибках ниже — проверять торцы перехода не по чему
    }
    const fp = normalizePolygon(b.footprint, `${label}.footprint`, errors);
    if (!fp) continue;
    const fpCells = rasterPoly(fp, cell);
    if (fpCells.size === 0) { errors.push(`${label}: footprint не покрывает ни одной клетки — здания нет`); continue; }
    const bounds = polyBounds(fp);
    // косой дом: весь план ниже считается в его осях, а в мировой он ставится
    // поворотом вокруг центра габарита — тем же `frameOf`, что и карта
    const frame = frameOf(bounds, b.rotation ?? 0);
    planBoxes.push({
      label, rotation: b.rotation ?? 0, rotated: !!frame,
      rects: polyRects(fp).map(r => obbOf(r, frame)),
    });
    for (const rect of polyRects(fp)) {
      const o = obbOf(rect, frame);
      for (const rr of groundRects) {
        // у повёрнутой улицы план — тоже OBB: дом, вставший в её габаритный угол,
        // стоит на свободном асфальте, а `obbHitsRect` сравнивал бы корпус с
        // прямоугольником мировой сетки и браковал бы именно такой угол
        if (obbHitsObb(o, rr.rect, 0.05)) {
          errors.push(`${label}: часть footprint ${fmtRect(rotatedBounds(rect, frame))} легла на план наземной дороги ${rr.id} — дом стоит в улице`);
        }
      }
      // план русла включает дно, берега, сходы и стенки: дом, вставший в него,
      // отнял бы у воды суши, а игрок — дорогу вброд
      for (const c of channelRects) {
        if (obbHitsRect(o, c.rect, 0.05)) {
          errors.push(`${label}: часть footprint ${fmtRect(rotatedBounds(rect, frame))} легла в русло ${c.id} — дом стоит в воде`);
        }
      }
    }
    const outline = rotatedBounds(bounds, frame);
    for (const v of [[outline.minX, outline.minZ], [outline.maxX, outline.maxZ]]) {
      if (Math.abs(v[0]) > half || Math.abs(v[1]) > half) {
        errors.push(`${label}: выходит за землю (${size} м): точка ${v[0]}, ${v[1]}`);
      }
    }

    const used = [];
    // цель двери может быть только улицей, комнатой этого же дома или лестницей:
    // на несуществующий адрес карта повесила бы проём, ведущий в никуда
    const roomIds = new Set(b.rooms.map(r => r.id));
    const stairIds = new Set((b.stairs ?? []).map(s => s.id));
    for (const [k, room] of b.rooms.entries()) {
      const rlabel = `${label}.rooms[${k}] (${room.id})`;
      if (room.floor >= b.floorsCount) {
        errors.push(`${rlabel}: этаж ${room.floor} при floorsCount ${b.floorsCount}`);
      }
      const rp = normalizePolygon(room.polygon, `${rlabel}.polygon`, errors);
      if (!rp) continue;
      const rc = rasterPoly(rp, cell);
      for (const key of rc) {
        if (!fpCells.has(key)) { errors.push(`${rlabel}: комната выходит за периметр footprint (клетка ${key})`); break; }
      }
      for (const prev of used) {
        if (prev.floor !== room.floor) continue;
        if (cellsIntersect(rc, prev.cells)) {
          errors.push(`${rlabel}: пересекается с комнатой ${prev.id} того же этажа`);
        }
      }
      used.push({ id: room.id, floor: room.floor, cells: rc, rect: boundsOf(rp) });
      for (const c of (room.connections ?? [])) {
        if (!roadIds.has(c.target) && !roomIds.has(c.target) && !stairIds.has(c.target)) {
          errors.push(`${rlabel}: target '${c.target}' — не улица, не комната и не лестница этого дома`);
        }
        const onEdge = polyEdges(rp).some(e => distToEdge(e, c.portalPosition.x, c.portalPosition.z) <= 0.25);
        if (!onEdge) {
          errors.push(`${rlabel}: portalPosition ${c.portalPosition.x}, ${c.portalPosition.z} не на ребре комнаты —`
            + ' дверь не прорежет стену');
        }
      }
    }

    for (const [k, st] of (b.stairs ?? []).entries()) {
      const slabel = `${label}.stairs[${k}] (${st.id})`;
      const [k0, k1] = st.connectsFloors;
      // верх марша обязан совпасть с чем-то: перекрытием этажа (k1 < floorsCount)
      // или кровлей (k1 === floorsCount — люк на крышу). Глубже кровли марша нет:
      // плита её не пропустит, а на отметке выше roofY опоры не существует
      const toRoof = k1 === b.floorsCount;
      if (k1 <= k0) errors.push(`${slabel}: connectsFloors [${k0}, ${k1}] — вниз лестница не ведёт`);
      if (k1 > b.floorsCount) {
        errors.push(`${slabel}: верхний этаж ${k1} при floorsCount ${b.floorsCount} — марш ушёл выше кровли (отметка ${b.baseY ?? 0} + ${k1}·${b.floorHeight})`);
      }
      if (toRoof && b.roof?.walkable !== true) {
        errors.push(`${slabel}: марш выведен на кровлю (этаж ${k1}), а она не ходкая — roof.walkable: true`
          + ' иначе поднявшийся встанет на плиту, по которой парсер не ведёт маршруты, и упрётся в парапет');
      }
      // план по умолчанию имеет только вертикальный марш (шахта J.ladderShaft):
      // у остальных размеров нет, и марш встал бы в точку
      const d = st.dimensions ?? (st.type === 'ladder' ? { width: J.ladderShaft, length: J.ladderShaft } : null);
      if (!d) {
        errors.push(`${slabel}: ${st.type} без dimensions — план марша обязана задавать схема, по умолчанию его держит только ladder`);
      }
      const dd = d ?? { width: J.ladderShaft, length: J.ladderShaft };
      const along = Math.max(dd.width, dd.length), across = Math.min(dd.width, dd.length);
      // план марша поворачивает тот же toWorld, что и парсер: своя арифметика
      // «габарит вдоль X» проверила бы не тот проём, который режется в плите
      const rect = toWorld({ minX: 0, maxX: along, minZ: 0, maxZ: across },
        st.rotation ?? 0, st.position.x, st.position.z, along, across);
      const sc = rasterRect(rect, cell);
      for (const key of sc) {
        if (!fpCells.has(key)) { errors.push(`${slabel}: лестница вне footprint (клетка ${key})`); break; }
      }
      if (st.type === 'spiral' && across < 2 * (CONFIG.alien.radius + CONFIG.radius)) {
        errors.push(`${slabel}: винтовая лестница уже ${2 * (CONFIG.alien.radius + CONFIG.radius)} м — тело Чужого не впишется`);
      }
      // перекрытие и крыша вокруг марша режутся проёмом на клиенте, поэтому
      // соседство комнаты с лестницей — норма. Норма обязана быть с обеих сторон:
      // без комнаты внизу марш стоит над ямой, без комнаты наверху поднявшийся
      // выходит в плиту перекрытия
      const roomAt = floor => used.find(r => r.floor === floor && cellsIntersect(sc, r.cells));
      if (!roomAt(k0)) {
        errors.push(`${slabel}: низ марша не попадает ни в одну комнату этажа ${k0} — под ступенями нет пола`);
      }
      if (!toRoof && !roomAt(k1)) {
        errors.push(`${slabel}: верх марша не попадает ни в одну комнату этажа ${k1} — поднявшийся выйдет в перекрытие`);
      }
    }

    // вход обязан лежать на фасадном ребре: парсер знает только комнату,
    // поэтому проверяем, что портал на ребре и footprint тоже (иначе это
    // внутренняя перегородка, и с улицы в дом не попасть)
    for (const room of used) {
      for (const c of (room.connections ?? [])) {
        const onFp = polyEdges(fp).some(e => distToEdge(e, c.portalPosition.x, c.portalPosition.z) <= 0.25);
        if (!onFp) warnings.push(`${label}: вход ${c.linkType ?? 'door'} комнаты ${room.id} на внутренней перегородке, не на фасаде`);
      }
    }
  }

  // --- косые дома: пересечение планов ---
  // Разрешена только соосная пара (подиум + башня): при одном угле планы
  // переводятся друг в друга сдвигом, и парсер прорезает кровлю чужим планом
  // корректно. Разный угол дал бы пересечение, которое в локальных осях дома
  // не выражается ничем, — кровля под таким домом прорезалась бы его габаритом.
  // Габарит для проверки не годится: два косых дома могут смотреть друг на
  // друга углами, а их охватывающие коробки — пересекаться.
  if (planBoxes.some(b => b.rotated)) {
    for (const [i, a] of planBoxes.entries()) {
      for (const b of planBoxes.slice(i + 1)) {
        if (b.rotation === a.rotation) continue;
        const hit = a.rects.some(ra => b.rects.some(rb => obbHitsObb(ra, rb, 0.05)));
        if (hit) {
          errors.push(`${a.label} и ${b.label}: планы пересекаются при разных rotation `
            + `(${a.rotation}° и ${b.rotation}°) — косой дом нельзя ни вписать в чужую кровлю, `
            + 'ни обходить: соосная пара (одинаковый rotation) разрешена');
        }
      }
    }
  }

  // --- переходы (skybridge): у пластины нет опор с земли, её держат здания ---
  // Каждый торец обязан совпасть с отметкой пола комнаты (тогда в переход ведёт
  // её дверь) или с ходовой кровлей (тогда настил примыкает к плите). Без этого
  // парсер выдал бы пластину в воздухе: нога на неё встанет из узла настила, а
  // маршруту негде было бы на неё войти и с неё выйти.
  // Проверяется не вся пластина, а её конец глубиной в ширину настила: прямолинейный
  // переход — одна пластина на оба торца, и проверка ею целиком пропускала бы
  // висячий конец, стоило бы другому концу зацепить здание.
  // Конец отпускается на J.skybridgeFit и в плане, как по высоте: плита кровли и
  // фасад приходят ровно в черту торца, и строгая пересечённость браковала бы
  // примыкание в ноль.
  for (const [n, road] of (raw.roads ?? []).entries()) {
    if (road.type !== 'skybridge' || !road.points) continue;
    const label = `roads[${n}] (${road.id})`;
    const plans = roadRectsOf(road);
    const ends = [[0, road.points[0], 'начальный'], [plans.length - 1, road.points[road.points.length - 1], 'конечный']];
    for (const [pi, p, name] of ends) {
      const plate = plans[pi]?.rect;
      if (!plate) { errors.push(`${label}: настил не разложен на пластины — торцу негде проверять опору`); continue; }
      const cap = grown(endCap(plate, p, road.width), J.skybridgeFit);
      const elabel = `${label}: торец ${name} (${p.x}, ${p.z}) на отметке ${p.y}`;
      // примыкание меряется проёмом двери, а не её наружным узлом: узел парсер
      // выносит на 1,4 м за фасад (там нога входит в дверь), а пластина кончается
      // у стены — проверять по узлу значило бы требовать перехода длиннее дома
      // косой дом торцом перехода не отпускается: и дверь, и плита кровли лежат
      // в его осях, поэтому мировой прямоугольник настила сравнивался бы с
      // локальным планом и согласил бы примыкание там, где его нет
      const door = normBuildings.some(b => !b.rotation && b.doors.some(d => Math.abs(d.y - p.y) <= J.skybridgeFit
        && rectsIntersect(cap, d.rect, 0.05)));
      const roof = normBuildings.some(b => !b.rotation && b.roof?.walkable === true
        && Math.abs(b.roofY - p.y) <= J.skybridgeFit
        && rectsIntersect(cap, b.bounds, 0.05));
      if (!door && !roof) {
        errors.push(`${elabel}: не имеет опоры в плане — ни двери комнаты, ни ходовой кровли на своей отметке `
          + `(допуск ${J.skybridgeFit} м): настил перехода висит в воздухе`);
      }
    }
  }

  // --- свободный нос подъёма обязан прийти на улицу (v2) ---
  // Мост заканчивается там, где по нему въезжают: на полотне наземной улицы.
  // Замер развёрнутого v1-города показал обратное — из 6 свободных носов 3 кончались в 4 и 13 м
  // от ближайшей улицы, один стоял над домом `ncc_012`, и маршрут выводил
  // человека в двор, где обрывается мост. Проверка только для v2: модули v1-глав
  // обязаны побайтово совпадать с парсером, а их носы сегодня именно таковы.
  // `open` — те же данные v2, поэтому и правило носов у него общее с `json2`.
  if (isV2Kind(raw.kind)) {
    const streetPlans = [];
    for (const road of raw.roads ?? []) {
      if (road.type !== 'ground') continue;
      const rc = roadRectsOf(road), cp = roadCapsOf(road);
      // `roadRectsOf` и `roadCapsOf` идут по элементам в одном порядке, поэтому
      // i-я пластина и её пара срезов соответствуют друг другу
      for (let i = 0; i < rc.length; i++) {
        streetPlans.push({
          id: road.id, rect: rc[i].rect, topLo: rc[i].topLo, gen: road.district !== undefined,
          a: cp[2 * i], b: cp[2 * i + 1],
        });
      }
    }
    // список носов — общий с генератором кварталов (`tools/city.js` дотягивает к
    // ним оси улиц): тот же гейт «стык цепочки», та же пятка по тому же полю
    for (const cap of bridgeNoses(raw.roads ?? [], groundY, reliefField)) {
      const label = `roads[${cap.n}] (${cap.road.id})`;
      const elabel = `${label}: свободный нос подъёма (${cap.x}, ${cap.z}) на отметке ${cap.top}`;
      let best = null;
      for (const pl of streetPlans) {
        const dist = distToDeck(pl.rect, cap.x, cap.z);
        if (!best || dist < best.dist) best = { ...pl, dist };
      }
      const house = planBoxes.find(b => b.rects.some(r => distToDeck(r, cap.x, cap.z) === 0));
      if (!best || best.dist > J.skybridgeFit) {
        errors.push(`${elabel} не находит наземную улицу — `
          + (best ? `ближайшая ${best.id} в ${best.dist.toFixed(3)} м` : 'ни одной наземной дороги в уровне нет')
          + ` (допуск ${J.skybridgeFit} м): подъём обязан кончаться на полотне улицы, а не`
          + (house ? ` над домом ${house.label}` : ' над пустой землёй'));
        continue;
      }
      // полотно под носом обязано быть на той же отметке: нос в метре над
      // асфальтом — не въезд, а стена, и нога её не берёт. Меряется только по
      // АВТОРСКОЙ улице: отметка генераторной пластины в брифе — намерение, её
      // парсер кладёт на поле (`profileDistrictStreets`), и сравнивать съезд с
      // provisional `y` значило бы браковать всякий район не на нуле. Стык с
      // СОБРАННЫм полотном называет предупреждением парсер — закоммиченная
      // глава предупреждений не носит, поэтому дыра не пройдёт и оттуда.
      if (best.gen) continue;
      const top = deckTopAt(best, cap.x, cap.z);
      if (Math.abs(top - cap.top) > J.skybridgeFit) {
        errors.push(`${elabel} сходится с улицей ${best.id} ступенью `
          + `${Math.abs(top - cap.top).toFixed(3)} м (её полотно ${top}): подъём обязан приходить к `
          + `улице вровень (допуск ${J.skybridgeFit} м)`);
      }
    }
  }

  // --- косая кровля не принимает настил ---
  // Плита примыкающего настила режет ходовую плиту и парапет в осях дома. У
  // повёрнутого корпуса мировая пластина в этих осях не прямоугольник, поэтому
  // её габарит вырезал бы дыру шире перехода — сход с крыши в никуда. `JsonMap`
  // у косого дома примыканий не рассматривает вовсе, и схема бракует такую
  // стыковку явно: иначе глава молча получила бы кровлю без проёма там, где
  // автор перехода рисовал мост.
  for (const b of normBuildings) {
    if (!b.rotation) continue;
    const outline = obbOf(b.bounds, frameOf(b.bounds, b.rotation));
    for (const [n, road] of (raw.roads ?? []).entries()) {
      if (road.type === 'ground') continue;
      for (const pl of roadRectsOf(road)) {
        // торцы пластины лежат на её концах: у повёрнутой пластины проверяются
        // собственные пределы верха, а не точки осевой линии, которой у элементов
        // нет вовсе
        const level = Math.abs(pl.topLo - b.roofY) <= J.skybridgeFit
          || Math.abs(pl.topHi - b.roofY) <= J.skybridgeFit;
        if (level && obbHitsObb(outline, pl.rect, 0.05)) {
          errors.push(`roads[${n}] (${road.id}) и ${b.id}: настил лег на косую кровлю `
            + `(кровля ${b.roofY}, rotation ${b.rotation}°) — проём в плите под углом не вырезать; `
            + 'поставь дому rotation 0 или уведи настил');
        }
      }
    }
  }

  // --- уникальность идентификаторов ---
  const ids = new Set();
  const addId = (v, where) => {
    if (ids.has(v)) errors.push(`${where}: id '${v}' уже занят`);
    ids.add(v);
  };
  for (const r of raw.roads ?? []) addId(r.id, 'roads');
  for (const w of raw.waterways ?? []) addId(w.id, 'waterways');
  for (const b of raw.buildings ?? []) {
    addId(b.id, 'buildings');
    for (const r of b.rooms ?? []) addId(r.id, `buildings/${b.id}/rooms`);
    for (const s of b.stairs ?? []) addId(s.id, `buildings/${b.id}/stairs`);
  }
  for (const o of raw.landscapeObjects ?? []) addId(o.id, 'landscapeObjects');
  for (const l of raw.lights ?? []) addId(l.id, 'lights');

  // --- настоящие источники: лимит и опоры моста вне планов дорог ---
  const real = (raw.lights ?? []).filter(l => l.type !== 'directional');
  if (real.length > J.maxRealLights) {
    errors.push(`lights: ${real.length} источников point/spot — максимум ${J.maxRealLights}`
      + ' (каждый умножает свет во все фрагменты сцены)');
  }
  if ((raw.lights ?? []).filter(l => l.type === 'directional').length > 1) {
    errors.push('lights: больше одного directional — второй складывать в sky.sun некуда');
  }
  for (const o of raw.landscapeObjects ?? []) {
    if (o.model !== 'concrete_pillar') continue;
    const rect = rectAround(o.position.x, o.position.z, J.pillarSection, J.pillarSection);
    for (const rr of roadRects) {
      if (rr.ground && obbHitsRect(rr.rect, rect, 0.05)) {
        errors.push(`landscapeObjects (${o.id}): опора стоит в плане наземной дороги ${rr.id} — по улице она преградой не станет, но визуально закопана в асфальт`);
      }
    }
  }

  // --- спавн и точка B внутри земли ---
  for (const [key, pos] of [['gameplay.spawn', raw.gameplay?.spawn], ['gameplay.exit', raw.gameplay?.exit]]) {
    if (!pos) continue;
    if (Math.abs(pos.x) > half || Math.abs(pos.z) > half) {
      errors.push(`${key}: точка ${pos.x}, ${pos.z} вне земли ${raw.ground?.size} м`);
    }
  }

  // --- автомобили: обещанное число, точки в кадре, корпус ни во что не упирается ---
  // Мерится корпус с его поворотом, а не точка-центр: центр ничего не говорит о
  // том, куда смотрит капот, и повёрнутый в фасад корпус точка бы не выдала
  const carsGp = raw.gameplay?.cars;
  if (carsGp) {
    const spots = carsGp.spots ?? [];
    if (carsGp.count !== spots.length) {
      errors.push(`gameplay.cars: count ${carsGp.count} не совпал с числом точек (${spots.length}) — `
        + 'движок ставит ровно по списку, и вторая цифра читалась бы как обещание, которого данные не отдают');
    }
    const boxes = [];
    for (const [n, p] of spots.entries()) {
      const label = `gameplay.cars.spots[${n}] (${p.x}, ${p.z}, yaw ${p.yaw ?? 0}°)`;
      if (Math.abs(p.x) > half || Math.abs(p.z) > half) {
        errors.push(`${label}: точка вне земли ${size} м — машина встанет за её краем, где ни опоры, ни дороги нет`);
        continue;
      }
      const box = obbOf(rectAround(p.x, p.z, CONFIG.car.length, CONFIG.car.width), frameAt(p.x, p.z, p.yaw ?? 0));
      for (const b of normBuildings) {
        const outline = obbOf(b.bounds, frameOf(b.bounds, b.rotation ?? 0));
        if (obbHitsObb(outline, box, 0.05)) {
          errors.push(`${label}: корпус лег в план дома ${b.id} — машина внутри фасада не видна с улиц, `
            + 'и подойти к ней нельзя; уведи точку или поверни её');
          break;
        }
      }
      boxes.push({ label, box });
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (obbHitsObb(boxes[i].box, boxes[j].box)) {
          errors.push(`${boxes[i].label} и ${boxes[j].label}: планы машин пересеклись — два корпуса на одном `
            + 'асфальте, и игрок видит только ближайший: вторую машину он не находит');
        }
      }
    }
  }

  return { errors, warnings, geometryOnly: true };
}

/**
 * Дорога из пластин и дуг (v2): у каждой свой центр, длина, ширина и угол к
 * северу — полотно развязки законно расширяется, а цепочка элементов идёт не по
 * мировой оси. Проверки те же, что у осевых сегментов v1: уклон, ширина, земля,
 * высота моста; отличие одно — план считается по осям полотна (у дуги — по её
 * кольцевому сектору), а не по габариту.
 */
function checkRoadElements(road, label, half, groundY, warnings) {
  const errors = [];
  if (road.points) {
    errors.push(`${label}: points и elements одновременно — у дороги одна осевая модель`);
    return errors;
  }
  if (road.type === 'embankment' || road.type === 'skybridge') {
    errors.push(`${label}: ${road.type} из пластин не поддержан — насыпь и переход собираются `
      + 'из осевых points (опоры и примыкание торцов считаются по ним)');
    return errors;
  }
  const TAU = Math.PI * 2;
  // маркеры касательной разворачиваются до покомпонентных проверок: план
  // повёрнутой пластины и её угол считаются по тому же `yaw`, что увидит движок
  let elements;
  try {
    elements = resolveRoadElements(road.elements);
  } catch (e) {
    errors.push(`${label}.${e.message}`);
    return errors;
  }
  let top = -Infinity;
  for (const { el, i } of elements) {
    const pl = el?.plate, ar = el?.arc;
    const elabel = `${label}.elements[${i}]`;
    if (pl && ar) {
      errors.push(`${elabel}: plate и arc одновременно — у элемента одна форма`);
      continue;
    }
    if (!pl && !ar) {
      errors.push(`${elabel}: элемент без plate или arc — в схеме v2 описаны две формы`);
      continue;
    }
    if (ar) {
      const span = (ar.to - ar.from) * DEG;
      if (Math.abs(span) < 1e-6 || Math.abs(span) > TAU + 1e-9) {
        errors.push(`${elabel}: размах дуги ${r3(ar.to - ar.from)}° — нужен отличный от нуля и не больше 360°`);
        continue;
      }
      const halfW = ar.width / 2;
      if (ar.radius - halfW <= 0.5) {
        errors.push(`${elabel}: внутренний радиус ${r3(ar.radius - halfW)} м при радиусе ${ar.radius}`
          + ` и ширине ${ar.width} — полотно выворачивается через центр`);
        continue;
      }
      const len = ar.radius * Math.abs(span);
      const rise = (ar.y[1] ?? 0) - (ar.y[0] ?? 0);
      if (Math.abs(rise) / len > J.maxSlope + 1e-9) {
        errors.push(`${elabel}: уклон дуги ${(Math.abs(rise) / len).toFixed(2)} м/м — круче ${J.maxSlope}`
          + ` (подъём ${Math.abs(rise).toFixed(2)} м на ${r3(len)} м неперешагиваем)`);
      }
      const box = arcBounds(ar.cx, ar.cz, ar.radius, halfW, ar.from * DEG, ar.to * DEG);
      for (const [x, z] of [[box.minX, box.minZ], [box.maxX, box.minZ], [box.minX, box.maxZ], [box.maxX, box.maxZ]]) {
        if (Math.abs(x) > half || Math.abs(z) > half) {
          errors.push(`${elabel}: дуга выходит за землю (${half * 2} м): точка ${r3(x)}, ${r3(z)}`);
          break;
        }
      }
      // отметки торцов — средины полотна без крена: крен у обоих концов дуги
      // сходится к нулю (переход пишет нормализатор), а гребень живёт в середине
      // развёртки и сравнивать его с концом соседнего элемента незачем
      const lo = Math.min(ar.y[0], ar.y[1]), hi = Math.max(ar.y[0], ar.y[1]);
      if (road.type !== 'ground' && hi - groundY < J.bridgeMinHeight) {
        warnings.push(`${elabel}: настил на ${road.id} ниже ${J.bridgeMinHeight} м над землёй — под ним не пройти`);
      }
      top = Math.max(top, hi);
      continue;
    }
    const rise = pl.rise ?? 0;
    if (Math.abs(rise) / pl.length > J.maxSlope + 1e-9) {
      errors.push(`${elabel}: уклон ${(Math.abs(rise) / pl.length).toFixed(2)} м/м — круче ${J.maxSlope}`
        + ` (подъём ${Math.abs(rise).toFixed(2)} м на ${pl.length.toFixed(2)} м неперешагиваем)`);
    }
    const plan = {
      minX: pl.x - pl.length / 2, maxX: pl.x + pl.length / 2,
      minZ: pl.z - pl.width / 2, maxZ: pl.z + pl.width / 2,
    };
    const box = rotatedBounds(plan, frameAt(pl.x, pl.z, pl.yaw ?? 0));
    for (const [x, z] of [[box.minX, box.minZ], [box.maxX, box.maxZ]]) {
      if (Math.abs(x) > half || Math.abs(z) > half) {
        errors.push(`${elabel}: пластина выходит за землю (${half * 2} м): точка ${r3(x)}, ${r3(z)}`);
        break;
      }
    }
    const lo = Math.min(pl.y, pl.y + rise), hi = Math.max(pl.y, pl.y + rise);
    if (road.type !== 'ground' && hi - groundY < J.bridgeMinHeight) {
      warnings.push(`${elabel}: настил на ${road.id} ниже ${J.bridgeMinHeight} м над землёй — под ним не пройти`);
    }
    top = Math.max(top, hi);
  }
  if (road.type !== 'ground' && top - groundY < J.bridgeMinHeight) {
    errors.push(`${label}: ${road.type} с верхом ${top} не поднимается над землёй на ${J.bridgeMinHeight} м`);
  }
  return errors;
}

/** План полосы дороги (для проверки «опора не посреди улицы»). */
function roadRectsOf(road) {
  const out = [];
  if (!road.points) {
    // негодный маркер уже назван `checkRoadElements`: здесь он не должен ронять
    // геометрический проход стеком, потому что ошибки собираются, а не бросаются
    let elements = [];
    try { elements = resolveRoadElements(road.elements ?? []); } catch { /* ошибка уже в списке */ }
    for (const { el } of elements) {
      const pl = el?.plate;
      if (el?.arc) {
        const ar = el.arc, halfW = ar.width / 2;
        out.push({
          id: road.id, ground: road.type === 'ground',
          rect: arcBounds(ar.cx, ar.cz, ar.radius, halfW, ar.from * DEG, ar.to * DEG),
          // та же арифметика, что у нормализатора: отметки торцов без крена
          topLo: Math.min(ar.y[0], ar.y[1]),
          topHi: Math.max(ar.y[0], ar.y[1]),
        });
        continue;
      }
      if (!pl) continue;
      const plan = {
        minX: pl.x - pl.length / 2, maxX: pl.x + pl.length / 2,
        minZ: pl.z - pl.width / 2, maxZ: pl.z + pl.width / 2,
      };
      out.push({
        id: road.id, ground: road.type === 'ground',
        rect: obbOf(plan, frameAt(pl.x, pl.z, pl.yaw ?? 0)),
        topLo: Math.min(pl.y, pl.y + (pl.rise ?? 0)),
        topHi: Math.max(pl.y, pl.y + (pl.rise ?? 0)),
      });
    }
    return out;
  }
  const halfW = road.width / 2;
  for (let i = 0; i + 1 < road.points.length; i++) {
    const a = road.points[i], b = road.points[i + 1];
    const horiz = Math.abs(a.x - b.x) >= Math.abs(a.z - b.z);
    // вдоль оси план кончается концом пластины, как его считает нормализатор:
    // наращивать его на полwidth «на случай стыка» значило бы браковать дом,
    // вставший в метре от торца улицы, — генератор как раз обрывает её у его фасада
    const minX = horiz ? Math.min(a.x, b.x) : a.x - halfW;
    const maxX = horiz ? Math.max(a.x, b.x) : a.x + halfW;
    const minZ = horiz ? a.z - halfW : Math.min(a.z, b.z);
    const maxZ = horiz ? a.z + halfW : Math.max(a.z, b.z);
    out.push({
      id: road.id, ground: road.type === 'ground', rect: { minX, maxX, minZ, maxZ },
      topLo: Math.min(a.y, b.y), topHi: Math.max(a.y, b.y),
    });
  }
  return out;
}

/** Расстояние от точки до плана настила (0 — внутри или впритык): у OBB — в своих осях. */
function distToDeck(rect, x, z) {
  const o = rect.obb;
  if (o) {
    const du = Math.max(Math.abs((x - o.cx) * o.c + (z - o.cz) * o.s) - o.hx, 0);
    const dv = Math.max(Math.abs(-(x - o.cx) * o.s + (z - o.cz) * o.c) - o.hz, 0);
    return r3(Math.hypot(du, dv));
  }
  return r3(Math.hypot(Math.max(rect.minX - x, x - rect.maxX, 0), Math.max(rect.minZ - z, z - rect.maxZ, 0)));
}

/** Отметка верха настила в точке плана — линейно между его торцами (`a`, `b` из `roadCapsOf`). */
function deckTopAt(plan, x, z) {
  if (!plan.a || !plan.b) return plan.topLo;
  const dx = plan.b.x - plan.a.x, dz = plan.b.z - plan.a.z;
  const len2 = dx * dx + dz * dz;
  const t = len2 > 1e-9 ? Math.max(0, Math.min(1, ((x - plan.a.x) * dx + (z - plan.a.z) * dz) / len2)) : 0;
  return r3(plan.a.top + (plan.b.top - plan.a.top) * t);
}

/** Прямоугольник, отпущенный во все стороны на `d` — допуск примыкания в плане. */
function grown(rect, d) {
  return { minX: rect.minX - d, maxX: rect.maxX + d, minZ: rect.minZ - d, maxZ: rect.maxZ + d };
}

/** Конец пластины в плане: полоса глубиной `depth` у той границы, к которой ближе точка. */
function endCap(rect, p, depth) {
  const alongX = rect.maxX - rect.minX >= rect.maxZ - rect.minZ;
  const lo = alongX ? p.x : p.z, min = alongX ? rect.minX : rect.minZ, max = alongX ? rect.maxX : rect.maxZ;
  const d = Math.min(depth, max - min);
  const [a0, a1] = Math.abs(lo - min) <= Math.abs(lo - max) ? [min, min + d] : [max - d, max];
  return alongX
    ? { minX: r3(a0), maxX: r3(a1), minZ: rect.minZ, maxZ: rect.maxZ }
    : { minX: rect.minX, maxX: rect.maxX, minZ: r3(a0), maxZ: r3(a1) };
}

/** Расстояние от точки до отрезка в плане (отрезок — по оси). */
function distToEdge(e, x, z) {
  const lo = e.axis === 'x' ? Math.min(e.x0, e.x1) : Math.min(e.z0, e.z1);
  const hi = e.axis === 'x' ? Math.max(e.x0, e.x1) : Math.max(e.z0, e.z1);
  const t = e.axis === 'x' ? x : z;
  const cross = e.axis === 'x' ? z : x;
  const fixed = e.axis === 'x' ? e.z0 : e.x0;
  return Math.hypot(Math.max(lo - t, 0, t - hi), Math.abs(cross - fixed));
}

/** Прямоугольник заданного размера вокруг точки (длина — по X, ширина — по Z). */
function rectAround(cx, cz, length, width) {
  return {
    minX: r3(cx - length / 2), maxX: r3(cx + length / 2),
    minZ: r3(cz - width / 2), maxZ: r3(cz + width / 2),
  };
}

/** Габарит полигона как rect. */
function boundsOf(poly) {
  const b = polyBounds(poly);
  return { minX: r3(b.minX), maxX: r3(b.maxX), minZ: r3(b.minZ), maxZ: r3(b.maxZ) };
}

/** Прямоугольник в текст ошибки — чтобы по координатам было видно, где именно. */
const fmtRect = r => `[${r3(r.minX)}…${r3(r.maxX)} × ${r3(r.minZ)}…${r3(r.maxZ)}]`;

export { ROOM_TYPES, ROAD_TYPES, STAIR_TYPES, LIGHT_TYPES, LINK_TYPES, cellKey };
