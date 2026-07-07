# db/ — schema authority

- `migrations/` — the ONLY schema source of truth (Supabase CLI reads it via the `supabase/migrations` symlink). SQL here is LOCKED from master-plan PHASE-03; any divergence is ⛔ FABLE-ONLY.
- `seed/import-personas.ts` — legacy persona import (classifier-based; see master-plan PHASE-03 "Persona v2 Programı").

## Environment

Runtime code reads one variable (see `packages/shared/src/db.ts`):

```
DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

- The value above is the Supabase LOCAL DEV default (public knowledge, not a secret).
- Put real values in `.env` at repo root — gitignored AND tool-read-denied by the Phase-1 vault pattern (A8). That protection is also why this documentation lives here instead of a `.env.example` file.
- Session-mode direct Postgres connection ONLY (54322 local / 5432 VPS) — never a transaction-pooler URL (kysely + pg-boss constraint).

## Local stack (X230 RAM budget)

`supabase/config.toml` disables realtime, studio, storage, local_smtp, analytics, edge_runtime — the stack runs 4 containers (db, kong, rest, auth), measured ~1.9GB RAM still available after start. Re-enable services only in their owning phase.
