# Plan — Holdingde iş nasıl akar (B64)

**Bittiğinde ekranınızda:** Hamza'ya verdiğiniz hedef ya da dışarıdan gelen bir iş, siz bakmadan, o işin türüne göre
seçilen tek bir ustanın elinde baştan sona yürür ve sonucu aynı konuşmada görürsünüz. İşin yolunda başkan durağı ve
departman bütçesi yoktur; departmanlar ustaların içinden uzman ve bilgi aldığı dolaplardır. Dışarıdan gelen her mail
ve mesaj Karşılama'da canlı akar, size yalnız kararınız gereken şeyler gelir ve sabah tek satırda gecenin işini
okursunuz.

**Kanıtı:** `pnpm verify:b64` — tasarımdaki altı senaryo inşaat motorunda baştan sona koşar ve hepsi yeşil yanar.

14 Ekim 2026: tasarım sürüm 15 ve bu planın ilk hâli onaylandı; 1. adım aynı gün kuruldu. 26 Ekim 2026: plan ikinci
kez yazıldı ve altı kararıyla onaylandı <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->: başkanlar
işin yolundan, departman bütçeleri bütçeden çıktı, departmanlar kaldı
<!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->. Her karar sahibi olan şartnameye kayıtlı
uyarlama olarak yazıldı. Planın tamamı, Sol'un denetimi ve bulguları:
`/home/dxb/test-kutu/20261026-b64-v2-plan/` (`plan.signed.md`, `sol-plan.raw`).

## Sıra — her adım ayrı bir iş, biri bitmeden öbürü başlamaz

1. **Hamza'nın üç eli.** (14 Ekim'de kuruldu.) Hedefinizi konuşarak anlar, tarife yazar; tarifte cümleniz aynen
   kalır. "Neresindesiniz" dediğinizde durumu getirir. "Max'a geç" gibi sözlerinizi tek kapıya iletir; "geri al"
   derseniz geri alınır. Ekranınızda "niyet" sözü ve tek satırlık kutu yoktur.
2. **İş türü ve işin ustası.** Hamza'nın elleri ustalara bağlanır: "Neresindesiniz" dediğinizde durum işin
   masasından gelir; "Bütün ustaları xhigh yap" sözü ustalara gider; "Beni bu işin ustasına bağla" dediğinizde açık
   bir işin ustasıyla, Hamza'yla konuştuğunuz gibi konuşursunuz, gerisi Hamza'dadır. İş dört kapıdan girer: siz (Hamza), müşteri maili ve mesajı (Karşılama), takvim ya
   da olay (hat kartı), holdingin kendi gelir işi. Tutar, kayıtlı müşteri, dil ve tarih koddan okunur. Müşteriyi
   kimin karşıladığı ve teklif → kabul → imzalı anlaşma → iş sırası değişmez. Jev, 8-12 türlük menüden işin türünü
   seçer ve ne kadar emin olduğunu söyler; 0,80'in altında Sonnet, o da emin değilse Hamza karar verir. Menüde
   olmayan iş "belirsiz" kapısından Hamza'ya gider. Masa önce 50 etiketli işte gölgede denenir; en az 47'sini doğru
   yere, bilinmeyenlerin hepsini "belirsiz" kapısına gönderirse devreye girer. Her türün bir ustası vardır
   (yaklaşık 10, mevcut personalardan ya da yeni, kısa yazılır; her biri personasız Opus'la kör denenir). Usta
   planı işin değerine göre yazar, bütünü önce kendisi tasarlar ve kurar, uzmanı herhangi bir dolaptan gerekçeyle
   çağırır, birleştirir, dener ve teslim eder. Değerli işte planı iki ayrı beyin yazar, Opus 5.5 max ve Fable 5.1
   max, birbirini görmeden; Sol ikisini birleşmeden önce kör denetler, usta eksikleri ekler, hataları düzeltir ve
   imzalar. Birleştirmede güçlü plan temel alınır; öbüründe olup bunda eksik olan eklenir, "gereksiz" denip atılmaz,
   yalnız görüntüyü ya da sistemi bozuyorsa alınmaz; ikisinde aynısı varsa daha güzeli seçilir; eklenen her şey
   tarifin, bütçenin ve teslim tarihinin içinde kalır. İmzalı anlaşmanın ustasını, fiyat politikasındaki hizmetten
   kod bulur. Değerli
   işin bütçesi anlaşmanın en fazla %30'udur. Aynı tür iş ikinci kez iyi bitince planı kalıp olur. İş bitince usta
   dersini ilgili departmanın dolabına yazar. Kanal, gelir motoru, aylık paket ve holdingde açılan şirket gibi
   sürekli işler takvimi, bütçesi ve hedefi olan kalıcı bir sahibe bağlanır.
3. **Kontrol ve kritik kapı.** Kontrol, işi tarifteki "bitti" ölçütüne göre gerçekten açıp çalıştırarak sınar;
   daha iyisini aramaz. Müşterinin görsel işinde (site, sayfa, uygulama ekranı, resim, film) tasarımı yapımdan önce
   müşteri onaylar. Geçmeyen iş, kontrolün notlarıyla ustasına döner. Müşteriye giden işe iki koltuk birbirini
   görmeden bakar: Sol okur ve çalışan işi açıp dener, Fable okur; ayrıca bir Opus son kontrolü yoktur. Rutin müşteri
   mesajına yalnız Sol bakar. Müşteri gözü, kullanıcı yolu yeni ya da değişmiş müşteri sitesinde ve uygulamasında
   kendiliğinden yürür; başka işte usta gerekçesiyle çağırır ya da siz istersiniz. Sol ile Fable birden düşerse iş
   bekler ve size haber gelir.
4. **Yedek çift ve model odası.** Opus düşerse işi Fable alır, Fable düşerse Opus. Fable'ın kritik kapıdaki koltuğu
   düşerse Opus değil Sol bakar; hiçbir model kendi yazdığını denetlemez. Geçiş kayda yazılır; hiçbir iş daha zayıf
   bir modele düşmez. Eski yedek yolu kapanır; B65 ve B66 bu adımda biter. Fable'ın kotası %95'e gelince ikinci
   abonelik için onayınız istenir. Yeni bir model çıkınca size tek sayfalık öneri gelir.
5. **Dışarıdan gelen iş.** Gmail bağlanır. Gelen maili önce Jev ayırır, emin olmadığını Sonnet ayırır. İş maili
   karşılayanına (kayıtlı müşteride hesabın sahibi, yenide satış) gider. Önemli mail Önemli bölmenize, fatura
   finansın arşivine, spam Gmail'in çöpüne gider; çöpe giden 30 gün içinde geri alınabilir. Karşılama bölümünde her
   şey canlı akar. Müşteriler görünümü aynı kayıtları müşteriye göre toplar. Bu ekranın çizimi önce size gelir.
   Rutin müşteri cevabı, Sol baktıktan sonra sizi beklemeden gider.
6. **Size gelenler ve sözünüz.** Anlaşması 1.000 $ ve üstü olan işlerin ilk teslimi müşteriden önce size gelir;
   sözleşmedeki düzeltme turlarının içindeki sonraki teslim kontrollerden geçince sizi beklemeden gider. Küçük işlerde yalnız her yeni hizmet türünün ilk teslimi gelir. Teslim tarihi kartta durur, Hamza sabah
   hatırlatır; "gönderin" demeniz yeter. Fiyat politikasını ve standart sözleşmeyi bir kez onaylarsınız. Sözünüz
   bir kuralla çelişirse holding sizi bir kez uyarır, kararı siz verirsiniz.

   **Anlaşmadan sonra.** <!-- CEO-OK: b64-after-the-deal-and-plan-merge-rule-2026-10-27 --> Müşterinin açık işle
   ilgili mesajı o işin masasına gider; müşterinin karşısında tek ses hesabın sahibidir. Sözleşmedeki düzeltme
   turları aynı iştir, fazlası yeni tekliftir. Tur sayısı, kapora, ödeme takvimi ve kabul, bir kez onayladığınız
   standart sözleşmede yazar. İmza, ödeme ve mail gönderme B05'e bağlıdır.
7. **Hatlar, makine, para ve bağlam.** Takvim, tekrar eden işi kendisi başlatır. Hattın kalıcı sahibi hattı sizin
   çizdiğiniz sınırlar içinde değiştirebilir. Bütün işler tek kuyrukta, belli bir sırayla yürür; ustalar
   aboneliklerin kalan kotasına göre sıraya girer ve her iş tahmini bir token bütçesi taşır. Bütçe holding, şirket,
   proje, çalışan, iş ve hat düzeyinde durur; departman bütçesi yoktur, harcama departmana göre etiketlenir; Hermes
   bütçe dışıdır. Bütçe eşikleri size bir kez sorulur ve hatırlanır. %70'te ve %90'da uyarı gelir, %100'de kritik
   olmayan yeni iş durur. Fiyatı bilinmeyen model "0 $" değil, "bilinmiyor" sayılır. Dolan abonelik ekranda "dolu"
   görünür. Para, sözleşme ya da kimlik içeren bir adım, çalışmadan önce onay kapınızda durur. Çalışanların
   ortamındaki şirket anahtarları çıkarılır, işi ana sürecin aracı yapar. Ajanların kullandığı ortak araç da
   kendisini kimin çağırdığını denetler. Her koltuk, Hamza dahil, küçük başlar ve işin hafızası masada durur; bağlam
   büyüyünce önce eski alet sonuçları temizlenir (dört şartla), sonra geçmiş geri açılabilir biçimde sıkıştırılır,
   gerekirse taze bir oturum yazılı devirle devralır; dışarıya dokunan her eylem önce masaya yazılır ve tekrar
   edilmez; eşikler Opus 5.5'te holdingin kendi işinde ölçülür (AGENT_ORCHESTRATION A29).
8. **Tek rüya.** Her gece günün işleri okunur; tekrar eden şeyler, çelişkiler ve eskiyen bilgiler bulunur. Öneri
   hafızayı kendisi değiştirmez; kabul edilince holdingin ve Hermes'in hafızasına işlenir. Bir departmanın dolabına
   dair öneriyi Hamza kabul eder; holdingin geneline ya da kurallarınıza dokunan öneri size gelir. Sabah ekranınızda
   tek satır durur. Ölçüsü şu: aynı iş ikinci kez daha iyi ve daha ucuz yapılır.
9. **Hermes, holding ayağa kalkınca.** Holdingin sunucusu kiralanır; para çıkışı olduğu için onayınızla. Hermes
   Docker'la kurulur ve her özelliği içeride denenir; biri çalışmazsa Docker'sız kurulur. Beyni kurulumda denenir:
   önce Claude aboneliğiniz, sonra 100 $ kredili Hermes anahtarı. Holdingin 20 gerçek işinde ölçülür. WhatsApp ve
   Telegram kapısı, gece işleri ve ekranda canlı, sade görünüşü bu adımda gelir. Hermes'e kısıt konmaz; tek kapı
   onayınızdır. Harcama sınırı da konmaz; kredi bitince kendiliğinden durur. Opus düşerse Hermes'in işi Fable'a
   geçmez, bekler; işi verene "Hermes'in beyni şu an kapalı, işiniz sırada" denir ve beyin dönünce iş sürer.
   Temmuz'daki eski bekçi dosyası kurulumda kullanılmaz.
10. **Ölçümler, ayrı işler olarak.** Ustaların yazımı ve personasız Opus'la kör denemesi; masanın gölge denemesi;
    büyük ve bölünebilen bir işte (örneğin 12 sayfalık site) tek usta ile temizlenmiş personalı usta + 2-4 uzmanın
    kör testi (dakika, maliyet, kör jüri, sizin gözünüz) — personaların temizliğinden (C41) sonra; bağlam eşiklerinin
    Opus 5.5'te ölçümü.

## Nasıl doğrulanır

Her adımda önce test yazılır, sonra kod. Bütün test bataryası koşar, Sol bir kez kör bakar, bulduğu düzeltilir.
Sonra size birkaç satırla haber verilir. En sonda `pnpm verify:b64` altı senaryoyu baştan sona koşar; yapımın kabul
durumları TEST_STRATEGY'de yazılı. Siz bakmadan hiçbir şey "kabul edildi" sayılmaz.

## Riskler

- Hermes bir sayfaya gizlenmiş bir talimata kanarsa holdingin verisine dokunabilir. Opus bu testte 1.100 denemede
  bir kez kandı. Çaresi: her değişiklik kayda geçer ve geri alınabilir.
- Bir müşteri maili yanlış ayrılabilir. Emin olunamayan mail çöpe değil Önemli'ye gider; çöpe giden de 30 gün
  içinde geri alınır.
- Masa bir işi yanlış türe gönderebilir; yanlış usta kapsamı ve takvimi de yanlış kurar. Çaresi: gölge denemenin
  geçme şartı, geri çevrilen işin Hamza'da karara bağlanması, her seçimin kaydı.
- "Uzman ne zaman çağrılır" kuralı kör test yapılmadan tahmindir; bu yüzden "gerekçeyle" diye yazılı, sınırlayıcı
  bir liste değil.

## Sözünüz — 14 Ekim

1. **Şirket anahtarları Hermes'te de ortamdan çıkar.** Hermes veritabanına holdingin aracı üzerinden ulaşır ve yine
   her şeyi yapar.
2. **Stüdyonun yaratıcı koltukları Opus 5.5'e geçer**, önce stüdyonun 10 işinde Fable ile yan yana ölçülür; Fable
   yedekte kalır. Seviyeyi stüdyo işinin ustası işe göre seçer: günlük işte high, büyük işte xhigh, marka ya da büyük
   kampanya gibi gerçekten önemli işte max.
3. **Sözünüz her kuralın önüne geçer, İslami sınırlar dahil.** Holding sizi bir kez uyarır; araştırmanıza dayanarak
   "devam" derseniz sözünüz o seferlik yapılır, kural değişmez. Para, sözleşme ve kimlik onayı yine onay kartınızdan
   verilir.

## Sözünüz — 26 Ekim, altı karar

1. Temmuz direktifindeki departman müdürleri, şemadaki müdür düğümü, departman bütçesi, departman token limiti ve
   departman onay seviyesi kalkar; departmanlar şemada kalır; "Bütün müdürler" kontrol alanı "ustalar ve kalıcı
   sahipler" olur.
2. Toplantı odasında, Hamza ortada, yaklaşık 10 usta oturur; ses kimlikleri ustalara geçer; odanın yeni hâli
   yapılmadan önce size çizilir.
3. Bir departmanın dolabına dair rüya önerisini Hamza kabul eder; geneli ilgilendiren size gelir.
4. Holdingde açılan bir şirketin sahibi kalıcı bir sahiptir.
5. Departmanın haftalık karnesi kalkar.
6. Dolaba yeni uzman eklemek, Hamza'nın kapısından açılan ve persona kapısıyla yazılan bir iştir.
