# SPOKEN WORD LANE RAPORU — YouTube/Bilibili (Astra 6 vs Fable 5.1, kod kalitesi)

**A) OKUDUĞUM KAYNAKLAR**
- Zemin taraması: iki ayrı `ground` klasöründeki `youtube.raw` (TR sorgu: 19 video, EN sorgu: 20 video) ve `bilibili.raw` (16 kayıt, konuyla neredeyse hiç ilgisi yok — bilibili bu konuda kanal değil).
- Bizzat okuduğum, tam transkript çektiğim **10 YouTube videosu** (`opencli youtube transcript`, toplam ~230.000 karakter altyazı metni):
  1. Bart Slodyczka – "I Made GPT-6 Astra and Fable 5.1 Build the Same App (RAW RESULTS)" (133k izlenme) — 26.770 karakter
  2. tef – "ChatGPT 6 Astra vs Claude Fable 5.1 Make GTA 6" (277k) — 11.875 kr
  3. Nate Herk – "I Tested GPT-6 Astra vs Fable 5.1 on 15 Real Use Cases" (374k) — 50.605 kr (38 dk'lık tam transkript)
  4. Chase AI – "No Hype Assessment" (413k) — 24.257 kr
  5. Lukas Margerie – "Same Prompts, Real Results" (91k) — 11.272 kr
  6. Dubibubi – "100M+ Tokens Used" (68k) — 18.965 kr
  7. Ferdy Korpershoek – "Who Builds Better Websites?" (36k) — 17.407 kr
  8. Agentic Ai – "It Won 11 Tests and Still Lost" (867 izlenme, benchmark-analiz videosu) — 15.752 kr
  9. Paul J Lipsky – "Real Work (Here's What Matters)" (134k) — 26.139 kr
  10. Uğur Keşkekçi (TR) – "GPT-6 Astra Geldi: Fable 5.1'den Daha mı İyi? (Fortnite)" (26k) — 26.983 kr
- **5 videonun yorumlarını** çektim (`opencli youtube comments --limit 100`, her biri 20 yorum döndürdü — API sayfa sınırı, "100" istememize rağmen): Bart (20), tef (20, 18 tekil), Nate Herk (20), Chase AI (20), Paul Lipsky (20) = **98 tekil yorumcu**.
- Kapak: Google/DuckDuckGo tarafında bu soruya dair YouTube-özel bir tartışma yoktu; zemin sadece video listesini verdi, içeriği ben okudum.

**B) SAYIM (n=10 video, sadece KOD/UYGULAMA ÜRETİMİ odaklı olanlar)**
- **Astra lehine net eğilim: 5/10** (Bart, Nate Herk, Lukas Margerie, Dubibubi, Paul Lipsky)
- **Fable lehine estetik eğilim: 1/10** (tef — ama kendisi de "Astra istemi daha iyi takip etti" diyor, karışık)
- **Çok yakın / net kazanan yok / nüanslı çelişki: 4/10** (Chase AI, Ferdy, Agentic Ai, Uğur Keşkekçi)
- **Saf kodlama benchmark'larında** (Agentic Ai videosu, yayıncı tabloları): DeepSWE v1.1 Astra 74.1 – Fable 67.4; Terminal-Bench 4.0 Astra 57.7 – Fable 55.8; FrontierCode 1.1 Astra 53.3 – Fable 50.9 → **Astra 3/3 kazanıyor ama fark 2-7 puan, "gerçek geliştirme ortamında fonksiyonel eşitlik" deniyor**. Buna rağmen bağımsız "coding agent index"te Fable 70-67 önde — yani ham benchmark Astra'ya, toplu/pratik güvenilirlik endeksi Fable'a.
- Nate Herk'in en beğenilen yorumu (134 beğeni) 15 kullanım-durumunun manuel dökümünü çıkarmış: Astra 10 – Fable 5 (ama bunlar kod-dışı görevleri de kapsıyor: vergi, satış metni, araştırma vs.).
- Dubibubi videosunda **31 kişilik canlı Instagram anketi**: %74 Astra, final skor 9-3 Astra.

**C) SESLER — doğrudan alıntı**
- Bart Slodyczka (video sahibi, düzeltme yorumu, 11 gün önce): *"I think GPT [w]on the majority of tests, but Fable won the CRM test."*
- tef (video içi, 8:16): *"I like Claude Fable 5.1['s] GTA 6 inspired game a little bit better than [GPT] Astra['s]... [but] it followed my prompt better."* — kodun görünürlüğü Fable, talimata sadakat Astra.
- Nate Herk (37:29): *"my experience has been that Astra feels quicker and feels more efficient... I'm heavily leaning towards Astra for my day-to-day."*
- @db6856 (Nate Herk yorumu, 134 beğeni): *"TL;DR: Astra wins 10-5"* (görev görev döküm).
- @elpepelucho (Chase AI yorumu, 412 beğeni, yazılım mühendisi): *"I'm a software engineer and my employer only provides us with opus 4.7... it completely blows me away at how good it is at coding."* — Astra 6 değil, mevcut Fable ailesine övgü; kıyas dışı ama kod kalitesi algısını gösteriyor.
- Agentic Ai (0:06): *"OpenAI's new GPT-6 Astra systematically dismantles Anthropic's Claude Fable 5.1 across 11 highly complex domain benchmarks, but independently verified aggregate indices still rank Fable 5.1 as the superior overall model."*
- Agentic Ai (2:44): *"Because the gap is so narrow, Astra does not represent a massive leap in software engineering."*
- Dubibubi (17:35, izleyici anketi sonucu): *"Astra won by a landslide... 74% of you agreed."*
- Uğur Keşkekçi (TR, 19:59): *"GPT kesin kötü değil. Hatta silah olayı daha iyi bence GPT'de... aynı bile diyebiliriz."* (çok yakın, karar veremiyor)
- @MaxGrossenbacher (Bart videosu yorumu, 94 beğeni): *"It is undeniably frustrating when a video promises a definitive conclusion... only to withhold a clear verdict by the end."* — izleyiciler net kazanan istiyor ama çoğu içerik üretici tereddütlü.

**D) KAPANAN KAPILAR**
- Bilibili: 34-35 dakikalık video listesi tamamen alakasız (Ermeni müziği, Çince hip-hop, dini vaaz) — konuyla ilgili tek bir gerçek "test" videosu yok; sadece GPT-6 Astra'nın tek başına tanıtımı var (Fable karşılaştırması yok). **Kapalı kapı: Bilibili'de bu soruya cevap yok.**
- `opencli youtube comments`, `--limit 100` istenmesine rağmen her video için sabit **20** yorumla döndü (API/adaptör sayfa sınırı) — 5 video × 20 = 100 yorum okundu, daha fazlası istense de gelmedi.
- Ferdy Korpershoek videosu bir "nasıl yapılır" eğitimi çıktı, kod-kalitesi kıyası içermiyordu; kapıyı açtım ama içeride aradığım veri yoktu.

**E) OKUDUĞUM AYRI İNSAN SAYISI**
**~108 kişi**: 10 video sahibi/anlatıcısı (Dubibubi ve Uğur Keşkekçi kanalları ikişer konuşmacı kullanıyor, o yüzden gerçek konuşan sayısı biraz daha yüksek) + 98 tekil yorumcu.

**F) NEYİ ÇEVİRİRDİ**
Kendi kodlama ajanı deneyimi olan, "büyük kod tabanında refactoring" yapan biri henüz konuşmadı — @zachariah380'in Chase AI'a yorumu tam bunu talep ediyor (*"I want someone to do some large codebase work and refactoring... almost every video is about one-shotting something pretty"*). Şu ana kadar okuduğum 10 video da tek seferlik "sıfırdan uygulama/oyun kur" testleri; gerçek üretim kod tabanında (mevcut kodu okuma, hata ayıklama, çoklu dosya refactor) bir karşılaştırma bulunsaydı, sonuç tersine dönebilirdi — çünkü Agentic Ai'nin benchmark verisi zaten "agregatif kodlama endeksinde Fable önde" diyor, ve bu tam olarak büyük-kod-tabanı senaryosuna denk düşüyor. Bu spesifik videoyu (refactoring odaklı) aramadım, zemin taramasında da yoktu.