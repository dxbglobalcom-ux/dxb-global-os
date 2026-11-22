# Blind audit of B85 §4 — one pass, read-only, nothing written

**Position:** this is a blind audit seat with no injected session position, so none is stated.

**Verdict:** the section does not yet pass its own first question. Its direction holds — one owner, a seat as a few lines, a skill attached by code, the check as a part. But two elements block it, twelve need fixing now, and three points are older than this work.

## Sources I could not reach

- **`/home/dxb/deneme-2/` (OKU.md, logs/TIMES.log):** permission denied. Every A1 figure is therefore the evidence file's, not checked by me.
- **The repository at `/home/dxb/DxB Global OS/` outside the `blind/` folder:** permission denied. I read the same paths in `/home/dxb/work`. Three line citations matched there (PLAN.md:347-349, B85.md:134-137, B64.md:52), but I cannot confirm it is identical to the live repository.
- **`.planning/quick/20261021-dort-yollu-olcum/` and `.planning/quick/20261029-web-ofisi-devir/DEVIR.md`:** not present in that copy. A2 and A3 are unverified at source.
- **The model maker's pages:** not fetched, as instructed. I judged only whether each quote is used for no more than it says.
- **C41.md:** not on my list and not opened. Its quoted sentence I confirmed in the ledger instead (`ceo-approvals.json:2840`).

## Step 1 — written before the plan was opened

The full text stands above this report, written from BRIEF.md and EVIDENCE.md only. Condensed, nothing added:

- **Conditions:** answer the four questions concretely; rest every element on our record or the maker's current documentation; make no standing rule from one remark; decide personas as engineers; stay small; fit the standing decisions.
- **Main risks:** nearly all the evidence is INDICATION; the persona question is confounded with the team question; Section 12 lives only in the persona files.
- **My design:** one master does the coupled work; a second worker opens as a default-with-reason, not a closed list; a seat is one row; the persona files are neither required nor deleted; one fresh blind check; his verdict recorded at its true level.
- **Refused to decide:** whether a persona helps or harms quality, the fix round, three hands, real material as a rule, effort levels, a second auditor on every job.

## Step 2 — the plan against the brief

**Does every element rest on the proof it names?** No, in six places:

| Element | Where the proof fails | Finding |
|---|---|---|
| 2 | The closed list is not the maker's list, and the construction does not run this way | F3 |
| 3 | The "measured cost" belongs to another element | F2 |
| 4 | One-job rejection reasons become standing content | F1 |
| 6 | The maker's figure is misquoted | F6 |
| 7 | An indication is written as a rule | F7 |
| 10 | The verdict it relies on has no place in §2 | F5 |

**Is a standing rule made from a single remark?** Twice: element 8 (F11), and element 4's material (F1).

**Would a job worked this way run well?** It would run fast and cheap, as the single-master runs did. Nothing in the evidence shows it produces work he praises: the single-master record is 2 praised, 3 borderline, 6 okey and 4+ rejected. Its two quality levers, the skill and the brief, are unproven by the plan's own table. The plan says this honestly for elements 4 and 7b, but not for elements 3 and 7a.

**More than the job needs:**
- The real-material rule in element 7 is job-type content.
- The Ultra Code commentary in element 2 is not needed.
- The sentence about "the earlier draft's" removed mechanisms in element 4 is a story inside a plan.
- Element 9 re-proves §3.

**Where my step 1 differs, and which the evidence supports:**

| Point | Plan | Mine | Evidence supports |
|---|---|---|---|
| Opening a second worker | four grounds "and no other" | default, with the master's reason | mine: the record is INDICATION and A27 is not contradicted |
| Personas | archived, question closed on "cost" | not required, question left open, measurement named | the plan's direction, weakly (one uncited run); mine on the ground and the measurement |
| Skills | attached by code | loaded on match plus an index | the plan (the 56 % never-invoked figure) |
| Check | parts per A28 and A32 | one blind check | the plan: it fits the standing decisions |
| Real material | a foundation element | refused as a rule | mine (EVIDENCE.md:98) |
| "Only praised work is a basis" | standing | standing | neither: both rest on one statement of his (F11) |

## Step 3 and 4 — findings per claim

### Grade A — blocks the section

**F1 · Claim: a skill is written from "the reasons he rejected work of that type" (blind/PLAN.md:57-58).**
- **Verdict:** REFUTED against brief condition 3.
- **Finding:** he rejects one advertisement for one reason, or wants no 3D on one site. The reason is "on record", an engineer writes it into that type's skill, and code attaches the skill to every job of the type. The old guard ("only when it holds for every job of that type", PLAN.md:378-379) was deleted with the lesson mechanism, while the inflow stayed. A blind audit of the skill does not catch it, because it checks the skill against the skill's own brief.
- **Evidence:** B64.md:143, registered: "a liking or a rejection on one job stays that job's feedback". The plan's own element 8 says the same.
- **Correction:** drop rejection reasons as material. Or state the test in one line: a reason enters only when the record shows it across named jobs of that type.

**F2 · Claim: "that they cost — measured … the cost evidence decides" (blind/PLAN.md:34-35, 40-42, 110).**
- **Verdict:** REFUTED as stated.
- **Finding:** D measured file size. The 233,397 of 312,470 tokens are nine subagent calls, which is element 2's subject. A persona body is about 5k tokens by my estimate, in a cached system prompt, and no money figure for it exists. So §10 decision 6 goes to him on a ground that is not measured, in the direction of his own lead (condition 4).
- **Evidence:**
  - `prompt-core.ts:65-67, 266-273` shows the persona delivered whole in the cached system layer.
  - The one comparison that isolates a persona on a single master is not cited. It is tek-1 against ekip-1-solo: 16 m 44 s against 43 m 25 s, 1.87 $ against 2.93 $, and he preferred tek-1 "bir tık". That is one run, not blind — an INDICATION.
  - B85.md:120-122 records that his persona view "enters the design as a question the trial's four jobs answer, never as a finding". Two jobs ran, and the team's delivery was never judged.
- **Correction:** state the real grounds. Benefit: no evidence. Persona alone: one weak indication. Team cost: measured, and belongs to element 2. A seat without a character file carries the construction's daily work (E). Then name the small measurement, or say plainly it is an engineering default taken without proof and reversible.

### Grade B — fix now

**F3 · Claim: "four grounds and no other", proven by the maker and by E (blind/PLAN.md:18-24).**
- **Verdict:** REFUTED in part.
- **Finding and evidence:**
  - The maker's four benefits include "specialized instructions". The plan drops it and adds the independent check, yet cites the quote as matching.
  - The quote says "Teams given a budget"; "parallel" is the plan's word. This Opus 5.5 statement also runs against our own Opus 5.5 trials, where teams were 2–5× slower, and the conflict is not named.
  - The construction does not run this way. SKILL.md:173-180 says the lead "is a manager" and hands go "by the work's difficulty". SKILL.md:212-214 says "Writing itself is one of the four, not the default".
  - "No other" silently overrides A27's "domain knowledge it lacks" and "a specialist's checklist" ("examples, not an exhaustive list"), A27's "the studio's whole team", and B84 step 6 (copywriter and motion hand "on the same live page"). The evidence does not contradict these on quality.
- **Correction:** make the grounds a default with the master's recorded reason, which is A27's own mechanism. Or list each standing text overridden, for his word. Fix both quotes and name the conflict.

**F4 · Claim: "PLAN.md §3 stands", and the change list is complete (blind/PLAN.md:96, 113-124).**
- **Verdict:** REFUTED.
- **Finding:** a builder gets two answers. Left standing against the new §4:
  - Lessons proposed at a job's close into the book's notes (PLAN.md:238, 323-324).
  - "Book" where §4 now says "skill" (:121, :231, :298, :319, :430, :484).
  - Personas as shared org and moved reference data (:82, :84-85, :416, :490).
  - The persona gate listed among the sound mechanisms (:11).
  - The stage-1 test asserting the full brief "with the creative demands" (:478-479), which element 7 now marks unproven.
  - In the specs: A27's closing lesson and "filled from the persona pool", A28's `testing-evidence-collector`, A29 item 1's specialist cards, and B84 decision 6 ("Library personas are called by name").
  - PLAN.md:347-349 lies inside §4 itself, so it is not a change "beside §4".
- **Correction:** complete the list and use one term.

**F5 · Claim: "Every run already records … his verdict (PLAN.md §2 D, G)" (blind/PLAN.md:101-102).**
- **Verdict:** REFUTED.
- **Finding:** a search of the full plan for "verdict", "praised" and "okey" finds them only in §4 and the table title. §2 D:134-136 holds the check, his choice, the approval and the delivery. The three-level scale also cannot hold the record: the evidence lists three "borderline" works, which element 7 then calls "liked".
- **Correction:** add to §2 D a verdict on an artifact version — his words verbatim, the date, and a level set only by his word.

**F6 · Claim: on the 5.x models a standing verify instruction "costs about a third more" (blind/PLAN.md:77-78).**
- **Verdict:** REFUTED.
- **Finding:** two pages are merged. Opus 5 says remove the instruction, with no figure. Sonnet 5.5 says stopping self-started reviewers "cut session cost by about a third", on coding at max effort. A cut of a third means half more, not a third more. Neither page is Opus 5.5 or Fable 5.2.
- **Also:** "15 audited jobs" is 14, since the 3 November row reads "Sol not run" (MEASURE.md:25). C covers construction audits only. For eye-facing work our own record is A3, where he ranked both fix-round arms first blind; the plan does not cite it.
- **Correction:** quote the two pages apart, each with its scope. Add A3 as an INDICATION.

**F7 · Claim: element 7, work "does not start from text alone" (blind/PLAN.md:81-90).**
- **Verdict:** REFUTED as a foundation element.
- **Finding:**
  - EVIDENCE.md:98 says the counts are "too small to carry a conclusion".
  - The rule is media and web content, not every job type's (condition 5).
  - The twelve rejected recipe samples are used twice, for two different causes (elements 3 and 7).
  - "A master given one line" is wrong. The brief "asked for five formats and the product's fidelity and said nothing of a new scene" (B43.md:281-283).
  - The first measured cause of that failure was tools: no tool redraws a product from a reference (B43.md:277-280). §4 does not address it.
- **Correction:** the foundation keeps "the brief carries his words verbatim and the job's attached material". The rule moves to the type's skill, labelled INDICATION. Correct the 18 November sentence, and say a seat's tools are part of what it needs.

**F8 · Claim: "Stage 1 settles it" (blind/PLAN.md:63-65, 87-90).**
- **Verdict:** REFUTED.
- **Finding:** one job with one run per arm is an INDICATION by the evidence file's own grading. The brief remedy lives inside the skill, so the arms are entangled. The second measurement has no comparison arm. "If the skill does not help, job types run from their brief and pattern alone" is a standing rule from one run.
- **Correction:** call it an indication, state the arms, and let the first jobs' rows decide.

**F9 · Claim: skills "written by an engineer", proven by "expert-written skills 33.9 → 50.5 %" (blind/PLAN.md:56-59).**
- **Verdict:** UNVERIFIED for our case.
- **Finding:** the stored passage reads "self-generated Skills are below the no-Skills baseline; curated Skills are above it" (`experts/evidence.jsonl:233`). Here the engineer is a model session, so a prepared, model-written, audited skill is neither arm. The same quote also condemns the persona text and removes lessons. "The maker's own form" loads the body when the skill is used; no quote covers forced attachment.
- **Correction:** say whose hand writes the skill. Cite the doors as our own record. Send the attach mechanism to stage 0.

**F10 · Claim: Section 12 "moves, word for word" (blind/PLAN.md:46-48).**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION on the facts; incomplete.
- **Finding:** the heading is present in 213 of 213 files, and the one file I read marks the section "Uniform by design" (`personas/ceo/chief-of-staff.md:130-141`). The text says "this persona" throughout, so it would be addressed to seats that have none. The persona gate is today its only enforcement.
- **Correction:** add three things — his word on the wording, a gate that fails when the standing layer lacks it, and the order (standing layer first, then the files leave).

**F11 · Claim: "Only praised work is offered as an example" (blind/PLAN.md:92-94).**
- **Verdict:** REFUTED as a standing rule.
- **Finding:** it rests on one statement of 22 November. The standing text says "his approved work" (B64.md:143). It also silently drops "base or pattern" against A30's "finished well a second time". My own step-1 line has the same fault.
- **Correction:** one line in §10 asking him.

**F12 · Claim: "half to a fifth of the team's time … a quarter to a thirtieth of its cost, on the same brief" (blind/PLAN.md:12-15).**
- **Verdict:** STANDS AFTER ATTEMPTED REFUTATION on the ranges, with errors in the wording.
- **Finding:** the ratios recompute. The olive log sums to about 100.38 $ (`zeytin-tek-kol/TIMES.log`). But "the same brief" fails for A1, where the team's brief was changed. One time compares against an undelivered run. B84.md:140 gives arm C "1.1 h" where the evidence says "about 2 hours"; I could not settle it. The "not a good fit" quote is dated 2025-06-13, not current documentation.
- **Correction:** fix the wording. Use the current quote in F ("work directly").

**F13 · Claim: three hands is "a mechanism that works"; Ultra Code "has never run here" (blind/PLAN.md:25-28).**
- **Verdict:** STANDS on the citations (B84.md:59; `ceo-approvals.json:2846-2850`).
- **Finding:** the wording exceeds the record. The mechanism ran once, by hand, on pages from three different methods. "Never" is shown for A3 only.
- **Correction:** soften both phrases.

**F14 · Claim: the design covers a job.**
- **Verdict:** UNVERIFIED. Two cases are missing.
- **Finding:** a job type with no skill yet (the "unclear" door; A30's normal job). And a seat's fixed "model and effort" against the master's per-part choice (PLAN.md:188-189; A27).
- **Correction:** one sentence each.

### Grade C — older than this work

- **C1:** the 20.9 KB persona files already break A29 item 14 ("Personas are short and high-signal"). Item 15 orders a re-test when the model changes. That is a standing basis the plan could cite.
- **C2:** B85.md:139 calls the 18 November cause "measured"; it is an inference from one run.
- **C3:** the evidence file's A2 omits the first trial's arms B, D and E (B84.md:140; B64.md:51).

## Note — a better way, said once

One stage-1 run with three arms on the same single master would give the skill and persona indications together, for one extra run: bare, with the skill, and with the skill plus the persona file, judged blind. After that, element 10's rows carry the measuring.
