# Level Visualizer

Read-only dev tool for inspecting CityForge/open levels (`src/levels/level-NN.json` + `src/levels/level-NN/`).

## Run

From repository root:

```bash
python -m http.server 8124
```

Open: `http://localhost:8124/tools/level-visualizer.html?level=19`

`file://` is not supported (importmap).

## Modes

- `source` — authored/source data only (roads/nodes/buildings/props/lights from JSON, districts from `generator.districts`).
- `compiled` — what is actually built (decoded `chunk-*.l14b` + skeleton + report). Default when catalog exists.
- `compare` — compiled + source matching context (declared-missing checks, provenance/source pointers).

The source JSON is always loaded (it provides plate/bounds/anchors/district geometry/pointers).

## Supported levels

Registry levels: `07, 08, 09, 10, 15, 16, 17, 18, 19` (`kind: open`).  
Files use zero-padding: `level-07.json`, `level-09.json`.

- v3 (`07,08,09,10,15`): no `generation-report.json`, no `generator.districts` — district/report layers degrade gracefully.
- v4 (`16,17,18,19`): report available. Levels 16/17 have 16 auto-districts in report but **no persisted geometry** (shown as list / inferred hull marker when possible, never as fake source polygons). Levels 18/19 have authored `d0` rect geometry.

## Views & controls

- Views: `1` top (plan XZ), `2` front, `3` side, `4` free (orbit).
- `F` focus selection, `Shift+F` facade/profile focus, `R` reset, `Backspace` back, `Esc` clear.
- `G` grid, `L` labels, `/` search, mouse wheel zoom, MMB/RMB pan (ortho), OrbitControls in free.
- URL state: `?level=&mode=&view=&labels=&grid=&budget=`. `Copy link` copies current URL. `Reload` refetches with cache-bust.

## Provenance & legend

Color = editability/class:
- **authored** — declared in source / editable identity (including split road parts with `parentId`)
- **generated** — created by stages (`tr_*`, `b_*`, `sl_*`, stage-5 `prop_*`, auto-districts)
- **derived** — deterministic compiler/normalizer output (`*_a/_b` splits, `*_pad`, `pillar_*`, tunnel portal pads, skeleton/chunks as engine data)
- **unknown** — unmatched

Notes:
- All `pillar_*` props are derived from decks (report may show `props: 0` for stage 5 only).
- `prop_<n>` in 16/17 is stage-5 generated even if `source: "authored"` appears in data.
- `roads[].pillars` duplicates top-level props and is not rendered separately.
- Dedupe uses `owner === true` as primary marker; `index.cells[].objects` are instances, not unique.

## Limitations

- Data visualization (decks/footprints/skeleton), not the game’s runtime render/collision/nav result.
- Source may declare `coordinateSystem.up: "Z"` while data is Y-up; visualizer normalizes to Y-up and warns.
- Auto-district geometry is not persisted in 16/17 reports/chunks (pipeline change needed for true polygons, TASK-009).
- After rebuilding level catalogs, browser ESM/import caches may keep old chunks: use **Reload** or hard refresh (Ctrl+F5).
- Relief layer is an approximate context from `map.relief.hills`, not collision terrain.

## Tests

Pure model tests (Node, no Three/DOM):

```bash
node --test tools/visualizer/model.test.mjs
```

Covers zero-pad, `LEVEL_NUMBERS`, grid/provenance/district/label helpers, and integration counts/matching for levels 07/09/16/18/19.
