# 00-ARCHIVE — where every frame, subtitle and byte of the thirty-four sources lives


**Written 2026-07-28 in answer to the CEO's question:** *"bunların sen resimlerini indirdiğin her
videonun deposu nerede? resimleri, altyazıları veya içerik yazıları nerede, hangi dosyada
tutuyorsun hepsini? Opus 5 geldiğinde tekrar bu videoları indirmek, resimleri kırpmak yerine
nerede bulacak her şeyi?"*

**Short answer: nothing has to be re-downloaded and nothing has to be re-cropped.** Everything is
on this machine, under one directory, and the reading itself — every subtitle, every screen text,
every panel label — is written as text inside the reports, which ARE committed to git. **Amended 2026-08-02:** the sixteen reports written in July were BINNED by the CEO (LAW A) and none of their sentences may be re-used; the material they were built from stays, and twelve further sources he supplied were fetched to the same standard.

Everything below was measured on 2026-07-28 by command, not recalled.

## 1. One directory holds all of it

```
.planning/research/rival-intel/
├── 00-LEDGER.md        the queue and its five laws            (git: TRACKED)
│   (00-SYNTHESIS.md deleted 2026-08-02 with the verdicts it was built on)
├── 00-HANDOVER.md      the prompt for the next session        (git: TRACKED)
├── 00-ARCHIVE.md       this file — the map                    (git: TRACKED)
├── <nn>-*.md           one report per finished row (git: TRACKED)
├── transcripts/*.json  spoken word, timestamped, per source   (git: TRACKED)
├── media/              30 videos + the PDF, all ≥720p, audio kept (git: IGNORED)
├── frames/             native-resolution zoom aid, never the reading (git: IGNORED)
└── repos/              the three cloned repositories          (git: IGNORED)
```

**Why media/frames/repos are gitignored and that is correct:** 1.1 GB of binaries would bloat the
repository forever, and they are **reproducible byte-for-byte** — every report names the sha256 of
the exact file it read, and `scripts/rival-intel/fetch.sh <nn>` rebuilds the media and the frames
from the URL. If the hash does not match, the source changed underneath us and we know it.
`tests/c42/rival-intel-ledger.test.ts` verifies each report's sha256 **against the file on disk**,
so a fingerprint can never again describe some other bytes (it did for six reports on 2026-07-28;
found, fixed, and the gate strengthened in the same turn).

## 2. Source by source — measured

| # | Source | Media on disk | sha256 | Frames | Spoken word | The reading |
|---|---|---|---|---|---|---|
| **01** | Luke Cutting (`lukebuildsai`) | `media/01-DY4o8dluXdK.mp4` | `8edba9f274fb7c9b…` | `frames/01/` — **72 frames** + 1 scene cuts | `transcripts/01.json` — en, 13 segments | **`01-lukebuildsai-jarvis.md`** |
| **02** | Okyanusi · Akın Yılmaz (`akinyilmaz.ai`) | `media/02-DbTuJhOo69k.mp4` | `55b778b16a879059…` | `frames/02/` — **143 frames** + 5 scene cuts | `transcripts/02.json` — tr, 40 segments | `02-akinyilmaz-skills-system.md` — **rewritten from nothing 2026-08-04** after watching all 143 seconds in order with the sound. Four native zooms cut from the video: `cut009-skill-line` (46.5 s), `cut010-model` (15.4 s), `cut011-model` (16.2 s), `cut-url-103.6`/`cut-url-104.0`. Transcript corrected in three places from the burned-in subtitles |
| **03** | Chloe Shy (`chloeshy.ai`) | `media/03-DbBPiy4vcz4.mp4` | `e5a1d0d66c218e14…` | `frames/03/` — **74 frames** + 10 scene cuts + **3 native zooms cut from the video 2026-08-04** (`cut-github-70.2.jpg`, `cut-metaads-51.3.jpg`, `cut-jarvis-acronym-72.6.jpg`) | `transcripts/03.json` — en, 20 segments; **four meaning-changing errors corrected from the burned-in subtitles** | `03-chloeshy.md` — **written 2026-08-04 from nothing.** Watched **00:12→01:13 with sound**, 62 native frames in order, on the CEO's live narrowing *"12. saniyeden itibaren raporla"*. Source 01 identified inside her frame; OpenJarvis measured live against the GitHub API |
| **04** | The Alina Lab (`thealinalab`) | `media/04-DYG-_i9PPCM.mp4` | `91f19ae9e1a1042a…` | `frames/04/` — **32 frames** + 3 scene cuts | `transcripts/04.json` — en, 8 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **05** | CNN (`cnn`) | `media/05-DadfHYrkmr7.mp4` | `952104e0fdf8e1c9…` | `frames/05/` — **102 frames** + 27 scene cuts | `transcripts/05.json` — en, 22 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **06** | — | — | — | — | — | **ROW DELETED 2026-08-08 on the CEO's live order *"6 videoyu izleme onu sil"*.** Video, `.wav`, 43 frames and the transcript removed from disk; 19.6 MB freed. The number is not re-used |
| **07** | Misael · Founder Systems (`misael.systems`) | `media/07-DbSGx3CCRQS.mp4` | `56d2203b3333185e…` | `frames/07/` — **82 frames** + **4 native zooms** (`zoom/comms-16.0`, `zoom/comms-19.0`, `zoom/math-78.2`, `zoom/math-79.0`) | `transcripts/07.json` — en, 18 segments | **`07-misael-founder-systems.md` — REWRITTEN FROM NOTHING 2026-08-08** after the CEO deleted the first attempt the same morning. Watched 00:00→01:22 with sound, all 82 native frames in order. Ten native zooms now on disk; the four cut on 2026-08-08 (`total-76.0`, `price-76.0`, `totalvalue-76.0`, `closes-76.0`, plus `comms-22.0`/`comms-25.0`) made the offer legible and proved the Total Value figure and the closing date are **UNREADABLE** — the camera loses focus there, and no number was guessed |
| **08** | `paperclipai/paperclip` — *"the open-source app everyone uses to manage agents at work"* | `repos/paperclip` — 112M, **HEAD `19be4cf` (2026-08-08 08:46 +0700)** — the clone was 12 days stale at `7797995` and was brought to live HEAD before the reading | — | — | — | **`08-paperclip-repo.md` — WRITTEN FROM NOTHING 2026-08-08** at live HEAD. 214 migration files, **172 unique tables** extracted by command; `decisions.ts`, `issue_watchdogs.ts`, `budget_policies.ts` and `decision_queues.ts` read line by line. Liveness measured the same session: **75,865 stars · 14,124 forks · 5,062 open issues · ~166 contributors · ~529 commits/30d · pushed 2026-08-08 08:11 UTC**. `paperclip.ing` fetched: MIT, self-hosted, **no price anywhere**, cloud waitlist |
| **09** | Huw Prosser (`huwprosser`) | `media/09-DYK2IWyoEWh.mp4` | `26a91b04f9e9e4ea…` | `frames/09/` — 15 one-per-second frames + 6 scene cuts + 2 older zooms (`zoom/statusbar-11.0`, `zoom/dock-9.0`), **and the 2026-08-09 reading's own material: `frames/09/seq/` — 30 native frames at 0.5 s steps (t001→t030)** + **`zoom/09/` — 7 native crops** (`status-right-14.0`, `status-left-14.0`, `dock-14.0`, `map-london-14.6`, `orb-corner-14.6`, `orb-move-12.8`, `last-15.05`) | `transcripts/09.json` — en, 3 segments; **the name is unresolved by machine and decided by the screen** — three readings returned "Travis" / "Javis" / "Travis"; five places on screen say `JARVIS` | **`09-huwprosser.md` — rewritten from nothing 2026-08-09** under law 7. The deleted 2026-08-08 verdict is gone and was never re-opened |
| **10** | `cloud9.markets` — "Nimbus, multi agent trading desk" | `media/10-DbBAOdVBjka.mp4` | `36bf05ac45b79902…` | `frames/10/` — 75 older frames + 2 older zooms (`zoom/nimbus-role-12.0`, `zoom/localvoice-62.0`), **and the 2026-08-09 reading's own material: `frames/10/seq/` — 75 native one-per-second frames, re-cut because a re-extract of second 12 did not hash-match the stored frame** + **`zoom/10/` — 11 native crops**, among them `model-sticker-0.2` reading **`Claude Fable 5`**, `sentinel-chip-57.5` and `localvoice-62.0` | `transcripts/10.json` — en, 15 segments; **two labels corrected from the screen** — the machine hears "Capital" and "Charters", the nodes read `CAPITOL` and `CHARTIST` | **`10-cloud9-markets.md` — rewritten from nothing 2026-08-09** under law 7. The deleted 2026-08-08 verdict is gone and was never re-opened |
| **11** | Rinaldo Janjua (`rinaldojanjua.ai`) — the five-stage Inbox Cleanup diagram | `media/11-DbA3JgbphEs.mp4` · **720×1280 — the lowest-quality source watched, meets his floor exactly** | `c76361d6bee7dad5…` | `frames/11/` — **97 frames** + 1 scene cut; **no zooms needed**, card text legible natively | `transcripts/11.json` — en, 25 segments | *deleted 2026-08-08 on the CEO's live order — the verdict called the rivals' lead "legibility"; row is `fetched`, awaiting a fresh watch under ledger law 7* |
| **12** | Rinaldo Janjua | `media/12-DbF2AUQh0MQ.mp4` | `5fde87b11bc847cf…` | `frames/12/` — **52 frames** + 0 scene cuts | `transcripts/12.json` — en, 21 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **13** | Rinaldo Janjua | `media/13-DbHOTOqhBXE.mp4` | `6b1fac4a2e9203dc…` | `frames/13/` — **52 frames** + 0 scene cuts | `transcripts/13.json` — en, 12 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **14** | Rinaldo Janjua | `media/14-DbKe90ETKfB.mp4` | `7e8ceb034a5ed3e1…` | `frames/14/` — **61 frames** + 0 scene cuts | `transcripts/14.json` — en, 16 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **15** | `ozgurmode` — *"Vibe Coding İçin 4 Temel SaaS Altyapı Aracı"* (Part 5) | `media/15-vibecoder-4-sites.pdf` · **2 pages, A4 595.92 × 841.92 pt**, no audio, printed by `HeadlessChrome/150` | `fd2ffd0d1523b6ec…` | `frames/15/` — **0 frames**, and it stays empty: a 2-page PDF is read at full page resolution. The 2026-08-10 reading rendered both pages at **150 dpi** with `pdftoppm` into the session scratchpad and sampled the palette and geometry from those pixels; nothing was written into the repository | none — the document is its own text, read with `pdftotext -layout` | **`15-vibecoder-4-sites-pdf.md` — written from nothing 2026-08-10** under law 7. The queue's only PDF |
| **16** | `open-jarvis/OpenJarvis` — *"Personal AI, On Personal Devices"* (Stanford Hazy Research + Scaling Intelligence Lab) | `repos/openjarvis` — 146M, **2,033 tracked files, 1,318 Python files, 273,577 lines** | HEAD `93fc7b9e7759717bdc618097debe7cd0c4abf6ef` (2026-07-28) — **measured 2026-08-10 as 28 commits behind `main`**, and the drift is written into the report rather than hidden | — the reading is the source tree itself | — | **`16-openjarvis-repo.md` — written from nothing 2026-08-10** under law 7. Read module by module; seven decisive files read in full (`evals/core/trace.py`, `agents/morning_digest.py`, `learning/routing/{complexity,router}.py`, `scheduler/scheduler.py`, `skills/__init__.py`, `intelligence/model_catalog.py`) |
| **17** | **Higgsfield** — *"POV: Higgsfield is building you a $150k MRR app"* | `media/17-DZoJOLQoQY2.mp4` · **1080×1920, 24 fps, 85.583 s**, audio `aac` kept | `a5ccfacac3b09c49…` | `frames/17/` — **86 frames** + 1 scene cut, **and the 2026-08-10 reading's own material: `zoom/17/` — 7 native crops** (`stats-locked-9.0`, `accounts-header-26.0`, `virality-54.0`, `trends-62.0`, `trend1-62.0`, `trend2-62.0`, `support-74.0`, `incident-78.0`, `pipeline-13.0`) **+ `zoom/17/dense/` — 80 crops at 10 fps over 2.0–10.0 s**, cut to time the counter animation that 1 fps cannot resolve | `transcripts/17.json` — en, 11 segments; **defect measured and recorded, not hidden**: the first ~30 s came back nearly empty and the reel's burned-in captions carry that half-minute | **`17-dzojolqoqy2.md` — written from nothing 2026-08-10** under laws 7 and 8. All 86 frames read in order at native resolution |
| **18** | **Luke Cutting — `lukebuildsai`** — *"This is the part of Jarvis I don't usually show"* (his Slack workspace) | `media/18-DZC-H3tRH7C.mp4` · **1080×1920**, audio kept | `9f59f661ae674c4c…` | `frames/18/` — **67 frames** + `zoom/18/` | `transcripts/18.json` — en, 25 segments | **`18-dzc-h3trh7c.md` — written 2026-08-10.** *(This cell said "not yet written" until 2026-08-10 while the report existed and the row read `reported` — corrected here under law 6, ledger parity.)* |
| **19** | **Luke Cutting — `lukebuildsai`** (same author as 01 and 18) — *"My $30K/mo app runs on this AI setup"* | `media/19-DZc0F3Nx2rb.mp4` · **1080×1920, vp9, 30 fps, 41.310 s**, audio `aac` 44.1 kHz stereo kept | `2c340df407753e7c…` | `frames/19/` — **41 native frames**, **and the 2026-08-10 reading's own material: `zoom/19/` — the whole-screen crop plus 9 panel crops and their reading enlargements, `zoom/19/dense/` — 60 crops at 10 fps over 24.0–30.0 s** cut to separate the screen's own movement from the handheld camera | `transcripts/19.json` — en, 9 segments; duration `41.3096875` validated against `ffprobe` before reuse | **`19-dzc0f3nx2rb.md` — written 2026-08-10** under laws 4-11. All 41 frames read in order with the audio |
| **20** | **No Hype Ai — `_no_hype_ai`** (account `26355014945`, uploaded 2026-07-15; **not the author of 01/18/19**) — *"My best ideas come when I'm NOT in front of my computer"* — his Obsidian idea-capture pipeline | `media/20-Da0EUZAu0ve.mp4` · **1080×1920, vp9, 30 fps, 74.006 s**, audio `aac` 48 kHz stereo kept | `babd8e874406b219…` | `frames/20/` — **74 native frames**, plus `zoom/20/` — 9 crops cut from the video and `zoom/20/dense/` — **100 crops at 10 fps over 64.0-74.0 s** to separate the screen's own movement from the handheld camera | `transcripts/20.json` — en, 15 segments; last end `73.76` validated against `ffprobe`'s `74.006` before reuse | **`20-da0euzau0ve.md` — written 2026-08-10** under laws 1-11. All 74 frames read in order with the audio |
| **21** | *not yet identified — named after watching* | `media/21-DXyvXCNITAK.mp4` · **1080×1920**, audio kept | `3f5e3b17a604c8a3…` | `frames/21/` — **35 frames** | `transcripts/21.json` — en, 11 segments | *not yet written — row is `fetched`* |
| **22** | *not yet identified — named after watching* | `media/22-DanLpQ2KdzV.mp4` · **720×1280**, audio kept | `0227393fde4c90cd…` | `frames/22/` — **27 frames** | `transcripts/22.json` — en, 4 segments | *not yet written — row is `fetched`* |
| **23** | *not yet identified — named after watching* | `media/23-DaTUI9xChIR.mp4` · **1080×1920**, audio kept | `393eef92ec4a00f6…` | `frames/23/` — **33 frames** | `transcripts/23.json` — en, 7 segments | *not yet written — row is `fetched`* |
| **24** | *not yet identified — named after watching* | `media/24-Da1NGf0sfs3.mp4` · **1080×1920**, audio kept | `b7ccb271eba3573a…` | `frames/24/` — **80 frames** | `transcripts/24.json` — en, 15 segments | *not yet written — row is `fetched`* |
| **25** | *not yet identified — named after watching* | `media/25-DZY7s0LK2vj.mp4` · **1080×1920**, audio kept | `d25c578a56078fa7…` | `frames/25/` — **54 frames** | `transcripts/25.json` — en, 8 segments | *not yet written — row is `fetched`* |
| **26** | *not yet identified — named after watching* | `media/26-Day97uOu0SA.mp4` · **1080×1920**, audio kept | `c3147592dfac2232…` | `frames/26/` — **60 frames** | `transcripts/26.json` — en, 18 segments | *not yet written — row is `fetched`* |
| **27** | *not yet identified — named after watching* | `media/27-Dajd_9PuW1r.mp4` · **1080×1920**, audio kept | `1c1c7370ce9d71e5…` | `frames/27/` — **63 frames** | `transcripts/27.json` — en, 25 segments | *not yet written — row is `fetched`* |
| **28** | *not yet identified — named after watching* | `media/28-DaWrNiQO7QH.mp4` · **1080×1920**, audio kept | `f65c57b268f31bcd…` | `frames/28/` — **72 frames** | `transcripts/28.json` — en, 36 segments | *not yet written — row is `fetched`* |
| **29** | *not yet identified — named after watching* | `media/29-DZ1BSCyRtD0.mp4` · **1080×1920**, audio kept | `eba4b7b3830fbec7…` | `frames/29/` — **80 frames** | `transcripts/29.json` — en, 16 segments | *not yet written — row is `fetched`* |
| **30** | *not yet identified — named after watching* | `media/30-DbcPo0dMQ3d.mp4` · **1080×1920**, audio kept | `66e2d485799ce39e…` | `frames/30/` — **90 frames** | `transcripts/30.json` — en, 23 segments | *not yet written — row is `fetched`* |
| **31** | *not yet identified — named after watching* | `media/31-DaYUSD_ALo0.mp4` · **1080×1920**, audio kept | `2860f877684cf05f…` | `frames/31/` — **45 frames** | `transcripts/31.json` — en, 7 segments | *not yet written — row is `fetched`* |
| **32** | *not yet identified — named after watching* | `media/32-DYw6w3RxYJ0.mp4` · **1080×1920**, audio kept | `be59df51038b04fe…` | `frames/32/` — **66 frames** | `transcripts/32.json` — en, 27 segments | *not yet written — row is `fetched`* |
| **33** | *not yet identified — named after watching* | `media/33-DbeNY9aRtri.mp4` · **1080×1920**, audio kept | `4f1e44120b50ab00…` | `frames/33/` — **92 frames** | `transcripts/33.json` — en, 26 segments | *not yet written — row is `fetched`* |
| **34** | `topoteretes/cognee` — the memory repository he added to the DOCX | `repos/cognee` — 159M, HEAD `38eece5` | — | — | — | *not yet written — row is `fetched`* |
**Totals measured 2026-08-02:** media **332 MB** · frames **682 MB** · repos **257 MB** · transcripts 220 KB ·
**1,003 frames extracted across 13 videos** (14 with source 08/16 excluded — they are repositories,
not video).

## 3. Where the *text* is — this is the part that matters

The next session does not need the frames to know what was on the screen. **The reading is already
written down**, in three separate places, all of them committed:

| What | Where | Why it is enough |
|---|---|---|
| **What was SAID** | `transcripts/<nn>.json` — timestamped segments, per source, plus the same words quoted inside each report's section 2 | Committed. Independent of the video file. |
| **What was ON SCREEN** — burned-in subtitles, panel labels, menu items, button text, chart titles, code chips | **Inside each report, section 2**, in the frame-by-frame table, timestamp by timestamp | This is the whole point of the "no summarising" rule: the report is not a description of the video, it is a **transcription of the video's screens**. `attu.ai`'s left rail, Nimbus's nine node labels, the `mailto List-Unsubscribe only` constraint chip, the `PRIMARY DIRECTIVE` numbers — all of them are typed out as text |
| **What it MEANS for DXB** | Sections 3–6 of each report: capability IDs, the measured DXB comparison, the buildable project, the verdict | Committed |

**Consequence, stated plainly:** if this laptop's disk were wiped tomorrow, the 1.1 GB would be
gone and **nothing would be lost that still counts** — the transcripts, the
ledger and the synthesis are all in git. The frames are re-creatable from the URL and verifiable
against the recorded sha256.

## 4. Extra material some sources have

Two kinds of derived image exist beyond the plain 1-fps frames, and both are inside `frames/<nn>/`:

- **`frames/<nn>/sheets/`, `zoom/`, `tvhi/` — DELETED ON HIS ORDER, 2026-08-02: *"625 okunamazlar
  silinsin"*.** They were contact sheets tiled at `-geometry 300x533` plus crops taken from the
  already-downscaled working frames — **625 MB across 16 folders, and not one tool name legible in
  any of them**: a 1080-wide screen recording reduced first to 720px by the extractor and then to
  300px by the tiler, or cropped after that first loss so the pixels were gone twice over. These
  are the images off which the sixteen binned reports were written, which is the mechanical cause
  of his verdict that they *"UNDERESTIMATED MY OPPONENTS TOOOOOOO MUCH"*: an eye that cannot read
  the screen guesses. The builder `scripts/rival-intel/sheets.sh` is deleted with them under LAW A.
  The downscaled working frames went in the same pass and were re-extracted from the video at
  native resolution — **721 MB → 48 MB before regeneration**. Nothing was lost that the video
  cannot reproduce; the videos themselves were measured first and all pass his floor.
- **How a detail is zoomed now.** From the VIDEO, never from a working frame:
  `ffmpeg -ss <t> -i media/<nn>-*.mp4 -vframes 1 -vf "crop=W:H:X:Y" -q:v 2 out.png`. Cropping a
  working frame repeats the old mistake — the pixels have already been thrown away once.
- **`frames/01/tvhi/` and `frames/<nn>/zoom/`** — native-resolution crops of a region of interest,
  re-extracted from the source file rather than from the downscaled working frames. Source 01 has
  72 of these (the wall screen, second by second) plus panel and monitor zooms; source 05 has the
  crops of the Whop campaign grid. **A phone recording of a screen has a hard resolution limit** —
  where the pixels run out, the reports say `UNREADABLE` rather than guessing.

## 5. What the next Opus 5 runs

```bash
scripts/rival-intel/next.sh            # where am I? (prints the row and the command)
scripts/rival-intel/fetch.sh 29        # ONLY if the media is missing — idempotent, skips what exists
npx vitest run tests/c42/rival-intel-ledger.test.ts   # 9 cases: the reading cannot rot
```

The ninth case was added 2026-08-02 and it guards a different failure from the others: **every
source URL in the CEO's directive must own a ledger row, read out of BOTH carriers** — the
Markdown and the DOCX. He edits the DOCX; sessions read only the Markdown; six sources went
unseen for eight hours with nothing on disk saying so.

**It should not need any of them.** The reading is in the reports; the plan is in
each source's own report as it is finished; the prompt to start from is in `00-HANDOVER.md`.
