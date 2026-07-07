# Plan 04-01 — Supply-Chain Approval Record (Phase-4 toolset)

- **Decision:** **approved** (all three items, single blocking checkpoint)
- **Reviewer:** CEO (human decision via interactive checkpoint; evidence gathered and presented by Fable 5 inline — governance v4, no subagent)
- **Date:** 2026-07-07
- **Scope:** (1) pg-boss npm install, (2) LiteLLM container image pull, (3) verified OpenRouter model slug list for `vps/litellm/config.yaml`.

## Item 1 — pg-boss (live npm registry evidence, fetched 2026-07-07)

| Package | Pinned | Created | Weekly downloads | Maintainers | License | Spelling check |
|---|---|---|---|---|---|---|
| pg-boss | 12.25.1 (= `latest` dist-tag) | 2016-03-18 | 834,733 | timjones (timgit/pg-boss author) | MIT | exact |

- Install target: **ONLY `packages/outbox-executor`** (single scheduler process decision — tick/reaper/breaker crons live there). The Phase-2 card's `--filter @dxb/workers` install line is superseded by this plan's recorded decision.
- Build scripts: none expected; deny-by-default stands (esbuild precedent 02-03). Any NEW build-script request during install halts execution for a fresh CEO decision.

## Item 2 — LiteLLM container image

- Image: `ghcr.io/berriai/litellm:main-stable` (GitHub Container Registry, BerriAI official org)
- Evidence: `docker manifest inspect` (no pull) 2026-07-07 — multi-arch OCI index; **amd64 digest `sha256:671ec5317c754270acd654408df26fa82399f55c3b3ad7c3f567cecdb836fccf`**
- DB: shared Supabase Postgres, isolated Prisma schema via `?schema=litellm` (LOCKED single-DB decision, master-plan PHASE-04 §2)
- Secrets: master_key + provider keys env-only (A8); local throwaway values until CEO places real keys in 04-04.

## Item 3 — OpenRouter slugs (live list, 343 models, fetched 2026-07-07)

| Master-plan slug | Live? | Approved config.yaml slug |
|---|---|---|
| `z-ai/glm-5.2` | ✓ | `openrouter/z-ai/glm-5.2` |
| `moonshotai/kimi-2.7` | ✗ NOT LIVE | **`openrouter/moonshotai/kimi-k2.7-code`** (CEO-selected over `kimi-k2.6` at this checkpoint) |
| `deepseek/deepseek-v4-flash` | ✓ | `openrouter/deepseek/deepseek-v4-flash` |
| qwen (unpinned in master plan) | — | `openrouter/qwen/qwen3.6-flash` |
| minimax (unpinned in master plan) | — | `openrouter/minimax/minimax-m3` |

Full pricing/context table in `study-cards/litellm.md` (verified slug table).

## Chain

Study cards existed BEFORE this approval: litellm FULL card written this session (02-05 stub was absent on disk — deviation recorded; card created from scratch, same commit family); pg-boss card on disk since 02-04. Install (Task 3) and pull (Task 4) run only after this record. T-4-01/T-4-03 mitigations executed as specified.
