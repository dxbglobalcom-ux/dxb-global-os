# Job 1 — Sol's audits, and the owed measurement (high vs xhigh on the same diff)

Lead: Opus 5.5 session 58e4dd12, 2026-09-28. Every Sol run went through `scripts/governance/refuter.sh`
with the same blind brief shape (dxb-team2 §5); the construction engine's audit-trail counts were taken
before and after each run and never moved (`audit_log 1795 · tasks 14 · agent_runs 1`). The Plus figures
are `rate_limits.used_percent` read from the newest Codex rollout before and after each run (5-hour
window · weekly); the 5-hour window reset between re-check 1 and re-check 2.

## The side-by-side — first audit of `635e32bc..cf95b743`

| | high | xhigh |
|---|---|---|
| minutes | 5.3 (318 s) | 8.0 (478 s) |
| tokens | 113,913 | 150,503 |
| Plus 5-hour · weekly | 27 → 32 · 4 → 5 | 32 → 40 · 5 → 6 |
| `sql_read` calls | 26 | 26 |
| real findings | 2 B (byte caps; done-list item 7's dead command) | **1 A** (future functions in `extensions` / `supabase_migrations`) + 3 B (both of high's + `--proof` counting any error as a refusal) |
| missed | the A and the `--proof` B | — |
| false alarms | 0 | 0 |
| UNVERIFIED for missing raw output | 6 items (the author's omission, supplied afterwards) | 2 items |

**Result: the critical level stays `xhigh`.** On the same diff `high` missed the one blocking finding and
a green-on-failure proof; `xhigh` found everything `high` found. The price was 1.3 × the tokens and 1.6 ×
the 5-hour share.

## The re-checks (xhigh, each on the fix and what it touched)

| # | fix commit | seconds | tokens | 5-hour · weekly | verdict |
|---|---|---|---|---|---|
| 1 | 3c8517d7 | 352 | 111,176 | 40 → 46 · 6 → 7 | BLOCKS — A: a later SECURITY INVOKER function passed the guard; B: markers outside the byte budgets, cells whole before the cut. `--proof` and item 7 STAND |
| 2 | 10e579a1 | 289 | 73,451 | 46 → 3 (reset) · 7 → 8 | BLOCKS — A STANDS; B: column names outside the answer cap; a cell still crossed whole |
| 3 | f73c5d4a | 293 | 192,238 | 3 → 9 · 8 → 9 | BLOCKS — column refusal STANDS; B: a 16,777,217-byte cell decoded and returned as success |
| 4 | f193f852 | 165 | 67,674 | 9 → 13 · 9 | BLOCKS — refusal STANDS; B: the crossing chunk still reached pg's parser |
| 5 | 79b2b40b | 214 | 74,576 | 13 → 16 · 9 → 10 | **PASSES** |

Every finding was real; none was disputed away. The one design choice the lead defended (Sol's query is
never wrapped in a subquery, because that can change row order and column shape) Sol weighed and did not
refute; the resource bound it asked for was then delivered another way (pg reads from a guarded socket).

## Whole job, Sol side

Seven audit runs (2 first passes + 5 re-checks) = 783,531 tokens; four live trials at medium (the
first ran with `code_mode_host` off and found no tool, which is how that switch was caught) = 20,763 +
22,590 + 35,496 + 16,158 = 95,007 tokens. Plus weekly 4 % → 10 %. Raw outputs: the session scratchpad `evidence/` folder (audit-high.out,
audit-xhigh.out, recheck{,2,3,4,5}-xhigh.out and the logs they were handed).
