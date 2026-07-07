# PHASE 03 — State Layer & dxb-mcp Core (KÖK BAĞIMLILIK)

**Req:** QUEUE-01/02/03, REG-01/02/03, MCP-01
**Bağımlılık:** Phase 2 kapısı (iskelet derlenir durumda)
**Bu fazın önemi:** Şema, OS kernel'inin veri modelidir; her paket buna bağımlıdır. Burada verilen SQL ve arayüzler LOCKED'dır — executor yorumlamaz, uygular.

## 1. Hedef + Kabul Kapısı

Supabase Postgres şirketin veri yolu ve tek gerçek kaynağı; ajanlar state'e YALNIZ dxb-mcp'den ulaşır.

Kapı:
1. Tam operasyonel şema migration olarak mevcut, taze DB'ye temiz uygulanır: `supabase db reset` exit 0
2. Bir görev tam yaşam döngüsünü dxb-mcp queue araçlarıyla geçer (inbox→queued→claimed→running→review→awaiting_approval→done) + returned yolu çalışır
3. Crash testi: claim'lenmiş görev sahibi öldürüldüğünde (kill -9) görev lease süresi sonunda yeniden claim'lenebilir — durum kaybı sıfır
4. Sınıflandırıcının bulduğu TÜM legacy personalar (seed-anı ölçümü 2026-07-07: **153** (ilk ölçüm 159; spatial-computing 6 personası CEO korpus temizliğinde kaldırıldı); "367" düzeltilmiş efsane) registry'de dormant `v1.0-legacy`; sayı kanıt-tabanlı, uyuşmazlık Fable'a döner; yeni departman registry aracıyla yaratılabilir
5. dxb-mcp tek server, 8 tool grubu: queue/registry/audit/cost TAM; memory/dashboard/crm/approval yüzeyleri stub (kendi fazlarında genişler)

## 2. LOCKED Mimari Kararlar

| Karar | Gerekçe |
|---|---|
| Tek MCP server (dxb-mcp), 8 tool grubu — 8 ayrı server DEĞİL | İzolasyon gateway profilinin işi; 8 süreç = 8× boilerplate, sıfır kazanç |
| İş görevleri `tasks` tablosunda, kendi SKIP LOCKED claim'i ile — pg-boss İŞ KUYRUĞU DEĞİL | İki kuyruk = iki gerçek kaynağı. pg-boss yalnız sistem rutinleri (cron, reaper, compaction) için Phase 4+'ta girer |
| Status alanları text + CHECK, Postgres enum DEĞİL | Enum'a değer eklemek migration kilidi; text+CHECK evrilir |
| `approvals` = karar kaydı; `outbox` = teslimat kuyruğu — ayrı tablolar | Karar ile yürütme farklı yaşam döngüsü; idempotency outbox'ta yaşar |
| Claim = lease (`lease_expires_at`); reaper süresi dolan claim'i requeue eder | QUEUE-02 dayanıklılık bunun üstünde durur |
| audit_log + task_events append-only: `REVOKE UPDATE, DELETE` | I1; kanıt zinciri değiştirilemez |
| Ajanlar asla raw SQL görmez; RLS default-deny, dxb-mcp service-role | MCP katmanı = validasyon + audit + cost hook noktası |
| Şema `public`'te (Supabase PostgREST/RLS uyumu); tüm tablolarda RLS ENABLE | Dashboard Phase 8'de aynı tabloları RLS'le okur |
| Kimlikler uuid (`gen_random_uuid()`); zaman `timestamptz`, hep `now()` DB-tarafı | İstemci saatine güven yok |

## 3. Dosya-Seviyesi Spec

```
db/migrations/
  0001_operational_core.sql      # tasks, task_events + claim/reaper fonksiyonları
  0002_registry.sql              # agents, departments
  0003_approvals_outbox.sql      # approvals, outbox + geçiş trigger'ları
  0004_cost_audit.sql            # cost_ledger, audit_log (append-only)
  0005_memory_index.sql          # memory_index (Phase 6 genişletir)
  0006_crm.sql                   # crm_clients, crm_contacts, crm_requests, crm_deals
db/seed/import-personas.ts       # agency-agents/*.md frontmatter → agents satırları
packages/shared/src/envelope.ts  # TaskEnvelope Zod şeması (aşağıda birebir)
packages/shared/src/db.ts        # tek postgres client (direct 5432, session mode)
packages/dxb-mcp/src/index.ts    # MCP server bootstrap (stdio), 8 grup kaydı
packages/dxb-mcp/src/groups/{queue,registry,audit,cost}.ts   # TAM
packages/dxb-mcp/src/groups/{memory,dashboard,crm,approval}.ts # stub yüzey
tests/phase3/{lifecycle,crash,registry}.test.ts
```

### 0001_operational_core.sql (birebir — LOCKED)

```sql
-- tasks: iş kuyruğu VE görev kaydı (tek gerçek kaynak)
CREATE TABLE tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_task_id   uuid REFERENCES tasks(id),
  department       text NOT NULL,
  agent_id         uuid,                       -- FK 0002'de eklenir
  objective        text NOT NULL,              -- self-contained; "yukarıya bak" yasak
  output_contract  text NOT NULL,              -- format + done-criteria
  model_tier       text NOT NULL CHECK (model_tier IN ('L1','L2','L3','L4')),
  approval_class   text NOT NULL DEFAULT 'none'
                     CHECK (approval_class IN ('none','internal','outward')),
  budget_max_tokens   integer NOT NULL DEFAULT 200000,
  budget_max_cost_eur numeric(8,4) NOT NULL DEFAULT 1.0,
  priority         integer NOT NULL DEFAULT 0,
  status           text NOT NULL DEFAULT 'inbox' CHECK (status IN
    ('inbox','queued','claimed','running','review','awaiting_approval',
     'done','failed','returned')),
  claimed_by       text,
  claimed_at       timestamptz,
  lease_expires_at timestamptz,
  result           jsonb,
  feedback         text,                       -- returned yolu için (QUEUE-03)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_tasks_claim ON tasks (department, priority DESC, created_at)
  WHERE status = 'queued';
CREATE INDEX idx_tasks_lease ON tasks (lease_expires_at)
  WHERE status IN ('claimed','running');

-- task_events: her geçiş append-only olay
CREATE TABLE task_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id     uuid NOT NULL REFERENCES tasks(id),
  event       text NOT NULL,                   -- 'created'|'claimed'|'transition'|'returned'|'reaped'
  from_status text,
  to_status   text,
  actor       text NOT NULL,                   -- worker_id | agent slug | 'system:reaper'
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_events_task ON task_events (task_id, id);
REVOKE UPDATE, DELETE ON task_events FROM PUBLIC;

-- claim: atomik, yarışsız (QUEUE-01)
CREATE OR REPLACE FUNCTION claim_next_task(
  p_worker_id text, p_departments text[], p_lease_seconds integer DEFAULT 900
) RETURNS SETOF tasks AS $$
  UPDATE tasks SET
    status = 'claimed', claimed_by = p_worker_id, claimed_at = now(),
    lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    updated_at = now()
  WHERE id = (
    SELECT id FROM tasks
    WHERE status = 'queued' AND department = ANY(p_departments)
    ORDER BY priority DESC, created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING *;
$$ LANGUAGE sql;

-- reaper: süresi dolan lease'i kuyruğa iade (QUEUE-02)
-- Fable fix (2026-07-07, ⛔ FABLE-ONLY revizyon, kanıtla): orijinal gövdede
-- UPDATE..RETURNING YENİ değerleri döndürdüğünden was_claimed_by hep NULL
-- yazılıyordu (crash-test kanıtı yakaladı) — eski claimed_by/status ön-CTE'de
-- FOR UPDATE SKIP LOCKED ile yakalanır.
CREATE OR REPLACE FUNCTION reap_expired_leases() RETURNS integer AS $$
DECLARE n integer;
BEGIN
  WITH expired AS (
    SELECT id, claimed_by, status FROM tasks
    WHERE status IN ('claimed','running') AND lease_expires_at < now()
    FOR UPDATE SKIP LOCKED
  ), reaped AS (
    UPDATE tasks t SET status = 'queued', claimed_by = NULL, claimed_at = NULL,
      lease_expires_at = NULL, updated_at = now()
    FROM expired e WHERE t.id = e.id
    RETURNING e.id, e.claimed_by, e.status AS old_status
  )
  INSERT INTO task_events (task_id, event, from_status, to_status, actor, payload)
    SELECT id, 'reaped', old_status, 'queued', 'system:reaper',
           jsonb_build_object('was_claimed_by', claimed_by) FROM reaped;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$ LANGUAGE plpgsql;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;
```

Geçiş kuralları (dxb-mcp `queue.transition` içinde kod olarak; DB CHECK değil — mesajlı hata için):
`inbox→queued`, `claimed→running`, `running→review`, `review→awaiting_approval|done|returned`, `awaiting_approval→done|failed`, `running→failed`, `returned→queued`. Başka geçiş = hata. Her geçiş task_events'e yazar; `returned` geçişi `feedback` zorunlu kılar (QUEUE-03).

### 0002_registry.sql (birebir — LOCKED)

```sql
CREATE TABLE departments (
  slug        text PRIMARY KEY,               -- 'engineering','marketing',...
  display_name text NOT NULL,
  mcp_profile text NOT NULL DEFAULT 'default-deny',
  status      text NOT NULL DEFAULT 'dormant' CHECK (status IN ('dormant','active')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE agents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,          -- dosya adından türetilir
  department    text NOT NULL REFERENCES departments(slug),
  role          text NOT NULL CHECK (role IN ('head','specialist','worker')),
  brain         text NOT NULL DEFAULT 'glm-5.2',   -- §10 brain map ilk değeri
  mcp_profile   text NOT NULL DEFAULT 'inherit',   -- 'inherit' = departmanınki
  skills        jsonb NOT NULL DEFAULT '[]'::jsonb,
  autonomy_level integer NOT NULL DEFAULT 0 CHECK (autonomy_level BETWEEN 0 AND 3),
  persona_path  text NOT NULL,                 -- agency-agents/<dept>/<file>.md
  persona_version text NOT NULL DEFAULT 'v1.0',
  status        text NOT NULL DEFAULT 'dormant' CHECK (status IN ('dormant','active')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_agents_dept ON agents (department, role);
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_agent
  FOREIGN KEY (agent_id) REFERENCES agents(id);
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
```

Seed: `db/seed/import-personas.ts` — **korpus gerçeği (ölçüm 2026-07-07):** `agency-agents/` altındaki `integrations/` (185 dosya = aynı ajanların diğer araçlara çevrimi), `examples/`, `scripts/` ve kök md'ler persona DEĞİL — hard-exclude. Persona sınıflandırma kuralı: dosya `---` frontmatter + `name:` alanı taşıyorsa persona, değilse SKIP + `seed-skipped.log` audit kaydı (strategy/ şu an 0 persona veriyor — doküman dizini). Kalan departman dizinleri taranır; klasör adı = department slug (lowercase, boşluk→`-`; yoksa departments'a dormant eklenir), frontmatter'dan slug/role çıkarılır (kısmî/bozuk frontmatter'da: role='worker', slug=dosya adı kebab-case, `persona_version='v1.0-unparsed'`). Tam personalar `persona_version='v1.0-legacy'`. Persona GÖVDESİ DB'ye girmez — dosyada kalır (lazy activation, REG-02). Ölçülen hedef: **153 persona, 11 persona-taşıyan dizin** (seed-anı, 2026-07-07) — seed çıktısı bu sayıyla eşleşmezse Fable'a dur-raporu.

### 0003_approvals_outbox.sql (birebir — LOCKED)

```sql
CREATE TABLE approvals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id      uuid NOT NULL REFERENCES tasks(id),
  action_type  text NOT NULL,                  -- 'email.send'|'payment'|'contract'|'ad_spend'|...
  payload      jsonb NOT NULL,                 -- TÜM girdiler, draft anında dondurulur
  risk_class   text NOT NULL DEFAULT 'high' CHECK (risk_class IN ('low','medium','high')),
  status       text NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft','pending','approved','rejected')),
  decided_by   text, decided_at timestamptz, decision_note text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id     uuid UNIQUE NOT NULL REFERENCES approvals(id),
  idempotency_key text UNIQUE NOT NULL,
  status          text NOT NULL DEFAULT 'ready'
                    CHECK (status IN ('ready','executing','executed','failed')),
  attempts        integer NOT NULL DEFAULT 0,
  last_error      text,
  executed_at     timestamptz,
  execution_result jsonb
);

-- Geçiş koruması: yalnız ileri yönlü, karar tek sefer
CREATE OR REPLACE FUNCTION guard_approval_transition() RETURNS trigger AS $$
BEGIN
  IF OLD.status = 'draft'    AND NEW.status NOT IN ('draft','pending') THEN RAISE EXCEPTION 'draft→% yasak', NEW.status; END IF;
  IF OLD.status = 'pending'  AND NEW.status NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'pending→% yasak', NEW.status; END IF;
  IF OLD.status IN ('approved','rejected') THEN RAISE EXCEPTION 'karar değiştirilemez'; END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_approval_guard BEFORE UPDATE OF status ON approvals
  FOR EACH ROW EXECUTE FUNCTION guard_approval_transition();

-- approved → outbox satırı otomatik doğar (tek yürütme kaydı)
CREATE OR REPLACE FUNCTION enqueue_outbox_on_approve() RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO outbox (approval_id, idempotency_key)
    VALUES (NEW.id, NEW.action_type || ':' || NEW.id::text);
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;
CREATE TRIGGER trg_outbox_enqueue AFTER UPDATE OF status ON approvals
  FOR EACH ROW EXECUTE FUNCTION enqueue_outbox_on_approve();

ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox ENABLE ROW LEVEL SECURITY;
```

Not: outbox EXECUTOR bu fazda YAZILMAZ (Phase 4 işi) — ama tablolar ve trigger'lar şimdi doğar ki ajanlar Phase 4'te draft üretebilsin ve state machine kökten test edilsin.

### 0004_cost_audit.sql (birebir — LOCKED)

```sql
CREATE TABLE cost_ledger (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  task_id    uuid REFERENCES tasks(id),
  agent_id   uuid REFERENCES agents(id),
  department text,
  model      text NOT NULL,
  mode       text NOT NULL CHECK (mode IN ('subscription','api','free-tier')),
  prompt_tokens integer NOT NULL DEFAULT 0,
  completion_tokens integer NOT NULL DEFAULT 0,
  cost_eur   numeric(10,6) NOT NULL DEFAULT 0,
  source     text NOT NULL DEFAULT 'hook',    -- 'litellm'|'hook'|'manual'
  meta       jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cost_dept_time ON cost_ledger (department, created_at);

CREATE TABLE audit_log (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor      text NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('agent','ceo','system')),
  action     text NOT NULL,                    -- 'tool_call'|'transition'|'decision'|...
  task_id    uuid,
  payload    jsonb NOT NULL DEFAULT '{}'::jsonb,  -- redaksiyon MCP katmanında (secret asla buraya gelmez)
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_task ON audit_log (task_id, id);
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON cost_ledger FROM PUBLIC;
ALTER TABLE cost_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
```

### 0005_memory_index.sql (çekirdek — Phase 6 genişletir)

```sql
CREATE TABLE memory_index (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        text NOT NULL CHECK (kind IN ('fact','relation','artifact','procedure')),
  store       text NOT NULL CHECK (store IN ('obsidian','graphify','notebook','pgvector','claude-mem')),
  ref         text NOT NULL,                   -- path / node id / row id
  provenance  jsonb NOT NULL,                  -- {source, agent, task_id, origin}
  trust_tier  text NOT NULL DEFAULT 'quarantined'
                CHECK (trust_tier IN ('trusted','quarantined')),
  confidence  numeric(3,2) NOT NULL DEFAULT 0.5,
  superseded_by uuid REFERENCES memory_index(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  expires_at  timestamptz
);
CREATE INDEX idx_memory_kind ON memory_index (kind, trust_tier)
  WHERE superseded_by IS NULL;
ALTER TABLE memory_index ENABLE ROW LEVEL SECURITY;
```

### 0006_crm.sql (ince — Phase 8 UI'da render edilir)

```sql
CREATE TABLE crm_clients  (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, status text NOT NULL DEFAULT 'lead'
    CHECK (status IN ('lead','active','paused','closed')),
  meta jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE crm_contacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  name text NOT NULL, email text, phone text, role text,
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE crm_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES crm_clients(id), task_id uuid REFERENCES tasks(id),
  summary text NOT NULL, status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','triaged','in_progress','delivered','rejected')),
  created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE crm_deals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES crm_clients(id),
  title text NOT NULL, value_eur numeric(12,2), stage text NOT NULL DEFAULT 'open'
    CHECK (stage IN ('open','proposal','won','lost')),
  created_at timestamptz NOT NULL DEFAULT now());
-- 4 tabloda da: ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
```

### packages/shared/src/envelope.ts (birebir — LOCKED)

```typescript
import { z } from "zod";

export const TaskEnvelope = z.object({
  department: z.string().min(1),
  objective: z.string().min(20),          // self-contained zorunluluğunun kaba bekçisi
  output_contract: z.string().min(10),
  model_tier: z.enum(["L1", "L2", "L3", "L4"]),
  approval_class: z.enum(["none", "internal", "outward"]).default("none"),
  budget: z.object({
    max_tokens: z.number().int().positive().default(200_000),
    max_cost_eur: z.number().positive().default(1.0),
  }).default({}),
  priority: z.number().int().min(0).max(9).default(0),
  parent_task_id: z.string().uuid().nullable().default(null),
});
export type TaskEnvelope = z.infer<typeof TaskEnvelope>;
```

### dxb-mcp tool yüzeyi (Phase 3'te TAM olan gruplar)

| Tool | Girdi (Zod) | Davranış |
|---|---|---|
| `queue.create_task` | TaskEnvelope | INSERT inbox→queued; task_events 'created'; audit append |
| `queue.claim` | {worker_id, departments[], lease_seconds?} | `claim_next_task()` çağrısı |
| `queue.transition` | {task_id, to_status, payload?} | Geçiş tablosu denetimi; event + audit |
| `queue.return` | {task_id, feedback} | review→returned; feedback zorunlu |
| `queue.get` / `queue.list` | {task_id} / {department?, status?} | SELECT |
| `registry.get_agent` | {slug} | satır + persona_path (gövde DEĞİL) |
| `registry.list` | {department?, role?, status?} | SELECT |
| `registry.create_department` | {slug, display_name} | INSERT dormant (REG-03) |
| `registry.activate` | {slug} | dormant→active; audit |
| `audit.append` | {actor, actor_type, action, task_id?, payload} | INSERT (redaksiyon: değerleri `[REDACTED]`e çeviren anahtar listesi: password/token/key/secret/authorization) |
| `audit.trace` | {task_id} | task_events + audit_log birleşik kronolojik |
| `cost.record` | {task_id?, model, mode, tokens, cost_eur, ...} | INSERT |
| `cost.summary` | {department?, since?} | SUM per dept/model/mode |

Stub gruplar (`memory.*`, `dashboard.*`, `crm.*`, `approval.*`): tool tanımı + "not yet active in this phase" hatası döner — yüzey MCP-01 gereği şimdiden mevcut, gövde kendi fazında.

### Persona v2 Programı (CEO kararı 2026-07-07 — dalga-kademeli)

Legacy personalar (153 seed-anı; ilk ölçüm 159, spatial-computing sonradan kaldırıldı — `agency-agents/`) yetersiz kalitede; **her persona Fable tarafından v2 kalitesinde yeniden yazılır**. Zamanlama CEO-onaylı kademeli model:

- Phase 3: 153 legacy dormant `v1.0-legacy` import (bu faz — yalnız kayıt, yeniden yazım YOK)
- Phase 5: dikey dilimin kullandığı departman(lar)ın personaları ilk v2 batch'i olarak Fable'ca yazılır (10/10 gate ön-koşulu)
- Phase 10: her aktivasyon dalgası = o departmanın personalarının Fable v2 yazımı + aktivasyon çifti; **v2'siz departman aktive edilemez**
- v2 dosyaları `personas/<dept>/<slug>.md` (yeni, Fable-owned dizin); legacy `agency-agents/` READ-ONLY referans kalır; yeniden yazımda registry `persona_path` yeni dosyaya döner + `persona_version='v2.0-fable'`
- ⛔ FABLE-ONLY: persona v2 nihai metni (HR fabrikası Phase 10'da hammadde/taslak desteği verir, yazarlık Fable'da)

## 4. Adım Listesi (adım = commit)

| # | Adım | Doğrulama ("çalıştır → gör") |
|---|---|---|
| 1 | Phase-3 toolset study→install (supabase CLI, supabase-js, pg-boss KURULMAZ-notu, @modelcontextprotocol/sdk, zod, drizzle-or-kysely seçimi) — study card'lar zaten Phase 2'de; install + tracker INSTALL kolonu | `pnpm ls @modelcontextprotocol/sdk zod @supabase/supabase-js` sürümleri CLAUDE.md pinleriyle eşleşir |
| 2 | `supabase init` + local stack ayağa | `supabase start` → "API URL: http://127.0.0.1:54321" satırı |
| 3 | Migration 0001 (tasks + events + claim + reaper) | `supabase db reset` exit 0; `psql -c "\df claim_next_task"` fonksiyonu listeler |
| 4 | Migration 0002 + persona seed script | seed sonrası `psql -c "SELECT count(*) FROM agents"` → 153 (kanıt-tabanlı; sınıflandırıcı çıktısıyla eşleşmeli); `SELECT count(*) FROM departments` → 11 |
| 5 | Migration 0003 (approvals+outbox+trigger'lar) | `psql`: pending→draft UPDATE denemesi EXCEPTION fırlatır; pending→approved outbox satırı doğurur |
| 6 | Migration 0004+0005+0006 | `supabase db reset` exit 0 (tümü sıfırdan); `\dt` 13+ tablo |
| 7 | shared: envelope.ts + db.ts | `pnpm -r exec tsc --build` exit 0; envelope unit test 'objective<20 reddi' geçer |
| 8 | dxb-mcp: server bootstrap + queue grubu | MCP inspector/`tests/phase3/lifecycle.test.ts`: create→claim→transition zinciri; task_events satır sayısı ≥4 |
| 9 | registry + audit + cost grupları | lifecycle testine registry.activate + audit.trace + cost.summary eklenir, geçer |
| 10 | Stub gruplar + redaksiyon filtresi | `audit.append` payload'ında `{"api_key":"x"}` → DB'de `[REDACTED]`; stub çağrısı düzgün hata |
| 11 | Crash testi | claim yap → süreci `kill -9` → `SELECT reap_expired_leases()` (kısa lease ile) → görev tekrar 'queued'; event 'reaped' kayıtlı |
| 12 | Faz kapanışı: VERIFICATION + SUMMARY + tracker EMBED kolonları | 10/10 lifecycle tekrarı script'i exit 0 |

## 5. Risk + Fallback

- **Supabase self-host yerine local CLI:** bu fazda her şey `supabase start` (Docker local). VPS taşıma Phase 7 — migration'lar aynı, risk düşük.
- **drizzle vs kysely (CLAUDE.md P2'de seç dedi):** KARAR şimdi — **kysely**: SQL'e daha yakın, şema zaten SQL-first migration; drizzle'ın şema-TS-first modeli migration otoritemizle çakışır. (⛔ bu kararın revizyonu FABLE-ONLY.)
- **pg-boss yanlış kullanım riski:** bu fazda pg-boss KURULMAZ — tracker'da "Phase 4 install" olarak işaretli kalır. Kör kurulum kuralı.
- **Persona korpus tutarsızlığı:** sınıflandırıcı frontmatter'sız dosyayı persona SAYMAZ (skip + audit log); persona dizinindeki kısmî/bozuk frontmatter varsayılanlara düşer ve `persona_version='v1.0-unparsed'` işaretlenir — Persona v2 programı (Fable, dalga-kademeli, Phase 10) düzeltir; import HİÇBİR dosyada patlamaz.

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: kysely/drizzle karar revizyonu; şema değişikliği (herhangi bir tablo/kolon/kısıt farklılaşması); faz kapanış verdict'i.
- Opus uygulayabilir: adım 1–12'nin tamamı — SQL ve arayüzler birebir verildi; boşluk kalan tek yer test dosyalarının iç düzeni (Opus seviyesi kabul edilebilir).
