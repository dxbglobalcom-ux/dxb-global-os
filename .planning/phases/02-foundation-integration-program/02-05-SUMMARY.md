---
phase: 02-foundation-integration-program
plan: 05
subtitle: "Retroactive + stub study cards, tracker-integrity validator"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v3)"
completed: 2026-07-06
duration: ~7min
commits:
  - 1d11b0a: "feat(02-05): retroactive + stub study cards (full coverage) + tracker-integrity validator (INTEG-01/02)"
requirements: [INTEG-01, INTEG-02]
---

# Plan 02-05 Summary

## What was built

1. **11 retroactive FULL study cards** (Pitfall 5 — no carve-out for already-installed tools): superpowers, gsd, gstack, ruflo, claude-mem, caveman, headroom, codex-plugin-cc, graphify, moneyprinterturbo, voicebox — same template as 02-04, STUDY checked as backfilled, retroactive/backfill discipline recorded in each.
2. **`scripts/gen-study-card-stubs.mjs`** — standalone ESM, no deps; parses the tracker main table, writes template stubs for missing non-EXCLUDED cards, never overwrites. Run result: 31 stubs created; second run: 0 created (idempotent).
3. **`scripts/check-integration-tracker.mjs`** — 5-rule compliance check (row floor, status enum, card coverage, excluded completeness, re-admission rule). No package.json touched.

## Verification evidence (executed)

- `node --check` both scripts → exit 0
- Generator run → `31 created, 20 already existed`; re-run → `0 created, 51 already existed` (idempotent)
- All 11 retroactive cards on disk → `retroactive + stubs OK`
- Validator on real tracker → `tracker OK: 55 data rows (51 non-excluded, 4 excluded), 51 study cards`
- **Negative control (non-vacuous):** kickbacks.ai EXCLUDED→ADOPT sed flip → validator FAILED on 3 rules incl. Rule 5 INTEG-02 (`flip_rc=1`); restore → validator green again → `NEGATIVE CONTROL PASSED`
- gitleaks clean on commit 1d11b0a

## Deviations from plan

One consistency fix: 02-04 had written the GSD row's card path as `study-cards/gsd-core.md`; 02-05's mandated retro filename is `gsd.md` — tracker cell updated to `study-cards/gsd.md` before card authoring (single-cell edit, committed with this plan). Idempotency acceptance used the generator's own `0 created` second-run proof (new files were untracked, so `git diff --quiet` was vacuous — the created-count check is the stronger form).

## Fable verdict

**APPROVED — authored and verified personally.** All three must-have truths hold: 51/51 non-EXCLUDED rows have cards on disk, the validator machine-enforces INTEG-01+INTEG-02 and provably catches un-logged re-admission, and pre-program tools carry retroactive cards.

## Next

Wave 3: 02-03 — Corepack pnpm activation + install (gate open per 02-02) + `tsc --build` + vitest smoke.
