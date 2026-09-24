**Fark:** Model aynıdır, zekâsı değişmez. Değişen, bir işe harcadığı emektir: ne kadar düşündüğü, kaç dosya okuduğu, kaç kez doğruladığı.

| | **medium** | **max** |
|---|---|---|
| Düşünme | Sınırlı, soruna doğrudan gider | Sınır yok, alternatifleri tartar |
| Keşif ve doğrulama | Gerekeni okur, az test eder | Daha geniş okur, daha çok kontrol eder |
| Hız | Hızlı | Belirgin şekilde yavaş |
| Maliyet (token) | Düşük | Çok daha yüksek |

**medium ne zaman kullanılır:**
- Rutin işlerde kullanılır: küçük düzeltmeler, yeniden adlandırma, test ekleme, bilinen bir kalıbı uygulama.
- Açıklama isteme veya kod okuma gibi sorularda da yeterlidir.
- Hızlı ileri geri çalıştığınız oturumlar için uygundur.

**max ne zaman kullanılır:**
- Kök nedeni bulunamayan zor hatalarda kullanılır.
- Mimari kararlar ve birçok dosyaya yayılan refactor'larda kullanılır.
- Güvenlik, veri kaybı veya concurrency gibi hata payı düşük kodlarda kullanılır.
- medium'un iki denemede çözemediği işlerde kullanılır.

**Riskler:**
- medium, zor işlerde yüzeysel çözüm üretebilir ve kenar durumları kaçırabilir.
- max, basit işlerde boşa zaman ve para harcar, bazen de gereğinden karmaşık çözüm önerir.

**Öneri:** Varsayılan olarak medium veya high kullanın. Takıldığınızda max'e çıkın, iş bitince geri dönün. Ayar Claude Code'da `/model` menüsünden yapılır.

Bu oturumun bütçesi $3'dır. max bu bütçeyi çok daha hızlı tüketir, bu yüzden yalnızca gerçekten zor işler için kullanın.
