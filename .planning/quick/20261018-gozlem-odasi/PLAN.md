# Gözlem Odası — the plan (board row B82)

**Status:** rewritten 2026-10-18 on his word — simple, pragmatic, no bureaucracy (HIS-WORDS §9-10). His yes is to this
shape <!-- CEO-OK: gozlem-odasi-simple-plan-2026-10-18 -->; his eye is on this written text too (2026-10-18, "Onaylıyorum")
<!-- CEO-OK: gozlem-odasi-plan-eye-2026-10-18 -->. It is built when its time
comes: the factory's full start (HIS-WORDS §4). It replaces the first, heavier draft of the same day entirely; `team/`
keeps only that draft's research ground (FACTS.md: X access, the watchlist); its five design files were deleted on his
word.

## Bölüm 1 — plan (Türkçe)

**Bitince ekranınızda ne olur:** Listenizdeki biri holdinge yarayan bir şey paylaştığında; kimin neyi paylaştığı,
holdingin neresine yarayacağı ve denemeye değip değmediği size kısa bir notla gelir. Yaramayan hiçbir şey gelmez.

**Bunu kanıtlayan tek komut:** `pnpm exec vitest run tests/b82` — bugün X'ten toplanan yaklaşık 600 paylaşımla koşar:
bilinen işe yarar paylaşım size ulaşır; abartı ve gürültü ulaşmaz.

**Nasıl çalışır**
- Kim: tek ajan, holdingin mevcut çalışanı Pazar İstihbaratı Lideri. Araştırma yapmaz, takip eder.
- Ne zaman bakar: iki üç günde bir; listedeki her kişinin o aralıkta paylaştıklarına bakar.
- Kimi takip eder: izleme listesi sayfasındaki kişiler (https://claude.ai/artifact/D2Tg7ri7hLGXfxaMz2fZw2). Kaynaklar:
  X, YouTube, Instagram ve yapay zekâ haber siteleri. YouTube, Instagram ve sitelerden kimlerin gireceği kurulurken
  aynı sayfaya eklenir ve size gösterilir. Siz "bunu da takip edin" derseniz o hesap listeye girer.
- Nasıl karar verir: paylaşımı okur ve sorar: holdingin işine yarar mı, neresine yarar, bizde zaten var mı? Yaramayanı
  kendisi eler. Okumayı en ucuz model yapar, hükmü Opus verir. Verdiğiniz kararlar ajanın önünde örnek olarak durur;
  "işe yaramadı" dediğiniz türden şeyler bir daha gelmez.
- Size ne gelir: işe yarayan bir şey bulununca sabah brifinginde kısa bir not: kim paylaştı, ne paylaştı (bağlantısıyla),
  holdingin neresine yarar, önerisi (deneyelim ya da rafa kalsın). Bir şey yoksa hiçbir şey gelmez; ekranda oda en son
  ne zaman baktığını ve bir sonraki bakışını gösterir.
- Deneme: siz "deneyin" deyince başlar, holdingin olağan bir işi olarak yapılır. Kurulum ya da para gerekirse yine size
  sorulur.

**Hesabınızın güvenliği — üç kural, hepsi bu**
- X'te ve Instagram'da yalnız okur: hiçbir şey yazmaz, beğenmez, takip etmez.
- X'e giden her okuma tek kapıdan geçer: aynı anda tek okuyucu ve az okuma. X "yavaşla" derse durur; uyarı sayfası
  gösterirse her şey durur ve size söylenir. Bu kapı bugün yapıldı; araştırma oturumlarını da şimdiden sınırlar.
- Paylaşım bilgi sayılır, emir değil: hükmü veren yapay zekânın elinde hiçbir araç yoktur.

**Adımlar (vakti gelince)**
1. X kapısı — bugün yapıldı.
2. Liste ve okuyucu: X, YouTube, Instagram, siteler.
3. Ajanın elemesi ve Opus'un hükmü; bugünkü 600 paylaşımla sınanır.
4. Size gelen not ve ekrandaki satır.
5. Fabrika tam başlayınca oda kendi saatinde çalışmaya başlar.

**Riskler**
- Ajan iyi bir şeyi kaçırabilir ya da gereksiz bir şey getirebilir. Kararlarınız ona örnek olarak geri döner; kaçırdığı
  bir şeyi siz görürseniz o da örneklere eklenir.
- X çok okuyan hesabı kısıtlayabilir; kapı okumayı az ve aralıklı tutar.

## Part 2 — the engineer's notes (English)

- **Row and contract.** Board row B82. The owning contract is CAPABILITY_ARSENAL_DOCTRINE §8/§9 (B42's people lane),
  adapted there at build in one registered paragraph: the watch lane, and a judge with no tools for untrusted content.
- **Reading.** X through the research door exactly as a research session reads it today: `opencli twitter search` with
  `from:` batches (one search covers many accounts), a thread read only for a candidate, every call through
  `scripts/xgate.py` as caller `room` (≤ 50 a day; a pass is a handful of calls). No separate browser and no new copy
  of his session. YouTube through the door's YouTube channel, no login; sites through RSS or the door's fetch;
  Instagram through `hidden.py read` on the research Chrome, which already holds his Instagram session — a handful of
  reads a pass, and an Instagram gate like X's only if Instagram ever pushes back.
- **Judging.** Cheapest first: the triage on Jev (B64 decision 7, Sonnet 5.5 on doubt), the reading on the cheapest
  model that passes the step-3 test; the verdict alone on Opus 5.5, a bare call with no tools and no MCP, the posts given
  to it as quoted data. His past verdicts (the 88-link sheet's notes, his answers to the room) go in as examples. "Do we
  have it already" reads our own stack before a note is written.
- **Data.** Two company tables: `watch_sources` (platform, handle, added_by, added_at) and `watch_seen` (the post's key,
  the verdict, the note), so nothing is judged twice and the screen can say when it last looked. A finding is a line in
  `v_ceo_briefing`; his "deneyin" becomes ordinary work.
- **Schedule.** One `dxb-scheduler` job every two days (jittered) from the factory's full start; no resident service.
  A closed X gate skips X and says so; the other platforms still run.
- **Proof.** `tests/b82/` with a small cut of the frozen reads of 2026-10-18 (all of them outside the repository:
  `~/.local/share/dxb/gozlem-odasi/raw-2026-10-18/`): a known good release reaches the note; a hype post and a week of
  noise produce no note; something we already hold stays silent; a post that says "ignore your instructions" changes
  nothing.
