# B43 — THE NIGHT CONTENT ENGINE · PLAN

**Status: PLAN — written 2026-09-24 on the CEO's order; NOTHING IS BUILT; it waits for his eye.** <!-- OPEN: B43 -->
Written by the session dxb-e4 (Opus 5.5). Committed by the construction session (dxb-global-os-13) in `ddc5aada` on his word ("gerekirse commiti o atsın").
His order, in his words (2026-09-24): *"https://www.youtube.com/watch?v=vUjAgGa8tAU buradaki 00:42 ile 2.5 dakkaya kadar olan kısmı izlesin burada bir sistem var uzakdoğu bir adam anlatıor sistemi. onu biizm dxb global os holding projesi için hazıryalabilir miyiz bu özellikte olsun. planı projesi yazılsın hazırlansın tahtaya ilgili satırın altına konulabilir. 147dk sürmüş opus 5.5 ile yapıor zaten."*
And his correction the same hour: *"rakiple alakası yok bunun ya orada bir sistemden bahsedior. onu istiorm holdinge olay bu"* · *"instagram okuma aracı da tahtaya yazılmıştı"*. **This is a SYSTEM TO BUILD for the holding, not a source on the rival queue: no rival-intel row, no rival report.** The Instagram reading hand is B48's, already accepted by his eye; this plan uses it and does not re-open it.
Row it belongs to: **B43** (the Media Studio — the engine's output is what the studio films). Its screen may not be drawn before **B32** approves the drawing.
Body in Turkish because he reads it (precedent: B47's PLAN.md).

---

# GECE ÇALIŞAN İÇERİK MOTORU — PLAN

## İki cümle (tahta kuralı 7)

1. **Ekranınızda ne olacak:** Her sabah siz uyanmadan, seçtiğiniz alandaki hesapların son videoları tek sayfada okunmuş olarak durur: kim ne paylaşmış, hangi açılış cümlesi tutmuş, hangi konu izlenme çekmiş, hangi video kendi ortalamasının kaç katına çıkmış ve neden. Birine tıkladığınızda videoyu, söylenenlerin yazısını, sahne sahne kuruluşunu ve rakamlarını görürsünüz. Sayfanın sonunda stüdyomuzun bu hafta çekeceği video için hazır bir senaryo durur; evet ya da hayır dersiniz.
2. **Bunu kanıtlayan tek komut:** `node scripts/content-engine/proof.mjs --today` Şunu basar: "N hesap · M yeni video · M'nin M'si yazıya döküldü ve puanlandı · sayfa bugün SS:DD'de yenilendi · bugünkü dış maliyet $X". Yalnız bu sabahki tur gerçekten koştuysa ve her yeni videonun yazısı, puanı ve kaynak adresi varsa 0 ile çıkar. Bu cetvel Faz 1'de, işten önce yazılır.

## Videodaki sistem — 00:42–02:30

Anlatan kişi Jacob Lee. Sistemi Dubibubi kanalının 23 Eylül 2026 tarihli videosunda gösteriliyor. Videonun geri kalanında aynı sistem Opus 5.5'e ve GPT-6 Astra'ya sıfırdan yaptırılıyor. Etiketler: **T** = videoda söylenen (zaman damgalı) · **V** = videoda görülen · **C** = sizin söylediğiniz.

- **Ne yapıyor:** Sahibi uyurken çalışıyor. Her sabah pano, alandaki hesapların son reels videolarıyla kendini yeniden kuruyor: kim paylaşıyor, hangi açılış cümleleri (hook) kullanılıyor, hangi konular erişim çekiyor. Herhangi bir videoya tıklayınca açılış tarzı, senaryonun her vuruşu, kapanış çağrısı (CTA) ve gerçek rakamlar geliyor. Sahibinin sözü: "Neyin tuttuğunu artık tahmin etmiyorum, fişleri okuyorum." (T 01:00–01:25)
- **Hattı, beş adım:** videolar çekilir → yazıya dökülür → her biri alana uygunluk için puanlanır → videoda adı geçen araçlar araştırılır → pano yeniden kurulur (T 01:25–01:36).
- **Hattın ekrandaki şeması** (V ~01:20–01:35): elle ya da zamanla başlatılan tur → videolar çekilir → aynısı ayıklanır → indirilir → yazıya dökülür → Claude her videoyu puanlar ve yazıyı "açılış / vuruşlar" diye böler → **kapı: puan 7 ve üstü mü?** 7'nin altındakiler deftere "atlandı" diye yazılır ve araştırılmaz. 7 ve üstü araştırılır, Claude her biri için bir not yazar, not panoya eklenir. Bu kapı sayesinde ücretli araştırma yalnız işe yarayan videoya harcanır. Panonun üç sekmesi var: Pano · Tüm videolar · Hat. Hat sekmesinde iş hangi düğümdeyse o düğüm yanıyor.
- **Maliyeti ve kazancı:** Ayda yaklaşık 5 dolar. Haftada 3 saatlik kaydırma yerine 3 dakikalık okuma (T 01:36–01:42).
- **Opus 5.5'in aynı istekle kurduğu sürüm** (T 04:55–08:20):
  - 18 hesaptan 435 video; 150'si çözümlenmiş; 30 günde 35 "patlayan" video.
  - Her video için: neden patladığı, yazısı, altyazısı, izleyici yorum örnekleri, kime yapıldığı, aynı konuyu yapan diğer hesaplar ve kendi ortalamasının kaç katı izlendiği (örnek: 304.000 izlenme, hesabın tipik 19.000'ine karşı 17 kat, güven derecesi 3).
  - 90 günlük tablo: en uç videolar, patlama puanı, hesaba göre kat sayısı (479 kat), açılış gücü sırası.
  - Senaryo üretici: açılış 8/10, izlenme süresi 9/10, açıklık 9/10, özgünlük ve "kazanan kalıba uyum" puanları, A/B için yedek açılışlar.
- **Sunucunun kendi söylediği zayıf yer:** İki modelin de senaryosu iyi değil. Sunucunun tahmini: "Elinde fazla veri var, tutarlı bir senaryoya çeviremiyor" (T 07:57–08:20, 10:52–11:15). Bu plan bunu Faz 5'te ayrıca çözüyor.
- **Opus 5.5 aynı sistemi 1 saat 24 dakikada kurdu:** 118,5 milyon token, API karşılığı 40,20 dolar; Astra 1 saat 27 dakika, yaklaşık 43,61 dolar (V 11:38, videodaki ölçüm panosu). Sizin "147" dediğiniz sayı 03:40'ta ekranda "147.7M TOKENS LATER" diye geçiyor (V). Yani dakika değil, iki modelin birlikte harcadığı token; ikisinin toplam süresi 2 saat 52 dakika, toplam maliyeti 83,81 dolar. Bizde de aynı model (Opus 5.5) kuracak.

## Parçaların bugün DxB'de nerede olduğu — ÖLÇÜLDÜ 2026-09-24, bu oturumda

| Adım | Videoda | DxB'de bugün | Durum | Yapılacak |
|---|---|---|---|---|
| 1. Çekme | Apify (ücretli) | **Instagram okuma aracı: B48** (tarayıcı köprüsü, 21 Eylül'de gözünüzle kabul). Tek videoyu indirmeyi yt-dlp zaten yapıyor. | Tahtada, kabul edilmiş | Hesap başına "son videolar + izlenme sayıları" listesini her gün almak |
| 2. Yazıya dökme | Scribe (ücretli) | Kendi makinemizdeki Speaches. Ses dışarı çıkmıyor, $0. | `curl localhost:8969/health` → **200** | Bağlantı kodu |
| 3. Puanlama | Claude | LiteLLM model kapısı. Toplu iş için B34'ün yerel işçi modeli, pahalı iş için B51'in model düzeni. | `dxb_litellm` → **healthy** | Alan tanımı, puan ölçütleri |
| 4. Araştırma | Perplexity (ücretli) | dxb-research filosu: 39 kanal, dış maliyet $0. | Çalışıyor | Bağlantı kodu |
| 5. Her sabah yeniden kurma | zamanlayıcı | Tek yerleşik işlem `dxb-scheduler.service`. Yeni servis açılmaz, tur buraya eklenir. | `systemctl --user is-active` → **active** | Günlük iş kaydı |
| Veri | — | Hesap, video ve çözümleme tablosu yok. | `db/migrations` araması → **0 dosya** | Göç (migration) |
| Ekran | pano | `apps/dashboard`. Stüdyonun ekranı B43'te; çizimi B32'de onaylanmadan çizilmez. | — | Önce çizim onayı |

**Sonuç:** Beş adımın dördü bugün evde. Çekme aracı B48, yazıya dökme, araştırma ve zamanlama hazır ve dış maliyeti $0. Yazılacak olan, bunları birbirine bağlayan tur, veriyi tutacak tablolar, senaryo adımı ve ekran.

## Fazlar — her biri önce/sonra ölçülü, kabul maddesi işten önce yazılır

| # | Faz | Ne yapılır | Kabul maddesi (komut → beklenen) | Kimin sözü |
|---|---|---|---|---|
| 0 | **Alan ve hesap listesi** | Hangi alanı ve hangi hesapları okuyacağımızı siz seçersiniz (öneri aşağıda). B48'in aracı seçilen üç hesabın son 12 videosunu adres ve izlenme sayısıyla okur. | `scripts/content-engine/probe.sh 3` → 3 hesap × ≥10 video adresi + izlenme sayısı | **Sizin** (liste) · yazar |
| 1 | **Cetvel + veri** | Önce `proof.mjs` cetveli yazılır. Sonra hesap, video, günlük rakam ve çözümleme tabloları kanonik göç zincirinden eklenir. Testler yalnız inşaat motorunda (54422) koşar. | `pnpm test tests/content-engine` yeşil; `proof.mjs --today` boş günde "0 yeni video" basar ve 1 ile çıkar | Yazar |
| 2 | **Çekme + yazıya dökme** | Günlük tur yerleşik zamanlayıcıya, sabah 06:00'ya eklenir. Yeni videoların yalnız sesi indirilir, Speaches'te yazıya dökülür. Tur yarıda kesilirse yalnız eksik olanı yapar. | Aynı tur iki kez koşunca ikincisi 0 yeni iş üretir; yazısız video 0 | Yazar |
| 3 | **Puanlama ve kırılım** | Her video için açılış tarzı, vuruşlar, kapanış çağrısı, konu, alana uygunluk ve "hesabın kendi 90 günlük ortancasının kaç katı" hesaplanır. **Videodaki kapı aynen alınır:** 7/10 altı video deftere "atlandı" diye yazılır, araştırmaya gitmez. **Az örnek kuralı:** Astra'nın 2 videodan "9,3 kat" çıkardığı hata (T 10:05–10:25) bizde olmasın diye bir kalıp en az 5 videoya dayanmadan "tutan kalıp" sayılmaz. Video başına maliyet ilk 50 videoda ölçülür. | 50 videoda her alan dolu; kat sayısı elle hesaplanan 5 örnekle birebir; ölçülen $/video basılır | Yazar |
| 4 | **Araştırma** | Kapıdan geçen videolarda adı geçen araç ve ürünler dxb-research'ün hızlı katmanıyla araştırılır; kaynaklı not videoya bağlanır. | Kapıdan geçen ve adı geçen aracı olan her videoda ≥1 kaynaklı not; kapıda kalan video için 0 araştırma çağrısı | Yazar |
| 5 | **Senaryo** | Haftada bir tek senaryo çıkar. Ham verinin tamamından değil, en uç 3–5 videodan beslenir; iki modelin de düştüğü yer burasıydı. Senaryo stüdyonun kendi sırasına girer (senaryo → sahneler → çekimler), altı ölçütle puanlanır, yedek açılışlarla gelir. Siz "evet" derseniz stüdyonun iş kuyruğuna düşer. | Senaryo beslendiği videoları adres adres gösterir; "evet"le B43 kuyruğuna geçer | **Sizin** (her senaryo) |
| 6 | **Ekran** | B32'de çizimini onayladığınız sayfa B43'ün odası olarak kurulur. Canlıdır: sabah turu koşarken iş hattın düğümlerinde ekranda akar, o anda çalışan düğüm yanar, tur bitince durur (videodaki "Hat" sekmesinin bizdeki karşılığı; V ~01:20–01:35). Tur zamanla başlar, isterseniz elle de başlatılır. Makine en son ne zaman bildiğini ve ne zaman uyanacağını yazar. | Sizin kabul testiniz: sayfayı açarsınız, hiçbir şeye dokunmazsınız, sabah turunun yaptığı iş görünür | **Sizin** (çizim ve göz) |

## Sizin kararınız gereken iki şey

1. **Hangi alan, hangi hesaplar?** Motor, hangi alandaki videoları okuyacağını bilmeden başlayamaz. Öneri: stüdyonun iş yaptığı alan (AI reklam ve kısa video üretimi) ile OUTLETEURO'nun alanı. Başlangıçta en çok 20 hesap.
2. **Senaryo nereye gitsin?** Yalnız size mi gelsin, yoksa sizin "evet"inizle doğrudan stüdyo kuyruğuna mı düşsün?

## Bu planın asla yapmadıkları

- **Hiçbir şey paylaşmaz, yorum yapmaz, beğenmez.** Yalnız okur.
- **Bahis içerikli hesap okunmaz, bahis senaryosu üretilmez.** B28'deki mutlak çizginiz bu motora da aynen bağlıdır.
- **Yeni servis, yeni kuyruk ya da ücretli araç eklemez.** Ücretli bir yol gerekirse fiyatıyla size gelir.
- **"Proje panosu" gibi bir ekran çıkmaz.** Ekran B43'ün canlı odasıdır; çizimi onaylanmadan tek satır ekran kodu yazılmaz (B32).

## Maliyet

Videodaki iddia ayda yaklaşık 5 dolar (T 01:36). Bizde yazıya dökme, araştırma ve zamanlama $0; hepsi yerel ya da anahtarsız (ölçüldü). Puanlamanın maliyeti ölçülmeden söylenmez: Faz 3'ün ilk 50 videosunda ölçülür ve buraya yazılır.

## Sıra

Siz bu planı görüp "yap" demeden kimse bir şey yapmaz. Onaydan sonra fazlar dxb-crew düzeniyle koşar: baş mühendis ölçer, kodu builder yazar, refuter çürütmeye çalışır, her faz tek commit.
