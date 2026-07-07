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
