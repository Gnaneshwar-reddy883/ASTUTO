---
name: Kinetic Obsidian
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bacbbe'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#849589'
  outline-variant: '#3b4a41'
  surface-tint: '#00e297'
  primary: '#6dffba'
  on-primary: '#003822'
  primary-container: '#00e599'
  on-primary-container: '#00613e'
  inverse-primary: '#006c46'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffded5'
  on-tertiary: '#5f1500'
  tertiary-container: '#ffb8a4'
  on-tertiary-container: '#9e2900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#4dffb2'
  primary-fixed-dim: '#00e297'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#005234'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0900'
  on-tertiary-fixed-variant: '#862200'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-pill:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an ultra-focused, high-momentum atmosphere tailored for self-directed learners, builders, and ambitious professionals. It marries the disciplined minimalism of developer-grade tooling with the visceral thrill of daily habit progression.

The design movement blends **Dark-Mode Precision Minimalism** with **Selective Cybernetic Luminescence**:
- Surfaces remain deeply anchored in near-black charcoal tones to eliminate visual cognitive load.
- Energy and attention are directed strictly via an electric neon lime spectrum, signaling momentum, execution, and active streaks.
- Gamification metaphors (streaks, velocity, mastery milestones) are stripped of juvenile cartoonishness, rendered instead as refined instrument-grade glows, clean linear trackers, and kinetic micro-indicators.
- The interface evokes feelings of surgical clarity, continuous forward momentum, and rewarding daily discipline.

## Colors

The color palette is architected for extreme foreground-to-background contrast while preventing eye fatigue across extended study and planning sessions.

### Color Roles & Semantics
- **Background Anchor (`#0A0D12` / `#0D1117`)**: The bottom canvas layers. True void black is avoided in favor of deep atmospheric charcoal that preserves spatial context.
- **Surface Elevation (`#161B22` / `#1F242C`)**: Mid-tier cards, panels, and floating navigation containers.
- **Primary Accent (`#00E599`)**: Electric lime. Used exclusively for primary calls-to-action, active progress bars, high-value conversion elements, and kinetic achievement triggers.
- **Secondary Accent (`#10B981`)**: Deep mint emerald. Functions as the supporting gradient anchor and steady state success indicator.
- **Tertiary Heat Accent (`#FF5722` / `#FF7A00`)**: Ember flame orange. Strictly reserved for streak fire counters, urgent review cues, and gamified momentum streaks.
- **Text & Foreground**:
  - High Emphasis: `#F0F6FC` (Crisp off-white)
  - Mid Emphasis: `#8B949E` (Subtle silver)
  - Low Emphasis / Muted: `#484F58` (Deep graphite)
- **Border Gradients**: `#30363D` transitioning into low-opacity `#00E599` at focus points or hover thresholds.

## Typography

The typography strategy pairs the geometric clarity of **Plus Jakarta Sans** with the structural precision of **JetBrains Mono**.

- **Editorial Headlines**: Emphasize high density, tight negative tracking (`-0.02em` to `-0.03em`), and deliberate line-height control to give statements of mastery an architectural weight.
- **Body Text**: Tuned for maximum scannability on backlit displays. Font weights stay at 400 with neutral tracking to avoid visual clutter against charcoal backgrounds.
- **Monospace Metadata**: JetBrains Mono is deployed purposefully for streak counters, time stamps, prompt tokens, and data telemetry. This highlights the AI-engineered, precise nature of the learning planner.

## Layout & Spacing

The layout is grounded on a responsive **12-column fluid grid** bounded by a max-width container of `1280px` on desktop, shifting to a single-column or 4-column flow on mobile viewports.

### Rhythm & Structure
- **Vertical Cadence**: Landing page sections follow an expansive rhythm with `space-xl` multiplications (typically 5rem to 7.5rem between major narrative modules) to give product screenshots and interactive previews room to breathe.
- **Component Enclosures**: Dense internal padding (`space-md` to `space-lg`) paired with airy external separation ensures interactive modules feel modular and dockable.
- **Breakpoints**:
  - Desktop: `>= 1024px` (12 columns, 24px gutter, 32px safe margin)
  - Tablet: `768px - 1023px` (8 columns, 20px gutter, 24px safe margin)
  - Mobile: `< 768px` (4 columns, 16px gutter, 20px safe margin)

## Elevation & Depth

Visual depth avoids conventional heavy drop shadows, relying instead on **translucent surface layering**, **backlit neon diffusion**, and **fine border conduits**.

### Depth Hierarchy
1. **Canvas Level (`0dp`)**: Pure background (`#0A0D12`). Receives faint radial gradients of electric lime (`rgba(0, 229, 153, 0.04)`) to anchor hero modules.
2. **Surface Tier 1 (`1dp`)**: Base cards and dashboard panels (`#161B22` at 80% opacity with `backdrop-filter: blur(16px)`). Bound by a 1px structural border of `rgba(255, 255, 255, 0.08)`.
3. **Surface Tier 2 / Hover State (`2dp`)**: Elevated interactive modules. The 1px border transitions to `rgba(0, 229, 153, 0.35)` with an ambient edge glow: `0px 0px 24px -4px rgba(0, 229, 153, 0.15)`.
4. **Streak & Gamification Overlays (`3dp`)**: Streak flame badges and real-time XP counters emit an ember halo: `0px 0px 20px -2px rgba(255, 87, 34, 0.25)`.
5. **Floating Navigation & Modals (`4dp`)**: Glassmorphic panels (`#0D1117` at 85% opacity with 20px blur) framed with a subtle gradient rim and deep ambient occlusion shadow (`0 20px 40px -15px rgba(0, 0, 0, 0.7)`).

## Shapes

The design system employs an exaggerated dual-radius curve schema:
- **Macro Enclosures (Feature Cards & Hero Modules)**: Rely on soft, tactile curvatures (`24px` to `32px` / `rounded-2xl` through `rounded-3xl`) to make complex schedule grids feel inviting and touch-native.
- **Action Elements & Badges**: Utilize strict full-radius pill silhouettes (`9999px`) to create an ergonomic, fluid contrast against rectangular preview cards.
- **Input Fields & Small Items**: Calibrated at `12px` to `16px` (`rounded-xl`), maintaining geometric balance with the card corners they live inside.

## Components

### Buttons
- **Primary Kinetic Button**:
  - Fill: Electric Lime (`#00E599`) transitioning to Mint (`#10B981`) on subtle angle.
  - Text: `#0A0D12`, font weight 700.
  - Shape: Full pill (`rounded-full`) or sleek `rounded-xl`.
  - Elevation: Glow aura `0px 4px 20px rgba(0, 229, 153, 0.35)`. Hover enhances blur to `28px` with slight upward translation (`-1px`).
- **Secondary Ghost Button**:
  - Fill: `rgba(22, 27, 34, 0.6)`.
  - Border: 1px `rgba(255, 255, 255, 0.12)`.
  - Text: High-emphasis `#F0F6FC`. Hover prompts border tint to `#00E599` with background shifting to `rgba(0, 229, 153, 0.06)`.

### Badges & Gamification Pills
- **Streak Counters**:
  - Background: `rgba(255, 87, 34, 0.12)`.
  - Border: 1px `rgba(255, 87, 34, 0.3)`.
  - Text: Flame Orange (`#FF7A00`) accompanied by an animated flame glyph and `JetBrains Mono` day count.
- **Category & Topic Tags**:
  - Background: `rgba(255, 255, 255, 0.04)`.
  - Border: 1px `rgba(255, 255, 255, 0.08)`.
  - Text: Mid-emphasis `#8B949E`, uppercase tracking `0.04em`.

### Cards & Curriculum Timeline Blocks
- **Container Structure**:
  - Surface: Glass-charcoal `#161B22` with 16px blur.
  - Border: Multi-stop gradient border from `rgba(0, 229, 153, 0.2)` fading to `rgba(255, 255, 255, 0.04)`.
  - Corners: `rounded-2xl` or `rounded-3xl`.
- **Milestone Check Items**:
  - Unchecked: 1px graphite ring (`#30363D`), transparent center.
  - Checked: Solid `#00E599` fill, dark check icon, accompanied by faint lime pulse wave.

### Input Fields & Interactive Prompts
- **AI Plan Generation Bar**:
  - Elevated capsule bar floating across the hero or header.
  - Surface: `#161B22` with an inner border glow on focus (`#00E599` at 50%).
  - Text input: `#F0F6FC` with placeholder `#484F58`.
  - Right accessory: Integrated pill action button with instant tactile feedback.

### Progress Gauges
- **Velocity Meters**:
  - Background Track: `#21262D` rail, height 6px, fully rounded ends.
  - Progress Fill: `#00E599` with glowing leading cap (`box-shadow: 0 0 10px #00E599`).