**Verdict:** the six points are all in the door as agreed, but the commit does not yet do "nothing he did not ask". No A findings; nine B findings, the two that matter being that the hook prints points 1 and 3 to every session with no door scope, and that the auditor's copy of the door was not regenerated.

I could not diff the range (this tree has no `.git`). The before-text comes from the stale copy `.agents/skills/dxb-team3/SKILL.md`; whether the tree I read is exactly a8c06a7e is taken as given.

## B — to be fixed in this pass

**B1 · Claim: the six points stay inside dxb-team3 — REFUTED**
- **Finding:** `.claude/hooks/dxb-effort-warn.py:89-90`, `:96-97` and `:106-107` print "managing … high (the CEO, 2026-11-11)" and the fine-design line on every message and every hand's report, whichever door is open. Only the docstring (`:23`) says "for dxb-team3 only".
- **Scenario:** a `dxb-watch-links` session at medium opens its Opus-medium readers (`dxb-watch-links/SKILL.md:52-53`). Each report tells the lead that managing runs at high, as the CEO's word. That is his word 6 ("başka yerlere yansımasın") broken.
- **Also:** only point 1 was agreed for the hook; point 3 is in it too.
- **Evidence:** `tests/hooks/effort-warn.test.ts:148-157` is titled "dxb-team3 only" and pins the unscoped strings.
- **Correction:** scope the three printed strings to a dxb-team3 job, with a case for the scope words. Point 3 either leaves the hook or carries the same scope.

**B2 · Claim: nothing contradicting the points still stands — REFUTED**
- **Finding:** `.agents/skills/dxb-team3/SKILL.md` was not regenerated. It still has the standing second Opus (`:32`, `:65-68`, `:146`) and the old light lane (`:24-26`), and none of the six points.
- **Evidence:** `dxb-verify/SKILL.md:39` requires `sync-codex-mirror.sh` after a door change, "`--check` must pass". The battery log has no such check on the real mirror.
- **Correction:** run the sync and commit the mirror.

**B3 · Claim: each new test case can go red — REFUTED for one case**
- **Finding:** `effort-warn.test.ts:408-413` (hand's report, level unknown) asserts only "own level is not known" and `Skill("dxb-effort-high")`. His-message text contains both (`dxb-effort-warn.py:82`, `:62`), so the case stays green if the hook gave a hand's report his message's text.
- **Correction:** assert "A hand's report has arrived" and the absence of "EFFORT -- first" and the door line.

**B4 · Claim: every added behaviour has a case — REFUTED**
- **Finding:** there is no case for silence at `max` (`dxb-effort-warn.py:55`; `effort-warn.test.ts:415` loops high and xhigh only). There is none for the line at `low`. The "one line" in the title at `:394` is not asserted.
- **Correction:** add the three assertions.

**B5 · Claim: point 2 sits consistently in the door — REFUTED**
- **Finding:** `.claude/skills/dxb-team3/SKILL.md:135-136` says that on an important job code "is written by Fable 5.2 at high". The same bullet (`:131-134`) and `:198-201` let short code and the `easy-writer` run at medium, and the Team row (`:178`) still says `helper-writer`s at medium. On an important job the door gives two answers for an easy piece.
- **Evidence:** his word 1 says "normalde"; the door dropped it.
- **Correction:** restore "normally", so the lead's judgement decides. No new rule.

**B6 · Claim: "max" is stated consistently — REFUTED**
- **Finding:** `SKILL.md:197` says "`max` is not used", unqualified, while `:156` seats the stand-in planner at max.
- **Correction:** scope `:197` to writers, as §2 `:113-115` already does for the session.

**B7 · Claim: the Lead seat row agrees with the arrangement — REFUTED**
- **Finding:** `SKILL.md:148` now reads "when it writes, it writes the job's spine" (before: "writes what it keeps"). This rests on his word 10 but is not one of the six points. It sits against "Lead — the lead itself" and "four, all equal" (`:171-183`) and "as much as it judges right" (`:164`).
- **Correction:** name the tension and word the row so it describes and does not limit, in line with his words 9 and 11.

**B8 · Claim: the door describes itself and its measure truly — REFUTED**
- **Finding:** `SKILL.md:126` says the hand line prints "in a session below high"; the hook also prints it when the level is unknown (`dxb-effort-warn.py:257`).
- **Finding:** `SKILL.md:86-88` sends the measure to `MEASURE.md`, whose header and columns (`:5-15`) still describe the two-writer measure and call it dxb-team2's.
- **Correction:** add "or not known" to the door; fix the measure file's header or the pointer.

**B9 · Claim: the ledger entry says what his words carry — REFUTED in part** (`scripts/governance/ceo-approvals.json:3114`)
- **More than his words:**
  - "for that door only … (his word)": words 6-7 name no door and sit on the beautifying xhigh item. The door-wide scope is the agreement, and should be marked so.
  - Point 4 "handed by the lead": word 2 says "ben gönderirim", and the `verbatim` has no word of his for it.
  - "as he recognised it": word 10 is not in `verbatim`.
  - "normalde" (word 1) and "belki" (word 1, on xhigh) are dropped, so points 2 and 3 read firmer than he said.
- **Less than his words:** "betik durabilir" (the script stays) is missing. `where` omits the test file and `~/.claude/agents/helper-writer.md`.
- **Correction:** add words 2, 7 and 10 to `verbatim`, mark the scope's source, complete `where`.

## C — older than this commit

- `fable-audit.sh:25-26` refuses a second run in one job folder, so a plan audit and then the commit audit in the same `<job>` (door §1 step 3 and §4) cannot both run.
- `fable-audit.sh:2`, `:7` and `:24` still say Fable 5.1 and accept max; the door says high.
- `model-routing-hierarchy.md:14` has `helper-writer` on Opus 5.5 and `:17` has builder at max, both against the door (the first is known in `STATE.md:55`). Line 14 also carries points 1 and 3 with a pointer to dxb-team3 §2; if this commit wrote that, it belongs in the ledger's `where`.
- `battery.log:825-839` and `:1079-1082`: `BATTERY_RED` from b23 alone. `typecheck.log:2`: `kisayol.test.ts:232` alone. Both are the known ones.

## Stands after attempted refutation

- **Points 1-6 in the door:** light lane `SKILL.md:24-28`, plan section `:66-69` and `:90-95`, §2 `:108-115` and `:135-138`, seats `:150` and `:156`, the one clause `:162-166`. No new rule on splitting work.
- **Scope in other doors:** no 2026-11-11 text in any other skill, the three effort skills, `.claude/CLAUDE.md` or the `.sh` hooks. `dxb-team2` and `second-plan.sh` read as untouched.
- **Hook guarantees:** every exception is swallowed and it exits 0 (`dxb-effort-warn.py:281-286`). It writes nothing. A message quoting the tag is still his (`:256`). The door line is unchanged in his-message branch. It is silent at high, xhigh and max.
- **Hook, one residual:** a message of his that opens with the tag is now told "not his message" below high; before it got silence.
- **Plan audit for one plan:** runnable. `refuter.sh` has `--deny-read`, and `fable-audit.sh:34` binds a hand-made `<job>/blind/`.
- **Tests:** no case recomputes its expectation. `hook-test.log:5-8` and `battery.log:1063` show 60 of 60.

## Unverified

- The seat files in `~/.claude/agents/` (read denied), including the changed `helper-writer.md` line.
- That every `<task-notification>` is a hand's report: a background shell's completion may open with the same tag and would be told "a hand's report has arrived". Not measured in the record.
- The `Plan` agent taking `model` and `effort`: given as measured.
