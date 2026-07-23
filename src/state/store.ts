import { create } from 'zustand'
import type { GameDb } from '../data/db'
import { loadGameDb } from '../data/db'
import type { VariantSelection } from '../data/resolve'
import { resolveCard } from '../data/resolve'
import type { CardModel } from '../card/model'
import type { LogModel } from '../log/logModel'
import { emptyLog, emptyLogEntry, logUnitFromCard } from '../log/logModel'
import type { SavedCard } from './savedCards'
import { loadSavedCards, newSavedCardId, persistSavedCards } from './savedCards'

export type Lang = 'eng' | 'chi'
/** which workspace is showing: the unit card, or the kill-log editor */
export type View = 'card' | 'log'

interface AppState {
  db: GameDb | null
  loadError: string | null
  /** UI language (picker/variant panel); the card itself always renders the
   *  in-game English strings — cards are not localized in the game yet. */
  lang: Lang
  selectedUnitId: number | null
  selection: VariantSelection
  compact: boolean
  editMode: boolean
  /** current workspace: unit card or kill-log editor */
  view: View
  /** the kill-log editor's model (edits live here, parallel to `card`) */
  log: LogModel
  /** the card as displayed; starts as the resolved model, then absorbs edits */
  card: CardModel | null
  /** the displayed card has manual edits that a re-resolve would discard */
  dirty: boolean
  /** colorKey of the last-focused editable text; the ColorPanel recolors it */
  colorTarget: string | null
  /** card-switch action awaiting "discard edits?" confirmation */
  pendingAction: (() => void) | null
  /** custom card database (persisted to localStorage as JSON) */
  savedCards: SavedCard[]
  /** the last saveCard() could not be persisted (storage full/unavailable) */
  saveError: boolean

  load(): Promise<void>
  setLang(lang: Lang): Promise<void>
  selectUnit(unitId: number | null): void
  selectOption(modificationId: number, optionId: number): void
  setCompact(compact: boolean): void
  setEditMode(on: boolean): void
  setView(view: View): void
  setColorTarget(key: string | null): void
  /** apply a partial or full replacement of the displayed card */
  updateCard(mutate: (card: CardModel) => void): void
  /** mutate the kill-log model (mirrors updateCard for the log view) */
  updateLog(mutate: (log: LogModel) => void): void
  /** clear the kill log and re-seed it from the current card (if any) */
  resetLog(): void
  /** set/clear a text-color override on whichever model the view shows */
  setColor(key: string, hex: string): void
  clearColor(key: string): void
  resetEdits(): void
  /** snapshot the displayed card into the saved list (overwrites same name) */
  saveCard(): void
  /** add an entry parsed from an exported .json file (overwrites same name) */
  importSavedCard(entry: SavedCard): void
  loadSavedCard(id: string): void
  deleteSavedCard(id: string): void
  /** run `action` now, or park it behind the unsaved-edits confirm dialog */
  guardEdits(action: () => void): void
  confirmPending(): void
  cancelPending(): void
}

function resolve(db: GameDb, unitId: number, selection: VariantSelection): CardModel {
  return resolveCard(db, unitId, selection)
}

export const useAppStore = create<AppState>((set, get) => ({
  db: null,
  loadError: null,
  lang: 'eng',
  selectedUnitId: null,
  selection: {},
  compact: true, // the game opens cards in compact mode

  editMode: false,
  view: 'card',
  log: emptyLog(),
  card: null,
  dirty: false,
  colorTarget: null,
  pendingAction: null,
  savedCards: loadSavedCards(),
  saveError: false,

  async load() {
    try {
      const db = await loadGameDb(get().lang)
      set({ db })
    } catch (e) {
      set({ loadError: e instanceof Error ? e.message : String(e) })
    }
  },

  async setLang(lang) {
    if (lang === get().lang) return
    try {
      // Only the app UI localizes; the card keeps in-game English strings,
      // so the current card (and any manual edits) is left untouched.
      const db = await loadGameDb(lang)
      set({ lang, db })
    } catch (e) {
      set({ loadError: e instanceof Error ? e.message : String(e) })
    }
  },

  selectUnit(unitId) {
    const { db } = get()
    if (!db || unitId == null) {
      set({ selectedUnitId: unitId, selection: {}, card: null, dirty: false, colorTarget: null })
      return
    }
    set({
      selectedUnitId: unitId,
      selection: {},
      card: resolve(db, unitId, {}),
      dirty: false,
      colorTarget: null,
    })
  },

  selectOption(modificationId, optionId) {
    const { db, selectedUnitId, selection } = get()
    if (!db || selectedUnitId == null) return
    const next = { ...selection, [modificationId]: optionId }
    set({
      selection: next,
      card: resolve(db, selectedUnitId, next),
      dirty: false,
      colorTarget: null,
    })
  },

  setCompact(compact) {
    set({ compact })
  },

  setEditMode(on) {
    set(on ? { editMode: true } : { editMode: false, colorTarget: null })
  },

  setView(view) {
    if (view === get().view) return
    // Entering an empty log auto-seeds a first entry from the current card and
    // opens edit mode so the user can build immediately.
    if (view === 'log' && get().log.entries.length === 0) {
      const { db, card } = get()
      if (db && card)
        set({ log: { entries: [emptyLogEntry(logUnitFromCard(db, card))] }, editMode: true })
    }
    set({ view, colorTarget: null })
  },

  setColorTarget(key) {
    set({ colorTarget: key })
  },

  updateCard(mutate) {
    const { card } = get()
    if (!card) return
    const copy = structuredClone(card)
    mutate(copy)
    set({ card: copy, dirty: true })
  },

  updateLog(mutate) {
    const copy = structuredClone(get().log)
    mutate(copy)
    set({ log: copy })
  },

  resetLog() {
    const { db, card } = get()
    const entries = db && card ? [emptyLogEntry(logUnitFromCard(db, card))] : []
    set({ log: { entries }, colorTarget: null })
  },

  setColor(key, hex) {
    if (get().view === 'log') get().updateLog((l) => void ((l.textColors ??= {})[key] = hex))
    else get().updateCard((c) => void ((c.textColors ??= {})[key] = hex))
  },

  clearColor(key) {
    if (get().view === 'log')
      get().updateLog((l) => void (l.textColors && delete l.textColors[key]))
    else get().updateCard((c) => void (c.textColors && delete c.textColors[key]))
  },

  resetEdits() {
    const { db, selectedUnitId, selection } = get()
    if (!db || selectedUnitId == null) return
    set({ card: resolve(db, selectedUnitId, selection), dirty: false, colorTarget: null })
  },

  saveCard() {
    const { card, compact, selection } = get()
    if (!card) return
    get().importSavedCard({
      id: newSavedCardId(),
      name: card.name.trim() || 'Untitled',
      savedAt: Date.now(),
      compact,
      selection,
      card: structuredClone(card),
    })
    if (!get().saveError) set({ dirty: false })
  },

  importSavedCard(entry) {
    const { savedCards } = get()
    const existing = savedCards.find((s) => s.name === entry.name)
    const merged = existing ? { ...entry, id: existing.id } : entry
    const next = existing
      ? savedCards.map((s) => (s.id === existing.id ? merged : s))
      : [merged, ...savedCards]
    const ok = persistSavedCards(next)
    // even when persistence fails the entry stays loadable for this session
    set({ savedCards: next, saveError: !ok })
  },

  loadSavedCard(id) {
    const entry = get().savedCards.find((s) => s.id === id)
    if (!entry) return
    set({
      selectedUnitId: entry.card.unitId,
      selection: entry.selection ?? {},
      compact: entry.compact,
      card: structuredClone(entry.card),
      dirty: false,
      colorTarget: null,
    })
  },

  deleteSavedCard(id) {
    const next = get().savedCards.filter((s) => s.id !== id)
    persistSavedCards(next)
    set({ savedCards: next })
  },

  guardEdits(action) {
    if (get().dirty) set({ pendingAction: action })
    else action()
  },

  confirmPending() {
    const action = get().pendingAction
    set({ pendingAction: null })
    action?.()
  },

  cancelPending() {
    set({ pendingAction: null })
  },
}))
