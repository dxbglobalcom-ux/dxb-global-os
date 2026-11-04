# Okuyucu "fable" — 31 linkin hükmü (4 Kasım 2026)

Satırlar: `rows/fable.jsonl` (31 satır, aşağıdan yukarı: d21 → c01). Bu dosya yalnız hükümdür; her linkin içeriği, ne izlendiği ve kaynağı satırında.

## Önce cevap

Onun sorusu "SEO, AEO, GEO adam gibi çalışıldı mı?" idi. 31 linkin içinde bunu gerçekten ilerleten **dört** parça var; geri kalanı ya ofisin başka bir köşesine (ajans, stüdyo, satış) küçük bir parça ekliyor ya da yorum-tuzağı gürültüsü.

| Sıra | Id | Ne | Neden önemli | Öneri |
|---|---|---|---|---|
| 1 | **c02** | Voxyz: "Yapay zekâyla kurulan site Google'da yok" — 12 teknik kontrol | Onun c02 notunun tam cevabı. Kaynağı resmî (Google Search Central, web.dev eşikleri). Bizim wow sitelerimizde (3D, video, scroll) en çok kırılacak yer SSR, LCP, CLS — bu liste web ofisinin **yayın öncesi kapısı** olur. Eksikleri (INP 200 ms, hreflang, Organization/Product şeması) satırda. | **Kur** (Lighthouse CLI + yayın öncesi SEO kapısı skill'i) |
| 2 | **d11** | Vibha: Claude Cowork'te 4 skill — Auditor, AI-Search Spy, Diagnoser, Fixer + zamanlı canlı rapor | Onun "ÖNEMLİ" notu doğru çıktı. SEO+GEO **hizmetinin** iskeleti: veri (Search Console MCP, PageSpeed/CrUX, DataForSEO), dört rol, aylık canlı rapor, fiyat çıpası ($500-15.000/ay). Skill'ler bizde zaten var (OpenSEO 12 skill rafta); eksik olan bağlantılar ve rapor. | **Kur** (GSC MCP + PageSpeed API ücretsiz; DataForSEO/Ahrefs → CEO onayı) |
| 3 | **d21** | Dave Davies (W&B SEO başkanı): SEO için eyleme dönük ikinci beyin | Araç değil, **çalışma düzeni**: skill + karar defteri + görev durumu + geri bildirim kutusu + 05:30 zamanlı koşu + UNREVIEWED etiketi (= bizim LAW B). Şema skill'inin doğrulama disiplini (Schema.org/Wikidata'ya karşı canlı kontrol) ve "her aşama kendi sonucunu kaydeder" kuralı B65'in cevabı. | **Dene** (web ofisi SEO ustasının tarifi) |
| 4 | **c01** | nextgensearchengine: SEO + AEO + GEO 10 zihin haritası | Derin değil, ama SEO ustasının bilgi dosyasının **bölüm başlıkları** bu 10 slayt; CWV eşikleri resmî. GEO'da "AI tarayıcılarını engelleme" resmî, "Reddit/YouTube anması" uygulayıcı gözlemi. | **Dene** |

Bu dördü birlikte iskeleti tamamlar: c02 teknik taban → c01 çerçeve → d11 hizmet ve ölçüm → d21 işletim düzeni. Hiçbiri tek başına "ders" değil; ders, Google Search Central + web.dev + platformların tarayıcı dokümanlarından yazılır, bunlar yol haritasıdır.

**Kanıt durumu özeti (GEO):** Resmî olan — şema, canonical, SSR, CWV eşikleri, AI tarayıcı izinleri (GPTBot, PerplexityBot, Google-Extended). Uygulayıcı gözlemi — Reddit/Wikipedia/YouTube anmasının atıfla korelasyonu, "ilk 40-60 kelimede cevap". Kanıtsız — "llms.txt yoksa atlanırsın" (büyük motorların llms.txt kullandığına dair resmî beyan yok), "186 kontrol / 100 üzerinden puan" gibi yaratıcı ölçekleri. c02'deki "Google FAQ zengin sonuçlarını Mayıs 2026'da bıraktı" tarihi Google'ın sayfasından doğrulanmalı.

## Web ofisinin öteki köşelerine giren parçalar (puan 2)

- **c04 Agentation** (5.261 ★, PolyForm Shield): önizleme sitesinde tıkla → not → Claude Code istemi. CEO'nun "yalnız onay tıkı" alışkanlığına ve B02/B03-bis göz kontrolüne tam oturur. **Dene.**
- **c10 TestSprite 12 akış**: teslim öncesi gerçek tarayıcı testi — yetki sızıntısı (B kullanıcısı A'nın verisi), sepet kalıcılığı, boş durumlar, geri tuşu. TestSprite ücretli SaaS; önce Playwright ile kendi skill'imiz. **Dene.**
- **c09 ChatGPT eklentisi (MCP + ui:// kart)**: GEO'nun öteki yüzü — asistanın içinde yer almak. Web ofisi için yeni satılabilir kalem; listeleme/OAuth adımları CEO'da. **Dene.**
- **c05 "ARM" ajan CRM demosu**: $25k iddiası kanıtsız, ama gelen talep → nitelendirme → randevu → takip akışı bizim B64 + B05 + B12 ile kurulup satılabilir ürün. **Dene**; gelir hattı adayı (B83).
- **d01 / d10 / d09 MCP ve skill listeleri**: üçünden çıkan gerçek parçalar — GA4 MCP (Google resmî), Search Console MCP'leri, claude-seo (26k ★), claude-ads (10,7k ★), marketingskills (58k ★), hyperframes (78k ★). Hepsi OpenSEO rafımızla karşılaştırılarak seçilir; "AdAdvisor MCP" bulunamadı. **Araştır.**
- **d02 7 günlük performans pazarlaması planı**: doğru ve eksiksiz ajans SOP özeti; kaynak listesi (Google Skillshop, Meta Blueprint, CXL) resmî. Ajans personasının bilgisine girer. **Dene.**
- **d07 NET-A-PORTER**: lüksü taşıyan şey editoryal ritim + fotoğraf standardı + canlı "şu an kim ne alıyor" akışı; video/3D yok. Bizim farkımız ikisini birleştirmek. Referans dosyasına girer. **İzle.**
- **c07 9 ücretsiz ikiz**: Chatwoot (çok kanallı gelen kutu) ve Cal.com (randevu) holdingin satış/destek eli olabilir; VoiceStudio 100k ★ AGPL; OpenWhispr 10,7k ★ Kelam'ın (B25) ikizi. **Araştır.**
- **d19 OpenMontage** (76k ★, AGPL — reel "MIT" diyor, yanlış) ve **d16** ürün fotoğrafı → UGC seti akışı: stüdyo (B43) ve ajans (B28) için; zaten kayıtlı.

## Gerisi ne

- **Gürültü / konu dışı:** d20 (saç kesimi), d15 (ücretsiz araç dizinleri), c08 (adsız 8 film reposu — hiçbiri doğrulanamadı, 4,7k yorumluk DM hunisi), d13 (/clear dersi — bizde 25 Ekim'den beri ölçülü).
- **Zaten bizde / yeni yol açmıyor (puan 1):** d05 (superpowers, ECC, ui-ux-pro-max, claude-mem, n8n-mcp — n8n STACK'e aykırı), d06 (last30days, humanizer, skill testi), d17 (Scrapling + Hermes — ikisi de bizde), d18 (UI-TARS — B35 operator zaten var), d03 (Pomelli — rakip/kıyas, Türkiye'de erişim belirsiz), d14 (Google AI Studio → WordPress öğreticisi; tek alınacak: Gutenberg "convert to blocks" teslimi), c03 (Reddit şikâyet araması — dxb-research bunu yapıyor), c06 (VoiceStudio — stüdyo adayı), c11 (2020 standardı SEO akışı; misafir yazı backlink'leri riskli).
- **Erişilemedi:** d08 ve d12 — Instagram gönderileri kaldırılmış/gizli; her iki kapıda da (yt-dlp, gizli Chrome) "page isn't available". Tahmin yazılmadı.

## Aletler — gerçekte ne değerde

| Alet | Gerçek mi | Değeri bize | Ücretli/açık ikiz |
|---|---|---|---|
| Lighthouse CLI (c02) | Google, Apache-2.0 | Yayın öncesi kapıda zorunlu | Semrush Site Audit / Screaming Frog |
| Search Console MCP + PageSpeed/CrUX API (d11) | Birkaç açık MCP (320 ★, 40 ★); API'ler Google resmî, ücretsiz | SEO ustasının veri eli; müşteri mülk izni ister | — |
| DataForSEO / Ahrefs (d11) | Ücretli API | AI görünürlük ve sıra takibi için; para çıkışı → CEO | Kendi sorgu betiğimiz (5 motorda atıf sayımı) |
| OpenSEO 12 skill | Rafta | Tabanımız; claude-seo/marketingskills ile karşılaştırılır | Semrush |
| claude-seo 26k ★ / claude-ads 10,7k ★ / marketingskills 58k ★ (d10, d09) | MIT, Kasım 2026'da canlı | Okunup seçilir; iki kez yazılmaz | Semrush / Madgicx |
| Agentation 5,3k ★ (c04) | PolyForm Shield | Revizyon katmanı; dev dependency | — |
| TestSprite CLI 5,1k ★ (c10) | Ücretli SaaS, npm 0.16.0 | Önce Playwright ile kendi 12-akış skill'imiz | Açık: Playwright MCP (bizde) |
| GA4 MCP (d01) | Google resmî, 3,6k ★ | E-ticaret bakım paketi | — |
| Chatwoot 38,8k / Cal.com 49,7k (c07) | Self-host, Postgres | Satış-destek eli adayı (B05) | Intercom / Calendly |
| hyperframes 78,6k ★ (d09) | Apache-2.0 | Site ile aynı tasarım sisteminden intro video | Runway vb. |
| OpenMontage 76k ★ (d19) | AGPL-3.0 | Stüdyo montajı; zaten kayıtlı | fal.ai/Veo/Kling API'leri |
| Pomelli (d03) | Google Labs deneyi | Rakip/kıyas, araç değil | Canva Magic Studio |
| UI-TARS Desktop 39,5k ★ (d18) | Apache-2.0 | B35 için yedek açık VLM; yeni yetenek değil | Claude computer-use (bizde) |

## Onun sözüne cevap

"Yüzeysel çalışılmış mı?" — Bu 31 linkin kendisi yüzeyseldir; hepsi Instagram/X derinliğinde. Ama içinden çıkan **iskelet** (c02 + c01 + d11 + d21) doğru ve resmî kaynaklara dayanıyor. Derin ders bu linklerden değil, onların işaret ettiği resmî dokümanlardan (Google Search Central, web.dev, Schema.org, platformların tarayıcı sayfaları) ve `tracks/` çalışmasından yazılır. Onun istediği "en mükemmel" için ölçülebilir kapı: her teslimde c02'nin 12 kontrolü + CWV eşikleri yeşil, aylık d11 raporu gerçek veriyle, hiçbir "puan" yaratıcı ölçeğinden alınmadan.

## Tam inceleyemediklerim

- **d08, d12**: gönderi kaldırılmış/gizli (iki kapı denendi).
- **d14**: YouTube videosu yt-dlp'de "confirm you're not a bot" — yalnız transkript okundu, kare yok.
- **d21**: makale tam okundu; içindeki şema skill'inin linki Cloudflare duvarı yüzünden alınamadı.
- **c08**: slaytlar tamamen okundu; işaret ettiği 8 repo adsız, 12 aramada eşleşen bulunamadı, "DIRECTOR" yorumu yazılmadı.
- **d15**: sessiz reel; transkript iki denemede boş, içerik karelerden okundu (tam).
