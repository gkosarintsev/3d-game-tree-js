/**
 * Браузерный прогон автотестов для CI: `node tools/ci-browser.mjs [--port 8124] [--suites a,b] [--flake файл::проверка] [--fast]`.
 *
 * Делает ровно то, что оператор делает руками: поднимает статический сервер над
 * репозиторием, открывает `3d-game.html`, импортирует каждую сюиту `tests/*.test.js`
 * и вызывает её `run*Tests()`. Сама страница при этом не меняется — ни игрового
 * ввода, ни pointer lock сюитам не нужно, они собирают карты прямо из реестра.
 *
 * Playwright берётся **не из репозитория**: своего `package.json` в проекте нет и
 * не появляется (AGENTS.md, «База»), поэтому узел зависимости от CI не перетекает
 * в код игры. Официальный образ `mcr.microsoft.com/playwright` несёт из него
 * только браузеры (его Dockerfile устанавливает пакет во временный каталог и
 * удаляет его вместе с npm-кэшем), так что джоба `browser` доустанавливает пакет
 * в глобальный префикс контейнера и передаёт его сюда через `NODE_PATH`.
 *
 * Каждый файл гоняется в свежей странице: сюита `relief-city` мерит бюджет опоры
 * по времени (2,5 мкс на пробу), и в батче из нескольких сюит на одной странице
 * её цифры плывут — README прямо требует гнать её отдельно. Отдельная страница на
 * файл делает это правило автоматическим.
 *
 * `--flake "<файл>::<проверка>"` помечает проверку стохастической: её красное
 * число печатается, но не красит прогон. Аргумент обязан быть точкой, а не файлом
 * целиком, иначе из CI уходит вся сюита. Флаг нужен для ручного разбора
 * конкретной известной нестабильной проверки; постоянного списка флейков в
 * репозитории нет — CI гоняет все сюиты блокирующими.
 */
import { createRequire } from 'node:module';
import { delimiter, extname, resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.glb': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

/** Таймаут сюиты: самая дорогая (глава 10–13 на 600 м) собирается десятки секунд. */
const SUITE_TIMEOUT_MS = 420_000;

/** Имя проверки считается perf-гейтом, если содержит эти подстроки. */
const PERF_NAME_RE = /бюджет|мкс|budget/i;

/**
 * Разрешение playwright: `NODE_PATH` (им так задаётся путь в джобе `browser`),
 * затем обычный подъём по `node_modules`, затем глобальный префикс узла в
 * контейнере. ESM по `NODE_PATH` не ищет, поэтому нужен `require` с абсолютным
 * путём; отказ обязан называть испробованные места — без них красная джоба в CI
 * говорит только «не найден» и не говорит, где именно её искать.
 */
function loadPlaywright() {
  const require = createRequire(import.meta.url);
  const globalRoots = ['/usr/local/lib/node_modules/playwright', '/usr/lib/node_modules/playwright'];
  const fromEnvPath = (process.env.NODE_PATH || '').split(delimiter).filter(Boolean)
    .map(dir => resolve(dir, 'playwright'));
  const candidates = [...fromEnvPath, 'playwright', ...globalRoots];
  for (const c of candidates) {
    try {
      return require(c);
    } catch {
      // пробуем следующее место установки
    }
  }
  throw new Error(`playwright не найден (пробовал: ${candidates.join(', ') || 'пусто'}) `
    + '— гоняйте этот скрипт после установки пакета, в CI путь отдаёт NODE_PATH="$(npm root --global)"');
}

/** Статический сервер над репозиторием: только GET, путь зажимается внутри ROOT. */
function serve() {
  const server = createServer(async (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405).end();
      return;
    }
    const url = new URL(req.url, 'http://localhost');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || '3d-game.html';
    const abs = resolve(ROOT, rel);
    if (!abs.startsWith(ROOT)) {
      res.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(abs);
      res.writeHead(200, {
        'Content-Type': MIME[extname(abs)] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      }).end(body);
    } catch {
      res.writeHead(404).end(`нет файла ${rel}`);
    }
  });
  return new Promise(done => server.listen(0, '127.0.0.1', () => done({ server, port: server.address().port })));
}

async function runSuite(context, baseUrl, file, fast = false, level = null) {
  const started = Date.now();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', e => consoleErrors.push(String(e)));
  const url = `${baseUrl}/3d-game.html`;
  await page.goto(url, { waitUntil: 'load', timeout: 120_000 });
  await page.waitForFunction(() => window.game && typeof window.game.createMap === 'function', null, { timeout: 120_000 });
  const outcome = await Promise.race([
    page.evaluate(async ({ file, level }) => {
      // Фильтр глав (AGENTS.md / tests/level-filter.js): `--level 3` → только глава 3.
      // Сюиты реестра читают TEST_LEVEL, если аргумент run*Tests() не передан.
      // Некоторые сюиты не привязаны к главам — они обязаны принять флаг и пропустить
      // себя, вернув { passed, total, skipped: true } при активном фильтре.
      if (level != null) globalThis.TEST_LEVEL = level;
      const mod = await import(file);
      const key = Object.keys(mod).find(k => typeof mod[k] === 'function' && /^run/.test(k));
      if (!key) return { error: 'в модуле нет экспорта run*Tests()' };
      const r = await mod[key]();
      if (!r || typeof r.total !== 'number') return { error: `сюита вернула ${JSON.stringify(r)} вместо { passed, total }` };
      return { passed: r.passed, total: r.total, skipped: !!r.skipped, results: (r.results ?? []).map(x => [x.passed, x.name, x.info]) };
    }, { file: `/tests/${file}`, level }),
    new Promise((_, rej) => setTimeout(() => rej(new Error(`таймаут сюиты ${SUITE_TIMEOUT_MS / 1000} с`)), SUITE_TIMEOUT_MS)),
  ]).catch(e => ({ error: String(e?.message ?? e) }));
  if (fast && !outcome.error && Array.isArray(outcome.results)) {
    const kept = outcome.results.filter(([, name]) => !PERF_NAME_RE.test(String(name)));
    outcome.passed = kept.filter(([p]) => p).length;
    outcome.total = kept.length;
    outcome.results = kept;
  }
  await page.close();
  return { file, ...outcome, consoleErrors, durationMs: Date.now() - started };
}

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

/** Многократные флаги: `--flake a::b --flake c::d`. */
function argAll(name) {
  const out = [];
  const argv = process.argv;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--${name}` && argv[i + 1]) out.push(argv[i + 1]);
  }
  return out;
}

const only = (arg('suites', '') || '').split(',').filter(Boolean);
const fast = process.argv.includes('--fast');
const levelArg = arg('level', null);
const flakes = argAll('flake').map(spec => {
  const at = spec.indexOf('::');
  return { file: at < 0 ? spec : spec.slice(0, at), name: at < 0 ? '' : spec.slice(at + 2) };
});
const isFlaky = (file, name) => flakes.some(f =>
  (file === f.file || `${f.file}.test.js` === file) && (!f.name || String(name).startsWith(f.name)));
const { chromium } = loadPlaywright();
const { server, port } = await serve();
const baseUrl = `http://127.0.0.1:${port}`;
const files = only.length ? only.map(f => f.endsWith('.test.js') ? f : `${f}.test.js`)
  : (await readdir(resolve(ROOT, 'tests'))).filter(f => f.endsWith('.test.js')).sort();

console.log(`прогон ${files.length} браузерных сюит на ${baseUrl}${levelArg != null ? `, только глава ${levelArg}` : ''}${flakes.length ? `, стохастических проверок — ${flakes.length}` : ''}${fast ? ' (fast: perf-проверки пропущены)' : ''}`);
const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-dev-shm-usage'] });
// Один контекст на весь прогон (R0): браузеры и HTTP-кэш общие, а страницы
// свежие — свежесть JS-мира и рендерера сохраняется, потому что каждая сюита
// идёт в своей странице из этого контекста.
const context = await browser.newContext();
let failedSuites = 0;
let checks = 0;
let checksPassed = 0;
let flakesRed = 0;
for (const file of files) {
  console.log(`START ${file}${levelArg != null ? ` [глава ${levelArg}]` : ''}`);
  const r = await runSuite(context, baseUrl, file, fast, levelArg);
  if (r.error) {
    failedSuites++;
    console.log(`FAIL ${file}: ${r.error}`);
    continue;
  }
  checks += r.total ?? 0;
  checksPassed += r.passed ?? 0;
  const red = (r.results ?? []).filter(([passed]) => !passed);
  const blocking = red.filter(([, name]) => !isFlaky(file, name));
  flakesRed += red.length - blocking.length;
  // Пропущенная по фильтру главы сюита (total 0, skipped) — не провал.
  const ok = blocking.length === 0 && ((r.total ?? 0) > 0 || r.skipped);
  if (!ok) failedSuites++;
  const flakeNote = red.length - blocking.length ? ` (флейк ${red.length - blocking.length})` : '';
  const skipNote = r.skipped ? ' (пропуск по фильтру главы)' : '';
  const tag = !ok ? 'FAIL' : (r.skipped ? 'SKIP' : 'PASS');
  console.log(`${tag} ${file}: ${r.passed}/${r.total}${flakeNote}${skipNote} (${((r.durationMs ?? 0) / 1000).toFixed(1)}s)`);
  for (const [, name, info] of red) {
    console.log(`       ${isFlaky(file, name) ? 'FLAKE (не блокирует)' : '✖'} ${name}: ${String(info).slice(0, 2000)}`);
  }
  if (r.consoleErrors?.length) {
    console.log(`       errors: ${r.consoleErrors.slice(0, 3).join(' | ').slice(0, 300)}`);
  }
}
await context.close();
await browser.close();
// `close()` не рвёт keep-alive соединения — браузер мог их оставить, и процесс
// висит после итога; явно закрываем idle/живые соединения (Node 18.2+/24).
server.closeIdleConnections?.();
server.closeAllConnections?.();
await new Promise(done => server.close(done));

console.log(`\nбраузер: ${checksPassed}/${checks} проверок зелёные по ${files.length - failedSuites}/${files.length} сюжеткам` +
  (flakesRed ? ` (красных флейков вне вердикта: ${flakesRed})` : ''));
if (failedSuites) process.exitCode = 1;
// Страховка от висящих дескрипторов (keep-alive/stdio браузера): итог уже напечатан,
// ждать дольше смысла нет. unref, чтобы не держать цикл, если выход штатный.
setTimeout(() => process.exit(process.exitCode ?? 0), 4000).unref();
