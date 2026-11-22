# B85 — stage 0, the bench: the build cut

**What will be on his screen when stage 0 closes:** nothing new — the first living screen is stage 1's; what he has is
a folder cleared of the old construction's papers and the ground the new system is built on.
**Which single command proves it:** `pnpm foundation:bench` prints `BENCH_GREEN`.

This file cuts PLAN.md §6 "stage 0" into pieces a session can finish. It designs nothing PLAN.md has not decided;
where PLAN.md left a choice open to the build (a name, a place, a mechanism's form) the choice is made here and marked
**[choice]**. The bench as it is today was measured on 2026-11-22: `BENCH-FACTS.md`, beside this file.

## 1. What stage 0 must leave standing (PLAN.md §6, §2 A, §2 K, §2 C, §2 M, N.1, §8)

1. The chain's runner — baseline by subject plus forward-only versioned changes, each file atomic with its ledger row.
2. The roles, and the new schema beside the old one in the construction engine.
3. The rebuild test, the failed-file test, the upgrade test.
4. The test lock: a writer cannot change the test that judges it, and a locked test that did not run fails the piece.
5. Proven with the old battery beside it: the two systems' tables, roles, clock and broadcast targets do not meet; a
   service role of the new one cannot reach the old tables.
6. Tried: the in-process tool door; per-turn usage.
7. Added by §2 M and N: the liveness table; the ruler that lists what an addition changed outside its own place.
8. Before it: the folder's first cut; one scan of the board's open rows.

**Not in stage 0** (stage 1 builds each at its thinnest): principals, the holding's shape, jobs, parts, desk,
artifacts, runs, events, the engine, the seat runner, the model door, the outward path. No table of those is drawn
here, and no screen.

## 2. Measured facts the cut rests on (`BENCH-FACTS.md`)

- The bench is PostgreSQL 17.6 with the real `auth` (23 tables) and `realtime` schemas. The installing role is
  `postgres`: **not a superuser**, with `BYPASSRLS`, `CREATEROLE`, `CREATEDB`; it owns database `postgres`.
- The old chain: 188 files in `db/migrations`; file and ledger row are two separate calls; the ledger has no hash.
  The old rebuild skips what is applied and drops nothing, so a new schema survives it.
- The old tests connect as `postgres` and switch with `SET LOCAL ROLE`; none logs in as a service.
- The old battery's residue ruler counts rows in `public` and `dxb_internal` only; it selects tests by
  `tests/**` and `apps/dashboard/tests/**`. Last run: 2,172 tests, two red, both older than this work
  (`tests/b23/graph-is-not-stale`, `tests/b36/live-drills.host` case 6), about 10.5 minutes.
- The old system's clock is pg-boss 12.25.1 in schema `pgboss` (`pg_cron` is preloaded and not installed). Its
  broadcast topics are `dxb:chat`, `dxb:cost_ledger`, `dxb:approvals`, `dxb:task_events`; its one NOTIFY channel is
  `dxb_ops_live`.
- The bench's address is spelled in 13 files, not once; the one spelling with the identity check is
  `tests/construction-engine.ts`.
- `@anthropic-ai/claude-agent-sdk` 0.3.296 is installed; `createSdkMcpServer` is used nowhere; the types carry
  per-turn `usage`. Not run.
- No test lock exists. The commit hook stops a hand-written code file over 20,000 bytes, `.sql` included;
  `__snapshots__/` and `fixtures/` are exempt.

**Not measured, and measured inside a piece before it is relied on:** what the non-superuser `postgres` may do with a
role it created (own a schema through it, grant on `realtime`); the row policies on `realtime.messages`; whether
pg-boss runs under a login that cannot create or alter its schema; the SDK's behaviour.

## 3. Where the new system lives [choice]

One name for everything the foundation creates in the cluster, so that "the two do not meet" is checkable by name:

| What | Name |
|---|---|
| The schema | `os` |
| The roles | `os_owner` (no login) · `os_engine`, `os_executor`, `os_intake` (one login per resident service) · `os_reader` (read) |
| The clock's schema (pg-boss, system routines only) | `os_clock` |
| Broadcast topics · the engine's wake channel | prefix `os:` · `os_wake` |

In the repository — a root of its own, so that the second cut (stage 5) removes the old system by directory and
renames nothing:

| What | Place |
|---|---|
| The chain's files | `db/schema/` (baseline by subject, then versioned changes) · `db/functions/` (one door function per file) · `db/reference/` (vocabularies the code owns, re-applied) |
| The committed snapshot | `db/__snapshots__/os.snapshot.txt` |
| The foundation's code | `foundation/<subject>/` — a workspace root beside `packages/` (stage 0: `foundation/chain`, `foundation/bench`) |
| The new battery | `foundation/tests/<subject>/*.test.ts`, its own `foundation/vitest.config.ts` — outside the old battery's selection |
| The test locks | `foundation/locks/<piece>.json` |
| An office's own place (from stage 1) | `offices/<name>/` |

His policy data (PLAN §2 A's second kind — the file seeds once, then the database is the truth) needs no kind of its
own in the runner: a seed is a versioned change, applied once and ledgered, and a later default is another versioned
change that names what it changes. Stage 0 has no such data.

What stage 0 touches in the old system's files: `pnpm-workspace.yaml` (one more root), root `package.json` (the
`foundation:*` scripts). Nothing else — no old test, package, migration or script is edited; the twelve other spellings
of the bench's address stay as they are and leave with the old system.

## 4. The pieces

Each piece: the contract below → its tests, written from the contract by a hand that will not write the code → the
lead reads them, sees them red for the right reason and commits them with their lock → the code, by another hand →
the lead verifies with the lock tool, reads the diff, commits. A piece is sized to end inside one session before 45 %
of its context. Pieces 6 and 7 touch no file of pieces 2–5 and may run beside them.

### Piece 0a — the folder's first cut
A list of what stays and what goes — every job folder and paper pile, its size, tracked or untracked, and who still
reads it (a living record, a ruler, a hook, a test) — is shown to him. Nothing is deleted before he has seen it. What
a ruler or a test reads stays or the reader is changed in the same commit. **Done:** the list in the job folder; after
his look, the deletion as one commit, the records ruler and the old battery's result unchanged.

### Piece 0b — the scan of the board's open rows
Done by four readers on 2026-11-22 (`scan/`), from the row files. **Still owed:** the lead checks each "needs" and
each contradiction at its source. A shape detail (a column, a link) is written into the contract of the part that
builds it, at its stage. A contradiction between a row and the plan that only his word settles goes to him once, each
with a recommendation. Nothing found so far touches stage 0's pieces. **Deadline:** before stage 1's baseline is
written.

### Piece 1 — the frame and the test lock
- `foundation/` becomes a workspace root; `foundation/vitest.config.ts` selects `foundation/tests/**`; `pnpm
  foundation:test` runs it under the same engine lock as the old battery (one run at a time holds the bench) and writes
  the runner's JSON report. Tests reach the bench through the one spelling in `tests/construction-engine.ts` and its
  identity check — no new spelling.
- `foundation/bench/test-lock`: `lock <piece> <test files…>` writes `foundation/locks/<piece>.json` — each file's
  hash and the names of the tests in it. `verify <piece> --report <json> [--range <a>..<b>]` fails, naming the first
  offender, when: a locked file's content differs from its hash; a locked test is missing from the report, skipped,
  marked todo or not passed; the range's diff touches a locked file or `foundation/locks/`.
- **Tests first (the lead's own — nothing locks the lock):** an untouched piece passes; one changed character in a
  locked test fails; a locked test renamed, deleted, skipped or filtered out of the run fails; a diff that edits the
  lock file fails; a report from another run (missing files) fails.
- **Done:** `pnpm foundation:test` green with the lock's own tests; `verify` red on each planted offence.

### Piece 2 — the chain's runner
`foundation/chain`: one command builds an empty target to the full schema and upgrades a populated one.
- A closed list of targets: **the bench only**. The runner refuses any server the identity check does not confirm as
  the construction engine; there is no company target until stage 5 builds one with its rehearsal.
- Order: schema files (lexical, by subject then version) → the functions pass → the reference pass.
- **Schema files:** each file and its ledger row in one transaction. The ledger (`os.chain_ledger`: file, kind,
  sha-256, applied at, applied by, runner version) is created with the first file. An applied file whose hash changed
  stops the run and names the file. A file that fails leaves nothing behind — no object, no ledger row — and stops
  the chain.
- **The functions pass:** every file under `db/functions/` is re-applied, in a fixed order, in one transaction. One
  function per file, the file named after it. After the pass, a function name with more than one signature in `os`
  is refused and the pass rolled back: a changed signature is a versioned change that drops the old one, never a
  silent second overload.
- **The reference pass:** every file under `db/reference/` re-applied in one transaction (the file is the truth).
- Two runners at once: the second waits on an advisory lock, or is refused — never both writing.
- **Tests first**, on fixture chains in throwaway databases the test creates and drops on the bench cluster
  (`os_fixture_*`; plain databases suffice for the runner's mechanics): empty → full; a second run changes nothing;
  an edited applied file stops the run; a failing file leaves neither object nor ledger row, and the files after it
  are not applied; **a populated database upgraded from one version to the next keeps its rows**; a failing upgrade
  leaves the earlier version whole; the functions pass replaces a body and refuses a second signature; a target that
  is not the bench is refused before any write.
- **Done:** those tests green and locked.

### Piece 3 — the roles, the schema, the snapshot, the separation
- **Measured first, inside the piece:** as the non-superuser `postgres` — create `os_owner` without login, a schema
  owned by it, objects created as it; create the service logins; whether the cluster's default privileges reach
  objects `os_owner` owns. What cannot be done as `postgres` is said, with what it needs.
- **The chain's first files:** `os_owner` (no login); `os_engine`, `os_executor`, `os_intake`, `os_reader` — login,
  no password, not superuser, no `BYPASSRLS`, no `CREATEROLE`, no `CREATEDB`, member of nothing; schema `os`;
  `os_owner`'s default privileges give `PUBLIC` nothing (functions included). No grant to `anon`, `authenticated` or
  `service_role` — the dashboard's first grant arrives with the first table it reads, at stage 1.
- **The bench's install step**, outside the chain: sets the service logins' passwords from a file outside the
  repository (`~/.config/dxb/`, mode 600, generated on first use, never printed). Without it no service can log in.
- **The snapshot:** a deterministic text of what the chain made — in `os`: tables, columns, constraints, indexes,
  functions with their signatures, triggers, policies, grants; outside it: the `os_*` roles' attributes and
  memberships, `os_owner`'s default privileges, and every object the chain owns outside `os` by name. Committed at
  `db/__snapshots__/os.snapshot.txt`.
- **The rebuild test:** remove everything the chain made on the bench (bench only, behind the identity check), build
  from nothing, compare with the committed snapshot. The new battery starts with it.
- **The separation, as real logins and by catalogue:**
  - Each `os_*` login: no privilege on any relation or function the old system owns in `public`, `dxb_internal`,
    `pgboss`, `supabase_migrations`; no USAGE on `auth`, `vault`, `net`, `pgboss`, `dxb_internal`; one real attempt
    each on an old table ends in `permission denied`. What a new login does hold through `PUBLIC` — USAGE on `public`,
    where the `vector` type lives, and the extensions' own functions — is listed by name in the test, so that anything
    added to it later turns the test red.
  - The old system's roles (`anon`, `authenticated`, `service_role`, `authenticator`, `dxb_reader`, `sol_reader`):
    no USAGE on `os`.
  - **The cluster outside is untouched:** a fingerprint of the catalogue outside `os`, `os_clock` and the `os_*` roles
    is identical before and after a rebuild.
- **Done:** the rebuild test and the separation tests green and locked; the snapshot committed.

### Piece 4 — the liveness table (N.1), thin
The first real subject in the chain, and with its second file the first real upgrade.
- `os.liveness`: one row per thing whose life is shown — kind (`process`, `lane`, `link`, `connector`,
  `tool_server`, `model_door`), when it was last observed, what was observed (`answers`, `failed` with what,
  `unknown`), readiness where the thing has capacity (`free`, `full`), and how often it is expected to be observed.
  Nothing about work.
- Reference rows (the code's vocabulary, re-applied): the four processes — engine, executor, intake, voice daemon —
  and the model door. Lanes, links, connectors and tool servers get their rows with the parts that own them.
- Two doors: `liveness_beat()` — a process writes its own row and no other, known by its login; `liveness_observe(…)`
  — the engine's probe writes what it found for a thing that is not a process, and is refused for a process row.
- The reader: `liveness_state(at)` derives, on the reader's clock, **stopped** (the beat is overdue), **failed link**
  (it beats and its probe failed), **resting**, **unknown** (never observed, or the probe could not tell). **Working**
  needs runs and is added at stage 1 with them; a stopped process with an open run shown as stranded is stage 1's
  trial (PLAN.md §6).
- **Tests first, as the service logins:** the executor cannot beat for the engine; no login writes the table
  directly; never observed reads `unknown`, not zero; an overdue beat reads `stopped` on a clock the test supplies;
  a probe's failure reads `failed link`; `os_reader` reads the state and writes nothing; the table arrives by a
  versioned change onto a populated bench and the earlier rows stand.
- **Not decided here:** the beat interval and what a probe costs (PLAN.md §8.13) — the interval is a column, set
  when stage 1 measures it.
- **Done:** the tests green and locked; the snapshot updated in the same commit.

### Piece 5 — two measurements, each kept as a test
PLAN.md decision 1 says the real sign-in and broadcast are present on the bench, and stage 0 must show the clocks and
broadcast targets do not meet. Both rest on things nobody has run.
- **Broadcast:** a function owned by `os_owner` sends "look" on a private topic under `os:`; a client signed in
  through the bench's real sign-in receives it; an anonymous client receives nothing; a `dxb:` topic is untouched.
  The measurement says what the chain must own outside `os` for this (a policy on `realtime.messages`, a grant) — each
  enters the snapshot by name. N.2's rules (coalescing, the last write in a window) stay stage 2's.
- **The clock:** pg-boss in `os_clock`, its schema created by the chain as the owner; the engine's login schedules and
  works one routine there without the right to create or alter the schema, and cannot touch `pgboss`. If pg-boss
  cannot run so, the finding comes back to PLAN.md §2 F before stage 1 builds the engine — it is not worked around.
- **Done:** two tests green and locked, or a written finding with what was measured.

### Piece 6 — the seat's tool door and per-turn usage, tried live
A live trial on demand (`pnpm foundation:live seat-door`), not part of the battery: it calls a model.
- A seat session started from an allow-list of named variables — no database address, no outward key in its
  environment.
- One tool served in the runner's own process (`createSdkMcpServer`), bound in code to a run the model cannot name or
  change: the tool takes no run argument; the handler receives the run the runner holds.
- Shown: the model calls the tool and the handler sees the bound run; a prompt that asks for another run changes
  nothing; the session's own tools cannot read a database address; each turn's usage is captured, and the session's
  total.
- **Done:** the trial's output in the job folder — what held, what did not, the tokens it cost; PLAN.md §8 item 2
  rewritten from "documented, not run" to what was measured.

### Piece 7 — the ruler for additions (§2 M), thin
`foundation/bench/additions-ruler`: given an office's own places and a range of commits, it lists every changed file
outside those places, and beside each whether the office's record names it as a change to the foundation. It reports;
`--strict` fails on an unnamed one. An office's places are a short list in its own folder; the declaration's final
form is frozen only after two real offices (PLAN.md §2 M), and nothing more is built toward it here.
- **Tests first**, on a throwaway repository: a change inside the office's place is not listed; one outside is; a
  named one is marked named; a renamed file is seen at both ends; generated files (the snapshot) are listed apart.
- **Done:** the tests green and locked.

### Piece 8 — the stage's proof and its close
- `pnpm foundation:bench`: the rebuild from nothing, the snapshot comparison, the whole new battery, the lock tool
  over every lock → `BENCH_GREEN`.
- The old battery, run after it: the same result as before stage 0 — the two reds named above and no other.
- The auditor's read tool reads `os` as `os_reader`, so the stage's blind audit can query what was built.
- One blind audit pass over stage 0's commits, by two auditors side by side; the fixes; the touched tests again.
- The specs, in place (PLAN.md §2 L): DATA_MODEL's change discipline says what the chain now is.
- PLAN.md §8 items 1, 2 and 13 say what was measured; the board row's note; STATE.

## 5. Order

`0a` and `0b` beside everything. `1` first. Then `2 → 3 → 4 → 5`. `6` and `7` beside them, after `1`. `8` last.

## 6. Risks

1. **The installing role is not a superuser.** Ownership through `os_owner`, grants on `realtime` and pg-boss under
   least privilege are measured before they are relied on (pieces 3 and 5); a wall met there is brought back, not
   worked around.
2. **The rebuild removes things.** It runs only behind the bench's identity check, removes only what carries the
   foundation's names, and the fingerprint test proves the rest of the cluster untouched. No company target exists.
3. **Roles are cluster-wide.** The bench and the company are separate clusters; the `os_*` roles are made on the
   bench only until stage 5.
4. **Two batteries.** They share the bench under one lock and never run at once; the old one cannot see `os`, the
   new one never writes outside it.
5. **The lock is only as good as the lead's reading of the tests.** The tests are written by a hand that does not
   write the code, and the lead commits them before the code exists.
6. **§2 M's ruler is built before any office exists.** It is tried on a fixture only; its first real use is stage 1's
   first job type, and what that shows changes it.
7. **The quota.** The first real figure for what a piece costs comes from piece 2 and is told to him.

## 7. Unverified until built

Everything in §4 is a contract, not a result. The names in §3 are the lead's choice. That PUBLIC's USAGE on `public`
is the only thing a new login shares with the old system is expected, not measured.
