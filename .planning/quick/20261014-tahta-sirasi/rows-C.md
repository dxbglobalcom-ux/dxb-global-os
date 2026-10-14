# Reader C — rows B13 … B58 (step 1)

Read 2026-10-14 by reader C. Source: `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` + `.planning/board-rows/<ID>.md`.

**The one fact that governs this whole file:** none of these 23 rows is open. Every one of them sits in
**Section 5 — "✓ FINISHED AND CLOSED — not the target, kept only to be looked up"** (heading at board line 351,
`<!-- BOARD-SECTION: closed -->` at line 353), on board lines 372-400. Section 1 (open) ends at line 150
(last row B70). Every closing marker below was checked against the ledger: each `CEO-OK` key named in these
rows occurs exactly once in `scripts/governance/ceo-approvals.json` (21 keys, 21 hits, command:
`grep -c "\"<key>\"" scripts/governance/ceo-approvals.json` for each). So every row is "done already" and takes
**no rank** in the construction order; the "Layer" line says where the finished work lives, for the graph only.

---

### B13 — His eye-check of the 27 acceptance criteria of the old (V1) interface
- State: done already — board line 372, Section 5: "✓ CLOSED 2026-08-26 BY THE CEO'S OWN RULING"; key `b13-folded-into-v2-design-package-2026-08-26` in the ledger. The 14 eye-criteria moved into B32 (B32's row names "ACCEPTANCE_CRITERIA §38 (the 14 eye-criteria)").
- Layer: L7
- Stands on: — (closed). Its remainder lives in B32 (open).
- Breathes: no
- Waits on: "—" — true.
- Overlaps: B32 contains its 14 eye-criteria.

### B23 — Keeping the code map of the repository (the graph) fresh
- State: done already — board line 373, Section 5: "✓ CLOSED ON EVIDENCE 2026-08-26", accepted by his eye 2026-08-27 (`six-closed-rows-accepted-by-his-eye-2026-08-27`).
- Layer: L2 (construction tooling, not the company)
- Stands on: — (closed)
- Breathes: no
- Waits on: "—" — true.
- Overlaps: none.

### B24 — The freeze guard that kills orphaned helper processes on this machine
- State: done already — board line 374, Section 5: "✓ CLOSED ON EVIDENCE 2026-08-26", accepted 2026-08-27 (same key as B23).
- Layer: L2 (machine hygiene)
- Stands on: — (closed)
- Breathes: no
- Waits on: "—" — true.
- Overlaps: none.

### B36 — The construction site separated from the company (tests write only to their own engine)
- State: done already — board line 375, Section 5: "✓ CLOSED 2026-08-25 · ACCEPTED BY THE CEO 2026-08-25" (`b36-accepted-by-his-eye-2026-08-25`).
- Layer: L1
- Stands on: — (closed). It is itself a foundation many open rows stand on (every test, every company read).
- Breathes: no
- Waits on: none written — true.
- Overlaps: none. One residue it names (a machine rebuilt from zero gives departments no `dxb-mcp/*` house-bus grants) is pointed to "B43" — see notes.

### B37 — A look-only role can no longer forge an event onto his live screen
- State: done already — board line 376, Section 5: "✓ CLOSED 2026-08-24 · ACCEPTED BY THE CEO 2026-08-25" (`b37-accepted-by-his-eye-2026-08-25`).
- Layer: L1
- Stands on: — (closed)
- Breathes: no
- Waits on: "—" — true.
- Overlaps: none.

### B38 — The live-event collector given a home inside the one resident process
- State: done already — board line 377, Section 5: "✓ CLOSED ON EVIDENCE 2026-08-26", accepted 2026-08-27 (`six-closed-rows-accepted-by-his-eye-2026-08-27`).
- Layer: L2
- Stands on: — (closed)
- Breathes: no (it is the pipe live surfaces stand on, already built)
- Waits on: "—" — true.
- Overlaps: none.

### B39 — How many hands the company works with, its spending brakes, and the rented Hetzner box
- State: done already — board line 378, Section 5: "✓ CLOSED 2026-09-19 · ACCEPTED BY THE CEO'S OWN EYE THE SAME NIGHT" (`b39-closed-by-his-eye-2026-09-19`); the box was deleted that night.
- Layer: L2
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO — nothing; the row is closed and accepted" — true.
- Overlaps: B09 · B10 · B11 (open) are the Hermes rows its box deletion touched; the row text both says they "STAY OPEN" and that the stop "voids" them — see notes.

### B40 — Outward-content work could not be routed (leftover "listeleme" condition)
- State: done already — board line 379, Section 5: "✓ CLOSED 2026-08-27 · ACCEPTED BY THE CEO'S OWN EYE" (`scrollcraft-depth-and-routing-accepted-2026-08-27`); fix in `db/migrations/20260827001000_b40_outbound_content_routing.sql`.
- Layer: L4
- Stands on: — (closed)
- Breathes: no (already done)
- Waits on: "— closed" — true.
- Overlaps: none.

### B46 — The research engine (the dxb-research skill and its ruler)
- State: done already — board line 380, Section 5: "✓ CLOSED 2026-09-21 · BY THE CEO'S OWN WORD" (`b46-closed-by-his-word-2026-09-21`).
- Layer: construction tooling (closest: L6)
- Stands on: — (closed)
- Breathes: no
- Waits on: "Nothing — closed by his word 2026-09-21" — true.
- Overlaps: B48 and B56 extended it (both closed).

### B47 — The opening: a fresh session knows where every tool and door lives
- State: done already — board line 381, Section 5: "✓ CLOSED 2026-09-19 · ACCEPTED BY THE CEO'S OWN EYE" (`b47-accepted-by-his-eye-2026-09-19`).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "Nothing — closed and accepted; the holding side continues on B41" — true.
- Overlaps: B41 (open) is its holding-side twin.

### B48 — Facebook and Instagram read by the research engine
- State: done already — board line 382, Section 5: "✓ CLOSED 2026-09-21 · ACCEPTED BY THE CEO'S OWN EYE" (`b48-accepted-by-his-eye-2026-09-21`).
- Layer: construction tooling (research)
- Stands on: — (closed)
- Breathes: no
- Waits on: — true.
- Overlaps: part of the B46 engine.

### B49 — The test bench's seed reads this repository instead of reaching out to the machine
- State: done already — board line 383, Section 5: "✓ CLOSED 2026-09-21 · ACCEPTED BY THE CEO'S OWN EYE" (`b49-accepted-by-his-eye-2026-09-21`).
- Layer: L1 (the two engines' separation)
- Stands on: — (closed)
- Breathes: no
- Waits on: — true.
- Overlaps: its second condition was met inside B50.

### B50 — The whole house cleaned after the bench work (repos and both engines)
- State: done already — board line 384, Section 5: "✓ CLOSED 2026-09-21 · ACCEPTED BY THE CEO'S OWN EYE" (`b50-accepted-by-his-eye-2026-09-21`).
- Layer: L1
- Stands on: — (closed)
- Breathes: no
- Waits on: "AUTHOR, then CEO for the one click…" — no longer true; the row is closed.
- Overlaps: B49.

### B52 — The session opening made cheaper (it started at 69k)
- State: done already — board line 385, Section 5: "✓ CLOSED 2026-09-22 · ACCEPTED BY THE CEO'S OWN EYE" (`b52-accepted-by-his-eye-2026-09-22`).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO" — no longer true; closed.
- Overlaps: B47 (same opening).

### B54 — Code written only by the builder subagent at max, held by a hook
- State: done already — board line 386, Section 5: "✓ CLOSED 2026-09-24 · ACCEPTED BY THE CEO'S OWN EYE" (`b54-accepted-by-his-eye-2026-09-24`). Note: the hook it built was later thrown away on his word — `git log -1 e18e0a33` → "2026-09-28 … the code-gate hook thrown away on his word"; `~/.claude/hooks/` holds no code-gate file today.
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO" — no longer true; closed, and its subject is gone.
- Overlaps: B58 (closed for the same reason).

### B56 — The research door at Perplexity level (nothing on his screen, every claim cited)
- State: done already — board line 387, Section 5: "✓ CLOSED 2026-09-27 · ACCEPTED BY THE CEO'S OWN EYE" (`b56-accepted-by-his-eye-2026-09-27`).
- Layer: construction tooling (research)
- Stands on: — (closed)
- Breathes: no
- Waits on: — true.
- Overlaps: B46 · B48.

### B59 — The context-handover rule held by a hook, not by memory
- State: done already — board line 388, Section 5: "✓ CLOSED 2026-09-27 · ACCEPTED BY THE CEO'S OWN EYE" (`b59-accepted-by-his-eye-2026-09-27`); `~/.claude/hooks/dxb-context-gate.py` exists.
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO" — no longer true; closed.
- Overlaps: B61 changed its numbers.

### B60 — The 80 % quota rule repaired (reads the time left, never drops a guarded path)
- State: done already — board line 389, Section 5: "✓ CLOSED 2026-09-27 · ACCEPTED BY THE CEO'S OWN EYE" (`b60-accepted-by-his-eye-2026-09-27`).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO" — no longer true; closed.
- Overlaps: B54 (the "guarded path" it protected belongs to the code gate thrown away 2026-09-28).

### B57 — dxb-team1, the second orchestrator door
- State: done already — board line 390, Section 5: "✓ CLOSED 2026-09-27 · ACCEPTED BY THE CEO'S OWN EYE" (`b57-accepted-by-his-eye-2026-09-27`). Note: `.claude/skills/` today holds `dxb-team2` and no `dxb-team1` (`ls .claude/skills/`).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: "CEO" — no longer true; closed.
- Overlaps: none open. It says "the two owed §6 measurements were not run at closing and no row carries them".

### B61 — The context line moved to 50 / 55
- State: done already — board line 397, Section 5: "✓ CLOSED 2026-09-28 · ACCEPTED BY THE CEO'S OWN EYE" (`b61-accepted-by-his-eye-2026-09-28`). Drift: the hook today reads `RED_LINE_PCT = 50` (line 52) and `AGENT_DENY_PCT = 60` (line 54) of `~/.claude/hooks/dxb-context-gate.py`, not 55 as the row says.
- Layer: construction tooling
- Stands on: B59 (closed)
- Breathes: no
- Waits on: "Nobody — closed by his eye 2026-09-28" — true.
- Overlaps: B59.

### B55 — The model watch (a timer reading Anthropic's pages), removed
- State: done already — board line 398, Section 5: "✓ CLOSED 2026-10-01 · REMOVED ENTIRELY ON THE CEO'S OWN WORD" (`model-watch-removed-2026-10-01`).
- Layer: L2
- Stands on: — (closed)
- Breathes: no
- Waits on: — true.
- Overlaps: none.

### B53 — The prompt audit's remainder (overtaken by the rule prune)
- State: done already — board line 399, Section 5: "✓ CLOSED 2026-10-01 ON THE CEO'S OWN WORD" (`b53-closed-by-the-rule-prune-2026-10-01`).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: — true.
- Overlaps: none.

### B58 — The code gate did not see cp / mv / one-liners as writes
- State: done already — board line 400, Section 5: "✓ CLOSED 2026-10-08 ON THE CEO'S OWN WORD — ITS SUBJECT IS GONE" (`b58-closed-its-code-gate-gone-2026-10-08`); the gate went in commit `e18e0a33` (2026-09-28).
- Layer: construction tooling
- Stands on: — (closed)
- Breathes: no
- Waits on: the row file `.planning/board-rows/B58.md` still has "Waits on: The construction, when he orders it…" under its history marker — history, not today.
- Overlaps: B54.

---

## Reader C notes

1. **The assignment list is the closed section, and the plan's count is wrong.** All 23 rows given to reader C
   are in Section 5 (closed, board lines 372-400). Section 1 (open) holds **44** rows (board lines 89-150: B01 …
   B70 less these), not the 69 that PLAN.md "Facts that stand" says. The lead should re-count before ranking;
   reader C adds nothing to the rank list.
2. **B36 points its unfinished piece at the wrong row.** B36 says the missing house-bus grants on a rebuilt-from-zero
   machine "stands on the OPEN board under B43" — B43 is the Media Studio. `grep -c 'dxb-mcp\|house-bus\|house bus'
   .planning/board-rows/B43.md` → 1, and that hit is about granting `dxb-mcp/media` to two studio seats, not the 21
   departments' house-bus grants. Whether `db/seed/build-seed.ts` now grants them is open (not settled here);
   settle it by reading the seed's grant step. This is a candidate L1/L3 finding with possibly no owner row.
3. **B39 contradicts itself on B09 · B10 · B11.** One sentence: "B09 · B10 · B11 STAY OPEN — separate rows";
   a later sentence: stopping Hermes "is what voids rows B09 · B10 · B11". Those three are still in Section 1.
   Their "Waits on" should be checked by the reader who has them.
4. **Closed rows still carry spent "open" text** (LAW A residue, not work): B39 "THE ROW STAYS OPEN FOR ONE THING
   ONLY… the rented box"; B40 "AND IT IS NOT CLOSED"; B46 "WAITING ON HIS EYE ALONE"; B61 "Why still open … waits
   only for his eye"; B50 / B52 / B54 / B57 / B59 / B60 "Waits on: CEO". None changes the order.
5. **B61's numbers disagree with the code.** Row: 50 / 55. `~/.claude/hooks/dxb-context-gate.py:54` →
   `AGENT_DENY_PCT = 60`. Either a later order moved it (no row says so) or the record lies. Not settled here.
6. **B57 owes two §6 measurements "no row carries"** — an orphan residue by the row's own words; dxb-team1 itself is
   no longer in `.claude/skills/` (dxb-team2 replaced it), so the measurements may be moot. Lead decides.
7. **B54, B58, B60 describe a code gate that no longer exists** (thrown away 2026-09-28, `e18e0a33`); their closed
   text is history, but any open row that still cites "the code gate" or "builder at max hook" would be stale.
