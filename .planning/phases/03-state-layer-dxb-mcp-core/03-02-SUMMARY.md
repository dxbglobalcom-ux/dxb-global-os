---
phase: 03-state-layer-dxb-mcp-core
plan: 02
subtitle: "Supabase local stack + LOCKED migrations 0001-0006 + persona seed"
status: complete
executed_by: "Claude Fable 5 — inline, personally (governance v4)"
completed: 2026-07-07
duration: ~20min
commits:
  - 783f376: "feat(03-02): supabase local stack — minimal 4-container config, migrations symlinked to db/"
  - 6002200: "feat(03-02): migrations 0001+0002 (LOCKED SQL) + classifier persona seed — 153 legacy dormant"
  - 4efe0bb: "feat(03-02): migrations 0003-0006 (LOCKED SQL) — approvals state machine proven one-way, append-only enforced"
requirements: [QUEUE-01, QUEUE-02, REG-01, REG-02]
---

# Plan 03-02 Summary

## What was built

1. **Local Supabase stack, X230-fit:** `supabase init` (project_id DxB_Global_OS); config.toml disables realtime/studio/storage/local_smtp/analytics/edge_runtime → 4 containers (db, kong, rest, auth). `supabase/migrations` → `../db/migrations` symlink keeps master-plan tree + CLI convention.
2. **Six LOCKED migrations** (`20260707000001..6_*.sql`, master-plan SQL byte-faithful; timestamp prefixes = CLI naming convention, logical order unchanged): operational core (tasks, task_events, claim_next_task, reap_expired_leases), registry, approvals+outbox+triggers, cost+audit (append-only), memory_index, CRM ×4 (RLS explicit).
3. **Classifier persona seed** (`db/seed/import-personas.ts`, node --experimental-strip-types; pg resolved via @dxb/shared createRequire): hard-excludes integrations/examples/scripts; persona IFF `---` frontmatter + `name:`; 32 skips audit-logged to `db/seed/seed-skipped.log`; idempotent ON CONFLICT DO NOTHING.

## Verification evidence (executed)

- `supabase db reset` → `reset_rc=0` (all six, fresh) — run three times total, all green
- `supabase status` → API_URL http://127.0.0.1:54321, DB_URL ...54322; `free -m` after start → 1899MB available
- `\df` lists claim_next_task + reap_expired_leases
- Seed → `classified personas: 153 across 11 departments`; re-run → `inserted: 0` (idempotent); DB counts 153/11/153-dormant-legacy
- Trigger negatives (psql, observed): `pending→draft` → `ERROR: pending→draft yasak`; `pending→approved` → outbox_rows=1, key `email.send:<uuid>`; `approved→rejected` → `ERROR: karar değiştirilemez`
- Tables: 13 in public; RLS: 13/13 (`pg_class.relrowsecurity`)
- Append-only: `\dp task_events` shows no UPDATE/DELETE (w/d) privilege for anon/authenticated/service_role

## Deviations from plan

1. **Count reconciliation (Fable verdict, ⛔ gate fact):** initial 159/12 measurement predated CEO corpus cleanup — `spatial-computing/` (6 personas) removed from disk before seed. Classifier-at-seed truth: **153 personas / 11 departments**; all planning docs synced (PHASE-03, ROADMAP, REQUIREMENTS, 03-02-PLAN, STATE).
2. **Classifier interpretation:** legacy frontmatter never carries slug/role fields — name-bearing frontmatter = complete persona (`v1.0-legacy`), slug always from filename, role from optional `role:` (default worker); `v1.0-unparsed` reserved for unparseable frontmatter. Preserves the broken-vs-legacy distinction the plan intended.
3. **`.env.example` unreachable by design:** Phase-1 A8 rule tool-denies `.env*` — env contract documented in `db/README.md` instead (deviation, not a gap).
4. **Service trim via config.toml** (persistent, committed) instead of `-x` flags — CLI partially ignored `-x` for config-enabled services.

## Security note (for Phase 4 hardening backlog)

`\dp` shows non-postgres roles retain TRUNCATE (D) on append-only tables — LOCKED spec revokes only UPDATE/DELETE, and RLS default-deny blocks anon/authenticated anyway; service_role bypasses RLS. Flag for Phase 4 rails review (candidate: REVOKE TRUNCATE), decision stays ⛔ FABLE-ONLY (schema change).

## Fable verdict

**APPROVED — authored and verified personally.** All five must-have truths hold with executed evidence: six-migration reset green, both queue functions live, classifier seed 153/11 idempotent + skip-audited, approval state machine provably one-way with outbox auto-birth, append-only enforced on evidence tables.

## Next

Wave 2 continues: 03-03 (@dxb/shared — LOCKED TaskEnvelope + single Kysely client).
