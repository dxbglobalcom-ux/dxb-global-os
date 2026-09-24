Kota yüzde elli iken önceliği, **başka işleri bekleten ve yarım kalırsa pahalıya patlayan işlere** verin. Önce şuna bakın: %50 haftanın ortasındaysa tempo normal demektir. Haftanın başındaysanız kısmanız gerekir.

**Öne alın**
1. **Kritik yoldaki işler** (ör. `vps/provision` kurulumu, prod'u etkileyen hatalar): Kota biterse diğer her şey bunları bekler.
2. **Çok bağlam isteyen işler** (mimari kararlar, zor debug): Oturum ortasında kesilirse biriken bağlam kaybolur ve baştan anlatmak ek kota harcar.
3. **Geri alması zor değişiklikler** (migration, güvenlik ayarları, deploy öncesi review): Burada modelin dikkati en çok değeri üretir, hatanın maliyeti de en yüksektir.

**Erteleyin veya ucuzlatın**
- **Mekanik işler** (rename, formatlama, boilerplate): Bunları script'le, elle ya da `/model` ile daha küçük bir modelle yapın.
- **Keşif ve "olsa iyi olur" refactor'ları:** Reset'ten sonraya bırakın.
- **Uzun, çok adımlı agent görevleri:** Kotayı en hızlı bunlar tüketir.

**Tasarruf için**
- Görevleri dar ve net tanımlayın.
- Konu değişince `/clear`, uzun oturumlarda `/compact` kullanın.

Elinizdeki iş listesini paylaşırsanız somut bir sıralama çıkarabilirim.
