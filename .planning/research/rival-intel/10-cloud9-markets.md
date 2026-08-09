# Source 10 — `cloud9.markets` — NIMBUS, a nine-agent trading desk

> **Written 2026-08-09**, from nothing, after the CEO deleted the first attempt at rows 07-11 on
> 2026-08-08: *"BOZUK OLAN BOKTAN RAPORLAR HEPSİNİ sil. 7 8 9 10 11."* Bound by **ledger law 7** —
> a rival is judged by what it PRODUCES, never by what it owns — and by the C42 standing order:
> *"ŞU SKİLLERİ ŞU PLUGİNLERİ ŞU TOOLLARI İNDİRİP KURUP YAPARIM YAPILIR PROJESİ OLMALI."*
> **His standing instruction on the level of this work, restated to the author on 2026-08-09:**
> *"DXB Holding OS … dünya genelinde yapılan yarışmada birinci olma adayı şeklinde inşaa edilmek
> zorunda … bir ferrariyi inşaa eder gibi en mükemmel parçalar belirlenip raporlanmalıdır."*
> **Section 5 is the deliverable. Sections 1–4 exist to make section 5 honest.**

---

## 1. Source identity

| Field | Measured value |
|---|---|
| Address | `https://www.instagram.com/reel/DbBAOdVBjka/` |
| Handle | `cloud9.markets` — bio read this session: *"📍🇦🇺🇺🇸 💻 AI Architect 🧠 I build AI systems that researches markets 📈 AI x Stocks x Investing x Wealth 👾 Not advice"*, link `www.cloud9markets.com` |
| File | `media/10-DbBAOdVBjka.mp4` — 8,224,439 bytes |
| sha256 | `36bf05ac45b79902e4ca10b462e7f7f9554dad15be12936f3a9c46f0bcb4083d` |
| Resolution | **1080 × 1920** (`ffprobe`, this session) |
| Codec / frame rate | `vp9` / 30 fps · video bitrate 811,613 |
| Duration | **75.433333 s** (audio 75.442993 s) |
| Audio | present — `aac`, 55,721 bit/s |
| How obtained | `yt-dlp` via `scripts/rival-intel/fetch.sh`, 2026-07-28 12:42. Nothing left this machine |
| Transcript | `transcripts/10.json` — en, **15 segments**, the holding's own Speaches container (`Systran/faster-whisper-small`) |

### How the temporal analysis was performed — stated exactly, as §3.2 of his directive requires

- **75 native frames, one per second**, cut this session into `frames/10/seq/` (`t001_0s.jpg` …
  `t075_74s.jpg`, **1080 × 1920, `-q:v 2`, never downscaled**) and read **in order** against the
  timestamped transcript. The 75 frames already on disk from 2026-08-02 were **not trusted blindly**:
  a re-cut of second 12 did not hash-match the stored `t012.jpg`, so the whole sequence was cut again
  under a command written into this report rather than inherited.
- **Edit points measured, not eyeballed:** `select='gt(scene,0.06)'` over the whole file returns
  **exactly one** change, at **5.533 s** (score 0.095) — the whip-pan. **There is no other cut in
  75 seconds:** what follows is one continuous handheld take of one screen.
- **Audio checked for cuts:** `silencedetect=noise=-30dB:d=0.4` returns **no silence** — one unbroken
  voice-and-music bed.
- **Native zoom crops cut from the video**, never from a frame (ledger law 5):

```
ffmpeg -ss 0.2  -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=420:230:430:1080,scale=iw*4:ih*4:flags=lanczos" -q:v 1 → zoom/10/model-sticker-0.2.jpg
ffmpeg -ss 12.0 -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=560:120:280:700,scale=iw*4:ih*4:flags=lanczos"  -q:v 1 → zoom/10/nimbus-role-12.0.jpg
ffmpeg -ss 57.5 -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=520:120:0:520,scale=iw*4:ih*4:flags=lanczos"    -q:v 1 → zoom/10/sentinel-chip-57.5.jpg
ffmpeg -ss 62.0 -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=340:120:740:0,scale=iw*4:ih*4:flags=lanczos"    -q:v 1 → zoom/10/localvoice-62.0.jpg
ffmpeg -ss 66   -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=1080:110:0:0,scale=iw*2:ih*2:flags=lanczos"     -q:v 1 → zoom/10/top-66.jpg
```

**A camera sits between the pixels and the eye** — a phone filming a curved ultrawide monitor in a
room lit magenta, with an Apple Magic Keyboard on the desk and the operator's hand entering frame
repeatedly. Where the pixels ran out this report writes **UNREADABLE**.

**The model is named on the first frame.** `zoom/10/model-sticker-0.2.jpg` reads, at native size, an
orange tile carrying the Anthropic sunburst and the label **`Claude Fable 5`** — the author states
which model his desk is built on, in the first second, unprompted. That is the same model family
this holding runs.

---

## 2. What was on the screen — the record, second by second

The interface never changes layout in 75 seconds: a **constellation**. Centre, a pulsing blue core
labelled **`NIMBUS`** over the role line **`MASTER · STRATEGY SYNTHESIS / RISK ROUTER`**
(`zoom/10/nimbus-role-12.0.jpg`). Around it, nine named nodes, each with a role subtitle, wired to
the core and grouped by three section labels — **`INTELLIGENCE`** (top), **`ANALYSIS`** (left),
**`EXECUTION`** (right). Directly under the core sits a **speaker chip** — a pill reading
`●<AGENT NAME>` — and under that, the sentence being spoken, word by word, in the app's own type.

| Time | On screen (V) | Spoken (T) |
|---|---|---|
| 00:00 | The constellation, filmed at an angle over a backlit keyboard. Overlay caption **`Everyone's building Jarvis, I built Nimbus, multi agent trading desk`**, and the sticker **`Claude Fable 5`** with the Anthropic mark. Nodes readable: `CAPITOL / SMART MONEY` · `ATLAS / MACRO` · `SCOUT / RECON` · `ATHENA / ANALYST` · `CHARTIST / TECHNICIAN` · `ORACLE / QUANT` · `SENTINEL / RISK OFFICER` · `PILOT / EXECUTION` · `LEDGER / THE BOOK` | *"Nimbus, wake up. Let's make some money today."* (0.00–3.00) |
| 00:03 | Whip-pan — the frame is pure motion blur. **The only cut in the file lands at 5.533 s** | — |
| 00:05 | Camera settles on the monitor from a lower angle; the constellation is unchanged and the core is pulsing | *"Good morning, sir…"* (4.50–9.50) |
| 00:06 | Speaker chip reads **`●NIMBUS`**; the word **`sir.`** is under the core | *"…nine agents online…"* |
| 00:08 | Chip **`●NIMBUS`**, word **`Markets`** | *"…markets are moving…"* |
| 00:10 | Chip **`●NIMBUS`**, word **`word.`** | *"…say the word."* |
| 00:12 | No chip — the desk is idle between turns; the core keeps breathing | *"Alright, Nimbus. I want to meet your team…"* (10.20–14.20) |
| 00:15 | Still idle. The camera drifts; **`SENTINEL`** and **`PILOT`** come into frame at the right, wired to each other | — |
| 00:17 | Chip **`●NIMBUS`**, word **`desk?`** | *"You want to meet the desk? Very well, sir."* (15.50–19.00) |
| 00:19 | Chip **`●NIMBUS`**, word **`sound`** | *"Teams sound off."* |
| 00:21 | The operator's open hand passes across the screen; the core dims behind it | — |
| 00:23 | **`ATLAS` is lit** — its ring brightens to solid violet and the node grows. Chip reads `●AT…`. Word **`first`** | *"Atlas, when the money printer turns on, I'm the first to know."* (20.20–23.50) |
| 00:26 | **`CAPITOL` is lit** amber. Chip **`●CAPITOL`**, word **`Trump`** | *"Capital, when Trump or Pelosi buy us stuff…"* (24.50–29.50) |
| 00:29 | `CAPITOL` still lit, chip **`●CAPITOL`**, word **`know`** | *"…I know before the news does."* |
| 00:33 | **`SCOUT` is lit** orange. Chip **`●SCOUT`**, word **`viral`** | *"Scout, whatever stocks going viral today…"* (31.50–35.50) |
| 00:36 | `SCOUT` still lit, chip **`●SCOUT`**, word **`ago.`** | *"…I found it an hour ago."* |
| 00:38 | Handover: **`ATHENA` lights green** while the operator's hand crosses the core; the chip is mid-swap and **UNREADABLE** | *"Athena, I read the boring legal filings…"* (36.50–40.50) |
| 00:40 | Chip **`●ATHENA`**, word **`All`** — `ATHENA` solid green, every other node dimmed | *"All of them, even the footnotes."* |
| 00:43 | **`CHARTIST` is lit** cyan. Chip **`●CHARTIST`** | *"Charters, I draw the lines where to buy…"* (42.50–45.50) |
| 00:47 | Chip **`●CHARTIST`**, word **`run.`** | *"…and where to run."* |
| 00:49 | **`ORACLE` is lit** magenta. Chip **`●ORACLE`**, word **`whisper`** | *"Oracle, I whisper where the price goes next."* (46.50–50.50) |
| 00:53 | `ORACLE` still lit, chip **`●ORACLE`**, word **`darling`** | *"Probabilities, darling, never promises."* (51.50–55.50) |
| 00:57 | Camera swings right. **`SENTINEL` is lit red.** Chip **`●SENTINEL`**, word **`Sentinel.`** Now fully visible: the wire from `SENTINEL` runs down to `PILOT` **through a small hollow diamond drawn on the wire itself** | *"Sentinel risk officer, my favorite word is no."* (56.50–59.50) |
| 01:02 | **`PILOT` is lit.** Chip **`●PILOT`**, word **`signs`**. At the top-right edge of the screen a status strip appears reading **`LOCAL VOIC…`** — the rest runs off the right edge of the recording in every frame it appears, **UNREADABLE** | *"Pilot, Sentinel signs off. I execute the trade. No cowboy stuff."* (60.50–64.50) |
| 01:07 | **`LEDGER` is lit** white — the lowest node, wired up to `PILOT`. Chip **`●LEDGER`** | *"Ledger, I remember every call this desk makes…"* (66.50–70.50) |
| 01:09 | Chip **`●LEDGER`**, word **`desk`**; the operator's finger points directly at the `LEDGER` node | *"…especially the bad ones."* |
| 01:12 | Control returns: chip **`●NIMBUS`**, the core flares brightest in the file | *"And I am Nimbus. I run this desk."* (71.50–74.50) |
| 01:14 | Chip **`●NIMBUS`**, word **`am`** | *"…I am Nimbus…"* |
| 01:14.9 | Final frame — chip **`●NIMBUS`**, word **`desk.`**, every other node dim. The clip ends on the map, never on a chart, an order or a number | *"Give the word, sir."* |

**Transcript corrections, taken from the screen (V beats T).** The machine heard *"Capital"* and
*"Charters"*; the nodes are labelled **`CAPITOL`** and **`CHARTIST`**. The transcript file is left as
the machine produced it; the correction lives here.

---

## 3. Capabilities — what this system demonstrably has

### 10-C1 · The workforce IS the interface — a spatial map, not a list — **V**
For 75 seconds the screen shows nothing but the desk itself: nine named workers around a master,
each with a one-word role, wired into three groups. No menu, no table, no window chrome. A person
who has never seen this product knows the shape of the company inside four seconds.

### 10-C2 · The one that is working lights up, and the centre says its name — **V**
Measured across nine handovers (00:23 Atlas → 00:26 Capitol → 00:33 Scout → 00:38 Athena → 00:43
Chartist → 00:49 Oracle → 00:57 Sentinel → 01:02 Pilot → 01:07 Ledger → 01:12 Nimbus): the active
node brightens to full colour while the others dim, **and** a chip under the core prints
`●<NAME>`. Two independent signals for the same fact — the owner never has to guess who is talking.

### 10-C3 · The gate is drawn **on the wire**, as an object — **V**
Between `SENTINEL / RISK OFFICER` and `PILOT / EXECUTION` the wire passes through a small hollow
diamond. Pilot's own line names what that diamond is: *"Sentinel signs off. I execute the trade."*
**The permission to act is a visible thing standing between the one who decides and the one who
acts.** This is the single most valuable thing on the queue for this holding's own approval gate.

### 10-C4 · Refusal is given a face and a name — **V/T**
`SENTINEL`'s whole introduction is *"my favorite word is no."* The right to stop the company is not
buried in a rule file; it is a member of the team with a colour (red), a position (between analysis
and execution) and a sentence. Likewise `ORACLE` volunteers its own limit — *"probabilities,
darling, never promises."*

### 10-C5 · The record of decisions is a named worker, and it keeps the bad ones — **T**
`LEDGER / THE BOOK`: *"I remember every call this desk makes, especially the bad ones."* The memory
of what was decided is not an audit table nobody opens; it is a member of the roster the owner can
address.

### 10-C6 · Speech is captioned inside the product, word by word — **V**
Under the core, the sentence being spoken appears in the app's own type as it is said, with the
speaker's chip above it. The product does not rely on the listener's ears alone.

### 10-C7 · It advertises that the voice is local — **V (partly UNREADABLE)**
From 01:02 a status strip appears at the top-right reading **`LOCAL VOIC…`**. The phone's framing
cuts the rest in every frame; whether it carries a value after it cannot be read. The claim itself —
that the voice runs locally — is on the screen.

### What is **not** established

- **No trade, no position, no number.** In 75 seconds nothing is executed, no order ticket, no chart,
  no profit or loss appears. This is a **roster demonstration**, and the report records it as one.
  Whether the agents behind those nodes do the work their sentences claim is **Unverified** — to
  verify it would take a recording of one full cycle from a signal to a filled order, or the code.
- **Whether any of it is scripted for the camera.** The nine introductions are theatrical by design.
  What IS measured is that the take is unbroken after 5.533 s, so the handovers happened in one run.
- **The model claim.** The `Claude Fable 5` sticker is the author's own statement, not a measurement.

---

## 4. What DXB has today — measured by command, this session

| # | Measured | Command |
|---|---|---|
| 1 | **The roster is bigger and it is real: 205 agent rows** in the company database | `select count(*) from agents` |
| 2 | **The risk officer exists as people, not as one seat:** `enterprise-risk-manager`, `ai-model-risk-officer`, `compliance-auditor`, `legal-compliance-checker` are all written agents | `select slug from agents where slug ilike '%risk%' or '%compliance%'` |
| 3 | **The decision record exists and it is large: `decision_log`, 4,730 rows**, carrying `decided_by`, `rationale`, `data_used`, `alternatives`, `confidence`, `risk`, `approval_id` and `outcome` | `select count(*) from decision_log` |
| 4 | **But two thirds of it never learns anything.** `outcome` is filled on **1,482 rows (31.33 %)** and **NULL on 3,248**. Where it is filled it does record failure honestly — `blocked` 126, `qa-fail` 122, `blocked_no_model` 78, `refused_budget_hard_stop` 58, `objections` 51, `selected` 1,037, `applied` 10 | `select outcome, count(*) … group by 1` |
| 5 | **There is no map of the company anywhere the CEO can look.** The org surface is `apps/dashboard/src/components/org/org-tree.tsx`, 673 lines — a collapsible **hierarchical list**, read-only by its own comment (*"read-only graph → sonra drag-drop"*), carrying status and `active_tasks` / `active_runs` per row | `wc -l`, `grep -n` on the file |
| 6 | **Nothing in the dashboard draws a diagram at all.** A search for `<svg`, `d3`, `reactflow`, `cytoscape` across every `.tsx` returns **three files**: the login page, a health ring and the DXB logo mark | `grep -rln … apps/dashboard/src` |
| 7 | **What live activity we show is a chronological feed**, `live-feed.tsx`, 394 lines — events one under another, newest first | `wc -l`, `grep -n` |
| 8 | **The approval gate is real in code and invisible on screen.** `decision_log.approval_id` is a foreign key to `approvals` — the sign-off is recorded, and nothing anywhere shows it standing between the deciding agent and the acting one | `\d decision_log` |
| 9 | Standing law-7 measurement, re-checked: `sum(realized_revenue_eur)` over `v_objective_progress` = **0** | company DB, SELECT only |

**In one line: we have a bigger desk than his, written down in more detail, and the CEO has no
window in which to see it working.** The org page can tell him that an employee exists and has two
running tasks; it cannot show him the company breathing, and it cannot show him the gate that
protects him standing where it actually stands.

---

## 5. The build project — *"yaparım, yapılır"*

### P10-1 — Every decision gets its outcome written back · **buildable now, needs nothing**

| | |
|---|---|
| **What** | Close the loop on `decision_log.outcome`. Every decision row is written with a NULL outcome and **must** be updated when its consequence is known — the run it belongs to finished, the approval it waited on was granted or refused, the task it produced passed or failed. The write-back is part of the run's own completion path, never a human's job |
| **Why this one** | Measured: **3,248 of 4,730 decisions (68.7 %) will never say what happened.** A record that keeps only the decision and not the result cannot teach the company anything, and it cannot answer the one question the CEO actually asks — *was that call right?* Ledger's line on this reel — *"especially the bad ones"* — is exactly the half we are missing |
| **Where it lands** | The spec that already owns the decision record, plus `packages/*` where runs complete. **No new table, no new spec** — the column exists and is already used |
| **Skills / plugins / tools to download and install** | **None** |
| **Recurring cost** | Zero |
| **Done means** | A fresh decision is written, its run completes, and the same row reads a non-NULL outcome — shown live; and the 3,248 historical rows are either back-filled from their run's terminal state or explicitly marked unknowable, with the count of each reported |

### P10-2 — The desk map: the workforce as one living screen · **DESIGN — enters the package, is not built yet**

One screen that shows the holding the way this reel shows a trading desk: departments as regions,
employees as nodes with their one-word role, the **working one lit** and named in the centre, the
idle ones dim. Not a replacement for the org list — the answer to *"what is my company doing right
now?"* in one glance. **It is a CEO surface, so his own written directive binds it:**
`00_READ_FIRST_MASTER_DIRECTIVE.md:5` — *"Implementation status: PROHIBITED until the CEO approves
the complete visual design package"*. It is therefore recorded here as a **requirement of that
package**, with the measured behaviour attached (two signals per handover: the node lights AND the
centre names it), and it is built after he approves.

### P10-3 — Draw the gate where it actually stands · **DESIGN — same package**

Take 10-C3 exactly: on the desk map, the wire from the one who decides to the one who acts passes
through a **gate object**, and that object is the CEO's approval. Closed and waiting = he has
something to sign. Open = the act is cleared. **This is the whole product drawn in one symbol** —
*he approves the acts that face outward* — and it pairs directly with project **P08-1** from source
08, which binds the approval to the act underneath. P08-1 is the mechanism; P10-3 is how he sees it.

### What is NOT taken, and why

- **Trading.** Nothing on this queue authorises this holding to trade instruments, and nothing here
  proposes it. What is taken is the shape of a supervised desk, not its business.
- **The nine names and the theatre.** Our roster is 205 written people with their own personas; we do
  not import his cast, and a persona is never a costume (`dxb-persona`).
- **Nothing is installed.** No repository is published by this source — there is no code to take.

---

## 6. Verdict

**What this source PRODUCES, measured.** An audience and a lead funnel: **12.1K Instagram
followers** (read this session), a free daily newsletter — *"The Cloud9 Brief · One sharp market read
every morning, written by our AI desk"* on Substack — a locked "VAULT" of posts that open with a code
handed out by direct message in exchange for a comment, and an open offer of services:
*"Work with the desk. I build AI agents, finance research agents, market dashboards and automated
briefing pipelines — the same machinery that runs Cloud9"*, contact `hello@kloud9ai.com.au`. Read
verbatim off `cloud9markets.com` this session: **everything on it is free, no price, no plan, no
customer count.** **Whether it earns is Unverified** — the honest label, not a criticism: a free
research desk feeding a consultancy is a normal order of operations, and the paid half would live in
his inbox where no reading of ours can reach.

**Where they are ahead of us, plainly.** They have a **face for the company**. Nine workers, three
groups, one master, on one screen, where the one that is working lights up and the machine says its
name — and a **gate drawn on the wire** between the one who says no and the one who acts. We have
205 written employees, a 4,730-row decision record, a real approval gate in code, and **not one
picture of any of it**: three files in the entire dashboard draw a shape at all, and two of them are
a logo and a ring. Their desk is legible in four seconds by someone who has never seen it. Ours is a
collapsible list.

**Where we are level, and it is worth knowing.** Their refusal officer is a character with a
sentence; **ours is constitutional** — a fail-closed policy gate the code cannot widen. Their Ledger
promises to remember the bad calls; **our decision record already carries `blocked`, `qa-fail`,
`refused_budget_hard_stop` and `objections` as real recorded outcomes** — on the third of rows that
have one. And the model he names on his first frame is the family this holding already runs.

**And the gap that decides this report:** his desk **produces something every single morning** — a
brief, published, read by an audience of twelve thousand — and can be understood at a glance. Ours
has never run end to end, `realized_revenue_eur` is **0**, and **68.7 % of the decisions it has
already made will never say whether they were right.** On the measure that decides — does it work,
does it make money — we are behind it.

**Row 10 is `reported`. Nothing is built and nothing is installed.** <!-- OPEN: B22 --> P10-1 waits on his word; P10-2 and P10-3 wait behind the visual design package his own directive requires first. <!-- OPEN: B22 -->
