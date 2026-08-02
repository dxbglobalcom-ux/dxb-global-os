# RIVAL INTELLIGENCE LEDGER — stage 1 of the C42 programme


**NEXT: 01**

> ### ⛔ EVERY VERDICT ON THIS QUEUE WAS BINNED BY THE CEO — 2026-08-01 (LAW A)
> He inspected the sixteen reports and rejected them: the author *"UNDERESTIMATED MY OPPONENTS
> TOOOOOOO MUCH"*, while **every one of those systems is real and live — he confirmed it himself**.
> His order: *"hükümler çöpe, ham malzeme kalsın."* So the sixteen rows were reset from `reported`
> to `fetched` on 2026-08-02: the media, the sha256 fingerprints and the transcripts stay and are
> re-used, and **not one sentence of the old reports may be carried into a new one.** The report
> files remain on disk only as the record of what was rejected. Twelve further sources he supplied
> (rows 17-28) join the same queue. Nothing here is `reported` again until it has been watched
> under law 4 below.

> This file is the work queue, not the report. One row per source. A fresh session runs
> `scripts/rival-intel/next.sh`, reads the row this file points at, and continues there.
> **The conversation is not the record — this file is.** A session that dies loses nothing
> that reached this table.

## Why this exists

CEO standing order **C42** (2026-07-27, restated 2026-07-28 in `HAMZA VE KOMPLE SISTEM
SIKAYETİ.odt`): the CEO hands over competitor reels, videos and repos; the session author
studies them, reports, and then builds the same capability **or better**. His binding
instruction on depth, verbatim:

> *"ÖLÜMCÜL UYARI EN BÜYÜK HATA: ÖZET İNCELEME YAPILMAYACAK MİLİMETRİK DEĞERLENDİRME HER
> KAREDEKİ OLGU … ŞU SKİLLERİ ŞU PLUGİNLERİ ŞU TOOLLARI İNDİRİP KURUP YAPARIM YAPILIR
> PROJESİ OLMALI. … GEREKİRSE SİSTEMİ KOMPLE YENİDEN İNŞAA EDERİZ YETERKİ MÜKEMMEL
> RAKİPLERİMİZDEN ÇOK İİ OLSUN."*

And on continuity, the same day:

> *"BİR SONRAKİ OPUS 5 TE DEVAM ETSİN KALDIĞIN YERDEN 1. AŞAMADA VE SONRAKİLERE DE SIRAYLA
> DEVAM ETSİN O ŞEKİLDE BİR SİSTEM KUR … CONTEXT ŞİŞERSE KAPANIRSA SİSTEM FALAN"*

That second order is the repair of a measured defect, not a preference: two of the CEO's
sessions died on 2026-07-27 with their work unfiled, and his editor was killed three times
by the memory reaper at 01:49-01:53 on 2026-07-28.

## The law of this ledger

1. **Claim before you work.** Set the row to `claimed` with the timestamp BEFORE fetching.
   A crash then leaves a claimed row, and the next session redoes exactly that one source —
   never the fifteen that were already finished.
2. **One commit per source.** Git history is the second recovery point.
3. **`reported` is a claim that must survive a test.** `tests/c42/rival-intel-ledger.test.ts`
   fails the suite if a `reported` row has no report file, or a report missing any of its six
   required sections. A stale ✓ is mechanically impossible here.
4. **No summarising, and the source is the VIDEO — not a wall of frames.** Amended by the
   CEO's live order of 2026-08-01, which deletes the frame-photography method that produced
   the sixteen rejected reports (LAW A): *"O VİDEOLARIN TAMAMI VE SONRAKİ VİDEOLAR 720 HD
   KALİTESİ İLE İNDİRİLİP İZLENSİN … İNSAN GÖZÜYLE İZLENİR GİBİ İZLENSİN kötü karelere bakıp
   değil."* Every source is downloaded at 720p or better **with its audio kept**, and watched
   from start to end the way a person watches it, sound included. Frames stay on disk for one
   purpose only — zooming into a detail already seen while watching — and may never stand in
   for the watching. Section 2 of every report is still a timestamped record with no
   summarising; it is now the record of what was WATCHED.
5. **Ledger parity (U38).** When a row closes here, its row on `00-BOARD-OPEN-WORK.md` and in
   `INTEGRATION-TRACKER.md` is corrected in the SAME session.

## Status vocabulary

| Value | Meaning |
|---|---|
| `pending` | Untouched. The next session takes the lowest-numbered one. |
| `claimed` | A session started it. If its timestamp is old, that session died — redo this row. |
| `fetched` | Media on disk at 720p or better with audio, sha256 recorded, transcript extracted. |
| `watched` | The video was watched start to end with its sound, as a human watches; raw notes taken. |
| `reported` | The six-section report is written and committed. Terminal. |

## The queue

| # | Source | Kind | Status | Claimed at | Report | The CEO's own words about this source |
|---|---|---|---|---|---|---|
| 01 | https://www.instagram.com/reel/DY4o8dluXdK/ — Luke Cutting (`lukebuildsai`) | reel | fetched  | 2026-07-28T10:46:20Z | `01-lukebuildsai-jarvis.md` | *"Bizim DxB Global Holdigimiz için tam da istediğimiz Jarvis sistemi bu short videoda mevcut"* — he gave this link three times (items 1, 15, 16 of his list) |
| 02 | https://www.instagram.com/reel/DbTuJhOo69k/ — Okyanusi · Akın Yılmaz (`akinyilmaz.ai`) | reel | fetched  | 2026-07-28T11:12:31Z | `02-akinyilmaz-skills-system.md` | *"(BURADAKI SKILLERI VS TUM SISTEMI ISTIORZ)"* |
| 03 | https://www.instagram.com/reel/DbBPiy4vcz4/ — Chloe Shy (`chloeshy.ai`) | reel | fetched  | 2026-07-28T11:21:15Z | `03-chloeshy.md` | listed without a note |
| 04 | https://www.instagram.com/reel/DYG-_i9PPCM/ — The Alina Lab (`thealinalab`) | reel | fetched  | 2026-07-28T11:24:47Z | `04-thealinalab.md` | listed without a note |
| 05 | https://www.instagram.com/reel/DadfHYrkmr7/ — CNN (`cnn`) | reel | fetched  | 2026-07-28T11:26:33Z | `05-cnn-clipping-business.md` | *"BU SİSTEMİ DE PROJE OLARAK İSTİORZ (clipping business EN MÜKEMMEL ŞEKİLDE YAPMALI)"* |
| 06 | https://www.instagram.com/reel/DZkevADMVPK/ — Alp Ünlü (`alppunlu`) | reel | fetched  | 2026-07-28T11:31:01Z | `06-alppunlu.md` | listed without a note |
| 07 | https://www.instagram.com/reel/DbSGx3CCRQS/ — Misael · Founder Systems (`misael.systems`) | reel | fetched  | 2026-07-28T11:33:23Z | `07-misael-founder-systems.md` | listed without a note |
| 08 | https://github.com/paperclipai/paperclip | repo | fetched  | 2026-07-28T11:37:36Z | `08-paperclip-repo.md` | *"BAK BAK İNCELE DE GÖR!!!!!"* — 74,953 stars, "the open-source app everyone uses to manage agents at work" |
| 09 | https://www.instagram.com/reel/DYK2IWyoEWh/ — Huw Prosser (`huwprosser`) | reel | fetched  | 2026-07-28T11:37:37Z | `09-huwprosser.md` | listed without a note |
| 10 | https://www.instagram.com/reel/DbBAOdVBjka/ — `cloud9.markets` | reel | fetched  | 2026-07-28T11:38:17Z | `10-cloud9-markets.md` | listed without a note |
| 11 | https://www.instagram.com/reel/DbA3JgbphEs/ — Rinaldo Janjua (`rinaldojanjua.ai`) | reel | fetched  | 2026-07-28T11:40:50Z | `11-rinaldojanjua-a.md` | listed without a note |
| 12 | https://www.instagram.com/reel/DbF2AUQh0MQ/ — Rinaldo Janjua | reel | fetched  | 2026-07-28T11:47:15Z | `12-rinaldojanjua-b.md` | listed without a note |
| 13 | https://www.instagram.com/reel/DbHOTOqhBXE/ — Rinaldo Janjua | reel | fetched  | 2026-07-28T11:51:40Z | `13-rinaldojanjua-c.md` | listed without a note |
| 14 | https://www.instagram.com/reel/DbKe90ETKfB/ — Rinaldo Janjua | reel | fetched  | 2026-07-28T11:55:20Z | `14-rinaldojanjua-d.md` | listed without a note |
| 15 | https://drive.google.com/file/d/105ejHFZg-07mYEJwT4vZ5rxFClS-h9G4/view | pdf | fetched  | 2026-07-28T11:59:59Z | `15-vibecoder-4-sites-pdf.md` | measured 2026-07-28: not a video — the PDF *"Her Vibe Coder'ın Bilmesi Gereken 4 Site - Part 5"* |
| 16 | https://github.com/open-jarvis/OpenJarvis | repo | fetched  | 2026-07-28T11:59:59Z | `16-openjarvis-repo.md` | *"JARVIS REPOSU"* — 8,065 stars, "Personal AI, On Personal Devices". Studied once on 2026-07-27 in a session that died; that study is NOT on disk, so it is redone here |
| 17 | https://www.instagram.com/reel/DZoJOLQoQY2/?utm_source=ig_web_copy_link&igsh=NTc4MTIwNjQ2YQ== | reel | fetched | 2026-08-01T23:33:18Z | `17-dzojolqoqy2.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 18 | https://www.instagram.com/reel/DZC-H3tRH7C/?igsh=Y3d6Y3Y3MTR5dm5k | reel | fetched | 2026-08-01T23:35:39Z | `18-dzc-h3trh7c.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 19 | https://www.instagram.com/reel/DZc0F3Nx2rb/?igsh=ZHV5YXpwZTBzdzcx | reel | fetched | 2026-08-01T23:40:24Z | `19-dzc0f3nx2rb.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 20 | https://www.instagram.com/reel/Da0EUZAu0ve/?igsh=MWI2Nm13bng3b2l4cg== | reel | fetched | 2026-08-01T23:42:01Z | `20-da0euzau0ve.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 21 | https://www.instagram.com/reel/DXyvXCNITAK/?igsh=MWgyM3R1eWFpdmI0bg== | reel | fetched | 2026-08-01T23:44:34Z | `21-dxyvxcnitak.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 22 | https://www.instagram.com/reel/DanLpQ2KdzV/?igsh=aTVieWdmbDBpNXZs | reel | fetched | 2026-08-01T23:45:32Z | `22-danlpq2kdzv.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 23 | https://www.instagram.com/reel/DaTUI9xChIR/?igsh=cWsxbDBmN3BsNDFx | reel | fetched | 2026-08-01T23:46:19Z | `23-datui9xchir.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 24 | https://www.instagram.com/reel/Da1NGf0sfs3/?igsh=NXVnazFmZ2V5cm1j | reel | fetched | 2026-08-01T23:47:15Z | `24-da1ngf0sfs3.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 25 | https://www.instagram.com/reel/DZY7s0LK2vj/?igsh=YmhzMmNxdGd3ZHVt | reel | fetched | 2026-08-01T23:49:13Z | `25-dzy7s0lk2vj.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 26 | https://www.instagram.com/reel/Day97uOu0SA/?igsh=MTNoMHZjZ2RvazR5cA== | reel | fetched | 2026-08-01T23:50:50Z | `26-day97uou0sa.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 27 | https://www.instagram.com/reel/Dajd_9PuW1r/?igsh=NGFpejduNGNjdWhq | reel | fetched | 2026-08-01T23:52:27Z | `27-dajd-9puw1r.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |
| 28 | https://www.instagram.com/reel/DaWrNiQO7QH/?igsh=YzRkazFkZWExbGkx | reel | fetched | 2026-08-01T23:54:13Z | `28-dawrniqo7qh.md` | Supplementary list, section 11 of his directive of 2026-07-29: *"Analyse all previously collected competitor videos and all additional URLs below. The new links are supplementary; do not reduce the entire product vision to only the features shown in them."* |

**Accessibility measured 2026-07-28 12:2x:** all 16 reachable — 13 reels probed one by one with
`yt-dlp --simulate`, the Drive link resolved to a PDF over `drive.usercontent.google.com` (HTTP
200), both repos answered the GitHub API. **Zero blocked sources.**

## Where the material lives

`00-ARCHIVE.md` maps every source to its media file, its sha256, its frames, its contact sheets, its transcript and its report — measured, not described. **The next session does not re-download or re-crop anything: the reading is written as text inside the reports, and those are committed.**

## Closing stage 1

When every row reads `reported`, one synthesis lands at `00-SYNTHESIS.md`: repeated capabilities
collapse into single rows, competing approaches are compared openly, and the target definition
for stages 2-6 comes out of it. The CEO reads that synthesis; the next stage opens on his word.
