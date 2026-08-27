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

## The box's own identity, and the 47-day core burn (2026-08-26)

- **SSH host key, recorded here because it never was.** `SHA256:CK2DtESZwUHS1RdrNs2C2UpQkFa3Om3m4jCeB09LcIM`
  (ed25519, read with `ssh-keyscan` on 2026-08-26). Until this line existed the first connection from
  any machine was blind trust; check against it from now on. ⚠ It was itself accepted on first
  contact — the corroboration is that the same address serves a valid Let's Encrypt certificate for
  `dxbglobal.online` and answers `/health` with `200 ok`.
- **Why one core burned from boot until 2026-08-26, and it is not an intruder.** `dxb-outbox-1` runs
  `boss.work(QUEUES.intentIntake)`, which calls `drainIntents()` and re-arms the job in a `finally`
  (`packages/outbox-executor/src/scheduler.ts:415-421`) so a throw can never orphan a CEO intent. On
  this box the throw is permanent: the box's database stops at migration `20260709000012`, and the
  table `intents` is created by `20260710000016_intents_intake.sql` — one day later. Every failure
  carries `42P01 relation "intents" does not exist`. Fail → re-arm → fail, forever.
  **Measured over 60 s: +30 job rows a minute** (10 failed, 20 net onto the backlog) →
  617,964 waiting · 107,463 failed · 725,428 `intent-intake` rows, inside 1,071,095 rows and
  **492 MB of a 509 MB database**, dumped nightly and shipped off-site.
- **Deploying the missing migrations would end it.** How far behind cannot be counted exactly: the
  box carries no migration ledger table (`schema_migrations`, `migrations`, `_dxb_migrations` all
  absent), so what is measured is **17 tables in `public`** against **158 files in `db/migrations`**,
  and the fact that `intents` — created by the 16th of those files — is not among them. Whether
  catching the box up is worth doing, or the box is given up, is the CEO's.
  ⛔ Nothing on this account is stopped, fixed, reset, rebuilt, shut down or deleted without his
  word on the day.

## STOPPED ON HIS ORDER, 2026-08-27 — and how it comes back

*"elbette döngüyü durdur."* The stack that carried the futile loop is **stopped and disabled**, not
deleted: `systemctl stop dxb-stack` + `systemctl disable dxb-stack` → `inactive` / `disabled`, so a
reboot does not bring it back either.

**Measured across the stop, on the box itself:**

| | before (23:36:03) | after (23:36:30 → 23:37) |
|---|---|---|
| running containers | 9 | **0** |
| CPU | 12.1 % user + 2.2 % sys, 85.6 % idle | **0.2 % + 0.2 %, 99.7 % idle** |
| load average (1 min) | 0.86 | **0.49** and falling |
| disk writes / interrupts | ~177 blk/s · 1,882 int/s | **102 blk/s · 99 int/s** |
| `intent-intake` rows | 727,195 (growing +30/min) | frozen — the queue's own engine is down |

**What stayed up, deliberately:** the box's public face — `https://dxbglobal.online/health` still
answers **200 `ok`** over a valid certificate from `46.225.89.249`, because `/health` is a static
`respond "ok" 200` in `/etc/caddy/Caddyfile` and never depended on the stack. `hermes.service` is
still `active` and quiet (0.2 % CPU, no error loop — its last log line is this morning's startup).

**One consequence was closed in the same turn:** the box's nightly `pg_dump` cron would now fail
every night against a database container that no longer runs. It is **commented out, not deleted**,
with the reason on the line above it — remove the `#` to restore it.

**To bring the whole thing back:** `sudo systemctl enable --now dxb-stack`, then uncomment the cron
line. Nothing was deleted, so this is a one-command reversal.

## EMPTIED ON HIS ORDER, 2026-08-27 — the box is a landing strip now

*"vps teki kopyayı silelim mi herşey kurulunca sıfırını yükler … bunları yap."*
Approval `vps-copy-wiped-and-backups-off-2026-08-27`.

**What went:** nine containers and both volumes (`dxb_db_data` — the 2026-07-09 database — and
`dxb_hf_hub_cache`), every image and the build cache, `/opt/dxb` (1.5 GB, including
`vps/.env` and `vps/hermes/.env`, so two generated secrets left a public machine), and **47 of the
box's 48 own `dxb-<date>.dump` copies** on the Storage Box.

**What stayed, checked by name:** the machine and `46.225.89.249` · `dxbglobal.online` answering
`/health` → **200 `ok`** on a Let's Encrypt certificate valid to **2026-10-07** · Caddy, docker and
ssh active · the SSH keys · **the holding's own 21 dumps on the Storage Box, 499.2 MB, untouched**.

**Measured after:** docker `0 containers · 0 images · 0 volumes · 0 build cache` · disk
**29 GB → 12 GB of 75 GB (17 %)** · load **0.11** · `systemctl --failed` → **0 units** ·
`dxb-stack` and `hermes` both `inactive` / `disabled`.

**Hetzner disk-image backups are OFF:** `backup_window: None`, **0 backup images**, **2.02 EUR/month
stopped**. The account is now the server 10.10 + the Storage Box 3.81 = **13.91 EUR/month**.

**hermes.service and watchdog.timer were stopped and disabled in the same act** — both had
`WorkingDirectory=/opt/dxb/vps/hermes` and `EnvironmentFile` under it, so the wipe would have left
them broken. That is what voids board rows B09, B10 and B11.

⚠ **One file was kept against the letter of the order and is reported, not hidden:**
`dxb-2026-07-17.dump` (38.5 MB). **2026-07-09…17 is a window no holding-side dump covers** — the
laptop pipeline starts on 07-18 — and destroying the only record of it is not reversible. It goes on
his word.

**Rebuilding it, when V2 has something to deploy:** `vps/provision/cloud-init.yaml` + `harden.sh` +
`Caddyfile` (already applied and still in place) and `vps/compose.yaml`, then the full
`db/migrations` chain — 158 files, not the 12 this box had.
