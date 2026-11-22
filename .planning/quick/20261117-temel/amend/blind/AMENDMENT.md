# B85 — amendment to the foundation's plan, after the rival synthesis

A draft. Nothing here is in `PLAN.md` and nothing is built. It answers PLAN §9 risk 3 — "when the synthesis is
written, this design is read against it, and what changes comes back to him". The synthesis is
`.planning/research/rival-intel/00-SYNTHESIS.md`: its section 3 names nine things the foundation must carry that PLAN
does not say (F0–F8), its section 4 eleven gaps in "installing an application", its section 5 what a living surface
needs. Each item below: the design, where it enters PLAN, what is unproven. PLAN's eight decisions (§1) stand.

## The decisions this asks of him

Six things here are his to decide; each is marked **[D]** where it stands. Everything else is the lead's design
inside what he approved.

- **D1** — the foundation's resident processes go from two to three: an intake, alone with the read credentials
  (item 5). It changes §10 decision 2.
- **D2** — the spend envelope: one approval may cover many paid calls, per job or as a standing policy per service
  (item 6). It reshapes how the constitutional gate meets money out.
- **D3** — what an application may bring: seat roles, tools, handlers and readers come from its manifest, inside a
  maximum and a floor the foundation keeps (part M). Role ceilings stop being one code-owned file.
- **D4** — what his switch of a brain means: the model a seat's weighty parts run on; a lighter part may run lighter
  by the master's recorded choice; a minimum by the part's weight is kept by code (item 9).
- **D5** — autonomy is decided per job type and act class, not per employee (item 9).
- **D6** — a master may open a child job of another type when the signed deal's service includes it; outside the deal
  it stops at him (part M).

## M. An application on the foundation (new part of §2; answers F0) **[D3]**

The requirement, in one sentence: **a new line of business — a web studio, an advertising agency, a customer desk —
is added without patching the foundation, and works in harmony with the rest.** He pictured it on 2026-11-22 with a
loose analogy (programs installed on an operating system) and said himself that it was only an analogy: the holding
is not building a general operating system or an app platform. "Application" below is a working name for a line of
business's own part, and nothing here is built beyond what the holding's own lines need. The contract is stated once.

**The rule, said honestly.** An application touches the foundation only through its doors and its published read
contracts. Installing one changes **no hand-written file and no table of the foundation**. What installing does add
or change is this and nothing else: the application's own folder; rows; its own namespace in the chain; **generated**
registry entries (handlers, readers), built from the manifests and never edited by hand; entries in the dependency
lockfile when its code needs a library; entries in the secret store, set by the install step outside the repository
(as §2 A does for logins). A ruler in the battery fails a change whose hand-written diff leaves the application's
folder, and regenerates the registries and compares.

**The first thing that would force a foundation change**, known now: a new *kind* of artifact the shell cannot
render (the shell renders a closed set — image, video, audio, document, a sandboxed web preview, a file), a new
lane, a new event type. Each is a versioned change to the foundation, said as such; an application does not carry it.

**What an application is.** A folder with one manifest. The chain applies a manifest as one versioned change, in
one transaction with its ledger row (§2 A). The manifest declares, and nothing else does:

1. **Its job types.** For each: the menu card (when chosen, examples — A26), with every name he sees in both
   locales; the seat role that owns its jobs (A27) and the seats a job starts with; the parts and checks it **adds**
   as mandatory, by value tier and by whether the work goes to a client; the default weight of its kinds of part
   (item 9); its patterns; its book — a row with the book's path, version and hash, the content being B64's; and the
   services of the price policy that map a signed deal to it, each service naming the job types it includes
   (REVENUE_ENGINE §7sexies).
2. **The seat roles it brings.** A role is declared with its ceiling — tool tags, act classes, data scope — inside
   the foundation's maximum for the kind "agent" (§2 C: no credentials, no decision of an approval, no naming of
   another actor, nothing outside the job's company and client, no foundation tool the maximum does not list).
3. **Its tools.** Each a row at the tool door with its pin, its tags and the roles that may hold it.
4. **Its outward acts** (below).
5. **Its readers** (item 5).
6. **Its own records.** Tables in a namespace of its own inside the same chain; every row carries the job's company
   by the composite key (§2 B). **The role model:** one owner role per application, with no login and no right on
   any foundation table; its door functions are owned by that role, check the caller through the foundation's own
   authority function, and are the only way its tables are written; the seat runner's login gets EXECUTE on them
   and nothing on the tables. The application reads the foundation only through the foundation's published read
   contracts; its own views are company-scoped by the caller's authority and are tested as the service roles (§2 K).
   An application has no login and no resident process of its own.
7. **Its area on his screen:** the read contracts it offers, which the surface composes; each artifact it produces
   names its kind from the shell's closed set. B32 owns the shell.

**The floor a manifest cannot go under.** As roles have a maximum, checks have a minimum that is the foundation's:
the steps of the seat runner that no flag skips — the quality gates and the halal screen (§2 H) — and the check path
A28, A30 and A32 fix by the job's class (client work one checking seat; valuable or risky work two, blind). A
manifest can only add to them.

**An application's outward acts and readers — code beside credentials.** A handler or a reader is code in the
application's folder, named in the manifest **with its content hash**; the registry stores the hash, and the
executor or the intake refuses code whose hash differs. So a later edit is a new manifest version — a versioned,
audited change — and never passes as "inside the folder". Further:
- an action type is namespaced by its application; a foundation type cannot be registered again or overridden;
- a new action type is born **gated**; it becomes notify or autonomous only by his rule;
- **each act runs as a child process that receives only the one credential its manifest names** (§2 C's allow-list,
  verdict row 26) — no handler sees another's key;
- the request records the handler's version at the decision; executing under another version is refused and the
  request returns to the decision ("a change after approval voids it", §2 H);
- a mismatch in the *foundation's* handlers stops the executor (kept); a mismatch in an *application's* parks that
  application's acts for review with an alert, and every other act of the holding goes on;
- handler and reader code is written and verified at the level PLAN §5 gives the gate — Fable 5.2 at xhigh — whoever
  the application belongs to.

**What an application does not bring.** No event type: the catalogue stays closed — a shot rendered or a page
deployed is a part finishing with an artifact version, and finer beats are item 2's. No lane: its machine work runs
in the foundation's lanes. No queue, no timer (item 4), no store of conversation or memory, no model call outside
the model door.

**One job type calling another — the child job [D6].** A site needs a film. The film is a **child job** of the media
type — its own master, desk, checks and price card — linked to the parent part that waits on it; the parent receives
the child's delivered artifact version and short result, and neither desk grows into the other. Stated, so nothing
is left to the build:
- *Who may open it:* when the signed deal's service lists the child's job type, the birth door opens it with the
  parent's master as the giver, recorded and logged. When it does not, it is a change to what was sold — an offer to
  the client and a price — and stops at him or at the price policy's rule.
- *Money:* a child never draws on the parent's envelope (item 6) unless the approved envelope names that job type
  and an amount for it.
- *Failure and time:* a failed child blocks the parent part with an event and returns it to the parent's master; a
  cancelled parent cancels its children (§2 F: cancelling reaches work in flight); the parent's wait carries a due
  time (item 4) and wakes the master when it passes.
- *Acceptance:* the child delivers through its own checks; the parent's master accepts it or returns it with notes,
  which opens a new part in the child job.
- *Bounds:* one level — a child opens no child; same company and client as the parent, by the composite key.
*Unproven:* tried at stage 2 on one site that needs one film.

**Switching off, upgrading.** A manifest is versioned. Per job, fixed for its life: pattern, book, the checks of its
type. Per request, fixed at the decision: the handler's version. A job type switched off takes no new job and its
open jobs finish. An application's tables are **retired** — closed for writes, kept — never dropped (§2 A).

**Proven, not assumed — which stage tries which clause:** stage 1, clauses 1–3 (a second job type by its manifest
alone, the count of what changed outside its folder reported; target zero); stage 2, clauses 4–7 on the first
application the re-ordered board names, installed whole — a real handler, a real reader, its own tables and doors;
stage 4, one upgrade and one switching off. What a trial shows missing comes back into this part.

## 1. Life at rest (§2 E, §2 F; answers F1)

One table: a row per resident process (the engine, the executor, the intake, and the voice daemon PLAN keeps as its
own), per lane, per channel, connector and tool server, and for the model door. A process writes **its beat's time**
and nothing else; a clock routine's probe writes what it found for a part that is not a process. Never a model, so
rest costs no token.

**Four states he can be shown, each derived, none claimed by the part itself:** *working* — a run in flight on it;
*resting* — its beat is inside its period and nothing is in flight; *stopped* — its beat is overdue (a dead process
cannot say so, so the reader derives it); *unknown* — it has never beaten, or its probe could not tell. A stopped
part is never drawn as resting.

The engine's beat is written **by the loop that claims work**, on each pass, and the loop wakes at least once per
interval to do so — a dead work loop cannot beat. Liveness changes notify a system channel of their own (item 2's
channels are per job). The attempt row keeps the time of its last lease renewal, which is a working seat's beat.
*Unmeasured:* the interval. *The limit, written into the contract:* with no model call at rest the system knows that
its gateway answers and what the subscription window last read — not that a provider's model would answer.

## 2. Which writes tell a surface to look (§2 E; answers F2)

The `events` table stays one row per state change. Beside it, every door write notifies its job's channel "look" — a
tool call's start and end, a desk entry, an artifact version, a new attempt, an outbox row's move — with no content,
coalesced to at most one a second per job. The surface re-reads state. Nothing follows a live trail. Reading the
trail of a **closed** period in order (B10's finished night) is a report over finished rows, not a consumer; PLAN's
sentence "no replay, no cursor" is narrowed to say so.

## 3. The conversation, and the surface that follows it (§2 C, §2 D, §2 I; answers F3)

`conversations`: the company, his counterpart — Hamza, or a job's master (A26) — and the job when there is one.
`turns`: the speaker's principal, chat or voice, the text, the run that answered, and where he stood — the page and
the thing in focus — as the surface reported it; in the assembler that is per-turn material and stands last (§2 I).

`surface_show` is a foundation tool, held only by his counterpart in a conversation — no manifest can grant it. At
the door: it is accepted only from the run answering the current turn of an open conversation with him; its target
is one of a closed list of kinds, named by identifier — a job, a part, an artifact version, a company, a registered
page — never content and never an address; a seat shows only what its authority lets it read; it can bring an
approval into view and can never focus or press a decision. An artifact that is a web page is shown in a sandbox
that does not carry his session — a requirement on B32's shell. Inward, logged, not gated.

## 4. Time as something to wait on (§2 D, §2 F; answers F4)

A job or a part may wait on a time: `wake_at`, and `not_after` where lateness makes it wrong. The engine's LISTEN
sleeps until the nearest due wait, capped at the one-minute sweep; a due wait makes its part ready through
`part_transition`. A wait that comes due while the engine was down fires once on its return if `not_after` has not
passed; otherwise it does not fire and returns to its owner. A line's next run is such a wait, re-armed at each
firing with the clock's rule — each missed period once. **This is the only timer work has;** pg-boss stays for the
system's own housekeeping.

## 5. Intake — a third resident process (§2 F, §2 C, §2 H; answers F5) **[D1]**

**The engine, the outbox executor, the intake.** The intake is alone with the read credentials — a mailbox, a
store's orders, a payout feed, advertising and content figures, a calendar, a signed webhook. It is a supervisor;
**each reader runs as its own child process**, with the one credential its manifest names and a database login that
can call **one door**: `inbound_receive` (with the source's own key, so the same mail is one record), the revenue
door, or `measurement_record`. A parser broken by a hostile mail holds a mailbox's read key and the right to file an
inbound message — nothing else.

- **Money in comes only from an authenticated feed** — the payment or store provider, read with the holding's own
  key or a verified signature. A mail can never book revenue or mark a deal paid.
- An inbound message records how its sender was verified (the mail's authentication result, a platform's verified
  sender). Its text is information, never a command (A26). A client's acceptance that releases a delivery or an
  invoice counts only on a verified channel or by the account owner's confirmation.
- Where a provider cannot issue read-only access, the manifest says so, and that reader is treated as outward-capable
  code.

*Why not inside the executor:* the process that parses what strangers send must not be the one that can send, publish
and pay. *Why not inside the engine:* it is the agents' host and holds no credential (§2 C). *The cost:* a third thing
to keep alive; when it is down nothing is lost — mail waits at its provider — and its liveness row says so.
*Not designed here:* how a webhook is exposed to the outside (with the server's row).

## 6. Paid routes and the spend envelope (§2 G, §2 H, §2 J; answers F6) **[D2]**

**(i) Every generation is on the record.** An image, video, voice or music generation has a run before the call and
one attempt row per render — the engine, the outcome, the duration, the cost in money or in seconds on the card. A
call on the **local card** is made by the studio-hands lane. A call on a **paid route** — a generation engine or any
other priced call (a data service, a scraper) — is an outward act with money: an action request, executed by a
handler in the executor, which alone holds the key.

**(ii) The envelope.** One approval may cover many paid calls. Two forms, both his:
- *the standing policy:* he sets once, per service of the price policy, how much a job of that service may spend on
  which paid routes. A job born under it gets its envelope without stopping at him, logged — the pattern of A10
  (a contract inside the approved price policy). This is what keeps client work from stopping at him job by job;
- *the single envelope:* for a job no policy covers, or to raise a cap — one gated request, his decision.

**What makes it hold — nothing spends past what he approved:**
- before each call the route's **maximum** price for that call is reserved, in the same transaction that lets the
  request through; the database refuses a reserve past the cap. A route with no computable maximum is not eligible:
  each of its calls is gated singly;
- after the call the provider's real charge is settled against the reserve — a failed render that was billed is
  booked as billed — and written as the expense row (§2 J);
- the envelope is in one currency; a route billing in another reserves and settles at the period's recorded rate
  (§2 J), so a draw does not move with the market;
- it ends with its job, or at its own expiry (item 8), and what is unused is released; a child job has its own
  (part M).

**Against his word of 2026-10-28**, named: nothing cuts a running job for its cost. The envelope cuts nothing that
runs — it refuses to *start* the next paid call past the cap (PLAN §2 F: capacity limits starting, never running).
The master is warned at a threshold, the part then waits on his decision, and work that needs no paid route goes on.

**Advertising spend on a platform is not an envelope by default:** each change of a budget is its own gated act, on
the channel's own account (the company's, or the client's — the channel row says whose); the amount billed is read
by the intake from the platform's billing feed and booked as expense; pausing or lowering spend is never gated.

## 7. A company's objective (§2 J; answers F7) — its home is named, it is built with B32's card

`objectives`: the company, the measure, the amount, the currency, the period, set by him; the realised figure
derived, never stored. Not built until the screen that shows it is.

## 8. A request can expire (§2 H; answers F8)

`action_requests` and envelopes may carry `expires_at`, set by the rule table per class. An expired request is
closed with its event and never executed; a decision after it is refused with a true sentence. No class expires
until he says which and after how long.

## 9. Two rules the board's rows would otherwise contradict

- **Which brain a part runs on [D4].** A part carries its **weight** — what an error in it costs — from a closed
  list, set by the master when it cuts the job, with the manifest's defaults for the type's kinds of part. Rules he
  owns (the router, §2 G; MODEL_ROUTING §4d) keep a **minimum brain per weight**, in code: an important part cannot
  run on a weaker model to save cost. His switch on an employee or a seat (B08, B43 R24) sets what that seat's
  weighty parts run on; a light part may run lighter by the master's choice, with its reason recorded.
- **Autonomy [D5]** is decided per job type and act class — the rule table — not per employee (B15). A line keeps
  its own autonomy step.

## His two examples, walked — every step and its home

| Step | Home |
|---|---|
| The client writes: a shoe brand, an advertisement / a website | intake → `inbound_receive` → Reception (A26, door 2) → the account's owner or sales |
| The offer, the price, the signed deal | CRM and the price policy (REVENUE_ENGINE §7sexies); inside the approved policy autonomous and logged (A10), outside it his |
| The job is born with its brief | the birth door, by the deal's service → its job type (M.1); the standing envelope with it (6) |
| The plan; the parts with their weights | the type's master (A27, A30); item 9 |
| The film a site needs | the child job (M) |
| Images, video, voice | attempt rows; the local card, or a paid route inside the envelope (6) |
| The checks | the foundation's floor and the type's additions (M); a failed check returns to the owner (§2 F) |
| His choice, when the type asks for one | a wait on him; his verdict on an artifact version (§2 D) |
| The delivery | an outward act by the application's handler (M), naming the artifact version |
| The client accepts | an inbound message on a verified channel (5), recorded on the artifact version |
| The invoice and the payment | an outward act; revenue from the provider's feed (5), on company, client and job (§2 J) |
| What it cost | attempt rows and expense rows; realised net per job (§2 J) |
| Hosting, a domain, a running campaign after delivery | a line with its owner and budget (§2 D); ad spend as item 6 says |
| Where an asset came from and its licence | the artifact's own record — B43's and B84's content |
| What was learned | proposed into the book's notes and memory at the close (§3) |

## The synthesis's gaps and needs, one line each

| Synthesis | Answered by |
|---|---|
| §4 gap 1, 2 (what a job type registers; its content) | M.1 |
| gap 3 (the book registered and versioned) | M.1 |
| gap 4 (seat roles, lanes) | M.2; no application lane |
| gap 5 (outward acts) | M, "code beside credentials" |
| gap 6 (its own records) | M.6 |
| gap 7 (events) | "does not bring" |
| gap 8 (a part under another type's book) | the child job |
| gap 9 (the order half) | M.1's services; the walk above |
| gap 10 (the surface) | M.7 |
| gap 11 (retiring, upgrading) | "switching off, upgrading" |
| §5: liveness for every part; lane readiness | item 1 |
| §5: the lease renewal's time | item 1 |
| §5: the writes that notify; a closed period | item 2 |
| §5: the turn's place | item 3 |

## What this adds to the order of the build (§6)

- **Stage 0:** the manifest's shape, the generated registries, the ruler; the liveness table.
- **Stage 1**, added to the one job's trials: zero model calls in the idle hour *and* the liveness rows advancing, a
  stopped engine shown as stopped; the client's mail read by a reader under its own login; one wait on a time that
  fires once; the conversation store at its thinnest — his order's turn carrying the page he is on; the second job
  type installed by its manifest (M.1–3).
- **Stage 2:** the envelope and expiry; attempt rows for generation; the first application installed whole
  (M.4–7); the child job on one site that needs one film; the "look" notifications.
- **Stage 3:** `surface_show`; a conversation with a job's master; each tool's liveness at the tool door.
- **Stage 4:** one upgrade and one switching off of an application.

## Unmeasured, added to §8

13. The engine's beat interval and the "look" coalescing window.
14. That a second job type installs with zero hand-written changes outside its folder (stage 1), and a whole
    application at stage 2.
15. The child job — whether a master waiting on another type's job keeps its own job small and on time.
16. The intake's load, and its behaviour with a provider that rate-limits.
17. What a connector's probe costs and how often it may run without tripping a provider.
18. That every paid route in use can state a maximum price per call.
19. That a handler as a child process per act is fast enough for the customer desk's 60-second answer.

## Risks this adds

- **More foundation before the first job runs.** Held by the order: stage 1 builds each of these at its thinnest.
- **A manifest too rigid for the next line of business.** It is versioned; what a trial shows missing comes back.
- **A third resident process** — item 5's cost.
- **The standing envelope lets money leave without his eye on each job.** It is his own rule, per service, with a
  cap per job, a reserve the database enforces, and an expense row per call; he can withdraw it in one act.
