---
phase: 2
slug: foundation-integration-program
status: active
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

Phase 2 ships no runtime services — it is a greenfield pnpm/TypeScript scaffold plus a documentation-integrity program (the integration tracker + study cards). Every behavior is therefore machine-checkable on disk: `tsc --build` proves the scaffold compiles, `vitest` runs the smoke test, and two standalone Node scripts prove tracker/study-card integrity. The one manual gate (02-02) is a supply-chain legitimacy checkpoint that is human-only by policy.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest `^3.0.0` (pinned via the pnpm `catalog:` block in `pnpm-workspace.yaml`) |
| **Config file** | `vitest.config.ts` (root) — created by 02-01 Task 1 (present after Wave 1) |
| **Quick run command** | `pnpm test` (`vitest run`) + `node scripts/check-integration-tracker.mjs` |
| **Full suite command** | `pnpm build && pnpm test` (`tsc --build` across all 9 projects, then `vitest run`) + `node scripts/check-integration-tracker.mjs` |
| **Estimated runtime** | Quick ~2s (single smoke test; tracker script <1s, pure `node:fs`). Full ~15s (cold `tsc --build` over 9 empty composite projects ≈ 8–15s + vitest ≈ 2s + tracker <1s) |

Notes:
- Empty-scaffold reality: vitest startup dominates the ~2s quick run (there is one trivial smoke test); the tracker/stub scripts do no I/O beyond reading `.planning/research/`.
- `tsc --build` is incremental — after the first cold build, subsequent full runs drop to a few seconds via `*.tsbuildinfo`.

---

## Sampling Rate

- **After every task commit:** Run the task's own `<automated>` command (fast, always < 2s for the doc/scaffold tasks; the install/build tasks in Wave 3 are the exception and run once).
- **After every plan wave:** Run `pnpm build && pnpm test` + `node scripts/check-integration-tracker.mjs` (once the scaffold and validator exist — i.e. from the end of Wave 1 onward).
- **Before `/gsd-verify-work`:** Full suite must be green — `pnpm build`, `pnpm test`, and both `scripts/*.mjs` exit 0.
- **Max feedback latency:** ~2 seconds (quick path).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | INTEG-01 | T-2-03 / T-2-04 | Root manifest declares only catalog/workspace refs — no forbidden Phase-3+ dep | build/smoke | `node -e "…root-config OK"` (validates `pnpm-workspace.yaml` catalog + root `package.json` scripts/pin) | ✅ (creates `vitest.config.ts`) | ⬜ pending |
| 2-01-02 | 01 | 1 | INTEG-01 | T-2-03 | No forbidden Phase-3+ dep anywhere in `packages/**` or `apps/**`; root tsconfig references all 9 projects | build/smoke | `node -e "…scaffold OK: 9 projects, root references=9"` | ✅ (creates `tests/smoke.test.ts`) | ⬜ pending |
| 2-02-01 | 02 | 2 | INTEG-01 | T-2-01 / T-2-SC | `vitest` + `@types/node` (SUS) human-verified on npmjs.com before any install | manual (human gate) | none — `checkpoint:human-verify` (`gate="blocking-human"`, non-auto-approvable); records decision in `02-02-legitimacy-approval.md` | ✅ approval record | ⬜ pending |
| 2-03-01 | 03 | 3 | INTEG-01 | T-2-01 / T-2-SC | Install runs only after approved sign-off; no forbidden package resolved into the tree | build/smoke | `pnpm install --frozen-lockfile=false && test -f pnpm-lock.yaml && echo "install OK"` | ✅ (`pnpm-lock.yaml`) | ⬜ pending |
| 2-03-02 | 03 | 3 | INTEG-01 | T-2-03 | Scaffold builds clean in dependency order; smoke suite green | build/smoke | `pnpm build && pnpm test` | ✅ | ⬜ pending |
| 2-04-01 | 04 | 1 | INTEG-01 / INTEG-02 | T-2-02 / T-2-05 | Tracker holds bare-token statuses; 4 real EXCLUDED main-table rows; Re-admission Log gate present | lint (script) | `node -e "…tracker structural OK"` (column-aware: main table only, Status field $4, asserts ≥4 EXCLUDED rows) | ✅ (creates `INTEGRATION-TRACKER.md`) | ⬜ pending |
| 2-04-02 | 04 | 1 | INTEG-01 | T-2-05 | Full Phase-3 toolset studied on disk before any Phase-3 install (success criterion 3) | lint (script) | `node -e "…9 Phase-3 study cards OK"` (asserts 9 cards + mandatory fields) | ✅ (creates 9 study cards) | ⬜ pending |
| 2-05-01 | 05 | 2 | INTEG-01 | T-2-06 | Retroactive cards for already-installed tools (Pitfall 5); idempotent stub coverage | lint (script) | `node scripts/gen-study-card-stubs.mjs && node -e "…retroactive + stubs OK"` | ✅ (creates `gen-study-card-stubs.mjs` + retro cards) | ⬜ pending |
| 2-05-02 | 05 | 2 | INTEG-01 / INTEG-02 | T-2-02 / T-2-06 | Re-admission rule machine-enforced; provably fails on un-logged EXCLUDED→ADOPT flip | lint (script) | `node --check scripts/check-integration-tracker.mjs && node scripts/check-integration-tracker.mjs` | ✅ (creates `check-integration-tracker.mjs`) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

Sampling continuity: the only non-automated task is the 02-02 human gate; its neighbors (02-01 Wave 1, 02-03 Wave 3) are automated, so there is never a run of 3 consecutive tasks lacking automated verify.

---

## Wave 0 Requirements

Phase 2's test infrastructure is produced by the phase's own plans — there is no un-planned Wave-0 gap that must be filled before execution. The Wave-0 artifacts and where they are created:

- [ ] `vitest.config.ts` — root smoke-test config (created by **02-01 Task 1**)
- [ ] `tests/smoke.test.ts` — one dependency-free smoke test so the runner has a target (created by **02-01 Task 2**)
- [ ] `scripts/gen-study-card-stubs.mjs` — idempotent stub generator, no npm deps (created by **02-05 Task 1**)
- [ ] `scripts/check-integration-tracker.mjs` — the INTEG-01/INTEG-02 validator, no npm deps (created by **02-05 Task 2**)
- [ ] Framework install (`vitest` + `@types/node` via the pnpm catalog) — gated by the **02-02** human legitimacy checkpoint, executed by **02-03** (`pnpm install`)

`wave_0_complete: true` reflects that these are all covered within the plan set (vitest config + both validator scripts are plan deliverables); no external harness bootstrap is required. `nyquist_compliant: true` reflects that every code/doc-producing task carries an `<automated>` verify — the sole exception, 02-02, is a `checkpoint:human-verify` and is exempt by policy.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `vitest` and `@types/node` are the genuine, established packages (not slopsquats) before install | INTEG-01 (supply-chain / T-2-01, T-2-SC) | npmjs.com publisher/download/repo inspection is a human-eye judgment; the SUS legitimacy gate is non-auto-approvable by policy | Open `npmjs.com/package/vitest` and `npmjs.com/package/@types/node`; confirm publisher (`vitest-dev` / DefinitelyTyped), weekly downloads (tens of millions / ~300M+), repo URL, and character-for-character spelling against the catalog block; record `approved`/`rejected` + evidence in `02-02-legitimacy-approval.md` |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (02-02 is the one human-gate exemption)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (only 02-02 is manual; neighbors are automated)
- [x] Wave 0 covers all MISSING references (vitest config + both `scripts/*.mjs` are produced within the phase)
- [x] No watch-mode flags (uses `vitest run`, not `vitest`/watch)
- [x] Feedback latency < 2s (quick path)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-06 (validation-contract sign-off — internal consistency of the plan set; not a test-execution result)
