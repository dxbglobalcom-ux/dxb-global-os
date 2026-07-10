# MASTER_PLAN — DXB GLOBAL AI-NATIVE HOLDING OS

> Korpus omurgası. Diğer 30 spec bu dosyanın çocuklarıdır; çelişkide sıra: CEO direktifi > bu dosya > modül spec'i.
> Yazar: Fable 5, bizzat. Kaynak: [[00-CEO-DIRECTIVE-BEKLENTILER]] + bağlayıcı sözleşme (2026-07-10).

---

## 1. PROJENİN DOĞRU TANIMI (direktif madde 1 — birebir hüküm)

Bu proje bir admin panel, proje takip dashboard'u, approval ekranı, task manager veya startup SaaS paneli DEĞİLDİR.

Bu proje **DXB GLOBAL AI-NATIVE HOLDING OPERATING SYSTEM**'dir: bütün holdingin — şirketler, departmanlar, müdürler, uzman AI çalışanları, alt ajanlar, projeler, görevler, modeller, maliyetler, kararlar, approval'lar, workflow'lar, skill'ler, plugin'ler, bilgi kaynakları, memory yapıları, hatalar/riskler, denetim kayıtları, arka plan aktiviteleri — **tek merkezden görülüp, incelenip, değiştirilip, kontrol edildiği** executive command platformu.

İki eşit yarısı vardır:

1. **Çalışan şirket** (mevcut çekirdek OS): kernel, kuyruk, onay motoru, outbox, memory, MCP gateway — KALIR, genişler.
2. **Yöneten kokpit** (yeni kontrol düzlemi): Executive Command Center + org/HR/settings/observability — SIFIRDAN, direktif §§1-39.

Çekirdek ilke değişmedi: **anti-baby-sitting** — CEO niyeti bir kez söyler, şirket uçtan uca otonom yürütür; sert onay kapısı yalnız dışa dönük aksiyonlarda (madde 4/B7b: para-ÇIKIŞI + outbox kapısı KALIR; güvenlik sertleştirme DURUR, yeni bürokrasi açılmaz).

## 2. HÜKÜM VE STRATEJİ

- **Plan-first:** Bu korpus (31 spec) %100 bitmeden execution başlamaz. Korpus, executor-bağımsız detayda yazılır: her adımda dosya yolu, içerik kontratı, "çalıştır → şu çıktıyı gör" doğrulaması — Opus 4.8 duraksamadan devralabilir; ama korpus bitince birincil uygulayıcı YİNE FABLE'dır (12 Temmuz son geceye kadar).
- **Deadline:** 12 Temmuz 2026 = Fable erişiminin son günü. Erken bitirme hedefi; uyku/erteleme yasak. 12'sine yetişmeyen kapsam BACKUP_PLAN protokolüne düşer.
- **Model zinciri (v6, CEO kesin):** Fable bizzat → en kötü ihtimal Opus 4.8. **Sonnet DEFEDİLDİ** (hiçbir rol). Haiku yasak. Direktif madde 18'deki "Opus ve Sonnet" ifadesi CEO tarafından daraltıldı: sadece Opus.
- **Öncelik:** Outleteuro DEĞİL — her şey bitince İLK PİLOT çalışma (CEO Faz 11). **Tanım (CEO sözlü düzeltmesi, 2026-07-10 ~20:45):** Outleteuro, şirketin MEVCUT e-ticaret sitesidir (WooCommerce/WordPress üzerinde yapılmış; kalitesi düşük). Holding OS tamamlanınca holdingin uzmanları önce bu siteyi MÜKEMMELLEŞTİRİR, sonra tam otonom işletmeye alır: alışlar + satışlar dahil tam otonom mağaza. Bu aşamada Outleteuro, holdingden doğan AYRI bir alt-OS (spawn) şirket olur. Önceki "holdingin yöneteceği ilk şirket projesi" ifadesi bu tanımla düzeltilmiştir.

## 3. KANITLI VARLIK ENVANTERİ (ne var — mevcut-durum eşlemesi)

Kanıt tabanı: repo durumu 2026-07-10, commit `3744db8` sonrası. Doğrulama komutları her satırda.

### 3.1 Çekirdek OS katmanı — KALIR

| Varlık | İçerik | Kanıt komutu → beklenen |
|--------|--------|------------------------|
| Postgres şeması (19 migration) | 18 tablo: `agents, approvals, audit_log, budget_state, cost_ledger, crm_clients, crm_contacts, crm_deals, crm_requests, departments, intents, memory_embeddings, memory_index, outbox, routing_rules, task_events, tasks, tool_pins` | `ls db/migrations \| wc -l` → 19; `grep -rhoiE "create table [a-z_]+" db \| sort -u \| wc -l` → 18 |
| `packages/kernel` | İntent→plan→task döngüsü, pg-boss üstünde | `ls packages/kernel/src` → dosyalar |
| `packages/orchestrator` | Görev yönlendirme + routing_rules tüketimi | `ls packages/orchestrator` |
| `packages/outbox-executor` | Dışa dönük aksiyonların TEK çıkış kapısı (onay sonrası) | `ls packages/outbox-executor` |
| `packages/memory-router` | 4-store kompozisyon (06-02 spike 20/20) | `ls packages/memory-router` |
| `packages/gateway` + `packages/dxb-mcp` | MCP gateway + 8 DXB MCP, departman-başı least-privilege profiller (14 profil) | `ls packages/gateway packages/dxb-mcp` |
| `packages/shared` | Zod şemaları, ortak tipler | `ls packages/shared` |
| LiteLLM proxy yapılandırması | Departman-başı virtual key + bütçe hard-stop | `.planning/research/STACK.md` Stack Patterns |
| Hetzner erişimi | hcloud context `dxb`; Storage Box `dxb-backup-1` + subaccount CANLI | `hcloud context list` → dxb |

### 3.2 Ürün/arayüz katmanı — DEĞİŞİR

| Varlık | Durum | Hüküm |
|--------|-------|-------|
| `apps/dashboard` (Next.js 16.2, React 19) | Faz 8 MACHINE-COMPLETE; ana kokpit CEO tarafından RET (yüzeysel) | Shell + sayfalar SIFIRDAN (CEO_COMMAND_CENTER_SPEC); altyapı (auth, Supabase SSR, i18n çifti EN birincil/TR tam, Broadcast) KALIR |
| Login "Golden Threshold" | CEO: "güzel, kalabilir" | KALIR + 3D hover upgrade (spec'e girer) |
| Approvals okunur payload (`3744db8`) | Canlı | KALIR; APPROVAL_ENGINE_SPEC genişletir (alan-haritası dışı payload alanları asla gizlenmez — ham JSON audit disclosure'da her zaman erişilir) |
| `apps/jarvis` + Speaches | Faz 9 wave 1 ✓ (09-01, 09-02); 09-03..05 DURDU | Ertelendi — kayıtlı sapma; korpus sonrası roadmap re-baseline |

### 3.3 Bilgi/yönetişim katmanı — HAMMADDE

| Varlık | Durum | Kullanım |
|--------|-------|----------|
| 153 legacy persona (11 dizin) | read-only hammadde | v2 Fable yazımı zorunlu (EMPLOYEE_PERSONA_STANDARD); v2'siz departman aktive edilemez |
| `.planning/MASTER-PLAN.md` + master-plan/PHASE-01..11 | CEO: yüzeysel, RET (1299 satır/11 faz) | Bu korpus onun yerine geçer; eski dosya tarihsel referans |
| Study cards (design-bundle, mcp-gateway, payments) | ⛔ Fable PASS'li | Dalga 2+ spec'lerinde kaynak |
| Governance mirror `.planning/governance/` | Canlı | Korpus kurallarıyla senkron tutulur |

## 4. GAP ANALİZİ (direktif istekleri ↔ mevcut gerçek)

| # | Direktif istediği | Mevcut durum | Boşluk sınıfı | Kapatan spec |
|---|-------------------|--------------|---------------|--------------|
| G1 | Executive Command Center (§§1-39: katmanlı kompozisyon, 26+ sayfa, widget sistemi) | 5-6 sayfalık kokpit; RET | **SIFIRDAN** | CEO_COMMAND_CENTER_SPEC, DESIGN_SYSTEM |
| G2 | Holding→Company→Dept→Director→Specialist→Agent→Sub-agent hiyerarşisi + interaktif org graph + drag-drop | `departments` + `agents` (2 seviye); companies/directors/hiyerarşi YOK | **YENİ şema + motor** | ORGANIZATION_ENGINE_SPEC, DATA_MODEL |
| G3 | HR Operating System (yaşam döngüsü: oluştur→eğit→değerlendir→terfi→arşivle) | YOK (personas dizini statik dosya) | **YENİ** | HR_OPERATING_SYSTEM_SPEC, EMPLOYEE_PERSONA_STANDARD |
| G4 | Fable 5 Intelligence & Discipline Hook (runtime policy + pre/post-task validation + quality gates) | Governance kuralları memory/doc'ta; runtime enforcement kısmi (hooks.workflow_guard) | **YENİ runtime katmanı** | FABLE_5_HOOK_SPEC |
| G5 | Settings = tam kontrol merkezi (orkestratör/model/çalışan/bütçe/approval politikaları CEO-değiştirilebilir) | YOK (config dosyaları + memory; UI'dan değişmez) | **YENİ** | SETTINGS_AND_CONTROL_SPEC, MODEL_ROUTING_SPEC |
| G6 | Full observability (agent/decision/tool/file/cost/system-health logları drill-down'lu) | Kısmi: `task_events`, `audit_log`, `cost_ledger` var; decision/tool/file katmanları ve UI YOK | **GENİŞLER** | OBSERVABILITY_SPEC, AUDIT_AND_LOGGING_SPEC |
| G7 | Approval Center (tam sayfa, alternatifler, karar geçmişi, politika değişimi) | Approval listesi + okunur payload var; center YOK | **GENİŞLER** | APPROVAL_ENGINE_SPEC |
| G8 | Cost & Token Intelligence (11 kırılım, forecast, anomali) | `cost_ledger` + `budget_state` + LiteLLM; UI/kırılım YOK | **GENİŞLER** | COST_CONTROL_SPEC |
| G9 | Holding Library (skills/plugins/tools/personas/SOP envanteri, erişim yönetimi) | Dağınık (skills dizinleri, study cards); merkezi kayıt YOK | **YENİ** | HOLDING_LIBRARY_SPEC |
| G10 | Project OS (proje command view, milestone, bağımlılık, health) | `tasks`/`intents` var; proje varlığı YOK | **YENİ** | PROJECT_OPERATING_SYSTEM_SPEC |
| G11 | Workflow engine (CEO-düzenlenebilir workflow'lar, trigger, retry/fallback adımları) | pg-boss job'ları kod-tanımlı; CEO-görünür workflow varlığı YOK | **YENİ** | WORKFLOW_ENGINE_SPEC |
| G12 | Widget sistemi (ekle/kaldır/taşı/boyutlandır/çoklu dashboard) | YOK | **YENİF** | CEO_COMMAND_CENTER_SPEC §25 |

Sınıf dağılımı dürüst özet: 12 boşluğun 7'si YENİ sistem, 3'ü GENİŞLEME, 2'si SIFIRDAN yeniden yazım. Bu, "dashboard'u güzelleştir" işi değil, kontrol düzlemi inşasıdır — direktifin kendi tespitiyle uyumlu.

## 5. WORKSTREAM'LER

Her workstream = spec seti + execution paketi. Bağımlılık oku: üsttekiler alttakileri besler.

| WS | Ad | Spec'ler | Execution çekirdeği |
|----|----|----------|---------------------|
| WS-A | Veri omurgası | DATA_MODEL, EVENT_MODEL, API_CONTRACTS | Org/HR/settings/project/library tabloları + RLS + Broadcast; migration 0020+ |
| WS-B | Kontrol düzlemi UI | CEO_COMMAND_CENTER_SPEC, DESIGN_SYSTEM | Design tokens → shell → Executive Overview → modül sayfaları (26+) |
| WS-C | Org + HR motoru | ORGANIZATION_ENGINE, HR_OS, EMPLOYEE_PERSONA_STANDARD, PERMISSION_MODEL | Org graph API + HR yaşam döngüsü + persona v2 fabrikası |
| WS-D | Fable Hook + orkestrasyon | FABLE_5_HOOK_SPEC, AGENT_ORCHESTRATION, MODEL_ROUTING | Policy engine + pre/post-task gates + model routing tablo-güdümlü |
| WS-E | Görünürlük | OBSERVABILITY, AUDIT_AND_LOGGING, COST_CONTROL | Log katmanları + Live Operations + Cost Intelligence |
| WS-F | Karar/iş akışı | APPROVAL_ENGINE, WORKFLOW_ENGINE, PROJECT_OS, SETTINGS_AND_CONTROL | Approval center + workflow varlığı + settings mutasyon API'si |
| WS-G | Bilgi | MEMORY_ARCHITECTURE, HOLDING_LIBRARY | Library kayıt sistemi + memory erişim haritası |
| WS-H | Teslimat güvencesi | TEST_STRATEGY, ACCEPTANCE_CRITERIA, RISK_REGISTER, SECURITY_MODEL, RECOVERY_AND_ROLLBACK, IMPLEMENTATION_ROADMAP, BACKUP_PLAN | Test altyapısı + kabul kapıları + devir protokolleri |

## 6. CEO FAZ 1-11 ↔ MEVCUT ROADMAP MUTABAKATI

İki ayrı "11 faz" var; karışmasın. **Mevcut roadmap** (altyapı fazları 1-11, 7'si tamam) inşaatın kronolojisiydi. **CEO direktifi madde 17 fazları** holding OS'un İÇERİK sırasıdır. Mutabakat:

| CEO Fazı | İçerik | Mevcut karşılık | Hüküm |
|----------|--------|-----------------|-------|
| 1 | Mimari + plan + çekirdek | Fazlar 1-7 (secrets→monorepo→şema→rails→kernel→memory→VPS/MCP) | BÜYÜK ORANDA TAMAM — bu korpus "plan" bacağını kapatır |
| 2 | Holding org yapısı | Karşılık YOK | YENİ (WS-C) |
| 3 | Orkestratör + müdürler + çalışan sistemi | Kısmi: orchestrator paketi + agents tablosu | GENİŞLER (WS-C/D) |
| 4 | Fable 5 Hook | Karşılık YOK (governance doc'ta) | YENİ (WS-D) |
| 5 | HR OS | Karşılık YOK | YENİ (WS-C) |
| 6 | CEO Command Center + full observability | Faz 8 (RET edilen kokpit) | SIFIRDAN (WS-B/E) |
| 7 | Settings + model routing + manuel kontrol | Karşılık YOK | YENİ (WS-D/F) |
| 8 | Workflow + approval + cost + audit | Kısmi: approvals/outbox/cost_ledger/audit_log | GENİŞLER (WS-E/F) |
| 9 | Library + skills + plugins + memory | Kısmi: memory-router; library YOK | YENİ+GENİŞLER (WS-G) |
| 10 | Test + kalite + güvenlik + production readiness | Kısmi: faz-başı verification vardı | GENİŞLER (WS-H); güvenlik SERTLEŞTİRME ertelenmiş sicilde |
| 11 | Outleteuro pilotu: mevcut WooCommerce/WordPress e-ticaret sitesi holding uzmanlarınca mükemmelleştirilir, tam otonom mağazaya (alış+satış) dönüştürülür, AYRI bir alt-OS spawn şirket olarak doğar (CEO sözlü düzeltmesi 2026-07-10) | Roadmap Faz 11 (satış motoru) ile örtüşür | SONRA — holding bitmeden başlamaz; her şey bitince İLK PİLOT |
| — | JARVIS voice (mevcut Faz 9) | CEO fazlarında görünmüyor | Ertelendi (09-03..05); korpus sonrası re-baseline'da yeri CEO'ya sorulmaz, IMPLEMENTATION_ROADMAP'te "sistem sonrası" dilimine yazılır — kayıtlı uyarlama U4 |

## 7. DEADLINE STRATEJİSİ (12 Temmuz)

**Pencere 1 — Korpus (şimdi → en erken bitiş):** 5 dalga, dalga=atomik commit. Kesintide INDEX durum tablosu + STATE kaldığı satırı gösterir.

**Pencere 2 — Fable execution (korpus bitişi → 12 Temmuz gece):** IMPLEMENTATION_ROADMAP sırası: (1) DESIGN_SYSTEM tokens + shell, (2) Executive Overview + Live Operations (gerçek DB verisi, sahte metrik yasak), (3) WS-A migration'ları, (4) persona v2: standard → orkestratör → müdürler → HR ilk oluşumu (CEO emri: bizzat Fable), (5) settings mutasyon yolu, (6) kalan modüller roadmap sırasıyla. Her adım kanıt komutuyla kapanır.

**Pencere 3 — Opus devri (Fable erişimi bitince):** BACKUP_PLAN devir protokolü: Opus, IMPLEMENTATION_ROADMAP'teki işaretli devralma noktasından sürer; ⛔ işaretli kritik-karar adımlarında "eldeki en güçlü model + CEO onayı" protokolü; verdict kapıları eldeki en güçlü modelde.

## 8. MODEL MATRİSİ (v6 — bu korpusta bağlayıcı)

| İş | Model | Not |
|----|-------|-----|
| Korpus yazımı (31 spec, her satır) | **Fable, bizzat, inline** | Devir yok; subagent yok |
| Execution P2 penceresi | **Fable, bizzat** | Kritik bölümler zaten Fable'da |
| Execution P3 penceresi (12'den sonra) | **Opus 4.8** | Roadmap adım adım; mimariyi DEĞİŞTİREMEZ |
| Sonnet | **YASAK — defedildi** | Hiçbir rol (araştırma/checker dahil) |
| Haiku | **YASAK** | — |
| Kritik karar (⛔ işaretli adımlar) | Eldeki en güçlü model + CEO onayı | BACKUP_PLAN protokolü |

## 9. RİSKLER (omurga seviyesi — tam sicil RISK_REGISTER'da)

| Risk | Etki | Karşılık |
|------|------|----------|
| Korpus 12'sine yetişir, execution yetişmez | Kokpit yarım | P2 sırası değer-öncelikli (shell+overview önce); BACKUP_PLAN minimum kritik kapsam |
| Session kesintisi/safeguard duraklaması | Akış kırılır | Dalga=atomik commit + INDEX canlı durum + açılış protokolü; kayıp sıfır |
| Kontrol düzlemi şema genişlemesi çekirdeği bozar | Regresyon | Yeni tablolar ekleme-yönlü (mevcut 18 tabloya breaking change yok — DATA_MODEL kuralı) |
| Opus devrinde bağlam kaybı | Kalite düşer | Spec'lerde adım-başı doğrulama komutu + devralma noktaları; korpus executor-bağımsız |
| 8GB VPS RAM tavanı | Servis çakışması | STACK.md fallback planı; yeni servis eklemeden önce RAM bütçesi kontrolü |

## 10. DONE DEFINITION (korpus için)

- 31 spec + INDEX + sanitized direktif diskte: `ls HOLDING-OS-MASTER-PLAN/ | wc -l` → 33
- Her spec §14 şablonu tam (27 başlık), doğrulama komutlu, done-definition'lı — INDEX tablosunda ✓
- Şifre/credential hiçbir dosyada: `git grep -c "PAROLA\|PASSWORD" HOLDING-OS-MASTER-PLAN` → 0 eşleşme (sanitize kanıtı)
- Dalga-başı atomik commit'ler git log'da
- STATE.md korpus kapanışı + CEO raporu (✓/⚠ tablo) verilmiş
- Execution'a geçiş: ayrı onay İSTENMEZ — sözleşme Adım 2 bu onayı içerir
