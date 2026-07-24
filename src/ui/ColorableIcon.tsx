import { useState } from 'react'
import { useAppStore } from '../state/store'
import { useColorOverride } from '../state/colors'
import './colorableIcon.css'

interface Props {
  /** resolved sprite URL or data-URL; null renders the missing-icon box */
  src: string | null
  /** stable key into the model's color map — the ColorPanel recolors this */
  colorKey: string
  className?: string
  alt?: string
  title?: string
  /** tint while the icon has no override; null keeps the sprite's own colors
   *  (uploads, multi-colour art) until the user recolors it explicitly */
  tint?: string | null
}

/**
 * A card/log icon the sidebar ColorPanel can recolor: clicking it in edit mode
 * targets it (like focusing an EditableText does), and any override renders as
 * a CSS-mask tint of the sprite. The click is left to bubble, so icons that sit
 * inside a picker button still open their picker on the same click.
 */
export function ColorableIcon({ src, colorKey, className, alt, title, tint = null }: Props) {
  const editMode = useAppStore((s) => s.editMode)
  const setColorTarget = useAppStore((s) => s.setColorTarget)
  const isTarget = useAppStore((s) => s.colorTarget === colorKey)
  const override = useColorOverride(colorKey)
  // track WHICH src failed — components are reused across unit switches
  // (index keys), so a sticky boolean would blank icons of the next unit
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const classes = [className, editMode && 'icon-colorable', isTarget && 'color-target']
    .filter(Boolean)
    .join(' ')

  if (!src || failedSrc === src)
    return <span className={`${classes} img-missing`} title={title ?? alt} />

  const onClick = editMode ? () => setColorTarget(colorKey) : undefined
  const color = override ?? tint
  if (color == null)
    return (
      <img
        src={src}
        className={classes}
        alt={alt ?? ''}
        title={title}
        onClick={onClick}
        onError={() => setFailedSrc(src)}
      />
    )

  const mask = `url("${src}")`
  return (
    <span
      className={`${classes} tinted-icon`}
      title={title ?? alt}
      onClick={onClick}
      style={{ backgroundColor: color, WebkitMaskImage: mask, maskImage: mask }}
    />
  )
}
