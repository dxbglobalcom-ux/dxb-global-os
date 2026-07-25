---
ticket: 20260725-c9-filterbar-rollout
spec: HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md (C9 open leg + standing order 5 list-page standard)
authorized: CEO in-chat 2026-07-25 ~01:35 ("bu gece hiç durmadan devam et... onayı şimdiden veriyorum")
author: Fable 5 in person (K1 — inline, no subagent authorship)
---

# C9 FilterBar rollout — remaining CEO list pages (execution ticket)

Zero new design decisions. The standard exists (`FilterBar` primitive, URL-param
groups, server narrows EVERY panel — proven on /fin/costs + /fin/tokens).
This ticket applies it to the measured gap.

## Measured gap (this session, grep 2026-07-25 ~01:45)

`FilterBar` used on: fin/costs, fin/tokens ONLY.
DataGrid pages without it (CEO-visible; Machine Room gov/audit, ops/runtime,
sys/logs exempt per A4 doctrine; design-preview not a CEO surface):

1. org/employees (dept/status params exist, no bar)
2. org/directors
3. org/departments
4. org/hr
5. gov/risks (params exist, no bar)
6. gov/policies
7. gov/permissions
8. fin/pnl
9. fin/providers
10. ops/automations
11. ai/memory (store/kind params exist, no bar)

## Contract per page

- Filter groups derived from the page's real columns (department / status /
  model / kind — only groups whose options have ≥2 real values render).
- State in URL params; junk params fall back silently (costs idiom).
- Every panel + KPI below narrows with the filter (C9: "big page below must
  follow the filter").
- Labels via `dict.command.filters` (+ page dicts), EN+TR parity.
- Evidence per surface: RULE #0 battery (EN+TR × 1366/1920, scrollWidth,
  zero "…", screenshots eyeballed) + behavioral filter proof (apply filter →
  row count narrows) + i18n purity PASS.

## Also in this overnight run

- Failing-vitest triage (was 7 files/6 tests: r24 staging-outbox
  hook_escalation handler, phase8 live-projection, +5 unnamed) — root cause
  each, fix or register.
- Post-suite residue sweep (scripts/test/live-residue-sweep.sql) after any
  full-suite run.
