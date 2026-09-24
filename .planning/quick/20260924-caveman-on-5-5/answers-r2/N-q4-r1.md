**Effort (çaba) seviyesi**, modelin bir yanıt üretmeden önce ne kadar düşüneceğini ve ne kadar kapsamlı çalışacağını belirler. Seviye yükseldikçe daha fazla token harcanır ve yanıt gecikir. Karşılığında daha derin analiz ve daha az hata elde edilir.

## Temel fark

| | **Medium** | **Max** |
|---|---|---|
| Düşünme derinliği | Orta seviyede. Yeterince düşündüğüne kanaat getirince durur | Mümkün olan en derin seviyede. Alternatifleri ve kenar durumları daha çok tartar |
| Hız | Daha hızlı | Belirgin şekilde daha yavaş |
| Maliyet / token | Daha düşük | En yüksek |
| Araç kullanımı | Hedefe odaklı, daha az keşif yapar | Daha fazla dosya okur, daha çok doğrulama yapar |

## Ne zaman Medium kullanılmalı

- Günlük geliştirme işleri: küçük özellik eklemek, bug fix, refactor
- Kapsamı net, iyi tanımlanmış görevler
- Hızlı iterasyon istediğiniz, sık etkileşimli çalışmalar
- Maliyet ya da kullanım limitine dikkat etmeniz gereken durumlar

Çoğu iş için makul bir varsayılandır.

## Ne zaman Max kullanılmalı

- Kök nedeni belirsiz, zor bug'lar (race condition, bellek sorunları, aralıklı hatalar)
- Mimari kararlar ve büyük çaplı tasarım değişiklikleri
- Güvenlik açısından kritik kodlar: kimlik doğrulama, izinler, kriptografi
- Çok sayıda dosyayı etkileyen karmaşık refactor'lar
- Medium seviyesinin denediği ama çözemediği problemler

## Pratik öneri

Medium ile başlayın. Model takılırsa, yüzeysel bir çözüm önerirse ya da görev gerçekten karmaşıksa Max'e geçin. Max'i sürekli açık tutmak çoğu zaman gereksiz yere yavaşlık ve maliyet getirir.

Seviyeyi Claude Code içinde `/model` menüsünden ayarlayabilirsiniz. Mevcut seviyeler (ör. `low`, `high`) ve komutlar sürüme göre değişebildiği için güncel seçenekleri `/help` veya resmi dokümantasyonda kontrol etmenizi öneririm.
