# AGENT_ORCHESTRATION_SPEC — AJAN ORKESTRASYONU

> Dalga 3 · Yazar: Fable 5 bizzat · Kaynak hüküm: madde 5.2 (Live Operations — 20 soru) + madde 18 (model-görev dağılımı) + madde 2 (CEO müdahale yetkileri)
> Üst: [[SYSTEM_ARCHITECTURE]] · Şema: [[DATA_MODEL]] §4.3 · Kardeşler: [[MODEL_ROUTING_SPEC]] (model seçimi), [[FABLE_5_HOOK_SPEC]] (kalite kapıları), [[OBSERVABILITY_SPEC]] (kayıt), [[WORKFLOW_ENGINE_SPEC]] (D4)

## 1. Amaç

Bir görevin ajana dönüşmesinden çıktının kabulüne kadar tüm yaşam döngüsünün tek standardı: spawn → hook pre-gate → model seçimi → yürütme (tool/file/decision kaydıyla) → hook post-gate → kapanış. CEO'nun madde 5.2'deki 20 sorusunun her anı cevaplanabilir; madde 2 müdahaleleri (duraklat, iptal, öncelik değiştir, override) her koşuda işler.

## 2. Gereksinimler

- G1. Her ajan koşusu `agent_runs` satırıyla doğar ve kapanır; satırsız koşu YOK (kayıt-dışı yürütme ihlaldir).
- G2. Spawn zinciri sınırsız derinlikte izlenir (`parent_run_id`); sebepsiz devir hook'un "kendi işini başka ajana sebepsiz devretmeme" standardına çarpar — sub-agent spawn'ı gerekçe zorunlu (decision_log).
- G3. Model seçimi ASLA ajan içinde hard-code değil: `fn_select_model(role_slot, dept, ...)` (MODEL_ROUTING) tek kapı; madde 18 dağılımı bu tablolarda yaşar.
- G4. CEO müdahaleleri: pause / resume / cancel / priority / model-override / decision-override — hepsi control-plane fn'i, hepsi audit'li, hepsi koşan işe saniyeler içinde ulaşır.
- G5. Onay bekleyen koşu (`waiting_approval`) kaynak TÜKETMEZ: park edilir (pg-boss job biter), approval kararı yeni job doğurur.
- G6. Build-workflow ile karışmaz: bu spec ÜRÜN runtime'ıdır. İnşaat-dönemi yazarlık kuralları (model routing **v9**: Opus 5 bizzat, yedek katman yok, Sonnet yazarlıkta yasak) korpus/repo yazımına aittir; runtime dağılımı madde 18 + MODEL_ROUTING tablolarındadır. İkisinin karıştırılması ihlaldir (MODEL_ROUTING §1 ayrımı burada da bağlayıcı).

## 3. Mimari — koşu yaşam döngüsü

```
task (pg-boss job)                                [KALIR — mevcut kuyruk]
  └─ orchestrator.dispatch                        [GENİŞLER]
       1. employee seç (org + workload)            → decision_log
       2. hook.preTask(run_ctx)                    → RED ise: run 'failed', policy hatası
       3. fn_select_model(role_slot,...)           → model_id + decision_log
       4. agent_runs INSERT (status='running')     → Broadcast ops:live
       5. Claude Agent SDK session (LiteLLM virtual key ile)
            tool çağrıları → tool_calls · dosya → file_changes · karar → decision_log
            kontrol sinyali her araç-turu başında okunur (pause/cancel)
       6. hook.postTask(output)                    → kalite kapısı; RED ise revizyon turu
       7. agent_runs kapat (succeeded/failed) + maliyet cost_ledger → Broadcast ops:live
```

Mevcut-varlık eşlemesi: `packages/orchestrator` KALIR+GENİŞLER (dispatch'e hook + model-fn + run kaydı eklenir); `packages/kernel` KALIR (intent→task üretimi değişmez); Claude Agent SDK oturum sarmalayıcısı `packages/orchestrator/runner` YENİ; kuyruk pg-boss KALIR (yeni job tipi yok, mevcut `task` ailesi genişler).

## 4. Veri modeli

DATA_MODEL §4.3 normatif. Ek hükümler:

- `agent_runs.control_signal` kolonu (0022x'e eklenir): `NULL|pause|cancel` — CEO müdahalesinin taşıyıcısı; runner her araç-turu başında okur (poll DB'den, ekstra servis yok — R5).
- Öncelik: `tasks.priority` (mevcut) pg-boss job priority'ye eşlenir; CEO değişikliği kuyruğa `pg-boss` API'siyle yansır (bekleyen job'da), koşan işi kesmez.
- Madde 5.2'nin 20 sorusu → kolon eşlemesi OBSERVABILITY_SPEC §3 tablosunda birebir; bu spec veri ÜRETİM noktalarını sabitler (yukarıdaki akış adımları).

## 5. Component yapısı

| Component | Konum | Etiket |
|-----------|-------|--------|
| `orchestrator.dispatch` genişlemesi | `packages/orchestrator` | GENİŞLER |
| SDK runner (oturum + sinyal + kayıt) | `packages/orchestrator/runner` | YENİ |
| Kontrol fn'leri `fn_run_pause/resume/cancel`, `fn_run_override_model`, `fn_task_set_priority` | migration 0022x | YENİ |
| Live Operations UI | `(command)/live` | SIFIRDAN — CEO_COMMAND_CENTER §5.2 rotası |
| Run detail sayfası (drill-down hedefi) | `(command)/live/runs/[id]` | SIFIRDAN |

## 6. Backend yapısı

- Employee seçimi: departman + role_level uygunluğu + `employment_status='active'` + workload (açık run sayısı < çalışan limiti, `settings 'employee.max_concurrent_runs'`) → en düşük yüklü uygun çalışan; seçim gerekçesi decision_log'a.
- Sub-agent spawn: runner içinden `dispatch(parent_run_id=...)` — aynı yoldan geçer (hook + model fn + kayıt); derinlik limiti `settings 'orchestration.max_spawn_depth'` (varsayılan 3), aşımı policy reddi.
- Retry: `transient` hata → pg-boss retry (job config); `policy` reddi → retry YOK, escalation (hook kuralı); `fatal` → run failed + alert. Aynı sınıflandırma SYSTEM_ARCHITECTURE §17 ile birebir.
- Timeout: run başına `settings 'orchestration.run_timeout_s'` (rol-slot bazında override); aşımda runner işi keser, run `failed(timeout)`, alert `medium`.

## 7. Frontend yapısı — Live Operations (madde 5.2)

- Liste: aktif koşular gerçek zamanlı (`ops:live` Broadcast + `v_live_operations`); satırda: çalışan, görev, veren (intent/workflow/CEO), workflow bağı, model, token, maliyet, süre, durum — 20 sorunun özet alt kümesi.
- Satır tıklama → run detail: tool_calls akışı, file_changes listesi (diff özeti + rollback ref), decision_log kayıtları, sub-agent ağacı (parent zinciri), retry geçmişi, approval bağı — 20 sorunun TAMAMI bu sayfada (kabul: eksik soru = red).
- Müdahale düğmeleri satırda ve detayda: Pause / Cancel / Priority / Model override — her biri onay diyaloğu + gerekçe alanı (gerekçe audit'e yazılır).

## 8. API'ler

- `POST /api/control/runs/{id}/pause|resume|cancel` · `POST /api/control/runs/{id}/model` (override) · `POST /api/control/tasks/{id}/priority` — hepsi `{ok, change_id}` kontratı, idempotent.
- Read: `v_live_operations` (RSC ilk yük) + Broadcast delta.

## 9. Event yapısı

`ops:live` kanalı olay tipleri: `run.started`, `run.progress` (1sn toplu — fırtına koruması SYSTEM_ARCHITECTURE §26), `run.waiting_approval`, `run.paused`, `run.resumed`, `run.cancelled`, `run.finished`, `run.spawned` (sub-agent). Payload'da her zaman `run_id, employee_id, task_id` — drill-down bağlantısı UI'da bu üçlüden kurulur.

## 10. State yönetimi

Runner belleğinde yalnız oturum bağlamı; kalıcı gerçek DB'de. Crash kurtarma: VPS restart'ında `running` görünen ama pg-boss job'ı olmayan run'lar açılışta `failed(orphaned)` işaretlenir + alert (janitor sorgusu, health job'ının parçası — yeni servis değil).

## 11. Database tabloları / 12. İlişkiler

Yeni tablo yok; 0022x'e `agent_runs.control_signal` + kontrol fn'leri eklenir. İlişkiler DATA_MODEL §5: `workflow_runs 1─n agent_runs 1─n {decision_log, tool_calls, file_changes}`; `agent_runs n─1 agents`.

## 13. Yetkilendirme

Müdahale fn'leri: yalnız `ceo`. Dispatch/runner: `system`. Ajanın kendisi kendi run satırını KAPATAMAZ — kapanışı runner yazar (ajan çıktısı ile DB durumu ayrık; "işi bitti sayma" kararı hook post-gate'ten geçer). Model override'da `banned=true` model seçilemez (fn reddi — Sonnet yasağının runtime kilidi).

## 14. Logging / 15. Audit

Koşu içi her şey OBSERVABILITY tablolarına (buffer + 2sn flush deseni orada). CEO müdahaleleri ayrıca `audit_log`a (`action='run.pause'` vb. + gerekçe). Dispatch kararları (çalışan seçimi, model seçimi, spawn onayı) decision_log'da `rationale NOT NULL`.

## 16. Security

Ajan API erişimi yalnız LiteLLM virtual key (raw provider key hiçbir configde — sert kural, grep hedefi 0). MCP erişimi profil-başı (gateway, mevcut 14 profil KALIR); yeni çalışan profili HR akışında tanımlanır (madde 9), orchestrator profil ATAMAZ. Para-çıkışı: ajan outbox'a yazamaz — tek yol approval kararı (APPROVAL_ENGINE, DOKUNULMAZ).

## 17. Error handling / 18. Retry / 19. Fallback

§6'daki üç sınıf + model fallback: seçili model `degraded/kesinti` ise `fn_select_model` fallback zincirini döner (MODEL_ROUTING); runner model değişimini `run.progress` olayı + decision_log ile görünür kılar. Hook post-gate reddi: en fazla `settings 'orchestration.max_revision_rounds'` (varsayılan 2) revizyon turu, sonra escalation (müdüre/CEO'ya — hook spec §7).

## 20. Test planı

- Birim: dispatch çalışan seçimi (yük dengesi), spawn derinlik reddi, banned model reddi, orphan janitor.
- Entegrasyon: sahte SDK oturumu ile tam yaşam döngüsü → 7 adımın her birinin DB izi assert edilir (satır sayıları).
- Müdahale: koşan sahte-run'a pause → ≤ araç-turu süresi içinde `paused`; cancel → SDK oturumu kapanır, maliyet defteri kapanışı yazılmış.

## 21. Acceptance criteria

- Live Operations'ta koşan bir işin satırından run detail'e inilir ve madde 5.2'nin 20 sorusunun HER BİRİ ekranda cevaplıdır (denetim listesi: 20/20 — eksik varsa kabul reddi).
- CEO pause'a basar → koşu bir sonraki araç-turunda durur, `run.paused` yayını gelir, audit satırı vardır.
- Kayıt-dışı koşu kanıtı sıfır: `SELECT count(*) FROM tool_calls WHERE run_id IS NULL` → 0.

## 22. Migration planı / 23. Rollback planı

0022x içinde: `ALTER TABLE agent_runs ADD COLUMN control_signal text CHECK (control_signal IN ('pause','cancel'))` + 5 kontrol fn'i. Rollback: fn DROP + kolon DROP (nullable, veri kaybı yalnız aktif sinyallerde). Runner paketi geri alınırsa orchestrator eski dispatch'le çalışmaya devam eder (hook/kayıt katmanı feature-flag `settings 'orchestration.v2_enabled'` arkasında açılır — kademeli geçiş).

## 24. Uygulama sırası (adım-başı doğrulama)

```bash
# 1. 0022x push (observability ailesiyle birlikte)
psql "$DB" -c "\df fn_run_*" | grep -c fn_run                    # → 4 (+ fn_task_set_priority ayrı)
# 2. runner feature-flag kapalı smoke (eski yol bozulmadı)
pnpm --filter orchestrator test                                   # → yeşil
# 3. flag aç, tek görev uçtan uca
psql "$DB" -c "SELECT status FROM agent_runs ORDER BY started_at DESC LIMIT 1;"  # → succeeded
# 4. pause kanıtı
psql "$DB" -c "SELECT fn_run_pause('<id>','test');" && sleep 5 && \
psql "$DB" -c "SELECT status FROM agent_runs WHERE id='<id>';"    # → paused
```

## 25. Bağımlılıklar

0020x (org: çalışan seçimi) → 0021x (settings/model_catalog: fn_select_model) → 0022x (bu spec). Claude Agent SDK 0.3.x oturum API'si; LiteLLM virtual keys; pg-boss job priority API. STACK.md versiyon tablosu değişiklik öncesi okunur.

## 26. Riskler / 27. Edge case'ler

- Risk: kontrol sinyali poll'ü uzun araç-turlarında geç işler (LLM yanıtı dakikalar sürebilir) — kabul edilen sınır: sinyal ≤ 1 araç-turu gecikmeli; daha serti (stream kesme) ⛔ karar: SDK yeteneğine bağlı, uygulamada en güçlü model + CEO onayıyla değerlendirilir.
- Risk: decision_log gerekçe kalitesi düşer (boilerplate rationale) — hook post-gate örneklem denetimi (HR performans girdisi).
- Edge: çalışan suspend edilirken koşusu sürüyor (G6 — koşu biter, yeni spawn yok); approval reddedilen park işi (run `cancelled(approval_denied)` kapanır, task fail); aynı run'a çift cancel (idempotent — ikincisi no-op); LiteLLM tüm zincir down (run `failed(no_model)` + alert `critical`; kuyruk birikir, budget guard değil sağlık alarmı).

## Registered adaptations — R2.1 resident worker (2026-07-17, roadmap row R2.1)

| # | Adaptation | Why |
|---|-----------|-----|
| A1 | §3 runtime host: the resident consumer of the business `tasks` queue is a self-chained pg-boss job (`task.worker`, 10 s re-arm) inside the ONE scheduler process, with production entrypoint `packages/outbox-executor/src/main.ts` (`pnpm scheduler`, SIGINT/SIGTERM graceful). §3's "task (pg-boss job)" wording yields to the Phase-3 LOCKED decision: business tasks live in the `tasks` table (SKIP LOCKED claim); pg-boss is only the drain vehicle. Drain legs per tick: queued→`runWorkerOnce` (cap 1), review→QA (cap 3; confidence <0.6 routes to the 05-06 ladder), failed→ladder (cap 5; blocked tasks excluded). **AMENDED 2026-08-25 (B39): HOW MANY OF THESE DRAINS RUN AT ONCE IS WORKED OUT BY THE COMPANY ITSELF, every tick, and the justification is a measurement rather than an assumption.** The first version of this amendment made it a setting for the CEO to manage and he struck that down the same day — *"bak ben ayar mayar anlamam ki! … ben hedefi söylerim yönetim kurulu başkanı olarak."* The count is now derived from two measurable things: **the work waiting** (`tasks` in `queued`) and **what the machine can carry** (`cores - 2`, capped at 8, leaving room for the database). An empty queue runs one lane — a listening posture, not a stopped one; on the rented 4-core box the same code decides 2, configured nowhere. `orchestration.dispatch_lanes` remains as an override seeded to **0 = decide for yourself**, and 1-8 pins it if a human ever needs to. N lanes run as `Promise.all` INSIDE this same job — lane 1 keeps the historical `resident-worker` identity so nothing that reads `claimed_by` changes meaning. The execution leg also asks the subscription-token brake before it claims (B39 H1): that path bypasses the cost proxy, so neither money brake can see it — **not because the cost book is empty (it is empty because the holding is still being built, which is the EXPECTED state), but because nothing on that path would ever fill it, trading day included.** | SYSTEM_ARCHITECTURE R5 (no new resident service — raising concurrency inside an existing job is not opening one; R5's RAM premise was replaced by the 2026-08-25 measurement, its discipline kept) + Phase-3 LOCKED two-queues rule + `scripts/bench/drain-throughput.mjs`, which builds a real department, real staff through the real activation gate and a real project, runs with the quality gates ON, and proves its own collision detector red before printing a number. |
| A2 | §6 employee selection implemented at claim time (`assignEmployee` in the worker shim, §3 step 1): department + `employment_status='active'` + MCP profile present, least open running runs wins, rationale to decision_log. **CLOSED 2026-08-25 (B39).** For thirteen months the cap was NOT seeded and least-loaded ordering carried the workload rule alone — which only ever *preferred* an idle employee and never refused a busy one, invisible while a single dispatch line ran a single task. Migration `20260825001000_b39_dispatch_brakes` seeds `employee.max_concurrent_runs` (default 1, registered, CEO-editable) and `assignEmployee` now obeys it: an employee at the ceiling is not chosen, and when EVERY eligible employee is at it the task returns to the queue untouched rather than stacking a second job on somebody already working — the CEO's own sentence, *"HERKES KENDİ İŞİNİ YAPMALI"*. A department with no workforce at all keeps the old loud path (agent-less, pre-gate rejects): busy and empty are different answers and are never reported as the same one. Proven by `tests/b39/dispatch-brakes.test.ts`. No eligible employee → the task proceeds agent-less and the pre-gate rejects loudly (violation + ladder + blocked report = the CEO-visible signal of an unstaffed department). | §6 mechanism; setting absence measured 2026-07-17 (0 rows). |
| A3 | std 11 project link for CEO intents: intent-born tasks carry the holding dogfood project (`projects.slug='dxb-global-os'`) via the new `dispatch(envelopes, {projectId})` option wired in intent intake. The Phase-3 `TaskEnvelope` contract is untouched (LOCKED — no project field added). Measured before the fix: every intent-born task died at `std.project_alignment` (5 ladder rounds → blocked). | FABLE_5_HOOK §2 row 11 + A7; command-bar work is holding-OS work by definition. |
| A4 | Done-terminal on the default text-only executor is constitutionally unreachable: post-gate std 15 (`tool_call_proof: true`) demands a `tool_calls` reference and `tools: []` can never produce one. R2.1 therefore proves the F-01 chain to its honest terminal (post-gate REVISE×2 → ESCALATE → ladder → blocked + CEO report, fully autonomous); the done-path lands with R2.2's real tool surface. Weakening std 15 was considered and REFUSED (quality floor is constitutional). | Hook policy std 15 measured live; audit F-01/F-02 scope split. |
| A5 | pg-boss chain-queue policy: every self-chained queue (`outbox-tick`, `intent-intake`, `workflow.run`, `library.profile_recompile`, `task.worker`) moved to queue policy `short` — pg-boss 12 enforces `singletonKey` dedup ONLY under `short` (unique index scoped to `state='created' AND policy='short'`). Under `standard` every bootstrap send minted one more parallel chain (measured: 29 stranded created intent-intake jobs; 5120 stranded chain ticks purged). Migration `20260717050000`. | pg-boss 12 index semantics measured in live schema; restart continuity requires exactly-one pending chain job. |

### R2.2 additions (2026-07-17, roadmap row R2.2)

| # | Adaptation | Why |
|---|-----------|-----|
| A6 | §3 step 5 tool surface: the default executor mounts the employee's COMPILED gateway profile on the Agent SDK session — gateway `runtime-profile.ts` resolves employee-overlay > department > default-deny (re-read per run, so a revoked grant never survives a stale cache), and `buildSdkToolOptions` partitions the full dxb-mcp inventory into `allowedTools` (the grant set) and `disallowedTools` (everything else, stripped from model context) under `strictMcpConfig`, built-ins off. `tools: []` is dead on the staffed path; an unstaffed task or empty profile runs tool-less by default-deny, never silently. | Audit F-02/F-04; PERMISSION_MODEL G2/G3 record-authority chain finally consumed at runtime. |
| A7 | §6 evidence package carrier: the worker self-declares `evidence[]` + `acceptance_map` in its JSON envelope (A10 executor-declared rule); the binding calls `RunScope.settle()` then `resolveEvidenceToolCalls` to anchor verification items to the run's REAL `tool_calls` rows by tool name — resolution, never invention: an item whose named tool was not actually called stays unanchored and std 15 rejects it (measured live: an L1 model fabricated a `<tool_calls>` text block while the MCP server was down — the gate caught it). A tool-using session that closes with prose instead of JSON degrades to an evidence-less package (post-gate REVISE feedback loop), not a fatal parse crash. | FABLE_5_HOOK A10 + std 15 tool_call_proof; fatal-parse behavior measured 2026-07-17. |
| A8 | dxb-mcp stdio entrypoint fix: the `import.meta.url === "file://" + argv[1]` guard NEVER matched from this checkout (space in repo path → %20 encoding mismatch), so the stdio server process idled without connecting and every SDK MCP handshake reported `failed` with zero visible tools. Fixed with `pathToFileURL`; measured `connected` + 21 tools via `scripts/dev/mcp-surface-probe.mjs`. In-memory-transport tests never exercised the stdio path — the probe now exists as the dev-host check. | First-ever runtime consumption of dxb-mcp over stdio exposed the latent boot defect. |

### R2.3 additions (2026-07-17, roadmap row R2.3 — audits F-03/F-05)

| # | Adaptation | Why |
|---|-----------|-----|
| A9 | §5 runner ruling (U12 in the INDEX U-table): `packages/orchestrator/runner` is CANCELLED as a separate package — the runner's responsibilities live in worker-shim (session+record), worker-loop (residency), hook-binding (gates). The workflow agent step now runs the SAME constitution: preTask BEFORE the run is born (REJECT → `StepError('policy','HOOK_REJECTED')`, zero agent_runs rows — §6 verbatim), post-gate + §19 REVISE loop inside the runScope (feedback rides `AgentWork.feedback`), evidence anchored through the SHARED resolver after `RunScope.settle()`. Shared pieces are ONE implementation by construction: `buildSdkToolOptions` lives in gateway, `extractEvidencePackage`+`hookEnabled`/`alertHookDisabled` in hook, `resolveEvidenceToolCalls` in observability — orchestrator re-exports verbatim (tests/r23 asserts reference equality). The workflow executor mounts the same compiled tool surface (`tools:[]` dead on this path too). Pre-hook e9 fixtures pin the flag off per the A13 mechanism. Control signals (`agent_runs.control_signal`) remain an OPEN spec item — not silently closed. | FABLE_5_HOOK A9 unification moment arrived with the R2 execution-activation block; audit F-05 demanded the ruling be recorded, not assumed. |

### W2.5 additions (2026-07-26, factory roadmap row 2.5 — autonomous work generation)

| # | Adaptation | Why |
|---|-----------|-----|
| A10 | **§3 gains a FOURTH task-creating path: machine output → machine work.** Measured 2026-07-26: all three existing paths begin at a human — `dispatch.ts:54` from an envelope a CEO intent produced, `dxb-mcp/groups/queue.ts:41` from inside a session a human started, `revenue/discovery.ts:276` only on `trigger='ceo'`. Nothing read a FINISHED task's own output to open the next one, so the W2.4 pilot plan was written, filed, and executed by nobody. `control_work_generate(plan_task_id, steps)` closes it: a done plan, inside a project the CEO already approved, opens one staffed task per step in the department the plan itself named. Scope is deliberately narrow — it never creates a project, objective, opportunity or allocation; those are DECISIONS and stay with the CEO (§13). It executes a decision already taken. | Roadmap row 2.5: "the line between a 24/7 OS and a very well audited idle system". |
| A11 | **Exactly-once is structural, not hopeful.** `generated_work` carries `UNIQUE (plan_task_id, step_index)` and records skipped steps too (`capped`, `duplicate`, `unknown_department`, `no_staff`, `empty_step`) plus a `step_index = -1` marker for a plan that named no executable step. A second pass over the same plan therefore CANNOT double-open work, and the seam never re-reads a dead plan forever. Refusal reasons are returned AND stored: `DISABLED`, `PLAN_NOT_FOUND`, `PLAN_NOT_DONE`, `PROJECT_NOT_ACTIVE`, `ALREADY_GENERATED`, `NO_STEPS`. A cap that truncates reports what it dropped — a silent cap reads afterwards as "covered everything". | The harvest-once lesson from W2.2 (`revenue_scout_runs`), applied before the first double-open could happen. |
| A12 | **The CEO owns the switch and the ceiling.** `orchestration.autogen.enabled` (default true) and `orchestration.autogen.max_steps` (default 3) are registered settings, so stopping self-generated work is one toggle on the settings surface. Default-on is deliberate and bounded: work inside a project the CEO already approved is not a new decision, and every outward action still stops at the approval gate. A paused project refuses generation exactly as it already refuses dispatch (W2.4 `claim_next_task` predicate). | Anti-baby-sitting (intent once) without surrendering the stop button. |
| A13 | **The plan's step line gained a mandatory Turkish leg** (`<step> | owner: <department> | tr: <Turkish>`), and the contract moved into `fn_plan_step_contract()` — one place, called by the W2.4 allocation door, so the next change needs no function re-declaration. Without the `tr:` leg every generated task would be born with an English label on the CEO's Turkish board; the model writing the plan is the only cheap, accurate translator. Parsing lives in `packages/orchestrator/src/work-generation.ts` (forgiving about wrapper prose, strict about shape — the `parseCandidates` precedent), and the scheduler runs it every 15 minutes on `orchestration.work_generate`. | DB text is an i18n surface (i18n purity rule); a plan finished at 09:03 must not wait for tomorrow's 05:00 window. |

### B43 additions (2026-09-03 — the studio's hands, on the CEO's approved plan)

| # | Adaptation | Why |
|---|-----------|-----|
| A15 | **A running task renews its own lease.** `runWorkerOnce` (`packages/orchestrator/src/worker-shim.ts`) arms a heartbeat for the life of the run — `UPDATE tasks SET lease_expires_at = now() + lease WHERE id = … AND claimed_by = … AND status IN (claimed, running)` every quarter-lease (bounded 1–60 s) — and clears it in `finally`. | Measured 2026-09-03: `claim_next_task` leases 900 s, `reap_expired_leases` runs every 60 s, and nothing anywhere renewed, so any run longer than fifteen minutes — a media render, a long gate — was handed back to the queue mid-flight and run twice. The reaper exists for DEAD workers; a live one now says so. Proven by `tests/b43/media-hands.test.ts` §4 (lease 3 s, run 4.5 s, reaper called mid-run, task stays `running`). |
| A16 | **§3 gains a MACHINE-WORK lane beside the task worker: `media_jobs` → the resident scheduler's media lane.** The dxb-mcp `media` group births a job row inside an expert's task run; `runMediaLaneOnce` (`packages/outbox-executor/src/media-lane.ts`) claims it SKIP LOCKED, runs the station driver for its kind in a transient systemd scope, samples VRAM/RAM, and writes the result on the row; `media_wait` lets the run block on it while A15 keeps the lease alive. Jobs STAY in `media_jobs` (Phase 3 LOCKED: two queues = two sources of truth); pg-boss carries only the 10 s tick, no second runtime. | The company's employees could think but not press an engine's button (2026-09-03, measured: eight tool groups, no engine). The outbox→executor pattern was the only long-running precedent in the repo and is the shape copied here. **Turn budget (2026-09-03 evening, two-brain trial):** a seat whose compiled surface carries `media_submit` runs with **40** SDK turns instead of 12 (`turnBudgetFor`, `worker-shim.ts`) — a four-shot job is ~20 tool calls; tool-less runs keep 4. Proven by `tests/b43/media-hands.test.ts` §6. |
| A17 | **A lane is its own loop.** `TaskLanes` (`packages/outbox-executor/src/task-lanes.ts`): each hand drains on its own — rests one tick when the queue gives it nothing, looks again at once after a task — and the `task.worker` tick only re-counts the hands (`dispatchLanes`, unchanged) and starts or retires loops; it never blocks behind one. Retiring never cuts a lane mid-drain; `stopScheduler` waits for the current drains. No second runtime, no second process. | Measured 2026-09-03 21:23–21:26 on the company: the tick ran its lanes under one `Promise.all` and re-armed only when all had returned, so one 30-minute media run (the film's director) held every hand — the identity expert's corrective task stayed `queued` while the CEO waited, and the QC task could not start before the film. The CEO's order the same minute: *"ŞİRKETİN GÖREV İŞÇİSİ NEDEN BUNU YAPAMIYOR? YAPILACAK MİMARİ NEYSE O YAPILSIN ÇÖZÜLSÜN SORUN."* Proven by `tests/b43/task-lanes.test.ts` (5: a long run in lane 1 does not stop lane 2; idle rest; retire-after-drain; a throwing lane rests and retries; stop waits). |
| A18 | **The hands are lanes too.** <!-- OPEN: B43 --> `MediaLanes` (`packages/outbox-executor/src/media-lanes.ts`, on top of A17's `TaskLanes`): the studio's job book drains on ONE GPU lane (still · shoot · upscale — the card is one) and N CPU lanes (voice · assemble · probe; `DXB_MEDIA_CPU_LANES`, default 3), each its own loop — a finished job is followed at once, an empty or busy lane rests one tick; the pg-boss `media.lane` tick only reconciles the loops and never waits on a job; `DXB_MEDIA_CPU_LANES=0` is the rollback shape (one lane, every kind, the historical id). `runMediaLaneOnce` gained `kinds` (claim and peek filtered by kind). Measured before (company book, 2026-09-05 00:5x): 30 jobs, 0 overlapping pairs, twelve stills one after another with a 10 s gap each. Measured after, through the company's own road (task 7e4ceb09 by `media-delivery-qc`, brain `fable-5.1`): a still on `resident-worker-media-gpu` (7.6 s) and three probes on `-cpu-1/2/3` (0.5 s each) started within 40 ms of one another — 6 overlapping pairs. CEO 2026-09-05: plan ① *"Onaylıyorum, başla"* (`hands-lanes-plan-approved-2026-09-05`). | 2026-09-05 · `tests/b43/media-lanes.test.ts` 6/6 (+ task-lanes 5/5, media-hands 12/12) · `tsc --build` clean · scheduler restarted 01:17:26, log "the studio's hands: 4 lanes running — 1 for the card, 3 for the processor" |
| A19 | **The dispatch book — a plan becomes one task per named seat.** <!-- OPEN: B43 --> `queue_dispatch` (`packages/dxb-mcp/src/groups/queue.ts`, contract and graph checks in `packages/dxb-mcp/src/dispatch-book.ts`): a seat that holds a plan writes it as a call sheet — one task per named seat of ITS OWN department **or of a seat ASSIGNED to it** (registered adaptation, W9, CEO 2026-09-15 <!-- CEO-OK: w9-assigned-seats-plan-approved-2026-09-15 -->: `agent_assignments` records an employee of one department serving a seat in another — a SECOND MEMBERSHIP, never a move, `agents.department` stays the home one; the Media Studio was founded with two such seats on 2026-09-03 and neither could be dispatched until today, audit F033. Both doors — `queue_create_task` and `queue_dispatch` — read the table through ONE implementation, `seatsAssignedTo()`; a seat with no assignment row is refused exactly as before, and dropping the row closes the door again, proven in `tests/b43/assigned-seats.test.ts`), `deps` as forward-only indices of earlier seats (cycles impossible by construction, the dispatch.ts idiom), born `queued` and STAFFED (`agent_id` = the seat) under the author's project with `parent_task_id` = the author, tier/priority/budget inherited, `label` + `label_tr` for the CEO's feed (B10), in ONE transaction (a bad seat, a stranger's seat, a backward dependency or a closed project writes zero rows). Dependants are told what to read: code appends the upstream task ids to their objective (the sheet is the channel; the worker module keeps none). Idempotent per (author task, code) — a revision round of the author's run returns the sheet already born instead of a second crew. Record: one `created` event per task, one `queue.dispatch` audit row on the author's task carrying the whole sheet, one `decision_log` row (`call_sheet`) with the dependency graph and the levels. `queue_create_task` gains `agent_slug` / `project_id` / `label` / `label_tr` beside the LOCKED envelope — the brief door (`scripts/b43/dispatch-brief.mjs` by hand today, Hamza's chat tomorrow). **The CEO's time challenge is the design rule** (01:3x, *"sevk defteri o zaman 15 sn'lik bir reklamı 2 saatte ancak bitirir ya"*): a sheet is a graph, not a line — the reviewers wait only for the engineer's take and are claimed at once by separate lanes (A17 grows the lanes to the queue within 10 s); `sheetLevels` is what the record shows him. | Measured 2026-09-05 00:5x (C27): the exam film had been made by a session's subagents because no door turned a director's plan into staffed, dependent tasks — `queue_create_task` births unstaffed and project-less, the worker then staffs by least load. What already existed underneath and is reused, not rebuilt: `tasks.depends_on` and the dependency-aware `claim_next_task` (2026-07-08), `dispatch.ts`'s forward-only index idiom, A17's lanes. CEO delegation 2026-09-05 (`plan-2-dispatch-book-delegated-2026-09-05`). Proven by `tests/b43/dispatch-book.test.ts` (11: forward-only deps; levels [engineer] → [five reviewers] → [verdict]; the seven staffed rows with resolved `depends_on`, inherited project/priority/budget and labels; `claim_next_task` hands out the engineer alone, then the five at once, then the verdict; a bad sheet writes zero rows; the same code twice returns the same sheet; a closed author cannot dispatch; the brief door born staffed). |
| A20 | **A seat runs AS the seat, in SDK isolation.** <!-- OPEN: B43 --> `defaultExecutor` (`packages/orchestrator/src/worker-shim.ts`) gives a staffed run the seat's standing layer as its `systemPrompt`: `composeSeatPrompt` = `standingPrompt(lane 'task')` from `packages/voice/src/prompt-core.ts` — identity line, the authored persona WHOLE (`loadPersonaBody`, file-first from `agents.persona_path`), the artifact-language line, the CEO language law, honesty, the approval gate said for a task, the no-refusal law — plus one task-lane sentence; the lane is a parameter of the ONE definition the answer lanes share (the door `dxb-hamza-context`), never a copy. Every task-side model call — the seat's run and the QA gate that judges it (`qa.ts`) — runs with `settingSources: []` and a fixed `cwd` (`sdk-isolation.ts`); `DXB_WORKER_ISOLATION=0` is the rollback shape. | Measured 2026-09-05 01:5x: a staffed run carried only "You are a DXB Global OS worker agent" plus the task — the persona reached nobody but Hamza's chat and voice lanes (grep: no `persona`, no `systemPrompt` in worker-shim/hook-binding), so "the Creative Director's plan" would have been drafted by an anonymous worker holding the director's tools. And `settingSources` omitted = every filesystem source loaded (sdk.d.ts: "matches CLI defaults") from the repository root, so a seat's run read the construction site's CLAUDE.md and fired its session hooks — the finding B43 had parked as "for his word" on 2026-09-03; taken on his delegation of 2026-09-05. Live proof the same night: the QC seat's probe task (`0e5f1817`) answered in its own §6 standard and named LAW D unprompted, 29 s run, birth→done 51 s. Proven by `tests/b43/dispatch-book.test.ts` (the prompt carries identity + persona whole, never the dossier; isolation on by default, off on the env switch) and by `tests/b21`, `tests/r31` unchanged. |
| A21 | **The road owns a task's lifecycle; every piece of work that needs a hand counts; one judge per task.** <!-- OPEN: B43 --> (1) `queue_transition` refuses to move a task out of `claimed`/`running` for any actor but the hand that holds it (`claimed_by`), and `queue_claim` refuses an employee slug as a worker id (`packages/dxb-mcp/src/groups/queue.ts`) — a seat's answer IS its delivery, said in its standing prompt (`TASK_LANE_LINE`, worker-shim.ts). (2) `dispatchLanes` (`packages/outbox-executor/src/scheduler.ts`) counts every task that still needs a hand — `queued`, `review`, held by a resident lane (`claimed`/`running` with `claimed_by LIKE 'resident-worker%'`), or `failed` and not blocked — instead of `queued` alone; the machine and hour ceilings unchanged. (3) `drainTasks` (`packages/orchestrator/src/worker-loop.ts`) keeps in-process `judging` / `laddering` sets so sibling lanes skip a task already under the QA gate or on the ladder; the guarded DB transition stays the last word. | Measured on the first film through the road, 2026-09-05 02:22–02:28 (evidence file §5.1): the engineer seat moved its own task to `review` from inside its run, the QA gate judged a row with no result and failed it, the ladder requeued it and a second lane re-shot the take (10 min of card cancelled through `media_cancel`); all five reviewers did the same and ran twice; seven lanes judged one review (33 × *lost a race*, six QA calls wasted); and the hand count fell *"2 hands (was 6)"* while five reviewers ran, so the sixth waited and four finished reviews queued behind one lane's QA leg. Commit `a3d35775`; proven by `tests/b43/dispatch-book.test.ts` (a held task is moved only by its holder; an employee cannot claim; the count includes in-flight, gate and ladder work) and the b39 pin updated; scheduler restarted 02:29:34 — the same sheet's second round ran with 7 hands and zero seat transitions. |
| A22 | **The clock he approved, and the judge's receipt.** <!-- OPEN: B43 --> Registered 2026-09-15 (W13, audit F062) — built 2026-09-13 on his approved plan, described until today only on board row B43. (1) **A seat's work is budgeted in minutes.** `queue_dispatch` takes `budget_minutes` per seat; the chain writes it into each task's `due_at` (`packages/dxb-mcp/src/dispatch-book.ts`), so a seat that runs long is visible as over-budget rather than merely late. It is a measurement, never a killer: nothing is cancelled for passing its budget. (2) **An idle lane rests, it does not spin.** `DXB_LANE_REST_SECONDS` (3 s by default, `packages/outbox-executor/src/media-lanes.ts`) is how long a lane with nothing to do waits before looking again — the zero-idle rule he ordered, and the source of `idle_before_claim_s` in the times table. (3) **The QA judge's own time is on the receipt.** The judge writes `judge_ms` into the task's `done` event (B39) and its spend into `cost_ledger` with `source = 'qa'` (CHECK extended in `db/migrations/20260913001000`), so the gate's cost is separated from the seat's. Read back by `queue_sheet_times` — registered as an observability surface in OBSERVABILITY_SPEC. **Measured 2026-09-15:** `cost_ledger` holds 0 rows with `source = 'qa'` — the receipt exists, the column is allowed, and no judged run has yet written one. | His order of 2026-09-13: the studio must say what it costs in time before it says what it costs in money, and no worker may burn a lane doing nothing. |

### Depth ruling (2026-08-27, the CEO's own order)

| # | Adaptation | Why |
|---|-----------|-----|
| A14 | <!-- HISTORY --> **The dependency-chain cap moves from 3 to 5.** `MAX_HOP_DEPTH` in `packages/orchestrator/src/decompose.ts` had been locked at 3 with its own note saying that raising it *"is a routing/policy decision, not a code default"*. The CEO made that decision on 2026-08-27 — *"derinliği ileride yapacağımız yoğun ve compleks işlere uyumlu şekilde yükselt"* — after a real intent, a website for a coffee brand the holding is founding, drew a **5-deep** chain and was refused twice by the guard. **Five is not a new number:** PHASE-05 §2 row 7 already reads *"aktif hop ≤3 çoğu görevde (head→specialist→worker); **5 katman yalnız gerçekten karmaşık işte**"*, so this is that clause exercised. The same row carries the reason not to go further, and it is arithmetic rather than taste: at 95% per hop, five hops finish 77% of the time and six 74%. The batch cap of 10 envelopes is untouched and still bounds the whole decomposition. Proven by `tests/phase5/decompose-dispatch.test.ts` — a 6-deep chain is rejected, 5-deep and 4-deep pass; the test was made to fail against the old cap first. | The CEO's order, and the plan's own complex-work clause finally being used. |

**And it uncovered the next wall, which is NOT this adaptation and is not fixed here.** With the depth guard cleared, the same intent reached `route()` and died on
`NoRouteError: no enabled routing_rules row matches task_class 'content.outbound'`. The row exists and is enabled at L1 — but its match condition is `{"keyword": "listeleme"}`, residue of the Outleteuro vertical slice (PHASE-05 §2, *"tek marka ürün listeleme taslağı"*) the CEO **cancelled** in U19. So the classifier is told `content.outbound` is a legal class, chooses it, and the router then refuses every outward-content task that is not a product listing. It is a data row and a routing decision, so it was put to the CEO rather than changed by the author. Row B40. <!-- HISTORY -->

## Done definition (bu spec)

27 başlık ✓ · yaşam döngüsü 7 adım tek diyagram ✓ · KALIR/GENİŞLER/YENİ eşleme ✓ · madde 5.2 20-soru kabul bağı (§21) ✓ · madde 18 runtime/build ayrımı (G6) ✓ · müdahale seti fn+UI+audit üçlüsüyle ✓ · adım-başı doğrulama ✓ · ⛔ tek açık karar: stream-kesme (§26) ✓
