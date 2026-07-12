# MODEL_ROUTING_SPEC — MODEL ORKESTRASYONU VE ROTALAMA

> Dalga 2 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Kardeşler: [[SETTINGS_AND_CONTROL_SPEC]] (6.1 anahtarları), [[COST_CONTROL_SPEC]] (bütçe kesişimi), [[AGENT_ORCHESTRATION_SPEC]] (D3, tüketici)
> Direktif kaynağı: §19 (Model Orchestration Panel) + madde 6.1 (model rolleri) + madde 18 (model/görev dağılımı) + **CEO direktifi 2026-07-12** (ajan beyinleri dashboard'dan değiştirilebilir — §4b). **KAYITLI KARAR DEĞİŞİMİ (CEO 2026-07-12 ~01:00):** madde-18 "Sonnet YOK" daraltması RUNTIME için KALDIRILDI — Sonnet şirket içinde beyin olarak serbest; inşaat-dönemi yazarlık yasağı (model-routing-hierarchy) AYNEN sürer.
> Kapsam ayrımı: bu spec ÜRÜN RUNTIME rotalamasıdır (holding ajanlarının model seçimi). İnşaat-dönemi yazarlık kuralları ayrı yönetişimdir (model-routing-hierarchy v6; korpus/execution Fable bizzat → 12 Temmuz sonrası Opus).

## 1. Amaç

Her ajan koşusunun HANGİ modelle çalışacağının tablo-güdümlü, CEO-değiştirilebilir, fallback'li ve tamamen loglanan seçimi. Hardcode model adı hiçbir ajan config'inde bulunamaz; seçim runtime'da `routing_rules`dan çözülür (live table name — see §4 alignment note), her karar `decision_log`a düşer.

## 2. Gereksinimler

- R1. Madde 6.1'in 13 rol slotu birinci sınıf: ana orkestratör · yedek orkestratör · planlama · execution · review · kritik karar · hızlı görev · düşük maliyet · araştırma · kodlama · tasarım · QA · HR.
- R2. Haiku yalnız mekanik getir-götür sınıfı görevlerde (verdict/onay üretemez — rol kısıtı `mechanical_only`). `banned` bayrağı MEKANİZMA olarak kalır (gelecek yasaklar için, migration-only). ~~Sonnet hiçbir rol slotuna atanamaz~~ **KALDIRILDI (CEO kararı 2026-07-12):** Sonnet katalogda `banned=false` — rol slotlarına ve `agents.brain`e atanabilir; eski madde-18 daraltması yalnız İNŞAAT yazarlığında yaşar (üstbilgi kapsam ayrımı).
- R3. Her model için §19 meta seti: provider, context window, cost, speed, quality score, reliability, current usage, assigned employees, active tasks, failure rate, fallback ilişkisi.
- R4. Fallback zinciri deterministik: `model_catalog.fallback_of` + rol-başı sıra; her düşüş decision_log'a `routing_fallback` olayı.
- R5. Raw provider key YASAK: tüm çağrılar LiteLLM proxy virtual key'leriyle (departman-başı; STACK sert kuralı).
- R6. Model Orchestration Panel (§19): görsel flow, node sürükle → rol ataması değişir (control seam üzerinden); settings 6.1 anahtarlarıyla AYNI kaynağa yazar.
- R7. Rotalama parametreleri ayarlanabilir (6.1): timeout, max token, max maliyet, context limiti, retry, confidence threshold, escalation, human-approval eşiği, Fable-review zorunluluğu — hepsi settings_registry'de, resolve zinciriyle scope'lu.
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
| Ana orkestratör · kritik karar · review · planlama · kodlama · tasarım · araştırma · QA · HR · execution | `claude-opus-4-8` | Fable erişimi varken kritik-karar/review fiilen Fable'dadır (12 Temmuz'a kadar); katalogda Fable satırı `status=active`, sonrası `disabled` — BACKUP_PLAN devir protokolü |
| Yedek orkestratör · emergency fallback | `claude-opus-4-8` → zincir: opus→(gelecek onaylı model) | tek-provider riski §26'da |
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
- Kapsam ayrımı (üstbilgi satırının tekrarı, karışma yasak): bu blok ÜRÜN RUNTIME beyinleridir; inşaat yazarlık hiyerarşisi (model-routing-hierarchy: Fable→Opus, Sonnet defedildi, Haiku getir-götür) kim persona/kod yazar sorusudur — iki ağaç ayrıdır.

### 4c. Yeni model ekleme + bağlama — dashboard'dan (CEO direktifi 2026-07-12 ~01:30, normatif)

Yeni bir model çıktığında CEO onu dashboard'dan kataloğa ekler ve bağlar; VPS'e SSH / config dosyası elle düzenleme GEREKMEZ. Giriş yüzeyi: `/ai/models` "Model Ekle" (yalnız Control Mode) → `ModelOnboardDrawer`. Dört adımlı akış, tamamı control seam üzerinden:

1. **Kayıt:** form (id, provider, display_name, context_window, cost_in_per_mtok/cost_out_per_mtok, speed_score) → `POST /api/control/models {op:'add_model'}` → katalog satırı **`status='testing'`** doğar (atanabilir havuzda DEĞİL). LiteLLM'e kayıt proxy admin API'siyle runtime yapılır (config dosyasına dokunmadan); admin API erişilemezse satır "LiteLLM kaydı bekliyor" durumunda görünür kalır — sahte-hazır yasak (§35 ruhu). ⛔ Raw provider key ASLA dashboard'dan girilmez/gösterilmez (R5): key işi vault + LiteLLM env; dashboard yalnız alias tanır.
2. **Duman testi (zorunlu):** `{op:'test_model'}` → LiteLLM üzerinden 1 ucuz çağrı; latency/token/hata drawer'da gösterilir; başarısız model `testing`te kalır.
3. **Eval-önce:** aktivasyon öncesi mini eval bataryası görevi otomatik açılır (sahip: Model Evaluation Lead, CAIO doktrini); sonuç `quality_score` ilk değerini verir. CEO atlayabilir — §4b ile aynı hook-üstü rejim (warn + audit + 7 gün izleme).
4. **Aktivasyon + bağlama:** `{op:'set_catalog_status', 'active'}` → model atanabilir havuza girer; aynı drawer'dan bağlama kısayolları: rol slotuna ata (`assign_role`) · tek ajana beyin yap (§4b `set_model`) · fallback zincirine ekle (`set_fallback`, döngü-CHECK).

Her adım audit_log + decision_log. Katalog satırı SİLİNMEZ — emekli model `status='retired'` (geçmiş decision_log referansları kırılmaz).

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
- **Fable→Opus devri günü**: katalogda Fable satırı disabled'a çekilir → tüm kritik-karar slotu otomatik Opus'a düşer → decision_log 'routing_change' + CEO'ya bilgi alert'i (BACKUP_PLAN protokolüyle senkron).
- **mechanical_only ihlal denemesi** (Haiku'ya review görevi): fn reddeder + policy hatası + decision_log; görev bir üst slota escalate.

## Done definition (bu spec)

27 başlık ✓ · şema+seed+fn sözleşmesi kod seviyesinde ✓ · 13 rol slotu + varsayılan tablosu ✓ · banned mekanizması (migration-only) ✓ — Sonnet runtime yasağı CEO kararıyla kaldırıldı 2026-07-12, kayıtlı · §19 meta seti eksiksiz ✓ · doğrulama komutları adım-başı ✓ · Opus-devralma + ⛔ kararlar ✓ · ajan-beyni katmanı §4b (dashboard değişimi + öncelik çözümü + rotalama-atama geçişi — CEO direktifi 2026-07-12) ✓
