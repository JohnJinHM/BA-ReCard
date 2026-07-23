// LogModel: the "kill log" view model — a list of kill entries, each with a
// left unit (the killer) and one or more right units (its victims). Mirrors
// the in-game kill feed. Like CardModel it is a plain serializable object the
// editor mutates directly, so every visible field stays customizable.

import type { GameDb } from '../data/db'
import type { CardModel } from '../card/model'
import { resolveCard, type VariantSelection } from '../data/resolve'

/** One combatant shown on a log row (killer on the left, victim on the right). */
export interface LogUnit {
  /** stable id — keys textColor overrides so add/remove never misaligns them */
  id: string
  /** source unit id, null for fully custom rows */
  unitId: number | null
  name: string
  /** points value only (the " Pts" suffix is rendered by the view) */
  points: string
  /** thumbnail sprite name (white silhouette, tinted) or data-URL (upload) */
  logo: string | null
}

/** A kill entry: one killer and the victims it accounts for. The first victim
 *  shares the killer's full row; extra victims stack as right-only sub-rows. */
export interface LogEntry {
  id: string
  left: LogUnit
  rights: LogUnit[]
}

export interface LogModel {
  entries: LogEntry[]
  /** per-field text color overrides, keyed by "{unit.id}.name" / "{unit.id}.pts" */
  textColors?: Record<string, string>
}

export function newLogId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function emptyLogUnit(): LogUnit {
  return { id: newLogId(), unitId: null, name: 'Unit', points: '0', logo: null }
}

/** A victim slot the user never filled — hidden in view/export mode. */
export function isPristineVictim(u: LogUnit): boolean {
  return u.unitId === null && !u.logo && u.name === 'Unit' && u.points === '0'
}

/** Build a LogUnit from a resolved unit + variant selection (name/points/logo). */
export function resolveLogUnit(
  db: GameDb,
  unitId: number,
  selection: VariantSelection = {},
): LogUnit {
  const card = resolveCard(db, unitId, selection)
  return logUnitFromCard(db, card)
}

/** Build a LogUnit from an already-resolved (possibly edited) card. */
export function logUnitFromCard(db: GameDb, card: CardModel): LogUnit {
  const unit = card.unitId != null ? db.units.get(card.unitId) : null
  return {
    id: newLogId(),
    unitId: card.unitId,
    name: card.name,
    points: card.cost,
    logo: unit?.ThumbnailFileName ?? null,
  }
}

/** A new kill entry seeded with `left` as the killer and one blank victim. */
export function emptyLogEntry(left: LogUnit): LogEntry {
  return { id: newLogId(), left, rights: [emptyLogUnit()] }
}

export function emptyLog(): LogModel {
  return { entries: [] }
}

/** Drop a removed unit's color overrides (keyed by its stable id). */
export function removeUnitColors(log: LogModel, unitId: string) {
  if (!log.textColors) return
  for (const key of Object.keys(log.textColors))
    if (key.startsWith(`${unitId}.`)) delete log.textColors[key]
}
