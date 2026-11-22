# B85 — amendment to the foundation's plan, after the rival synthesis

A draft. Nothing here is in `PLAN.md` and nothing is built. It answers PLAN §9 risk 3 — "when the synthesis is
written, this design is read against it, and what changes comes back to him". The synthesis is
`.planning/research/rival-intel/00-SYNTHESIS.md`; its section 3 names nine things the foundation must carry that PLAN
does not say (F0–F8), its section 4 the gaps in "installing an application", its section 5 what a living surface needs.
Each item below: the design, where it enters PLAN, what stays undecided or unmeasured. PLAN's eight decisions (§1)
stand; item 5 changes one of the seven he said yes to (§10, decision 2) and is marked so.

## M. An application on the foundation (new part of §2; answers F0)

His picture, 2026-11-22: an operating system first; then each line of business is installed on it like a program and
works in harmony with the rest. The contract that makes this true is stated once, here.

**The rule.** An application touches the foundation only through its doors. Installing one adds rows and files of its
own; it changes no table and no file of the foundation. A ruler in the battery fails an application's change whose
diff leaves its own folder.

**What an application is.** A folder of its own with one manifest. The chain applies the manifest as one versioned
change, in one transaction with its ledger row — the same discipline as §2 A. The manifest declares, and nothing else
does:

1. **Its job types.** For each: the menu card (when it is chosen, examples — A26); the seat role that owns its jobs
   (A27) and the seats a job starts with; **the parts and checks that are mandatory for its jobs**, by value tier and
   by whether the work goes to a client (A28, A30, A32 choose among them; the type says which exist) — this is what
   §2 D's closing law reads; its patterns; its book and the book's version; the services of the price policy that
   map a signed deal to it (REVENUE_ENGINE §7sexies).
2. **The seat roles it brings.** A role is declared with its ceiling — tool tags, act classes, data scope. The
   foundation keeps one maximum for the kind "agent" (§2 C: no credentials, no decision of an approval, no naming of
   another actor, nothing outside the job's company and client); a manifest can only narrow inside it. The role
   ceilings stop being one code-owned file: they are the foundation's maximum plus the manifests.
3. **Its tools.** Each a row at the tool door with its pin, its tags and the roles that may hold it.
4. **Its outward acts.** A handler is code in the application's folder, named in the manifest, and enters the one
   handler registry by it; the executor still refuses to start when handlers and registry differ. A new action type
   is born **gated**; it becomes notify or autonomous only by his rule. A handler runs inside the executor, beside
   the outward credentials, so it is written and verified at the gate's level (F-x), whoever's application it is.
5. **Its readers** (item 5 below), the same way: code in its folder, a line in the reader registry.
6. **Its lane, if it has machine work of its own:** the lane's name, the setting that holds its capacity, and the
   probe that says whether it can start (item 1 below).
7. **Its own records.** Tables in a namespace of its own inside the same chain; every row carries the job's company
   by the composite key (§2 B); they are written only through the application's own door functions, which run under
   the calling run's identity and authority (§2 C). An application has no login and no resident process of its own.
8. **Its area on his screen:** the read contracts it offers — views over its own tables and the foundation's — which
   the surface composes. An application writes no screen into the foundation; B32 owns the shell.

**What an application does not bring.** No event types: the catalogue stays closed. A shot rendered or a page
deployed is a part finishing with an artifact version; finer beats are item 2's. No queue, no timer (item 4), no
store of conversation or memory, no model call outside the model door.

**One job type calling another.** A site needs a film. The film is not a part worked under a foreign book: it is a
**child job** of the media type — its own master, desk, checks and price card — opened through the birth door by the
site's master with the reason recorded, and linked to the part that waits on it. The parent part waits on the
child's delivery and receives its delivered artifact version and short result; the child's desk stays the child's,
so neither desk grows into the other; money rolls up through the link. One column on `jobs` (the parent part), no
new mechanism. *Unproven:* tried at stage 2 on one site that needs one film.

**Switching off, upgrading, removing.** A manifest is versioned. A job keeps the versions it started on (§2 D). A
job type switched off takes no new job and its open jobs finish. An application's tables leave by a versioned change
only when no open job references them; history is never deleted (§2 A).

**Proven at stage 1, not assumed:** a second job type is installed by its manifest alone, and the count of what had
to change outside the application's folder is reported. The target is zero; what is not zero comes back into this
part before stage 2.

## 1. Life at rest — a liveness row for every resident part and every link (§2 E, §2 F; answers F1)

One table: a row per resident process (engine, executor, intake, voice), per lane, per channel, connector and tool
server, and for the model door. Each row: when it last beat, when the next beat is due, what it last knew, and a
state that is one of *up*, *down*, *unknown*. Written by code only — a process on its own beat, a clock routine's
probe for what is not a process — never by a model, so rest still costs no token. The surface draws a part alive
while its row is inside its period and at rest otherwise; *unknown* is drawn as unknown.

The engine beats on its own row at a short fixed interval, apart from the one-minute sweep, so a stopped engine
shows within seconds. *Unmeasured:* the interval (a setting).

One limit is written into the contract so the screen never says more than is known: with no model call at rest the
system knows that its gateway answers and what the subscription window last read — not that a provider's model would
answer.

## 2. Which writes tell a surface to look (§2 E; answers F2)

The `events` table stays what it is: one row per state change. Beside it, **every door write notifies its job's
channel "look"** — a tool call's start and end, a desk entry, an artifact version, a new attempt, an outbox row's
move — with no content, coalesced to at most one a second per job. The surface re-reads state, as §2 E already
orders. No new event type, no replay. One sentence is added: the trail of a **closed** period may be read in order
(B10's replay of a finished night); following a live trail stays unbuilt.

## 3. The conversation, and the surface that follows it (§2 C, §2 D, §2 I; answers F3)

`conversations`: the company, his counterpart — Hamza, or a job's master (A26) — and the job when there is one.
`turns`: the speaker's principal, chat or voice, the text, the run that answered, and **where he stood** — the page
and the thing in focus — as the surface reported it. In the assembler that place is per-turn material and stands
last (§2 I), so the cache order holds.

`surface_show` is an inward act at the tool door: Hamza, or the master he is talking with, names a job, a part, an
artifact or a page, and a row is written that his surface follows. It is not an outward act and is not gated; it is
logged like any tool call, and a seat can show only what its authority lets it read.

## 4. Time as something to wait on (§2 D, §2 F; answers F4)

A job or a part may wait on a time: its wait carries `wake_at`. The engine's LISTEN sleeps until the nearest due
wait, capped at the one-minute sweep; a due wait makes its part ready through `part_transition`, with its event. So a
reminder, a follow-up, a scheduled publication and a retry-later are waits of a job, not routines. A line's schedule
fires the same way, with the clock's rule kept: each missed period once. pg-boss stays for the system's own routines.

## 5. Intake — a third resident process (§2 F, §2 C, §2 H; answers F5) — **changes §10 decision 2**

He said yes to two resident processes. This makes them three: **the engine, the outbox executor, the intake.** The
intake is alone with the *read* credentials — a mailbox, a store's orders, a payout feed, advertising and content
figures, a calendar. Each reader has its own principal. What it reads lands through a door and never as a direct
write: `inbound_receive` (with the source's own key, so the same mail is one record), the revenue door, or
`measurement_record` for figures; the door writes its event and the engine wakes.

*Why not inside the executor:* a reader parses what strangers send. The process that parses untrusted mail must not
be the one that can send, publish and pay. The intake holds no outward credential and is the quarantine line that
memory's door already assumes (§2 I). *Why not inside the engine:* it is the agents' host and holds no credential at
all (§2 C). *The cost:* a third thing to keep alive; when it is down, nothing is lost — mail waits at its provider —
and its liveness row says so.

## 6. Generation engines and the spend envelope (§2 G, §2 H, §2 J; answers F6)

**(i)** An image, video, voice or music generation passes the model door like any carrier: a run before the call, one
attempt row per render — the engine, the outcome, the duration, and the cost in money on a paid route or in seconds
on the card. The key of a paid route lives where outward keys live, never in a seat's process.

**(ii)** One approval may cover an **envelope**: for this job, on these routes, up to this amount in this currency.
The envelope is an action request with its own hash; he approves it once. Each paid call is a request the classifier
finds inside an approved envelope and lets through; the draw is booked in the same transaction, and the database
refuses a draw past the cap — the next call is then a new gated request. Every executed paid call writes its expense
row (§2 J). Money out still stops at him: he approves the envelope, not each render. It is the pattern A10 already
uses for a contract inside the approved price policy.

## 7. A company's objective (§2 J; answers F7)

`objectives`: the company (the holding as root included), the measure, the amount, the currency, the period, set by
the CEO's principal; a new row supersedes the old one and leaves it. The realised figure is derived from the revenue
and expense rows and never stored. The numbers are his. Verdict row 28d's inventory says whether an old table's rows
move into it.

## 8. A request can expire (§2 H; answers F8)

`action_requests` may carry `expires_at`, set by the rule table per class. An expired request is closed with its
event and never executed; a decision given after it is refused with a true sentence; the executor's re-check at
execution includes it. No class expires until he says which and after how long.

## 9. Two sentences that settle what the board's rows would otherwise contradict

- **His switch of a brain sets the floor** (B08, B43 R24 against §2 G): what he sets for an employee or a seat is the
  floor the master's choice per part cannot go under; his word on one job is one logged override on that job.
- **Autonomy is decided per job type and act class** — the rule table — not per employee (B15 against §2 C, §2 H). A
  line keeps its own autonomy step.

## What this adds to the order of the build (§6)

- **Stage 0:** the manifest's shape and the ruler that keeps an application inside its folder; the liveness table.
- **Stage 1**, added to the one job's trials: in the idle hour zero model calls *and* the liveness rows advancing, and
  a stopped engine shown as stopped; the client's mail read by the intake under its own principal; one wait on a time
  that fires once; a turn that carries the page he is on; **the second job type installed by its manifest alone.**
- **Stage 2:** the envelope and expiry; attempt rows for generation engines; the child job on one site that needs one
  film; the "look" notifications; the read contracts an application's area stands on.
- **Stage 3:** `surface_show` and each tool's liveness at the tool door; the conversation store; the objective.

## Unmeasured, added to §8

13. The engine's beat interval and the "look" coalescing window.
14. That a second job type installs with zero changes outside its folder (stage 1).
15. The child job — whether a master waiting on another type's job keeps its own job small and on time (stage 2).
16. The intake's load and its restart behaviour with a provider that rate-limits.
17. What a probe of a connector costs and how often it may run without tripping a provider.

## Risks this adds

- **More foundation before the first job runs.** Held by the order: stage 1 builds each of these at its thinnest, and
  the manifest is proven on one real second job type, not designed in the abstract.
- **A manifest that is too rigid for the next line of business.** It is versioned; what stage 1's rehearsal shows
  missing comes back before stage 2.
- **A third resident process** — item 5's cost.
