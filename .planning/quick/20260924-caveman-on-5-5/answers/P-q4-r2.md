**Fark:** Effort seviyesi, modelin bir göreve ne kadar düşünme ve çalışma harcayacağını belirler. `max`, daha derin düşünür ve daha fazla dosya okur. Varsayımlarını daha çok kontrol eder ve alternatifleri daha kapsamlı değerlendirir. Bu nedenle daha yavaştır ve belirgin şekilde daha fazla token (maliyet) harcar. `medium` ise hız, maliyet ve kalite arasında dengeli bir ayardır. Çoğu günlük iş için yeterli sonucu çok daha ucuza verir.

| | `medium` | `max` |
|---|---|---|
| Hız | Hızlı | Yavaş |
| Maliyet | Düşük/orta | Yüksek |
| Derinlik | Yeterli | En kapsamlı |

**`medium` ne zaman kullanılmalı:**
- Tek dosyalık düzeltmeler, küçük özellikler ve refactor'lar için
- Kod açıklama, soru-cevap ve dokümantasyon işleri için
- Ne yapılacağının net olduğu rutin görevler için

**`max` ne zaman kullanılmalı:**
- Nedeni bulunamayan, zor ve kararsız (flaky) hatalarda
- Birçok dosyaya yayılan mimari değişikliklerde veya büyük refactor'larda
- Güvenlik, veri kaybı ya da production altyapısı (ör. VPS provisioning script'leri) gibi hatanın pahalıya mal olacağı işlerde
- `medium` ile denenip yetersiz kalan görevlerde

**Pratik öneri:** Varsayılan olarak `medium` ile çalışın ve yalnızca zorlandığınız veya riskin yüksek olduğu görevlerde `max`'a geçin. Bu oturumdaki $3 bütçe gibi kısıtlı bir bütçeyle çalışıyorsanız `max` bütçeyi hızlı tüketir. Seviyeyi Claude Code'da `/model` menüsünden değiştirebilirsiniz.
