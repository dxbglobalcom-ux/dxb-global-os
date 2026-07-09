# Study Card: hermes-agent

> FILLED 2026-07-09 (07-01 Task 1). Verdict recorded BEFORE install per INTEG-01.
> Install itself lands on the VPS at 07-06 — this card is the deploy contract.

- **Tool:** hermes-agent — Nous Research's open-source autonomous agent harness (terminal + messaging gateway + built-in cron scheduler)
- **Slug:** hermes-agent
- **Category:** Coding agents
- **Status:** STUDY (card filled; INSTALL lands on VPS at 07-06)
- **Target Phase:** 7
- **Owner (dept/tier):** 24/7 VPS resident agent
- **Trigger Type:** service
- **Source:** github.com/NousResearch/hermes-agent — official Nous Research org, verified 2026-07-09; active release cadence (v0.18.1 → v0.18.2 within one day, 2026-07-07/08)
- **Pinned Version:** **v0.18.2** (2026-07-07; release line "2026.7.7.2"). LOCKED master decision: version-lock — any update = this card renewed first. v0.18.0 "Judgment Release" (2026-07-01) closed ~700 P0/P1 issues; .2 fixes WhatsApp-bridge dep to install from published npm release instead of pinned git commit.
- **Purpose:** 24/7 resident agent on the VPS running BOUNDED cron jobs (social/ops routines) with GLM 5.2 brain routed through the local LiteLLM proxy so all spend lands in the budget ledger (STACK rule). Perpetual loop FORBIDDEN (master LOCKED) — cron-triggered, step/token-budgeted, defined-artifact jobs only; watchdog + kill switch wrap it (07-06).
- **Official Docs URL:** https://hermes-agent.nousresearch.com/docs (user-guide/configuration, integrations/providers, user-guide/features/api-server)

## Key API / Usage Notes (deploy contract for 07-06)

- **Runtime:** Python 3.11 (managed via `uv`) + bundled Node.js; external deps: ripgrep, ffmpeg, git. Installs per-user; no root needed beyond apt deps.
- **Install method (recorded, not yet run):** upstream installer `https://hermes-agent.nousresearch.com/install.sh` — we do NOT pipe-to-bash blind: 07-06 downloads the installer to disk, inspects it, then runs it against the **v0.18.2** tag (installer pins via its version selection; if it only installs latest, install from the git tag checkout instead — decision recorded at 07-06 with evidence).
- **LiteLLM wiring (the key contract):** config file `~/.hermes/config.yaml` → `providers:` block with `type: openai`, `base_url: http://127.0.0.1:4000/v1` (local LiteLLM proxy), `key_env: DXB_LITELLM_KEY_HERMES` (per-department LiteLLM **virtual** key env name — value only in VPS env file, never repo), `default_model:` = the LiteLLM model alias for GLM 5.2; `model:` section `provider: custom`. Docs rule verified: when `base_url` is set, hermes ignores built-in provider auth and calls that endpoint directly with the configured key. Interactive alternative `hermes model` wizard exists but 07-06 writes config.yaml declaratively (idempotent deploy).
- **Daemon shape:** `hermes gateway` starts the resident messaging/gateway process — this is what `vps/systemd/hermes.service` wraps (simple service, `User=dxb`, `Restart=on-failure`; kill switch = `systemctl stop hermes`). Built-in cron scheduler runs unattended jobs; 07-06 maps the master's bounded-job template (`vps/hermes/jobs/*.md`: budget + artifact + on_output mandatory fields) onto these scheduled jobs.
- **API server feature** exists (docs/user-guide/features/api-server) — NOT enabled v1; morning-review output flows via artifact files + review queue, never direct outbound.

## Known Pitfalls
- Upstream moves FAST (three releases in first week of July 2026) — version-lock is load-bearing; `install.sh` re-run without card renewal is a governance violation.
- Pipe-to-bash installer: download → inspect → run; never `curl | bash` blind (T-07-01 class).
- Model-agnostic harness defaults are NOT our policy: without explicit budgets a hermes job can loop — the master's bounded-job template + watchdog (5-min systemd timer) are mandatory wrapping, not optional.
- WhatsApp/Telegram/Discord bridges pull extra npm deps — v1 enables NO messaging bridges (gateway runs headless; morning queue is the output path).

## RAM note (Phase 7 budget input)
- Master table expectation: **~300–500MB** — ⚠ UNMEASURED until 07-06 deploy; `docker stats`/`systemd-cgtop` measurement recorded at 07-06 against the ≤7GB peak budget.

- **Install Command:** (07-06, VPS) download `install.sh` → inspect → install **v0.18.2**; then `hermes model` config check + `systemctl enable hermes` — exact transcript lands in 07-06-SUMMARY
- **Legitimacy Verdict:** OK — official NousResearch (established AI research lab) repo, very active maintenance, public docs site, npm-published sub-deps; no crypto/adware indicators; installer inspected before run per pitfall note

## Lifecycle Checklist
- [x] STUDY (2026-07-09, 07-01 — this fill)
- [ ] INSTALL (07-06, VPS — version-locked v0.18.2)
- [ ] ADOPT
- [ ] EMBED
