# Study Card: @supabase/supabase-js

- **Tool:** @supabase/supabase-js (TypeScript client)
- **Slug:** supabase-js
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** State Layer / API-Backend
- **Trigger Type:** lib
- **Source:** npm registry (`@supabase/supabase-js`); github.com/supabase/supabase-js
- **Pinned Version:** 2.110.0 (npm-verified 2026-07-06, matches CLAUDE.md lock)
- **Purpose:** Client for Auth/Realtime/PostgREST surfaces — dashboard reads (RLS), Realtime Broadcast subscriptions, CEO auth. Backend packages use a direct Postgres client (kysely) for operational writes; supabase-js is the app/dashboard-side client.
- **Official Docs URL:** https://supabase.com/docs/reference/javascript

## Key API / Usage Notes
- `createClient(url, key)`; Realtime v2 Broadcast channels: `client.channel('dxb:task_events').on('broadcast', ...)`.
- Dashboard auth pairs with `@supabase/ssr` for Next.js App Router (deprecated auth-helpers forbidden — CLAUDE.md compatibility table).
- Broadcast-from-database requires the `realtime.broadcast_changes` trigger helper (present in current self-hosted images) — verify at install.

## Known Pitfalls
- Don't build dashboard realtime on `postgres_changes` (02-RESEARCH architecture guidance / anti-pattern 5) — Broadcast only.
- 02-RESEARCH Pitfall 3 (native builds on low-RAM): watch transitive deps when this lands in Phase 3; prefer prebuilds; `NODE_OPTIONS=--max_old_space_size=4096` only as fallback.

## Install Command (recorded — NOT run in Phase 2)
```bash
pnpm add @supabase/supabase-js@2.110.0 --filter @dxb/shared
```

- **Legitimacy Verdict:** OK — official Supabase org package, 2.x line, locked stack

## Lifecycle Checklist
- [x] STUDY
- [ ] INSTALL
- [ ] ADOPT
- [ ] EMBED
