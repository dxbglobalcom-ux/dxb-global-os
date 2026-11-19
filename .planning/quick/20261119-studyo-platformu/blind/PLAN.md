# Plan — Stüdyo platformu holdingin içinde (Higgsfield ve TopView'un sistemi, sökülüp yeniden kurulmuş)

*Kör denetimden geçti (GPT-6.2 Astra, high, 2026-11-19; Fable'ın haftası dolu olduğu için yanında ikinci denetçi yoktu). Bulgular işlendi: `SOL.md`.*

## Kısa cevap

- Kurulacak şey bir site değil. Stüdyonun içine, iki platformun da sattığı aynı altı parçayı kuruyoruz:
  1. model kataloğu,
  2. hazır ayarlar (tek tık efektler, reklam modları),
  3. referans dolabı,
  4. iş akışları,
  5. fiyat ve onay kartı,
  6. ekran.
- Sattıkları "kredi" Seedance, Kling, Wan ve MiniMax'in kredisi. Biz her rotada önce üreticiye doğrudan bağlanırız; aracı (fal, Runware, kie.ai…) yalnız daha ucuzsa ya da üretici doğrudan erişim vermiyorsa kullanılır. Kartta her rotanın üretici mi aracı mı olduğu yazar.
- Kaynak önce açık olan her şey: Higgsfield'ın MIT lisanslı CLI'si ve becerileri, TopView'un açık API belgesi ve MCP'si, ikisinin sitelerine REA'nın oturumsuz sökümü. Her bulgunun yanına kaynağı ve "belgede yazıyor / gözlendi / bilinmiyor" düzeyi yazılır. Holding iki platformla ortaklıkta prensipte anlaştı; bu yüzden söküm eksiksiz yapılır: şablonlar, arka plan çağrıları, hazır ayarlar, ulaşılan her şey. Yalnız kendi sunucularında kalıp tarayıcıya hiç gelmeyen kısım sökümle görünmez; o kısım ortaklık üzerinden istenir, istenene kadar stüdyo kendi karşılığını yazar.
- TopView yalnız acil yoldur. Kart onu ancak kendi kartımız ve doğrudan rotalar işin kalite ya da teslim şartını karşılayamadığında önerir; gerekçe kartta yazar. Olağan işte, daha ucuz olsa bile seçilmez.
- **Sizin evetinizle bugün başlayacak dilim** ücretsiz ve hesapsız; Opus 5.5 ile, hesabın kalan kotasıyla yapılır:
  1. iki platformun işlev tablosu,
  2. kataloğun şeması ve ilk model dosyaları,
  3. ilk hazır ayarlar,
  4. TopView bağlayıcısının sahte sunucuya karşı testleri.
- **Bugün olmayanlar:** gerçek TopView bağlantısı, ücretli işler, kartımıza yeni modeller, yönlendirici. Her birinin açılma koşulu aşağıdaki tabloda yazılı.

## Kapsam

**İçeride:** iki platformun sökümü · model kataloğu · hazır ayarlar · referans dolabı · iş akışları · TopView acil bağlantısı · FINAL.md'nin 1-3. fazları (bağlantılar, katalog taraması, yönlendirici ve kart) · kartımızın ücretsiz tarafı · Web Studio ile ajansın stüdyoyu çağırdığı tek yol.

**Dışarıda:** platformların kendi modelleri (Higgsfield Soul, TopView T1); ağırlıkları alınamaz, en yakın yolları yazılır · para yükleme (sizin "Öde"niz) · müzik (holdingin kendi işlerinde yok).

**B22 sentezinden sonra size gelecek iki açık karar** (FINAL.md'de olduğu gibi duruyor): stüdyo ekranının çizimi ve canlı akış için "media" olay kanalı.

**Kayıt:** kapsamın sahibi FINAL.md'dir, bu değişiklik ona kayıtlı uyarlama olarak girer. Tahta kaydı B43'tedir.

## B43'ün 18 Kasım'daki dokuz adımına göre ne değişti

- **Eklendi:** TopView sökümü (açık belgeler) ve TopView acil bağlantısı.
- **Netleşti:**
  - Ürün çekimi gerçek ürün fotoğrafından yapılır. Bugünkü görsel aracı fotoğraf almıyor; bu yol bağlanmadan o kabul testi açılmaz.
  - Referans dolabı aynı müşterinin onaylı eski işini bulup yeniden kullanır, müşteriler birbirine karışmaz.
  - Ses ve dudak senkronu yalnız reçetesi isteyen işte çalışır.
- **Değişmedi:** sıra ve onay kapısı aynı. Kartımızın ücretsiz tarafı ve referans dolabı, yönlendiriciyi beklemez.

## Adımlar

| # | Ne kurulur | Kabul testi | Açılma koşulu / sizin adımınız |
|---|---|---|---|
| 1 | **Söküm tablosu:** Higgsfield CLI, skills ve app-templates yapısı; TopView API belgesi, MCP araçları ve skill; ikisinin sitesine REA oturumsuz | her mod ve her uç nokta bir satırda: ne yapar, girdileri, hangi model (bilinmiyorsa "bilinmiyor"), kaynağı ve düzeyi; tahmin "gerçek" diye yazılmaz | bugün, evetinizle |
| 2 | **Model kataloğu:** her model bir dosya; ayarlar, girdiler (ilk ve son kare, referans, video), her rotaya çeviri; rota satırında üretici/aracı, uç nokta, kimlik doğrulama, bağlantı durumu | şemaya karşı test; bir model iki rotaya doğru gövdeyle çevriliyor; fiyatı bilinmeyen rota seçilemiyor | bugün |
| 3 | **Hazır ayarlar:** `/kisayol` istemden "model + parametre + girdiler + şablon"a çıkar; Higgsfield'ın efektleri, 9 reklam modu, 10 ürün çekimi modu; TopView'un avatarlı reklam akışı (ürün linki → senaryo → çekim → senaryo değişince yalnız etkilenen adım yeniden → dışa aktarma) | 1. adımın her modu "alındı / ertelendi / bizde zaten var" diye işaretli; avatarlı reklam akışında senaryo değişince hangi adımın yeniden yapıldığı ve yeniden fiyat gerekip gerekmediği testte görünüyor | şema bugün; gerçek üretim testi, ürün fotoğrafı alan yol bağlanınca |
| 4 | **TopView bağlayıcısı** (LiteLLM 2026-11-19'da v1.110.1'e yükseltildi): FINAL.md'nin uzak iş kolu (`remote`) içinde bir rota; gönder, sorgula, indir, dosyayı denetle, maliyet kaydı | sahte sunucuyla: onaysız işte dış çağrı sıfır; onaylı işte tek gönderim, kalıcı uzak iş kimliği, yeniden başlatınca ikinci gönderim olmadan sorguya devam, yanıt kaybolursa ikinci ücret yok; olağan işte TopView seçilmiyor, acil işte gerekçesiyle öneriliyor | kod ve testler bugün; canlı bağlantı için: büyük dosya yüklemesi proxy'den geçiyor, ücretsiz bir doğrulama ucu bulunuyor (bulunamazsa canlı ilk kanıt ilk onaylı acil iştir) · hesap: sizin Google "İzin ver"iniz · anahtar: "Create key / Copy" · kredi: sizin "Öde"niz |
| 5 | **Bağlantılar ve yönlendirici** (FINAL.md faz 1-3): beş hesap, anahtar yakalayıcı, katalog taraması, işe tek onay kartı | her rotanın fiyatı kodla; taban altındaki ucuz yol seçilmiyor; geçmiş 3 işimize örnek kart | LiteLLM yükseltmesinden sonra · ~15 tık, para yok |
| 6 | **Kartımızın ücretsiz tarafı:** büyütme (SeedVR2 zaten bağlı, yalnız ölçülür), arka plan silme, dudak senkronu, hareket aktarma, ses (Voice Studio kaynağı diskte, oradan devam) | her biri için bellek, süre ve sizin gözünüz | kurulacak her model için sözünüz |
| 7 | **Referans dolabı:** müşterinin ürünleri, karakterleri, marka kiti (sitesinden okunur), sesleri, onaylı eski işleri | aynı müşterinin onaylı bir varlığı bulunuyor, işe veriliyor, ondan varyasyon üretiliyor; başka müşterinin varlığı hiçbir zaman gelmiyor | 2. adımdan sonra |
| 8 | **İş akışları:** link → marka kiti → senaryo → çekimler → video → (reçete isterse ses ve dudak) → kurgu | bir ürün linkinden reklam videosu, uçtan uca | işin kartında "Onayla" |
| 9 | **Tek çağrı yolu:** Web Studio (B84), ajans (B28) ve kanallar stüdyoyu aynı fiyat ve onaylı iş yoluyla çağırır | gerçek çalışan yetkisiyle bir B84 ürün görseli isteği: fiyat → onay → durum → çıktı | 5. adımdan sonra |
| 10 | **Oturumlu söküm** iki platformda, eksiksiz: her stüdyo, her mod, şablonlar, canlı iş gövdeleri — 1. adımla birlikte, şimdi | REA kaydı; bulunan her şey kataloğa ya da hazır ayara işleniyor | iki platforma giriş sizin tıkınız; ücretsiz kredi biterse deneme işinin parası sizin "Öde"niz |
| 11 | **Ekran:** B32'nin yöntemiyle; istem alanı, galeri, eski işten varyasyon | sizin gözünüz | B22 sentezinden sonra, iki açık kararla |

## Riskler (birer kez)

- **TopView'un ucuz "sınırsız"ı bize yok:** sınırsız yalnız sitelerinde ve elle kullanılır; API yalnız standart krediden düşer. Acil yolun gerçek maliyeti, iş geldiğinde kabul edilen çıktı başına hesaplanır.
- **Kota:** bugünkü dilim Opus 5.5 ile ve hesabın kalan haftalık kotasıyla yapılır. Kota Cumartesi 09:00'da yenilenir; o sabah B85 temel tasarımı da başlar, 5-9. adımlar onun yanında sıra alır.
- **Tahta sırası:** yapımın tahta yeniden dizildikten sonra başlaması yazılıydı. Evet derseniz B43 şimdi öne alınır.
