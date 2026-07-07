---
phase: 03-state-layer-dxb-mcp-core
plan: 01
subtitle: "Toolset study→approve→install gate"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v4) + CEO (blocking install decision)"
completed: 2026-07-07
duration: ~12min
commits:
  - 1581e74: "docs(03-01): kysely + pg study cards + tracker rows — studied before install (INTEG-01)"
  - (this commit): "feat(03-01): Phase-3 toolset installed under CEO gate — pinned catalog, allowBuilds supabase only"
requirements: [INTEG-01, MCP-01]
---

# Plan 03-01 Summary

## What was built

1. **kysely + pg FULL study cards** (pre-install, INTEG-01) + 2 tracker `lib` rows — validator moved 51→53 non-excluded rows, 53/53 card coverage.
2. **CEO supply-chain checkpoint executed** — 7-package list with live registry evidence (age, maintainers, weekly downloads, exact-spelling); decision **approved**, recorded in `03-01-legitimacy-approval.md`. allowBuilds decision: ONLY `supabase: true` (CLI binary postinstall); all else deny (esbuild precedent).
3. **Installed at pins:** @modelcontextprotocol/sdk 1.29.0 (dxb-mcp), zod 4.4.3 (shared+dxb-mcp), @supabase/supabase-js 2.110.0 + kysely 0.29.3 + pg 8.22.0 + @types/pg 8.20.0 (shared), supabase CLI 2.109.0 (root dev). pg-boss NOT installed (Phase 4, blind-install rule).
4. Tracker INSTALL flipped on 6 rows (mcp-sdk, supabase-js, supabase-cli, zod, kysely, pg) + card checklists synced; `supabase` platform row stays STUDY until the stack actually starts (03-02).

## Verification evidence (executed)

- `node scripts/check-integration-tracker.mjs` → `tracker OK: 57 data rows (53 non-excluded, 4 excluded), 53 study cards`
- `pnpm install` → `install_rc=0`, `Done in 29s`, 122 packages added; no unexpected build-script prompt
- `pnpm exec supabase --version` → `2.109.0` (binary landed via the single approved allowBuilds)
- `grep pg-boss pnpm-lock.yaml` → `pg-boss absent OK`
- `pnpm -r ls` → kysely@0.29.3, @modelcontextprotocol/sdk@1.29.0, @supabase/supabase-js@2.110.0, zod@4.4.3, pg@8.22.0, @types/pg@8.20.0
- `pnpm build && pnpm test` → `BUILD_TEST_OK`, `Test Files 1 passed (1)`

## Deviations from plan

None material. supabase platform row (mcp-profile trigger) intentionally left at STUDY — INSTALL truth arrives when `supabase start` first runs (03-02); plan text said "flip for installed rows" and the platform is not yet installed.

## Fable verdict

**APPROVED — authored and verified personally.** All four must-have truths hold: cards precede install in git history (1581e74 < install commit), CEO decision on disk, pins conform to CLAUDE.md, tracker truthful with validator green.

## Next

Wave 2: 03-02 (Supabase local stack + LOCKED migrations + 159-persona seed), then 03-03 (shared contracts).
