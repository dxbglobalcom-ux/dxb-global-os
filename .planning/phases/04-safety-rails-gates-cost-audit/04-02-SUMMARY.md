---
phase: 04-safety-rails-gates-cost-audit
plan: 02
status: complete
completed: 2026-07-07
executor: "Claude Fable 5 — inline, personally (governance v4; no subagents)"
requirements: [GATE-01]
---

# 04-02 Summary — GATE-01 tool layer: budget_state + approval group FULL + dxb CLI

## What happened

- **Task 1 — 0007 budget_state migration.** Master-plan §3 SQL verbatim (single-row boolean-PK table, defaults 100.00/2.00, seeded) + conscious RLS-enable addition (project-wide LOCKED rule, recorded in migration comment).
  ✓ VERIFIED: `supabase db reset` exit 0 over 7 migrations; `SELECT monthly_cap_eur, velocity_cap_eur_per_hour` → `100.00|2.00`; second `INSERT DEFAULT VALUES` → `duplicate key value violates unique constraint "budget_state_pkey"`; personas reseeded (`inserted: 153 agents, 11 departments`).
- **Task 2 — approval group stub → FULL.** Three agent-visible doors only: `approval_submit_draft` (draft birth, payload frozen as-given — no redaction by design, secrets never belong in approval payloads), `approval_finalize_draft` (draft→pending handover), `approval_list_pending` (risk_class filter). Audit rows on submit/finalize (actor_type `agent`).
  ✓ VERIFIED: `pnpm vitest run tests/phase4/approval-flow.test.ts` → 5 tests passed at Task-2 scope, incl. tools/list proof (approval_* set is exactly the 3 names; NO tool matches /approve|reject|decide/) and trigger proof (simulated agent UPDATE draft→approved → `yasak` exception).
- **Task 3 — tools/dxb-cli (`@dxb/cli`, bin `dxb`).** `dxb approve <id>` / `dxb reject <id> --note <text>` (+ `breaker reset` placeholder for 04-04). UPDATE pending→approved/rejected with `decided_by='ceo:cli'`, `decided_at`, `decision_note`; audit actor_type `ceo`; trigger exceptions wrapped into readable CLI errors. Workspace glob `tools/*` added; root solution tsconfig references the 10th project; `@dxb/cli` added to root devDependencies so the `dxb` bin resolves at repo root.
  ✓ VERIFIED: final chain `pnpm build` green; approval-flow suite → `Tests 8 passed (8)` (full chain submit→finalize→approve: `decided_by=ceo:cli`, outbox row `idempotency_key=test.write_file:<id>`, status `ready`; reject records note + NO outbox row; approve on draft and on rejected → `/not in 'pending'/`); whole workspace `pnpm test` → `Test Files 7 passed (7)`, `Tests 26 passed (26)` → `TASK3 VERIFY PASS`.
  ✓ VERIFIED (real bin path, not just module import): `pnpm exec dxb approve <uuid>` on a hand-inserted pending row → `approved <id> (outbox row born by trigger)`, DB read-back `approved|ceo:cli` + outbox key present.

## Deviations (recorded, no scope change)

1. **Phase-3 surface test updated:** `tests/phase3/lifecycle.test.ts` probed the approval stub (`approval_request`) for stub behavior; approval is FULL now, so the stub probe moved to `memory_route` (still a stub until Phase 6). Comment in test explains the move.
2. **`@dxb/cli` added to root devDependencies** (not in plan's file list): without it pnpm links no `dxb` bin at the repo root — the CEO-facing command must actually run from the repo root, and the real-bin smoke proved it does.
3. **Operational note:** `supabase db reset` wipes the `litellm` schema (shared DB) — after reset, `docker restart dxb_litellm` re-creates it via Prisma (verified: healthy + 66 tables). Recorded in the litellm study card pitfalls.

## Key outcomes for the rest of Phase 4

- GATE-01 tool-layer half is real: agents draft and hand over; decisions exist only in the human CLI; outbox rows are born exclusively by `trg_outbox_enqueue` (proven through the CLI path).
- 04-03 (outbox executor) consumes `outbox.status='ready'` rows that this plan can now produce end-to-end; `budget_state` is live for 04-04's breaker.
