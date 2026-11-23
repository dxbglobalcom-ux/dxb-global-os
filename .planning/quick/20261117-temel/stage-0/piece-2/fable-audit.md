# Audit — B85 · stage 0 · piece 2, the test lock (blind, read-only)

**What I could and could not do.** This copy at `/home/dxb/work` has no `.git`, no `node_modules`, no network and no Docker. Everything below is from reading; nothing was run. Whatever needs git, pnpm or vitest behaviour is marked UNVERIFIED with the one command that settles it. Part 0 (conditions and risks, written before the code) is above.

## Does it do what was asked?

**Yes in substance.** Each offence BUILD.md §6 names is implemented and reaches a verdict, and I found no false green through the protected set as locked, the case identity, the nonce, or a staged change to the tool. The holes are at the edges: the done-evidence, what the install executes, what `lock` silently leaves unprotected, and one history rule.

## Findings

### F1 — A · The piece's own "done when" has no raw output
- **Claim:** SPEC §9 — `verify piece-1` and `verify piece-2` each end `LOCK_GREEN` on the committed revision, nothing is left under `~/.cache/dxb/foundation-verify/`, the frozen install leaves the lockfile unchanged, the old typecheck is still 0, and the tests were red before the code.
- **Verdict:** UNVERIFIED.
- **Finding:** `piece-2/evidence/` holds two files: `lock-tests-on-the-code.log` (a direct vitest run, 166 passed) and `typecheck-code.log`. There is no output of either real `verify`, and no red-before-code run. Piece 1 has a `done-when-*.txt`; piece 2 has none.
- **Why it blocks:** the real path is exercised by no test. Every fixture lives under `/tmp` and every extracted judge under `~/.cache`. The real repository is `/home/dxb/DxB Global OS` (the log's `RUN` line), so the in-place judge hands vitest `--reporter=/home/dxb/DxB Global OS/…/reporter.mjs`, a path with spaces. That, the 319 MB copy, and piece 1's Docker tests under a PATH+HOME-only environment are proven nowhere.
- **Correction:** run and save, at the committed revision: `pnpm foundation:verify piece-1 --rev HEAD`, the same for `piece-2`, `ls ~/.cache/dxb/foundation-verify/`, the frozen install with `git status`, `pnpm typecheck`, and the red run at `094046ca`.

### F2 — B · The install runs candidate-controlled code, and the copy is never re-checked
- **Claim:** the tree judged is the tree run.
- **Verdict:** REFUTED by reading; pnpm's part is UNVERIFIED.
- **Finding:** `runner.ts:32` runs `pnpm install` with no `--ignore-scripts` and no `--ignore-pnpmfile`. Afterwards only three things are checked (`runner.ts:33-39`): the exit code, that the runner exists, and the lockfile's bytes. The structural check ran earlier, on git.
- **Scenario:** a writer adds `"scripts": {"postinstall": "node src/prep.mjs"}` to `foundation/bench/package.json`. That file is product, unprotected, and matched by the `@dxb-foundation/*` filter. The script rewrites `candidate/foundation/tests/<dir>/x.test.ts` so each case keeps its name and asserts `true`. Structure is clean, every locked case "passes" by file, suite, name and count, and the verdict is `LOCK_GREEN`.
- **Same class, each UNVERIFIED:** a root `.pnpmfile.cjs` or `.npmrc`; a `postcss.config.*` anywhere from `foundation/tests` up to the workspace root, which Vite loads in the runner's main process.
- **Not named in §8:** it is neither "code inside the test process" nor the root `package.json`, and the runner-name note does not look for it.
- **Correction:**
  1. A structural offence when a manifest the filter selects declares `preinstall`, `install`, `postinstall` or `prepare`, or when a root pnpmfile exists.
  2. After the install and again after the run, re-hash every protected path in the copy against the lock and refuse additions to closed directories.
  3. Name what remains in §8.
- **To measure first:** whether pnpm 11.10 runs workspace lifecycle scripts under `--frozen-lockfile --offline --filter`. A fixture with a `postinstall` that touches a file settles it.

### F3 — B · `lock` silently protects less than the tests reach
- **Claim:** SPEC §4 — the relative-import closure is protected; "a path too many, never one too few" (`imports.ts:16`).
- **Verdict:** REFUTED.
- **Finding:** `imports.ts:50-54` does not follow a relative specifier whose target the index does not hold, and `making.ts:76-78` refuses only imports that leave `foundation/tests/`. Nothing is said.
- **Scenario:** a locked test writes `import { h } from "../shared/helper.js"`. This passes NodeNext typecheck and Vite resolves it to `helper.ts` (from knowledge, not run here). The closure looks for `foundation/tests/shared/helper.js`, finds nothing, and moves on. `helper.ts` is unprotected, a writer edits it, and the verdict is green.
- **Also missed outside the subject directory:** `import(/* @vite-ignore */ "../x.ts")`, `vi.mock("../x.ts")`, `import.meta.glob`, and a file started by `new URL("../shared/x.ts", import.meta.url)`.
- **Today:** no instance. Every relative import in `foundation/tests/**` ends in `.ts` and stays inside its closed directory (grep).
- **Correction:** refuse at lock time any relative specifier whose target the index does not hold; close every directory that holds a protected helper or set-up file; add a test for each.

### F4 — B · An expectation file outside `foundation/tests/` cannot be locked
- **Verdict:** REFUTED as a forward gap; neither closed nor named in §8.
- **Finding:** `making.ts:17-25` accepts subject directories only under `foundation/tests/`, and a path read by `readFileSync` is never protected. BUILD.md §4 puts piece 6's expectation at `db/__snapshots__/os.snapshot.txt`, "committed by the lead, never by a writer".
- **Scenario (piece 6):** the writer changes a function body and the snapshot text in one diff. The locked test compares the two and passes: `LOCK_GREEN`.
- **Correction, before piece 6's contract:** let a lock name extra protected paths outside `foundation/tests/`, or keep the snapshot inside the subject directory.

### F5 — B · `lock-commit-impure` refuses a legitimate lock commit and cannot be healed
- **Verdict:** REFUTED on one case. It fails safe (red), but sticks.
- **Finding:** `structure.ts:13-16` and `judge.ts:95-99` allow a path beside a lock only if a lock in that commit's tree protects it. A deleted or renamed test file is protected by no lock in the new tree.
- **Scenario:** the lead removes `a.test.ts`, re-locks and commits tests with their lock, as BUILD.md §5.3 says. Every piece whose range holds that commit is red with `lock-commit-impure <commit> …/a.test.ts`. Re-locking writes the same bytes, so there is nothing to commit and the lock commit cannot move past it. Only a history rewrite clears it.
- **Correction:** also allow a path protected by a lock in the commit's first parent; add the test.

### F6 — B · The merge rule rests on a git output format nobody measured
- **Verdict:** UNVERIFIED.
- **Finding:** `git.ts:78-79` keeps only lines that are a bare 40–64 hex id from `diff-tree --stdin -m`. If git prints `<id> (from <parent>)` for a merge under `-m`, the line is dropped. A merge that changes `foundation/locks/` would then never be seen, and the "two parents" branch at `structure.ts:25` would be dead. I do not remember the format with confidence.
- **Correction:** run `git diff-tree --stdin -r -m --root --name-only -- foundation/locks/` on a merge in a throwaway repository, then pin it with a fixture test. SPEC §7a already lists this as untested.

### F7 — B (small) · `lock` takes its baseline from the index, not from HEAD
- **Verdict:** REFUTED.
- **Finding:** `lock.ts:28-29` reads the previous lock from the index.
- **Scenario:** a staged, doctored `piece-N.json` with narrowed `dirs` is adopted by the lead's next `lock piece-N` without directories. The printed difference is computed against the doctored file, so the dropped cases never appear as `CASE removed`.
- **Correction:** read `previous` from HEAD; print `dirs` and script changes in the difference; refuse when the index's lock differs from HEAD's.

### F8 — B (small) · Mode and type are never compared
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION — no false green found.
- **Finding:** `git.ts:44` drops the mode and `judge.ts:71-75` compares ids only. A protected path staged as a gitlink carrying the locked blob's id (`git update-index --add --cacheinfo 160000,<id>,<path>`) passes the structure check, and `work.ts:118` then leaves it out of the copy.
- **Impact:** every variant I traced ends red (`case-missing`, an import error, `install-failed`). That is luck, not a rule.
- **Correction:** require `type === blob` and the locked mode for every protected path.

### F9 — B (small) · The work directory survives some deaths of the tool
- **Verdict:** REFUTED for "removed whatever the outcome".
- **Finding:** `cli.ts:51` handles SIGINT and SIGTERM only, and `run.ts:101` starts children detached.
- **Scenario:** on SIGHUP (terminal or session closed during an unattended run) the tool dies. The 319 MB copy stays, and pnpm or vitest keep running in it.
- **Correction:** handle SIGHUP the same way; report (not remove) stale `run-*` directories at start.

### F10 — B · The tests: what cannot go red, and what nothing pins
- **Cannot go red for the rule it names:** `verify-structure.test.ts:95` ("…has no lock commit"). The refusal comes from `verify.ts:77` (no lock at the base); `verify.ts:80-81` is unreachable from it, and deleting those lines keeps it green.
- **Recomputes the way the code does:** `verify-structure.test.ts:46` and every `expectGreen(answer, git(repo, "write-tree"))` take the candidate id from the same `git write-tree` as `git.ts:25`. Only `verify-run.test.ts:65` checks it independently, against `HEAD^{tree}`.
- **Reason not spelled:** `lock-command.test.ts:104-112` accepts any `LOCK_REFUSED`. "A test file with no case" may be refused by "fails to collect" instead (UNVERIFIED which), so the no-case rule may be unpinned.
- **Pinned by no test, beyond SPEC §7a's own list:**
  - `lock`'s printed difference (`lockfile.ts:98-113`), which §8 leans on;
  - "a module fails to collect";
  - `--retry=0`, `--allowOnly=false`, `--passWithNoTests=false` and the reporter's `retryCount` on a real run (`runner.ts:86-89`);
  - children getting exactly PATH and HOME (the fixture only ever starts the tool with PATH);
  - the note for `foundation-verify`;
  - the `--extracted-judge-in` refusals, and `--rev` with an extracted judge;
  - symlink and executable-bit fidelity of the copy;
  - `lock.piece !== piece`.

### F11 — B (small) · Limits that exist and §8 does not name
1. Code under test can rewrite the copy (later test files, `node_modules`), not only the result file.
2. The green verdict is bound to the commit only by the lead's eye: a writer's `git add` between verdict and commit changes the tree. The procedure should end with `verify --rev HEAD`.
3. The in-place judge loads `reporter.mjs` from the working tree after the comparison; always extracting would remove this.
4. Outside CI, vitest writes a missing snapshot and passes (UNVERIFIED). A locked `toMatchSnapshot()` with no committed `.snap` would assert nothing. No test uses snapshots today (grep).
5. `.git/`-level state and `~`-level git and pnpm configuration are trusted.

## Claims that stand after attempted refutation

| Claim | Evidence |
|---|---|
| Lock and lock commit come from the base, never from the candidate or an argument | `verify.ts:75-83`, `git.ts:58-60`; a staged lock is always `locks-touched` |
| A staged or committed tool change cannot judge itself | `work.ts:29-40` compares every tool file; `verify.ts:92-99` extracts; the extracted judge re-checks itself (`verify.ts:95`) and imports only `node:` and its own files |
| `--extracted-judge-in` cannot be abused by hand | `work.ts:101-107` |
| The copy holds the blobs' bytes; no attribute or filter applies | `cat-file --batch`, `work.ts:115-131`, flag `wx`, path-escape check |
| The tree judged is the tree copied | one `entries` list, `verify.ts:45-49` |
| Environment is PATH and HOME; no shell string | `run.ts:25,40,101`; grep finds `process.env` once |
| Removal reaches only what this run made | `work.ts:53-77`; links are not followed |
| Case identity is unambiguous; count, skip, retry, unknown, module, unhandled errors and exit are all judged | `lockfile.ts:20`, `judge.ts:18-54` |
| Replay is refused; a forgery that reads the nonce is the named limit | `judge.ts:30`, `verify-run.test.ts:166` |
| Nested or second configs and workspace files are closed out | `judge.ts:57-60`, explicit `--config` |
| The two locks are whole | piece-2 holds 117 cases, matching the log file by file; both protect all 16 tool files, their own test directory, the config, the package file, the tsconfig, the lockfile and the workspace file; 5 scripts match root `package.json` |
| No company address, key or variable in `foundation/lock` or `foundation/tests/lock` | grep, no match |

**UNVERIFIED for lack of git:** that the three commits touch nothing of the old system beyond root `package.json` and `pnpm-lock.yaml`, and that the locks' blob ids equal `31bdc67a`'s tree. `git show --stat 094046ca f1c13272 31bdc67a` and either real `verify` (which checks `lock-inconsistent`) settle both.

## A and B in one place

- **A — F1:** no raw output for §9: the two real verifies, the cleanliness check, the frozen install, the old typecheck, red-before-code.
- **B — F2:** the install executes candidate code; the copy is not re-checked.
- **B — F3:** an unresolved or non-literal relative import leaves a helper unprotected, silently.
- **B — F4:** expectation files outside `foundation/tests/` cannot be locked (decide before piece 6).
- **B — F5:** `lock-commit-impure` flags a lock commit that deletes or renames a protected file, with no way back.
- **B — F6:** merge detection depends on an unmeasured `diff-tree -m` header.
- **B — F7:** `lock` takes `dirs` and the difference's baseline from the index.
- **B — F8:** mode and type are not compared.
- **B — F9:** SIGHUP leaves the work directory and running children.
- **B — F10:** test gaps as listed.
- **B — F11:** five limits to name in §8.

No C finding: nothing here is older than this work.
