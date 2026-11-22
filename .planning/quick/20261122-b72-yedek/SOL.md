# Sol's audit of 6c8f858d (B72, the backup's local leg) — GPT-6.2 Sol · high, one blind pass, 2026-11-22

**`6c8f858d` B72’nin şartını karşılamıyor.** Hedef boşken kaydedilen koşu doğru biçimde `OFFSITE_FAIL` ve `exit=1` verdi. Aynı koşuda eski kopyaları silme adımı çalıştı. Ayrıca yeni döküm yerine konamadığında iş iki başarı etiketiyle `0` dönebiliyor. Bugünkü yerel arşiv için kayda geçen tatbikatta `pg_restore` sıfır hatayla tamamlandı, 223 arşiv tablosu geri geldi ve karşılaştırılan 226 tablonun satır sayıları eşleşti. Bu sonuç yerel arşivin yüklenebildiğini gösteriyor. Şirketin tamamının geri getirilebildiği ve masaüstü uyarısının göründüğü henüz doğrulanmış değil. [Gerçek koşu](/home/dxb/DxB%20Global%20OS/.planning/quick/20261122-b72-yedek/real-run.log:4) · [Tatbikat kaydı](</home/dxb/DxB Global OS/.planning/board-rows/B72.md:59>)

### A · Kapanışı engelleyen bulgular

1. **İddia. Yeni döküm yerine konamazsa iş başarı bildirmez. — REFUTED**  
   **Bulgu ve kanıt.** `dump_and_prove`, `if` koşulundan çağrıldığı için Bash, fonksiyon içindeki `mv` ve `stat` hatalarında `set -e` ile durmuyor. Commit’teki blokları bellekte çalıştırdım. `mv` başarısız, aynı günün eski dosyası erişilebilir ve eski dosyanın aktarımı başarılı olduğunda `BACKUP_OK`, `OFFSITE_OK` ve `exit=0` çıktı. Başarılı görünen kopya önceki koşuya ait.  
   **Gerekli düzeltme.** Taşıma ve boyut okuma hatalarını açıkça denetle. Başarıyı, bu koşunun doğruladığı dosya son adına yerleştikten sonra bildir. [laptop-pg-dump.sh](</home/dxb/DxB Global OS/scripts/backup/laptop-pg-dump.sh:86>)

2. **İddia. Başarısız gecede eski kopyalar korunur. — REFUTED**  
   **Bulgu ve kanıt.** Silme, tesis dışı aktarım denetlenmeden önce başlıyor. Gerçek koşu `offsite=unset prune=ok exit=1` yazdı. Test de aktarım reddedildiğinde eski dosyanın silinmesini özellikle bekliyor. Önceki bulgudaki taşıma hatasıyla birleştiğinde, iş yeni bir kurtarma noktası yaratmadan eldeki eski kopyaları silebilir.  
   **Gerekli düzeltme.** Yerel dosya ve geri okunan dış kopya doğrulanana kadar saklama süresi dolmuş dosyalara dokunma. En yeni doğrulanmış kopyayı silme planından açıkça çıkar. [Çağrı sırası](</home/dxb/DxB Global OS/scripts/backup/laptop-pg-dump.sh:132>) · [Test](</home/dxb/DxB Global OS/tests/ops/backup-job.test.ts:207>)

3. **İddia. Yedek adı taşıyan dosya doğrulamadan geçmiştir. — REFUTED**  
   **Bulgu ve kanıt.** Yerelde eşzamanlı iki çağrı aynı `.partial` ve `.readback` yollarını kullanıyor. Bir çağrı arşivi okuduktan sonra diğeri aynı geçici dosyayı kesip yazmaya başlarsa ilk çağrı doğrulamadığı içeriği son ada taşıyabilir. Dışarıda `scp` doğrudan son `.dump` adına yazıyor. Kesilen aktarım eksik dosya bırakabilir veya aynı günün önceden doğrulanmış dış kopyasını bozabilir. Geri okuma hatayı sonradan bildiriyor.  
   **Gerekli düzeltme.** Çağrıları kilitle, koşuya özgü geçici dosyalar kullan ve dış kopyayı geri okuma başarılı olduktan sonra son adıyla yayımla. [Yerel yollar](</home/dxb/DxB Global OS/scripts/backup/laptop-pg-dump.sh:43>) · [Dış aktarım](</home/dxb/DxB Global OS/scripts/backup/laptop-pg-dump.sh:109>)

4. **İddia. Her başarısız gece masaüstünde bildirilir. — REFUTED**  
   **Bulgu ve kanıt.** İki servis de betiği başlatmadan önce aynı günlük dosyasını açmak zorunda. Üst dizin yoksa veya günlük açılamazsa yedek servisi de hata bildirimi servisi de betiğe ulaşamaz. Dizin oluşturma yedek betiğinin içinde kalıyor. Ayrıca iki `oneshot` serviste başlangıç zaman aşımı tanımlanmamış. Yerel `systemd.service(5)` bu tipte varsayılan zaman aşımının kapalı olduğunu doğruluyor. Takılan `docker exec`, aktarım veya `notify-send` süre sınırını aşabilir. Bildirim betiği de mevcut servis çağrısını ayırt etmeden son `BACKUP_RUN` kaydını okuyor.  
   **Gerekli düzeltme.** Bildirim servisini yedek günlüğünden bağımsız başlat, hatayı ilgili servis çağrısıyla eşleştir ve iki servise açık süre sınırı koy. [Yedek servisi](</home/dxb/DxB Global OS/scripts/systemd/dxb-backup.service:23>) · [Bildirim servisi](</home/dxb/DxB Global OS/scripts/systemd/dxb-backup-alert.service:13>) · [Günlük seçimi](</home/dxb/DxB Global OS/scripts/backup/backup-alert.sh:17>)

5. **İddia. Tatbikat bittiğinde geçici konteyner ve şirket verisinin kopyası kaldırılmıştır. — REFUTED**  
   **Bulgu ve kanıt.** Başarı satırı temizlemeden önce yazılıyor. Commit’teki çıkış bloğunda `docker rm` hatasını taklit ettiğimde `RESTORE_DRILL_OK`, ardından silme uyarısı ve işlem çıkışı `0` geldi. `docker run` konteyneri oluşturduktan sonra hata verirse `started=1` satırına ulaşılmıyor. Temizlikte `rm -rf "$WORK"` hata verirse Docker silme adımına sıra gelmeyebilir. Silme adı da o anda o adı taşıyan konteynere gidiyor.  
   **Gerekli düzeltme.** Tek kullanımlık bir sahiplik etiketi ve tam kimlikle temizliği doğrula. İki temizlik adımını bağımsız dene, kısmi başlatmayı kapsa ve başarı satırını doğrulanmış temizliğin ardından yaz. [Temizlik](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:54>) · [Başlatma](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:98>) · [Başarı satırı](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:161>)

6. **İddia. `RESTORE_DRILL_OK` bugünkü kopyanın şirketi geri getirebildiğini kanıtlar. — REFUTED**  
   **Bulgu ve kanıt.** Varsayılan seçim en son dolu dosyayı alıyor, gününü doğrulamıyor. Bir şema arşivi tabloları boş olarak oluşturup gerçek satır kaybını `DIFF` satırlarına yazarak başarı dönebilir. `--require-equal` da yalnız adları ve sayıları karşılaştırıyor. Roller canlı şirketten ad olarak alınıp `NOLOGIN` yaratılıyor. Rol üyeliği, giriş yetkileri ve etkin izinler ölçülmüyor. Uzantı sürümleri, sequence değerleri ve large object içerikleri de karşılaştırılmıyor. Normal bir `pg_dump` nesne izinlerini, sequence değerlerini ve large object’leri taşıyabilir. Tatbikat bunların eksik kaldığı geçerli bir arşive de başarı verebilir. Ayrıca TOC ayrıştırıcısına boşluklu bir tablo adı verdiğimde satırı sessizce atladı.  
   **Gerekli düzeltme.** Tatbikatı beklenen günün sabit arşivine bağla. Döküm anına ait bir envanterle veri bütünlüğünü, rolleri ve üyelikleri, izinleri, uzantı sürümlerini, sequence değerlerini ve large object’leri doğrula. Tablo adlarını boşlukla ayrılmış alan sayısından çıkarma. [Arşiv seçimi](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:47>) · [Rol hazırlığı](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:117>) · [Karşılaştırma](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:135>)

### B · Şimdi düzeltilmesi gerekenler

7. **İddia. Hata tanıları şirket verisini veya sırları dışarı çıkarmaz. — REFUTED**  
   **Bulgu ve kanıt.** `DETAIL` ve `CONTEXT` eleniyor, fakat saklanan ilk hata satırı da veri değeri taşıyabilir. Commit’teki filtreye verdiğim sentetik değer çıktıda aynen göründü. Ham hata dosyası geçici dizine yazılıyor. Geçici Postgres parolası komut argümanına basılmasa da Docker konteyner yapılandırmasına kaydediliyor. Aktarım hataları da `BACKUP_DEST` değerini olduğu gibi yazıyor. Gerçek bir şirket sırrının açığa çıktığına dair kanıt görmedim.  
   **Gerekli düzeltme.** PostgreSQL hata metni yerine güvenli hata kategorisi ve sayısı yaz. Hedefi sabit bir etiketle göster. Geçici hata dosyasının ve konteynerin temizliğini doğrula. [Tatbikat tanıları](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:101>) · [Aktarım tanıları](</home/dxb/DxB Global OS/scripts/backup/laptop-pg-dump.sh:109>)

8. **İddia. Yeşil testler tam arşiv okumasını ve hata sonrası temizliği koruyor. — REFUTED**  
   **Bulgu ve kanıt.** Liderin kaydında 38 test geçmiş. Yedek testindeki `pg_restore` taklidi yalnız ilk beş bayta bakıyor ve argümanları denetlemiyor. Tam okumayı `--list` ile değiştiren bir hata bu denetimden geçebilir. Tatbikat testinde `docker rm` hata üretmiyor. Test, silmeyi denemek ile veriyi gerçekten kaldırmak arasındaki farkta kırmızıya dönemez. Taşıma hatası ve aynı anda iki çağrı da kapsanmıyor.  
   **Gerekli düzeltme.** Geçerli başlığı olan kesik arşiv, başarısız `mv`, eşzamanlı çağrı ve başarısız `docker rm` vakalarını ekle. Her vakada çıkış durumunu, başarı etiketlerini ve dosya ya da konteyner durumunu denetle. [Test çıktısı](</home/dxb/DxB Global OS/.planning/quick/20261122-b72-yedek/tests.log:5>) · [Arşiv taklidi](</home/dxb/DxB Global OS/tests/ops/backup-job.test.ts:25>) · [Docker taklidi](</home/dxb/DxB Global OS/tests/ops/restore-drill.test.ts:25>)

### C · Kapsam notları ve doğrulama sınırı

9. **İddia. Tatbikat şirket veya inşaat konteynerine yazmaz. — STANDS AFTER ATTEMPTED REFUTATION**  
   **Bulgu ve kanıt.** Her Docker çağrısını izledim. Şirket tarafında imaj ve kimlik incelemesi ile salt okunur oturumda iki `SELECT` var. İnşaat konteynerine yalnız kimlik sorgusu gidiyor. Rol oluşturma, `pg_restore --clean` ve geri yüklenen verinin sorguları, yeni oluşturulan konteynerin tam kimliği ve adı denetlendikten sonra çalışıyor. Silme çağrısı üretilen tatbikat adını hedefliyor. Silme güvenilirliği 5. bulguda.  
   **Gerekli düzeltme.** Şirket ve inşaat konteynerlerine yöneltilen çağrılar için bu commit’te gereken bir değişiklik saptamadım. [Docker çağrıları](</home/dxb/DxB Global OS/scripts/backup/restore-drill.sh:65>)

10. **İddia. Genel kurucu yalnız B72 servislerine dokunur. — REFUTED · Önceden mevcut**  
    **Bulgu ve kanıt.** Bu commit kurucuya bildirim dosyasının kopyalanmasını ekliyor. Yeni servis yalnız `OnFailure=` ile çağrılıyor. Genel kurucu ise mevcut davranışıyla JARVIS dahil dört servisi etkinleştirip yeniden başlatıyor. Diskteki yedek servisi, bildirim servisi ve zamanlayıcı commit ile birebir eşleşti.  
    **Gerekli düzeltme.** B72 kurulumu için yalnız ilgili birimleri hedefleyen kurulum yolunu kullan. [Genel kurucu](</home/dxb/DxB Global OS/scripts/systemd/install.sh:60>)

11. **İddia. Gece zamanlayıcısı ve gözle görülen masaüstü bildirimi uçtan uca çalıştı. — UNVERIFIED**  
