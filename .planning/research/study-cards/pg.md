# Study Card: pg (node-postgres)

- **Tool:** pg (PostgreSQL driver for Node.js)
- **Slug:** pg
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** @dxb/shared db layer — the driver under kysely's PostgresDialect; no other package touches it directly
- **Trigger Type:** lib
- **Source:** npm registry (`pg`); github.com/brianc/node-postgres
- **Pinned Version:** 8.22.0 (npm-verified 2026-07-07; created 2010-12-19, 33.5M weekly downloads)
- **Purpose:** The Postgres wire driver. Kysely does not ship a driver — `pg.Pool` supplies connections to PostgresDialect. Direct session-mode connection to Supabase Postgres (local 54322 now, VPS 5432 in Phase 7).
- **Official Docs URL:** https://node-postgres.com

## Key API / Usage Notes
- `new pg.Pool({ connectionString: process.env.DXB_DATABASE_URL })` — constructed EXACTLY ONCE inside `packages/shared/src/db.ts` (grep-gated single-Pool rule).
- Pool defaults (max 10) fine at DXB scale; expose `closeDb()` calling `pool.end()` for clean test teardown.
- Parameterized queries are the injection barrier — kysely builders compile to `$1`-style params; no template-string SQL anywhere.
- `@types/pg` (dev) supplies TS types — separate DefinitelyTyped package, installed alongside.

## Known Pitfalls
- Session-mode requirement (shared with pg-boss + kysely): the connection string must hit the direct Postgres port, never a transaction-pooler endpoint.
- Long-lived Pool + vitest: tests hang on open handles unless `closeDb()` runs in afterAll.
- Do NOT also install `postgres` (porsager) — one driver only; two drivers = drift and double pools.

## Install Command (recorded at card time)
```bash
pnpm add pg@8.22.0 --filter @dxb/shared
pnpm add -D @types/pg --filter @dxb/shared
```

- **Legitimacy Verdict:** OK — established (created 2010-12-19, 15+ years, the canonical Node Postgres driver; brianc/node-postgres; 33,540,623 weekly downloads on 2026-07-05 week; exact-spelling `pg` verified against catalog entry)

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL
- [x] ADOPT
- [x] EMBED
