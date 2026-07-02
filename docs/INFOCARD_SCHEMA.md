# Info Card schema — the Arsenal unit card

Reference for reproducing the in-game **unit info card** under the Arsenal view.
Covers the layout (prefabs), the controller that fills it (`UnitInfoCard`), the
expanded vs compact split, and which database field feeds each element.

The data fields referenced here come from `data/` (see
[DATA_SCHEMA.md](DATA_SCHEMA.md)). The asset paths below point into the
**game's AssetRipper export** — they are the visual reference for the layout and
the source of the sprites/prefabs you'll port into this project; they are not
shipped in this repo.

## Source locations (in the game asset export)

| Piece | Path (in the AssetRipper export) |
|-------|------|
| Card prefabs | `Assets/Prefabs/GUI/Arsenal/Infocard/` |
| Controller (decompiled) | `BrokenArrow.Client.Ecs.UI.Menu.Arsenal.InfoCard.UnitInfoCard` |
| Stat/trait → sprite map | `Assets/MonoBehaviour/Infocard Config.asset` (`InfocardConfig`) |
| Icon sprites | `Assets/Sprite/*.asset` (named, e.g. `Ability_Afterburner`) |

### Prefabs in `Arsenal/Infocard/`

| Prefab | Role |
|--------|------|
| `Unit Info Card.prefab` | **Root card** (expanded). Hosts every section + the compact bar. |
| `Unit Info Card Abilities Item.prefab` | One ability/trait row. |
| `Unit Info Card Stats item.prefab` / `Unit Info Card Unit Stats Item.prefab` | A `label : value` stat line. |
| `Unit Info Card Ammo Info.prefab` | Expanded ammo panel (full damage model). |
| `Unit Info Card Compact Weapon Info.prefab` | **Compact** per-weapon block. |
| `Unit Ammo Compact Info.prefab` | **Compact** ammo row. |
| `Unit Missiles Bombs Compact Info.prefab` | **Compact** missiles/bombs row. |
| `Unit Info Trait Item.prefab` / `Unit Info Missiles Trait Item Variant.prefab` | Trait icon chips. |
| `Unit Modifications Panel.prefab` / `Unit Options Panel.prefab` | Variant/loadout selectors. |

Sibling Arsenal prefabs that host the card: `Arsenal.prefab`,
`HangarUnitButton.prefab` / `HangarUnitPhotocardButton.prefab` (the grid items
you click), country/spec/filter groups.

## Controller: `UnitInfoCard`

Entry point:

```csharp
void Init(Units unit, UnitSkinStorage unitSkinStorage,
          bool isExtraInfoCard = false, bool? isCompactMode = null, bool showDlc = false)
void Refresh(Units unit, UnitSkinStorage skinStorage)
```

So one card takes a fully-loaded `Units` (with its joined armor/mobility/turrets/
weapons/abilities resolved — see [DATA_SCHEMA.md](DATA_SCHEMA.md)) plus a compact flag. The
fill is split across:

```
SetUnitStatistic(unit)   SetUnitAbilities(unit)   SetUnitWeaponList(unit)
SetArmorInfo(unit)       SetModifications(unit)   SetUnitSkins(skinStorage)
SetStatisticLine(title, value, siblingIndex)   SetTraitItem(sprite, tooltip)
OnToggleCompactMode(...)  // expanded <-> compact
```

`InfocardConfig` (the `Infocard Config.asset` ScriptableObject) holds the sprite
for each stat/trait and formatting (`RoundDigits`, `EffectiveRangeMultiplier`,
`MinimalSensorRange`) — use it to match icons exactly.

## Element → data mapping (expanded card)

Serialized UI fields on `UnitInfoCard` and what fills them:

| UI field (prefab element) | Source |
|---------------------------|--------|
| `_unitName` | `Units.Name` (or `HUDName`) |
| `_unitCost` | `Units.Cost` |
| `_unitPortrait` | sprite from `Units.PortraitFileName` |
| `_dlcButton` | `Units.ContentMembership` (DLC gating) |
| `_armorInfoBlock` + `_front/_sides/_rear/_top` × `_kinetic/_heat Value` | `Armors.KinArmor*` / `HeatArmor*` (via UnitArmors) |
| `_armorDiffUp` / `_armorDiffDown` sprites | armor delta vs base when a variant changes armor |
| `_unitStatsContainer` (rows of `_unitStatsItemPrefab`) | mobility/sensors/weight/health/optics/stealth (Mobility, Sensors, Armor, Units) |
| `_unitAbilitiesContainer` (`_unitAbilitiesItemPrefab`) | Abilities (radar/ECM/smoke/APS/decoy/sprint/laser) |
| `_weaponsContainer` (`_weaponListButtonPrefab`) | Weapons (via Turrets→TurretWeapons) |
| `_selectedWeaponName` / `_selectedWeaponTraits` / `_selectedWeaponStats` | selected Weapon + its WeaponType traits & stat lines |
| `_ammoContainer` (`_ammoInfoPrefab` = `AmmoInfoExpansionPanel`) | Ammunitions for the selected weapon (via WeaponAmmunitions: `Quantity`, damage, ranges, penetration) |
| `_modificationsContainer` (`_modificationsPrefab`) | Modifications + Options |
| `_skinsContainer` (`_skinItemPrefab`) + `_selectedSkinName/Description` | skins (UnitSkinStorage); `_skinsConditionsContainer` for unlock conditions |
| `_skinMenu` / `_skinMenuBackground` / `_bottomSkinsBar` | skin sub-menu |

Bottom-bar state objects switch with mode/context:
`_bottomBar`, `_bottomEmptyBar`, `_bottomCompactBar`, `_bottomSkinsBar`.
Side buttons: `_skinMenuButton`, `_attachButton`, `_compactModeButton`.

## Expanded vs Compact

- **One controller, two layouts.** Compact mode is a runtime toggle
  (`_compactModeButton` → `OnToggleCompactMode`), gated by
  `_isCompactModeInitialized`; `Init(..., isCompactMode)` can force it.
- **Expanded** uses the full ammo panel (`Unit Info Card Ammo Info`,
  `AmmoInfoExpansionPanel`) and per-weapon stat/trait lists.
- **Compact** swaps in the dense prefabs via
  `BrokenArrow.Client.Ecs.UI.Menu.Arsenal.InfoCard.CompactMode`:
  - `UnitWeaponCompactInfo` ← `Unit Info Card Compact Weapon Info.prefab`
    (pooled, `_unitCompactWeaponInfoPrefab`)
  - `UnitAmmoCompactInfo` ← `Unit Ammo Compact Info.prefab`
  - missiles/bombs use `Unit Missiles Bombs Compact Info.prefab`
  Compact collapses each weapon to a single row (icon, name, key numbers) and
  shows `_bottomCompactBar`.

Spacing constants in the controller (useful to match layout):
`SPACING_BETWEEN_STATS_INITIAL = 14`, `SPACING_BETWEEN_MANY_STATS = 4`,
tighter spacing kicks in past `MAX_STATS_WITH_INITIAL_SPACING = 8` stats.

## Rebuild checklist (for the renderer)

1. Resolve a `Units` row to its joined data ([DATA_SCHEMA.md](DATA_SCHEMA.md) join map).
2. Header: name, cost, country flag, portrait, DLC badge.
3. Stats column: mobility, optics/sensors, weight, health, stealth — icon from
   `InfocardConfig`, value formatted with `RoundDigits`.
4. Armor block: 4 facings × {Kinetic, Heat}.
5. Abilities/traits: icon chips from active Abilities.
6. Weapons list → on select, show its WeaponAmmunitions (quantity + damage model).
7. Expanded = full ammo panel; Compact = one row per weapon.
8. Variants: apply Options overrides (armor/mobility/turrets/abilities/cost/name)
   before rendering to reproduce in-game customization.
