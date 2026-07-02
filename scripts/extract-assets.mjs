// Extracts the card-relevant assets from the game's AssetRipper export into
// public/assets/. Source locations documented in docs/extracted/ASSETS.md.
//
//   node scripts/extract-assets.mjs [exportRoot]
//
// Portraits (816x550 RGBA PNG, ~290 MB total) are recompressed to WebP;
// everything else is copied verbatim.

import { cp, mkdir, readdir, copyFile, stat } from 'node:fs/promises'
import { join, basename } from 'node:path'
import sharp from 'sharp'

const EXPORT_ROOT =
  process.argv[2] ?? 'C:/Users/jinha/Desktop/Temp/BA/ExportedProject'
const SRC = join(EXPORT_ROOT, 'Assets')
const OUT = new URL('../public/assets/', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1',
)

const IMG = join(SRC, 'Prefabs/GUI/HUD/Images')
const MOVED = join(SRC, 'Resources_moved/Images')

async function copyPngs(srcDir, outDir, { recurse = false, filter = () => true } = {}) {
  await mkdir(outDir, { recursive: true })
  const entries = await readdir(srcDir, { withFileTypes: true, recursive: recurse })
  let n = 0
  for (const e of entries) {
    if (!e.isFile() || !e.name.toLowerCase().endsWith('.png') || !filter(e.name)) continue
    await copyFile(join(e.parentPath ?? e.path, e.name), join(outDir, e.name))
    n++
  }
  return n
}

async function main() {
  // 1. Infocard stat/trait/target icons — flattened
  let n = await copyPngs(join(IMG, 'Infocard'), join(OUT, 'icons'), { recurse: true })
  // card chrome + config-referenced icons living outside the Infocard tree
  for (const rel of [
    'Menu/pinned.png',
    'Menu/pin.png',
    'Menu/Kinetic.png',
    'Menu/HEAT.png',
    'collapse.png',
    'expand.png',
    'ActionPanel/Ability_Radar.png',
    'ActionPanel/Order_Stop.png',
    'ActionPanel/FireMission/FM_Ammo_Smoke.png',
  ]) {
    await copyFile(join(IMG, rel), join(OUT, 'icons', basename(rel)))
    n++
  }
  console.log(`icons: ${n}`)

  // 2. Card background/border sprites from the Arsenal images folder
  try {
    n = await copyPngs(join(SRC, 'Prefabs/GUI/Arsenal/Images'), join(OUT, 'chrome'))
    console.log(`chrome: ${n}`)
  } catch (e) {
    console.warn('chrome skipped:', e.message)
  }

  // 3. Weapon / ammo icons, thumbnails, flags — verbatim
  console.log('weapons:', await copyPngs(join(MOVED, 'Weapons/Icons'), join(OUT, 'weapons')))
  console.log('ammo:', await copyPngs(join(MOVED, 'Ammunition/Icons'), join(OUT, 'ammo')))
  console.log(
    'thumbnails:',
    await copyPngs(join(MOVED, 'Labels/Icons'), join(OUT, 'thumbnails')),
  )
  console.log(
    'flags:',
    await copyPngs(join(MOVED, 'Nations & Specs/Flags'), join(OUT, 'flags')),
  )

  // 4. Fonts (Inter statics)
  await mkdir(join(OUT, 'fonts'), { recursive: true })
  let fonts = 0
  for (const f of await readdir(join(SRC, 'Font'))) {
    if (/^Inter-(Regular|Medium|SemiBold|Bold|ExtraBold)\.ttf$/.test(f)) {
      await copyFile(join(SRC, 'Font', f), join(OUT, 'fonts', f))
      fonts++
    }
  }
  console.log(`fonts: ${fonts}`)

  // 5. Portraits: default variant only, PNG → WebP (~290 MB → ~20 MB)
  const portraitsRoot = join(MOVED, 'UnitPortraits')
  let converted = 0
  for (const country of await readdir(portraitsRoot)) {
    const countryDir = join(portraitsRoot, country)
    if (!(await stat(countryDir)).isDirectory()) continue
    for (const unit of await readdir(countryDir)) {
      const unitDir = join(countryDir, unit)
      if (!(await stat(unitDir)).isDirectory()) continue
      for (const f of await readdir(unitDir)) {
        if (!f.endsWith('.png') || /_BASIC\.png$|_HOVER\.png$/.test(f)) continue
        const outDir = join(OUT, 'portraits', country, unit)
        await mkdir(outDir, { recursive: true })
        await sharp(join(unitDir, f))
          .webp({ quality: 85 })
          .toFile(join(outDir, f.replace(/\.png$/, '.webp')))
        converted++
      }
    }
  }
  console.log(`portraits: ${converted}`)
}

await main()
