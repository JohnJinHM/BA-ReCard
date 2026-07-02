import { useAppStore } from '../state/store'

/** Prettify unresolved localization keys like "Custom_Option_Default". */
function pretty(s: string): string {
  return s.replace(/^Custom_(Option|Slot)_/, '').replace(/_/g, ' ')
}

/** Modification → option selectors for the selected unit (in-game variants). */
export function VariantPanel() {
  const db = useAppStore((s) => s.db)
  const unitId = useAppStore((s) => s.selectedUnitId)
  const selection = useAppStore((s) => s.selection)
  const selectOption = useAppStore((s) => s.selectOption)

  if (!db || unitId == null) return null
  const mods = [...(db.unitModifications.get(unitId) ?? [])].sort(
    (a, b) => a.Order - b.Order,
  )
  if (mods.length === 0) return null

  return (
    <div className="variant-panel">
      <h3>Variants</h3>
      {mods.map((mod) => {
        const opts = [...(db.modificationOptions.get(mod.Id) ?? [])].sort(
          (a, b) => a.Order - b.Order,
        )
        const current =
          selection[mod.Id] ??
          (opts.find((o) => o.IsDefault) ?? opts[0])?.Id
        return (
          <label className="variant-row" key={mod.Id}>
            <span className="variant-label">{pretty(db.loc(mod.UIName))}</span>
            <select
              value={current}
              onChange={(e) => selectOption(mod.Id, Number(e.target.value))}
            >
              {opts.map((o) => (
                <option key={o.Id} value={o.Id}>
                  {pretty(db.loc(o.UIName) || o.Name || `Option ${o.Id}`)}
                </option>
              ))}
            </select>
          </label>
        )
      })}
    </div>
  )
}
