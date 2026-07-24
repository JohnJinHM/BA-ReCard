// Color overrides live on whichever model the current view shows — the card's
// `textColors` or the log's — keyed by a stable string (a text field's
// colorKey, or an icon's). One hook so texts and icons resolve them alike.

import { useAppStore } from './store'

/** Override for `key` on the current view's model; undefined = theme default. */
export function useColorOverride(key: string | undefined): string | undefined {
  return useAppStore((s) => {
    if (!key) return undefined
    const colors = s.view === 'log' ? s.log.textColors : s.card?.textColors
    return colors?.[key]
  })
}
