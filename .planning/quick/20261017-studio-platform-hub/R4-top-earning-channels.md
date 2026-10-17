# R4-top-earning-channels (helper report, 2026-10-17; raw evidence paths inside)

Kanıt şunu gösteriyor: YouTube'da büyük gelir var ama bu gelir AdSense'ten gelmiyor. En büyük kanallar asıl parayı **fikri mülkten** kazanıyor: lisans, ürün satışı, platform anlaşmaları ve şirket satışı. Kalitesiz toplu AI içeriği ise 2025–2026'da ardı ardına kapatıldı.

**Yöntem.** Social Blade sayfalarını gizli Chrome ile okudum (`hidden.py read … --wait 8`, toplu okuma için `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h4bin/sb.sh`). Basın, şirket duyuruları ve izahnameler için `mcpx.sh exa` kullandım. Ham dosyalar `/tmp/claude-1000/-home-dxb-DxB-Global-OS/780184a8-14f7-45ce-91c0-2943127c7438/scratchpad/h4/` klasöründe: `sb/*.txt`, `s*.txt`, `q_*.txt`, `r_*.txt`, `t_*.txt`.

**Eksikler.**
- Bende WebSearch/WebFetch aracı yoktu. Bu yüzden kapının "iki taraf birden" kuralı uygulanamadı; kilit rakamları farklı yayın organlarıyla çapraz kontrol ettim.
- Fleet çalıştırılmadı, `evidence.jsonl` satırı yok.
- Playboard kullanılmadı.

## (a) Kanal tablosu

Social Blade (SB) verisi 2026-10-17'de ölçüldü. "30 gün" sütunu SB'nin son 30 gün izlenmesi. SB kazancı bir **satıcı tahmini**dir ve aralığı çok geniştir (yaklaşık 16 kat).

| Kanal | Alan / dil | Abone | 30 gün izlenme | SB aylık tahmin | Diğer gelir verisi (kaynak) | Üretim / başlangıç |
|---|---|---|---|---|---|---|
| Cocomelon | çocuk animasyon, 27 dil (Moonbug) | 203M | 1.4B | $343K–$5.5M | Moonbug ~$3B'a satıldı (basın) | stüdyo; 2006, 2020'de Moonbug'a satıldı (LA Times 2024-11-13) |
| Vlad and Niki | çocuk, 21 kanal / 18 dil | 151M | 507M | $127K–$2M | 405M abone, 21 kanal (CARU/BBB 2024-05-29, birinci el) | insan (çocuklar); 2018 |
| Kids Diana Show | çocuk | 138M | 443M | $111K–$1.8M | — | insan; 2015 |
| Like Nastya | çocuk, 14 yerelleştirilmiş kanal | 133M | 358M | $89K–$1.4M | Forbes: $18M (2019), $18.5M (2020) (basın) | insan; 2016 |
| ChuChu TV | çocuk animasyon, Hindistan | 98.2M | 286M | $71K–$1.1M | — | animasyon (UNVERIFIED); 2013 |
| Baby Shark – Pinkfong | çocuk, 25 dil | 85.3M | 464M | $116K–$1.9M | Şirketin 2024 cirosu KRW 97.4 milyar, %76'sı yurt dışı (şirket, 2025-09-21) | stüdyo; 2011 |
| Bebefinn (Pinkfong) | çocuk | 37.1M | 391M | $98K–$1.6M | Pinkfong kazancının yaklaşık %40'ı (BBC 2025-11-18) | stüdyo; **2022-03-30**, 3,5 yılda şirketin en büyük kalemi oldu |
| Super Simple Songs | çocuk | 47.1M | 565M | $141K–$2.3M | — | 2006 |
| BabyBus | çocuk, Çin | 44.1M | 201M | $50K–$805K | 2020 cirosu RMB 649M; %96.8'i reklam, %25.2'si Google'dan (izahname/basın 2021) | 2016 |
| Masha and The Bear (EN) | çocuk animasyon, 25+ dil | 55.6M | 169M | $42K–$677K | Animaccord'un küresel geliri: UNVERIFIED | stüdyo; 2014 |
| Ms Rachel | okul öncesi eğitim | 21.6M | 368M | $92K–$1.5M | Forbes 2025: $23M; Netflix ile münhasır olmayan lisans (C21 2025-01-15) | insan; 2019 |
| Toyor Al Janah | çocuk, Arapça | 33.8M | 109M | $27K–$435K | — | 2008 |
| Pocoyó Español (Animaj) | çocuk, İspanyolca | 15.3M | 84M | $21K–$337K | Animaj: geçen yıl 22B izlenme, ayda 242M tekil izleyici; Google AI Futures Fund'dan $1M (Bloomberg 2026-03-11) | **AI destekli stüdyo**, bir bölümü 5 haftadan kısa sürede çıkarıyor |
| Kukuli | çocuk, Türkçe | 6.04M | 62M | $15K–$247K | — | 2013 |
| TRT Çocuk | çocuk, Türkçe | 7.53M | 56M | $14K–$223K | — | 2012 |
| Kurzgesagt | bilim animasyonu, İngilizce | 25.7M | 87M | $22K–$350K | Gelir dağılımı aşağıda (kendi açıklaması) | yüzsüz stüdyo; 2013 |
| Kurzgesagt DE | bilim, Almanca | 2.68M | 4.8M | $1.2K–$19K | Almanya kamu yayıncısından gelirin %7'si, 2022'de bitti (kendi açıklaması) | 2014 |
| fern | belgesel | 5.6M | 60M | $15K–$241K | — | yüzsüz (UNVERIFIED); 2020 |
| LEMMiNO | belgesel | 5.93M | 2.4M | $610–$9.8K | — | 2012 |
| Two Minute Papers | AI sektörü | 1.84M | 2.1M | $516–$8.3K | — | insan anlatıcı |
| AI Explained | AI sektörü | 455K | 990K | $247–$4K | — | 2023 |
| 5-Minute Crafts | yüzsüz, çok dilli (TheSoul) | 80.5M | 22M | $5.5K–$88K | TheSoul cirosu yaklaşık $40M, 5MC payı en fazla $20M (AdIndex 2019, Forbes'a dayanarak) | 2016 |
| Bright Side | yüzsüz bilgi (TheSoul) | 44.5M | 18M | $4.4K–$71K | — | 12.015 video; 2017 |
| MrBeast | eğlence | 521M | 2.8B | $709K–$11M | Forbes 2025: $85M | insan |
| MrBeast en Español | dublaj kanalı | 26.8M | 7.8M | $1.9K–$31K | Yalnız 67 video; fiilen uyuyor | 2021 |
| Bandar Apna Dost | AI kısa video, Hindistan | 3.97M | **−2.0B** | $0 | Kapwing tahmini: yılda $4.25M (satıcı tahmini, 2025-11-28) | tam AI; aşağıda başarısızlık bölümüne bakın |
| Adavia Davis ağı | AI "boring history" / uyku, 5 kanal | 400K–1M+ | günde ~2M | — | Ayda $40–60K, gider $6.5K. Fortune AdSense kayıtlarını gördü (basın 2025-12-30) | tam AI (TubeGen), video başına ~$60 |

## (b) Gelir modelleri (AdSense dışı)

- **Kurzgesagt (birinci el, 2023 videosu).** Son 8 yılın dağılımı: mağaza %40, YouTube reklamı %13, Patreon %9, ticari sponsor %12, Alman kamu yayıncısı %7, kurumsal sponsor yaklaşık %10 (Gates %3, Open Philanthropy %5). Mağaza sayfası "kanalın yaklaşık %60'ını mağaza finanse ediyor" diyor (shop-us.kurzgesagt.org, tarihsiz).
- **Moonbug şirket satışı.** $2.75B peşin + $300M performansa bağlı (Reuters 2021-11-03). Cocomelon'un Netflix'te 637M izlenmesi var; 2023'ten bu yana Netflix'teki dizi izlenmesinin yaklaşık %2'si (Deadline 2025-09-17). 2027'den itibaren Disney+'a geçiyor, yılda "on milyonlarca dolar" karşılığında (LA Times 2025-05-25, tek kaynak). Newsletter iddiası: "3,5 yılda $237M ciro, $100M EBITDA" (Rollup Europe; UNVERIFIED).
- **Pinkfong.** Halka arzda KRW 76 milyar topladı; piyasa değeri KRW 545.3 milyar (şirket, 2025-11-17). Baby Shark artık gelirin yaklaşık %25'i, Bebefinn yaklaşık %40'ı (BBC).
- **Like Nastya.** Eski videolarının reklam hakkını Spotter'a peşin para karşılığı sattı (Forbes, basın).
- **Vlad & Niki.** Ürün lisansı WildBrain CPLG'de, ana oyuncak lisansı Playmates'te (License Global 2020). Oyuncak sponsorluğu bir anlaşmada $75K ile $300K+ arası (WSJ 2022-12-07, basın, isimsiz kaynak).
- **Dublaj ve çok dilli ses.**
  - 2023 pilotu: dublajlı videoların izlenme süresinin %15'ten fazlası ana dil dışından geldi (YouTube blogu 2023-02-23, birinci el).
  - 2025: bu oran %25'in üzerine çıktı; Jamie Oliver kanalında izlenme 3 kat arttı (YouTube blogu 2025-09-10, birinci el).
  - MrBeast'in İspanyolca kanalı video başına 100M'a kadar, Portekizce kanalı 5–10M izlenme alıyordu (MrBeast'in 2023 tarihli kendi sözü).
  - Ölçtüğüm durum: o İspanyolca kanal bugün ayda 7.8M izlenmede. Dublajın ana kanala ses izi olarak taşındığı bir çıkarımdır, UNVERIFIED.
  - Dublaj ajansı Unilingo gelecekteki gelirin %10'unu alıyor (Rest of World 2023).
- **BabyBus.** Gelirin %96.8'i reklam, 2020'de gelirin %30'u yurt dışından. Halka arz 2022'de düştü (nbd.com.cn 2022-06-30, basın).
- **Forbes 2025.** İlk 50 içerik üreticinin toplam kazancı $853M, bir önceki yıla göre +%18 (basın).

## (c) Çocuk içeriği

- "Made for kids" etiketi kişiselleştirilmiş reklamı, yorumları, kanal üyeliğini ve bildirimleri kapatıyor. YouTube mekanizmayı doğruluyor ama bir yüzde açıklamıyor (makeinfluence; Google'ı alıntılıyor).
- **2025–2026 ölçümü (satıcı tahmini).** MilX/AIR Media-Tech'in 300 kanallık çalışmasında (Mayıs 2025–Mayıs 2026):
  - Çocuk kanallarının medyan RPM'i $0.33, tüm alanlarda $2.30.
  - Çocuk CPM'i $1.59.
  - Çocuk izlenmelerinin yalnız %32'sinde reklam vardı.
- **Kidscreen 2025-10-27 (basın).** Güçlü bir çocuk kanalının RPM'i $1 ya da altında. Çocuk ve aile içeriği YouTube izlenmesinin %15–20'si; çocuk reklam pazarı yaklaşık $4B.
- **Akademik çalışma (Johnson, Zhong, Cooper; FTC sitesinde yayımlandı).** 2020 sonrası "made for kids" içerikte yeni izlenme %22, yeni abone %29 düştü; orijinal video üretimi yaklaşık %19.6 azaldı.
- **2020 kaybı.** Yoola %30–50 kayıp bildirdi (BI 2020-01-15). WildBrain Spark yıllık bazda −%40 (Kidscreen 2020-05-11).
- **Büyük markalar nasıl kazanıyor.** Lisans, ürün, Netflix/Disney+ anlaşması ve şirket satışıyla (yukarıdaki b bölümü). Kidscreen ve MilX de çocuk gelirinin asıl kaynağının lisans ve ürün olduğunu söylüyor.

## (d) Başarısızlıklar

- **Screen Culture ve KH Studio (sahte AI film fragmanı).** 2M+ abone, 1B+ izlenme, "milyonlarca dolar" gelir. Mart 2025'te reklamları kesildi, Aralık 2025'te kanallar kapatıldı. Gerekçe "spam and misleading metadata" (Deadline 2025-03-30 ve 2025-12-18; YouTube sözcüsü TheWrap'e konuştu).
- **CuentosFacinantes (5.9M abone, 1.2B izlenme) ve Imperio de Jesus (5.8M abone) silindi.** YouTube, Kapwing'in işaretlediği kanallardan 11'inin spam, aldatma ve dolandırıcılık politikası gereği kaldırıldığını doğruladı (The Verge 2026-01-28).
- **Ocak 2026 dalgası.** 16 kanal, toplam 35M abone, 4.7B izlenme, yılda yaklaşık $10M gelir kapandı (TNW 2026-06-15, TechTimes 2026-07-15; ikincil basın). Aynı dalgada 588K aboneli, ayda yaklaşık $30K kazanan bir İncil hikâyesi kanalının tamamının reklamı kesildi (kanal adı UNVERIFIED).
- **Bandar Apna Dost (ölçtüm).** Son 30 günde −374 video ve −2.0B izlenme. Kapwing raporundaki 2.07B izlenme bugün 661M. Sebebin YouTube'un kaldırması mı yoksa sahibinin silmesi mi olduğu UNVERIFIED.
- **Politika.** 15 Temmuz 2025'te kural yeniden adlandırıldı. YouTube'un kendi açıklaması: "channels that use AI … remain eligible", ama "mass-produced or repetitive" içerik para kazanamaz. Temmuz 2026'da üç kategori netleştirildi (Tubefilter 2026-07-13):
  1. Şablon ya da tekrar içerik
  2. Duygu sömüren / şok amaçlı içerik
  3. Sağlık, hukuk, finans ve siyasette AI "uzman" personası
- Bu kural para kanalın tamamından kesilir. Yüzsüz kanallar aleyhine algoritma değişikliği iddiası THR 2026-06-13'e dayanıyor; ikincil kaynaktan, birinci elden UNVERIFIED.
- **Moonbug'ın platform bağımlılığı.** Kevin Mayer: "instead of 12 billion views, we get 9 billion views that month" (Deadline 2025-09-17).

## (e) Holding için anlamı (yalnız bu kanıttan)

1. Çocuk ve eğitim içeriğinde izlenme çok büyük, ama reklam geliri 1000 izlenme başına yaklaşık $0.33–$1. Kazanç, kurulan karakterin lisansında ve ürününde.
2. En yakın örnek Bebefinn: sıfırdan 3,5 yılda 37.1M aboneye ve Pinkfong kazancının yaklaşık %40'ına ulaştı. AI stüdyo modeli Animaj'da Google desteğiyle zaten çalışıyor.
3. Çok dil kanıtlanmış bir kaldıraç: ses izi eklenince izlenme süresinin %25'ten fazlası ana dil dışından geliyor. Vlad&Niki, Nastya, Pinkfong ve Masha 13–27 dilde yayında.
4. Belgesel ve AI sektörü kanallarında reklam geliri küçük (AI Explained ayda $4K'nın altında, LEMMiNO $10K'nın altında). Kurzgesagt bile gelirinin yalnız %13'ünü reklamdan alıyor; ana kaynağı mağaza.
5. Toplu, şablonlu AI içerik bugün yasak bölge: 2025–2026'da 2M ile 5.9M arası aboneli kanallar kapandı ve ceza kanalın tamamına uygulanıyor. Burada kalite ve özgün hikâye bir tercih değil, geliri korumanın şartı.
6. Tek bir platforma bağlı kalmak risk: Moonbug bir ayda algoritma yüzünden 3B izlenme kaybetti. Bu yüzden Netflix/Disney+ lisansı, ürün ve kendi mağaza hattı ilk günden planlanmalı.