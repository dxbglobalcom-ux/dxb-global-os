**Öneri:** Onayı tamamen kaldırmak yerine **istisna bazlı onaya** geçin. Tüm otomatik kontrollerden geçen rapor doğrudan gitsin, herhangi bir kontrole takılan rapor bekletilip size düşsün.

## Riskler ve önlemler

| Risk | Sonuç | Önlem |
|---|---|---|
| **Yanlış alıcı** (A müşterisinin raporunun B'ye gitmesi) | KVKK ihlali ve güven kaybı; en ağır ve geri alınamaz risk budur | Alıcı listesi müşteri kaydına sabitlenir, serbest adres girilemez. Raporun içeriği de aynı müşteri kimliğiyle filtrelenir. Kimlikler uyuşmazsa gönderim durur. |
| **Hatalı veya bayat veri** | Müşteri yanlış karar verir, itibar zarar görür | Veri tazeliği kontrolü yapılır. Toplamlar kaynakla karşılaştırılır. Önceki döneme göre büyük sapma (ör. >%20) varsa rapor bekletilir. Boş alan veya sıfır değer varsa rapor bekletilir. |
| **İç bilgi sızıntısı** (marj, maliyet, iç notlar, başka müşteri adı) | Ticari zarar oluşur | Şablonda yalnızca izin verilen alanlar yer alır. Yasaklı alan ve kelime listesiyle son tarama yapılır. |
| **Taahhüt veya ton sorunu** (özellikle AI ile üretilen yorum metinleri) | İstenmeyen sözleşmesel bağlayıcılık doğar | Rutin raporda serbest yorum metni bulunmaz, yalnızca sabit şablon ve sayılar yer alır. Yorum içeren rapor rutin sayılmaz ve onaya gider. |
| **Mükerrer veya yanlış zamanlı gönderim** | Müşteri rahatsız olur, sistem güvenilmez görünür | Her rapor ve dönem için tek gönderim kuralı (idempotency) uygulanır. Belirli bir gönderim penceresi ve günlük adet üst sınırı konur. |
| **"Rutin" kapsamının zamanla genişlemesi** | Onaysız giden içerik kontrolsüz biçimde büyür | "Rutin" tanımı yazılı olarak sabitlenir. Şablon değişikliği her zaman onaya tabidir. |
| **Sorumluluk boşluğu** | Hatalar geç fark edilir | Her rapor tipi için bir sahip atanır. Tüm gönderimler loglanır. Tek komutla tüm gönderimleri durduran bir acil durdurma anahtarı (kill switch) bulunur. |

## Geçiş planı

1. **Gölge dönem (2–4 döngü):** Otomatik gönderim açılmaz. Sistem raporu hazırlar, siz onaylamaya devam edersiniz ve kaç raporu düzelttiğiniz ölçülür.
2. **Otomatiğe geçiş:** Düzeltme oranı sıfıra yakınsa, kontrollerden geçen raporlar otomatik gönderilir.
3. **Takip:** Gönderilen raporların günlük özeti size ulaşır. Ayda bir rastgele örneklem denetlenir.
4. **Ara çözüm:** Hazır olmayan rapor tipleri için onay sizden operasyon sorumlusuna devredilebilir. Böylece dört göz ilkesi korunur, ama sizin zamanınız harcanmaz.

Bu kontrollerden en kritik olanı **alıcı ile içerik kimliğinin eşleştirilmesidir**, çünkü diğer hatalar düzeltilebilir ama yanlış müşteriye giden veri geri alınamaz.
