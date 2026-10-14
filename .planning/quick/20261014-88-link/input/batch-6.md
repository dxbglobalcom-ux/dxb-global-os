

## W074 — DeepSeek Harness (dsh) — 'her şey bir eklenti' ajan harness'ı
- Link: https://github.com/deepseek-ai/deepseek-harness
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-17
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** DeepSeek'in 'her şey eklenti' harness'ı — ikinci ajan çatısı STACK kuralına aykırı, geliştirici ön izlemesi, güvenlik denetimi yok; kurulmaz. Yalnız eklenti mimarisi ve MCP bellek/zamanlama fikirleri için izlenir.
- **Gelir (0-3):** 0
- **Gelire katkısı:** Para yolu yok; ucuz model tasarrufu W070'teki modelden gelir, harness'tan değil.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** DeepSeek'in kendi harness'ı: web arayüzü, Python SDK, MCP bellek, zamanlama; DeepSeek'in ucuz modelleriyle (W070) ajan koşturmayı kolaylaştırır. Holdingin çalışma zamanı Hamza ve DeepSeek'e zaten bir şerit olarak gidiyor; harness'ın kendisi yeni bir para yolu ya da ek tasarruf getirmiyor — tasarruf modelden gelir, harness'tan değil.
- **Rakam kanıtı:** 245.638 yıldız, MIT, son push 2026-10-03 (gh api, bu tur). SAFETY.md: geliştirici ön izlemesi, güvenlik denetimi yok (önceki tur).
- **İlk para:** Elimizde: Hamza'nın DeepSeek şeridi. Ek adım yok; ucuz model kazancı W070 ölçümüyle alınır.
- **Engel ve aşma:** Ön izleme ve denetimsiz → kurulmaz; ikinci ajan çatısı STACK.md'ye aykırı.
- **Öneri:** İzle
- **İkinci turda:** 1/İzle
- **Oturum (0-3):** 1
- **Tahta satırı:** B51
- **Link(ler):** https://github.com/deepseek-ai/deepseek-harness
- **Neye bakıldı:** gh api repos/deepseek-ai/deepseek-harness; DeepSeek fiyat sayfasındaki 'Agent Integrations' listesi (DeepSeek Harness, Claude Code, Hermes vb.).

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** deepseek-ai/deepseek-harness (245k yıldız, MIT, 2026-10-03 güncel). Cordis eklenti çatısı üzerinde web arayüzü, Python SDK, MCP bellek, zamanlama, GitHub inceleme; DeepSeek anahtarının yanında Anthropic, OpenAI, Kimi, GLM sağlayıcıları eklenebiliyor. Geliştirici ön izlemesi: 'uyumluluğu bozan değişiklikler olacak', güvenlik denetimi yapılmamış.
- **okundu:** evet
- **zaten_var:** Hamza/Orkestratör, Claude Code, dxb-team2 düzeni.
- **not:** SAFETY.md bilerek 'güvenli/üretime hazır sayılmasın' diyor; 'npx @deepseek-ai/dsh web' kurulumu gümrük kapısından geçmeden yapılmamalı.


## W076 — Bad Decisions Studio: (1) yerelde MiniMax H3 ile Higgsfield/Seedance reklamını yeniden üretmek; (2) invideo Agent Two — yapay zekâ 'yaratıcı yönetmen' ajanı
- Link: https://www.instagram.com/reel/DcNcLjPOLRs/ ; https://www.instagram.com/reel/DcBpE7niGyb/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-21
- **Tür:** model
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** 'Yaratıcı yönetmen ajanı' deseni (fikir → shot list → storyboard → karakter sayfası → model başına prompt → kendi hatasını yakalama → tutarlı yakın çekimler) stüdyonun yönetmen koltuğuna (B43) eklenecek adım; Higgsfield'in açık paylaştığı referans+prompt paketi H3 kalitemiz için hazır kıyas testi (süreler bizim kartta ölçülmedi). invideo alınmaz (ücretli, rakip).
- **Gelir (0-3):** 2
- **Gelire katkısı:** Proje 4'ün kreatif ayağı: reklam sekansı yerelde ~0 $ (bulutta ücretli Seedance yerine) → portföy reklamı → B28'in ilk marka müşterisi (retainer bandı 1.500–10.000 $/ay). ~1 hafta, 0 $; kadro yasası (kadın oyunculu referanslar) geçerli.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri + Maliyet düşürme
- **Nasıl para getirir (okuyucu):** TEKLİF-3 'Reklam: kreatif üretimi + reklam hesabı yönetimi' (B28 ajans koltuğu + B43 stüdyo) ve B43 stüdyosunun üretim gücü. Reel 1: açık paylaşılan bir reklamın referans ve prompt'larıyla yerel H3'te 0 $'a reklam sekansı (19 dk), 5 sn araba çekimi 4 dk — bizim kartta ölçtüğümüz 'yerel, ücretsiz reklam videosu'nun dışarıdan teyidi; ücretli Seedance yerine yerel üretim = marka müşterisine retainer'da maliyet sıfıra yakın. Reel 2: 'yaratıcı yönetmen ajan' — fikirden shot list, storyboard, karakter sayfası, model başına prompt, kendi hatasını yakalama (saat örneği), 'aynı yakın çekimi diğer karakterlere yap' — stüdyonun yönetmen koltuğuna eklenecek teknoloji adımı; stüdyonun çıktı kalitesini ve hızını, dolayısıyla satılabilir reklam sayısını artırır.
- **Rakam kanıtı:** Reel 1: '19 dakika', '5 sn çekim 4 dakika', 'tek kuruş ödemedik' (anlatıcının ölçümü, ekranda; donanım Dell iş istasyonu — marka tanıtımı). Bizim ölçümümüz (gelir-baglam.md, B43): 15 sn 1152×640 çekim ~10 dk, 0,00 $. Agent Two: 2026-07-30 ürün güncellemesi (önceki geçiş). B28 retainer referansı: alıcılar 1.500–10.000 $/ay bildiriyor (B28 satırı).
- **İlk para:** H3 elimizde ve çalışıyor; OpenMontage kurulu. Eksik: yönetmen ajanının 'hata yakala + karakter tutarlılığı + model başına prompt' adımları. Adımlar: açık paylaşılmış bir reklam brifini (Higgsfield'in açtığı referanslar) stüdyoda yeniden üret → portföy reklamı → B28'in ilk marka müşterisine sun. Süre ~1 hafta; 0 $. invideo alınmaz (ücretli, rakip).
- **Engel ve aşma:** 1) Başkasının reklamını yeniden üretmek → yalnız açıkça paylaşılmış (open-sourced) referanslarla ve portföyde kaynak belirtilerek; müşteri işi tamamen bizim brifimizle. 2) H3 kalitesini CEO zayıf bulmuştu (B42) → ilk kare yolu (görselden video) daha keskin ölçüldü, o kullanılır. 3) Kadın oyuncu içeren referanslar → kadro yasası.
- **İslami sınır:** Reklam referanslarında kadın oyuncu olabilir — stüdyonun kadro yasası geçerli.
- **Öneri:** Dene
- **İkinci turda:** 2/İzle
- **Neden değişti:** Puan 1'den 2'ye, 'Gerek yok'tan 'Dene'ye: yerel ücretsiz reklam üretimi B28 gelirinin maliyetini sıfırlıyor ve yönetmen ajanı stüdyonun teknolojisini ilerletiyor.
- **Oturum (0-3):** 0
- **Tahta satırı:** B43 (DXB Media Studio), B33 (tezgâh — render süreleri), B28
- **Link(ler):** https://www.instagram.com/reel/DcNcLjPOLRs/ ; https://www.instagram.com/reel/DcBpE7niGyb/
- **Neye bakıldı:** İki video: 1) her ikisinin dökümü tamamı; 3) ikisi de watchall.sh ile tamamı izlendi (110 + 113 kare, 10 + 10 sayfa, hepsi okundu). invideo Agent Two web araması (ürün güncelleme sayfaları). Depoda MiniMax H3 izi arandı.

### What it is — the watch record (newest pass)
- **tur:** model
- **ne_bu:** Reel 1 (DcNcLjPOLRs, 110 sn): Higgsfield'ın Seedance ile çektiği ve referanslarıyla prompt'larını paylaştığı bir araba reklamı alınıyor, aynı girdiler yerelde (bir Dell 'T2' iş istasyonunda) MiniMax H3'e veriliyor. İlk sekans 19 dakikada, 5 saniyelik araba çekimi 4 dakikada render ediliyor. Ekranda iki sonuç yan yana gösteriliyor ve karakter/sahne tutarlılığı yüksek görünüyor. Reel 2 (DcBpE7niGyb, 113 sn): invideo Agent Two'nun 'Expert Agents' özelliği. Ajan bir Pepsi reklam fikrinden storyboard, karakter kadrosu, mekân ve referans görselleri üretiyor; prompt'u GPT Image 2.0, Nano Banana Pro ve Seedance 2.5'e kendisi yazıyor. Kendi hatasını da yakalıyor (zaten saat takan adamın saati çıkarması) ve 'aynı yakın çekimi diğer karakterler için de yap' komutunu yerine getiriyor. invideo'nun ürün sayfası özelliği doğruluyor (2026-07-30'da çıktı).
- **okundu:** evet — iki döküm tam, tüm kareler okundu
- **izlendi:** İki video: 1) her ikisinin dökümü tamamı; 3) ikisi de watchall.sh ile tamamı izlendi (110 + 113 kare, 10 + 10 sayfa, hepsi okundu). invideo Agent Two web araması (ürün güncelleme sayfaları). Depoda MiniMax H3 izi arandı.
- **zaten_var:** MiniMax H3 stüdyonun motoru: media-studio-founding kanıtları (W7, W11), AHMET ve JAMES yüzleri H3 ile üretildi, CEO'nun 'MiniMax H3'ün kendi sesi olsun' hükmü var. invideo yok. Yaratıcı yönetmen akışı stüdyo planında, ama ekranı (B43) yapılmadı.
- **not:** Reel 1'deki süreler (19 dk / 4 dk) yaratıcının iş istasyonunda ölçüldü; bizim RTX 5060 Ti 16 GB'ımızda ölçülmedi, ⚠ doğrulanmadı. Higgsfield'ın açtığı referans+prompt paketi, stüdyonun kendi H3 kalitesini ölçmek için hazır bir karşılaştırma testi olarak kullanılabilir. invideo ücretli bir SaaS; aboneliği para çıkışıdır, onay ister. Reel 2'deki kadroda kadın karakterler var; stüdyonun kendi içeriğinde kadın tasvir edilmez kuralı geçerli.


## W078 — scroll-craft (nateherkai) — kaydırmayla sürülen premium web sitesi Claude Code becerisi
- Link: https://github.com/nateherkai/scroll-craft
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-24
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Kurulu scrollcraft 2026-08-23 sürümü; upstream 0.3.1 (2026-09-30) güvenlik ve Windows düzeltmeleri + hero-depth rehberi taşıyor. Diff ölçülür, seçerek alınır — CEO'nun B40'ta kabul ettiği derinlik işi bozulmadan; kie.ai yerine stüdyonun yerel görsel eli.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Premium site teslimatı: serbest çalışan 1.500–8.000 $, ajans özel yapım 10.000 $+ (satıcı rehberleri); stüdyo videosu + site tek teklif; ilk hedef alt bant 1.500–3.000 $. Eksik portföy sayfası ve ilk müşteri; 1–2 gün, 0 $.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri
- **Nasıl para getirir (okuyucu):** Premium site teslimatının motoru: kaydırmayla oynayan video, sabitlenen bölümler, 'Apple tarzı' açılış sayfası — ürün/marka müşterisine ve holdingin kendi markalarına ayrı fiyat bandında (ajans özel yapım 10.000 $+) satılır. Medya stüdyosunun (B43) ürettiği videolar bu sayfalara girer: stüdyo + site tek teklif olur. Kurulu sürüm 2026-08-23; upstream 0.3.1 (2026-09-30) güvenlik ve Windows düzeltmeleri, hero-depth rehberi taşıyor.
- **Rakam kanıtı:** Depo: MIT, 3.002 yıldız, son itme 2026-09-30 (gh api, ölçülmüş); kurulu kopyanın CHANGELOG'u en son 2026-08-23 (ölçülmüş). Fiyat: Küçük işletme sitesi: serbest çalışan ~1.500–8.000 $, ajans özel yapım 10.000 $+; özel kodlu iş sitesi 5.000–20.000 $ (satıcı rehberleri — https://www.levitate.ai/blog-posts/average-website-design-cost-for-small-businesses-in-2026, https://www.digitaleer.com/freelancer-vs-agency-vs-diy-website-cost/). Rakamlar satıcı sayfalarından; aralık geniş, alt uç (1.500–3.000 $) bizim ilk müşteri hedefimiz.
- **İlk para:** Elimizde: kurulu beceri, stüdyo. Eksik: güncel sürüm farkı (diff) ve bir portföy sayfası. Adımlar: upstream farkını ölç, güvenlik düzeltmelerini al (CEO'nun B40'ta kabul ettiği işi bozmadan) → bir holding markası için sayfa → teklif. Süre 1–2 gün; kie.ai varlık üretimi ücretliyse yerine stüdyo (0 $).
- **Engel ve aşma:** 1) kie.ai ücretli görsel üretimi → stüdyonun yerel kartı ve ücretsiz görsel eli kullanılır. 2) Güncelleme kendi ayarlarımızı ezebilir → diff önce, sonra seçerek al.
- **İslami sınır:** Stüdyonun kadro yasası geçerli: sayfalardaki insan görsellerinde kendi kadromuz erkekler ve yaşlı teyzeler; kadın yalnız müşteri isterse.
- **Öneri:** Dene
- **İkinci turda:** 2/Dene
- **Oturum (0-3):** 1
- **Tahta satırı:** B30, B40
- **Link(ler):** https://github.com/nateherkai/scroll-craft
- **Neye bakıldı:** gh api nateherkai/scroll-craft meta; ~/.claude/skills/scrollcraft/CHANGELOG.md başı; site fiyat araması.

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** GitHub: nateherkai/scroll-craft, MIT, ~3.0k yıldız, son itme 2026-09-30 (sürüm 0.3.1). Claude Code / Codex becerisi ve eklentisi: sayfa gramerleri, imza hareketi, katmanlı hero derinliği, kie.ai ile fotogerçekçi varlık üretimi, masaüstü/telefon/azaltılmış-hareket kaydırma karelerini ekran görüntüsüyle doğrulama.
- **okundu:** evet
- **zaten_var:** Evet: ~/.claude/skills/scrollcraft kurulu. Aynı soy: aynı dizin yapısı (engine/, references/, templates/, scripts/, CHANGELOG), aynı 'OtherWorlds/Ultimate Websites' yapı yolu; kurulu olan 2026-08-23 sürümü. Yukarıdaki sürümde ek olarak hero-depth.md, approved-collection.md ve 2026-09-30'da güvenlik ve Windows düzeltmeleri var.
- **not:** Önerilen iş: kurulu kopya ile upstream 0.3.1 farkını (diff) ölç, güvenlik düzeltmelerini ve hero-depth rehberini al; CEO'nun B40'ta kabul ettiği derinlik/yönlendirme işini bozmadan. kie.ai kullanımı ücretli — para çıkışı onay kapısında. Yerel kopya özelleştirilmişse üstüne yazma.


## W079 — CEO emri: Claude'daki beceri ve eklentilerin holdinge (Hamza ve çalışanlara) kurulması; claude-design
- Link: (his order, no link)
- His note when he sent it: claude daki skill ve pluginglerin holdinge kurulması. claude-design

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-25
- **Tür:** CEO fikri
- **Holding (0-3):** 3
- **Teknoloji (0-3):** 3
- **Teknolojiye katkısı:** Makinenin asıl ilerlemesi: 214 personanın hiçbirinde beceri yok, sohbet ve ses hatları tools:[] ile çalışıyor (W093 ölçümü); B41'in 2026-10-04 bacağı tasarlandı, inşa edilmedi. Önce satış yapan koltuklara (pazarlama 33, stüdyo 14, sosyal medya 13, ücretli medya 7) 3–5 beceri. Lisans sınırı: resmî docx/xlsx/pdf/pptx becerileri kopyalanamaz (B27). Claude Design ayrı ürün, beceri değil.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Ayrı bir ödeme hattı değil; 67 üretim koltuğunun satılabilir iş çıkarmasının ön şartı — B28 videoları, B17 hizmetleri, kendi kanallarımız aynı kadroyla daha çok ve daha iyi üretilir; vitrin değeri ('ilk dijital OS-kernel holdingi'). Başlaması CEO'nun B41 'başla' sözüne bağlı.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri + İçerik geliri + OS'in kendisi
- **Nasıl para getirir (okuyucu):** Bu, makinenin kendisini ilerleten bir emir: 214 personanın üretim koltukları (pazarlama 33, medya stüdyosu 14, sosyal medya 13, ücretli medya 7) bugün araçsız çalışıyor; beceri ve eklentiler (ör. belge/sunum üretimi, tarayıcı, araştırma, tasarım) onlara el verince satılan her iş (B28 ajans videoları, B17'deki rapor/kokpit/ikinci beyin hizmetleri, kendi kanallarımızın içeriği) aynı kadroyla daha çok ve daha iyi üretilir. Ayrı bir ödeme hattı değil; tüm hatların üretim kapasitesini çarpan bir teknoloji ilerlemesi ve 'dünyanın ilk dijital OS-kernel holdingi'nin vitrinini güçlendirir.
- **Rakam kanıtı:** Önceki geçişin depo ölçümü (W093, bu geçişte yeniden ölçülmedi): çalışan başına beceri ataması 0; sohbet ve ses hatları tools:[] ile çalışıyor (B41 satırı). Lisans sınırı ölçülmüş: resmî docx/xlsx/pdf/pptx becerileri kopyalanamaz (B27). Para rakamı yok; değer kapasite artışı.
- **İlk para:** Elimizde: B41'in 2026-10-04 bacağı (tasarlandı, inşa edilmedi), kurulu beceriler (agent-reach, scrapling, graphify, operator, scrollcraft, dxb-*), kapalı eklentiler. Eksik: çalışanların araç çağırma yolu ve beceri→koltuk eşlemesi. Adımlar: 1) önce satış yapan koltuklara (pazarlama, stüdyo, sosyal medya) 3-5 beceri, 2) bir B28 teklif paketini bu koltuklarla üretmek, 3) ölçmek. Süre: birkaç oturum; para çıkışı yok. Onay: CEO'nun B41 için 'başla' sözü.
- **Engel ve aşma:** Lisans: Anthropic'in resmî belge becerileri kopyalanamaz (B27) → açık kaynak muadilleri ya da Claude API'nin kendi beceri özelliği üzerinden kullanım. Güvenlik: araç verilen çalışan dışarı yazabilir → okuma/yazma ayrımı ve onay kapısı (para çıkışı, sözleşme) aynen kalır. Claude Design ayrı bir Anthropic ürünü, beceri değil → hesap erişimi varsa ayrıca denenir.
- **Öneri:** Kur
- **İkinci turda:** 3/Kur
- **Oturum (0-3):** 1
- **Tahta satırı:** B41
- **Sizin notunuz:** claude daki skill ve pluginglerin holdinge kurulması. claude-design
- **Link(ler):** (his order, no link)
- **Neye bakıldı:** CEO'nun kendi notu (items.tsv); context.md'deki kurulu beceri/eklenti listesi; önceki geçişin depo okuması (B41, B27) — bu geçişte depo dosyası yeniden açılmadı.

### What it is — the watch record (newest pass)
- **tur:** CEO fikri
- **ne_bu:** Bağlantı yok, CEO'nun kendi emri. Depoda bunun sahibi var: B41 'tedarik zinciri' satırının 2026-10-04 bacağı — Hamza ve her çalışan Claude'un kendi araç, beceri ve eklentilerini iki duvar arkasında (veritabanları ayrı, herkes kendi masasında) kullanacak; 'vakti gelince yapılsın' denmiş, inşa edilmedi.
- **okundu:** evet — depodaki satır, kurulum listesi ve ayarlar okundu
- **zaten_var:** İnşaat tarafı: ~/.claude/skills altında agent-reach, graphify, operator, scrapling, scrollcraft; proje becerileri dxb-* (10 adet) ve skill-creator. Eklentiler kurulu ama yalnız claude-mem ve skill-creator AÇIK: caveman, codex, karpathy-skills, frontend-design, context7, code-simplifier, playwright, claude-md-management, taste-skill, impeccable, ui-ux-pro-max, open-design, obsidian hepsi kapalı. Resmi docx/xlsx/pdf/pptx becerileri lisans yüzünden kopyalanamıyor (B27). Claude Design: Anthropic'in ayrı ürünü, beceri/eklenti değil; depoda 2026-09-16 Reddit topluluk ölçümü ve kapalı bir open-design eklentisi var, Claude Design için kurulum yok.
- **not:** Yeni satır açılmasına gerek yok: B41'in 2026-10-04 bacağı bu emrin ta kendisi; yapılması için CEO'nun 'başla' demesi bekleniyor (core §2: proje işi onsuz başlamaz). İnşaat oturumları için kapalı eklentilerden hangilerinin açılacağı ayrı, küçük bir karar. Claude Design için ancak bir Claude hesabı/ürün erişimi varsa değerlendirilir; kendi V2 tasarım paketi (B32) ile görevi çakışır.


## W080 — Dylan Watkins'in 'V.A.U.L.T.' 57 ajanlı AI şirketi — 6 departman, tek Jarvis orkestratörü, içerik motoru
- Link: https://www.instagram.com/reel/Db6nUzfhhTd/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-27
- **Tür:** strateji
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Holdingin küçük bir akrabası: departman → ajan → SOP kartı, ajan başına otonomi etiketi (bizde B15 kadranı), tek orkestratör, bilgi tabanı merkezde — çoğu bizde var. Makineye girecek parça: ajan kartı (SOP, okuduğu/yazdığı yer, son çalışma, otonomi etiketi) canlı organizma panosu (B10/B32) için ekran örneği; içerik zinciri (trend tara → çözümle → yeniden yaz → üret → yayınla → yorum takibi) SIGNAL'in (B43) hattıyla aynı. Opus çapraz bakışı kabul: zincir SIGNAL motorunun kurulmamış uçtan uca hattı, W010 ile aynı desen — tek_puan 2.
- **Gelir (0-3):** 2
- **Gelire katkısı:** Kendi kanallarımızda platform ödemesi, markaya satıldığında B28 aylık hizmet; yorum→DM takibi sosyal medya departmanının satılabilir hizmeti (proje 6). Videoda gelir rakamı yok; SIGNAL planının onayı ve kanal hesabı (kimlik) gerek. Klonlama değil, yalnız yapı ve kanca çözümlenir; kadro ve AI etiketi kuralı.
- **Gelir katmanı:** İçerik geliri + Ajans/hizmet geliri + Kabiliyet
- **Nasıl para getirir (okuyucu):** Asıl para fikri içerik departmanının zinciri: nişte yükselen videoları tara → neden işe yaradığını çöz → senaryoyu yeniden yaz → kendi yüz ve sesinle yeni video üret → kendisi yayınlasın → her yorumu izleyip otomatik takip mesajı (ManyChat tarzı) at. Bu, bizim SIGNAL motorumuzun (B43) ve kendi kanallarımızın tam üretim hattı; kendi kanallarımızda YouTube/Instagram/TikTok ödemesi, markalara satıldığında B28 aylık hizmet bedeli olarak para getirir. Yorum→DM takibi, sosyal medya departmanının (13 persona) satılabilir bir hizmeti (lead toplama). Kişinin kendi kazancı gösterilmiyor; video bir 'yorum yaz, harita gönderelim' hunisi.
- **Rakam kanıtı:** Videoda gelir rakamı yok (iddia bile yok). Dayanılan ölçüm bizim: B28 satırında doğru etiketlenmiş AI içeriğin tam para kazanmayı koruduğu ölçülmüş (gelir-baglam.md). Ajan sayısı (57) yaratıcının iddiası, ürün paylaşılmıyor.
- **İlk para:** Elimizde: MiniMax H3 ses+video (USD 0.00/çekim), OpenMontage, SIGNAL emri, sosyal medya personaları. Eksik: 'trend tara → çözümle' adımının otomasyonu (SIGNAL planı onaysız) ve yayın hesapları. Yol: SIGNAL'in ilk sektörünü seç → 5 çözümlenmiş senaryo → stüdyoda 5 kısa video → kendi kanalımızda yayın; 1-2 hafta, para çıkışı 0. Onay: SIGNAL planının onayı ve kanal hesabı açma (kimlik adımı).
- **Engel ve aşma:** 'Kazanan videoyu klonla' başkasının eserini kopyalamaya kayabilir → yalnız yapı ve kancayı (hook) çözümle, senaryo ve görüntü %100 bizim üretimimiz olsun. Kişinin yüzü/sesi yerine bizim kadromuz (erkekler ve teyzeler, motorun sesi). Otomatik DM → içerik İslami sınır süzgecinden geçer; spam sınırına uyulur.
- **YouTube izni (A/B):** A: Kendi üretimimiz olduğu için (yapıdan esinlenme, görüntü ve senaryo bizim) YouTube'un 'tekrar kullanılan/seri üretim içerik' kuralları kapsamında açık. / B: Başkasının videosunu doğrudan klonlamak gerekmiyor; gerekse bile telif hakkı sahibininindir — lisanslı kaynak şart.
- **İslami sınır:** Yüz/ses klonu kişinin kendisi değilse aldatma sayılabilir; kendi kadromuzla ve AI etiketiyle yapılmalı (hüküm CEO'nun).
- **Öneri:** Araştır
- **İkinci turda:** 2/İzle
- **Neden değişti:** Videonun içerik zinciri (nişte yükseleni tara → nedenini çöz → yeniden yaz → üret → yayınla → yorum→DM takibi) bizde kurulmamış SIGNAL motorunun (B43) uçtan uca üretim hattı; aynı desen W010'da tek 2 aldı. Cetvele göre 'net ilerleme ama inşa ister' = 2. Holding puanı ve öneri değişmez. · Puan aynı (2), öneri 'İzle'den 'Araştır'a: içerik zinciri SIGNAL ve kendi kanallarımızın üretim hattıyla birebir örtüşüyor; rakip olarak dxb-rival-intel ile adım adım çözümlenmeli.
- **Oturum (0-3):** 0
- **Tahta satırı:** B32 (V2 tasarım paketi), B10
- **Link(ler):** https://www.instagram.com/reel/Db6nUzfhhTd/
- **Neye bakıldı:** Üç adım: 1) 76 sn döküm tamamı; 2-3) watchall — 76 karenin tümü (7 sayfa); GBrain deposu ve study-card; rival-intel klasöründe arama (bu kişi yok)

### What it is — the watch record (newest pass)
- **tur:** strateji
- **ne_bu:** 76 sn'lik reel, kişinin kendi kurduğu panoyu ekranda gezdiriyor: altı departman (Agentic OS, Content, Sales, Comms, Finance, Personal), her departman ağaç görünümünde ve her ajanın kartında SOP, okuduğu/yazdığı yer, son çalışma ve 'İnsan yönetir / İnsan destekli / Tam otonom' etiketi var. Ortada Karpathy'nin LLM Wiki yöntemi + GBrain (garrytan/gbrain, MIT, 30.7k yıldız) ile kurulmuş şirket bilgi tabanı, nokta bulutu grafiği olarak görünüyor. İçerik departmanı: nişteki trend videoları tarıyor ('Teardown Hub'), neden işe yaradığını çözümlüyor, 'AI-Clone' düğmesiyle senaryoyu yeniden yazıp kişinin yüz ve sesiyle yeni video üretiyor, kendi yayınlıyor, yorumları izleyip otomatik takip mesajı (ManyChat) atıyor. 57 ajanın hepsi tek 'Jarvis' iletken ajana bağlı; kişi bunları 'açılışta yüklenen persona' olarak paketlediğini söylüyor; harita yorum karşılığı DM ile veriliyor (kurs/topluluk hunisi).
- **okundu:** evet — döküm ve tüm kareler; ürün/kod paylaşılmadığı için içi doğrulanamaz
- **izlendi:** Üç adım: 1) 76 sn döküm tamamı; 2-3) watchall — 76 karenin tümü (7 sayfa); GBrain deposu ve study-card; rival-intel klasöründe arama (bu kişi yok)
- **zaten_var:** Büyük ölçüde: 213 persona, departmanlar, Hamza orkestratörü, bilgi/hafıza katmanı; GBrain study-card (STUDY, yalnız desen kaynağı); otonomi kadranı B15'te açık; video-öğren B14.
- **not:** Rakip görsel/yapı örneği olarak dxb-rival-intel sırasına alınabilir (B22). 'Yüzüm ve sesimle video, ben çekmeden' = kişinin kendi dijital ikizi; CEO'nun yüz/sesiyle yapılacaksa kimlik ve onay adımı gerekir. Otomatik yorum/DM yanıtı rutin dış iletişim sayılır ama içerik İslami sınır süzgecinden geçmeli. Haritayı almak için yorum yazmak gerekir — yapılmadı (salt okuma).


## W081 — codebase-memory-mcp (DeusData) — kod tabanını kalıcı bilgi grafiğine çeviren MCP sunucusu (W046 ile aynı araç)
- Link: https://www.instagram.com/reel/DaLGOXvR3wP/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-29
- **Tür:** repo
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** W046 ile aynı alet (codebase-memory-mcp): kod tabanını bilgi grafiğine çevirir, ajan dosya okumak yerine grafiği sorgular. Değeri inşaat oturumlarında (oturum 3); makineye dolaylı — ileride yazılım/site hizmetinde müşteri kod tabanlarını anlamak. --skip-config + sha256 ile kurulur, graphify ile aynı 5 soruda yan yana tek ölçüm iki satırı kapatır.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Doğrudan para yok; inşaatın token ve süre harcamasını keser (README: 5 soru ~3.400 token'a karşı ~412.000 — yazarın ölçümü, bizde ölçülmedi). Para çıkışı 0; proje işi olduğu için başlamadan CEO'ya sorulur.
- **Gelir katmanı:** Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Holdingin satış yapan hiçbir hattına doğrudan dokunmuyor; inşaat oturumlarının yapısal sorularda token ve süre harcamasını kesiyor. Holdinge katkısı dolaylı: makine daha hızlı ve daha az kota ile inşa edilir; ileride web sitesi/yazılım hizmeti satılırsa müşteri kod tabanlarını anlamanın maliyetini de düşürür.
- **Rakam kanıtı:** README (ölçülen değil, yazarın kendi ölçümü): 5 yapısal soru ~3.400 token'a karşı dosya taraması ~412.000 token; arXiv:2603.27277 ön baskısı 31 depoda 10× daha az token, %83 cevap kalitesi diyor. Depo: MIT, 46.154 yıldız, son itme 2026-10-07 (gh api, bu geçiş). Bizim depoda ölçülmedi.
- **İlk para:** Doğrudan para yok; tasarruf için: ikiliyi --skip-config ile kur, MCP'yi elle ekle, graphify ile aynı 5 soruda yan yana ölç; bir oturum, para çıkışı 0, onay gerekmez (yerel, MIT) — ancak proje işi olduğu için başlamadan CEO'ya sorulur.
- **Engel ve aşma:** Kurulum betiği ajan ayarlarını kendiliğinden değiştiriyor → --skip-config ve sha256 doğrulaması. graphify ile çakışma → ölçümde kazanan kalır. Arka planda izleyici süreç → kalıcı servis düzenine bağlanır.
- **Öneri:** Dene
- **İkinci turda:** 1/Dene
- **Lider notu:** W046 ile aynı alet; tek ölçüm ikisini birden kapatır.
- **Oturum (0-3):** 3
- **Tahta satırı:** B42
- **Link(ler):** https://www.instagram.com/reel/DaLGOXvR3wP/
- **Neye bakıldı:** üç adım da yapıldı: 1) döküm denendi — Speaches küçük model Hintçe konuşmada döngüye girdi, döküm kullanılamaz ('आपके' tekrarı); bu yüzden 2) 6 anahtar kare ve 3) watchall.sh ile videonun tamamı — 61 kare, 6 sayfanın hepsi okundu (ekrandaki İngilizce başlıklar ve README görüntüleri içeriği taşıyor); ayrıca depo README ve GitHub metası

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Hintçe reel (61 sn, 'Hunting AI Ep#2'): ajanların kod tabanını dosya dosya tarayıp token yaktığını (ekranda 121.397 → 140.120 'boşa giden token' sayacı) gösterip çözüm olarak codebase-memory-mcp'yi anlatıyor. Ekrandaki maddeler: tüm kod tabanı tek bilgi grafiği (fonksiyon, sınıf, rota, ilişki); ajan dosya okumak yerine grafiği sorguluyor ('find related to auth()'); kendi içinde dil modeli yok, sorgu katmanı ajanın kendisi; tek statik C ikilisi — Docker, API anahtarı, çalışma zamanı bağımlılığı yok; kurulum betiği Claude Code, Codex ve Gemini CLI'ı kendiliğinden yapılandırıyor; arka plandaki izleyici yalnız değişen dosyayı yeniden indeksliyor; %100 yerel. Depo gerçek: MIT, 46,1k yıldız, son itme 2026-10-07, 162 dil, 17 MCP aracı, README'ye göre 5 yapısal soru ~3.400 token'a karşı dosya taraması ~412.000 token.
- **okundu:** evet — videonun her saniyesi görüntüden okundu; ses dökümü bozuk olduğu için anlatıcının Hintçe sözleri değil ekran metinleri esas alındı
- **izlendi:** üç adım da yapıldı: 1) döküm denendi — Speaches küçük model Hintçe konuşmada döngüye girdi, döküm kullanılamaz ('आपके' tekrarı); bu yüzden 2) 6 anahtar kare ve 3) watchall.sh ile videonun tamamı — 61 kare, 6 sayfanın hepsi okundu (ekrandaki İngilizce başlıklar ve README görüntüleri içeriği taşıyor); ayrıca depo README ve GitHub metası
- **zaten_var:** study-cards/codebase-memory-mcp.md (STUDY, 2026-07-17; ADOPT 'graphify ile çakışma ölçümüne' bağlı, ölçüm yapılmadı); graphify skill'i ve .planning/graphs kurulu
- **not:** W046 ile aynı araç — tek iş olarak ele alınmalı. Kurulum betiği ajan yapılandırmalarını kendiliğinden değiştiriyor ('It configures itself'): bizde --skip-config ile yalnız ikili kurulup MCP elle eklenmeli, sürümün sha256'sı doğrulanmalı. İki grafik aracı birden tutulmaz; ölçümde kazanan kalır. Arka plandaki izleyici sürekli bir süreç demek — makinedeki kalıcı servis düzenine uymalı.


## W082 — Harry Sanders — 'SEO araç yığınım': Ahrefs/Semrush, Microsoft Clarity, DataForSEO, Trustindex, Search Console/SEOgets, Claude + özel skill, Screaming Frog, Schema.org, Peec AI/Free SOV, GA4
- Link: https://www.instagram.com/reel/DbSfnc9TZ7q/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-29
- **Tür:** strateji
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** SEO personalarının araç listesi: Search Console, Clarity (ücretsiz), DataForSEO (API, ajan çağırabilir), Screaming Frog, Peec AI / Free SOV (AI arama görünürlüğü), GA4 — holdingde SEO araç yığını kayıtlı değil; yöntem ya da demo yok. 'Sayfa hızını umursamam' görüşü alınmaz (W122 ölçümü hızın ucuz kazanç olduğunu gösteriyor).
- **Gelir (0-3):** 1
- **Gelire katkısı:** Kendi başına para mekanizması yok; proje 3'ün teslimatını ucuzlatır ve AEO ayağına ('ChatGPT/Gemini sizi öneriyor mu' raporu) ölçü aracı adı verir. Ahrefs/Semrush pahalı → OpenSEO (W097).
- **Gelir katmanı:** Ajans/hizmet geliri + Maliyet düşürme
- **Nasıl para getirir (okuyucu):** TEKLİF-1 'Yerel işletme arama paketi' (ajanlı site + yerel SEO/AEO + aylık ölçülü döngü)'nin araç listesi. Değerli kısmı AEO ayağı: 'AI arama görünürlüğü' için Peec AI ya da ucuz Free SOV — müşteriye 'ChatGPT/Gemini sizi öneriyor mu' raporu satmak için ölçü aracı; ısı haritası için ücretsiz Clarity. Kendi başına para yolu değil, teslimatı ucuzlatır.
- **Rakam kanıtı:** Videoda fiyat yok; araç adları kareden doğrulandı (önceki geçiş). DataForSEO maliyeti W097 satırında resmî kaynakla.
- **İlk para:** W072/W097 ile birlikte: araç kartına Clarity (ücretsiz), Search Console (ücretsiz), DataForSEO (W097) ve bir AEO görünürlük ölçüsü eklenir. Ayrı başlangıç maliyeti yok.
- **Engel ve aşma:** Ahrefs/Semrush pahalı → OpenSEO ile değiştir. 'Sayfa hızı umrumda değil' görüşü → yerel işletme sitelerinde W122 ölçümü gösteriyor ki hız ucuz bir kazanç; görüşü almayız.
- **Öneri:** İzle
- **İkinci turda:** 2/Araştır
- **Neden değişti:** Puan 2'den 1'e: bir araç listesi, para mekanizması taşımıyor; tek yeni katkısı AEO ölçüm aracı adları. Para W072/W097 satırlarında yazılı.
- **Oturum (0-3):** 0
- **Tahta satırı:** B28 (reklam/ajans işi), B17 (gelir yapıları), B41 (tedarik zinciri — ajanın eksik aracı isteyebilmesi)
- **Link(ler):** https://www.instagram.com/reel/DbSfnc9TZ7q/
- **Neye bakıldı:** adım 1: video 32 sn, döküm tamamı; adım 2: 7 kare (frames.sh — araç adları ekrandaki yazılarla doğrulandı: Ahrefs, Trust index, Google Search Console, Claude, Peec or Free SOV); adım 3 gerekmedi (puan 2, ekran demosu değil)

### What it is — the watch record (newest pass)
- **tur:** strateji
- **ne_bu:** 32 saniyelik liste videosu; her SEO işi için bir araç: backlink → Ahrefs ve Semrush; ısı haritası → Microsoft Clarity (ücretsiz); anahtar kelime → DataForSEO; yorumlar → Trustindex (farklı yerlerdeki yorumları toplar); arama performansı → Google Search Console ya da SEOgets; içerik brief'i → Claude + özel bir skill (bağlantısı açıklamada, açıklamaya bakılmadı); site taraması → Screaming Frog; şema → Schema.org; AI arama görünürlüğü → Peec AI ya da ucuz seçenek Free SOV; analitik → GA4; sayfa hızı → 'hiç umursamam'. Bir yöntem ya da demo yok; yalnızca bir uygulayıcının araç seçimi.
- **okundu:** evet — döküm ve kareler; Claude skill'i açıklamada verildiği için (açıklamalara bakılmıyor) açılmadı
- **izlendi:** adım 1: video 32 sn, döküm tamamı; adım 2: 7 kare (frames.sh — araç adları ekrandaki yazılarla doğrulandı: Ahrefs, Trust index, Google Search Console, Claude, Peec or Free SOV); adım 3 gerekmedi (puan 2, ekran demosu değil)
- **zaten_var:** Hayır — depoda DataForSEO, Screaming Frog, Search Console kaydı bulunamadı
- **not:** Ahrefs, Semrush, DataForSEO, Peec ücretli (para çıkışı CEO onayı); Clarity, Search Console, GA4, Schema.org ücretsiz. 'Sayfa hızını umursamam' görüşü tartışmalı — kendi sitelerimizde ölçülerek karar verilmeli. W073 (Searchmaxxed) ile aynı gelir hattına bağlanır.


## W087 — David Feldman — 'her gün kullandığım 5 ücretsiz SEO aracı': linkgap.io, AnswerThePublic, Google Search Console, GMBspy (+ saklanan 5.)
- Link: https://www.instagram.com/reel/DcewaU1NSPB/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-30
- **Tür:** araç
- **Holding (0-3):** 1
- **Teknoloji (0-3):** 1
- **Teknolojiye katkısı:** Yerel SEO denetimi için ücretsiz araç adları: GMBspy (rakibin GBP kategorileri — aynı veri GBP sayfasından okunur, uzantı CEO'nun tarayıcısına kurulmaz), linkgap (rakip backlink boşluğu), AnswerThePublic (sayfa konusu). W082'nin listesiyle örtüşür, daha zayıf.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Proje 3'ün ücretsiz 'rakibiniz neden haritada önde' denetim adımının maliyetini sıfıra yakın tutar; kendi başına para getirmez.
- **Gelir katmanı:** Ajans/hizmet geliri + Maliyet düşürme
- **Nasıl para getirir (okuyucu):** TEKLİF-1 'Yerel işletme arama paketi' (ajanlı site + yerel SEO/AEO + aylık ölçülü döngü)'nin ücretsiz denetim aracı: GMBspy rakibin Google Business Profile kategorilerini gösterir — yerel işletmeye 'rakibiniz neden haritada önde' denetiminin en ucuz kanıtı; linkgap rakip backlink boşluğu; AnswerThePublic sayfa konusu. Doğrudan para getirmez, denetimin maliyetini sıfıra yakın tutar.
- **Rakam kanıtı:** Fiyat yok; araçlar ücretsiz katmanlı (önceki geçişte adresler 200 döndü).
- **İlk para:** W072'nin ücretsiz denetim adımına iki araç olarak eklenir; 0 $.
- **Engel ve aşma:** Beşinci araç DM'e kilitli → gerek yok. GMBspy bir Chrome uzantısı → CEO'nun tarayıcısına kurulmaz; aynı veri GBP sayfasından okunur.
- **Öneri:** İzle
- **İkinci turda:** 1/Gerek yok
- **Oturum (0-3):** 0
- **Tahta satırı:** B28 (reklam/ajans işi)
- **Link(ler):** https://www.instagram.com/reel/DcewaU1NSPB/
- **Neye bakıldı:** adım 1: video 36 sn, döküm tamamı; adım 2: 5 kare (frames.sh — linkgap.io, answerthepublic.com, Search Console, GMBspy Chrome mağazası sayfası); adım 3 gerekmedi (puan 1); linkgap.io ve answerthepublic.com adresleri curl ile açık (200)

### What it is — the watch record (newest pass)
- **tur:** araç
- **ne_bu:** 36 saniyelik liste videosu: 1) linkgap.io (Backlink Gap Analyzer — rakiplerin backlink'lerini bulma; Whisper 'linkapp.io' duydu, ekranda linkgap.io, site açık), 2) answerthepublic.com (Neil Patel; ne sattığını yaz, insanların sorduğu soruları listeler), 3) Google Search Console (seni hangi aramalarla bulduklarını gösterir), 4) GMBspy (rakibin Google Business Profile kategorilerini ve optimizasyonunu gösteren Chrome uzantısı). Beşinci araç 'SEO yaz' yorum-yemiyle saklanıyor.
- **okundu:** evet — döküm ve kareler; 5. araç videoda verilmiyor
- **izlendi:** adım 1: video 36 sn, döküm tamamı; adım 2: 5 kare (frames.sh — linkgap.io, answerthepublic.com, Search Console, GMBspy Chrome mağazası sayfası); adım 3 gerekmedi (puan 1); linkgap.io ve answerthepublic.com adresleri curl ile açık (200)
- **zaten_var:** Hayır — depoda bu araçların kaydı yok
- **not:** Ayrı iş açmaya değmez; SEO hattı kurulduğunda W082/W073 ile birlikte araç listesine eklenebilir. GMBspy üçüncü taraf Chrome uzantısı — tarayıcı verisine erişir. AnswerThePublic'in ücretsiz kotası sınırlı.


## W088 — CLI-Anything (HKUDS/CLI-Anything) — masaüstü programlarını ajanların sürebileceği komut satırı araçlarına çeviren çerçeve
- Link: https://www.instagram.com/reel/Dcq6lm3sn0B/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-30
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** CLI-Anything (HKUDS, Apache-2.0, 51,7k yıldız): Kdenlive/Shotcut, Blender, GIMP/Inkscape, Audacity, LibreOffice, n8n gibi masaüstü programlarını ajanın JSON çıktılı komutla sürmesi — stüdyonun ve çalışanların elleri, B35'teki fare/klavye yolundan hızlı ve deterministik; bizde yok. Her harness gümrük taramasından geçer (düzeltilmiş güvenlik açıkları geçmişi); Eth2 staking harness'i kurulmaz. Bir oturumluk deneme (Kdenlive ya da Blender), 0 $.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Kendi başına para mekanizması yok; B28 videolarında kurgu/altyazı/küçük resim ve B17 #3 rapor belgeleri insan eli olmadan üretilir — teslimatı ucuzlatır ve hızlandırır.
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri + Maliyet düşürme
- **Nasıl para getirir (okuyucu):** Stüdyonun ve çalışanların elleri: Kdenlive/Shotcut (kurgu), Blender (3B), GIMP/Inkscape/Krita (görsel, küçük resim), Audacity/MuseScore (ses), LibreOffice (rapor, teklif), n8n (otomasyon) programları fareyle değil komutla, JSON çıktılı sürülür. B28 ajans videolarında kurgu, altyazı, küçük resim ve teslim dosyası hazırlığı insan eli olmadan yapılır; B17 #3 rapor satışında LibreOffice ile belge üretimi. Makinenin kendisine de gerçek bir ilerleme: B35'teki ekran/fare yolundan daha hızlı ve deterministik.
- **Rakam kanıtı:** Depo (gh api, bu geçiş): Apache-2.0, 51.740 yıldız, son itme 2026-09-22. README'de Kdenlive, Shotcut, Blender, GIMP, Inkscape, Krita, MuseScore, LibreOffice, n8n, Obsidian, Zoom harness'leri ve 'CLI-Hub meta-skill' (ajan kendisi CLI bulur, kurar) kayıtlı. Reeldeki '70 hazır bağlantı' ve '47.000 kişi' yaratıcının sözleri.
- **İlk para:** Elimizde: OpenMontage + ffmpeg, yerel GPU, operator. Eksik: harness kurulumu ve stüdyonun bir işinde deneme. Adım: pip ile cli-anything-hub → Kdenlive veya Blender harness → bir B28 örnek videosunun kurgu/altyazı adımını ajanla yaptır → süreyi ölç. 1 oturum, para çıkışı 0. Onay: proje işi için CEO'nun başla sözü.
- **Engel ve aşma:** Topluluk katkılı CLI'larda güvenlik açıkları geçmişi (GIMP Script-Fu yol enjeksiyonu düzeltilmiş) → her harness gümrük taramasından geçer, yalnız kullanılanlar kurulur. Kayıt defterinde Ethereum staking harness'i var → kurulmaz.
- **İslami sınır:** Kayıt defterindeki Eth2 staking aracı kripto alanına giriyor; kullanılmamalı (hüküm CEO'nun).
- **Öneri:** Dene
- **İkinci turda:** 2/Dene
- **Oturum (0-3):** 1
- **Tahta satırı:** B35
- **Link(ler):** https://www.instagram.com/reel/Dcq6lm3sn0B/
- **Neye bakıldı:** video 26 sn: 1) dökümün tamamı; 2) 4 kare (README tablosu karede okundu). Repo metaverisi ve README'nin ilk ~200 satırı okundu.

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Hong Kong Üniversitesi'nin veri zekâsı laboratuvarından (HKUDS) çıkan CLI-Anything, bir yazılım için ajanın kullanabileceği yapılandırılmış bir CLI 'koşum takımı' (harness) üretiyor; her CLI JSON çıktı veriyor ve yanında bir SKILL.md geliyor. CLI-Hub kayıt defterinden `pip install cli-anything-hub` → `cli-hub install <ad>` ile hazır CLI'lar kuruluyor: GIMP, Blender, Inkscape, Audacity, LibreOffice, Kdenlive, Shotcut, Obsidian, n8n, Zotero, FreeCAD, QGIS, Zoom, ekran kaydedici ve daha fazlası. Repo: 51.720 yıldız, Apache-2.0, son push 2026-09-22. Reel bunu doğru anlatıyor ('70 hazır bağlantı').
- **okundu:** evet — döküm tam, repo ve README okundu
- **izlendi:** video 26 sn: 1) dökümün tamamı; 2) 4 kare (README tablosu karede okundu). Repo metaverisi ve README'nin ilk ~200 satırı okundu.
- **zaten_var:** Hayır (depoda 'cli-anything' adı yok). Ekran/fare yolu B35'te operator ile kurulu.
- **not:** Topluluk katkılı CLI'lar kalite ve güvenlik açısından değişken; README'de GIMP Script-Fu yol enjeksiyonu ve Sketch symlink açığı gibi düzeltilmiş güvenlik hataları geçiyor. Her harness kurulmadan önce gümrük taramasından geçmeli. Denemeye stüdyonun gerçekten kullandığı bir araçla başlanmalı (örn. Kdenlive ya da Blender).


## W089 — Grok Bot (xAI) — Nate Herk'in reeli ve 'Build & Sell Grok Bots (2 Hour Course)': yöneticiler + operatörlerle şirket gibi kurulan ajan takımı ve onu müşteriye satma
- Link: https://www.instagram.com/reel/DctNQ8PxMct/
- His note when he sent it: grokun bot sistemi. herşeyini araştır bizdeki karşılığı eksik tahtasına bunun gibi bir sistem yazılmış mı yazılmışsa eksik ne kalmış onu yapalım.

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-08-31
- **Tür:** strateji
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** Grok Bot kursu (1:45, tamamı okundu) B01/B10 için tasarım girdisi — ürün alınmaz: 'sen → birkaç yönetici → dikey başına operatörler', yöneticilerin yazılı 'Leadership' kanalında birbirini okuyup karar çıkarması, 'önce işin sahibini bul, sonra devret' yönlendirme kuralı, ortak defter + çalışanın kendi defteri, her rutinde çalışma geçmişi / test-run / duraklatma. Eksik liste geçerli: çalışanın eli (B41), 7/24 dayanak (B09–B11), yöneticilerin kanalı (B01), otonomi kadranı (B15).
- **Gelir (0-3):** 2
- **Gelire katkısı:** Kursun 'AI hizmet merdiveni' (ücretsiz iş → saatlik ~100 $ → ücretli denetim 1.000–10.000 $ → kurulum ~5.000 $ → retainer; rakamlar anlatıcının iddiası, bağımsız fiyat kaynağı yok) ve 'kendin canlı kanıt ol' ilkesi: holding bunun en büyük canlı kanıtı (214 persona, tek insan) — B17 #15 ve OS kurulumu bu merdivenle satılır. Para yolu 'makineyi/kurulumunu satalım mı' kararınıza bağlı (B28, 2026-09-20'den beri açık).
- **Gelir katmanı:** Kabiliyet + Ajans/hizmet geliri + OS'in kendisi
- **Nasıl para getirir (okuyucu):** Teknoloji: 'sen → birkaç yönetici bot → dikey başına operatörler', yöneticilerin yazılı 'Leadership' kanalında birbirini okuyup karar vermesi, 'önce işin sahibini bul, sonra devret' kuralı, her rutinin çalışma geçmişi/duraklatma anahtarı — B01 (Yönetim Kurulu) ve B10 (canlı organizma) için doğrudan tasarım girdisi (CEO'nun emri: 'bizdeki karşılığı, eksik ne'). Para: kursun 'AI hizmet merdiveni' — ücretsiz iş → saatlik danışmanlık (~100 $/saat) → ücretli denetim (1.000–10.000 $) → kurulum projesi (~5.000 $) → retainer; şartı 'kendin canlı kanıt ol'. Holding dünyada bunun en büyük canlı kanıtı (214 persona, tek insan): B17 #15 'dijital kadro paketleri' ve 'OS kurulumu' bu merdivenle satılır.
- **Rakam kanıtı:** Fiyat ekranı: SuperGrok 30 $/ay Grok Bot erişimi (önce 200 $'lık planda), SuperGrok Plus 100 $/ay (reel, ekranda). Merdiven rakamları (denetim 1.000–10.000 $, kurulum ~5.000 $, saatlik 100 $, kendi retainer'ları en az 20.000 $/ay) ve '12 ayda ~5 M $ ciro' anlatıcının İDDİASI; cirosunun büyük kısmı eğitim/topluluk (kendi sözü, 0:00). Pazar teyidi: Meta reklam ajansı retainer'ları 1.000–5.000 $+ (https://adadvisor.ai/blog/meta-ads-management-cost) — 'AI ekip kurulumu' için bağımsız fiyat kaynağı bulunmadı.
- **İlk para:** Teknoloji yolu: B01 tasarımına yazılı kurul kanalı + 'sahibini bul' yönlendirme kuralı (oturum, CEO'nun B01 başlatma sözü). Para yolu: önce kanıt — holdingin kendi işini bu düzenle yürüttüğünü gösteren bir vaka sayfası; sonra bir işletmeye ücretli 'AI ekip denetimi'. Eksik: vaka sayfası, teklif. Süre 2–3 hafta; 0 $ (Grok Bot satın alınmaz).
- **Engel ve aşma:** 1) Kurs hunisi → kurs ücretsizdi ve tamamı okundu; fikir alınır, ürün alınmaz. 2) Kapalı ürün (xAI) → açık kaynak karşılığı elie222/rakazo veya kendi orkestratörümüz. 3) Kursun soğuk e-posta önerisi (günde 50) → bizde onay kapısı ve izin kuralları.
- **Öneri:** Dene
- **İkinci turda:** 3/Araştır
- **Neden değişti:** Önceki 3/Araştır (lider düzeltmesi); para yolu sizin 'makineyi satalım mı' kararınıza bağlı olduğu için 2/Dene.
- **Lider notu:** Okuyucu 3/Kur verdi; 2/Dene'ye indirdim. Para merdiveni (ücretli denetim → kurulum → bakım) gerçek bir danışmanlık modeli ve holding onun en güçlü canlı kanıtı; ama 'makineyi ya da kurulumunu satmak' kararı sizde (B28'de 2026-09-20'den beri açık soru) ve fiyatı bağımsız bir kaynakla ölçülmedi. Teknoloji tarafı (yöneticiler + operatörler, 'önce işin sahibini bul') B01 tasarımına doğrudan girdi.
- **Oturum (0-3):** 1
- **Tahta satırı:** B01 (Boardroom), B10 (canlı organizma)
- **Sizin notunuz:** grokun bot sistemi. herşeyini araştır bizdeki karşılığı eksik tahtasına bunun gibi bir sistem yazılmış mı yazılmışsa eksik ne kalmış onu yapalım.
- **Link(ler):** https://www.instagram.com/reel/DctNQ8PxMct/
- **Neye bakıldı:** İlk okuyucu: reel 36 sn dökümü (Speaches) + 36 kare (watchall.sh), ürün web aramasıyla, rakazo ve grok-bot-0.18-reconstructed depoları gh ile, tahta grep ile. Bu okuyucu: 1 sa 45 dk 41 sn'lik kurs CEO'nun Chrome'unda YouTube döküm paneliyle baştan sona okundu (yt-dlp bot engeli böylece aşıldı); döküm transcripts/W089-4hKJ9X6rGFo.txt (reelin dökümü W089-DctNQ8PxMct.txt'de duruyor). Repo ve tahta satırları (B01, B32) salt-okur okundu.

### What it is — the watch record (newest pass)
- **tur:** strateji
- **ne_bu:** İlk okuyucunun bulduğu (korundu): 36 sn'lik reel (Nate Herk) Grok Bot'u tek tek botlarla değil şirket gibi kurmayı gösteriyor — 'YOU' → 3 'Executives' → altında 'Operators' çizimi; C-suite botları (Klaus Chief, Dan, Becky CCO, Chandler CFO), içerik operatörleri ve botların bütçe/işe alma tartıştığı 'Leadership' kanalı. Ürün: 2026-08-11 beta; her bot adlı, hafızalı takım arkadaşı; hesap başına tek bulut bilgisayar, botlar paylaşıyor; bir kez öğret → skill → rutin; bot başına 50 rutin; gönderme/satın alma/silme onay arkasında; açık kaynak karşılığı elie222/rakazo. Şimdi kursun kendisi (4hKJ9X6rGFo, 1:45:41) dökümden tam okundu. Kurs içeriği: 'Leadership' grup kanalında 4 yönetici bot birbirini etiketleyip okuyarak Q4 için 5 karar çıkarıyor (1:41–2:52); her botun 'açıklaması' diğer botlara ne iş yaptığını söyleyen yönlendirme metni — genel kurmay başkanı botun açıklaması: 'Nate yalnız benimle konuşur; her işten önce o işin sahibi başka bot var mı bak, önce devret, uzman yoksa kendin yap' (4:08); tek mega ajan yerine 'sen → birkaç yönetici → dikey başına operatörler' (6:20); 4C çerçevesi: bağlam, bağlantılar, yetenekler, ritim (9:27); kuruluş: SuperGrok 30 $/ay (önce 200 $), masaüstü + iOS, bulutta çalışır, bilgisayar kapalıyken de sürer (12:07); şirket bilgisini Drive'dan hafızaya yükleme (15:46); gelen kutusu botu: 6 etiket, 30 dakikalık acil durum rutini, yalnız taslak, gönderme onayla (19:43–29:48); 'bisiklet yöntemi' — güveni geri bildirimle adım adım vermek (30:00); geri bildirimle skill'e çevirme, haftalık Google Sheets raporu rutini (32:24–37:40); bot kendi işini doğrulayıp eksik bulunca düzeltiyor, 'sana V1 değil V4 gelsin' (39:42–42:42); 'teach a task' tarayıcı kaydı — Nate kullanmıyor (40:42); ClickUp'a görev açan 'Fred' operatörü ve tüm ajan işlerinin ajan/saat/durum/son tarih ile ClickUp'a günlüklenmesi (43:45–55:13); rutinlerde çalışma geçmişi, 'test run', duraklatma (54:09); bölümler, 'all hands' kanalı, ajanlar yeni ajan/skill/rutin öneriyor (55:13–58:23); iki defter: herkesin ortak hafızası + botun kendi hafızası; yöneticiler çok bilir, operatör yalnız işini (58:23–59:27); Composio ile 1000+ uygulama (1:00:18); HyperFrames ile video ajanı (1:04:38); paylaşılan dosya sistemi: context/ ve projects/ klasörleri (1:08:41–1:12:51); her hafta içi 18:00 toplantı dökümü rutini (1:14:56); CMO 'Erin' + tasarımcı 'Studio' + video 'Slice' pazarlama ekibi (1:18:02); Slack mesajıyla tetiklenen rutin (1:27:16); çıktıyı ClickUp/e-posta gibi kendi araçlarına yollama (1:32:26); botu şablon olarak paylaşma/satma (1:34:29); 'Grok Bot kurulum hizmeti' satış merdiveni: ücretsiz iş → saatlik eğitim (~100 $/sa) → ücretli denetim → proje → aylık sözleşme (1:38:57); Clay ile soğuk erişim, '3P: kişi, acı, vaat' (1:43:55). Kullanım: 30 $ planda haftalık kota demoda %6 → %13 → %30 (37:40, 49:00, 1:16:59).
- **okundu:** evet — reel tamamı (ilk okuyucu) ve 2 saatlik kursun dökümü tamamı
- **izlendi:** İlk okuyucu: reel 36 sn dökümü (Speaches) + 36 kare (watchall.sh), ürün web aramasıyla, rakazo ve grok-bot-0.18-reconstructed depoları gh ile, tahta grep ile. Bu okuyucu: 1 sa 45 dk 41 sn'lik kurs CEO'nun Chrome'unda YouTube döküm paneliyle baştan sona okundu (yt-dlp bot engeli böylece aşıldı); döküm transcripts/W089-4hKJ9X6rGFo.txt (reelin dökümü W089-DctNQ8PxMct.txt'de duruyor). Repo ve tahta satırları (B01, B32) salt-okur okundu.
- **zaten_var:** Karşılıkların çoğu yazılı: adlı kalıcı çalışanlar (213 persona, departmanlar, Hamza), WORKFORCE-GAP-MATRIX'te ceo-office 'Chief of Staff' (orkestratör) personası, zamanlayıcı ve rutin iş akışları, onay kapısı (APPROVAL_ENGINE_SPEC), iki katmanlı bağlam sözleşmesi (dxb-hamza-context), MEMORY_ARCHITECTURE, beceri rafı (B41), HyperFrames (stüdyo), Composio araştırması (15 dosya), dxb-verify. Hâlâ eksik (ilk okuyucunun listesi geçerli): çalışanın kendi bilgisayarı/eli — B41 2026-10-04 bacağı tasarlandı, inşa edilmedi, Hamza 'tools: []' ile konuşuyor; 7/24 dayanak sunucu silindi (B09–B11); yöneticilerin kendi kanalı B01 açık, yapılmadı; otonomi kadranı B15 yapılmadı; 'bir kez öğret → skill → rutin' döngüsünün sahibi satır yok; telefon/uzak erişim satırı yok; rutin listesi ve çalışma geçmişinin CEO ekranında görünmesi için ayrı satır görülmedi.
- **not:** Kurs okunduktan sonra ilk okuyucunun eksik listesi değişmedi, iki ayrıntı eklendi. (a) B01 için tasarım girdisi: Nate'in Leadership kanalı sesli değil yazılı; 4 yönetici aynı soruyu kendi alanından cevaplayıp birbirini etiketliyor ve somut kararlar çıkarıyor (2:04–2:52). Bizim B01 'sesli Boardroom' — önce yazılı kanal, sonra ses sırası daha ucuz bir yol olabilir; karar CEO'nun. (b) 'Her ajan işini ajan/saat/durum ile günlükle' (50:16) ve 'rutinde test-run + geçmiş + duraklat' (54:09) — CEO'nun her şeyi görme ve her şeyi değiştirme yüzü için doğrudan kontrol listesi; tahtada ayrı satırı yok, B10 altında sorulmalı. Ürün gözlemi: Slack entegrasyonunda kanala davet edilen uygulamanın adı 'cursor' (1:28:17–1:30:21) — Grok Bot'un altyapısının Cursor'la ilişkili olduğunu düşündürüyor (doğrulanmadı). Kursun 'Grok Bot kurulumu sat' önerisi ücretli, kapalı kaynak bir ürüne bağımlı; bizim ajans hattı için yalnız merdiven fikri (ücretsiz iş → eğitim → denetim → proje → aylık) taşınabilir. Kurmak değil, B01/B41/B10 sırası gelince tasarım girdisi olarak kullanmak öneriliyor; yeni plan dosyası açılmaz.


## W091 — ViMax (HKUDS) — fikirden, senaryodan veya romandan çok sahneli video üreten ajanlı 'yönetmen' çerçevesi
- Link: https://www.instagram.com/reel/DYCll4ROMoa/
- His note when he sent it: (none)

### 2026-10-08 verdict (Excel 'Tüm linkler' row, after Opus+Fable passes)
- **Tarih:** 2026-09-04
- **Tür:** repo
- **Holding (0-3):** 2
- **Teknoloji (0-3):** 2
- **Teknolojiye katkısı:** ViMax (HKUDS, MIT, 12,6k yıldız): senarist → storyboard → karakter tutarlılığı → ilk kare → video → montaj; Novel2Video ile uzun hikâye. README MiniMax H3 desteği gösteriyor; yerel uca bağlanabilirliği ÖLÇÜLMEDİ. İkinci çerçeve değil: bağlanmazsa karakter tutarlılığı ve planlama yöntemi OpenMontage hattına alınır (1 gün, 0 $). AutoCameo gerçek kişi fotoğrafı — rıza ve kadro yasası; dinî hikâyede peygamber tasviri yok.
- **Gelir (0-3):** 1
- **Gelire katkısı:** Doğrudan para yok; kanal hattının hikâye anlatan kolları (W061 'dinî hikâyeler' 6.500 $/M, tarih belgeselleri, W109 bebek serisi) karakter tutarlılığını ister — üretim bedava kalırsa bu kolları açar.
- **Gelir katmanı:** Kabiliyet
- **Nasıl para getirir (okuyucu):** Makinenin video yönetmenliğini ilerleten bir mimari: senarist → storyboard → karakter tutarlılığı → ilk kare → video → montaj; Novel2Video ile uzun hikâye. KANAL HATTI'nda hikâye anlatan kanallar (W061'deki 'dinî hikâyeler' 6.500 $/M, tarih belgeselleri) ve W109 bebek serisinin karakter tutarlılığı tam bunu ister. README MiniMax H3 video üreticisini destekliyor — bizim yerel motorumuzla aynı model ailesi; bağlanırsa üretim bedava kalır.
- **Rakam kanıtı:** Repo: MIT, 12.582 yıldız, son push 2026-09-30, v1.2.0 Web UI (gh api + README). README: 'MiniMax H3 video generator support', yapılandırmada LLM, görsel ve video üretici için API anahtarı isteniyor — yerel uç noktaya bağlanabilirliği ÖLÇÜLMEDİ. Para iddiası yok.
- **İlk para:** Elimizde: MiniMax H3 yerel, OpenMontage. Eksik: ViMax'in video üreticisini yerel H3'e (ya da OpenAI-uyumlu yerel uca) bağlamak; LLM için LiteLLM. Adım: tek kısa hikâye (Idea2Video) yerel uçlarla — bağlanmıyorsa yalnız karakter-tutarlılığı ve planlama yöntemini OpenMontage'a al. Süre 1 gün; 0 $ (yerel) — bulut sağlayıcı seçilirse para çıkışı, CEO onayı.
- **Engel ve aşma:** (1) Bulut API'lerine bağımlı görünüyor → yerel uca bağlama denemesi; olmazsa yöntem alınır, alet kurulmaz. (2) OpenMontage ile çakışma → ikinci çerçeve değil, eksik parça (karakter tutarlılığı) alınır. (3) AutoCameo gerçek kişi fotoğrafı kullanır → rıza şartı.
- **İslami sınır:** AutoCameo'da gerçek kişi görüntüsü ve kadın betimleme stüdyo kuralına tabi; dinî hikâyelerde peygamber tasviri yapılmamalı.
- **Öneri:** Dene
- **İkinci turda:** 2/İzle
- **Neden değişti:** Önceki 2/İzle; README yerel motorumuzla aynı MiniMax H3 desteğini gösteriyor ve karakter tutarlılığı kanal hattının hikâye kollarının ihtiyacı — denenecek somut bir ilerleme.
- **Oturum (0-3):** 0
- **Tahta satırı:** B43, B33
- **Link(ler):** https://www.instagram.com/reel/DYCll4ROMoa/
- **Neye bakıldı:** adım 1: döküm tamamı (14 sn, 3 cümle); adım 2: 5 kare (depo adı ve örnek çıktılar okundu); adım 3 yapılmadı (puan 3 değil); depo README ve GitHub metası

### What it is — the watch record (newest pass)
- **tur:** repo
- **ne_bu:** Reel (14 sn) yalnızca 'yeni açık kaynak ajanlı video üretici, dört aracı bir araya koyuyor, bedava' diyor; ekranda HKUDS/ViMax README'si ve örnek çıktılar (F1 arabası, kedi-astronot sahneleri) var. Depo gerçek: MIT, 12,6k yıldız, son itme 2026-09-30, v1.2.0. Idea2Video, Script2Video, Novel2Video ve fotoğraftaki kişiyi/evcil hayvanı hikâyeye yerleştiren AutoCameo; senarist → storyboard → karakter tutarlılığı → ilk kare → video → montaj zinciri; TUI ve Web UI. Üretim dış sağlayıcılardan geçiyor: OpenRouter üzerinden sohbet modeli (Gemini), GPT Image 2, Seedance 2.0 Fast, MiniMax H3, Google Omni — her biri API anahtarı ister; 'bedava' olan yalnız çerçeve.
- **okundu:** evet — reel tamamen, README sağlayıcı yapılandırmasına kadar
- **izlendi:** adım 1: döküm tamamı (14 sn, 3 cümle); adım 2: 5 kare (depo adı ve örnek çıktılar okundu); adım 3 yapılmadı (puan 3 değil); depo README ve GitHub metası
- **zaten_var:** OpenMontage (ajanlı video üretim hattı, klonlu ve ölçülmüş) ve MiniMax H3 INSTALL kartı; ViMax repoda yok
- **not:** OpenMontage ile aynı alanda; ikinci bir video ajan çerçevesi kurmak yerine ViMax'in karakter tutarlılığı ve Novel2Video planlama yöntemi OpenMontage hattına fikir olarak alınabilir. Bulut üretimi kullanım başına ücretli (para çıkışı, CEO kapısı). AutoCameo gerçek kişinin fotoğrafını kullanır — kişi izni ve stüdyonun kadın betimleme kuralı geçerli.
