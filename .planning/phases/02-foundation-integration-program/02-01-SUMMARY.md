---
phase: 02-foundation-integration-program
plan: 01
subsystem: infra
tags: [pnpm, typescript, monorepo, project-references, vitest, workspace-scaffold]

# Dependency graph
requires:
  - phase: 01-credential-security-gate
    provides: clean secret-scan baseline (gitleaks pre-commit hook) that this plan's commits ran against
provides:
  - pnpm workspace root (pnpm-workspace.yaml with catalog: block, root package.json, tsconfig.base.json, root solution tsconfig.json, vitest.config.ts)
  - Nine empty-but-buildable TypeScript projects mirroring the approved architecture: packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}, apps/{dashboard,jarvis}
  - db/migrations/ folder placeholder for Phase 3 schema
  - tests/smoke.test.ts as the first vitest entry point
affects: [02-02-integration-tracker, 02-03-install-and-build-gate, phase-3-state-layer, phase-4-safety-rails, phase-5-kernel-core-loop, phase-8-dashboard, phase-9-jarvis-voice]

# Tech tracking
tech-stack:
  added: [pnpm workspaces + catalog protocol, TypeScript project references (composite tsconfig), vitest (config only, not yet run)]
  patterns:
    - "catalog: protocol for shared devDependency versions across all package.json files"
    - "TS project references (composite: true + references[]) instead of tsconfig paths aliases, enforcing the workspace:* dependency graph at build time"
    - "every non-shared package/app imports and re-exports PACKAGE from @dxb/shared to prove the workspace link before any real logic exists"

key-files:
  created:
    - pnpm-workspace.yaml
    - package.json
    - tsconfig.base.json
    - tsconfig.json
    - vitest.config.ts
    - packages/shared/{package.json,tsconfig.json,src/index.ts}
    - packages/dxb-mcp/{package.json,tsconfig.json,src/index.ts}
    - packages/gateway/{package.json,tsconfig.json,src/index.ts}
    - packages/kernel/{package.json,tsconfig.json,src/index.ts}
    - packages/orchestrator/{package.json,tsconfig.json,src/index.ts}
    - packages/memory-router/{package.json,tsconfig.json,src/index.ts}
    - packages/outbox-executor/{package.json,tsconfig.json,src/index.ts}
    - apps/dashboard/{package.json,tsconfig.json,src/index.ts}
    - apps/jarvis/{package.json,tsconfig.json,src/index.ts}
    - db/migrations/.gitkeep
    - tests/smoke.test.ts
  modified:
    - .gitignore

key-decisions:
  - "tsconfig.base.json created as part of Task 1 (workspace root config) rather than deferred to Task 2, because Task 1's own acceptance criteria required the file to exist — content matches the shared strict compiler options specified for Task 2"
  - "Apps (dashboard, jarvis) also declare @dxb/shared as a workspace:* dependency (not just packages/*), since their src/index.ts imports from @dxb/shared and the plan's own key_links require the dependency declaration to match the import"

patterns-established:
  - "Pattern: composite TypeScript project references over path aliases — every packages/* and apps/* tsconfig extends ../../tsconfig.base.json and lists explicit references[] to its workspace:* dependencies"
  - "Pattern: catalog: protocol for any devDependency shared across 2+ package.json files (currently typescript; @types/node and vitest reserved for root only until packages need them directly)"

requirements-completed: [INTEG-01]

coverage:
  - id: D1
    description: "pnpm workspace root scaffolded: pnpm-workspace.yaml (catalog: block), root package.json (packageManager pin, build/test scripts, catalog devDeps), tsconfig.base.json, vitest.config.ts, .gitignore extended"
    requirement: "INTEG-01"
    verification:
      - kind: unit
        ref: "inline node -e verification script (Task 1 <verify><automated>): checks catalog: present, packages/* glob present, packageManager==='pnpm@11.10.0', scripts.build==='tsc --build'"
        status: pass
    human_judgment: false
  - id: D2
    description: "Nine empty-but-buildable TypeScript projects scaffolded (packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}, apps/{dashboard,jarvis}) each with package.json + composite tsconfig.json + src/index.ts; root tsconfig.json references all nine; db/migrations/.gitkeep and tests/smoke.test.ts created"
    requirement: "INTEG-01"
    verification:
      - kind: unit
        ref: "inline node -e verification script (Task 2 <verify><automated>): checks all 9 dirs have package.json/tsconfig.json/src/index.ts, each package.json is valid JSON, root tsconfig.json references.length===9"
        status: pass
      - kind: other
        ref: "acceptance-criteria grep gate: for-loop test -f checks per package/app, workspace:* dependency presence in 6 backend packages, and negative grep for forbidden Phase-3+ deps across packages/ and apps/"
        status: pass
    human_judgment: false
  - id: D3
    description: "No Phase-3+ runtime dependency (@anthropic-ai/claude-agent-sdk, pg-boss, @modelcontextprotocol/sdk, @supabase/supabase-js, next) declared anywhere in the new scaffold"
    requirement: "INTEG-01"
    verification:
      - kind: other
        ref: "! grep -REq '\"(@anthropic-ai/claude-agent-sdk|pg-boss|@modelcontextprotocol/sdk|@supabase/supabase-js|next)\"' packages apps package.json"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-07-06
status: complete
---

# Phase 02 Plan 01: Workspace Scaffold Summary

**pnpm workspace root (catalog: protocol) plus nine empty, composite-tsconfig TypeScript projects (7 packages + 2 apps) wired via workspace:* + project references — zero Phase-3+ runtime dependencies declared.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-07-06T19:25:36Z
- **Completed:** 2026-07-06T19:34:35Z
- **Tasks:** 2
- **Files modified:** 33 (32 created, 1 modified: .gitignore)

## Accomplishments
- Root pnpm workspace configured with the `catalog:` protocol pinning `typescript@6.0.3`, `@types/node@^22.0.0`, `vitest@^3.0.0` across every future package
- Root `package.json` pins `pnpm@11.10.0` via Corepack (`packageManager` field), declares `build`/`test` scripts, zero runtime dependencies
- Nine empty-but-buildable TypeScript projects scaffolded exactly matching the approved architecture: `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}` and `apps/{dashboard,jarvis}`
- Every non-shared project imports `PACKAGE` from `@dxb/shared` and re-exports it alongside its own `OWNER` constant, proving the `workspace:*` link before any business logic exists
- Root solution `tsconfig.json` references all nine composite projects, giving `tsc --build` a complete dependency graph
- `db/migrations/.gitkeep` and `tests/smoke.test.ts` created as placeholders for Phase 3 schema and the vitest runner respectively
- Verified zero Phase-3+ runtime dependency (`@anthropic-ai/claude-agent-sdk`, `pg-boss`, `@modelcontextprotocol/sdk`, `@supabase/supabase-js`, `next`) anywhere in the new scaffold

## Task Commits

Each task was committed atomically:

1. **Task 1: Workspace root configuration** - `45cb475` (feat)
2. **Task 2: Nine package/app scaffolds + root solution tsconfig + db folder** - `388a26d` (feat)

**Plan metadata:** _pending — final docs commit follows this SUMMARY_

## Files Created/Modified
- `pnpm-workspace.yaml` - workspace globs (packages/*, apps/*) + catalog: version block
- `package.json` - root manifest: private, packageManager pin, build/test scripts, catalog devDeps
- `tsconfig.base.json` - shared strict compiler options extended by every project
- `tsconfig.json` - root solution file referencing all 9 projects
- `vitest.config.ts` - root vitest config with tests/ include glob
- `.gitignore` - appended dist/, *.tsbuildinfo, .pnpm-store/ (Phase 1 vault lines preserved)
- `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}/{package.json,tsconfig.json,src/index.ts}` - 7 backend package scaffolds
- `apps/{dashboard,jarvis}/{package.json,tsconfig.json,src/index.ts}` - 2 app scaffolds
- `db/migrations/.gitkeep` - placeholder folder for Phase 3 Supabase migrations
- `tests/smoke.test.ts` - dependency-free vitest sanity test

## Decisions Made
- `tsconfig.base.json` was created in Task 1 rather than Task 2, because Task 1's own acceptance criteria list it as a required file (`test -f tsconfig.base.json`) even though the task's `<action>` prose didn't explicitly describe its contents — content follows Task 2's shared strict compiler options spec exactly, so no rework was needed when Task 2 referenced it.
- Apps (`dashboard`, `jarvis`) declare `@dxb/shared: workspace:*` as a dependency, matching the `packages/*` pattern, since their `src/index.ts` imports from `@dxb/shared` per the plan's own key_link requirement ("`'@dxb/shared': 'workspace:*'` in consumer package.json <-> packages/shared existence").

## Deviations from Plan

None - plan executed exactly as written. (The `tsconfig.base.json` timing note above is a scheduling clarification within Task 1, not a deviation from the plan's file list or content spec — the file's location, content, and consumers are all as PLAN.md specified.)

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required. `pnpm install` and `pnpm build` are intentionally deferred to Plan 02-03 (post legitimacy gate); no tool installation happened in this plan.

## Next Phase Readiness
- Plan 02-02 (Integration Tracker) can proceed independently (no dependency on this plan's files).
- Plan 02-03 (install + build gate) is unblocked: all nine `package.json`/`tsconfig.json` manifests are valid JSON, the `catalog:` block and `workspace:*` references are internally consistent, and the root `tsconfig.json` has a complete 9-project reference graph for `tsc --build` to consume once `pnpm install` runs.
- No blockers. `pnpm` itself is not yet installed on this machine (Corepack is available, confirmed `corepack --version` 0.34.6) — Plan 02-03 will run `corepack enable && corepack prepare pnpm@11.10.0 --activate` before its first `pnpm install`.

---
*Phase: 02-foundation-integration-program*
*Completed: 2026-07-06*
