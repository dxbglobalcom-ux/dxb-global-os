# 37 — six video engines that cost nothing to run

**WHAT THIS FILE IS.** The CEO's order, 2026-08-19: *"37 izlenmeyecekti unuttum … raporunda
görüntülerle ilgili herşeyi sil, oradaki sadece verdiği kaynaklar önemli."* Everything this report
had about the film itself — its design, its composition, its screens, its motion — **is deleted**
(LAW A). What remains is the only thing he wants from this source: **the tools it names, what each
one is, what it costs, and where it plugs into this holding.**

**WHY IT MATTERS.** Our own research card `.planning/research/study-cards/video-editing-toolchain.md`
(verdict of 2026-07-17) picked the **editing** lane and left the **generation** lane pointing at paid
tools (`seedance-2` "when funded", `z-image` credits). The paid bench in
`CAPABILITY_ARSENAL_DOCTRINE.md:134` prices HeyGen at **~$24–72/mo** and its "free alternative"
column reads, in our own words, **`none (defer content type)`**. That same card's pitfall 2 says
*"X230 cannot render … offload to the RTX 4090 machine when available."* **Measured this session:
the live machine now carries an NVIDIA RTX 5060 Ti with 16,311 MiB of video memory, and nothing in
the holding uses it.** This source fills the word `none` with six named engines, three of them
Apache-2.0.

---

## 1. Source identity

| | |
|---|---|
| Address | https://www.instagram.com/reels/DcAT9zPD0Cn/ |
| Operator | `ericsocal` — "Eric \| AI & E-commerce Skills" |

---

## 2. The record — the sources it names, in the order it names them

Not watched as a film, on his order. The column that matters is the third: what each named source
says about itself on its own page.

| Time | The source named | What it is, from its own page |
|---|---|---|
| 00:00 | **Higgsfield** — named only as the paid thing being replaced | The tool the other six are offered against. No price is stated in the source |
| 00:05 | **Wan2GP / WanGP** (`deepbeepmeep/Wan2GP`) | Measured live 2026-08-19: **8,763 stars · 1,371 forks· last push that same day**. A launcher for the Wan family of video models *"for the GPU Poor"* — one entry file `wgp.py`, a Docker/CUDA runner, one-click install scripts. Log v11.52: **sliding windows** that continue a clip instead of holding it in memory, *"Video Length not Limited by Audio"*, LTX-2 video-to-audio, SAM3 mask generator |
| 00:11 | **Remotion** (`remotion.dev`) | Video composed **as React code**. Priced per seat and **per render**: `Creators $25/mo per seat`; `Automators $0.01 per render, $100/mo minimum` |
| 00:14 | **HyperFrames** | *"Lets AI agents compose videos by writing HTML, CSS & JS"* — **Apache-2.0**, installed as an agent skill with `npx skills add heyman-com/hyperframes`; the audio timeline is declared in the markup itself |
| 00:17 | **Open-Sora** (`hpcaitech/Open-Sora`) | **Apache-2.0**, Python — measured live 2026-08-19 via the GitHub API: **29,282 stars · 3,007 forks**. Runs from the command line at 256 px on one GPU or 768 px on eight; aspect ratios include **9:16** (our publishing shape); motion is a prompt parameter (`motion score`, default 4). Its README funnels to a paid hosted product, **Video Ocean** |
| 00:22 | **HunyuanVideo** (Tencent) | Open weights; the source claims near-1080p quality. Measured live 2026-08-19: **12,442 stars · 1,313 forks** |
| 00:26 | **LTX-Video** (Lightricks) | **Apache-2.0** — measured live 2026-08-19: **10,868 stars · 1,113 forks**. **LTX-2**: picture **and sound generated in one pass**, native 4K up to 50 fps, clips to 10 s, *"up to 50 % lower compute cost than competing models"*, multi-keyframe conditioning, LoRA fine-tuning, **built into ComfyUI core**. History: v0.9.8 to 60 s of video; the **13B distilled** build renders **HD in 10 seconds with a low-res preview after 3 seconds** on their reference card, in **8 diffusion steps**, and its **LoRA asks 1 GB of video memory** |
| 00:33 | **The installation method itself** | One instruction handed to a coding agent: *"Set up [tool] so I can generate videos locally. Check my system first. Install everything I need and download the right model for my GPU. Then show me how to run it."* |
| 00:43 | **The operator's own ask** | *"Follow for more AI tips."* Nothing is sold in the source |

---

## 3. Capabilities — what these sources add to the mechanism

**A render engine can be a skill, not a service.** HyperFrames installs with one line and is then
driven by an agent writing HTML, CSS and JS. **Plugs into:** `/ai/skills`, which draws
`library_items` where `kind='skill'` — **measured live: 2 rows** (`graphify`, `scrapling`).

**Long video is a sliding window, not a bigger card.** WanGP continues a clip window by window;
LTX-2 generates picture and sound in one pass. **Plugs into:** the Social Media department's
Creative Asset Producer, specified at `00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md:19` to write
*"image/video briefs"* and nothing that renders.

**Cost becomes a per-render number, or zero.** Remotion is **$0.01 per render** with a **$100/mo**
floor; Open-Sora, LTX-Video and HyperFrames are **Apache-2.0** and run on our own card.
**Plugs into:** the bench row `CAPABILITY_ARSENAL_DOCTRINE.md:134`, whose own rule is *"the bench
never replaces a free hand that suffices"*.

**Installation is delegated to an agent, not documented for a human.** **Plugs into:** the claim
path and pre-task gate we already own — that paragraph, addressed to a DXB agent, is the body of the
first task the Social Media department ever runs.

### Aliveness — the clock these engines run on

**What runs on its own clock, and how fast:** the render itself, and the sources publish the period —
**low-res preview at 3 s, HD at 10 s**, **8 diffusion steps**, clips of **10 s** (LTX-2) and up to
**60 s** (v0.9.8), on their reference hardware. A lane that renders in tens of seconds can be put on
a schedule; one that renders in hours cannot. **Whether those figures hold on our 16 GB card is
UNVERIFIED** — only a run on this machine settles it, and that run is P37-2 below.

**What DXB takes:** a local render lane — an Apache-2.0 engine on our own card, driven by a skill
row, producing the Social Media department's assets at zero marginal cost, with seconds-per-render
recorded as a cost unit.

---

## 4. What DXB has today — measured 2026-08-19

`SELECT`-only against the company database (`supabase_db_DxB_Global_OS`), and the page files.

| What these sources are | Ours, measured | The distance |
|---|---|---|
| Six engines that render video, three of them Apache-2.0 | **0 of our 94 public tables** match `content\|social\|post\|media\|asset\|campaign\|video\|publish`; **0 of our 61 routes** is a content or render surface | **There is no place in this product where a produced file could even be recorded** |
| A renderer installed as a skill | `/ai/skills` renders `library_items` where `kind='skill'` → **2 rows**; `library_items` holds **412** rows, of which `kind='tool'` is **21 — all `dxb-mcp.*`, our own internal functions** | **Zero external engines in the registry** |
| A price per render (`$0.01`) | `/fin/costs` reads `cost_ledger` — **1,604 rows**, all model tokens. No render or media unit exists | **A per-render price has nowhere to land** |
| The department that would own this | `departments.social-media` exists — **`dormant`, 13 agents**, including **`social-creative-asset` "Social Creative Asset Producer"**; measured on all 13: `skills = []`, `autonomy_level = 0` | **The workforce is written and switched off** |
| The machine to run it on | **NVIDIA RTX 5060 Ti · 16,311 MiB · 24 cores · 30 GB RAM · ffmpeg present** | **The card is here and idle** |
| Our own earlier verdict | `video-editing-toolchain.md` (2026-07-17) picked **HyperFrames** — *the third tool in this source* — as the deterministic lane, and **rejected Remotion** for licence cost. Its generation lane still points at paid tools | **Our research already chose one of these six; the free generation half was never filled, and this source fills it** |

---

## 5. The build project

**The figures a builder needs, first.** Cost: **free** for Wan2GP, Open-Sora, HunyuanVideo,
LTX-Video and HyperFrames (self-hosted, no account); **$25/mo per seat** or **$0.01/render +
$100/mo** for Remotion. Published render clock: **preview 3 s, HD 10 s, 8 steps**; LTX-2 claims
**4K, 50 fps, 10 s clips, up to 50 % lower compute cost**, and a distilled LoRA at **1 GB** of video
memory. Ours: **0 media tables of 94 · 0 render routes of 61 · 2 skill rows · 21 internal tools ·
13 dormant social agents · 16,311 MiB idle.**

**P37-1 — the render skill.** One `library_items` row of `kind='skill'`, one entry in
`agents.skills` for `social-creative-asset`, its body the installation instruction rewritten for our
machine. Becomes the third card on `/ai/skills` and the first that produces something saleable.

**P37-2 — the local render lane, and the bench that picks the engine.** A queue job that takes a
brief, runs one Apache-2.0 engine on the 5060 Ti, writes the file, and records **seconds-per-render
and peak video memory** — the holding's first cost row that is not a token. **Which of the six fits
16 GB is UNVERIFIED until that bench runs.**

**P37-3 — the artifact and its preview.** A record for what the company produces (kind, path,
duration, source task) and a panel that shows it. Today `generated_work` holds **3 rows**, and they
are task digests, not assets.

**P37-4 — the bench row closes.** `CAPABILITY_ARSENAL_DOCTRINE.md:134`'s free-alternative column
`none (defer content type)` is replaced by the winner of P37-2, and HeyGen's $24–72/mo stays
unbought.

**P37-5 — the six sources are now rows in this holding's own registers, not lines in a report.**
Written the same session, on his question: study cards `wan2gp` · `open-sora` · `hunyuanvideo` ·
`ltx-video`, the existing `heygen-hyperframes` card re-measured, and four new rows in
`.planning/research/INTEGRATION-TRACKER.md` under `Social Media / creative asset`. Figures taken
live from the GitHub API on 2026-08-19: **Wan2GP 8,763★ (pushed that same day) ·
Open-Sora 29,282★ · HunyuanVideo 12,442★ · LTX-Video 10,868★ · HyperFrames 41,693★ — all five free
to run on our own machine**. **One finding decides the bench:** WanGP is a
launcher that already fronts **Wan, LTX-2, HunyuanVideo, Flux and Qwen Image**, so P37-2 needs one
install, not four.

**The connection to what we already hold:** `video-editing-toolchain.md` picked the **editing**
lane (OpenMontage + HyperFrames) and its generation lane pointed at paid tools; that card's
generation half is **filled this session** with the four free engines above; these six are the
**generation** lane in front of the editing one, and
**source 33's `Generate UGC ad variants` card is the same lane on a rival's screen** — it prices the
human act it replaces at **$2-3k per batch of ad angles** and breaks into `actor-generator ·
take-culler · variant-sheet`. Read the three together: 33 says what the lane is worth, 37 says what
it costs to run, our own study card says what edits the result.

### What must NOT be copied

The **per-render meter on an outside service** — that is the dependency the local card removes.
Open-Sora's **prompt refiner that wants an OpenAI key**: raw provider keys are banned by
`.planning/research/STACK.md`, and nothing about the holding leaves this box.

---

## 6. Verdict

**What this source produces, measured:** attention — **709 likes, 30 comments**, uploaded
**2026-08-14**; nothing is sold in it. The instruments it points at produce on their own scale and
publish it: **Open-Sora 29,282 stars · 3,007 forks**; **LTX-Video 10,868 stars · 1,113 forks**; **HyperFrames 41,693 stars**; **Remotion sells at $25/mo per seat and $0.01 per render**; Open-Sora's
README funnels to a paid product (**Video Ocean**).

**What DXB takes, in one sentence:** the holding owns a 16 GB card, a written Social Media
department with 13 agents and a Creative Asset Producer, and **no way to render one second of
video** — this source names six ways to close that, three of them free forever, and hands over the
installation as one paragraph an agent can execute.

---

## What was read

| | |
|---|---|
| Source | `media/37-DcAT9zPD0Cn.mp4` · sha256 `944eeb3a674745ce7052b6204be79407d27b5691074510f191d0f5a25b9fe4e4` · 43.305 s |
| Read for | **the named sources only** — on his order of 2026-08-19 the visual reading of this source was deleted from this report; no design, screen, composition or motion observation remains |
| Sound | `transcripts/37.json` — 9 segments, transcribed on the holding's own Speaches container, nothing left this machine |
| Metadata | `yt-dlp --dump-json`: uploader `ericsocal`, uploaded 2026-08-14, 709 likes, 30 comments; view count not exposed |
| Own side | measured live against the company database, SELECT only, and against the page files under `apps/dashboard/src/app` |
