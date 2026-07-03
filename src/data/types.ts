// Row types for data/tables/*.json (BA-UnitDump output, mirrors
// BrokenArrow.DataBase.Models). Only fields the card consumes are typed
// strictly; tables carry more columns than listed in some cases.

export interface UnitRow {
  Id: number
  Name: string | null
  HUDName: string | null
  Description: string | null
  CountryId: number
  Cost: number
  Type: number
  CategoryType: number
  Role: number
  Length: number
  Width: number
  Height: number
  Weight: number
  Stealth: number
  InfantrySlots: number
  MaxStress: number
  ContentMembership: number
  DisplayInArmory: boolean
  IsUnitModification: boolean
  ModelFileName: string | null
  PortraitFileName: string | null
  ThumbnailFileName: string | null
  OriginalName: string | null
  OriginalCost: number
  OwnerInfantryID: number
}

export interface CountryRow {
  Id: number
  Name: string
  UIName: string
  FlagFileName: string | null
  Hidden: boolean
  ContentMembership: number
}

export interface ArmorRow {
  Id: number
  IsDefault: boolean
  Name: string | null
  ArmorValue: number
  MaxHealthPoints: number
  HeatArmorFront: number
  HeatArmorRear: number
  HeatArmorSides: number
  HeatArmorTop: number
  KinArmorFront: number
  KinArmorRear: number
  KinArmorSides: number
  KinArmorTop: number
}

export interface MobilityRow {
  Id: number
  Name: string | null
  IsDefault: boolean
  IsAmphibious: boolean
  IsAirDroppable: boolean
  Weight: number
  HeavyLiftWeight: number
  TurnRate: number
  Acceleration: number
  MaxCrossCountrySpeed: number
  MaxSpeedRoad: number
  MaxSpeedReverse: number
  MaxSpeedWater: number
  Agility: number
  ClimbRate: number
  IsChangeAltitude: boolean
  LoiteringTime: number
  IsAfterburner: boolean
  AfterBurningLoiteringTime: number
  FlyPresetId: number
}

export interface SensorRow {
  Id: number
  Name: string | null
  IsDefault: boolean
  OpticsGround: number
  OpticsLowAltitude: number
  OpticsHighAltitude: number
}

export interface AbilityRow {
  Id: number
  Name: string | null
  IsDefault: boolean
  ECMAccuracyMultiplier: number
  IsRadar: boolean
  RadarLowAltOpticsModifier: number
  RadarHighAltOpticsModifier: number
  RadarLowAltWeaponRangeModifier: number
  RadarHighAltWeaponRangeModifier: number
  IsRadarStatic: boolean
  IsLaserDesignator: boolean
  LaserMaxRange: number
  IsInfantrySprint: boolean
  IsSmoke: boolean
  SmokeAmmunitionQuantity: number
  IsAPS: boolean
  APSQuantity: number
  IsDecoy: boolean
  DecoyQuantity: number
}

export interface TurretRow {
  Id: number
  Name: string | null
  IsDefault: boolean
  ParentTurretId: number
  FullRotation: boolean
  LeftHorizontalAngle: number
  RightHorizontalAngle: number
  HorizontalRotationSpeed: number
}

export interface WeaponRow {
  Id: number
  Name: string | null
  HUDName: string | null
  Type: number
  HUDIcon: string | null
  IsLowAltDirectWeapon: boolean
  AutoLoaded: boolean
  CanBeMerged: boolean
  AimTimeMin: number
  AimTimeMax: number
  CanShootOnTheMove: boolean
  StabilizerQuality: number
  MagazineSize: number
  MagazineReloadTimeMin: number
  MagazineReloadTimeMax: number
  ShotsPerBurstMin: number
  ShotsPerBurstMax: number
  TimeBetweenBurstsMin: number
  TimeBetweenBurstsMax: number
  TimeBetweenShotsInBurst: number
  LowerVerticalAngle: number
  UpperVerticalAngles: number
  IsUnderbarrel: boolean
}

export interface AmmunitionRow {
  Id: number
  Name: string | null
  HUDName: string | null
  HUDIcon: string | null
  HUDMultiplier: number
  SupplyCost: number
  ResupplyTime: number
  Damage: number
  StressDamage: number
  TargetType: number
  ArmorTargeted: number
  PenetrationAtMinRange: number
  PenetrationAtGroundRange: number
  NoDamageFalloff: boolean
  TopArmorAttack: boolean
  HealthAOERadius: number
  StressAOERadius: number
  MinimalRange: number
  GroundRange: number
  LowAltRange: number
  HighAltRange: number
  MuzzleVelocity: number
  MaxSpeed: number
  DispersionHorizontalRadius: number
  DispersionVerticalRadius: number
  DispersionMinimal: number
  GenerateSmoke: boolean
  Seeker: boolean
  LaserGuided: boolean
  CanBeIntercepted: boolean
  TrajectoryType: number
}

export interface ModificationRow {
  Id: number
  UnitId: number
  Name: string | null
  Type: number
  UIName: string | null
  ThumbnailFileName: string | null
  Order: number
}

export interface OptionRow {
  Id: number
  IsDefault: boolean
  ModificationId: number
  Name: string | null
  Order: number
  UIName: string | null
  ConcatenateWithUnitName: string | null
  ReplaceUnitName: string | null
  ReplaceUnitId: number
  Cost: number
  OptionPicture: string | null
  ThumbnailOverride: string | null
  PortraitOverride: string | null
  ArmorId: number
  MobilityId: number
  MainSensorId: number
  ExtraSensorId: number
  StealthOverride: number
  Ability1Id: number
  Ability2Id: number
  Ability3Id: number
  // Turret0Id .. Turret20Id accessed dynamically
  [key: `Turret${number}Id`]: number
}

export interface UnitArmorRow {
  Id: number
  UnitId: number
  ArmorId: number
}
export interface UnitPropulsionRow {
  Id: number
  UnitId: number
  MobilityId: number
}
export interface SensorUnitRow {
  Id: number
  UnitId: number
  SensorId: number
}
export interface UnitAbilityRow {
  Id: number
  UnitId: number
  AbilityId: number
}
export interface TurretUnitRow {
  Id: number
  UnitId: number
  TurretId: number
  Order: number
}
export interface TurretWeaponRow {
  Id: number
  WeaponId: number
  TurretId: number
  Order: number
  WeaponChannel: number
  WeaponPriority: number
}
export interface WeaponAmmunitionRow {
  Id: number
  UnitId: number
  WeaponId: number
  AmmunitionId: number
  Order: number
  Quantity: number
}
export interface SquadWeaponRow {
  Id: number
  WeaponId: number
  UnitId: number
}
export interface SquadMemberRow {
  Id: number
  UnitId: number
  ModelFileName: string | null
  PrimaryWeaponId: number
  SpecialWeaponId: number
  DeathPriority: number
}

export interface Tables {
  Units: UnitRow[]
  Countries: CountryRow[]
  Armors: ArmorRow[]
  Mobility: MobilityRow[]
  Sensors: SensorRow[]
  Abilities: AbilityRow[]
  Turrets: TurretRow[]
  Weapons: WeaponRow[]
  Ammunitions: AmmunitionRow[]
  Modifications: ModificationRow[]
  Options: OptionRow[]
  UnitArmors: UnitArmorRow[]
  UnitPropulsions: UnitPropulsionRow[]
  SensorUnits: SensorUnitRow[]
  UnitAbilities: UnitAbilityRow[]
  TurretUnits: TurretUnitRow[]
  TurretWeapons: TurretWeaponRow[]
  WeaponAmmunitions: WeaponAmmunitionRow[]
  SquadMembers: SquadMemberRow[]
  SquadWeapons: SquadWeaponRow[]
}
