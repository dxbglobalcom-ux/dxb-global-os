# B85 — stage 0, piece 6b: "upgraded equals clean", and the rows kept — the contract

The lead's contract for the second part of BUILD.md §6 piece 6 (2026-11-23). What 6a left for "6b" is cut once
more where its parts stand alone **[lead]**: **6b** (this file) — a database built at an earlier revision of the
chain, given rows and upgraded by the delivery command has the same snapshot as a clean one, and its rows;
**6c** (its own contract, after this) — what a build changes outside the snapshot's reach, by a whole-catalogue
reading before and after. Marks: **[lead]** a decision of the lead's inside the cut; everything under §3 is measured.
6a's contract (`piece-6/SPEC.md`) stands whole and is not repeated: "§4.2 of 6a" and the like point into it.

## 1. What the piece leaves standing

- **The rows' text** — `rowsOf(target)` in `@dxb-foundation/chain`: one text of what the tables of the covered
  schemas *hold* — every row, and where every sequence stands — in the snapshot's form and read as the snapshot is.
- **"Kept"** — the pure `keptOf(before, after)`: every row the earlier text holds is still held, column for column,
  and no sequence stands behind where it stood.
- **Its command** — `pnpm foundation:chain rows` prints the text; `pnpm foundation:chain rows --kept <file>` says
  `ROWS_KEPT` or names every row that is lost and every sequence that went back.
- **The chain at a revision** — `chainAt(repository, revision, into)`: the chain's three directories as a commit
  holds them, written out as a root `chain up --root` takes. Read from git's objects, never from the working tree.
- **The proof "upgraded equals clean", on two revisions of a fixture chain:** a clean build of the later revision
  equals its committed text; an instance built at the earlier one, given rows and upgraded by `chain up`, equals
  the same text and keeps its rows.
- **The proofs that go red:** an applied file edited in place of a new one; a change that a populated table
  refuses; a change that loses a row, a value and a sequence's place while the chain is green; a change whose
  structure depends on the rows it meets.
- **Where the real chain's upgrade is proven from** (§7): one committed revision, held by the lock.

Not in this piece: the outside proof (6c); the bench command that runs the real chain's upgrade on every run (13).

## 2. The carry list (PLAN.md §2 K) — read once

| Old contract | Verdict | Where it lands |
|---|---|---|
| Content, not counts: each row as text (`scripts/b36/prove-restore-content.mjs:3-8`) | kept | §4 `row` |
| One md5 per table (`prove-restore-content.mjs:24-27`) | rewritten | a line per row — a hash hides which row |
| Sequences are part of what a database holds (`scripts/b36/company-state-fingerprint.mjs:4-9`) | kept | §4 `sequence-position` |
| Large objects, the audit records as a class of their own (same file) | dropped | `os` holds no large object; an audit record is a row |
| "A populated fixture upgraded with its rows kept" (`foundation/tests/chain/cases/sessions-and-upgrade.ts:99`) | stands | piece 3's lock; it reads two tables by hand — this piece reads every table |

The old system never built a database at an earlier revision of its own chain.

## 3. Measured facts (2026-11-23) — not to be re-litigated

1. **The real chain cannot be upgraded from the revision before its last change.** Built at `8faf72e6` and
   upgraded at `c1079ad7`: `OFFENCE changed 0001-roles.sql`, `CHAIN_RED offences=1`, exit 1 — piece 5's audit
   corrected an applied file while no database lived on it (`piece-6b/evidence/measure-m1-real-history.out`).
   Since `46115fd1` the three directories are unchanged (`git diff 46115fd1 HEAD -- db` is empty).
2. **`db/` is not the chain's alone:** it holds the old system's `db/migrations/` (188 files) and `db/seed/`.
   The chain's own are `db/schema/`, `db/functions/`, `db/reference/`; the last two hold a `.gitkeep` each.
3. A fresh instance takes about 52 s to make; `chain up` on it about a second.
4. The lock's clean copy holds no `.git` (`foundation/lock/src/runner.ts`: the tree's entries are written out).
   A locked test may make a throwaway repository of its own (`foundation/tests/lock/fixtures/fixture-repo.ts`).
5. A lock is made over several directories: `pnpm foundation:lock <piece> <dir>…` (`foundation/lock/src/cli.ts:14`);
   piece 6's lock holds `foundation/tests/snapshot` today. The inventory of pieces has no `piece-6b`.
6. From 6a, carried: a session's settings change a value's text (6a §3.2); `to_jsonb(row)::text` is what a
   vocabulary's `reference` line already prints; the bench's superuser is reached as
   `foundation/tests/snapshot/fixtures/superuser.ts` does; the fixture chain of 6a makes `os.parts` (an identity
   key, row security forced, a trigger, a foreign key to the vocabulary `os.kinds` with `on delete restrict`), the
   sequence `os.ticket_seq`, and its committed text is `foundation/tests/snapshot/expected/fixture.snapshot.txt`.
7. Piece 4's rules an upgrade meets: a function's body is replaced by its file on every run; a removed function
   or a changed signature arrives as a schema file, and after the pass the functions of `os` are exactly the
   files'; a vocabulary is made equal to its file, and a removal that a foreign key refuses stops the pass.

## 4. The rows' text **[lead]**

Its form is the snapshot's (6a §4.2) with its own first line, `rows-format 1`: every other line stands alone, the
lines are sorted by their UTF-8 bytes, the same escapes, no oid, no ctid.

| Line | For |
|---|---|
| `row <regclass> <to_jsonb(row)::text>` | each row of each ordinary table (`relkind` `r`; a partition is one) of a covered schema (6a §4.1), read `only` — **but** the ledger and every vocabulary's table: both are lines of the snapshot, and both change by the chain's own design |
| `sequence-position <regclass> <last_value> called <b> ascending <b>` | each sequence of a covered schema, an identity column's too: `last_value` and `is_called` read from the sequence itself; `ascending` is `t` when its increment is above zero |

It is read as the snapshot is (6a §4.4): one guarded connection, one `repeatable read, read only` transaction, the
same ten `set local` before the first read, as whoever the target logs in, nothing temporary. **A text is whole or
there is none:** a table or a sequence the session may not read fails the call. A database with no covered schema
gives the first line alone. An unlogged table's rows are rows.

## 5. "Kept", the command and the library

**`keptOf(before: string, after: string): { lost: string[]; back: string[]; rows: number; sequences: number }`**,
pure. Both are rows' texts.

- **A row is kept** when a row of the same table in `after` holds every key of it with an equal JSON value; each
  row of `after` answers for one row of `before` at most (rows are a multiset). **Equal is "the server printed it
  the same"** (§6a.1): a row's own keys are a set, and under each key the value's text is compared as it stands —
  `12.5000` is not `12.5`, and no number passes through a double. A row that is not kept is *lost*.
  New columns and new rows cost nothing; a column dropped, a column retyped so that a value's text changes, a
  value changed, a row deleted, a table emptied, dropped or renamed lose rows — and the piece that means such a change says so (§9).
- **A sequence is kept** when `after` holds its line and it does not stand behind: by `ascending`, `last_value`
  is not lower (not higher, descending), and at the same `last_value` `called` has not gone from `t` to `f` —
  **and its direction is the same**: a sequence turned round gives again what it gave (§10.1).
- `lost`: for each lost row `- row <regclass> <its JSON>`; then, **for each table that lost a row**, every row of
  `after` in that table that answered for none, whole, as `+ row <regclass> <its JSON>` — so a changed value is
  read beside what it became. `back`: `- sequence-position …` (the line of `before`) and, when `after` holds the
  sequence, `+ sequence-position …` (its line). Each list sorted by the line after its sign, `-` before `+` for
  one line. `rows` and `sequences` count the lines of `before`.

`rowsOf(target: Target): Promise<string>`, `keptOf` and `chainAt` are exported from `foundation/chain/src/index.ts`;
the code lies under `foundation/chain/src/` and reuses the snapshot's reader — one place sets the session.

| `pnpm foundation:chain …` | stdout | exit |
|---|---|---|
| `rows` | the text, byte for byte, and nothing else | 0 |
| `rows --kept <file>`, all kept | `ROWS_KEPT rows=<n> sequences=<m>` | 0 |
| `rows --kept <file>`, not all | `lost`, then `back`, then `ROWS_RED lost=<rows lost> back=<sequences back>` (the counts are of `-` lines) | 1 |
| the file is absent, no regular file, or cannot be read | `ROWS_REFUSED no-before` — before any connection | 2 |
| the file is not a rows' text (6a §5's malformations, with this first line; a byte-order mark; not UTF-8) | `ROWS_REFUSED before-malformed` — before any connection | 2 |
| the bench's guard refuses the target | `ROWS_REFUSED target-<reason>` | 2 |
| `rows` with any other words | `usage: cli.ts rows [--kept <file>]` | 2 |

Every other call answers as today: `snapshot …` its own table, the rest piece 3's usage line. The command never
writes a file. The difference is never cut short.

**`chainAt(repository: string, revision: string, into: string): { commit: string; files: number }`** — resolves
`revision` to a commit of the repository at `repository` and writes, under `into`, every file that commit holds
under `db/schema/`, `db/functions/` and `db/reference/`, at its path below `db/` (`into/schema/0001-roles.sql`),
byte for byte, from git's objects. A directory the commit does not hold is not made. It throws `RevisionRefused`
with a `reason`: `unknown-revision` (also a revision that begins with `-`); `into-not-empty` (`into` stands and
holds anything); `not-a-file` (an entry under the three directories that is a link or a gitlink). `files: 0` is an
answer: that commit holds no chain, and a missing `into` is then not made. **A refused call writes nothing:** every
entry is judged before the first byte is written. An `into` that is a regular file is `into-not-empty`. Nothing of the working tree or the index is read; nothing outside `into` is
written; the repository is not written to.

## 6. The tests — `foundation/tests/upgrade/`, written before the code

By a hand that will not write the code, as the chain's own callers (the library through `@dxb-foundation/chain`,
the commands as child processes). The fixtures of pieces 1–6a are reused by import, not copied. Each bench module
makes its own fresh instance and destroys it; each file is one command under four minutes.

**The two revisions of the fixture chain.**
- **A — the earlier:** 6a's fixture chain as it stands (`fixtureRoot()`); its text is 6a's committed one.
- **B — the later:** A's schema files byte for byte, then `0005-…sql`, a versioned change made as the owner: a
  column added to `os.parts` with a default and `not null`; a second column added, filled from each row's own
  values by an `update`, then set `not null`; a CHECK that the given rows satisfy; an index; a table of his policy
  kind (no vocabulary mark) with one seeded row; `os.next_ticket` dropped in its old signature and made in a new
  one (its file in B carries the new one — piece 4's rule). B's `functions/` changes one other function's body in
  its file alone; B's `reference/kinds.json` changes one row's label, adds a row and removes one that no given
  row names.
- **The rows given** (`fixtures/rows.sql`, run by the bench's superuser on A): five or more rows of `os.parts` —
  the three numeric defaults left to themselves in one, a null in another, a text holding a newline, a backslash,
  a carriage return and a letter outside ASCII, kinds that B keeps; `os.ticket_seq` drawn from three times.
- **Written by hand from this contract and 6a's**, never by the code under test, in
  `foundation/tests/upgrade/expected/`: `b.snapshot.txt` (6a's fixture text with the lines B changes),
  `a.rows.txt` (the rows given, as §4 reads them) and `b.rows.txt` (the same rows after B: the two new columns'
  values, the seeded row, the sequences where they stand).
- **The variants** — each a root made in a temporary directory:
  *edited* — A with one statement added inside `0003-inside.sql`, and no `0005`;
  *refused-when-populated* — A, then a `0005` that adds a `not null` column without a default;
  *C* — B, then `0006-…sql`, which on an empty database changes nothing the snapshot reads: it changes one
  value of one row, deletes another row, restarts `os.ticket_seq`, and makes an index only if `os.parts` holds a row.

**A — without the bench.**
1. `keptOf`, on texts written in the case: equal texts; a column added; a row added; a value changed (one `-`,
   one `+`); a row deleted; a table gone; a column gone (every row of it lost); two equal rows against one (one
   lost); two against two; a sequence behind, ascending and descending; `called` gone back; a sequence gone;
   a sequence further on; the lists' order; the counts.
2. The command refuses a missing file, a directory and each malformed spelling — with no instance standing, said
   by a case of its own; `rows` with unknown words answers its usage line; `snapshot` and piece 3's usage line
   are unchanged.
3. The three expected texts obey their form (first line, sorted, no `\r`, no empty line, final newline) and hold
   no line of a kind their table does not name. `real/from.txt` (§7) is forty lower-case hex digits and a newline.
4. `chainAt`, on a throwaway repository the case makes (three commits: no chain; a chain beside other files under
   `db/` and outside it; the chain changed): the files of the middle commit byte for byte — a CRLF and a file
   without a final newline among them — and none of `db/`'s other directories; the first commit gives `files: 0`
   and no directory; a file changed in the working tree and one staged are not seen; a branch name, a short id
   and a full id resolve to the same commit; each refusal by its reason; nothing is written beside `into`; the
   repository's `HEAD`, index and working tree are as before.

**B — on a fresh instance: clean.** `chain up --root <B>` from nothing is `CHAIN_GREEN`;
`snapshot --check expected/b.snapshot.txt` → `SNAPSHOT_EQUAL`; `rows` holds the seeded row and no row of `os.parts`.

**C — on a second fresh instance, in order: upgraded.**
1. `chain up --root <A>`; the check against 6a's fixture text is `SNAPSHOT_EQUAL`; the rows are given;
   `rows` is `expected/a.rows.txt`, byte for byte — read twice, and once through a connection whose own settings
   are hostile (6a §6 B.2's), the same bytes.
2. **An applied file edited:** `chain up --root <edited>` is `CHAIN_RED` and names `0003-inside.sql` as changed;
   the snapshot still equals A's text and `rows --kept expected/a.rows.txt` is `ROWS_KEPT`.
3. **A change a populated table refuses:** `chain up --root <refused-when-populated>` is red at `0005`; the
   snapshot still equals A's text — the ledger holds no row for it — and the rows are kept.
4. **Upgraded equals clean:** `chain up --root <B>` is `CHAIN_GREEN`; `snapshot --check expected/b.snapshot.txt`
   → `SNAPSHOT_EQUAL` — the text the clean instance reached; `rows` is `expected/b.rows.txt`, byte for byte;
   `rows --kept expected/a.rows.txt` → `ROWS_KEPT`, its counts those of `a.rows.txt`.
5. **A change that loses, and one that depends on the rows:** `chain up --root <C>` is `CHAIN_GREEN`. The check
   against `b.snapshot.txt` is red by exactly two lines of the database's — `0006`'s ledger line, which a clean
   build has too, and the index, which a clean build has not: an upgraded database that differs from a clean one,
   seen. `rows --kept expected/b.rows.txt` is `ROWS_RED`, and its printed difference is asserted whole: the two
   lost rows, the row one of them became, the sequence's two lines.

The ordered module stops at its first red step; before the code exists every bench case is red at its first
`rows` call or at B, and the test hand shows each later case red for its own reason by neutralising the earlier
ones in the working tree and restoring them — as 6a's did.

## 6a. What the tests pinned beyond §6 (the test hand's readings, read and accepted by the lead)

108 cases of this piece: 71 without the bench, 24 of `chainAt` on a throwaway repository, 5 steps on a fresh
instance (clean) and 8 on a second (upgraded). The lead read the fixtures, the three expected texts and both bench
modules, and saw the files red before the code (`evidence/lead-run-on-the-tests.log`).

1. **Equal JSON values** — decided by the lead when the test hand asked: the same text as the server printed it.
   A column retyped to another scale changes every value's text and loses its rows (§9's rule for a change that
   means it). A nested object that gains a key is a changed value: only a row's own keys may be added.
2. `lost` and `back` are sorted by the line after its sign, as §5 says — so a `+` stands before its `-` when the
   new line sorts lower (C.5's sequence: `+ … 100 called f` then `- … 110 called t`).
3. `ROWS_KEPT rows=<n> sequences=<m>` counts `row` and `sequence-position` lines of the file; the first line is
   not counted. A rows' text that holds a line twice, and the first line alone, are well formed.
4. Words: `rows --kept --kept` answers `rows`' usage line; `--kept a` without a call piece 3's; `snapshot --kept a`
   the snapshot's.
5. **A versioned change that writes rows of a table whose row security is forced lifts the force for its own
   statements and puts it back in the same file** (`no force row level security` … `force row level security`):
   as the owner, whom no policy names, an `update` would otherwise meet no row. B's `0005` and C's `0006` do so;
   the snapshot is the same after. Carried to stage 1's first change to a populated table.
6. A changed signature is `drop function if exists` in the schema file: on a clean build the old signature never
   stood, because the functions pass runs after the schema files.
7. `chainAt` is synchronous. Every file counts, a `.gitkeep`, an empty file and a nested one too; `main:db` (a
   tree), a revision that does not exist and any that begins with `-` are `unknown-revision`; an `into` holding
   only an empty directory is `into-not-empty`; a link outside the three directories is no refusal.
8. **Beyond §6 B:** the clean module also runs C on the clean B — green, and red by `0006`'s ledger line alone —
   so "C's index is absent from a clean build" is run, not read. C.4 checks `--kept` against the text C.1
   printed and kept aside in a temporary file, as §7's proof does. C.1 shows the hostile session biting.
9. A case pins the whole difference between `b.snapshot.txt` and 6a's fixture text (7 lines out, 25 in): a lock
   commit that changes `fixture.snapshot.txt` changes `b.snapshot.txt` and that case with it. C.3 pins
   PostgreSQL 17.6's own message for the refused column.

## 7. Where the real chain's upgrade is proven from **[lead]** — an adaptation of BUILD.md §6

BUILD.md says "an instance built at the previous committed revision". Read as "the commit before", that proof is
red today by an act that was right (fact 1), and would be red again whenever an audit corrects a file its own
piece has just written. Read as nothing at all, an applied file could be edited for ever. So:

- **One committed revision is where upgrades are owed from:** `foundation/tests/upgrade/real/from.txt` — a full
  commit id and a newline, inside piece 6's locked directories. It begins at
  `46115fd119f23b07baef3d462e448c0cdba76f0e`, the last commit that changed an applied file of the real chain.
- **The real chain's proof**, which the bench command (13) runs on every run and the lead runs by hand until then:
  `chainAt(<repository>, <from>, <dir>)`; a fresh instance; `chain up --root <dir>`; the rows of
  `foundation/tests/upgrade/real/rows.sql`, when that file stands; `rows` kept aside; `chain up`; `snapshot --check`
  on the real text → `SNAPSHOT_EQUAL`; `rows --kept` → `ROWS_KEPT`. Today the two chains are the same files and
  no table stands to hold a row: the proof is thin, as BUILD.md said it would be, and it is standing.
- **From here on an applied schema file of the real chain is not edited** — a correction is a new file — unless
  the lead moves `from.txt` forward in a lock commit that holds nothing else, and says why in that piece's
  record. No such move is made after a database that is not disposable holds the chain (stage 5 writes that rule
  where the delivery is decided).
- **The piece that first gives the real chain a table** writes `real/rows.sql` in the same lock commit as its
  expected text (6a §7), so that from then on the real upgrade carries rows.
- The proof needs the repository's history; the lock's clean copy has none (fact 4). It is therefore the bench
  command's and never a locked test; what the lock holds is every part it is made of, on fixtures.

**The lock.** The tests and the three expected texts go in with piece 6's lock made again over both directories —
`pnpm foundation:lock piece-6 foundation/tests/snapshot foundation/tests/upgrade` — in a commit that holds nothing
else. No new lock name, no new `foundation:*` script, no change to the lock tool.

## 8. Done when

The tests are committed with the lock alone and seen red for the right reason; the code is committed apart;
`pnpm -s foundation:typecheck` is 0; `foundation/tests/upgrade` is green and the suites of pieces 3–6a are green,
untouched; `pnpm foundation:verify --all --rev HEAD` says `LOCK_GREEN` for pieces 1–6; the lead has run §7's proof
on the real chain from `from.txt` and kept its output; one blind audit pass by GPT-6.2 Sol is weighed and its
corrections taken tests-first; BUILD.md's piece 6 carries the Done note of 6b and names 6c.

## 9. Known limits, said before the build

- **The rows' text is the bench's instrument:** it holds every row in memory and prints it. The company's move
  (stage 5) and the restore drill (B72) prove their rows by their own means.
- **A change that means to alter what rows hold** — a column dropped or retyped, values rewritten, a table
  renamed — is `ROWS_RED` here by design. The piece that makes one commits the difference it expects, and the
  bench compares what the command prints with it; no option for that is built before a piece needs it.
- A table emptied and a table dropped read the same in `lost`; the snapshot tells them apart.
- A row is a JSON value (6a §9): array bounds, `-0` and a `json` column's duplicate keys are not told apart — nor a
  `json` column's stored spelling, nor a retype under which every value prints the same (§10.2). A `json` value
  holding `\u0000` fails the reading. `money` prints by `lc_monetary`, which is not set.
- A sequence that cycles may stand behind by right; a large object is not read; rows of a table outside the
  covered schemas are not read, whoever owns it.
- **That *refused-when-populated* is green on an empty database is PostgreSQL's own rule read from the file's
  text, not run** — it would cost an instance. (That C's index is absent from a clean build is run — §6a.8.)
- The real chain's upgrade is not under the lock (§7) and, until piece 13, is run by hand.
- What a build changes outside the snapshot's reach was unseen here (6a §9's first limit) — 6c's proof, standing since 2026-11-24 (`piece-6c/SPEC.md`). Measured for it
  already: a fresh instance of 2026-11-23 holds the platform's partitions `realtime.messages_2026_11_22` …
  `_26`, so two whole-catalogue readings are compared on one instance, moments apart, never across instances
  made on different days.

## 10. The blind audit and its corrections (GPT-6.2 Sol, xhigh, one pass, 2026-11-23 — `SOL.md`; the lead's weighing)

The verdict was REFUTED: four A, eight B. It found the proof itself sound — C.4 reaches, by the delivery command,
the text a clean build reached on an instance of its own, and the three expected texts say what the fixture's
files say — and the instrument around it wanting. Each finding is weighed against what the piece is for: a row
lost, a value changed or a sequence put back must not pass as kept by an ordinary change, build or mistake; the
same bytes for the same rows; a reader that writes nothing; `chainAt` gives the bytes the commit holds.

### 10.1 Taken — tests first, then the code

| # | From | The rule the piece now obeys |
|---|---|---|
| 1 | A2 | **A sequence whose direction changed is `back`**, whatever its `last_value`: after `100, 105, 110` an increment of `-5` gives `105` again, and both texts read `110 called t`. Both directions, and the case where nothing but `ascending` differs. |
| 2 | A3 | Every call of git by `chainAt` says `--no-replace-objects`: a replace ref for a commit or for a blob changes nothing of what is written. |
| 3 | A4 | A path under the three directories whose name is not UTF-8 is `not-a-file`, before the first byte is written — a chain's file is named in ASCII (piece 3), and a name read as UTF-8 would be another name. |
| 4 | B4 | A revision that holds a `:` is `unknown-revision` and is never handed to git: `:path` reads the index, `rev:path` a tree, `:/text` searches. |
| 5 | B5 | An `into` that is a symbolic link is `into-not-empty`, wherever it points. git is told not to fetch a missing object (`GIT_NO_LAZY_FETCH=1`). |
| 6 | B3 | **Under a row's own key a value is compared as its text stands** — the code re-spelled nested objects and string escapes, which §5 did not say: a nested object's keys in another order, white space, or `\u00e9` for `é` is another text. A `before` file is refused as malformed when a `sequence-position`'s value is not an integer in its one spelling (`000110`, `-0`), or when a part of a name that stands unquoted is not `[a-z_][a-z0-9_]*` — what `regclass` leaves unquoted. |
| 7 | B1 | Which table is the ledger is read from the catalogue's own rows, never by `to_regclass`: a session without USAGE on `os_chain` is not refused for a table it is not asked to read. (The snapshot's own `ledger` lines are 6a's and are read as before.) |
| 8 | B2 | No list is spread into a call's arguments: a table of 150,000 rows is read, and 150,000 lost rows are printed (measured by the audit: the spread overflows the stack between 100,000 and 150,000). |
| 9 | B6 | After C.2 and after C.3 the rows' text is `a.rows.txt` byte for byte — `ROWS_KEPT` alone would pass a row added or a sequence drawn. The refused variant writes a row and draws from `os.ticket_seq` before the statement the server refuses, so that "nothing left" is seen: the row is gone; **the sequence stays drawn** (PostgreSQL's rule, pinned in piece 3) and the case says so by its exact line. |
| 10 | B7 | Cases: on the upgraded instance, after C.5, tables made by the superuser in `os` — a partitioned table with two partitions, a child that inherits, an unlogged table, a table with no column holding two rows, a table and a column whose names need quotes — each row is one line, once, written down by hand; `rowsOf` through a login that row security would filter throws and gives no text; the stdout of `ROWS_KEPT` and of `ROWS_RED` byte for byte, final newline and all. |

### 10.2 Not taken — each with its reason, and named in §9 where it is a limit

- **A1** — two things. *A column retyped whose values print the same* (`integer 123` to `numeric 123`): the value is
  kept, and the snapshot holds the type; §5 promised more than it meant and now says "retyped so that a value's
  text changes". *A `json` column rewritten in another spelling* (`payload::jsonb::json`: key order, white space,
  a number's spelling): the JSON value is the same and `to_jsonb` reads both the same. The plan's convention is
  `jsonb` (PLAN.md §2 A), whose text is one spelling; the stage's chain holds no `json` column. **The piece whose
  file first makes a `json` column decides its reading in its own contract, before its tests.** Limit.
- **B2, the rest** — a `json` value holding `\u0000` stops `to_jsonb` with an error: a failure, not a short text. Limit.
- **`money`** (the audit's UNVERIFIED) — its text hangs on `lc_monetary`, which the reader does not set; the plan's
  money is `numeric`. Limit.
- **B5, the rest** — a write that fails half-way (a full disk) leaves what was written: the call throws, `into` is
  a temporary directory of the caller's, and a thrown failure is no chain to build from. Not taken.
- **B7, the rest** — the guard's refusal through the command (`ROWS_REFUSED target-…`) has no case of its own: it is
  the snapshot's own path, one function, and its refusals are piece 1's cases. The neutralised runs that showed
  each later step red for its own reason are in the test hands' reports, not in a kept log; the lead's log shows
  the first red of each module. Named.
- **B8** — true of what nothing here forces yet, and carried to piece 13 by name: the proof runs on the candidate
  commit and reads `from.txt` from it; it checks that `from` is an ancestor of the candidate; it gives
  `real/rows.sql` when it stands and checks that rows were given; it stops at the first step that fails; a moved
  `from.txt` is accepted only with the upgrade from the *old* `from` shown red or the reason recorded; after the
  first database that is not disposable, no move. The lead's interim script (`evidence/real-upgrade-from.sh`)
  reads `from.txt` from `HEAD` and stops at the first failure from here on.
- **Sequence positions are not read in the transaction's snapshot** (the audit's remark): the proofs run when
  nothing writes, as 6a §9 says of the catalogue's functions.

### 10.3 What the corrections' cases pinned (read and accepted by the lead)

The cases were written by a hand that wrote neither the first cases nor the code, and seen red each for its own
reason before the code changed (`evidence/lead-run-on-the-corrections-tests.log`; the neutralised runs are in that
hand's report).

1. **C.3's refused file** inserts its row with `overriding system value`, so that one sequence is drawn and named,
   and lifts the force of row security for the insert as B's `0005` does. After it the rows' text is `a.rows.txt`
   but for `os.ticket_seq`, which reads `115 called t`: the row is gone, the draw is not.
2. **C.4 reads `b.rows.txt` but for that one line**, written in the case — nothing is put back by hand between the
   refused upgrade and the one under proof, so C.4 reads what the delivery path left; a `setval` would hide a B
   that moved the sequence. `b.rows.txt` is unchanged; C.5 compares with the file and its difference is as before.
3. **A login reads the rows' text** (rows 7 and 10): `os_reader` over TCP, given SELECT on every table and sequence
   of `os` by the superuser. With row security standing on `os.parts` its reading is refused with the server's own
   words; with it lifted, and still no USAGE on `os_chain`, it reads the same text the installer reads.
4. Of the revisions holding a `:`, those that name a blob or a tree were refused already (they are no commit); the
   ones that today resolve to a commit are an index gitlink, a gitlink under a tree, and `:/<text>`.
5. A reserved word standing unquoted in a `before` file's name (`os.select`) is accepted: the rule is the letters,
   not the server's list of words. Not pinned.
6. `GIT_NO_LAZY_FETCH` has no case: only a promisor clone could show it.
7. A table of 150,000 rows is read whole on the bench (the module stays under its four minutes), and 150,000 lost
   rows are printed.

