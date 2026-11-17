<!-- B85 preparation dossier · part: the database · read by an Opus 5.5 helper at high, 2026-11-17 · facts, no verdict; the catalogue figures are the CONSTRUCTION engine's (54422), SELECT only.
     Checked by the lead at the source the same evening, ten claims. Held: 188 files; 113 without a top-level BEGIN; 101 with a ROLLBACK block; 102 files that INSERT; control_work_generate and control_records_purge defined in four files each; no migration names sol_reader; 21 rules in the routing seed; the role='head' line (20260725003000:9); the ledger row written after the file (bootstrap-db.sh:64); DATA_MODEL §3 still says 19 migrations, 18 tables. Differs: the lead counts fn_model_fallback created in TWO files, not three. The catalogue counts (tables, policies, grants) were not re-measured by the lead. -->

# THE DATABASE: preparation dossier (B85)

## 1. THE LOAD

- **B64 / DATA_MODEL "B64 adaptations" A1–A7** (DATA_MODEL.md:404-415): every inbound mail or message becomes a record (channel, sender, `crm_clients` link, class, who sorted it). The design also asks for a job desk owned by the job-type master, a job-type menu of 8–12 types with an "unclear" door, and `agent_runs.cost_eur` NULL when the cost is unknown (today NOT NULL DEFAULT 0, measured). The backup brain is stored by role and replaces `model_catalog.fallback_of`. Intents need a "done" state (today received/classifying/dispatched/failed_dispatch, measured). There are no department heads and no department budgets on a job's path.
- **B43 / DATA_MODEL B43 adaptation** (DATA_MODEL.md:382-398): the studio needs a job → scene → shot record family and a `code` column, because `media_jobs` is flat. B43.md:127 adds that neither the migration chain nor the seed grants the eight `dxb-mcp/*` house groups.
- **B51**: a per-task cost line and a cost meter (row text, board line 139).
- **B08**: switching one employee's brain from the dashboard, plus an open, addable model set (board line 97).
- **B15**: an autonomy dial. `agents.autonomy_level` exists and is 0 on all 219 construction agents (measured), and nothing changes it (B15.md:16).
- **B83**: each revenue line runs one cycle, realised net = `revenue_ledger` − `cost_ledger` (B83.md:43). H1 needs a monthly tenant report (B83.md:25).
- **B10**: Hermes's work flows into the holding's own records; today there is "no bridge between the two databases" (B10.md:26).
- **B41**: the two databases stay apart, and tool shells get no route to 54422 or 54322 (B41.md:26).
- **B76**: the whole holding runs once on the construction copy, then the key turns. This depends on schema parity between engines (`verify:schema-parity`, package.json:24).
- **B72**: a proven off-site backup and a restore drill (B72.md:19-21).
- **B32 / DATA_MODEL §2**: schema first. No screen may show data that has no row behind it, and drill-down must reach the source rows through foreign keys.
- **DATA_MODEL §11–12**: RLS on every table; writes only through SECURITY DEFINER functions; log tables append-only.
- **B82, B84**: I found no database requirement in either row file. UNVERIFIED that they impose none.

## 2. WHAT STANDS TODAY

These are measured on the construction engine with SELECT only, in a read-only session on port 54422.

- **Ledger**: 188 versions recorded, the same count as the 188 files; the last is `20261014050000`. By month: 154 files from July, 5 August, 11 September, 18 October, none in November. `supabase/migrations` is a symlink to `db/migrations`.
- **Schemas**: `public` has 62 tables and 34 views. `pgboss` has 12 tables. `dxb_internal` has 1 table (`ops_live_issued`). The `vector` extension is installed in `public`, which accounts for 118 of the 234 functions there.
- **Table groups**:
  - org: companies, departments, agents, personas, employee_records, agent_assignments
  - work: intents, tasks, task_events, task_dependencies, agent_runs, workflows/steps/runs, projects plus 4 sub-tables, generated_work, media_jobs, outbox
  - control: settings_registry/values/change_log, routing_rules, model_catalog, approval_rules, approvals, hook_policies/violations, budget_state, control_idempotency
  - records: audit_log, decision_log, tool_calls, file_changes, cost_ledger, library_items/grants/change_log/usage_log
  - revenue: revenue_engines, revenue_ledger, revenue_scout_runs, objectives, opportunities, portfolio_allocations, crm_clients/contacts/deals/requests
  - surface: chat_*, voice_*, alerts, ceo_briefings
  - memory: memory_index, memory_embeddings
  - tools: tool_pins
- **Functions**: 116 belong to the application, 90 of them SECURITY DEFINER. That includes 39 `control_*` functions and 31 trigger functions.
- **Triggers**: 32 on `public`. Important ones: `trg_outbox_enqueue` and `trg_approval_guard` (approvals), the persona and activation gates on agents, two acyclicity guards, 10 broadcast triggers for realtime, and two AFTER DELETE triggers that delete alerts.
- **RLS**: on for all 62 public tables and forced on none. 56 tables carry policies. Six have RLS on but no policy: agent_assignments, control_idempotency, media_jobs, memory_embeddings, outbox, tool_pins. All 57 policies are for the `authenticated` role (56 SELECT, 1 INSERT on intents). `pgboss` has no RLS at all.
- **Roles**: `postgres` and `service_role` bypass RLS. `sol_reader` and `dxb_reader` exist and also bypass RLS, but no migration creates them (`grep` finds 0 hits in db/migrations). They are made by `scripts/b36/*`.
- **Chain**: `scripts/bootstrap-db.sh:37-66` runs a preamble, then the pg-boss library initializer, then each file in lexical order. A version already in `supabase_migrations.schema_migrations` is skipped.
- **Seed**: `db/seed/build-seed.ts` generates the construction data from repository files and refuses to run against the company. It imports `packages/shared/dist` and `packages/gateway/dist` (lines 34-35), so those packages must be built first.

## 3. DEFECTS THE BOARD ALREADY NAMES

- **B66**: the SQL model fallback ignores the work's lane and its tier floor (`20260713040000_e71_routing_slots.sql:261`). I re-measured: the live `fn_model_fallback` body mentions neither "lane" nor "tier". Three files define this function.
- **B67**: the HR org check counts a manager-less row as a root only when `role='head'`, so Hamza is not seen as a root (`20260725003000_hr_equipment_dept.sql:9`). Confirmed at that line.
- **B68**: the routing seed holds 21 rules (`packages/kernel/policy/routing-seed.json`, measured) against 39 in the company. Construction has 38, and 7 migrations also insert into `routing_rules`.
- **B73**: anon and every signed-in account hold powers that are the CEO's alone (review-R1.md:59-130; the row says not re-measured since 2026-10-14). On construction I measured today: anon holds TRUNCATE on 34 public tables. Anon can execute 22 SECURITY DEFINER functions; 20 of them are trigger functions, plus `fn_org_actor` and `fn_setting_numeric`, which matches F-R1-10.
- **B72**: the off-site copy has failed every night since 2026-09-25 while the job logs `BACKUP_OK`, and there has been no restore drill since July (B72.md:19,21).
- **B74**: the workforce check passes on a bench "seeded to pass" (F-R3-1, review-R3.md:31). July test traces sit in the company's revenue records (F-R6-5).
- **B75**: tool calls never record success, duration or error (F-R5-7, review-R5.md:86). The library usage counter looks tools up by the wrong name (F-R5-4, owned by C31); `library_usage_log` has 0 rows on construction.
- **B64 item 1**: the 500-character cap on intents (`20260710000016_intents_intake.sql:13`) is already lifted. The live check is 1–20,000 characters, set by `20261014040000`.

## 4. FACTS A DESIGNER MUST KNOW

1. **The kernel's login is likely exempt from RLS and grants.** Battery and README URLs use the `postgres` login, which owns the tables and has `rolbypassrls=t`. The only UPDATE/DELETE grants on the "append-only" logs (audit_log, decision_log, tool_calls, file_changes, settings_change_log, cost_ledger) belong to `postgres` (measured). The role the company daemons use is UNVERIFIED, because `.env.daemon` was not read.
2. **The schema chain carries data.** 102 migration files INSERT, 75 UPDATE and 18 DELETE. `20260711006900_agent_org_parity_backfill.sql:10` is "GENERATED … from the live roster (2026-07-17)" and disables the persona gates at lines 27-28.
3. **Most migrations are not atomic.** 113 of 188 files have no top-level `BEGIN;`. The script does not use `--single-transaction` (bootstrap-db.sh:34) and writes the ledger row only after the file finishes (line 64). A file that fails partway can leave partial changes with no ledger row.
4. **Functions are rewritten in place.** 30 function names are created in two or more files; `control_work_generate` and `control_records_purge` four times each. The current body is whatever the lexically last file wrote.
5. **DATA_MODEL describes an older database.** §3 says "19 migrations, 18 tables"; there are 188 and 62. §20 requires a `-- ROLLBACK` block in every file; 101 of 188 have one.
6. **The cascading delete trigger is declared, not hidden.** `fn_hook_violation_delete_resolve_alerts` (`20260728002000_alert_projection_purity.sql:135-155`) deletes matching alerts and swallows its own error with `RAISE WARNING`.
7. **Some functions have no caller.** I matched name tokens against packages, apps, scripts, function bodies and tests. 21 of 85 application functions are named nowhere in packages, apps or scripts. Four are named nowhere at all: `control_portfolio_rotate`, `fn_hr_grant`, `fn_hr_promote`, `project_health`. A name built at runtime would not show up in this search.
8. **`ceo_briefings`** is named by no runtime TypeScript file. Only its migration (`20260727001000`) and `tests/c9` name it.
9. **The seed and the migrations disagree on routing:** 21 rules in the seed JSON, 38 rows on construction.
10. **Test names hide what they cover.** Folders are named by row and phase IDs (b64, c9, phase3, …), not by subject.
11. **Tests clean up after themselves and share the engine.** They sweep their own rows (`tests/phase3/registry.test.ts:61-69`). The B64 tests say "the resident scheduler is live against this engine" (anon-doors-closed.test.ts:12); I did not check that. UNVERIFIED.

## 5. THE TESTS

There are 195 `*.test.ts` files; 119 of them access the database. The largest folders: c9 has 21, phase6 9, b51 8, and phase4, phase7, phase8 and b43 have 6 each. `tests/construction-engine.ts` is the single place the engine address is spelled. Five samples:

| Test | Could it go red? |
|---|---|
| `b64/anon-doors-closed.test.ts:67` | Yes. It reads the ACL through `has_function_privilege` and checks it against a fixed expected set. |
| `b64/goal-not-intent.test.ts:45-59` | Yes. It inserts against a literal of 3,000 characters and expects `intents_text_check` to reject the empty and over-long cases. |
| `phase3/db-guard.test.ts:15` | Yes, but it covers only the env guard, not the schema. |
| `phase3/registry.test.ts:88,145` | Weakly. `>=2` audits and `>=400` tokens are counted over the whole table, so rows left by earlier runs could keep them green. Line 146's `toBeCloseTo(0.04)` instead fails if earlier rows remain. |
| `c9/proactive-briefing.test.ts:302-311` | Only if a column disappears; it checks value types, not values. Line 324 compares the view's date with the server's own `now()`, which is not independent of what the view computes. |

NOT COVERED: column-level "written by nothing" analysis; the `pgboss` function and permission details; the 34 views (none read); `scripts/bootstrap/preamble.sql` (not opened); the PERMISSION_MODEL and SECURITY_MODEL specs; the company engine (54322, not touched, so every company-side figure is the board's, not mine); whether the 18 data-DELETE migrations were safe; the B84 and B82 row files beyond a keyword search.
