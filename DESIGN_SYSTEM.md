# CompScience Design System

> **Source of truth:** `static/styles.css` in `ai-applications`
> Icons: [Lucide](https://lucide.dev/) — inline SVG, 20×20px
> Font: [Spline Sans](https://fonts.google.com/specimen/Spline+Sans) via Google Fonts

---

## Typography

**Font:** `"Spline Sans", sans-serif` — loaded via Google Fonts  
**Base:** 14px, weight 400, no letter-spacing, color `--black`

```html
<link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300..700&display=swap" rel="stylesheet">
```

### Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| `h1` | 24px | 600 | 145% |
| `h2` | 20px | 600 | 120% |
| `h3` | 16px | 600 | 110% |
| `h4` | 14px | 500 | 110% |
| `p` | 14px | 400 | 150% |
| `.body-16-regular` | 16px | 400 | 150% |
| `.body-16-semibold` | 16px | 600 | 150% |
| `.body-14-medium` | 14px | 500 | 110% |
| `.body-12-bold` | 12px | 700 | 100% |
| `.body-12-medium` | 12px | 500 | 100% |
| `.body-12-regular` | 12px | 400 | 110% |
| `p.footnote` | 12px | 400 | — | color: `--grey-500` |

---

## Color Tokens

All colors are CSS custom properties defined in `:root` in `styles.css`.

### Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-green` | `#00C57B` | Primary brand color, CTAs, active states |
| `--blue-midnight` | `#01232C` | Headers, dark accents, active nav tabs |
| `--orange-web` | `#F98D00` | Warnings, secondary highlights |
| `--dark-green` | `#009960` | Dark green variant |
| `--light-green` | `#67E7B1` | Light green variant |
| `--extra-light-green` | `#F0FDF7` | Very subtle green backgrounds |

### Greyscale

| Token | Value |
|-------|-------|
| `--black` | `#1A1A1A` |
| `--grey-800` | `#262626` |
| `--grey-700` | `#3D3D3D` |
| `--grey-600` | `#4E4E4E` |
| `--grey-500` | `#949899` |
| `--grey-400` | `#C6CBCC` |
| `--grey-300` | `#E1E5E5` |
| `--grey-200` | `#EDF1F2` |
| `--grey-100` | `#F8F9FA` |

### Semantic / Status

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#03D932` | Success states |
| `--success-dark` | `#079026` | |
| `--warning` | `#FFCB45` | Warning states |
| `--warning-dark` | `#C68E01` | |
| `--danger` | `#FF1F1F` | Error / danger states |
| `--danger-hover` | `#EA0808` | |
| `--danger-dark` | `#9F0000` | |
| `--info-blue` | `#365AC7` | Info states |

### Full Scale Palettes

<details>
<summary>Green scale</summary>

| Token | Value |
|-------|-------|
| `--green-900` | `#005233` |
| `--green-800` | `#007448` |
| `--green-700` | `#009960` |
| `--green-600` | `#01B16F` |
| `--green-500` | `#00C57B` |
| `--green-400` | `#17D68E` |
| `--green-300` | `#2DDF9C` |
| `--green-200` | `#67E7B1` |
| `--green-100` | `#A9F8D7` |
| `--green-50` | `#dcfef3` |

</details>

<details>
<summary>Blue scale</summary>

| Token | Value |
|-------|-------|
| `--blue-900` | `#001040` |
| `--blue-800` | `#061F68` |
| `--blue-700` | `#13328D` |
| `--blue-600` | `#2344AA` |
| `--blue-500` | `#365AC7` |
| `--blue-400` | `#617FDA` |
| `--blue-300` | `#809AEA` |
| `--blue-200` | `#A0B2E6` |
| `--blue-100` | `#BCC9F1` |
| `--blue-50` | `#D8E0F5` |

</details>

<details>
<summary>Beige scale</summary>

| Token | Value |
|-------|-------|
| `--beige-900` | `#826d74` |
| `--beige-800` | `#A59088` |
| `--beige-700` | `#C2B1AB` |
| `--beige-600` | `#D6C8C2` |
| `--beige-500` | `#E1D7D3` |
| `--beige-400` | `#EAE0DD` |
| `--beige-300` | `#F1E9E6` |
| `--beige-200` | `#F5ECE7` |
| `--beige-100` | `#FCF9F7` |

</details>

---

## Icons

**Library:** [Lucide](https://lucide.dev/) — clean, consistent open-source SVG icon set.

**Standard size:** 20×20px  
**Color:** `currentColor` — icons inherit text color, so they automatically go green on hover/active.

```html
<!-- Example: inline Lucide icon -->
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <!-- path data from lucide.dev -->
</svg>
```

> AI agents that know Lucide can render icons inline from memory — just specify the icon name.

---

## Components

### Buttons

Pill-shaped (`border-radius: 100px`), three variants, two sizes.

```html
<!-- Primary -->
<button class="button primary">Save</button>

<!-- Secondary (outline) -->
<button class="button secondary">Cancel</button>

<!-- Tertiary (text only) -->
<button class="button tertiary">Learn more</button>

<!-- Small modifier -->
<button class="button primary small">Save</button>
```

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `.primary` | `--brand-green` | white | none |
| `.secondary` | transparent | `--brand-green` | `--brand-green` |
| `.tertiary` | transparent | `--brand-green` | none |

Sizes: default = 16px font / 8px 16px padding · `.small` = 14px font

---

### Tags / Badges

```html
<!-- Solid -->
<span class="tag green">Active</span>
<span class="tag red">Alert</span>
<span class="tag blue">Info</span>
<span class="tag yellow">Pending</span>

<!-- Light (10% opacity background) -->
<span class="tag green-light">Active</span>

<!-- Outline -->
<span class="tag green-outline">Active</span>

<!-- Pill shape modifier -->
<span class="tag green round">Active</span>
```

Base: `border-radius: 4px`, 12px font, 500 weight, `4px 8px` padding.  
Add `.round` for `border-radius: 100px` pill shape.

---

### Sidebar

Source: `ui_core/static/ui_core/Sidebar/sidebar.css` + `sidebar.js`  
Template: `ui_core/templates/ui_core/Sidebar/sidebar.html`

**States:** `.sidebar-expanded` (256px) · `.sidebar-collapsed` (64px) · `.sidebar-hidden` (0px)  
**Transitions:** `all 0.3s ease-in-out` on all animated properties

```html
<div class="app-layout">
  <!-- Sidebar included via Django template tag -->
  {% include 'ui_core/Sidebar/sidebar.html' %}

  <div class="app-content">
    <!-- page content -->
  </div>
</div>
```

**Active/hover states:**
- Background: `rgba(0, 197, 123, 0.1)` (active) / `rgba(0, 197, 123, 0.05)` (hover)
- Text + icon: `--brand-green`
- Icons use `currentColor` — no extra styling needed

**Mobile:** Fixed overlay at z-index 1000, dark backdrop (`rgba(0,0,0,0.5)`) at z-index 99, breakpoint at 768px.

---

### Tables

Zebra striping with `--grey-100`, no outer border. Header text is uppercase, `--grey-600`, 14px/600.  
Links in cells: `--brand-green`, 14px, 600 weight.

---

### Navigation Tabs

```html
<div id="siteHeader">
  <h1>Page Title</h1>
  <nav class="secondary-tabs">
    <a href="#" class="selected">Tab One</a>
    <a href="#">Tab Two</a>
  </nav>
</div>
```

Active tab: `--blue-midnight` text + 2px bottom border in `--blue-midnight`.

---

## Layout

### App Shell

```html
<div class="app-layout">          <!-- flex row, min-height: 100vh -->
  <aside id="app-sidebar"> ... </aside>
  <div class="app-content"> ... </div>   <!-- flex: 1, flex-col -->
</div>
```

### Settings / Centered Pages

```html
<div class="centered-layout-wrapper">
  <div class="settings-section">
    <!-- max-width: 900px, border, border-radius: 8px, padding: 32px -->
  </div>
</div>
```

---

## Utility Classes

| Class | Effect |
|-------|--------|
| `.hidden` | `display: none !important` |
| `.uppercase` | `text-transform: uppercase` |
| `.nowrap` | `white-space: nowrap` |
| `.hiddenIfMobile` | Hidden below 768px |
| `.showIfMobile` | Visible only below 768px |
| `.slide-up` | Slide-up entrance animation (0.2s) |
| `.fade-in` | Fade-in entrance animation (0.25s) |
| `.slide-up-fade-in` | Both combined |

---

## Notes on ui_core

`ui_core/` is a WIP Django app porting components from the React `ui-core` repo into vanilla CSS + JS for use in `ai-applications`. Currently contains:

- `Sidebar` — fully ported, in production use via `partials/header.html`
- `Button` — ported

The design tokens (colors, typography) are shared and consistent between both repos. The main divergence is React/Tailwind in `ui-core` vs. vanilla CSS with CSS custom properties here.
