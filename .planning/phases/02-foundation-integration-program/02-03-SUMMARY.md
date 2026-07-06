---
phase: 02-foundation-integration-program
plan: 03
subtitle: "Corepack pnpm activation + install + build + vitest smoke"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v3)"
completed: 2026-07-07
duration: ~10min
commits:
  - pending: "chore(02-03): lockfile + esbuild build-script denial — scaffold installs and builds clean (INTEG-01)"
requirements: [INTEG-01]
---

# Plan 02-03 Summary

## What was built

1. **pnpm 11.10.0 activated via Corepack** — `corepack enable --install-directory ~/.local/bin` (system `/usr/bin` is root-owned; user-writable PATH dir used instead — no global npm install, Corepack discipline intact) + `corepack prepare pnpm@11.10.0 --activate`.
2. **`pnpm install` green** — 53 packages resolved from the catalog (`typescript 6.0.3`, `@types/node 22.20.0`, `vitest 3.2.6`), `pnpm-lock.yaml` written and committed.
3. **esbuild build-script DENIED, decision recorded** — pnpm 11 blocked esbuild@0.28.1's postinstall and demanded a decision (`allowBuilds` placeholder it wrote into pnpm-workspace.yaml). Set `esbuild: false`: the script never runs; the platform binary arrives via the `@esbuild/linux-x64` optional dependency (verified on disk). Most conservative supply-chain posture — no transitive package executes code at install time.
4. **Whole-workspace build + smoke proven** — `pnpm build` (tsc --build, project references) and `pnpm test` (vitest smoke) both exit 0.

## Verification evidence (executed)

- `pnpm --version` → `11.10.0` (Corepack-pinned)
- `pnpm install` → `install_rc=0`, `Done in 1.7s using pnpm v11.10.0`
- `test -f pnpm-lock.yaml` → `lockfile OK`
- Forbidden-package grep (`claude-agent-sdk|pg-boss|modelcontextprotocol/sdk|supabase|next`) on lockfile → `no forbidden packages`
- `pnpm build` → `build_rc=0`
- `pnpm test` → `test_rc=0`, `Test Files 1 passed (1)`, `Tests 1 passed (1)`
- `test -f packages/shared/dist/index.js && test -f apps/dashboard/dist/index.js` → `dist OK`; 9/9 workspace projects emitted `dist/index.js`
- `pnpm -r exec node -e "process.exit(0)"` → `resolvable_rc=0`
- 02-02 gate confirmed `approved` before any install ran

## Deviations from plan

1. **Corepack EACCES:** `corepack enable` failed on root-owned `/usr/bin`; used `--install-directory ~/.local/bin` (already on PATH). Same pinned pnpm, no privilege escalation.
2. **pnpm 11 build-script gate (not in plan):** plan predates pnpm 11's mandatory allow/deny decision for install scripts. First `pnpm build` failed (`ERR_PNPM_IGNORED_BUILDS` — pnpm's pre-run deps check refuses to proceed while the decision is pending). Resolved by `allowBuilds: esbuild: false` in pnpm-workspace.yaml (deny + record). A package.json `pnpm.ignoredBuiltDependencies` attempt was reverted — pnpm 11 reads the workspace yaml, single source kept.
3. **OOM fallback unused:** install completed without `NODE_OPTIONS` retry.

## Fable verdict

**APPROVED — executed and verified personally.** All four must-have truths hold: catalog resolves to a committed lockfile, all nine projects compile in dependency order, vitest smoke is green, and no Phase-3+ runtime package is in the tree. Phase 2 success criterion 1 ("installs and builds clean") is machine-proven.

## Next

All five Phase 2 plans complete. Next: Phase 2 closure — Fable reads all five SUMMARYs (⛔ FABLE-ONLY gate per master-plan PHASE-02 §6), tracker-integrity validator re-run, STATE/ROADMAP sync, phase-complete verdict.
