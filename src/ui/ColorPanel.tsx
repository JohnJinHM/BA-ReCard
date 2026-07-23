import { useEffect, useState } from 'react'
import { useAppStore } from '../state/store'
import { t } from './i18n'

// Card theme palette (card.css custom properties) offered as one-click swatches.
const THEME_SWATCHES: { color: string; label: string }[] = [
  { color: '#e7f8e5', label: 'Text' },
  { color: '#f4d42a', label: 'Yellow' },
  { color: '#f66b06', label: 'HEAT orange' },
  { color: '#7cff81', label: 'Green' },
  { color: '#8f0ea9', label: 'DLC purple' },
  { color: '#ffffff', label: 'White' },
  { color: '#1e1e1e', label: 'Panel dark' },
]

/** Accepts "#rgb", "#rrggbb", "rrggbb" or "r, g, b"; returns "#rrggbb" or null. */
export function parseColorInput(text: string): string | null {
  const s = text.trim()
  const short = /^#?([0-9a-f]{3})$/i.exec(s)
  if (short) return '#' + [...short[1]!].map((c) => c + c).join('').toLowerCase()
  const long = /^#?([0-9a-f]{6})$/i.exec(s)
  if (long) return '#' + long[1]!.toLowerCase()
  const rgb = /^(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})$/.exec(s)
  if (rgb) {
    const parts = [rgb[1], rgb[2], rgb[3]].map(Number)
    if (parts.every((p) => p <= 255))
      return '#' + parts.map((p) => p.toString(16).padStart(2, '0')).join('')
  }
  return null
}

/**
 * Text-color editor fixed in the right sidebar (under Variants): theme
 * swatches, the browser's color picker, and a hex/RGB entry. It recolors the
 * last-focused editable text on the card (store.colorTarget), which stays
 * targeted while clicking around this panel.
 */
export function ColorPanel() {
  const editMode = useAppStore((s) => s.editMode)
  const view = useAppStore((s) => s.view)
  const card = useAppStore((s) => s.card)
  const logColors = useAppStore((s) => s.log.textColors)
  const lang = useAppStore((s) => s.lang)
  const target = useAppStore((s) => s.colorTarget)
  const setColor = useAppStore((s) => s.setColor)
  const clearColor = useAppStore((s) => s.clearColor)

  const colors = view === 'log' ? logColors : card?.textColors
  const color = target ? colors?.[target] : undefined
  const [hexText, setHexText] = useState(color ?? '')
  useEffect(() => setHexText(color ?? ''), [color, target])

  // available whenever there's something to recolor: a card, or the log view
  if (!editMode || (view === 'card' && !card)) return null

  function apply(hex: string) {
    if (!target) return
    setColor(target, hex)
  }

  function clear() {
    if (!target) return
    clearColor(target)
  }

  function commitHexText() {
    const parsed = parseColorInput(hexText)
    if (parsed) apply(parsed)
    else setHexText(color ?? '')
  }

  const disabled = !target

  return (
    <div className={`color-panel ${disabled ? 'disabled' : ''}`}>
      <h3>{t(lang, 'textColor')}</h3>
      {disabled && <div className="color-panel-hint">{t(lang, 'textColorHint')}</div>}
      <div className="color-swatches">
        {THEME_SWATCHES.map((s) => (
          <button
            key={s.color}
            className={`color-swatch ${color === s.color ? 'active' : ''}`}
            style={{ background: s.color }}
            title={s.label}
            disabled={disabled}
            onClick={() => apply(s.color)}
          />
        ))}
        <button
          className="color-swatch clear"
          title={t(lang, 'themeDefault')}
          disabled={disabled}
          onClick={clear}
        >
          ×
        </button>
      </div>
      <div className="color-panel-row">
        <input
          className="color-native-input"
          type="color"
          value={color ?? '#e7f8e5'}
          title={t(lang, 'pickColor')}
          disabled={disabled}
          onChange={(e) => apply(e.target.value)}
        />
        <input
          className="color-hex-input"
          value={hexText}
          placeholder="#rrggbb / r,g,b"
          spellCheck={false}
          disabled={disabled}
          onChange={(e) => setHexText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commitHexText()}
          onBlur={commitHexText}
        />
      </div>
    </div>
  )
}
