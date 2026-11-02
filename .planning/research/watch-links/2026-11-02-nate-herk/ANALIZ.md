# ANALİZ — "4 Claude Systems That Sell For $3000+ Right Now (With PROOF)"

| Alan | Değer |
|---|---|
| Video | Nate Herk, 2026-10-27 — <https://www.youtube.com/watch?v=BQJRLZ2q_Ns> |
| Okunan | `WATCH.md` (izleyici kaydı), `transcripts/BQJRLZ2q_Ns-BQJRLZ2q_Ns.txt` (369 satır, baştan sona), kareler S6, S7, S10, S15–S18, `full541.png`; `context.md`; `.planning/research/REVENUE-OPPORTUNITIES.md` §D; tahta B83, B64, B05, B34, B12, C41, B04 ve Bölüm 2d'nin V2 hafıza satırı; `.planning/board-rows/B83.md` ve ilgili satır dosyalarının "Revenue lines" bölümleri |
| Ölçülen (2026-11-02) | Şirket motoru yalnız SELECT, okuma kapısıyla (`agents`: 213 `dormant`, yani motor doğru); yerel servisler `docker ps`, `systemctl --user`, `ollama list`, Speaches `/v1/models`; depo grep; 3 web araması (kaynak ilgili cümlenin yanında) |
| Bağlayan kural | Hiçbir şey şimdi kurulmaz, satılmaz (B83, CEO 2026-11-01). Aşağıdaki "ilk tezgâh denemesi" her hattın sırası gelince inşaat motorunda koşulur, şirkette değil. Videodaki fiyatlar çapadır, hedef değildir. |

## 1. Hüküm

Evet, holdingin gelir üretim sistemlerinden biri olur — ama yeni bir hat olarak değil, mevcut üç hatta dört yöntem olarak. Video dört paket yapay zekâ otomasyon hizmetinin satış kataloğudur: hiçbir sistemin yapımı, aracı ya da istemi gösterilmiyor; beş satışın hiçbirinde ödeme, sözleşme ya da müşteri adı yok; tek gerçek ekran kanıtı, kime ve hangi işe ait olduğu yazmayan bir Stripe paneli (NZ$234k brüt, 1 Haziran–4 Eylül 2026); videonun kendi geliri izleyiciyi ücretli topluluğa (AIS+, ayda 129 $) taşımaktır. Buna karşılık dört sorun gerçektir ve pazar başka yoldan ölçülebilir biçimde var: şantiye sesli notundan rapor yapan hazır yazılımlar kullanıcı başı ayda 30–40 $'a satılıyor, Claude'un kendisi Drive/Gmail/Asana/HubSpot bağlayıcılarını ürüne koymuş. Holding için en güçlüsü **Şirket Beyni → H9**: en yüksek fiyat, aylık bakım, yapışkan; holdingin 2026-08-01'de onaylanmış ama kurulmamış V2 hafızası hem ürünün kendisi hem kanıtıdır, onu kurmak makineyi de ilerletir. En ucuz denenebilen **Sesli not → belge → H9**: kulak (whisper large-v3-turbo) ve yerel model makinede duruyor, çok dilli saha ekipleri bizim giriş kapımız. **Başvuru-takip hunisi → H7**: CRM tabloları boş, ödeme, imza, SMS, randevu ve WhatsApp hiç yok; B05 açılmadan satılamaz. **Creator OS → H6 (+H8)**: yazı kolu zaten H6'da, klon ses ve görüntü kolu K8 ve İ5 hükmünü bekliyor. Yeni §D hattı (#27) açılmaz; dört yöntem kaydı, bir kaynak kısaltması ve beş satır notu yeter (§4). Videonun ürün dışı en değerli fikri talep-kısıtlı / arz-kısıtlı teşhisidir: H9'un ücretli keşfinin ilk sorusu olur ve holdinge uygulandığında Rapor 2'nin cümlesini doğrular — makine bizde, müşteri ve dağıtım henüz yok (CRM'de 0, gelir defterinde 0 satır); yani holding talep kısıtlıdır ve önce kendi müşteri bulma hattına (H5 dışa ulaşma, H7 kendi ön bürosu) ihtiyaç duyar. İçi boş olanlar geçirilmez: "temelini bilen herkes kurup satar", başlıktaki "3000 $+" ile aynı videodaki 2.000 ve 2.200 $'lık satışlar, Jeanette'in kanıtsız 17 × 15.000 $'ı, ekrandaki alıntının demediği "çalışan zamanının %50'si".

## 2. Dört sistem

### 2.0 Özet

| # | Sistem | Sahibi (§D) | Kanıt | Videodaki fiyat (iddia) | Gelir | Teknoloji | Bugün elimizde |
|---|---|---|---|---|---|---|---|
| S1 | Sesli not → markalı belge | H9 #25, yeni yöntem | iddia; talep başka yoldan kanıtlı | £4.500 (~6.000 $) tek seferlik | 2 | 2 | kulak, yerel model, PDF aracı var; WhatsApp kapısı yok |
| S2 | Başvuru ve takip hunisi | H7 #23 (+H6) | iddia | 2.200 $ + aynı müşteriden 6.000 $ | 2 | 2 | CRM tabloları var, 0 satır; ödeme, imza, SMS, randevu, WhatsApp yok |
| S3 | Creator OS | H6 #22 (+H8, H3, H5) | iddia | ~3.600 $ + ayda 197 $ | 1 | 1 | stüdyo ve Voicebox var; kişinin görüntüsüyle konuşan video hattı yok; K8, İ5 açık |
| S4 | Company Brain | H9 #25, mevcut yöntem genişler | iddia; Stripe paneli gerçek ama sahipsiz | 15.000 $ (×17, 9'u aylıkta) · 2.000 $ özel | 3 | 3 | hafıza yönlendirici, pgvector, gömme modelleri var; V2 hafızası kurulmadı (3 vektör) |

Puan anahtarı. **Gelir** 0 içi boş · 1 küçük ya da hükme bağlı · 2 gerçek alıcı, tekrarlanabilir · 3 yüksek fiyat + aylık gelir + holdinge oturuyor. **Teknoloji** 0–3: onu kurmak holdingin kendi makinesini ne kadar ilerletir.

### 2.0b İzleyici kaydının doğrulaması

- **Doğrulandı** (transkript ve kareyle): £4.500 / ~6.000 $ ([01:02]); 2.200 $ + 6.000 $ ve "haftada 15 saat" ([02:52]); ~3.600 $ + ayda 197 $ ([05:26]); Jeanette Stein 15.000 $, 17 satış, 9'u aylık planda ([08:39], kare S18); Kieren Newborn 2.000 $, "COMPANY BRAIN OS" ([08:54], kare S10/S17); Stripe paneli rakamları (`full541.png`); 7:40'taki alıntının sözü (kare S16: *"at many large multinationals, nearly half of all interactions between knowledge workers do not create the intended value — because people have to hunt for information"*), yani "%50 zaman" bir sözcük kaymasıdır.
- **Düzeltme:** Ekrandaki "Charles Hayes" sistemi kuran topluluk üyesidir, müşteri değil. Kare S6'da "Charles Hayes" kutusundan "Women's Marketing Coach" etiketine çizgi iner; transkript [04:55]: *"Charles, another member of my community, built this for a woman who teaches women in their fifties…"*. `WATCH.md` satır 56 iki etiketi "Alıcı" altında birlikte verdiği için Charles'ı müşteri gibi okutuyor.
- **Ek:** Stripe panelinde brüt ve net hacmin altında **"NZ$0.00 previous period"** yazıyor (kareler `full541.png`, S17). Hesabın karşılaştırılan önceki dönemde hiç tahsilatı yok: "Haziran'dan beri" sözüyle tutarlı, ama gelirin kaynağını söylemez. Para birimi NZ$; hesap Yeni Zelanda'da. "137k $" etiketi NZ$234k ile ~0,585 kurla tutarlı; 2026 kuru ölçülmedi.
- Transkript "Kiran", ekran "Kieren Newborn" yazıyor; ekrandaki ad kullanıldı.

### 2.1 S1 — Sesli not → markalı belge (videoda 0:22–2:10)

**Gerçekte ne:** İşçibaşı WhatsApp'tan sesli not yollar → not yazıya dökülür → o projenin iş kaydıyla eşleşir → markalı PDF olur → firmanın SharePoint'ine kaydedilir ve ilgiliye gider. Her şey taslaktır, bir insan gözden geçirip imzalar ([01:00]). Belgeler: saha kayıt defteri, risk değerlendirmesi, makine kaydı. Satış: işçibaşı başına haftalık evrak saati (5 × 5 = 25 ücretli saat) ve geride kalan evrakın güvenlik/uyum riski; "ekibiniz en çok hangi belgeyi doldurmaktan nefret ediyor?" sorusu, önce o tek belge, sonra sıradaki ([02:01]).

**Kanıt gücü:** Fiyat, müşteri, kurucu (Jody): **iddia**; ekranda yalnız iki tutar kutusu. Talep **başka yoldan kanıtlı**: 2026-11-02 web aramasında aynı işi yapan en az beş hazır ürün çıktı — Compa (WhatsApp fotoğraf, sesli not ve yazıdan şantiye raporu; kullanıcı başı ayda 30 $ yıllık, 40 $ aylık, "sınırlı beta" etiketli; [phase0.com](https://www.phase0.com/en/home)), Valoon ([valoon.chat](https://valoon.chat/en/funktionen/speech-to-report/)), Baukraft Go, Nora (ResQ), SuperReports. Fiyat sayfaları açılmadı; rakam arama özetinden.

**Gerçek alıcı ve fiyat bandı:** 5–50 işçibaşı çalıştıran, belge yükü yasadan ya da sözleşmeden gelen saha işletmesi: inşaat, iskele, elektrik, tesisat, tesis yönetimi, temizlik, güvenlik. Karar veren sahip ya da iş güvenliği sorumlusu. Bu müşteri **arz kısıtlıdır** (işi var, evrakı geride). Holdingin en keskin kapısı çok dil: Almanya'da Türkçe, Lehçe (Polonya dili) ya da Romence, Körfez'de Urduca, Hintçe ya da Arapça konuşan işçibaşı kendi dilinde konuşur, belge Almanca ya da İngilizce çıkar. Hazır yazılım uygulamasını ve kalıbını dayatır; müşteri burada kendi formunu, kendi dosya sistemini ve "yeni uygulama yok"u satın alır. Fiyat: £4.500 videodaki iddia; ölçülen tek fiyat noktası hazır yazılımın kullanıcı başı ayda 30–40 $'ı, yani tek seferlik büyük ücret ancak entegrasyon ve dille savunulur. Bizim fiyatımız tezgâhtan ve ilk müşteri görüşmelerinden sonra konur; biçim önerisi: belge türü başına kurulum + aylık bakım.

**Elimizde / eksik:**

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Kulak (konuşma → yazı) | **Var.** Speaches 0.8.3 (CPU) çalışıyor; `faster-whisper-large-v3-turbo-ct2` ve `faster-whisper-small` yüklü | `docker ps` → `dxb_speaches_local`; `/v1/models` (127.0.0.1:8969); istemci `packages/voice/src/speaches.ts` |
| Ses → yazı → sınıflama hattı | **Var**, video için | `tools/video-learn/src/ingest.ts` |
| Deneme sesi üretmek | **Var:** `piper-tr_TR-fahrettin-medium`; Voicebox diskte | `/v1/models`; `~/voicebox/voicebox-main` |
| Çıkarım modeli (sesten forma) | **Var, sınavsız:** `qwen3.8-27b-uncensored`; B34 sınavı koşmadı; Gemma Ollama'da görünmüyor | `ollama list` |
| Markalı PDF | **Araç var, kod yok:** `google-chrome`, `libreoffice`; depoda PDF kütüphanesi yok | `/usr/bin`; `package.json` dosyaları |
| WhatsApp kapısı | **Yok.** Yalnız şartname: Hermes'in mesaj kapısı; Hermes sunucusu onun emriyle silindi | `HOLDING-OS-MASTER-PLAN/API_CONTRACTS.md` A5, `DATA_MODEL.md` A2; tahta B09, B11 |
| SharePoint / Drive'a yazma | **Yok** | depo grep |
| Sözleşme, fatura | **Yok**; B05 donuk | `packages/outbox-executor/src/actions/index.ts:3` |

**Sahibi:** H9 #25, yeni yöntem. H9'un tanımlı demosu ("Türkçe çağrı kaydı → özet → CRM notu") aynı iskelettir; REV #12 "sahada çalışan işletme sahibi" ile komşudur. Temel satırlar: B12 (kulak), B34 (çıkarım modeli), B33 (kart), B64 ("kurulum" iş tipi), B05 (sözleşme, fatura). WhatsApp kapısı H7 ile birlikte B83'te kurulur; iki hat aynı kapıyı kullanır.

**Ferrari hâli:**
1. İşçibaşı hangi dilde konuşursa konuşsun, belge müşterinin dilinde ve **kendi formunun birebir düzeninde** çıkar.
2. Eksik zorunlu alan uydurulmaz; sistem işçibaşına kendi dilinde, sesle geri sorar ("iskele yüksekliği söylenmedi").
3. Her alanın kaynağı: sesli notun hangi saniyesinden geldiği; özgün ses kanıt olarak saklanır.
4. Fotoğraf, zaman ve konum belgeye eklenir.
5. Sorumlu tek dokunuşla imzalar; imzasız belge dışarı çıkmaz.
6. Haftalık uyum özeti: kaç belge zamanında, hangisi geride.
7. Bir belge oturunca sıradaki; her belge türü ayrı ücret ve ayrı kabul ölçümü.

Tek başına çalışan serbest geliştiricinin veremediği: çok dil, geri sorma, kanıt izi, 7/24 bakım ajanı, Sol'un denetlediği şablon.

**İlk tezgâh denemesi** (sırası gelince; 0 $; yarım gün; inşaat motoru): Türkçe ve İngilizce altı yazılı senaryo, biri bilerek eksik alanlı → Piper (Türkçe) ve Voicebox ile ses → ffmpeg'in kendi gürültü üreteciyle şantiye gürültüsü → Speaches `faster-whisper-large-v3-turbo` → yerel modelle tek bir form şemasına (İngiltere "plant register" ya da Almanca Bautagebuch günlük satırı) → `google-chrome --headless --print-to-pdf` ile markalı PDF. Ölçülen: senaryodaki değerlere karşı alan doğruluğu, uydurulan alan sayısı (kabul: 0), eksik alanın geri-sor listesine düşmesi, not başına süre. Belge bir dakika bekleyebilir; bu deneme B12'nin 1,3 saniye hedefini beklemez, yalnız kulağın doğruluğuna dayanır.

**Riskler:**
- Sorumluluk: güvenlik belgesini yapay zekâ taslaklar, imzalayan insan sorumludur. En büyük risk uydurulan alan; kabul ölçüsü bu yüzden 0.
- Kişisel veri: işçinin sesi kişisel veridir; saklama süresi müşteriyle yazılır, veri müşterinin dosya sisteminde kalır.
- Gürültü, şive ve dil karışımında doğruluk tezgâhta ölçülmeden vaat edilmez.
- Hazır yazılım ucuz; fiyat ancak entegrasyon ve çok dille savunulur.
- Müşteriye giden işte sansürsüz model sürümü koşmaz; B34 sınavında seçilen sürüm koşar.
- WhatsApp mesaj başı ücretlidir; 1 Ekim 2026'da hizmet mesajlarının da ücretlendirildiği ikincil kaynaklarda yazılı ([zoho](https://help.zoho.com/portal/en/community/topic/whatsapp-business-platform-message-pricing-guide)), Meta'nın kendi sayfasıyla çelişiyor ([developers.facebook.com](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing)); maliyet tezgâhta ölçülür, müşterinin faturasına yazılır.
- Kimlik: müşterinin WhatsApp Business numarası müşterinin hesabıdır; holdingin kendi numarası CEO'nun tıkıdır.
- Helal: iş temiz. Müşteri süzgeci G2 aynen (faiz, kumar, alkol, tütün, müstehcen sektör alınmaz).

**Puan:** Gelir **2** · Teknoloji **2** — holdingin "ses → yapılandırılmış kayıt" hattını sertleştirir; aynı hat Hamza'ya gelen sesli notlar ve toplantı dökümleri için de iş görür.

### 2.2 S2 — Başvuru ve takip hunisi (2:10–4:42)

**Gerçekte ne:** İki parça. (a) Sahibin sesiyle her hafta birden çok platform için gönderi. (b) Gönderiden gelen ilgi formu → CRM → SMS ve e-postayla ödeme bağlantısı → ödeyince başvuru formu ve feragatname, imzalanana kadar hatırlatmayla → Zoom onaylı randevu bağlantısı → takip hatırlatmaları. Örnek alıcı pazarlama ekibi ya da ön büro tutmak istemeyen yarı emekli bir doktor. Satış: "geçen ay kaç kişi form doldurdu, kaçı ödedi?" — 40 formdan 10 ödeme varsa kalan 30'dan birkaçı ücreti çıkarır; akış ilk temastan randevuya tek sayfada çizilir, insan isteyen adımlar işaretlenir, gerisi otomatikleşir, kısa demo kaydedilip gönderilir ([03:51]); müşteri Upwork'ten bulunmuş ([04:03]).

**Kanıt:** **iddia.** Ekranda ne Lewis'in adı ne tutar var, yalnız akış animasyonu. Hesabın mantığı tutarlı.

**Gerçek alıcı:** randevuyla çalışan, adayı formdan ya da telefondan gelip bekleyen, sahibi ya da bir çalışanı elle kovalayan işletme (videonun üç işareti, [03:30]); bu müşteri **talep kısıtlıdır**. Holdinge yakışan, ölçülmemiş aday nişler: Almanya, İngiltere ve Türkiye'de umre ve hac organizatörleri (kapora, pasaport ve vize formları, hatırlatma), dil kursları ve özel ders, fizyoterapi ve diş klinikleri, danışmanlar, hukuk bürolarının ön kabulü. H2 dizinlerindeki işletmeler bu hattın adayıdır (§D #18 bunu zaten söylüyor). Fiyat: 2.200 $ videodaki iddia. H7'nin "sonuç gelirse öde" biçimi İ4'te bekliyor ve İ4'ün önerisi "sabit kurulum + tanımı yazılı randevu ücreti"; bu video sabit kurulum + ikinci iş örneğini ekler.

**Elimizde / eksik:**

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| CRM | **Tablolar var, boş:** `crm_clients`, `crm_contacts`, `crm_deals`, `crm_requests` 0 satır; panelde varlık formları; ajanın CRM aracı taslak ("STUB until Phase 8") | şirket SELECT; `apps/dashboard/src/components/crm/`; `packages/dxb-mcp/src/groups/crm.ts:5` |
| E-posta | **Yalnız sahne:** yerel posta tuzağına gönderim | `packages/outbox-executor/src/actions/email-send-staging.ts`; `dxb_mailpit` kapsayıcısı |
| Hatırlatma zamanlayıcısı | **Var** | `packages/outbox-executor/src/scheduler.ts` |
| Ödeme bağlantısı, e-imza, Gmail gönderimi | **Yok** (B05) | `packages/outbox-executor/src/actions/index.ts:3` |
| SMS, randevu / Zoom | **Yok** | depo grep |
| WhatsApp | **Yok** (§2.1) | |
| Sahibin sesiyle gönderi | **Kurulmadı;** H6 hayalet yazarlığın denemesi tanımlı | §D #22 |

**Sahibi:** H7 #23 (B83); gönderi kolu H6 hayalet yazarlık (#22). Temel: B05 (ödeme bağlantısı, e-imza, e-posta gönderimi — üçü de yok), B64 (kurulum ve bakım işleri), B12 (ileride sesli resepsiyonist).

**Ferrari hâli:** H7'nin politika sınırlı ajanı tek akışta: web formu, WhatsApp ve telefon → CRM kaydı → nitelendirme (politika dışıysa insana) → ödeme bağlantısı → form ve imza → randevu → gelmeyene yeni randevu → ay sonu "40 form → 10 ödeme → +N kurtarılan" raporu; her konuşma kayıtlı (REV #7, #14). Çok dilli. Sahibin sesiyle gönderiler H6'dan, Sol denetimli. Serbest geliştiricinin veremediği: 7/24 politika sınırlı ajan, denetim izi, dil, ay sonu mutabakatı.

**İlk tezgâh denemesi** (0 $; 1 gün; inşaat motoru): 40 sahte başvuru → `crm_*` tabloları → zamanlayıcıyla takip e-postaları `dxb_mailpit`'e, içinde sahte ödeme bağlantısı → 10'u "ödedi" işaretlenir → form ve hatırlatma → randevu. Ölçülen: kaçan aday sayısı (kabul: 0), hatırlatma zamanları, insan isteyen adımın gerçekten insana düşmesi. Gerçek ödeme ve imza B05 açılınca.

**Riskler:**
- Pazar kalabalık: hazır CRM-huni yazılımları var (HighLevel türü); fiyatları ölçülmedi. Fark ajan, dil ve mutabakatta.
- Helal: ödeme bağlantısında taksit ve "sonra öde" seçenekleri (faiz ya da gecikme ücreti taşıyabilir) kapalı kurulur; hatırlatma metnine gecikme cezası yazılmaz; müşteri süzgeci G2.
- Sağlık müşterisinde özel nitelikli veri (GDPR madde 9): sağlık bilgisi formda toplanıyorsa müşterinin sisteminde kalır.
- Müşterinin adaylarına giden SMS ve e-posta müşterinin iletişimidir; sistem yine de pazarlama rızasını kaydeder.
- Feragatnamenin hukuki metnini müşteri verir; holding akışı kurar.

**Puan:** Gelir **2** · Teknoloji **2** — onu kurmak B05'i, CRM'i ve WhatsApp kapısını zorlar; bunlar her hizmet hattının ortak borusudur.

### 2.3 S3 — Creator OS (4:42–6:31)

**Gerçekte ne:** Koçun ya da üreticinin klonlanmış sesi ve görüntüsüyle anlatımlı videolar ve marka uyumlu görseller; müşteri çekim ve yazı yapmaz. Kurucu ayrıca altı sayfalık site, baskı-üzerine-ürün mağazası, 197 $'a satılan 101 sayfalık rehber, dokuz e-postalık besleme dizisi, 12 sayfa SEO ve aday anketi vermiş. Satış: arka ucu kanıtlı bir üretici seç, 20–30 gönderisinden ses profili kur, onun sesiyle 3 parça yaz, "bunu senin için yaptım" diye gönder; beğenirse bir platformu bir ay işlet, sonra tam kurulum + aylık ücret ([06:12]).

**Kanıt:** **iddia.** Hiçbir çıktı örneği yok (ne klon video ne görsel). "Charles Hayes" kurucudur (§2.0b).

**Gerçek alıcı:** ürünü ve arka ucu kanıtlı, içerik yetiştiremeyen koç ya da üretici. Holding için ayrıca: Türkçe, Arapça ve Almanca konuşan kişisel marka sahipleri; H8 ile içerikleri 11 dilde. Fiyat: ~3.600 $ + ayda 197 $, iddia.

**Elimizde / eksik:**

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Stüdyo | **Var:** ComfyUI servisi çalışıyor; `media_jobs` 32 satır (31 `done`, 1 `failed`); OpenMontage | `systemctl --user` → `dxb-comfyui`; şirket SELECT; `~/tools/OpenMontage` |
| Klon ses | Voicebox diskte; Voice Studio `~` ve `~/tools` altında bulunamadı (1 Kasım emri ikisinin de kurulmasını söylüyor; kurulum ölçülmedi) | `~/voicebox/voicebox-main`; `HOLDING-OS-MASTER-PLAN/VOICE_INTERACTION_SPEC.md` §3.2 eki |
| Ses kimliği kaydı | `voice_identities` 1 satır (`speaches:piper`, `tr`); rıza sütunu yok | şirket SELECT; B12 notu |
| Kişinin kendi görüntüsüyle konuşan video | **Ölçülmüş hat yok;** Flux sunucular emekli | `.planning/board-rows/B43.md` |
| Site | `scrollcraft` becerisi; web ofisi planı | `tools/scrollcraft/`; `~/Desktop/DxB Global Web-Studio/` |
| Rehber, e-posta dizisi | H3 atölyesi kurulmadı | §D #19 |

**Sahibi:** H6 #22 — hayalet yazarlık ve içerik dönüştürme orada zaten yazılı, ilk denemesi tanımlı. Klon ses H8 #24; müşterinin rehberi H3'ün yöntemi; site H5. Satırlar: B28, B43, B33, B12.

**Ferrari hâli:** H6'nın hattı (aday → yazı örneği → sözleşme → haftalık taslak, Sol, müşteri onayı, yayın → aylık ölçüm) + H8'in rızalı klon sesi + 11 dil. Video kolu yalnız hükümlerden sonra açılır.

**İlk tezgâh denemesi:** H6'nın tanımlı denemesi aynen; yeni para yok. Ek, 0 $: **ses profili kör testi** — kamuya açık bir üreticinin 30 gönderisinden profil, 3 yeni parça; Sol, gerçek 3 gönderiyle karışık 6 parçayı ayırmaya çalışır, ayırma oranı ölçülür. Bu oran hayalet yazarlığın kabul ölçüsü olur.

**Riskler ve hükümler:**
- K8: 2026-09-04 hükmü (her video üretiminde yapay ses iptal, motorun kendi sesi) bugün klon sesli anlatımı kapatıyor; müşterinin kendi tasarlanmış ya da klon sesi K8'in açık sorusu.
- İ5: yapay zekâ etiketi; uydurma uzmanlık ve birinci ağızdan sahte tanıklık yok.
- Kadro kanunu: 2026-09-15 eki *"müşteri bayan içerikli reklam isterse oluşturulur bu onların sorumluluğunda"*, kapsamı müşteri reklamı. Kadın müşterinin kendi klon görüntüsüyle kendi içeriği (reklam değil) bu eke girer mi — hüküm onda (§5).
- İ6: "deneme için ücretsiz video yok" hükmü aynen; videodaki "senin için yaptım" örneği bizde yalnız yazı olabilir.
- Rıza: `voice_identities` tablosunda rıza alanı yok; klon ses ve görüntü yazılı rızasız üretilmez.
- Müşterinin konusu: videodaki koç ortaklık (affiliate) pazarlaması öğretiyor. Holdingin kendi affiliate'i İ3'te bekliyor; müşterinin işi müşterinin sorumluluğunda, ama yazdığımız içerikte uydurma gelir iddiası olmaz.
- "Fazlasını bedava ver" holdingin modeli değil; her parça fiyatlıdır.

**Puan:** Gelir **1** (yazı kolu zaten H6'nın içinde sayılı; yeni olan video kolu hükümle kapalı) · Teknoloji **1**.

### 2.4 S4 — Company Brain (6:31–9:11)

**Gerçekte ne:** İşletmenin belgeleri, süreçleri ve müşteri geçmişi tek yerde; ekipten herkes sorar, doğru ve güncel cevap alır. Drive, Calendar, Gmail, Asana, HubSpot'a bağlanır; günlük brifing gönderir, proje özeti yazar, her toplantı dökümünü doğru klasöre koyar; üstüne "Claude Code routines" eklenir. Satış: kaybolan saatler (20 kişi × haftada 2 saat = 40 saat maaş), yeni çalışanın hızlı uyumu, değişim yönetiminin gizli maliyeti. Kurma: önce kendine kur (canlı demo, "kendi kanıtın"), bir iş türü seç, ekibin her hafta sorduğu soruları bul, yalnız cevabın yaşadığı araçları bağla ([08:09]). Bağlantı katmanı, arama yöntemi ve doğruluk denetimi söylenmiyor.

**Kanıt:** Videonun en güçlü bölümü, ama sınırlı. Jeanette (15.000 $ × 17, 9'u aylık planda): **iddia**, hiçbir kanıt yok. Kieren (2.000 $ özel kurulum, "Haziran'dan beri 137k $", bir şirketten 30 kurulum): Stripe paneli **gerçek bir ekran** (NZ$234k brüt, NZ$221k net, 1 Haz–4 Eyl 2026, önceki dönem NZ$0,00), ama panelde hesap sahibi yok ve gelirin şirket beyninden geldiği yazmıyor; 2.000 $'dan 137k $ ~68 kurulum ister, videoda bu sayı yok. "%50" **abartı** (§2.0b). Talep başka yoldan kanıtlı ve aynı kanıt bir uyarı taşır: Claude'un kendisi Drive, Gmail, Calendar, Asana ve HubSpot bağlayıcılarını ürüne koymuş (2026 ortası üçüncü taraf rehberler: [dragapp](https://www.dragapp.com/blog/best-claude-connectors/), [digitalcitizen](https://www.digitalcitizen.life/what-are-claude-connectors-and-how-they-connect-claude-to-your-work-tools/); Anthropic'in kendi sayfası açılmadı). "Bağla ve sor" kısmı sıradanlaştı.

**Gerçek alıcı:** 10–200 kişilik bilgi yoğun firmalar: ajans, danışmanlık, hukuk, mali müşavirlik, mühendislik, emlak yönetimi, okul, çok şubeli işletme. Bu müşteri **arz kısıtlıdır** (videonun [10:33]'teki eşleşmesi). En keskin kapı veri egemenliği: Almanya ve Körfez'de "veriniz sizde kalır" diyen yerinde model (H9 zaten yazıyor). Fiyat: 2.000–15.000 $ kurulum + aylık, iddia; ölçülmedi.

**Elimizde / eksik:**

| Parça | Durum (2026-11-02) | Yer |
|---|---|---|
| Hafıza yönlendirici | **Var:** pgvector, Obsidian, claude-mem, graphify, notebook bağdaştırıcıları; karantinalı yazma kuralı | `packages/memory-router/src/` (`adapters/pgvector.ts`, `write-policy.ts`) |
| Şirketin hafızası | **Neredeyse boş:** `memory_embeddings` 3, `memory_index` 5 satır | şirket SELECT |
| Gömme modelleri | **Var (Ollama):** `embeddinggemma` (onaylı CPU düzeni), `bge-m3`, `qwen3-embedding:0.6b` | `ollama list`; onay `memory-embeddings-local-cpu-2026-10-15` |
| Dayanak denetçisi | Makinede `bespoke-minicheck` (4,7 GB), hiçbir kod kullanmıyor; araştırma kaydı LettuceDetect v2'yi seçmiş | `ollama list`; `.planning/research/RESEARCH-ENGINE-2026.md:433` |
| Not defteri | `open-notebook` 1.10.0 kapsayıcısı çalışıyor | `docker ps` |
| V2 hafızası | **Onaylı (2026-08-01), kurulmadı:** işçi istemi hafızayı çağırmıyor (`worker-shim.ts`), kapsam sütunu (`memory_index.scope`) hiçbir kodda okunmuyor, hatırlama `DXB_LITELLM_KEY_OS` ister ve anahtar yok | tahta Bölüm 2d, "V2 memory — one brain" satırı (`00-BOARD-OPEN-WORK.md` satır 264) |
| Günlük brifing | **Var (CEO için):** `ceo_briefings` 8 satır, sonuncusu 2026-09-27; `v_morning_briefing` görünümü | şirket SELECT |
| Toplantı dökümü | Kulak var (§2.1) | |
| Drive / Gmail / HubSpot / Asana bağlayıcısı | **Kodda yok;** Claude'un kendi bağlayıcıları var | depo grep; web |
| Rol bazlı asistanlar | Persona fabrikası: `personas` 812 satır, 214 persona dosyası | `packages/hr/src/`; `personas/` |

**Sahibi:** H9 #25 — "Kurumsal 'ikinci beyin'" yöntemi orada zaten var (REV #9); bu video onu genişletir. Temel: tahtanın Bölüm 2d'sindeki V2 hafıza hükmü (onay 2026-08-01, gömme düzeni 2026-10-15), B34 (yerinde model), B64 (kurulum iş tipi; aylık bakım sürekli iş), C41 (kadronun dışa dönük personası), B05 (sözleşme), B04 (30 günlük devir eğitimi).

**Ferrari hâli:**
1. Holdingin kendi V2 hafızası önce kurulur ve canlı demo olur — videonun "önce kendine kur"u ile H9'un "kanıtı holdingin kendisi" ilkesi aynı şeydir.
2. Tek temel (şablon), müşteri başına yalnız bağlayıcılar ve yetki haritası (Jeanette'in yolu); holdingin persona derleyicisi (`packages/hr/src/compiler.ts`) aynı deseni zaten taşıyor.
3. Her cevap kaynaklı; kaynak yoksa "bilmiyorum"; dayanak denetçisi her cevabı belgeye karşı sınar.
4. Rol bazlı kapsam: maaş, insan kaynakları ve sözleşme belgesi herkese açılmaz (`memory_index.scope`).
5. Belgeden gelen talimat karantinada kalır (`write-policy.ts` deseni); belgeye gömülü istem saldırısı cevaba sızmaz.
6. Kabul testi: müşterinin her hafta sorduğu 20 soru doğru ve kaynaklı cevaplanınca teslim; aylık bakım bu 20 sorunun skorunu korur ve büyütür. V2 hükmü holdingin kendisi için aynı 20 soru testini zaten koymuş.
7. Yerinde kurulum: müşterinin sunucusunda yerel model + yerel gömme, ya da müşterinin kendi model hesabı; holdingin aboneliği müşteriye motor olmaz (veri ve maliyet ayrımı, REV #9 kapısı).
8. Üstüne: rol bazlı günlük brifing, toplantı dökümünü dosyalama (Speaches), her yeni aday için araştırma özeti (REV #3 motoru).

Serbest geliştiricinin veremediği: ölçülen kabul testi, dayanak denetimi, karantina, yerinde model, çok dil, 7/24 bakım.

**İlk tezgâh denemesi** (0 $; 1–2 gün; inşaat motoru): holdingin kendi külliyatı (`HOLDING-OS-MASTER-PLAN/`, tahta, `.planning/STATE.md`) bilgisi dağınık gerçek bir şirket gibi kullanılır. 20 soru + cevap anahtarı (yazar taslaklar, Sol denetler; V2 hükmünün 20 soruluk listesi tasarım evresinde zaten CEO'nun düzeltmesine gelecek) → `embeddinggemma` ile CPU'da gömme, `bge-m3` karşılaştırma için → inşaat motorunda pgvector → cevap yerel modelle ve Claude'la ayrı ayrı → dayanak denetimi. Ölçülen: doğru cevap, doğru kaynak, gerektiğinde "bilmiyorum", uydurma sayısı (kabul: 0), Türkçe soruya İngilizce belgeden cevap, süre. Aynı ölçüm V2 hafızasının kabul testidir: tek iş, iki satır.

**Riskler:**
- Sıradanlaşma: Claude'un kendi bağlayıcıları var; "bağlayıcı + sohbet" satılmaz. Satılan düzen, yetki, doğruluk, yerinde model ve bakım.
- Uydurma cevap güveni bitirir → dayanak denetimi ve "bilmiyorum".
- Yetki sızıntısı → kapsam kuralı; bugün kodda okunmuyor (Bölüm 2d, boşluk 3).
- Belgeye gömülü istem saldırısı → karantina.
- Değişim yönetimi (videonun "gizli maliyet"i) → H9'un 30 günlük devri ve eğitimi.
- "Kapatamazlar, yapışkan" ve "9/17 aylığa kaldı" iddia.
- Bugünkü boşluk V2 hafızasının kurulmamış olması; tezgâh denemesi bunu beklemez, inşaat motorunda bağımsız ölçer.
- Helal: iş temiz; müşteri süzgeci G2.

**Puan:** Gelir **3** · Teknoloji **3** — holdingin kendi beynini kurar; her çalışanın kurumsal hafızayla çalışması V2 hükmünün amacıdır.

## 3. Videodan diğer işe yarar noktalar

1. **Talep mi kısıtlı, arz mı** ([10:08](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=608)): talep kısıtlı işletmeye içerik ve huni (H6, H7), arz kısıtlıya sesli not ve şirket beyni (H9); arz kısıtlıya aday göndermek yalnız yük. H9'un ücretli keşif raporunun ilk sorusu olur. Holdinge uygulanınca: holding talep kısıtlı; ilk ihtiyacı kendi müşteri bulma hattı (H5'in dışa ulaşma makinesi, H7'nin holdingin kendi adayları için ön bürosu, H2 dizinleri).
2. **En nefret edilen tek belge** ([02:01](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=121)): dar başla, oturunca genişle; belge türü başına fiyat ve kabul.
3. **Önce kendine kur** ([08:15](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=495)): H9'un "kanıtı holdingin kendisi" ilkesini dışarıdan doğruluyor; V2 hafızasını kurmak için gelir tarafından ikinci gerekçe.
4. **Şablon mu, özel mi** ([09:04](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=544)): Jeanette yüksek fiyat + tek temel, Kieren düşük fiyat + her müşteriye özel. Holdingin fabrikası şablon yoluna uygun.
5. **Gizli maliyetler** (zaman, risk, değişim yönetimi — [01:42](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=102), [07:52](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=472)): teklif sayfası bunları rakamla gösterir; H9'un dış gözle paket kılavuzu (K12) bunu taşır.
6. **Sonuçla sat, nişi veriden sonra seç** ([09:19](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=559)): H1 ve H2'nin "nişi veri seçer" ilkesiyle aynı; yeni kayıt gerekmez.
7. **Upwork bir müşteri kanalı** ([04:03](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=243)): holding hesabı açmak kimlik adımıdır, CEO'nun tıkı; ana kanal H5'in dışa ulaşma makinesi.
8. **Yaratıcının kendi geliri**: ücretsiz SOP (aday mıknatısı), ücretsiz + ücretli topluluk (AIS+, ayda 129 $), kitap, ortaklık bağlantıları (Glaido, Hostinger). Bunlar H3'ün "Community", "Collect Emails", "eCourse" yöntemleri olarak zaten yazılı ve şartı kanıt ("kanıtsız kurs satılmaz"); yeni kayıt yok.
9. **Kanal kaynak kanal olarak önerilmez:** videoların gelir modeli topluluk satışı, yöntemleri ajans oyun kitabının tekrarı. İşe yarayabilecek tek ek video, 3:16'da anılan "How to Price AI Workflows (Without Losing Clients)"; H9 fiyatlanırken bir kez izlenebilir.
10. **Oturumlar merceği:** inşaat oturumlarına yeni alet, beceri ya da depo yok; 0:05'teki günlükte görünen `mcp__claude-in-chrome` zaten bizde.

## 4. Önerilen kayıtlar (bu dosya hiçbirini yazmadı)

### 4.1 `.planning/research/REVENUE-OPPORTUNITIES.md` §D

**(a) Üst bilgi** — satır 6'nın (`> **2026-11-01:** 12 videodan …`) altına:

```
> **2026-11-02:** Nate Herk'in dört sistemi ([BQJRLZ2q_Ns](https://www.youtube.com/watch?v=BQJRLZ2q_Ns)) H6, H7 ve H9'a yöntem olarak eklendi; yeni hat açılmadı.
```

**(b) §D "İz" bloğu** — "Kısaltma" satırının sonuna:

```
 · N nate-herk (`.planning/research/watch-links/2026-11-02-nate-herk/`): `N-O 2.4` = o klasördeki `ANALIZ.md` §2.4; izleyici kaydı `WATCH.md`
```

**(c) H6 #22 "Videodan gelen yöntemler"** — "İçerik dönüştürme" maddesinden sonra yeni madde:

```
  - **Üretici işletim sistemi (Creator OS):** ürünü kanıtlı koçun sesiyle haftalık içerik; 20–30 gönderisinden ses profili, 3 örnek parça (İ6'nın yazı örneği), beğenirse bir platform bir ay, sonra tam kurulum + aylık ücret. Müşterinin klon sesi ve görüntüsüyle video yalnız yazılı rızayla ve K8, İ5 hükmünden sonra (H8); kadın müşterinin kendi görüntüsü kadro kanununun 15 Eylül ekine girer mi, hüküm onda. Fiyat iddia: ~3.600 $ + ayda 197 $ — [BQJRLZ2q_Ns 04:42](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=282), satış [06:12](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=372) · `N-O 2.3`; müşterinin rehberi H3, sitesi H5. İlk deneme: H6'nın denemesine 0 $'lık ses profili kör testi eklenir (Sol gerçek ve üretilmiş parçayı ayırmaya çalışır).
```

**(d) H7 #23 "Videodan gelen yöntemler"** — "Sesli dikey platform" maddesinden sonra yeni madde, ardından "Karar / satırlar"dan önce yeni "İlk deneme" satırı:

```
  - **Sabit ücretli başvuru → ödeme → form → randevu zinciri:** ilgi formu CRM'e düşer; SMS ve e-postayla ödeme bağlantısı; ödeyince başvuru formu ve feragatname imzalanana kadar hatırlatmayla; sonra randevu bağlantısı ve takip. Alıcı: randevuyla çalışan, adayı formdan ya da telefondan gelip bekleyen, sahibi elle kovalayan işletme (talep kısıtlı). Satış: "geçen ay kaç form, kaç ödeme?"; akış tek sayfada çizilir, insan isteyen adım işaretlenir. Fiyat iddia: 2.200 $ + aynı müşteriden 6.000 $'lık ikinci iş; İ4'ün "sabit kurulum + randevu ücreti" biçimine ikinci örnek. Ödeme bağlantısında taksit ve "sonra öde" kapalı, gecikme cezası yazılmaz. Gönderi kolu H6 hayalet yazarlık — [BQJRLZ2q_Ns 02:11](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=131), alıcı [03:30](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=210) · `N-O 2.2`; B05 (ödeme, imza, e-posta)
- **İlk deneme:** inşaat motorunda 40 sahte başvuru → CRM → yerel posta tuzağına takip e-postası ve sahte ödeme bağlantısı → randevu; kaçan aday sayısı ölçülür (kabul 0); 0 $, 1 gün. Gerçek ödeme ve imza B05'le — `N-O 2.2`.
```

**(e) H9 #25 "Videodan gelen yöntemler"** — üç değişiklik:

"Ajan kurulumu + aylık bakım" maddesinden sonra yeni madde:

```
  - **Sahadan sesli not → imzaya hazır belge:** işçibaşı WhatsApp'tan kendi dilinde konuşur; kayıt yazıya döner, işin kaydıyla eşleşir, firmanın kendi formunda markalı PDF taslak olur, sorumlu imzalar. Eksik alan uydurulmaz, işçibaşına kendi dilinde geri sorulur; özgün ses kanıt olarak saklanır. Satış: "ekibiniz en çok hangi belgeden nefret ediyor?" — önce o tek belge, sonra sıradaki. Pazar var ve hazır yazılım ucuz (Compa: WhatsApp sesli notundan şantiye raporu, kullanıcı başı ayda 30–40 $, beta); fark müşterinin kendi formu ve sistemi, yeni uygulama yok, çok dilli ekip (Türkçe, Urduca, Arapça konuşan işçibaşı → Almanca ya da İngilizce belge). Fiyat iddia: £4.500 (~6.000 $) tek seferlik — [BQJRLZ2q_Ns 00:22](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=22), satış [01:07](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=67), tek belge [02:01](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=121) · `N-O 2.1`; REV #12. Kulak B12, çıkarım B34, WhatsApp kapısı H7 ile (B83).
```

Mevcut "Kurumsal 'ikinci beyin'" maddesinin yerine:

```
  - **Kurumsal "ikinci beyin" / şirket beyni:** şirketin belgesi, süreci, müşteri geçmişi tek beyinde; herkes sorar, kaynaklı cevap alır; üstüne rol bazlı günlük brifing, toplantı dökümünü dosyalama, her yeni aday için araştırma özeti. Tek temel bir kez kurulur, müşteri başına bağlayıcılar ve yetki haritası; kabul testi müşterinin her hafta sorduğu 20 soru. Holdingin kendi V2 hafızası (tahta Bölüm 2d) hem ürün hem kanıt. Claude'un kendi bağlayıcıları "bağla ve sor"u sıradanlaştırdı; satılan düzen, yetki, dayanak denetimi, yerinde model ve aylık bakım. Fiyatlar iddia: 15.000 $ × 17 (9'u aylıkta), 2.000 $ özel kurulum; Stripe paneli (NZ$234k, 1 Haz–4 Eyl 2026) gerçek ama kime ve hangi işe ait olduğu yazmıyor — [FqsAALrRhj4 32. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1920) · `A-O` (raporda yok); [BQJRLZ2q_Ns 06:31](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=391), fiyatlar [08:37](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=517) · `N-O 2.4`; REV #9
```

"Ücretli keşif / veri egemenliği denetimi" maddesinden sonra yeni madde:

```
  - **Ücretli keşfin ilk sorusu — talep mi kısıtlı, arz mı:** daha çok müşteri isteyene içerik ve başvuru hunisi (H6, H7); işi zaten taşıyana aday göndermek yük, ona sesli not → belge ve şirket beyni — [BQJRLZ2q_Ns 10:08](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=608) · `N-O 3`
```

**(f) H9 #25 "İlk deneme"** — satırın sonuna:

```
 Ek (BQJRLZ2q_Ns): sesli not → form → PDF tezgâhı (yerel kulak ve yerel model, 0 $, yarım gün) ve holdingin kendi külliyatında 20 soruluk şirket beyni ölçümü (0 $, 1–2 gün; V2 hafızasının kabul testiyle aynı) — `N-O 2.1`, `N-O 2.4`.
```

**(g) H9 #25 "Karar / satırlar"** — satırın yerine:

```
- **Karar / satırlar:** K10, K12 · B64 ("kurulum" iş tipi), B33/B34, B04, B12 (sahadan sesli notun kulağı), V2 hafıza satırı (tahta Bölüm 2d; şirket beyni).
```

**Eklenmeyenler:** "Geçmeyenler"e yeni madde yok (ünlü ya da rakip sesinin klonu zaten orada; müşterinin kendi sesi H8'de rızayla geçer). "Hükmü CEO'da bekleyenler" listesi Rapor 2 §8'in listesidir; kadro kanunu sorusu (c)'deki madde içinde durur.

### 4.2 Tahta satır notları

**(a) `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` satır 264 — Bölüm 2d, "V2 memory — one brain"**; satırın ikinci hücresinin sonuna, kapanan ` |`'dan önce:

```
**Revenue (2026-11-02, B83):** H9's company brain (REVENUE-OPPORTUNITIES §D #25, `N-O 2.4`) is this memory sold outward — one foundation, the client's own connectors and permission map, the client's 20 weekly questions as its acceptance test, the same test this ruling sets for itself; the holding's own brain is its demo and its proof.
```

**(b) `.planning/board-rows/B12.md` — "Revenue lines this row also builds"**, yeni madde:

```
- H9's field voice note → document (§D #25, `N-O 2.1`) hears with this row's ear (whisper large-v3-turbo, already loaded in Speaches); a document can wait a minute, so it needs the ear's accuracy in site noise and in the crew's languages, not the 1.3 s target.
```

**(c) `.planning/board-rows/B34.md` — "Revenue lines this row also builds"**, yeni madde:

```
- H9's field voice note → document and company brain (§D #25, `N-O 2.1`, `N-O 2.4`) need a local model that fills a form without inventing a field and answers only from its sources; the exam scores that too. The machine's Ollama holds `bespoke-minicheck`, which no code uses; RESEARCH-ENGINE-2026.md:433 picked LettuceDetect v2 for grounding. A client's work never runs on the uncensored build.
```

**(d) `.planning/board-rows/B83.md` — "Where every line is built" tablosu**; H9 satırının yerine:

```
| H9 digital-team setup (#25) | B64 · B34 · C41 · B04 · B12 · V2 memory (board Section 2d) | the "kurulum" job type · the on-premises model · the persona factory · the training · the field voice note's ear · the company brain, built on the holding's own memory |
```

H7 satırının son hücresinin sonuna: `; its WhatsApp door also carries H9's field voice notes (N-O 2.1)`.

**(e) `.planning/board-rows/B05.md` — "Revenue lines this row also builds"**, yeni madde:

```
- H7's intake chain (§D #23, `N-O 2.2`) drives the same integrations from the client's own accounts: a payment link with no instalment or pay-later option, e-signed intake forms, reminder mail.
```

**Not yazılmayanlar:** B64 (notu H5–H9'un kurulumunu ve aylık paketini sürekli iş olarak zaten yönlendiriyor), C41 (notu her hattın kadrosunu zaten kapsıyor), B04 (notu H9'un eğitimini zaten kapsıyor). B83'ün tahtadaki satırı değişmez.

## 5. CEO'nun evetini bekleyenler

**Yeni iki soru:**
1. **Helal hükmü (G2):** REVENUE_ENGINE_SPEC satır 108'e göre açıkça haram kategorilerin dışındaki her helal hükmü onundur. S1 sesli not → belge, S2 başvuru zinciri, S4 şirket beyni için öneri: helal; müşteri süzgeci faiz, kumar, alkol, tütün ve müstehcen sektörü dışarıda bırakır; S2'de taksit ve "sonra öde" kapalı, gecikme cezası yok. S1 ve S4, K10'daki "yapay zekâ danışmanlığı → H9" fırsatının içine düştüğü için K10'la birlikte tek "evet"le verilebilir.
2. **Kadro kanununun kapsamı (S3'ün video kolu):** kadın müşterinin kendi klon görüntüsü ve sesiyle kendi içeriği (reklam değil) 2026-09-15 ekine girer mi? Öneri: S3'ün video kolu açılacağı gün K8 ve İ5 ile birlikte sorulsun; yazı kolu (H6) bunu beklemez.

**Zaten açık, bu yöntemlere dokunan hükümler (yeni soru yok):** K8 (klon ses), İ4 (randevu başına ücret), İ5 (etiket), İ6 (ücretsiz yazı örneği), K11 (B05'in çözülmesi; S2 onsuz satılmaz), K12 (H9 paketi ve "kurulum" iş tipi).

**Hat açılınca onun tıkı:** holdingin WhatsApp Business numarası, Upwork hesabı, ödeme ve e-imza hesapları. Satın alırken satıcıya holdingin yapay zekâ işi ve geliri anılmaz.

**Kayıtların yazılması:** §4'teki kayıtlar onun bugünkü emrinin ("gelir üretim sistemlerinden biri olsun") ve B83 kuralının içindedir; yazmak kurmak değildir. Ayrı bir "evet" gerekip gerekmediğine lider karar verir.
