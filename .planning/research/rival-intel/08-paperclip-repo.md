# SOURCE 08 — `paperclipai/paperclip`: "the app people use to manage AI agents for work"

> ## ⛔ SCOPE CORRECTION — CEO ruling 2026-07-28, binding on this report
>
> **What was measured here is the RECORDING. What was NOT measured is the SYSTEM.**
> A frame-by-frame reading proves what a 15–100 second video showed. It proves nothing about what
> that system does when the camera is off, what it earns, how long it has run, or whether its
> owner is satisfied with it. **I have never used any of these systems.**
>
> The CEO knows several of these systems and their owners personally. His words, 2026-07-28:
> *"BEN O SİSTEMLERİ VİDEODAN DEĞİL, HEPSİNİ TANIYORUM — ARKADAŞLARIM — VE MİLYONLARCA DOLAR
> KAZANIYOR VE HEPSİ GERÇEK, HEPSİ CANLI."*
>
> **His testimony outranks this reading.** Every verdict below is therefore scoped to the
> recording, never to the company behind it, and where his account and this reading disagree,
> **his is the evidence and this is the guess.** Sentences that judged a system rather than a
> video were a RULE #0-A violation by the session author and have been corrected in place, with
> the correction recorded rather than quietly overwritten.


> The CEO's note on this row: **"BAK BAK İNCELE DE GÖR!!!!!"**
>
> He is right to shout. This is not an adjacent tool. **It is DXB Global OS, built by
> someone else, in the open, with 74,953 people watching.** Its own one-line pitch is
> *"If OpenClaw is an employee, Paperclip is the company."* Read that against our own
> charter — "a digital replica of a world-class tech company: departments, manager
> agents, specialist agents… running 24/7 with minimal human intervention" — and they
> are the same sentence.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://github.com/paperclipai/paperclip |
| Kind | Monorepo, TypeScript, MIT licence |
| On disk | `.planning/research/rival-intel/repos/paperclip` (112 MB, shallow clone) |
| **HEAD commit** | `77979950381a99271e4690c581a7440b73807b11` — `2026-07-27 21:47:05 -0700`, *"perf(plugin-daytona): opt-in no-profile fast path for default-PATH execs (#10352)"* |
| Age of that commit | **yesterday** — this is a live, fast-moving project |
| PR numbering | `#10352` — over ten thousand pull requests |
| Stars | 74,953 (measured 2026-07-28 via the GitHub API) |
| Stack | Node.js server + React UI, Postgres (embedded locally), Drizzle, pnpm workspaces, Vitest + Playwright |

**A note on how this differs from a video.** There are no frames to read here; there is
source code, which is stronger evidence than any reel. Section 2 therefore walks the four
UI screenshots the repo ships and then the schema, file by file. Every claim below is
either a screenshot I looked at or a path I opened.

---

## 2. Screen-by-screen and file-by-file record

### 2.1 `screenshots/PR-8000-home-flag-on.png` — their dashboard

The left rail, top to bottom, verbatim:

```
New Task · Dashboard · Inbox (2) · Conference Room
WORK      Tasks · Routines · Goals · Artifacts · Workspaces · Projects
AGENTS    CEO · CTO · CMO · DataAnalyst · Skill Consultant · See all agents
COMPANY   Org · Board
```

The main column, top to bottom:

| Band | What it holds |
|---|---|
| **AGENTS** | Four live run cards side by side. Each: agent avatar + name, "Finished 2d ago", the task title in a box (`PAP-50 — Rebase PAP-46-nux-tweaks onto origin/main and restart dev server`), then the run outcome in plain words — **`cancelled after 1 second`**, **`failed after 1 hour 5 minutes`**, **`succeeded`** with a clickable run-id chip (`2e7eeaa0`) and "1d ago". |
| **KPI row** | `23 Agents Enabled` (sub-line: *0 running, 21 paused, 0 errors*) · `0 Tasks In Progress` (*12 open, 4 blocked*) · `$0.00 Month Spend` (*Unlimited budget*) · `0 Pending Approvals` (*Awaiting board review*). Every headline number carries a second line that explains it. |
| **Charts** | Four charts, all "Last 14 days": Run Activity · Tasks by Priority (Critical/High/Medium/Low) · Tasks by Status (To Do/Done/Blocked/Cancelled) · Success Rate. |
| **Foot** | `RECENT ACTIVITY` and `RECENT TASKS` side by side. |

Note what this dashboard does **not** do: no arc reactor, no radar, no fake telemetry. Every
tile is a count of something real. It is the opposite aesthetic of source 01 and the same
honesty principle we are bound by.

### 2.2 `screenshots/PR-8000-conference-room-flag-on.png` — **the single most important screen in all 16 sources**

Two columns:

- **Left — the conversation.** Threaded chat with the `CEO` agent. Answers render full
  markdown (bullet lists, inline code chips like `OPENAI_API_KEY`, bold). Every message
  carries a hover row: copy · thumbs-up · thumbs-down · timestamp · overflow "…". The
  composer placeholder reads **"Ask anything about your company…"**.
- **Right — `Agent Feed`, subtitled "Live activity from your agents".** A running column of
  events, each with a coloured status dot, a type icon and a relative time:

```
Board updated PAP-51 Verify all NUX fea…            1d ago
Board moved to cancelled PAP-51 Verify …            1d ago
ClaudeCoder commented on PAP-50 Re…                 1d ago
ClaudeCoder moved to done PAP-50 Reb…               1d ago   ← green dot
ClaudeCoder moved to in progress PAP-49             1d ago   ← blue dot
ClaudeCoder opened PAP-51 Verify all N…             1d ago   ← amber dot
ClaudeCoder picked up PAP-49 Full dev …             1d ago
ClaudeCoder moved to in review PAP-49 F.            1d ago   ← purple dot
```

**This is the exact thing the CEO says we do not have:** he talks to the orchestrator in the
left column and *watches the company move* in the right column, in the same view, at the
same moment. Not a separate "live" page he has to go and find.

One thing they do that **we are forbidden to copy**: every feed row ends in a "…" cut. The
CEO banned that (ellipsis prohibition, 2026-07-18). We must deliver the same density without
truncation — shorten at the source, not with dots.

### 2.3 `screenshots/PR-8000-task-thread-flag-on.png` — a task, opened

Breadcrumb `Tasks › Onboarding v4: Fix adapter connection + step 5 validation error`; the
issue key `PAP-41`, a `Plan mode` chip, the project chip `Paperclip App`. The body is a full
document: **Problem**, **Root Cause** with real file/function names
(`OnboardingStep4ConnectAI.tsx`, `handleConnect()` uses `setTimeout(800ms)` to simulate
validation — no actual API call), then a `Show more`. Below: **Sub-tasks — 3/3 done, 0 in
progress, 0 blocked** with a full green bar and the label "All sub-tasks done".

The right panel is the governance surface: `Status Done` · `Priority High` · `Labels` ·
`Assignee ClaudeCoder` · `Project` · `Parent PAP-17` · **`Blocked by PAP-42, PAP-43`** ·
`Blocking` · **`Sub-tasks PAP-42 PAP-43 PAP-44`** · `Related Tasks` · `Reviewers` ·
`Approvers` · `Monitor: Not scheduled` · **`Workspace: View workspace`** · **`Branch:
PAP-17-onboarding-experimentation-v3`**.

A task here is not a row. It is a document, a dependency graph, an approval object, a git
branch and a workspace, in one object.

### 2.4 `screenshots/PAP-10535-live-run-menu-after.png` — the live run, controllable

The issue chat shows an agent mid-run: `CodexCoder` with a spinning **`RUNNING`** chip,
"Working · for 1139 hours 20 minutes · called 1 tool", the tool call itself, and the code it
is producing rendered inline. The overflow menu on a live message offers:

```
Copy message · Stop run · Stop and cancel · Stop and done · View run
```

The same file documents three composer states: **empty issue chat** ("No chat yet. The first
operator note will start the issue conversation."), **disabled composer** ("This issue is in
review. Request changes or approve it from the review controls."), and **planning mode**
(amber composer with a `Planning` chip that stages a submission without changing the issue
mode). A queued human message shows `QUEUED` with `Interrupt` and `Cancel` buttons, and an
`@QAChecker` mention routes work to another agent from inside the thread.

### 2.5 `screenshots/PAP-9841-workspace-diff.png` — reviewing the work

`EXECUTION WORKSPACE · PAP-9825-retry-shouldn-t-use-the-cheap-model-to-_do-the-work`, tabs
`Issues · Services · Changes · Configuration · Runtime logs · Routines`, a `Start` button,
and a real diff viewer: `16 files +502 / −74`, base ref, `Split | Unified | Working tree |
Against ref`. The CEO reviews the agent's actual diff without leaving the product.

### 2.6 The schema — 109 tables, read by name

`packages/db/src/schema/` holds **109 table files**. Grouped:

| Group | Tables (selected, exact filenames) |
|---|---|
| Org & identity | `companies`, `agents`, `agent_memberships`, `company_memberships`, `instance_user_roles`, `invites`, `join_requests`, `principal_permission_grants`, `agent_api_keys`, `board_api_keys`, `cli_auth_challenges` |
| Work | `issues`, `issue_relations`, `issue_labels`, `issue_comments`, `issue_documents`, `issue_attachments`, `issue_work_products`, `issue_read_states`, `issue_inbox_archives`, `issue_plan_decompositions`, `issue_tree_holds`, `issue_create_idempotency_keys` |
| Execution | `heartbeat_runs`, `heartbeat_run_events`, `heartbeat_run_watchdog_decisions`, `agent_wakeup_requests`, `agent_task_sessions`, `agent_runtime_state`, `execution_workspaces`, `workspace_operations`, `workspace_runtime_services`, `environments`, `environment_leases` |
| Governance | `approvals`, `approval_comments`, `issue_approvals`, `issue_execution_decisions`, `agent_config_revisions`, `activity_log`, `issue_recovery_actions`, `issue_watchdogs` |
| Money | `budget_policies`, `budget_incidents`, `cost_events`, `finance_events` |
| Goals | `goals`, `project_goals` |
| Knowledge | `documents`, `document_revisions`, `document_annotation_threads`, `document_annotation_comments`, `document_annotation_anchor_snapshots`, `company_skills`, `company_skill_policies`, `decision_training_examples` |
| Secrets | `company_secrets`, `company_secret_versions`, `company_secret_bindings`, `company_secret_provider_configs`, `secret_access_events`, `user_secret_definitions`, `user_secret_declarations` |
| Extensibility | `plugins`, `plugin_jobs`, `plugin_state`, `plugin_entities`, `plugin_database`, `plugin_webhooks`, `plugin_logs`, `plugin_managed_resources`, `plugin_company_settings` |
| Pipelines | `pipelines`, `pipeline_cases`, `pipeline_case_events`, `cases` |

**`goals`** — `id, companyId, title, description, level ('task' default), status ('planned'),
parentId → goals.id, ownerAgentId → agents.id`. A **self-referencing goal tree** with an
owning agent per node. That is how "every task traces back to the company mission" is
actually implemented: `company → team → agent → task` is one recursive table.

**`heartbeat_runs`** — the most instructive file in the repo. Beyond the obvious
(`status`, `startedAt`, `finishedAt`, `error`, `exitCode`, `usageJson`, `resultJson`):

- `sessionIdBefore` / `sessionIdAfter` — the agent **resumes its own session** across wake-ups
  instead of restarting cold. This is their "persistent agent state" claim, in a column.
- `processPid`, `processGroupId`, `processStartedAt` — the OS process is owned, so it can be
  killed cleanly.
- `lastOutputAt`, `lastOutputSeq`, `lastOutputStream`, `lastOutputBytes` — **liveness by
  output**, which is how a hung run is detected without guessing.
- `retryOfRunId`, `processLossRetryCount`, `scheduledRetryAt`, `scheduledRetryAttempt`,
  `scheduledRetryReason` — retries carry lineage and a stated reason.
- `logStore`, `logRef`, `logBytes`, `logCompressed`, `stdoutExcerpt`, `stderrExcerpt` — logs
  live outside the row, with an excerpt inline for the UI.
- `invocationSource` ('on_demand' default), `triggerDetail`, `responsibleUserId` — every run
  knows **why** it woke and **who** is answerable for it.

### 2.7 Scale, measured

| Metric | Paperclip | DXB Global OS |
|---|---|---|
| TypeScript files (`server` + `packages` / `apps` + `packages`) | **1,579** | **414** |
| Tables | **109** | **60** (+ 34 views) |
| Stars | 74,953 | — (private) |
| Latest commit | 2026-07-27 | 2026-07-28 |

---

## 3. Capabilities

| ID | Capability | What the repo proves |
|---|---|---|
| **CAP-08-A** | **Conference Room** — CEO chat and a live company feed **in one view** | `PR-8000-conference-room-flag-on.png`: left column conversation, right column "Agent Feed — Live activity from your agents" with per-event dots, actors and relative times |
| **CAP-08-B** | **Run cards on the home screen** | Four cards, each naming the agent, the task, the outcome in words, the duration and a clickable run id |
| **CAP-08-C** | **Every headline number explains itself** | `23 Agents Enabled` → *0 running, 21 paused, 0 errors*; `$0.00 Month Spend` → *Unlimited budget* |
| **CAP-08-D** | **A goal tree, not a goal list** | `goals.parentId → goals.id` + `ownerAgentId`; `project_goals` links projects in |
| **CAP-08-E** | **Heartbeats** — agents wake on a schedule, on assignment, on @-mention | `agent_wakeup_requests`, `routines` (cron/webhook/API triggers, concurrency + catch-up policies), `invocationSource`/`triggerDetail` on every run |
| **CAP-08-F** | **Session continuity across wake-ups** | `sessionIdBefore` / `sessionIdAfter` on `heartbeat_runs` |
| **CAP-08-G** | **Hang detection by output, and retry with a reason** | `lastOutputAt/Seq/Stream/Bytes`, `heartbeat_run_watchdog_decisions`, `scheduledRetryReason`, `processLossRetryCount` |
| **CAP-08-H** | **Atomic task checkout** | README: *"Task checkout and budget enforcement are atomic, so no double-work and no runaway spend"*; `issue_create_idempotency_keys`, execution locks |
| **CAP-08-I** | **Budget hard-stop that pauses agents** | `budget_policies`, `budget_incidents`, `cost_events` scoped by company/agent/project/goal/issue/provider/model |
| **CAP-08-J** | **A task is a document + a dependency graph + a branch + a workspace** | Task screenshot: Problem/Root Cause body, Blocked-by, Blocking, Sub-tasks, Related, Reviewers, Approvers, Workspace, Branch |
| **CAP-08-K** | **The live run is controllable from the thread** | `Stop run · Stop and cancel · Stop and done · View run`, plus `QUEUED / Interrupt / Cancel` on a queued human message |
| **CAP-08-L** | **Composer states carry the governance state** | empty · disabled-in-review · planning-mode (amber, staged submission) |
| **CAP-08-M** | **Diff review inside the product** | `Changes` tab, `16 files +502 / −74`, split/unified/working-tree/against-ref |
| **CAP-08-N** | **Skills as first-class org assets** | `skills/` (Skill Studio, shared org-wide skills), `company_skills`, `company_skill_policies`, `decision_training_examples` |
| **CAP-08-O** | **Plugin system with out-of-process workers** | nine `plugin_*` tables, capability-gated host services, UI contributions |
| **CAP-08-P** | **Company portability** | export/import a whole org — agents, skills, projects, routines, issues — with secret scrubbing |
| **CAP-08-Q** | **Multi-company isolation on one deployment** | every entity company-scoped; separate data and audit trails |
| **CAP-08-R** | **Scoped secrets that stay out of prompts** | seven secret tables + `secret_access_events`; "sensitive values stay out of prompts unless a scoped run explicitly needs them" |
| **CAP-08-S** | **Mobile** | "Monitor and manage your autonomous businesses from anywhere" |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-08-A** Conference Room | **NO — and this is the CEO's loudest complaint** | Chat lives at `(command)/chat`; live activity lives at a different route, `(command)/live` (`apps/dashboard/src/app/(command)/` — 15 route folders). They are two places. The rival puts them in one. |
| **CAP-08-B** run cards | **PARTIAL** | `agent_runs` exists and today's 9 runs are queryable, but no home-screen card names agent + task + outcome + duration + run id. |
| **CAP-08-C** self-explaining numbers | **PARTIAL** | Not measured surface-by-surface here; recorded as an open check rather than claimed either way. |
| **CAP-08-D** goal tree | **PARTIAL — flat, not a tree** | `public.objectives` has `title, amount_eur, metric, period, revenue_floor_eur, min_gross_margin_pct, cash_floor_eur, capital_limit_eur, risk_limit_eur, max_loss_eur, status, proposed_by, evidence_refs, boundaries_ack` — **richer than theirs on money and boundaries, with no parent link at all.** `v_objective_progress` computes target/realized/gap/days_left/run_rate/net_unverified. Two rows exist: `€50 net` (draft) and `e2e door proof` (closed), both realized €0. |
| **CAP-08-E** heartbeats | **HAVE** | pg-boss scheduler runs as a resident systemd service; `v_morning_briefing` fires on the 07:00 leg (U37). |
| **CAP-08-F** session continuity | **PARTIAL** | Chat threading exists (12-hour idle window, `chat_sessions`); whether an *agent run* resumes its own session across wake-ups is not established and is not claimed. |
| **CAP-08-G** hang detection | **NO evidence found** | Nothing measured corresponds to `lastOutputAt`-style liveness or a watchdog decision record. |
| **CAP-08-H** atomic checkout | **PARTIAL** | An `Idempotency-Key` requirement exists on the org seam (recorded 2026-07-24). Execution locking is not measured here. |
| **CAP-08-I** budget hard-stop | **HAVE** | Cost Monitor with 70 % alert and 100 % hard-stop is a charter constraint; LiteLLM virtual keys per department. |
| **CAP-08-J** rich task object | **PARTIAL** | `tasks` + `task_events` exist and drive the briefing; blockers/sub-tasks/reviewers/approvers/branch/workspace as first-class fields are not measured. |
| **CAP-08-K** controllable live run | **NO** | Nothing measured lets the CEO stop, cancel or finish a running agent from the thread. |
| **CAP-08-L** composer states | **NO** | And worse — measured this session: `apps/dashboard/src/components/chat/chat-board.tsx:285-297`, the "send as task" dispatch has **no `else` branch**; a failed dispatch tells the CEO nothing. Silent failure, same class as the fault that killed chat on 2026-07-26. |
| **CAP-08-M** diff review | **NO** | Not present on any command route. |
| **CAP-08-N** skills as assets | **HAVE** | `std.knowledge_shelf` is live (R4.2), 199 personas file-first with DB mirror. |
| **CAP-08-O** plugins | **PARTIAL** | 8 DXB MCP servers over a shared schema; no out-of-process plugin host with UI contributions. |
| **CAP-08-P/Q** portability, multi-company | **NO** | Single company by design today. Note the charter *does* foresee it: Outleteuro was specified as a spawned sub-OS company (deferred, U19). |
| **CAP-08-R** scoped secrets | **HAVE** | Vault/.env only, least-privilege MCP profiles per department, no plaintext credentials in repo or prompts. |
| **CAP-08-S** mobile | **NO** | Not measured on any route. |

---

## 5. The build project

Nothing here is installed from npm — Paperclip is MIT-licensed but adopting it would mean
**replacing** DXB Global OS with someone else's control plane, throwing away 199 personas,
the Islamic boundary rules, the Turkish/English dual surface, the approvals doctrine and
every governance rule the CEO has written since 2026-07-06. That is not on the table. What is
on the table is **taking their engineering, not their product.**

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P08-1** | **The Conference Room** (CAP-08-A) — *highest value in all 16 sources so far* | Merge `(command)/chat` and `(command)/live` into one screen: conversation on the left, a live company feed on the right (actor · verb · object · time · status dot), streaming over Supabase Broadcast. No "…" anywhere — shorten at the source. | `CEO_COMMAND_CENTER_SPEC` | The CEO speaks to Hamza and sees a real task move in the same view, in both locales, at ≥2 widths, `scrollWidth === clientWidth` (RULE #0). |
| **P08-2** | **Kill the silent dispatch** (CAP-08-L) | `chat-board.tsx:285-297` gets its failure branch: a failed `/api/intent` call says so, in the CEO's language, with what to do next. | `CEO_COMMAND_CENTER_SPEC` | A forced-failure test asserts the visible error; the button can never fail silently again. |
| **P08-3** | **Run cards with outcomes in words** (CAP-08-B, -C) | Overview band: per agent — name, task, outcome in plain words ("failed after 1 hour 5 minutes"), duration, cost, and a link to the run. Every headline number gets its explaining sub-line. | `CEO_COMMAND_CENTER_SPEC` | Cards render from `agent_runs`/`tasks` with zero invented values and an honest empty state. |
| **P08-4** | **The goal tree** (CAP-08-D) | Add `parent_id` (self-reference) and `owner_agent_id` to `objectives`, so a task can name the goal it serves and the goal can name its parent. Keep our money and boundary columns — they are ahead of theirs. Surface the ancestry on the task and in Hamza's answers ("this serves X"). | `REVENUE` / objectives spec + migration | A task shows its goal ancestry; `v_objective_progress` rolls a child's realised amount into its parent. |
| **P08-5** | **Liveness and recovery for runs** (CAP-08-F, -G) | Add to the run record: `last_output_at`, output sequence, owning pid/process group, retry lineage and a stated retry reason; a watchdog that decides on silence instead of guessing. | `ORCHESTRATOR` spec | A deliberately hung run is detected by silence, recorded with a reason, and recovered — shown as command → output. |
| **P08-6** | **Control the live run from the thread** (CAP-08-K) | `Stop`, `Stop and cancel`, `Stop and done`, `View run` on a running task, plus `Interrupt`/`Cancel` on a queued CEO message. | `CEO_COMMAND_CENTER_SPEC` + `ORCHESTRATOR` | The CEO stops a real run from the chat and the run record shows who stopped it and when. |
| **P08-7** | **Task as a document** (CAP-08-J) | Blockers, sub-tasks with a done/in-progress/blocked bar, reviewers, approvers, and the produced artefact on the task object — so "ready for your review" points at something. | `ORCHESTRATOR` / tasks spec | A real task shows a blocker, a sub-task roll-up and a reviewable artefact. |
| **P08-8** | **Read their answers where they are ahead** (no code) | `doc/execution-semantics.md`, `doc/DATABASE.md`, `doc/MCP-ACCESS-GOVERNANCE.md`, `doc/memory-landscape.md` are on disk. Mine them for the specific traps they already hit. | `CAPABILITY_ARSENAL_DOCTRINE` | Each lesson lands as a row in `INTEGRATION-TRACKER.md` pointing at the file and line. |

---

## 6. Verdict

**`daha iyisi` — but only after we admit where we are behind, and we are behind in one
specific, nameable way.**

- **They are ahead on operations.** 109 tables to our 60, 1,579 source files to our 414, and
  a run record that knows its own pid, its own last byte of output, and why it was retried.
  Ten thousand pull requests of hardening. Pretending otherwise would be the exact
  dishonesty the CEO is angry about.
- **They are ahead on one screen that decides the whole feeling of the product**: the
  Conference Room, where the conversation and the living company sit side by side. That
  single layout is the answer to *"canlı Hamza yok"* and *"her panelin canlı olduğu yaşayan
  bir holding"*. It is the highest-value thing found so far in the C42 programme.
- **We are ahead on what a company actually needs to be trusted with money**: their goal is a
  title and a status; ours carries `capital_limit_eur`, `risk_limit_eur`, `max_loss_eur`,
  `cash_floor_eur`, `min_gross_margin_pct`, `evidence_refs` and `boundaries_ack`, and a
  progress view that flags `net_unverified`. Their dashboard says `$0.00 Month Spend ·
  Unlimited budget`. Ours may never say "unlimited".
- **We are ahead on identity**: 199 written personas, a named orchestrator with a character,
  two languages held pure, and Islamic boundaries as constitutional limits. Paperclip has
  `CEO / CTO / CMO / DataAnalyst` — four job titles and no people.

The right move is not to adopt Paperclip and not to ignore it. It is to **steal its
engineering and beat its product**: their Conference Room, their run liveness, their goal
tree — inside our governance, our language discipline, and our rule that no panel may ever
show a number it cannot prove.
