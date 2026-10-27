# ORGANIZATION_ENGINE_SPEC — ORGANİZASYON MOTORU

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: §15 (Organization Intelligence) + madde 5.3 (Organizational Graph) + madde 2 (CEO org yetkileri)
> Üst: [[SYSTEM_ARCHITECTURE]] · Şema: [[DATA_MODEL]] §4.1 (0020x org ailesi) · Tüketiciler: [[HR_OPERATING_SYSTEM_SPEC]], [[CEO_COMMAND_CENTER_SPEC]] (/org/* rotaları), [[PERMISSION_MODEL]]

## 1. Amaç

Holding organizasyonunun (holding → company → department → senior_specialist → specialist → ops_agent → sub_agent; departmanın başında müdür düğümü yoktur, işin sahibi işin türünün ustasıdır — B64 v2) DB'de birinci-sınıf, UI'da interaktif-graf olarak yaşaması. İki yüz: (a) **okuma** — org graph 7 görünüm modunda, her node tıklanabilir, sonsuz drill-down; (b) **yazma** — CEO'nun madde 2 org yetkileri (taşı, bağla, askıya al, usta değiştir, model grubu ata) tek yazım seamından, audit'li ve geri-alınabilir.

## 2. Gereksinimler

- G1. §15 hiyerarşi zinciri 8 seviye; her seviye `agents.role_level` enum'unda karşılıklı (DATA_MODEL 4.1) — holding tekil sanal kök, company tablo satırı.
- G2. 7 görünüm modu: organizational · cost · performance · model · risk · workload · permission — aynı graf, farklı overlay verisi.
- G3. Her node'da madde 5.3 alan seti: isim, unvan, departman, yönetici, bağlı çalışanlar, model, durum, performans, maliyet, aktif görev, yetki seviyesi, persona, sicil, skill set, memory, tool access.
- G4. Drag-and-drop org değişimi: müdür departman değiştirir, çalışan başka müdüre bağlanır, model başka çalışan grubuna atanır, çalışan geçici askıya alınır (madde 5.3 dört fiil birebir).
- G5. Her org mutasyonu: SECURITY DEFINER fn → audit_log + Broadcast → UI yenilenir. Doğrudan tablo UPDATE yok.
- G6. Org değişimi çalışan koşuları kırmaz: running `agent_runs` mevcut bağlamıyla biter; yeni yapı bir sonraki spawn'dan geçerli.

## 3. Mimari

```
UI /org/graph (client component, tek interaktif yüzey)
  ├─ read:  v_org_graph (topoloji) + v_org_overlay_<mode> (mod verisi)
  ├─ write: POST /api/control/org/{move|assign|suspend|...}
  │           └─ fn_org_* (SECURITY DEFINER; kural + audit + Broadcast 'org')
  └─ live:  Broadcast 'org' kanalı → graph patch (tam yeniden çekim değil)
```

Mevcut-varlık eşlemesi: `departments`, `agents` tabloları GENİŞLER (0020x); `companies`, `personas`, `employee_records` YENİ; org graph UI SIFIRDAN; kernel'in departman/ajan okuma yolları KALIR (view-alias köprüsü — DATA_MODEL §24).

## 4. Veri modeli

Normatif şema DATA_MODEL §4.1. Bu spec'in ek hükümleri:

- Hiyerarşi türetimi: departman zinciri `departments.parent_id`; insan zinciri `agents.manager_id`. İkisi tutarlı olmalı — kural: `agents.manager_id` işaret ettiği yönetici, çalışanla aynı `department_id`'de YA DA departmanın `director_id`'sidir; ihlal fn'de reddedilir. Bu zincir İK ve raporlama içindir, iş yönlendirmez: bir işin sahibi o iş türünün ustasıdır (B64 v2, A1). <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
- `sub_agent` kalıcı org üyesi değildir: org grafında yalnız CANLI sub-agent'lar gösterilir (`agent_runs.parent_run_id` zincirinden türetilir), `agents` satırı açılmaz. Hermes appears on the graph as a live node of its own — lit and named while it works (B64 A4).
- Döngü koruması: `manager_id` zinciri recursive CTE ile INSERT/UPDATE trigger'ında denetlenir (kendine/döngüye izin yok — DATA_MODEL fallback emsaliyle aynı desen).

## 5. Component yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| OrgGraph canvas (pan/zoom/mod anahtarı/drag-drop) | `apps/dashboard/src/app/(command)/org/graph/` | SIFIRDAN |
| NodeCard (hover özet) + NodeDetailDrawer (madde 5.3 tam set) | aynı modül | SIFIRDAN |
| OrgModeSwitcher (7 mod) | aynı modül | SIFIRDAN |
| Employee command page (kart → tam sayfa, §16) | `(command)/org/employees/[id]` | SIFIRDAN — CEO_COMMAND_CENTER rotası |
| `fn_org_*` fonksiyon ailesi | migration 0020x | YENİ |
| `v_org_graph`, `v_org_node_detail`, `v_org_overlay_*` | migration 0025x (view paketi) | YENİ |

⛔ Graf render kütüphanesi (aday: React Flow / D3 / özel SVG) yeni bağımlılıktır — seçim uygulama fazında STACK.md okuması + eldeki en güçlü model kararı + CEO görünürlüğü ile; spec kütüphane-bağımsızdır (veri kontratı sabit).

## 6. Backend yapısı — fn ailesi (0020x)

| Fonksiyon | İş kuralı özü |
|-----------|---------------|
| `fn_org_create_company(slug,name,mission)` | slug benzersiz; audit |
| `fn_org_create_department(name,company_id,parent_id)` | parent aynı company'de |
| `fn_org_assign_director(dept_id,employee_id)` | employee `role_level='director'` VE aktif; eski director varsa raporlama zinciri yeniden bağlanmadan commit yok (yetim-müdür kuralı) |
| `fn_org_move_employee(employee_id,new_dept_id,new_manager_id)` | G6 korunur; döngü denetimi; sicile `version_history` satırı |
| `fn_org_suspend_employee(employee_id,reason)` | `employment_status='suspended'`; koşan run'lara pause sinyali (ORCHESTRATION §7); yeni spawn engellenir |
| `fn_org_reactivate_employee(employee_id)` | persona kalite kapısı hâlâ `passed` ise |
| `fn_org_assign_model_group(model_id,employee_ids[])` | model_catalog'da `banned=false`; her çalışan için decision_log satırı; goes through the one door that applies, records and undoes a brain or effort change, and never drops a master or a standing owner below Opus 5.5 high (B64 A1; B64 v2 <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 -->) |
| `fn_org_archive_employee(employee_id)` | aktif görevi/koşusu varsa RED (önce devir); HR devir akışı madde 9 |

Ortak gövde deseni: yetki kontrolü (`ceo`/`system`) → iş kuralı → tablo yazımı → `audit_log` satırı → `settings_change_log` DEĞİL, org değişimleri kendi izini `audit_log.detail_ref`'te taşır → Broadcast `org` kanalına `{op, ids}` yayını. Tek transaction.

## 7. Frontend yapısı

- Graf düzeni: hiyerarşik (dikey katman = role_level); 200+ node'da departman-katlanır (collapse) mod; 3 seviye altı sub-agent'lar sayı rozetiyle katlanır (DATA_MODEL edge kuralı).
- Mod değişimi overlay verisini değiştirir, topolojiyi yeniden çekmez (tek `v_org_graph` + mod başına hafif overlay sorgusu).
- Drag-drop: bırakma anında hedef doğrulaması client'ta ön-izleme (geçersiz hedef kırmızı), commit yalnız fn yanıtı `ok` ise; optimistic update YOK — Broadcast patch'i gerçeği çizer.
- Node tıklama → NodeDetailDrawer (madde 5.3 seti); "tam sayfa" → employee command page (§16 seti: persona, sicil, model settings, skills, plugins, tools, memory, tasks, decisions, errors, cost, performance, audit, logs — her biri ilgili spec'in view'ına bağlanır).
- Tasarım: DESIGN_SYSTEM token'ları; mod renkleri status paletinden türetilir, yeni renk İCAT EDİLMEZ.

## 8. API'ler

- Read: `GET /api/org/graph?mode=<m>` yok — RSC doğrudan view okur; client graf verisini `route handler /api/org/graph.json` üzerinden alır (tek round-trip, mode parametreli).
- Write: `POST /api/control/org/<op>` — gövde Zod; yanıt `{ok, change_id, affected[]}` (SYSTEM_ARCHITECTURE §8 kontratı); idempotency key zorunlu.

## 9. Event yapısı

- Broadcast kanalı `org` (yeni; kanal kataloğu normatif olarak EVENT_MODEL D4): olaylar `company.created`, `department.created`, `director.assigned`, `employee.moved`, `employee.suspended`, `employee.reactivated`, `employee.archived`, `model_group.assigned`.
- Payload: `{op, entity, id, summary_tr, summary_en}` — UI toast + graf patch aynı payload'dan.

## 10. State yönetimi

Client state yalnız: seçili node, aktif mod, katlanma durumu, pan/zoom. Widget/graf tercihleri `settings_values(scope='ceo_dashboard', key='org.graph_prefs')` — cihazlar arası taşınır.

## 11. Database tabloları / 12. İlişkiler

DATA_MODEL §4.1 normatif. Bu spec'in view sözleşmeleri:

- `v_org_graph`: `(node_id, kind[company|department|employee], label, role_level, parent_node_id, status)` — tek sorguda tüm topoloji.
- `v_org_node_detail`: madde 5.3 alan seti tek satırda (persona/sicil id'leri FK olarak; içerik drawer'da lazy).
- `v_org_overlay_cost` (30g maliyet/node), `_performance` (KPI skoru), `_model` (model_id + dağılım), `_risk` (açık alert sayısı + risk seviyesi), `_workload` (aktif görev + koşu sayısı), `_permission` (yetki seviyesi + grant sayısı).

## 13. Yetkilendirme

- Org mutasyonu: yalnız `ceo` rolü (fn içi kontrol); a brain or effort change may also come as his word carried by Hamza from his chat or voice through the same door, recorded as the CEO's word via Hamza (B64 A1; PERMISSION_MODEL G1-ter). `system` (HR fn'leri) yalnız `fn_org_move_employee/suspend/reactivate/archive` çağırabilir — HR akışları da aynı seamdan geçer, ikinci yazım yolu açılmaz.
- Okuma: CEO tümü; ajan profilleri yalnız kendi departman alt-ağacını görür (gateway sorgu filtresi; matris PERMISSION_MODEL).

## 14. Logging / 15. Audit

Her fn çağrısı: `audit_log(actor, action='org.<op>', detail_ref)` zorunlu — fn gövdesinde, uygulamaya bırakılmaz. Başarısız kural denetimleri de loglanır (`action='org.<op>.rejected'`, gerekçeyle) — CEO "neden taşıyamadım" sorusunun cevabı UI'da gösterilir.

## 16. Security

Madde 4 sınırları içinde: yeni kimlik katmanı yok; RLS deseni DATA_MODEL §11 kopyası. Askıya alma ajan API erişimini keser: suspend fn'i LiteLLM virtual key'i devre dışı işaretler (COST_CONTROL'un `/key/update` senkron deseniyle aynı, eventual-consistent; kesin kesme bir sonraki spawn kapısında — hook pre-task gate `employment_status` okur).

## 17. Error handling / 18. Retry / 19. Fallback

- Kural reddi = `policy` hatası: UI'ya insan-okur gerekçe (`rejected_reason_tr/en`), retry edilmez.
- Broadcast yayın hatası mutasyonu GERİ ALMAZ (yayın transaction-sonrası); UI 30sn'de bir graf hash'i karşılaştırıp sapmada tam çeker (self-heal).
- LiteLLM key senkron hatası: alert `high` + pg-boss retry job'ı (COST_CONTROL deseni).

## 20. Test planı

- Birim (pgTAP veya SQL script): döngü reddi, yetim-müdür reddi, cross-department manager reddi, suspend→spawn engeli, archive-aktif-görev reddi.
- Uçtan uca: `fn_org_move_employee` → audit satırı + Broadcast payload + `v_org_graph` yeni parent — üçü tek testte doğrulanır.
- UI smoke: graph 7 modda render; drag-drop geçersiz hedef reddi görsel.

## 21. Acceptance criteria

- CEO org grafında bir uzmanı başka departmana sürükler → 2sn içinde graf yeni yapıyı gösterir, audit_log satarı sorgulanabilir, çalışan koşusu kesilmemiştir (G6 kanıtı).
- 7 mod anahtarı < 500ms'de overlay değiştirir (topoloji yeniden çekilmez — network sekmesinde tek hafif istek).
- Her node tıklanınca madde 5.3 setinin TAMAMI drawer'da dolu (boş alan = ilgili view eksik = kabul reddi).

## 22. Migration planı / 23. Rollback planı

0020x org ailesi (DATA_MODEL) + bu spec'in fn'leri aynı ailede; view'lar 0025x. Rollback: fn'ler `DROP FUNCTION` bloğu; view'lar `DROP VIEW`; tablo rollback'i DATA_MODEL tablosunda. Fn'siz kalan UI mutasyon rotaları 501 döner (kırık yazım yolu açık hata verir, sessiz geçmez).

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
# 1. 0020x push
supabase db push && psql "$DB" -c "\df fn_org_*" | grep -c fn_org   # → 8
# 2. seed: dxb-global company + mevcut departmanlar bağlanır
psql "$DB" -c "SELECT fn_org_create_company('dxb-global','DXB Global',NULL);"  # → uuid
# 3. döngü reddi kanıtı
psql "$DB" -c "SELECT fn_org_move_employee('<a>','<dept>','<a>');"  # → ERROR: manager cycle
# 4. view paketi
psql "$DB" -c "SELECT count(*) FROM v_org_graph;"                    # → node sayısı > 0
# 5. UI graph (⚠ görsel kabul CEO göz testi)
curl -s localhost:3000/api/org/graph.json?mode=cost | jq '.nodes | length'  # → >0
```

## 25. Bağımlılıklar

0020x ← yok (ilk aile); tüketen: 0021x+ tüm aileler (FK yönü). UI: DESIGN_SYSTEM token'ları + shell (CEO_COMMAND_CENTER WS sırası). Graf kütüphanesi kararı ⛔ (bkz. §5).

## 26. Riskler / 27. Edge case'ler

- Riskler: graf kütüphanesi bundle ağırlığı (ultrawide'da 60fps hedefi — ölçülmeden kabul yok); Broadcast patch sıra bozulması (çözüm: patch'te `version` sayacı, eskisi düşürülür).
- Edge: müdürsüz departman (director_id NULL) olağandır — grafta departmanın uzmanları görünür, rozet ve HR alert'i yoktur; no work waits on it, since work is routed by the job-type menu and work with no owner goes through the "unclear" door to Hamza (B64 A2; B64 v2 <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->); çalışan kendi kendinin müdürü — trigger reddi; aynı anda iki taşıma (CEO + HR) — satır kilidi fn içinde (`SELECT ... FOR UPDATE`), ikinci işlem güncel durumla yeniden doğrulanır; company arşivi — altındaki tüm departman/çalışan arşivlenmeden RED.

## Registered adaptations — B64 how work reaches the holding (2026-10-14) <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 -->

Source: his design page v15, `.planning/quick/20261012-b64-is-akisi/is-akisi.html` — every decision answered and registered. The law the build follows; none of it is built yet. <!-- OPEN: B64 -->

- **A1 — Departments are cupboards; a job's master owns the work (decisions 1, 11, 14; B64 v2).** A department owns no jobs and its head is no stop on a job's path: it is a cupboard the masters draw from — its specialists, checklists, examples and lessons. A job's owner is the master of its type (AGENT_ORCHESTRATION A27), who may call a specialist from any department's cupboard with a reason and, at the job's end, writes a one- or two-line lesson into the relevant department's cupboard. Measured 2026-10-14 in the company engine: 22 departments, 22 with `director_id`; that column stays for HR and routes no work (§4). Adding a specialist to a cupboard is a job through Hamza's door, its persona written through the persona door (B64 v2, decision 6); hiring mechanics stay HR's ([[HR_OPERATING_SYSTEM_SPEC]]). A master or a standing owner never gets a brain below Opus 5.5 high: <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 --> `fn_org_assign_model_group` refuses it and goes through the one door that applies, records and can undo a brain or effort change (decision 6 <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 -->; PERMISSION_MODEL G1-ter). Every standing assignment carries its date, who decided and why (decision 14 <!-- CEO-OK: b64-decision14-model-room-2026-10-14 -->).
- **A2 — The Reception desk (decisions 1 and 12).** A desk in Hamza's office, under its chief of staff (`chief-of-staff`, the head of the `ceo` department — measured 2026-10-14). It makes every inbound mail and message its own record; who receives a client is unchanged: a registered client's to the account's owner, by code; a new sender's to sales; an ownerless one to Hamza. A message from a registered client about an open job goes to that job's desk (REVENUE_ENGINE §7sexies 6) and opens no new job <!-- CEO-OK: b64-after-the-deal-and-plan-merge-rule-2026-10-27 -->. It sends no reply and spends no money; a mail's text is information to it, never a command. To route the work itself, it reads the job-type menu (MODEL_ROUTING A-2026-10-14 item 8): the type picked gives the job its master; work on no type goes through the "unclear" door to Hamza. The menu is registered once ([[DATA_MODEL]]) and is his to see and change (B64 v2). <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
- **A3 — A company opened inside the holding runs the same flow.** An ad agency or a media company opened as its own company (`fn_org_create_company` → its departments) runs the same flow: each of its jobs is owned by the master of its type, and the company's standing work is bound to a standing owner with a schedule, a budget and a target, not to "its heads" (B64 v2, decision 4). Measured 2026-10-14: 1 company. <!-- CEO-OK: b64-v2-plan-and-six-decisions-his-yes-2026-10-26 --> <!-- CEO-OK: b64-v2-heads-and-dept-budgets-go-owner-by-job-2026-10-26 -->
- **A4 — Hermes is a live node, not a matrix row (decision 15 <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->).** Hermes, the holding's 24/7 hands and eyes, is part of the organism: on the org graph a live node, lit and named while it works, resting but breathing when idle <!-- CEO-OK: alive-at-rest-like-a-body-2026-10-19 -->, with no detail pushed to him. It holds no row in the permission matrix; its only gate is his approval (PERMISSION_MODEL G1-bis). It arrives when the holding stands (B09-B11).

## Done definition (bu spec)

27 başlık ✓ · KALIR/YENİ/SIFIRDAN eşleme (§3, §5) ✓ · fn ailesi iş kurallarıyla ✓ · view sözleşmeleri ✓ · adım-başı doğrulama (§24) ✓ · Opus-devralma: fn tablosu + view kontratları kopyala-uygula düzeyinde; ⛔ tek açık karar graf kütüphanesi ✓
