# Study Card: Kysely

- **Tool:** kysely (type-safe SQL query builder)
- **Slug:** kysely
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3
- **Owner (dept/tier):** @dxb/shared db layer — the single typed SQL path for dxb-mcp, workers, kernel
- **Trigger Type:** lib
- **Source:** npm registry (`kysely`); github.com/kysely-org/kysely
- **Pinned Version:** 0.29.3 (npm-verified 2026-07-07; created 2021-02-18, 9.1M weekly downloads)
- **Purpose:** Typed SQL layer chosen over drizzle (master-plan PHASE-03 §5 LOCKED decision — revision ⛔ FABLE-ONLY): our schema authority is SQL-first Supabase migrations; kysely builds queries against a hand-written `DB` interface without owning the schema, while drizzle's TS-first schema model would compete with the migration authority.
- **Official Docs URL:** https://kysely.dev

## Key API / Usage Notes
- `new Kysely<DB>({ dialect: new PostgresDialect({ pool: new pg.Pool(...) }) })` — dialect wraps node-postgres; ONE lazy singleton in `packages/shared/src/db.ts` (single-client rule, master-plan file spec).
- `DB` interface hand-written in `db-types.ts` (13 tables): `Generated<T>` for DB-defaulted columns (uuid ids, timestamps, status defaults), `ColumnType<S,I,U>` where select/insert types differ. NO codegen dependency — migrations stay the authority.
- Transactions: `db.transaction().execute(async trx => ...)` — queue transitions write tasks + task_events + audit_log atomically.
- Raw fragments via `sql` template tag are parameterized (`sql\`reap_expired_leases()\``) — never string-concatenated.

## Known Pitfalls
- Pre-1.0 (0.x): pin exact version in catalog; review changelog on bump (same discipline as agent-sdk).
- Same session-mode constraint as pg-boss: direct 5432/54322 connection, NEVER a transaction-pooling (PgBouncer/Supavisor) URL — prepared statements and temp state break.
- `Generated<string>` on uuid/timestamptz columns: forgetting it forces callers to supply DB-defaulted values — mirror the migrations exactly.

## Install Command (recorded at card time)
```bash
pnpm add kysely@0.29.3 --filter @dxb/shared
```

- **Legitimacy Verdict:** OK — established (created 2021-02-18, 5+ years; kysely-org GitHub org; 9,095,199 weekly downloads on 2026-07-05 week; exact-spelling `kysely` verified against catalog entry)

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL
- [ ] ADOPT
- [ ] EMBED
