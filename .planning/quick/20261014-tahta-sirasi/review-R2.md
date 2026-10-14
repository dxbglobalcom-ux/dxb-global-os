# Review R2 — the engine (L2)

Reviewer R2, 2026-10-14, read-only. The company was read through `~/.config/dxb/company-gateway.env` with SELECT
only (written below as `q "<SELECT>"`). The construction engine (54422) was not touched. Services were read with
`systemctl --user` and `journalctl --user`; the scheduler's own output is in `var/scheduler.log`, because the unit
sends stdout there.

Healthy, measured, and not findings: no failed units (`systemctl --user --failed` → 0). NRestarts is 0 on every
resident service since the boot at 07:48. In pg-boss, no job failed, none is active and none was retried in the last
7 days. Every queue's `failed_count` is 0 (`q "select name, failed_count, active_count from pgboss.queue"`). Every
enabled routing row points at an `active` catalogue model, and no retired or banned model is routed. All 213 agents'
brains are active models. `pgboss.warning` is empty.

### F-R2-1 — Code already built for B64 step 1 will break Hamza's written chat on the company at the next scheduler restart
- Evidence:
  - Commit e63b8345 (16:25 today) changed `packages/orchestrator/src/chat-drain.ts`. At :324-328 it now reads
    `chat_sessions.effort_override, effort_override_at, last_leg` for every message in a conversation. The scheduler
    loads it from `dist`: `package.json:9` `"scheduler": "node packages/outbox-executor/dist/main.js"`, and
    `@dxb/orchestrator` has `"main": "dist/index.js"`. That `dist` is already rebuilt with the new code:
    `packages/orchestrator/dist/chat-drain.js` has mtime 2026-10-14 16:13 and contains `effort_override` 8 times.
  - The company does not have those columns. `q "select effort_override, effort_override_at, last_leg from chat_sessions limit 1"`
    → `ERROR: column "effort_override" does not exist`. The table's columns are only
    `created_at, id, last_message_at, title, title_tr`.
  - The running scheduler is still the old process: `ExecMainStartTimestamp=Wed 2026-10-14 07:48:59`, which is
    earlier than both the dist rebuild and the commit. It reloads at every boot or restart. The journal shows a
    fresh boot on 10-08, 10-09, 10-10, 10-11 and 10-14. Once reloaded, `drainChatMessages` catches the error and
    marks the CEO's message `failed` (chat-drain.ts:372-378). 106 of his chat messages carry a `session_id`, so
    conversations are the normal path.
  - The same commit gives the dashboard a 20,000-character goal (`apps/dashboard/src/lib/intent-body.ts:8`
    `GOAL_MAX_CHARS = 20000`). The company still refuses anything over 500 characters:
    `q "select pg_get_constraintdef(oid) from pg_constraint where conname='intents_text_check'"` →
    `CHECK (((char_length(text) >= 1) AND (char_length(text) <= 500)))`.
  - STATE.md:36-37 says step 1 is "on the construction engine only". The code half of step 1 is already on master
    and in the company scheduler's `dist`. Only the schema half is missing.
- Owner row: B64 step 1 (built, not applied). The applied/not-applied split is the known part. What is new here: the
  code and the company schema are out of step, and the live scheduler will pick up the code at its next restart.
  B64's plan has no step that orders "migrations on the company before the scheduler reloads".
- Layer: L2 · Severity: blocks · Needs his eye: no (it is an engineering decision: apply the four step-1 migrations
  to the company or hold the code back; applying them is within B64 step 1, which he has already approved)

### F-R2-2 — The morning briefing has not reached him since 2026-09-27, and three other morning jobs have never run, because nothing catches up after the machine wakes
- Evidence:
  - `q "select briefing_date, slot, created_at from ceo_briefings order by created_at desc limit 3"` →
    `2026-09-27|morning`, `2026-08-13|morning`, `2026-08-12|morning`. Nothing after 2026-09-27.
  - Jobs created since pg-boss's oldest job (2026-10-06), by queue (`q "select name, total_count from pgboss.queue"`):
    `ceo.briefing.morning|0`, `hr.stale_persona_scan|0`, `revenue.scan|0`, `revenue.score|0`. Two nightly jobs ran
    once each: `memory-compaction|1` and `hr.performance_daily|1`, both on 10-10, a night the machine was awake.
    The jobs scheduled after the wake hour do run: `hr.training_queue|5` and `hr.probation_check|4`.
  - Their schedules all fall before the machine wakes (`q "select name, cron, timezone from pgboss.schedule"`):
    `ceo.briefing.morning|0 7 * * *|Europe/Berlin`, `hr.stale_persona_scan|0 5 * * *|UTC`,
    `revenue.scan|10 5 * * *|UTC`, `revenue.score|25 5 * * *|UTC`.
  - The machine resumed from suspend at 07:30 (10-12), 07:42 (10-13), 07:41 (10-14), 08:39 (10-09) and 10:04
    (10-10), from `journalctl | grep 'PM: suspend exit'`. In the last 7 days it was never awake at 07:00 Berlin.
  - The code knows pg-boss does not replay a missed slot (`packages/outbox-executor/src/scheduler.ts:68`: "pg-boss
    does not replay a missed 04:00"). It catches up only `tool-pin-check` (scheduler.ts:505-509) and none of the
    jobs above.
  - The record promises otherwise: `HOLDING-OS-MASTER-PLAN/CEO_OPERATING_MANUAL.md:26`, "Sabah brifingi — Hamza
    size yazar … Her sabah 07:00'de". The roadmap marks it "✓ DONE 2026-07-27 (U37)"
    (`00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26.md:65`).
  - The machine sleeping at night is his ruling and is not the finding. The finding is the missing catch-up after
    wake, plus the manual's sentence.
- Owner row: NONE for running the jobs after wake. W-C42-3 ("Brifing karar versin", Section 3, owned by B22) covers
  the briefing's content and ranking, not whether it is produced. Closed item U37 / roadmap 2.6 claims the 07:00
  briefing is done.
- Layer: L2 · Severity: hurts · Needs his eye: no

### F-R2-3 — The safety net for lost log rows points at a folder that does not exist and cannot be created, so a failed log write is thrown away
- Evidence:
  - `packages/observability/src/spill.ts:12`: `return process.env.OBS_SPILL_DIR ?? "/var/lib/dxb/obs-spill";`.
  - `ls -ld /var/lib/dxb` → `No such file or directory`. A user service cannot create a folder under `/var/lib`.
  - The running scheduler has no override: `OBS_SPILL_DIR` appears 0 times in the environment of pid 13502
    (`node packages/outbox-executor/dist/main.js`). Only the variable's name was checked; no value was printed.
  - It has already happened: `grep -c 'SPILL FAILED' var/scheduler.log` → 68. The line reads
    `[obs] SPILL FAILED — observation rows lost: Error: EACCES: permission denied, mkdir '/var/lib/dxb/obs-spill'`.
    The rows that failed were `tool_calls` rejected by `tool_calls_run_id_fkey`, from the same log. The alert meant
    to report the loss failed too (`alerts_run_id_fkey`, 136 lines).
  - These lines come from the September runs, not the last 7 days: the last one is at log line 9966 of 13352, and
    the company has been idle since. The spec's own rule is "data loss is not accepted" (spill.ts:2), and this net
    has a hole in it.
- Owner row: NONE
- Layer: L2 · Severity: hurts · Needs his eye: no

### F-R2-4 — Work runs that broke "escalate when required" are recorded as succeeded, and their 13 alerts have stood unacknowledged for six weeks
- Evidence:
  - `q "select count(*) filter (where acknowledged_at is null), count(*) from alerts where resolved_at is null"` →
    `13|13`. `v_alerts_active` also returns 13. All 13 are from 2026-09-03, and none has escalated (`escalated_at`
    null).
  - Joining them to their runs:
    `q "select a.level, left(a.title,60), r.status from alerts a left join agent_runs r on r.id=a.run_id where a.resolved_at is null"`
    → three times `high|Hook violation: Escalate when required|succeeded`, plus nine `informational` rows ("Verify
    the work you did", "No result without evidence", "Every acceptance criterion answered"), each on a `succeeded`
    run. A run that broke its own hook still counts as a success.
- Owner row: NONE. Nearest: B64 step 3 (the real check against the brief) and B65 ("a failed AI run can be recorded
  as a good answer because the readers never check the error flag"). B65 covers the SDK error flag, not hook
  violations.
- Layer: L2 · Severity: hurts · Needs his eye: no

### F-R2-5 — The scheduler and the read gateway crash two or three times at every boot because they start before the database
- Evidence:
  - `journalctl --user -u dxb-scheduler --since "7 days ago" -p warning` → 26 lines of `Failed with result 'exit-code'`,
    in bursts of 2-3 at each boot (10-07 22:06, 10-08 07:40, 10-09 19:42, 10-10 16:57, 10-11 ×6, 10-14 07:48).
    `dxb-company-read` shows the same pattern, 29 lines.
  - The cause is in `var/scheduler.log`: `[scheduler] fatal boot error: Error: connect ECONNREFUSED 127.0.0.1:54322`
    (78×), then `the database system is starting up` (10×).
  - The unit orders itself only `After=network-online.target`, with nothing after the database
    (`systemctl --user cat dxb-scheduler`).
  - `Restart=always` with `RestartSec=5` recovers it within about 18 s, so nothing is lost. The cost is a
    failed-unit record at every boot.
- Owner row: NONE
- Layer: L2 · Severity: cosmetic · Needs his eye: no

## Known, confirmed on the company (not new)

- B64 step 1 is not applied on the company:
  - `q "select p.oid::regprocedure, has_function_privilege('anon', p.oid, 'EXECUTE') from pg_proc p where proname='fn_update_routing'"`
    → `fn_update_routing(text,jsonb,text)|t`. Anonymous callers can still change routing.
  - Hamza's levels are still the old ones: `chat.answer|claude-opus-5-5|high`, `chat.strategy|claude-opus-5-5|max`
    (step 1 sets medium / xhigh).
  - Goal cap 500 (see F-R2-1).
  - Owner: B64 step 1 (built, not applied).
- B68, routing seed: `packages/kernel/policy/routing-seed.json` holds 21 rules (with `chat.answer … high`), and the
  company has 39. The seed has no `chat.strategy`, `chat.brief`, `media.creative` or any `slot.*` row. Runtime does
  not read the file (`packages/kernel/src/policy.ts:2` mentions it only in a comment; the reader is
  `db/seed/import-routing-rules.ts`). Reader B already has this.
- B51 move (2), the cost meter: `cost_ledger` has 43 rows and the last is dated 2026-09-05. Every `cost_eur` in it,
  and in `agent_runs`, is 0, because subscription calls carry no price. Fable 5.1 has no price
  (`cost_in_per_mtok` null). This is planned, not broken. One consequence: the €2/h velocity breaker
  (`budget_state`) cannot trip on subscription work.

## Unsettled

- The voice line's resident service `dxb-jarvis.service` is `disabled`, and nothing listens on a dashboard port. Is
  that the intended state today? It belongs to R5's area (L7). What would settle it: the spec or row that says
  whether Jarvis and the dashboard should be resident now.
- `dxb-github-mirror` (to a public GitHub, secret-scan gated) failed with exit 128 about 14 times between 10-09 and
  10-12, and has finished cleanly since. Its output does not reach the journal, so the cause is not visible here.
  It belongs to R1 (L1). What would settle it: the mirror script's own log for those runs.
- `var/scheduler.log` holds 373 `qa: verdict malformed twice` lines, for example
  `Unexpected token 'Y', "You've hit"…` and `"API Error:"…`, all from the September runs. A rate-limit or API-error
  text reached the QA judge as if it were a verdict. Whether B65 (the error flag) fully covers this path, or the QA
  reader needs its own guard, is not settled. What would settle it: tracing the QA leg's input in
  `packages/orchestrator` against B65's planned fix.
