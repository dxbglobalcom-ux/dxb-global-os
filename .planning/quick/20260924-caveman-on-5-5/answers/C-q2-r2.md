**Özet:** Onayı kaldırmak yerine **istisna bazlı onaya** geçin. Rutin raporlar otomatik gitsin, kontrollerden geçemeyen veya riskli olanlar CEO kuyruğuna düşsün.

## Riskler

| Risk | Örnek | Etki |
|---|---|---|
| Yanlış alıcı | A müşterisinin raporu B'ye gider | KVKK/GDPR ihlali, güven kaybı. Geri alınamaz |
| Hatalı veri | Kaynak sorgu bozuk: 0 veya NaN değerler, önceki ay verisi | Müşteri yanlış karar verir, itibar zarar görür |
| İç bilgi sızıntısı | Marj, maliyet, iç not veya başka müşteri adı rapora karışır | Ticari zarar |
| Hassas dönem | İhtilaf, fiyat pazarlığı veya churn riski olan müşteriye kötü rakam gider | Pazarlık gücü kaybedilir |
| Toplu hata | Şablon veya otomasyon bug'ı tüm müşterilere aynı anda yanlış rapor yollar | Hasar tek seferde katlanır |
| "Rutin" tanımının kayması | Rutin olmayan içerik rutin etiketiyle gider | Kontrol fiilen ortadan kalkar |
| Sahipsizlik | Hata çıktığında sorumlu belli değil | Düzeltme gecikir |
| LLM ile üretilen metin | Uydurma yorum veya verilmemiş taahhüt | Hukuki risk |

## Önlemler

**1. "Rutin" tanımını dar tutun.** Beyaz liste kullanın: belirli şablon, belirli rapor tipi, belirli müşteri. Listede olmayan her şey onaya gider. Yeni şablonun ilk gönderimi her zaman onaylı olmalı.

**2. Gönderim öncesi otomatik kontroller.** Biri başarısız olursa rapor bekletilir:
- Alıcı adresi CRM'deki müşteri kaydıyla eşleşmeli ve domain doğrulanmalı.
- Raporda yalnızca tek bir müşteri ID'sine ait veri olmalı.
- Anomali kontrolü: önceki döneme göre %X'ten fazla sapma varsa rapor bekletilir.
- Boş alan, `NaN`, `{{placeholder}}`, `TODO` ya da sıfır toplam bulunmamalı.
- Yasaklı kelime taraması: "maliyet", "marj", "internal", başka müşteri adları.
- Veri tazeliği: kaynak verinin tarihi rapor dönemiyle uyuşmalı.

**3. Müşteri bayrakları.** CRM'de "hassas" işaretli müşterilere (ihtilaf, pazarlık, churn riski) giden raporlar otomatik olarak CEO onayına düşer.

**4. Gecikmeli gönderim ve veto penceresi.** Raporlar 1–2 saat kuyrukta bekler. CEO'ya günlük özet gider ve isterse gönderimi durdurabilir. Onay pasif hale gelir, CEO darboğaz olmaktan çıkar.

**5. Hız sınırı ve acil durdurma.** Saatte en fazla N gönderim yapılır. Ardışık kontrol hataları gönderimi otomatik durdurur. Tek komutla çalışan bir kill switch bulunmalı.

**6. Canary gönderim.** Şablon veya kodda değişiklik olunca ilk çalıştırma iç adrese gider, ancak onaydan sonra müşterilere açılır.

**7. Yetki devri.** CEO yerine bir operasyon sorumlusu haftalık örneklem kontrolü yapar (örneğin gönderilenlerin %10'u).

**8. İz ve düzeltme süreci.** Neyin kime, ne zaman, hangi şablon ve veri sürümüyle gittiği loglanır. Hatalı gönderim için hazır bir düzeltme e-postası ve eskalasyon prosedürü bulunmalı.

## Önerilen katmanlar

1. **Otomatik gönderim:** Beyaz listede, tüm kontrollerden geçmiş, bayraksız müşteriye giden rapor.
2. **Gecikmeli gönderim + özet:** Kontroller geçmiş, ancak şablon yeni veya sapma sınırda.
3. **Zorunlu CEO onayı:** Kontrol hatası, hassas müşteri, beyaz liste dışı içerik veya ilk gönderim.

İsterseniz bunu mevcut sisteminize uygulayabilirim (kontrol katmanı, kuyruk, kill switch). Rapor gönderiminin nerede yapıldığını gösterin, oradan başlayayım.
