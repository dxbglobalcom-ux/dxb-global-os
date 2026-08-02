# HANDOVER — how the next Opus 5 picks this up without losing anything


**Written 2026-07-28 by the session author (Opus 5, U30) at the CEO's order:**
*"bir sonraki opus 5'i de aynı şekilde devam etmesi için hazırla (bana ona vereceğim promptla lütfen)"*.

This file exists because the CEO's sessions have died before with their work unfiled — twice on
2026-07-27, and his editor was killed three times by the memory reaper between 01:49 and 01:53 on
2026-07-28. **Nothing in this programme lives in a conversation.** Everything below is on disk and
committed.

---

## 1. The prompt the CEO pastes into the new session

Copy everything between the lines. It is deliberately short: the authority is in the files, not in
the prompt.

---

```
BOOTSTRAP OKU VE ONAYLA, SONRA DEVAM ET.

Sen bu projenin oturum yazarısın (Opus 5). C42 Aşama 1 BİTMEDİ — 2026-08-01'de
16 raporun HÜKÜMLERİNİ ÇÖPE ATTIM ("hükümler çöpe, ham malzeme kalsın"), çünkü
o sistemlerin hepsi gerçek ve canlı, ben kendim teyit ettim. Ham malzeme duruyor:
28 kaynağın tamamı diskte, 720p ve üstü, sesiyle birlikte.

İŞ ŞU: her kaynağı BAŞTAN SONA, SESİYLE, insan gibi izle — kötü karelere bakarak
değil. Sonra hükmü sıfırdan yaz. Satır 01'den başla.

ÖNCE ŞUNLARI OKU (bu sırayla, tamamını):
1. .planning/STATE.md
2. HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md   — B22 satırı ve karar tablosu
   (Ferrari · V1 ölü · V2'nin birinci kanunu: CANLI OLACAK)
3. .planning/research/rival-intel/00-LEDGER.md    — kuyruk ve 5 kanunu (özellikle 4)
4. `scripts/rival-intel/next.sh` çıktısı          — sıradaki satır ve komutu
5. 00-SYNTHESIS.md ve reddedilen 16 rapor SİLİNDİ (CEO, 2026-08-02: "reddettiğim metni tamamen sil") — arayıp bulma, alıntılama, geri getirme

SONRA BANA ŞUNU SÖYLE (tablo halinde, teknik olmayan dilde, kısa):
- Kaç kaynak izlendi, kaçı kaldı
- İzlenenlerden ne çıktı (tek paragraf, süs yok)
- Neyin benim kararımı beklediği <!-- HISTORY -->

BEN "başla" DEMEDEN İNŞAATA BAŞLAMA.

KURALLAR (değişmedi, hepsi bağlayıcı):
- Yeni spec AÇMA. Her iş, sözleşmesinin sahibi olan spec'e kayıtlı uyarlama olarak girer
  (PLAN.md ≠ plan, CEO hükmü 2026-07-13).
- Ölç, tahmin etme (RULE #0-A). Her sayı komut→çıktı ile gelir. Ölçemiyorsan
  "UNVERIFIED — şu sebeple ölçemedim" yaz.
- Kanıtsız "bitti" YASAK. ✓ VERIFIED (komut→çıktı) / ⚠ UNVERIFIED ayrı ayrı.
- Görsel iş RULE #0 pasajı olmadan bitmez: iki dil, ≥2 genişlik, scrollWidth === clientWidth,
  "…" kesme YASAK. Tarayıcı bacağı için benden BİR KEZ giriş istersin (B03-bis).
- Tembellik dokuz biçimiyle yasak (STANDING ORDER 13). Turu bitirmeden yaz:
  ölçtüm mü · tam mı · kaydettim mi · doğruladım mı.
- Bana "CEO Bey" veya "Muhittin Bey" diye hitap et. Sohbet Türkçe, repoya giren her şey İngilizce.
- Her satırı sen yaz (K1). Subagent yalnız salt-okur denetim ve tarama için.
- Bir satır kapanınca defterini AYNI oturumda düzelt (tahta + U-tablosu + tracker).

TASARIM KANUNU (benim cümlem, artık kural):
"HER PANELIN CANLI OLDUĞU YAŞAYAN BİR HOLDİNG."
Her panel ya bir sorgudan okur ya da dürüst bir boş durum gösterir. Kanıtlayamadığı sayıyı
hiçbir panel gösteremez.
```

---

## 2. What is finished, and what is not

| | |
|---|---|
| **Finished** | C42 stage 1. 16/16 sources read frame by frame, reported, gated and merged. The ledger reads `NEXT: done`. Six commits, gitleaks clean on each. |
| **NOT finished** | **Nothing in the six waves is built.** Stage 1 produced the target definition; the building starts on the CEO's word. |
| **Blocked on the CEO** | Wave 4 (which accounts may be connected) · Wave 6 (whether to enter clipping, and the halal allowlist) · the RULE #0 browser leg (one login, B03-bis) |
| **Blocked on hardware** | Turkish speech *quality* — the larger STT model waits for Friday's workstation. **The 44 % `empty_transcript` defect and the 29–35 s latency are NOT blocked** — they are software faults in our own daemon |

---

## 3. Where everything lives

| What | Path |
|---|---|
| The plan (six waves) | **Does not exist yet.** The old `00-SYNTHESIS.md` was built on the binned verdicts and was deleted with them on 2026-08-02. A new one is written only when every row reads `reported` |
| The reports written under his method | `.planning/research/rival-intel/<nn>-*.md` — one appears as each row is finished. The sixteen rejected ones are gone |
| The queue and its five laws | `.planning/research/rival-intel/00-LEDGER.md` |
| The resume command | `scripts/rival-intel/next.sh` |
| Fetch a source (claim → download → sha256 → transcribe → frames) | `scripts/rival-intel/fetch.sh <nn>` |
| ~~Sweep every frame into contact sheets~~ | **DELETED 2026-08-02 under LAW A.** `sheets.sh` glued frames into a grid at `-geometry 300x533`, i.e. a 1080-wide screen recording shrunk to 300px before anyone looked at it. Terminal text, tool names and menu labels are unreadable at that size, and the sixteen reports the CEO binned were written off exactly those sheets. His live order of 2026-08-01 deletes the method, so the script goes with it — not a footnote beside it |
| The gate that makes a stale ✓ impossible | `tests/c42/rival-intel-ledger.test.ts` |
| The board (waves, complaints, open work) | `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` §2c, §3 |
| The governed adaptation record | `HOLDING-OS-MASTER-PLAN/00-INDEX.md` → **U40** |
| The 16 sources as tracker rows | `.planning/research/INTEGRATION-TRACKER.md` → "Rival Intelligence (C42, stage 1)" |
| **Where every frame, subtitle and byte lives** | **`.planning/research/rival-intel/00-ARCHIVE.md`** — the map. Read it before re-downloading or re-cropping anything: **nothing needs to be** |
| Evidence not committed (gitignored) | `media/` (182 MB) `frames/` (656 MB) `repos/` (257 MB) — reproducible byte-for-byte from the sha256 in each report; the gate now verifies that hash against the file on disk |

---

## 4. If a NEW source arrives from the CEO (C42 is a standing order)

The programme is built to absorb one more source without a redesign:

1. Add a row to `.planning/research/rival-intel/00-LEDGER.md` (number, URL, kind, `pending`,
   report filename, and **the CEO's own words about it**).
2. Set `**NEXT: <nn>**`.
3. `scripts/rival-intel/fetch.sh <nn>` — it claims the row *before* doing any work, so a crash
   costs one source and never the finished ones.
4. **WATCH the video start to end with its sound**, in order, the transcript beside it — the CEO's
   order of 2026-08-01. Frames are opened ONE AT A TIME, at native resolution, only to zoom into a
   detail already seen while watching. Never a grid, never a downscaled copy, never a substitute
   for the watching.
5. Write the six-section report. **Section 2 must be a record, never a summary** — the gate
   enforces ≥ 8 timestamped rows for a reel or video.
6. Mark the row `reported`, run `npx vitest run tests/c42/rival-intel-ledger.test.ts`, commit.
7. Correct the board and the tracker in the same session. The synthesis is written once, at the end.

---

## 5. The five things the next author must not re-learn the hard way

1. **Claim the row before you work on it.** A crash then costs one source, not fifteen. This is why
   `fetch.sh` writes `claimed` before it downloads anything.
2. **An unreadable frame is worse than no frame — it produces a confident wrong sentence.** The
   sixteen binned reports were written off frames downscaled to 720px and then tiled at 300px.
   Nobody could read a tool name off that, so the reading became a guess, and the guess read as
   contempt: *"UNDERESTIMATED MY OPPONENTS TOOOOOOO MUCH"*. Measured and fixed at source on
   2026-08-02 — `fetch.sh` no longer scales frames at all (`-q:v 2`, native 1080×1920) and
   `sheets.sh` is deleted.
3. **A camera pointed at a screen has a resolution limit.** Read the frame at native resolution,
   and write **UNREADABLE** where the pixels run out. Never guess a number off a blurred panel.
4. **The local Turkish STT is unreliable.** `Systran/faster-whisper-small` produced "Moriafa",
   "SunTrench" and "akın Yemez" on source 02. Where a video carries burned-in subtitles, **the
   frames are authoritative and the transcript is a lead.**
5. **A rejection with a reason is a deliverable.** Four of the sixteen sources produced exclusions
   (Coolify, Trigger.dev, the trading desk, the funnels) and each one is written down with why.
   A silent omission reads as "covered everything" when it did not.
