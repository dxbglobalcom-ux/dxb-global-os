# Blind audit — B85 stage 0, piece 4 (functions pass, reference pass)

**Verdict.** The code does what the contract says on every ordinary path I could read, and it is faithful to SPEC §4–§9a. Two gaps sit in the contract itself and break the piece's sentence on routes an ordinary mistake takes: **2 A, 9 B, 1 C group.**

**What I could not do.** This copy is not a git repository, so `git show --stat` of the four commits was impossible. `evidence/` holds only `measure.sh`, `measure.out` and `lead-run-on-the-stub.log`; the run against the code and the lock's verdict are not here. Nothing was run. PostgreSQL behaviour I assert without a measurement in `measure.out` is marked *unmeasured*.

## 0. Conditions and risks, written before the code

For "green means every function is its file's, none stands without a file, every filed vocabulary equals it, nothing else touched" to hold on a clean and on an upgraded database:

1. The per-file check must prove the body in force came from this file, not merely that something touched the row.
2. The manifest must read every `pg_proc` row in `os`, inside the same transaction, after the last file.
3. A file must meet the same session on a clean build and on an upgrade, whatever files ran before it.
4. Each pass is one transaction on every exit, including a refusal at commit.
5. "Equal" must mean the same stored value a clean build would write, or clean and upgraded diverge quietly.
6. The proof must see every row; a filter between the runner and the table makes it blind.
7. No write may reach a table without a file, by cascade, trigger, inheritance or a misplaced file.
8. Every name from disk to SQL is pattern-checked and quoted; catalogue reads do not depend on the search path.
9. The guard, the identity pin, the lock and "no ledger row" hold for the new sessions.
10. Each of these needs a test that goes red.

## 1. A findings

### A1 — A stale body stays in force after a green run
- **Claim:** after a green run every function in `os` carries its file's body.
- **Verdict:** REFUTED.
- **Finding:** `functions-pass.ts:34-41` accepts a file when exactly one row of its name is new or *moved*. A grant, a revoke or an `alter function` moves the row without touching the body. SPEC §4 invites every file to carry its own revoke and grants, so in the standard file form the check no longer proves a replace.
- **Scenario:** `os.halve(integer)` stands. `halve.sql` becomes:
  ```sql
  create or replace function halve(n integer) returns integer language sql as $f$ select n / 3 $f$;
  revoke all on function os.halve(integer) from public;
  ```
  The unqualified create lands in `public`; the revoke moves `os.halve`'s row. The run ends `applied`, `os.halve(10)` still answers 5, and a stray `public.halve` stands in the old system's schema. The same happens with a file that holds only the revoke, or a `do` block that creates "if not exists" and then grants.
- **Impact:** the carry list's dropped defect returns: what a schema file did to a body outlives the run. Piece 6's clean-equals-upgraded proof agrees with itself on the stale body in the wrong-schema case. SPEC §10's "the manifest is names and bodies" is not true: no body is compared anywhere.
- **Evidence:** `measure.out` case e shows a grant alone moving `a()`'s row. The only "makes nothing" test is a comment-only file (`functions-failing.ts:51`). That a *repeated* grant also moves the row is unmeasured.
- **Correction required:**
  1. Read `pg_proc` in all schemas per file and fail on any row new or moved outside `os`; this closes the wrong-schema route.
  2. Prove replacement, not movement. Two candidates, both unmeasured: `create or replace` rewrites the function's `pg_depend` rows, or a marker set in `proconfig` before the file is erased by it.
  3. Add a locked case: a file that only revokes on its standing function is `pass-failed`.
  4. Correct §10's sentence.

### A2 — A removal cascades into a table that has no file
- **Claim:** a table of `os` with no file is not touched (SPEC §5).
- **Verdict:** REFUTED.
- **Finding:** `reference-pass.ts:117-121` deletes rows; `REFERENCES` (`:58-64`) reads only references among `os` tables and never the delete action. Only NO ACTION was measured and tested.
- **Scenario:** take the test's own `JOBS_LOG_TABLE` and add `on delete cascade` (or `set null`). Drop `job.failed` from `event_types.json`. The run ends `applied`; the referencing row is deleted or rewritten. If that table is his policy (a routing rule naming an event type), his rows go quietly.
- **Impact:** this is the damage he named, on a route that needs only a common schema choice and an ordinary delivery. No such table exists today; it is A because the contract's own sentence is unenforced.
- **Correction required:** before any write, read every foreign key onto a vocabulary from a table without a file, in any schema. Fail the pass when its delete or update action is cascade, set null or set default. Add a locked case.

## 2. B findings

### B1 — One function file's session reaches the next
- **Verdict:** REFUTED (condition 3).
- **Finding:** `functions-pass.ts:60-66` runs all files in one session and one transaction. A file's `set role`, `set search_path`, `set local` and temp tables meet every later file. Piece 3 gave each schema file its own session for exactly this reason.
- **Scenario:** give the locked session case (`passes-in-one-run.ts:104`) a second file. `twice.sql` then runs as `pg_monitor` and fails, blamed on the wrong file. Quieter: `a.sql` ends in `set role os_owner`; later files create as that role; delete `a.sql` and new functions are owned by the installer.
- **Correction required:** after each file `reset role` and `reset all` (measure first), or refuse a file that leaves its session changed. Add a two-file locked case.

### B2 — "Equal" is the type's equality, not the file's value
- **Verdict:** REFUTED for "clean equals upgraded".
- **Finding:** `reference-pass.ts:110` (`is distinct from`) and `:130-131` (`except`) use the column type's `=`.
- **Scenario:** `ratio` stands as `1.1`; the file changes to `1.10`. The row is not written and the proof passes, so the upgraded table reads `1.1` and a clean one `1.10`. The same holds for jsonb `1` against `1.0`, citext or a nondeterministic collation. The locked test pins scale on insert only.
- **Correction required:** compare by stored image (`*<>` on rows, or text) in both the write condition and the proof, measured first; or name the limit in §10. Record-image comparison would also lift the `json` limit.
- **Also:** the session's `TimeZone` and `DateStyle` are not fixed, so a timestamp without an offset is read differently on two databases, both "equal".

### B3 — Row security can hide a row the file does not hold
- **Verdict:** REFUTED. SPEC §9a's reason for not testing it is wrong.
- **Finding:** the proof (`:124-133`) runs with the same visibility as the delete. A hidden row outside the file is neither removed nor counted, and the run is green.
- **Reach:** not on today's bench, where `postgres` has `BYPASSRLS`. It becomes reachable with forced row security or another installing role at stage 5.
- **Correction required:** `set local row_security = off` at the pass's start, so a filtered query errors instead (unmeasured).

### B4 — A file planted for a policy table
- **Verdict:** today it is the reader's, as SPEC §2 says; I recommend the runner refuses it.
- **Why the reader's:** the runner cannot know a table's kind from nothing.
- **Why the runner should refuse:** the reader has no instrument, and the consequence is asymmetric. `[]` asks only "is a table" (`:46`) and empties it; a mistaken `job_types.json` rewrites his menu on every delivery, green.
- **Correction required:** the pass requires a mark set by the ledgered schema file that made the table, in a form the lead chooses. The mark is on vocabularies, so BUILD §4's "policy needs no kind" holds.

### B5 — A refusal at commit is thrown, not answered
- **Finding:** `one-pass.ts:52-56` turns only `Ended` into an outcome; `asTheFiles` wraps statements, not the commit. Piece 3's `apply` (`run.ts:56-58`) answers the same refusal as `file-failed`.
- **Scenario:** a deferred foreign key from a table outside the files; the file drops a value in use. The proof says equal, the commit fails, and the command prints nothing on stdout and exits 1. It is rolled back whole, so no data is harmed.
- **Correction required:** `set constraints all immediate` before the proof, inside `asTheFiles`.

### B6 — Valid states refused, loudly but with no way through
None is quiet. Fix the first; name the rest in §10.
- **Primary key with `include`:** `:26-31` unnests all of `indkey`, so included columns are read as key columns and `on conflict` fails on every run (unmeasured). Limit the unnest to `indnkeyatts`.
- **A second unique column beside the key:** write-then-remove cannot re-key a row in one delivery.
- **A range type in `os`:** its constructor functions are two orphans of one name, so the manifest is red for good. Functions an extension owns behave the same.
- **A not-null domain column outside the file's columns:** refused by `jsonb_populate_recordset` (unmeasured).
- **A deferrable primary key:** refused by `on conflict`.

### B7 — The lock is asked before a pass, never before its commit
- **Finding:** `run.ts:124`. The passes write no ledger row, so piece 3's `ledger-moved` backstop does not cover them.
- **Scenario:** a run from an old checkout loses its lock session mid-pass; a newer run completes; the old run commits old bodies over the new, and both say green.
- **Correction required:** `assertHeld` as the pass's last act before commit.

### B8 — A column named twice in one object is not seen
- **Finding:** `passes.ts:29`. JavaScript and jsonb both keep the last of `{"weight":1,"weight":2}`, so the file says two things and the run is green.
- **Correction required:** refuse it server-side by reading the text as `json`, which keeps duplicates.

### B9 — Rules no test pins
- A file that moves its own row without replacing it (A1).
- A second function file after one that changed its session (B1).
- Cascade or set null from outside the files (A2).
- An equal-by-type change on the update path (B2).
- A duplicated row in a key-only file: it takes the `do nothing` branch and fails with "does not equal", not the server's message §9 promises.

On the other test questions:
- **Cannot go red for its claim:** "the vocabulary before it by name is not written" — a rollback gives the same zero rows as never writing. "A row of his policy kind" holds no route by which the pass could reach the table.
- **Recomputes its expectation:** none found.
- **Refusal without what stands:** "a view of that name" asserts the ledger only.
- **Fixtures on the instance's own database:** `create database`, `drop database` and catalogue reads only (`throwaway-database.ts:73-95`, `looking.ts:50`).

## 3. C — hardening against a hand that already writes the chain's files

- Operators in `ROUTINES` are not schema-qualified, though `functions-pass.ts:15-17` says every name is. A planted `=` on a search path a function file set would answer. B1's reset closes it.
- A link swapped between the listing and the read: piece 3's "not built".
- `delete from os.t` without `only` reaches inheritance children.
- `evidence/measure.sh` drops a database by name without the guard and spells the local default login.

## 4. Stands after attempted refutation

| Claim | Why |
|---|---|
| `oid` + `ctid` detects every update of a row | no in-place update of `pg_proc`; a `ctid` cannot return within the transaction |
| No orphan, no second signature after green | manifest reads every row in `os` in-transaction; names compared exactly; 63 pinned |
| Commit and savepoint in a file | refused by the server in the act; tested for commit |
| Rolled back whole on file refusal, check failure, manifest, lost connection | `one-pass.ts`, `session.ts:84-93` |
| Text executed is the file's bytes | fatal UTF-8 decode, byte-order mark kept, sent as a parameter |
| SQL built from names | all pattern-checked, quoted, parameters for values |
| Order among vocabularies | from the catalogue, independent of names; circle refused before any write |
| An equal row is not rewritten | `xmin` holds; the row lock touches `xmax` only (unmeasured) |
| Disk table of §4; JSON read alike by both parsers | `__proto__`, byte-order mark and deep nesting are `malformed`; a lone surrogate escape fails at the server, loud |
| Piece 3's guarantees | guard and pin on every pass session; no ledger write; a root with neither directory is unchanged |
| The command | every outcome answered per §8 |
| Nothing under `db/`; no company address or key under `foundation/` | glob and grep |

**Named limit, for piece 5.** Git cannot deliver an empty directory and `.gitkeep` is an `unknown-entry`. So deleting the last function file removes `functions/` from every checkout and the orphan check goes silent — §10's limit, reached by an ordinary commit.

## 5. Unverified

- The four commits' contents: tests and lock alone in `45833589`, the code hand not touching the tests, no old file changed.
- The green run against the code and `LOCK_GREEN` for pieces 1–4.

## A and B in one place

- **A1** — a row moved by a grant passes as replaced: stale body, green.
- **A2** — cascade or set null from a vocabulary writes a table with no file.
- **B1** — a function file's session reaches the files after it.
- **B2** — equality by type: clean and upgraded differ; time zone unpinned.
- **B3** — row security hides an unfiled row from delete and proof.
- **B4** — a planted file for a policy table is not refused; `[]` empties any table.
- **B5** — a commit-time refusal is thrown, not `pass-failed`.
- **B6** — valid tables and types refused for good: `include` key, second unique column, range type, domain column, deferrable key.
- **B7** — the lock is not asked before a pass commits.
- **B8** — a duplicate key in one object is unseen.
- **B9** — the five unpinned rules.
