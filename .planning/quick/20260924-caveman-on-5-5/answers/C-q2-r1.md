# Risk

| Risk | Nasıl olur | Etki |
|---|---|---|
| Yanlış alıcı | Template/mapping hatası, A müşterisinin raporu B'ye gider | Veri sızıntısı, KVKK/GDPR ihlali, güven kaybı |
| Yanlış/bayat veri | Pipeline yarıda kalır, eski cache, boş sorgu | Müşteri yanlış karar alır, itibar |
| Toplu hata | Tek template bug'ı tüm müşterilere aynı anda | Hasar çarpanlı, geri alınamaz |
| Hassas içerik | İç not, fiyat, marj, başka müşteri adı rapora sızar | Ticari kayıp, sözleşme sorunu |
| İstenmeyen taahhüt | Serbest metin alanında söz, tarih, indirim | Hukuki bağlayıcılık |
| Sessiz bozulma | Kimse bakmaz, hata haftalarca sürer | Geç fark edilir |
| Sorumluluk boşluğu | "CEO onaylamadı, kim sorumlu?" | Olay sonrası kaos |

**Dikkat:** E-posta gönderimi geri alınamaz. Asıl risk tek yanlış rapor değil, otomasyonun aynı hatayı herkese aynı anda göndermesi.

# Önlem

Temel ilke: **CEO her raporu değil, süreci onaylar.** Template, alıcı listesi ve kurallar değişince onay gerekir. Her gönderimde gerekmez.

**1. "Rutin" tanımını kilitle**
- Rutin sayılması için rapor onaylı template'ten üretilmeli, serbest metin alanı olmamalı, alıcı onaylı listede olmalı.
- Bu kalıbın dışına çıkan rapor otomatik olarak onaya düşer.

**2. Gönderim öncesi otomatik kontroller (hard gate)**
- Alıcı whitelist: her müşteri için sabit alıcı listesi tutulur, domain eşleşmesi kontrol edilir.
- Cross-client check: raporda başka müşteri ID/adı geçerse gönderim bloklanır.
- Veri tazeliği: `data_timestamp` eşik değerden eskiyse bloklanır.
- Anomali: önceki döneme göre ±%X sapma, boş tablo veya NaN varsa eskalasyon yapılır.
- Hassas terim taraması: "iç", "marj", "maliyet", "taslak", "TODO" gibi ifadeler aranır.

**3. Risk bazlı yönlendirme**
- Temiz rapor otomatik gider.
- Anomali varsa ops sorumlusu onaylar, CEO onaylamaz.
- Yeni müşteri, template değişikliği veya ilk gönderim varsa CEO onaylar.

**4. Bekleme penceresi (veto hakkı)**
- Rapor örneğin 2 saat staging'de bekler.
- CEO'ya tek bir özet mesaj gider: "Bugün 14 rapor gidecek, 1 tanesi flag'li." CEO sessiz kalırsa raporlar gönderilir, isterse durdurur.
- Hız korunur, kontrol kaybedilmez.

**5. Canary gönderim**
- Önce iç adrese gönderilir, render ve ek kontrolü yapılır, ardından müşteriye gider.
- Template değişikliğinden sonraki ilk turda zorunlu tutulmalı.

**6. Kill switch ve audit log**
- Tek flag ile tüm gönderim durdurulabilmeli.
- Her gönderim loglanır: kim, ne, kime, hangi veri versiyonu, hangi kontrollerden geçti.

**7. Sonradan örnekleme**
- Haftada rastgele %5-10 rapor bir insan tarafından incelenir. Sessiz bozulma böyle yakalanır.

**8. Sorumlu ve olay prosedürü**
- Yazılı RACI: her rapor tipi için kimin sahip olduğu belli olmalı.
- Yanlış gönderimde prosedür hazır olmalı: müşteriyi bilgilendirme, düzeltme mesajı, gerekiyorsa KVKK bildirimi (72 saat).

# Öncelik

En yüksek getiriyi sağlayan üç adım: **alıcı whitelist + cross-client check + bekleme penceresi**. Veri sızıntısı riskinin çoğunu bu üçü kapatır.

Rapor pipeline'ı `vps/provision` altındaysa göster. Bu kontrolleri gönderim adımına gate olarak ekleyebilirim.
