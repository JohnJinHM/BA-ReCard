// Check a production preview after refreshing the game's database and sprites.
import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'))
const isDeck = pkg.name === 'ba-deckeditor'
const BASE = process.argv[2] ?? (isDeck
  ? 'http://127.0.0.1:4173/BA-DeckEditor/'
  : 'http://127.0.0.1:4174/BA-ReCard/')
const out = join(tmpdir(), 'ba-refresh-ui', pkg.name)
await mkdir(out, { recursive: true })
const units = JSON.parse(await readFile(join(ROOT, 'public/data/tables/Units.json'), 'utf8'))
const eng = JSON.parse(await readFile(join(ROOT, 'public/data/localization/eng.json'), 'utf8'))
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })

try {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  if (isDeck) {
    await page.waitForSelector('.setup-dialog')
    await page.getByRole('button', { name: 'Russia', exact: true }).click()
    const specs = JSON.parse(await readFile(join(ROOT, 'public/data/tables/Specializations.json'), 'utf8'))
    const guard = specs.find((s) => s.Id === 12)
    const other = specs.find((s) => s.CountryId === 1 && s.ShowInHangar && s.Id !== 12)
    await page.locator('.spec-card', { hasText: eng[guard.UIName] }).click()
    await page.locator('.spec-card', { hasText: eng[other.UIName] }).click()
    await page.click('.setup-actions button.primary')
    await page.waitForSelector('.pool-overview')
  } else {
    await page.waitForSelector('.picker-item')
    await page.fill('.picker-search', 'Ka-52 Alligator')
    await page.locator('.picker-item[title="Ka-52 Alligator"]').click()
    const before = await page.locator('.points-value').innerText()
    const choices = page.locator('.variant-row select')
    for (let i = 0; i < await choices.count(); i++)
      await choices.nth(i).selectOption(await choices.nth(i).inputValue())
    assert.equal(await page.locator('.points-value').innerText(), before,
      'explicit menu defaults changed the initially displayed loadout cost')
  }

  const categoryKeys = ['ui_arsenal_category_rec', 'ui_arsenal_category_inf', 'ui_arsenal_category_veh',
    'ui_arsenal_category_sup', 'ui_arsenal_category_log', 'ui_arsenal_category_hel', 'ui_arsenal_category_air']
  // Shchuka has no specialization-availability row in the shipped build.
  for (const id of isDeck ? [224, 314, 636] : [224, 314, 627, 636]) {
    const unit = units.find((u) => u.Id === id)
    if (isDeck) {
      const category = page.locator('.category-row', { hasText: eng[categoryKeys[unit.CategoryType]] })
      if (!(await category.getAttribute('class')).includes('active')) await category.click()
      await page.fill('.pool-search', unit.HUDName.trim())
      await page.locator('.pool-card:not([disabled])').first().click()
    } else {
      await page.fill('.picker-search', unit.HUDName.trim())
      await page.locator('.picker-item').first().click()
    }
    await page.locator('#unit-card-root .unit-name').filter({ hasText: unit.HUDName.trim() }).waitFor()
    await page.waitForFunction(() => [...document.querySelectorAll('#unit-card-root img')]
      .every((image) => image.complete && image.naturalWidth > 0))
    await page.waitForLoadState('networkidle')
    await page.evaluate(() => document.fonts.ready)
    assert(await page.locator('#unit-card-root .unit-name').innerText(), `no card for ${unit.HUDName}`)
    const broken = await page.locator('#unit-card-root img').evaluateAll((images) =>
      images.filter((image) => !image.complete || !image.naturalWidth).map((image) => image.src))
    assert.deepEqual(broken, [], `${unit.HUDName}: broken card image`)
    await page.locator('#unit-card-root').screenshot({ path: join(out, `${id}.png`) })
  }

  if (!isDeck) {
    await page.getByRole('button', { name: 'Edit', exact: true }).click()
    const cost = page.locator('.points-value')
    await cost.click()
    await cost.press('Control+a')
    await cost.pressSequentially('999')
    await page.locator('.unit-name').click()
    assert.equal(await cost.innerText(), '999')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export PNG', exact: true }).click()
    const file = await download
    const path = join(out, 'edited-card.png')
    await file.saveAs(path)
    assert.deepEqual([...(await readFile(path)).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  }
  assert.deepEqual(errors, [], 'browser errors or failed asset requests')
  console.log(`Verified DLC3 cards${isDeck ? ' and Russian Guard selection' : ', default loadouts, editing and PNG export'}; screenshots: ${out}`)
} finally {
  await browser.close()
}
