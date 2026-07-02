// Verifies the round of fixes: BMP-3M variant (name/ECM), Su-34 ECM chip,
// Ognemetchiki sprint chip, optics values, dividers, DLC tags.
//   node scripts/dev-verify2.mjs [outDir]
import { chromium } from 'playwright'

const shots = process.argv[2] ?? 'C:/Users/jinha/AppData/Local/Temp/claude/c--Projects-BA-ReCard/bbc435b5-ec4d-4520-860a-1ef67c3ed072/scratchpad'
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

// BMP-3 → select BMP-3M turret option (weapon package select, option index 1)
await pick('bmp-3')
const weaponSel = page.locator('.variant-row select').first()
await weaponSel.selectOption({ index: 1 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${shots}/20-bmp3m-app.png` })
await page.locator('#unit-card-root').screenshot({ path: `${shots}/21-bmp3m.png` })

// Su-34 default (should show ECM chip)
await pick('su-34')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/22-su34.png` })

// Ognemetchiki (sprint chip without count, smoke x1)
await pick('ognemet')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/23-ognemetchiki.png` })

// a DLC unit
await pick('vilkas')
await page.locator('#unit-card-root').screenshot({ path: `${shots}/24-dlc-vilkas.png` })

console.log('console errors:', errors.length ? errors.slice(0, 10) : 'none')
await browser.close()
