// Captures cards matching the /samples in-game screenshots (BMP-3 compact,
// AH-1W Supercobra expanded) plus the category tabs, for visual comparison.
//   node scripts/dev-compare.mjs [outDir]
import { chromium } from 'playwright'

const shots = process.argv[2] ?? 'C:/Users/jinha/AppData/Local/Temp/claude/c--Projects-BA-ReCard/bbc435b5-ec4d-4520-860a-1ef67c3ed072/scratchpad'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto('http://localhost:5173/BA-ReCard/')
await page.waitForSelector('.picker-grid .picker-item', { timeout: 20000 })

// category sanity: Recon tab should have units now
await page.click('.picker-tabs button:has-text("Recon")')
await page.waitForTimeout(300)
await page.screenshot({ path: `${shots}/10-recon-tab.png` })

// BMP-3 compact (default view)
await page.fill('.picker-search', 'bmp-3')
await page.waitForTimeout(300)
await page.click('.picker-grid .picker-item')
await page.waitForSelector('#unit-card-root', { timeout: 10000 })
await page.waitForTimeout(800)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/11-bmp3-compact.png` })

// AH-1W expanded
await page.fill('.picker-search', 'supercobra')
await page.waitForTimeout(300)
await page.click('.picker-grid .picker-item')
await page.waitForTimeout(600)
await page.click('button:has-text("Expanded")')
await page.waitForTimeout(400)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/12-ah1w-expanded.png` })

// Chinese localization: toggle language, re-select BMP-3, capture compact card
await page.click('.lang-toggle')
await page.waitForTimeout(1200)
await page.click('button:has-text("Compact")')
await page.waitForTimeout(400)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/13-chi-compact.png` })
await page.click('button:has-text("Expanded")')
await page.waitForTimeout(400)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/14-chi-expanded.png` })
await page.screenshot({ path: `${shots}/15-chi-app.png` })

console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
