// Exercise the real TypeScript resolver against every unit and loadout option.
// Also checks sparse defaults, localization and static-host asset paths.
import assert from 'node:assert/strict'
import { readFile, readdir, access } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const ROOT = fileURLToPath(new URL('../', import.meta.url))
const cache = new Map()
async function moduleUrl(path) {
  if (cache.has(path)) return cache.get(path)
  let code = ts.transpileModule(await readFile(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText.replaceAll('import.meta.env.BASE_URL', "'/'")
  for (const match of [...code.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)]) {
    const url = await moduleUrl(resolve(dirname(path), `${match[2]}.ts`))
    code = code.replace(match[0], `from '${url}'`)
  }
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  cache.set(path, url)
  return url
}
const load = async (path) => import(await moduleUrl(join(ROOT, 'src', path)))
const tables = {}
for (const file of await readdir(join(ROOT, 'public/data/tables')))
  tables[file.replace(/\.json$/, '')] = JSON.parse(await readFile(join(ROOT, 'public/data/tables', file), 'utf8'))
const eng = JSON.parse(await readFile(join(ROOT, 'public/data/localization/eng.json'), 'utf8'))
const chi = JSON.parse(await readFile(join(ROOT, 'public/data/localization/chi.json'), 'utf8'))
const { GameDb } = await load('data/db.ts')
const { resolveCard } = await load('data/resolve.ts')
const { WeaponType, WeaponTypeLocKey } = await load('data/enums.ts')
const assets = await load('assets.ts')
const db = new GameDb(tables, eng)
const localized = new GameDb(tables, chi, eng)
const reordered = new GameDb({ ...tables, Options: [...tables.Options].reverse(), Modifications: [...tables.Modifications].reverse() }, eng)
const checkedAssets = new Set()
// A Windows file lookup ignores case; the deployment host does not.
const assetFiles = new Set((await readdir(join(ROOT, 'public/assets'), { recursive: true }))
  .map((file) => `assets/${file.replace(/\\/g, '/')}`))
async function checkAsset(url) {
  if (!url || checkedAssets.has(url)) return
  checkedAssets.add(url)
  assert(assetFiles.has(decodeURIComponent(url.slice(1))), `Missing asset (including case): ${url}`)
}
async function checkCard(card) {
  assert(!/NaN|Infinity|undefined/.test(JSON.stringify(card)), `${card.name}: invalid card values`)
  await checkAsset(assets.portraitUrl(card.portrait))
  await checkAsset(assets.flagUrl(card.flagIcon))
  for (const line of [...card.stats, ...card.abilities, ...card.tags]) await checkAsset(assets.iconUrl(line.icon))
  for (const weapon of card.weapons) {
    await checkAsset(assets.weaponIconUrl(weapon.icon))
    for (const trait of [...weapon.traits, ...weapon.newTraits]) {
      await checkAsset(assets.iconUrl(trait.icon))
      await checkAsset(assets.iconUrl(trait.compactIcon))
    }
    for (const ammo of weapon.ammo) {
      await checkAsset(assets.ammoIconUrl(ammo.icon))
      for (const trait of [...ammo.traits, ...ammo.guidance]) await checkAsset(assets.iconUrl(trait.icon))
    }
  }
}
let optionCount = 0
for (const unit of tables.Units) {
  const selection = {}
  for (const mod of db.unitModifications.get(unit.Id) ?? []) {
    const opts = [...(db.modificationOptions.get(mod.Id) ?? [])].sort((a, b) => a.Order - b.Order || a.Id - b.Id)
    const opt = opts.find((o) => o.IsDefault) ?? opts[0]
    if (opt) selection[mod.Id] = opt.Id
  }
  const card = resolveCard(db, unit.Id)
  assert.deepEqual(card, resolveCard(db, unit.Id, selection), `${unit.HUDName}: implicit default differs from menu default`)
  assert.deepEqual(card, resolveCard(reordered, unit.Id), `${unit.HUDName}: depends on table order`)
  assert.deepEqual(card, resolveCard(localized, unit.Id), `${unit.HUDName}: changing UI language changes the English card`)
  await checkCard(card)
  await checkAsset(assets.thumbnailUrl(unit.ThumbnailFileName))
  for (const mod of db.unitModifications.get(unit.Id) ?? [])
    for (const opt of db.modificationOptions.get(mod.Id) ?? []) {
      await checkCard(resolveCard(db, unit.Id, { ...selection, [mod.Id]: opt.Id }))
      await checkAsset(assets.thumbnailUrl(opt.ThumbnailOverride))
      optionCount++
    }
}
const usedWeaponIds = new Set([
  ...tables.TurretWeapons.map((r) => r.WeaponId),
  ...tables.SquadMembers.flatMap((r) => [r.PrimaryWeaponId, r.SpecialWeaponId]),
])
for (const weapon of tables.Weapons) {
  if (!weapon.Type || !usedWeaponIds.has(weapon.Id)) continue
  assert(WeaponType[weapon.Type] && WeaponTypeLocKey[weapon.Type], `Unmapped weapon type ${weapon.Type}: ${weapon.Name}`)
  assert(eng[WeaponTypeLocKey[weapon.Type]], `Missing weapon-type localization: ${WeaponTypeLocKey[weapon.Type]}`)
}
console.log(`Verified ${tables.Units.length} units, ${optionCount} options, defaults, language consistency and ${checkedAssets.size} asset paths`)

// The DeckEditor copy also tests the actual rules, generator and encrypted codec.
try { await access(join(ROOT, 'src/deck/rules.ts')) } catch { process.exit(0) }
const rules = await load('deck/rules.ts')
const { CATEGORIES, DEK_VERSION } = await load('deck/model.ts')
const { slotsForSpecs, encodeDek, decodeDek } = await load('deck/dek.ts')
const { generateRandomDeck } = await load('deck/random.ts')
const { resolveUnitLabel } = await load('deck/label.ts')
let pairs = 0
for (const country of db.playableCountries()) {
  const specs = db.countrySpecializations(country.Id)
  for (let i = 0; i < specs.length; i++) for (let j = i + 1; j < specs.length; j++) {
    const base = { name: 'Database verification', countryId: country.Id, spec1: specs[i].Id, spec2: specs[j].Id, version: DEK_VERSION, slots: {} }
    base.slots = slotsForSpecs(db, base)
    assert.equal(rules.deckTotals(db, base).categories.reduce((sum, c) => sum + c.budget, 0), rules.totalBudget(db, base))
    for (const target of [5000, 10000]) {
      const deck = generateRandomDeck(db, base, { target })
      assert(rules.deckTotals(db, deck).spent <= target)
      assert.deepEqual(rules.validateDeck(db, deck).filter((issue) => issue.severity === 'error'), [])
      assert.deepEqual(await decodeDek(db, await encodeDek(db, deck)), deck)
      for (const category of CATEGORIES) for (const slot of deck.slots[category.key]) {
        if (slot.unitId == null) continue
        const card = resolveCard(db, slot.unitId, slot.options)
        assert.equal(Number(card.cost), rules.unitPrice(db, slot.unitId, slot.options))
        assert.equal(card.name, resolveUnitLabel(db, slot.unitId, slot.options).name)
      }
    }
    pairs++
  }
}
console.log(`Verified all ${pairs} specialization pairs, random decks, card pricing and .dek round trips`)
