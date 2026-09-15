# MODEL_ROUTING_SPEC — MODEL ORKESTRASYONU VE ROTALAMA

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[SETTINGS_AND_CONTROL_SPEC]] (6.1 anahtarları), [[COST_CONTROL_SPEC]] (bütçe kesişimi), [[AGENT_ORCHESTRATION_SPEC]] (D3, tüketici)
> Direktif kaynağı: §19 (Model Orchestration Panel) + madde 6.1 (model rolleri) + madde 18 (model/görev dağılımı) + **CEO direktifi 2026-07-12** (ajan beyinleri dashboard'dan değiştirilebilir — §4b). **KAYITLI KARAR DEĞİŞİMİ (CEO 2026-07-12 ~01:00):** madde-18 "Sonnet YOK" daraltması RUNTIME için KALDIRILDI — Sonnet şirket içinde beyin olarak serbest; inşaat-dönemi yazarlık yasağı (model-routing-hierarchy) AYNEN sürer.
> Kapsam ayrımı: bu spec ÜRÜN RUNTIME rotalamasıdır (holding ajanlarının model seçimi). İnşaat-dönemi yazarlık kuralları ayrı yönetişimdir (model-routing-hierarchy **v9**; korpus/execution yazarı **Opus 5 bizzat** — yedek katman yok, CEO 2026-07-25).

## 1. Amaç

Her ajan koşusunun HANGİ modelle çalışacağının tablo-güdümlü, CEO-değiştirilebilir, fallback'li ve tamamen loglanan seçimi. Hardcode model adı hiçbir ajan config'inde bulunamaz; seçim runtime'da `routing_rules`dan çözülür (live table name — see §4 alignment note), her karar `decision_log`a düşer.

## 2. Gereksinimler

- R1. Madde 6.1'in 13 rol slotu birinci sınıf: ana orkestratör · yedek orkestratör · planlama · execution · review · kritik karar · hızlı görev · düşük maliyet · araştırma · kodlama · tasarım · QA · HR.
- R2. Haiku yalnız mekanik getir-götür sınıfı görevlerde (verdict/onay üretemez — rol kısıtı `mechanical_only`). `banned` bayrağı MEKANİZMA olarak kalır (gelecek yasaklar için, migration-only). ~~Sonnet hiçbir rol slotuna atanamaz~~ **KALDIRILDI (CEO kararı 2026-07-12):** Sonnet katalogda `banned=false` — rol slotlarına ve `agents.brain`e atanabilir; eski madde-18 daraltması yalnız İNŞAAT yazarlığında yaşar (üstbilgi kapsam ayrımı).
- R3. Her model için §19 meta seti: provider, context window, cost, speed, quality score, reliability, current usage, assigned employees, active tasks, failure rate, fallback ilişkisi.
- R4. Fallback zinciri deterministik: `model_catalog.fallback_of` + rol-başı sıra; her düşüş decision_log'a `routing_fallback` olayı.
- R5. Raw provider key YASAK: tüm çağrılar LiteLLM proxy virtual key'leriyle (departman-başı; STACK sert kuralı).
- R6. Model Orchestration Panel (§19): görsel flow, node sürükle → rol ataması değişir (control seam üzerinden); settings 6.1 anahtarlarıyla AYNI kaynağa yazar.
- R7. Rotalama parametreleri ayarlanabilir (6.1): timeout, max token, max maliyet, context limiti, retry, confidence threshold, escalation, human-approval eşiği, Opus 5-review zorunluluğu (teknik anahtar sabit: `orchestrator.fable_review_required`) — hepsi settings_registry'de, resolve zinciriyle scope'lu.
- R8. (CEO direktifi 2026-07-12) `agents.brain` ajan-seviyesi beyin birinci sınıf rotalama girdisidir ve **dashboard'dan CEO-değiştirilebilir**: değişim = tek UPDATE + audit_log + decision_log + Broadcast; banned/mechanical_only korkulukları ajan seviyesinde de MUTLAK (bypass yolu yok). Normatif ayrıntı §4b.

## 3. Mimari

```
task (kernel) ─→ orchestrator.select_model(task)
                   1. rol tespiti: task.type + persona.role_hint → rol slotu
                   2. kural taraması: routing_rules (rol, departman,
                      risk, maliyet tavanı, context ihtiyacı) öncelik sırasıyla
                   3. sağlık kontrolü: model_catalog.status + provider health
                   4. bütçe kontrolü: COST_CONTROL hard-stop bayrağı
                   5. seçim → decision_log('routing_decision') → LiteLLM
                      virtual key (departman) + model id ile çağrı
                 fallback: hata/timeout/rate-limit → zincirde sıradaki →
                      decision_log('routing_fallback') → 2 düşüşte alert
```

⛔ mimari-kritik: seçim mantığı `packages/orchestrator` İÇİNDE kalır (ayrı servis değil — SYSTEM_ARCHITECTURE §3 kararı); kurallar DB'de, kod yalnız yorumlayıcı.

**Kayıtlı adaptasyon (2026-09-03, B43 — CEO onaylı plan, `studio-hands-build-plan-approved-2026-09-03`):** adım 2'nin *departman* ayağı canlıdır. `routing_rules.department_id` (E6.1 deltası, canlı kolon) artık `resolveExecutionRoute` tarafından okunur: çalışanın kendi departmanına bağlı kural aynı katmanda önce gelir; departmana bağlı bir satır başka bir departman için ASLA seçilmez; departmansız satırlar eski davranışla devam eder. İlk departman satırı stüdyonundur: `media.creative` · L1 · `fable-5` · effort **`xhigh`** (CEO hükmü 2026-09-03: *"max gerek yok xhigh olsun"*) — `effort` CHECK kısıtı ve dört TS dökümü aynı gün `xhigh` ile genişletildi (migration `20260903190000_b43_media_hands.sql`). Kanıt: `tests/b43/media-hands.test.ts` §3. **Aynı gün akşamı, iki-beyin denemesi (CEO: *"iki beyinlede denemek lazım"*, `two-brain-trial-run-approved-2026-09-03`):** stüdyo için ikinci bir departman satırı — `media.creative` · L1 · `fable-5.1` (katalog: *Claude Fable 5.1*, SDK: `claude-fable-5-1`) · `xhigh` · öncelik 40 · **`enabled=false`** — migration `20260903210000_b43_two_brains.sql`. Deneme, iki satırın `enabled` bayrağını koşular arasında çevirir (kart tek, koşular ardışık). **CEO hükmü 2026-09-05 (*"Fable 5.1 olsun, Opus 5 yedek"*, `studio-brain-fable-5-1-opus-5-standby-2026-09-05`): stüdyonun beyni `fable-5.1` (Claude Fable 5.1) — satırı `enabled=true`, öncelik 50; `fable-5` (Claude Opus 5) satırı kapalı yedek, öncelik 40; `audit_log` `routing_change`. `loadPolicy` her koşuda yalnız açık satırları okur, servis yeniden başlatılmadan geçerli.** Kanıt: aynı test §6 ve `routing_rules` sorgusu.

**Registered adaptation (2026-09-15, B43 / B08 — CEO rulings `top-tier-set-and-brain-switch-order-2026-09-13` and `studio-brains-open-set-defaults-switchable-2026-09-15`; audit F034, W4):** the studio's brain is a DEFAULT MAP, not a restriction. Defaults: the director, the screenwriter and every creative seat → the smartest model of the day (today Claude Fable 5.1 at `xhigh`, the `media.creative` department row above); every other employee → Claude Opus 5 (`fable-5`). Not restricted to those two: GPT Solo 5.6 (`codex-5.6`, catalogue `testing` today), GPT Astra 6 (no catalogue row yet; the Codex CLI upgrade first — B08 step 1) or another model may serve any seat. Every brain is changeable at any moment by the CEO or by Hamza with one click (§4b `fn_update_agent_brain` / `fn_update_routing`, audited), and a new model is addable from inside the studio (§4c drawer reached from the studio tab). Consequence for §4d: the top tier is a SET, and which member serves a seat is always an explicit routing row or his override — see the §4d note. Measured 2026-09-15 after W10: enabled L1 rows `fable-5` 11 · `fable-5.1` 1 (`media.creative`, dept-scoped) · 16 slot rows without a model; the 14 studio seats' `agents.brain` reads **`fable-5.1`** — the model of the enabled `media.creative` row — and the two ASSIGNED seats read `fable-5`, because they route by their own home departments (audit F035, closed). **Registered adaptation (2026-09-15, W10):** the label no longer has to be corrected by hand behind §4b's doors — `trg_agents_brain_follows_routing` on `routing_rules` moves the `brain` of a department's SLOT-derived seats whenever that department's enabled `media.creative` row changes, and never touches a `ceo_override` brain, which is the CEO's own choice and outranks the router. What §4b writes, the trigger follows; the doors themselves are unchanged. Nothing of the panel is built; B08 step (7) carries it.

## 4. Veri modeli

[[DATA_MODEL]] kontrol ailesine (0021x) normatif tanım.

**Live-schema alignment (2026-07-12, recorded — not silent):** the deployed schema (migration family 0021x, authority [[DATA_MODEL]] §4.2) is the single source of truth for column names. An earlier draft of this section used `cost_in_per_1m/cost_out_per_1m`, `speed_tier text`, status `disabled`-only, a `display_name` column, and the table name `model_routing_rules` — none of these exist live. This section now shows the LIVE schema; every column this spec additionally requires (for §4b `fn_update_agent_brain` and the §4c onboarding flow) is listed as an explicit **E6.1 ALTER delta** below. §4b/§4c functions CANNOT be written before that delta ships.

```sql
-- LIVE (deployed, authority: DATA_MODEL §4.2)
model_catalog (
  id text PK,                  -- LiteLLM alias, e.g. 'claude-opus-4-8'
  provider text NOT NULL,      -- 'anthropic' (via LiteLLM)
  context_window int,
  cost_in_per_mtok numeric, cost_out_per_mtok numeric,
  speed_score int,             -- higher = faster
  quality_score int,           -- 0-100, CEO/QA updates
  reliability numeric,         -- 30-day success rate (computed, view)
  fallback_of text NULL REFERENCES model_catalog(id),  -- cycle-guarded (trigger, E4 evidence)
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','degraded','retired'))
)

-- E6.1 ALTER delta — migration 0021h_model_catalog_governance.sql (0021x family, NOT YET LIVE):
--   ALTER TABLE model_catalog
--     ADD COLUMN display_name text,
--     ADD COLUMN banned boolean NOT NULL DEFAULT false,          -- R2: migration-only ban flag (no true row today — Sonnet free, CEO 2026-07-12)
--     ADD COLUMN mechanical_only boolean NOT NULL DEFAULT false; -- R2: haiku family true
--   status CHECK extended to ('active','testing','degraded','disabled','retired')
--     -- 'testing' = §4c onboarding mandatory step · 'disabled' = CEO temporary off · 'retired' = decommissioned, never deleted (§4c)

-- LIVE routing table is `routing_rules` (extended in 0021x with model_id + role_slot);
-- the earlier draft name `model_routing_rules` does not exist and must not be used.
routing_rules (
  id uuid PK,
  -- legacy columns (pre-0021x): task_class, match jsonb, model_tier, model, mode, effort, needs_council
  priority int, enabled boolean, updated_at timestamptz,
  model_id text FK→model_catalog,  -- live (0021x)
  role_slot text                   -- live (0021x); R1'deki 13 slot
)
-- E6.1 ALTER delta (same 0021h migration):
--   ALTER TABLE routing_rules
--     ADD COLUMN department_id uuid NULL,          -- null = all departments
--     ADD COLUMN risk_max text NULL,               -- highest risk this rule accepts
--     ADD COLUMN min_context int NULL,
--     ADD COLUMN cost_cap_per_task numeric NULL;
--   + UNIQUE(role_slot, priority, department_id) for slot-resolution determinism
```

Varsayılan atamalar (seed — CEO settings'ten değiştirir; ⛔ değişiklik CEO-görünür):

| Rol slotu | Varsayılan | Not |
|-----------|-----------|-----|
| Ana orkestratör · kritik karar · review · planlama · kodlama · tasarım · araştırma · QA · HR · execution | `fable-5` (görünen ad: **Claude Opus 5**) | Devir tamamlandı 2026-07-25: kritik-karar/review Opus 5'tedir. Katalog satırının teknik `id`'si tarihsel nedenle `fable-5` kalır (yeniden adlandırma canlı FK zincirini kırardı — CEO kararı 2026-07-25); CEO'ya görünen ad `display_name` üzerinden Opus 5'tir. |
| Yedek orkestratör · emergency fallback | **YOK** (katman kaldırıldı, CEO 2026-07-25) | Tek beyin Opus 5. Hata/timeout/rate-limit'te sessiz alt-model düşüşü yasak — iş `blocked` raporuyla CEO'ya çıkar (§"never a silent drop"). `claude-opus-4-8` satırı `status='retired'`. Tek-provider riski §26'da |
| Hızlı görev · düşük maliyet | `claude-haiku-4-5` (`mechanical_only`) | verdict üretemez; çıktısı ham girdi sayılır |
| (atanabilir havuz — varsayılan slotu yok) | `claude-sonnet-5` (`banned=false`) | CEO kararı 2026-07-12: runtime beyin olarak SERBEST; CEO settings/panel'den slot veya ajan-beyni atar — hızlı görev/düşük maliyet slotlarına doğal aday |

### 4b. Ajan-seviyesi beyin: `agents.brain` — dashboard'dan değişim (CEO direktifi 2026-07-12, normatif)

Canlı kolon: `agents.brain text NOT NULL DEFAULT 'glm-5.2'` (`20260707000002_registry.sql:14`). Bugünkü kadro-genelindeki tekdüzelik kolon DEFAULT'unun görüntüsüdür — iskelet üreticisi (`gen-workforce-dossiers.sh`) model ataması YAPMAZ; bu bir tasarım kararı değil, henüz koşulmamış rotalama atamasıdır (sicil alan 8 notu: "MODEL_ROUTING_SPEC slot kuralına tabi"). Persona dosyası model kopyası TUTMAZ (alan 9: "kaynak: canlı DB — kopya tutulmaz"); beyin gerçeği yalnız DB'dedir, dosyaya model adı yazmak ihlal.

**Katman ilişkisi (çözüm önceliği):**
- Yeni kolon: `agents.brain_source text NOT NULL DEFAULT 'default'` — `default` (doldurulmamış placeholder) | `slot` (rotalama-atama geçişiyle §4 varsayılan tablosundan türetilmiş) | `ceo_override` (dashboard'dan CEO ataması). Migration: `0021g_agent_brain_source.sql` (0021x ailesi, §22'ye ek).
- `fn_select_model` genişler: adım 0 — ajanın `brain_source='ceo_override'` ise model = `agents.brain`, kural taraması atlanır; aksi halde §3 zinciri aynen. Korkuluklar HER iki yolda istisnasız: `banned=true` model hiçbir ajana atanamaz/seçilemez (bugün boş küme — mekanizma migration-only korunur), `mechanical_only` model yalnız mekanik görev-sınıfı role atanabilir (`role_level='ops_agent'`; verdict/onay üretemez), COST_CONTROL hard-stop her seçimi keser.
- **Rotalama-atama geçişi** (tekdüzeliği gideren adım): E5.5 persona dalgaları bitince tek migration — her ajanın rol sınıfı → 13 slot eşlemesi → §4 varsayılanından `brain` yazılır, `brain_source='slot'`, decision_log'a toplu `routing_change`. Geçişe kadar glm-5.2 görünümü bilinen-placeholder'dır; slot kuralı değişince `brain_source='slot'` ajanlar yeniden çözülür, `ceo_override` ajanlar CEO temizleyene kadar sabit kalır.

**Dashboard değişim kanalı (TEK yol):**
- Yüzey: `EmployeeCommandPage`/`EmployeeCard` Control Mode rozeti + palette "X'in modelini değiştir" ([[CEO_COMMAND_CENTER_SPEC]] §8) → `POST /api/control/employees {op:'set_model', employee_id, model_id, rationale}`.
- fn: `fn_update_agent_brain(employee_id, model_id, rationale)` — doğrulama: katalogda var + `status='active'` + `banned=false` + `mechanical_only` rol-sınıf kontrolü; yazım: `agents.brain` UPDATE + `brain_source='ceo_override'` + audit_log + decision_log(`routing_change`, aktör=`ceo`, gerekçe) + `settings` Broadcast (kernel cache invalidate — §9 yolu). Yanıt `{ok, change_id}`; undo settings_change_log/audit üzerinden. Doğrudan tablo UPDATE'i (psql/PostgREST) control seam dışıdır — audit'siz yazım ihlal.
- **Eval-önce doktrini (CAIO):** ajan/CAIO-kaynaklı beyin-değişim önerisi eval-önce + kayıtlı yürür (CAIO persona hükmü). CEO dashboard değişimi hook'un ÜSTÜNDEDİR ([[FABLE_5_HOOK_SPEC]] CEO istisnası): engellenmez, anında uygulanır; sistem warn + audit düşer ve CAIO'ya değişim-sonrası eval görevi otomatik kuyruklanır (`v_model_stats` 7 gün izleme; gerileme → bilgi-alert'i + geri-alma önerisi — approval DEĞİL, operasyon bilgisi).
- Kapsam ayrımı (üstbilgi satırının tekrarı, karışma yasak): bu blok ÜRÜN RUNTIME beyinleridir; inşaat yazarlık hiyerarşisi (model-routing-hierarchy v9: tek yazar Opus 5, yedek yok, Sonnet defedildi, Haiku getir-götür) kim persona/kod yazar sorusudur — iki ağaç ayrıdır.

### 4c. Yeni model ekleme + bağlama — dashboard'dan (CEO direktifi 2026-07-12 ~01:30, normatif)

Yeni bir model çıktığında CEO onu dashboard'dan kataloğa ekler ve bağlar; VPS'e SSH / config dosyası elle düzenleme GEREKMEZ. Giriş yüzeyi: `/ai/models` "Model Ekle" (yalnız Control Mode) → `ModelOnboardDrawer`. Dört adımlı akış, tamamı control seam üzerinden:

1. **Kayıt:** form (id, provider, display_name, context_window, cost_in_per_mtok/cost_out_per_mtok, speed_score) → `POST /api/control/models {op:'add_model'}` → katalog satırı **`status='testing'`** doğar (atanabilir havuzda DEĞİL). LiteLLM'e kayıt proxy admin API'siyle runtime yapılır (config dosyasına dokunmadan); admin API erişilemezse satır "LiteLLM kaydı bekliyor" durumunda görünür kalır — sahte-hazır yasak (§35 ruhu). ⛔ Raw provider key ASLA dashboard'dan girilmez/gösterilmez (R5): key işi vault + LiteLLM env; dashboard yalnız alias tanır. <!-- HISTORY -->
2. **Duman testi (zorunlu):** `{op:'test_model'}` → LiteLLM üzerinden 1 ucuz çağrı; latency/token/hata drawer'da gösterilir; başarısız model `testing`te kalır.
3. **Eval-önce:** aktivasyon öncesi mini eval bataryası görevi otomatik açılır (sahip: Model Evaluation Lead, CAIO doktrini); sonuç `quality_score` ilk değerini verir. CEO atlayabilir — §4b ile aynı hook-üstü rejim (warn + audit + 7 gün izleme).
4. **Aktivasyon + bağlama:** `{op:'set_catalog_status', 'active'}` → model atanabilir havuza girer; aynı drawer'dan bağlama kısayolları: rol slotuna ata (`assign_role`) · tek ajana beyin yap (§4b `set_model`) · fallback zincirine ekle (`set_fallback`, döngü-CHECK).

Her adım audit_log + decision_log. Katalog satırı SİLİNMEZ — emekli model `status='retired'` (geçmiş decision_log referansları kırılmaz).

**KAYITLI ADAPTASYON — Codex 5.6, CEO hükmü 2026-08-26.** <!-- CEO-OK: b07-codex-56-exam-waived-ceo-vouches-2026-08-26 --> Kendi sözleriyle: *"burada codex 5.6 sınavına gerek yok onu kaldır. ben kefilim ona."* Bu, yukarıdaki 3. adımın ("eval-önce") zaten tanıdığı **CEO atlama** hakkının bu model için kullanılmasıdır — yeni bir kural değil, var olan maddenin işletilmesi: uyarı + audit + 7 gün izleme rejimi aynen geçerlidir. Muafiyet **yalnızca Codex 5.6'yı** kapsar; başka hiçbir model sınavdan muaf değildir, yasaklı kadro (`banned=true`) etkilenmez ve buradan şirket veritabanına hiçbir yazma gitmez (B36). Tahtada B07 bu hükümle kapandı.

### 4d. THE QUALITY TIER LAW (CEO order 2026-07-26, normative, supersedes the §4 default table where they disagree)

**The law, one sentence: judgment, taste, structure and every output a human — the CEO or a customer — actually sees is produced by Opus 5. A lower tier's output is never a finished product; it is the higher tier's input.**

CEO in chat, verbatim: *"ana hedef KALİTE!!! her işte!!! zeka!!!"* · *"sonnet şuanlık kritik işlerde asla olmamalı … sadece angarya işlerinde"* · *"site mağaza kurulumunu sen yapacaksın tasarım vs … basit ve göze hitap etmeyen backend işleri vs bunlar diğer modeller … videolarda alt yazı başka model ama videoların tasarımı vs sen"*.

The dividing line is **not** cost and **not** code-versus-text. It is a single question: *does this work carry taste, structure, or a result a human will see?* If yes, it is L1 and stays L1 permanently — a cheaper coder model arriving later does not change it.

| Tier | What belongs here | Model today |
|------|-------------------|-------------|
| **L1** | strategy · decisions · money · QA and halal verdicts · research **synthesis** · site and store build · design and video direction · feature code · department planning · outbound content · the CEO conversation (chat and voice) · memory promotion | `fable-5` (display **Claude Opus 5**) |
| **L2** | mechanical backend code with no visual or structural judgment in it (bulk plumbing) | `sonnet-5` |
| **L3** | grunt text work: gathering, drafting, summarising — raw material only | `sonnet-5` |
| **L4** | mechanical/clerical: classify, extract, transcribe, subtitle | `sonnet-5` at `effort='low'`, the local model's reserved seat until the exam runs on the new workstation |

**Research, worked example (the CEO's own case — "which local video tools for the new PC"):** L3 opens the fan (many sources, parallel, cheap) → real tools verify what was gathered (scrapling/playwright, never model memory) → **L1 decides**: what fits 16 GB of VRAM, what the licence permits, what actually runs on Linux, what we install and what we discard. Gathering may be cheap. Concluding may not.

**Roster.** In: Opus 5 (L1), Sonnet (L2-L4 grunt), a local model (L4, after the exam), plus DeepSeek V4 Pro held `mechanical_only` for bulk reads too large for the local tier — it may never produce a verdict. Out, `status='retired'` + `banned=true`: haiku 4.5 · DeepSeek V4 Flash · Kimi 2.7 Code · Kimi 3 · GLM 5.2 · Qwen 3.6 Flash · MiniMax M3 · Codex 5.5. Rows are retired, never deleted (U20 precedent — `agent_runs`/`cost_ledger` history references them), and `banned=true` makes `fn_update_agent_brain` and the §4c onboarding flow refuse to re-hire one from the dashboard.

**Tier homogeneity (new invariant).** `packages/orchestrator/src/worker-shim.ts` resolves a task's model by `model_tier` alone. Before this law, one tier could resolve to four different models depending on row ordering. Every tier is now single-model, so *tier match == model match*. **A routing change that puts two different models on one tier reintroduces nondeterminism and is a defect**, not a preference. **Registered adaptation 2026-09-15 (audit F034; LAW A — the later word governs):** since 2026-09-05 the L1 tier carries two models on purpose — `fable-5` on the holding's rows and `fable-5.1` on the studio's department-scoped row `media.creative` (measured 2026-09-15: enabled L1 rows `fable-5` 11 · `fable-5.1` 1), by his rulings `studio-brain-fable-5-1-opus-5-standby-2026-09-05`, `top-tier-set-and-brain-switch-order-2026-09-13` and `studio-brains-open-set-defaults-switchable-2026-09-15`. The invariant is therefore restated: **the top tier is a SET {Fable 5.1, Opus 5, GPT-6 Astra when its lane answers, and any model he adds}; which member serves a seat is always an EXPLICIT row (department-scoped) or his override, never row order.** Nondeterminism by row order stays a defect; two explicit rows on one tier are not. The sentence before this note is kept as the history it is.

**The GPT/Codex lane is NOT open** (measured 2026-07-26): the CEO's OpenAI key authenticates (HTTP 200, 117 models, up to `gpt-5.6-sol/terra/luna`) but every completion returns `429 insufficient_quota` — the ChatGPT subscription does not fund the API. Opening the lane additionally requires `SDK_MODEL_IDS` to learn a non-Anthropic id or the call to go through LiteLLM. Until both are true, no rule may name a GPT/Codex model; when it opens, that lane competes for **L2 mechanical work only — never for the design lane**. **Superseded in part by his ruling of 2026-09-15** (`studio-brains-open-set-defaults-switchable-2026-09-15`): when the GPT lane opens, GPT Solo 5.6 / GPT Astra 6 are eligible brains for any seat, the creative seats included, by his or Hamza's click — the director and the screenwriter always on the smartest model of the day. The lane's technical state is unchanged (catalogue `codex-5.6` = `testing`, no `gpt-6-astra` row, Codex CLI upgrade first — B08 step 1); nothing is routed to it today.

### 4f. THE BRAIN IS A FLOOR — `agents.brain` becomes load-bearing (CEO decision 2026-07-26, normative)

The CEO read his own workforce page and asked *"183 sonnet nedir?"*. The honest answer was that the column decided nothing: `fn_select_model` never read `agents.brain` (measured: `prosrc` contains no `brain`), no TypeScript router read it, and `worker-shim` resolved the model from `model_tier` alone. §4b had specified an agent-level brain on 2026-07-12; it was never built. Offered the choice between making the column honest ("task-based") and making it real, the CEO chose **real**. <!-- HISTORY -->

**The rule: the brain is a FLOOR, never a ceiling.**

- It may **raise** a task's tier — a director whose brain is Opus 5 runs even routine gathering on Opus 5.
- It may **never lower** one — a Sonnet-brained specialist writing outbound content still runs on Opus 5, because §4d puts that class at L1 and the class always wins.

**Where the ordering lives:** `model_catalog.tier_floor` (`L1` best … `L4`), the best tier a model is allowed to serve. `fn_tier_rank(text)` turns it into a number (unknown → 99, so a typo can never win a comparison) and `fn_effective_tier(task_tier, agent_id)` performs the single comparison. No other place may re-derive quality order. `quality_score` is NOT that source — it is NULL on both Opus 5 and Sonnet and reflects eval history, not seat.

**Deliberately fail-open toward the task's own tier.** An unassigned task, a `brain_source='default'` placeholder, an unrated model, a retired or banned one — all leave the task exactly where the routing table put it. A raised tier with no enabled routing row falls back to the task's tier in `resolveExecutionRoute`. **A floor is an upgrade path, never a new failure mode.**

**Guardrails are absolute and unbypassable by a floor:** `banned` models are never selected; `mechanical_only` models never serve a verdict-capable slot; the budget hard-stop still cuts every non-critical selection. A `ceo_override` brain that fails any of these falls through to the normal rule scan and the refusal is written into the decision's `considered` list — it never silently succeeds and never strands the task.

**§4b step 0, finally built:** the slot lane has no tiers, so the brain enters it the way §4b always said — an employee carrying `brain_source='ceo_override'` wins the selection outright, after the same guardrails, and `decision_log` records `selected_ceo_override` with the agent id. `brain_source='slot'` does NOT hijack the slot lane: a derived assignment is a floor, not an override.

**Live enforcement:** migration `20260726002000_brain_floor.sql`; executor seam `packages/orchestrator/src/worker-shim.ts` → `resolveExecutionRoute()`; proof `tests/c9/brain-floor.test.ts` (14 cases, every probe inside a rolled-back transaction because the resident scheduler shares this database). The employees page header now carries the meaning in both locales instead of leaving the CEO to infer it.

### 4e. THE CRITICAL GATE — challengers, not co-authors (CEO order 2026-07-26, normative)

CEO, said twice in the same session and closed with *"bunu unutma sakın"*: **Solo 5.6 and GPT 5.5 are used inside the holding, and above all in the council — as the models that check Opus 5's work.**

Shape, settled with the CEO the same night after he rejected the first proposal (*"sen kendi cevabını üretmeyeceksen kalite düşmez mi ya? opus 5 bu saydıklarından daha güçlü değil mi"*):

1. **Opus 5 writes the answer.** The strongest model in the roster produces the work — it is never demoted to a comparator that merely picks between weaker drafts. That was the original CNCL-01 error.
2. **Challengers try to break it.** Solo 5.6 (`gpt-5.6-sol`) and GPT 5.5 receive the answer and are instructed to REFUTE: find the wrong number, the missing constraint, the unverified claim, the risk not priced. They do not write a competing deliverable.
3. **Opus 5 revises and signs.** Every surviving objection is either fixed or answered in writing. The final artefact is Opus 5's, and the objections plus their disposition are recorded — a gate with no written trail is decoration.

**Where it fires** (never on every task — a gate that runs everywhere is a tax, not a gate): the L1 classes that bind money, reputation or the company's direction — `strategy`, `final-approval`, `architecture`, `research.synthesis` when the conclusion drives a purchase or an install, outbound content before it leaves the company, and any halal/risk verdict. The existing `routing_rules.needs_council` flag is the switch.

**Transport — BUILT 2026-07-26:** `packages/orchestrator/src/critical-gate.ts`, the Codex CLI in ChatGPT-subscription mode (`auth_mode` = tokens, no `OPENAI_API_KEY`), NOT the OpenAI API — the key returns `429 insufficient_quota` because API billing is separate from the subscription (§4d). The CLI runs `--ephemeral -s read-only --skip-git-repo-check` in a temp directory with `--output-schema`: a challenger reasons about text and may never touch this repository. Two measured traps: stdin must be closed or the CLI blocks forever on *"Reading additional input from stdin…"*, and the final message is read from `-o <file>` because stdout carries CLI chatter.

**Where it fires in the runtime:** `runWorkerOnce`, immediately after the QA hook returns PASS. The hook asks *does this meet its contract*; the gate asks a different question — *is it WRONG*. Objections return as exactly one revision round through the existing `feedback` channel, so the author revises and signs. One round only: a second would let two reviewers argue forever over one task. The switch is the routing row's `needs_council` flag, so the gate stays CEO-configurable as data.

**Failure policy:** challengers never throw. A dead panel is recorded as `unavailable` and the work proceeds — a review gate that can halt the company when a subscription hiccups is a worse failure than a missed review. Unparsable or off-schema verdicts are refused rather than believed.

**Live proof (2026-07-26):** a deliberately flawed recommendation ("install HunyuanVideo 13B at bf16, ~14 GB VRAM, fits the 16 GB card, open weights so commercial use is fine, €0/month") went through the panel. Both challengers returned `flawed` with 7 objections carrying sources: the VRAM figure is wrong (13B at bf16 is ~26 GB of weights alone; Tencent's own README specifies 45-60 GB), open weights do not grant commercial rights (Stable Video Diffusion's licence gates commercial use on revenue), the "best motion quality" claim rests on a table where it was the only open model, and the €0 figure never prices the remedy if the model does not fit. `decision_log` id 20251.

**What is explicitly dead:** the v1 `CNCL-01` shape — three cheap producers (GLM 5.2 / Kimi 2.7 / Qwen 3.6) plus a comparison-only judge. All three producers are dismissed models under U21, and the design inverted the quality order by keeping the strongest model out of authorship.

**Live enforcement:** migration `20260726001000_u21_quality_tier_law.sql` (U21). Seed mirror: `packages/kernel/policy/routing-seed.json` — regenerated from the live table, so a fresh bootstrap reproduces the law instead of resurrecting a fired model.

## 5. Component yapısı

| Bileşen | İçerik |
|---------|--------|
| `ModelOrchestrationPanel` (`/ai/orchestration`) | §19 görsel flow: rol slotları → model node'ları → fallback okları; DESIGN_SYSTEM Model Routing Node + routing graph chart |
| `ModelNode` | model badge + §19 meta rozetleri (usage, failure rate, cost) + sağlık halkası |
| `ModelDetailDrawer` | R3 meta tam seti + assigned employees listesi + aktif task'ler + son routing kararları |
| `RoleSlotColumn` | 13 slot; Control Mode'da drop hedefi (drag = atama değişikliği onay dialog'u ile) |
| `RoutingSimulator` | "bu görev hangi modele gider?" — task tipi+departman+risk gir → seçim zincirini adım adım göster (kural şeffaflığı) |
| `ModelOnboardDrawer` | §4c dört-adım akışı: kayıt → duman testi → eval-önce → aktivasyon+bağlama; `testing` durumu görsel olarak ayrık |

## 6. Backend yapısı

- Seçim fn: `fn_select_model(role_slot, department_id, risk, min_context, est_cost)` — SQL (kural taraması) + orchestrator TS sarmalayıcı (sağlık+bütçe). Karar yazımı: `decision_log` insert (aktör='orchestrator', gerekçe=eşleşen kural id + elenen adaylar).
- Mutasyonlar: `POST /api/control/models` `{op:'assign_role'|'set_status'|'update_rule', ...}` → `fn_update_routing(...)` → audit + `settings` Broadcast (routing değişimi ayar değişimidir).
- Reliability/failure hesap: `v_model_stats` view — agent_runs'tan son 30g başarı, ortalama süre, maliyet; panel bu view'dan beslenir (sahte skor yasak).

## 7. Frontend yapısı

`/ai/models` (katalog: tablo görünümü, R3 meta kolonları) + `/ai/orchestration` (flow paneli). RSC yükler (`v_model_stats` + catalog + rules tek geçiş); client adası: flow graph (drag yalnız Control Mode). Settings 6.1 bölümü aynı mutasyon endpoint'ine delege (çift kaynak yok — SETTINGS §8 delegate deseni).

## 8. API'ler

Reads: `v_model_stats`, `v_routing_rules_resolved` (rol→etkin kural zinciri). Mutations: `/api/control/models` (idempotency + `{ok, change_id, affected[]}`). Ajan içi: orchestrator → LiteLLM `POST /chat/completions` (virtual key `Authorization`; model id seçimden). LiteLLM config: provider key'ler yalnız proxy env'inde — repo/agent config'te 0 satır (doğrulama komutu §24).

## 9. Event yapısı

- `routing_decision` / `routing_fallback` / `routing_change` decision_log olayları; `ops:live` kanalına ajan satırında "model" alanı olarak yansır.
- 2 ardışık fallback VEYA provider degraded → `alerts` (High); emergency fallback'e düşüş → Critical.
- Routing değişikliği → `settings` Broadcast (kernel cache invalidate — SETTINGS §9 ile aynı yol).
- `agents.brain` değişimi (§4b) → decision_log `routing_change` + `settings` Broadcast; EmployeeCard/AgentDock model rozeti canlı boyanır (optimistic update yok — §10 ilkesi).

## 10. State yönetimi

Panel client state'i yalnız görsel (seçili node, simulator girdileri). Atama gerçeği DB'de; drag bırakıldığında onay dialog'u → mutasyon → Broadcast dönüşü node'u boyar (optimistic update YOK — yanlış atama görsel yalanı olmasın).

## 11. Database tabloları / 12. İlişkiler

§4 normatif; [[DATA_MODEL]] 0021x ailesine girer. İlişkiler: catalog 1—N rules; catalog self-FK fallback zinciri (döngü CHECK ile yasak: `fallback_of != id` + fn içi derinlik≤4 kontrolü); rules.department_id → org_units (E6.1 delta). RESOLVED 2026-07-12: the existing `routing_rules` table was extended IN PLACE by the 0021x family (model_id + role_slot live); no view-alias bridge and no `model_routing_rules` table exist or will be created — the name `routing_rules` is final (breaking change yasak — SYSTEM_ARCHITECTURE §11).

## 13. Yetkilendirme

Atama/kural değişikliği yalnız `ceo` (Control Mode → seam). `system` yalnız `status` alanını değiştirebilir (health degradation otomatiği); banned/mechanical_only bayraklarını KİMSE runtime'da değiştiremez (migration-only — CEO kararıyla değişir; emsal: Sonnet yasağı tam bu yolla, kayıtlı CEO kararıyla kaldırıldı 2026-07-12 — sessiz değişim imkânsız kalır). `agents.brain` aynı rejimde: runtime yazımı yalnız `ceo` (§4b tek yol, `fn_update_agent_brain`); `system` yalnız rotalama-atama geçişi migration'ıyla yazar.

## 14. Logging / 15. Audit

Her seçim decision_log (gerekçeli); her atama değişikliği audit_log + settings_change_log (undo). Panel "son 50 routing kararı" akışı decision_log'dan — CEO "neden bu model?" sorusunun cevabını HER ZAMAN görür (madde 2: her kararın gerekçesi).

## 16. Security

Virtual key'ler departman-başı (mevcut LiteLLM kurulumu KALIR); key rotasyonu SECURITY_MODEL sicil konusu. Model çağrı içerikleri loglanmaz (token maliyeti + gizlilik) — yalnız meta (model, token sayıları, süre, sonuç durumu).

## 17. Error handling / 18. Retry / 19. Fallback

- Model hatası sınıflaması: rate-limit/timeout → transient (zincirde kal, retry 6.1 politikası); auth/4xx → policy (zincirde sıradaki + alert); içerik reddi → task'e döner (model değişimi çözmez).
- Zincir tükenirse: task `blocked_no_model` state + Critical alert + CEO aksiyonu (Approval Center'a düşmez — approval değil operasyon arızası).
- LiteLLM proxy çökmesi: orchestrator circuit-breaker (30sn) + kuyruk park; VPS içi restart `unless-stopped`.

## 20. Test planı / 21. Acceptance criteria

- Birim: kural önceliği, departman override'ı, banned reddi, mechanical_only kısıtı, fallback derinlik sınırı, bütçe-stop kesişimi.
- Entegrasyon: sahte provider hatası → zincir yürür → decision_log 2 satır → alert.
- Kabul: 13 slot panel'de görünür ve atanabilir · her koşuda decision_log kaydı var (örneklem denetimi) · `banned=true` test-satırı atama denemesi reddedilir (mekanizma kanıtı; Sonnet serbest — CEO 2026-07-12) · simulator zinciri doğru gösterir · settings 6.1 ↔ panel aynı kaynağı değiştirir · §4b: dashboard'dan beyin değişimi → audit_log + decision_log + Broadcast üçlüsü kanıtlı; banned model ajan-seviyesinde de reddedilir; `ceo_override` ajan slot-kural değişiminden etkilenmez (kanıt sorgusu) · §4c: add_model→testing→duman→active zinciri audit'li; `testing` model hiçbir slota/ajana atanamaz (fn reddi, kanıt).

## 22. Migration planı / 23. Rollback planı

0021x içinde: `0021d_model_catalog.sql` (+seed katalog) · `0021e_routing_rules.sql` (+seed varsayılan atamalar) · mevcut routing_rules köprüsü `0021f`. ROLLBACK blokları: rules→catalog sırasıyla DROP; köprü view geri alınınca eski tablo aynen çalışır (orchestrator eski yolu feature-flag'le okuyabilir — iki sürüm birlikte yaşar).

## 24. Uygulama sırası

1. 0021d-f → `psql -c "SELECT id, banned FROM model_catalog WHERE id LIKE 'claude-sonnet%'"` → satır var, `banned=false` (CEO 2026-07-12); banned-mekanizması testi ayrı test-satırıyla
2. `fn_select_model` + orchestrator entegrasyonu → smoke: `psql -c "SELECT fn_select_model('execution', NULL, 'low', 8000, 0.5)"` → opus id döner
3. decision_log yazımı → bir test task koş → `psql -c "SELECT count(*) FROM decision_log WHERE kind='routing_decision'"` → ≥1
4. Panel + drawer + simulator → Playwright: atama değiştir → onay → audit satırı
5. Raw-key taraması: `grep -rn "sk-ant\|sk-or" packages/ apps/ --include="*.ts" | wc -l` → 0

Opus-devralma: kural yorumlayıcı + panel bağımsız teslim birimleri; seed atamaları tablo halinde (yukarıda) — Opus değiştirmez, uygular. ⛔ kritik: varsayılan atama tablosu, banned/mechanical_only kümeleri, fallback derinliği — en güçlü model + CEO onayı.

## 25. Bağımlılıklar

LiteLLM 1.91 proxy (canlı) · [[SETTINGS_AND_CONTROL_SPEC]] resolve/registry · [[COST_CONTROL_SPEC]] hard-stop bayrağı · [[OBSERVABILITY_SPEC]] decision_log/alerts · [[DATA_MODEL]] 0021x.

## 26. Riskler / 27. Edge case'ler

- **Tek-provider yoğunluğu** (bugün fiilen Anthropic): katalog provider-çoklu tasarlandı; yeni provider eklemek = katalog satırı + LiteLLM config, kod değişikliği yok. Provider-çapı kararı CEO'da.
- **Quality score öznelliği**: skor CEO/QA girdisi + v_model_stats gerçek verisi yan yana gösterilir — tek sayıya indirgenmez.
- **Fallback fırtınası** (rate-limit dalgası): zincir başına dakikada ≤3 düşüş, sonrası circuit-breaker + kuyruk park (maliyet patlaması önlenir).
- **Yazar devri (GERÇEKLEŞTİ 2026-07-25)**: kritik-karar slotu Opus 5'tedir; `claude-opus-4-8` satırı `retired`, yedek zincir kaldırıldı. Gelecekte bir katalog satırı `disabled`/`retired` edilirse aynı yol işler: slot yeniden çözülür → decision_log 'routing_change' + CEO'ya bilgi alert'i.
- **mechanical_only ihlal denemesi** (Haiku'ya review görevi): fn reddeder + policy hatası + decision_log; görev bir üst slota escalate.

## Done definition (bu spec)

27 başlık ✓ · şema+seed+fn sözleşmesi kod seviyesinde ✓ · 13 rol slotu + varsayılan tablosu ✓ · banned mekanizması (migration-only) ✓ — Sonnet runtime yasağı CEO kararıyla kaldırıldı 2026-07-12, kayıtlı · §19 meta seti eksiksiz ✓ · doğrulama komutları adım-başı ✓ · Opus-devralma + ⛔ kararlar ✓ · ajan-beyni katmanı §4b (dashboard değişimi + öncelik çözümü + rotalama-atama geçişi — CEO direktifi 2026-07-12) ✓

## Registered adaptation A-2026-07-19 (CEO complaint ledger C2 + C12 — BINDING)

1. **OpenRouter carries ONLY low-cost/Chinese models.** Anthropic models never
   ride OpenRouter: removed from `vps/litellm/config.yaml` (2026-07-19);
   `routing_rules`/`routing-seed.json` api-mode rows with Anthropic models
   flipped to `subscription`. Measured trigger: $2.80 real Sonnet spend on the
   CEO's OpenRouter panel.
2. **Fable fallback chain = Codex 5.6 Solo (first), Opus 4.8 (second).**
   Catalog: `codex-5.6.fallback_of = fable-5` (status `testing` until its
   exam); Opus 4.8 remains the construction-authorship fallback per v6 memory.
3. **Catalog completed to the real roster** (kimi-2.7-code, glm-5.2,
   deepseek-v4-flash, qwen3.6-flash, minimax-m3, codex-5.5 active; CEO-ordered
   candidates codex-5.6, kimi-3, deepseek-v4-pro in `testing` — kimi-3
   replaces kimi-2.7 only after passing its exam, C2 order). No guessed
   numbers: unknown context/cost fields stay NULL and the UI renders only
   informative values (A1).
4. **Add-model = name + API key (+ optional note).** Key goes to the local
   vault file `~/.dxb/model-keys.env` (chmod 600, outside repo) — never the
   database; audit records the event, not the key. Provider/routing wiring is
   the orchestrator's job (§4c gate chain unchanged: testing → smoke → eval →
   activate).
5. **chat.answer routing row** (sonnet-5, subscription, medium effort) added
   for the CEO Chat Board fast lane (C1/C10) — §4b runtime-lane authority.

## Registered adaptation A-2026-07-25 (CEO order — construction authorship handover, U20, BINDING)

1. **Construction authorship moved Fable 5 → Opus 5.** Every forward-looking
   authority sentence in the corpus, the governance memory and the planning
   docs now names **Opus 5**. `model-routing-hierarchy` is at **v9**.
2. **The backup-model layer is REMOVED.** The v6 chain "Fable in person → at
   worst Opus 4.8" and the v5 budget-fallback mode are cancelled. One brain:
   Opus 5. On error/timeout/rate-limit there is no silent downgrade — the work
   surfaces to the CEO as a `blocked` report. Consequence in the catalog:
   `claude-opus-4-8` moves to `status='retired'`; item 2 of adaptation
   A-2026-07-19 (Opus 4.8 as the construction-authorship fallback) is
   **superseded** by this row. The Codex 5.6 fallback row from that same
   adaptation is untouched (separate CEO order, standing order 3).
3. **History is not rewritten** (CEO decision 2026-07-25). Records of who
   authored what — persona `Created by: fable-5`, the live
   `persona_version='v2.0-fable'` rows, applied migration files, evidence
   notes — stay exactly as they are: Fable 5 really did build 2026-07-06 →
   2026-07-25, and editing those records would violate the §35 zero-fabrication
   rule.
4. **Internal technical identifiers are not renamed** (CEO decision
   2026-07-25). `model_catalog.id='fable-5'`, the settings key
   `orchestrator.fable_review_required`, the escalation rung `fable-final`,
   the file name `FABLE_5_HOOK_SPEC.md` and the persona §11 heading (gate
   matches on that title — `packages/hr/src/template.ts:25`) keep their keys;
   renaming them would break live FK chains, the settings undo chain and the
   196-persona gate for zero CEO-visible benefit. **Every CEO-visible label is
   Opus 5** — carried by `model_catalog.display_name` and the i18n message
   values, not by the keys.
5. **Known cosmetic boundary:** persona files still carry the section heading
   `## 11. Fable 5 hook binding` and the historical `Created by: fable-5`
   line. This is deliberate (rows 3 + 4) and CEO-approved; the dashboard never  <!-- CEO-OK: identifier-preservation-2026-07-25 -->
   renders that heading verbatim.
