# db/ — schema authority

- `migrations/` — the ONLY schema source of truth (Supabase CLI reads it via the `supabase/migrations` symlink). SQL here is LOCKED from master-plan PHASE-03; any divergence is ⛔ FABLE-ONLY.
- `seed/import-personas.ts` — legacy persona import (classifier-based; see master-plan PHASE-03 "Persona v2 Programı").
- `seed/apply-persona-v2.ts` — flips registry rows to Fable-authored v2 files under `personas/<dept>/`.

## Seed order (after EVERY `supabase db reset`)

1. `node --experimental-strip-types db/seed/import-personas.ts` — births all agent rows (v1.0-legacy)
2. `node --experimental-strip-types db/seed/apply-persona-v2.ts` — flips v2-covered departments to `v2.0-fable`
3. `node --experimental-strip-types db/seed/import-routing-rules.ts` — routing_rules rows

Order 1→2 is mandatory: apply-persona-v2 only UPDATEs (never INSERTs); a v2 file without a
registry row is reported as `missing-in-registry` and exits non-zero. The 05-09 slice gate
(`slice-10of10.sh`) depends on this order.

## Environment

Runtime code reads one variable (see `packages/shared/src/db.ts`):

```
DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

- The value above is the Supabase LOCAL DEV default (public knowledge, not a secret).
- Put real values in `.env` at repo root — gitignored AND tool-read-denied by the Phase-1 vault pattern (A8). That protection is also why this documentation lives here instead of a `.env.example` file.
- Session-mode direct Postgres connection ONLY (54322 local / 5432 VPS) — never a transaction-pooler URL (kysely + pg-boss constraint).

## Local stack (X230 RAM budget)

`supabase/config.toml` disables studio, storage, local_smtp, analytics, edge_runtime — the stack runs 5 containers (db, kong, rest, auth, realtime). Realtime was re-enabled in its owning phase (Phase 8, 08-01: Broadcast-from-DB needs `realtime.broadcast_changes` + the realtime service, which installs the `realtime` schema on first start). Re-enable further services only in their owning phase.
