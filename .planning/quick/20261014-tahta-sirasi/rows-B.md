# Rows — reader B (2026-10-14)

Board: `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`. Company reads were SELECT-only through the read gateway
(54322). The construction engine was not queried. B19, B20 and B07 are not in Section 1: they sit in Section 5
(closed), at board lines 369-371.

### B30 — The agents' tools for reaching the outside world: install the nine approved open-source scrapers and research tools, and open the six blocked channels
- State: open. Board line 131: Agent-Reach, Scrapling and scroll-craft are installed; the nine approved tools and MediaCrawler are not. A full install count was not re-measured.
- Layer: L3 (employees' tools). The six channel credentials and the store access are L8.
- Stands on: B41, because the request → scan → grant → card chain is how a new tool reaches a worker. It also stands on B64 step 7 ("the agents' shared tool checks who calls it"), because the planned `reach` group on dxb-mcp is one of those shared tools.
- Breathes: no. The row's own closing line, "one measured sentence in his briefing", is the only visible part.
- Waits on: BOTH: the author for installs; the CEO for six credentials, Outleteuro access and the AGPL §13 call. Still true.
- Overlaps: B41 (tool supply chain), B31 (the armoury tab shows these tools), B42 (watching tool versions). B64 decision 15 also calls Hermes "the holding's hands and eyes" (see notes).

### B29 — Finish the move from the old laptop (X230) to the workstation: change the leaked password and decide about eight leftover database files
- State: stale in part. The board row (line 132) says "the two resident services are installed and stopped … the services stay stopped until V2's spine exists". `systemctl --user list-units` today shows `dxb-scheduler.service loaded active running` and 11 other dxb services running; `hostname` → `DXB-Center`. What is really still open: the workstation password change (CEO) and the eight refused MariaDB files (author).
- Layer: L1 (secrets, machine integrity).
- Stands on: nothing.
- Breathes: no.
- Waits on: CEO for the password; author for the rest. The password part is still true. The "services stopped" part is no longer true.
- Overlaps: C65 (the row file says C65 already records the same password block).

### B28 — The advertising agency business: DXB wins brand clients and produces their campaigns (betting is excluded totally)
- State: open. Nothing is built, by the row's own words (board line 133).
- Layer: L8.
- Stands on: B64 steps 5-6 (outside work coming in, client delivery, price policy and standard contract). B33 (one gatekeeper for the graphics card that the video lane uses). B43 (its screen). W-C42-4 (outside accounts). B22 (the C42 programme it belongs to). Every client-facing step needs the flow and the approval gate first.
- Breathes: yes, once a client exists (the first money in).
- Waits on: CEO for the design package, outside accounts and any money out. Still true. His open answers (AI-disclosure deferral, selling the machine) are also still open.
- Overlaps: B43 (its face), B42 (the video-engine numbers), B31 (socialforge on the paid bench).

### B27 — The official Word/Excel/PDF/PowerPoint skills cannot be copied in under their licence: he decides whether what already works is enough
- State: open. This is a decision only he can make. No construction is needed unless he names a route.
- Layer: L3 (skills).
- Stands on: nothing.
- Breathes: no.
- Waits on: CEO. Still true.
- Overlaps: none.

### B26 — Replace the Gemini key that was exposed in a session transcript
- State: open. The terminal cannot settle whether the old key still works without calling Gemini with it. A rotated key returning refused would settle it (`scripts/set-gemini-key.sh`, the HTTP check in the row).
- Layer: L1 (secrets).
- Stands on: nothing. By his ruling it comes "after the work".
- Breathes: no.
- Waits on: CEO (after the work). Still true.
- Overlaps: B29 (same kind of job: a secret typed into a transcript).

### B25 — Kelam: press a key anywhere, speak, and clean text appears in whatever program is open
- State: open. Stages 3-6 are not built. It lives in a separate repository, which was not measured.
- Layer: L7 (voice). It is a desktop tool outside the OS.
- Stands on: the whole holding being finished. That is his timing order, not a technical dependency, so it ranks last by his word.
- Breathes: no.
- Waits on: CEO (timing, after the holding is finished). Still true.
- Overlaps: B12 (voice hearing). The voice work is shared, but the products are different.

### B22 — The rival study: all sources are watched; what is left is writing the one unifying plan he ordered from them
- State: open. `ls .planning/research/rival-intel/` shows no `00-SYNTHESIS.md`. B64's row file records "the first B22 synthesis chapter" written 2026-10-12, but it is not the file this row names. Rows 39 and 40 are still owed to B43.
- Layer: L7 by default. It gates design across every layer, which is not a construction layer of its own.
- Stands on: nothing. Every source is already reported.
- Breathes: no.
- Waits on: the author writes it, then the CEO reads it. Still true. Its gate "no design work starts until he has read it" was passed over for B64, whose design and plan he accepted on 2026-10-14 (see notes).
- Overlaps: Section 3, the six-wave C42 programme, which this row owns. B64 (the first synthesis chapter came out of its research).

### B43 — DXB Media Studio: his own tab for the advertising business (client jobs, shot lists, cost and time per clip, yes/no on finished clips)
- State: open. The road behind it was accepted by his eye on 2026-09-16; the screen is not drawn. Its many legs are listed in the row file under "Legs, moved 2026-09-28" and are open on his word one by one.
- Layer: L7 (the screen). Its road and legs are L8.
- Stands on: B32 (the design package; every V2 screen is drawn and shown before it is built). B28 (a client to show). B33 (the graphics-card gatekeeper). B22 (rival rows 39-40 owed to it).
- Breathes: yes (live jobs moving on his screen).
- Waits on: B32, B28, B33 and his word per leg. Still true: B32, B28 and B33 are all open on the board.
- Overlaps: B28, B31, B42, B10 (night workers seen live). SIGNAL and Virtual Creator are plans riding in this row; each is really its own job.

### B45 — An idle task lane now hears "stop" at once instead of sleeping out its rest
- State: done already. Board line 139: "FINISHED AND ACCEPTED BY HIS EYE 2026-09-16", with the approval `b44-and-b45-accepted-by-his-eye-2026-09-16` present in `scripts/governance/ceo-approvals.json:973`. It still sits in Section 1 instead of Section 5.
- Layer: L2.
- Stands on: nothing.
- Breathes: no.
- Waits on: "Nothing". True.
- Overlaps: B44 (found while closing it).

### B44 — Tests that passed alone but timed out in the full suite, one of them guarding the spending brake
- State: done already. Board line 140: "FIXED AND ACCEPTED BY HIS EYE 2026-09-16", with the same ledger entry `ceo-approvals.json:973`. It still sits in Section 1. One nameless red stays ⚠ UNVERIFIED, as the row says.
- Layer: L2.
- Stands on: nothing.
- Breathes: no.
- Waits on: "Nothing of this row". True.
- Overlaps: B45.

### B51 — Who does each job, who checks it and what it costs: the model architecture
- State: open. Step 3 of the 2026-10-09 plan has many done notes (row file, "Done notes", up to 2026-10-10). Still open: (1) the checking seat, (2) the cost meter, (4) the per-task ceiling. The board says all three are built with B64. Measured today: the gateway shows `routing_rules` = 39.
- Layer: L2 (model catalogue, routing, cost meter).
- Stands on: B64. The row itself says the checking seat, cost meter and ceiling are "built with B64" (B64 step 3 checking, step 2 the 30 % budget, step 7 budget and "unknown price"). Its customer trigger also stands on a client link to projects and a non-empty CRM (L8, B64 step 5).
- Breathes: yes, for its closing line: who did each job, who checked it and the cost, beside every job on his screen.
- Waits on: AUTHOR for steps 2-3, and the checking seat with B64. Still true. Note that the row file's "Waits on: CEO" is the older text.
- Overlaps: B64 steps 2, 3, 4 and 7; B66; B68; B08 (brain switch).

### B62 — The freeze guard reads words in a session's prompt as if they were the program name, so it can kill the CEO's working session first
- State: open, confirmed. `scripts/ops/freeze-guard.sh:196` still has `*playwright-mcp*` in the tier case, and `:248` still pre-filters with `awk '… (/mcp/ || …)'` on the whole `args`. Neither file has a commit since `8389b4bd`.
- Layer: L2 (resident services).
- Stands on: nothing.
- Breathes: no.
- Waits on: "one builder lane after K1's page"; no word of his is needed. K1 is a past job, so the condition no longer holds anything back.
- Overlaps: B24 (closed; the guard's purpose).

### B63 — The mirror check could hide a stale file; repaired, and waiting for his eye
- State: open, waiting only for his eye. The repair is in place: `scripts/governance/sync-codex-mirror.sh:100` `mirror_diff() { diff -rq --exclude=__pycache__ --exclude='*.pyc' …}`, no `head`. Commit `e5eaf17c`, test `tests/governance/codex-mirror-check.test.ts` present.
- Layer: L1 (a record check that could lie).
- Stands on: nothing.
- Breathes: no.
- Waits on: CEO's eye. Still true.
- Overlaps: none.

### B64 — How work reaches the holding: he gives Hamza a goal, the right head owns it, plans it, checks it for real and reports the result back
- State: open. The design and plan were accepted on 2026-10-14. Step 1's pieces (routing door, anon doors, Hamza's levels, goal not intent) exist only as untracked migrations `db/migrations/20261014010000..040000_b64_*.sql` and `tests/b64/`, finished on the construction engine only (job plan, "Facts that stand"). The company still shows the gaps the row measured: `intents` with source voice = `received|51`; `workflows` count = `0`.
- Layer: L4.
- Stands on (by step of `.planning/quick/20261012-b64-is-akisi/PLAN.md`):
  - Step 1 (Hamza's three hands, "niyet" box gone, "connect me to that head" in chat). It removes the send-as-task path of C56 and §2d / W-C42-1, and closes C26 if page context is carried. It uses the B51 succession door (done) and B08 (the one door for "switch to Max"). The voice switch to Sonnet 5.5 medium is measured against B12's speed target.
  - Step 2 (owner and job desk). It is the single place C60 asks for. Each head's guide and hands are B41. The 30 % budget is B51 move (4).
  - Step 3 (real check, critical gate). B51 move (1), the checking seat. It overlaps B70 (gate skipped when the hook is off) and B69 (research fails QA). The retry reason is W-C42-5.
  - Step 4 (backup pair, model room). **B65 and B66 finish here**, by the plan's own words. It uses B51's catalogue.
  - Step 5 (Gmail, Reception, Clients). It stands on **B32**, because "this screen's drawing comes to you first". It touches B05 (Gmail send, frozen) and W-C42-4 / B28 (outside accounts).
  - Step 6 (what comes to him, price policy, contract). L5 approval gate; B28 is the first user.
  - Step 7 (schedules, one queue, budget, keys out of workers' env). B51 move (2), the cost meter. Its key removal is L1 work.
  - Step 8 (one dream). L6 memory; no board row of its own was found in Section 1 (`grep -i "dream\|rüya"` on lines 81-153: none).
  - Step 9 (Hermes). **B09, B10 and B11**, plus a rented server, which is money out and goes to his approval gate.
- Breathes: yes. This is the row whose finish makes a goal visibly move through the company.
- Waits on: the board cell still reads "research first. B22 holds design until its synthesis is read". This is no longer true: the plan's yes is given (`b64-plan-his-yes-2026-10-14`). It now waits only on the author's build, step by step.
- Overlaps: B51, B65, B66, B70, B69, C56, C60, C26, B41, B09-B11, B05.

### B65 — A failed AI run can be recorded as a good answer because the readers never check the error flag
- State: open, confirmed. `grep -rn "is_error" packages --include=*.ts` (tests and dist excluded) finds nothing.
- Layer: L2 (workers).
- Stands on: B64 step 4. The row and the plan put its repair there (decision 13).
- Breathes: no.
- Waits on: the author with B64's build. Still true.
- Overlaps: B64 step 4.

### B66 — The old database backup-model path can hand valuable work to a weaker model
- State: open. The row's own measurement still holds: `fallbackModel(` appears only at its definition, `packages/orchestrator/src/select-model.ts:101`, and no code calls it. The SQL path in `20260713040000_e71_routing_slots.sql` was not re-read.
- Layer: L2 (model routing).
- Stands on: B64 step 4, where "the old backup path closes; B65 and B66 finish in this step".
- Breathes: no.
- Waits on: the author with B64's build. Still true.
- Overlaps: B64 step 4, B51.

### B67 — The HR org check does not recognise Hamza as a legitimate top of the tree
- State: open, confirmed in the company. `select slug,e1_org_row from v_hr_equipment_check where e1_org_row=false` returns `agents-orchestrator|f` (1 of 213 rows). The view's rule `manager_id IS NOT NULL OR role = 'head'` is at `db/migrations/20260725003000_hr_equipment_dept.sql:9`.
- Layer: L3.
- Stands on: B64 step 1 (Hamza's levels and role) and B51's 2026-10-12 order on what Hamza is. The fix should follow the settled role.
- Breathes: no.
- Waits on: the author, in its turn. Still true.
- Overlaps: none.

### B68 — The routing starting file holds only about half the live routing rules, so a fresh build starts half-routed
- State: open, confirmed. `packages/kernel/policy/routing-seed.json` holds 21 rules; the company's `select count(*) from routing_rules` returns `39`.
- Layer: L2 (routing). It also bears on L1 (two engines that disagree).
- Stands on: B64 steps 1 and 4 and B51. These still change routing rules (a B64 routing-door migration exists today), so regenerating the seed before they settle would leave it stale again.
- Breathes: no.
- Waits on: the author, in its turn. Still true.
- Overlaps: B51.

### B69 — Research tasks cannot finish: they fail the library check and quality check for want of a report with sourced figures
- State: open. The source is `.planning/quick/20261009-masa-b51/SOL-step2.md:19` ("REFUTED … research tasks fail `std.knowledge_shelf` … and QA"). It was not re-run: it needs a real research task on the construction engine, which is busy.
- Layer: L4.
- Stands on: B64 step 3, because QA is redesigned there to test against the brief. It may also stand on B30 for the research tools; that is UNVERIFIED as the cause.
- Breathes: yes (research work that ends).
- Waits on: the author, in its turn. Still true.
- Overlaps: B64 step 3.

### B70 — When the hook is switched off, the quality gate is skipped and work goes out unchecked
- State: open. `packages/orchestrator/src/worker-shim.ts:860-861` reads `hookOn` and alerts when it is off. The claim that the post-gate is then skipped was not traced to the line by this reader.
- Layer: L4 (the check step). It also bears on L5.
- Stands on: B64 step 3 (the check is rebuilt there).
- Breathes: no.
- Waits on: the author, in its turn. Still true.
- Overlaps: B64 step 3.

### B19 — Every automated-build action is pinned to a fixed version, and a test watches it
- State: done already. It is in Section 5, board line 369: "CLOSED ON EVIDENCE 2026-08-26 … HIS OWN EYE ACCEPTED THIS ROW, 2026-08-27", with the ledger entry `six-closed-rows-accepted-by-his-eye-2026-08-27` (`ceo-approvals.json:356`). `tests/b19/actions-are-sha-pinned.test.ts` exists.
- Layer: L1.
- Stands on: nothing.
- Breathes: no.
- Waits on: "—".
- Overlaps: none.

### B20 — One command counts the roadmap's steps, and the ledger re-measures the count
- State: done already. It is in Section 5, board line 370, closed 2026-08-26 and accepted by his eye 2026-08-27 (same ledger entry, line 356). `tests/b20/roadmap-tally-is-stable.test.ts` exists.
- Layer: L1.
- Stands on: nothing.
- Breathes: no.
- Waits on: "—".
- Overlaps: none.

### B07 — The Codex 5.6 model entrance exam: waived by him; he vouches for the model
- State: done already. It is in Section 5, board line 371, "CLOSED 2026-08-26 … DO NOT RAISE IT WITH HIM AGAIN", with the ledger entry `b07-codex-56-exam-waived-ceo-vouches-2026-08-26` (`ceo-approvals.json:328`).
- Layer: L2.
- Stands on: nothing.
- Breathes: no.
- Waits on: "—".
- Overlaps: none.

## Reader B notes

- **B44 and B45 are closed but still in Section 1.** Both are accepted by his eye (ledger line 973), and both should move to Section 5. They should not be ranked.
- **B19, B20 and B07 are not Section 1 rows.** They are in Section 5 (lines 369-371) and were handed to this reader in error. They should not be ranked.
- **B64's "Waits on" is out of date.** The cell still says "research first; B22 holds design until its synthesis is read — his word decides whether B64's research feeds it". Its own done notes and `b64-plan-his-yes-2026-10-14` show the plan accepted, so the B22 hold no longer applies to B64.
- **B22 and B64 contradict each other.** B22 says "No design work starts until he has read it [the synthesis]". B64's design was written into 30 specs and accepted without `00-SYNTHESIS.md` existing. Either B22's gate is no longer binding, or B64 went past it on his word. His page must say which; otherwise B22 blocks every other design row on paper.
- **B29 is out of date on the services and contradicts itself.** The board cell says the services stay stopped until V2's spine exists, but the scheduler and 11 other dxb services are running (systemctl, today). The row file's "What closes it" still asks for "the CEO's word on when the workstation becomes the live machine", while the board says the cutover is done. What is really left is two small jobs: his password change and the MariaDB files.
- **B51 "Waits on" disagrees between the board and the row file.** The board says AUTHOR, plus the checking seat with B64. The row file says CEO. B51 moves (1), (2) and (4) are in practice B64 steps 3, 7 and 2, so B51's remaining open part sits inside B64.
- **B62's "Waits on" no longer holds.** It names "after K1's page is in front of him", and K1 is a finished past job. Nothing stops it except its turn.
- **B43 is really several jobs.** It holds the studio tab (waiting on B32), eleven unbuilt W14 legs, the SIGNAL night content engine plan and the Virtual Creator plan, each on its own word.
- **B30 holds two jobs**, and its "hands and eyes" wording collides with B64's. One job is the author's installs and scans of nine tools; the other is the CEO-held channel credentials and the store access. B64 decision 15 (v14) calls Hermes "the holding's hands and eyes", the same words as B30's title. They are different things (tools vs. an agent), and the page should not merge them.
- **B65 and B66 are both scheduled inside B64 step 4.** Ranking them separately before B64 step 4 would contradict the board's own "with B64's build" cell.
- **B64 step 5 stands on B32.** The plan says "this screen's drawing comes to you first", so part of B64 cannot finish before the design package row moves.
