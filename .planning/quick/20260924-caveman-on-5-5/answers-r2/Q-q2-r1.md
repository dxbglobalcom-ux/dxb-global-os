**Temel risk,** hatalı ya da yanlış kişiye gitmiş bir raporun kimse fark etmeden müşteriye ulaşmasıdır. Çözüm onayı kaldırmak değil, onayı **istisnaya dayalı** hale getirmektir. Kontrollerden geçen rapor otomatik gider, geçemeyen CEO'ya düşer.

## Riskler ve önlemler

| Risk | Sonuç | Önlem |
|---|---|---|
| Hatalı veri veya hesaplama | Güven kaybı, sözleşme ihtilafı | Gönderim öncesi otomatik kontrol: veri tazeliği, boş alan, önceki döneme göre %X üzeri sapma varsa durdur |
| Yanlış alıcı | Başka müşterinin verisi sızar, KVKK ihlali ve gizlilik sözleşmesi riski doğar | Müşteri başına sabit alıcı listesi (whitelist); listede olmayan adrese gönderim engellenir |
| İç bilgi sızması | Marj, iç notlar veya fiyatlandırma müşteriye gider | İç alanlar şablonda ayrı tutulur; "internal" etiketli içerik varsa gönderim durur |
| Bağlayıcı taahhüt | Yeni teslim tarihi, fiyat veya SLA kabulü yazılı hale gelir | "Rutin" tanımına serbest metin girmez; taahhüt içeren her rapor CEO'ya gider |
| Otomasyon arızası | Çift gönderim, bozuk şablon (`{{name}}` görünür), yanlış zamanda gönderim | Idempotency kontrolü, şablon render testi, gönderim penceresi |
| CEO'nun habersiz kalması | Müşteri aradığında CEO raporu görmemiş olur | Gönderilenlerin günlük özeti CEO'ya iletilir |
| "Rutin" kapsamının kayması | Rutin olmayan içerik rutin etiketiyle çıkar | Rutin; sabit şablon, sabit alıcı ve eşik içi rakamlar olarak yazılı tanımlanır |
| İz kaybı | Hata olduğunda kimin neyi gönderdiği bilinmez | Her gönderimin kopyası ve logu arşivlenir |

## Önerilen işleyiş

1. **Rutin tanımını yazılı hale getirin.** Hangi rapor türleri, hangi müşteriler ve hangi eşikler geçerli olacak, net olmalı. Tanım dışındaki her şey CEO onayına gider.
2. **Otomatik kontrolleri gönderimden önce çalıştırın.** Tek bir kontrol bile başarısız olursa rapor bekletilir ve sorumluya bildirilir.
3. **CEO yerine bir rapor sahibi atayın.** Onay yükü kalkar ama hesap sorulacak kişi belli kalır.
4. **İptal penceresi ekleyin.** Rapor örneğin 1–2 saat kuyrukta bekler ve bu sürede durdurulabilir. Yanlış gönderimin geri alınamayan maliyetini düşüren en ucuz önlem budur.
5. **Örneklem denetimi yapın.** CEO haftada 1–2 gönderilmiş raporu inceler. Hata çıkarsa ilgili rapor türü geçici olarak onaya geri döner.
6. **Pilotla başlayın.** Önce tek müşteri ve tek rapor türüyle 2–4 hafta deneyin, sonra genişletin.

Bu raporlar DxB Global OS içinde bir pipeline'dan çıkıyorsa, kodu inceleyip bu kontrolleri (whitelist, sapma eşiği, kuyruk/iptal penceresi, günlük özet) doğrudan ekleyebilirim.
