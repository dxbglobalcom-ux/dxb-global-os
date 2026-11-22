# B85 stage 0, piece 0b-A — the scan findings checked at the source

Paths: rows = /home/dxb/DxB Global OS/.planning/board-rows/<ID>.md · PLAN = .planning/quick/20261117-temel/PLAN.md ·
ORDER = .planning/quick/20261117-temel/reorder/ORDER.md · BOARD = HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md

## Count
Command: grep '^| [BC][0-9]' scan-1/2/4 | grep -E 'NEEDS|UNSURE|[Cc]ontradiction|Tension|tension|vs PLAN|ORDER vs|Row vs' -> 21 table rows.
Minus B34 (false hit: CARRIED, only "see B33's NEEDS") = 20; plus B68 (says "contradicts", scan-2:17) and C40 (listed in scan-4:35
"Contradictions") = 22 rows. Split into sub-findings: B08 x2, B33 x2, B41 x2, B75 x2, B82 x2, B86 x2 -> 28 items. Table below: 28.

## Table
| # | Row | Finding (8 words) | Verdict | PLAN line | Stage |
|---|---|---|---|---|---|
| 1 | B03-bis | Bench CEO principal bound to engineer sign-in? | NOT-FOUNDATION (bench seed row) | 106-107, 724; BUILD.md:51 | 1 |
| 2 | B08 | No model register with status, banned, add door | CONFIRMED-NEED | §2 G 195-201 | 1 |
| 3 | B08 | Precedence order differs, ORDER versus PLAN N.11 | REAL-CONTRADICTION, ORDER stale | 496-498 vs ORDER:47 | 2 |
| 4 | B11 | Hermes model calls and key not placed | ALREADY-CARRIED (principle) | 195, 219-223, 870 | later |
| 5 | B15 | Per-employee autonomy level, classifier does not read it | CONFIRMED-NEED | §2 H 211-217; §2 C 114 | 2 |
| 6 | B28 | Client's post to client, not him, versus A9 | REAL-CONTRADICTION (CEO) | N.9 476-478 | 2 |
| 7 | B31 | Library lacks domain, cost class, price, licence, twin | NOT-FOUNDATION (columns) | 85-88 | 3 |
| 8 | B33 | Card admission by MB, floor, announced mode | ALREADY-CARRIED (shape) | 178-182, 731 | 2 |
| 9 | B33 | Row says pg-boss runs the gatekeeper | REAL-CONTRADICTION, row stale | 190, 399; §10 dec.4 | — |
| 10 | B41(1) | Seat's built-in shell and files have no walls | CONFIRMED-NEED | §2 C 115-119; §5 row 26 678 | 1 |
| 11 | B41(2) | Capability request record and machine-written grant door | NOT-FOUNDATION (new door, existing model) | 75-76, 114 | 3 |
| 12 | B42 | Tool row lacks held version, last-checked date | NOT-FOUNDATION (columns) | 88 | 2-3 |
| 13 | B51 | Shadow price versus "not a made-up euro" | MISREAD / NOT-FOUNDATION | 255-257 | B51's |
| 14 | B68 | Board closing test regenerates seed from live | REAL-CONTRADICTION, row stale (settled ORDER:128) | 55-58 | 0-2 |
| 15 | B75 | Completion contract, 90 %, breaker "stand" versus five questions | MISREAD / ALREADY-CARRIED | 702-704, 263, 151-154 | 1-3 |
| 16 | B75 | Stage records for backup, mirror, nightly runs | NOT-FOUNDATION | 151-154, 190 | beside |
| 17 | B82 | Signed-in X/Instagram session has no home | ALREADY-CARRIED (named open) | 221-223, 798, 413-414 | later |
| 18 | B82 | ORDER says "unchanged", siblings say "design dependency" | MISREAD (ORDER-internal label) | — | — |
| 19 | B86(1) | Foundation change stopped at his approval | NOT-FOUNDATION now (its plan) | 211-217, 320-324 | after 2 |
| 20 | B86(2) | Code job reaching repo and construction engine | NOT-FOUNDATION now (its plan); see #10 | 677 | after 2 |
| 21 | C26 | ORDER stage 3 versus PLAN stage 1 | MISREAD | 767 (not 763), 734 | 1 / 3 |
| 22 | C29 | Library item has no containing-item link | NOT-FOUNDATION (one column) | 85-88 | 3 |
| 23 | C31 | tool_calls does not name the tool row | NOT-FOUNDATION (one column) | 88, 146 | 3 |
| 24 | C40 | Row rests on removed ladderAction; 2x-budget kill | REAL-CONTRADICTION, row stale; kill ALREADY-CARRIED | 674; 182, 393-398 | — |
| 25 | C52 | Deletion must reach the archived copy too | CONFIRMED-NEED | 70-73; 740-741 | 5 |
| 26 | C53 | A turn cannot carry his screenshot | NOT-FOUNDATION (later, cheap) | 379-382 | 3 |
| 27 | C54 | No per-call record of empty capture | NOT-FOUNDATION (voice_calls, B12) | 676 | 4 |
| 28 | C55 | Call phases not on any surface | NOT-FOUNDATION (voice_calls status) | 676, 313 | 4 |

## Evidence per item
1. B03-bis.md:44 "both run with the engineer account on the eye-check copy (:3100) … does a double click write one decision or two."
   The double-decision harm is the forward-only guard with one decision (PLAN:205). The bench's data is generated (CLAUDE.md §5),
   principals are not in stage 0 (BUILD.md:51); stage 1 already needs a real CEO sign-in on the bench for "a decision from someone who
   is not the CEO, with a real sign-in" (PLAN:724). Which sign-in the bench's CEO row binds is a seed choice at stage 1. UNVERIFIED: the
   seed's choice (not designed yet).
2. B08.md:16 "new models addable from the dashboard (§4c drawer)" and step (4) "catalogue + active + not banned + mechanical_only check".
   Grep PLAN: "catalogue" 1 hit (158, the event catalogue); "banned" 0; "model_catalog" 0. PLAN:199 "never a weaker model" needs a
   strength order, which MODEL_ROUTING_SPEC.md:163 keeps in `model_catalog.tier_floor` ("No other place may re-derive quality order");
   :148 banned models are refused re-hire; :120 new model born `testing`. PLAN's run_attempts carry "its model" (198) — the register is
   what they reference. Not named in §2 A's reference data list (55-58) nor §5 row 9 (660).
3. ORDER:47 "his explicit choice, then the seat's default, then the master's per-part choice"; PLAN:496-498 "…after the guardrails…;
   then the master's choice per part, at or above the floor; then the seat's default." git: PLAN sentence from 29099b24
   (2026-11-22 21:40, "found by the board order's blind audit"); ORDER text from 52374cf2 (22:13) unchanged. MODEL_ROUTING §4f
   (158-169) makes the seat's derived brain a floor never lowered, which matches PLAN. Not a CEO matter.
4. B11.md:53 "returns to whoever gave it and is recorded in the holding's runs"; :58 "his Claude subscription is tried first, then a
   Hermes-only key". PLAN:195 "Every carrier of a model passes it" + ruler fails "when a model is called anywhere else" (200-201);
   Hermes parts (134), carrier 2 (219), A11 built with Hermes (222), Hermes not in this job (870). UNVERIFIED: whether Hermes v0.23 can
   call through the loopback LiteLLM route, and that loopback-only (200) fits "on the holding's server" if that is another host.
5. B15.md:34 "the level actually changes what that employee may do without asking"; :16 `agents.autonomy_level`. PLAN "autonomy" 1 hit
   (149, a line's autonomy step); N.9 lift is per job type (477); classifier inputs (213-217) do not include the acting agent. Stage 2
   builds "rules and locked rules" (730). The 2026-11-08 addition (B15.md:18) adds the per-job-type lift; it does not remove line 34.
6. B28.md:70 "A client's post goes to the client's approval, not to his." (leg 2026-11-17; its marker covers placing tab rows, :68).
   PLAN:476-478 "every delivery to a client, the built sample and each revision included, is gated to him until he lifts it for that job
   type" (N.9, his yes 2026-11-22); APPROVAL_ENGINE_SPEC.md:184 A9 (2026-11-08). PLAN is newer.
7. B31.md:17 (five missing fields), :33 "an employee, mid-task, can name the stronger paid tool". Columns on the library/tool row plus a
   self-reference; the proposal goes through §2 H. ORDER:62 stage 3. Later, cheap: no door changes.
8. B33.md:16 "Every worker asks it *I need N MB*"; floor "never leaves the card"; SOLO "never done silently". PLAN:178-181 "Capacity is
   per lane … The studio's hands: the card's real availability"; stage 2 "capacity per lane" (731); ORDER:60 "whether the card's lane
   can be the guests' queue … is this row's trial". A size per part is a later column; a mode-change event is a code vocabulary row (55).
9. B33.md:16 "It runs on what the holding already has: pg-boss." (2026-08-21) vs PLAN:190 "pg-boss runs system routines only", 399.
10. B41.md:26 "Every shell runs inside the sandbox … with no route to either database"; :27 "the repository and the construction's
   ~/.claude are write-denied; the construction's secrets … read-denied". PLAN grep sandbox|bwrap|built-in: 1 hit (388, preview
   sandbox); BUILD.md: 1 hit (99, unrelated). PLAN 115-119 = in-process tool door + env allow-list only; today's
   packages/kernel/src/sdk-isolation.ts sets settingSources/cwd/env, no sandbox (grep). Artifacts are files with paths (137), so a
   shell reaches another client's files past every door (113). Stage 1 tries "a seat asking for another client's desk" (723).
11. B41.md:16 "(1) THE REQUEST … typed record"; "(4) THE GRANT … `library_grants` row"; "Free · no account · no outward call · clean
   scan = the machine may complete all four". PLAN:75-76 one login per service "with EXECUTE on its doors only"; 114 "shared by grant".
   A grant door for one service principal is a new door in the existing model, not a change to one. ORDER:59 stage 3.
12. B42.md:16 "carries the version we hold and the date it was last checked". Two columns on the tool row (88). ORDER:58.
13. B51.md:16 move (2) "a shadow price on subscription work, so cost per finished job becomes answerable". PLAN:256 governs the cost
   row; a derived, labelled estimate on a report (catalogue prices × tokens) is not a booked euro. ORDER:132 gives move 2 to the
   attempt's cost row. UNVERIFIED: whether B51's plan meant a stored amount (its plan not opened).
14. BOARD:147 closing "The seed is regenerated from the live table and a check fails when the two differ" vs PLAN:56-58; ORDER:128
   replaces that closing test with new evidence (his yes 2026-11-22). The board line itself still carries the old text.
15. BOARD:158 "the attempt cap, the circuit breaker, the completion contract and the 90 % budget warning stand"; PLAN:702-704 "Each
   runtime guard that stays (… the breaker …) answers five questions" — answering is not removing; 90 % warning = "warns and never
   stops" (263); completion = the closing law (151-154). grep "completion" 0, "90" 0 in PLAN.
16. B75.md:46 "every job that reports success — the backup, the mirror, the nightly runs — records each stage"; ORDER:131 "the mirror
   (the construction's own tool) … the mirror and the stage records can be done beside the build".
17. B82: plan read via scan only (gozlem PLAN.md:55-59, not opened by me). PLAN:221-223 "where a browser seat's session credentials
   live, is not designed here"; §8 item 9 (798); a write-capable credential's read is "a trusted read operation in the executor" (413-414).
18. ORDER:82 "**unchanged** — not a revenue row" vs ORDER:52/63 "design dependency". Same open item; a label in ORDER, not PLAN.
19-20. B86.md:17 "Not decided: which changes count as 'the foundation itself'; who checks a code job …; how a change is applied … Each
   comes with its plan." ORDER:92 "after stage 2 — its plan first". Note: B41's walls (#10) deny repo write; written per seat role,
   B86's plan can open a code-job role later without retrofit.
21. PLAN:767 "his order's turn carrying the page he is on" is a stage-1 trial of the foundation (scan cited 763); ORDER:93 is when C26
   closes ("three pages, three page-correct answers", C26.md:28) with B32; conversations at stage 3 (734). No conflict.
22. C29.md:28 "Parent/child grouping with the CEO's preferred progressive disclosure". One nullable self-reference on the library item.
23. C31.md:28 "Usage recorded per item". PLAN:88 one truth for a tool; 146 tool_calls. ORDER:97/135 the link at stage 3. Free to
   include when tool_calls is first created; cheap later.
24. C40.md:12 "ours is built and deterministic: … `ladderAction()`"; :44 "`ladderAction()`'s BLOCKED hard stop … end the run". PLAN:674
   removes the ladder (§10 dec. 3). C40.md:44 "(3) a trial past twice its budget killed" — PLAN:182 cuts nothing for "turns, tokens or
   cost"; the loop owner waking on `not_after` (393-398) and issuing a cancel (182 "stop and cancel are control requests") carries it.
25. C52.md:44 "the same rows in the old system's archive, if the conversation was moved" (the boundary table "word for word from the
   order file", his yes). PLAN:70-73 names conversation, turns, day-summary share; 740 "living reference data moves (… conversations)";
   741 history "frozen as an archive". Whether a moved conversation leaves a copy is not said.
26. C53.md:28 "He drops a screenshot into chat and gets an answer that refers to what is in it." Turns (380-381) carry no file. A turn
   attachment (path, hash) arrives with conversations at stage 3; C52's deletion then covers it. Later, cheap.
27-28. C54.md:28 "20 consecutive calls with 0 `empty_transcript`"; C55.md:28 "visible state throughout". VOICE_INTERACTION_SPEC.md:39
   "every call writes `voice_calls`", :138 `idle → listening → transcribing → routing → answering → speaking → ended | failed`, :160
   status column. PLAN:676 "the rest is B12's". UNVERIFIED: PLAN does not say where voice_calls lands in the new chain (row 24, 738-742).

## Proposed sentences (CONFIRMED-NEED)
- B08 -> §2 G after line 197 (stage 1; the add door with B08 at stage 2): "The router chooses only from one model register — his policy
  reference data (§2 A) holding each model's status (testing, active, retired), its banned and mechanical-only flags and its tier
  floor; routing rules, the per-employee choice and every attempt name a register row, and the model door refuses a model that is not
  active or is banned."
- B15 -> §2 H at line 213 (stage 2): "Each agent carries an autonomy level that only his door sets, audited; the classifier reads the
  acting agent's level after the locked rules, so a level may relax a class that is not locked and never a locked one."
- B41(1) -> §2 C after line 119 (stage 1): "A seat's own shell and file tools run only inside a sandbox set per seat role — its part's
  working folder writable, the repository and the construction's home write-denied, secrets read-denied, neither database reachable;
  a seat role without the sandbox is given no shell or file tool."
- C52 -> §2 A line 72 or §6 stage 5 line 740 (stage 5): "A conversation moved at stage 5 leaves no copy in the frozen archive, or its
  deletion removes the archived copy in the same transaction."

## REAL-CONTRADICTIONs
- B28 (CEO): does a client's weekly social content wait for his eye under A9 until he lifts it for that job type, or go to the client
  alone? Recommendation: A9 stands as PLAN N.9 writes it (newest, his registered yes; the row sentence carries no approval of its own)
  and the client's approval is recorded beside it; his per-job-type lift (B15) is the way out. Either answer is a rule row — no
  foundation shape changes.
- B08 (lead, not CEO): align ORDER:47 to PLAN:496-498; MODEL_ROUTING §4f already settles it.
- B33, B68, C40 (row stale, lead): newer PLAN/ORDER text governs; no CEO question.

## Not checked
- B82's plan file (.planning/quick/20261018-gozlem-odasi/PLAN.md) — relied on scan-2's quote.
- B51's plan; Hermes v0.23 provider configuration; db/seed/build-seed.ts design for principals (does not exist yet for the new chain).
- B28 read only at lines 68-72; B33, B41, B42, B51 read at the cited sentences (keyword extraction), not whole.
