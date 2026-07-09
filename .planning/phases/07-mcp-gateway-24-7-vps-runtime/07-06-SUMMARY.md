# 07-06 SUMMARY — hermes caged: bounded jobs, watchdog, kill switch (VPS-02)

**Status:** COMPLETE (mechanism level) — one ⚠ CEO dependency (OpenRouter credits) blocks the first full digest run.
**Executor:** Fable 5, inline (session recovered mid-Task-2 after context-cache interruption; all uncommitted work re-read and verdicted personally before commit).
**Commits:** `d0d4f51` (Task 1), `d39e02f` (Task 2), + Task 3 deploy commit (this one).

## Task 1 — bounded job template + loader ✓ VERIFIED

- `vps/hermes/config` (deploy contract), `jobs/social-morning-scan.md` (all mandatory fields: schedule `0 6 * * *`, budget {30 steps, 150k tokens, 0.50 EUR}, artifact, `on_output: queue_review`), `load-jobs.sh` (loud reject: stderr + audit row), `hermes.service` (ExecStartPre gate).
- Evidence: plan verify grep PASS; `! grep -rE "sk-|Bearer "` clean; live loader `LOAD_JOBS_OK enabled=1 rejected=0`; fixture rejection in test: `REJECT bad-job.md — missing: artifact:` → `enabled=0 rejected=1`.

## Task 2 — watchdog + kill-switch code ✓ VERIFIED

- `watchdog-decide.ts` pure decision core (kill on ANY budget field over, or artifactless >2h) + `validateJob` loader parity; `watchdog.sh` (5-min systemd timer) same thresholds; `dxb kill-switch on|off|status` — hard-stop flag + block every `dxb-*` LiteLLM key + stop hermes, each effect reported independently (T-07-23), audit both directions (T-07-22).
- Evidence: `pnpm vitest run tests/phase7/watchdog.test.ts` → **13/13 passed**; full regression **27 files / 130 passed**.

## Task 3 — live deploy (checkpoint) ✓ VERIFIED on box

Deploy chain (all executed 2026-07-09 on dxb-vps-1):
- Node 22.23.1 sha256-verified (`SHASUMS256.txt … OK`), pnpm 11.10.0, workspace built on box.
- hermes v0.18.2 installed **commit-pinned**: installer sha256 `c2e4326c1660…804c8` downloaded → inspected (3133 lines, standard uv/python flow, no malicious patterns) → `--commit 9de9c25f620ff7f1ce0fd5457d596052d5159596` (= tag v2026.7.7.2) → `git rev-parse HEAD` matches pin exactly. CEO approval given by name (classifier gate).
- `dxb-hermes` virtual key minted (max_budget 10, metadata `{"department":"hermes"}`), value only in box-local 0600 files. **Finding: VPS had ZERO dxb-* keys** — 04-04 dept keys exist only on the local dev proxy; remaining 13 dept keys must be minted on VPS (pinned below).
- `OPENROUTER_API_KEY` placed by CEO flow (laptop file → box .env → shredded); real `glm-5.2` round-trip through the virtual key returned `DXB-OK`.
- Units live: `hermes.service` active (84.8M RSS — card's 300–500MB estimate high), `watchdog.timer` active (5-min cadence). RAM: 2.7/7.75 GB used.

**Evidence run 1 — runaway kill:** fake over-budget job planted → same tick: `KILL fake-runaway — over_budget:cost 0.050000>0.0001`, audit row + anomaly line in morning artifact; second tick `killed=0` (per-window dedup, no restart loop). Re-drilled after spend-source fix with REAL LiteLLM SpendLogs data: `KILL fake-runaway2 — over_budget:cost 0.0005156>0.0001` (spent figure = live key spend). Fixtures cleaned; audit trail kept.

**Evidence run 2 — kill-switch e2e:** `on` → `hard_stopped=true hermes=stopped; keys changed: dxb-hermes`; blocked-key probe: `401 "Key is blocked"`; `off` → restored, probe returns `DXB-OK`, hermes active; `status` reports each effect independently; audit rows `kill_switch.on|stopped` / `kill_switch.off|started`.

**Evidence run 3 — night job → morning queue:** queue mechanism ✓ (watchdog enqueues completed artifacts as `tasks status='review'`, idempotent per window — row present: `hermes|review|CEO morning review: social-morning-scan digest 2026-07-09`); zero outward rows for hermes. Full digest run ⚠ blocked (below).

## Deviations / findings (recorded, visible)

1. **hermes v0.18.2 key wiring:** gateway cron runner honors ONLY `config.yaml model.api_key` for provider=custom — `key_env`/env fallbacks ignored (live 401 `no-key-required` until fixed). Virtual key placed in `~/.hermes/config.yaml` 0600; T-07-21 intact (virtual key, 10-cap, blockable).
2. **Watchdog spend source:** hermes rows never reach `cost_ledger` (Phase-4 hook belongs to DXB-orchestrated agents) — watchdog reads LiteLLM `SpendLogs` joined via `dxb-hermes` token, UNION cost_ledger for future rows. Spend is proxy-currency ≈EUR (v1 approximation).
3. **Coarse attribution v1:** dept-level spend maps to every open job window (drill: synthetic row also killed social-morning-scan via artifactless-2h). Acceptable v1 (over-enforcement, fails safe); per-job tagging is a v2 candidate.
4. **`kill-switch on` leaves unit "failed"** (gateway exits 1 on signal by design so `Restart=on-failure` revives) — not-running state is what the switch promises; noted.
5. **Review-queue enqueuer added to watchdog.sh** (plan named the link but no component owned the INSERT) — `on_output: queue_review` now mechanically real.
6. **CLI path:** `tools/dxb-cli` (existing repo layout), not plan's `packages/cli`.
7. **LiteLLM `drop_params: true`** added — hermes sends `reasoning` param OpenRouter's chat route rejects.
8. **Job registration** into hermes cron is a manual deploy step (`hermes cron create …`, id `193a1416bcc6`); loader remains the validation gate. v2: auto-register from job files.

## ⚠ UNVERIFIED — CEO/pending

| Item | Why | Unblock |
|---|---|---|
| Full social-morning-scan digest run | OpenRouter credits too low: prompt cap 16,402 < hermes agent context ~39,796 tokens (HTTP 402) | CEO tops up credits on the dxb-global OpenRouter account |
| First unattended 06:00 firing | needs a real morning (next: 2026-07-10T06:00Z) + credits | check artifact + review row after 06:00 |
| Remaining 13 dept virtual keys on VPS | out of 07-06 scope; discovered missing | mint at 07-08 closure or Phase 8 |

## Requirement

**VPS-02 mechanism-level: PROVEN.** Hermes runs only cron-triggered, budget-boxed, artifact-mandatory jobs; 5-min watchdog kills runaways (live-drilled twice); one command halts every autonomous spender (live e2e both directions); output path is artifact → morning review queue with zero outward side effects.
