# Güçlü modele eski talimatlar neden sorun olur?

Eski talimatlar çoğu zaman **modelin zayıflıklarını telafi etmek** için yazılır. Yeni model o zayıflıklara sahip olmadığında bu telafiler işe yaramaz, hatta zarar verir.

## Tipik sorunlar

**1. Abartılı vurgu aşırı uygulanır**
Eski model talimatları kaçırdığı için `IMPORTANT`, `MUST`, `NEVER`, büyük harf ve tekrar kullanılırdı. Yeni model talimatlara daha dikkatli uyduğu için bu vurgular aşırı tepkiye yol açar. Örneğin "HER ZAMAN X aracını kullan" dendiğinde model, X'in gereksiz olduğu durumlarda da onu kullanır.

**2. Talimatlar harfiyen uygulanır**
Güçlü modeller talimatı yazıldığı gibi alır. "Asla dosya silme" gibi mutlak bir kural, geçici bir test dosyasını temizlemek gibi makul durumlarda da işi engeller.

**3. "Tembellik" önlemleri aşırı çalışmaya dönüşür**
Eski model yüzeysel kaldığı için "her şeyi kontrol et, çok titiz ol" yazılmıştı. Yeni model bunu gerçekten yapar: gereksiz araç çağrıları, uzun cevaplar, fazla maliyet ve yavaşlık ortaya çıkar.

**4. Adım adım mikro-yönetim modeli kısıtlar**
Eski modele katı bir prosedür dayatmak mantıklıydı. Yeni model daha iyi bir yol bulabilecekken sizin çizdiğiniz daha kötü yola mahkûm kalır.

**5. Örnekler kopyalanır**
Few-shot örnekleri güçlü modeller tarafından fazla sadık biçimde taklit edilir. Çıktılar örneklere benzer ve çeşitlilik kaybolur.

**6. Birikmiş yamalar çelişir**
Her hata için eklenen kurallar zamanla birbiriyle çelişir. Yeni model hepsini aynı anda karşılamaya çalışınca tuhaf davranışlar ortaya çıkar.

## Ne yapmalı?

1. **Vurguyu azaltın.** `CRITICAL` ve `MUST` ifadelerini sade bir dile çevirin. Sakin bir talimat genellikle yeterlidir.
2. **Kural yerine gerekçe yazın.** "Asla X yapma" yerine "X'ten kaçın, çünkü Y olur" deyin. Güçlü modeller gerekçeden doğru genelleme yapar ve istisnaları kendileri ayırt eder.
3. **Prosedür yerine hedef ve kısıt tanımlayın.** *Ne* istediğinizi ve *hangi sınırlar* içinde kalınacağını söyleyin, *nasıl* yapılacağını modele bırakın.
4. **Eski telafileri tek tek test edin.** Her kuralı çıkarıp yeni modelde deneyin. Sorun çıkmıyorsa silin.
5. **Kapsamı açıkça belirleyin.** "Titiz ol" yerine "sadece şu dosyalara bak" veya "cevap kısa olsun" gibi somut sınırlar koyun.
6. **Örnekleri gözden geçirin.** Onları çeşitlendirin ya da tamamen kaldırın.
7. **Küçük bir değerlendirme seti kurun.** Gerçek görevlerden 10-20 örnek seçin. Eski ve yeni prompt'u yeni model üzerinde karşılaştırın. Karar verirken sezgiye değil sonuçlara güvenin.
8. **Kuralı hata gözlemledikçe ekleyin.** Olası her hatayı önceden yasaklamaya çalışmayın. Minimal bir prompt ile başlayın, gerçek bir sorun gördüğünüzde kural ekleyin.

**Özetle:** Her model geçişinde prompt'ları sadeleştirin, eklemekle yetinmeyin.

İsterseniz `DxB Global OS` altındaki `CLAUDE.md` veya prompt dosyalarınızı bu açıdan inceleyip sadeleştirme önerileri sunabilirim.
