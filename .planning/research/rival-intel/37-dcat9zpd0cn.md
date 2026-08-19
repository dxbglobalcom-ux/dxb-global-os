# 37 — six video engines that cost nothing to run, and the one prompt that installs them

**Read against three measured holes of ours:** the paid-tool bench in
`CAPABILITY_ARSENAL_DOCTRINE.md:134` prices HeyGen at ~$24–72/mo for social-media video and its
"free alternative" column reads, in our own words, **`none (defer content type)`**; the Social Media
department's Creative Asset Agent is specified at `00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md:19` to
write *"image/video briefs"* and nothing that renders; and this box now carries an **NVIDIA RTX 5060
Ti with 16,311 MiB of video memory** that no part of the holding uses. This source fills the word
`none` with six named engines, three of them Apache-2.0, and hands over the installation method as
one paste.

---

## 1. Source identity

| | |
|---|---|
| Address | https://www.instagram.com/reels/DcAT9zPD0Cn/ |
| Operator | `ericsocal` — "Eric \| AI & E-commerce Skills" |

---

## 2. The record — what the screen showed, second by second

43.31 s · 720×1280 · AAC audio kept · watched start to end with the transcript beside it. Every row
carries a design, mechanism or money observation.

| Time | On screen / in the audio | What it is |
|---|---|---|
| 00:00 | Red title card **"Six AI Video Generators That Are Actually Free"** over a talking head; karaoke caption *"HIGGSFIELD IS AWESOME"* → *"BUT IT'S EXPENSIVE"* → *"HERE ARE SIX FREE REPLACEMENTS"* | The whole film is one substitution table: one paid tool out, six free ones in |
| 00:05 | GitHub file list of **Wan2GP** (`profiles · scripts · shared · Dockerfile · plugins.json · requirements.txt · run-docker-cuda-… · setup.py · wgp.py`), languages **Python 98.2 % · JS 1.0 % · Cuda 0.3 %**, README headline *"…the best Open Source … accessible to the GPU Poor"* | A one-file launcher (`wgp.py`) plus a Docker/CUDA runner — a product, not a research drop |
| 00:07 | Its README: **WanGP v11.52, 2nd of May 2026**, Discord + X support links, ToC (Quick Start · Installation · Usage · Documentation), then the update log: **Vista 4D** (moving-viewpoint scenes), **LTX-2 Video to Audio**, **Video Mask Generator with SAM3**, **Improved Sliding Window** (overlapped frames now carry the previous window's audio), **Video Length not Limited by Audio**, **Silent Movie Mode**, **New One Click Install / Update Scripts** | The mechanism that makes long video possible on a small card: **sliding windows** that continue a clip instead of holding it all in memory |
| 00:11 | **remotion.dev** — *"**Compose** with code — Use React, a powerful frontend technology, to create…"*, a rendered example with `<Captions />` / `<Video />` tags drawn on it | Video as a component tree: the same skill that builds our pages builds the film |
| 00:12 | Its pricing panel: **Remotion for Creators — $25/mo per seat**, **Remotion for Automators — $0.01 per render, $100/mo minimum**, total **$100/month**, ticks **Commercial use allowed · Pay according to usage · Prioritized Support · $250 Mux credits**; *"Intended for companies … automated high-volume video creation"* | The only price shown in the film, and it is priced **per render** — the unit an automated holding actually consumes |
| 00:14 | **HyperFrames**: *"HyperFrames lets AI agents **compose videos** by writing HTML, CSS & JS"*, badge **Open-source · Apache 2.0**; the composition file shows `<audio id="narration" src="narration.wav" data-start="0.5" data-duration="7.0" data-track-index="0" data-volume="1">` and a **GSAP** timeline registered on `window.__timelines` | The timeline is **declared in the markup** — an agent can write a film the way it writes a page |
| 00:15 | Its three numbered steps, step 1 read at 3× zoom: **`$ npx skills add heyman-com/hyperframes`** | The renderer ships **as a skill**, installed with one line — the same shape our `/ai/skills` page already draws |
| 00:17 | **Open-Sora** repo: **28.9k stars · 2.9k forks · 234 watching · 11 open PRs · 43 contributors · 22 deployments · Apache-2.0 · Python 100 %**; README *"Democratizing Efficient Video Production for All"*, and the banner *"For a professional AI video-generation product, try **Video Ocean**"* | The open model is the top of somebody's paid funnel — free engine, paid hosted product |
| 00:19 | Its quickstart: `torchrun --nproc_per_node 1` for **256 px**, `8` for **768 px**; aspect ratios `16:9 · 9:16 · 1:1 · 2.39:1`, `num_frames` must be `4k+1` and under 129 | Resolution and length are a **command-line dial**, and the vertical `9:16` we publish in is a first-class ratio |
| 00:21 | **Advanced Usage — Motion Score**: motion is a number in the prompt, **default 4**, examples at **1 · 4 · 7**; a prompt-refiner exists but wants an OpenAI key | Motion is a **parameter**, not a taste |
| 00:22 | **HunyuanVideo** demo page playing its own gallery under a fixed line *"Combining Virtual and Real / Unlimited Creativity"* with buttons **Github · Hugging Face · Report · Try It Now**; audio: *"gets you near Hollywood quality at 1080p"* | A landing page whose proof is its own output, running |
| 00:26 | **LTX-Video** repo: **10.2k stars · 993 forks · 113 watching · 79 issues · 8 PRs · 15 contributors · Apache-2.0 · Python 100 %** | The engine behind the LTX-2 line the WanGP log already referenced at 00:07 |
| 00:28 | Its README — **LTX-2**: *"Audio + Video, Together … generated in one coherent process"*, **native 4K up to 50 fps**, clips **up to 10 s**, *"**up to 50 % lower compute cost** than competing models"*, **multi-keyframe conditioning, 3D camera logic, LoRA fine-tuning**, *"Built into **ComfyUI** core"* | One pass produces picture **and** sound — no separate voice-over step |
| 00:31 | Its history: **v0.9.8 — up to 60 s of video**; **13B distilled v0.9.7** *"generates HD videos in 10 seconds, with low-res preview after just 3 seconds (on H100)"*, **8 diffusion steps**, a **LoRA that requires only 1 GB of VRAM**, and an **fp8 quantized** build for real-time generation | The published render clock: **preview in 3 s, HD in 10 s** on their reference card |
| 00:33 | Black card, white type — **PROMPT: "Set up [tool] so I can generate videos locally. Check my system first. Install everything I need and download the right model for my GPU. Then show me how to run it."**; audio: *"now paste this into Claude Code"* | The install method is **a sentence given to an agent**, not a tutorial |
| 00:43 | Closing sticker **SUBSCRIBE** + caption *"FOLLOW FOR MORE"* | The money mechanism of the film itself, stated |

### 2.2 Design and appearance

**Composition.** The screen recordings are shown at **native scale inside black letterbox bands**
(the recording occupies roughly the middle 340 px of the 1280 px height, the rest is pure black), so
the reader's eye lands on the readable text rather than on a shrunken page; the operator is keyed in
as a **cut-out head in the bottom-left corner with no frame around it**, overlapping the recording
instead of stealing a panel from it. **Type.** Two registers only: a red plate holding the promise in
title case at the top third, and captions in **heavy uppercase, one line at a time, with the single
load-bearing word coloured** while the rest stays white. **Colour.** Sampled from the pixels: the
title plate is a single red (`#D9081E`), the keyword cyan (`#15FCF8`) on black, the body white
(`#FEFFFE`), and the closing prompt card is a pure black ground (65 % of its area) with white text —
**light theme for the two GitHub pages and remotion.dev, dark theme for HyperFrames and the prompt
card, and the film never mixes the two inside one shot.** **Plugs into:** our own `dxb-surface` work
takes the letterbox rule — *when a screen is shown to the CEO inside another screen, it is shown at
native size on a dead ground, never scaled down to fit a card.*

---

## 3. Capabilities — the mechanism 37 adds

**A render engine can be a skill.** HyperFrames is installed with `npx skills add
heyman-com/hyperframes` and then an agent composes a film by writing HTML, CSS and JS, with the
audio track declared in the markup itself (`data-start`, `data-duration`, `data-track-index`,
`data-volume`) and GSAP holding the timeline. Nothing about it is a video tool in the traditional
sense — it is **the web stack, rendered to frames**. **Plugs into:** `/ai/skills`, which today draws
**2 rows** (`graphify`, `scrapling`) out of `library_items` where `kind='skill'`; a render skill is a
third row, and the first one that produces a deliverable a client pays for.

**Long video is a sliding window, not a bigger card.** WanGP's log states the mechanism plainly:
overlapped frames carry the previous window's audio forward, and *"Video Length not Limited by
Audio"* lets the generation continue past the supplied sound. LTX-2 states the other half — audio
and video generated **in one coherent process**, native 4K, up to 50 fps, up to 10 s per clip, with
**up to 50 % lower compute cost** than the models it names as competitors. **Plugs into:** the
Creative Asset Producer's brief (`00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md:19`) stops at *"story/reel
ideas"*; this is the machine that turns that brief into the reel itself, on our own card.

**Cost is a per-render number.** Remotion is the only priced thing on screen: **$0.01 per render**
with a **$100/mo minimum** for automated use, or **$25/mo per seat** for a human editor. Everything
else shown — Open-Sora, LTX-Video, HyperFrames — is **Apache-2.0**, and WanGP exists specifically for
*"the GPU Poor"*. **Plugs into:** `fin/costs` and the bench row at
`CAPABILITY_ARSENAL_DOCTRINE.md:134` — the doctrine's rule is *"the bench never replaces a free hand
that suffices"*, and this source is the free hand the row said did not exist.

**Installation is delegated, not documented.** The film's closing act is not a tutorial but a
paste-able instruction to an agent: check the system, install the dependencies, **pick the model
that fits this GPU**, then show how to run it. **Plugs into:** exactly the shape of our own
pre-task gate and claim path — the same paragraph, addressed to a DXB agent instead of a laptop
owner, is the body of the first task the Social Media department ever runs.

### Aliveness — how 37 shows a system built to live

**1. What runs on its own clock.** The render pipeline is the clock here, and the source publishes
its periods: **low-res preview at 3 s, HD at 10 s** for the 13B distilled model on an H100, **8
diffusion steps**, clips of **10 s** (LTX-2) and up to **60 s** (v0.9.8). A machine that renders in
tens of seconds can be scheduled; one that renders in hours cannot.

**2. What makes a surface breathe — timed.** The one product surface in the film that carries its own
motion is the **HunyuanVideo landing page**, which plays its gallery as its proof. Measured on a
**10 fps dense pass** cut from the video over 22.0-25.0 s (30 frames, 29 pairs): the player region
changes a **median 23.62 grey levels per 100 ms** (mean 24.37; its quietest
interval still reads **3.62**, so the window holds no resting frame-pair) while a static control region in the same frames reads **0.00 on all 29 pairs**.
The page is never at rest: **the surface's own output is the pulse.**

**3. How it answers the human.** One sentence in, and the machine is expected to inspect the host,
choose the model for the card it finds, install, and report how to run it — a **capability
negotiation**, not a download.

**4. What DXB takes.** A **local render lane**: an Apache-2.0 engine on our own 16 GB card, driven by
a skill row, producing the Social Media department's assets at zero marginal cost, with the render
clock (`preview → HD`) shown on the surface the way our task cards already show elapsed time.

---

## 4. What DXB has today — HIS SCREENS AGAINST OURS, screen by screen, measured 2026-08-19

Measured from the page files under `apps/dashboard/src/app` and from the live company database
(`supabase_db_DxB_Global_OS`, SELECT only). Our dashboard holds **61 `page.tsx` routes**; the
database holds **94 public tables**.

| # | His screen | Our page that would answer it | What ours actually draws, measured |
|---|---|---|---|
| 1 | **Wan2GP repo + README** — an installable local engine with a one-click script | *(none)* | A search of every route directory for `content\|social\|media\|market\|brand` returns **zero directories**. There is no page in the holding that installs, lists or runs a media engine |
| 2 | **remotion.dev — compose with code** | *(none)* | Same: no render surface exists. The nearest concept is `/ai/library`, a catalogue of 412 items, which records assets but renders nothing |
| 3 | **remotion.dev pricing — $0.01/render, $100/mo** | `/(command)/fin/costs` | Draws the `cost_ledger` — model tokens and provider spend. **No render or media unit exists in the ledger**, so a per-render price has nowhere to land yet |
| 4 | **HyperFrames — a renderer installed as a skill** | `/(command)/ai/skills` | 20-line page rendering `LibraryKindBoard kinds={["skill"]}` over `library_items`. Live count of `kind='skill'`: **2** — `graphify`, `scrapling`. (The file's own comment claims *"23 real skill assets"*; the database says 2) |
| 5 | **HyperFrames composition file** — audio timeline declared in markup | *(none)* | No composition, template or artifact object exists. `generated_work` holds **3 rows** in total, and they are task digests, not assets |
| 6 | **Open-Sora repo header — 28.9k stars, 43 contributors** | `/(command)/ai/library` (`kind='tool'`) | **21 tool rows, every one of them `dxb-mcp.*`** — our own internal MCP functions. Zero external engines, zero models with a licence recorded |
| 7 | **Open-Sora quickstart — `torchrun`, 256/768 px, 9:16** | `/(command)/ops/runtime` | Draws agent runs and queue state. It has never carried a GPU job: `workflows` = **0 rows** |
| 8 | **Motion score 1 / 4 / 7 as a prompt parameter** | *(none)* | No generation parameter surface of any kind |
| 9 | **HunyuanVideo demo page playing its own output** | `/(command)/live` | Our live surface shows work items and agent state; **there is no artifact preview anywhere in the product** — nothing the company produces can be looked at on screen |
| 10 | **LTX-Video repo — audio+video in one pass** | `/(command)/ai/models` | Draws `model_catalog` — language models only. Media models are not a category the catalogue has |
| 11 | **The department that would own all of this** | `/(command)/org/departments` | `social-media` exists: **status `dormant`, 13 agents**, including **`social-creative-asset` — "Social Creative Asset Producer"**. Measured on all 13: `skills = []`, `autonomy_level = 0`, `status = dormant` |
| 12 | **The PROMPT card — one paste installs the engine** | `/(command)/chat` and the claim path | The mechanism exists and is ours already; what is missing is a task whose body is that paragraph and a worker permitted to run it |

**The one-line reading:** he is showing six ways to *produce*; on our side the whole production half
of the holding — engine, artifact, preview, render cost — is **absent by measurement, not merely
dormant**, while the department that would own it is written, staffed with 13 agents and switched
off.

---

## 5. The build project

**Figures a builder needs, first.** Hardware on the live machine: **NVIDIA RTX 5060 Ti, 16,311 MiB
VRAM · 24 cores · 30 GB RAM · ffmpeg N-126188 present**. Licences on screen: **Apache-2.0** for
Open-Sora, LTX-Video and HyperFrames; WanGP is a launcher for the same class of weights; Remotion is
**$25/mo per seat** or **$0.01 per render with a $100/mo minimum**. Published render clock (their
reference H100): **preview 3 s, HD 10 s, 8 diffusion steps**; LTX-2 claims **native 4K, up to 50 fps,
10 s clips, up to 50 % lower compute cost**, and a **distilled LoRA that asks 1 GB of VRAM**. Our
side today: **0 media tables of 94**, **0 render routes of 61**, **2 skill rows**, **21 tool rows all
internal**, **13 dormant social agents**, **`workflows` 0**.

**P37-1 — the render skill (smallest first piece).** One `library_items` row of `kind='skill'` named
for local video render, one entry in `agents.skills` for `social-creative-asset`, and the skill's
body is the prompt card of 00:33 rewritten for our own machine. It becomes the **third** card on
`/ai/skills` and the first that produces something saleable. *Plugs into: `/ai/skills`,
`library_items`, `agents.skills`.*

**P37-2 — the local render lane.** A queue job that takes a brief, runs an Apache-2.0 engine on the
5060 Ti, writes the file, and records **seconds-per-render and VRAM peak** as the cost unit — the
holding's first cost row that is not a token. *Plugs into: pg-boss queue, `cost_ledger`,
`fin/costs`.* **Bench measurement required before any promise:** which of the six actually fits 16 GB
is **UNVERIFIED** — the film quotes H100 figures, and only a run on this card settles it.

**P37-3 — the artifact and its preview.** An artifact record (kind, path, duration, source task) and
a preview panel, so what the company produces can be seen on the surface instead of only counted.
This is the direct answer to §4 row 9. *Plugs into: `/live`, `/ops/projects`, a new artifact table.*

**P37-4 — composition as markup.** For CEO-facing motion — briefings, reports, the morning film — the
HyperFrames grammar (timeline declared in HTML, GSAP driving it) is written once as our own
component, so the same stack that draws the dashboard renders the video. *Plugs into: Phase-4 design
package, `DESIGN_SYSTEM.md` §9 motion tokens.*

**P37-5 — the bench row is closed.** `CAPABILITY_ARSENAL_DOCTRINE.md:134`'s free-alternative column
`none (defer content type)` is replaced by the engine that wins the P37-2 bench, and HeyGen's
$24–72/mo stays unbought. *Plugs into: the doctrine's own bench-maintenance rule.*

### What must NOT be copied

The **$0.01-per-render meter** — a per-unit meter on an outside service is exactly the dependency the
local card removes. Open-Sora's **prompt refiner that wants an OpenAI key**: raw provider keys are
banned by `.planning/research/STACK.md`, and nothing about the holding leaves this box. And the
film's own **"comment to get it"** growth loop is his business, not ours.

---

## 6. Verdict

**What this source produces, measured:** attention. The reel carries **709 likes and 30 comments**,
was uploaded **2026-08-14**, and its only ask is *"follow for more AI tips"* — the operator's channel
sells "AI & E-commerce Skills", so the free parts list is the top of his funnel. The instruments it
points at produce on a different scale and show it on their own pages: **Open-Sora 28.9k stars, 2.9k
forks, 43 contributors, 22 deployments**; **LTX-Video 10.2k stars, 993 forks, 15 contributors**;
Remotion sells at **$25/mo per seat** and **$0.01 per render**; Open-Sora's README funnels to a paid
product (**Video Ocean**). View count is not exposed by the probe — reading it would need the
account.

**What DXB takes, in one sentence:** the holding owns a 16 GB card, a written Social Media
department with 13 agents and a Creative Asset Producer, and **no way to render a single second of
video** — this source names six Apache-2.0 ways to close that, and hands over the install as one
paragraph an agent can execute.

---

## What was read

| | |
|---|---|
| Video | `media/37-DcAT9zPD0Cn.mp4` · sha256 `944eeb3a674745ce7052b6204be79407d27b5691074510f191d0f5a25b9fe4e4` · **43.305 s · 720×1280 · AAC** |
| **Frames on disk** | **43** (`frames/37/t001.jpg … t043.jpg`; scene-cut pass produced **0** files — the film has no cut above the 0.25 threshold) |
| **Frames opened** | **43 of 43**, one at a time, in order |
| Zoom crops | **3 cut, 3 opened** (`zoom/37/t014-install.jpg`, `t015`, `t016` — the HyperFrames install line at 3×) |
| Dense passes | **80 frames** at 10 fps (`zoom/37/dense`, `dense2`) read by `PIL` for the motion figures, not by eye |
| Sound | `transcripts/37.json` — **9 segments**, transcribed on the holding's own Speaches container (`Systran/faster-whisper-small`, 8.9 s, nothing left this machine) |
| Metadata | `yt-dlp --dump-json`: uploader `ericsocal`, uploaded **2026-08-14**, **709 likes**, **30 comments**, view count not exposed |
