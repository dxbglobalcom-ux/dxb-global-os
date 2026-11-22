# B85 — stage 0, the bench: the build cut

**What will be on his screen when stage 0 closes:** nothing new — the first living screen is stage 1's; what he has is
a folder cleared of the old construction's papers and the ground the new system is built on.
**Which command proves it:** `pnpm foundation:bench` prints `BENCH_GREEN` for the offline proof; the stage's verdict
is the whole evidence set of piece 14.

This file cuts PLAN.md §6 "stage 0" into pieces a session can finish. It was audited blind twice on 2026-11-22
(`ASTRA.md`, `fable-audit.md`; the audited draft is `blind/BUILD.md`) and rewritten to both. It designs nothing
PLAN.md has not decided; a choice PLAN.md left to the build is marked **[choice]**, and the one place where the
measurements change PLAN.md's wording is marked **[adaptation]**. The bench as it is today: `BENCH-FACTS.md`.

## 1. The adaptation — the foundation gets a bench of its own [adaptation]

PLAN.md §6 says: the new schema "beside the old one in the construction engine … with the old battery running beside
it". Two measured facts make that unsound on today's bench:

- **The old battery rewrites privileges for every role in the cluster on each run.** Its host half runs
  `scripts/b36/prove-window-escapes.mjs`, which re-seals with `company-one-way-window.sql`; that file hands grants
  back by name to every role that held them through PUBLIC, and writes every existing role into two roles' default
  privileges. A foundation login would gain named grants each time the old battery ran, and "the two do not meet"
  would be true or false by which battery ran last (`fable-audit.md` finding 1; read at the source, not run).
- **Proving a clean install on a shared bench means removing things by their name**, and a name is not authority to
  remove (`ASTRA.md` A2): an unrelated object may carry the prefix, a role is cluster-wide, a dependent may sit in
  another schema. One old test also pins the exact policy set on `realtime.messages`
  (`tests/phase8/broadcast-triggers.test.ts:106-119`), which the new broadcast must extend.

**What is built instead.** Two construction instances:

- **The old bench** (`DxB_Build`, port 54422) stays the old system's, whole and untouched. The old battery runs there
  as today. Nothing of the foundation is installed on it, and no old file, test or installer is edited.
- **The foundation's bench** — a second local Supabase stack of the same version, made and destroyed by one script.
  The platform is real (sign-in, broadcast); the old chain is applied to it once, so the old schema stands beside the
  new one **in the same database** — which is what PLAN.md decision 1 needs and what stage 5's move will meet. It is
  disposable by construction: a clean install is a new instance, never a removal.

Decision 1 stands as he approved it: one database, the new schema beside the old one, the company untouched until
stage 5. What changes is one clause of stage 0's text: the old battery does not run against the database that holds
`os`. What that gives up: a proof that the old battery passes on a database that also holds `os`. It proves the
things that matter instead — the old system is not touched at all, and the two schemas are measured side by side.
**Carried to stage 5's move:** the company's engine has the window installed; its installer names every existing role,
so the move reads that installer before the foundation's roles are created there.

## 2. What stage 0 must leave standing (PLAN.md §6, §2 A, §2 K, §2 C, §2 M, N.1, §8)

The chain's runner · the roles and the new schema beside the old one · the clean-install, failed-file and upgrade
proofs · the test lock · the measured separation of tables, roles, clock and broadcast targets · the in-process tool
door and per-turn usage, tried · the liveness table · the report of what an addition changed outside its own place ·
and, before it, the folder's first cut and the scan of the board's open rows.

**Not in stage 0:** principals, the holding's shape, jobs, parts, desk, artifacts, runs, events, the engine, the seat
runner, the model door, the outward path, any screen.

## 3. Measured facts (2026-11-22)

- The old bench: PostgreSQL 17.6, real `auth` and `realtime`. The installing role `postgres` is not a superuser; it
  has `BYPASSRLS`, `CREATEROLE`, `CREATEDB` and owns database `postgres` (`pg_roles`, `pg_database`; the lead's query).
  `createrole_self_grant` is empty. `postgres` has USAGE on `realtime` and may `SET ROLE supabase_realtime_admin`.
- In `public`, 141 functions grant EXECUTE to PUBLIC; 23 are the old application's, none of them `SECURITY DEFINER`
  (the lead's query, after `ASTRA.md` A3). PUBLIC has USAGE on `public`.
- The old chain: 188 files, file and ledger row in two calls, no hash. The old battery: 2,172 tests, `BATTERY_RED`
  with two failures older than this work (`tests/b23/graph-is-not-stale`, `tests/b36/live-drills.host` case 6), about
  10.5 minutes; its host half touches the company's engine in one drill.
- The identity check that guards the old bench is private to `tests/global-teardown.ts` (cluster and database against
  `tools/hooks/ledger-identity.json`); `tests/construction-engine.ts` exports the address only.
- pg-boss 12.25.1, schema version 36, `migrate: true` by default. The agent SDK 0.3.296: `createSdkMcpServer`
  exported and unused; `env` replaces the child's environment; `tools` and `allowedTools` are different controls;
  per-turn `usage` and cumulative `modelUsage` have different coverage (types read, not run).
- The machine has about 16 GB of memory free for a second stack (`free -g`).
- No test lock exists. The commit hook stops a hand-written code file over 20,000 bytes, `.sql` included;
  `__snapshots__/` and `fixtures/` are exempt.

**Not measured — each is measured inside its piece, before the contract that rests on it is signed:** that two local
stacks run side by side and what one costs to start; the image's host-based login rules; what the non-superuser
`postgres` may grant on `realtime`; which `pg_catalog` grants a fresh instance gives PUBLIC; pg-boss under a login
that cannot alter its schema; the SDK's behaviour; whether a piece fits a session.

## 4. Names and places [choice]

| What | Name |
|---|---|
| The schema · the clock's schema | `os` · `os_clock` |
| The roles | `os_owner` (no login) · `os_engine`, `os_executor`, `os_intake` (one login per resident service) · `os_reader` (read) |
| Broadcast topics · the engine's wake channel | prefix `os:` · `os_wake` |

Both audits tried these names against the catalogue and found no collision. A name sorts and routes; it never proves
ownership and is never the authority to remove.

| What | Place |
|---|---|
| The chain's files | `db/schema/` · `db/functions/` (one door function per file) · `db/reference/` (vocabularies the code owns) |
| The snapshot | `db/__snapshots__/os.snapshot.txt` — generated and committed by the lead, never by a writer |
| The foundation's code | `foundation/*` — a workspace root; each subject a package (`chain`, `bench`, `tests`) |
| The foundation's bench | its address, its identity file and its guard live in `foundation/bench` — nothing is imported from the old `tests/` or `tools/` |
| The test locks | `foundation/locks/` |

His policy data needs no kind of its own in the runner: a seed is a versioned change, applied once.
Old files touched: `pnpm-workspace.yaml`, root `package.json`, `pnpm-lock.yaml`. No old test, package, migration,
script or installer is edited. The new battery runs on the host, not inside the old construction sandbox; it carries
its own guard that no company address or key appears under `foundation/`.

## 5. How a piece is built

1. **The carry list** (PLAN.md §2 K): before a piece's tests are signed, the old part it replaces is read once — its
   tests, functions, views and RPCs — and each contract is kept, moved, rewritten or dropped with its reason.
2. **What is unmeasured is measured first**; a contract is not signed on a guess.
3. **The tests**, written from the contract by a hand that will not write the code; the lead reads them, sees them
   red for the right reason, commits them with their lock.
4. **The code**, by another hand.
5. **The lead's verdict:** the lock tool, on a clean copy of the candidate; the diff read; the commit.

A piece is sized to end inside one session before 45 % of its context. Whether it does is measured on the first
pieces and the cut is corrected by what they show.

## 6. The pieces

**0a — the folder's first cut. Before any construction commit.** The list (`first-cut/`) is weighed folder by
folder: what a living record names, what a frozen reader of the old system still reads (it stays — the reader is not
edited), what is tracked (it stays in history) and what is untracked (deleting it is final, and the list says so). He
sees it; then the deletion. **Done:** his look; one commit; the records ruler unchanged.
*Weighed 2026-11-22 (`first-cut/WEIGHED.md`): 44 folders stay whole, 34 keep only the files a living record names or
code reads, 99 leave; 11 MB of what leaves stays in history and 2,352 MB is gone for good. His yes the same night
<!-- CEO-OK: first-cut-deleted-and-halal-screen-reach-his-yes-2026-11-22 -->; deleted in one commit.*

**0b — the scan's findings, weighed.** Four readers scanned the 72 other open rows (`scan/`). The lead checks each
"needs", "unsure" and contradiction at its source. What a row needs from the foundation comes back into PLAN.md under
the section that owns it; a contradiction only his word settles goes to him once, with a recommendation. B41's need —
a seat's shell walled from files and the network — is weighed before piece 12. **Done:** PLAN.md carries them; his
answers.
*Done 2026-11-22 (`scan/WEIGHED.md`): eleven sentences marked `[0b]` entered PLAN.md, B41's wall among them (§2 C,
stage 1); the halal screen's reach had his yes the same night; no contradiction needs him.*

**1 — the frame and the foundation's own bench.** The workspace root, the foundation's typecheck, a frozen install
proved. `foundation/bench`: one script makes a fresh stack on its own ports, applies the old chain, records the new
cluster's identity in the foundation's identity file, and destroys it; a guard checks cluster and database **on the
connection that does the work** before every install, password change and cleanup, and refuses the company's and the
old bench's identities by name. One host lock held from set-up through cleanup; no destructive step without it.
*Tests first:* a connection to an identity not on the foundation's list is refused before the first write (tried on
throwaway identities, never on the company); two runs at once — one waits or is refused; a made instance has the old
schema and no foundation object. *Measured first:* two stacks side by side; start time and memory.

**2 — the test lock.** `verify <piece>` takes no report: on a clean copy of the candidate with a frozen install it
runs the piece's locked tests itself and reads its own fresh result. It fails when: a locked test file, the battery's
configuration, a set-up file, a helper a locked test imports, the lock tool, the `foundation:*` scripts or the
lockfile differ from the lock commit; any locked case — matched by file, full suite path and name, with its count —
is missing, skipped, retried or not passed; a file ended without an assertion; the process exit is not zero; the
piece's range (derived from the lock commit, never passed in) touches `foundation/locks/`. The inventory of pieces
that must have a lock is the lead's file. *Tests first, the lead's own, on fixtures with known outcomes:* each of those
offences planted and caught; a previous green result of the same suite replayed and refused. *The limit, said:* code
that detects the test run is caught only by the lead's reading; a search for the runner's names in product paths
helps and proves nothing.

**3 — the chain: schema files.** One command builds an empty target to the full schema and upgrades a populated one;
its only targets are instances on the foundation's identity list. Before any write the disk is checked against the
ledger in both directions — a ledgered file missing, renamed, reordered, duplicated or changed, or a new file ordered
before an applied one, stops the run. Each file and its ledger row (file, kind, hash, applied at, by, runner version)
in one transaction owned by the runner; a file that opens or closes a transaction itself is refused. A failing file
leaves nothing of itself; what committed before it stays and a retry is safe. One runner at a time. *Tests first, on
fixture chains in throwaway databases of the foundation's bench:* each sentence above, the ledger's own bootstrap, two
independent connections contending, and a populated fixture upgraded with its rows kept.

**4 — the chain: functions and reference.** The functions pass re-applies every file in one transaction; the files
are the manifest: after the pass the functions in `os` are exactly the manifest's, name and signature — one whose file
was deleted, or a second signature, is refused and rolled back; a removal or a changed signature arrives as a
ledgered change. The reference pass makes each code-owned vocabulary equal its file, in one transaction. *Tests
first:* a changed body replaced; a second signature, an orphan and a failing pass each rolled back whole; a
vocabulary reconciled; a row of his policy kind left as he changed it.

**5 — the roles and the schema.** *Measured first:* what the installer must grant itself to create objects as
`os_owner`; the login rules of the image; the `pg_catalog` grants on a fresh instance. Then the chain's first files:
`os_owner`; the three service logins and `os_reader` — no superuser, no `BYPASSRLS`, no `CREATEROLE`, no `CREATEDB`,
member of nothing; schema `os`; `os_owner`'s default privileges give PUBLIC nothing. The bench's install step sets
each login's password as a SCRAM verifier from a file outside the repository (mode 600, never printed, never in a
snapshot). *Tests first, over TCP as real logins:* each login refused before the install step and accepted after it;
none can create in `os` or anywhere.

**6 — the snapshot and the install proofs.** The snapshot is a normalised text of meaning, not of names: each
function's body, definer flag and settings; tables, constraints, indexes, triggers; row-security flags and policy
predicates; owners; effective grants and default privileges; the roles' attributes and memberships; every change the
chain makes to an object outside `os`; `os_clock`'s definitions; the code-owned reference values. No secret, no
volatile identifier. *Proofs:* **clean** — a new instance, the chain from nothing, equals the committed snapshot;
**upgraded equals clean** — an instance built at the previous committed revision, given rows, upgraded by the delivery
command, has the same snapshot and its rows; **the proofs can go red** — one body, one policy predicate, one grant
changed, and one file left out of a copy of the chain, each turns its proof red. At stage 0 "rows kept" on the real
schema is thin — there is little to keep; it becomes real with stage 1's first change to a populated table, and the
proof is standing from here on.

**7 — the separation, measured on the foundation's bench.** By role class — the foundation's runtime logins, the old
system's runtime roles, the platform's administrators, the installer — and by operation: read and write on every old
table and sequence, execute on every old function, role membership and `SET ROLE`, in both directions. The lists are
enumerated from the catalogue against one allow-list, so a name nobody thought of turns the test red. Each denial is
accepted only after a permitted operation succeeded on the same real connection. What is shared is written in the
test: PUBLIC's USAGE on `public` and the 23 invoker functions (no table of the old system is reachable through them);
`authenticated` and `auth.users`, by PLAN.md's own decision; the installer and the platform's administrators, who read
everything and serve nothing at runtime; LISTEN/NOTIFY, which has no privileges and is separated by name only.

**8 — the liveness table (N.1), thin.** `os.liveness`: a stable identity, its kind from the vocabulary, when it was
last observed (empty until it is), what was observed, the failure's text, readiness. Reference rows for the three
processes that have a login; the voice daemon's row arrives with its login. One door, `liveness_beat()`: a process
writes its own row and no other, known by the login of its session — the first door in the chain, and the proof that a
service login executes its door and cannot write the table. *Tests first, as the service logins:* the executor cannot
beat for the engine; no login writes the table directly; a replay of the reference file keeps what was observed.
**Moved to stage 1, with the engine that beats:** the probe's door, the reader and its states, the interval. A state
shown without the process that produces it would prove a number the test invented.

**9 — the broadcast, measured.** *Measured first:* what the installer may do on `realtime.messages`. A function
owned by `os_owner` sends on a private `os:` topic. *Shown with acknowledged subscriptions and messages that carry
their own mark:* a signed-in client receives it; an anonymous one is refused; a `dxb:` message reaches its subscriber
and not the `os:` one, and the reverse; `os_wake` and `dxb_ops_live` each deliver to their own listener only. A send
that returns without error is not taken as delivery. Each object the chain owns outside `os` for this enters the
snapshot by name.

**10 — the clock, measured.** pg-boss's own objects are installed in `os_clock` with set-up authority, as a ledgered
step that records the library's version; the engine's login runs it with migration off. *Shown:* the least rights the
login needs; a scheduled routine fires and finishes; the old clock and the new one each consume only their own work.
A right that breaks PLAN.md's "EXECUTE on its doors only", or a library upgrade the engine's login would have to
perform, comes back to PLAN.md §2 F before stage 1 builds the engine.

**11 — the report of additions (§2 M), thin.** Given an office's folder and chain subject (the lead supplies them)
and a range of commits: every path changed outside them — added, deleted, both ends of a move — with generated files
listed apart. It reports and forbids nothing. No declaration file and no mark of "named": those come with the first
real office. *Tests first, on a throwaway repository.*

**12 — the seat's tool door and per-turn usage, tried live.** On demand, not in the battery; it has no locked test,
and its receipt names the revision it ran on. An isolated working directory, no inherited settings, an explicit tool
list; one tool served in the runner's process, bound to a run the model cannot name — two different bindings, two
turns in one session. *Reported, not assumed:* which handler ran and which run it saw; what each turn's usage and the
session's totals cover; and three attempts from inside the seat — the parent's environment, the password file, the
bench address written in the repository — with what each returned. The sentence it may support is "the child's
environment holds none"; "cannot read" needs the wall of 0b.

**13 — the bench command and the auditor's reach.** `pnpm foundation:bench`: the foundation's typecheck, a new
instance, the proofs of piece 6, the whole new battery, every lock → `BENCH_GREEN`. A read connection for the stage's
audit: a bench-only role that reads `os` whole and writes nothing, proved so.

**14 — the stage's verdict.** All of: `BENCH_GREEN` at the final revision; the old battery on the old bench compared
case by case with its result of 2026-11-22 — no failure that was not there (PLAN.md §7's "stays green" is corrected
to say this); pieces 9, 10 and 12 passed, or each open finding named as an open condition; one blind audit pass by two
auditors over the stage's commits; the fixes; the bench command again on the fixed revision. Then the records:
DATA_MODEL's change discipline in place, PLAN.md §6 and §8, the board row, STATE.

## 7. Order

`0a` → `0b` (what touches stage 0) → `1` → `2` → `3` → `4` → `5` → `6` → `7` → `8` → `9` → `10` → `13` → `14`;
`11` and `12` beside, after `2`.

## 8. Risks

1. **A second stack.** Memory and start time are measured in piece 1; if it cannot be afforded the cut returns here.
2. **The installer is not a superuser.** Measured in pieces 5, 9 and 10 before anything rests on it; a wall is
   brought back, never worked around.
3. **The lock is a tool, not a judge.** It closes the routes both audits found; the lead's reading stays.
4. **Fourteen pieces.** More sessions than the first cut; each is one a session can finish and a reader can verify.
5. **The quota.** What a construction piece costs is measured on pieces 1 and 2 and told to him; what a job's part
   costs at runtime stays stage 1's measurement.

## 9. What the audits changed, and what was not taken

Taken from both: the foundation's own guard; no removal by name; the lock that runs the tests itself; the split
pieces; the snapshot of meaning, made by the lead; "upgraded equals clean"; the role-class matrix enumerated from the
catalogue; the thinner liveness table and report; the trial that reports its own limits; the cut and the scan before
construction. From Fable's finding 1 and Astra's A2 together: the bench of its own (§1).
Not taken: Fable's first option — one exclusion in the old installer — because it edits the old system and still
leaves removal by name; Astra's fuller thinning of piece 8 — the table without any door — because the one door is the
only proof at stage 0 that a service login works as designed.
Unaudited: this rewrite. Its first test is piece 1.
