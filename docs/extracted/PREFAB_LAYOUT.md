# Broken Arrow — Arsenal "Unit Info Card" Prefab Layout (extracted)

Source: AssetRipper export at `C:\Users\jinha\Desktop\Temp\BA\ExportedProject\Assets\Prefabs\GUI\Arsenal\Infocard\`
Unity 2022.3, uGUI + TextMeshPro. Extracted 2026-07-01 by parsing prefab YAML.

## 0. Prefabs in the Infocard folder

- Unit Info Card.prefab (main expanded card, 14207 lines)
- Unit Info Card Compact Weapon Info.prefab
- Unit Ammo Compact Info.prefab
- Unit Missiles Bombs Compact Info.prefab
- Unit Info Card Ammo Info.prefab
- Unit Info Card Stats item.prefab
- Unit Info Card Unit Stats Item.prefab
- Unit Info Card Abilities Item.prefab
- Unit Info Trait Item.prefab
- Unit Info Missiles Trait Item Variant.prefab
- Unit Modifications Panel.prefab
- Unit Options Panel.prefab

## 1. Global numbers

| Property | Value |
|---|---|
| Root card size | **408 x 710 px** (RectTransform sizeDelta of `Unit Info Card`) |
| Root anchoring | anchorMin/Max (0,1)-(0,1), pivot (0,1) — positioned from top-left of parent |
| Canvas reference resolution | **1920 x 1080** (CanvasScaler in Hangar_Scene / GUI canvases; ScaleWithScreenSize) |
| Top Info Bar height | **274 px** (LayoutElement Min/PreferredHeight) |
| Bottom Info Bar height | 710 − 274 − 1 (divider) = **435 px** (confirmed by `Bottom Info Empty Bar` 408x435 and Vertical Divider MinHeight=435) |
| Weapon list column | 108 px wide; ammo/weapon detail column min 299 px; 1 px vertical divider between |
| Card background | flat color `#1E1E1E` at alpha 0.80 (`#1E1E1ECC`), plus sliced 4-px border sprite tinted `#E7F8E5` |

### Color palette (hex RGBA)

| Use | Color |
|---|---|
| Card body / dark panels | `#1E1E1ECC` (root, 80% alpha); `#1E1E1EFF` (Top Info Bar base); `#1E1E1EFA` (skin menu overlay); `#1E1E1E7A` (small icon buttons, 48% alpha) |
| Primary text / icons (off-white green tint) | `#E7F8E5FF` |
| Points / distance-badge yellow | `#F4D42AFF` |
| HEAT armor value orange | `#F66B06FF` (icon tint variant `#ED7A27FF`) |
| Count badge green | `#7CFF81FF` (badge text dark `#0F0525FF`) |
| Dividers | white at 60% alpha `#FFFFFF99`, 1 px thick |
| Scrollbar track ends / handle | `#767D74FF` / `#767D75FF`, 4 px wide track |
| Compact row background | `#FFFFFF1A` (white 10%) |
| Ammo row hover / click | `#FFFFFF33` / `#FFFFFF4C` |
| DLC accent (border/ribbon) | `#8F0EA9FF` |

### Fonts (all Inter, TMP SDF assets under `Assets/Resources_moved/Fonts/Inter/`)

| GUID | Font asset |
|---|---|
| 528b2926b154e37449426a9511420ca5 | **Inter-ExtraBold SDF - shadow** (headers, values, unit name) |
| 15140430b7953e3438975cc41d6e450c | Inter-SemiBold SDF - shadow |
| dc5957aeb9410434a9841d5c7f1e1587 | Inter-Medium SDF - shadow |
| d61628bbb312780458dc780a6fc5e35b | Inter-Regular SDF - shadow (labels/titles) |
| a58bf51b007516b4f9f294185369975d | Inter-Bold SDF - shadow (tiny badges) |
| 8c50eab7e1d21fe438c56f2dfe364230 | Inter-Bold SDF |
| b2deb9a678248184d9ae5be447003555 | Inter-Medium SDF |

Typical text styles:

| Element | Font | Size | Color | Tracking |
|---|---|---|---|---|
| Unit name | Inter-ExtraBold | 20 | #E7F8E5 | charSpacing 6 (≈ letter-spacing 0.06em in TMP units) |
| Points value | Inter-ExtraBold | 20 | #F4D42A | 6 |
| Armor labels (Front/Sides/Top/Rear) | Inter-Regular | 14 | #E7F8E5 | 6 |
| Armor values | Inter-ExtraBold | 14 | #E7F8E5 (kinetic) / #F66B06 (HEAT) | 6 |
| Weapon title | Inter-ExtraBold | 14 | #E7F8E5 | 6 |
| "Munitions:" label | Inter-Regular | 12 | #E7F8E5 | 6 |
| Ammo row title/count | Inter-ExtraBold | 12 | #E7F8E5 | 6 |
| Stats row label / value | Inter-Regular / Inter-SemiBold | 12 | #E7F8E5 | 6 |
| Unit stat item caption | Inter-Regular | 12 | #E7F8E5 | 6 |
| Compact weapon name / stats | Inter-SemiBold | 12 | #FFFFFF / #E7F8E5 | 0 |
| Badge text (x5, 3500m) | Inter-Bold | 10 | #0F0525 | 0 |

TMP charSpacing 6 ≈ `letter-spacing: 0.06em`.

## 2. Key sprites (GUID → asset)

| GUID | Asset (relative to Assets/) | Note |
|---|---|---|
| d007ffde30edee646ba3fa5834cefda2 | Prefabs/GUI/Arsenal/Images/**Unit Info Card Background Top**.asset | 1624x320 px source; used as 78-px-tall top gradient strip over hero image |
| 5172f6cfe7e0ddc48b6ea5eb53829d8b | Prefabs/GUI/Arsenal/Images/**Unit Info Card Background Right**.asset | 252x1092 px; 68-px-wide right gradient strip |
| 37084b21a2c9c464f94682e0df432ee9 | Prefabs/GUI/Arsenal/Images/**Unit Info Card Background Bottom**.asset | 1624x252 px; 64-px-tall bottom gradient strip |
| 80da6e06c67153143a9a581b0be9409d | Prefabs/GUI/Arsenal/Images/**Unit Info Compact View Background**.asset | 692x336; compact row bg, drawn at 256 px wide, alpha 10% |
| 8b179bf189b124743b289c7415028a31 | Prefabs/GUI/Elements/Images/**Button Border New**.asset | 9-sliced, border 4/4/4/4 px; card + button outline |
| b0e257b5513af104e984ee4b0f73235b | Prefabs/GUI/Arsenal/Images/**Ability Count Background**.asset | 9-sliced badge pill (border 6/7/7/7) |
| 22e203ec4d96d3841836c7b3ce942348 | Prefabs/GUI/HUD/Images/Infocard/**Points Icon**.asset | 24x24, tinted #F4D42A |
| fd2f7daae44416749936204956de5e8f | Prefabs/GUI/HUD/Images/Menu/**Horizontal Divider**.asset | 1 px divider, #FFFFFF99 |
| 9206592f333d9194b89e9dfa1e348778 | Prefabs/GUI/HUD/Images/Menu/**Vertical Divider**.asset | 1 px divider, #FFFFFF99 |
| c9096ea2e8f5e8e47afee2e9baba034c | Resources_moved/Images/UnitPortraits/RU/INGENERY/INGENERY.asset | placeholder hero portrait (swapped at runtime) |
| dd19a97c26e3ec84ca40223b949f07a3 | Prefabs/GUI/HUD/Images/Infocard/**Kinetic Armor Icon**.asset | 32x32 |
| 5ad1fb5a035f8c44b9057469423947a0 | Prefabs/GUI/HUD/Images/Infocard/**HEAT Armor Icon**.asset | 32x32, tint #ED7A27 |
| 7451d32089e194a45a96538cd8535c19 | Prefabs/GUI/Arsenal/Images/**Stats Diff Up Icon**.asset | 8x12 diff arrow |
| 945e5ca60de0dc24d8d1259be401d93d | Prefabs/GUI/Arsenal/Images/**Penetration Icon**.asset | 20x20 header icon |
| b01a8a00c223e934fa150ac6602914c2 | Prefabs/GUI/Arsenal/Images/**Damage Icon**.asset | 20x20 |
| c77a5c41079582a4594ef35f4a796fac | Prefabs/GUI/Arsenal/Images/**Accuracy Icon**.asset | 20x20 |
| d86918030ebcfd049a31e92dfcc273b1 | Prefabs/GUI/Arsenal/Images/**Ammo Info Expansion Arrow Up**.asset | 16x16 expand chevron |
| def6858f406237d4dab8c1942ceffa12 / f5a8db10b6645854cbf7ec8d31cbfcec | Ammo Info Expansion **Hover** / **Click**.asset | row hover/press overlays |
| 7da7a1e5918993e468d4295ba4ef0ab0 | Prefabs/GUI/Elements/Images/**Attach 2 Icon**.asset | top-right button icon |
| 40110f5e5216d2247b442cf5cdf698d8 | Prefabs/GUI/Arsenal/Images/**Skin (Paint) Icon**.asset | top-right button icon |
| 4e6e5425ac17a1d44a93ab8e38ad1b9b / 18a78f82d56beb040ae43997f3958a56 | Elements/Images/**Toggle Off / On Icon**.asset | compact-mode toggle |
| 0d31961fead5f9942b65a755afca140a | HUD/Images/Infocard/General icons/**Health points.inf**.asset | ammo target-type icon example |
| eab503f9e87c66645bffa79d3d6836a0 / 6d17ab69a47762341a36eee6cffbbbe7 | Resources_moved/Images/Ammunition/Icons/AMMO_*.asset | ammo silhouettes, drawn 84x18 |
| b68244dd45b3a924b9409ef562215661 | Profile/Images/**Star Filled Icon**.asset | unit-stat icon example (32x32) |
| daa930b86f0fb2d43b4be66e814617c8 / 89273ddf3ad48bb4f96bd1bd24a04e8f | HUD/Images/Infocard/Target type icons/** | trait icons (24x24 / 20x20) |
| 0bffeb3d98f345c418ac754c66bdb1d5 | GUI/Loader/Loader_atlas_56.asset | BA logo watermark, 126x126, "no weapons" state |
| 0000000000000000f000000000000000 | Unity built-in (Background) | scrollbar track, sliced |

## 3. Structure summary (expanded card, 408x710)

The card is a single **vertical layout stack** (VerticalLayoutGroup, no padding, spacing 0, childControl W+H):

```
Unit Info Card (408x710, bg #1E1E1ECC, 4px sliced border #E7F8E5)
├─ Top Info Bar ................ 408x274  (hero image area)
├─ Horizontal Divider .......... 408x1    (#FFFFFF99)
└─ Bottom Info Bar ............. 408x435  (weapons two-column area)
    ├─ Weapon List ............. 108 wide (vertical scroll of weapon buttons)
    ├─ Vertical Divider ........ 1x435    (#FFFFFF99)
    └─ Selected Weapon/Ammo .... min 299 wide (scroll; pad t/b 10, spacing 15)
```

**Top Info Bar (274 px tall)** — stacked full-bleed backgrounds + overlay content:
- `Background Base` — full-rect fill `#1E1E1EFF`
- `Background Unit Image` — full-rect unit portrait (stretched)
- `Background Top` — top strip, height 78, gradient sprite (dark→transparent)
- `Background Right` — right strip, width 68, gradient sprite
- `Background Bottom` — bottom strip, height 64, gradient sprite
- `Name and Points Block` — HLayout, padding 16/12/12/0 (l/r/t/b), MinHeight 48:
  - `Name`: Inter-ExtraBold 20, `#E7F8E5`, left-top, letterSpacing 6 ("Ka-52 Aligator")
  - `Points` (MinWidth 80): value Inter-ExtraBold 20 `#F4D42A` right-aligned + 24x24 Points icon tinted `#F4D42A`, spacing 4
- `Abilities` — HLayout anchored across (pad right 10, spacing 12, upper-right, width 408): runtime-filled row of 32x32 ability icons (Unit Info Card Abilities Item) with a 1x162 vertical divider and 36-wide unit-menu scroll column
- `Statistics` — HLayout at bottom, pad l16/r12, spacing 14, height 64: runtime-filled with `Unit Info Card Unit Stats Item` (50x70: 32x32 icon over Inter-Regular 12 caption)
- `Right Top Button Group` — anchored top-right, pos(36,0) size 32 wide, VLayout spacing 4; three 32x32 buttons (Attach / Skin / Compact toggle): bg `#1E1E1E7A`, icon inset 4 px (size -8), icon tint `#E7F8E5`
- `Vehicles Armor Info` (inactive by default; shown for vehicles over the portrait): four corner blocks (Front lower-left, Sides lower-right, Rear upper-right, Top upper-center) each = Inter-Regular 14 title + kinetic value (Inter-ExtraBold 14 `#E7F8E5`) and HEAT value (`#F66B06`); armor-type icons column at left (32x32, HEAT tinted `#ED7A27`); 8x12 diff arrows optional

**Bottom Info Bar (435 px tall)** — HLayout, childForceExpand height:
- `Weapon List` (108 px): vertical ScrollRect, content top-anchored, no spacing; 4-px scrollbar on right edge (track `#767D74`, handle `#767D75`, 2-px end caps)
- `Vertical Divider` 1x435 `#FFFFFF99`
- `Selected Weapon/Ammo Info Block` (min 299): VLayout pad t10/b10 spacing 15
  - `Weapon Main Info` (VLayout spacing 16)
    - `Top Bar` (HLayout pad-left 4, MinHeight 24): weapon `Title` Inter-ExtraBold 14 `#E7F8E5` + `Traits Block` right-aligned (pad-right 32, spacing 8; 24x24 trait icons, min 60 wide)
    - `Statistics` VLayout — runtime rows of `Unit Info Card Stats item`
  - `Ammunitions Info Block` (VLayout spacing 2)
    - `Title` "Munitions:" Inter-Regular 12 (pad-left 10)
    - `Ammunitions` VLayout spacing 16, min width 268 — runtime rows of `Unit Info Card Ammo Info`
  - Scrollbar: 4 px, offset pos(-8,-3), height -18

**Other root-level (inactive) states:**
- `Bottom Compact Info Bar` 408x104 — compact mode: header row 28 px tall with three 20x20 stat icons (Penetration/Damage/Accuracy, `#E7F8E5`) right-aligned (pad-right 34, spacing 32), then rows of `Unit Info Card Compact Weapon Info`
- `Bottom Info Empty Bar` 408x435 — `#1E1E1ECC`, centered 126x126 BA logo + "Unit has no weapons" Inter-Medium 16
- `Bottom Info Skins Bar` 408x435 — skin details: pad 20/20/24/22, spacing 18; Skin Title Inter-SemiBold 16 (uppercase style flag 16, tracking 2, centered), description Inter-Medium 14 left-top, conditions scroll 368x150, DLC button 368x48 (8 px padding, 32x32 spec icon, name Inter-Medium 22, purple `#8F0EA9` border + 96-px ribbon)
- `Modifications` — hung below the card at pos(0,-714), size-fitted (Unit Modifications Panel)

## 4. Item prefab quick reference

| Prefab | Root size | Key numbers |
|---|---|---|
| **Unit Info Card Stats item** | 300x20 (MinHeight 18) | HLayout pad l10/r32; Title Inter-Regular 12 min-width 130, left; Value Inter-SemiBold 12, right-aligned, flexible |
| **Unit Info Card Unit Stats Item** | 50x70 | VLayout pad t10/b10 spacing 4; 32x32 icon `#E7F8E5` + centered Inter-Regular 12 caption |
| **Unit Info Card Abilities Item** | 32x32 | full-bleed icon `#E7F8E5`; optional green count pill bottom-right (`#7CFF81` bg, Inter-Bold 10 `#0F0525`, ~12x12) |
| **Unit Info Trait Item** | 24x24 (LayoutElement) | icon tint `#E7F8E5`, transparent hit-area |
| **Unit Info Missiles Trait Item Variant** | 20x20 | same, smaller |
| **Unit Info Card Ammo Info** | 408 x ~152.65 | VLayout pad-top 8 spacing 4; 262x1 divider (x=4); Top row (HLayout pad l4/r12 spacing 4): 84x18 ammo image, title Inter-ExtraBold 12, count Inter-ExtraBold 12 right (min 54), 16x16 expand chevron; hover `#FFFFFF33` / click `#FFFFFF4C` overlays; Specs row pad l12/r32 with 24x24 type icon + right-aligned extras (spacing 8); Statistics VLayout pad-top 6 |
| **Unit Info Card Compact Weapon Info** | auto (h 60) | HLayout spacing 16; bg sprite 256 wide right-anchored `#FFFFFF1A`; left column PreferredWidth 124 (name Inter-SemiBold 12 white; 124x48 weapon silhouette, mirrored via scaleX -1; optional count pill `#7CFF81` and distance pill `#F4D42A`, Inter-Bold 10 text `#0F0525`); right column = ammo rows, MinHeight 60 |
| **Unit Ammo Compact Info** | auto | HLayout; Main Info (VLayout pad t5/b5): 84x18 ammo image `#E7F8E5`, yellow distance pill `#F4D42A`, green count pill `#7CFF81` (badge sprite 9-sliced); Stats HLayout pad-left 16 spacing 12: three 40-wide Inter-SemiBold 12 values (Penetration/Damage/Accuracy) |
| **Unit Missiles Bombs Compact Info** | auto | Traits GridLayout cell 20x20 gap 4; Stats HLayout pad-left 8 spacing 12, three 40-wide Inter-SemiBold 12 values |

## 5. Full annotated hierarchy dumps

Legend: `pos` = m_AnchoredPosition, `size` = m_SizeDelta, `anch` = anchorMin-anchorMax, `piv` = pivot.
Nodes with pos/size (0,0) inside a LayoutGroup are layout-driven (computed at runtime).
`VLayoutGroup`/`HLayoutGroup` = Vertical/HorizontalLayoutGroup, pad order l/r/t/b; `ctrl(w,h)` = childControlWidth/Height; `expand(w,h)` = childForceExpand.
`TMP` = TextMeshProUGUI. Sprite/font values are GUIDs — see tables above.

```

===== Unit Info Card.prefab =====
- Unit Info Card pos(0, 0) size(408, 710) anch(0, 1)-(0, 1) piv(0, 1)
  `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `GameScript`
  `Image` sprite=none color=#1E1E1ECC imgType=Simple
  - Top Info Bar pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
    `LayoutElement` MinHeight=274 PreferredHeight=274
    - Background Base pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `Image` sprite=none color=#1E1E1EFF imgType=Simple
      `LayoutElement` 
    - Background Unit Image pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `Image` sprite=c9096ea2e8f5e8e47afee2e9baba034c color=#FFFFFFFF imgType=Simple
      `LayoutElement` 
    - Background Skin Menu [INACTIVE] pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `Image` sprite=none color=#1E1E1EFA imgType=Simple
      `LayoutElement` 
    - Background Top pos(0, 0) size(0, 78) anch(0, 1)-(1, 1) piv(0.5, 1)
      `Image` sprite=d007ffde30edee646ba3fa5834cefda2 color=#FFFFFFFF imgType=Simple
      `LayoutElement` 
    - Background Right pos(0, 0) size(68, 0) anch(1, 0)-(1, 1) piv(1, 0.5)
      `Image` sprite=5172f6cfe7e0ddc48b6ea5eb53829d8b color=#FFFFFFFF imgType=Simple
      `LayoutElement` 
    - Background Bottom pos(0, 0) size(0, 64) anch(0, 0)-(1, 0) piv(0.5, 0)
      `Image` sprite=37084b21a2c9c464f94682e0df432ee9 color=#FFFFFFFF imgType=Simple
      `LayoutElement` 
    - Name and Points Block pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `HLayoutGroup` pad(l/r/t/b)=16/12/12/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=1,0
      `LayoutElement` MinHeight=48
      - Name pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `TMP` font=528b2926b154e37449426a9511420ca5 size=20 color=#E7F8E5FF align=Left-Top style=Normal charSpacing=6 text=Ka-52 Aligator
      - Points pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `LayoutElement` MinWidth=80
        `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=4 align=UpperRight ctrl(w,h)=1,1 expand(w,h)=0,0
        - Text pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
          `TMP` font=528b2926b154e37449426a9511420ca5 size=20 color=#F4D42AFF align=Right-Middle style=Normal charSpacing=6 text=1500
        - Icon pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
          `Image` sprite=22e203ec4d96d3841836c7b3ce942348 color=#F4D42AFF imgType=Simple
          `LayoutElement` MinWidth=24 MinHeight=24 PreferredWidth=24 PreferredHeight=24
    - Abilities pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `HLayoutGroup` pad(l/r/t/b)=0/10/0/0 spacing=12 align=UpperRight ctrl(w,h)=1,1 expand(w,h)=0,0
      `LayoutElement` MinWidth=408 PreferredWidth=408
      - Skins Menu [INACTIVE] pos(169, -80) size(336, 160) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `LayoutElement` MinWidth=336 MinHeight=160
        `ScrollRect`
        - Viewport pos(0, 0) size(-4, 0) anch(0, 0)-(1, 1) piv(0, 1)
          `Image` sprite=none color=#FFFFFFFF imgType=Simple
          `Mask`
          `GameScript`
          - Content pos(0, 3.05176e-05) size(336, 64) anch(0, 1)-(0, 1) piv(0, 1)
            `ContentSizeFitter` h=Unconstrained v=PreferredSize
            `GridLayoutGroup` cell=64x64 spacing=16,16 pad=16/0/0/0
        - Scrollbar Vertical pos(6, 0) size(4, 0) anch(1, 0)-(1, 1) piv(1, 0.5)
          `Image` sprite=0000000000000000f000000000000000 color=#FFFFFFFF imgType=Sliced
          `Scrollbar`
          - Top pos(0, 0) size(0, 2) anch(0, 1)-(1, 1) piv(0.5, 1)
            `Image` sprite=none color=#767D74FF imgType=Simple
          - Bottom pos(0, 0) size(0, 2) anch(0, 0)-(1, 0) piv(0.5, 0)
            `Image` sprite=none color=#767D74FF imgType=Simple
          - Sliding Area pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
            - Handle pos(0, 0) size(0, -4) anch(0, 0)-(1, 1) piv(0.5, 0.5)
              `Image` sprite=none color=#767D75FF imgType=Sliced
      - Vertical Divider pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `Image` sprite=9206592f333d9194b89e9dfa1e348778 color=#FFFFFF99 imgType=Simple
        `LayoutElement` MinWidth=1 MinHeight=162 PreferredWidth=1 PreferredHeight=162
      - Unt Menu Scroll View pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `ScrollRect`
        `LayoutElement` MinWidth=36 MinHeight=162
        - Viewport pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
          `Image` sprite=none color=#FFFFFFFF imgType=Simple
          `Mask`
          `GameScript`
          - Content pos(0, -1.52588e-05) size(0, 0) anch(0, 0)-(1, 0) piv(0.5, 0)
            `VLayoutGroup` pad(l/r/t/b)=0/0/0/12 spacing=8 align=LowerCenter ctrl(w,h)=1,1 expand(w,h)=0,0
            `ContentSizeFitter` h=Unconstrained v=PreferredSize
        - Scrollbar Vertical pos(6, 0) size(4, -12) anch(1, 0)-(1, 1) piv(1, 0.5)
          `Image` sprite=0000000000000000f000000000000000 color=#FFFFFFFF imgType=Sliced
          `Scrollbar`
          - Top pos(0, 0) size(0, 2) anch(0, 1)-(1, 1) piv(0.5, 1)
            `Image` sprite=none color=#767D74FF imgType=Simple
          - Bottom pos(0, 0) size(0, 2) anch(0, 0)-(1, 0) piv(0.5, 0)
            `Image` sprite=none color=#767D74FF imgType=Simple
          - Sliding Area pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
            - Handle pos(0, 0) size(0, -4) anch(0, 0)-(0, 0) piv(0.5, 0.5)
              `Image` sprite=none color=#767D75FF imgType=Sliced
    - Horizontal Divider pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `Image` sprite=fd2f7daae44416749936204956de5e8f color=#FFFFFF99 imgType=Simple
      `LayoutElement` MinWidth=408 MinHeight=1 PreferredWidth=408 PreferredHeight=1
    - Statistics pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `HLayoutGroup` pad(l/r/t/b)=16/12/0/0 spacing=14 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=1,0
      `LayoutElement` MinHeight=64 PreferredHeight=64 FlexibleWidth=1
    - Right Top Button Group pos(36, 0) size(32, 0) anch(1, 1)-(1, 1) piv(1, 1)
      `LayoutElement` 
      `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=4 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
      `ContentSizeFitter` h=Unconstrained v=PreferredSize
      - Attach Button pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `Button/Selectable`
        `GameScript`
        `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
        `Image` sprite=none color=#1E1E1E7A imgType=Simple
        - Icon pos(0, 0) size(-8, -8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=7da7a1e5918993e468d4295ba4ef0ab0 color=#E7F8E5FF imgType=Simple
      - Skin Button pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `Button/Selectable`
        `GameScript`
        `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
        `Image` sprite=none color=#1E1E1E7A imgType=Simple
        - Icon pos(0, 0) size(-8, -8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=40110f5e5216d2247b442cf5cdf698d8 color=#E7F8E5FF imgType=Simple
      - Compact Mode Button pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `Button/Selectable`
        `GameScript`
        `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
        `Image` sprite=none color=#1E1E1E7A imgType=Simple
        - Off Icon pos(0, 0) size(-8, -8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=4e6e5425ac17a1d44a93ab8e38ad1b9b color=#E7F8E5FF imgType=Simple
        - On Icon [INACTIVE] pos(0, 0) size(-8, -8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=18a78f82d56beb040ae43997f3958a56 color=#E7F8E5FF imgType=Simple
      - Dlc Button Vertical pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `Button/Selectable`
        `GameScript`
        `GameScript`
        `GameScript`
        `LayoutElement` MinWidth=32 MinHeight=240 PreferredWidth=32 PreferredHeight=32
        - Background pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=f5f1ed6a5c1bda840b2044bbecc0bc11 color=#FFFFFFFF imgType=Simple
          `LayoutElement` 
        - Name pos(27, -8) size(183.15, 19.37) anch(0, 1)-(0, 1) piv(0, 1)
          `TMP` font=15140430b7953e3438975cc41d6e450c size=16 color=#E7F8E5FF align=Left-Middle style=Normal text=Балтийский батальон
          `GameScript`
          `LayoutElement` 
        - Dlc Icon pos(0, 4) size(32, 40) anch(0.5, 0)-(0.5, 0) piv(0.5, 0)
          `Image` sprite=bdf503430ecfe194da7b29dc3dd24193 color=#E7F8E5FF imgType=Simple
          `LayoutElement` 
        - Border pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=8b179bf189b124743b289c7415028a31 color=#FFFFFFFF imgType=Sliced
    - Vehicles Armor Info [INACTIVE] pos(0, 32) size(0, -64) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `LayoutElement` 
      - Armor Types pos(0, 0) size(48, 122) anch(0, 1)-(0, 1) piv(0, 1)
        `VLayoutGroup` pad(l/r/t/b)=16/0/46/0 spacing=12 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
        `ContentSizeFitter` h=PreferredSize v=PreferredSize
        - Kinetic Armor Icon pos(32, -62) size(32, 32) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `Image` sprite=none color=#E7F8E500 imgType=Simple
          `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
          `GameScript`
          - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
            `Image` sprite=dd19a97c26e3ec84ca40223b949f07a3 color=#E7F8E5FF imgType=Simple
        - HEAT Armor Icon pos(32, -106) size(32, 32) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `Image` sprite=none color=#FFFFFF00 imgType=Simple
          `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
          `GameScript`
          - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
            `Image` sprite=5ad1fb5a035f8c44b9057469423947a0 color=#ED7A27FF imgType=Simple
      - Top pos(0, 0) size(174.04, 77.9) anch(0, 1)-(0, 1) piv(0, 1)
        `VLayoutGroup` pad(l/r/t/b)=124/0/46/0 spacing=-2 align=UpperCenter ctrl(w,h)=1,1 expand(w,h)=0,0
        `ContentSizeFitter` h=PreferredSize v=PreferredSize
        - Title pos(149.02, -54.475) size(27.58, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `TMP` font=d61628bbb312780458dc780a6fc5e35b size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Top
          `GameScript`
        - Values pos(149.02, -69.425) size(50.04, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=10 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          - Kinetic pos(10.01, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
          - Heat pos(40.03, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#F66B06FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
      - Rear pos(0, 0) size(112.86, 94.85) anch(1, 1)-(1, 1) piv(1, 1)
        `VLayoutGroup` pad(l/r/t/b)=0/80/46/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
        `ContentSizeFitter` h=PreferredSize v=PreferredSize
        - Title pos(16.43, -54.475) size(32.86, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `TMP` font=d61628bbb312780458dc780a6fc5e35b size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Rear
          `GameScript`
        - Values pos(10.01, -78.9) size(20.02, 31.9) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=-2 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          - Kinetic pos(10.01, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
          - Heat pos(10.01, -23.425) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#F66B06FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
      - Front pos(0, 0) size(84.48, 66.85) anch(0, 0)-(0, 0) piv(0, 0)
        `VLayoutGroup` pad(l/r/t/b)=46/0/0/18 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
        `ContentSizeFitter` h=PreferredSize v=PreferredSize
        - Title pos(65.24, -8.475) size(38.48, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `TMP` font=d61628bbb312780458dc780a6fc5e35b size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Front
          `GameScript`
        - Values pos(56.01, -32.9) size(20.02, 31.9) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=-2 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          - Kinetic pos(10.01, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
          - Heat pos(10.01, -23.425) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#F66B06FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
      - Sides pos(0, 0) size(142.04, 47.9) anch(1, 0)-(1, 0) piv(1, 0)
        `VLayoutGroup` pad(l/r/t/b)=0/92/0/16 spacing=-2 align=UpperCenter ctrl(w,h)=1,1 expand(w,h)=0,0
        `ContentSizeFitter` h=PreferredSize v=PreferredSize
        - Title pos(25.02, -8.475) size(39.76, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `TMP` font=d61628bbb312780458dc780a6fc5e35b size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Sides
          `GameScript`
        - Values pos(25.02, -23.425) size(50.04, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=10 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          - Kinetic pos(10.01, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
          - Heat pos(40.03, -8.475) size(20.02, 16.95) anch(0, 1)-(0, 1) piv(0.5, 0.5)
            `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#F66B06FF align=Left-Middle style=Normal charSpacing=6 text=50
            - Diff Icon [INACTIVE] pos(0, 0) size(8, 12) anch(1, 0.5)-(1, 0.5) piv(0, 0.5)
              `Image` sprite=7451d32089e194a45a96538cd8535c19 color=#FFFFFFFF imgType=Simple
  - Horizontal Divider pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `Image` sprite=fd2f7daae44416749936204956de5e8f color=#FFFFFF99 imgType=Simple
    `LayoutElement` MinWidth=408 MinHeight=1 PreferredWidth=408 PreferredHeight=1
  - Bottom Info Bar pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,1
    - Weapon List pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `LayoutElement` MinWidth=108 PreferredWidth=108
      `ScrollRect`
      - Viewport pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Mask`
        `Image` sprite=none color=#FFFFFFFF imgType=Simple
        `GameScript`
        - Content pos(0, 0) size(0, 0) anch(0, 1)-(1, 1) piv(0.5, 1)
          `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=0,0 expand(w,h)=0,0
          `ContentSizeFitter` h=Unconstrained v=PreferredSize
      - Scrollbar Vertical pos(0, -3) size(4, -18) anch(1, 0)-(1, 1) piv(1, 0.5)
        `Image` sprite=0000000000000000f000000000000000 color=#FFFFFFFF imgType=Sliced
        `Scrollbar`
        - Top pos(0, 0) size(0, 2) anch(0, 1)-(1, 1) piv(0.5, 1)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Bottom pos(0, 0) size(0, 2) anch(0, 0)-(1, 0) piv(0.5, 0)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Sliding Area pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          - Handle pos(0, 0) size(0, -4) anch(0, 0)-(0, 0) piv(0.5, 0.5)
            `Image` sprite=none color=#767D75FF imgType=Sliced
    - Vertical Divider pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `Image` sprite=9206592f333d9194b89e9dfa1e348778 color=#FFFFFF99 imgType=Simple
      `LayoutElement` MinWidth=1 MinHeight=435 PreferredWidth=1 PreferredHeight=435
    - Selected Weapon/Ammo Info Block pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
      `ScrollRect`
      `LayoutElement` MinWidth=299
      - Viewport pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0, 1)
        `Image` sprite=none color=#FFFFFFFF imgType=Simple
        `Mask`
        `GameScript`
        - Content pos(0, -4.57764e-05) size(0, 0) anch(0, 1)-(1, 1) piv(0, 1)
          `VLayoutGroup` pad(l/r/t/b)=0/0/10/10 spacing=15 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          `ContentSizeFitter` h=Unconstrained v=PreferredSize
          - Weapon Main Info pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
            `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=16 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
            - Top Bar pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
              `HLayoutGroup` pad(l/r/t/b)=4/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
              `LayoutElement` MinHeight=24
              - Title pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
                `TMP` font=528b2926b154e37449426a9511420ca5 size=14 color=#E7F8E5FF align=Left-Top style=Normal charSpacing=6 text=242 Bushmaster super long name
              - Traits Block pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
                `HLayoutGroup` pad(l/r/t/b)=0/32/0/0 spacing=8 align=UpperRight ctrl(w,h)=0,0 expand(w,h)=1,0
                - Traits pos(0, 0) size(56, 24) anch(0, 0)-(0, 0) piv(0.5, 0.5)
                  `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=8 align=MiddleRight ctrl(w,h)=1,1 expand(w,h)=0,0
                  `LayoutElement` MinWidth=60
            - Statistics pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
              `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
              `GameScript`
          - Ammunitions Info Block pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
            `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=2 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
            - Title pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
              `HLayoutGroup` pad(l/r/t/b)=10/0/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
              - Text pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
                `TMP` font=d61628bbb312780458dc780a6fc5e35b size=12 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Munitions:
                `GameScript`
            - Ammunitions pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
              `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=16 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
              `LayoutElement` MinWidth=268 PreferredWidth=268
      - Scrollbar Vertical pos(-8, -3) size(4, -18) anch(1, 0)-(1, 1) piv(1, 0.5)
        `Image` sprite=0000000000000000f000000000000000 color=#FFFFFFFF imgType=Sliced
        `Scrollbar`
        - Top pos(0, 0) size(0, 2) anch(0, 1)-(1, 1) piv(0.5, 1)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Bottom pos(0, 0) size(0, 2) anch(0, 0)-(1, 0) piv(0.5, 0)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Sliding Area pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          - Handle pos(0, 0) size(0, -4) anch(0, 0)-(0, 0) piv(0.5, 0.5)
            `Image` sprite=none color=#767D75FF imgType=Sliced
  - Bottom Compact Info Bar [INACTIVE] pos(204, -328) size(408, 104) anch(0, 1)-(0, 1) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=10/0/0/0 spacing=8 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=1,0
    - Header pos(209, -18) size(398, 36) anch(0, 1)-(0, 1) piv(0.5, 0.5)
      `LayoutElement` MinHeight=28 PreferredHeight=28
      `HLayoutGroup` pad(l/r/t/b)=0/34/8/0 spacing=32 align=MiddleRight ctrl(w,h)=1,1 expand(w,h)=0,0
      - Penetration pos(250, -18) size(20, 20) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `Image` sprite=945e5ca60de0dc24d8d1259be401d93d color=#E7F8E5FF imgType=Simple
        `LayoutElement` MinWidth=20 MinHeight=20 PreferredWidth=20 PreferredHeight=20
        `GameScript`
      - Damage pos(302, -18) size(20, 20) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `Image` sprite=b01a8a00c223e934fa150ac6602914c2 color=#E7F8E5FF imgType=Simple
        `LayoutElement` MinWidth=20 MinHeight=20 PreferredWidth=20 PreferredHeight=20
        `GameScript`
      - Accuracy pos(354, -18) size(20, 20) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `Image` sprite=c77a5c41079582a4594ef35f4a796fac color=#E7F8E5FF imgType=Simple
        `LayoutElement` MinWidth=20 MinHeight=20 PreferredWidth=20 PreferredHeight=20
        `GameScript`
  - Bottom Info Empty Bar [INACTIVE] pos(204, -927.5) size(408, 435) anch(0, 1)-(0, 1) piv(0.5, 0.5)
    `Image` sprite=none color=#1E1E1ECC imgType=Simple
    `LayoutElement` MinWidth=408 MinHeight=435
    `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=10 align=MiddleCenter ctrl(w,h)=1,1 expand(w,h)=0,0
    - BA Icon pos(204, -202.815) size(126, 126) anch(0, 1)-(0, 1) piv(0.5, 0.5)
      `Image` sprite=0bffeb3d98f345c418ac754c66bdb1d5 color=#E7F8E5FF imgType=Simple
      `LayoutElement` MinWidth=126 MinHeight=126 PreferredWidth=126 PreferredHeight=126
    - Text pos(204, -285.5) size(159.33, 19.37) anch(0, 1)-(0, 1) piv(0.5, 0.5)
      `GameScript`
      `TMP` font=dc5957aeb9410434a9841d5c7f1e1587 size=16 color=#E7F8E5FF align=Center-Middle style=Normal text=Unit has no weapons
  - Bottom Info Skins Bar [INACTIVE] pos(204, -492.5) size(408, 435) anch(0, 1)-(0, 1) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=20/20/24/22 spacing=18 align=UpperCenter ctrl(w,h)=1,1 expand(w,h)=1,0
    - Upper block pos(204, -99.89) size(368, 151.78) anch(0, 1)-(0, 1) piv(0.5, 0.5)
      `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=12 align=UpperCenter ctrl(w,h)=1,1 expand(w,h)=1,0
      `LayoutElement` 
      - Skin Title pos(184, -15) size(368, 30) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `TMP` font=15140430b7953e3438975cc41d6e450c size=16 color=#E7F8E5FF align=Center-Middle style=16 charSpacing=2 text=Parade camouflage
        `LayoutElement` MinHeight=30
      - Skin Description pos(184, -78.89) size(368, 73.78) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `TMP` font=dc5957aeb9410434a9841d5c7f1e1587 size=14 color=#E7F8E5FF align=Left-Top style=Normal charSpacing=2 text=Different types of camouflage uniforms for forest, desert an
        `LayoutElement` MinHeight=34
      - Unlock Conditions pos(184, -139.78) size(368, 24) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `TMP` font=dc5957aeb9410434a9841d5c7f1e1587 size=14 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=2 text=Unlock conditions:
        `GameScript`
        `LayoutElement` MinHeight=24
    - Conditions block pos(20, -193.78) size(368, 153.22) anch(0, 1)-(0, 1) piv(0, 1)
      `ScrollRect`
      `LayoutElement` MinWidth=299 MinHeight=150 FlexibleHeight=1
      - Viewport pos(0, 0) size(-4, 0) anch(0, 0)-(1, 1) piv(0, 1)
        `Image` sprite=none color=#FFFFFFFF imgType=Simple
        `Mask`
        `GameScript`
        - Content pos(0, 0) size(0, 0) anch(0, 1)-(1, 1) piv(0, 1)
          `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=12 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
          `ContentSizeFitter` h=Unconstrained v=PreferredSize
      - Scrollbar Vertical pos(8, -3.00003) size(4, -18) anch(1, 0)-(1, 1) piv(1, 0.5)
        `Image` sprite=0000000000000000f000000000000000 color=#FFFFFFFF imgType=Sliced
        `Scrollbar`
        - Top pos(0, 0) size(0, 2) anch(0, 1)-(1, 1) piv(0.5, 1)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Bottom pos(0, 0) size(0, 2) anch(0, 0)-(1, 0) piv(0.5, 0)
          `Image` sprite=none color=#767D74FF imgType=Simple
        - Sliding Area pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          - Handle pos(0, 0) size(0, -4) anch(0, 0)-(1, 1) piv(0.5, 0.5)
            `Image` sprite=none color=#767D75FF imgType=Sliced
    - Dlc Button Horizontal pos(20, -365) size(368, 48) anch(0, 1)-(0, 1) piv(0, 1)
      `Button/Selectable`
      `GameScript`
      `GameScript`
      `HLayoutGroup` pad(l/r/t/b)=8/8/8/8 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=1,0
      `GameScript`
      - Background pos(6.10352e-05, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=77a6a4311831fa14e856b5bf10a05480 color=#FFFFFFFF imgType=Simple
        `LayoutElement` 
      - Inner content pos(184, -24) size(352, 32) anch(0, 1)-(0, 1) piv(0.5, 0.5)
        `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=8 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
        - IconDlc pos(16, -16) size(32, 32) anch(0, 1)-(0, 1) piv(0.5, 0.5)
          `Image` sprite=15a466658e8076b47b3438188bf4b0b5 color=#FFFFFFFF imgType=Simple
          `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
        - Name pos(40, -16) size(236.97, 29.12) anch(0, 1)-(0, 1) piv(0, 0.5)
          `TMP` font=b2deb9a678248184d9ae5be447003555 size=22 color=#E7F8E5FF align=Left-Middle style=Normal text=Балтийский батальон
          `GameScript`
      - Border pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=8b179bf189b124743b289c7415028a31 color=#8F0EA9FF imgType=Sliced
        `LayoutElement` 
      - Ribbon pos(0, 0) size(96, 0) anch(1, 0)-(1, 1) piv(1, 0.5)
        `Image` sprite=541142d43a34f434ca98a68c7f4bf7fb color=#8F0EA9FF imgType=Simple
        `LayoutElement` 
  - Border pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
    `Image` sprite=8b179bf189b124743b289c7415028a31 color=#E7F8E5FF imgType=Sliced
    `LayoutElement` 
  - Modifications pos(0, -714) size(0, 0) anch(0, 1)-(0, 1) piv(0, 0)
    `LayoutElement` 
    `ContentSizeFitter` h=PreferredSize v=PreferredSize

===== Unit Info Card Compact Weapon Info.prefab =====
- Unit Info Card Compact Weapon Info pos(0, 0) size(0, 0) anch(0, 1)-(0, 1) piv(0, 1)
  `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=16 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `GameScript`
  - Background pos(0, 0) size(256, 0) anch(1, 0)-(1, 1) piv(1, 0.5)
    `Image` sprite=80da6e06c67153143a9a581b0be9409d color=#FFFFFF1A imgType=Simple
    `LayoutElement` 
  - Left Part Weapon Info pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=-4 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
    `LayoutElement` MinHeight=60 PreferredWidth=124
    - Name pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#FFFFFFFF align=Left-Middle style=Normal text=M-61 20mm
    - Icon pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5) scale(-1,1)
      `Image` sprite=none color=#FFFFFFFF imgType=Simple
      `LayoutElement` MinWidth=124 MinHeight=48 PreferredWidth=124 PreferredHeight=48
      `GameScript`
    - Count [INACTIVE] pos(-2, -14) size(12.01, 12.11) anch(1, 1)-(1, 1) piv(1, 1)
      `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperRight ctrl(w,h)=1,1 expand(w,h)=0,0
      `LayoutElement` 
      `ContentSizeFitter` h=PreferredSize v=PreferredSize
      - Background pos(0, 0) size(4, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=b0e257b5513af104e984ee4b0f73235b color=#7CFF81FF imgType=Sliced
        `LayoutElement` PreferredWidth=10 PreferredHeight=10
      - Text pos(12.01, -12.11) size(12.01, 12.11) anch(0, 1)-(0, 1) piv(1, 0)
        `TMP` font=a58bf51b007516b4f9f294185369975d size=10 color=#0F0525FF align=Right-Top style=Normal text=x5
    - Distance [INACTIVE] pos(0, 0) size(37.22, 12.11) anch(1, 0)-(1, 0) piv(1, 0)
      `HLayoutGroup` pad(l/r/t/b)=0/2/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
      `LayoutElement` 
      `ContentSizeFitter` h=PreferredSize v=PreferredSize
      - Background pos(-1, 0) size(2, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=b0e257b5513af104e984ee4b0f73235b color=#F4D42AFF imgType=Sliced
        `LayoutElement` PreferredWidth=10 PreferredHeight=10
        `GameScript`
      - Text pos(35.22, -12.11) size(35.22, 12.11) anch(0, 1)-(0, 1) piv(1, 0)
        `TMP` font=a58bf51b007516b4f9f294185369975d size=10 color=#0F0525FF align=Left-Top style=Normal text=3500m
  - Right Part Ammo Info pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=1,0
    `LayoutElement` MinHeight=60

===== Unit Ammo Compact Info.prefab =====
- Unit Ammo Compact Info pos(0, 0) size(0, 0) anch(0, 1)-(0, 1) piv(0, 1)
  `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `GameScript`
  - Main Info pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/5/5 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
    - Image pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `Image` sprite=6d17ab69a47762341a36eee6cffbbbe7 color=#E7F8E5FF imgType=Simple
      `LayoutElement` MinWidth=84 MinHeight=18 PreferredWidth=84 PreferredHeight=18
      `GameScript`
    - Distance pos(2, -2) size(0, 0) anch(0, 1)-(0, 1) piv(0, 1)
      `HLayoutGroup` pad(l/r/t/b)=2/0/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
      `LayoutElement` 
      `ContentSizeFitter` h=PreferredSize v=PreferredSize
      - Background pos(1, 0) size(2, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=b0e257b5513af104e984ee4b0f73235b color=#F4D42AFF imgType=Sliced
        `LayoutElement` PreferredWidth=10 PreferredHeight=10
        `GameScript`
      - Text pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(1, 0)
        `TMP` font=a58bf51b007516b4f9f294185369975d size=10 color=#0F0525FF align=Left-Top style=Normal text=3500m
    - Count pos(0, 0) size(0, 0) anch(1, 0)-(1, 0) piv(1, 0)
      `HLayoutGroup` pad(l/r/t/b)=0/2/0/2 spacing=0 align=UpperRight ctrl(w,h)=1,1 expand(w,h)=0,0
      `LayoutElement` 
      `ContentSizeFitter` h=PreferredSize v=PreferredSize
      - Background pos(-1, 1) size(2, -2) anch(0, 0)-(1, 1) piv(0.5, 0.5)
        `Image` sprite=b0e257b5513af104e984ee4b0f73235b color=#7CFF81FF imgType=Sliced
        `LayoutElement` PreferredWidth=10 PreferredHeight=10
      - Text pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(1, 0)
        `TMP` font=a58bf51b007516b4f9f294185369975d size=10 color=#0F0525FF align=Right-Top style=Normal text=x5
  - Stats pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `HLayoutGroup` pad(l/r/t/b)=16/0/0/0 spacing=12 align=MiddleLeft ctrl(w,h)=0,1 expand(w,h)=0,0
    - Penetration pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=650
    - Damage pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=8
    - Accuracy pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=2m

===== Unit Missiles Bombs Compact Info.prefab =====
- Unit Missiles Bombs Compact Info pos(0, 0) size(0, 0) anch(0, 1)-(0, 1) piv(0, 1)
  `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `GameScript`
  - Traits pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `GridLayoutGroup` cell=20x20 spacing=4,4 pad=0/0/0/0
  - Stats pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `HLayoutGroup` pad(l/r/t/b)=8/0/0/0 spacing=12 align=MiddleLeft ctrl(w,h)=0,1 expand(w,h)=0,0
    - Penetration pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=650
    - Damage pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=8
    - Accuracy pos(0, 0) size(40, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Left-Middle style=Normal text=2m

===== Unit Info Card Ammo Info.prefab =====
- Unit Info Card Ammo Info pos(0, 0) size(408, 152.65) anch(0, 1)-(0, 1) piv(0, 1)
  `VLayoutGroup` pad(l/r/t/b)=0/0/8/0 spacing=4 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `GameScript`
  - Horizontal Divider pos(4, 0) size(262, 1) anch(0, 1)-(0, 1) piv(0, 1)
    `Image` sprite=fd2f7daae44416749936204956de5e8f color=#FFFFFF99 imgType=Simple
    `LayoutElement` MinWidth=262 MinHeight=1 PreferredWidth=262 PreferredHeight=1
  - Top Bar pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=6 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
    `Button/Selectable`
    `GameScript`
    `Image` sprite=none color=#FFFFFF00 imgType=Simple
    - Top pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `HLayoutGroup` pad(l/r/t/b)=4/12/0/0 spacing=4 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
      - Ammo Icon pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `Image` sprite=eab503f9e87c66645bffa79d3d6836a0 color=#E7F8E5FF imgType=Simple
        `LayoutElement` MinWidth=84 MinHeight=18 PreferredWidth=84 PreferredHeight=18
      - Title pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `TMP` font=528b2926b154e37449426a9511420ca5 size=12 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=M829E4 APFSD
      - Right Part pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=4 align=MiddleRight ctrl(w,h)=1,1 expand(w,h)=0,0
        `LayoutElement` FlexibleWidth=5
        - Count pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
          `TMP` font=528b2926b154e37449426a9511420ca5 size=12 color=#E7F8E5FF align=Right-Middle style=Normal charSpacing=6 text=x45454
          `LayoutElement` MinWidth=54
        - Expand Icon pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
          `Image` sprite=d86918030ebcfd049a31e92dfcc273b1 color=#E7F8E5FF imgType=Simple
          `LayoutElement` MinWidth=16 MinHeight=16 PreferredWidth=16 PreferredHeight=16
    - Hover Background [INACTIVE] pos(0, 4) size(0, 8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `LayoutElement` 
      `Image` sprite=def6858f406237d4dab8c1942ceffa12 color=#FFFFFF33 imgType=Simple
    - Click Background [INACTIVE] pos(0, 4) size(0, 8) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `LayoutElement` 
      `Image` sprite=f5a8db10b6645854cbf7ec8d31cbfcec color=#FFFFFF4C imgType=Simple
    - Specs pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
      `HLayoutGroup` pad(l/r/t/b)=12/32/0/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
      - Ammo Type pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `Image` sprite=none color=#E7F8E500 imgType=Simple
        `LayoutElement` MinWidth=24 MinHeight=24 PreferredWidth=24 PreferredHeight=24
        `GameScript`
        - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
          `Image` sprite=0d31961fead5f9942b65a755afca140a color=#E7F8E5FF imgType=Simple
      - Extra pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
        `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=8 align=MiddleRight ctrl(w,h)=1,1 expand(w,h)=1,0
        - Icons pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
          `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=8 align=MiddleRight ctrl(w,h)=1,1 expand(w,h)=0,0
  - Statistics pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `VLayoutGroup` pad(l/r/t/b)=0/0/6/0 spacing=0 align=UpperLeft ctrl(w,h)=1,1 expand(w,h)=0,0
    `GameScript`

===== Unit Info Card Stats item.prefab =====
- Unit Info Card Stats item pos(0, 0) size(300, 20) anch(0, 1)-(0, 1) piv(0, 1)
  `HLayoutGroup` pad(l/r/t/b)=10/32/0/0 spacing=0 align=MiddleLeft ctrl(w,h)=1,1 expand(w,h)=0,0
  `LayoutElement` MinHeight=18
  `GameScript`
  - Title pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `TMP` font=d61628bbb312780458dc780a6fc5e35b size=12 color=#E7F8E5FF align=Left-Middle style=Normal charSpacing=6 text=Aim time: 
    `LayoutElement` MinWidth=130
  - Value pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `TMP` font=15140430b7953e3438975cc41d6e450c size=12 color=#E7F8E5FF align=Right-Middle style=Normal charSpacing=6 text=2 - 4 sec
    `LayoutElement` FlexibleWidth=1

===== Unit Info Card Unit Stats Item.prefab =====
- Unit Info Card Unit Stats Item pos(0, 0) size(50, 70) anch(0, 1)-(0, 1) piv(0, 1)
  `VLayoutGroup` pad(l/r/t/b)=0/0/10/10 spacing=4 align=UpperCenter ctrl(w,h)=1,1 expand(w,h)=0,0
  `Image` sprite=none color=#FFFFFF00 imgType=Simple
  `GameScript`
  `GameScript`
  - Icon pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `Image` sprite=b68244dd45b3a924b9409ef562215661 color=#E7F8E5FF imgType=Simple
    `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
  - Text pos(0, 0) size(0, 0) anch(0, 0)-(0, 0) piv(0.5, 0.5)
    `TMP` font=d61628bbb312780458dc780a6fc5e35b size=12 color=#E7F8E5FF align=Center-Middle style=Normal charSpacing=6 text=12000

===== Unit Info Card Abilities Item.prefab =====
- Unit Info Card Abilities Item pos(0, 0) size(32, 32) anch(0, 1)-(0, 1) piv(0, 1)
  `LayoutElement` MinWidth=32 MinHeight=32 PreferredWidth=32 PreferredHeight=32
  `Image` sprite=none color=#FFFFFF00 imgType=Simple
  `GameScript`
  `GameScript`
  - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
    `Image` sprite=d7d06130605011549a6bebadc0480e0a color=#E7F8E5FF imgType=Simple
  - Text [INACTIVE] pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
    `TMP` font=a58bf51b007516b4f9f294185369975d size=14 color=#E7F8E5FF align=Center-Middle style=Normal text=APS
  - Count [INACTIVE] pos(0, -3) size(12.46, 12.11) anch(1, 0)-(1, 0) piv(1, 0)
    `HLayoutGroup` pad(l/r/t/b)=0/0/0/0 spacing=0 align=UpperRight ctrl(w,h)=1,1 expand(w,h)=0,0
    `LayoutElement` 
    `ContentSizeFitter` h=PreferredSize v=PreferredSize
    - Background pos(0, 0) size(4, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
      `Image` sprite=b0e257b5513af104e984ee4b0f73235b color=#7CFF81FF imgType=Simple
      `LayoutElement` PreferredWidth=10 PreferredHeight=10
    - Text pos(12.46, -12.11) size(12.46, 12.11) anch(0, 1)-(0, 1) piv(1, 0)
      `TMP` font=8c50eab7e1d21fe438c56f2dfe364230 size=10 color=#0F0525FF align=Right-Middle style=Normal text=x4

===== Unit Info Trait Item.prefab =====
- Unit Info Trait Item pos(0, 0) size(100, 100) anch(0.5, 0.5)-(0.5, 0.5) piv(0.5, 0.5)
  `GameScript`
  `Image` sprite=none color=#00000000 imgType=Simple
  `LayoutElement` MinWidth=24 MinHeight=24 PreferredWidth=24 PreferredHeight=24
  `GameScript`
  - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
    `Image` sprite=daa930b86f0fb2d43b4be66e814617c8 color=#E7F8E5FF imgType=Simple

===== Unit Info Missiles Trait Item Variant.prefab =====
- Unit Info Missiles Trait Item Variant pos(0, 0) size(100, 100) anch(0.5, 0.5)-(0.5, 0.5) piv(0.5, 0.5)
  `GameScript`
  `Image` sprite=none color=#00000000 imgType=Simple
  `LayoutElement` MinWidth=20 MinHeight=20 PreferredWidth=20 PreferredHeight=20
  `GameScript`
  - Icon pos(0, 0) size(0, 0) anch(0, 0)-(1, 1) piv(0.5, 0.5)
    `Image` sprite=89273ddf3ad48bb4f96bd1bd24a04e8f color=#E7F8E5FF imgType=Simple
```
