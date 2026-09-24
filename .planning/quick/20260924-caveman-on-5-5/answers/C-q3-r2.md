**Tempo:** Bugün Perşembe. Kota Pazartesi sıfırlanıyorsa haftanın ~%50'si geçti, kullanım normal seyirde. Sıfırlanma günü farklıysa hesap değişir.

**Öne al:**
1. **Engelleyici işler.** Başka işi tıkayan şeyler, örn. `vps/provision` hataları. Kota bitince bekleyen zincir uzamasın.
2. **Claude'un en çok değer kattığı işler.** Karmaşık debug, çok dosyalı refactor, mimari karar. Elle yapması en pahalı olanlar bunlar.
3. **Uzun ya da yarıda kalması riskli işler.** Migration, provisioning akışı gibi. Kota ortasında kesilirse yarım durum temizliği iki kat maliyet çıkarır.

**Ertele veya ucuzlat:**
- Mekanik işler (format, rename, boilerplate) → `sed`, linter, script.
- Doküman cilası, keşif amaçlı "bir deneyelim" oturumları.
- Basit işler → Haiku 4.5 / Sonnet 5, Opus değil.

**Tasarruf:**
- Oturumları kısa ve odaklı tut, iş bitince yeni oturum aç, uzarsa `/compact`.
- Tüm dosyayı okutmak yerine `grep` ile hedefli okuma.
- Paralel alt-agent'ı yalnızca gerçekten gerektiğinde kullan.
- Kalanın ~%15'ini acil hata için tampon bırak.

Backlog'u paylaşırsan ya da `vps/provision` dizinini tarayayım dersen, somut sıralama çıkarırım.
