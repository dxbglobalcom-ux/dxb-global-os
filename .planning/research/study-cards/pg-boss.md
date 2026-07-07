# Study Card: pg-boss

- **Tool:** pg-boss (Postgres-native job system for Node)
- **Slug:** pg-boss
- **Category:** Locked stack (runtime lib)
- **Status:** STUDY
- **Target Phase:** 3 (card owed now; per MASTER-PLAN Phase 3 LOCKED decision the actual install may defer to Phase 4, where system routines first need it)
- **Owner (dept/tier):** State Layer / system-job queue
- **Trigger Type:** lib
- **Source:** npm registry (`pg-boss`); github.com/timgit/pg-boss
- **Pinned Version:** 12.25.1 (npm-verified 2026-07-06)
- **Purpose:** SYSTEM routines queue: cron scheduling (lease reaper, velocity-breaker check, compaction, sampling audits), retries with backoff, dead-letter. NOT the business-task queue — business tasks live in the `tasks` table with their own `FOR UPDATE SKIP LOCKED` claim (MASTER-PLAN Phase 3 LOCKED decision: two queues = two sources of truth).
- **Official Docs URL:** https://timgit.github.io/pg-boss/

## Key API / Usage Notes
- `new PgBoss(connectionString)` → `boss.start()`; `boss.schedule(name, cron, data)`; `boss.work(name, handler)`.
- Runs its own schema (`pgboss`) in the same Supabase Postgres — zero extra infrastructure.
- Postgres ≥ 13 required; DXB targets 15+.

## Known Pitfalls
- **02-RESEARCH Pitfall 2 (CRITICAL):** pg-boss relies on `SELECT ... FOR UPDATE SKIP LOCKED` + session-level behavior. It MUST use the **direct session-mode connection (port 5432)** — never PgBouncer/Supavisor transaction-mode pooling, which breaks session-scoped features. Self-hosted same-box makes the direct connection free. Warning signs: intermittent LISTEN/NOTIFY failures, advisory-lock errors under load.
- LISTEN/NOTIFY is a latency optimization, not a delivery guarantee — workers must also poll (architecture research).

## Install Command (executed 2026-07-07, Phase 4 / 04-01 — CEO checkpoint first)
```bash
# catalog: pg-boss: 12.25.1 in pnpm-workspace.yaml; dependency ONLY in packages/outbox-executor
# (earlier draft said @dxb/workers — superseded by 04-01 recorded decision: single scheduler process)
pnpm install
```

- **Legitimacy Verdict:** OK — established repo (timgit/pg-boss), locked stack

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL (2026-07-07, 04-01 — outbox-executor only)
- [ ] ADOPT
- [ ] EMBED
