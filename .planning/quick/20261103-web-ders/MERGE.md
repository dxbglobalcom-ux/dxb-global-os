# Referee's merge (lead, max, 2026-11-04)

Otuz bir linkin çoğu liste ya da "yorum yaz, linki atayım" kapısıdır; iki okuyucu da aynı sonuca vardı: **bu linklerden SEO öğrenilmez**, derin bilgi Ek 1-7'dedir. Linklerin değeri yöntem ve alet göstermesindedir. Otuz bir linki iki okuyucu birbirini görmeden okudu (Opus ve Fable, high), ayrışmaları ben hakem olarak karara bağladım. Hiçbiri kurulmadı.

**İşe yarayanlar, sırayla:** c02 (yayın kapısı) · d21 (aylık SEO işinin iskeleti) · d11 (aylık ürünün teslim biçimi, düzeltilerek) · d07 (Net-a-Porter, lüks mağazanın ölçüsü) · c10 (kabul testi) · d09'dan claude-ads.

**Sizin kararınıza kalanlar:** AutoHedge ve Vibe-Trading (d09, işlem yapan finans ajanları) · /last30days'ın Polymarket kaynağı (d06) · gerçek olmayan kişiyle ürün tanıklığı, yapay UGC (d16).

**Görülemeyenler:** d08 ve d12 kaldırılmış ya da gizli. d14'ün videosu YouTube engeline takıldı, konuşması okundu. d07'nin ham HTML'i, saha hızı ve ödeme akışı alınamadı. d11'in rehberi kapalı. c08'in depoları adsız.

| Id | Tarih | Ne | Opus | Fable | Hüküm | Sebep |
|---|---|---|---|---|---|---|
| c02 | 11-01 | Voxyz — yapay zekâ ile kurulan siteyi Google'da bulunur yapan 12 kontrol + telefon cilası  | Kur 2 | Kur 3 | **Kur** 3 | İki okuyucu aynı hükümde. Yapay zekâ ile kurulan sitenin gerçek hastalığını anlatıyor: boş HTML, tek canonical, sahte 404. |
| d21 | 11-02 | Dave Davies, Search Engine Land — 'SEO için eyleme dönük ikinci beyin' (2 Kasım 2026) | Dene 3 | Dene 2 | **Dene** 3 | İkisi de Dene. Kendi başarısızlığını yazan tek uygulayıcı yazısı; UNREVIEWED etiketi bizim LAW B ile aynı. |
| d11 | 06-10 | vibha.in.progress — 'SEO + GEO Autopilot': Claude ile denetle, teşhis et, düzelt, haftalık | Dene 2 | Kur 3 | **Dene** 3 | Ayrışma: Kur / Dene. Dene seçtim: döngü doğru, ama FAQ şeması, llms.txt ve tek koşuluk 'Cited 3/5' bölümleri Ek 1 ve Ek 2'ye aykırı. Kurulacak bir şey de henüz yok. |
| d07 | 06-05 | NET-A-PORTER — lüks mağaza okuması (masaüstü ve telefon; ana sayfa, liste, ürün) | Araştır 3 | İzle 2 | **Araştır** 3 | Ayrışma: Araştır 3 / İzle 2. Araştır seçtim: lüks e-ticaretin ölçüsü bu ve içerikle satan mağaza kapısı. Söküm tamamlanamadı (403); kendi Chrome'unuzda bitirilir. |
| c10 | 10-21 | Voxyz — yayından önce 12 kullanıcı akışı testi ve TestSprite CLI | Kur 2 | Dene 2 | **Dene** 2 | Ayrışma: Kur / Dene. Dene seçtim: değerli olan 12 akışlık liste; TestSprite ücretli, önce Playwright. |
| d09 | 06-06 | divyannshisharma — '10 GitHub deposu': içinden işe yarayan claude-ads ve Hyperframes; geri | Kur 2 | Araştır 2 | **Kur** 2 | Ayrışma: Kur / Araştır. Listeden yalnız claude-ads için Kur; Ek 4 ve Ek 7 aynı sonuca vardı. Sınavı ve kurulumu B84 sırasında. |
| c04 | 10-27 | Agentation (benjitaylor/agentation) — sayfaya tıklayıp ajana not bırakma aracı | Dene 2 | Dene 2 | **Dene** 2 | İkisi de Dene. Tıkla-not revizyonu, sizin onay tıkı çalışma biçiminize oturur. |
| c09 | 10-22 | Voxyz — ürünün bir özelliğini ChatGPT eklentisine çevirmek (OpenAI Plugins / eski Apps SDK | Dene 2 | Dene 2 | **Dene** 2 | İkisi de Dene. AEO'nun alıntıdan kullanıma geçtiği yer. |
| d10 | 06-08 | avatarist.ai — 'Claude'a kurulacak 21 şey': marketingskills, claude-seo, claude-ads ve 18  | Dene 2 | Araştır 2 | **Dene** 2 | Ayrışma: Dene / Araştır. Dene seçtim, çünkü Ek 7'nin körlü sınavı tam bunu istiyor. |
| d01 | 05-17 | wesso.hall — '7 haneli işletmelerin vazgeçemediği 5 MCP': Shopify, Higgsfield, AdAdvisor,  | Araştır 2 | Araştır 2 | **Araştır** 2 | İkisi de Araştır. Post sığ, yön gerçek. Fable AdAdvisor'ı bulamadı, Opus fiyatlarıyla buldu; var sayıldı, kurulumda doğrulanır. |
| c05 | 10-27 | ARM (Agentic Relationship Management) — Emanuel Speliers'in lüks konut projeleri için ajan | Araştır 2 | Dene 2 | **Araştır** 2 | Ayrışma: Araştır / Dene. Araştır seçtim: gördüğümüz bir demo, ürün bulunamadı. Gelir fikri olarak değerli. |
| d03 | 05-21 | Google Pomelli — Google Labs ve DeepMind'ın sosyal medya kampanya üreticisi (reelde 'Pamel | Dene 2 | Araştır 1 | **Dene** 1 | Ayrışma: Dene / Araştır. Ücretsiz ve kolay; siteden marka DNA'sı çıkarma adımı teklif öncesi işe yarayabilir. |
| d14 | 06-23 | WPDev — 'Build Premium WordPress Websites with Google AI Studio': Behance örneğinden Guten | Dene 2 | Gerek yok 1 | **Dene** 1 | Ayrışma: Dene / Gerek yok. Tek alınacak: sayfayı yerel Gutenberg bloğu olarak teslim etme; WordPress kiti kurulurken denenir. |
| d16 | 06-23 | Codex CLI + Higgsfield CLI — 'tek fotoğraftan içerik fabrikası' reeli | Dene 2 | Araştır 1 | **Araştır** 1 | Ayrışma: Dene / Araştır. Media Studio aynı işi yapıyor; 'on kat ucuz' grafiği başka şeyi karşılaştırıyor. |
| c01 | 11-03 | nextgensearchengine — 'SEO + AEO + GEO, 10 zihin haritası' (26 Ekim, 354 beğeni) | Gerek yok 1 | Dene 2 | **Gerek yok** 1 | Ayrışma: Gerek yok / Dene. Bu sizin son paylaşımınız: on slayt doğru başlık listesi, ama ders değil. Başlıkların hepsi Ek 1 ve Ek 2'de derinlemesine var. FAQ ve şema önerileri eskidi. |
| c03 | 10-27 | Voxyz — Reddit'ten pazar araştırması istemi (AI/ML API MCP) | Gerek yok 1 | Gerek yok 1 | **Gerek yok** 1 | İkisi aynı. Araştırma kapımız bunu yapıyor. |
| c06 | 10-27 | VoiceStudio (debpalash/VoiceStudio) — yerel ses klonlama (konu dışı) | İzle 1 | Araştır 1 | **İzle** 1 | Ayrışma: İzle / Araştır. Konu dışı; stüdyonun ses işi. |
| c07 | 10-27 | nexoupdates — 'parasını ödediğin yazılımın GitHub'da ücretsiz ikizi' 9 depo listesi | Gerek yok 1 | Araştır 2 | **İzle** 1 | Ayrışma: Gerek yok / Araştır. Liste yeni bir şey getirmiyor; Chatwoot ve Cal.com kendi sıralarında bakılır. |
| c08 | 10-29 | sebintel — 'yapay zekâ film yapımı' 8 depo listesi (konu dışı, B43) | İzle 1 | Gerek yok 1 | **Gerek yok** 1 | Ayrışma: İzle / Gerek yok. Sekiz depo adsız, on iki aramada bulunamadı. |
| c11 | 08-08 | Gerçek Zamanlı SEO Süreci — 'Green Garden Plants' örnekli 10 adım (nextgensearchengine) | Gerek yok 1 | Gerek yok 1 | **Gerek yok** 1 | İkisi aynı. Başlangıç listesi. |
| d02 | 05-18 | nextgensearchengine — '7 günde performans pazarlaması' planı (Google Ads, Meta Ads, izleme | Gerek yok 1 | Dene 2 | **Gerek yok** 1 | Ayrışma: Gerek yok / Dene. Başlangıç özeti; Ek 4 bunun çok ötesinde. |
| d05 | 06-03 | Her Claude Code projesine kurulan 5 depo: Superpowers (CEO emriyle dışlı), Everything Clau | Gerek yok 1 | Gerek yok 1 | **Gerek yok** 1 | İkisi aynı. Konu dışı; superpowers ve gstack 27 Ağustos emrinizle dışarıda. |
| d06 | 06-03 | 'Claude becerim yok' reeli: /last30days, stop-slop, duckdb-skills ve MLflow'un beceri sına | İzle 1 | Gerek yok 1 | **Gerek yok** 1 | Ayrışma: İzle / Gerek yok. Konu dışı. /last30days Polymarket bahis oranlarını kaynak sayıyor; kullanılırsa o kaynak kapalı tutulur. |
| d17 | 06-23 | Scrapling + Hermes agent — Telegram'dan müşteri adayı listesi çıkarma | Dene 2 | Gerek yok 1 | **Gerek yok** 1 | Ayrışma: Dene / Gerek yok. Scrapling elimizde, Hermes gerekmiyor. Aday listesi yolu Y9'un işi. |
| d18 | 06-23 | UI-TARS Desktop (bytedance/UI-TARS-desktop) — ekranı görüp fare ve klavye süren ajan (konu | İzle 1 | Araştır 1 | **İzle** 1 | Ayrışma: İzle / Araştır. operator bu işi görüyor. |
| d19 | 06-29 | OpenMontage (calesthio/OpenMontage) — kodlama ajanını video stüdyosuna çeviren çerçeve (ko | Gerek yok 1 | Dene 2 | **Gerek yok** 1 | Ayrışma: Gerek yok / Dene. OpenMontage kurulu; stüdyonun işi (B42). Reel lisansı yanlış yazıyor (AGPL). |
| d08 | 06-06 | Erişilemedi — Instagram reeli DYX1yDJsRHA (kaldırılmış ya da gizli) | Gerek yok 0 | Gerek yok 0 | **Gerek yok** 0 | Gönderi kaldırılmış ya da gizli; iki kapı denendi, içerik bilinmiyor. |
| d12 | 06-10 | Erişilemedi — Instagram reeli DVxo_7MDOaA (onun notu: ChatGPT'de aramada çıkmak) | Gerek yok 0 | Gerek yok 0 | **Gerek yok** 0 | Notunuz 'chatgpt de aramada çıkmak'. Gönderi kaldırılmış ya da gizli; içerik bilinmiyor. Konunun kendisi Ek 2'de. |
| d13 | 06-11 | Yerel ajans sahibi — 'Claude Code'da ayda ~10 bin $: aynı oturumu sürdürme, /clear kullan' | Gerek yok 1 | Gerek yok 0 | **Gerek yok** 0 | Konu dışı; ders bizde ölçülü. |
| d15 | 06-23 | 'Yapay zekâ aletine para verme' — 6 ücretsiz site listesi (aifreeforever, mrfreetools, seo | Gerek yok 0 | Gerek yok 0 | **Gerek yok** 0 | İkisi aynı. Ücretsiz araç dizinleri; müşteri verisi oralara girmez. |
| d20 | 10-24 | Portekizce berber reeli — saç kesimi önerisi (konu dışı, gürültü) | Gerek yok 0 | Gerek yok 0 | **Gerek yok** 0 | İkisi aynı. Saç kesimi reeli, web işiyle bağı yok. |

Puan 0-3 arasıdır. c satırları Claude Code grubundan, d satırları Claude 2 grubundandır. İki okuyucunun tam metinleri: `.planning/quick/20261103-web-ders/reader-opus.md` ve `reader-fable.md`. Ayrıntı Excel'inizde "Kasım 3-4 web linkleri" sekmesindedir.
