// Run from project root: node <this file>
// Verifies: Tu-22M3 fuselage variant + icon persistence, Su-35S ECM pods
// dedupe, KNT 4-tag column, compact count pill position.
import { chromium } from 'playwright'

const shots = 'C:/Users/jinha/AppData/Local/Temp/claude/c--Projects-BA-ReCard/2214d531-6425-43ca-a075-6525d840eaef/scratchpad'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))

async function pick(name) {
  await page.fill('.picker-search', name)
  await page.waitForTimeout(300)
  await page.click('.picker-grid .picker-item')
  await page.waitForTimeout(600)
}

await page.goto('http://localhost:5173/BA-ReCard/')
await page.waitForSelector('.picker-grid .picker-item', { timeout: 20000 })

// Tu-22M3: default, then change Fuselage variant (mod order: Bay, Fuselage, Wings)
await pick('tu-22')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/30-tu22-default.png` })
const selects = page.locator('.variant-row select')
const n = await selects.count()
console.log('tu-22 variant selects:', n)
// pick 18xFAB250 on the fuselage mod (2nd select, index 1 by Order)
await selects.nth(1).selectOption({ index: 1 })
await page.waitForTimeout(500)
await page.locator('#unit-card-root').screenshot({ path: `${shots}/31-tu22-fuselage.png` })

// then switch to another unit to confirm icons didn't go missing
await pick('bmp-3')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/32-bmp3-after-tu22.png` })

// Su-35S with ECM pods variant (find the select whose options mention ECM)
await pick('su-35')
const vsel = page.locator('.variant-row select')
const cnt = await vsel.count()
for (let i = 0; i < cnt; i++) {
  const texts = await vsel.nth(i).locator('option').allInnerTexts()
  const j = texts.findIndex((t) => /ECM/i.test(t))
  if (j >= 0) {
    await vsel.nth(i).selectOption({ index: j })
    await page.waitForTimeout(500)
    break
  }
}
await page.locator('#unit-card-root').screenshot({ path: `${shots}/33-su35-ecm.png` })

// KNT (4 tag icons)
await pick('knt')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/34-knt.png` })

// Airborne Snipers (stealth = 1/x) + BMP-3 (compact pill position)
await pick('airborne snipers')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/35-snipers.png` })

console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
