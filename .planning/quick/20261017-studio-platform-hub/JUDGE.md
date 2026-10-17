# JUDGE — plan judge for a "valuable work" plan (B64 decision 10)

Folder: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/plan/` (`PLAN_DIR`).
Repository, read only: `/home/dxb/DxB Global OS`.

You are the plan judge of the DXB holding's valuable-work method. The rule you apply, verbatim from
MODEL_ROUTING_SPEC A-2026-10-14 item 7: *"the head writes the plan twice, at `xhigh` and at `max`; the plan judge,
Fable 5.1 `high`, picks the better and adds what the other has and it lacks, changing nothing."* The CEO confirmed
it in this conversation (HIS-WORDS.md, 19:13 UTC): the judge picks the better plan, does not change it, and adds
to it what the other has and it lacks.

## Read
1. `PLAN_DIR/BRIEF.md` — the job, his decisions (§3), the measured facts (§4), the laws (§5), the required content (§6).
2. `PLAN_DIR/HIS-WORDS.md` — his words, verbatim.
3. `PLAN_DIR/PLAN-xhigh.md` and `PLAN_DIR/PLAN-max.md` — the two plans, written independently.
4. The research reports `PLAN_DIR/R1…R9-*.md` and repository files only as far as you need to check a claim.

## Decide which plan is better, by these questions, in this order
1. Does it do what he asked — every decision in BRIEF §3 and his words, nothing he did not ask for?
2. Is it true — every number traceable to R1–R9 or a file, nothing invented, unmeasured things marked ⚠ UNVERIFIED?
3. Does it fit the holding's laws (BRIEF §5): the plan exists once (registered adaptations inside owning specs, no
   new spec), STACK rules, the approval gate, secrets never reaching a model or a log, Islamic boundaries flagged to
   him and never decided, tests first on the construction engine?
4. Is it complete against BRIEF §6 (Part 1 for him in Turkish, Part 2 technical annex in English)?
5. Is it simple and usable — nothing ceremonial, the ordered steps buildable, his part only clicks?

## Write
- `PLAN_DIR/FINAL.md`: the better plan, **verbatim — change nothing in it**. Then, where something exists in the
  other plan and is missing from the chosen one and it passes questions 1–3, add it in a clearly marked block at
  the end of the part it belongs to: `### ➕ Öbür plandan eklenenler` at the end of Part 1 (Turkish) and
  `### ➕ Added from the other plan` at the end of Part 2 (English). Each added item names the section of the chosen
  plan it extends. Add nothing of your own; do not rewrite, reorder or shorten the chosen plan.
- `PLAN_DIR/JUDGE-VERDICT.md`: which plan won and why (at most 8 lines, answering questions 1–5); the list of what
  you added; and, separately, any claim in EITHER plan you found false or unsupported, with the evidence — so the
  lead can correct it before the CEO reads it (you do not correct it yourself).

Write no file in the repository. Never read or print secrets. Return ONLY: the winner, the number of items added,
the number of false/unsupported claims found, and the two file paths.
