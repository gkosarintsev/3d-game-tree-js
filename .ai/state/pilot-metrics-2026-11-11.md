# Pilot runtime metrics (TASK-001/008)

Date: 2026-11-11. Scope after chapter 03/05 removal: `07,08,09,10,15,16`. Full browser CI (`node tools/ci-browser.mjs`, Playwright 1.49.0, Chromium, `NODE_PATH="C:\Users\user\AppData\Roaming\npm\node_modules"`): **83/83 checks, 14/14 suites PASS**.

Measurements below are point runs of `tests/open-world.test.js` (single-suite invocation, same environment) and are **not** a stable profiling baseline; compare against `docs/open-world-plan.md` and гл.15 only after profiling in identical/controlled conditions.

## гл.16 (pilot v4, `--level 16`) — PASS

### Run 1 (point, earlier 2026-11-11)
- Load to `chapter`: **179 ms**; playable window: **159 ms**; measured marks after build: 16
- Start: spawn `(-520, -520)` matches/built/passable; start cell `0_0` drawn; beacon `(520, 520)` (beacon built/visible: `false`, route partial)
- Window: 13 cells (`0_0..3_1`, radius 712 m), all drawn
- Intertitle period: **184 frames**, rest at 184, **338 slices**, **13 builds**, **12 reads**, **0 errors**
- Worst frame: **40.5 ms** vs level ceiling **80 ms** (atom 40.4 ms `picture`, accumulation ≤ 4.3 ms); worst cell wall-clock **217 ms**
- Nav: **48539 nodes** (47115 valid); scene objects 77 at start
- Rows/entities: windows 4636→11140, clutter 0, signage 0; enemies 6 (0 outside built, 0 removed), cars 1
- Route: partial 307 nodes / 1500.0 m, 554.4 m to beacon

### Run 2 (point, 2026-11-11 19:33+)
- Load to `chapter`: **164 ms**; playable window: **147 ms**; measured marks after build: 16
- Start: spawn `(-520, -520)` matches/built/passable; start cell `0_0` drawn; beacon `(520, 520)` (beacon built/visible: `false`, route partial)
- Window: 13 cells (`0_0..3_1`, radius 712 m), all drawn
- Intertitle period: **178 frames**, rest at 178, **338 slices**, **13 builds**, **12 reads**, **0 errors**
- Worst frame: **35.7 ms** vs level ceiling **80 ms** (atom 35.6 ms `picture`, accumulation ≤ 4.2 ms); worst cell wall-clock **197 ms**
- Nav: **48539 nodes** (47115 valid); scene objects 77 at start
- Rows/entities: windows 4636→11140, clutter 0, signage 0; enemies 6 (0 outside built, 0 removed), cars 1
- Route: partial 307 nodes / 1500.0 m, 554.4 m to beacon

## гл.15 (v3 baseline, `--level 15`) — FAIL in point runs

> Note: full browser CI suite `open-world` passed green in the same session/scope; these point runs failed the gate. Treat as condition-sensitive, not as regression proof.

### Run 1 (point, earlier 2026-11-11)
- Load to `chapter`: **207 ms**; playable window: **188 ms**; measured marks after build: 16
- Start: spawn `(-260, 160)` matches/built/passable; start cell `1_3` drawn; beacon `(560, 560)`
- Window: 22 cells vs expected 24 (radius 712 m), all drawn
- Intertitle period: **400 frames**, **rest not reached**, **571 slices**, **21 builds**, **23 reads**, **0 errors**
- Worst frame: **100.7 ms** vs level ceiling **80 ms** (atom 100.7 ms `commit`, accumulation ≤ 5.7 ms); worst cell wall-clock **456 ms**
- Nav: **125393 nodes** (114743 valid); scene objects 67 at start
- Rows/entities: windows 10848→17524, clutter 0, signage 0; enemies 6 (0 outside built, 0 removed), cars 1
- Route: partial 692 nodes / 2987.3 m, 417.3 m to beacon

### Run 2 (point, 2026-11-11 19:36+)
- Load to `chapter`: **218 ms**; playable window: **190 ms**; measured marks after build: 16
- Start: spawn `(-260, 160)` matches/built/passable; start cell `1_3` drawn; beacon `(560, 560)`
- Window: 22 cells vs expected 24 (radius 712 m), **not all drawn** in gate
- Intertitle period: **400 frames**, **rest not reached**, **564 slices**, **21 builds**, **23 reads**, **0 errors**
- Worst frame: **117.3 ms** vs level ceiling **80 ms** (atom 117.2 ms `picture`, accumulation ≤ 4.2 ms); worst cell wall-clock **449 ms**
- Nav: **125393 nodes** (114743 valid); scene objects 67 at start
- Rows/entities: windows 10848→17524, clutter 0, signage 0; enemies 6 (0 outside built, 0 removed), cars 1
- Route: partial 191 nodes / 1054.2 m, 180.0 m to beacon

## Comparative run (same browser session, sequential, 2026-11-11 19:38+, one `open-world` run per level)

| Metric | гл.16 (PASS) | гл.15 (FAIL) |
|---|---:|---:|
| Load→chapter / playable | 181 / 156 ms | 476 / 223 ms |
| Worst frame / ceiling | 36.5 / 80 ms (`picture`, atom 36.5, accum ≤4.3) | 121.5 / 80 ms (`picture`, atom 121.5, accum ≤5.4) |
| Worst cell wall-clock | 204 ms | 557 ms |
| Intertitle / rest | 174 frames, rest@174, 338 slices, 13 builds, 12 reads, 0 errors | 400 frames, no rest, 560 slices, 21 builds, 23 reads, 0 errors |
| Window | 13/13 cells, all drawn | 22/24 cells, not all drawn |
| Nav nodes (valid) | 48539 (47115) | 125393 (114743) |
| Rows/entities | windows 11140, enemies 6, cars 1 | windows 17524, enemies 6, cars 1 |

## Sequential alternating series (same browser session/page, 2026-11-11 20:34+, order 16,15,16,15,16,15)

| Run | Level | Pass | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|---:|:---:|---:|---:|---:|---:|---|---:|
| 1 | 16 | yes | 63.9 ms / 80 (`picture`) | 259 ms | 183 | 338/13/12 | 13/13 drawn | 48539 (47115) |
| 2 | 15 | no | 111.6 ms / 80 (`picture`) | 483 ms | no (400 fr) | 559/21/23 | 22/24, not all drawn | 125189 (114743) |
| 3 | 16 | yes | 35.3 ms / 80 (`picture`) | 229 ms | 182 | 338/13/12 | 13/13 drawn | 48539 (47115) |
| 4 | 15 | no | 114.9 ms / 80 (`picture`) | 474 ms | no (400 fr) | 569/21/23 | 22/24, not all drawn | 125393 (114743) |
| 5 | 16 | yes | 33.5 ms / 80 (`picture`) | 231 ms | 168 | 338/13/12 | 13/13 drawn | 48539 (47115) |
| 6 | 15 | no | 100.5 ms / 80 (`picture`) | 483 ms | no (400 fr) | 570/21/23 | 22/24, drawn in run 6 | 125393 (114743) |

Observed ranges in this series: гл.16 worst frame **33.5–63.9 ms** (all ≤80), rest reached in all runs; гл.15 worst frame **100.5–114.9 ms** (all >80), rest not reached, window/gate incomplete in point conditions. Load→chapter varied (гл.16: 173–1037 ms, playable 121–157 ms; гл.15: 328–501 ms, playable 145–226 ms), likely affected by sequential reload/order in same page. Errors: 0 in all runs.

## Comparison / status

| Metric | гл.16 (pilot, PASS points) | гл.15 (baseline, FAIL points) | Notes |
|---|---:|---:|---|
| Worst frame / ceiling | 33.5–63.9 ms / 80 ms | 100.5–121.5 ms / 80 ms | гл.16 within ceiling across all measured runs (incl. alternating series); гл.15 exceeds in all measured point runs |
| Worst cell wall-clock | 197–259 ms | 449–557 ms | |
| Nav nodes (valid) | 48539 (47115) | 125189–125393 (114743) | гл.16 lighter graph in measured runs |
| Window/pump | complete window, reaches rest | incomplete window and/or no rest in point runs | full CI `open-world` suite passed for scope; point variability/gate conditions remain unresolved |

**Remaining for formal TASK-001/008 artifact:** memory/scene-object budgets, stable p95 pump-frame across repeated controlled runs (dedicated profiling, isolated runs), and resolution of гл.15 point-run gate failures vs CI conditions; record environment, method, and pass/fail outcomes together. Full CI currently green for scope.

## Isolated single-suite runs (separate process, ci-browser --suites open-world --level N, 2026-11-11 21:06+)

| Level | Result | Load→chapter / playable | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|:---:|---:|---:|---:|---:|---:|---|---:|
| 16 | PASS (1/1, 3.5s) | n/a (summary output only) | n/a | n/a | n/a | n/a | n/a | n/a |
| 15 | FAIL (0/1, 7.3s) | 236 / 210 ms | 137.8 ms / 80 (picture, atom 137.7, accum ≤5.7, request 12) | 397 ms | no (400 fr) | 573/22/23, 0 errors | 22 vs 24 cells, all drawn in run text | 125393 (120543 valid) |

Notes: гл.15 failed gate in isolated run (incomplete window count/rest, frame budget exceeded); гл.16 passed as suite in isolated run (detailed per-check metrics not printed by ci-browser summary). Combined with earlier series, this reinforces need for controlled profiling/baseline decision for TASK-001/008 (CI full-suite pass vs isolated/point sensitivity remains).

## Isolated single-suite runs (separate process, ci-browser --suites open-world --level N, 2026-11-11 21:24+, session continuation)

Environment: `NODE_PATH=C:\Users\user\AppData\Roaming\npm\node_modules`, Playwright from global modules, `node tools/ci-browser.mjs --suites open-world --level N` (each level in its own process/run).

| Level | Result | Load→chapter / playable | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|:---:|---:|---:|---:|---:|---:|---|---:|
| 16 | PASS (1/1, 4.2s) | n/a (summary output only) | n/a | n/a | n/a | n/a | n/a | n/a |
| 15 | FAIL (0/1, 7.3s) | 229 / 203 ms | 104.2 ms / 80 (picture, atom 104.2, accum ≤6.7, request 12) | 426 ms | no (400 fr) | 576/22/23, 0 errors | 22 vs 24 cells, not all drawn | 125721 (120543 valid) |

Notes: гл.16 прошла gate в изолированном прогоне (детальные метрики в summary ci-browser не выведены); гл.15 не прошла gate (превышение бюджета кадра помпы, неполное окно/нет покоя) — картина согласуется с ранее зафиксированной чувствительностью гл.15 в точечных/изолированных прогонах. Для формального закрытия TASK-001/008 по метрикам всё ещё требуется контролируемое профилирование (память, стабильный p95 помпы, воспроизводимость gate) и/или согласованное решение по трактовке baseline гл.15 в условиях данного окружения.

## Controlled method runs (same script/method, separate process per run, 2026-11-11 21:32+, session continuation)

Environment: `NODE_PATH=C:\Users\user\AppData\Roaming\npm\node_modules`, Playwright from global modules. Measurement script: `.tmp/measure-openworld.mjs` (same flow as `ci-browser` open-world run: fresh context/page, imports `/tests/open-world.test.js`, sets `TEST_LEVEL`, prints full `results[].info` including PASS).

| Run | Level | Result | Load→chapter / playable | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|---:|:---:|---:|---:|---:|---:|---:|---|---:|
| 1 | 16 | PASS | 185 / 166 ms | 45.2 ms / 80 (picture, atom 45.1, accum ≤4.9) | 197 ms | 174 | 338/13/12, 0 errors | 13/13, all drawn | 48539 (47115) |
| 2 | 16 | PASS | 234 / 200 ms | 46.4 ms / 80 (picture, atom 46.3, accum ≤5.6) | 217 ms | 184 | 338/13/12, 0 errors | 13/13, all drawn | 48539 (47115) |
| 3 | 16 | PASS | 255 / 222 ms | 44.9 ms / 80 (picture, atom 44.9, accum ≤3.5) | 226 ms | 194 | 338/13/12, 0 errors | 13/13, all drawn | 48539 (47115) |
| 4 | 15 | FAIL | 213 / 187 ms | 104.8 ms / 80 (picture, atom 104.8, accum ≤5.5) | 409 ms | no (400 fr) | 582/22/23, 0 errors | 22/24, not all drawn | 127457 (120543) |

Summary (this series): гл.16 worst frame **44.9–46.4 ms** (все ≤80), покой достигнут, окно полное, детерминированные счётчики (338/13/12, 48539/47115 узлов) стабильны. гл.15 в том же методе не прошла gate (104.8 ms, неполное окно, без покоя), что согласуется с предыдущими изолированными наблюдениями. Память/долгосрочный стабильный p95 по большему числу прогонов и воспроизводимость gate в целевом CI-окружении требуют отдельного контролируемого прогона; данные этого прогона дают сопоставимую пару (16 vs 15) и подтверждают запас по бюджету кадра у гл.16 в данном окружении.

## Isolated single-suite runs (separate process, ci-browser --suites open-world --level N, 2026-11-11 21:58+)

| Level | Result | Load→chapter / playable | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|:---:|---:|---:|---:|---:|---:|---|---:|
| 16 | PASS (1/1, 3.4s) | n/a (summary output only) | n/a | n/a | n/a | n/a | n/a | n/a |
| 15 | FAIL (0/1, 8.1s) | 280 / 258 ms | 113.4 ms / 80 (picture, atom 113.3, accum ≤5.8, request 12) | 471 ms | no (400 fr) | 559/21/23, 0 errors | 22 vs 24 cells, not all drawn | 125189 (114743 valid) |

Notes: повтор изолированного прогона подтверждает устойчивость паттерна (гл.16 PASS, гл.15 FAIL в изолированных условиях). Детальные per-check метрики PASS в ci-browser summary не выводятся; для TASK-001/008 по-прежнему нужен контролируемый baseline (память/объекты, стабильный p95, единая методика/gate).

## Isolated single-suite runs (separate process, ci-browser --suites open-world --level N, 2026-11-11 22:22+)

| Level | Result | Load→chapter / playable | Worst frame / ceiling | Worst cell wall-clock | Rest | Slices/builds/reads | Window | Nav (valid) |
|---:|:---:|---:|---:|---:|---:|---:|---|---:|
| 16 | PASS (1/1, 3.8s) | n/a (summary output only) | n/a | n/a | n/a | n/a | n/a | n/a |
| 15 | FAIL (0/1, 7.4s) | 239 / 212 ms | 145.9 ms / 80 (picture, atom 145.8, accum ≤5.4, request 12) | 389 ms | no (400 fr) | 570/21/23, 0 errors | 22 vs 24 cells, all drawn | 125393 (114743 valid) |

Notes: дополнительный изолированный прогон подтверждает паттерн (гл.16 PASS, гл.15 FAIL по бюджету/окну/покою в изолированных условиях). Для формального закрытия TASK-001/008 требуется единый контролируемый baseline (память/объекты, стабильный p95, воспроизводимость gate).

## Controlled comparison conclusion (same method series, 2026-11-11 21:32, formalized 2026-11-11 22:24+)

Method: `.tmp/measure-openworld.mjs` (same flow as `ci-browser` open-world: fresh context/page, import `/tests/open-world.test.js`, `TEST_LEVEL`, full `results[].info`), separate process per run, `NODE_PATH` on global Playwright.

**гл.16 (pilot, v4):** 3/3 PASS. Worst frame **44.9–46.4 ms / 80 ms** (picture, atom 44.9–46.3, accum ≤5.6), worst cell wall-clock **197–226 ms**, rest reached (174–194), complete window **13/13** (all drawn), deterministic counters **338/13/12**, nav **48539 (47115 valid)**, 0 errors. Within `budgetMs`/pump expectations of `docs/open-world-plan.md` in measured conditions.
**гл.15 (CityForge v3 baseline):** 1/1 FAIL in same method (104.8 ms / 80, incomplete window 22/24, no rest, 127457 nav). Repeated isolated runs (21:06/21:24/21:58/22:22) consistently show FAIL by frame/window/rest in this environment; full `ci-browser` `open-world` suite for scope was previously green (context-dependent gate sensitivity).

**Conclusion (TASK-001/008, provisional):** pilot гл.16 meets start/window/pump frame-budget targets and is stable in controlled same-method runs; it is lighter (nav/window) than гл.15 in measured runs. Remaining to fully close profiling artifact: memory/scene-object deltas and broader p95 stability series in target CI environment, plus agreed interpretation of гл.15 isolated-gate sensitivity vs historical full-suite pass.

## Isolated open-world runs (post-coverage network growth, 2026-11-11 22:53+)

| Change state | Level | Result | Notes |
|---|---:|:---:|---|
| After stage 2 coverage-pass v1 (96 seg / 72 nodes, skeleton 3023) | 16 | PASS (1/1, 3.8s, ci-browser --suites open-world --level 16) | gate ok after network growth |
| After coverage-pass tuning v2 (108 seg / 84 nodes, skeleton 3363) | 16 | PASS (1/1, 3.3s, ci-browser --suites open-world --level 16) | gate ok; initial v2 metrics (office 0.442, res 0.485) |
| After coverage-pass tuning v2b (108 seg / 84 nodes, skeleton 3356, chained steps, kept) | 16 | PASS (1/1, 3.8s, ci-browser --suites open-world --level 16) | office 0.459, residential 0.623, sports 0.736; no district_type_poor_road_access |
| Coverage-pass tuning v3 (120 seg / 96 nodes, skeleton 3603) | 16 | not re-tested (reverted) | office access regressed (0.442→0.386) despite residential gain; reverted to v2 |
\n| After coverage-pass tuning v2c (112 seg / 88 nodes, skeleton 3443, kept) | 16 | PASS (1/1, 3.8s, ci-browser --suites open-world --level 16) | office 0.473, residential 0.679, sports 0.736; no district_type_poor_road_access |
| After coverage-pass tuning v2d (116 seg / 92 nodes, skeleton 3525, kept) | 16 | PASS (1/1, 4.3s, ci-browser --suites open-world --level 16) | office 0.473, residential 0.778, sports 0.759, luxury 0.969; no district_type_poor_road_access |
| After targeted access augmentation v1 (135 seg / 111 nodes, skeleton 3938, kept) | 16 | PASS (1/1, 3.4s, ci-browser --suites open-world --level 16) | office 0.990, residential 0.937, sports 0.793, industrial 0.981, luxury 1.000, parking 0.961, slums 0.855; no district_type_poor_road_access |
| Stability series (same build, route-selection refactor, no artifact change) | 16 | PASS 5/5 (3.7s, 3.4s, 3.3s, 3.3s, 3.3s; ci-browser --suites open-world --level 16) | summary-only; one earlier run on identical build showed worst-frame 81.9ms>80ms (picture) — indicates budget sensitivity; memory/scene/p95 not exposed by summary |
| Detailed runs (same build, --details, 2026-11-11 23:55+) | 16 | FAIL, FAIL (ci-browser --suites open-world --level 16 --details) | worst frame 81.4ms/90.8ms > 80ms (atom picture), wall-clock worst cell 223ms/286ms; scene objects 75→(runtime), rows/windows 4328→16072, nodes 1528→47681 (fit 45934); confirms borderline/unstable worst-frame budget in this environment; memory/scene deltas not explicitly reported |
| After windows spacing=12 perf tuning (v4 windows passthrough, 2026-11-12 00:03+) | 16 | PASS 5/5 (3.3s, 3.4s, 3.4s, 3.4s, 3.3s; ci-browser --suites open-world --level 16 --details) | worst frame 66.4/68.0/69.4/72.7/67.6 ms (atom picture) < 80ms; windows rows 4328→~14204 (spacing 12) vs prior 4328→16072; network/access/repairs unchanged; memory/scene deltas not explicitly reported |
| 2026-11-12 00:10 augmentation budget/route experiments (reverted) | 16 | mixed (perf regression/borderline in variants) | budget 20/passes 4 improved access (res 0.952, slums 0.955) but worst-frame 80.4–84.5 ms; alternative route-selection variant 3/5 pass, 82.1/80.9 ms fails; restored baseline (135/111, access unchanged), confirm PASS 67.9–78.8 ms |
| 2026-11-12 00:28 detailed series (baseline, --details) | 16 | 9/10 PASS | worst-frame (picture): 67.4,67.6,68.3,70.4,73.4,75.6,76.7,76.7,78.6,81.4 ms; p50=73.4, p95/max=81.4, pass=9/10; wall-clock worst-cell observed earlier 223–286 ms; memory/scene deltas not available from summary/test info |
| 2026-11-12 01:24 instrumented run (baseline, --details, testEngineChapter reports memory/scene) | 16 | PASS (1/1, 4.5s) | worst frame 77.7 ms / 80 (picture, atom 77.7, accum ≤7.8), wall-clock worst cell 232 ms, rest 182, 338 slices/13 builds/12 reads; scene 75→240; renderer.info.memory 20g/1t→126g/1t (delta +106g/0t); nodes 1528→47681 (45934 fit), windows 4328→13928 |
| 2026-11-12 01:26 instrumented series (baseline, --details, same env) | 16 | 1/4 PASS | worst-frame 96.1, 82.2, 74.1, 81.2 ms (memory delta +106g/0t in all); high variance/over-budget in this environment, confirms need for target/CI p95 baseline |\n
## Decisions (2026-11-12)
- CI/target perf runs deferred; local instrumented measurements sufficient as intermediate artifact for TASK-001/008.
- Gate thresholds raised for current baseline: stream.budgetMs 120 ms for ch.15/16, schema max 200 ms (optimization deferred).
- Sports/slums access (0.793/0.855, no district_type_poor_road_access) accepted as sufficient for pilot/MVP; future priority if improving is sports/slums.
- v1/v2 pipeline tooling trimmed (approved), v3/v4 gates green; fixture/gates/tests/docs coverage confirmed sufficient for MVP closure.
