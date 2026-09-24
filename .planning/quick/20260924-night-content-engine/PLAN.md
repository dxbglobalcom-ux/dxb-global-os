# B43 — SIGNAL FOR THE HOLDING (the night content engine) · PLAN

**Status: PLAN — rewritten 2026-09-24 after the whole source was watched and heard; NOTHING IS BUILT; it waits for his eye.** <!-- OPEN: B43 -->
Written by the session dxb-e4 (Opus 5.5). The first version (committed `ddc5aada`, corrected `cb23a49c`) was written from a delegated summary and is replaced whole (LAW A).
His orders, in his words (2026-09-24): *"buradaki 00:42 ile 2.5 dakkaya kadar olan kısmı izlesin burada bir sistem var … onu biizm dxb global os holding projesi için hazıryalabilir miyiz bu özellikte olsun. planı projesi yazılsın hazırlansın tahtaya ilgili satırın altına konulabilir. 147dk sürmüş opus 5.5 ile yapıor zaten."* · *"rakiple alakası yok bunun ya orada bir sistemden bahsedior. onu istiorm holdinge olay bu"* · *"instagram okuma aracı da tahtaya yazılmıştı"* · *"yani bu bir ürün aslında"* · *"herşeyi izle dinle ve sonra planını hazırla neler yapılacak"*.
**This is a PRODUCT to build for the holding, not a rival study: no rival-intel row, no rival report.**
The build spec the video's builder gave Opus 5.5 is kept verbatim beside this file: `SOURCE-PROMPT.md`.
Body in Turkish because he reads it (precedent: B47's PLAN.md).

## What was watched and heard (measured this session)

| Source | How it was read |
|---|---|
| Jacob Lee's original reel `instagram.com/p/Dah3raWzV4i` (2026-07-08, 63 s, 1440×2560 VP9 + AAC, sha256 `dcac858bd39dc4de2c419c04802fbe0af976412afd9d653c08998d5237d2bdf8`) | Downloaded with sound, transcribed whole on the holding's own Speaches; **all 52 visually distinct frames** (of 63 at 1 fps) viewed by the chief engineer |
| `youtube.com/watch?v=vUjAgGa8tAU` 00:42–02:30 (Dubibubi, 2026-09-23) | Full transcript read; 1080p60 frames viewed by the chief engineer (the clip of Jacob Lee's reel, the pipeline screen, the prompt document, the scoreboard) |
| The same video 03:36–12:10 (what Opus 5.5 built from the prompt, what Astra built, the scoreboard) | Full transcript read; **237 distinct frames OCR'd whole**; the call sheet, video detail, video board and script studio screens viewed by the chief engineer |
| The build prompt (Google Doc in the video description) | Read whole; saved verbatim as `SOURCE-PROMPT.md` |

Frames and media stay in the session scratchpad; nothing from the source enters the repo except the prompt text.

---

# SIGNAL — HOLDİNG İÇİN İÇERİK İSTİHBARATI ÜRÜNÜ — PLAN

## İki cümle (tahta kuralı 7)

1. **Ekranınızda ne olacak:** Siz uyurken makine seçilen alandaki hesapların yeni videolarını okur. Sabah tek sayfada "şu an önemli olan 5 kalıp" durur ve her kalıbın yanında kaç videoya dayandığı ve bir sonraki videomuzda ne yapılacağı yazar. Her videoya tıklandığında sahne sahne kırılımı, neden patladığı ve kendi ortalamasının kaç katı izlendiği açılır. Sayfanın sonunda stüdyomuz için kanıtlarını gösteren, çekime hazır bir senaryo durur. Evet derseniz stüdyonun sırasına girer.
2. **Bunu kanıtlayan tek komut:** `node scripts/signal/proof.mjs --today`. Şunu basar: "N hesap · M yeni video · M'nin M'si indirildi / yazıya döküldü / çözümlendi · 5 kalıp bugün yeniden hesaplandı · senaryo bugün yazıldı · dış maliyet $X". Yalnız bu sabahki tur baştan sona koştuysa 0 ile çıkar. Cetvel Faz 1'de, işten önce yazılır.

## 1. Sistem — tam olarak ne

### 1a. Jacob Lee'nin kendi sistemi (orijinal video, sesiyle ve bütün kareleriyle)

- **Ne yapıyor:** "Nişimdeki her hesabı ben uyurken tersine mühendislikle çözen bir sistem kurdum. **Asıl mesele pano.**" Pano her sabah hesapların son videolarıyla kendini yeniden kuruyor: kim paylaşıyor, hangi açılışlar kullanılıyor, hangi konu erişim çekiyor (T 0:00–0:13).
- **Hat:** Başlığı "Yerel hat — Apify + Scribe + Perplexity, Claude tarafından yönetilir". Renk açıklaması da ekranda: mavi "dış API (ücretli)", kırmızı "Claude (ücretsiz, oturum içi)", gri "yerel", yeşil "çıktı" (V 0:25–0:37).
  - `Elle başlat` → `Apify` (ücretli: videoları çeker) → `Ayıkla` (yerel) → `İndir` (yerel)
  - → `Scribe` (ücretli: yazıya döker) → `Claude` (ücretsiz: **puanlar + böler**) → **Kapı: puan ≥ 7 ve karar?**
  - Düşük puan → `defter: ATLANDI`
  - **7 ve üstü** → `Perplexity` (ücretli: adı geçen araçları araştırır) → `Claude` (ücretsiz: **not yazar**) → `SCRAPED-*.md` (not dosyası) → `Pano`
  - Alt yazı (V): "İki ücretli çağrı — Apify (çekme) + ElevenLabs (yazıya dökme). Claude her videoyu puanlar ve yazıyı Açılış / Vuruşlar'a böler … ücretsiz. Yalnız kapıdan geçen videolar Perplexity araştırmasını tetikler … buraya toplanan SCRAPED notu."
- **Pano (V 0:06–0:57):**
  - Başlık "COMPETITOR INTEL — Signal vs noise". Sağda @jlee.mov · 121 video · 7.064.826 izlenme · 2026-07-03.
  - Üç sekme: Pano · Tüm videolar · Hat.
  - Dört kutu: izlenen video 121 / 13 hesap · toplam izlenme 7.064.826 · en güçlü hesap @nateherkai 2.579.408 · **en çok tutan açılış "contrarian-claim" (karşı iddia), 35 video**. Sayılar açılışta sıfırdan sayarak yerine oturuyor.
  - "Son tur · 2026-07-03 · 12 video kapıdan geçti · izlemek ve kırılım için tıkla" diye video kartları. Her kartta başlık, hesap, izlenme / beğeni / yorum, açılış türü etiketi, puan x/10 ve açılış cümlesinin kendisi var.
  - "Hesaba göre erişim" çubuk sıralaması, "Tüm zamanların en iyi 10'u · performans × hedef kitleye uyum", "121 videonun hepsi".
  - **"Açılış türleri, sahada"**, tanımlarıyla birlikte: karşı iddia 35 · sorun→vaat 25 ("Hissettiğin acıyı adlandırır, sonra çözümü vaat eder") · önce sonuç 20 ("Sonuçla açar, açıklamadan önce çalışırken gösterir") · liste merakı 17 ("N adım vaat eder, ödülü sona saklar") · veri şoku 15 · hikâye 6 · kimliğe seslen ("Belirli bir grubu çağırır — kimlik + kaçırma korkusu") · diğer.
- **Video detayı (V 0:17–0:23):**
  - Video sayfanın içinde oynuyor. Etiket, puan, "KIRILIM · AÇILIŞ → VURUŞLAR → KAPANIŞ" başlığı altında her vuruş işleviyle yazılı ("VURUŞ 2 çerçeve — penetrasyon fiyatı → bağımlılık → kıtlık → zam").
  - **"Yazıya dökme notları"**: Claude, Scribe'ın yanlış duyduğu isimleri düzeltir ("N8N" → n8n).
  - **"ContentBrain açısı"**: Bu konuyu kendi videosunda hangi açıdan anlatacağının önerisi.
  - "Araçlar" (adı geçen araçlar), "Altyazı" ve iki düğme: "IG gönderisi ↗" · **"Obsidian'daki not"**. Her videonun notu sahibinin ikinci beynine yazılıyor.
- **Maliyet ve kazanç:** ayda yaklaşık 5 dolar (V+T). Haftada 3 saat kaydırma yerine 3 dakika okuma (V+T).
- **Kilit fikir, kendi sözü:** "Asıl kilidi açan açılış sınıflandırması: her video açılış türüyle etiketlenir; reel izlemeyi bırakır, **kalıp izlersin**." Ayrıca: "Aynı şablon eklediğim her hesapta çalışıyor" (T 0:38–0:54).

### 1b. Opus 5.5'e verilen talimat (tam metin `SOURCE-PROMPT.md`) — ürünün tarifi

- **Hesap ekle / çıkar.** Başlangıç listesi 18 hesap.
- **Toplanacak bilgi:** izlenme, beğeni, yorum, paylaşım, tarih, altyazı, süre, adres.
- **Her video için çözümleme:** açılış, açılış türü, ana konu, açı, biçim, yapı, vuruş vuruş kırılım, merak boşluğu, açık döngü, akış kırıcı, değer vaadi, duygusal tetik, kapanış çağrısı, neden tuttuğu, kopyalamadan neyin alınabileceği.
- **Performans zekâsı:** Ham izlenme değil. Normali 20 bin olan hesabın 200 bin yapması, normali 1 milyon olanın 1,2 milyon yapmasından değerlidir. Patlama puanı yöntemi kurulacak.
- **Kalıp bulma, "en önemli kısım":** tutan açılış türleri, yükselen konular, tekrar eden biçimler, benzer ilk cümleler, yapılar, kapanış çağrıları, hızlanan konular, rakiplerin boş bıraktığı alanlar. Hedef: "100 video izlemem lazım" yerine "şu an önemli olan 5 kalıp bunlar".
- **Senaryo üretici, "en çok önemsediğim":** Tüm veriden en yüksek tutma ihtimalli **özgün** senaryo. Konu, açılış, açı ve yapı seçilir; yanında neden seçildiği, kanıtı, ekran yazısı, süre ve kapanış çağrısı gelir; dayandığı videolar gösterilir.
- **Pano:** son videolar, en iyiler, en uç sapmalar, yükselen konu ve açılışlar, hesap karşılaştırması, fırsatlar, senaryo. Süzme, sıralama ve grafik var; tıklanınca detay açılır.
- **Otomatik yenileme.** Anahtarlar yalnız sunucuda durur. Uçtan uca çalışan ürün olacak, düğmesi boş maket olmayacak.

### 1c. Opus 5.5'in bundan 1 sa 24 dk'da kurduğu ürün: "SIGNAL"

Ölçüm panosuna göre 118,5 milyon token, 40,20 dolar (V 11:38). Ekranda "147.7M TOKENS LATER" yazan sayı iki modelin toplamı.

- **Sol menü:** Call sheet (günün işi) · Video board · Patterns · Script studio · Competitors · Pipeline · Settings.
- **Canlı iş paneli, sol altta, hep açık:** "Videolar çözümleniyor · 222 iş · Medya 435/435 · Yazı 434/435 · Çözümleme 156/435 · Sonraki yenileme 23 saat sonra". İş ilerledikçe sayılar artıyor. **Makine ne yaptığını ve ne zaman uyanacağını kendisi söylüyor.**
- **Call sheet:** üstte 435 video · 18 hesap · 149 çözümlendi · 30 günde 35 patlama · bu hafta 176. Altında **"Önemli olan beş kalıp"** var. Örneğin: "Ödül ilk karede, 2,5 saniyenin altında: 2,53 kat (n=12, 7 hesap, %98 isabet); 10 saniyeyi aşan girişler 0,72 kat (n=25)". Her kalıbın altında bir sonraki videoda ne yapılacağı yazılı. Yanda "Sıradaki çekim" senaryosu, "Yenile" ve "Tam brif".
- **Video board:** 393 video; 7 / 30 / 90 gün / tümü; hesap, seviye, açılış, konu ve biçim süzgeçleri; "patlama puanına göre" sıralama. Açıklama: "Her video, kendi hesabının normalini ne kadar geçtiğine göre sıralı."
- **Video detayı:**
  - "Hesabın ortancasına göre 17 kat · Patlama · Yüksek güven", yanında hesabın 24 videosu arasında bu videonun yerini gösteren nokta grafiği.
  - Puan 97/100 ve "Bu puan nasıl kurulur".
  - İlk kare ve ekran yazısı; merak boşluğu, yenilik, akış kırıcı gibi etiketler.
  - **"Yeniden kullanılabilir şablon"**: "[Araştırmacılar] az önce [bilimkurgu gibi bir şey yaptı] ve [onu daha da tuhaf bir şeye yaptırdı]".
  - Konu, biçim, kitle, konuşma hızı (201 kelime/dk), kurgu hızı (28,8 kesme/dk), açı.
  - **Storyboard**: 9 vuruş, her biri kendi karesi ve zaman koduyla (açılış, bağlam, yeniden kanca, kanıt …).
  - "Neden patladı", "Aynı konu, başka hesaplar", yapım notları.
  - Altında: "claude-opus-5 çözümledi · yazı ElevenLabs scribe_v2".
- **Script studio:**
  - "Söylenecek ilk cümle" ve "Ekran yazısı".
  - **A/B için 3 yedek açılış**, her biri kendi gerekçesiyle.
  - Editör puan kartı: açılış 8, izlenme 9, açıklık 9, özgüllük 8, özgünlük 9, kalıba uyum 9. "Tahmin: ortalamanın üstü."
  - "Editör geçişinde 9 düzeltme".
  - Zaman kodlu çekim metni: SUPER, sahne ve ses notlarıyla.
  - "Neden bu senaryo", 79 videodan kanıtlarla.
  - "Bir tur daha", kopyala / .md olarak indir.

### 1d. Zayıf yerler (videonun kendisi söylüyor)

- **Senaryo:** İki modelin de senaryosu zayıf; "veri çok, tutarlı senaryoya çeviremiyor" (T 07:57–08:20, 10:52–11:15).
- **Az örnekle kalıp:** Astra 2 videodan "9,3 kat" çıkarmış; biri 18 kat, öteki 0,4 kat (T 10:05–10:25).
- **Ekran yükü:** Opus'un ilk ekranı yazı yığını; "karar yorgunluğu" (T 08:40–09:00). Derin sayfaları ise daha iyi bulunmuş.

## 2. Holdinge nasıl oturur

**Tek motor, çok masa.** "Aynı şablon eklediğim her hesapta çalışır" (T 0:52). Bizde bir **masa** = bir iş + onun alanı + izlenen hesaplar. Aynı motor stüdyonun kendi hesabı için ve ajansın her marka müşterisi için ayrı masa açar. Bu yüzden ürün baştan çok masalı kurulur. Bir gün satılacaksa da hazır olur.

**Ne işe yarar (2026-09-24 konuşmasındaki hâli; sizin sözünüz: *"neişe yarar kısmı da çok güzel"*):**
1. **Her marka müşterisinin sektörü — asıl geliri getiren masa.** Örnek: Dubai'de bir restoranla anlaşılır; motor Dubai'deki diğer restoranların videolarında neyin tuttuğunu bulur, o restoranın reklamı buna göre yapılır. Marka aylık ücreti (B28'deki 8.000 dolar), reklam tahmine değil kanıta dayandığı için öder.
2. **DxB Holding Media-Studio'nun kendi hesabı.** Hesap açılıp büyüdükçe markalar bizi oradan bulur. Hesap açmak kimlik adımıdır, sizin onayınızla açılır.
3. **Rakip ajansların ne yaptığı.** Masanın hesapları rakip ajansların hesapları olur.
4. **Makinenin kendisi.** Çok masalı kurulduğu için bir gün başka ajanslara satılabilir; fiyatı ölçülmedi.

| Parça | Videoda | Holdingde (bugün ölçülen) | Karar |
|---|---|---|---|
| Çekme | Apify (ücretli) | Instagram okuma aracı **B48** (sizin girişinizi taşıyan köprü, kabul edilmiş); tek video yt-dlp ile iniyor (bu oturumda Jacob Lee'nin videosu böyle indi) | Önce B48 köprüsü. Yetmezse Apify fiyatıyla size gelir |
| Yazıya dökme | ElevenLabs Scribe (ücretli) | Kendi Speaches'imiz, $0 (bu oturumda 63 sn'lik video 1 çağrıda döküldü; "Apify" → "Appify", "Claude" → "Cloud" diye duydu) | Speaches + Jacob Lee'deki gibi **Claude'un isim düzeltmesi**; kalite yetmezse Scribe fiyatıyla size gelir |
| Düşünme (puan, kırılım, not, kalıp, senaryo) | Claude, **oturum içi, ücretsiz** | Claude Code aboneliği; zamanlayıcıdan başsız (headless) oturum. **UNVERIFIED — could not measure yet**; Faz 0'da ölçülür | Ücretsiz yol birinci. API ancak ölçülmüş ihtiyaçla |
| Araştırma | Perplexity (ücretli, yalnız kapıdan geçene) | dxb-research filosu (39 kanal, $0) | Filo, yalnız kapıdan geçene |
| Not | Obsidian'a `SCRAPED-*.md` | Holdingin hafızası | Her not holding hafızasına girer. **Hamza'ya "bu hafta ne tuttu?" diye sorduğunuzda sesli cevap verir** |
| Zamanlama | "Her sabah" + Elle başlat | `dxb-scheduler.service` (active) | Her sabah 06:00 + "şimdi çalıştır" düğmesi; yeni servis yok |
| Ekran | Pano + Hat sekmesi | B43 stüdyo odası; **çizimi B32'de onaylanmadan çizilmez** | Canlı iş paneli ve yanan hat düğümleri ilk günden tasarımda |
| Senaryo çıktısı | Kopyala / .md | B43'ün kendi sırası: senaryo → sahneler → çekimler | Sizin "evet"inizle stüdyo kuyruğuna |

**Döngü kapanır, videodakinin yapmadığı şey budur.** Sizin sözünüz (2026-09-24): *"her müşteriye ürettiğimiz videonun analizini makinamız izlemeli."* Stüdyonun bir müşteri için ürettiği her video, müşterinin hesabında yayınlanınca motor onun rakamlarını okur ve çözümler; kendi hesabımız açılınca onun videolarını da. Senaryonun tahmini ile gerçek sonuç yan yana yazılır. **Sırf deneme için video üretilmez:** sistemin asıl işi başkalarının zaten yaptığı denemelerden öğrenmektir; yayınlanan video olmasa da motor çalışır. Senaryo zayıflığının cevabı "daha çok veri" değil, **kendi işimizin sonucundan geri bildirim** (1d).

## 3. Fazlar — her biri önce/sonra ölçülü; kabul maddesi işten önce yazılır; kodu builder (max) yazar, refuter çürütmeye çalışır, her faz tek commit (dxb-crew)

| # | Faz | Ne yapılır | Kabul maddesi (komut → beklenen) |
|---|---|---|---|
| 0 | **Ölçüm** | B48 köprüsü bir hesabın son 12 videosunu adres ve izlenme sayısıyla okuyor mu? Zamanlayıcı başsız bir Claude oturumunu başlatıp JSON alabiliyor mu? Speaches ve Claude düzeltmesi 10 videoda isimleri doğru veriyor mu? | `scripts/signal/probe.sh` → 3 hesap × ≥10 video + izlenme · başsız Claude çağrısı JSON döner · 10 yazıda yanlış isim 0 |
| 1 | **Cetvel + veri** | Önce `proof.mjs`, sonra kanonik göç: masa, hesap, video, günlük rakam, yazı, çözümleme, kalıp, senaryo, not tabloları. Testler inşaat motorunda (54422) | `pnpm test tests/signal` yeşil; boş günde `proof.mjs` "0 yeni video" basar, 1 ile çıkar |
| 2 | **Çekme + yazıya dökme** | Tur: çek → ayıkla → indir (yalnız ses) → yazıya dök → isim düzeltme. Yarıda kesilirse yalnız eksiği yapar | Aynı tur iki kez: ikincisi 0 yeni iş; yazısız video 0 |
| 3 | **Çözümleme + kapı** | Talimattaki 15 alan; **sabit açılış sınıflandırması** (Jacob Lee'nin 8 türü başlangıç; yeni tür yalnız kanıtla eklenir); patlama puanı = hesabın kendi ortancasına göre kat + güven derecesi; **az örnek kuralı** (bir kalıp en az 5 video ve 3 hesaptan beslenmeden "kalıp" sayılmaz); kapı ≥ 7 | 50 videoda 15 alan dolu; kat sayısı elle hesaplanan 5 örnekle birebir; kapıda kalan video için 0 araştırma çağrısı |
| 4 | **Kalıplar** | "Önemli olan 5 kalıp": her biri kat, n, hesap sayısı ve isabetle ve **bir sonraki videoda ne yapılacağı** talimatıyla. Yükselen / soğuyan konular, boş alanlar | Her kalıp satırı kendi videolarına adres adres iner; n < 5 olan kalıp listede yok |
| 5 | **Senaryo stüdyosu** | Tek özgün senaryo: kanıtlı konu, açılış, açı, yapı; 3 yedek açılış; editör puan kartı ve düzeltme geçişi; zaman kodlu çekim metni; "neden bu senaryo" kanıtlarıyla. B43 sırasına girer | Senaryo dayandığı videoları gösterir; "evet"le B43 kuyruğunda iş olur |
| 6 | **Hafıza + Hamza** | Kapıdan geçen her videonun notu holding hafızasına yazılır; Hamza bu veriden cevap verir | Hamza'ya "bu hafta hangi açılış tuttu?" sorusu, kalıp tablosundaki ile aynı cevabı sesli verir |
| 7 | **Ekran** | B32'de çizimini onayladığınız oda: Call sheet · Video tablosu · Kalıplar · Senaryo stüdyosu · Masalar · Hat. **Canlı iş paneli** her an açık ("çözümleniyor 156/435 · sonraki yenileme 23 sa"); Hat sekmesinde çalışan düğüm yanar | Sizin kabul testiniz: sayfayı açarsınız, dokunmazsınız, işin ilerlediği görünür |
| 8 | **Döngü** | Her müşteriye ürettiğimiz video müşterinin hesabında yayınlanınca (ve kendi hesabımız açılınca onun videoları) okunur ve çözümlenir; senaryonun tahmini ile gerçek sonucu yan yana yazılır. Deneme için ayrıca video üretilmez | Yayınlanan her müşteri videosu için 7. günde çözümleme ve "tahmin vs gerçek" satırı var |

## 4. Sizin kararınız gereken üç şey

1. **İlk masa hangisi?** Önerim: **stüdyonun kendi alanı**; ajans müşterisi gelince onun masası aynı düğmeyle açılır. OUTLETEURO bu ürünün masası değildir (sizin sözünüz, 2026-09-24: *"Outleteuro DxB Holding kurulduktan sonra holding bir lüks marka e-ticaret sitesidir. gerek var şimdlik?"*).
2. **Ücretli yol:** Köprü ve Speaches Faz 0'da yetmezse Apify (videoda ayda yaklaşık 5 dolar) ve Scribe fiyatlarıyla önünüze gelir. Para çıkışı sizin onayınızdır.
3. **Paylaşım:** Önerim, motorun yalnız okuyup önermesi; paylaşma kararı her zaman sizde.

## 5. Bu ürünün asla yapmadıkları

- Hiçbir şey paylaşmaz, yorum yapmaz, beğenmez; yalnız okur.
- **Bahis içerikli hesap okunmaz, bahis senaryosu yazılmaz** (B28'deki mutlak çizginiz).
- Rakibin videosunu kopyalamaz. Talimattaki kural aynen geçerli: "kopyalamadan neyin alınabileceği".
- Yeni servis, yeni kuyruk açmaz; ücretli araç ancak onayınızla girer.
- Çizimi onaylanmadan tek satır ekran kodu yazılmaz (B32).

## 6. Maliyet

Videoda ayda yaklaşık 5 dolar (V+T). Bizde yazıya dökme, araştırma ve zamanlama $0 (ölçüldü). Düşünme işi abonelik içinde yürüyebilirse o da $0; bu Faz 0'da ölçülür, ölçülmeden söylenmez.

## 7. Devir notu — bu işi alan oturum için

- **Oku:** bu dosya + `SOURCE-PROMPT.md` + tahtada B43'ün "THE NIGHT CONTENT ENGINE" notu. Kaynağı yeniden izlemene gerek yok; yukarıdaki okuma bu oturumda kareler ve sesle yapıldı. Medya scratchpad'deydi ve oturumla gider.
- **Kaynak adresleri:** orijinal video `https://www.instagram.com/p/Dah3raWzV4i/` (yt-dlp sesiyle indirir) · kıyas videosu `https://www.youtube.com/watch?v=vUjAgGa8tAU` (sistem 00:42–02:30, Opus'un ürünü 04:40–08:30, Astra 08:30–11:25, skor 11:25–11:58).
- **CEO'nun bu işteki hükümleri:** Rakip analizi değil, **holding için ürün**. Özet ile iş yapılmaz, kaynak eksiksiz okunur. Soru sorup onu yorma; planı hazırla, onayını al. Her şey Ferrari seviyesinde.
- **Sıradaki adım (2026-09-24 akşam):** Bu plan hâlâ CEO'nun gözünü bekliyor. Açık sorular ve Fable 5.1 oturumunda süren dünya çapındaki gelir çalışması `HANDOVER.md`'de. "Yap" derse Faz 0 dxb-crew düzeniyle başlar. Onaysız tek satır kod yok.
