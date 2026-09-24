**Eski talimatlar, eski modelin zayıflıklarını telafi etmek için yazılır. Yeni model bu zayıflıklara sahip olmadığında talimat artık düzeltme yapmaz, davranışı öbür yöne iter.**

## Neden sorun olur

- **Aşırı vurgu fazla düzeltmeye yol açar.** "CRITICAL", "YOU MUST", büyük harfle yazılmış kurallar eski modelin göz ardı ettiği şeyler için eklenmişti. Güçlü modeller talimatlara daha sıkı uyduğundan aynı vurgu aşırı tepkiye dönüşür. Örneğin bir aracı gereksiz yere çağırır ya da bir kuralı ilgisiz durumlara da uygular.
- **Kalibre edilmiş etkiler üst üste biner.** Bir talimat "çıktıyı kısalt" gibi ölçülmüş bir etki için ayarlandıysa, yeni model zaten daha kısa yazıyorsa sonuç fazla sıkıştırılmış ve eksik bilgili cevaplar olur. Benim sistem talimatımda bunun somut bir örneği var: kısalık kuralı Opus 5 üzerinde ölçülmüş (−%49) ve "Opus 5.5'te yeniden ölç" notu düşülmüş.
- **Eski geçici çözümler yeteneği kısıtlar.** Adım adım dikte edilen iş akışları ya da dar örnekler, yeni modelin daha iyi bir yol bulmasını engeller.
- **Birikmiş kurallar çelişir ve maliyet üretir.** Her sürümde eklenen ama hiç silinmeyen kurallar birbiriyle çakışır ve her istekte boşuna token harcatır.

## Ne yapmalı

1. **Her talimatın gerekçesini sorgulayın.** "Bu kural hangi hatayı düzeltmek için eklendi?" sorusunun cevabı eski bir model davranışıysa, kuralı kaldırıp test edin.
2. **Vurguyu azaltın, gerekçe ekleyin.** "ASLA X YAPMA" yerine "X yapma, çünkü Y" yazın. Gerekçeyi bilen model kuralı doğru kapsamda uygular.
3. **Değerlendirmeyle ölçün.** Temsili bir görev setini yeni modelde talimatlı ve talimatsız olarak çalıştırın. Yalnızca davranışı hâlâ istenen yöne değiştiren talimatları tutun.
4. **Talimatlara köken notu ekleyin.** Hangi model ve tarihte, hangi sorun için eklendiğini yazın. Böylece model değiştiğinde neyin yeniden kontrol edileceği bellidir.
5. **Azdan başlayıp ekleyin.** Yeni modelde sade bir talimat setiyle başlayın ve ancak gözlemlenen bir hata olduğunda kural ekleyin.

İsterseniz `/home/dxb/DxB Global OS/vps/provision` altındaki `CLAUDE.md` veya prompt dosyalarınızı bu açıdan tarayıp eskimiş olabilecek talimatları listeleyebilirim.
