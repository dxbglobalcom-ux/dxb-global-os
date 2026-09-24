# Onaysız rutin rapor gönderiminin riskleri ve önlemleri

Amaç, CEO'yu her rapordan çıkarmak ama riskli durumlarda yine devreye sokmak olmalı. "Her şey onaylı" ya da "hiçbir şey onaylı değil" yerine **risk bazlı onay** kurmak gerekir.

## Başlıca riskler

| Risk | Örnek | Etki |
|---|---|---|
| **Yanlış alıcı / veri karışması** | A müşterisinin verisi B'ye gider | En ağır risk: KVKK/GDPR ihlali, sözleşme ihlali, güven kaybı |
| **Hatalı veri** | Pipeline hatası, boş alan, sıfırlanmış metrik, yanlış dönem | Müşteri yanlış karar alır, itibar zedelenir |
| **İç bilginin sızması** | Marj, iç notlar, başka müşteri adı, taslak yorumlar | Ticari zarar, pazarlık gücü kaybı |
| **Bağlamsız kötü haber** | Performansta sert düşüş, açıklaması olmadan gider | İlişki krizi; aslında önce telefonla konuşulması gerekirdi |
| **İstenmeyen taahhüt** | Otomatik (özellikle LLM ile üretilen) metinde "gelecek ay düzelecek" gibi ifadeler | Hukuki bağlayıcılık, beklenti yönetimi sorunu |
| **Kötü zamanlama** | Müşteriyle uyuşmazlık, fatura anlaşmazlığı veya fesih görüşmesi sürerken rapor gider | Müzakere pozisyonu zayıflar |
| **Hatanın ölçeklenmesi** | Tek bir bug tüm müşterilere aynı anda gider | Manuel süreçte tek raporda kalacak hata topluca yayılır |
| **Sorumluluk belirsizliği** | Hata çıktığında sahibinin kim olduğu belli değildir | Düzeltme gecikir, aynı hata tekrarlanır |

## Önleme yöntemleri

### 1. Raporları sınıflandırın
- **Rutin (otomatik gider):** Şablonu sabit, sadece rakamların değiştiği ve metrikleri normal aralıkta olan raporlar.
- **İstisna (onaya düşer):** Eşik aşımı var, ilk kez gönderiliyor, şablon değişmiş ya da müşteri "hassas" olarak işaretlenmiş.

Böylece CEO her raporu görmez, yalnızca istisnaları görür.

### 2. Gönderim öncesi otomatik kontroller (guardrails)
- **Alıcı–veri eşleşmesi:** Rapordaki `tenant_id`/müşteri kimliği ile alıcı adresinin domain'i aynı müşteriye mi ait? Tutmuyorsa gönderim durdurulur. Bu en kritik kontroldür.
- **Veri doğrulama:** Boş/NaN alan, sıfır değer, yanlış tarih aralığı ve şema uyumsuzluğu kontrol edilir.
- **Anomali eşiği:** Önceki döneme göre ±%X sapma varsa rapor onaya düşer.
- **İçerik taraması:** İç not etiketleri, başka müşteri adları, yasaklı ifadeler ("garanti", "taahhüt" vb.) aranır.
- **Ek kontrolü:** Dosya adı, boyutu ve sayfa sayısı beklenen aralıkta mı?

### 3. Sessiz onay penceresi
Rapor hazırlanır, CEO'ya veya hesap yöneticisine kısa bir özet gider ve 2–4 saat içinde itiraz gelmezse otomatik gönderilir. Bu yöntem darboğazı kaldırır ama müdahale imkânını korur.

### 4. Müşteri bazlı bayraklar
`auto_send: false` bayrağı açık uyuşmazlığı olan, yeni ya da stratejik müşterilerde otomatiği kapatır. Hesap yöneticisi bu bayrağı tek tıkla açıp kapatabilmelidir.

### 5. Kademeli geçiş
- Otomatiğe alınan her rapor türünde ilk N gönderim manuel onaydan geçer.
- Sonrasında rastgele örneklemeyle, örneğin %10 oranında, sonradan denetim yapılır.
- Yeni şablon ya da kod değişikliğinde önce iç adrese veya tek bir müşteriye (canary) gönderilir.

### 6. Onay yetkisinin devri
CEO yerine hesap yöneticisi ya da operasyon sorumlusu onaylayabilir. Her rapor türü için sorumlu kişi yazılı olarak belirlenmelidir (RACI). CEO yalnızca eskalasyonda devreye girer.

### 7. İzlenebilirlik ve geri dönüş
- **Audit log:** Hangi rapor, kime, hangi veri sürümüyle, hangi kural setinden geçerek ve ne zaman gönderildi?
- **Kill switch:** Tüm otomatik gönderimleri tek komutla durdurabilme imkânı.
- **Düzeltme prosedürü:** Hatalı rapor için hazır "düzeltilmiş rapor" e-posta şablonu ve kimin arayacağı önceden belirlenmelidir.

### 8. Metin tarafında önlem
- Otomatik raporda yorum yerine yalnızca veri ve standart açıklama bulunmalıdır. Yorum ve öngörü içeren kısımlar onaya tabi olmalıdır.
- Rapora "Bu rapor otomatik oluşturulmuştur; sorularınız için: …" ibaresi eklenmelidir.

## Önerilen minimum set
Hepsini birden kurmak gerekmiyorsa şu dördüyle başlayın:
1. Alıcı–veri eşleşme kontrolü
2. Anomali eşiğinde onaya düşürme
3. Müşteri bazlı `auto_send` bayrağı
4. Audit log ve kill switch

Bu dört önlem en ağır iki riski (veri sızıntısı ve hatalı veri) büyük ölçüde kapatır, CEO'nun yükünü de istisnalarla sınırlar.

İsterseniz DxB Global OS içindeki mevcut rapor gönderim akışını inceleyip bu kontrolleri koda nasıl ekleyebileceğimizi somut olarak çıkarabilirim.
