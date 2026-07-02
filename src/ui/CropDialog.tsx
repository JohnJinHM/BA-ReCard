import { useCallback, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

// In-game portraits are 816×550 (docs/extracted/ASSETS.md); uploads are
// cropped to that aspect and resampled to the same size.
export const PORTRAIT_W = 816
export const PORTRAIT_H = 550

interface Props {
  imageSrc: string
  onCancel(): void
  onDone(dataUrl: string): void
}

export function CropDialog({ imageSrc, onCancel, onDone }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setArea(pixels)
  }, [])

  async function confirm() {
    if (!area) return
    const img = await loadImage(imageSrc)
    const canvas = document.createElement('canvas')
    canvas.width = PORTRAIT_W
    canvas.height = PORTRAIT_H
    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      img,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      PORTRAIT_W,
      PORTRAIT_H,
    )
    onDone(canvas.toDataURL('image/png'))
  }

  return (
    <div className="crop-overlay">
      <div className="crop-dialog">
        <div className="crop-area">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={PORTRAIT_W / PORTRAIT_H}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="crop-controls">
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button onClick={onCancel}>Cancel</button>
          <button className="primary" onClick={confirm} disabled={!area}>
            Use portrait
          </button>
        </div>
      </div>
    </div>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
