# İki video ve bir X gönderisi — okuyucu "fable" (Fable 5.1), 2026-10-14 gece

Okunan: `input/V1-HhZdNYI4pJs.txt` (232 satır, tamamı) ve `input/V2-LCwT00LrPZg.txt` (502 satır, tamamı); X gönderisi
`opencli twitter thread` ile; gönderideki video (33 dk 24 sn, 1280×720) yt-dlp ile indirilip yalnız sesi yerel
Speaches'e (faster-whisper-small) 10'ar dakikalık dört parça hâlinde yazdırıldı — kare izlenmedi, ekran görüntüsü
alınmadı. Her depo `gh api repos/O/R` ile ölçüldü (yıldız, son push, lisans), README'ler `gh api .../readme` ile
okundu. Kurulu olanlar `ls` + `claude plugin list` + `npm ls -g` + `which` ile ölçüldü. ORDER.md (56 sıra), MERGE.md,
STACK.md, INTEGRATION-TRACKER.md ve ilgili çalışma kartları okundu. Sayılar 2026-10-14 gecesinin ölçümüdür.

Kısaltma: "sıra N" = ORDER.md'deki sıra numarası. "V1 03:08" = birinci videonun o dakikası.

Önce üç ölçülmüş gerçek, sonra bloklar:
- **X gönderisindeki video sızıntı değil:** Anthropic'in kendi herkese açık konferans konuşması ("The prompting
  playbook", Code with Claude Londra, konuşmacı Margot Van Laar, Anthropic uygulamalı yapay zekâ mühendisi); aynı
  konuşma Claude'un YouTube kanalında (`G2B0YWuJUgI`, 33:49). Gönderinin "1,2 milyon dolar kazanan arkadaşım",
  "hiç çıkmaması gereken video" cümleleri satış sözüdür.
- **claude-mem'in telemetrisi bu makinede açık** (V1 09:41'in iddiası ölçüldü, doğru): kurulu 13.16.0'ın
  `worker-service.cjs` kodu `DO_NOT_TRACK` ya da `CLAUDE_MEM_TELEMETRY=0` yoksa ve ayarda `enabled:false` yoksa
  `{enabled:true, source:"default"}` döndürüyor (PostHog); ortamda iki değişken de yok, `~/.claude-mem/telemetry.json`
  `decidedAt:""`. Bir satırlık onayınızla kapatılır.
- **Kurulu olmayanlar:** `gws`, `playwright-cli`, `codeburn`, `rtk`, `hyperframes`, `humanizer` makinede yok
  (`which`/`npm ls -g` boş). Playwright MCP (`@playwright/mcp@0.0.79`) kurulu.

---

## V1 — "10 repo" (HhZdNYI4pJs)

### 1. HyperFrames
- **Ad:** HyperFrames (HeyGen) · **Bağlantı:** https://github.com/heygen-com/hyperframes · **Hangi video:** V1 00:26, V2 11:23
- **Ne bu:** HTML/CSS + medya + zamanlanabilir animasyonu yerelde deterministik MP4'e çeviren açık kaynak çatı; CLI ve
  21 ajan skill'i (`/hyperframes` yönlendirici + iş akışları) ile gelir; Node ≥ 22.
- **Gerçek mi:** 63.592 ★, son push 2026-10-14, Apache-2.0, 289 açık issue. README iddiası videoyla aynı; "sekiz
  dakikada havai fişek" (V2) ölçülmedi.
- **Elimizde var mı:** Kurulu değil; çalışma kartı var (`study-cards/heygen-hyperframes.md`, STUDY, "ikincil hat");
  stüdyo kararında seçili (OpenMontage birincil + HyperFrames ikincil).
- **Holdingte yeri:** Zaten MERGE/ORDER'da — sıra 45 (B43, "HyperFrames and long→short lanes"); W025/W071/W111
  bloklarında işlenmiş. Yeni satır gerekmez.
- **İnşaat ekibine:** Hayır (stüdyo aleti, B43'ün sırasında).
- **Getirisi:** İkisi: stüdyonun GPU beklemeden altyazı, başlık kartı, hareketli grafik üretmesi (makine); B28'e
  satılan 30 sn explainer (gelir, MERGE fikir 16).
- **Risk:** Hızlı değişen depo (sürüm sabitlenir); HeyGen'in bulut avatar/render kısmı paralı — yalnız yerel çekirdek.
- **Onay gerekir:** Kurulum (ücretsiz); bulut tarafı için para çıkışı — kullanılmaz.
- **Öneri:** al — ama sırasında (45); bugün ekleyecek yeni bilgi yok.

### 2. Google Workspace CLI (gws)
- **Ad:** Google Workspace CLI · **Bağlantı:** https://github.com/googleworkspace/cli · **Hangi video:** V1 01:31
- **Ne bu:** Drive, Gmail, Takvim, Docs, Sheets, Slides, Chat ve bütün Workspace API'leri için tek komut satırı aracı;
  komutlarını Google Discovery Service'ten çalışma anında kurar, JSON döner; 100+ SKILL.md (README'ye göre; video
  "40+" diyor) ve 50 tarif içerir. README: "resmî olarak desteklenen bir Google ürünü değildir" (Google'ın açık
  kaynak uyarısı; depo `googleworkspace` kuruluşunda).
- **Gerçek mi:** 31.497 ★, son push 2026-10-06, Apache-2.0, 135 issue; "v1.0'a kadar kırıcı değişiklik bekleyin".
  Kurulum `npm i -g @googleworkspace/cli`; OAuth için bir Google Cloud projesi şart.
- **Elimizde var mı:** Yok. Claude'un Google bağlayıcısı masaüstü uygulamasında var, bu makinenin oturumlarında
  ve holdingin ajanlarında yok. Tahtada B05 (Gmail send) ve sıra 24'ün posta kutusu (W-C42-4) bu eli bekliyor.
- **Holdingte yeri:** Sıra 24 (B64 adım 5 — Resepsiyon'un postası; "B05's Gmail-send third") ve sıra 52 (B05).
  Yeni satır gerekmez; sıra 24'ün "carries" hücresine "gws" yazılır.
- **İnşaat ekibine:** Evet, ama sıra 24'ün sırasında — lider koltuğuna; bugün değil.
- **Getirisi:** Makine: Hamza'nın/Resepsiyon'un e-posta okuyup yazması, haftalık raporun Sheets'e düşmesi, ajanın
  kendi eliyle takvim — hepsi tek CLI'dan, özel araç yazmadan. Gelir: B64 adım 5'in "ön büro hizmeti" (MERGE fikir 10)
  bu elle çalışır.
- **Risk:** OAuth jetonu bir sırdır — depoya ve çıktıya girmez (STACK: ham anahtar yok; jeton gateway'in kasasında);
  v1.0 öncesi API kırılması; para gitmez.
- **Onay gerekir:** Kimlik adımı — `dxbglobalcom@gmail.com` hesabında Google Cloud projesi ve OAuth onayı sizin
  elinizle; kurulum onayı.
- **Öneri:** al — sıra 24'te; ondan önce kurulup bekleyen alet tezgâh kuralına aykırı.

### 3. Apify MCP Server
- **Ad:** Apify MCP Server · **Bağlantı:** https://github.com/apify/apify-mcp-server · **Hangi video:** V1 02:16
- **Ne bu:** Apify Store'daki binlerce kazıyıcıyı (Instagram, TikTok, Amazon, Google Maps…) ajana MCP ile açar;
  bağlayıcı açık kaynak, kazıyıcılar Apify bulutunda çalışır ve sonuç başına ücretlidir; ayda 5 $ ücretsiz kredi
  (video); README'de ödeme jetonu "en az 5,00 $".
- **Gerçek mi:** 11.220 ★, son push 2026-10-14, MIT, 211 issue. Yaptığı iş gerçek; "bakery listesi birkaç dakikada"
  iddiası ölçülmedi.
- **Elimizde var mı:** Yok; çalışma kartı taslak (`study-cards/apify.md` STUB). Aynı işi Google Maps için Scrapling
  Apify'sız yapıyor (88-link W014 notu).
- **Holdingte yeri:** Zaten MERGE/ORDER'da — sıra 48 (Y9 müşteri bulma; W014 "Dene", W094 "Apify yeni bağımlılık").
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir: Y9'un niş-liste işi (Instagram'da sitesiz işletmeler gibi) Scrapling'in giremediği yerlerde.
- **Risk:** Sonuç başına para çıkışı; kişisel veri (KVKK — yalnız işletme verisi, MERGE §3 "out" listesi).
- **Onay gerekir:** Apify hesabı (kimlik) ve her ücretli kazıyıcı (para çıkışı).
- **Öneri:** dene — sıra 48'de, ücretsiz kredi içinde; önce Scrapling'in yetmediği gösterilir.

### 4. ScrollCraft
- **Ad:** ScrollCraft (scroll-craft) · **Bağlantı:** https://github.com/nateherkai/scroll-craft · **Hangi video:** V1 03:08 (videoyu yapan kişinin kendi deposu)
- **Ne bu:** Kaydırmayla sürülen premium site skill'i; motor + tasarım kuralları + kaydırmayı ekran görüntüsüyle
  denetleyen kontrolcü.
- **Gerçek mi:** 3.419 ★, son push 2026-09-30 (0.3.1), MIT, 9 issue.
- **Elimizde var mı:** Evet — `~/.claude/skills/scrollcraft` (2026-08-23 sürümü; kie.ai yerine yerel görsel eli
  bağlanmış). Upstream 0.3.1 farkı W078 olarak kayıtlı.
- **Holdingte yeri:** Zaten ORDER'da — sıra 42 (B42, "scrollcraft upstream 0.3.1 diff (W078)") ve sıra 47 (Y11 kendi
  sitemiz, "W078's upstream diff is the own site's first job").
- **İnşaat ekibine:** Zaten kurulu.
- **Getirisi:** Gelir: premium site teslimi (MERGE fikir 13, 20); makine: kendi sitemiz (Y11).
- **Risk:** Upstream farkı seçerek alınmazsa B40'ta kabul edilen derinlik işi bozulur.
- **Onay gerekir:** Yok.
- **Öneri:** zaten var — W078 işi sırasında.

### 5. Humanizer
- **Ad:** Humanizer · **Bağlantı:** https://github.com/blader/humanizer · **Hangi video:** V1 04:22
- **Ne bu:** Wikipedia editörlerinin "yapay zekâ izleri" rehberine dayanan yazı skill'i; "X değil Y", üçlü gruplar,
  abartı sözler gibi kalıpları ayıklar (SKILL.md 32 KB, 33 kalıp — çalışma kartı).
- **Gerçek mi:** 56.924 ★, son push 2026-09-28, MIT, 4 issue.
- **Elimizde var mı:** Kurulu değil; çalışma kartı var (`study-cards/humanizer.md`, STUDY, R4.1 2026-07-17: "onay
  kapısından ÖNCE, dış yazışma hattında zorunlu"). İkizi: No AI Slop (V2, blok 20).
- **Holdingte yeri:** Sıra 45 (B43 content-principles ayağı, W035 yazı kuralları, "through the blind test") ve sıra
  24'ün dış yazışması. Yeni satır gerekmez.
- **İnşaat ekibine:** Hayır (CEO'ya yazılan metin Türkçe ve kısa; skill İngilizce kalıplara göre).
- **Getirisi:** Gelir: müşteriye giden her metin (soğuk e-posta, site metni) insan elinden çıkmış gibi; makine:
  Resepsiyon'un yazdıklarında aynı.
- **Risk:** Kalıp listesi İngilizce — Türkçe metinde ölçülmemiş; iki yazı skill'i birden kurulmaz (bağlam yükü).
- **Onay gerekir:** Kurulum; önce SkillSpector/customs taraması (B41 zinciri).
- **Öneri:** dene — No AI Slop ile kör testte (aynı metin, iki yazar: biri skill'li biri skill'siz; sizin a47543aa
  kuralınız) ikisinden biri seçilir, B43'ün sırasında.

### 6. Addy Osmani — agent-skills
- **Ad:** Agent Skills (Addy Osmani) · **Bağlantı:** https://github.com/addyosmani/agent-skills · **Hangi video:** V1 05:23
- **Ne bu:** 25 mühendislik skill'i: `/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship` zinciri; spec'i
  dosyaya yazar, oturum dağılınca yeni oturum kaldığı yerden sürer; spec adımı kenar durumlarını (çifte rezervasyon,
  iade, saat dilimi) sorar.
- **Gerçek mi:** 106.633 ★, son push 2026-10-13, MIT, 118 issue. Yazarın "Anthropic'te Claude Code'da çalışıyor"
  sözü ölçülmedi (GitHub profili bakılmadı).
- **Elimizde var mı:** İkizi var: `.planning` (GSD durumu), dxb-team2 (plan → yaz → doğrula → Sol), dxb-verify.
  Tracker'da `vercel skills / agent-skills` kartı ayrı bir şey (Vercel'inki).
- **Holdingte yeri:** Sıra 40 (B41 zinciri — holdingin mühendis ajanlarının kütüphanesine MIT olarak girebilir) ve
  sıra 13'ün "kafa planı her parçanın aletini yazar" kuralı. Yeni satır gerekmez.
- **İnşaat ekibine:** Hayır — kapı zaten bu süreci taşıyor; ikinci süreç bağlam yükü ve çelişki getirir.
- **Getirisi:** Makine: holdingin kendi mühendis ajanları (B64 adım 2'den sonra iş yaparken) için hazır süreç.
- **Risk:** Oturumda iki süreç aynı anda; "spec" dosyaları planın tek kopyası kuralıyla çakışır.
- **Onay gerekir:** Kütüphaneye alırken kurulum.
- **Öneri:** izle — kütüphane adayı; inşaata değil.

### 7. Matt Pocock — skills
- **Ad:** Skills for Real Engineers (Matt Pocock) · **Bağlantı:** https://github.com/mattpocock/skills · **Hangi video:** V1 06:12, V2 10:05 (V2'nin "işletim sistemi" dediği, 4. sıra)
- **Ne bu:** Küçük, bileşik skill'ler; `skills/engineering` altında 19 tane: `code-review`, `tdd`, `to-spec`,
  `implement`, `diagnosing-bugs`, `domain-modeling`, `codebase-design`, `wayfinder`, `retro`… Yazarın sözü: süreci
  ele geçiren GSD/BMAD/Spec-Kit'in tersine denetim sende kalır.
- **Gerçek mi:** 291.045 ★, son push 2026-10-13, MIT, 177 issue. V2'nin kullanım biçimi (Fable orkestra, Sonnet
  yazar, dönmeden önce `code-review` ile kendi işini denetler) tam dxb-team2'nin lider/yardımcı/Sol şekli.
- **Elimizde var mı:** Yok; yerleşik `code-review` skill'i, Sol geçişi ve rakip-istihbarat 02'de "17 dev workflow
  skill" satırı var.
- **Holdingte yeri:** Sıra 40 (B41 kütüphanesi, mühendis ajanlar) ve inşaat. Yeni satır gerekmez.
- **İnşaat ekibine:** Evet, dar: yalnız `code-review` ve `diagnosing-bugs` (iki dosya), bir dxb-team2 işinde
  skill'li/skill'siz kör testle; 27 skill'in tamamı bağlamı şişirir.
- **Getirisi:** Makine: yardımcının kendi çıktısını lidere dönmeden denetlemesi — Sol'a giden hata sayısı düşer
  (ölçülecek).
- **Risk:** Üçüncü taraf skill ajan davranışını değiştirir — dosyalar kurulmadan okunur (SkillSpector kapısı).
- **Onay gerekir:** Kurulum.
- **Öneri:** dene — dar ve ölçerek.

### 8. Expo skills
- **Ad:** Expo Skills (resmî) · **Bağlantı:** https://github.com/expo/skills · **Hangi video:** V1 06:23
- **Ne bu:** Expo ekibinin mobil uygulama (iOS/Android, EAS, App Store kuralları) skill'leri; resmî eklenti pazarında.
- **Gerçek mi:** 2.850 ★, son push 2026-10-14, MIT, 87 issue; Expo'nun kendi deposu.
- **Elimizde var mı:** Yok; holdingde mobil uygulama satırı yok.
- **Holdingte yeri:** Sıra 50 (B17 gelir yapıları — MERGE fikir 22 "cami/Kur'an kursu mini-uygulamaları") olursa;
  bugün yeri yok.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir: ileride mobil ürün hattı; bugün sıfır.
- **Risk:** App Store için 99 $/yıl Apple hesabı (para çıkışı + kimlik).
- **Onay gerekir:** O gün gelirse Apple hesabı.
- **Öneri:** izle.

### 9. Supabase agent-skills
- **Ad:** Supabase Agent Skills (resmî) · **Bağlantı:** https://github.com/supabase/agent-skills · **Hangi video:** V1 07:04
- **Ne bu:** İki skill: `supabase-postgres-best-practices` ve `supabase` (RLS, şema, güvenlik kuralları; "kullanıcı
  yalnız kendi verisini görür"). `npx skills add supabase/agent-skills`.
- **Gerçek mi:** 2.827 ★, son push 2026-10-02, MIT, 518 açık issue (depo sorun takibi için de kullanılıyor; iki
  skill için yüksek — kurmadan önce dosyalar okunur).
- **Elimizde var mı:** Yok. Holding Supabase'i kendi barındırıyor; migration'lar elle yazılıyor (`db/migrations`).
- **Holdingte yeri:** Sıra 3 (B64 adım 1'in 4 migration'ı) ve sıra 4 (Y3 ikinci duvar: F-R1-3'ün 16 anon definer'ı,
  F-R1-5 public, pgboss/storage). Yeni satır gerekmez — sıra 4'ün "carries" hücresine yazılır.
- **İnşaat ekibine:** Evet — lider ve builder/helper-writer koltuğuna, sıra 3-4 başlarken; önce SkillSpector.
- **Getirisi:** Makine: ikinci duvarın RLS/definer işinde Supabase'in kendi kuralları elde; kör test: aynı
  migration iki yazar.
- **Risk:** Bulut Supabase'e göre yazılmış kurallar öz-barındırmada farklı olabilir; yalnız rehber, karar bizim.
- **Onay gerekir:** Kurulum (ücretsiz).
- **Öneri:** al — sıradaki iş tam bu (3-4), zamanı şimdi.

### 10. Stripe skills / eklentisi
- **Ad:** Stripe AI (skill + eklenti + uzak MCP) · **Bağlantı:** https://github.com/stripe/ai · **Hangi video:** V1 07:04 ("stripe best practices")
- **Ne bu:** Stripe'ın ajan SDK'ları, `claude plugin install stripe@claude-plugins-official`, OAuth'lu uzak MCP
  (`mcp.stripe.com`); skill'ler webhook imzası doğrulama gibi kuralları taşır.
- **Gerçek mi:** 1.940 ★, son push 2026-10-14, MIT, 100 issue; Stripe'ın kendi deposu.
- **Elimizde var mı:** Yok. B05 (Stripe, DocuSign, Gmail send) dondurulmuş, "sizin ileriki emriniz".
- **Holdingte yeri:** Sıra 52 (B05). Sıra 25'in fiyat politikası Stripe istemez.
- **İnşaat ekibine:** Hayır.
- **Getirisi:** Gelir: para GİRİŞİ (onay kapısı durdurmaz) — ama ürün satışı başlayınca.
- **Risk:** Stripe'ın finansman/faizli ürünleri (Capital) kullanılmaz; MCP gateway'de Stripe aleti onay kuyruğuna
  gider (STACK). V1'in "tüm eklentiyi değil yalnız skill'i kur" uyarısı makul.
- **Onay gerekir:** Stripe hesabı (kimlik), sözleşme.
- **Öneri:** izle — B05'in sırasında.

### 11. Playwright CLI (Microsoft)
- **Ad:** playwright-cli · **Bağlantı:** https://github.com/microsoft/playwright-cli · **Hangi video:** V1 07:52
- **Ne bu:** Playwright'ın komut satırı yüzü, skill'leriyle (`npm i -g @playwright/cli`, `playwright-cli install
  --skills`); README: MCP'nin aksine sayfayı modele dökmez, araç şemalarını yüklemez — token hafif; MCP'yi "kalıcı
  durum ve sayfa yapısı üstünde akıl yürüten döngüler" için bırakıyor.
- **Gerçek mi:** 14.177 ★, son push 2026-10-14, Apache-2.0, 2 issue; Microsoft'un deposu. "Daha hafif" iddiası
  bizde ölçülmedi.
- **Elimizde var mı:** CLI yok. Playwright MCP var (`@playwright/mcp@0.0.79`, ADOPT), `playwright` eklentisi kurulu
  ama kapalı, claude-in-chrome ve `operator` var.
- **Holdingte yeri:** Sıra 15 (B35 — "CLI-Anything as the deterministic hand": tarayıcı için deterministik el tam
  bu) ve sıra 16 (B64 adım 3'ün browser-verify döngüsü, W010). Yeni satır gerekmez.
- **İnşaat ekibine:** Evet — dxb-verify'ın "insan gözü ister" dediği tarayıcı kontrolleri için; bir gerçek kontrolde
  (tahta sayfası) MCP ile token sayısı yan yana ölçülür, kazanan kalır.
- **Getirisi:** Makine: ajanın kendi işini tıklayıp doğrulaması daha ucuz; "Claude 'çalışıyor' dedi ama tıklamadı"
  hatası azalır.
- **Risk:** Üç tarayıcı eli (MCP, Chrome eklentisi, CLI) aynı anda — biri seçilir; skill dosyaları kurulmadan okunur.
- **Onay gerekir:** Kurulum.
- **Öneri:** dene — ölçerek.

### 12. Claude Security eklentisi (Anthropic)
- **Ad:** claude-security (resmî eklenti, 0.12.0) · **Bağlantı:** https://github.com/anthropics/claude-plugins-official/tree/main/plugins/claude-security · **Hangi video:** V1 08:12
- **Ne bu:** Oturum içinde çalışan güvenlik taraması: mimariyi çıkarır, tehdit modeli kurar, her bileşeni tarar, her
  bulguyu ayrı ajan çürütmeye çalışır, hayatta kalanlar düz raporla gelir, yamaları ajan paneli doğrular, siz
  istediğinizde uygulanır. Kapsam (tüm depo / dal farkı / tek commit) ve efor kademesi seçilir. Opus 5.5 ya da
  Fable 5.1 önerir. V1'in anlattığıyla birebir.
- **Gerçek mi:** Pazar deposu 38.048 ★, son push 2026-10-14; eklentinin lisansı Anthropic'e ait ("All rights
  reserved" — Claude Code içinde kullanım; kütüphaneye kopyalanmaz, B27 emsali). Eski GitHub Action
  (`anthropics/claude-code-security-review`, 6.381 ★) 2026-02-11'den beri durmuş — bu değil, eklenti alınır.
- **Elimizde var mı:** Yerleşik `security-review` skill'i var (dal farkı için, hafif). Eklentinin pazar kopyası diskte
  (`~/.claude/plugins/marketplaces/claude-plugins-official/plugins/claude-security`), kurulu değil. Kardeşi
  `security-guidance` (her düzenlemede regex + her turda LLM diff incelemesi) sürekli token yer — şimdi değil.
- **Holdingte yeri:** Sıra 4 (Y3 ikinci duvar — bir tam tarama), sıra 32 (sunucuya çıkmadan), sıra 51 (anahtar
  çevrilmeden tüm depo). Yeni satır gerekmez; üç sıranın "carries" hücresine yazılır.
- **İnşaat ekibine:** Evet — lider koltuğuna, o sıralarda; bulgular dxb-team2 ile düzeltilir.
- **Getirisi:** Makine: F-R1 ailesinin (public şema, definer, sign-up) benzerlerini bizden önce bulur; gelir:
  müşteriye "verin sızmaz" sözünün kanıtı (B28).
- **Risk:** Tarama eforu abonelik kotasından token yer (kademe seçimi sizin); eklenti depoyu sizin izinlerinizle okur.
- **Onay gerekir:** Kurulum; tarama kademesi.
- **Öneri:** al — ücretsiz, Anthropic'in kendi aleti, üç sırada kullanılacak.

### 13. OpenSEO
- **Ad:** OpenSEO · **Bağlantı:** https://github.com/every-app/open-seo · **Hangi video:** V1 08:38
- **Ne bu:** Semrush/Ahrefs'in açık kaynak karşılığı (anahtar kelime, sıra, backlink, denetim; MCP + skill'ler);
  veri DataForSEO'dan, kullandığın kadar öde; "deneme kredisi küçük, veri kendin barındırmazsan onların sunucusunda".
- **Gerçek mi:** 23.603 ★, son push 2026-10-14, MIT, 212 issue.
- **Elimizde var mı:** Yok. Zaten MERGE/ORDER'da: sıra 14 (B41 satış dilimi), sıra 47 (kendi sitemiz), W097; X-21
  "DataForSEO 50 $ kendi siteden sonra".
- **Holdingte yeri / İnşaat / Getirisi / Risk / Onay:** MERGE'deki gibi; yeni bir şey yok.
- **Öneri:** zaten MERGE/ORDER'da.

### 14. CodeBurn
- **Ad:** CodeBurn · **Bağlantı:** https://github.com/getagentseal/codeburn · **Hangi video:** V1 09:30
- **Ne bu:** 37 aracın (Claude Code, Codex, Cursor…) yerel günlüklerinden token ve maliyeti model/proje/iş bazında
  çıkaran ücretsiz yerel araç (`npx codeburn`); israfı işaretler (her mesajda yüklenen ama kullanılmayan MCP sunucusu
  gibi); isteğe bağlı `guard` kancası (oturumda 5 $'da uyar, 15 $'da durdur); yerel MCP'si var. README "Telemetry":
  **CLI hiçbir şey göndermez**; masaüstü uygulaması gönderir (kapatılabilir). Node ≥ 22.
- **Gerçek mi:** 11.446 ★, son push 2026-10-14, MIT, 25 issue; model fiyatlarını LiteLLM listesinden günde bir çeker.
- **Elimizde var mı:** Yok. Şirketin maliyeti LiteLLM defterinde; inşaat oturumlarının (sizin aboneliğiniz) harcaması
  hiçbir yerde kırılımlı görülmüyor; bağlam ölçüsü dosyası ve B52 başlangıç bütçesi var, araç bazlı kırılım yok.
- **Holdingte yeri:** Şirkete değil; inşaata. Sıra 37 (B34, maliyet ölçümü) yanında bir ölçüm aracı. Yeni satır
  gerekmez.
- **İnşaat ekibine:** Evet — lider koltuğunda bir kez `npx codeburn` (salt okuma): hangi MCP her mesajda yükleniyor
  (claude-in-chrome, playwright, scrapling, claude-mem, context7, Claude Docs — altı sunucu), token nereye gidiyor.
- **Getirisi:** Makine: inşaatın faturası ölçülür, tahmin edilmez (CEO'nun "ölç, uydurma" kuralı).
- **Risk:** 1,9 GB oturum dökümünü okur (yerel); `share --pair` LAN özelliği açılmaz; masaüstü uygulaması kurulmaz.
- **Onay gerekir:** Çalıştırma (npx ile indirir — kurulum sayılır).
- **Öneri:** dene — tek koşu, rapor size.

### 15. RTK
- **Ad:** RTK (Rust Token Killer) · **Bağlantı:** https://github.com/rtk-ai/rtk · **Hangi video:** V1 09:01 (olumsuz: JetBrains testinde kazanç yok, düşük eforda daha pahalı)
- **Ne bu:** Komut çıktılarını kısaltan Rust vekil CLI; "%60-90 token" iddiası.
- **Gerçek mi:** 83.366 ★, son push 2026-10-14, Apache-2.0. V1'in JetBrains testi bizce ölçülmedi.
- **Elimizde var mı:** Yok. Bash'in önünde zaten kendi kapılarımız var (dxb-cost-gate, dxb-prompt-gate).
- **Holdingte yeri:** Yeri yok.
- **Öneri:** alma — kabukla oturum arasına ölçülmemiş bir katman.

### 16. claude-mem
- **Ad:** claude-mem · **Bağlantı:** https://github.com/thedotmack/claude-mem · **Hangi video:** V1 09:36 ("şimdilik bekleyin: varsayılan kullanım verisi gönderiyor")
- **Ne bu:** Oturumlar arası hafıza (yakalar, sıkıştırır, geri enjekte eder).
- **Gerçek mi:** 100.729 ★, son push 2026-10-13, Apache-2.0. **Telemetri iddiası ölçüldü, doğru** (üstteki bulgu).
- **Elimizde var mı:** Evet — 13.16.0, açık; STACK: "inşaatın oturum hafızası, holdingin değil".
- **Holdingte yeri:** Olduğu yerde (inşaat). Yeni satır gerekmez.
- **İnşaat ekibine:** Zaten var.
- **Risk:** PostHog'a kullanım verisi gidiyor (ne gittiği kodda okunmadı; iş metni mi, sayaç mı belirsiz —
  ölçülmedi).
- **Onay gerekir:** Kapatma için bir satırlık eviniz ("kapatmadan önce sor" kuralı): `CLAUDE_MEM_TELEMETRY=0`.
- **Öneri:** tut; telemetriyi onayınızla kapat.

### 17. Context Mode
- **Ad:** context-mode · **Bağlantı:** https://github.com/mksglu/context-mode · **Hangi video:** V1 09:43 ("açık hata kotayı yakıyor")
- **Ne bu:** Araç çıktısını sanal kutuya alıp bağlamı küçülten MCP + kanca katmanı, oturum hafızası.
- **Gerçek mi:** 28.993 ★, son push 2026-10-14, lisans NOASSERTION (standart dışı), 359 açık issue.
- **Elimizde var mı:** Yok; claude-mem aynı yerde duruyor.
- **Öneri:** alma — ikinci hafıza katmanı, belirsiz lisans, V1'in söylediği hata ölçülmedi ama gerek de yok.

### Geçerken anılanlar (V1)
- **Remotion** (V1 01:03, V2 11:28): zaten reddedilmiş — şirket lisansı; W071 ve video-editing-toolchain kararı.
- **Firecrawl** (V1 03:03): zaten W049'da; AGPL-3.0; Scrapling aynı işi görüyor.
- **Superpowers** (V1 06:05, V2 09:51; https://github.com/obra/superpowers, 299.109 ★, MIT): dxb-team2'nin ikizi;
  izle, kurma.

---

## V2 — "9 skill" (LCwT00LrPZg)

### 18. pstack ("Pistak" / "potato mode")
- **Ad:** pstack (Lauren Tan, @poteto) · **Bağlantı:** https://github.com/cursor/plugins/tree/main/pstack (asıl, Cursor için); Claude Code portu https://github.com/michael-denyer/pstack-claude · **Hangi video:** V2 02:12 (8. sıra)
- **Ne bu:** Cursor'da React compiler ekibinden Lauren Tan'ın her gün kullandığı skill yığını; `poteto-mode` hedefe
  göre iş akışını seçer; ilke: "önce bir ajanı titiz yap, sonra paralel koş"; çok modelli inceleme panelleri.
- **Gerçek mi:** Asıl depo `cursor/plugins` 11.368 ★ (pstack klasörü MIT, Lauren Tan); port `pstack-claude` 1.995 ★,
  MIT, son push 2026-10-14; `open-pstack` 415 ★. Video "Pistak/potato" diye söylüyor, ad pstack.
- **Elimizde var mı:** İkizi var: dxb-team2 (lider her parçayı doğrular), Kanun D (önce taslak), Sol geçişi (ikinci
  model paneli).
- **Holdingte yeri:** Yeri yok (kapı zaten bu disiplini taşıyor).
- **İnşaat ekibine:** Hayır — oturumda ikinci süreç.
- **Getirisi:** Fikir olarak: paralel yazar açmadan önce tek yazarın güvenilirliğini ölçmek — kapıda var.
- **Öneri:** izle — port depolarının playbook'ları ölçülmüş bir boşluk çıkarsa okunur.

### 19. Vibe Security skill
- **Ad:** vibe-security-skill (Chris Raroque / Aloa) · **Bağlantı:** https://github.com/raroque/vibe-security-skill · **Hangi video:** V2 04:00 (7. sıra)
- **Ne bu:** Projenin kullandığı teknolojiye göre (Supabase RLS, Next.js…) yüklenen güvenlik kural dosyaları; sabit
  anahtar, istemciden gelen fiyat, localStorage'da jeton gibi "vibe-coding" hataları.
- **Gerçek mi:** 1.122 ★, MIT, son push 2026-03-15 — yedi aydır durmuş; 2 issue.
- **Elimizde var mı:** Yok; aynı iş Claude Security (blok 12) + Supabase skill'inde (blok 9) daha diri.
- **Holdingte yeri:** Yeri yok.
- **Öneri:** alma — durmuş depo, üstü var.

### 20. No AI Slop
- **Ad:** No AI Slop (Peter Yang) · **Bağlantı:** https://github.com/petergyang/no-ai-slop · **Hangi video:** V2 06:33 (6. sıra)
- **Ne bu:** 20+ yapay zekâ yazı kalıbını kişinin sesini düzlemeden kaldıran skill; ne değiştirdiğini listeler
  (itiraz edilebilir). README 3 KB; PRIVACY/TERMS dosyaları var.
- **Gerçek mi:** 12.366 ★, son push 2026-09-02, MIT, 23 issue.
- **Elimizde var mı:** Yok; ikizi Humanizer (blok 5, kart var).
- **Holdingte yeri:** Sıra 45 (B43 content ayağı) — Humanizer'la aynı kör testte.
- **İnşaat ekibine:** Hayır.
- **Getirisi / Risk / Onay:** Blok 5 ile aynı; artı: değişiklik listesi onay kapısında işe yarar (onaylanan metin
  son metindir, kart kuralı).
- **Öneri:** dene — Humanizer'la kör test, biri kalır.

### 21. unlazy
- **Ad:** unlazy · **Bağlantı:** https://github.com/Leonxlnx/unlazy · **Hangi video:** V2 14:45 (listeye girmeyen dört skill'den ilki)
- **Ne bu:** "Kabul defteri önce yazılır, koşturulabilir kapılar, dönen iş yeniden doğrulanır, yalnız kanıtın
  desteklediği rapor edilir"; Depth Tree yöntemi (her yaprağa tam zaman bütçesi). Sürüm 2.1.0, etiketli release yok
  ("commit sabitleyin").
- **Gerçek mi:** 3.931 ★, son push 2026-09-03, MIT, 10 issue. Araştırma dayanağı README'de listelenmiş, okunmadı.
- **Elimizde var mı:** İkizi var: dxb-verify (kanıt önce "bitti"), W101 tamamlanma sözleşmesi (sıra 9 Y7, sıra 16).
- **Holdingte yeri:** Sıra 16'nın "completion contract (W101)" hücresi — desen olarak; yeni satır yok.
- **İnşaat ekibine:** Hayır (kapı var).
- **Öneri:** izle — "kabul defteri işten önce" cümlesi dxb-team2 planında zaten var; ölçülmüş boşluk yok.

### 22. AI Job Search
- **Ad:** AI Job Search (Mads Lorentzen) · **Bağlantı:** https://github.com/MadsLorentzen/ai-job-search (46.796 ★, MIT, 2026-10-08); benzeri career-ops 74.548 ★ · **Hangi video:** V2 15:24
- **Ne bu:** Kişisel iş arama çatısı: ilan değerlendir, CV uyarla, ön yazı, mülakat hazırlığı.
- **Elimizde var mı / Holdingte yeri:** Yok / yeri yok — holding iş aramıyor.
- **Öneri:** alma.

### 23. Open Design
- **Ad:** Open Design (nexu-io) · **Bağlantı:** https://github.com/nexu-io/open-design · **Hangi video:** V2 15:46
- **Ne bu:** Yerel, açık kaynak tasarım ajanı çalışma alanı; Claude Design'ın skill'le genişletilebilen karşılığı.
- **Gerçek mi:** 101.155 ★, son push 2026-10-14, Apache-2.0, 1.167 issue.
- **Elimizde var mı:** Evet — `open-design@open-design` eklentisi kurulu, kapalı; W040/W025'te işlenmiş.
- **Holdingte yeri:** Zaten MERGE/ORDER'da — sıra 21 (B32 çizim elleri: Open Design, Stitch).
- **Öneri:** zaten var.

### 24. autoresearch
- **Ad:** autoresearch (Karpathy) · **Bağlantı:** https://github.com/karpathy/autoresearch · **Hangi video:** V2 16:29 (1. sıra: "yüz küçük deney, işe yarayanı tut")
- **Ne bu:** Tek GPU'da nanochat eğitimini otomatik deneyen ajan; V2 yöntemini uygulamaya ve spor programına uyguluyor.
- **Gerçek mi:** 97.908 ★, son push 2026-03-26 (durmuş), lisans dosyası YOK (`license: null`), 195 issue.
- **Elimizde var mı:** Çalışma kartı var; sizin B1 hükmünüz (2026-07-09): genel döngü motoru önce, desen alınır kod
  alınmaz; tahtada C40 ("IS THE LOOP SYSTEM BUILT?").
- **Holdingte yeri:** Zaten ORDER'da — sıra 28 (C40: kilitli skora karşı sınırlı tut-daha-iyiyse döngüsü, kalite
  kapısının içinde asla).
- **Öneri:** zaten ORDER'da — V2'nin "her şeye uygula" sözü C40'ın genel motor tanımıyla aynı.

### 25. HubSpot "Claude at Work" rehberi
- **Ad:** HubSpot sponsor rehberi (PDF) · **Hangi video:** V2 05:35 (sponsor bölümü)
- **Ne bu:** Claude ürünlerinin haritası ve üç iş akışı; araç değil, sponsor içeriği. STACK HubSpot CRM'i dışlıyor.
- **Öneri:** yeri yok.

---

## X1 — RahulTechX gönderisi (2110166431610572865)

### 26. "The Prompting Playbook" konuşması (Anthropic)
- **Ad:** The prompting playbook — Margot Van Laar, Anthropic (Code with Claude, Londra) · **Bağlantı:** gönderi
  https://x.com/RahulTechX/status/2110166431610572865; aynı konuşma herkese açık: https://www.youtube.com/watch?v=G2B0YWuJUgI
  (Claude kanalı, 33:49) · **Hangi video:** X1 (00:01–33:24, ses dökümü)
- **Ne bu:** İki senaryo: (a) üretimdeki eski bir prompt'u yeni modele taşımak, (b) sıfırdan ajan kurmak. Ölçülen
  dersler: önce eval seti (kontrol vakası + hata türleri), sonra hijyen — siteden kopyalanmış metin, eski model
  yamaları, "sen bir insansın" cümlesi atılır; XML etiketleriyle yapı (rol / kılavuz / politika / ton); hata türleri
  tek tek izole edilir; modele veri verilince "halüsinasyonun tersi" (verilen veriyi yok sayma) ölçülür; "her zaman
  doğru hesapla" yerine hesap aracı verilir; çıktı biçimi açık yazılır; model+harness yan yana ölçülür (Sonnet 4.6 →
  Opus 4.7 → uyarlanabilir düşünme: 3× token ve gecikme) ; en ucuz çözüm üç küçük prompt'lu Üret-Değerlendir-Onar
  döngüsü (tek büyük prompt'tan az token, az gecikme; yumuşak kurallar çalışma anında değerlendirme prompt'una yazılır).
- **Gerçek mi:** Konuşma gerçek ve herkese açık; gönderinin "sızdı" ve "1,2 M $ arkadaş" sözleri gerçek değil. Hesap
  "Product Hunter | DM for collaboration" (269 beğeni). "Aşağıdaki makale" (X Article 2073973224455733248) açılamadı —
  `opencli twitter article` "Article not found", curl 404.
- **Elimizde var mı:** Repo yok. Yöntemin parçaları holdingde var: dxb-persona kalite kapısı, W101 tamamlanma
  sözleşmesi, B64 adım 3'ün "gerçek kontrol"ü, B34'ün maliyet ölçümü.
- **Holdingte yeri:** Sıra 11 (B64 adım 1 kalanı — Hamza'nın promptları), sıra 16 (B64 adım 3: Üret-Değerlendir-Onar
  tam "a card closes only when its checks pass"), sıra 37 (B34: model/seviye ölçümü). Yeni satır gerekmez; dxb-persona
  kapısına bir referans satırı yalnız sizin sözünüzle (kural kapısı).
- **İnşaat ekibine:** Kurulacak bir şey yok; persona yazan oturum konuşmanın XML yapı ve "ban listesi değil, veri ve
  araç ver" dersini uygular.
- **Getirisi:** Makine: 213 personanın prompt'ları ve Hamza'nın üç eli daha az token, daha az hata; gelir yok.
- **Risk:** Yok (ücretsiz, herkese açık). Gönderinin kendisi kaynak değil; YouTube kaynağı yazılır.
- **Onay gerekir:** Yok.
- **Öneri:** al — yöntem olarak, sıra 11 ve 16'da.

---

## Dışlananlar (sizin sözünüzle, değerlendirilmedi)
taste (taste-skill 1.0.0 — kurulu, kapalı) · impeccable (4.1.1 — kurulu, kapalı, iki kapsamda) · caveman (eklenti
kurulu, kapalı — "zaten var" doğru) · ponytail (makinede yok) · Agent-Reach (`~/.claude/skills/agent-reach` kurulu).

---

## Kapanış — en önemli beş, sırayla
1. **Claude Security eklentisi (Anthropic)** — ücretsiz, bizim F-R1 hatalarının ailesini bulur; sıra 4, 32 ve 51'de
   lider koltuğunda koşar. Al.
2. **Supabase agent-skills (resmî)** — sıradaki iş (sıra 3-4: migration'lar, ikinci duvar, RLS/definer) tam bunun
   alanı; builder/helper-writer'a, kör testle. Al, şimdi.
3. **Playwright CLI (Microsoft)** — B35'in deterministik tarayıcı eli ve dxb-verify'ın tıklayan gözü; MCP ile tek
   kontrolde token yan yana ölçülür, kazanan kalır. Dene.
4. **Google Workspace CLI** — sıra 24'te Resepsiyon'un postası ve Sheets raporu bu elle; kimlik adımı sizin (Google
   Cloud projesi + OAuth). Al, sırasında.
5. **Humanizer ↔ No AI Slop kör testi** — B43'ün içerik ayağında (sıra 45) biri kalır; müşteriye giden her metnin
   kapısı. Dene.

Bulgu (araç değil, karar): claude-mem bu makinede PostHog'a varsayılan açık telemetri gönderiyor — bir satır onayınızla
`CLAUDE_MEM_TELEMETRY=0`. Kalanı: Matt Pocock'un iki skill'i (dar deneme), CodeBurn (tek koşu), gws'nin ikizi yok;
HyperFrames, OpenSEO, ScrollCraft, Open Design, autoresearch, Apify zaten MERGE/ORDER'da — yeni satır gerekmez.
