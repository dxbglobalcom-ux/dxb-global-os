# Plan 03-01 — Package Legitimacy Approval Record (Phase-3 toolset)

- **Decision:** **approved**
- **Reviewer:** CEO (human decision via interactive checkpoint; evidence gathered and presented by Fable 5 inline — governance v4, no subagent)
- **Date:** 2026-07-07
- **Scope:** the seven-package Phase-3 install list below. pg-boss explicitly NOT installed (deferred to Phase 4 per master-plan — blind-install rule).

## Approved install list (live npm registry evidence, fetched 2026-07-07)

| Package | Pinned | Created | Weekly downloads | Maintainers | Spelling check |
|---|---|---|---|---|---|
| supabase (CLI, dev) | 2.109.0 | 2020-11-19 | 1,878,198 | kiwicopple, etienne_supa (Supabase official) | exact |
| @supabase/supabase-js | 2.110.0 | 2020-01-17 | 21,547,221 | etienne_supa, mandarini (Supabase official) | exact |
| @modelcontextprotocol/sdk | 1.29.0 | 2024-11-11 | 42,848,083 | jspahrsummers, pcarleton, fweinberger (Anthropic MCP team) | exact |
| zod | 4.4.3 | 2020-03-07 | 211,601,986 | colinhacks (author) | exact |
| kysely | 0.29.3 | 2021-02-18 | 9,095,199 | kysely-org | exact |
| pg | 8.22.0 | 2010-12-19 | 33,540,623 | brianc (canonical Node driver) | exact |
| @types/pg (dev) | 8.20.0 | 2016-05-17 | 38,941,056 | types (DefinitelyTyped official) | exact |

CLAUDE.md pin conformance: @modelcontextprotocol/sdk 1.29.0 ✓, supabase-js 2.110.x ✓, zod 4.x ✓. No anomalies flagged.

## Build-script decision (CEO-approved)

- `allowBuilds: supabase: true` — its postinstall downloads the CLI binary from GitHub releases; install is non-functional without it. Explicit, recorded, single exception.
- Every other package: DENY by default (esbuild precedent, 02-03). Any NEW build-script request during install halts execution for a fresh CEO decision.

## Chain

Study cards existed BEFORE this approval (commit 1581e74 for kysely/pg; nine Phase-3 cards from 02-04 at 9b49a3f). Install (03-01 Task 3) runs only after this record. T-3-01/T-3-02 mitigations executed as specified.
