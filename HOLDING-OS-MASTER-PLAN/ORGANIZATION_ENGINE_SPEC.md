# ORGANIZATION_ENGINE_SPEC — ORGANİZASYON MOTORU

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: §15 (Organization Intelligence) + madde 5.3 (Organizational Graph) + madde 2 (CEO org yetkileri)
> Üst: [[SYSTEM_ARCHITECTURE]] · Şema: [[DATA_MODEL]] §4.1 (0020x org ailesi) · Tüketiciler: [[HR_OPERATING_SYSTEM_SPEC]], [[CEO_COMMAND_CENTER_SPEC]] (/org/* rotaları), [[PERMISSION_MODEL]]

## 1. Amaç

Holding organizasyonunun (holding → company → department → director → senior_specialist → specialist → ops_agent → sub_agent) DB'de birinci-sınıf, UI'da interaktif-graf olarak yaşaması. İki yüz: (a) **okuma** — org graph 7 görünüm modunda, her node tıklanabilir, sonsuz drill-down; (b) **yazma** — CEO'nun madde 2 org yetkileri (taşı, bağla, askıya al, müdür değiştir, model grubu ata) tek yazım seamından, audit'li ve geri-alınabilir.

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

- Hiyerarşi türetimi: departman zinciri `departments.parent_id`; insan zinciri `agents.manager_id`. İkisi tutarlı olmalı — kural: `agents.manager_id` işaret ettiği yönetici, çalışanla aynı `department_id`'de YA DA departmanın `director_id`'sidir; ihlal fn'de reddedilir.
- `sub_agent` kalıcı org üyesi değildir: org grafında yalnız CANLI sub-agent'lar gösterilir (`agent_runs.parent_run_id` zincirinden türetilir), `agents` satırı açılmaz.
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
| `fn_org_assign_model_group(model_id,employee_ids[])` | model_catalog'da `banned=false`; her çalışan için decision_log satırı |
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

- Org mutasyonu: yalnız `ceo` rolü (fn içi kontrol). `system` (HR fn'leri) yalnız `fn_org_move_employee/suspend/reactivate/archive` çağırabilir — HR akışları da aynı seamdan geçer, ikinci yazım yolu açılmaz.
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

- CEO org grafında bir uzmanı başka müdüre sürükler → 2sn içinde graf yeni yapıyı gösterir, audit_log satarı sorgulanabilir, çalışan koşusu kesilmemiştir (G6 kanıtı).
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
- Edge: müdürsüz departman (director_id NULL) — graf "vekâlet" rozetiyle gösterir, HR alert'i açılır; çalışan kendi kendinin müdürü — trigger reddi; aynı anda iki taşıma (CEO + HR) — satır kilidi fn içinde (`SELECT ... FOR UPDATE`), ikinci işlem güncel durumla yeniden doğrulanır; company arşivi — altındaki tüm departman/çalışan arşivlenmeden RED.

## Done definition (bu spec)

27 başlık ✓ · KALIR/YENİ/SIFIRDAN eşleme (§3, §5) ✓ · fn ailesi iş kurallarıyla ✓ · view sözleşmeleri ✓ · adım-başı doğrulama (§24) ✓ · Opus-devralma: fn tablosu + view kontratları kopyala-uygula düzeyinde; ⛔ tek açık karar graf kütüphanesi ✓
