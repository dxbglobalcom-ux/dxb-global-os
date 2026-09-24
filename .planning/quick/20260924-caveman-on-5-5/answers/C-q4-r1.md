# Effort seviyesi: max ve medium

Effort, modelin bir işe ne kadar token harcayacağını belirler: düşünme derinliği, araç çağrısı sayısı, doğrulama adımları ve cevap uzunluğu. Model aynı kalır, değişen harcanan emektir.

| | medium | max |
|---|---|---|
| Düşünme | Kısa, doğrudan | En derin, alternatifleri tartar |
| Araç kullanımı | Az, hedefli | Daha çok okuma, arama, doğrulama |
| Hız | Hızlı | Yavaş |
| Maliyet / token | Düşük | En yüksek |
| Risk | Karmaşık işte yüzeysel kalma | Basit işte gereksiz uzun düşünme |

Aradaki `high` seviyesi çoğu kurulumda varsayılandır.

## medium ne zaman kullanılır

- Tanımı net, küçük değişiklik: rename, tek fonksiyon düzeltme
- Boilerplate, CRUD, config düzenleme
- Test yazma, basit refactor
- Kod arama, dosya açıklama, kısa sorular
- Hızın önemli olduğu, çok tekrarlı iş akışları

## max ne zaman kullanılır

- Sebebi belirsiz bug: race condition, bellek sızıntısı, aralıklı hata
- Çok dosyaya yayılan mimari değişiklik veya migration
- Güvenlik incelemesi, auth ve kripto kodu
- Performans optimizasyonu, algoritma tasarımı
- Daha düşük seviyede iki kez başarısız olan iş

## Pratik kural

1. Varsayılanı `high` veya `medium` bırak.
2. Model takılırsa, yüzeysel cevap verirse ya da aynı hatayı tekrarlarsa bir kademe yükselt.
3. İş bitince seviyeyi geri düşür.

Bütçe sınırlıysa max'ı yalnızca zor adımda aç, çünkü tokenı hızlı tüketir. Seviye, `/model` menüsünden veya settings üzerinden değiştirilir. Tam yeri sürüme göre değişebilir.
