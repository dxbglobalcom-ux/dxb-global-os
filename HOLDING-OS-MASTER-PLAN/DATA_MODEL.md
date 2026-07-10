# DATA_MODEL — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 1 · Yazar: Fable 5 bizzat · Üst: [[SYSTEM_ARCHITECTURE]] · Normatif tüketiciler: tüm D2-D5 spec'leri
> Kural (mimari §11): mevcut 18 tabloya breaking change YASAK — genişleme nullable ADD COLUMN veya yeni tablo+FK.

## 1. Amaç

Holding OS'un tüm birinci-sınıf varlıklarının tek şema sözlüğü: mevcut 18 tablonun sicili (KALIR/GENİŞLER hükümlü) + 5 yeni tablo ailesinin uygulanabilir DDL taslakları, ilişkiler, RLS deseni, index stratejisi, migration/rollback haritası.

## 2. Gereksinimler

- Şema-önce: UI saf projeksiyon; hiçbir ekran DB'de karşılığı olmayan veri gösteremez (sahte metrik yasağının teknik zeminidir).
- Her mutasyon audit'lenebilir: değişen her ayar/org kaydı `audit_log` + aile-içi change-log'a düşer.
- Drill-down zinciri kopmaz: özet sayı → satır kaynağına FK yoluyla inilebilir (madde 3B Infinite Drill-Down'ın veri karşılığı).
- Çok-dillilik: insan-görünür etiketler i18n katmanında; DB'de kod değerleri İngilizce enum/text.

## 3. Mevcut şema sicili (19 migration, 18 tablo — kanıt: `ls db/migrations | wc -l` → 19)

| Tablo | Görev | Hüküm |
|-------|-------|-------|
| `agents` | Ajan kayıtları (ad, departman, model, durum) | **GENİŞLER** → employees evrimi (§4.1) |
| `departments` | Departmanlar | **GENİŞLER** → org hiyerarşisi (§4.1) |
| `tasks`, `task_events` | Görevler + append-only olay akışı | KALIR; `tasks.project_id` eklenir |
| `intents` | CEO niyet girişi (0016) | KALIR |
| `approvals` | Onay kuyruğu (risk sınıflı; karar yolu 0015) | KALIR; APPROVAL_ENGINE genişletir |
| `outbox` | Dışa dönük aksiyon tek-çıkışı | KALIR — DOKUNULMAZ |
| `cost_ledger`, `budget_state` | Maliyet defteri + bütçe durumu | KALIR; COST_CONTROL view'ları üstüne gelir |
| `audit_log` | Denetim | KALIR; control-plane zorunlu hedefi |
| `routing_rules` | Model/görev yönlendirme | **GENİŞLER** → model_catalog FK (§4.2) |
| `memory_index`, `memory_embeddings` | Bellek indeksi + pgvector | KALIR |
| `crm_clients/contacts/deals/requests` | CRM ailesi | KALIR (Outleteuro fazına hazır) |
| `tool_pins` | Araç sürüm sabitleme | KALIR; library ailesine FK köprüsü |

## 4. Yeni tablo aileleri (DDL taslakları — migration numarasıyla)

Taslaklar normatiftir: kolon adları ve kısıtlar bağlayıcı; incelik (index adı vb.) migration yazımında serbest.

### 4.1 Org ailesi — `0020x_org_family`

```sql
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  mission text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','dormant','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE departments
  ADD COLUMN company_id uuid REFERENCES companies(id),
  ADD COLUMN parent_id  uuid REFERENCES departments(id),
  ADD COLUMN director_id uuid;              -- FK agents(id); ataması HR fn'iyle

ALTER TABLE agents
  ADD COLUMN role_level text
    CHECK (role_level IN ('orchestrator','director','senior_specialist',
                          'specialist','ops_agent','sub_agent')),
  ADD COLUMN manager_id uuid REFERENCES agents(id),
  ADD COLUMN employment_status text NOT NULL DEFAULT 'dormant'
    CHECK (employment_status IN ('draft','probation','active',
                                 'suspended','archived','dormant')),
  ADD COLUMN persona_id uuid,               -- FK personas(id), aşağıda
  ADD COLUMN hook_version text;             -- Fable Hook bağlanma damgası

CREATE TABLE personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES agents(id),
  version int NOT NULL,
  author text NOT NULL CHECK (author IN ('fable-5','hr-factory')),
  body_md text NOT NULL,                    -- rol kimliği→hook bağlantısı, madde 8 şablonu
  quality_gate text NOT NULL DEFAULT 'pending'
    CHECK (quality_gate IN ('pending','passed','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, version)
);

CREATE TABLE employee_records (              -- kurumsal sicil (madde 8 listesi)
  employee_id uuid PRIMARY KEY REFERENCES agents(id),
  responsibilities text[],
  authority_limits text[],
  decision_scope text,
  expertise text[],
  methodology text,
  reporting_standard text,
  quality_standard text,
  escalation_rules text,
  kpis jsonb NOT NULL DEFAULT '[]',
  performance_history jsonb NOT NULL DEFAULT '[]',
  error_history jsonb NOT NULL DEFAULT '[]',
  review_results jsonb NOT NULL DEFAULT '[]',
  training_needs text[],
  version_history jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

Kural (trigger ile): `employment_status='active'` ancak `persona_id` → `quality_gate='passed'` VE `author` v2-damgalı ise (v2'siz persona ile aktivasyon YASAK — CEO kararı 2026-07-07).

### 4.2 Kontrol ailesi — `0021x_settings_family`

```sql
CREATE TABLE settings_registry (             -- neyin ayarlanabilir olduğu (katalog)
  key text PRIMARY KEY,                      -- örn 'orchestrator.primary_model'
  category text NOT NULL,                    -- §18 bölümleri: global_os|models|orchestrator|...
  value_schema jsonb NOT NULL,               -- JSON Schema; fn yazımda doğrular
  risk text NOT NULL DEFAULT 'low' CHECK (risk IN ('low','medium','high','critical')),
  requires_approval boolean NOT NULL DEFAULT false,
  cost_impact text,
  affected_areas text[],
  description_en text NOT NULL, description_tr text NOT NULL
);

CREATE TABLE settings_values (
  key text NOT NULL REFERENCES settings_registry(key),
  scope text NOT NULL DEFAULT 'global',      -- global | dept:<id> | employee:<id> | ceo_dashboard
  value jsonb NOT NULL,
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, scope)
);

CREATE TABLE settings_change_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL, scope text NOT NULL,
  old_value jsonb, new_value jsonb NOT NULL,
  changed_by text NOT NULL,
  change_source text NOT NULL CHECK (change_source IN ('ui','api','system','undo')),
  undo_of bigint REFERENCES settings_change_log(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE model_catalog (
  id text PRIMARY KEY,                       -- LiteLLM alias, örn 'fable-5'
  provider text NOT NULL,
  context_window int,
  cost_in_per_mtok numeric, cost_out_per_mtok numeric,
  speed_score int, quality_score int, reliability numeric,
  fallback_of text REFERENCES model_catalog(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','degraded','retired'))
);

ALTER TABLE routing_rules
  ADD COLUMN model_id text REFERENCES model_catalog(id),
  ADD COLUMN role_slot text;                 -- §19: planning|execution|review|coding|research|design|low_cost|emergency
```

### 4.3 Görünürlük ailesi — `0022x_observability_family`

```sql
CREATE TABLE agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES agents(id),
  task_id uuid REFERENCES tasks(id),
  workflow_run_id uuid,                      -- FK 0023x sonrası eklenir
  parent_run_id uuid REFERENCES agent_runs(id),   -- sub-agent zinciri
  model_id text,
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','waiting_approval','paused','cancelled','failed','succeeded')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  tokens_in bigint NOT NULL DEFAULT 0, tokens_out bigint NOT NULL DEFAULT 0,
  cost_eur numeric NOT NULL DEFAULT 0,
  progress_pct int, error text
);

CREATE TABLE decision_log (                  -- madde 10.2 birebir
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES agent_runs(id),
  decided_by text NOT NULL,
  decision text NOT NULL, rationale text NOT NULL,
  data_used text[], alternatives jsonb,
  confidence numeric, risk text,
  approval_id uuid REFERENCES approvals(id),
  outcome text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tool_calls (                    -- madde 10.3
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES agent_runs(id),
  tool text NOT NULL, params_digest jsonb,
  duration_ms int, ok boolean, error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE file_changes (                  -- madde 10.4
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id uuid REFERENCES agent_runs(id),
  path text NOT NULL,
  op text NOT NULL CHECK (op IN ('read','create','modify','delete')),
  diff_summary text, commit_sha text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### 4.4 İş ailesi — `0023x_workflow_project_family`

```sql
CREATE TABLE projects (                      -- madde 12
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, name text NOT NULL,
  purpose text NOT NULL, strategy_link text,
  owner_employee_id uuid REFERENCES agents(id),
  company_id uuid REFERENCES companies(id),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','done','archived')),
  health_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE tasks ADD COLUMN project_id uuid REFERENCES projects(id);

CREATE TABLE workflows (                     -- madde 6.4
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL, name text NOT NULL,
  owner_employee_id uuid REFERENCES agents(id),
  trigger jsonb NOT NULL,                    -- {kind:'cron'|'event'|'manual', ...}
  enabled boolean NOT NULL DEFAULT true,
  budget_eur numeric, token_limit bigint, timeout_s int,
  risk text NOT NULL DEFAULT 'low',
  logging_level text NOT NULL DEFAULT 'normal',
  output_standard text, version int NOT NULL DEFAULT 1
);

CREATE TABLE workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  seq int NOT NULL,
  kind text NOT NULL CHECK (kind IN ('agent','approval','review','retry','fallback')),
  config jsonb NOT NULL DEFAULT '{}',
  UNIQUE (workflow_id, seq)
);

CREATE TABLE workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id),
  status text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','waiting_approval','failed','succeeded','cancelled')),
  triggered_by text NOT NULL,
  current_step int,
  started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz
);
-- 0023x sonunda: ALTER TABLE agent_runs ADD CONSTRAINT fk_wfrun FOREIGN KEY (workflow_run_id) REFERENCES workflow_runs(id);
```

### 4.5 Bilgi ailesi — `0024x_library_family`

```sql
CREATE TABLE library_items (                 -- madde 13 envanteri
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN (
    'skill','plugin','tool','mcp','prompt_template','persona','policy',
    'governance_rule','workflow','sop','framework','code_component',
    'design_system','research','report','project_doc','training',
    'memory_source','best_practice','lesson_learned')),
  name text NOT NULL, version text,
  owner_dept uuid REFERENCES departments(id),
  usage_notes text, dependencies text[],
  quality_score numeric, review_status text,
  last_used_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name, version)
);

CREATE TABLE library_grants (                -- "kim hangi skill'i kullanabilir" (CEO ayarlar)
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  grantee_kind text NOT NULL CHECK (grantee_kind IN ('department','employee','role_level')),
  grantee_id text NOT NULL,
  granted_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, grantee_kind, grantee_id)
);
```

## 5. İlişki haritası (özet)

```
companies 1─n departments 1─n agents(=employees) 1─n agents (manager_id, self)
agents 1─n personas (versiyonlu) · agents 1─1 employee_records
projects 1─n tasks 1─n task_events · workflows 1─n workflow_steps · workflows 1─n workflow_runs
workflow_runs 1─n agent_runs 1─n {decision_log, tool_calls, file_changes}
agent_runs n─1 agents · decision_log n─1 approvals · approvals 1─n outbox (mevcut)
library_items 1─n library_grants · settings_registry 1─n settings_values 1─n settings_change_log
model_catalog 1─n routing_rules · model_catalog self (fallback_of)
```

## 6-10. Component/Backend/Frontend/API/Event bağlamı

Bu dosya şema sözlüğüdür; tüketim desenleri normatif olarak: yazım seamı ve route handler'lar [[SYSTEM_ARCHITECTURE]] §6-8, Broadcast kanalları §9, API kontratları D4. Şema-türetimli kurallar: (a) UI drill-down her özetten FK zinciriyle iner; (b) Live Operations `agent_runs`+`task_events` birleşimidir; (c) Executive Overview sayıları `v_exec_overview` view'ından gelir (0025x'te tanım; tek round-trip).

## 11. Yetkilendirme (RLS deseni)

- Yeni tüm tablolarda RLS AÇIK; `service_role` bypass (kernel/worker), `authenticated`+CEO claim'i read; yazım yalnız SECURITY DEFINER fn'ler (0014/0015 desenlerinin genellemesi).
- `library_grants`/`settings_values` okuma: ajan profilleri kendi grant'lerini görür (gateway sorgusu), CEO tümünü görür.

## 12. Logging / 13. Audit

Aile-içi log tabloları (settings_change_log, decision_log, tool_calls, file_changes) append-only: UPDATE/DELETE grant'i YOK (0008 revoke-truncate emsali genişler). `audit_log` üst-düzey olayları tutar (kim, ne, ne zaman); aile logları detayı tutar — ikisi arasında `audit_log.detail_ref` (tablo+id) köprüsü.

## 14. Security

Madde 4 sınırı: bu şema yeni kimlik/erişim bürokrasisi EKLEMEZ; RLS mevcut desenin kopyasıdır. Para-çıkışı zinciri (`approvals`→`outbox`) şema-değişmez. Ertelenen sertleştirmeler (örn. kolon-düzeyi şifreleme, satır imzalama) SECURITY_MODEL siciline.

## 15. Error handling / 16. Retry / 17. Fallback

Şema karşılıkları: `agent_runs.status` durum makinesi (waiting_approval retry DEĞİL park); `workflow_steps.kind='retry'/'fallback'` adımları config'iyle deklaratif; `model_catalog.fallback_of` zinciri döngü-korumalı (trigger: kendine/döngüye izin yok).

## 18. Test planı / 19. Acceptance criteria

- Migration testi: boş DB'de 0001→0024x sıralı push → `\dt` beklenen tablo sayısı; ikinci push idempotent (0 değişiklik).
- Kısıt testleri: v2'siz persona ile aktivasyon reddi; fallback döngüsü reddi; append-only tablolarda UPDATE reddi.
- Kabul: her yeni aile için en az bir uçtan-uca kanıt sorgusu (örn. `INSERT settings değişimi → change_log satırı + audit_log satırı + Broadcast payload`).

## 20. Migration planı / 21. Rollback planı

| Aile | Migration | Rollback |
|------|-----------|----------|
| Org | `0020x_org_family` | Yeni tablolar DROP; agents/departments ADD COLUMN'ları DROP (nullable — veri kaybı yalnız yeni kolonlarda, sicili git'te) |
| Kontrol | `0021x_settings_family` | DROP aile; routing_rules kolonları DROP |
| Görünürlük | `0022x_observability_family` | DROP aile (append-only, dış FK yok) |
| İş | `0023x_workflow_project_family` | DROP aile + tasks.project_id DROP |
| Bilgi | `0024x_library_family` | DROP aile |

Her migration dosyası sonunda `-- ROLLBACK:` bloğu (komutlar hazır, elle koşulur). Sıra bağımlılığı: 0020x → 0021x → 0022x → 0023x → 0024x (FK yönleri).

## 22. Uygulama sırası (doğrulamalı)

```bash
supabase db push
psql "$DB" -c "\dt" | grep -cE "companies|personas|settings_registry|agent_runs|projects|library_items"  # → 6
psql "$DB" -c "INSERT INTO companies(slug,name) VALUES ('dxb-global','DXB Global');"                      # → INSERT 0 1
psql "$DB" -c "UPDATE decision_log SET decision='x' WHERE false;"                                          # → permission denied (append-only kanıtı)
```

## 23. Bağımlılıklar / 24. Riskler / 25. Edge case'ler

- Bağımlılık: pgvector (kurulu — 0010), gen_random_uuid (pgcrypto/PG15 built-in).
- Risk: `agents` evrimi mevcut kod yollarını kırabilir → view-alias köprüsü + tip güncellemeleri `packages/shared`'da tek noktadan.
- Edge: sub_agent zincir derinliği — `parent_run_id` sınırsız; UI 3 seviyeden sonra katlar; döngü koruması trigger'da. Yetim manager (arşivlenen müdür) — arşivleme fn'i raporlama zincirini yeniden bağlamadan commit etmez. `settings_values.value` şema-dışı — fn `value_schema` ile doğrular, reddi change_log'a değil hata olarak döner.

## 26. Opus-devralma notu

Bu dosyadaki DDL taslakları migration'a kopyala-uyarla düzeyindedir; Opus, aile sırası + rollback blokları + §22 doğrulama komutlarıyla duraksamadan uygulayabilir. ⛔ işaretli tek karar: `agents`→`employees` yeniden adlandırması YAPILMAZ (alias'la yaşar) — değiştirme kararı ancak eldeki en güçlü model + CEO onayıyla.

## 27. Done definition (bu spec)

27 başlık ✓ · mevcut 18 tablo sicili ✓ · 5 aile DDL taslağı (kolon+kısıt bağlayıcı) ✓ · ilişki haritası ✓ · RLS/append-only desenleri ✓ · migration/rollback haritası ✓ · doğrulama komutları ✓ · Opus-devralma notu ✓
