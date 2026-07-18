import { useRef } from 'react'
import { useAppStore } from '../state/store'
import { parseSavedCardFile } from '../state/savedCards'
import { exportSavedCardJson } from '../export/exportJson'
import { t } from './i18n'

/**
 * Custom card database (right sidebar): the cards saved to localStorage.
 * Clicking an entry loads it (guarded by the unsaved-edits dialog); the
 * toolbar's Save button adds/overwrites entries by card name. Entries can be
 * exported to .json files and imported back (shared between browsers).
 */
export function SavedCardsPanel() {
  const lang = useAppStore((s) => s.lang)
  const savedCards = useAppStore((s) => s.savedCards)
  const saveError = useAppStore((s) => s.saveError)
  const loadSavedCard = useAppStore((s) => s.loadSavedCard)
  const deleteSavedCard = useAppStore((s) => s.deleteSavedCard)
  const importSavedCard = useAppStore((s) => s.importSavedCard)
  const guardEdits = useAppStore((s) => s.guardEdits)
  const fileInput = useRef<HTMLInputElement>(null)

  async function onImportFile(file: File) {
    const entry = parseSavedCardFile(await file.text())
    if (entry) importSavedCard(entry)
    else window.alert(t(lang, 'importFailed'))
  }

  return (
    <div className="saved-panel">
      <h3>{t(lang, 'savedCards')}</h3>
      {saveError && <div className="saved-error">{t(lang, 'saveFailed')}</div>}
      {savedCards.length === 0 && <div className="saved-hint">{t(lang, 'savedEmpty')}</div>}
      {savedCards.map((s) => (
        <div className="saved-row" key={s.id}>
          <button
            className="saved-load"
            title={t(lang, 'load')}
            onClick={() => guardEdits(() => loadSavedCard(s.id))}
          >
            <span className="saved-name">{s.name}</span>
            <span className="saved-date">{new Date(s.savedAt).toLocaleDateString()}</span>
          </button>
          <button
            className="saved-action"
            title={t(lang, 'exportJson')}
            onClick={() => exportSavedCardJson(s)}
          >
            ⤓
          </button>
          <button
            className="saved-action danger"
            title={t(lang, 'delete')}
            onClick={() => {
              if (window.confirm(t(lang, 'deleteConfirm'))) deleteSavedCard(s.id)
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button className="saved-import" onClick={() => fileInput.current?.click()}>
        {t(lang, 'importJson')}
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void onImportFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
