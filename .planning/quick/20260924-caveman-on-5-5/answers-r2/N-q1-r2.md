# Neden sorun olur?

Eski talimatlar çoğu zaman o modelin **zayıflıklarını telafi etmek** için yazılır. Yeni model bu zayıflıklara sahip olmadığında telafiler ya işe yaramaz ya da ters teper:

1. **Aşırı vurgu aşırı tepkiye yol açar.** Eski model talimatları kaçırdığı için `KRİTİK`, `MUTLAKA`, `ASLA`, büyük harfler ve tekrarlar eklenir. Yeni model talimatlara zaten dikkat ettiği için bu vurguyu çok ciddiye alır. Örneğin "HER ZAMAN X aracını kullan" yazdıysanız, gereksiz yerlerde de kullanır.

2. **Adım adım reçeteler yeteneği kısıtlar.** Zayıf model için yazılmış katı prosedürler ("önce şunu yap, sonra bunu, sonra şunu"), daha iyi bir yol bulabilecek modeli kötü bir yola kilitler. Mikro yönetim kaliteyi düşürür.

3. **Eski hatalar için yamalar ölü yük olur.** "Şu formatı bozma", "şu hatayı yapma" gibi, eski modelin belirli bir kusuruna yönelik kurallar yeni modelde gereksizdir. Yine de dikkat dağıtır, bazen başka talimatlarla çelişir.

4. **Daha harfiyen uyum, özensiz talimatları görünür kılar.** Eski model muğlak veya çelişkili talimatları "anlayıp" geçiyordu. Yeni model onları olduğu gibi uygulamaya çalışır.

5. **Örnekler kalıba dönüşür.** Eski model için verilen çok spesifik örnekler, yeni modelde birebir kopyalanmaya başlayabilir.

6. **Maliyet ve bağlam şişmesi.** Gereksiz talimatlar token, gecikme ve dikkat tüketir.

# Ne yapmalı?

- **Önce ölçüm altyapısı kurun.** Birkaç gerçek görevden oluşan küçük bir test seti (eval) olsun. "Daha iyi oldu" hissine değil, eski prompt ile yeni prompt'un karşılaştırmasına güvenin.
- **Minimalden başlayıp ekleyin.** Prompt'u özüne indirin: amaç, bağlam, gerçek kısıtlar. Sonra yalnızca **gözlemlediğiniz** bir hata için talimat ekleyin. Tahmine dayalı önlem koymayın.
- **Tonu normalleştirin.** `KESİNLİKLE YAPMA!!!` yerine "Bunu yapma, çünkü …" yazın. Çoğu durumda sade dil yeterlidir.
- **Kural yerine gerekçe verin.** "Neden" açıklanan bir talimatı model yeni durumlara doğru genelleştirir. Çıplak kural ise ya aşırı ya eksik uygulanır.
- **Prosedürü hedefe çevirin.** "1-2-3-4. adımlar" yerine "Sonuç şu özellikleri taşımalı, şu sınırlar içinde kalmalı" deyin.
- **Her talimatın varlık nedenini not edin.** Örneğin "Model X, Y'yi atlıyordu diye eklendi" gibi bir not düşerseniz, model değiştiğinde hangi satırı test edip silebileceğinizi bilirsiniz.
- **Yeni hata türlerini izleyin.** Güçlü modellerin kusurları farklıdır: fazla hevesli davranma, kapsamı genişletme, istenmeyen "iyileştirmeler" yapma. Yeni talimatlar bunlara yönelik olmalı.

Kısacası: eski prompt'u yeni modele olduğu gibi taşımayın. Sadeleştirin, test edin ve yalnızca gerçekten gerekenleri geri ekleyin.

İsterseniz `DxB Global OS` altındaki `CLAUDE.md` veya sistem prompt'larınızı bu gözle birlikte inceleyebiliriz.
