# Reklam, ölçüm ve dönüşüm — ofisin bilmesi gerekenler

Tarih: 2026-11-03. Yıldız, sürüm ve lisans sayıları aynı gün GitHub API'den okundu. Araştırma zemini: `tracks/ground-4-reklam/`.

## 1. Özet

1. Reklamı reklam hesabı değil, sitenin verdiği sinyal yönetir. Google ve Meta'nın otomasyonu neyi öğretirseniz onu çoğaltır; yanlış sayılan dönüşüm, bütçeyi yanlış yere yakan bir talimattır.
2. Bir kuruş harcanmadan önce olması gerekenler: müşterinin kendi adına hesapları, olay sözleşmesi, rıza yönetimi, arka uçla karşılaştırılmış dönüşüm sayısı, tıklama kimliklerini saklayan CRM ve değer bilgisi.
3. Consent Mode modellemesi küçük müşteride çalışmaz: GA4 günde 1.000 reddedilmiş olay ve 1.000 kullanıcı, Google Ads ülke ve alan adı başına 7 günde 700 tıklama ister.
4. Server-side rızanın yerini tutmaz. Bilinçli kurulursa sinyal kalitesini, güvenliği ve sayfa hızını iyileştirir; "%30 geri kazanım" sözlerinin kontrollü ölçümü yoktur.
5. Üç eski bilgi öldü: Chrome üçüncü taraf çerezini kaldırmıyor (17 Ekim 2025), Google Ads API çevrimdışı dönüşüm kabul etmiyor (15 Haziran 2026'dan beri Data Manager API), geliştirici jetonu bitti (9 Eylül 2026).
6. Platformun gösterdiği ROAS etki ölçümü değildir. 663 deneyde gözlemsel yöntemler alt huni etkisini %5 yerine %24-64 buldu. Yanıtı veren tek şey deneydir.
7. A/B testi çoğu müşteride matematik olarak mümkün değildir. %3 dönüşümde %10 artışı görmek için kol başına 53.211 ziyaretçi gerekir. Küçük müşteriye test değil, araştırma satılır.
8. Otomasyon sonucu geniş dağılır: AI Max'te medyan değer +%13 iken CPA +%16; Advantage+ ise markaların %42'sinde önde, %58'inde geride kaldı. Her iki taraf da müşteri bazında denenir.
9. Ajan bugün reklam hesabında okur, teşhis eder, taslak hazırlar. Resmî Google MCP'de bütçe, teklif ve duraklatma aracı yoktur. Resmî Meta MCP yazabilir ve canlı bütçe değişikliği anında işler; bu yüzden yalnız `ads_read` verilir.
10. W096 satırı düzeltilmeli: claude-ads bugün puan vermiyor, canlı hesaba yazmıyor, canlı hesaba bağlanmıyor ve bu makinede kurulu değil. Dışa aktarım denetçisidir; canlı okuma gözünü resmî MCP'ler verir.

## 2. Kanıt durumu

| İddia | Güç | Kaynak ve tarih |
|---|---|---|
| Chrome üçüncü taraf çerezini tutuyor; Topics, Protected Audience, Attribution Reporting emekli | resmî | Google Privacy Sandbox, 2025-10-17 |
| "Çerezsiz gelecek" Chrome'dan geliyor | **efsane** | aynı duyuru |
| Safari 26 standart gezinmede gclid'i siliyor | **efsane** (beta'da vardı, 26.0'a girmedi; özel gezinme, Mail, Mesajlar'da siliyor) | AbleCDP testi ve Safari 26.0 notları, 2025; blogların çoğu aksini yazıyor |
| JS çerezi Safari'de 7 gün, bağlantı süslemesiyle 24 saat yaşar | resmî | WebKit Tracking Prevention |
| sGTM ile Safari çerezi her zaman uzar | **kısmen yanlış**: üçüncü taraf CNAME/IP gizlemesinde HTTP çerezi de 7 gün | WebKit |
| GA4 modellemesi: ≥1.000 reddedilmiş olay/gün (7 gün) ve ≥1.000 kullanıcı/gün (28 günün 7'si); eşik garanti değil | resmî | Analytics Help 11161109 |
| Ads modellemesi: 7 günde 700 tıklama, ülke ve alan adı başına | resmî | Ads Help 10548233 |
| Çevrimdışı ve EC for Leads yüklemeleri 15 Haziran 2026'dan beri Data Manager API'den | resmî | Ads Help 2998031 |
| Geliştirici jetonu 9 Eylül 2026'da bitti; erişim Cloud projesinde | resmî | Google Ads API belgeleri |
| Meta tekilleştirme: aynı `event_id` ve olay adı, 48 saat, genelde ilk gelen kalır | resmî | Meta Developers |
| CAPI + Pixel CPA'yı %13 iyileştirir | satıcı iddiası (Meta, 2022, 28 deney; başka kaynakta %17,8, karşılaştırma tabanı farklı) | Meta Blueprint üzerinden |
| EMQ "6 iyi, 8 üstü harika" | **efsane değil ama blog geleneği**; resmî eşik bulunamadı | üçüncü taraf rehberler |
| Tag gateway ölçümü %14 artırır | satıcı iddiası; Google kaynağı bulunamadı (başka satıcı +%15-25 diyor) | Datahash, 2026 |
| Gözlemsel atıf deneyi tutturamaz: medyan etki RCT %29/18/5, DML %83/58/24, SPSM %173/176/64 | kontrollü ölçüm (663 RCT; yazarların Facebook bağı var) | Gordon, Moakler, Zettelmeyer, Marketing Science 2023 |
| eBay marka kelimesinde ölçülebilir kısa vadeli fayda yok; sık alıcılar harcamayı yutuyor | kontrollü ölçüm (tek şirket, güçlü marka, 2014) | Blake, Nosko, Tadelis, NBER 20171 |
| Meta 7 günlük tıklama artımlılığı ortalama %15 düşük gösteriyor | satıcı iddiası (640 test; ortalama harcama yılda 14 M $) | Haus, 2025-07-28 |
| Meta Incremental Attribution standart ayarı geçti: 0,80x → 1,26x | satıcı iddiası, "mütevazı" örneklem, karışım etkisi var | Haus, 2026-07 |
| AI Max: medyan değer +%13, CPA +%16; ROAS -%35 ile +%42 arası | uygulayıcı verisi (250+ kampanya, kontrol grubu yok) | SMEC, SEJ, 2026-03-05; Google'ın iddiası +%14 |
| PMax Standard Shopping'den öncelikli çalışır | **efsane** (Ekim 2024'ten beri Ad Rank) | AdsLiaison, Search Engine Roundtable |
| Vodafone: LCP %31 iyileşti, satış %8 arttı | kontrollü ölçüm (sayfa A/B'yi ima eder, açıkça söylemez) | web.dev |
| Landing medyan dönüşüm %6,6 | satıcı iddiası (41.000 sayfa, Q4 2024) | Unbounce |
| Testlerin medyan artışı %0,08; anlamlı kazanan %33,5 | uygulayıcı verisi (1.001 test) | Georgiev, Analytics-Toolkit, 2022 |
| p<0,05 "kazanan"ın yanlış çıkma riski %5'tir | **efsane**: başarı oranı %8'de %26,4, %10'da %22 | Kohavi, Deng, Vermeer, KDD 2022 |
| "Demand Gen'de bütçe tCPA'nın 15 katı olmalı" | doğrulanamadı; Google kaynağı yok | Google'ın en iyi uygulama sayfaları sayı vermiyor |
| "Server-side reklam engelleyiciyi aşar, kullanın" | uygulayıcı karşı görüşü: aşabilir, amaç bu olmamalı | Simo Ahava, 2020 |

## 3. Dünya seviyesi nasıl yapılır

### 3.1 Reklamdan önce: kapı listesi

Ofis eşikleri bizim kararımızdır, sektör standardı değildir.

1. **Ekonomi:** brüt kâr, izin verilen CAC, ilk sipariş ve 12 aylık değer yazılı. Acemi ajans ROAS hedefiyle başlar; ROAS kârı söylemez.
2. **Hesap sahipliği:** Ads, Business Manager, Merchant Center, GTM ve GA4 müşterinin adınadır; biz iş ortağı erişimiyle gireriz. Alan adı doğrulaması ve reklamveren doğrulaması biter.
3. **Olay sözleşmesi:** her olayın adı, tetikleyicisi, parametresi, `event_id`'si, para birimi ve sahibi tek belgede. Şablon: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`; hizmette `generate_lead`, `qualified_lead`, `sale`.
4. **Birincil dönüşüm:** algoritma yalnız parasal değeri olan eylemi görür. Sayfa görüntüleme ve kaydırma ikincil kalır.
5. **CRM:** gclid, gbraid, wbraid, fbc, fbp, ttclid, li_fat_id ve UTM'ler forma gizli alan olarak yazılır, aday kaydında saklanır. Saklanmayan kimlik sonradan satışa bağlanamaz.
6. **Rıza:** Google sertifikalı CMP, varsayılan red, tag'lerden önce yüklenir.
7. **Mutabakat:** 7 gün boyunca GA4 ve platform sayısı arka uçla karşılaştırılır. Ofis eşiği ±%10; dışındaysa reklam açılmaz.
8. **Sayfa:** mobilde LCP 2,5 sn altı, reklamın söz verdiği teklif ilk ekranda, telefon ve WhatsApp ölçülüyor.

### 3.2 Ölçüm katmanları

- **Veri katmanı:** site olayları GTM'e değil `dataLayer`'a yazar. Olay bir kez üretilir, `event_id` orada doğar, tarayıcı ve sunucu aynı kimliği kullanır.
- **Rıza:** dört ana parametre `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`. Basic modda tag rızadan önce hiç yüklenmez, genel model çalışır. Advanced modda çerezsiz ping gider, reklamverene özel model kurulur. Hangisi seçileceği bölge ve hukuk kararıdır. Küçük sitede Advanced modelleme eşiği zaten tutmaz; orada Basic daha temizdir. Consent durumu ağ isteğindeki `gcs` parametresinden doğrulanır.
- **GA4:** "tek doğru" değil, sitenin gözlem defteridir. BigQuery dışa aktarımı ilk gün açılır; geçmiş sonradan gelmez. `transaction_id` zorunludur. Üç rıza durumu (kabul, red, seçim yok) ayrı ayrı denenir; Didomi 2026 verisinde Avrupa'da afiş görenlerin %21,7-27,4'ü seçim yapmıyor (CMP satıcı verisi).
- **Sunucu katmanı, iki kapı:** *Google tag gateway* Google tag'lerini kendi alan adınızdan sunar, yalnız Google'ı kapsar; Google Demand Gen rehberinde önerir. *sGTM* bütün satıcıları besler, veri temizler, anahtarları tarayıcıdan çıkarır. Maliyet: Google'a göre sunucu başına aylık yaklaşık 45-50 $, en az iki sunucu; Cloud Logging varsayılan açıksa üçüncü taraf hesabına göre aylık 100-220 $ ekleyebilir, kapatılır. Stape: 10 bin isteğe kadar 0 $, aylık 20, 100, 200 $ (yıllık ödemede 17, 83, 167 $; sayfa tarihi eski). Ahava'nın uyarısı kalıcıdır: rıza sorumluluğu size geçer, sunucu tarafı denetlenmesi daha zor hale gelir.
- **Sıra:** küçük sitede web GTM + tag gateway + platform partner bağlantısı (Shopify, WooCommerce). Aylık harcama büyüdükçe sGTM. Ofis eşiği aylık 5.000 $ reklam ya da üç ve üzeri platform. Bu eşik ölçülmüş değil, maliyet kıyasıdır.

| Sinyal | Tekilleştirme | Dikkat |
|---|---|---|
| Meta CAPI | `eventID`=`event_id`, aynı olay adı, 48 saat, genelde ilk gelen kalır | fbp/external_id yolu yalnız tarayıcı önce gelirse çalışır |
| Google Enhanced Conversions | hash'li e-posta (tercih), ad+adres; telefon tek başına geçmez, E.164 | teşhis 72 saatte, etki yaklaşık 30 günde; Nisan 2026'dan beri tek ayar |
| TikTok Events API | aynı `event_id`, olay adı, pixel; ilk gelen kalır | Pixel+API için sayfa "5 dakikadan sonra, 48 saat içinde" diyor, ilk 5 dakikayı açıklamıyor |
| LinkedIn CAPI | her kaynağa ayrı dönüşüm kuralı, aynı `eventId` | Insight Tag olayı kalır, CAPI olayı düşer; sürüm 202511 16 Kasım 2026'da kapanıyor |
| Pinterest CAPI | `event_id` | bir saatten kısa sürede gönderim |
| Çevrimdışı | Data Manager API, gclid ve kullanıcı verisi | Eski `upload` entegrasyonları kırık; Ocak-Haziran 2026 arası istek atmamış jetonlara istisna tanınmadı |
| Çağrı | Google yönlendirme numarası ücretsiz; en kısa süre ayarlanır | ülke uygunluğu listesi okunamadı; satış sonucu ayrıca içe alınır |

**WhatsApp** Körfez ve Türkiye'de ana kanal sayılmalı: tıklama olayı dönüşüm değildir; satış CRM'den geri yüklenir. Meta'nın mesajlaşma CAPI ayrıntısı bu turda doğrulanamadı.

**UTM disiplini:** tek sözlük; küçük harf; `utm_source` platform, `utm_medium` kanal türü, `utm_campaign` sabit şema (`ulke_huni_teklif`). Otomatik etiketleme açık kalır. Site içi bağlantıya UTM konmaz. Meta'da dinamik parametreler kullanılır. Bir denetim betiği her ay sözlük dışı değeri listeler.

**Ne kırılır, nasıl doğrulanır:** çift sayım (`event_id` tarayıcı ve sunucuda farklı), teşekkür sayfası yenilemesi, ödeme sağlayıcısına gidip dönüşte self-referral, tek sayfalı uygulamada kaçan `page_view`, rıza sonrası kaybolan gclid, tema güncellemesinin silen `dataLayer`, para birimi hatası, KDV'li ve kargolu değer. Araçlar: GTM Preview, Tag Assistant, GA4 DebugView, Meta ve TikTok Test Events, tarayıcı ağ paneli. Dünya seviyesinde ek olarak Playwright her gün sentetik sipariş ya da form geçirir; olay gelmezse alarm çalar. Acemi ajans bu sonuncusunu hiç kurmaz; tag bozulduğunu müşteriden öğrenir.

### 3.3 Google Ads 2026

- **Search:** temel hâlâ yüksek niyetli kelime ve iyi sayfadır. AI Max kontrollü genişleme katmanıdır, çekirdeğin yerine geçmez; SMEC'te eşleşmelerin %80,11'i exact kelimelerden genişledi, DSA ve PMax ile çakışma yaygındı. Aranan terimler haftalık okunur.
- **Marka:** eBay "fayda yok", Haus "markaların %50'sinde gelir artırıyor" dedi. Yanıt markaya göre değişir; müşteri bazında denenir.
- **Performance Max:** kampanya düzeyinde negatif listeler, 50 search theme, kanal raporu, yaş ve cihaz kontrolleri mevcut. En iyi alıcılar doğru değer, müşteri listesi, yeni müşteri hedefi, marka hariç tutma ve ürün kümeleme ile yönetir.
- **Shopping:** asıl reklam feed'dir. Başlık, GTIN, görsel, fiyat ve kâr marjı etiketi. Standard Shopping ve PMax artık Ad Rank'le yarışır, marj kümeleriyle yan yana tutulabilir.
- **Demand Gen:** YouTube, Discover, Gmail için yaratıcı işi öne alan kampanya. Google "4 uygulamanın 3'ünü yapanlar %40 fazla dönüşüm aldı" diyor; iç veridir.
- Google Ads benchmark (LocaliQ, 13.000+ ABD kampanyası, Nisan 2025-Mart 2026, satıcı): Search CTR %6,64, CPC 5,42 $, dönüşüm %8,18, aday başı 66,69 $. Başka veri setlerinde 4,34 $ ve %5,71 var. Karşılaştırma yalnız müşterinin kendi geçmişiyle yapılır.

### 3.4 Meta 2026

Andromeda aday seçme katmanıdır; Meta'nın kendi ölçümü +%6 geri çağırma, +%8 reklam kalitesi. Pratik sonuç: hedefleme ayarının etkisi azaldı, kreatif çeşitliliği hedeflemenin işini yapıyor. Motion 2026 raporunda (1,29 milyar $, 578.750 kreatif, 6.015 hesap; ikincil özet) kazanma oranı küçük hesapta %3,8, büyükte %8,2; kazananlar harcamanın yaklaşık %55'ini alıyor.

En iyi alıcıların yaptığı: az kampanya, gerçekten farklı açılar (aynı videonun kırpılması değil), ad set başına haftada yaklaşık 50 olay (Meta'nın resmî sayfası okunamadı, ikincil kaynaklar tutarlı), haftalık kreatif hattı. Advantage+ körlemesine açılmaz: Haus'ta platform ROAS'ı Advantage+'ta %2,4 yüksek görünürken artımlı ROAS %12 düşük çıktı; ama %42 markada önde. Incremental Attribution önce raporlama sütunu olarak açılır, sonra lift testiyle karşılaştırılır. Haus'un örneği yılda 14 M $ harcayan markalardır; küçük müşteriye genellenmez.

Holdingin gerçek avantajı buradadır: stüdyo kreatifi çok düşük maliyetle ürettiğinde en pahalı kalem ucuzlar. Ölçüm sağlam değilse bu avantaj boşa gider.

### 3.5 Yan yana diğer platformlar

CPM bantları satıcı toplamalarıdır, resmî değildir; karar birimi nitelikli aday veya kârdır.

| Platform | Ne için | Sinyal | Asgari | CPM bandı | Risk |
|---|---|---|---|---|---|
| TikTok | keşif, görsel ürün, genç kitle | Events API | kampanya >50 $, grup >20 $ günlük (resmî) | 3-13 $ | kreatif hızla yorulur; ~50 dönüşüm/hafta ikincil bilgi |
| YouTube | Demand Gen ve Video; talep yaratma | Google tag | hesap düzeyinde | 6-30 $ | son tıklama değerini gösteremez; yerleşim hariç tutma gerekir |
| LinkedIn | B2B, unvan hedefi | Insight Tag + CAPI | doğrulanamadı | 25-65 $ | pahalı; aday kalitesi CRM'den ölçülür |
| Pinterest | ev, moda, plan yapan alıcı | Tag + CAPI | doğrulanamadı | 3-10 $ | düşük hacim, uzun gecikme |

### 3.6 Reklam için açılış sayfası

Ölçülmüş olan: hız (Vodafone), reklam-sayfa söz uyumu (Google landing page experience kalite puanına girer), teklifin ilk ekranda olması, kısa form. Ofis kuralı: ana sayfaya reklam gönderilmez; her niyet kümesine ayrı sayfa; menü ve dış bağlantı azaltılır; marka filmi aşağıda devam eder; form tek hedefe bağlıdır. "%6,6 medyan" hedef değildir; eticaret ve hizmet aynı satırda sayılmaz.

### 3.7 Dönüşüm optimizasyonu

**Sıra:** önce veri (GA4 huni, cihaz bazında kayıp), sonra davranış (Clarity veya PostHog kayıtları), sonra ses (müşteri görüşmesi, satış çağrısı, anket), sonra hipotez, en sonda test. Isı haritası soru üretir, kanıt üretmez. Kırk kayıt izlenip yazılı bulguya dönmüyorsa vakit kaybıdır.

**Kol başına ziyaretçi (iki yönlü α=0,05, güç %80; bu çalışmada hesaplandı):**

| Taban dönüşüm | +%10 | +%20 | +%30 |
|---|---|---|---|
| %1 | 163.096 | 42.693 | 19.827 |
| %3 | 53.211 | 13.914 | 6.454 |
| %5 | 31.234 | 8.158 | 3.780 |
| %10 | 14.751 | 3.841 | 1.774 |

Ayda 20.000 ziyaretçili, %3 dönüşümlü site +%30'u yaklaşık üç haftada görür, +%10'u beş aydan fazla sürer. Oysa Georgiev'in 1.001 testinde medyan artış %0,08, anlamlı kazananların medyanı %7,5. Yani küçük sitede test çoğunlukla gürültü üretir.

**Yöntem kuralları:** süre baştan yazılır; önceden belirlenmemiş ara bakışla durdurulmaz (sıralı yöntem kullanılmıyorsa); en az bir tam hafta döngüsü; A/A testiyle araç sınanır; kol oranları sapmışsa (SRM) sonuç atılır; birincil metrik tektir; aşırı iyi sonuç önce hata sayılır (Twyman yasası). Riskli kararlar için eşik 0,01'e çekilir. Feit ve Berman'ın *Test & Roll* çalışması kârı en yükselten örnek büyüklüğünün klasik hipotez testinden belirgin biçimde küçük olduğunu, fark en çok küçük kitlede açıldığını gösterir: küçük müşteride amaç "kanıtlamak" değil, "kârlı karar vermek"tir; bu da satışta açıkça söylenir.

### 3.8 Atıf ve artımlılık

Üç araç üç soruya yanıt verir: platform raporu günlük yönetim; deney gerçek etki; MMM bütçe dağılımı. Basamaklar:

1. Bütün müşterilerde: arka uç geliri, toplam reklam gideri, yeni müşteri sayısı (MER ve nCAC), haftalık.
2. Aylık 10.000 $ üstü: Meta'nın ücretsiz Conversion Lift'i ve geo-holdout; Google'da Conversion Lift eşiği 5.000 $ ve 1.000 gözlenen dönüşüm (ikincil kaynak, her hesapta açık değil). GeoLift ile bölge testi yapılır.
3. Çok kanal ve iki yıl haftalık veri: Meridian veya Robyn. Az veriyle MMM kurmak sayı üreten bir kuruntudur.

Tek bir "atıf panosu" satın alarak bu sorun çözülmez; Triple Whale ve Northbeam gibi ürünler yeniden dağıtım yapar, deney yerine geçmez. Bu ürünlerin fiyatı bu çalışmada okunmadı.

### 3.9 Müşterinin güvendiği rapor

Bir sayfa: ne harcandı, arka uçta ne kazanıldı, yeni müşteri kaç, hedefe göre neredeyiz, bu ay ne değişti, gelecek ay ne deneniyor. Platform ROAS'ı ek bilgidir, başlık değildir. Değişiklik defteri, veri eksikleri ve "bu ay ölçümde şu kırıldı" satırı rapordadır. Müşteri hesabına kendi girişiyle bakabilir. Tıklama ve gösterim başarı diye sunulmaz. Yanlış çıkan öneri rapordan silinmez.

### 3.10 Gizlilik sınırları

**Küresel ilke:** reklam amaçlı izleme için önceden rıza varsayılan kabul edilir; rızanın yerini sunucu tarafı, ilk taraf alan adı veya hash almaz. Ülkeye göre gevşetme bilinçli yapılır.

| Bölge | Kural | Ne yapılır |
|---|---|---|
| AB/AEA | Piksel ePrivacy 5(3) kapsamında (EDPB 2/2023). CNIL: Google 325 M €, Shein 150 M € (Eylül 2025, itiraz edildi) | Red düğmesi kabul kadar erişilir; rızasız reklam tag'i yok. Ölçümde CNIL muafiyeti: yalnız yayıncı adına, anonim istatistik, başka veriyle eşleştirme yok; iz ömrü 13 ay, veri 25 ay |
| Birleşik Krallık | DUAA analitik istisnası, 5 Şubat 2026 yürürlük (ikincil); reklam rızası sürüyor. GA4'ün sığması tartışmalı | Reklam çerezi AB gibi; ICO metni bu turda okunamadı |
| ABD | Ret modeli ama CCPA'da GPC geçerli talep sayılır (resmî, Kaliforniya Başsavcılığı). Piksel ve kayıt aracı için CIPA davaları; sayılar kaynağa göre 49 ile 4.000 arası | GPC'yi tanı; sağlık, çocuk, finans sitelerinde piksel ve kayıt önce hukuka gider |
| Türkiye | KVKK Rehberi birinci taraf analitiği "Kriter B" kapsamında değerlendirilebilir diyor; hukuk bloglarının "analitik hep rıza" sözü bu kadar kesin değil. Reklam çerezi açık rıza. Yurt dışı aktarım ayrı başlık; ileti için İYS ayrı | Anonim birinci taraf ölçüm ayrı, reklam açık rızalı; GA4 yurt dışı aktarım dayanağı avukat işi |
| BAE, Suudi | BAE PDPL'de çereze özel hüküm yok, yönetmelik beklemede (ikincil). Suudi PDPL pazarlamaya rıza istiyor (Al Tamimi) | Rıza afişi varsayılan |
| Brezilya | LGPD; bu turda doğrulanamadı | Avukat |

Clarity AEA, BK ve İsviçre'de 31 Ekim 2025'ten beri rıza sinyali bekliyor (resmî). Kayıt aracında şifre, kart ve kimlik alanları maskelenir; kayıt, ofis kuralı olarak her yerde rıza arkasındadır.

**CEO için iki satır.** (1) Ödeme sayfasında faizli taksit ya da faizli "şimdi al sonra öde" teklifi varsa reklam metnine ve dönüşüm değerine taşınmadan önce ona sorulur. (2) YouTube ve Display'de kumar, bahis ve haram içerik yanında yerleşim için hariç tutma listesi gerekir; PMax'te bu kontrol sınırlıdır, karar onundur.

## 4. Wow ile çatışma

Reklam tıklaması çoğunlukla telefonda, Instagram veya TikTok uygulama içi tarayıcısında açılır; WebGL, büyük film ve rıza afişi orada sınanır (uygulayıcı bilgisi, ölçülmedi). En iyilerin yolu gösteriyi azaltmak değil sırasını kurmaktır:

- **LCP'yi poster kazanır.** İlk boyamada yüksek kaliteli poster kare gelir, film ve 3B akıllı olarak ardından yüklenir. Vodafone sonucu reklam sayfasında doğrudan paradır.
- **Tag bütçesi.** Ağır üçüncü taraf betikleri sunucuya alınır; tarayıcıda tek akış kalır. Kayıt aracı yalnız rıza sonrası ve örnekleyerek çalışır.
- **Rıza afişi film gibi tasarlanır.** Marka diliyle, ama kabul ve red aynı ağırlıkta.
- **Ölçüm olayları yeniden yazılır.** Kaydırma filminde klasik scroll yüzdesi anlamsızdır: `chapter_view`, `film_25/50/75`, `configurator_use` olayları tanımlanır. Isı haritası canvas içini okuyamaz; 3B etkileşimi kendi olayını üretmelidir. SPA geçişlerinde sanal `page_view` zorunludur.
- **Aynı evren, iki sürüm.** Marka sitesi tam gösteriyi yaşar; reklam sürümü aynı filmi teklif öncelikli açar. Hangisinin kazandığı trafik yeterse testle, değilse kayıt ve huniyle ölçülür.
- **Kreatif uyumu.** Reklamdaki film karesi sayfanın ilk karesi olur. Stüdyo ikisini tek üretimde yapar; böylece söz uyumu ve wow aynı şeye hizmet eder.

## 5. Aletler

| Ad | Gerçekte ne yapar | Gerçek mi | Eş | Bizde | Yeri |
|---|---|---|---|---|---|
| GA4 + BigQuery | olay analitiği, reklamla bağ | ücretsiz; 360 fiyatı açık değil | Matomo, PostHog, Plausible | yok, tasarım dosyalarında adı var | kurulum şablonu |
| google-analytics-mcp | GA4 raporu; yazma `--allow-write` ile | 3.627★, 3 Kas 2026, Apache-2.0 | Plausible Stats API | PLATFORMS.md'de | ortak MCP |
| google-ads-mcp | GAQL okuma; v0.0.6 varlık ve etiket yazar, Propose & Confirm | 1.113★, 2 Kas 2026, Apache-2.0 | Pipeboard, Markifact (barındırılan) | yok | ortak MCP, `assets:false`, `labels:false` |
| Meta ads MCP | rapor, kampanya, katalog, sinyal teşhisi, lift | resmî uzak sunucu, ücretsiz, 29 araç (üçüncü taraf sayımı) | pipeboard-co/meta-ads-mcp 1.348★ | yok | ortak MCP, yalnız `ads_read` |
| claude-ads | 12 platform dışa aktarım denetimi, bulgu ve eksik listesi | 10.712★, v2.1.0, MIT | Optmyzr, Adalysis (fiyat okunmadı) | **kurulu değil**, W096 "Kur" | raf + denetçi personası |
| GTM + sGTM | tag yönetimi | ücretsiz; sunucu ~45-50 $/ay | Jitsu 5.126★ MIT; Stape 20-200 $ | yok | kurulum şablonu |
| stape GTM MCP | GTM konteynerini ajanla okuma/yazma | 243★, 3 Kas 2026, Apache-2.0 | Google Tag Manager API | yok | deneme, yalnız okuma |
| CookieYes | sertifikalı CMP, CMv2 | 0-55 $/ay/alan adı | c15t 2.018★ Apache-2.0; cookieconsent 5.740★ MIT | yok | site şablonu |
| Clarity | kayıt, ısı haritası | ücretsiz, trafik sınırı yok, kayıt 30 gün; MIT istemci | Hotjar/Contentsquare 0-49 $+; OpenReplay 13.092★ | W082'de adı | kurulum şablonu |
| clarity-mcp-server | Clarity verisi | 137★, Şubat 2026, MIT | PostHog MCP | yok | deneme |
| PostHog | analitik, kayıt, bayrak, deney | 40.624★, lisans karışık; ücret sayfası okunamadı | Amplitude, Mixpanel | yok | ürün ve SaaS sitesi |
| GrowthBook | deney ve bayrak | 8.561★; bulut 0-40 $/koltuk, kendi sunucu ücretsiz | VWO, Optimizely, Convert | yok | yüksek trafikli müşteri |
| GeoLift | bölge testi | 271★, Haziran 2026, MIT | Haus, Measured | yok | persona bilgisi |
| Meridian / Robyn | MMM | 1.595★ Apache-2.0 / 1.533★ MIT | Recast, Measured | yok | büyük müşteri |
| CallRail | çağrı izleme | 50-195 $/ay | Google yönlendirme no; FreeSWITCH + kendi kayıt | yok | hizmet sitesi |
| Looker Studio | rapor | ücretsiz | Metabase, Superset; Supermetrics, Funnel | yok | aylık iş; OS panosu da olabilir |
| Playwright sentetik test | günlük dönüşüm sınaması | kurulu | Checkly, Datadog | **var** | ofis aylık iş |

**Açık ve ücretli analitik yan yana** (resmî sayfalar, 2026-11-03)

| | Fiyat | Lisans, ★ | Rıza durumu | Reklamı besler mi |
|---|---|---|---|---|
| GA4 | 0 | kapalı | rıza gerekir | evet |
| Plausible | 9, 14, 19 $+ | AGPL-3.0, 29.763 | "afiş gerekmez" satıcı sözü; ülkeye göre kontrol | hayır |
| Umami | 0, 20, 200 $ | MIT, 39.901 | çerezsiz, aynı kontrol | hayır |
| Matomo | bulut 29'dan; kendi sunucu 0, paket 275-3.400 € | GPL-3.0, 22.005 | yapılandırmaya göre CNIL değerlendirmesi | sınırlı |
| PostHog | ücretsiz katman + kullanım | GitHub "NOASSERTION" gösteriyor, 40.624 | yapılandırmaya göre | kısmen |

Öneri: reklamlı müşteride GA4 zorunlu, Plausible veya Umami yanında rızasız toplam trafik gerçeğini verir; iki sayının farkı rıza kaybını gösterir. Yalnız çerezsiz araçla reklam yönetilmez; Web Ofisi dosya 2'deki "çerezsiz ölçüm" satırı bunu söylemiyor, eklenmeli.

**Ajanlar bugün ne yapabilir**

- Google: resmî belge sayfası hâlâ "read-only, üç araç" diyor; depo 2 Kasım'da yazma araçları ekledi. İkisi de Google'ın; kod daha yeni. Her iki durumda bütçe, teklif, duraklatma aracı yok. Erişim Cloud projesinde: Explorer günde 2.880, Basic 15.000 işlem, Standard denetimle sınırsız. Basic ve Standard marka doğrulaması ister: kimlik adımı, CEO'da.
- Meta: 29 Nisan 2026'da açıldı, 16 Temmuz'da her geliştiriciye. İzin: `ads_mcp_management` + `ads_read` veya `ads_management`. Başkasının hesabını yöneten için uygulama incelemesi ve Advanced Access gerekir. Yeni nesneler duraklatılmış gelir, ama **canlı nesnede bütçe değişikliği anında işler** (PaidSync, rakip kaynak). Hesap yöneticisi 16 Temmuz'dan beri sunucu kuralları koyabiliyor. Admin rolündeki sistem kullanıcısı jetonu kabul edilmiyor.
- TikTok, LinkedIn, Microsoft: GitHub'da resmî MCP bulunamadı, topluluk depoları 0-54★. Bu kanallarda dışa aktarım ve API.
- Bilinen kusurlar: belirsiz istemde uydurma metrik, nedensellik uydurma, görseli görememe. Her sayı kaynak sorgusuyla rapora girer.

**Kapı:** aşama 1 yalnız okuma; aşama 2 taslak (`--draft`, doğrulanmış teklif, insan uygular); aşama 3 duraklatılmış nesne yazma, ayrı onayla. Bütçe, teklif ve canlıya alma hiçbir aşamada ajana verilmez. Harcama her zaman CEO kapısındadır; persona metinlerinde bu kural zaten var.

## 6. Ofisin işi

| Ne | Kim | Ne zaman |
|---|---|---|
| Olay sözleşmesi, dataLayer, CMP yeri, sayfa hız bütçesi | **site ustası**, ilk günden | tasarımla birlikte |
| Rıza ve sözleşme metinleri | hukuk uzmanı | yayından önce |
| GTM, GA4, sGTM, CAPI, EC, Data Manager | `paid-media-tracking-specialist` | kurulumda bir kez |
| Mutabakat ve kapı listesi | `paid-media-auditor` | reklamdan önce, sonra aylık |
| Kampanya yapısı, kreatif brief | `paid-media-ppc-strategist`, `paid-media-paid-social-strategist`, `paid-media-creative-strategist`; film Media Studio | müşteri onayı ve bütçe kapısından sonra |
| Sentetik test, tag kırılma alarmı, UTM denetimi, arama terimi okuma | otomatik | günlük ve haftalık |
| Rapor, MER, huni, kayıt okuma, hipotez | otomatik taslak, uzman yazar | aylık |
| Lift testi | ölçüm uzmanı + CEO kapısı | çeyreklik |

**Ustanın ilk günden elinde olması gerekenler:** olay sözleşmesi şablonu, CRM gizli alanları, rıza katmanı, hız bütçesi. Bunlar sonradan eklenince site yeniden açılır.

**Bizde eksik:** yedi paid-media personası var ve harcama kuralı güçlü; ama tracking personasında Data Manager API sıfır kez geçiyor, yedi dosyada MCP veya claude-ads anılmıyor. Yukarıdaki üç eski bilgi kişi bilgisine işlenmeli. W096 metni düzeltilmeli: "deterministik puan" kapalı (`account-health-scoring: disabled`), "canlı değişiklik kapılı" da kapalı (`account-mutation: disabled`, 12 platformun tamamı). Müşteri hesabı bağlamak kimlik adımıdır.

## 7. Satılabilecekler

Fiyatlar satıcı sayfalarıdır, müşteri ödemesi ölçümü değildir.

| Hizmet | Piyasa | Kaynak |
|---|---|---|
| Reklam yönetimi | harcamanın %10-20'si veya aylık 1.000-3.000 $ | WebFX, 2026 |
| Aynı, kademeli | 750 $ (5 bin $ harcamaya kadar); 975 $ veya %15; 4.500 $ veya %12; kurulum 1.200-5.800 $ | WebFX |
| Ortalama ajans | aylık 7.165 $, saat 100-149 $; proje genelde 10-50 bin $ | Clutch, 2026-09-21 |
| Birleşik Krallık | KOBİ 500-1.500 £, orta 1.500-5.000 £, kurulum 250-1.000 £ | One Umbrella, 2026-08 |
| Saat ücreti | PPC firmalarının %85'i 50-200 $; anket eski | Credo 2023, ikincil |
| sGTM kurulumu | 4.500 $, 7.500 $, 12.000 $+ | Luc Flynn |
| CRO programı | aylık 1.500 $ (1 test), 3.000 $ (2 test) | Virdis |

Müşteriler aslında üç şey alır: rakamlara güven, kreatif hızı, sorumluluk. Bizim sıramız: (1) **ücretli ölçüm denetimi** kapı açıcı, sabit fiyat; (2) **ölçüm kurulumu** sabit proje; (3) **aylık ölçüm bakımı** ayrı küçük abonelik, sentetik testle; (4) **aylık yönetim + kreatif** tek müşteriden iki gelir; (5) **reklam açılış sayfası**; (6) trafik yeten müşteriye **CRO**. Reklam harcaması müşterinin kartındadır. Holdingin kendi harcaması CEO'dadır. Ülke ve Türkiye fiyatı doğrulanamadı.

Havaya satılanlar: küçük sitede "A/B programı"; "server-side ile %30 fazla dönüşüm"; "tek pano tüm atıfı çözer"; "AI ajan hesabınızı kendi yönetir"; ücretsiz denetim adı altında hazır otomatik liste.

## 8. En iyi kaynaklar

- **Resmî:** Google Ads Help, Tag Platform, Data Manager API, Meta Ads AI Connectors ve Conversions API belgeleri, LinkedIn Marketing API, WebKit Tracking Prevention, CNIL, KVKK Çerez Rehberi. Ortak bilgiye önce bunlar girer.
- **Ölçüm:** Simo Ahava (sGTM ve rıza ilkeleri), Julius Fedorovicius, Analytics Mania.
- **Deney:** Kohavi, Tang, Xu, *Trustworthy Online Controlled Experiments*; *A/B Testing Intuition Busters* (KDD 2022); Georgi Georgiev; Feit ve Berman, *Test & Roll*.
- **Artımlılık:** Gordon, Moakler, Zettelmeyer; Blake, Nosko, Tadelis; Haus raporları (satıcı olduğu bilinerek).
- **Google alıcıları:** Mike Ryan (SMEC), Frederick Vallaeys (Optmyzr), Ginny Marvin (AdsLiaison). **Meta:** Motion raporları, Common Thread Collective, Foxwell.
- **Haber:** PPC Land, Search Engine Roundtable. Ajans blogu kaynak değildir.
- Bu turda okunanlar: resmî belgeler, Gordon, Blake, Kohavi makalesi, Georgiev, Feit-Berman özeti, Ahava, Haus, SMEC özeti. Julius Fedorovicius, Vallaeys, Foxwell ve kitap ise bilinen adlardır, bu turda açılmadı.

Ortak kütüphaneye gireceği öneri: bir "ölçüm şablonu" becerisi (olay sözleşmesi, UTM sözlüğü, kapı listesi, doğrulama sırası) ve bu dosyanın kanıt tablosu; her altı ayda bir yeniden doğrulanır, çünkü bu alanda üç ana kural son 13 ayda değişti.

## 9. Bilinmeyenler

- **Araştırma sınırı:** oturumun WebSearch hakkı bitti; bu noktadan sonra arama yapılmadı, yalnız bildiğim resmî adresler açıldı. Ayrıca X ve Reddit kanalları boş döndü, YouTube altyazısı 429 ile kapandı. Bu yüzden topluluk görüşü ve uzun video transkriptleri **okunamadı**; Kohavi'ye atfedilen "en az 200.000 kullanıcı" sözü doğrulanamadı. Yeniden çalıştırmak gerekir.
- LinkedIn ve Pinterest asgari bütçeleri, TikTok Smart+ ve ABD ortak girişimi, Pinterest Performance+, YouTube ayrıntıları: doğrulanmadı.
- GPC yaptırım kararları, LGPD, ICO'nun DUAA metni, Google EU User Consent Policy metni: birincil metin okunmadı; hukuk işi.
- Meta MCP araç listesi resmî sayfada okunamadı; 29 sayısı, duraklatılmış varsayılan ve anında işleyen düzenleme üçüncü tarafa dayanır. Kendi test hesabında ölçülmeli.
- Advanced Consent Mode'un çerezsiz pingleri AB'de hukuken yeterli mi: görüşler ayrı; avukat kararı.
- Google tag gateway'in gerçek etkisi: bağımsız ölçüm yok. Kendi sitemizde aç-kapat deneyiyle ölçülür.
- MER ve nCAC önerisi uygulayıcı bilgimdir; bu turda kaynak açılamadı.
- Türkiye ve Körfez ajans fiyatı, PostHog güncel ücretleri, atıf panolarının fiyatları: okunmadı.
- Ofis eşikleri (±%10, 5.000 $, 10.000 $) ölçüm değil karardır; ilk beş müşteride sınanır.
