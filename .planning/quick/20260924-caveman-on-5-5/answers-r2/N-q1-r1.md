# Eski talimatlar yeni modelde neden sorun çıkarır?

Eski bir model için yazılmış prompt'lar büyük ölçüde o modelin **zayıflıklarını telafi etmek** için yazılmıştır. Model güçlendiğinde bu telafiler gereksiz kalır ve çoğu zaman ters etki yapar.

## Başlıca sorunlar

**1. Aşırı vurgu, aşırı uygulamaya dönüşür**
Eski modeller talimatları kaçırdığı için `CRITICAL`, `MUST`, `NEVER` gibi büyük harfli uyarılar eklenirdi. Yeni modeller talimatlara zaten dikkat eder. Bu yüzden bağırarak yazılmış bir kuralı gereğinden fazla uygular: bir aracı alakasız durumlarda da kullanır ya da makul istisnaları bile reddeder.

**2. Talimatlar daha harfiyen uygulanır**
Eski modeller ne demek istediğinizi tahmin edip boşlukları kendileri doldururdu. Yeni modeller ise yazdığınızı yapar. Örneğin "değişiklik öner" dediğinizde sadece öneri sunar, kodu değiştirmez. Örtük beklentiler artık karşılanmayabilir.

**3. Eski yama katmanları çelişki üretir**
Zaman içinde her hataya karşı bir kural eklenir. Güçlü model bu kuralların hepsini aynı anda karşılamaya çalışır ve aralarındaki çelişkiler tuhaf davranışlara yol açar.

**4. Zorunlu iskele yeteneği kısıtlar**
"Önce şunu düşün, sonra şu 5 adımı izle" gibi dayatılmış akışlar, modelin kendi daha iyi muhakemesinin önüne geçer. Ayrıca bağlamı (context) boşuna doldurur.

**5. Keyfi limitler kapasiteyi boşa harcar**
"En fazla 3 dosya düzenle", "kısa tut", "subagent kullanma" gibi kurallar zayıf modeli korumak için konmuştu. Yeni modelde işin kalitesini düşürür.

**6. Gerekçesiz kurallar genellenemez**
"X yapma" kuralının nedenini bilmeyen model, benzer ama yazılmamış durumlarda doğru karar veremez.

**7. Örnekler fazla kopyalanır**
Yeni modeller verilen örnekleri daha sadık taklit eder. Tek tip örnekler, tek tip çıktılar üretir.

## Ne yapmalı?

1. **Önce ölçün:** Gerçek işlerinizi temsil eden 10–30 görevlik küçük bir test seti (eval) hazırlayın. Eski ve yeni prompt'u yeni modelde çalıştırıp karşılaştırın. Hisse göre değil, sonuca göre karar verin.
2. **Budayın, sonra ekleyin:** Prompt'u minimuma indirin. Sadece yeni modelde **gözlemlediğiniz** hatalar için kural geri ekleyin.
3. **Bağırmayı bırakın:** Büyük harfleri ve "KRİTİK" etiketlerini normal dile çevirin.
4. **Nedenini yazın:** Her önemli kurala kısa bir gerekçe ekleyin.
5. **Ne istediğinizi açıkça söyleyin:** Kapsamı, eylem mi öneri mi beklediğinizi ve ne kadar kapsamlı bir iş istediğinizi belirtin. "Yapma" yerine "şunu yap" diye yazın.
6. **İskeleyi kaldırın:** Adım adım talimat yerine hedefi ve kısıtları verin, gerisini modelin muhakemesine bırakın.
7. **Hijyen:** Eski model ID'lerini, bağlam uzunluğu gibi güncelliğini yitirmiş varsayımları ve artık var olmayan araç referanslarını temizleyin.
8. **Prompt'u kod gibi yönetin:** Versiyonlayın, değişiklik gerekçelerini not edin, her model geçişinde eval'i yeniden çalıştırın.

## Kısa örnek

**Önce:**
```
IMPORTANT: You MUST ALWAYS run the tests. NEVER skip this step!!!
```

**Sonra:**
```
Kod değişikliğinden sonra ilgili testleri çalıştır; CI yavaş olduğu için
hataları yerelde yakalamak zaman kazandırıyor. Sadece dokümantasyon
değişikliklerinde gerek yok.
```

İkinci versiyon daha sakin, gerekçeli ve istisnayı tanımlıyor. Yeni model bununla hem daha doğru hem daha esnek davranır.

---

İsterseniz `DxB Global OS` altındaki `CLAUDE.md` veya sistem prompt dosyalarınızı bu açıdan gözden geçirip somut düzeltme önerileri çıkarabilirim.
