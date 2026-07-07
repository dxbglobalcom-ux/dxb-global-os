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
-- Fable fix (2026-07-07, ⛔ recorded): UPDATE..RETURNING yeni değerleri döndürür —
-- orijinal LOCKED gövde was_claimed_by'ı her zaman NULL yazıyordu (kanıt kaybı).
-- Eski claimed_by/status bir ön-CTE'de FOR UPDATE SKIP LOCKED ile yakalanır.
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
