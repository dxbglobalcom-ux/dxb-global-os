# 30 — "BENNETT OS · V3 OPERATOR MODE" · a company drawn as one radial graph, with an SOP behind every node

> **READ THIS WITH REPORT 33.** The CEO's live order of 2026-08-19: *"bu video ve 33. videoyu
> beraber çalış… bu iki videoda çok önemli üzerinde dikkatlice çalış."* Source **33 is the same
> product, filmed again** — 112 agents instead of 37, the **light theme**, a money page, and a
> conductor docked on every page. `33-dbeny9artri.md` carries only what it adds.

## WHY IT MATTERS TO THIS HOLDING

This source answers the one question our own product has never answered on a screen: **what does a
department actually DO, who does it, and how much of it is the machine's job rather than the human's?**

He draws a whole company as a single radial graph — six departments, 37 agents, and under every
agent a named **SOP** whose card states, in three lines, what a human used to do, what the machine
does instead, and where on the ladder between them that job stands today. Measured in the company
database this session, at 07:5x on 2026-08-19, over TCP with `SELECT` only:

- `public.agents` → **205 rows**, `status` = **`dormant` on all 205**, `autonomy_level` = **0 on all 205**.
- `public.agents.skills` (jsonb) → **`[]` on all 205**. Not one of our written employees has a single
  skill recorded against it.
- `public.workflows` → **0 rows**; `public.workflow_runs` → **0 rows**. **This holding has 21
  departments and not one written-down, runnable procedure anywhere in its database.**
- `public.revenue_ledger` → **0 rows, €0**.

He has 37 agents and a written procedure behind each one. We have 205 employees and no procedure
behind any of them. **The part this queue was opened for is the SOP card and the ladder on it.**

## 1. Source identity

| Field | Value |
|---|---|
| Address | `https://www.instagram.com/reel/DbcPo0dMQ3d/?igsh=MWIwOXZkYzg4Ymt5Yg==` |
| Product filmed | **BENNETT OS — `V3 · OPERATOR MODE`** (read from its own sidebar); its knowledge page is **`OPTIMAL ENGINE`**, footed `localhost:4100 · sqlite · real agents` |
| Operator | **Bennett Spooner**, named on his own org chart as `OPERATOR`. Filmed at his desk, pointing at the monitor |
| File | `.planning/research/rival-intel/media/30-DbcPo0dMQ3d.mp4` — 19,265,333 bytes |
| **sha256** | `66e2d485799ce39e583e8762f3f913d287911ad54d6be705f186d163d43a1e91` |
| Repository state when written | commit `006e018e` |
| Resolution | **1080 × 1920** (vertical), 30 fps · VP9 video · AAC audio — **audio present** |
| Duration | **85.846009 s** |
| Transcript | `transcripts/30.json` — English, **23 segments**, highest `no_speech_prob` **0.873** (the last line) |
| How it was read | **Watched whole with its sound**, 86 native 1080 × 1920 frames in order against the transcript. Motion taken from **two 10 fps dense passes** cut from the video (4–12 s and 51–55 s), **camera-compensated**: each pair aligned by an integer-shift search on a static text region, then measured |
| Format note | **Filmed off a physical monitor in a lit room, handheld** — not a screen recording. Every motion figure below therefore carries a camera-noise floor, and that floor is measured and printed beside the figure rather than assumed away |

## 2. The record — what was said, and what the screen showed

Speech verbatim from `transcripts/30.json`; the screen column is what the frames show at that second.

| Time | Words | On his screen |
|---|---|---|
| 00:00 | "I just built a team of 37 AI agents that run my entire company." | **`BENNETT OS · V3 · OPERATOR MODE`**, page `OPTIMAL ENGINE`. The whole company as **one radial graph**: six coloured department hubs ringed by ~90 nodes in three orbits. Rail in five groups — OPERATE · AGENTS · INTELLIGENCE · SYSTEM · VARIANTS. Rail foot: **`0/21 systems live`** |
| 00:04 | "…broken up across six different departments that run my day-to-day operations." | Legend, right: **Obsidian · Pillars · SOP tasks · Humans · AI agents · Tools**, each with a live count; a `DIRECTORY` beneath names every entity with its department |
| 00:08 | "And no, this is not just visual LARP. These are real functional AI agents." | Rail foot reads **`localhost:4100 · sqlite · real agents`** — the machine states where it runs and what it stores on, on every page |
| 00:12 | "You can click into each one of them and see all the skills that are being run." | **`SALES`** opened: five tools on top (`Attio · FanBasis · Fathom · Pava · Stripe`), six agents beneath, each dropping to one SOP line, all converging on the pink `Sales` hub |
| 00:16 | "And in the middle here, we have our full company knowledge base, which I built this on Gbrain." | The `Obsidian` panel: **`120 NOTES · 8 FOLDERS · 595 WIKI-LINKS · 8 CLUSTERS`**, *"~107k words"*, **eight domains at 15 apiece**, and a query box — *"query the whole brain…"* |
| 00:24 | "And to go through all six departments, we have communications, sales, finances, clients, marketing, growth, and tech." | Each department drawn in its own hue with its own hub icon; a `< Communications >` pager at the bottom steps between them |
| 00:31 | "And when you click on each one of these, there's an SOP for each operation or workflow in the company connected to whatever AI agents are necessary and humans." | **`COMMUNICATIONS`**: tools `Comms Feed · Slack · Imap · Whatsapp`; agents `Comms Agent · Slack Worker · Mia Torres · WhatsApp Worker · Gmail Worker` — **`Mia Torres` is drawn in yellow, the legend's colour for `Humans`** — each over its own SOP line |
| 00:39 | "And you can see that here there are downloadable skill files for each SOP." | The SOP card, **`Digest Slack channels`** · `Communications · Slack Digest` · pill **`FULLY AUTONOMOUS`** · state **`NOT STARTED`**. **`1 runnable skill file — yours to download`**. `BREAKS INTO: channel-lister · digest-writer · mention-extractor`. `BUILDS ON: Slack Bot Token`. `WHAT IT REPLACES: "Reading every channel to find the two messages that needed you."` |
| 00:43 | "The agent listed below that's associated with the workflow." | `DONE BY: Slack Worker · AI agent · 1:1 · runs on builtin · @slack/web-api`. Then `THE SOP, WRITTEN OUT` — five numbered steps — and `TOOLS AT THE END OF THE CHAIN (1): [[Slack]] MCP` |
| 00:46 | "And then whether it is human-led, human-assisted, or fully autonomous." | **`THE LADDER`** — three rungs, each with its own sentence: `HUMAN-LED` *"You read every channel to find the one that needed you."* · `HUMAN-ASSISTED` *"It digests each channel; you scan the summaries."* · **`FULLY AUTONOMOUS`** *"It digests, calls out direct mentions and unanswered questions, and pushes to the feed."* The live rung is marked by a bright vertical bar. Beneath it, `THE HUMAN`: *"You answer the mentions. It makes sure you see them."* |
| 00:51 | "I also realized that there's going to be a ton of other people who would be interested in this." | A second card, **`Audit brain-store markdown health`** · `TECH · Knowledge Hygiene` · `FULLY AUTONOMOUS` · state **`IN DEVELOPMENT`** · `WHAT IT REPLACES: "A part-time knowledge-base janitor that never keeps up."` · `DONE BY: Markdown Auditor · runs on builtin · fs walk` |
| 00:58 | "So I went and gathered all the agents and skills I've built within the last year. And I've put them into different personas that you can preload into your own OS when you boot it up." | **`PERSONAS · // PLATFORM VARIANTS`**, **`01 / 11`**. `01 Agency Owner` — badge `AGENCY OPERATOR`, `NORTH STAR: Net retainer MRR retained (revenue kept, not just won)`, `PILLARS · 5` each with named sub-agents, `CONNECTORS` (HubSpot CRM · Asana · Slack · Google Analytics 4 · Meta Ads Manager · Google Ads · Harvest · QuickBooks Online), `TRACKS` (5 metrics). Right half: that persona's own knowledge graph |
| 01:03 | "Here's the example of what mine looks like." | Personas `03 DTC Brand Operator` (`NORTH STAR: Contribution margin after ad spend`) and `07 Course Creator / Info-Product Operator` (`NORTH STAR: Enrollment revenue × student completion rate`), each with its own connectors, pillars and graph |
| 01:05 | "I have my social tab, my funnel so I can see all the leads in a visual sense because I'm a very visual learner." | **`SOCIAL`**: `ACCOUNTS 60,802 TOTAL` — Instagram **40,061** (+1.72 %), TikTok **9,945** (+2.30 %), Twitter/X **4,196** (+2.23 %), YouTube **687**; `TOTAL REACH 60,802` across *"5 platforms + email"*; `AUDIENCE GROWTH +0.31 %`; `TOTAL DMS 1,990`. Then **`FUNNEL`**: `FIRST TOUCH 13 → ENGAGED 13 · 100 % → NURTURED 11 · 84.6 % → OPTED IN 10 · 90.9 % → CONVERTED 7 · 70 %`, badge **`DEMO DATA`**, mode `FLOW · RADIAL · LIVE FUNNEL` |
| 01:10 | "I have my finance tracking dashboard and all of this is accessible by my one Hermes harness that is in charge of all 37 of my other agents that I use as a delegator or conductor agent." | **`AGENT HIERARCHY`**: `Bennett Spooner · OPERATOR` → `CONDUCTOR (SUPER AGENT)` → an `AI HEAD` card, *"super agent · builtin runtime until the Mac mini lands"*, with a **chat box drawn inside the org chart** (`Send`) and `AGENT TOOLS: broadcast · openclaw · tmux`. Beneath it five crew cards, each with its agents and its own tool row (`stripe · paypal · square · whop · fanbasis` under Finances) |
| 01:21 | "If you guys want to see how the full OS works, comment founder down below and I'll send it over." | Burned-in caption **`COMMENT "FOUNDER"`** over the full radial graph |

### 2.2 Design and appearance — measured from the pixels

> **This product was filmed twice.** Source **33** is the same build in its **light theme**, and the
> two-theme colour rule is measured across the pair in `33-dbeny9artri.md` §2.2. Everything below is
> theme-independent.

**Composition.** The reel is **filmed, not recorded**: a physical monitor standing in a dark room
with RGB strip lights, a hand entering the frame to point. Read off frame `t009`, where the whole
application is in shot: the app spans **x 37 → 1080**, the **left rail ends at x ≈ 192 (14.9 % of the
application's width)**, the working canvas runs to **x ≈ 1008 (78 %)**, and the right intelligence
panel takes the rest. The right panel's full width is cut by the camera — **UNVERIFIED**, and it
would need his own screen recording to settle.

**One shape carries the whole product: the radial graph.** Every department, every persona and the
company itself is drawn the same way — **a glowing hub at the centre, its agents on a ring, their
tools on the ring beyond, and the SOP lines falling from the agents to the hub as dotted paths.**
Learn the picture once and it reads on nine pages.

**How a node is drawn — a hollow ring with a halo, never a disc.** Radial brightness profile through
the Sales hub, frame `t024`, sampled at 72 angles per radius: centre **25.7** · r4-r8 **101 → 87**
(the glyph) · **r12-r14 a second bump, 74.8 → 80.4 — the ring stroke itself** · then a decay to
**25.1 at r26**. So the node is a **≈13 px-radius outline** containing a small figure glyph, and its
glow dies out by **≈26 px** — the halo is as wide again as the ring. **The whole graph is line-work,
which is why ninety nodes on one screen do not turn into soup.**

**Edge grammar — two line types, and the difference is measurable.** Brightness profiles along the
paths in frame `t011`, taking the maximum across a ±3 px band so a slight offset cannot fake it:

| Edge | Length | Lit | Rhythm |
|---|---|---|---|
| **Agent → SOP → department hub** (left path) | 253 px | 41 % | **26 peaks, median pitch 9 px** |
| **Agent → SOP → department hub** (right path) | 254 px | 53 % | **31 peaks, median pitch 10 px** |
| **Tool → agent** | 130 px | 16 % | 3 peaks — **no rhythm; an unbroken thin line** |

**A beaded 9–10 px path means "this is a procedure"; an unbroken line means "this is a connection".**
One glance separates the work from the wiring.

**The department's brain is a particle cloud, and it is dense.** Under each hub sits a disc labelled
`Obsidian`. Measured in `t011` inside a **58 px radius: 215 separate bright particles**, with a bright
vertical spine through the centre. It is the same object as the knowledge page's own graph, shrunk —
**every department carries a miniature of the company brain beneath it.**

**Palette, sampled from the pixels** (most-saturated pixel above 35 % value per region, frame `t024`;
these are the film's rendering of his screen — the relationships survive the camera, the exact brand
hexes do not): ground **`#0E0D1C`** · left rail **`#040715`**, *darker than the ground, so the work is
the brightest thing on the screen* · card **`#060A1A`**. **A department is a HUE and it is the same hue
everywhere** — on the hub, on the ring, on the crew card and in the directory: Sales **`#F55E93`** ·
Communications **`#36BDFF`** · Finances **`#21FFB9`** · Clients **`#16ECEE`** · Tech **`#9076FD`** ·
Marketing/Growth **`#D2C07E`**.

**And a persona re-tints the ENTIRE graph to one colour.** Measured on three of the eleven variants:
`01 Agency Owner` **`#18FDC2`** (green, h164) · `03 DTC Brand Operator` **`#B84995`** (magenta, h318) ·
`07 Course Creator` **`#EBD858`** (yellow, h52). **Each preset is monochrome and owns a hue** — you
know which company you are looking at before you read a word.

**The legend is the product's grammar, and it is on the page.** Six node kinds, six marks, each with
a live count: `Obsidian` (the brain) · `Pillars` · `SOP tasks` · **`Humans`** · `AI agents` · `Tools`.
**A human and an AI employee are the same shape in a different colour** — Mia Torres sits in the
Communications ring in the `Humans` yellow, between two AI workers. One picture holds the mixed
workforce without a second view for people.

**Type — a two-size scale and nothing in between.** Glyph heights measured by row-profile on `t024`:
the page title `OPTIMAL ENGINE` is **24 px**, its kicker `// KNOWLEDGE CORE` is **11 px**, and every
rail entry — `Home`, `Comms`, `Funnel`, `Workflows`, `Social`, `Finances` — is **11–12 px**. **One
heading size, one body size, a 2.2 × ratio, no third step.** Monospaced throughout; section labels in
letter-spaced small capitals (`// PLATFORM VARIANTS`, `BREAKS INTO`, `WHAT IT REPLACES`, `THE LADDER`,
`DONE BY`, `THE SOP, WRITTEN OUT`) with the value beneath in sentence case. **The `//` prefix and the
block cursor after `OPTIMAL ENGINE` are the only two ornaments in the whole interface** — no gradient,
no glass, no shadow. The instrument feeling is bought with two characters.

**The room is part of the design, and it is timed.** Behind the monitor stands an LED bar; measured
across all 86 frames by taking the most saturated bright pixel of the wall band, it is **readable in
75 of 86 seconds and it sweeps the entire colour circle — 0° to 349°.** Consecutive-second hue steps:
**median 4.8°, and 69 % of steps are under 25°** — a slow drift, not a strobe, closing a full circle
in about **75 seconds**. The keyboard beneath is lit on the same sweep. **The product on screen never
changes colour; the room around it does.** For a CEO who asked for a cockpit, that is the cheapest
half of the effect and it is not code.

**Two design honesties worth stealing outright.** The rail foot prints **`0/21 systems live`** and
**`localhost:4100 · sqlite · real agents`** on *every* page — the machine says what is running and
where it lives, permanently, in eight-point type. And the funnel page carries its own **`DEMO DATA`**
badge beside the live-mode switch: **the product labels which numbers are sample data on the surface
itself**, not in a footnote.

## 3. Capabilities — the mechanism this source shows

**1 — The company is one graph, and the graph is navigable `T` `V`.** Departments → agents → tools →
SOPs are one continuous structure with a `< Sales >` pager, a `Back` breadcrumb, a `Radial | Neural`
layout switch and `Fullscreen`. Not a list on one page and a chart on another — one object, entered
from any node.

**2 — Every job is an SOP card, and the card is the whole contract `T` `V`.** Nine fields, always the
same, ending in the numbered procedure and the MCP tool at the end of the chain (fields listed in §5).
**A reader can hand that card to a stranger and the job gets done.**

**3 — `THE LADDER` — the mechanism this queue has been missing `T` `V`.** Autonomy is not a flag; it is
**three written sentences describing the SAME job at three levels**, with the live rung marked by a
bright bar, plus a `THE HUMAN` line saying what the owner still does. *"…whether it is human-led,
human-assisted, or fully autonomous."*

**4 — One brain, counted and queryable `T` `V`.** 120 notes, **595 wiki-links**, 8 clusters, ~107k
words, eight domains, one query box across all of it, drawn as the graph's own centre — and an input
bar above every view taking **text, voice, drag or upload**: *"dump into the brain… or drop documents."*

**5 — One conductor, reachable from the org chart `T` `V`.** `CONDUCTOR (SUPER AGENT)` holding
`broadcast · openclaw · tmux`, **with its chat box drawn inside its own box on the hierarchy** — the
owner talks to the delegator from the picture of the company.

**6 — Humans are first-class nodes in the same graph `V`.** `Humans` is a legend kind with its own
colour and count; Mia Torres stands in the Communications ring beside the Slack Worker. One picture
holds the mixed workforce.

**7 — The persona is the packaging `T` `V`.** Eleven `PLATFORM VARIANTS`, each a complete company
preset: a badge, one line of who-it-is-for, **a single `NORTH STAR` written as a revenue sentence**,
five `PILLARS` of named sub-agents, a `CONNECTORS` row of real SaaS accounts, five `TRACKS` metrics,
a `SIGNATURE PLAY`, and its own knowledge graph.

**On what this source PRODUCES `V`:** the reel shows **audience and distribution, measured on his own
wall** — 60,802 followers over five platforms plus email (Instagram 40,061 · TikTok 9,945 · Twitter/X
4,196 · YouTube 687), +0.31 %, and **1,990 DMs**. It shows a funnel whose own badge reads `DEMO DATA`
(`7/13 CONVERTED`). It does not show a euro figure. The CEO knows these systems personally and his
knowledge outranks a reading of a reel.

### Aliveness — how this source is built to live, and what DXB takes

**What runs on its own clock `V`.** The rail foot counts **`0/21 systems live`** on every page — a
permanent census of how many of the twenty-one connected systems are up, in the corner, always. Two
agents exist only to watch: **`Stack Monitor · Local Stack Health`** and **`Markdown Auditor`**, whose
written SOP is *"01 Walk every markdown file in clue-agent/brain-store · 02 Flag broken wiki-links,
orphan notes and stale frontmatter · 03 Check generated org docs still match the live agents, SOPs and
tools · 04 Write the health report with per-folder scores"* — **a machine that audits its own
knowledge on a schedule and scores it.** And each SOP carries a running state (`NOT STARTED`,
`IN DEVELOPMENT`) so the build itself is visible from the surface.

**What makes the surface breathe — TIMED, against a measured camera-noise floor.** The film is
handheld, so a raw difference would measure his wrist. Both dense passes were **camera-compensated**:
every 100 ms pair aligned by an integer-shift search (±14 px) on a static text region, then measured.
The clean reading comes from the persona page (51–55 s), where a large block of static text sits
beside a live graph in the same frame — the twelve best-aligned pairs, residual on the static text
**4.302**:

| Region, same frame pairs | Mean change per 100 ms | Peak | Against the panel's own still ground |
|---|---|---|---|
| **Graph ground (empty patch of the live panel)** | **0.925** | 2.650 | **1.00 ×** — genuinely still |
| Static text panel (**the camera-noise floor**) | 4.302 | 5.109 | 4.65 × |
| **The graph's glowing core** | **6.267** | 10.157 | **6.78 ×** — and 1.46 × the noise floor |
| **A spoke node on the ring** | **7.985** | 14.518 | **8.63 ×** — and 1.86 × the noise floor |

**So the nodes move and the ground does not, inside the same panel and the same frame pair.** The core
was also traced by luminance across the same pass: it **rises from 79.3 to 112.1 (+41 %) over 800 ms,
then fades back to 94.4 over the following 1.1 s** — a breath of roughly two seconds, not a loop of
decoration.

On the department pages (4–12 s) the same method left only ten well-aligned pairs and the answer is
weaker: the department's core brain measured **2.80 ×** the graph ground and the dotted SOP edges
**3.27 ×**, while a *static* legend panel in the same frames measured **2.56 ×** — **the dotted edges
sit barely above the noise floor there, so whether those SOP paths carry travelling dots is
`UNVERIFIED` from this film.** Settling it needs his own screen capture, or a tripod segment.

**How it answers the human `V`:** the conductor's chat box is inside the org chart, and the knowledge
core's input bar (`text · voice · drag or upload`) stands above every view of the Optimal Engine, so
the way in is never more than the page you are already on. No response time is on the film —
**UNVERIFIED**; it would need his own recording of a send.

**What DXB takes:**
1. **The SOP card with `THE LADDER`.** Nine fields, three rungs, one marked. This is the object that
   turns 205 written employees into a company that can be handed over, and it is the single most
   buildable thing on this queue.
2. **`WHAT IT REPLACES`, in the human hour it removes.** Every job on the surface states its own
   business case in one sentence. That is the money argument written into the interface.
3. **The permanent census in the rail foot** — `0/21 systems live` — and the honest `DEMO DATA` badge.
4. **One hue per department, everywhere**, and **humans as a node kind in the same graph as the agents.**
5. **The persona as a `NORTH STAR` plus pillars plus connectors** — one revenue sentence per variant.

## 4. What DXB has today — measured 2026-08-19 `R`

`SELECT`-only over TCP against the company database (`supabase_db_DxB_Global_OS`, port 54322).

| What his screen shows | Ours, measured this session | The distance |
|---|---|---|
| An SOP card behind every agent, with steps, tools, prerequisites and a downloadable skill file | `SELECT count(*) FROM public.workflows` → **0**; `workflow_runs` → **0** | **There is no written-down procedure in this holding's database at all.** The table exists and has never held a row. |
| Three-rung autonomy written out per job, with the live rung marked | `SELECT autonomy_level, count(*) FROM public.agents GROUP BY 1` → **`0` on all 205** | The column exists and carries one value. **No employee has ever been placed on a ladder.** |
| Every agent's skills listed and clickable | `agents.skills` (jsonb) → **`[]` on all 205** | **Not one of the 205 has a skill recorded.** |
| Six departments, each a hue, each a hub in one graph | `public.departments` → **21 rows**; `v_org_graph` → **221 rows** | The organisation exists as data. **Nothing draws it, and no department owns a colour.** |
| Live states on the workforce | `SELECT DISTINCT status FROM public.agents` → **one value, `dormant`**, on all 205 | |
| `0/21 systems live` printed on every page | 60 base tables, no census on any CEO surface | |
| A brain of 120 notes and **595 wiki-links**, drawn and queryable | `memory_index` **13,919 rows** — and a search of all 60 tables finds **no relations table of any kind** | **We hold 116 × his notes and cannot record that two of them are linked.** The object does not exist. Owned by the memory brain he approved on 2026-08-01. <!-- CEO-OK: v2-memory-brain-2026-08-01 --> |
| 11 personas as company presets, each with a revenue north star | `public.personas` → **408 rows** — written identities, not sellable presets | **We have 37 × his personas and no packaging.** |
| A funnel of 13 named leads, 7 converted | `crm_deals` → **0 rows**; `revenue_ledger` → **0 rows, €0** | Expected — the money mechanism is off by the CEO's own decision. Recorded here as **shape**, not as a shortfall. |
| One conductor chat reachable from the org chart | `tasks` **217 rows** lifetime; the orchestrator exists and is reachable from no picture of the company | |

## 5. The build project

> **DESIGN, MECHANISM AND MONEY — the figures a builder needs, carried here so §5 reads alone.**
> - **The SOP card, nine fields:** title · department · autonomy pill · state (`NOT STARTED` /
>   `IN DEVELOPMENT`) · **one runnable skill file, downloadable** · `BREAKS INTO` (sub-skills) ·
>   `BUILDS ON` (prerequisite) · **`WHAT IT REPLACES`, written as the human hour removed** ·
>   `THE LADDER` · `THE HUMAN` · `DONE BY` (agent · ratio `1:1` · runtime, e.g. *"builtin ·
>   @slack/web-api"*) · **`THE SOP, WRITTEN OUT`, numbered** · `TOOLS AT THE END OF THE CHAIN` as MCPs.
> - **`THE LADDER`, three rungs, each a written sentence about the SAME job:** `HUMAN-LED` →
>   `HUMAN-ASSISTED` → `FULLY AUTONOMOUS`, live rung marked by a bright vertical bar.
> - **One shape for the whole product:** glowing hub → agent ring → tool ring → dotted SOP paths,
>   with `Radial | Neural`, a `< Department >` pager and `Fullscreen`. Left rail **14.9 %** of the
>   application width, working canvas **78 %**.
> - **Node = a hollow ring, never a disc:** ≈**13 px** radius outline with a glyph inside, halo dying
>   out by ≈**26 px**. **Edge grammar:** agent→SOP→hub is **beaded at a 9–10 px pitch** (41–53 % lit);
>   tool→agent is an **unbroken thin line** (16 % lit, no rhythm). Each department carries a miniature
>   brain beneath it — **215 particles inside a 58 px radius**.
> - **Type: a two-size scale, 2.2 ×, nothing between** — page title **24 px**, kicker and every rail
>   entry **11–12 px**.
> - **A persona re-tints the whole graph to one hue** — `01` `#18FDC2` · `03` `#B84995` · `07` `#EBD858`.
> - **The room, timed:** the LED bar behind the monitor sweeps the full colour circle at a median
>   **4.8° per second — one full circle in ~75 s** — while the product on screen never changes colour.
> - **Palette, sampled from the pixels:** ground `#0E0D1C` · rail `#040715` (darker than the ground) ·
>   card `#060A1A` · **department hues used identically on hub, ring, crew card and directory** —
>   Sales `#F55E93` · Communications `#36BDFF` · Finances `#21FFB9` · Clients `#16ECEE` · Tech
>   `#9076FD` · Marketing/Growth `#D2C07E`. Monospaced throughout; labels in letter-spaced small
>   capitals; **the only ornaments are the `//` kicker prefix and a block cursor.**
> - **Motion, camera-compensated at 10 fps:** an empty patch of the live panel **0.925** mean change
>   per 100 ms · the camera-noise floor (static text) **4.302** · **the graph's core 6.267 (6.78 ×
>   the ground)** · **a spoke node 7.985 (8.63 ×)**. The core **brightens +41 % over 800 ms and fades
>   over 1.1 s — a ~2 s breath.** Travelling dots on the SOP paths: **UNVERIFIED**, needs his capture.
> - **Permanent honesty on the surface:** `0/21 systems live` and `localhost:4100 · sqlite · real
>   agents` in the rail foot of every page; a **`DEMO DATA`** badge on the funnel.
> - **How it earns, three ways, all on screen:** (1) **the reel is the funnel** — *"comment founder
>   down below"*, and his own Marketing/Growth department holds `ManyChat MCP` and an `Automate DM
>   funnel` SOP, so the call to action is served by his own machine; (2) **distribution measured on
>   the wall** — 60,802 followers over five platforms plus email, +0.31 %, **1,990 DMs**; (3) **the
>   product is the packaging** — 11 preloadable personas, each with **one revenue north star**
>   (`Net retainer MRR retained` · `Contribution margin after ad spend, per order, blended` ·
>   `Enrollment revenue × student completion rate`), a connector list of real SaaS accounts, and five
>   tracked metrics. **And every SOP card states its own business case in the `WHAT IT REPLACES` line.**

Nothing is built before the CEO approves the design package. Every part below extends a spec that
already owns its contract; none opens a new one. `<!-- OPEN: B22 -->`

| Part | What it requires | Cost / install | Waits on | <!-- OPEN: B22 -->
|---|---|---|---|
| **P30-1** | **The SOP card, with the ladder.** `public.workflows` has 0 rows and `agents.autonomy_level` is 0 on all 205. Give every job the nine fields above, and give autonomy **three written sentences instead of an integer**, with the live rung marked. This is what makes the holding handed-over-able, and it lands in the spec that already owns the workflow contract — not in a new file. | none | AUTHOR |
| **P30-2** | **`WHAT IT REPLACES` becomes a required field on every job.** One sentence naming the human hour removed. It is the CEO's own revenue argument, written where the work is. | none | AUTHOR |
| **P30-3** | **Each employee's skills become real and visible.** `agents.skills` is `[]` on all 205 while the file-first personas describe the work in prose. Populate from the persona files, then draw them on the employee. | none | AUTHOR |
| **P30-4** | **The company as one navigable radial graph** — one hue per department, humans and AI as the same node shape in different colours, tools on the outer ring, SOPs as the paths. `v_org_graph` already returns 221 rows and nothing draws it. | none | AUTHOR |
| **P30-5** | **The permanent census in the shell foot** — `n/21 systems live` plus where the machine is running — on every CEO page, with the `DEMO DATA` honesty badge wherever a surface shows sample numbers. This is the first law of V2 in its cheapest form. | none | AUTHOR |
| **P30-6** | **A knowledge-hygiene employee that audits its own brain and scores it**, on the pattern of his `Markdown Auditor` SOP — walk every file, flag broken links and orphans, **check the generated org documents still match the live agents, SOPs and tools**, write a per-folder health report. Our 13,919-row memory has no such auditor. | none | AUTHOR |

### What must NOT be copied, and why

**His `1 runnable skill file — yours to download` is a distribution move, not an internal feature.**
He is giving the skill away to collect the lead. Here, what leaves the building is an outward-facing
act and stops at the CEO.

**`FULLY AUTONOMOUS` is his ceiling; ours is bounded by constitution.** Money out, contracts, e-mail,
ad spend and identity steps stop at the CEO however high the ladder goes. **The ladder is worth
copying exactly; the top rung is not the same rung here**, and the card must say so.

**Eleven personas as sellable presets is his business, not ours.** We hold 408 persona rows for one
holding. The transferable part is the **north-star-plus-pillars grammar**, applied to our own
departments.

## 6. Verdict

**This is the first source on the queue that shows how a company writes itself down.** Every other
rival has shown agents working; this one shows the *procedure* behind each agent, the *human hour* it
replaces, and the *rung* it currently stands on — in one card, repeated everywhere, in nine fields.

The measurement that decides is not a count. **He has 37 agents and a written, runnable, downloadable
procedure behind each of them; this holding has 205 employees, 21 departments, 0 workflow rows, 0
autonomy levels and an empty skill list on every single row.** He can hand his company to someone
else this afternoon. We cannot hand ours to anyone, including the machine.

And his surface never lies about its own state: `0/21 systems live` in the corner of every page,
`DEMO DATA` on the funnel that carries sample numbers. **The cheapest thing on this whole report is
also the most aligned with the CEO's first law** — a foot that says what is running, on every screen,
always. <!-- OPEN: B22 -->
