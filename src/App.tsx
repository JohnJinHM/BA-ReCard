import { useEffect, useRef, useState } from 'react'
import { useAppStore } from './state/store'
import { UnitPicker } from './ui/UnitPicker'
import { VariantPanel } from './ui/VariantPanel'
import { ColorPanel } from './ui/ColorPanel'
import { SavedCardsPanel } from './ui/SavedCardsPanel'
import { CropDialog } from './ui/CropDialog'
import { UnitCard } from './card/UnitCard'
import { exportCardPng } from './export/exportPng'
import { t } from './ui/i18n'
import './app.css'

export default function App() {
  const { db, loadError, card, compact, editMode, lang, pendingAction } = useAppStore()
  const load = useAppStore((s) => s.load)
  const confirmPending = useAppStore((s) => s.confirmPending)
  const cancelPending = useAppStore((s) => s.cancelPending)
  const setCompact = useAppStore((s) => s.setCompact)
  const setEditMode = useAppStore((s) => s.setEditMode)
  const setLang = useAppStore((s) => s.setLang)
  const resetEdits = useAppStore((s) => s.resetEdits)
  const updateCard = useAppStore((s) => s.updateCard)
  const saveCard = useAppStore((s) => s.saveCard)

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
        <div className="app-title-row">
          <h1 className="app-title">BA ReCard</h1>
          <div className="app-title-actions">
            <a
              className="github-link"
              href="https://github.com/JohnJinHM/BA-ReCard/"
              target="_blank"
              rel="noreferrer"
              title="View source on GitHub"
              aria-label="View source on GitHub"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
            <button
              className="lang-toggle"
              title="UI language (cards always use in-game English)"
              onClick={() => void setLang(lang === 'eng' ? 'chi' : 'eng')}
            >
              {lang === 'eng' ? '中文' : 'EN'}
            </button>
          </div>
        </div>
        <UnitPicker />
      </aside>

      <main className="workspace">
        {card ? (
          <>
            <div className="toolbar">
              <button className={compact ? '' : 'active'} onClick={() => setCompact(false)}>
                {t(lang, 'expanded')}
              </button>
              <button className={compact ? 'active' : ''} onClick={() => setCompact(true)}>
                {t(lang, 'compact')}
              </button>
              <span className="toolbar-sep" />
              <button
                className={editMode ? 'active' : ''}
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? t(lang, 'editing') : t(lang, 'edit')}
              </button>
              <button onClick={() => fileInput.current?.click()}>{t(lang, 'portrait')}</button>
              <button onClick={resetEdits}>{t(lang, 'reset')}</button>
              <span className="toolbar-sep" />
              <button onClick={saveCard}>{t(lang, 'save')}</button>
              <button className="primary" onClick={onExport} disabled={exporting}>
                {exporting ? t(lang, 'exporting') : t(lang, 'exportPng')}
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
        <ColorPanel />
        <SavedCardsPanel />
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
      {pendingAction && (
        <div className="crop-overlay" onClick={cancelPending}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{t(lang, 'unsavedTitle')}</h3>
            <p>{t(lang, 'unsavedBody')}</p>
            <div className="confirm-actions">
              <button onClick={cancelPending}>{t(lang, 'cancel')}</button>
              <button
                onClick={() => {
                  saveCard()
                  confirmPending()
                }}
              >
                {t(lang, 'saveAndSwitch')}
              </button>
              <button className="danger" onClick={confirmPending}>
                {t(lang, 'discard')}
              </button>
            </div>
          </div>
        </div>
      )}
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
