---
gsd_state_version: 1.0
milestone: v2.0
status: executing
last_updated: "2026-07-30"
session_author: opus-5
---

# STATE — where the work stands today

<!-- HISTORY -->

**This file is a photograph, not a history.** One page, current only. It was a 26-page narrative
that contradicted itself in three places until 2026-07-30; that narrative is frozen in
`.planning/STATE-ARCHIVE.md` and may never be cited as current state.

**One fact, one owner.** What is still open lives on the board and nowhere else. What the plan is
lives in the corpus and nowhere else. This file says only where we stand and what happens next.

## The CEO's live order

**2026-08-16/17 — the holding moved to the workstation, and it is measured, not assumed.** He
ordered a clean move ("tertemiz cillop gibi bir taşıma") with one binding condition: **nothing is
deleted on the X230**.

**THE CUTOVER HAPPENED ON HIS ORDER, 2026-08-17 16:23 — `DXB-Center` (192.168.178.44, user `dxb`)
IS THE LIVE MACHINE.** His words: *"git geçmişini de birleştir, servisleri PC de kur"*, after
*"oradaki opus 5 ile devam ederim ben"*. The sentence that stood here — *"the laptop is still the
live machine"* — is deleted by that order (LAW A). Measured, not assumed: the two histories had
genuinely **diverged** (the workstation committed the same work separately at 16:09 while this
session was running) and are now **one history, merged with no conflict and nothing lost** — both
machines read commit `8046e767` with the identical tree `c80e13db`, both working trees clean,
`tsc` exit 0, governance gates **23/23**. The resident services are **stopped and disabled on the
X230** (unit files left in place — nothing deleted) and **installed and running on the
workstation** through the repo's own `scripts/systemd/install.sh`: both `active`, **0 restarts**,
`linger` on so they survive logout, exactly one node process each, and the queue is demonstrably
working — **117 pg-boss jobs in ten minutes, 15 schedules live**. Nothing of the company was lost
in the switch: company memory is **74 rows on both machines**, and the entire 367-row difference
is the construction diary. **JARVIS runs but cannot speak or hear yet** — its log says
`speaches unreachable for cue synthesis — retrying in 30s`, which is the fail-soft behaviour
working as designed and is exactly the gap board row **B12** now carries.

**AND THE SAME HOUR HE STOPPED BOTH SERVICES: *"iki serviside şimdilik durdur"*.** The reason
outranks the machinery: **V1 is dead and everything is built again**, so the engine was turning
for a product with no future — 20 minutes of `chat.drain`, `voice.drain`, `intent-intake`,
`task.worker` and `outbox-tick` against 0 open tasks, 0 pending approvals, no incoming message
and no revenue. Both services are now **installed, `disabled` and `inactive` on BOTH machines**,
unit files in place, zero processes. They start again the day V2's spine exists.

**The machine, measured 2026-08-17:** Ryzen 9 7900X — **24 threads against the X230's 4** · 30 GB
RAM against 7.4 GB (which sat at 385 MB free with 3 GB of swap in use) · 1.8 TB NVMe at 2 % against
164 GB at 92 % · **RTX 5060 Ti, 16,311 MB, CUDA proven from Python** against no GPU at all. The
test battery: **701 passed / 6 failed / 37.6 s** there against **685 / 22 / 125.2 s** here. The new
machine is not merely bigger — it fails less.

**What the move exposed, and what it means.** Three defects were the author's own and are fixed
(the `.env.example` files excluded by a rule-ordering mistake; the workstation's own Codex config
overwritten with `/home/ghost` paths; and `--no-privileges` on the restore, which stripped **131
privilege grants** and left `anon` able to truncate tables the dashboard reads — all 824 grants now
match). One was the repository's and is fixed in commit `388ef52`: **`packages/hr` and
`packages/revenue` were never compiled at all** — absent from the root tsconfig — and nine
build-order links were missing across three packages. It passed on the X230 only because stale
`dist/` folders masked it. **A clean machine is an auditor.** One claim the author made was wrong
and was withdrawn by measurement: the repository *can* be installed from scratch — `bootstrap-db.sh`
applied 154 of 154 migrations to an empty database; `supabase start` was simply the wrong door.

**B12 is unblocked and is now the most valuable open row.** Its hardware arrived. The gap it must
close was measured against the rivals the same session: J.A.R.V.I.S answers in **1.30 s**, source 21
in 2.55-5.40 s, and **our 102 voice calls sit at a median 32,684 ms** — of which **hearing is
20,083 ms**. The killer is `faster-whisper-small` on a CPU, and rival report 21 already fixed the
target in his own words: **"1.5 s round trip — HIS FIGURE, no exception."** Row 4.2 (STT →
`whisper large-v3-turbo`) takes 20 seconds out of 32.7 in one move. No local model runner is
installed on the workstation yet.

**Open legs of the move live on board row B29** — the bulk folders still transferring, three
root-owned MySQL files that permissions refused, the resident services deliberately not started
(two machines running them would act twice and split the database), and his workstation password,
which was typed into a transcript and should be changed.

---

**2026-07-30 — the context architecture, both layers.** His session focus, in his words:
*"şuan sadece odak noktamız bu directive paketi o kadar ve bu context engineering işi… rakip
analizi vs bunlar hepsi sonra."* He approved the eight-step plan, Hamza included, and added two
laws now written into `.claude/CLAUDE.md`:

- **LAW A** — a live CEO order deletes what contradicts it. Not a footnote beside it.
- **LAW B** — finished ≠ approved. *"iş tamamlanınca bitti anlamına gelmez, ben bakmam lazım."*
  Only his own eye accepts. No record may claim his approval without a registered entry.

Board row **B21** carried this work and is **CLOSED — he tested it himself and accepted it**:
*"kabul ediyorum"* (2026-07-31). His first test failed and is recorded on the board with its two
causes; his second passed. Nothing else on the board is accepted by that word.

## The newest written directive

**`docs/ceo-directives/2026-07-reanalysis/` (CEO, 2026-07-29)** — the correction, re-analysis and
design directive. It **supersedes the previous competitor-analysis conclusions and any plan built
on them**, and it forbids implementation until he has approved a visual design package. It is the
highest-ranking written source after his live order. Not started: he has ordered it after the
context work.

## What is open

`HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` — the single register. Order of work is his:
**oldest first**, unless he names a focus for the session, which outranks it.

Waiting on him, not on the author: his approval of the design package · one hand-minted browser
session so authenticated surfaces can be checked by eye (B03-bis) · the connector accounts (W-C42-4)
· money for the paid model exams (B06, B09) · the administrator password for the two root-level
fixes behind the editor crashes (C65) · the acceptance session itself (B13).
Waiting on hardware: the workstation, and the local voice models chosen by measurement (B12).

## Honest position

The holding **does not earn yet and has never been switched on end to end.** Revenue realised:
zero. The structure, the rules, the 199 written employees and the two-language discipline are real
and measured — and unproven, because none of it has produced anything. That is the CEO's own
verdict and it stands until a measurement replaces it.

**The completion percentage is deliberately absent.** The roadmap's status token is not
machine-readable, so every session re-derives a different figure — the drift is recorded in the
archive and owned by board row **B20**. A number nobody can reproduce is worse than no number.

## Next — read this before doing anything

1. **B22 — the rival re-analysis is the work in hand.** <!-- OPEN: B22 -->

   **WHY IT EXISTS — order C42, sharpened 2026-08-09:** *"bu rakip video raporlarını niye
   hazırlıyoruz adam gibi hatırlamanız lazım."* He hands over a rival; the author watches it whole,
   reports what that rival **PRODUCES**, then builds the same **or better** — *"RAKİPLERİMİZDEN ÇOK
   İİ OLSUN."* It is the parts list for **the Ferrari**, not research, and **no design work starts
   until every source is watched.** A sentence not traceable to the source is `UNVERIFIED`, or it
   is not written. Full reason: `.claude/skills/dxb-rival-intel` + ledger §Why this exists.

   **The queue position is NOT copied here.** It has one home — the `NEXT:` line at the top of
   `.planning/research/rival-intel/00-LEDGER.md`, printed by `scripts/rival-intel/next.sh`. A copy
   in this file is exactly the stale number he caught on the board on 2026-08-10 (it said
   `16 of 35 · NEXT: 19` while the ledger said 18 and 21). Run the script; never quote a count.

   **Source 20 (2026-08-10) is No Hype Ai (`_no_hype_ai`) — a complete four-stage loop with no
   human inside it**, and it lands on our sorest measurement. A sentence dictated into a phone
   becomes a filed note: `cron · hourly` wakes a **read-only** classifier (`Haiku 4.5`) that emits
   one typed intent with a **confidence**, and a **separate** program performs the write —
   `folder = state`. A Telegram bot then *edits* the same store by conversation
   (*"I already bought tomatoes, please remove that"* → `✓ Done`, stamped `recalled from vault ·
   0.3s`), and the wall prints the human's cost as a number: **`manual filing 0 · you typed
   1 sentence`**. Measured against us the same session: **51 of our 57 captured intents stand at
   `received`** — never classified, never routed — and the last `intents` row (`2026-07-28
   09:03:27`) and the last `task_events` row (`09:04:56`) stop in the same minute, **13 days ago**,
   with `0` task events in 24 h. Our chat can be told things but changes nothing:
   `api/chat/route.ts` is 91 lines with **0** write calls. The cheap model tier we already pay for
   (`deepseek-v4-flash`, `qwen3.6-flash`, …) is wired and unused while all **205** agents sit on
   `claude-sonnet-5`/`fable-5`. Six projects **P20-1 … P20-6**; the first two need no install, no
   money and no account. Its screen motion IS measured: the Obsidian graph moves at **4.52×** the
   floor of static text on the same screen (0.677 vs 0.150 per 100 ms over 63 camera-still pairs).
   **Source 18 (2026-08-10, on his live order "18. video ile devam et") is the other half of source
   01 — the same man's Slack workspace, where his six agents are members of seven rooms named after
   the business.** Its receipt is timed by the workspace's own clock: a customer e-mail at **12:47 PM**
   becomes an escalation the same minute (with a permission to refuse and a permalink back to the
   letter), a diagnosis with file and line numbers at **12:49**, the owner's one-line *"Yes @Tom, go
   ahead"* at **12:50**, and **pull request #15 at 1:06 PM** — 19 minutes, one sentence and one
   approval from him. Its advertising room ends every briefing with **`Approval needed`** whose first
   line is *"No changes were made"* and which asks him to **refuse** one of its own options. Measured
   against us the same session: our whole chat history is **102 messages between exactly two
   participants** (hamza 53, ceo 49), **no room, no colleague, no handover**; **`approvals` holds 51
   rows and 0 pending** although the page already renders recommendation, reasoning, alternatives,
   risk and cost; **`outbox` holds 51 rows and all 51 failed**. Six projects **P18-1 … P18-6**, three
   needing no install, no money and no account. Its screen motion is **UNVERIFIED and says so** — the
   film is handheld and the static control moved 25.83 % against the screen's 43.47 %.
   **Source 17 (2026-08-10) is Higgsfield, and it films the anti-babysitting contract end to end** —
   85.6 s in one take: the owner speaks once, the machine reports the week, **raises the goal itself**
   from $105,200 to $150,000, admits an outage he never saw with its root cause and its 23-minute
   repair, and closes *"My recommendation: double the budget on the Street interview ad… **what would
   you like me to handle first, sir?**"* Measured here the same session: our own briefing closes
   *"Sormak istediğiniz bir şey olursa buraya yazın"* — an open door, no recommendation, no
   answerable question (**P17-1**, a surface change, his eye). Also **P17-2** (no incident record
   exists: 149 alerts, 0 open, none carrying a root cause, a repair or a duration, and no provider
   fallback configured — which is why a missing key becomes 18 failed runs instead of a reroute),
   **P17-3** (the motion law, measured from the film: a counter eases to its true value in ≈ 5.6 s
   with the last second moving 0.002 % of its range, and then **stops** — while the only animation
   machinery in our whole product sits on the **login page**), **P17-4** and **P17-5** (46 of our 205
   written employees are marketing or social, among them `social-scheduler-publisher` and
   `marketing-content-creator` — and **all 205 are dormant**). Refused: autonomous account creation
   and unapproved outward posting, both on his identity gate.
   **15 of 35 reported at the previous measurement, `NEXT: 18`.**
   **The queue grew to 35 on his live order of 2026-08-10** — *"kuyruğa ekle 36 olarak, sırası gelince
   izle."* He noticed row 16 was absent from the directive's §11 list, and the answer exposed a
   dropped source of his own: the YouTube link standing beside the OpenJarvis repository in the very
   sentence that orders the Jarvis system (`docs/source-architecture-notes-sanitized.md` line 17) had
   **never owned a ledger row** — the repository half became row 16 on 2026-07-28 and the video half
   was lost. It is now **row 36**, fetched at 1912×1080 with audio. Defect fixed at source the same
   turn: `scripts/rival-intel/fetch.sh` named every YouTube source `watch`, because it read the slug
   out of the path while YouTube carries its identity in the query — the second such source would
   have collided with the first.
   **Source 16 (2026-08-10) is the queue's second repository and the only source that can be READ
   rather than watched** — Stanford's OpenJarvis, 8,492 stars, Apache-2.0, pushed the morning it was
   read; our clone measured **28 commits behind** and the drift written into the report. Its shape is
   the finding: **the measurement harness is larger than the agents** (37,178 lines of `evals`
   against 22,181 of `agents`). Measured here the same session: we have spent **5,721,728,099 tokens
   across 1,590 `cost_ledger` rows and priced none of them — €0.0000 on every row**, and `cost_eur`
   is 0 on all 378 `agent_runs`; **128 of 378 runs failed (33.9 %)** with configuration failures and
   stale zombies counted as agent error, where their trace carries `harness_error` vs `agent_error`;
   and we hold **zero outside-world connectors against their 39** (a search for gmail/calendar/slack/
   rss/weather/imap returns two hits, both the word "calendar" in a date comment). Projects **P16-1**
   (price the tokens — no install, no money, no approval), **P16-2** (error taxonomy), **P16-3** (the
   briefing contract: importance first, connect related items, interpret don't enumerate, never name
   an empty source, word ceiling — a surface change, his eye), **P16-4** (the first connector — his
   identity), **P16-5** (a standing scorecard for our own agents). Installing the framework is
   refused on our own stack rules and K1; its energy metric is refused as irrelevant to a rented box.
   **13 of 34 sources reported at the previous measurement, `NEXT: 16`.**
   **Source 15 (2026-08-10) is the queue's only PDF** — a two-page Turkish lead magnet naming four
   hosted services against four infrastructure jobs. Its checklist is the finding: of the four,
   **DXB has finished exactly one.** Measured the same session in the company database — background
   work runs (`pgboss.job` **141,856** rows, both resident services `active`), while **no e-mail has
   ever left the system** (`outbox` 51 rows, **0 executed**; the only handler targets a Mailpit
   sandbox), **no euro has ever entered the ledger** (`revenue_ledger` **0** rows, **€0**, against 6
   written revenue engines) and **no deploy artefact exists on disk** (no compose file; two systemd
   units). Its sharpest item costs nothing: Trigger.dev's resume-from-step was adopted as an idea and
   never exercised — `workflow_runs.current_step` exists and `workflows`/`workflow_runs`/
   `workflow_steps` are all **0 rows** — project **P15-3**. Also **P15-1** (real outward mail behind
   the outbox seam that is already built; Resend free at 3,000/month — needs his domain), **P15-2**
   (a Merchant of Record at 5 % + 50¢ as the entry path to a first euro — needs his identity),
   **P15-4** (the `.md` → headless-Chrome → A4 PDF press; Playwright + `chromium-1228` already on
   disk, €0) and **P15-5** (symptom-before-remedy panels, into the design package). Coolify and
   Trigger.dev-as-runtime stay refused on our own stack rules.
   **Sources 07, 08, 09, 10 and 11 were rewritten from
   nothing on his order — *"7'den tekrar başla, bu sefer doğru yap"*** — under law 7, which judges a
   rival by what it PRODUCES. **Row 13 is `skipped` on his live order of 2026-08-10** — *"13.videoyu
   atla ama yanına not düş kısa CEO emri ile atlandı diye. şimdi 14. video ile devam et."* The row,
   its number and its material stay; the queue steps over it, and `next.sh` counts it apart.
   **Source 14 (2026-08-10) is the same product's AGENTS page, and it lands the data model the queue
   was missing: an employee is a role, a live state and a list of NAMED SKILLS, each declaring the
   sentences that trigger it, what it costs and where it was learned.** Measured here the same
   session: `agents.skills` is `[]` on **all 205** of our rows — project **P14-1**, needs no install.
   It also lands **P14-3** (51 of 57 `intents` sit at `received`, and nothing anywhere proposes who
   should own a request — 0 matches in the dashboard and packages) and **P14-4** (the memory node
   states its own provenance; we already carry richer provenance on 13,403 rows and lack the
   inspector). The motion law of sources 11/12 gained its second clause and its second figure:
   **1.5 s per edge, a 1.90 s round, and an `idle` employee receives NO pulse — 0 across 180 frames**.

   **His live order of 2026-08-09 gave the queue its second reading law, and it is now machine-held.**
   His words, handing over source 11: *"zaten 11 de göreceksiniz bağlantı dallarından böyle bir nokta
   akıyor damarın içinden geçen kan gibi. bu sistemler güzel. 1'den 10'a kadar hepsi canlı kanlı. şimdi
   raporlarda bunlar gözden kaçmamalı, ki inşaa sürecinde değerlendirilsin."* **The movement on a
   rival's screen is a PART FOR THE BUILD, so it is measured, never admired** — what moves, in which
   direction, how long it takes, how often it repeats, with the figures, cut at 5-10 frames per second
   because at one frame per second a travelling pulse aliases and its direction cannot be read. A
   twelfth case in `tests/c42/rival-intel-ledger.test.ts` fails a reel that only admires it. Measured
   when the clause was written: **only 3 of the 9 finished reports had timed anything**, and **the
   other five films were measured and repaired the same session** (01, 03, 04, 05, 07).

   **From source 11 (`rinaldojanjua.ai`, watched whole with sound on 2026-08-09):** a five-stage mail
   pipeline drawn as a circuit — its clock printed on its own header (`8:00 AM AND 4:00 PM, EVERY
   DAY`), each stage naming the file that runs it, hard rules as chips on each card, the one
   outward-facing limit hung beside the acting stage as its own object (`CONSTRAINT / mailto
   List-Unsubscribe only`), a shared `AGENT BRAIN` with its read/write edge drawn, and the human as the
   last stage (`TEXTS YOU`, *sent even on quiet days*). **His pulse, measured:** the bead crosses a wire
   in **≈ 1.0-1.2 s**, a new one every **≈ 2.3 s**, always in the arrow's direction. **Measured here the
   same session:** `workflows`/`workflow_steps`/`workflow_runs` hold **0 / 0 / 0 rows**, `memory_index`
   holds **13,194 rows with `run_id` NULL on every one**, and **exactly 3 files in the whole dashboard
   draw a shape** — so there is no wire for anything to travel along. We do have the clock (15 scheduled
   jobs) and live data on the screen (15 realtime subscriptions). Projects **P11-2** (a step declares its
   constraint) and **P11-3** (a run accounts for every item; memory names its run) need no install and no
   money; **P11-1** (the wire that carries the work) enters the design package and waits on his approval. <!-- OPEN: B22 -->

   **Source 12 (the same board, filmed as a clean screen recording, watched whole on 2026-08-09) turned
   that pulse into a specification.** Because the canvas is pixel-stable, the animation could be measured
   exactly: **one duration per edge — 1.8 s whether the edge is 44 px or 340 px long** — constant speed
   inside it with no easing, **one 2.4 s period for the whole board** with neighbouring wires ≈ 1.2 s out
   of phase, and **≈ 0.5 s of every cycle with the wire empty**, so rest is part of the design. The brain's
   sphere lives by brightness, not motion: **(0, 0) px of displacement over 2.0 s** while 1–2 of its 13–20
   lit vertices change every 0.1 s. Its second mechanism is the **viewport as an actor** — four camera moves
   in 52 s, each landing the stage being spoken about within **0.02–0.44 s** of the sentence naming it.
   **P12-1** is those numbers, filed into P11-1 rather than beside it. **P12-2** — an answer names where it
   lives and the surface travels to it — needs no install and no money for its data half, and it is the
   missing half of complaint **C26**: `api/chat/route.ts` holds **0** references to a page or a route.
   **Measured the same session:** the holding's only 2.4-second heartbeat is `hl-pulse … infinite` on the
   **login page's beacon**; inside the cockpit every perpetual motion is a loading placeholder. Two errors
   in report 11 were corrected at source (the sphere flickers in place rather than turning; one cited
   command was wrong while its number was right).

   **The one thing on this page he should read first — from source 08 (`paperclip`, read at live HEAD
   on 2026-08-08, 75,865 stars, pushed two hours before the reading).** Measured: **nothing in this
   holding binds the act that executes to the text the CEO signed.** A search of every column in the
   database for `signed`, `signature` or `snapshot` returns `workflow_runs.steps_snapshot` and nothing
   else; the approval is one row, the execution is another, and only a foreign key joins them. The
   whole product is *he approves the acts that face outward* — **project P08-1** closes it with a
   signed spec and a target snapshot, needs no download, costs nothing, and waits on his word. <!-- OPEN: B22 -->
   Source 07 lands **P07-1** beside it: every agent run must end in one measured sentence, because
   1,543 of our task events carry **zero** statements of what an agent found.

   **Source 09 (`huwprosser`, watched whole with sound on 2026-08-09) is the second thing he should
   read.** A man says one sentence out loud and **2.8–3.2 seconds later** the machine has drawn a
   live map across his whole screen — measured inside a single unbroken take — and the assistant's
   own mark steps out of the way first. The size of the work that follows from it, measured the same
   session: our voice loop's **median is 32.7 seconds** (hearing 20.1 / thinking 14.8 / speaking 2.6)
   across 102 calls, the
   last of them on 2026-07-28, and the voice surface can render **only text** — a spoken request
   cannot draw anything at all. Projects **P09-1** (the answer lands on the screen) and **P09-2**
   (the 32-second answer) need no install and no money; the design half waits for his design package.

   **Source 10 (`cloud9.markets`, watched whole with sound on 2026-08-09) found the third thing.**
   A rival draws his nine workers as one living screen where the one that is working lights up and
   the centre says its name — and he draws **the permission to act as a diamond sitting on the wire
   between the one who decides and the one who acts.** That is this whole product in one symbol.
   What that makes buildable here, measured to size the work and not to grade the holding: we have 205
   written employees and **not one picture of any of them** — three files in the entire dashboard draw
   a shape, two are a logo and a ring — and our decision record cannot yet learn, because
   **`decision_log` holds 4,730 rows and 3,248 of them (68.7 %) never say what happened.** Project **P10-1** closes that and needs no install; **P10-2** (the desk map) and
   **P10-3** (the gate drawn where it stands) enter the design package and are not built.

   **His live order of 2026-08-09 changed how the whole queue is read, and his correction the same
   evening decided what the reading IS.** He first named the property the author had failed to weigh:
   *"Operating System'i rakip bir canlı organizma gibi çalışıyor yaşayan bir varlık. bu holdigimizdeki
   en önemli özellik olmalı."* — the board's **FIRST LAW OF V2, "IT MUST BE ALIVE" (2026-08-02)**.
   The first repair asked the wrong question, and he struck it out: *"onların hepsi canlı ve gerçek
   zaten… en sondaki nimbus zaten capcanlı yaşayan sistemler. Ekrandaki şeyler canlı mı diye sormanıza
   gerek yok."* **Aliveness is the PREMISE, never the question.** Every source here is a live, running
   system — he knows them first-hand — and a clip is an advertisement, so what a film does not show is
   a limit of the film, never a fact about the rival. **Ledger law 8, rewritten:** read each rival for
   **HOW it is built to live** — what runs on its own clock, what makes the surface breathe, how it
   answers the human and how fast, and **what DXB takes** — because the holding itself is to be built
   as a living organism. A machine check enforces it, proven to bite, and **all nine finished reports
   were rewritten to that reading.** **The order of the work is his too:** *"bizim durumumuz zaten
   daha ferrari kalitesinde bir holding OS sistemi henüz kurulmadı. önce rakipleri inceliyoruz."* —
   our own zero readings are not news and never a grade against a rival; the machine is not built yet.
   The synthesis at the end of this queue is built on that lens. <!-- OPEN: B22 -->

   Sources 07-11 had been reported in the night session of 2026-08-08 and
   **the CEO deleted all five reports the same morning** — his words:
   *"BOZUK OLAN BOKTAN RAPORLAR HEPSİNİ sil. 7 8 9 10 11."* The five rows are back to `fetched` and
   the raw material (videos, audio, frames, zooms, transcripts) is untouched, per his standing ruling
   *"hükümler çöpe, ham malzeme kalsın."* The queue also changed that night on his live order: **row
   06 struck** (*"6 videoyu izleme onu sil"*) and **row 35 added and fetched** (*"34. video olarak
   bunu koy … izle ve raporla sonra"*) — total still 34, row 35 last. Run
   `scripts/rival-intel/next.sh`. Everything else lives in
   `.planning/research/rival-intel/00-LEDGER.md`: the queue, its **seven** laws, and what each source
   cost to learn. Do not repeat it here.

   **Why he burned them, and the rule that replaces it — read this before writing a single word about
   a rival.** The five reports called the distance between DXB and these systems **"legibility"** —
   *they are not really ahead of us, they are only easier to read.* That is the verdict he had already
   burned on 2026-08-01 (*"UNDERESTIMATED MY OPPONENTS TOOOOOOO MUCH"*) wearing a politer word, and it
   was reached by counting our agents, tables and persona files and calling the count a judgement.
   **Ledger law 7, added 2026-08-08, with the tenth test case behind it: a rival is judged by what it
   PRODUCES, never by what it owns.** Every source on this queue runs and earns; DXB has never run end
   to end and `realized_revenue_eur` is 0. On the measure that decides we are behind all of them, and
   any sentence that softens that is deleted on sight.

2. **B28 — the clipping business, and he has decided its shape.** <!-- OPEN: B28 -->
   **The AGENCY seat is approved in his own words** (2026-08-07): *"ajans koltuğunu onaylıyorum…"*
   <!-- CEO-OK: c42-agency-seat-2026-08-07 --> DXB wins brand clients, launches campaigns under its
   own name, keeps and scores a roster, guarantees delivery, keeps the spread — entering through the
   clipper seat, never attempting the marketplace. **His absolute line binds all of it:**
   *"bahislerle asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"* — every
   campaign, every client, every clip, at any size. **Nothing is built: he approved the seat, not a
   start.** Everything about it is in `.planning/research/rival-intel/05-cnn-clipping-business.md` §5.
3. **What is blocked on him, and cannot move without him:** his approval of a visual design package
   before any redesign is built · one hand-minted browser session so authenticated surfaces can be
   checked by eye (B03-bis) · which outside accounts may be connected (W-C42-4) · money for the two
   paid model exams (B06, B09) · the machine's administrator password for the two root-level fixes
   behind the editor crashes (C65) · the acceptance session itself (B13) · replacing the Gemini key
   after the work, his own ruling *"ben iş bitince değersiz kılıcam"* (B26) · **whether to pursue the
   three document skills he approved but whose licence forbids copying them here (B27) — the
   capability he wanted already works without them, so this is a choice, not a blocker** · **money
   out to clippers once the agency seat starts operating (B28).**
4. **Nothing else starts without a row on the board.** If he gives a new order, it outranks all of
   this (authority order, `.claude/CLAUDE.md` §1) — and it DELETES whatever contradicts it (LAW A).

## Where things live

| Question | File |
|---|---|
| What is the plan? | `HOLDING-OS-MASTER-PLAN/` — the corpus |
| What work remains? | `00-BOARD-OPEN-WORK.md` |
| What was deferred or adapted, and why? | `00-INDEX.md` — the registered-adaptation table |
| What did the CEO order in writing? | `docs/ceo-directives/` |
| How do I do X? | `.claude/skills/dxb-*` — the doors |
| Why was that decided back then? | `.planning/STATE-ARCHIVE.md` and `.planning/_ARCHIVE/` |
