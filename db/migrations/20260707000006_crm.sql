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
ALTER TABLE crm_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_deals ENABLE ROW LEVEL SECURITY;
