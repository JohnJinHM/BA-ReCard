import { useMemo, useState } from 'react'
import { useAppStore } from '../state/store'
import { thumbnailUrl } from '../assets'
import { UnitCategoryLocKey, UnitCategoryType } from '../data/enums'

/** Arsenal-style unit browser: category tabs + searchable thumbnail grid. */
export function UnitPicker() {
  const db = useAppStore((s) => s.db)
  const selectedUnitId = useAppStore((s) => s.selectedUnitId)
  const selectUnit = useAppStore((s) => s.selectUnit)
  const guardEdits = useAppStore((s) => s.guardEdits)
  const [category, setCategory] = useState<number>(2) // Vehicles tab
  const [query, setQuery] = useState('')

  const units = useMemo(() => {
    if (!db) return []
    const q = query.trim().toLowerCase()
    return db
      .armoryUnits()
      .filter((u) => (q ? true : u.CategoryType === category))
      .filter((u) => !q || (u.HUDName ?? u.Name ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.HUDName ?? '').localeCompare(b.HUDName ?? ''))
  }, [db, category, query])

  // Hide tabs with no armory units (e.g. Logistic in the current data).
  const categories = useMemo(() => {
    if (!db) return []
    const counts = new Map<number, number>()
    for (const u of db.armoryUnits())
      counts.set(u.CategoryType, (counts.get(u.CategoryType) ?? 0) + 1)
    return Object.entries(UnitCategoryType).filter(([id]) => (counts.get(Number(id)) ?? 0) > 0)
  }, [db])

  if (!db) return null

  return (
    <div className="unit-picker">
      <input
        className="picker-search"
        placeholder="Search units…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="picker-tabs">
        {categories.map(([id, label]) => (
          <button
            key={id}
            className={Number(id) === category && !query ? 'active' : ''}
            onClick={() => {
              setCategory(Number(id))
              setQuery('')
            }}
          >
            {db.locOr(UnitCategoryLocKey[Number(id)], label)}
          </button>
        ))}
      </div>
      <div className="picker-grid">
        {units.map((u) => (
          <button
            key={u.Id}
            className={`picker-item ${u.Id === selectedUnitId ? 'active' : ''}`}
            onClick={() => guardEdits(() => selectUnit(u.Id))}
            title={u.HUDName ?? undefined}
          >
            <UnitThumb file={u.ThumbnailFileName} name={u.HUDName ?? u.Name ?? ''} />
            <span className="picker-item-name">{u.HUDName ?? u.Name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function UnitThumb({ file, name }: { file: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const url = thumbnailUrl(file)
  if (!url || failed) return <span className="picker-thumb placeholder">{name.slice(0, 2)}</span>
  return <img className="picker-thumb" src={url} alt={name} onError={() => setFailed(true)} />
}
