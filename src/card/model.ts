// CardModel: everything the card renders, as a plain serializable object.
// The resolver (data/resolve.ts) produces one from game data; the editor
// mutates a copy of it directly, so every visible field stays customizable.

/** Card presentation: "new" is the current in-game info card (adds the
 *  return-to-battlegroup timer, weapon Suppressed/CQC icons, ammo guidance
 *  icons, and compact target icons); "legacy" is the previous card style. */
export type CardStyle = 'legacy' | 'new'

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
  /** default sprite color when set (e.g. CQC renders green in game); absent
   *  keeps the sprite's own color. Users can still recolor via the ColorPanel. */
  tint?: string
  /** compact-mode sprite override (e.g. the pre-colored red "can't shoot on the
   *  move" sign); expanded keeps `icon`. */
  compactIcon?: string
}

export interface AmmoModel {
  icon: string | null
  name: string
  quantity: string
  /** yellow distance pill, e.g. "1200m" */
  rangePill: string
  traits: TraitChip[]
  /** guidance-type chips (Ammunitions.Seeker), pre-colored; new style only.
   *  Compact renders the icon(s) (centered in the plane ammo slot, or appended
   *  to the target column for ground/heli); expanded renders `guidanceLabel` as
   *  a text row. SEAD munitions (e.g. AGM-88 HARM) carry two chips. */
  guidance: TraitChip[]
  /** joined guidance names for the expanded "Guidance" stat row ('' if none) */
  guidanceLabel: string
  /** self-propelled munition (missile/cruise/ballistic/bomb) — its silhouette
   *  duplicates the weapon icon, so plane weapons drop it and its pills. */
  selfPropelled: boolean
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
  /** new-style-only weapon traits (Suppressed, Close-quarters); kept apart from
   *  `traits` so the Legacy style renders exactly as before */
  newTraits: TraitChip[]
  stats: StatLine[]
  ammo: AmmoModel[]
}

export interface CardModel {
  /** source unit id, null for fully custom cards */
  unitId: number | null
  /** per-field text color overrides, keyed by the EditableText colorKey
   *  (e.g. "name", "weapon.0.ammo.1.qty"); absent key = theme default */
  textColors?: Record<string, string>
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
  /** "Return to battlegroup delay" as "M:SS" (the clock+skull stat). New-style
   *  only; empty on fully custom cards. */
  deathTimer: string
  /** aircraft unit: plane weapons drop the redundant ammo silhouette (the
   *  weapon icon already is the munition) and show guidance in that slot. */
  aircraft: boolean
}

export const EMPTY_VALUE = '-'

/**
 * After removing the slot at `prefix{removed}` (e.g. prefix "weapon." or
 * "weapon.2.ammo."), drop its color overrides and shift higher indices down
 * so colors keep following their re-indexed weapons/ammo.
 */
export function removeIndexedColors(card: CardModel, prefix: string, removed: number) {
  const colors = card.textColors
  if (!colors) return
  const next: Record<string, string> = {}
  for (const [key, value] of Object.entries(colors)) {
    const m = key.startsWith(prefix) ? /^(\d+)(\..+)$/.exec(key.slice(prefix.length)) : null
    if (!m) {
      next[key] = value
      continue
    }
    const n = Number(m[1])
    if (n === removed) continue
    next[prefix + (n > removed ? n - 1 : n) + m[2]] = value
  }
  card.textColors = next
}

export function emptyWeapon(): WeaponModel {
  return {
    icon: null,
    name: 'Weapon',
    count: '',
    typeLabel: '',
    traits: [],
    newTraits: [],
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
    guidance: [],
    guidanceLabel: '',
    selfPropelled: false,
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
    deathTimer: '',
    aircraft: false,
  }
}
