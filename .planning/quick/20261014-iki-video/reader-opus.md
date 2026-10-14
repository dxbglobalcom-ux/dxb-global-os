# İki video ve bir X gönderisi — okuyucu: opus (Opus 5.5), 2026-10-14 gece

Girdiler: V1 = Nate Herk, "I Tried 100+ Github Repos for Claude. These 6 Are the Best" (2026-10-11); V2 = Dubibubi,
"9 Claude Skills I Use Every Single Day" (2026-09-26); X1 = RahulTechX gönderisi (2026-10-14) ve videosu.
Bağlantıların hepsi videoların kendi açıklamalarından alındı (`yt-dlp --print description`). Her depo `gh api repos/O/R`
ile açıldı; yıldız, son push, lisans 2026-10-14 gecesi ölçüldü. X1'in videosu (33 dk 24 sn) yalnız ses olarak
yazıya döküldü (watch.sh + Speaches, 4 parça; 3. parça ilk denemede düştü, tekrarla tamamlandı). Kare kare izlenmedi.

**Hariç (onun sözüyle, değerlendirilmedi):** taste (taste-skill), impeccable, caveman (kurulu), ponytail, Agent-Reach.

**Ölçülen tek önemli karşı-kural:** Addy Osmani'nin agent-skills'i, Matt Pocock'un skills'i, pstack ve unlazy bir
"çalışma yöntemi" paketidir. Bu sınıf, 2026-08-27 tarihli emriyle holdingin dışındadır
(`CAPABILITY_ARSENAL_DOCTRINE.md` 1-ter: *"superpowers, gsd, ruflo, gstack vb pluginler holdingimize girmeyecek"*;
yöntem sınıfının tanımı orada yazılı). Videolar bunları övüyor; yetki sırasında onun yazılı emri üstündür. Bu yüzden
öneri "alma". Yeniden açmak yalnız onun sözüyle olur.

---

## A. İş yapan araçlar (değerlendirilenler)

### 1. HyperFrames (HeyGen)
- **Bağlantı:** https://github.com/heygen-com/hyperframes
- **Hangi video:** V1 00:26 · V2 11:20
- **Ne bu:** HTML, CSS ve animasyondan birebir aynı MP4'ü üreten açık kaynak bir çerçeve. Headless Chrome kareyi
  çizer, FFmpeg kodlar. Claude Code eklentisi ve beceri seti de var.
- **Gerçek mi:** Evet. 63.591 yıldız, son push 2026-10-14, Apache-2.0. Anthropic'in resmî eklenti pazarında da
  `hyperframes` adıyla duruyor (yerel kopyada ölçüldü). Gereken Node 22+ (bizde v22.23.2), FFmpeg
  (`~/.local/bin/ffmpeg`) ve Chrome (`/usr/bin/google-chrome`); üçü de makinede var. "Render başına ücret yok"
  sözü doğru: yerel çekirdek ücretsiz, HeyGen'in bulut ve avatar tarafı ayrıca ücretli. V2'deki "bu videonun bütün
  hareketli grafikleri HyperFrames ile yapıldı" sözü yaratıcının iddiası; doğrulanmadı.
- **Elimizde var mı:** Yok, kurulu değil. Çalışma kartı var (`study-cards/heygen-hyperframes.md`, STUDY, meşruiyet OK).
  **Zaten MERGE ve ORDER'da:** W025 ve sıra #45 (B43, "HyperFrames and long→short lanes").
- **Holdingte yeri:** #45 B43 stüdyo. Oradan #46 Y8 kanal hattı ve #49 B28 açıklayıcı videolarına gider.
- **İnşaat ekibine:** Evet, ama #45'in sırası gelince: stüdyonun motion-graphics koltuğuna, tezgâhta bir pilot olarak (Kanun D).
- **Getirisi:** İkisi de. Ekran kartını kullanmadığı için B33'ün kart kuyruğuna girmez. Kanal tanıtımları, başlık
  kartları, altyazı ve açıklayıcı videoları GPU'suz üretir. MERGE'deki 16 numaralı gelir fikri, helal-finans
  açıklayıcıları, doğrudan buna dayanır.
- **Risk:** Hazır şablonlarda müzik ya da görsel olabilir; Y4 helal ekranından (#5) geçmeli. Sürüm hızlı değişiyor,
  bu yüzden sürüm sabitlenmeli.
- **Onay gerekir:** Kurulum için onun "evet"i gerekir.
- **Öneri:** **al**. Sırası #45'te. Ücretsiz, makinede çalışır, kart kuyruğunu beklemez.

### 2. Google Workspace CLI (`gws`)
- **Bağlantı:** https://github.com/googleworkspace/cli
- **Hangi video:** V1 01:28
- **Ne bu:** Drive, Gmail, Takvim, Sheets, Docs ve diğer Workspace API'leri için tek bir komut satırı aracı.
  Komutlarını Google'ın Discovery servisinden çalışırken kurar. İçinde 40'tan fazla ajan becerisi var (`gws-gmail-send`,
  `gws-sheets-append` …).
- **Gerçek mi:** Evet. 31.497 yıldız, son push 2026-10-06, Apache-2.0. Ama README açıkça **"not an officially
  supported Google product"** diyor ve 1.0 öncesi olduğu için kırıcı değişiklik bekleniyor. Giriş için bir Google
  Cloud projesi ve OAuth gerekiyor.
- **Elimizde var mı:** Yok. Yakın bir ikizimiz var: outbox-executor'daki tek Gmail-gönderme yetkisi
  (`packages/outbox-executor/src/actions/email-send-staging.ts`).
- **Holdingte yeri:** #24 B64 adım 5 (posta kutusu ve Resepsiyon) ile #52 B05 (Gmail send).
- **İnşaat ekibine:** Hayır, şimdi değil. #24 sırası gelince tezgâhta bir deneme hesabıyla denenir.
- **Getirisi:** Makine tarafında, Resepsiyon'un gelen postayı okuyup dosyalaması için hazır bir el olur.
- **Risk:** Kimlik ve yetki adımı gerektirir; OAuth kapsamı geniş tutulursa hesabın tamamı açılır. Resmî Google ürünü
  değil ve henüz 1.0 öncesi.
- **Onay gerekir:** Google Cloud projesi ve OAuth bir kimlik adımıdır, onun eli gerekir. Kurulum için de onayı gerekir.
- **Öneri:** **izle**, #24'te dene. Bugün ihtiyaç duyduğumuz bir iş için gerekli değil.

### 3. Apify MCP Server
- **Bağlantı:** https://github.com/apify/apify-mcp-server
- **Hangi video:** V1 02:16
- **Ne bu:** Ajanı Apify Store'daki binlerce hazır kazıyıcıya ("Actor") bağlayan bir MCP sunucusu. Sunucu açık
  kaynak, kazıyıcılar ise Apify'ın bulutunda çalışır.
- **Gerçek mi:** Evet. 11.220 yıldız, son push 2026-10-14, MIT. Ücretsiz plan "$5 of monthly prepaid platform usage";
  bunu apify.com/pricing sayfasında ölçtüm.
- **Elimizde var mı:** İkizlerimiz kurulu: Agent-Reach, Scrapling ve MediaCrawler (B30). Çalışma kartı var
  (`study-cards/apify.md`, STUDY). **Zaten MERGE'de:** W014 → Y9 (#48) ve B30.
- **Holdingte yeri:** #48 Y9 (müşteri bulma) ve B41 zincirinde "ücretli ikiz" olarak (#40).
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir. Instagram ve TikTok'ta ücretsiz araçların takıldığı yerde müşteri listesi çıkarır.
- **Risk:** Para çıkışı (sonuç başına ücret). Ham liste satışı ve KVKK yasağı MERGE'de yazılı.
- **Onay gerekir:** Para çıkışı.
- **Öneri:** **izle**. Ücretsiz ikizler önce denenir; ancak onlar takılırsa fiyatıyla birlikte ona sunulur.

### 4. ScrollCraft
- **Bağlantı:** https://github.com/nateherkai/scroll-craft
- **Hangi video:** V1 03:08 (yaratıcının kendi aracı; videoda kendisi "full disclosure" diyor)
- **Ne bu:** Kaydırmayla ilerleyen, sinematik web sayfaları kuran bir ajan becerisi. Bir kaydırma motoru, tasarım
  kuralları ve kaydırmayı ekran görüntüsüyle denetleyen bir kontrolcü içerir.
- **Gerçek mi:** Evet. 3.419 yıldız, son push 2026-09-30, MIT. Açıklamadaki "ücretsiz" bağlantı bir e-posta toplama
  sayfasına gidiyor, ama GitHub deposu herkese açık.
- **Elimizde var mı:** **Zaten var.** `~/.claude/skills/scrollcraft` kurulu; changelog'un son girdisi 2026-08-23.
  Üst kaynak bizdeki sürümden yeni.
- **Holdingte yeri:** **Zaten ORDER'da:** #42 B42 (üst kaynak 0.3.1 farkı, W078) ve #47 Y11 (holdingin kendi sitesi).
- **İnşaat ekibine:** Zaten kurulu.
- **Getirisi:** Gelir. MERGE'deki 13 numaralı fikir: premium kaydırma siteleri.
- **Risk:** Yok, yalnız sürüm kayması.
- **Onay gerekir:** Güncelleme bir değişikliktir; #42'nin sırası gelince sorulur.
- **Öneri:** **zaten var**. #42'deki fark okuması yeterli.

### 5. Humanizer
- **Bağlantı:** https://github.com/blader/humanizer
- **Hangi video:** V1 04:18
- **Ne bu:** Yapay zekâ ile yazılmış metindeki kalıpları ("X değil, Y", üçlü sıralamalar, abartı kelimeleri)
  temizleyen bir beceri. Wikipedia'nın "Signs of AI writing" rehberine dayanır.
- **Gerçek mi:** Evet. 56.924 yıldız, son push 2026-09-28, MIT. README'nin kendisi "detectors still flag most of its
  output" diyor; yani amaç dedektörü atlatmak değil, okunurluk. Kalıplar yalnız İngilizce için yazılmış.
- **Elimizde var mı:** Yok. Çalışma kartı var (`study-cards/humanizer.md`, STUDY, meşruiyet OK). İkizi: B43'ün
  içerik becerisi ve W035'in yazım kuralları (ORDER #45).
- **Holdingte yeri:** #45 B43 içerik becerisi. Kurulmadan önce, onun 14 Ekim'de emrettiği kör A/B testinden geçer
  (commit a47543aa: "two identical writers, one with it and one without, judged blind"). Sonra #24 dış posta ve
  #47 site metni.
- **İnşaat ekibine:** Hayır. Holdingin yazan koltuklarına (stüdyo ve satış) gider.
- **Getirisi:** Gelir. İngilizce kanal anlatımı, soğuk e-posta ve site metni "yapay zekâ kokmaz".
- **Risk:** Türkçe kapsamı yok. Ses tonunu düzleştirebilir; testin ölçeceği şey de bu.
- **Onay gerekir:** Kurulum için onay gerekir. Kör test zaten onun emri.
- **Öneri:** **dene**. #45'teki kör testte aday olur; No AI Slop (madde 10) ile yarıştırılır.

### 6. Expo Skills
- **Bağlantı:** https://github.com/expo/skills
- **Hangi video:** V1 06:23
- **Ne bu:** Expo ekibinin resmî becerileri: React Native uygulamasını kurmak, EAS ile yayınlamak, sürüm yükseltmek.
- **Gerçek mi:** Evet. 2.850 yıldız, son push 2026-10-14, MIT, resmî. Anthropic pazarında `expo` adıyla duruyor.
- **Elimizde var mı:** Yok.
- **Holdingte yeri:** Yeri yok. Holdingin mobil uygulaması yok; MERGE fikir 22 (cami ve Kur'an kursu mini
  uygulamaları) ancak B17'ye (#50) bağlı.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Bugün yok.
- **Risk:** Apple geliştirici hesabı yıllık $99; bu para çıkışı ve kimlik adımıdır.
- **Onay gerekir:** —
- **Öneri:** **izle**. Bir müşteri uygulaması işi gelirse kullanılır.

### 7. Supabase Agent Skills
- **Bağlantı:** https://github.com/supabase/agent-skills
- **Hangi video:** V1 07:01
- **Ne bu:** Supabase'in resmî iki becerisi. `supabase`: Auth, RLS, Edge Functions, migration ve güvenlik denetimi.
  `supabase-postgres-best-practices`: sorgu, index, bağlantı havuzu, kilitlenme ve RLS kuralları, etkiye göre sıralı.
- **Gerçek mi:** Evet. 2.827 yıldız, son push 2026-10-02, MIT, resmî Supabase org. Dikkat: Anthropic pazarındaki
  `supabase` eklentisi başka bir şey (supabase-community'nin MCP'si, veritabanına dokunur). Önerdiğim yalnız
  becerilerdir, MCP değil.
- **Elimizde var mı:** Yok. Çalışma kartlarımız Supabase'in kendisi hakkında; beceriler hakkında kart yok.
- **Holdingte yeri:** #3 B64 adım 1 (migration'lar), #4 Y3 ikinci duvar (F-R1-3'teki 16 anon-çalıştırılabilir
  definer, F-R1-5'teki pgboss/storage açığı) ve #6 Y5.
- **İnşaat ekibine:** **Evet.** Migration yazan koltuğa (yazan oturum, helper-writer, builder) ve SQL denetleyen göze.
- **Getirisi:** Makine. Holdingin bütün durumu tek bir Supabase/Postgres'te duruyor (STACK.md) ve ilk sekiz sıranın
  yarısı bu veritabanının güvenliği. Becerinin kuralları da tam olarak bu açıkları anlatıyor.
- **Risk:** Düşük; markdown bilgisi. MCP'si kurulmamalı: şirket veritabanı yalnız SELECT ile okunur.
- **Onay gerekir:** Kurulum için onay gerekir (tek klasör, `~/.claude/skills`).
- **Öneri:** **al**. #3'ten önce. Ücretsiz, resmî ve en çok yaralandığımız yere değiyor.

### 8. Stripe Best Practices (stripe/ai içindeki beceri)
- **Bağlantı:** https://github.com/stripe/ai/tree/main/skills/stripe-best-practices
- **Hangi video:** V1 07:19
- **Ne bu:** Stripe entegrasyon kararları için resmî beceri: Checkout ile PaymentIntents arasında seçim, sandbox,
  webhook doğrulama, anahtar yetkileri, vergi.
- **Gerçek mi:** Evet. Repo 1.940 yıldız, son push 2026-10-14, MIT. Beceri klasörü 2026-10-10'da güncellendi.
  Videonun "tam eklentiyi değil yalnız bu beceriyi kur" uyarısı makul: tam eklenti `providers/claude/plugin`.
- **Elimizde var mı:** Yok. Çalışma kartı var (`study-cards/stripe-mcp.md`, STUDY).
- **Holdingte yeri:** #52 B05 (gerçek ödeme). O sıra onun emriyle açılır.
- **İnşaat ekibine:** Hayır, B05 açılınca evet.
- **Getirisi:** Gelir: para girişinin güvenli yolu (fiyatın tarayıcıdan gelmemesi, webhook imzası).
- **Risk:** Stripe'ın kredi, taksit ve Treasury gibi ürünleri faizle ilişkilidir; riba eleği gerekir.
- **Onay gerekir:** Stripe hesabı bir kimlik adımıdır.
- **Öneri:** **izle**. B05 açılınca al.

### 9. Playwright CLI (Microsoft)
- **Bağlantı:** https://github.com/microsoft/playwright-cli
- **Hangi video:** V1 07:52
- **Ne bu:** Playwright'ın komut satırı yüzü. Ajan, sayfayı kısa komutlarla açar, tıklar ve ekran görüntüsü alır.
  MCP'nin aksine sayfa ağacını modele dökmez.
- **Gerçek mi:** Evet. 14.177 yıldız, son push 2026-10-14, Apache-2.0, resmî Microsoft. "Token'da daha hafif"
  sözü README'nin kendi iddiası; bizde ölçülmedi.
- **Elimizde var mı:** İkizlerimiz var. Playwright MCP bu oturumda bağlı (`mcp__playwright__*`), `playwright`
  eklentisi kurulu ama kapalı, B35'te Playwright headless eli var.
- **Holdingte yeri:** #16 B64 adım 3 (tarayıcıyla doğrulama döngüsü W010) ve V2 yüzeyleri yapılırken dxb-verify (#22).
- **İnşaat ekibine:** Evet, doğrulama koltuğuna. Önce MCP ile aynı on işte token ölçülür.
- **Getirisi:** Makine. Ekran doğrulaması daha ucuz olur; 2.4 milyon token dersinin konusu tam bu.
- **Risk:** Düşük. Elimizdeki MCP ile ikilik yaratır; ölçüm sonucu hangisinin kalacağını seçer.
- **Onay gerekir:** Kurulum (`npm -g`) için onay gerekir.
- **Öneri:** **dene**. #16'da, MCP'ye karşı ölçülür.

### 10. No AI Slop
- **Bağlantı:** https://github.com/petergyang/no-ai-slop
- **Hangi video:** V2 06:28
- **Ne bu:** 20'den fazla yapay zekâ yazı kalıbını temizleyen bir beceri. Sesi düzleştirmemeyi hedefler ve neyi
  değiştirdiğini listeler.
- **Gerçek mi:** Evet. 12.365 yıldız, son push 2026-09-02, MIT. Video "22 kalıp" diyor; README "20+" diyor.
- **Elimizde var mı:** Yok. İkizi Humanizer (madde 5) ve W035.
- **Holdingte yeri:** #45, aynı kör testte.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir, Humanizer ile aynı yoldan.
- **Risk:** Yalnız İngilizce.
- **Onay gerekir:** Kurulum için onay gerekir.
- **Öneri:** **dene**. Humanizer'ın rakibi olarak kör teste girer, kazanan kalır.

### 11. Claude Security (Anthropic eklentisi)
- **Bağlantı:** https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security
- **Hangi video:** V1 08:12
- **Ne bu:** Oturumun içinde bir ajan ekibi çalıştırır: mimariyi çıkarır, tehdit modeli kurar, açık arar ve her
  bulguyu ayrı bir ajanla doğrular. İstenirse yama dosyası önerir. Anthropic'in barındırılan "Claude Security"
  ürününün oturum içi sürümüdür.
- **Gerçek mi:** Evet. Resmî pazar 38.048 yıldız, Apache-2.0; eklenti klasörü 2026-09-25'te güncellendi. Yerel pazar
  kopyasında mevcut (`~/.claude/plugins/marketplaces/claude-plugins-official/plugins/claude-security`). README
  Opus 5.5 veya Fable 5.1 öneriyor; taramanın bazı kısımları Opus 4.8'e düşebiliyor. Kendi yalıtımı yok.
- **Elimizde var mı:** Kurulu değil. Yerleşik `/security-review` becerisi daha hafif bir ikiz.
- **Holdingte yeri:** #4 Y3 ikinci duvar. Ayrıca #51 anahtar dönüşünden önce tam bir tarama.
- **İnşaat ekibine:** Evet, ama sürekli açık durmamalı: tek tarama, inşaat kopyasında.
- **Getirisi:** Makine. Bulguları ikinci bir ajan doğruluyor; bu, bizim "ölçmeden söyleme" kuralımızla aynı yapı.
- **Risk:** Token maliyeti (tarama önce maliyeti sorup onay alıyor). Doktrin 1-bis gereği, açılmadan önce
  hook'ları ölçülmeli.
- **Onay gerekir:** Kurulum ve tarama maliyeti.
- **Öneri:** **dene**. #4'te tek bir tarama.

### 12. OpenSEO
- **Bağlantı:** https://github.com/every-app/open-seo
- **Hangi video:** V1 08:38
- **Ne bu:** Semrush ve Ahrefs'e açık kaynak bir alternatif: anahtar kelime, sıralama, backlink ve site denetimi.
  MCP ve beceriler içerir. Veriyi kullanıcının kendi DataForSEO anahtarıyla çeker.
- **Gerçek mi:** Evet. 23.603 yıldız, son push 2026-10-14, MIT. Videonun "veri onların sunucusunda kalır" sözü
  barındırılan sürüm için doğru; kendin barındırırsan (Docker veya Cloudflare) veri sende kalır. Barındırılan sürüm,
  DataForSEO isteklerinin üstüne %28 ekliyor (README).
- **Elimizde var mı:** Yok. **Zaten ORDER'da:** #14 (B41'in satış dilimi) ve #40. MERGE X-21: "DataForSEO 50 $ after
  the own site".
- **Holdingte yeri:** #14, #47 Y11, #49 B28.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir. Yerel SEO ve AEO hizmeti (MERGE fikir 7-8).
- **Risk:** DataForSEO para çıkışıdır.
- **Onay gerekir:** DataForSEO hesabı ve ödemesi.
- **Öneri:** **zaten ORDER'da**. Sırası gelince al.

### 13. Vibe Security
- **Bağlantı:** https://github.com/raroque/vibe-security-skill
- **Hangi video:** V2 03:30
- **Ne bu:** "Vibe-code" ile yazılmış uygulamalardaki tipik açıkları arayan bir beceri: koda gömülü anahtar,
  atlanmış RLS, fiyatın istemciden gelmesi, localStorage'da duran token. Kurallar teknolojiye göre ayrı dosyalarda.
- **Gerçek mi:** Evet, ama bakımsız. 1.122 yıldız (video "binin altında" diyor, artık üstünde), MIT, **son push
  2026-03-15** (yedi ay önce).
- **Elimizde var mı:** İkizleri: Claude Security (madde 11), Supabase becerisi (madde 7), `/security-review`.
- **Holdingte yeri:** #4 Y3, ama yalnız okuma listesi olarak.
- **İnşaat ekibine:** Hayır, kurulmaz. Kontrol listesi #4'te elle okunur.
- **Getirisi:** Makine, az. Supabase ve Next.js maddeleri bizim yığınımıza uyuyor.
- **Risk:** Eski kalmış olabilir.
- **Onay gerekir:** —
- **Öneri:** **izle**. Resmî ikizleri daha güçlü.

### 14. autoresearch (karpathy)
- **Bağlantı:** https://github.com/karpathy/autoresearch
- **Hangi video:** V2 16:07
- **Ne bu:** Bir ajanın tek bir GPU'da küçük bir dil modeli eğitim kodunu değiştirip 5 dakika eğitmesi, sonucun
  daha iyi olup olmadığına bakması ve iyiyse tutup kötüyse atması döngüsü. Talimatlar `program.md`'de.
- **Gerçek mi:** Repo gerçek: 97.908 yıldız, son push 2026-03-26, lisans dosyası yok (gh: none). Ama videonun
  "auto research skill" dediği şey bir beceri değil, bir model eğitimi düzeneği. Videodaki spor programı örneği
  yalnız yöntemi bir prompt'la uyguluyor.
- **Elimizde var mı:** Çalışma kartı var: "not installed, and not to be installed". **Zaten ORDER'da:** #28 C40
  (sabit bir skora karşı "iyiyse tut" döngüsü, kalite kapısının dışında).
- **Holdingte yeri:** #28 C40.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Makine: yöntem #28'de zaten yazılı.
- **Risk:** —
- **Onay gerekir:** —
- **Öneri:** **zaten ORDER'da**. Kurulmaz.

### 15. AI Job Search
- **Bağlantı:** https://github.com/MadsLorentzen/ai-job-search
- **Hangi video:** V2 15:24
- **Ne bu:** Bir kişinin kendi iş başvurularını yürütmesi için Claude Code üstünde bir iskelet: ilanı
  değerlendirir, CV ve ön yazı hazırlar.
- **Gerçek mi:** Evet. 46.795 yıldız, son push 2026-10-08, MIT.
- **Elimizde var mı:** Yok.
- **Holdingte yeri:** Yeri yok. Holding iş aramıyor.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Yok.
- **Risk:** —
- **Onay gerekir:** —
- **Öneri:** **alma**.

### 16. Open Design
- **Bağlantı:** https://github.com/nexu-io/open-design
- **Hangi video:** V2 15:46
- **Ne bu:** Claude Design'a açık kaynak, yerelde çalışan bir alternatif. Prototip, ekran ve sunum çizer; beceriyle
  genişletilebilir.
- **Gerçek mi:** Evet. 101.156 yıldız, son push 2026-10-14, Apache-2.0.
- **Elimizde var mı:** **Zaten var**, `open-design@open-design` eklentisi kurulu ama kapalı (`claude plugin list`).
  **Zaten MERGE'de:** W025, W040 → B32.
- **Holdingte yeri:** #21 B32, yalnız taslak aracı olarak.
- **İnşaat ekibine:** Zaten kurulu.
- **Getirisi:** Makine: V2 taslakları.
- **Risk:** 2026-09-19'da bağlanamadı (M-12); bugün yeniden ölçülmedi.
- **Onay gerekir:** Açmak onun sözüyle olur.
- **Öneri:** **zaten var**.

### 17. CodeBurn
- **Bağlantı:** https://github.com/getagentseal/codeburn
- **Hangi video:** V1 09:27
- **Ne bu:** Claude Code dahil 37 aracın diskteki oturum kayıtlarını okuyup token harcamasını modele, projeye ve göreve
  göre gösteren yerel bir araç. Her mesajda yüklenen ama hiç kullanılmayan MCP gibi israfı işaretler.
- **Gerçek mi:** Evet. 11.446 yıldız, son push 2026-10-14, MIT. README'ye göre CLI dışarıya hiçbir şey göndermiyor;
  yalnız fiyat listesini günde bir kez LiteLLM'den çekiyor. `codeburn quota` saklı kimlik bilgileriyle sağlayıcıya
  soru soruyor; `share --pair` LAN'a açılıyor.
- **Elimizde var mı:** Kısmi ikizler var: dxb-ctx bağlam ölçeri (yalnız oturum içi) ve LiteLLM maliyet defteri
  (şirket tarafında). İnşaat oturumlarının harcamasını proje ve görev bazında gösteren bir aracımız yok.
- **Holdingte yeri:** #37 B34 (X-9'un iki ölçümü) ve #13 seviye menüsü.
- **İnşaat ekibine:** Evet, ölçüm aracı olarak, salt-okur.
- **Getirisi:** Makine: inşaat maliyeti tahminle değil ölçümle konuşulur.
- **Risk:** `quota` ve `share` komutları kullanılmamalı.
- **Onay gerekir:** Kurulum (npx veya npm) için onay gerekir.
- **Öneri:** **dene**. Bir haftalık inşaat kaydı üstünde, yalnız okuyarak.

### 18. claude-mem (videoda "hold off" uyarısıyla geçiyor)
- **Bağlantı:** https://github.com/thedotmack/claude-mem
- **Hangi video:** V1 09:36
- **Ne bu:** Oturumlar arası hafıza eklentisi.
- **Gerçek mi:** Videonun "kullanım verisi gönderiyor" sözü doğru. Kendi dokümanı: *"It is on by default (opt-out)"*
  (`docs/public/telemetry.mdx`); PostHog'a anonim kurulum kimliği, model adı ve fatura katmanı gidiyor. Bizde
  ölçtüm: `~/.claude-mem/telemetry.json` içinde `"decidedAt": ""` (karar verilmemiş), `DO_NOT_TRACK` tanımsız,
  sürüm 13.16.0 **açık**. Dokümana göre bu durumda telemetri açık; gönderim trafiğini ayrıca ölçmedim.
- **Elimizde var mı:** **Zaten var ve açık.**
- **Holdingte yeri:** Doktrin 1-quinquies (hafızaya parça kaynağı).
- **İnşaat ekibine:** Zaten kurulu.
- **Getirisi:** —
- **Risk:** Makinenin kullanım bilgisi dışarı gidiyor (anonim).
- **Onay gerekir:** Kapatmak bir alet ayarı değişikliğidir. "Kapatmadan önce sor" kuralı gereği onun tek
  satırlık sözü gerekir (`npx claude-mem telemetry disable` ya da `DO_NOT_TRACK=1`).
- **Öneri:** Kendisine tek satır sorulsun: **telemetri kapatılsın mı?**

### 19. Prompting playbook (X1 videosu)
- **Bağlantı:** https://x.com/RahulTechX/status/2110166431610572865 · aynı konuşma Anthropic'in kendi kanalında:
  https://www.youtube.com/watch?v=G2B0YWuJUgI ("The prompting playbook", Claude kanalı, 2026-05-22, 152.901 izlenme)
- **Hangi video:** X1, 00:00–33:24 (Margot Van Laar, Anthropic uygulamalı yapay zekâ mühendisi, Code with Claude
  Londra)
- **Ne bu:** Bir depo değil, bir konuşma. Anlattıkları şunlar: (1) önce eval: kontrol, kenar ve devretme vakaları;
  (2) XML ile düzen ve çıktı sözleşmesi, gerekirse harness'ta stop sequence; (3) eski modeller için eklenmiş
  savunma yamaları yeni modelde aşırı uygulanıp bilgi saklatıyor; her yama sebebiyle sürüm kontrolünde tutulmalı;
  (4) "talimat yetenek eklemez": hesap için emir değil araç ver; (5) bir kuralın maliyetini yazıyorsan faydasını
  da yaz; (6) tek büyük prompt yerine üretim, değerlendirme ve onarım için üç ayrı prompt. Konuşmadaki örnekte bu
  yol, Opus'un adaptive thinking'ine göre daha az token ve daha düşük gecikmeyle bütün testleri geçti.
- **Gerçek mi:** Konuşma gerçek ve Anthropic'in. **Gönderinin hikâyesi yanlış:** "never supposed to get out" değil,
  Mayıs'tan beri herkese açık, resmî kanalda. Alıntılanan makale (x.com/i/article/2073973224455733248) yalnız
  genel bir "LLM nasıl eğitilir" yazısı; içinde araç yok.
- **Elimizde var mı:** Fikirlerin bir kısmı zaten bizde: kör A/B testi, W101 "kontroller geçmeden kart kapanmaz",
  dxb-verify. Persona ve Hamza prompt'larının eski model yamaları açısından taranması ise hiçbir satırda yok
  (aramadım; olmadığını iddia etmiyorum, yalnız ORDER ve MERGE'de görmedim).
- **Holdingte yeri:** #11 (Hamza'nın bağlamı), #13 (başın planı: model, seviye ve harness birlikte), #16 (üret,
  değerlendir, onar döngüsü).
- **İnşaat ekibine:** Evet, bilgi olarak: dxb-persona ve dxb-hamza-context kapılarını açan koltuğa.
- **Getirisi:** Makine. Opus 5'ten 5.5'e geçişte prompt'larda kalan yamaları bulmak için bir yöntem.
- **Risk:** —
- **Onay gerekir:** Bir kapıyı (door) değiştirmek onun sözüyle olur.
- **Öneri:** **al (bilgi)**. Kurulacak bir şey yok.

---

## B. Yöntem sınıfı: 2026-08-27 emriyle holding dışı (öneri: alma)

| Ad | Bağlantı | Video | Gerçek mi (ölçülen) | Neden alma |
|---|---|---|---|---|
| Addy Osmani — agent-skills | https://github.com/addyosmani/agent-skills | V1 05:23 | 106.633 yıldız, MIT, push 2026-10-13; /spec /plan /build /test /review /ship | Bir çalışma yöntemi; dxb-team2 ve dxb-verify'ın rakibi olur. Videonun "Addy Anthropic'te Claude Code'da çalışıyor" sözünü doğrulamadım. |
| Matt Pocock — skills | https://github.com/mattpocock/skills | V1 06:12 · V2 09:45 | 291.043 yıldız, MIT, push 2026-10-13; Anthropic pazarında `mattpocock-skills` | Yöntem sınıfı. V2'nin anlattığı kullanım (bir orkestratör, alt modeller, öz-inceleme) bizde dxb-team2 artı Sol'un kör denetimi olarak zaten var. |
| pstack (poteto) | https://github.com/cursor/plugins/tree/main/pstack | V2 01:56 | cursor/plugins 11.367 yıldız; pstack/LICENSE MIT (Lauren Tan); push 2026-10-14 | Bir **Cursor** eklentisi (`/add-plugin`), varsayılan modeller "opus 5.5 / grok". Yöntem sınıfında. |
| unlazy | https://github.com/Leonxlnx/unlazy | V2 14:45 | 3.931 yıldız, MIT, push 2026-09-03 | Yöntem sınıfında. Çalıştırılabilir kabul defteri fikri #16'daki W101 "completion contract" ile zaten sırada. |
| Superpowers (yalnız anıldı) | https://github.com/obra/superpowers | V1 06:05 · V2 09:51 | 299.115 yıldız, MIT | Adıyla yasaklı (2026-08-27 emri), makineden kaldırıldı. |

## C. Yalnız anılanlar (kısa)

| Ad | Bağlantı | Video | Ölçülen | Hüküm |
|---|---|---|---|---|
| Remotion | https://github.com/remotion-dev/remotion | V1 01:03 · V2 11:28 | 64.095 yıldız; lisans NOASSERTION (şirketler için ücretli lisans modeli) | HyperFrames seçilirse yeri yok. |
| Firecrawl | https://github.com/firecrawl/firecrawl | V1 03:01 | 191.543 yıldız, AGPL-3.0 | İkizi Scrapling ve Agent-Reach kurulu; alma. |
| RTK | https://github.com/rtk-ai/rtk | V1 08:59 | 83.366 yıldız, Apache-2.0, "60-90 %" iddiası | Videonun aktardığı JetBrains testine göre tasarruf yok; o testi ben bulamadım. Caveman ile aynı sınıf; alma. |
| Context Mode | https://github.com/mksglu/context-mode | V1 09:36 | 28.996 yıldız, lisans NOASSERTION | Video, kullanımı yakan açık bir hata olduğunu söylüyor; doğrulamadım. Alma. |
| HubSpot "Claude at Work" rehberi | (sponsor bağlantısı) | V2 04:51 | Videonun sponsoru, bir e-posta toplama sayfası | Yeri yok. |

---

## D. En önemli beş (sırayla)

1. **Supabase Agent Skills** (`supabase-postgres-best-practices` + `supabase`): resmî, ücretsiz; #3 ve #4'teki
   veritabanı açıklarına doğrudan değiyor. İnşaatın migration koltuğuna, #3'ten önce. Öneri: **al**.
2. **HyperFrames**: GPU'suz, ücretsiz, makinede çalışıyor (Node 22, FFmpeg ve Chrome var); stüdyonun hareketli grafik
   ve açıklayıcı hattı. #45'te tezgâh pilotu. Öneri: **al**.
3. **Claude Security**: Anthropic'in resmî eklentisi; bulguları ikinci bir ajan doğruluyor. #4'te bir kez, #51'den
   önce bir kez taranır. Öneri: **dene**.
4. **Humanizer ve No AI Slop**: İngilizce kanal metni, satış e-postası ve site yazısı için. İkisi de #45'te onun
   emrettiği kör testte yarışır, kazanan kalır. Öneri: **dene**.
5. **Prompting playbook (X1)**: kurulacak bir şey yok. Hamza ve persona prompt'larındaki eski model yamalarını
   bulmanın ve "emir değil araç ver" ile üret-değerlendir-onar yapısının yöntemi; #11, #13 ve #16'ya girer. Gönderinin
   "sızdı" hikâyesi yanlış, konuşma Anthropic'in kanalında herkese açık.

İkinci sıradakiler: Playwright CLI (#16'da MCP'ye karşı ölçülür) ve CodeBurn (#37, salt-okur maliyet ölçümü).
**Ona tek satır:** claude-mem'in telemetrisi açık görünüyor (dokümanında "on by default", bizde karar verilmemiş);
kapatılsın mı?
