// Extracts the card-relevant assets from the game's AssetRipper export into
// public/assets/. Source locations documented in docs/extracted/ASSETS.md.
//
//   node scripts/extract-assets.mjs [exportRoot]
//
// Portraits (816x550 RGBA PNG, ~290 MB total) are recompressed to WebP;
// everything else is copied verbatim.

import { mkdir, readdir, copyFile, readFile } from 'node:fs/promises'
import { join, basename, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const EXPORT_ROOT =
  process.argv[2] ?? 'C:/Users/jinha/Desktop/Temp/BA/ExportedProject'
const SRC = join(EXPORT_ROOT, 'Assets')
const OUT = fileURLToPath(new URL('../public/assets/', import.meta.url))

const IMG = join(SRC, 'Prefabs/GUI/HUD/Images')
const MOVED = join(SRC, 'Resources_moved/Images')

// DLC sprites live beside Icons/. Outline sprites keep their own subfolder;
// flattening them over the standard silhouettes would overwrite the artwork.
function spritePath(rel) {
  return `${rel.split('/').includes('outline') ? 'outline/' : ''}${basename(rel)}`
}

async function copyPngs(srcDir, outDir, { recurse = false, filter = () => true, outlines = false } = {}) {
  await mkdir(outDir, { recursive: true })
  const entries = await readdir(srcDir, { withFileTypes: true, recursive: recurse })
  let n = 0
  for (const e of entries) {
    if (!e.isFile() || !e.name.toLowerCase().endsWith('.png')) continue
    const source = join(e.parentPath ?? e.path, e.name)
    const rel = relative(srcDir, source).replace(/\\/g, '/')
    const name = spritePath(rel)
    if ((!outlines && name.startsWith('outline/')) || !filter(e.name, name)) continue
    const dest = join(outDir, name)
    await mkdir(dirname(dest), { recursive: true })
    await copyFile(source, dest)
    n++
  }
  return n
}

async function main() {
  const data = fileURLToPath(new URL('../public/data/tables/', import.meta.url))
  const units = JSON.parse(await readFile(join(data, 'Units.json'), 'utf8'))
  const options = JSON.parse(await readFile(join(data, 'Options.json'), 'utf8'))
  const thumbs = new Set([...units.map((u) => u.ThumbnailFileName), ...options.map((o) => o.ThumbnailOverride)]
    .filter(Boolean).map((n) => n.replace(/\\/g, '/')))
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
  console.log('weapons:', await copyPngs(join(MOVED, 'Weapons'), join(OUT, 'weapons'), { recurse: true }))
  console.log('ammo:', await copyPngs(join(MOVED, 'Ammunition'), join(OUT, 'ammo'), { recurse: true }))
  console.log(
    'thumbnails:',
    await copyPngs(join(MOVED, 'Labels'), join(OUT, 'thumbnails'), {
      recurse: true, outlines: true,
      filter: (_file, rel) => thumbs.has(rel.replace(/\.png$/i, '')),
    }),
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
  for (const entry of await readdir(portraitsRoot, { withFileTypes: true, recursive: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.png') || /_BASIC\.png$|_HOVER\.png$/.test(entry.name)) continue
    const source = join(entry.parentPath ?? entry.path, entry.name)
    const dest = join(OUT, 'portraits', relative(portraitsRoot, source).replace(/\.png$/, '.webp'))
    await mkdir(dirname(dest), { recursive: true })
    await sharp(source).webp({ quality: 85 }).toFile(dest)
    converted++
  }
  console.log(`portraits: ${converted}`)
}

await main()
