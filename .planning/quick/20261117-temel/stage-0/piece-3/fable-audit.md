# Blind audit — B85 · stage 0 · piece 3 (the chain's runner, schema files)

**Verdict: no blocking (A) finding; seven B findings.** The runner does what was asked, and I found no route to a wrong database, a half-applied file or a file applied twice.

**Limits of this pass.** This copy has no `.git`, no `node_modules` and I have no shell. So `git show --stat` was not run, no test was run, and the `pg` driver's source was not read. Everything below is from reading `foundation/chain/src`, `foundation/bench/src`, `foundation/tests/chain`, the SPEC and the evidence logs. The conditions (K1–K10) are written above, before the code was opened.

## First question — does this do what was asked?

**Verdict: STANDS AFTER ATTEMPTED REFUTATION.** One library call builds and upgrades, in SPEC §6's order: disk → lock → ledger → comparison → bootstrap → files (`run.ts:53-91`). The property that carries the piece is the row-first transaction (`run.ts:36-38`) together with the ledger's primary key and `unique(file)`. A second runner's insert blocks on the first's uncommitted row and then fails, so the same file cannot commit twice even with the advisory lock gone.

## 1. The wrong database

**Claim:** no statement reaches a database off the foundation's list; the command cannot be redirected.
**Verdict: STANDS AFTER ATTEMPTED REFUTATION**, with one B.

- **Stands.** Every connection is opened in one place (`session.ts:13-24`), and the guard is the first statement on that same connection (`:19`). The lock, the ledger read, the bootstrap and each file all go through it. The command's address is a constant (`bench.ts:16-18`), the list path comes from `userInfo().homedir` (`bench.ts:27,33`), and `cli.ts:25-38` accepts only `--root` and `--wait`. The URL carries host, port, user, password and database, so `PGHOST`-style variables cannot move it.
- **F1 (B) — the driver reads the environment; the runner's "reads no environment variable" is not true of the process.**
  - Finding: `session.ts:14` passes only `connectionString` and a timeout. As I know `pg` 8.x, it fills `options` from `PGOPTIONS`, `application_name` from `PGAPPNAME` and `ssl` from `PGSSLMODE` when the config leaves them out.
  - Scenario: `PGOPTIONS='-c search_path=pg_catalog' pnpm foundation:chain up`. A file with an unqualified `create table t` lands elsewhere or fails; with `-c standard_conforming_strings=off` the same bytes parse differently. Hash, ledger row and `CHAIN_GREEN` are unchanged.
  - Impact: the same chain builds two different databases depending on the caller's shell, which is the reason §6.6 gives for a session per file. It is not a wrong-target route.
  - Evidence: **⚠ UNVERIFIED in this copy** — driver source absent. `foundation/tests/chain/fixtures/command.ts:19` runs the command with `PATH` only, so no test can see it.
  - Correction: give the `Client` explicit non-empty `options` and `application_name`, and `ssl: false`. Add a bench case that sets `PGOPTIONS` and records what a file meets.

## 2. Half a file, twice, out of order

**Verdict: STANDS AFTER ATTEMPTED REFUTATION**, with two B.

- **Bytes.** One `readFileSync`; the hash is over the bytes and the text is a fatal UTF-8 decode of the same buffer (`disk.ts:36-42`). It reaches the server as a bound parameter (`run.ts:21,37`), never interpolated. For valid UTF-8 the round trip is exact, provided the database's encoding is UTF8; the runner does not check that.
- **Atomicity.** `begin`, row, text, `commit` on one connection (`session.ts:31-40`). A failure at commit, such as a deferred constraint, rolls back and is reported `file-failed`.
- **Deaths.**
  - Killed between files: the next run continues.
  - Killed inside a file: `commit` is a separate message that is never sent, so the server aborts; a second run blocks on the orphan's row until it does.
  - Connection lost at `commit`: row and file are either both there or both absent.
  - Lock connection lost mid-file: caught before the next write (`lock.ts:39-45`, `run.ts:70,78`); the unique constraints cover the file in flight.
- **F5 (B, small) — the disk applied is the disk at start, not at lock grant.**
  - Finding: `run.ts:53` reads the disk before `run.ts:58` takes the lock.
  - Scenario: run A is applying; run B starts with `--wait 600` and reads `0004` v1; the developer corrects the still-unapplied `0004` to v2; B then applies v1 and prints `CHAIN_GREEN`.
  - Impact: the ledger is truthful, but the next run says `changed` for a file that is now applied, repairable only by a forward file.
  - Correction: re-read the disk once the lock is granted and stop if it differs from step 1.
- **F7 (B, small) — two endings fall outside §8's table without need.**
  - Finding (a): when a file's session is terminated by the server, `session.ts:37` sends `rollback` on the dead connection; that second error replaces the server's reason.
  - Finding (b): a ledger the login may not read ends as a raw error with exit 1, where SPEC §5 says `ledger-unknown`.
  - Impact: nothing is written in either case; the diagnosis is lost.
  - Correction: guard the `rollback`, keep the original as `cause`, and map the permission error.

## 3. The check before any write

**Verdict: STANDS AFTER ATTEMPTED REFUTATION.** Nothing is written before `compare` (`run.ts:60-65`); the bootstrap comes after it. I walked each state the brief names:

| State | Result |
|---|---|
| Rename that is also a renumbering | `renamed` alone (`compare.ts:29-35`) |
| Changed file and a new file before it | both said |
| Renamed and changed | `missing`, plus `before-applied` when the new name's number is not past the greatest |
| Empty ledger | all pending by number |
| Case or Unicode twins | impossible under the name pattern (`disk.ts:11`) |
| Symlinked `schema/` | `no-chain` (`disk.ts:21-29`, `lstat`) |
| File changed after the read | cannot matter: the in-memory text is what is hashed and executed, except for F5's window |

No state was found that should stop the run and passes as pending.

## 4. One runner at a time

**Verdict: STANDS AFTER ATTEMPTED REFUTATION.**

- The lock is taken before the ledger is read and released by closing its session on every path, thrown refusals included (`lock.ts:37-46`, `session.ts:21-23`).
- The key is the eight bytes of `os_chain` (I recomputed `0x6f735f636861696e` = 8030867441089341806) and travels as text, so there is no precision loss.
- There is no retry window in the code. The fixed address is the direct port, not a pooler.

## 5. The ledger's bootstrap

**Verdict: STANDS AFTER ATTEMPTED REFUTATION**, with one B.

- One transaction (`ledger.ts:117-122`). A foreign or mis-shaped `os_chain` is only read. The revoke loop covers PUBLIC and fails the bootstrap if any grantee remains (`ledger.ts:30-50`).
- Catalogue names are schema-qualified; operators (`=`, `~`, `||`) are not. That is reachable only through a search path that places a schema before `pg_catalog`, which F1's correction closes from the client side.
- **F4 (B) — the ledger is known by its columns and row 0 only.**
  - Finding: `SHAPE` (`ledger.ts:70-78`) reads names, types and not-null. A ledger rebuilt with `create table … (like …)`, without the primary key, `unique(file)` or the checks, is accepted (`ledger.ts:100-107`).
  - Impact: those constraints are the last wall for "applied once" when the lock is lost, and SPEC §9a lists them as the table's contract.
  - Correction: read `pg_constraint` into the shape, and add a case.

## 6. SQL built from text

**Verdict: STANDS.** Every statement in `foundation/chain/src` is a constant with bound parameters; the one `format` runs on the server through `quote_ident`. No shell is started and `process.env` is not read there (grep). The exception is the driver, F1.

## 7. The command

**Verdict: STANDS AFTER ATTEMPTED REFUTATION.** The mapping follows §8 (`answer.ts:10-24`, `cli.ts:46-63`). An unlisted error goes to stderr with exit 1. Only the exact word `up` followed by option/value pairs is accepted, so `UP`, `--root=x`, a trailing word or a repeated option gives the usage line.

## 8. The tests

**Verdict: REFUTED in part.** The cases are well made, but these rules are not pinned.

- **F2 (B) — no test pins "each file and its ledger row in one transaction".** A runner that commits the file and writes the row in a second transaction, or a second session, passes all 109 cases. Correction: a case asserting that the ledger row's `xmin` equals the `xmin` of the `pg_class` row the file created, and the same for row 0 against `os_chain`.
- **F3 (B) — a case that cannot go red now and will go red for the wrong reason later.**
  - Finding: `the-command.ts:62-65` (SPEC §9.4) asserts the instance's `postgres` database holds no `os_chain`.
  - It was green against the stub (`lead-run-on-the-stub.log:103`). No command case can reach a connection while `db/schema` is absent.
  - From piece 5 the command's real target is that database, and the module uses an instance that stands. `verify piece-3` will then fail on any instance that carries the chain.
  - Correction: decide now — compare that database before and after the command cases instead of asserting absence.
- **F6 (B, small) — the fixture sends `create database` on an unguarded connection.** `throwaway-database.ts:45,65-71`; the cluster is compared with the list only afterwards (`on-the-bench.test.ts:67`). Otherwise the fixtures send only create/drop and catalogue reads there, and the drop is by recorded oid with a name check (`:79-87`). Correction: the guard before the first statement of `onTheInstance`.
- **Timing beyond §10.** The three contention cases rest on the same 3 s sleep as the lost-identity case (`one-runner.ts:22-70`). Two fail red when the margin is lost. The wait case (`:38-51`) does not assert that the first run was still going, so it can pass without any contention.
- **Recomputation.** Only `read-chain.test.ts:21-25`, which checks the fixtures' literals and not the runner. Acceptable.
- **F8 (B, small) — rules no test pins:**
  - a second row of kind `ledger` is unknown (SPEC §5);
  - a symlinked `schema/`;
  - row 0's hash against the text (`built-from-nothing.ts:34` is a pattern only);
  - the lock held across more than one file, and the lost-lock stop;
  - `session_user` rather than `current_user`;
  - `no-chain` before the target is asked (§9a);
  - refusals and the unlisted error through the command;
  - `start transaction`, `end`, `abort`, `prepare transaction` and a called procedure (measured in §3, not tested).

## 9. The old system, addresses, what is left

**Verdict: UNVERIFIED for the commit range** — there is no git here. From the present tree:

- the root `package.json` carries the one script (line 43);
- `foundation/chain` spells no port, company variable or address (grep);
- no `db/schema` exists.

After a completed run nothing is left. After a killed test run, `chain_test_*` databases and temporary directories stay until the instance is destroyed, which follows from never removing by name.

## A and B findings in one place

**A:** none.

**B:**
1. **F1** — the driver reads `PGOPTIONS`, `PGAPPNAME` and `PGSSLMODE`; a file's session depends on the caller's shell (`session.ts:14`). ⚠ To be confirmed by one run.
2. **F2** — no test pins file and row in one transaction.
3. **F3** — the locked "no `os_chain` in `postgres`" case was never red and breaks at piece 5 (`the-command.ts:62-65`, SPEC §9.4).
4. **F4** — the ledger's constraints are not part of what "known" means (`ledger.ts:70-107`).
5. **F5** — the disk is read before the lock; `--wait` applies a stale reading (`run.ts:53,58`).
6. **F6** — the fixture's `create database` is unguarded (`throwaway-database.ts:45`).
7. **F7** — a masked server reason and an unreadable ledger end outside §8's table (`session.ts:37`, `ledger.ts:102`).
8. **F8** — the unpinned rules listed under point 8.
