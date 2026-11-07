Viral kısa video formatını araştırmak için bir kanalın kendi ortalamasını katlayan "outlier" videoları bulan bir araç ya da açık kaynak bir skill kullanılıyor. Kazanan reklam kreatifi için yerleşik yöntem, Meta Ad Library'de uzun süredir yayında olan reklamları filtrelemek. İki iş için de açık kaynak kod var, ancak yayın süresi kârlılığın kanıtı sayılmamalı. [L1432, L0664, L1399, L0816] ↔ [L1401, L1446]

Kazananı nasıl seçtiğini söyleyen 5 satırın 4'ü reklamın yayında kalma süresine bakıyor (4 bağımsız kaynak; en güçlüleri L1399 ve L0816). Beşinci satır ise tersine son 30 günde başlayan reklamları filtreliyor. [L1399, L0816, L1413, L1420] ↔ [L1419]

## Şekil — Karar

### Hüküm
- Viral format için bir outlier aracı ya da açık kaynak bir skill kullanın. Kazanan kreatif için Meta Ad Library'de uzun süredir yayındaki reklamları filtreleyin, ama süreyi kârlılığın kanıtı saymayın. [L1432, L0664, L1399, L0816] ↔ [L1401, L1446]
- Outlier mantığı, yani bir kanalın ya da hesabın kendi medyanına göre kat hesabı, en çok tarif edilen yöntem: 5 satır, 3 bağımsız kaynak; en güçlüleri L1432 ve L0664. [L1432, L1434, L0664, L1423, L0046]
- Kazananı seçmede yayın süresi baskın ölçüt: ölçüt belirten 5 satırın 4'ü süreye bakıyor. [L1399, L0816, L1413, L1420] ↔ [L1419]
- İki iş için de kendi makinenizde çalıştırabileceğiniz açık kaynak kod mevcut (4 satır, 4 bağımsız kaynak). Karşı satır arandı, bulunmadı. [L0658, L0816, L1433, L1407]

### Riskler
- "Yüksek performanslı" etiketine kanıt sorularak itiraz ediliyor, bunun kâr anlamına gelmediği söyleniyor ve Library reklamları performans sinyaline bağlamaya imkân vermiyor (3 satır). [L1401, L1446, L1448]
- Meta'nın Andromeda sistemi, kazananın varyasyonlarını tek reklam gibi görüyor. Benzer açılışa sahip videolar neredeyse aynı reklam sayılıyor (3 satır, 2 bağımsız kaynak). [L1421, L1431, L1010]
- Library'yi kazımak 403 hatasına ve veri merkezi IP engeline takılıyor (2 satır). [L1447, L1441]
- Claude, Ads Library API üzerinden videoyu izlemiyor, yalnızca metadata'ya bakıyor. Bu tek kaynak. [L1445]
- İncelenen aracın lisansı çok kiracılı kullanımı ve yeniden satışı kısıtlıyor. Bu tek kaynak. [L1436]

### Hükmü ne değiştirir
- Yayın süresini harcama ya da dönüşümle eşleyen bir veri bulunursa ölçüt ya doğrulanır ya da çürür. Satırlar böyle bir veri sunmuyor; teslimat ve optimizasyon verisi dışarıdan gözlemlenemiyor. Karşı satır arandı, bulunmadı. [L1449, L0784, L1448]
- Kopya tespiti organik kısa videoya da uzanırsa "yapıyı koru, ürünü değiştir" yöntemi zayıflar. Satırlar bunu yalnızca reklam için söylüyor. [L1431, L1410]
- Bir aracı kullanıp bırakan bağımsız bir tanıklık hükmü zayıflatırdı. Bu yönde tek satır var ve o kullanıcı da sonra geri dönmüş. Bu tek kaynak. [L1442]

## S1 — Viral kısa video format araçları

- **Outlier araçları:** En çok tarif edilen yöntem, bir kanalın kendi ortalamasını katlayan videoyu bulup yapısını taklit etmek (9 satır / 6 adres; en güçlüleri L1432 ve L0664). Bu iş için ViewStats anılıyor; Sandcastles da aynı mantıkla çalışıyor. Karşı satır arandı, bulunmadı. [L1432, L0664, L1423, L1434, L0046, L0643, L1409, L0146, L1443]
- Outlier mantığı birbirinden bağımsız birden çok kaynakta aynı şekilde tarif ediliyor (5 satır, 3 bağımsız kaynak). Karşı satır arandı, bulunmadı. [L0664, L1423, L1432, L1434, L0046]
- **Format klonlama skill'leri:** Viral bir videoyu sahne sahne çözüp kendi fikrinizi aynı yapıya yazan araçlar var: Scenario'nun Claude skill'i, rea-video ve Hypit (8 satır, 4 bağımsız kaynak; en güçlüleri L1424 ve L1438). [L1424, L1404, L0326, L0327, L1438, L1110, L1406, L1326]
- **Çok platformlu araştırma skill'leri:** ScrapeCreators'ın skill'leri TikTok, Instagram, YouTube, Reddit, X ve LinkedIn genelinde outlier gönderi, yorum madenciliği ve rakip analizi yapıyor. X'te iki ayrı repo listesinde öneriliyor (7 satır, 3 bağımsız kaynak). [L1426, L1034, L1117, L1408, L1115, L1417, L1032]
- **MCP ile trend arama:** Revid'in MCP'si son 30 günde viral olan videoları arıyor. Bu tek kaynak. [L1425, L1292]
- **Kendi aracını kurmak:** Rakiplerin viral videolarını kazıyan aracı kişi Claude Code ile kendisi kuruyor; en iyi Shorts videoları ve transkriptleri yt-dlp ile çekiliyor (4 satır / 2 adres). [L1439, L0670, L1415, L0400]
- **Elle yöntem:** İki elle yol da anılıyor: yalnızca nişi takip eden bir araştırma hesabı açıp akışı güncel hook'lara çevirmek ve yüksek izlenmeli videoları elle analiz etmek (4 satır / 2 adres). [L1416, L0594, L1411, L0109]
- İzlenme sayısının yapının işe yaradığını kanıtladığı savunuluyor. Bu tek kaynak. [L1427, L0673]

## S2 — Reklam kütüphanesi kazanan kreatifler

- **Temel kaynak Meta Ad Library:** Ücretsiz ve herkese açık; büyük markaların aktif reklamlarını gösteriyor (3 satır / 3 adres). Ancak araştırma işlevleri eksik. [L1309, L1312, L1402] ↔ [L1448]
- **Kazanan ölçütü yayın süresi:** Seçim ölçütü belirten 5 satırın 4'ü süreye bakıyor; eşik birkaç haftadan 6 aya ve 1 yıla kadar değişiyor. Açık kaynak tracker da kazananı süreyle buluyor. Buna karşılık bir satır son 30 günde başlayan reklamları öneriyor. [L1399, L1413, L1420, L0633, L0816] ↔ [L1419, L1265]
- **Ücretli araçlar:** Foreplay, Library'deki reklamları indiriyor. GetHookd trend takibi için öneriliyor. Focal ve AdStellar ise Library'nin eksiklerini kapatmak için kendi araçlarını sunuyor (5 satır / 4 adres). [L1430, L1419, L1444, L0909, L0852]
- **Elle seçilmiş ücretsiz kütüphaneler:** Magritte (3.000'den 7.000'e çıkan reklam), The Ad Vault (75+), 203 örnekli bir Meta kreatif kütüphanesi ve bir AI prompt kütüphanesi var. Hepsini kendi sahipleri tanıtıyor ve "yüksek performans" iddiaları sorgulanıyor (9 satır, 4 bağımsız kaynak). [L1308, L1307, L1412, L0849, L1402, L0875, L1305, L1403, L1400] ↔ [L1401, L1446]
- **Claude ile analiz:** Library'den kanıtlanmış kazananları Claude'a verip varyant üretmek ve reklamları açıya göre gruplamak öneriliyor; araştırma kısmının otomatikleştiği söyleniyor (8 satır / 5 adres). Karşı tarafta, Meta'nın kopyaları cezalandırdığı belirtiliyor. [L1414, L1407, L1020, L1405, L1298, L1410, L1255, L1433] ↔ [L1421, L1431]
- **Library'nin sınırları:** Library şeffaflık için yapılmış. Filtrelemesi zayıf, kaydetme özelliği yok, performans sinyali yok. API üzerinden yalnızca metadata geliyor ve kazıma 403 hatasına ve IP engeline takılıyor (8 satır, 5 bağımsız kaynak). Karşı satır arandı, bulunmadı. [L1444, L1448, L1445, L1449, L1447, L0807, L1441, L0816]
- Ad Library'yi Python ile kazımak için bir rehber var, ancak anahtar kelime aramasında 403 alınıyor. [L0807, L1447]
- **Kapsam:** Genfeed'in ücretli kreatif araştırması yalnızca X'i kapsıyor; Meta, TikTok ve Google kaynakları henüz bekleniyor. [L1428, L0847]

## S3 — Açık kaynak alternatifler

| Araç | Ne yapıyor | Not |
|---|---|---|
| viral_short_research_tool | YouTube Shorts'ta anahtar kelimeyle viralite skoru, hook ve yapı çıkarımı [L0658] | İndirici yok, YouTube Data API ile çalışıyor [L1435] |
| Jakeschincariol yt-viral / ig-viral | Nişte işe yarayanı kendi medyanına göre kat ile sıralıyor [L1432, L1434] | MIT ve ücretsiz; X'te repo listelerinde öneriliyor [L0331, L0332, L1418, L0328] |
| ScrapeCreators social-media-research-skills | Outlier ve rakip analizi; ad-library-teardown ile Meta, Google ve LinkedIn reklamlarında hook, açı ve CTA analizi [L1433, L1426] | ScrapeCreators ile çalışıyor [L1117] |
| marketing-skills / competitor-creative-analysis | Meta Ad Library'den rakip reklamlarını çekip açıya göre grupluyor, boşluk buluyor [L1407] | Yaklaşık 7k yıldız; 49 ücretsiz pazarlama skill'i [L1407, L1451, L1450] |
| meta-ads-competitor-tracker | Self-hosted Meta reklam takibi, kreatif arşivi, kazananı yayın süresiyle bulma [L0816] | Proxy olmadan rate limit ve IP engeli riski [L1441] |
| rea-video | Videoyu sahne sahne çözüp nasıl yeniden yapılacağını çıkarıyor [L1438, L1111] | — |
| Hypit | Bir viral videodan yüzlerce varyant üretiyor; tek kaynak [L1326] | Lisans çok kiracılı kullanımı ve yeniden satışı kısıtlıyor; tek kaynak [L1436] |
| yt-dlp | Video ve transkript indirme [L1440, L0402] | Analiz aracı değil, veri çekme katmanı [L1415] |
| AI-Youtube-Shorts-Generator | Uzun videodan 9:16 Shorts kesiyor [L1437] | Araştırma değil, üretim aracı [L0336] |

- Videoda gösterilen araç, rakiplerin viral videolarını kazımak için kişinin kendisi tarafından kuruluyor. Bu tek kaynak; karşı satır arandı, bulunmadı. [L1439, L0670]
- Genfeed'in Meta ve TikTok kaynaklarını eklemesi açık kaynak seçeneği genişletir, ancak bu henüz planlama aşamasında. Bu tek kaynak. [L0847]

## Çelişkiler

- **Uzun süredir yayında olan mı, yeni başlayan mı:** Üç satır uzun süredir yayındaki reklamları öneriyor; bir satır son 30 günde başlayanları filtreliyor. [L1399, L1413, L1420] ↔ [L1419]
- **Kazananı kopyalamak işe yarıyor mu:** Kazananı kopyalayıp remikslemek öneriliyor, oysa Meta kopyaları tek reklam sayıp cezalandırıyor. [L1443, L1410, L1414] ↔ [L1421, L1431]
- **"Yüksek performanslı" etiketi:** Kütüphaneler bu etiketi kullanıyor; karşı tarafta kanıtı soruluyor ve bu reklamların en kârlı olanlar olmadığı söyleniyor. [L1307, L1308, L0849] ↔ [L1401, L1446]
- **Araştırma otomatikleşti mi:** Otomatikleştiği söyleniyor; karşı tarafta kazımanın engellendiği ve yalnızca metadata görüldüğü belirtiliyor. [L1405, L1407] ↔ [L1447, L1441, L1445]
- **Yapı önceden kestirilebilir mi:** İzlenmenin yapıyı kanıtladığı söyleniyor; karşı tarafta harcamadan önce neyin işe yarayacağını kimsenin kestiremediği söyleniyor. Bu tek kaynak. [L1427] ↔ [L1422]

## Cevabı ne değiştirir

- Yayın süresini kârlılıkla eşleyen bir veri cevabı değiştirirdi. Satırlar böyle bir veri sunmuyor ve teslimat verisi dışarıdan görülemiyor; karşı satır arandı, bulunmadı. [L1449, L1448]
- Bir aracı bıraktığını anlatan bağımsız kullanıcı tanıklıkları da cevabı değiştirirdi. Tek örnek aracın kendi sitesindeki bir referans ve o kullanıcı da sonradan araca geri dönmüş. Bu tek kaynak. [L1442]

## Alınmayan kanıt
- [L1310] — içeriksiz tanıtım bağlantısı
