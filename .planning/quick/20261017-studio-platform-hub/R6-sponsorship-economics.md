# R6-sponsorship-economics (helper report, 2026-10-17; raw evidence paths inside)

# H6 araştırma raporu: YouTube kanallarında doğrudan sponsorluk, fiyatlar, satış yolları, yerleştirme ile birlikte üretim, çocuk kuralları ve İngilizce dışı pazarlar

**Kısa cevap:** Ölçülen veriye göre YouTube sponsorluğu dar bir alıcı grubunun elinde duran, sürekli tekrar alım yapılan bir pazar. Buna göre:
- Bilim, araç, yapay zekâ ve tarih kanallarına yazılım, VPN ve uygulama şirketleri sponsor oluyor.
- Okul öncesi çocuk dev kanallarında videoya gömülü sponsorluk neredeyse yok.
- "Yerleştirme ve üretim birlikte" modelinin örneği var: Moonbug Partner Solutions ve pocket.watch. Ancak bu iki şirketin fiyatları açık değil.

**Yöntem ve sınırlar:**
- `fleet.sh` iki kez denendi, ikisinde de `dxb-cost-gate` kancası durdurdu: "a command that waits more than 4 minutes belongs to the lead". Derin yolu siz koşmak isterseniz komut şu: `bash "$S/fleet/fleet.sh" /tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h6/fleet --allow-tmp --q "youtube sponsorship rates 2025" --q "kids youtube toy brand sponsorship" --q "creator brand studio production placement" --dert /tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h6/dert.txt --shape pazar`
- Bende WebSearch/WebFetch aracı yoktu. Bu yüzden kapının "iki taraf birden" kuralı karşılanmadı. Yalnız araç kutusunu kullandım: `mcpx.sh exa`, `fetch.py`, ve SponsorBlock API'sini `curl` ile.
- Ham dosyalar `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h6/` altında: `pages/`, `ch/`, `br/`, `q*/`, `sb_out.tsv`.

**Etiketler:**
- **first-hand:** kendi API ölçümüm ya da resmi kurum sayfası.
- **vendor-measured:** satıcı şirketin kendi işlem veya tespit verisi.
- **vendor-benchmark:** satıcının ölçmediği, kıyas amaçlı tahmini.
- **press:** basın haberi.
- **creator:** üreticinin kendi açıklaması.

---

## (a) Niş × sponsorlar × format × fiyat

Kanal başına sponsorlar SponsorRadar kanal sayfalarından alındı ve bu sayfalar 2026-10-12 ile 2026-10-17 arasında güncellenmişti (vendor-measured, videodaki ifşadan tespit). Satıcı şu notu düşüyor: "deduced from evidence, not confirmed by the channel or brand". CPM aralıkları SponsorRadar'ın Temmuz 2026'da gözden geçirdiği kıyas değerleri. Kendi ifadeleri: "Estimates are ranges, not confirmed deal figures" (vendor-benchmark).

| Niş | Ölçülen kanal → başlıca sponsorlar | Entegrasyon CPM (1.000 izlenme başına) | Kaynak |
|---|---|---|---|
| Bilim / eğitim belgeseli | Veritasium (21.4M abone): Incogni ×9, Brilliant, Saily, Henson, 80,000 Hours · Kurzgesagt (25.7M): NordVPN, Saily, Planet Wild · fern: Odoo ×15, Brilliant, Epidemic Sound · Real Engineering: Nebula ×7, Boot.dev | Science $20–40 · Education $20–40 (68,496 sponsorlu video örneği) | sponsorradar.com/channels/veritasium, /kurzgesagt, /fern-tv, /sponsorship-rates/education |
| Araç / otomotiv | Doug DeMuro: 50 marka; Cars & Bids ×12, Mothers, AutoZone, Nokian · carwow: carVertical ×49 · Hagerty: Hagerty ×16 (kanal kendi şirketini tanıtıyor), Mobil 1 · Throttle House: Huckberry, WeatherTech · savagegeese: Falcon NW | Automotive $25–50 (46,732 sponsorlu video örneği) | /channels/dougdemuro, /carwow, /hagerty; /sponsorship-rates/automotive |
| Yapay zekâ / teknoloji anlatımı | Fireship: CodeRabbit, Namespace, Mux, Railway, Hostinger (44 marka) · Two Minute Papers: Lambda ×40, Weights & Biases · Matt Wolfe: Box, Genspark (22 marka) · AI Explained: Storyblocks · TheAIGRID: Skywork, Abacus AI | AI $15–30 (2,753 sponsorlu video örneği) · Technology $30–60 | /channels/fireship, /twominutepapers, /mreflow; /sponsorship-rates/ai |
| Tarih / uzun anlatım | OverSimplified: NordVPN ×7, Rise of Kingdoms · Kings and Generals: NordVPN · Armchair Historian: 20 marka · History Dose: Odoo, Manta Sleep, Surfshark · History Time: Odoo, Ground News, MyHeritage, Incogni (getsponsored.io) · MagnatesMedia: Storyblocks ×5 | Education $20–40 | /channels/oversimplified, /historydose; getsponsored.io/channels/historytime |
| Çocuk ve çocuk animasyonu | Cocomelon (203M): 1 sponsorlu video (Headspace) · Blippi (27.5M): 1 (Paramount) · Kids Diana Show (138M): 1 (Hasbro) · ChuChu TV (98.2M): 0 · Super Simple Songs (47.1M): 0 · Little Angel (34.6M): 0 · Vlad and Niki (151M): 7 video, 6 marka (Mattel ×2, Hot Wheels, American Dream) | Niş CPM'i yayımlanmamış. Entertainment $10–20 | /channels/cocomelon, /blippi, /chuchutv, /vladandniki |

**Satılan fiyat, kanal büyüklüğüne göre (vendor-measured).** Kaynak ThoughtLeaders'ın satılmış 9,002 entegrasyonu: 2024-08-24 ile 2026-08-23 arasına planlanmış işlemler, yayım tarihi 2026-10-15 ([thoughtleaders.ai/blog/2026-10-15-youtube-sponsorship-cost-2026](https://thoughtleaders.ai/blog/2026-10-15-youtube-sponsorship-cost-2026)).

| Abone | Medyan fiyat | Orta yarı | Medyan CPM |
|---|---|---|---|
| <100K | $600 | $370–1,000 | $36 |
| 100K–500K | $1,200 | $750–2,000 | $26 |
| 500K–1M | $2,000 | $1,050–3,000 | $21 |
| 1M–5M | $3,500 | $2,000–5,250 | $19 |
| 5M+ | ~$6,000 | $2,475–10,500 | $17 |

**Formatlar.**
- SponsorBlock ile kendi ölçümüm (first-hand). 12 kanaldan 52 sponsorlu videoyu `sponsor.ajay.app/api/skipSegments` ile sorguladım; 49'unda 15 saniye ve üstü sponsor bölümü vardı. Bu bölümlerin süresi: medyan 66 sn, p25 49 sn, p75 85.5 sn. Bölümlerin %80'i 30–100 sn arasında. Hepsi `sb_out.tsv` dosyasında.
- Videodaki yer kanala göre sabit: Fireship videonun %80–93'ünde (sona yakın), DeMuro %2–17'sinde (başta), Kurzgesagt %29–37'sinde, carwow %62–94'ünde ve 31–49 sn'lik kısa okumalarla.
- Fiyat çarpanları (vendor-benchmark, [creatorsjet.com](https://www.creatorsjet.com/blog/how-much-do-brands-pay-for-youtube-sponsorships), 2025-08-05): özel video entegrasyonun 1.3–4 katı, kısa anma 0.5–0.7 katı. Kullanım hakkı, örneğin 60 gün için +$500, ayrı kalem olarak ekleniyor. ThoughtLeaders'ın verisinde özel videolar "too few to report".

**Kaynaklar arası çelişki.** AI nişinde SponsorRadar $15–30 CPM veriyor; OutlierKit "AI tools" için $28–55 diyor (CreatorsJet üzerinden). İkisi de kıyas tahmini, doğrulayan işlem verisi yok. ThoughtLeaders'ın medyanları ($17–36) gerçek satışlara dayandığı için bu ikisinden daha güvenilir.

**Pazar hacmi.**
- ThoughtLeaders (vendor-measured, 2026-10-15, [aylık rapor](https://thoughtleaders.ai/blog/2026-10-15-youtube-sponsorship-market-october-2026)): uzun videoların %6.2'sinde sponsor var; bir yıl önce %4.8'di.
- Son 30 günün en çok sponsorluk yapan 10 markası sırayla: Kalshi, Epic Games, GamerSupps, FanDuel, Epidemic Sound, Gametime, NordVPN, GFUEL, SeatGeek, Indeed. Bunların arasında tahmin piyasası ve bahis şirketleri var (Kalshi, Polymarket, FanDuel). Bu bir olgu tespiti; holdingin İslami sınırları açısından sizin bilmeniz gerekiyor.
- Kategori yoğunluğu: Technology %12.2, General Knowledge %7.6, Entertainment %2.8.
- Gospel Stats (press: [axios.com](https://www.axios.com/2025/10/22/youtube-sponsorship-creator-videos), 2025-10-22): 2025'in ilk yarısında 65,759 sponsorlu video vardı, bir önceki yılın aynı dönemine göre +%54. Ground News 1,863 entegrasyonla birinci.
- Fiyatları bozan bir gelişme (vendor-measured, ThoughtLeaders): YouTube 2026-08-24'te görüntüleme sayımını değiştirdi. Uzun videolarda ilk haftanın sayıları eski hesaba göre 1.2–1.5 kat yüksek çıkıyor. Bu yüzden değişiklik öncesi ve sonrası CPM'ler doğrudan karşılaştırılamaz.

## (b) Satış yolları ve eşikler

**Satış yolları:**
- **Doğrudan satış ya da ajans.** Ödeme genelde yayından sonra net 30; büyük işlerde peşinat alınıyor (vendor, [sponsorradar.com/youtube-sponsorship](https://sponsorradar.com/youtube-sponsorship)).
- **Pazaryerleri.** Passionfroot, kendi ağından gelen işlerde %15, kanalın kendi bulduğu işlerde %5 alıyor; %5'i partner ödüyor (vendor, [help.passionfroot.me](https://help.passionfroot.me/en/articles/11552638-pricing)). ThoughtLeaders bir ajans ve pazaryeri olarak çalışıyor.
- **Yetenek ajansları.** Komisyon %10–25, yaygın olanı %15–20 (vendor blog, creatorsagency.co, 2026-04-07). Adhesive %20 alıyor ve "offers in 5-10 days" diyor (vendor, adhesivepartnerships.com).
- **YouTube Creator Partnerships, eski adıyla BrandConnect** (first-hand, [support.google.com/youtube/answer/9385307](https://support.google.com/youtube/answer/9385307)). Şartları: 18 yaş, YPP üyeliği, desteklenen ülke ve aktif ihtar olmaması. Ülke listesinde Turkey, UAE, Saudi Arabia, India, Japan, Indonesia ve South Korea var; Russia yok.
- **Çocuk ağları.** pocket.watch'ın Clock.Work bölümü kendini "rights and capabilities to monetize YouTube Kids and Made For Kids" olarak tanıtıyor (press, totallicensing.com, 2025-05-21). Mattel'in YouTube reklam satışlarını 2023'ten beri pocket.watch yapıyor (anbmedia.com, 2023-09-07).

**Eşikler:**
- YPP: 1,000 abone ile birlikte ya 4,000 saat izlenme ya da 90 günde 10M Shorts görüntülemesi (first-hand, [support.google.com/youtube/answer/72851](https://support.google.com/youtube/answer/72851)).
- 10K altı abonede de iş dönüyor: 3,525 iş, 391 kanal, medyan 976 izlenme (vendor-measured, SponsorRadar). Ancak hacmin büyük kısmı 50K–250K bandında: 398,988 iş.
- carVertical'ın sponsor olduğu en küçük kanal 2.7K aboneli (vendor, discoversponsors.com).

**İş döngüsü:**
- Markaların %35'i aynı kanalı 60–365 gün sonra yeniden satın alıyor (vendor-measured, ThoughtLeaders).
- Ekim 2026'da en az 5 video ve 3 kanalda sponsorluğu tespit edilen 4,977 markadan yalnız 4'ünün önceki 24 ayda sponsorluğu yoktu. Kısacası alıcıların neredeyse tamamı tekrar alıcı.
- Yayın penceresinin 30–60 gün olduğu iddiası yalnızca düşük kaliteli bir blogda geçiyor (aicalcus.com). UNVERIFIED.

## (c) Yerleştirme ile birlikte üretim örnekleri

| Örnek | Ne satıyor | Fiyat | Kaynak |
|---|---|---|---|
| Moonbug Partner Solutions (Cocomelon, Blippi), 2025-06-13 | Reklam, YouTube kanal yönetimi, Brand Studio, Production Services. Kendi tarifiyle: "creative strategy, production, media placement, and distribution under one roof". Örnek işler: SharkNinja Shorts serisi, USPS'in "Mr. ZIP" kanalı (19M izlenme) | Açıklanmamış | moonbug.com/news (vendor); adexchanger.com (press) |
| pocket.watch / Clock.Work | 47 çocuk üreticisi ve 771M abone (2023). Hem markalı entegrasyon hem YouTube reklamı satıyor | Açıklanmamış | anbmedia.com 2023; totallicensing.com 2025 |
| Kurzgesagt | "become a credited sponsor by covering the production costs of one of our videos". Gelir dağılımı: ticari sponsor %12, kurumsal sponsor %10 | Açıklanmamış. Gates için $570K/2015 rakamı yalnız bir eleştiri videosunda geçiyor, UNVERIFIED | kurzgesagt.org/sponsors (creator) |
| SnoWest (niş yayıncı), 2025–26 | Üretim ve kendi YouTube kanalında dağıtım tek pakette | 15–29 sn $950 · 30–59 sn $1,700 · 60–120 sn $3,500 | snowest.com media kit PDF (vendor) |
| Showmetech (Brezilya, teknoloji), 2025 | Ücretli videonun üretimi ve sosyal medyada paylaşımı | US$950 | showmetech.com.br media kit PDF (vendor) |
| CoinDesk Studios (2022 Q4) | Üretim ayrı, medya planı ayrı fiyatlanıyor | Başlangıç $150K; mekânda çekim $75K/gün, stüdyoda $35K/gün | downloads.coindesk.com media kit (vendor, eski) |
| The Business Journals Content Studio | Native içerik paketleri | $5K–70K | digiday.com 2019 (press, eski) |

**İki ek gözlem:**
- Digiday 2018 (press): yayıncılar için yalnız üretim (white-label) "lower-margin"; kâr marjını medya satın alımı getiriyor.
- Ürün sahibi kanal modeli de mevcut. Hagerty'nin en büyük sponsoru Hagerty'nin kendisi (vendor-measured). Doug DeMuro'nun en büyük sponsoru Cars & Bids; Cars & Bids'in DeMuro'nun kendi şirketi olduğunu bu oturumda doğrulamadım (UNVERIFIED).

## (d) Çocuk içeriği: kurallar ve olgular

1. **YouTube Kids uygulaması** (first-hand, [support.google.com/youtubekids/answer/10938174](https://support.google.com/youtubekids/answer/10938174)): "We don't allow videos in YouTube Kids that include branded content or endorsements. When a creator discloses … we will remove the videos from the YouTube Kids app." Aşırı ticari içerik de yasak: ürün ambalajına odaklanan videolar ve satın almaya doğrudan teşvik bunlara dahil.
2. **Ana YouTube'daki "made for kids" kalite ilkeleri** (first-hand, [answer/10774223](https://support.google.com/youtube/answer/10774223)):
   - "Heavily promotional … mainly features products, brands and logos (such as toys or food)" düşük kalite sayılıyor. Sonucu "limited or no ads" ya da YPP'den askıya alma olabiliyor.
   - "Hard to follow … often the result of mass production or autogeneration" ifadesi de aynı listede.
   - Ayrıca 2025-07-15'te monetizasyon politikası "inauthentic content" olarak yeniden adlandırıldı ve kapsamı "mass-produced or repetitive" içeriği açıkça içerecek şekilde netleştirildi ([answer/1311392](https://support.google.com/youtube/answer/1311392)).
3. **YouTube Kids ve made-for-kids içerikteki ücretli reklamlar** (first-hand, [answer/9713557](https://support.google.com/youtube/answer/9713557), [answer/6168681](https://support.google.com/youtube/answer/6168681)):
   - Kişiselleştirilmiş reklam yok, yalnız bağlamsal reklam var.
   - Yasak kategoriler: yiyecek ve içecek, güzellik ve fitness, siyasi ve dini reklamlar.
   - YouTube Kids'teki reklamlar önceden onaydan geçmek zorunda.
4. **CARU, Vlad and Niki kararı, 2024-05-29** (first-hand, [bbbprograms.org/…/vlad-and-niki](https://bbbprograms.org/media/newsroom/decisions/vlad-and-niki)):
   - Kanalın sahibi Content Media Group FZC, LLC.
   - Yeterli bulunmayan ifadeler: "sponsored by", "paid promotion", açıklama kutusunda #ad, ve platformun kendi ifşa aracı.
   - Önerilen ifadeler: "This is an advertisement for XXX" ya da "We were paid by XXX". Bu ifadeler hem yazı hem ses olarak, videonun başında ve sonunda yer almalı.
   - Lisans ve gelir paylaşımı olan kendi markalı oyuncaklar için de ifşa zorunlu: "This is an ad for our Vlad and Niki toy". CMG kararı kabul etti.
5. **FTC COPPA değişikliği**: 2025-06-23'te yürürlüğe girdi (first-hand, federalregister.gov 2025-04-22).
6. **Oyuncak markalarının ölçülen hacmi küçük** (vendor-measured, SponsorRadar marka sayfaları):

   | Marka | Sponsorlu video | Kanal |
   |---|---|---|
   | Mattel | 46 | 23 |
   | Hasbro | 18 | 16 |
   | Spin Master | 5 | — |
   | MGA | 3 | — |
   | LEGO | 679 | 100 |
   | NordVPN (karşılaştırma için) | 8,749 | — |
   | carVertical (karşılaştırma için) | 4,107 | — |

   Oyuncak bütçelerinin önemli kısmı ağ anlaşmalarına ve reklama gidiyor. Örneğin Mattel'in YouTube Kids ile "eight-figure" ön alım anlaşması var (press, tubefilter.com, 2017).
7. **Çocuk kanallarında anlaşma büyüklükleri, hepsi zayıf ya da eski kaynak:**
   - KidToyTesters için sponsorlu video başına $3K–20K; büyük bir üreticide "up to $200K" (Bloomberg, techwireasia.com üzerinden, 2017).
   - ABD'de başarılı kidfluencer için gönderi başına $10K–20K (Economic Times, 2025, kaynak belirtilmemiş).
   - SponsorRadar'ın tahminleri: Hasbro videosu $2.0K–4.0K, Mattel $161–322, Moose Toys $40K–96K (MrBeast dahil). Bunlar tahmin, gerçek işlem değil.

## (e) İngilizce dışı pazarlar

- **Rusça** (en güçlü veri):
  - AKAR/АЦ РИР 2026-10-08'de açıkladı: 2025 blogger pazarı 69.2 milyar ₽. YouTube 23.97 milyar ₽ ile %34.6 pay alıyor; YouTube'daki reklam entegrasyonları 19.14 milyar ₽. Telegram 21.97 milyar ₽, yıllık +%90.9 (press/endüstri, akarussia.ru).
  - Engeller: YouTube Ağustos 2024'ten beri yavaşlatılıyor (Reuters 2024-08-08). Video başına ortalama izlenme 175K'dan 109K'ya, yani %37 düştü (AdIndex 2025-03-28). Yasaklı platformlarda reklam yasağı var. 2026'nın ilk çeyreği "one of the worst" olarak anılıyor (incrussia.ru 2026-05-15). Rusya Creator Partnerships listesinde de yok.
- **Körfez ve Arapça:**
  - 2025 influencer harcaması Suudi Arabistan'da $95M, BAE'de $70M; MENA toplamı $648M (Brand Ripplr, Arabian Business üzerinden, 2026-02-12, press).
  - GCC'de 1.5M aktif üretici ve toplam $300M kazanç (Redseer 2025, vendor).
  - BAE Media Council "Advertiser Permit" (first-hand, uaemc.gov.ae; WAM 2025-07-30): ücretli ya da ücretsiz her reklamcı için zorunlu, ilk 3 yıl bedava. Ziyaretçi üreticiler ancak lisanslı bir ajans üzerinden izin alabiliyor.
  - Fiyat verisi yalnız satıcılardan: Valors'a göre Suudi Arabistan'da orta segment teslimat başına $1,400–6,500, Ramazan/Bayram haftalarında %20–40 ek. BaoLiba'nın verdiği $300–7,500 aralığı UNVERIFIED (yapay zekâ üretimi bir blog).
- **Türkçe:**
  - 2024'ün ilk yarısında influencer yatırımı 3.1 milyar TL, dijital yatırımların %5'i (Deloitte/RD/RVD/IAB TR, 2024-10-22, endüstri).
  - Reklam Kurulu'nun 2021/2 sayılı ilke kararı ve kılavuzu: videoda "Bu video [reklam veren] reklamlarını içermektedir" ya da benzeri bir ifade zorunlu. Reklam veren, ajans ve platform ayrı ayrı sorumlu (first-hand, rok.org.tr PDF).
  - Fiyatlar yalnız satıcılardan: 1M+ abonede $4,000–12,000+ (BaoLiba, UNVERIFIED); 150 ₺/1.000 izlenme (Wagner Creative, vendor).
- **Asya:**
  - Hindistan: 100K+ abonede video başına ₹1L–3L+ (kalakaaar.com, vendor). Pazar hacmi: 2–2.5M üretici var, bunların yalnız %8–10'u para kazanabiliyor (BCG, BusinessToday 2025-05-04, press).
  - Japonya: $1,300–8,000 (BaoLiba, UNVERIFIED).
  - Kore: PPL tarifeleri cpik.kr'de var (vendor), ayrıntılı okumadım.

## (f) Kanal ve reklam stüdyosu sahibi bir holding için anlamı (yalnız yukarıdaki kanıttan)

1. Para tekrar alım yapan, performans odaklı alıcılarda toplanıyor: 4,977 aktif markadan 4'ü dışında hepsi daha önce sponsor olmuş. Bu yüzden holdingin önereceği reklam her nişin bugünkü alıcısına göre şekillenmeli: bilimde Incogni/Brilliant, araçta carVertical, yapay zekâda geliştirici araçları.
2. İlk satışta beklenen gelir küçük kanalda düşük ama birim fiyatı yüksek: 100K altı kanalda medyan $600 ve $36 CPM; 1M–5M kanalda $3,500. Fiyatlandırmada abone sayısı değil, 30. gündeki gerçek izlenme esas alınıyor.
3. Okul öncesi dev kanallarda videoya gömülü sponsorluk neredeyse sıfır (Cocomelon'da 1, ChuChu'da 0). Sponsorlu bir video YouTube Kids uygulamasından kaldırılıyor. Bu yüzden çocuk tarafında para Moonbug ve pocket.watch'ta olduğu gibi lisans, ağ reklamı ve stüdyo hizmeti üzerinden dönüyor.
4. "Yerleştirme ve üretim" modelinin örnekleri var: Moonbug "under one roof", SnoWest $950–3,500. Ölçüldüğü kadarıyla kâr marjını medya getiriyor, yalnız üretim düşük marjlı (Digiday). Kullanım hakkı da ayrı bir gelir kalemi olarak satılıyor (+%30–110).
5. Seri üretilen ya da otomatik üretilen içerik iki yerde birden risk taşıyor: "inauthentic content" politikası (2025-07-15) ve çocuk kalite ilkeleri ("mass production or autogeneration"). Yapay zekâ ile üretilen kanalların reklam geliri bu iki kurala bağlı.
6. Bölgesel kurallar satış biçimini doğrudan etkiliyor: BAE'de reklamcı izni şart, ziyaretçiler ancak lisanslı ajansla çalışabiliyor. Türkiye'de videoda reklam ifşası zorunlu. Rusya'da YouTube küçülüyor ve Telegram büyüyor. Ayrıca pazarın en büyük alıcıları arasında bahis ve tahmin piyasası şirketleri var.