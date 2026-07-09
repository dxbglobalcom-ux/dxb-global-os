# PRODUCT.md — DXB Cockpit

> Derived from the binding design contract at
> `.planning/phases/08-ceo-dashboard-crm/08-UI-SPEC.md` (⛔ Fable-approved) and
> `08-CONTEXT.md`. The spec wins on conflict — update it first, then this file.

## Register

**product** — design SERVES the product. The cockpit carries dense operational
data; design exists so a non-technical CEO runs a company from it without
errors, hesitation, or training.

## Target Users

One user: the CEO of DXB Global. Non-technical, Turkish-speaking (tr primary,
en secondary), often on a phone, always short on time. He does not explore UI —
he answers what the company asks him and reads what changed.

## Product Purpose

The single cockpit for an AI-native company that runs itself 24/7. The CEO
states intent once (command bar), approves outward-facing actions
(risk-grouped inbox), and watches cost/tasks/agents live (Broadcast-from-DB).
Anti-babysitting is the core value: the interface asks only what only the CEO
can decide.

## Brand Personality

"Gece Lobisi" — the Burj Al Arab lobby at night. Dark, warm, layered light;
one disciplined champagne-gold accent; every surface feels machined
(double-bezel), nothing shouts. Luxury comes from material — depth, light
edges, spring motion, spacing rhythm — never from ornament. Awe at entry,
calm total control in use.

## Anti-References

- Generic admin templates (three equal stat cards, sidebar-with-logo sameness)
- AI-slop visuals: purple-to-blue gradients, neon glow, gradient text
- Firehose dashboards ("all agents wall", raw event streams)
- Per-action approval popups (GATE-03 violation — approvals are batched by risk)
- Marketing flourish inside the product (hero copy, badges, confetti)

## Strategic Design Principles

1. **Exception-first:** the default view answers "what waits on me + what just
   changed" — never "everything we have".
2. **Trust through freshness:** every live panel carries its stamp
   ("14:32 itibarıyla"); a broken channel says so instead of pretending.
3. **Risk-shaped attention:** high-risk approvals are visually heavy and
   deliberate; low-risk approvals batch away in one click.
4. **Depth, not decoration:** the 3D feel is CSS layering (bg → shell → core →
   floating chrome), hue-tinted double shadows, inset light edges. No WebGL.
5. **Turkish-first text layer:** every visible string lives in messages/tr.json
   (en mirror); hard-coded UI strings are a build failure, not a style issue.
6. **Phone is a first-class seat:** the CEO approves from bed; touch targets
   ≥44px, safe-area respected, tables collapse to card rows.
