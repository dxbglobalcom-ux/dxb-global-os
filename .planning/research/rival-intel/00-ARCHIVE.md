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
| **02** | Okyanusi · Akın Yılmaz (`akinyilmaz.ai`) | `media/02-DbTuJhOo69k.mp4` | `55b778b16a879059…` | `frames/02/` — **143 frames** + 5 scene cuts | `transcripts/02.json` — tr, 40 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **03** | Chloe Shy (`chloeshy.ai`) | `media/03-DbBPiy4vcz4.mp4` | `e5a1d0d66c218e14…` | `frames/03/` — **74 frames** + 10 scene cuts | `transcripts/03.json` — en, 17 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **04** | The Alina Lab (`thealinalab`) | `media/04-DYG-_i9PPCM.mp4` | `91f19ae9e1a1042a…` | `frames/04/` — **32 frames** + 3 scene cuts | `transcripts/04.json` — en, 8 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **05** | CNN (`cnn`) | `media/05-DadfHYrkmr7.mp4` | `952104e0fdf8e1c9…` | `frames/05/` — **102 frames** + 27 scene cuts | `transcripts/05.json` — en, 22 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **06** | Alp Ünlü (`alppunlu`) | `media/06-DZkevADMVPK.mp4` | `d5a91a7ec046aa60…` | `frames/06/` — **43 frames** + 23 scene cuts | `transcripts/06.json` — tr, 15 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **07** | Misael · Founder Systems (`misael.systems`) | `media/07-DbSGx3CCRQS.mp4` | `56d2203b3333185e…` | `frames/07/` — **82 frames** + 0 scene cuts | `transcripts/07.json` — en, 18 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **08** |  | `repos/paperclip` — 112M, HEAD `7797995` | — | — | — | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **09** | Huw Prosser (`huwprosser`) | `media/09-DYK2IWyoEWh.mp4` | `26a91b04f9e9e4ea…` | `frames/09/` — **15 frames** + 6 scene cuts | `transcripts/09.json` — en, 3 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **10** | `cloud9.markets` | `media/10-DbBAOdVBjka.mp4` | `36bf05ac45b79902…` | `frames/10/` — **75 frames** + 0 scene cuts | `transcripts/10.json` — en, 15 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **11** | Rinaldo Janjua (`rinaldojanjua.ai`) | `media/11-DbA3JgbphEs.mp4` | `c76361d6bee7dad5…` | `frames/11/` — **97 frames** + 1 scene cuts | `transcripts/11.json` — en, 25 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **12** | Rinaldo Janjua | `media/12-DbF2AUQh0MQ.mp4` | `5fde87b11bc847cf…` | `frames/12/` — **52 frames** + 0 scene cuts | `transcripts/12.json` — en, 21 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **13** | Rinaldo Janjua | `media/13-DbHOTOqhBXE.mp4` | `6b1fac4a2e9203dc…` | `frames/13/` — **52 frames** + 0 scene cuts | `transcripts/13.json` — en, 12 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **14** | Rinaldo Janjua | `media/14-DbKe90ETKfB.mp4` | `7e8ceb034a5ed3e1…` | `frames/14/` — **61 frames** + 0 scene cuts | `transcripts/14.json` — en, 16 segments | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **15** |  | `media/15-vibecoder-4-sites.pdf` | `fd2ffd0d1523b6ec…` | `frames/15/` — **0 frames** + 0 scene cuts | — | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **16** |  | `repos/openjarvis` — 146M, HEAD `93fc7b9` | — | — | — | *deleted 2026-08-02 with the binned verdicts — row is `fetched`, awaiting a fresh watch* |
| **17** | *not yet identified — named after watching* | `media/17-DZoJOLQoQY2.mp4` · **1080×1920**, audio kept | `a5ccfacac3b09c49…` | `frames/17/` — **87 frames** | `transcripts/17.json` — en, 11 segments | *not yet written — row is `fetched`* |
| **18** | *not yet identified — named after watching* | `media/18-DZC-H3tRH7C.mp4` · **1080×1920**, audio kept | `9f59f661ae674c4c…` | `frames/18/` — **67 frames** | `transcripts/18.json` — en, 25 segments | *not yet written — row is `fetched`* |
| **19** | *not yet identified — named after watching* | `media/19-DZc0F3Nx2rb.mp4` · **1080×1920**, audio kept | `2c340df407753e7c…` | `frames/19/` — **41 frames** | `transcripts/19.json` — en, 9 segments | *not yet written — row is `fetched`* |
| **20** | *not yet identified — named after watching* | `media/20-Da0EUZAu0ve.mp4` · **1080×1920**, audio kept | `babd8e874406b219…` | `frames/20/` — **74 frames** | `transcripts/20.json` — en, 15 segments | *not yet written — row is `fetched`* |
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
