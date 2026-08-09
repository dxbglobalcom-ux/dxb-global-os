# 03 — Chloe Shy (`chloeshy.ai`) — the teardown of the JARVIS the CEO asked for

**Written 2026-08-04. The CEO watched this reel himself the same evening and narrowed the reading
in his own words: *"12. saniyeden itibaren raporla izledim ben. öncesi gereksiz."* This report
therefore begins at 00:12 and runs to the last frame. His live order outranks the ledger's
start-to-end rule (`.claude/CLAUDE.md` §1, LAW A) and the exclusion is stated, not hidden — see
"What was not reported, on his order" below.**

Every statement carries an evidence label: **V** visible · **T** transcript/subtitle with a
timestamp · **C** CEO-confirmed · **R** repository/backend/API verified this session ·
**U** unverified.

**The finding that matters before anything else: this reel is a component-by-component teardown of
source 01.** The clip playing in her top-right panel is `01-DY4o8dluXdK.mp4` frame for frame — the
same room, the same "POV: Jarvis is building you a $30k MRR app", the same "Hey Jarvis, wake up!",
the same three AZARIS wallpapers and the same arc-reactor screen (V, compared against
`frames/01/t002.jpg` this session). Source 01 is the one the CEO wrote about:
*"Bizim DxB Global Holdigimiz için tam da istediğimiz Jarvis sistemi bu short videoda mevcut."*
**She names the parts of the exact system he asked for.** Section 3 lists them; section 5 turns
them into work that lands on rows the board already owns.

---

## 1. Source identity

| | |
|---|---|
| **Address** | https://www.instagram.com/reel/DbBPiy4vcz4/ |
| **Uploader** | `chloeshy.ai` — the account handle as recorded by the CEO in his source list |
| **Kind** | Instagram reel, vertical. A reaction/teardown format: her own camera plus an embedded copy of another creator's reel |
| **File** | `media/03-DbBPiy4vcz4.mp4` |
| **sha256** | `e5a1d0d66c218e143b52d1889b1cabfb1069c9655fb9fb5c1f1bae4b0b841bc1` |
| **Duration** | 74.049875 s |
| **Resolution / codec / rate** | **1080 × 1920**, VP9, 30 fps — above the CEO's 720p floor |
| **Audio** | present, AAC, 44.1 kHz stereo. Kept |
| **How obtained** | `scripts/rival-intel/fetch.sh 03`, 2026-07-28T11:21:15Z. Not re-downloaded for this reading |
| **Transcript** | `transcripts/03.json` — faster-whisper, English, 20 segments. **Unreliable; used only as a lead. Four of its errors are corrected below from the burned-in subtitles.** |
| **Subtitles** | Burned in, **bilingual English + Chinese**, present on almost every second. Treated as the authority over the audio |
| **The CEO's note on this source** | listed without a note in the original directive; **watched by him 2026-08-04 and narrowed to 00:12→end** |

### How the temporal analysis was performed — stated exactly

The file was **played, with sound, in the media player on the CEO's own machine** (Celluloid,
window `03-DbBPiy4vcz4.mp4`, verified on screen) before the reading, and then **every one-second
frame from t013 (00:12) to t074 (01:13) was opened one at a time, in order, at native
1080 × 1920** — 62 frames, none skipped, none downscaled, no contact sheet. The machine transcript
sat beside them and the **burned-in bilingual subtitles were treated as the authority** (ledger
law 4).

Where a screen carried text worth reading exactly, the enlargement was **cut from the video**,
never cropped out of a frame (ledger law 5). Three cuts were made for this report and are on disk:

- `frames/03/cut-github-70.2.jpg` — the GitHub repository panel at 70.2 s
- `frames/03/cut-metaads-51.3.jpg` — the Meta Ads performance dashboard at 51.3 s
- `frames/03/cut-jarvis-acronym-72.6.jpg` — the JARVIS name card at 72.6 s

Frame `tNNN` is the frame at second `NNN−1`; timestamps in section 2 are frame times and may differ
from the true instant by up to one second.

### What was not reported, on his order

**00:00–00:11 is excluded.** Recorded so no later reader thinks it was missed: those eleven seconds
are her own opening — the embedded clip's "POV: Jarvis is building you a $30k MRR app" / "Hey
Jarvis, wake up!" title cards, and an aside of her own about dropping a reference image into Claude
Code to have a design built in five to ten minutes. It carries no part of the system teardown. The
CEO watched it and judged it *"gereksiz"*. Nothing from it is used anywhere below.

---

## 2. Second-by-second record of what was watched — 00:12 to 01:13

No summarising. Subtitle text is quoted as burned into the picture. Where a caption is held across
several seconds the span is written out and the picture change inside it is stated.

| Time | What is on the screen | What is said / written | Label |
|---|---|---|---|
| 00:12 | Three panels: **her**, bottom-left, at a MacBook with a DJI clip-on microphone in her hand, pale wooden shelving behind her. **Top-right: the embedded source-01 clip** — a man in a black jumper walking to a standing desk, a wall TV showing a blue arc-reactor console with a figure row `$30,088 · $16,470 · $13,330`, and three monitors below it carrying identical AZARIS cyberpunk wallpapers | Embedded caption: **"Good evening, sir"** | V·T |
| 00:13 | Full frame on her; the inset is gone | **"so for this voice"** / 這個聲音 | V·T |
| 00:14 | Same shot, she gestures at the laptop | **"his Jarvis runs on an"** / 他的Jarvis跑在 | V·T |
| 00:15 | Same shot | **"agentic harness"** / 代理框架上 | V·T |
| 00:16 | **An architecture diagram fills the top half.** Left column **OBSERVATION**: `LIVE DATA MONITORING`, `LOGS`, `TEXT`, all arrowed inward. Centre box **AGENT HARNESS** containing `Observation Layer → Context Layer`, `AGENT MODEL` in orange at the middle, `Memory Layer ↔ Actions Layer` below, and a drawn server/rack icon beneath them. Right column **CONTEXT INPUT**: `DOCUMENTS`, `PROMPTS`, `DATABASE`, `EXTERNAL RESOURCES`, arrowed in with dashed lines. Underneath the whole harness, a dark bar with a person icon: **`SUPERVISOR FEEDBACK & ESCALATION`**, wired back into the Actions Layer | **"it's great but"** / 很棒，但是 | V·T |
| 00:17 | Same diagram held | **"hosted voice model"** / 托管语音模型 | V·T |
| 00:18–00:19 | Same diagram held; she leans toward the laptop | **"so every reply cost credits"** / 所以每個回复都需要credits | V·T |
| 00:20 | Same diagram held; she turns to camera | **"for free (open sourced) model"** / 免费（開源）模型 | V·T |
| 00:21 | Diagram gone, full frame on her | **"that turns text into speech"** / 將文本轉換成語音 | V·T |
| 00:22 | **A pale purple card appears top-left with a violet audio waveform and the words `Kokoro TTS`** | **"this is what I'm using"** / 這就是我正在使用的 | V·T |
| 00:23 | The card is replaced by the source-01 inset again, same frame as 00:12 | Embedded caption: **"Good evening, sir"**; her own caption still reads "this is what I'm using" | V·T |
| 00:24 | Inset continues; the man stands at the desk, monitors still on wallpaper | Embedded caption: **"Pulling up our app stats now"** | V·T |
| 00:25 | Full frame on her, she looks into the lens | **"connect Claude to Chrome"** / 將Claude連接到Chrome | V·T |
| 00:26 | **A screenshot of the Claude extension install page fills the upper third.** Body text: *"Once connected, you can open the extension side panel in any tab and ask Claude to do things directly in your browser."* Below it a panel headed **Recommended apps and extensions · Browse all**, with one row: the Chrome logo, **`Claude for Chrome` — "Claude can browse, click, and fill forms right in your Chrome tabs."** and a black **Install** button | **"connect Claude to Chrome"** held | V |
| 00:27 | **A white card with the Playwright theatre-masks logo and the word `Playwright`, and beneath it the Model Context Protocol mark and the words `Model Context Protocol`** | **"or install a Playwright MCP"** / 或者安裝Playwright MCP | V·T |
| 00:28 | Card gone, full frame on her | **"view your browser"** / 查看您的瀏覽器 | V·T |
| 00:29 | Source-01 inset returns and **the monitors have changed**: the wallpapers are gone, the left monitor now shows a line chart on a dark dashboard, the right one a dark panel of text | Embedded caption: **"Over the last seven days, we had 2,459 new"** | V·T |
| 00:30–00:31 | Same inset; **the second monitor fills in with a bar chart and a row of L-shaped markers below it** — the screens populate progressively rather than cutting to a finished state | Same embedded caption held | V |
| 00:32–00:35 | Inset held; the man stands still, facing the screens | Embedded caption: **"downloads and generated $4,289 in"** | V·T |
| 00:36 | **The RevenueCat wordmark on a white card, top of frame; beneath it a full architecture diagram**: `App` (Purchase information is captured using mobile SDKs) → `POST /receipts` → `RevenueCat` (Subscription is recorded in RevenueCat backend) → `Subscription updated` → `Third-party tools` (Webhook server, Analytics tool, Marketing tool, …, Attribution tool). Below the centre: *"Subscription changes polled and pushed from App Stores"* ↕ `App Stores — Apple, Google, Amazon, Stripe` | **"RevenueCat to"** | V·T |
| 00:37 | Same two cards held; she points at the screen | **"track revenue"** / 跟踪收入 | V·T |
| 00:38 | Source-01 inset; **the man has turned, hand to his chin, reading the screens** | Embedded caption: **"On ads, you spent $475"** … | V·T |
| 00:39–00:41 | Inset held; he shifts left, arms crossing; the third monitor lights up with a pale spreadsheet-like grid | Embedded caption: **"On ads, you spent $475 at a 1.5 Return on ad"** | V·T |
| 00:42–00:43 | Inset held, he stands watching | Embedded caption: **"The street interview creative is still doing"** | V·T |
| 00:44–00:45 | Inset held | Embedded caption: **"well, while the slideshow continues to be the"** | V·T |
| 00:46 | Inset held; he faces the monitors squarely | Embedded caption: **"weakest performer"** | V·T |
| 00:47 | Full frame on her, no caption, she looks up at the lens | — | V |
| 00:48 | **A Meta connection card fills the upper third**: the blue Meta infinity mark, **`New Connection`**, *"Manage Meta Ads campaigns"*, and a bordered button **`Connect to Meta Ads`** | **"so ads is the meta ad MCP"** / 廣告是Meta MCP | V·T |
| 00:49 | Same Meta card held | **"your agent reads"** / 你的agent | V·T |
| 00:50 | **The Meta card is replaced by a real Meta Ads performance dashboard** headed `Performance: Meta Ads`, Source `(2) Instagram, Facebook`, date `Last 2 years including this year (2024 …)`. Left: **Spend `190,236.27`** (+9.7 % Jan 2025 vs Dec 2024) and **pRevenue `1,535,393.14`** (+17.3 %), each with a sparkline. Centre: `Clicks` and `Impressions` time series running 2024-01-01 → 2025-01-01. Right: four gauges — **ROAS `10.82`**, **CPC `0.35`**, **CPM `2.47`**, **CTR `0.71`**. Below: `Overview`, an `Ad Type Split` toggle set to **Yes**, and the column heads `CONVERSIONS` / `LINK CLICKS` | **"ad spend and"** / 廣告花費 | V·T |
| 00:51 | Same dashboard held | **"that's how Jarvis know"** / Jarvis是這樣 | V·T |
| 00:52 | Dashboard gone, full frame on her | **"the slideshow is"** / 知道slideshow | V·T |
| 00:53 | Same | **"underperforming"** / 表現欠佳 | V·T |
| 00:54 | Source-01 inset; **all three monitors are now populated** — a bright document/editor on the left, a dark code editor with coloured syntax in the middle, a spreadsheet grid on the right | Embedded caption: **"My recommended today"** | V·T |
| 00:55–00:57 | Inset held; he stands with arms folded, watching | Embedded caption: **"Review the back-end PR, keep leaning into the"** | V·T |
| 00:58–00:59 | Inset held | Embedded caption: **"street interview ad angle, and have Scout"** | V·T |
| 01:00–01:01 | Inset held | Embedded caption: **"research the next set of organic content angles"** | V·T |
| 01:02 | Inset held | Embedded caption: **"to test"** | V·T |
| 01:03 | Inset held; **the sequence ends on a question addressed to the human** | Embedded caption: **"What would you like me to handle first, sir?"** | V·T |
| 01:04 | Cut to a **closer shot of her** — the camera has moved in, the shelf behind is different, a pair of glasses lies on the desk. No caption | — | V |
| 01:05 | Same close shot | **"sound like a lot"** / 聽起来很多 | V·T |
| 01:06 | Same, she opens her hand toward the lens | **"here's the cheat code"** / 这是作弊代码 | V·T |
| 01:07 | Same | **"Stanford just open sourced"** / 斯坦福刚刚开源 | V·T |
| 01:08 | Same | **"the entire concept"** / 整個概念 | V·T |
| 01:09–01:10 | **A GitHub repository page fills the upper third** — `open-jarvis / OpenJarvis`, **Public**, tabs `Code · Issues 26 · Pull requests 41 · Discussions · Actions · Projects · Security and quality · Insights`, **Watch 119 · Fork 1.7k · Star 7.7k**, branch `main`, last commit `github-actions[bot] — chore: update clone traffi… 452bcc3 · yesterday`, folders `.github`, `assets`, `configs/openjarvis`, `deploy`. Right column **About: "Personal AI, On Personal Devices"**, link **`openjarvis.stanford.edu/`**, **`Apache-2.0 license`**, Code of conduct, Contributing, Activity | **"and put onto github"** / 放在github上 | V·T |
| 01:11 | Same GitHub panel held | **"one command in your terminal"** / 终端中的一个命令 | V·T |
| 01:12 | **The GitHub panel is replaced by unrelated stock terminal footage**: a shell at `dev@ubi:~/86262/test$` running `make clean` then `make`, compiling `PrimeMain.cpp`, `PrimeFunction.cpp`, `Output.cpp`, `Stack.cpp` with `g++ -Wall`, an editor tab reading `gruppenarbeit_ausnahmebehandlung/`. **It is a C++ build of a university exercise and has nothing to do with OpenJarvis — the install command is never actually shown** | **"and you're good to go"** / 你就可以開始了 | V·T |
| 01:13 | **A neon card**: a teal Iron-Man-style triangular reactor glyph over a HUD collage, the word **`JARVIS`**, and beneath it the expansion **"Joint Agentic and Robotic Virtual Interaction System"** | **"comment \"Jarvis\""** / 底下留言"Jarvis" | V·T |
| 01:13 (last frame, t074) | Full frame on her, hand out toward the lens | **"and I'll send you the link"** / 我把鏈結傳給你 | V·T |

### Four corrections to the machine transcript, from the burned-in subtitles

The machine transcript is wrong in four places that change meaning, and the subtitles are the
authority (ledger law 4):

| Machine transcript wrote | The picture says | Why it matters |
|---|---|---|
| *"his job around on a genetic harness"* | **"his Jarvis runs on an agentic harness"** | The whole thesis of the reel — the architecture name — was destroyed |
| *"generated **$289** in revenue"* | **"generated `$4,289` in"** (burned-in caption, 00:32–00:35) | An order of magnitude. The rejected sixteen reports were written from readings like this |
| *"use **cook or out**"* | **`Kokoro TTS`** (name card, 00:22) | A named, installable component became noise |
| *"install a **player** mcp"* · *"the **chico** Stanford"* | **`Playwright MCP`** (logo card, 00:27) · **"Stanford just open sourced"** | Two more named components |

---

## 3. Capabilities — what this reel demonstrably shows

### 3.0 The shape of it, in one line

**It is not a product demo. It is a parts list.** A creator watches another creator's JARVIS reel
and names, one by one, the seven pieces it is built from — architecture, voice, browser, revenue,
ads, a research sub-agent, and an open-source base — then offers the link in exchange for a
comment. Its value to us is not what she built; **it is that she resolves source 01 — the reel the
CEO pointed at — into components with names we can act on.**

#### 3.0.1 The agentic harness, drawn as layers (V, 00:15–00:20)

The diagram at 00:16 is the clearest statement of the architecture in any source read so far. Its
claim: an agent is not a model, it is a **harness** with four named layers — Observation, Context,
Memory, Actions — around a single **AGENT MODEL**, fed on one side by live data, logs and text, and
on the other by documents, prompts, a database and external resources, with tools drawn as a rack
underneath.

**The part worth reading twice is the bar at the bottom: `SUPERVISOR FEEDBACK & ESCALATION`, with a
human icon, wired back into the Actions Layer.** The escalation path is drawn as part of the
architecture, not bolted on. That is the same shape as our approval gate — and it is the first time
a rival source has drawn it as a first-class element rather than implied it (V).

#### 3.0.2 Voice: a hosted model costs credits per reply; she runs Kokoro instead (V·T, 00:16–00:22)

Her stated objection to source 01, verbatim from the subtitles: *"it's great but hosted voice model
so every reply cost credits"* — and her answer: *"for free (open sourced) model that turns text
into speech, this is what I'm using"*, over a **`Kokoro TTS`** card.

**This is the argument our own stack lock already made, arrived at independently** (see section 4).

#### 3.0.3 Two ways to give the agent the browser, named as alternatives (V·T, 00:25–00:28)

*"connect Claude to Chrome … or install a Playwright MCP … view your browser."* She shows both: the
real **Claude for Chrome** install card (*"Claude can browse, click, and fill forms right in your
Chrome tabs"*) and the **Playwright + Model Context Protocol** pairing. The two are presented as
interchangeable routes to the same capability — the agent seeing what the human sees.

#### 3.0.4 Revenue read through RevenueCat (V·T, 00:36–00:37)

*"RevenueCat to track revenue"*, over RevenueCat's own architecture diagram: the app posts receipts,
RevenueCat records the subscription and pushes "subscription updated" out to webhook, analytics,
marketing and attribution tools, while polling Apple, Google, Amazon and Stripe. **The capability
being named is a single place where money-in becomes queryable by an agent.**

#### 3.0.5 Ad spend and per-creative ROAS through a Meta Ads MCP (V·T, 00:48–00:53)

*"so ads is the meta ad MCP, your agent reads ad spend and … that's how Jarvis know the slideshow
is underperforming."* She shows the connection card (`New Connection · Manage Meta Ads campaigns ·
Connect to Meta Ads`) and then a performance dashboard carrying ROAS, CPC, CPM and CTR gauges.

**This is the mechanism behind the single most impressive line in source 01** — the assistant
saying, unprompted, which creative is winning and which is failing. It is not intelligence; it is a
connector plus a per-creative breakdown. That is buildable.

#### 3.0.6 A named research sub-agent, "Scout" (V·T, 00:58–01:02)

The embedded assistant's own recommendation ends: *"…and have **Scout** research the next set of
organic content angles to test."* A **second, named agent** is delegated to by the first, in the
assistant's own voice, and the human hears its name. Delegation is made audible.

#### 3.0.7 The sequence ends on the human's decision (V·T, 01:03)

*"What would you like me to handle first, sir?"* The briefing does not end with information. It ends
with a question that only the owner can answer. **This is external corroboration of a rule the CEO
already gave us** and which board row W-C42-3 already carries: the briefing ends in the decision
awaiting him.

#### 3.0.8 The open-source base: OpenJarvis — **already row 16 of our own ledger**

She closes with *"Stanford just open sourced the entire concept and put onto github, one command in
your terminal and you're good to go"* over `open-jarvis/OpenJarvis`.

**That is the same repository the CEO handed us himself** — ledger row 16, his words: *"JARVIS
REPOSU"*. Measured against the GitHub API this session (R, 2026-08-04):

| | In the reel (V, 01:09) | Measured today (R) |
|---|---|---|
| Stars | 7.7k | **8,309** |
| Forks | 1.7k | **1,895** |
| Watchers | 119 | **130** |
| Open issues | 26 (+41 PRs) | **96** |
| Licence | Apache-2.0 | **Apache-2.0** |
| Description | "Personal AI, On Personal Devices" | identical |
| Homepage | `openjarvis.stanford.edu/` | identical — **HTTP 200 this session** |
| Language | — | Python |
| Created / last push | — | 2026-02-15 / **2026-08-04 08:31 UTC (today)** |

The repository is real, actively pushed today, and permissively licensed. **The reel is older than
today by roughly 600 stars** — a useful reminder that every number quoted in these sources decays.

**Whether Stanford as an institution owns it is not established** by the API: the owner is a GitHub
organisation named `open-jarvis`, and the `stanford.edu` homepage is a strong but not conclusive
signal (**U**). What is verified is the code, the licence and the activity.

### 3.1 The claimed numbers, and whose they are

The figures spoken over the inset — **2,459 downloads, $4,289 revenue, $475 ad spend, 1.5 return on
ad spend, seven days** — are **source 01's claims, not hers**, replayed inside her reel. She does not
endorse or verify them. They are recorded here as claims (**U**) and are not evidence of anything.

The Meta dashboard at 00:50 (Spend 190,236.27 · pRevenue 1,535,393.14 · ROAS 10.82) is a **product
screen with 2024–2025 dates**; nothing on it identifies the account as hers or his (**U**). It
demonstrates the *shape* of what such a connector returns, and nothing more.

### 3.2 What this reel is, structurally — and the one honest gap

Two observations that belong together, neither of them a criticism of the system:

1. **The install is never shown.** At 01:11 she says *"one command in your terminal"*; at 01:12 the
   screen shows a **C++ university exercise being compiled** (`gruppenarbeit_ausnahmebehandlung`,
   `PrimeMain.cpp`), which is unrelated stock footage (V). The command itself is never on screen.
   That is a fact about the *reel*, not about OpenJarvis — the repository is real and was measured
   above.
2. **The close is a lead magnet:** *"comment 'Jarvis' and I'll send you the link"* (V·T, 01:13),
   under a card expanding JARVIS as **"Joint Agentic and Robotic Virtual Interaction System"**. The
   link she is offering is a public GitHub URL that costs nothing to publish; the comment is the
   price. **This is the same funnel shape measured on source 02 on 2026-08-04**, where the
   advertised free resource turned out to be a different artefact from the one the reel discussed.
   Recorded so the pattern is on file, not to diminish the content — the components she names are
   real, and four of them are verified above.

---

### Aliveness — how this living system is built (ledger law 8, rewritten 2026-08-09 on the CEO's order)

**These systems are live and running; that is the premise, not a question** (his ruling of
2026-08-09). This source is the one on the queue that **draws the mechanism instead of filming it** —
a teardown to camera — so it is read for the anatomy it puts on the board. From this report's own
record (watched 2026-08-04).

- **Runs on its own clock — the loop is drawn as a wire that re-enters itself.** The architecture
  card carries **`SUPERVISOR FEEDBACK & ESCALATION`** wired **back into the Actions layer**: work is
  checked and, where it fails, raised again — the machinery by which a system keeps going without a
  human standing over it, and the reason the escalation path has a named owner.
- **What makes the surface breathe — the one live window she opens.** At 00:29 the inset of source 01
  returns and **the monitors have changed**: wallpapers gone, a line chart on the left, a text panel
  on the right — the same wall in a different state, minutes apart.
- **The movement, TIMED — `UNVERIFIED`, and here is exactly why** (ledger law 8, second clause;
  checked 2026-08-09 against the file, at 29.3 s among others). This source **draws its mechanism on
  a board and films its author**: what is on screen for almost the whole 74 seconds is a person
  talking and an architecture diagram, so **there is no surface of her own running system in the
  frame to time.** The only moving screen in the file is the **inset re-used from source 01** — that
  wall is timed in report 01 (clock to the hundredth, radar sweep ≈ 3.3-4 s), and it belongs to
  source 01, not to her. **What would settle it:** a screen recording of her own system running.
  A clip is an advertisement, and what it does not put in frame is a limit of the film.
- **How it answers the human — the escalation edge is where the person sits.** In the anatomy she
  draws, the human is not the operator of every step; the human is the destination of the escalation.
- **What DXB takes — the supervisor loop as a wire, not as a policy sentence.** Every act that can
  fail has a check behind it and an edge that carries the failure to a named owner, drawn on the
  surface where it lives. It joins the design package alongside P10-3 (the gate drawn where it
  stands).

---

## 4. What DXB has today — measured this session, 2026-08-04

| Her component | What we have, measured today | Command / source |
|---|---|---|
| **Agentic harness with a supervisor-escalation bar** | **We have this, and ours is constitutional rather than drawn.** Money out, contracts, e-mail, ad spend and identity steps stop at the CEO by rule, not by diagram | `.claude/CLAUDE.md` §2 · [[APPROVAL_ENGINE_SPEC]] |
| **Kokoro TTS instead of a per-reply hosted voice** | **Kokoro is already ours** — Speaches, `Kokoro-82M`, 54 voices, self-hosted, €0 per reply, written into the spec as the TTS fallback and the STT backbone. **But the container is down:** `dxb_speaches_local` → `Exited (0) 2 days ago` | `docker ps -a --filter name=speaches` · [[VOICE_INTERACTION_SPEC]] |
| **The voice line itself** | **102 calls ever, 42 of them with an empty transcript (41.2 %), average round trip 41.0 s, last call 2026-07-28.** The daemon is **muted** — set by the CEO himself on 2026-07-28 08:58 UTC via the panel toggle | `select … from public.voice_calls` · `public.voice_daemon_state` |
| **Playwright MCP** | **Live — 24 pinned tools**, the largest single block in our corpus, and the same second option she names | `select server, count(*) from public.tool_pins` |
| **Claude for Chrome** | The extension route exists in this session's tool list but **was not connected today** (measured 2026-08-04: the extension did not answer, and browser work fell back to Playwright) | this session |
| **RevenueCat / revenue aggregator** | **Nothing. Zero connectors.** Our corpus is 69 tools across 5 servers: playwright 24 · dxb-mcp 21 · git 12 · scrapling 10 · context7 2 | `public.tool_pins` |
| **Meta Ads MCP / ROAS per creative** | **Nothing.** No ad platform is connected at all | `public.tool_pins` |
| **A named research sub-agent ("Scout")** | **We are ahead here on paper and behind in life:** 199 written employees with real identities, versus her one named Scout — and **revenue realised: zero**, nothing has been switched on end to end | `.planning/STATE.md` |
| **A briefing that ends in the owner's decision** | Specified and open — board row **W-C42-3** carries exactly this line. Not built | `00-BOARD-OPEN-WORK.md` |
| **OpenJarvis as a base** | Already **row 16** of this ledger, still `fetched`. Not read yet | `00-LEDGER.md` |
| **Resident services** | `dxb-jarvis` and `dxb-scheduler` both **active**, since 2026-08-04 18:19 CEST | `systemctl --user is-active` |

**The honest summary of the gap:** of her seven components we already own two outright (Kokoro,
Playwright), one by rule rather than by wiring (the escalation bar), and **we have nothing at all
for the two that carry money** — revenue aggregation and ad performance. Her advantage is not
architecture. It is that data from the outside world reaches her assistant, and none reaches ours.

---

## 5. The build project — what to install and do

**No new row and no new spec is opened by this report.** Every item below lands on a row the board
already owns; where a row's wording already covers it, that is stated instead of restating it.

| # | Work | Where it lands | Blocked on |
|---|---|---|---|
| **P1** | **The voice line, re-measured against her Kokoro claim** — **41.2 % empty transcripts and a 41.0 s round trip**, and the speech container `dxb_speaches_local` has been `Exited (0)` for two days. **This report only measures; it opens no task and touches nothing** | **W-C42-1**, which already owns this work and is worded *"kill the 44 % `empty_transcript` and the 29–35 s round trip"*. **Both figures are now re-measured and the row is corrected, not duplicated** | the row's existing owner |
| **P2** | **Meta Ads, read-only, with ROAS per creative** — the mechanism behind source 01's best moment. Connector reads spend, ROAS, CPC, CPM, CTR **split by creative**, and produces one briefing sentence quoting a number that came from it | **W-C42-4** — already worded as *"ads with ROAS per creative"*. Nothing new to open | **CEO** — which ad account may be connected (this is exactly the decision W-C42-4 already waits on) <!-- OPEN: B22 --> |
| **P3** | **A revenue aggregator for OUR shape of money.** RevenueCat is app-store subscription infrastructure (Apple, Google, Amazon, Stripe); we sell through WooCommerce. **Copying it literally would be wrong** — the capability to copy is *one queryable place where money-in becomes a number the assistant can quote*, not the vendor | **W-C42-4** — *"revenue aggregator"* | **CEO** (same account decision) |
| **P4** | **The briefing ends in the decision awaiting him** — *"What would you like me to handle first, sir?"*. This reel is external corroboration of a rule he already gave; it changes no design, it removes the excuse | **W-C42-3** — already worded as *"it ends in the decision awaiting him"* | AUTHOR |
| **P5** | **Read OpenJarvis for its method.** It is **row 16 of this ledger**, the CEO's own submission, Apache-2.0, 8,309 stars, pushed today. Read for architecture under the same bound he set for cognee on 2026-08-01: **method only, not installed — no second brain, no second database** | **ledger row 16** | AUTHOR, in queue order |
| **P6** | **Nothing to build for text-to-speech.** Kokoro is already our engine and already free per reply. Her argument is our stack lock, arrived at independently. Recorded so no future session "adopts" what we already run | — | closed by measurement |

### What should NOT be copied, and why

- **The lead-magnet close** (*"comment 'Jarvis' and I'll send you the link"*). It converts an
  audience; it has no place on a CEO-facing surface, where every claim must carry its evidence.
- **RevenueCat as a vendor.** Right capability, wrong shape for a WooCommerce holding — see P3.
- **Numbers spoken without provenance.** $4,289, 1.5 ROAS, 10.82 ROAS: all quoted, none evidenced.
  Our own rule (`MEASURE-NEVER-GUESS`, RULE #0-A) forbids us from repeating them as facts, and this
  report labels every one of them **U**.

---

## 6. Verdict

**This is the most directly useful source read so far, and it is useful for a reason none of the
first two were: it dismantles the reel the CEO himself pointed at.** Source 01 is the system he
said is *"tam da istediğimiz Jarvis sistemi"*; this reel names its parts — an agentic harness with a
drawn human-escalation path, a free local voice engine, the browser given to the agent two ways, a
revenue aggregator, a Meta Ads connector reading ROAS per creative, a named research sub-agent, and
an Apache-2.0 base — and every one of those names is something that can be installed, wired or
measured rather than admired.

**Where we genuinely stand against it, measured today:** we already own Kokoro and Playwright, our
escalation gate is stronger than her diagram because it is constitutional rather than drawn, and
our 199 written employees dwarf her single Scout. **And none of that has earned a euro**, our voice
line has been muted since 2026-07-28 with 41 % of its transcripts empty, our speech container has
been off for two days, and **not one number from the outside world reaches our assistant** — no ads,
no revenue, no mailbox. Her assistant knows which creative is failing because a connector tells it.
Ours cannot know, because nothing is connected.

**The gap is not intelligence and it is not architecture. It is wiring, and the wiring waits on one <!-- OPEN: B22 -->
decision that is the CEO's: which outside accounts may be connected (W-C42-4).**

Two things are true at once about the reel itself, and both are recorded without softening either:
the components she names are real and four of them were verified against live sources this session;
and the install she promises is never shown — the terminal at 01:12 is a C++ classroom exercise, and
the payoff is a comment-for-link funnel around a public repository. **The parts list is the value.
The reel is the advertisement.**

---

### Change log

| Date | Change |
|---|---|
| 2026-08-04 | Written from nothing. The rejected sixteen reports were deleted on the CEO's order of 2026-08-02 and no sentence of them was reopened. Watched 00:12→01:13 with sound on his live order of 2026-08-04; 62 native frames read in order; three zooms cut from the video; four machine-transcript errors corrected from the burned-in subtitles; source 01 identified inside the frame; OpenJarvis measured against the GitHub API; every DXB comparison re-measured this session |
