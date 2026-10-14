# Review R1 — security and data (L1)

Reviewer R1, 2026-10-14. The company (54322) read SELECT-only through `company-gateway.env` (role
`dxb_gateway`); helper `q.sh` = `set -a; . ~/.config/dxb/company-gateway.env; set +a; psql "$DXB_COMPANY_GATEWAY_URL" -At -F'|' -c "<SELECT>"`.
The construction engine (54422) was not queried. Nothing was written anywhere but this file.

Checked and clean (no finding): PostgREST exposes only `public,graphql_public` on both stacks
(`docker inspect supabase_rest_DxB_Global_OS` → `PGRST_DB_SCHEMAS=public,graphql_public`); no table in them has RLS
off, no view or policy is open to anon, anon has 0 SELECT/INSERT/UPDATE/DELETE on public tables; the read window
`dxb_gateway` writes nothing (0 writable tables, 0 executable definer writers, no USAGE on `net`, `pgboss`,
`storage`, `auth`, `supabase_migrations`); the two engines stay apart (`ss -tnp`: only `dxb-scheduler`, the outbox
and the read gateway hold connections, all to 54322; `tests/construction-engine.ts:14-15,34` → 54422); secrets:
`gitleaks git` on history → "no leaks found"; `gitleaks dir` → 714 hits, **0 in git-tracked files** (all in
git-ignored `var/research` 565, `.planning/research` 110, `graphify-out/cache` 29, and the ignored env files
under `vps/` and `apps/dashboard/`); tracked env files: only `.env.example`, `vps/.env.example`.

### F-R1-1 — The company's database answers anyone on the home network with the factory password
- Evidence: `ss -ltnp` → `0.0.0.0:54322` (and `[::]:54322`) listening; the host's LAN address is `192.168.178.44`
  (`ip -4 addr`, interface `wlp9s0`). `psql "postgresql://postgres:<the stock Supabase password>@192.168.178.44:54322/postgres" -c "select 'login-ok', (select count(*) from public.agents)"` → `login-ok|5432|213`.
  Role `postgres` there: `rolcreaterole=t, rolbypassrls=t` and owns every public function and table. Docker
  publishes ports past a host firewall. Any device on the same Wi-Fi can read, change or erase the whole company.
  (Kong 54321 is also on `0.0.0.0`; the stock demo service key is refused there → HTTP 401, so the JWT secret is
  not the stock one.)
- Owner row: NONE (B29 owns only the workstation's login password).
- Layer: L1 · Severity: blocks · Needs his eye: no (whether the router forwards the port is listed below)

### F-R1-2 — The off-site copy of the company has failed every night since 25 September, and the job reports success
- Evidence: `tail ~/backups/dxb/backup.log` → `OFFSITE_OK 2026-09-24`, then every night 2026-09-25 … 2026-10-14
  `BACKUP_OK <date> <bytes>` followed by `scp: Connection closed` (20 nights). `journalctl --user -u dxb-backup.service`
  → every run `Finished` (success). Cause in the script: `scripts/backup/laptop-pg-dump.sh:36`
  `scp -q "$OUT" "$BACKUP_DEST/" && echo "OFFSITE_OK $STAMP"` — a failed `scp` in an `&&` list does not trip
  `set -e` (line 15), so the unit exits 0 and nothing alerts (no reader of `OFFSITE_OK`/`backup.log` in
  `scripts packages apps`). Today `ssh -o BatchMode=yes dxb-storagebox ls` → `Permission denied ()`, and the server
  offers no auth method at all (`Authentications that can continue:` empty); `hcloud storage-box list` →
  `the token you have provided is invalid (unauthorized)`. The only copies are the 15 nightly local dumps (2026-09-29 … 2026-10-14) in
  `~/backups/dxb/` on the same disk as the database. Records that say otherwise: `BACKUP_PLAN.md:45`
  ("Storage Box `dxb-backup-1` (subaccount canlı)"), `MASTER_PLAN.md:44` ("hcloud context `dxb`; Storage Box … CANLI"),
  `IMPLEMENTATION_ROADMAP.md:165` E13.0 ("Real RPO = dual cadence (laptop 02:30 cron + VPS 04:30)" — the VPS was
  deleted 2026-09-19 per B39).
- Owner row: closed row B39 claims this done ("The safe was kept and re-proven AFTER the delete … `OFFSITE_OK 2026-09-19`");
  no open row.
- Layer: L1 · Severity: blocks · Needs his eye: yes (the Storage Box / Hetzner account and token are his)

### F-R1-3 — On the company, a visitor who is not signed in can still run 14 writing doors, and counts as "system"
- Evidence: `q.sh "select proname … where prosecdef and has_function_privilege('anon',oid,'EXECUTE') and result<>'trigger'"`
  → `control_ceo_briefing_post, control_opportunity_register, control_voice_call_log, control_voice_daemon_set_state,
  control_voice_identity_retire, control_voice_identity_upsert, fn_approvals_supersede_sweep, fn_chat_post_message,
  fn_chat_session_for_new_message, fn_hr_machine_intake, fn_model_fallback, fn_persona_bind, fn_select_model,
  fn_update_routing` (each ACL carries `anon=X/postgres`), plus readers `fn_org_actor`, `fn_setting_numeric`.
  Company `fn_org_actor` / `fn_update_routing` still read `WHEN current_user IN ('service_role','postgres') THEN 'system'`
  (inside a definer that is always true → anon = system); `control_work_generate` still `IF v_actor NOT IN ('system','ceo')`;
  column `effort_override` absent (`count=0`) → none of the four B64 step-1 migrations is on the company.
  Objects of every migration up to `20261012010000` are present (media_jobs, agent_assignments, tasks.task_class,
  fn_succession_actor, fn_undo_succession, smoke_ok_at → all `t`).
- Owner row: B64 step 1 (built, not applied) — `.planning/board-rows/B64.md:77` "step 1: four pieces built on the
  construction engine (doors closed …); company untouched".
- Layer: L1 · Severity: blocks · Needs his eye: no

### F-R1-4 — Anyone who reaches the login service can create an account, and every signed-in account is treated as the CEO
- Evidence: `docker inspect supabase_auth_DxB_Global_OS` → `GOTRUE_DISABLE_SIGNUP=false`,
  `GOTRUE_MAILER_AUTOCONFIRM=true`, `GOTRUE_EXTERNAL_EMAIL_ENABLED=true`; `supabase/config.toml:179` `enable_signup = true`,
  `:229` `enable_confirmations = false`; Kong on `0.0.0.0:54321`. The actor rule gives `'ceo'` to any caller with a
  user id (company `fn_org_actor`: `WHEN auth.uid() IS NOT NULL THEN 'ceo'`; B64's new version keeps
  `v_role IN ('authenticated',…) AND auth.uid() IS NOT NULL THEN 'ceo'`, `20261014030000_b64_anon_doors_closed.sql:44`),
  and `authenticated` has SELECT policies on 56 public tables. No email allow-list in the dashboard
  (`grep -rnE "ALLOWED_EMAIL|CEO_EMAIL|user\.email ?(===|!==)" apps/dashboard/src` → nothing; no `middleware.ts`).
  A sign-up needs the anon key, which is public by design once the dashboard serves pages. Not exploited here
  (a sign-up would write to the company).
- Owner row: NONE (B64 step 1 closes anon only; it keeps "signed-in = ceo").
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-5 — Every new function the company gets is born callable by anyone, although a migration says otherwise
- Evidence: `q.sh "select defaclrole::regrole, nspname, defaclobjtype, defaclacl from pg_default_acl …"` → row
  `postgres|public|f|… anon=X/postgres …`, and there is no global (`<global>`) row for `postgres`, so PostgreSQL's
  built-in default also hands EXECUTE to PUBLIC. `20260717070000_grant_hardening_parity.sql:310-317` says "future
  FUNCTIONS lose default EXECUTE" for anon — the company contradicts it. Same rows exist for `pgboss|f anon=X`
  (postgres and supabase_admin) and `storage|f anon=X`; those are harmless today (`has_schema_privilege('anon','pgboss','USAGE')` → `f`;
  0 storage functions executable by anon).
- Owner row: B64 step 1 (built, not applied) — the same migration ends with
  `ALTER DEFAULT PRIVILEGES FOR ROLE postgres [IN SCHEMA public] REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC[, anon]`
  (`20261014030000_b64_anon_doors_closed.sql:275-276`). The pgboss/storage rows: NONE.
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-6 — The not-signed-in role may empty 60 of the company's 62 tables, and every new table gives it the same
- Evidence: `q.sh "select count(*) … has_table_privilege('anon',c.oid,'TRUNCATE')"` → `60` (of 62 public tables;
  includes `agents, approval_rules, budget_state, companies, crm_*, departments, personas, settings_*` …).
  Default row `postgres|public|r|… anon=Dxtm/postgres` (TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on every new table);
  also `postgres|public|S anon=w` (sequence UPDATE). TRUNCATE ignores RLS. Not reachable through PostgREST today
  (no TRUNCATE verb; anon cannot log in), so it is a missing second wall, not an open door. Flagged and left in
  July: `20260717070000_grant_hardening_parity.sql:14-16` "live keeps TRUNCATE for anon on 47 tables … flagged in
  the R2.5 report as a deferred-hardening follow-up". B64 step 1 does not touch table privileges.
- Owner row: NONE.
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-7 — Re-running the company's "one-way window" script would re-open doors instead of sealing them
- Evidence: `scripts/b36/company-one-way-window.sql:456-470` — for `public` and `pgboss` it revokes future-function
  EXECUTE from PUBLIC per schema, then grants it back BY NAME to every role except `c_windows`; `:140`
  `c_windows CONSTANT text[] := ARRAY['dxb_reader', 'sol_reader']`. On the company `dxb_reader` no longer exists —
  it was renamed (`scripts/b36/withdraw-company-login.mjs:37-38,111` `ALTER ROLE dxb_reader RENAME TO dxb_gateway`;
  company roles: `dxb_gateway` only). A re-run would therefore (a) name `anon` again in future-function defaults and
  (b) treat the read window `dxb_gateway` as an ordinary role, handing it back what PUBLIC lost (lines 243, 283
  return privileges to "every role" not in `c_windows`). And the per-schema PUBLIC revoke does not stop the global
  default — measured and stated by B64 itself (`20261014030000_b64_anon_doors_closed.sql:12-16`). Callers that still
  apply it: `scripts/b36/install-company-window.mjs:31,49`, `scripts/b36/prove-window-escapes.mjs:180`.
- Owner row: closed row B36 claims this done ("✓ CLOSED 2026-08-25 · ACCEPTED BY THE CEO 2026-08-25").
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-8 — Three writing doors let the caller write any name into the permanent audit log, "ceo" included
- Evidence: company `control_voice_daemon_set_state`: `v_actor text := coalesce(p_actor, fn_org_actor())` then
  `INSERT INTO audit_log (actor, actor_type …) VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END …)`
  — whatever the caller passes as `p_actor` wins; today anon can call it (F-R1-3), after B64 step 1 any signed-in
  caller still can. `fn_hr_machine_intake(p_employee_id, p_actor)` and `fn_persona_bind(p_agent_id, p_persona_id, p_actor)`
  have no caller check at all and write `p_actor` into `audit_log` and `settings_values.updated_by`. `audit_log` is
  "KALICI (silinmez)" (`AUDIT_AND_LOGGING_SPEC.md:47`), so a wrong name there stays. Callers today pass fixed names
  (`apps/dashboard/src/app/api/voice/daemon/route.ts:30` `p_actor: "ceo"`, `packages/voice/src/jarvis-daemon.ts:356`
  `"jarvis-daemon"`, `packages/orchestrator/src/chat-drain.ts:242` `"ceo"`).
- Owner row: NONE for the self-naming (B64 step 1 removes only anon's EXECUTE).
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-9 — There is no proof that today's backups can be restored; the only drill is from July, on the old laptop
- Evidence: `IMPLEMENTATION_ROADMAP.md:165,188` — restore drill 2026-07-17 (ledger 87, agents 220, RTO 5 s) on the
  X230; no later drill: `grep -rl pg_restore scripts tests package.json` → only `scripts/restore-db.sh` and
  `scripts/b36/restore-company-privileges.mjs`; `scripts/backup/` holds only the dump and key-install scripts; no
  board/STATE line records a drill on the workstation. Since then: a new machine (B29), 187 migration files (183
  applied on the company, F-R1-3), and the July drill itself measured that a dump omits default-privilege ACLs and
  needs a pre-block (`IMPLEMENTATION_ROADMAP.md:188`). Together with F-R1-2 the only backup is untested and local.
- Owner row: NONE (E13.0 in the roadmap is marked complete).
- Layer: L1 · Severity: hurts · Needs his eye: no

### F-R1-10 — A not-signed-in visitor can read any company setting that is a number
- Evidence: company `fn_setting_numeric(p_key, p_default)` is SECURITY DEFINER, `anon=X`, and returns
  `resolve_setting(p_key)::numeric` for any key (budget caps, thresholds). Not in B64 step 1's list of 13
  (`20261014030000_b64_anon_doors_closed.sql:242-254`) and not covered by its default-privilege change (the function exists already).
- Owner row: NONE.
- Layer: L1 · Severity: cosmetic · Needs his eye: no

## Unsettled

- **The migration ledger.** `dxb_gateway` has no USAGE on `supabase_migrations` (`permission denied for schema
  supabase_migrations`), so the company's ledger rows could not be read; the memory note's gap was closed
  2026-08-25 at 158/158. Catalog probes show every migration's objects present up to `20261012010000` and none of
  the four `20261014*` (F-R1-3). Missing, extra or out-of-order ledger rows are unsettled. Settles it:
  `SELECT version FROM supabase_migrations.schema_migrations ORDER BY 1` by a role allowed to read it, diffed
  against `ls db/migrations` (187 files).
- **Why the Storage Box refuses.** The empty auth list and the invalid hcloud token fit a locked or removed
  sub-account, but the cause is not measured. Settles it: the Hetzner console (Storage Box `dxb-backup-1` status and
  sub-account `u629578-sub1`).
- **Storage buckets.** `storage.buckets` is not readable by the gateway; no `storage` policies exist
  (`pg_policies` → 0 rows), so objects are closed to anon unless a bucket is public. Settles it:
  `SELECT id, public FROM storage.buckets`.

## For his eye

- ⚠ UNVERIFIED — requires human-eye confirmation: whether the home router (FRITZ!Box range `192.168.178.x`)
  forwards 54321 or 54322 to this machine. If it does, F-R1-1 is open to the internet, not only to the Wi-Fi.
- ⚠ UNVERIFIED — requires human-eye confirmation: the Hetzner account itself (Storage Box state, an unpaid
  invoice, the API token) behind F-R1-2.
