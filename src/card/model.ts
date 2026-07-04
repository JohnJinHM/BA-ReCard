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

export interface ArmorLabels {
  front: string
  sides: string
  rear: string
  top: string
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
  /** yellow distance pill, e.g. "1200m" */
  rangePill: string
  traits: TraitChip[]
  /** label:value lines of the expanded ammo panel (damage model) */
  stats: StatLine[]
  /** key numbers for the compact row (pen | damage | accuracy columns) */
  compact: {
    penetration: string
    damage: string
    accuracy: string
    /** HEAT rounds render the penetration value orange */
    isHeat: boolean
  }
}

export interface WeaponModel {
  icon: string | null
  name: string
  /** "x2" badge when identical weapons are merged, '' otherwise */
  count: string
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
  categoryLabel: string
  roleLabel: string
  description: string
  health: string
  armor: CardArmor | null
  /** facing-armor overlay over the portrait (ground vehicles only) */
  armorOverlay: boolean
  armorLabels: ArmorLabels
  stats: StatLine[]
  abilities: AbilityLine[]
  /** amphibious / airdroppable chips (bottom-right column with abilities) */
  tags: AbilityLine[]
  weapons: WeaponModel[]
  /** squad size for infantry, '' otherwise */
  squadSize: string
}

export const EMPTY_VALUE = '-'

export function emptyWeapon(): WeaponModel {
  return {
    icon: null,
    name: 'Weapon',
    count: '',
    typeLabel: '',
    traits: [],
    stats: [],
    ammo: [],
  }
}

export function emptyAmmo(): AmmoModel {
  // Zero/absent numerics default to "0" (not "-"), matching the resolver's
  // formatting for real ammo rows.
  return {
    icon: null,
    name: 'Ammo',
    quantity: 'x1',
    rangePill: EMPTY_VALUE,
    traits: [],
    stats: [],
    compact: { penetration: '0', damage: '0', accuracy: '0', isHeat: false },
  }
}

export function emptyTag(): AbilityLine {
  return { icon: null, name: '', detail: '' }
}

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
    categoryLabel: '',
    roleLabel: '',
    description: '',
    health: EMPTY_VALUE,
    armor: emptyArmor(),
    armorOverlay: true,
    armorLabels: { front: 'Front', sides: 'Sides', rear: 'Rear', top: 'Top' },
    stats: [],
    abilities: [],
    tags: [],
    weapons: [],
    squadSize: '',
  }
}
