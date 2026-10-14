# API_CONTRACTS — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] §8 · Kardeşler: [[DATA_MODEL]] (şema), [[EVENT_MODEL]] (canlı yayın), [[PERMISSION_MODEL]] (yetki matrisi)
> Kaynak hüküm: direktif madde 15 ("bu belgeler birbirleriyle tutarlı olmalıdır") — bu dosya API'nin TEK sözlüğüdür; başka spec API şekli tanımlayamaz, buraya devreder.

## 1. Amaç

Üç API sınıfının bağlayıcı kontratı: (A) **okuma** — PostgREST + SQL view'ları, (B) **mutasyon** — `/api/control/*` route handler'ları → SECURITY DEFINER fn, (C) **ajan-içi** — MCP gateway profilleri + LiteLLM virtual keys. Dashboard'un DB'de karşılığı olmayan hiçbir veriyi gösterememesi ve CEO'nun her değişiminin tek seam'den geçmesi bu kontratla garanti edilir.

## 2. Gereksinimler

- G1. Her mutasyon idempotent çağrılabilir (Idempotency-Key zorunlu) — Broadcast kopması/çift tık çift yazım üretemez.
- G2. Sayfa-başı tek round-trip hedefi: özet sayılar `v_*` view'larından, drill-down FK zinciriyle (madde 3B).
- G3. Hata gövdeleri iki dilli (EN birincil, TR tam — A2) ve makine-okunur `code` taşır.
- G4. Raw provider key hiçbir istek/yanıt/config'de bulunamaz (LiteLLM virtual keys — sert kural). One registered exception: the Hermes-only key (B64 decision 15 — protected: vault, Hermes alone, never in repo, prompt or output; [[SECURITY_MODEL]] O4). Jev's Vercel AI Gateway key lives in LiteLLM's environment like every provider key. <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 -->
- G5. Kontrat tipleri tek kaynaktan: `packages/shared/src/contracts/` Zod şemaları; route handler ve UI aynı şemayı import eder.

## 3. Mimari (üç sınıf)

| Sınıf | Taşıyıcı | Yetki | Etiket |
|-------|----------|-------|--------|
| A Reads | PostgREST (`@supabase/ssr`, RSC'de) + `v_*` view'ları | `authenticated` + CEO claim; RLS | KALIR+GENİŞLER (0019 aggregate açık) |
| B Mutations | Next.js route handler `/api/control/{alan}/{eylem}` → DB fn | session cookie (CEO) → fn içi rol denetimi | YENİ (0015 emsalinin genellemesi) |
| C Ajan-içi | MCP gateway (8 grup: approval, audit, cost, crm, dashboard, memory, queue, registry) + LiteLLM | profil-başı least-privilege | KALIR |

Ajanlar B sınıfını ASLA çağırmaz (control-plane insan+sistem seamidir); ajan mutasyonları C üzerinden kendi MCP profiline izinli fn'lere gider. Hamza carries the CEO's word to a setting's one door through C, never B (B64 A1 below).

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
| `models` | set_role_slot, set the backup pair by role (replaces `set_fallback`, whose path closes with B66 — B64 A4), set_catalog_status, add_model, test_model | `control_models_*` | banned/mechanical_only denetimi fn içinde ([[MODEL_ROUTING_SPEC]]; Sonnet runtime SERBEST — CEO 2026-07-12); add_model→testing→duman→active akışı §4c |
| `jobs` | stop, cancel | `control_job_*` (named at build) | every job can be stopped and cancelled (B64 A2) |
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
| the Reception view (B64, named at build) | the Reception desk's section | every inbound record: when it came, from whom, its class, the owner it went to, what happened to it |
| the Customers view (B64, named at build) | the Customers view of the Reception desk | the same inbound records grouped by client; each client links to `/revenue/crm/[id]` |
| the job desk view (B64, named at build) | a job's drill-down; Hamza's "Sitenin neresindesiniz, tasarımı getirin" | the job's brief, owner, value tier, plan, parts (brain, effort, reason), outputs, cost, state, due date |

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

Madde 4 sınırı: yeni auth mekanizması YOK — mevcut Supabase Auth session + service_role deseni. CSRF: same-origin + çift-submit token Next.js varsayılanı; the holding's own API stays closed to the outside (Caddy yalnız dashboard host'unu yayınlar). Hermes's message door — WhatsApp's official business channel and Telegram (B64 decision 15) — if it needs a public endpoint, that endpoint is Hermes's gateway alone, on the holding's server (B09-B11). Ertelenen kalemler (rate-limit, IP allowlist) [[SECURITY_MODEL]] sicilinde.

## 17. Error handling / 18. Retry / 19. Fallback

Hata kod sözlüğü (bağlayıcı): `VALIDATION_FAILED` · `PERMISSION_DENIED` · `APPROVAL_REQUIRED` (mutasyon onaya dönüştü — yanıt `approval_id` taşır) · `BUDGET_EXCEEDED` · `PRICE_UNKNOWN` (B64: a budgeted job waits until its model's price is entered — never counted as 0) · `CONFLICT_STALE` (optimistic concurrency: beklenen sürüm eskimiş) · `IDEMPOTENCY_MISMATCH` (aynı key farklı gövde) · `RATE_LIMITED` · `INTERNAL`. Retry: yalnız `retryable:true` (RATE_LIMITED, INTERNAL-geçici); istemci aynı Idempotency-Key ile tekrar eder. Fallback: Broadcast kopuksa UI snapshot re-fetch'e düşer (EVENT_MODEL §17).

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
  -d '{"action":"set","payload":{"key":"alerts.queue_age_max_minutes","scope":"global","value":30}}'
# → {"ok":true,"change_id":...}  (aynı komut ikinci kez → birebir aynı yanıt, yeni change_log satırı YOK)
psql "$DB" -c "SELECT count(*) FROM settings_change_log WHERE key='alerts.queue_age_max_minutes';"  # → 1
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: 0020x-0024x aileleri, packages/shared Zod 4, Supabase Auth session.
- Risk: view şişmesi (tek round-trip uğruna dev view) — kural: view > 15 kolonsa böl, UI iki istek atar; ölçüm System Health'e.
- Edge: idempotency key çakışması farklı eylemle → `IDEMPOTENCY_MISMATCH` 409; fn içi hata SONRASI Broadcast gitmişse → olay `change_id`siz doğrulanamaz, UI re-fetch (kaynak gerçek DB); `control_idempotency` büyümesi → 7 günden eski satırlar prune job'ıyla silinir (AUDIT §22 prune ailesi).

## Opus-devralma notu

Zarf + kod sözlüğü + alan×eylem envanteri + view kataloğu bu dosyada kapalıdır; Opus yeni alan eklerken 8a zarfını ve fn adlandırmasını aynen kopyalar. ⛔ tek kritik karar: zarf şekli değişikliği (breaking) — ancak eldeki en güçlü model + CEO onayıyla.

## Registered adaptations — B64 how work reaches the holding (2026-10-14)

Design: `.planning/quick/20261012-b64-is-akisi/is-akisi.html` (v15). Nothing below is built yet; names are chosen at build. <!-- OPEN: B64 -->

- **A1 — Hamza at a setting's door (E12, E16).** <!-- CEO-OK: b64-decision6-hamza-changes-brains-on-his-word-2026-10-13 --> On his word Hamza changes a brain or an effort — his own, for one conversation, or in bulk ("Bütün müdürleri xhigh yap") — by calling that setting's one door through class C, the same fn the dashboard reaches through B. The fn applies, records and can undo; the actor is recorded as the CEO's word via Hamza, with the sentence's reference. The word is accepted only from his chat, his voice or his own screen — never from a mail, any inbound text, or anything Hermes brings back. This opens only after the routing door that runs without login is closed: `fn_update_routing` EXECUTE-able by anon.
- **A2 — Every job can be stopped and cancelled (E08).** <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 --> A `jobs` area (§8b): stop and cancel, his to call through B and the machine's through its own fn; a cancelled or stopped job publishes `job.stopped` / `job.cancelled` ([[EVENT_MODEL]] B64).
- **A3 — Three reads (E04, E06).** <!-- CEO-OK: b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14 --> The Reception view, the Customers view and the job desk view (§8c). They read the inbound record and the job record ([[DATA_MODEL]] B64 A2, A3); the Reception and Customers screens are drawn for him first.
- **A4 — The backup pair is set by role (E23).** <!-- CEO-OK: b64-decision14-model-room-2026-10-14 --> `models` sets the pair — main brain ⇄ backup brain — by role, never a per-model fallback chain; `set_fallback`'s path closes with B66.
- **A5 — Hermes's message door (E24).** <!-- CEO-OK: b64-decision15-hermes-holding-hands-and-eyes-2026-10-14 --> §16: if WhatsApp's or Telegram's channel needs a public endpoint, it is Hermes's gateway alone, on the holding's server; the holding's API stays closed to the outside. G4: the Hermes-only key is the one registered exception to "no raw provider key".
- **A6 — `PRICE_UNKNOWN` (E29(1); in B64's plan for his yes).** A model with no price is "cost unknown", never 0; a budgeted job's call returns `PRICE_UNKNOWN` and the job waits until the price is entered ([[COST_CONTROL_SPEC]] B64).
- **A7 — §24's example** no longer sets `orchestrator.primary_model` to `fable-5`: management work runs on Opus 5.5 (B64 decision 2's guide) and the model keys live in routing.

## Done definition (bu spec)

27 başlık ✓ · üç API sınıfı + bağlayıcı zarf ✓ · alan×eylem envanteri ✓ · view kataloğu ✓ · hata kod sözlüğü ✓ · idempotency kontratı + kanıt komutu ✓ · KALIR/YENİ eşlemesi ✓ · Opus-devralma + ⛔ ✓
