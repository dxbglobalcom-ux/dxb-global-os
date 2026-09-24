## Neden sorun

Eski talimatların çoğu model zaafını yamamak için yazıldı. Yeni modelde zaaf kalkıyor ama yama duruyor ve kendisi sorun oluyor.

- **Aşırı vurgu, aşırı tetiklenme.** `IMPORTANT`, `MUST`, `NEVER`, büyük harf eski model kuralı kaçırdığı için eklendi. Yeni model talimatı hassas izler, bağırılan kural diğerlerini ezer. Örn. "HER ZAMAN araç X'i kullan" → gereksiz yerde de kullanır.
- **Harfiyen uygulama.** Eski model gevşek ifadeyi kabaca anlayıp boşluğu doldururdu. Yeni model yazılanı aynen uygular; belirsizlik ve çelişki görünür hale gelir.
- **Koltuk değneği tavana dönüşür.** "Adım adım düşün", sabit şablon, zorunlu ara adımlar: model artık kendi planlıyor, dayatılan yapı daha iyi çözümü engeller.
- **Tembellik karşıtı talimat, aşırı iş.** "Tüm dosyaları oku, hiçbir şeyi atlama" eski modeli harekete geçiriyordu. Yeni model gerçekten her şeyi yapar: yavaş, pahalı, istenmeyen değişiklik.
- **Dar few-shot örnekleri.** Model genelleme yerine örneği taklit eder.
- **Gerekçesiz birikim.** Kuralın neden yazıldığı bilinmez, kimse silmeye cesaret etmez. Sonuç: token maliyeti, çelişki, dikkat dağılması.

## Ne yapmalı

1. **Envanter çıkar.** Her kural için sor: hangi hatayı düzeltmek için yazıldı? Hata yeni modelde hâlâ oluyor mu?
2. **Ablation testi.** Kuralı kaldır, aynı görev setinde çalıştır, çıktıyı karşılaştır. Fark yoksa sil.
3. **Tonu düşür.** Büyük harf, `CRITICAL`, tekrarlar gitsin. Düz cümle yeter.
4. **Kural yerine gerekçe.** "Asla X yapma" yerine "X yapma, çünkü Y". Model gerekçeden genelleme yapar, kenar vakada doğru karar verir.
5. **Yasak yerine hedef.** "Markdown kullanma" yerine "düz paragraf halinde yaz".
6. **İki katmanı ayır.**
   - Kalıcı olanı tut: iş kuralları, güvenlik sınırları, domain bilgisi, entegrasyon için gereken çıktı formatı.
   - Model yamalarını şüpheli say ve test et: vurgular, tekrarlar, zorunlu adımlar, "unutma" hatırlatmaları.
7. **Minimalden başla, hata gördükçe ekle.** Eklenen her kuralın yanına nedenini ve hangi model sürümü için eklendiğini not düş. Sonraki geçişte silme kararı kolaylaşır.
8. **Eval seti tut.** 10-30 temsili görev yeter. Model değişince eski ve yeni prompt'u koş, karşılaştır. Ölçmeden karar verme.

İstersen `CLAUDE.md` veya sistem prompt'unu tarayıp eskimiş olabilecek kuralları işaretleyebilirim.
