# [BA-ReCard](https://johnjinhm.github.io/BA-ReCard/)

Reconstruct Broken Arrow's **unit info cards** — render a faithful card from
unit data, support manual edits and image import, and export to PNG.

Data source: **[BA-Units](https://github.com/JohnJinHM/BA-Units)**

Built with **React + TypeScript + Vite**, deployed to GitHub Pages.

> 🇨🇳 [中文](README_CN.md)

## Contents

```
src/
  data/        table types, loader/indexes (GameDb), unit→card resolver
  card/        CardModel (the editable view model) + the card renderer
  state/       zustand store (selection, variants, edits, compact mode)
  ui/          unit picker, variant panel, portrait crop dialog
  export/      DOM → PNG rasterizer (html-to-image, 2× pixel ratio)
public/
  data/        game database dump (24 tables + localization, from BA-Units)
  assets/      extracted game assets (icons/chrome/weapons/ammo/flags/
               portraits/thumbnails/fonts) — produced by scripts/extract-assets.mjs
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

To refresh assets, re-run AssetRipper on the game, then:

```sh
node scripts/extract-assets.mjs <path-to-ExportedProject>
```

To refresh the database, run [BA-Units](https://github.com/JohnJinHM/BA-Units)
and replace `public/data/`.

## How it works

1. `loadGameDb()` fetches all 24 tables + localization and builds id/FK indexes.
2. `resolveCard(db, unitId, selection)` joins a unit's armor/mobility/sensors/
   abilities/turrets/weapons/ammo, applies the selected Modification **Options**
   (armor/mobility/turret/cost/name overrides — the in-game variant system),
   and emits a plain `CardModel` where every visible value is a string.
3. `UnitCard` renders the `CardModel` to match the in-game prefab: 408×710,
   hero portrait bar (name, points, abilities, armor, stat icons) over a
   two-column weapons area; compact mode swaps in the dense per-weapon rows.
4. **Edit mode** turns every value on the card into a contentEditable span —
   edits mutate the `CardModel` copy, so anything can be overridden (or set
   to `-`).
5. **Import image…** uploads an image through a crop dialog fixed to the in-game
   816×550 portrait frame.
6. **Export PNG** rasterizes the card DOM at 2× with edit outlines hidden.

## Documentation

- [docs/DATA_SCHEMA.md](docs/DATA_SCHEMA.md) — the 24 JSON tables extracted from
  the game's `DataBaseCompiled.asset` and how they join.
- [docs/INFOCARD_SCHEMA.md](docs/INFOCARD_SCHEMA.md) — how the in-game
  `UnitInfoCard` controller and its prefabs map to database fields (expanded vs
  compact).
- [docs/extracted/PREFAB_LAYOUT.md](docs/extracted/PREFAB_LAYOUT.md) — card
  geometry, palette, and fonts extracted from the prefab YAML (408×710 spec).
- [docs/extracted/ASSETS.md](docs/extracted/ASSETS.md) — the extracted asset
  catalogue and `InfocardConfig` sprite mapping.

## Roadmap

- [x] Data loader + join layer over `public/data/tables/`
- [x] Unit → card view model
- [x] Expanded card renderer
- [x] Compact card renderer
- [x] Manual edit support
- [x] Image import with crop (816×550)
- [x] PNG export
- [x] Sprite/font asset pipeline from the game export
- [x] Localization toggle (eng/chi)
- [x] Customizable weapon slots (add/remove, edit counts)
- [x] Weapon slot fill: pick a weapon from the database (icon + name + type) or
      upload a custom icon
- [x] Tag-icon slots (4): pick from the icon library or upload
- [x] Custom card database (save/load edited cards as JSON in localStorage)
