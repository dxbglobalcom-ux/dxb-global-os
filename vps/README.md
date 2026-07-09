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
| Studio | `https://<domain>/` behind kong basic-auth (`DASHBOARD_USERNAME`/`PASSWORD` in .env) — until DNS: `http://127.0.0.1:8000/` via ssh tunnel |
| LiteLLM | `127.0.0.1:4000` — real provider keys ONLY in its container env (`OPENROUTER_API_KEY` in .env; ⚠ CEO must paste value, empty at deploy) |
| Update deploy | from laptop: `git archive HEAD \| ssh dxb@<ip> 'tar -x -C /opt/dxb'` → `sudo systemctl restart dxb-stack` |
| Migrations | `sudo docker compose --profile core exec -T db psql -U postgres -d postgres < db/migrations/<file>.sql` (0001..0012 applied 2026-07-09) |

## Backups (T-07-18)

- Daily cron (installed): `30 2 * * * /opt/dxb/vps/backup/pg_dump.sh >> /opt/dxb/backups/backup.log 2>&1`
- Custom-format dump → `/opt/dxb/backups/dxb-<date>.dump` (0600), retention 14d.
- Off-site: set `BACKUP_DEST` (scp target) in `.env` — ⚠ unset until CEO picks a destination.
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
