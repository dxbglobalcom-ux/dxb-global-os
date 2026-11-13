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

## A model's own week — Sol's blind pass over `4834a2d4` (2026-11-13 evening)

GPT-6.1 Sol at xhigh, read-only, the sign-in key's file denied to it; the raw report `sol-week.raw` (kept off git). Fable did not audit (its own week was spent). 2 A, 2 B — all four fixed by one Opus 5.5 high writer, each with a test red before and green after, verified by the lead.

| # | Finding | Outcome |
|---|---|---|
| A1 | The clock judged the fresh record with the time from before the refresh; the child's newer `read_at` made it invalid, and the clock woke a session into Fable's full week. | Fixed: the record is judged at the moment after the refresh. |
| A2 | `urlopen` followed a redirect and carried the `Authorization` header to another host. | Fixed: this one-address reader refuses every redirect (an unknown, no second request). |
| B1 | A refresh that timed out or failed to start returned before the standing record was read. | Fixed: only the refresh's failure is caught; the record that stands is judged as usual. |
| B2 | A direct `--refresh` asked below 80 %. | Fixed: `refresh()` keeps the bound itself (`near()`); with no share known it still asks every ten minutes. |

Stood after attempted refutation: the hook never waits on the network; the 80 % line, the 30-minute age, the model match; 599/600 s and 78/80 bounds.
Tests after the fixes: test-usage.py and test-warm-wait.py pass, effort-warn.test.ts 90; a real `--refresh` and read: `fable 100% · resets 09:00`.
