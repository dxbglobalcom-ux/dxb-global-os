---
ticket: E12.5 Workforce Completeness Gate — machine-gate leg (CEO-independent)
spec: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md row E12.5 (:152) ·
  WORKFORCE-MUST-EXPANSION-PLAN §3/§4/§6/§11 · WORKFORCE-GAP-MATRIX §2/§3/§7 ·
  HR_OPERATING_SYSTEM_SPEC lifecycle (:41-48) · baseline
  .planning/research/E12.5-WORKFORCE-BASELINE.md (shelf 8a5e5e66)
status: in-progress
---

# Execution ticket — E12.5 machine gates (zero new design decisions)

Row contract legs executable WITHOUT the CEO's open MUSTS-Talep decisions:

1. **Registry hygiene migration** — delete r23t test-fixture debris
   (`r23t-30019999-wf-agent` + its 1 agent_runs row; measured: 0 tasks,
   0 personas) that leaked into the live ledger on 2026-07-16.
2. **Stale persona_path sweep → 0** (gate SQL clause): 21 archived rows still
   point at removed `agency-agents/%` tree. Repoint per matrix §2 dispositions:
   15 retire → `personas/_library/<slug>.md` (files verified on disk 15/15);
   6 merge → surviving persona file (targets measured from matrix rows 72/98/
   104/109/111/138-140; all 6 survivor files verified on disk).
3. **persona_version truth restoration**: 175 non-archived rows carry stale
   tags (`v1.0-legacy` ×127 incl. the ACTIVE finance employee, `v0-add` ×48)
   while ALL 199 bound personas measure author='fable-5' + quality_gate='passed'
   → correct tag `v2.0-fable` (D7-wave stamp precedent, 24 rows). Evidence-join
   UPDATE, idempotent. hook.preTask ctx carries this column live (FABLE_5_HOOK_SPEC:39).
4. **Automated promised-ADD sweep** (plan §11.4 follow-up): `scripts/org/`
   gate script encoding the frozen 67-slug promise ledger (53 matrix §3 +
   14 plan §4 new) + full gate SQL battery + unpromised-role check.
5. **Permanent regression**: `tests/e125/workforce-gate.test.ts` — same
   invariants as vitest suite.
6. **Capability coverage report** vs MUST-EXPANSION-PLAN §3 matrix (not
   persona count) + DEPUTY-FAILOVER-MAP SPOF verification → research report,
   shelf-registered.
7. Roadmap E12.5 → ◐ with evidence; STATE.md; activation waves recorded as
   the single remaining leg (HR machine draft→probation→active per
   HR_OPERATING_SYSTEM_SPEC:41 — BLOCKED-CLASS on CEO MUSTS-Talep decisions;
   NOT silently skipped).

Boundary honored: NO employment_status changes (HR spec: activation only
through the HR machine; dormant = pre-machine stock; draft = machine entry).
NO mass activation before CEO decisions.

Evidence contract: gate script full-PASS output · migration idempotent 2× ·
vitest suite green · stale-path count 0 · promised-ADD absent 0 · unpromised 0
· report on shelf · gitleaks clean.
