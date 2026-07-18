// Custom card database: edited cards saved as JSON in localStorage.
// Each entry snapshots the displayed CardModel plus the context needed to
// restore it (variant selection, compact mode).

import type { CardModel } from '../card/model'
import type { VariantSelection } from '../data/resolve'

export interface SavedCard {
  id: string
  /** display name; saveCard() overwrites the entry with the same name */
  name: string
  savedAt: number
  compact: boolean
  selection: VariantSelection
  card: CardModel
}

const STORAGE_KEY = 'ba-recard.savedCards'
const VERSION = 1

export function loadSavedCards(): SavedCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    const cards = (parsed as { cards?: unknown })?.cards
    if (!Array.isArray(cards)) return []
    return cards.filter(
      (c): c is SavedCard =>
        !!c && typeof c.id === 'string' && typeof c.name === 'string' && !!c.card,
    )
  } catch {
    return []
  }
}

/** Returns false when the write fails (storage full or unavailable). */
export function persistSavedCards(cards: SavedCard[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, cards }))
    return true
  } catch {
    return false
  }
}

// --- JSON file export/import (one saved card per .json file) ---

const FILE_APP = 'ba-recard'
const FILE_VERSION = 1

export function serializeSavedCard(entry: SavedCard): string {
  const { id: _id, ...rest } = entry
  return JSON.stringify({ app: FILE_APP, version: FILE_VERSION, ...rest }, null, 2)
}

/** Parse an exported card file; returns null when it isn't one. */
export function parseSavedCardFile(text: string): SavedCard | null {
  try {
    const parsed = JSON.parse(text) as Partial<SavedCard> & { app?: string }
    if (!parsed || parsed.app !== FILE_APP) return null
    if (typeof parsed.name !== 'string' || !parsed.card || typeof parsed.card !== 'object')
      return null
    return {
      id: newSavedCardId(),
      name: parsed.name.trim() || 'Untitled',
      savedAt: typeof parsed.savedAt === 'number' ? parsed.savedAt : Date.now(),
      compact: typeof parsed.compact === 'boolean' ? parsed.compact : true,
      selection: parsed.selection ?? {},
      card: parsed.card,
    }
  } catch {
    return null
  }
}

export function newSavedCardId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
