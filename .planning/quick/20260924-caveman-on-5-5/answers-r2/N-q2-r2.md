# Otomatik müşteri raporlarının riskleri ve önlemleri

Onay adımını kaldırmak, hataları müşteri görmeden yakalayan son kontrolü de kaldırır. Bu yüzden amaç onayı tamamen silmek değil. **Varsayılan olarak otomatik gönderim yapıp yalnızca şüpheli durumda insan onayı istemek** (exception-based approval) en sağlıklı model.

## Başlıca riskler

| Risk | Örnek | Ciddiyet |
|---|---|---|
| **Yanlış alıcı / veri sızıntısı** | A müşterisinin raporu B'ye gider | En yüksek. KVKK/GDPR ihlali, güven kaybı |
| **İç bilgi sızması** | Marj, maliyet, iç notlar, başka müşteri adı rapora karışır | Yüksek |
| **Hatalı veya eksik veri** | Pipeline bozulur; boş, eski ya da sıfırlı rakamlar gider | Yüksek |
| **Hatanın ölçeklenmesi** | Tek bir bug tüm müşterilere aynı anda yansır, rapor iki kez gönderilir | Yüksek |
| **Bağlamsız kötü haber** | SLA ihlali ya da sert düşüş, açıklama yapılmadan müşteriye ulaşır | Orta-yüksek |
| **Hukuki taahhüt** | Raporda sözleşmeyle çelişen ifade ya da vaat yer alır | Orta |
| **Halüsinasyon** (LLM içerik üretiyorsa) | Olmayan bir metrik veya yorum rapora girer | Orta-yüksek |
| **Sorumluluk boşluğu** | Hata çıktığında kimin sorumlu olduğu belirsizdir | Orta |

## Önleme yöntemleri

**1. "Rutin" tanımını netleştirin**
- Şablonu CEO **bir kez** onaylasın. Sonrasında şablon sabit kalır, yalnızca veri değişir.
- Şablon değişirse yeniden onay gerekir.

**2. Gönderim öncesi otomatik kontroller**
- **Alıcı eşleşmesi:** Rapordaki müşteri ID'si, alıcının domain'i ve allowlist tutarlı olmalı. Bu, en kritik kontrol.
- **Veri tazeliği:** Veri beklenen dönemden eskiyse gönderim durur.
- **Boş veya NULL alan kontrolü.**
- **Anomali eşiği:** Önceki döneme göre ±%X'ten büyük sapma varsa rapor onaya düşer.
- **Yasaklı içerik taraması:** "internal", "marj", "maliyet", başka müşteri adları, ham PII.
- **Idempotency:** Aynı dönem için aynı rapor ikinci kez gönderilemez.

**3. Kontrol düşerse insan onayı**
- Herhangi bir kontrol başarısız olursa rapor onay kuyruğuna girer.
- Onayı CEO yerine **ilgili hesap yöneticisi** verir.
- Kötü haber kuralı: SLA ihlali veya kritik düşüş içeren raporlar her zaman insan onayından geçer.

**4. Geri alınabilirlik penceresi**
- Raporu önce iç kutuya gönderin, ardından 30–60 dakika bekleyip müşteriye iletin. Bu sürede iptal edilebilir.
- **Kill switch:** Tek komutla tüm gönderimleri durdurabilmelisiniz.

**5. İzlenebilirlik**
- Her gönderim için audit log tutun: ne gitti, kime gitti, hangi veri sürümüyle, hangi kontrollerden geçti.
- CEO haftada 3–5 raporu örnekleyerek geriye dönük incelesin.

**6. Olay müdahale planı**
- Hazır bir düzeltme e-postası şablonu bulunsun.
- Yanlış alıcı durumunda KVKK süreci işletilmeli: 72 saat içinde Kurul'a bildirim ve sorumlu kişinin belirlenmesi.

## Geçiş önerisi

Doğrudan otomatiğe geçmeyin. **4–8 hafta "shadow mode"** uygulayın:

1. Sistem raporu hazırlar ve kontrolleri çalıştırır, ama gönderim yine onaylı yapılır.
2. CEO'nun kaç raporda düzeltme yaptığı ve kontrollerin hangi hataları yakaladığı ölçülür.
3. Düzeltme oranı sıfıra yakınsa ve kontroller gerçek hataları yakalıyorsa otomatik gönderime geçilir.

Bu sayede kararı varsayıma değil, veriye dayanarak verirsiniz.

---

Rapor gönderimi DxB Global OS içinde bir otomasyonla yapılıyorsa ilgili kodu inceleyip bu kontrolleri (özellikle alıcı eşleşmesi, idempotency ve kill switch) doğrudan uygulayabilirim.
