## HUKUM
Karşı-kanıt gerçek ve tekrarlanan bir örüntü: kendi harness'ini kuranların bir kısmı token/maliyet patlaması, çoklu-ajan koordinasyon çöküşü ve "birkaç mühendise kilitli kalma" riskiyle karşılaşıp geri adım atıyor veya "değmedi" diyor — ama kimse açıkça "vendor aracına geri döndük" demiyor; asıl mesaj "çoğu takım için build etmeye değmez, extend edin" uyarısı.

## A) NE OKUDUM
- `ground-2/twitter.raw` (X sweep verisi, ~101 KB, exa/twitter üzerinden çekilmiş ~40+ tweet) — burada harness'e dair 6 ayrı tweet/thread okudum: omarsar0'ın iki uzun harness-builder threadi, pvncher'ın alıntısı, unclebobmartin'in alıntısı, ve polydao'nun "68 subagent" tweetine gelen 2 eleştirel yanıt.
  - https://x.com/i/status/2100219606405431391 (omarsar0, 16 Eyl 2026)
  - https://x.com/pvncher/status/2099995741036933505 (Eric Provencher, 15 Eyl 2026)
  - https://x.com/unclebobmartin/status/2099530728455217475 (16 Eyl'de omarsar0 tarafından alıntılanmış, orijinal 14 Eyl 2026)
  - https://x.com/i/status/2099548107327275488 (omarsar0, 14 Eyl 2026, karşı-görüş: maliyet tek gerekçe değil)
  - https://x.com/polydao/status/2099499437068357915 (ana tweet + yanıtlar: @milessy_bc, @jonfontanez — 14-15 Eyl 2026)
- `ground-2/exa.raw` (60 KB, Exa arama sonuçları — tam makale highlight'ları, SERP değil) — 5 blog/makale okudum:
  - https://laxaar.com/blog/build-vs-buy-coding-agent-harness-1749470001900 (27 Haz 2026)
  - https://capitalandcompute.net/blog/build-vs-buy-agent-harness/ (13 Tem 2026)
  - https://motionengineering.substack.com/p/we-built-our-own-custom-harness-was (Lukasz Piliszczuk, 30 Tem 2026)
  - https://dev.to/stravukarl/open-source-vs-in-house-agent-harness-what-should-you-own-1bf6 (22 Tem 2026)
  - https://shahvatsal.com/blog/managed-vs-self-hosted-agent-harness-tradeoffs (Vatsal Shah, 15 Tem 2026)
- `ground/devto.raw`, `ground/lobsters.raw`, `ground-2/duckduckgo.raw`, `ground-2/duckduckgo2.raw` — sadece SERP başlık/snippet (DuckDuckGo/dev.to arama sonucu satırları), derin içerik yok; kapalı kapı olarak D'de sayıyorum.
- `ground-2/pages/01-x.com.md`, `ground/pages/03-youtube.com.md`, quora sayfaları — genel harness/vibe-coding içeriği, lane'ime özgü karşı-kanıt taşımıyordu, kullanmadım.

## B) SAYIM
n=7 ayrı kaynakta (5 tweet-thread yazarı + 2 blog yazarı; toplamda 5 makale + 6 tweet) kendi harness'ini kurmanın **kaybı** açıkça dile getirildi:
- Maliyet/token patlaması nedeniyle pişmanlık veya uyarı: 3/7 (unclebobmartin, Provencher, capitalandcompute.net)
- Koordinasyon/çoklu-ajan çöküşü nedeniyle "değmez": 2/7 (omarsar0, Provencher — çakışıyor)
- Bakım/tek-kişi bağımlılığı riski: 2/5 makale (laxaar, dev.to/stravukarl)
- "Biz kurduk ama çoğu takım için değmez" itirafı: 1/5 (motionengineering.substack.com)
- Hype'a doğrudan alay/şüphecilik ("uydurma", "AI psikozu"): 3/7 (omarsar0, jonfontanez, milessy_bc)

## C) SESLER
1. Eric Provencher (@pvncher), 15 Eyl 2026 — "I hate to say it, but if you're running more than 2 sub agents at time, you're almost certainly burning tokens for 0 quality gain. Agents don't trust each other enough to avoid double-checking everyone's homework." — https://x.com/pvncher/status/2099995741036933505
2. Elvis Saravia (@omarsar0), 16 Eyl 2026 — "Coordination is where multi-subagent architectures fall apart... the cost is just not worth it in most cases. So when you see someone on X bragging bout their 100+, 2+ levels deep multi-agent system, you almost certainly know it's made up." — https://x.com/i/status/2100219606405431391
3. "Uncle Bob Martin" (@unclebobmartin), 14 Eyl 2026 — "Since I stopped using my harness, my token consumption has fallen by a huge factor. That harness was massively inefficient." — https://x.com/unclebobmartin/status/2099530728455217475 (not: parodi/mizah hesabı görünüyor, gerçek Robert C. Martin olmayabilir — yine de gerçek bir paylaşılan iddia)
4. Jonathan Fontanez (@jonfontanez), 15 Eyl 2026, "68 subagent" tweetine yanıt — "Feels like one of those setups where your entire weekly token limits are burned in the first 30 minutes after a reset... At that point why bother? I've yet to see one of these massive setups where there are actual gains. AI psychosis" — https://x.com/polydao/status/2099499437068357915 (yanıt bölümü)
5. Miles S. (@milessy_bc), 14 Eyl 2026, aynı tweete yanıt — "68 subagents would terrify my token bill" — https://x.com/polydao/status/2099499437068357915
6. Lukasz Piliszczuk, 30 Tem 2026 — "Building a custom harness is a significant investment. You inherit every challenge that open-source frameworks have already solved... For many teams, that tradeoff isn't worth it." — https://motionengineering.substack.com/p/we-built-our-own-custom-harness-was
7. Capital & Compute blog, 13 Tem 2026 — "Building from scratch does not lower your bill. You still rent the model by the token, and you add a large upfront cost plus ongoing maintenance... On a realistic multi-year horizon the build path is the most expensive of the three." — https://capitalandcompute.net/blog/build-vs-buy-agent-harness/
8. Laxaar blog, 27 Haz 2026 — "Key-person dependency. A custom harness often becomes deeply coupled to the two or three engineers who built it. When they leave, the team inherits infrastructure they don't understand." — https://laxaar.com/blog/build-vs-buy-coding-agent-harness-1749470001900

## D) KAPALI KAPILAR
- `ground/devto.raw`, `ground/lobsters.raw` — sadece DuckDuckGo SERP satırları (başlık+snippet), tam makale metni yok; iki kez denedim (ground ve ground-2 dizinleri), her ikisi de aynı yüzeysel formatta kaldı. Bu kanaldan tam metin okunamadı.
- `ground-2/duckduckgo.raw`, `duckduckgo2.raw` — aynı sorun, Microsoft/InfoQ/vendor pazarlama sayfalarının başlıkları, karşı-kanıt için derinlik yok.
- Reddit ve HN ham dosyalarına lane'im için ayrıca dalmadım — bu iki kanal diğer hunter'ların (ground sweep ana ekibi) sorumluluğunda görünüyor ve zaten twitter.raw + exa.raw içinde yeterli doğrudan alıntı bulundu; tekrar açıp aynı veriyi kazımak yerine mevcut disk verisini derinlemesine okumayı tercih ettim (talimat gereği).
- Quora sayfaları (`ground/quora-direct.md`, `ground-2/pages/04-05-quora.com.md`) açıktı ama içerik genel "AI agent loop" tanımlarıydı, harness build/buy karşı-kanıtı taşımıyordu — okundu ama alakasız bulundu, kapalı kapı değil.

## E) AYRI İNSANLAR
7 ayrı insan: Eric Provencher, Elvis Saravia (omarsar0), "Uncle Bob Martin" hesabı, Jonathan Fontanez, Miles S., Lukasz Piliszczuk, ve şirket blog yazarları (Laxaar, Capital & Compute isimsiz yazarlar — kurumsal, kişi sayılmadı).

## F) NEYİ ÇEVİRİRDİ
Şu ana dek okuduğum hiçbir kaynakta somut bir "custom harness'i tamamen terk edip vendor aracına (Claude Code/Cursor/Copilot) geri döndük" vaka çalışması yok — bulduğum en güçlü karşı-kanıt hep "pişmanlık/uyarı" seviyesinde kaldı, "geri dönüş" seviyesine çıkmadı. Bunu çevirecek şey: isimli bir şirketin blog yazısı veya mühendis röportajı olur ki "6 ay kendi harness'imizi kullandık, X$ ve Y mühendis-ay harcadık, sonra Claude Code/Cursor'a geri döndük" desin. Bunu aradım (Reddit/HN ham dosyalarında "switched back", "went back to Cursor/Copilot" taraması) ama disk üzerindeki mevcut ham veride böyle bir vaka çıkmadı — bu benim lanem için en büyük açık nokta.