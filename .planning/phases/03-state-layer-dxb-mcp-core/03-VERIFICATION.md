---
phase: 03-state-layer-dxb-mcp-core
status: passed
verified: 2026-07-07
verifier: "Claude Fable 5 — inline, personally (governance v4); every command freshly re-executed at verification time"
---

# Phase 3 Verification — Gate Evidence Table

All five master-plan PHASE-03 gate criteria, each with the decisive command and its freshly-executed output (2026-07-07, this verification pass — not copied from earlier task logs).

## Criterion 1 — Full schema applies clean to a fresh DB

- Command: `pnpm exec supabase db reset`
- Output: `C1 reset_rc=0` (all six migrations `20260707000001..6_*.sql`, fresh database)
- Supporting: 13 tables in `public`, 13/13 with `relrowsecurity` (03-02 evidence)
- **PASS**

## Criterion 2 — Full lifecycle through dxb-mcp queue tools + returned path

- Command: `node scripts/phase3-lifecycle-battery.mjs` (real MCP protocol, in-process server)
- Output: `iteration 10 OK (returned-path variant)` → `10/10 PASS` (exit 0)
- Supporting: `pnpm test` lifecycle suite — happy chain events ≥4, returned stores feedback + re-claim, illegal transition rejected naming allowed targets, feedbackless return rejected
- **PASS**

## Criterion 3 — Crash test: kill -9 the claim owner, zero state loss

- Command: `pnpm test` (includes `tests/phase3/crash.test.ts` — real child process, SIGKILL asserted)
- Output: within `Test Files 6 passed (6)`, `Tests 18 passed (18)`; test asserts: reap ≥1, same task re-claimed by `worker-after-crash`, `reaped` event carries `was_claimed_by` (non-null after the ⛔-recorded reaper evidence fix)
- **PASS**

## Criterion 4 — Legacy personas dormant in registry; new department creatable

- Command: seed + `SELECT count(*) FROM agents WHERE status='dormant' AND persona_version='v1.0-legacy'`
- Output: `classified personas: 153 across 11 departments` (classifier) = `153` (DB) — counts equal; "367" myth corrected, 159→153 reconciled (spatial-computing removed in CEO corpus cleanup, recorded)
- Supporting: registry test — `registry_create_department` (legal-de) dormant → `registry_activate` → active, both audited; `registry_get_agent` returns persona_path with body provably absent
- **PASS**

## Criterion 5 — One dxb-mcp server, 8 tool groups (4 full + 4 stub faces)

- Command: `pnpm test` (surface test in lifecycle suite)
- Output: tools/list ≥17 across prefixes queue_/registry_/audit_/cost_/memory_/dashboard_/crm_/approval_; stub call → `isError` + "not yet active in this phase"; zero DB touch from stubs
- **PASS**

## Requirements → evidence map

| Req | Evidence |
|---|---|
| QUEUE-01 | claim_next_task SKIP LOCKED (battery 10/10 claims), LOCKED transition map enforced |
| QUEUE-02 | crash test: SIGKILL → reap → same-task re-claim, `reaped` event evidenced |
| QUEUE-03 | returned path with mandatory feedback (tool-enforced, tested both ways) |
| REG-01 | agents/departments schema + metadata columns live, 153 rows |
| REG-02 | dormant v1.0-legacy import; persona body never crosses get_agent (tested) |
| REG-03 | legal-de created + activated via registry tools, audited |
| MCP-01 | one server, 8 groups registered, surface test green |

## Fable closure input

This file is evidence FOR the ⛔ FABLE-ONLY phase-closure verdict — it does not itself declare the phase complete. Tracker EMBED state: mcp-sdk/zod/kysely/pg EMBED (import-proven), supabase-cli ADOPT, supabase INSTALL, supabase-js INSTALL (declared, not yet imported — honest state); validator exit 0 (57 rows / 53 cards).
