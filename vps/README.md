# DXB VPS Runtime (07-05)

Box: `dxb-vps-1` (Hetzner 149310629, cx33 4vCPU/8GB, nbg1) — hardened in 07-04
(`vps/provision/README.md`). Stack lives at `/opt/dxb` (tracked files only, shipped
via `git archive`); secrets ONLY in `/opt/dxb/vps/.env` (0600, generated on the box).

## Layout / operate

| What | How |
|---|---|
| Stack lifecycle | `systemctl {start,stop,status} dxb-stack` (enabled — survives reboot, proven 100s to green) |
| Services (core) | db, auth, rest, realtime, meta, studio, kong, litellm, outbox — all ports bind 127.0.0.1; Caddy is the only public face |
| Profiles | `core` (running) · `voice` (Speaches, on-demand: `docker compose --profile voice up -d`) · `brain` (open-notebook — 07-06/07 wave) |
| Studio | NOT exposed via domain (Caddy default-deny; service routes land with the dashboard phase) — `http://127.0.0.1:8000/` via ssh tunnel, kong basic-auth (`DASHBOARD_USERNAME`/`PASSWORD` in .env) |
| TLS / domain | `https://dxbglobal.online` + `www` LIVE (2026-07-09, Let's Encrypt via Caddy auto-HTTPS). `/etc/caddy/Caddyfile` = domain vhost (`Caddyfile.domain` promoted; interim kept as `Caddyfile.interim.bak`); `DXB_DOMAIN` fed from `/etc/caddy/caddy.env` via systemd drop-in `caddy.service.d/dxb-env.conf`. Only `/health` exposed, everything else 404 |
| LiteLLM | `127.0.0.1:4000` — real provider keys ONLY in its container env (`OPENROUTER_API_KEY` in .env; ⚠ CEO must paste value, empty at deploy) |
| Update deploy | from laptop: `git archive HEAD \| ssh dxb@<ip> 'tar -x -C /opt/dxb'` → `sudo systemctl restart dxb-stack` |
| Migrations | `sudo docker compose --profile core exec -T db psql -U postgres -d postgres < db/migrations/<file>.sql` (0001..0012 applied 2026-07-09) |

## Hermes resident + cage (07-06)

| What | How |
|---|---|
| Resident agent | `systemctl {start,stop,status} hermes` — `hermes gateway` (v0.18.2, commit-pinned 9de9c25f, user dxb, `~/.hermes/`) |
| Jobs | contracts in `/opt/dxb/vps/hermes/jobs/*.md` (mandatory budget/artifact/on_output fields); `load-jobs.sh` validates at every service start; registered in `hermes cron list` |
| Brain | glm-5.2 via local LiteLLM on the `dxb-hermes` VIRTUAL key (max_budget 10) — key in `~/.hermes/config.yaml` + `/opt/dxb/vps/hermes/.env` (both 0600) |
| Watchdog | `watchdog.timer` every 5 min — kills over-budget / artifactless>2h jobs (facts from LiteLLM SpendLogs), audits, appends anomaly line to the morning artifact; completed artifacts enqueued as `tasks status='review'` |
| Kill switch | `node tools/dxb-cli/dist/index.js kill-switch on|off|status` (on box, needs `DXB_DATABASE_URL` + `LITELLM_MASTER_KEY` env) — hard-stop flag + block ALL `dxb-*` keys + stop hermes; audited both directions |
| ⚠ Pending | ~~OpenRouter credits~~ topped up 2026-07-09 (+€6; real 20-item digest produced same evening). Residue: first unattended 06:00 firing — check scheduled 2026-07-10 08:23 |

## Backups (T-07-18)

- Daily cron (installed): `30 2 * * * /opt/dxb/vps/backup/pg_dump.sh >> /opt/dxb/backups/backup.log 2>&1`
- Custom-format dump → `/opt/dxb/backups/dxb-<date>.dump` (0600), retention 14d.
- Off-site (LIVE 2026-07-09): `BACKUP_DEST` in `.env` → Hetzner Storage Box `dxb-backup-1` (bx11, fsn1), least-privilege subaccount `u629578-sub1` (home `backups/pg`, SSH only, no samba/webdav).
  - Auth: key-only — `~dxb/.ssh/storagebox_ed25519` + `~/.ssh/config` Host block (`BatchMode yes`, works from cron). No password persisted anywhere (recovery = recreate subaccount via `hcloud storage-box subaccount`).
  - Gotcha: Storage Box port-22 SFTP (ProFTPD) only accepts keys in **RFC4716** format inside `.ssh/authorized_keys`; OpenSSH one-liner format alone is silently rejected. Both formats installed.
  - Offsite drill (2026-07-09): `bash pg_dump.sh` → `OFFSITE_OK 2026-07-09` + dump on box byte-identical (1,564,584 bytes).
  - Gotcha: script needs exec bit for cron (`git update-index --chmod=+x` fixed in repo 2026-07-09; was 100644 → nightly cron would have failed silently until then).
- **Restore drill (tested 2026-07-09):**
  ```
  psql -U supabase_admin -c "CREATE DATABASE restore_drill;"
  pg_restore -U supabase_admin -d restore_drill --no-owner --no-privileges < dxb-<date>.dump
  psql -U supabase_admin -d restore_drill -c "SELECT count(*) FROM departments;"  # → 14
  ```

## Known deviations from upstream Supabase self-host

- Trimmed: Storage/Imgproxy/functions/pooler OFF (master RAM table); analytics not needed.
- Internal role passwords aligned to `POSTGRES_PASSWORD` via `ALTER ROLE` as `supabase_admin` (standalone image ships them unset).
- `_realtime` schema created manually (upstream init script isn't in the standalone image).
- kong 2.8.1 (local CLI parity): `_format_version: '2.1'` single-quoted (survives env-subst), websocket via plain http upgrade, 2 nginx workers.
- LiteLLM v1.91 real memory ~1.0GiB steady (master's 300–500MB line was optimistic) — mem_limit 1536m.
