# B85 · stage 0 · piece 2 — the test lock: the contract

Cut from `../BUILD.md` §6 piece 2 and PLAN.md §2 K ("a writer cannot change the test that judges it"). This file is
the contract the tests are written from and the code is written to. The lead wrote it (2026-11-23); what it decides
beyond BUILD.md is marked **[lead]** with its reason.

## 1. What the piece leaves standing

1. A package `foundation/lock` (`@dxb-foundation/lock`) — the lock tool. Node built-ins only, no dependency at run
   time; run by Node directly like the bench (erasable syntax, imports spelled with `.ts`).
2. `foundation/locks/` — the lead's records: `inventory.json` (which pieces must have a lock) and one
   `<piece>.json` per locked piece.
3. Two root scripts: `foundation:lock` (`node foundation/lock/src/cli.ts lock`) and `foundation:verify`
   (`node foundation/lock/src/cli.ts verify`).
4. Locks for piece 1 (`foundation/tests/bench`) and for this piece (`foundation/tests/lock`), made by the lead after
   the code — the tool cannot judge itself before it exists; that bootstrap is the lead's own run and reading.

Old files touched: the root `package.json` (two scripts), `pnpm-lock.yaml`. `foundation/tsconfig.json` gains
`lock/src/**/*.ts`. Nothing else outside `foundation/`.

## 2. Measured facts (the lead's runs, 2026-11-23 01:50–02:00) — not to be re-litigated

- Vitest is 3.2.6. A reporter given by path (`--reporter=<absolute path>`, a file outside the test root works) receives
  `onInit(vitest)`, `onTestModuleCollected(module)`, `onTestCaseResult(case)`, `onTestModuleEnd(module)` and
  `onTestRunEnd(modules, unhandledErrors, reason)`. A case gives `name`, its suites by walking `parent` while
  `parent.type === "suite"`, `module.relativeModuleId`, `options` (`mode`, `retry`, `each`), `result().state`
  (`passed` · `failed` · `skipped`) and, when it ran, `diagnostic().retryCount` and `.flaky`. Seen on a probe file:
  a declared skip, a `ctx.skip()`, a `skipIf(true)` and a todo all end `skipped`; a case that passed on its second try
  ends `passed` with `retryCount: 1`; with `--expect.requireAssertions` a case that returns before asserting ends
  `failed` ("expected any number of assertion, but got none"); two cases of the same name in one suite are two
  results; `test.each` gives one case per row.
- A pass that runs nothing: `-t '<a name no case has>' --passWithNoTests` collects every case (all reported with mode
  `skip`, `options.retry` still visible) in 0.6 s. `vitest list --json` leaves declared skips and todos out and gives
  only joined names — not used.
- A clean copy: `git archive <tree> | tar -x` of this repository takes 0.7 s (319 MB on disk).
- A frozen install in that copy: `pnpm -C <copy> install --frozen-lockfile --offline --filter '@dxb-foundation/*'`
  takes 0.6 s, leaves `pnpm-lock.yaml` byte-equal, and gives `foundation/tests/node_modules/.bin/vitest` and a working
  `foundation/bench/node_modules/.bin/supabase` (2.109.0). **Only on the home filesystem**: pnpm's store is
  `~/.local/share/pnpm/store/v11`; a copy under `/tmp` (another filesystem) gets an empty store of its own and the
  offline install fails with `ERR_PNPM_NO_OFFLINE_TARBALL`.
- The commit hook stops a code file over 20,000 bytes (`.ts`, `.mjs`, `.sh` … — not `.json`); a path with a
  `fixtures/` segment is exempt.
- Piece 1's tests import their helpers only as `./fixtures/*.ts`; other fixtures are started by path, not imported.

## 3. The words

- **Candidate** — a git tree. By default the index (`git write-tree`: exactly what a commit would hold); with
  `--rev <commit>` that commit's tree. Never the working tree: an unstaged or untracked file is not in it. **[lead]**
  BUILD.md says "a clean copy of the candidate"; the index is the one candidate that is both what the lead read
  (`git diff --cached`) and what the commit will be — the verified tree's id is printed, and equals `HEAD^{tree}`
  after the commit.
- **Base** — `HEAD` for the index, the commit itself for `--rev`.
- **Lock commit** of a piece — the newest commit in the base's history that changed `foundation/locks/<piece>.json`.
  It is derived, never passed in. A lock file that is not committed has no lock commit.
- **Judge** — the lock tool as it stands at the lock commit. **[lead]** (after ASTRA A4: "load the judging components
  from a lead-controlled revision"). `verify` first compares its own files with `foundation/lock/` at the lock commit;
  when they differ it extracts that directory from the lock commit and runs that copy instead, passing its output and
  exit code through. So a candidate that changes the tool is judged by the unchanged tool.
- **Protected** — a file whose content at the candidate must equal the lock's record.

## 4. The records — `foundation/locks/`

`inventory.json`, hand-kept by the lead:

```json
{ "pieces": [ { "piece": "piece-1", "lock": true }, { "piece": "piece-12", "lock": false, "why": "tried live, on demand" } ] }
```

`<piece>.json`, written only by `lock`, deterministic (keys and lists sorted, two-space JSON, one final newline —
the same input gives the same bytes):

```json
{
  "format": 1,
  "piece": "piece-1",
  "dirs": ["foundation/tests/bench"],
  "config": "foundation/tests/vitest.config.ts",
  "protected": { "<path>": "<git blob id>" },
  "scripts": { "foundation:test": "<command>" },
  "cases": [ { "file": "foundation/tests/bench/x.test.ts", "suite": ["outer", "inner"], "name": "…", "count": 1 } ]
}
```

- `dirs` — the piece's test subject directories under `foundation/tests/`. Every `*.test.ts` in them is a locked
  test; every file in them is protected and **the directory is closed**: a file added to it is an offence.
- `protected` holds, each with its blob id at the tree the lock was made from: every file under `dirs`; the config;
  every file the config names as a set-up file (`setupFiles`, `globalSetup` — taken from the resolved configuration
  the reporter is handed, not parsed from text); the relative-import closure of all of those (static `import`/`export
  … from` and `import("literal")`, followed while the target is under `foundation/tests/`); and, in every lock:
  every file lying **directly** in `foundation/tests/` (the package file, the config — closed, not recursive: a
  workspace or project file, a second config or a `tsconfig.json` added there would change the run without touching a
  locked file), `foundation/tsconfig.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` and every file of
  `foundation/lock/` (closed, recursive). The set-up files are those of every project the runner resolved.
- `scripts` — every root `package.json` script whose name starts with `foundation:`.
- `cases` — every case collected from the locked tests: file, the full suite path, the name, and how many cases
  carry exactly that file, path and name.

A bare specifier (`@dxb-foundation/bench`, `vitest`, `node:fs`) is the code under test or the platform and is not
followed. A relative import that leaves `foundation/tests/` is refused at lock time: a test reaches product code
through its package.

## 5. The commands

Repository root: `git rev-parse --show-toplevel` of the working directory. Work directory of a run: a fresh
`mkdtemp` under `<home>/.cache/dxb/foundation-verify/` (`<home>` from `os.userInfo().homedir`), holding `candidate/`,
`judge/` when one is extracted, and `result/`; removed when the command ends, whatever the outcome (`--keep` leaves
it and prints its path). The tool removes only a directory it made in this run. The only environment variable it
reads is `PATH`. Subprocesses: an argument array, never a shell string.

### `lock <piece> [<dir>…]`

From the index. `<dir>…` is required the first time and optional afterwards (the lock's own `dirs` are reused).

1. Refuses when: the running tool's files differ from `foundation/lock/` in the index; a `<dir>` is not a directory
   under `foundation/tests/` in the index; the index has unmerged entries.
2. Makes the clean copy and the frozen install (as `verify` step 4), then one collecting pass that runs nothing.
3. Refuses when: a locked test file has no case; a module fails to collect; a case declares a retry or a repeat; a
   relative import leaves `foundation/tests/`; a set-up file lies outside the copy.
4. Writes `foundation/locks/<piece>.json` in the working tree — it stages nothing and commits nothing — and prints
   what changed against the previous lock (cases added and removed, protected paths added, removed and changed), then
   `LOCK_WRITTEN piece=<piece> cases=<n> protected=<n>`, exit 0. A refusal prints `LOCK_REFUSED <why>`, exit 2.

### `verify <piece> [--rev <commit>]`

Takes no report and no range. In this order:

1. **The lock.** No `foundation/locks/<piece>.json` at the base, or no lock commit → `LOCK_REFUSED`, exit 2.
2. **The judge.** As §3. The first line printed says which: `JUDGE in-place lock=<commit>` or
   `JUDGE extracted lock=<commit>`.
3. **The structure** — all read from git, all offences collected:
   - a protected path whose blob at the candidate differs from the lock's record → `protected-changed <path>`;
     absent → `protected-missing <path>`;
   - a file under a `dirs` entry or under `foundation/lock/`, or directly in `foundation/tests/`, that the lock does
     not hold → `closed-dir-added <path>`;
   - a path of the candidate with a `node_modules` segment → `candidate-carries-node-modules <path>` (nothing
     installed may come from the tree);
   - the `foundation:*` scripts of the candidate's root `package.json` differ from `scripts` (changed, added or
     removed) → `scripts-changed <name>`;
   - a protected path whose blob **at the lock commit** differs from the lock's record → `lock-inconsistent <path>`
     (the lock was not committed with the tree it describes);
   - the candidate differs from its base under `foundation/locks/` → `locks-touched <path>` (a staged change to any
     lock or to the inventory);
   - a commit from the lock commit to the base that changes `foundation/locks/` and also changes a path that is
     neither under `foundation/locks/`, nor protected by a lock file in that commit's tree, nor one of `package.json`,
     `pnpm-lock.yaml`, `pnpm-workspace.yaml` → `lock-commit-impure <commit> <path>`; one with two parents likewise.
     **[lead]** This is BUILD.md's "the piece's range touches `foundation/locks/`" made exact: later pieces' locks
     are legitimate commits inside an earlier piece's range (ASTRA A4), so what is refused is a lock changed together
     with product code — PLAN.md §2 K's "the lead commits a piece's tests in their own commit", checked.
   Any structural offence → the tests are not run; `LOCK_RED`.
4. **The copy and the install.** The candidate tree written into `candidate/` — exactly its files, each with
   exactly its blob's bytes: no git attribute, filter, end-of-line conversion or `export-ignore`/`export-subst` rule
   applies (a `.gitattributes` in the candidate must change nothing of the copy). Then
   `pnpm -C candidate install --frozen-lockfile --offline --filter '@dxb-foundation/*'`. Exit not zero →
   `install-failed`; `pnpm-lock.yaml` in the copy no longer the candidate's blob → `lockfile-changed-by-install`.
5. **The run.** `candidate/foundation/tests/node_modules/.bin/vitest run --config <copy>/<config> <the locked test
   files> --reporter=<the judge's reporter> --outputFile=<result/<nonce>.json> --retry=0 --expect.requireAssertions
   --allowOnly=false --passWithNoTests=false`, working directory `candidate/foundation/tests`, environment exactly
   `PATH` and `HOME`. `<nonce>` is fresh random text of this run. The reporter writes the result once, at the run's
   end, creating the file exclusively, with the nonce it took from the file's name inside it: every case result
   (file, suite path, name, state, retry count), every module's verdict, the unhandled errors' count, the run's
   reason, the resolved set-up files.
6. **The judgement** — the judge reads its own fresh result:
   - no result file → `result-missing`; unreadable or not the reporter's shape → `result-malformed`; its nonce is not
     this run's → `result-stale`;
   - for every locked (file, suite path, name): fewer results than `count` → `case-missing`; more → `case-count`;
     a result `skipped` → `case-skipped`; `retryCount > 0` → `case-retried`; any state but `passed` →
     `case-not-passed` (a case that ended without an assertion arrives here, by `requireAssertions`);
   - a result the lock does not hold → `case-unknown`;
   - a module that did not end passed, or carries errors → `file-failed <file>`; unhandled errors → `run-errors <n>`;
     a set-up file in the result that is not protected → `setup-unprotected <path>`;
   - the run's exit code not zero → `exit-nonzero <code>` — also when every case passed.
7. **Notes, never offences:** for every path changed between the lock commit and the candidate that is not
   protected, each line that spells `vitest` (any case) or `foundation-verify` → `NOTE runner-name <path>:<line>`.
   *The limit, said:* code that detects the test run is caught only by the lead's reading; this search helps and
   proves nothing.

Each offence is one line `OFFENCE <kind> <detail>`. Last line and exit:

| Outcome | Last line | Exit |
|---|---|---|
| no offence | `LOCK_GREEN piece=<piece> lock=<commit> candidate=<tree id> cases=<n>` | 0 |
| any offence | `LOCK_RED piece=<piece> lock=<commit> candidate=<tree id> offences=<n>` | 1 |
| cannot judge | `LOCK_REFUSED <why>` | 2 |

### `verify --all [--rev <commit>]`

Reads `foundation/locks/inventory.json` at the base. A piece with `"lock": true` and no lock file →
`OFFENCE lock-owed <piece>`; a lock file whose piece the inventory does not name → `OFFENCE lock-unlisted <piece>`;
then `verify` of every locked piece in the inventory's order. Last line `LOCKS_GREEN pieces=<n>` (exit 0) or
`LOCKS_RED pieces=<n> red=<n> owed=<n>` (exit 1). No inventory → `LOCK_REFUSED`, exit 2.

## 6. What the library exports (`foundation/lock/src/index.ts`) — so that tests pin the decisions without a run

```ts
export type LockedCase = { file: string; suite: string[]; name: string; count: number };
export type CaseResult = { file: string; suite: string[]; name: string; state: string; retryCount: number };
export type RunResult = {
  nonce: string; cases: CaseResult[];
  modules: { file: string; state: string; errors: number }[];
  unhandledErrors: number; reason: string; setupFiles: string[];
};
export type Offence = { kind: string; detail: string };
/** Pure. Step 6 above: `result` is what was read (undefined: no file; null: malformed). */
export function judgeRun(input: {
  cases: readonly LockedCase[]; protectedPaths: readonly string[];
  result: RunResult | null | undefined; nonce: string; exitCode: number;
}): Offence[];
/** Pure. Step 3's first four rules — the ones that need no history — on listings already read from git. */
export function judgeStructure(input: {
  lock: LockFile; candidate: ReadonlyMap<string, string>;        // path → blob id, the candidate's whole tree
  candidateScripts: Readonly<Record<string, string>>;
}): Offence[];
export type LockFile = { format: 1; piece: string; dirs: string[]; config: string;
  protected: Record<string, string>; scripts: Record<string, string>; cases: LockedCase[] };
/** Pure. The relative specifiers of one source text (static import, export-from, import("literal")). */
export function relativeImports(source: string): string[];
/** Pure. Deterministic text of a lock file. */
export function serializeLock(lock: LockFile): string;
```

The reporter is `foundation/lock/src/reporter.mjs` — plain JavaScript, importing nothing but Node built-ins, because
Vitest loads it from outside the candidate.

## 7. The tests — `foundation/tests/lock/`, written before the code, on fixtures with known outcomes

A fixture is a throwaway git repository built by the tests in a temporary directory: a root `package.json` with
`foundation:*` scripts, `pnpm-workspace.yaml`, a `pnpm-lock.yaml`, `foundation/tests` (a config that names one set-up
file, a subject directory with a few small test files, one helper outside the subject directory reached by a relative
import, one fixture file started by path), a small product package the tests import by name, a copy of the real
`foundation/lock/` and `foundation/locks/` written by the real `lock` command and committed as the lock commit. The
tests drive the real command as a subprocess with the fixture as working directory. A fixture's test files must not
match the foundation's own test include while they lie in this repository.

The product package of the fixture is what a case changes to plant an offence — the locked tests stay as locked.
Its tests are written so that product code alone can produce each outcome: one case skips itself when the product
says "unavailable"; one returns before its assertion when the product says "not ready"; one `it.each` runs over a
list the product exports; one asserts a value the product returns.

1. **`judge-run`** (pure, `judgeRun`): a result that matches → no offence; and one case each, planted in the result:
   a case missing; one skipped; one retried (`retryCount: 1`, state `passed`); one failed; one the lock does not
   hold; a duplicate name locked with `count: 2` and one result; `count: 1` and two results; a module failed with all
   cases passed; unhandled errors; exit code 1 with everything passed; no result; a malformed result; a result with
   another nonce — **a previous green result of the same suite, replayed**; a set-up file not protected.
2. **`judge-structure`** (pure, `judgeStructure`): equal → none; a locked test changed; a helper changed; a file
   added to a closed directory; one added directly in `foundation/tests/` (and one added deeper, in a directory no
   lock names → none); a path with a `node_modules` segment; a protected file gone; a lock-tool file changed; one
   added to `foundation/lock/`;
   `pnpm-lock.yaml` changed; a `foundation:*` script changed, one added, one removed; a changed unprotected product
   file → none.
3. **`lock-command`** (fixture): the lock holds every case with its suite path, the duplicate name with `count: 2`,
   each row of the `each`; it protects the helper outside the subject directory, the set-up file, the fixture file
   started by path, the tool's files and the four always-protected files; two runs give the same bytes; it refuses a
   test that declares a retry, a test file with no case, a relative import that leaves `foundation/tests/`, and a
   running tool that differs from the index.
4. **`verify-structure`** (fixture, no test run happens — shown by `candidate/` never getting a `node_modules`, or
   by the time): a staged change to a locked test → `protected-changed`; to the config; to the set-up file; to the
   lockfile; to a `foundation:*` script; a staged edit of the piece's lock, and of the inventory → `locks-touched`;
   a lock file that is staged and not committed → `LOCK_REFUSED`; with `--rev`, a history where one commit changes a
   lock and a product file → `lock-commit-impure`; a later commit that adds another piece's lock alone → no offence;
   an **unstaged** edit of a locked test → not in the candidate, no offence from it.
5. **`verify-run`** (fixture, real install and real runs): the untouched candidate → `LOCK_GREEN`, exit 0, with the
   candidate's tree id; a staged `.gitattributes` that marks a locked test `export-ignore` and a product file
   `export-subst` → still `LOCK_GREEN` (the copy is the blobs' bytes); product staged so that the value case fails →
   `case-not-passed`; the skip case →
   `case-skipped`; the early return → `case-not-passed`; a shorter list → `case-missing`; a longer one →
   `case-unknown`; product that calls `process.exit(0)` when imported → red (`result-missing`); product that leaves an
   unhandled rejection → red with every case passed (`run-errors` or `exit-nonzero`); **product that writes a green
   result captured from an earlier run to the result path and exits 0 → `result-stale`**; the work directory is gone
   after each run.
6. **`verify-judge`** (fixture): a staged change that makes the candidate's own tool print `LOCK_GREEN` for
   everything → still `LOCK_RED` with `protected-changed foundation/lock/…`; an unstaged edit of the fixture's tool,
   run through the fixture's own entry → first line `JUDGE extracted`; the untouched one → `JUDGE in-place`.
7. **`verify-all`** (fixture): a piece owed → `lock-owed`, `LOCKS_RED`; a lock the inventory does not name →
   `lock-unlisted`; all present and green → `LOCKS_GREEN`; no inventory → `LOCK_REFUSED`.

A test never recomputes its expected value the way the code does: each planted offence has its kind spelled in the
test. Piece 1's tests are not edited — its static search over `foundation/**` (`no-old-address`) must stay green
with this piece in place, as it is.

## 7a. What the tests pinned beyond §4–§6 (the test hand's readings and the lead's additions, all accepted)

- **One offence per fault, the most specific kind.** A skipped case is `case-skipped` and not also `case-not-passed`;
  a case that passed on a later try is `case-retried` alone. With no result, a malformed one or a stale one, only that
  one kind is said — no `case-missing` per locked case is made up from nothing; a non-zero exit is still said beside it.
- **Paths in a result** (`file`, `setupFiles`) are repository-relative, as in the lock. The result file is JSON of
  `RunResult`.
- **The set-up files** are `setupFiles` and `globalSetup` alike; the fixture's is a `globalSetup`, loaded in the
  runner's own process.
- **The verdict's fields:** `candidate=` is the full tree id; `lock=` the commit's full id or a beginning of it no
  shorter than seven characters; the `JUDGE` line names the same commit.
- **"From the lock commit to the base" includes the lock commit itself**: the piece's own lock made again and committed
  together with the product change it was made for is `lock-commit-impure`. Its detail is `<commit> <path>`.
- **`verify --all`:** a `lock-unlisted` piece makes the whole `LOCKS_RED`, exit 1; pieces are verified in the
  inventory's order; a piece with `"lock": false` is not owed. `red=` counts the pieces verified red, `owed=` the owed.
- **`lock`** run again on an unchanged index writes the same bytes and leaves `git status` empty; a refusal leaves
  the standing lock file as it stood. A declared `repeats` is refused like a declared `retry`.
- **A structural offence stops before the install** — shown by a `pnpm` on the PATH that would note being started.
- **`relativeImports`** finds static, type-only, effect-only, multi-line, export-from and literal dynamic imports;
  **`serializeLock`** does not depend on the order of keys or lists.
- **`lock-inconsistent`** is said beside `protected-changed` when a hand-edited lock was committed.
- **A `NOTE runner-name <path>:<line>`** is printed for a product line that spells `vitest`, and the verdict stays green.

Found by the test hand's measurements and taken into the contract:
- `pnpm` started in a directory whose root package file names no package manager is whatever version the machine last
  knew (11.22.0 here, which refuses the offline work); the repository's root `package.json` names 11.10.0 and the copy
  carries it. The root `package.json` beyond its `foundation:*` scripts is not protected — it is the old system's file
  too — so a changed `packageManager` is caught only by the lead's reading of the diff (§8).
- The home directory is itself a pnpm workspace: an install in a copy without a workspace file walks up to it and
  exits 0 having installed nothing. The workspace file is protected, so a candidate cannot lack it; and **after the
  install the runner (`foundation/tests/node_modules/.bin/vitest`) must exist in the copy, else `install-failed`.**

Pinned by no test — these rest on the lead's reading of the code: a lock-touching commit with two parents;
`install-failed` and `lockfile-changed-by-install`; `--keep`; `lock` given something that is not a directory under
`foundation/tests/`, or an index with unmerged entries; a set-up file outside the copy; the removal of the work
directory on a signal.

## 8. Known limits, said before the build

- Whoever can change the entry the lead starts, in the working tree and unstaged, can make it print anything; the
  lead starts it from a tree whose `git status` it has read. The judge's extraction closes the staged route only.
- The result file and its nonce are within reach of code running inside the test process. A replay of an old result
  is refused; a forgery written by product code that reads the run's own nonce is §5 step 7's limit.
- The store pnpm installs from is trusted; a package patched in the store is not seen.
- The root `package.json` is compared only in its `foundation:*` scripts. What else it says and the install obeys —
  `packageManager` above all — is the lead's reading; what it says about dependencies must agree with the protected
  lockfile, or the frozen install fails.
- A change to the lockfile, the workspace file, a `foundation:*` script or the tool turns every lock red until the
  lead locks again — by design; the lock's printed difference is what the lead reads before committing it.

## 9. Done when

`pnpm foundation:typecheck` exits 0 · the tests of §7 pass whole, and passed red before the code for the right reason
· `pnpm foundation:verify piece-1` and `pnpm foundation:verify piece-2` each end `LOCK_GREEN` on the committed
revision · after the run nothing of `DxB_Foundation` stands and nothing is left under
`~/.cache/dxb/foundation-verify/` · `pnpm install --frozen-lockfile` exits 0 with the lockfile unchanged · the old
`pnpm typecheck` still exits 0.

## 10. After the blind audit (`fable-audit.md`, 2026-11-23) and the first real runs — the contract as corrected

One A (the evidence of §9 was not there) and ten B. All are taken except where a line below says otherwise; where
this section and §3–§7a differ, this section holds. The A was closed by running: `verify piece-2` ended `LOCK_GREEN`,
and **`verify piece-1` ended `LOCK_RED`** — the lock's first real finding, item 1.

Measured for this section (the lead, 03:05–03:25): a workspace package's `postinstall` **does run** under
`pnpm install --frozen-lockfile --offline` (a marker file was written); with `--ignore-scripts --ignore-pnpmfile`
neither it nor a root `.pnpmfile.cjs` hook runs, the whole workspace installs in 0.8 s, `supabase --version` still
answers 2.109.0 and `packages/outbox-executor/node_modules/pg-boss` is there; with the whole install piece 1's two
real-bench files pass in the copy (23 of 23). `git diff-tree --stdin -r -m --root --name-only -- foundation/locks/`
prints a merge commit's id as a bare line, then the paths. No `package.json` of the repository declares a lifecycle
script.

1. **The install is the whole workspace, and runs nothing of the candidate's** (the lead's finding; F2):
   `pnpm -C candidate install --frozen-lockfile --offline --ignore-scripts --ignore-pnpmfile` — no filter. Piece 1's
   bench applies the old chain, which needs an old package's dependency; an install of the foundation's packages
   alone left it out and the real bench could not be made.
2. **The copy is compared with the candidate twice — after the install and after the run** (F2, F11.1). Every
   protected path must still be a file with its blob's bytes → else `copy-changed <path>`; and no file may stand in a
   closed place of the copy that the candidate's tree does not hold there (a `node_modules` segment excepted) →
   `copy-added <path>`. A snapshot the runner writes because none was committed is caught here (F11.4).
3. **The root's install settings** (F2): `.npmrc`, `.pnpmfile.cjs` and `.pnpmfile.mjs` at the root are protected when
   the index holds them at lock time; one the candidate holds and the lock does not → `closed-dir-added <path>`.
   `foundation/tests/vitest.config.ts` sets `css.postcss` inline, so the runner searches no directory for a PostCSS
   configuration (the lead's edit).
4. **What a lock protects is never silently less than what the tests reach** (F3).
   - A relative specifier is resolved as the runner would: the path as spelled; else `.js`→`.ts` and `.mjs`→`.mts`;
     else with `.ts` appended; else `<path>/index.ts`.
   - Followed too, when the argument is a literal: `vi.mock("…")` and `vi.doMock("…")`; `import(/* a comment */ "…")`;
     and `new URL("…", import.meta.url)` when it resolves to a file of the index under `foundation/tests/` (one that
     does not — the repository's root, say — is no import and is passed over).
   - A relative specifier that resolves to no file of the index is printed by `lock`, every time, as
     `NOTE unresolved-import <from> <specifier>`. It is not a refusal: the fixtures spell imports inside strings
     (14 today), and a text search cannot tell them apart. The lead reads the notes before committing a lock.
   - `import.meta.glob` spelled in a protected file → refused at lock time.
   - Every directory under `foundation/tests/` that directly holds a protected file is closed at that level: a file
     added beside a protected helper or set-up file is `closed-dir-added`. Derived from `protected`; no new field.
5. **`lock-commit-impure` lets a lock commit remove what the lock before it protected** (F5): a path is also allowed
   when a lock in the commit's first parent protects it.
6. **A merge that changes `foundation/locks/`** is `lock-commit-impure <commit> (a merge of <n> commits)` — pinned
   by a test now (F6).
7. **`lock` takes its baseline from HEAD** (F7): the previous lock and the reused `dirs` are HEAD's; an index whose
   lock file for the piece differs from HEAD's → refused. The printed difference also says `DIRS added|removed <dir>`
   and `SCRIPT added|removed|changed <name>`.
8. **A protected path must be a regular file** (F8): an entry that is not a blob of mode 100644 or 100755 — a
   gitlink, a link — is not a file the lock can protect → `protected-missing <path>`.
9. **SIGHUP stops the command like SIGINT and SIGTERM** (F9). A `run-*` directory found standing when a command starts
   is said, never removed: `NOTE stale-work-directory <path>`.
10. **The judge is always extracted** (F11.3; the lead's decision): every `verify` writes the lock commit's tool into
    the work directory and starts it; the first line is always `JUDGE extracted lock=<commit>`. Nothing of the working
    tree's tool judges or reports, so nothing can be swapped between a comparison and a use. `JUDGE in-place` is gone.
11. **On red the reader sees why** (the lead): the run carries the runner's default reporter beside the judge's; its
    output goes to standard error with the failing assertion's message.
12. **`NOTE runner-name` searches product paths only** (the lead): not `foundation/tests/`, not `foundation/locks/`,
    not `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`.
13. **Tests added for what nothing pinned** (F10): each refusal of `lock` matched by a word of its reason; a module
    that fails to collect and a declared `.only` refused; the printed difference; `--retry=0` (a locked config that
    retries, a product that fails once → `case-not-passed`, never `case-retried`); the executable bit and a link in
    the copy; a lock file whose `piece` is another's → `LOCK_REFUSED`; the judge's argument given by hand →
    `LOCK_REFUSED`. Left on reading: that a child's environment is exactly `PATH` and `HOME` — piece 1's static test
    forbids spelling a read of another variable anywhere under `foundation/`.

Not built, written down (F4): a lock protects nothing outside `foundation/tests/` beside the files of §4. Piece 6's
expected snapshot (`db/__snapshots__/`) must either lie in its subject directory or the lock be given named paths —
decided in piece 6's contract, before its tests are signed (`../BUILD.md` §6 says so).

Not taken: F10's "recomputes the way the code does" for `git write-tree` — the tests ask git, which is the oracle,
not the tool; and its unreachable refusal in `lockAtTheBase` stays as a guard.

**Limits added to §8 by the audit** (F11): code under test can rewrite the copy and put it back before the run ends —
item 2 sees only what stays; a green verdict on the index is bound to the commit only when the lead ends with
`verify <piece> --rev HEAD` after committing (BUILD.md §5 step 5 says so now); `.git`-level state and the home
directory's git and pnpm configuration are trusted; **the tool cannot be judged by its own lock before it is
committed** — a change to `foundation/lock/` turns every lock red by design, so the lead runs its tests directly,
sees `foundation/tests/` unchanged since the tests' commit, commits, locks again and then verifies.

## 10a. What the tests of the corrections pinned beyond §10 (the test hand's readings, accepted by the lead)

- **A word of each new refusal's reason:** `only` (a declared `.only`), `collect` (a module that fails to collect),
  `import.meta.glob`, `HEAD` (a staged lock file that is not HEAD's), the piece's name (a lock file that says it is
  another's), `extracted` (the judge's argument given by hand).
- **`NOTE stale-work-directory <path>` is said once per command** — the extracted judge does not call the directory
  it was started in stale — and the directory stands afterwards with what was in it.
- **A `new URL` that resolves to no file under `foundation/tests/` gives no note**; "closed at that level" is not
  recursive: a file one level below a protected helper's directory is no offence.
- **The difference** prints `SCRIPT changed <name>` beside `CASE added|removed`, `PROTECTED added|removed|changed`
  and `DIRS added|removed`; a narrowed lock that is refused is not written over.
- **A link carrying the locked blob's id** at a protected path is `protected-missing`, like a gitlink.
- **The fixture** holds a package outside the foundation's scope (`packages/old-chain`, depending on `pg`), an
  executable file and a link; the locked case that needs the outside package is added by the case that tests it.
- Seen by the test hand on the uncorrected tool: the collecting pass ignores `.only`, so `lock` must look at what a
  case declares (`options.mode`), not at what the pass ran.

Still pinned by no test: SIGHUP; the comparison after the install apart from the one after the run (with scripts and
the pnpmfile ignored no way was found for a candidate to change the copy during the install); `install-failed`;
`lockfile-changed-by-install`.

## 10b. After the first verify of piece 2 through its own lock (the lead, 2026-11-23)

`verify piece-2 --rev HEAD` was red on two cases: the piece's tests start the tool, and that tool called the judging
run's own work directory stale. **A run leaves its process id in its work directory (`owner`); the stale note is said
only of a directory whose owner no longer runs, or that names none.** The lead wrote this one correction itself, saw
the affected files green, and made both locks again. The glob rule of §10 item 4 counts a call only
(`import.meta.glob(`), and the one line of `lock-closure.test.ts` that plants it is spelled in two pieces — whole, it
would refuse piece 2's own lock. The 22 unresolved-import notes of the two locks were read: each is an import spelled
inside a string of a test.

**The lock refused the lead, rightly.** The lead committed the two locks together with two evidence logs; both pieces
went red with `lock-commit-impure`. Making the locks again gives the same bytes, so no later commit could move the lock
commit past it: the lead split its own unpushed commit, and the locks went in alone. **Open, owed before the stage
closes (piece 13):** an impure lock commit that is already pushed can be healed only by a change of the lock's bytes
— the tool needs a way to make a lock anew on purpose (the audit's F5 named the same trap for a removed test).
