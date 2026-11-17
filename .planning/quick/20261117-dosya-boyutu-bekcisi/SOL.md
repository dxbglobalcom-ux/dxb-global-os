# The file-size ratchet — Sol's blind pass and what was done with it (2026-11-17)

Audited on his word of the same day ("Sola denettir"): GPT-6.1 Sol, high, one blind read-only pass over commits
`8a8fcd87` and `c8c27458` (`scripts/governance/refuter.sh`; brief `sol-brief.txt`, raw answer `sol.raw`, both kept
on the disk and out of git). Sol ran the guard against in-memory indexes; nothing on the disk changed.

## What stood

A new large code file is stopped; a large file can stay the same or shrink and cannot grow; the limit is 20,000
bytes exactly; records, data, migrations, seeds and the board are untouched; the escape works and says so; a
deleted file, a partial stage and a path with spaces or Turkish letters behave; growth in small steps cannot slip
over the limit; the guard changes and deletes nothing.

## Findings and fixes

| # | Finding | Fix |
|---|---|---|
| A1 | A large file that was only moved was read as a new file and stopped. | The staged change is read as git records it (`diff --cached --raw -M`): a moved file's size before is its source blob's. Moved unchanged passes; moved and grown stops. Tested on a real move. |
| A2 | With copy detection on, a copied large file (status `C`) and a type change (`T`) were outside the filter and passed. | The filter is `ACMRT`; a copy is a new file; only regular file blobs are measured, so a symlink or a submodule is not read as code. |
| B (merge) | A hand-made merge commit would count the other branch's large files as new. | The guard stands aside while git replays judged commits — a merge, a revert, a cherry-pick, a rebase. Tested on a real merge in progress. |
| B1 | The exemptions were wider than what he accepted: every `build`/`dist`/`generated`/`vendor` folder, `.d.ts`, `.generated.`; `.mts`, `.scss`, `.sql`, upper-case extensions were not seen. | Those exemptions are gone (the repository tracks no such folder or file); more code types are judged, case-insensitively. `.agents/` stays outside: it is the mirror of `.claude/skills`. A script without an extension is still not seen — written in the file's head. |
| B2 | A size that could not be read became zero and passed. | A size comes from the blob id; a read failure stops the commit with one plain line and names the escape. |
| B3 | The tests took the limit from the code, tried `+4` bytes and not `+1`, and did not prove the hook's wiring. | The limit is written in the tests as plain numbers (20,000 passes, 20,001 stops); real staged cases added (first commit, move, move and grow, copy, merge, symlink, unreadable git); one test reads the hook for the call and its place before the secret scan. |
| B4 | The message told every language to keep a re-exporting entry file, and its advice for a large file would itself grow it; `5001 → 5001 (+0)`; "already large" said of a file that had just crossed. | The message speaks by language, warns against an import loop, says to move out more than is added, prints bytes, and tells "crossed the limit" from "grew". |
| Git failure | A git error printed a raw stack trace. | One plain line with git's own first line. |

## Left as they are, with the reason

- **A revert that brings back a larger old version is stopped** only when made by hand; `git revert` itself is let
  through (the guard stands aside). The decision he accepted is "a large file may not grow"; the escape covers the rest.
- **Node missing from a GUI client's PATH stops the commit** — older than this work: `commit-msg` already needs
  Node on every commit (Sol's C).
- **Two sessions committing in the same working tree at the same moment** can make the guard read an index that
  changed under it — older than this work and true of every hook here (Sol's C); not measured as a real race.
- **`git commit -- <pathspec>` and `-a`** were not run by Sol; every commit of this job was made with a pathspec
  through the real hook and was judged.

## Proof that the tests bite

`mutation-proof.out`: the limit raised to 6,000 → 3 red; rounding down → 1 red; rename detection off → 1 red; no
standing aside in a merge → 1 red; unchanged → 15 green. Two mutations stay green and are equivalent, not gaps:
the `C` filter (the guard asks git for renames only, so git reports a copy as an added file, which is stopped
either way) and measuring a symlink (its blob is the link's target path, never 20,000 bytes).

Tests after the fixes: `tests.out` — 15/15; typecheck clean. No second audit round.

# The second pass — a fresh Fable 5.2 at xhigh, on his word the same evening

His word: "taze bir xHigh aç … Çünkü önemli bir konu." Opened as a read-only hand (`refuter` seat, Fable 5.2,
xhigh), blind: it read this file only after its own findings were final. It ran every case in throw-away
repositories and through a copy of the real hook, and replayed the guard over the repository's history.
Its report is in the lead's session record; what it found and what was done:

| # | Finding | Fix |
|---|---|---|
| A1 | "Records are outside" was not true for code-type files under `.planning/` — a job's filed evidence (bundles, report assets, scripts kept as they were): 190 tracked files judged, 9 above the limit, 7 past commits would have been stopped. | `.planning/` is outside the guard. |
| B1 | The hook looked the script up in the checkout: in a worktree based on an older commit every commit was blocked with a stack trace, and the escape could not help. | The hook calls the script beside itself. Tested with a real commit through the real hook in a repository that has no copy of the script. |
| B2 | Standing aside was silent, and a state file left behind (`REVERT_HEAD`, an empty `rebase-apply`) switched the guard off for every commit. | It says one line naming the state file and that a leftover one must be removed. All five states tested, and that it measures again once the state is gone. |
| B3 | The step ran after the research engine's suite (about 75 s by the hook's own comment). | It runs first, before every ruler. |
| B4 | The message named the escape only for a rollback; a moved file committed with only its new path read as new; "yorum silme" could be read as a noun phrase. | The message names the two cases where splitting now is wrong (an urgent fix, a rollback) and that the split is then written as the next job; tells a mover to add the old path; says SİLİNMEZ / DEĞİŞTİRİLMEZ; forbids the exempt-folder move, the extension change and `--no-verify`. |
| B5 | Thirty-three of fifty mutations survived the tests. | Twenty tests now; `mutation-proof-2.out`: thirteen breakages of the guard and the hook, every one red. |
| B6 | Started through a symlinked path the script did nothing. | Paths are resolved before they are compared. |
| C | Renames under a low `diff.renameLimit` read as new; an escape left no trace. | `-l0` on the diff; every escape is one line in `~/.local/state/dxb/size-escapes.log`. |

Disputed in the first pass and corrected here: `git revert` does not reach the guard at all — git runs no
pre-commit for it; the guard stands aside only for the hand-made forms (`--no-commit`, a conflicted replay).

Left as known limits, written in the script's head: an amend after a shrink is compared with the commit it
amends; a move plus a rewrite beyond git's similarity reads as new; a merge can take a file over the limit unjudged.

## The number he is told

Replayed over the 1,141 commits from 2026-09-01 to the guard's parent, the rule he accepted would have stopped
171 — 15.0 % (September 71/429, October 45/413, November 55/299). 282 findings were growth of an already large
file (median +1,429 bytes), 37 a file crossing the limit, 36 a new large file; 57 stops were wholly in test files;
54 wholly inside the fifteen most-hit files. The limit itself sits at the 90th percentile of code files here
(about 423 lines); the 101 files above it are 10.5 % of the files and hold 42.1 % of the judged bytes.

Tests after both passes: `tests.out` — 20/20; typecheck clean.

## The rule after his decision (2026-11-17 evening, session 256bdf75)

He chose the form that binds the new and leaves the old alone (ledger
`file-size-ratchet-binds-the-new-leaves-the-old-2026-11-17`). A new code file above 20,000 bytes and a
smaller file taken over the limit are stopped; a file that was already above it may grow — one line
names the growth and nothing is stopped. The large files are a closed list.

Replayed with the guard as it stands over the commits from 2026-09-01 to the guard's parent
(`git log --no-merges`, 1,140-1,141 by the minute it is run): the first form stops 165 (14.5 % — the
15.0 % above was measured before `.planning/` went outside the rule), this form 48 (4.2 %; 37 crossings
and 27 new large files among their findings). By area the first form's 345 findings were tests 157,
`.claude` 108, packages 36, tools 22, scripts 21, apps 1 — the foundation and the dashboard are a small
part of them, so the rebuild is not what removes the friction.

Tests: 24 of 24 (`tests/hooks/file-size-ratchet.test.ts`), written red first (5 red); typecheck clean.
Open with him: his "commit hiç durmasın" — the two stops that remain could be a warning instead.

## Sol's pass over the softened rule (GPT-6.1, high, blind; commit 17b82330)

No A. Its raw answer is `sol-2.raw` (on disk, not in git).

| Finding | What it was | What was done |
|---|---|---|
| B1 | A path with a line break in it made the one-line growth note two lines. | A path with a control character is shown and logged quoted (`shown()`); a test grows such a file and counts one line on stderr and one in the log. |
| C1 (older) | "New" and "already large" are read from the commit's last picture, path by path: an already large path whose content is replaced whole in one commit (deleted and rewritten, or a small file moved onto it) reads as that file edited, and under the softened rule may also grow. | Written into the script's known limits. Not closed: git's last picture carries no more. |

It measured, against the previous form held in memory: no commit the earlier form let pass is stopped
now (20 pictures); a copy, a type change, a delete-and-recreate of a small path, a move onto a small
path and a file that shrank and grows back are all stopped; the mixed commit (one grown, one new large)
exits 1. Its own UNVERIFIED: it did not rerun the 24 tests — they are the author's run (`tests-2.out`).

## The count he asked for (2026-11-17 evening)

His word: keep this form, count the stops and the escapes for two weeks, set up so that other sessions
follow it. The guard now writes one line per stop (`size-stops.log`) and per growth of an already large
file (`size-growth.log`) beside the escapes, under `~/.local/state/dxb/`; `node
scripts/ops/dxb-size-report.mjs` counts them against the period's commits (default 2026-11-17 to
2026-12-01). The new tests were seen red against the previous guard (2 of 26) and are green now
(`tests-3.out`: 30 of 30 with the report's four); every test run uses a throw-away HOME, so the real
logs hold real commits only. STATE's Next carries the date.
