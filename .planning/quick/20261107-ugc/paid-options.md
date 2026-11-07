# Reklam ve UGC için ücretli seçenekler — 7 Kasım 2026

**Kısa cevap:** "C-Dream 5 Pro" aslında ByteDance **Seedream 5.0 Pro**. Bu bir **görsel** modeli, video üretmiyor; 8 Temmuz 2026'da yayımlandı ([ByteDance Seed blog](https://seed.bytedance.com/en/blog/beyond-generation-it-understands-design-introducing-seedream-5-0-pro)). Reklamda işe yaradığı yer, ürün ve insan için ilk kareyi ya da referans görseli üretmek; konuşan UGC videoyu tek başına üretemez. Konuşan insan için öne çıkan ücretli modeller Seedance 2.5, Kling 4.0 ve Veo 3.1 Fast. "Yalnız bozuk kısmı yeniden üretme" özelliği MiniMax'ta resmî olarak doğrulanamadı. Bu iddia Seedance 2.5'in "local re-draw" özelliği için yapılıyor, o da yalnız iddia düzeyinde kalıyor.

## Kayıtlarımızda zaten olanlar
- **Ücretli raf CEO'nun kendi örneği:** LTX-Video'nun yanında Runway Gen-4 Turbo, Hailuo 2.3, Sora 2 Standard/Pro ve Seedance 2.5 duruyor. Hiçbir şey onsuz satın alınmıyor (`CAPABILITY_ARSENAL_DOCTRINE.md:36-37`).
- **Kim neyin sahibi:** Ücretsiz ve ücretli eşleri B31 adlandırıyor, iş anındaki talep B41'den geçiyor (`CAPABILITY_ARSENAL_DOCTRINE.md:38-40`). Model sürümlerini B42 izliyor. Seedance 2.0→2.5 örneği B42'de onun sözüyle yazılı (`B42.md:16`).
- Seedance 2.5 üretim başına krediyle ücretli rafta (`CAPABILITY_ARSENAL_DOCTRINE.md:252`). SocialForge'un video sağlayıcısı WaveSpeed Kling v3.0 Pro (`:255`).
- **MiniMax H3 kendi kartımızda koşuyor, maliyeti $0.00.** Yedekleri MiniMax API ve Veo 3.1; Veo 3.1 fiyatı saniyede $0.40/$0.12/$0.08 (`:305`). Yerel çıktı en fazla 768p veriyor; 2K için `H3-Regenerate-2K` gerekiyor, o da yalnız ücretli API'de (`study-cards/minimax-h3.md:155-156`). **CEO yerelde üretilen dört H3 filmini "gerçek insan gibi durmuyorlar" diyerek reddetti.** H3 hacim motoru olarak kalıyor, müşteri karesinde kullanılmıyor (`minimax-h3.md:11-13`).
- **Seedream kayıtlarda hiç geçmiyor; bu yeni.** "Bozuk kısmı yeniden üretme" de kayıtlarda yok. Kayıtlardaki tek "Regenerate", 2K büyütme modülü.

## Seçenekler tablosu

| Seçenek | Ne işe yarar | Fiyat | Kaynak |
|---|---|---|---|
| **Seedream 5.0 Pro** (görsel) | Ürün ana karesi, gerçekçi insan karesi, nokta, kement ya da kutuyla bölge düzenleme, 10'dan fazla katmana ayırma, yoğun metin | Görsel başına $0.045, 2K üstünde $0.09; ilk referans görsel ücretsiz, sonrakiler $0.003 | [ByteDance Seed](https://seed.bytedance.com/en/blog/beyond-generation-it-understands-design-introducing-seedream-5-0-pro) · [OpenRouter](https://openrouter.ai/bytedance-seed/seedream-5-0-pro) · [BytePlus fiyat](https://docs.byteplus.com/en/docs/ModelArk/1544106) |
| Seedream 5.0 Pro, fal / Replicate | Aynı model | fal: $0.0675 / $0.135 · Replicate: $0.045 / $0.09 | [fal](https://fal.ai/models/bytedance/seedream/v5/pro/text-to-image) · [Replicate](https://replicate.com/bytedance/seedream-5-pro/readme) (ChatGPT) |
| **Seedance 2.5** (video) | 30 saniyelik tek parça, çok çekimli reklam, sesli; "local re-draw" ile tek öğeyi değiştirme (iddia) | Replicate'te saniyesi $0.23, fal'da yaklaşık $0.47; resmî tarafta token ile ücretlendiriliyor | [Replicate](https://replicate.com/bytedance/seedance-2.5) · [fal](https://fal.ai/learn/tools/what-is-seedance-2-5) (ChatGPT) · [Digital Applied](https://www.digitalapplied.com/blog/seedance-2-5-bytedance-ai-video-model-2026) · [Runtimewire, 31 Tem](https://runtimewire.com/article/bytedance-seedance-2-5-video-generation-editing) |
| **Kling 4.0** | Yüz ve hareket güçlü, ürün reklamı | Saniyesi yaklaşık $0.157 (720p) | [Kling](https://kling.ai/dev/model-release/kling-4) · [Runway fiyat](https://dev.runwayml.com/learn/ai-video-api-pricing) (ChatGPT; fiyatı ben doğrulayamadım) |
| **Veo 3.1 Fast / Standard** | Doğal konuşma, kamera ve ortam sesi | Lite $0.05 · Fast $0.10 · Standard $0.40 / sn | [Google](https://ai.google.dev/gemini-api/docs/pricing) (ChatGPT) |
| **MiniMax H3 / Hailuo 3** API | 2K, sesli, 5–15 saniye | Saniyesi $0.13 (2K) | [OpenRouter](https://openrouter.ai/minimax/hailuo-3) |
| OmniHuman 1.5 | Aynı sözcü, görsel ve kayıtlı sesten farklı metinleri okuyor | Saniyesi $0.16 | [Replicate](https://replicate.com/bytedance/omni-human-1.5) (yalnız ChatGPT) |
| Sora 2 / Pro | Üst düzey anlatı sahnesi | $0.10 / $0.30 / sn | [OpenAI](https://developers.openai.com/api/docs/models/sora-2-pro) (yalnız ChatGPT) |

**UGC'de tek bağımsız ölçüm:** Aynı 15 sözcüklük konuşan kafa metni sekiz modelde, modele bir deneme hakkıyla üretildi (26 Ekim 2026). Puanlar gerçekçilik / dudak uyumu sırasıyla: Seedance 2.5 5/4, FLUX 3 Video 5/4, Kling 4.0 5/3, Veo 3.1 Fast 4/5, Veo 3.1 Lite 4/4 ([aitoolstested](https://aitoolstested.com/ai-talking-head-lip-sync-test/), sayfayı kendim okudum). Tek denemelik bir ölçüm olduğu için istatistikî kanıt sayılmaz.

## İki taraf karşılaştırıldı (ben ve ChatGPT)
**İki tarafta aynı çıkanlar (daha sağlam):**
- Seedream 5.0 Pro bir görsel modeli; 8 Temmuz 2026'da çıktı ve görsel başına $0.045 / $0.09.
- Hailuo 3'ün 2K fiyatı saniyede $0.13.
- `H3-Regenerate-2K` bir 2K büyütme modülü; bölge onarımı yapmıyor. Bu, bizim kartımızla da uyumlu.
- MiniMax'ın resmî bir "yalnız bozuk bölgeyi yeniden üret" düğmesi doğrulanamadı. Bu özelliği HailuoLabs ilan ediyor, ama kendisi MiniMax'a bağlı olmadığını yazıyor ([HailuoLabs](https://hailuolabs.ai/blog/whats-new-in-hailuo)). H3 yalnız istemle yönlendirilen düzenleme yapabiliyor ([fal](https://fal.ai/minimax-h3)).

**Ayrışmalar:**
- **Veo 3.1 fiyatı:** Arsenal kaydında Standard/Fast/Lite saniyesi $0.40/$0.12/$0.08 yazıyor. ChatGPT $0.40/$0.10/$0.05 veriyor. Google'ın sayfasından ben doğrulayamadım.
- **Seedance 2.5 fiyatı:** ChatGPT Replicate ve fal fiyatlarını veriyor. Benim bulduğum kaynaklara göre resmî fiyat token ile hesaplanıyor ve sabit bir saniye fiyatı yok ([Atlas Cloud](https://www.atlascloud.ai/blog/guides/seedance-2.5-pricing-guide)).
- **Kling:** ChatGPT Kling 4.0'ı saniyesi $0.157 ile veriyor. Ben yalnız Kling 3.0 Turbo için saniyede yaklaşık $0.11–0.14 buldum, o da ikincil bir satıcıdan ([Atlas Cloud](https://www.atlascloud.ai/blog/guides/kling-3.0-turbo-vs-kling-3.0)).

**Ticari kullanım (işletim notu):** Seedream'in ücretli API'si ticari kullanıma açık (Replicate ve fal böyle yazıyor). Ancak BytePlus **Playground** çıktıları ticari olmayan kullanımla sınırlı, bu yüzden üretim API üzerinden yapılmalı ([BytePlus Playground ToS](https://docs.byteplus.com/en/docs/legal/tos_modelark_playground), ChatGPT).

## Ne yeni, ne yapılabilir
- **Yeni:** Seedream 5.0 Pro, Kling 4.0, OmniHuman 1.5 ve Seedance 2.5'in local re-draw özelliği rafta yok.
- **Önerilen hat:** Seedream 5 Pro ile ürün ve insan karesi üretilir, sonra bu kareden Seedance 2.5, Kling 4.0 ya da Veo 3.1 Fast ile video yapılır. Varsayılan yine kendi fabrikamız. Ücretli model, müşteri karesinde yedek olarak kullanılır ve satın alma kararı CEO'da.
- Karar ölçüsü "saniye fiyatı" değil, **kabul edilen klip başına maliyet** olmalı. Örneğin altı denemede tutan $0.05'lik bir model, ilk denemede tutan $0.20'lik bir modelden pahalıya gelir.
