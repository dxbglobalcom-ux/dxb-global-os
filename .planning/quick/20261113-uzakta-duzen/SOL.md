# Sol's blind pass over the away arrangement — 2026-11-13

One pass, GPT-6.1 Sol at xhigh, read-only, over commit `4cc678f4`. The report as it came: `SOL-REPORT.md`.
Its verdict: the commit did not yet carry the claim "a session cannot be left with nothing to wake it" —
3 blocking (A), 3 must-fix (B), 3 older (C). All nine are fixed; no second round (dxb-team3 §4).

| # | Class | Finding | Outcome |
|---|---|---|---|
| 1 | A | A live pid whose command line says `dxb-warm-wait` counted as this session's clock — a reused pid or another session's clock passed. | Fixed: the record holds pid, session and the process's start time; the command and the gate hold the same rule; tests for a reused pid and a foreign clock. |
| 2 | A | The last wake could be spent on a turn the quota cannot carry (no reset record, no quota record, the week full). | Fixed: before any waking line there is room in both windows; no room → it sleeps to the reset; no reading → it re-reads each minute inside the process and wakes after 5 h 10 min at the latest. |
| 3 | A | A reset of `Infinity` was slept on for ever. | Fixed: a reset is a finite number, ahead, within its window's length. |
| 4 | B | Claude Code's own row for a failed request counted as a cache-warming turn (in the clock and in the status line). | Fixed in both readers; the parity samples' expected values come from the rule. |
| 5 | B | A clock whose record could not be written slept unseen; two armings could both win. | Fixed: the record is taken under a lock and read back; a failure ends the command at once, exit 4. |
| 6 | B | `run-battery-5.sh` exited 0 when the typecheck failed. | Fixed by the lead. |
| 7 | C | The display call to `dxb-quota` had no time limit. | Fixed: 20 s; the wake never depends on it. |
| 8 | C | A wall clock stepped back delayed the wake. | Fixed: the wall clock or CLOCK_BOOTTIME, whichever comes first. |
| 9 | C | The reset wait could end before the reset (a rounded hour). | Fixed: the record's own reset second, plus two minutes. |

Tests after the fixes: `tests-after-fixes.out` (both files pass). Not provable by a test, and said to him:
the wake by a background command's end and the Stop gate on a live session are proven only by use — this
session ran under the arrangement from 10:54 on 2026-11-13.
