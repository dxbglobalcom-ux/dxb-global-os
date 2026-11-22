# Blind audit — B85 stage 0, the build cut (BUILD.md)

## Step 1 — written before BUILD.md or BENCH-FACTS.md were opened

From the brief and PLAN.md §2 A, §2 C, §2 K, §2 M, N.1, §6, §7, §8 only.

**What the bench must guarantee**

1. Isolation proven in both directions and by catalogue enumeration, not by sample. §6 names four targets (tables, roles, clock, broadcast) plus "a new service role cannot reach the old tables".
2. The company engine is unreachable by construction: a positive identity check, not a port convention.
3. The chain's discipline exists before any table: file and ledger row in one transaction, hash stop, fixed function order, two kinds of reference data.
4. Three chain proofs: rebuild from nothing equals the snapshot; a failed file leaves nothing; a populated database upgrades N to N+1.
5. Roles come from the chain: owner NOLOGIN, one passwordless login per service, no RLS bypass, tests run as the service roles.
6. The test lock: tests in their own commit, the diff may not touch them, a locked test that did not run fails.
7. The old battery stays as it was, beside the new one; the old chain is untouched.
8. Two trials called trials: the in-process tool door and per-turn usage.
9. Two additions: the liveness table and the ruler.
10. Two preconditions: the folder cut by a list he sees, and the board scan.

**Risks**

- The rebuild drops things; roles are cluster-global, so "remove what the chain made" by pattern can remove more.
- A nondeterministic snapshot leads to a loosened comparison that proves nothing.
- An upgrade test with one version is vacuous.
- Isolation may hold only because nobody has granted anything yet (PUBLIC defaults).
- `authenticated` is shared by design, so "roles do not meet" needs a definition.
- The lock can be defeated outside the locked paths: config, helpers, the report, the lock tool.
- The liveness table and the ruler have no user yet, so they risk designing stage 1 on paper.
- Two batteries contend for one bench.

**My cut, in order:** folder cut and scan → 1 lock and battery skeleton → 2 runner on a trivial chain → 3 roles and empty schema → 4 rebuild, snapshot, real upgrade → 5 catalogue-level separation with the old battery before and after → 6 liveness table only → 7 tool-door spike → 8 thinnest ruler → close.

**What would make a cut wrong**

- *Too little:* separation by example; no company guard; a one-version upgrade; a lock without "did it run"; clock and broadcast left unaddressed; §8 items 1, 2, 13 not rewritten.
- *Too much:* any stage-1 table or door; processes built to produce beats; an office declaration format or installer; probes; surfaces; any touch of the old chain.

## Verdict

The cut's shape matches PLAN.md and adds no stage-1 table, but it is **not ready to start at piece 3**. The unchanged old battery re-grants privileges to every role on the bench on each run, and one old test pins the realtime policy set; both contradict "the two do not meet" beside "the old battery stays as it is".
Pieces 1 and 2 can start once findings 4, 5 and 6 are fixed; the rest are contract corrections before their pieces.

Nothing below was run. I had no database tool, so every statement about the bench is read from source or from BENCH-FACTS.md.

## Findings, most serious first

### 1 · Class A — the old battery writes privileges onto the new roles on every run (b, g)

- **Claim:** each `os_*` login holds no privilege on what the old system owns and no USAGE on `net` (BUILD.md:156-160); "the old one cannot see `os`, the new one never writes outside it" (BUILD.md:244-245); the old battery ends with "the two reds named above and no other" (BUILD.md:225).
- **Verdict:** REFUTED from source.
- **Finding:** the old battery's host half runs `prove-window-escapes.mjs` three times per run. It re-opens `net` USAGE, the `lo_*` family and a `net` sequence to PUBLIC, then re-seals with `company-one-way-window.sql`. The re-seal hands each privilege back **by name to every role that held it**, and every `os_*` role holds it through PUBLIC at that moment. The same file also writes every existing role into the default privileges of `postgres` and `supabase_admin` for functions in `public` and `pgboss`.
- **Impact:** after the first old-battery run following piece 3, each `os_*` role holds named USAGE on `net`, named EXECUTE on `lo_*`, and EXECUTE on every function the old chain creates afterwards. The separation test goes red, or passes at piece 3 and is false the next day. `BENCH_GREEN` then depends on which battery ran last.
- **Evidence:** `scripts/b36/prove-window-escapes.mjs:99-131`; `scripts/b36/company-one-way-window.sql:232-250, 319-340, 463-483`; `tests/b36/live-drills.host.test.ts:53, 102, 122`; `scripts/construction/battery.sh:58`.
- **Correction required:** decide before piece 3, because no new-side design avoids it (a role cannot opt out of PUBLIC). Two honest options:
  - one exclusion of `os_%` roles in the old installer's holder lists, which is a change to the old system and needs his word against fact 2; or
  - the new system on an engine of its own, which contradicts PLAN decision 1.
  - I recommend the first. In either case the stage's proof becomes `foundation:bench` → old battery → `foundation:bench` again.

### 2 · Class A — the rebuild's danger: removing the roles changes old-system catalogue rows (g)

- **Claim:** the rebuild "removes only what carries the foundation's names, and the fingerprint test proves the rest of the cluster untouched" (BUILD.md:240-241, 163-164).
- **Verdict:** REFUTED once finding 1 has happened; otherwise UNVERIFIED.
- **Finding:** after one old-battery run, the old system's ACLs reference `os_*` roles. `DROP ROLE` then fails on dependencies. The only way through is `DROP OWNED BY`, which revokes those entries and so rewrites rows belonging to `postgres` and `supabase_admin`, and may need rights the non-superuser `postgres` lacks.
- **Other ways it can remove what is not the foundation's:**
  - `DROP SCHEMA os CASCADE` reaches dependents outside `os`. None exist at stage 0, but stage 5 names compatibility views (PLAN.md:750-751).
  - Removal by pattern: `LIKE 'os_%'` treats `_` as a wildcard, and the `os_fixture_*` databases share the prefix.
  - The fingerprint is catalogue-only (no rows), and residue present both before and after reads as "identical".
  - `realtime` creates daily partitions on its own (`tests/global-teardown.ts:236-268`), so an unscoped fingerprint flakes at a date change.
- **Company engine:** STANDS AFTER ATTEMPTED REFUTATION. Clusters are separate and the existing check is a positive allow-list (`tests/global-teardown.ts:214-226`). Three conditions BUILD.md does not state are needed: the check runs on the session that does the work, no address comes from env or argv, and `CREATE/DROP DATABASE` (which cannot run in a transaction) uses that same session.
- **Correction required:** remove by the ledger's exact list, with RESTRICT and never CASCADE. After removal, assert zero residue against a baseline taken before the foundation ever existed. Scope the fingerprint to named catalogues and add row counts of the old schemas.

### 3 · Class B (piece 5; not the lead's to settle alone) — one old test allows exactly one policy on `realtime.messages`

- **Claim:** the broadcast measurement adds what the chain must own outside `os`, "a policy on `realtime.messages`, a grant" (BUILD.md:192-195), while no old test is edited (BUILD.md:78-80).
- **Verdict:** REFUTED.
- **Finding:** joining a private topic is a SELECT on `realtime.messages` under RLS, so `os:` needs its own policy. A sender without BYPASSRLS needs an INSERT policy too. The old test asserts exactly one policy on that table, by name.
- **Impact:** piece 5 turns the old battery red, or the old test is edited, or `os:` is not private.
- **Evidence:** `tests/phase8/broadcast-triggers.test.ts:106-119`; `db/migrations/20260710000013_broadcast_triggers.sql:34-39`.
- **Correction required:** bring it to him with a recommendation before piece 5. I recommend rewriting that one test to pin the `dxb:` policy and ignore `os_*` ones, as a registered exception.

### 4 · Class B (pieces 1-2) — the identity check is not where the cut says, and it refuses the fixture databases

- **Claim:** "the one spelling with the identity check is `tests/construction-engine.ts`" (BUILD.md:40-41, 105-106); the runner's tests run in throwaway `os_fixture_*` databases behind that check (BUILD.md:118-119, 131-132).
- **Verdict:** REFUTED.
- **Finding:** `tests/construction-engine.ts:33-34` is a constant only. The check is a private function in `tests/global-teardown.ts:203-233`, and it matches cluster **and** (database oid or name). Only `postgres`/oid 5 is allowed (`tools/hooks/ledger-identity.json:8-16`), so every fixture database is refused.
- **Correction required:** the runner needs its own rule (cluster identifier on the allow-list, database name either the allowed one or an exact fixture name it created), with its own tests. That is a new check and should be called one.

### 5 · Class B (piece 2) — CREATEDB and database ownership are not in the measured facts

- **Claim:** `postgres` has `CREATEDB` and "owns database `postgres`" (BUILD.md:29-30).
- **Verdict:** UNVERIFIED.
- **Finding:** BENCH-FACTS.md:19 measures four role attributes (login, super, bypassrls, createrole). Line 20 measures CREATE on the database, which is neither CREATEDB nor ownership. Piece 2's whole test design rests on creating databases.
- **Correction required:** one query on `pg_roles.rolcreatedb` and `pg_database.datdba` before piece 2's contract is signed.

### 6 · Class B (piece 1) — the test lock: ways a writer still passes (e)

- **Claim:** `verify` fails on a changed locked file, a missing/skipped/failed locked test, or a diff touching the lock (BUILD.md:107-113).
- **Verdict:** STANDS for what it names; these routes remain open.

| # | Still works | What closes it |
|---|---|---|
| 1 | Hand-written or stale `--report` JSON | `verify` runs the tests itself and never takes a report path |
| 2 | Edit the test, run, restore the file, then verify | Verify from a clean checkout of the commit; hash git blobs, refuse a dirty tree |
| 3 | `foundation/vitest.config.ts`: setup file patching `expect`, alias to a stub, `retry` | Config and every setup file hashed into every lock; fail on any retry |
| 4 | Unlocked helpers the tests import (the "connect as the service role" helper) | Lock each test's import closure, except the code under test |
| 5 | Edit the lock tool, the `foundation:*` scripts or the lockfile in a later piece | A lead-only path list checked by every `verify` |
| 6 | `--range` is optional | Make it mandatory |
| 7 | Patched `node_modules` (never in a diff) | Frozen install in the clean checkout |
| 8 | State left by hand on the bench (a manual GRANT) | From piece 3 on, verify only after a rebuild from nothing |
| 9 | Product code that detects the test run or patches `expect`/`pg` at import | Only the lead's reading; add a grep for `vitest`/`VITEST` in product paths and say the limit |
| 10 | Duplicate test names; an early `return` before the assertions | Count per file and full name; `expect.requireAssertions` |

Route 11 is the committed database snapshot, which the writer regenerates in the same commit (BUILD.md:187); see finding 7.

### 7 · Class B (pieces 2-4) — three proofs prove less than they say

- **Claim:** rebuild from nothing equals the snapshot; "a populated database upgraded … keeps its rows"; the first real upgrade is piece 4 (BUILD.md:134, 153-154, 168, 184).
- **Verdict:** STANDS as mechanics; REFUTED as the proofs PLAN §2 A asks for.
- **Finding:**
  - **Snapshot.** The writer generates and commits the snapshot, so the comparison only goes red on drift or nondeterminism, never on a wrong schema. The lead must generate it and read its diff.
  - **Upgrade.** No test asserts that an upgraded database's snapshot equals the rebuilt one. The bench is always rebuilt and the company will only ever be upgraded, so they can drift unseen (an orphan function whose file was deleted, a reference row the file dropped).
  - **First real upgrade.** At piece 4 the populated bench holds ledger rows only, so "the earlier rows stand" is nearly empty. A standing test should build the chain at the stage's base commit, insert rows, then apply HEAD.
  - **Snapshot stability.** `sol-reader-role.sql:91-98` runs `REVOKE … IN SCHEMA` over every schema as a superuser on each `construction:schema`. As I know PostgreSQL this materialises empty ACLs, so the snapshot must normalise ACLs. Not confirmed on the bench.
- **Correction required:** add those three assertions to the contracts of pieces 2, 3 and 4.

### 8 · Class B (pieces 3, 5) — "do not meet" is narrower than written

- **Claim:** separation "by catalogue" (BUILD.md:155-164); "a `dxb:` topic is untouched" (BUILD.md:193).
- **Verdict:** REFUTED in scope.
- **Finding:**
  - The lists are fixed: four schemas, five USAGE checks, six old roles. `realtime`, `storage`, `graphql`, `extensions`, `_realtime`, the `_supabase` database and roles such as `supabase_read_only_user` are never asked. A test cannot go red for a name it does not hold.
  - `postgres` installs and tests both systems. It has BYPASSRLS, and on PostgreSQL 16+ a CREATEROLE creator gets ADMIN on each role it creates and needs SET on `os_owner` to create objects as it.
  - `authenticated` and `auth.users` are shared by PLAN's own decision.
  - LISTEN/NOTIFY has no privileges: any `os_*` login can listen on `dxb_ops_live`, and anything can notify `os_wake`.
  - On this bench the window has taken `pg_notify` and the advisory-lock functions from PUBLIC (`company-one-way-window.sql:106-125`). Roles created later hold neither, and `postgres` got them back without grant option. A door that notifies, or pg-boss if it takes advisory locks, will be refused as `os_*`.
  - "A `dxb:` topic is untouched" names no observable and can never go red.
- **Correction required:** enumerate from `pg_namespace` and `pg_roles` with one allow-list. State the shared parts (`postgres`, `authenticated`, channels separated by name only) inside the test. Define the `dxb:` assertion as row count, policy text and a subscribed client that receives nothing. Add the `pg_catalog` grants to piece 3's "measured first".

### 9 · Class B — order and size against PLAN §6 and the owner's rhythm (b)

- **Claim:** "`0a` and `0b` beside everything" (BUILD.md:233); each piece ends inside one session (BUILD.md:86-87).
- **Verdict:** REFUTED.
- **Finding:**
  - PLAN.md:710 puts the folder cut "Before it", and his words are "inşa başlamadan önce silinsin". PLAN also says the scan's findings "come back into this plan", not into later contracts (BUILD.md:97-99).
  - **Piece 3** is a measurement whose result decides the contract, plus roles, install step, snapshot generator, rebuild and separation. Tests cannot be written first from a contract that is not yet known.
  - **Piece 5** is two unrelated measurements.
  - **Piece 8** is the bench command, a 10.5-minute old battery, an auditor's tool, a two-auditor audit, the fixes, the specs and the records.
  - The auditor's read tool (BUILD.md:226) cannot be the old one unedited: `sol-reader-role.sql:162-170` refuses any schema beyond its four, and `os_reader` without BYPASSRLS reads false zeros under RLS.
- **Correction required:** do 0a's deletion before piece 1's first commit, or register the deviation. Split to 3a measure / 3b roles and schema / 3c snapshot and rebuild / 3d separation; 5a broadcast / 5b clock; 8a command and auditor's reach / 8b audit and fixes / 8c records.

### 10 · Class B (piece 4) — the liveness table is not yet thin enough to be honest (f)

- **Claim:** two doors and four derived states, tested now (BUILD.md:167-187).
- **Verdict:** building the table now STANDS: PLAN.md:759 orders it, and it is the chain's first real subject. Three parts do not stand.
- **Finding:**
  - The voice daemon gets a reference row and "a process writes its own row, known by its login", but §3 has no login for it (BUILD.md:58 vs 173-176). Nobody can ever beat that row.
  - N.1's `failed link` is a process that beats while its probe failed. With no link rows at stage 0, the cut silently redefines it as "a non-process row that failed". The only row `liveness_observe` can write is the model door, which nothing probes yet.
  - `stopped` needs an interval, which is unmeasured and has no door. The test must invent a number or write as owner.
- **Correction required:** keep the table, its vocabulary, `liveness_beat` (identity from `session_user`), and the reader with `unknown`, `stopped`, `resting`. Move `liveness_observe` and `failed link` to the first real probe. Drop the voice row or add its login as a marked choice. State that the interval lives in the reference file.
- **What is lost:** nothing §6 asks for; B32 and B81 still get a reader to draw on.

### 11 · Class B (piece 6) — the env allow-list does not deliver "cannot read a database address"

- **Claim:** "the session's own tools cannot read a database address" (BUILD.md:203-208).
- **Verdict:** REFUTED as a consequence of the env list alone.
- **Finding:** the seat is a child of the runner under the same user. Its shell tool can read the parent's `/proc/<pid>/environ`, the mode-600 password files in `~/.config/dxb/`, and the bench address written in clear in 13 repository files (BENCH-FACTS.md:7).
- **Correction required:** the trial attempts those three reads and reports what happened. The claim becomes either "the child's environment holds none" or it names the jail or tool restriction that makes the stronger sentence true.
- **Also:** piece 6 has no locked test; say so. The SDK's types were not checked by me.

### 12 · Class B (piece 5) — pg-boss under the chain's discipline is not designed

- **Claim:** "its schema created by the chain as the owner" (BUILD.md:196-198).
- **Verdict:** UNVERIFIED, and wider than the cut's own caveat (BUILD.md:48-49).
- **Finding:** `os_owner` has no login, and pg-boss's initializer opens its own connections. A library-made schema has no file, no hash and no ledger row. A later pg-boss version migrates its schema itself, which the engine's login may not do.
- **Correction required:** piece 5b states who runs the initializer and as whom, what the ledger and snapshot record for `os_clock`, and who migrates it.

### 13 · Class C — the ruler carries two things no office has asked for (c, f)

- **Claim:** it marks whether "the office's record names" a change, and `--strict` fails (BUILD.md:214-217).
- **Verdict:** building the lister now STANDS (PLAN.md:759). `--strict` contradicts "The test reports; it does not forbid" (PLAN.md:320), and the "record" is a format invented before the first office.
- **Correction required:** keep places plus commit range → files outside, with generated files apart. Move "named" to stage 1's first job type.
- **What is lost:** nothing until an office exists.

### 14 · Class B for the wall, C for the rest — the §3 choices (d)

- **Names:** STAND. `os`, `os_clock`, the `os_*` roles, `os:` and `os_wake` collide with nothing in BENCH-FACTS.md:17-19 or with PostgreSQL's reserved `pg_` prefix.
- **"Removes the old system by directory and renames nothing"** (BUILD.md:62-63): REFUTED in part. The new battery imports `tests/construction-engine.ts` and needs the lock in `tests/global-teardown.ts:82` and `tools/hooks/ledger-identity.json`, all inside directories stage 5 removes. List them as moving at stage 5.
- **Workspace root:** line 69 says `foundation/<subject>/`, line 103 says `foundation/`. `foundation/tests/` is not a package, so under pnpm it cannot resolve `pg`. Decide where the tests' dependencies live.
- **Old files touched:** `pnpm-lock.yaml` is a third. Nothing typechecks `foundation/` (`package.json:8`), and `foundation:bench` has no typecheck.
- **The wall (B, piece 1):** the cut does not say whether the new battery runs inside the construction sandbox. Service passwords in the home folder and the sign-in port suggest it cannot. The old company-key guard scans `tests/` only (`tests/b36/battery-carries-no-company-key.test.ts:63-77`). Say where it runs and add its own guard.

### 15 · Class C — statements to correct

- **"The old rebuild … drops nothing, so a new schema survives it"** (BUILD.md:32): true of `bootstrap-db.sh:58-61`. The bench's real rebuild is a reset that destroys the volume (`sol-reader-role.sh:23`).
- **"The new one never writes outside it"** (BUILD.md:245): contradicts pieces 2, 3 and 5.
- **"Without it no service can log in"** (BUILD.md:148): UNVERIFIED; read `pg_hba_file_rules` (the image may trust loopback).
- **Passwords:** set as a SCRAM verifier, as `sol-reader-role.sh:74-84` does. `pgaudit` is preloaded (BENCH-FACTS.md:26) and a plain password could reach a log.
- **PLAN.md:779** says the old battery "stays green", but it is red today (BUILD.md:35-36). Register the adaptation in PLAN §7 and compare by test name, not exit code.

### Checked and found true

BUILD.md:31 (188 files, two calls, no hash) · 35-36 (2,172 tests, about 10.5 minutes) · 37 (pg-boss 12.25.1) · 42 (SDK 0.3.296 pinned) · 44-45 (the hook judges `.sql`, exempts `__snapshots__/` and `fixtures/`) · 190 (PLAN decision 1) · the old battery's selection excludes `foundation/tests/`.

## Not read or not checked

- The bench itself and the company engine: no query was run.
- `node_modules` is absent from my working copy, so the SDK's types (`createSdkMcpServer`, per-turn usage) and pg-boss 12's options were not checked.
- Not read: `scripts/bootstrap/preamble.sql`, `scripts/construction/run.sh` beyond its lock lines, `sandbox.sh`, `sol-db-mcp.mjs`, `ledger-identity.mjs`, the post-commit and post-checkout hooks, the `scan/` folder, PLAN sections outside those named plus §1 and §2 E-F, and `company-one-way-window.sql:265-299` (the sequence loop's body).
- From memory, not confirmed here: that `realtime.send` swallows insert errors, the image's `pg_hba` rules, and ACL materialisation on REVOKE.
- Whether the allow-listed cluster identifier in `ledger-identity.json` is today's bench.
