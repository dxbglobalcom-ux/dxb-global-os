# Sol (GPT-6 Sol, xhigh, blind) on plan rev 2 — 2026-09-28

Plus before: BEFORE "primary":{"used_percent":17.0 "secondary":{"used_percent":3.0 · after: primary 24.0 secondary 4.0 · tokens used 168,808

Claim / plan item: §2 — rolü `postgres` hesabıyla oluşturma.
Verdict: REFUTED
Finding: Bu hesap Supabase kurulumunda `CREATEROLE` yetkisi taşımıyor; planın ilk uygulama adımı başarısız olur.
Evidence: [withdraw-company-login.mjs](</home/dxb/DxB Global OS/scripts/b36/withdraw-company-login.mjs:48>) bunu ölçülmüş bir kısıt olarak kaydediyor; [mevcut rol kurucusu](</home/dxb/DxB Global OS/scripts/b36/install-company-window.mjs:88>) `supabase_admin` kullanıyor.
Correction required: Rol işlemini inşaat motorunda yetkili hesapla yap; kimlik kontrolünü aynı bağlantıda, herhangi bir değişiklikten önce zorunlu kıl.

Claim / plan item: §2 — `SELECT` yetkisi gerçek tablo sayımlarını verir.
Verdict: REFUTED
Finding: Satır düzeyi güvenlik nedeniyle `sol_reader` bağlanıp dolu tabloları sıfır sayabilir; denetçi kendi eliyle yanlış kanıt toplar.
Evidence: [company-one-way-window.sql](</home/dxb/DxB Global OS/scripts/b36/company-one-way-window.sql:75>) mevcut okuma rolünün bu nedenle `BYPASSRLS` gerektirdiğini açıkça söylüyor.
Correction required: Okuma görünürlüğünü açıkça tasarla ve bilinen dolu tabloda denetçi sayımını yetkili sayımla karşılaştır.

Claim / plan item: §2 — `NOINHERIT`, seçili şemalar ve “PUBLIC’den yetki geri alma yok” birlikte yazmayı engeller.
Verdict: REFUTED
Finding: `NOINHERIT`, `PUBLIC` işlev yetkilerini kaldırmaz. Mevcut pencere kurucusu etki bırakabilen işlevlerin yetkisini `dxb_reader` dışındaki rollere geri dağıtır; yeni `sol_reader` da bu gruba girer. `BEGIN READ ONLY` tüm dış etkileri engellemez.
Evidence: [company-one-way-window.sql](</home/dxb/DxB Global OS/scripts/b36/company-one-way-window.sql:290>) etki bırakabilen işlevleri ve yeniden dağıtımı gösteriyor; [PostgreSQL belgesi](https://www.postgresql.org/docs/current/sql-set-transaction.html) salt okunur işlemin sınırını açıklıyor. `pg_extension` için önerilen kontrol `pg_net` yolunu da kapsamıyor.
Correction required: Yeni rolü mevcut yetki yeniden kurma zincirine dahil et; işlev, şema ve dizi yetkilerini her kurulumdan sonra rol üzerinde yeniden ölç. PUBLIC kuralıyla çelişen tasarımı çöz.

Claim / plan item: §1 — yalnız `sysid` kontrolü mevcut kimlik korumasıyla eşdeğer.
Verdict: REFUTED
Finding: Aynı kümedeki başka bir veritabanı yalnız `sysid` ile kabul edilir; plan, mevcut izin kaydının veritabanı ayrımını düşürüyor.
Evidence: [ledger-identity.mjs](</home/dxb/DxB Global OS/scripts/b36/ledger-identity.mjs:16>) kimliği `sysid` ile veritabanı OID/adı olarak tanımlıyor; [global-teardown.ts](</home/dxb/DxB Global OS/tests/global-teardown.ts:181>) sorguyla aynı bağlantıda bunları doğruluyor.
Correction required: Tam kimlik üçlüsünü, sabit inşaat adresini ve sorguyla aynı bağlantıyı kullan; başka veritabanı ve yanlış yönlendirme denemelerini ekle.

Claim / plan item: §4 — üç MCP sunucusunu kapatmak yalnız `sql_read` aracını bırakır.
Verdict: UNVERIFIED
Finding: Temel Codex ayarında ayrıca etkin eklentiler var. Taslak etkin araç envanterini sınamıyor; araç sunucusu çalışma alanı dışında çalışıp günlük dosyasına da yazıyor. “Hiçbir dosya yazma yolu yok” sözü bu günlükle çelişiyor.
Evidence: [config.toml](</home/dxb/.codex/config.toml:109>) etkin eklentileri listeliyor; [refuter.config.toml](</home/dxb/.codex/refuter.config.toml:1>) temel ayarın üstüne eklenen profil olduğunu söylüyor.
Correction required: Gerçek `codex -p refuter` oturumunun araç envanterini ölç, dışarıda kod çalıştıran yolları kapat ve günlük yazımını açık, dar bir istisna olarak tanımla.

Claim / plan item: §4 ve Done-list 4–5 — `--proof` ile tek canlı sayım erişimi kanıtlar.
Verdict: REFUTED
Finding: Mevcut `--proof` yalnız depo dosyasına yazma denemesi yapıyor; MCP çağırmıyor. Üstelik `codex` komutu hata verse bile `|| true` ile sonuç yutulup dosya oluşmadığında yeşil basılabilir. Bir başarılı sayım yasak araçları ve yanlış motoru sınamaz.
Evidence: [refuter.sh](</home/dxb/DxB Global OS/scripts/governance/refuter.sh:48>) bu akışı gösteriyor; dosyanın kendisi kanıtın “model çağrısı yok” olduğunu belirtiyor.
Correction required: Komutun başarılı çalışmasını ve gerçek ret nedenini doğrula; canlı Sol oturumunda araç envanteri, izinli sorgu, yasak araç ve yanlış motor denemelerini kaydet. Kritik iş için planlanan `high`/`xhigh` karşılaştırmasını da done-list’e koy.

Claim / plan item: §3 ve Done-list 2 — bütün izinli sorgular `CURSOR` ile çalışır; `COPY … TO` hata verir.
Verdict: REFUTED
Finding: `SHOW` ve `EXPLAIN`, `DECLARE CURSOR FOR` sorgusu değildir. Ayrıca `COPY … TO STDOUT`, `SELECT` yetkisiyle geçerli bir okuma işlemidir; genel “COPY TO → ERROR” beklentisi yanlıştır.
Evidence: [PostgreSQL `DECLARE` belgesi](https://www.postgresql.org/docs/current/sql-declare.html) imleç sorgusunu `SELECT`/`VALUES` olarak tanımlar; [PostgreSQL `COPY` belgesi](https://www.postgresql.org/docs/17/sql-copy.html) `TO STDOUT` ve gereken `SELECT` yetkisini açıklar.
Correction required: Desteklenen komutları uygulama yoluna göre ayır veya listeyi daralt; `COPY TO` denemesinin hedefini açıkça belirt.

Claim / plan item: §3 — 201 satır, 64 KB ve 10 saniye motoru korur.
Verdict: UNVERIFIED
Finding: 201 satırın tek hücresi çok büyük olabilir; çıktı sınırı verinin veritabanından araca taşınmasını engellemez. Üç eşzamanlı ağır sorgu sınavın ölçümünü de etkileyebilir.
Evidence: [battery.sh](</home/dxb/DxB Global OS/scripts/construction/battery.sh:18>) aynı motor için tek koşu kilidinin neden gerekli olduğunu kaydediyor; taslak `sql_read` için bu kilidi veya tek büyük hücre denemesini içermiyor.
Correction required: Araç ile sınavın eşzamanlılık kuralını belirle; büyük hücre, yavaş sorgu ve üç paralel çağrıda motor yükünü ölç.

Claim / plan item: Done-list 7–8 — `company-untouched.mjs` rol yokluğunu ve bu denetimin şirketi değiştirmediğini kanıtlar; batarya bir kez koşar.
Verdict: REFUTED
Finding: Komut `sol_reader` rolünü kontrol etmiyor; kendi çalışması sırasındaki şirket fotoğraflarını karşılaştırıyor. Varsayılan çağrısı tam bataryayı çalıştırdığı için ardından “Battery once” bir ikinci koşu olur.
Evidence: [company-untouched.mjs](</home/dxb/DxB Global OS/scripts/governance/company-untouched.mjs:589>) fotoğraf aralığını, [aynı dosya](</home/dxb/DxB Global OS/scripts/governance/company-untouched.mjs:608>) batarya çağrısını gösteriyor.
Correction required: Rol yokluğunu ayrı sorgula; şirket fotoğraflarını gerçek araç denemelerinin öncesi ve sonrasında al. Bataryayı yalnız bir kez çalıştır.

Claim / plan item: §2 — `construction:schema` sonuna rol adımı eklemek yeniden kurulum ve gelecek tablolar için yeterli.
Verdict: REFUTED
Finding: Yeni kümede kimlik henüz izin listesinde değilse rol adımı göçler uygulandıktan sonra komutu kırar; plan elle `--allow` ön adımı gerektiriyor. Gelecek tabloların varsayılan `SELECT` yetkisi de yalnız `postgres` için tanımlanmışken mevcut zincir `supabase_admin` hesabıyla nesne kuruyor.
Evidence: [package.json](</home/dxb/DxB Global OS/package.json:19>) mevcut tek komutu, [bootstrap-db.sh](</home/dxb/DxB Global OS/scripts/bootstrap-db.sh:19>) yönetici aşamasını, [company-one-way-window.sql](</home/dxb/DxB Global OS/scripts/b36/company-one-way-window.sql:198>) iki oluşturucu için varsayılan yetki gereğini gösteriyor.
Correction required: Sıfırdan kurulum sırasını çalışır tek akış olarak kanıtla; iki nesne sahibini ve yeniden kurulumdan sonra yetki ölçümünü kapsa.

OVERALL: BLOCKS — taslak, istenen bağımsız ve güvenilir salt okunur erişimi henüz kanıtlamıyor. Canlı veritabanı denemeleri bu salt okunur denetim ortamında yapılamadığı için çalışma zamanı sonuçları ayrıca **UNVERIFIED**.
