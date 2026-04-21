# AMML Design System — design.md

> Structured design token reference for the AMML React rewrite.
> Inspired by `soul.md` / `agents.md` but for visual/UI identity.
> Keep in sync with `src/styles.css` — this is the human-facing specification.

---

## Brand Identity

**Product:** Abuja Markets Management Limited — enterprise management system for 18 FCT markets.
**Personality:** Authoritative, clear, institutional. Government parastatal that means business.
**Anti-pattern:** No playful animations, no rounded-everything, no "startup purple". This is a serious operations tool.

---

## Colors

### Primary Palette
| Token | Hex | Usage |
|---|---|---|
| `--color-brand-blue` | `#0064B4` | CTAs, links, primary actions |
| `--color-brand-blue-dk` | `#00508C` | Hover states, active links |
| `--color-brand-blue-dkr` | `#003C78` | Pressed states, strong emphasis |
| `--color-brand-orange` | `#DC6400` | Warnings, highlights, late indicators |
| `--color-brand-orange-lt` | `#E8821A` | Orange hover, softer accents |
| `--color-brand-green` | `#288C28` | Success, online indicators, on-time |
| `--color-brand-navy` | `#000028` | Deepest background, headers |

### Surface Spectrum
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#F0F5FA` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, panels |
| `--color-surface2` | `#F4F8FC` | Secondary surfaces, input backgrounds |
| `--color-surface3` | `#E8F0F8` | Hover backgrounds, subtle separators |
| `--color-border` | `#D0DCE8` | Input borders, dividers |

### Text Spectrum
| Token | Hex | Usage |
|---|---|---|
| `--color-text` | `#0A1628` | Primary text |
| `--color-text2` | `#2A4A6B` | Secondary text, labels |
| `--color-text3` | `#6A8AAB` | Placeholder, disabled, meta |

### Semantic Colors
| Token | Hex | Usage |
|---|---|---|
| `--color-destructive` | `#C0392B` | Errors, critical alerts, delete |
| `--color-chart-1` | `#0064B4` | Primary data series |
| `--color-chart-2` | `#DC6400` | Secondary data series |
| `--color-chart-3` | `#288C28` | Success data series |
| `--color-chart-4` | `#00508C` | Tertiary data series |
| `--color-chart-5` | `#E8821A` | Quaternary data series |

---

## Typography

### Font Families
```css
--font-sans: 'Outfit', system-ui, sans-serif;   /* UI, labels, body */
--font-serif: 'Libre Baskerville', Georgia, serif;  /* Display headings only */
```

### Type Scale
| Class | Font | Size | Weight | Usage |
|---|---|---|---|---|
| `page-title` | Outfit | 28px | 800 | Page headings (h1) |
| `section-title` | Outfit | 18px | 700 | Card headings, modal titles |
| `label` | Outfit | 11px | 700 | Column headers, badges, meta |
| `body` | Outfit | 13px | 400 | Regular text |
| `body-sm` | Outfit | 12px | 400 | Secondary text, descriptions |
| `mono` | JetBrains Mono | 12px | 500 | IDs, serial numbers, timestamps |
| `display` | Libre Baskerville | 32px | 700 | Hero section titles only |

### Letter Spacing
- Labels and badges: `0.04em` uppercase tracking
- Page titles: `-0.02em` tight
- Body: default (0)

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Tight gaps, icon padding |
| `--space-2` | 8px | Default element gap |
| `--space-3` | 12px | Card padding, form gap |
| `--space-4` | 16px | Section padding |
| `--space-6` | 24px | Card inner padding |
| `--space-8` | 32px | Section gap |

---

## Radius (Border Radius)

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Inputs, small buttons, badges |
| `--radius` | 12px | Cards, modals, dropdowns |
| `--radius-lg` | 20px | Large panels, hero cards |
| `--radius-xl` | 24px | Page-level containers |
| `--radius-full` | 9999px | Pills, avatar circles |

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(0,100,180,.08)` | Subtle elevation, input focus |
| `--shadow` | `0 2px 12px rgba(0,100,180,.10)` | Default card shadow |
| `--shadow-md` | `0 4px 20px rgba(0,100,180,.14)` | Dropdowns, popovers |
| `--shadow-lg` | `0 8px 40px rgba(0,100,180,.18)` | Modals, overlays |

---

## Component Specifications

### Buttons

**Primary (`btn-blue`)**
- Background: `#0064B4`
- Text: `#FFFFFF`, weight 700, 13px
- Padding: `8px 18px`
- Border-radius: `--radius-sm` (8px)
- Hover: `#00508C`
- Active: `#003C78`
- Transition: `background 0.15s`

**Secondary (`btn-outline`)**
- Background: `transparent`
- Border: `1.5px solid --color-border`
- Text: `--color-text2`, weight 600
- Hover: background `--color-surface2`

**Danger (`btn-red`)**
- Background: `#C0392B`
- Text: `#FFFFFF`
- Used for: delete actions, deactivate

**Success (`btn-green`)**
- Background: `#288C28`
- Text: `#FFFFFF`
- Used for: clock-in, confirm, activate

**Ghost (`btn-sm`)**
- No border, no fill
- Text only, 12px
- Used for: table row actions

**Button Sizes**
- Default: `padding: 8px 18px`, font 13px
- Small (`btn-sm`): `padding: 5px 12px`, font 11px
- Icon button: `padding: 8px`, square

---

### Cards

**Standard Card**
- Background: `--color-surface` (white)
- Border: `1.5px solid --color-border`
- Border-radius: `--radius` (12px)
- Shadow: `--shadow`
- Padding: 20px

**Elevated Card** (for modals)
- Shadow: `--shadow-lg`
- Border-radius: `--radius-lg` (20px)

---

### Form Inputs

**Text Input**
- Background: `--color-surface2`
- Border: `1.5px solid --color-border`
- Border-radius: `--radius-sm` (8px)
- Padding: `8px 12px`
- Font: 13px Outfit
- Focus: border `--color-brand-blue`, shadow `--shadow-sm`
- Placeholder color: `--color-text3`

**Search Input**
- Same as text input but with `type="search"`
- Extra left padding for search icon space

**Select / Dropdown**
- Same border/background as text input
- Cursor: pointer
- Arrow indicator on right

---

### Badges / Tags

| Variant | Background | Text | Usage |
|---|---|---|---|
| `b-blue` | `rgba(0,100,180,.1)` | `#0064B4` | Active, info |
| `b-green` | `rgba(40,140,40,.1)` | `#288C28` | On time, success |
| `b-orange` | `rgba(220,100,0,.1)` | `#DC6400` | Late, warning |
| `b-navy` | `rgba(0,0,40,.08)` | `#000028` | Neutral |
| `b-red` | `rgba(192,57,43,.1)` | `#C0392B` | Error, critical |

- Border-radius: `--radius-full` (pill)
- Padding: `3px 10px`
- Font: 10px, weight 700, uppercase, letter-spacing `0.04em`

---

### Tables

**`tbl` — Main Table**
- No outer border
- Header row: background `--color-surface2`, text `--color-text3`, font 10px uppercase weight 700
- Cell padding: `10px 14px`
- Row border: `1px solid --color-border` (hairline)
- Row hover: background `--color-surface2`

**Column Types**
- `tbl-col-sm`: font-size 12px, color `--color-text3`
- `tbl-col-mono`: font-family monospace, font-size 12px
- `fw-700`: font-weight 700

---

### Page Header (`page-header`)

- Display: flex, justify-content space-between, align-items flex-start
- Gap: 16px, flex-wrap wrap
- Bottom margin: 20px
- Left side: h1 (page title) + p (meta/subtitle)
- Right side: action buttons + badge

### Page Header Inline (`ph`)

- Same structure as `page-header` but for compact pages
- Padding: 0 (relies on page padding)

---

### Modal / Overlay

- Backdrop: `rgba(0,0,0,.45)`
- Modal: white, border-radius `--radius-lg`, shadow `--shadow-lg`
- Max-width: 560px (standard), 680px (wide)
- Header: border-bottom `1px solid --color-border`, padding 18px 22px
- Footer: border-top, padding 14px 22px, flex justify-content flex-end gap 10px

---

### Empty State

- Centered, padding 60px 24px
- Icon: 36px emoji
- Title: 16px font-weight 700
- Subtitle: 13px, color `--color-text3`, margin-top 4px

---

## Animation Guidelines

**Entrance transitions:** `opacity 0→1, translateY 8px→0`, 200ms ease-out
**Hover states:** 150ms ease — color, shadow, transform
**Modal/overlay:** 200ms ease-out for backdrop fade
**Loading pulse:** `opacity 1→0.3→1`, 1s ease-in-out infinite

**Do NOT use:**
- Spring/bounce animations
- Page transition slides
- Rotating or spinning loaders (use pulse dot instead)
- Particle effects or confetti

---

## Layout Patterns

### Page Structure
```
.page (padding: 20px 24px)
  ├── .page-header / .ph (flex, space-between)
  │     ├── .ph-l (h2 + p meta)
  │     └── .ph-r (actions)
  ├── KPI grid (3-6 column cards, gap 14px)
  ├── Card (single or stacked, gap 14px)
  └── Table / List
```

### Responsive Breakpoints
- Desktop first (enterprise tool, primarily desktop)
- Below 768px: stack KPI grid to 2 columns
- Below 480px: single column, collapse table to cards

---

## Animation Techniques

From AI design workflow (NewForm/Aura patterns):

| Technique | Description |
|---|---|
| `fade-in` | opacity 0→1, 300ms |
| `slide-up` | translateY 12px→0 + fade, 250ms |
| `blur-in` | filter blur 8px→0 + fade |
| `stagger` | 80ms delay between list items |
| `mesh-gradient` | Multi-layer radial gradients for backgrounds |
| `mask-reveal` | clip-path or mask animation for entrance |

---

## Checklist for New Components

When building a new component, verify:
- [ ] Uses design token variables (not raw hex)
- [ ] Has hover, active, focus states
- [ ] Works at 12px, 13px, 14px body sizes
- [ ] Matches border-radius tokens
- [ ] Card/panel uses proper shadow
- [ ] No blue/purple gradients (AMML is brand-blue/navy only)
- [ ] Empty state defined
- [ ] Loading/disabled state defined

---

*Last updated: 2026-04-21*