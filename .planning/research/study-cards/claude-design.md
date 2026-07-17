# Study Card: Claude Design 2.0

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 14).

- **Tool:** Claude Design (Anthropic Labs) — collaborative visual design product; 2.0 overhaul mid-June 2026
- **Slug:** claude-design
- **Category:** Design
- **Status:** STUDY
- **Target Phase:** dashboard/design work as needed (design dept lane; already-licensed product, not an install)
- **Owner (dept/tier):** Design dept + dashboard build
- **Trigger Type:** service (Anthropic product bundled with Pro/Max/Team subscription — research preview)
- **Source:** https://www.anthropic.com/news/claude-design-anthropic-labs (launched 2026-04-17; 2.0 update mid-June 2026)
- **Pinned Version:** SaaS (no pin) — capabilities snapshot dated 2026-07-17
- **Purpose:** Designs, prototypes, slides, one-pagers with Claude (Opus 4.7 vision). 2.0 adds: **design-system import** (from GitHub repo/design files/uploads — Claude builds with those components and self-checks against the system before showing output), **finer editing controls**, **Claude Code handoff** (design → code continuation, no screenshot rebuild), **token efficiency** (shares usage limits with chat/Cowork/Claude Code).
- **Official Docs URL:** https://claude.com (product surface; no separate docs site measured)

## Key API / Usage Notes

- Direct DXB fit: import `references/design-bank/` + our token set (DESIGN_SYSTEM.md semantic tokens) as the design system → generated visuals stay on-system by construction; handoff lands in Claude Code where RULE #0 verification battery runs unchanged.
- Marketing/One-pager use: Outleteuro-era sales collateral without a paid design SaaS → D1-friendly (already inside existing subscription).

## Known Pitfalls

1. Research preview: features/limits can shift under us — re-snapshot capabilities before relying on it in a client-facing deadline.
2. Shared usage limits: heavy Design sessions eat the same quota Claude Code runs on — schedule around build-critical sessions.
3. RULE #0 still binds: Claude Design output is a DRAFT; the design-verification pass (both locales, widths, checklist) remains mandatory before anything reaches the CEO.

- **Install Command:** none (subscription surface) — usage doctrine recorded here.
- **Legitimacy Verdict:** OK — first-party Anthropic; zero marginal cost within existing subscription (D1 compliant).

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL (n/a — subscription; mark when first real DXB design produced)
- [ ] ADOPT
- [ ] EMBED
