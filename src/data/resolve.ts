import type { GameDb } from './db'
import type {
  AbilityRow,
  AmmunitionRow,
  ArmorRow,
  MobilityRow,
  OptionRow,
  SensorRow,
  UnitRow,
  WeaponRow,
} from './types'
import type {
  AbilityLine,
  AmmoModel,
  CardModel,
  StatLine,
  TraitChip,
  WeaponModel,
} from '../card/model'
import { EMPTY_VALUE } from '../card/model'
import {
  TrajectoryLocKey,
  TrajectoryType,
  UnitCategoryType,
  UnitRole,
  UnitType,
  WeaponType,
  WeaponTypeLocKey,
} from './enums'

/** Chosen option per modification id; missing entries use the default option. */
export type VariantSelection = Record<number, number>

// Display formatting, mirroring the game's InfocardConfig
// (docs/extracted/ASSETS.md): RoundDigits 2, EffectiveRangeMultiplier 2.
// Calibrated against the in-game screenshots in /samples: stat-strip values
// are unit-less; ranges/blast radius/dispersion are sim values × 2; damage is
// the raw value (no HUDMultiplier); optics/speed/weight display raw.
const ROUND_DIGITS = 2
const EFFECTIVE_RANGE_MULTIPLIER = 2

function fmt(n: number | null | undefined, digits = ROUND_DIGITS): string {
  if (n == null || Number.isNaN(n)) return EMPTY_VALUE
  const r = Number(n.toFixed(digits))
  return String(r)
}

function fmtInt(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return EMPTY_VALUE
  return String(Math.round(n))
}

/** "2 - 3" for min/max pairs, collapsing when equal. */
function minMax(min: number, max: number, digits = ROUND_DIGITS): string {
  if (min === max || min <= 0) return fmt(max, digits)
  return `${fmt(min, digits)} - ${fmt(max, digits)}`
}

function effRange(n: number): number {
  return n * EFFECTIVE_RANGE_MULTIPLIER
}

interface ResolvedLoadout {
  unit: UnitRow
  cost: number
  name: string
  armor: ArmorRow | null
  mobility: MobilityRow | null
  sensors: SensorRow[]
  abilities: AbilityRow[]
  /** turret slot index → turret id; options override slots cumulatively
   *  (e.g. Tu-22M3: Bay→T5/T6, Fuselage→T3/T4, Wings→T1/T2) */
  slots: Map<number, number>
  stealth: number
  portraitFile: string | null
}

function pickDefault<T extends { IsDefault: boolean }>(rows: T[]): T | null {
  return rows.find((r) => r.IsDefault) ?? rows[0] ?? null
}

/** Resolve the base loadout of a unit (default armor/mobility/turrets/etc). */
function resolveBase(db: GameDb, unit: UnitRow): ResolvedLoadout {
  const armors = (db.unitArmors.get(unit.Id) ?? [])
    .map((r) => db.armors.get(r.ArmorId))
    .filter((a): a is ArmorRow => !!a)
  const mobilities = (db.unitPropulsions.get(unit.Id) ?? [])
    .map((r) => db.mobility.get(r.MobilityId))
    .filter((m): m is MobilityRow => !!m)
  const sensors = (db.unitSensors.get(unit.Id) ?? [])
    .map((r) => db.sensors.get(r.SensorId))
    .filter((s): s is SensorRow => !!s)
  const abilities = (db.unitAbilities.get(unit.Id) ?? [])
    .map((r) => db.abilities.get(r.AbilityId))
    .filter((a): a is AbilityRow => !!a && a.IsDefault)

  return {
    unit,
    cost: unit.Cost,
    name: unit.HUDName ?? unit.Name ?? '',
    armor: pickDefault(armors),
    mobility: pickDefault(mobilities),
    sensors,
    abilities,
    slots: turretSlotsOf(db, unit),
    stealth: unit.Stealth,
    portraitFile: unit.PortraitFileName,
  }
}

function turretSlotsOf(db: GameDb, unit: UnitRow): Map<number, number> {
  const slots = new Map<number, number>()
  for (const tu of [...(db.unitTurrets.get(unit.Id) ?? [])].sort((a, b) => a.Order - b.Order)) {
    const t = db.turrets.get(tu.TurretId)
    if (!t) continue
    if (t.IsDefault || !slots.has(tu.Order)) slots.set(tu.Order, tu.TurretId)
  }
  return slots
}

function weaponsForTurretSlots(
  db: GameDb,
  unit: UnitRow,
  slotTurrets: Map<number, number>,
): WeaponRow[] {
  const weapons: WeaponRow[] = []
  const orders = [...slotTurrets.keys()].sort((a, b) => a - b)
  for (const order of orders) {
    const turretId = slotTurrets.get(order)!
    const tws = [...(db.turretWeapons.get(turretId) ?? [])].sort(
      (a, b) => a.Order - b.Order,
    )
    for (const tw of tws) {
      const w = db.weapons.get(tw.WeaponId)
      if (w && !w.IsUnderbarrel) weapons.push(w)
    }
  }
  // Infantry squads carry weapons via SquadWeapons instead of turrets.
  if (unit.Type === UnitType.Infantry) {
    const seen = new Set(weapons.map((w) => w.Id))
    for (const sw of db.squadWeapons.get(unit.Id) ?? []) {
      const w = db.weapons.get(sw.WeaponId)
      if (w && !w.IsUnderbarrel && !seen.has(w.Id)) {
        weapons.push(w)
        seen.add(w.Id)
      }
    }
  }
  return weapons
}

/** Apply a selected Option's overrides onto a loadout. */
function applyOption(db: GameDb, loadout: ResolvedLoadout, opt: OptionRow): ResolvedLoadout {
  const out = { ...loadout }
  // Option.Cost is a delta on the unit's base cost (e.g. +30 pts for an
  // armor package), not an absolute replacement.
  if (opt.Cost) out.cost = loadout.cost + opt.Cost
  if (opt.ReplaceUnitName) out.name = db.cardLoc(opt.ReplaceUnitName)
  else if (opt.ConcatenateWithUnitName)
    // direct concatenation, no separator: "BMP-3" + "M" → "BMP-3M" (the data
    // carries its own leading space when one is wanted, e.g. " Epokha")
    out.name = `${out.name}${db.cardLoc(opt.ConcatenateWithUnitName)}`
  if (opt.ArmorId) out.armor = db.armors.get(opt.ArmorId) ?? out.armor
  if (opt.MobilityId) out.mobility = db.mobility.get(opt.MobilityId) ?? out.mobility
  if (opt.StealthOverride) out.stealth = opt.StealthOverride
  if (opt.PortraitOverride) out.portraitFile = opt.PortraitOverride

  const sensorOverrides: SensorRow[] = []
  if (opt.MainSensorId) {
    const s = db.sensors.get(opt.MainSensorId)
    if (s) sensorOverrides.push(s)
  }
  if (opt.ExtraSensorId) {
    const s = db.sensors.get(opt.ExtraSensorId)
    if (s) sensorOverrides.push(s)
  }
  if (sensorOverrides.length) out.sensors = sensorOverrides

  // Options assign extra abilities (e.g. Su-34 pylon options carry the
  // ECM/decoy pod); they add to the unit's default abilities, not replace.
  const abilityIds = [opt.Ability1Id, opt.Ability2Id, opt.Ability3Id].filter(Boolean)
  if (abilityIds.length) {
    const merged = [...loadout.abilities]
    for (const id of abilityIds) {
      const a = db.abilities.get(id)
      if (a && !merged.some((m) => m.Id === a.Id)) merged.push(a)
    }
    out.abilities = merged
  }

  // Turret slot overrides accumulate across the option chain — each option
  // only touches its own slots (wings/fuselage/bay pylons etc).
  let slots: Map<number, number> | null = null
  for (let slot = 0; slot <= 20; slot++) {
    const id = (opt as unknown as Record<string, number | undefined>)[`Turret${slot}Id`]
    if (id) {
      if (!slots) slots = new Map(loadout.slots)
      slots.set(slot, id)
    }
  }
  if (slots) out.slots = slots
  return out
}

/** Resolve a unit + variant selection into the full card view model. */
export function resolveCard(
  db: GameDb,
  unitId: number,
  selection: VariantSelection = {},
): CardModel {
  let unit = db.units.get(unitId)
  if (!unit) throw new Error(`Unknown unit ${unitId}`)

  const mods = [...(db.unitModifications.get(unitId) ?? [])].sort(
    (a, b) => a.Order - b.Order,
  )
  const chosen: OptionRow[] = []
  for (const mod of mods) {
    const opts = db.modificationOptions.get(mod.Id) ?? []
    const sel = selection[mod.Id]
    const opt = opts.find((o) => o.Id === sel) ?? opts.find((o) => o.IsDefault) ?? opts[0]
    if (opt) chosen.push(opt)
  }

  for (const opt of chosen) {
    if (opt.ReplaceUnitId) {
      const rep = db.units.get(opt.ReplaceUnitId)
      if (rep) unit = rep
    }
  }

  let loadout = resolveBase(db, unit)
  for (const opt of chosen) loadout = applyOption(db, loadout, opt)

  return buildCardModel(db, loadout, weaponsForTurretSlots(db, unit, loadout.slots))
}

function buildCardModel(db: GameDb, lo: ResolvedLoadout, weaponRows: WeaponRow[]): CardModel {
  const { unit } = lo
  const country = db.countries.get(unit.CountryId)
  const armor = lo.armor
  const mob = lo.mobility
  // The main sensor is the first SensorUnits row (not IsDefault — most units
  // list several flagged rows); the card shows its ground optics × 2.
  const mainSensor = lo.sensors[0] ?? null
  const squad = db.squadMembers.get(unit.Id) ?? []

  const isInf = unit.Type === UnitType.Infantry
  const isHel = (unit.Type & UnitType.Helicopter) !== 0
  const isAir = (unit.Type & UnitType.Aircraft) !== 0
  const cls = isInf ? 'inf' : isHel ? 'hel' : isAir ? 'air' : 'car'

  // The facing-armor overlay is shown for ground vehicles; other classes get
  // an "Armor points" entry in the stats strip instead (see AH-1W sample).
  const hasFacings =
    !!armor &&
    (armor.KinArmorFront > 0 || armor.HeatArmorFront > 0 || armor.KinArmorSides > 0)
  const armorOverlay = !isInf && !isHel && !isAir && hasFacings

  // Stats strip: icon + raw unit-less value (per /samples screenshots).
  // Vehicles: HP, Seats, Optics, Visibility, Speed, Reverse, Weight.
  // Helicopters/planes: Armor, HP, Optics, Visibility, Speed, Agility, Weight.
  const stats: StatLine[] = []
  const push = (icon: string | null, label: string, value: string) =>
    stats.push({ icon, label, value })

  const L = (key: string, fallback: string) => db.cardLocOr(key, fallback)

  if (!armorOverlay && armor && armor.ArmorValue > 0)
    push('Armor', L('ui_infocard_armor', 'Armor points'), fmtInt(armor.ArmorValue))
  if (armor)
    push(
      isInf ? 'Health points.inf' : 'Health points.car',
      L('ui_infocard_health', 'Hit points'),
      fmtInt(armor.MaxHealthPoints),
    )
  if (isInf && squad.length > 0)
    push('group', L('ui_infocard_squad_count', 'Squad members count'), String(squad.length))
  if (unit.InfantrySlots > 0)
    push('Seats', L('ui_infocard_cargo_seats', 'Seating capacity'), fmtInt(unit.InfantrySlots))
  if (mainSensor) {
    // planes have no ground optics; fall back to their air-to-air optics
    const optics =
      mainSensor.OpticsGround > 0
        ? mainSensor.OpticsGround
        : Math.max(mainSensor.OpticsLowAltitude, mainSensor.OpticsHighAltitude)
    push('Optics', L('ui_infocard_optics', 'Optics'), fmtInt(effRange(optics)))
  }
  // Stealth divides enemy detection range: display 1/value (AH-1W sample:
  // data 0.8 → shown 1.25)
  push('Stealth', L('ui_infocard_stealth', 'Stealth'), fmt(lo.stealth > 0 ? 1 / lo.stealth : 0))
  if (mob) {
    push(`Forward speed.${cls}`, L('ui_infocard_speed_forward', 'Forward speed'), fmtInt(mob.MaxSpeedRoad))
    if ((isHel || isAir) && mob.Agility > 0)
      push(`Agility turn rate.${isAir ? 'air' : 'hel'}`, L('ui_infocard_agility', 'Agility'), fmtInt(mob.Agility))
    else if (mob.MaxSpeedReverse > 0)
      push('Speed backwards.car', L('ui_infocard_speed_back', 'Reverse speed'), fmtInt(mob.MaxSpeedReverse))
  }
  push('Weight', L('ui_infocard_weight', 'Weight'), fmtInt(unit.Weight))

  // One Ability row can carry several features (e.g. "Sprint Smoke",
  // "ECM Plane 20" = decoys + ECM) — the game renders one chip per feature.
  // Rows with no displayable feature ("Empty ability") produce no chips.
  // One chip per feature KIND: a variant-added ability (e.g. ECM pods)
  // updates the existing chip's value instead of adding a second icon.
  const chipsByKind = new Map<string, AbilityLine>()
  for (const a of lo.abilities)
    for (const [kind, chip] of abilityChips(db, a, isHel, isAir)) chipsByKind.set(kind, chip)
  // laser designation always renders at the bottom of the column
  const abilities: AbilityLine[] = [...chipsByKind.entries()]
    .sort(([a], [b]) => Number(a === 'laser') - Number(b === 'laser'))
    .map(([, chip]) => chip)

  // Amphibious / airdroppable chips live with the abilities in the
  // bottom-right column of the portrait, not in the stats strip.
  const tags: AbilityLine[] = []
  if (mob?.IsAmphibious)
    tags.push({ icon: 'Amphibious', name: L('ui_infocard_ability_amphibious', 'Amphibious'), detail: '' })
  if (mob?.IsAirDroppable)
    tags.push({ icon: 'airdrop', name: L('ui_infocard_ability_airdropable', 'Airdroppable'), detail: '' })

  const weapons = mergeWeapons(weaponRows).map((mw) => buildWeaponModel(db, unit, mw))

  return {
    unitId: unit.Id,
    name: lo.name,
    cost: fmtInt(lo.cost),
    countryId: unit.CountryId,
    flagIcon: country?.FlagFileName ?? null,
    portrait: lo.portraitFile,
    categoryLabel: UnitCategoryType[unit.CategoryType] ?? '',
    roleLabel: UnitRole[unit.Role] ?? '',
    description: db.cardLoc(unit.Description),
    health: armor ? fmtInt(armor.MaxHealthPoints) : EMPTY_VALUE,
    armor: armor
      ? {
          front: { kinetic: fmtInt(armor.KinArmorFront), heat: fmtInt(armor.HeatArmorFront) },
          sides: { kinetic: fmtInt(armor.KinArmorSides), heat: fmtInt(armor.HeatArmorSides) },
          rear: { kinetic: fmtInt(armor.KinArmorRear), heat: fmtInt(armor.HeatArmorRear) },
          top: { kinetic: fmtInt(armor.KinArmorTop), heat: fmtInt(armor.HeatArmorTop) },
        }
      : null,
    armorOverlay,
    armorLabels: {
      front: L('ui_infocard_armor_front', 'Front'),
      sides: L('ui_infocard_armor_side', 'Sides'),
      rear: L('ui_infocard_armor_rear', 'Rear'),
      top: L('ui_infocard_armor_top', 'Top'),
    },
    stats,
    abilities,
    tags,
    weapons,
    squadSize: squad.length > 0 ? String(squad.length) : '',
  }
}

interface MergedWeapon {
  weapon: WeaponRow
  /** total mounts across all slots */
  count: number
  /** member weapon id → number of mounts (CanBeMerged loadouts may use
   *  several Weapon rows with the same display identity, e.g. Su-24M2's
   *  OFAB-100 racks are ids 453/454/455) */
  members: Map<number, number>
}

/** Group identical weapons regardless of slot position. `CanBeMerged`
 *  weapons merge by display identity (HUDName/icon/type) even across
 *  different Weapon rows; others merge by row id (Su-35S R-77-1 ×4). */
function mergeWeapons(rows: WeaponRow[]): MergedWeapon[] {
  const out: MergedWeapon[] = []
  const byKey = new Map<string, MergedWeapon>()
  for (const w of rows) {
    const key = w.CanBeMerged
      ? `m:${w.HUDName ?? w.Name}|${w.HUDIcon}|${w.Type}`
      : `id:${w.Id}`
    let entry = byKey.get(key)
    if (!entry) {
      entry = { weapon: w, count: 0, members: new Map() }
      byKey.set(key, entry)
      out.push(entry)
    }
    entry.count++
    entry.members.set(w.Id, (entry.members.get(w.Id) ?? 0) + 1)
  }
  return out
}

// [kind, chip] per ability feature; icon names follow InfocardConfig's sprite
// mapping (docs/extracted/ASSETS.md). Kinds dedupe variant-updated features.
function abilityChips(
  db: GameDb,
  a: AbilityRow,
  isHel: boolean,
  isAir: boolean,
): [string, AbilityLine][] {
  const chips: [string, AbilityLine][] = []
  if (a.IsRadar)
    chips.push(['radar', { icon: 'Ability_Radar', name: db.cardLocOr('ui_infocard_ability_radar', 'Radar'), detail: '' }])
  if (a.IsLaserDesignator)
    chips.push([
      'laser',
      {
        icon: 'Laser designation',
        name: db.cardLocOr('ui_infocard_ability_laser', 'Laser designation'),
        detail: '',
      },
    ])
  if (a.IsInfantrySprint)
    chips.push(['sprint', { icon: 'Sprint', name: db.cardLocOr('ui_infocard_ability_sprint', 'Sprint'), detail: '' }])
  if (a.IsSmoke)
    chips.push([
      'smoke',
      {
        icon: 'Smoke screen',
        name: db.cardLocOr('ui_infocard_ability_smoke', 'Smoke grenades'),
        detail: a.SmokeAmmunitionQuantity ? `x${a.SmokeAmmunitionQuantity}` : '',
      },
    ])
  if (a.IsAPS)
    chips.push([
      'aps',
      {
        icon: 'APS',
        name: db.cardLocOr('ui_infocard_ability_aps', 'Active protection system'),
        detail: a.APSQuantity ? `x${a.APSQuantity}` : '',
      },
    ])
  if (a.IsDecoy)
    chips.push([
      'decoy',
      {
        icon: isAir ? 'Countermeasures.air' : isHel ? 'Countermeasures.hel' : 'Countermeasures',
        name: db.cardLocOr('ui_infocard_ability_decoys', 'Decoy flares'),
        detail: a.DecoyQuantity ? `x${a.DecoyQuantity}` : '',
      },
    ])
  if (a.ECMAccuracyMultiplier !== 1 && a.ECMAccuracyMultiplier !== 0)
    chips.push([
      'ecm',
      {
        icon: 'ECM',
        name: db.cardLocOr('ui_infocard_ability_ecm', 'Electronic countermeasures'),
        // displayed as accuracy REDUCTION: multiplier 0.7 → "30%"
        detail: `${Math.round((1 - a.ECMAccuracyMultiplier) * 100)}%`,
      },
    ])
  return chips
}

function buildWeaponModel(db: GameDb, unit: UnitRow, mw: MergedWeapon): WeaponModel {
  const { weapon: w, count, members } = mw

  // Collect ammo across all member weapon rows; quantities are per mount, so
  // scale by mounts and combine rows sharing the same ammunition
  // (Su-24M2 14+12+12 OFAB-100 → one entry x38).
  const combined = new Map<number, { order: number; quantity: number }>()
  for (const r of db.unitWeaponAmmo.get(unit.Id) ?? []) {
    const mounts = members.get(r.WeaponId)
    if (!mounts) continue
    const prev = combined.get(r.AmmunitionId)
    if (prev) {
      prev.quantity += r.Quantity * mounts
      prev.order = Math.min(prev.order, r.Order)
    } else {
      combined.set(r.AmmunitionId, { order: r.Order, quantity: r.Quantity * mounts })
    }
  }
  const ammoRows = [...combined.entries()]
    .map(([ammunitionId, v]) => ({ ammunitionId, ...v }))
    .sort((a, b) => a.order - b.order)

  const traits: TraitChip[] = []
  // The hand icon marks weapons that CANNOT fire on the move (ui_infocard_weapon_static).
  if (!w.CanShootOnTheMove)
    traits.push({ icon: 'Order_Stop', tooltip: db.cardLocOr('ui_infocard_weapon_static', "Can't shoot whilst moving") })
  if (w.AutoLoaded)
    traits.push({ icon: 'reload', tooltip: db.cardLocOr('ui_infocard_weapon_autoloader', 'Autoloading') })

  // Format per the AH-1W sample: "Aim time 2 - 3 sec", "Magazine size 150",
  // "Reload time 15 - 20 sec".
  const stats: StatLine[] = []
  if (w.AimTimeMax > 0)
    stats.push({
      icon: null,
      label: db.cardLocOr('ui_infocard_weapon_aimtime', 'Aim time'),
      value: `${minMax(w.AimTimeMin, w.AimTimeMax)} sec`,
    })
  if (w.MagazineSize > 0)
    stats.push({
      icon: null,
      label: db.cardLocOr('ui_infocard_weapon_magazinesize', 'Magazine size'),
      value: fmtInt(w.MagazineSize),
    })
  if (w.MagazineReloadTimeMax > 0)
    stats.push({
      icon: null,
      label: db.cardLocOr('ui_infocard_weapon_reloadtime', 'Reload time'),
      value: `${minMax(w.MagazineReloadTimeMin, w.MagazineReloadTimeMax)} sec`,
    })

  return {
    icon: w.HUDIcon,
    name: db.cardLoc(w.HUDName) || w.Name || 'Weapon',
    count: count > 1 ? `x${count}` : '',
    typeLabel: db.cardLocOr(WeaponTypeLocKey[w.Type], WeaponType[w.Type] ?? ''),
    traits,
    stats,
    ammo: ammoRows.map((r) => {
      const a = db.ammunitions.get(r.ammunitionId)
      return buildAmmoModel(db, a ?? null, r.quantity)
    }),
  }
}

function buildAmmoModel(db: GameDb, a: AmmunitionRow | null, quantity: number): AmmoModel {
  if (!a) {
    return {
      icon: null,
      name: 'Unknown',
      quantity: `x${fmtInt(quantity)}`,
      rangePill: EMPTY_VALUE,
      traits: [],
      stats: [],
      compact: { penetration: EMPTY_VALUE, damage: EMPTY_VALUE, accuracy: EMPTY_VALUE, isHeat: false },
    }
  }
  const L = (key: string, fallback: string) => db.cardLocOr(key, fallback)

  const traits: TraitChip[] = []
  if (a.TargetType & UnitType.Infantry)
    traits.push({ icon: 'Target Type Infantry Icon', tooltip: L('ui_infocard_ammo_target_infantry', 'Target - infantry') })
  if (a.TargetType & UnitType.Vehicle)
    traits.push({ icon: 'Target Type Vehicles Icon', tooltip: L('ui_infocard_ammo_target_vehicles', 'Target - vehicles') })
  if (a.TargetType & UnitType.Helicopter)
    traits.push({ icon: 'Target Type Helicopters Icon', tooltip: L('ui_infocard_ammo_target_helicopters', 'Target - helicopters') })
  if (a.TargetType & UnitType.Aircraft)
    traits.push({ icon: 'Target Type Aircrafts Icon', tooltip: L('ui_infocard_ammo_target_air', 'Target - aircraft') })
  if (a.TargetType & (UnitType.Projectile | UnitType.SEADMissile | UnitType.CruiseMissile))
    traits.push({ icon: 'Target Type Missiles Icon', tooltip: L('ui_infocard_ammo_target_missiles', 'Target - missiles') })
  if (a.TopArmorAttack)
    traits.push({ icon: 'Top Attack Type Icon', tooltip: L('ui_infocard_ammo_top_attack', 'Top armor damage') })
  if (a.LaserGuided)
    traits.push({ icon: 'Laser designation', tooltip: L('ui_infocard_ammo_laser', 'Laser guided') })

  const isHeat = a.ArmorTargeted === 2
  const armorTypeName =
    a.ArmorTargeted === 1
      ? L('ui_infocard_ammo_kinetic', 'Kinetic damage')
      : isHeat
        ? L('ui_infocard_ammo_heat', 'Explosive damage')
        : ''
  const bestRange = Math.max(a.GroundRange, a.LowAltRange, a.HighAltRange)

  // Expanded panel lines, matching the AH-1W sample exactly:
  // trajectory, effective range (×2), raw damage, blast radius (×2),
  // dispersion (×2), "20 - 40 mm Kinetic damage", supply weight in kg.
  const stats: StatLine[] = []
  const push = (label: string, value: string) => stats.push({ icon: null, label, value })
  if (TrajectoryType[a.TrajectoryType])
    push(
      L('ui_infocard_ammo_trajectory', 'Shell trajectory'),
      db.cardLocOr(TrajectoryLocKey[a.TrajectoryType], TrajectoryType[a.TrajectoryType]!),
    )
  if (bestRange > 0)
    push(L('ui_infocard_ammo_effective_range', 'Effective range'), `${fmtInt(effRange(bestRange))} m`)
  push(L('ui_infocard_ammo_damage', 'Damage'), fmt(a.Damage))
  if (a.HealthAOERadius > 0)
    push(L('ui_infocard_ammo_radius_blast', 'Blast radius'), `${fmtInt(effRange(a.HealthAOERadius))} m`)
  if (a.DispersionHorizontalRadius > 0 || a.DispersionVerticalRadius > 0)
    push(
      L('ui_infocard_ammo_dispersion', 'Dispersion'),
      `V: ${fmt(effRange(a.DispersionVerticalRadius), 1)}m / H: ${fmt(effRange(a.DispersionHorizontalRadius), 1)}m`,
    )
  if (a.PenetrationAtMinRange > 0)
    push(
      L('ui_infocard_ammo_penetration', 'Penetration'),
      `${minMax(Math.min(a.PenetrationAtGroundRange, a.PenetrationAtMinRange), Math.max(a.PenetrationAtGroundRange, a.PenetrationAtMinRange), 0)} mm ${armorTypeName}`.trim(),
    )
  if (a.SupplyCost > 0)
    push(L('ui_infocard_ammo_supply_cost', 'Supply weight'), `${fmt(a.SupplyCost)} kg`)

  return {
    icon: a.HUDIcon,
    name: db.cardLoc(a.HUDName) || a.Name || 'Ammo',
    quantity: `x${fmtInt(quantity)}`,
    rangePill: bestRange > 0 ? `${fmtInt(effRange(bestRange))}m` : EMPTY_VALUE,
    traits,
    stats,
    compact: {
      penetration: a.PenetrationAtMinRange > 0 ? fmtInt(a.PenetrationAtMinRange) : EMPTY_VALUE,
      damage: fmt(a.Damage),
      accuracy: a.Seeker
        ? '100%'
        : a.DispersionHorizontalRadius > 0
          ? `${fmt(effRange(a.DispersionHorizontalRadius), 1)}m`
          : EMPTY_VALUE,
      isHeat,
    },
  }
}
