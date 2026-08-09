# Source 08 — `paperclipai/paperclip` — "the open-source app everyone uses to manage agents at work"

> **Written from nothing on 2026-08-08.** The CEO marked this source *"BAK BAK İNCELE DE GÖR!!!!!"* —
> five exclamation marks, the only source on the queue that got them. Bound by **ledger law 7** (a
> rival is judged by what it PRODUCES) and by the C42 standing order that is the reason this file
> exists: watch, report, **then build the same capability or better.** Section 5 is the deliverable.

---

## 1. Source identity

| Field | Measured value, this session |
|---|---|
| Address | `https://github.com/paperclipai/paperclip` |
| Licence | **MIT** |
| Homepage | `https://paperclip.ing` |
| Clone on disk | `repos/paperclip` — 112 MB |
| **Clone HEAD when this reading started** | `7797995` — **2026-07-27**, i.e. **12 days stale** |
| **Clone HEAD it was brought to, and read at** | **`19be4cf9278b70bc151063778a94bf38bfd5c903`** — `refactor(a11y): add scope=col to the agent costs table headers (#1789)`, **2026-08-08 08:46 +0700** |
| Stars | **75,865** |
| Forks | **14,124** |
| Open issues | **5,062** |
| Watchers | 375 |
| Contributors | **~166** |
| Commits in the last 30 days | **~529** — about eighteen a day |
| Releases | `v2026.722.0` (2026-07-22) · `v2026.720.0` (2026-07-20) · `v2026.707.0` (2026-07-07) — three in three weeks |
| Created | 2026-03-02 |
| **Last push** | **2026-08-08 08:11:55 UTC — roughly two hours before this reading** |
| Archived / disabled | no / no |

The CEO's own note on this row records **74,953 stars**. Measured today: **75,865** — it gained ~900
in the days between his note and this reading. The repository is not a snapshot; it moves while you
read it, which is why the stale clone was brought forward before anything was judged.

### How it was read — stated exactly

Not by grepping for adjectives. `git fetch --depth=1 origin HEAD` to the live commit, then:
**214 SQL migration files** counted, **172 unique `CREATE TABLE` names** extracted by command from
those migrations, and the four schema files that carry the mechanisms below **read line by line** in
`packages/db/src/schema/`. Every field quoted in section 3 is copied from the file, not summarised.
`paperclip.ing` was fetched to answer one question only: does this earn money.

---

## 2. What the repository contains — the reading record

| What was opened | What it holds |
|---|---|
| `packages/` | `adapters`, `adapter-utils`, `db`, `google-sheets-mcp-server`, `kv-demo-mcp-server`, `mcp-server`, `plugins`, `shared`, `skills-catalog`, `teams-catalog` |
| migrations | **214 `.sql` files**, producing **172 distinct tables** |
| the decision cluster | `decisions`, `decision_bundles`, `decision_queues`, `decision_queue_items`, `decision_triage`, `decision_triage_events`, `decision_effect_executions`, `decision_target_issues`, `decision_training_examples`, `decision_retention`, `decision_archive_notification_outbox` — **eleven tables for one idea** |
| the liveness cluster | `issue_watchdogs`, `heartbeat_runs`, `heartbeat_run_events`, `heartbeat_run_watchdog_decisions`, `issue_recovery_actions`, `execution_workspaces`, `workspace_operations`, `environment_leases` |
| the money cluster | `budget_policies`, `budget_incidents`, `cost_events`, `finance_events` |
| the tool cluster | ~25 tables: `tool_gateway_sessions`, `tool_profiles`, `tool_profile_bindings`, `tool_policies`, `tool_access_audit_events`, `tool_invocations`, `tool_call_events`, `tool_rate_limit_counters`, `tool_mcp_gateways`, `tool_oauth_states`, `tool_connections`, `tool_runtime_slots`, … |
| the skills cluster | `company_skills`, `company_skill_versions`, `company_skill_policies`, `company_skill_test_runs`, `company_skill_test_inputs`, `company_skill_test_run_templates`, `company_skill_comments`, `company_skill_stars` |
| `schema/decisions.ts` | read in full — quoted below |
| `schema/issue_watchdogs.ts` | read in full — quoted below |
| `schema/budget_policies.ts` | read in full — quoted below |
| `schema/decision_queues.ts` | read in full |
| `paperclip.ing` | fetched: MIT, `npx paperclipai onboard --yes`, self-hosted, **no prices anywhere**, a *"join the waitlist"* for a future cloud tier, testimonials from named individuals, **no customer count and no named company** |

---

## 3. Capabilities — what this system demonstrably has

### 08-C1 · A decision is a first-class object with a signature, a snapshot and a deadline — **R**

From `schema/decisions.ts`, verbatim fields:

```
title, body
options    jsonb  DecisionOption[]     — the choices offered
inputs     jsonb  DecisionInput[]      — fields the human fills in
status / executionStatus
chosenOptionId, inputValues, decidedByUserId, decidedAt
expiresAt          timestamptz NOT NULL   — every decision has a deadline
idempotencyKey     + unique index (company, idempotencyKey)
signedSpec         text NOT NULL          — a signed specification of what was approved
targetSnapshots    jsonb NOT NULL         — the world as it was when the question was asked
continuationPolicy text NOT NULL default 'none'
```

Three of those are the point. **`signedSpec` binds the act to the text the human read.**
**`targetSnapshots` records the world at the moment of asking, so a stale approval can be caught.**
**`idempotencyKey` with a unique index means the same question cannot be raised twice.**

### 08-C2 · Approved effects execute exactly once, one by one, with their result kept — **R**

`decision_effect_executions`: `(decisionId, effectIndex)` under a **unique index**, plus
`effectType`, `targetIssueId`, `status`, `result jsonb`, `error`, `activityLogId`, `executedAt`. An
effect cannot run twice, and every attempt leaves a row.

### 08-C3 · A watchdog that wakes on change, not on a timer — **R**

`schema/issue_watchdogs.ts`, verbatim:

```
watchdogAgentId, instructions, status default 'active'
lastObservedFingerprint     lastReviewedFingerprint
lastObservedStopSnapshot    lastReviewedStopSnapshot
lastTriggeredAt, lastCompletedAt, triggerCount
```

**The mechanism is the pair of fingerprints.** The watchdog agent is woken only when what it
observes differs from what it last reviewed. It does not poll, it does not nag, and it cannot
re-fire on unchanged work. A unique index binds one watchdog to one issue per company.

### 08-C4 · Budget caps attach to a scope, and the hard stop is the default — **R**

`schema/budget_policies.ts`, verbatim: `scopeType`, `scopeId`, `metric` default `billed_cents`,
`windowKind`, `amount`, `warnPercent` default **80**, **`hardStopEnabled` default `true`**,
`notifyEnabled` default true, unique per `(company, scopeType, scopeId, metric, windowKind)`. A cap
can therefore be attached to one agent, one project or one company, and stopping is what happens
unless someone turns it off. `budget_incidents` records each time it bit.

### 08-C5 · Skills are versioned, tested, policy-gated and rated — **R**

Eight tables. A skill has versions, a policy, test inputs, test runs, run templates, comments and
stars. A skill is treated as software, not as a text file.

### 08-C6 · A tool gateway with profiles, policies, rate limits and an audit trail — **R**

~25 tables covering sessions, profiles, bindings, policies, per-runtime slots, rate-limit counters,
OAuth state, and `tool_access_audit_events`.

### 08-C7 · Decisions produce training examples — **R**

`decision_training_examples`. Choices made by the human become material the system learns from. We
have nothing at all in this direction.

### What is **not** established

Whether any of it works well, how it behaves under load, or how much of the 172-table surface is
live versus half-built. **Unverified** — that would need it running, and the ruling below says we do
not run it. 5,062 open issues is a fact, not a verdict: at 166 contributors and ~18 commits a day it
is as consistent with a large healthy project as with a struggling one, and this report does not
guess which.

---

## 4. What DXB has today — measured by command, this session

**Where we already match them.** This is stated because the directive forbids inventing gaps as
firmly as it forbids hiding them.

| Mechanism | Theirs | Ours, measured |
|---|---|---|
| Exactly-once execution of an approved act | `decision_effect_executions` unique on `(decision, effectIndex)` | **`public.outbox.idempotency_key`** — the executor is keyed, with `attempts`, `last_error`, `executed_at`, `execution_result` |
| A hard budget stop | `budget_policies.hardStopEnabled` default true | **`public.budget_state.hard_stopped`** + `breaker_tripped`, `breaker_tripped_at`, `velocity_cap_eur_per_hour` |
| A rich approval record | `decisions.options` / `inputs` / `expiresAt` | **`public.approvals`** carries `deadline`, `alternatives`, `recommended_action`, `reasoning_summary`, `cost_estimate`, `operation_class`, `risk_class`, `affected_systems`, `affected_files`, `previous_reviews`, `decided_action`, `modifications`, `delegated_to` — **51 rows** |
| Rules that cannot be quietly loosened | — | **`public.approval_rules.locked`** |
| A record of why something was decided | `decision_training_examples` (they go further) | **`public.decision_log` — 4,730 rows** with `rationale`, `data_used`, `alternatives`, `confidence`, `risk`, `outcome` |
| A lease on claimed work | `environment_leases` | **`public.tasks.claimed_by`, `claimed_at`, `lease_expires_at`** |

**Where we are genuinely behind — each one measured, not assumed.**

| Gap | Evidence that it is a gap |
|---|---|
| **1. Nothing binds what he approved to what runs.** | A search of **every column in the database** for `signed`, `signature` or `snapshot` returns `workflow_runs.steps_snapshot` and nothing else. There is no signed spec on an approval. The act is executed from `approvals.payload`, and nothing proves that payload is the one he read |
| **2. No snapshot of the world at the moment of asking.** | Same search. An approval he answers tomorrow is executed against today's world with nothing checking the difference |
| **3. No continuation policy.** | No column anywhere states what the rest of the company does while he decides |
| **4. Nothing notices work that has gone quiet.** | No table matching `%watchdog%`, `%stall%`, `%stuck%`, `%heartbeat%` or `%recovery%` exists. `lease_expires_at` appears in exactly one place in our own source outside type files — `packages/orchestrator/src/escalate.ts:247`, where it is **cleared** on a task already marked `failed`. **Nothing ever reads it to find a task still marked `running` whose lease died.** (Measured live: `running` tasks with an expired lease = **0**. Nothing is stuck right now; the mechanism simply does not exist) |
| **5. The budget is one global row.** | `select count(*) from public.budget_state` = **1**, holding `monthly_cap_eur = 100.00`, `hard_stopped = false`, `breaker_tripped = false`. **One cap for the entire holding.** A single agent or a single project cannot be capped |

---

## 5. The build project — *"yaparım, yapılır"*

**Nothing below is built.** Implementation stops at his approval — his written directive of
2026-07-29 and the standing boundary in `.claude/CLAUDE.md`.

### P08-1 — The approval he signs is the act that runs · **the most important item on this queue so far**

| | |
|---|---|
| **What** | Two columns on `public.approvals`: **`signed_spec`** (a hash over the exact rendered text and payload he was shown, written when the approval is raised) and **`target_snapshot`** (the state the act depends on, captured at the same moment). The outbox executor **refuses to execute** if the payload it is about to send does not hash to `signed_spec`, or if the snapshot has drifted on a field the rule marks material — and writes the refusal instead of the act |
| **Why this one first** | This holding's entire product is *he states intent, and approves the acts that face outward.* Measured above: nothing in our database binds the two. Today an approval is a row and an execution is another row, and the only thing joining them is a foreign key. **If what executes can differ from what he read, his approval does not mean what it says** — and every other guarantee we have is downstream of that one |
| **Where it lands** | The spec that already owns the approval gate, plus `public.approvals` and `packages/outbox-executor`. **No new table, no new spec** |
| **Skills / plugins / tools to download and install** | **None.** Hashing and a jsonb column. I will not invent an install list where nothing needs installing |
| **Recurring cost** | Zero |
| **Done means** | An approval executed normally; then an approval whose payload is altered after he signs it, refused by the executor with the mismatch written to `outbox.last_error` — **both shown live in one session, red first** |

### P08-2 — A watchdog that wakes only when something changed

Take 08-C3 exactly: `last_observed_fingerprint` / `last_reviewed_fingerprint` over a run's state,
and a watchdog that fires only when they differ. Pointed first at the case we measurably cannot see
— a task still `running` whose `lease_expires_at` has passed. **This is the anti-babysitting
doctrine turned on the machine instead of the human:** it is the difference between a system that
tells him when something is wrong and a system that needs him to go and look. Scheduling needs no
new component — `pg-boss` already runs on our Postgres (`.planning/research/STACK.md`).
**Installs: none.**

### P08-3 — A budget cap that can name what it caps

Their shape: `(scope_type, scope_id, metric, window_kind, amount, warn_percent, hard_stop_enabled)`.
Ours: one row, €100 a month, for everything. We already own the hard-stop flag and the breaker; what
is missing is the scope. **Installs: none.**

### What is NOT taken, and why

- **Paperclip itself is not installed and not run.** The reason is architectural, not legal — the
  licence is MIT and would permit it. `.planning/research/STACK.md` and the standing boundary in
  `.claude/CLAUDE.md` forbid a second agent framework and a second job runtime; adopting it would
  mean running two operating systems and owning neither. **We take the mechanisms, in our own
  schema, in the specs that already own those contracts.**
- **The 172-table surface as an ambition.** Their eleven tables for decisions serve a product sold to
  many companies. We serve one holding and one human. Copying the count would be copying their
  problem.
- **`decision_training_examples`** — noted and deliberately deferred. Learning from his choices is
  worth having and is not worth having before P08-1, because there is no point learning from
  approvals whose execution is not yet bound to them.

---

## 6. Verdict

**The CEO's five exclamation marks were right. This is the one.** Of everything read on this queue,
this is the only source building the same kind of machine DXB is building, and it is unmistakably
alive: **75,865 stars, 14,124 forks, ~166 contributors, ~529 commits in the last thirty days, three
releases in three weeks, and a push roughly two hours before this reading.**

**What it produces, measured with its limits.** It produces *adoption and shipping cadence* at a
scale we do not have. **It does not visibly produce money:** `paperclip.ing` shows no price, no
tier, no checkout — an MIT self-hosted install (`npx paperclipai onboard --yes`) and a waitlist for
a cloud version that does not exist yet. Testimonials are from named individuals; there is no
customer count and no named company. **Whether it earns is Unverified**, and this report does not
turn that into a criticism — a project of this size with a cloud tier in front of it is a normal and
deliberate order of operations.

**Where they are ahead of us, stated plainly.** They keep work alive without a human standing over
it: a watchdog that wakes on change, recovery actions, execution workspaces, per-scope budgets that
stop by default, and a decision object that carries its own signature, snapshot, deadline and
continuation policy. Ours has none of those five things. They also ship at a rate one author cannot
match — eighteen commits a day across 166 people.

**Where we are level, and it is worth knowing:** exactly-once execution of an approved act, a hard
budget stop with a breaker, an approval record that already carries the deadline, the alternatives,
the recommendation and the reasoning, rules that are locked against quiet loosening, and 4,730 rows
of decision history.

**And the gap that decides this report:** not their table count. **It is that nothing in our system
binds the act that runs to the text he signed.** That is P08-1, it needs no download, it costs
nothing, and until it exists every approval in this holding is a promise rather than a guarantee.

**One thing measured here that appears nowhere in their 172 tables: a boundary.** `halal_screen`
refusing work with a stated reason, written into `task_events`, observed today. It is worth exactly
as much as the business it will one day protect — which is not yet any, and that is our problem, not
theirs.

**Row 08 is `reported`. Nothing is built, nothing is installed. <!-- OPEN: B22 --> P08-1, P08-2 and P08-3 wait on his
word.**
