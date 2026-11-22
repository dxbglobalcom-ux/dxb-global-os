# B85 — the foundation: target design and verdict table (the plan)

Read with the dossier (`dossier/` beside this file). Every "today" fact below is the dossier's unless a source is given; what is not
measured is marked UNVERIFIED and listed in §8.

## 0. The finding in one paragraph

The existing foundation has a sound physical base and a wrong logical one. Sound: one Postgres, a key on every table,
money in numeric, time with zone, checked vocabularies, the approval-to-outbox trigger core, the leased task claim, the
settings triad, the persona gate, the wall between the two engines. Wrong at the root, in three places that touch nearly
every table and every writer: **the holding has no shape in the data** (3 of 62 tables know a company, none knows a
client, keys are global); **nobody is anybody** (19 free-text actor columns, any signed-in session is "ceo", production
code forges the CEO's claim, every service is `postgres`); **the unit of work does not exist** (five partial groupings
and six queues, none of which is a job with its owner, client, company and money; the task law lives in TypeScript and is
already bypassed). On top of these: 13 model call sites and two routers, a gate whose rule table is consulted on one lane
only, an engine that polls and keeps truth in memory, state changes written apart from their events, and specs whose
base texts describe July.

Three root redraws that each touch most tables cannot be bolted on. The target is therefore drawn whole, small, and
built as a new chain beside the old one — the sound cores carried over as they are.

## 1. The eight decisions everything hangs on

1. **A new schema chain, by subject, beside the old one.** The old chain (188 files, data inside schema files, 113
   non-atomic, 30 functions redefined in place) is frozen. The new one is written from the target: schema files that
   are atomic, functions defined once each, reference data apart from schema, roles created by the chain. It is built in
   its own database inside the construction engine's cluster, so the old battery and the new tests both stay green
   until the key turns. The company database is not touched until the rehearsed data move (stage 5).
2. **Every business row knows its company and, where there is one, its client.** The holding itself is the root
   company. Staff, cupboards, the library and the settings are the holding's, shared; jobs, parts, runs, events,
   approvals, outward actions, money, clients, inbound messages, memory and projects carry `company_id NOT NULL`.
3. **Every act is done by a principal the database knows.** One `principals` table; the CEO is one row bound to one
   sign-in; each resident service has its own database login with no bypass and no table writes of its own; an agent
   acts only through a run the engine opened for it, and its identity is read from that run — never from a parameter
   the model types.
4. **The unit of work is the job with its desk.** One `jobs` table, its `parts` (one queue, one status vocabulary, one
   dependency table), its desk (the durable record a fresh session reads), its `runs` (one row per model session,
   Hamza's included). Intents, workflow runs, generated work and media jobs fold into it.
5. **State changes pass one door, and the door writes the event.** A status moves only through a database function
   that holds the law and writes the event row in the same transaction. Surfaces and the engine stand on that event
   trail; a notification only says "look".
6. **One door for each kind of act:** one model door (routing, call, error check, backup pair, run and cost record),
   one outward door (every act that leaves the holding or spends is requested, classified by the rule table, gated or
   not, executed by the outbox), one tool door (identity from the run), one memory door, one prompt assembler.
7. **The machine is code and wakes on events; a model runs only when there is work.** The engine listens, claims,
   starts a seat, records. Idle costs no token. Nothing that matters lives in memory; a restart loses nothing.
8. **A session is disposable; the desk is not.** Context stays small by structure: a small start, the desk as the
   single source of truth, long work as a chain of short sessions, a written handover when one grows. No clearing or
   compaction machinery of our own.

## 2. The target, part by part

### A. The database and its change discipline

- **Chain.** `db/schema/` — ordered files by subject (roles; holding and org; work; gate and outbox; records and money;
  memory; surface). `db/functions/` — one file per door function, re-applied on every run, so a function's body has one
  place. `db/reference/` — reference data as files (job types, approval rules, routing rules, the settings registry,
  event types), applied idempotently; no migration inserts a rule. The runner applies each schema file and its ledger
  row in one transaction.
- **It rebuilds.** One command builds an empty database to the full schema; a test rebuilds from nothing and compares
  with the committed snapshot; a second test proves a failed file leaves nothing behind.
- **Conventions kept:** uuid keys for entities, identity bigint for logs, numeric money, timestamptz, CHECKed text
  vocabularies, validated FKs with NO ACTION by default. Added: an index under every FK; no cascade out of a log or a
  dedupe record; every jsonb column that carries a contract gets a shape check or becomes columns; `updated_at` is
  maintained by trigger or the column goes.
- **Append-only is enforced for everyone.** Log tables refuse UPDATE and DELETE by trigger, the owner included.
  Retention is a door that archives under a CEO-only rule; approvals and the audit trail are never purged.
- **Roles** (created by the chain): an owner role with no login; `dxb_engine`, `dxb_outbox`, `dxb_voice` with EXECUTE
  on their doors only; the dashboard as `authenticated`; the read roles. No service runs as `postgres`; no role with
  RLS bypass serves at runtime.

### B. The holding's shape

`companies` (the holding as root, subsidiaries beneath it; currency and jurisdiction), `clients` (a company's), then the
shared org: `departments` (uuid key; a cupboard of specialists, checklists, examples and lessons — no head on a job's
path), `agents`, `personas`, the library, tools, settings. Slugs are unique inside their company, not globally. One
truth each: department membership in one place; the persona's text is its file, the table is its register (version,
hash, gate state); a tool is one row that pins and library entries point at; an agent has one status.

Row separation by company is carried by the doors (a seat reads what its job's company and client allow). Per-company
row policies for a second human are not built now — there is one human; the column that makes them possible is there.

### C. Who acts

- `principals`: kind (human, service, agent, external), the sign-in or database login or agent it stands for, one row
  flagged as the CEO (a unique index allows one). Every actor column is a reference to it; `on_behalf_of` and the source
  message where an agent acts on the CEO's word; `run_id` where a run acted.
- `fn_actor()` answers the principal of the caller: the row bound to the sign-in, or the row bound to the database
  login; an unknown sign-in is nobody and is refused. No code path may set claims to become someone.
- A decision of the CEO is accepted only from the CEO's principal. A delivery release given through Hamza is recorded
  as Hamza's act on the CEO's behalf with the message it came from, and only from his own channels.
- An agent holds no database login and no credentials. The engine opens a run (agent, job, part); the tool server it
  starts for that run is bound to the run id outside the model's reach; every tool reads identity, company, job and part
  from the run. Tools that let a seat close an approval-waiting part, create a department or name another actor go.
- The environment handed to an agent's process is an allow-list of named variables, not a prefix: no database URL, no
  outward key.

### D. The work model

- `jobs`: company, client, job type (the menu, with the always-present "unclear"), the door it came through (Hamza,
  Reception, calendar or line, revenue), the giver, the owner (the job type's master), the value tier, due date, status
  (`received → routed → working ⇄ waiting → delivered → closed`, or `cancelled`, `failed`) and what it waits on (the
  CEO, the client, quota, a dependency). A goal he gives is a job in `received`; "intent" disappears as a thing.
- `parts`: a job's units of work — one table for what a seat does (plan, work, check, walk), what the studio's hands do
  (GPU, CPU) and what Hermes does; lane, seat role, the named agent when the master's call sheet names one, attempt
  count and its cap, lease. `part_dependencies` is the only place a dependency lives.
- **The desk** is the job's durable record: `desk_entries`, append-only — the brief (the giver's words verbatim, the
  "done" criteria, the value tier), the plan, each decision, each part's spec and result, check notes, handovers, open
  items; large artifacts as files referenced with their hash. `desk_read(job, part)` assembles exactly what a seat
  needs: the brief, the plan, its own part, the results it depends on, the notes of a failed check, pending outward
  actions. That call is "the desk's address".
- `runs`: one row per model session — agent, seat role, job and part or conversation, the model asked and the model
  that really did the work, effort, mode, tokens, context peak, turns, outcome (ok, error, cancelled, handover), the run
  it continues, cost (NULL when unknown, never 0) with its currency. `tool_calls` carry outcome and duration. No session
  without a run row.
- `job_types` and `job_patterns`: the menu card, the job book's address and version, the registered pattern (the parts
  a known job type starts with), the check rule and the delivery rule with its pass streak. A known type's job is
  instantiated from its pattern by the engine; there is no second runner.
- `inbound_messages` (channel, sender, client link, class, who sorted it) and one conversation store for chat and voice.
- **The law.** `part_transition` and `job_transition` hold the allowed moves; a status column refuses any other write.
  Retry, requeue, claim and the CEO's decision are transitions like the rest, so each leaves its event.

### E. What the system tells

- `events`: one row per state change — time, company, job, part, run, actor (a principal), a type from the closed
  catalogue (`db/reference`), a small payload without content. Written by the door that changes the state. Read in
  commit-safe order (transaction-id horizon), so a late commit is never skipped.
- A notification carries only an event id and means "look"; a forged one is harmless. The live surface's broadcast is
  derived from `events` by one trigger with one envelope; a reconnect replays from the last id seen.
- The engine's own state is rows: open runs, each seat idle or working and on what, when the engine last looked and
  when it wakes next. Nothing is told only to a log file.

### F. The engine (the resident runtime)

- **Two resident processes** instead of one that holds everything: the engine (claims parts, runs seats, the system
  clock) and the outbox executor (the only process that holds outward credentials). The voice daemon stays its own.
  Each starts after the database and restarts by itself.
- **Wake.** The engine LISTENs; a ready part, a pending conversation turn or a due clock entry wakes it. A sweep once a
  minute covers a lost notification — one query, no model. An idle hour makes zero model calls.
- **Capacity** is read from the subscriptions' windows; a stale read is unknown, never zero. The queue order is A29's.
  No fixed turn, token or lane cap cuts a running job; a job is stopped or cancelled by a control request that kills the
  seat's process and passes the door.
- **A seat runs in its own process.** The seat runner assembles the context (§3), opens the session through the model
  door with the tool door bound to the run, and reports the outcome through `part_transition`. Checks are parts the
  pattern creates (the code check, the final check, the two blind seats and the walkers on client work — A28), not
  judges wired in series inside the runner; a failed check returns the part to its owner and its notes are on the desk.
- **Crashes.** An expired lease returns the part to ready with its attempt counted; at the cap it is `blocked` with an
  alert that says what happened. Nothing is retried without limit, and nothing fails silently: an unreadable switch, an
  unavailable panel or a failed escalation refuses and alerts.
- **The clock.** pg-boss runs system routines only; each routine records the period it ran for and catches up missed
  periods once after the machine wakes.

### G. The model door

One function every model call passes — the seat sessions, the checks, classification, Hamza's turns, memory's judge:
one router (rules in the database; the master's choice of brain and effort per part with its one-line reason; the
per-employee floor), the call (subscription session or the LiteLLM route — no raw key), `is_error` treated as failure,
the backup pair by role with the run saying who really did the work, never a weaker model, then the run row, the token
counts and the cost. A ruler in the battery fails when a model is called anywhere else.

### H. The outward door (the approval gate)

- **Kept as it is:** the approvals table with its transition guard and immutable decision, the outbox row enqueued by
  trigger in the same transaction, the unique approval and idempotency keys, the re-check at execution.
- **One request door.** Whatever leaves the holding or spends — a mail, a publication, a payment, a contract step, a
  delivery to a client — is an `action_request` from a run. The rule table classifies it (autonomous, notify, gated) at
  that door, in the database; an agent cannot name its own class. Locked rules are evaluated first, cannot be shadowed
  by an inserted rule, and rules change only through the CEO's door. Every client delivery is a gated `delivery.release`
  until he lifts it for the job type (A9).
- **One decision door**, the CEO's principal only; it moves the part and the job through their transitions.
- **Tools that act in the world** (a browser, Hermes) meet the same classifier before the step runs (A11): the seat
  runner asks at each call of a tool tagged outward.
- **The executor** claims in order, marks the row executing and commits, runs the handler outside the row lock with the
  idempotency key handed to the provider, then records the result; a retryable failure is retried a bounded number of
  times and then alerts; a row with no handler fails at once with an alert; an act interrupted mid-way where the
  provider gives no idempotency is parked for review and never repeated by itself. The handler registry has one truth,
  and the executor refuses to start when its handlers and the registry differ.
- The quality and halal gates (the hook library, rules in the database) stay, as steps of the seat runner that no flag
  can skip: the halal screen is not switchable, and a failed read refuses.

### I. Context, prompt assembly and memory's door

- **One assembler** (today's `prompt-core`, kept and extended): identity card, standing layer, the job book, the desk
  read, conversation, then what changes per turn — in cache order, no clock in the standing layer.
- **Memory's one write door** stays (the fixed kind-to-store table, quarantine for web, mail and video origins) and is
  repaired: content is redacted where the spec says so; the note file is written after the row commits, idempotently; a
  recall names its kind, so no model call sits on the hot path; every entry carries its company and client, and a job's
  seat is never handed another client's memory. What memory becomes (the approved V2 memory) is its own board item; this
  job gives it a sound door and schema.
- The desk is not memory. At a job's close, lessons are proposed into the job book's notes or into memory by the
  existing way (the proposal's owner accepts).

### J. Money records

`cost_ledger` rows hang on a run and carry amount and currency; subscription work records tokens and quota, not a made-up
euro; unknown is NULL. `revenue_ledger` carries company, client, job, currency, gross, net and tax, and a unique key on
source and evidence so a replay cannot book twice. One `budgets` table for the chain holding → company → project or
employee → job and line. The cap on API spend sums like with like. The per-job cost line warns and never stops.

### K. The tests and the bench

- Tests are written from the contract before the code, named by subject, and run against the real engine **as the
  service roles**, never as `postgres`, so grants and doors are what is tested.
- **A writer cannot change the test that judges it.** The lead reads and commits a piece's tests in their own commit;
  from then on a script fails the piece if its diff touches those paths. A locked test changes only by the lead, in its
  own commit, with the reason.
- **The carry list.** Before a part's new tests are signed, the old part's tests and functions are read once as an
  inventory of contracts: each is carried into a new test, or dropped with its reason (for example "pins a defect").
- No test recomputes its expectation the way the code does; no test pins a defect as correct.

### L. The specs

No new spec. As each part is built, the spec that owns its contract is rewritten in place — the base text replaced, dead
text deleted, the adaptations folded in. The subjects no spec states today get their home there: the principal model in
PERMISSION_MODEL; the holding's shape, the job and desk model and the change discipline in DATA_MODEL; the resident
runtime and context assembly in AGENT_ORCHESTRATION_SPEC and SYSTEM_ARCHITECTURE.

## 3. Context: how the system keeps every seat sharp

His question: a model weakens as its context fills; what in the operating system prevents it. The answer is structural,
and it is AGENT_ORCHESTRATION_SPEC A29's discipline, made the shape of the engine rather than a rule a seat must
remember:

1. **Small start.** A seat opens with a short identity card, the brief, the job book of its job type and the desk read
   for its part. Skills, tools and specialists are names with one-line cards, opened when needed.
2. **The desk is the truth; the session is not.** Plan, decisions, state and pending actions are written on the desk
   as they are made. Whatever a session knows that matters is on the desk before the session ends.
3. **Long work is a chain of short sessions.** The master cuts the job into parts with checkpoints. Each part is done
   by a fresh session that reads only what its part needs and writes its result and decisions back. A retry starts fresh
   too, with the check's notes in its desk read.
4. **Measured, per run.** The model door records what every run's context held — the standing layer, recalled memory,
   history, tool definitions and results. The threshold where a seat hands over is a setting per model, set from a
   measurement on the holding's own work (the same job with a small and a large context, quality and cost compared);
   until measured it is a starting value named as unmeasured.
5. **Handover instead of compaction.** When a session reaches its threshold, or the subscription changes, it writes a
   handover entry — the giver's last word, decisions, done and open work, pending actions, the next step — and a fresh
   session continues from the desk. A read that would cross the ceiling is split first.
6. **Hamza the same way.** His conversation's durable state — the decisions of the day, his open items, each with the
   message it came from — is kept on the same mechanism; a turn sees the stable layer, the conversation's recent part,
   the open items and the matched memory. He does not carry a job's detail; he reads the job's desk when asked.

**What this changes in A29:** item 6's first two steps — clearing old tool results in place, and restorable compaction
built by us — are not built; `context-budget.ts` with its 12,000–16,000-token band and its own summariser leaves. The
reason: with the desk holding every decision, a fresh session is both simpler and safer than editing a live one, and
summarising a live context is where a decision is lost. The session runtime's own automatic compaction remains
underneath as a safety net we do not rely on. Everything else in A29 stands.

## 4. How the workers are built (the evaluation ordered for this sitting)

- **The research's proposal** — one strong master per job, a job book per job type prepared ahead and attached by the
  router, more agents only where the work is independent and parallel, a separate checker.
- **What the trial measured** — not proof (two of four jobs, one judged, not blind), but in the same direction: the
  single master delivered in about 17 minutes against the team's 80-odd and was preferred by a little; the team run
  took about 60 points of a 5-hour window (the single run's quota was not recorded); a master left to itself called
  no specialist; and the weak point of the single master was not skill but the brief — it took the safest reading
  because nothing told it what a good advertisement must attempt.
- **The design** takes the research's shape and closes the gap the trial showed:
  - The atom is **a seat on a job** — master, specialist, checker or walker — filled by an agent's identity card, a
    model and an effort. The foundation does not make "an employee is a persona" its atom, so it stands whichever way
    the persona question is later measured.
  - Expertise lives in **the job type's book**: when it applies, inputs, steps, decisions, the "done" checks, files,
    examples of work he approved, dated lessons. It is prepared and checked ahead, versioned, attached before the work
    starts, and the job records which version it ran on.
  - **A one-line order becomes a full brief by construction:** the brief is the giver's words verbatim plus the book's
    standing demands for that job type — for an advertisement, the creative step (several ideas, none of them the
    client's existing picture), fidelity to the product, the "done" checks — plus the value tier. The giver never has
    to spell out creativity.
  - Specialists are called through the queue onto the desk, with a reason, where A27 says: a tool the master lacks,
    bounded parallel parts after an approved design, a specialist's checklist, domain knowledge.
  - The check is separate and blind (A28).
- **Not decided here:** whether personas add anything beyond a good book. It stays a measurement, as he said.

## 5. The verdict table

Writers by what an error costs (B85.md): **F-x** Fable 5.2 at xhigh — what cannot be undone; **F-h** Fable 5.2 at high —
weighty parts; **O** Opus 5.5 at xhigh or high — middle parts whose spec and tests are fixed first; **o** Opus 5.5 at
medium — small glue. The lead designs each part's contract and tests, verifies every piece and commits.

| # | Part (today) | Verdict | What happens | Writer | Absorbs |
|---|---|---|---|---|---|
| 1 | Migration chain, bootstrap, seed (`db/migrations`, `bootstrap-db.sh`, `db/seed`) | **Rewritten** | New chain by subject, atomic, functions once, reference data apart, roles in the chain; old chain frozen | F-h | B68 |
| 2 | The holding's shape (companies, departments, agents, personas, library keys) | **Rewritten** | Company and client on business rows; one key per thing; one truth for membership, persona, tool, status | F-h | B67 |
| 3 | Identity and authorization (`fn_org_actor`, grants, RLS, service logins) | **Rewritten** | Principals, service roles, doors only, append-only for everyone | F-x | B73 |
| 4 | Work records (tasks, intents, workflow runs, generated work, media jobs, dependencies) | **Rewritten** | Jobs, parts, desk, runs; one law in the database | F-h | C60 |
| 5 | Leased claim (`claim_next_task`, reaper) | **Kept**, moved | Carried onto `parts`; the claim and the reap become transitions with events; attempt cap | F-h | B75 (cap) |
| 6 | Events (`task_events`, notify, broadcast triggers, ops-live receipts) | **Repaired** | One `events` table written by the doors; broadcast derived; one envelope; the receipt door retires when its reader stands on `events` | O | — |
| 7 | Worker engine (`worker-shim`, `worker-loop`, `scheduler`, lanes, ladder, QA) | **Rewritten** | Engine and seat runner; wake on events; checks as parts; no state in memory; no fixed caps | F-h | B70, B75 |
| 8 | Kernel workflow runner | **Removed** | Patterns instantiate parts; one runner | F-h (with 7) | — |
| 9 | Model calls and routing (13 call sites, `route()`, `fn_select_model`, fallback chain) | **Rewritten** | One model door, one router, backup pair by role, `is_error`, honest run and cost rows | F-h | B65, B66, B71 |
| 10 | Approval core (approvals, guard, enqueue trigger, idempotency) | **Kept** | Carried as it is, with real principals | F-x | — |
| 11 | Classification and decision doors (`fn_classify_operation`, LLM `approval_class`, two decide functions, agent drafts) | **Rewritten** | One request door, one classifier, one decision door, locked rules unbeatable | F-x | — |
| 12 | Outbox executor | **Repaired** | Own process and login; ordered claim; handler outside the lock; bounded retry, alerts, review park; one registry | F-h | — |
| 13 | Tool door (`dxb-mcp`, 28 tools) | **Repaired** | Identity from the run; tools that bypass removed; short replies; "nothing ready: N wait" | F-h for identity, O for the rest | — |
| 14 | Tool gateway (`packages/gateway`: pins, drift, lock, profiles) | **Kept** | Keys aligned with the one tool row | o | — |
| 15 | Hook (pre- and post-gates, rules in the database, halal screen) | **Repaired** | Steps no flag skips; fail closed on every read | F-h | B70 |
| 16 | Prompt assembly (`prompt-core`, persona delivery) | **Repaired** | One assembler for every lane; book and desk read added; persona register one truth | F-h | — |
| 17 | Context budget (`context-budget.ts`) | **Removed** | Measurement and handover (§3) | — | — |
| 18 | Memory router (write policy, recall, adapters) | **Repaired** | Redaction, file after commit, kind named, company and client scope; unused adapters go | O | — |
| 19 | Money records (cost and revenue ledgers, budget state, monthly cap, breaker) | **Rewritten** | Currency, run link, NULL for unknown, idempotent revenue, one budgets table | F-x | — |
| 20 | Settings triad | **Kept** | Carried as it is | o | — |
| 21 | Observability (`runScope`, decision log, spill) | **Repaired** | Folded into the model door and `runs`; tool outcomes recorded; spill kept only if the five questions keep it | O | B75 |
| 22 | Fixed guards (turn budget 4/12/40, hourly token ceiling, 8-lane limit, context band, five-step ladder) | **Removed** | Capacity from the windows; the owner, the brief's criteria and the due date bound the work | — | — |
| 23 | HR and revenue daily jobs (`packages/hr`, `packages/revenue`) | **Kept**, ported | Moved onto the new tables at the seam; their own rework is B83's | O | — |
| 24 | Voice line (`packages/voice`) | **Kept**, seams only | Its model calls pass the model door; its turns are runs; the rest is B12's | O | — |
| 25 | Engine wall, read gateway, SDK isolation | **Kept** | Env allow-list by name | o | — |
| 26 | Tests (195 files by row and phase id) and the bench | **Rewritten** with each part | By subject, from the contract, as the service roles; carry list per part | with each part | B74 |
| 27 | The specs' base texts | **Rewritten in place** with each part | Dead text deleted; four unstated subjects get their home | the lead | — |
| 28 | The dashboard | **Not judged** | B32, B81 | — | — |

Each runtime guard that stays (the API-spend cap, the breaker, the hook's monitors, the spill) answers five questions
from its own log before it is carried: which failure it prevents, how often that still occurs, what it costs, whether
it can be simpler, what happens without it. Removing or weakening a guard beyond row 22 stops at him.

## 6. The order of the build

Each stage ends with something that runs; nothing waits for everything.

- **Stage 0 — the bench.** The new chain's runner, the roles, an empty database in the construction cluster, the
  rebuild test, the test-lock script. First measurements of §8.
- **Stage 1 — the thin thread.** The smallest whole: principals and the holding's shape; jobs, parts, desk, runs,
  events with their doors; the engine and a seat runner; the model door; the request, decision and outbox path with the
  one test handler. Acceptance on the bench: a goal entered as the CEO becomes a job; a master's part runs through the
  model door; a check part runs; the delivery waits for the CEO's principal and is refused from any other; the outbox
  executes; every state change has its event; a killed process loses nothing; an idle hour makes zero model calls.
- **Stage 2 — each part to its full contract:** the gate's rules and locked rules; the executor's retry and park; the
  router and the backup pair; capacity; stop and cancel; patterns and checks as parts; the clock's catch-up.
- **Stage 3 — the seams:** the tool door, the hook's gates, the assembler with the book and desk read, context
  measurement and handover, memory's door, conversations and Hamza's turns as runs, money records.
- **Stage 4 — the ports:** HR and revenue jobs, the voice seams, the tool gateway's keys.
- **Stage 5 — the data move and the key turn.** What the company holds worth carrying — personas, the library,
  settings, the audit and approval history, conversations — is moved by a script rehearsed on a copy, after a restore
  drill of the backup (B72); the whole holding then runs once on the construction copy and the key turns (B76). The old
  chain, packages and battery leave here, not before.

The first real figure for how many quota points a part costs comes from stage 1 and is told to him with the weeks it
implies; the model and the level are not lowered to fit a week.

## 7. How it is verified

- Per piece: its locked tests green as the service roles; the lead reads the diff and runs them.
- Per stage: the rebuild test, the whole new battery, and the stage's acceptance run end to end on the bench — once
  with a stubbed model, once live.
- The old battery stays green until stage 5, because the old chain is not touched.
- One blind audit pass per stage's commits; the fixes are tested.
- What a terminal cannot observe — whether the live surface feels alive on these events — is B32's and is marked so.

## 8. Measured first at the build (UNVERIFIED today)

1. That the bootstrap's preamble brings a bare database in the construction cluster to a state the new chain and its
   tests can use (the script says so; not run). If not, the new chain takes its own schema namespace instead.
2. That the session runtime lets the engine bind a tool server to one run outside the model's reach, and exposes
   per-turn usage so the context of a run can be measured.
3. The database login the company's daemons use today, and which outward or money keys their environment holds.
4. The unit of the proxy's recorded spend.
5. The handover threshold per model (§3 item 4).
6. The quota cost of a part (stage 1).

## 9. Risks

1. **A rebuild that runs long with nothing new alive.** Answer: the thin thread first; every stage ends runnable; the
   old system stays whole and untouched meanwhile — it is not running today (services disabled, the newest task of
   2026-09-05).
2. **Behaviour the old code carries that no document states.** Answer: the carry list per part.
3. **The design is drawn before the rival synthesis (B22) and the V2 screens (B32).** They add columns and event types;
   the shape — company, principal, job, event — does not depend on them. What they ask of the foundation enters as a
   registered addition.
4. **The data move.** Small today (no revenue rows, no clients), rehearsed on a copy, after a restore drill.
5. **The quota.** Fable 5.2's week carries the irreversible and the weighty parts; middle parts go to Opus 5.5 from
   fixed specs and locked tests; the build is divided over weeks.
6. **Over-building.** Not built now: per-company row policies, event sourcing, our own compaction, a per-tenant budget
   engine beyond one table, any queue beyond parts, outbox and the clock.

## 10. What needs his yes (each changes the architecture or an approved text)

1. **A new chain beside the old one**, the sound cores carried over, the old one frozen until the key turn — instead of
   repairing in place. Recommended: yes.
2. **A29 item 6 simplified** — no clearing or compaction machinery of our own; the desk, short sessions and the written
   handover carry it (§3). Recommended: yes.
3. **Two resident processes** — the engine, and the outbox executor alone with the outward credentials — an exception
   to "no new resident service". Recommended: yes.
4. **The order: the thin thread first.** Recommended: yes.

## 11. Not in this job

Hamza's hands (B64, B41), the V2 memory, the voice line's speed (B12), the studios' records (B43, B84), revenue cycles
(B83), Hermes (B09–B11), the backup's repair (B72), the dashboard (B32, B81), the rival synthesis (B22). B69 stays its
own row (a research job's book). Each stands on what this job builds.
