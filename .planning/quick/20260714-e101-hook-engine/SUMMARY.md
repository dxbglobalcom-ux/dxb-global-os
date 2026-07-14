# E10.1 — Fable Hook engine: SUMMARY

**Status: ✓ closed 2026-07-14 (K1 Fable in person).** Roadmap row E10.1 ✓; adaptations A1-A8 registered in FABLE_5_HOOK_SPEC.

## ✓ VERIFIED (evidence: command → decisive output)

| Work | Evidence |
|------|----------|
| Migration `20260714030000_e10_hook_engine.sql` idempotent — hook_policies (§4 + A2 titles) + hook_violations (append-only) + 19-row seed + fn_hook_set_policy + violations→alerts trigger (A4) + fn_alerts_evaluate §7 stale-escalation block + 7 settings keys | applied 3×, re-apply `INSERT 0 0 … COMMIT`; `SELECT count(*), count(DISTINCT standard_no) FROM hook_policies` → **19 / 17** (§21/§24) |
| `packages/hook` library — loadPolicies (60s TTL, invalid_policy §17, conflict §27), preTask (§6 order + §27 CEO warn + fail-closed A6), runtime monitors (single kill authority = runner), postTask (PASS/REVISE/ESCALATE + §7 chain + approval item), violations→logDecision (`hook_reject`/`hook_escalation`, E8.2 boundary closed) | `pnpm --filter hook test` → **31/31**; `vitest -t "FAIL-CLOSED"` → 1 passed |
| ROADMAP ACCEPTANCE: policy violation → RED + decision_log row | test "std 1 RED…": REJECT `missing_acceptance` + hook_violations row + `decision_log decided_by='hook' decision='hook_reject'` count ≥1 |
| §20 integration: evidence-less done → REVISE; revision exhaust → ESCALATE (manager-hop decision row + pending approval + high alert) | tests green in the 31; chain `["manager","orchestrator","ceo"]` asserted |
| fn seam: CEO wall (system rejected), NOT_FOUND, idempotency replay + MISMATCH, block→warn = risk **high** audit, `hook_policy.changed` on dxb:settings | tests green; `realtime.messages` row asserted |
| /api/control/hook + /gov/violations (GovTabs 3rd tab; honest zero stream; policy board, mutations seam-only) | live UI click → `std.memory_write` warn v2, `audit_log actor=ceo action=hook.set_policy risk=high`; reverted → block v3 |
| Full regression | **47 files, 336 passed / 15 skipped / 0 failed**; residue probe `0|0|0` (violations, hook alerts, escalation approvals) |
| tsc + purity | root `tsc --build` EXIT=0; dashboard `tsc --noEmit` EXIT=0; `i18n-purity-check.sh` PASS **1264=1264** |
| FOUND+FIXED (spec-gap rule): phase7 watchdog suite left a fake CRITICAL "Budget hard-stop engaged" on the CEO rail after every full regression (E8.4b trigger post-dates the suite) | afterAll alert sweep added; watchdog rerun 13/13; residue alert deleted; active alerts back to 1 (genuine queue-age) |
| RULE #0 in-pass fixes: 1280 action column hidden off-scroll → stacked buttons + slug own line + min-w 640 | probe `scrollW 652 = clientW 652`; docW=innerW at 1280 and 1920; console 0 error |

## ⚠ UNVERIFIED (human eye required)

| Item | Why |
|------|-----|
| 4 baselines `e101-violations-{en,tr}-{1280,1920}.png` in references/design-bank (INDEX PENDING) | Visual acceptance = CEO eye test |

## Mutation hygiene

UI probe reverted (memory_write block v3); test rows swept by watermark (violations/decisions/approvals/alerts/idempotency); policy severities restored (only seed-warn std 5 runtime + std 10 remain warn). Audit rows persist (genuine CEO-context actions). Version counters carry real history.

## Boundaries recorded

Spawn binding + hook_version stamp + employee-card status + run.finished.hook_result → **E10.2**; pre-gate <100ms health metric → P7; HR sampled deep-quality review → HR runtime; Settings UI Live Impact Preview → SETTINGS/E12.
