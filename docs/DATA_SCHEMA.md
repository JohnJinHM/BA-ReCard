# Data schema — the 24 unit tables

This describes the data BA-ReCard consumes: the JSON tables in [`../data/`](../data/),
one file per table, produced upstream by the **BA-UnitDump** pipeline (a separate
repo that decrypts the game's database). The tables mirror the game's
`BrokenArrow.DataBase.Models` classes. This doc summarises the tables and how
they join, oriented around building a unit card.

> Input contract: `data/tables/<Table>.json` (array of rows) and
> `data/localization/<lang>.json` (`{key: text}`). To refresh after a game
> patch, re-run BA-UnitDump and replace `data/`.

Row counts are from the analysed build (for scale, not contractual).

## Entity map

```
Countries ──< Units >── CategoryType / Type / Role (enums)
                │
   UnitArmors >─┼─< Armors            (front/side/rear/top × Kinetic/Heat)
   (M:N)        │
   SensorUnits >┼─< Sensors           (optics: ground / low-alt / high-alt)
   (M:N)        │
 UnitPropulsions┼─< Mobility ──< PlaneFlyPresets
   (M:N)        │
   UnitAbilities┼─< Abilities         (radar, ECM, smoke, APS, decoy, sprint, laser)
   (M:N)        │
   SquadMembers │ (infantry models + their weapon ids)   *for infantry units*
                │
   TurretUnits >┴─< Turrets >── TurretWeapons >── Weapons
   (M:N)                          (M:N)              │
                                  WeaponAmmunitions >─┴─< Ammunitions
                                  (per Unit+Weapon)
                Modifications ──< Options   (variant loadouts / skins)
                Specializations ──< SpecializationAvailabilities, TransportAvailabilities
```

Join tables carry an `Order` column that defines display order in the card.

---

## Core tables

### Units (475)
The unit itself. Key fields:
`Id, Name, HUDName, Description, CountryId, Cost, Type, CategoryType, Role,
Length, Width, Height, Weight, Stealth, InfantrySlots, MaxStress,
WaterDiveOffset, ContentMembership, DisplayInArmory, IsUnitModification,
ModelFileName, PortraitFileName, ThumbnailFileName, AudioPreset, OriginalName,
OriginalCost, OwnerInfantryID`.
- `PortraitFileName` / `ThumbnailFileName` → look up the matching sprite in
  `Assets/Sprite/*.asset` (named).
- `DisplayInArmory=false` / `IsUnitModification=true` rows are variants/internal,
  not standalone Arsenal cards.

### Countries (3 here; more with DLC)
`Id, Name, UIName, FlagFileName, MaxPoints, Hidden, ContentMembership`.

### Armors (284) — joined via **UnitArmors** (`UnitId, ArmorId`)
`ArmorValue, MaxHealthPoints,` and the 8 facing values shown on the card:
`KinArmorFront/Rear/Sides/Top`, `HeatArmorFront/Rear/Sides/Top`. `IsDefault`
marks the base armor (others come from Options/Modifications).

### Mobility (240) — joined via **UnitPropulsions** (`UnitId, MobilityId`)
`MaxSpeedRoad, MaxCrossCountrySpeed, MaxSpeedReverse, MaxSpeedWater,
Acceleration, TurnRate, Agility, ClimbRate, Weight, HeavyLiftWeight,
IsAmphibious, IsAirDroppable, IsAfterburner, LoiteringTime, FlyPresetId →
PlaneFlyPresets`.

### Sensors (33) — joined via **SensorUnits** (`UnitId, SensorId`)
`OpticsGround, OpticsLowAltitude, OpticsHighAltitude`.

### Abilities (65) — joined via **UnitAbilities** (`UnitId, AbilityId`)
Flag + parameter groups: radar (`IsRadar`, optics/range modifiers),
`IsLaserDesignator`, `IsInfantrySprint`, `IsSmoke`, `IsAPS`, `IsDecoy`, ECM
(`ECMAccuracyMultiplier`) — each with quantity/cooldown/supply fields.

### Turrets (958) — joined via **TurretUnits** (`UnitId, TurretId, Order`)
`ParentTurretId` (nesting), rotation limits (`FullRotation`,
`Left/RightHorizontalAngle`, `HorizontalRotationSpeed`).

### Weapons (709) — joined via **TurretWeapons** (`TurretId, WeaponId, Order`)
Name/HUDName/`Type` (WeaponType enum), `HUDIcon`, rate-of-fire & handling:
`MagazineSize, MagazineReloadTime*, ShotsPerBurst*, TimeBetweenBurst*,
AimTime*, CanShootOnTheMove, StabilizerQuality, Vertical angles`, ground-attack
burst lengths.

### Ammunitions (565) — joined via **WeaponAmmunitions** (`UnitId, WeaponId, AmmunitionId, Order, Quantity`)
The damage model (largest table of fields). Highlights for the card:
`Damage, StressDamage, TargetType, ArmorTargeted, PenetrationAtMinRange,
PenetrationAtGroundRange, NoDamageFalloff, TopArmorAttack, GroundRange,
LowAltRange, HighAltRange, MuzzleVelocity, Dispersion*, Seeker, LaserGuided,
SupplyCost, ResupplyTime, HUDIcon, HUDMultiplier`.

### SquadMembers (924) — infantry only (`UnitId`)
`PrimaryWeaponId, SpecialWeaponId, ModelFileName, DeathPriority`. `Quantity` of
each ammo is on WeaponAmmunitions; squad size = count of members per `UnitId`.

### Modifications (537) + Options (1802)
Variant system. `Modifications(UnitId, Type, UIName, Order)` group the toggles;
`Options` are the choices, each able to override almost everything:
`Cost, ReplaceUnitId, ArmorId, MobilityId, MainSensorId, ExtraSensorId,
Ability1..3Id, Turret0..20Id, Stealth/Thumbnail/Portrait/AudioPreset overrides,
ConcatenateWithUnitName / ReplaceUnitName`. Driving these reproduces in-game
unit customisation.

### Specializations (12) + availabilities
Deck/faction layer: `CountryId, UIName, UIDescription, Icon, Illustration`, and
per-category slot/point budgets (`Recon/Infantry/Combat/Support/Logistics/
Helicopters/Air` × `Slots`/`Points`). `SpecializationAvailabilities` and
`TransportAvailabilities` tie units to specs.

---

## Enums (values from native dump)

**UnitType** (flags): `2 Infantry, 4 Vehicle, 8 Helicopter, 16 Aircraft,
32 Ship, 128 Projectile, 256 SEADMissile, 512 CruiseMissile,
1024 BallisticMissile`.

**UnitCategoryType** (the 7 Arsenal tabs): `1 Recon, 2 Infantry, 3 Vehicles,
4 Support, 5 Logistic, 6 Helicopters, 7 Aircrafts`.

**UnitRole**: `10 IFV, 11 Tank, 12 APC, 13 LSV, 14 CargoTruck, 15 LRSAM,
16 SRSAM, 30 LineInfantry, 31 AssaultInfantry, 32 ReconInfantry, 33 Snipers,
34 AAInfantry, 35 ATGMInfantry, 36 SpecialForces, 70 ReconHelicopter,
71 MultiRoleHelicopter, 72 HeavyTransportHelicopter, 73 AttackHelicopter,
100 Drone, 130 MLRS, 131 Mortar, 132 LAM, 133 Artillery, 160 AssaultPlane,
161 Bomber, 162 StrategicBomber, 163 TransportPlane, 164 MultiRolePlane,
200 Ship, 201 Hovercraft`.

**WeaponType**: `1 Rifle … 5 AssaultRifle, 25 SMG, 26 LightMG, 27 MediumMG,
28 HeavyMG, 29 MiniGun, 40 Shotgun, 60 GrenadeLauncher, 62 RPGReloadable,
63 RPGDisposable, 80 ATGM, 82 CruiseMissile, 83 BallisticMissile,
84 AntiRadarMissile, 85 MANPAD, 86 SAM, 87 A2AMissileRadar, 88 A2AMissileIR,
89 AGM, 110 MainGun, 111 Howitzer, 112 Mortar, 113 MLRS, 114 AutoCannon,
115 AntiAirGun, 116 PlaneGun, 140 RocketPod, 141 GunPod, 160 BombDumb,
161 BombDrag, 162 BombSmart` (full list in `dump.cs`).

**ContentMembership**: `-1 Vanilla, 0 Internal, 1 DLC1VanguardEdition, 2 DLC2,
3 DLC3, 4 DLC4, 5 DLC5`.

> To regenerate any enum exactly for the current build, search `dump.cs`
> (Il2CppDumper output) for `public enum <Name>`.
