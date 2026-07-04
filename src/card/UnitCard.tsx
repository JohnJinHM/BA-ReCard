import { createContext, useContext, useMemo, useState } from 'react'
import type { CardModel, WeaponModel } from './model'
import { emptyWeapon, emptyAmmo, emptyTag } from './model'
import { EditableText } from './EditableText'
import { ammoIconUrl, chromeUrl, iconUrl, isUploadedImage, portraitUrl, weaponIconUrl } from '../assets'
import { useAppStore } from '../state/store'
import { WeaponType, WeaponTypeLocKey } from '../data/enums'
import { PickerDialog, type PickerItem } from '../ui/PickerDialog'
import { TAG_ICON_NAMES, prettyIconName } from '../ui/iconLibrary'
import './card.css'

// Layout mirrors the game's "Unit Info Card" prefab: 408x710, top hero bar
// 274px (210px portrait + 64px stats strip), 1px divider, bottom weapons area.
// Geometry from docs/extracted/PREFAB_LAYOUT.md, refined against /samples.

function Img({ src, className, alt, style }: {
  src: string | null
  className?: string
  alt?: string
  style?: React.CSSProperties
}) {
  // track WHICH src failed — components are reused across unit switches
  // (index keys), so a sticky boolean would blank icons of the next unit
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!src || failedSrc === src)
    return <span className={`${className ?? ''} img-missing`} title={alt} />
  return (
    <img src={src} className={className} alt={alt ?? ''} style={style} onError={() => setFailedSrc(src)} />
  )
}

/** Monochrome sprite tinted via CSS mask (game tints these at runtime too). */
function TintIcon({ src, color, className, title }: {
  src: string | null
  color: string
  className?: string
  title?: string
}) {
  if (!src) return <span className={`${className ?? ''} img-missing`} />
  const mask = `url("${src}")`
  return (
    <span
      className={className}
      title={title}
      style={{
        display: 'inline-block',
        backgroundColor: color,
        WebkitMaskImage: mask,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskImage: mask,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}

// ── Slot-editing plumbing (add/remove/pick), shared across the card ─────────
// Number of customizable tag-icon slots in the portrait's right column.
const TAG_SLOTS = 4

interface SlotCtx {
  openWeaponPicker(index: number): void
  openTagPicker(index: number): void
  openAmmoPicker(weaponIndex: number, ammoIndex: number): void
  addWeapon(): void
  removeWeapon(index: number): void
  addAmmo(weaponIndex: number): void
  removeAmmo(weaponIndex: number, ammoIndex: number): void
}
const SlotContext = createContext<SlotCtx | null>(null)
const useSlots = () => useContext(SlotContext)!

/** Weapon count badge; editable (number only) in edit mode. */
function WeaponCount({ value, onChange }: { value: string; onChange(v: string): void }) {
  const editMode = useAppStore((s) => s.editMode)
  if (!editMode) return value ? <span className="weapon-count">{value}</span> : null
  const num = value.replace(/\D/g, '')
  return (
    <span className={`weapon-count count-edit ${num ? '' : 'empty'}`}>
      x
      <EditableText
        className="count-num"
        value={num}
        onChange={(v) => {
          const n = parseInt(v.replace(/\D/g, ''), 10)
          onChange(Number.isFinite(n) && n > 1 ? `x${n}` : '')
        }}
      />
    </span>
  )
}

/** Small "×" button to remove a slot (edit mode only). */
function RemoveBtn({ onClick, className }: { onClick(): void; className?: string }) {
  return (
    <button
      className={`slot-remove edit-chrome ${className ?? ''}`}
      title="Remove"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      ×
    </button>
  )
}

export function UnitCard({ card }: { card: CardModel }) {
  const compact = useAppStore((s) => s.compact)
  const editMode = useAppStore((s) => s.editMode)
  const db = useAppStore((s) => s.db)
  const update = useAppStore((s) => s.updateCard)
  const [selectedWeapon, setSelectedWeapon] = useState(0)
  const weaponIdx = Math.min(selectedWeapon, card.weapons.length - 1)
  const weapon = card.weapons[weaponIdx] ?? null

  // picker target: which slot the picker dialog is filling
  const [picker, setPicker] = useState<
    | { kind: 'weapon'; index: number }
    | { kind: 'tag'; index: number }
    | { kind: 'ammo'; weaponIndex: number; ammoIndex: number }
    | null
  >(null)

  const weaponItems = useMemo<PickerItem[]>(() => {
    if (!db) return []
    const seen = new Set<string>()
    const items: PickerItem[] = []
    for (const w of db.tables.Weapons) {
      const key = `${w.HUDIcon}|${w.HUDName}|${w.Type}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push({
        key: String(w.Id),
        label: db.cardLoc(w.HUDName) || w.Name || w.HUDIcon || `Weapon ${w.Id}`,
        url: weaponIconUrl(w.HUDIcon),
      })
    }
    return items.sort((a, b) => a.label.localeCompare(b.label))
  }, [db])

  const ammoItems = useMemo<PickerItem[]>(() => {
    if (!db) return []
    const seen = new Set<string>()
    const items: PickerItem[] = []
    for (const a of db.tables.Ammunitions) {
      const key = `${a.HUDIcon}|${a.HUDName}`
      if (seen.has(key)) continue
      seen.add(key)
      items.push({
        key: String(a.Id),
        label: db.cardLoc(a.HUDName) || a.Name || a.HUDIcon || `Ammo ${a.Id}`,
        url: ammoIconUrl(a.HUDIcon),
      })
    }
    return items.sort((a, b) => a.label.localeCompare(b.label))
  }, [db])

  const tagItems = useMemo<PickerItem[]>(
    () => TAG_ICON_NAMES.map((n) => ({ key: n, label: prettyIconName(n), url: iconUrl(n) })),
    [],
  )

  const slots: SlotCtx = {
    openWeaponPicker: (index) => setPicker({ kind: 'weapon', index }),
    openTagPicker: (index) => setPicker({ kind: 'tag', index }),
    openAmmoPicker: (weaponIndex, ammoIndex) => setPicker({ kind: 'ammo', weaponIndex, ammoIndex }),
    addWeapon: () => update((c) => void c.weapons.push(emptyWeapon())),
    removeWeapon: (index) => update((c) => void c.weapons.splice(index, 1)),
    addAmmo: (wi) => update((c) => void c.weapons[wi]?.ammo.push(emptyAmmo())),
    removeAmmo: (wi, ai) => update((c) => void c.weapons[wi]?.ammo.splice(ai, 1)),
  }

  function pickWeapon(weaponId: string) {
    if (picker?.kind !== 'weapon' || !db) return
    const w = db.weapons.get(Number(weaponId))
    const index = picker.index
    if (w)
      update((c) => {
        const slot = c.weapons[index]
        if (!slot) return
        slot.icon = w.HUDIcon
        slot.name = db.cardLoc(w.HUDName) || w.Name || slot.name
        slot.typeLabel = db.cardLocOr(WeaponTypeLocKey[w.Type], WeaponType[w.Type] ?? slot.typeLabel)
      })
    setPicker(null)
  }

  function uploadWeapon(dataUrl: string) {
    if (picker?.kind !== 'weapon') return
    const index = picker.index
    update((c) => void (c.weapons[index] && (c.weapons[index]!.icon = dataUrl)))
    setPicker(null)
  }

  function pickAmmo(ammoId: string) {
    if (picker?.kind !== 'ammo' || !db) return
    const a = db.ammunitions.get(Number(ammoId))
    const { weaponIndex, ammoIndex } = picker
    if (a)
      update((c) => {
        const slot = c.weapons[weaponIndex]?.ammo[ammoIndex]
        if (!slot) return
        slot.icon = a.HUDIcon
        slot.name = db.cardLoc(a.HUDName) || a.Name || slot.name
      })
    setPicker(null)
  }

  function uploadAmmo(dataUrl: string) {
    if (picker?.kind !== 'ammo') return
    const { weaponIndex, ammoIndex } = picker
    update((c) => {
      const slot = c.weapons[weaponIndex]?.ammo[ammoIndex]
      if (slot) slot.icon = dataUrl
    })
    setPicker(null)
  }

  function setTag(index: number, icon: string | null, name: string) {
    update((c) => {
      while (c.tags.length < TAG_SLOTS) c.tags.push(emptyTag())
      c.tags[index] = { icon, name, detail: c.tags[index]?.detail ?? '' }
      // drop trailing empties so view mode / export stay clean
      while (c.tags.length && !c.tags[c.tags.length - 1]!.icon) c.tags.pop()
    })
  }

  return (
    <SlotContext.Provider value={slots}>
      <div className="unit-card" id="unit-card-root">
        <TopInfoBar card={card} />
        <div className="h-divider" />
        {card.weapons.length === 0 ? (
          editMode ? (
            <div className="bottom-empty-bar">
              <button className="add-weapon-btn edit-chrome" onClick={slots.addWeapon}>
                + Add weapon
              </button>
            </div>
          ) : (
            <div className="bottom-empty-bar">
              {db?.cardLocOr('ui_infocard_no_weapons', 'Unit has no weapons') ?? 'Unit has no weapons'}
            </div>
          )
        ) : compact ? (
          <BottomCompactBar card={card} />
        ) : (
          <div className="bottom-info-bar">
            <div className="weapon-list">
              {card.weapons.map((w, i) => (
                <div className="weapon-list-item" key={i}>
                  <div
                    className={`weapon-list-btn ${i === weaponIdx ? 'active' : ''}`}
                    role="button"
                    onClick={() => setSelectedWeapon(i)}
                  >
                    <WeaponCount
                      value={w.count}
                      onChange={(v) => update((c) => void (c.weapons[i]!.count = v))}
                    />
                    {editMode ? (
                      <button
                        className="weapon-icon-btn"
                        title="Change weapon / icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          slots.openWeaponPicker(i)
                        }}
                      >
                        <Img
                          className={`weapon-list-icon ${isUploadedImage(w.icon) ? 'no-flip' : ''}`}
                          src={weaponIconUrl(w.icon)}
                          alt={w.name}
                        />
                      </button>
                    ) : (
                      <Img
                        className={`weapon-list-icon ${isUploadedImage(w.icon) ? 'no-flip' : ''}`}
                        src={weaponIconUrl(w.icon)}
                        alt={w.name}
                      />
                    )}
                    <EditableText
                      className="weapon-list-name"
                      value={w.name}
                      onChange={(v) => update((c) => void (c.weapons[i]!.name = v))}
                    />
                  </div>
                  {editMode && <RemoveBtn onClick={() => slots.removeWeapon(i)} />}
                </div>
              ))}
              {editMode && (
                <button className="add-weapon-btn list edit-chrome" onClick={slots.addWeapon}>
                  + Add
                </button>
              )}
            </div>
            <div className="v-divider" />
            {weapon && <WeaponDetail weapon={weapon} index={weaponIdx} />}
          </div>
        )}
      </div>

      {picker?.kind === 'weapon' && (
        <PickerDialog
          title="Select weapon"
          items={weaponItems}
          iconClassName="mirror"
          onPick={pickWeapon}
          onUpload={uploadWeapon}
          onCancel={() => setPicker(null)}
        />
      )}
      {picker?.kind === 'ammo' && (
        <PickerDialog
          title="Select ammo"
          items={ammoItems}
          onPick={pickAmmo}
          onUpload={uploadAmmo}
          onCancel={() => setPicker(null)}
        />
      )}
      {picker?.kind === 'tag' && (
        <PickerDialog
          title="Select tag icon"
          items={tagItems}
          onPick={(key) => {
            setTag(picker.index, key, prettyIconName(key))
            setPicker(null)
          }}
          onUpload={(dataUrl) => {
            setTag(picker.index, dataUrl, 'Custom tag')
            setPicker(null)
          }}
          onClear={() => {
            setTag(picker.index, null, '')
            setPicker(null)
          }}
          onCancel={() => setPicker(null)}
        />
      )}
    </SlotContext.Provider>
  )
}

function TopInfoBar({ card }: { card: CardModel }) {
  const update = useAppStore((s) => s.updateCard)
  const editMode = useAppStore((s) => s.editMode)
  const slots = useSlots()
  // The right column holds at most TAG_SLOTS icons total; resolved abilities
  // take priority and the editable tag slots fill only the room that remains.
  const abilities = card.abilities
  const tagCapacity = Math.max(0, TAG_SLOTS - abilities.length)
  const shownTags = card.tags.filter((t) => t.icon).slice(0, tagCapacity)
  const showTagsCol = abilities.length > 0 || shownTags.length > 0 || (editMode && tagCapacity > 0)
  return (
    <div className="top-info-bar">
      <div className="hero">
        <Img className="hero-portrait" src={portraitUrl(card.portrait)} alt={card.name} />
        <img className="hero-gradient top" src={chromeUrl('Unit Info Card Background Top')} alt="" />
        <img className="hero-gradient right" src={chromeUrl('Unit Info Card Background Right')} alt="" />
        <img className="hero-gradient bottom" src={chromeUrl('Unit Info Card Background Bottom')} alt="" />

        <div className="name-points-row">
          <EditableText
            className="unit-name"
            value={card.name}
            onChange={(v) => update((c) => void (c.name = v))}
          />
          <div className="points-block">
            <EditableText
              className="points-value"
              value={card.cost}
              onChange={(v) => update((c) => void (c.cost = v))}
            />
            <TintIcon className="points-icon" src={iconUrl('Points Icon')} color="#f4d42a" title="points" />
          </div>
        </div>

        {card.armorOverlay && card.armor && (
          <div className="armor-type-icons">
            <TintIcon
              className="armor-type-icon"
              src={iconUrl('Kinetic Armor Icon')}
              color="#e7f8e5"
              title="Kinetic armor"
            />
            <TintIcon
              className="armor-type-icon"
              src={iconUrl('HEAT Armor Icon')}
              color="#f66b06"
              title="HEAT armor"
            />
          </div>
        )}
        {card.armorOverlay && card.armor && <ArmorOverlay card={card} />}

        <div className="right-strip-divider" />
        {showTagsCol && (
          <div className="tags-col">
            {editMode
              ? Array.from({ length: tagCapacity }, (_, i) => {
                  const t = card.tags[i]
                  if (t?.icon)
                    return (
                      <span className="tag-item" key={`t${i}`} title={t.name}>
                        <button
                          className="tag-edit-btn"
                          title="Change or clear tag icon"
                          onClick={() => slots.openTagPicker(i)}
                        >
                          <Img className="tag-icon" src={iconUrl(t.icon)} alt={t.name} />
                          <span className="tag-edit-hint edit-chrome">✎</span>
                        </button>
                      </span>
                    )
                  return (
                    <button
                      className="tag-item tag-placeholder edit-chrome"
                      key={`t${i}`}
                      title="Add tag icon"
                      onClick={() => slots.openTagPicker(i)}
                    >
                      +
                    </button>
                  )
                })
              : shownTags.map((t, i) => (
                  <span className="tag-item" key={`t${i}`} title={t.name}>
                    <Img className="tag-icon" src={iconUrl(t.icon)} alt={t.name} />
                  </span>
                ))}
            {abilities.map((a, i) => (
              <span className="tag-item" key={`a${i}`} title={a.name}>
                <Img className="tag-icon" src={iconUrl(a.icon)} alt={a.name} />
                {a.detail && <span className="tag-pill">{a.detail}</span>}
              </span>
            ))}
          </div>
        )}

        <div className="stats-divider" />
        <div className="stats-strip">
          {card.stats.map((s, i) => (
            <div className="stat-item" key={i} title={s.label}>
              <Img className="stat-icon" src={iconUrl(s.icon)} alt={s.label} />
              <EditableText
                className="stat-caption"
                value={s.value}
                onChange={(v) => update((c) => void (c.stats[i]!.value = v))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ArmorOverlay({ card }: { card: CardModel }) {
  return (
    <div className="armor-overlay">
      <ArmorBlock card={card} facing="top" className="pos-top" layout="row" />
      <ArmorBlock card={card} facing="rear" className="pos-rear" layout="col" />
      <ArmorBlock card={card} facing="front" className="pos-front" layout="col" />
      <ArmorBlock card={card} facing="sides" className="pos-sides" layout="row" />
    </div>
  )
}

function ArmorBlock({ card, facing, className, layout }: {
  card: CardModel
  facing: 'front' | 'sides' | 'rear' | 'top'
  className: string
  layout: 'row' | 'col'
}) {
  const update = useAppStore((s) => s.updateCard)
  const f = card.armor![facing]
  return (
    <div className={`armor-block ${className}`}>
      <EditableText
        className="armor-title"
        value={card.armorLabels[facing]}
        onChange={(v) => update((c) => void (c.armorLabels[facing] = v))}
      />
      <div className={`armor-values ${layout}`}>
        <EditableText
          className="armor-kin"
          value={f.kinetic}
          onChange={(v) => update((c) => void (c.armor![facing].kinetic = v))}
        />
        <EditableText
          className="armor-heat"
          value={f.heat}
          onChange={(v) => update((c) => void (c.armor![facing].heat = v))}
        />
      </div>
    </div>
  )
}

function WeaponDetail({ weapon, index }: { weapon: WeaponModel; index: number }) {
  const update = useAppStore((s) => s.updateCard)
  const editMode = useAppStore((s) => s.editMode)
  const slots = useSlots()
  return (
    <div className="weapon-detail">
      <div className="weapon-top-bar">
        <EditableText
          className="weapon-title"
          value={weapon.typeLabel || weapon.name}
          onChange={(v) => update((c) => void (c.weapons[index]!.typeLabel = v))}
        />
        <div className="weapon-traits">
          {weapon.traits.map((t, i) => (
            <Img key={i} className="trait-icon" src={iconUrl(t.icon)} alt={t.tooltip} />
          ))}
        </div>
      </div>

      <div className="weapon-stats">
        {weapon.stats.map((s, si) => (
          <div className="stats-item" key={si}>
            <EditableText
              className="stats-item-label"
              value={s.label}
              onChange={(v) => update((c) => void (c.weapons[index]!.stats[si]!.label = v))}
            />
            <EditableText
              className="stats-item-value"
              value={s.value}
              onChange={(v) => update((c) => void (c.weapons[index]!.stats[si]!.value = v))}
            />
          </div>
        ))}
      </div>

      <div className="ammo-block">
        {weapon.ammo.map((a, ai) => (
          <div className="ammo-info" key={ai}>
            <div className="ammo-top-row">
              {editMode ? (
                <button
                  className="weapon-icon-btn"
                  title="Change ammo / icon"
                  onClick={() => slots.openAmmoPicker(index, ai)}
                >
                  <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
                </button>
              ) : (
                <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
              )}
              <EditableText
                className="ammo-title"
                value={a.name}
                onChange={(v) => update((c) => void (c.weapons[index]!.ammo[ai]!.name = v))}
              />
              <EditableText
                className="ammo-count"
                value={a.quantity}
                onChange={(v) => update((c) => void (c.weapons[index]!.ammo[ai]!.quantity = v))}
              />
              {editMode && (
                <RemoveBtn className="inline" onClick={() => slots.removeAmmo(index, ai)} />
              )}
            </div>
            {a.traits.length > 0 && (
              <div className="ammo-traits">
                {a.traits.map((t, ti) => (
                  <Img key={ti} className="trait-icon" src={iconUrl(t.icon)} alt={t.tooltip} />
                ))}
              </div>
            )}
            <div className="ammo-stats">
              {a.stats.map((s, si) => (
                <div className="stats-item" key={si}>
                  <EditableText
                    className="stats-item-label"
                    value={s.label}
                    onChange={(v) =>
                      update((c) => void (c.weapons[index]!.ammo[ai]!.stats[si]!.label = v))
                    }
                  />
                  <EditableText
                    className="stats-item-value"
                    value={s.value}
                    onChange={(v) =>
                      update((c) => void (c.weapons[index]!.ammo[ai]!.stats[si]!.value = v))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        {editMode && (
          <button className="add-weapon-btn ammo edit-chrome" onClick={() => slots.addAmmo(index)}>
            + Add ammo
          </button>
        )}
      </div>
    </div>
  )
}

function BottomCompactBar({ card }: { card: CardModel }) {
  const update = useAppStore((s) => s.updateCard)
  const editMode = useAppStore((s) => s.editMode)
  const slots = useSlots()
  return (
    <div className="bottom-compact-bar">
      <div className="compact-grid compact-header">
        <span />
        <img src={chromeUrl('Penetration Icon')} alt="Penetration" title="Penetration" />
        <img src={chromeUrl('Damage Icon')} alt="Damage" title="Damage" />
        <img src={chromeUrl('Accuracy Icon')} alt="Accuracy" title="Accuracy" />
      </div>
      {card.weapons.map((w, wi) => (
        <div className="compact-weapon" key={wi}>
          <div className="compact-weapon-left">
            {editMode && <RemoveBtn className="compact-remove" onClick={() => slots.removeWeapon(wi)} />}
            <EditableText
              className="compact-weapon-name"
              value={w.name}
              onChange={(v) => update((c) => void (c.weapons[wi]!.name = v))}
            />
            {/* icon first so the absolutely-positioned pill paints above it */}
            {editMode ? (
              <button
                className="weapon-icon-btn"
                title="Change weapon / icon"
                onClick={() => slots.openWeaponPicker(wi)}
              >
                <Img
                  className={`compact-weapon-icon ${isUploadedImage(w.icon) ? 'no-flip' : ''}`}
                  src={weaponIconUrl(w.icon)}
                  alt={w.name}
                />
              </button>
            ) : (
              <Img
                className={`compact-weapon-icon ${isUploadedImage(w.icon) ? 'no-flip' : ''}`}
                src={weaponIconUrl(w.icon)}
                alt={w.name}
              />
            )}
            <WeaponCount value={w.count} onChange={(v) => update((c) => void (c.weapons[wi]!.count = v))} />
          </div>
          <div className="compact-ammo-col">
            {w.ammo.map((a, ai) => (
              <div className="compact-grid compact-ammo" key={ai}>
                <div className="compact-ammo-main">
                  <EditableText
                    className="pill yellow"
                    value={a.rangePill}
                    onChange={(v) => update((c) => void (c.weapons[wi]!.ammo[ai]!.rangePill = v))}
                  />
                  {editMode ? (
                    <button
                      className="weapon-icon-btn ammo-icon-btn"
                      title="Change ammo / icon"
                      onClick={() => slots.openAmmoPicker(wi, ai)}
                    >
                      <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
                    </button>
                  ) : (
                    <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
                  )}
                  <EditableText
                    className="pill green"
                    value={a.quantity}
                    onChange={(v) => update((c) => void (c.weapons[wi]!.ammo[ai]!.quantity = v))}
                  />
                  {editMode && (
                    <RemoveBtn
                      className="compact-ammo-remove"
                      onClick={() => slots.removeAmmo(wi, ai)}
                    />
                  )}
                </div>
                <EditableText
                  className={`compact-stat ${a.compact.isHeat ? 'heat' : ''}`}
                  value={a.compact.penetration}
                  onChange={(v) =>
                    update((c) => void (c.weapons[wi]!.ammo[ai]!.compact.penetration = v))
                  }
                />
                <EditableText
                  className="compact-stat"
                  value={a.compact.damage}
                  onChange={(v) =>
                    update((c) => void (c.weapons[wi]!.ammo[ai]!.compact.damage = v))
                  }
                />
                <EditableText
                  className="compact-stat"
                  value={a.compact.accuracy}
                  onChange={(v) =>
                    update((c) => void (c.weapons[wi]!.ammo[ai]!.compact.accuracy = v))
                  }
                />
              </div>
            ))}
            {editMode && (
              <button className="add-weapon-btn ammo edit-chrome" onClick={() => slots.addAmmo(wi)}>
                + Add ammo
              </button>
            )}
          </div>
        </div>
      ))}
      {editMode && (
        <button className="add-weapon-btn compact edit-chrome" onClick={slots.addWeapon}>
          + Add weapon
        </button>
      )}
    </div>
  )
}
