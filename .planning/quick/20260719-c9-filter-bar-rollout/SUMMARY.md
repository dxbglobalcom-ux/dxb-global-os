---
status: complete
date: 2026-07-19
---

# SUMMARY — C9 filter-bar + CEO morning-review fixes

Scope grew live: while the C9 ticket ran, the CEO reviewed surfaces in-session and ordered immediate fixes (Amendment A1 — same turn). All shipped in one commit.

## Delivered

1. **FilterBar primitive** (`components/primitives/filter-bar.tsx`, client): URL-param groups — chips (range) + selects (dept/model), defaultValue = clean URL, clear-all. Exported from primitives index.
2. **/fin/tokens**: range/dept/model narrow every panel (KPIs, by-model, by-department, daily). Values validated against 30d data.
3. **/fin/costs**: same filters drive KPIs, breakdowns, daily and the ledger table; `CostFilters` optional param on `postgrestCostSource`/`postgrestDailySource` (COST-04 SQL-equality tests untouched — 12/12 green); dept/model survive range/day drills; duplicate range chips removed from ledger panel.
4. **Approvals bulk actions**: bar always visible (select-all + count + disabled-at-0); NEW audited bulk delete — entity `approval` in `control_records_purge` (migration 20260719008000, terminal-only; pending chains reject→purge); decided rows selectable.
5. **Design rulings applied**: StatusBadge equal width (`min-w-[9ch] justify-center`); zero "…" (42 dict strings + 5 code sites + truncate→wrap on live feed/approval titles/cost model col/bar lists).
6. **Live feed**: label-less run rows say "Background system work" (runNoLabel EN+TR) — "Running Running" dead.
7. **Fixture purge (C20 rule)**: 15 E8.2 + 47 R31 probe tasks, probe approvals, e10t escalations — audited; `test-e8-model` off Tokens; Outleteuro out of dicts (U19).
8. **Ops**: stale `next start` (03:46) served dead chunks → "SOMETHING BROKE" on /live; restarted on fresh build.
9. **Ledger truth**: C9 closure line corrected (RULE #0-A) — prior "delivered on Tokens" claim overstated; morning-additions table appended.

## Evidence

- `pnpm build` ✓ compiled, TS clean; `vitest` cost tests 12/12; `i18n-purity-check.sh` PASS (en 1919 = tr 1919).
- RULE #0 battery (Playwright, CEO storageState): 4 routes × EN+TR × 1366/1920 = 16/16 PASS (scrollWidth==clientWidth, 0 ellipsis nodes, 0 clipped truncate); dept filter exercised live (URL updates, panels narrow, clear-all appears); screenshots in session scratchpad.
- DB: pending approvals 8→4 (all real "water bottle motto" tasks); `test-e8-model` runs 0; purge audit rows written.

## Discovered / left open (in C-ledger)

- decide_approvals does not move the linked task out of `awaiting_approval` (C5 gap, decision→task direction).
- HelpTip depth pass (CEO order: per-page section explanations, plain language) — next block.
- WisprFlow-style dictation in Chat with Hamza + Voice Line merge (U15) — next block.
- Filter-bar rollout to remaining list pages.
