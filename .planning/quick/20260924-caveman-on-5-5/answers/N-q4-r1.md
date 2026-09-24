# `max` ve `medium` çaba (effort) seviyeleri

Effort ayarı, modelin bir göreve ne kadar "düşünme" ve token harcayacağını belirler. Model aynı kalır; değişen, her adımda ne kadar derin akıl yürüttüğü ve ne kadar kapsamlı çalıştığıdır.

## Temel fark

| | `medium` | `max` |
|---|---|---|
| **Düşünme derinliği** | Dengeli; gerektiği kadar düşünür | Mümkün olan en derin akıl yürütme |
| **Hız** | Daha hızlı | Belirgin şekilde daha yavaş |
| **Maliyet / token** | Daha düşük | En yüksek |
| **Kapsamlılık** | Makul düzeyde kontrol ve doğrulama | Daha fazla alternatif değerlendirir, daha çok doğrular, uç durumları daha titiz inceler |
| **Risk** | Karmaşık problemlerde bir detayı kaçırabilir | Basit işlerde gereksiz uzun sürer ve pahalıya mal olur |

## Ne zaman `medium`?

Günlük işlerin çoğunda yeterlidir:
- Rutin kod yazma, küçük özellik ekleme
- Bilinen hataları düzeltme
- Refactoring, isim değiştirme, format düzenleme
- Test yazma, dokümantasyon
- Kod hakkında soru sorma, açıklama isteme
- Hızlı ve çok sayıda yineleme yaptığınız etkileşimli çalışma

## Ne zaman `max`?

Doğruluğun hızdan önemli olduğu, zor işlerde kullanın:
- Kök nedeni belirsiz, zor debug oturumları (race condition, bellek sızıntısı, aralıklı hatalar)
- Mimari kararlar ve büyük çaplı tasarım değişiklikleri
- Birçok dosyaya yayılan karmaşık refactoring
- Güvenlik açısından kritik kod (kimlik doğrulama, şifreleme, yetkilendirme)
- Algoritmik olarak zor problemler, performans optimizasyonu
- `medium` ile birkaç denemede çözülemeyen işler

## Önerim

Varsayılan olarak `medium` (ya da `high`) ile çalışın. Modelin takıldığını, yüzeysel çözümler ürettiğini veya aynı hatayı tekrarladığını gördüğünüzde `max`'a geçin. Sorun çözülünce tekrar düşürün. Her şeyi `max` ile yapmak genellikle bütçeyi ve zamanı boşa harcar. Çoğu görevde kalite farkı da fark edilmez.

Claude Code'da bu ayarı sürümünüze göre `/model` menüsünden ya da ilgili slash komutuyla değiştirebilirsiniz. Mevcut seçenekleri görmek için `/help` kullanabilirsiniz.
