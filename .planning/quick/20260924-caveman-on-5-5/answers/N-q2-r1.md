# Rutin müşteri raporlarının CEO onayı olmadan gönderilmesi: riskler ve önlemler

## Başlıca riskler

| Risk | Örnek | Etki |
|---|---|---|
| **Yanlış alıcı** | A müşterisinin raporu B'ye gider | En ağır risk: gizlilik ihlali (KVKK/GDPR), güven kaybı, sözleşme ihlali |
| **Hatalı veya eksik veri** | Kaynak sistem gecikmiş, rakamlar sıfır ya da iki katı çıkmış | Müşteri yanlış karar alır, itibarınız sarsılır |
| **İç bilgi sızıntısı** | Marj, maliyet, iç notlar, başka müşteri adları rapora karışır | Ticari zarar, pazarlık gücü kaybı |
| **Bağlamsız kötü haber** | Performans %30 düşmüş ve açıklama olmadan gitmiş | İlişki krizi. CEO'nun önceden araması gereken bir durum olabilir |
| **Taahhüt veya hukuki beyan** | Raporda "SLA karşılanmadı" gibi kabul anlamına gelen ifade | Tazminat ya da ceza maddesi tetiklenebilir |
| **Otomasyon arızası** | Aynı rapor 5 kez gider, boş PDF gider, `{{client_name}}` gibi şablon kalıntısı kalır | Profesyonellik algısı zedelenir |
| **Kapsam kayması** | Rutin olmayan içerik rutin kanaldan geçer | Onay mekanizması fiilen delinmiş olur |
| **LLM ile üretim yapılıyorsa** | Uydurulmuş yorum, yanlış özet, prompt injection | Yanlış bilgi müşteriye resmi belge olarak ulaşır |

## Önleme stratejisi

### 1. "Rutin"i dar ve açık tanımlayın
Otomatik gönderim yalnızca **beyaz listedeki** kombinasyonlarda açık olsun: sabit şablon, sabit veri kaynağı, sabit alıcı listesi ve sabit periyot. Bu tanımın dışındaki her şey otomatik olarak onay kuyruğuna düşmeli.

### 2. Kademeli onay modeli
- **Yeşil (otomatik):** Tüm kontroller geçti, anomali yok.
- **Sarı (hesap sorumlusu onayı):** Eşik aşıldı, örneğin önceki döneme göre ±%20 sapma var.
- **Kırmızı (CEO onayı):** Kötü haber, SLA ihlali, yeni müşteri, ilk gönderim veya şablon değişikliği.

Böylece CEO yalnızca gerçekten gerekli olanları görür.

### 3. Gönderim öncesi otomatik kontroller
Bu kontroller en yüksek getiriyi sağlar:
- **Alıcı-müşteri eşleşmesi:** Alıcı domaini CRM'deki müşteri kaydıyla eşleşmeli. Alıcı adresi serbest metin olarak girilememeli.
- **İçerik-müşteri eşleşmesi:** Rapordaki müşteri ID'si, dosya adı ve alıcı birbiriyle tutarlı olmalı.
- **Veri tazeliği:** Kaynak verinin beklenen zaman damgasına sahip olduğu doğrulanmalı.
- **Anomali eşiği:** Kritik metriklerde ani sapma varsa gönderim bekletilmeli.
- **Kalıntı taraması:** `{{`, `TODO`, `null`, `NaN`, boş tablo gibi izler aranmalı.
- **Yasaklı içerik taraması:** Marj, maliyet, iç e-posta adresleri, diğer müşteri adları.
- **Tekrar koruması (idempotency):** Aynı rapor aynı dönem için yalnızca bir kez gönderilebilmeli.

### 4. Bekletme penceresi (sessiz onay)
Raporlar gönderimden 2–4 saat önce CEO'ya ve hesap sorumlusuna tek bir özet halinde bildirilir. İtiraz gelmezse otomatik olarak gider. Bu yöntem CEO'yu darboğaz olmaktan çıkarır ama kontrolü elinden almaz.

### 5. Devre kesici (circuit breaker)
- Yeni bir rapor tipi veya müşteri için ilk 3–5 gönderim zorunlu onaydan geçer, ardından otomatiğe alınır.
- Herhangi bir hata veya müşteri şikâyeti olursa o rapor tipi otomatik olarak onaylı moda geri döner.
- Tüm otomatik gönderimi tek hamlede durduran bir **kill switch** bulunmalı.

### 6. İz ve sonradan denetim
- Gönderilen her raporun kopyası, alıcısı, zamanı ve kontrol sonuçları loglanmalı.
- CEO haftada rastgele seçilmiş yaklaşık %10'luk bir örneklemi sonradan inceleyebilir. Bu, onaydan çok daha az zaman alır.

### 7. Hata olduğunda ne yapılacağı önceden belli olsun
- Düzeltme ve geri çekme e-postası için hazır şablon.
- Müşteriyi kimin arayacağı ve kaç saat içinde arayacağı.
- Yanlış alıcı durumunda KVKK bildirim sürecinin tetiklenmesi (72 saat kuralı).

## Önerilen başlangıç sırası
1. Alıcı-müşteri eşleşme kontrolü (en büyük riski kapatır)
2. Tekrar koruması ve kalıntı taraması
3. Anomali eşiği ile sarı/kırmızı yönlendirme
4. Bekletme penceresi ve özet bildirim
5. Loglama ve kill switch

İsterseniz DxB Global OS içindeki mevcut rapor gönderim akışınıza bakıp bu kontrolleri somut olarak nereye ve nasıl ekleyebileceğimizi çıkarabilirim. Bu yanıtı hazırlarken kodunuzu incelemedim.
