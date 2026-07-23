import { useMemo, useRef, useState } from 'react'
import { useAppStore } from '../state/store'
import { thumbnailUrl } from '../assets'
import { resolveCard, type VariantSelection } from '../data/resolve'
import { t } from './i18n'

interface Props {
  /** a unit + variant selection was confirmed (fills name/points/logo) */
  onPick(unitId: number, selection: VariantSelection): void
  /** a local image was uploaded (data URL) — replaces the row's logo only */
  onUpload(dataUrl: string): void
  /** clear the row's logo silhouette */
  onClear(): void
  onCancel(): void
}

/**
 * Fill a kill-log row from the database: search + pick a unit, choose its
 * variants (name/cost overrides), and confirm — or upload a custom logo icon.
 */
export function LogUnitPicker({ onPick, onUpload, onClear, onCancel }: Props) {
  const db = useAppStore((s) => s.db)
  const lang = useAppStore((s) => s.lang)
  const [query, setQuery] = useState('')
  const [unitId, setUnitId] = useState<number | null>(null)
  const [selection, setSelection] = useState<VariantSelection>({})
  const fileInput = useRef<HTMLInputElement>(null)

  const units = useMemo(() => {
    if (!db) return []
    const q = query.trim().toLowerCase()
    return db
      .armoryUnits()
      .filter((u) => !q || (u.HUDName ?? u.Name ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.HUDName ?? '').localeCompare(b.HUDName ?? ''))
  }, [db, query])

  const mods = useMemo(
    () => (db && unitId != null ? [...(db.unitModifications.get(unitId) ?? [])].sort((a, b) => a.Order - b.Order) : []),
    [db, unitId],
  )

  // live preview of the resolved name/cost for the current unit + selection
  const preview = useMemo(
    () => (db && unitId != null ? resolveCard(db, unitId, selection) : null),
    [db, unitId, selection],
  )

  if (!db) return null

  function choose(id: number) {
    const hasMods = (db!.unitModifications.get(id) ?? []).length > 0
    if (hasMods) {
      setUnitId(id)
      setSelection({})
    } else {
      onPick(id, {})
    }
  }

  return (
    <div className="crop-overlay" onClick={onCancel}>
      <div className="picker-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="picker-dialog-head">
          <h3>{unitId == null ? t(lang, 'selectUnit') : t(lang, 'chooseVariant')}</h3>
          <button className="picker-dialog-close" onClick={onCancel} title={t(lang, 'close')}>
            ×
          </button>
        </div>

        {unitId == null ? (
          <>
            <input
              className="picker-search"
              placeholder={t(lang, 'searchUnits')}
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="picker-dialog-grid">
              {units.map((u) => (
                <button
                  key={u.Id}
                  className="picker-icon-cell"
                  title={u.HUDName ?? undefined}
                  onClick={() => choose(u.Id)}
                >
                  <Thumb file={u.ThumbnailFileName} name={u.HUDName ?? u.Name ?? ''} />
                  <span className="picker-icon-label">{u.HUDName ?? u.Name}</span>
                </button>
              ))}
              {units.length === 0 && <div className="picker-empty">{t(lang, 'noMatches')}</div>}
            </div>
            <div className="picker-dialog-actions">
              <button onClick={() => fileInput.current?.click()}>{t(lang, 'uploadIcon')}</button>
              <button onClick={onClear}>{t(lang, 'clearIcon')}</button>
              <span style={{ flex: 1 }} />
              <button onClick={onCancel}>{t(lang, 'cancel')}</button>
            </div>
          </>
        ) : (
          <>
            <div className="log-variant-preview">
              <Thumb
                file={preview?.unitId != null ? db.units.get(preview.unitId)?.ThumbnailFileName ?? null : null}
                name={preview?.name ?? ''}
              />
              <div className="log-variant-preview-text">
                <span className="log-variant-preview-name">{preview?.name}</span>
                <span className="log-variant-preview-pts">{preview?.cost} Pts</span>
              </div>
            </div>
            <div className="log-variant-list">
              {mods.map((mod) => {
                const opts = [...(db.modificationOptions.get(mod.Id) ?? [])].sort((a, b) => a.Order - b.Order)
                const current = selection[mod.Id] ?? (opts.find((o) => o.IsDefault) ?? opts[0])?.Id
                return (
                  <label className="variant-row" key={mod.Id}>
                    <span className="variant-label">{pretty(db.loc(mod.UIName))}</span>
                    <select
                      value={current}
                      onChange={(e) => setSelection((s) => ({ ...s, [mod.Id]: Number(e.target.value) }))}
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
            <div className="picker-dialog-actions">
              <button onClick={() => setUnitId(null)}>{t(lang, 'back')}</button>
              <span style={{ flex: 1 }} />
              <button className="primary" onClick={() => onPick(unitId, selection)}>
                {t(lang, 'useUnit')}
              </button>
            </div>
          </>
        )}

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

/** Prettify unresolved localization keys like "Custom_Option_Default". */
function pretty(s: string): string {
  return s.replace(/^Custom_(Option|Slot)_/, '').replace(/_/g, ' ')
}

function Thumb({ file, name }: { file: string | null; name: string }) {
  const [failed, setFailed] = useState(false)
  const url = thumbnailUrl(file)
  if (!url || failed) return <span className="picker-icon-img" title={name} />
  return <img className="picker-icon-img" src={url} alt={name} onError={() => setFailed(true)} />
}
