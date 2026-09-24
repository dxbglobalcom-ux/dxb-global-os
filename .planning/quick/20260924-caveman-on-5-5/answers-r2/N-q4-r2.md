# Max ve Medium çaba seviyeleri

Çaba seviyesi (effort), modelin bir görevde **ne kadar düşüneceğini ve ne kadar token harcayacağını** belirler. Model aynı kalır. Değişen şey, düşünme derinliği, araç kullanımındaki titizlik ve yanıt süresidir.

## Temel fark

| | **Medium** | **Max** |
|---|---|---|
| Düşünme derinliği | Dengeli | Mümkün olan en derin |
| Hız | Hızlı | Belirgin şekilde yavaş |
| Token / maliyet | Düşük–orta | Yüksek, sınırsıza yakın harcama |
| Keşif | Gerektiği kadar dosya okur, doğrular | Daha fazla alternatif dener, daha çok kontrol eder |
| Risk | Zor problemlerde yüzeysel kalabilir | Basit işlerde gereksiz yere "fazla düşünür" |

## Ne zaman Medium?

Günlük işlerin büyük çoğunluğu için yeterlidir:
- Bilinen bir kalıba göre fonksiyon veya endpoint eklemek
- Küçük bug fix'ler, net hata mesajı olan sorunlar
- Test yazma, refactor, isim değiştirme
- Config ve script düzenleme (örneğin `vps/provision` altındaki provisioning dosyaları)
- Kod açıklama, dokümantasyon

## Ne zaman Max?

Problem gerçekten zor olduğunda ve yanlış cevabın maliyeti yüksek olduğunda:
- Nedeni belirsiz, tekrarlanması zor hatalar (race condition, bellek sızıntısı, aralıklı hatalar)
- Mimari kararlar, büyük ölçekli yeniden tasarım
- Birçok dosyayı etkileyen, birbirine bağlı değişiklikler
- Güvenlik incelemesi, kriptografi, izin ve kimlik doğrulama mantığı
- Medium'un birkaç denemede çözemediği problemler

## Pratik öneri

**Medium ile başlayın, gerektiğinde yükseltin.** Model aynı problemde dönüp duruyorsa, yüzeysel çözümler öneriyorsa veya görev baştan beri karmaşıksa max'e geçin. İş bitince tekrar düşürün.

Bütçe açısından da önemli: max, aynı görevde medium'a göre çok daha fazla token harcayabilir. Bu oturumdaki gibi sınırlı bir bütçeyle ($3) çalışırken max'i gerçekten zor görevlere saklamak mantıklıdır.

## Nasıl değiştirilir?

Claude Code'da `/effort` komutuyla ya da `/model` menüsünden ayarlayabilirsiniz. Mevcut seviyeler ve max'in hangi modellerde bulunduğu sürüme göre değişebilir. Sizin kurulumunuzda kesin durumu görmek için `/effort` komutunu çalıştırın veya `/help` çıktısına bakın.
