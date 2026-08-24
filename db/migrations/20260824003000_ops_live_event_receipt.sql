-- B36 · Block 3, second audit round — A LIVE EVENT MUST BE BORN FROM THE
-- COMPANY'S OWN RECORDS.
--
-- THE DEFECT THIS CLOSES, measured on 2026-08-24. `NOTIFY` is a COMMAND, not a
-- function: PostgreSQL has no privilege over it, so no GRANT or REVOKE can stop
-- any role that may connect from notifying any channel. The ops:live collector
-- LISTENs on `dxb_ops_live` and republished ANYTHING that parsed as a §9a
-- envelope, verbatim, onto the channel the CEO's Live Operations page reads. The
-- envelope is entirely forgeable — a uuid, a timestamp, a snake_case type, an
-- actor string — so the read-only window, which cannot write one row, could
-- still have put an event that never happened on his screen.
--
-- The audit's ruling, and it is the shape of this migration: "CEO ekranına giden
-- dinleyici, olayın gerçekten şirketin kendi kayıtlarından doğduğunu
-- doğrulamadan hiçbir mesajı yayımlamamalı."
--
-- HOW. `fn_opslive_notify` is already the SINGLE door every ops:live event goes
-- through, and it is SECURITY DEFINER. It now writes a RECEIPT — the event's own
-- id — in the SAME transaction as the source write, and only then notifies. The
-- collector verifies each envelope against that receipt and CONSUMES it, so an
-- event can be published once and only if the company itself issued it. A forged
-- NOTIFY carries an id no receipt was ever written for, and is dropped.
--
-- WHERE THE RECEIPT LIVES, and it is the point. `dxb_internal` is a schema the
-- one-way window cannot stand in: scripts/b36/company-one-way-window.sql takes
-- USAGE on every schema but `public` and `pgboss` away from it. So the read-only
-- role cannot read a receipt, cannot guess an unconsumed id, and cannot write
-- one. Putting the table in `public` would have handed it the ids through the
-- window's own SELECT.
--
-- Idempotent and safe to re-run.

CREATE SCHEMA IF NOT EXISTS dxb_internal;
REVOKE ALL ON SCHEMA dxb_internal FROM PUBLIC;

CREATE TABLE IF NOT EXISTS dxb_internal.ops_live_issued (
  event_id  uuid        PRIMARY KEY,
  issued_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE dxb_internal.ops_live_issued FROM PUBLIC;

CREATE INDEX IF NOT EXISTS ops_live_issued_issued_at_idx
  ON dxb_internal.ops_live_issued (issued_at);

-- WHO MAY TOUCH THE RECEIPT. Two roles and no others: the owner of the door
-- (`fn_opslive_notify` is SECURITY DEFINER, so it runs as ITS owner, which
-- CREATE OR REPLACE never changes), and whoever runs this chain — which is the
-- role the collector connects as. Named rather than assumed, because the first
-- run of this migration was applied by a different superuser than the one that
-- owns the door and the door could not write its own receipt.
DO $grant$
DECLARE
  v_role text;
BEGIN
  FOR v_role IN
    SELECT DISTINCT r FROM (
      SELECT pg_get_userbyid(p.proowner) AS r
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public' AND p.proname = 'fn_opslive_notify'
      UNION ALL SELECT current_user
    ) x WHERE r IS NOT NULL
  LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA dxb_internal TO %I', v_role);
    EXECUTE format('GRANT SELECT, INSERT, DELETE ON dxb_internal.ops_live_issued TO %I', v_role);
  END LOOP;
END $grant$;

-- The single NOTIFY door, now leaving its receipt first. The INSERT and the
-- NOTIFY are in the source write's own transaction: if that rolls back, neither
-- the receipt nor the notification exists, and the two can never disagree.
CREATE OR REPLACE FUNCTION public.fn_opslive_notify(p_env jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_text text;
  v_id   uuid;
BEGIN
  v_text := p_env::text;
  IF octet_length(v_text) > 7500 THEN
    v_text := jsonb_set(p_env, '{payload}', '{"truncated": true}'::jsonb)::text;
  END IF;

  -- The receipt. Without it the collector will not publish, so an event that
  -- did not come through this door cannot reach the CEO's screen.
  v_id := (p_env->>'event_id')::uuid;
  IF v_id IS NOT NULL THEN
    INSERT INTO dxb_internal.ops_live_issued (event_id) VALUES (v_id)
      ON CONFLICT (event_id) DO NOTHING;
  END IF;

  PERFORM pg_notify('dxb_ops_live', v_text);
END $$;

REVOKE ALL ON FUNCTION public.fn_opslive_notify(jsonb) FROM PUBLIC, anon;
