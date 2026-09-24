# Kota %50'deyken öncelik sırası

**Önce kotanın hangi hızla bittiğine bakın.** Sıfırlanmaya 3–4 gün kaldıysa %50 rahat bir seviyedir, normal devam edebilirsiniz. Haftanın başındaysanız harcamayı kısmanız gerekir.

## Öne alınacaklar
1. **Engelleyici ve kritik işler** (prod hatası, güvenlik açığı, başkalarını bekleten görevler)
   Kota biterse gecikmenin maliyeti en yüksek bunlarda olur.
2. **Yarım kalmış işleri bitirmek**
   Bağlamı yeniden kurmak token harcatır. Yarıda bırakılan iş, kota sıfırlandığında daha pahalıya tamamlanır.
3. **Az token ile çok değer üreten işler** (net kapsamlı bug fix, küçük refactor, config/provision script düzeltmeleri)
   Harcadığınız birim başına aldığınız çıktı en yüksek bu tür işlerde olur.
4. **Mimari ve tasarım kararları**
   Karar bir kez verilir, sonraki işlerin hepsi buna dayanır. Model desteğinin en çok işe yaradığı yer burasıdır.

## Ertelenecekler
- **Geniş kapsamlı keşif** (tüm repoyu tarama, "ne yapabiliriz" türü açık uçlu oturumlar): çok token tüketir, sonucu belirsizdir.
- **Çok ajanlı ve uzun işler** (`/code-review ultra`, büyük toplu refactor'lar): sıfırlanmadan sonrasına bırakın.
- **Mekanik işler** (formatlama, basit yeniden adlandırma, boilerplate): bunları linter, script veya IDE ile yapın.

## Tasarruf ipuçları
- Rutin işler için daha küçük bir model kullanın (Sonnet 5 veya Haiku 4.5), Opus'u zor işlere saklayın.
- Uzun oturumlarda `/compact` kullanın ya da yeni oturum açın.
- Talimatları net verin ve dosya yolu belirtin. Böylece gereksiz arama yapılmaz.

Somut iş listenizi paylaşırsanız (örneğin `vps/provision` altındaki görevler), bunları bu kriterlere göre sıralayabilirim.
