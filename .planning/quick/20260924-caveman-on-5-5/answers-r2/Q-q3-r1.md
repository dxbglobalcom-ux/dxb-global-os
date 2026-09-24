Önce hızınıza bakın: haftanın yarısından azı geçtiyse %50 fazla hızlı tükeniyor demektir ve kısmanız gerekir. Yarısından fazlası geçtiyse normal hızdasınız. Her iki durumda da sıralama şöyle olmalı:

**Öne alınacaklar**

1. **Başka işleri bloke eden ya da son tarihi olan işler.** Örneğin diğer servisler VPS provisioning'e bağlıysa önce o bitmeli. Kota erken biterse en pahalı kayıp, bekleyen zincirdir.
2. **Yarım kalmış, bağlamı hâlâ oturumda olan işler.** Bunları bitirmek, sonra yeni oturumda aynı bağlamı yeniden yüklemekten daha ucuzdur.
3. **Muhakeme gerektiren işler.** Mimari kararlar, zor hata ayıklama ve güvenlik incelemesi bu gruptadır. Güçlü modelin getirisi en çok burada olduğu için kotayı bu işlere ayırmak mantıklıdır.

**Ertelenecek veya ucuza yapılacaklar**

- **Mekanik işler** (yeniden adlandırma, formatlama, boilerplate) için Sonnet 5 veya Haiku 4.5'e geçin (`/model`) ya da bir script yazdırıp kendiniz çalıştırın.
- **Açık uçlu keşif ve geniş kod taramaları** belirsiz miktarda token tüketir. Kota yenilenene kadar erteleyin.
- **Uzun oturumlar** her mesajda tüm bağlamı yeniden işler. İş değiştirirken `/clear` ile yeni oturum açın. Dosya yollarını doğrudan verirseniz arama maliyeti de düşer.

Mevcut iş listenizi paylaşırsanız bu kriterlere göre somut bir sıralama çıkarabilirim.
