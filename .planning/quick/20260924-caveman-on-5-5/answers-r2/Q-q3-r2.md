Kalan %50'yi, yarıda kalırsa en çok zarar verecek ve Claude'un en çok fark yarattığı işlere ayırın. Mekanik işleri ertelemeyin; onları daha ucuz bir yolla yapın.

**Öne alınacaklar**

1. **Yarıda kalmış işler.** Kota ortada biterse tutarsız bir kod tabanı ya da yarım provision edilmiş bir VPS kalır. Bunu toparlamak, işi baştan bitirmekten pahalıya gelir.
2. **Başka işleri bloklayan kritik yol işleri.** Örneğin `vps/provision` altındaki kurulum adımları gibi, siz veya ekip bitmeden ilerleyemiyorsa önce bunlar yapılmalı.
3. **Zor ve riskli işler.** Karmaşık hata ayıklama, mimari kararlar ve güvenlik açısından hassas betiklerin (SSH, firewall, kimlik bilgileri) gözden geçirilmesi bu gruptadır. Bu işlerde hata geri alınamaz ve modelin katkısı en yüksektir.

**Ertelenecek veya ucuzlatılacaklar**

- **Mekanik işler** (yeniden adlandırma, format, toplu düzenleme): Bunları `sed` veya betiklerle ya da Haiku/Sonnet ile yapın. Opus kotası bu işler için harcanmaya değmez.
- **Uzun keşif oturumları ve geniş refactor'lar:** Bunları kotanın sıfırlanmasından sonraya bırakın. Başlayıp bitiremezseniz yukarıdaki "yarım iş" riski oluşur.
- **Deneme-yanılma döngüleri:** Önce sorunu kendiniz daraltın, sonra dosya yolu ve hata mesajıyla birlikte odaklı bir soru sorun.

**Tüketimi azaltmak için**

- Konu değiştiğinde `/clear` kullanın. Uzun bağlam, her mesajda yeniden faturalanır.
- Büyük dosyaları tamamen okutmak yerine ilgili satırları veya yolları doğrudan verin.

Backlog'unuzu paylaşırsanız bu kurallara göre sıralayıp hangi işin hangi modelle yapılacağını işaretleyebilirim.
