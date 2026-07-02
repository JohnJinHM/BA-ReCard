# BA-ReCard

Reconstruct Broken Arrow's **Arsenal unit info cards** (expanded + compact) for
content creators — render a faithful card from unit data, allow manual edits,
and export to PNG.

Built with **React + TypeScript + Vite**, deployable to GitHub Pages.

## Contents

```
src/
  data/        table types, loader/indexes (GameDb), unit→card resolver
  card/        CardModel (the editable view model) + the card renderer
  state/       zustand store (selection, variants, edits, compact mode)
  ui/          unit picker, variant panel, portrait crop dialog
  export/      DOM → PNG rasterizer (html-to-image, 2× pixel ratio)
public/
  data/        game database dump (24 tables + localization, from BA-UnitDump)
  assets/      extracted game assets (icons/chrome/weapons/ammo/flags/
               portraits/thumbnails/fonts) — produced by scripts/extract-assets.mjs
scripts/
  extract-assets.mjs   copies/recompresses card assets from the AssetRipper export
  dev-screenshot.mjs   Playwright smoke test against the dev server
docs/
  DATA_SCHEMA.md       the 24 tables and their join map
  INFOCARD_SCHEMA.md   the in-game card controller/prefab → data mapping
  extracted/
    PREFAB_LAYOUT.md   extracted card geometry, colors, fonts (408×710 spec)
    ASSETS.md          extracted asset catalogue + InfocardConfig mapping
```

## Development

```sh
npm install
npm run dev        # http://localhost:5173/BA-ReCard/
npm run build      # type-check + production build to dist/
npm run deploy     # build + publish dist/ to the gh-pages branch
```

To refresh assets after a game patch, re-run AssetRipper on the game, then:

```sh
node scripts/extract-assets.mjs <path-to-ExportedProject>
```

To refresh the database, re-run BA-UnitDump and replace `public/data/`.

## How it works

1. `loadGameDb()` fetches all 24 tables + localization and builds id/FK indexes.
2. `resolveCard(db, unitId, selection)` joins a unit's armor/mobility/sensors/
   abilities/turrets/weapons/ammo, applies the selected Modification **Options**
   (armor/mobility/turret/cost/name overrides — the in-game variant system),
   and emits a plain `CardModel` where every visible value is a string.
3. `UnitCard` renders the `CardModel` to match the in-game prefab: 408×710,
   hero portrait bar (name, points, abilities, armor overlay, stat icons) over
   a two-column weapons area; compact mode swaps in the dense per-weapon rows.
4. **Edit mode** turns every value on the card into a contentEditable span —
   edits mutate the `CardModel` copy, so anything can be overridden (or set
   to `-`).
5. **Portrait…** uploads an image through a crop dialog fixed to the in-game
   816×550 portrait frame.
6. **Export PNG** rasterizes the card DOM at 2× with edit outlines hidden.

## Fidelity notes

- Layout numbers, palette (`#1E1E1E` / `#E7F8E5` / `#F4D42A` / `#F66B06`),
  and Inter font sizes come from the extracted prefabs
  (docs/extracted/PREFAB_LAYOUT.md).
- Icons follow the game's `InfocardConfig` sprite map; ranges, blast radius and
  dispersion are displayed with its `EffectiveRangeMultiplier` (×2); damage,
  speeds, optics and weight display raw (calibrated against `/samples`).
- `Options.Cost` is a delta on base cost; `ReplaceUnitId` swaps the base unit.
- `Units.CategoryType` is **0-based** in the shipped database (0=Recon …
  6=Aircrafts) even though the native enum dump reads 1-based.
- Card labels use the game's own localization keys (`ui_infocard_*`,
  `ui_enum_*`), so the language toggle (eng/chi) localizes the whole card.

## Roadmap

- [x] Data loader + join layer over `public/data/tables/`
- [x] Unit → card view model (apply Options/Modifications for variants)
- [x] Expanded card renderer
- [x] Compact card renderer
- [x] Manual edit support (all fields editable in place)
- [x] Portrait upload with crop (816×550)
- [x] PNG export (2×)
- [x] Sprite/font asset pipeline from the game export
- [ ] Weapon trait rows / ammo panel fine-tuning vs in-game screenshots
- [ ] Custom card database (save/load edited cards as JSON in localStorage)
- [ ] Weapon icon replacement in edit mode (upload custom weapon logo)
- [ ] Localization toggle (eng/chi)
