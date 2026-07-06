# Phase 2: Foundation & Integration Program - Research

**Researched:** 2026-07-06
**Domain:** pnpm/TypeScript monorepo scaffolding + a doc-driven tool-adoption tracking program
**Confidence:** MEDIUM-HIGH (stack versions registry-verified live; monorepo/tracking patterns cross-checked against official docs; local-machine constraints directly probed)

## Summary

Phase 2 has two independent deliverables that must both land: (1) a **pnpm workspace skeleton** matching the approved package layout, which builds clean with zero business logic yet; and (2) a **tracking document** (not code) that gives every one of the ~50 tools named in the CEO's architecture notes §8B a auditable row through STUDY → INSTALL → ADOPT → EMBED, so nothing is ever installed blind.

For the monorepo: all core versions locked in `.claude/CLAUDE.md` were re-verified live against the npm registry today and are unchanged (`@anthropic-ai/claude-agent-sdk@0.3.201`, `@modelcontextprotocol/sdk@1.29.0`, `pg-boss@12.25.1`, `next@16.2.10`, `@supabase/supabase-js@2.110.0`) — no drift to reconcile. Phase 2 itself only needs `typescript`, `@types/node`, and a lightweight smoke-test runner; the heavier runtime packages (Agent SDK, pg-boss, MCP SDK, Supabase client) are **Phase 3+ installs** per the doc's own dual-role/no-blind-install rule and must NOT be added to package.json yet — only their study cards get created in Phase 2 (success criterion 3). `pnpm` itself is not currently installed on this machine but Node 22's bundled Corepack is; `corepack enable && corepack prepare pnpm@latest --activate` is the standard, doc-consistent way to get it without a separate global install.

A hard environmental finding changes the local-dev plan: this ThinkPad X230 is currently at **259MB free RAM and a nearly-full 2GB swap** (measured live), confirming the CLAUDE.md constraint that this laptop is a control terminal only. Running the full `supabase start` Docker stack locally (official minimum: 4GB allocated to Docker, 8GB+ system RAM recommended) is not viable on this machine under current load. The Phase 3 recommendation must be schema-only local development (migrations as SQL files, applied via `supabase db push`/CLI against the VPS-hosted Postgres, or a throwaway single-container `postgres:15` for quick local syntax checks) rather than keeping the full local stack running.

**Primary recommendation:** Scaffold the pnpm workspace with a `catalog:`-based `pnpm-workspace.yaml`, one shared `tsconfig.base.json` plus TypeScript project references per package, `typescript` + `@types/node` + `vitest` as the only Phase-2 npm dependencies, install `pnpm` via Corepack, and build the integration tracker as a single markdown table (`.planning/research/INTEGRATION-TRACKER.md`) with one row per §8B item, machine-greppable status tokens, and mandatory study-card stubs — including retroactive stubs for the tools already installed before this program existed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-------------------|
| INTEG-01 | Every master-plan §8B item tracked through study → install → adopt → embed with a study card in `.planning/research/`; tools installed at the START of the phase that uses them | "Integration Tracking Program" section: file location, column schema, status enum, full seed data for all ~50 §8B items with target-phase mapping, and the machine-checkable validation script spec (Wave 0 gap) |
| INTEG-02 | Excluded items (kickbacks.ai, automaton, llm-council dependency, ToS-gray systems) remain excluded; exceptions require CEO sign-off | "Excluded items (INTEG-02)" subsection: reasons per item, re-admission-log rule, and the machine-checkable compliance check |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

The following directives from `./.claude/CLAUDE.md` are binding on this phase's plan:

- **Locked tech stack, do not re-litigate:** pnpm monorepo, `@anthropic-ai/claude-agent-sdk` 0.3.201, Supabase self-hosted, pg-boss 12.x, Next.js 16.2.x, `@modelcontextprotocol/sdk` 1.29.0, LiteLLM 1.91.0 — this research re-verified versions, found no drift, and did not explore alternatives to these.
- **Dual-role / no-blind-install rule:** "tools installed at the START of the phase that uses them" — Phase 2 must NOT install Phase 3+ runtime packages (Agent SDK, pg-boss, MCP SDK, Supabase client, Next.js); only scaffold + study cards for those.
- **Hardware constraint:** "ThinkPad X230 8GB = control terminal only; 24/7 work happens on EU VPS" — directly confirmed this session (259MB free RAM, swap nearly full) and drives the schema-only local-Supabase-dev recommendation for Phase 3.
- **What NOT to use:** LangChain/LangGraph/CrewAI/AutoGen, Redis/BullMQ/Celery, dedicated vector DB, Kubernetes/k3s/Nomad, Coolify, external CRM, Turbo/Nx are not explicitly forbidden but are also not in the locked stack — kept as "Alternatives Considered," not adopted.
- **Security/secrets:** no plaintext credentials in repo or prompts — irrelevant to this scaffold-only phase (no secrets touched), but the Package Legitimacy Audit gate carries the same "no blind trust" discipline into dependency selection.
- **Sequencing:** "holding built completely first" — Phase 2 is pure scaffold/tracking, no Outleteuro-specific code.
- **GSD workflow enforcement:** all file-changing work in this phase must go through a GSD command (`/gsd-execute-phase` etc.), not direct ad-hoc edits.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Monorepo workspace config (`pnpm-workspace.yaml`, root `tsconfig.base.json`) | Build/Tooling (cross-cutting, no runtime tier) | — | Pure dev-time config; not part of any request path |
| `packages/shared` | Build/Tooling (types/utils) | API/Backend (consumed at runtime by all backend packages) | Shared Zod schemas + types compiled once, imported everywhere via `workspace:*` |
| `packages/dxb-mcp` | API/Backend | Database/Storage (reads/writes Supabase schema) | MCP server exposing the 8 tool groups — this phase creates the empty package only |
| `packages/gateway` | API/Backend | — | MCP gateway (department tool-visibility scoping) — Phase 7 logic, Phase 2 scaffold only |
| `packages/kernel` | API/Backend | — | Agent SDK orchestration runtime — Phase 5 logic, Phase 2 scaffold only |
| `packages/orchestrator` | API/Backend | Database/Storage (pg-boss queue tables) | Task decomposition + dispatch — Phase 5 logic |
| `packages/memory-router` | API/Backend | Database/Storage (pgvector) | Single memory write path — Phase 6 logic |
| `packages/outbox-executor` | API/Backend | — | Sole holder of outward credentials — Phase 4 logic |
| `apps/dashboard` | Frontend Server (SSR, Next.js) | Browser/Client | CEO cockpit — Phase 8 logic |
| `apps/jarvis` | API/Backend (thin kernel client) | Browser/Client (voice capture) | Voice layer — Phase 9 logic |
| `db/` | Database/Storage | — | Supabase migrations — schema lands in Phase 3, folder scaffolded now |
| `.planning/research/` integration tracker | Process/Docs (no runtime tier) | — | Governance artifact, not shipped code |

**Why this matters for Phase 2 specifically:** every `packages/*` and `apps/*` folder created this phase is an **empty, buildable TypeScript package** (index.ts stub + package.json + tsconfig.json extending the base) with no business logic and no Phase-3+ runtime dependency installed. The plan-checker should verify no package.json in this phase declares `@anthropic-ai/claude-agent-sdk`, `pg-boss`, `@modelcontextprotocol/sdk`, or `@supabase/supabase-js` — those belong to the phases that use them.

## Standard Stack

### Core (Phase 2 installs — scaffold only)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | latest via Corepack | Workspace package manager | Locked decision (CLAUDE.md); Corepack is Node 22's bundled activation path, avoids a separate global install `[VERIFIED: npm registry — pnpm 11.10.0 current, verified 2026-07-06]` |
| typescript | 6.0.3 | Compilation across all packages | Verified current on npm registry 2026-07-06 `[VERIFIED: npm registry]` — locked stack requires TS everywhere code is written |
| @types/node | latest (22.x line) | Node 22 type definitions | Standard companion to `typescript` for a Node backend monorepo `[ASSUMED — not independently version-pinned this session]` |
| vitest | current | Smoke/build tests (Nyquist validation) | Fast, zero-config, ESM-native test runner; no existing test infra in this greenfield repo `[ASSUMED — reasonable default, not a locked decision]` |

### Supporting (Phase 3+ — do NOT install yet, study cards only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @anthropic-ai/claude-agent-sdk | 0.3.201 (current, re-verified) | Kernel/orchestrator runtime | Phase 5 (Kernel & Orchestrator Core Loop); study card required before Phase 3 per success criterion 3 since it's foundational to all backend packages |
| @modelcontextprotocol/sdk | 1.29.0 (current, re-verified) | dxb-mcp server framework | Phase 3 (State Layer & dxb-mcp Core) |
| pg-boss | 12.25.1 (current, re-verified) | Task queue on Supabase Postgres | Phase 3 |
| @supabase/supabase-js | 2.110.0 (current, re-verified) | Supabase client | Phase 3 |
| supabase (CLI) | 2.109.0 (current, re-verified) | Local dev / migrations | Phase 3 — schema-only workflow (see Common Pitfalls) |
| next | 16.2.10 (current, re-verified) | Dashboard | Phase 8 |
| zod | 4.4.3 (current, re-verified) | Schema validation | Phase 3+ everywhere a payload crosses a boundary; MCP SDK 1.29 supports zod v4 as a peer dependency `[CITED: github.com/modelcontextprotocol/typescript-sdk issue #925/#1429 — resolved as of current 1.29.0]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain `tsc --build` + TS project references | Turborepo / Nx | Turbo/Nx add remote caching and task graphs, valuable once the monorepo has many packages with real interdependent builds; at Phase 2's scale (empty scaffold packages) they're unneeded overhead and NOT in the locked stack — revisit only if build times become a real pain point in Phase 5+ |
| `catalog:` field in `pnpm-workspace.yaml` | Per-package pinned versions | Catalogs centralize version bumps and avoid merge conflicts across many `package.json` files `[CITED: pnpm.io/catalogs]` — recommended given 7 backend packages + 2 apps will all share `typescript`, `zod`, `@types/node` |
| tsconfig `paths` mapping | TS project references (`composite: true`, `references`) | Project references give incremental, dependency-ordered builds (`tsc --build`) and enforce that a package can only import what it depends on in `package.json` — better fit for a growing multi-package backend than loose path aliases |
| vitest | jest | vitest is faster (esbuild-based, ESM-native) and needs no extra config for a TS-only monorepo; jest has a larger legacy ecosystem the project doesn't need here |

**Installation:**
```bash
# One-time: activate pnpm via Corepack (Node 22 ships Corepack)
corepack enable
corepack prepare pnpm@latest --activate
pnpm --version   # confirm

# Root scaffold
pnpm init
# create pnpm-workspace.yaml, tsconfig.base.json, then per-package
pnpm add -D -w typescript @types/node vitest
```

**Version verification:** all versions above were checked live via `npm view <pkg> version` on 2026-07-06 and match the CLAUDE.md-locked figures exactly — no drift since the 2026-07-05 registry verification. `npm view pnpm version` → 11.10.0; `npm view supabase version` (CLI) → 2.109.0; `npm view typescript version` → 6.0.3.

## Package Legitimacy Audit

| Package | Registry | Age signal | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----------|-----------|-------------|---------|-------------|
| typescript | npm | established (Microsoft) | 211.5M/wk | github.com/microsoft/TypeScript | OK | Approved |
| zod | npm | established | 211.6M/wk | github.com/colinhacks/zod | OK | Approved |
| vitest | npm | flagged "too-new" by registry-age heuristic | 68.0M/wk | github.com/vitest-dev/vitest | SUS | Flagged — see note below |
| tsx | npm | flagged "too-new" | 68.7M/wk | github.com/privatenumber/tsx | SUS | Flagged — see note below, and not actually required for Phase 2 (discretionary dev convenience only) |
| turbo | npm | flagged "too-new" | 16.3M/wk | github.com/vercel/turborepo | SUS | Flagged — but NOT selected for Phase 2 (see Alternatives Considered); no install action needed unless CEO/planner opts in later |
| @types/node | npm | flagged "too-new" | 357.6M/wk | github.com/DefinitelyTyped/DefinitelyTyped | SUS | Flagged — see note below |

**Note on the "too-new" flags:** the legitimacy checker measures the publish date of the package's *latest version*, not the package's first-ever publish date. `vitest`, `tsx`, `turbo`, and `@types/node` all shipped a routine patch/minor release within the last few days (normal cadence for actively maintained, extremely high-traffic packages — 68M–357M weekly downloads each, decade-plus-old established GitHub orgs). This reads as a heuristic false positive rather than a genuine slopsquatting signal. Per the binding gate protocol, these are kept but flagged: **the planner must add a `checkpoint:human-verify` task before the `pnpm add` step for `vitest` and `@types/node`** (the two actually selected for Phase 2 installation). `tsx` and `turbo` require no action since they are not part of the Phase 2 install list.

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `vitest`, `@types/node` (both selected for install — gate behind `checkpoint:human-verify`); `tsx`, `turbo` (not selected, no action).

## Architecture Patterns

### System Architecture Diagram (Phase 2 scope — scaffold only, no data flow yet)

```
                    ┌─────────────────────────────┐
                    │   pnpm-workspace.yaml        │
                    │   (workspace root, catalog:)  │
                    └──────────────┬────────────────┘
                                   │ resolves workspace:* deps
                 ┌─────────────────┼─────────────────────────┐
                 ▼                 ▼                         ▼
        ┌────────────────┐ ┌───────────────┐        ┌────────────────┐
        │ packages/shared │ │ packages/*     │        │ apps/*         │
        │ (types, zod     │◄┤ (dxb-mcp,     │◄───────┤ (dashboard,    │
        │  schemas)       │ │  gateway,      │        │  jarvis)       │
        └────────┬────────┘ │  kernel,       │        └────────┬───────┘
                 │           │  orchestrator, │                 │
                 │           │  memory-router,│                 │
                 │           │  outbox-exec)  │                 │
                 │           └───────┬────────┘                 │
                 │                   │ imports shared types      │
                 └───────────────────┴──────────────────────────┘
                                   │
                                   ▼
                         tsc --build (project references)
                                   │
                                   ▼
                    CI/local: zero business logic, but
                    every package compiles + a smoke test runs

   ── separately, non-runtime ──────────────────────────────────
   .planning/research/INTEGRATION-TRACKER.md
        ▲                                  ▲
        │ 1 row per §8B item               │ study card stub
        │ STUDY → INSTALL → ADOPT → EMBED   │ per "to install"/"study" item
   CEO architecture notes §8B ──────────────┘
```

### Recommended Project Structure
```
/
├── pnpm-workspace.yaml         # workspace globs + catalog: versions
├── tsconfig.base.json          # shared compiler options, extended by every package
├── package.json                # root: private, scripts (build/test), devDeps (typescript, vitest)
├── db/                         # Supabase migrations (empty this phase, schema lands Phase 3)
│   └── migrations/.gitkeep
├── packages/
│   ├── shared/                 # types + zod schemas, no runtime deps yet
│   ├── dxb-mcp/                # MCP server scaffold (empty, no @modelcontextprotocol/sdk dep yet)
│   ├── gateway/
│   ├── kernel/
│   ├── orchestrator/
│   ├── memory-router/
│   └── outbox-executor/
└── apps/
    ├── dashboard/               # Next.js app scaffold, no Next.js dep installed yet (Phase 8)
    └── jarvis/
```

### Pattern 1: TypeScript Project References for incremental, dependency-honest builds
**What:** Each `packages/*/tsconfig.json` sets `"composite": true` and lists `"references"` to the workspace packages it depends on; the root `tsconfig.json` lists all packages as references. `tsc --build` at the root compiles in dependency order and only rebuilds what changed.
**When to use:** Any TS monorepo with more than 2-3 interdependent packages — exactly this shape (shared → 6 backend packages → 2 apps).
**Example:**
```jsonc
// packages/shared/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}

// packages/kernel/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "composite": true, "outDir": "dist", "rootDir": "src" },
  "references": [{ "path": "../shared" }],
  "include": ["src"]
}
```

### Pattern 2: pnpm catalog for shared dependency versions
**What:** Root `pnpm-workspace.yaml` declares a `catalog:` block; every package's `package.json` references `"typescript": "catalog:"` instead of a literal version.
**When to use:** As soon as more than one package shares a devDependency — true from the very first two packages in this scaffold.
**Example:**
```yaml
# Source: pnpm.io/catalogs (official docs)
packages:
  - "packages/*"
  - "apps/*"
catalog:
  typescript: 6.0.3
  "@types/node": ^22.0.0
  vitest: ^3.0.0
```
```jsonc
// packages/shared/package.json
{
  "devDependencies": { "typescript": "catalog:", "vitest": "catalog:" }
}
```

### Anti-Patterns to Avoid
- **Installing Phase 3+ runtime deps now** (Agent SDK, pg-boss, MCP SDK, Supabase client) — violates the doc's own "install at the START of the phase that uses it" rule and creates unstudied blind installs, exactly what INTEG-01 exists to prevent.
- **A single flat `tsconfig.json` with `paths` aliases and no project references** — works at 2 packages, becomes an unenforced import-anything free-for-all once `kernel`, `orchestrator`, and `gateway` all exist; project references make the dependency graph a build-time constraint, not a convention.
- **Turning `.planning/research/` into two competing conventions** — the directory already holds 5 project-level research docs (ARCHITECTURE/FEATURES/PITFALLS/STACK/SUMMARY.md) from pre-Phase-1 research. Per-tool study cards must live in a clearly separated subpath (`.planning/research/study-cards/<tool-slug>.md`) so the tracker and the existing docs don't collide.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-package version consistency | A script that greps/rewrites version strings across package.json files | pnpm `catalog:` | Native, zero-maintenance, git-conflict-free |
| Incremental multi-package builds | Custom build-order script / shell loop over packages | `tsc --build` with TS project references | Handles dependency ordering, incremental rebuilds, and `--force`/clean natively |
| pnpm activation | Instructions to `npm install -g pnpm` | Corepack (`corepack enable && corepack prepare pnpm@latest --activate`) | Corepack ships with Node 22, version-pins pnpm per-project via `packageManager` field in root package.json, avoids global-install drift across machines (laptop vs VPS) |

**Key insight:** everything in Phase 2 is deliberately boring infrastructure — the value is in NOT installing anything the phase doesn't strictly need, and in making that restraint auditable (via the tracker) rather than implicit.

## Common Pitfalls

### Pitfall 1: Running the full local Supabase stack on this laptop
**What goes wrong:** `supabase start` pulls and runs ~10 Docker containers; official guidance is 4GB minimum allocated to Docker, 8GB+ system RAM recommended `[CITED: supabase.com/docs + github.com/orgs/supabase/discussions/29306]`.
**Why it happens:** This machine (ThinkPad X230) measured **7.4GB total RAM, 259MB free, swap 2.0/2.0GB used** at research time — there is no headroom for a multi-container Postgres+Auth+Realtime+Storage+Studio stack alongside an IDE and agent sessions.
**How to avoid:** Phase 3 planning must default to schema-only local development: migration `.sql` files authored and reviewed locally, applied with `supabase db push`/CLI against the actual target (VPS-hosted self-hosted Supabase, or a CI ephemeral Postgres), with at most a single throwaway `docker run postgres:15` container for quick syntax verification — never the full local stack running continuously on the laptop.
**Warning signs:** `docker info` reporting <2GB available before starting the stack; `free -h` showing swap already near-full (as measured today).

### Pitfall 2: pg-boss behind a transaction-mode pooled connection
**What goes wrong:** pg-boss relies on `SELECT ... FOR UPDATE SKIP LOCKED` plus session-level Postgres behavior; transaction-mode pooling (Supavisor's Dedicated Pooler default, or PgBouncer transaction mode) breaks session-scoped features `[CITED: supabase.com/docs/guides/troubleshooting/supavisor-and-connection-terminology-explained + pgbouncer.org/faq.html]`.
**Why it happens:** Self-hosted Supabase exposes both a pooled and a direct (session-mode, port 5432) connection string; it's easy to default to the pooled one out of habit from cloud-Supabase docs that push pooling for serverless functions.
**How to avoid:** pg-boss's connection config in Phase 3 must explicitly use the direct/session-mode connection string, not the pooler URL. Since Supabase is self-hosted on the same VPS box (not a serverless caller), the direct connection is free to use.
**Warning signs:** pg-boss intermittent `LISTEN/NOTIFY` failures, or advisory-lock-related errors under load.

### Pitfall 3: Native module builds on a low-RAM machine
**What goes wrong:** `pnpm install` can trigger `node-gyp` native compilation for some transitive dependency, exhausting available heap on an 8GB/259MB-free machine `[CITED: github.com/pnpm/pnpm issues #6227, #8441, #2339]`.
**Why it happens:** node-gyp compiles native addons from source unless the package ships a prebuild.
**How to avoid:** Phase 2's own dependency list (`typescript`, `@types/node`, `vitest`) is pure-JS/TS with no native addons, so this risk is low now — but flag it for Phase 3+ when `@supabase/supabase-js` and transitive deps are added. If it recurs, prefer packages using `node-gyp-build`/prebuildify (prebuilt binaries) and set `NODE_OPTIONS=--max_old_space_size=4096` as a fallback rather than a default.
**Warning signs:** `pnpm install` hanging or crashing with "JavaScript heap out of memory".

### Pitfall 4: Agent SDK API drift breaking assumptions baked into later phases
**What goes wrong:** the Agent SDK is pre-1.0 and has already had breaking changes: the v2 session API (`unstable_v2_createSession` etc.) was removed; `TodoWrite` is deprecated in favor of `TaskCreate/TaskUpdate/TaskGet/TaskList`; MCP servers now connect in the background by default (session starts immediately, server status is `"pending"` until ready) `[CITED: github.com/anthropics/claude-agent-sdk-typescript/blob/main/CHANGELOG.md]`.
**Why it happens:** Anthropic is iterating the SDK fast pre-1.0; the current pinned version (0.3.201) is confirmed still-current as of today, but any Phase 5 code written against remembered older behavior (v2 session API, TodoWrite) will not compile/behave correctly.
**How to avoid:** the Phase 5 study card for the Agent SDK must explicitly note: use `query()` with `AsyncIterable<SDKUserMessage>` for multi-turn and `options.resume` for session continuation; use the Task* tool family, not TodoWrite; for kernel/queue-worker invocations that need an MCP server ready before the first turn, set `alwaysLoad: true` on that server or `MCP_CONNECTION_NONBLOCKING=0`, since the default non-blocking connect could otherwise race a worker's very first tool call.
**Warning signs:** any code sample or memory referencing `unstable_v2_*` functions or `TodoWrite` is stale — do not copy it into Phase 5 plans without checking the live changelog again at that phase's research step.

### Pitfall 5: Study cards skipped for tools installed before the tracking program existed
**What goes wrong:** superpowers, gsd-core, gstack, ruflo, claude-mem, caveman, the Codex plugin, karpathy-skills, MoneyPrinterTurbo, and voicebox are already installed and in active use, predating this Phase 2 tracking program. It's tempting to treat them as "done" and skip a row.
**Why it happens:** they're already working, so there's no visible failure forcing a retroactive study card.
**How to avoid:** success criterion 2 says "the checklist holds each row until EMBED is done" for every item — with no carve-out for already-installed tools. Phase 2 must create retroactive study-card stubs for all ten already-installed items too, even if their STUDY step is backfilled after the fact, so the tracker is complete and auditable from day one.
**Warning signs:** an INTEG-01 audit later finds gaps for tools that "everyone assumed" were already tracked.

## Code Examples

### Root workspace + catalog config
```yaml
# Source: pnpm.io/workspaces + pnpm.io/catalogs (official docs)
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "apps/*"
catalog:
  typescript: 6.0.3
  "@types/node": ^22.0.0
  vitest: ^3.0.0
```

```json
// Source: CLAUDE.md-consistent — pins pnpm itself per-project via Corepack
// package.json (root)
{
  "name": "dxb-global-os",
  "private": true,
  "packageManager": "pnpm@11.10.0",
  "scripts": {
    "build": "tsc --build",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "catalog:",
    "@types/node": "catalog:",
    "vitest": "catalog:"
  }
}
```

### Minimal package scaffold (repeat per packages/*, apps/*)
```json
// packages/dxb-mcp/package.json — scaffold only, NO @modelcontextprotocol/sdk dep yet
{
  "name": "@dxb/dxb-mcp",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@dxb/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "catalog:"
  }
}
```

### Integration tracker row format (machine-checkable)
```markdown
<!-- Source: designed this session per success criterion 2/3 — no external research needed -->
| Item | Status | Target Phase | Owner (dept/tier) | Study Card | Notes |
|------|--------|--------------|-------------------|------------|-------|
| supabase | STUDY | 3 | State Layer / API-Backend | study-cards/supabase.md | core kernel state; study card required before Phase 3 install |
```
Valid `Status` tokens (enforce as an enum, grep-friendly, one word each): `STUDY` \| `INSTALL` \| `ADOPT` \| `EMBED` \| `EXCLUDED`. A row only advances left-to-right; `EXCLUDED` is terminal unless a `## Re-admission Log` entry with an explicit CEO sign-off date supersedes it (INTEG-02).

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| npm/yarn workspaces with manual version pinning per package | pnpm workspaces + `catalog:` protocol | catalogs shipped as a stable pnpm feature ahead of this research date | Removes the most common monorepo maintenance chore (version drift across package.json files) |
| Global `npm install -g pnpm` | Corepack-managed pnpm, version-pinned via root `packageManager` field | Corepack has shipped with Node since 16.9, is standard practice by Node 22 | Same pnpm version guaranteed on laptop and VPS without a separate provisioning step |
| Claude Agent SDK `unstable_v2_*` session API | `query()` + `AsyncIterable<SDKUserMessage>` / `options.resume` | v2 API removed after being deprecated since SDK 0.2.133 | Any Phase 5 code must target the current API from the start — no migration debt to carry |

**Deprecated/outdated:**
- Agent SDK `TodoWrite` tool: deprecated since 0.2.13, replaced by `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` — relevant when Phase 5 wires kernel task tracking.

## Integration Tracking Program (INTEG-01 / INTEG-02)

### Design (no external research needed — first-principles design per phase success criteria)

**File:** `.planning/research/INTEGRATION-TRACKER.md` (new file, Phase 2 deliverable)
**Study card path convention:** `.planning/research/study-cards/<tool-slug>.md` (new subdirectory — kept separate from the existing pre-Phase-1 project research docs already in `.planning/research/`)

**Columns:** `Item | Category | Status | Target Phase | Owner (dept/tier) | Trigger Type | Study Card | Notes`
- `Status` enum (see Code Examples): `STUDY → INSTALL → ADOPT → EMBED`, or `EXCLUDED`.
- `Trigger Type` mirrors §8B's own vocabulary: `hook` (auto/background), `skill` (slash/auto-invoked), `mcp-profile` (department allowlist), `ref` (reference only, no install), `service` (standalone Docker service).
- A row is compliant with INTEG-01 only once it reaches `EMBED`; the tracker file itself, plus a study card per non-`EXCLUDED` row, is the Phase-2 deliverable — reaching `EMBED` for every row is a multi-phase, ongoing obligation the tracker makes auditable, not a Phase-2 exit condition.

**Phase-mapping caveat:** §8B was authored under the CEO's original P0–P7 shorthand; the 2026-07-05 renumbering (`P0→1, P1→2, P2→{3,4,5}, P3→6, P4→7, P5→{8,9}, P6→10, P7→11`) means any item tagged "P2" in the source maps to Phase 3, 4, **or** 5 — the tracker below assigns each such item to the single new-numbering phase it most concretely serves (e.g., `supabase`→3, `codex-plugin-cc`→5), flagged `[ASSUMED]` where the source doc doesn't disambiguate. The planner/discuss-phase should let the CEO confirm any row marked ambiguous before it blocks a later phase's start.

### Seed data — full §8B item set (populate `INTEGRATION-TRACKER.md` with these rows)

| Item | Category | Status | Target Phase | Owner (dept/tier) | Trigger | Notes |
|------|----------|--------|--------------|--------------------|---------|-------|
| superpowers | Claude Code ecosystem | STUDY (retroactive) | 2 (wiring) | All engineering-grade agents | skill | Already installed — needs retroactive study card (Pitfall 5) |
| GSD (gsd-core suite) | Claude Code ecosystem | STUDY (retroactive) | 2 (drives whole build) | Orchestrator / project discipline | skill | Already installed, driving this very build |
| gstack | Claude Code ecosystem | STUDY (retroactive) | 2+ | QA gates (review/spec/ship/qa) | skill | Already installed |
| ruflo | Claude Code ecosystem | STUDY | 5 `[ASSUMED — kernel-overlap eval fits orchestrator core loop]` | Swarm/hooks/memory — evaluate overlap with kernel | mcp/hook | Already installed; explicit "study — evaluate overlap" per source |
| claude-mem | Claude Code ecosystem | STUDY (retroactive) | 6 | Cross-session memory, all agents | hook (auto) | Already installed |
| caveman | Claude Code ecosystem | STUDY (retroactive) | active now | Token compression, inter-agent comms | mode | Already installed and active |
| headroom | Claude Code ecosystem | STUDY (retroactive) | 5 `[ASSUMED — proxy sits in front of worker LLM calls, i.e. orchestrator/kernel loop]` | Token-compression proxy before worker LLMs | hook/proxy | Verified active already |
| codex-plugin-cc | Claude Code ecosystem | STUDY (retroactive) | 5 `[ASSUMED — engineering worker tier]` | Engineering second brain (Codex 5.5) | subagent/skill | Already installed |
| claudex | Claude Code ecosystem | STUDY (retroactive) | 5 `[ASSUMED — model-routing reference for kernel]` | Model-switching pattern reference only | ref | Near-dormant, reference only |
| awesome-claude-code, system_prompts_leaks, llm-wiki | Claude Code ecosystem | STUDY | 2 (docs) | R&D + HR persona factory reference | ref | Reference material, no install action |
| humanizer | Claude Code ecosystem | STUDY | 10 | Marketing/Sales outbound agents | skill (auto in pipeline) | Mandatory before approval gate (DEPT-04) |
| knowledge-work-plugins (Anthropic) | Claude Code ecosystem | STUDY | 10 | Per-department (eng/mkt/legal/fin/product-design/productivity) | mcp-profile | Wave-based install at Phase 10 |
| vercel skills / agent-skills | Claude Code ecosystem | STUDY | 10 | Eng agents | skill | |
| Design bundle: impeccable + taste-skill + open-design + Google Stitch | Design | STUDY | 8 | Design dept + dashboard build | skill + mcp-profile | Must be installed & studied BEFORE any dashboard design work (success criterion 3's pattern repeats here) |
| Higgsfield MCP, Figma plugin | Design | STUDY | 10 | Design/Creative | mcp-profile | |
| Aceternity/Refero/Mobbin/Godly | Design | STUDY | 8 | Dashboard design sources | ref | Reference only |
| Obsidian stack (obsidian-mind, kepano/obsidian-skills, second-brain, claude-obsidian) | Memory/knowledge | STUDY | 6 | Memory system | hook + skill | Study pass picks the final combination |
| Graphify | Memory/knowledge | INSTALL (verified active) | 6 | Memory — knowledge graph | mcp/skill | Already active for this project's own planning graph |
| open-notebook (34.9k★) | Memory/knowledge | STUDY | 6 | Memory — research brain (replaces NotebookLM) | service on VPS | |
| supabase | Memory/knowledge (state) | STUDY | 3 | Kernel state + CRM + dashboard DB | mcp-profile (core) | **Phase-3-toolset — study card required before Phase 3 install (success criterion 3)** |
| Research stack (open_deep_research, gpt-researcher, gptr-mcp, browser-use) | Research | STUDY | 10 (wave 1) | Research dept foundation | skill + mcp-profile | |
| last30days, ScrapeGraphAI | Research | STUDY | 10 | Research dept | skill | |
| Agent-Reach (51k★, ToS risk) | Research | STUDY, conditional | 10 | Research/Social — behind approval gate only | mcp-profile, gated | ToS risk flagged in source |
| Apify (token exists) | Research | STUDY, conditional | 10 | Research/Data scraping | mcp-profile, env-secret | Rotate token first per Phase 1 discipline |
| MiroFish (+ mirofish-cli) | Research | STUDY | 11+ | Decision-simulation layer — sandbox only | skill, gated | Never final decisions (V2-05 in v2 requirements) |
| yt-dlp + video-use | Media/content | STUDY | 7 | Video-learning module | skill (auto on video link) | |
| OpenMontage, opencut | Media/content | STUDY | 10 | Creative/Social video production | skill | |
| MoneyPrinterTurbo | Media/content | STUDY (retroactive) | 10 | Social media dept | skill | Already installed |
| voicebox | Media/content | STUDY (retroactive) | 9+ | JARVIS voice layer | service | Already installed |
| Gemini Omni video API | Media/content | STUDY, conditional | 10 | Creative — budget-gated | tool, gated | $0.10/sec preview API — cost-monitor tagging required |
| Whisperflow (clone) | Media/content | STUDY | 9+ | JARVIS input | service | Build clone: voicebox + whisper on VPS, not the paid product |
| hermes-agent (209k★) | Coding agents | STUDY | 7 (VPS phase) | 24/7 VPS resident agent | service | Locked decision per CLAUDE.md |
| jcode, oh-my-pi | Coding agents | STUDY | 5 `[ASSUMED]` | Eng — study pass, adopt only if beats current harness | ref→skill | |
| free-claude-code (verified clean) | Coding agents | STUDY | 5 `[ASSUMED]` | Worker-model routing alternative to OpenRouter | ref | Optional |
| freellmapi, 9router | Coding agents | STUDY | 5 `[ASSUMED]` | ToS gray zones — use clean parts only (9router RTK compression as ref) | ref | OpenRouter stays primary |
| playwright-mcp | Ops MCPs | STUDY | 3 | Eng/QA + browser automation | mcp-profile (core) | **Phase-3-toolset — study card required before Phase 3 (success criterion 3)** |
| Context7 | Ops MCPs | STUDY | 3 | Eng — live library docs, reduces hallucination | mcp-profile | **Phase-3-toolset** — already available as a GSD-integrated MCP in this session; formal study card still owed |
| Sentry MCP | Ops MCPs | STUDY | 10 | Eng error tracking | mcp-profile | |
| Stripe MCP | Ops MCPs | STUDY, gated | 11 | Finance — draft-only, approval-gated | mcp-profile, gated | PILOT-04 |
| DocuSign MCP | Ops MCPs | STUDY, gated | 11 | Legal — draft-only, approval-gated | mcp-profile, gated | PILOT-04 |
| Composio | Ops MCPs | STUDY | 10+ | Orchestrator scale-out connector | mcp-profile | |
| Cloudflare MCP (tokens exist) | Ops MCPs | STUDY | 10 | Eng/Security — outleteuro zone | mcp-profile | Rotate token first |
| autoresearch (karpathy, 89.8k★) | Other | STUDY | 11 | Loop-engineering module | skill | Outleteuro assets, locked scorer |
| huggingface | Other | STUDY | as needed | Model/dataset source | ref | |
| Notion/Granola/Composio AI-stack | Other | STUDY, evaluate | 10+ | Ops — only if free tiers suffice | mcp-profile | |

### Excluded items (INTEG-02)

| Item | Reason | Re-admission Requirement |
|------|--------|---------------------------|
| kickbacks.ai | Adware (Marketplace removal + adverse audit) | Explicit CEO sign-off entry in a `## Re-admission Log` section, with the adware finding addressed |
| automaton | Crypto-token project, safety criticism | Same — explicit CEO sign-off entry required |
| llm-council (as a dependency) | Dead repo since Nov 2025 — pattern reimplemented in-house (CNCL-01, §10) | Not re-admissible as a dependency; the *pattern* is already adopted independently |
| ToS-gray systems: `free-claude-code`-adjacent free-tier stacking, multi-account rotation, freellmapi/9router (beyond clean reference parts) | ToS risk; doc's own rule forbids bypass systems | Same — CEO sign-off entry required per instance |

**Machine-checkable rule for INTEG-02:** any row in `INTEGRATION-TRACKER.md` with `Status: EXCLUDED` may only change status if a corresponding dated entry exists in a `## Re-admission Log` section of the same file, naming the CEO approval. A grep for `Status: EXCLUDED` with no matching re-admission entry is the compliance check the plan-checker/verifier can run.

## Runtime State Inventory

> Not applicable — Phase 2 is greenfield scaffolding (no rename/refactor/migration). No prior monorepo, packages, or installed runtime state exists to inventory. Confirmed: `ls package.json pnpm-workspace.yaml` at repo root returns nothing yet.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@types/node` and `vitest` versions/choice as Phase 2 defaults | Standard Stack | Low — both are easily swappable dev-only deps; no runtime/architecture impact |
| A2 | Phase-mapping of §8B items originally tagged old "P2" (spans new Phases 3/4/5) to one specific new phase each | Integration Tracking Program seed data | Medium — a mis-mapped row could cause a study card to be produced too early or too late relative to when a phase actually needs the tool; CEO/planner should spot-check the ambiguous rows (ruflo, headroom, codex-plugin-cc, claudex, jcode/oh-my-pi, free-claude-code, freellmapi/9router) at Phase 3-5 planning time |
| A3 | Turborepo/Nx explicitly NOT adopted for Phase 2 (plain `tsc --build` instead) | Alternatives Considered | Low — reversible; revisit if build times become painful once more packages have real interdependent logic |
| A4 | `vitest` as the Nyquist validation test framework default | Validation Architecture | Low — greenfield choice, not a locked decision; easily changed before any tests are written |

## Open Questions

1. **Does the study-card program require CEO sign-off per card, or just per EXCLUDED-item re-admission?**
   - What we know: success criteria explicitly require CEO sign-off only for re-admitting excluded items (INTEG-02); the STUDY→INSTALL→ADOPT→EMBED workflow (INTEG-01) doesn't explicitly mention a sign-off gate.
   - What's unclear: whether "no doc-mandated tool is skipped or installed blind" implies the CEO reviews each study card before INSTALL, or whether that's Claude's discretion per item.
   - Recommendation: default to no per-card CEO gate (keeps the anti-baby-sitting core value intact) unless the tool touches money/credentials/outward actions, in which case Phase 1/4's existing approval-gate discipline already covers it.

2. **Exact phase target for the "P2"-tagged items whose new-phase mapping is ambiguous (see Assumption A2).**
   - What we know: 7 items in the seed table carry an `[ASSUMED]` phase tag.
   - What's unclear: precise phase without deeper cross-reference to §10's brain-architecture map (not fully re-read this session).
   - Recommendation: planner can proceed with the assumed mapping for Phase 2's own deliverable (the tracker file); confirm/adjust each ambiguous row during the discuss-phase step of the phase it's assumed to target.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Entire monorepo | Yes | v22.23.1 (matches locked "Node 22 LTS") | — |
| npm | Corepack bootstrap | Yes | 10.9.8 | — |
| pnpm | Workspace package manager | No (not yet installed) | — | Install via `corepack enable && corepack prepare pnpm@latest --activate` — no external fallback needed, Corepack ships with Node 22 |
| Corepack | pnpm activation | Yes | 0.34.6 | — |
| Docker | Supabase local dev (Phase 3), general containerization | Yes | 28.3.0 | — |
| System RAM | Local Supabase stack, general dev | Constrained: 7.4GB total, **259MB free, swap 2.0/2.0GB used at measurement time** | — | Schema-only local dev (see Pitfall 1); full stack runs on VPS only |
| git | Version control | Yes | 2.43.0 | — |
| TypeScript compiler (global) | — | Not installed globally (expected — project-local via pnpm) | — | — |

**Missing dependencies with no fallback:** none — pnpm's absence has a clean, documented fallback (Corepack).

**Missing dependencies with fallback:**
- pnpm → Corepack activation (see above)
- Full local Supabase stack (would exceed current free RAM) → schema-only local dev workflow for Phase 3

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (proposed — no existing test infra in this greenfield repo) |
| Config file | none yet — `vitest.config.ts` to be created at repo root in Wave 0 |
| Quick run command | `pnpm test` (once configured) |
| Full suite command | `pnpm -r test` (recursive across all workspace packages) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTEG-01 | Every `packages/*`/`apps/*` scaffold compiles under `tsc --build`; workspace resolves `workspace:*` deps | build/smoke | `pnpm build` (root `tsc --build`) | ❌ Wave 0 — no root package.json/tsconfig yet |
| INTEG-01 | `INTEGRATION-TRACKER.md` has one row per §8B item, valid `Status` enum values only, and a study-card file exists for every non-EXCLUDED row | lint/smoke (script) | a small Node/bash script asserting row-count and file-existence (to be written in Wave 0) | ❌ Wave 0 — script doesn't exist yet |
| INTEG-02 | Every `EXCLUDED` row has no corresponding grep hit unless a `## Re-admission Log` entry exists | lint/smoke (script) | same script as above, extended | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `pnpm build` (fast, whole workspace) + the tracker-integrity script
- **Per wave merge:** `pnpm -r test` (once vitest is wired) + full tracker-integrity check
- **Phase gate:** both green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` — root config, no per-package config needed yet (empty packages)
- [ ] `scripts/check-integration-tracker.(mjs|sh)` — asserts every `INTEGRATION-TRACKER.md` row has a valid Status token and (for non-EXCLUDED rows) a matching `study-cards/<slug>.md` file; asserts every EXCLUDED row has a re-admission log entry or stays excluded
- [ ] Framework install: `pnpm add -D -w vitest` (gate behind `checkpoint:human-verify` per the Package Legitimacy Audit above)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth surface exists in Phase 2 (no runtime services yet) |
| V3 Session Management | No | Same |
| V4 Access Control | No | Same — MCP gateway scoping is Phase 7 |
| V5 Input Validation | No (deferred) | Zod is the locked validation library for every future payload boundary (Phase 3+); nothing to validate yet in an empty scaffold |
| V6 Cryptography | No | No secrets/crypto operations in this phase — the Phase 1 vault pattern already governs any secret references |

### Known Threat Patterns for this phase's stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Slopsquatted/typosquatted npm package accidentally added to a package.json during scaffolding | Tampering | Package Legitimacy Audit gate (this document) — every proposed `pnpm add` checked before install; SUS-flagged packages gated behind `checkpoint:human-verify` |
| A study card or tracker row silently re-admitting an EXCLUDED item without CEO sign-off | Tampering / Elevation of Privilege (process integrity) | Machine-checkable re-admission-log rule (INTEG-02) enforced by the Wave 0 tracker-integrity script |

## Sources

### Primary (HIGH confidence)
- `npm view <pkg> version` (live, 2026-07-06) — @anthropic-ai/claude-agent-sdk, @modelcontextprotocol/sdk, pg-boss, next, @supabase/supabase-js, zod, typescript, pnpm, supabase (CLI) — all match CLAUDE.md-locked figures, no drift
- Local machine probes (live, 2026-07-06): `node --version`, `free -h`, `docker info`, `df -h`, `command -v pnpm/corepack/tsc` — direct evidence for Environment Availability and Pitfall 1
- CEO architecture notes §8B (`/home/ghost/.claude/plans/bubbly-dazzling-goblet.md`, lines 91-165) — the authoritative tool inventory for the Integration Tracking Program

### Secondary (MEDIUM confidence — WebSearch cross-checked against official sources)
- pnpm.io/workspaces, pnpm.io/catalogs (official docs, fetched directly)
- anthropics/claude-agent-sdk-typescript CHANGELOG.md (GitHub, via WebSearch)
- supabase.com/docs (connecting-to-postgres, supavisor-and-connection-terminology, local-development/cli) + github.com/orgs/supabase/discussions/29306 (via WebSearch)
- pgbouncer.org/faq.html (via WebSearch)
- modelcontextprotocol/typescript-sdk GitHub issues #925, #1429 + npm package page (via WebSearch)
- github.com/pnpm/pnpm issues #6227, #8441, #2339 (via WebSearch)

### Tertiary (LOW confidence — flagged for validation)
- `@types/node` exact recommended version (not independently pinned this session — use whatever `catalog:` resolves to at `pnpm add` time)
- Package Legitimacy Audit "too-new" signal interpretation for vitest/tsx/turbo/@types/node — reasoned as a heuristic false positive given download counts and repo age, but not independently overridden; treated per protocol as SUS requiring human verification

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions live-verified against npm registry today, matching already-locked CLAUDE.md figures exactly
- Architecture (monorepo patterns): MEDIUM — cross-checked against official pnpm docs; TS project references pattern is well-established but not independently fetched from microsoft/TypeScript docs this session
- Integration tracking program design: HIGH (internal design, no external uncertainty) but phase-mapping of ambiguous §8B rows is MEDIUM (see Assumptions Log A2)
- Pitfalls: HIGH — RAM/swap/Docker/pnpm findings are direct live measurements on the target machine, not inferred

**Research date:** 2026-07-06
**Valid until:** 2026-08-05 (30 days — stable ecosystem, but Agent SDK pre-1.0 churn warrants re-checking the changelog again at Phase 5 research time regardless of this expiry)
