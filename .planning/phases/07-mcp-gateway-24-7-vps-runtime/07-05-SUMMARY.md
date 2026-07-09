---
phase: 07-mcp-gateway-24-7-vps-runtime
plan: 05
status: complete (two ⚠ CEO inputs open: OPENROUTER_API_KEY paste, BACKUP_DEST choice)
completed: 2026-07-09
duration: ~80min
tasks_completed: 3/3
requirements: [VPS-01]
commits:
  - "(prior) feat(07-05a): compose stack authored"
  - "(this commit) feat(07-05b): core stack LIVE on VPS — 9 services healthy, 12 migrations, registry+pins parity, reboot self-heal 100s, backup+restore drilled"
---

# 07-05 SUMMARY — compose deploy + self-heal + backups (master steps 6–7)

**Executed inline by Fable 5 (governance v5). CEO approved the deploy checkpoint ("07-05'e EVET").**

## Evidence (✓ VERIFIED — all VPS rows are live-box terminal evidence)

| Claim | Executed evidence |
|---|---|
| Compose validates, pins exact, no secrets | `COMPOSE_VALID` + `ALL_PROFILES_VALID`; 0 moving tags; secret-literal grep clean (comment-only match); 13 mem_limits |
| Core stack UP on VPS | `docker compose --profile core ps` → 9/9 Up, db/kong/meta/studio healthy flags green |
| Gateway routes work | `auth_health=200`, `rest_anon=200` (real ANON_KEY), `studio_via_kong=200` (basic-auth); dummy key → 401 (key-auth enforces) |
| LiteLLM alive | `curl 127.0.0.1:4000/health/liveliness` → `"I'm alive!"` (Phase-4 CEO-approved model config + salt_key) |
| Schema parity | 12/12 migrations applied `ON_ERROR_STOP` clean; `\dt tool_pins` present; 17 public tables |
| Registry parity | data-only copy local→VPS → **14 departments / 153 agents** |
| MCP-03 live on VPS | in-container pinAll → `VPS_PINALL pinned=21 existing=0`; `tool_pins` count 21 (q=false); outbox scheduler carries the 04:00 pin-check cron |
| RAM inside budget | `docker stats`: litellm 1.02GiB, kong 182M, studio 175M, realtime 176M, db 107M, meta 75M, outbox 46M, rest 26M, auth 9M; `free -m` → **used 2579 / 7751, available 5171** — ≤7GB gate holds with voice+brain headroom (~5.6GB projected peak) |
| Reboot self-heal (master step 7) | `sudo reboot` → **ALL_GREEN in 100s** (9 running + litellm health + auth-via-kong + Caddy /health), ZERO manual steps — systemd `dxb-stack.service` enabled proof |
| Backup + restore TESTED | `BACKUP_OK dxb-2026-07-09.dump (623879 bytes)`; restore drill into `restore_drill` DB → `SELECT count(*) FROM departments` → **14**; scratch DB dropped; cron installed `30 2 * * *` |

## ⚠ OPEN (CEO inputs)

| Item | Note |
|---|---|
| `OPENROUTER_API_KEY` empty on box | LiteLLM up but upstream calls will fail until CEO pastes value into `/opt/dxb/vps/.env` + restart. CEO-credential step by design |
| `BACKUP_DEST` unset | dumps stay on-box (single point of failure until off-site target chosen) — `OFFSITE_SKIP` logged |
| DNS/TLS | unchanged from 07-04 — Caddy interim :80; domain still pending |

## Deviations ([ADAPT] — all fixed live, in-file comments)

| # | Deviation | Why |
|---|---|---|
| 1 | Internal DB role passwords `ALTER ROLE`d as `supabase_admin` | standalone supabase/postgres image ships supabase_auth_admin/authenticator/etc. without the compose-init password wiring; `postgres` isn't superuser in this image |
| 2 | `_realtime` schema created manually; `METRICS_JWT_SECRET` added | upstream init.sql isn't in the standalone image; realtime v2.112 requires the env |
| 3 | kong: `_format_version: '2.1'` single-quoted, no `protocol: ws`, 2 workers, 384m | env-subst eats double quotes; ws-protocol is Kong 3+; 4 default workers OOM-killed (signal 9) under 256m |
| 4 | litellm mem_limit 1536m (master table said 300–500MB) | measured: v1.91 python import alone Killed under 768m; steady RSS 1.02GiB — budget still holds |
| 5 | studio `HOSTNAME: 0.0.0.0` | Next.js bound the container hostname; embedded healthcheck fetches localhost |
| 6 | migrations = 12 files (plan text says 0001..0010) | house set grew (0011 tool_pins, 0012 ceo/research) — plan's own "schema equals local" truth wins |
| 7 | dxb-mcp not a daemon service | stdio server, session-spawned; ships inside dxb/monorepo image (inventory/pin tooling proven in-container) |
| 8 | hermes not in compose `brain` profile | native systemd service per master/study card — lands 07-06 |

## For downstream plans

- 07-06: box + image ready; hermes install + watchdog + kill switch; `--profile brain` start decision belongs there (RAM headroom recorded).
- 07-07: `--profile voice` (Speaches pinned @digest) on-demand; yt-dlp path documented in study card.
- DNS arrival: swap Caddyfile.domain + `DXB_DOMAIN` in .env (auth/studio URLs), restart stack — closes 07-04 TLS gate too.
