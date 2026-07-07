# Study Card: LiteLLM (proxy)

- **Tool:** LiteLLM proxy — multi-provider LLM gateway with per-key budget enforcement
- **Slug:** litellm
- **Category:** Locked stack (infra container)
- **Status:** STUDY
- **Target Phase:** 4 (dual-role principle: installed at the START of the phase that uses it — cost rails)
- **Owner (dept/tier):** Cost Monitor / model routing layer
- **Trigger Type:** container (Docker)
- **Source:** github.com/BerriAI/litellm; image ghcr.io/berriai/litellm (GitHub Container Registry, BerriAI org official)
- **Pinned Image:** `ghcr.io/berriai/litellm:main-stable` (1.91.x line per stack decision; manifest-verified 2026-07-07 without pull — amd64 digest `sha256:671ec5317c754270acd654408df26fa82399f55c3b3ad7c3f567cecdb836fccf`)
- **Purpose:** Single OpenAI-compatible endpoint in front of OpenRouter (and later Anthropic API). Makes the Cost Monitor real: per-department **virtual keys** with `max_budget` + `budget_duration` enforced at request time (COST-01/02), spend ledger in Postgres, key-level blocking as the velocity breaker's lever (COST-03).
- **Official Docs URL:** https://docs.litellm.ai/

## Key API / Usage Notes

- **Proxy config:** `config.yaml` — `model_list` (name → `litellm_params.model` provider slug + `api_key: os.environ/...`), `general_settings.master_key`, `general_settings.database_url`. Master-plan PHASE-04 §3 skeleton is the canonical starting file.
- **DB:** Prisma-managed schema. LOCKED single-DB decision: same Supabase Postgres, isolated schema via `LITELLM_DATABASE_URL=postgresql://...:54322/postgres?schema=litellm` (`?schema=` is a Prisma connection-string parameter; LiteLLM's Prisma layer creates and migrates its tables inside that schema on first boot).
- **Virtual keys:** `POST /key/generate` with `{ max_budget, budget_duration, metadata: { department } }` — one key per department; agents never see a real provider key.
- **Breaker lever:** `POST /key/update` with `{ key, blocked: true }` — how the Phase-4 velocity breaker blocks non-critical departments (04-04).
- **Health gate:** `GET /health/readiness` must return 200/healthy before any dependent step (compose healthcheck target).
- **Spend tables:** names are **NOT hard-coded** in DXB code (risk R1, master-plan §5). Discovered live at install (`\dt litellm.*`) and recorded below at INSTALL time; breaker reads names from config.
- **Alerting:** budget alerts at 70% via webhook → audit_log + CEO notification (wired in 04-04).

## Known Pitfalls

- **Schema/version drift (master-plan R1):** `main-stable` is a moving tag within the stable channel — spend table names/columns verified on install day, never assumed. Digest recorded above freezes today's evidence.
- **Prisma needs DDL rights on first boot** to create the `litellm` schema — local dev uses the postgres superuser; VPS hardening revisits this in Phase 7.
- **Redis NOT needed** at single-instance scale (CLAUDE.md compat table) — do not add a second stateful service.
- **Secrets:** `master_key` + provider keys env-only (`os.environ/...` references in config.yaml; A8 vault pattern). Nothing keylike in the repo. Local throwaway values until CEO places real keys (04-04 Task 1).
- **`supabase db reset` wipes the `litellm` schema too** (single shared DB): after any reset, `docker restart dxb_litellm` so Prisma recreates its 66 tables — verified 2026-07-07 (04-02 Task 1: post-reset restart → `/health/readiness` healthy, table count 66 again). Local-dev-only concern; VPS never resets.
- **Model slugs are guessed nowhere** (no-guessing rule): every configured slug must appear in the live OpenRouter list — see verified table below.

## Verified OpenRouter slug table (live fetch `https://openrouter.ai/api/v1/models`, 343 models, verified 2026-07-07)

| Master-plan slug | Live? | Verified slug for config.yaml | Notes (ctx / $-in / $-out per token) |
|---|---|---|---|
| `openrouter/z-ai/glm-5.2` | ✓ EXISTS | `openrouter/z-ai/glm-5.2` | 1M ctx / $0.93µ / $3.0µ — Hermes brain (locked) |
| `openrouter/moonshotai/kimi-2.7` | ✗ **NOT LIVE** | `openrouter/moonshotai/kimi-k2.7-code` | 262k ctx / $0.74µ / $3.5µ — 2.7 line is code-focused; general-chat alternative: `moonshotai/kimi-k2.6` (262k, $0.66µ/$3.41µ) |
| `openrouter/deepseek/deepseek-v4-flash` | ✓ EXISTS | `openrouter/deepseek/deepseek-v4-flash` | 1M ctx / $0.09µ / $0.18µ — cheapest tier |
| qwen family (slug unpinned in master plan) | — | `openrouter/qwen/qwen3.6-flash` | 1M ctx / $0.19µ / $1.13µ — cheap-tier default; stronger option `qwen/qwen3.7-plus` ($0.32µ/$1.28µ) |
| minimax family (slug unpinned in master plan) | — | `openrouter/minimax/minimax-m3` | 1M ctx / $0.30µ / $1.2µ — latest; cheaper fallback `minimax/minimax-m2.5` (205k, $0.12µ/$0.48µ) |

Mismatch disposition: master-plan `kimi-2.7` recorded as corrected to `kimi-k2.7-code` (this card + CEO approval record); master-plan file itself stays untouched (historical LOCKED doc — correction lives in the verified table per §5 risk note "wrong slug = FAIL, not guess").

## Spend table names (recorded at INSTALL 2026-07-07 — live `pg_tables` query, 66 tables in schema `litellm`)

Cost-rail-relevant tables (Phase 4 consumers read these names from config, never hard-code):
- **`litellm."LiteLLM_SpendLogs"`** — per-request spend ledger (primary breaker input)
- `litellm."LiteLLM_DailyTeamSpend"` / `"LiteLLM_DailyUserSpend"` / `"LiteLLM_DailyTagSpend"` — daily aggregates
- `litellm."LiteLLM_BudgetTable"` — budget definitions
- `litellm."LiteLLM_VerificationToken"` — virtual keys (per-department)
- `litellm."LiteLLM_ErrorLogs"`, `"LiteLLM_AuditLog"` — proxy-side error/audit

Note: table names are Prisma PascalCase and require double quotes in SQL. `_prisma_migrations` present (migration bookkeeping).

## Install Command (recorded — runs ONLY after CEO checkpoint 04-01 Task 2)

```bash
docker compose -f vps/litellm/compose.yaml up -d   # image pinned ghcr.io/berriai/litellm:main-stable
curl -s http://127.0.0.1:4000/health/readiness      # must be 200/healthy
```

- **Legitimacy Verdict:** OK — BerriAI official GHCR package, 30k+ star repo, image manifest verified without pull; keys env-only

## Lifecycle Checklist
- [x] STUDY
- [x] INSTALL (2026-07-07, 04-01 — container healthy on shared Postgres, host networking recorded)
- [ ] ADOPT
- [ ] EMBED
