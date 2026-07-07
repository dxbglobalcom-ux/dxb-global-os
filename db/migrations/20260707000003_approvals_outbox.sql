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
