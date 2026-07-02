// Dev smoke-test: drives the running dev server (npm run dev) with headless
// Chromium and captures screenshots + exercises variants/edit/export.
//   node scripts/dev-screenshot.mjs [outDir]
import { chromium } from 'playwright'

const shots = process.argv[2] ?? 'C:/Users/jinha/AppData/Local/Temp/claude/c--Projects-BA-ReCard/9936043a-67d5-4cfc-a6e3-d61634f84969/scratchpad'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto('http://localhost:5173/BA-ReCard/')
await page.waitForSelector('.picker-grid .picker-item', { timeout: 20000 })
await page.screenshot({ path: `${shots}/01-loaded.png` })

await page.fill('.picker-search', 'abrams')
await page.waitForTimeout(300)
await page.click('.picker-grid .picker-item')
await page.waitForSelector('#unit-card-root', { timeout: 10000 })
await page.waitForTimeout(800)
await page.screenshot({ path: `${shots}/02-card.png` })
await page.locator('#unit-card-root').screenshot({ path: `${shots}/03-card-only.png` })

// variant: pick the last armor option
const select = page.locator('.variant-row select').first()
if (await select.count()) {
  const values = await select.locator('option').allInnerTexts()
  await select.selectOption({ index: values.length - 1 })
  await page.waitForTimeout(500)
  await page.locator('#unit-card-root').screenshot({ path: `${shots}/05-variant.png` })
}

// edit mode: rewrite the cost
await page.click('button:has-text("Edit")')
const cost = page.locator('.points-value')
await cost.click()
await cost.press('Control+a')
await cost.pressSequentially('999')
await page.locator('.unit-name').click() // blur
await page.waitForTimeout(300)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/06-edited.png` })

// export png
const downloadPromise = page.waitForEvent('download', { timeout: 15000 })
await page.click('button:has-text("Export PNG")')
const download = await downloadPromise
await download.saveAs(`${shots}/07-exported.png`)

// compact mode
await page.click('button:has-text("Compact")')
await page.waitForTimeout(400)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/04-compact.png` })

console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
