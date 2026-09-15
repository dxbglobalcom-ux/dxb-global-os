# WORKFLOW_ENGINE_SPEC — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: direktif madde 6.4 (Workflow Settings, 17 kalem birebir) · Üst: [[SYSTEM_ARCHITECTURE]] §6 · Kardeşler: [[AGENT_ORCHESTRATION_SPEC]] (ajan adımı yürütücüsü), [[APPROVAL_ENGINE_SPEC]] (approval adımı), [[MODEL_ROUTING_SPEC]] (model atama), [[EVENT_MODEL]] (trigger + yayın)

## 1. Amaç

pg-boss üstünde CEO-görünür ve CEO-düzenlenebilir **deklaratif workflow varlığı**: bugün kod-tanımlı job zincirleri, DB'de yaşayan `workflows/workflow_steps` kayıtlarına taşınır; CEO dashboard'dan oluşturur, düzenler, kopyalar, durdurur, yeniden başlatır — kod dokunuşu olmadan (madde 2 "Bir workflow'u durdurabilmeli/yeniden başlatabilmeli" hükmünün motoru).

## 2. Gereksinimler (madde 6.4 → karşılık)

| Direktif kalemi | Karşılık |
|-----------------|----------|
| Oluşturma / düzenleme / kopyalama / devre dışı | `control_workflow_{create,update,copy,disable}` fn'leri ([[API_CONTRACTS]] 8b) |
| Trigger ayarlama | `workflows.trigger` jsonb: `{kind:'cron'|'event'|'manual', ...}` |
| Model atama | adım config `model_role_slot` → [[MODEL_ROUTING_SPEC]] slot çözümü (doğrudan model ID sabitlemek istisna, slot varsayılan) |
| Çalışan atama | adım config `employee_id` (aktif + persona v2 kapısı fn'de denetlenir) |
| Approval / review / retry / fallback adımı | `workflow_steps.kind` enum'u birebir (DATA_MODEL 4.4) |
| Bütçe sınırı / token sınırı / zaman aşımı | `workflows.budget_eur, token_limit, timeout_s` — koşu-düzeyi enforcement §17 |
| Risk seviyesi | `workflows.risk` → approval zorunluluğu eşiği ([[APPROVAL_ENGINE_SPEC]] risk matrisi) |
| Logging seviyesi | `workflows.logging_level: minimal|normal|verbose` — [[AUDIT_AND_LOGGING_SPEC]] §14 semantiği |
| Output standardı | `workflows.output_standard` → Opus 5 Hook post-gate denetim girdisi ([[FABLE_5_HOOK_SPEC]]) |

## 3. Mimari

```
trigger (cron | event | manual)
  → pg-boss job 'workflow.run' {workflow_id}
    → runner (packages/kernel içinde workflow modülü — YENİ; resident servis DEĞİL)
      adım döngüsü: workflow_steps sırayla (seq)
        agent    → orchestrator spawn (hook pre/post kapıları dahil)
        approval → approvals satırı aç → run status='waiting_approval' (PARK, retry değil)
        review   → reviewer çalışan koşusu; verdict fail → yapılandırılmış aksiyon (§17)
        retry    → önceki adım için policy uygula (max_attempts, backoff)
        fallback → alternatif adım/slot zincirine geç
      her geçiş: workflow_runs.status + task_events/agent_runs satırları + Broadcast (ops:live)
```

Karar (⛔ mimari-kritik): motor **kernel worker içinde kütüphane**dir, ayrı servis değildir (R5 RAM bütçesi + Opus işletim yükü). Ayrı servisleştirme ancak ölçüm + CEO onayıyla.

## 4. Veri modeli

`workflows, workflow_steps, workflow_runs` — [[DATA_MODEL]] 4.4 normatif ve yeterli; bu spec ek tablo AÇMAZ. Adım `config` jsonb şemaları `packages/shared/src/contracts/workflow-steps.ts` Zod'unda (kind-başı ayrı şema; fn yazımda doğrular).

## 5. Component yapısı / 6. Backend yapısı

- `packages/kernel/src/workflow/` — runner, step handlers (kind-başı bir dosya), trigger kaydedici.
- pg-boss job tipleri: `workflow.run` (koşu başlat/devam ettir) · `workflow.step` (tek adım — uzun adımlar için ayrı job, timeout izolasyonu) · cron trigger'lar pg-boss schedule API'siyle (`schedule('wf:<slug>', cron)`).
- Event trigger: EVENT_MODEL kanal olayı → kernel'deki eşleyici (`trigger.kind='event'` kayıtlarına abone tek dinleyici) → `workflow.run` job.
- Devam ettirme: approval kararı ([[APPROVAL_ENGINE_SPEC]] karar fn'i) `workflow.run` job'ını `{resume_from: step}` ile yeniden kuyruğa atar.

## 7. Frontend yapısı

Workflow Settings sayfası ([[SETTINGS_AND_CONTROL_SPEC]] §6.4 yüzeyi): adım listesi dikey kompozisyon (sürükle-sıra), adım-başı config formu (Zod şemasından türetilmiş), koşu geçmişi paneli (workflow_runs → drill-down agent_runs). Canlı koşu görünümü Live Operations'a gömülü (`corr.workflow_run_id` ile filtre).

## 8. API'ler

[[API_CONTRACTS]] 8b `workflows` alanı: create, update, copy, enable, disable, run_now, cancel_run, resume_run. Ek kontrat detayı: `update` yeni `version` üretir (aşağıda §10); `copy` slug'a `-copy-n` ekler, `enabled=false` başlar (yanlışlıkla çift cron yok).

## 9. Event yapısı

Yayınlar: `ops:live` üzerinden `run.*` type'ları (workflow_run corr'lu); `projects` kanalına `dependency.blocked` (proje-bağlı workflow'larda). Trigger tarafı: `trigger.kind='event'` eşleşmesi type + entity.kind filtresiyle (`{"kind":"event","match":{"type":"approval.decided","entity_kind":"approval"}}`).

## 10. State yönetimi (koşu durum makinesi + sürümleme)

- `workflow_runs.status`: `running → waiting_approval → running → succeeded|failed|cancelled`. `waiting_approval` PARK'tır — retry sayacı işlemez, timeout işlemez (insan kapısı sınırsız bekler; hatırlatma APPROVAL_ENGINE'de).
- Sürümleme (bağlayıcı): koşu, başladığı andaki `workflows.version` + adım seti **snapshot**'ıyla yürür (`workflow_runs` başlangıçta adım listesini config'iyle donduran `steps_snapshot` — runner belleğinde değil, run kaydının jsonb'sinde; DATA_MODEL 4.4'e kayıtlı ek: `workflow_runs.steps_snapshot jsonb`). Düzenleme koşan run'ı DEĞİŞTİRMEZ; yeni koşu yeni sürümle başlar.
- `current_step` her adım kapanışında güncellenir — kesinti sonrası kaldığı adımdan devam (pg-boss retry job'u aynı run'ı `resume_from` ile alır).

## 11. Database tabloları / 12. İlişkiler

DATA_MODEL 4.4 + kayıtlı ek: `workflow_runs.steps_snapshot jsonb NOT NULL DEFAULT '[]'` (Dalga 4 kapanışında DATA_MODEL'e işlenir). İlişki: `agent_runs.workflow_run_id` zinciri drill-down omurgası.

## 13. Yetkilendirme

Workflow CRUD yalnız CEO (control seam); `run_now` CEO veya sistem (cron/event); ajanlar workflow tanımını DEĞİŞTİREMEZ (gateway profillerinde workflow yazım fn'i yok). Çalışan ataması v2-persona-aktif kontrolünden geçer (HR kuralı fn içinde).

## 14. Logging / 15. Audit

`logging_level` semantiği: `minimal` = yalnız koşu başlangıç/bitiş + hata; `normal` = + adım geçişleri + karar özetleri; `verbose` = + tool_calls tam kaydı + adım config dump (özet+hash kuralı yine geçerli). Tanım değişiklikleri audit_log'a (`detail_ref` → settings_change_log değil, kendi fn audit satırı); koşu detayı observability ailesinde.

## 16. Security

Adım config'inde secret taşınamaz (Zod şemaları credential alanı içermez; vault referansı adı geçebilir, değeri asla). `risk='high'|'critical'` workflow'un para-çıkışı adımı üretmesi durumunda approval adımı OTOMATİK eklenir (fn, `outbox`a giden aksiyon tespit ederse approval'sız kaydı REDDEDER — B7b kapısının workflow karşılığı). Madde 4: yeni güvenlik bürokrasisi yok.

## 17. Error handling / 18. Retry / 19. Fallback

- Adım hatası sınıflaması SYSTEM_ARCHITECTURE §17 üçlüsü: transient → retry adımı/policy; policy (hook reddi) → escalation (FABLE_5_HOOK zinciri); fatal → run failed + `alerts` kanalına `alert.raised`.
- Retry adımı: `{max_attempts, backoff_s, on_exhaust: 'fail'|'fallback'|'escalate'}`.
- Fallback adımı: `{alternate_steps:[...]}` — ana adım tükenince alternatif zincir; model fallback'i AYRI mekanizmadır (model_catalog zinciri, orchestrator içinde).
- Bütçe/token/timeout enforcement: adım başlamadan `cost_ledger` koşu toplamı kontrol (aşımda run `failed`, sebep `BUDGET_EXCEEDED`); token_limit LiteLLM virtual key üstünden koşu-etiketli sayaç; timeout_s pg-boss job `expireInSeconds` karşılığı (approval parkı hariç).
- Review adımı fail: `{on_fail:'retry_prev'|'fallback'|'escalate'|'fail'}` — varsayılan `escalate`.

## 20. Test planı / 21. Acceptance criteria

- Birim: kind-başı step handler (mock orchestrator); durum makinesi geçiş tablosu testi.
- Entegrasyon: 5-adımlı örnek workflow (agent→review→approval→agent→bitiş) test DB'de uçtan uca; approval parkında retry/timeout işlemediği kanıtı.
- Kabul: madde 6.4'ün 17 kaleminin HER biri UI'dan ayarlanabilir ve koşuda etkisi gözlenebilir; koşan run düzenleme yapılınca etkilenmez (snapshot kanıtı); kesinti sonrası `resume_from` devam kanıtı.

## 22. Migration planı / 23. Rollback planı

0023x ailesi + `steps_snapshot` ek kolonu. Rollback: workflow tabloları DROP — mevcut kod-tanımlı pg-boss job'ları bağımsız yaşamaya devam eder (motor katmanı çıkarılabilir, çekirdek bozulmaz — bilinçli izolasyon).

## 24. Uygulama sırası (doğrulamalı)

```bash
supabase db push && psql "$DB" -c "\d workflow_runs" | grep steps_snapshot        # → kolon var
curl -s -X POST localhost:3000/api/control/workflows -H "Idempotency-Key: $(uuidgen)" -H "Cookie: $CEO_SESSION" \
  -d '{"action":"create","payload":{"slug":"smoke-wf","name":"Smoke","trigger":{"kind":"manual"},"steps":[{"kind":"agent","config":{"employee_id":"...","model_role_slot":"execution"}}]}}'
# → {"ok":true, ...}
curl -s -X POST ... -d '{"action":"run_now","payload":{"slug":"smoke-wf"}}'        # → run_id
psql "$DB" -c "SELECT status FROM workflow_runs ORDER BY started_at DESC LIMIT 1;" # → running|succeeded
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: pg-boss 12 (session-mode 5432 — transaction pooling YASAK), 0023x, orchestrator + hook entegrasyonu, APPROVAL karar yolu.
- Risk: event-trigger fırtınası (olay başına workflow) → eşleyicide workflow-başı eşzamanlılık kuralı: **singleton varsayılan** (`concurrency:'singleton'` — koşarken gelen tetik kuyruklanmaz, loglanır+atlanır; `'queue'` opt-in).
- Edge: devre dışı workflow'a tetik → skip + `task_events` notu; atanan çalışan arşivlenmiş → adım başlangıcında fn reddi → run failed sebepli; adım silinmiş sürümde resume → snapshot sayesinde eski adımla biter; cron + manual çakışması → singleton kuralı çözer; timeout approval parkında → işlemez (bilinçli), hatırlatma eskalasyonu APPROVAL_ENGINE'de.

> **E9.1 registered adaptations (2026-07-13, Fable in person — ticket
> `.planning/quick/20260713-e91-workflow-runner/PLAN.md`):**
> **A1 — run_now/resume enqueue path:** a Postgres control fn cannot call
> pg-boss `send()`; the fn writes the run row state and the kernel drain
> (`drainWorkflowRuns`, chained off the scheduler's pg-boss `workflow.run`
> queue, 10 s self-chain — intent-intake precedent) picks up actionable runs.
> §3 trigger→job semantics preserved; pg-boss stays the vehicle.
> **A2 — approval resume without touching 0015:** `decide_approvals` is
> LOCKED; the drain scans `waiting_approval` runs whose approvals row is
> decided — approved → resume (parked step + 1), rejected → run `failed`
> (`APPROVAL_REJECTED`, no alert: a human decision is not an alarm). E9.3 may
> move this to an explicit hook.
> **A3 — B7b detection key:** "outbox'a giden aksiyon" = agent step config
> carrying `outbox_action`; high/critical workflow with such a step and no
> EARLIER approval step is rejected at create/update (update re-scans existing
> steps when risk rises without a steps payload).
> **A4 — token_limit source until Phase 7:** LiteLLM run-tagged counters land
> with P7; until then `SUM(tokens_in+tokens_out)` / `SUM(cost_eur)` over the
> run's `agent_runs` rows is the enforcement source (single-source cost rule
> intact). Timeout excludes approval-park time by subtracting decided
> approvals' open intervals.
> **A5 — snapshot result bookkeeping:** the runner appends a `result`
> object into the run's own `steps_snapshot` entry as each step closes —
> run-record bookkeeping (what resume/review read), not definition drift;
> the workflow's step tables are never touched by the runner.
> **A6 — `workflow.step` job split** (long-step timeout isolation) is a P7
> runtime concern; the library exposes per-step execution so the split needs
> no API change. E9.1 runs steps in-process.

## Opus-devralma notu

Adım kind semantiği + durum makinesi + snapshot kuralı kapalıdır; Opus yeni adım kind'ı eklemez (⛔ — en güçlü model + CEO onayı), yeni workflow TANIMLARI eklemek serbesttir (veri işi, kod işi değil). Runner iskeleti kind-başı handler dosyalarıyla mekanik genişler.

## Registered adaptations — B43 the media studio (2026-09-15, W13)

**Registered adaptation (2026-09-15, B43 — W13, audit F061):** <!-- OPEN: B43 --> **The studio's production line is a real, repeated, ten-step chain — and it is not a workflow. The exception is recorded here rather than left silent.**

Measured on the company engine, 2026-09-15: the `workflows` table holds **0** rows. The studio has nevertheless produced films since 2026-09-03 along a fixed order of seats. That order lives in two places, neither of them this engine:

1. **Persona text** — the production line is written as the Creative Director's responsibility in `db/migrations/20260903001000_b43_media_studio_department.sql` and in the seats' own files under `personas/media-studio/`.
2. **The dispatch book** — `queue_dispatch` (`packages/dxb-mcp/src/groups/queue.ts`, contract and graph checks in `packages/dxb-mcp/src/dispatch-book.ts`, registered as AGENT_ORCHESTRATION A19): for each film the director turns a plan into one task per named seat, with dependencies, under his own task's project. It is a **per-job chain born at dispatch time**, not a stored template.

**The registered exception.** §1 of this spec says a code-defined chain becomes a `workflows` row. The studio's chain is code-defined *per job*: the seats, their levels and their budgets differ from film to film, and the director chooses them. It was therefore built as a dispatch book and not as a workflow template, and that is the state of the company today — recorded here so no later reader concludes the engine simply failed to register it.

**What it costs the CEO, named.** Because the **production line** is not an entity, he cannot see the studio's order of work from the cockpit, and he cannot change it without a persona being rewritten. That is the opposite of the third face of this product — *he changes anything at any moment*.

**The gap, named and not closed here.** Either the **dispatch book** gains a stored, CEO-editable template for the standard ten steps (a `workflows` row the director instantiates and may deviate from, with the deviation recorded), or the studio's screen gives him the order as an editable object. Both are builds. **Who closes it:** W14 with the screen plan, on his word.

## Done definition (bu spec)

27 başlık ✓ · madde 6.4'ün 17 kalemi birebir eşlendi ✓ · durum makinesi + snapshot sürümleme ✓ · park≠retry ayrımı ✓ · B7b workflow karşılığı (approval'sız para-çıkışı reddi) ✓ · doğrulama komutları ✓ · KALIR/YENİ (motor=kütüphane kararı ⛔) ✓ · Opus-devralma ✓
