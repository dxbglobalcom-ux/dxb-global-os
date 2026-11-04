# İz 2 — AEO, GEO ve yapay zekâ tarafından bulunmak

Tarih: 2026-11-03. Sayılar kaynağın ölçtüğü tarih ve modelle söylenir. "Tarama" = Martinez, *A Critical Survey of GEO*, arXiv 2607.14035, 15 Temmuz 2026 (tek yazarlı ön baskı, 45 çalışma). Taramadan aktarılan çalışmaların çoğunu birincil kaynaktan açmadım; açtıklarım Schulte, C-SEO Bench ve Watanabe'dir ve taramayla uyuştu.

## 1. Özet

1. Google'ın resmî sözü şudur: AEO ve GEO, Google Search açısından SEO'dur. Bu söz Google için doğrudur, öteki motorlar için yarı doğrudur; ChatGPT, Perplexity ve Claude başka dizinlerden beslenir.
2. Motorlar aynı kaynakları seçmez. Google organik, AI Overview ve Gemini arasında URL benzerliği 0,11–0,18'dir (Grossman 2026, tarama üzerinden). Bu yüzden tek bir "AI sıralaması" yoktur.
3. Kontrollü kanıt dardır: zaten alınmış bir belge, cevabı nedensel olarak etkileyebilir. Beyaz şapkalı bir müdahalenin motorlar arasında kalıcı keşif artışı sağladığı gösterilmemiştir. "GEO görünürlüğü %40 artırır" genel iddia olarak reddedilmiştir.
4. Para büyüklüğü organikten çok küçüktür: 95 sitede yapay zekâ yönlendirmesi organiğin %2,6'sıdır, 100 organik dönüşüme karşı 3,2 dönüşüm getirir. Organikte %5 artış, yapay zekâ trafiğini ikiye katlamaktan fazla dönüşüm verir.
5. Tek koşu ölçüm değildir: marka başına bir koşunun güven aralığı ±72 puandır, sekiz koşuda ±12'dir. Sıra numarası gürültüdür; görünme oranı ölçülebilir.
6. llms.txt arama görünürlüğü için boştur. Yapay zekâ için şema eklemek ölçülmüş bir artış vermemiştir. İkisi de ayrı kalem olarak satılmaz.
7. En büyük teknik tehlike wow sitesindedir: OpenAI, Anthropic ve Perplexity tarayıcıları JavaScript çalıştırmaz (Vercel/MERJ, Aralık 2024, yeni tekrar yok). Metin ham HTML'de yoksa o motorlar için sayfa boştur.
8. Site dışı en güçlü işaret, üçüncü tarafların gerçekten yazdığı adlardır. Sahte Reddit izi, sahte yorum ve gizli komutlu "Summarize with AI" düğmesi hem yasal hem Google spam riskidir.
9. Ajan hazırlığı erken aşamadadır: Google bunu "fazla vaktiniz varsa" diye anar; Markdown müzakeresi sitelerin %3,9'unda, MCP Server Card ve API Catalog veri setinde 15'ten az sitededir. Yapı olarak ucuzdur, gelir vaadi olarak yapılmaz.
10. W072/W073 teklifi döngü olarak ayakta kalır; "ayda N sayfa", haftalık yapay zekâ kararı, Reddit kalemi ve "agentic website" adı değişmelidir (§7).

## 2. Kanıt durumu

| İddia | Güç | Kaynak, tarih, ölçüm |
|---|---|---|
| AI Overviews ve AI Mode, çekirdek sıralama ve Search dizininden RAG ile çalışır, fan-out kullanır | resmî | Google rehberi, son güncelleme 2026-07-10 |
| Google için llms.txt, Markdown, özel işaretleme, chunking, yapay zekâya özel yeniden yazma gerekmez | resmî | Aynı rehber, "Mythbusting" bölümü |
| Fan-out varyasyonları için ayrı sayfa üretmek, sıralama amacıyla yapılırsa scaled content abuse'dur | resmî | Aynı rehber; spam politikası artık "generative AI responses" manipülasyonunu da sayar (15 Mayıs 2026) |
| Bing yapı önerir: tek konu, başlık, tablo, S&C, baştaki bilgi; IndexNow tazelik için önerilir | resmî (Bing için) | Microsoft, 8 Eki 2025; Bing, 10 Şub 2026; SEJ özeti 27 Şub 2026. Google ile çelişki: her motorun resmî sözü kendi motoru için geçerlidir, ikisi de okur için yapıyla bağdaşır |
| Gövdeyi GEO için yeniden yazmak zarar verebilir: top-20 −%9, reranking sonrası top-10 −%16, atıf −%6 | kontrollü ölçüm | SAGEO Arena, 171.003 belge, 2.700 sorgu (tarama üzerinden) |
| Hazır GEO reçeteleri genelleşmez: 54 yöntem-alan birleşiminden 3'ü anlamlı pozitif | kontrollü ölçüm | C-SEO Bench, NeurIPS 2025 |
| Alaka ve bağlam içi konum en güçlü etkendir; fiyat ve güncel tarih etkili, biçim tek başına zayıf | kontrollü ölçüm | Vishwakarma 2026, 252.000 deneme (tarama üzerinden) |
| GEO %40 artırır | efsane (genel iddia olarak) | Aggarwal 2024: GPT-3.5, beş belgelik sabit bağlam, pawc 19,3 → 27,2 |
| JSON-LD eklemek atıf artırır | çürüdü | Ahrefs, 1.885 sayfa, 4.000 kontrol, fark-içinde-fark, Ağu 2025–Mar 2026: AIO −%4,6, AI Mode +%2,4, ChatGPT +%2,2; son ikisi sıfırdan ayırt edilemez. Microsoft şemanın yardım ettiğini yazar; resmî sözle ölçüm çelişir, karar ölçümden yana |
| ChatGPT ve Perplexity şemayı düz metin gibi okuyabilir | uygulayıcı | Williams-Cook, Şubat 2026: geçersiz JSON-LD içindeki adresi buldular. Guevara'nın testi ters çıktı |
| llms.txt atıf getirir | efsane | SE Ranking, ~300.000 alan adı, Kas 2025, korelasyon yok. Ahrefs, 137.000 alan adı, Mayıs 2026: ~38.000 geçerli dosyanın %97'sine hiç istek gelmedi; yapay zekâ getirme botları isteklerin %1'i (SEJ özeti; Ahrefs birincil adresi açılmadı) |
| AI Overview atıflarının %38'i ilk 10'dadır | satıcı ölçümü | Ahrefs, Mart 2026, 863.000 SERP, 4 M URL. Temmuz 2025'teki %76 ile yöntem farklı. BrightEdge %17 der |
| ChatGPT atıflarının %87'si Bing'dendir | eski ve tartışmalı | Seer, Şubat 2025, 100 sorgu. 400 sorguluk tekrar %27,4 buldu (AI+Automation, Nis 2026). Grow and Convert: fan-out SERP'lerinin ilk 10 sayfasında atıfların ~%40'ı |
| AI Overview tıklamayı düşürür | kontrollü panel + satıcı | Pew, 900 ABD yetişkini, Mar 2025: %8'e karşı %15. Ahrefs, Ara 2025, 300.000 kelime, masaüstü: −%58 (korelasyon). Seer: %1,3 (Ara 2025) → %2,4 (Şub 2026), 53 marka, 5,47 M sorgu; eski "−%61" güncel değil |
| Web'deki marka anılması görünürlükle backlink'ten güçlü ilişkilidir | korelasyon | Ahrefs, 75.000 marka, Mayıs 2025, yalnız AIO: 0,664'e karşı 0,218 |
| Atıfların %84'ü "earned"dir | satıcı iddiası | Muck Rack, Mayıs 2026, 25 M bağlantı; "earned" tanımı akademi, kamu ve sosyal medyayı da içerir |
| Sayfanın ilk üçte biri atıf alır | uygulayıcı | Indig, %44,3; örneklem sayısı kaynaklarda çelişiyor |
| Yapay zekâ trafiği 4,4 kat, 23 kat dönüştürür | efsane | SEO Works, 63 site, Eyl 2025–Ağu 2026: organiğe 1,18x, ücretli aramaya 0,67x; 23 sitede daha kötü. Adobe, ABD perakende, Eyl 2026: %90 daha iyi dönüşüm, ziyaret başına %83 gelir. Karşılaştırma kanalı yazılmayan kat sayı okunmaz |
| Kendini birinci yazan "en iyi" listeleri işe yarar | zayıflıyor | Ray, 100 B2B sorgusu, Eyl 2026: AIO bu sayfaları %38 az kullandı; markayı %83 dışarıda bıraktı. Indig ve Scrunch farklı sonuç verdi; hepsi denetimsiz |
| "Summarize with AI" düğmesine gizli komut koymak | saldırı | Microsoft Defender, 10 Şub 2026: 31 şirket, 50+ komut |
| Bir optimizasyonun gelire etkisi kanıtlanmıştır | çok zayıf | Watanabe 2026: işlem görmeyen sayfalar da 3,5 kat büyüdü; ek etki ×1,82, plasebo p=0,16 |

**Üç kova.** Kanıtlı: erişim, indekslenme, alaka, doğrulanabilir içerik, tekrarlı ölçüm, motorlar arası fark. Makul ama nedensel kanıtsız: üçüncü taraf anılmalar, yapı, tazelik, sayfa başında önemli bilgi, yorum kalitesi, Bing IndexNow. Hava: llms.txt satışı, yapay zekâ için şema, chunking paketi, AI sıra takibi, garanti, adetle Reddit izi, "gizli sinyal" ve Google içi veri iddiası. Google rehberi üçüncü tarafların iç sistemlerine erişemediğini açıkça yazar.

## 3. Dünya seviyesi nasıl yapılır

### Motor haritası

| Motor | Nereden alır | Arama botu | Eğitim | Kullanıcı getirmesi | Kontrol ve ölçüm |
|---|---|---|---|---|---|
| Google AIO, AI Mode | Search dizini, fan-out | Googlebot | Google-Extended (HTTP botu değil, belirteç) | Google-Agent | `nosnippet`, `max-snippet`, `noindex`; Search Console "Search generative AI" anahtarı (31 Ağu 2026 küresel; eğitimi etkilemez, ranking sinyali değildir) |
| Gemini uygulaması | Search dizini; yerelde Maps | Googlebot | Google-Extended | — | Google-Extended, Gemini Apps grounding'ini de keser |
| ChatGPT | OAI-SearchBot + arama ortakları (yardım sayfası Microsoft ve Shopify'ı anar); Yelp lisansı | OAI-SearchBot | GPTBot | ChatGPT-User (robots uygulanmayabilir) | Değişiklik ~24 saat; IP listeleri yayımlı; reklam için OAI-AdsBot |
| Perplexity | Kendi dizini (200 milyar URL iddiası ikincil) | PerplexityBot | Temel model için kullanılmadığını söyler | Perplexity-User (robots'u genelde yok sayar) | IP listeleri yayımlı; Cloudflare 2025'te gizli tarama suçlaması yaptı |
| Copilot | Bing dizini; Microsoft "grounding'imiz neredeyse her büyük asistanı besliyor" der (Şub 2026, kendi iddiası) | Bingbot | NOARCHIVE | — | NOARCHIVE Copilot ve grounding'i keser, NOCACHE URL, başlık ve snippet'e indirir; AI Performance |
| Claude | Brave ve turbopuffer alt işlemci listesinde; iş bölümü bilinmiyor | Claude-SearchBot | ClaudeBot | Claude-User | robots.txt; IP engeli opt-out'u bozabilir |

**Robots kuralı.** Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot ve kullanıcı botları açık kalır. GPTBot, ClaudeBot ve Google-Extended müşterinin ticari kararıdır, ama Google-Extended kapatılırsa Gemini uygulaması grounding'i de gider. Kapı CDN'de de kontrol edilir. Cloudflare'de 15 Eylül 2026'dan beri yeni alan adının varsayılanı siteye göre değişir: reklamsız sitede Training ve Agent açıktır; reklamlı sitede Training "Disallow AI Training", Agent ise reklamlı sayfalarda "Block" olur, Search her ikisinde açıktır. "Disallow AI Training" Googlebot ve Bingbot'u aramada bırakır, OpenAI ve Anthropic'in yalnız eğitim botlarını keser. Elle seçilen "Block" Googlebot ve Bingbot'u da durdurur, yani siteyi aramadan düşürür. Reklamlı müşteride Agent kapısı ayrıca karara bağlanır. Google, AIPREF sinyalini (`user-agent: __usage_ai-training`) 2027 başında desteklemeyi planlıyor.

### Adımlar

1. **Bütçeyi gerçek paya göre kur.** SEO temeli, marka ve kanıt işi çoğunluktur; yapay zekâya özel katman müşteri başına işin onda biri ile beşte biri arasında tutulur. Bu oran benim yargımdır, ölçüm değildir; dayanağı §1 madde 4'tür. Perakende ve B2C'de pay daha yüksek okunur, B2B ürün tarafında AI dönüşümü organiğin 0,62 katıdır.
2. **Erişimi kanıtla.** Her bot için robots, WAF ve CDN gerçek kullanıcı aracısıyla denenir; sunucu günlüğünde 200 yanıtı görülür. Sahte aracılar yayımlı IP listeleriyle ayıklanır.
3. **Ham HTML sınavı.** JavaScript kapalı, `curl` ile çekilen sayfada başlık, fiyat, ürün özellikleri, adres ve ana metin görünmelidir. Eşik tamdır: satın alma kararını taşıyan hiçbir bilgi yalnız JS ile gelmez.
4. **Kayıtları aç.** Search Console, anahtar "Include" konumunda; Bing Webmaster, IndexNow, Bing Places; Google Business Profile; Merchant Center; pazara göre Yelp. Bing Places'in ChatGPT'yi beslediği iddiası tartışmalıdır, yapılır ama vaat edilmez.
5. **Soru evrenini kur.** Satış görüşmesi, Search Console sorguları, Bing grounding ifadeleri ve rakip atıflarından 30–50 tarafsız soru çıkar; her ihtiyaç için 3–5 yeniden ifade (tarama protokolü). Marka adlı sorular ayrı tutulur: Sharma 2026'da ChatGPT ürünleri adıyla %99,4 tanıdı, keşif sorularında %3,32 çıkardı.
6. **Temel ölçüm.** Tüketici arayüzünden en az 8 koşu ya da 24–28 günlük günlük pencere. API tüketici arayüzünün yerini tutmaz: Surfer'da markaların %24'ü, kaynakların %4'ü örtüştü (Aralık 2025, satıcı). Aramanın çalışmadığı ve hata veren koşular atılmaz, sonuçtur. Formül: atıf olasılığı = arama açılması × alınma × alınmışsa atıf. Hangi halkanın kırık olduğu buradan okunur.
7. **Atıf haritası.** Tekrar eden 10–15 kaynak sınıflanır: liste, forum, rakip, kendi sayfa, referans. Hedef çoğu zaman kendi sayfamız değil, atıf alan üçüncü sayfadır.
8. **Kanıt birimi üret.** Birinci elden test, kendi verisi, fiyat, tarih, karşılaştırma, kaynaklı sayı. Sayfa tek konuya odaklanır, önemli bilgi üstte durur. Toplu yeniden yazım yapılmaz; değişiklik önce sayfa grubunda denenir, retrieval tarafını bozmadığı görülür. Fan-out sorgusu hedeflemek reçete değildir: ChatGPT soruyu 2–4 aramaya böler, ama atıfların ~%60'ı o aramaların ilk 10 sayfasında yoktur (Grow and Convert, 100 soru, Mart 2026). Fan-out, sayfa listesi değil konu haritası olarak kullanılır. API'nin fan-out'u tüketici arayüzüyle örtüşmeyebilir: Genezio 3.856 fan-out'ta ortak bulamadı (satıcı, İngiltere bankacılığı).
9. **Üçüncü taraf görünürlüğü.** Gerçek basın, sektör listeleri, karşılaştırmalar, YouTube, açık kimlikli topluluk katılımı, gerçek yorum akışı. Wikipedia'ya ancak bağımsız kaynakla ve ücretli ilişki açıklanarak girilir; kural metnini bu turda açmadım. Tek platforma bağlanılmaz: ChatGPT'nin Reddit'i andığı cevaplar Ağustos–Eylül 2025'te ~%60'tan ~%10'a, Wikipedia ~%55'ten %20'nin altına indi (Semrush). Sonraki sıralamalar izleyiciye göre değişir.
10. **Doğruluk denetimi.** Motorların müşteri hakkında söylediği saat, fiyat, adres, iddia denetlenir. SOCi'de profil bilgisi ChatGPT ve Perplexity'de ~%68, Gemini'de %100 doğruydu. Yanlışın kaynağı bulunup orası düzeltilir.
11. **Sonuç ölçümü.** Search Console üretken yapay zekâ raporu (gösterim, sayfa, ülke, cihaz; tıklama ve sorgu yok); Bing AI Performance (atıf, sayfa, örneklem grounding ifadeleri, Citation Share; rakip ve tıklama yok); GA4'te Referral'ın üstüne özel kanal kuralı ve `utm_source` okuması; sunucu günlüğü; formda "bizi nereden buldunuz". AIO tıklamaları GA4'te organikten ayrılmaz, bu yüzden AI payı alt sınırdır.
12. **Kontrol grubu.** Her müşteride sayfaların bir kısmı işlemsiz kalır. Platform büyümesi işlem sanılmaz. Güven aralığının altındaki fark raporda "değişim" diye yazılmaz.

**Oynaklığın gerçek sayıları.** Schulte 2026 (İsviçre, dört motor, 45 gün): tek koşu ±72 puan, dört koşu ±30, sekiz koşu ±12; 28 günlük günlük pencere ±6,5; kaynak benzerliği 0,34–0,42; ChatGPT koşularının %57,8'i atıfsız. Küçük sorgu evrenindendir, evrensel eşik değildir. SparkToro/Gumshoe (27 Ocak 2026; 600 gönüllü, 12 soru, 2.961 koşu): aynı liste 100'de 1'den az, aynı sıra ~1.000'de 1; yine de görünme oranı anlamlı (bir hastane 71 cevabın 69'unda). Kirsten 2026 (ABD ve Almanya, 4.706 sorgu): iki ayda sayfa örtüşmesi AIO'da %18, organikte %45.

### Yerel

SOCi 2026 (~350.000 konum, 2.751 çok şubeli marka, satıcı): ChatGPT %1,2, Perplexity %7,4, Gemini %11, Google 3'lü paket %35,9. Veri Yelp anlaşmasından öncedir. Yelp, Axios'a göre 23 Temmuz 2026'da OpenAI'ye yorum ve işletme verisi lisansladı (330 milyon yorum, 8 milyondan fazla işletme). Gemini Maps'e dayanır. Bu yüzden iş GBP ile bitmez: pazardaki baskın yorum ve rehber sitesi bulunur, adres ve hizmet verisi her yerde eşitlenir, yorum yanıtlanır. Yorum toplama gerçek müşteriden olur.

### E-ticaret

OpenAI, Mart 2026'da Instant Checkout'u geri çekip keşfe döndü; satın alma satıcı tarafına geçti (ikincil kaynaklar, tarihler çelişiyor). ACP yaşıyor. Google, UCP ile AI Mode ve Gemini'de ABD merchant'larına aşamalı ödeme getiriyor; katılım başvuru ve seçimle ilerliyor. Bu kısım ikincil kaynaktandır. Sıra şudur: fiyat ve stok tam eşleşen feed, Merchant Center, ürün sayfasında ham HTML özellikleri, yorumlar, sonra protokol. Yapay zekâ kaynaklı oturum e-ticarette %0,2'nin altında deniyor (satıcı), ama Adobe, ABD perakendesinde yapay zekâ trafiğinin Eylül 2026'da yıllık %71 büyüdüğünü ölçtü. E-GEO'da 15 sezgisel yöntemin 10'u nötr ya da olumsuz çıktı.

**CEO için bir satır:** Klarna ve Affirm taksitli ödemesi Google'ın AI alışveriş ödemesine giriyor (Mayıs 2026); faizli olanın müşteri sitesine bağlanması İslami sınıra değer, hüküm sizdedir.

### Ajan hazırlığı

Yapılacak olan, işlem değeri taşıyan akışı gerçek ajanla denemektir; puan almak değil. Ajanlar sayfayı ekran görüntüsü, DOM ve erişilebilirlik ağacından okur (web.dev, Google rehberi). Bu yüzden semantik HTML ve etiketli form, her sitede zemindir.

| Parça | Durum | Karar |
|---|---|---|
| Is Agentic (Vercel/Ora), isitagentready (Cloudflare) | İki ücretsiz tarayıcı; ölçütleri yayımlayanın ürünleriyle örtüşür (EK12'de vercel.com 95, apple.com 51). Puanın görünürlük ya da satışla bağı ölçülmemiş | Teslimde kontrol listesi; müşteriye başarı göstergesi diye sunulmaz |
| Markdown müzakeresi | %3,9 site; Cloudflare'e göre Claude Code ve OpenCode başlığı gönderiyor; bağımsız hacim yok | Belge, API ve geliştirici sitesinde açılır; ucuz, yan etkisiz olduğu sürece her sitede denenir |
| Sitede MCP | MCP Server Card ve API Catalog 15'ten az sitede | Yalnız gerçek eylem varsa: rezervasyon, stok, teklif, destek |
| WebMCP | Chrome 149 origin trial, standart yolunda değil; Firefox ve Safari taahhüdü yok (ikincil) | Deneysel kart; canlı satın alma akışında kullanıcı onayı şart |
| NLWeb | Schema.org ve RSS üstünde konuşma uç noktası; son itme 2026-08-11 | Büyük katalog ve yayıncı için deneme |
| UCP, ACP | Keşif ve feed yaşıyor; ödeme aşamalı | E-ticaret ustasının kartı |

### Başlangıç ajansının atladıkları

Tek ekran görüntüsüyle rapor; koşu sayısı ve güven aralığı yazmamak; arama açılmayan koşuları atmak; CDN'i denememek; JS'siz metni kontrol etmemek; Bing'i kurmamak; Google-Extended'in grounding etkisini bilmemek; kontrol grubu kurmamak; AI'nin yanlış söylediğini fark etmemek.

## 4. Wow ile çatışma

Çatışma, görsel dilde değil teslim katmanındadır. En iyi yol wow'u azaltmak değil, altına tam bir metin ve eylem katmanı koymaktır.

| Çatışma | Neden | Çözüm |
|---|---|---|
| Canvas, WebGL ya da JS ile çizilen metin | OpenAI, Anthropic ve Perplexity tarayıcıları JS çalıştırmaz; Google ve Applebot çalıştırır | Metin sunucudan HTML gelir, 3D ve film üstüne biner. Scrollcraft zaten gerçek semantik HTML yazıyor; "ham HTML sınavı" teslim kapısına eklenir |
| Lüks sayfada az söz | Motor kanıt birimi ister | Vitrin sinematik kalır; altında aynı görkemle tasarlanmış teknik dosya, malzeme, fiyat, basın, SSS, zaman çizelgesi durur |
| Film ve görsel | Google görsel ve videoyu değerli sayar, ama metin metne dayanır | Film sayfası, transcript ve açıklamayı HTML'de taşır; görsel, metin ve video aynı varlığı anlatır (Bing) |
| Tam ekran katmanlar, özel imleç | web.dev: saydam üst katman altındaki öğeyi gizleyebilir | Etkileşimli öğe gerçek `<button>` ve `<a>`, `label for`, `cursor: pointer`, 8 piksel karenin üstü, dekor katmanı etkileşimi kapatır |
| Kayan yerleşim, hover'a bağlı eylem | web.dev: ekran görüntüsü alan ajan şaşırır | Satın alma düğmesi şablonlarda aynı yerde durur; eylem hover'a bağlı olmaz; hareket azaltma tercihi sabit bir durum verir (son madde benim çıkarımım) |
| Ağır HTML | Token maliyeti; Cloudflare kendi yazısında 16.180'den 3.150 tokene indi | Aynı URL'de `Accept: text/markdown` ile metin sürümü. Wow'a dokunmaz; içerik görünürle aynı kalır. Google bunu kullanmaz, kodlama ajanları kullanır |

Bu turda belirli ödüllü siteleri tek tek test etmedim; tablo teknik düzeydir.

## 5. Aletler

| Ad | Gerçekte ne yapar | Gerçek mi | Eşi | Bizde | Yeri |
|---|---|---|---|---|---|
| Search Console üretken AI raporu | Google gösterimi; tıklama ve sorgu yok | Resmî, ücretsiz, Ağu 2026 küresel | Birincil veri, eşi yok | Yok | Aylık iş |
| Bing AI Performance + IndexNow | Atıf, grounding ifadesi, Citation Share | Resmî, önizleme | Birincil veri | Yok | Kurulum + aylık |
| OpenSEO | Semrush/Ahrefs açık eşi, AI izleyici, 12 skill | MIT, 26.239 yıldız, 2026-10-31 | Semrush, Ahrefs | Skill rafta; uygulama kurulumu tahtada #47; DataForSEO ~50 $ para çıkışı, onda | Ortak raf |
| Elmo | Tüketici uygulamalarını günde birkaç kez koşar, MCP sunar | MIT, 560 yıldız, 2026-11-02; Cloud 29 $'dan; Cloro aracılığıyla çeker | Peec, Profound | Yok | Denemeye aday MCP |
| Peec | Günlük izleme, olgu kontrolü | 95/245/495 $ (3 Kas sayfası; ikincil bir kaynak Ağustos'ta euro düzenine geçti diyor), 50/150/350 soru. 4.500 aylık cevap = 50 × 3 motor × 30 gün, yani soru başına günde tek koşu (benim hesabım); kısa pencerede güven aralığı geniştir | Elmo | Yok | Ücretli yedek |
| Profound | Kurumsal izleme, ajan analitiği | Fiyat sayfası: deneme + özel teklif | Elmo, GEOInflow | Yok | Büyük müşteri yedeği |
| Otterly | Giriş seviyesi izleme, GEO denetimi | 29/189/489 $; 15/100/400 soru | Elmo | Yok | Yedek |
| Ahrefs Brand Radar | 531 milyon soru havuzu | Sayfada 199 $ ve tüm modeller 699 $/ay; paket sınırı okunmadı | Elmo + OpenSEO | Yok | Yedek |
| GEOInflow | Kendi sunucumuzda yapay zekâ tarayıcı günlük analizi | MIT, 796 yıldız, 2026-11-03; kurup denemedim | Profound Agent Analytics | Yok | Otomatik iş |
| Is Agentic | Ajan hazırlığı 0–100, `npx is-agentic` | Vercel/Ora, ücretsiz; EK12 | isitagentready | Satır var | Teslim kontrolü |
| isitagentready | Cloudflare taraması | Ücretsiz; Radar haftalık benimseme | Is Agentic | Yok | Teslim kontrolü |
| NLWeb | Schema.org üstünde doğal dil + MCP uç noktası | MIT, 6.257 yıldız, 2026-08-11 | Site içi ticari arama | Yok | Büyük katalog için kart |
| WebMCP | Sayfada ajan araçları | Chrome 149 origin trial; W3C topluluk taslağı; 4.871 yıldız, 2026-11-03; GitHub lisans alanı NOASSERTION | MCP sunucusu | Personada var | Deneysel |
| UCP / ACP | Ajanlı ticaret protokolleri | Apache-2.0; 3.470 / 1.593 yıldız | Shopify ve Stripe yönetimli yollar | Yok | E-ticaret kartı |
| llms.txt | Belge dizini | Apache-2.0, 2.679 yıldız | Yok | Yok | Yalnız belge ve API sitesi |

**Elimizdekinde yanlış ya da eksik olan.**
- `openseo/ai-visibility-audit`: "GPTBot ve Google-Extended canlı cevabı değil eğitimi etkiler" der. Google-Extended için bu yanlıştır, Gemini Apps grounding'ini de kapsar. Claude-SearchBot ve kullanıcı botları listede yoktur.
- Aynı skill soru ve motor başına tek cevap, haftalık çizelge kullanır. Dört haftada dört koşu, ±30 puandır. Skill'in kendi uyarısı dürüsttür ama ölçüm kapasitesi trend kararına yetmez; koşu sayısı artırılır.
- `ai-prompt-research` yalnız ABD İngilizcesidir; holding küreseldir.
- `openseo/local-seo` içinde ChatGPT, Bing ve Yelp geçmiyor.
- Persona `marketing-ai-citation-strategist` tekrar protokolüyle iyi kurulmuş, ama "SEO'dan farklı oyun" önermesi ve FAQ/şema "sinyali" kanıtla düzeltilmelidir. `marketing-agentic-search-optimizer` dürüst; WebMCP durumu Chrome 149 ve `document.modelContext` ile güncellenmelidir (eski ad durumu ikincil kaynaklarda çelişiyor).

## 6. Ofisin işi

**Site ustasının elinde ilk günden:** bot matrisi ve CDN ayarı; ham HTML sınavı; kanonik ve yinelenen içerik; Search Console, Bing, IndexNow; zengin sonuç için şema; feed eşitliği; erişilebilirlik ağacı denetimi; hayalet katman yasağı; sunucu günlüğü saklama; GA4 kanal kuralı. Bunlar pakete dahil zemindir.

**Uzman (AI Citation Strategist):** soru evreni, atıf haritası, deney tasarımı, üçüncü taraf planı, doğruluk denetimi, aylık karar notu. Agentic Search Optimizer yalnız işlem akışı değer taşıyan müşteride girer. SEO uzmanı dizin ve sıralamanın sahibidir; iki rol aynı şemayı yazmaz.

| Sıklık | İş | Sahibi |
|---|---|---|
| Kurulumda bir kez | Zemin listesi, temel ölçüm, kontrol grubu seçimi | Usta + uzman |
| Otomatik | Yayında IndexNow; robots ve 403 değişim alarmı; bot günlüğü; günlük soru koşuları; feed hata alarmı | Altyapı |
| Aylık | Görünme oranı, güven aralığı, atıf haritası farkı, doğruluk listesi, üç karar | Uzman |
| Üç aylık | Soru evreni yenileme, motor değişikliği okuması, deney sonucu | Uzman + usta |

Yapay zekâ verisiyle haftalık karar verilmez. Haftalık olanlar teknik hata ve Search Console'dur.

## 7. Satılabilecekler

Formal fiyat anketi bulamadım; aşağıdakiler satıcı rakamıdır.

| Ürün | Müşteri neye para verir | Piyasa |
|---|---|---|
| Yapay zekâ görünürlük denetimi | Tekrarlı ölçüm, atıf haritası, erişim hatası, üç karar | Bir kerelik 1.500–5.000 $ (ikincil rehber; başka rehber 10.000–50.000 $ der) |
| Aylık ölçüm ve karar | Görünme oranı + doğruluk + yapılan iş | WebFX küçük işletme 1.500–5.000 $/ay; AI SEO 3.000 $/ay'dan; kurumsal 22.500 $/ay'dan (WebFX sayfaları, arama özetinden) |
| Yerel veri ve yorum yönetimi | GBP, Yelp, rehberler, doğruluk | Ahrefs yerel SEO ort. 1.557 $/ay, 439 sağlayıcı. Sayfa 15 Ağu 2024 güncellemesi, veri daha eskidir |
| E-ticaret hazırlığı | Feed, ürün verisi, ajan akışı | Fiyat bulunamadı |
| Ajan hazırlığı | Site yapısı ve akış testi | Tek ürün olarak zayıf; yapım paketine girer |

Satılmayanlar: llms.txt, "AI için şema", sıra takibi, sıra garantisi, sayfa adedi.

### W072 ve W073'ün sınavı

| Teklifteki | Hüküm | Değişiklik |
|---|---|---|
| Veri → brif → onay → yayın → ölçüm döngüsü | Ayakta | Holdingin onay kapısına uyar; kontrol grubu eklenir |
| Haftalık brif, LLM atıf verisiyle | Yanlış ritim | Teknik ve Search Console haftalık, yapay zekâ verisi aylık |
| "Agentic website" adı | Karışık | Piyasada "agent-ready" sitenin ajanlarca kullanılması demek. W072 ajanların sitenin bakımını yaptığı döngüyü anlatıyor; Searchmaxxed'in menüsü bile bunu "Websites built to rank" diye açıklıyor. Ad müşteriye yanlış beklenti verir, döngü başka adla satılır |
| Ayda 8/30/50 sayfa | Tehlikeli birim | Google fan-out için sayfa çoğaltmayı ve bölge şehir sayfası huni tarzı doorway'i açıkça yazar. Searchmaxxed'in "service-by-suburb" kalemi bu sınıra yakındır. Satılan birim, kanıt birimi ve karar olur |
| "Ayda 10–20 Reddit anılması" | Kalem alınmaz | Şirket şimdi "written in your voice and within each platform's rules" diyor ve plana bağlı "tracked mentions" satıyor; ajansın müşteri ağzından yazması açıklanmazsa aldatmadır. Holding yolu: açık kimlik, müşterinin kendi çalışanı, topluluk kuralı izni |
| 90 günde ilk 3 yoksa iade | Bugün sayfada yok | 3 Kasım metninde "refund/guarantee/money back" geçmiyor; satır güncellenir. Google "kimse #1 garanti edemez" der, Bing GEO'da atıf garantisi olmadığını yazar; bizde sıra garantisi yok |
| 30/50 sayfa rakamları | Eskimiş | Fiyat sayfası bugün yalnız Local için "en az 8" diyor |
| Ücretsiz "görünmezlik denetimi" | Yönteme bağlı | Tek koşu ekran görüntüsü müşteriyi yanıltır; en az 8 koşu ve aralık yazılır |
| GBP'den başlamak | Google ve Gemini için doğru | ChatGPT için Yelp ve Bing yolu eklenir, ülkeye göre rehber seçilir |
| OpenSEO veri ayağı | Yetersiz | Koşu sayısı artırılır ya da Elmo denenir |
| Fiyat çapası 2.917 $ ve 1.557 $ | Tarihi yazılmamış | "Ölçülmüş" yazısına yılı eklenir |
| Kendi sitemizde 2 hafta | Kısa | Schulte'ye göre 28 günlük pencere ±6,5; en az bir tam pencere ve kontrol sayfaları gerekir |

**Hukuk.** Küresel ilke: sahte ya da gizli tanıtım tüketiciyi aldatan uygulamadır. ABD: FTC kuralı 21 Eki 2024'ten beri, ihlal başına 53.088 $'a kadar (2025 rakamı, yıllık güncellenir). Birleşik Krallık: DMCC, 6 Nis 2025'ten beri, küresel cironun %10'una kadar; CMA 27 Mar 2026'da beş soruşturma açtı. AB ve Türkiye bu turda açılmadı. Aldatma İslami sınıra da değer; W073'teki not geçerlidir.

## 8. En iyi kaynaklar

**Ortak bilgiye girmesi gerekenler:** Google rehberi (developers.google.com/search/docs/fundamentals/ai-optimization-guide), Search generative AI control yardımı (support.google.com/webmasters/answer/16908024), Google tarayıcı listesi, OpenAI bots (developers.openai.com/api/docs/bots), Anthropic tarayıcı makalesi, Perplexity bots, Microsoft'un 8 Eki 2025 yazısı, Bing Webmaster Guidelines 2026, web.dev `ai-agent-site-ux`.

**Araştırma:** Martinez taraması (kanıt tablosu ve ölçüm protokolü doğrudan ofis standardı olur), Schulte *Don't Measure Once* (2604.07585), C-SEO Bench (2506.11097), SAGEO Arena (2602.12187), Watanabe (2606.04362), E-GEO (2511.20867).

**Uygulayıcılar:** Rand Fishkin, kuşkucu başlayıp ölçümle görüşünü düzelttiği için. Ahrefs'ten Louise Linehan ve Xibeijia Guan, fark-içinde-fark kullandıkları için; Ahrefs araç sattığı için okuma bunu bilerek yapılır. Lily Ray, spam ve geri tepmeyi erken gördüğü için. Mike King, fan-out ve retrieval dilini kurduğu için. Mark Williams-Cook, küçük temiz testler için. Barry Schwartz, günlük resmî değişiklik için. Dan Petrovic'in grounding bütçesi çalışmasını birincilden okuyamadım.

## 9. Bilinmeyenler

- OpenAI'nin kendi dizini ile ortak arama arasındaki pay ve Google sonuçlarının rolü bilinmiyor; Google v. SerpApi dosyası OpenAI'yi anmıyor. Fan-out kayıtlı tüketici koşularıyla kısmen çözülür.
- Vercel/MERJ JS bulgusu Aralık 2024'tür; 2026 tekrarı yok. Kendi test sayfamızda günlük okumayla bir gün içinde sınanır.
- GPTBot veya ClaudeBot'u kapatmanın canlı görünürlüğe etkisi ölçülmemiş. Eşleştirilmiş site deneyi gerekir.
- Yapay zekâ görünürlüğünün gelirle nedensel bağı kurulmamış. Sayfa düzeyinde rastgele atama gerekir.
- Türkçe ve Almanca gibi dillerde çok motorlu oynaklık az çalışılmış; Schulte İsviçre Almancası, Kirsten ABD ve Almanya.
- Yelp anlaşmasının ChatGPT seçimine etkisi ve ABD dışı karşılığı bilinmiyor. SOCi tekrarı ile görülür.
- Kaç isteğin gerçekten `Accept: text/markdown` gönderdiği ve imzalı ajan payı yayımlanmamış. Müşteri günlükleri çözer.
- GA4'ün yerel AI kanalı (13 Mayıs 2026) ve ChatGPT UTM kesintisi tek kaynaklıdır; resmî belge bulamadım.
- WebMCP deneme bitişi kaynaklarda Chrome 156 ile 162 arasında çelişiyor; blink-dev okunmalı.
- AB ve Türkiye'nin sahte yorum ve gizli reklam hükümleri açılmadı.
- Kirsten, Grossman, Vishwakarma ve SAGEO sayıları tarama üzerinden okunmuştur.
