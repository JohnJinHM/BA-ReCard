# Data schema

The JSON tables in [`../public/data/tables/`](../public/data/tables/), one file
per table, extracted from the game's `DataBaseCompiled.asset` (build 1.1.0.2,
24 tables, ~14.6k rows — see `public/data/manifest.json`). The tables mirror
the game's `BrokenArrow.DataBase.Models` classes.

This doc describes the tables **and the semantics the app's pipeline applies
to them** ([`src/data/db.ts`](../src/data/db.ts) loads and indexes,
[`src/data/resolve.ts`](../src/data/resolve.ts) resolves a unit + variant
selection into a card). The semantics were reverse-engineered from the data
and calibrated against in-game screenshots in [`/samples`](../samples); where
a rule is an inference, it is flagged.

> Input contract: `public/data/tables/<Table>.json` (array of rows) and
> `public/data/localization/<lang>.json` (`{key: text}`). To refresh after a
> game patch, re-run the extraction pipeline and replace `public/data/`.

The app loads 20 of the 24 tables; `PlaneFlyPresets`, `Specializations`,
`SpecializationAvailabilities`, and `TransportAvailabilities` (the deck/
faction layer) are not consumed by the card renderer.

## Entity map

```
Countries ──< Units >── Type / CategoryType / Role (enums)
                │
   UnitArmors >─┼─< Armors            (front/side/rear/top × Kinetic/Heat)
   SensorUnits >┼─< Sensors           (optics: ground / low-alt / high-alt)
 UnitPropulsions┼─< Mobility          (speeds, agility, amphibious/airdrop)
   UnitAbilities┼─< Abilities         (radar, ECM, smoke, APS, decoys, sprint, laser)
                │
   TurretUnits >┼─< Turrets ──< TurretWeapons >── Weapons     *vehicles/aircraft*
                │     └─ ParentTurretId (cupolas follow their parent)
                │
   SquadMembers ┤  PrimaryWeaponId / SpecialWeaponId → Weapons  *infantry*
   SquadWeapons ┤  (weapon POOL — superset, not the loadout; unused by the app)
                │
                │  WeaponAmmunitions (per Unit+Weapon) >── Ammunitions
                │
        Modifications ──< Options    (variant system: turret slots, armor,
                                      sensors, abilities, cost, unit swap)
```

---

## Table reference

### Units (475)
The unit itself: `Id, Name, HUDName, Description (loc key), CountryId, Cost,
Type, CategoryType, Role, Length/Width/Height, Weight, Stealth, InfantrySlots,
MaxStress, ContentMembership, DisplayInArmory, IsUnitModification,
ModelFileName, PortraitFileName, ThumbnailFileName, OriginalName,
OriginalCost, OwnerInfantryID`.

- Arsenal roster = `DisplayInArmory && !IsUnitModification && Role !== 0`
  (`Role 0` filters internal spawned entities like "C-17 (takeoff)").
- `Stealth` is a detection-range divisor; the card displays `1 / Stealth`
  (data 0.8 → shown 1.25).
- Variant units (e.g. "AAVP MICLIC" vs "AAVP-7A1", "Airborne Snipers 2")
  are separate Unit rows reached via `Options.ReplaceUnitId`.

### Countries (3 + DLC)
`Id, Name, UIName, FlagFileName, Hidden, ContentMembership`.

### Armors (284) — via **UnitArmors** (`UnitId, ArmorId`)
`ArmorValue, MaxHealthPoints`, and the 8 facing values
`Kin/HeatArmorFront|Sides|Rear|Top`. `IsDefault` marks the base package;
alternatives are applied by Options (`Option.ArmorId`). The facing overlay is
rendered for ground vehicles with nonzero facings; helicopters/planes get an
"Armor points" stat line instead.

### Mobility (240) — via **UnitPropulsions** (`UnitId, MobilityId`)
`MaxSpeedRoad, MaxCrossCountrySpeed, MaxSpeedReverse, MaxSpeedWater,
Acceleration, TurnRate, Agility, ClimbRate, IsAmphibious, IsAirDroppable,
IsAfterburner, LoiteringTime, FlyPresetId, Weight, HeavyLiftWeight`.
Speeds are km/h and display raw (no multiplier). `IsDefault` picks the base
row; Options can swap it (`Option.MobilityId`).

### Sensors (33) — via **SensorUnits** (`UnitId, SensorId`)
`OpticsGround, OpticsLowAltitude, OpticsHighAltitude`.
The card's main sensor is the **first** SensorUnits row — *not* `IsDefault`
(most units flag several rows default). Planes have `OpticsGround 0`; fall
back to `max(OpticsLowAltitude, OpticsHighAltitude)`.

### Abilities (65) — via **UnitAbilities** (`UnitId, AbilityId`)
Feature flags + parameters: `IsRadar` (+optics/range modifiers),
`IsLaserDesignator, IsInfantrySprint, IsSmoke + SmokeAmmunitionQuantity,
IsAPS + APSQuantity, IsDecoy + DecoyQuantity, ECMAccuracyMultiplier`.
- Only rows with `IsDefault` are base abilities; Options add more
  (`Ability1..3Id`), which **merge** with the base set (they don't replace).
- One row can carry several features ("ECM Plane 20" = decoys + ECM); the
  card renders one chip per feature *kind*, so a variant-added ability
  updates the existing chip instead of duplicating it.
- ECM displays as accuracy reduction: multiplier 0.7 → "30%".

### Turrets (958) — via **TurretUnits** (`UnitId, TurretId, Order`)
`IsDefault, ParentTurretId`, rotation limits. See
[Turret resolution](#turret-resolution) — this join is a **pool of possible
turrets**, not the mounted layout.

### Weapons (709) — via **TurretWeapons** (`TurretId, WeaponId, Order`)
Display: `Name, HUDName (loc key), HUDIcon, Type (WeaponType enum),
CanBeMerged, IsUnderbarrel`. Handling: `AimTimeMin/Max, CanShootOnTheMove,
StabilizerQuality, AutoLoaded, MagazineSize, MagazineReloadTimeMin/Max,
ShotsPerBurst*, TimeBetweenBursts*, vertical angles`.
- `IsUnderbarrel` weapons (M203/GP-25) never render on turrets; they DO
  render for infantry (they arrive via SquadMembers, see below).
- `TurretWeapons.Order` is the display order within a turret.

### Ammunitions (565) — via **WeaponAmmunitions** (`UnitId, WeaponId, AmmunitionId, Order, Quantity`)
The damage model: `Damage, StressDamage, TargetType (UnitType flags),
ArmorTargeted (1 kinetic / 2 HEAT), PenetrationAtMinRange,
PenetrationAtGroundRange, TopArmorAttack, HealthAOERadius, MinimalRange,
GroundRange, LowAltRange, HighAltRange, DispersionHorizontal/VerticalRadius,
Seeker, LaserGuided, TrajectoryType, SupplyCost, ResupplyTime, HUDIcon,
HUDName, HUDMultiplier`.
- The join is **per Unit + Weapon**: the same weapon carries different ammo
  loads on different units.
- `Quantity` is **per mount**; the card multiplies by the number of mounts
  (Su-24M2's three OFAB-100 racks 14+12+12 → one entry ×38).
- Range pill = `max(GroundRange, LowAltRange, HighAltRange)`.

### SquadMembers (924) — infantry only (`UnitId`)
`PrimaryWeaponId, SpecialWeaponId (0 = none), ModelFileName, DeathPriority`.
**This is the infantry loadout source of truth** — one weapon entry per
carrying member. Squad size = row count per unit.

### SquadWeapons (534) — infantry only (`UnitId, WeaponId`)
A **superset pool** of weapons associated with the squad, including weapons
no member carries (upgrade/variant pool, e.g. Airborne Snipers list an XM7
that isn't in any member's hands). It has no quantity column. **Do not build
loadouts from it** — the app loads it but does not use it.

### Modifications (537) + Options (1802)
The variant system. `Modifications (UnitId, Type, UIName loc key, Order)`
are the customization rows shown under the card ("Weapon package",
"Armor package"); `Options` are the choices within each.

Option override fields: `Cost, ReplaceUnitId, ReplaceUnitName,
ConcatenateWithUnitName, ArmorId, MobilityId, MainSensorId, ExtraSensorId,
StealthOverride, PortraitOverride, ThumbnailOverride, Ability1..3Id,
Turret0Id .. Turret20Id`.

---

## Resolution semantics

How `resolveCard(db, unitId, selection)` turns tables into a card.

### Option selection and application

1. Sort the unit's Modifications by `Order`. For each, pick the option from
   `selection`, else the `IsDefault` option, else the first row. **Every
   modification always contributes an option** — defaults are real options,
   not the absence of one.
2. If any chosen option has `ReplaceUnitId`, the whole unit row is swapped
   first (Airborne Snipers 278 → M107 variant 340). The replacement carries
   its own SquadMembers/TurretUnits/etc.
3. Chosen options then apply **cumulatively, each touching only the fields
   it sets**:
   - `Cost` is a **delta** on the unit's base cost (+30 pts armor package),
     not a replacement.
   - `ConcatenateWithUnitName` appends with **no separator** ("BMP-3" + "M"
     → "BMP-3M"; the data carries its own leading space when one is wanted).
   - `MainSensorId`/`ExtraSensorId` **replace** the sensor list;
     `Ability1..3Id` **merge** into it.
   - `TurretNId` fields write into slot N of the turret-slot map (below).

### Turret resolution (vehicles, helicopters, aircraft, ships)

`TurretUnits` is a pool, not a layout — its `Order` column is 0 on 95% of
rows and does **not** identify slots. The slot indices live in the Options'
`TurretNId` field positions. Verified DB-wide: options never reference child
turrets or turrets outside the unit's pool.

The active turret set is resolved as:

1. **Option slots.** Collect every `TurretNId` assignment across all options
   of the unit's modifications → candidates per slot index. Seed each slot
   with its `IsDefault` candidate (if any). The chosen option then overrides
   only the slots it names — e.g. BTR-MDM's "Nothing" option clears slot 2
   while the default PKT turrets in slots 0/1 (which it never mentions)
   stay mounted.
2. **Always-present turrets.** Top-level turrets (`ParentTurretId` null)
   that are `IsDefault` and referenced by **no** option (AH-1W's M197 chin
   gun, AAVP's M2/Mk19 turret, BMP-3K's bow PKTs) always render, **before**
   the option slots (per the AH-1W sample card), ordered among themselves by
   `TurretUnits.Order` — the one place that column matters (Demidov's bow
   PKTs are Order 1/2 behind the Order-0 main turret).
3. **Child turrets.** A turret with `ParentTurretId` is not a slot: it is
   active whenever its parent is, and renders right after it. This is how
   the M1 Abrams' commander M2 + loader M240 cupolas follow whichever main
   turret (base or TUSK) the armor option selects.
4. **Fallback** (inference): a unit with no options and no default turrets
   (MC-130H) takes the first top-level turret per `Order` group.

Never seed a turret both as always-present and via its option slot — a
turret can be `IsDefault` *and* option-controlled (AAVP's MICLIC turret is
the default candidate of slot 1; seeding it separately is what once left a
stale MICLIC entry after switching to CATFAE).

### Infantry loadouts

Enumerate `SquadMembers`, pushing each member's `PrimaryWeaponId` and
non-zero `SpecialWeaponId` — one entry per carrier, no dedup, and **no
`IsUnderbarrel` filter** (the M203 renders as its own weapon on infantry
cards). Counts then fall out of merging: Rangers Snipers AT's two AT-4
carriers → "AT-4 ×2".

Do not read `SquadWeapons` (superset pool — phantom weapons) and do not
dedup by weapon id (loses carrier counts).

### Weapon merging

Weapons group into one card entry with an `×N` mount count:

- `CanBeMerged` weapons merge by **display identity**
  (`HUDName | HUDIcon | Type`) even across different Weapon rows (Su-24M2's
  OFAB-100 racks are three distinct rows).
- Other weapons merge by **row id** (Su-35S carries R-77-1 ×4 as four
  references to one row).
- **Infantry always merge by display identity**: squads with two carriers of
  the same weapon use separate "Team1"/"Team2" Weapon rows differing only in
  aim time (CAAT Dragon's M47, Kornet/Metis/Igla/Verba teams); the game
  shows one entry.

Ammo for a merged entry: collect `WeaponAmmunitions` rows for all member
weapon ids, scale each `Quantity` by that member's mount count, and combine
rows sharing an `AmmunitionId` (order = min `Order`).

### Display formatting

Mirrors the game's `InfocardConfig` (`RoundDigits 2`,
`EffectiveRangeMultiplier 2`), calibrated against `/samples`:

| Value | Rule |
|---|---|
| Ranges, blast radius, dispersion, optics | sim value **× 2** |
| Damage | raw (`HUDMultiplier` is *not* applied) |
| Speed, weight, agility | raw |
| Stealth | `1 / value` |
| Penetration | `min–max` of `PenetrationAtGroundRange/AtMinRange`, "mm Kinetic/Explosive damage" |
| Accuracy (compact row) | `Seeker` → "100%", else horizontal dispersion ×2 in meters |
| Min/max pairs (aim, reload) | "2 - 3", collapsed when equal or min ≤ 0 |

### Localization

`localization/<lang>.json` is a flat `{key: text}` map. Keys resolve
**case-insensitively** (JSON keys are lowercase; DB references are mixed
case — `Custom_Option_2xR73` → `custom_option_2xr73`). Card content always
renders from English (`eng.json`) because in-game cards are not localized;
the UI chrome uses the selected language. Values may carry tooltip text
after a `\n` — card labels take the first line.

### Asset references

`HUDIcon`, `PortraitFileName`, `ThumbnailFileName`, `FlagFileName` name
sprites extracted to `public/assets/` (see
[`extracted/ASSETS.md`](extracted/ASSETS.md)). The game resolves sprite
names **case-insensitively**; a static host does not. Known data/file
mismatches are patched in [`src/assets.ts`](../src/assets.ts)
(`WEAPON_ICON_FIXES`): `INF_Mk46`, `Stinger_x4`, `Kh_101` (case), and
`VEH_MilanER` → `INF_MILAN_ER` (no sprite exists at any casing).
`PortraitFileName` uses backslash paths (`US\HIMARS\HIMARS`).

---

## Enums (values from the native dump)

**UnitType** (bit flags — `TargetType` uses the same set): `2 Infantry,
4 Vehicle, 8 Helicopter, 16 Aircraft, 32 Ship, 128 Projectile,
256 SEADMissile, 512 CruiseMissile, 1024 BallisticMissile`.

**UnitCategoryType** (the 7 Arsenal tabs) — the native dump lists this enum
1-based but the shipped database is **0-based** (verified: BMP-3 → 2
Vehicles, HIMARS → 3 Support, Su-57 → 6): `0 Recon, 1 Infantry, 2 Vehicles,
3 Support, 4 Logistic, 5 Helicopters, 6 Aircrafts`.

**UnitRole**: `10 IFV, 11 Tank, 12 APC, 13 LSV, 14 CargoTruck, 15 LRSAM,
16 SRSAM, 30 LineInfantry, 31 AssaultInfantry, 32 ReconInfantry, 33 Snipers,
34 AAInfantry, 35 ATGMInfantry, 36 SpecialForces, 70 ReconHelicopter,
71 MultiRoleHelicopter, 72 HeavyTransportHelicopter, 73 AttackHelicopter,
100 Drone, 130 MLRS, 131 Mortar, 132 LAM, 133 Artillery, 160 AssaultPlane,
161 Bomber, 162 StrategicBomber, 163 TransportPlane, 164 MultiRolePlane,
200 Ship, 201 Hovercraft`. `0` = internal (filtered from the Arsenal).

**WeaponType**: `1 Rifle, 2 BattleRifle, 3 MarksmanRifle, 4 SniperRifle,
5 AssaultRifle, 25 SMG, 26 AutoRifle, 27 MediumMG, 28 HeavyMG, 29 MiniGun,
40 Shotgun, 60 GrenadeLauncher, 62 RPGReloadable, 63 RPGDisposable, 80 ATGM,
82 CruiseMissile, 83 BallisticMissile, 84 AntiRadarMissile, 85 MANPAD,
86 SAM, 87 A2AMissileRadar, 88 A2AMissileIR, 89 AGM, 110 MainGun,
111 Howitzer, 112 Mortar, 113 MLRS, 114 AutoCannon, 115 AntiAirGun,
116 PlaneGun, 140 RocketPod, 141 GunPod, 160 BombDumb, 161 BombDrag,
162 BombSmart`. Card labels come from `ui_enum_weapontype_*` localization
keys (see `src/data/enums.ts`).

**TrajectoryType** (Ammunitions): `10 DirectShot, 20 Artillery, 30 Mortar,
40 MLRS, 110 Missile, 200 CruiseMissile, 300 BallisticMissile, 400 Bomb,
410 HighDragBomb` → `ui_enum_trajectory_*`.

**ArmorTargeted** (Ammunitions): `1 Kinetic, 2 HEAT/Explosive`.

**ContentMembership**: `-1 Vanilla, 0 Internal, 1 DLC1VanguardEdition,
2 DLC2, 3 DLC3, 4 DLC4, 5 DLC5`.

> To regenerate any enum exactly for the current build, search `dump.cs`
> (Il2CppDumper output) for `public enum <Name>`.
