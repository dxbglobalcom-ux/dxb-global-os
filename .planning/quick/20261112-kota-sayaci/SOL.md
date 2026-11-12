# Sol's blind pass — the quota said on every turn, and the door's two paragraphs (commit f333d447)

GPT-6.1 Sol, high, one pass, read-only. Raw output: `sol.raw` (on disk, not in git). No A finding.

| # | Class | Finding | Outcome |
|---|---|---|---|
| 1 | B | The percentage had no upper bound (`101%`, `1e+308% used` were printed), and an integer of 400 digits raised inside `math.isfinite`. | Fixed: a percentage is a finite number from 0 to 100 or the window is not known; the overflow is caught. Tests with raw NaN, Infinity, 400 digits, 101, 1e308. |
| 2 | B | With both windows past their reset — or one reset and one missing — the line vanished, though the docstring says a reset is said. | Fixed: the line is dropped only when both windows are not known. Test. |
| 3 | B | A reset time older than the record itself was reported as "has reset since the record was written". | Fixed: such a window is not known; "reset" is said only when the reset time lies between the record and now. Test. |
| 4 | B | The overflow while reading the quota silenced the whole answer, the text about the level included. | Fixed: whatever fails while the quota is read costs the quota line alone. Test: the level is still told. |
| 5 | B | A test expected exactly `3h00m` from a reset written with a rounded second while the hook floors the minutes — red by the clock. The "text unchanged" tests did not compare the whole text; `1e400` became `null` in `JSON.stringify`, so Infinity was never tried. | Fixed: 30 seconds of margin; a test compares his message's whole text with and without the record; raw-text records carry NaN, Infinity and the 400 digits. |
| 6 | B | The auditor's own copy of the door (`.agents/skills/dxb-team3/SKILL.md`) lacked the two paragraphs; the status line's comment still said the quota reaches no hook. | Fixed: the mirror regenerated with its generator (`SYNC_OK mirror matches source`); the comment says who reads the record now, the installed copy made equal. |
| 7 | B, disputed in part | The door's second paragraph adds two obligations the brief's quotations do not carry (the next brief ready before the hand returns; a hand grown large not continued), and the figures 22 minutes, 400k tokens and 1.5× were not verifiable for the auditor; a list-price ratio is not the Max quota's ratio. | The two sentences stand: they were put to him in those words in the conversation before his "Oldu" (the brief quoted his answers, not the proposal). The figure is rewritten as what it is: a calculation at list-price weights, the quota's own weighting not measured, how large is too large left to the lead. The 22 minutes and the token counts come from the sessions' transcripts, which the audit is denied by design. |

Stood after attempted refutation: the hook never blocks, writes nothing, follows no link, reads at most 4 KB
(FIFO, directory, link, huge file); the twelve report combinations and eighteen comparisons of his message's
text; the six-hour age limit and "min old"; the ledger entry's form, its quotations and the door's marker.
Confirmed by the auditor from the status line's history: 59 % at 16:25:19 UTC, 86 % at 17:09:07 UTC, the same window.

The battery ran on a tree that also held another job's unfinished, uncommitted files (the motion-graphics
friction piece): `BATTERY_RED`, every failing test in `tests/b43/motion-graphics*`; `tests/hooks/effort-warn.test.ts`
passed inside it (71), and after the fixes alone (76; `tests/hooks` 121). The whole battery runs again when that
piece is finished.
