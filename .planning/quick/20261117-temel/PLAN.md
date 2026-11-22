# B85 — the foundation: target design and verdict table

The plan as it stands after the blind audit (`ASTRA.md`, `fable-audit.md`; the audited draft is `blind/PLAN.md`). Read
with the dossier (`dossier/`). A "today" fact is the dossier's or the audit's, at the source it names; what is not
measured is marked UNVERIFIED and listed in §8.

## 0. The finding in one paragraph

The existing foundation has a sound physical base and a wrong logical one. Sound: one Postgres, a key on every table,
money in numeric, time with zone, checked vocabularies, the enqueue of an outward act in the same transaction as its
approval, the atomic first claim of a task, the settings' register-value-history shape, the persona gate, the wall
between the two engines. Wrong at the root, in three places that touch nearly every table and every writer: **the
holding has no shape in the data** (3 of 62 tables know a company; a client is known to the CRM tables only, and the
link does not continue to a job, a delivery or money; keys are global); **nobody is anybody** (19 free-text actor
columns, any signed-in session is "ceo", production code forges the CEO's claim, no service has a login of its own);
**the unit of work does not exist** (five partial groupings and six queues, none of which is a job with its owner,
client, company and money; the task law lives in TypeScript and is already bypassed). On top of these: model calls in
fifteen places and two routers, a gate whose rule table is consulted on one lane only, an engine that polls and keeps
truth in memory, state changes written apart from their events, and specs whose base texts describe July.

Three root redraws that each touch most tables cannot be bolted on. The target is therefore drawn whole, small, and
built as a new chain beside the old one — the sound mechanisms carried over, each named.

## 1. The eight decisions everything hangs on

1. **A new schema chain, by subject, beside the old one.** The old chain is frozen. The new one is a baseline written
   from the target plus versioned forward changes; it is built as a schema of its own inside the one database of each engine — the
   real sign-in and broadcast are present on the bench, the engine's address stays spelled once, and the application's
   tables leave `public` with its default grants. The company database is not touched until the rehearsed move
   (stage 5).
2. **Every business row knows its company and, where there is one, its client — and the database keeps them
   consistent.** The holding itself is the root company. Staff, cupboards, the library and the settings are the
   holding's, shared.
3. **Every act is done by a principal the database knows, and is allowed at the door it passes.** One `principals`
   table; the CEO is one row bound to one sign-in; each resident service has its own login; an agent acts only through
   the run the engine opened for it.
4. **The unit of work is the job with its desk.** One `jobs` table, its `parts`, its desk, its versioned artifacts,
   its `runs`. Intents, workflow runs, generated work and media jobs fold into it.
5. **State changes pass one door, and the door writes the event** in the same transaction.
6. **One door for each kind of act:** the model door, the outward request door, the tool door, memory's door, the
   prompt assembler.
7. **The machine is code and wakes on events; a model runs only when there is work.** Idle costs no token. A restart
   loses nothing, and a worker that comes back late can change nothing.
8. **A session is disposable; the desk is not — and the desk is written whole and read in slices.** Context stays
   small by structure.

## 2. The target, part by part

### A. The database and its change discipline

- **Chain.** `db/schema/` — the baseline by subject, then forward-only versioned changes; each file and its ledger
  row in one transaction; an applied file is never edited (its hash is in the ledger, and a changed hash stops the
  run). `db/functions/` — one file per door function, so a body has one place; they are re-applied in a fixed order
  after the schema files, and a changed signature is a versioned change, not a silent replace.
- **Reference data is two kinds.** Vocabularies the code owns — event types, the handler registry, tool tags, role
  ceilings: the file is the truth and is re-applied. His policy — approval rules, routing rules, the job-type menu,
  setting values, budgets: the file seeds it once and from then on the database is the truth, changed only through
  his doors; a new default reaches a live database as a versioned change that says what it changes.
- **Logins.** The chain creates the service roles without passwords; an install step outside the repository sets
  them from the secret store.
- **It rebuilds and it upgrades.** One command builds an empty database to the full schema; a test rebuilds from
  nothing and compares with the committed snapshot; a second proves a failed file leaves nothing behind; a third
  upgrades a populated database from one version to the next.
- **Conventions kept:** uuid keys for entities, identity bigint for logs, numeric money, timestamptz, CHECKed text
  vocabularies, validated FKs with NO ACTION by default. An index goes under a FK where a query or a delete path needs
  it (measured, not by rule). No cascade out of a log or a dedupe record. A jsonb column that carries a contract gets a
  shape check or becomes columns.
- **Append-only is enforced for everyone**, the owner included, TRUNCATE too. Nothing deletes history: "remove from
  my list" hides a row from his list and leaves the record; retention is not built now, and when a log needs it a
  whole period moves to the archive by a versioned change. Tests do not sweep rows: each creates a company of its own
  and asserts inside it.
- **Roles** are created by the chain: an owner role with no login; one login per resident service with EXECUTE on its
  doors only; the dashboard as `authenticated`; the read roles. No role with RLS bypass serves at runtime. Set-up acts
  of the owner and the behaviour of service roles are tested apart.

### B. The holding's shape

`companies` (the holding as root; beneath it each unit that has its own clients, channels and money — a legal
company or a brand, flagged which; currency, jurisdiction), `clients` (a company's), `channels` (a company's shop
front or account on a platform — its own site, Amazon, eBay, TikTok, Instagram, a mailbox), the CRM tables carried
with their links, then the shared org: `departments` (a cupboard of specialists, checklists, examples
and lessons — no head on a job's path), `agents`, `personas`, the library, tools, settings. The shared org is the holding's and its slugs are unique in the holding; what a company owns —
clients, channels, projects — is unique inside that company. A job's client must belong to the job's company, and every row hanging from a job carries the same
company — by composite keys, so the database refuses a mismatch. One truth each for the persona's text (its file; the
table is the register), a tool (one row that pins and library entries point at) and an agent's status. An agent's home
department and an additional assignment in another department are two facts with different meaning and both stay, with
start and the decision they came from.

**His examples, walked through the rows.** The clothing company is a company; each place it sells is one of its
channels; watching and running a channel is a line with a standing owner, whose runs are jobs; a sale books revenue
on the company, the channel's account and the order. The phone-accessory brand is a company row flagged as a brand,
with its own site as a channel. The web studio, the media studio and the advertising agency are cupboards of staff
(departments) and job types on the menu; the clients they serve and the money they earn belong to the company that
sells — the holding itself today, a company of its own the day he founds one, by one row. A mail to the holding is
an inbound message on a mailbox channel, sorted by Reception to the account's owner, to sales or to Hamza; the job
opens at the signed deal. The client site with three designs is one job with four artifact versions (D).

Per-company row policies for a second human are not built now — there is one human; the columns that make them
possible are there. What is built now is the boundary a seat meets (C).

### C. Who acts, and what a seat may do

- `principals`: kind (human, service, agent, external, legacy), the sign-in, database login or agent it stands for,
  one row flagged as the CEO. Every actor column references it; `on_behalf_of` with the source message where an agent
  acts on the CEO's word; the run where a run acted. Work no model does — the clock, mail intake, code jobs — acts as
  its service's principal.
- `fn_actor()` answers the caller's principal; an unknown sign-in is nobody. No code path may set claims to become
  someone.
- **Every door checks authority, not only identity:** the run is the part's current attempt (F), the agent is
  active, its seat on that job allows the act, and what it reaches — a desk, a file, a library item, a memory entry,
  an event — lies inside that job's company and client or is shared by grant. The role ceilings are reference data.
- An agent holds no database login and no credentials. The tool door runs inside the seat runner's own process, bound
  to the run in code the model cannot reach (the session runtime's in-process tool server; documented, tried at
  stage 0). Tools that let a seat close an approval-waiting part, create a department or name another actor go.
- Every child process — a seat's session, the auditor's command-line run — starts from an allow-list of named
  variables: no database URL, no outward key.

### D. The work model

- `jobs`: company, client, job type (the menu, with "unclear"), the door it came through, the giver, the owner, the
  value tier, the pattern and book versions it started on (fixed for its life), due date, status
  (`received → routed → working ⇄ waiting → delivered → closed`, or `cancelled`, `failed`) and what it waits on.
- **One birth door for every producer** — Hamza, Reception, the clock and a line, the revenue engine: `job_open`
  takes the source's own key, so the same mail or the same discovery never opens two jobs, and the job, its brief and
  its first parts are born together or not at all.
- **What a job starts with is decided from separate inputs** — its type, its value tier, whether a registered pattern
  exists, the door it came through, whether it goes to a client — as A26–A32 say: a simple job runs its pattern; a
  normal one gets a plan; a valuable one two plans and a blind audit, and plans only its difference when its type is
  known; a registered client's mail reaches the account's owner and a job opens at the signed deal; a routine client
  message, a new site and client-bound work of unknown class get different checks.
- `parts`: one table for what a seat does (plan, work, check, walk), what the studio's hands do and what Hermes does;
  lane, seat role, the named agent when the call sheet names one, attempts and their cap. `part_dependencies` is the
  only place a dependency lives.
- `artifacts`: what a job produces, versioned, with hash and path. A check, the CEO's choice, an approval and a
  delivery each name the artifact version they are about; a changed version is checked again. (Three designs, his pick,
  the merged version, the one delivered: four traceable rows.)
- **His verdict** is a record on an artifact version: his words verbatim, the date, and a level only his word
  sets. A version he has not looked at carries none.
- **The desk**: `desk_entries`, append-only — the brief (the giver's words verbatim, the "done" criteria, the value
  tier), the plan, each decision, each part's spec and result, check notes, handovers, open items. It is written
  whole and read in slices (§3): `desk_read(job, part)` — code, not a model — assembles what a seat needs and is
  allowed, inside a budget.
- `runs` and `run_attempts` (G); `tool_calls` with outcome and duration.
- `job_types`, `job_patterns` (versioned), `inbound_messages`, one conversation store for chat and voice.
- `lines`: the line card of WORKFLOW_ENGINE A7 — recurring work with its standing owner, schedule or event, budget,
  target and autonomy step; every change a new version, audited, undoable. A line's run is a job. The records the
  workflow spec names stay; what goes is the second runner.
- **The law.** `part_transition` and `job_transition` hold the allowed moves; a status column refuses any other
  write. A job cannot be delivered or closed while a mandatory part or check is open or failed, or while it waits on a
  choice. A part whose dependency failed is blocked with an event — it does not wait for ever, and a removed
  dependency never counts as met.

### E. What the system tells

- `events`: one row per state change — time, company, job, part, run, actor, a type from the closed catalogue, a
  small payload without content — written by the door that changes the state.
- **The state rows are the truth; the trail is the record and the wake.** Nothing derives state by tailing events:
  the engine is woken and reads the state; a live surface gets a notification that means "look" and, after a
  disconnect, reads the current state again — today's rule, kept. No replay, no cursor. If a consumer ever has to
  follow the trail itself, it reads in commit-safe order; that is not built now.
- The engine's own state is rows: open runs, each seat idle or working and on what, when the engine last looked and
  when it wakes next.

### F. The engine (the resident runtime)

- **Two resident processes:** the engine (claims parts, runs seats, the clock) and the outbox executor (alone with
  the outward credentials). The voice daemon stays its own. Each starts after the database and restarts by itself.
- **Wake.** The engine LISTENs; a sweep once a minute covers a lost notification — one query, no model.
- **Ownership protocol.** The atomic first claim is kept. Every claim creates a new attempt (its run); renewing the
  lease, writing to the desk, using a tool, requesting an outward act and finishing are accepted only from the part's
  current attempt. A worker that returns after its lease passed to a successor is refused everywhere; after a handover
  only the successor can act. Cancelling reaches work in flight the same way. At its start the engine ends the seat
  processes a dead engine left behind, so no part has two sessions.
- **Capacity is per lane, and it limits starting, never running.** Seats: the subscriptions' windows. How a
  resident engine reads them without a session is not measured (§8); until that read is proven, today's hourly token
  brake stays as the brake on starting. An unknown read admits one seat at a time and raises an alert — never zero,
  never all. The studio's hands: the card's real availability, as measured today. Machine work: a number in
  the settings. Nothing cuts a running job for its turns, tokens or cost; stop and cancel are control requests.
- **A seat runs in its own process.** The runner assembles the context (§3), opens the session through the model
  door, and reports through `part_transition`. Checks are parts (A28). A failed check returns the part to its owner
  with its notes on the desk.
- **Crashes and silence.** An expired lease returns the part to ready with its attempt counted; at the cap it is
  `blocked` with an alert. An unreadable switch, an unavailable panel or a failed escalation refuses and alerts.
- **The clock.** pg-boss runs system routines only. A routine is handed the period it runs for, records it, and
  catches up each missed period once — never the same day three times.

### G. The model door

Every carrier of a model passes it: the session runtime, the LiteLLM route, embeddings, the auditor's command-line
run. A run is opened before any call — no run row, no call. One router (rules in the database; the master's choice of
brain and effort per part with its reason; the per-employee floor). Each provider attempt is its own `run_attempts`
row with its model, outcome, tokens and cost, so a failed primary's spend and the reason for the switch are never
lost. `is_error` is a failure. The backup pair by role, never a weaker model; both down, a checker's fall-back and
Hermes waiting are three distinct outcomes (A31). LiteLLM listens on the loopback only. A ruler in the battery fails
when a model is called anywhere else.

### H. The outward path (the approval gate)

- **Kept:** the enqueue in the same transaction, the forward-only guard with one decision, the re-check at
  execution.
- **Repaired — what he approved is what runs.** Today only the status is guarded: the payload and the action type
  can change after the decision and the executor reads them at execution. Once a row leaves draft every column but
  the decision fields is frozen; a decision requires the deciding principal; an approved row cannot be removed; the
  row hangs on its job, part and company.
- **Repaired — the request has an identity of its own.** `action_requests`: one row per act a run asks for, with a
  key that is stable across retries and the hash of what is to be done — recipient, amount, content, artifact
  version. The rule table classifies it at that door, in the database; an agent cannot name its class; locked rules
  are evaluated first and cannot be shadowed. Gated: an approval is born for *that* request and *that* hash — a
  second identical request joins the first, and a change after approval voids it. Autonomous and notify: the request
  goes to the outbox on the classifier's decision, recorded. The outbox row hangs on the request; the approval is
  required exactly when the class is gated.
- **One classifier, three ways an act is carried out:** (1) the outbox executor, for acts with a handler — a mail, a
  publication, a delivery; (2) a seat's own step in the world — a browser, Hermes on its registered path — asked
  before each step that acts (A11), with reading, a routine reply, a contract step and a payment step told apart.
  How a click is recognised as a payment or a contract step, and where a browser seat's session credentials live, is
  not designed here: it is A11's mechanism, built with Hermes and B41; the foundation gives it the classifier, the
  request record and the stop (§8);
  (3) the CEO himself — at a payment step the work stops and he pays. `contract.*` inside the approved price policy
  and standard contract runs autonomous and logged (A10); a routine reply is not gated (A12).
- **The decision door** accepts the CEO's principal. A delivery release he gives through Hamza is accepted as Hamza's
  act on his behalf, bound to that request and to the verified message from his own channel; nothing else is relayed.
  His word against a rule is one logged override, a row on that one request with the warning he was given (A13); the
  rule stays.
- **The executor** claims in order, marks the row executing and commits, runs the handler outside the lock with the
  request's key handed to the provider, records the result; bounded retry then an alert; no handler fails at once;
  an act cut mid-way where the provider gives no idempotency is parked for review, never repeated by itself. One
  handler registry; the executor refuses to start when its handlers and the registry differ.
- The quality and halal gates (the hook library) stay as steps of the seat runner that no flag skips; the halal
  screen is not switchable; a failed read refuses.

### I. Context, prompt assembly and memory's door

- **One assembler** (today's `prompt-core`, extended): what never changes first — identity card, standing layer, the
  job book, the fixed tool set; then the desk read taken at the start; then conversation, appended only; last what
  changes per turn — recalled memory, new desk entries, the open-items list. No clock in the standing layer.
- **Memory's write door** stays (the fixed kind-to-store table, quarantine for web, mail and video) and is repaired:
  redaction where the spec says; the row is the truth and the note file is produced from it, again after a crash; a
  recall names its kind, and the time and cost of what remains on the hot path — the query's embedding — are measured;
  every entry carries company and client, and the recall applies the boundary of C.
- The desk is not memory. At a job's close, lessons are proposed into the book's notes or into memory the existing way.

### J. Money records

- **Kept from today's revenue door:** the request key, a manual entry without a document, a refund as a reasoned
  reverse entry.
- Revenue rows carry company, client, job, currency, gross, net and tax; uniqueness is on the provider's account and
  transaction inside the company, so two shops with the same order number never collide and a replay never books
  twice.
- **One source for realised spend:** the attempt's cost row (amount and currency; NULL when unknown; subscription
  work as tokens and quota, not a made-up euro). The proxy's own total is a cross-check, not a second sum; an unread
  cross-check is unknown, never zero.
- **Money out that is not a model call** — ad spend, a payment, a marketplace fee: the executed outward act writes
  its expense row (company, job or line, channel, amount, currency, the provider's transaction, the request it came
  from). Realised net is revenue less model spend less these.
- **Corrections are reverse entries**, never edits. **Each amount stays in its own currency;** a holding total
  converts at a recorded rate for the period and is derived, never stored over the original.
- One `budgets` table for holding → company → project or employee → job and line. The per-job cost line warns and
  never stops.

### K. The tests and the bench

- **The carry list.** Before a part's tests are signed, the old part's tests, functions, views and RPCs are read once
  as an inventory of contracts: a valid test is kept or moved to the new entry point; one that pins the old shape is
  rewritten; one that pins a defect is dropped with its reason.
- New tests are written from the contract before the code, named by subject, and run as the service roles.
- **A writer cannot change the test that judges it.** The lead commits a piece's tests in their own commit; a script
  fails the piece if its diff touches those paths, and fails it when a locked test did not run.

### L. The specs

No new spec. As each part is built, the spec that owns its contract is rewritten in place. The subjects no spec states
today get their home: the principal model and door authority in PERMISSION_MODEL; the holding's shape, the job, desk
and artifact model and the change discipline in DATA_MODEL; the resident runtime and context assembly in
AGENT_ORCHESTRATION_SPEC and SYSTEM_ARCHITECTURE; the single runner in WORKFLOW_ENGINE_SPEC.

## 3. Context: how the system keeps every seat sharp and cheap

A model weakens as its context fills, and every turn pays for the whole context again — so a long session costs more
with each step and thinks worse. His question, 2026-11-22: is the desk a good thing, or does everyone read a desk that
has grown to a million tokens from its start?

**The judgement.** Keeping a job's state outside any session is right and has no sound alternative: one long session
loses its state when it ends and pays for its whole history at every turn; a summary made by the session loses a
decision at a moment nobody chose; retrieval by resemblance finds what looks alike, not what was decided; agents that
talk to each other fill each other's context and leave no single truth. But a desk that is read whole is the same
decay through another door. A29 says "a seat reads only what its work needs" and does not say what enforces it. The
design therefore rests on one rule: **the desk is written whole and read in slices.**

1. **Two layers.** The record layer keeps everything, append-only; nobody reads it in bulk. The current layer is what
   is in force: the brief, the latest plan, the decisions in force, the open items, one short result per part. A new
   plan or decision supersedes the old one in the current layer and leaves it in the record. The current layer grows
   with the number of parts, not with the job's history.
2. **A part leaves two things:** its artifact, as a file, and a short result on the desk — what was made, what was
   decided, where it lies — whose length the door limits. A session's transcript never enters the desk.
3. **The desk read is cut by code, for one part, inside a budget.** A seat receives the brief, the plan in force, its
   own part's spec, the short results of the parts it depends on, and the notes addressed to it. Everything else is on
   the desk by id and is opened one entry at a time when needed. When the slice would pass its budget the assembler
   hands headlines in place of bodies. On a desk of a million tokens a seat still reads a few thousand.
4. **A large job folds.** Parts are grouped; the master sees a group's summary, not a hundred results.
5. **Small start.** Identity card, the job book's short part (its files and examples are opened on need), the tools of
   its own seat role only, the desk read. What never changes stands first and in the same order, so sessions of the
   same job type read it from the cache.
6. **No seat runs full.** A session ends because its part is done, not because its window filled: the master cuts
   the job into parts that finish well inside one session, each part a fresh session; a retry starts fresh with the
   check's notes in its slice; a checker reads the brief and the artifact, not the maker's history. The window's
   threshold is a safety line: at it, or when the subscription changes or the quota ends abruptly, the seat writes a
   handover — the giver's last word, decisions, done and open work, pending outward acts, the next step — the successor
   continues from the last entry the desk holds, and the old session can act no more (F).
7. **Measured, per run — everything A29 lists:** the standing layer, the slice, recalled memory, history, the model's
   earlier thinking, tool definitions and results, the room kept for the answer; what the runtime does not expose is
   recorded as not observed, never as zero. Also recorded: the slice's size and how often the seat opened further
   entries — many openings mean the slice is too thin, unused bulk means it is too fat.
8. **Hamza as A29 item 11 says** — one append-only session a day, the next day starting from the day's summary. His
   decisions and open items are also entries, each with its message, so the summary is written from records, not
   from recall; he reads a job's current layer when asked and does not carry its detail.
9. **What else keeps the bill down:** each part gets the brain and effort its weight asks (the master's choice, with
   its reason); a step with one right answer is code; an idle system calls no model.

**The desk, memory and the session are three stores by lifetime, under one rule and one assembler.** The session
lives for a part and is disposable. The desk lives as long as its job and holds only that job. Memory outlives jobs:
what is true of a client, of a company, of the holding; the job type's book is its curated part, the craft. They meet
at three points and nowhere else. (1) **At a job's birth memory is read once:** the few entries that match the client
and the company are written on the desk as the client's card, so every seat receives them in its slice and no seat
runs its own recall. (2) **While the job runs, seats work from the desk;** memory is opened one entry at a time when
a seat needs it. (3) **At the job's close what lasts is proposed into memory** — what was learned of the client into
memory, a lesson of the craft into the book's notes — accepted by its owner the existing way; the desk goes to the
archive. The assembler is the one place that decides what enters a context, with a budget for each source: the
book's short part, the slice, a few matched memory entries; nothing is poured in whole. Memory keeps the same rule as
the desk — written whole, read in slices, each entry knowing its company and client. How well memory recalls is not
this job's: it is measured when the V2 memory is built, by its list of business questions (today the company holds 5
memory rows).

**Not measured, and said so.** The slice's budget, the length limit of a result and the handover threshold are
settings with starting values named as unmeasured; they are set per model from the holding's own work — the same job
run with a short and a long context, quality and cost compared.

**What this would change in A29, and how it is decided.** A29 item 6 builds three steps as context grows: clearing
old tool results and thinking in place; restorable compaction; then the handover. The proposal is to build the
slices and the handover first and let them carry the load, with the runtime's own compaction underneath as a net.
That reasoning is not a measurement. So: after they are built, the comparison above is run, and a forced handover is
tried for whether the morning's decision, the client's last word and a pending outward act survive;
`context-budget.ts` and the two unbuilt steps are dropped only on that evidence and his word. Until then A29 stands
as written.

## 4. How a job is worked

**The answer is already agreed: AGENT_ORCHESTRATION A26–A33.** One master owns a job and does the coupled work
itself; it calls a specialist with a recorded reason; when it splits it writes the seams first and tries the whole
itself; a fresh eye checks against the brief, client work as A28 and A32 say; every seat starts small and works from
the desk (A29); value decides the plan and the checking (A30). The job type's book is B64's (`B64.md`, the playbook
note): prepared ahead and checked, signed by the type's master, a liking or a rejection on one job staying that job's
feedback. This section adds no mechanism to them. It records what the evidence gathered on 2026-11-22 says about them
— `workers/blind/EVIDENCE.md`, audited blind by Astra and by Fable 5.2 (`workers/ASTRA.md`,
`workers/fable-audit.md`) — and what the foundation must carry. Grades are the evidence file's.

| The agreed way | Our own record | The maker's current documentation | What it amounts to |
|---|---|---|---|
| One master does the coupled work | The single maker was faster and cheaper in four studies: 16 m 44 s and 1.87 $ against the team's 80 m 33 s and 19.04 $ (18 Nov, job 1; the team's brief was changed mid-trial); 31 m 50 s against 84 m 47 s stopped undelivered (job 2); 1043 s and 135k tokens against 2273 s and 1284k (21 Oct; the team arm a hand-written 9-agent workflow); 37.15 $ against 330.35 $ (28 Oct); 831 s and 3.16 $ against about 100 $ (24 Oct) | "For simple tasks, sequential operations … or tasks where you need to maintain context across steps, work directly"; "Handing the same task to a subagent doesn't make the answer any better." | Speed and cost: an indication, one direction, each study confounded. Quality: shown neither way — his eye has never compared a working team's finished delivery with a single master's, blind; Sol's blind visual ranking of the olive pages put the team's last |
| A specialist is called with a reason | A master left free called none (three runs) — which is why what a job always needs does not hang on the master's choice: A28 and A32 fix the checks | A subagent serves context isolation, parallelization, specialized instructions, tool restrictions. The Opus 5.5 page: "Teams given a budget kept answer quality comparable to the single agent's while finishing considerably sooner" — our Opus 5.5 trials on coupled work did not show that | A27 is not contradicted |
| An independent check against the brief | 15 construction jobs on record, 14 audited: defects that would have reached him wrong; a second blind auditor found more in 2 jobs of 2. Eye-facing work: judged blind, he put both fix-round arms first (21 Oct, one page) | "A fresh reviewer does help, because it hasn't seen your reasoning"; "A reviewer that's asked to find problems will always find *something*". The Opus 5 page: explicit self-verification instructions can go with no loss. The Sonnet 5.5 page, coding at max: stopping self-started reviewers cut session cost by about a third with no change in quality | Measured for construction work, an indication for eye-facing work. It supports A28 as written: checks are parts fixed by the job's class, and they verify |
| A small start, the desk, fresh sessions | A fresh session cost 5.62 $ where each resumed round of a giant one cost 8–16 $ (a different fix; Opus 5.5) | Context rot is named; the remedies are compaction, structured notes and sub-agents | An indication; §3's own paired measurement stands |
| Short personas (A29 item 14), re-tested when the model changes (item 15) | The 213 files average 20.9 KB. No study isolates the persona text. The nearest: 18 Nov job 1, a master with a one-line card (16 m 44 s, 1.87 $) against a master with a 216-line persona and no team (43 m 25 s, 2.93 $); he preferred the first "bir tık" — one run, not blind, the two briefs' other files differing | A one-sentence role "focuses Claude's behavior and tone"; no measured effect is published | That the long text helps: no evidence. That it harms: not shown |
| The book, prepared ahead (B64) | The construction's own doors are prepared, audited skills and carry its daily work. No measurement on a holding job | A skill's name and description are loaded at the start, its body when used | Unproven for our jobs |

**What follows.**

1. **A26–A33 stand as written.** Nothing in the record contradicts them. A closed list of grounds for opening a second
   worker, a ban on specialists and any new mechanism for lessons are not supported by the evidence and are not
   written.
2. **The personas go; the workers are agents** — his order of 2026-11-22 (§10, decision 6). A worker is an agent in a
   seat: what it does, the tools and data it may touch, the skills attached, a model and an effort the owner chooses.
   No character file is written, loaded or shown. Departments stay; what a job needs to know stays, as skills. The
   order of the removal, so that nothing in force is lost with the files:
   - Section 12 ("Discipline DNA & Islamic conduct", the same in all 213 files, reaching a worker today only inside
     its persona body — `packages/voice/src/prompt-core.ts`, `personaBlock`) is first delivered, word for word, from
     one shared source to every agent, and a gate fails when it is missing.
   - The files are read once for the lines that rest on his recorded word; each gets its home — the shared layer or
     the job type's skill.
   - Then the files, the persona door, the persona gate, the persona standard of the HR package and the code that
     loads a persona body are removed, from a list he sees first; the repository's history keeps what was removed.
   The engineers' reading of the evidence, said beside his order: no record shows a persona improving a result; none
   isolates the persona text as the cause of bad work either. The order is his.
3. **The foundation carries this and no more:** the job's owner; parts, each with its caller's recorded reason; parts
   in parallel, a choice that waits on him and a merge part (B84 decision 4, "three hands" — done once so far, by
   hand, on the olive page); the check path chosen from §2 D's inputs as A28, A30 and A32 say; a seat's tools as part
   of what it is given (on 18 Nov the first measured cause of the failed job was a missing tool, `B43.md:276-283`);
   the book's version on the job; his verdict as a record (§2 D).
4. **What is unproven is tried inside stage 1 and called what it is.** On the stage's one live job the same master,
   with the same tools and skills, works twice: without a book for the job type, and with one. He judges the two
   deliveries blind; time, tokens and cost are recorded per arm. One job is an indication, for that job type only.
   After it, the rows every job leaves — who was called and why, what a check changed, his verdict — carry the
   measuring. No standing rule is drawn from the one run.

**Not decided here, because nothing proves it:** whether a working team's result is better than one master's; whether
three hands yields work he praises; whether a one-line order becomes a brief that yields such work — stage 1's test of
the brief (§6) stays a test, and its remedy is untried.

## 5. The verdict table

Writers by what an error costs (B85.md): **F-x** Fable 5.2 at xhigh — what cannot be undone: the approval gate, the
money path, moving data; **F-h** Fable 5.2 at high — weighty parts: the engine, the model door, memory, context;
**O** Opus 5.5 at xhigh or high — middle parts whose spec and tests are fixed first; **o** Opus 5.5 at medium — small
glue. The lead designs each part's contract and tests, verifies every piece and commits.

| # | Part (today) | Verdict | What happens | Writer | Absorbs |
|---|---|---|---|---|---|
| 1 | Migration chain, bootstrap, seed | **Rewritten** | Baseline by subject plus versioned changes, atomic with the ledger; functions once; defaults apart from his live values; roles in the chain | F-h | B68 |
| 2 | The holding's shape (companies, clients and CRM, departments, agents, personas, library keys) | **Rewritten** | Company and client consistent by key; one truth for persona, tool, status; home department and extra assignment both kept | F-h | B67 |
| 3 | Identity and authorization (`fn_org_actor`, grants, RLS, logins) | **Rewritten** | Principals, service logins, authority checked at every door, append-only for everyone | F-x | B73 |
| 4 | Work records (tasks, intents, workflow runs, generated work, media jobs, dependencies) | **Rewritten** | Jobs, parts, artifacts, desk, runs; one birth door; one law; the closing condition | F-h | C60 |
| 5 | Leased claim and reaper | **Claim kept, ownership repaired** | Atomic claim carried; a new attempt per claim, and only the current attempt may act; attempt cap | F-h | B75 (cap) |
| 6 | Events (`task_events`, notify, broadcast triggers, ops-live receipts) | **Repaired** | One `events` table written by the doors; look-and-reread for surfaces; one envelope; the receipt door retires when its reader stands on `events` | O | — |
| 7 | Worker engine (`worker-shim`, `worker-loop`, `scheduler`, lanes, ladder, QA) | **Rewritten** | Engine and seat runner; wake on events; checks as parts; no truth in memory | F-h | B70, B75 |
| 8 | Kernel workflow runner and the workflow records | **Runner removed, records kept** | Patterns and line cards stay, versioned and undoable; one engine runs them; a running job keeps the version it started on (§10) | F-h (with 7) | — |
| 9 | Model calls and routing (7 session calls, 6 chat calls, 2 embedding calls, the auditor's CLI run; two routers; the fallback chain) | **Rewritten** | One model door, run before call, an attempt row per try, backup pair by role, loopback only | F-h | B65, B66, B71 |
| 10 | Approval core (approvals, guard, enqueue trigger, keys) | **Repaired** | Same-transaction enqueue and the guard kept; the row frozen once it leaves draft; the deciding principal required; the request gets its own identity and content hash; the outbox hangs on the request | F-x | — |
| 11 | Classification and decision doors | **Rewritten** | One request door, one classifier, three carriers, one decision door with relay and override bound to a request | F-x | — |
| 12 | Outbox executor | **Repaired** | Own process and login; ordered claim; handler outside the lock; bounded retry, alerts, review park; one registry | F-x | — |
| 13 | Tool door (`dxb-mcp`, 28 tools) | **Repaired** | In the runner's process, identity and authority from the run; bypassing tools removed; short replies | F-h for identity, O for the rest | — |
| 14 | Tool gateway (`packages/gateway`) | **Comparison logic kept, seams repaired** | Its lock opens work through the birth door; a revoked grant cannot survive an interrupted profile publish | O | — |
| 15 | Hook (gates, rules in the database, halal screen) | **Repaired** | Steps no flag skips; fail closed on every read | F-h | B70 |
| 16 | Prompt assembly (`prompt-core`, persona delivery) | **Repaired** | One assembler for every lane, cache-ordered; book and desk read added | F-h | — |
| 17 | Context budget (`context-budget.ts`) | **Stays until measured** | Dropped only on §3's evidence and his word | — | — |
| 18 | Memory router | **Repaired** | Redaction; file from the row; kind named; company and client boundary; unused adapters go | F-h | — |
| 19 | Money records (ledgers, budget state, monthly cap, breaker) | **Rewritten**, the revenue door's three behaviours kept | Currency, attempt link, NULL for unknown, uniqueness by provider account, one source of spend, one budgets table | F-x | — |
| 20 | Settings | **Shape kept, repaired** | Writer and scope become references (a company scope added); values checked against their schema | O | — |
| 20a | The CEO's control doors (39 `control_*` functions) | **Inventory first** | Each is re-pointed to the principal model or folded into a new door; mapped with row 27 | F-h | — |
| 21 | Observability (`runScope`, decision log, spill) | **Repaired** | Folded into the model door; a run that cannot be recorded does not run; tool outcomes | O | B75 |
| 22 | Limits that cut running work (turn budget 4/12/40, the 12,000–16,000 band's hard stop) and fixed limits on starting (hourly token ceiling, 8 lanes), the five-step ladder | **Removed or replaced** | His word of 2026-10-28 removes what cuts a running job; starting limits become per-lane capacity; the ladder becomes A28's return to the owner. Each answers the five questions first; the removal is on his yes (§10) | — | — |
| 23 | HR and revenue daily jobs | **Repaired at the seams** | Revenue discovery opens its job once and whole through the birth door; each job is handed its period; their own rework is B83's | O | — |
| 24 | Voice line | **Repaired at the seams** | Model calls through the door, turns as runs; a spoken goal keeps its full text; a voice answer reads its own conversation; the rest is B12's | O | — |
| 25 | Engine wall and read gateway | **Kept** | — | — | — |
| 26 | Process isolation (`sdk-isolation`, the auditor's launcher) | **Repaired** | Every child from a named allow-list | F-h | — |
| 27 | Views (34) and the RPC read contracts | **Inventory first** | Unread today. Each is mapped to its consumer and gets its verdict — recreated on the new tables, served by a compatibility view, or retired — before stage 2 ends | O, after the lead's map | — |
| 28 | Logs and their doors (audit, decision, file-change evidence, alerts, control idempotency) | **Kept, moved** | Actors become principals; append-only enforced; alert assign and mute leave events; the purge door becomes "hide from my list" | O | — |
| 28a | Intake chain (`classify`, `intent-intake`, `decompose`, `dispatch`, `work-generation`) | **Rewritten** | The birth door, routing by the menu, what a job starts with by its inputs (D) | F-h (with 4, 7) | — |
| 28b | Hamza's chat lane (`chat-drain`, `chat-legs`, `morning-briefing`) | **Repaired at the seams** | Turns as runs through the model door; one conversation store; his hands are B64's | O | B65 |
| 28c | Critical gate (`critical-gate`) | **Repaired** | Its seats become check parts (A28, A32); it verifies, never refutes; its command-line run passes the model door and the isolation | F-h | — |
| 28d | Projects family and the revenue tables beyond the ledger | **Inventory first** | Not read by the dossier; carried with company keys once read; their rework is B83's | O | — |
| 28e | The system clock (pg-boss) | **Kept** | System routines only, in its own schema; periods and catch-up (F) | o | B76 (catch-up) |
| 29 | Shared package (`getDb`, contracts, types) | **Repaired** | A pool per service login; types generated from the new schema | o | — |
| 30 | Tests (195 files) and the bench | **Carried where valid, rewritten where they pin the old shape** | The carry list per part; by subject; as the service roles | with each part | B74 |
| 31 | The specs' base texts | **Rewritten in place** with each part | Dead text deleted; unstated subjects get their home | the lead | — |
| 32 | The data move and the key turn | **New** | §6 stage 5 | F-x | — |
| 32a | The bench tools (chain runner, rebuild and upgrade tests, test lock) | **New** | §6 stage 0 | F-h | — |
| 33 | The dashboard | **Not judged** | B32, B81 | — | — |

Each runtime guard that stays (the API-spend cap, the breaker, the hook's monitors, the spill) and each one that goes
(row 22) answers five questions from its own log first: which failure it prevents, how often that still occurs, what
it costs, whether it can be simpler, what happens without it. The construction's own hooks take the same questions.

## 6. The order of the build

Each stage ends with something that runs.

- **Stage 0 — the bench.** The chain's runner, the roles, the new schema beside the old one in the construction
  engine, the rebuild and upgrade tests, the test-lock script. Proven here, with the old battery running beside it:
  that the two systems' tables, roles, clock and broadcast targets do not meet, and that a service role of the new
  one cannot reach the old tables; the in-process tool door; per-turn usage. From here on B32 and B81 draw their
  screens on the new schema.
- **Stage 1 — one job, end to end, thin.** The story is the brief's own: two example companies, each with two
  clients; a client's mail arrives at one; the right master is given the job; three designs are produced (a stubbed
  model first, then live); the CEO picks; the merged version is checked and delivered once. Built for it, each at its
  thinnest: principals and door authority, the holding's shape, the birth door, jobs, parts, artifacts, desk, runs,
  events, the engine and a seat runner with its identity and the gates that may not be skipped, the model door, the
  request–decision–outbox path with a test handler. Tried inside that one job: a lease passing to a successor while the
  first worker returns late; two events committing in reverse order; a crash after the outward act; the same mail
  twice; a wrong-company client; a seat asking for another client's desk and memory; a service login writing a table
  directly; a decision from someone who is not the CEO, with a real sign-in; a desk grown very large, from which a new
  seat receives a slice under its budget that still carries a decision made at the start; his one-line order for an
  advertisement arriving at the master as a full brief with the creative demands; a second job for the same client
  starting with what the first one learned, no seat having read the first job's desk; an idle hour with zero model calls.
  On the live job, §4's two arms — without the job type's book and with it — are delivered for his blind
  judgement, each with its time, tokens and cost: an indication, not a proof.
- **Stage 2 — each part to its full contract:** rules and locked rules, the three carriers, relay and override; the
  executor's retry and park; the router and attempts; capacity per lane; stop and cancel; patterns, value tiers and
  checks as parts; the clock's catch-up; the views' verdicts.
- **Stage 3 — the seams:** the tool door's full set, the hook's gates, the assembler with book and desk read, context
  measurement and handover with §3's measurement, memory's door, conversations and Hamza's turns as runs, money
  records.
- **Stage 4 — the ports:** HR and revenue jobs, the voice seams, the tool gateway.
- **Stage 5 — the move and the key turn.**
  - Every record family gets its line: moved, kept as a read-only archive, or left with its reason — tasks, runs,
    cost rows, outbox rows, media jobs and routing rules included. The simplest truthful form is proposed: living
    reference data moves (personas, the library, settings and rules he changed, conversations); history stays readable
    where it is — the old schema, in the same database, frozen as an archive. The move is statements inside one
    database, in one transaction.
  - A past actor written as text stays what it is — a legacy principal, not a verified person.
  - Old outward rows are reconciled and none is ever emitted again; the new outbox starts empty.
  - The move has a last-write line, a count-and-sum reconciliation per family, and a way back: the services point
    at the old schema again until it is dropped, and the way back stays safe after the first real act on the new side
    because no outward act is ever emitted twice.
  - Rehearsed on a copy of the real company data — a restore drill of the real backup (B72) — which is a different
    thing from the bench's generated data.
  - **The key does not turn before he has a screen on the new foundation** — B32's first screens, or the screens of
    today on compatibility views (row 27 decides; the owner is B32's) — and the whole holding has run once on the
    construction copy (B76). The resident services, disabled today, come back here, on the new schema. The old
    chain, packages and battery leave here, not before.

The first real figure for what a part costs in quota comes from stage 1 and is told to him with the weeks it implies;
the model and the level are not lowered to fit a week.

## 7. How it is verified

- Per piece: its locked tests green as the service roles; the lead reads the diff and runs them.
- Per stage: the rebuild and upgrade tests, the whole new battery, and the stage's story end to end on the bench —
  stubbed, then live.
- The old battery stays green until stage 5; the old chain is not touched.
- One blind audit pass per stage's commits; the fixes are tested.
- What a terminal cannot observe — whether a surface on these events feels alive — is B32's and is marked so.

## 8. Measured first at the build (UNVERIFIED today)

1. The separation of the two schemas inside the construction engine (stage 0).
2. The in-process tool door and per-turn usage in the session runtime (documented at
   code.claude.com/docs/en/agent-sdk, read 2026-11-22; not run).
3. The login the company's daemons use today and which outward or money keys their environment holds.
4. The unit of the proxy's recorded spend.
5. The handover threshold per model, and §3's comparison.
6. The time and cost of a recall's embedding on the hot path.
7. The quota cost of a part (stage 1).
8. How a resident engine reads the subscriptions' windows without a session.
9. How a step inside a browser is recognised as a payment or contract step (A11's mechanism; with Hermes and B41).
10. The slice's budget and the result's length limit (§3).
11. This design's own claims — zero loss across a crash, zero model calls when idle — until stage 1 runs them.
12. Whether a job type's book makes our jobs better (§4; stage 1 gives an indication for one job type).

## 9. Risks

1. **A rebuild that runs long with nothing new alive.** The thin job first; every stage ends runnable; the old
   system stays whole meanwhile — it is not running today.
2. **Behaviour the old code carries that no document states.** The carry list, views and RPCs included.
3. **The design is drawn before the rival synthesis (B22) and the V2 screens (B32).** It is not claimed compatible
   with a text nobody has read: when the synthesis is written, this design is read against it, and what changes comes
   back to him.
4. **The move.** Small today; §6 stage 5. The off-site backup has failed nightly since 2026-09-25 (B72): the
   restore drill the move depends on waits on that row.
5. **The quota.** The irreversible and weighty parts are Fable 5.2's; middle parts go to Opus 5.5 from fixed specs
   and locked tests; the build is divided over weeks.
6. **A second resident process.** One more thing to keep alive, against credentials that agents' host never holds;
   when the executor is down, outward acts wait in the outbox and nothing is lost. Its load is measured at stage 1.
7. **Over-building.** Not built now: per-company row policies, event sourcing, replay for surfaces, compaction of our
   own, any queue beyond parts, outbox and the clock.

## 10. What needs his yes

1. **A new chain beside the old one** — a schema of its own in the same database, the sound mechanisms carried, the
   old one frozen until the key turns — instead of repairing in place. An architectural choice, not a necessity
   proven of every file. Recommended: yes.
2. **Two resident processes** — the engine, and the outbox executor alone with the outward credentials. Recommended:
   yes.
3. **Row 22** — the limits that cut running work go (his word of 2026-10-28 already says so), the starting limits
   become per-lane capacity, the ladder becomes the return to the owner; each after its five questions. Recommended:
   yes.
4. **One runner.** The workflow spec's records — patterns, line cards, versions, undo — stay; its separate runner
   goes and the engine runs them. Recommended: yes.
5. **The order: one whole job first, thin**, then each part to its full contract. Recommended: yes.
6. **The personas are removed; the workers are agents in seats** (§4, item 2) — his order of 2026-11-22
   <!-- CEO-OK: personas-removed-workers-are-agents-2026-11-22 -->; departments stay. Decided; what waits is his eye on
   the removal list. It changes A27's "filled from the persona pool", A28's named persona seat, A29 items 1 and 14,
   B84 decision 6, B43's seats, C41, the 2026-11-02 linking of the 213 personas to the Web Studio, the persona door
   and the HR package's persona standard — each rewritten in place when the removal is done.
7. **Whether only work he praised may become an example or a pattern.** His words of 2026-11-22 say so; A30 today
   registers a pattern when a type "has finished well a second time", and B64 speaks of his approved work. It is
   written as standing only on his word. Recommended: yes — "finished well" then means praised.

Not asked now: A29 item 6 (§3) — it comes with its measurement. And the build's start: the board's head puts it after
B22's synthesis and his yes to the re-ordered board; the synthesis is the author's next work, and this design is read
against it before stage 0.

## 11. Not in this job

Hamza's hands (B64, B41), the V2 memory, the voice line's speed (B12), the studios' records (B43, B84), revenue cycles
(B83), Hermes (B09–B11), the backup's repair (B72), the dashboard (B32, B81), the rival synthesis (B22). B69 stays its
own row. Each stands on what this job builds.
