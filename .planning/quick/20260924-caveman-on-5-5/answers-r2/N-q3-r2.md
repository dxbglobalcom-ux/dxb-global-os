Elimde somut bir iş listesi yok (provision dizinine baktım ama çıktıyı göremedim), o yüzden genel bir öncelik sırası veriyorum. Görev listesini paylaşırsanız ona göre netleştiririm.

**Öne alınacaklar (kalan %50 ile):**

1. **Bloklayıcı ve kritik işler.** Başka işleri durduran ya da üretimi etkileyen işler önce gelmeli: VPS provisioning hataları, güvenlik yamaları, erişim ve anahtar sorunları. Kota erken biterse en pahalı eksik bunlar olur.
2. **Yarım kalmış işleri bitirmek.** Bağlamı hâlâ taze olan işi kapatmak, yeni işe başlamaktan ucuzdur. Yarım iş haftaya taşınınca bağlamı yeniden kurmak için tekrar token harcanır.
3. **Tekrar kullanılabilir çıktılar.** Provisioning script'leri, otomasyon ve dokümantasyon gibi işler. Bir kez harcanan kota, sonraki haftalarda insan zamanı ve kota tasarrufu olarak geri döner.
4. **Net kapsamlı, küçük işler.** Tanımı belli, doğrulaması kolay görevler token başına en yüksek verimi verir.

**Ertelenecekler:**

- **Keşif ve büyük refactor.** Açık uçludur, çok token yer ve kolayca yarıda kalır. Yeni haftanın başına bırakın.
- **Kozmetik işler.** Formatlama ve isimlendirme gibi işler elle ya da lint araçlarıyla yapılabilir.

**Kotayı uzatmak için:**

- Oturumları kısa ve odaklı tutun. Bir iş bitince `/clear` ile bağlamı sıfırlayın.
- Basit işlerde daha hafif bir model kullanın (ör. Haiku 4.5), Opus'u zor işlere saklayın.
- İstekleri net verin: dosya yolu, beklenen çıktı ve kabul kriteri. Belirsiz istekler deneme-yanılma turlarına yol açar.

Genel kural şu: kalan kotayı riski ve bağımlılığı en yüksek işe harcayın, maliyeti belirsiz işleri yeni haftaya bırakın.
