# `medium` ve `max` Efor Seviyeleri

Efor seviyesi, modelin bir yanıt üretmeden önce ve üretirken ne kadar "düşüneceğini" belirler. Buna ara akıl yürütme, dosya okuma/arama gibi araç çağrıları ve çıktının ayrıntı düzeyi dahildir. Model aynı kalır. Değişen, her göreve harcanan token ve zaman bütçesidir.

## Temel farklar

| | `medium` | `max` |
|---|---|---|
| **Düşünme derinliği** | Makul, hedefe odaklı | Olabildiğince derin; alternatifleri tartar, kendini kontrol eder |
| **Hız** | Daha hızlı | Belirgin biçimde daha yavaş |
| **Maliyet (token)** | Düşük/orta | Yüksek, aynı görev için birkaç katına çıkabilir |
| **Keşif** | Gereken kadar dosya okur | Daha fazla bağlam toplar, kenar durumlarını daha çok araştırır |
| **Risk** | Karmaşık işlerde bir şeyi atlayabilir | Basit işlerde gereksiz uzun sürer ("overthinking") |

## Ne zaman `medium`?

Günlük işlerin çoğunda varsayılan olarak bunu kullanın:
- Tek dosyalık ya da iyi tanımlanmış değişiklikler
- Hata mesajı net olan bug'lar
- Test yazma, küçük refactor, dokümantasyon
- Config ve script düzenlemeleri, bilinen kalıpların uygulanması
- Hızlı soru-cevap ve kod açıklama

## Ne zaman `max`?

Hata yapmanın pahalıya mal olduğu ya da problemin gerçekten zor olduğu durumlar için saklayın:
- Kök nedeni belirsiz, tekrarlanması zor bug'lar (race condition, bellek sızıntısı, aralıklı hatalar)
- Çok dosyaya yayılan mimari değişiklikler ve büyük refactor'lar
- Güvenlik açısından hassas kod (kimlik doğrulama, yetkilendirme, kriptografi, girdi doğrulama)
- Algoritma tasarımı ve performans optimizasyonu
- `medium` seviyesinin birkaç denemede çözemediği problemler

## Pratik öneri

`medium` ile başlayın. Model aynı hatada dönüp duruyor, yüzeysel çözümler öneriyor ya da problemin bir boyutunu sürekli kaçırıyorsa `max` seviyesine geçin. İş bitince tekrar `medium` seviyesine dönün.

**Bütçe notu:** Bu oturumda $3 gibi sınırlı bir bütçeniz görünüyor. `max` seviyesi token tüketimini ciddi biçimde artırır, bu yüzden bu bütçeyle onu yalnızca gerçekten zor adımlarda kullanmanızı öneririm.

Efor seviyesini nasıl ayarlayacağınız (komut adı, `/model` menüsü ya da ayarlar dosyası) Claude Code sürümüne göre değişebilir. Kesin yöntem için `/help` çıktısına ya da güncel Claude Code dokümantasyonuna bakın.
