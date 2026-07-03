import { useState } from 'react'
import type { CardModel, WeaponModel } from './model'
import { EditableText } from './EditableText'
import { ammoIconUrl, chromeUrl, iconUrl, portraitUrl, weaponIconUrl } from '../assets'
import { useAppStore } from '../state/store'
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

export function UnitCard({ card }: { card: CardModel }) {
  const compact = useAppStore((s) => s.compact)
  const db = useAppStore((s) => s.db)
  const [selectedWeapon, setSelectedWeapon] = useState(0)
  const weaponIdx = Math.min(selectedWeapon, card.weapons.length - 1)
  const weapon = card.weapons[weaponIdx] ?? null

  return (
    <div className="unit-card" id="unit-card-root">
      <TopInfoBar card={card} />
      <div className="h-divider" />
      {card.weapons.length === 0 ? (
        <div className="bottom-empty-bar">
          {db?.cardLocOr('ui_infocard_no_weapons', 'Unit has no weapons') ?? 'Unit has no weapons'}
        </div>
      ) : compact ? (
        <BottomCompactBar card={card} />
      ) : (
        <div className="bottom-info-bar">
          <div className="weapon-list">
            {card.weapons.map((w, i) => (
              <button
                key={i}
                className={`weapon-list-btn ${i === weaponIdx ? 'active' : ''}`}
                onClick={() => setSelectedWeapon(i)}
                title={w.name}
              >
                {w.count && <span className="weapon-count">{w.count}</span>}
                <Img className="weapon-list-icon" src={weaponIconUrl(w.icon)} alt={w.name} />
                <span className="weapon-list-name">{w.name}</span>
              </button>
            ))}
          </div>
          <div className="v-divider" />
          {weapon && <WeaponDetail weapon={weapon} index={weaponIdx} />}
        </div>
      )}
    </div>
  )
}

function TopInfoBar({ card }: { card: CardModel }) {
  const update = useAppStore((s) => s.updateCard)
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
        {(card.abilities.length > 0 || card.tags.length > 0) && (
          <div className="tags-col">
            {card.tags.map((t, i) => (
              <span className="tag-item" key={`t${i}`} title={t.name}>
                <Img className="tag-icon" src={iconUrl(t.icon)} alt={t.name} />
              </span>
            ))}
            {card.abilities.map((a, i) => (
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
              <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
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
      </div>
    </div>
  )
}

function BottomCompactBar({ card }: { card: CardModel }) {
  const update = useAppStore((s) => s.updateCard)
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
            <EditableText
              className="compact-weapon-name"
              value={w.name}
              onChange={(v) => update((c) => void (c.weapons[wi]!.name = v))}
            />
            {w.count && <span className="weapon-count">{w.count}</span>}
            <Img className="compact-weapon-icon" src={weaponIconUrl(w.icon)} alt={w.name} />
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
                  <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
                  <EditableText
                    className="pill green"
                    value={a.quantity}
                    onChange={(v) => update((c) => void (c.weapons[wi]!.ammo[ai]!.quantity = v))}
                  />
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
          </div>
        </div>
      ))}
    </div>
  )
}
