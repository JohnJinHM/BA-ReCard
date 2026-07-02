import { useEffect, useRef, useState } from 'react'
import { useAppStore } from './state/store'
import { UnitPicker } from './ui/UnitPicker'
import { VariantPanel } from './ui/VariantPanel'
import { CropDialog } from './ui/CropDialog'
import { UnitCard } from './card/UnitCard'
import { exportCardPng } from './export/exportPng'
import './app.css'

export default function App() {
  const { db, loadError, card, compact, editMode } = useAppStore()
  const load = useAppStore((s) => s.load)
  const setCompact = useAppStore((s) => s.setCompact)
  const setEditMode = useAppStore((s) => s.setEditMode)
  const resetEdits = useAppStore((s) => s.resetEdits)
  const updateCard = useAppStore((s) => s.updateCard)

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void load()
  }, [load])

  if (loadError) return <div className="app-error">Failed to load data: {loadError}</div>
  if (!db) return <div className="app-loading">Loading unit database…</div>

  async function onExport() {
    if (!card) return
    setExporting(true)
    try {
      await exportCardPng(card.name)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="app-title">BA ReCard</h1>
        <UnitPicker />
      </aside>

      <main className="workspace">
        {card ? (
          <>
            <div className="toolbar">
              <button className={compact ? '' : 'active'} onClick={() => setCompact(false)}>
                Expanded
              </button>
              <button className={compact ? 'active' : ''} onClick={() => setCompact(true)}>
                Compact
              </button>
              <span className="toolbar-sep" />
              <button
                className={editMode ? 'active' : ''}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Editing…' : 'Edit'}
              </button>
              <button onClick={() => fileInput.current?.click()}>Portrait…</button>
              <button onClick={resetEdits}>Reset</button>
              <span className="toolbar-sep" />
              <button className="primary" onClick={onExport} disabled={exporting}>
                {exporting ? 'Exporting…' : 'Export PNG'}
              </button>
            </div>
            <div className="card-stage">
              <UnitCard card={card} />
            </div>
          </>
        ) : (
          <div className="workspace-empty">Select a unit to build its card.</div>
        )}
      </main>

      <aside className="sidebar right">
        <VariantPanel />
      </aside>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) setCropSrc(URL.createObjectURL(file))
          e.target.value = ''
        }}
      />
      {cropSrc && (
        <CropDialog
          imageSrc={cropSrc}
          onCancel={() => {
            URL.revokeObjectURL(cropSrc)
            setCropSrc(null)
          }}
          onDone={(dataUrl) => {
            updateCard((c) => void (c.portrait = dataUrl))
            URL.revokeObjectURL(cropSrc)
            setCropSrc(null)
          }}
        />
      )}
    </div>
  )
}
