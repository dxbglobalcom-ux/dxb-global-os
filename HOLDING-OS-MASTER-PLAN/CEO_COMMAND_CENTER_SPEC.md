# CEO_COMMAND_CENTER_SPEC — DXB GLOBAL EXECUTIVE COMMAND CENTER

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[DESIGN_SYSTEM]] (görsel kontrat), [[SETTINGS_AND_CONTROL_SPEC]], [[OBSERVABILITY_SPEC]], [[APPROVAL_ENGINE_SPEC]], [[COST_CONTROL_SPEC]], [[MODEL_ROUTING_SPEC]]
> Direktif kaynağı: §§1-39 (tamamı) + madde 1-5. §14 şablonu: 27 başlık tam. + **CEO direktifi 2026-07-12** (ajan beyni dashboard'dan değiştirilebilir — bu spec'te §5/§6/§7 yüzeyleri, normatif kurallar [[MODEL_ROUTING_SPEC]] §4b).
> Hüküm cümlesi (§39): "Bu bir dashboard değil. Bu, küresel bir AI holdinginin işletim sistemidir."

## 1. Amaç

CEO'nun holdingin TAMAMINI — şirket/departman/müdür/çalışan/ajan, proje/görev/workflow, model/maliyet/token, karar/approval/risk/audit — tek merkezden **birkaç saniyede kavradığı** (madde 2A) ve **istediği anda en küçük ayrıntıya indiği** (madde 2B, Infinite Drill-Down) executive command platformu. Pasif izleme ekranı DEĞİL: her görünüm CEO Control Mode ile değiştirilebilir (Total Control, §2.4). Mevcut dashboard'un shell'i ve modül sayfaları SIFIRDAN; login KALIR + 3D hover upgrade (§39 CEO notu).

## 2. Gereksinimler

- R1. Dört felsefe aynı anda (§2): Executive Luxury · Operational Depth · Information Density · Total Control. Biri diğerini ezemez — yoğunluk lüksü, lüks işlevi gizleyemez (§38 son üç madde).
- R2. Her özet değer tıklanabilir ve ilgili detaya açılır (madde 2B örnek seti: aktif çalışan, proje, bekleyen görev, kritik risk, günlük maliyet, haftalık token, başarısız workflow, bekleyen approval). "Özet var detay yok" = RET.
- R3. Bütün veriler GERÇEK DB sorgularından (§35: sahte metrik, süs data, dummy widget yasak). Her widget'ın bu spec'te tanımlı bir view/tablo kaynağı vardır; kaynağı olmayan widget merge edilemez.
- R4. Canlılık Broadcast-only (SYSTEM_ARCHITECTURE R4): `ops:live`, `approvals`, `alerts`, `settings` kanalları.
- R5. Desktop-first: 1) 34" ultrawide workstation 2) desktop 3) laptop 4) tablet 5) mobil monitoring (§29 + A1). TV modu (salt-okunur duvar ekranı) A1 gereği birinci sınıf.
- R6. İki dil: EN birincil, TR tam ikincil (A2) — her yeni string iki dilde doğar (mevcut i18n altyapısı KALIR).
- R7. CEO Control Mode read-only kipten görsel olarak net ayrılır (§17) ama korkutmaz; güvenlik sınırı UI'da değil DB'dedir (SYSTEM_ARCHITECTURE §13).
- R8. Widget sistemi tam özelleştirilebilir (§25): ekle/kaldır/taşı/boyutlandır/çoklu dashboard/kaydet — layout `settings_values(scope='ceo_dashboard')` içinde, localStorage değil (çoklu ekran + TV aynı layout'u çeker).
- R9. §35 yasak listesi bu spec'in kabul filtresidir; §38'in 27 kabul maddesi ACCEPTANCE_CRITERIA'ya (D5) birebir taşınır.

## 3. Mimari — beş katmanlı kompozisyon (§9)

```
┌─ ÜST: Global Command Bar ────────────────────────────────────────────┐
│ brand · global search · command palette (⌘K) · operating mode        │
│ system health · active agents · critical alerts · tarih/saat         │
│ CEO profili · emergency: Global Pause / Maintenance / quick settings │
├─ SOL ──────────┬─ ORTA: Command Canvas ─────────┬─ SAĞ ──────────────┤
│ 7 grup nav     │ Route'a göre modül içeriği     │ Intelligence Ray:  │
│ (§10 listesi)  │ Executive Overview = widget    │ approval özeti     │
│ daraltılabilir │ grid (§25); diğer sayfalar     │ critical alerts    │
│ (ikon moduna)  │ modül şablonları               │ live ticker        │
│                │                                │ contextual controls│
├─ ALT/FLOATING: Agent Dock ───────────────────────────────────────────┤
│ aktif ajan rozetleri (durum+model+süre) · hızlı komut · dock gizlenir│
└──────────────────────────────────────────────────────────────────────┘
```

- Konum: `apps/dashboard/src/app/(command)/` route group — shell layout tek dosyada (`layout.tsx`), beş katman slot olarak.
- Sağ ray ve dock her sayfada aynı kalır (bağlam farkındalıklı içerik); orta canvas route'la değişir.
- TV modu: `?mode=tv` → nav+dock gizli, canvas tam ekran, Control Mode kilitli kapalı, otomatik döngü (Overview→Live Ops→Health, 30sn).
- ⛔ mimari-kritik: shell TEK'tir — §31'deki 26+ sayfa ayrı template DEĞİL, aynı shell'in canvas'ında modül. Sayfa-başı özel layout açmak ihlal (§31 "tek premium ürün ailesi").

## 4. Veri modeli (okuma yüzeyi)

Sayfa-başı tek round-trip hedefi (SYSTEM_ARCHITECTURE §8) → her ana görünümün arkasında bir `v_*` SQL view'ı vardır. Yeni view ailesi (migration 0022x observability + 0025 dashboard view'ları — [[DATA_MODEL]] ailelerine ek):

| View | Besler | Kaynak tablolar |
|------|--------|-----------------|
| `v_holding_overview` | Executive Overview üst şeridi + Holding Health | companies, org_units, employees, projects, workflows, approvals, cost_ledger, task_events |
| `v_holding_health` | Health panel skor + açıklama katmanı | v_holding_overview + agent_runs (hata oranı) + model_catalog (availability) + budget durumu |
| `v_live_operations` | Live Ops stream/grid | agent_runs ⋈ tasks ⋈ employees ⋈ tool_calls (son N) |
| `v_org_graph` | Org Intelligence node+edge seti | org_units, employees (parent_id), + lens join'leri (maliyet/performans/risk/workload) |
| `v_employee_card` | AI Employee Card + detay sayfası | employees ⋈ personas ⋈ employee_records ⋈ agent_runs özeti ⋈ cost_ledger özeti |
| `v_global_search` | Command bar global search | UNION: employees, org_units, companies, projects, tasks, workflows, approvals, decision_log, library_items, audit_log |
| `v_cost_summary` | Overview maliyet widget'ları | cost_ledger gün/hafta/ay aggregate (detay COST_CONTROL_SPEC) |
| `v_alerts_active` | Critical alerts panel + sağ ray | alerts (yeni tablo, OBSERVABILITY_SPEC) + approvals(risk=critical) |

Kural: view'lar sadece OKUMA; hiçbir dashboard bileşeni tabloya doğrudan yazmaz (yazım §6).

## 5. Component yapısı

§33 zorunlu component library'nin sahibi [[DESIGN_SYSTEM]] (state matrisi orada). Bu spec sayfa-kompozisyon sahipliğini tanımlar:

| Bileşen | Etiket | Kullanıldığı yer |
|---------|--------|------------------|
| `CommandShell` (5 katman) | SIFIRDAN | tüm (command) route'ları |
| `CommandBar` + `GlobalSearch` + `CommandPalette` | SIFIRDAN | üst katman |
| `SideNav` (7 grup, collapse) | SIFIRDAN | sol katman |
| `IntelligenceRail` (approval/alert/ticker) | SIFIRDAN | sağ katman |
| `AgentDock` | SIFIRDAN | alt katman |
| `WidgetGrid` + `WidgetFrame` + 17 widget (§25 listesi) | SIFIRDAN | Executive Overview + özel dashboard'lar |
| `HoldingHealthPanel` (skor + explain drawer) | SIFIRDAN | Overview ana panel |
| `LiveOpsPanel` (stream/grid/timeline/process-graph görünümleri) | SIFIRDAN | Overview + Live Operations sayfası |
| `OrgGraph` (7 lens, drag-drop) | SIFIRDAN | Holding Structure |
| `EmployeeCard` + `EmployeeCommandPage` | SIFIRDAN | Employees + org node tıklaması; **beyin (model) rozeti zorunlu** — Control Mode'da rozet tıklaması model picker MutationDrawer açar (banned modeller listede YOK, mechanical_only etiketli; kurallar [[MODEL_ROUTING_SPEC]] §4b) |
| `ProjectCommandView` | SIFIRDAN | Projects detayı (§23) |
| `ControlModeSwitch` + `MutationDrawer` | SIFIRDAN | Control Mode her mutasyon yüzeyi |
| Login sahnesi "Golden Threshold" | KALIR+DEĞİŞİR | 3D hover parallax upgrade (§39 notu) |
| Approvals okunur-payload bileşenleri | KALIR | Approval Center içine taşınır (APPROVAL_ENGINE_SPEC) |

## 6. Backend yapısı

- Okuma: RSC'de `@supabase/ssr` ile `v_*` view'ları; client bileşenlere props. Ağır sayfalarda `Promise.all` ile view + Broadcast snapshot tek geçiş.
- Yazma (Control Mode mutasyonları): `/api/control/{alan}` route handler → Zod validate → `SECURITY DEFINER` fn → audit + Broadcast (SYSTEM_ARCHITECTURE §6 tek desen). Dashboard'a özel handler alanları: `org` (taşı/bağla/askıya al), `employees` (oluştur/deaktive/model değiştir — `set_model` → `fn_update_agent_brain`: katalog+banned+mechanical_only doğrulaması, audit + decision_log `routing_change` + `settings` Broadcast + undo `change_id`; CEO direktifi 2026-07-12, normatif [[MODEL_ROUTING_SPEC]] §4b), `workflows` (durdur/başlat/yeniden dene), `settings` (SETTINGS_AND_CONTROL_SPEC'e devir), `layout` (widget layout kaydet).
- Command palette aksiyonları ayrı endpoint AÇMAZ — mevcut control handler'larına komut eşler (aksiyon kataloğu §8'de).

## 7. Frontend yapısı (route ağacı = bilgi mimarisi)

§10 yedi grup → §31 sayfa listesi birebir eşleme. Route'lar `(command)` altında:

| Grup | Sayfalar (route) |
|------|------------------|
| Command | `/overview` · `/live` · `/intelligence` · `/approvals` · `/alerts` · `/voice` (R3.1, VOICE_INTERACTION_SPEC §7 — U4 refinement) |
| Organization | `/org` (Holding Structure graph) · `/org/companies` · `/org/departments` · `/org/directors` · `/org/employees` · `/org/hr` |
| Operations | `/ops/projects` · `/ops/workflows` · `/ops/tasks` · `/ops/automations` · `/ops/runtime` |
| Intelligence | `/ai/models` · `/ai/orchestration` · `/ai/memory` · `/ai/knowledge` · `/ai/library` · `/ai/skills` · `/ai/plugins` · `/ai/mcp` (U8) · `/revenue` · `/revenue/objectives` · `/revenue/opportunities` · `/revenue/portfolio` (R1.4, REVENUE_ENGINE_SPEC §7) |
| Governance | `/gov/audit` · `/gov/decisions` · `/gov/risks` · `/gov/policies` · `/gov/permissions` · `/gov/security` |
| Finance & Resources | `/fin/pnl` (CEO direktifi 2026-07-12: kazanç maliyetin önünde) · `/fin/costs` · `/fin/tokens` · `/fin/budgets` · `/fin/providers` · `/fin/capacity` |
| System | `/sys/settings` · `/sys/integrations` · `/sys/health` · `/sys/logs` · `/sys/backups` |

> Tablo senkron kaydı 2026-07-17 (R3.1 oturumu): U8 `/ai/mcp`, R1.4 revenue rotaları ve `/fin/pnl` kayıtlı eklemeleri nav'da canlıydı ama bu tabloya işlenmemişti (ölçüldü: `command-nav.ts` ↔ §7 diff). Tek kaynak `src/config/command-nav.ts`; tablo aynı commit'te eşitlendi, `/voice` eklendi.

- RSC-first; client adaları: OrgGraph, WidgetGrid, CommandPalette, LiveOps stream, chart etkileşimleri.
- Detay route deseni: `/org/employees/[id]`, `/ops/projects/[id]`, `/ops/tasks/[id]`, `/gov/decisions/[id]`, `/approvals/[id]` — drill-down hedefleri (§ aşağıda).
- Eski dashboard route'ları: yeni shell yanında `(legacy)` group'ta yaşar, modül parite kazandıkça redirect — bkz. §22 Migration.

### Infinite Drill-Down haritası (madde 2B — normatif)

| Özet değer (nerede) | Tık hedefi | Taşınan bağlam |
|----------------------|-----------|----------------|
| Aktif çalışan sayısı (Overview) | `/org/employees?status=active` | filtre önceden uygulanmış |
| Aktif proje sayısı | `/ops/projects?status=active` | — |
| Bekleyen görev | `/ops/tasks?state=pending` | — |
| Kritik risk | `/gov/risks?level=critical` | — |
| Bugünkü maliyet | `/fin/costs?range=today` | tarih aralığı |
| Haftalık token | `/fin/tokens?range=week` | — |
| Başarısız workflow | `/ops/workflows?state=failed&range=24h` | — |
| Bekleyen approval | `/approvals?state=pending` | — |
| Health alt-skoru (Health panel) | explain drawer → ilgili modül sayfası | skor bileşeni |
| Live Ops satırı | `/ops/tasks/[id]` → tool/file/karar sekmeleri | agent_run id |
| Org node | `/org/employees/[id]` (EmployeeCommandPage) | node id |
| Cost chart segmenti | `/fin/costs?dim={department\|model\|proje}&id=…` | segment |
| Alert kartı | kaynak modül sayfası (etkilenen alan) | alert id |
| Audit satırı | `/gov/audit/[id]` tam kayıt + ilgili değişiklik diff'i | — |
| Beyin (model) rozeti (EmployeeCard/EmployeeCommandPage) | read-only: `/ai/models?highlight={model}` · Control Mode: model picker MutationDrawer ([[MODEL_ROUTING_SPEC]] §4b) | employee id + model id |

Kural: bu tabloya yeni özet eklenirse hedefi de eklenir; hedefsiz özet render EDİLMEZ (lint-level kural: `WidgetFrame` `drillHref` prop'u zorunlu).

## 8. API'ler

- Reads: PostgREST/view (yukarıda). Mutations: `/api/control/*` — idempotency key zorunlu, yanıt `{ok, change_id, affected[]}` (SYSTEM_ARCHITECTURE §8).
- Command palette aksiyon kataloğu (§11 örnekleri → eşleme): "X'in modelini değiştir" → `POST /api/control/employees {op:'set_model'}` · "son 24h başarısız workflow" → `/ops/workflows?state=failed&range=24h` (navigasyon) · "en çok token kullanan çalışanlar" → `/fin/tokens?dim=employee&sort=desc` · "projeyi durdur" → `POST /api/control/workflows {op:'pause_project'}` (approval kuralına tabi) · "yeni AI çalışanı oluştur" → HR wizard `/org/hr/new`.
- Global search: `GET /api/search?q=` → `v_global_search` (entity tipi + skor + href döner; 15 varlık tipi madde §11 listesi).

## 9. Event yapısı

| Kanal | Yayıncı | Dashboard tüketimi |
|-------|---------|--------------------|
| `ops:live` | agent_runs/tool_calls trigger'ları (1sn toplu, debounce) | AgentDock, LiveOpsPanel, Overview aktif-ajan sayacı |
| `approvals` | mevcut trigger (0013, KALIR) | sağ ray özeti, Approval Center rozeti |
| `alerts` | alerts insert trigger | CommandBar kritik rozet + sağ ray + `/alerts` |
| `settings` | settings_change_log trigger | açık sayfada "değer değişti" banner + canlı yenile |

Abonelik deseni: kanal-başı TEK subscription shell'de; context ile komponentlere fan-out (SYSTEM_ARCHITECTURE §9). Reconnect otomatik; kopukluk >10sn ise CommandBar'da "stale data" göstergesi (sahte canlılık yasak — §35 ruhu).

## 10. State yönetimi

- Sunucu gerçeği tek kaynak. Client state: seçili org lens, filtreler, drawer açık/kapalı, Control Mode toggle.
- Widget layout + kayıtlı dashboard'lar + default view + widget filtreleri: `settings_values(scope='ceo_dashboard')` JSON (şema: `{dashboards:[{id,name,default,widgets:[{type,x,y,w,h,filters}]}]}`), yazım control seam'den (`/api/control/layout`).
- Control Mode: URL'e YAZILMAZ (paylaşılabilir link read-only kalır); session state + görsel kontrat DESIGN_SYSTEM'de.

## 11. Database tabloları / 12. İlişkiler

Normatif sahip [[DATA_MODEL]] — bu spec ek tablo AÇMAZ; sadece view ailesi (bkz. §4) + `alerts` tablosunun tüketicisidir (tanım OBSERVABILITY_SPEC). Widget→kaynak eşleşme kuralı: §25 listesindeki 17 widget tipinin her biri §4 view'larından birine bağlanır; eşleşme tablosu WidgetRegistry'de kod içinde tek dosyada tutulur (`widgets/registry.ts`) — kaynaksız widget tipi register edilemez.

## 13. Yetkilendirme

- Tek insan: `ceo` rolü. Read-only kip default; Control Mode toggle yalnız görsel kip değiştirir — sunucu HER mutasyonda `ceo` + approval kurallarını yeniden doğrular (madde 2 listesindeki 22 müdahale yetkisinin tamamı control seam'den geçer).
- Para-ÇIKIŞI: dashboard hiçbir yerden outbox'a doğrudan yazamaz; approval akışı APPROVAL_ENGINE_SPEC (B7b DOKUNULMAZ).
- Emergency kontroller (Global Pause / Maintenance Mode): `POST /api/control/system {op:'pause_all'|'maintenance'}` → pg-boss kuyruğu pause + `system_state` settings anahtarı; çift-onay dialog'u (tek tık felaketi edge case'i, §27).

## 14. Logging / 15. Audit

- UI mutasyonlarının tamamı `audit_log`a DB fonksiyonu içinde düşer (uygulama katmanına bırakılmaz); `change_id` yanıtla döner, UI "değişiklik kaydedildi → geri al" toast'unda gösterir.
- Sayfa görüntüleme telemetrisi YOK (tek kullanıcı; gereksiz veri üretimi = token/RAM israfı). Client hataları `console` + `/api/control/client-error` (alerts'e düşer, seviye: informational).

## 16. Security

Madde 4 hükmü: yeni sertleştirme YOK — MFA kapalı, local açık. Mevcut Auth login KALIR (3D hover görsel upgrade güvenlik davranışını değiştirmez). Güvenlik omurgası: control seam + RLS read-policy kopyaları + para-çıkışı kapısı (SYSTEM_ARCHITECTURE §16). Ertelenen kalemler SECURITY_MODEL (D4) siciline.

## 17. Error handling / 18. Retry / 19. Fallback

- Veri hatası: widget kendi çerçevesinde zarif hata state'i gösterir (DESIGN_SYSTEM error state) — sayfa ASLA komple çökmez (widget-level error boundary).
- Mutasyon hatası: MutationDrawer içinde neden + retry; idempotency key aynı kalır (çift uygulama imkânsız).
- Broadcast kopması: son snapshot + "stale" göstergesi; 30sn'de bir sessiz re-subscribe.
- View yavaşlığı (>2sn): iskelet (skeleton) + arka planda tamamlama; spinner enflasyonu yasak (§34).

## 20. Test planı / 21. Acceptance criteria

- Playwright akışları (mevcut altyapı KALIR): (a) login→overview<3sn, (b) overview'daki HER özet değerin tıklanıp doğru filtreli sayfaya inmesi (drill-down haritası üstünden data-driven test), (c) Control Mode toggle→mutasyon→audit satırı+Broadcast yayını, (d) widget ekle/taşı/kaydet→reload→layout korunur, (e) TV modu döngüsü, (f) EmployeeCommandPage beyin değişimi: rozet→picker→onay→audit satırı + `settings` Broadcast + rozet yeni modeli gösterir; negatif kanıt: banned model picker'da görünmez.
- Veri gerçekliği testi: her widget'ın render değeri, kaynağı olan view'a SQL ile sorulup karşılaştırılır (sahte metrik regresyonu).
- §38'in 27 maddesi ACCEPTANCE_CRITERIA'ya (D5) modül-başı kabul olarak taşınır; görsel maddeler CEO göz testine ⚠ UNVERIFIED etiketiyle sunulur (evidence-before-done).

## 22. Migration planı / 23. Rollback planı

- Migration (UI): (1) yeni shell `(command)` altında boş kurulur, login yönlendirmesi legacy'de kalır → (2) modül parite kazandıkça route redirect'i tek satırla açılır → (3) tüm §31 sayfaları geçince `(legacy)` silinir. DB tarafı: sadece view migration'ları (0022x/0025), tablo değişikliği yok → mevcut sisteme dokunmadan geri alınabilir.
- Rollback: redirect satırlarını kaldır = eski dashboard aynen döner; view'lar `DROP VIEW` ile temizlenir (`-- ROLLBACK:` blokları migration içinde). Widget layout verisi settings_values'ta kalır, zarar vermez.

## 24. Uygulama sırası (§36 prensibi + §37 ilk teslim ekranları)

Sıra: DESIGN_SYSTEM tokens → shell (5 katman) → §37'nin 10 ekranı bu sırayla: 1 Executive Overview · 2 Live Operations · 3 Holding Organization Graph · 4 AI Employee Detail · 5 Model Orchestration Settings · 6 HR Employee Creation · 7 Project Command View · 8 Cost & Token Intelligence · 9 Approval Center · 10 Full System Settings. Hepsi high-fidelity, production-ready (§37 hükmü); wireframe teslimi RET.

Adım-başı doğrulama deseni (her ekran için):
```bash
pnpm --filter dashboard build                      # → exit 0, route listede görünür
curl -s localhost:3000/api/search?q=smoke | head   # → JSON entity listesi (search canlı)
psql -c "SELECT count(*) FROM v_holding_overview"  # → 1 satır (view canlı)
# görsel kabul: Playwright screenshot → CEO göz testi (⚠ UNVERIFIED insan onayına kadar)
```

Opus-devralma netliği: her ekran bağımsız teslim birimi; IMPLEMENTATION_ROADMAP (D5) ekran-başı "girdi → adımlar → doğrulama → çıktı" bloklarıyla işaretler. ⛔ kritik karar noktaları (shell kompozisyon değişikliği, drill-down haritasına yeni desen, Control Mode güvenlik seamı): eldeki en güçlü model + CEO onayı olmadan değiştirilemez.

## 25. Bağımlılıklar

[[DESIGN_SYSTEM]] (tokens+component states — bu spec'ten ÖNCE uygulanır) · [[DATA_MODEL]] view aileleri · [[OBSERVABILITY_SPEC]] (agent_runs/alerts) · [[APPROVAL_ENGINE_SPEC]] · [[COST_CONTROL_SPEC]] · [[SETTINGS_AND_CONTROL_SPEC]] · Next.js 16.2 RSC · Supabase Realtime Broadcast · mevcut i18n altyapısı.

## 26. Riskler / 27. Edge case'ler

- **Yoğunluk-karmaşa dengesi** (§2.3): risk = 26 sayfa tutarlılığının kayması → tek shell + tek WidgetRegistry + DESIGN_SYSTEM lint'i.
- **Boş holding durumu**: şirket=1, çalışan az iken Overview'un "boş lüks" görünme riski (§35) → widget'lar gerçek az-veriyi dürüst gösterir + empty state bağlamsal metin (örn. "2 şirket kayıtlı — Outleteuro Faz 11'de katılır"); sahte kalabalık YASAK.
- **Broadcast fırtınası**: çok ajan × çok event → 1sn toplu yayın + sanal liste (SYSTEM_ARCHITECTURE §26).
- **Tek tık felaketi**: Global Pause/Maintenance yanlış tık → çift-onay + geri alma; her mutasyonun `settings_change_log`/audit üzerinden undo yolu.
- **Ultrawide↔laptop geçişi**: grid kolon sayısı breakpoint'te düşer, widget sırası korunur; TV modunda etkileşim kapalı.
- **Search sonuç patlaması**: `v_global_search` LIMIT 50 + tip-başı gruplama; boş sonuç bağlamsal öneri döner.

## Done definition (bu spec)

27 başlık ✓ · KALIR/DEĞİŞİR/SIFIRDAN eşlemesi (§5) ✓ · doğrulama komut deseni (§24) ✓ · Opus-devralma netliği (§24) ✓ · ⛔ kritik kararlar işaretli (§3 shell tekliği, §24 seam listesi) ✓ · drill-down haritası normatif tablo ✓ · §35/§38 bağlayıcılığı (R9, §21) ✓

## Registered adaptations

| # | Adaptation | Why (measured) | Where |
|---|---|---|---|
| A1 | **E12.2 (2026-07-18): layout scope string = `ceo_dashboard:default`** — §10 names the scope `ceo_dashboard`; the settings engine (E6.1, SETTINGS spec) enforces "scoped write needs an id: `<class>:<id>`" on every non-global scope. The spec name is the scope CLASS; the stored string carries the engine-mandated id segment (`default` = the CEO's dashboard set; multi-dashboard stays INSIDE the layout JSON per §10 schema). Key registered as `dashboard.layout` (migration 20260718010000, namespaced per registry precedent `alerts.*`/`department.*`). | `control_settings_set` scope law measured live: bare `ceo_dashboard` → `VALIDATION_FAILED 'scoped write needs an id'` (tests/e122 test 4 pins this permanently) | migration 20260718010000 · `widgets/types.ts` LAYOUT_SCOPE · tests/e122 |
| A2 | **E12.2: v1 edit interactions = deterministic buttons** (add select / remove / order-swap arrows / width cycle), not pointer drag-drop — §5 WidgetGrid contract is met (ekle/kaldır/taşı/boyutlandır/kaydet all live); drag-drop is POLISH scheduled with the deferred design slot (U16 companion), recorded here so it cannot silently vanish. Resize is width-cycle (1/2/4 col) + fixed row heights v1; free h resizing joins the same polish slot. | One-night wave scope + Playwright-provable determinism (spec §24 acceptance (d) needs a machine-walkable flow) | `widgets/widget-grid.tsx` header note · U16 |
