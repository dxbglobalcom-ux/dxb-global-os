# IMPLEMENTATION_ROADMAP — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 5 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif madde 14 (uygulama sırası teknik detayla) + madde 17 (Faz 1-11) + madde 18/v6 (model dağılımı) · Üst: [[MASTER_PLAN]] §7 (pencere stratejisi — bu dosya P2/P3'ün adım tablosudur) · Kardeşler: [[BACKUP_PLAN]] (S1/S2 senaryoları), [[TEST_STRATEGY]], [[ACCEPTANCE_CRITERIA]]
> Yürütme sözleşmesi: adımlar SIRAYLA; her adım kanıt komutuyla kapanır (evidence-before-done); ✓ işareti BU DOSYAYA işlenir (canlı ilerleme kaydı). Opus herhangi bir ✓-sınırından devralabilir — istisnalar §5.

## 1. Amaç

Korpus (31 spec) → çalışan Holding OS dönüşümünün adım-adım, kanıt-komutlu, devralma-işaretli yürütme planı. Pencere 2'de Fable bizzat koşar; Pencere 3'te Opus 4.8 ilk ✓'siz adımdan sürer.

## 2. Gereksinimler

- G1. Her adım: dosya yolları + normatif spec referansı + "çalıştır → şu çıktıyı gör" kanıtı.
- G2. Sıra MASTER_PLAN §7 P2 sırasına sadıktır (değer-öncelikli: görünür kokpit erken); CEO Faz eşlemesi her blokta.
- G3. Fable-only işler işaretli (persona ailesi); ⛔ kritik kararlar işaretli.
- G4. Paralellik yalnız Opus penceresinde ve yalnız işaretli bloklar arasında (aynı dosyaya iki el yasak — BACKUP_PLAN §8).

## 3. Mimari (yürütme blokları ve bağımlılık)

```
E1 tokens ──► E2 shell ──► E3 overview+liveops v1 (mevcut 18 tablo, gerçek veri)
E4 WS-A migrations (0020x→0026x + view'lar + seed) ──► E6 control seam ──► E7 routing
E5 persona çekirdeği (FABLE-ONLY) ─ bağımsız, E4'ten sonra herhangi bir an
E8 observability yazıcıları ──► E9 workflow+project+library+approval ──► E10 hook engine
E11 cost intelligence ──► E12 kalan modül sayfaları + widget ──► E13 kabul turu
```

## 4. ADIM TABLOSU (bağlayıcı — ilerleme işareti bu tabloya)

Model kolonu: **F** = yalnız Fable · F/O = Fable öncelikli, Opus devralabilir. Durum: `—` bekliyor · `✓` kanıtla kapandı.

### E1 — Design tokens + primitives (CEO Faz 6 zemini) — [[DESIGN_SYSTEM]] normatif

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E1.1 | Tailwind v4 token seti (obsidian/graphite yüzeyler, champagne gold, 8-durum matrisi, motion) | `apps/dashboard/src/styles/tokens.css` + `tailwind` config | `pnpm --filter dashboard build` → yeşil; token sınıfları derlendi | F/O | — |
| E1.2 | Primitive komponentler (Surface, Panel, Stat, DataGrid, Badge, CommandItem — §33 zorunlu library çekirdeği) | `apps/dashboard/src/components/primitives/` | Storybook YOK (bilinçli); `/design-preview` rotası primitives'i gerçek tokenlarla listeler | F/O | — |

### E2 — Command Center shell (CEO Faz 6) — [[CEO_COMMAND_CENTER_SPEC]] §9-11

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E2.1 | Shell layout: sol nav (7 grup, §10 birebir), üst command bar (§11), canvas, sağ intelligence rayı, floating dock | `apps/dashboard/src/app/(command)/layout.tsx` + nav config | `curl -s localhost:3000/overview` → 200; ekranda 5 katman | F/O | — |
| E2.2 | Rota iskeleti: §31 sayfa listesi route-bazlı (boş sayfa YOK — her rota gerçek veri veya "modül bekliyor" durum kartı + hedef tarihi) | `(command)/*/page.tsx` | rota sayısı ≥ 26: `find apps/dashboard/src/app/\(command\) -name page.tsx \| wc -l` | F/O | — |
| E2.3 | Eski kokpit rotalarından geçiş (tek commit'te anahtar; rollback tek revert) | rota değişim commit'i | eski rotalar 308 → yeni shell | F/O | — |
| E2.4 | Login 3D hover upgrade (davranış aynı, görsel katman) | login komponenti | build yeşil + ⚠ CEO göz testi | F/O | — |

### E3 — Executive Overview + Live Operations v1 (CEO Faz 6) — gerçek veri, mevcut şema

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E3.1 | `v_exec_overview_v1` view (mevcut 18 tablodan: tasks, approvals, cost_ledger, agents, budget_state) — migration `0019x-b` | `db/migrations/` | `psql -c "SELECT * FROM v_exec_overview_v1;"` → 1 satır özet | F/O | — |
| E3.2 | Overview sayfası (§12): özet sayılar + HER sayı tıklanır → kaynak listesine iner (drill-down v1) | `(command)/overview/` | Playwright: sayıya tıkla → detay rotası açılır | F/O | — |
| E3.3 | Live Operations v1 (§14): task_events akışı + Broadcast `approvals` mevcut kanalı; `ops:live` E8'de gelir | `(command)/operations/` | UI'da canlı task olayı ≤5 sn | F/O | — |

### E4 — WS-A veri omurgası (CEO Faz 2 zemini) — [[DATA_MODEL]] §20 sırası

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E4.1 | 0020x org + 0021x settings + 0022x observability (+0022x-b) | `db/migrations/` | DATA_MODEL §22 komutları: `\dt` 6 aile kanıtı + append-only reddi | F/O | — |
| E4.2 | 0023x workflow/project (+steps_snapshot, 0023x-b) + 0024x library (+0024x-b) | `db/migrations/` | `\dt project_* library_*` tam liste | F/O | — |
| E4.3 | 0025x api_support (view kataloğu + control_idempotency + notify_broadcast) + 0026x memory köprüleri | `db/migrations/` | API_CONTRACTS §24 idempotency kanıtı; `\d memory_index` 2 kolon | F/O | — |
| E4.4 | Seed: companies(dxb-global) + mevcut departments→company bağla + DXB Global OS ilk proje kaydı (dogfood) | `db/seed/` | `SELECT count(*) FROM companies;` → 1; `v_project_command` dolu | F/O | — |
| E4.5 | Overview/LiveOps v2: view'ları 0025x kataloğuna geçir (`v_exec_overview`, `v_live_ops`) | E3 sayfaları | drill-down yeni ailelere iner | F/O | — |

### E5 — Persona çekirdeği (CEO Faz 3-5) — **FABLE-ONLY** ([[EMPLOYEE_PERSONA_STANDARD]], [[HR_OPERATING_SYSTEM_SPEC]])

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E5.1 | Persona derleyici: standard şablon → system-prompt compile fn (`packages/hr`) + personas tablo yazımı | derleme testi: örnek persona → geçerli system prompt | **F** (derleyici kodu F/O; şablon+kalite kapısı F) | — |
| E5.2 | Orkestratör personası v2 (Fable yazımı, quality_gate=passed) | `SELECT quality_gate FROM personas WHERE ...` → passed | **F — DEVREDİLEMEZ** | — |
| E5.3 | Departman müdürü personaları v2 (mevcut departman seti) | müdür-başı personas satırı + employee_records | **F — DEVREDİLEMEZ** | — |
| E5.4 | HR ilk oluşumu: HR personaları + persona-yazım standardı + kalite kapıları (Fable-sonrası fabrika) | HR dept aktif; hr fn'leri testli | **F — DEVREDİLEMEZ** | — |
| E5.5 | Uzman personaları (153 legacy → v2 dalgaları + Fable olmazsa-olmaz ekleri — G7) | dalga-başı sayım raporu | **F**; yetişmeyen → "Fable-yazımı bekliyor" listesi CEO'ya (BACKUP_PLAN §1.6) | — |

### E6 — Control seam + Settings (CEO Faz 7) — [[SETTINGS_AND_CONTROL_SPEC]], [[API_CONTRACTS]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E6.1 | settings_registry seed (§18 alan kataloğu) + `control_settings_*` fn'leri + route handler + client helper | API_CONTRACTS §24 komutu birebir (set → change_log 1 satır; idempotent tekrar) | F/O | — |
| E6.2 | Settings UI (§18 bölümleri) + Live Impact Preview + tek-tık undo | Playwright: değiştir → preview → kaydet → undo → eski değer | F/O | — |
| E6.3 | Org mutasyonları (`control_org_*`) + Organization sayfası v1 (read-only graph → sonra drag-drop) | org fn testi + `org` kanalında olay | F/O | — |

### E7 — Model routing tablo-güdümlü (CEO Faz 7) — [[MODEL_ROUTING_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E7.1 | model_catalog seed + routing_rules genişleme + orchestrator tablo-okur seçim | routing testi: slot → beklenen model; fallback zinciri decision_log'a | F/O | — |
| E7.2 | Model Orchestration Panel (§19) + Sonnet-ban denetimi görünür | panelde 13 rol slotu; Sonnet hiçbir slota atanamaz (fn reddi) | F/O | — |

### E8 — Observability yazıcıları (CEO Faz 6/8) — [[OBSERVABILITY_SPEC]], [[AUDIT_AND_LOGGING_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E8.1 | Orchestrator SDK sarmalayıcı: agent_runs + tool_calls + file_changes otomatik yazım (1 sn tampon) | AUDIT §24: mock koşu N çağrı → N satır | F/O | — |
| E8.2 | `logDecision` yardımcısı + §10 "önemli karar" noktalarına yerleştirme | decision_log 8 alan dolu satır | F/O | — |
| E8.3 | `ops:live` Broadcast trigger'ları + Live Ops v2 canlı ajan akışı | EVENT_MODEL §24 probe komutu | F/O | — |
| E8.4 | Audit sayfası (Governance grubu): birleşik akış + detail_ref drill-down + Decision Logs sekmesi | UI'da audit satırı → aile kaydına iniş | F/O | — |

### E9 — İş akışı katmanı (CEO Faz 8) — [[WORKFLOW_ENGINE_SPEC]], [[PROJECT_OPERATING_SYSTEM_SPEC]], [[APPROVAL_ENGINE_SPEC]], [[HOLDING_LIBRARY_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E9.1 | Workflow runner (`packages/kernel/src/workflow/`) + step handlers + control fn'ler | WORKFLOW §24 smoke-wf uçtan uca | F/O | — |
| E9.2 | Workflow Settings UI (§6.4'ün 17 kalemi) + koşu geçmişi | 17 kalem denetim listesi UI'da işaretlenir | F/O | — |
| E9.3 | Approval Center genişleme (§21: tam sayfa, karar geçmişi, politika bağı) — mevcut karar yolu KALIR | mevcut approval testleri yeşil + yeni center rotası | F/O | — |
| E9.4 | Project OS: 0023x-b üstüne Command View (§23 19 alan) + health fn | PROJECT_OS §24 komutları | F/O | — |
| E9.5 | Library intake script + katalog UI + grant→profil derleme entegrasyonu | LIBRARY §24: intake raporu + grant→gateway reddi kanıtı | F/O | — |

### E10 — Fable Hook engine (CEO Faz 4) — [[FABLE_5_HOOK_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E10.1 | `packages/hook`: policy yükleyici + pre-task gate + post-task gate + ihlal kaydı | hook testi: policy ihlali → red + decision_log satırı | F/O (policy İÇERİĞİ **F** — E5 ailesi) | — |
| E10.2 | Spawn yoluna bağlama (orchestrator) + hook_version damgası | spawn → agents.hook_version dolu | F/O | — |

### E11 — Cost Intelligence (CEO Faz 8) — [[COST_CONTROL_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E11.1 | `v_cost_breakdown` + Cost sayfası (kırılımlar) + eşik alarmları (`cost` kanalı) | UI'da gün/dept/model kırılımı gerçek cost_ledger verisiyle | F/O | — |

### E12 — Kalan modüller + widget (CEO Faz 6/9) — [[CEO_COMMAND_CENTER_SPEC]] §25/§31

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E12.1 | Kalan §31 sayfaları gerçek veriye bağlanır (Memory, Library detay, Intelligence rayı içerikleri) | rota-başı gerçek sorgu kanıtı; dummy widget 0 | F/O | — |
| E12.2 | Widget sistemi: layout persist `settings_values(scope='ceo_dashboard')` + ekle/kaldır/taşı | layout kaydet → yeni oturum aynı layout | F/O | — |

### E13 — Kabul turu (CEO Faz 10) — [[TEST_STRATEGY]], [[ACCEPTANCE_CRITERIA]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E13.1 | Tam test koşusu (L1-L6) + §38 makine-denetlenebilir maddeler | TEST_STRATEGY §24 komut seti yeşil | F/O | — |
| E13.2 | CEO göz testi oturumu (§37 10 ekran + §38 görsel maddeler) — giriş bilgileri ÖNCEDEN verilir | ⚠ CEO onayı (hiçbir modele devredilemez) | İNSAN | — |

## 5. Devralma noktaları (Opus protokolü — [[BACKUP_PLAN]] §13 tamamlayıcısı)

- **Kural:** Opus, tablodaki ilk `—` adımdan başlar; yarım adım varsa önce kanıt komutunu koşar — geçiyorsa ✓ işler, geçmiyorsa adımı baştan alır.
- **Devredilemez:** E5.2-E5.5 persona yazımı (yetişmeyen "Fable-yazımı bekliyor" listesine), tüm ⛔ kararlar, CEO göz testi.
- **Paralellik (yalnız Opus):** E8 ↔ E9 ↔ E11 blokları bağımsız; E12 hepsinden sonra. Aynı dosyaya iki koldan dokunma yasak.
- **⛔ envanteri (spec'lerden):** agents rename (DATA_MODEL) · kontrol düzlemi servisleştirme (SYS_ARCH §3) · API zarf değişimi (API_CONTRACTS) · EVENT zarf/kanal sınıfı (EVENT_MODEL) · workflow step kind ekleme (WORKFLOW) · KIND_STORE değişimi (MEMORY) · grant yaptırım noktası (LIBRARY) · health formül ağırlıkları (PROJECT_OS) · omurga gevşetme/saklama kısaltma (SECURITY, AUDIT) → hepsi: eldeki en güçlü model + CEO onayı.

## 6-11. Veri modeli / Component / Backend / Frontend / API / Event

Bu dosya sıralama katmanıdır; teknik normlar ilgili spec'lerde (her adımda referanslı). Yeni norm getirmez — çelişkide spec kazanır, sıra burada kazanır.

## 12-19. İlişkiler / Yetki / Logging / Audit / Security / Error / Retry / Fallback

Yürütme sırasında geçerli çapraz kurallar: evidence-before-done (her adım) · gitleaks her commit · dalga/blok = atomik commit · Broadcast yasağı yok ama postgres_changes yasak · hata durumunda adım kapatılmaz, kanıt komutu geçene kadar açık kalır · Fable penceresinde subagent yasağı sürer.

## 20. Test planı / 21. Acceptance criteria

Adım-içi kanıt komutları = birinci savunma hattı; E13 tam tur = kapanış. Ürün kabulü [[ACCEPTANCE_CRITERIA]] normatif.

## 22. Migration planı / 23. Rollback planı

Migration sırası E4 tablosunda (DATA_MODEL §20 uyumlu). Rollback: blok commit'i revert + migration `-- ROLLBACK:` blokları — tam prosedür [[RECOVERY_AND_ROLLBACK_PLAN]].

## 24. Uygulama sırası (özet zinciri)

E1→E2→E3→E4→(E5 Fable-only paralel)→E6→E7→E8→E9→E10→E11→E12→E13. İlerleme işareti bu dosyada; her ✓ commit mesajında adım ID'si taşır (`feat(E4.1): ...`).

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: korpus 31/31 (bu dosya dahil) commit'li; design bundle canlı; STACK.md sürüm tablosu (yeni paket eklemeden önce okunur — sert kural).
- Risk özeti [[RISK_REGISTER]]; bu dosyaya özgü: adım tablosu güncellenmeden iş yapmak = ilerleme kaybı (kural: iş biter → tablo işlenir → commit; ikisi aynı commit'te).
- Edge: 12'si gecesi yarım adım → kanıt komutu geçmeyen adım ✓ İŞLENMEZ, Opus baştan alır; iki session çakışması (CEO iki terminal) → tek yazar kuralı, ikinci session salt-okunur devam.

## Done definition (bu spec)

27 başlık ✓ · 13 blok × adım tablosu (dosya+kanıt+model+durum kolonlu) ✓ · CEO Faz eşlemesi blok başlıklarında ✓ · Fable-only + ⛔ envanteri + devralma kuralları ✓ · paralellik haritası (Opus) ✓ · canlı-ilerleme sözleşmesi (✓ bu dosyaya işlenir) ✓
