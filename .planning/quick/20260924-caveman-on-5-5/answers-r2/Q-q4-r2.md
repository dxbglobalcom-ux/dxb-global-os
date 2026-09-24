Aynı model iki seviyede de çalışır. Değişen, bir göreve ne kadar emek harcandığıdır: düşünme miktarı, kod okuma ve arama derinliği, kendi çıktısını doğrulama ve yanıtın uzunluğu.

- **medium:** Çözüme daha doğrudan gider, daha az keşif yapar ve alternatifleri daha az tartar. Daha hızlı ve daha ucuzdur. Rutin işlerde kalite farkı genellikle küçüktür.
- **max:** Daha uzun akıl yürütür, daha fazla dosya okur, alternatifleri karşılaştırır ve sonucu kontrol eder. Daha yavaştır ve belirgin şekilde daha fazla token harcar. Basit işlerde gereksiz uzayabilir veya çözümü fazla karmaşıklaştırabilir.

| Durum | Önerilen seviye |
|---|---|
| Tek dosyalık düzenleme, yeniden adlandırma, küçük hata düzeltme, boilerplate, açıklama soruları | medium |
| Çok dosyalı refactor, kök nedeni belirsiz veya tekrarlayan hatalar | max |
| Mimari kararlar, eşzamanlılık, güvenlik veya veri kaybı riski taşıyan değişiklikler | max |
| medium ile denendi ama sonuç yetersiz kaldı | max |

**Pratik öneri:** Varsayılan olarak medium ile başlayın. Görev karmaşıksa ya da ilk sonuç yetersizse max'a geçin.

**Maliyet notu:** Bu oturumda $3 bütçe sınırı var. Max, aynı görevde bütçeyi çok daha hızlı tüketir. Bu yüzden onu gerçekten zor işlere ayırmak mantıklıdır.
