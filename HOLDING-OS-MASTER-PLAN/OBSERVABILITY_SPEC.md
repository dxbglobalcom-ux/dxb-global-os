# OBSERVABILITY_SPEC — FULL OBSERVABILITY KATMANI

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[COST_CONTROL_SPEC]] (10.5 sahibi), [[AUDIT_AND_LOGGING_SPEC]] (D4 — audit derinliği), [[CEO_COMMAND_CENTER_SPEC]] (tüketici)
> Direktif kaynağı: madde 10.1-10.6 ("CEO sistemde olan HER ŞEYİ görebilmelidir") + madde 5.2 (Live Operations soruları).

## 1. Amaç

Sistemde olan her şeyin — ajan koşuları, kararlar, tool çağrıları, dosya değişimleri, maliyet, sistem sağlığı — DB'de birinci sınıf, sorgulanabilir, canlı yayınlanan kaydı. Madde 5.2'nin 20 sorusunun HER BİRİ bir kolona/join'e karşılık gelir; cevapsız soru = eksik şema = RET.

## 2. Gereksinimler

- R1. Madde 10.1-10.6 altı katmanın tamamı; 10.5 (cost) normatif olarak [[COST_CONTROL_SPEC]]'te, akış burada tanımlı `cost_ledger` beslemesiyle.
- R2. Append-only: gözlem tabloları UPDATE/DELETE almaz (tek istisna: agent_runs kapanış kolonları). Gözlem verisi kanıttır.
- R3. Yeni resident servis YASAK (SYSTEM_ARCHITECTURE R5): toplama kernel/worker İÇİNDEN, health snapshot pg-boss tekrarlı job'uyla.
- R4. Canlılık: `ops:live` (1sn toplu) + `alerts` Broadcast kanalları; UI'da sahte canlılık göstergesi yasak (stale >10sn işaretlenir).
- R5. 8GB VPS disk disiplini: partitioning + retention (aşağıda §22); gözlem verisi sistemin kendisini boğamaz.
- R6. Her önemli karar gerekçeli (madde 10.2): gerekçesiz decision_log satırı yazılamaz (NOT NULL).

## 3. Mimari

```
ajan koşusu (Claude Agent SDK sarmalayıcı, packages/orchestrator)
 ├─ açılış: agent_runs INSERT (running)
 ├─ her tool çağrısı: tool_calls INSERT (batch buffer, 2sn/20 kayıt flush)
 ├─ dosya işlemi: file_changes INSERT (diff özeti + hash)
 ├─ karar anları: decision_log INSERT (gerekçe zorunlu)
 └─ kapanış: agent_runs UPDATE (status, tokens, cost, review_result)
      └─ trigger → cost_ledger satırı (COST_CONTROL beslemesi)
      └─ trigger → ops:live Broadcast (toplu yayın)
sistem sağlığı: pg-boss 'health-probe' job (60sn) → system_health_snapshots
      └─ eşik ihlali → alerts INSERT → alerts Broadcast
```

⛔ mimari-kritik: gözlem yazımı ajan yolunu BLOKLAMAZ — buffer + async flush; flush hatası ajanı durdurmaz, kendisi alert üretir (gözlem sistemi işin önüne geçemez).

## 4. Veri modeli

[[DATA_MODEL]] görünürlük ailesi (0022x) normatif tanım:

```sql
agent_runs (
  id uuid PK, task_id FK→tasks, employee_id FK→employees,
  spawned_by uuid null REFERENCES agent_runs(id),  -- alt-ajan zinciri (5.2)
  workflow_run_id uuid null, project_id uuid null,
  model_id text, started_at, ended_at null,
  status text,               -- running|succeeded|failed|cancelled|paused|awaiting_approval
  input_summary text, output_summary text,          -- 10.1 Input/Output (özet; ham içerik loglanmaz)
  tokens_in bigint, tokens_out bigint, cost numeric,
  error text null, retry_count int default 0,
  review_result text null,   -- 10.1 Review sonucu
  progress int null          -- 5.2 "yüzde kaç tamamlandı"
)
decision_log (
  id uuid PK, at timestamptz, actor text,           -- employee_id|'orchestrator'|'kernel'|'ceo'
  agent_run_id uuid null, kind text,                -- routing_decision|task_plan|escalation|override|...
  decision text NOT NULL, rationale text NOT NULL,  -- 10.2 gerekçe zorunlu
  inputs_used jsonb,          -- hangi veriler (10.2)
  alternatives jsonb,         -- değerlendirilen alternatifler
  confidence numeric null, risk text null,
  approval_id uuid null,      -- approval gerekiyorduysa bağ
  outcome text null           -- sonradan kapatılabilir tek alan (append istisnası değil: ayrı outcome tablo yerine nullable kolon — U kaydı gerekmez, INSERT sonrası tek UPDATE'e izinli ikinci istisna)
)
tool_calls (
  id uuid PK, agent_run_id FK, at, tool text, params_summary jsonb,
  duration_ms int, ok boolean, error text null, result_summary text
)
file_changes (
  id uuid PK, agent_run_id FK, at, op text,         -- read|create|modify|delete
  path text, diff_summary text,                     -- ± satır sayısı + başlık; tam diff git'te
  commit_ref text null, task_id uuid, review_status text null,
  rollback_ref text null                            -- 10.4 rollback imkânı: geri alma commit'i
)
alerts (
  id uuid PK, at, level text,   -- informational|attention|high|critical|emergency (§22 seviyeleri)
  source text, title text, affected_area text,
  probable_cause text, suggested_action text,
  responsible_employee uuid null, mitigation text null,
  acknowledged_at null, resolved_at null, ceo_action text null
)
system_health_snapshots (
  at timestamptz PK, provider_status jsonb, db_health jsonb,
  queue_depth jsonb, agent_runtime jsonb, api_health jsonb,
  memory_health jsonb, vector_health jsonb, plugin_health jsonb,
  integration_health jsonb, error_rate numeric, p95_latency_ms int,
  cpu numeric, ram numeric, disk numeric              -- 10.6 tam seti
)
```

Madde 5.2 eşleme kontrolü: 20 sorunun kaynağı — kim/görev/veren/workflow/model/token/maliyet/süre/araçlar/okunan-değişen dosyalar/kararlar/alt ajanlar/çıktılar/hata/retry/approval/paused/cancelled/completed → yukarıdaki kolonlar + tasks.created_by join'i. Eşlenmemiş soru YOK.

> **Registered adaptations — E8.4b (2026-07-13, ticket `.planning/quick/20260713-e84b-alert-center/`):**
> A1. `alerts` additive columns: `dedup_key` (unique WHERE resolved_at IS NULL — storm dedup, §26), `run_id`/`task_id`/`source_ref jsonb` (§12 "gevşek bağ" made concrete: envelope corr + drill target), `escalated_at`/`escalated_from` (GAP-10 escalation), `muted_until` (API_CONTRACTS `mute` op = per-alert snooze).
> A2. Escalation defined (GAP-10): unacknowledged past per-level deadline (settings `alerts.escalate_after_minutes`, default attention 240m / high 60m / critical 15m) → ONE level bump (…→emergency), swept by `fn_alerts_evaluate()`; time-based checks (queue age, heartbeat, escalation) live in that fn — Phase-7 pg-boss 'alert-evaluate' job adopts it (R3 held).
> A3. Single broadcast producer: alerts-table trigger emits alert.raised/acknowledged/resolved/escalated; every source (run failure, cost 70/90/100, budget stop, fallback ≥2/exhausted, flagged review, obs spill, evaluate fn) INSERTs a row instead of broadcasting directly.
> A4. Heartbeat source = `system_health_snapshots` freshness (table created in E8.4b; probe job Phase 7); empty table → no alert (honest pre-Phase-7 state).
> A5. Alert title/cause/action strings are system artifacts in ENGLISH (language directive); UI chrome fully bilingual — same data-vs-chrome rule as audit payloads and task objectives.
> A6. Success supersedes the failure alarm (CEO order 2026-07-18 eye session, migration `20260718210000`): when a task transitions to `done`, its still-active `task_id`-bound alerts auto-resolve with an explicit mitigation note (`trg_alert_supersede_on_task_done`). Rides the A3 single-producer trigger for `alert.resolved` broadcasts. Scope: task-bound alerts only — cost/budget/hook/obs alerts keep their own lifecycles. Precedent: E12.5 wave left 123 success-superseded alarms burying 7 real criticals; manual governed sweep (control_alerts_action ×123, audit +123) preceded this permanent rule.

## 5. Component yapısı

| Bileşen | Sayfa | İçerik |
|---------|-------|--------|
| `LiveOpsPanel` | `/live` + Overview | stream (son olaylar) · agent grid (durum matrisi) · timeline · process graph — 4 görünüm, §14 direktifi |
| `AgentRunDrawer` | her yerden | koşu detayı: 10.1 tam seti + tool/file/karar sekmeleri + alt-ajan ağacı |
| `DecisionExplorer` | `/gov/decisions` | filtreli karar akışı; satır → gerekçe+alternatifler+confidence |
| `SystemHealthBoard` | `/sys/health` | 10.6 12 göstergesi; radial health + trend sparkline'lar |
| `AlertCenter` | `/alerts` + sağ ray | seviye renkleri DESIGN_SYSTEM; ack/resolve aksiyonları |
| `LogExplorer` | `/sys/logs` | tool_calls/file_changes ham akışı; sanal scroll + facet filtre |

## 6. Backend yapısı

- Yazıcı: `packages/observability` (kütüphane — worker İÇİNDE): `runScope(taskCtx, fn)` sarmalayıcısı açılış/kapanış + buffer'ları yönetir; SDK hook'larından tool/file olayları toplar.
- Health probe: pg-boss `health-probe` (60sn) — LiteLLM `/health`, Postgres `pg_stat`, kuyruk derinliği, Docker stats (host cAdvisor YOK — `docker stats` yeterli değilse /proc okuma, yeni servis açılmaz).
- Eşikler settings'te (`health.error_rate_max` vb.) → ihlal alerts.

## 7. Frontend yapısı

RSC ilk yük: `v_live_operations` (son 50 koşu) + snapshot; sonrası Broadcast delta. Ağır sayfalar (LogExplorer) sayfalı sorgu, canlı takip opt-in ("follow" toggle). Tüm özetler drill-down haritasına bağlı (CC-SPEC §7 tablosu).

## 8. API'ler

Reads: `v_live_operations`, `v_agent_run_detail(id)`, `v_health_current`, `v_alerts_active`. Mutations (dar): `POST /api/control/alerts {op:'ack'|'resolve', ceo_action}`; `POST /api/control/runs {op:'pause'|'cancel'|'retry', run_id}` → kernel sinyali (pg-boss cancel/park) → durum agent_runs'a işlenir. Gözlem tablolarına UI'dan yazım YOK.

## 9. Event yapısı

| Olay | Kanal | Yük |
|------|-------|-----|
| run started/updated/ended | `ops:live` (1sn toplu) | `{run_id, status, employee, model, progress}` |
| decision eklendi | `ops:live` | `{decision_id, kind, actor}` |
| alert insert/ack/resolve | `alerts` | `{alert_id, level, title}` |
| health snapshot | `ops:live` (60sn'de 1) | kompakt sağlık özeti |

Trigger→Broadcast deseni 0013 emsali; debounce SYSTEM_ARCHITECTURE §26.

## 10. State yönetimi

UI'da gözlem verisi cache'lenmez (kaynak DB + delta); yalnız görünüm tercihleri (seçili görünüm, filtreler) client'ta. AgentDock sayacı `ops:live` delta'sından türetilir, 10sn'de bir tam senkron (drift önleme).

## 11. Database tabloları / 12. İlişkiler

§4 normatif → [[DATA_MODEL]] 0022x. İlişkiler: agent_runs ⋈ tasks/employees/workflow_runs/projects; self-FK spawn zinciri; tool_calls/file_changes N—1 agent_runs; alerts bağımsız (source ile gevşek bağ); snapshots zaman serisi. Mevcut `task_events` KALIR (kernel iç olayları) — agent_runs onu İKAME ETMEZ, tamamlar (görev-düzeyi vs koşu-düzeyi).

## 13. Yetkilendirme

Okuma: `ceo` tam; ajanlar kendi run scope'unu okur (RLS: employee_id eşleşmesi — memory router'ın bağlam ihtiyacı). Yazma: yalnız `system` rolü (worker); `ceo` yalnız alerts ack/resolve + run pause/cancel.

## 14. Logging / 15. Audit

Bu spec logging'in kendisidir; audit_log ile ayrım: audit = KİM NEYİ DEĞİŞTİRDİ (mutasyon), observability = NE OLDU (yürütme). Çapraz bağ: control mutasyonu bir koşuyu etkilerse audit satırı run_id taşır. pino stdout logları (SYSTEM_ARCHITECTURE §14) tanılama içindir, gözlem DB'sinin yerine geçmez.

## 16. Security

Ham prompt/çıktı içeriği LOGLANMAZ (özet + hash); dosya diff'leri git'te yaşar, DB özet taşır. Gözlem verisi dışa açılmaz (RLS + API yok); SECURITY_MODEL sicili değişmez.

## 17. Error handling / 18. Retry / 19. Fallback

- Buffer flush hatası: 3 deneme → yerel dosyaya spill (`/var/lib/dxb/obs-spill/`, açılışta geri yüklenir) → alert (High). Veri kaybı kabul edilmez, gecikme kabul edilir.
- Health probe hatası: snapshot NULL alanlı yazılır + kendisi alert üretir (gözleyicinin gözlemi).
- Broadcast düşerse: UI stale göstergesi + polling fallback YOK (Broadcast-only kuralı; reconnect yeterli).

## 20. Test planı / 21. Acceptance criteria

- Birim: runScope açılış/kapanış; buffer flush; spill/geri yükleme; alert eşikleri.
- Entegrasyon: örnek görev koş → agent_runs 1 + tool_calls ≥1 + decision_log ≥1 (routing) + cost_ledger 1 → LiveOps'ta <2sn görünür.
- Kabul: madde 5.2'nin 20 sorusu AgentRunDrawer'da cevaplı (soru-başı denetim listesi) · 10.6'nın 12 göstergesi SystemHealthBoard'da gerçek veriyle · alert seviyeleri §22 direktif alanlarını taşıyor · append-only kanıtı (UPDATE denemesi reddi).

## 22. Migration planı / 23. Rollback planı

- 0022x: `0022a_obs_tables.sql` (6 tablo, aylık PARTITION: agent_runs/tool_calls/file_changes/snapshots) · `0022b_obs_triggers.sql` (Broadcast+cost besleme) · `0022c_obs_views.sql` · `0022d_retention.sql` (pg-boss 'obs-prune' job: tool_calls 90g, snapshots 30g ham→saatlik özete, agent_runs/decision_log/file_changes/alerts SİLİNMEZ — kurumsal hafıza).
- Rollback: trigger→view→tablo sırasıyla `-- ROLLBACK:` blokları; partition drop retention'ın doğal yolu.

## 24. Uygulama sırası

1. 0022a-d → `psql -c "\dt agent_runs*"` → partition'lar listelenir
2. `packages/observability` runScope + orchestrator entegrasyonu → test görevi → `psql -c "SELECT status, tokens_out FROM agent_runs ORDER BY started_at DESC LIMIT 1"` → succeeded + sayılar
3. Trigger'lar + Broadcast → `ops:live` 5sn içinde event (SYSTEM_ARCHITECTURE kabulü c)
4. Health probe → `psql -c "SELECT count(*) FROM system_health_snapshots WHERE at > now()-interval '5 min'"` → ≥4
5. UI: LiveOps → AgentRunDrawer → HealthBoard → AlertCenter (CC-SPEC ekran sırasıyla)

Opus-devralma: tablo-başı + bileşen-başı teslim; runScope sözleşmesi sabit. ⛔ kritik: append-only istisnaları (agent_runs kapanışı, decision outcome), retention süreleri, "gözlem bloklamaz" ilkesi — en güçlü model + CEO onayı.

## 25. Bağımlılıklar

[[DATA_MODEL]] 0022x · pg-boss (probe+prune job'ları) · Supabase Broadcast · [[COST_CONTROL_SPEC]] (ledger tüketimi) · [[MODEL_ROUTING_SPEC]] (decision_log üreticisi) · Claude Agent SDK hook yüzeyi.

## 26. Riskler / 27. Edge case'ler

- **Yazım hacmi** (çok ajan × çok tool): batch buffer + partition + params_summary (ham params değil); günlük hacim tahmini System Health'te izlenir.
- **Disk dolması**: retention job + disk metriği alert eşiği (%80 Attention, %90 Critical + non-critical ajan pause — Cost Monitor deseniyle uyumlu).
- **Uzun koşu görünürlüğü**: progress alanı ajan tarafından güncellenmezse süre-bazlı "uzun koşu" işareti (30dk → Attention).
- **Alt-ajan ağacı derinliği**: spawn zinciri derinlik ≤4 (orchestrator kuralı); ağaç UI'da lazy-load.
- **Saat kayması**: tüm zamanlar `timestamptz` UTC; UI CEO yerelinde gösterir.

## Done definition (bu spec)

27 başlık ✓ · madde 10.1-10.6 tam eşleme (10.5 çapraz-ref) ✓ · madde 5.2'nin 20 sorusu şemaya bağlanmış ✓ · append-only + retention + spill kuralları ✓ · doğrulama komutları ✓ · Opus-devralma + ⛔ kararlar ✓
