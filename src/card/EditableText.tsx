import { useRef } from 'react'
import { useAppStore } from '../state/store'

interface Props {
  value: string
  onChange(next: string): void
  className?: string
}

/**
 * Inline-editable text span. In edit mode every card value renders through
 * this, so any number/text on the card can be rewritten directly.
 */
export function EditableText({ value, onChange, className }: Props) {
  const editMode = useAppStore((s) => s.editMode)
  const ref = useRef<HTMLSpanElement>(null)

  if (!editMode) return <span className={className}>{value}</span>

  return (
    <span
      ref={ref}
      className={`${className ?? ''} editable`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
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
