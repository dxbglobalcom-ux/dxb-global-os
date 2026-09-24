## Neden sorun olur?

Eski talimatların çoğu, eski modelin zayıflıklarını telafi etmek için yazılır. Yeni model aynı zayıflığa sahip değilse bu talimatlar işe yaramaz, hatta zarar verir:

- **Aşırı düzeltme:** "MUTLAKA", "ASLA", büyük harfler ve tekrarlanan vurgular, talimatları yarım dinleyen bir modeli yola getirmek için eklenir. Talimatları daha hassas izleyen yeni bir model bunları fazla ciddiye alır. Sonuç olarak gereksiz araç çağrıları, aşırı temkin veya aşırı kısa cevaplar ortaya çıkar.
- **Eskimiş kalibrasyon:** Bir talimatın etkisi belirli bir model üzerinde ölçülmüştür. Yeni model zaten o yönde davranıyorsa aynı talimat hedefi aşar. Örneğin benim sistem talimatımda şöyle bir not var: "Brevity — Opus 5'te ölçüldü (−49 % çıktı); Opus 5.5'te yeniden ölç." Kısalık talimatı eski modelde doğru ayardaydı, ama yeni modelde cevapları gereğinden fazla kırpabilir.
- **Kör kurallar:** Gerekçesi yazılmamış kurallar, yeni modelin muhakemesini gereksiz yere kısıtlar. Model kuralın neden var olduğunu bilmediği için onu uygun olmayan durumlara da uygular.
- **Gürültü:** Artık var olmayan hatalara yönelik geçici çözümler bağlamı doldurur ve önemli talimatları gölgeler.

## Ne yapmalıyız?

1. **Talimatları envantere çıkarın.** Her talimatın hangi model ve hangi sorun için eklendiğini not edin. Tarih ve ölçüm bilgisi de ekleyin; yukarıdaki örnek iyi bir şablondur.
2. **Yeni modelde yeniden ölçün.** Talimat varken ve yokken aynı eval setini çalıştırıp çıktıları karşılaştırın.
3. **Önce silin, gerekirse geri ekleyin.** Geçici çözümleri kaldırın. Sorun yeni modelde de tekrar ediyorsa talimatı geri koyun.
4. **Vurguyu yumuşatın.** "KRİTİK: ASLA X yapma" yerine "X yapma, çünkü Y" yazın.
5. **Kural yerine amaç yazın.** Gerekçesi bilinen bir talimatı model yeni durumlara doğru şekilde genelleyebilir.

Kısacası talimatlar, belirli bir modele göre ayarlanmış ve bakım gerektiren bir yapılandırmadır. Her model yükseltmesi bir gözden geçirme tetiklemelidir.
