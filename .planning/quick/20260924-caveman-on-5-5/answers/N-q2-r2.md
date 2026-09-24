# CEO onayı olmadan giden rutin raporların riskleri ve önlemleri

Hedef CEO'yu süreçten tamamen çıkarmak değil, sadece gerçekten gereken yerlerde devreye sokmak olmalı. Rutin raporların çoğu otomatik gidebilir. Asıl risk, istisnai durumların da fark edilmeden aynı yoldan gitmesidir.

## Başlıca riskler

| Risk | Örnek | Sonuç |
|---|---|---|
| **Yanlış alıcı** | A müşterisinin raporu B'ye gider | KVKK/GDPR ihlali, sözleşme ihlali, ciddi güven kaybı |
| **Hatalı veri** | Eski veri, boş kaynak, hesaplama hatası, sıfır ya da uçuk rakamlar | Müşteri yanlış karar alır, itibar zarar görür |
| **İç bilgi sızması** | Marj, maliyet, iç notlar, başka müşteri adları, debug çıktısı | Ticari ve pazarlık gücü kaybı |
| **Bağlamsız kötü haber** | Performans düşüşü açıklamasız gider | Müşteri ilişkisi zedelenir, CEO habersiz yakalanır |
| **İstenmeyen taahhüt** | Özellikle LLM üretimli metinde "garanti ediyoruz" gibi ifadeler | Hukuki bağlayıcılık riski |
| **Otomasyon arızası** | Çift gönderim, boş rapor, `{{client_name}}` gibi doldurulmamış şablon değişkenleri, döngüyle spam | Profesyonellik kaybı |
| **Görünürlük ve hesap verebilirlik kaybı** | Kimin neyi ne zaman gönderdiği bilinmez | Sorun anında iz sürülemez |

## Önlemler

### 1. Risk tabanlı onay
Her raporu onaya sokmak yerine sınıflandırın:
- **Otomatik gider:** Tüm kontrollerden geçen, alıcısı doğrulanmış, sapması eşik altında kalan standart şablonlar.
- **Onaya düşer:** Anomali tespit edilenler, yeni müşteriler, yeni şablonlar, kötü performans içerenler, serbest metin veya LLM içeriği taşıyanlar.

### 2. Gönderim öncesi otomatik kontroller
- **Alıcı doğrulama:** Rapordaki `client_id` ile alıcı e-posta domain'i eşleşmeli ve alıcı müşteri bazlı bir allowlist'te olmalı. En kritik kontrol budur.
- **Veri sağlığı:** Veri tazeliği (son güncelleme zamanı), boş/NaN/sıfır kontrolü, önceki döneme göre sapma eşiği (ör. ±%30 üstü sapma onaya düşer).
- **İçerik taraması:** Doldurulmamış şablon değişkenleri, yasaklı kelimeler (`internal`, `marj`, `maliyet`, `TODO`), başka müşteri adları.
- **LLM içeriği varsa:** Metindeki rakamlar kaynak veriyle çapraz doğrulanmalı. Taahhüt içeren ifadeler işaretlenmeli.
- **Idempotency:** Aynı rapor ve dönem için ikinci gönderim engellenmeli.

### 3. Veto penceresi (sessiz onay)
Rapor hazırlanır ve CEO'ya veya hesap yöneticisine tek satırlık bir özet gider: "X müşterisine yarın 09:00'da gidecek, önizleme linki". Belirlenen süre içinde itiraz gelmezse rapor otomatik gönderilir. Böylece darboğaz ortadan kalkar ama görünürlük korunur.

### 4. Kademeli güven
Yeni bir müşteri veya şablon için ilk 3–5 rapor manuel onayla gider. Bunlar hatasız giderse otomatiğe alınır. Herhangi bir hata olursa o müşteri/şablon otomatik olarak yeniden manuel onaya döner.

### 5. Yetki devri
Onay CEO'da toplanmak zorunda değil. Müşteri bazında sorumlu bir hesap yöneticisi atanabilir. CEO yalnızca eskalasyonları görür.

### 6. Görünürlük ve denetim izi
- Gönderilen her rapor şu bilgilerle arşivlenmeli: hangi sürüm, kime, ne zaman, hangi kontrollerden geçti.
- CEO'ya haftalık özet: "Bu hafta 42 rapor gitti, 3'ü onaya düştü, 1'i durduruldu."

### 7. Acil durdurma ve geri çağırma
- **Kill switch:** Tüm otomatik gönderimleri tek komut veya tek tıkla durdurma imkânı.
- **Hazır düzeltme şablonu:** Yanlış gönderim olduğunda müşteriye hızlıca gönderilecek bir metin.
- **Veri ihlali prosedürü:** Yanlış alıcıya kişisel veri gitmişse KVKK kapsamında Kurul'a 72 saat içinde bildirim yükümlülüğü doğabilir. Kimin neyi yapacağı önceden yazılı olmalı.

### 8. Yazılı politika
Hangi rapor tiplerinin otomatik, hangilerinin onaylı gideceği, eşik değerleri ve sorumlular tek sayfalık bir dokümanda netleştirilmeli.

## Önerilen akış

```
Rapor üretildi
   → Otomatik kontroller (alıcı, veri, içerik, idempotency)
       ├─ Başarısız / anomali → Onay kuyruğu (hesap yöneticisi / CEO)
       └─ Başarılı → Veto penceresi (özet bildirimi, X saat)
                        ├─ İtiraz → Durdur, onay kuyruğu
                        └─ Sessizlik → Gönder → Arşivle + haftalık özete ekle
```

Rapor gönderimi DxB Global OS içinde bir pipeline üzerinden yapılıyorsa ilgili kodu inceleyip bu kontrolleri (özellikle alıcı doğrulama, idempotency ve veto penceresi) doğrudan uygulayabilirim. Hangi dizinde olduğunu belirtmeniz yeterli.
