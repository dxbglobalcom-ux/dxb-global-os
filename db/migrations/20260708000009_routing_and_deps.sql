-- routing_and_deps: routing_rules table + tasks.depends_on + dependency-aware claim_next_task.
-- SQL body below is LOCKED (master-plan PHASE-05 §3 "0008_routing_and_deps.sql", byte-faithful).
-- ADAPT-1 (recorded): logical slot 0008 was consumed by 20260707000008_revoke_truncate.sql;
-- repo uses Supabase CLI timestamp naming — filename differs, SQL content unchanged.
-- routing_rules RLS: enabled with NO policies (anon/authenticated default-deny; service_role/backend only).

CREATE TABLE routing_rules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_class  text NOT NULL,        -- 'strategy'|'architecture'|'code.standard'|'code.bulk'
                                    -- |'research.fanout'|'content.outbound'|'summarize'|'orchestration'
  match       jsonb NOT NULL DEFAULT '{}'::jsonb,  -- ileri eşleme alanları (dept, keyword...)
  model_tier  text NOT NULL CHECK (model_tier IN ('L1','L2','L3','L4')),
  model       text NOT NULL,        -- 'fable-5'|'opus-4.8'|'sonnet-5'|'codex-5.5'|'glm-5.2'|...
  mode        text NOT NULL CHECK (mode IN ('subscription','api','free-tier')),
  effort      text NOT NULL DEFAULT 'medium' CHECK (effort IN ('low','medium','high','max')),
  needs_council boolean NOT NULL DEFAULT false,
  priority    integer NOT NULL DEFAULT 0,     -- eşleşme sırası (yüksek önce)
  enabled     boolean NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE routing_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE tasks ADD COLUMN depends_on uuid[] NOT NULL DEFAULT '{}';

-- claim artık bağımlılık gözetir (0001'deki fonksiyonun yerine geçer)
CREATE OR REPLACE FUNCTION claim_next_task(
  p_worker_id text, p_departments text[], p_lease_seconds integer DEFAULT 900
) RETURNS SETOF tasks AS $$
  UPDATE tasks SET
    status = 'claimed', claimed_by = p_worker_id, claimed_at = now(),
    lease_expires_at = now() + make_interval(secs => p_lease_seconds),
    updated_at = now()
  WHERE id = (
    SELECT t.id FROM tasks t
    WHERE t.status = 'queued' AND t.department = ANY(p_departments)
      AND NOT EXISTS (SELECT 1 FROM tasks d
                      WHERE d.id = ANY(t.depends_on) AND d.status <> 'done')
    ORDER BY t.priority DESC, t.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING *;
$$ LANGUAGE sql;
