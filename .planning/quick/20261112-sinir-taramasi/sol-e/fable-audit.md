# Blind audit — commits 866711c1 and 90a0f96e

**Does the work do what he asked? Mostly yes, with five things to fix in this pass and nothing that crosses his gates.** The limits are removed or loosened, and money out, contracts, identity steps, the Islamic boundaries, Law D, B84 and "buying is his" are untouched in every changed sentence I could read.

**What I could not do.** This tree has no `.git`, so `git show` was impossible: I audited the files as they stand, not the diffs. `.planning/quick/20261112-sinir-taramasi/sol-e/` does not exist here (the folder holds only `LISTE.md` and `SOL.md`), and `~/.claude` is denied to me. No test was run.

## Findings to fix in this pass (class B)

**B1 · The spec still says the sentence E5 removed.**
- Verdict: REFUTED (claim: E5 is applied).
- Finding: `HOLDING-OS-MASTER-PLAN/AGENT_ORCHESTRATION_SPEC.md:219` still reads "the maker still delivers its first attempt as the finished work, never counting on the check". `packages/voice/src/prompt-core.ts:211-217` now says the opposite inside the job. The spec outranks code (§1).
- Correction: reword the spec sentence to the hand-over form.

**B2 · The research gate now lets a run out at minute 10 on any GAPS.md.**
- Verdict: REFUTED (claim: only the hard stop went).
- Finding: `gate.py:367` makes `converge` plus a non-empty GAPS.md an honest exit, and `:372-380` then drops every non-integrity check. H16, H19 and H12's declare route all tell the run to write GAPS.md, so a file written to name one shut page releases H2-H8, H12, H15, H16 and H19.
- Evidence: `tests/b46/gate-has-no-hard-stop.test.ts:59-64` pins a pass with zero evidence rows and a one-line GAPS.md.
- Limit of this finding: that it is earlier than the old 18 minutes is my inference from the docstrings, not from the diff.
- Correction: make the lead's ending explicit (a state flag or `research.py close`) rather than inferred from the file, or keep the silence checks (H15, H16, H19) in the kept list.
- A fabricated citation still cannot leave: H1, H9-H11, H13, H14, H18 are never waived (`gate.py:63`, `:372`). No path traps a run: `max_blocks` still opens the exit.

**B3 · "The session works at high" is a request, not a state.**
- Verdict: REFUTED for any session whose saved level is not high.
- Finding: the saved level was left unchanged, and a skill's lift ends with the turn. A report-opened turn below high gets only the dxb-team3 line (`dxb-effort-warn.py:409-411`), so a long job outside that door still falls to medium silently — the failure E1 named.
- Also: a saved level of xhigh or max is told "first action: dxb-effort-high" next to "a complex job runs at xhigh" (`:113-115`). `tests/hooks/effort-warn.test.ts:149` covers only low and medium.
- Correction: set the saved level to high once the other session is done, or print the lift line on report-opened turns too; add the xhigh/max case.

**B4 · The context gate goes silent for good after a compaction.**
- Verdict: REFUTED (claim: once at 50 %, once at 60 %).
- Finding: `.gate-said` is never cleared (`scripts/ops/dxb-context-gate.py:194-202`). After `/compact` or auto-compaction the number falls and climbs again, and nothing is said. The docstring's "context only grows" (`:36`) is false by its own next clause. No test covers a falling number.
- Also: the line says "the status line keeps showing the number" (`:83`), but the session cannot see the status line.
- Correction: clear the thresholds when the number drops below 50; name `dxb-ctx --pct` in the line.
- Stands: no crash path, exit 0 everywhere, garbage or linked state file handled, a session first seen above 60 gets one line, two prompts at once say the line twice at worst.

**B5 · STATE contradicts the board and the ledger.**
- Finding: `.planning/STATE.md:62` still lists the research engine's hard stop and section E as work left. `STATE.md:100-102` keeps the absolute "No construction starts yet" without the "what can be set up now" half, so E8's "written once" is not met — and STATE is what the opening prints.
- Finding: the board's exit condition (`00-BOARD-OPEN-WORK.md:16`) omits B22's synthesis, which STATE names.
- Finding: the same board line says "his word 2026-10-26, restated 2026-11-16". No ledger entry of 2026-10-26 carries it, and the restatement is the list's wording, not his (the ledger's own condition).
- Correction: rewrite STATE Next 0 and 9; cite the right entry; say "reworded", not "restated".

**Smaller, same pass**
- `dxb-research/SKILL.md:26` says "no clock ends a run". The hunters' `timeout`, the 80 % time-up, the writer's clock and the split's fixed 120 s/300 s (`fleet.sh:400`) still do.
- `--split-effort` is passed (`fleet.sh:401`) but no test pins it. A higher level can time out under the unsettable 120 s and fall back to one sub-question.
- `STATE.md:92` and the ledger's E7 summary say resolution is the job's. `B43.md:25` correctly keeps "on his word" and the 1080 UGC ceiling. Align them to B43.
- E13's "re-measure for Fable 5.2" is recorded nowhere. Removing the 60 % refusal goes beyond the Öneri column; it stands on his 10 Nov and 16 Nov words but should be told to him by name.

## Stands after attempted refutation

- **E2:** the title and long form are gone, and the reminder is still on every prompt as his 4 Oct word requires. Whether the five behaviours are word-for-word the old ones is UNVERIFIED.
- **E4:** `dxb-team3/SKILL.md:84-87` keeps scope, money and architecture going back to him.
- **E6:** `B28.md:44`, `B43.md:112` and ScrollCraft rule 2 (`tools/scrollcraft/skill/SKILL.md:41-43`) name the paid engine with its price; nothing is spent, no engine is re-added.
- **E9, E12, E14:** each matches the list's wording; `personas_author_check` is untouched and the lead signs.
- **B7, B9, B10:** the door's minute limits are gone; `--sub-questions`, `--audit-effort`, `--claim-cap`, `--crowd-cap` reach their scripts.
- **Law B and markers:** no acceptance claim found; the ledger entry says his eye is owed. Every marker I met resolves to an entry whose words carry the sentence, except the board date above.

## Older than this work (class C)

- `personas/data-ai/prompt-context-engineer.md:55` still says the chief engineer writes personas in person.
- `00-BOARD-OPEN-WORK.md:393` and `B61.md` describe the every-prompt line and the refusal (closed rows).
- `CAPABILITY_ARSENAL_DOCTRINE.md:207` says "come only from", without the naming sentence.
- `tests/hooks/context-gate.test.ts` skips when the battery runs as the sandbox user, so the battery cannot prove the gate.
- STATE's header still says 2026-11-04, opus-5.

## UNVERIFIED — needs the files I could not reach

- `battery.out` and `b46.out`.
- `settings.diff`.
- The two memory notes (E9, E16).
- The installed gate and ScrollCraft skill being byte-equal to their tracked copies.
- What each commit actually changed versus what stood before.
- `fleet.sh` past line 683, which I read only by search.

The opening position lines of §0 are not given: no session-start position was in front of me in this audit.
