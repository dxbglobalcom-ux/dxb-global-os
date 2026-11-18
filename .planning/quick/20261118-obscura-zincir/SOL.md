**Sıralama emrinizi karşılıyor; ancak bir B/P2 hata buldum.**

- **B/P2 — Gerçek içerik yanlışlıkla duvar sayılabiliyor.** [rlib.py:394](/home/dxb/DxB%20Global%20OS/.claude/skills/dxb-research/scripts/rlib.py:394) içindeki iki yeni ifadeyi ayrı ayrı 12.800 karakterlik makale örneklerinde alıntıladım. `looks_like_wall()` değişiklik öncesinde `False`, sonrasında `True`; `_ok()` da `False` döndü. Aynı metni diğer okuyucular getirirse onlar da reddedilir. [Mevcut test:300](/home/dxb/DxB%20Global%20OS/tests/b46/drawer-repairs.test.ts:300) ifadeleri aynen alıntılamadığı için bunu yakalamıyor. Önerim: eşleşmeyi challenge başlığı ve kısa challenge gövdesiyle sınırlandırmak; iki alıntı örneğini regresyon testine eklemek.

Diğer soruların sonucu:

- **İstenen akış çalışıyor.** Bellek içi zincir ölçümlerinde düz Scrapling → Obscura sırası doğrulandı; Obscura’nın duvar yanıtı stealth’e, sonraki başarısızlıklar camofox’a geçti. `--no-browser` Obscura’yı koruyor. Gerçek Obscura, JavaScript’in oluşturduğu yerel test içeriğini okudu: `ok=True`, 1.452 karakter.
- **Zaman aşımında süreç artığı gözlemedim.** Gerçek Obscura’ya sonsuz JavaScript döngüsü verildiğinde `door_obscura(…, 1)` → `rc=124 timeout`, **6,06 saniye**, canlı süreç grubu üyesi **0**. SIGTERM’i yok sayan alt süreçlerle ayrıca denedim; SIGKILL sonrası yine **0**. 25 saniye iç zaman aşımıdır; dış koruma 30 saniye, zorla temizleme payı ayrıca 2 saniyedir.
- **Belirttiğiniz çağıranlarda yeni kapı veya sayı kaynaklı kırılma bulmadım.** `sweep.sh`, `ask.sh`, `crowd.sh`, `evidence.py` sözleşmeleri uyumlu; `coverage.table()` ölçümü `{"obscura": 1}` üretti. Zincir 14 kapı.

`tsc -p tsconfig.tests.json --incremental false` **exit 0**; Python ve shell sözdizimi kontrolleri geçti. Dosya veya veritabanı değiştirmedim. Yazma gerektiren Vitest/ruler paketlerini bu salt okunur denetimde yeniden çalıştırmadım.
