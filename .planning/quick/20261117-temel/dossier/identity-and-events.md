<!-- B85 structural read · identity, authorization and events · an Opus 5.5 helper at high, 2026-11-17 · asked: is this foundation built right. Section C is the helper's reading; the lead decides.
     Checked by the lead at the source the same evening, eight claims, all held: fn_org_actor answers 'ceo' for any session with auth.uid() and 'system' for postgres or service_role (20261014030000:38-48); decide_approvals stamps decided_by='ceo' with no caller check; production code sets request.jwt.claims to a fixed sub (hook/knowledge-shelf.ts:18,36); queue_transition's ownership guard compares a caller-supplied actor (dxb-mcp queue.ts:497); the lifecycle map allows awaiting_approval -> done (transitions.ts:9); every DXB_* variable passes into an agent's child (sdk-isolation.ts:130); the intents INSERT policy checks values the caller supplies; transition() has no transaction (worker-shim.ts:788-812). Catalogue counts and the realtime findings were not re-measured by the lead. -->

# IDENTITY, AUTHORIZATION AND EVENTS: structural read (B85)

## A. Who acts, and as whom

**A1. Logins and who uses them**

On the construction engine (54422) there are 18 roles. None of them belongs to an agent or to a single service (`pg_roles`, measured). `postgres` owns all 62 public tables and has `rolbypassrls=t`.

| Runner | Login | Evidence |
|---|---|---|
| dxb-scheduler, dxb-jarvis | `DXB_DATABASE_URL` mapped from `DXB_COMPANY_DATABASE_URL` after sourcing `.env`, `.env.local` and `.env.daemon` with `set -a` | `dxb-scheduler.service:17`, `dxb-jarvis.service:16`. The installer's template is `postgres:postgres@…:54322` (`install.sh:29`). The live role is UNVERIFIED because `.env.daemon` was not read. |
| Dashboard pages | publishable key plus the user's JWT, which runs as `authenticated` | `lib/supabase/server.ts`, `client.ts` |
| Dashboard server process | also holds the daemon URL, whole `.env` sourced | `scripts/dashboard.sh:50-53`. Used by `api/voice/call/route.ts:53` (`getDb()`). |
| Tests | `postgres` (fixed local credential) | `tests/construction-engine.ts:33-34` |
| Seed | whatever `DXB_DATABASE_URL` holds; no default | `build-seed.ts:61-64` |
| dxb-mcp | `getDb()`, so the daemon URL it inherits | `sdk-isolation.ts:130` passes every `DXB_*` variable to the SDK child. Inheritance by the stdio server is inferred: the profiles carry no `env` (`finance.mcp.json`). |
| Company read gateway | `dxb_gateway`, SELECT-only, sealed at the server | `company-read-gateway.mjs:45`, `withdraw-company-login.mjs:3-11` |

**A2. How "this is the CEO" is decided**

- **Dashboard.** `proxy.ts:39-50`: any Supabase user passes the wall, at aal2 unless `NEXT_PUBLIC_DXB_MFA_ENFORCED=false`. Nothing compares the user with a CEO identity. Construction has 1 `auth.users` row.
- **SQL.** `fn_org_actor` (`20261014030000:38-48`) has three outcomes: `ceo` if `auth.uid()` is set, `system` if the role is postgres or service_role, NULL otherwise. 27 of the 39 `control_*` functions use it, and 30 are executable by `authenticated` (catalogue). `control_approvals_action` uses `WHEN auth.uid() IS NOT NULL THEN 'ceo'`. `decide_approvals` checks nothing: it stamps `decided_by='ceo'` (`20260724006000:36`) and `authenticated` may execute it. This is the B73 class.
- **RLS.** 56 policies are `SELECT … USING (true)` for `authenticated`. The single INSERT policy checks column values the caller supplies itself: `source='dashboard' AND actor='ceo'` (`20260710000016_intents_intake.sql:37`).
- **CEO identity can be forged.** Any holder of the daemon login becomes `ceo` by setting a GUC. Production code does this: `packages/hook/src/knowledge-shelf.ts:18,36` sets `request.jwt.claims` to a fixed sub and then calls `control_library_action`. `scripts/library/ceo-action.mjs:17` does the same.
- **Verdict.** There is no principal model the database enforces. Authority is assumed from "has a session" or "is postgres", and the actor is a free-text column (`events.ts:48`: "free actor slug").

**A3. How an agent's authority is bounded**

- **What does bound it.** An agent has no SQL access. It holds only the dxb-mcp tools in its compiled profile (`runtime-profile.ts:133-160`, `strictMcpConfig`, `disallowedTools`) and no built-in tools (`worker-shim.ts:445`). It cannot call `control_*` directly.
- **What does not.** The MCP tools take their identity as parameters:
  - `queue_transition` accepts `actor`, and its only ownership guard is `actor !== claimed_by` (`queue.ts:497`). The agent can pass the holder's name.
  - The lifecycle map allows `awaiting_approval → done` (`transitions.ts:9`), so a seat can close a task that is waiting for the CEO while the approval row stays pending.
  - `approval_submit_draft` records `actor: task_id`, and the agent chooses `action_type` and `risk_class` itself (`approval.ts:35-49`).
  - `registry_activate` and `registry_create_department` write the tables directly as `registry/system`, bypassing `fn_org_actor` (`registry.ts:44-110`). The persona trigger still guards agents; nothing guards departments.
  - 27 profiles grant these tools. Only prompt text forbids their use (`worker-shim.ts:314-319`).
- **Data isolation between departments and agents.** None structurally. All tools read through one login, and RLS does not apply to it.

**A4. Where credentials sit**

- One process, `dxb-scheduler`, hosts the outbox `tick`, the task lanes, chat, voice and the ops-live collector (`scheduler.ts:29-42`). It sources the whole `.env` set. Outbox handlers therefore do not hold credentials exclusively.
- The env allowlist passes every `DXB_*` variable into each agent's CLI child (`sdk-isolation.ts:130,146`). That includes `DXB_DATABASE_URL`, every `DXB_LITELLM_KEY_<DEPT>` (`litellm.ts:86-92`) and `DXB_STAGING_MAIL_URL`.
- Mitigations today: agents have no Bash or Read outside plugin folders, and no money handler exists (`actions/`: `email-send-staging`, `test-write-file`). Which outward or money keys `.env` holds is UNVERIFIED (not read).

**A5. Sound, keep**

- One DB access path (`db.ts:1-3`).
- The engine wall between company and construction, and the server-sealed `dxb_gateway` window (`company-one-way-window.sql`).
- The renamed company URL variable (`install.sh:16-27`).
- The company Claude home and env allowlist idea (`sdk-isolation.ts`).
- Compiled per-seat tool profiles.
- The SQL trigger path from approval to outbox (`trg_approval_guard`, `trg_outbox_enqueue`, allowlist `20260726011000:26`).
- MFA enforced by default.
- `v_actor IS NULL` refusals for anon (`20261014030000`).

## B. What the system tells

**B1. Mechanisms**

| Mechanism | Writer | Reader | Guarantees |
|---|---|---|---|
| `task_events` (bigint identity) | App code; MCP; `reap_expired_leases` | `escalate.ts:12-16` (fail_count), dashboard, `queue_sheet_times` | Durable. Ordered by id, which follows insert order, not commit order. Not complete (B2). Deletable by `control_records_purge`, which deletes `task_events`, `cost_ledger`, `tool_calls`, `agent_runs` and `approvals` (live body). `authenticated` may execute it. This contradicts "UPDATE/DELETE revoked" (`escalate.ts:12`). |
| `audit_log`, `decision_log`, `cost_ledger`, `tool_calls` | App code and SQL functions | Dashboard | Durable. "Append-only" is not enforced on `postgres`: no trigger, and UPDATE/DELETE is held by postgres. |
| `pg_notify('dxb_ops_live')` | Only `fn_opslive_notify`, from 3 opslive triggers | `ops-live-collector.ts:191`, inside the scheduler | Transactional, delivered at commit. Not durable: lost when no listener is attached. The scheduler is `inactive` now (`systemctl --user is-active`). Receipts are pruned after 1 h (`:93`). |
| Realtime broadcast (`realtime.messages`, daily partitions) | 10 triggers, plus `notify_broadcast` inside functions (org 19, settings 22, revenue 19, ops 4, projects 4, voice 3, alerts 2, finance 2, ops:live 1) | `apps/dashboard/src/lib/realtime.ts:236` (private `dxb:*`) | At most once. No replay; reconnect re-fetches a snapshot. |
| `postgres_changes` | None: the `supabase_realtime` publication holds 0 tables | — | — |
| `var/scheduler.log` | Lane and hands state only (dossier: `scheduler.ts:644-651`) | Humans | Not queryable. |

**B2. Source of truth**

State tables are the truth. Events are a side effect, by the spec's own design (`EVENT_MODEL.md:8,87`). Three cases where state and event diverge:

1. `decide_approvals` moves a task to `done` or `returned` (`20260724006000:42-47`) and writes no `task_events` row (catalogue check: `writes_event=f`). The CEO's most important transition is missing from the task trail.
2. `claim_next_task` flips the task with no event. The caller writes `claimed` in a separate autocommit statement (`worker-shim.ts:819-835`), and `transition()` runs UPDATE then INSERT with no transaction (`:788-812`). A crash between the two leaves a state change with no event, which skews `fail_count`.
3. Alert assign and mute change state without an event (`20260713080000_e84b_alerts.sql:118`).

**B3. Against EVENT_MODEL.md**

Kept:
- G1, Broadcast only: the publication holds 0 tables.
- G2 on ops:live: a receipt in the same transaction, verified and consumed by the collector.
- §14: a broadcast failure never blocks the write (`EXCEPTION WHEN OTHERS` in the opslive and alerts triggers).

Not kept:
- §9b's closed catalogue. SQL emits on `revenue`, `finance`, `ops` and `voice`, which are absent from `DXB_CHANNELS` (`events.ts:9-18`). `system` and `cost` have no emitter.
- §9a's single envelope and §16's "no full content". Four triggers use `realtime.broadcast_changes` with whole NEW/OLD rows; chat bodies go out in full on `dxb:chat`.
- §9a's actor `employee:<id>` and §13's "CEO only". The actor is free text, and the realtime policy admits any `authenticated` user on `dxb:%`.

**B4. Sound, keep**

- The ops:live receipt door (`fn_opslive_notify` plus `dxb_internal.ops_live_issued`), which refuses forged notifications.
- Transactional NOTIFY.
- The Zod envelope (`contracts/events.ts`).
- Private channels behind a realtime RLS policy.
- The listener's `end` contract (`db.ts`, B38).
- The snapshot-on-reconnect rule.

## C. Reading (the lead decides)

**A: redraw the principal model, keep the walls listed in A5.**
1. The database knows no principal. "CEO" means "any session" or "a GUC set by postgres", and production code forges it (`knowledge-shelf.ts:36`).
2. Agent identity is a parameter the agent types, over one RLS-exempt login. A seat can close an approval-waiting task and activate departments. Only prompt text stops it.
3. One process and one env hold every credential, and the `DXB_*` prefix carries the DB URL and every department key into agent children. B71 and B73 patch symptoms of this.

**B: repairable, not redrawn.**
1. The spec's two-layer design (state as truth, broadcast derived, snapshot on reconnect) is coherent, and its strongest part (receipts) is built well.
2. The defects are local and finite: status and event written outside one transaction, SQL doors that skip `task_events`, purgeable "append-only" logs, channel sprawl, two envelope dialects. A trigger on `tasks.status` that writes the event, plus a narrowed purge, closes most of them.
3. Caveat: if the target design wants replayable history ("motion is state", B64 job records), the missing piece is a durable, transactional event row per state change. That is an addition on the same tables, not a redraw. It becomes a redraw only if the lead chooses event sourcing.

NOT COVERED: the company engine's actual daemon role and `.env` variable names (secrets not opened); Hermes's credentials (B10); `scripts/bootstrap/preamble.sql`; PERMISSION_MODEL and SECURITY_MODEL specs; whether the Claude CLI really passes its env to stdio MCP servers (inferred, not measured); the realtime partition retention setting; the dashboard's 35 `.rpc(` call sites; the bodies of the 34 views.
