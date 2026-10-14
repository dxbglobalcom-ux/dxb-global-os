# Review R6 — the outside world (L8)

Reviewer R6, 2026-10-14. Company read SELECT-only through the read gateway (`dxb_gateway`); the construction engine
was not queried. Nothing was written, restarted or sent anywhere. One read-only outside call: `dig` on the domain.

Areas looked at and found sound (no finding): the studio services (`dxb-comfyui` :8188, `dxb-vitrin` :8899,
`dxb-gpt6-studio`, `dxb-gpt6-gallery` :8190) all `active`, `NRestarts=0`, 0 journal lines at priority `err` in 7 days,
each port answers `200` to a GET; the studio's 31 finished `media_jobs` all have their output file on disk
(`total=31 missing=0`), B43's "the screen is not drawn" is true (no studio route under `apps/dashboard/src/app`);
the research fleet's last run (`var/research/runs/20261012-1142-b64-hamza-role-2`, 1,279 sources, 3,195 ledger rows)
finished with no error file beyond its own counters; `dxb-research-chrome` answers on CDP 127.0.0.1:9333 (only
"WebGL1 blocklisted" lines, harmless under Xvfb); `dxb-github-mirror` last run `Result=success`, log `rc=0 …
ec3376a3..af36412d master -> master`; no Gmail/Reception intake code exists and no record claims one runs (B64 step 5
plans it); CRM tables and `revenue_ledger` are empty (construction, not a finding); the 10 opportunities registered on
2026-07-26 and later gone were removed on purpose and say so (`revenue.discovery.rerun_for_shelf_gate`,
`…rerun_for_turkish_leg`).

### F-R6-1 — Every job scheduled before about 07:40 in the morning never runs, because the machine is asleep then; his morning briefing has not been made since 27 September
- Evidence:
  - The machine sleeps overnight and wakes after 07:30 CEST: `journalctl -g "PM: suspend"` → `Oct 12 07:30:07 … suspend exit` · `Oct 13 07:42:38 … suspend exit` · `Oct 14 07:41:23 … suspend exit` (and `Oct 13 14:58:35 … suspend entry (deep)` → asleep until the next morning).
  - The schedules sit before that: `select name, cron, timezone from pgboss.schedule` → `ceo.briefing.morning|0 7 * * *|Europe/Berlin` · `hr.stale_persona_scan|0 5 * * *|UTC` · `revenue.scan|10 5 * * *|UTC` · `revenue.score|25 5 * * *|UTC` · `revenue.brief|40 5 * * *|UTC` · `memory-compaction|0 3 * * *|UTC` · `hr.performance_daily|30 2 * * *|UTC`.
  - A missed tick is not caught up (pg-boss cron fires only while the scheduler is awake; the only catch-up in `packages/outbox-executor/src/scheduler.ts:507-508` is for `tool-pin-check`). Last 7 days of `pgboss.job` (retention 7 days): `ceo.briefing.morning` → 0 jobs · `hr.stale_persona_scan` → 0 · `revenue.scan`, `revenue.score` → 0 · `revenue.brief` → `10-08 05:41`, `10-12 05:40` only (the 10-12 wake was 05:30 UTC) · `memory-compaction` and `hr.performance_daily` → once (`10-10`) · `revenue.rollup` (05:55 UTC, just after waking) → every day.
  - Audit trail: `chat.briefing.delivered|11|2026-09-27 05:00:43` (last delivery); `revenue.job.scan|129|2026-09-27 05:10:41`, `revenue.job.score|131|2026-09-27 05:25:13`; per day since 2026-09-22: `09-27 brief,rollup,scan,score · 10-08 brief,rollup · 10-12 brief,rollup · 10-13 rollup · 10-14 rollup`.
- Owner row: NONE. Closest: B11 *"the row stays open until Hermes stands on the holding's server"* and B64 step 9 (the rented server) — they plan a server for Hermes, not the resident scheduler on this machine; no row names the lost morning jobs. (Whether the machine is meant to sleep is his call — see "For his eye".)
- Layer: L2 · Severity: blocks · Needs his eye: yes

### F-R6-2 — The server's own handbook still says the rented server and the website are live; both were deleted on 19 September
- Evidence: `vps/README.md:3` *"Box: `dxb-vps-1` (Hetzner 149310629 …)"*; `:15` *"`https://dxbglobal.online` + `www` LIVE"*; `:117-118` *"What stayed, checked by name: the machine and `46.225.89.249` · `dxbglobal.online` answering `/health` → 200 `ok`"*; `:144-145` *"Rebuilding it … `Caddyfile` (already applied and still in place)"*. `grep -n -E "09-19|2026-09" vps/README.md` → no line: the file never records the delete. The truth: board B39 (Section 5) *"`hcloud server delete dxb-vps-1` → "Server dxb-vps-1 deleted" … Both A records were deleted in Namecheap"*; measured now `dig +short A dxbglobal.online` → empty, `dig +short A www.dxbglobal.online` → empty (MX still served). `SYSTEM_ARCHITECTURE.md:99-103` was already corrected; the README was not.
- Owner row: closed row B39 claims this done (*"Coming back is one rebuild from `vps/provision/` + `vps/compose.yaml`"*); no open row owns the README.
- Layer: L8 · Severity: hurts · Needs his eye: no

### F-R6-3 — The July Hermes files still describe the old, caged Hermes that today's plan has replaced, and a test keeps them alive
- Evidence:
  - What is on disk (bytes, `du -b`): `vps/hermes/` 4,374 (config, `load-jobs.sh`, `jobs/social-morning-scan.md`) · `vps/watchdog/` 6,774 (`watchdog.sh`) · `vps/systemd/` 1,995 (`hermes.service` 774, `watchdog.service` 334, `watchdog.timer` 210, `dxb-stack.service` 677) · `tests/phase7/watchdog.test.ts` 9,180 · `tools/dxb-cli/src/watchdog-decide.ts` 2,146 · `vps/litellm/` 5,860 · `vps/compose.yaml` 9,312 · whole `vps/` 42,031. Nothing deleted.
  - What they say: `vps/hermes/config` — brain `glm-5.2`, LiteLLM virtual key *"max_budget 10"*, v0.18.2; `vps/hermes/jobs/social-morning-scan.md` — `schedule: "0 6 * * *"`, `budget: { max_steps: 30, max_tokens: 150000, max_cost_eur: 0.50 }`; `vps/watchdog/watchdog.sh:2-4` — kills any Hermes job *"over ANY budget field"*; `vps/litellm/config.yaml:5-6` — first model `glm-5.2` (retired and banned, B09).
  - What the plan says: B64 PLAN step 9 *"Hermes'e kısıt konmaz … Harcama sınırı da konmaz … Temmuz'daki eski bekçi dosyası kurulumda kullanılmaz"*; B11 *"a pinned current release (v0.22.0 …); the old 13 department keys and the 06:00 research job are not carried over"*; B09 brain = Opus 5.5.
  - Still run by the battery: `vitest.config.ts:49` `include: ["tests/**/*.test.ts" …]` → `tests/phase7/watchdog.test.ts` imports `decideKill`, `validateJob` from `tools/dxb-cli/src/watchdog-decide.js`.
  - Closed B39's sentence *"Coming back is one rebuild from `vps/provision/` + `vps/compose.yaml`"* points the next session at exactly this recipe (GLM-5.2, budget cage, 06:00 job).
- Owner row: B64 step 9 and B11 (they say the old files are not used); no row says what happens to the files and the test — removing them needs the list above shown to him first (memory `delete-list-sizes-before-deleting`).
- Layer: L8 · Severity: hurts · Needs his eye: yes (the delete list)

### F-R6-4 — The GitHub mirror can report success when the main push failed
- Evidence: `~/.local/bin/dxb-github-mirror:16-18` `out=$(git -C "$REPO" push --prune "$URL" --all 2>&1; git -C "$REPO" push "$URL" --tags 2>&1); rc=$?` … `exit $rc` — `rc` is the exit code of the second command (tags) only, so a refused or failed branch push followed by a successful tag push logs `rc=0` and the unit ends `Result=success`. It works today (`2026-10-14 16:27:54 rc=0 ec3376a3..af36412d master -> master`); three real failures on 2026-10-12 (`rc=128`, 11:32/11:47/12:02) were caught only because both pushes failed.
- Owner row: NONE (`grep -i "github-mirror\|public github"` on the board, STATE, specs and row files → no hit; the mirror is recorded nowhere).
- Layer: L8 · Severity: hurts · Needs his eye: no

### F-R6-5 — Test traces from July sit in the company's revenue records, one of them signed as his
- Evidence:
  - `select row_to_json(o) from public.objectives` → `{"title":"e2e door proof","amount_eur":75,…,"status":"closed","proposed_by":"ceo",…,"created_at":"2026-07-26T02:37:33…"}`; audit `ceo|revenue.objective.created|2026-07-26 02:37:33` — a test's objective recorded as created by the CEO, read by the revenue page (`apps/dashboard/src/app/(command)/revenue/…` `from("objectives")`, `from("v_objective_progress")`).
  - `audit_log`: `revenue.opportunity.scored|106`, `revenue.opportunity.advanced|106`, `revenue.opportunity.registered|16`, over 121 distinct `opportunity_id`s, while `public.opportunities` holds 5; 106 of the `scored` rows carry the identical `"score": 6.67`; the first `registered` row is `{"title": "R12 verify probe", …}` (2026-07-16). Only 10 of the missing ids are explained by the recorded reruns.
- Owner row: NONE (the two engines were separated later — tests now write to `DxB_Build`; no row cleans the July residue on the company, and cleaning it is a write to the company that needs his word).
- Layer: L1 · Severity: cosmetic · Needs his eye: no

## Unsettled

- `dxb-gpt6-studio` and `dxb-gpt6-gallery` (and two more listeners, `uvicorn api.main:app` on 127.0.0.1:8178 and `ops/concept_preview.py` on :8189) run from `/home/dxb/DXP-Global-Tech-Consultancy-Holding-OS/` and `~/.local/share/dxb/gpt6-studio/` — not from this repository, and no board row, spec or STATE line names them (`grep -rn "gpt6\|DXP-Global"` → no hit). Whether they are the holding's (and belong under B43/B29) or another project's sharing the `dxb-` prefix is settled by one question to the lead or the CEO.
- `v_snev` (the revenue page's SNEV figure) errors for the read gateway (`permission denied for function fn_setting_numeric`); the dashboard reads it as `authenticated`, which holds both grants, so the page is very likely fine — settled by opening `/revenue` signed in and seeing the SNEV tile render.
- Whether the hidden research Chrome is still signed in on the accounts the fleet needs (B48 Facebook/Instagram) — settled by the fleet's next run's per-platform `ACILAN KAPILAR` column; the last run shows `instagram 0`, `facebook 0` found, which may be the query, not a lost login.

## For his eye

- ⚠ UNVERIFIED — requires human-eye confirmation: is this machine meant to sleep every night? F-R6-1 follows from it: while it sleeps, the morning briefing, the revenue scan and the night HR and memory jobs do not happen. Either the machine stays awake at night, or the morning jobs move to after it wakes / catch up on waking — his choice decides which repair the row carries.
- ⚠ UNVERIFIED — the July Hermes delete list (F-R6-3, 42,031 bytes under `vps/` plus the test and `watchdog-decide.ts`): what goes and what stays is his word, after the list.
