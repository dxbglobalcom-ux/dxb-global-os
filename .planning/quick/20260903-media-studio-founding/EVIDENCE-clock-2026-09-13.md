# EVIDENCE — the clock: a minutes budget per seat, the times table, zero idle (B43 plan step 2b), 2026-09-13

**For the independent auditor the CEO named.** Built by the Fable 5.1 session of 2026-09-13 21:3x–21:5x on the CEO's approval of the same evening (`scripts/governance/ceo-approvals.json` → `budget-per-job-zero-idle-plan-approved-2026-09-13`, six steps; born from `time-line-retired-budget-per-job-zero-idle-2026-09-13`). Every claim names the command and its decisive output. **Nothing here is ACCEPTED — the code, the records and the first measurement wait for his eye (LAW B); the first measurement comes with plan ③'s trial film.** The seats' effort (xhigh), the QA judge and the engine recipe are untouched, as the approval says.

## 1. What was measured before a line was written

| Claim | Command | Decisive output |
|---|---|---|
| The sheet carried no clock | `sed -n '1,120p' packages/dxb-mcp/src/dispatch-book.ts` | `SheetSeat` had `budget_max_tokens` and no minutes; `tasks.due_at` (NOT NULL DEFAULT now()+7 days, CHECK due_at > created_at) was never written by `queue_dispatch` |
| An idle lane rested the tick's ten seconds | `sed -n '540,615p' packages/outbox-executor/src/scheduler.ts` | `new TaskLanes(…, CADENCES.taskWorkerSeconds * 1000, …)` and `restMs: CADENCES.mediaLaneSeconds * 1000` — both 10 |
| The judge's time is on the task's done event (B39, earlier the same evening) | `grep -n judge_ms packages/orchestrator/src/qa.ts` | lines 193 and 218: `judge_ms: judgeMs` |
| The book's event vocabulary | company DB (SELECT only): `select event, from_status, to_status, count(*) from task_events group by 1,2,3` | `claimed queued→claimed 419 · transition claimed→running 419 · running→review 289 · review→done 247 · created inbox→queued 22` |
| DXB-V-EYW-005's own timestamps (the fixed book the table is proven on) | company DB: `task_events` of the eight tasks + `media_jobs` row `f9d4e8c7` | author claimed 00:36:54.700 · sheet born 00:40:25.453 · engineer claimed 00:40:25.470 · job created 00:40:43.379, started 00:40:49.052, ended 00:51:14.317, wall 625.3 · reviewers claimed 00:52:48.067–00:52:55.615 · verdict claimed 00:55:47.437 · done 00:59:40.068 |
| The runtime reads a seat's persona from the FILE, not from the bound row | `grep -n persona packages/orchestrator/src/worker-shim.ts` | line 294: `loadPersonaBody(repoRoot, employee.persona_path)` — `agents.persona_path` names the .md; `agents.persona_id` is the gate's record |

## 2. What was built

| Step | Piece | File | Proof |
|---|---|---|---|
| (1) | `budget_minutes` on every seat of the call sheet (a positive number of minutes, at most a day); `sheetDeadlines`: a seat is due its budget after the latest deadline it waits for — [engineer 12] → [five reviewers 3] → [verdict 4] = 19 min on the longest chain; an unbudgeted seat gets no deadline and adds nothing; the record says `all` / `some` / `none` | `packages/dxb-mcp/src/dispatch-book.ts` | `tests/b43/dispatch-book.test.ts` §9 (pure), §11 (engine) |
| (1) | `queue_dispatch` writes `due_at = now() + offset` inside its one transaction (one `now()` for every seat), carries `budget_minutes` / `due_offset_minutes` on each `created` event, `budget_minutes` + `due_at` per task and `budget_minutes_total` + `budgeted` on the sheet record (audit row + return), and says the budget in the `call_sheet` decision (`— budget 19 min on the longest chain (all seats budgeted)` / `— unbudgeted sheet`) | `packages/dxb-mcp/src/groups/queue.ts` | §11: due_at − created_at = 12 · 15 · 15 · 15 · 15 · 15 · 19 min; mixed sheet 12 · 10080 (the default 7 days) · 16; unbudgeted sheet accepted and said so |
| (2) | `queue_sheet_times` — read-only: per seat budget · ready→claimed idle · claimed→done actual · judge_ms · engine seconds and pick-up from `media_jobs` · over budget by how much; per sheet planning (author claimed → sheet born) · total · engine · non-engine · the non-engine/engine ratio · idle · judge total · `seats_over_budget`; `lines` = one English line per seat in the shape the verdict seat quotes. The pure half (`sheetTimes`, `mmss`) proves the shape on the fixed book | `dispatch-book.ts` (pure) + `groups/queue.ts` (the door) | §10: on 005's book — planning 210.8 s · total 1365.4 s · engine 625.3 · non-engine 740.1 · **ratio 1.18** · judge 154.1 s · idle 28 s; §12 on the engine |
| (3) | The rest between an idle lane's looks: `DXB_LANE_REST_SECONDS`, **3 s** by default, `10` = the old behaviour (rollback), ≤ 0 or nonsense → 3, cap 60 — one setting for the company's hands and the studio's; the 10 s pg-boss ticks stay what they were (they only reconcile the loops) | `task-lanes.ts` (`laneRestMsFromEnv`), `scheduler.ts`, `media-lanes.ts` | `tests/b43/task-lanes.test.ts` §6; the scheduler's first line after restart (§4) |
| (4) | One line in the Creative Director's §3: the sheet carries a minutes budget per seat, the verdict reads `queue_sheet_times` and writes why for a seat over budget, a large deviation asks a question and never fails a film by the clock (CEO 2026-09-13) | `personas/media-studio/media-creative-director.md` line 71 | gate PASS · sync v9 · `fn_persona_gate` passed · bound · `--verify` MATCH (§3) |
| (5) | Tests, the battery, the pin, the restart, these records | — | §3–§5 |
| (6) | The gauge on the studio's tab: **not built** — it reaches his screen only when B32 draws the tab; until then it lives in the table (`ratio_non_engine_to_engine`) and here | — | by the approval's own wording |

`TasksTable.due_at` declared in `packages/shared/src/db-types.ts` (Generated<Date>; the column existed, the type did not name it).

## 3. The battery (all run 2026-09-13 21:47–21:50, construction engine only for the tests)

```
pnpm typecheck                                          → $ tsc --build   (clean, exit 0)
pnpm exec vitest run tests/b43                          → Test Files 5 passed (5) · Tests 45 passed (45)
   tests/b43/dispatch-book.test.ts                      → 20 passed (14 before + the clock's 6: §9 ×2, §10 ×2, §11, §12)
   tests/b43/task-lanes.test.ts                         → 6 passed (5 + the rest setting)
pnpm exec vitest run tests/b39 tests/r31/persona-delivery.test.ts tests/b21/agent-context.test.ts
   tests/r21 tests/r22 tests/e8 tests/phase3 tests/phase4 tests/c9/brain-floor.test.ts tests/phase5
                                                        → Test Files 28 passed (28) · Tests 171 passed | 11 skipped
node -e "gatePersona(<body of media-creative-director.md>)"   → GATE media-creative-director: PASS []
DXB_PERSONA_AUTHOR=fable-5 scripts/sync-personas-to-db.sh personas/media-studio/media-creative-director.md
                                                        → SUBMIT media-creative-director — persona id: c9e6eef6-1987-4f7c-8b3e-256d8aa0f210 · author: fable-5
fn_persona_gate('c9e6eef6-…','passed', …)  (company, through the fn_ door)   → v9 passed
update agents set persona_id='c9e6eef6-…' where slug='media-creative-director'  → 9 | passed | fable-5 | active
scripts/sync-personas-to-db.sh --verify …               → match: 1 · diff: 0 · VERIFY: PASS
bash scripts/i18n-purity-check.sh                       → I18N PURITY: PASS (dictionary parity en 2395 = tr 2395)
DXB_DATABASE_URL=<company> node scripts/gateway/pin-arsenal.mjs   → pinned 1 new, 75 already pinned  + dxb-mcp.queue_sheet_times
profiles after the recompile chain                      → queue_sheet_times in 22 of 22 profiles; media-studio: 28 tools, _generated_at 2026-09-13T19:49:48.931Z
pnpm verify:ledger                                      → (see §5)
```

RULE #0 (vitrin) not run: no surface the CEO looks at changed in this leg (the gauge on the tab is step 6, deferred to B32 by the approval). The C42 red (`tests/c42/rival-intel-ledger.test.ts`, 2026-08-19) is untouched by his standing word.

## 4. The restart

```
in flight (tasks claimed/running/review + running jobs): 0     at 21:49:54
systemctl --user restart dxb-scheduler.service                → RESTARTED 21:50:00 · active
[scheduler] an idle lane rests 3 s between looks (DXB_LANE_REST_SECONDS; 10 = the pre-2026-09-13 behaviour)
[scheduler] resident scheduler up — queues live, chains armed, ops:live hosted
[scheduler] the company is working with 1 hand (first tick) — loops running 1, started 1
[scheduler] the studio's hands: 4 lanes running — 1 for the card, 3 for the processor (first tick)
journalctl … --since 21:50:00 | grep -i error|fail|warn     → (nothing)
```

Blast radius named before the change and re-measured after: `TaskLanes`' constructor (used by `MediaLanes` and both lane tests — 12/12 green), `CADENCES` (the two tick cadences unchanged, only their comments), `queue_dispatch`'s callers (the Creative Director through the gateway profile; `scripts/b43/dispatch-brief.mjs` calls `queue_create_task`, not `queue_dispatch` — untouched), the gateway profiles (regenerated by the scheduler's own 30 s chain, 22/22), the r31 persona delivery contract (4/4 after the persona edit).

## 5. What is NOT done, and what waits

- **Not accepted (LAW B):** everything above waits for the CEO's eye.
- **Not measured on a film yet:** the approval's condition — "built and measured on the next film through the road (plan ③'s trial)". No GPU job ran this leg; the card stayed idle.
- **Not built:** step 6, the gauge on the studio tab (B32 draws the tab first).
- **A finding outside this leg, measured and NOT fixed (his word decides):** the company's HR record binds 9 of the 16 studio seats to persona **version 1** while later versions passed the gate (v7 for advertising-director · character-identity · failure-analysis · film-director · product-brand-consistency · storyboard-previz; v2 for ai-video-engineer · delivery-qc · vfx-post). The seats RUN from their files (worker-shim.ts line 294), so their work was never on v1 — the record is behind reality, the same class as the 2026-07-18 workforce hygiene. The Creative Director is on v9 since this leg. Fix, if he says so: bind each seat to its latest passed version (one UPDATE per seat through the same path the persona door uses).

Measured 2026-09-13 21:5x, company DB (SELECT only):
```
select a.slug, bp.version as bound, lp.max_passed as latest_passed from agents a
  left join personas bp on bp.id=a.persona_id
  left join (select employee_id, max(version) as max_passed from personas where quality_gate='passed' group by employee_id) lp on lp.employee_id=a.id
  where a.department='media-studio' …
→ 9 rows bound 1 with latest 7 or 2 · 7 rows bound = latest (creative-director 9/9, the two assigned seats 3/3, four seats 1/1)
```
