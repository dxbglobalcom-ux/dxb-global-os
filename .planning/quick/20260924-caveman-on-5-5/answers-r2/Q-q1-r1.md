# Neden sorun olur?

Eski talimatların çoğu, eski modelin zayıflıklarını telafi etmek için yazılmıştır. Model güçlendiğinde bu telafiler gereksiz kalır, hatta zarar verir:

- **Aşırı vurgu fazla etki yaratır.** "MUTLAKA", "ASLA", "KRİTİK" gibi ifadeler, talimatı atlayan eski modeli hizalamak için eklenmişti. Yeni model talimatları daha dikkatli izlediği için bu vurgular aşırı tepkiye yol açar. Kural gereksiz yerlerde de tetiklenir.
- **Kalibre edilmiş ayarlar kayar.** "Daha kısa yaz" gibi bir talimat, eski modelin varsayılan davranışına göre ayarlanmıştır. Yeni model zaten daha kısa yazıyorsa aynı talimat hedefi aşar ve gerekçeler ile riskler de kesilir. Bu oturumdaki kısalık talimatı da buna örnektir: "Opus 5'te ölçüldü (−49 %), Opus 5.5'te yeniden ölç" notu taşıyor.
- **Adım adım yönlendirme yeni modelin muhakemesini kısıtlar.** Eski model için yazılmış katı iş akışları, daha iyi bir çözüm bulabilecek modeli eski yola zorlar.
- **Birikmiş yamalar çelişir.** Her sorun için eklenen kurallar zamanla birbiriyle çelişir, bağlamı şişirir ve davranışı öngörülemez hale getirir.

# Ne yapmalı?

1. **Talimatları iki gruba ayırın.** Bir grup gerçek gereksinimleri kodlar: politika, kullanıcı tercihi, format, güvenlik. Bu grup korunur. Diğer grup yalnızca eski modelin eksiğini kapatır ve yeniden sorgulanmalıdır.
2. **Önce talimatsız ölçün.** Yeni modeli ilgili talimat olmadan temsili görevlerde çalıştırın. Sorun hâlâ varsa talimatı geri ekleyin, yoksa silin.
3. **Vurguyu azaltın, gerekçeyi yazın.** Büyük harfli yasaklar yerine kuralın nedenini bir cümleyle açıklayın. Güçlü modeller gerekçeden genelleme yapar ve kenar durumları daha iyi yönetir.
4. **Kalibre edilmiş talimatları yeniden ölçün.** Uzunluk, ayrıntı düzeyi ve araç kullanım sıklığı gibi sayısal ayarları eval setiyle karşılaştırarak yeniden ayarlayın.
5. **Talimatlara model ve tarih notu ekleyin.** Hangi talimatın hangi modelde, neden eklendiğini yazın. Bir sonraki model geçişinde neyin yeniden ölçüleceği böylece belli olur.
6. **Kalıcı bir eval seti tutun.** Model geçişlerini bu setle A/B testiyle doğrulayın. Tek tek örneklere bakarak karar vermeyin.

Özetle, talimatlar belirli bir modele göre ayarlanmış bir konfigürasyondur. Model değiştiğinde yeniden test edilmeleri gerekir, doğrudan taşınmamalıdır.
