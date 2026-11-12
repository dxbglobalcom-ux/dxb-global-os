# Sol — the friction piece (commits 713fe5f4, c7ae49e4, 851336e7): the report as it came

GPT-6.1 Sol, high, one blind pass, read-only, 2026-11-12. The outcome of each finding is in SOL.md.

men karşılıyor; bu üç commit için temiz denetim veremiyorum.** İş, istenen üretim kolaylıklarını getiriyor ve yöntemi tek bir görünüme kapatmıyor. Ancak **üç A engeli** var: anahtarın yanıt üzerinden sızması, iş dışındaki dosyanın yüklenebilmesi ve timeout’un ana süreci durduramaması.

Denetlenen commit’ler: `713fe5f4`, `c7ae49e4`, `851336e7`; taban `4951d038`. İlgili çalışma ağacı son commit ile aynı. Graf 28 commit geride ve bu işe ait düğüm taşımıyor; doğrudan belirtilen kaynakları ölçtüm. Hiçbir dosyaya yazmadım, gerçek anahtar veya dış ağ kullanmadım.

Ham çıktılar:

```text
TYPECHECK_EXIT=0

Test Files  165 passed | 1 skipped (166)
     Tests  1566 passed | 15 skipped (1581)

Test Files  28 passed (28)
     Tests  449 passed (449)

sandboxed suite : exit 0
host suite      : exit 0
bench residue   : none
BATTERY_GREEN
EXIT=0
```

Bu işin sandbox tarafında **67 + 17 + 12 = 96**, host tarafında **26 + 3 = 29** testi çalışmış: **125 test, bu işe ait atlanan test yok.** Yeşil sonuç aşağıdaki karşı örnekleri kapsamıyor.

**A1 — İddia 3 / madde 6: anahtar hiçbir çıktıya ulaşamaz · REFUTED · A**

**Bulgu:** [motion-read.mjs:77](</home/dxb/DxB Global OS/tools/motion-graphics/lib/motion-read.mjs:77>) yalnız başarısız HTTP yanıtının metnini maskeliyor. Başarılı JSON içindeki alanlar ve fırlatılan istisnalar bu sınırdan geçmiyor:

- `candidates[].content.parts[].text`, satır 162’de doğrudan rapora yazılıyor.
- `file.name` ve `file.uri`, satır 108’de upload kaydına yazılıyor; URI, satır 157’de sonraki isteğin gövdesine giriyor.
- `promptFeedback.blockReason`, satır 161’de hata metnine giriyor; [mg.mjs:363](</home/dxb/DxB Global OS/tools/motion-graphics/mg.mjs:363>) bunu terminale basıyor.
- Satır 80’deki `await http(...)` çevresinde anahtarı temizleyen istisna sınırı yok. `Refusal` terminale taşınıyor; diğer hatalar `mg` dışına fırlıyor.

**Kanıt:** Yalnız sentetik anahtar, sahte HTTP ve bellekte tutulan dosya yazımlarıyla:

```text
success-echo: keyInWrittenReport=true
upload-echo:  keyInUploadRecord=true, keyInQuestion=true
block-echo:   keyInThrownText=true
mg çağrısı:   keyInMGPrintedText=true
```

HTTP 400 gövdesindeki düz anahtar tekrarı maskelendi. HTTP 302 reddedildi; `request` yönlendirmeyi takip etmiyor. Bunlar yukarıdaki yolları kapatmıyor.

**Düzeltme:** Başarılı yanıtlar, upload kimlikleri/adresleri ve bütün istisnalar için ortak gizlilik sınırı kurulmalı. Beklenmeyen upload adresi reddedilmeli; rapora, kayda, sonraki URL/gövdeye veya hata metnine girecek değerler anahtarı taşıyamamalı. Bu dört karşı örnek teste eklenmeli.

**A2 — İddia 3: yalnız işin filmi yüklenir · REFUTED · A**

**Bulgu:** [mg.mjs:298](</home/dxb/DxB Global OS/tools/motion-graphics/mg.mjs:298>) verilen yolu `resolve` ediyor ve yalnız varlığını kontrol ediyor. [motion-read.mjs:149](</home/dxb/DxB Global OS/tools/motion-graphics/lib/motion-read.mjs:149>) film olmayı uzantıyla belirliyor; satır 105 dosyanın bütün baytlarını gönderiyor. Kaynağın gerçek yolu için iş sınırı, video akışı veya işe ait çıktı kontrolü yok. `insideJob` burada yalnız raporun **hedefini** koruyor.

**Kanıt:** İş dışında duran, `.mp4` adı verilmiş sıradan metin bellekteki dosya sistemiyle kabul edildi:

```text
accepted=true
externalNonFilmUploaded=true
```

Üstelik `motion-graphics-read.test.ts:121` mevcut testinde iş dışındaki dosyanın yüklenmesi özellikle başarı olarak bekleniyor.

**Etki:** Yanlış yol veya bağlantı, işe ait olmayan dosyanın Gemini’ye gönderilmesine yeterli.

**Düzeltme:** Yüklemeden önce gerçek yol iş klasöründe kalmalı; bağlantı kaçışı reddedilmeli ve dosyanın video taşıdığı doğrulanmalı. Verilen film ile sorulan formatın ilişkisi denetlenmeli. Mevcut dış-dosya testi tersine çevrilmeli.

**A3 — İddia 6 / madde 9c: timeout asılı aracı durdurur · REFUTED · A**

**Bulgu:** [mg.mjs:156](</home/dxb/DxB Global OS/tools/motion-graphics/mg.mjs:156>) `spawnSync` timeout’unu kullanıyor. Varsayılan sonlandırma sinyalini yok sayan **ana süreç** için `spawnSync` beklemeye devam ediyor. Bu, önceden bildirilen “çocukları yaşayabilir” meselesinden ayrı.

**Kanıt:** SIGTERM’i yok sayan küçük Node sürecini dış gözetmenle ölçtüm; ardından süreçleri temizledim:

```text
configuredTimeoutSeconds=0.15
stillRunningAfterSeconds=1
runnerHung=true
```

**Düzeltme:** Ana sürecin sonlanmasını sınırlı süre içinde zorlayabilen bir timeout uygulanmalı; SIGTERM’i yok sayan süreç testi eklenmeli. İki saatlik varsayılanın kendisi uygun; durdurma garantisi eksik.

**İddia 1 — Dokuz maddenin bütün alt parçaları**

Aşağıdaki “ayakta” hükümleri **STANDS AFTER ATTEMPTED REFUTATION** anlamındadır. A/B/C yalnız kusurlara verilmiştir.

| Madde | Verdict | Bulgu, kanıt ve gereken düzeltme |
|---|---|---|
| **1 — init** | **STANDS AFTER ATTEMPTED REFUTATION** | `mg.mjs:196`, `job.mjs:139`: tekrarlı formatlar, LUFS, spec ve brand yazılıyor. `motion-graphics.test.ts:144` gerçek dosya içeriğini literal beklentiyle karşılaştırıyor. Bellek sınamamda `--lufs -16`, `--lufs=-16` ve iki yazımla `-16.5` geçti. Düzeltme yok; sayısal uçlar aşağıda. |
| **2 — help** | **STANDS AFTER ATTEMPTED REFUTATION** | `mg.mjs:115`, `:127`, `:357`: genel ve komuta özel yardım işi açmadan çalışıyor. `motion-graphics.test.ts:911–938` her komutun bayraklarını dışarıdaki boş klasörden sınıyor. Düzeltme yok. |
| **3 — boyut tuzağı** | **STANDS AFTER ATTEMPTED REFUTATION** | `templates/page.html:30` boyutu yalnız `FILM` içinde tanımlıyor; `:75` kökün boyutunu alıyor. `job.mjs:176` eski bloğu okuyabiliyor. İlk filmin gerçek `mg events` çağrısı 1920×1080, 30 fps, 15 saniye ve 13 olayı döndürdü. Düzeltme yok. |
| **4 — format başına board** | **STANDS AFTER ATTEMPTED REFUTATION** | `board.mjs:39`, `:61`: orta zamanlardan `takeStills` kullanılıyor; format başına çıktı var; çizilemeyen/eski board için gerekçe söyleniyor. Sandbox testleri ve `film.host.test.ts:307` gerçek görüntü testi birlikte destekliyor. Test bağımsızlığı kusuru aşağıda. |
| **5 — sheet** | **REFUTED · B** | Normal `--format all` ve sonlu pencere çalışıyor; fakat `mg.mjs:244` yalnız `> 0` arıyor. `--window Infinity` kabul edilip snapshot’a `NaN` gönderiliyor. Bellek sınaması: `infiniteWindowAccepted=true`, ilk zaman `"NaN"`. Sonlu sayı şartı ve testi gerekli. |
| **6 — motion-read** | **REFUTED · A** | Komut, 10 fps, formatın kendi çerçevesi, rapor ve retry var. A1 ve A2 güvenlik sözleşmesini çürütüyor. Gerçek servis davranışı ayrıca doğrulanmamış. |
| **7a — sfx adı** | **REFUTED · B** | Normal kopyalama ve çakışmada koruma var. `sound.mjs:73` kaynak için yalnız sözcüksel yol sınırı kullanıyor; `statSync` bağlantıyı takip ediyor. Set içindeki dışarıya bağlı kaynak kabul edilebiliyor. Gerçek kaynak yolu da sınırlandırılmalı. |
| **7b — trim** | **STANDS AFTER ATTEMPTED REFUTATION** | `sound.mjs:58`, `:107`: bare array korunuyor; trim her cue’nun dB’sine ekleniyor. Literal amplitüd beklentileri `test.ts:581` içinde. Zaman, hizalama ve fade hesapları trim tarafından değiştirilmiyor. |
| **7c — LUFS hareketi** | **STANDS AFTER ATTEMPTED REFUTATION** | `verify.mjs:52`: `target - measured`; işaret doğru. `test.ts:689` civarındaki gerçek ffmpeg testi hem artırmayı hem azaltmayı sınamış. Sessizlik için uydurma hareket sayısı basılmıyor. |
| **8a — outline** | **STANDS AFTER ATTEMPTED REFUTATION** | `outline.js:135`, `:176`, `:194`: yeniden örnekleme, yön, başlangıç kaydırma ve morph var; eşleşme uyarısı açık. Tarayıcı geometrisine, saate veya rastgeleliğe bağlı değil. Kare, eğri ve ara şekil beklentileri literal. `meet/place` kusur sayılmadı. |
| **8b — blur** | **REFUTED · B**, float16 **UNVERIFIED** | Örnekleme ve ortalama var. Ancak `motion-blur.js:41`, verilen context dışında global `document` istiyor; yalnız canvas verilince `document is not defined`. “Olduğu gibi geri gelir” iddiasının gerçek canvas kanıtı testlerde yok. Ayrıntı aşağıda. |
| **9a — WebGL guard** | **STANDS AFTER ATTEMPTED REFUTATION** | `guard/index.html:40`, `:47`, `:60`: hareketli çubuk WebGL ile çiziliyor. Host testi `:376` seek dinleyicisini kaldırıp gerçek 150 karelik donmuş filmi reddettirmiş; ham bataryada çalışmış. |
| **9b — belirsiz master** | **STANDS AFTER ATTEMPTED REFUTATION** | `job.mjs:117`: ortak suffix dilbilgisiyle çakışmalar açılışta reddediliyor. `a/a-2x`, `a/a-24fps`, `a/a-2x-24fps` bellek sınamamda reddedildi. |
| **9c — runner timeout** | **REFUTED · A** | A3. Ayrıca `DXB_MG_TOOL_TIMEOUT=Infinity` açık bir `Refusal` yerine ham `RangeError` fırlatıyor: `mg.mjs:142`. Sonlu ve geçerli timeout doğrulaması da gerekli. |

**İddia 2 — SKILL, CONTRACT ve gerçek komutlar uyuşur · REFUTED**

Yeni davranışların büyük kısmı doğru belgelenmiş. Fakat anahtar ve timeout garantileri A1/A3 nedeniyle gerçeği aşmaktadır: `CONTRACT.md:64`, `:77`; `SKILL.md:135`.

Bulduğum diğer farklar:

| Sınıf | Konum ve fark | Correction required |
|---|---|---|
| **C** | `SKILL.md:122`: `init` tablosunda CLI’nin aldığı `--title` yok; CLI `mg.mjs:43`. | Tabloya ekle veya tablonun kısa gösterim olduğunu açıklaştır. |
| **C** | `SKILL.md:124`, `CONTRACT.md:71`: `stills --format name` tabloda yok; gerçek CLI `mg.mjs:58`. | Komut gösterimine ekle. |
| **C** | `SKILL.md:130`, `CONTRACT.md:78`: `hf update --guard` yok; gerçek CLI `mg.mjs:99`. | Desteklenen override’ı göster. |
| **C** | `SKILL.md:131`: `blender --need-mb` yok; CONTRACT bunu açıklıyor, CLI alıyor. | Skill tablosunu tamamla. |
| **C** | `SKILL.md:133` genel `--job` cümlesi `hf` ve `init` için geçerli değil. CONTRACT istisnayı doğru söylüyor. | İstisnayı skill’de de belirt. |
| **C** | `CONTRACT.md:98`: eksik host araçlarında testlerin skip edeceğini söylüyor. Mevcut host testleri eksik aracı hata sayıyor. | Kayıt gerçek test politikasına uysun. |

Çıktı yollarında başka çelişki bulmadım: ilk board `board/board.png`, sonraki formatlar `board/board-<format>.png`; still’ler `out/stills/<format>/at-<t>s.png`; sheet’ler `out/sheets/<format>/`; render’lar `out/<slug>-<format>[-<n>x][-<n>fps].mp4|mov`; doğrulama `out/verify.json`; hareket raporu `out/motion-read-<uzantısız-film-adı>.txt`, upload kaydı bunun yanındaki `.upload.json`.

**İddia 3 — motion-read’in kalan davranışları**

**STANDS AFTER ATTEMPTED REFUTATION:** `motion-read.mjs:80` her isteğe 600.000 ms veriyor; 503 için toplam beş deneme, arada 20 saniye var. Günlük kotayı adlandıran 429 açık açıklama ve `--model` seçeneklerini veriyor; dakika kotasını günlük diye adlandırmıyor. Dikey format sorusu dikey boyutları taşıyor. Gövdelere film ve sorusu dışında başka yerel dosya ekleyen yol bulmadım; A2 hangi dosyanın “film” sayıldığı sınırını bozuyor.

**UNVERIFIED:** Gerçek günlük kota cevabı, 503 ve 200 saniyeyi aşan Gemini yanıtı bu commit’lerin testlerinde canlı servise karşı ölçülmemiş. Bu, sahte çağrı kullanılması kararının kusuru değil. Testler üretilen istek ve uygulama mantığını kanıtlıyor. Gerçek HTTP sarmalayıcısı ayrıca yerel sunucuda 400 ms gecikme ve 100 ms timeout ile sınanmış; on dakika gerçekten beklenmiş değil.

**İddia 4 — sound güvenliği ve salt okunur verify**

**REFUTED · B:** [sound.mjs:73](</home/dxb/DxB Global OS/tools/motion-graphics/lib/sound.mjs:73>) `sfx:` için `resolve` + prefix + `statSync` kullanıyor. `../` ve dış mutlak yol reddediliyor; fakat set içindeki dosya veya ara dizin bağlantısının gerçek hedefi denetlenmiyor. `cpSync` bağlantıyı iş klasörüne taşıyabilir; sonrasındaki decode dış hedefi okuyabilir.

Bellekte dış hedefe çözülen kaynakla ölçüm:

```text
linkedSourceCopyAccepted=true
checkedSourceRealpath=false
```

**Düzeltme:** Kaynak set kökü ve kaynak dosya gerçek yollarıyla karşılaştırılmalı; dış hedef reddedilmeli. İşin sahip olduğu normal dosya kopyası oluşturulduğu da kanıtlanmalı. Bağlantı ve ara-dizin bağlantısı testleri eksik.

**STANDS AFTER ATTEMPTED REFUTATION:** `verifyFilms` yalnız planlıyor; `bringStarterSounds` çağırmıyor. Yazımları `out/verify.json` ile sınırlı. Eksik starter kopyasının verify tarafından oluşturulmadığını `motion-graphics.test.ts:554` sınamış. Trim ve LUFS işareti yukarıdaki 7b/7c sonuçlarını taşıyor.

**İddia 5 — yardımcıların saflığı, determinizmi ve blur doğruluğu**

**Outline: STANDS AFTER ATTEMPTED REFUTATION.** Hesaplar düz veri üzerinde; rasterizasyon `trace`e verilen context üzerinden. Saat veya rastgelelik yok. Özellik kaldırılırsa literal geometrik beklentiler kırılır.

**Blur: REFUTED · B.** Global DOM bağımlılığı `motion-blur.js:41`de. Canvas/context verilmesi tek başına yeterli değil. Canvas oluşturucu verilmesi veya canvas üretiminin ayrı bir adaptöre taşınması gerekir.

**“Duran resim çizildiği gibi geri gelir”: koşulsuz hali desteklenmiyor.** `motion-blur.js:27` zaten 8 bit birikimde ölçülen sapmayı söylüyor; bilinmeyen `colorType` seçeneğinde sessizce 8 bite düşüyor. Buna rağmen `references/craft.md:36` ve helper’ın giriş açıklaması sonucu koşulsuz anlatıyor.

`motion-graphics-page.test.ts:140` içindeki tek piksellik canvas, gerçek canvas’ın 8 bit/float16 yuvarlamasını modellemiyor. `:214` testi yalnız `"float16"` **istendiğini** doğruluyor; alındığını doğrulamıyor.

**UNVERIFIED:** HyperFrames’in gerçek Chrome’unda `getContextAttributes().colorType` sonucu ve helper ile doğrudan çizimin piksel farkı bu denetimde ölçülmedi. Kaynaktaki “Chrome 152’de ölçüldü” yorumu tek başına kanıt değil.

**Düzeltme:** Gerçek render tarayıcısında context türü ve piksel farkı testi; float16 yokken açıkça tanımlanan davranış; aynı canvas tekrar kullanılarak aynı zamanın tekrar çizilmesi testi gerekli.

**İddia 6 — özellikle istenen uç girdiler**

- **Çakışan master adları:** reddediliyor; 9b ayakta.
- **Tek formatta `--format all`:** `formatsNamed` tek eleman döndürüyor; board/sheet/render döngülerinde buna özel yanlış dal yok.
- **Eski iş klasörü:** ilk filmin `events` çağrısı gerçekten geçti. Yeni helper’a göç gerektiren çağrı yok.
- **Eski board.html:** `board.mjs:41` kare üretimini atlayıp açık gerekçe veriyor; bu davranış CONTRACT ile uyumlu.
- **Negatif LUFS:** boşluklu ve `=` yazımları, ondalıklı değerlerle de geçti.
- **Tam limit anında biten süreç:** aynı anda timeout/exit yarışının hangi tarafının kazanacağı zamanlayıcıya bağlı. Bundan bir ürün kusuru çıkarmadım; kesin sınır davranışı **UNVERIFIED**. SIGTERM’i yok sayma ise ölçülmüş A3.
- **`--window Infinity`:** yeni **B**; `NaN` zaman gönderiyor.
- **Format adı `all`:** `job.mjs:120` kabul ediyor, `:169` bunu bütün formatlar anlamında yorumluyor. Böyle adlandırılan format tek başına seçilemiyor. **C**, tabanda da bulunan ad/anahtar çakışması; ad rezerve edilmeli veya seçme sözdizimi ayrılmalı.
- **`init --dur Infinity`:** `mg.mjs:202` kabul ediyor; timing’in JSON dönüşümü ve board hazırlığı sonradan hata veriyor, yarım iş bırakabiliyor. **C**, aynı sonluluk açığı tabanda da var.

**İddia 7 — testler özellik yokken kırılır ve bağımsızdır · REFUTED · B/C**

| Test grubu | Verdict / bulgu | Correction required |
|---|---|---|
| Init, boyut, format adları, help | **STANDS AFTER ATTEMPTED REFUTATION.** Beklenen job verisi ve bayrak listeleri bağımsız literal değerler. | Sonlu olmayan sayılar için eksik negatif testleri ekle. |
| Board sandbox | **REFUTED · B.** `test.ts:269` ortak sayfayı değiştiriyor; `:282` ve `:311` önceki testin bu değişikliğine dayanıyor. Tek başlarına seçildiklerinde starter sayfa nedeniyle farklı yola girerler. | Her test kendi sayfasını hazırlasın. |
| Board host | **STANDS AFTER ATTEMPTED REFUTATION**, sınırlı. Gerçek still boyutları, board yüksekliği ve parlaklığı ölçülüyor. | Bütün karelerin doğru zamana ait olduğuna piksel/ayırt edici içerik kontrolü eklenmesi kanıtı güçlendirir. |
| Sheet | Bayrakların argümana dönüşümü **ayakta**. Yeni pencere değeri ve çoklu format mantığı esasen sahte HyperFrames ile sınanıyor. | Yeni pencereyle gerçek host snapshot testi ve `Infinity` reddi ekle. |
| Motion-read | **REFUTED · B.** Test `read.test.ts:121` dış dosyayı kabul etmeyi şart koşuyor. Gizlilik testi `:243` başarı yanıtındaki anahtar tekrarını, upload alanlarını, blockReason’ı ve istisnaları denemiyor. | A1/A2 karşı örneklerini ekle; dış dosya beklentisini tersine çevir. |
| Sound / trim / LUFS | Temel davranış **ayakta**; amplitüd beklentileri literal, LUFS testleri gerçek ffmpeg üzerinden. | Starter kaynak bağlantısı testi ekle. |
| Outline | **STANDS AFTER ATTEMPTED REFUTATION.** Kare, yön, kaydırma, eğriler ve ara morph için bağımsız beklentiler var. | Zorunlu düzeltme yok. |
| Blur | **REFUTED · B.** Sahte canvas gerçek sayısal hassasiyeti kanıtlamıyor. Determinizm testi `page.test.ts:242` her defasında yeni canvas açıyor; cache’in önceki kareden temizlenmesini sınamıyor. | Gerçek canvas ve aynı canvas üzerinde tekrar testi gerekli. |
| Runner | **REFUTED · B.** `test.ts:884` varsayılan süreyi yalnız bir saniyelik süreç ve yardım metniyle bağlıyor. Gerçek varsayılan iki saniyeye düşse, yardım değişmese bu test geçebilir. SIGTERM yok sayma yok. | Gerçek timeout seçimini bağımsız sınayan test ve A3 süreci ekle. |
| WebGL guard | Gerçek donma kontrolü **ayakta**. Ancak testler `film.host.test.ts:361`in bıraktığı `0.9.37` durumuna dayanıyor: **C**, önceden mevcut sıra bağımlılığı. | Her red senaryosu kendi eski “good” sürümünü kursun. |

Yeni matematik testlerinde, beklenen değeri bütünüyle üretim algoritmasıyla yeniden hesaplayan belirgin bir oracle bulmadım. Asıl açıklar **eksik karşı örnek, gerçek davranış yerine fake, paylaşılan durum ve saatle ölçülen timeout** tarafında.

**İddia 8 — kapsam ve kopya bütünlüğü**

**STANDS AFTER ATTEMPTED REFUTATION:** Bu üç commit yeni bir zorunlu görünüm veya müzik eklemiyor; başlangıç ses seviyelerini değiştirmiyor. HyperFrames çağrısı `hyperframes.mjs:35`te iş klasöründen yapılıyor. Kök `package.json` taban ve son commit’te aynı blob:

```text
9e4ec85251eac1e616e31a744bf60dda73839ece
```

Plugin içindeki skill kanonik dosya; `~/.claude/skills/dxb-motion-graphics` doğrudan ona bağlı. İncelenen yollarda ayrışan ikinci skill/mirror bulmadım.

**REFUTED · A:** “Anahtar sızamaz” kısmı A1 nedeniyle ayakta değil. Bu denetimde gerçek bir anahtarın sızdığına ilişkin bulgu yok; sızma yolu sentetik değerle kanıtlandı.

**UNVERIFIED:** İlk filmin klasörü Git dışında olduğundan commit farkı geçmişte hiç değiştirilmediğini kanıtlayamaz. Mevcut sayfa yeni yardımcıları kullanmıyor ve gerçek `events` çağrısı geçti. Mevcut `out/verify.json` iki master için `ok:true` taşıyor. Yeni verify ölçümünde bütün yazımları bellekte engelledim; ancak alt süreçte ffmpeg başlatma `spawnSync ffmpeg EPERM` ile reddedildi. Bu nedenle ilk filmin güncel verify sonucunu ürün hatası saymıyorum ve geçmiş yeşil kaydı yeni ölçüm diye sunmuyorum.

**Gerekli düzeltmeler:** Önce A1–A3; ardından starter kaynak bağlantısı, sonlu sayı doğrulaması, blur’un DOM/hassasiyet sözleşmesi ve bunları kaçıran testler. Görsel kalite ve gerçek float16 davranışı ayrıca **⚠ UNVERIFIED — requires human-eye confirmation** olarak kalıyor.
