# REVENUE-OPPORTUNITIES — Külliyattan Gelir Yapıları

> CEO Direktifi B6 ana çıktısı. Soru: *"Bu kütüphaneyle DXB içinde AYRICA neler yapılabilir — gerçek müşteri, gerçek kârlılık; fiziki şirketin yapamayacağı/yavaş kalacağı kazançlar hangi yapılar kurulursa mümkün?"*
> Format (her fırsat): **Mekanizma** (ne kurulur, hangi kaynaklar birleşir) · **Müşteri/ödeyen** · **Fiziki şirket neden yapamaz** · **Faz** · **Gate'ler**.
> Durum: **W1 — 12 fırsat + 4 Fable ek önerisi (2026-07-09). Her dalga sonunda güncellenir, CEO'ya sunulur.**
> **2026-11-01:** 12 videodan çıkan gelir yolları §D'de (#17–#26), vakti gelince yapılsın diye, kaynak iziyle.
> **2026-11-02:** Nate Herk'in dört sistemi ([BQJRLZ2q_Ns](https://www.youtube.com/watch?v=BQJRLZ2q_Ns)) H6, H7 ve H9'a yöntem olarak eklendi; yeni hat açılmadı. Satış ve çalışma akışları, gelir yolu: Rapor 3 (`~/Desktop/Gelir Kaynakları/3 - …pdf`). Sesli not → belge, şirket beyni ve başvuru zinciri şimdilik helal sayılır (CEO, 2026-11-02 <!-- CEO-OK: nate-herk-four-systems-halal-for-now-2026-11-02 -->).
> **2026-11-04:** Web derin çalışmasının gelir yolları (dosya 9 §5) H5'e (#21) yöntem olarak eklendi; yeni hat açılmadı. H1 ve H2'ye politika riski yazıldı (dosya 9 §6). Kararlar 6 ve 7 (CEO, 2026-11-04 <!-- CEO-OK: b84-web-study-nine-decisions-2026-11-04 -->).

## A. Külliyat-türevli fırsatlar

### 1. Tedarikçi/Fiyat İstihbaratı Aboneliği
- **Mekanizma:** ScrapeGraphAI + Apify + browser-use tarama motoru; hermes gece cron'u; sonuçlar CRM'e, sabah digest'e. Kaynak başına izleme seti (fiyat, stok, yeni ürün, rakip kampanya).
- **Müşteri:** EU e-ticaret perakendecileri/toptancıları (Outleteuro tedarik ağı ilk sıcak liste). Aylık retainer.
- **Fiziki neden yapamaz:** 7/24 tarama + saatlik fiyat değişimi yakalama insan ekiple maliyet-imkânsız; DXB gece vardiyası CANLI (hermes kanıtlı).
- **Faz:** 10 (research dalgası) → satış 11+. **Gate:** scraping ToS/robots politikası yazılı (policy-writer, B8); maliyet-etiketli; müşteri verisi izole.

### 2. 7/24 İçerik-Reklam Fabrikası
- **Mekanizma:** MoneyPrinterTurbo + opencut/OpenMontage + Higgsfield görsel; humanizer zorunlu; draft → CEO/müşteri onayı → yayın. Loop-engine (B1) CTR skoruyla reklam metnini haftalık iyileştirir.
- **Müşteri:** Küçük markalar/butik mağazalar — günlük kısa-video + görsel paketi aboneliği.
- **Fiziki neden yapamaz:** Günde N video + A/B döngüsünü ajans fiyatına değil, yazılım marjinal maliyetine üretir.
- **Faz:** 10 (creative+social dalgası). **Gate:** humanizer + draft-only + platform ToS + bütçe etiketi.

### 3. Satılabilir Derin-Araştırma Raporu Ürünü
- **Mekanizma:** open_deep_research + gpt-researcher(+gptr-mcp) çift motor; graphify ilişki haritası eki; MiroFish senaryo-simülasyon premium katmanı (sandbox-only, V2-05). 48-saat teslim, kaynaklı-alıntılı PDF.
- **Müşteri:** Pazar girişi/ürün kararı arifesindeki KOBİ'ler; tek-seferlik ürün fiyatı + abonelik varyantı.
- **Fiziki neden yapamaz:** 50+ kaynaklı, alıntılı raporu 48 saatte araştırma şirketi fiyatının kesriyle üretemez.
- **Faz:** 10. **Gate:** kaynak-doğrulama zinciri (Evidence-Before-Done müşteriye vaat olarak); karantina-tier'lı hafıza.

### 4. Trend-Sinyal / Erken-Satış İstihbaratı Aboneliği
- **Mekanizma:** last30days + Agent-Reach (gated) + hermes gece taraması; niş-başına sinyal filtreleri; sabah digest formatı BUGÜN CANLI (social-scan-2026-07-09.md, 20 madde).
- **Müşteri:** Dropshipping/e-ticaret operatörleri, içerik üreticileri — niş başına aylık abonelik.
- **Fiziki neden yapamaz:** Kişi-başı analist maliyeti sinyal fiyatını öldürür; burada marjinal niş maliyeti ~sıfır.
- **Faz:** 10 → satış hemen sonrası. **Gate:** Agent-Reach ToS riski yazılı politika + onay kapısı arkasında.

### 5. Sürekli-Optimizasyon Retaineri (Loop-as-a-Service)
- **Mekanizma:** B1 generic loop-engine müşteri asset'ine bağlanır (ürün listelemesi, reklam metni, e-posta şablonu); kilitli skorer (CTR/dönüşüm/cevap oranı) + git commit/revert; aylık iyileşme raporu dashboard'dan.
- **Müşteri:** Reklam harcayan her KOBİ; "metrik düşerse otomatik geri alınır" garantisiyle retainer.
- **Fiziki neden yapamaz:** Haftalık ölç-değiştir-kanıtla döngüsünü insan ekip bu fiyata sürdüremez; skorer kilidi = oyunlaştırılamaz güven.
- **Faz:** 11 (Outleteuro ilk kanıt) → dışa satış 11+. **Gate:** skorer agent-immutable; gerçek gönderim draft-only; bütçe onaysız artmaz.

### 6. Video→Bilgi-Tabanı Dönüştürme Servisi
- **Mekanizma:** video-learn hattı (yt-dlp → Speaches STT → sınıflandır → özet/kavram çıkar — 07-07 CANLI, LIVE_INGEST_OK) + open-notebook + graphify; müşterinin eğitim/webinar/toplantı videoları aranabilir kurumsal hafızaya döner.
- **Müşteri:** Eğitim şirketleri, danışmanlıklar, video arşivi olan her kurum; kurulum + video-başına/aylık işleme.
- **Fiziki neden yapamaz:** Yüz saat videoyu insanla indekslemek haftalar; burada gece kuyruğunda otomatik.
- **Faz:** ALTYAPI HAZIR (7) → ürünleşme 8 (dashboard giriş noktası, tracker EMBED şartı). **Gate:** karantina-tier (video içeriği untrusted), müşteri-veri izolasyonu.

### 7. Politika-Sınırlı AI Müşteri Desteği (Tier-1 Outsource)
- **Mekanizma:** B8 support departmanı + policy-writer'ın müşteri-başına yazdığı versiyonlu politika seti; CRM inbox → draft → politika-içiyse otonom, dışıysa eskalasyon (B7b).
- **Müşteri:** Küçük e-ticaret siteleri (ilk: Outleteuro kendisi = dogfood kanıtı).
- **Fiziki neden yapamaz:** 7/24 çok-dilli (DE/TR/EN) Tier-1'i bu fiyata insan ekip veremez; politika-sınırı "sorumlu AI" satış argümanı.
- **Faz:** 10 (B8). **Gate:** politika dosyaları versiyonlu; politika-dışı ASLA otonom; tüm cevaplar audit-trail'de.

### 8. Ürünleşmiş Dashboard/Cockpit Kurulumu
- **Mekanizma:** Phase 8 kendi cockpit'imiz = şablon + portföy. Design bundle (B3) + Stitch + Aceternity/Refero/Mobbin çıtası + supabase omurga; sabit-fiyat "işletme kokpiti" paketi.
- **Müşteri:** Operasyonunu tek ekrandan görmek isteyen KOBİ sahipleri.
- **Fiziki neden yapamaz:** Ajans fiyatı/süresi (haftalar) yerine günler; tasarım kalite kapıları (taste/impeccable) tutarlılığı garanti eder.
- **Faz:** 8 (kendi kokpitimiz) → satış 10+. **Gate:** müşteri verisi izole instance; tasarım-disiplin kapısı (B3 emsali).

### 9. Kurumsal "Second Brain" Kurulum + Bakım
- **Mekanizma:** Phase 6 memory stack'in (Obsidian vault + claude-mem + graphify + open-notebook + memory-router karantina deseni) müşteriye kurulumu; video-learn (#6) besleyici olarak eklenir.
- **Müşteri:** Danışmanlık/hukuk/ajans gibi bilgi-yoğun firmalar; kurulum + aylık bakım.
- **Fiziki neden yapamaz:** Bilgi-altyapısı uzmanlığı + AI entegrasyonu tek pakette yok denecek kadar az; DXB referans implementasyonu kendi üstünde çalışıyor.
- **Faz:** altyapı HAZIR (6) → ürünleşme 10+. **Gate:** müşteri-veri izolasyonu; karantina/promotion disiplini aynen taşınır.

### 10. İhale/Pazaryeri İzleme + Otomatik Teklif Taslağı
- **Mekanizma:** browser-use + playwright izleme robotları; eşleşen ilan → CRM'e fırsat kaydı + teklif TASLAĞI (insan onaylar gönderir); hermes gece taraması.
- **Müşteri:** B2B tedarikçiler, hizmet firmaları (TR+DE ihale/pazaryeri yüzeyleri).
- **Fiziki neden yapamaz:** Yüzlerce yüzeyi günlük insan taraması ölçeklenmez; kaçan ihale = kaçan ciro.
- **Faz:** 10. **Gate:** teklif GÖNDERİMİ her zaman insan-onaylı (para/sözleşme sınıfı — B7 istisnası değil).

### 11. Katalog-Otomasyonu-as-a-Service
- **Mekanizma:** Outleteuro pilotunun genelleştirilmesi: 73-marka katalog hattı (listeleme, çeviri, fiyat güncelleme, staging-first WooCommerce) + Catalog Automation Rate KPI'ı müşteriye pano olarak.
- **Müşteri:** Çok-markalı EU outlet/toptan siteleri.
- **Fiziki neden yapamaz:** Çok-dilli sürekli katalog bakımı insan ekiple hem yavaş hem hatalı; KPI'lı şeffaflık benzersiz.
- **Faz:** 11 kanıt → dışa satış sonrası. **Gate:** staging-first yazma; müşteri store kimlikleri outbox-executor'da izole.

### 12. Beyaz-Etiket Sesli Operasyon Asistanı (JARVIS kurulumları)
- **Mekanizma:** Phase 9 stack (Speaches STT/TTS + voicebox/Whisperflow-klon + kernel-intent deseni) KOBİ sahibine kendi işletme verisiyle kurulur; sabah brifingi + sesli komut.
- **Müşteri:** Sahada çalışan işletme sahipleri (TR/DE) — eller-serbest yönetim.
- **Fiziki neden yapamaz:** Kişisel asistan maaşı vs. yazılım aboneliği; 7/24 uyanık.
- **Faz:** 9 (kendi JARVIS'ımız) → satış 10+. **Gate:** ses tek başına outward eylem YÜRÜTEMEZ (Phase-9 negatif testi aynen müşteriye).

## B. Fable'ın liste-dışı EK önerileri (B6.4 zorunlu katkı)

### 13. AI Maliyet-Kontrol Paketi (LLM-Ops)
- **Mekanizma:** Kendi LiteLLM + virtual-key + bütçe-breaker + velocity-breaker altyapımız (Phase 4, CANLI) müşteri AI harcamasının önüne kurulur; %70 uyarı / %100 hard-stop; departman-bazlı pano.
- **Müşteri:** AI faturası kontrolden çıkan her şirket (çok yaygın, çok acil ağrı).
- **Fiziki neden yapamaz:** Bu bir yazılım disiplini — ama pazarda paketlenmiş hali nadir; bizde üretimde kanıtlı.
- **Faz:** altyapı HAZIR (4) → paket 10+. **Gate:** müşteri anahtarları vault'ta, asla düz metin (Phase-1 disiplini).

### 14. Denetlenebilir-AI / Audit-Trail Retrofiti (EU AI Act rüzgârı)
- **Mekanizma:** COST-01 append-only nedensellik zinciri (prompt→tool→karar) deseni müşterinin mevcut AI iş-akışına eklenir; "bu kararı AI neden verdi" sorusuna kanıt-zincirli cevap.
- **Müşteri:** Regülasyon baskısı altındaki EU firmaları (finans-komşusu sektörler önce).
- **Fiziki neden yapamaz:** Hukuk bürosu süreç yazar ama çalışan teknik iz altyapısı kuramaz; ikisi bir arada nadir.
- **Faz:** desen HAZIR (4) → ürün 10+. **Gate:** müşteri verisi yerinde kalır (on-prem/kendi Supabase'i).

### 15. Dijital-Kadro Paketleri (Persona Factory B2B)
- **Mekanizma:** HR fabrikasının v2 şablonu (role/objective/output_contract/termination/skills/mcp_profile/context_budget) + golden-task kalite kapısı → "hazır departman" paketleri (ör. 5-kişilik research ekibi) müşteri workspace'ine kurulur.
- **Müşteri:** AI ekibi kurmak isteyen ama nereden başlayacağını bilmeyen KOBİ'ler.
- **Fiziki neden yapamaz:** İşe-alım aylar; burada kadro + kalite bataryası günlerde. Golden-task kapısı "çalıştığı kanıtlı" farkı.
- **Faz:** 10 (fabrika kanıtı) → satış sonrası. **Gate:** persona nihai metni Fable-sınıfı model yazımı (kalite tavanı korunur).

### 16. Sızıntı-Hijyeni Onboarding'i (AI-Çağı Secret Taraması)
- **Mekanizma:** Phase-1 disiplinimiz ürünleşir: gitleaks SHA-pinli tarama + rotasyon runbook'u + vault kurulumu + "AI chat'e secret yapıştırma" eğitim paketi. Kökeni bizzat yaşadık (ODT sızıntısı → tam rotasyon).
- **Müşteri:** AI araçlarına hızla giren, güvenlik ekibi olmayan KOBİ'ler.
- **Fiziki neden yapamaz:** Pentest firması pahalı ve yavaş; bu dar-kapsam paketi ucuz, hızlı, tekrarlanabilir.
- **Faz:** disiplin HAZIR (1) → paket 10+. **Gate:** müşteri secret'ları HİÇBİR ZAMAN DXB sistemlerine kopyalanmaz; rapor hash/maske ile.

## C. Öncelik matrisi (W1 değerlendirmesi — Fable)

| Sıra | Fırsat | Neden önce |
|---|---|---|
| 1 | #4 Trend-Sinyal | Altyapının %90'ı CANLI (hermes+digest bugün çalıştı); en kısa paraya-çıkış yolu |
| 2 | #5 Loop Retaineri | B1 modülü zaten yapılacak; skorer-garantisi benzersiz satış argümanı |
| 3 | #6 Video→Bilgi | 07-07 CANLI; dashboard girişiyle (8) hemen demo-satılabilir |
| 4 | #3 Rapor ürünü | Yüksek fiyat/marj; Phase-10 research dalgasıyla açılır |
| 5 | #13/#14 (LLM-Ops/Audit) | Kanıtımız üretimde; B2B güven ürünleri, düşük ek maliyet |

> Kapanış kuralı: Bu belge her dalga sonunda güncellenir ve CEO'ya tabloyla sunulur; Phase-10 planlaması bu belgenin FINAL hali olmadan açılamaz (B6 sert kapı).

## D. Kasım 1 videolarından gelir yolları (2026-11-01) — vakti gelince yapılır

> **Ne bu bölüm:** CEO'nun 1 Kasım'da izletip analiz ettirdiği 12 videodan çıkan bütün para yöntemleri; hiçbiri şimdi yapılmıyor, vakti gelince yapılsın diye burada duruyor. Dokuz hat (#17–#25), sonra listesi (#26), hükmünü bekleyenler ve geçmeyenler. Yapım sırası tahtanın yeniden dizilişinde konur; hatların kararları Rapor 2 §8'de (K1–K12, İ1–İ7, P1).
> **Kural (CEO, 2026-11-01):** her hat, temelini kuran tahta satırıyla birlikte kurulur ve tezgâhta denenir; satışa holdingin anahtarı çevrilince açılır. Rapor 2'nin "şimdi deneme" maddeleri bu tezgâh denemesine kaydı. Sahibi olmayan beş hat (H1, H2, H3, H4'ün gelir tarafı, H7) ve gelir motoru tahtada **B83**'te; diğer hatlar kendi satırlarında not olarak durur (B04, B05, B12, B28, B33, B34, B43, B64, C41).
> **Pazar tek ülke değil (CEO, 2026-11-01):** Almanya, Körfez, Avrupa ve her yer; TL rakamları yalnız Türkiye pazarının fiyat çapasıdır.
> **İz — kafası karışan buraya gider:**
> - Rapor: `~/Desktop/Gelir Kaynakları/2 - Gelir üretim hatları ve kararlarınız 2026-11-01.pdf` (kaynağı `W/rapor2.html`)
> - `W` = `.planning/research/watch-links/2026-11-01-gelir/` — hakem kararları `W/MERGE.md` (M#n), video satırları `W/rows/merged.jsonl`, okuyucu analizleri `W/readers/<grup>-<opus|fable>.md`
> - Kısaltma: A avenox · T tilbury · K koerner · S ses · Y yeni; -O opus, -F fable (örn. `T-F 2.2` = `W/readers/tilbury-fable.md` "Yöntem 2.2"). Video linki dakikasıyla verilir. · N nate-herk (`.planning/research/watch-links/2026-11-02-nate-herk/`): `N-O 2.4` = o klasördeki `rapor3.html` §2.4 (satış ve çalışma akışı, gelir) ve `ANALIZ.md` §2.4 (elimizdekiler); PDF `~/Desktop/Gelir Kaynakları/3 - Dört yapay zekâ sistemi (Nate Herk) 2026-11-02.pdf`.
> - Excel: `~/Desktop/İNCELEMELER/Excel-turbo.xlsx`, sayfa "Kasım 1 incelemeleri".

### 17. H1 — Yerel aday siteleri: kendi sitemiz, aylık kira (VARLIK)
- **Mekanizma:** "şehir + hizmet" sitesi kurulur, Google'da üste taşınır, gelen aramalar yerel bir firmaya aylık sabit kirayla yönlendirilir. Site "bağımsız yönlendirme hizmeti" olduğunu açıkça söyler (M#10). Ferrari hâli: keşif istasyonu niş × şehir kombinasyonlarını veriyle puanlar; aramalar kaydedilir, kiracıya aylık "X arama, Y iş" raporu; firma ayrılırsa aramalar bir sonrakine, varlık holdingde.
- **Videodan gelen yöntemler:**
  - Sıralat-kirala (aylık sabit kira) — [xUZYy3hCRUM 02:06](https://www.youtube.com/watch?v=xUZYy3hCRUM&t=126) · Koerner'in 11 $'lık siteleri [JhyVSrQPVSg 24:32](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=1472) · `K-O 3.1`, `K-F`
  - Fiyat seçeneği: arama başına ücret ya da %10 komisyon — [xUZYy3hCRUM 14:33](https://www.youtube.com/watch?v=xUZYy3hCRUM&t=873) · `K-O 3.2` (raporda yok)
- **Helal:** kira ve komisyon geçer; kendini firma gibi gösteren site ve ücretli backlink geçmez (M#10, M#11).
- **Politika riski:** şehir × hizmet çoğaltması Google'ın doorway ve ölçekli içerik politikasına temas eder; sanal adres işletme profili (GBP) alamaz. M#10 açıklaması dürüstlüğü çözer, politika riskini çözmez; sayı büyüdükçe risk büyür — Web deep study, 2026-11-04, file 9 section 6, Ek 1.
- **İlk deneme:** 2 site, İngilizce pazar, helal niş, 90 gün; ~22 $ alan adı, takip numarası, DataForSEO 50 $ (P1).
- **Karar / satırlar:** K3, P1 · **B83**; ayrıca B05 (kira tahsilatı).

### 18. H2 — Niş dizinler, kimsenin elinde olmayan veriyle (VARLIK)
- **Mekanizma:** tek konulu dizin; nişi veri seçer, veri ajanlarla toplanıp her hafta tazelenir (fiyat, saat, Türkçe konuşan personel, helal sertifikası). Holdinge yakışan nişler: Avrupa'da helal restoran/kasap, Almanya'da Türkçe konuşan hekim/avukat, cami etkinlikleri; yanında saf ticari nişler. Dizindeki işletmeler H5 ve H7'nin adayıdır.
- **Videodan gelen yöntemler** (hepsi [-u0JuVUdPQA](https://www.youtube.com/watch?v=-u0JuVUdPQA), `K-O 2.2–2.5`, `K-F V2`):
  - Öne çıkan ilan + aday formu / aday satışı — [10:23](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=623), [17:42](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=1062)
  - Özel veri + 19 $'lık rehber (H3 ile) — [06:19](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=379), [40:35](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=2435)
  - Dizinde görüntülü reklam — [42:39](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=2559) · hüküm İ1
  - Dizinde affiliate — [38:32](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=2312) · hüküm İ3
  - Çıkış: dizini varlık olarak satmak (yıllık gelirin ~3 katı) — [34:21](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=2061) · `K-O 2.5` (raporda yok)
  - Dizin verisini abonelikle satmak (ayda 50 $) — [10:23](https://www.youtube.com/watch?v=-u0JuVUdPQA&t=623) · okuyucular ayrıldı: `K-O 2.3` kamuya açık/izinli veriyse geçer, `K-F V2-D` kişisel veri AB/TR'de geçmez; hakem kararı yok, yapılırsa yalnız kişisel olmayan veriyle.
- **Politika riski:** gerçek ve tazelenen özel veri varsa dizin ayakta durur; yoksa şehir ve hizmet çoğaltması Google'ın doorway politikasına temas eder; sanal adres işletme profili (GBP) alamaz — Web deep study, 2026-11-04, file 9 section 6, Ek 1.
- **İlk deneme:** masa başında 10 niş puanı (0 $, 1 gün), en iyisinde 1 dizin, 90 gün.
- **Karar / satırlar:** K4, İ1, İ3 · **B83**; en yakın REV #1/#4.

### 19. H3 — Dijital ürün atölyesi ve mağaza (VARLIK)
- **Mekanizma:** holdingin her gün ürettiği araştırma ürüne çevrilir: araştırma masası yazar, Sol doğrular, stüdyo tasarlar, 11 dilde çıkar. Satış verisi bir sonraki ürünü seçer; 30 günde satmayan kapanır. Mağaza: Stan (29 $/ay) ya da vergiyi üstlenen mağaza (Lemon Squeezy, Gumroad); vergiyi üstlenen mağaza B05 çözülmeden tahsilatı açar (M#6). CEO'nun 31 Ekim notunun iki maddesi bu hat.
- **Videodan gelen yöntemler** — Stan'in on ürün tipi ekrandan okundu: [LlhTEttKcwQ 27:22](https://www.youtube.com/watch?v=LlhTEttKcwQ&t=1642) · `T-O M8`, `T-F 3.1`:
  - Dijital ürün (oyun kitabı, şablon, Ramazan planlayıcısı; Tilbury'nin 12 $'lık 30 günlük kitabı, 7 günde 23 satış) · Koerner'in 19 $'lık iş planı PDF'i ([JhyVSrQPVSg](https://www.youtube.com/watch?v=JhyVSrQPVSg) açıklaması)
  - Custom Product: ücretli sektör incelemesi, stüdyonun ve web ofisinin kapı açıcısı (Rapor 1 A)
  - Coaching Call: birebir görüşme (31 Ekim notundaki "benim vereceğim hizmet")
  - eCourse ("ajanlarla şirket işletmek"; kanıtsız kurs satılmaz, `K-O 3.3`) · Webinar/etkinlik ([2uyhavEACdo 07:43](https://www.youtube.com/watch?v=2uyhavEACdo&t=463), [hriu0irRcpE 24:46](https://www.youtube.com/watch?v=hriu0irRcpE&t=1486))
  - Recurring Membership: aylık sektör/trend özeti (REV #4); Koerner'in 5 $/ay YouTube üyeliği · `K-O 1.7`
  - Community: ücretli topluluk (Doruk 117 × 59 $ — [oL2xB4DiXEo 18:15](https://www.youtube.com/watch?v=oL2xB4DiXEo&t=1095); Kyle — [xUZYy3hCRUM 38:21](https://www.youtube.com/watch?v=xUZYy3hCRUM&t=2301)) · `Y-O Yöntem 2`; kitle ve vaka olunca
  - Collect Emails: ücretsiz mıknatıs, adayı satış hattına düşürür (Y9)
  - AI Twin: karakterin abonelikli sohbet botu — `T-O` (raporda yok; İ5'e bağlı)
  - URL/Media ve Stan Referral: başkasının ürünü — hüküm İ3
- **İlk deneme:** DxB markasıyla 3 ürün (yerel aday sitesi oyun kitabı, "yapay zekâ çalışanıyla ilk 30 gün", Ramazan planlayıcısı) + bir mağaza hesabı (kimlik adımı, CEO'nun tıkı), 30 gün.
- **Karar / satırlar:** K5, İ3 · atölye ve mağaza **B83**; yüz B43 §4-E, ödeme B05, mağaza W-C42-6, kurs B04.

### 20. H4 — Holdingin kendi kanalları: kanal fabrikası (VARLIK)
- **Mekanizma:** saatle dönen dokuz istasyon: niş istihbaratı (her dilde kanal normalinin 3 katı izlenen videolar) → tarz analizi ve özgün senaryo → kanalın görsel kitabı → yerel kartta gece üretim (0 $) → anlatım → zaman damgasından otomatik montaj → kalite kapısı (ilk 3 video CEO'nun gözüne) → zamanlı yayın → 7. gün ölçümü. Çok dilli ses izi: her dil yeni pazar. Kollar: DxB markalı kanal, yüzsüz niş kanallar, sanal sunucu (B43).
- **Videodan gelen yöntemler:**
  - Kitle, satışın kendisidir: daha kötü ürünü hazır kitlesi olan çok satar; para izlenmeden değil, kitledeki binde bir alıcıdan — [FqsAALrRhj4 18. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1080), 44. dk · `A-O`, `A-F S2`
  - Yüzsüz çizim kanalı üretim hattı (tarz çıkar, özgün senaryo, tek ana istem + referans çizimle 100+ görsel) — [HN_1kEGNu3Y](https://www.youtube.com/watch?v=HN_1kEGNu3Y) · `Y-O`, `Y-F`; zamanlama M#26, canlı tasviri İ7, reklam İ1
  - Sanal karakter / AI influencer (sponsor + ürün) — [LlhTEttKcwQ 01:14](https://www.youtube.com/watch?v=LlhTEttKcwQ&t=74), [ytAW1_g2IfI 18:53](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=1133) · `T-O`, `T-F 2.6`; etiket İ5 (M#17)
  - Marka anlaşması / helal sponsor — [LlhTEttKcwQ 23:16](https://www.youtube.com/watch?v=LlhTEttKcwQ&t=1396), [OxQ47jXQApk 19:57](https://www.youtube.com/watch?v=OxQ47jXQApk&t=1197) · `T-F 3.3`
  - Kişisel marka zinciri (reklam → marka anlaşması → kendi ürünü) — [OxQ47jXQApk 19:57](https://www.youtube.com/watch?v=OxQ47jXQApk&t=1197) · `Y-F Y12`
  - Niş istihbarat motorunu (outlier puanı) veri aboneliği olarak satmak — [HN_1kEGNu3Y 01:27](https://www.youtube.com/watch?v=HN_1kEGNu3Y&t=87) · `Y-O` "ileride" (raporda yok; REV #4 ile)
- **Zaman:** 1 Şubat 2027'den sonra YouTube programına giriş 8.000 izlenme saati (bugün 4.000); önce giren etkilenmez (`.planning/research/R5-youtube-ai-rules-and-risks.md` satır 13).
- **İlk deneme:** kanal açmadan tek pilot video (8 dk, İngilizce eğitim ya da tarih), uçtan uca fabrikadan, 0 $, 1 hafta.
- **Karar / satırlar:** K6, K8, İ1, İ5, İ7 · gelir tarafı (`content_monetization` motoru) **B83**; üretim B43 (beş kararı 25 Eylül'den beri bekliyor), kart B33, anlatım B12; B28, C41. K6: kanal konuşması sonra (CEO, 2026-11-01).

### 21. H5 — Web ofisi: premium site + aylık bakım + dışa ulaşma makinesi (HİZMET)
- **Mekanizma:** DxB Web Studio (adı CEO'nun sözü, 2026-11-02; plan konuşması `~/Desktop/DxB Global Web-Studio/`). Hat ancak aylık bakım + ölçüm raporu paketiyle ve orta boy müşteriyle yaşar; yerel işletme tek seferlik siteye birkaç yüz dolar öder.
- **Videodan gelen yöntemler:**
  - Landing page + aylık optimizasyon — [ytAW1_g2IfI 07:30](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=450) · `T-O M3`, `T-F 2.3`; REV #5
  - Yerel site yenileme (TL çapası 10–20 bin ₺) — [hriu0irRcpE 13:46](https://www.youtube.com/watch?v=hriu0irRcpE&t=826), [oL2xB4DiXEo 06:05](https://www.youtube.com/watch?v=oL2xB4DiXEo&t=365) · `T-O M12`, `T-F 4.4`, `Y-F Y2`
  - Dışa ulaşma makinesi: haritada 4+ yıldız, 50+ yorum, randevu linki yok → 1–10 puanlı denetim → kişiye özel video → firmaya özel demo — [JhyVSrQPVSg 30:27](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=1827) · `K-O 1.5`; sahte talep formu ve kişisel telefon çıkarıldı
  - Bekleyen fırsat: WordPress site yenileme (K10)
- **Web derin çalışmasından gelen yöntemler** (kaynak: Web deep study, 2026-11-04, file 9 section 5 — `~/Desktop/DxB Global Web-Studio/9 - Web işi derin çalışma 2026-11-04.md`; rakamlar çoğunlukla satıcı sayfasıdır, müşteri ödemesi ölçümü değil, gösterge olarak okunur):
  - **Kampanya mikrositesi:** lüksün kapısı; dükkânı marka kendisi işletir. Tek 3B anlı marka sitesi 20–50 bin $, hikâyeli 3B 50–100 bin $ · Ek 6 §7
  - **Teknik SEO denetimi:** kapı açıcı; ortalama 700–1.000 $ · §5
  - **Taşıma güvencesi:** fiyat kaynağı bulunamadı; 892 alan adı taşımasında ortalama toparlanma 523 gün (üçüncü taraf tahmini veri), müşteri korkusu gerçek · Ek 1
  - **Aylık SEO:** en sık 501–2.000 $ (Ek 1 §7'de en yaygın dilim 501–1.000 $, %20,4) · Ek 1 §7
  - **Yapay zekâ görünürlük denetimi ve aylık ölçüm:** 1.500–5.000 $ bir kerelik, aylık 3.000 $'dan. Satılmaz: llms.txt, sıra garantisi, sayfa adedi · Ek 2 §7
  - **Ölçüm denetimi, kurulum, aylık bakım:** bu sırayla; sGTM kurulumu 4.500–12.000 $ · Ek 4 §7
  - **Reklam yönetimi ve kreatif:** harcamanın %10–20'si; stüdyo kreatifi ucuzlatır, tek müşteriden iki gelir; haram kategori müşterisi alınmaz · Ek 4 §7; kreatif tarafı REV #2, H6 (#22)
  - **Elle erişilebilirlik denetimi:** küçük site 1.250–2.750 $; mahkemeler ciddi: Carrefour kararı, ABD'de 3.117 dava · Ek 5
  - **Bülten, PR ve bağlantı hizmeti (B84 karar 15):** müşterinin sitesinde aylık bülten, dijital PR ve öteki bağlantı yolları aylık ücretli hizmetin parçası; holdingin 25-30 sitesi bültenlerinde müşterilerine ücretsiz bağlantı verir, jesttir <!-- CEO-OK: b84-own-sites-link-to-clients-2026-11-04 -->. Dijital PR piyasası bağlantı başına ~597 $ (satıcı) · Ek 1
  - **Kelime ve pazar konumu çalışması (B84):** müşterinin müşterisi ne arıyor, rakip nerede; sayfa ve içerik planına, bülten konularına, teklife ve aylık rapora girer, aylık SEO'nun parçasıdır · dosya 10
  - **Holdingin kendi gösteri işi:** Lusion ve OFF+BRAND büyük müşteriyi kendi deney işleriyle aldı; holdingin müşterisiz bir gösteri işi olur, gerçek jüriye gitmesi "birinciliğe aday" sözünü ilk kez dışarıdan ölçer. Başvuru ücreti para çıkışıdır, CEO'nun kapısında <!-- CEO-OK: b84-web-study-nine-decisions-2026-11-04 --> · §5, Ek 6
  - Zaten bu hatta, yeniden yazılmadı: kurumsal ve landing site (özel tek sayfa 3–5 bin $; Framer/Webflow hareketli 12–40 bin $) → yukarıdaki landing yöntemi, REV #5; aylık bakım (89–359 $, üst kademe 499–1.500 $; değer geri yükleme denemesi, saha hızı, rıza ve erişilebilirlik taramasında) → hattın Mekanizması · §5, Ek 5
- **Tarz dolabı (CEO, 2026-11-02 <!-- CEO-OK: web-studio-style-cupboard-precision-2026-11-02 -->):** varsayılan ev tarzı (gösterişli, lüks, wow); ilk ek kart Precision, yalnız müşteri ya da CEO kendi sözüyle isteyince açılır; müşteri "şu site gibi" derse o siteden yeni kart çıkar — `.planning/quick/20261102-tarz-dolabi/DESIGN.md`.
- **Karar / satırlar:** web ofisinin beş sorusu, Y9, Y11, İ6, K10 · B64, B84.

### 22. H6 — Stüdyo ajansı + uzun videodan aylık kısa paket + yazı kolu (HİZMET)
- **Mekanizma:** B28'in ajans koltuğu (pazaryeri değil). Müşteriye görsel, video ve yazı içerik; aylık tekrarlayan paketler.
- **Videodan gelen yöntemler:**
  - Uzun videodan aylık kısa paket: webinar/podcast'ten ayda 10–15 dikey klip (OpenShorts) — [GZtLsvklYBI 19:30](https://www.youtube.com/watch?v=GZtLsvklYBI&t=1170) · `S-O`, `S-F`; K7
  - **Hayalet yazarlık:** müşterinin sesiyle LinkedIn, bülten, reklam metni (Claude Projects + araştırma + Typefully/Kit); müşteri kendi adıyla yayınladığını bilerek alır — [ytAW1_g2IfI 03:49](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=229) · `T-F 2.2` (tam blok; `T-O M2`'nin "M9 ile aynı" notu yanlış yer gösterir). Rapor 2'de yalnız adı geçer. Hat: aday bulma (Y9) → yazı örneği (ilk temas CEO onayından) → sözleşme → haftalık tarama, taslak, Sol, müşteri onayı, yayın → aylık ölçüm raporu. İlk deneme: holdingin kendi hesapları (Y11) için 2 hafta, haftada 3 LinkedIn + 1 bülten, <20 $/hafta.
  - **İçerik dönüştürme:** müşterinin podcast/videosu → bülten, gönderiler, kısa video senaryoları; Gadzhi'nin A seviyesi — [hriu0irRcpE 05:00](https://www.youtube.com/watch?v=hriu0irRcpE&t=300) · `T-O M10`, `T-F 4.2`; REV #2/#6. Rapor 2'de yalnız adı geçer. İlk deneme: holdingin kendi uzun içeriğinden 1 bülten + 3 gönderi + 2 senaryo, 1 gün, <5 $.
  - Emlak ilan görseli ve gezinti videosu (olmayan özellik eklenmez) — [hriu0irRcpE 00:51](https://www.youtube.com/watch?v=hriu0irRcpE&t=51) · `T-O M9`, `T-F 4.1`; ücretsiz örnek İ6
  - Yapay zekâ reklam filmi: yapay olduğu belli sunucu; sahte "kullandım, bayıldım" tanıklığı geçmez — [hriu0irRcpE 17:48](https://www.youtube.com/watch?v=hriu0irRcpE&t=1068), [FqsAALrRhj4 10. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=600) · `T-O M13`; etiket İ5
  - Müşteriye sponsorlu içerik biçimi ("içeriğime karışma") — [FqsAALrRhj4 26. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1560) · `A-O`, `A-F #10` (raporda yok)
  - Higgsfield "kendini film karakteriyle değiştir" kalıbı — [FqsAALrRhj4 20. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1200) · `A-F #8` (raporda yok)
  - **Üretici işletim sistemi (Creator OS):** ürünü kanıtlı koçun sesiyle haftalık içerik; 20–30 gönderisinden ses profili, 3 örnek parça (İ6'nın yazı örneği), beğenirse bir platform bir ay, sonra tam kurulum + aylık ücret. Müşterinin klon sesi ve görüntüsüyle video yalnız yazılı rızayla ve K8 hükmünden sonra (H8); kadın müşterinin kendi görüntüsüyle kendi içeriği kadro kanununun 15 Eylül ekine girer mi, hüküm onda (video kolu açılacağı gün sorulur). Charles ~3.600 $ + ayda 197 $ aldı — [BQJRLZ2q_Ns 04:42](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=282), satış [06:12](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=372) · `N-O 2.3`; müşterinin rehberi H3, sitesi H5. İlk deneme: H6'nın denemesine 0 $'lık ses profili kör testi eklenir (Sol gerçek ve üretilmiş parçayı ayırmaya çalışır).
- **Karar / satırlar:** K7, İ5, İ6 · B28, B43, REV #2/#6, B64.

### 23. H7 — "Sonuç gelirse öde" ön büro (HİZMET)
- **Mekanizma:** kendi CRM'imiz, WhatsApp Business ve politika sınırlı ajan: politika dışında kendi başına cevap vermez, her konuşma kayıtlı, ay sonunda müşteriyle mutabakat. Sesli resepsiyonist B12'de ses hızlanınca eklenir.
- **Videodan gelen yöntemler:**
  - Yapay zekâ resepsiyonist (telefonu açar, randevu alır) — [ytAW1_g2IfI 14:25](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=865), demo [JhyVSrQPVSg 30:27](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=1827) · `T-O M5`, `T-F 2.5`; REV #7/#12
  - Ölü aday canlandırma, randevu başına ücret — [hriu0irRcpE 09:55](https://www.youtube.com/watch?v=hriu0irRcpE&t=595), Avenox C [FqsAALrRhj4 56. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=3360) · `T-O`, `T-F`; ücret biçimi İ4 (M#16)
  - Müşteri destek botu — [hriu0irRcpE 21:23](https://www.youtube.com/watch?v=hriu0irRcpE&t=1283) · `T-O M14`, `T-F 4.6`; REV #7
  - Bekleyen fırsat: B2B randevu ayarlama (K10)
  - Sesli dikey platform (ör. emlak), dakika başı ücret — [oL2xB4DiXEo 06:05](https://www.youtube.com/watch?v=oL2xB4DiXEo&t=365) · `Y-O`, `Y-F Y2`; B12'deki gecikme çözülmeden satılmaz (raporda yok; REV #12)
  - **Başvuru → ödeme → form → randevu zinciri:** ilgi formu CRM'e düşer; SMS ve e-postayla ödeme bağlantısı; ödeyince başvuru formu ve feragatname imzalanana kadar hatırlatmayla; sonra randevu bağlantısı ve takip. Alıcı: randevuyla çalışan, adayı formdan ya da telefondan gelip bekleyen, sahibi elle kovalayan işletme (talep kısıtlı). Satış: "geçen ay kaç form, kaç ödeme?"; akış tek sayfada çizilir, insan isteyen adım işaretlenir. Lewis 2.200 $ aldı, aynı müşteri 6.000 $'lık ikinci işi verdi; İ4'ün paketine (sabit ücret + randevu başına ücret) ikinci örnek. Ödeme bağlantısında taksit ve "sonra öde" kapalı, gecikme cezası yazılmaz. Gönderi kolu H6 hayalet yazarlık — [BQJRLZ2q_Ns 02:11](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=131), alıcı [03:30](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=210) · `N-O 2.2`; B05 (ödeme, imza, e-posta)
- **İlk deneme:** inşaat motorunda 40 sahte başvuru → CRM → yerel posta tuzağına takip e-postası ve sahte ödeme bağlantısı → randevu; kaçan aday sayısı ölçülür (kabul 0); 0 $, 1 gün. Gerçek ödeme ve imza B05'le — `N-O 2.2`.
- **Karar / satırlar:** K10, İ4 · **B83** (müşteriye kurulan ön büro), B64 (kurulum ve bakım işlerinin holding içindeki yönlendirmesi), B12, B05.

### 24. H8 — Yerelleştirme ve dublaj (HİZMET)
- **Mekanizma:** tek ürün, "kanalınız 11 dilde": konuşmacı ayırma, çeviri, klon sesi zamana oturtma, vokal ayırma, her dilde geri-transkript doğruluk ölçümü; müşterinin kendi sesi yazılı rızasıyla. Ses: Voice Studio ve Voicebox ikisi de sistemde, duruma göre biri, biri olmazsa öteki; ElevenLabs ücretli yedek (B12, VOICE_INTERACTION_SPEC §3.2).
- **Videodan gelen yöntemler:**
  - İçerik üreticisine dublaj: Avenox'un kendisi alıcı — [FqsAALrRhj4 56. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=3360) · `A-O`, `A-F`
  - Reklam filminin 11 dil sürümü — [GZtLsvklYBI](https://www.youtube.com/watch?v=GZtLsvklYBI) · `S-F §5 #3`
  - Rızalı ses klonu ve tasarlanmış marka sesi — [GZtLsvklYBI 01:41](https://www.youtube.com/watch?v=GZtLsvklYBI&t=101) · `S-O §4`, `S-F §4`; `voice_identities`'te rıza alanı yok
- **İlk deneme:** iki stüdyonun motorları kör dinlemede (Türkçe, Körfez Arapçası, İngilizce), 0 $, yarım gün.
- **Karar / satırlar:** K8 (4 Eylül "videoda yapay ses yok" hükmü bu hat için açılsın mı) · B12, B43, B28 3.7.

### 25. H9 — Dijital kadro kurulumu, eğitim ve danışmanlık (HİZMET)
- **Mekanizma:** beş istasyon: ücretli keşif raporu (kapı açıcı) → kadro tasarımı (persona fabrikasından 3–5 çalışan) → kurulum (müşterinin sunucusuna yerel model ya da bizim motorumuz) → 30 gün devir ve eğitim → aylık bakım. Satılan şey holdingin kendi düzeni; kanıtı holdingin kendisi.
- **Videodan gelen yöntemler:**
  - Ajan kurulumu + aylık bakım; "50 $'lık yazılımı 500 $'lık hizmet olarak sat" — [FqsAALrRhj4 58. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=3480), [oL2xB4DiXEo 02:43](https://www.youtube.com/watch?v=oL2xB4DiXEo&t=163) · `Y-O`, `Y-F Y1`; REV #15, #9; M#28 → K12
  - **Sahadan sesli not → imzaya hazır belge:** işçibaşı WhatsApp'tan kendi dilinde konuşur; kayıt yazıya döner, işin kaydıyla eşleşir, firmanın kendi formunda markalı PDF taslak olur, sorumlu imzalar. Eksik alan uydurulmaz, işçibaşına kendi dilinde geri sorulur; özgün ses kanıt olarak saklanır. Satış: "ekibiniz en çok hangi belgeden nefret ediyor?" — önce o tek belge, sonra sıradaki. Fark müşterinin kendi formu ve sistemi, yeni uygulama yok, çok dilli ekip (Türkçe, Urduca, Arapça konuşan işçibaşı → Almanca ya da İngilizce belge). Jody 4.500 £ (~6.000 $) tek seferlik aldı — [BQJRLZ2q_Ns 00:22](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=22), satış [01:07](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=67), tek belge [02:01](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=121) · `N-O 2.1`; REV #12. Kulak B12, çıkarım B34, WhatsApp kapısı H7 ile (B83).
  - Yerinde yerel model ("veriniz sizde kalır"; sağlık, telekom, sanayi) — [oL2xB4DiXEo 08:24](https://www.youtube.com/watch?v=oL2xB4DiXEo&t=504) · `Y-O Yöntem 1`, `Y-F Y3`
  - Ücretli keşif / veri egemenliği denetimi — `oL2xB4DiXEo` · Avenox D
  - Özel eğitilmiş uzman modeli API olarak kiralamak (kurulumun içinde; GPU kiralama hayır) — [oL2xB4DiXEo](https://www.youtube.com/watch?v=oL2xB4DiXEo) 12–13. dk · `Y-F Y3` (raporda yok; B34)
  - **Kurumsal "ikinci beyin" / şirket beyni:** şirketin belgesi, süreci, müşteri geçmişi tek beyinde; herkes sorar, kaynaklı cevap alır; üstüne rol bazlı günlük brifing, toplantı dökümünü dosyalama, her yeni aday için araştırma özeti. Tek temel bir kez kurulur, müşteri başına bağlayıcılar ve yetki haritası; kabul testi müşterinin her hafta sorduğu 20 soru. Holdingin kendi V2 hafızası (tahta Bölüm 2d) hem ürün hem kanıt. Claude'un kendi bağlayıcıları "bağla ve sor"u sıradanlaştırdı; satılan düzen, yetki, dayanak denetimi, yerinde model ve aylık bakım. Jeanette aynı temeli 17 kez 15.000 $'a sattı, 9'u aylık planda; Kieren müşteriye özel 2.000 $, Haziran'dan beri ~137 bin $, bir şirketten 30 kurulum — holdingin fabrikası tek temel yoluna uyar — [FqsAALrRhj4 32. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1920) · `A-O` (raporda yok); [BQJRLZ2q_Ns 06:31](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=391), fiyatlar [08:37](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=517) · `N-O 2.4`; REV #9
  - **Ücretli keşfin ilk sorusu — talep mi kısıtlı, arz mı:** daha çok müşteri isteyene içerik ve başvuru hunisi (H6, H7); işi zaten taşıyana aday göndermek yük, ona sesli not → belge ve şirket beyni — [BQJRLZ2q_Ns 10:08](https://www.youtube.com/watch?v=BQJRLZ2q_Ns&t=608) · `N-O 3`
  - Bekleyen fırsatlar: yapay zekâ danışmanlığı, GDPR denetimi, sunum tasarımı (K10)
- **İlk deneme:** holdingin kendi kurulumu dış gözle paket (kılavuz + fiyat sayfası); yerel tezgâhta tek demo: Türkçe çağrı kaydı → özet → CRM notu; 0 $, 1 hafta. Ek (BQJRLZ2q_Ns): sesli not → form → PDF tezgâhı (yerel kulak ve yerel model, 0 $, yarım gün) ve holdingin kendi külliyatında 20 soruluk şirket beyni ölçümü (0 $, 1–2 gün; V2 hafızasının kabul testiyle aynı) — `N-O 2.1`, `N-O 2.4`.
- **Karar / satırlar:** K10, K12 · B64 ("kurulum" iş tipi), B33/B34, B04, B12 (sahadan sesli notun kulağı), V2 hafıza satırı (tahta Bölüm 2d; şirket beyni).

### 26. Sonra listesi — vakti daha uzak
- **Kendi ürün markası** (stoklu, malın sahibi olarak; önce bekleme listesi, Kickstarter ön satışı) — [OxQ47jXQApk 04:34](https://www.youtube.com/watch?v=OxQ47jXQApk&t=274) · `Y-O Yöntem A`, `Y-F Y7`. Neden sonra: sermaye sınırı 0, kitle yok; kanal hattından sonra.
- **Emlak fırsat masası** (piyasanın altındaki ilanı yatırımcıya bulma ücreti) — [OxQ47jXQApk 15:23](https://www.youtube.com/watch?v=OxQ47jXQApk&t=923) · `Y-O`, `Y-F`; M#22. Neden sonra: yatırımcı ağı ve aracılık kaydı ister; Körfez ev sahası olarak.
- **Konsinye ve ölü stok satışı** — [JhyVSrQPVSg 14:12](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=852), [OxQ47jXQApk 08:15](https://www.youtube.com/watch?v=OxQ47jXQApk&t=495) · `K-O 1.2`, `K-F V1-B`. Neden sonra: fiziksel eşya ister, ölçeğe küçük.
- **Teklif toplama ajanı** — [JhyVSrQPVSg 01:50](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=110) · `K-O 1.1`, `K-F V1-A`. İki biçimi var: holdingin kendi alımlarında tasarruf; ve müşteri adına teklif toplama danışmanlığı, %3–6 ya da sabit ücretle. Neden sonra: müşteri ağı ve sektör bilgisi ister.
- **Yapay zekâ ile uygulama / SaaS** — [ytAW1_g2IfI 22:29](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=1349), [FqsAALrRhj4 28. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=1680) · `T-O M7`, `T-F 2.7`; Rapor 1 E. Ajanı ürünleştirmek (tazminat bulucu, telefonla hatırlatıcı) — [JhyVSrQPVSg 38:31](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=2311) · `K-O 1.6`.

### Kaynak kanallar — vakti gelince ekip tarar
- **The Koerner Office — Chris Koerner** · <https://www.youtube.com/@thekoerneroffice/videos> · CEO, 2026-11-02: *"Bu linkin sahibi kayda geçsin. Bu adamda farklı gelir kaynakları elde etme gelir üretmeyle ilgili videoları var. … Daha sonra vakti gelince not olarak tahtaya yazılsın ilgili satıra. Buradan istifade edilsin. Ekip çalıştırılsın."* Okunanlar (1 Kasım): JhyVSrQPVSg, -u0JuVUdPQA, xUZYy3hCRUM (`K-O`, `K-F`). Kanalın geri kalanı okunmadı; 2 Kasım'da son 40 videonun başlığı alındı, çoğu podcast bölümü ve aynı bölümün "[NO ADS]" ikizi var (ikizler bir kez okunur). Vakti gelince bir ekip videoları izler; çıkan her yöntem bu bölüme kaynak iziyle yazılır ve ilgili hattın satırına bağlanır (B83).

### Rapor 2 §8 hükümleri (CEO, 2026-11-02) <!-- CEO-OK: rapor2-decisions-his-yes-and-rulings-2026-11-02 -->
- **K2** ekrandaki ana sayı net kâr (gelir − maliyet defteri), yanında aylık tekrarlayan gelir. **K9** Rapor 2 §1'in itici güç, misyon, vizyon ve ilke cümleleri holdingin cümlesidir. **K10** 26 Temmuz'un 5 fırsatı şimdilik helal sayılır; hepsini tek tek incelemedi, her biri önüne geldiğinde yeniden konuşulur; veritabanında o zamana kadar `pending` kalır. Hatlara bağlı (WordPress site → H5; B2B randevu → H7; yapay zekâ danışmanlığı, GDPR denetimi, sunum tasarımı → H9 ve H5). **K11** B05 ikinci dalgadan önce çözülür.
- **İ1** uzun videoda kategori engelleriyle reklam evet; Shorts ve dizin görüntülü reklamı hayır. **İ2** dropshipping şimdilik hayır ([ytAW1_g2IfI 11:02](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=662), [JhyVSrQPVSg 19:02](https://www.youtube.com/watch?v=JhyVSrQPVSg&t=1142)). **İ3** affiliate yalnız onun tek tek onayladığı helal ürün ([FqsAALrRhj4 42. dk](https://www.youtube.com/watch?v=FqsAALrRhj4&t=2520), [LlhTEttKcwQ 24:16](https://www.youtube.com/watch?v=LlhTEttKcwQ&t=1456)). **İ6** ücretsiz deneme videosu yok; yazı örneği, 37 $'lık örnek site ve en çok 5 iyileştirilmiş fotoğraf serbest.
- **İ5 (onun hükmü)** şimdilik hiçbir yerde yapay zekâ etiketi yok; işin yapay zekâyla yapıldığı CEO'ya ve şirkete özel kalır; gerektiğinde, sorulduğunda ya da iş gerektirdiğinde holding kendisi ekler. Hukuk tarafı işe başlanınca araştırılır. Sahte tanıklık, uydurma uzmanlık ve sağlık iddiası yine geçmez.
- **İ7 (onun hükmü)** kanal fabrikasında çizgi insan ve hayvan karakterine şimdilik sınır yok; müstehcen hiçbir şey yok (çıplaklık, dekolte, açık giyimli kadın tasviri). Çizilen canlı tasvirinin İslami sorusunu kendisi sonra araştırır.
- **İ4** paket olarak sunulur: sabit ücret + randevu başına ücret; neyin randevu sayıldığı sözleşmede yazılı. Kaynak yöntem (Gadzhi, [hriu0irRcpE 09:55](https://www.youtube.com/watch?v=hriu0irRcpE&t=595)): yalnız alınan ve gelinen randevu başına 50 $ – birkaç yüz $, kişi gelmezse ücret yok. Paketin içeriği ve fiyatı hattın tezgâh denemesinde konur (B83).
- **Açık:** K8 sesleri dinledikten sonra onun kulağıyla.

### Geçmeyenler — tekrar önerilmez
Klip pazaryeri (Content Rewards: kripto kumar ve müstehcen kampanyalar; [ytAW1_g2IfI 00:27](https://www.youtube.com/watch?v=ytAW1_g2IfI&t=27), `T-O M1`) · borsa, kripto, faizli krediyle mağaza, ticari gayrimenkul (`Y-F Y9`, `A-F`) · müstehcen dizinler · ücretli backlink (M#11) · kendini firma gibi gösteren site ve sahte işletme profili (M#10) · sahte tanıklıklı reklam (`T-O M13`, `T-F 2.6`) · sağlık iddialı karakter ürünü · ünlü/rakip sesinin klonu (`S-F §4.1`) · dışa ulaşmada sahte talep formu ve kişisel telefon (`K-O 1.5`) · müzik (18 Ekim hükmü, M#7).
