// Resolves sprite/portrait names from game data to URLs under public/assets/,
// as laid out by scripts/extract-assets.mjs (see docs/extracted/ASSETS.md).
// Missing files should fail gracefully in the renderer.

const BASE = import.meta.env.BASE_URL

function passthrough(name: string): boolean {
  return name.startsWith('data:') || name.startsWith('blob:')
}

/** True for user-uploaded images (data/blob URLs) vs. game sprite names.
 *  Callers use this to skip sprite-only styling like the weapon mirror. */
export function isUploadedImage(name: string | null): boolean {
  return !!name && passthrough(name)
}

function enc(name: string): string {
  return encodeURIComponent(name)
}

/** Infocard stat/trait/ability icons (InfocardConfig names, e.g. "Forward speed.car"). */
export function iconUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  return `${BASE}assets/icons/${enc(name)}.png`
}

/** Card chrome sprites (gradient strips, borders, badges). */
export function chromeUrl(name: string): string {
  return `${BASE}assets/chrome/${enc(name)}.png`
}

// Weapons.HUDIcon values with no matching sprite file in the export: three
// case mismatches (the game resolves sprites case-insensitively; our static
// host does not) and VEH_MilanER, which has no sprite at any casing —
// INF_MILAN_ER is the only Milan ER icon shipped.
const WEAPON_ICON_FIXES: Record<string, string> = {
  INF_Mk46: 'INF_MK46',
  Stinger_x4: 'STINGER_x4',
  Kh_101: 'KH_101',
  VEH_MilanER: 'INF_MILAN_ER',
}

/** Weapon silhouettes; Weapons.HUDIcon, e.g. "2A72". */
export function weaponIconUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  return `${BASE}assets/weapons/${enc(WEAPON_ICON_FIXES[name] ?? name)}.png`
}

/** Ammo silhouettes; Ammunitions.HUDIcon, e.g. "AMMO_TOW_2A". */
export function ammoIconUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  return `${BASE}assets/ammo/${enc(name)}.png`
}

/** Country flags; Countries.FlagFileName, e.g. "usa flag". */
export function flagUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  return `${BASE}assets/flags/${enc(name)}.png`
}

/** Unit portraits; PortraitFileName like "US\\HIMARS\\HIMARS" (816×550, webp). */
export function portraitUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  const path = name.replace(/\\/g, '/').split('/').map(enc).join('/')
  return `${BASE}assets/portraits/${path}.webp`
}

/** Unit thumbnails (Arsenal grid labels), e.g. "US_HIMARS-Label" (416×216). */
export function thumbnailUrl(name: string | null): string | null {
  if (!name) return null
  return `${BASE}assets/thumbnails/${enc(name)}.png`
}
