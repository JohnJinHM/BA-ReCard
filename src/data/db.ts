import type {
  Tables,
  UnitRow,
  CountryRow,
  ArmorRow,
  MobilityRow,
  SensorRow,
  AbilityRow,
  TurretRow,
  WeaponRow,
  AmmunitionRow,
  ModificationRow,
  OptionRow,
} from './types'

const TABLE_NAMES = [
  'Units',
  'Countries',
  'Armors',
  'Mobility',
  'Sensors',
  'Abilities',
  'Turrets',
  'Weapons',
  'Ammunitions',
  'Modifications',
  'Options',
  'UnitArmors',
  'UnitPropulsions',
  'SensorUnits',
  'UnitAbilities',
  'TurretUnits',
  'TurretWeapons',
  'WeaponAmmunitions',
  'SquadMembers',
  'SquadWeapons',
] as const

/** Fully-loaded game database with id and foreign-key indexes. */
export class GameDb {
  constructor(
    readonly tables: Tables,
    readonly localization: Record<string, string>,
  ) {
    this.units = indexById(tables.Units)
    this.countries = indexById(tables.Countries)
    this.armors = indexById(tables.Armors)
    this.mobility = indexById(tables.Mobility)
    this.sensors = indexById(tables.Sensors)
    this.abilities = indexById(tables.Abilities)
    this.turrets = indexById(tables.Turrets)
    this.weapons = indexById(tables.Weapons)
    this.ammunitions = indexById(tables.Ammunitions)
    this.options = indexById(tables.Options)

    this.unitArmors = groupBy(tables.UnitArmors, (r) => r.UnitId)
    this.unitPropulsions = groupBy(tables.UnitPropulsions, (r) => r.UnitId)
    this.unitSensors = groupBy(tables.SensorUnits, (r) => r.UnitId)
    this.unitAbilities = groupBy(tables.UnitAbilities, (r) => r.UnitId)
    this.unitTurrets = groupBy(tables.TurretUnits, (r) => r.UnitId)
    this.turretWeapons = groupBy(tables.TurretWeapons, (r) => r.TurretId)
    this.unitWeaponAmmo = groupBy(tables.WeaponAmmunitions, (r) => r.UnitId)
    this.unitModifications = groupBy(tables.Modifications, (r) => r.UnitId)
    this.modificationOptions = groupBy(tables.Options, (r) => r.ModificationId)
    this.squadMembers = groupBy(tables.SquadMembers, (r) => r.UnitId)
    this.squadWeapons = groupBy(tables.SquadWeapons, (r) => r.UnitId)
  }

  units: Map<number, UnitRow>
  countries: Map<number, CountryRow>
  armors: Map<number, ArmorRow>
  mobility: Map<number, MobilityRow>
  sensors: Map<number, SensorRow>
  abilities: Map<number, AbilityRow>
  turrets: Map<number, TurretRow>
  weapons: Map<number, WeaponRow>
  ammunitions: Map<number, AmmunitionRow>
  options: Map<number, OptionRow>

  unitArmors: Map<number, Tables['UnitArmors']>
  unitPropulsions: Map<number, Tables['UnitPropulsions']>
  unitSensors: Map<number, Tables['SensorUnits']>
  unitAbilities: Map<number, Tables['UnitAbilities']>
  unitTurrets: Map<number, Tables['TurretUnits']>
  turretWeapons: Map<number, Tables['TurretWeapons']>
  unitWeaponAmmo: Map<number, Tables['WeaponAmmunitions']>
  unitModifications: Map<number, ModificationRow[]>
  modificationOptions: Map<number, OptionRow[]>
  squadMembers: Map<number, Tables['SquadMembers']>
  squadWeapons: Map<number, Tables['SquadWeapons']>

  /** Translate a localization key; falls back to the key itself. */
  loc(key: string | null | undefined): string {
    if (!key) return ''
    return this.localization[key] ?? key
  }

  /** Units shown as standalone Arsenal cards. */
  armoryUnits(): UnitRow[] {
    return this.tables.Units.filter(
      (u) => u.DisplayInArmory && !u.IsUnitModification,
    )
  }
}

function indexById<T extends { Id: number }>(rows: T[]): Map<number, T> {
  return new Map(rows.map((r) => [r.Id, r]))
}

function groupBy<T>(rows: T[], key: (r: T) => number): Map<number, T[]> {
  const map = new Map<number, T[]>()
  for (const r of rows) {
    const k = key(r)
    const arr = map.get(k)
    if (arr) arr.push(r)
    else map.set(k, [r])
  }
  return map
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export async function loadGameDb(lang = 'eng'): Promise<GameDb> {
  const [tableArrays, localization] = await Promise.all([
    Promise.all(TABLE_NAMES.map((t) => fetchJson<unknown[]>(`data/tables/${t}.json`))),
    fetchJson<Record<string, string>>(`data/localization/${lang}.json`),
  ])
  const tables = Object.fromEntries(
    TABLE_NAMES.map((t, i) => [t, tableArrays[i]]),
  ) as unknown as Tables
  return new GameDb(tables, localization)
}
