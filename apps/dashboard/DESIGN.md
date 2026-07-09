# DESIGN.md — DXB Cockpit ("Gece Lobisi")

> Mirror of the binding contract `.planning/phases/08-ceo-dashboard-crm/08-UI-SPEC.md`
> (⛔ Fable-approved) for impeccable's hooks. Do NOT invent tokens here — the
> spec wins on conflict. Tokens are implemented in `src/app/globals.css`.

## Visual Theme & Atmosphere

The Burj Al Arab lobby at night: deep warm charcoal, layered light, one
champagne-gold accent under strict discipline (≤8% of any surface). Dense
cockpit data with the seriousness of a flight deck. Depth language is pure
CSS: layer hierarchy (bg → panel shell → panel core → floating chrome),
hue-tinted double shadows, inset top light edges, glass only on fixed chrome.
Three.js/WebGL forbidden. Dials: VARIANCE 6 · MOTION 5 · DENSITY 7 (cockpit)
/ 5 (CRM, settings) / 3 (login).

## Color Palette

Dual-mode, dark primary and brand-carrying. All tokens OKLCH in
`globals.css` (`:root` dark, `:root[data-theme="light"]` light). Semantic
roles: `bg, surface, surface-2, surface-3, ink, ink-2, line, edge-light,
accent (champagne gold), accent-press, on-accent, ok, warn, danger, info`.

Rules: color is never the only indicator (icon+text accompany). Status colors
only for status semantics. Gradients: only the Horizon Line (accent→transparent,
1px) and the single ambient light of the login scene. Pure black/white,
AI-purple, neon glow, gradient text: forbidden.

## Typography

- UI/Display: **Geist Sans** (next/font self-host). Panel title 15px/600,
  page title 22px/600, cockpit display 28px/650 tracking -0.01em. No giant hero.
- Body: Geist Sans 14px/400, relaxed leading, long text max-w-[65ch].
- Data/Mono: **Geist Mono** for ALL numeric data (cost, counters, durations,
  IDs, stamps) — no exceptions; tabular-nums.
- Micro: 11.5px/500 labels. No UPPERCASE+tracking eyebrow pattern in cockpit.
- Forbidden: Inter/Roboto/Arial, any serif in cockpit chrome, display clamp()
  >2.5rem inside cockpit.

## Component Stylings

- Base: shadcn/ui primitives + Tailwind v4 tokens; Aceternity only at signature
  moments (login scene, Horizon Line). Icons: @phosphor-icons/react, regular
  weight only, sizes 16/20/24.
- **Panel (Double-Bezel signature):** outer shell `surface` rounded-[1.25rem]
  p-1.5 + 1px `line` + hue-tinted ambient shadow; inner core `surface-2`
  rounded-[calc(1.25rem-0.375rem)] with `edge-light` inset top highlight.
  Title + FreshnessStamp on the core's top row. Nested cards forbidden —
  internal grouping via divide-y `line`.
- **Buttons:** primary accent pill (rounded-full px-5 h-10) with tactile press
  (active:scale-[0.98] -translate-y-[1px]); secondary ghost 1px `line`;
  destructive only for true destruction. One-line labels.
- **FreshnessStamp:** mono 11.5px `ink-2`, "14:32 itibarıyla"; on channel loss:
  `warn` dot + "canlı değil — son: 14:32".
- **Skeleton:** shimmer in the final layout's exact shape; circular spinners
  forbidden. **EmptyState:** icon + one sentence + one action; empty inbox is
  the `ok` "Kapı temiz" scene.
- **Focus:** 2px accent ring + 2px offset, both themes, every interactive element.

## Layout Principles

- AppShell: left icon rail 64px (hover 220px; bottom tab bar <768px) + top bar
  with **Horizon Line** (1px accent gradient + company pulse: active tasks ·
  pending approvals · today's cost · liveness dot 2.4s loop) + content grid
  max-w-[1600px]. Backdrop-blur ONLY on rail/topbar/modal.
- Cockpit home is exception-first, asymmetric 12-col (7-8 left "Beni
  bekleyenler" + right rail tiles); equal-card grids forbidden.
- Z-scale semantic tokens only (`--z-*`); arbitrary z-index forbidden.
- Spacing rhythm 4/8: panel inner 16/20, between panels 20/24, sections 32/40.
  `h-screen` forbidden → `min-h-[100dvh]`. Touch ≥44px; safe-area insets.

## Motion & Interaction

Tokens: `--dur-fast 150ms / --dur 250ms / --dur-slow 400ms`, ease
`cubic-bezier(0.22,1,0.36,1)`; springs stiffness 100 damping 20. Panel entry:
24px fade-up + 40ms stagger (first mount only). Live value change: flip +
600ms accent pulse. Login→cockpit door-opening clip-path 700ms, once per
session. Perpetual loops only: Horizon Line pulse + in-progress dot.
prefers-reduced-motion: instant/crossfade, loops stop. Animate transform+opacity
only; no window scroll listeners.

## Anti-Patterns (mechanically scanned)

Inter/serif-in-cockpit · pure #000/#fff · AI-purple/neon/gradient-text ·
side-stripe borders · hero-metric template · equal card grids · nested cards ·
eyebrow-per-section · cream default bg · 3-equal-column features · circular
spinner · placeholder-as-label · emoji icons · h-screen · scroll listeners ·
blur in scroll content · arbitrary z-index · fake-precise numbers ·
"John Doe"/Acme seed data (realistic TR business data instead) · em-dash in UI
strings · critical errors in toasts · per-action approval popups.
