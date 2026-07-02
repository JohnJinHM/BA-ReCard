// Resolves sprite/portrait names from game data to URLs under public/assets/,
// as laid out by scripts/extract-assets.mjs (see docs/extracted/ASSETS.md).
// Missing files should fail gracefully in the renderer.

const BASE = import.meta.env.BASE_URL

function passthrough(name: string): boolean {
  return name.startsWith('data:') || name.startsWith('blob:')
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

/** Weapon silhouettes; Weapons.HUDIcon, e.g. "2A72". */
export function weaponIconUrl(name: string | null): string | null {
  if (!name) return null
  if (passthrough(name)) return name
  return `${BASE}assets/weapons/${enc(name)}.png`
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
