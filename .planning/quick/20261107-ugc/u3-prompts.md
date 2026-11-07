# U3 — @heyypriyank "AI Realism" Drive'ı

**Kaynak:** reel DeT2uHIuZUb (63 sn, transkript ve 7 kare okundu). Drive klasörü OCR'daki haliyle (`1Uxz5Y2z3VqDxg5I7IeLuiHi9pWKdAYnc`) giriş yapmadan açıldı; I/l varyantlarının beşi 404 verdi. Klasörün adı "Ai Realism 🔥". İçinde **tek dosya var:** `AI_Video_Realism_Cinematic_Prompt_Sheet.pdf` (3 sayfa, 34,9 KB, 10 Ekim). Metni: `drive-u3/sheet.txt`.

## İçerik: tek tarz, 15 parça
- **15 adet kopyalanmaya hazır istem** var. Hepsi tek bir anlayışın parçaları: "8K, ultra-realistic" gibi sözler yerine gözle görülen fiziği tarif et. İstemler birbirine eklenen modüller: cilt, ışık, gren, lens, hareket, saç, kumaş, renk, gündüz/gece, kamera, yansıma.
- Ek olarak: genel negatif istem, "tercih et / kaçın" listesi, 6 adımlık çalışma düzeni.
- **Dikkat:** belge **video** için ve **sinema kamerası** görünümüne göre yazılmış. Telefonla çekilmiş UGC tarzı değil.

## İstemin yapısı
- **Kamera:** "real cinema camera", 35/50/85 mm, inanılır alan derinliği.
- **Işık:** kaynağı belli olan pratik ışık (pencere, lamba, gün batımı), yumuşak geçiş, sıçrayan ışık.
- **Cilt:** gözenek, ince tüyler (vellus), ince çizgiler, küçük lekeler, yüz asimetrisi.
- **Kusur:** ince organik gren, küçük optik kusurlar, sınırlı keskinleştirme.
- **Kadraj:** yakın portre ya da belgesel tarzı; tek bir kamera hareketi.
- **Negatifler:** "plastic skin, waxy skin, airbrushed face, … distorted hands, impossible reflections…"

## Örnekler (aynen)
> 01: "visible pores, fine vellus hair, subtle fine lines, tiny natural blemishes, and realistic variation in skin tone."

> 02: "Avoid waxy skin, overly smooth surfaces, synthetic gloss, uniform pores, and excessive sharpening. Keep the original identity, proportions, pose, and scene."

## Stüdyoda durağan görsel adımına nasıl uyarlanır
**Alınacaklar:**
- 01'deki cilt dili, 02'deki "kimliği koru" cümlesi, 03'teki ışık kaynağı kuralı, 08'deki kumaş ve 14'teki yansıma tutarlılığı.
- Genel negatif listesinden durağan görsele uyan kısım: zamanla ilgili terimler ("flicker", "temporal", "motion blur") çıkarılır.
- "Gözenek yalnız yakın çekimde" kuralı.

**Uyarlanacaklar:**
- "Cinema camera, 35mm anamorphic" yerine telefon dili yazılır: ön kamera ya da iPhone ana kamerası, kol boyu selfie, otomatik pozlama, hafif dijital gürültü, ev ya da araç içi ışığı. UGC'yi inandıran telefon görünümüdür.
- Hareket istemleri (06, 12, 13) durağan görsel adımına girmez, video adımına (görsel→video) taşınır.

**Hangi aracta nasıl:**
- **Codex görsel aracı (referanslı):** negatif alanı yok. Belgenin kendi önerisine uyulur: en önemli yasaklar ana istemin içine talimat olarak yazılır. 02 ve 15'teki koruma dili ("preserve identity, pose, scene; do not invent new details") referans görselle birlikte kullanılır.
- **Seedream 5 Pro (ücretli):** aynı istem gönderilir. Negatif alanı olup olmadığı ⚠ ölçülmedi.
- **FLUX.2-klein (yerel):** kısa ve somut bir istem verilir. Uzun negatif listesi yerine, cilt ve ışıkla ilgili 2-3 cümle ön tarife yazılır.

**Hüküm (onun sözüyle, 2026-11-07):** 15 istemin tamamı ve UGC sürümleri stüdyonun istem dolabına kondu: `tools/studio-prompts/realism/`.
