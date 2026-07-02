// CardModel: everything the card renders, as a plain serializable object.
// The resolver (data/resolve.ts) produces one from game data; the editor
// mutates a copy of it directly, so every visible field stays customizable.

export interface ArmorFacing {
  kinetic: string
  heat: string
}

export interface CardArmor {
  front: ArmorFacing
  sides: ArmorFacing
  rear: ArmorFacing
  top: ArmorFacing
}

export interface StatLine {
  /** sprite key into the extracted icon set (InfocardConfig mapping) */
  icon: string | null
  label: string
  value: string
}

export interface AbilityLine {
  icon: string | null
  name: string
  detail: string
}

export interface TraitChip {
  icon: string | null
  tooltip: string
}

export interface AmmoModel {
  icon: string | null
  name: string
  quantity: string
  traits: TraitChip[]
  /** label:value lines of the expanded ammo panel (damage model) */
  stats: StatLine[]
  /** key numbers for the compact row */
  compact: {
    damage: string
    penetration: string
    range: string
  }
}

export interface WeaponModel {
  icon: string | null
  name: string
  typeLabel: string
  traits: TraitChip[]
  stats: StatLine[]
  ammo: AmmoModel[]
}

export interface CardModel {
  /** source unit id, null for fully custom cards */
  unitId: number | null
  name: string
  cost: string
  countryId: number | null
  flagIcon: string | null
  /** sprite key or data-URL (uploaded portrait) */
  portrait: string | null
  dlcBadge: string | null
  categoryLabel: string
  roleLabel: string
  description: string
  health: string
  armor: CardArmor | null
  stats: StatLine[]
  abilities: AbilityLine[]
  weapons: WeaponModel[]
  /** squad size for infantry, '' otherwise */
  squadSize: string
}

export const EMPTY_VALUE = '-'

export function emptyArmor(): CardArmor {
  const f = (): ArmorFacing => ({ kinetic: EMPTY_VALUE, heat: EMPTY_VALUE })
  return { front: f(), sides: f(), rear: f(), top: f() }
}

export function emptyCard(): CardModel {
  return {
    unitId: null,
    name: 'Custom Unit',
    cost: EMPTY_VALUE,
    countryId: null,
    flagIcon: null,
    portrait: null,
    dlcBadge: null,
    categoryLabel: '',
    roleLabel: '',
    description: '',
    health: EMPTY_VALUE,
    armor: emptyArmor(),
    stats: [],
    abilities: [],
    weapons: [],
    squadSize: '',
  }
}
