# Reader A — rows B01-B12, B14-B18, B31-B35, B41, B42

Read 2026-10-14. Board: `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` (line numbers below are that file's).
Company measurements are SELECT-only through the company read gateway (`dxb_gateway`); the construction
engine was not queried.

### B01 — Boardroom: several directors discuss a question out loud while he listens
- State: open — nothing built; VOICE_INTERACTION_SPEC.md:22 still says the boardroom "stays deferred (D3)".
- Layer: L7
- Stands on: B12 (voice must be fast and hear right before several voices talk at once) · B64 row item 3 (he talks with any head directly) — the boardroom is many heads on the same line.
- Breathes: no
- Waits on: CEO (his order to build it) — still true.
- Overlaps: B64 item 3 (talking with a head directly) touches it; B12's target "also covers the directors talking among themselves".

### B02 — Small design symmetry defects he disliked; nobody wrote down which ones
- State: open — the row file has no list; no list found.
- Layer: L7
- Stands on: B32 (V2 design package) — the V1 screens these defects sit on are being redrawn (his 2026-08-01 ruling, recorded in B13's closure at board:372), so a list on V1 may be dead before it is used.
- Breathes: no
- Waits on: AUTHOR — still true, but see Notes: it may be absorbed by B32.
- Overlaps: B32 (every screen redrawn with him).

### B03 — His ear test of the voice line: say hello, ask a question, say goodbye, each answered aloud
- State: open — row says machine blocks 1-7 done 2026-07-25 and only his ear closes it; not re-measured.
- Layer: L7
- Stands on: B12 — B12 moves hearing and speaking onto the graphics card and changes the hearing model; an ear test before that move tests a voice stack about to be replaced.
- Breathes: no
- Waits on: CEO + HARDWARE — the hardware half is no longer true (B12 row: "The hardware blocker is gone"); the real wait is B12, then his ear.
- Overlaps: B12 (same voice line, same mic test).

### B04 — The University product: a separate product line
- State: open — never started, no architecture.
- Layer: L8
- Stands on: B64 (work must flow through the holding before a new product runs on it) — a new product is something the finished machine does.
- Breathes: no
- Waits on: CEO (his order to start) — still true.
- Overlaps: none found.

### B05 — Real payment, signature and mail-sending integrations (Stripe, DocuSign, Gmail send)
- State: open — frozen when Outleteuro was cancelled.
- Layer: L5
- Stands on: the approval gate for money out and contracts (L5 foundation; B64's approval card) — a live Stripe or DocuSign hook must sit behind his gate before it is wired.
- Breathes: no
- Waits on: CEO (a future order) — still true.
- Overlaps: the "Gmail send" third may overlap the Gmail/Reception rows of L8 (outside my list; not checked).

### B06 — The entrance exam for the Kimi 3 model
- State: stale — the row says the exam waits on OpenRouter balance; the model is now retired and banned. Evidence: company `select id,status,banned from model_catalog where id='kimi-3'` → `kimi-3|retired|t`; MODEL_ROUTING_SPEC.md:148 (B64 roster): "Out, `status='retired'` + `banned=true`: … Kimi 3"; migration `20260726001000_u21_quality_tier_law.sql:87,239` retired it on 2026-07-26.
- Layer: L2
- Stands on: nothing — it should leave the board (his word needed; board law 1).
- Breathes: no
- Waits on: CEO (money) — no longer true; a banned model is refused by the §4c onboarding chain itself (MODEL_ROUTING_SPEC.md:148).
- Overlaps: B51 (the model roster), B34 (the local model exam is the only exam still alive).

### B08 — He changes any one employee's brain (model) from the dashboard or by telling Hamza
- State: open — company: `pg_proc` has 0 rows for `fn_update_agent_brain`; agents 213, `brain_source` slot 203 · ceo_override 10. Step (0) done and accepted by his eye (board:96).
- Layer: L3
- Stands on: B51 / B64 roster (which models exist to switch between — the row still names Opus 5 and GPT-6 Astra, the B64 roster names Opus 5.5 ⇄ Fable 5.1) · B64 step 1's Hamza hands (Hamza's brain tool is one of them).
- Breathes: no
- Waits on: AUTHOR in the Waits-on cell, but the "why open" cell says steps (1)-(7) wait for his plan approval — the row contradicts itself; see Notes.
- Overlaps: B15 (same seam, MODEL_ROUTING §4b); B43 (the studio brain panel, step 7); B64 decision 3 (Hamza's effort levels, built on the construction engine 2026-10-14).

### B09 — Hermes, the always-on outside worker, has no working brain
- State: open — the holding's Hermes is not built; a local idle install exists (`~/.hermes/hermes-agent` present; no hermes process running, `pgrep -fa hermes` matched only a Claude session's text). Its brain choice is now settled on paper by B64 decision 15.
- Layer: L8
- Stands on: B11 (Hermes installed inside the holding — the brain is chosen at install) · the holding's server (money out, when the holding stands).
- Breathes: yes — once Hermes thinks, overnight work happens unattended.
- Waits on: CEO — the server, when the holding stands — still true.
- Overlaps: B11 contains it (B64 decision 15 picks the brain at install time); B10.

### B10 — Hermes and every night worker seen working on his dashboard, alive
- State: open — the V2 dashboard is not written; Hermes not installed (see B09/B11).
- Layer: L7
- Stands on: B11 (there must be Hermes work to show) · B32 (it "lands with V2's screens") · B64 decision 18 (the one nightly dream gives its first live card).
- Breathes: yes — this is the screen on which the company visibly works at night.
- Waits on: AUTHOR, with V2's screens — true, so in practice it waits on B32 and, behind it, B22.
- Overlaps: B09, B11; L7 "alive" rows outside my list (not checked).

### B11 — Hermes installed inside the holding, and its first unattended overnight job
- State: open — no server, no holding install, no proven overnight run (board:99); local idle install only.
- Layer: L8
- Stands on: B64 step 1 (the holding's tool and Hamza's morning line the job must reach) · the server purchase (CEO, money out) · B09's brain decision (now B64 decision 15).
- Breathes: yes — one unattended overnight job reaching his morning line is the company working while nobody watches.
- Waits on: CEO (server) + AUTHOR (install) — still true.
- Overlaps: B09 (contained), B10.

### B12 — Voice: he must be heard and answered within 1.0-1.3 seconds (today 2.73 s before any thinking)
- State: open — row: "Not one line of the move is done"; not re-measured here (would need a live round trip on the mic; UNVERIFIED that nothing moved).
- Layer: L7
- Stands on: B33 (the graphics card's floor and gatekeeper — the three voice models must stay resident and not be evicted by video guests).
- Breathes: no
- Waits on: AUTHOR, his ear for pronunciation — still true.
- Overlaps: B33 ("the floor installed (B12's work)" is listed in both); B03; B01.

### B35 — The machine driven like a human (mouse, keyboard, eyes) by every session and by the holding's agents
- State: open, partly done — the scripts and door are in git: `scripts/operator/op.py`, `scripts/operator/shot.py`, `.claude/skills/dxb-operator/SKILL.md`; `/usr/local/bin/operator` exists. Open: the holding's agents cannot reach these hands; the no-refusal law is not where agents read it at runtime; no second session proven from the door alone.
- Layer: L3
- Stands on: B41's 2026-10-04 leg (open tools behind two walls) — that is the path by which agents get hands at all · B64 step 1 (Hamza's hands).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B41 (agents reaching tools), B30 (the agents' hands and eyes), B31.

### B34 — A cheap local worker model on this machine for small jobs (sorting, tagging, summaries, drafts)
- State: open — the exam has not run, no model chosen. Measured: `ollama list` shows `qwen3.8-27b-uncensored` and `bespoke-minicheck`, but no Gemma; the row says Gemma 4 E4B is on the machine — not found in ollama's library folder (it may live elsewhere; UNVERIFIED).
- Layer: L2
- Stands on: B33 (the bench rule — the worker model is on the card's permanent floor) · B51 (the L4 local tier in the roster, "after the exam", MODEL_ROUTING_SPEC.md:148).
- Breathes: no
- Waits on: AUTHOR runs the exam · CEO picks — still true.
- Overlaps: B33 (worker model on the floor), B06 (the only other model exam — now stale).

### B15 — The autonomy dial: he raises one employee's freedom to act without asking, and it changes what they may do
- State: open — company: all 213 agents at `autonomy_level` 0. The 2026-10-14 "Hamza's levels" migration (`20261014020000_b64_hamza_levels.sql`) is about thinking effort, not autonomy.
- Layer: L5
- Stands on: B64 (decision 4 already replaces the four-box test for one-off jobs; the dial must know what an approval is first) · B08 (same §4b seam — one control pattern for brain and autonomy).
- Breathes: yes — employees finishing work without asking is what lets the company run itself.
- Waits on: AUTHOR — still true.
- Overlaps: B08; B64 decision 4.

### B14 — Learning from a video: he gives a link on his screen and the holding files what it learned
- State: open — `grep -rli video apps/dashboard/src/app` → no file.
- Layer: L6
- Stands on: B64 step 1 (a goal given on his surface must reach an owner; a video link is one such goal) · B32 if the entry point is to land on V2 rather than V1.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: none found in my list.

### B16 — The study gate we set and walked past: the ~100 repositories he gave were never properly studied and installed
- State: open — `LITERATURE.md:4` still says "W1 TAMAM"; last commit on the file 2026-08-27 (`chore(arsenal)…`).
- Layer: L3
- Stands on: C30 — the row closes with C30 by its own text.
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: C30 (it is C30's internal statement), B30, B41, B42.

### B17 — The sixteen revenue ideas, re-measured against today and shown to him as one table
- State: open — `REVENUE-OPPORTUNITIES.md:5` still "W1 … (2026-07-09)"; its only commit is 2026-07-09.
- Layer: L8
- Stands on: nothing technical — it is a report; it reads truer after B64 (what the holding can actually deliver).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: revenue rows in L8 outside my list (not checked).

### B18 — Filters exist on only nine list pages; on the rest he reads whatever the page shows
- State: open — `grep -rl FilterBar apps/dashboard/src/app` → 9 files, as the row says.
- Layer: L7
- Stands on: B32 — V2 redraws every screen; filters added to V1 pages may be thrown away.
- Breathes: no
- Waits on: AUTHOR — true, but see Notes (V1 vs V2).
- Overlaps: B32.

### B42 — The arsenal watch: our tool versions with a last-checked date, the world's best per domain, and Hamza's one line when we are surpassed
- State: open — company `library_items` has a `version` column but no last-checked/domain column (information_schema query matched only `version`). The arsenal test red since 2026-09-27 was not re-run (a battery is running; it reads profiles — UNVERIFIED today).
- Layer: L3
- Stands on: B31 (the drawers by job domain — "best in the world per domain" needs the domain field) · B64 step 1 (Hamza must be able to speak an unasked line).
- Breathes: no
- Waits on: AUTHOR for the three legs, CEO for paid upgrades — still true.
- Overlaps: B31 (same missing fields on `library_items`), B41, B16/C30.

### B41 — The supply chain: a worker mid-task asks for a missing tool and gets it (search, scan, grant); and open tools for Hamza and every employee behind two walls
- State: open — company: `library_usage_log` 0 rows, `library_grants` 188, `library_items` 417. A first slice (dxb-design granted to design seats) went live 2026-10-13 and waits for his eye (board:127).
- Layer: L3
- Stands on: L1 grants and the "two walls" (databases apart, each at its desk) · B31 (the drawers the chain searches).
- Breathes: no
- Waits on: AUTHOR / CEO for purchases — still true, plus his eye on the 2026-10-13 slice.
- Overlaps: B35, B30, B42; the 2026-10-04 leg is really a second job (see Notes).

### B33 — The graphics-card workbench: a permanent floor (ear, mouth, worker model), guests one at a time, one gatekeeper
- State: open — no gatekeeper code: `grep -rli "gatekeeper\|bench-gate"` in scripts/, packages/, tools/ → only `scripts/governance/ceo-approvals.json`.
- Layer: L2
- Stands on: nothing on the board — it is the foundation B12 and B34 stand on (STACK.md's no-second-runtime rule applies).
- Breathes: no
- Waits on: AUTHOR — still true.
- Overlaps: B12 (the floor install), B34 (the worker model), B31 (the bench display on the armoury tab).

### B32 — The V2 design package: every V2 screen drawn and shown to him, one at a time, before any is built
- State: open — no V2 folder (`apps/*v2*` absent; only a planning folder `.planning/quick/20260710-beklentiler-master-plan-v2`).
- Layer: L7
- Stands on: B22 — the rival synthesis plan; B22's row (board:137): "No design work starts until he has read it", and it does not exist yet.
- Breathes: no (it is drawings) — but most "alive" screens stand on it.
- Waits on: AUTHOR draws · CEO approves; behind B22 — still true.
- Overlaps: B02, B18, B10, B43's screen, B31's tab.

### B31 — The armoury: one tab with his tools in drawers by job, free beside paid with a price
- State: open — company `library_items` has no domain, cost class, price, licence or free-to-paid field (column query matched only `version`); the tab does not exist.
- Layer: L3
- Stands on: L1 schema migration chain (new columns) for the data half · B32 for the tab half.
- Breathes: no
- Waits on: AUTHOR for schema, research, tab; CEO for purchases — still true.
- Overlaps: B42 (same fields), B41, B33 (its bench display lives on this tab).

## Reader A notes

- **B06 is stale**: Kimi 3 has been retired and banned since 2026-07-26 (company `kimi-3|retired|t`; MODEL_ROUTING_SPEC.md:148). The row still waits on money for an exam the routing law would refuse. Also, MODEL_ROUTING_SPEC.md:304 still says kimi-3 is a `testing` candidate, which contradicts line 148 in the same spec.
- **B08 contradicts itself**: its "why open" cell says steps (1)-(7) wait for his plan approval, and its Waits-on cell says AUTHOR. Its text also predates B64: "Hamza switchable Opus 5 ⇄ Fable 5.1" and the "Fable 5.1 · GPT-6 Astra · Opus 5" top tier, while the B64 roster (MODEL_ROUTING_SPEC.md:148) says main brain Opus 5.5, backup Fable 5.1, and does not list Astra.
- **B09 is contained in B11**: B64 decision 15 chooses Hermes's brain at install time, so B09 ("no brain") cannot close before B11 ("installed") does, and it closes along with it. They are one job with two board rows.
- **B41 is two jobs**: the worker-asks-for-a-tool supply chain (five links), and the 2026-10-04 "open tools behind two walls" leg, which has its own closing probe (`OPEN_TOOLS=2/2 WALLS=4/4`). The second leg is also what B35's "agents able to reach the same hands" needs.
- **B12 and B33 both own "the floor installed"**: B33 lists "the floor installed (B12's work)" as its own open item.
- **B03's "HARDWARE" wait is no longer true**: B12 says the hardware blocker is gone. B03 now really waits on B12, and only then on his ear.
- **B16 and C30 disagree on a fact**: B16 says "all 76 study cards are substantially written, none is a stub", and C30 (board:170) says "most study cards were stubs".
- **V1 against V2**: B02 and B18 (and B14's entry point) are V1 screen fixes, but the V1 interface was ruled dead on 2026-08-01 (B13 closure, board:372) and B32 redraws every screen. Their "Waits on: AUTHOR" is true on paper, but in practice the work waits on B32, which waits on B22.
- **B22's hold has been bypassed once**: "No design work starts until he has read it" (board:137) still holds B32 back, but B64's design ran on his own word in the meantime. This is worth naming to him when B32 gets its rank.
