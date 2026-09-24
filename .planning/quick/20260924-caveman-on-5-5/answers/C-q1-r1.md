# Neden sorun olur

1. **Aşırı vurgu ters teper.** Eski model talimatları kaçırdığı için "MUTLAKA", "ASLA", büyük harf ve tekrar eklenmişti. Yeni model talimatları daha hassas izliyor, bu yüzden aynı vurgu aşırı tepkiye dönüşür: gereksiz tool çağrısı, fazla reddetme, kuralı alakasız yerde uygulama.
2. **Eski zaafa yazılan yama, yeni modelde kısıta dönüşür.** "Adım adım düşün", "tembellik etme, hepsini yaz" ve uzun adım listeleri zayıf modelin açığını kapatıyordu. Güçlü modelde bunlar gereksizdir. Daha iyi yolu engeller, çıktıyı şişirir, token yakar.
3. **Literal takip artar.** Yeni model tam olarak söyleneni yapar. Eski model boşlukları tahminle dolduruyordu, yeni model "istenmedi" diye o işi yapmayabilir. Tersi de olur: gerekçesiz bir kural, niyet dışı kenar durumlarda katı biçimde uygulanır.
4. **Örneklere fazla uyar.** Few-shot örnekleri kalıp gibi kopyalar, çeşitlilik düşer.
5. **Birikmiş çelişkiler öne çıkar.** Zamanla eklenen yamalar birbiriyle çatışır. Güçlü model hepsini karşılamaya çalışır, davranış tutarsızlaşır.
6. **Varsayımlar eskir.** Küçük context window'a göre parçalama, eski model ID'leri, artık geçerli olmayan yetenek sınırları.

# Ne yapmalı

1. **Önce eval seti kur.** Gerçek görevlerden 20–50 vaka topla, her biri için beklenen çıktıyı yaz. Eski prompt'u yeni modelle çalıştır ve neyin bozulduğunu ölç, tahmin etme.
2. **Vurguyu yumuşat.** CAPS ve ASLA yerine düz cümle kullan. Kritik kural için bile tek ve net bir ifade yeter.
3. **Yamaları sök.** Her talimat için sor: "Hangi hatayı düzeltiyordu? Hata yeni modelde hâlâ var mı?" Yoksa sil. Minimal prompt'la başla, sadece eval'de gördüğün hatalar için talimat geri ekle.
4. **Kuralın yanına gerekçe yaz.** "X yapma" yerine "X yapma, çünkü Y". Model niyeti anlar ve kenar durumlarda doğru genelleştirir.
5. **İstediğini açık söyle.** Kapsamı, formatı ve inisiyatif seviyesini belirt. Örneğin modelden "öner" mi yoksa "uygula" mı istediğini net yaz.
6. **Örnekleri çeşitlendir.** Onları "kalıp değil, örnek" diye işaretle.
7. **Prompt'u versiyonla.** Model bazında sürüm tut, changelog yaz, her değişiklikte eval'i tekrar çalıştır.

Ölçümler de modele bağlıdır. Bu oturumdaki caveman talimatındaki "%49 az token" sonucu hangi modelde ölçüldüyse o modele aittir, model değişince yeniden ölçülmeli.

İstersen `provision` dizinindeki prompt veya `CLAUDE.md` dosyalarını bu gözle tarayabilirim.
