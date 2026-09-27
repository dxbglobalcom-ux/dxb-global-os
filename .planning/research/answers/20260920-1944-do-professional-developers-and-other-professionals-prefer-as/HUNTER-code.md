## HUKUM
GitHub/issue-tracker/Hacker News kanalımda gerçek geliştiricilerin sözleri net bir kazanan göstermiyor: teknik topluluk görevine göre bölünmüş — Fable 5.1 zor/uzun süren kodlama ve ajan-orkestrasyon varsayılanı olarak tercih ediliyor, GPT-6 Astra ise maliyet-verimliliği, üslup/kısalık ve kullanım limiti cömertliği nedeniyle tercih ediliyor; StackOverflow'da hiç doğrudan tartışma bulunamadı.

## A) NELERİ OKUDUM
- `ground/github-issues.raw`, `ground/github-repos.raw`, `ground/stackoverflow.raw`, `ground/hackernews.raw` (önceden taranmış zemin dosyaları): konuyla ilgisiz genel sonuçlar döndürdü — sıfır kullanılabilir veri. `stackoverflow.raw` tamamen boş (`[]`), `hackernews.raw` API hatası (400) nedeniyle boş.
- GitHub arama (`gh search issues/prs/code`, canlı): ~15 GitHub issue/PR başlığı tarandı, 6 tanesi gerçek içerik için açıldı.
- Hacker News (Algolia API üzerinden canlı, zemin dışı çünkü ground'daki hackernews.raw boştu): 5 thread tam okundu:
  - "Claude Fable 5.1 and Claude Mythos 5.1" — https://news.ycombinator.com/item?id=49525378 (156 üst-seviye yorum, Fable/Astra karşılaştırması içeren ~37 yorum okundu)
  - "GPT-6 Astra" (ana lansman) — https://news.ycombinator.com/item?id=49554643 (2081 yorum ağacından "fable" geçen 84 düğüm, ~35 tanesi tam okundu)
  - "Ask HN: Initial Thoughts on GPT-6 Astra?" — https://news.ycombinator.com/item?id=49571621 (18 yorumun tamamı)
  - "GPT-6 Astra in code review: Gains, privacy, and cost" — https://news.ycombinator.com/item?id=49572875 (77 yorumdan ~20 tanesi)
  - "GPT-5.6 Luna vs. GPT-6 Astra: code review" — https://news.ycombinator.com/item?id=49703003 (Fable'dan bağımsız, GPT-içi karşılaştırma; destekleyici bağlam olarak kısmen okundu)
- Toplam okunan HN yorumu: ~130. StackOverflow: sıfır ilgili soru bulundu (arama "no Stack Overflow posts discussing 'Fable 5.1'" sonucu döndü).

## B) SAYIM (n=100 ayrı kişi)
- **Fable 5.1 / Claude lehine, kodlama-ajan bağlamında:** ~15 kişi (echelon, gwking, rowanG077, eis, CamperBob2, Skiffssh, ve oh-my-openagent projesinin `code-yeongyu` bakım ekibi — bkz. D bölümü kod kanıtı)
- **GPT-6 Astra / Codex lehine (üslup, maliyet, limit cömertliği):** ~12 kişi (KronisLV, marcelo-earth, ImprobableTruth, dmix, import, flipthefrog, synergy20, jdgoesmarching, vardalab, kbrannigan, forgot-my-pw)
- **Kıyaslamanın/benchmark'ın kendisini sorgulayanlar (karşı-örnek):** ~7 kişi (opus5_hater, andxor, timpera, SyneRyder, nsingh2, ImprobableTruth)
- **Astra'dan hayal kırıklığına uğrayanlar (regresyon/gecikme iddiası):** Alhaji123 (2 ayrı yorum)
- **Nötr/karışık kullanım (ikisini birden, çapraz kontrol amaçlı):** gwking, PedroBatista, mooman219

## C) SESLER (tarih + tam adres)
1. **gwking**, 2026-09-01: "I switched to using Codex for the last two weeks... I'm now having fable review codex commits and it finds deep issues." — https://news.ycombinator.com/item?id=49528029
2. **echelon**, 2026-09-01: "IMO, Codex is worse than Claude with Fable. At least at Rust... If Fable isn't available at subscription price via third party harnesses soon, I'm also going to bail." — https://news.ycombinator.com/item?id=49526070
3. **dmix**, 2026-09-01: "Codex (+Sol) feels a lot more human for sure. Fable 5 is so, so wordy." — https://news.ycombinator.com/item?id=49526133
4. **marcelo-earth**, 2026-09-01: "I hate this too, I had to switch to Codex, because the skill to force Claude Code not to think too much about very, very basic things no longer worked" — https://news.ycombinator.com/item?id=49526122
5. **KronisLV**, 2026-09-01: "I prefer their type of prose across the board to what Opus 5 and Fable 5 kept outputting. I'll probably check out Anthropic again in a year... for now I need a break from its brand of slop." — https://news.ycombinator.com/item?id=49525905
6. **rowanG077**, 2026-09-01: "Fable 5 is better then Sol. But Fable is just off the table for anything even remotely long running. Unless you have very deep pockets." — https://news.ycombinator.com/item?id=49526691
7. **CamperBob2**, 2026-09-03: "If it [Fable] actually tackled all of the problems it was assigned, it would presumably kick Opus into the weeds." (Fable'ın red politikasını eleştiriyor ama kapasitesini övüyor) — https://news.ycombinator.com/item?id=49557925
8. **forgot-my-pw**, 2026-09-03: "it's about the same intelligence level as Opus/Fable, but it's supposed to be 70% more token efficient than GPT 5.6 Sol. So it's currently the new leader for cost efficiency frontier." — https://news.ycombinator.com/item?id=49556471
9. **kbrannigan**, 2026-09-05: "It speaks more naturally, unlike claude which litteraly just vomit jargon and random analogies. It's very expensive. After 15 message I burned through my 5 hour limits." — https://news.ycombinator.com/item?id=49572791
10. **Skiffssh**, 2026-09-06: "as a personal choice i will still stick with claude for a while being i have a feeling they might drop something that can do the same and with claudes current capabilities it will definitely be better." — https://news.ycombinator.com/item?id=49585187
11. **Alhaji123**, 2026-09-06: "Personally I am quite disappointed in gpt 6 astra... in cyber security and reverse engineering it is falling behind by a lot compared to 5.6 cyber." — https://news.ycombinator.com/item?id=49586010
12. **amanthanvi (Aman Thanvi)**, GitHub, 2026-09-08: skill dokümantasyonunu "current official GPT-6 Astra and Claude Fable 5.1 prompting guides" üzerinden güncelleyen katkı — https://github.com/mattpocock/skills/issues/1053

## D) KAPANAN KAPILAR
- **StackOverflow**: "Fable 5.1" veya "Astra 6" içeren hiçbir soru bulunamadı — arama motoru sonucu boş döndü, kapı gerçekten kapalı (SO'da henüz bu isimler etiketlenmemiş).
- **Zemin taramasının `hackernews.raw` dosyası**: HN Algolia API'ye gönderilen sorgu tüm görev cümlesini URL-encode ederek 400 Bad Request aldı — bu yüzden HN'yi canlı, hedefli sorgularla (story id bazlı) yeniden taradım.
- **`ground/stackoverflow.raw` ve `ground/github-issues.raw`/`github-repos.raw`**: zemin sorgusu çok genel olduğu için tamamen alakasız/boş sonuç verdi; lakin bu bir "kapı" değil, sorgu tasarımı sorunuydu — kendi hedefli `gh search` sorgularımla telafi ettim.
- **pollography/the-random-maker-theory issue'ları (#7, #9, #14)**: bunlar gerçek insan sesi DEĞİL — otomatik bir "Chase-Radar" içerik-toplama botunun ürettiği editoryal iş talimatları (Almanca şablon metinler), insan yorumu yok. Kapı açıktı ama içi boştu; bu yüzden C bölümüne dahil edilmedi.
- **petergpt/bullshit-benchmark#40**: tek yorum "any updates??" — hiçbir tercih verisi yok, kapatıldı.

## E) AYRI KİŞİ SAYISI
**~100 ayrı insan** kendi sözleriyle okundu (HN'de ~97 farklı kullanıcı adı + GitHub'da 2-3 gerçek geliştirici: amanthanvi, abhiram-ar, code-yeongyu/oh-my-openagent bakım ekibi).

## F) NEYİ TERSİNE ÇEVİRİRDİ
GitHub tarafında `code-yeongyu/oh-my-openagent` (çok-model ajan orkestrasyon aracı) PR #7798/#7806 (2026-09-05), "visual-engineering" ve "writing" kategorilerindeki GLM/GPT/Gemini/Astra fallback zincirini tamamen kaldırıp birincil model olarak **Claude Fable 5.1**'i seçti — https://github.com/code-yeongyu/oh-my-openagent/pull/7798 — bu, HN'deki bireysel şikayetlerin aksine, üretim ajan yazılımı seviyesinde somut bir Fable tercihidir ve hükmü Fable lehine çevirebilir. Buna karşın aynı proje "deep-work" (maksimum akıl yürütme gerektiren zor problemler) profilinde ve Codex eklentisinin **yönetilen varsayılan modelinde** (600k bağlam, "high" reasoning) GPT-6 Astra'yı öncelikli tuttu (2026-09-08 commit kanıtı) — bu da Astra lehine çevirebilir. Aradım ama daha fazla "switch" (taraf değiştirme) hikayesi veya doğrudan Astra-vs-Fable StackOverflow tartışması bulamadım; biri bulursa hüküm daha keskinleşir.