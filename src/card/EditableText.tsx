import { useRef } from 'react'
import { useAppStore } from '../state/store'
import { useColorOverride } from '../state/colors'

interface Props {
  value: string
  onChange(next: string): void
  className?: string
  /** stable key into card.textColors; when set, focusing the span in edit
   *  mode targets it for the sidebar ColorPanel and the override colors it */
  colorKey?: string
}

/**
 * Inline-editable text span. In edit mode every card value renders through
 * this, so any number/text on the card can be rewritten directly — and, for
 * spans with a colorKey, recolored via the sidebar ColorPanel.
 */
export function EditableText({ value, onChange, className, colorKey }: Props) {
  const editMode = useAppStore((s) => s.editMode)
  const color = useColorOverride(colorKey)
  const isColorTarget = useAppStore((s) => colorKey != null && s.colorTarget === colorKey)
  const setColorTarget = useAppStore((s) => s.setColorTarget)
  const ref = useRef<HTMLSpanElement>(null)

  const style = color ? { color } : undefined
  if (!editMode)
    return (
      <span className={className} style={style}>
        {value}
      </span>
    )

  return (
    <span
      ref={ref}
      className={`${className ?? ''} editable ${isColorTarget ? 'color-target' : ''}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={() => {
        if (colorKey) setColorTarget(colorKey)
      }}
      onBlur={() => {
        const next = ref.current?.innerText ?? ''
        if (next !== value) onChange(next)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          ref.current?.blur()
        }
      }}
    >
      {value}
    </span>
  )
}
