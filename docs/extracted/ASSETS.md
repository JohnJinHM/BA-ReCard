# Extracted Asset Catalogue — Arsenal Unit Info Card

Source: AssetRipper export of Broken Arrow (Unity 2022.3) at
`C:\Users\jinha\Desktop\Temp\BA\ExportedProject`

All paths below are relative to `C:\Users\jinha\Desktop\Temp\BA\ExportedProject\` unless absolute.

---

## 1. Infocard Config

**File:** `Assets\MonoBehaviour\Infocard Config.asset`
(duplicates `Infocard Config_0.asset` / `Infocard Config_1.asset` are byte-identical, 4336 bytes each — ignore them)

Script: `{fileID: 447462697, guid: d4d56b31bc24c68036edf0a9757ac99a}` → `Assets\Plugins\BrokenArrow.dll` (class not exported as source; fields readable from YAML).

### Scalar config

| Field | Value |
|---|---|
| `EffectiveRangeMultiplier` | `2` |
| `MinimalSensorRange` | `0` |
| `RoundDigits` | `2` |

### Sprite mappings (GUID resolved to exported asset path)

Every reference is `{fileID: 21300000, guid: …, type: 2}` (a standalone Sprite asset). Each resolved `.asset` has a **same-named `.png` in the same folder** — that png is the file an extraction script should copy.

Base path for most: `Assets\Prefabs\GUI\HUD\Images\` (abbreviated `IMG\` below).

#### Card chrome

| Config field | GUID | Resolved sprite asset |
|---|---|---|
| PinnedImage | b8df24240c06c254dbfe86547c884d34 | `IMG\Menu\pinned.asset` |
| UnpinnedImage | 1f0264403d510ce4ab3653f2d5ea10c9 | `IMG\Menu\pin.asset` |
| ExpandDownIcon | 16fff288d84f19042a53c3415d3d806e | `IMG\collapse.asset` |
| ExpandUpIcon | d9a8cbffd2601ba4c9b15754ede9569f | `IMG\expand.asset` |

#### General stats (`IMG\Infocard\General icons\`)

| Config field | GUID | Sprite asset (in `General icons\`) |
|---|---|---|
| Armor | 8f9670792cdb179498aaffb0ff6b13c5 | `Armor.asset` |
| Health | 023849787ee2471478adf39301240e40 | `Health points.car.asset` |
| HealthInfantry | 0d31961fead5f9942b65a755afca140a | `Health points.inf.asset` |
| SoldierCount | 960d3d971ce15504095f9b573f4c8d4b | `group.asset` |
| HeavyLift | a99b97f5d3e7f0a47bdcefc0b87d893a | `Load capacity.asset` |
| SeatsCount | 68f5d43be8c5f1840b72b0bab6aacd48 | `Seats.asset` |
| Optics | a50e25ffb9aa7f342aeb5fd0803f9ab7 | `Optics.asset` |
| Stealth | 9370b30691533bc459e5d362128bb448 | `Stealth.asset` |
| SpeedForwardVehicles | 132ae39c38b79d5418f1315770a02cf3 | `Forward speed.car.asset` |
| SpeedBackwardVehicles | 618c5e626e9110743bec3aaf4c5dd977 | `Speed backwards.car.asset` |
| SpeedForwardHelicopters | f99f295c628dff74d9a03db4dda2b9ba | `Forward speed.hel.asset` |
| SpeedForwardAircrafts | 96dfe6a8884fdd443b667e238d1a827a | `Forward speed.air.asset` |
| SpeedForwardInfantry | 6611cc0633def3b499f24742bb6c4ebd | `Forward speed.inf.asset` |
| AgilityHelicopters | 4522af8b44bd8d54ba284c8715d11690 | `Agility turn rate.hel.asset` |
| AgilityPlanes | e7d693179c32c3f4c83c7a93eba0c1ac | `Agility turn rate.air.asset` |
| Fuel | 507e2654c592a464dadb2051ecac65d2 | `Fuel.asset` |
| Weight | 411513d699529234fab009be3b1d1d3b | `Weight.asset` |
| Amphibious | 1322b87180d65c44584e4c876bcb3a85 | `Amphibious.asset` |
| Airdrop | d5c3118f84b52264fae3c9060899ff45 | `airdrop.asset` |

#### Special abilities/traits (`IMG\Infocard\Special icons\` unless noted)

| Config field | GUID | Sprite asset |
|---|---|---|
| LaserDesignation | dfd09aaacb2e83649af3fad8ba64ca9e | `Laser designation.asset` |
| Smoke | 6285e9b2d73a7d9429877d90ac117ba0 | `Smoke screen.asset` |
| Sprint | dc5b2d6c55a478e4f8d90a4097a8627b | `Sprint.asset` |
| Aps | b9f31f8c56427854399c4a4a55949c8f | `APS.asset` |
| DecoyCommon | 3edda58bad4988b41bb10851f000a745 | `Countermeasures.asset` |
| DecoyAircrafts | 853b238c08330a746a3755311ef69e61 | `Countermeasures.air.asset` |
| DecoyHelicopters | fdf24899903e9454493d966ef9a660f3 | `Countermeasures.hel.asset` |
| Ecm | 83923b6da8aa9c641ad2760e0df69756 | `ECM.asset` |
| AntiRadar | c34fb2f217215794e824ccc3b4722328 | `Anti-radar Icon.asset` |
| ClusterType | 9b6285bf9cf0c244fac637abc136a8f3 | `Cluster Ammo Icon.asset` |
| Napalm | c43e13d738860f945ad20f911bc4ccd4 | `Napalm Icon.asset` |
| Radar | 19e80f0bff2bd5a49a421777ff60c023 | `IMG\ActionPanel\Ability_Radar.asset` |
| Autoloading | 355345b4e606fca4d86eef88a5cbc77c | `IMG\Infocard\Icons for weapon\reload.asset` |
| CanShootOnTheMove | f979929ce93cabd4b8fe5e3b9712487a | `IMG\ActionPanel\Order_Stop.asset` |

#### Ammo type icons

| Config field | GUID | Sprite asset |
|---|---|---|
| KineticType | 97823626a170bfd41a4b55e7bad0d403 | `IMG\Menu\Kinetic.asset` |
| HeatType | 2cb360ab235ddda40a3d91289cbe69e8 | `IMG\Menu\HEAT.asset` |
| SmokeType | 89b1165dc77bca54cb6ff012313c5c28 | `IMG\ActionPanel\FireMission\FM_Ammo_Smoke.asset` |

#### Target type icons (`IMG\Infocard\Target type icons\`)

| Config field | GUID | Sprite asset |
|---|---|---|
| TargetTypeInfantry | daa930b86f0fb2d43b4be66e814617c8 | `Target Type Infantry Icon.asset` |
| TargetTypeVehicles | 89273ddf3ad48bb4f96bd1bd24a04e8f | `Target Type Vehicles Icon.asset` |
| TargetTypeHelicopters | 95c98f8053df00e4ba63ca02b5f0efde | `Target Type Helicopters Icon.asset` |
| TargetTypeAircrafts | db961a0de5db3804eadedc24274ba301 | `Target Type Aircrafts Icon.asset` |
| TargetTypeProjectiles | baa28cc81624a67428d82c0f9bb982f8 | `Target Type Missiles Icon.asset` |
| TopAttack | 4ded5d3ee192d1144a26bfafca57d12b | `Top Attack Type Icon.asset` |

---

## 2. Sprite storage mechanism

- `Assets\Sprite\` contains **1447 Sprite `.asset` YAML files** (plus 1447 `.meta`). **No pngs live in that folder.** These are AssetRipper's flat dump of Sprite objects; each references its Texture2D by GUID at `m_RD.texture`.
- The 1447 sprites reference **1294 distinct texture GUIDs** — i.e. overwhelmingly **1:1 sprite→texture (no shared atlases)**; a small number of textures host 2+ sprite variants.
- The pngs themselves were exported in two places:
  1. **Flat dump:** `Assets\Texture2D\` — 8860 pngs (every texture in the game).
  2. **Reconstructed source tree:** `Assets\Prefabs\GUI\HUD\Images\...` and `Assets\Resources_moved\Images\...` — Sprite `.asset` + same-named `.png` side by side. These duplicate the Sprite/Texture2D dumps but with meaningful folder structure. **Prefer these for extraction.**
- The Sprite `.asset` carries `m_Rect` / `m_RD.textureRect` — a crop rect inside the png (icons have a few px of transparent padding, e.g. Unity's mesh-tight rect). For web use you can generally use the whole png; the rect only matters for pixel-exact cropping.

### Worked example: `Ability_Afterburner`

- Sprite asset: `Assets\Sprite\Ability_Afterburner.asset`
- `m_RD.texture` guid `a091be110fd45354ca979a8fa56823d4` → `Assets\Texture2D\Ability_Afterburner.png` (160×160, 32-bit RGBA)
- `textureRect`: x=6.0761, y=1.0761, w=152.8478, h=152.8478 (tight bounds inside the 160×160 png)
- Duplicate structured copy: `Assets\Prefabs\GUI\HUD\Images\ActionPanel\Ability_Afterburner.png` (identical 160×160) + `.asset`.

Second example (from Infocard Config): `Armor` sprite → texture guid `2eb149b9fa42777449669e8342e06ec2` → `Assets\Prefabs\GUI\HUD\Images\Infocard\General icons\Armor.png` (128×128 RGBA), textureRect x=12.05, y=0.076, w=107.91, h=121.85.

---

## 3. Card-relevant sprite inventory

### Infocard icon tree — `Assets\Prefabs\GUI\HUD\Images\Infocard\` (png + .asset pairs)

- Root: `HEAT Armor Icon.png`, `Kinetic Armor Icon.png`, `Points Icon.png`
- `Category icons\` (4): `ammo type`, `damage`, `effective range`, `penetration`
- `Critical Effects\` (4): `Loading Icon`, `Mobility Icon`, `Optics Icon`, `Targeting Icon`
- `General icons\` (19): all general stat icons listed in §1 (128×128 typical)
- `Icons for weapon\` (5): `anti-car`, `anti-down.air`, `anti-up.air`, `deployment`, `reload`
- `Modification icons\` (2): `Modification Armor Slot Icon`, `Modification Icon`
- `Special icons\` (17): `Afterburner`, `Anti-radar Icon`, `APS`, `Cluster Ammo Icon`, `Countermeasures[.air|.hel]`, `deployment`, `ECM`, `Explosive charge`, `Laser designation`, `Mini drone`, `Napalm Icon`, `Smoke screen`, `Sprint`, `Stay hidden`
- `Target type icons\` (6): the 5 target types + `Top Attack Type Icon`

### `Assets\Sprite\` flat dump (1447 sprites) — naming conventions

| Prefix / pattern | Count | Examples |
|---|---|---|
| `Ability_*` (+ `_Blur` variants) | 16 | `Ability_Afterburner`, `Ability_Aps`, `Ability_Flares`, `Ability_LaserDesignation`, `Ability_Radar`, `Ability_RadarOff`, `Ability_Smoke`, `Ability_Sprint` |
| `Order_*` (+ `_Blur`) | 41 | `Order_Airdrop`, `Order_AltitudeHeli_Up/Down`, `Order_AltitudePlane_Up/Down`, `Order_Attack`, `Order_Stop`, … |
| `Trait_*` / `Stat_*` | 0 | (do not exist — infocard stat icons use the human-readable names above) |
| Target/armor icons | 6+2 | `Target Type {Infantry,Vehicles,Helicopters,Aircrafts,Missiles} Icon`, `Top Attack Type Icon`; `Kinetic Armor Icon`, `HEAT Armor Icon` |
| Ammo type | 4+ | `Kinetic`, `HEAT`, `FM_Ammo_Expl`, `FM_Ammo_Smoke` (+ `_Blur`) |
| Country/team flags | 32 | `usa flag`, `rus flag`, `random flag`, `Flag {blue,red,green,…} {1-3}` (in-game team flags) |
| Faction specs `SPEC_*` | 13 | `SPEC_US_Armored`, `SPEC_RU_VDV`, `SPEC_DLC2_Baltic`, … |

Note the game's UI convention: stat/trait icon sprites have **plain-English names** with class suffixes `.car` / `.inf` / `.hel` / `.air` (e.g. `Forward speed.car`, `Health points.inf`, `Countermeasures.air`).

### `Assets\Resources_moved\Images\` (structured, png + .asset pairs)

| Folder | Count | Notes / example |
|---|---|---|
| `UnitPortraits\` | 1303 pngs, 433 unit dirs | See §5 |
| `Weapons\Icons\` | 984 pngs | weapon silhouettes, e.g. `2A72.png` 232×88 |
| `Ammunition\Icons\` | 295 pngs | `AMMO_*.png`, e.g. `AMMO_AIM9M.png` 288×56 |
| `Labels\Icons\` | 1157 pngs | unit thumbnails `<Name>-Label.png` (matches `Units.ThumbnailFileName`, e.g. `RU_BTR82-Label` → `RU_BTR82-Label.png` 416×216) |
| `Modifications\` | 200 pngs | `MOD_*.png`, loadout icons |
| `Nations & Specs\Flags\` | 6 | `usa flag.png`, `rus flag.png`, `rus flag 2.png`, `mixed flag.png`, `random flag.png`, `flag.png` — **country flags for the card** |
| `Nations & Specs\Specs\` | 14 + `small\` + `illustrations\` | `SPEC_US_Armored.png`, `SPEC_RU_VDV.png`, … |
| `Dlc\` | 3 | shop art |

---

## 4. Fonts

**Source font files** in `Assets\Font\` (ttf/otf all exported):

- **Inter** (the UI family): `Inter-Thin/ExtraLight/Light/Regular/Medium/SemiBold/Bold/ExtraBold/Black.ttf` + `Inter-VariableFont_slnt_wght.ttf` (+ two `-Legacy Dynamic` copies)
- **Sora**: full weight set + variable font (used elsewhere in menus)
- Fallbacks/CJK: `Arial Unicode MS.ttf`, `NotoSerifCJK-*.ttf`, `NotoSerifCJKsc-*.otf`, `LiberationSans.ttf`, `Roboto-Regular/Bold.ttf`, `NotInter-Regular.ttf`, `PerfectDOSVGA437.ttf`

**TMP FontAssets**: `Assets\MonoBehaviour\* SDF*.asset` (flat dump) and structured copies in `Assets\Resources_moved\Fonts\Inter\`.

**Fonts actually used by the Arsenal Unit Info Card** — resolved from `m_fontAsset` GUIDs in `Assets\Prefabs\GUI\Arsenal\Infocard\Unit Info Card.prefab`:

| Uses | TMP asset (in `Assets\Resources_moved\Fonts\Inter\`) | GUID |
|---|---|---|
| 11 | `Inter-ExtraBold SDF - shadow.asset` | 528b2926b154e37449426a9511420ca5 |
| 5 | `Inter-Regular SDF - shadow.asset` | d61628bbb312780458dc780a6fc5e35b |
| 3 | `Inter-Medium SDF - shadow.asset` | dc5957aeb9410434a9841d5c7f1e1587 |
| 2 | `Inter-SemiBold SDF - shadow.asset` | 15140430b7953e3438975cc41d6e450c |
| 1 | `Inter-Medium SDF.asset` | b2deb9a678248184d9ae5be447003555 |

→ Web recreation: **Inter** (Regular/Medium/SemiBold/ExtraBold), Google Fonts or the exported ttfs.

**Related infocard prefabs** (same folder, `Assets\Prefabs\GUI\Arsenal\Infocard\`): `Unit Info Card.prefab`, `Unit Info Card Stats item.prefab`, `Unit Info Card Unit Stats Item.prefab`, `Unit Info Card Ammo Info.prefab`, `Unit Info Card Compact Weapon Info.prefab`, `Unit Info Card Abilities Item.prefab`, `Unit Info Trait Item.prefab`, `Unit Info Missiles Trait Item Variant.prefab`, `Unit Ammo Compact Info.prefab`, `Unit Missiles Bombs Compact Info.prefab`, `Unit Modifications Panel.prefab`, `Unit Options Panel.prefab` — read these for exact layout/colors/font sizes.

---

## 5. Unit portraits

**Location:** `Assets\Resources_moved\Images\UnitPortraits\<COUNTRY>\<UNIT>\`
Country dirs: `US`, `RU`, `DLC2`, `WIP_INFANTRY`, `Zombie`. 433 unit dirs, 1303 pngs total.

`Units.PortraitFileName` (e.g. `"RU\\BTR_82A\\BTR_82A"`) maps directly to this tree:
`UnitPortraits\RU\BTR_82A\BTR_82A.png`.

Each unit dir holds three variants (each also has a Sprite `.asset` twin):

- `<UNIT>.png` — default portrait
- `<UNIT>_BASIC.png` — basic/unselected variant
- `<UNIT>_HOVER.png` — hover variant

**Format/size (sampled `RU\BTR_82A`):** all three are **816×550 PNG, 32-bit RGBA**.

`Units.ThumbnailFileName` (e.g. `"RU_BTR82-Label"`) maps to
`Assets\Resources_moved\Images\Labels\Icons\<ThumbnailFileName>.png` (416×216 sampled).

Portraits are NOT duplicated in the flat `Assets\Texture2D\` dump under obvious names — extract from `Resources_moved`.

---

## 6. Extraction cheat-sheet

Copy sources (absolute):

- Stat/trait/ammo/target icons: `C:\Users\jinha\Desktop\Temp\BA\ExportedProject\Assets\Prefabs\GUI\HUD\Images\Infocard\**\*.png` (~57 pngs, 128×128 typical, RGBA, few px transparent padding)
- Card chrome: `...\Images\Menu\{pinned,pin,Kinetic,HEAT}.png`, `...\Images\{collapse,expand}.png`, `...\Images\ActionPanel\{Ability_Radar,Order_Stop}.png`, `...\Images\ActionPanel\FireMission\FM_Ammo_Smoke.png`
- Portraits: `...\Assets\Resources_moved\Images\UnitPortraits\<PortraitFileName>.png` (816×550)
- Thumbnails: `...\Assets\Resources_moved\Images\Labels\Icons\<ThumbnailFileName>.png` (416×216)
- Weapon icons: `...\Assets\Resources_moved\Images\Weapons\Icons\*.png`
- Ammo icons: `...\Assets\Resources_moved\Images\Ammunition\Icons\AMMO_*.png`
- Flags: `...\Assets\Resources_moved\Images\Nations & Specs\Flags\*.png`
- Fonts: `...\Assets\Font\Inter-*.ttf`

Optional exact-crop: parse `m_RD.textureRect` from the sibling `.asset` YAML and crop the png to `(x, pngHeight - y - height, width, height)` (Unity rect origin is bottom-left).
