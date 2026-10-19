# SYSTEM_ARCHITECTURE — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 1 · Yazar: Fable 5 bizzat · Üst: [[MASTER_PLAN]] · Kardeşler: [[DATA_MODEL]], [[EVENT_MODEL]] (D4), [[API_CONTRACTS]] (D4)
> §14 şablonu: 27 başlık tam. Mevcut-varlık eşlemesi her bölümde KALIR/DEĞİŞİR/YENİ etiketiyle.

## 1. Amaç

Holding OS'un tüm katmanlarının — çekirdek yürütme (kernel/kuyruk/ajanlar), kontrol düzlemi (settings/org/HR), görünürlük düzlemi (observability/audit/cost) ve sunum düzlemi (Executive Command Center) — tek tutarlı mimaride tanımı. Hedef: CEO'nun "her detayı gör + her detayı değiştir" hükmünü (Total Control) mevcut çalışan çekirdeği bozmadan taşıyan mimari.

## 2. Gereksinimler

- R1. The holding's running flow is never broken while it is rebuilt. What runs today is the July chain
  (intent → kernel → task → agent → approval → outbox); B64's flow replaces it step by step — his goal → Hamza's brief →
  the owner (the head of the department that takes the job) → specialists → the check → delivery, with his approval gate
  and the outbox at the outward end (B64 decision 1, AGENT_ORCHESTRATION_SPEC).
  <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 --> <!-- OPEN: B64 -->
- R2. Her çalışan varlık (şirket/departman/müdür/çalışan/ajan) DB'de birinci-sınıf kayıttır; UI saf projeksiyondur (şema-önce ilkesi, roadmap kararıyla uyumlu).
- R3. CEO'nun her ayar değişikliği tek yazım seamı üzerinden geçer (SECURITY DEFINER fonksiyon deseni — migration 0015 emsali) ve audit'e düşer.
- R4. Canlılık: UI güncellemeleri Supabase Realtime **Broadcast** ile (postgres_changes YASAK — STACK.md sert kuralı).
- R5. Yeni yetenekler öncelikle **kütüphane + tablo + view** olarak eklenir, yeni resident servis
  olarak DEĞİL. **KAYITLI UYARLAMA — B39, 2026-08-25: bu maddenin GEREKÇESİ ölçümle değişti,
  DİSİPLİNİ aynı kaldı.** Madde 2026-07 boyunca *"8GB VPS RAM bütçesi aşılmaz"* diye yazıyordu ve
  bu cümle, hiç sorulmamış bir soruya — "aynı anda kaç iş yürüsün?" — cevap vermiş gibi kullanıldı.

  **ÖLÇÜM** (`scripts/bench/drain-throughput.mjs`, inşaat motoru, gerçek departman + gerçek kadro
  + gerçek proje, kalite kapıları AÇIK, dedektör önce kırmızıda kanıtlanmış):

  | hat | 16 iş | iş/saat | hattın kendi maliyeti | çifte üstlenme | kilit beklemesi |
  |---|---|---|---|---|---|
  | 1 | 97,4 sn | 591 | 87 ms | 0 | 0 |
  | 2 | 48,8 sn | 1.179 | 110 ms | 0 | 0 |
  | 4 | 24,6 sn | 2.343 | 156 ms | 0 | 0 |
  | 8 | **12,4 sn** | **4.655** | 169 ms | 0 | 0 |

  **8 hat = 7,88 kat hızlanma (kusursuzun %98,5'i).** Ve hattın kendi maliyeti **iş uzadıkça
  büyümüyor**: 30 sn'lik turda 144 ms, 60 sn'likte 170 ms, 120 sn'likte 156 ms — tur süresi dört
  katına çıkarken sabit kaldı. RAM, eşzamanlılığın önündeki engel hiç olmamıştı.

  ⚠ **ÖLÇÜMÜN OKUNMASINDA BİR TUZAK VAR ve ilk okuyuş buna düştü.** Sahte bir çıktı kalite
  kapısını **asla** geçemez (A4), bu yüzden ölçümde her iş `orchestration.max_revision_rounds`
  kadar tekrarlanır — **iş başına 3,00 model turu**, yani şirketin EN KÖTÜ hâli. Gerçek şirkette
  ölçüldü (2026-08-25, şirket veri tabanı): 217 görev, 370 çalışma → **iş başına 1,71**, ve
  **154 görev (%71) ilk seferde geçmiş.** Aradaki farkı "hattın ek yükü" diye okumak ölçüm
  aracının kendi kusuruydu; araç artık model turlarını sayıyor ve ikisini ayrı raporluyor.

  **Mevcut bir servisin İÇİNDE eşzamanlılığı yükseltmek yeni servis açmak değildir.** Hat sayısı
  CEO'ya bırakılmış bir düğme de değildir (onun kendi hükmü, 2026-08-25: *"ben ayar mayar anlamam
  ki"*): mevcut zamanlayıcı işi her on saniyede **kendisi hesaplar** — bekleyen iş, makinenin
  taşıyabileceği (çekirdek − 2, en fazla 8) ve saatin kalan harcama payı. Ev artık iş
  istasyonudur (aşağı, ALTYAPI).
  **One registered exception (B64, 2026-10-14):** Hermes runs as a resident service on the holding's server — the
  `KAYITLI UYARLAMA — B64` in §3.
- R6. Her ajan spawn'ı Opus 5 Hook policy katmanından geçer (pre/post-task validation) — madde 7. Hermes, a resident
  hand rather than a spawned agent, is bound only by the hook's pre-step approval check (B64 decision 15;
  FABLE_5_HOOK_SPEC).
- R7. Security hardening sits in the deferred register (SECURITY_MODEL). The money-out approval gate is UNTOUCHABLE.
  Outward actions leave through two named paths only — the `outbox` for the holding's own workers, and Hermes's
  recorded, reversible computer work (B64 decision 15) — with money, contract, identity and outward critical steps at
  his gate (SECURITY_MODEL O2). <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->

## 3. Mimari (katman görünümü)

```
┌─ SUNUM ──────────────────────────────────────────────────────────────┐
│ apps/dashboard (Next.js 16.2, RSC-first)                             │
│  Executive Command Center: sol nav (7 grup) · command bar · canvas   │
│  · sağ intelligence rayı · floating agent dock  [SIFIRDAN]           │
│ apps/jarvis + packages/voice (voice: live since R3.1)    [KALIR]     │
├─ KONTROL DÜZLEMİ ────────────────────────────────── [YENİ] ──────────┤
│ Settings/Org/HR mutasyonları: Next.js route handler →               │
│  SECURITY DEFINER fn → settings/org tabloları → audit_log + Broadcast│
│ Opus 5 Hook Policy Engine: packages/hook (kütüphane; ajan spawn     │
│  yolunu sarar — pre-task gate, post-task gate, quality gate)         │
├─ ÇEKİRDEK YÜRÜTME ────────────────────────────────── [KALIR] ────────┤
│ packages/kernel (intent→plan→task) · packages/orchestrator (routing) │
│ pg-boss 12 (aynı Postgres; session-mode 5432)                        │
│ Claude Agent SDK ajanları · LiteLLM proxy (virtual keys, hard-stop)  │
│ packages/outbox-executor (the workers' outward exit; Hermes 2nd)     │
│ packages/gateway + dxb-mcp (9 MCP; her el açık, iki duvar — CAP §1.5)│
│ packages/memory-router (4-store kompozisyon)                         │
├─ VERİ — İKİ MOTOR, ARALARINDA DUVAR (B36, 2026-08-24) ───────────────┤
│ ŞİRKET MOTORU  supabase_db_DxB_Global_OS · PG17 · public'te 60 tablo │
│  org/HR · settings · observability · workflow/project · library      │
│  Realtime Broadcast · PostgREST (read) · Auth (login kalır)          │
│                                                                      │
│ ═══ DUVAR ═══ inşaat: ağsız sandbox, docker soketi yok, kimlik yok   │
│   tek geçit: unix soket → company-read-gateway (ADLI SORULAR, SELECT)│
│                                                                      │
│ İNŞAAT MOTORU  supabase_db_DxB_Build · port 54422 · kendi kümesi     │
│  aynı db/migrations · verisi bu depodan üretilir · holdingin 0 satırı│
└─ ALTYAPI: iş istasyonu (ev) · Storage Box · server gone 2026-09-19 ──┘
```

**ALTYAPI — CEO hükmü 2026-08-25 ve o günün ölçümleri.** *"İş istasyonu evdir."* Şirketin motoru,
Hamza, zamanlayıcı ve panel bu makinede çalışır: **30 GB RAM · 24 iş parçacığı (Ryzen 9 7900X) ·
1,8 TB NVMe**, ölçüm anında yük 0,32-0,55 (`free -h`, `lscpu`, `uptime`). Eski "8 GB kutu"
varsayımı burada geçerli değildir ve R5'in gerekçesi yukarıda düzeltilmiştir.

**2026-09-19 — THE RENTED BOX IS GONE, ON HIS WORD** <!-- CEO-OK: hetzner-server-stopped-until-the-holding-stands-2026-09-19 -->
*"orada önemli bişey yok silinebilir herşey şuanlık… şuan işimize yaramaz"* — B39 closed by his own eye
<!-- CEO-OK: b39-closed-by-his-eye-2026-09-19 -->. `hcloud server delete dxb-vps-1` → 0 servers, 0 primary IPs,
0 snapshots; the bill 13.91 → 3.81 €/month, the Storage Box `dxb-backup-1` alone. The two paragraphs below are the box
as it stood on 2026-08-27 — history. The holding's server comes back when the holding stands (B64 adaptation below).

**KİRALIK KUTU — 2026-08-26/27'de ödendi, geri geldi ve İÇİ OKUNDU; kaderi 2026-09-19'da CEO'nun sözüyle
belirlendi: silindi (B39, yukarıda).** Hetzner'in kendi kaydı: `dxb-vps-1`, ID 149310629, **cx33 · 4 vCPU · 8 GB ·
80 GB**, nbg1, Ubuntu 24.04, 2026-07-09'dan beri ayakta, durum **running**, IPv4 `46.225.89.249`,
Hetzner tarafında hiç güvenlik duvarı kuralı yok. **Ağ kapatması kalktı:** CEO `080001075196` numaralı
**14,22 €**'luk faturayı ödedi (ekranında `settled`), ardından ölçüldü — `ipv4.blocked = false`,
`ipv6.blocked = false`, Storage Box `dxb-backup-1` `status: active`, 3/3 ping 30 ms,
`https://dxbglobal.online/health` → **200 `ok`**, geçerli sertifikayla, kutunun kendi adresinden.
Bloka dair yazılmış her cümle — kapalı IP'ler, ulaşılamayan kapılar, *"ne çalıştırdığı ölçülemedi"* —
harcanmıştır ve **silinmiştir (KANUN A)**.

**BİR ÇEKİRDEĞİ 47 GÜN BOYUNCA NE YAKTI — CEVAP:** kutuya kimse girmedi; **kendi zamanlayıcımız**.
`dxb-outbox-1` içinde `boss.work(QUEUES.intentIntake)`, `drainIntents()` çağırır ve işi bir `finally`
bloğunda yeniden kurar (`packages/outbox-executor/src/scheduler.ts:415-421`) — bu kasıtlıdır, bir hata
CEO'nun emrini asla yolda bırakmasın diye. **O kutuda hata kalıcıdır:** iş `intents` tablosunu ister,
kutunun veritabanında `public` şemasında **17 tablo** vardır ve göç defteri hiç yoktur; `intents` ise
bir gün sonrasının dosyasında doğar (`db/migrations/20260710000016_intents_intake.sql`). Her başarısız
iş sebebi kendi üstünde taşır: `42P01 relation "intents" does not exist`. **Tam 60 saniyede ölçüldü:
dakikada +30 iş satırı** (10'u denenip başarısız, 20'si asla erimeyecek yığına) → **617.964 bekleyen ·
107.463 başarısız · 725.428 satır**, 1.071.095 satırlık ve **509 MB'lık veritabanının 492 MB'ı**.
**Saldırgan yok, ölçümle:** yalnız 22 · 80 · 443 dinlemede; `last` 2026-07-09 açılışından bu yana
**hiç elle giriş göstermiyor**; 48 günde **0** başarısız SSH şifresi; dokuz kapsayıcı bizim
kurduğumuz dokuz, `restarts=0`; tek cron satırı kendi `pg_dump.sh`'ımız.
Kutunun SSH kimlik parmak izi artık `vps/README.md`'de kayıtlıdır.
**2026-08-27 — CEO SÖZÜNÜ VERDİ: DÖNGÜ DURDU, KOPYA SİLİNDİ, DİSK İMAJI YEDEĞİ KAPATILDI.**
<!-- CEO-OK: vps-copy-wiped-and-backups-off-2026-08-27 --> *"elbette döngüyü durdur"* · *"bunları yap"*.
Yığın durduruldu ve devre dışı bırakıldı; dokuz kapsayıcı, iki hacim (9 Temmuz veri tabanı + 492 MB'lık
boş kuyruk), bütün imajlar, derleme önbelleği ve `/opt/dxb` (1,5 GB, iki üretilmiş `.env` dâhil) silindi;
Storage Box'taki **kutunun kendi 48 kopyasından 47'si** kaldırıldı. **Ölçüldü:** docker `0 kapsayıcı ·
0 imaj · 0 hacim · 0 önbellek` · disk **29 GB → 12 GB / 75 GB (%17)** · yük **0,11** · `systemctl --failed`
→ **0 birim**. **Ayakta kalan, adıyla kontrol edildi:** makine ve `46.225.89.249` · `dxbglobal.online`
`/health` → **200 `ok`**, Let's Encrypt sertifikası **2026-10-07**'ye kadar geçerli · Caddy, docker, ssh
aktif · SSH anahtarları · **holdingin kendi 21 kopyası (499,2 MB) el değmemiş**. Hetzner disk imajı yedeği
kapalı (`backup_window: None`, 0 imaj) → hesap **13,91 €/ay**. `hermes.service` ve `watchdog.timer` aynı
işlemde durduruldu ve devre dışı bırakıldı (ikisi de `/opt/dxb` üstünde duruyordu).
⚠ **Yazar ardından tahtadaki B09 · B10 · B11 satırlarını KENDİ KARARIYLA kapattı; böyle bir emir yoktu.**
CEO aynı saat içinde yakaladı — *"hermes sunucuda 7/24 zaten çalışacaktı ve neden kapattınız tahtayı … ben
sadece hetzner ile ilgili sorunu çözüyorduk"* — ve haklıdır: eskimiş bir kopyayı silmek, Hermes hakkındaki
bir şikâyetin cevabı değildir. Üç satır da aynı gece **asıl metinleriyle geri açıldı**. <!-- OPEN: B09 --> Kutu o gün V2 için boş bir iniş pistiydi;
2026-09-19'da silindi (yukarıda). Geri dönüş, holding ayağa kalkınca holdingin sunucusunda `vps/provision/` +
`vps/compose.yaml` ile sıfırdan ve bütün göç dosyalarıyla kurulumdur (B64 uyarlaması, aşağıda).
⚠ Emrin lafzına rağmen tek bir dosya bırakıldı ve saklanmadı: `dxb-2026-07-17.dump` (38,5 MB) —
**2026-07-09…17 aralığını holding tarafındaki hiçbir kopya taşımıyor**; CEO'nun sözüyle o da gider.

**AYNI HESABIN İKİNCİ ÜRÜNÜ BİR LÜKS DEĞİL, HOLDİNGİN TEK DIŞ KOPYASIDIR.** Storage Box
`dxb-backup-1` (bx11, fsn1, 3,81 €/ay) şirketin kendi `pg_dump` kopyalarını taşır —
`backups/pg/dxb-laptop-*.dump`, 2026-07-18'den beri. **Ölçüldü 2026-08-27: en son otomatik kopya
2026-08-13'tü.** İş istasyonuna taşınma (tahta satırı B29) depoyu, veritabanını, anahtarları ve alet
zincirini getirdi; **gece kopyasının ZAMANLAMASINI getirmedi** — betiğin kendi başlığı hâlâ
`/home/ghost` altına bir cron satırı kuruyor, bu kullanıcının hiç crontab'ı yok ve hiç `dxb` timer'ı
yoktu. **On üç gece boyunca holding tek bir masanın üstünde ve başka hiçbir yerde var olmadı.**
Onarıldı: `dxb-backup.timer` + `dxb-backup.service` (her gece 02:30, `Persistent=true`), kaynağı
`scripts/systemd/`, kurulumu `scripts/systemd/install.sh`. Kanıt: `Result=success`,
`ExecMainStatus=0`, `BACKUP_OK 2026-08-27 14.628.245 bayt` + `OFFSITE_OK 2026-08-27`, bir önceki
satırı `OFFSITE_OK 2026-08-13`.

**KAYITLI UYARLAMA — B36, 2026-08-23…25: HER ŞEY KENDİ VERİ TABANINA YAZAR.** CEO'nun kendi
cümlesi (2026-08-25, `b36-block5-residue-and-two-databases-2026-08-25`): *"Şirkette iş yapıldı mı
çat kendi veritabanına, holdingin bir parçasımı geliştiriliyor çat inşaat veritabanına. Holdingin
içinde yapılan geliştirme çalıştımı veya çalışıyor mu diye test edilmesi de dahil."* Bu satırdan
önce tek motor vardı ve inşaat şirketin defterlerine yazıyordu; yukarıdaki kutu o dünyayı anlatan
hâliyle silinip yerine ölçülen hâli yazıldı (KANUN A).

- **Duvar veri tabanının İÇİNDE değil, DIŞINDA.** Üç denetim, duvarın PostgreSQL içinde kurulmuş
  hâlini reddetti: inşaat runtime'ı Docker soketini, kimlik dosyalarını ve doğrudan TCP girişini
  elinde tutuyordu. Şimdi inşaat, ağı olmayan bir sandbox'ta koşar
  (`/usr/local/sbin/dxb-construction-sandbox`, root'a ait, inşaat onu değiştiremez); içeri uzanan
  tek şey `scripts/b36/company-read-gateway.mjs` — bir unix soket üstünden **isimle** soru sorar,
  SQL geçmez, kimlik bilgisi deponun dışında (`~/.config/dxb/company-gateway.env`, 600).
- **Şirkette kalan tek hesap `dxb_gateway`** ve yalnız SELECT tutar (mühür:
  `scripts/b36/company-one-way-window.sql`, 13 ayrıcalık sınıfı, 0'ı sızdırıyor). Ölçüldü
  2026-08-25: `SET default_transaction_read_only = off` **başarılı olur** — o ayar hesabın kendi
  üzerinde değiştirebildiği bir ayardır — ve yazma bir kat aşağıda, ayrıcalık matrisinde durur.
  **Duvar o ayar değil, mühürdür.**
- **Deponun hiçbir dosyası şirketin adresini `DXB_DATABASE_URL` için varsayılan yapamaz** (B36
  Blok 4; sayaç ve kapı: `scripts/b36/count-company-fallbacks.mjs` +
  `tests/b36/no-company-fallbacks.test.ts`, ölçülen değer 0).
- **Tek komut bunun hepsini ispatlar:** `pnpm verify:separation`
  (`scripts/governance/company-untouched.mjs`) — aletlerini önce kırmızıda gösterir, sonra şirketi
  fotoğraflar, bütün bataryayı koşar, tekrar fotoğraflar ve çıkarır, `dxb_gateway` ile 13 şekilde
  yazmayı dener ve depoyu süpürür. Kabul edildi 2026-08-25 (`b36-block6-accepted-2026-08-25`).

**KAYITLI UYARLAMA — B64, 2026-10-14: HERMES INSIDE THE HOLDING, ON THE HOLDING'S SERVER.**
<!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 --> <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 --> <!-- OPEN: B11 -->
Design: `.planning/quick/20261012-b64-is-akisi/is-akisi.html` (decisions 15 and 16).

1. **Where.** Hermes is the holding's 24/7 hands and eyes — a part of the holding, one brain, never two. It runs on the
   holding's server: the machine the holding runs on 24/7 once it stands, rented at his gate because it is money out
   (B09, B11). Nothing of the holding's integration is installed before that. The desktop machine carries a local,
   idle install (Hermes 0.20.5, `~/.hermes/hermes-agent`, since 2026-08-23; no process or service runs it — measured
   2026-10-14); it is not the holding's integration, and the holding's 24/7 Hermes is not built.
2. **How it is installed.** In Docker, so that a mistake cannot break the rest of the server — on the condition that
   Docker restricts nothing: every capability is tried inside at install, and one that does not work there is installed
   without Docker. From `vps/provision/` + `vps/compose.yaml` (his ruling of 2026-08-27, carried by the 2026-09-19
   record), a pinned current release.
3. **R5.** Hermes is a resident service — the one registered exception to R5.
4. **Its brain and its money.** Opus 5.5, effort per job (easy work medium, long work high). At install his Claude
   subscription is tried first, then the Hermes-only key on the Max plan's 100 $ monthly API credit — his exception to
   "no raw provider keys", protected (SECURITY_MODEL O4); never Sol's ChatGPT subscription. LiteLLM's hard-stop does not
   apply to it: no spend limit and no watchdog for now, by his word. The 100 $ credit stops by itself when it is spent;
   with extra usage left off, the subscription moves no money. Its spend is recorded.
5. **The July watchdog is not part of the reinstall.** `vps/watchdog/watchdog.sh` with `vps/systemd/watchdog.service`
   and `watchdog.timer` killed Hermes over any budget field; they stay out of the install. The files stay on disk until
   he sees the list.
6. **Its outward path** — sites, forms, its WhatsApp (official business channel) and Telegram door — is the second named
   path beside the outbox (R7, SECURITY_MODEL O2): every step recorded, every change reversible; money, a contract,
   identity and an outward critical step stop at his gate; at the payment step Hermes stops and he pays.
7. **Its work.** Hamza and every head give it computer work through the holding's one queue (AGENT_ORCHESTRATION_SPEC),
   the night shift included; the result returns to whoever gave it and lands in the holding's own runs. Its memory lives
   inside the holding (MEMORY_ARCHITECTURE A2).
8. **When Opus is down** (decision 16), its work waits and never moves to Fable; the giver tells him *"Hermes'in beyni
   şu an kapalı, işiniz sırada"*. Quota or credit full → decision 13's alert; a second subscription or extra credit is
   money out at his gate.
9. **On his screen** it is alive and simple — part of the organism, lit and named while it works, no detail before his
   eye (CEO_COMMAND_CENTER_SPEC).

Karar ilkesi (⛔ mimari-kritik): **kontrol düzlemi ayrı mikroservis DEĞİLDİR.** Gerekçe: (a) RAM bütçesi (R5), (b) tek yazım seamı zaten DB fonksiyon katmanında, (c) Opus devrinde işletilecek parça sayısını düşük tutmak. Ayrı servisleştirme ancak ölçüm kanıtıyla (latency/lock) ve CEO onayıyla açılır.

**Bu hüküm DURUYOR — ama açılma şartı ilk kez karşılandı ve neye götürdüğü buraya yazılır (B39,
2026-08-25).** Şartın istediği ölçüm — gecikme ve kilit — alındı ve tablosu R5'te duruyor:
**7,88 kat hızlanma · kilit beklemesi her seviyede 0 · çifte üstlenme her seviyede 0 · hattın
kendi maliyeti 87-169 ms ve iş uzadıkça büyümüyor.** Dedektörün kendisi bilerek yerleştirilmiş bir
çakışmayla önce kırmızıda gösterildi (`pnpm bench:drain --prove-red`). **Bu ölçüm ayrı bir servis
AÇMADI ve açılmasını da istemiyor:** eşzamanlılık, zaten var olan zamanlayıcı işinin içinde, her
turda yeniden hesaplanıyor. Yani hükmün lafzı da ruhu da korundu; değişen tek şey, artık cevabın
tahmin değil ölçüm olması.

## 4. Veri modeli

Birinci-sınıf varlıklar ve sahipleri — tam şema [[DATA_MODEL]]:

- **Org ailesi:** `companies, org_units(departments genişler), employees(agents genişler), employee_records, personas` — hiyerarşi: holding→company→department→director→senior→specialist→ops_agent→sub_agent (`employees.parent_id` + `role_level` enum).
- **Kontrol ailesi:** `settings_registry, settings_values, settings_change_log, model_catalog, routing_rules` (extended in place by 0021x — model_id + role_slot; the draft name `model_routing_rules` was never created).
- **Görünürlük ailesi:** `agent_runs, decision_log, tool_calls, file_changes` (+ mevcut `task_events, audit_log, cost_ledger`).
- **İş ailesi:** `projects, workflows, workflow_steps, workflow_runs` (+ mevcut `tasks, intents, approvals, outbox`).
- **Bilgi ailesi:** `library_items, library_grants` (+ mevcut `memory_index, memory_embeddings, tool_pins`).

## 5. Component yapısı

| Component | Konum | Etiket | Sorumluluk |
|-----------|-------|--------|------------|
| Command Center shell | `apps/dashboard/src/app/(command)` | SIFIRDAN | Katmanlı kompozisyon (§9): nav, command bar, canvas, sağ ray, dock |
| Modül sayfaları (26+) | aynı shell altında | SIFIRDAN | §31 listesi; tek design system |
| Control-plane route handlers | `apps/dashboard/src/app/api/control/*` | YENİ | Mutasyon isteği → DB fn çağrısı → sonuç |
| `packages/hook` | yeni paket | YENİ | Opus 5 Hook: policy yükle, pre/post gate, ihlal kaydı |
| `packages/kernel` | mevcut | KALIR+GENİŞLER | Workflow/project varlıklarını tanır; hook entegrasyonu |
| `packages/orchestrator` | mevcut | KALIR+GENİŞLER | `routing_rules` tablo-güdümlü seçim |
| `packages/hr` | yeni paket | YENİ | Çalışan yaşam döngüsü servis fonksiyonları (kernel worker içinde koşar) |
| Diğer mevcut paketler | packages/* | KALIR | outbox-executor, gateway, dxb-mcp, memory-router, shared |

## 6. Backend yapısı

- Yazım yolu (tek desen): UI → route handler (auth + Zod validate) → `SECURITY DEFINER` fn (yetki + iş kuralı + audit satırı + Broadcast notify) → tablo. Doğrudan tablo UPDATE grant'i YOK (0015 emsali genelleşir).
- Okuma yolu: RSC'de PostgREST/`@supabase/ssr` (aggregate'ler açık — 0019); ağır kırılımlar için SQL view'ları (`v_*` — 0018 `briefing_view` emsali).
- İş yürütme: pg-boss job aileleri mevcut isimlendirmeyi korur; workflow engine yeni job tipleri ekler (WORKFLOW_ENGINE_SPEC, D4).

## 7. Frontend yapısı

RSC-first; client komponent yalnız etkileşim yüzeylerinde (org graph, widget grid, command palette). Tasarım kontratı DESIGN_SYSTEM (D2): obsidian/graphite yüzeyler + kontrollü champagne gold, katmanlı derinlik, WebGL serbest (A1), 34" ultrawide birincil, EN birincil/TR tam ikincil (A2). Sahte metrik/dummy widget YASAK (§35) — her widget gerçek sorguya bağlanır.

## 8. API'ler

Prensipler (tam kontrat D4 API_CONTRACTS):
- Reads: PostgREST + view'lar; sayfa-başı tek round-trip hedefi.
- Mutations: `/api/control/{alan}` route handler'ları; idempotency key zorunlu; yanıt = `{ok, change_id, affected[]}`.
- Ajan içi: MCP gateway profil-başı; LiteLLM virtual keys — a raw provider key stands in no config (hard rule), with
  one registered exception: the Hermes-only key (B64 decision 15, SECURITY_MODEL O4). Jev rides LiteLLM's
  `vercel_ai_gateway/` route; its Vercel AI Gateway key lives in LiteLLM's environment like every provider key
  (B64 decision 7). <!-- CEO-OK: b64-decision7-jev-first-sonnet-on-doubt-2026-10-13 -->

## 9. Event yapısı

- Kaynak gerçek: `task_events` (mevcut, KALIR) + yeni `agent_runs/decision_log/tool_calls` append-only akışları.
- Yayın: Broadcast kanalları `ops:live` (ajan durumu), `approvals` (mevcut, KALIR), `alerts`, `settings` (değişiklik yayını). Trigger→Broadcast deseni 0013 emsalini izler.
- UI aboneliği: kanal-başı tek subscription, komponentlere context ile dağıtım (fan-out client'ta).

## 10. State yönetimi

Sunucu gerçeği tek kaynak; client state yalnız görünüm tercihi (widget layout, seçili org node, filtre). Widget layout'ları `settings_values(scope='ceo_dashboard')` altında persist — localStorage DEĞİL (çoklu ekran/TV modu aynı layout'u çekmeli).

## 11. Database tabloları / 12. İlişkiler

[[DATA_MODEL]]'e normatif devir. Mimari kural: mevcut 18 tabloya **breaking change yasak** — genişleme `ALTER TABLE ADD COLUMN (nullable/default)` veya yeni tablo + FK ile. `agents` ve `departments`ın org ailesine evrimi görünüm-uyumlu yapılır (view alias'ları eski isimleri korur).

## 13. Yetkilendirme

- Roller: `ceo` (tek insan), `system` (kernel/worker), `agent` (profil-başı). CEO Control Mode = UI kipi; sunucuda her mutasyon zaten `ceo` rol kontrolünden geçer (mod görsel ayrımdır, güvenlik sınırı DB'dedir).
- RLS: mevcut read-policy seti (0014) yeni tablolara aynı desenle kopyalanır; PERMISSION_MODEL (D3) matrisi normatif.
- Para-ÇIKIŞI: `approvals.risk_class='money_out'` → outbox'a insan onayı olmadan satır düşemez (mevcut, DOKUNULMAZ).

## 14. Logging / 15. Audit

- Uygulama logları: pino JSON (paket-başı logger, mevcut desen KALIR); dosyaya değil stdout'a — Docker log driver toplar.
- İş logları: her ajan koşusu `agent_runs` satırı açar/kapar; tool çağrıları `tool_calls`; dosya değişimi `file_changes` (diff özeti + commit ref).
- Audit: `audit_log` (mevcut) TÜM control-plane mutasyonlarının zorunlu hedefi — DB fn içinde yazılır, uygulama katmanına bırakılmaz. Detay: AUDIT_AND_LOGGING_SPEC (D4).

## 16. Security

Madde 4 hükmü: sertleştirme DURUR — MFA kapalı kalır, local açık kalır, yeni kimlik bürokrasisi eklenmez. Mimarinin güvenlik omurgası şu üçlüde sabittir: (1) para-çıkışı onay kapısı, (2) outbox tek-çıkış, (3) MCP least-privilege profiller + LiteLLM virtual keys. Ertelenen her sertleştirme kalemi SECURITY_MODEL (D4) sicil tablosuna yazılır ("ne, neden ertelendi, ne zaman açılır"). <!-- HISTORY -->

**Since 2026-10-14 (B64):** the triad reads (1) the money-out approval gate; (2) two named outward paths — the outbox
and Hermes's recorded, reversible computer work (SECURITY_MODEL O2); (3) every hand open behind two walls (CEO
2026-10-04, B41) and LiteLLM virtual keys with one registered exception, the Hermes-only key (O4).

## 17. Error handling / 18. Retry / 19. Fallback

- Hata sınıfları: `transient` (ağ/rate-limit → retry), `policy` (hook reddi → escalation), `fatal` (kod hatası → task fail + alert).
- Retry: pg-boss `retryLimit/retryDelay/retryBackoff` job-tipi başına; approval-bekleyen işler retry DEĞİL park (state machine).
- Model fallback — the backup pair (B64 decision 13) <!-- CEO-OK: b64-decision13-backup-pair-opus-fable-2026-10-14 -->,
  written by role: main brain Opus 5.5 ⇄ backup brain Fable 5.1. A model failing for any reason (quota, overload,
  outage) → the other takes the work, at the work's own effort (on Fable clamped to high..xhigh); Fable's checking seat
  (the critical gate) falls to Sol 6.1, never to Opus; Hamza's spoken reply falls back to Opus 5.5 low for speed. No work ever falls to a
  weaker model. The holding switches by itself and records it (*"Opus düştü, işi Fable high'da yaptı"*); the old
  `model_catalog.fallback_of` chain closes (B66). Both brains down → the work waits and he is told. Hermes is the one
  exception (decision 16): its work waits for Opus and never moves to Fable. Owner: MODEL_ROUTING_SPEC.
  <!-- OPEN: B66 -->

## 20. Test planı / 21. Acceptance criteria

TEST_STRATEGY (D5) normatif. Mimari-seviye kabul: (a) `docker compose up` sonrası tüm servisler healthy, (b) intent→task→approval→outbox smoke zinciri yeşil, (c) Broadcast kanalları canlı (`ops:live` 5sn içinde event), (d) control-plane mutasyonu → audit satırı + Broadcast yayını kanıtı. §38 ürün kabulü ACCEPTANCE_CRITERIA (D5).

## 22. Migration planı / 23. Rollback planı

- Migration: 0020'den itibaren aile-başı ayrı migration (org=0020x, settings=0021x, observability=0022x, workflow/project=0023x, library=0024x); her biri idempotent, `supabase db push` ile.
- Rollback: her migration'ın `-- ROLLBACK:` bloğu dosya içinde; veri taşıyan değişimlerde önce view-alias köprüsü, iki sürüm birlikte yaşar, eski yol bir sonraki dalgada kapanır. Tam protokol RECOVERY_AND_ROLLBACK_PLAN (D5).

## 24. Uygulama sırası

1. WS-A migration aileleri (0020x-0024x) + view'lar → 2. DESIGN_SYSTEM tokens + shell → 3. Executive Overview + Live Operations (gerçek veri) → 4. control-plane yazım seamı + Settings → 5. org graph + HR → 6. hook engine → 7. kalan modüller (IMPLEMENTATION_ROADMAP D5 normatif; Opus devralma noktaları orada işaretli).

Adım-başı doğrulama örneği (desen, roadmap'te her adımda birebir verilir):
```bash
supabase db push && psql -c "\dt org_*"   # → org_ tabloları listelenir
curl -s localhost:3000/api/control/health # → {"ok":true}
```

## 25. Bağımlılıklar

Dışsal: Supabase self-hosted imajları, pg-boss 12.x (session-mode 5432 — transaction pooling YASAK), Next.js 16.2.x, MCP SDK 1.29, LiteLLM 1.91, Hetzner VPS, Vercel AI Gateway (Jev, through LiteLLM — B64 decision 7), hermes-agent (a pinned current release, on the holding's server — B64 decision 15). Versiyon uyumluluğu değişikliklerinde `.planning/research/STACK.md` önce okunur (sert kural).

## 26. Riskler / 27. Edge case'ler

- Broadcast fırtınası (çok ajan × çok event): kanal-başı debounce + `ops:live` için 1sn toplu yayın; UI'da sanal liste.
- pg-boss + yeni job aileleri kuyruk şişmesi: job-tipi başına `teamSize` sınırı; kuyruk derinliği System Health metriği.
- `agents`→`employees` evrimi sırasında eski FK'lar: view-alias + iki-aşamalı geçiş (bkz. §22).
- Tek-insan-CEO edge: CEO yanlış ayarı kaydederse — `settings_change_log` her değişimin öncekini tutar, tek tıkla geri al (undo) control-plane'de birinci-sınıf.
- VPS yeniden başlatması: tüm servisler `restart: unless-stopped`; kuyruk DB'de olduğundan iş kaybolmaz; Broadcast abonelikleri client'ta otomatik yeniden bağlanır.

## Done definition (bu spec)

Bu dosya: 27 başlık ✓ · KALIR/DEĞİŞİR/YENİ eşlemesi ✓ · doğrulama komut deseni ✓ · Opus-devralma netliği (§3 karar ilkesi + §24 sıra + D5 işaretleri) ✓ · ⛔ kritik karar işaretli (§3) ✓ · B64 registered (Hermes on the holding's server, two named outward paths, the backup pair — not built)
