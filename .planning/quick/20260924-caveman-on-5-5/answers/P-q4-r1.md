**Fark:** Çaba seviyesi, modelin bir yanıt üretmeden önce ne kadar düşüneceğini ve işi ne kadar kapsamlı yapacağını belirler. Model her iki seviyede de aynıdır; değişen harcanan token ve süredir.

| | **medium** | **max** |
|---|---|---|
| Düşünme derinliği | Dengeli, gerektiği kadar | Mümkün olan en derin |
| Hız | Daha hızlı | Belirgin şekilde daha yavaş |
| Maliyet (token) | Daha düşük | Daha yüksek, bazen katlarca |
| Kendi işini kontrol etme | Makul düzeyde | Daha fazla doğrulama ve alternatif değerlendirme |

**medium ne zaman kullanılır:** Günlük işlerin çoğunda medium yeterlidir. Örnekler:
- Ne yapılacağı belli olan değişiklikler: bir fonksiyon eklemek, bir hatayı düzeltmek, test yazmak.
- Tek dosyada veya az sayıda dosyada yapılan düzenlemeler.
- Kod okuma, açıklama ve küçük refactor işleri.

**max ne zaman kullanılır:** Yanlış yapmanın maliyetinin, harcanan süre ve tokenden yüksek olduğu işlerde max seçilmelidir. Örnekler:
- Kök nedeni belirsiz, tekrarlanması zor hatalar (race condition, bellek sızıntısı, aralıklı hatalar).
- Mimari kararlar ve çok dosyaya yayılan büyük refactor'lar.
- Güvenlik açısından hassas kodlar (kimlik doğrulama, şifreleme, yetkilendirme).
- Medium seviyesinin denediği ama çözemediği problemler.

**Pratik öneri:** Varsayılan olarak medium ile başlayın. Model takılırsa veya yüzeysel bir çözüm önerirse o görev için max'a geçin, iş bitince tekrar medium'a dönün.

Bu oturumda bütçeniz $3 ile sınırlı. Max seviyesi bu bütçeyi hızla tüketebileceği için yalnızca gerçekten zor görevlerde kullanılmalıdır.
