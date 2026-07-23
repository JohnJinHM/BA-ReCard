import { useState } from 'react'
import { useAppStore } from '../state/store'
import { isUploadedImage, thumbnailUrl } from '../assets'
import { EditableText } from '../card/EditableText'
import { LogUnitPicker } from '../ui/LogUnitPicker'
import type { LogEntry, LogUnit } from './logModel'
import {
  emptyLogEntry,
  emptyLogUnit,
  isPristineVictim,
  logUnitFromCard,
  removeUnitColors,
  resolveLogUnit,
} from './logModel'
import type { VariantSelection } from '../data/resolve'
import { t } from '../ui/i18n'
import './log.css'

// Imitates the in-game kill feed: each entry is a killer (left, blue) and the
// victims it accounts for (right, red). The first victim shares the killer's
// full row; extra victims stack as right-only sub-rows. Colors/spacing follow
// the sample under /samples; every value is editable like the unit card.

type PickerTarget =
  | { entryId: string; side: 'left' }
  | { entryId: string; side: 'right'; index: number }

const DEFAULT_LEFT_COLOR = 'var(--log-blue)'
const DEFAULT_RIGHT_COLOR = 'var(--log-red)'

export function LogBoard() {
  const db = useAppStore((s) => s.db)
  const card = useAppStore((s) => s.card)
  const editMode = useAppStore((s) => s.editMode)
  const lang = useAppStore((s) => s.lang)
  const entries = useAppStore((s) => s.log.entries)
  const update = useAppStore((s) => s.updateLog)
  const [picker, setPicker] = useState<PickerTarget | null>(null)

  function addEntry() {
    update((l) => {
      const left = db && card ? logUnitFromCard(db, card) : emptyLogUnit()
      l.entries.push(emptyLogEntry(left))
    })
  }

  function removeEntry(entryId: string) {
    update((l) => {
      const e = l.entries.find((x) => x.id === entryId)
      if (!e) return
      removeUnitColors(l, e.left.id)
      for (const r of e.rights) removeUnitColors(l, r.id)
      l.entries = l.entries.filter((x) => x.id !== entryId)
    })
  }

  function addVictim(entryId: string) {
    update((l) => void l.entries.find((e) => e.id === entryId)?.rights.push(emptyLogUnit()))
  }

  function removeVictim(entryId: string, index: number) {
    update((l) => {
      const e = l.entries.find((x) => x.id === entryId)
      if (!e) return
      const [removed] = e.rights.splice(index, 1)
      if (removed) removeUnitColors(l, removed.id)
    })
  }

  /** Replace the targeted slot's unit, keeping its stable id so colors persist. */
  function fillUnit(unitId: number, selection: VariantSelection) {
    if (!db || !picker) return
    const resolved = resolveLogUnit(db, unitId, selection)
    update((l) => {
      const e = l.entries.find((x) => x.id === picker.entryId)
      if (!e) return
      const target = picker.side === 'left' ? e.left : e.rights[picker.index]
      if (!target) return
      const next: LogUnit = { ...resolved, id: target.id }
      if (picker.side === 'left') e.left = next
      else e.rights[picker.index] = next
    })
    setPicker(null)
  }

  function setLogo(logo: string | null) {
    if (!picker) return
    update((l) => {
      const e = l.entries.find((x) => x.id === picker.entryId)
      if (!e) return
      const target = picker.side === 'left' ? e.left : e.rights[picker.index]
      if (target) target.logo = logo
    })
    setPicker(null)
  }

  return (
    <div className="kill-log" id="log-root">
      {entries.length === 0 && !editMode && (
        <div className="kill-log-empty">{t(lang, 'emptyLog')}</div>
      )}
      {entries.map((entry) => {
        // View/export hides untouched victims so trailing placeholders don't
        // leak into the image; edit mode shows every slot so they stay fillable.
        const rights = editMode ? entry.rights : entry.rights.filter((r) => !isPristineVictim(r))
        return (
          <div className="log-entry" key={entry.id}>
            {/* first (full) row: killer + first victim */}
            <LogRow
              entry={entry}
              right={rights[0] ?? null}
              showLeft
              onLeftPicker={() => setPicker({ entryId: entry.id, side: 'left' })}
              onRightPicker={() => setPicker({ entryId: entry.id, side: 'right', index: 0 })}
              onRemoveVictim={entry.rights.length > 1 ? () => removeVictim(entry.id, 0) : undefined}
              onRemoveEntry={() => removeEntry(entry.id)}
            />
            {/* extra victims: right-only sub-rows */}
            {rights.slice(1).map((r, i) => (
              <LogRow
                key={r.id}
                entry={entry}
                right={r}
                showLeft={false}
                onRightPicker={() => setPicker({ entryId: entry.id, side: 'right', index: i + 1 })}
                onRemoveVictim={() => removeVictim(entry.id, i + 1)}
              />
            ))}
            {editMode && (
              <button className="log-add-victim edit-chrome" onClick={() => addVictim(entry.id)}>
                {t(lang, 'addVictim')}
              </button>
            )}
          </div>
        )
      })}

      {editMode && (
        <button className="log-add edit-chrome" onClick={addEntry}>
          {t(lang, 'addKill')}
        </button>
      )}

      {picker && (
        <LogUnitPicker
          onPick={fillUnit}
          onUpload={(dataUrl) => setLogo(dataUrl)}
          onClear={() => setLogo(null)}
          onCancel={() => setPicker(null)}
        />
      )}
    </div>
  )
}

function LogRow({
  entry,
  right,
  showLeft,
  onLeftPicker,
  onRightPicker,
  onRemoveVictim,
  onRemoveEntry,
}: {
  entry: LogEntry
  right: LogUnit | null
  showLeft: boolean
  onLeftPicker?: () => void
  onRightPicker: () => void
  onRemoveVictim?: () => void
  onRemoveEntry?: () => void
}) {
  const editMode = useAppStore((s) => s.editMode)
  const lang = useAppStore((s) => s.lang)
  return (
    <div className={`log-row ${showLeft ? 'full' : 'sub'}`}>
      {editMode && onRemoveEntry && (
        <button className="log-entry-remove edit-chrome" title={t(lang, 'removeKill')} onClick={onRemoveEntry}>
          ×
        </button>
      )}
      {/* col 1: killer (logo + name) */}
      <div className="log-unit left">
        {showLeft && <UnitCells unit={entry.left} side="left" onPicker={onLeftPicker!} />}
      </div>
      {/* col 2: killer points */}
      <div className="log-pts-col left">{showLeft && <Pts unit={entry.left} />}</div>
      {/* col 3: center gap keeps the point columns straddling the middle */}
      <div className="log-gap" />
      {/* col 4: victim points */}
      <div className="log-pts-col right">{right && <Pts unit={right} />}</div>
      {/* col 5: victim (logo + name) */}
      <div className="log-unit right">
        {right && (
          <UnitCells unit={right} side="right" onPicker={onRightPicker} onRemove={onRemoveVictim} />
        )}
        {!right && editMode && (
          <button className="log-add-inline edit-chrome" onClick={onRightPicker}>
            {t(lang, 'addVictimInline')}
          </button>
        )}
      </div>
    </div>
  )
}

/** Logo silhouette + editable name for one combatant, ordered logo→name. */
function UnitCells({
  unit,
  side,
  onPicker,
  onRemove,
}: {
  unit: LogUnit
  side: 'left' | 'right'
  onPicker: () => void
  onRemove?: () => void
}) {
  const editMode = useAppStore((s) => s.editMode)
  const lang = useAppStore((s) => s.lang)
  const update = useAppStore((s) => s.updateLog)
  const nameKey = `${unit.id}.name`
  return (
    <>
      <Logo unit={unit} side={side} onPicker={onPicker} />
      <EditableText
        className="log-name"
        value={unit.name}
        colorKey={nameKey}
        onChange={(v) => update((l) => void setUnitField(l, unit.id, (u) => (u.name = v)))}
      />
      {editMode && onRemove && (
        <button className="slot-remove inline edit-chrome" title={t(lang, 'removeVictim')} onClick={onRemove}>
          ×
        </button>
      )}
    </>
  )
}

/** Points value + " Pts" suffix; recolors together with any override. */
function Pts({ unit }: { unit: LogUnit }) {
  const update = useAppStore((s) => s.updateLog)
  const ptsKey = `${unit.id}.pts`
  const override = useAppStore((s) => s.log.textColors?.[ptsKey])
  return (
    <span className="log-pts" style={override ? { color: override } : undefined}>
      <EditableText
        className="log-pts-value"
        value={unit.points}
        colorKey={ptsKey}
        onChange={(v) => update((l) => void setUnitField(l, unit.id, (u) => (u.points = v)))}
      />
      <span className="log-pts-suffix">Pts</span>
    </span>
  )
}

/** Tinted silhouette (game thumbnail) or uploaded icon shown as-is. */
function Logo({ unit, side, onPicker }: { unit: LogUnit; side: 'left' | 'right'; onPicker: () => void }) {
  const editMode = useAppStore((s) => s.editMode)
  const lang = useAppStore((s) => s.lang)
  const override = useAppStore((s) => s.log.textColors?.[`${unit.id}.name`])
  const color = override ?? (side === 'left' ? DEFAULT_LEFT_COLOR : DEFAULT_RIGHT_COLOR)
  const uploaded = isUploadedImage(unit.logo)
  const src = uploaded ? unit.logo : thumbnailUrl(unit.logo)

  // in view mode a missing logo collapses so alignment isn't thrown off
  if (!editMode && !src) return null

  let inner: React.ReactNode
  if (!src) inner = <span className="log-logo empty" />
  else if (uploaded) inner = <img className="log-logo" src={src} alt={unit.name} />
  else
    inner = (
      <span
        className="log-logo tinted"
        style={{
          backgroundColor: color,
          WebkitMaskImage: `url("${src}")`,
          maskImage: `url("${src}")`,
        }}
      />
    )

  if (!editMode) return <span className="log-logo-wrap">{inner}</span>
  return (
    <button className="log-logo-btn" title={t(lang, 'chooseUnitUpload')} onClick={onPicker}>
      {inner}
    </button>
  )
}

/** Mutate a unit (left or any right) found by its stable id inside the log. */
function setUnitField(
  log: { entries: LogEntry[] },
  unitId: string,
  mutate: (u: LogUnit) => void,
) {
  for (const e of log.entries) {
    if (e.left.id === unitId) return mutate(e.left)
    const r = e.rights.find((x) => x.id === unitId)
    if (r) return mutate(r)
  }
}
