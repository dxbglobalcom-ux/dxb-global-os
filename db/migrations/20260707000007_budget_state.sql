-- 0007 — budget_state: velocity-breaker + hard-stop state (master-plan PHASE-04 §3, verbatim).
-- Single-row table: boolean PK with CHECK (id) makes a second row impossible.
CREATE TABLE budget_state (
  id            boolean PRIMARY KEY DEFAULT true CHECK (id),  -- tek satır
  monthly_cap_eur   numeric(8,2) NOT NULL DEFAULT 100.00,
  hard_stopped      boolean NOT NULL DEFAULT false,
  velocity_cap_eur_per_hour numeric(8,2) NOT NULL DEFAULT 2.00,
  breaker_tripped   boolean NOT NULL DEFAULT false,
  breaker_tripped_at timestamptz,
  updated_at        timestamptz NOT NULL DEFAULT now()
);
INSERT INTO budget_state DEFAULT VALUES;

-- Conscious addition over the master-plan skeleton (recorded, 04-02 Task 1):
-- the LOCKED project-wide rule enables RLS on every table (13/13 in Phase 3).
ALTER TABLE budget_state ENABLE ROW LEVEL SECURITY;
