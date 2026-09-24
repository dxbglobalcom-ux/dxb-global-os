**Temel risk, yanlış bilginin veya yanlış alıcının geri alınamaz şekilde müşteriye ulaşmasıdır.** Bu risk, onayı tamamen kaldırmak yerine otomatik kontroller, istisnaları onaya yönlendirme ve sonradan denetimle yönetilebilir.

## Riskler ve önlemler

| Risk | Olası sonuç | Önlem |
|---|---|---|
| **Yanlış alıcı** (A müşterisinin raporunun B'ye gitmesi) | Gizlilik ihlali, KVKK sorunu, güven kaybı. En ağır risk budur. | Gönderimden önce raporun müşteri ID'si ile alıcı domain'ini sabit bir allowlist üzerinden eşleştirin. Eşleşme yoksa gönderim durdurulsun. |
| **Hatalı veya eksik veri** (bozuk pipeline, eski veri, boş alan) | Müşteri yanlış karar verir, itibar zarar görür. | Veri tazeliğini kontrol edin, boş veya NaN alan bırakmayın ve önceki dönemle kıyaslayın. Örneğin %30'dan büyük bir sapma varsa rapor otomatik olarak onaya düşsün. |
| **İç bilginin sızması** (marj, iç notlar, başka müşteri adları) | Ticari zarar. | Sabit şablon kullanın. Yasaklı terim ve iç etiket taraması yapın, başka müşteri adlarını kontrol edin. |
| **Yetkisiz taahhüt** (fiyat, tarih, hukuki ifade) | Bağlayıcı söz verilmiş olur. | Serbest metni kısıtlayın. Rakam ve taahhüt içeren yeni ifadeler onaya gitsin. |
| **Kötü haberin habersiz gitmesi** | Müşteri, CEO'dan önce sorunu öğrenir. | Performans eşiğin altındaysa rapor bekletilsin ve CEO'ya bildirim gitsin. |
| **"Rutin" tanımının genişlemesi** | Rutin olmayan içerik denetimsiz çıkar. | Rutini yazılı olarak tanımlayın: sabit şablon, sabit alıcı, sabit veri kaynağı. Yeni müşteri, yeni şablon ve ilk gönderim her zaman onaya gitsin. |
| **Mükerrer veya yanlış zamanlı gönderim** | Profesyonellik kaybı. | Idempotency anahtarı, rate limit ve gönderim zaman penceresi kullanın. |
| **Sorumluluk boşluğu** | Hata olduğunda sahiplenen kimse olmaz. | Her rapor tipi için bir sorumlu atayın. CEO yerine hesap yöneticisi onay verebilsin. |

## Önerilen işleyiş

1. **Gölge mod (2–4 hafta):** Raporlar otomatik üretilir ama CEO onayıyla gider. Hata oranını ölçün. Hata oranı sıfıra yakınsa otomasyona geçin.
2. **Sessiz onay penceresi:** Kontrollerden geçen rapor kuyruğa girer ve örneğin 2 saat bekler. CEO bu sürede iptal etmezse rapor gider.
3. **Günlük özet:** CEO'ya o gün gönderilen raporların listesi ve anomali bildirimleri gelir.
4. **Kill switch:** Tek komutla tüm otomatik gönderimler durdurulabilmelidir.
5. **Düzeltme prosedürü:** Yanlış rapor giderse kimin, ne kadar sürede, hangi şablonla düzeltme göndereceği önceden belirlenmiş olmalıdır.

Mevcut rapor akışı bu repoda bulunuyorsa, bu kontrollerin nereye ekleneceğini kod üzerinden çıkarabilirim.
