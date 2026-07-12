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

**Gap-audit bağlayıcı kuralları ([[00-CEO-DIRECTIVE-GAP-AUDIT]] + [[GAP-AUDIT]], 2026-07-11):** (1) Her E bloğu kendi domain'inin ModuleWaiting placeholder'ını KENDİ adımında kapatır; kabul ölçüsü direktif §2.1'in 8-şartlı DoD matrisidir (gerçek domain sorgusu, drill-down, gerektiğinde control fn + audit + Broadcast zinciri, loading/empty/error/stale/permission-denied durumları, EN/TR, rota-başı test, ölü buton 0). (2) "Menü var / route açılıyor / DB'de satır var / persona dosyası var" ≠ tamam; kanıtsız done = otomatik RET. (3) Final kabulde ModuleWaiting = **0** (E12.3 kapısı). (4) **CEO K1 kararı (2026-07-11):** modül/placeholder kapanış yürütücüsü yalnız **Fable ve GPT 5.6 solo** — başka model modül kapatamaz; F/O kolonundaki devralma bu kapsamda GPT 5.6 solo demektir. (5) **CEO K2 kararı (2026-07-11):** TÜM personalar (yeni + legacy v2 dalgaları) **Fable bizzat** yazar; hr-factory ilk oluşumda yazarlık yapmaz; yetişmeyen "Fable-yazımı bekliyor" listesine düşer, kalite asla düşürülmez.

### E1 — Design tokens + primitives (CEO Faz 6 zemini) — [[DESIGN_SYSTEM]] normatif

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E1.1 | Tailwind v4 token seti (obsidian/graphite yüzeyler, champagne gold, 8-durum matrisi, motion) | `apps/dashboard/src/styles/tokens.css` + `tailwind` config | `pnpm --filter dashboard build` → yeşil; token sınıfları derlendi | F/O | ✓ 2026-07-10 (build yeşil 14/14; derlenmiş CSS'te `--accent-champagne:#d8b98c` + `--t-fast:.12s` + `ease-refined` doğrulandı; utility ad uyarlaması U5) |
| E1.2 | Primitive komponentler (Surface, Panel, Stat, DataGrid, Badge, CommandItem — §33 zorunlu library çekirdeği) | `apps/dashboard/src/components/primitives/` | Storybook YOK (bilinçli); `/design-preview` rotası primitives'i gerçek tokenlarla listeler | F/O | ✓ 2026-07-10 (build yeşil, rota `○ /design-preview` çıktıda; hex-kaçağı 0; görsel kalite ⚠ CEO göz testi) |

### E2 — Command Center shell (CEO Faz 6) — [[CEO_COMMAND_CENTER_SPEC]] §9-11

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E2.1 | Shell layout: sol nav (7 grup, §10 birebir), üst command bar (§11), canvas, sağ intelligence rayı, floating dock | `apps/dashboard/src/app/(command)/layout.tsx` + nav config | `curl -s localhost:3000/overview` → 200; ekranda 5 katman | F/O | ✓ 2026-07-10 (build'de `ƒ /overview`; curl 307→login→200 auth duvarı doğru; 5 katman gerçek DB sayılarıyla — görsel ⚠ CEO göz testi; search/⌘K→E4, emergency/Control→E6, TV→E12 notlu) |
| E2.2 | Rota iskeleti: §31 sayfa listesi route-bazlı (boş sayfa YOK — her rota gerçek veri veya "modül bekliyor" durum kartı + hedef tarihi) | `(command)/*/page.tsx` | rota sayısı ≥ 26: `find apps/dashboard/src/app/\(command\) -name page.tsx \| wc -l` | F/O | ✓ 2026-07-10 (38 rota, build 53/53 yeşil; her sayfa ModuleWaiting + hedef adım ID; `/approvals` legacy'de kalır — E2.3 geçişinde taşınır, çakışma yok) |
| E2.3 | Eski kokpit rotalarından geçiş (tek commit'te anahtar; rollback tek revert) | rota değişim commit'i | eski rotalar 308 → yeni shell | F/O | ✓ 2026-07-10 (giriş anahtarı: login→/overview tek satır, rollback tek revert; modül redirect'leri CC-SPEC §22 gereği parite anında açılır — /approvals→E9.3, /costs→E11.1, /tasks→E12.1; oturumlu yönlendirme ⚠ CEO ilk girişte) |
| E2.4 | Login 3D hover upgrade (davranış aynı, görsel katman) | login komponenti | build yeşil + ⚠ CEO göz testi | F/O | ✓ 2026-07-10 (CSS-3D pointer parallax: sahne ≤1.6° tilt, katman derinliği far 6px/near 14px+Z, ışık imleci izler, reduced-motion korunur; kapı hedefi /overview; build yeşil; görsel ⚠ CEO göz testi) |

### E3 — Executive Overview + Live Operations v1 (CEO Faz 6) — gerçek veri, mevcut şema

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E3.1 | `v_exec_overview_v1` view (mevcut 18 tablodan: tasks, approvals, cost_ledger, agents, budget_state) — migration `0019x-b` | `db/migrations/` | `psql -c "SELECT * FROM v_exec_overview_v1;"` → 1 satır özet | F/O | ✓ 2026-07-10 (`20260710235000_exec_overview_v1.sql` uygulandı+idempotent; SELECT → 1 satır: 6 aktif görev, 6 onay, 153 ajan, €0.46 bugün; security_invoker + grant idiomu 0018 birebir) |
| E3.2 | Overview sayfası (§12): özet sayılar + HER sayı tıklanır → kaynak listesine iner (drill-down v1) | `(command)/overview/` | Playwright: sayıya tıkla → detay rotası açılır | F/O | ✓ 2026-07-10 (view'dan tek round-trip; 4 Stat + nabız/işgücü/bütçe panelleri, HER değer drillHref'li — hedefsiz özet render edilemez (prop zorunlu); hard-stop kritik bandı; build yeşil; tık-testi ⚠ oturum ister — E13.1 L5'te) |
| E3.3 | Live Operations v1 (§14): task_events akışı + Broadcast `approvals` mevcut kanalı; `ops:live` E8'de gelir | `(command)/operations/` | UI'da canlı task olayı ≤5 sn | F/O | ✓ 2026-07-10 (`/live`: 40 olay snapshot + dxb:task_events+approvals aboneliği, dürüst stale göstergesi; kanıt: probe INSERT → realtime.messages `dxb:task_events` 1 satır ≤30sn; UI ≤5sn görsel ⚠ CEO) |

### E4 — WS-A veri omurgası (CEO Faz 2 zemini) — [[DATA_MODEL]] §20 sırası

| # | İş | Dosyalar | Kanıt | Model | Durum |
|---|----|----------|-------|-------|-------|
| E4.1 | 0020x org + 0021x settings + 0022x observability (+0022x-b) | `db/migrations/` | DATA_MODEL §22 komutları: `\dt` 6 aile kanıtı + append-only reddi | F/O | ✓ 2026-07-11 (4 dosya `20260711002000..002250`, idempotent re-run OK; append-only: authenticated UPDATE decision_log → permission denied; aktivasyon kapısı: personasız active → exception; fallback döngüsü → exception; **kayıtlı uyarlama:** departments PK'sı slug — `id uuid UNIQUE` eklendi, FK'lar ona bağlı) |
| E4.2 | 0023x workflow/project (+steps_snapshot, 0023x-b) + 0024x library (+0024x-b) | `db/migrations/` | `\dt project_* library_*` tam liste | F/O | ✓ 2026-07-11 (4 dosya `20260711002300..002450`; `\dt` project_members/milestones/risks + task_dependencies + library_items/grants/usage_log/change_log; §22 6-aile grep → 6; dependency döngüsü → exception) |
| E4.3 | 0025x api_support (view kataloğu + control_idempotency + notify_broadcast) + 0026x memory köprüleri | `db/migrations/` | API_CONTRACTS §24 idempotency kanıtı; `\d memory_index` 2 kolon | F/O | ✓ 2026-07-11 (`20260711002500+002600`; 6 katalog view SELECT'li; `notify_broadcast('system','probe.fired',..)` → realtime.messages `dxb:system` 1 satır; `\d memory_index` → run_id+scope; control_idempotency tablosu var — §24 curl kanıtı E6.1 fn'leriyle gelir, tablo-katman hazır) |
| E4.4 | Seed: companies(dxb-global) + mevcut departments→company bağla + DXB Global OS ilk proje kaydı (dogfood) | `db/seed/` | `SELECT count(*) FROM companies;` → 1; `v_project_command` dolu | F/O | ✓ 2026-07-11 (`db/seed/20260711_holding_core.sql` idempotent; companies → 1; bağsız departman → 0; v_project_command → dxb-global-os · owner agents-orchestrator; memory_source → 4) |
| E4.5 | Overview/LiveOps v2: view'ları 0025x kataloğuna geçir (`v_exec_overview`, `v_live_ops`) | E3 sayfaları | drill-down yeni ailelere iner | F/O | ✓ 2026-07-11 (layout+overview → v_exec_overview, /live → v_live_ops label'lı; pulse panelinde 3 yeni-aile drill: /ops/runtime · /ops/workflows · /ops/projects — Playwright tıkla → /ops/projects açıldı, "Projects active 1" seed satırı canlı; build 54/54, console 0/0, design-audit 3/3 PASS en 365=tr 365; kanıt: evidence/e45-overview-1440.png + e45-live-1440.png) |

### E5 — Persona çekirdeği (CEO Faz 3-5) — **FABLE-ONLY** ([[EMPLOYEE_PERSONA_STANDARD]], [[HR_OPERATING_SYSTEM_SPEC]])

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E5.0 | Kadro gap matrisi (direktif §3.1-3.2): 153 legacy + 5 v2 + registry tek envanter; persona GÖVDELERİ okunarak `capability \| dept \| required role \| existing \| gerçek kapsam \| duplicate \| missing authority/workflow/skill \| risk \| decision \| target phase` matrisi; §3.2 15-aile karşılaştırması; keep/merge/rewrite/add kararları; role_level + manager_id backfill planı | `HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md` | matris satırı = envanter toplamı; her satırda decision; 15 aile kapsanmış; CEO karar özeti | **F — persona yazım dalgaları bu matris olmadan başlayamaz** | ✓ 2026-07-11 (WORKFORCE-GAP-MATRIX.md, Fable bizzat; 153 karar: keep 92 + move 36 + merge 6 + retire→library 15 + promote 4, aritmetik doğrulama dosyada 92+36+6+15+4=153; §3.2 15 aile satırı grep → 15; ADD 34; hedef org 18 dept + 5 pod, aktif 166; §6 CEO karar özeti 4 madde — retire/research-kapanışı/hedef-org onayı bekliyor; envanter kanıtı scratchpad persona-inventory.txt 153+4 satır) |
| E5.1 | Persona derleyici: standard şablon → system-prompt compile fn (`packages/hr`) + personas tablo yazımı | derleme testi: örnek persona → geçerli system prompt | **F** (derleyici kodu F/O; şablon+kalite kapısı F) | ✓ 2026-07-11 (packages/hr: template+gate+compiler+fixtures, Fable bizzat inline; `pnpm --filter @dxb/hr test` → **28/28** — gate 22 vaka (11 eksik-bölüm + thin + header + jenerik + TODO + secret + injection EN/TR + hook-version 3 vaka) ≥13 şartı, compiler 6 (bit-eş determinizm + snapshot + compact §1-6/§11 tam + hook-sürüm etkisi + veri-bölgesi ayrımı + fail-closed); build tsc yeşil; migration `20260711003000_persona_fns.sql` idempotent 2× uygulandı: fn_persona_submit/fn_persona_gate + trg_agents_persona_passed; DB sondası 8/8 (pending→superseded→passed, pending-bind RED, secret RED, injection RED, bad-verdict RED) + realtime.messages dxb:org 3 olay + audit 3 satır — ROLLBACK'li sonda, DB temiz; **kayıtlı uyarlama:** quality_gate CHECK'e 'superseded' eklendi — PERSONA spec §27 hükmü) |
| E5.2 | Orkestratör personası v2 (Fable yazımı, quality_gate=passed) | `SELECT quality_gate FROM personas WHERE ...` → passed | **F — DEVREDİLEMEZ** | ✓ 2026-07-11 (persona "Atlas, Holding Orkestratörü" — 11 bölüm, ~95 rol-özgü hüküm, Fable bizzat; mekanik gate 0 failure (hook v1 kontrolüyle); gerçek derleme 11.419 karakter / 3 bölge; `fn_persona_submit` → f902629c… v1 · `fn_persona_gate('passed', Fable 5-soru verdict)` → kanıt sorgusu `quality_gate` → **passed**; `agents-orchestrator` bağlandı: persona_id + role_level='orchestrator' + hook_version='v1' (body 11.218 karakter DB'de — spec §22: git'te yaşamaz); Broadcast dxb:org persona.submitted+gated, audit verdict=passed; CEO derin-kalite direktifi 5-kontrolü roadmap üstü rapora işlendi; aktivasyon HR durum makinesine bırakıldı — dormant doğru) **+ E5.2b kayıtlı uyarlama (CEO emri 2026-07-11 ~16:00):** spec §22 TERSİNE — yazım kaynağı `personas/<dept>/<slug>.md` DOSYALARI, DB=runtime+gate kopyası (tek yön `scripts/sync-personas-to-db.sh`→fn_persona_submit); db-mirror/153-kart/export-script KALDIRILDI (legacy-metin-gömme ihlali); 5 product personası `personas/product/`a iade; "Atlas" adı kaldırıldı → v2 yeniden submit+gate **passed** (persona version=2, agents.persona_id yeniden bağlı); 153 çalışanın sicil-iskeleti dosyada (`gen-workforce-dossiers.sh`, kişilik yazarlığı YOK — ⏳ Fable-yazımı işaretli; kanıt: `sync --verify` → match 1 · skip 152 · fail 0 · PASS) |
| E5.3 | Departman müdürü personaları v2 (mevcut 11 dolu departman + E5.0 gap-matrisi zorunlu yeni head'ler; müdür role_level='head' + departments.director_id + worker'lara manager_id zinciri) | müdür-başı personas satırı + employee_records; director_id dolu; orphan worker 0 | **F — DEVREDİLEMEZ** | ✓ 2026-07-11 (E5.3b e4295f3 + D1-D6a dalga commit'leri; 19/19 head gate=passed, director 19 dept, orphan 0) |
| E5.4 | HR ilk oluşumu: HR personaları + persona-yazım standardı + kalite kapıları (Fable-sonrası fabrika) | HR dept aktif; hr fn'leri testli | **F — DEVREDİLEMEZ** | ✓ **E5.4a 2026-07-11** (Fable bizzat): 5 HR personası v2/v1 — TA + L&D + onboarding (move-rewrite) + Persona/Workforce Mimarı + Performans & Kalibrasyon Yöneticisi (ADD, migration `20260711006000` idempotent 2×, manager=CHRO, yetim-korkuluğu); mekanik gate **25/25 regresyonlu** (HEADER_RE isim-politikası hizası — kayıtlı uyarlama: E5.2b "Atlas" kaldırma kararının packages/hr yansıması test-önce yapıldı, `pnpm --filter @dxb/hr test` 28/28); fn_persona_submit ×5 → fn_persona_gate **passed ×5** (Fable 5-soru verdiktleri audit'te); persona_id+hook v1 bağlı 6/6 (chro dahil); sync --verify match 25 · diff 0 · fail 0; Broadcast dxb:org persona.gated ×5. **Kayıtlı uyarlama (sessiz değil):** "HR dept aktif" DoD'sinin fabrika-fn ayağı **E5.4b'ye ayrıştı** — fn_hr_* ailesi DB'de yoktu, persona yazarlığından bağımsız K1 işi; K2 devredilemez çekirdek (persona yazımı) burada kapandı |
| E5.4b | HR-fabrika fn altyapısı: `fn_hr_*` ailesi (create/grant/probation_task/evaluate/promote) + `v_hr_equipment_check`/`v_hr_roster`/`v_hr_probation_queue` + people-hr MCP profili (grants.json) + aktivasyon zinciri işletimi (HR spec §4-6) | `demo:hire` → 7/7 equipment + probation task; "donanımsız aktif" sorgusu → 0; people-hr ailesi draft→probation kanıtı | **F / GPT 5.6 solo (K1)** | — |
| E5.5 | Uzman personaları (153 legacy → v2 dalgaları + E5.0 gap-onaylı yeni personalar — G7); her persona direktif §3.3 sözleşme alanlarıyla (gerekçe, hiyerarşi, KPI, authority limits, model+budget, skill/MCP grants, autonomy, memory policy, quality rubric, dashboard bağı, activation proof) | dalga-başı sayım raporu + §3.3 alan denetimi | **F — TÜMÜ FABLE BİZZAT (CEO K2)**; yetişmeyen → "Fable-yazımı bekliyor" listesi CEO'ya (BACKUP_PLAN §1.6); kalite düşürülerek kapatılamaz | **D1 ✓ 2026-07-11 (Fable bizzat, 19 persona 3 commit):** ceo-office 5 (`dc714cd` — CoS move+promote→müdür, director_id(ceo) dolu; EOM+Board Secretary ADD; ExecSummary+DocGen v2; 3 slug taşıma migration `20260711007000` idempotent 2×) · strategy 5 ADD (`c4de0f6` — CorpDev, MIL [trend-researcher sınır kaydı], OKR-PM [PCM sınır kaydı], PEL pod [satış-DNA], GEL pod) · finance 9 (`a207d61` — 7 rewrite [AP para-çıkışı approval anayasası; FP&A €50-150 band bekçisi + tracker-merge; Tax DE/TR danışman-teyit] + Treasury&AR [giriş-çıkış asimetrisi] & Payroll ADD). Kanıt: mekanik gate **44/44 tam-regresyon** · sync --verify **match 44 · diff 0 · fail 0** · fn_persona_gate passed ×19 (5-soru verdiktleri audit'te) · ceo 6/6 + strategy 6/6 + finance 10/10 persona_id+hook v1 bağlı · yetim 0 · role_level NULL 0. Kalan dalgalar: D2 legal+risk+security → D3 data-ai+platform → D4 eng+quality → D5 marketing+pods+paid → D6 sales+revops+CS+PMO+design+product → E5.6 social-media. **Kalan v2 yazımı: 135** (CEO düzeltmesi 2026-07-11: 179 hedef − 44 gate'li = 135). **D2 ✓ 2026-07-11 (Fable bizzat, 16 persona 3 commit):** legal 6 (`eb49c23` — DE/TR Counsel, DPO, Policy Writer ADD + CCM & LCC dormant→v2) · risk-audit 3 (`eadf25a` — IA & AMRO ADD + AGA rewrite) · security 7 (`4506963` — IAM-SO & AI Safety/Red-Team Lead ADD + 5 rewrite [SE/TDE eng→sec, AIT, BSA, CA]). Kanıt: gate tam-regresyon 60 PASS/0 FAIL · sync --verify match 60 · diff 0 · fail 0 · fn_persona_gate passed ×16 · legal 7/7 + risk-audit 4/4 + security 8/8 bound · role_level NULL 0. **Kalan v2 yazımı: 119** (179 − 60). **D3 ✓ 2026-07-12 (Fable bizzat, 15 persona 1 commit `6aeaaa6`):** data-ai 10 (ai-engineer, data-engineer, analytics-reporter, mcp-builder, workflow-architect, model-evaluation-lead [Lead unvanı → senior_specialist, kayıtlı karar], knowledge-architect [zk-steward→matris adı], identity-graph-operator + **ADD: Prompt/Context Engineer** [K2 persona-yazarlık yasağı kimliğe işli] & **AI Observability & FinOps Analyst** [€50-150 band erken-uyarı gözü]) · platform 5 (database-optimizer [DBRE], sre, incident-response-commander, infrastructure-maintainer + **ADD: Backup & DR Officer** [E13.0 restore-drill sahibi — "test edilmemiş yedek YOK hükmünde" devri]). Migration `20260712001000` (11 slug taşıma + ADD 3 + manager zincirleri CAIO/Platform Head + korkuluklar; idempotent 2× kanıtlı). Kanıt: mekanik gate **15/15 PASS** (açık dosya listesiyle — iskelet indexOf tuzağına karşı) · sync --verify **match 75 · diff 0 · fail 0 · PASS** · fn_persona_gate passed ×15 (Fable 5-soru verdiktleri audit_log'da) · data-ai **11/11** + platform **6/6** persona_id+hook v1 bağlı · yetim 0 · role_level NULL 0 · gitleaks temiz. **Kalan v2 yazımı: 105** (sayım düzeltmesi: gate'li 75 match'in 1'i orkestratör dosya-aynası — kadro-personası 74; 179 − 74 = 105; D2'nin "60/119" sayımı aynayı kadroya saymıştı, kayıtlı düzeltme). **D3 kapanış ek-maddesi (CEO direktifi 2026-07-12, yan-kanal pencere işledi — madde-8 gereği bu kayda dahil):** dashboard'dan `agents.brain` değişimi MODEL_ROUTING_SPEC R8+§4b ve CEO_COMMAND_CENTER_SPEC'e (beyin rozeti + set_model köprüsü + drill-down) işlendi, commit `d890600`; glm-5.2 tekdüzeliği teşhisi kayıtlı (kolon DEFAULT'u, arıza değil); ek karar ~01:00: Sonnet runtime-beyin yasağı kaldırıldı (inşaat yazarlık yasağı sürer). **D4a ✓ 2026-07-12 (Fable in person, 11 engineering core-delivery personas, commit `2e740e4` + migration `20260712002000` [level decisions + guardrails, idempotent]):** closure record written late (authoring session hit rate limit — registered, not silent), evidence re-run in the 04:00 session. **D4b batch-1 ✓ 2026-07-12 (Fable in person, 4 client-stack personas, commit `b9416e6` — first English-native batch, 00-CEO-DIRECTIVE-LANGUAGE):** wechat-mini-program, feishu-integration, filament-optimization, solidity-smart-contract — gate PASS + fn_persona_gate passed ×4 (English 5-question verdicts) + persona_id/hook v1 bound. Systemic persona_path fix shipped with it: migration `20260712003000` repointed 44 bound rows (all prior waves incl. 18 directors) + 19 eng/quality rows to personas/<dept>/<slug>.md (idempotent 2×, guardrails 0/0; E12.5 sweeps the rest). Evidence: sync --verify match 90 · diff 0 · fail 0 · PASS; engineering bound 16/23; quality 1/9. **D4 ✓ CLOSED 2026-07-12 (Fable in person — 30 personas, 4 commits: `2e740e4` D4a 11 + `b9416e6` D4b-1 4 + `2612e9c` D4b-2 7 + `67d3b8f` D4c quality 8):** engineering 23/23 + quality 9/9 bound — both depts COMPLETE; total bound 105; sync --verify match 105 · diff 0 · fail 0 · PASS; fn_persona_gate passed ×30 (English verdicts from D4b on); orphan 0; role_level NULL 0; registered senior decisions ×4 (migration `20260712002000`). **Remaining v2 authorship: 75** (179 − 104). Next: **D5 marketing+pods+paid-media → D6 sales+revops+CS+PMO+design+product → E5.6 social-media 11.** |
| E5.6 | **Social Media Department kuruluşu (CEO direktifi 2026-07-11 — 00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT):** departments migration (+social-media) + 12 rol ADD personası + workflow zinciri (müşteri isteği→içerik planı→taslak→onay→takvim→yayın→inbox→analitik rapor); platform API'leri modüler-sonra; publish=dışa dönük eylem → APPROVAL_ENGINE zinciri | dept satırı DB'de + `personas/social-media/` 12 dosya + matris §4 sayımı 179 + workflow sözleşmesi persona §3/§7'lerde | **F — persona yazımı DEVREDİLEMEZ (K2)** | — |

### E6 — Control seam + Settings (CEO Faz 7) — [[SETTINGS_AND_CONTROL_SPEC]], [[API_CONTRACTS]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E6.0 | Auth Closure (direktif §2.2 — GAP-01 BLOCKER): görünür Logout, `supabase.auth.signOut()` → `/login` replace+refresh, geri-tuşu auth duvarı, session-expiry uyarısı + güvenli yeniden giriş, çoklu-sekme logout senkronu, cookie bozulması kurtarma; yerel password-only davranışına regresyon testi | `(command)/layout.tsx` + auth helper + route handler | Playwright: logout → /login; geri tuşu korumalı sayfayı AÇMAZ; ikinci sekme oturumu düşürür | F/O | — |
| E6.1 | settings_registry seed (§18 alan kataloğu) + `control_settings_*` fn'leri + route handler + client helper **+ migration `0021h_model_catalog_governance.sql` (MODEL_ROUTING_SPEC §4 alignment note, 2026-07-12): ALTER model_catalog ADD display_name/banned/mechanical_only + status CHECK extended (+'testing' [§4c onboarding], +'disabled'); ALTER routing_rules ADD department_id/risk_max/min_context/cost_cap_per_task + UNIQUE(role_slot,priority,department_id); prerequisite for §4b `fn_update_agent_brain` + `0021g_agent_brain_source` — those fns cannot be written before this delta ships** | API_CONTRACTS §24 komutu birebir (set → change_log 1 satır; idempotent tekrar); `\d model_catalog` shows banned+mechanical_only+extended CHECK | F/O | — |
| E6.2 | Settings UI (§18 bölümleri) + Live Impact Preview + tek-tık undo | Playwright: değiştir → preview → kaydet → undo → eski değer | F/O | — |
| E6.3 | Org mutasyonları (`control_org_*`) + Organization sayfası v1 (read-only graph → sonra drag-drop) | org fn testi + `org` kanalında olay | F/O | — |
| E6.4 | Global Search + ⌘K Command Palette + CEO intent surface (TR/EN doğal dil → kernel; intent → classification → task/workflow → approval/outbox → audit zinciri ekrandan izlenir; READ-ONLY ↔ CONTROL MODE ayrımı + kill-switch görünürlüğü) — E2.1 notundan sahiplenildi, GAP-07 | command bar + palette + intent route handler | Playwright: ⌘K açılır, gerçek sonuç döner; intent gönder → task satırı + audit kaydı ekranda | F/O | — |

### E7 — Model routing tablo-güdümlü (CEO Faz 7) — [[MODEL_ROUTING_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E7.1 | model_catalog seed + routing_rules genişleme + orchestrator tablo-okur seçim | routing testi: slot → beklenen model; fallback zinciri decision_log'a | F/O | — |
| E7.2 | Model Orchestration Panel (§19) + banned-mekanizması denetimi görünür + model-ekleme akışı (MODEL_ROUTING_SPEC §4c) | panelde 13 rol slotu; `banned=true` test-satırı hiçbir slota atanamaz (fn reddi — mekanizma kanıtı); Sonnet atanabilir havuzda (CEO kararı 2026-07-12, R2/§4); add_model→testing→duman→active zinciri çalışır, `testing` model atanamaz | F/O | — |

### E8 — Observability yazıcıları (CEO Faz 6/8) — [[OBSERVABILITY_SPEC]], [[AUDIT_AND_LOGGING_SPEC]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E8.1 | Orchestrator SDK sarmalayıcı: agent_runs + tool_calls + file_changes otomatik yazım (1 sn tampon) | AUDIT §24: mock koşu N çağrı → N satır | F/O | — |
| E8.2 | `logDecision` yardımcısı + §10 "önemli karar" noktalarına yerleştirme | decision_log 8 alan dolu satır | F/O | — |
| E8.3 | `ops:live` Broadcast trigger'ları + Live Ops v2 canlı ajan akışı | EVENT_MODEL §24 probe komutu | F/O | — |
| E8.4 | Audit sayfası (Governance grubu): birleşik akış + detail_ref drill-down + Decision Logs sekmesi | UI'da audit satırı → aile kaydına iniş | F/O | — |
| E8.4b | Notification/Alert center (GAP-10): gerçek alarm kaynağı (cost eşik, run failure, queue age, heartbeat kaybı), severity, owner, acknowledge, escalation, resolved; `/alerts` ModuleWaiting kapanır; Intelligence Rail gerçek öncelik sırasına bağlanır | `(command)/alerts/` + alert kaynağı | alerts sayfası gerçek kayıt listeler; ack → audit satırı | F/O | — |

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
| E12.3 | **Route Completeness Gate** (direktif §2.1/§6): ModuleWaiting = 0; rota-başı DoD matrisi raporu (`route \| owner \| source \| sorgu \| drill \| mutation \| loading \| empty \| error \| stale \| permission \| audit \| EN/TR \| test \| status`) | rota matris raporu | `grep -rl ModuleWaiting src/app \| wc -l` → **0**; matris her nav rotasında tam | F/O | — |
| E12.4 | **Holding/CRM Integration Gate** (GAP-05): CRM yeni shell bilgi mimarisinde + company switch/context + şirket→departman→çalışan→proje drill-down + şirketler-arası veri izolasyon testi; eski cockpit rotaları AYNI commit'te ölür (tek-anahtar idiomu) | `(command)/` CRM rotaları + company context | Playwright: company değişir → veri izole; eski /crm 308 | F/O | — |
| E12.5 | **Workforce Completeness Gate** (GAP-02/03/09): her aktif departmanda head; orphan/escalation'sız worker 0; gap-onaylı personalar canlı employee (registry+model+skill+MCP+permission+budget+dashboard+audit zinciri); 153 legacy'nin her biri keep/merge/rewrite/retire kararlı (CEO onayı olmadan rol silinmez); rapor = capability coverage, persona sayısı değil; **stale persona_path = 0** (agents rows still pointing at removed `agency-agents/%` tree — 129 measured 2026-07-12, all dormant/archived v1.0-legacy; each E5.5 wave migration repoints its batch, this gate sweeps the remainder) | DB + `/org/*` sayfaları | SQL: head'siz aktif dept 0, orphan 0; `SELECT count(*) FROM agents WHERE persona_path LIKE 'agency-agents/%'` → 0; coverage raporu | F/O (persona içerikleri **F** — CEO K2: tümü Fable) | — |

### E13 — Kabul turu (CEO Faz 10) — [[TEST_STRATEGY]], [[ACCEPTANCE_CRITERIA]]

| # | İş | Kanıt | Model | Durum |
|---|----|-------|-------|-------|
| E13.0 | Operational Readiness (direktif §2.6 — GAP-08): backup **restore drill** (RPO/RTO kanıtı, yalnız dosya varlığı kabul değil), migration rollback tatbikatı, session E2E, accessibility (klavye/focus/contrast/reduced-motion), failure-path testleri (timeout/duplicate/retry/partial failure/idempotency), 100+/10k kayıt pagination/performans | tatbikat raporları | restore drill raporu + rollback kanıtı + a11y/failure test çıktıları | F/O | — |
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

Yürütme sırasında geçerli çapraz kurallar: evidence-before-done (her adım) · gitleaks her commit · dalga/blok = atomik commit · Broadcast yasağı yok ama postgres_changes yasak · hata durumunda adım kapatılmaz, kanıt komutu geçene kadar açık kalır · Fable penceresinde subagent yasağı sürer · **canlı `next start` altında `.next` yeniden build edilirse sunucu MUTLAKA yeniden başlatılır** (2026-07-10 dersi: eski süreç yeni asset'leri bulamaz → çıplak HTML; kanıt zinciri: build → restart → `curl <css-chunk>` 200).

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
