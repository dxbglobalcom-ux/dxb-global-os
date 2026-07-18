-- E12.4 (GAP-05) — CRM company scoping. Multi-company holding law: every
-- CRM record belongs to exactly one company. company_id lives ONLY on
-- crm_clients; contacts/deals/requests scope through their client_id FK
-- (single source, no denormalized company column to drift).
--
-- Bootstrap parity (R2.5 lesson): the holding's company row is RUNTIME-born
-- (control_org_create_company), so its uuid may differ per environment —
-- the default is a STABLE function resolving the oldest active company,
-- never a literal. On a fresh chain with zero companies the default yields
-- NULL and the NOT NULL wall correctly refuses CRM rows until the holding
-- company exists (a CRM record without a company is meaningless).

CREATE OR REPLACE FUNCTION fn_default_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM companies WHERE status = 'active' ORDER BY created_at LIMIT 1
$$;

ALTER TABLE crm_clients
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id)
    DEFAULT fn_default_company_id();

-- Backfill (live: 0 rows today — replay-parity for any environment that
-- accumulated rows between chain positions).
UPDATE crm_clients SET company_id = fn_default_company_id() WHERE company_id IS NULL;

ALTER TABLE crm_clients ALTER COLUMN company_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS crm_clients_company_idx ON crm_clients (company_id);
