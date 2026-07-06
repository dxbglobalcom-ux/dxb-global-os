# Study Card: Supabase CLI

- **Tool:** supabase (CLI)
- **Slug:** supabase-cli
- **Category:** Locked stack (dev tool)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** State Layer / migrations
- **Trigger Type:** lib (dev dependency / standalone binary)
- **Source:** npm registry (`supabase`); github.com/supabase/cli
- **Pinned Version:** 2.109.0 (npm-verified 2026-07-06)
- **Purpose:** Migration authoring and application (`supabase db diff`, `db push`, `db reset`), local project scaffolding. Migrations checked into git = auditable company memory (CLAUDE.md).
- **Official Docs URL:** https://supabase.com/docs/guides/local-development/cli/getting-started

## Key API / Usage Notes
- `supabase init` (project scaffold), `supabase migration new <name>`, `supabase db push --db-url <direct-url>` against remote/ephemeral targets.
- MASTER-PLAN Phase 3 gate uses `supabase db reset` (fresh-apply proof) — run against an ephemeral/CI Postgres or the VPS target, NOT a full local stack on the X230.

## Known Pitfalls
- **02-RESEARCH Pitfall 1:** never run the full local stack (`supabase start`, ~10 containers) on this laptop (259MB free RAM measured) — **schema-only** local workflow: author `.sql` locally, apply remotely; single throwaway `docker run postgres:15` for syntax verification at most.

## Install Command (recorded — NOT run in Phase 2)
```bash
pnpm add -D -w supabase@2.109.0
# or standalone binary per docs if the npm wrapper misbehaves on this machine
```

- **Legitimacy Verdict:** OK — official Supabase CLI package

## Lifecycle Checklist
- [x] STUDY
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
