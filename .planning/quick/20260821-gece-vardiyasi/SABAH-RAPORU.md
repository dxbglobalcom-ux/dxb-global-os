# SABAH RAPORU — 21 Ağustos 2026, gece vardiyası

> Muhittin Bey uyurken çalışıldı, kendi emriyle: *"istersen ben uyurken sen üzerinde çalış…
> bi md raporu hazırla… yarın sabah ya sana ya da yeni opus 5'e okuturum onu."*
> Yazar: Opus 5 · 01:00–01:40 · Her rakam bu gece bu makinede ölçüldü.

---

## ⚠ ÖNCE BUNU OKUYUN — CEO'nun kararı gereken tek şey

**Bu makinede TEK bir veritabanı var ve içinde şirketin kendi verisi duruyor. Adı `dxb_test`.**

Ölçüm:

| Ne | Sonuç |
|---|---|
| Makinedeki Postgres sayısı | **1** (Supabase kapsayıcısı, port 54322) |
| İçindeki veritabanları | `dxb_test` · `_supabase` — **`dxb` diye bir veritabanı YOK** |
| `dxb_test` ne içeriyor | **205 ajan · 217 görev · 51 onay · 94 tablo** — tahtadaki şirket rakamlarının aynısı |
| Test bataryası nereye yazıyor | **Aynı veritabanına** (`…:54322/dxb_test`) |

**Neden önemli:** `CLAUDE.md`'nin kanunu şöyle diyor —
*"Test bataryası `dxb_test`'e, yani bir klona yazar. Şirket veritabanı inşaat işiyle asla yazılmaz."*
**Bu makinede o ayrım yok.** Tek veritabanı var, batarya ona yazıyor. Bu gece bataryayı altı kez
çalıştırdım ve her seferinde o veritabanına yazıldı (bataryanın kendi kapanış mesajı bunu itiraf
ediyor: *"swept 1 stale hook-conflict alert(s)"*).

**Bu, C47 hastalığının aynısı** — inşaat trafiğinin şirkete ulaşması.

**Kendim düzeltmedim, çünkü sizin kararınız:** şirket veritabanının bu makinede nasıl duracağı,
17 Ağustos taşıma satırının (B29) konusu ve sizin hükmünüzü ister. **Sabah üç seçeneğiniz var:**

1. Gerçek şirket veritabanını `dxb` adıyla ayrı kur, `dxb_test` gerçekten klon olsun
2. Bu makineyi bilerek "sadece inşaat" makinesi say, şirket verisi burada durmasın
3. Olduğu gibi bırak ve kanunu bu gerçeğe göre düzelt

---

## Gecenin işi: **22 düşen test → 0**

Batarya sabah **710 test, 95 dosya, sıfır hata** ile kapandı. `tsc` 0 hata.

Ama asıl mesele şu: **22 hatanın hiçbiri "test hatası" değildi. Üçü makinenin gerçek kusuruydu.**

### ① Yayın tablosunun bölmesi bitmişti — 16 test bir anda düştü

`realtime.messages` tablosu **günlere bölünmüş**. Supabase'in kendi servisi bu bölmeleri önceden
açar; bu makinede **açmayı bırakmış**.

| | |
|---|---|
| En yeni bölme | `messages_2026_08_18` |
| Veritabanının saati | `2026-08-20` |
| Sonuç | **İki gündür yazılan her yayın hiçbir yere düşmüyor** |

O yüzden yedi ayrı alt sistemin (e8, e10, c5, c9, e125, r13, r42) testleri aynı anda düştü —
hepsi `realtime.messages`'a bakıyor ve boş buluyordu. **Yedi bozuk sistem gibi görünüyordu, tek
eksik tabloydu.**

**Yapılan:** eksik bölmeler açıldı (dünden +14 güne). Ve kalıcı çözüm: **batarya artık koşmadan
önce kendi bölmesini kendisi açıyor** (`tests/global-teardown.ts`). Yoksa 14 gün sonra aynı 16
test yine düşerdi.

**Kanıt, iddia değil:** `messages_2026_08_22` elle silindi → batarya çalıştırıldı → bölme geri geldi.

### ② Donma koruması bu makineye hiç kurulmamış

`dxb-freeze-guard.service` eski dizüstünde **elle** yazılmış ve depoya hiç girmemiş — dolayısıyla
taşımada gelmemiş. **Bu makine 17 Ağustos 18:04'te sert donmuştu ve o günden beri korumasız.**

**Yapılan:** unit dosyası depoya yazıldı (`scripts/systemd/dxb-freeze-guard.service`), kuruldu ve
çalıştırıldı — **etkin, 0 yeniden başlatma, 10 saniyede bir süpürüyor.**

*Tuzak:* deponun yolunda boşluk var (`DxB Global OS`), systemd yolu kelimelere böldüğü için
`203/EXEC` veriyordu. `ExecStart` tırnak içine alındı.

### ③ Koruma kör çalışıyordu — içinde eski makinenin kullanıcı adı gömülüydü

Betiğin varsayılan günlük yolu **`/home/ghost`** diyordu — X230'un kullanıcısı. Bu makinede öyle
bir klasör yok, yani koruma **etkin görünüyor, süpürüyor, ama tek satır yazamıyor**.

Bu, voicebox'ta yakalanan kusurun aynısı (B29: *"her komutuna `/home/ghost` gömülmüş"*).

**Yapılan:** betik artık kendi kökünü kendi yolundan türetiyor, kullanıcı adı anmıyor.
Günlük yazıyor: `[2026-08-21 01:24:21] freeze-guard resident: pass every 10s`.

### ④ En sinsisi: koruma, sahipsiz yardımcıyı GÖREMİYORDU

Koruma, "oturumu ölmüş yardımcı"yı `ppid == 1` ile tanıyordu. **Ama bu makinede yetim süreçler
`1`'e değil, `systemd --user`'a bağlanıyor** (kullanıcı yöneticisi kendini "sahiplenici" olarak
kaydediyor).

**Ölçüm:** bilerek yetim bırakılan bir yardımcı `ppid 2477` ile geri geldi — kullanıcı yöneticisi.
Yani **bu makine hiçbir sahipsiz yardımcıyı süpürmemiş.** Korumanın var oluş sebebi tam olarak
buydu (2026-07-29'da dört tam yardımcı yığını birikmişti).

**Yapılan:** kural artık `1` VEYA kullanıcı yöneticisi kabul ediyor.
**İlk gerçek geçişte üç tane birikmiş sahipsiz yardımcı buldu.**

### ⑤ Posta kum havuzu çalışmıyordu

`mailpit` imajı makinede duruyordu ama kapsayıcı hiç açılmamıştı. Dış posta zincirinin testi bu
yüzden düşüyordu. **Yapılan:** `dxb_mailpit` açıldı (127.0.0.1:1025 / :8025, `--restart unless-stopped`).

### İki test kusuru — ürün değil, testin çevre körlüğü

- **`oom_score_adj` miras alınır.** Editörün terminalinden başlatılan bir koşu **100** miras alıyor
  (ölçüldü). Test "dokunulmamış = 0" diyordu; artık "dokunulmamış = miras alınan değer" diyor.
  Sözleşme aynı: *koruma üstüne hiçbir şey eklemez.*
- **Koruma yalnızca iş yaptığında yazar.** Makine temizken hiç dosya oluşmuyor; test dosyanın
  varlığını varsayıyordu. Artık dosya yoksa boş sayıyor.

---

## Bu gecenin öncesinde yapılanlar (sizin oturumunuzdan)

| Ne | Durum |
|---|---|
| Tezgâh mimarisi (B33) | ✅ Onayınızla tahtaya yazıldı, onay defterinde 31. kayıt |
| Operatör (fare/klavye/göz) | ✅ Depoda + kapısı yazıldı (`dxb-operator`) |
| "Asla HAYIR kabul etmem" kanunu | ✅ `prompt-core.ts`'e — 205 ajanın hepsine tek yerden |
| Üç yerel model | ✅ İndi, bayt bayt doğrulandı, ikisi ölçüldü |
| OpenMontage | ✅ Bellekten diske taşındı, testleri geçti |
| Ses/işçi satırı ayrımı | ✅ İki ayrı satır |

---

## Sabah sizi bekleyenler

| # | Ne | Kimde |
|---|---|---|
| 1 | **Şirket veritabanı meselesi** (yukarıdaki ⚠) | **CEO** |
| 2 | Tezgâhın beş parçası — hiçbiri kurulmadı | Yazar, sırası gelince |
| 3 | Operatörün ajanlara ulaştırılması (B35, 3. ve 4. teslimat) | Yazar |
| 4 | Sesin karta taşınması — 2,73 sn → 1,3 sn (B12) | Yazar |

## Makinenin sabahki hali

| | |
|---|---|
| Test | **710 geçti · 0 düştü · 95/95 dosya** |
| `tsc` | **0 hata** |
| Bu oturumun commit'i | **14** · çalışma alanı temiz |
| Donma koruması | **etkin**, 0 yeniden başlatma |
| Kart | 13.462 MB dolu (LM Studio'da Qwen yüklü), 2.386 MB boş |
| Disk | 151 GB kullanılıyor, **1,6 TB boş** |
| Bellek | 30 GB'ın 10'u kullanımda |

⚠ **Gözle doğrulanmamış:** LM Studio'nun model listesi bu gece elle onarıldı ve üç model de
göründü (ekran görüntüsüyle doğrulandı, 00:23). Sonrasında uygulamaya dokunulmadı.
