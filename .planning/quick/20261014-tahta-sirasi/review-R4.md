# Review R4 — work flow, approval and money (L4 + L5)

Reviewer R4, 2026-10-14. Company read SELECT-only through `~/.config/dxb/company-gateway.env` (role
`dxb_gateway`); the construction engine was not queried. `Q "<SELECT>"` below = that psql call with the URL
filtered out.

Measured and clean (no finding): no task stuck in `claimed`/`running` (0 rows); no task whose parent is gone
(0); all 247 `done` tasks carry a result; no task with `approval_class` outward; every one of the 51 approvals
is decided once, with an actor (`decided_by is null` → 0), and each has exactly one outbox row (51/51); no
approval pending; `revenue_ledger` is empty and `cost_ledger` holds 43 rows of €0.00 subscription work (no
contradiction); no chat message `failed` or `pending` (49 CEO, 57 Hamza, all `answered`); no pg-boss job
`failed` in the 30 days kept; the 51 `received` voice intents are unrun by design
(`20261014040000_b64_goal_not_intent.sql` header); the halal screen `const.halal_screen` is enabled on the
company with its nine categories and runs on every task spawn (`packages/hook/src/pre-task.ts:120-150`).

### F-R4-1 — The code already built on disk will break Hamza's written chat on the company at the next scheduler start
- Evidence: the resident scheduler runs the built files (`package.json:9` `"scheduler": "node packages/outbox-executor/dist/main.js"`, which loads `@dxb/orchestrator` from `packages/orchestrator/dist/`). Those were rebuilt by B64 step 1 today: `ls -la --time-style=full-iso packages/orchestrator/dist/chat-drain.js` → `2026-10-14 16:13:33`; `grep -c effort_override packages/orchestrator/dist/chat-drain.js` → `8`. The source reads the new columns on every turn that has a conversation (`packages/orchestrator/src/chat-drain.ts:324-328` `.select(["effort_override", "effort_override_at", "last_leg"])`, and every board message has one — `api/chat/route.ts` writes through `fn_chat_post_message`). The company does not have them: `Q "select column_name from information_schema.columns where table_name='chat_sessions' and column_name in ('effort_override','effort_override_at','last_leg')"` → 0 rows. The scheduler serves the company (`pgboss.job` on the company: `chat.drain|completed|7957` in the last day) and today's process started at `2026-10-14 07:48:59`, before the build, so it still runs the old code. It restarts on every boot: `journalctl --list-boots` → 4 boots between 2026-10-11 and 2026-10-14. The same goes for the dashboard if it is rebuilt: `apps/dashboard/src/lib/intent-body.ts` now lets a goal through up to 20,000 characters while the company's `intents_text_check` still says `<= 500`.
- Owner row: B64 step 1 (built, not applied) — "finished on the construction engine only" (PLAN, Facts that stand). The risk itself is not named anywhere: nothing says the built files must not reach the company's running services before the migrations do.
- Layer: L4 · Severity: blocks · Needs his eye: no

### F-R4-2 — The morning jobs never run, because the computer the company runs on is asleep when they are due
- Evidence: five schedules fall inside the hours the machine sleeps, and pg-boss does not run a missed cron later. `Q "select name, cron, timezone from v_automation_schedules"` → `memory-compaction 0 3 * * * UTC`, `hr.performance_daily 30 2 * * * UTC`, `hr.stale_persona_scan 0 5 * * * UTC`, `revenue.scan 10 5 * * * UTC`, `revenue.score 25 5 * * * UTC`, `ceo.briefing.morning 0 7 * * * Europe/Berlin` (= 05:00 UTC). The machine: `journalctl | grep "PM: suspend"` → asleep `Oct 11 22:50 → Oct 12 07:30`, `Oct 12 23:19 → Oct 13 07:42`, `Oct 13 14:58 → Oct 14 07:41` (CEST). What the handlers wrote: `Q "select action, count(*), max(created_at) from audit_log where action in (...)"` → `hr.stale_persona_scan … 2026-09-27`, `revenue.job.scan … 2026-09-27`, `revenue.job.score … 2026-09-27`, `chat.briefing.delivered … 2026-09-27`; the later jobs ran only on the mornings the machine happened to be awake (`revenue.job.brief` at 05:40 UTC last on 2026-10-12; days with any of these runs since 2026-09-15: 09-27, 10-08, 10-12). `Q "select briefing_date from ceo_briefings order by created_at desc limit 1"` → `2026-09-27` while `briefing.proactive.enabled = true`. The holding's "runs itself 7/24" face does not hold overnight.
- Owner row: NONE for the defect. Nearest: B64 step 7 — "Takvim, tekrar eden işi kendisi başlatır" (assumes a host that is awake); B09/B11 — the 24/7 server, deleted on his order until the holding stands.
- Layer: L4 · Severity: blocks · Needs his eye: yes (whether the company's host may sleep, or the schedules move, or a server is bought — the last is money out)

### F-R4-3 — A goal spoken aloud is still cut at 500 characters, while a typed one may run to 20,000
- Evidence: `packages/voice/src/intake.ts:184` `.values({ text: transcript.slice(0, 500), lang, source: "voice", actor: "ceo" })` — the cut is silent (no flag, the full transcript is not kept in `intents`). B64 step 1 lifted the cap for the typed door only: `apps/dashboard/src/lib/intent-body.ts` `GOAL_MAX_CHARS = 20000`, migration `20261014040000` → `CHECK (char_length(text) BETWEEN 1 AND 20000)`. A third limit sits between them: a goal sent from the chat board ("send as task" sends the whole message) can never pass 4,000, because `apps/dashboard/src/app/api/chat/route.ts:12` `text: z.string().trim().min(1).max(4000)`. Not yet hit: `Q "select count(*) filter (where char_length(text)=500) from intents where source='voice'"` → `0`.
- Owner row: B64 decision A1 / step 1 "a goal, not an intent: the 500-character cap goes" (commit e63b8345) — covers the intent, but the step changed only the typed path; the voice path and the 4,000 chat bound are not named.
- Layer: L4 · Severity: hurts · Needs his eye: no

### F-R4-4 — The studio's image and video prompts are never checked against the Islamic boundaries
- Evidence: the halal screen reads only a task's objective and output contract at spawn (`packages/hook/src/pre-task.ts:127-129` `[ctx.task.objective, ctx.task.outputContract]`). The prompt an expert writes during its run goes into the job book through `media_submit` (`packages/dxb-mcp/src/groups/media.ts`) and to the image/video engines through the media lane (`packages/outbox-executor/src/media-lane.ts:161,191` `"--prompt", String(p.prompt)`); `grep -n -iE "halal|haram|islam"` over both files → no match. The company's job book has used this path: `Q "select kind, status, count(*) from media_jobs group by 1,2"` → `still|done|26`, `shoot|done|2`, `probe|done|3`, `shoot|failed|1`. The term list itself is the company's (`hook_policies` `const.halal_screen`, nine categories); applying the same list here neither widens nor narrows it.
- Owner row: NONE. Nearest: B43 (row file) — "an Islamic editorial check written from scratch — the machine checks that a verse or hadith exists and is quoted right" (a different check: quotation accuracy, not the prompt screen).
- Layer: L5 · Severity: hurts · Needs his eye: no

### F-R4-5 — B64 step 1 is not on the company: Hamza still thinks at max/high and a goal is still capped at 500 (KNOWN, confirmed)
- Evidence: `Q "select task_class, effort from routing_rules where task_class like 'chat.%' and department_id is null"` → `chat.strategy|max`, `chat.answer|high`, `chat.brief|medium` (step 1 sets medium / xhigh). `Q "select pg_get_constraintdef(oid) from pg_constraint where conname='intents_text_check'"` → `CHECK (((char_length(text) >= 1) AND (char_length(text) <= 500)))`.
- Owner row: B64 step 1 (built, not applied).
- Layer: L4 · Severity: hurts · Needs his eye: no

### F-R4-6 — Fourteen "write this employee's persona" tasks have sat open for 41 days although every one of those personas is written
- Evidence: `Q "select status, count(*), min(updated_at)::date from tasks group by 1"` → `inbox|14|2026-09-03`. All 14 are `HR: author persona for media-… (authorship period rules apply — K2)`, born by `fn_hr_create_employee` in `inbox` (`db/migrations/20260712008000_hr_factory_fns_e54b.sql:227-229`); nothing in the code moves an `inbox` row on (`grep "'inbox'"` → only readers and the dispatch event label). `Q "select a.slug, a.employment_status, a.persona_id is not null from tasks t join agents a on a.id=t.agent_id where t.status='inbox'"` → 14 × `active|t`. They also count as open work for each employee (`…e54b.sql:130` `t.status IN ('inbox','queued','claimed','running')`).
- Owner row: NONE.
- Layer: L4 · Severity: cosmetic · Needs his eye: no

### F-R4-7 — The Integrations page shows 51 failed "outward actions" that were internal signals, and two real outbox states have no label
- Evidence: `Q "select status, count(*), left(max(last_error),120) from outbox group by 1"` → `failed|51|internal-signal action enqueued by pre-20260725 trigger; no executor handler by design (Phase-11 LOCKED); closed out 2026-07-25`. The page counts them under "Outbox eylemi" with a glow and a hint that "every outward action leaves through the approval-gated outbox" (`apps/dashboard/src/app/(command)/sys/integrations/page.tsx:25,68,80`; `messages/tr.json:1328,1333`). Its status labels are `pending/executed/failed/cancelled` (`tr.json:1335-1340`) while the table's states are `ready/executing/executed/failed` (`outbox_status_check`), so a `ready` or `executing` row would print the raw English word on the Turkish page (`page.tsx:91` falls back to `r.status`).
- Owner row: NONE.
- Layer: L5 · Severity: cosmetic · Needs his eye: yes

## Unsettled

- Whether the running dashboard is already built from today's code. It runs as a root-owned `next-server` started `2026-10-14 07:48:49` (`/proc/11610/cwd` → permission denied; `apps/dashboard/.next/BUILD_ID` absent on the host). If it carries `intent-body.ts`'s 20,000 bound, a typed goal over 500 characters fails on the company today. Settled by reading the container's build time / image tag (root or docker access).
- Where the scheduler's own log lines go: `journalctl --user -u dxb-scheduler` shows only systemd's lines (three `status=1/FAILURE` starts at 07:48:41-54 today, then a clean start, with no message saying why). Settled by the unit's `StandardOutput` target or the log file the process writes; this is R2's ground, noted here because F-R4-1's failure would be invisible in the same place.

## For his eye

- ⚠ UNVERIFIED — requires human-eye confirmation: how the Integrations page (`/sys/integrations`) reads with 51 old internal signals counted as failed outward actions (F-R4-7).
- F-R4-2 needs his decision, not his eye: the company's host sleeps roughly 15 hours a day; keeping it awake, moving the schedules, or a server (money out, his gate).
