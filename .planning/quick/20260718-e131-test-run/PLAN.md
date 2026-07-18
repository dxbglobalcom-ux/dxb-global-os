---
ticket: E13.1 full test run (L1-L6) + §38 machine-checkable items — machine tier
spec: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md row E13.1 (:159) ·
  TEST_STRATEGY §3 layer map, §5-6 (:37-38 db-suite contract), §11-12 (:58
  L2 assert core), §24 command set · ACCEPTANCE_CRITERIA §4 (§38 matrix,
  M-tier items) + §5 (§35 negative scan)
status: in-progress
---

# Execution ticket — E13.1 machine tier (zero new design decisions)

Measured gaps in the §24 command set (2026-07-18 05:13): `scripts/test/
db-suite.sh` MISSING · `scripts/test/i18n-audit.mjs` MISSING · dashboard
Playwright E2E suite MISSING (tests/e2e/ per spec :37). L1 (vitest 62 files
455/0) and L6 (tsc/build/purity/gitleaks) already run green this night.

Waves:
- **A:** `i18n-audit.mjs` (exact output contract "EN keys == TR keys,
  missing: 0") + `db-suite.sh` (fresh container → bootstrap push → 7-assert
  core → idempotent re-push → rollback-block check; output "PUSH OK /
  IDEMPOTENT OK / ASSERTS 7/7 / ROLLBACK BLOCKS n/n").
- **B:** tests/e2e Playwright suite (L5 scenario line: login → overview →
  drill-down → settings set/undo → approval decide → workflow smoke) + §38
  M-item automations (route count, layout persist, ultrawide render,
  dummy-data scan 0, token-outside color scan).
- **C:** run everything; row evidence ledger. Row CANNOT close ✓ tonight:
  F-09/F-15 hardening demands PRODUCTION capability proofs + Outleteuro
  real-pilot attestation — blocked-class on workforce activation (E12.5
  remaining leg). Honest target: ◐ with machine tier green.

Credentials rule: E2E login reads DXB_E2E_EMAIL/PASSWORD from env file
OUTSIDE the repo (~/.dxb/e2e.env, chmod 600) — no plaintext in repo, ever.
