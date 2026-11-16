# The limit sweep — the code limits and section E: the blind audit (2026-11-16)

Range: `866711c1` (the research engine: B7-B10, C11) and `90a0f96e` (section E). Two auditors, blind, one pass
each, from the same brief: GPT-6.1 Sol at xhigh (12 min, `sol.raw`, kept on disk) and Fable 5.2 at high in its
walled box (9 min, `fable-audit.md`). Fable's box had no `.git` and could not read this folder; it audited the
files as they stood. The battery before the audit: `battery.out`, `BATTERY_GREEN`.

## Findings and what was done

| # | Class | Who | Finding | Done |
|---|---|---|---|---|
| 1 | A | both | Past the converge point any non-empty GAPS.md waived H12, H15 and H19: an untested claim could leave labelled PROVEN, a withdrawn one unnamed — at minute 10, where `closing` had allowed it only at minute 18 | The lead's exit keeps integrity AND honesty (`HONESTY` = H12, H15, H16, H19); the block budget keeps integrity only, as before; each step is paired with its failure so a waived check's step is not printed. 7 new cases, 5 red on the old gate |
| 2 | A | Sol | The context gate read its state file with a plain open: a FIFO under that name held the prompt | Read without following a link, regular file only, non-blocking, bounded; FIFO case: 10 s timeout before, 28 ms after |
| 3 | B | Sol | Two prompts at once could leave `[50]` after the 60 line; `[50,"garbage"]` was accepted | A per-session lock with a bounded wait, an atomic write, the whole list validated; 40 rounds of three prompts at once: one line each (before: two lines in 7 of 40) |
| 4 | B | Fable | After a compaction the gate stayed silent for good; the line named the status line, which a session cannot see | A threshold the context is now below is forgotten; the line names `dxb-ctx --pct` |
| 5 | B | both | A session saved at xhigh was told to open high first; the xhigh step had lost "before the thinking"; "code is high" beside §2's short-code exception | The lift sentence only below high; xhigh "opened first, before you think"; the code clause names the exception; dxb-team3 §2 agrees |
| 6 | B | both | A28 still said "delivers its first attempt as the finished work" | A28 carries the hand-over form |
| 7 | B | Sol | Two living persona texts still said the chief engineer writes personas in person | `personas/data-ai/prompt-context-engineer.md`, `personas/README.md` carry the author / draft distinction; the persona ruler 16/16 |
| 8 | B | both | STATE still listed this work as next; item 9 kept the absolute sentence | STATE rewritten; item 9 points to the board's head |
| 9 | B | Fable | The board line said "his word 2026-10-26, restated" (no ledger entry of that date; the wording is the list's) and left B22's synthesis out of the exit condition | Reworded; the synthesis is in the condition |
| 10 | B | Fable | STATE and the ledger said "resolution is the job's" where B43 keeps the 1080 UGC choice and "on his word" | Both aligned to B43 |
| 11 | B | Fable | "No clock ends a run" beside fixed stage clocks; `--split-effort` unpinned and its 120 s clock unsettable | `--split-timeout`; the door says every number is a default; the split's launch is pinned by a test |
| 12 | C | Sol | Three media-studio personas carry the four-step rule, the 1080 ceiling without its UGC scope, "free road measured first" | Left: older than this work; named in STATE for the persona rebuild |
| 13 | C | Fable | Closed rows (board :393, B61) describe the every-prompt line and the refusal; `CAPABILITY_ARSENAL_DOCTRINE.md:207`; the context-gate test is skipped inside the sandboxed battery half | Left: history rows; the test runs on the host half |

Stands after attempted refutation (both): money out, contracts, identity steps, the Islamic boundaries, Law D,
his eye on every site job, "buying is his" and the licence rule are not loosened; no acceptance is claimed; all
72 CEO-OK ids in the diffs resolve; a fabricated citation cannot leave the research gate by any exit.

## Left open, said plainly

- A fall and a climb of the context that both happen inside one long turn are invisible to a prompt-time hook.
- H16 reads only that GAPS.md exists, not that it names the shut pages (older).
- His saved effort level was not changed (another live session set it to low at 14:26); he was asked.
- ⚠ UNVERIFIED — requires human-eye confirmation: the hooks' lines as a live session shows them past 50 % and
  past 60 % (measured only through the test harness and the installed file's byte-equality).
