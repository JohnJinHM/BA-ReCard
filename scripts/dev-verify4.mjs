// Su-24M2: select 14xFAB100 (fuselage) + 12xFAB100 (inner) + 12xFAB100 (outer)
// → expect a single OFAB-100 slot with x38 total.
import { chromium } from 'playwright'

const shots = 'C:/Users/jinha/AppData/Local/Temp/claude/c--Projects-BA-ReCard/2214d531-6425-43ca-a075-6525d840eaef/scratchpad'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

await page.goto('http://localhost:5173/BA-ReCard/')
await page.waitForSelector('.picker-grid .picker-item', { timeout: 20000 })
await page.fill('.picker-search', 'su-24m2')
await page.waitForTimeout(300)
await page.click('.picker-grid .picker-item')
await page.waitForTimeout(600)

// pick the FAB100 option in every variant select that has one
const selects = page.locator('.variant-row select')
const n = await selects.count()
for (let i = 0; i < n; i++) {
  const texts = await selects.nth(i).locator('option').allInnerTexts()
  const j = texts.findIndex((t) => /FAB[- ]?100|OFAB/i.test(t))
  if (j >= 0) {
    await selects.nth(i).selectOption({ index: j })
    await page.waitForTimeout(400)
  }
}
await page.locator('#unit-card-root').screenshot({ path: `${shots}/40-su24m2-ofab.png` })
console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
