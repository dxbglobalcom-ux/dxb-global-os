# Max ve medium çaba farkı

Çaba (effort) seviyesi, modelin görev başına ne kadar düşündüğünü ve ne kadar token harcadığını belirler. Model aynı kalır, değişen harcanan emektir.

| | Medium | Max |
|---|---|---|
| Düşünme derinliği | Orta, hedefe odaklı | En derin, token sınırı gevşek |
| Keşif / doğrulama | Gerekeni okur, az tur | Daha çok dosya okur, alternatifleri tartar, sonucu kontrol eder |
| Hız | Hızlı | Yavaş |
| Maliyet | Düşük | Belirgin şekilde yüksek |
| Risk | Zor problemde yüzeysel kalabilir | Basit işte gereksiz düşünür, zaman ve para yakar |

## Medium ne zaman

- Rutin düzenleme, boilerplate, küçük refactor
- Kapsamı net bug: hata mesajı ve yeri belli
- Script, config, test yazma
- Kod hakkında hızlı soru
- Sık iterasyon, düşük latency ya da düşük maliyet gerektiğinde

## Max ne zaman

- Zor debug: race condition, aralıklı hata, kök nedeni belirsiz sorun
- Mimari karar, çok dosyalı büyük refactor
- Güvenlik açısından hassas kod (auth, kripto, izinler)
- İnce algoritmik ya da matematiksel mantık
- Medium denedi ve başarısız oldu ya da yanlış sonuç verdi

## Pratik kural

Medium ile başla. Çıktı yüzeysel kalırsa ya da aynı hata tekrarlarsa max'e geç. Her işte max kullanmak doğruluğu garanti etmez, yalnızca maliyeti ve süreyi artırır.

Not: Bu oturumun bütçesi $3. Max bu bütçeyi hızlı tüketir. Seviyeyi değiştirmek için `/model` menüsüne bak. Seçenekler sürüme göre değişebilir.
