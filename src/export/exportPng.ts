import { toPng } from 'html-to-image'

/** Rasterize a DOM node (by id) to a PNG and trigger a download. The node's
 *  `.exporting` class hides edit-mode outlines/chrome (see card.css / log.css). */
export async function exportNodePng(nodeId: string, fileName: string, fallback: string): Promise<void> {
  const node = document.getElementById(nodeId)
  if (!node) throw new Error('Export element not found')
  node.classList.add('exporting')
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
  a.download = `${fileName.replace(/[^\w\-= ]+/g, '').trim() || fallback}.png`
  a.click()
}

/** Rasterize the unit card to a PNG and trigger a download. */
export function exportCardPng(fileName: string): Promise<void> {
  return exportNodePng('unit-card-root', fileName, 'unit-card')
}

/** Rasterize the kill-log board to a PNG and trigger a download. */
export function exportLogPng(fileName: string): Promise<void> {
  return exportNodePng('log-root', fileName, 'kill-log')
}
