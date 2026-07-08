---
phase: 04-safety-rails-gates-cost-audit
plan: 04
status: complete
completed: 2026-07-08
executor: "Claude Fable 5 — inline, personally (governance v4; no subagents)"
requirements: [COST-01, COST-02, COST-03, KERN-03]
---

# 04-04 Summary — Cost rails live: virtual keys + hard-stop, velocity breaker, scheduler, subscription tagging

## What happened

- **Task 1 — CEO credential checkpoint (blocking, human).** CEO placed the real funded `OPENROUTER_API_KEY` + strong `LITELLM_MASTER_KEY` in the vaulted `vps/litellm/.env` (tools never read the file — A8 held throughout; all probes ran via shell-sourced env or inside the container).
  ✓ VERIFIED: `/health/readiness` → `{"status":"healthy","db":"connected"}`; authenticated `/key/generate` round-trip OK (probe prefix only, deleted after); OpenRouter auth from inside the container → `AUTH OK`.
  Gotcha caught live: `docker compose restart` does NOT re-read `env_file` — a placeholder key survived one restart; `docker compose up -d --force-recreate` is the correct reload path (recorded for Phase 7 runbooks).
- **Task 2 — virtual keys + `shared/litellm.ts` + hard-stop proof (COST-02).** Three per-department keys generated (`dxb-engineering/-marketing/-research`, max_budget 25 EUR / 30d, `metadata.department`), values appended to the vaulted .env only — never displayed, never committed. `packages/shared/src/litellm.ts` is the ONE proxy surface: `llmCall()` (per-dept key from `DXB_LITELLM_KEY_<DEPT>` env), admin ops (`keyGenerate/Update/Info/Delete`, `listDxbKeys`), and the 04-01-card-fed table-name constants (`LITELLM_SPEND_TABLE` etc. — no hard-coded literals in logic). LOCKED single-source rule honored in code: litellm.ts records NOTHING to cost_ledger.
  ✓ VERIFIED (budget-stop.test.ts, 3 tests, live): real glm-5.2 call through a department key → SpendLogs success row `spend=6.36e-05, tokens=24` joined to `department='engineering'`; exhausted-budget key → second call refused HTTP 400 with `ExceededBudget` body, block audited (`cost.budget_hard_stop`); repo-wide key-value grep gate empty + gitleaks `no leaks found`.
- **Task 3 — scheduler + velocity breaker + `dxb breaker reset` (COST-03).** `scheduler.ts`: ONE pg-boss process (direct 54322 session mode) owns all system routines — outbox tick 15s (self-perpetuating singleton job chain; pg-boss cron is minute-grained), reaper `* * * * *`, breaker `*/5 * * * *`. `breaker.ts checkVelocity()`: unified 60-min EUR window (cost_ledger + SpendLogs via imported constants) vs `budget_state.velocity_cap_eur_per_hour`; trip = DB state first, then best-effort `/key/update {blocked:true}` on non-critical `dxb-*` keys (critical exception constant `['kernel-L1']`, Phase-5 routing_rules note in code), audit actor `system:breaker`. `dxb breaker reset` requires `--confirm`, unblocks, audits `ceo:cli`.
  ✓ VERIFIED (velocity.test.ts, 6 tests): 100-row ~5 EUR storm trips in ONE check; real `dxb-engineering` key blocked at the proxy (`keyInfo.blocked=true` live); tripped re-check is a no-op (single audit row); reset without `--confirm` refused; reset --confirm clears state + unblocks (live-verified) + `ceo:cli` audit; under-cap negative does NOT trip; registered schedules assert reaper/breaker crons + armed tick chain.
  Live behavior note: a blocked key returns **401 "Key is blocked"** (not 429) — recorded from the live probe.
- **Task 4 — subscription tagging hook (KERN-03).** `tools/hooks/src/tag-subscription-call.ts` (new `@dxb/hooks` workspace package): SessionEnd hook parses the transcript JSONL (stdin shape verified against live hook docs + a real transcript — no hook event carries usage/model), sums per-model tokens, inserts `cost_ledger mode='subscription', source='hook'` with `DXB_DEPARTMENT`/`DXB_TASK_ID`; v1 idempotency = first SessionEnd per session_id wins. Registered in `.claude/settings.json` (merge; deny/allow rules preserved; CEO approved the self-modification gate).
  ✓ VERIFIED: real `DXB_DEPARTMENT=research claude -p 'say ok'` run → cost_ledger row `research | claude-haiku-4-5-20251001 | subscription | 70772/234 tokens | hook | session_id` (plan's psql count check > 0); settings.json parses as valid JSON.
- **Whole workspace:** ✓ VERIFIED `pnpm build` green; `pnpm test` → `Test Files 11 passed (11), Tests 42 passed (42)`; gitleaks clean over 121 commits.

## Deviations (recorded, no scope change)

1. **Hard-stop budget threshold:** plan's sacrificial key said `max_budget 0.01`; one glm-5.2 call costs ~0.00006 EUR, so honestly exhausting 0.01 needs ~150 live calls. Used `0.0000001` so ONE call exhausts — identical enforcement path, cheaper proof (noted in test).
2. **15s tick is a singleton job chain, not a cron entry** — pg-boss cron is minute-grained; the chain (worker re-sends with `startAfter:15`) lives entirely inside pg-boss and survives restarts. Reaper/breaker are plain crons.
3. **Department metadata proof is a key-join**, not a SpendLogs column: this LiteLLM build doesn't copy key metadata into SpendLogs rows; `department` lives on `LiteLLM_VerificationToken.metadata` and joins via hashed `api_key` (verified live).
4. **`tools/hooks/` is a real workspace package** (package.json + tsconfig + src/) rather than the plan's bare single file — a .ts hook needs compilation to run under node; root tsconfig gains the reference, pnpm-lock updates.
5. **`db-types.ts` + `index.ts` gained `BudgetStateTable`** — breaker/CLI read budget_state through Kysely; table existed since 04-02 but had no type.

## Follow-ups (recorded, not this plan)

- 70% budget alert webhook → Phase 8 dashboard (COST-04) — noted in budget-stop.test.ts.
- Subscription hook incremental re-tagging on session resume (v1 = first SessionEnd wins).
- ⚠ SECURITY NOTE: the OpenRouter key transited the session transcript once (CEO pasted it in chat to place it). Local-disk exposure only; rotate at will — one `sed` + `--force-recreate` away.

## Key outcomes for the rest of Phase 4

- COST-01/02/03 + KERN-03 are enforced in practice: budgets block real calls, storms die within one 5-min cycle, every spend mode is queryable per dept/model/mode.
- Master-plan steps 6–9 closed. Remaining for the phase: 04-05 (CI gate-canary + phase closure VERIFICATION).
- `startScheduler()` is the single 24/7 system-routines entrypoint hermes/VPS will run in Phase 7.
