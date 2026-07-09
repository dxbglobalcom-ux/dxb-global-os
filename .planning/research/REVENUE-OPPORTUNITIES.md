# REVENUE-OPPORTUNITIES — Külliyattan Gelir Yapıları

> CEO Direktifi B6 ana çıktısı. Soru: *"Bu kütüphaneyle DXB içinde AYRICA neler yapılabilir — gerçek müşteri, gerçek kârlılık; fiziki şirketin yapamayacağı/yavaş kalacağı kazançlar hangi yapılar kurulursa mümkün?"*
> Format (her fırsat): **Mekanizma** (ne kurulur, hangi kaynaklar birleşir) · **Müşteri/ödeyen** · **Fiziki şirket neden yapamaz** · **Faz** · **Gate'ler**.
> Durum: **W1 — 12 fırsat + 4 Fable ek önerisi (2026-07-09). Her dalga sonunda güncellenir, CEO'ya sunulur.**

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
