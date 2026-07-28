# 00-ARCHIVE — where every frame, subtitle and byte of the sixteen sources lives


**Written 2026-07-28 in answer to the CEO's question:** *"bunların sen resimlerini indirdiğin her
videonun deposu nerede? resimleri, altyazıları veya içerik yazıları nerede, hangi dosyada
tutuyorsun hepsini? Opus 5 geldiğinde tekrar bu videoları indirmek, resimleri kırpmak yerine
nerede bulacak her şeyi?"*

**Short answer: nothing has to be re-downloaded and nothing has to be re-cropped.** Everything is
on this machine, under one directory, and the reading itself — every subtitle, every screen text,
every panel label — is written as text inside the sixteen reports, which ARE committed to git.

Everything below was measured on 2026-07-28 by command, not recalled.

## 1. One directory holds all of it

```
.planning/research/rival-intel/
├── 00-LEDGER.md        the queue and its five laws            (git: TRACKED)
├── 00-SYNTHESIS.md     the unifying plan, six waves           (git: TRACKED)
├── 00-HANDOVER.md      the prompt for the next session        (git: TRACKED)
├── 00-ARCHIVE.md       this file — the map                    (git: TRACKED)
├── 01..16-*.md         the sixteen reports                    (git: TRACKED)
├── transcripts/*.json  spoken word, timestamped, per source   (git: TRACKED)
├── media/              the videos and the PDF                 (git: IGNORED — 182 MB)
├── frames/             every extracted frame + contact sheets (git: IGNORED — 656 MB)
└── repos/              the two cloned repositories            (git: IGNORED — 257 MB)
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
| **01** | Luke Cutting (`lukebuildsai`) | `media/01-DY4o8dluXdK.mp4` | `8edba9f274fb7c9b…` | `frames/01/` — **72 kare** + 1 sahne kesiti · 6 kontakt sayfası · 86 yakınlaştırma | `transcripts/01.json` — en, 13 parça | **`01-lukebuildsai-jarvis.md`** |
| **02** | Okyanusi · Akın Yılmaz (`akinyilmaz.ai`) | `media/02-DbTuJhOo69k.mp4` | `55b778b16a879059…` | `frames/02/` — **143 kare** + 5 sahne kesiti · 13 kontakt sayfası | `transcripts/02.json` — tr, 40 parça | **`02-akinyilmaz-skills-system.md`** |
| **03** | Chloe Shy (`chloeshy.ai`) | `media/03-DbBPiy4vcz4.mp4` | `e5a1d0d66c218e14…` | `frames/03/` — **74 kare** + 10 sahne kesiti · 7 kontakt sayfası | `transcripts/03.json` — en, 17 parça | **`03-chloeshy.md`** |
| **04** | The Alina Lab (`thealinalab`) | `media/04-DYG-_i9PPCM.mp4` | `91f19ae9e1a1042a…` | `frames/04/` — **32 kare** + 3 sahne kesiti · 3 kontakt sayfası | `transcripts/04.json` — en, 8 parça | **`04-thealinalab.md`** |
| **05** | CNN (`cnn`) | `media/05-DadfHYrkmr7.mp4` | `952104e0fdf8e1c9…` | `frames/05/` — **102 kare** + 27 sahne kesiti · 11 kontakt sayfası · 5 yakınlaştırma | `transcripts/05.json` — en, 22 parça | **`05-cnn-clipping-business.md`** |
| **06** | Alp Ünlü (`alppunlu`) | `media/06-DZkevADMVPK.mp4` | `d5a91a7ec046aa60…` | `frames/06/` — **43 kare** + 23 sahne kesiti · 6 kontakt sayfası | `transcripts/06.json` — tr, 15 parça | **`06-alppunlu.md`** |
| **07** | Misael · Founder Systems (`misael.systems`) | `media/07-DbSGx3CCRQS.mp4` | `56d2203b3333185e…` | `frames/07/` — **82 kare** + 0 sahne kesiti · 7 kontakt sayfası | `transcripts/07.json` — en, 18 parça | **`07-misael-founder-systems.md`** |
| **08** |  | `repos/paperclip` — 112M, HEAD `7797995` | — | — | — | **`08-paperclip-repo.md`** |
| **09** | Huw Prosser (`huwprosser`) | `media/09-DYK2IWyoEWh.mp4` | `26a91b04f9e9e4ea…` | `frames/09/` — **15 kare** + 6 sahne kesiti · 2 kontakt sayfası | `transcripts/09.json` — en, 3 parça | **`09-huwprosser.md`** |
| **10** | `cloud9.markets` | `media/10-DbBAOdVBjka.mp4` | `36bf05ac45b79902…` | `frames/10/` — **75 kare** + 0 sahne kesiti · 7 kontakt sayfası | `transcripts/10.json` — en, 15 parça | **`10-cloud9-markets.md`** |
| **11** | Rinaldo Janjua (`rinaldojanjua.ai`) | `media/11-DbA3JgbphEs.mp4` | `c76361d6bee7dad5…` | `frames/11/` — **97 kare** + 1 sahne kesiti · 9 kontakt sayfası | `transcripts/11.json` — en, 25 parça | **`11-rinaldojanjua-a.md`** |
| **12** | Rinaldo Janjua | `media/12-DbF2AUQh0MQ.mp4` | `5fde87b11bc847cf…` | `frames/12/` — **52 kare** + 0 sahne kesiti · 5 kontakt sayfası | `transcripts/12.json` — en, 21 parça | **`12-rinaldojanjua-b.md`** |
| **13** | Rinaldo Janjua | `media/13-DbHOTOqhBXE.mp4` | `6b1fac4a2e9203dc…` | `frames/13/` — **52 kare** + 0 sahne kesiti · 5 kontakt sayfası | `transcripts/13.json` — en, 12 parça | **`13-rinaldojanjua-c.md`** |
| **14** | Rinaldo Janjua | `media/14-DbKe90ETKfB.mp4` | `7e8ceb034a5ed3e1…` | `frames/14/` — **61 kare** + 0 sahne kesiti · 6 kontakt sayfası | `transcripts/14.json` — en, 16 parça | **`14-rinaldojanjua-d.md`** |
| **15** |  | `media/15-vibecoder-4-sites.pdf` | `fd2ffd0d1523b6ec…` | `frames/15/` — **0 kare** + 0 sahne kesiti · 0 kontakt sayfası | — | **`15-vibecoder-4-sites-pdf.md`** |
| **16** |  | `repos/openjarvis` — 146M, HEAD `93fc7b9` | — | — | — | **`16-openjarvis-repo.md`** |
**Totals measured:** media **182 MB** · frames **656 MB** · repos **257 MB** · transcripts 128 KB ·
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
gone and **nothing of the analysis would be lost** — the sixteen reports, the transcripts, the
ledger and the synthesis are all in git. The frames are re-creatable from the URL and verifiable
against the recorded sha256.

## 4. Extra material some sources have

Two kinds of derived image exist beyond the plain 1-fps frames, and both are inside `frames/<nn>/`:

- **`frames/<nn>/sheets/`** — contact sheets, 12 frames per sheet, built by
  `scripts/rival-intel/sheets.sh <nn>`. This is how every frame is swept by eye without opening
  150 files. The script prints the count it swept; compare it against the frame count, because a
  silent omission already happened once here (source 02 lost 44 frames to a prefix bug).
- **`frames/01/tvhi/` and `frames/<nn>/zoom/`** — native-resolution crops of a region of interest,
  re-extracted from the source file rather than from the downscaled working frames. Source 01 has
  72 of these (the wall screen, second by second) plus panel and monitor zooms; source 05 has the
  crops of the Whop campaign grid. **A phone recording of a screen has a hard resolution limit** —
  where the pixels run out, the reports say `UNREADABLE` rather than guessing.

## 5. What the next Opus 5 runs

```bash
scripts/rival-intel/next.sh            # where am I? (now prints: 16/16 reported, NEXT: done)
scripts/rival-intel/sheets.sh 05       # re-sweep any source's frames by eye
scripts/rival-intel/fetch.sh 05        # ONLY if the media is missing — idempotent, skips what exists
npx vitest run tests/c42/rival-intel-ledger.test.ts   # 8 cases: the reading cannot rot
```

**It should not need any of them.** The reading is in the reports; the plan is in
`00-SYNTHESIS.md`; the prompt to start from is in `00-HANDOVER.md`.
