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
