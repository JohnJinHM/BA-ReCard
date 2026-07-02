import { create } from 'zustand'
import type { GameDb } from '../data/db'
import { loadGameDb } from '../data/db'
import type { VariantSelection } from '../data/resolve'
import { resolveCard } from '../data/resolve'
import type { CardModel } from '../card/model'

interface AppState {
  db: GameDb | null
  loadError: string | null
  selectedUnitId: number | null
  selection: VariantSelection
  compact: boolean
  editMode: boolean
  /** the card as displayed; starts as the resolved model, then absorbs edits */
  card: CardModel | null

  load(): Promise<void>
  selectUnit(unitId: number | null): void
  selectOption(modificationId: number, optionId: number): void
  setCompact(compact: boolean): void
  setEditMode(on: boolean): void
  /** apply a partial or full replacement of the displayed card */
  updateCard(mutate: (card: CardModel) => void): void
  resetEdits(): void
}

function resolve(db: GameDb, unitId: number, selection: VariantSelection): CardModel {
  return resolveCard(db, unitId, selection)
}

export const useAppStore = create<AppState>((set, get) => ({
  db: null,
  loadError: null,
  selectedUnitId: null,
  selection: {},
  compact: false,
  editMode: false,
  card: null,

  async load() {
    try {
      const db = await loadGameDb()
      set({ db })
    } catch (e) {
      set({ loadError: e instanceof Error ? e.message : String(e) })
    }
  },

  selectUnit(unitId) {
    const { db } = get()
    if (!db || unitId == null) {
      set({ selectedUnitId: unitId, selection: {}, card: null })
      return
    }
    set({
      selectedUnitId: unitId,
      selection: {},
      card: resolve(db, unitId, {}),
    })
  },

  selectOption(modificationId, optionId) {
    const { db, selectedUnitId, selection } = get()
    if (!db || selectedUnitId == null) return
    const next = { ...selection, [modificationId]: optionId }
    set({ selection: next, card: resolve(db, selectedUnitId, next) })
  },

  setCompact(compact) {
    set({ compact })
  },

  setEditMode(on) {
    set({ editMode: on })
  },

  updateCard(mutate) {
    const { card } = get()
    if (!card) return
    const copy = structuredClone(card)
    mutate(copy)
    set({ card: copy })
  },

  resetEdits() {
    const { db, selectedUnitId, selection } = get()
    if (!db || selectedUnitId == null) return
    set({ card: resolve(db, selectedUnitId, selection) })
  },
}))
