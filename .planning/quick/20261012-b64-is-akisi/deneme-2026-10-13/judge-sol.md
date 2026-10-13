# Sol 6.1 (effort high, through scripts/governance/refuter.sh), blind judge — A = max plan, B = xhigh plan (key revealed after the verdict)

1. **Daha iyi plan: A — belirgin farkla.** Belirleyici üstünlüğü uzunluğu değil, istenen teslimatı daha doğru varsayılan olarak kurması ve kontrol kapılarını daha açık tanımlaması. Ancak mevcut haliyle iki plan da hukuki ve işlevsel düzeltmeler gerektiriyor.

2. **Neden:**

- **Çift kanallı teslimata daha sadık.** A §2/P9, sunucudan hem WhatsApp hem e-posta gönderimini esas alıyor. B D-2’nin varsayılanında hasta ayrıca WhatsApp’ı açıp göndermezse ikinci kanal gerçekleşmiyor. Bu, imzalanmış briefteki “WhatsApp ve e-posta” şartını karşılamıyor.
- **Kontroller daha somut.** A §6–7; 20 form denemesi, kanalların ayrı ayrı arızalanması, on editör görevi ve üretimde yeniden çalıştırılacak brief kontrollerini tanımlıyor. B’nin kontrol matrisi iyi, fakat A’nın sorumlusu ve geçiş şartı belli teslim kapıları daha uygulanabilir.
- **Gerekli erişimleri zamanında istiyor.** A DNS/Meta erişimini D2, Search Console erişimini D3 istiyor. B’de P2 envanteri D4, P3 URL planı D5 biterken Search Console erişimi ancak D6 isteniyor. Bu, SEO kararlarını gerekli kanıt gelmeden tamamlatıyor.
- **Hukuki kontrol daha güçlü kurulmuş.** A P7, gerçek veri akışıyla eşleşen metinler ve hukuk danışmanının yazılı onayını istiyor. B P8’de danışman “varsa”; D-3’te yorumların hukuki uygunluğu klinik tercihine bırakılıyor. Tercih, hukuka uygunluk kontrolünün yerine geçmez.
- **Teslim sonrası işletim daha açık.** A §9; hesap/sahiplik/maliyet kaydı, anahtarların yeri, alıcı değiştirme, kanal arızaları ve erişimlerin kaldırılması için işletim kılavuzu veriyor. Bunlar müşterinin teslimden sonra siteyi kullanabilmesi açısından değerlidir.

3. **Daha iyi plana EKLENECEKLER:**

- B P4’teki açık CI kapıları: lint, TypeScript kontrolü ve gerekli otomatik testler.
- B P14’teki eski **query-string URL’lerinin** yönlendirme kapsamına alınması.
- B §7’deki ayrım: D21’de sıralamanın korunması kesin olarak kanıtlanamaz; geçiş doğrulanır, ardından başlangıç verileriyle karşılaştırılır. Günlük izlemeye ölçülü sıralama/tıklama karşılaştırmaları eklenmeli.
- B R7’deki sıralanan sayfaların konu ve ana başlığını koruma şartı; ayrıca değerli mevcut içeriğin korunacağına ilişkin içerik eşleştirmesi.
- Rıza geri çekme, saklama/silme süreleri, sağlayıcı günlükleri, erişim yetkileri ve aktarım mekanizmasını kapsayan hukuki-teknik veri akışı kontrolü.
- Başarısız ikinci kanal için kişisel veriyi gereksiz tutmadan uygulanacak tekrar deneme, mükerrer gönderim önleme ve takip prosedürü.
- USD 1.500 ve 21 güne göre kişi başına iş yükü, ödünç personel müsaitliği ve maliyet kontrolü. İki plan da kaynakların yeterliliğini varsayıyor.

4. **Hatalar:**

- **İkisinde de yorumlar:** Hasta memnuniyeti/teşekkür ifadelerinin reklam amacıyla kullanılması sağlık tanıtım kurallarında yasak kapsamındadır. Kliniğin yazılı tercihi bunu hukuka uygun yapmaz; yalnız yıldız gösterimi de kendiliğinden güvenli sayılmaz. A’nın “belirsiz risk”, B’nin “müşteri seçimi” yaklaşımı yetersiz.
- **İkisinde de KVKK:** Bildirim ve açık rıza kutusu, düzenli yurt dışı aktarımını tek başına meşrulaştırmaz. KVKK m.9’a uygun aktarım dayanağı/güvencesi kurulmalı. Frankfurt bölgesi çözüm değildir. Tedavi seçimi de sağlık verisi oluşturabilir; not alanını sınırlamak yetmez.
- **B’de rıza:** “Kutucuk boşsa gönderimi engelle” testi, işleme dayanağı belirlenmeden zorunlu rıza dayatıyor.
- **İkisinde de eksik teslimat:** A R2 ve B D-2’deki kullanıcıya gönderme düğmesi, otomatik WhatsApp teslimatına eşdeğer değildir. A’nın tek kanal başarılıysa başarı göstermesi ve yorumları kapatma seçeneği de açık müşteri mutabakatı olmadan briefi eksiltir.
- **SEO:** A A6’daki eski metinleri topluca bırakma yaklaşımı sıralama riskidir. Yönlendirme tek başına içerik değerini korumaz; alakasız sayfaya yönlendirme yeterli değildir.
- **Teknik kesinlikler:** B’nin e-posta teslimini “garantili”, ücretsiz CMS katmanını “kalıcı” sayması yanlış. A’nın “masaüstü arayamaz” iddiası da yanlış; uygun uygulamalar `tel:` bağlantılarını açabilir.
- **Kapsam/takvim:** Aynı gün taleplerini dışlama, kapalı günleri seçtirmeme ve belirli revizyon sınırları briefte yok; mutabakat gerekir. A D13 staging incelemesi, İngilizce içeriğin D14 tamamlanmasından önce başlıyor; D12 “final” kontrolü de tamamlanmamış parçalarla ancak ara kontrol olabilir.
