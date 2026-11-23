# B85 · stage 0 · piece 3 — the chain's runner, schema files: the contract

Cut from `../BUILD.md` §6 piece 3 and PLAN.md §2 A ("Chain", "It rebuilds and it upgrades"). This file is the contract
the tests are written from and the code is written to. The lead wrote it (2026-11-23); what it decides beyond BUILD.md
is marked **[lead]** with its reason.

## 1. What the piece leaves standing

1. A package `foundation/chain` (`@dxb-foundation/chain`) — the runner. It depends on `pg` (catalog) and on
   `@dxb-foundation/bench` (workspace), and on nothing else; run by Node directly like the bench (erasable syntax,
   imports spelled with `.ts`). Everything a caller may use is exported from `src/index.ts`.
2. One root script: `foundation:chain` (`node foundation/chain/src/cli.ts`).
3. Its tests in `foundation/tests/chain/`, locked as `piece-3`.

Old files touched: the root `package.json` (one script), `pnpm-lock.yaml`. `foundation/tsconfig.json` gains
`chain/src/**/*.ts`; `foundation/tests/package.json` gains the package. Nothing else outside `foundation/`. **No file
is written under `db/` in this piece** — the chain's first files are piece 5's, after its measurements.

Not in this piece: the functions pass and the reference pass (piece 4), roles and the schema `os` (piece 5), the
snapshot and the install proofs (piece 6).

## 2. The carry list — the old runner read once (`scripts/bootstrap-db.sh`, its ledger, its tests)

| The old contract | Verdict |
|---|---|
| Order is the file name's 14-digit prefix, by the shell's glob; a file sorting before an applied one is applied out of order, silently | **Rewritten** — §4: a number in the name; a new file at or before an applied one stops the run |
| The file and its ledger row are two calls; a run that dies between them applies the file again | **Dropped as a defect** — §6: one transaction owned by the runner |
| A file may carry its own `BEGIN`/`COMMIT` (75 of 188 do); one without leaves its first statements behind when a later one fails | **Dropped as a defect** — §6: the server refuses them, a failing file leaves nothing |
| The ledger holds version and name; "applied" is "a row exists"; a changed, missing or renamed file is checked by nothing | **Rewritten** — §5, §4: hash, when, who, runner version; the disk is checked against the ledger in both directions |
| Nothing stops two runs at once | **New** — §6: one runner at a time |
| The target is whatever `DXB_DATABASE_URL` says; the runner checks no identity; a second path (`DXB_PSQL`) can reach another database | **Dropped** — §3: no address by variable or argument; the bench's guard on every connection that works |
| `db-suite.sh`: ledger count = file count; a second run prints "applied 0"; a commented `-- ROLLBACK:` block is run as SQL | The count is replaced by §4's check; "a second run applies nothing" is **kept**, asserted on the outcome and the ledger, not on a log line; rollback blocks are **dropped** — the chain is forward-only |
| 125 files carry data beside schema | **Kept** — a seed is a versioned change through the same runner (BUILD.md §4); nothing to build here |
| The company's ledger once stood 32 files behind and was healed by writing rows by hand | **Not carried** — the runner has no door that marks a file applied without running it; what stage 5 needs is stage 5's contract |

## 3. Measured facts (the lead's runs on the foundation's bench, 2026-11-23) — not to be re-litigated

Evidence: `evidence/measure.sh`, `evidence/measure.out`, `evidence/measure-privileges.out`.

- **A throwaway database** on the foundation's instance: `create database` by `postgres` takes 0.06 s, `drop database`
  0.5 s; it has its own `oid` and name under the instance's cluster identifier; `plpgsql` is there; it carries no
  default privileges and no event trigger. The instance's own `postgres` database carries both.
- **The server refuses a file that opens or closes a transaction — when the file's text is handed to it as data and
  executed by plpgsql.** Inside the runner's `begin`: `select set_config('os_chain.file', <text>, true)` (a bound
  parameter), then `do $w$ begin execute current_setting('os_chain.file'); end $w$`. So run, a text holding `commit`,
  `rollback`, `begin`, `start transaction`, `end`, `abort`, `savepoint` or `prepare transaction` fails with
  `EXECUTE of transaction commands is not implemented`; a `do` block or a called procedure that commits fails with
  `invalid transaction termination`; in every case nothing of the text is left, the statements before the offending
  one included. Accepted, with the transaction id unchanged: several statements where a later one needs an earlier
  one; a plpgsql body with `begin … end`; `begin atomic`; the words `commit` and `rollback` inside a string or a
  comment; an empty text; a text that is only a comment. A failing statement (`select 1/0`), a syntax error anywhere
  in the text and `create index concurrently` each fail the whole text and leave nothing. A 2 MB text passes as a
  setting.
- **The same text sent as one plain query inside the runner's `begin` is not safe:** `create table a; commit; create
  table b; select 1/0;` left table `a` behind.
- **A session outlives a file.** After a file that ran `set search_path = pg_catalog; set role pg_monitor; create
  temp table …` and was committed, the next statement of the same session met that search path, that role and that
  temporary table.
- **Privileges.** A schema and a table made by `postgres` have no ACL (owner only) when the database carries no
  default privileges. With a default privilege planted (`alter default privileges for role postgres grant select on
  tables to pg_monitor`, `… grant usage on schemas to pg_monitor`) both are born granted to that role; a revoke by
  name removes it.
- **Names.** No schema, role or database whose name starts with `os` exists on the instance.
- **A session-level advisory lock** taken by one session is refused to a second (`pg_try_advisory_lock` → false) and
  free again when the first session ends.
- The server's error for a failing statement inside the text gives the message and the whole text as context, not
  the statement's position; a syntax error gives the position.

## 4. The chain on the disk

- **The root** is a directory that holds `schema/` (piece 4 adds `functions/` and `reference/` beside it). The
  command's default root is `db` of this repository, found from the package's own location, never from the working
  directory.
- **`schema/` is closed.** Every entry must be a regular file whose name matches
  `^[0-9]{4}-[a-z0-9]+(-[a-z0-9]+)*\.sql$`. The four digits are the file's **number**; files are ordered by number.
  **[lead]** BUILD.md says "ordered"; a number in the name is the one order that needs no second file to agree with.
- **A file's hash** is the SHA-256 of its bytes, lower-case hex. Its text is those bytes read as UTF-8.

**The disk's own offences** — found from the directory alone, before any connection:

| Kind | Detail | When |
|---|---|---|
| `unknown-entry` | `<name>` | an entry that is not a regular file of that name pattern — a directory, a link, any other name |
| `duplicated-number` | `<name> <name>` | two files carry the same number (names in ascending order) |
| `duplicated-content` | `<name> <name>` | two files carry the same hash (names in ascending order) |
| `empty` | `<name>` | a file of no bytes, or of white space only |
| `unreadable` | `<name>` | a file that cannot be read, or is not valid UTF-8 |

**The disk against the ledger, in both directions** — `ledger` here is the rows of kind `schema`, by position:

| Kind | Detail | When |
|---|---|---|
| `changed` | `<name>` | a ledgered name is on the disk with another hash |
| `renamed` | `<old> <new>` | a ledgered name is not on the disk, and exactly one file the ledger does not hold carries its hash |
| `missing` | `<name>` | a ledgered name is not on the disk, and no such file carries its hash |
| `before-applied` | `<name>` | a file the ledger does not hold (and that is no rename's `<new>`) has a number not greater than the greatest ledgered number |
| `reordered` | `<name>` | walking the ledger by position, a row's number is not greater than the row's before it — said of that row |

One offence per fault, the most specific kind: a renamed file is `renamed` alone — not also `missing`, and its new
name not also `before-applied`. Every offence is collected; none stops the search for the others. **Pending** — the
files to apply — are the files the ledger does not hold, by number; when there is any offence, nothing is pending.

## 5. The ledger

- **Its place:** schema `os_chain`, table `os_chain.ledger`, both owned by the role that runs the chain. **[lead]**
  The ledger must stand before the chain's first file runs, and schema `os` is made by the chain's own files (piece
  5); a ledger inside `os` would have to be made by what it records.
- **Its columns:** `position integer primary key` (0 and upwards) · `file text not null unique` · `kind text not
  null`, one of `ledger`, `schema` · `hash text not null`, 64 lower-case hex digits · `applied_at timestamptz not
  null` · `applied_by text not null` · `runner_version text not null`. Kind and hash are held by CHECK constraints.
- **Row 0 is the ledger's own bootstrap** **[lead]**: `file` is `(ledger)`, `kind` is `ledger`, `hash` is the SHA-256
  of the bootstrap's own SQL text as the runner holds it. A ledger whose row 0 is absent or carries another hash — or
  a schema `os_chain` without a readable `ledger` table — is a ledger this runner does not know:
  `ledger-unknown`, and nothing is written. "Create if not exists" would accept a table of any shape in silence.
  A table of other columns, and a second row of kind `ledger`, are unknown too.
- **The bootstrap** makes the schema, the table and row 0 in one transaction, and leaves **no privilege on the schema
  or the table to anyone but their owner, whatever default privileges the database carries** (§3 measured that a
  planted default reaches both).
- **A file's row:** `position` is the greatest position plus one; `file` its name; `kind` `schema`; `hash` its hash;
  `applied_at` the server's clock when it was applied; `applied_by` the session's login (`session_user`);
  `runner_version` the package's `RUNNER_VERSION`.
- The runner inserts rows and never updates or deletes one. An enforcement of that against other hands is not built
  here.

## 6. The run

`applyChain({ target, root, lockWaitSeconds })`, in this order:

1. **The disk.** `<root>/schema` is not a directory → `ChainRefused("no-chain")`. Any offence of the disk's own →
   the outcome `offences`; no connection is opened.
2. **The lock.** One session-level advisory lock on the target database, under one fixed key of the package, held on
   a connection of its own from here to the run's end, however it ends. Busy: with no `lockWaitSeconds` →
   `ChainRefused("busy")` at once; with it → the runner waits up to that long, then the same refusal.
3. **The ledger is read under the lock.** Unknown (§5) → `ChainRefused("ledger-unknown")`. Absent → no rows.
4. **The comparison** (§4). Any offence → the outcome `offences`. **Nothing has been written — not the ledger's
   bootstrap either.**
5. **The bootstrap**, when the ledger is absent.
6. **Each pending file, in order, in a session of its own** **[lead]** (§3: a session outlives a file — a clean build
   would run every file in one session and an upgrade only the later ones in a fresh one, so the same chain could
   build two different databases). In that session: `begin`; the file's ledger row; the file's text executed as §3
   measured — handed to the server as data, run by plpgsql `execute`; `commit`. **The row is written before the
   text** (the lead, on the code hand's first red run: a file that ended in `set role` left the session unable to
   write the ledger, which is its owner's alone) — so nothing a file does to its session reaches the writing of its
   own row, and a refused file takes the row with it. **[lead]** BUILD.md says a file that
   opens or closes a transaction "is refused": the server refuses it, in the act, with nothing left — a search of the
   text for the words would refuse a string that spells them and miss a procedure that commits.
7. **A file fails** → its transaction is rolled back, the run stops, the outcome is `file-failed` with the file's
   name, the server's message and the files applied before it in this run. What committed before it stays; a second
   run after the file is corrected applies it and the rest.

**The guard.** Every connection the runner opens — the lock's, the ledger's, each file's — passes the bench's
`assertFoundationTarget` (with `target.statePath`) before any other statement is sent on it; a `TargetRefused` is not
caught. The command's target is the bench's `connectionString()` under the default list; **no argument, option or
variable names a target.** The company's and the old bench's clusters are refused by the bench by name, whatever a
list says. When stage 5 moves the company, what the runner may reach there is that stage's contract.

The runner reads no environment variable.

## 7. What the library exports (`foundation/chain/src/index.ts`)

```ts
export const RUNNER_VERSION: string;                       // "1"
export type Target = { connectionString: string; statePath?: string };
export type OffenceKind =
  | "unknown-entry" | "duplicated-number" | "duplicated-content" | "empty" | "unreadable"
  | "changed" | "renamed" | "missing" | "before-applied" | "reordered";
export type Offence = { kind: OffenceKind; detail: string };
export type ChainFile = { name: string; number: number; hash: string; text: string };
export type LedgerRow = { position: number; file: string; hash: string };   // the rows of kind `schema`
export type Outcome =
  | { state: "applied"; applied: string[]; standing: number }   // applied now, in order; standing: schema rows after the run
  | { state: "offences"; offences: Offence[] }
  | { state: "file-failed"; file: string; message: string; applied: string[] };
export class ChainRefused extends Error { readonly reason: "no-chain" | "busy" | "ledger-unknown" }
/** Reads `<root>/schema`. Files by number; the disk's own offences (§4). Throws ChainRefused("no-chain"). */
export function readChain(root: string): { files: ChainFile[]; offences: Offence[] };
/** Pure. §4's second table: the disk against the ledger. */
export function compare(files: readonly ChainFile[], ledger: readonly LedgerRow[]): { offences: Offence[]; pending: ChainFile[] };
/** §6. */
export function applyChain(input: { target: Target; root: string; lockWaitSeconds?: number }): Promise<Outcome>;
/** Pure. What the command prints on stdout for an outcome or a refusal, and its exit code (§8). */
export function answerOf(result: Outcome | ChainRefused | TargetRefused): { lines: string[]; exit: number };
```

Offences are ordered by kind as the tables of §4 list them, then by detail.

## 8. The command

`pnpm foundation:chain up [--root <dir>] [--wait <seconds>]`. Progress goes to stderr; stdout carries the answer, its
last line the verdict:

| Result | Lines on stdout | Exit |
|---|---|---|
| `applied` | `CHAIN_GREEN applied=<n> standing=<n>` | 0 |
| `offences` | one `OFFENCE <kind> <detail>` each, then `CHAIN_RED offences=<n>` | 1 |
| `file-failed` | `FAILED <file> <the server's message on one line>`, then `CHAIN_RED file-failed applied=<n>` | 1 |
| `ChainRefused` | `CHAIN_REFUSED <reason>` | 2 |
| `TargetRefused` | `CHAIN_REFUSED target-<the bench's reason>` | 2 |
| anything else spelled after `foundation:chain` | `usage: cli.ts up [--root <dir>] [--wait <seconds>]` | 2 |

`--wait` takes a positive integer. An error that is none of these is shown whole on stderr and ends with exit 1.

## 9. The tests — `foundation/tests/chain/`, written before the code

A test never recomputes its expected value the way the code does: each offence's kind and detail is spelled in the
test, and a fixture file's hash is spelled as a literal beside its text.

1. **`read-chain`** (temporary directories, no database): files come back by number with name, number, hash and
   text; each of the five disk offences, planted and named; two offences at once are both said; `no-chain`.
2. **`compare`** (pure): equal → no offence, nothing pending; new files after the last → pending in order; `changed`;
   `missing`; `renamed` — one offence, not three; a rename whose hash two new files carry is `missing` (and
   `duplicated-content` is the disk's); `before-applied` for a lower number and for an equal one; `reordered`; several
   faults → every one said, nothing pending.
3. **`answer`** (pure): every row of §8's table.
4. **`on-the-bench`** — one test module, so the instance is made once; its cases may lie in files it imports. Its
   set-up takes the bench's host lock; uses the instance when one stands and leaves it standing, makes one when none
   does and destroys it at the end; every case works in a throwaway database it creates and drops (dropped by the
   `oid` it recorded, not by a pattern of names), reached through a list file of its own that names that database's
   identity. Nothing is ever applied to the instance's own `postgres` database. The cases:
   - **built from nothing:** an empty database, a chain of three → `applied` names the three in order; their objects
     stand; the ledger holds row 0 and three rows with name, kind, the literal hash, a login, `RUNNER_VERSION`,
     positions 1–3; a second run applies nothing and changes no row;
   - **the bootstrap:** a chain of no files leaves row 0 alone; a database that carries planted default privileges
     gets a ledger and a schema with no grantee but the owner; a ledger whose row 0 carries another hash, and a schema
     `os_chain` with no table → `ledger-unknown` with nothing changed;
   - **each sentence of §4's second table, on a real ledger:** the offence said, and neither the ledger nor the
     database changed by the run;
   - **nothing before the check:** an empty database and a chain with a disk offence → no schema `os_chain` afterwards;
   - **a failing file:** the second of three fails after making a table → `file-failed`; the first is ledgered and
     stands, nothing of the second or third; the file corrected → the next run applies the two;
   - **a file that opens or closes a transaction:** `commit`, `rollback`, `begin`, `savepoint` in the middle of a
     file, and a `do` block that commits — each `file-failed` with a message that says `transaction`, and the
     statements before it in that file left nothing; a file with a plpgsql body and the words inside a string and a
     comment is applied;
   - **a session of its own:** a file that sets a search path, a role and a temporary table, then a file that
     records what it meets → the defaults, and no temporary table;
   - **a populated database upgraded:** a chain of two applied, rows written, a third file that alters the table and
     adds another → the rows are there, the first two ledger rows unchanged to the instant;
   - **one runner at a time:** while a run sits in a file that sleeps, a second run with no wait → `busy`; a second
     with a wait → runs after the first and applies nothing; after a run ended, the next takes the lock;
   - **the target:** a database whose identity the list does not hold → `TargetRefused` `not-listed`, and no schema
     `os_chain` in it; a list that loses the identity while a file sleeps → the next file's connection is refused and
     the first file stays ledgered (timing: the sleep is the margin);
   - **the command:** `up --root <a root with a disk offence>` → the `OFFENCE` line, `CHAIN_RED`, exit 1; `up --root
     <a directory with no schema/>` → `CHAIN_REFUSED no-chain`, exit 2; a wrong word → the usage line, exit 2; after
     them the instance's `postgres` database holds no schema `os_chain`.

Piece 1's and piece 2's tests are not edited; `no-old-address` must stay green with this piece in place.

## 10. Known limits, said before the build

- **The command's green path on its real target is first run in piece 5**, with the chain's first files: here it
  would write fixture tables into the instance's own database. Its wiring to the target is read by the lead.
- A file is trusted code: it can read `os_chain.file`, write the ledger, or take any act its role may. The runner
  defends against accident, not against its own files.
- The check sees files and ledger rows, not objects: something made by hand beside the chain is seen by piece 6's
  snapshot, not here.
- A comment-only file is applied and ledgered; only a file of no text at all is `empty`.
- The lost-identity case rests on a sleep as its margin.
- While the chain's module holds the host lock, `foundation:instance up|down|fresh` wait or are refused — by design.

## 11. Done when

`pnpm foundation:typecheck` exits 0 · the tests of §9 pass whole, and were red before the code for the right reason ·
`pnpm foundation:verify piece-1`, `piece-2` and `piece-3` each end `LOCK_GREEN` on the committed revision · after the
runs nothing of `DxB_Foundation` stands that the run made, and no throwaway database is left · `pnpm install
--frozen-lockfile` exits 0 with the lockfile unchanged · the old `pnpm typecheck` still exits 0.

## 9a. What the tests pinned beyond §4–§9 (the test hand's readings, read and accepted by the lead)

- **The disk is judged before the target is asked who it is:** a disk offence is the answer even for a database no
  list holds, and `no-chain` likewise.
- **An entry of `schema/`:** a link is `unknown-entry` also when it carries a file's name and leads to a file; a file
  this user may not read is `unreadable`; a comment-only file is a file; what lies in the root beside `schema/` is
  not read. `no-chain` also when the root itself does not exist.
- **`compare`:** a ledgered name gone whose hash two new files carry is `missing` alone; `before-applied` for an
  equal number is said beside the `missing` of the file that held it; `reordered` also for an equal number.
- **The ledger's table:** the seven columns, none nullable; `position` the primary key; a second row of a `file` is
  refused; `kind` takes `ledger` and `schema` only; `hash` exactly 64 lower-case hex digits. A table `os_chain.ledger`
  of another shape is `ledger-unknown`.
- **Row 0** carries the login and `RUNNER_VERSION` like any row; `applied_at` lies within the run by the server's clock.
- **A second run changes no row** — seen by each row's text and the transaction that wrote it.
- **The lock is let go however a run ends** — after a failed file, a green run, offences and a refused target the
  next run is not `busy`. A wait that runs out refuses after the wait, not before.
- **`answerOf`:** a server message of several lines is said on one; each of the bench's four reasons has its line.
- **The command:** `--wait` beside `--root` is taken; the word in capitals, no word, a word or an unknown option
  after the options, and `--wait` with `0`, a fraction, a word or nothing are each the usage line, exit 2.

The test hand was cut off by a server error before its report; the lead read every file, ran the tests against the
stub (100 red by `NOT_BUILT`, 9 green: the harness seen to work and the fixture hashes seen to be right) and found
in the hand's scratch folder a stand-in runner it had used to see the tests green and, wrong in one way at a time,
red. The stand-in is not the product and is not given to the hand that writes the code.
