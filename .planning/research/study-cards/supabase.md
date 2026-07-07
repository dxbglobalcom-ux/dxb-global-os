# Study Card: Supabase (self-hosted platform)

- **Tool:** Supabase (self-hosted Postgres platform: DB + Auth + Realtime + Storage + Studio)
- **Slug:** supabase
- **Category:** Memory/knowledge (state) — the OS's single state store
- **Status:** STUDY
- **Target Phase:** 3 (State Layer & dxb-mcp Core)
- **Owner (dept/tier):** State Layer / API-Backend
- **Trigger Type:** mcp-profile (core)
- **Source:** Docker images via official compose (github.com/supabase/supabase — docker/ directory)
- **Pinned Version:** self-hosted compose stack, Postgres 15+ (image pins recorded at install day)
- **Purpose:** Single source of truth: kernel state, task queue tables, CRM, audit log, cost ledger, pgvector RAG, Realtime feed to dashboard. Every architectural decision assumes "one Postgres holds everything."
- **Official Docs URL:** https://supabase.com/docs/guides/self-hosting/docker

## Key API / Usage Notes
- Self-hosted stack = docker-compose family; keeps recurring cost inside the VPS line, data sovereign.
- Dashboard realtime uses Broadcast-from-DB (`realtime.broadcast_changes` trigger helper) — NOT `postgres_changes` (RLS-per-subscriber + WAL latency; architecture research anti-pattern 5).
- RLS enabled on all operational tables; agents never touch raw SQL — dxb-mcp is the only door (MCP-01).
- Direct (session-mode) connection on port 5432 is available same-box — required by pg-boss (see pg-boss card).

## Known Pitfalls
- **02-RESEARCH Pitfall 1 (local stack RAM):** `supabase start` runs ~10 containers; needs 4GB+ for Docker. This laptop measured 7.4GB total, **259MB free**, swap full. Phase 3 defaults to **schema-only local development**: author migration `.sql` locally, apply via CLI against the real target (VPS self-hosted Supabase or CI ephemeral Postgres); at most one throwaway `docker run postgres:15` for syntax checks. Never the full local stack running continuously on the X230.
- Trim Storage/Imgproxy services on the 8GB VPS if unused (CLAUDE.md stack pattern).

## Install Command (recorded — NOT run in Phase 2)
```bash
# VPS (Phase 7 deploy; Phase 3 uses CLI + remote/ephemeral targets):
git clone --depth 1 https://github.com/supabase/supabase && cd supabase/docker
cp .env.example .env   # secrets via vault pattern, never committed
docker compose up -d
```

- **Legitimacy Verdict:** OK — official Supabase org, locked stack decision (CLAUDE.md)

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL
- [ ] ADOPT
- [ ] EMBED
