---
ticket: 20260725-suite-afterall-hygiene
type: quick
status: complete
created: 2026-07-25
author: Fable 5 (inline, K1)
---

# Execution ticket — e8/e10 suite afterAll hygiene (post-run ticker residue)

**Execution ticket, not a plan. Zero new design decisions.**

## Spec pointers

- Ledger `00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` "Test-residue hygiene" audit row: "OPEN DEBT: other live-DB suites (e8 log-decision, e10 escalation class) still leave terminal probe rows on ticker after a full-suite run — post-run sweep required until their afterAll hygiene lands."
- TEST_STRATEGY discipline: live-DB tests state-independent + self-cleaning (R4.2 lesson); C22 close-out standard.
- Standing order 11: systematic-debugging (root cause before fix) + TDD where new code.

## Method

1. Phase 1 measure: snapshot ticker-feeding tables (decision_log machine rows, agent_runs, hook_violations, alerts, tasks, approvals, outbox) → run `tests/e8` + `tests/e10` suites → diff snapshot = the residue, per suite file.
2. Fix at source: extend each suite's afterAll to sweep exactly its own fixture chains (scoped — the e10 unscoped-sweep lesson).
3. Verify: re-run suites → diff = 0 rows; full targeted re-run green; no wider suite breakage (run full vitest).

## Evidence contract

- Before/after diff outputs (row counts + sample ids) for each suite.
- red→green: residue rows N>0 before fix, 0 after.
- Suite pass output lines.
