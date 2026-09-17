# YouTube & Bilibili Hunter Raporu — AI Kodlama Ajanları Üretim Deneyimi (2026 Sonbahar)

## A) NE OKUDUM

**Ground sweep'ten kullanılanlar:** `ground/youtube.raw`, `ground-2/youtube.raw`, `ground-3/youtube.raw` (3 ayrı dilde/varyantta arama, toplam 52 video başlığı) ve `ground/bilibili.raw`, `ground-2/bilibili.raw`, `ground-3/bilibili.raw` (24 Bilibili sonucu). Google/DuckDuckGo diğer hunterlara ait, ben sadece kendi kulvarımı (YouTube+Bilibili) okudum.

**Tam transkript okuduğum 9 YouTube videosu** (opencli youtube transcript + yt-dlp fallback, toplam ~183 dakika konuşma):
1. Axel Molist — "What 6 months of AI coding did to my dev team" (12:30, 554K görüntülenme)
2. Lars Faye — "people are lying about agentic coding" (7:39, 147K) — opencli caption boştu, yt-dlp ile alındı
3. Amigoscode — "AI Replacing Developers Has Officially Failed" (18:11, 144K)
4. Theo (t3.gg) — "Claude Code vs Codex vs Cursor (an honest comparison)" (37:57, 169K)
5. Tech With Tim — "Codex vs Claude - an Honest Comparison" (22:56, 120K)
6. Nate Herk — "100 Hours Testing Claude Code vs ChatGPT Codex" (26:34, 147K)
7. corbin — "Cursor Projects Just Killed ChatGPT Codex, Claude Code…" (8:51, 17K)
8. AI LABS — "It's Broken… The Codex vs Claude Code Debate Is Finally Over" (15:53, 83K)
9. Your Average Tech Bro — "Cursor vs Codex vs Claude vs Zed vs Anti-Gravity" (32:54, 163K)

**Yorumlar** (opencli youtube comments, her biri 20 kayıt döndü): Axel, Lars, Tech With Tim, AI LABS, Theo videolarının yorum bölümleri = 100 yorum.

**Bilibili:** opencli `bilibili subtitle`/`bilibili video` komutları çöktü ("Navigation rejected" / geçersiz JSON) → `opencli browser bilibili open+extract` ile (CEO'nun oturumuyla) HexUp'ın "Claude Code、Codex、Cursor该怎么选" videosunun sayfasını açıp danmaku (uçuşan yorum) metnini ve ilgili video başlıklarını okudum. Video altyazısı giriş gerektiriyor, tam transkript alınamadı.

## B) SAYIM (n=9 video + n=100 yorum + Bilibili sayfa verisi)

- **Araç tercihi sinyali (9 video creator + yorumlardan):** Codex'i öne çıkaran/geçiş yapan: 5 (AI LABS, Tech With Tim'in kendi tercih notu "value winner=Codex", Your Average Tech Bro'nun Şubat 2026 kararı, HexUp'ın 2. Bilibili videosu başlığı "3 ay Codex kullandım, Claude Code'a dönmek istemiyorum", yorumlarda @mahaveerjain1549 "şirketimiz Claude'dan Codex'e tamamen geçti")
- **Claude Code'u öne çıkaran/derinlik için tercih eden:** 4 (Nate Herk — ön uç/tasarımda Claude kazandı, Theo — "motivasyon ve duygu" için Claude, AI LABS'ta UX/planlama tarafında Claude üstün, Axel Molist'in ekibi zaten Claude Code+Cursor kullanıyor)
- **"İkisini birden kullanıyorum" tavsiyesi:** 3 açık öneri (Tech With Tim, Nate Herk, Your Average Tech Bro) — bu en sık tekrarlanan sonuç
- **Cursor'ı 3. sıraya düştüğünü söyleyenler:** 2 (Theo: "cursor far and away first place'ten third'a düştü"; Your Average Tech Bro Cursor'ı hâlâ günlük editörü olarak kullanıyor ama model sağlayıcısını ayrı alıyor)
- **Yorumlarda somut "terk ettim/şirketimiz değiştirdi" ifadesi:** 3/100 (mahaveerjain1549, NoNowwwell, Johan-rm6ec)
- **Ekip/üretim yorgunluğu-review darboğazı temasını doğrulayanlar:** 3 video (Axel Molist, Amigoscode/Uber örneği, Lars Faye)

## C) SESLER (verbatim alıntılar)

1. **@mahaveerjain1549** (Tech With Tim yorumları, ~2 hafta önce): *"Our company initially used Claude but has now completely switched from Claude to Codex."*
2. **@Johan-rm6ec** (AI LABS yorumları, ~4 ay önce): *"I use both, and i had to take Claude of my project fighting with visual studio. Codex is almost finishing the project. My experience is over various projects. Claude is problematic."*
3. **@PixPunxel** (Axel Molist yorumları, ~3 ay önce): *"Company I work at started using AI because they were impressed by how fast it can output actual results. Now after several months of using it they are going back to regular coding because actual debugging it and shipping ready features have became nightmare."*
4. **Axel Molist** (video, 20 gün önce yayınlandı): *"One of our senior engineers came to me... 'I didn't actually read all the code. I couldn't read all the code. There was too much of it. What do I do now?'"*
5. **@Shoxmastex** (Axel Molist yorumları, 701 beğeni): *"Juniors used to take 6 months draining the team to become productive, now they can start using AI on the first week and drain the team doing code reviews forever :D"*
6. **Theo, t3.gg** (video): *"Cloud isn't getting the lock in that anthropic wants it to get... Cloud code for unmotivated devs or bad devs that want to feel like they're productive. Codeex for skeptical devs that want to use these tools in a way that is productive... Cursor for people that want to set their teams up for success."*
7. **@t3dotgg** (kendi videosuna yorum, kanıt niteliğinde tarih damgası): *"Guys it's been 2 weeks. my Claude Code sub ends on the 28th (2 days from now). Chill."*
8. **AI LABS** (video): *"After [the 2.1.0 update]... things started going downhill for Claude code... they removed the dangerously skip permissions mode and replaced it with auto mode by default."*
9. **Lars Faye — @ayecab** (yorum, 499 beğeni): *"It's funny how the failures of tech that's supposed to remove skill barriers is explained by claiming you don't have the skills to use it."*
10. **Your Average Tech Bro** (video): *"If I could only pick one, I would do probably Cursor and Codex as my go-to model provider and editor solution... GPT 5.3 Codex has really impressed me, and I might even argue that it's better than Claude code models."*

## D) KAPANAN KAPILAR

- **Bilibili `opencli bilibili subtitle`** → `COMMAND_EXEC: Navigation rejected` (2 kez denendi) — açık kapı: `opencli browser bilibili open/extract` ile sayfa açıldı, danmaku metni alındı, ama gerçek video altyazısı/transkripti bilibili girişi gerektirdiği için erişilemedi.
- **Bilibili `opencli bilibili video`** (metadata) → geçersiz JSON hatası, siteden HTML döndü.
- **`yt-dlp` ile Bilibili altyazısı** → "Subtitles are only available when logged in" (cookie olmadan).
- **Lars Faye videosu `opencli youtube transcript`** → "Caption URL returned empty response" — açık kapı: `yt-dlp --write-auto-sub` ile İngilizce otomatik altyazı başarıyla alındı.
- Bilibili yorum bölümü (gerçek "评论" alanı, danmaku değil) shadow-DOM/dinamik yükleme nedeniyle `extract` ile görünmedi; scroll denemesi ilgili video listesine ulaştı ama yorum metnine ulaşamadı.

## E) FARKLI KİŞİ SAYISI

**~109 farklı insanın kendi sözlerini okudum:** 9 video anlatıcısı/yaratıcısı (Axel Molist, Lars Faye, Amigoscode/Nelson, Theo, Tech With Tim, Nate Herk, corbin, AI LABS ekibi, Your Average Tech Bro) + 100 farklı YouTube yorumcusu (5 video × 20 benzersiz yorum). Bilibili'den gelen 4 danmaku mesajı anonim/kimliksiz olduğu için bu sayıma dahil etmedim.

## F) NE OLSA CEVABI TERSİNE ÇEVİRİR

Şu anki tablo şöyle: **kararsız/orta yol** baskın — çoğu creator "ikisini de al, farklı işler için farklı araç" diyor; somut "şirketçe tamamen terk ettik" ifadesi sadece 1-2 yorumda var (n=100 üzerinden zayıf sinyal). Bunu tersine çevirecek şey: **büyük ölçekli (>50 kişilik mühendislik ekibi) bir şirketin resmi/teknik blog yazısı veya konferans konuşması** olurdu — "X ayı Claude Code'da geçirdik, Y ayında Codex'e/Cursor'a geçtik, nedenleri şunlar" diyen somut bir vaka çalışması. Şu ana kadar okuduğum her şey ya bireysel geliştirici/YouTuber testi ya da 20 kişilik tek bir ekibin (Axel Molist/WeUseAI) anekdotu — kurumsal ölçekte "terk ettik" diyen tek bir kaynak görmedim. Ayrıca Anthropic'in Opus 4.7/4.8'in "gerileme" olduğu iddiası (Theo) doğrulanırsa veya çürütülürse tablo tamamen değişir; bunu aramaya gitmedim, sadece Theo'nun tek taraflı iddiası olarak not ediyorum.