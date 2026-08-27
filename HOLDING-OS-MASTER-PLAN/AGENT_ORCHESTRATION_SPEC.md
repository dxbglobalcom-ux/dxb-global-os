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

### Depth ruling (2026-08-27, the CEO's own order)

| # | Adaptation | Why |
|---|-----------|-----|
| A14 | <!-- HISTORY --> **The dependency-chain cap moves from 3 to 5.** `MAX_HOP_DEPTH` in `packages/orchestrator/src/decompose.ts` had been locked at 3 with its own note saying that raising it *"is a routing/policy decision, not a code default"*. The CEO made that decision on 2026-08-27 — *"derinliği ileride yapacağımız yoğun ve compleks işlere uyumlu şekilde yükselt"* — after a real intent, a website for a coffee brand the holding is founding, drew a **5-deep** chain and was refused twice by the guard. **Five is not a new number:** PHASE-05 §2 row 7 already reads *"aktif hop ≤3 çoğu görevde (head→specialist→worker); **5 katman yalnız gerçekten karmaşık işte**"*, so this is that clause exercised. The same row carries the reason not to go further, and it is arithmetic rather than taste: at 95% per hop, five hops finish 77% of the time and six 74%. The batch cap of 10 envelopes is untouched and still bounds the whole decomposition. Proven by `tests/phase5/decompose-dispatch.test.ts` — a 6-deep chain is rejected, 5-deep and 4-deep pass; the test was made to fail against the old cap first. | The CEO's order, and the plan's own complex-work clause finally being used. |

**And it uncovered the next wall, which is NOT this adaptation and is not fixed here.** With the depth guard cleared, the same intent reached `route()` and died on
`NoRouteError: no enabled routing_rules row matches task_class 'content.outbound'`. The row exists and is enabled at L1 — but its match condition is `{"keyword": "listeleme"}`, residue of the Outleteuro vertical slice (PHASE-05 §2, *"tek marka ürün listeleme taslağı"*) the CEO **cancelled** in U19. So the classifier is told `content.outbound` is a legal class, chooses it, and the router then refuses every outward-content task that is not a product listing. It is a data row and a routing decision, so it was put to the CEO rather than changed by the author. Row B40. <!-- HISTORY -->

## Done definition (bu spec)

27 başlık ✓ · yaşam döngüsü 7 adım tek diyagram ✓ · KALIR/GENİŞLER/YENİ eşleme ✓ · madde 5.2 20-soru kabul bağı (§21) ✓ · madde 18 runtime/build ayrımı (G6) ✓ · müdahale seti fn+UI+audit üçlüsüyle ✓ · adım-başı doğrulama ✓ · ⛔ tek açık karar: stream-kesme (§26) ✓
