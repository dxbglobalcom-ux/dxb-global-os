# CEO DIRECTIVE — RULE #0-A: MEASURE, NEVER GUESS (2026-07-15, SEVEREST TIER)

<!-- HISTORY -->

**Filed as its own document on 2026-07-30, and the reason is itself an instance of the defect it
governs.** RULE #0-A had no owning file. Its full text lived inside `.claude/CLAUDE.md` — the
always-on context — while its siblings RULE #0 and RULE #0-B each had a directive of their own.
When the always-on context was reduced under the CEO's context-architecture order, this rule was
the one thing in it that would have been *lost* rather than *relocated*, because there was nowhere
to relocate it to. Found by measuring before deleting. The text below is unchanged.

---

**Guessing and hallucination are DEADLY dangerous to this project.** Before stating ANY fact,
number, status, completion %, or "where is X" answer — to the CEO or in any artifact — the claim
must rest on a measurement taken THIS session. This is not a style preference; a guessed answer
that reaches the CEO is a governance violation of the same tier as RULE #0.

1. **Measure it.** Read the authoritative file, run the command, count the rows — then cite the
   source (`file:line` or `command → output`). No claim without a measurement behind it.

2. **Grep-summaries, memory, prior context, and inference are NOT sources** — they are leads to
   verify, never answers. A grep hit tells you *where to read*, not *what is true*. (This exact
   confusion produced the "project is 88% done — JARVIS may be forgotten" error on 2026-07-15;
   JARVIS was in fact a governed deferral recorded in the registered-adaptation table. Root cause:
   answered a status question from a grep hit instead of reading the ledger.)

3. **For any project-status / completeness / "is X done" / "where is X" question:** read the
   register that owns the answer before answering. What is still open lives on
   `00-BOARD-OPEN-WORK.md`; deliberate deferrals and deviations live in the registered-adaptation
   table in `00-INDEX.md`; where the work stands today lives in `.planning/STATE.md`. A reading of
   the roadmap alone undercounts, because deferred tracks do not appear as roadmap rows.

4. **If you cannot measure it, say exactly that:** `UNVERIFIED — could not measure because
   <reason>`. Never fill the gap with a plausible-sounding guess. "Should be / probably / I think"
   about a checkable fact is a violation.

5. **Prediction ≠ result.** State hypotheses as hypotheses ("this should…"); only measured
   outcomes use the past tense ("this does…").

**RULE #0-A is an EFFORT rule as well as an honesty rule.** Answering from memory, from a grep
hit, from a prior summary or from a subagent's report *instead of* reading the authoritative file
or running the command is the first of the nine forms of laziness — the same violation, arrived at
by not trying rather than by not caring.

Binds every author and every session until the project ends.

---

**Where its parts are operationally applied:** the always-on core (`.claude/CLAUDE.md` §2) carries
the boundary; door `dxb-verify` carries the evidence procedure; `pnpm verify:ledger` enforces it
mechanically over every durable claim in this corpus.
