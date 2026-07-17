import { create } from 'zustand'
import type { GameDb } from '../data/db'
import { loadGameDb } from '../data/db'
import type { VariantSelection } from '../data/resolve'
import { resolveCard } from '../data/resolve'
import type { CardModel } from '../card/model'

export type Lang = 'eng' | 'chi'

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
  /** the card as displayed; starts as the resolved model, then absorbs edits */
  card: CardModel | null
  /** the displayed card has manual edits that a re-resolve would discard */
  dirty: boolean
  /** colorKey of the last-focused editable text; the ColorPanel recolors it */
  colorTarget: string | null
  /** card-switch action awaiting "discard edits?" confirmation */
  pendingAction: (() => void) | null

  load(): Promise<void>
  setLang(lang: Lang): Promise<void>
  selectUnit(unitId: number | null): void
  selectOption(modificationId: number, optionId: number): void
  setCompact(compact: boolean): void
  setEditMode(on: boolean): void
  setColorTarget(key: string | null): void
  /** apply a partial or full replacement of the displayed card */
  updateCard(mutate: (card: CardModel) => void): void
  resetEdits(): void
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
  card: null,
  dirty: false,
  colorTarget: null,
  pendingAction: null,

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

  resetEdits() {
    const { db, selectedUnitId, selection } = get()
    if (!db || selectedUnitId == null) return
    set({ card: resolve(db, selectedUnitId, selection), dirty: false, colorTarget: null })
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
