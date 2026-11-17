# Plan — B43 as one short contract page

## 1. What is made

1. **The page** — `.planning/board-rows/B43.md`, written anew, in this order:
   - *Mission and vision* — verbatim, with its marker.
   - *What the studio is today* — one paragraph: the road built and accepted by his eye (2026-09-16), the screen not drawn (B32), no client yet (B28).
   - *The rules that stand today* — one sentence each, each with its date and its registered marker, grouped: how a film is made (script → scenes → shots → one timeline; continuity held as an asset) · the engines (our own factory first; the image, video and voice defaults as last set) · the paid road · the assembly lane · his eye and the draft (LAW D) · testimony and the label · the halal screen · what the studio never takes (the exclusion, by pointer to its owner).
   - *The open legs*, in their order, each one line with its plan's path where one exists (the platform-hub plan, the virtual creator, the night content engine, the W14 legs, the desktop tools, the motion-graphics skill, /kisayol).
   - *Owed elsewhere* — what is wrong in another file and fixed there in its own job (the three studio personas' stale rules).
   - *What closes it* · *Done notes* (the heading and the notes kept as they are; `note-done.mjs` goes on appending there).
   - One line pointing to the archive.
2. **The archive** — the whole present file, byte for byte, moved with `git mv` to `.planning/board-rows/archive/B43-full-record-to-2026-11-17.md`. Nothing in it is edited. The sub-folder is outside the flat rulers and outside `note-done.mjs`, as history is.
3. **The ruler** — `scripts/governance/ledger-truth.mjs` reads `.planning/board-rows/` too. The 13 lines it then finds are put right in the same job: where the ledger already holds his words for that line, the line gets that marker; where it does not, the line stops claiming his word (it says what was done and when). No approval is invented.

## 2. The seven places where two sentences disagree — settled by his newer word (LAW A)

The older sentence is not copied onto the page; it stays in the archive. Listed to him with the plan:

| # | The older sentence (line 25) | What stands on the page | His newer word |
|---|---|---|---|
| 1 | the voice is the engine's own, born in the take | the most natural voice: the engine's voice and a clone compared on the same take, the better one used; his ear sets the default | 2026-11-07 |
| 2 | no drawn still is handed to the local engine; Flux plays no part | the real reference frame goes to the image model; Codex's image tool first, Seedream paid beside it, FLUX.2-klein the local fallback | 2026-11-07 |
| 3 | Antigravity through Google AI Pro, $0.00 an image | gone — the subscription was cancelled | 2026-10-18 |
| 4 | the accepted films are one prompt, one take, ≤ 15 s | both roads stand: the single take, and a composite on real footage | 2026-11-09 |
| 5 | the paid road is bought only where the shelf cannot | where a job's quality floor is above our card, the paid engine is named to him at once with its price; buying is his | 2026-11-16 |
| 6 | assembly: FFmpeg / Remotion / DaVinci | OpenMontage is the default lane; video-use when filmed speech needs it; the others are tools under the lane | 2026-11-07 |
| 7 | enlarge to 1080×1920 (the UGC recipe's step 9; "a 1080 ceiling" in the personas) | there is no 1080 ceiling and nothing special to UGC: whether a film is enlarged is asked at that job, after the native draft (LAW D) | 2026-11-17 |

The seven passages the reading could not class are the lead's to place, none needs his decision: the two measured engine lists of August and September (what is hostable; why H3 first) are history and go to the archive, the page naming only the default as last set; amendments (i) and (j) are carried into the rule that cites them, in one sentence; "working practice born on this row" is marked on the line itself as not his law and stays in the archive; two restatements of rules owned by a door are not copied, their owner is named.

## 3. The steps, in order

1. **The table of rules.** From line 25's living spans and from lines 26-240, one row per rule: the sentence, its date, its marker, where it came from. A rule whose newest dated wording is elsewhere in the file takes that wording.
2. **The map.** Every living span of the reading gets exactly one of three ends, written in a table in the job folder: *on the page* (which sentence) · *superseded* (by which word, which date) · *owned elsewhere* (which file). No span is left without an end.
3. **The draft page**, in the job folder, from the table.
4. **The checks before anything moves** (§4).
5. **The move**: `git mv` to the archive, the new page written in its place, the board row's pointer and the six files that point into the old sections corrected to where the sentence now is (the page, or the archive) — one commit.
6. **The ruler**: a test first — a row file with an unregistered claim passes today, red — then the scope widened and the 13 lines put right; its own commit, `records(ruler): …`.
7. **One blind audit** over the commits; its findings fixed; the rulers run again.
8. **The records**: his word on enlarging and his yes to this plan into the ledger; one dated note on the board row; STATE.

## 4. How it is verified

- The archive is the old file: `sha256sum` of the archive equals that of `git show HEAD:.planning/board-rows/B43.md`.
- No marker is lost or invented: every CEO-OK id on the page is in the ledger; every id of the old file is in the archive (by the first check) — and the list of ids that are on the page against those only in the archive is in the job folder.
- No living rule is lost: the map of step 2 has no span without an end; the auditor is given the reading, the archive and the page, and asked for a rule that stands today and is on neither the page nor an owner.
- No superseded sentence came back: the seven older sentences of §2 are searched for on the page — none found.
- The pointers resolve: every path and heading the board row and the six files name exists.
- The tools still work: `node scripts/board/note-done.mjs` on a temporary copy appends under `## Done notes`; the records ruler and `tests/b43/records-truth.ts` pass; `ledger-truth` exits 0 with the row folder in its scope; the ruler's new test is red on the old ruler and green on the new.

## 5. The risks

- **A rule that stands is dropped in the shortening.** Held by the map (every span has an end) and by the blind audit reading the archive against the page. The archive keeps everything, so a loss is repairable, never final.
- **A choice between two sentences that is not his.** The seven are named to him before the work. An eighth met during the work is settled by the lead only when a later dated word of his settles it plainly; otherwise the work stops at it and it goes to him.
- **The page narrows the mission.** The mission stands first and verbatim; a rule is written as it was said, not tightened; nothing new is ruled.
- **The widened ruler stops other sessions' commits.** The 13 lines are put right in the same commit that widens it; the ruler is run on the whole tree before the commit.
- **The page grows back into a journal.** The row law already says a note, not a story: finished work becomes one dated line under Done notes.
- **Not touched, so still wrong after this job:** the three personas' stale rules (their own job), named on the page under *Owed elsewhere*.
