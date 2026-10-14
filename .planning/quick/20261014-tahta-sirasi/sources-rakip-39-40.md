# Source — `~/Desktop/GOREV-RAKIP-39-40.md` (rival sources 39 and 40)

Reader: step 2b of the board-order job, 2026-10-14. Read whole (101 lines). Prepared 2026-08-31 by a session, for
Opus 5; the CEO's order it carries: *"bunu ikisini kare kare izlem gerekli çok önemli."* The task: open all 223
frames (39: 110, 40: 113) one by one with the sound, write `39-dcnclj.md` and `40-dcbpe7.md`, set both ledger rows
to `reported`, write what the studio should take into **B43**, run `ledger-truth.mjs`, report to him in Turkish.

## Did the task run? — NO, not as written. It cannot now run as written.

| Check | Command / place | Measured 2026-10-14 |
|---|---|---|
| Reports | `ls .planning/research/rival-intel/` | `39-dcnclj.md` and `40-dcbpe7.md` **absent**; the last reports on disk are 23, 33, 37 |
| Ledger rows | `00-LEDGER.md:446-447` | both still **`fetched`** (2026-08-31T15:02/15:03Z), report column names the unwritten files; `00-LEDGER.md:4` **`NEXT: 39`** |
| Board | `00-BOARD-OPEN-WORK.md:137` (B22) | waits-on cell: *"rows 39 and 40 are owed to B43"*; `board-rows/B22.md:24` *"rows 39 and 40 fetched 2026-08-31 for B43 and owed to it, `NEXT: 39`"* |
| B43 | `board-rows/B43.md` (111,903 B) | 0 hits for `39`/`40`/`nvideo`/`provenance`; nothing from these two reels was written into it |
| Git | `git log --oneline --all` grep rival/39/40/nvideo | no commit writes a 39 or 40 report; `acf65c16` only moved NEXT to 39 (2026-09-26) |
| Approvals | `scripts/governance/ceo-approvals.json` | no entry for source 39, 40, nVideo/invideo |
| **The material** | `ls rival-intel/frames/` → `01 02 03 04 05 09 12 14 29 33 35`; `media/` holds only `15-…pdf` | **frames/39 and frames/40 are gone (0 files); the two .mp4 are gone.** Deleted in his own sweep of 2026-09-21 on his click, *"Rakip videoların şeyine ihtiyacımız yok herhalde. İhtiyacımız olmayan kısımları sil"* (commit `d38c28ea`, which measured `frames/` 11 of 36 left). Frames were gitignored (`.gitignore:73`), so no copy exists in git. **Still on disk:** `transcripts/39.json` (15,280 B) and `transcripts/40.json` (11,013 B) |

**Where it partly landed instead — outside the rival door.** The same two reels are item **W076** of the WhatsApp
link review of 2026-10-08 (`.planning/research/watch-links/2026-10-08-whatsapp/items.tsv:77`), done through
`dxb-watch-links`, not `dxb-rival-intel`:
- `rows/2-batch3.jsonl` W076: *"ikisi de watchall.sh ile tamamı izlendi (110 + 113 kare, 10 + 10 sayfa, hepsi okundu)"*
  — `watchall.sh:3` builds **"labelled 4x3 contact sheets"**, exactly the grid this task forbids (*"Contact sheet / grid
  YASAK"*). Verdict there: puan 2, öneri "İzle", tahta B43 · B33 · B28.
- `rows/1-batch4.jsonl` W076 (the other reader of the same item): *"yalnız başlık metni okunabildi, videolar
  izlenemedi"*, tür "gürültü", öneri "Gerek yok". The two rows of one review contradict each other.
- The Turbo decisions carry it: `turbo/kararlar.md:9` (project 4, *"kreatifi stüdyo yerelde üretir (… W076 yönetmen
  ajanı)"*) and `:13` (project 8, *"stüdyoya editor-brain/yönetmen ajanı (W104/W076)"*), `gelir-turu/projeler.jsonl`
  sıra 4. That is the Excel-Turbo source's ground (reader of `sources-excel-turbo`), not a rival report.

Verdict: **ran: no** (0/223 frames read under the rival law, 0 of 2 reports, ledger not moved, B43 untouched).
A contact-sheet viewing and a revenue framing exist under W076; they do not satisfy his frame-by-frame order.

## Items

### T-1 — Watch source 39 (Seedance vs local MiniMax H3) frame by frame with sound; write `39-dcnclj.md`
- Says: *"223 karenin 223'ü tek tek açılacak … Rapora diskteki kare sayısı ile açılan kare sayısı yazılacak (`110/110`…)"*
- Done already: no. Frames and video deleted 2026-09-21 (`d38c28ea`); transcript 39 remains. The file's own rule *"Malzeme … hazır. Yeniden indirme."* is no longer true; `scripts/rival-intel/fetch.sh` rebuilds media and frames from the URL with a hash check (per `00-ARCHIVE.md` amendment in `d38c28ea`) — whether the reel is still online is UNVERIFIED.
- On the board: B22 — *"rows 39 and 40 are owed to B43"*.
- Would integrate into the holding: an outside proof of the studio's own free local H3 road for ad work (B43 lane ①).
- Layer: L8
- Board: note for row B22 — the material is gone; to do it his way needs a re-fetch (his word, since his sweep removed it) or he settles 39 on the transcript + W076; until then `NEXT: 39` points a session at frames that do not exist.

### T-2 — Watch source 40 ("Agent 2", a creative-director agent) frame by frame with sound; write `40-dcbpe7.md`
- Says: *"Bu bir EKRAN brief'idir, sıralama değil. Hedef: B43 (DxB Media Studio) için ne inşa edileceğini görmek."*
- Done already: no (same as T-1; transcript 40 remains).
- On the board: B22 (same cell).
- Would integrate into the holding: the screen design input for the studio tab B43/B32.
- Layer: L8 (input to the L7 studio screen)
- Board: note for row B22 (same note as T-1).

### T-3 — Set ledger rows 39 and 40 to `reported`
- Says: *"Ledger satırlarını `reported` yap."*
- Done already: no — `00-LEDGER.md:446-447` `fetched`.
- On the board: B22 (its count line "31 reported · 7 skipped · NEXT 39").
- Would integrate into the holding: the rival ledger tells the truth about what was watched.
- Layer: L6
- Board: nothing to write — follows T-1/T-2; part of B22.

### T-4 — Write the rival's architecture into B43, evidence-labelled, LAW A on contradictions
- Says: *"B43'e işle — mimariden DXB'ye alınacak olanı, kanıt etiketleriyle … çelişen metin silinir, yerine ölçülen yazılır."*
- Done already: no — B43 row file has 0 mentions.
- On the board: B43 — *"The studio screen is not drawn (waits on B32 …)"*.
- Would integrate into the holding: the studio screen is designed from a measured rival instead of from nothing.
- Layer: L7
- Board: note for row B43 — "rival 39/40 reading owed (B22); input to the screen drawing B32".

### T-5 — `node scripts/governance/ledger-truth.mjs` green after the change
- Says: *"`pnpm` denetimi: `node scripts/governance/ledger-truth.mjs` yeşil olmalı."*
- Done already: n/a (nothing changed); not run by this reader (write-one-file job).
- On the board: NONE (a step of T-3).
- Would integrate into the holding: the ruler that keeps the ledger honest.
- Layer: L1
- Board: nothing to write — a verification step, not work.

### T-6 — Report to him in Turkish, with the frame count
- Says: *"CEO'ya raporla — Türkçe, rakamla, kaç kare açtığını söyleyerek."* · *"Rapor CEO'nun gözüne girmeden kabul edilmiş sayılmaz (LAW B)."*
- Done already: no.
- On the board: B22 (CEO reads it).
- Would integrate into the holding: his eye on the reading (LAW B).
- Layer: L8
- Board: nothing to write — the end of T-1/T-2.

### T-7 — One screen: the director agent's conversation on the left, the produced assets as cards on the right
- Says: *"Solda Creative Director sohbeti, sağda üretilen varlıklar kart olarak — konuşma ve üretim aynı ekranda"* (t012, t072, V — read by the preparing session on 7 frames only)
- Done already: no — B43 names a director seat (`B43.md:16` *"director, scriptwriter, storyboard …"*); the screen is not drawn.
- On the board: B43 / B32 — *"The studio screen is not drawn (waits on B32)"*.
- Would integrate into the holding: the studio tab shows the work moving between him, the director seat and the output — the "alive" law applied to the studio.
- Layer: L7
- Board: note for row B43 (screen input for B32), after T-2 verifies it.

### T-8 — Provenance on every asset: which model made it, and whether it was edited
- Says: *"KÖKEN KAYDI — en önemli bulgu: her üretilen varlığın altında `+more · No edits · GPT Image 2`"* (t044, V)
- Done already: partly — company `public.media_jobs` (32 rows, SELECT 2026-10-14) records `kind` (still 26 · probe 3 · shoot 3), `params` keys (`prompt/seed/steps/w/h…`), `wall_seconds`, `peak_vram_mib`, `output_path`; **no engine/model or edit-count field**. B43 has 0 "provenance" mentions.
- On the board: B43 leg *"shot router as data"* and *"long-form job/scene/shot records"* (`B43.md:42`, "Not built, each on his word") — closest owner; provenance itself is not named.
- Would integrate into the holding: every clip he accepts or rejects says which engine made it and at what cost — the cost dial and router learn from it.
- Layer: L4 (job records) shown in L7
- Board: note for row B43 — add "per-asset engine + edit count" to the job/scene/shot records leg.

### T-9 — Character sheet (figure + expressions + poses) for consistency across shots
- Says: *"Tam karakter sayfası (figür + yüz ifadeleri + pozlar)"* (t020, V)
- Done already: partly — `B43.md:16` *"every hero frame, product reference and character sheet is an IMAGE made here … on this station the cast is born in the engine (2026-09-04 / 2026-09-14)"*; the reference-set keeper seat exists.
- On the board: B43.
- Would integrate into the holding: a client's cast stays the same face in shot 1 and shot 150.
- Layer: L3 (seat) / L8
- Board: nothing to write — already owned by B43's reference-set road; T-2 can confirm.

### T-10 — The agent writes the prompts for several models itself (ChatGPT Image 2.0, Nano Banana Pro, Seedance 2.5)
- Says: *"modelleri kendisi promptluyor: ChatGPT Image 2.0, Nano Banana Pro, Seedance 2.5"* (T)
- Done already: no — `B43.md:42` *"shot router as data"* is "Not built, each on his word"; the three lanes are decided (`B43.md:16`).
- On the board: B43 (router leg).
- Would integrate into the holding: one brief, routed per shot to the right engine across the three lanes.
- Layer: L2 (routing) for L8
- Board: nothing to write — owned by B43's router leg.

### T-11 — The agent corrects its own error unasked (the man already wearing a watch)
- Says: *"kendi hatasını söylenmeden düzeltiyor (saat takan adamın zaten saati varmış)"* (T)
- Done already: partly — B43 open leg *"the QC list"*, continuity QA seat and Failure seat's cure table exist (`B43.md:16,42`, persona commit `8b36444d`).
- On the board: B43 (open legs: continuity rule untried in production, QC list).
- Would integrate into the holding: continuity QA catches a contradiction before he sees the clip.
- Layer: L4
- Board: nothing to write — owned by B43's open QC/continuity legs.

### T-12 — Reuse by gesture: drag a liked image, "the same close-up for the other characters"
- Says: *"beğenilen görsel sürüklenip 'aynı close-up'ı diğer karakterler için' deniyor"* (T)
- Done already: no.
- On the board: B43/B32 (screen not drawn).
- Would integrate into the holding: he directs with one gesture instead of a new brief — *"yönetmen sensin, kontrolü asla kaybetmiyorsun."*
- Layer: L7
- Board: note for row B43 (screen input for B32), with T-7.

### T-13 — Local H3 against paid Seedance on Higgsfield's openly shared references and prompts
- Says: *"Higgsfield'ın açık kaynak yaptığı araba reklamı — referanslar ve promptlar paylaşılmış · aynı referans + aynı prompt Dell T2 tower'da yerel H3'e … tam sekans 19–20 dakika · araba shot'u 4 dakika / 5 saniye · 'Tek kuruş ödemedik.'"* (T; transcript 39 confirms "19 minutes", "four minutes, it's a five second shot")
- Done already: no on our card — W076 (`2-batch3.jsonl`) notes the times are the creator's and *"bizim RTX 5060 Ti 16 GB'ımızda ölçülmedi, ⚠ doğrulanmadı"*, and proposes the pack as a ready benchmark. Our own measure quoted there: 15 s 1152×640 ~10 min, $0.00 (`gelir-baglam.md`, not re-measured by this reader).
- On the board: B33 (the bench — capacity by clip length) / B42 (W076 cites the CEO's own H3 finding there).
- Would integrate into the holding: a measured quality-and-time comparison of our free lane against the paid leader on the same input — the number the agency sells on.
- Layer: L8
- Board: note for row B33 — the Higgsfield car-ad pack as a fixed A/B test, if he wants it.

### T-14 — His decision: the rival product is not bought; take its architecture
- Says: *"nVideo satın alınmayacak — 'nvideo sanırım pahalıydı biz onsuz yapıp sistemini alabiliriz.'"* (2026-08-31)
- Done already: not registered — 0 hits in `ceo-approvals.json`, the ledger and B43 for nvideo/invideo (the ledger's 2 grep hits are "hunyuan**video**"). The studio's own road (16 seats, three lanes) already follows it in practice.
- On the board: NONE.
- Would integrate into the holding: money out avoided; the architecture is built in-house.
- Layer: L5
- Board: nothing to write as a row — a decision, not work; the lead may carry it into B43's text when T-4 is done.

## Reader notes

- **His words in the file require:** *"bunu ikisini kare kare izlem gerekli çok önemli"* — frame by frame, with
  sound, *"223 karenin 223'ü tek tek"*, no grid; *"onun sistemini çok iyi analiz edip ekranlarını falan, onun gibi bir
  şeyi de bu satırlara ekleyebilirsin"* — the destination is B43; *"nvideo … biz onsuz yapıp sistemini alabiliriz"* —
  architecture, not purchase. Ledger law 11: the report opens with `WHY IT MATTERS TO THIS HOLDING`.
- **Contradiction 1 (needs his word):** his 2026-08-31 order (watch frame by frame) vs his own 2026-09-21 sweep that
  deleted the frames and videos (*"Rakip videoların şeyine ihtiyacımız yok herhalde"*). The board (B22 *"owed to B43"*)
  and the ledger (`NEXT: 39`) still say the work is owed and the file says *"diskte hazır"* — both false about the
  material. Authority order: his later order deleted the material, not the owed reading. Put to him in one line:
  re-fetch 39/40 and watch them his way, or settle them on the transcripts plus W076, or drop them (then silence).
- **Contradiction 2:** W076's two rows disagree (*"videolar izlenemedi … Gerek yok"* vs *"tüm kareler okundu … İzle"*),
  and the "watched" row used 4x3 contact sheets, which this task bans for rival reading. W076 must not be counted as
  rows 39/40 being watched.
- **Name UNVERIFIED:** the file says "nVideo" and `ai.nvideo.io` (1 frame, t012); transcript 40 has Whisper's
  "Agent 2 by NVIDEO"; W076 names invideo.io "Agent Two" from its product page. Which is right cannot be checked
  without the frames.
- Video 40's cast includes women (W076 note); the studio's own-content rule (memory: own cast men and older women,
  women only if the client asks) applies to anything copied from it.
- No candidate new row: every item is owned by B22 (the reading), B43/B32 (the screen, router, records, QC) or B33
  (the bench). Three notes: B22 (material gone — his word), B43 (screen inputs T-7/T-12 and provenance T-8), B33 (A/B pack T-13).
