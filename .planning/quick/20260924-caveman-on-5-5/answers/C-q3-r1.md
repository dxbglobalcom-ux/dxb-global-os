Önce hız kontrolü: kalan %50'yi sıfırlanmaya kalan günle karşılaştır. Haftanın yarısı geçtiyse tempo normal, kısmaya gerek yok. Sıfırlanma uzaksa aşağıdaki sıra geçerli.

**Öne al:**
1. **Engelleyici ve kritik işler** (prod hatası, güvenlik açığı, başkalarını bekleten iş). Token başına değeri en yüksek iş bunlar.
2. **Yarım kalan, bağlamı hazır işler.** Bitirmek sıfırdan başlamaktan ucuz. Bağlam kaybolursa dosyaları yeniden okumak ve sorunu yeniden anlamak ek token yer.
3. **Yoğun akıl yürütme isteyen işler** (mimari karar, zor debug, karmaşık provisioning mantığı). Model en çok değeri burada katar, elle yapması da en pahalı olan bunlar.

**Ertele:**
- Büyük refactor ve geniş kod tabanı taramaları. Çok okuma yapar, çıktısı acil değil.
- Keşif ve araştırma işleri, "olsa iyi olur" özellikleri.
- Rutin küçük düzenlemeler. Elle yap ya da `/model` ile Sonnet/Haiku kullan.

**Tasarruf taktikleri:**
- Kapsamı dar ver: dosya yolunu ve satırı belirt, "repo'yu tara" deme.
- Uzun oturumda `/compact` kullan, konu değişince yeni oturum aç.
- Büyük log ve çıktıları filtreleyerek ver (`grep`, `tail`).

Backlog listeni paylaşırsan (ya da `vps/provision` altındaki TODO/issue'ları) somut sıralama çıkarayım.
