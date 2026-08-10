# Source 14 — Rinaldo Janjua — the AGENTS page of the same system: the org chart is the runtime, and every employee opens into a named, triggered skill list

> **Written 2026-08-10**, from the video, under **ledger law 7** (a rival is judged by what it
> PRODUCES, never by what it owns) and **ledger law 8** — every source on this queue is a live,
> running system, so it is read for **HOW it is built to live**, and **the movement on its screen is
> a part for the build, so it is measured, never admired** (his live order, 2026-08-09).
>
> **Row 13 was skipped on the CEO's live order of 2026-08-10** — *"13.videoyu atla ama yanına not düş
> kısa CEO emri ile atlandı diye. şimdi 14. video ile devam et."* This report is the next one after
> row 12.
>
> **What this source is for.** Rows 11 and 12 filmed the same author's **INBOX CLEANUP board** — one
> workflow, running. This reel opens a different page of the same product, `attu.ai`, and it is the
> page that answers the question rows 11 and 12 could not: **what an "agent" actually IS in that
> system.** He clicks three of the five employees open on camera, and each one turns out to be a role
> plus a **list of named skills, each with the sentence that triggers it, the tool it costs, and where
> it was copied from.** That list — not the animation — is the parts list this queue exists to build
> from.
>
> **Section 5 is the deliverable. Sections 1–4 exist to make section 5 honest.**

---

## 1. Source identity

| Field | Measured value |
|---|---|
| Address | `https://www.instagram.com/reel/DbKe90ETKfB/` |
| Handle | Rinaldo Janjua (`rinaldojanjua.ai`) — the same author as rows 11 and 12; his own name is burned into the product (*"Rinaldo's Brain"*, and every skill trigger reads *"Use when Rinaldo says…"*) |
| File | `media/14-DbKe90ETKfB.mp4` — 6,302,727 bytes |
| sha256 | `7e8ceb034a5ed3e140b1408e7896e2a9b182d8356617245385f59c0651f510b6` |
| Resolution | **1080 × 1920** (`ffprobe`, this session) — above the floor his directive sets, and the reason the small type below could be read at all |
| Codec / frame rate | `vp9` / **30 fps** container. Measured content rate over 5.0–11.0 s: **25.7 distinct frames per second** — the file carries duplicated frames, which is why the dense pass below de-duplicates before it measures |
| Duration | **61.047 s** |
| Audio | present — `aac`, 44,100 Hz, 2 channels |
| How obtained | `yt-dlp` via `scripts/rival-intel/fetch.sh`, 2026-07-28 11:55. Nothing left this machine |
| Transcript | `transcripts/14.json` — en, **16 segments**, 157 words, the holding's own Speaches container |

**The source-quality note, stated as the skill requires.** The frame is split: the **upper ~42 %** is a
**clean screen recording** of the product (no glare, no camera shake — the canvas is pixel-stable
between the cuts), and the **lower ~58 %** is the author speaking to a phone camera with a burned-in
one-word-at-a-time caption. Because the screen half is a real recording at 1080 px wide, the modal
body text is legible **at native resolution**, and every sentence below that depends on small type is
tied to a zoom crop cut from this file, listed here:

| Zoom crop | What it proves |
|---|---|
| `frames/14/zoom/cmo-skills.jpg` | the CMO's four skills and their trigger sentences |
| `frames/14/zoom/coo-skills.jpg` | the COO's five skills plus one **SCHEDULED** entry with its clock |
| `frames/14/zoom/salesrep-skills.jpg` | the Sales Rep's three skills **and two SUB-AGENTS** |
| `frames/14/zoom/vault-inspector.jpg` | the Knowledge Vault node inspector — the provenance chips and the file list with byte sizes |
| `frames/14/zoom/agent-log.jpg` | the Agent Log — the owner's own raw sentences with an outcome and an age |
| `frames/14/zoom/localhost-statusbar.jpg` | the browser status bar reading `localhost:3001/knowledge-vault` |
| `frames/14/zoom/orchestrator-card.jpg` | `ROUTES 10` and `READS 954` on the command-layer card |

### How the temporal analysis was performed — stated exactly, as §3.2 of his directive requires

1. The audio was read first, whole, as 16 timestamped segments (`transcripts/14.json`), and the
   spoken line is quoted beside every screen event in §2.
2. The film was then watched **in order at 1 fps** — `frames/14/t001.jpg` … `t061.jpg`, cut at native
   1080 × 1920, no downscale, no tiling.
3. For the movement, a **dense pass at the container's full 30 fps** was cut over 5.0–11.0 s
   (`frames/14-dense/f001…f180.jpg`) and over 38.0–43.0 s, then a green-pixel detector clustered the
   travelling dots frame by frame and **linked them into tracks**, so each pulse could be followed
   from the moment it left the command card to the moment it reached an employee. The figures in the
   Aliveness section are the output of that tracker, not an impression. At 1 fps this motion aliases
   and its direction cannot be read — which is exactly why the law requires the dense pass.
4. Nothing on the rival's screen was clicked, fetched or reproduced. This is a reading of a recording.

---

## 2. What was on the screen — the record, second by second

The reel has one continuous subject — the product — with hard jump-cuts inside the recording (two are
visible in the tracker at 5.83 s and 34.5 s, where the pixel positions step discontinuously). The
narration is quoted verbatim from the transcript.

| Time | On screen (upper frame) | Spoken / caption |
|---|---|---|
| 00:00 | `attu.ai`. Left rail: **Inbox (badge 10)**, Command Center, CEO Brief, **Agents** (selected), Workflows, Schedule, Lead Pipeline, Content, Knowledge Vault, Outputs. Below it a second rail titled **AGENTS** listing five employees with a status dot each: CMO · Sales Rep · Dev · COO · Data Analyst. Header: `AGENT NETWORK / Agents`, a green pill **"Agentic System Operational"**, a running clock **00:46:47**, and a **New | Classic** toggle with **New** selected | *"A CEO, a COO, a CMO, a sales rep, a developer, and a data analyst all running my business…"* |
| 00:02 | Body line: *"One command layer coordinating Attu's five real specialist agents."* The **CEO/Orchestrator** card sits alone at the top: badge **`waiting`** (amber), subtitle **COMMAND LAYER**, description *"Routes work, reviews context, coordinates specialists, and returns the real operator debrief."*, and two counters — **ROUTES 10**, **READS 954** | *"…all running my business"* |
| 00:04 | Below the command card a **tree**: one trunk drops to a horizontal bus, five branches drop from the bus to five employee cards — **CMO** (CONTENT & INTEL, `working`), **Sales Rep** (REVENUE OPS, `working`), **Dev** (BUILD SYSTEM, **`idle`**), **COO** (COMMS LAYER, `working`), **Data Analyst** (SIGNAL LAYER, `working`). Green dots travel along the trunk and bus | *"…as I'm filming this reel."* |
| 00:08 | The clock has advanced 00:46:47 → 00:46:55, one second per second. The dots keep flowing. The top of a large blue **orb** is visible at the bottom edge of the viewport | *"This is a complete operating system."* |
| 00:12 | Same frame; the caption reads COMPLETE / OPERATING / SYSTEM word by word | *"Every agent has their own role, their own tasks, and their own context…"* |
| 00:16 | **First modal opens — CMO.** Header rail: `CONTENT & INTEL` + a live **`WORKING`** pill; title **CMO**; one-line job: *"Researches competitors and trends, writes and files content, builds the reel pipeline."* Then a list of **skills**, each a row with a name, a type chip and a paragraph: `deep-research` **SKILL**, `last30days` **SKILL**, `yt-competitor-research` **SKILL**, `youtube-transcript` **SKILL** | *"…and their own context from the rest of the business."* |
| 00:18 | **Second modal — COO.** `COMMS LAYER` + `WORKING`; *"Keeps inboxes, messages, and vendor admin moving without manual triage."* Skills: `manage-email`, `classify-emails`, `inbox-triage`, `vanity-number-checker` (**SKILL** + **GLOBAL**), `ai-daily-notes`, and a final row of a different type — **`Daily Inbox Cleanup` SCHEDULED — *"At 08:00 AM and 04:00 PM, every day"*** | *"My COO pulls competitor in market context."* |
| 00:22 | Back to the network; the modal closes and reopens on **CMO** as he names it | *"My CMO turns that into content briefs."* |
| 00:25 | **Third modal — Sales Rep.** `REVENUE OPS` + `WORKING`; *"Scrapes and scores leads, writes outreach copy, runs the daily prospecting cadence."* Rows: `scrape-leads` **SKILL**, `generate-proposal` **SKILL**, `lead-scraper` **SUB-AGENT**, `copywriter` **SUB-AGENT**, `client-shoutout` **SKILL** | *"My sales rep checks leads and follow-up opportunities."* |
| 00:29 | Network again. The cursor hovers the left rail; the **CEO/Orchestrator card lifts on hover** — its box grows ≈ 5 px on each side and its border brightens | *"My data analyst watches performance, my developer improves my workflows…"* |
| 00:33 | The page **scrolls**: the command card and the five cards ride up, and the **orb** comes fully into view under the heading **"Speak with the CEO"** with the sub-line ***"Click the orb and talk — the CEO logs it to shared memory and suggests who should own it."*** | *"…and then my CEO decides what needs attention first…"* |
| 00:37 | Under the orb, a text field **"Speak or type here…"** and a **"Send to CEO"** button (disabled while empty). Below that a panel headed **Agent Log** with a **"Last 26"** badge, listing the owner's own sentences: `RINALDO · "research on my competitors" · Attu OS · Brain Dump · **completed** · 5d ago`; `RINALDO · "automate everything that I'm doing here for my business please" · **completed** · 5d ago`; a third partly visible — *"First real report: 10 leads, 6 from Real Broker presentation (top source), 0 closes, 0 tracked sent…"* | *"…and then makes the decisions."* / *"But the most important part is the shared memory system."* |
| 00:41 | The cursor moves to **Knowledge Vault** in the rail; the browser status bar shows the target: **`localhost:3001/knowledge-vault`** | *"When one agent learns something…"* |
| 00:43 | **Knowledge Vault page.** A search field *"Search folders, memories, topics…"* and the instruction *"Every folder is open two levels deep by default. Hover to trace connections — click + on a node to go further in."* A force-directed graph: centre node **"Rinaldo's Brain — 954 RECORDS"**, surrounded by named folders — Projects (a ring of ≈ 60 leaf dots), Business, Global Template, Knowledge Base, Content Engine, Attu Branding, Templates, Clients, Contract Drafts, Scheduled Tasks Backup, **Shared Memory**, Outputs, LinkedIn Automator, Strategy Tracker, Sales Hacks, Inbox Manager, Inbox. Right pane: *"Click a node to inspect it."* Bottom strip: **CONTENT PIPELINE (GOVIRALBRO) — QUICK VIEW · 2 Topics discovered · 10 Hooks saved · 1 Angles developed** | *"…the whole system can then use it instead of starting from zero every single time."* |
| 00:45 | **Hover dims the graph** — everything except the traced path fades out, then returns | *"…every single time."* |
| 00:47 | A node is clicked. The right pane fills: breadcrumb `KNOWLEDGE VAULT / UFT-AI-AUDIT`, kind **FOLDER**, name **`uft-ai-audit`**, four chips — **`Real folder`**, **`Local`**, `5 files`, `0 subfolders` — counters FILES **5** / SUBFOLDERS **0**, then **FILES (5)** with byte sizes: `worklog.md` 2.5 KB, `tech-notes.md` 1.7 KB, `automation-priority-matrix.md` 1.3 KB, `sop-inventory.md` 3.3 KB, `overview.md` 3.1 KB | *"This is what it means by replacing manual business operations with an autonomous, self-improving AI agent system."* |
| 00:57 | A second node is clicked: `titan-home-group-website` — **`Real folder`**, **`Local`**, `1 file`, `0 subfolders`; FILES (1) `worklog.md` **886 B** | *"If you want me to show you the complete structure breakdown, comment system down below."* |
| 01:01 | Ends on that screen | — |

---

## 3. Capabilities — what this system demonstrably has

### 3.0 What this system IS, and the job it does — end to end

Read from this reel alone, `attu.ai` is **a single-operator business runtime with five specialists and
one router**, and it is put together like this:

1. **One command layer.** The `CEO/Orchestrator` is not an employee among employees — it sits alone
   above the bus, is labelled `COMMAND LAYER`, and its own description says what it does: *"Routes
   work, reviews context, coordinates specialists, and returns the real operator debrief."* Its two
   counters are the two verbs: **ROUTES 10** (work handed out) and **READS 954** (memory consulted).
2. **Five specialists, each a role plus a skill list.** CMO / Sales Rep / Dev / COO / Data Analyst,
   each with a one-line job and a layer name (CONTENT & INTEL, REVENUE OPS, BUILD SYSTEM, COMMS
   LAYER, SIGNAL LAYER).
3. **A shared memory the whole system reads.** `READS 954` on the command card and **`954 RECORDS`**
   on the brain node in the Knowledge Vault are **the same number**, measured on the same recording
   — the counter on the org page is a live read of the memory store, not a decoration.
4. **One way in for the human.** An orb with *"Speak with the CEO"*, a text field, and a stated
   contract: **the request is logged to shared memory and the system suggests who should own it.**
5. **One way to see what happened.** The Agent Log, holding the owner's raw sentences with an
   outcome and an age.

**V/T** throughout: everything above is on screen or in the transcript.

### 14-C1 · An agent is a role plus a list of named skills, and each skill declares its own trigger — **V**

This is the finding of the source. Opening an employee does not show a prompt or a model name; it
shows a **list of capability rows**, and each row carries four things a builder can implement:

| | CMO (`CONTENT & INTEL`) | COO (`COMMS LAYER`) | Sales Rep (`REVENUE OPS`) |
|---|---|---|---|
| Job line | *"Researches competitors and trends, writes and files content, builds the reel pipeline."* | *"Keeps inboxes, messages, and vendor admin moving without manual triage."* | *"Scrapes and scores leads, writes outreach copy, runs the daily prospecting cadence."* |
| Rows | `deep-research` · `last30days` · `yt-competitor-research` · `youtube-transcript` | `manage-email` · `classify-emails` · `inbox-triage` · `vanity-number-checker` · `ai-daily-notes` · `Daily Inbox Cleanup` | `scrape-leads` · `generate-proposal` · `lead-scraper` · `copywriter` · `client-shoutout` |
| Types seen | SKILL | SKILL, **SKILL+GLOBAL**, **SCHEDULED** | SKILL, **SUB-AGENT** |

Four properties, each quoted from the screen:

- **The trigger is a sentence, not a button.** `deep-research`: *"Triggered whenever Rinaldo asks to
  research, look into, investigate, or find out about something."* `inbox-triage`: *"Use when Rinaldo
  says 'triage inbox,' 'process my inbox,' 'sort the inbox,' or after he's dropped new context files
  in."* `yt-competitor-research`: *"Use when Rinaldo says 'YT competitor research', 'run the YouTube
  research automation', 'what's working on YouTube in <niche>', or wants viral content ideas for his
  / a client's channel."* The owner never learns a command surface; the capability declares the
  language that reaches it.
- **The behaviour rule is written into the row.** `deep-research`: *"Always ask clarifying questions
  inline BEFORE starting."* `vanity-number-checker`: *"Strict, no-hallucination rules — exhaustive
  combinatorics via code, verified against a real dictionary, with letter-by-digit proof for every
  match."* The discipline lives with the capability, not in a document beside it.
- **The cost is stated.** `yt-competitor-research`: *"Free — only needs yt-dlp + a Attu OS
  subscription."* `last30days`: *"no paid APIs; uses WebSearch + web_fetch."*
- **The provenance is stated, including where it was copied from.** `last30days`: *"Rebuilt in-house
  from the duncanrogoff IG concept."* `yt-competitor-research`: *"Rebuilt in-house from the Jason
  Cooperson tutorial (no paid Skool files)."* A rival's own capability list records which rival it
  was learned from.

### 14-C2 · Three kinds of row, and the difference is architectural — **V**

The chips are not styling. Three distinct kinds appear:

- **SKILL** — a capability the agent performs itself.
- **SUB-AGENT** — a capability that spawns a separate worker. The Sales Rep has two (`lead-scraper`,
  `copywriter`), and `yt-competitor-research` names the pattern in prose: *"breaks down the winners
  with **parallel sub-agents** (hook, thumbnail, why it worked, content angle)"*. So the tree on
  screen is one level of a deeper structure: router → specialist → sub-agents.
- **SCHEDULED** — a capability that runs on a clock, with the clock printed: `Daily Inbox Cleanup`
  — *"At 08:00 AM and 04:00 PM, every day"*. `ai-daily-notes` states its own: *"Runs at 1 AM and 1 PM
  AK via scheduled tasks, or on demand."*
- **GLOBAL** — one row (`vanity-number-checker`) carries a second chip, so a capability can be scoped
  to an agent or to the whole system.

Time zone `AK` (Alaska) and the `client-shoutout` row (*"Scan Anchorage/Eagle River/Mat-Su 'Who To
Use' Facebook groups…"*) place the operator and his clients in Alaska. That row also carries a **human
gate written into the capability**: *"present the whole batch for one approve/deny decision before
posting anything."*

### 14-C3 · The org chart IS the runtime, and the animation carries state — **V**

The five cards are the org chart and the live process table at once: each carries a status pill —
four read `working`, and **Dev reads `idle`** and is drawn dimmer, with its dot grey in the rail while
the other four are green. The command card itself reads `waiting`, so the router shows its own state
in the same vocabulary as the workers.

**The pulse obeys that state.** Measured by the tracker (figures in the Aliveness section): every
pulse leaves the command card, travels down the trunk, turns along the bus and drops into an employee
— and **across 180 consecutive frames (6.0 s, three full cycles) not one pulse ever entered the Dev
branch.** The animation is a live readout of who is working, not a screensaver.

### 14-C4 · The memory node declares its own provenance — **V**

The Knowledge Vault inspector is the sharpest small thing in the reel. Clicking a node returns a
breadcrumb, a kind, a name, counters, **the file list with byte sizes** — and four chips of which two
are claims about reality: **`Real folder`** and **`Local`**. The graph is a view over files that exist
on disk, and the interface says so on the node itself, so a reader can tell a modelled node from a
real one without leaving the screen. The two nodes opened on camera are ordinary working folders
(`uft-ai-audit` with 5 markdown files, `titan-home-group-website` with one 886-byte `worklog.md`), and
the page instruction states the default depth out loud: *"Every folder is open two levels deep by
default."*

### 14-C5 · One way in, and it ends in an owner suggestion — **V/T**

*"Click the orb and talk — the CEO logs it to shared memory and suggests who should own it."* Three
promises in one sentence: **speech is an input**, **the request becomes memory**, and **the system
returns a routing proposal rather than silently acting.** The Agent Log is the other half: the
owner's raw, unpolished sentences are kept verbatim — *"automate everything that I'm doing here for
my business please"* — with a source (`Attu OS · Brain Dump`), an outcome chip (`completed`) and an
age (`5d ago`).

### The design system, measured — what this surface is actually made of

His directive requires this and it is the half a mechanism reading leaves out: §3.2 asks for the
visual hierarchy and the feel of the interface, and §4's seventh question asks for the **design
principle** to adopt, not only the capability. Every figure below was sampled **out of the native
1080 × 1920 frames this session** — colours read as pixels, sizes measured as cap heights and runs,
contrast computed from the sampled values. Nothing here is an impression of a look.

#### 14-D1 · The shape law: the machine is drawn as rectangles, the life is drawn as circles — **V**

Every object on these two pages belongs to one of two families, and the split is not decorative — it
marks what is a **container** and what is **alive**.

| Family | Corner | What is drawn this way |
|---|---|---|
| **Rounded rectangle**, radius ≈ **10 px** (measured by walking the card's top-left corner: the fill reaches the full left edge only 10 rows down) | soft | the left-rail item, the five employee cards, the command card, the two counter tiles, the five icon tiles, every status pill, the `New \| Classic` toggle, the Inbox badge, the modal, the orb's own panel, the node inspector |
| **Circle** | round | the status dots, **the pulse travelling on the wire**, **every node in the memory graph**, and **the voice orb** |

**The two roundest, most volumetric objects in the whole product are exactly the two living things —
the brain and the voice.**

- **The orb is a sphere, not a disc.** Measured at t=40 s: **111 × 108 px, aspect 1.028** — a true
  circle — and its **brightest point sits 10 px below the geometric centre**, so it is lit from one
  direction and reads as a body with volume. Luminance falls **226 → 155** across the first 45 px and
  then drops to **71** at the rim: a soft interior inside a hard edge, the way a lit sphere behaves
  and the way a flat disc does not.
- **Every memory node is a hollow ring, not a dot.** Radial scan of the `Business` node: centre
  luminance **51**, rising to **111 at 8–9 px**, falling away outside it. A dark nucleus inside a
  bright membrane — a **cell**, drawn as a cell.
- **The `Projects` cell has 39 leaf dots on a true circle** (ring radius 102–114 px, mean 108 —
  measured by clustering the lit pixels). Not a scatter, not a list: a body with a corona.

Rectangles hold; circles live. It is one rule, and it is obeyed on both pages.

#### 14-D2 · The organism: a skeleton, blood, five organs, one brain, one lung — **V/T/C**

Read as a body, which is how the CEO named this movement himself — *"damarın içinden geçen kan
gibi"*, blood going through a vein — this is what the two pages are made of:

| Organ | What is on screen | Its measured vital sign |
|---|---|---|
| **Skeleton** | the tree: one trunk from the command card, one horizontal bus, five branches to the five cards | static; it is the frame everything hangs on |
| **Blood** | the green dots travelling trunk → bus → branch | **1.5 s** from the command card to any employee, whatever the distance |
| **Heartbeat** | the emission cycle at the command card | one round every **1.90 s**, always in the same order |
| **Five organs** | the employee cards, each with one job written under its name | four receive blood; **the one marked `idle` receives none — 0 pulses in 180 frames** |
| **Lung** | the voice orb, breathing while nothing is happening | **2.83 s** per breath, **1.70 s** in and **1.13 s** out — an asymmetric breath, not a metronome |
| **Brain** | the Knowledge Vault graph, labelled in words: **`Rinaldo's Brain — 954 RECORDS`** | its cell body carries 39 dendrite dots on a ring; hovering **dims the whole body** so one path can be traced |
| **Nerve between brain and body** | the command card's counter **`READS 954`** | **the same 954** as the brain node — the body's counter is a live read of the brain |
| **Vital sign** | the header clock beside a green `Agentic System Operational` pill | advances **1 s per second**, 00:46:47 → 00:47:24 across the opening |

Two further body facts, both from his directive's own §3.2 checklist:

- **How the assistant sits when the screen changes.** The orb does **not** float over the product and
  does not follow the scroll. It is **anchored underneath the workforce** — you scroll past the five
  organs and arrive at the mouth. The voice is part of the body, in a fixed place, not a chat bubble
  pinned to a corner.
- **Does it feel like a living operating system rather than static cards?** The measured answer is
  that **three independent clocks run at once and none of them is a loading state**: 1.90 s
  (circulation), 2.83 s (breath), 1.00 s (the uptime tick). Nothing on the page is waiting for a
  request in order to move.

#### 14-D3 · The palette: one cool ground, three planes, and a hue per employee — **V**

| Role | Sampled | Hue / lightness |
|---|---|---|
| Page + header ground | `#0e1821` | 208° · **L 9 %** — a cool blue-black, never pure black |
| Left rail plane | `#1a2636` | 214° · L 16 % |
| Card body plane | `#222934` | 217° · L 17 % |
| Command-card fill | `#1c1d2b` | slightly violet — the router is not the same plane as a worker |

Three planes, each a step lighter than the last, all inside a **6–17 % lightness band**: the product
never uses white space to separate things, it uses **elevation**. And on that grey ground **every
employee owns a hue**, carried on four different objects at once:

| Employee | Icon tile | Card header band | Modal top accent line |
|---|---|---|---|
| CMO | cyan `#a3ffff` | `#192e37` | `#84dcf0` |
| Sales Rep | magenta `#fd5eb8` | `#2a1e2f` | `#c45a9c` |
| Dev *(idle)* | green `#99dcb0` | `#192b28` | — |
| COO | indigo `#857bfe` | `#1b2336` | `#757acc` |
| Data Analyst | amber `#edc484` | `#262623` | — |
| CEO/Orchestrator | violet `#ce4aff` | — | — |

**The principle, stated plainly:** identity is a colour and the colour follows the employee
everywhere — the dot in the rail, the tile on the card, the tint under the card's header, and the
2-pixel line stamped across the top of its modal. The operator never reads a name to know whose
panel is open.

#### 14-D4 · The status vocabulary is three words and three colours, and the dead one is desaturated — **V**

`working` `#74e8a1` (green) · `idle` `#839393` (grey) · `waiting` `#f7cc88` (amber). Measured against
the card fill: green **9.62:1**, grey **4.57:1**. The idle state is not red and not an alarm — it is
**drained of colour and dropped in contrast**, so a stopped desk goes quiet on the page instead of
shouting. Nothing on this screen uses red at all.

#### 14-D5 · The wire is nearly invisible until it carries something — **V**

Wire against the page: **1.50:1** — a line you can barely see. The pulse on it: **12.23:1** against
the page and **8.15:1** against the wire itself. **The structure recedes by 8× so the traffic reads.**
This is the single most transferable visual decision in the reel: draw the org chart faintly, and let
the work be the only bright thing on it.

#### 14-D6 · The type scale is four steps, and the KPI numeral is the loudest object on the card — **V**

Cap heights measured on the native frame: eyebrow `AGENT NETWORK` **7 px** (uppercase, letter-spaced,
`#8693c7`, 5.99:1) · body copy **11 px** (`#acb6c0`, 8.71:1) · card title `CMO` **12 px** · page title
`Agents` **25 px** (`#f7ffff`, 17.68:1) · **the numeral `954` 30 px** — larger than the page title
itself, sitting over a **7 px** grey label `READS`. The number is the biggest thing in its region and
its label is the smallest; a counter is read before it is explained.

#### 14-D7 · The geometry is one rhythm, and the router breaks it on purpose — **V**

Five employee cards of **141 px** on a **153 px pitch** (12 px gutters), all identical, all on one
row. Above them the **CEO/Orchestrator card is 292 px wide and alone on its row** — a little over
twice a worker and centred. Hierarchy is stated by **size and solitude**, not by a label saying
"manager". The left rail is **157 px**, a lighter plane than the page (1.17:1 — separated by
elevation, not by a border line).

#### 14-D8 · The empty and disabled states are designed, not left blank — **V**

The inspector before anything is clicked reads *"Click a node to inspect it."* in the middle of an
otherwise empty panel; the graph page states its own default out loud — *"Every folder is open two
levels deep by default. Hover to trace connections — click + on a node to go further in."*; and the
**"Send to CEO" button is drawn disabled** while the field is empty rather than hidden. The interface
explains itself in place, and never shows an empty rectangle.

#### 14-D9 · The sound is mastered to a platform target, and the film never breathes — **V/T**

`ffmpeg ebur128`, this session: **integrated loudness −14.3 LUFS**, which is the normalisation target
social platforms use — the audio was mastered, not recorded and uploaded. The narration runs at
**154 words per minute**, and speech covers **60.84 s of the 61.05 s film — 99.7 %**, with a longest
single unbroken sentence of **7.64 s** and **0 ms** of gap between transcript segments. There is no
music bed and no pause: the reel's rhythm is one continuous take, and every screen event is cut to
land on the word that names it (the CMO modal opens on *"my CMO"*, the COO modal on *"my COO"*).

### What this source PRODUCES — law 7

Stated exactly, with nothing added:

- **It produces completed work against the owner's own requests.** The Agent Log carries **26**
  entries (`Last 26`), and the two fully legible ones both read `completed`. One of them is itself a
  produced artefact: *"First real report: 10 leads, 6 from Real Broker presentation (top source), 0
  closes, 0 tracked sent."* — a sales report that names its top source and does not hide the zeros.
- **It produces a memory that grows.** 954 records, and the same 954 read by the command layer.
- **It produces files on disk.** The two folders opened carry six markdown files between them, with
  real sizes.
- **It produces content pipeline output**, counted: 2 topics discovered, 10 hooks saved, 1 angle
  developed.
- **This reel does not show revenue, customers, subscribers or a price.** The one commercial noun on
  screen is the phrase *"a Attu OS subscription"* inside a skill description, which implies a paid
  product but proves nothing about its sales, and the closing line asks for comments rather than a
  purchase. What it produces commercially is not established by this source and is not guessed at
  here.

### What is **not** established from this source

- Which models run behind the agents; nothing on screen names one.
- Whether the five agents run concurrently or the router calls them in turn.
- What `ROUTES 10` counts over (a session, a day, all time).
- Whether the memory is a database, a file index, or both. The `Real folder / Local` chips prove the
  *folder* nodes are real directories; they say nothing about the 954 records' storage.
- The reel is filmed against `localhost:3001`, i.e. a development server on the author's own machine.
  That is a fact about **this recording**, not about where the product runs for anyone else.

### What the CEO confirms (C), and what is technically verified (R)

- **C** — the CEO's standing ruling of 2026-08-01 covers this queue: every one of these systems is
  real and live, confirmed by him first-hand. Nothing in this report re-opens that question.
- **R** — the only repository-verified statements here are the DXB measurements in §4, each with its
  command. Every statement about the rival is **V** (visible) or **T** (transcript), never R: no code,
  log or database of theirs was seen.

### Aliveness — how this living system is built (ledger law 8)

Four mechanisms keep this surface breathing, and three of them were timed to the pixel this session.

**1. The command layer emits work on a fixed cycle, and the cycle skips the idle.**
Tracker output over 5.0–11.0 s, 30 fps, de-duplicated (`frames/14-dense/`):

| Pulse leaves the command card | Reaches | Path length | Duration | Mean speed |
|---|---|---|---|---|
| 06.53 s | CMO (far left) | 305 px | **1.500 s** | 203 px/s |
| 06.87 s | Sales Rep (near left) | 153 px | **1.533 s** | 102 px/s |
| 07.53 s | COO (near right) | 153 px | **1.533 s** | 103 px/s |
| 08.43 s | CMO | 308 px | **1.567 s** | 197 px/s |
| 08.83 s | Sales Rep | 153 px | **1.467 s** | 106 px/s |
| 09.43 s | COO | 154 px | **1.400 s** | 114 px/s |

**Mean 1.500 s, spread 1.40–1.57 s.** The far employee is twice as distant and the pulse arrives in
the same time, so the speed is not a constant — **the duration is.** This is the identical law
measured on source 12 (one duration per edge, 1.8 s there) reappearing on a different page of the
same product at **1.5 s**, which makes it a house rule of that system rather than a coincidence of
one screen. The emission order repeats **CMO → Sales Rep → COO → Data Analyst** with a period of
**1.90 s** (measured across three cycles: 6.33 → 8.23 → 10.13 s).

**And the fifth branch stays dark.** A pixel scan of the Dev branch column (x 610–630, y 512–545)
across **all 180 frames** of the dense pass returned **0** pulses. Dev is the one card marked `idle`.
The motion encodes the state.

**2. The orb breathes on its own clock.** Halo radius measured along a fixed ray, 38.0–43.0 s at
30 fps: minimum **61 px** at 38.63 s, maximum **91 px** at 40.33 s, back to **62 px** at 41.47 s —
a **2.83 s period**, asymmetric: **1.70 s expanding, 1.13 s contracting**, a ±20 % swing. It is not a
loading spinner; it runs while the page sits still and nothing is being fetched.

**3. The clock counts.** The header timer advances exactly one second per second across the whole
opening sequence (00:46:47 at t=0 → 00:47:24 at t=33), beside a green `Agentic System Operational`
pill. The surface tells the operator the system has been up for 47 minutes without him asking.

**4. Two mechanisms answer the human's hand rather than a timer.** Hovering the command card **lifts
it** — the box grows ≈ 5 px per side and the border brightens (t=25 against t=24). Hovering a memory
node **dims the rest of the graph** so a single path stands out (t=45), then restores it.

**What DXB takes from this living system:** the pulse law is confirmed and gains a second clause —
**motion carries state, so an idle worker gets no pulse** — and that clause is filed into the existing
motion project rather than beside it (§5). The 2.83 s breathing orb is the second independent
sighting of a slow, asymmetric idle rhythm on a rival's primary surface, and it is the measurement
our own single 2.4 s heartbeat is compared against. The 1 s uptime clock and the hover-lift /
hover-dim pair are taken as the cheap half: they need no data we do not already have.

---

## 4. What DXB has today — measured by command, this session

Every figure below was measured on **2026-08-10** against the **company** database, read-only
(`docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At`), or by reading the
repository.

| Question this source raises | What DXB has, measured | Command |
|---|---|---|
| Does every employee carry a named, triggered skill list? | **No. `agents.skills` is an empty array on all 205 rows — not one agent carries a single named capability.** | `select jsonb_array_length(skills) as n, count(*) from agents group by 1` → `0\|205` |
| Is the workforce real? | **Yes — 199 `active`, 6 `archived`** | `select employment_status, count(*) from agents group by 1` |
| Is there a live working / idle signal per employee? | **No.** The legacy `agents.status` column reads `dormant` on all 205 rows, and the employees surface (`apps/dashboard/src/app/(command)/org/employees/page.tsx`, 380 lines) is a **filtered table with KPI tiles** — there is no command tree, no wire between a router and its workers, and no per-agent working/idle badge | `select status, count(*) from agents group by 1` → `dormant\|205`; read of the page source |
| Are the CEO's own sentences kept with an outcome? | **Kept, but stalled.** `intents` holds **57** rows — **51 `received`, 5 `dispatched`, 1 `failed_dispatch`**. Fifty-one of the fifty-seven things he said have never left the doorstep | `select status, count(*) from intents group by 1` |
| Is that log on a surface? | Yes — `apps/dashboard/src/app/(command)/ops/automations/page.tsx` reads `intents` | `grep -rln 'intents' apps/dashboard/src` |
| Does anything suggest **who should own** a request? | **No — 0 files in `apps/dashboard/src` and `packages/` carry a routing suggestion.** Our `/api/intent` route does classify → decompose → dispatch; it never returns a proposed owner for the CEO to see | `grep -rln "suggested_owner\|should own\|route_to\|assignee_suggest" apps/dashboard/src packages` → no matches |
| Does memory record where it came from? | **Yes, and richer than the rival's chip.** `memory_index` carries a `provenance` column over **13,403** rows — a JSON object with `origin`, `source`, `agent` and `task_id` — and it is rendered on `apps/dashboard/src/app/(command)/ai/memory/page.tsx` | `select count(*) from memory_index`; `select provenance, count(*) from memory_index group by 1 order by 2 desc limit 10` |
| Is there a one-way-in speech affordance? | Partly. `apps/dashboard/src/app/api/chat/dictate` exists (speech → text into the chat). There is no orb that takes a spoken sentence, files it to memory and answers with a proposed owner | directory listing of `apps/dashboard/src/app/api/chat/` |
| Is there a single perpetual heartbeat on a CEO surface? | Measured on source 12 and unchanged: the holding's only 2.4 s `infinite` animation is the login page beacon; inside the cockpit every perpetual motion is a loading placeholder | recorded 2026-08-09, `12-rinaldojanjua-b.md` §4 |

**The one line that matters in this table:** the rival's five employees are five **capability lists**;
our 199 active employees have **zero** capabilities recorded against them. Whatever each of ours can
do lives in a persona file and in code, and nothing on any surface — and nothing in the database a
router would read — says what any one of them is able to do or what sentence starts it.

---

## 5. The build project — *"yaparım, yapılır"*

### P14-1 — Every employee carries a named skill list, and each skill declares its own trigger · **needs no install, no money**

**The gap, measured:** `agents.skills` is `[]` on all 205 rows. A router cannot choose an owner from
an empty list, and the CEO cannot see what any employee can do.

**The specification, taken from the rival's own modal** — a skill row is five fields:

| Field | Example from the source |
|---|---|
| `name` | `inbox-triage` |
| `kind` | `SKILL` · `SUB-AGENT` · `SCHEDULED` · plus a `GLOBAL` scope flag |
| `what it does` | *"Read every file in inbox/, classify by content type, propose destinations, ask confirmation on ambiguous cases, then route each file to its canonical location…"* |
| `trigger` | *"Use when Rinaldo says 'triage inbox,' 'process my inbox,' 'sort the inbox,'…"* — the sentences that reach it |
| `cost / provenance` | *"Free — only needs yt-dlp"* · *"Rebuilt in-house from the Jason Cooperson tutorial"* |

**The DXB shape.** The column already exists and is already `jsonb`; nothing is migrated and nothing
is installed. The work is (a) a written schema for the five fields, (b) filling it from what each
persona already claims it can do, so the file and the row agree — this is the **file-first persona
architecture** the holding already uses, extended one level, and (c) surfacing the list on the
employee page so opening an employee answers *what can this one do, and what do I say to start it*.
Two of the five fields are the ones we would otherwise never have thought to write down: the
**trigger sentences**, and the **cost line**, which is the CEO's approval gate stated where the
capability lives.

**Scheduled and sub-agent rows are the same object.** A capability that runs on a clock is a row with
its clock printed (*"At 08:00 AM and 04:00 PM, every day"*), and a capability that spawns workers is a
row typed `SUB-AGENT`. One list holds all three kinds, which is why the rival needs no separate
"automations" page to explain itself.

### P14-2 — The pulse carries state: an idle worker gets no pulse · **filed INTO P11-1 / P12-1, not beside it**

Source 12 fixed the pulse's *physics* (one duration per edge). This source fixes its *meaning*, and
adds a second figure for the same law:

- **duration per edge ≈ 1.5 s** on this page (1.40–1.57 s over six tracked pulses), against 1.8 s on
  source 12's board — so the constant is the *rule*, and the number is a per-surface choice;
- **emission period 1.90 s** for a full round of the working employees;
- **an employee marked `idle` receives nothing** — 0 pulses on the Dev branch across 180 frames.

That last clause is the buildable half and it changes the design brief: a wire that always glows is a
decoration, while a wire that goes quiet when a desk goes quiet is a **status display the CEO can read
across the room**. It needs one boolean per employee — the same signal P14-3 needs — and no motion
work at all until the design package is approved.

**Waits on the CEO** for the visual (the design package is his gate) <!-- OPEN: B22 -->. The data half
— a per-employee working/idle signal that the surface can bind to — needs no install and no money.

### P14-3 — The CEO's own sentence appears in a log with its outcome, and the system proposes who should own it · **needs no install, no money**

**The gap, measured:** 51 of 57 `intents` sit at `received`; nothing on any surface proposes an owner
(0 matches, whole dashboard and packages).

Two halves, both cheap:

1. **The log.** The rival's Agent Log is one panel: the owner's raw sentence, its source, an outcome
   chip, an age. Ours has the data (`intents.text`, `.status`, `.created_at`, `.task_ids`) and a page
   that already reads the table. What is missing is that the CEO can look at it and see that **fifty-
   one of his sentences never moved** — which is precisely the fact the anti-baby-sitting product
   exists to surface rather than hide.
2. **The suggestion.** *"…and suggests who should own it"* is the rival's contract with its owner: the
   system does not silently act and does not silently stall — it proposes a desk. With P14-1 in place
   the proposal becomes mechanical: match the sentence against the trigger lines, return the employee
   and the skill, and let the CEO confirm. The approval gate the holding already enforces is exactly
   the right place for that confirmation to land.

### P14-4 — The memory node says what it is: `Real folder · Local`, with the file list and the byte sizes · **needs no install, no money**

We are **ahead on the data and behind on the reading.** `memory_index.provenance` already carries
`origin`, `source`, `agent` and `task_id` over 13,403 rows, where the rival shows two chips. What the
rival has that we do not is the **inspector discipline**: a node opens into a small panel that states
the kind, the name, the counters and **the actual files with their sizes**, and marks in two words
whether the thing is real and where it lives. Applied to our memory surface it costs a panel and no
new data, and it answers the one question a memory graph must never dodge — *is this node a real
thing or a model of one?*

### P14-5 — The design channel the holding does not have: an identity colour per employee, and a fourth motion duration · **into the Phase-4 visual package, which is the CEO's gate**

Measured against our own tokens this session (`apps/dashboard/src/app/globals.css`), the holding's
design system is disciplined where the rival's is: dark is primary, pure black and pure white are
forbidden, colours are OKLCH, the z-index scale is semantic, and the type scale is fixed at
11.5 / 14 / 15 / 22 / 28 px. Two specific things it does **not** have, both visible in this reel:

1. **No identity channel.** We carry **one** `--accent` (amber, `oklch(0.8 0.115 92)`) for the whole
   product, plus `--ok / --warn / --danger / --info`. The rival gives **every employee a hue** and
   repeats it on four objects (rail dot → icon tile → card header tint → the 2 px line across the top
   of its modal). A holding with Hamza and ~20 directors — which §6 of his directive requires — has
   no way to say *whose* panel is open except by reading the name. This is a token-level addition, not
   a redesign: an identity hue per employee, derived once and bound to the persona.
2. **No travel duration.** Our motion tokens are `--dur-fast 150ms`, `--dur 250ms`,
   `--dur-slow 400ms`. The rival's defining motion is **1500 ms** — 3.75× our slowest token — because
   it is not a transition, it is **a thing crossing the screen**. A vocabulary that stops at 400 ms
   cannot express work moving from one desk to another. One more token, and the rule from §14-D5 with
   it: **the wire sits at ≈1.5:1 against the ground and the thing travelling on it at ≈12:1**, so the
   structure recedes 8× and only the work is bright.

Three further principles from §14-D4…D8 belong in the same package and cost nothing to state: the
**three-word status vocabulary** where idle is desaturated rather than alarming; **hierarchy by size
and solitude** (the router is 2× a worker and alone on its row) instead of a label; and the
**KPI numeral larger than the page title** over a 7 px label.

**The boundary, from his own directive §5:** the **left navigation bar and its icons are the one
pre-approved visual element** of DXB and nothing here proposes touching them. Everything above enters
the Phase-4 visual package, which may not be implemented before he approves it <!-- OPEN: B22 -->.

### What is NOT taken, and why

- **`localhost:3001`.** The reel is filmed against a development server on the author's machine. That
  is his choice of demo, not a design to copy.
- **The `New | Classic` toggle.** Two coexisting versions of the same product is a migration state, not
  a feature; the CEO's minimalism ruling would strike it.
- **The personal-brand framing** — *"Rinaldo's Brain"*, *"Use when Rinaldo says…"* — is right for a
  one-man operator and wrong for a holding with a governed workforce. We take the mechanism (a
  capability declares the language that triggers it) and leave the first person.
- **`client-shoutout` posting into Facebook groups.** Outward posting on a client's behalf is exactly
  the class of act the holding's approval gate stops. The pattern worth keeping is the one already
  inside their own row: *"present the whole batch for one approve/deny decision before posting
  anything."*
- **Skill provenance naming a competitor's tutorial** is honest and useful internally; it is not put
  on a CEO-facing surface.

---

## 6. Verdict

**This source is the parts list, and it is the most directly buildable one on the queue so far.**
Rows 11 and 12 gave the holding a motion specification. Row 14 gives it a **data model**: an employee
is a role, a live state, and a list of named capabilities where each capability declares what it
does, the sentences that trigger it, what it costs and where it was learned. That is a `jsonb` column
we already have and have never filled — 205 rows of `[]` — and it is the missing link under three
things the holding has been circling: a router that can choose an owner, a surface that can tell the
CEO what his workforce is able to do, and an intent queue that stops at `received` because nothing
downstream knows who the sentence belongs to.

The second finding is smaller and sharper: **the animation is a status display.** The idle employee
gets no pulse. A wire that always flows tells the owner nothing; a wire that goes quiet tells him
where to look. That is one boolean, and it turns the motion work from decoration into instrumentation
before a single pixel of it is designed.

**The third finding is the design system, and it is the reason this file was reopened.** Sampled from
the native frames: one cool blue-black ground at 9 % lightness with three planes stacked inside a
6–17 % band, **a hue per employee carried on four objects at once**, a three-word status vocabulary
whose idle state is desaturated rather than alarming, a wire drawn at **1.50:1** against the ground
with its traffic at **12.23:1**, a KPI numeral (30 px) set larger than the page title (25 px) over a
7 px label, hierarchy stated by size and solitude, and empty and disabled states that explain
themselves in place. Against our own tokens the two concrete absences are an **identity colour
channel** and a **travel duration** — our motion vocabulary stops at 400 ms where this product's
defining movement is 1500 ms.

What this reel does not give is any read on the rival's commercial output — no revenue, no customers,
no price. Its measurable production is internal and real: 26 logged requests with the visible ones
`completed`, 954 memory records, files on disk with byte sizes, and a content pipeline counted in
topics, hooks and angles. On the measure that decides — a system that runs its owner's business while
he films a reel — it is running and ours is not, and the four projects above are the specific,
install-free steps that close the distance this source exposes.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-10 | File opened from nothing and written in one pass: whole reel watched in order at 1 fps at native 1080 × 1920, audio read as 16 timestamped segments, movement measured with a 30 fps dense pass and a linking tracker over 5.0–11.0 s and 38.0–43.0 s, seven native zoom crops cut for the small type, and nine DXB facts measured against the company database read-only and against the repository the same session. |
| 2026-08-10 | **DEFECT FOUND BY THE CEO AND FIXED AT ITS SOURCE THE SAME TURN.** His question: *"peki görünürlükle ilgili şeyler yazdın mı rapora? … yani design ile ilgili şeyler. her zaman söylüorm."* He was right. The controlling directive — `docs/ceo-directives/2026-07-reanalysis/00_READ_FIRST_MASTER_DIRECTIVE.md`, whose own title is **RE-ANALYSIS AND DESIGN** — **was not opened before the first pass was written**; the door `dxb-rival-intel` names it in its first line and the pointer was not followed. Its §3.2 requires the visual hierarchy and the feel of the interface, and its §4 question 7 requires the **design principle** to adopt. The first pass carried the mechanism and the motion and **no measured design reading at all**. Added this turn: **§14-D1…D9** — led by **the shape law** (rectangles hold, circles live; the orb measured as a lit sphere at aspect 1.028 with its highlight 10 px off centre, every memory node a hollow ring, 39 dendrite dots on a true circle) and **the organism reading** (skeleton, blood at 1.5 s, heartbeat at 1.90 s, five organs of which the idle one gets no blood, a lung breathing at 2.83 s, a brain literally labelled `954 RECORDS` sharing its number with the body, and three independent clocks none of which is a loading state) — then palette and identity hue, status colour vocabulary, wire-to-traffic contrast, type scale, geometry, empty/disabled states, audio mastering — every figure sampled from the native frames or computed from those samples — plus project **P14-5** measured against our own `globals.css` tokens, and a third paragraph in the verdict. |
