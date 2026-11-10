# Audit — `3449ac9d..0948a279`, one blind read-only pass

**Verdict: no A. Nine B findings (three of them small), four C. Three things I could not verify.**

## What I could not do

- **The range itself.** Every read under `/home/dxb/DxB Global OS` was permission-denied. I audited the copy in `/home/dxb/work`, which carries the changed text (`.claude/CLAUDE.md:137-143`) but has no `.git`. Any comparison with `3449ac9d` rests on the nearest older capture, `.planning/quick/20261107-dxb-verify/sol.err:4038-4044` (2026-11-07).
- **The agent files on disk.** `~/.claude/agents/` is denied. `gatherer.md` and `easy-writer.md` were audited from the text in the brief; `helper.md` and `helper-writer.md` bodies were not seen.
- **The rulers.** No shell, so neither `sync-codex-mirror.sh --check` nor the opening ruler was run.

Paths below are relative to the repo root; `SKILL.md` means `.claude/skills/dxb-team3/SKILL.md`.

## Q1 — Does it do what he asked?

**1.1 Claim: everything he asked for is written.**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION for the door; REFUTED for "her açılışta / in talk alike".
- **Finding (B):** A session in plain talk never opens `dxb-team3` and has only the core sentence `.claude/CLAUDE.md:139`, "Every session manages; its hands read and measure". The routing by difficulty, the single-file exception and "brings proposals" exist only in `SKILL.md:152-157`. The core sentence taken alone also pulls against `.claude/CLAUDE.md:90-91` ("Open a file for what the injected text does NOT carry… measure it").
- **Evidence:** No hook in `.claude/hooks` carries the routing (grep for `helper|gatherer|Sonnet|orchestrat` returns only unrelated comments). The door's frontmatter description at `SKILL.md:3` was not changed.
- **Correction:** Carry the routing where every opening sees it. The core has 1 byte left, so either trade bytes there or add half a line to the door's frontmatter description, which is listed at every opening.

**1.2 Claim: nothing is written that is not his word.**
- **Verdict:** REFUTED on three points.
- **Finding (B, small):** The gatherer's `medium` effort (`SKILL.md:143`, `gatherer.md` frontmatter) is not his word. The same day's ledger entry `watch-links-staged-review-trial-2026-11-10` has "Sonnet high" (`scripts/governance/ceo-approvals.json:3110`).
- **Finding (B):** "What comes back is the conclusion, which the lead checks at the points its decision rests on" (`SKILL.md:155-156`) is a new rule. His word and the ledger say only "the lead verifies every piece". See also 2.3.
- **Finding (B, small):** `gatherer.md` adds limits of its own: fixed-string search only (`grep -F`) and re-running every search before hand-over. The first blocks any template that needs a pattern, such as listing every `CEO-OK:` id.
- **Correction:** Tell him the Sonnet level in one line, or leave the level to the brief. Reword 155-156 per 2.3. Change the grep rule to "bounded search; fixed text where it suffices".

## Q2 — Contradictions

**2.1 Claim: the door, the core and his word agree on how much the lead may read itself.**
- **Verdict:** REFUTED (B).
- **Finding:** Four breadths stand side by side:
  - Core `.claude/CLAUDE.md:139`: all reading and measuring goes to hands.
  - `SKILL.md:156-157`: all of it, except one file whose place is known.
  - `SKILL.md:138` (Never column): only "the wide reading or measuring".
  - His word: "böyle çok gerçekten kota yiyecek şeylerde".
- **Scenario:** The lead needs two known files, or one short command. The table allows it; the paragraph and the core forbid it. Meanwhile `SKILL.md:182` ("reads the diff, runs its tests"), `:86-87` and `:220` require the lead to read and measure in order to verify.
- **Correction:** One breadth, stated once, and a clause that verification reading is the lead's own. Recommended: his own measure (what would swell the context), with the single file as the example.

**2.2 Claim: the door says one thing about who writes an easy piece.**
- **Verdict:** REFUTED (B).
- **Finding:** `SKILL.md:155` says an easy piece goes "to an `easy-writer`" (directive). `SKILL.md:186-187`, the ledger and his "yazabilir" say "may". `SKILL.md:164` and `:169-171` keep "Lead — the lead itself" as one of four equal arrangements.
- **Scenario:** A job of six easy pieces. The lead picks the Lead arrangement and writes all six; 159-171 allow it, while 152-155 and "sen kendin iş yaparsan bu session dolar" do not.
- **Correction:** Make 155 "may go". Whether the Lead arrangement stays fully equal after the 2026-11-10 word is his decision, so it needs one line to him, not a silent choice.

**2.3 Claim: what a hand returns is consistent with the seats.**
- **Verdict:** REFUTED (B).
- **Finding:** `SKILL.md:155-156` says what comes back is "the conclusion". The gatherer never judges (`SKILL.md:143`), and its file says "özetlemez, yorumlamaz, öneri yazmazsın". It returns quoted lines, not a conclusion.
- **Correction:** "What comes back is the hand's report — a gatherer's filled template, a helper's conclusion — which the lead checks…".

**2.4 Claim: `easy-writer.md` and the door agree on where a not-easy piece goes.**
- **Verdict:** REFUTED (B).
- **Finding:** The description sends money, gate, security, data-move and parallel pieces to "`helper-writer`'ın ya da liderin işi". `SKILL.md:126-128` says such code "is written at high", `helper-writer` is `medium` (`SKILL.md:140`), and `SKILL.md:184` sends a medium writer's failed piece "to the lead or a fork at `high`". The door never says whether a medium `helper-writer` may take a risk-class piece.
- **Correction:** Either the description says "liderin ya da fork'un", or §2/§3 states what `helper-writer` may take.

**2.5 Claim: the neighbours of the changed lines were brought along.**
- **Verdict:** REFUTED (B, small).
- **Finding:**
  - `SKILL.md:25-26` (light lane) and `:100` (side study) still send all reading to a `helper`; a simple gathering there should now be a `gatherer`'s.
  - `SKILL.md:128` names only the medium `helper-writer` as needing no lift.
  - `SKILL.md:316-319` puts "the prompts for Fable 5.2" into "every brief it gives a writing seat", which now includes an Opus 5.5 seat. This sits against `level-rules-stay-with-their-model-2026-11-10`.
- **Correction:** Name `gatherer` and `easy-writer` in those lines, and say in §8 whether the Fable wording goes to the easy writer.

**2.6 Claim: the new sentences agree with the two ledger entries.**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION.
- **Evidence:** `SKILL.md:186-189` carries both keys, and `ceo-approvals.json:3108` names the replacement of `:3102` for easy pieces. The light lane (`SKILL.md:24-27`, Opus writes narrow glue) now fits better than before.

## Q3 — The core's code bullet

**Claim: the rewording lost no meaning.**
- **Verdict:** UNVERIFIED against `3449ac9d` itself; against the 2026-11-07 text, one narrowing (B, small).
- **Finding:** The old bullet named the fork, `helper-writer` and `builder`, then said "Other subagents… never write", which covered the readers. Now `.claude/CLAUDE.md:139-141` names "its hands read and measure" and then says "Other subagents audit, refute and sweep; they never write". The reading hands are no longer inside the explicit "never write". The door also uses "hands" for writers (`SKILL.md:38`, "the hands write").
- **Not lost:** The seat names (the door owns them, `SKILL.md:178`), "before it is committed" → "before commit", and the date "CEO 2026-09-15" (the marker id carries it).
- **Correction:** "its hands read and measure, never write", paid for by bytes elsewhere in the core.

## Q4 — The two agent files

**4.1 Claim: `gatherer.md` matches its seat and can be worked from alone.**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION, one gap (B, small).
- **Evidence:** Model, effort, tools and `disallowedTools` match `SKILL.md:143` and mirror `helper`. "Never judges" and "a question the template does not settle" are both in the body.
- **Finding:** The write ban covers only "depoda ve ~/.claude altında", while the table and the description say it never writes; Bash can write anywhere else.
- **Correction:** "hiçbir dosya yazmaz, değiştirmez".

**4.2 Claim: `easy-writer.md` matches its seat and can be worked from alone.**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION, apart from 2.4.
- **Evidence:** Model, effort and tools match `SKILL.md:141`. It never commits or widens. Its stop list equals §2's list (`SKILL.md:126-127`). The craft file it names exists and names it (`references/engineering-craft/codebase-design.md:112`).
- **UNVERIFIED:** Whether it should carry §8's second prompt, as the ledger says the writing seats' files do; `helper-writer.md` could not be read for comparison.

## Q5 — The mirror

**Claim: the mirror is in step.**
- **Verdict:** UNVERIFIED — the ruler was not run.
- **Evidence by reading:**
  - `AGENTS.md:5-200` equals `.claude/CLAUDE.md:1-196`, with the banner and the one expected path change at `AGENTS.md:184`.
  - `.agents/skills/dxb-team3/SKILL.md:1-200` equals the source, with the expected change at `:15` and the home paths kept at `:60, :280, :282, :296`.
  - Lines 200-357 of that file, the other doors and `.codex/hooks` were not compared.
- **Correction:** Run `scripts/governance/sync-codex-mirror.sh --check` and attach its line.

## C — older than this commit, or owned elsewhere

- `.planning/governance/model-routing-hierarchy.md:14` still says `helper-writer` is Opus 5.5 `medium` and knows neither new seat. It belongs to the other job; hand it over.
- `references/engineering-craft/SOURCE.md:23` was touched by this commit but still names `dxb-team2` as the door that reads `codebase-design.md`; `:18` does the same for §5.
- `.planning/STATE.md:52` (0c) still says "none started", and the ledger's `where` at `ceo-approvals.json:3108` is in the future tense and names neither agent file. Both are owed when the job is told.
- The Reader seat (`SKILL.md:144`) now overlaps the gatherer and the helper, and the model `scout`/`Explore` run on was not checked against "Opus'la Sonnet'te çalıştırılsın".
