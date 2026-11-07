Viral kısa video formatını araştırmanın yerleşik yolu, bir kanalın kendi ortalamasını katlayan "outlier" videoları bulup yapısını çözmektir; bunu ücretli servisler (ViewStats, Sandcastles) ve Claude Code gibi ajanlara takılan açık kaynak skill'ler yapıyor. Kazanan reklam kreatifi ise ücretsiz Meta Ad Library'de uzun süredir yayında olan reklamlardan seçiliyor ve bunu otomatikleştiren açık kaynak tracker'lar ile skill'ler de var. [L0664, L1432, L0046, L1399, L0816]

Kazananı nasıl seçtiğini söyleyen 5 satırın 4'ü reklamın yayında kalma süresine bakıyor (en güçlüleri L1399, L0816) [L1399, L0816, L1413, L1420] ↔ beşincisi tersine son 30 günde başlayan reklamları filtreliyor [L1419].

## Şekil — Karar

### Hüküm
- Viral format için bir outlier aracı ya da açık kaynak bir skill kullanın; kazanan kreatif için Meta Ad Library'de uzun süredir yayındaki reklamları filtreleyin, ama süreyi kârlılığın kanıtı saymayın ve kazananı birebir kopyalamayın. [L1432, L0664, L1399, L0816, L1421]
- Outlier mantığı (bir kanalın ya da hesabın kendi medyanına göre kat) birbirinden bağımsız birden çok kaynakta aynı şekilde tarif ediliyor. [L0664, L1423, L1432, L1434, L0046]
- Meta Ad Library ücretsiz ve herkese açık; tüm reklamverenlerin aktif reklamlarını gösteriyor. [L1309, L1312]
- Her iki iş için de kendi makinenizde çalıştırabileceğiniz açık kaynak kod mevcut. [L0658, L0816, L1433, L1407]

### Riskler
- "Yüksek performanslı" etiketinin dayanağı yalnızca yayın süresi; bunun kâr anlamına geldiğine itiraz ediliyor ve Library'de performans sinyali bulunmuyor. [L1401, L1446, L1448]
- Meta'nın Andromeda sistemi kazananın varyasyonlarını tek reklam gibi görüyor; benzer açılışa sahip videolar neredeyse aynı reklam sayılıyor. [L1421, L1431, L1010]
- Library'yi kazımak 403 hatasına ve veri merkezi IP engeline takılıyor. [L1447, L1441]
- Claude, Ads Library API üzerinden videoyu izlemiyor, yalnızca metadata'ya bakıyor. [L1445]
- Hypit'in lisansı çok kiracılı kullanımı ve yeniden satışı kısıtlıyor. [L1436]

### Hükmü ne değiştirir
- Yayın süresini harcama ya da dönüşümle eşleyen bir veri bulunursa ölçüt doğrulanır ya da çürür; satırlar böyle bir veri sunmuyor, teslimat ve optimizasyon verisi dışarıdan gözlemlenemiyor. [L1449, L0784, L1448]
- Kopya tespiti organik kısa videoya da uzanırsa "yapıyı koru, ürünü değiştir" yöntemi zayıflar; satırlar bunu yalnızca reklam için söylüyor. [L1431, L1410]
- Bir aracı kullanıp bırakan bağımsız bir tanıklık hükmü zayıflatırdı; bu yönde tek satır var ve o kullanıcı da sonra geri dönmüş. [L1442]

## S1 — Viral kısa video format araçları

- **Outlier araçları:** Bir kanalın kendi ortalamasını katlayan videoyu bulup yapısını taklit etmek en çok tarif edilen yöntem (9 satır / 6 adres; en güçlüleri L1432, L0664). ViewStats bu iş için anılıyor; Sandcastles ise kendi sayfasında nişteki kanalları ve outlier'ları bulup remiksleme vaat ediyor. Remiksin özgünlükten iyi işlediği de tekrar ediliyor. [L1432, L0664, L1423, L1434, L0046, L0643, L1409, L0146, L1443]
- **Format klonlama skill'leri:** Viral bir videoyu sahne sahne çözüp kendi fikrinizi aynı yapıya yazan araçlar var: Scenario'nun Claude skill'i, rea-video ve Hypit (9 satır / 3 araç; en güçlüleri L1424, L1438). [L1424, L1404, L0326, L0327, L1438, L1110, L1406, L1326]
- **Çok platformlu araştırma skill'leri:** ScrapeCreators'ın skill'leri TikTok, Instagram, YouTube, Reddit, X ve LinkedIn genelinde outlier gönderi, yorum madenciliği ve rakip analizi yapıyor; X'te üç ayrı repo listesi bunu öne çıkarıyor (7 satır / 4 adres). [L1426, L1034, L1117, L1408, L1115, L1417, L1032]
- **MCP ile trend arama:** Revid'in MCP'si son 30 günde viral olan videoları arıyor. Bu, tek kaynak. [L1425, L1292]
- **Kendi aracını kurmak:** Rakiplerin viral videolarını kazıyan aracı kişi Claude Code ile kendisi kuruyor; yt-dlp ile en iyi Shorts videoları ve transkriptleri çekiliyor (4 satır / 2 adres). [L1439, L0670, L1415, L0400]
- **Elle yöntem:** Yalnızca nişi takip eden bir araştırma hesabı açıp akışı güncel hook'lara çevirmek ve yüksek izlenmeli videoları elle analiz etmek de anılıyor (4 satır / 2 adres). [L1416, L0594, L1411, L0109]
- İzlenme sayısının yapının işe yaradığını kanıtladığı savunuluyor. [L1427, L0673]

## S2 — Reklam kütüphanesi kazanan kreatifler

- **Temel kaynak Meta Ad Library:** Ücretsiz, herkese açık ve büyük markaların aktif reklamlarını gösteriyor (3 satır / 2 adres). [L1309, L1312, L1402]
- **Kazanan ölçütü yayın süresi:** Seçim ölçütü belirten 5 satırın 4'ü süreye bakıyor; eşik 6 aydan 1 yıla, birkaç haftaya kadar değişiyor. Açık kaynak tracker da kazananı süreyle buluyor. [L1399, L1413, L1420, L0633, L0816] ↔ Bir satır son 30 günde başlayanları filtreliyor. [L1419, L1265]
- **Ücretli araçlar:** Foreplay Library'deki reklamları indiriyor. GetHookd trend takibi için öneriliyor. Focal ve AdStellar, Library'nin eksiklerini kapatmak üzere kendi araçlarını sunuyor (5 satır / 4 adres). [L1430, L1419, L1444, L0909, L0852]
- **Elle seçilmiş ücretsiz kütüphaneler:** Magritte (3.000'den 7.000'e çıkan reklam), The Ad Vault (75+), 203 örnekli bir Meta kreatif kütüphanesi ve AI prompt kütüphanesi var; hepsi kendi sahiplerince tanıtılıyor (9 satır / 5 adres). [L1308, L1307, L1412, L0849, L1402, L0875, L1305, L1403, L1400]
- **Claude ile analiz:** Library'den kanıtlanmış kazananları Claude'a verip varyant üretmek ve reklamları açıya göre gruplamak öneriliyor; araştırma kısmının otomatikleştiği söyleniyor (8 satır / 5 adres). [L1414, L1407, L1020, L1405, L1298, L1410, L1255, L1433]
- **Library'nin sınırları:** Şeffaflık için yapılmış; filtrelemesi zayıf, kaydetme yok, performans sinyali yok. API üzerinden yalnızca metadata geliyor. Kazıma 403 hatasına ve IP engeline takılıyor (8 satır / 6 adres). [L1444, L1448, L1445, L1449, L1447, L0807, L1441, L0816]
- **Kapsam:** Genfeed'in ücretli kreatif araştırması yalnızca X'i kapsıyor; Meta, TikTok ve Google kaynakları henüz bekleniyor. [L1428, L0847]

## S3 — Açık kaynak alternatifler

| Araç | İş | Not |
|---|---|---|
| viral_short_research_tool | YouTube Shorts'ta anahtar kelimeyle viralite skoru, hook ve yapı çıkarımı [L0658] | İndirici yok, YouTube Data API ile çalışıyor [L1435] |
| Jakeschincariol yt-viral / ig-viral | Nişte işe yarayanı kendi medyanına göre kat ile sıralıyor [L1432, L1434] | MIT, ücretsiz; X'te repo listelerinde öneriliyor [L0331, L0332, L1418, L0328] |
| ScrapeCreators social-media-research-skills | Outlier, rakip analizi, `ad-library-teardown` ile Meta, Google ve LinkedIn reklamlarında hook, açı ve CTA analizi [L1433, L1426] | ScrapeCreators ile çalışıyor [L1117] |
| marketing-skills / competitor-creative-analysis | Meta Ad Library'den rakip reklamlarını çekip açıya göre grupluyor, boşluk buluyor [L1407] | Yaklaşık 7k yıldız [L1407] |
| meta-ads-competitor-tracker | Self-hosted Meta reklam takibi, kreatif arşivi, süreyle kazanan bulma [L0816] | Proxy'siz rate limit ve IP engeli riski [L1441] |
| rea-video | Videoyu sahne sahne çözüp nasıl yeniden yapılacağını çıkarıyor [L1438, L1111] | — |
| Hypit | Bir viral videodan yüzlerce varyant üretiyor [L1326] | Lisans çok kiracılı kullanımı ve yeniden satışı kısıtlıyor [L1436] |
| yt-dlp | Video ve transkript indirme [L1440, L0402] | Analiz aracı değil, veri çekme katmanı [L1415] |
| AI-Youtube-Shorts-Generator | Uzun videodan 9:16 Shorts kesiyor [L1437, L0336] | Araştırma değil, üretim aracı [L1437] |

- Videolarda hazır bir açık kaynak araç gösterilmiyor; araç kişinin kendisi tarafından kuruluyor. [L1439, L0670]
- Ad Library'yi Python ile kazıma rehberi var, ancak anahtar kelime aramasında 403 alınıyor. [L0807, L1447]

## Çelişkiler

- **Uzun süredir yayında olan mı, yeni başlayan mı:** [L1399, L1413, L1420] ↔ [L1419]
- **Kazananı kopyalamak işe yarıyor mu:** Kazananı kopyalayıp remikslemek öneriliyor [L1443, L1410, L1414] ↔ Meta kopyaları tek reklam sayıp cezalandırıyor [L1421, L1431].
- **"Yüksek performanslı" etiketi:** Kütüphaneler bu etiketi kullanıyor [L1307, L1308, L0849] ↔ kanıtı soruluyor ve en kârlı olmadıkları söyleniyor [L1401, L1446].
- **Araştırma otomatikleşti mi:** Otomatikleştiği söyleniyor [L1405, L1407] ↔ kazıma engelleniyor ve yalnızca metadata görülüyor [L1447, L1441, L1445].
- **Yapı önceden kestirilebilir mi:** İzlenme yapıyı kanıtlıyor deniyor [L1427] ↔ harcamadan önce neyin işe yarayacağını kimse kestiremiyor deniyor [L1422].

## Cevabı ne değiştirir

- Yayın süresini kârlılıkla eşleyen bir veri; satırlar böyle bir veri sunmuyor ve dışarıdan teslimat verisi görülemiyor. [L1449, L1448]
- Bir aracı bıraktığını anlatan bağımsız kullanıcı tanıklıkları; tek örnek de sonradan araca geri dönmüş. [L1442]
- Genfeed'in Meta ve TikTok kaynaklarını eklemesi açık kaynak seçeneği genişletir; bu henüz planlanma aşamasında. [L0847]

## Alınmayan kanıt
- [L1310] — zayıf, yalnız bağlantı
