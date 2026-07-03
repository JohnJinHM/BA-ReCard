import { useRef, useState } from 'react'

export interface PickerItem {
  /** identifier passed back to onPick */
  key: string
  label: string
  url: string | null
}

interface Props {
  title: string
  items: PickerItem[]
  /** extra class on the grid icons (e.g. mirrored weapon silhouettes) */
  iconClassName?: string
  /** a library item was chosen */
  onPick(key: string): void
  /** a local image was uploaded (data URL) */
  onUpload(dataUrl: string): void
  /** clear the slot (only for slots that can be emptied, e.g. tag icons) */
  onClear?(): void
  onCancel(): void
}

/**
 * Modal for filling an icon slot: search + pick from a library grid, or upload
 * a custom image. Used for weapon slots (weapon silhouettes) and tag icons.
 */
export function PickerDialog({ title, items, iconClassName, onPick, onUpload, onClear, onCancel }: Props) {
  const [query, setQuery] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const q = query.trim().toLowerCase()
  const filtered = q ? items.filter((it) => it.label.toLowerCase().includes(q)) : items

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="picker-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="picker-dialog-head">
          <h3>{title}</h3>
          <button className="picker-dialog-close" onClick={onCancel} title="Close">
            ×
          </button>
        </div>
        <input
          className="picker-search"
          placeholder="Search…"
          value={query}
          autoFocus
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="picker-dialog-grid">
          {filtered.map((it) => (
            <button
              key={it.key}
              className="picker-icon-cell"
              title={it.label}
              onClick={() => onPick(it.key)}
            >
              {it.url ? (
                <img className={`picker-icon-img ${iconClassName ?? ''}`} src={it.url} alt={it.label} />
              ) : (
                <span className="picker-icon-img" />
              )}
              <span className="picker-icon-label">{it.label}</span>
            </button>
          ))}
          {filtered.length === 0 && <div className="picker-empty">No matches.</div>}
        </div>
        <div className="picker-dialog-actions">
          <button onClick={() => fileInput.current?.click()}>Upload image…</button>
          {onClear && <button onClick={onClear}>Clear</button>}
          <span style={{ flex: 1 }} />
          <button onClick={onCancel}>Cancel</button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => onUpload(String(reader.result))
            reader.readAsDataURL(file)
          }}
        />
      </div>
    </div>
  )
}
