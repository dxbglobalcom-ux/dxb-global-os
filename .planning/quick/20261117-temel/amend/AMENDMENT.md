# B85 — amendment to the foundation's plan, after the rival synthesis

The amendment as it stands after two blind audits (`fable-audit.md` on the first draft, `ASTRA.md` on the second; the
audited second draft is `blind/AMENDMENT.md`). A draft: nothing here is in `PLAN.md` and nothing is built. It answers
PLAN §9 risk 3 — "when the synthesis is written, this design is read against it, and what changes comes back to him".
The synthesis is `.planning/research/rival-intel/00-SYNTHESIS.md` (its §3: F0–F8; its §4: eleven gaps; its §5: what a
living surface needs). PLAN's eight decisions (§1) stand.

**What the second audit changed.** The second draft built more than the board's offices need and, in three places,
replaced a decision of his with a new mechanism. Cut, each with what is lost:

| Cut | Why | Lost |
|---|---|---|
| The manifest, the generated registries, the zero-diff ruler, a per-office owner role, office handlers and readers holding a credential, the upgrade and retirement lifecycle (old part M, D3) | PLAN §2 B already says what an office is — a department and job types on the menu — and §11 leaves the studios' records to their rows. B43's own plan needs a proxy change and a remote lane, which the "zero change" promise would have forbidden | automatic packaging of offices nobody has asked for |
| The child job (D6) | A26 gives mixed work to the master of its main deliverable, A27 gives a specialist part on that job, and B84 already asks for B43's two tools "priced on the same card and stopped at the same approval" | a second master, desk, price and acceptance for a site's film — which neither of his examples needs |
| The standing spend policy (D2) | B43 carries his decision of 2026-10-18: one priced card per job, retakes free under its ceiling. A standing policy would have issued spend without a card reaching him | nothing he asked for |
| The part "weight" list and the change to his brain switch (D4) | PLAN §2 G (the master's choice per part with its reason, the per-employee floor, one router) and MODEL_ROUTING §4d and §4f already hold it: the class decides, the brain is a floor and never lowered | nothing |
| Autonomy "per job type, not per employee" (D5) | B15 carries both — the employee dial and his per-job-type lift of A9 — and neither retires the other | nothing |

## The one decision this asks of him

- **D1 — the foundation's resident processes go from two to three: an intake, alone with the credentials that read
  the outside** (item 5). It changes §10 decision 2. Recommended: yes — the process that parses what strangers send
  must not be the one that can send, publish and pay; its worth is shown at stage 1 with one real reader.

Everything else below is the lead's design inside what he approved, or his own earlier decision carried to its place.

## M. How the board's offices sit on the foundation (added to §2 B; answers F0)

He said the picture of programs on an operating system was only an analogy: the offices and rows already on the board
are to sit soundly on the foundation, and nothing new is invented. So this part is a list, not a mechanism.

An office — the web studio (B84), the media studio and its platform hub (B43), the revenue lines (B83) — is what
PLAN §2 B says: a department and job types on the menu. What it adds, each through a door or the chain the foundation
already has:

1. **Its job types** — menu rows (the card of A26, both locales), the owning seat role (A27), the checks it adds, its
   patterns. The menu is his policy (§2 A): seeded once, then the database is the truth; a new default reaches a live
   database as a versioned change that says what it changes, and never overwrites a row he changed.
2. **Its book** — a row with path, version and hash (B64's content). A job pins the version it started on (§2 D); a
   version stays readable while a job pinned to it is open.
3. **Its seat roles and tools** — inside the role ceilings, which stay the code's own reference data (§2 A, §2 C);
   tools as rows at the tool door.
4. **Its own records** — ordinary tables in the foundation's chain, added by versioned change at the row's rank,
   company and client carried by the composite key (§2 B), written only through door functions under §2 C's authority
   check — run, role, act, job, company **and client**, for reads too. Tried with two clients inside one company, a
   stale attempt, and a direct call under the runner's login.
5. **Its outward acts** — classified operations in the one handler registry (§2 H), written and audited as gate
   code. Office code prepares validated arguments; it never holds a credential. An action under a new name keeps the
   locked class of the effect it performs.
6. **Its area on his screen** — read contracts B32 composes; an interactive choice (B84's three home pages) goes
   through PLAN's own verdict on an artifact version (§2 D), not a door of the office.

**What is a change to the foundation, said as one when it is met** — a new lane, a new event type, a new kind of
artifact, a change to the proxy's configuration. Known now: B43's remote lane (provider concurrency, restart and
poll) and its pass-through paths in the proxy. Each is a versioned change at that row's rank, not forbidden and not
hidden. The new "media" event channel stays his open decision at B43's rank (2026-10-26); item 2 does not settle it.
A spec adaptation a row owns is made in its spec (§2 L).

**Mixed work — a site that needs a film.** One job, the site's. The film is a part on it: the site master
commissions it through B43's `media_quote` and `media_submit`, on the job's own card; the part names the media
book's version, the checks, the quoted lines and the artifact version that comes back; the site master integrates and
checks the finished site. A request beyond what was sold is a new offer by sales (REVENUE_ENGINE §7sexies 6).

## 1. Life at rest (§2 E, §2 F; answers F1)

One table: a row per resident process (the engine, the executor, the intake, the voice daemon), per lane, per
channel link, connector and tool server, and for the model door. No model writes it, so rest costs no token.

Each row keeps apart: **when it was last observed**, **what was observed** (answers, failed with what, unknown),
**readiness** where the thing has capacity (a lane: free, full), and nothing about work — work in flight is read from
the runs. A process writes its own beat; a clock routine's probe writes what it found for a thing that is not a
process. The engine's beat is written by the loop that claims work, so a dead work loop cannot beat.

What he is shown is derived by the reader, on the reader's own clock, in this order: **stopped** — the beat is
overdue; a run still open on it is shown as stranded work, never as "working"; **failed link** — the process beats
and its probe failed; **working**; **resting**; **unknown** — never observed, or the probe could not tell. Zero and
unknown are different answers. A dead writer sends no last notification: the surface's own timer and its slow reread
find the overdue beat. The attempt row keeps the time of its last lease renewal — a working seat's beat.

*The limit, written into the contract:* with no model call at rest the system knows that its gateway answers and what
the subscription window last read — not that a provider's model would answer. *Unmeasured:* the beat interval; what a
probe costs and how often it may run.

## 2. Which writes tell a surface to look (§2 E; answers F2)

`events` stays one row per state change. Beside it every door write notifies its job's channel "look" — a tool
call's start and end, a desk entry, an artifact version, a new attempt, an outbox row's move — with no content,
coalesced to at most one a second per job, **and the last write in a window is always followed by a notification**;
the slow reread stays. The surface re-reads state; nothing follows a live trail. Reading the trail of a closed period
in order (B10's finished night) is a report over finished rows; PLAN's "no replay, no cursor" is narrowed to say so.

## 3. The conversation, and the surface that follows it (§2 C, §2 D, §2 I; answers F3)

`conversations`: the company, his counterpart — Hamza, or a job's master (A26) — and the job when there is one.
`turns`: the speaker's principal, chat or voice, the text, the run that answered, where he stood as the surface
reported it (untrusted context; per-turn material, last in the assembler — §2 I), **and where the answer pointed**.

`surface_show` is a foundation tool held only by his counterpart in a conversation. At the door: accepted only from
the run answering the current turn; bound to that turn and to the surface that asked it; its target one of a closed
list named by identifier — a job, a part, an artifact version, a company, a registered page, an approval as a
read-only view — never content, never an address; a seat shows only what its authority lets it read; it can never
focus or press a decision. The surface checks at display that the turn is still the current one of the conversation in
front of him — a late voice answer moves nothing else. A web-page artifact is shown in a sandbox that does not carry
his session (a requirement on B32's shell). Inward, logged, not gated.

## 4. Time as something to wait on (§2 D, §2 F; answers F4)

A job, a part or a line may carry a due time: `wake_at`, and `not_after` where lateness makes it wrong. **A due time
wakes the owner; it never satisfies a dependency** — a part becomes ready only when what it depends on is met (a
reminder that comes due while the job still waits for the client's sample wakes the master and advances nothing). The
engine's LISTEN sleeps until the nearest due time, capped at the one-minute sweep. Each due occurrence is claimed once;
at firing, cancellation and dependencies are read again. Due while the engine was down: fires once on its return if
`not_after` has not passed, otherwise returns to its owner unfired. A follow-up before any job exists (B83's customer
desk) is a line's or an owner's wake. This is the only timer work has; pg-boss stays for the system's housekeeping.

## 5. Intake — a third resident process (§2 F, §2 C, §2 H; answers F5) **[D1]**

**The engine, the outbox executor, the intake.** The intake is alone with the credentials that read the outside — a
mailbox, a store's orders, a payout feed, advertising and content figures, a calendar, a signed webhook. It is a
supervisor; each reader runs as its own child process with one credential and a database login that can call one
door: `inbound_receive`, the revenue door, or `measurement_record`.

- **The door binds the reader to its source.** Which login reads which mailbox or account, for which company, is the
  foundation's row; the door refuses a record for any other source or company.
- **Before parsing:** the origin is verified (the provider's signature or authentication result) and the source's own
  key makes a replay the same record. Content and attachments are untrusted data, never a command (A26). The provider
  is acknowledged only after the record is durably received.
- **A credential that can also write** (a provider with no read-only access) is not given to the intake: that read is
  a trusted read operation in the executor.
- **Money in is booked automatically only from an authenticated feed** — a mail never books revenue or marks a deal
  paid. PLAN's authorised manual entry (§2 J) stays.
- **A client's acceptance** counts only from an authorised contact of that client, on a verified channel, for that
  deal and that artifact version.
- *What survives a down intake* is claimed per source, and only where that source's redelivery or backfill was tried;
  until then a webhook is named as able to lose.

*Why not inside the executor:* see D1. *Why not inside the engine:* it is the agents' host and holds no credential
(§2 C). *The cost:* a third thing to keep alive. *Not designed here:* how a webhook is exposed (the server's row).

## 6. Paid generation and the job's card (§2 G, §2 H, §2 J; answers F6)

**Every generation is on the record:** a run before the call and one attempt row per render — the engine, the
outcome, the duration, and the usage (seconds on the local card, or the provider's units).

**The authorisation is B43's card** — his decision of 2026-10-18: one priced card per job, naming the routes and a
ceiling; retakes under the ceiling need no second click. The foundation carries it as one gated request (§2 H) and
makes it hold:

- each paid call is a request with a key stable across retries, bound to the provider account, the billing currency,
  the route and that call's **enforceable maximum**; the maximum is reserved once per key, in the database, which
  refuses a reserve past the ceiling; the authorisation is read again at dispatch;
- a call the provider may have accepted while its reply was lost keeps its reservation **until it is reconciled** —
  neither expiry nor the job's close frees it (§2 H: parked for review, never repeated by itself);
- a route with no enforceable maximum cannot go on a card;
- the key stays where B43 put it — in the proxy (SECURITY O4/O7). The process that may ask the proxy for a paid
  render is not the agents' host. Which process carries the remote lane's submit and poll is tried at B43's rank;
- **one posting per charge:** the money is one expense row, linked to its attempt, its request and the provider's
  transaction (§2 J); the attempt row carries usage, not a second amount; local GPU time is usage and no money;
- a top-up of a provider balance is money out at his click (B43); the job's cost line warns and never stops (his word
  of 2026-10-28) — the ceiling refuses to *start* a call, it cuts nothing that runs (§2 F).

A paid call that is not generation (a data service, a scraper) is gated singly, as §2 H has it, until a row brings a
card of its own.

**Advertising spend** follows B28: every launch and every budget move passes the gate. A channel row says whose
account it is and who pays (§2 B gains the two facts): a bill the client pays is not the holding's expense, and an
amount to be reimbursed is recorded as that.

## 7. A company's objective (§2 J; answers F7)

No new table and no waiting for a screen: REVENUE_ENGINE's objective — proposed, activated by him alone, closed, with
its progress rules (§8 of that spec) — is carried through PLAN's revenue port (stage 4) with company, currency and
period. B32 reads target, actual and gap.

## 8. A request can expire (§2 H; answers F8)

`action_requests` may carry `expires_at`, set by the rule table per class. An expired request is closed with its
event and never executed; a decision after it is refused with a true sentence. No class expires until he says which
and after how long. Tried: a decision just before expiry with dispatch just after — it does not start; expiry after
the provider accepted — it still reconciles.

## 9. His release and the client's approval, at the outward door (§2 D, §2 H; found by the audit)

PLAN names his verdict and the delivery release, and not the rule that makes them mandatory. Added: **APPROVAL_ENGINE
A9 is enforced at the outward door, for the exact artifact version** — every delivery to a client, the built sample
and each revision included, is gated to him until he lifts it for that job type (B15 carries the lift). Passing the
checks, his choice among versions, and his release are three records, and a signed deal supplies none of them. On
visual work the client's approval of the built sample (A28) is recorded on that version and the parts that depend on
it wait for it. The account owner stays the client's one voice (§7sexies 6).

## 10. From the order to the money — the chain's links (§2 B, §2 J; found by the audit)

The owners exist: sales and the price policy (the offer), the standard contract (deposit, schedule, rounds —
APPROVAL_ENGINE A10), B05 (signing, sending, collection), Reception (§7sexies 3, 6). What the foundation must carry
is the chain of references, so one job is traceable from order to cash: **the signed deal and its version → the job
→ the invoice or instalment → the receipt**, a receipt settling one instalment once (a 4,000 job paid in two parts is
two receipts on two instalments). A client's later message is matched by client and thread to the open job's desk.
*Unverified:* which of these tables the old CRM already has; read with the carry list (§2 K) at stage 4.

## His two examples, walked

| Step | Home |
|---|---|
| The client writes: a shoe advertisement / a website | intake → `inbound_receive` → Reception → the account's owner or sales (item 5; A26 door 2) |
| The offer, the price, the signed deal | sales, inside the approved price policy and standard contract; outside them his (A10) |
| The job is born | the birth door, from the deal, with its brief and value tier (§2 D; item 10's link) |
| The plan and the parts | the type's master (A27, A30); brain and effort per part by §2 G |
| The film a site needs | a part on the site job, through B43's two tools, on the job's card (M) |
| Paid renders | the job's card — his click once; reserved, settled, one posting (item 6) |
| The checks | the runner's gates (§2 H) and the check path A28, A30, A32 fix; a failed check returns to the owner |
| His choice among versions; his release | his verdict on an artifact version (§2 D); A9 at the outward door (item 9) |
| The built sample to the client; the client's approval | through the account owner; recorded on the version (items 5, 9) |
| The delivery | an outward act naming the released version (§2 H) |
| The invoice and the payment | B05; receipts from the provider's feed, on deal, instalment, company, client and job (items 5, 10) |
| What it cost | attempt rows (usage, model spend) and expense rows; realised net per job (§2 J) |
| Hosting, a domain, a campaign after delivery | a line with its owner and budget (§2 D); ad spend by B28 (item 6) |
| What was learned | proposed into the book's notes and memory at the close (§2 I) |

## The synthesis, item by item

| Synthesis | Disposition |
|---|---|
| F0 and §4 gaps 1–3 (what an office registers; its book) | M.1–2 — a list on existing doors; no installer |
| gap 4 (seat roles, lanes) | M.3; B43's remote lane is a named foundation change at B43's rank |
| gaps 5–6 (outward acts, own records) | M.4–5 — inside the foundation's registry and authority, no office credential |
| gap 7 (events) | existing events carry a part finishing with an artifact; B43's "media" channel stays his open decision |
| gap 8 (a part under another type's book) | the part on the same job (M, mixed work) |
| gap 9 (the order half) | items 9 and 10; built with B05 and B83 |
| gap 10 (the surface) | M.6; the choice goes through PLAN's verdict door — shown on the bench with a real sign-in at B84's rank |
| gap 11 (retiring, upgrading) | not built: a job type switched off takes no new job; nothing is retired while a job, a request or an unsettled charge is open |
| F1 · F2 · F3 · F4 | items 1 · 2 · 3 · 4 |
| F5 | item 5 — **D1** |
| F6 | item 6 — his card of 2026-10-18, no new authority |
| F7 · F8 | items 7 · 8 |

## What this adds to the order of the build (§6)

- **Stage 0:** the liveness table.
- **Stage 1**, added to the one job's trials: zero model calls in the idle hour while the liveness rows advance, and
  a stopped engine with an open run shown as stopped; the client's mail read by one real reader under its own login,
  refused when it files for another source (D1's proof); one due time that wakes its owner once and advances nothing;
  his order's turn carrying the page he is on.
- **Stage 2:** A9 at the outward door; the card's reserve, the lost-reply reservation and expiry's two races; the
  "look" notifications with the last write in a window.
- **Stage 3:** `surface_show` — a stale turn, another client's object, a preview that tries to navigate.
- **With B43 and B84, at their ranks** — the proof the audit names as decisive: one client order for a site with a
  film, one card, one released version, one receipt in two instalments, retries included; one priced remote render
  through the proxy with a restart in the middle.

## Unmeasured, added to §8

13. The beat interval, the "look" window, and what a probe costs.
14. The intake's isolation with one real reader; its load; a provider that rate-limits; which sources redeliver.
15. That every paid route in use can state an enforceable maximum per call.
16. Which process can carry B43's remote submit and poll without the agents' host holding a spend-capable token.
17. Which links of item 10 the old CRM tables already carry.

## Risks this adds

- **More foundation before the first job runs.** Held by the order: stage 1 builds each at its thinnest; the installer
  and the child job are gone.
- **A third resident process** — item 5's cost.
- **An office meets a need this list does not carry.** It comes back as a named, versioned change — not as a patch.
