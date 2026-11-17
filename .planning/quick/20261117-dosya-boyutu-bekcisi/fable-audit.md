<!-- The second blind pass: a fresh Fable 5.2 at xhigh (read-only hand), 2026-11-17, its report word for word. What was done with it: SOL.md, second half. -->

# Audit: file-size ratchet (8a8fcd87, c8c27458, f5ae732b)

The guard is correct in every ordinary commit flow and cannot damage files, but it breaks the "records are outside" promise for code-extension files under `.planning/` (A1). Six smaller defects (B1–B6) should be fixed in the same turn. Replayed over history, the accepted rule would have stopped 15.0 % of commits since 1 September; he should see that number.

## How this was run

- **Bench:** throw-away repositories under `/tmp/claude-1000/-home-dxb-DxB-Global-OS/85ae8c2f-94bc-49fe-8e2a-033066f5b449/scratchpad/audit.5X7wbs` (helpers in `lib.sh`, mutation runner `mutate.mjs`).
- **Guard:** run as the repository's own file, and through the real hook path with a copy of `pre-commit`. `diff` of the copy shows two changes only: `19a20` (one log line) and `112c113` (secret scan stubbed).
- **Repository untouched:** HEAD `a4f14861`; `git status -- scripts/hooks tests/hooks` is empty at the end.
- **Deviation on the tests:** I did not run the in-repo vitest command. `/home/dxb/DxB Global OS/vitest.config.ts:105` loads `tests/global-teardown.ts`, which runs CREATE TABLE on the way in and DELETE/UPDATE on the way out (its header, lines 12–14), and I run nothing that writes. I ran the same test file on byte-identical copies (`cmp` clean on all three files) with no global setup. If you need the in-repo raw output, run it and hand it to me.

## Q1 — is anything wrong today

Every case on your list was run.

| Case | Result |
|---|---|
| new file 20,000 B / 20,001 B | exit 0 / exit 1 `YENİ` |
| large file: edit same size, shrink, +1 byte | 0, 0, 1 `BÜYÜDÜ … +1 bayt` |
| move unchanged, move+shrink, move+grow 20 B | 0, 0, 1 |
| copy (also with `diff.renames=copies`) | 1 `YENİ` |
| delete | 0 |
| type change: file to symlink, symlink to large file, new symlink, chmod only | 0, 1, 0, 0 |
| submodule entry `vendor/three.js`, commit present or absent | 0, no crash |
| binary-looking `.ts` (NUL bytes), new and grown | 1, 1 |
| names with space, Turkish, quote, newline, tab, backslash, leading `:` or `-`, Latin-1 byte; `core.quotePath` true and false | 7 of 7 stopped both ways; a newline only breaks the printed line |
| first commit (no HEAD) | 1 for large, 0 for small |
| intent-to-add | guard sees nothing; `commit -a` and `commit -- path` are stopped |
| unreadable blob | 1 `çalışamadı (git okunamadı)` |
| unmerged index without MERGE_HEAD | 0 (git refuses the commit itself) |
| `diff.renames=false` | move still detected, 0 |
| `diff.renameLimit=1` | same basenames 0; new basenames: both `YENİ` (C2) |
| move + rewrite under 50 % similar, 30,000 to 25,000 B | 1 `YENİ` though it shrank (C2) |
| hook: plain commit; `DXB_SKIP_SIZE=1`; values `true`, `0`, empty | stopped; passes with its line; none of the three skips |
| hook: `commit -a`, +3 lines | stopped; hook index `.git/index.lock` |
| hook: `commit -- path` while another session has a large file staged | passes; hook index `.git/next-index-<pid>.lock`; their file stays staged |
| hook: `commit -- path` on my grown or new large file | stopped |
| hook: plain commit or `commit -i` with their large file staged | stopped on their file |
| hook: moved large file, pathspec names only the new path | 1 `YENİ … en az 2 parçaya bölünür` (B4); both paths named: passes |
| hook: from a subdirectory | stopped correctly |
| hook: amend message only, amend with growth, amend of root | 0, 1, 1 |
| hook: shrink by 1,000 then amend to shrink by 900 | 1 `BÜYÜDÜ 29000 → 29100` (C1) |
| stash, pop, commit | 0 hook runs in stash/pop; the commit is judged |
| clean merge, `git revert`, clean cherry-pick, rebase picks | pre-commit is not run at all (0 runs logged) |
| `merge --no-commit`, conflicted merge, `revert --no-commit`, `cherry-pick --continue`, rebase `edit` stop | hook runs, guard stands aside silently (B2) |
| `merge --squash` | judged and stopped |
| both sides under the limit, merge result 20,800 B | passes (C4) |
| manual revert (`checkout <old> -- file`) | stopped; the message names this case |
| worktree at HEAD; MERGE_HEAD in the main tree | judged; not affected |
| worktree based before the guard | every commit blocked (B1) |
| `GIT_DIR`+`GIT_WORK_TREE` from elsewhere; alternative `GIT_INDEX_FILE` | judged; judged from that index |
| repository, hooksPath or `core.worktree` reached through a symlink | judged |
| guard script itself started through a symlinked path | exit 0, silent (B6) |
| size: 1 file; 2,000 new; 2,000 modified; 10,000 new; 10,000 non-code | 0.03 s; 3.5 s; 6.8 s; 18.3 s; 0.05 s (C3) |

## Q2 — can it wreck work

- **A stop destroys nothing.** After the stopped 02:00 commit (+3 lines, pathspec): index unchanged, working file unchanged, 0 lock files, the other session's staged file still staged. The guard only runs `git diff --cached`, `cat-file -s` and `rev-parse`.
- **Three ways out, cheapest first.**
  - Trim three lines elsewhere: +3 lines of fix and −3 lines of comments gave 29,899 B, exit 0. The message forbids comment deletion only inside the split steps.
  - Extract code into a new file: passes (29,728 B). This is a refactor of production code at 02:00 for a three-line fix.
  - The escape: the message offers it only for a rollback ("ör. eski büyük sürüme geri dönüş").
- **Evasions that pass and are not named:** a move into `fixtures/` followed by +50,000 B; a new 80,000 B file under `packages/core/fixture/`; `.min.js`; an extension-less script.
- **`--no-verify`:** no harness rule mentions it (`grep` over `.claude/hooks` and `.claude/settings.json`: no hits). It also skips the secret scan.
- **The stand-aside hole:** on purpose it adds nothing over `--no-verify`. By accident it is real and silent (B2). Exposure is low: 2 merges in 1,971 commits, one worktree, no state file in `.git` now.
- **UNVERIFIED:** how an agent actually reads the message; no agent was run.

## Q3 — is the design right

Replay of the guard's own `verdicts()` over history, read-only (`/tmp/claude-1000/-home-dxb-DxB-Global-OS/85ae8c2f-94bc-49fe-8e2a-033066f5b449/scratchpad/retro.mjs`):

| Measure | Value |
|---|---|
| commits 2026-09-01 to the guard's parent | 1,141 |
| would have been stopped | 171 (15.0 %) |
| by month | Sep 71/429, Oct 45/413, Nov 55/299 |
| worst days | 13 Nov 11/20, 12 Nov 9/14, 17 Nov 8/30 |
| findings | grew 282, crossed 37, new 36 |
| growth size | median +1,429 B; 36 of 282 at or under 200 B |
| stops with every finding in a test file | 57 |
| stops wholly inside the 15 most-hit files | 54 |
| stops with total growth at or under 1,000 B | 47 |

- **The rule:** it is his and it works mechanically. The row told him it stops new bloat "mevcut işi kırmadan" (`rows/all.jsonl:23`); measured, the present way of working grows a large file in one commit of 6.7. Most stops are real growth, where "new code in a new file" is the intended result.
- **The limit:** sensible. 20,000 B is about 423 lines here (47.3 B/line) and sits at the 90th percentile (p90 = 20,848). The 101 files above it are 10.5 % of files and hold 42.1 % of judged bytes.
- **bytes/4:** on a proxy tokenizer (OpenAI `o200k_base`) the code is 3.66 B/token, so the estimate reads 91 % of the proxy count. UNVERIFIED for the model that actually reads the files.
- **Present but not in his words:** the stand-aside (added after Sol); three exemptions that match no tracked file (`node_modules`, `__snapshots__`, `.min.*`).
- **Missing:** A1.
- **Improvements I would make:**
  - Leave a durable trace of every escape. Today it is one stderr line (guard:119–121), so the escape rate cannot be measured.
  - Split the 15 most-hit files as planned work. This is new work and needs his word.
  - Put one line in the `dxb-team3` door. The rule is in no door or CLAUDE.md, so a writer learns it only at commit.
  - Keep one-byte strictness. A tolerance leaks by repetition.
- **Defects:** A1 and B1–B6 below.

## Q4 — can the tests go red for the right reasons

50 mutants run on the temp copy: 17 red, 33 survived. About five survivors are equivalent or dead code: `T` in `had`, `C` in the filter and in `parseRaw`, `--no-abbrev`, the old-mode check. The survivors that change real behaviour are in B5.

## Q5

I do not write a verdict word; an empty A list is the pass. A holds one item (A1), and B1–B6 are same-turn fixes.

## A — must be fixed before it is trusted

**A1 · records are outside the guard**
- **Claim:** "Code only — records, data, migrations, seeds and fixtures are outside it" (`scripts/hooks/pre-commit:103`); "hand-written code only … minified files … are outside" (`scripts/hooks/file-size-ratchet.mjs:12-14`).
- **Verdict:** REFUTED.
- **Finding:** `file-size-ratchet.mjs:31-38` exempts by extension and five path patterns. `.planning/` is not one, and "minified" means only a `.min.` name. A session filing a job's evidence is stopped and told to split a bundle or an evidence copy; it then alters the evidence, leaves it uncommitted, or uses the escape.
- **Evidence:**
  - 190 tracked files under `.planning/` are judged, 9 above the limit.
  - 32 untracked judged files above the limit sit under `.planning/` now (Next.js chunks, Playwright report assets, up to 658,064 B).
  - 83 commits in two months added code-extension files under `.planning/quick`.
  - 7 past commits would have been stopped there, e.g. 6527517d on `evidence/pre-fix/studio.mjs`.
  - Real staged run: `YENİ .planning/quick/20261022-job/playwright-report/trace/assets/defaultSettingsView-BNmKHKpQ.js — 658064 bayt (~164516 token); en az 33 parçaya bölünür`.
- **Correction:** put `.planning/` outside (one pattern, one test line). The reading of "record file" is his; if he meant file type only, this drops to B.

## B — fix now, small

**B1 · worktree based before the guard**
- **Claim:** a guard failure is "said plainly" and the escape lets a commit through (guard:19-20).
- **Verdict:** REFUTED in that worktree.
- **Finding:** `pre-commit:106-107` looks the script up in the worktree's checkout, while the hook comes from the main tree. Every commit there is blocked with a Node stack trace, and `DXB_SKIP_SIZE=1` cannot help because the escape lives in the missing file. Only `--no-verify` works.
- **Evidence:** `commit exit=1 … Error: Cannot find module '$W/w2-wt/scripts/hooks/file-size-ratchet.mjs'`; with the escape: `commit exit=1`.
- **Correction:** call the guard beside the hook (`"$(dirname "$0")/file-size-ratchet.mjs"`). Latent today: one worktree, one branch.

**B2 · the stand-aside**
- **Claim:** it stands aside "while git replays commits that were judged when they were made" (guard:16-17).
- **Verdict:** REFUTED. It passes any commit made while a state file exists (guard:112-115, :125), and prints nothing.
- **Evidence:**
  - A conflicted merge carried `src/smuggled.ts | 1069 +++` (50,000 B, new).
  - A rebase `edit` stop took a 50,000 B amend and a second 40,000 B commit.
  - Another session's `REVERT_HEAD` or stopped rebase let a 60,000 B pathspec commit through.
  - An empty `.git/rebase-apply` or a zero-byte `REVERT_HEAD` did the same, and the empty file was still there after the commit.
- **Correction:** print one line naming the state file whenever it stands aside.

**B3 · step order**
- **Claim:** the step "costs a few milliseconds" (`pre-commit:104`).
- **Verdict:** STANDS for the guard (0.03 s), REFUTED for the step's place.
- **Finding:** it runs at line 106, after the research suite at lines 35-61. The hook's own comment at :49 puts that suite at about 75 s; I did not measure it. 41 of the 171 replayed stops touch the research engine and would wait for the suite before being stopped.
- **Correction:** move (3d) above (3).

**B4 · the message (guard:56-76)**
- **Claim:** the message is enough to act rightly.
- **Verdict:** REFUTED in three places.
  - **Line 74:** the escape names only a rollback, so the urgent-fix case has no stated path. Which cases are legitimate is his or yours to settle.
  - **Line 60:** a moved file committed with only its new path in the pathspec reads as `YENİ … en az 2 parçaya bölünür`. The right action is to add the old path.
  - **Line 67:** "yorum silme, davranış değiştirme" is written identically to the noun phrase "comment deletion, behaviour change". UNVERIFIED that any model misreads it; "silinmez / değiştirilmez" removes the doubt.

**B5 · the tests**
- **Claim:** the tests bite (f5ae732b: "six mutations run, four red, two equivalent").
- **Verdict:** REFUTED for the breakages below; each mutant stays 15/15 green.
  - **In-place edit of a large file reported as new:** real effect `exit=1 YENİ src/big.ts` on a same-size edit.
  - **Unreadable blob counted as zero:** a 30,000 B file passes.
  - **`-M` deleted:** in a repository with `diff.renames=false`, a moved file is `YENİ`.
  - **Four of five replay states dropped:** REVERT_HEAD, CHERRY_PICK_HEAD, rebase-merge, rebase-apply.
  - **New-mode filter removed:** a submodule path ending `.js` gives `çalışamadı`.
  - **Any value of `DXB_SKIP_SIZE` skips.**
  - **`tests/`, `.claude/`, `apps/`, `tools/` or every `*.test.*` put outside.**
  - **Extensions dropped:** tsx, sh, js/mjs/cjs, css. 422 of 959 judged files have an extension no test names.
  - **The message's escape line and its "adding to a large file" paragraph removed.**
  - **The hook:** an early `exit 0`, the step commented out, or its `REPO_TOP` line removed. The wiring test reads text and never runs the hook.
- **Correction:** one assertion for each.

**B6 · symlinked script path**
- **Claim:** the script runs when started directly (guard:117-118).
- **Verdict:** REFUTED through a symlinked path.
- **Evidence:** `via symlinked dir: exit=0 out=''` on a staged 30,000 B new file. Not reachable through the hook: four symlink set-ups were all judged.
- **Correction:** compare `realpathSync(process.argv[1])`.

## C — improvements and known limits

- **C1:** amend after a shrink is judged against the amended commit, giving a false `BÜYÜDÜ`. No cheap fix; write it in the header.
- **C2:** a move plus a rewrite under 50 % similarity, or renamed files under a low `diff.renameLimit`, read as new. `-l0` on the diff closes the second.
- **C3:** one `git cat-file` per file costs 1.7 ms each. The largest past commit has 100 code files, so this is not a problem here; `--batch-check` would remove it.
- **C4:** a merge can take a file over the limit unjudged (19,000 + 900 + 900).
- **C5:** `scripts/hooks/commit-msg:15-16` has the same worktree dependency as B1 and is older. Read, not run.
- **C6:** the Q3 improvements.

## Against SOL.md (read once, after the above)

- **Not in it:** A1, B1, B2's hole, B3, B4, B6, C1–C4, the 15.0 % replay, and the survivors in B5.
- **Disputed:**
  - "records … are untouched" — see A1.
  - "`git revert` itself is let through (the guard stands aside)" — pre-commit is not run at all for it (0 runs).
  - "measuring a symlink" is equivalent — not for a submodule entry: the mutant gives `exit=1 … could not get object info`, the real guard gives 0.
  - "rename detection off → 1 red" — true for `--no-renames` (1 failed), but deleting `-M` survives.
- **Confirmed by my runs:** its A1, A2, B2 and B4 fixes, and the merge stand-aside.

## Tests, last lines (byte-identical copy, no global setup)

```
 ✓ tests/hooks/file-size-ratchet.test.ts (15 tests) 378ms
 Test Files  1 passed (1)
      Tests  15 passed (15)
```
