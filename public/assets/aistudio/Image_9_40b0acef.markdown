---
name: Sovereign Dual-Market Wealth
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#56e5a9'
  on-tertiary: '#003824'
  tertiary-container: '#30c88f'
  on-tertiary-container: '#004e34'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-precision, institutional-grade mobile experience for cross-border investors navigating both B3 (Brazil) and Wall Street (US). The aesthetic merges Swiss modernist clarity with the quiet luxury of sovereign asset management. It balances technical analytical rigour with an intuitive, calm confidence, eliminating typical retail fintech clutter in favor of scannable data density, bespoke asset tagging, and high-legibility telemetry.

The visual direction follows a **Modern Dark Minimalist & Tonal Layered** architecture. Deep marine foundations recede into the backdrop, allowing high-contrast financial telemetry, yield highlights, and tabular quotation tickers to command immediate visual hierarchy without cognitive fatigue. Precision borders, restrained glowing accents, and tactical spatial discipline evoke the experience of an executive trading terminal optimized for mobile.

## Colors

The palette is engineered specifically for deep-contrast low-light performance, eliminating eye strain during multi-market trading sessions and market-close reviews.

### Base Canvases & Surfaces
- **Canvas Base (`#090D16`)**: The primary subterranean layer used for root screen views and persistent system navigation backings.
- **Surface Layer 1 (`#0F172A`)**: The primary structural surface for lists, master cards, and contextual sheets.
- **Surface Elevated / Slate (`#162032`)**: Used for nested cards, interactive row presses, and modular data containers.
- **Surface Accent / Slate Border (`#1E293B`)**: Demarcates active components, sub-segment dividers, and structured group lines.

### Brand & Interactive Accents
- **Electric Cyan (`#38BDF8`) & Deep Blue (`#2563EB`)**: Interactive primary triggers, global portfolio charts, active tab indicators, and dynamic market telemetry.
- **Imperial Gold / Amber (`#F59E0B`, `#FBBF24`)**: Reserved strictly for passive income (proventos/dividends), milestones, yield rates, and portfolio yield-on-cost metrics.

### Financial Telemetry & Semantics
- **Yield Positive / Emerald (`#10B981`)**: Positive return curves, green candle bodies, and positive capital appreciation.
- **Yield Negative / Crimson (`#EF4444`)**: Drawdowns, negative performance metrics, and sell actions.
- **Subdued Metals (`#94A3B8`, `#E2E8F0`)**: Secondary metadata, tabular labels, currency conversions (BRL/USD), and micro-copy.

## Typography

The typographic hierarchy implements three distinct typefaces to serve functional asset tracking:

1. **Space Grotesk**: Utilized for structural display headlines, asset portfolio totals, and high-impact micro-labels (`label-caps`). Its sharp geometric contours communicate technical sophistication.
2. **Manrope**: Applied to all interface copy, portfolio breakdown explanations, asset names, and descriptive disclosures. Its balanced humanist neutral design ensures effortless continuous scanning.
3. **JetBrains Mono**: Assigned exclusively to numerical data, monetary amounts (R$ and US$), exchange rates, percentage variances, and ticker symbols (`PETR4`, `AAPL`, `HGLG11`, `VNQ`). Its fixed-width character grid guarantees flawless tabular alignment across rolling financial tickers and columnar reports.

## Layout & Spacing

This design system uses a strict mobile-first 4px base spatial unit, structured around a 4-column fluid mobile layout with an outer canvas boundary of 16px (`margin: 1rem`) and 12px (`gutter: 0.75rem`) internal column troughs.

- **Mobile Canvas**: 360px to 428px standard viewport width. Content stacks in full-width single-column cards or 2-column split telemetry modules (e.g., FX Rate alongside Daily P&L).
- **Safe Areas & Margins**: Top viewport navigation allows 48px to 56px clear header zones, with bottom-anchored portfolio action sheets padded against device touch-bars via 24px bottom buffer bounds.
- **Rhythmic Stacking**: Vertical module blocks maintain consistent `space-md` gaps. Sub-elements inside asset cards (such as ticker name to market value) sit on tight `space-xs` and `space-sm` relationships to maintain unified data grouping.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** combined with ultra-subtle directional border lighting, avoiding muddy drop shadows that compromise legibility on OLED screens.

- **Base Ground (`#090D16`)**: Lowest tier, host to background line charts and master canvas screens.
- **Mid-Tier Surfaces (`#0F172A`)**: Standard card containers. Layer separation is established with a crisp 1px stroke of `#1E293B` instead of ambient blur.
- **Elevated Interactive Objects (`#162032`)**: Draggable order sheets, filter drawers, and active metric chips. These utilize a faint top highlight edge (`inset 0 1px 0 0 rgba(255, 255, 255, 0.06)`) to simulate physical beveling under soft terminal lighting.
- **Floating Overlays & Action Bars**: High-density elements leverage a backdrop blur filter (`backdrop-filter: blur(16px)`) with 85% opacity on `#090D16` to preserve scroll context while maintaining full focus on foreground telemetry.

## Shapes

The design system adopts a **Soft (Level 1)** geometric standard. This subtle curvature balances contemporary mobile ergonomics with the rigid precision demanded by financial spreadsheets and trading desks.

- **Standard Elements (`0.25rem` / 4px)**: Input fields, ticker tags, broker identification badges, and tabular numeric chips.
- **Structural Containers (`rounded-lg` / 8px)**: Portfolio performance cards, dividend calendar tiles, and market depth modules.
- **Contextual Modals (`rounded-xl` / 12px)**: Bottom action sheets, cross-currency swap dialogs, and asset allocation drawers.

## Components

### 1. Dual-Market Asset Badges & Tags
- **Country Identifier**: Compact pill badges featuring vectorized 12x9px flags (Brazil / US) coupled with ticker symbols (`label-numeric-sm`), set against `#162032` background with `#1E293B` borders.
- **Asset Class Chips**: Distinct categorizations (`Ação`, `FII`, `Stock`, `ETF`, `REIT`, `BDR`) styled with uppercase `label-caps`. Backgrounds are monochromatic slate (`rgba(148, 163, 184, 0.08)`) with silver text (`#94A3B8`) to avoid clashing with the green/red profitability indicators.
- **Brokerage Indicator (Custódia)**: Micro-tags indicating holding origin (`XP`, `Avenue`, `BTG`, `Schwab`) rendered in monospaced caps with a 1px vertical divider to separate broker name from allocation percentage.

### 2. Buttons & Triggers
- **Primary Trigger**: Solid Electric Cyan (`#38BDF8`) fill with midnight text (`#090D16`), bold weight. Used strictly for dominant actions (e.g., "Aportar", "Registrar Operação").
- **Secondary Action**: Slate base (`#162032`) with a 1px border (`#1E293B`) and white-silver typography (`#E2E8F0`).
- **Income & Yield Trigger**: Accent amber outline (`#F59E0B`) with transparent fill and 10% amber hover state, dedicated exclusively to passive income projections and dividend reinvestment workflows.

### 3. Metric & Quote Display Cards
- **Asset Row Item**: Left-aligned ticker badge, asset name, and country flag; right-aligned tabular price, current position total, and daily percentage movement tagged with dynamic `#10B981` or `#EF4444` background pills.
- **Dividend Payout Card**: Anchored by Amber (`#F59E0B`) monetary totals, pay date formatted via `JetBrains Mono`, status badge ("Provisionado" vs "Pago"), and yield-on-cost percentage.

### 4. Input Fields & Form Controls
- **Currency Toggle & Inputs**: Dual-currency input fields allowing instant switching between BRL (R$) and USD ($). Input text utilizes `label-numeric-lg` for clear verification. Base background remains `#0F172A` with an active focus glow in Electric Cyan (`rgba(56, 189, 248, 0.2)` outline).
- **Checkboxes & Segmented Controls**: Custom low-profile controls with 2px borders, filling with Cyan when checked, accompanied by subtle haptic feedback for order executions.