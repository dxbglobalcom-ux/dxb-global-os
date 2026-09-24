# Eski talimatlar yeni modelde neden sorun olur?

Eski bir model için yazılmış prompt'lar genellikle o modelin **zayıflıklarını telafi etmek** için yazılmıştır. Yeni model bu zayıflıklara sahip olmadığında bu telafiler işe yaramaz hale gelir, hatta zarar verir.

## Başlıca sorunlar

**1. Abartılı vurgu aşırı tepkiye yol açar**
Eski modeller talimatları kaçırdığı için `IMPORTANT`, `CRITICAL`, `ALWAYS`/`NEVER` ve büyük harfle yazılmış kurallar eklenirdi. Yeni modeller talimatları çok daha dikkatli takip eder. Bu yüzden "HER ZAMAN X aracını kullan" gibi bir vurgu, aracın gereksiz yerlerde de çağrılmasına ve aşırı temkinli davranışa yol açar.

**2. Artık var olmayan hatalar için yazılmış workaround'lar**
"Kodu yarım bırakma", "dosya yollarını uydurma", "adım adım düşün" gibi yamalar yeni modelde gereksizdir. Bunlar gürültü oluşturur, bazen de istenmeyen davranışlara (örneğin gereksiz uzunluk, aşırı detay) sebep olur.

**3. Katı prosedürler muhakemeyi kısıtlar**
"Önce şunu yap, sonra bunu, sonra şunu" şeklindeki senaryolar zayıf modele yol gösterir. Güçlü bir modelde ise duruma göre daha iyi karar vermesini engeller.

**4. Örneklere aşırı uyum**
Few-shot örnekleri yeni modeller çok sadık kopyalar. Örneklerdeki tesadüfi detaylar (uzunluk, format, ton) kurala dönüşür.

**5. Birikmiş çelişkiler**
Zamanla eklenen kurallar birbiriyle çelişebilir. Eski model birini görmezden gelirdi. Yeni model ise hepsini aynı anda karşılamaya çalışır ve sonuç tutarsız olur.

## Ne yapmalıyız?

1. **Eval ile ölçün.** Temsili görevlerden bir test seti oluşturun. Eski prompt'u ve sadeleştirilmiş versiyonu yeni modelde karşılaştırın. Hisse göre değil, sonuca göre karar verin.
2. **Ablation yapın.** Bölümleri tek tek silip test edin. Silindiğinde hiçbir şey bozulmuyorsa o bölüm gereksizdir.
3. **Bağırmayı kaldırın.** Kuralları normal bir tonla yazın ve **nedenini** açıklayın. "ASLA X yapma" yerine "X yapma, çünkü Y'ye yol açıyor" yazın. Model gerekçeyi anlayınca sınır durumlarda daha doğru karar verir.
4. **Prosedür yerine hedef ve kısıt verin.** Ne istediğinizi, neden istediğinizi ve hangi sınırlar içinde kalması gerektiğini anlatın. Nasıl yapılacağını modele bırakın.
5. **Asıl değerli olanı koruyun.** Modelin kendi başına bilemeyeceği şeyleri saklayın: alan bilgisi, şirket kuralları, kişisel tercihler, proje yapısı. Bunlar model değişse de geçerlidir. Atılması gerekenler, modelin zayıflığını telafi eden kısımlardır.
6. **Minimalden başlayın.** Sade bir prompt ile başlayın. Bir kuralı yalnızca gözlemlediğiniz somut bir hata için geri ekleyin.
7. **Kuralların neden eklendiğini not edin.** Her kuralın hangi soruna karşı eklendiğini kısaca belgeleyin. Böylece bir sonraki model geçişinde neyin artık gereksiz olduğunu kolayca görürsünüz.

## Kısa örnek

**Eski:**
```
IMPORTANT: You MUST ALWAYS run the tests after EVERY change. NEVER skip this step!!!
```

**Yeni:**
```
Değişiklikten sonra ilgili testleri çalıştır; CI yavaş olduğu için hataları yerelde yakalamak istiyoruz.
```

Bu durum Claude Code'daki `CLAUDE.md` dosyaları için de geçerlidir. Model güncellendiğinde bu dosyaları da gözden geçirmek iyi bir alışkanlıktır. İsterseniz mevcut bir `CLAUDE.md` veya prompt dosyanızı birlikte inceleyip sadeleştirebiliriz.
