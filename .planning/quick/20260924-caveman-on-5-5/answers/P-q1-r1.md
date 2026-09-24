## Neden sorun olur

- **Aşırı düzeltme:** Eski modelin zayıflığını telafi etmek için yazılan sert talimatlar ("HER ZAMAN", "KRİTİK", büyük harfler) yeni modelde fazla etki yapar. Talimatlara daha iyi uyan bir model bunları abartılı uygular. Sonuçta gereksiz araç çağrısı, aşırı temkin ya da fazla kısalık görülür.
- **Artık var olmayan hatalar için geçici çözümler:** Eski modelin yapamadığı bir şey için eklenen adım adım yönlendirmeler, yeni modelin kendi başına daha iyi yapacağı işi kısıtlar.
- **Ölçümler modele özgüdür:** Bir talimatın etkisi yalnızca ölçüldüğü modelde geçerlidir. Örneğin bu oturumdaki kısalık kuralı Opus 5'te −49 % çıktı azalması sağlamış ve başlığında "Opus 5.5'te yeniden ölç" notu var. Şu an Opus 5.5 çalışıyor. Yeni model zaten daha kısa yazıyorsa aynı kural cevabı gereğinden fazla kırpabilir.
- **Gürültü:** Gereksiz talimatlar bağlamı doldurur ve gerçekten önemli kuralların etkisini azaltır.

## Ne yapmalı

1. **Envanter çıkarın:** Her talimatın yanına neden eklendiğini, hangi modelde ve hangi tarihte ölçüldüğünü yazın. Kısalık kuralındaki başlık bunun iyi bir örneği.
2. **Ayırın:** Gerçek tercih ve politikaları (dil, güvenlik, üslup) koruyun. Modelin eksikliğini kapatmak için eklenen geçici çözümleri gözden geçirme listesine alın.
3. **Yeniden ölçün:** Temsili görevlerden oluşan sabit bir test setiyle her talimatı açık ve kapalı olarak deneyin. Etkisi kaybolan ya da ters tepen talimatı kaldırın.
4. **Tonu yumuşatın:** Büyük harf ve mutlak ifadeler yerine gerekçeli, sakin cümleler kullanın. Güçlü modeller "neden"i anladığında daha isabetli davranır.
5. **Sürümleyin:** Prompt dosyalarını git'te tutun ve her model geçişini ayrı bir değişiklik olarak kaydedin. Böylece gerilemeleri geri alabilirsiniz.

İsterseniz `DxB Global OS` içindeki prompt veya `CLAUDE.md` dosyalarını bu gözle tarayıp model geçişinde yeniden ölçülmesi gereken talimatları listeleyebilirim.
