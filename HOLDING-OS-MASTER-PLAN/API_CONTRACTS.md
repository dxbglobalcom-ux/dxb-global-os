# API_CONTRACTS — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] §8 · Kardeşler: [[DATA_MODEL]] (şema), [[EVENT_MODEL]] (canlı yayın), [[PERMISSION_MODEL]] (yetki matrisi)
> Kaynak hüküm: direktif madde 15 ("bu belgeler birbirleriyle tutarlı olmalıdır") — bu dosya API'nin TEK sözlüğüdür; başka spec API şekli tanımlayamaz, buraya devreder.

## 1. Amaç

Üç API sınıfının bağlayıcı kontratı: (A) **okuma** — PostgREST + SQL view'ları, (B) **mutasyon** — `/api/control/*` route handler'ları → SECURITY DEFINER fn, (C) **ajan-içi** — MCP gateway profilleri + LiteLLM virtual keys. Dashboard'un DB'de karşılığı olmayan hiçbir veriyi gösterememesi ve CEO'nun her değişiminin tek seam'den geçmesi bu kontratla garanti edilir.

## 2. Gereksinimler

- G1. Her mutasyon idempotent çağrılabilir (Idempotency-Key zorunlu) — Broadcast kopması/çift tık çift yazım üretemez.
- G2. Sayfa-başı tek round-trip hedefi: özet sayılar `v_*` view'larından, drill-down FK zinciriyle (madde 3B).
- G3. Hata gövdeleri iki dilli (EN birincil, TR tam — A2) ve makine-okunur `code` taşır.
- G4. Raw provider key hiçbir istek/yanıt/config'de bulunamaz (LiteLLM virtual keys — sert kural).
- G5. Kontrat tipleri tek kaynaktan: `packages/shared/src/contracts/` Zod şemaları; route handler ve UI aynı şemayı import eder.

## 3. Mimari (üç sınıf)

| Sınıf | Taşıyıcı | Yetki | Etiket |
|-------|----------|-------|--------|
| A Reads | PostgREST (`@supabase/ssr`, RSC'de) + `v_*` view'ları | `authenticated` + CEO claim; RLS | KALIR+GENİŞLER (0019 aggregate açık) |
| B Mutations | Next.js route handler `/api/control/{alan}/{eylem}` → DB fn | session cookie (CEO) → fn içi rol denetimi | YENİ (0015 emsalinin genellemesi) |
| C Ajan-içi | MCP gateway (8 grup: approval, audit, cost, crm, dashboard, memory, queue, registry) + LiteLLM | profil-başı least-privilege | KALIR |

Ajanlar B sınıfını ASLA çağırmaz (control-plane insan+sistem seamidir); ajan mutasyonları C üzerinden kendi MCP profiline izinli fn'lere gider.

## 4. Veri modeli (API destek nesneleri — `0025x_api_support`)

```sql
CREATE TABLE control_idempotency (
  key text PRIMARY KEY,                -- istemci üretir (uuid)
  request_digest text NOT NULL,        -- gövde hash'i; aynı key farklı gövde = 409
  response jsonb NOT NULL,             -- ilk başarılı yanıt aynen döner
  created_at timestamptz NOT NULL DEFAULT now()
);
-- v_exec_overview, v_live_ops, v_org_tree, v_project_command,
-- v_cost_breakdown, v_library_catalog view tanımları bu migration'da (§8 katalog).
```

DATA_MODEL ile mutabakat: bu nesneler D4 ekidir; DATA_MODEL §20 tablosuna `0025x` satırı Dalga 4 kapanışında işlenir (sessiz sapma değil, kayıtlı devir).

## 5. Component yapısı / 6. Backend yapısı

- Route handler iskeleti (her alan aynı desen): auth kontrol → Zod parse → idempotency kontrol → `SELECT control_fn(...)` → yanıt + Broadcast zaten fn içinde.
- Konum: `apps/dashboard/src/app/api/control/{alan}/route.ts`; alan-başı tek dosya, eylem gövdede (`action` alanı) — route patlaması yok.
- DB fn adlandırma: `control_{alan}_{eylem}` (örn. `control_settings_set`, `control_org_move_employee`).

## 7. Frontend yapısı

UI mutasyonları tek client helper'dan geçer: `packages/shared/src/contracts/client.ts` → `control(alan, eylem, payload)` — Idempotency-Key üretimi, hata i18n çevirisi, undo_token yakalama burada. Komponent içinden fetch YASAK.

## 8. API'ler (bağlayıcı katalog)

### 8a. Mutasyon zarfı (tüm alanlar aynı)

```
POST /api/control/{alan}
Headers: Idempotency-Key: <uuid> · Cookie: sb-* (Supabase Auth session)
Body:   { "action": "<eylem>", "payload": { ... } }        // Zod şeması alan+eylem başına
Yanıt:  { "ok": true, "change_id": "<id>", "affected": ["tablo:id", ...], "undo_token": "<opsiyonel>" }
Hata:   { "ok": false, "code": "<KOD>", "message_en": "...", "message_tr": "...", "retryable": false }
```

### 8b. Alan × eylem envanteri (ilk teslim kapsamı)

| Alan | Eylemler | DB fn ailesi | Not |
|------|----------|--------------|-----|
| `settings` | set, undo | `control_settings_*` | undo = change_log satırından ters yazım ([[SETTINGS_AND_CONTROL_SPEC]]) |
| `org` | create_company, create_department, assign_director, move_employee, suspend, reactivate, archive | `control_org_*` | org Broadcast olayları ([[ORGANIZATION_ENGINE_SPEC]] §9) |
| `hr` | create_employee, update_persona, promote_version, set_status | `control_hr_*` | v2 kalite kapısı fn içinde ([[HR_OPERATING_SYSTEM_SPEC]]) |
| `models` | set_role_slot, set_fallback, set_catalog_status | `control_models_*` | Sonnet-ban denetimi fn içinde ([[MODEL_ROUTING_SPEC]]) |
| `workflows` | create, update, copy, enable, disable, run_now, cancel_run, resume_run | `control_workflow_*` | [[WORKFLOW_ENGINE_SPEC]] |
| `projects` | create, update, set_status, add_milestone, set_dependency, add_member, log_risk | `control_project_*` | [[PROJECT_OPERATING_SYSTEM_SPEC]] |
| `library` | register_item, update_item, grant, revoke_grant | `control_library_*` | [[HOLDING_LIBRARY_SPEC]] |
| `memory` | archive_item, edit_item, reclassify, set_scope | `control_memory_*` | [[MEMORY_ARCHITECTURE]] §8 |
| `audit` | mark_reviewed | `control_audit_mark_reviewed` | tek yazılabilir audit alanı ([[AUDIT_AND_LOGGING_SPEC]] §8) |
| `approvals` | decide (approve/reject) | mevcut 0015 fn'i | KALIR — para-çıkışı kapısı DOKUNULMAZ |
| `alerts` | acknowledge, mute | `control_alerts_*` | [[OBSERVABILITY_SPEC]] |

### 8c. Okuma view kataloğu

| View | Beslediği yüzey | İçerik sözü |
|------|-----------------|-------------|
| `v_exec_overview` | Executive Overview (§12) | tüm özet sayılar tek satırda; her sayı drill-down rotası taşır |
| `v_live_ops` | Live Operations (§14) | `agent_runs`+`task_events` birleşimi, son N dakika |
| `v_org_tree` | Organization Intelligence (§15) | recursive hiyerarşi + durum/maliyet özetleri |
| `v_project_command` | Project Command View (§23) | proje-başı 27 alan karşılığı (D4 PROJECT_OS §8) |
| `v_cost_breakdown` | Cost Intelligence (§20) | gün/departman/model/ajan kırılımı |
| `v_library_catalog` | Holding Library (madde 13) | item + grant sayısı + son kullanım |

PostgREST kuralları: filtre/sıralama PostgREST sözdizimiyle; sıralama HER ZAMAN deterministik (`order=...,id`); sayfalama `Range` header; UI ham tabloya değil view'a abone.

## 9. Event yapısı

API senkron sonuç döner; canlılık [[EVENT_MODEL]] Broadcast kanallarından gelir. Kontrat: mutasyon yanıtındaki `change_id`, ilgili Broadcast olayının `payload.change_id`'siyle aynıdır — UI optimistic update'i bu anahtarla mutabakatlar.

## 10. State yönetimi

İstemci mutasyon durumu (pending/fail) geçicidir; kalıcı gerçek DB + Broadcast. `undo_token` yalnız son değişimi işaret eder, saklanmaz (undo geçmişi `settings_change_log`da).

## 11. Database tabloları / 12. İlişkiler

`control_idempotency` (yukarıda) + view'lar. İlişki: view'lar şemaya bağımlı, tersi yasak; view değişimi migration'dır (görünüm sürümleme: değişen view DROP+CREATE, aynı migration'da).

## 13. Yetkilendirme

- B sınıfı: fn içinde `auth.uid()` CEO kontrolü (0015 emsali); handler'da yalnız oturum varlığı denetlenir — güvenlik sınırı DB'dedir.
- A sınıfı: RLS read-policy seti (0014 deseninin yeni tablolara kopyası).
- C sınıfı: gateway profili + `library_grants` (skill/tool erişimi) — [[PERMISSION_MODEL]] normatif.

## 14. Logging / 15. Audit

Her B çağrısı fn içinde `audit_log` satırı üretir (`detail_ref` aile-log köprüsü — [[AUDIT_AND_LOGGING_SPEC]]). Handler ayrıca pino'ya `{alan, eylem, change_id, süre}` yazar; payload içeriği loglanmaz (özet+hash — OBSERVABILITY kuralı).

## 16. Security

Madde 4 sınırı: yeni auth mekanizması YOK — mevcut Supabase Auth session + service_role deseni. CSRF: same-origin + çift-submit token Next.js varsayılanı; dışa açık API YOK (Caddy yalnız dashboard host'unu yayınlar). Ertelenen kalemler (rate-limit, IP allowlist) [[SECURITY_MODEL]] sicilinde.

## 17. Error handling / 18. Retry / 19. Fallback

Hata kod sözlüğü (bağlayıcı): `VALIDATION_FAILED` · `PERMISSION_DENIED` · `APPROVAL_REQUIRED` (mutasyon onaya dönüştü — yanıt `approval_id` taşır) · `BUDGET_EXCEEDED` · `CONFLICT_STALE` (optimistic concurrency: beklenen sürüm eskimiş) · `IDEMPOTENCY_MISMATCH` (aynı key farklı gövde) · `RATE_LIMITED` · `INTERNAL`. Retry: yalnız `retryable:true` (RATE_LIMITED, INTERNAL-geçici); istemci aynı Idempotency-Key ile tekrar eder. Fallback: Broadcast kopuksa UI snapshot re-fetch'e düşer (EVENT_MODEL §17).

## 20. Test planı / 21. Acceptance criteria

- Kontrat testi: her alan×eylem için Zod şema round-trip + fn çağrı entegrasyonu (vitest, test DB).
- Idempotency kanıtı: aynı key iki POST → tek `settings_change_log` satırı, ikinci yanıt birebir aynı gövde.
- Kabul: 8b envanterindeki her eylem ya çalışır ya da `APPROVAL_REQUIRED` üretir; hiçbir eylem sessizce no-op olamaz.

## 22. Migration planı / 23. Rollback planı

`0025x_api_support` (view'lar + control_idempotency); rollback: view'lar DROP (durumsuz), `control_idempotency` DROP (kayıp yalnız yanıt önbelleği — güvenli). Sıra: 0020x-0024x'ten SONRA (view'lar aile tablolarına bağımlı).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push
curl -s -X POST localhost:3000/api/control/settings \
  -H "Idempotency-Key: 11111111-1111-1111-1111-111111111111" -H "Cookie: $CEO_SESSION" \
  -d '{"action":"set","payload":{"key":"orchestrator.primary_model","scope":"global","value":"fable-5"}}'
# → {"ok":true,"change_id":...}  (aynı komut ikinci kez → birebir aynı yanıt, yeni change_log satırı YOK)
psql "$DB" -c "SELECT count(*) FROM settings_change_log WHERE key='orchestrator.primary_model';"  # → 1
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: 0020x-0024x aileleri, packages/shared Zod 4, Supabase Auth session.
- Risk: view şişmesi (tek round-trip uğruna dev view) — kural: view > 15 kolonsa böl, UI iki istek atar; ölçüm System Health'e.
- Edge: idempotency key çakışması farklı eylemle → `IDEMPOTENCY_MISMATCH` 409; fn içi hata SONRASI Broadcast gitmişse → olay `change_id`siz doğrulanamaz, UI re-fetch (kaynak gerçek DB); `control_idempotency` büyümesi → 7 günden eski satırlar prune job'ıyla silinir (AUDIT §22 prune ailesi).

## Opus-devralma notu

Zarf + kod sözlüğü + alan×eylem envanteri + view kataloğu bu dosyada kapalıdır; Opus yeni alan eklerken 8a zarfını ve fn adlandırmasını aynen kopyalar. ⛔ tek kritik karar: zarf şekli değişikliği (breaking) — ancak eldeki en güçlü model + CEO onayıyla.

## Done definition (bu spec)

27 başlık ✓ · üç API sınıfı + bağlayıcı zarf ✓ · alan×eylem envanteri ✓ · view kataloğu ✓ · hata kod sözlüğü ✓ · idempotency kontratı + kanıt komutu ✓ · KALIR/YENİ eşlemesi ✓ · Opus-devralma + ⛔ ✓
