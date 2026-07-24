# Execution ticket — C5 trigger leg + workforce-truth on Employees/Directors

**Date:** 2026-07-24 late night · **Author:** Fable (inline, K1)
**Spec pointers:** Complaint ledger `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` — C5 trigger leg (◐ line "decide_approvals does NOT move the linked task", measured 2026-07-19); C22-class stale-truth doctrine + C8 working-org-only default; migration `20260724005000` (overview workforce truth) is the semantic baseline for the page fix. CEO trigger: 2 screenshots this session (overview pulse "Awaiting approval 6" vs Approval Center 0; Employees 205/0/205 vs overview 199/198/1).

## Scope (no new design decisions)

1. **C5 trigger leg:** `decide_approvals` also moves the linked task out of `awaiting_approval` — approved → `done`, rejected → `returned` (the 2026-07-19 stale-gate convention). TDD: `tests/c5/decide-approvals-task-sync.test.ts` red → migration → green.
2. **Orphan repair:** the 6 measured stuck fixture tasks (2026-07-19 orch-qa probes, approvals decided-then-purged, audit rows on record) leave the CEO surface through the audited purge door.
3. **Workforce truth:** `/org/employees` + `/org/directors` count and badge `employment_status` (mirror of 20260724005000: archived excluded everywhere, working org only).

## Evidence contract

- vitest red run output, then green 3/3.
- DB: tasks `awaiting_approval` = 0 after repair; audit row for the purge.
- RULE #0 battery on /org/employees + /org/directors EN+TR × 1366/1920 (+ screenshot eyeballed): Workforce 199 / Active 198 / Dormant 1 / Active departments 21.
- i18n purity PASS.
