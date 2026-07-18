---
status: complete
completed_at: 2026-07-18T05:05:00.000Z
---

# SUMMARY — E12.5 Workforce Completeness Gate (machine-gate leg)

Roadmap row E12.5 → ◐ (all machine gates closed; single named leg remains).

- **Automated sweep (plan §11.4 debt paid):** `scripts/org/workforce-gate.mjs`
  + frozen 67-slug `scripts/org/promise-ledger.json` → **9/9 PASS** (promised-ADD
  absent 0/67 · unpromised 0 · stale paths 0 · headless 0/21 · orphan 0 ·
  chain 0/0/0 · debris 0 · files 220/220 · deputy map 6/6+21/21).
- **Hygiene migration `20260718030000`** (idempotent 2×, ledger 94): r23t
  fixture chain deleted (1 run+3+2+3 children); 21 stale `agency-agents/%`
  paths repointed per CEO-approved matrix §2 dispositions; persona_version
  restored on 175 rows to `v2.0-fable` (evidence join: 199/199 live personas
  author=fable-5 + gate passed — the ACTIVE row fed the stale tag into
  hook.preTask ctx).
- **Regression:** `tests/e125/workforce-gate.test.ts` 7/7, suite-interleave
  guarded (suiteStart clock — r23/e10 transient fixtures cannot flake it).
- **Coverage report:** 30/30 §3 capability rows have live persona-bound owners
  → `.planning/research/E12.5-CAPABILITY-COVERAGE.md` (shelf 1a56f36d,
  audit 32904).
- **Discoveries recorded:** legal-de pod retirement was governed (migration
  20260717060000) — 21 depts is truth; all 21 depts status='dormant'; draft
  55 = exactly the non-social ADD set (36 v0-add + 19 D7), social 12 born
  dormant.
- **Remaining leg (why ◐, not silent):** operational go-live through the HR
  machine (`draft→probation→active`, HR_OPERATING_SYSTEM_SPEC:41-48) —
  BLOCKED-CLASS on the CEO's open MUSTS-Talep decisions. No status shortcuts
  taken (dormant/draft semantics honored).
