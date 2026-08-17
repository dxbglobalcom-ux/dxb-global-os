# 24 — a Higgsfield-powered console, filmed by `downey.ai` · the machine reports the night it worked alone

**WHY IT MATTERS TO THIS HOLDING.** This is the anti-babysitting contract filmed from the far side.
In source 17 the owner spoke and the machine answered; here **the owner was asleep**, and the
machine reports what it did without him — it restored a banned network, rotated a pattern, shipped
products, deleted its own weak work, opened markets, moved budget, and only then said *"you're
welcome sir."* That sentence is the whole reason this holding exists, and DXB has never produced
it: measured this session, **the last time any agent in this holding ran was 2026-07-28 09:03:49**,
twenty days ago, and `revenue_ledger` holds **0 rows**.

Three things land on us at once.

**A screen that is never still.** The console carries a revenue counter that actually moves —
`$1,357,852` at 00:21, `$1,363,305` at 00:30, `$1,366,337` at 00:35, `$1,372,355` at 00:45, a
steady **≈ $604/second across three independent intervals** — beside a clock advancing in real time
(`20:52:40` → `20:53:13` over 24 seconds of film), a hardware-load gauge, three core vitals, and an
**`AGENT ACTION FEED · LIVE`** where seven named agents each carry a verb. Measured against the
film's own control surface: over the **25 frame-pairs where the camera is genuinely still, the
console changes 11.5× more than the brick wall beside it** (17.03 against 1.48 mean luminance
difference). The motion is the screen's, not the camera's.

**A surface that follows the narration.** When the voice says *"revenue is up 13%"* the lower screen
has become a chart panel headed **▲ +13%**; at *"campaigns in 29 countries"* that screen is a **world
map** with lit markets and an arc travelling between them; by the message count it is an **inbox**.
Nobody clicks. Our own core already demands this — *"what is being talked about is what stands on
the screen, put there by the system and not by a click"* — and we have not built it.

**What we have instead.** 205 agents exist; **199 have run at least once and none has run since
2026-07-28**; 378 runs in the entire history, **250 succeeded and 128 failed**; **0** runs in the
last 24 hours; `cost_eur` totals **0** because nothing was ever metered. The outbox still holds
**51 rows, all failed**. There is no media table, no market table, and no revenue row to count.

| Its mechanism, measured here | Ours, measured 2026-08-17 |
|---|---|
| A revenue counter moving at ≈ **$604/s**, with sparkline and a `+$…/s` rate | `revenue_ledger` — **0 rows**; realised revenue **0** |
| `AGENT ACTION FEED · LIVE` — seven named agents, the acting one boxed | 205 agents, **0 runs in 24 h**, last run **2026-07-28 09:03:49** |
| A console clock advancing in real time beside `PROCESSING` / `SPEAKING` | No live clock on any DXB surface today |
| `HARDWARE LOAD 75%` · `CORE VITALS` inference 88 / memory 43 / bandwidth 39 | The workstation's own vitals (RTX 5060 Ti · 24 threads · 30 GB) are measurable and shown nowhere |
| Status bar: `SYSTEM JARVIS ONLINE · 4 MONITORS LINKED · 100 AGENTS STANDING BY · AWAITING OPERATOR` | `dxb-jarvis` **`inactive` + `disabled`**, 0 processes; no status line anywhere |
| The screen changes to match the sentence being spoken | `intents`: **51 of 57 still at `received`** — nothing routes, so nothing can follow the talk |

---

## 1. Source identity

| Field | Value |
|---|---|
| Address | `https://www.instagram.com/reel/Da1NGf0sfs3/?igsh=NXVnazFmZ2V5cm1j` |
| **Uploader** | **Dauren Altynbek — account `downey.ai`**, posted **2026-07-15** |
| **Engagement** | **9,045 likes · 5,048 comments** |
| **Caption (the account's own words)** | *"Comment "baddie," and I'll send you the full guide on how to create a setup like this"* |
| File | `.planning/research/rival-intel/media/24-Da1NGf0sfs3.mp4` — 20,639,124 bytes |
| **sha256 of the file actually studied** | `b7ccb271eba3573a56b218e054593da58c19481b5289704778bfe67ce846c406` |
| Repository state when written | commit `578785dc` |
| Resolution | **1080 × 1920** (vertical) — above the 720p floor |
| Codec | VP9 video, **24 fps**, 2,130,876 bit/s · AAC audio, 73,139 bit/s — **audio present** |
| Duration | **74.84 s** |
| Obtained | `scripts/rival-intel/fetch.sh` (yt-dlp), 2026-08-01T23:47:15Z. Metadata re-read live 2026-08-17 with `yt-dlp --simulate --print` |
| Transcript | `transcripts/24.json` — English, 15 segments, 1,003 characters |
| Frames | `frames/24/` — 75 at 1 fps (`t001…t075`) + 5 scene cuts, **native 1080 × 1920, never downscaled** |
| Console shown | Branded **`HIGGSFIELD AI — AUTONOMOUS INTELLIGENCE CORE`**, served from **`localhost:8080/index.html`** in a Chrome tab titled **`JARVIS-Higgsfield.html`** **(V)** |

**WHOSE SYSTEM IS THIS — the distinction that decides how every line below is read.** The console
carries Higgsfield's wordmark, but **this is not Higgsfield's official channel and the console is
not a Higgsfield product page.** The uploader is `downey.ai`, and searches for a connection between
Dauren Altynbek and Higgsfield's founders (Alex Mashrabov, Yerzat Dulat, Mahi de Silva) returned
**none** — so the relationship is **UNVERIFIED**: he may be a customer, an affiliate, or a partner,
and the file cannot tell us which. What IS verifiable is that the console runs from `localhost` as
a single `index.html`, and that its status bar names a **real Higgsfield product** — see §3.6.

**Relation to source 17.** Source 17 on this queue is also Higgsfield-branded, filmed as a spoken
exchange in one take. This one films an unattended night reported back. No conclusion is carried
across; every statement here was measured from this file or from the live sources cited in §3.6.

**How the temporal analysis was performed — stated plainly, because the method is the evidence.**
The 75 one-per-second frames were read in sequence at native resolution against the timestamped
transcript. Details too small to read were **enlarged from the frame with `crop` + lanczos, never
by downscaling** (ledger law 5); where the pixels ran out the reading says **UNREADABLE** rather
than guessing. Motion was measured numerically and the tool is committed so any auditor can re-run
it: `scripts/rival-intel/motion.py 24 --screen 70,620,590,920 --control 0,200,200,500`. **This is a
frame-sequence-plus-audio-transcript reading of a 24 fps file — it is not a claim to have watched
the moving picture at full frame rate with its sound.**

---

## 2. Watched record

`V` = visible in the frame · `T` = transcript · `W` = web-verified live source · `U` = unverified.

| Time | Voice (T) | Screen (V) |
|---|---|---|
| 00:00.14 | *"Okay, so sorry for interruption. I got you some food. I think you can put there"* | Console full-frame: `HIGGSFIELD AI · AUTONOMOUS INTELLIGENCE CORE`. Green binary rain fills the canvas, a waveform beneath it. Left column carries a figure in a green box (**UNREADABLE at this size**); the bottom line reads `AGENTS STANDING BY · AWAITING OPERATOR`. Overlay: *"POV: Content farm printing you the money while you sleep with a baddie"*. Sub-caption **"Hey Higgsfield"** |
| 00:05 | *(no speech)* | Camera turns into the room: a **wall rack of ~30–40 phones**, each showing a different profile. The desk monitor shows a sleeping-face emoji — the machine's idle state has a face |
| 00:08.36 | *"Okay, sir while you were asleep. I scaled the entire machine"* | Wide shot: hardware load `75%`; two people watch; the phone rack is lit |
| 00:12.74 | *"Instagram tried to slow down our content farm several dozen accounts were banned"* | Four screens now legible. **Main:** binary sphere, right-hand `AGENT ACTION FEED`, status bar `SYSTEM JARVIS ONLINE · 4 MONITORS LINKED · HIGGSFIELD SUPERCOMPUTER READY · NEURAL CORE NOMINAL · 100 AGENTS STANDING…`. **Lower-centre:** grid of ~50 red-framed content cards. **Lower-left:** two-column card list. **Lower-right:** `AI COMMAND CENTER`, a green node-and-edge graph |
| 00:17.38 | *"So I restored the network"* | Header reads `PROCESSING · SPEAKING · 20:52:40` — the console names its own state while it talks |
| 00:19.30 | *"Rotated the pattern and brought everything back before revenue even noticed now the good news revenue is up 13%"* | — |
| 00:21 | *(same sentence continuing)* | Left column fully legible: **`HARDWARE LOAD 75%`** over a GPU-cluster/cores/nodes line · **`$1,357,852`** under a header ending `— PER DEVICE` (first word **UNREADABLE**), an area chart rising to the right edge, a `+$…/s` rate, footer `…PHONES · MICROPAYMENTS / SEC` · **`CORE VITALS`** — INFERENCE 88 %, MEMORY 43 %, BANDWIDTH 39 %. Clock **`20:52:49`**. `AGENT ACTION FEED · LIVE`: `ORACLE market window open` · `[ECHO] voice line aligned` · `VECTOR virality predicted · 9x` · `[ATLAS] deploy → app store` · `PRIME render complex · 3D assets` · `[ORACLE] niche ranked` · `SENTINEL moderation pass clean` · `ECHO support queue` · `[VERTEX] parsing creative frames` · `[PRIME] routing to 3 …` · `NEXUS scanning trend signals` — **the boxed name is the agent currently acting** |
| 00:26.70 | *"84 products shipped overnight"* | — |
| 00:28.90 | *"91 creatives were generated tested ranked and pushed live"* | — |
| 00:30 | *(same sentence)* | **The lower-centre screen has changed.** The content grid is gone; a metrics panel headed **▲ +13%** now fills it, over a full-width area chart, with four smaller cards right, two below, three figure boxes along the bottom. Main console: load **74 %**, revenue **`$1,363,305`** — **$5,453 higher than nine seconds earlier** |
| 00:33.98 | *"67 weak ads were deleted before they embarrassed us the team performed flawlessly — all of them are me"* | — |
| 00:35 | *(same sentence)* | Revenue **`$1,366,337`** (final digits soft; `$1,366,357` cannot be excluded) — **+$3,032 in five seconds** |
| 00:39.70 | *"I opened 47 markets launched campaigns in 29 countries"* | — |
| 00:44.34 | *"Rerouted the funnel 12 times and moved budget into the ads printing money"* | — |
| 00:45 | *"…countries rewrote…"* | **The lower-centre screen has changed again — a world map**: continents as polygons, lit market nodes, a **white arc travelling between two of them**, a ten-row list down the right (**UNREADABLE**). Lower-left is now headed `CONTENT FARM` with its own counters. Main console: revenue **`$1,372,355`**, clock **`20:53:13`** — 24 seconds of film, 24 seconds on the clock |
| 00:48.82 | *"Your best video is now selling across half the planet"* | — |
| 00:51.78 | *"I also detected a trend around AI assistance and bedroom CEOs"* | — |
| 00:56.10 | *"So I launched before the trend had a name by the time you woke up"* | — |
| 00:59.86 | *"We had 91 creatives hundreds of customers thousands of clicks and"* | — |
| 01:02 | *(same sentence)* | Camera close on the desk. **Lower-centre is now an inbox**: a large green **`368`** beside `UNREAD MESSAGES` and a red sub-line, over a **five-column message list** with avatars. Right screen headed `CONTENT FARM`. The agent feed still scrolls: `ECHO · VERTEX · ATLAS · PRIME · ORACLE · [NEXUS] · [PRIME] · SENTINEL` |
| 01:06.06 | *"287 unread messages. You're welcome sir. Any questions? No questions. Thank you"* | **The spoken figure and the screen do not match.** The console read **368** four seconds earlier (digits legible but soft; `366` cannot be excluded). By 01:08 the camera has turned to the phone rack and the inbox is out of frame, so no later reading exists. **Recorded as a mismatch, not explained away** |

### 2.1 What the numbers did while the film ran

| Reading | 00:15 | 00:21 | 00:30 | 00:35 | 00:45 |
|---|---|---|---|---|---|
| Revenue counter | UNREADABLE | `$1,357,852` | `$1,363,305` | `$1,366,337` | `$1,372,355` |
| Interval rate | — | — | **+$606/s** (9 s) | **+$606/s** (5 s) | **+$602/s** (10 s) |
| Console clock | `20:52:40` | `20:52:49` | — | — | `20:53:13` |
| Hardware load | UNREADABLE | 75 % | 74 % | — | 75 % |

The rate holds to within 0.7 % across **three independent intervals**, and the clock advances
exactly with the film. Whether real money sits behind the counter is not decidable from a reel —
see §6.

### 2.2 The motion measurement, and why the raw number was thrown away

Mean absolute luminance difference between consecutive one-second frames, over two regions: the
main console's interior, and a **patch of brick wall carrying no screen**, which registers camera
movement only.

| | Frame-pairs | Console | Wall (control) | Ratio |
|---|---|---|---|---|
| All 74 pairs | 74 | 52.18 | 37.86 | 1.38× |
| **Camera genuinely still** (wall < 3.0) | **25** | **17.03** | **1.48** | **11.5×** |

The unfiltered figure is worthless on a handheld film — two thirds of the pairs contain a pan, and
the control moves almost as much as the screen. On the 25 pairs where the wall barely moves, **the
console moves 11.5× more than the room**. Console range on those pairs: 0.06 (00:74, the final held
frame — the screen rests, and rest is a real state) to 43.0. Reproduce with the committed tool:
`scripts/rival-intel/motion.py 24 --screen 70,620,590,920 --control 0,200,200,500`.

---

## 3. Capabilities — the mechanism behind it

| # | What is visible | Evidence | What it implies |
|---|---|---|---|
| 1 | **Named agents with verbs, in a live feed** — SENTINEL, ECHO, ATLAS, PRIME, NEXUS, ORACLE, VERTEX, each line an action (`moderation pass clean`, `routing to 3 …`, `virality predicted · 9x`, `deploy → app store`, `render complex · 3D assets`, `niche ranked`, `scanning trend signals`) | V | A dispatcher emitting one typed event per agent action, rendered append-only. The boxed name marks the acting agent — **state shown by emphasis, not by a status label** |
| 2 | **A counter with a velocity**, sparkline and `+$…/s` | V | A value that carries a rate, not a total refreshed on reload |
| 3 | **A console clock in real time**, beside `PROCESSING` / `SPEAKING` | V | The machine says what it is doing while it does it — two words and a clock |
| 4 | **A status bar naming its own body**: `4 MONITORS LINKED`, `HIGGSFIELD SUPERCOMPUTER READY`, `NEURAL CORE NOMINAL`, `100 AGENTS STANDING BY`, `AWAITING OPERATOR` | V | The system knows its own hardware and its own idleness and says so unasked |
| 5 | **The lower screen re-purposes itself to match the sentence**: content grid → `▲ +13%` charts → world map → inbox | V + T | Whatever drives the narration also drives the surface. Whether that is automatic or a human cutting scenes **cannot be separated by a reel — UNVERIFIED** |
| 6 | **Machine vitals as first-class furniture**: `HARDWARE LOAD 75%`, INFERENCE / MEMORY / BANDWIDTH | V | Capacity and cost belong on the face, not in a settings page |
| 7 | **A physical rack of ~30–40 phones**, each on a different profile | V | The distribution surface is real hardware, not a metaphor |
| 8 | Served from **`localhost:8080`, one `index.html` in a browser tab** | V | The entire console is a local web page — no platform, no tier, no account required to render it |

### 3.6 The real system behind the wordmark — measured from the live product, not the film

The status bar's `HIGGSFIELD SUPERCOMPUTER READY` names something real. **Higgsfield ships a product
called Supercomputer**, and its own pages describe it as **(W)**:

- *"a full AI creative team in one chat"* · *"Build, generate, and market anything with skills,
  connectors, and automation"*
- *"Describe what you want. Higgsfield Supercomputer plans it, picks the models, and renders it"* ·
  *"No prompts, no presets, no tool-hopping"*
- Named **skills**: explainer videos (claymation / 2D flat / 3D), faceless videos, editorial motion
  graphics, UGC product videos, website building, brand-kit creation, shorts maker

And a second product matters to us more than the console does — **`MCP & CLI`, whose own headline
is "Turn Claude into a creative engine" (W)**:

- an **MCP server at `https://mcp.higgsfield.ai/mcp`**, added to Claude through Connectors; for
  Claude Code or Codex *"it's better to use the CLI"*
- through it an agent generates *"images up to 4K, videos up to 15 seconds"*, trains *"consistent
  characters using Soul training"*, reaches *"30+ models (Soul, Flux, Seedream, Kling, Veo…)"* and
  browses its own generation history as input
- **no API keys** — authentication is the Higgsfield account; **credit-based**, drawn from the
  existing plan

**What this settles, and what it does not.** It settles that the machinery implied by the film is
real and purchasable, and that its natural client is an agent like ours. It does **not** establish
that Higgsfield sells the JARVIS console in the film, or that Supercomputer runs unattended on a
schedule: the product pages describe a **chat-driven** creative team, and **carry no documented
autonomous or scheduled operation (UNVERIFIED)**. The overnight autonomy is the film's claim, not
the product page's.

### Aliveness — how this system is built to live, and what DXB takes

The FIRST LAW OF V2 requires the company to be visibly working and to keep working when nobody
watches. This source shows five separable mechanisms for that, and **each is cheap**:

1. **An event feed with names.** Not "3 tasks running" but *who* is doing *what*, one line each,
   newest first, the acting one emphasised. It converts invisible work into visible work using an
   event stream that already exists.
2. **Velocity, not totals.** A number with a rate beside it reads as alive; the same number alone
   reads as a report. Where the rate is genuinely zero, **zero is the honest answer** — the core
   forbids a value that loops when nothing behind it moved, and that is the line to hold while copying this.
3. **The machine's own vitals on the face.** Load, memory, bandwidth. We now have a workstation
   worth showing: 24 threads, 30 GB, an RTX 5060 Ti with 16,311 MB.
4. **A self-description in one line.** `AWAITING OPERATOR` is exactly the "the machine says when it
   last knew, and when it wakes next" clause, in two words.
5. **The surface follows the talk.** The strongest idea in the file, and the closest to what the CEO
   has already ordered.

The rest quality is worth naming with it: at 00:74 the console's own motion falls to **0.06** — the
screen comes to rest. A surface that never rests is a screensaver; this one stops.

#### The movement, timed — what moves, which way, how long, how often

The 1 fps frames cannot answer this: at one frame per second a travelling pulse aliases and its
direction is unreadable. So a dense pass was cut from the video at **10 fps** (one frame every
**100 ms**) over **30.0–36.0 s**, the window where the camera is most nearly still — the wall
control averages **0.49** across those 59 steps, against 1.48 over the whole film.

| What moves | Mean change per **100 ms** | Against the camera control (0.49) | Direction | Rhythm |
|---|---|---|---|---|
| **The binary sphere** (centre canvas) | **13.97** | **28.5×** | in place — it does not travel across the canvas | **Continuous: it does not stop once in the 5.9 s window** — every one of the 59 steps registers change |
| **`AGENT ACTION FEED`** (right column) | **1.77** | 3.6× | **none — vertical offset is 0 px in all 59 steps** | **Refresh bursts at 30.7 s · 32.7 s · 34.7 s — a 2.0 s period**, each burst lasting 0.2–0.5 s |
| **Revenue counter** | — | — | upward, monotonic | **≈ $604/s**, held to within 0.7 % across three intervals (§2.1) |

Two findings there are worth more than the ratios. First, **the feed does not scroll** — the list
stays put and its rows change in place, measured by best-shift correlation over ±12 px, which found
**0 px of travel in every step**. Second, **its cadence is a clean 2.0 s**, and the change arrives
as a short burst rather than a continuous crawl.

**UNVERIFIED, and what would be needed:** the sphere's own pulse period. Sampling a 24 fps source at
10 fps aliases any rhythm faster than 5 Hz, and the per-step figures do alternate high–low in a way
that could be a real pulse or could be the sampling. **Settling it would need a 24 fps pass over the
same window**, which this reading did not cut.

**What DXB takes from it, named as projects:** the feed's *in-place refresh on a fixed 2.0 s
cadence* is P24-2's specification — our own action feed refreshes on a stated period and does not
crawl; the sphere's *continuous but non-travelling* motion is the honest model for an idle-but-alive
indicator in P24-4; and the counter's *rate held to 0.7 %* is the contract for P24-5, where our own
zero must print as zero rather than drift.

---

## 4. What DXB has today — measured 2026-08-17

From the company database on the workstation (`postgres`, 94 public tables, 119 MB) and from
`systemctl` on this machine, this session. Every figure re-runnable by the auditor.

| Measure | DXB, now | Command / source |
|---|---|---|
| Realised revenue | **0** — `revenue_ledger` holds **0 rows** | `select count(*), sum(amount_eur) from revenue_ledger` |
| Revenue engines defined · opportunities | 6 · 5 | `revenue_engines`, `opportunities` |
| Agents | **205** | `select count(*) from agents` |
| Agents that have ever run | **199 of 205** | `select count(distinct employee_id) from agent_runs` |
| Agent runs, all time | **378** — 250 succeeded, **128 failed** | `agent_runs` grouped by status |
| Agent runs, last 24 h | **0** | `where started_at > now() - interval '24 hours'` |
| Last agent run | **2026-07-28 09:03:49** | `max(started_at) from agent_runs` |
| Last task event | **2026-07-28 09:04:56** | `max(created_at) from task_events` |
| Metered cost, all 378 runs | **0 EUR** | `sum(cost_eur) from agent_runs` |
| Outward acts | `outbox` **51 rows, 51 failed, 0 pending** | `outbox` grouped by status |
| Captured intents | **57**, of which **51 still at `received`** | `intents` |
| Chat | **105 messages** | `chat_messages` |
| Media / content store | **no such table** among the 94 | no `media*`, `content*`, `asset*`, `creative*` |
| Markets / countries | **no such table** | no `market*`, `country*`, `region*` |
| Resident services | `dxb-jarvis`, `dxb-scheduler` both **`inactive` + `disabled`**, 0 processes | `systemctl --user is-active/is-enabled` |
| Work queue | **7 jobs created 2026-08-17 16:41, never claimed** | `pgboss.job where state in ('created','active','retry')` |
| Machine available | Ryzen 9 7900X · 24 threads · 30 GB · RTX 5060 Ti 16,311 MB · CUDA 12.8 proven | `lscpu`, `free`, `nvidia-smi`, `torch.cuda.is_available()` |

**Honest reading.** Six of the eight mechanisms in §3 have no data source in DXB today, and the one
that does — the agent feed, fed by `agent_runs` and `task_events` — stopped producing twenty days
ago. **The gap is not a rendering gap.** A feed with nothing to show is worse than no feed, and
drawing the panel before the events resume would put motion with nothing behind it on the CEO's screen, which
his own first law forbids.

---

## 5. The build project

Six projects. The order is deliberate: **nothing here draws a surface before the data behind it
moves.**

| # | Project | Needs | Depends on |
|---|---|---|---|
| **P24-1** | **Make the event stream produce again.** 199 agents ran once and stopped; `task_events` has been silent since 2026-07-28. Find the cause, restart the flow, prove it with a row whose `created_at` is today | Nothing to install, no money, no account | The resident services, which the CEO stopped deliberately — **waits on his word** |
| **P24-2** | **Agent action feed with names.** One line per action — agent, verb, object, age — newest first, the acting agent emphasised. Reads `agent_runs` + `task_events` only | Nothing to install, no money, no account | P24-1 (a feed with no events is forbidden) |
| **P24-3** | **Vitals of our own machine on the face.** Hardware load, memory, GPU — this workstation's real figures, measured. **The one panel that can be honest today**, because those numbers exist whether the company works or not | Nothing to install, no money, no account | — |
| **P24-4** | **The one-line self-description.** What the system last knew, what it is doing, when it wakes next — the `AWAITING OPERATOR` clause, ours; including the honest present state, *services stopped by the CEO's order* | Nothing to install | — |
| **P24-5** | **Value with a rate.** Every headline figure carries its velocity, and **zero prints as zero** — no motion without a real change behind it, no invented trend. Applies first to revenue, which is genuinely 0 | Nothing to install | P24-1 |
| **P24-6** | **The surface follows the talk.** What the CEO is being told about is what stands on the screen, placed by the system within seconds, not by a click | Nothing to install | P24-1 + the intent router (`51 of 57 at received`) |

**Three of the six (P24-2, P24-3, P24-4) need no install, no money and no account.** P24-3 can be
built and shown to him while the company is still switched off.

### The buy decision, under the CEO's order of 2026-08-17: open source first, subscriptions when we earn

His words this session: *"amacımız ilk etapta açık kaynaklarla herşeyi yapmak sonra para
kazandıkça en mükemmel abonelikleri yaparız… higgsfield gibi."* So Higgsfield's `MCP & CLI` (§3.6)
— which would hand our own Claude 4K image and 15-second video generation through one connector
with no API key — is **recorded as a destination, not a purchase.** It is a paid credit plan; it
waits until the holding earns.

**What we are paying for today, measured this session:** Claude Code · ChatGPT · one Hetzner VPS
(`dxb-vps-1`, cx33 — 4 cores, 8 GB, 80 GB, Ubuntu 24.04, backups on, ports 22/80/443 open,
**€10.10 per month**, running 39 days). Plus the workstation, which is bought outright and costs
nothing monthly: Ryzen 9 7900X · 30 GB · **RTX 5060 Ti with 16,311 MB and CUDA 12.8 proven**.

**The stack already obeys the order.** `.planning/research/STACK.md` pins open, self-hostable
pieces for exactly this reason — self-hosted Supabase, **LiteLLM** as the model router,
**`ghcr.io/speaches-ai/speaches`** for hearing and speaking, `open-notebook`, `hermes-agent`,
Caddy. Two measurements against that on this machine today: LiteLLM **is running on port 4000 and
answers, but has 0 models defined** — a router routing nothing; and **speaches is absent
altogether**, which is why 4 of the 9 failing tests fail (`ECONNREFUSED 127.0.0.1:8969`) and why
B12's hearing gap is still open.

**What the open-source route would have to cover to replace what §3.6 sells** — recorded as the
question to answer before any money is spent, not as an answer: image and video generation on our
own GPU with open weights, against Higgsfield's 30+ hosted models. **UNVERIFIED — no image or video
generation tool is installed on this machine** (measured: `~/.cache/huggingface` holds 3.0 GB and
exactly one model, `ResembleAI/chatterbox`, which is speech; no ComfyUI, no diffusion runtime), so
no claim is made here about what 16 GB of VRAM will or will not render. That measurement is a
project of its own and belongs on the board, not in this report.

### What must NOT be copied, and why

| Not copied | Reason |
|---|---|
| **The content farm itself** — dozens of accounts, banned and restored, *"rotated the pattern"* | Deliberate evasion of a platform's own enforcement. Outside what this holding does; the CEO's boundaries are constitutional |
| **A counter that rises because rising looks alive** | If our revenue is 0, the surface says 0. His law: a value moves until it is true and then stops |
| **Numbers the surface cannot support** | This film says 287 while its own screen reads 368. A figure that contradicts itself on camera is the failure we are one careless panel away from |
| The room's register — neon, the *"baddie"* framing | The standard here is the Ferrari, not the bedroom |

---

## 6. Verdict

**What this source PRODUCES — measured, in two layers, because two different parties earn here.**

**Layer one, the brand on the console — Higgsfield AI (W).** Founded October 2023 (Alex Mashrabov,
Yerzat Dulat, Mahi de Silva); public launch 31 March 2025; **more than 15M users**; a **$130M
Series A** with Accel, AI Capital Partners and Menlo Ventures announced 15 January 2026 at a
**$1.3B valuation**; **a $200M run-rate reported 22 January 2026, doubled from $100M two months
earlier.** It sells a **credit-based subscription** bundling 15+ video and image models (Sora 2,
Veo 3.1, Kling 3.0, Soul, Flux, Seedream) with 70+ cinematic presets — 2026 tiers **Starter $15 ·
Plus ~$34–39 · Ultra $84 · Business $49/seat** — plus Supercomputer and the MCP/CLI of §3.6. This
is a company that earns, at scale, today.

**Layer two, the film itself — `downey.ai` (V + T).** The reel is the top of a funnel and says so
in its own caption: *"Comment "baddie," and I'll send you the full guide on how to create a setup
like this."* It converted **5,048 comments against 9,045 likes** — a comment-to-like ratio of 56 %,
which is what a one-word call to action buys. Each comment is a direct-message thread. **What is
sold at the end of that thread is UNVERIFIED** — `downey.ai` could not be read this session (the
site presented a self-signed certificate and the fetch was refused), and no course, community or
coaching offer could be confirmed. The mechanism up to the DM is fully visible; the price at the
end of it is not.

**What the file itself proves, and what it only claims.** Proven from the pixels: the console is
genuinely in motion — **11.5× the room across 25 camera-still frame-pairs** — its clock advances
with the film, and its counter rises at a rate consistent to within 0.7 % across three intervals.
Claimed by the voice and recorded here as claims: 84 products shipped, 91 creatives generated and
tested, 67 weak ads deleted, 47 markets opened, campaigns in 29 countries, hundreds of customers
overnight. **A reel is an advertisement, not the system**; what it does not show is a limit of the
film. And one internal contradiction is on the record: the spoken 287 against the displayed 368.

**Ours, on the only measure that decides.** DXB has never run end to end. Realised revenue is **0**;
the last agent ran **twenty days ago**; the outbox has never completed a single outward act in 51
attempts. On does-it-work and does-it-earn, we are behind this source and behind every source on
this queue.

**What this one changes for us.** Source 17 gave the spoken exchange; source 24 gives **the
unattended night and the report that follows it**, plus the cheapest known implementation of
aliveness: a named event feed, a rate beside every number, the machine's own vitals, one line
saying what it is doing and when it wakes — and a screen that comes to rest when the work does.
None of it needs a platform, a budget or an account. All of it needs the one thing we do not have:
**events that keep arriving while nobody is watching.** That is P24-1, and it is the entire
difference between a console and a poster.
