# B85 · stage 0 · piece 4 — the chain's functions pass and reference pass: the contract

Cut from `../BUILD.md` §6 piece 4 and PLAN.md §2 A ("Chain", "Reference data is two kinds"). This file is the contract
the tests are written from and the code is written to; it stands on piece 3's (`../piece-3/SPEC.md`), which holds
wherever this file does not speak. The lead wrote it (2026-11-23); what it decides beyond BUILD.md is marked
**[lead]** with its reason.

## 1. What the piece leaves standing

1. In `foundation/chain`: after the schema files, every run re-applies the files of `<root>/functions` and makes the
   vocabularies of `<root>/reference` equal their files. One new export, `readPasses`; three new offence kinds; two
   new outcomes; two optional counts on `applied`.
2. Its tests in `foundation/tests/passes/`, locked as `piece-4`. They may import piece 3's fixtures
   (`foundation/tests/chain/fixtures/`) and edit none of them.

Old files touched: none. `foundation/tsconfig.json`, `foundation/tests/package.json`, the lockfile, the
`foundation:*` scripts and the vitest configuration are **not** changed (each would turn every lock red). **No file
is written under `db/`** — the chain's first files are piece 5's.

**Piece 3's locked tests stay green unchanged**: on a root that holds neither `functions/` nor `reference/` the
run, its outcome and the command's lines are exactly piece 3's.

Not in this piece: roles, grants and the schema `os` on the real target (piece 5); the snapshot and the proofs that
a clean build equals an upgraded one (piece 6); any real function or vocabulary (piece 8 has the first).

## 2. The carry list — the old system read once (a helper's measurement, 2026-11-23)

| The old contract | Verdict |
|---|---|
| Functions live in the migrations: 116 functions, 31 of them written in more than one file (up to four) | **Rewritten** — §4: one file per function, re-applied on every run; the file is the body's one place |
| `fn_hr_create_employee`'s last text is in no file: a migration reads the live definition, replaces a word in it and executes the result | **Dropped as a defect** — §6: the pass replaces every function from its file after the schema files, so whatever a schema file did to a body does not outlive the run |
| Three signatures changed so far, each with the old one dropped in the same migration; no stale overload stands | **Kept as the rule** — §6: a changed signature arrives as a schema file that drops the old one; a second signature beside the first is refused |
| 31 trigger functions, each made in the same migration as its first trigger and before it; two column defaults, five functions under views and one parameter default need a function when they are made | **Kept, said** — §4: a schema file that needs a function to stand makes it itself, in its first form; from then on its file in `functions/` holds the body |
| 156 grant/revoke lines on functions; 45 of 116 executable by `anon`; 30 with no `search_path`; no test pins either as a whole | **Not this piece's** — the roles and default privileges are piece 5's, the effective grants and settings piece 6's snapshot. Here: a function file may carry the revoke and grants of its own function (§3 measured that they move only its own row) |
| Code-owned vocabularies filled by many migrations (`settings_registry` by 11, `model_catalog` by 4 with 22 updates in 5 files); a handler allow-list embedded in a function's body, pinned to a code constant by a test | **Rewritten** — §5: a vocabulary is a table with one file; the pass makes it equal the file on every run. That the code's constants equal the file is the test of the piece that brings the vocabulary (stage 1) |
| His policy overwritten by migrations (`routing_rules` updated 19 times; `hook.enabled` forced to `true`) | **Dropped as a defect** — the reference pass touches a table only when a file names it, and policy tables have none; a new default is a versioned change that says what it changes (PLAN.md §2 A). The discipline of what such a change may say is the reader's of that file, not the runner's |
| 75 `= ANY (ARRAY…)` CHECK vocabularies; 16 migrations drop and re-make one | **Kept** — a CHECKed vocabulary is schema: a versioned change |
| The old runner treats neither functions nor reference data apart | Nothing to carry |

## 3. Measured facts (the lead's run on the foundation's bench, PostgreSQL 17.6, 2026-11-23) — not to be re-litigated

Evidence: `evidence/measure.sh`, `evidence/measure.out`.

- **`create or replace function` through piece 3's wrapper** (the text as a setting, run by plpgsql `execute`) keeps
  the function's `oid` and gives its `pg_proc` row a new `ctid` — also when the text is the same as before, and
  each time when it is replaced twice in one transaction. A new function is a new `oid`.
- **A file that revokes, grants and comments on its own function moves only its own row.** A grant on another
  function moves that function's row too. A `drop function` removes the row.
- **Changed argument types make a second row of the same name** beside the first. A changed return type and a
  renamed input parameter are refused by the server (`cannot change return type of existing function`, `cannot
  change name of input parameter`).
- **A procedure and an aggregate are rows of `pg_proc`** like a function (`prokind` `p`, `a`).
- **Inside one transaction**, the rows of `pg_proc` in a schema read before a file and after it tell exactly which
  functions the file made or changed (by `oid` and `ctid`) and which it removed.
- **What needs a function to stand when it is made:** a trigger, a policy and a column default each fail with
  `function … does not exist`. A plpgsql body that calls a function not yet standing is accepted; an SQL function
  with a string body that does is refused. `create or replace` over a function a trigger uses keeps the trigger
  and the next row meets the new body; `drop function` is refused while the trigger stands.
- **A vocabulary made equal to rows that arrive as one `jsonb` value** — `insert … select … from
  jsonb_populate_recordset(null::<table>, $1) on conflict (<key>) do update set … where (<the table's values>) is
  distinct from (<the file's>)`, then `delete … where not exists (<the file's row of that key>)`: the first run
  writes the rows; **the same again writes none**; a column the file does not name keeps what a process wrote
  there, and a new row takes its defaults; a JSON `null` arrives as SQL null; the difference by `except` in both
  directions is 0.
- **A key of the file that is no column of the table is ignored in silence** by `jsonb_populate_recordset`. A value
  of the wrong type, a null for a not-null column and a key twice in one file (`ON CONFLICT DO UPDATE command
  cannot affect row a second time`) are each refused by the server. A column of type `json` cannot be compared
  (`could not identify an equality operator for type json`).
- **References between vocabularies (NO ACTION):** removing a value in use is refused (`… is still referenced from
  table …`); a referencing row written before the row it names stands is refused when they are two statements.
  The catalogue gives the references among a set of tables (`pg_constraint`, `contype = 'f'`) and a table's primary
  key columns in order (`pg_index.indisprimary`, `indkey`).

## 4. The passes on the disk

Beside `schema/` a root may hold `functions/` and `reference/`. **A pass runs when its directory stands** **[lead]**
— piece 3's fixtures and its locked tests have neither, and the real root gets both in piece 5. What else lies in
the root is not read.

- **`functions/` is closed.** Every entry must be a regular file whose name matches `^[a-z][a-z0-9_]{0,62}\.sql$`.
  The name without `.sql` is the **function's name**: the file makes or replaces the one function `os.<name>` —
  and may carry the revoke, the grants and the comment of that function. Files are applied by name, by code unit.
- **`reference/` is closed.** Every entry must be a regular file whose name matches `^[a-z][a-z0-9_]{0,62}\.json$`.
  The name without `.json` is the **vocabulary's table**, `os.<name>`. Its text is a JSON array of objects — the
  rows; **every object carries the same keys**, at least one, each matching `^[a-z][a-z0-9_]{0,62}$` — the columns
  the file owns. An empty array is a vocabulary with no value. **[lead]** Rows as objects, because that is the form
  the server takes whole (§3): the file's text travels to the server as it is and the server reads the values —
  the runner parses the text only to judge its shape, so no number passes through JavaScript.
- **The schema `os`** is a constant of the package (BUILD.md §4).

**What a schema file and a function file owe each other** **[lead]** (§2, §3): the functions pass runs after the
schema files, and a trigger, a policy, a default or a view needs its function when it is made. So a schema file
that needs a function makes it itself, in the form it has that day, and the function has a file in `functions/`
from the same commit — the pass replaces the body after every run, and the manifest holds because the function has
a file. A removal, and a change of argument types, of return type or of a parameter's name, is a schema file that
drops the old function (and what hangs on it) — the file in `functions/` then carries the new one, or is gone.

**The disk's offences of the two directories** — found from the directories alone, before any connection, and said
together with `schema/`'s in the one `offences` outcome:

| Kind | Detail | When |
|---|---|---|
| `unknown-entry` | `functions` · `reference` | the entry of that name in the root is not a directory — a file, a link |
| `unknown-entry` | `functions/<name>` · `reference/<name>` | an entry that is not a regular file of the directory's name pattern |
| `empty` | `functions/<name>` | a file of no bytes, or of white space only |
| `unreadable` | `functions/<name>` · `reference/<name>` | a file that cannot be read, or is not valid UTF-8 |
| `malformed` | `reference/<name>` | a readable file whose text is not what `reference/` asks: not JSON, not an array, an element that is not an object, an object of no keys, a key off the pattern, two objects of different keys |

`malformed` is a new kind, ordered after `reordered`. An empty `reference` file is `malformed`.

## 5. The reference pass — what "equal its file" means

For a file `<table>.json` whose rows carry the columns C:

- `os.<table>` is an ordinary table; every column of C is a column of it; it has a primary key, and C holds every
  column of that key.
- After the pass **the table's rows, read in the columns C, are exactly the file's rows** — as many, and the same.
  A row whose key the file does not hold is removed. A row the file holds is written when it is not there and
  changed in C's columns when it differs; **a row already equal is not rewritten**. Columns outside C are the
  table's own: a new row takes their defaults, a standing row keeps what stands there (piece 8's liveness row is
  such a table).
- An empty array: the table is emptied.
- **Order among the vocabularies** **[lead]**: rows are written table by table so that a table is written after
  every table it references, and removed in the opposite order; ties go by name; a reference of a table to itself
  orders nothing. The references are read from the catalogue, among the tables that have a file. Tables that
  reference each other in a circle cannot be ordered: the pass fails.
- **The proof is inside the transaction:** after the writing and the removing, each table is compared with its file
  by the server, in both directions and by count. A table that does not equal its file — a trigger rewrote a
  value, row security hid a row — fails the pass.
- A table of `os` that has no file is not touched: his policy data is seeded by a schema file and is his from then
  on.

## 6. The run — piece 3's §6 and §12, with these steps

Step 1 (the disk, before any connection) and the reading under the lock also read the two directories; their
offences end the run as the schema's do, in the same `offences` outcome, nothing written.

After the last pending schema file is applied (piece 3's steps 6–7; a `file-failed` ends the run before any pass):

8. **The functions pass**, when `functions/` stands. One session of its own (the guard and the identity pin as for
   every session; `assertHeld` before it), one transaction:
   - for each file, by name: the rows of `pg_proc` in `os` are read; the file's text is executed as a schema
     file's is (handed over as data, run by plpgsql `execute` — a text that opens or closes a transaction is refused
     by the server in the act); the rows are read again. **Exactly one row is new or moved, it carries the file's
     name, and no row is gone** — else the pass fails at that file with the message
     `the file did not make or replace exactly os.<name>: made or changed [<names>], removed [<names>]` (each list
     the function names, ascending, joined by `, `; `[]` when empty; a name once though two rows of it moved).
   - after the last file — **the manifest**: every row of `pg_proc` in `os`, of any kind, must carry the name of a
     file, or it is an `orphan` (detail `<name>(<identity arguments>)`, as `pg_get_function_identity_arguments`
     writes them); a name that more than one row carries is a `second-signature` (detail `<name>`). Any offence →
     the transaction is rolled back and the outcome is `manifest`.
   - the server refuses a file → rolled back, the outcome is `pass-failed`.
   - **A pass that fails leaves nothing of itself**: no body replaced, none made. With no file and no schema `os`
     the pass ends green with 0.
9. **The reference pass**, when `reference/` stands. One session of its own, one transaction, as §5. A file whose
   table fails §5's first sentence, a circle, a statement the server refuses, a table not equal to its file → rolled
   back, `pass-failed` with the file it failed at and one of these messages, or the server's own:
   `os.<table> is not a table` · `os.<table> has no column <column>` (the first by name) · `os.<table> has no
   primary key` · `the file does not carry the key column <column> of os.<table>` (the first in the key's order) ·
   `the vocabularies reference each other in a circle: <tables, ascending, joined by ", ">` (said of the first of
   them by name) · `os.<table> does not equal its file after the pass`.
10. `applied`, with the count of files of each pass that ran.

**The passes write no ledger row** **[lead]**. PLAN.md re-applies them on every run — the files are the truth each
time, there is nothing to remember — and what must be remembered (a removal, a changed signature, a seed of his
policy) arrives as a schema file, which is ledgered. So the ledger's `kind` stays `ledger` and `schema`, row 0's
hash stays, and no standing ledger becomes unknown. `RUNNER_VERSION` stays `"1"`.

What the schema files of a run committed stays when a pass fails (each is its own transaction, piece 3): the
database then stands on the new schema with the old functions until the pass is corrected and run again.

## 7. What the library exports — added to piece 3's §7

```ts
export type OffenceKind = /* piece 3's ten */ | "malformed" | "orphan" | "second-signature";
export type PassFile = { name: string; text: string };          // the entry's name, extension included
export type Outcome =
  | { state: "applied"; applied: string[]; standing: number; functions?: number; reference?: number }
  | { state: "offences"; offences: Offence[] }
  | { state: "file-failed"; file: string; message: string; applied: string[] }
  | { state: "pass-failed"; pass: "functions" | "reference"; file: string; message: string; applied: string[] }
  | { state: "manifest"; offences: Offence[]; applied: string[] };
/**
 * Reads `<root>/functions` and `<root>/reference` — each when it stands; its key is absent when it does not.
 * Files by name; the offences of §4. Never throws for a root that holds neither, or does not exist.
 */
export function readPasses(root: string): { functions?: PassFile[]; reference?: PassFile[]; offences: Offence[] };
```

`functions` and `reference` on `applied` are the number of files of that pass, **present only when the pass ran**;
`applied` in the two new outcomes names the schema files this run applied before the pass. Offences are ordered by
kind — piece 3's ten, then `malformed`, `orphan`, `second-signature` — then by detail. `readChain` is unchanged and
still reads `schema/` alone.

## 8. The command — added to piece 3's §8

| Result | Lines on stdout | Exit |
|---|---|---|
| `applied`, a pass ran | `CHAIN_GREEN applied=<n> standing=<n>` then ` functions=<n>` and ` reference=<n>` on the same line, each only when its pass ran, in that order | 0 |
| `pass-failed` | `FAILED <pass>/<file> <the message on one line>`, then `CHAIN_RED <pass>-failed applied=<n>` | 1 |
| `manifest` | one `OFFENCE <kind> <detail>` each, then `CHAIN_RED manifest offences=<n> applied=<n>` | 1 |

The usage line and the options are piece 3's. Progress on stderr says each pass and its count.

## 9. The tests — `foundation/tests/passes/`, written before the code

A test never recomputes its expected value the way the code does: each offence's kind and detail, each of §6's
messages and each function's answer is spelled in the test. A case that asserts a refusal also asserts what stands
afterwards.

1. **`read-passes`** (temporary directories, no database): a root with neither directory → `{ offences: [] }`, no
   `functions` and no `reference` key; a root that does not exist likewise; files come back by name with name and
   text; each row of §4's table, planted and named — `malformed` once for each of its six reasons; an empty array
   is well-formed; offences of both directories are said together and in §7's order; `readChain` on the same root
   still answers the schema alone.
2. **`answer`** (pure): each row of §8's table — `applied` with neither count, with one, with both.
3. **`on-the-bench`** — one test module, the instance prepared once as piece 3's module does it (the host lock
   held, an instance that stands used and left standing), every case in a throwaway database of its own reached
   through a list file of its own; the schema `os` and its tables are made by the fixture chain's schema files.
   Nothing is applied to the instance's own database. The cases:

   *The functions pass*
   - **built from nothing:** a chain whose schema file makes `os`, and two function files → `applied` with
     `functions: 2`; both answer what their files say; no ledger row is written for a pass; a second run answers
     the same and the functions still answer;
   - **a changed body replaced:** a file's body changed → after the run the function answers the new body; the
     ledger's rows are unchanged to the instant;
   - **a second signature:** a file's argument types changed, nothing dropped → `manifest`, one
     `second-signature`; **rolled back whole** — another file whose body was changed for the same run still
     answers its old body, and the old signature alone stands;
   - **a changed signature as a ledgered change:** a new schema file drops the old function, the file carries the
     new arguments → `applied`; the new one answers, the old is gone;
   - **an orphan:** a function file deleted → `manifest`, `orphan` with `<name>(<arguments>)` spelled; rolled back
     whole; the same with the removal brought by a schema file that drops the function → `applied`;
   - **a function a schema file made and no file holds** → `orphan`; a procedure and an aggregate in `os` with no
     file are orphans too;
   - **a failing pass:** the second of three files fails → `pass-failed`, `functions`, that file, the server's
     message; the first file's changed body is not in effect; the schema file this run applied stays ledgered and
     is named in `applied`; the file corrected → the next run is green;
   - **a file that is not its own function's:** one that makes a function of another name; one that makes two;
     one that also grants on another file's function; one that drops another; one that makes nothing (a comment)
     — each `pass-failed` with §6's message spelled, each rolled back whole;
   - **a file that carries its own revoke and grants** is applied, and the grant stands;
   - **a file that commits** → `pass-failed`, a message that says `transaction`, nothing of the pass left;
   - **a trigger's function:** a schema file makes a table, a function in its first form and a trigger; the file
     in `functions/` holds a second form → after the first run a new row meets the second form — on a database
     built from nothing in one run, and on one where the schema file was applied by an earlier run;
   - **the directory decides:** `functions/` standing and empty while `os` holds a function → `orphan`; no
     `functions/` → `applied` with no `functions` key, the function untouched; with no file and no schema `os`
     → `applied`, `functions: 0`.

   *The reference pass*
   - **a vocabulary reconciled:** a table with a column the file does not own; rows standing: one the file
     changes, one it does not hold, one equal; the file adds a fourth → after the run the table equals the file in
     the file's columns; the unowned column of the changed and of the equal row keeps what was written there; the
     new row has its default; `applied` with `reference: 1`;
   - **a row already equal is not rewritten** — seen by the row's `xmin` across a second run;
   - **a row of his policy kind is left as he changed it:** a table a schema file seeded, no file in `reference/`;
     a value changed by hand; the run → the value as he changed it;
   - **an empty array empties the table;**
   - **a failing pass is rolled back whole:** two vocabularies, the second's file carries a value of the wrong
     type → `pass-failed`, `reference`, that file; the first table is as it stood; what the functions pass of the
     same run replaced stays replaced;
   - **a value in use is not removed:** a table outside the files references a value the file no longer holds →
     `pass-failed`, the server's message, the table as it stood;
   - **vocabularies that reference each other:** one file's rows name another's; in one run both gain a row that
     hang together, in another both lose them → `applied` each time, whatever the tables' names' order (both
     orders of names tried); two that reference each other in a circle → §6's message;
   - **each of §6's other messages:** a view of that name; a key of the file that is no column; a table with no
     primary key; a file that leaves out a key column; a trigger that rewrites a value on its way in (`does not
     equal its file`); a key twice in one file (the server's message);
   - **the passes in one run:** schema files, both passes → `applied` with both counts; a failing schema file →
     `file-failed`, and neither pass ran (a function file's changed body is not in effect).

   *The command*
   - `up --root <a root whose functions/ holds an entry off the pattern>` → the `OFFENCE unknown-entry
     functions/<name>` line, `CHAIN_RED offences=1`, exit 1, and the instance's own database as it was found.

Piece 1's, 2's and 3's tests are not edited.

## 10. Known limits, said before the build

- **A pass that fails leaves the run's schema files applied** (§6). What keeps such a chain from being delivered is
  piece 6's clean-install proof, not the runner.
- **While a schema file runs, the functions are whatever stood before the run** — on a database built from nothing
  a function's first form, on an upgraded one its last. A schema file must not rest on a body that lives in
  `functions/`; when it needs one it sets it itself.
- **The manifest is names and bodies.** An owner or a grant that `create or replace` keeps from before is not seen
  here; piece 6's snapshot reads them. The check reads `os` alone: what a function file makes in another schema is
  not seen.
- **A pass whose directory does not stand does not run and checks nothing** — a root that lost `functions/` is
  silent. The real root's directories are made in piece 5 and its snapshot is piece 6's.
- A function file is trusted code like a schema file: it can make a trigger or write a row; the runner checks
  what it does to `pg_proc` in `os`, nothing else.
- An SQL function with a checked body that calls a function sorted after it fails on a database built from
  nothing and passes on one where that function already stood — seen by piece 6's proof, not here.
- A vocabulary cannot own a column of type `json`, an identity-always or a generated column: the server refuses,
  loudly.
- The command's green path on its real target is still first run in piece 5.

## 11. Done when

`pnpm foundation:typecheck` exits 0 · the tests of §9 pass whole, and were red before the code for the right reason ·
`pnpm foundation:verify piece-1` … `piece-4` each end `LOCK_GREEN` on the committed revision · after the runs no
throwaway database is left · `pnpm install --frozen-lockfile` exits 0 with the lockfile unchanged · the old `pnpm
typecheck` still exits 0.

## 9a. What the tests pinned beyond §4–§9 (the test hand's readings, read and accepted by the lead) — and what the lead decided where they pin nothing

133 cases, locked as `piece-4` at `45833589`; against the frame 128 red (67 by `NOT_BUILT`, 61 because no pass
runs) and 5 green (piece 3's behaviour and the harness) — `evidence/lead-run-on-the-stub.log`.

- **An absent key is not there at all** — not `undefined`: `readPasses` and every `applied` are compared strictly.
- **The disk:** a root entry `functions` or `reference` that is a file or a link is the offence and gives no key;
  inside the directories a link is `unknown-entry` also when it carries a file's name, a file this user may not
  read is `unreadable`, a comment-only function file is a file; `readPasses` reads a root that has no `schema/`;
  "by name" is by code unit (`a1.sql` before `a_x.sql`); "the same keys" is the same set in any order, and only a
  row's own keys are judged, not nested ones; `null` and an array as elements are no objects; a reference file of
  white space only is `malformed`. Offences of all three directories are one outcome, said before the target is
  asked who it is.
- **The functions pass:** the server's message is carried as it is given (`division by zero`); a file that makes
  its own function under two signatures fails the per-file check, the name said once; a second signature is said
  also when a schema file made the other one; an orphan and a second signature are said together, the orphan
  first; a functions pass that does not end green ends the run — the reference pass does not run.
- **The reference pass:** `os.<table> is not a table` also when nothing of that name stands; the circle's message
  names the bare tables of the circle only, and its file is the first of them by name; a key of two columns is
  matched on both; values reach the server whole (`9007199254740993`, `1.10`, a JSON `null` over a column's
  default); `reference/` standing with no file is `reference: 0` and touches nothing.
- **Sessions:** each pass's session carries nothing from the last schema file's or the other pass's (role, search
  path, temporary table) — and the checks of the functions pass still read `pg_proc` after a function file changed
  its session's role and search path; each pass's session passes the guard (`TargetRefused` when the list loses
  the identity, a sleep as the margin as in piece 3); a function file changed while a run waits for the lock is
  applied as it stands under the lock.
- **The command** is started by its case only after the library has answered the same root from the disk alone in
  a throwaway database: a runner that did not read the directories would go on and write its ledger into the
  instance's own database. A second call carries a malformed reference file. `answerOf` says a count of 0, and a
  detail or a message on one line.

**Decided by the lead where no test pins it** (the code is written to these; the audit reads them):

- A name that two rows carry and no file holds is two `orphan`s, each with its arguments — `second-signature` is
  said only of a name a file holds.
- An empty array asks only that `os.<table>` is a table: with no column named there is no key to carry.
- A table's faults are said in §6's order — not a table, a key that is no column, no primary key, a key column
  the file leaves out — and every file is judged so, by name, before any row of any table is written.
- "In a circle" is read from the references among the tables that have a file: a table that only leads into a
  circle, or is only led to from one, is not named.
- A file that drops its own function and makes it again fails the per-file check (the row is gone and another
  is new): `create or replace` is the one way a file replaces its function.

**Not tested, said:** `assertHeld` before a pass (piece 3 has no lost-lock case either; read by the lead); the
progress lines on stderr; the command's green, `pass-failed` and `manifest` lines on a real run (they would write
to the instance's own database — `answerOf` covers the lines, piece 5 makes the first real run); "row security
hid a row" (the proof's comparison is the same for a hidden row as for a rewritten one, which is tested).

## 12. After the two blind audits (`SOL.md` — GPT-6.2 Sol, xhigh; `fable-audit.md` — Fable 5.2, high) — the contract as corrected

Sol: seven A, six B. Fable: two A, nine B. They agree on the heart of it, and the code hand had met the first
finding by its own probe before either: **the run could end green while a function kept a body its file never
set, and while a removal reached a table that has no file.** Both are what this piece exists to make impossible,
and the first was the lead's own contract (§6's check proved that a row moved, not that a body was replaced).
**Each finding was weighed against what the piece is for** — after a green run every function in `os` is exactly
its file's, none stands without a file, every vocabulary that has a file reads as its file does, and nothing else
was written — on a database built from nothing and on one upgraded from any earlier state. A finding that touches
that is taken, whatever its grade; one that hardens the runner against a hand that already writes the chain's own
files or holds the operator's machine is not built, with the reason. Where this section and §4–§9a differ, this
section holds. The mechanisms below were measured first (`evidence/measure-corrections.sh`, `.out`).

**Taken — tests first, then code:**

1. **A function file begins with its own function** (Sol A1, Fable A1, the code hand's probe). Its text — after
   white space and `--` comments, nothing else — begins with `create or replace function os.<name>(`, or
   `procedure`, or `aggregate`, in any case and with any white space between the words (none inside
   `os.<name>`). A file that does not is `malformed`, detail `functions/<name>` — on the disk, before any
   connection. So the first statement the server executes of a file sets its function's body, on every run: a
   file that only grants, alters, comments, creates "if it is not there" or names its function without the schema
   never reaches the server. **A comment-only function file is `malformed` from here** (§9a said it was a file);
   a block comment before the statement is not accepted (it nests, and a pattern cannot read that).
2. **The per-file check reads `pg_proc` in every schema** (Fable A1): an unqualified `create` lands in `public`
   (measured). A row outside `os` that a file made, moved or removed fails the file as one inside does; in §6's
   message such a row is said `<schema>.<name>`, a row of `os` bare as before, each list ascending by what is said.
3. **Every function file meets the same session** (Sol A2, B1; Fable B1). After each file's text and before its
   rows are read, the runner says `reset role` and `reset all` (measured: role, search path, client encoding and
   every setting are back, inside the transaction, also after `set local`). So a file's role, path or encoding
   reaches neither the runner's reading nor the next file — whose bytes would otherwise be read in another
   encoding — and the manifest's arguments are said the same whatever a file set.
4. **A removal cannot reach a table that has no file** (Sol A3, Fable A2). Before any write, every foreign key
   onto a vocabulary's table, from any table of any schema, itself included, is read: one whose delete or update
   action is not NO ACTION or RESTRICT fails the pass at that vocabulary's file —
   `the reference <constraint> on <schema>.<table> writes when a row of os.<vocabulary> is removed or changed`
   (the first by constraint name, then by table). Every statement of the pass says `only`: an inheritance child's
   rows are not the vocabulary's.
5. **A table is a vocabulary because the schema says so** (Fable B4) **[lead]**. The pass asks that the table's
   comment begins with the word `vocabulary` — set by the schema file that made the table, so the table's kind is
   decided where the table is born, ledgered and read in that diff — else `os.<table> is not marked as a
   vocabulary`. For an empty array too: `[]` no longer empties whatever table a file is named after. A file
   planted for a table of his policy is refused by the runner, not left to a reader.
6. **Equal means reads the same** (Sol A6, Fable B2). The decision to write a row and the proof compare each
   column's text, not the type's equality: `1.1` standing against a file's `1.10` is written; a key that the
   type calls equal and that reads otherwise (`Alpha`, `alpha`) is not rewritten and fails the proof. A column of
   type `json` can be owned now. The pass's transaction says `timezone = 'UTC'` and `datestyle = 'ISO, YMD'`, so a
   time the file writes without an offset is the same instant on every database.
7. **Rows that are there are changed, rows that are not are inserted — two statements, no `on conflict`**
   (Sol B3, Fable B6); and **a table that already reads as its file is sent no statement at all** (Sol A3): it is
   compared first. So an equal vocabulary fires no trigger and draws from no sequence; a standing row is changed
   though the table has a not-null column of its own with no default (a new row there is still refused, by the
   server); a deferrable primary key serves. **A key the file holds twice** is said before any write: `the file
   holds a key twice: <the key's values, joined by ", ">` (the first by those values' text) — the server's
   `ON CONFLICT` message of §9a is gone with the statement. **A column a row names twice** is said too: `the file
   names the column <column> twice in one row` (the first by name) — read by the server from the text as `json`,
   which keeps both (Fable B8, Sol B5).
8. **What is deferred happens inside the pass** (Sol A4, B4; Fable B5): its transaction begins with `set
   constraints all immediate`, so a deferred reference's refusal comes at the statement — `pass-failed` at that
   file — and a deferred trigger has run before the proof reads (measured both). **Row security off** (Sol A5,
   Fable B3): the transaction says `row_security = off`, so a statement row security would filter is refused by
   the server instead of answering fewer rows.
9. **The key is the key** (Sol B3, Fable B6): a primary key's included columns are not key columns
   (`indnkeyatts`).
10. **The lock is asked again as each pass's last act, before its commit** (Sol A7, Fable B7): the passes write no
    ledger row, so piece 3's `ledger-moved` does not stand behind them. A lock lost by then ends the run as it
    does before a file — thrown on, the pass rolled back.
11. **A circle names its own tables only** (Sol B2): the tables that reference each other in a circle are those
    of a strongly connected group of more than one — a table on a path between two circles is not named.
12. **`.gitkeep`** (Fable's limit for piece 5): in `functions/` and `reference/` a regular file of that name is
    not an entry of the pass — neither a file nor an offence. Git delivers no empty directory, and a directory
    that left the checkout with its last file would silence the manifest.
13. **The judgement's order**, for a file: a table · marked · no column named twice in a row · every key a column ·
    a primary key · the key carried · no key twice · no reference that writes. Every file so, by name, before any
    row of any table is written; a value the server cannot read as its column's type is refused there, at that
    file.

**The tests the audits asked for** (beside one for each item above, each asserting what stands afterwards from a
session of the test's own): a body changed by hand between two runs of the same file is the file's again (a
runner that skipped an unchanged file would stay green on the old case); a second function file after one that
left its session changed; a value removed under `on delete cascade`, `set null` and an update action, with the
other table's rows read to the instant; an inheritance child; a deferred reference and a deferred trigger; a
standing `1.1` against `1.10`; the included key column; two circles joined by a path.

**Not built, with the reason:**

- A second writer on a vocabulary between its proof and the commit (Sol A7): a vocabulary is written by the pass
  alone — no door writes one (PLAN.md §2 A), and that no runtime login may is piece 7's measurement.
- An operator or a function planted on a search path to answer the runner's own catalogue reads (Sol B1, Fable
  C): item 3 puts the path back before every reading; what remains needs a hand that writes the chain's files.
- Row security pinned by a test (Sol A5, Fable B3): the bench's login bypasses it (measured), so the refusal
  cannot be seen there; the statement is in, and piece 5's roles make the case real.
- A range type or an extension inside `os` (Fable B6, Sol B1): its functions are rows no file holds, so the
  manifest refuses them — loudly, for good. `os` holds what the chain's files make; said in §10.
- A unique value moved from a row the file drops to a row it keeps (Fable B6): written before removed, so the
  server refuses — loudly; it takes two deliveries. Removing first would break the opposite case.
- Values PostgreSQL does not read that JavaScript does — `\u0000`, a lone surrogate, a number beyond its range
  (Sol B5): refused by the server at the pass, at that file, nothing written — not on the disk.
- A link swapped between the listing and the reading; `evidence/measure.sh`'s own drop by name (Sol, Fable C):
  piece 3's "not built", and an evidence script that ran once on a throwaway database.

**§10, corrected:** "the manifest is names and bodies" is true from item 1 on — a file's first statement sets its
function's body on every run. "A vocabulary cannot own a column of type `json`" is gone (item 6). The check no
longer reads `os` alone (item 2). **Added:** `os` holds no range type and no extension; a unique value moves
between rows in two deliveries; a file's time without an offset is UTC; a trigger on a vocabulary is the schema's
own code — what it writes elsewhere is not seen by the pass.
