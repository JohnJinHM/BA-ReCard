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
  AmmoModel,
  CardModel,
  StatLine,
  TraitChip,
  WeaponModel,
} from '../card/model'
import { EMPTY_VALUE } from '../card/model'
import { ContentMembership, UnitCategoryType, UnitRole, UnitType, WeaponType } from './enums'

/** Chosen option per modification id; missing entries use the default option. */
export type VariantSelection = Record<number, number>

// Display formatting knobs, mirroring the game's InfocardConfig
// (docs/extracted/ASSETS.md): RoundDigits 2, EffectiveRangeMultiplier 2.
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

// Mobility speeds are stored in km/h already (rows are named e.g. "70kph").
function kmh(n: number): string {
  return `${fmtInt(n)}km/h`
}

function meters(n: number): string {
  return `${fmtInt(n)}m`
}

/** Weapon/sensor range as displayed in game (sim range × config multiplier). */
function effectiveRange(n: number): string {
  return meters(n * EFFECTIVE_RANGE_MULTIPLIER)
}

interface ResolvedLoadout {
  unit: UnitRow
  cost: number
  name: string
  armor: ArmorRow | null
  mobility: MobilityRow | null
  sensors: SensorRow[]
  abilities: AbilityRow[]
  /** turret slot order → weapon rows (flattened, ordered) */
  weapons: WeaponRow[]
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

  // Turret slots: per TurretUnits.Order, the default turret wins.
  const slotTurrets = new Map<number, number>()
  const turretRows = [...(db.unitTurrets.get(unit.Id) ?? [])].sort(
    (a, b) => a.Order - b.Order,
  )
  for (const tu of turretRows) {
    const turret = db.turrets.get(tu.TurretId)
    if (!turret) continue
    if (!slotTurrets.has(tu.Order) || turret.IsDefault) {
      if (turret.IsDefault || !slotTurrets.has(tu.Order)) {
        slotTurrets.set(tu.Order, tu.TurretId)
      }
    }
  }

  return {
    unit,
    cost: unit.Cost,
    name: unit.HUDName ?? unit.Name ?? '',
    armor: pickDefault(armors),
    mobility: pickDefault(mobilities),
    sensors,
    abilities,
    weapons: weaponsForTurretSlots(db, unit, slotTurrets),
    stealth: unit.Stealth,
    portraitFile: unit.PortraitFileName,
  }
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
  if (opt.ReplaceUnitName) out.name = db.loc(opt.ReplaceUnitName)
  else if (opt.ConcatenateWithUnitName)
    out.name = `${out.name} ${db.loc(opt.ConcatenateWithUnitName)}`
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

  const abilityIds = [opt.Ability1Id, opt.Ability2Id, opt.Ability3Id].filter(Boolean)
  if (abilityIds.length) {
    out.abilities = abilityIds
      .map((id) => db.abilities.get(id))
      .filter((a): a is AbilityRow => !!a)
  }

  // Turret slot overrides
  let turretChanged = false
  const slotTurrets = new Map<number, number>()
  for (let slot = 0; slot <= 20; slot++) {
    const id = (opt as unknown as Record<string, number | undefined>)[`Turret${slot}Id`]
    if (id) {
      slotTurrets.set(slot, id)
      turretChanged = true
    }
  }
  if (turretChanged) {
    // Merge: keep base slots not overridden
    const baseSlots = turretSlotsOf(db, loadout.unit)
    for (const [slot, tid] of baseSlots) {
      if (!slotTurrets.has(slot)) slotTurrets.set(slot, tid)
    }
    out.weapons = weaponsForTurretSlots(db, loadout.unit, slotTurrets)
  }
  return out
}

function turretSlotsOf(db: GameDb, unit: UnitRow): Map<number, number> {
  const slots = new Map<number, number>()
  for (const tu of [...(db.unitTurrets.get(unit.Id) ?? [])].sort((a, b) => a.Order - b.Order)) {
    const t = db.turrets.get(tu.TurretId)
    if (!t) continue
    if (t.IsDefault || !slots.has(tu.Order)) {
      if (t.IsDefault || !slots.has(tu.Order)) slots.set(tu.Order, tu.TurretId)
    }
  }
  return slots
}

/** Resolve a unit + variant selection into the full card view model. */
export function resolveCard(
  db: GameDb,
  unitId: number,
  selection: VariantSelection = {},
): CardModel {
  let unit = db.units.get(unitId)
  if (!unit) throw new Error(`Unknown unit ${unitId}`)

  // Selected options (default option of each modification when unspecified)
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

  // ReplaceUnitId swaps the whole base unit before other overrides.
  for (const opt of chosen) {
    if (opt.ReplaceUnitId) {
      const rep = db.units.get(opt.ReplaceUnitId)
      if (rep) unit = rep
    }
  }

  let loadout = resolveBase(db, unit)
  for (const opt of chosen) loadout = applyOption(db, loadout, opt)

  return buildCardModel(db, loadout)
}

function buildCardModel(db: GameDb, lo: ResolvedLoadout): CardModel {
  const { unit } = lo
  const country = db.countries.get(unit.CountryId)
  const armor = lo.armor
  const mob = lo.mobility
  const mainSensor = pickDefault(lo.sensors) ?? lo.sensors[0] ?? null
  const isAir = (unit.Type & (UnitType.Helicopter | UnitType.Aircraft)) !== 0
  const squad = db.squadMembers.get(unit.Id) ?? []

  // Class suffix used by the game's stat icon set (Forward speed.car etc).
  const isInf = unit.Type === UnitType.Infantry
  const isHel = (unit.Type & UnitType.Helicopter) !== 0
  const cls = isInf ? 'inf' : isHel ? 'hel' : (unit.Type & UnitType.Aircraft) !== 0 ? 'air' : 'car'

  const stats: StatLine[] = []
  const push = (icon: string | null, label: string, value: string) =>
    stats.push({ icon, label, value })

  if (armor)
    push(
      isInf ? 'Health points.inf' : 'Health points.car',
      'Health points',
      fmtInt(armor.MaxHealthPoints),
    )
  if (isInf && squad.length > 0) push('group', 'Squad size', String(squad.length))
  if (mob) {
    push(`Forward speed.${cls}`, 'Max. speed', kmh(mob.MaxSpeedRoad))
    if (isHel || cls === 'air')
      push(`Agility turn rate.${cls === 'air' ? 'air' : 'hel'}`, 'Agility', fmt(mob.Agility))
  }
  if (mainSensor) {
    const optics = Math.max(
      mainSensor.OpticsGround,
      mainSensor.OpticsLowAltitude,
      mainSensor.OpticsHighAltitude,
    )
    push('Optics', 'Optics', effectiveRange(optics))
  }
  if (!isInf && !isAir) push('Weight', 'Weight', `${fmt(unit.Weight / 1000, 1)}t`)
  if (lo.stealth && lo.stealth !== 1) push('Stealth', 'Stealth', 'Good')
  if (unit.InfantrySlots > 0) push('Seats', 'Transport slots', fmtInt(unit.InfantrySlots))
  if (mob?.IsAmphibious) push('Amphibious', 'Amphibious', 'Yes')
  if (mob?.IsAirDroppable) push('airdrop', 'Air-droppable', 'Yes')

  const abilities = lo.abilities.map((a) => ({
    icon: abilityIcon(a, isHel, cls === 'air'),
    name: a.Name ?? 'Ability',
    detail: abilityDetail(a),
  }))

  const weapons = lo.weapons.map((w) => buildWeaponModel(db, unit, w))

  return {
    unitId: unit.Id,
    name: lo.name,
    cost: fmtInt(lo.cost),
    countryId: unit.CountryId,
    flagIcon: country?.FlagFileName ?? null,
    portrait: lo.portraitFile,
    dlcBadge:
      unit.ContentMembership > 0
        ? (ContentMembership[unit.ContentMembership] ?? 'DLC')
        : null,
    categoryLabel: UnitCategoryType[unit.CategoryType] ?? '',
    roleLabel: UnitRole[unit.Role] ?? '',
    description: db.loc(unit.Description),
    health: armor ? fmtInt(armor.MaxHealthPoints) : EMPTY_VALUE,
    armor: armor
      ? {
          front: { kinetic: fmtInt(armor.KinArmorFront), heat: fmtInt(armor.HeatArmorFront) },
          sides: { kinetic: fmtInt(armor.KinArmorSides), heat: fmtInt(armor.HeatArmorSides) },
          rear: { kinetic: fmtInt(armor.KinArmorRear), heat: fmtInt(armor.HeatArmorRear) },
          top: { kinetic: fmtInt(armor.KinArmorTop), heat: fmtInt(armor.HeatArmorTop) },
        }
      : null,
    stats,
    abilities,
    weapons,
    squadSize: squad.length > 0 ? String(squad.length) : '',
  }
}

// Icon names follow InfocardConfig's sprite mapping (docs/extracted/ASSETS.md).
function abilityIcon(a: AbilityRow, isHel: boolean, isAir: boolean): string {
  if (a.IsRadar) return 'Ability_Radar'
  if (a.IsLaserDesignator) return 'Laser designation'
  if (a.IsInfantrySprint) return 'Sprint'
  if (a.IsSmoke) return 'Smoke screen'
  if (a.IsAPS) return 'APS'
  if (a.IsDecoy) return isAir ? 'Countermeasures.air' : isHel ? 'Countermeasures.hel' : 'Countermeasures'
  if (a.ECMAccuracyMultiplier !== 1 && a.ECMAccuracyMultiplier !== 0) return 'ECM'
  return 'Modification Icon'
}

function abilityDetail(a: AbilityRow): string {
  if (a.IsSmoke && a.SmokeAmmunitionQuantity) return `x${a.SmokeAmmunitionQuantity}`
  if (a.IsAPS && a.APSQuantity) return `x${a.APSQuantity}`
  if (a.IsDecoy && a.DecoyQuantity) return `x${a.DecoyQuantity}`
  return ''
}

function buildWeaponModel(db: GameDb, unit: UnitRow, w: WeaponRow): WeaponModel {
  const ammoRows = [...(db.unitWeaponAmmo.get(unit.Id) ?? [])]
    .filter((r) => r.WeaponId === w.Id)
    .sort((a, b) => a.Order - b.Order)

  const traits: TraitChip[] = []
  if (w.CanShootOnTheMove) traits.push({ icon: 'Order_Stop', tooltip: 'Can fire on the move' })
  if (w.AutoLoaded) traits.push({ icon: 'reload', tooltip: 'Autoloader' })

  const stats: StatLine[] = []
  if (w.MagazineSize > 0) stats.push({ icon: null, label: 'Magazine', value: fmtInt(w.MagazineSize) })
  if (w.MagazineReloadTimeMax > 0)
    stats.push({
      icon: null,
      label: 'Reload time',
      value: `${fmt((w.MagazineReloadTimeMin + w.MagazineReloadTimeMax) / 2)} s`,
    })
  if (w.AimTimeMax > 0)
    stats.push({ icon: null, label: 'Aim time', value: `${fmt((w.AimTimeMin + w.AimTimeMax) / 2)} s` })

  return {
    icon: w.HUDIcon,
    name: db.loc(w.HUDName) || w.Name || 'Weapon',
    typeLabel: WeaponType[w.Type] ?? '',
    traits,
    stats,
    ammo: ammoRows.map((r) => {
      const a = db.ammunitions.get(r.AmmunitionId)
      return buildAmmoModel(db, a ?? null, r.Quantity)
    }),
  }
}

function buildAmmoModel(db: GameDb, a: AmmunitionRow | null, quantity: number): AmmoModel {
  if (!a) {
    return {
      icon: null,
      name: 'Unknown',
      quantity: fmtInt(quantity),
      traits: [],
      stats: [],
      compact: { damage: EMPTY_VALUE, penetration: EMPTY_VALUE, range: EMPTY_VALUE },
    }
  }
  const traits: TraitChip[] = []
  // target types (flags enum matching UnitType)
  if (a.TargetType & UnitType.Infantry)
    traits.push({ icon: 'Target Type Infantry Icon', tooltip: 'vs Infantry' })
  if (a.TargetType & UnitType.Vehicle)
    traits.push({ icon: 'Target Type Vehicles Icon', tooltip: 'vs Vehicles' })
  if (a.TargetType & UnitType.Helicopter)
    traits.push({ icon: 'Target Type Helicopters Icon', tooltip: 'vs Helicopters' })
  if (a.TargetType & UnitType.Aircraft)
    traits.push({ icon: 'Target Type Aircrafts Icon', tooltip: 'vs Aircraft' })
  if (a.TargetType & (UnitType.Projectile | UnitType.SEADMissile | UnitType.CruiseMissile))
    traits.push({ icon: 'Target Type Missiles Icon', tooltip: 'vs Missiles' })
  if (a.TopArmorAttack) traits.push({ icon: 'Top Attack Type Icon', tooltip: 'Top attack' })
  if (a.LaserGuided) traits.push({ icon: 'Laser designation', tooltip: 'Laser guided' })

  const stats: StatLine[] = []
  const push = (label: string, value: string) => stats.push({ icon: null, label, value })
  push('Damage', fmt(a.Damage * (a.HUDMultiplier || 1)))
  push('Stress damage', fmt(a.StressDamage))
  if (a.PenetrationAtMinRange > 0 || a.PenetrationAtGroundRange > 0)
    push('Penetration', `${fmtInt(a.PenetrationAtMinRange)} → ${fmtInt(a.PenetrationAtGroundRange)} mm`)
  if (a.GroundRange > 0) push('Range (ground)', effectiveRange(a.GroundRange))
  if (a.LowAltRange > 0) push('Range (low alt.)', effectiveRange(a.LowAltRange))
  if (a.HighAltRange > 0) push('Range (high alt.)', effectiveRange(a.HighAltRange))
  if (a.MuzzleVelocity > 0) push('Muzzle velocity', `${fmtInt(a.MuzzleVelocity)} m/s`)
  if (a.SupplyCost > 0) push('Supply cost', fmt(a.SupplyCost))

  const bestRange = Math.max(a.GroundRange, a.LowAltRange, a.HighAltRange)
  return {
    icon: a.HUDIcon,
    name: db.loc(a.HUDName) || a.Name || 'Ammo',
    quantity: `x${fmtInt(quantity)}`,
    traits,
    stats,
    compact: {
      damage: fmt(a.Damage * (a.HUDMultiplier || 1)),
      penetration:
        a.PenetrationAtMinRange > 0 ? `${fmtInt(a.PenetrationAtMinRange)} mm` : EMPTY_VALUE,
      range: bestRange > 0 ? effectiveRange(bestRange) : EMPTY_VALUE,
    },
  }
}
