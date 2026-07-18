import type { SavedCard } from '../state/savedCards'
import { serializeSavedCard } from '../state/savedCards'

/** Download a saved card as a .json file (re-importable via the panel). */
export function exportSavedCardJson(entry: SavedCard): void {
  const blob = new Blob([serializeSavedCard(entry)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${entry.name.replace(/[^\w\- ]+/g, '').trim() || 'unit-card'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
