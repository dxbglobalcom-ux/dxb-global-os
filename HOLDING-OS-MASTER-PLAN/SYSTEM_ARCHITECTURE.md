# SYSTEM_ARCHITECTURE — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 1 · Yazar: Fable 5 bizzat · Üst: [[MASTER_PLAN]] · Kardeşler: [[DATA_MODEL]], [[EVENT_MODEL]] (D4), [[API_CONTRACTS]] (D4)
> §14 şablonu: 27 başlık tam. Mevcut-varlık eşlemesi her bölümde KALIR/DEĞİŞİR/YENİ etiketiyle.

## 1. Amaç

Holding OS'un tüm katmanlarının — çekirdek yürütme (kernel/kuyruk/ajanlar), kontrol düzlemi (settings/org/HR), görünürlük düzlemi (observability/audit/cost) ve sunum düzlemi (Executive Command Center) — tek tutarlı mimaride tanımı. Hedef: CEO'nun "her detayı gör + her detayı değiştir" hükmünü (Total Control) mevcut çalışan çekirdeği bozmadan taşıyan mimari.

## 2. Gereksinimler

- R1. Mevcut çekirdek OS akışı (intent → kernel → task → agent → approval → outbox) kesintisiz KALIR.
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
- R6. Her ajan spawn'ı Opus 5 Hook policy katmanından geçer (pre/post-task validation) — madde 7.
- R7. Güvenlik sertleştirme ertelenmiş sicilde; para-ÇIKIŞI onay kapısı + outbox tek-çıkış deseni DOKUNULMAZ.

## 3. Mimari (katman görünümü)

```
┌─ SUNUM ──────────────────────────────────────────────────────────────┐
│ apps/dashboard (Next.js 16.2, RSC-first)                             │
│  Executive Command Center: sol nav (7 grup) · command bar · canvas   │
│  · sağ intelligence rayı · floating agent dock  [SIFIRDAN]           │
│ apps/jarvis (voice — ertelendi, mimari yeri korunur)      [KALIR]    │
├─ KONTROL DÜZLEMİ ────────────────────────────────── [YENİ] ──────────┤
│ Settings/Org/HR mutasyonları: Next.js route handler →               │
│  SECURITY DEFINER fn → settings/org tabloları → audit_log + Broadcast│
│ Opus 5 Hook Policy Engine: packages/hook (kütüphane; ajan spawn     │
│  yolunu sarar — pre-task gate, post-task gate, quality gate)         │
├─ ÇEKİRDEK YÜRÜTME ────────────────────────────────── [KALIR] ────────┤
│ packages/kernel (intent→plan→task) · packages/orchestrator (routing) │
│ pg-boss 12 (aynı Postgres; session-mode 5432)                        │
│ Claude Agent SDK ajanları · LiteLLM proxy (virtual keys, hard-stop)  │
│ packages/outbox-executor (dışa dönük TEK kapı, onay sonrası)         │
│ packages/gateway + dxb-mcp (8 MCP, 14 least-privilege profil)        │
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
└─ ALTYAPI: iş istasyonu (ev) · Hetzner cx33 (kiralık, aşağıdaki nota bak) ──┘
```

**ALTYAPI — CEO hükmü 2026-08-25 ve o günün ölçümleri.** *"İş istasyonu evdir."* Şirketin motoru,
Hamza, zamanlayıcı ve panel bu makinede çalışır: **30 GB RAM · 24 iş parçacığı (Ryzen 9 7900X) ·
1,8 TB NVMe**, ölçüm anında yük 0,32-0,55 (`free -h`, `lscpu`, `uptime`). Eski "8 GB kutu"
varsayımı burada geçerli değildir ve R5'in gerekçesi yukarıda düzeltilmiştir.

**KİRALIK KUTU — ölçüldü 2026-08-25, ve durumu bir AÇIK SORUDUR (tahta satırı B39).** Hetzner'in
kendi kaydı: `dxb-vps-1`, ID 149310629, **cx33 · 4 vCPU · 8 GB · 80 GB**, nbg1, Ubuntu 24.04,
2026-07-09'dan beri ayakta (47 gün), durum **running**, IPv4 `46.225.89.249`, Hetzner tarafında
**hiç güvenlik duvarı kuralı yok** (`hcloud server describe`, `hcloud firewall list`). Hetzner'in
metrik grafikleri son altı saatte **kesintisiz %48-59 işlemci kullanımı ve sürekli ağ trafiği**
gösteriyor — yani **kutu iş yapıyor.** Buna karşılık bu makineden **hiçbir kapısına ulaşılamıyor**:
ICMP yanıtsız, 22 · 80 · 443 üçü de zaman aşımına düşüyor, `https://dxbglobal.online/health`
15 saniyede cevapsız (alan adı doğru IP'ye çözülüyor — genel çözümleyici de aynı adresi veriyor).
**Ne çalıştırdığı ÖLÇÜLMEDİĞİ için buraya yazılmamıştır**, ve bir rol atanmadan önce ölçülecektir.

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
- Ajan içi: MCP gateway profil-başı; LiteLLM virtual key'ler — raw provider key hiçbir config'de bulunamaz (sert kural).

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

## 17. Error handling / 18. Retry / 19. Fallback

- Hata sınıfları: `transient` (ağ/rate-limit → retry), `policy` (hook reddi → escalation), `fatal` (kod hatası → task fail + alert).
- Retry: pg-boss `retryLimit/retryDelay/retryBackoff` job-tipi başına; approval-bekleyen işler retry DEĞİL park (state machine).
- Model fallback: `model_catalog.fallback_of` zinciri; orchestrator seçimde sırayla dener, her düşüş `decision_log`a yazılır. Fable→Opus devri de aynı zincirin insan-katmanı karşılığıdır.

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

Dışsal: Supabase self-hosted imajları, pg-boss 12.x (session-mode 5432 — transaction pooling YASAK), Next.js 16.2.x, MCP SDK 1.29, LiteLLM 1.91, Hetzner VPS. Versiyon uyumluluğu değişikliklerinde `.planning/research/STACK.md` önce okunur (sert kural).

## 26. Riskler / 27. Edge case'ler

- Broadcast fırtınası (çok ajan × çok event): kanal-başı debounce + `ops:live` için 1sn toplu yayın; UI'da sanal liste.
- pg-boss + yeni job aileleri kuyruk şişmesi: job-tipi başına `teamSize` sınırı; kuyruk derinliği System Health metriği.
- `agents`→`employees` evrimi sırasında eski FK'lar: view-alias + iki-aşamalı geçiş (bkz. §22).
- Tek-insan-CEO edge: CEO yanlış ayarı kaydederse — `settings_change_log` her değişimin öncekini tutar, tek tıkla geri al (undo) control-plane'de birinci-sınıf.
- VPS yeniden başlatması: tüm servisler `restart: unless-stopped`; kuyruk DB'de olduğundan iş kaybolmaz; Broadcast abonelikleri client'ta otomatik yeniden bağlanır.

## Done definition (bu spec)

Bu dosya: 27 başlık ✓ · KALIR/DEĞİŞİR/YENİ eşlemesi ✓ · doğrulama komut deseni ✓ · Opus-devralma netliği (§3 karar ilkesi + §24 sıra + D5 işaretleri) ✓ · ⛔ kritik karar işaretli (§3) ✓
