---
phase: 04-safety-rails-gates-cost-audit
plan: 01
status: complete
completed: 2026-07-07
executor: "Claude Fable 5 — inline, personally (governance v4; no subagents)"
requirements: [INTEG-01, COST-02]
---

# 04-01 Summary — Toolset gate: litellm card + CEO checkpoint + pg-boss + LiteLLM container

## What happened

- **Task 1 — litellm FULL study card.** Written at `.planning/research/study-cards/litellm.md`: pinned image + amd64 digest, Prisma `?schema=litellm` single-DB wiring, `/key/generate` + `/key/update blocked:true` levers, readiness gate, env-only secrets, verified OpenRouter slug table.
  ✓ VERIFIED: `test -f … && grep main-stable && grep -qi 'verified.*20[0-9][0-9]'` → `TASK1 VERIFY PASS`
- **Task 2 — CEO supply-chain checkpoint (blocking, ONE checkpoint).** Live evidence presented: pg-boss npm (latest=12.25.1=pin, created 2016-03-18, maintainer timjones, 834,733 weekly downloads, MIT), LiteLLM GHCR manifest (no pull; amd64 `sha256:671ec531…`), verified slug list. **CEO: approved (all three)** + slug decision `kimi-k2.7-code`. Record: `04-01-legitimacy-approval.md`.
  ✓ VERIFIED: `grep 'Decision.*approved'` → `TASK2 VERIFY PASS`
- **Task 3 — pg-boss install.** Catalog `pg-boss: 12.25.1`; dependency ONLY in `packages/outbox-executor` (single scheduler process decision). `pnpm install` clean, zero build-script requests (+7 packages).
  ✓ VERIFIED: `pnpm -r ls pg-boss` → `pg-boss@12.25.1` under `@dxb/outbox-executor` only; `pnpm build` green; `pnpm test` → `Test Files 6 passed (6)`, `Tests 18 passed (18)`; validator exit 0 → `TASK3 VERIFY PASS`
- **Task 4 — LiteLLM container on shared Postgres.** `vps/litellm/{compose.yaml,config.yaml,README.md}` written (host networking chosen and recorded — container reaches `127.0.0.1:54322`, serves `:4000`); throwaway local `.env` (gitignore-proven `git check-ignore` hit). `docker compose up -d` → container `healthy`.
  ✓ VERIFIED: `curl /health/readiness` → `http_code=200` `{"status":"healthy","db":"connected"}`; `\dn` shows schema `litellm` in the SAME Supabase Postgres; 66 Prisma tables listed, spend tables recorded in card (`LiteLLM_SpendLogs` et al.); `free -m` available **760MB** (>300MB gate); validator `58 data rows / 54 study cards` exit 0 → `TASK4 VERIFY PASS`

## Deviations (recorded, no scope change)

1. **litellm stub card absent on disk** — plan said "upgrade the 02-05 stub in place"; no such file existed. FULL card created from scratch. Tracker also had NO litellm row; row added at INSTALL with the deviation noted in its Notes column.
2. **Master-plan slug `moonshotai/kimi-2.7` not live on OpenRouter** — no-guessing rule fired; CEO selected `moonshotai/kimi-k2.7-code` at the checkpoint. Master-plan file untouched (historical LOCKED doc); correction lives in card + approval record + config.yaml comment.
3. **pg-boss card's Phase-2 install line said `--filter @dxb/workers`** — superseded by this plan's recorded decision (outbox-executor only); card corrected with the supersession noted.

## Key outcomes for the rest of Phase 4

- LiteLLM proxy alive at `127.0.0.1:4000`, master key + DB URL env-only; virtual keys/budgets land in 04-04.
- Spend table names captured (PascalCase, quoted) — breaker (04-04) reads names from config, never hard-codes.
- pg-boss in place for scheduler.ts (04-04): tick 15s / reaper 60s / breaker 5min, direct 54322 session mode.

## ⚠ UNVERIFIED (by design at this stage)

- No real model call has crossed the proxy (OPENROUTER_API_KEY is a placeholder until CEO places real keys in 04-04 Task 1). Readiness/DB health verified; upstream provider path is not yet exercisable.
