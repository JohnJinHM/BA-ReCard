import { toPng } from 'html-to-image'

/** Rasterize the card DOM node to a PNG and trigger a download. */
export async function exportCardPng(fileName: string): Promise<void> {
  const node = document.getElementById('unit-card-root')
  if (!node) throw new Error('Card element not found')
  node.classList.add('exporting') // hides edit-mode outlines (card.css)
  let dataUrl: string
  try {
    dataUrl = await toPng(node, {
      pixelRatio: 2,
      cacheBust: true,
    })
  } finally {
    node.classList.remove('exporting')
  }
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${fileName.replace(/[^\w\- ]+/g, '').trim() || 'unit-card'}.png`
  a.click()
}
