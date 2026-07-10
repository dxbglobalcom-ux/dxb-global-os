---
phase: 09-jarvis-voice-layer
plan: 02
status: complete
completed: 2026-07-10
duration: ~65min work spread over two sessions (07:39–07:41 view+tests; 11:52 isolation fix; 12:14–12:21 final verify after session crash)
tasks_completed: 2/2
commits:
  - "9845168 feat(09-02): v_morning_briefing view (0018) + delta-isolated test suite"
---

# 09-02 SUMMARY — v_morning_briefing: the ONE briefing content source

**Executed inline by Fable 5 (governance v5 — no subagent).** Session note:
executing session died right after rewriting the sensitivity test; this session
re-ran the suite (5/5), then completed the plan-mandated corrupt→FAIL→revert
proof and psql verification itself.

## What closed

Master-plan LOCKED decision delivered: the morning briefing has exactly one SQL
content surface. `v_morning_briefing` returns three fixed-order blocks
(overnight work / pending approvals / 24h cost) as jsonb payloads; 09-03's
briefing.ts will reword rows, never invent content. Read-only projection —
SECURITY INVOKER, no new table, no write path, timezone-explicit windows.

## Task evidence

| Task | ✓/⚠ | Evidence (command → decisive output) |
|---|---|---|
| T1 migration 0018 applied | ✓ VERIFIED | psql (supabase_db container): `select sort, block, keys from v_morning_briefing` → **3 rows, fixed order** — overnight_work(by_status,recent_done,total_events,window_start) / approvals(by_risk,oldest,pending_total) / cost_24h(top_departments,total_eur); `pg_class.reloptions` → `{security_invoker=true}` |
| T2 tests green | ✓ VERIFIED | `pnpm vitest run tests/phase9/briefing-view.test.ts` → **5 passed (5)** — window-edge proof (1 of 2 seeded events counted), pending-only by-risk deltas, cost sum to the cent + desc ranking + 25h-old row excluded, quiet-night shape invariants |
| T2 sensitivity (corrupt→FAIL→revert) | ✓ VERIFIED | sed `toBe(1)`→`toBe(2)` → vitest → **1 failed: "expected 1 to be 2"** → revert → **5 passed (5)**; plus a PERMANENT in-suite sensitivity test: pending approval ADD → pending_total delta 3, REMOVE → delta 2 |
| COST-04 parity | ✓ VERIFIED | `grep cost_ledger apps/dashboard/src/lib/costs.ts` → lines 93,104 — dashboard reads cost_ledger; view uses same table + `sum(cost_eur)`; migration contains zero hard-coded litellm literals (none needed — parity is at the cost_ledger surface) |

## Deviations (mandatory adaptations, recorded)

| # | Deviation | Why |
|---|---|---|
| 1 | Migration path `db/migrations/`, not plan's `supabase/migrations/` | Repo convention — 0001–0017 all live in db/migrations/; plan text followed the template path |
| 2 | Renumber 0012 → 0018 | 0012–0017 taken by Phase-8 migrations (already recorded in plan objective) |
| 3 | Sensitivity test = pending-row ADD/REMOVE, not decision flip | Phase-4 rails discovered live: decisions are IMMUTABLE ("karar değiştirilemez" trigger) and approve spawns an outbox row — flipping a decision fights the safety rails the test must respect, not weaken |
| 4 | Cost block reads cost_ledger, not litellm.LiteLLM_SpendLogs via shared constants | COST-04 itself (costs.ts) reads cost_ledger — same-source rule satisfied at the correct surface; forking to SpendLogs would have BROKEN parity |
| 5 | Test assertions are baseline-deltas + per-run department names | View reads global state (demo seed present); absolute asserts caused a 26min outage from a prior aborted run's leftovers — isolation lesson applied |
| 6 | No vitest config edit needed | tests/phase9 picked up by existing include glob (suite ran without changes) |

## Self-check

- SELECT returns 3 ordered blocks: psql output above ✓
- Tests green + sensitivity demonstrated: 5/5 + corrupt-FAIL-revert above ✓
- litellm literal grep: zero literals; parity verified at cost_ledger ✓
- key_link to 09-03: briefing.ts reads ONLY this view — enforced next plan ✓
