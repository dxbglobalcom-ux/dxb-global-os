# 19 — lukebuildsai · *"My $30K/mo app runs on this AI setup"*

**WHY IT MATTERS TO THIS HOLDING.** Measured in this session, 2026-08-10, against the company
database and the repository: **21 departments · 205 agent rows · 199 written personas · 217 tasks
(213 done) · 0 task events in the last 24 hours**, and `v_objective_progress` holding **2
objectives whose realised revenue is 0.00**. The FIRST LAW OF V2 says the company must be visibly
working when nobody is watching, and the CEO's acceptance test is that he opens a screen, touches
nothing, and something changes because the company did work.

This source is the **third film of the same man** (sources 01 and 18 — `lukebuildsai`), and it is
the one that shows **the surface he keeps permanently on a wall** plus **the runtime underneath
it**, named part by part. Two of our open gaps are exactly what it displays: a surface that is
attached to the work rather than opened to find out, and one card that turns a target into a
target-actual-gap-ETA statement. `v_objective_progress` already carries those columns and has no
such surface.

---

## 1. Source identity

| Field | Value |
|---|---|
| Address | `https://www.instagram.com/reel/DZc0F3Nx2rb/?igsh=ZHV5YXpwZTBzdzcx` |
| Uploader | **Luke Cutting — `lukebuildsai`** (same author as sources 01 and 18; identified from the wall dashboard and the room, which match `01-lukebuildsai-jarvis.md`) |
| File | `media/19-DZc0F3Nx2rb.mp4`, 14,638,492 bytes |
| sha256 | `2c340df407753e7c64b1ffd48eb0bc0415080a9de0ae82ee84c5930a8628590d` |
| Video | **1080 × 1920**, VP9, **30 fps**, **41.31 s** — above the 720p floor |
| Audio | **kept** — AAC, 44.1 kHz, stereo |
| Transcript | `transcripts/19.json` — English, 9 segments, duration `41.3096875` s, which matches `ffprobe` (`41.310000`) to 0.01 s; reused after that check, not regenerated |
| How watched | the 41 native frames of `frames/19/` in order with the transcript beside them, then a **10 fps dense pass** (`zoom/19/dense/`, 60 frames over 24.0-30.0 s) and native crops cut from the video with `ffmpeg -ss … -vf crop=…` for every figure below |
| Caption burned into the film | **"My $30K/mo app runs on this AI setup 👀"** |
| Shot | one continuous take, handheld, of a wall TV running Chrome at **`localhost:3000`**; the dashboard clock advances 1:1 across the whole take (§ Aliveness), so the film carries no cut |

---

## 2. Watched record — 41 s in order, with the voice and what stood on the wall

Voice column is the transcript, timestamped. Screen column is what the TV carried at that second.

| Time | Voice / caption | On the wall |
|---|---|---|
| 00:00 | caption: *"My $30K/mo app runs on this AI setup 👀"* · *"I got this whole Jarvis setup running with a…"* | J.A.R.V.I.S. page, orb centred, objective card at the bottom |
| 00:02 | — | clock block legible top-right; page header `J.A.R.V.I.S. · JUST A RATHER VERY INTELLIGENT SYSTEM` |
| 00:04 | *"…Mac Mini and Hermes agent."* | he points at the screen; four state chips under the header |
| 00:05 | *"The Mac Mini is the home base…"* | he turns to the desk; the Mac mini is visible on the shelf below the monitors |
| 00:06 | — | dashboard clock reads **`18:06:24.5`** |
| 00:07 | *"…this is where everything is hosted,"* | camera back on the TV; objective card `$30,000 MRR` legible |
| 00:09 | *"and Hermes is the agentic harness that lets Jarvis…"* | orb + ring + radar dial unchanged in layout |
| 00:12 | *"…connect to tools, remember context, and actually do work."* | telemetry column scrolling on the left |
| 00:15 | *"Then I'm using separate Hermes profiles for all my sub-agents."* | no page change — one page for the whole take |
| 00:17 | *"Each one has its own instructions, skills,"* | — |
| 00:20 | — | dashboard clock reads **`18:06:38.54`** |
| 00:22 | *"memory, and knowledge base,"* | objective card: `$30,000 MRR` · `$13,511` · `$16,489` |
| 00:23 | *"so they're not all pulling from the same generic setup."* | — |
| 00:24 | — | dashboard clock reads **`18:06:42.56`**; sharpest frame of the take (`zoom/19/dense/d008.jpg`) |
| 00:26 | *"All of them are connected to Slack,"* | header chips `ONLINE` · `SECURE` · `ENCRYPTED` · `AUTO-L…` |
| 00:28 | *"Telegram, iMessage, and Voice,"* | `AUDIO SIG` waveform panel on the right |
| 00:30 | *"so I can talk to my agents…"* | `DIAGNOSTICS` log on the right, timestamped lines |
| 00:32 | *"…from pretty much anywhere. And the part that makes it feel like Jarvis…"* | — |
| 00:34 | *"…is the UI and Voice."* | he raises a hand towards the TV |
| 00:36 | — | dashboard clock reads **`18:06:54.54`** |
| 00:37 | *"I built the UI with Codex"* | — |
| 00:39 | *"and trained Jarvis's voice using 11Labs,"* | — |
| 00:41 | *"so he can respond back to me out loud."* | last frame; same page, same layout |

**The film shows one screen for its whole length.** There is no second surface in it — no chat
window, no Slack, no editor. Whatever else his system has is outside this film.

---

## 2.2 Design and appearance — measured in pixels

All figures are the **film's rendering** of his screen (camera and TV panel included), taken from
the sharpest frame of the take, `zoom/19/dense/d008.jpg`. The relationships are what survive the
camera, and the relationships are what a build uses.

### 2.2.1 Composition — the ground is the design

| Measurement | Value |
|---|---|
| Lit TV area in the frame | **980 × 579 px = 27.3 %** of the 1080 × 1920 film frame |
| Page area inside the browser | **970 × 525 px** |
| Left data column (`SYSTEM VITALS` + `TELEMETRY`) | 170 px = **17.5 %** of page width |
| Right data column (`PROXIMITY` + `AUDIO SIG` + `DIAGNOSTICS`) | 170 px = **17.5 %** |
| Centre stage between them | **64.9 %** of page width, carrying one object |
| The orb | 258 px wide = **26.6 %** of page width, optically centred |
| The objective card | **233 × 119 px = 24.0 % × 22.7 %**, bottom-centre |
| Ink: pixels brighter than 40 / 70 / 110 / 160 (of 255) | **78.6 % / 22.7 % / 10.8 / 1.8 %** |

**What that says:** two thin data rails hold the edges, two thirds of the width is left to a single
identity object, and **only 1.8 % of the page is bright**. Light is rationed, and what receives it
is a figure, not a frame.

### 2.2.2 Palette — sampled from the pixels, not named by eye

| Patch | Mean | Brightest pixel |
|---|---|---|
| Screen ground (empty upper-right) | `#151C51` | `#192056` |
| Panel ground behind the vitals | `#1F3E96` | `#A8FFFF` |
| Orb core | `#0D39F2` | `#A6D8FF` |
| Orb ring | `#1A31B7` | `#5571F6` |
| Objective card ground | `#325CD3` | `#EAFFFF` |
| Target numeral `$30,000` | `#3678DA` | `#E1FFFF` |
| Vitals bar fill | `#2443A2` | `#6E9BFF` |

**One hue family — blue — from `#151C51` to `#325CD3`, and brightness is the only variable.** The
objective card's ground is the lightest surface on the page, which is how it lifts off without a
second colour, and the only near-white on the page (`#E1FFFF`, `#EAFFFF`) is spent on **numbers**.
Sources 01 and 18 measured the same page on other days with the same single-hue result
(18: ground `#182A68`, card `#072A96`, numeral peak `#ABF8FF`), so this is his system's rule and
not one camera's white balance.

### 2.2.3 Type — the figure is four times its own label

Measured by row-projection of ink inside the objective card:

| Band | Height as filmed |
|---|---|
| Caption row (`TARGET`, `REVENUE · MRR`, `GAP`) | **≈ 5 px** |
| Figure row (`$30,000`, `$13,511`, `$16,489`) | **19-20 px** |
| Secondary rows (`PROGRESS`, `STATUS`, `ETA`) | ≈ 7 px |

**Ratio figure : label ≈ 4 : 1**, labels in wide-tracked small caps, figures in a monospaced face.
The label is small enough to be read only when wanted; the figure is readable from across a room —
which is what a surface on a wall has to be.

### 2.2.4 Ornament that carries no data, and earns its place

Corner brackets on every panel, a dotted outer ring around the orb, a fixed grid behind the centre
stage, and a radar dial on the right. None of them carries a value. They do one job: they make a
web page read as an **instrument** rather than a document. **UNREADABLE** at this camera distance:
the typeface names, and the exact digits of the `SYSTEM VITALS` values (the six rows themselves —
`NEURAL CORE`, `MEMORY`, `LATENCY`, `SIGNAL`, `THERMAL`, `THROUGHPUT` — are legible). Settling
those would need a screen recording of the page or its CSS.

### 2.2.5 What DXB takes from the design

1. **One hue, brightness as the only variable, near-white reserved for figures** — into
   `DESIGN_SYSTEM.md` as a rule, replacing per-page colour choices.
2. **The 4:1 figure-to-label ratio and wide-tracked small-cap labels** — the same file.
3. **Two thin rails, one centre stage** — the shell in `CEO_COMMAND_CENTER_SPEC`: telemetry never
   competes with the object the CEO came to see.
4. **Bright ink under 2 % of the page** — a measurable ceiling a Phase-4 design pass can be
   checked against, rather than an adjective.

---

## 3. Capabilities

### 3.1 The runtime he names, part by part

| Time | Part | His words |
|---|---|---|
| 00:00-00:07 | **Machine** — a Mac mini as the always-on host | *"The Mac Mini is the home base, this is where everything is hosted"* |
| 00:07-00:14 | **Harness** — `Hermes`, an agentic harness | *"Hermes is the agentic harness that lets Jarvis connect to tools, remember context, and actually do work"* |
| 00:14-00:23 | **Per-agent profiles** — one Hermes profile per sub-agent, each with **its own instructions, skills, memory and knowledge base** | *"so they're not all pulling from the same generic setup"* |
| 00:23-00:32 | **Four channels** — Slack, Telegram, iMessage, Voice | *"so I can talk to my agents from pretty much anywhere"* |
| 00:32-00:38 | **The UI**, built with **Codex** | *"the part that makes it feel like Jarvis is the UI and Voice"* |
| 00:38-00:41 | **The voice**, trained on **ElevenLabs** | *"so he can respond back to me out loud"* |

Three of the six are stated in the voice only; the film's own picture covers the machine (the Mac
mini is visible on the shelf) and the UI (on the wall).

### 3.2 The dashboard, panel by panel

| Panel | What it carries |
|---|---|
| Header | `J.A.R.V.I.S. · JUST A RATHER VERY INTELLIGENT SYSTEM`, and beneath it the mission line `OBJECTIVE — BUILD $30K MRR BUSINESS IN 6 MONTHS` |
| State chips | `ONLINE` · `SECURE` · `ENCRYPTED` · `AUTO-L…` (fourth chip UNREADABLE) |
| Clock block | running clock to hundredths, the date, a session id, latitude/longitude and altitude/heading |
| `SYSTEM VITALS` | six named rows, each a label, a bar and a value |
| `TELEMETRY` (left) | timestamped machine lines — `opt.handshake mask applied`, `vector-query latency 12ms`, `tokenizer.run ctx resumed`, `attention.head[4] sync complete`, `context.load throttle 0.8x`, `neural.inference sync complete`, `core.heartbeat sync complete` |
| `PROXIMITY` | a radar dial with a sweep |
| `AUDIO SIG` | a waveform strip |
| `DIAGNOSTICS` (right) | timestamped lines — `whisper.decode edge detect`, `core.heartbeat lock acquired`, `gpu.thermal sync complete`, `vector.query edge detect`, `audio.stream mask applied` |
| Bottom-left quad | `MICROSITE LINK · STABLE` · `VOICE PRINT · VERIFIED` · `SUPPORTING LINKS · …` · `OBJECTIVE LOCK · ENGAGED` |
| Bottom-right | uplink / downlink / packet loss / nodes |
| **`PRIMARY OBJECTIVE` card** | the table below |

**The objective card, read from `zoom/19/obj-best-x7.jpg`:**

| Field | Value on screen |
|---|---|
| Heading | `PRIMARY OBJECTIVE` · right-aligned `MISSION · REV-01` |
| Target | **`$30,000 MRR`** — largest type on the page |
| Revenue · MRR | **`$13,511`** |
| Gap | **`$16,489`** |
| Progress | segmented bar + `PROGRESS · 45.0%` |
| Status | `STATUS · IN PURSUIT` |
| ETA | `ETA · Q_ 2026` (quarter digit UNREADABLE) |
| Volume | `SUBSCRIPTIONS · 1,9__` · `TRIALS · ___` (last digits UNREADABLE) |
| Freshness | `SYNC · 18:06:2_` — the card says when it last knew |

**The card's own arithmetic closes:** `30,000 − 13,511 = 16,489`, and `13,511 ÷ 30,000 = 45.04 %`,
which the card prints as `45.0%`. That agreement is what let this report settle the third digit of
the revenue figure, which the camera alone left ambiguous.

### 3.3 What this source produces

- The film's caption states **`$30K/mo`**. The card on the wall states `$30,000 MRR` as the
  **target**, `$13,511` as the current MRR, `IN PURSUIT` as the status, and a gap of `$16,489`.
- **The same card, in the same man's other film (source 18), carried different figures:**
  `REVENUE · MTD $15,897` · `GAP $14,103` · `PROGRESS · 53.0%` · `ETA · Q2 2026` ·
  `SUBSCRIPTIONS · 1,432` · `TRIALS · 78` · `SYNC · 14:02:47`. Across two films of the same
  surface the target holds at `$30,000` and every other figure has moved. **The card carries values
  that change, not a picture.**
- The CEO knows these systems first-hand (evidence **C**, master directive §2), and his knowledge
  outranks any reading of a 41-second advertisement.

### Aliveness — how this system is built to live, and what DXB takes

**1 — What runs on its own clock.** The dashboard clock, read from four native crops:

| Video time | Dashboard clock |
|---|---|
| 06.5 s | `18:06:24.5` |
| 20.5 s | `18:06:38.54` |
| 24.5 s | `18:06:42.56` |
| 36.5 s | `18:06:54.54` |

**30.04 s of dashboard time across 30.0 s of film — a rate of 1.001×, drift under 0.05 s.** The
page is rendering against the machine's own clock while nobody touches it, and because the clock
never jumps, **the 41 s take is continuous**. The `TELEMETRY` and `DIAGNOSTICS` columns carry their
own timestamps in the same format, i.e. the page is written to say *when*, everywhere.

**2 — What makes the surface breathe, timed.** A 10 fps dense pass over 24.0-30.0 s (59 pairs,
100 ms apart) was aligned by phase correlation on the whole TV to remove the handheld camera, then
each region was compared against static text **on the same screen in the same frames**:

| Region | Change per 100 ms, normalised by the region's own contrast |
|---|---|
| The orb | **0.520** |
| Static text control — the chips row | 0.347 |
| Static text control — the card's label row | 0.418 |

The orb sits **24-50 % above the floor** that fixed text produces under the identical camera
motion. **UNVERIFIED — the orb's period, direction and repeat rate**: a handheld shot of a TV
leaves a residual floor of 0.35-0.42 in these units, which is the same order as the signal, so the
motion cannot be timed from this film. Settling it needs a screen recording of the page, or a
tripod shot; the reading above is what this file could measure.

**3 — How it answers the human.** Stated in the voice: four channels (Slack, Telegram, iMessage,
Voice) reach the same agents, and the reply comes back **out loud** in a trained voice. This film
carries no exchange, so a response latency could not be taken from it; source 18 — the same man's
Slack workspace — is where that timing was measured.

**4 — What DXB takes.**
- **A clock, and a `SYNC` stamp on every card** — the machine says when it last knew. Ours carries
  a freshness element on **3 of 61** pages, measured this session.
- **A permanent surface** — one page built to be left running on a wall, not opened to check.
- **The objective card as our own default view of `v_objective_progress`** — target, actual, gap,
  progress, status, ETA, volume, sync, in one rectangle 24 % of the page wide.
- **One identity object that moves while the company works** — with its motion specified as a
  measurable rate rather than an adjective, since this film could not supply one.

---

## 4. What DXB has today — measured this session, 2026-08-10

| Fact | Measurement | Command |
|---|---|---|
| Departments / agents / tasks | **21 / 205 / 217** (213 done, 3 returned, 1 failed) | `psql -Atc "select count(*) …"` in `supabase_db_DxB_Global_OS` |
| Written personas | **199** files | `find personas -name "*.md" -not -name README.md` |
| Work in the last 24 h | **0 task events** | `select count(*) from task_events where created_at > now() - interval '24 hours'` |
| Objective engine | `v_objective_progress` **exists** and already carries `target_eur`, `realized_revenue_eur`, `gap_eur`, `days_left`, `run_rate_eur_per_day`, `status` | `select * from v_objective_progress` |
| Objectives in it | **2** — `€50 net` (draft) and `e2e door proof` (closed); realised revenue **0.00** on both | same |
| Where it is rendered | `apps/dashboard/src/app/(command)/revenue/objectives/page.tsx` + `revenue/page.tsx` — pages a person navigates to | `grep -rl v_objective_progress apps packages` |
| Permanent / wall surface | **none** — the only match for `kiosk\|wallboard\|always-on` is a CSS comment in `components/primitives/panel.tsx` | `grep -rl` over `apps/dashboard/src` |
| Freshness stamp | **3 of 61** pages have a component carrying `lastUpdated\|last_updated\|freshness` | `grep -rlE` + `find … -name page.tsx \| wc -l` |
| Voice | `apps/jarvis` + a local Speaches container, up 2 days | `docker ps` |

**The columns his card displays, we already compute.** What is missing is the surface, the
freshness stamp and the status word — not the arithmetic.

---

## 5. The build project

| # | Project | Lands in | Definition of done |
|---|---|---|---|
| P19-1 | **`PRIMARY OBJECTIVE` card** over `v_objective_progress`: target, actual, gap, progress %, status word, ETA, volume, and a `SYNC · hh:mm:ss` stamp, in one rectangle at 24 % of page width with the 4:1 figure-to-label ratio | `CEO_COMMAND_CENTER_SPEC` | The card renders our two live objectives with the gap computed on screen, and its sync stamp advances |
| P19-2 | **Wall mode** — one route that is opened once and left running: clock, objective card, work telemetry, no navigation chrome | `CEO_COMMAND_CENTER_SPEC` (shell) | Opened, untouched, it visibly changes when the company does work — the CEO's own acceptance test |
| P19-3 | **`SYNC` stamp as a shell primitive** — every panel says when it last knew | `DESIGN_SYSTEM.md` + `OBSERVABILITY_SPEC` | 61 of 61 pages carry it, from one component |
| P19-4 | **Single-hue palette law** — one hue family, brightness the only variable, near-white reserved for figures, bright ink ≤ 2 % of a page | `DESIGN_SYSTEM.md` | A Phase-4 design pass measures the page and the figure holds |
| P19-5 | **Per-employee context isolation check** — his rule is that no two sub-agents pull from the same generic setup: own instructions, own skills, own memory, own knowledge base | `dxb-hamza-context` two-layer contract + `MEMORY_ARCHITECTURE` | Measured per agent, not asserted. **Not measured this session** — this row opens as a check, not a claim |

**No implementation starts before the CEO approves the visual design package** — the
2026-07-29 directive, and it is unchanged by this report.

---

## 6. Verdict

The 41 seconds carry two things worth the queue's time. First, **a runtime named part by part** —
an always-on Mac mini, one agentic harness, a separate profile per sub-agent with its own
instructions/skills/memory/knowledge base, four channels into the same agents, a UI built with
Codex and a voice trained on ElevenLabs. Second, **the surface**: a page that runs on the machine's
own clock at 1.001× with under 0.05 s of drift over 30 s, spends 1.8 % of its pixels on light, and
puts one card at the bottom of the stage that states a target of **`$30,000 MRR`** against
**`$13,511`** with the **`$16,489`** gap already computed, `IN PURSUIT`, and the time it last
synced. His other film shows the same card at `$15,897` and `53.0 %`, so those figures move with
the business.

What this holding takes is the card, the clock, the sync stamp and the wall — four things we can
build on numbers `v_objective_progress` already computes, and which today have no surface.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-10 | Written from the source. Row 19 claimed at `2026-08-10T17:11:28Z`, watched as 41 native frames in order with the transcript plus a 10 fps dense pass, all figures cut from the video; transcript reused after its duration was validated against `ffprobe`. Reported the same session. |
