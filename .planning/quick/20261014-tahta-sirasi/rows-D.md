# Reader D — board Sections 2, 2c, 2d and 3 (step 1)

Read 2026-10-14 from `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` lines 154-341, the row files
`.planning/board-rows/C*.md`, `B22.md`, `B64.md` and the accepted B64 plan
(`.planning/quick/20261012-b64-is-akisi/PLAN.md`). Code read on the working tree of 2026-10-14. Company
facts are SELECT-only through the read gateway (role `dxb_gateway`), run 2026-10-14.

Frame that applies to every C-row below: the 2026-08-01 ruling "WHERE V2 LIVES" (board line 261) turns
C26-C64 from repairs on V1 into **requirements V2 must satisfy**. V2's folder does not exist yet
(`ls apps` → `dashboard jarvis`; B32 says the same), so every screen-shaped C-row is open by construction.

---

## Section 2 — complaints of 2026-07-27

### C26 — Hamza does not know which page the CEO is looking at when asked about "this page"
- State: open — `grep -nE 'pathname|pageContext|page_context|route' apps/dashboard/src/app/api/chat/route.ts` → 0 hits; no chat component or `chat-drain.ts` names a page either.
- Layer: L7
- Stands on: B64 step 1 (Hamza's hands and the one chat/voice entry) — the page context is passed into that entry.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B64's row file lists C26 as "owned elsewhere"; touches HAMZA IN V2 (one Hamza across chat, voice, screen).
- Owner: none in Section 1 — separate work (B64 explicitly points away from itself to C26).

### C27 — Pages do not link into each other
- State: open — never measured surface by surface (row's own cell); V2 screens unwritten.
- Layer: L7
- Stands on: B32 (V2 screens are drawn first) — nothing to link before the screens exist.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C61 (the same complaint widened to every card), C28.
- Owner: B32 as a V2 requirement — but B32's row file names no C-row (grep), so it is not yet carried there in writing.

### C28 — A found business opportunity cannot be opened to see its details
- State: open — only `apps/dashboard/src/app/(command)/revenue/opportunities/page.tsx` exists, no `[id]` detail route (`find … -path '*opportunit*' -name page.tsx`). Company `public.opportunities` = 5 rows.
- Layer: L7
- Stands on: B32 (V2 screens).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C27, C61.
- Owner: B32 as a V2 requirement (not named in B32's file).

### C29 — The Skills page is one flat list; bundles should fold open like a drawer
- State: open, and its measurement is stale — the row file says `library_items` skill = 23, plugin = 18; company SELECT today: skill = 2, plugin = 19 (`select kind,count(*) from public.library_items group by kind`). The closing bar (grouping) is not built.
- Layer: L3
- Stands on: B41 (the same "one line, depth on demand" idea for workers; B41's file names C29) and B31 (the armoury tab, same shelf).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B41, B31.
- Owner: shared with B41 (named there) — separate screen work; the runtime half is B41's.

### C30 — Of ~100 repos he gave, none was properly studied, installed and wired in
- State: open — no new measurement taken; B16's row says "most tracked tools are still only studied, not installed".
- Layer: L3
- Stands on: B42 / B41 (the arsenal watch and supply chain) only loosely; nothing hard.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: **B16 is its internal twin** ("Closes with C30", B16 row); B30 (the nine approved tools), V2-skills ruling in §2d (names C30).
- Owner: B16 — fully carried; needs no rank of its own (rank B16 and C30 together).

### C31 — The tool catalogue looks thin because nobody uses it
- State: open — company `public.library_usage_log` = 0 rows, `max(used_at)` empty (SELECT 2026-10-14).
- Layer: L3
- Stands on: B41 (a worker reaching for and being granted a tool is what writes usage), and a working workforce (B64).
- Breathes: yes — usage rows appear only when the workforce works.
- Waits on: AUTHOR — still true.
- Overlaps: B41's own closing bar ("the usage record written"), B31.
- Owner: B41 — effectively carried by B41's closing bar; no rank of its own.

### C32 — Every page is weak and must be raised to excellent, one at a time
- State: open — systemic; V1 is dead (§2d), so this is V2's standard.
- Layer: L7
- Stands on: B32.
- Breathes: no
- Waits on: AUTHOR — still true; the §2d ruling "EVERY SURFACE IS REDESIGNED ONE AT A TIME, WITH HIM" now says how.
- Overlaps: B32, B02, §2d EVERY SURFACE.
- Owner: B32 — fully carried (it is the same order); no rank of its own.

### C33 — Times on screens show no date
- State: open on V1 — seven components still call `toLocaleTimeString`/`timeStyle` (`grep -rlnE` in `apps/dashboard/src/components`: live-clock, live-ticker, alerts-rail, voice-call, live-feed, intelligence-rail, models-table); whether each also prints a date was not checked. On V2: not built.
- Layer: L7
- Stands on: B32 (V2 design tokens).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C34 (same components, same fix).
- Owner: B32 as a V2 requirement (not named in B32's file).

### C34 — The date is placed badly, with no design thought
- State: open — same as C33.
- Layer: L7
- Stands on: B32.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C33 — one design token closes both.
- Owner: B32 as a V2 requirement.

### C35 — Long texts must fold open on click instead of walls of text
- State: open — not re-measured on V1 (dead); V2 not built.
- Layer: L7
- Stands on: B32.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C29 (same progressive-disclosure idea), §3.3.
- Owner: B32 as a V2 requirement.

### C37 — Hamza and the engineers talk to him in code words instead of business language
- State: open — two legs left: (a) his own report of a run of messages read without complaint (only he closes it); (b) a machine language check on system-written CEO text — no evidence of it was found in this reading (not grepped exhaustively).
- Layer: L7
- Stands on: nothing on the board — leg (b) needs only the existing text surfaces.
- Breathes: no
- Waits on: AUTHOR — leg (a) actually waits on the CEO's word.
- Overlaps: none in Section 1.
- Owner: none — separate work.

### C38 — Hamza should always listen for his name; the mic button only mutes
- State: open — W-C42-1 (board line 305) records the daemon was muted by the CEO himself on 2026-07-28 08:58 UTC; `packages/voice/src/jarvis-daemon.ts` still holds a `muted` state set to true on several paths (lines 496, 533, 588). Whether it starts muted today: UNVERIFIED (daemon not run).
- Layer: L7
- Stands on: B12 (the voice floor on the graphics card), B33 (the floor never leaves the bench).
- Breathes: yes — he hears Hamza answer without touching anything.
- Waits on: AUTHOR — still true.
- Overlaps: W-C42-1 ("mute stops being a trap").
- Owner: none in Section 1 names it — separate work beside B12.

### C39 — There is no "company doctor" who finds and fixes defects before he notices
- State: open — company `public.agents` with slug/title like health or doctor = 0 (SELECT 2026-10-14). Shape approved (`company-doctor-2026-07-27`, present in `ceo-approvals.json`).
- Layer: L3 (the team) with an L6 half (the cross-run pass, i.e. dreaming).
- Stands on: B64 step 8 (the one nightly dream, which is the doctor's memory half) and B64 steps 1-3 (Hamza as the one door, owned work, real checks).
- Breathes: yes — a defect found and repaired on its own is the company visibly working.
- Waits on: AUTHOR — still true.
- Overlaps: B64 step 8 / §2d HERMES (dreaming); §2d V2 memory.
- Owner: none in Section 1 — separate work; its memory half is carried by B64 step 8.

### C40 — The famous "loop" system (karpathy autoresearch) he ordered was never built
- State: open, with one stale cell — the board (line 179) says "The autoresearch study card is still a stub"; the card was filled 2026-08-30 (`.planning/research/study-cards/autoresearch.md` header: "Stub filled 2026-08-30 on the CEO's order", Status STUDY, "not installed, and not to be installed"). The loop itself (locked score, keep-if-better, a real run) is not built.
- Layer: L4
- Stands on: B64 step 3 (the real check — "the verify gate IS the loop"), B64 step 7 (lines/schedules), the §2d V2 memory (state).
- Breathes: yes, once on a schedule.
- Waits on: AUTHOR — still true.
- Overlaps: B15 (the four-box test is the same test), W-C42-5.
- Owner: none — separate work.

### C41 — A throwaway example (Burj Al Arab) was frozen into design personas as a goal
- State: open — `grep -rlni burj personas/` → `personas/design/head-of-design.md`, `personas/design/design-ui-designer.md` (2026-10-14). The all-persona sweep not evidenced.
- Layer: L3
- Stands on: nothing.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: none on the board.
- Owner: none — separate work (small).

### C42 — Standing order: rival systems he hands over are studied, then built as ours or better
- State: open — stage 1 closed 2026-07-28 and was then rejected by him (§2d line 255); watching finished (B22: 31 reported, 7 skipped); the synthesis `00-SYNTHESIS.md` does not exist (`ls .planning/research/rival-intel/ | grep -i synth` → nothing).
- Layer: L7 (it feeds the design) — the build it orders spans every layer.
- Stands on: B22.
- Breathes: no
- Waits on: CEO supplies sources → AUTHOR — still true.
- Overlaps: B22, Section 3, B28 (names C42).
- Owner: B22 — fully carried; no rank of its own.

## Section 2c — complaints of 2026-07-28

### C52 — A chat conversation must be deletable from the database entirely
- State: open — `apps/dashboard/src/app/api/chat/` holds only `route.ts` and `dictate/`; `grep -rnE 'delete|DELETE'` there → 0 hits.
- Layer: L7 (with an L1 audit leg)
- Stands on: nothing on the board.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: none.
- Owner: none — separate work.

### C53 — He must be able to send images into the chat
- State: open — no file input, drop or paste handler in `apps/dashboard/src/components/chat` (`grep -rlnE 'type="file"|image/|onDrop|paste'` → 0).
- Layer: L7
- Stands on: B64 step 1 (the chat entry it rides on).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: none.
- Owner: none — separate work.

### C54 — Half of what he says by voice never arrives
- State: open, number stale — row says 44 %; company `public.voice_calls`: 102 calls, 42 with empty transcript (41.2 %), last call 2026-07-28 08:58 UTC (SELECT 2026-10-14) — matches W-C42-1's re-measure of 2026-08-04, not the row's figure.
- Layer: L7
- Stands on: B12 (hearing moved onto the card, whisper large-v3-turbo), B33 (the floor).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C58 (same defect, its symptom), W-C42-1, B03.
- Owner: none names it — but it sits inside B12's remit ("it mishears"); separate row, rank with B12.

### C55 — He waits and nothing tells him Hamza is listening or thinking
- State: open — number stale: row says 29-35 s; W-C42-1 re-measured average 41.0 s on 2026-08-04; no voice call since 2026-07-28 (SELECT above). No state display evidenced.
- Layer: L7
- Stands on: B12 (speed), B32/V2 screen (the visible state).
- Breathes: yes — the visible state is the system showing it works.
- Waits on: AUTHOR — still true.
- Overlaps: B12 (the 1.0-1.3 s target is stricter than C55's ≤10 s), W-C42-1.
- Owner: none names it; the speed half is B12's, the state half is separate.

### C56 — The chat's "send as a task" button fails silently
- State: open — `apps/dashboard/src/components/chat/chat-board.tsx:285-297` `dispatchAsTask`: `if (res.ok) {…}` with no else, no catch.
- Layer: L7
- Stands on: B64 step 1 — §2d HAMZA IN V2 says the button disappears ("talking to him IS ordering").
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: §2d HAMZA IN V2 (removes the button), W-C42-1 ("the silent dispatch button dies"), B64 (its file lists C56 as owned elsewhere).
- Owner: none — separate on paper, but B64 step 1 makes the button go; once B64 step 1 lands this closes by removal (the lead should decide whether it keeps a rank).

### C57 — Two voices speak on top of each other
- State: open — not re-measured here (needs a forced collision on the live daemon).
- Layer: L7
- Stands on: B12 (the voice lanes being rebuilt).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B12.
- Owner: none — separate, rank with B12.

### C58 — Hamza keeps saying "I couldn't understand, Muhittin Bey" (an invented apology)
- State: open — not re-measured; the row ties it to C54's empty transcripts.
- Layer: L7
- Stands on: C54 / B12.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C54 (same cause).
- Owner: none — separate, closes with C54.

### C59 — Asked how many tokens he burned, Hamza answered something unrelated
- State: open — not reproduced (row says so). The cost-ledger answer path is not evidenced in this reading.
- Layer: L2 (cost meter) surfaced in L7
- Stands on: B51 (the cost meter, move 2), B64 step 1 (Hamza's "where are we" hand).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B51 move 2.
- Owner: none — separate, though its data comes from B51.

### C60 — A task he gives has no place where he can follow it and see its result
- State: open — `apps/dashboard/src/app/(command)/ops/tasks/page.tsx`: `grep -nE 'result|output'` → 0 hits.
- Layer: L4
- Stands on: B64 step 2 ("the job's brief, plan, parts and cost stand in one place").
- Breathes: yes — he sees work move to a result.
- Waits on: AUTHOR — still true.
- Overlaps: B64 step 2 (largely the same thing); B64's file lists C60 as "owned elsewhere".
- Owner: contradictory — B64's file points at C60, B64's plan step 2 builds most of it. Separate on paper.

### C61 — Clicking a card opens nothing, on any page
- State: open — V2 not built.
- Layer: L7
- Stands on: B32.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C27, C28 (contains both).
- Owner: B32 as a V2 requirement (not named there).

### C62 — On his 34" screen the pages are half empty and scroll sideways when narrowed
- State: open — V2 not built; ⚠ UNVERIFIED on V1 (needs an eye/browser at width).
- Layer: L7
- Stands on: B32, B03-bis (the real-browser check needs his login).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: §3.3 rule 6, B02.
- Owner: B32 as a V2 requirement.

### C63 — No charts or analysis anywhere, only boxes
- State: open — `apps/dashboard/package.json` has no recharts/chart.js/d3/visx/nivo/echarts (grep → 0).
- Layer: L7
- Stands on: B32 (the screen-by-screen spec it asks for first).
- Breathes: yes when the charts read live views.
- Waits on: AUTHOR — still true.
- Overlaps: §3.3 rule 1, W-C42-2.
- Owner: B32 as a V2 requirement.

### C64 — Turkish speech reads English terms letter by letter ("U eks")
- State: open — `grep -rlniE 'pronunc|telaffuz' packages/voice/src` → 0.
- Layer: L7
- Stands on: B12 (B12 names "the pronunciation layer, which only his ear closes").
- Breathes: no
- Waits on: AUTHOR + HARDWARE — the hardware (workstation) arrived per B12/B33 text; the HARDWARE part looks outdated.
- Overlaps: B12.
- Owner: B12 — fully carried (B12's open list names the pronunciation layer); no rank of its own.

### Process complaint (2c) — he cannot tell whether quality rises or falls as the project is built
- State: open — "Owned by the board itself" (board line 225).
- Layer: — (governance of the board)
- Stands on: nothing.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: this very job (the ordered board and the review are its answer).
- Owner: the board — carried by this job; no rank.

## Section 2d — the CEO's ruling of 2026-07-29 (and later rulings filed in it)

Most entries are standing rulings, not work. Each says so; only the work they carry needs a rank.

### 2d preamble — A suspended session is never junk; C49 closed on a wrong measurement
- State: ruling in force (pinned by a test per the text) — not work. The C49 note is history.
- Layer: L2
- Stands on: —
- Breathes: no
- Waits on: nothing.
- Overlaps: the table row "A suspended session is never junk" (same ruling, said twice).
- Owner: no row — standing rule; no rank.

### Cloud speech-to-text — REJECTED; local models when the workstation arrives
- State: ruling in force; its work is local voice models.
- Layer: L7
- Stands on: B12, B33.
- Breathes: no
- Waits on: the workstation "Friday" — arrived (B12/B33/B34 describe models running on this card), so the wait is outdated. Note: B33 later approved a cloud voice lane "for measurement only" (`b33-voice-to-cloud-measurement-approved-2026-08-31`) — a narrowing of this rejection, not a contradiction.
- Overlaps: B12.
- Owner: B12 — fully carried.

### Local models chosen by measurement, never by reputation
- State: ruling in force — rule of method.
- Layer: L2
- Stands on: —
- Breathes: no
- Waits on: nothing.
- Overlaps: B34 (the exam), B12.
- Owner: B34 / B12 carry it; no rank.

### The open work board — ACCEPTED
- State: done (it is this file) — ruling, not work.
- Layer: —
- Owner: no rank.

### Order of work — this board, oldest first (and "half-finished outranks new")
- State: stale by this job — his order of 2026-10-14 (PLAN.md "His words") replaces historical order; the plan says board law 4 goes at step 6 under LAW A. The half-finished clause matches his "ne kadar başladığın işleri bitir".
- Layer: —
- Owner: replaced at step 6 of this job; no rank.

### Order of work, amended 2026-07-28 — rival analysis first, then build
- State: partly outdated — still carried by B22 ("No design work starts until he has read it") and B32 ("waits behind B22"); but his yes to the B64 plan on 2026-10-14 (`b64-plan-his-yes-2026-10-14`) lets construction start without the synthesis.
- Layer: —
- Owner: B22; no rank of its own.

### Order of work, amended 2026-07-30 — the context architecture first and nothing else
- State: stale — the context work it ordered is done (CLAUDE.md, doors, hooks exist and are in use); later orders (B51 plan 2026-10-09, B64 plan 2026-10-14) put other work first. Not deleted from the board — LAW A says it should be.
- Layer: —
- Owner: none; no rank.

### LAW B — finished is not approved; LAW A — a live order deletes what contradicts it
- State: rulings in force (in `.claude/CLAUDE.md` §1). Not work.
- Owner: no rank.

### How the sixteen sources get read — all of them in detail, then one unifying plan
- State: open in its second half — the unifying plan (synthesis) is unwritten (see C42).
- Layer: L7
- Stands on: —
- Owner: B22 — fully carried.

### A suspended session is never junk (table row)
- State: ruling in force; duplicate of the preamble. Not work.

### WHERE V2 LIVES — same repository, a clean new folder; V1 is dead
- State: open as work — the V2 folder does not exist (`ls apps` → `dashboard jarvis`). Ruling registered (`v2-location-and-v1-dead-2026-08-01` present in the ledger).
- Layer: L7
- Stands on: B32 (drawings before code).
- Breathes: no
- Waits on: B32 — still true.
- Overlaps: B32; turns every C-row into a V2 requirement.
- Owner: B32 — carried; no rank of its own.

### THE ENGINE STAYS — and its development is open
- State: ruling in force — not work.
- Owner: no rank.

### EVERY SURFACE IS REDESIGNED ONE AT A TIME, WITH HIM
- State: open as work — no V2 surface drawn.
- Layer: L7
- Stands on: B22 per its own text ("does NOT begin before the rival videos are watched in full") — that condition is met (B22: watching finished); B32 still waits on the synthesis.
- Breathes: no
- Waits on: AUTHOR draws, CEO approves.
- Overlaps: B32, C32, B02.
- Owner: B32 — fully carried.

### HERMES — used to the full, visible, with the holding's one nightly dream
- State: open — no holding Hermes on any machine (board line 264 and B09/B11, measured 2026-10-14 by them; not re-measured here).
- Layer: L8 for the outward doors; L2 for the 24/7 worker; L6 for the dream.
- Stands on: the holding's server (money out, CEO), B64 steps 1-3, B64 step 8 (the dream).
- Breathes: yes — work done overnight and seen in the morning.
- Waits on: CEO (server money) — still true.
- Overlaps: B09, B10, B11, B64 steps 8-9, C39 (dreaming).
- Owner: B09-B11 + B64 steps 8-9 — fully carried; the dream's bar ("second run better and cheaper") is B64 step 8's bar. No rank of its own.

### NOTHING THAT DOES NOT FIT OPUS 5 — hands stay, brains are Opus, scaffolding goes
- State: mostly done as a ruling; one sub-point open — "Named conflict, left for him": the design packages. Measured today: impeccable, taste-skill, ui-ux-pro-max, open-design, frontend-design and caveman are all `false` in `~/.claude/settings.json` (and the project settings). No ledger entry for his word on them was found (`grep` for design-pack/impeccable/scaffold ids → 0). Brains have since moved to Opus 5.5 (text updated on the board).
- Layer: L3
- Stands on: B32 (the text says judge them in the V2 design phase).
- Breathes: no
- Waits on: CEO's word on the design packages — still true.
- Overlaps: B32.
- Owner: B32 for the open sub-point — not named in B32's file.

### V2 skills — few, ours, only where they force a step
- State: ruling in force; its work is C30's study-install-or-refuse per repo.
- Layer: L3
- Owner: C30/B16 — fully carried; no rank.

### HAMZA IN V2 — the man you talk to is the man who acts
- State: open — `packages/voice/src/answer.ts:148` still `tools: []` (the board cites line 122; the line moved). Sub-points: (1) one Hamza, (2) hands + hand-off + no send-as-task button, (3) two kinds of conversation, (4) at most one question back — all in B64 step 1; (5) **the meeting room with ~20 directors** — B01 (Boardroom) holds the similar idea, deferred by him; (6) **Hamza lives on the screen, gold figure, mouth-line** — B32; "an employee never promises a system change, he opens a tracked row" — no owner found.
- Layer: L4 (hands) · L7 (face, meeting room)
- Stands on: B64 step 1 (hands before face, the ruling's own order), then B32 for the face.
- Breathes: yes
- Waits on: AUTHOR — still true.
- Overlaps: B64 (cites this ruling as Hamza's role), B41 (built-in tools), B01, B32, C56, C26.
- Owner: B64 (sub-points 1-4), B01 (5), B32 (6) — carried; the "never promise a system change → open a row" sub-point has no owner.

### THE FERRARI — build the machine; driving it (revenue) comes after
- State: ruling in force; its one work item — every part finished only after a real job end to end on a test bench — is B64's `pnpm verify:b64` six scenarios.
- Owner: B64 for the test-bench leg; no rank.

### Version 1 is frozen; version 2 begins
- State: ruling in force — not work (V2 work is B32/B64).
- Owner: no rank.

### V2 memory — one brain, three abilities, written by us
- State: open — none of its parts is built. Measured today: `grep -n recallMemory packages/orchestrator/src/worker-shim.ts` → 0 (sub-point 1, the worker's own persona and memory, still unwired); no table with "relat" in its name in `public`/`memory` (information_schema SELECT → 0 rows, so the "0 relation rows" gap stands); `memory_index.scope` not read in `packages/memory-router/src` (grep → 0; sub-point 3). Concurrency control (sub-point 2) not checked. Recall and summarize need a LiteLLM key the company does not have (filed here 2026-10-14). The ~20 business questions (author drafts, CEO approves) do not exist as far as this reading found.
- Layer: L6
- Stands on: B64 step 2 (owned work by named employees, `tasks.agent_id`), B64 step 8 (the dream proposes into this memory), an L2 model path for recall without an API key.
- Breathes: yes — the second run is better because the first was remembered.
- Waits on: AUTHOR (the 20 questions need his edit and approval).
- Overlaps: B64 step 8 (the dream only), C39, HERMES.
- Owner: **no Section 1 row owns the memory brain build** — separate work.

### THE FIRST LAW OF V2 — IT MUST BE ALIVE
- State: ruling in force; its acceptance test is his ("opens a screen, touches nothing, something changes"). Its 2026-08-02 numbers are history: company `agent_runs` today = 421, last started 2026-09-05 00:55 UTC (SELECT 2026-10-14) — idle since then, which is the construction's normal state, not a finding.
- Layer: L7
- Stands on: B64 (the company working), B10, B32.
- Breathes: yes — it is the definition of breathing.
- Owner: carried by B32 + B10 + B64 together; no rank of its own.

## Section 3 — the C42 programme (owned by B22)

All six waves: the board itself says their evidence was withdrawn (line 290-296) and they are "neither cancelled nor confirmed" until B22 re-derives them; only W-C42-4's two cells (ROAS per creative, revenue aggregator) are re-evidenced. So none of them is buildable as written.

### Wave 1 (W-C42-1) — "Hamza breathes": instant acknowledgement, visible state, no empty transcripts
- State: open — re-measure confirmed: 102 calls, 42 empty, last 2026-07-28 (SELECT above).
- Layer: L7
- Stands on: B12, B33.
- Breathes: yes
- Waits on: AUTHOR — still true.
- Overlaps: C54, C55, C56, C38, C57, C58, B12, B03.
- Owner: B22 for re-deriving it; its content is fully covered by B12 + C54/C55/C56/C38 — no rank of its own.

### Wave 2 (W-C42-2) — "The company is seen": the living command centre
- State: open — withdrawn evidence (the Conference Room, the constellation came from the rejected reading).
- Layer: L7
- Stands on: B22 (re-derivation), B32.
- Breathes: yes
- Waits on: AUTHOR + CEO (B03-bis login) — still true.
- Overlaps: B32, B10, C27, C61, C63, B01 (Conference Room ≈ meeting room).
- Owner: B32 (via B22) — no rank of its own.

### Wave 3 (W-C42-3) — "The briefing decides": a ranked morning briefing ending in his decision
- State: open — not measured in this reading.
- Layer: L7
- Stands on: B64 (step 6 morning reminder, step 8 the morning line).
- Breathes: yes
- Waits on: AUTHOR — still true.
- Overlaps: B64 steps 6 and 8 (the one morning line).
- Owner: no Section 1 row owns the briefing as a whole — partly B64; otherwise separate.

### Wave 4 (W-C42-4) — "The outside world comes in": mailbox, revenue aggregator, ads ROAS, calendar
- State: open — the two re-evidenced cells stand; "zero ad or revenue connectors" not re-measured here.
- Layer: L8
- Stands on: B64 step 5 (Gmail and Reception), B30 (WooCommerce official MCP), the approvals gate (L5).
- Breathes: yes
- Waits on: CEO (which accounts) — still true.
- Overlaps: B64 step 5 (mailbox), B30 (names W-C42-4), B28 (names it), B05 (payments/Gmail send), B17.
- Owner: split among B64 step 5, B30, B28 — the revenue aggregator (P38-2 read-only WooCommerce) and the calendar have no Section 1 row naming them.

### Wave 5 (W-C42-5) — "Work is durable": resume, retries with a reason, attempt caps on system jobs
- State: open — `packages/outbox-executor/src/scheduler.ts:455-458` still re-arms in `finally` unconditionally; `grep -rn retryLimit packages --include=*.ts` → 0 (2026-10-14). The business-task half (retry lineage with reason) is in B64 step 3 ("fails go back with the check's notes").
- Layer: L2
- Stands on: nothing beyond the existing scheduler.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B64 step 3 (B64's file names W-C42-5 for retry lineage), C40.
- Owner: the system-queue attempt cap has **no Section 1 row** — separate work (L2, a silent-billing loop guard).

### Wave 6 (W-C42-6) — "Money": revenue engine on evidence, halal allowlist, Merchant of Record
- State: open.
- Layer: L5 / L8
- Stands on: B28 (agency seat), the approvals gate.
- Breathes: yes (money in)
- Waits on: CEO — still true.
- Overlaps: B28 (names W-C42-6), B05, B17.
- Owner: B28 — mostly carried; the halal allowlist and Merchant of Record question are not named in B28's open list (not checked in B28.md beyond the ID grep).

### §3.3 Design law (six rules) and §3.4 refusals
- State: rules, not work; §3.4 moved to the rival ledger. §3.3 binds B32.
- Owner: B32; no rank.

---

## Reader D notes

**Contradictions with Section 1**
- B22 vs B64: B22's row says the synthesis "does not exist yet" and no design starts before he reads it; B64's file records "the first B22 synthesis chapter, Sol-checked, wait[s] for his eye" (2026-10-12), and his plan yes of 2026-10-14 starts B64 construction without the synthesis. `00-SYNTHESIS.md` is not on disk. The lead should settle what B22 still gates.
- C60 vs B64: B64's file lists C60 as "owned elsewhere", while B64 plan step 2 builds "the job's brief, plan, parts and cost in one place". Same for C56: B64 points to C56, but step 1 removes the button per §2d.
- B12 does not name C54, C55, C57, C58, C64 although it carries their substance; B32 names none of C27-C35, C61-C63. "Owned" today is by subject, not in writing.

**Items no Section 1 row owns**
- C26, C37, C38, C39, C40, C41, C52, C53, C57, C59 (C54/C58 sit beside B12 without being named).
- §2d V2 memory brain (worker wiring, concurrency, scope, relations, the ~20 questions, recall without an API key) — the largest unowned item; B64 step 8 owns only the dream.
- §2d HAMZA IN V2: "an employee never promises a system change, he opens a tracked row".
- §2d NOT FIT OPUS 5: the CEO's word on the five design packages (all switched off today).
- W-C42-3 briefing (beyond B64's one morning line); W-C42-4 revenue aggregator P38-2 and calendar; W-C42-5 attempt caps on system queues; W-C42-6 halal allowlist and Merchant of Record (if not in B28.md).

**Outdated by a later ruling or measurement**
- §2d "Order of work — this board, oldest first": replaced by his order of 2026-10-14 (this job's PLAN.md, step 6).
- §2d "Order of work, amended 2026-07-30 — context architecture first and nothing else": overtaken by the B51 plan (`b51-plan-approved-2026-10-09`) and the B64 plan (`b64-plan-his-yes-2026-10-14`); LAW A says the old text goes.
- §2d "Rival analysis first, then build": narrowed by `b64-plan-his-yes-2026-10-14` for B64's construction.
- §2d Cloud STT rejection waits on the workstation "Friday" — it has arrived; B33 later allowed a cloud voice lane for measurement only (`b33-voice-to-cloud-measurement-approved-2026-08-31`).
- C40's "study card is still a stub": filled 2026-08-30 (card header).
- C54 "44 %" and C55 "29-35 s": replaced by W-C42-1's own re-measure (41.2 %, 41.0 s), confirmed today for the share (42/102).
- C29's "23 skills / 18 plugins": company today skill 2, plugin 19.
- C64 "AUTHOR + HARDWARE": the hardware has arrived.
- §2d HAMZA IN V2 cites `answer.ts:122`; the line is now 148 (still `tools: []`).
- Section 3 waves as a whole: the board itself declares their evidence withdrawn until B22 re-derives them.
