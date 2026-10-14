

## W093 — Holo (tryholo.ai) — 'pazarlama departmanı tek işe alım'; CEO notu: personalara özel skill'ler hazır mı?
- Link: https://www.instagram.com/p/Db54Yqiskdn/
- His note when he sent it: ok şirketin elemanları personalar yazıldı ama onlara özel skiller hazır mı? / burdaki hataya düşmeyelim

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-05
- **Tür:** araç
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** CEO'nun sorusunun ölçülmüş cevabı: 213 personanın hiçbirine skill atanmamış (library_grants'te skill hibesi 0, kütüphanede 2 skill) — personalar yazıldı, elleri yok. İşin sırası: her departmana 3–5 iş skill'i listesi (SEO'ya OpenSEO, ücretli medyaya claude-ads, sosyal medyaya içerik/onay akışı) → hibe → bir müşteri işinde kullanım günlüğü; lisansı kopyalanamayan skill'ler (B27) giremez. Asıl ilerleme W079/B41 satırında.
- **Gelir (0-3):** 2
- **Gelire katkısı:** 67 üretim koltuğunun satılabilir iş çıkarmasının ön şartı — bütün ajans tekliflerini birden yükseltir. Pazar uyarısı: Holo aynı vaadi 20–48 $/ay'a yazılım olarak satıyor; saf içerik üretimi ucuz yazılımla yarışılmaz, fiyat 'yapılmış iş + sonuç + ölçüm' (yönetilen hizmet) üzerinden. Holo'nun 3B animasyon reklamı stüdyonun üretebileceği format.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** İki şey: 1) CEO'nun sorusu — ölçülmüş cevap: 213 personanın hiçbirine skill atanmamış (lead'in ölçümü); personalara iş skill'i bağlamak (SEO personasına OpenSEO, paid-media'ya claude-ads, sosyal medyaya içerik/onay akışı) 67 üretim koltuğunun satılabilir iş çıkarmasının ön şartı — bütün ajans tekliflerini birden yükseltir. 2) Pazar uyarısı: Holo 'site yapıştır → reklam/sosyal/e-posta/SEO, sen onayla' işini 20–48 $/ay'a yazılım olarak satıyor; demek ki saf içerik üretimini ucuz yazılımla yarışarak satamayız — bizim fiyatımız 'yapılmış iş + sonuç + ölçüm' (yönetilen hizmet) üzerinden olmalı. Holo'nun reklamı (3B animasyon hikâye reklamı) stüdyonun B28'de üretebileceği formatın örneği.
- **Rakam kanıtı:** Holo fiyatı: Starter 20 $/ay (200 kreatif), Scale 48 $/ay (650 kreatif) — üçüncü taraf (https://thatmarketingbuddy.com/pricing/holo), resmî sayfa bu geçişte okunmadı. Skill sayısı: library_grants'te skill hibesi 0 (lead'in ölçümü, $J/onceki/plan.jsonl). Reklamdaki '205.000 $ ajans', '40 M $ anlaşma' kurgu.
- **İlk para:** B41'in araç bağlama bacağı: her departmana 3–5 iş skill'i listesi → hibe → bir müşteri işinde kullanım günlüğü. Süre ~1–2 hafta dxb-team2; 0 $. Onay: B41 sırası CEO'nun.
- **Engel ve aşma:** 1) Lisansı kopyalamaya izin vermeyen skill'ler (B27) kütüphaneye giremez → MIT/açık lisanslılar (claude-ads, open-seo, arcads şablonları). 2) Ucuz SaaS fiyat baskısı → yönetilen hizmet + sonuç raporu ile farklılaş.
- **Öneri:** Dene
- **İkinci turda:** 2/Araştır
- **Oturum (0-3):** 0
- **Tahta satırı:** B41 (tedarik zinciri — araç yükleme bacağı)
- **Sizin notunuz:** ok şirketin elemanları personalar yazıldı ama onlara özel skiller hazır mı? / burdaki hataya düşmeyelim
- **Link(ler):** https://www.instagram.com/p/Db54Yqiskdn/
- **Neye bakıldı:** video 110 sn: 1) dökümün tamamı; 2) 4 kare. tryholo.ai ana sayfası fetch.py ile okundu. CEO'nun sorusu için personas/ klasörü ve şirket veritabanı (127.0.0.1:54322, salt okunur SELECT) ölçüldü.

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** Gönderi, Holo'nun Pixar tarzı 3B animasyonla çekilmiş 110 saniyelik bir reklamı. Aynı bütçeyle iki marka yarışıyor: biri 205.000 $'lık bir ajansa gidiyor ve elinde yalnız bir sunum dosyası kalıyor; Holo ise siteyi okuyup 30 günlük hedef koyuyor, reklam, sosyal medya ve e-posta üretip her gün sonuçlara göre ayarlıyor. Site (tryholo.ai) bunu doğruluyor: 'Web sitenizi yapıştırın; Holo her gün reklamlarınızı, sosyal medya gönderilerinizi, e-postalarınızı ve SEO içeriğinizi planlar, yazar ve yayınlar; siz yalnız onaylarsınız.' Ücretli bir SaaS.
- **okundu:** evet — döküm tam, site okundu
- **izlendi:** video 110 sn: 1) dökümün tamamı; 2) 4 kare. tryholo.ai ana sayfası fetch.py ile okundu. CEO'nun sorusu için personas/ klasörü ve şirket veritabanı (127.0.0.1:54322, salt okunur SELECT) ölçüldü.
- **zaten_var:** Holo yok. CEO'nun sorusunun ölçümü: şirket veritabanında 213 ajan var. library_items tablosunda kind='skill' olarak yalnız 2 kayıt bulunuyor (graphify, scrapling). library_grants tablosunda ise hiçbir çalışana ya da departmana tek bir skill ataması yok; atamaların tamamı MCP (departmanlara 182, çalışanlara 2). Persona dosyaları beceri listesini canlı veritabanından okuyor ('library_grants kind=skill — kopya tutulmaz'), yani o liste bugün boş.
- **not:** CEO'nun sorusu 'personalar yazıldı ama onlara özel skiller hazır mı?'. Cevap: hayır. 213 personanın hiçbirine skill atanmamış ve kütüphanede yalnız 2 skill var. 'Buradaki hataya düşmeyelim' notunun karşılığı: Holo'nun vaadi tek bir sistem, bizim persona kadromuz ise bugün becerisiz. Bu açık B41'e ya da yeni bir işe bağlanmalı; karar CEO'nundur. Holo'nun ücretli aboneliği para çıkışıdır, onay ister.


## W094 — İki Türkçe YouTube videosu: Mert Durmazer'in 'AgencyOS / Jarvis' yapay zekâ ajansı sistemi ve Doruk Yalçınsoy'un 'skill nedir, nasıl yazılır' eğitimi
- Link: https://youtu.be/68smw4td9ZU ; https://youtu.be/outny_anbdo
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-05
- **Tür:** eğitim
- **Holding (0-3):** 3
- **Teknoloji (0-3):** 3
- **Teknolojiye katkısı:** AgencyOS holdingin küçük ama çalışan bir sürümü; derin inceleme hazır (53 ekran). Bizde olmayan dört parça: 1) aday bulma (tarama → aday tablosu: kaynak, tarih, konum, helal kararı, skor gerekçesi), 2) Hamza'nın yazma araçları — ses ve sohbet yolunda tools: [] (CRM, proje, görev kaydı), 3) niş başına satış kitabı içeriği (kütüphane var, boş), 4) proje ↔ müşteri ↔ servis ↔ tekrarlayan görev bağı. İkinci video (skill anatomisi) bize yeni değil.
- **Gelir (0-3):** 3
- **Gelire katkısı:** Bütün ajans tekliflerinin satış motoru (proje 2): konuşarak şehir/niş bazlı aday bulma, skor, fiyatlı oyun kitabı, teklif kütüphanesi. Ekrandaki fiyatlar katalog (GEO 1.500 $, reklam 2.000 $; kendi panosunda 'anlaşma yok, faturalanan 0'); '40.000 $/ay' iddia. Pazar: yerel SEO ort. 1.557 $/ay, Meta yönetimi harcamanın %10–20'si. İlk iki parça 1–2 hafta dxb-team2, ~0 $; KVKK (yalnız kamuya açık işletme verisi), ilk mesaj ve sözleşme CEO'da; 'garanti' kalıbının şer'î hükmü CEO'nun.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet + OS'in kendisi
- **Nasıl para getirir (okuyucu):** Bütün ajans tekliflerinin (TEKLİF-1 arama paketi, TEKLİF-2 ön büro, reklam ve sosyal medya) satış motoru: konuşarak şehir/niş bazlı aday bulma (Apify → harita → CRM, 1 dakikada 20 işletme), skor, niş başına fiyatlı oyun kitabı, teklif kütüphanesi, müşteri × servis × tekrarlayan görev projesi. Ekrandaki servis kataloğu aylık: GEO 1.500 $, Reklam 2.000 $, AI Agent Fleet 1.500 $, İçerik 800 $; niş oyun kitapları diş 4.000 $, muhasebe 4.000 $, güzellik salonu 1.800 $/ay. Holdingde eksik dört parça (aday tablosu, Hamza'nın yazma araçları, oyun kitabı içeriği, proje–müşteri–servis bağı) kurulunca holding kendi müşterisini kendisi bulur; aynı makine ileride 'OS'in kendisi' yolunda (lisans/kurulum) satılabilir. İkinci video (skill yazma) personalarımıza skill bağlama işine (W093) girer.
- **Rakam kanıtı:** Ekranda (derin inceleme, $J/onceki/agencyos-analysis.md): servis ve niş fiyatları bir katalog — onun fiyat listesi, satılmış iş değil; kendi panosunda 'Ajans getirisi $0 ANLAŞMA YOK', 'faturalanan $0'. 'Bu ay 40.000 $', 'ayda 10.000 $' İDDİA ve para birimi karışık (TL/$). Satış yolu Skool üyeliği: 29 $/ay (skool.com/otomasyon) ile 89–329 $/ay (digitalacademy.com.tr) arası, çelişkili. Pazar: yerel SEO ort. 1.557 $/ay (https://ahrefs.com/blog/seo-pricing/), Meta reklam yönetimi harcamanın %10–20'si (https://www.flighted.co/blog/meta-ads-agency-cost-and-retainer-pricing-explained).
- **İlk para:** Derin inceleme hazır; inşa sırası lead'in planında (W094 sira 1). En kısa yol: 1) prospects tablosu + scrapling ile harita taraması (Apify yeni bağımlılık → STACK.md) + helal eleme; 2) Hamza'ya CRM/proje/görev yazma araçları (dışa giden her şey onay kuyruğundan); 3) ilk niş oyun kitabı (fiyat, itiraz, konuşma metni, kaynak/tarihli). İlk para W116/W072 teklifinin ilk müşterisiyle gelir. Süre: ilk iki parça ~1–2 hafta dxb-team2; maliyet ~0 $. Onay: başlama sözü, yabancıya ilk mesaj, sözleşme ve para CEO'da.
- **Engel ve aşma:** 1) Kişisel veri (KVKK) — taranan işletme verisi → yalnız kamuya açık işletme bilgisi, kaynak/tarih kaydı, silme yolu. 2) Onay kapısız soğuk arama/WhatsApp (onun modeli) → bizde ilk mesaj onaydan. 3) 'Garanti/risk tersine çevirme' teklif kalıbı → şer'î hükmü CEO'da, hükümden önce kullanılmaz. 4) Onun yığını (n8n, BYOK) → alınmaz; bizim yığınla kurulur.
- **İslami sınır:** Teklif kütüphanesindeki 'garanti / risk karşılığı ücret' kalıbının şer'î niteliği CEO'nun hükmüne kalır.
- **Öneri:** Kur
- **İkinci turda:** 3/Araştır
- **Neden değişti:** Lead'in düzeltmesiyle zaten 3/Araştır'dı; öneri 'Kur'a çıktı: müşteri bulma motoru olmadan hiçbir ajans teklifi para getirmez ve derin inceleme inşaya yetecek ayrıntıyı veriyor.
- **Oturum (0-3):** 1
- **Tahta satırı:** Ayrı çalışma (sizin hükmünüz) — B28, B10, B12 ile bağlantılı; tahtaya satır sizin sözünüzle
- **Link(ler):** https://youtu.be/68smw4td9ZU ; https://youtu.be/outny_anbdo
- **Neye bakıldı:** AgencyOS: transkriptin tamamı + konu haritası + her farklı ekrandan bir net kare (53 kare), ürün web'de (giriş sayfası; üye olunmadı). Doruk: Türkçe altyazının tamamı, kare yok (YouTube indirmeyi engelledi).

### What it is — the watch record (newest pass)
- **tur:** eğitim
- **ne_bu:** 1) 68smw4td9ZU (23 dk, 'Starting an AI Agency Has Never Been This Easy', Mert Durmazer | Digital Academy): tek kişilik AI otomasyon ajansı için 'Jarvis' paneli. Sesli/yazılı konuşarak (Telegram'dan da) şehir/niş bazlı lead buluyor (Apify ile tarama, örn. İzmir Karşıyaka ve Beşiktaş diş klinikleri), her lead'e potansiyel skoru veriyor, paket öneriyor (premium: AI otomasyon, randevu takibi, yorum ve reklam yönetimi), CRM'e alıyor, proje ve servisleri açıyor, tekrarlayan görev koyuyor (her pazartesi GEO raporu), niş 'oyun kitapları' (muhasebe, oto galeri, inşaat, spor salonu), teklif kütüphanesi, vaka çalışmaları, 'gelir yolculuğu' yol haritası ve 'yönetim kurulu toplantısı' var; ayarlardan token ile Claude Code'a MCP üzerinden bağlanıp projeyi inceletip çözümü (örn. eski hasta canlandırma: segmentleme, WhatsApp takvim linki, 24 saat hatırlatma) Claude Code'a kurduruyor. 'Bu ay 40.000 $' iddiası; sistem ücretli Skool topluluğunda. 2) outny_anbdo (19 dk, Doruk Yalçınsoy): 200+ skill ve onlarca ajanla çalışan birinin skill eğitimi — prompt = anlık talimat, skill = kayıtlı ayrıntılı talimat dosyası (amaç, ne zaman kullanılır/kullanılmaz, adımlar, kurallar, örnek çıktı, başka dosyalara referans), ajan = kimlik + hangi skill'i ne zaman seçeceği; her sosyal kanal için ayrı ajan (LinkedIn ajanı: algoritma, yorum, içerik skill'leri); hazır skill indirip kendi geçmiş çıktılarına göre özelleştirme; token tasarrufu için skill'leri İngilizce yazma (Türkçe ~%30 fazla token iddiası); 'Hız + kalite / maliyet' denklemi; ücretli mentörlük topluluğu.
- **okundu:** kısmen — iki videonun konuşması tamamen okundu; ekran (kareler) YouTube bot engeli yüzünden görülemedi
- **izlendi:** Adım 1: iki videonun YouTube Türkçe altyazılarının tamamı (ilk geçişin indirip $W/b4/yt/ altında bıraktığı .tr.vtt dosyaları — 597 ve 557 satır — baştan sona okundu). Video dosyası ve kareler alınamadı: yt-dlp ve Playwright tarayıcısı 'Sign in to confirm you're not a bot' (LOGIN_REQUIRED) engeline takıldı; watch.sh iki kez denendi
- **zaten_var:** Ajans koltuğu planı (B28), sesli Jarvis katmanı (apps/jarvis, packages/voice), Social Media ve satış personaları, skill-creator + 10 proje kapısı; Türkçe niş satış oyun kitapları yok.
- **not:** Birinci video satış hunisi (Digital Academy Skool); '40.000 $/ay' ve '10.000 $ teknik bilgisiz' iddiaları doğrulanamaz. Lead tarama + soğuk arama/WhatsApp/Instagram'dan 'yakasına yapışma' KVKK ve ticari ileti (İYS) kurallarına takılabilir; dışa dönük toplu iletişim onay ve hukuk kontrolü ister. Kareler görülemediği için panelin ekran tasarımı değerlendirilemedi; YouTube engeli kalkınca kareler alınmalı. 'Türkçe %30 fazla token' iddiası ölçülmedi.


## W096 — claude-ads (AgriciDaniel/claude-ads) — Claude Code ile 12 reklam platformunda denetim ve yönetim; Shopify + Meta Ads bağlayıcısı (CatGPT reeli)
- Link: https://www.instagram.com/reel/DcKQ9HICtHw/
- His note when he sent it: ii bu

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-10
- **Tür:** repo
- **Holding (0-3):** 3
- **Teknoloji (0-3):** 3
- **Teknolojiye katkısı:** claude-ads (MIT, 9,8k yıldız, 2026-10-07): 12 reklam platformunda kaynak dayanaklı denetim, deterministik puan, sürümlü JSON rapor; varsayılan salt okur, canlı değişiklik onay/idempotency/doğrulama/geri alma kapılı — bizim kapı mantığımızın aynısı. Ücretli medya personalarının (7) bugün olmayan eli; bugün kurulur, test/sahte dışa aktarımla denenir. CEO notu 'ii bu' doğru.
- **Gelir (0-3):** 3
- **Gelire katkısı:** Proje 4'ün yönetim ayağı: 'ücretsiz/ücretli reklam hesabı denetimi' kapı açıcı → aylık yönetim (harcamanın %10–20'si ya da 500–1.500 $/ay temel; satıcı sayfaları); kreatifi stüdyo 0 $'a üretince tek müşteriden iki retainer; holdingin kendi e-ticaret markalarına aynı motor. ~1 hafta, 0 $; müşteri hesabı bağlamak kimlik adımı, holdingin kendi harcaması para çıkışı. Reeldeki ROAS tek hesabın iddiası.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** TEKLİF-3 'Reklam: kreatif üretimi + reklam hesabı yönetimi' (B28 ajans koltuğu + B43 stüdyo)'ün yönetim ayağı. Paket varsayılan olarak salt okur: reklam hesabının kaynak dayanaklı denetimi, deterministik puan, sürümlü JSON rapor — bu, işletmeye satılan 'ücretli reklam hesabı denetimi'nin (kapı açıcı) hazır motoru; sonra aylık yönetim (harcamanın %10–20'si). Kreatifleri stüdyo (B43) 0 $'a üretir; böylece hem kreatif hem yönetim retainer'ı tek müşteriden. Holdingin kendi markalarının (e-ticaret) reklamlarına da aynı motor.
- **Rakam kanıtı:** Depo: MIT, 9.812 yıldız, son itme 2026-10-07; açıklama 'capability-gated account changes' — canlı değişiklik kapılı (gh api, ölçülmüş). Reeldeki '2.000 $ → 15.000 $, sonra 11.000 $ harcama → 80.000 $ satış' (Shopify + Meta panosu ekranda) İDDİA — tek hesabın beyanı. Meta reklam yönetimi ajans ücreti genelde aylık harcamanın %10–20'si veya 1.000–5.000 $+/ay sabit (+1.000–2.500 $ kurulum); temel yönetim 500–1.500 $/ay (satıcı/ajans sayfaları — https://www.flighted.co/blog/meta-ads-agency-cost-and-retainer-pricing-explained, https://adadvisor.ai/blog/meta-ads-management-cost).
- **İlk para:** Elimizde: Claude Code, paid-media personaları (7), stüdyo. Eksik: paketi kurmak (MIT, ücretsiz), bir müşterinin salt okur hesap erişimi veya dışa aktarımı. Adımlar: kur → örnek/test hesabında denetim raporu üret → yerel/e-ticaret işletmelerine 'ücretsiz reklam hesabı denetimi' → ilk yönetim sözleşmesi. Süre ~1 hafta; 0 $. Onay: Meta/Shopify hesabı bağlamak kimlik adımı; holdingin KENDİ reklam harcaması para çıkışı — CEO.
- **Engel ve aşma:** 1) Ajanın reklam hesabına tam yetkisi (reeldeki 'kredi kartımı verdim') → biz salt okur modda başlarız, her değişiklik onay + geri alma kapısından; müşterinin bütçesi müşterinin onayıyla. 2) ROAS iddiaları → kendi denetim/rapor sonuçlarımızla ölçeriz. 3) Reklam içeriği → helal süzgeç ve haram kategoriler reddedilir.
- **İslami sınır:** Haram ürün/kategori (alkol, kumar, faizli finans vb.) reklam müşterisi alınmaz; reklam görselleri stüdyonun kadro yasasına bağlı.
- **Öneri:** Kur
- **İkinci turda:** 3/Dene
- **Neden değişti:** Puan 3'e ve 'Kur'a: salt okur denetim modu sayesinde para çıkışı olmadan bugün kurulup satılabilir bir hizmet motoru; ajans yönetim ücreti piyasada ölçülmüş.
- **Oturum (0-3):** 0
- **Tahta satırı:** B28 (ajans koltuğu — reklam)
- **Sizin notunuz:** ii bu
- **Link(ler):** https://www.instagram.com/reel/DcKQ9HICtHw/
- **Neye bakıldı:** Üç adım: 1) 91 sn döküm tamamı; 2-3) watchall — 91 karenin tümü (8 sayfa); depo GitHub aramasıyla bulundu, açıklama ve README okundu

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** 91 sn'lik reel (CatGPT/Catherine): Claude masaüstü uygulamasında Code → yeni oturumda AgriciDaniel/claude-ads skill paketini kuruyor (ekranda deponun 'Claude-first paid-media operations skill for Claude Code across 12 ad platforms' açıklaması görünüyor), Bağlayıcılar'dan Shopify'ı ve özel bağlayıcı olarak Meta Ads MCP'sini (mcp.facebook.com) ekliyor; '/ads-setup' ile marka profili soruları (ürün, dönüşüm hedefi, aylık bütçe 1-5 bin $, hedef ROAS 2x, veri saklama 90 gün) yanıtlanıyor; Claude organik videolarını Meta kütüphanesinden bulup reklama çeviriyor; Claude in Chrome ile Meta Business Suite ve Shopify panolarını yan yana açıp harcama/satışı gösteriyor. İddia: 2.000 $ → 15.000 $, şimdi 11.364 $ harcama → 80.767 $ satış. Depo gerçek: 12 reklam platformu (Google, Meta, YouTube, LinkedIn, TikTok, Microsoft, Apple, Amazon, Reddit, Pinterest, Snapchat, X), kaynak dayanaklı denetim, deterministik puanlama, sürümlü JSON rapor; varsayılan salt okur, canlı değişiklikler onay/idempotency/doğrulama/denetim/geri alma kapılarından geçmeden kapalı (MIT, 9.8k yıldız, 2026-10-07 güncel).
- **okundu:** evet — döküm, tüm kareler ve README; gelir rakamları doğrulanamaz
- **izlendi:** Üç adım: 1) 91 sn döküm tamamı; 2-3) watchall — 91 karenin tümü (8 sayfa); depo GitHub aramasıyla bulundu, açıklama ve README okundu
- **zaten_var:** Yok — claude-ads kurulu değil; paid-media personaları var (personas/paid-media/), ama bir reklam hesabına bağlı araç yok.
- **not:** Önce salt okur denetim modunda, bir test/sahte dışa aktarımla denenmeli. Reklam harcaması para çıkışıdır → CEO onay kapısı; Meta/Shopify hesabını bağlamak kimlik adımıdır → CEO. Videodaki ROAS rakamları tek kişinin beyanı. Reklam içerikleri İslami sınır süzgecinden geçmeli (kumar/faiz/haram ürün yok). CEO notu 'ii bu' — gerçekten iyi: araç sağlam ve bizim kapı mantığımıza uyuyor.


## W097 — OpenSEO (every-app/open-seo) — Semrush/Ahrefs'in açık kaynak, kullandığın kadar öde karşılığı; MCP ve ajan skill'leriyle
- Link: https://www.instagram.com/reel/DbTMmQezOmC/
- His note when he sent it: openseo github

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-10
- **Tür:** repo
- **Holding (0-3):** 3
- **Teknoloji (0-3):** 3
- **Teknolojiye katkısı:** OpenSEO (MIT, 22,7k yıldız, 2026-10-08): SEO personalarını uydurma hacim yerine gerçek anahtar kelime, sıra, backlink, site denetimi ve AI görünürlük verisine bağlar — MCP + skill, Docker ile kendi sunucumuzda (barındırılan sürüm %28 ekliyor). Bugün SEO personelinin veri eli yok. ~1 gün; DataForSEO hesabı (kimlik) + 50 $ tek seferlik yükleme (para çıkışı) CEO'da; anahtar kasaya.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Proje 3'ün veri ayağı: denetim raporu ve aylık rapor bununla üretilir; Semrush'ın 139,95 $/ay'ı yerine ~10 $/ay kullanım (1.000 SERP ~0,6 $, resmî). Kendi başına para getirmez, teklifi mümkün ve ucuz kılar; holdingin kendi sitelerinde de kullanılır.
- **Gelir katmanı:** Kabiliyet + Maliyet düşürme + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** TEKLİF-1 'Yerel işletme arama paketi' (ajanlı site + yerel SEO/AEO + aylık ölçülü döngü)'nin veri ayağı: SEO personelini uydurma hacim yerine gerçek anahtar kelime, sıra, backlink ve site denetimi verisine bağlar; denetim raporu ve aylık rapor bununla üretilir. Semrush'a (139,95 $/ay ve üstü) ödenecek parayı ~10 $/ay kullanıma indirir. Aynı veri holdingin kendi şirketlerinin (e-ticaret, Outleteuro) sitelerinde de kullanılır.
- **Rakam kanıtı:** Depo: MIT, 22.762 yıldız, son itme 2026-10-08 (gh api, ölçülmüş). Veri DataForSEO'dan: en az 50 $ tek seferlik yükleme, aylık ücret yok, bakiye bitene kadar durur; 1.000 SERP ~0,6 $ (https://dataforseo.com/help-center/minimum-payment, https://dataforseo.com/apis/serp-api/pricing — resmî). Reeldeki '100 arama + 50 kelime haftalık takip ≈ 10 $/ay' ve 'anahtar kelime başına ~5 sent' anlatıcının hesabı (iddia, resmi sayfayla uyumlu büyüklükte).
- **İlk para:** Elimizde: Docker, Claude Code, MCP düzeni. Eksik: DataForSEO hesabı ve 50 $ yükleme (para çıkışı + kimlik adımı → CEO). Adımlar: Docker ile kendi sunucumuza kur → holdingin kendi sitesinde dene → SEO personasının araç kartına MCP olarak bağla → W072/W073 denetimlerinde kullan. Süre ~1 gün; maliyet 50 $ tek sefer. Not: barındırılan sürüm isteklere %28 ekliyor, kendi kurulumu tercih.
- **Engel ve aşma:** 1) API anahtarı sır → kasaya, depoya/prompta girmez. 2) Para çıkışı → 50 $ yükleme CEO onayıyla; bakiye tükenince durur, sürpriz fatura yok. 3) Veri kalitesi Semrush'tan zayıf olabilir → ilk denetimde Search Console (ücretsiz, gerçek) ile karşılaştır.
- **Öneri:** Kur
- **İkinci turda:** 3/Dene
- **Oturum (0-3):** 0
- **Tahta satırı:** B17 (gelir yapıları — SEO hattı), B41 (tedarik zinciri)
- **Sizin notunuz:** openseo github
- **Link(ler):** https://www.instagram.com/reel/DbTMmQezOmC/
- **Neye bakıldı:** üç adım da yapıldı: 1) döküm tamamı (61 sn); 2) anahtar anlar; 3) watchall.sh ile videonun tamamı — 61 kare, 6 sayfanın hepsi okundu; ayrıca depo README ve GitHub metası, repo içi grep

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Reel (61 sn): OpenSEO'nun Product Hunt'ta günün 1 numarası olduğunu, Semrush'ın 139,95 $/ay olduğunu, yapay zekâya SEO sorulduğunda arama hacimlerini uydurduğunu ve OpenSEO'nun MCP bağlayıcısının (app.openseo.so/mcp) ajanı gerçek anahtar kelime verisine bağladığını gösteriyor; Google Search Console bağlantısı ücretsiz; maliyet hesaplayıcısında 100 anahtar kelime araması + 20 backlink kontrolü + haftalık 50 kelime takibi ≈ 10 $/ay (anahtar kelime başına ~0,05 $); kurulum Docker + DataForSEO API anahtarı; barındırılan sürüm 10 $/ay. Ekranda 'Competitor Analysis Agent Skill' (/competitor-analysis) ve SEO denetim aracı da görünüyor. Depo gerçek: MIT, 22,7k yıldız, son itme bugün (2026-10-08), repoda .claude/skills ve .agents klasörleri var; veriyi DataForSEO'dan alıyor, barındırılan sürüm her isteğe %28 ekliyor.
- **okundu:** evet — döküm, tüm kareler, README
- **izlendi:** üç adım da yapıldı: 1) döküm tamamı (61 sn); 2) anahtar anlar; 3) watchall.sh ile videonun tamamı — 61 kare, 6 sayfanın hepsi okundu; ayrıca depo README ve GitHub metası, repo içi grep
- **zaten_var:** Yok — repoda OpenSEO ve DataForSEO geçmiyor; SEO ile ilgili yalnız pagepilot kartı ve gelir notları var
- **not:** DataForSEO hesabı açmak kimlik adımı ve kullanım başına ödeme para çıkışıdır — CEO onayı gerekir; anahtar kasaya, depoya girmez. Kendi sunucumuzda Docker ile koşulursa %28 aracı farkı yok. Kurulum önerisi: önce yerelde Docker, DataForSEO'ya küçük bir bakiye, holdingin kendi sitesiyle sınama; sonra MCP'yi SEO personelinin araç kartına (B41 tedarik zinciri) eklemek. Google Search Console bağlantısı Google hesabı yetkisi ister (kimlik adımı).


## W099 — Chase AI: Claude Code ile 'agentic OS' — alanlar → beceriler → otomasyon, Obsidian belleği, düğmeli gözlem paneli
- Link: https://www.instagram.com/reel/DX8W-VIJVip/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-12
- **Tür:** strateji
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Tek kişilik 'agentic OS' iskeleti (alan → görev → beceri → otomasyon; Obsidian kasası; düğmeli panel) — holding bunun çok büyük hâli. Alınacak tek parça: 'her beceri bir düğme' (B15/B31) ve alan→beceri haritasının W093 açığını kapatma sırası olarak kullanılması.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Videonun tek para ipucu: becerileri müşterinin basacağı düğmelere çevirmek = B17 #8 (ürünleştirilmiş kokpit) ve #9 (şirket ikinci beyni kurulum + bakım) hizmetlerinin şekli; fiyat ya da müşteri kanıtı yok. B17 tablosu CEO'ya sunulduğunda değerlendirilir.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** Videodaki tek para ipucu: becerileri 'Claude Code kullanmayan ekip üyelerinin ve MÜŞTERİLERİN' basacağı düğmelere çevirmek. Bu, B17'deki #8 (ürünleştirilmiş kokpit kurulumu) ve #9 (şirket ikinci beyni kurulum + bakım) hizmetlerinin aynısı: küçük işletmeye 'kendi agentic OS'ini' kurup aylık bakım almak. Holdingin kendisi bunun çok büyük hâli; video yeni bir teknoloji getirmiyor, yalnız satılabilir paketin şeklini doğruluyor. Fiyat ya da müşteri kanıtı yok.
- **Rakam kanıtı:** Videoda rakam yok. Bu tür kurulum hizmetinin piyasa fiyatı bu geçişte aranmadı (puan 1).
- **İlk para:** Para B17 #8/#9 üzerinden gelir: elimizde OS'in kendisi ve dashboard var; eksik olan küçük işletme için sadeleştirilmiş tek kiracılık paket ve ilk müşteri. Bu video o paketi başlatmaz; B17 tablosu CEO'ya sunulduğunda değerlendirilir.
- **Engel ve aşma:** Müşteri verisi kendi kasasında tutulmalı (ayrı veritabanı) → B41'in 'iki duvar' tasarımı. Destek yükü → aylık bakım ücretine bağlanır.
- **Öneri:** İzle
- **İkinci turda:** 1/Gerek yok
- **Neden değişti:** Öneri 'Gerek yok'tan 'İzle'ye: videonun 'müşteriye düğme' fikri B17 #8/#9 satılabilir hizmetlerine doğrudan değiyor; puan aynı çünkü fiyat/müşteri kanıtı yok.
- **Oturum (0-3):** 1
- **Tahta satırı:** B31 (cephanelik sekmesi), B15 (otonomi kadranı), B41
- **Link(ler):** https://www.instagram.com/reel/DX8W-VIJVip/
- **Neye bakıldı:** video 98 sn: 1) dökümün tamamı; 2) 5 kare (alan ağacı, beceri kartları, Obsidian kasası, panel)

### What it is — the watch record (newest pass)
- **tur:** strateji
- **ne_bu:** Üç adımlık bir mimari anlatılıyor. 1) Günlük ve iş görevlerini alanlara ayır (araştırma, içerik, topluluk, müşteri); her alanın görevlerini beceriye, her beceriyi mümkünse bir otomasyona çevir (isteğe bağlı, yerel cron, bulut rutini). Ekranda 'Claude Code the conductor' altında bir alan → beceri ağacı ve bir 'cadence' göstergesi görünüyor. 2) Bellek: RAG yerine Karpathy usulü bir Obsidian kasası (raw/ · wiki/ · output/ + _master-index.md). 3) Gözlem: becerileri bir 'AGENTIC OS' panelinde düğmelere çevir ('Run a skill to begin', Morning Brief, Inbox Triage, Vault Cleanup) ve yanına 5 saatlik/haftalık token pencereleri, kümülatif etkinlik grafiği ve entegrasyonları (GitHub, Higgsfield, n8n-MCP, Gmail, Drive, Calendar) koy.
- **okundu:** evet — döküm tam; repo ya da kod paylaşılmıyor
- **izlendi:** video 98 sn: 1) dökümün tamamı; 2) 5 kare (alan ağacı, beceri kartları, Obsidian kasası, panel)
- **zaten_var:** Evet, büyük ölçüde: departman/persona yapısı, scheduler ve cron işleri, dashboard, claude-mem; Obsidian eklentisi kurulu ama kapalı. Eksik olan, W093'te ölçülen çalışan başına skill atamaları (0).
- **not:** 'Alan → görev → beceri → otomasyon' haritası, W093'te bulunan açığı (213 personaya 0 skill) kapatmanın sırası olarak kullanılabilir. Panelde token penceresi göstermek bizde B59/B60 kapılarıyla zaten var.


## W101 — Hermes Agent — Kanban (çok ajanlı kalıcı görev panosu) belgesi
- Link: https://share.google/NVkfHGei8tWznhOCf
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-12
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Hermes Kanban belgesi (MIT, 252k yıldız): görev = satır, her işçi kendi kimliğiyle ayrı süreç, yineleme bütçesi ve %90'da 'tamamla ya da ilerlemeyi yaz', art arda hatada devre kesici, 'gerekli kontroller geçmeden kart kapanmaz' tamamlama sözleşmesi — makinenin 7/24 iş gücü katmanı (B09–B11, B10) için olgun desenler. Hermes kurulmaz (STACK, kart v0.18.2'ye kilitli); kendi Postgres + zamanlayıcı katmanımızla bir oturumluk karşılaştırma, eksikler B10/B11'e yazılır.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Doğrudan para yok; belgenin 'tek uzman 50 sosyal medya hesabını yönetir, zamanlanmış günlük brifing' deseni sosyal medya yönetimi hizmetinin (proje 6) gece vardiyasını insan bakıcısız döndürmenin mekanizması.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** Makinenin 7/24 çalışan iş gücü katmanı için olgun bir desen: her görev bir satır, her işçi kendi kimliği olan ayrı süreç, yineleme bütçesi ve %90'da 'tamamla ya da ilerlemeyi yaz' uyarısı, art arda hatada devre kesici, ve 'gerekli kontroller geçmeden kart kapanmaz' tamamlama sözleşmesi. Belge açıkça 'filo işi — tek uzman 50 sosyal medya hesabını yönetir' ve 'zamanlanmış günlük brifingler' diyor: bu, sosyal medya yönetimi hizmetinin (müşteri başına aylık ücret) gece vardiyasını insan bakıcısız döndürmenin mekanizması. Bizim Postgres + zamanlayıcı yığınımız var; değer kurulumda değil, eksik parçaları (devre kesici, tamamlama sözleşmesi, %90 uyarısı) kendi görev katmanımıza almakta.
- **Rakam kanıtı:** Depo (gh api, bu geçiş): MIT, 251.999 yıldız, son itme 2026-10-08. Belgedeki özellikler okundu; performans/maliyet rakamı yok.
- **İlk para:** Doğrudan para değil; kabiliyet. Adım: kendi görev/zamanlayıcı katmanımızı bu belgeyle karşılaştır (hangi koruma eksik), eksikleri B10/B11 kapsamında yaz. 1 oturum ölçüm, para çıkışı 0; inşa için CEO'nun sözü.
- **Engel ve aşma:** İkinci ajan çatısı yasağı (STACK.md) → Hermes kurulmaz, yalnız desen alınır. Eski study-card v0.18.2'ye kilitli → kart yenilenmeden sürüm yükseltilmez.
- **Öneri:** Araştır
- **İkinci turda:** 2/İzle
- **Neden değişti:** Puan aynı (2), öneri 'İzle'den 'Araştır'a: belgede doğrudan sosyal medya filo işi ve tamamlama sözleşmesi var; kendi görev katmanımızla karşılaştırması makinenin 7/24 güvenilirliğini artıran somut bir iş.
- **Oturum (0-3):** 1
- **Tahta satırı:** B09, B10, B11
- **Link(ler):** https://share.google/NVkfHGei8tWznhOCf
- **Neye bakıldı:** share.google → GitHub kanban.md yönlendirmesi çözüldü; belgenin ilk ~6.000 karakteri (giriş, tamamlama kontrol noktası, iki yüzey, kullanım alanları, PR tamamlama sözleşmesi) gh api ile okundu; repo meta.

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** NousResearch/hermes-agent deposunun Kanban belgesi: SQLite üzerinde kalıcı bir görev panosu; her işçi kendi kimliği olan ayrı bir işletim sistemi süreci, aktarım bir satır, insan her an yorum yazıp engeli kaldırabiliyor; dispatcher takılan işçiyi geri alıyor, art arda hata olunca görevi otomatik bloke ediyor (devre kesici). Depo MIT, 252 bin yıldız, son push 2026-10-08.
- **okundu:** evet
- **zaten_var:** hermes-agent 2026-07-09'da incelendi: .planning/research/study-cards/hermes-agent.md (v0.18.2'ye kilitli, VPS'te 24/7 yerleşik ajan olarak seçildi, GLM 5.2 beyni, LiteLLM arkasında); STACK.md ve rival-intel/29 ve /35 de anıyor. Hetzner sunucusu 2026-09-19'da onun emriyle silindi; sunucu tarafı şu an yok.
- **not:** Kanban belgesi eski karttan SONRA çıkmış yeni bir özellik; kart v0.18.2'yi kilitlemişti, sürüm yükseltmesi kartın yenilenmesini gerektirir (INTEG-01). Doğrudan kurulum önerilmez; devre kesici ve 'kapatmadan önce doğrula' (kanban_complete) kalıpları B10'un tasarımına fikir olarak alınabilir. Belgede PR tamamlama sözleşmesi de var: GitHub'da gerekli kontroller geçmeden görev kapanmıyor — bizim 'kanıt olmadan bitti denmez' kuralımızın makineleşmiş hâli.


## W103 — Gauntlet Loop — 'inşaatçı + acımasız eleştirmen, adlandırılmış çıtaya karşı kör kıyas, kazanana kadar döngü' becerisi
- Link: https://share.google/GYUycJSNKgOhlGi3s
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-12
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Gauntlet Loop (CC-BY-4.0, tek SKILL.md): işi adı konmuş, açılabilir gerçek bir çıtayla etiketsiz kıyaslatıp 'bizimki kazanana kadar' döndürme — stüdyo ve ajans üretiminin (B28 videoları, müşteri sayfaları) kalitesini ölçülebilir çıtaya bağlar; Ferrari çıtasının makineye taşınması. Sınırsız döngü maliyeti → tur (ör. 3) ve token tavanı; dxb-team2'nin 'ikinci Sol turu yok' kuralı inşaat içindir, dokunulmaz. Bir oturum, 0 $; proje işi için başla sözü.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Doğrudan para yok; 'neden bu fiyat' sorusunun cevabı — satılan işin kazanma ve elde tutma oranını yükseltir (1.500–10.000 $/ay bandının kalite gerekçesi).
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** Makinenin teslimat kalitesini ölçülebilir bir çıtaya bağlayan yöntem: işi, adı konmuş ve açılabilen gerçek bir örnekle (ör. bir markanın başarılı reklam filmi, yarışma ödüllü bir açılış sayfası) etiketsiz kıyaslatıp 'bizimki kazanana kadar' döndürmek. B28 ajans videolarında ve müşteri sitelerinde 'neden bu fiyat' sorusunun cevabı olur (USD 1.500–10.000 aylık hizmet bedelinin kalite gerekçesi), Ferrari çıtasını da makinenin kendi üretimine taşır. Para doğrudan değil; satılan işin kalitesini ve dolayısıyla kazanma/elde tutma oranını yükseltir.
- **Rakam kanıtı:** Depo (gh api, bu geçiş): CC-BY-4.0, 1.049 yıldız, son itme 2026-08-05; tek SKILL.md. Kalite artışı için ölçüm yok (yöntem Matt Shumer'in 'Claude of Duty' istemi).
- **İlk para:** Doğrudan para değil. Deneme: bir B28 örnek reklam videosu için çıta seç (adlandırılmış gerçek bir reklam), sınırlı tur (ör. 3) ve bütçe tavanıyla kör kıyas → sonucu CEO'nun gözüne sun. 1 oturum; para çıkışı 0 (mevcut abonelik); onay: proje işi için başla sözü.
- **Engel ve aşma:** 'Sabit tur yok, kazanana kadar' ilkesi maliyeti sınırsız yapar → tur ve token tavanı konur. Çıta bulanıksa eleştirmen her şeyi onaylar → yalnız açılabilir, adlandırılmış çıta. dxb-team2'nin 'ikinci Sol turu yok' kuralı inşaat içindir; bu yöntem çalışma zamanı üretimine (stüdyo, ajans) uygulanır.
- **Öneri:** Dene
- **İkinci turda:** 1/Dene
- **Neden değişti:** Puan 1'den 2'ye: yöntem yalnız inşaatın değil makinenin teslimat kalitesinin (B28 videoları, müşteri sayfaları) ölçülebilir bir çıtaya bağlanması — satılan işin kalitesini doğrudan yükselten bir kabiliyet.
- **Oturum (0-3):** 2
- **Tahta satırı:** B32
- **Link(ler):** https://share.google/GYUycJSNKgOhlGi3s
- **Neye bakıldı:** share.google → github.com/robonuggets/gauntlet-loop çözüldü; README tamamı ve repo meta (gh api).

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** robonuggets/gauntlet-loop: tek SKILL.md; hedefi verirsin, 2-3 'çıta' önerir (adlandırılmış, getirilebilir, kıyaslanabilir bir gerçek örnek), seçince 150 kelimelik bir istem üretir. O istemi çalıştıran ajan işi küçük parçalara böler, her parçaya bir inşaatçı + etiketsiz kör kıyas yapan bir eleştirmen koşar; eleştirmen puan değil 'hangisi daha iyi' seçimi yapar; çıta aşılana ya da sen durdurana kadar döner. Teknik Matt Shumer'in (Claude of Duty), depo onu paketliyor. CC-BY-4.0, 1044 yıldız, son push 2026-08-05.
- **okundu:** evet
- **zaten_var:** Kısmen: dxb-team2 tek kör, salt-okunur GPT-6.1 Sol geçişi yapıyor (döngü yok, 'ikinci Sol turu yok' kuralı); dxb-surface göz testi var. Çıtaya karşı kör kıyas ve 'kazanana kadar döngü' yok. Repo'da daha önce okunduğuna dair kayıt bulunamadı.
- **not:** Sınırsız döngü maliyet riski: dxb-team2'nin 'ikinci tur yok' kuralı ve B51 maliyet mimarisiyle çelişir; kullanılacaksa sınırlı tur + bütçe tavanıyla ve yalnız tasarım/yüzey işinde. Kurmadan önce CEO onayı gerekir ('proje işi başlamadan sor').


## W104 — Ultimate Editors (Joseph) — Claude skill'leri + Higgsfield ile konuşan-kafa videosunu 5 aşamada animasyonlu 'premium' YouTube videosuna çevirme (editor brain → tasarım → animasyon → montaj)
- Link: https://youtu.be/UdfEm_mkx8g
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-13
- **Tür:** strateji
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Stüdyonun konuşan-kafa/belgesel kurgusu için üç skill'i kendimiz yazarız: 'editor brain' (senaryodan dakikada 2–6 animasyon planı: istatistik → grafik, kritik cümle → metin sahnesi, kavram → arayüz sahnesi), 'designer' (marka referans klasöründen istem + referans görsel), 'animator' (sahne türüne göre hareket kuralları); montaj Premiere yerine OpenMontage zaman tablosu; üretim Higgsfield/Seedance yerine yerel görsel eli + H3/Wan2GP. 2–3 gün, 0 $; kurs alınmaz. Kadın betimleme kuralı planlama skill'ine yazılır.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Hizmet: 10 dakikalık animasyonlu YouTube kurgusu için müşteri 250–1.000 $+ öder (pazar; yaratıcı '400 $' diyor), yöntem ~4–6 saatte teslim gösteriyor — B28'e 'YouTube kanal kurgusu' paketi. Kendi kanallarımızda (W112 belgeseller) izleyici tutma → izlenme süresi → reklam geliri. Video başı maliyet 95 $ (yaratıcının kredi tablosu, iddia) yerine ~0.
- **Gelir katmanı:** Ajans/hizmet geliri + İçerik geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** İki para yolu. (1) Hizmet: bir müşteri 10 dakikalık animasyonlu YouTube videosunun kurgusu için 250-1.000 $+ öder; yöntem bunu ~4-6 saatte teslim etmeyi gösteriyor — B28 ajans koltuğuna 'YouTube kanal kurgusu' paketi. (2) Kendi kanallarımız: KANAL HATTI'nın belgesel kollarında (W112) dakikada 2-6 animasyon planlamak izleyici tutmayı, dolayısıyla izlenme süresini ve reklam gelirini artırır. Yöntem bizde Higgsfield yerine yerel GPU ile (görsel eli + H3/Wan2GP) çalışırsa video başı maliyet 95 $'dan ~0'a iner.
- **Rakam kanıtı:** Yaratıcının beyanı (İDDİA, ekranda kredi tablosu): 41 tasarım × 4 kredi + 41 animasyon × ~45 kredi ≈ 2.000 kredi ≈ 95 $; 4 saat + 2 saat kalite kontrol; 'müşteri 400 $ öder'. Pazar: 10 dk'ya kadar motion grafikli YouTube kurgusu 250 $'dan başlıyor (https://contra.com/s/Fc7UUU2m-professional-video-editing-or-you-tube), 10-30 dk videolar 200-1.000 $+ (https://www.tubeanalytics.net/blog/how-much-does-a-youtube-video-editor-cost-reddit-7). Videonun ortası 97 $'lık kurs ve eklenti reklamı.
- **İlk para:** Elimizde: Claude, skill-creator, görsel eli, OpenMontage/HyperFrames, MiniMax H3. Eksik: 'editor brain' (senaryodan animasyon planı), 'designer' (marka referans klasöründen istem + referans) ve 'animator' (sahne türüne göre hareket kuralları) skill'lerini kendimiz yazmak; montaj Premiere yerine OpenMontage zaman tablosuyla. Adımlar: W112 hattının ilk bölümünde dene; sonra ajans paketine koy. Süre 2-3 gün; 0 $; onay: müşteriye satışta sözleşme (CEO).
- **Engel ve aşma:** (1) Skill'ler kursun arkasında → yöntem açık, kendimiz yazarız; kurs alınmaz. (2) Higgsfield/Seedance ücretli → yerel motorlar. (3) Yerel animasyon kalitesi Seedance 2.5'e yetişmeyebilir → ölçüm; gerekirse yalnız müşteri işinde ücretli üretim (para çıkışı, CEO). (4) Premiere yok (Linux) → OpenMontage/ffmpeg.
- **İslami sınır:** İllüstrasyon sahnelerinde insan figürleri — stüdyonun kadın betimleme kuralı planlama skill'ine kural olarak yazılmalı; arka plan müziği çalgısız seçilmeli.
- **Öneri:** Dene
- **İkinci turda:** 2/Araştır
- **Neden değişti:** Önceki 2/Araştır; yöntem ekranda adım adım açık ve bizdeki aletlerle hemen denenebilir; pazar fiyatı ölçülünce satılabilir bir hizmet olduğu da belli — 'Dene'.
- **Oturum (0-3):** 0
- **Tahta satırı:** B43
- **Link(ler):** https://youtu.be/UdfEm_mkx8g
- **Neye bakıldı:** adım 1: YouTube dökümü (yerel Speaches) baştan sona; adım 2: 7 kare (eklenti logosu, Claude planlama ekranı, tasarım çıktıları, Premiere zaman çizelgesi, kredi tablosu); adım 3 yapılmadı (puan 3 değil)

### What it is — the watch record (newest pass)
- **tur:** strateji
- **ne_bu:** YouTube videosu (15 dk 47 sn). Gösterilen akış: 1) Gling ile sessizlik ve hatalı çekimleri senaryoya göre kesmek; 2) Claude'a geçmiş videoların planlarını ve kurs PDF'lerini verip 'editor brain' skill'i yaptırmak — senaryoyu okuyup girişte dakikada 4-6, gövdede 2-3 animasyon planlıyor (istatistik → grafik, kritik cümle → metin sahnesi, örnek → illüstrasyon, kavram → arayüz sahnesi); 3) Pinterest'ten toplanan 100+ marka uyumlu referans görselden 'blue designer' skill'i — Claude her sahne için ayrıntılı istem yazıp en uygun referans görseli ekleyerek Higgsfield'e (GPT Image 2) 41 tasarım ürettiriyor; 4) 'animator brain' skill'i sahne türüne göre kamera/metin animasyon kurallarıyla 41 tasarımı Seedance 2.5 ile canlandırıyor; 5) Premiere'de Claude'un zaman tablosuyla montaj, zoom geçişleri, ses efekti ve müzik. Beyan edilen maliyet ~2.000 kredi ≈ 95 $, süre ~4 saat (+2 saat kalite kontrol). Videonun ortası kendi kursunun (97 $) ve 'Ultimate Editor' eklentisinin reklamı; skill'ler kursun arkasında.
- **okundu:** evet — döküm tamamı ve anahtar kareler
- **izlendi:** adım 1: YouTube dökümü (yerel Speaches) baştan sona; adım 2: 7 kare (eklenti logosu, Claude planlama ekranı, tasarım çıktıları, Premiere zaman çizelgesi, kredi tablosu); adım 3 yapılmadı (puan 3 değil)
- **zaten_var:** Stüdyo: OpenMontage (klonlu), HyperFrames seçili, FLUX ADOPT, Seedance/Higgsfield kartları STUDY; 'editor brain' benzeri planlama skill'i yok
- **not:** Videonun yarısı ücretli kurs ve ortaklık reklamı; 'premium' sonuç ve maliyet beyanı doğrulanmadı. Higgsfield ve Seedance kredi tabanlı ücretli hizmet (para çıkışı, CEO kapısı). İllüstrasyon sahnelerinde insan figürleri var — stüdyonun kadın betimleme kuralı plan skill'ine kural olarak yazılmalı. Yöntem bizde kendi skill'imizle yeniden yazılır, kurs satın alınmaz.


## W106 — Üç gelir örneği: Holo reklam üretimi (marka sitesinden toplu reklam) · yüksek komisyonlu affiliate Instagram · Viblo.ai ile MrBeast videosundan Shorts klibi
- Link: https://www.instagram.com/reel/Dazpl3_s-Hl/ ; https://www.instagram.com/reel/DaEzZ1Tv-2C/ ; https://www.instagram.com/reel/DdP5sFmuvMe/
- His note when he sent it: revenue idea / revenue example check

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-15
- **Tür:** gelir fikri
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 0
- **Teknolojiye katkısı:** Teknoloji yok: kurgu/altyazı bandı (W012, OpenMontage) zaten bizde; Holo W093'te incelendi.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Üç para örneği: (a) klip — ekrandan ölçülen 13,9 M izlenme → 2.300 $ = 0,17 $/bin (Shorts); lisanslı klip kampanyaları B28 ölçümüyle 1,05 $/bin (~6 kat) ama o pazarda 12 bin katılımcı ortalama 10 $ kazanmış, hacim ve hız işi; bir pazarda klipçi olmak 'DXB klip pazarı işletmez' kuralınızın dışında mı — kararınız. (b) Affiliate: kendi kanallarımıza helal ürün bağlantısı (W069 yorum→DM hunisiyle); '500–1.000 $ komisyon' iddia. (c) Holo: ajans paketinin fiyat tavanını baskılar; farkımız tam hizmet + stüdyo. MrBeast görüntüsü yalnız resmî/lisanslı programla.
- **Gelir katmanı:** İçerik geliri + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** (a) Klip: ekran ölçümü 13,9 M izlenme → 2.300,87 $ — Shorts payı gerçek ama başkasının videosuyla; bizim için lisanslı yol daha iyi para ediyor: yaratıcıların/markaların ücretli klip kampanyaları B28 satırında bin izlenmeye ortalama 1,05 $ ödüyor (Shorts RPM'inin ~6 katı). (b) Affiliate: kendi kanallarımıza (KANAL HATTI) helal ürün bağlantısı koyup satış başına komisyon almak — içerik gelirinin meşru bir kapısı; W069 yorum→DM hunisiyle birleşir. (c) Holo: B28 ajans koltuğuna rakip/ölçüt — 'kahve parasına bir aylık reklam' iddiası, müşteriye satacağımız aylık paketin fiyat tavanını baskılar; bizim farkımız tam hizmet + kendi stüdyo.
- **Rakam kanıtı:** Ölçülmüş (ekran karesi, frames/W106-DdP5sFmuvMe t46): 13,9 M izlenme, +3,6 K abone, tahmini gelir 2.300,87 $ → 0,17 $/bin; Shorts RPM bandıyla tutarlı (https://air.io/en/monetization/what-rpm-can-you-expect-from-shorts-in-2026). Klip kampanyası 1,05 $/bin: B28 satırının ölçümü (gelir-baglam.md). Affiliate '500-1.000 $ komisyon, ayda 5-10 satış' — İDDİA, kurs hunisi; Holo 'iki dakikada bir aylık reklam' — İDDİA.
- **İlk para:** Klip: elimizde kurgu/altyazı bandı (W012, OpenMontage). Eksik: lisanslı kaynak — yaratıcının resmi klip programına katılım (hesap = kimlik adımı) ya da CC lisanslı görüntü. Affiliate: kanal açılınca helal ürün ağı (ör. dijital araçlar, kitap) — hesap adımı. Süre 1-2 hafta; maliyet 0 $; onay: hesap açma, CEO'nun B28 'klip pazarı işletmeyiz' kuralı karşısında klipçi olarak katılımın onayı.
- **Engel ve aşma:** (1) MrBeast videosu onun telifi → yalnız resmi/lisanslı klip programıyla. (2) B28'de CEO 'DXB klip pazarı işletmez' dedi; burada pazar işletmek değil, bir pazarda üretici olmak söz konusu — CEO'ya sorulur. (3) Affiliate ürünü haram/faizli olabilir → ürün süzgeci. (4) Holo'nun fiyat baskısı → hizmet paketini sonuç (satış/lead) üzerinden fiyatlamak.
- **YouTube izni (A/B):** (Klip kolu) A: MrBeast görüntüsü onun — A'da kapalı; lisanslı klip programı veya CC görüntüyle açık. / B: YouTube'un 'reused' kuralı açılır, ama telif hak sahibinde kalır; Content ID ve ihtarı o verir — yine lisans gerekir.
- **İslami sınır:** Affiliate ürününde kumar, faiz, alkol vb. dışlanmalı; başkasının videosunu izinsiz klipleyip yayımlamak kul hakkıdır.
- **Öneri:** Araştır
- **İkinci turda:** 1/Gerek yok
- **Neden değişti:** Önceki 1/Gerek yok; klip ekranından ölçülen RPM ve B28'in 1,05 $/bin ölçümü lisanslı klip yolunun gerçek bir para yolu olduğunu, affiliate'in de kanal hattına bağlanan helal bir kapı olduğunu gösteriyor.
- **Lider notu:** Klip yolunun bin izlenmeye ödemesi Shorts reklamından ~6 kat yüksek (B28 ölçümü 1,05 $); ama aynı ölçümde o pazardaki 12 bin katılımcı ortalama 10 $ kazanmış, izlenmelerin %15,5'ini ilk üç kişi almış — hacim ve hız işi. Bir pazarda üretici (klipçi) olmak, sizin 'DXB klip pazarı işletmez' kuralınızın dışında mı — karar sizin.
- **Oturum (0-3):** 0
- **Tahta satırı:** B17 (gelir yapıları raporu), B28 (reklam/ajans koltuğu)
- **Sizin notunuz:** revenue idea / revenue example check
- **Link(ler):** https://www.instagram.com/reel/Dazpl3_s-Hl/ ; https://www.instagram.com/reel/DaEzZ1Tv-2C/ ; https://www.instagram.com/reel/DdP5sFmuvMe/
- **Neye bakıldı:** Üç video: 1) üçünün de dökümü tamamı; 2) her biri için 4 kare (Holo marka analizi, Viblo arayüzü ve analitik ekranı; affiliate videosunda yalnız konuşan kişi)

### What it is — the watch record (newest pass)
- **tur:** gelir fikri
- **ne_bu:** (1) Dazpl3_s-Hl, 43 sn: Holo'ya site adresi yapıştırılıyor; araç markanın misyonunu, renklerini, logosunu ve rakiplerini çıkarıyor, ardından statik görsel, video ve e-posta reklamlarını topluca üretiyor ('bir aylık reklam iki dakikada'). Aynı ürün W093'te de var. (2) DaEzZ1Tv-2C, 99 sn: yeni bir Instagram hesabı aç, niş seç, affiliate pazarından satış başına 500-1.000 $ komisyon veren bir ürün seç, 5-7 saniyelik yüzsüz reeller çek; ayda 5-10 satışla 5-10 bin $. Kurs/eğitim satışına yönlendiriyor. (3) DdP5sFmuvMe, 56 sn: MrBeast'in viral bir videosunun bağlantısı viblo.ai'nin 'Auto Clipping' aracına veriliyor, araç viral anları kesiyor, altyazı ve bulanık kenar formatı ekleniyor, YouTube Short olarak yayımlanıyor. Ekranda 8 günde 13,9M görüntülenme, +3,6K abone ve 2.300 $ tahmini gelir görünüyor.
- **okundu:** evet — üç döküm tam, kareler okundu
- **izlendi:** Üç video: 1) üçünün de dökümü tamamı; 2) her biri için 4 kare (Holo marka analizi, Viblo arayüzü ve analitik ekranı; affiliate videosunda yalnız konuşan kişi)
- **zaten_var:** Holo W093'te incelendi. Gelir yapıları raporu B17'de bekliyor (16 yapı, 2026-07-09'dan beri güncellenmedi). Viblo yok.
- **not:** CEO'nun notları 'revenue idea / revenue example c'. Cevap: üçü de B17 tablosuna satır olarak girebilir, ama: (a) MrBeast klibi başkasının telif hakkıyla korunan içeriği; YouTube'un 'yeniden kullanılan içerik' kuralı ve telif riski var, ve 2.300 $'lık rakam doğrulanmamış bir ekran görüntüsü. (b) Affiliate modelinde komisyonlu ürünün helal olması şart: kumar, faiz ve haram nişler dışlanır. Video ayrıca kurs satışına bağlanan klasik bir huni. (c) Holo ücretli bir SaaS; bizim için ancak rakip ve fiyat ölçütü olarak anlamlı.


## W107 — Chase AI: GPT-6 Astra + Higgsfield After Effects eklentisiyle hareketli grafik (motion design) — storyboard → beat beat istem → revizyon
- Link: https://share.google/L4R5rv9xGqwzguCXy
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-16
- **Tür:** araç
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Yöntem alınır, araç değil: önce storyboard, sonra beat beat istem, sonra istemle revizyon — düzenlenebilir hareketli grafik. After Effects Linux'ta yok, stüdyomuz Linux; aynı işi HyperFrames/Remotion ile kurarız (W111 /brag hazır örnek). Higgsfield+Adobe aboneliği para çıkışı; istem deposunun lisansı yok (fikir olarak okunur, kopyalanmaz).
- **Gelir (0-3):** 1
- **Gelire katkısı:** Hareketli grafik (logo animasyonu, ürün duyurusu) markaların ödediği iş: 1–2 dk özel grafik 150–600 $ (pazar). Yöntem AE'ye bağlı olduğundan bizim yolumuz W111 ile ölçülür.
- **Gelir katmanı:** Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** Hareketli grafik (logo animasyonu, ürün duyurusu, açılış jeneriği) markaların para ödediği bir iştir — 1-2 dk'lık özel grafikli iş 150-600 $. Ama yöntem Adobe After Effects'e bağlı ve AE Linux'ta çalışmıyor; stüdyomuz Linux. Bizim için alınacak kısım yöntem: önce storyboard, sonra beat beat istem, sonra istemle revizyon — bunu HyperFrames/Remotion (koddan video) ile kurarız; W111 /brag bunun hazır örneği.
- **Rakam kanıtı:** Ekranda: 15 sn'lik iş 22 dk 56 sn sürmüş (önceki geçişte karede okundu). Pazar: 1-2 dk özel grafikli video 150-600 $ (https://dribbble.com/services/119854-Video-Editing-and-Motion-Graphics). İstem deposu cth9191/after-effects-motion-prompts (28★, lisans yok — önceki geçiş). Anlatıcı eklentiyi 'açık kaynak, kredisiz' diyor; Higgsfield sayfaları abonelik istiyor — çelişki çözülmedi.
- **İlk para:** AE yolunda: Windows/Mac makine + Adobe aboneliği (para çıkışı, CEO). Bizim yolumuz: HyperFrames + istem şablonları — W111 ile birlikte denenir. Süre 1 gün; 0 $.
- **Engel ve aşma:** Linux'ta AE yok → HyperFrames/Remotion. İstem deposunun lisansı yok → yalnız fikir olarak okunur, kopyalanmaz. Uzun render (15 sn'ye 23 dk) → gece kuyruğu.
- **İslami sınır:** Demolardaki müzik ve efekt seçiminde çalgı dikkati.
- **Öneri:** İzle
- **İkinci turda:** 1/İzle
- **Oturum (0-3):** 0
- **Tahta satırı:** B43 (Media Studio), B28 (ajans), B33 (tezgâh)
- **Link(ler):** https://share.google/L4R5rv9xGqwzguCXy
- **Neye bakıldı:** Üç adımın üçü: (1) video 516 sn — altyazı yoktu, mweb istemcisiyle indirildi, dökümün tamamı (Speaches) okundu; (2) 4 anahtar kare; (3) watchall.sh ile tüm video — 516 kare, 43 sayfanın hepsi okundu. Ek: istem deposu cth9191/after-effects-motion-prompts gh ile bulundu; Higgsfield resmi sayfaları web aramasıyla; depoda Higgsfield/Remotion kanıt dosyaları grep'lendi

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** share.google bağlantısı YouTube videosuna çıkıyor (C8dWdic-oK4, 516 sn, Chase AI, 'GPT-6 Astra Just Unlocked Motion Design + After Effects'). Anlatıcı After Effects'i hiç bilmeden Codex/Astra'ya Higgsfield'in After Effects köprüsü ('@higgsfield /use-after-effects'; Higgsfield sayfasında 'Higgsfield MCP: with GPT-6 Astra — Add Higgsfield Plugin, type the command, try first workflow') üzerinden üç demo yaptırıyor: 10 sn 'Chase AI Workflow' (Think it → See it → Build the pieces → Make it move → Dial it in → CHASE AI), 15 sn 'KITE Pocket World' (kil görünümlü uçurtma karakterli kanban duyurusu, müzik + efekt) ve 12 sn 'Whiteboard Loop' (yapışkan notlu beyaz tahta). Ekranda Codex'in ilerleme günlüğü görünüyor: görsel üretim, After Effects'te katmanlı kurulum, kareleri kontrol, render; çıktı düzenlenebilir katmanlı .aep + .mp4; bir 15 sn'lik iş 22 dk 56 sn sürmüş. Yöntem üç adım: storyboard (referans video da verilebilir) → beat beat ayrıntılı istem → istemle revizyon. İstemler ve şablonlar cth9191/after-effects-motion-prompts deposunda (storyboard/build/reference-video/revision şablonları; 28★, lisans belirtilmemiş); depo README'si 'bu köprüyle yerel AE düzenleme ve render Higgsfield bulut kredisi harcamaz' diyor. Remotion ve Hyperframes'i alternatif olarak anıyor.
- **okundu:** evet — döküm tamamı + kareler + resmi sayfa özetleri
- **izlendi:** Üç adımın üçü: (1) video 516 sn — altyazı yoktu, mweb istemcisiyle indirildi, dökümün tamamı (Speaches) okundu; (2) 4 anahtar kare; (3) watchall.sh ile tüm video — 516 kare, 43 sayfanın hepsi okundu. Ek: istem deposu cth9191/after-effects-motion-prompts gh ile bulundu; Higgsfield resmi sayfaları web aramasıyla; depoda Higgsfield/Remotion kanıt dosyaları grep'lendi
- **zaten_var:** Higgsfield dış eller olarak ölçülmüş (EVIDENCE-official-higgsfield.md, EVIDENCE-external-hands-2026-09-14.md); Remotion B43 montaj hattında anılıyor; After Effects ve hareketli grafik ajanı yok.
- **not:** Çelişki kısmen çözüldü: anlatıcı ve istem deposu 'yerel köprü Higgsfield kredisi harcamaz' diyor; Higgsfield'in kendi sayfaları ise Higgsfield + GPT + Adobe After Effects aboneliği gerektiğini söylüyor — kredi harcanmasa bile abonelikler gerekiyor ve açık kaynak eklenti kodu bulunamadı (higgsfield-ai/skills içinde After Effects yok). Ekranda Windows yolları (C:\Users\…) görünüyor: Windows/Mac makine + Adobe aboneliği = para çıkışı, CEO kapısı. Anlatıcının sonu kendi ücretli kursunun reklamı.


## W108 — YouTube AdSense gerçekte ne öder — 12 M izlenme 10.806 $, 6 M izlenme 12.500 $; RPM, izlenme süresi, %55/%45 ve 1.000 abone + 4.000 saat (Candi Grzegorczyk, 'Behind the Income' 1. bölüm)
- Link: https://www.instagram.com/reel/DbYWpLMxFmk/
- His note when he sent it: revenue

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-16
- **Tür:** gelir fikri
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 0
- **Teknolojiye katkısı:** Teknoloji yok; bilgi. Kanal hattının bütçe/hedef modeline giren ölçülmüş sayılar.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Kanal hattının 'AdSense gerçeği' (yaratıcının YouTube Studio karesi): 12,2 M izlenme / 545 bin saat → 10.806 $; 6 M izlenmeli video 12.500 $ — para izlenme SÜRESİYLE gelir (W068 uzun-form kararını ölçümle destekler); pay %55; eşik 1.000 abone + 4.000 saat (resmî); ömür boyu RPM 2,90 $ (aile/eğlence nişi — iş/eğitim nişleri daha yüksek); 508 M izlenme → ~1,5 M $; asıl para marka anlaşmalarından — sponsorluk kapısı. Haram reklam kategorileri AdSense'te engellenir. 1 saat, 0 $.
- **Gelir katmanı:** İçerik geliri
- **Nasıl para getirir (okuyucu):** KANAL HATTI'nın 'AdSense gerçeği' — hattın bütçe ve hedef modeli bu sayılarla kurulur: reklam gelirinin %55'i yaratıcıya; para eşiği 1.000 abone + 4.000 saat; gelir izlenmeden çok izlenme süresiyle gelir. Bu, W068'deki uzun-form uyku/belgesel kararını doğrudan destekler (yarı izlenmeli video daha çok kazandırmış). Kanalın ömür boyu sonucu (508 M izlenme, ~1,5 M $) uzun soluklu kanalın gerçek ölçeğini gösterir; ayrıca asıl paranın marka anlaşmalarından geldiğini söylüyor — sponsorluk gelir kapısı.
- **Rakam kanıtı:** Ölçülmüş (yaratıcının YouTube Studio karesi): 12,2 M izlenme / 545,3 bin saat / 10.806 $; ömür boyu RPM 2,90 $, o videoda 2,10 $; 508 M izlenme, 3.200 video, ~1,5 M $. Pay %55/%45 ve eşikler resmî kaynakla uyumlu: 1.000 abone + 4.000 saat ya da 1.000 abone + 90 günde 10 M Shorts izlenmesi (https://support.google.com/youtube/answer/72851). Not: aile/eğlence nişinin RPM'i (2-3 $) düşük; iş/eğitim nişleri daha yüksek.
- **İlk para:** Elimizde: sayılar. Adım: W068/W112 hattının gelir modeline bu sayılar girer (hedef: 4.000 saat; uzun izlenme; marka sponsorluğu satış dosyası). Süre 1 saat; maliyet 0 $; onay gerekmez.
- **Engel ve aşma:** (1) Tek viral videoya güvenmek yanlış (videonun kendi dersi) → düzenli yükleme takvimi. (2) 100+ video eşiğe kadar gelir yok → uzun-form ile izlenme saatini hızlı biriktir, Shorts ile abone topla.
- **YouTube izni (A/B):** A: Bilgi; kendi kanallarımıza uygulanır — açık. / B: Ek bir şey açmaz.
- **İslami sınır:** AdSense'te reklamların içeriği kanal sahibinin denetiminde değildir; haram kategoriler (kumar, alkol, faizli finans, flört) reklam ayarlarından engellenmeli.
- **Öneri:** Kur
- **İkinci turda:** 1/Gerek yok
- **Neden değişti:** Önceki 1/Gerek yok; bu sayılar kanal hattının bütçe ve hedef modelinin temeli ve uzun-form kararını ölçümle destekliyor — hattın yapı taşı olarak 'Kur' (maliyetsiz).
- **Oturum (0-3):** 0
- **Tahta satırı:** B17 (gelir yapıları)
- **Sizin notunuz:** revenue
- **Link(ler):** https://www.instagram.com/reel/DbYWpLMxFmk/
- **Neye bakıldı:** 1) 162 sn döküm tamamı; 2) 6 kare (YouTube Studio gelir/izlenme kartı dahil); 3. adım gerekmedi (konuşan kafa, puan 3 değil)

### What it is — the watch record (newest pass)
- **tur:** gelir fikri
- **ne_bu:** 162 sn'lik reel: 12,2 milyon izlenmeli videosu 10.806 $ (YouTube Studio karesinde 545,3 bin saat izlenme) kazandırmış; 6 milyon izlenmeli başka video ise 12.500 $ — yani izlenme süresi izlenmeden önemli. Rakamlar: gelir paylaşımı yaratıcı %55 / YouTube %45; para kazanmaya başlamak için 1.000 abone + 4.000 saat izlenme ikisi birden (kendisi 100+ video sonra ulaşmış); RPM (1.000 izlenme başına net) kendi kanalında ömür boyu 2,90 $, o videoda 2,10 $; kanal toplamı 508 milyon izlenme, 3.200 video, ~1,5 milyon $ yalnız AdSense. Sonuç: tek viral video 5-15 bin $ eder, asıl gelir uzun soluklu kanaldan ve marka anlaşmalarından gelir.
- **okundu:** evet — döküm ve kareler okundu
- **izlendi:** 1) 162 sn döküm tamamı; 2) 6 kare (YouTube Studio gelir/izlenme kartı dahil); 3. adım gerekmedi (konuşan kafa, puan 3 değil)
- **zaten_var:** Gelir yapıları raporu B17'de bekliyor (son güncelleme 2026-07-09).
- **not:** CEO notu 'revenue' — cevap: YouTube'da AdSense geliri 1 milyon izlenmede ~2-3 bin $; para kazanma eşiği 1.000 abone + 4.000 saat. Kanalın kendi içeriği ('Charlie Charlie' gibi) holdingle ilgisiz; RPM nişe göre çok değişir. İslami sınır: AdSense'te reklamların içeriği kanal sahibinin kontrolünde değil — haram reklam kategorileri engellenmeli.
