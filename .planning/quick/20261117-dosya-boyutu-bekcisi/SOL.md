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
