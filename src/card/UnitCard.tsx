import { useState } from 'react'
import type { CardModel, WeaponModel } from './model'
import { EditableText } from './EditableText'
import { ammoIconUrl, chromeUrl, flagUrl, iconUrl, portraitUrl, weaponIconUrl } from '../assets'
import { useAppStore } from '../state/store'
import './card.css'

// Layout mirrors the game's "Unit Info Card" prefab: 408x710, top hero bar
// 274px, 1px divider, bottom weapons area 435px with a 108px weapon-list
// column. Numbers from docs/extracted/PREFAB_LAYOUT.md.

function Img({ src, className, alt, style }: {
  src: string | null
  className?: string
  alt?: string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <span className={`${className ?? ''} img-missing`} title={alt} />
  return (
    <img src={src} className={className} alt={alt ?? ''} style={style} onError={() => setFailed(true)} />
  )
}

export function UnitCard({ card }: { card: CardModel }) {
  const compact = useAppStore((s) => s.compact)
  const [selectedWeapon, setSelectedWeapon] = useState(0)
  const weapon = card.weapons[Math.min(selectedWeapon, card.weapons.length - 1)] ?? null

  return (
    <div className="unit-card" id="unit-card-root">
      <TopInfoBar card={card} />
      <div className="h-divider" />
      {compact ? (
        <BottomCompactBar card={card} />
      ) : card.weapons.length > 0 ? (
        <div className="bottom-info-bar">
          <div className="weapon-list">
            {card.weapons.map((w, i) => (
              <button
                key={i}
                className={`weapon-list-btn ${i === selectedWeapon ? 'active' : ''}`}
                onClick={() => setSelectedWeapon(i)}
                title={w.name}
              >
                <Img className="weapon-list-icon" src={weaponIconUrl(w.icon)} alt={w.name} />
                <span className="weapon-list-name">{w.name}</span>
              </button>
            ))}
          </div>
          <div className="v-divider" />
          {weapon && (
            <WeaponDetail
              weapon={weapon}
              index={Math.min(selectedWeapon, card.weapons.length - 1)}
            />
          )}
        </div>
      ) : (
        <div className="bottom-empty-bar">Unit has no weapons</div>
      )}
    </div>
  )
}

function TopInfoBar({ card }: { card: CardModel }) {
  const update = useAppStore((s) => s.updateCard)
  return (
    <div className="top-info-bar">
      <Img className="hero-portrait" src={portraitUrl(card.portrait)} alt={card.name} />
      <img className="hero-gradient top" src={chromeUrl('Unit Info Card Background Top')} alt="" />
      <img className="hero-gradient right" src={chromeUrl('Unit Info Card Background Right')} alt="" />
      <img className="hero-gradient bottom" src={chromeUrl('Unit Info Card Background Bottom')} alt="" />

      <div className="name-points-row">
        {card.flagIcon && <Img className="card-flag" src={flagUrl(card.flagIcon)} alt="flag" />}
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
          <img className="points-icon" src={iconUrl('Points Icon')!} alt="points" />
        </div>
      </div>

      {card.abilities.length > 0 && (
        <div className="abilities-row">
          {card.abilities.map((a, i) => (
            <span className="ability-item" key={i} title={`${a.name}${a.detail ? ` ${a.detail}` : ''}`}>
              <Img className="ability-icon" src={iconUrl(a.icon)} alt={a.name} />
              {a.detail && <span className="ability-count">{a.detail.replace(/^x/, '')}</span>}
            </span>
          ))}
        </div>
      )}

      {card.armor && <ArmorOverlay card={card} />}

      <div className="stats-row">
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

      {card.dlcBadge && <span className="dlc-badge">{card.dlcBadge}</span>}
    </div>
  )
}

function ArmorOverlay({ card }: { card: CardModel }) {
  return (
    <div className="armor-overlay">
      <div className="armor-type-icons">
        <img src={iconUrl('Kinetic Armor Icon')!} alt="Kinetic" title="Kinetic armor" />
        <img className="heat" src={iconUrl('HEAT Armor Icon')!} alt="HEAT" title="HEAT armor" />
      </div>
      <ArmorBlock card={card} facing="top" label="Top" className="pos-top" />
      <ArmorBlock card={card} facing="rear" label="Rear" className="pos-rear" />
      <ArmorBlock card={card} facing="front" label="Front" className="pos-front" />
      <ArmorBlock card={card} facing="sides" label="Sides" className="pos-sides" />
    </div>
  )
}

function ArmorBlock({ card, facing, label, className }: {
  card: CardModel
  facing: 'front' | 'sides' | 'rear' | 'top'
  label: string
  className: string
}) {
  const update = useAppStore((s) => s.updateCard)
  const f = card.armor![facing]
  return (
    <div className={`armor-block ${className}`}>
      <span className="armor-title">{label}</span>
      <div className="armor-values">
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
          value={weapon.name}
          onChange={(v) => update((c) => void (c.weapons[index]!.name = v))}
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
        <span className="ammo-block-title">Munitions:</span>
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
      <div className="compact-header">
        <img src={chromeUrl('Penetration Icon')} alt="Penetration" title="Penetration" />
        <img src={chromeUrl('Damage Icon')} alt="Damage" title="Damage" />
        <img src={chromeUrl('Accuracy Icon')} alt="Range" title="Range" />
      </div>
      {card.weapons.map((w, wi) => (
        <div className="compact-weapon" key={wi}>
          <div className="compact-weapon-left">
            <EditableText
              className="compact-weapon-name"
              value={w.name}
              onChange={(v) => update((c) => void (c.weapons[wi]!.name = v))}
            />
            <Img className="compact-weapon-icon" src={weaponIconUrl(w.icon)} alt={w.name} />
          </div>
          <div className="compact-ammo-col">
            {w.ammo.map((a, ai) => (
              <div className="compact-ammo" key={ai}>
                <div className="compact-ammo-main">
                  <Img className="ammo-image" src={ammoIconUrl(a.icon)} alt={a.name} />
                  <span className="pill yellow">{a.compact.range}</span>
                  <span className="pill green">{a.quantity}</span>
                </div>
                <div className="compact-ammo-stats">
                  <EditableText
                    className="compact-stat"
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
                    value={a.compact.range}
                    onChange={(v) =>
                      update((c) => void (c.weapons[wi]!.ammo[ai]!.compact.range = v))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
