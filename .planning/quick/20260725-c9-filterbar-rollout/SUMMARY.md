---
ticket: 20260725-c9-filterbar-rollout
status: complete
commits: [94a6c8a, 05a99ae]
---

# SUMMARY — C9 FilterBar rollout (overnight run 2026-07-25)

## ✓ VERIFIED

| Leg | Evidence |
|---|---|
| FilterBar on org/employees (status+dept+role; dept display names; KPIs follow filter) | battery behavioral proof: dept select narrows rows; clear-all present; TR shot eyeballed (199/199/0/21) |
| FilterBar on org/directors (dept + conditional hook-binding group) | battery 4/4 route checks; group renders only while an unbound director exists (A1) |
| FilterBar on org/hr?view=equipment (status+dept) | v_hr_equipment_check +department (migration 20260725003000; TDD tests/c9/hr-equipment-dept 1/1 red→green); TR shot eyeballed |
| FilterBar on gov/risks (severity+status; ?level= drill contract kept) | proof: chip click → url level=critical; EN shot eyeballed |
| FilterBar on gov/permissions (grantee department; honest 100/173 count) | typecheck + battery; grant total from count:exact in panel title |
| FilterBar on fin/providers (provider+status) | proof: ?status=testing → exactly 3 rows, 0 'Active' badges leaked |
| FilterBar on ai/memory (kind+tier; store stays on §7 cards) | battery 4/4; TR shot eyeballed |
| **Defect fixed on sight: v_org_tree dead legacy status** (21/21 depts inactive, 0 active employees shown) | migration 20260725002000; TDD tests/c9/org-tree-truth 3/3 (red: 0/dormant/205 → green: >0/active/199); battery proof: 0 'Inactive' badges, 21 visible |
| **Defect fixed on sight: providers success rate '1%' for 73%** (0..1 fraction rendered raw) | ×100 like /ai/models; live recheck "73%/9%/100%" GREEN + shot |
| Rule-8 sweeps: 3 truncate sites (policies pattern, policies gov-link, permissions asset) → wrap | battery zero-"…" scan GREEN on all 9 routes |
| Raw `testing` enum humanized (EN "In testing" / TR "Sınavda") | dict keys added; purity PASS 2351=2351 |
| Full battery | 9 routes × EN+TR × 1366/1920: scrollWidth==clientWidth, zero "…", zero clipped .truncate, hydration-settled; + 4 behavioral proofs; screenshots eyeballed |

## Measured A1 boundaries (no filter added — no multi-valued dimension exists today)

- org/departments: 21/21 active, 0 empty after truth fix — single-value status
- gov/policies: 8 approval rules, single screen
- fin/pnl: revenue_ledger 0 rows — filter on empty data is noise; add when revenue exists
- ops/automations: 13 schedules, all values unique per row

## Noted for CEO morning review (not changed tonight)

- /ai/memory store cards show technical English `usage_notes` from library
  inventory on the TR locale (DB content; pre-existing). Candidate for the
  DB-content i18n family — needs a CEO call (translate vs waive like 19e/19f).

## Second leg — suite triage + stale-daemon kill (same night, commit c34609a)

| Leg | Evidence |
|---|---|
| Full suite 9 failing files → **70/70 files, 486 passed, 0 failed** | fresh detached run, `vitest-full2.log` SUITE-DONE exit=0 |
| Outbox internal-signal exclusion (51 eternal 'ready' hook_escalation rows) | migration 20260725004000; TDD tests/c9/outbox-internal-signal 2/2 red→green; close-out audited |
| e10/e8 sweep hygiene (FK order + fixture scoping — unscoped e10 would have wiped real wave history) | e10 alone 35/35; sweeps verified by the clean full-suite run |
| e125 (8) re-anchored to U17(5) pipeline-exclusion contract | EXCLUDED_SLUGS + zero equipment rows asserted; green |
| phase8 DASH-05 allowlist +5 governed doors (each verified a control seam) | green |
| Mailpit sandbox restarted (stopped since 07-18) | r24 7-step walk green |
| **Stale-daemon governance catch**: 2 Jul-19 scheduler processes with pre-guard code dispatched voice/question intents into tasks all week (Korean silence-hallucination chain, the 2 'CEO greets Hamza' rail cards, 4 r31/f31 probes) | both killed; artifact chains purged via audited transactions; CEO voice utterances kept as conversation lineage; end state awaiting=0 pending=0 running=0 alerts=0; /overview eyeballed |
| Post-suite residue sweep executed (script numeric-guard fixed) | sweep COMMIT + audit row |

Note: suite regenerated `packages/gateway/profiles/*` `_generated_at` stamps
(content identical) — rode into c34609a as harmless churn.

## Operational rule recorded (ledger)

After every scheduler restart, exactly ONE `outbox-executor/dist/main.js`
process may exist — stale daemons keep dead code in memory and bypass every
later guard.
