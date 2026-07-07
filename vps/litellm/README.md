# LiteLLM proxy (Phase 4 — cost rails)

Image pinned `ghcr.io/berriai/litellm:main-stable` (approval: `.planning/phases/04-safety-rails-gates-cost-audit/04-01-legitimacy-approval.md`). Runs with **host networking** on this Linux/Docker 28 box: proxy on `127.0.0.1:4000`, Supabase Postgres reached at `127.0.0.1:54322`.

## Required env (`./.env`, gitignored — A8 vault)

| Name | Meaning |
|---|---|
| `LITELLM_MASTER_KEY` | Proxy admin key (`sk-...`). Local dev: throwaway value. VPS/real: CEO places it in 04-04 Task 1. |
| `LITELLM_DATABASE_URL` | `postgresql://postgres:postgres@127.0.0.1:54322/postgres?schema=litellm` for local dev — shared Supabase Postgres, isolated Prisma schema `litellm` (LOCKED single-DB decision). |
| `OPENROUTER_API_KEY` | Real key placed by CEO in 04-04 Task 1. Until then a placeholder — the proxy boots and serves /health without it; model calls only start in 04-04. |

## Run

```bash
docker compose -f vps/litellm/compose.yaml up -d
curl -s http://127.0.0.1:4000/health/readiness   # gate: must be 200/healthy
```

Virtual keys per department are generated in 04-04 (`/key/generate`); the velocity breaker blocks keys via `/key/update {blocked:true}`.
