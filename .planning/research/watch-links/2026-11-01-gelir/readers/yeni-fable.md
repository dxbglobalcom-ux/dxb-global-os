# Grup `yeni` — okuyucu Fable 5.1 · 1 Kasım 2026

Üç transkript baştan sona okundu (`$J/tx/oL2xB4DiXEo.txt`, `HN_1kEGNu3Y.txt`, `OxQ47jXQApk.txt`). Künye verileri YouTube izleme ve kanal sayfalarından ölçüldü (1 Kasım 2026, curl ile; video indirilmedi). Adı geçen her alet kendi kaynağından okundu. İlk turda incelenen yöntemler (BRIEF2 §2) tekrar açılmadı; bu videoların eklediği yazıldı.

**xUZYy3hCRUM (Koerner) için tek satır:** ilk turda Koerner grubunda incelendi; burada yeniden incelenmedi.

İşaretler: **kanıtlı** = birinci kaynakta ölçüldü · **iddia** = konuşmacının sözü, kaynak yok · **abartı** = kaynak sözü yalanlıyor ya da sayı seçilmiş.

---

## 1. oL2xB4DiXEo — Doruk Yalçınsoy, "Yapay Zekayla Para Getiren 3 Sistem Nasıl Kurulur?"

### 1.1 Künye
19:22 · yayın 30 Ekim 2026 · 4.652 izlenme, 97 beğeni (1 Kas) · kanal 37,1 bin abone, 190 video, 1,79 milyon toplam izlenme (2012'den beri). Sponsor yok; açıklamadaki Hetzner linki ve Skool topluluğu (`skool.com/is-guc-yapayzeka`: **117 üye, 59 $/ay ya da 390 $/yıl**) kendi satışıdır — 18:15–19:15 arası topluluk çağrısı. Konuşmacının kendi gelir motoru bu topluluk ve kurumsal danışmanlık (`dorukyalcinsoy.com`: Eczacıbaşı, Enerjisa, Alotech logoları; fiyat yok; "Konsol" sitede geçmiyor, yalnız toplulukta "tek ekranda modeller ve ajanlar için konsol" diye anılıyor).

### 1.2 Ne diyor (sırayla)
- 00:00–02:00 Sunucu (7/24 bulut) ile lokal (kendi bilgisayarın) ayrımı; soru "7/24 çalışan mı lazım, sen açıkken çalışan mı". *Doğru çerçeve; holding bunu B33 (tezgâh) ve B09/B11 (24/7 sunucu) ile yaşadı.*
- 02:01 Türkiye'de girişimlerde YZ kullanımı geçen yıl %7,5, bu yıl %14 — **kanıtlı** (TÜİK Yapay Zekâ İstatistikleri 2025 ve 2026; 10+ çalışanlı girişimler).
- 02:43 **Yöntem 1 — ajanı sunucuya kurup satmak.** Hermes (Nous Research) örneği; "harness" katmanı; kurulum ücreti + yıllık destek anlaşmasıyla aylık ücret; Türkiye'de bile 4.000–5.000 $ kurulum faturası **iddia** ("faturaların mümkün olduğunu biliyorum").
- 03:03 "Grok Bot, Muse, ChatGPT … Cloud duets" — otomatik altyazıda bozuk; ekranda gösterilmiyor, çözülemedi.
- 05:06 Ürün/yazılım satmaya inanmayın, uzun ve yatırımcılı iş — Rapor 1 ve 24 Eylül çalışmasıyla aynı hüküm (SaaS "sonra").
- 06:05 **Yöntem 2 — yazılım ve platform.** Web sitesi başına 10–20 bin ₺ (≈ 240–480 $), e-ticaret 200–300 bin ₺; "KOBİ'lerin %50'sinin sitesi yok" **iddia** (TÜİK'te bu oran bulunamadı); emlak için sesli YZ platformu, dakika ya da abonelik ücreti; mobil uygulama "yüksek ciro ama yüksek reklam bütçesi".
- 08:24 **Yöntem 3 — lokal model.** TTS geçen yıl 1.500 $/ay iken şimdi 5 $/ay **iddia**; LLM/STT/TTS/görsel (Qwen)/ses-ses/video sınıfları; gelir: danışmanlık + kendi modelini API olarak kiralamak + özel eğitilmiş tek-iş model. Finans, sağlık, telekom verisini Türkiye içinde tutmak zorunda; şirketlerin %30–50'si bazı süreçlerde lokal ister **iddia**.
- 13:38 **Bonus — sunucuyu kendi VPN'in yapmak** (WireGuard, Almanya/ABD IP). Hetzner 4 GB sunucu "aylık ~5 €" — bugün **CX23 2 vCPU/4 GB/40 GB: 5,99 €/ay**, IPv4 dahil (hetzner.com, 1 Kas; sayfada "şu an mevcut değil" uyarısı var).
- 14:30–18:15 Kurulum artık "ajanla konuşmak": Claude Code, Hetzner API/SSH/MCP. 17:15: kendi güvenlik testi için Hermes'te **guardrail'i kırılmış ("obliterated") model** kullandığını söylüyor.

### 1.3 Para yöntemleri

**Y1 — Ajan kurulumu satmak (kurulum + yıllık bakım)**
- Rakam: 4.000–5.000 $ kurulum, aylık bakım ücreti — iddia; dünyada benzer işin fiyatı Rapor 1 D kalemi ve REVENUE-OPPORTUNITIES #15 (dijital kadro paketleri), #9 (kurumsal ikinci beyin) ile aynı sınıf.
- Helal: geçer.
- DXB'de ne var: fikir üç yerde yazılı (Rapor 1 D · REV #9/#15 · B64 "müşterinin aylık paketi bir hat olarak koşar"); teklif şablonu ve anonim vaka yok; sahibi satır yok (B17'nin tablosu içinde). Holding kendi "Hermes"ini (gece sunucusu, B09/B11) sildi; Nous'un `hermes-agent`'ı (259.400 yıldız, MIT, son commit 1 Kas 2026 — kanıtlı) bir harness, bizim ikinci ajan çatısı kuralımıza aykırı (STACK). **Satılacak şey Hermes kurmak değil, holdingin kendi düzenidir:** persona fabrikası, Hamza tipi orkestratör, onay kapısı, maliyet defteri.
- **Ferrari sürümü — "Dijital kadro kurulumu" hattı:** (1) ücretli keşif raporu (müşterinin maaşla yaptırdığı tekrarlayan işler listesi, 2.500 $ sınıfı — Rapor 1 kapı açıcı) → (2) kadro tasarımı: 3–5 persona + görev sözleşmeleri, persona fabrikasından (dxb-persona) → (3) kurulum: müşterinin kendi Hetzner/sunucusuna ya da bizim çok-kiracılı motorumuza → (4) 30 gün devir ve eğitim → (5) aylık bakım: model güncellemesi, maliyet raporu, yeni görev. Kim: satış (keşif), mühendislik (kurulum), müşteri başarısı (bakım), finans. Saatle kendiliğinden: bakım raporu, model/fiyat taraması (B42), sağlık kontrolü. Kapı: sözleşme ve kurulum ücreti faturası (sözleşme), müşterinin sunucu/anahtar hesapları (kimlik), bizim adımıza sunucu kiralama (para çıkışı).
- Jeton: paket şablonu bir kez (ağır: persona seti + kurulum betikleri); müşteri başına kurulumda orta, bakımda düşük (aylık rapor + güncelleme). Gelir/jeton yüksek: hizmetin değeri kurulumda, jetonu bir kez yakılıyor.
- İlk test: holdingin kendi kurulumunu dış gözle "paket" hâline yazmak (kurulum kılavuzu + fiyat sayfası) — 0 $, 2 gün; sonra tek müşteriye ücretli keşif raporu satılır (Y9 bulma hattı). **Bunu yapalım mı?** Önerim: **evet** — Rapor 1'in D kalemini "sonra"dan Öncelik 2'ye alıp B64 iş-tipi menüsüne "kurulum" tipi olarak yazmak; holding bunun tek canlı kanıtı.

**Y2 — Web sitesi / platform / uygulama satmak**
- İlk turda var (web ofisi, Y9/Y11, B64 deneme). Bu videonun eklediği: Türkiye fiyatı 10–20 bin ₺ holdingin 1.000 $ tabanının altında — yerel pazar yok, ihracatçı marka var (24 Eylül çalışması §2.8); emlak için "tıkla-arasın, görüşmeyi kaydetsin" sesli platform = REV #12 beyaz-etiket sesli asistan, ücret dakika başına. Helal geçer. Soru yok; sahibi Y9/Y11 + REV #12.

**Y3 — Lokal model kiralamak / danışmanlık**
- Rakam: TTS 1.500 → 5 $/ay iddia; %30–50 lokal talebi iddia (kaynak yok).
- Helal: geçer; müşteri süzgeci bankayı dışarıda bırakır (faizli finans), hastane ve telekom içeride.
- DXB'de ne var: B34 (yerel işçi model), B33 (tezgâh), stüdyo yerel GPU; Qwen-Image (Apache-2.0, 8.442 yıldız — kanıtlı) stüdyonun görsel eli olabilir. Eksik: dışarıya API satış yolu, çok-kiracılı ölçüm. Rapor 1'in hükmü: makineyi satmak "sonra".
- **Ferrari sürümü:** lokal model kurulumu Y1 hattının bir istasyonu olur ("veriniz sizde kalır" seçeneği: müşterinin sunucusuna STT/TTS/LLM), ayrı iş değil. GPU kiralamak hayır — tezgâh tek kart (B33), müşteri yükü stüdyonun işini keser.
- Jeton: kurulum bir kez; bakım düşük. **Bunu yapalım mı?** Önerim: **Y1'in içinde evet, ayrı hat olarak hayır.**

**Y4 (bonus) — Kendi VPN sunucusu**
- Gelir değil, el: ülke IP'si ile platform ve pazar okumak (B30 eller, B82 gözlem odası, 24 Eylül'ün ülke masaları). WireGuard ücretsiz; Hetzner CX23 5,99 €/ay. Kapı: aylık ödeme (para çıkışı) → tek onay. Önerim: **Dene** — iki ülke IP'si (ABD, Almanya) ≈ 12 €/ay; soru CEO'ya tek satır: "İki sunucu kiralansın mı?"

### 1.4 Gürültü ve risk
- Gelir rakamlarının hiçbiri kaynaklı değil; konuşmacının kanıtlı geliri topluluk (117 × 59 $ ≈ 6.900 $/ay tavan) ve danışmanlık.
- 17:15 "obliterated" model: holding guardrail'i kırılmış model çalıştırmaz (İslami sınır ve kalite); müşteri işine de koymaz.
- "Türkiye'de rekabet yok" varsayımı bize taşınmaz (Rapor 1 §9).

---

## 2. HN_1kEGNu3Y — Yüzsüz Ninja, "4 Aylık Kanal Ayda 3000 Dolar: Bütün Sistemi Claude Code ile Kurdum"

### 2.1 Künye
7:59 · yayın 27 Ekim 2026 · 8.485 izlenme, 132 beğeni (1 Kas) · **kanal 27 Eylül 2026'da açılmış, 426 abone, 9 video, 43.495 izlenme** — yani "ayda 3.000 $" kanal onun değil, başka birinin referans kanalı; adı söylenmiyor. Sponsor: Nichle linki `?ref=yt-v10` (ortaklık linki); Notion'daki master prompt ve "video 03" linkleri açıklamada yer tutucu olarak kalmış ("[Notion linki]").
- **Aletler, kaynağından:** "Nicheless" diye duyulan alet **Nichle** (`nichle.com`): YouTube niş ve kanal bulucu, outlier puanı (×1/×3/×10/×30), benzer kanal, swipe file, Chrome eklentisi; **12 $/ay ya da 99 $/yıl, 7 gün deneme**; iyzico ile ödeme, Türkçe sözleşmeler → Türk yapımı. Gemini görsel API: `gemini-2.5-flash-image` **0,039 $/görsel, 15 Mart 2027'de kapanıyor**; yerine Nano Banana 2.1 **0,0336 $/1K görsel**, Nano Banana 2 0,067 $/1K, Pro 0,134 $ (ai.google.dev fiyat sayfası, 1 Kas); ücretsiz katman yok. 100 görsellik video ≈ 3,4–3,9 $. Yerel seçenek: Qwen-Image (Apache-2.0) bizim kartta 0 $.

### 2.2 Ne diyor (sırayla)
- 00:00 Referans kanal: 4 aylık, ~3.000 $/ay yalnız reklam geliri, 8 dk video, haftada 2 — **iddia** (kanal adı yok; ekran 00:00–00:30 ve 04:25'te yan yana gösteriliyor → lider bu kareleri alırsa kanal adı ve Social Blade ile doğrulanır).
- 00:30–01:27 Claude Code + Google AI Studio API anahtarı; "anahtar cüzdanın gibi" uyarısı doğru.
- 01:27 Niş: Nichle'da "231 tarih kanalı, son 90 günde 15 yenisi; en yenisi 2 aylık, 7 videoyla 400 bin+ izlenme" — **iddia**, hesapsız doğrulanamaz; mekanizma (outlier puanı) **kanıtlı**.
- 01:58–02:47 Senaryo: başka dilde tutmuş videonun transkriptini al, **çevirtme, tarzını analiz ettir**, kendi konun için sıfırdan yazdır. *Bu doğru ve yeniden-kullanım yasağına (R5 "reused content") takılmaz; SIGNAL'in "kalıp çıkar" fikriyle aynı.*
- 02:47 **Master prompt**: çizim tarzı, saniye başına görsel sayısı, karakterler, model, tutarlılık kuralları — "hattın bütün kuralları tek sayfada".
- 03:15–04:25 Zaman damgalı senaryo → Claude Code görselleri Gemini'den toplu üretir, klasöre yazar; 100 görsel dakikalar içinde — **kanıtlı** (API fiyatı ve akış doğru).
- 04:49 Karakter kayması iki şeyle önlenir: master prompt + her istekte giden referans çizim. Doğru; stüdyonun "tutarlı karakter" sorunuyla aynı.
- 05:19 "Sistemi herkes kurar, farkı fikir yaratır; sabır" — samimi uyarı.
- 05:48–07:08 Kurgu: dosyaları `00_00`, `06_20` gibi zaman adıyla yeniden adlandır, CapCut/DaVinci'de dizmek 1–2 dk — **kanıtlı**; ama hâlâ elle.
- 07:08 "Video değil üretim hattı kurduk"; 07:22 YouTube kalıpla seri üretimin parasını kesiyor — **kanıtlı** (R5: inauthentic content, 15 Tem 2025 yeniden adlandırma; Tem 2026 netleştirmesi).

### 2.3 Para yöntemi

**Y5 — Yüzsüz çizim kanalı: reklam geliri (sonra sponsor)**
- Rakam: 3.000 $/ay iddia. Gerçek çapa (R3, 17 Ekim, Studio verisi): eğitim/bilim uzun video medyan RPM **10,22 $**, tarih tahmini 9,9 $ (satıcı); ABD izleyici 1×, Türkiye 0,035× → **kanal İngilizce olur.** 3.000 $ için ayda ≈ 300 bin ücretli izlenme gerekir; 8 videoyla "4 ayda" bu ancak outlier kanalda olur (hayatta kalanlar yanılgısı).
- Helal: **şüpheli → soru.** İçerik (tarih, bilim) geçer; **insan ve hayvan çizimi** için "canlı tasviri" hükmü 18 Ekim'de çocuk animasyonu için açık bırakıldı (platform-hub FINAL.md §Kanallar); bu kanal da çizgi insan kullanır. Müzik yok (stüdyo yasası). AdSense'te haram kategoriler kapalı tutulur.
- DXB'de ne var: stüdyo (B43), SIGNAL (kalıp çıkarma), OpenMontage + ffmpeg (kurguyu otomatik yapar — videonun elle kalan adımı bizde kapanır), motorun kendi sesi, persona dolabı, R3–R7 araştırmaları, **CEO'nun "YouTube, Instagram, TikTok'tan kazançlar akmalı" sözü (12 Tem) ve `content_monetization` defter sınıfı.** Eksik: **kanal satırı yok** — platform-hub planı kanalları "ayrı çalışma" diye çıkardı (18 Ekim), satır açılmadı; YouTube hesabı/kanal açma (kimlik adımı); yayın API'si.
- **Zaman gerçeği:** YPP giriş barajı **1 Şubat 2027'de** 4.000 → 8.000 saat izlenmeye çıkıyor; 31 Ocak 2027'den önce giren kanal eski barajda kalır (R5, YouTube'un kendi sayfası). Kanal açılacaksa Kasım'da açılır.
- **Ferrari sürümü — "Kanal hattı" (OS içinde):** istasyonlar: (1) **Niş masası**: Nichle (12 $/ay) ya da kendi outlier tarayıcımız (YouTube Data API ücretsiz kota + scrapling; "kanalın normalinin ×3 üstü" hesabı basit) — haftalık, kendiliğinden; (2) **Kalıp çıkarma** (SIGNAL): seçilen 5 outlier videonun yapısı — giriş, merak, cümle boyu — sayılarla; (3) **Senaryo ustası**: her bölüm ayrı hikâye, kendi karakterleri (R5'in izin verdiği "distinct storyline" sınıfı), zaman damgalı; (4) **Görsel istasyonu**: master prompt + referans; önce Qwen-Image yerel (0 $), kalite düşerse Nano Banana 2.1 (0,034 $/görsel) — tezgâh kuyruğu (B33); (5) **Ses**: motorun kendi sesi, İngilizce; çok-dil ses izi (R5: tek videoda çok ses izi; Türkçe→İngilizce otomatik dublaj yalnız bu yönde); (6) **Kurgu**: OpenMontage/ffmpeg zaman damgasından otomatik timeline — CapCut adımı yok; (7) **Kalite kapısı**: karakter tutarlılığı ölçümü (görsel benzerlik), kalıp sınavı, yeniden-kullanım kontrolü; Sol gözü; (8) **Yayın**: YouTube API ile zamanlı; (9) **Ölçüm**: 7. gün izlenme/elde tutma → niş masasına geri. Haftada 2 video, saatle. Kapı: kanal/Google hesabı açma ve kanal kimliği (kimlik) → CEO; Nichle ve API ödemesi (para çıkışı) → CEO; sponsor sözleşmesi (sözleşme) → CEO. Para girişi (AdSense) onaysız akar.
- Jeton: hat bir kez kurulur (ağır: master prompt, kurgu betiği, kalite ölçer); video başına orta (senaryo + 80–120 görsel istemi ≈ 100–150 bin jeton Opus sınıfı; görsel maliyeti 0–4 $); bu "bir varlık üret, sonra kazansın" sınıfı: her video kütüphanede kalır ve yıllarca izlenir. Gelir/jeton: ilk 4 ay sıfır (baraj), sonra tek yönlü.
- İlk test (kapı içinde): **1 pilot kanal, İngilizce, eğitim/tarih, 8 video / 4 hafta**; maliyet ≈ Nichle 12 $ + görsel 0–30 $ + kart saati; ölçülen: ilk 48 saat izlenme, elde tutma (%), abone/video, YouTube'un etiket/politika tepkisi; YPP'ye bu sürede ulaşılmaz, ulaşma hızı ölçülür. **Bunu yapalım mı?** Önerim: **evet, Kasım'da, tek pilot** — çocuk animasyonu değil (MFK RPM 0,33 $ ve canlı tasviri hükmü), İngilizce eğitim/tarih; canlı tasviri sorusu birlikte sorulur.

### 2.4 Gürültü ve risk
- "4 ayda 3.000 $" bir outlier'ın sayısı; kanalın kendisi 426 aboneli — survivorship.
- Platform: inauthentic content politikası kanal bütününü yargılar; seri kalıp = tüm kanal demonetize; bir ihlal kardeş kanallara sıçrar (R5). Cevap: kendi karakter ve hikâye, kalıp sınavı kapısı.
- 1 Şubat 2027 barajı iki kat; Shorts havuzu ayda 10M şartı — uzun video hattı seçilir.
- Gemini 2.5 Flash Image Mart 2027'de kapanıyor; hat model-bağımsız yazılır.

---

## 3. OxQ47jXQApk — Mark Tilbury, "Ranking 7 Side Hustles That Made Me Rich (2026)"

### 3.1 Künye
24:51 · **yayın 24 Ekim 2024** (sayfa verisi) — başlıktaki "(2026)" sonradan değiştirilmiş, video iki yaşında · 698.889 izlenme, 18.173 beğeni · kanal 9,34 milyon abone, 384 video, 2,64 milyar izlenme. **Sponsor bölümleri:** 13:09–14:10 Trading 212 (kod TILBURY, 100 £'a kadar bedava hisse) ve açıklamada Webull ortaklık linki (ABD); "bazı linkler komisyon getirir" beyanı var. "Haftada 100.000 $+" toplam gelir **iddia**.

### 3.2 Ne diyor (sırayla; puanlar onun 1–5 ölçeği: zaman / para / 100 $-haftada kolaylığı)
- 00:28 **Perakende mağaza** (RC model dükkânları): iş planı → müşteri araştırması (rakibin dükkânında çalış) → banka kredisi/kitle fonlaması; 2/4/5. Kredi faizli — bize yol değil.
- 04:34 **Kendi markası, Çin'de üretim**: niş seç (kült takipçi), trend izle (Represent: oversize → fitness), topluluk kur (Spartan Race 1,5 milyon katılımcı **iddia**); 2/3/4–5.
- 08:15 **eBay — batan dükkânların stokunu komisyonla satmak**, sonra kendi tedarikçinden almak; "paramı üçe katladım" **iddia**; 50 ürün × 2 $ kâr = 100 $/hafta; 3–4/5/5.
- 11:02 **Borsa**: enflasyon 60 yılda ort. %3,8; oğlu günde 5 £ → 1.783 £, %18 getiri; 250 £/ay × 31 yıl → 2,19 milyon £ projeksiyonu (uygulamanın hesabı). Sponsor segmenti. 5/5/2,5.
- 15:23 **Konut kiralama + deal sourcing** (fırsat bulup yatırımcıya bulucu ücretiyle satmak): öğren → ağ kur → ilan/müzayede/sokak tarama; "tek ücret binlerce $" iddia; 3/5(bulucu)/5.
- 18:31 **Ticari gayrimenkul** (depo kiralama): nakit akışı yüksek, değer artışı düşük; 3/1/4.
- 19:57 **Kişisel marka**: araştır (tek şerit, tek mesaj) → üret (mükemmeliyetçilik yok) → para: reklam, marka anlaşması, dijital ürün/kurs/topluluk; 1.000 abone + 4.000 saat barajı (2024 bilgisi; **1 Şubat 2027'de 8.000 saat olacak**); 2/3/4.

### 3.3 Para yöntemleri

**Y6 — Perakende mağaza · Y11 — Ticari gayrimenkul.** Fiziki, sermayeli, banka kredili; dijital holdingin bugünkü yolu değil. Not: holdingin "kendi şirketi" yolu (gelir-baglam 4. yol) gelecekte fiziki şirketi dışlamaz; şimdi tahtaya satır gerekmez. Soru yok.

**Y7 — Kendi ürün markası (Çin'de üretim, dünyaya satış)**
- Rakam: yok (anekdot). Helal: geçer (ürün helal olmak kaydıyla); üretici sözleşmesi ve stok parası kapıda.
- DXB'de ne var: e-ticaret motoru sınıfı (`ecommerce`/`physical` engine, Outleteuro pilotu kapandı), REV #4 trend-sinyal, stüdyo UGC reklam (B28/B43), katalog otomasyonu #11. Eksik: tedarik/lojistik eli, sermaye (G4: capital_limit 0).
- **Ferrari sürümü — "Marka fabrikası" hattı:** niş tarayıcı (REV #4) → talep kanıtı (ön-sipariş sayfası, web ofisi) → tedarikçi ajanı (Alibaba/1688 teklif toplama — Koerner "quote-finder"ın kendisi) → numune → stüdyonun UGC reklamı → Shopify/Amazon → katalog otomasyonu. Kapı: tedarikçi sözleşmesi, stok ve reklam parası (para çıkışı), mağaza hesapları (kimlik). Jeton: araştırma ve reklam sürekli (ayda orta), ama ürün başına; gelir/jeton reklama bağlı, hizmet hatlarından düşük.
- İlk test: 0 $ — niş tarayıcıyı bir kategoriye koşturup 3 aday ürün ve tedarikçi teklif aralığını çıkarmak, 1 hafta. **Bunu yapalım mı?** Önerim: **şimdi değil**, sermaye kapısı 0 ve hizmet hatları (A, B, Y1) önce; tahtaya "sonra" notu.

**Y8 — eBay: başkasının ölü stokunu komisyonla satmak**
- İlk turda "konsinye ajanı" (Koerner) var. Bu videonun eklediği: kaynak = yaşlı sahipli, batan dükkânlar; önce komisyon (0 $ sermaye), sonra kendi stokun. Helal: komisyonla satış geçer; mal elimizde/yetkiyle satılıyor, dropshipping şüphesi yok. Soru yok; ilk tur hükmü geçerli.

**Y9 — Borsa (Trading 212)** — **geçmez** (CEO hükmü: hisse/kripto alım-satımı yok; sponsor segmenti). Rakamlar uygulamanın projeksiyonu.

**Y10 — Emlak fırsat bulma (deal sourcing, bulucu ücreti)**
- Rakam: "tek ücret binlerce $" iddia; İngiltere'de bulucu ücreti piyasada 2–5 bin £ sınıfı (ölçülmedi, ⚠).
- Helal: **şüpheli → soru.** Aracılık ücreti (simsariye) geçer; ama yatırımcı çoğu zaman faizli ipotekle alır — bizim gelirimiz aracılık, finansman onun; CEO hükmü ister. İngiltere ve BAE'de aracılar için kayıt zorunluluğu var (İngiltere: redress scheme + AML; BAE: RERA) — sözleşme adımı zaten kapıda.
- DXB'de ne var: REV #10 (ihale/pazaryeri izleme + teklif taslağı) aynı desen; scrapling/agent-reach; 24 Eylül'ün ülke masaları (Körfez ev sahası). Eksik: yatırımcı listesi, değerleme modeli, sahibi satır yok.
- **Ferrari sürümü — "Fırsat masası" hattı:** (1) tarayıcı: ilan siteleri + müzayede + uzun süredir satılmayan ilanlar (fiyat düşüşü, "motivated seller" sinyali) — gece, kendiliğinden; (2) değerleme: bölge emsalleri, kira getirisi, yenileme tahmini — kodla; (3) paket: tek sayfa fırsat dosyası (stüdyo görselleri); (4) yatırımcı ağı: CRM'de kayıtlı alıcılar, eşleşme; (5) bulucu sözleşmesi ve ücret tahsilatı (B05). Kapı: her sözleşme → CEO; para girişi onaysız. Jeton: tarayıcı ucuz (kod), paket başına düşük-orta; gelir/jeton yüksek (tek ücret bin $ sınıfı).
- İlk test: tek şehir (Dubai ya da Londra), 2 hafta, 0 $: tarayıcının bulduğu "emsalinin %10 altı" ilan sayısı ve bir yatırımcının "bunu alırdım" demesi. **Bunu yapalım mı?** Önerim: **evet, önce test** — ağ ve sözleşme adımı sizde; faizli finansman sorusuyla birlikte.

**Y12 — Kişisel marka (reklam + marka anlaşması + dijital ürün)**
- İlk turda kısmen var (AI influencer + Stan Store; CEO'nun kendi notu "influencer oluştur, dijital ürün sat"). Bu videonun eklediği: **para sonra, önce izleyici**; tek şerit tek mesaj; üç gelir sırası reklam → marka anlaşması → kendi ürünü/topluluğu (Doruk'un 59 $/ay topluluğu bunun örneği). Helal: geçer; yüz/kimlik = C41 (dünyaya bakan personalar) ve B43 sanal sunucu planı (teklif, onaysız). Sahibi: C41 + kanal çalışması (satır yok). Y5 ile aynı hatta koşar: aynı kanal ekosistemi, ek istasyon "sponsor defteri" (R6) ve "dijital ürün" (Stan Store ilk turda). Soru: Y5'in sorusu içinde.

### 3.4 Gürültü ve risk
- Video 2024'ten; "(2026)" başlık yeniden paketleme. Tilbury'nin yedi akışı 10+ yıllık sermaye ve İngiltere emlak piyasasına dayanır; "100 $/hafta kolay" puanları onun durumundan.
- Dört akış (mağaza, borsa, konut, ticari) sermaye ya da faizli finansman ister; bize kalan üç: marka (sonra), eBay/konsinye (ilk tur), fırsat masası (test) ve kişisel marka (kanal hattı).

---

## 4. Grup için en önemli beş şey (sıralı)

1. **Kanal hattı Kasım'da açılmalı (Y5 + Y12).** YPP barajı 1 Şubat 2027'de ikiye katlanıyor; önce giren eski barajda kalır. Stüdyo, SIGNAL, OpenMontage ve motorun sesi hazır; eksik yalnız kanal satırı, hesap (kimlik, sizin tıkınız) ve canlı tasviri hükmü. İngilizce eğitim/tarih, tek pilot, haftada 2 video.
2. **Ajan kurulumu satmak holdingin en ucuz jetonlu hizmeti (Y1).** Jeton kurulumda bir kez yanar, bakım düşük; holding bunun tek canlı kanıtı; Rapor 1 D kalemi Öncelik 2'ye alınıp B64 iş-tipi menüsüne "kurulum" olarak yazılmalı.
3. **Videonun elle kalan adımı bizde otomatik (Y5 §Ferrari).** Yüzsüz Ninja kurguyu CapCut'ta elle diziyor; bizde zaman damgası → ffmpeg timeline kodla; karakter tutarlılığı ölçülerek kapıdan geçer. Fark Ferrari'yi yapan budur, prompt değil.
4. **Emlak fırsat masası (Y10) sıfır sermayeli, yüksek bilet.** REV #10 deseniyle iki haftalık 0 $ test; Körfez ev sahası. Faizli finansman sorusu size.
5. **Gerçek sayılar:** Nichle 12 $/ay (Türk yapımı), Nano Banana 2.1 0,0336 $/görsel (2.5 Flash Image Mart 2027'de kapanıyor), Hetzner CX23 5,99 €/ay, RPM eğitim 10,22 $ (Studio verisi), TR izleyici ABD'nin 0,035'i. Videoların gelir sayılarının hiçbiri kaynaklı değil; Tilbury videosu 2024 tarihli.

## 5. Sizin kararınız gereken sorular (her biri evet/hayır, önerimle)

| # | Soru | Şüpheyi doğuran gerçek | Önerim |
|---|---|---|---|
| S1 | Holdingin kendi yüzsüz **İngilizce eğitim/tarih kanalı** Kasım'da tek pilot olarak açılsın mı (kanal hesabı sizin tıkınız)? | YPP barajı 1 Şub 2027'de 2 kat; platform-hub planı kanalı "ayrı çalışma" bıraktı, satır yok | **Evet** — 8 video/4 hafta, ≈ 12–45 $ |
| S2 | Çizim kanalında **insan ve hayvan tasviri** (çizgi karakter) kullanılabilir mi? | 18 Ekim'de çocuk animasyonu için "canlı tasviri hükme bağlanmadı" yazıldı; bu kanal da çizgi insan kullanır | Sizin hükmünüz; hayırsa sembol/harita/nesne tarzı ile hat yine kurulur |
| S3 | **Ajan kurulumu hizmeti** (Y1) B64 iş-tipi menüsüne "kurulum" tipi olarak girsin, Rapor 1 D kalemi Öncelik 2 olsun mu? | Üç belgede fikir var, sahibi satır yok | **Evet** |
| S4 | **Emlak fırsat masası** için 2 haftalık 0 $ test (Dubai/Londra) yapılsın mı; yatırımcının faizli ipotekle alması bizim aracılık ücretimizi etkiler mi? | Gelirimiz aracılık; finansman karşı tarafın | **Test evet**; faiz sorusu sizin hükmünüz |
| S5 | **İki Hetzner sunucusu** (ABD + Almanya, ≈ 12 €/ay) ülke IP'si ile pazar/platform okumak için kiralansın mı? | Para çıkışı | **Evet**, küçük |
| S6 | **Kendi ürün markası** (Çin'de üretim) tahtaya "sonra" notuyla girsin mi? | Sermaye kapısı 0 (G4); hizmet hatları önce | **Sonra** |
| — | Borsa (Y9), perakende/ticari gayrimenkul (Y6, Y11) | CEO hükmü (alım-satım yok) ve faizli kredi | Soru yok; dışarıda |

## 6. Liderin alması gereken kareler
- HN_1kEGNu3Y **00:05–00:30** ve **04:25–04:45**: referans kanalın adı/ekranı → Social Blade ile "3.000 $/ay" doğrulanır.
- HN_1kEGNu3Y **01:27–01:58**: Nichle ekranı — "231 tarih kanalı / 15 yeni / 400 bin izlenme" sayıları.
- oL2xB4DiXEo için kare gerekmez (ekranda yalnız Hetzner paneli ve Claude Code).
