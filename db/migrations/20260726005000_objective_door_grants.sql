-- W2.1 — the objective door, second half.
--
-- Caught by an end-to-end run through the real UI, not by reading code: the
-- form submitted and the page honestly showed "permission denied for function
-- control_objective_create". The functions have existed since the revenue wave
-- and were never granted to `authenticated`, because nothing had ever called
-- them from the product — the same class of gap as chat_sessions shipping
-- without RLS an hour earlier.
--
-- They are SECURITY DEFINER and carry their own CEO gate (fn_org_actor) plus
-- audit and decision rows, exactly like control_engine_set_owner, which already
-- holds this grant. Granting EXECUTE opens the door, not the gate.
BEGIN;

GRANT EXECUTE ON FUNCTION public.control_objective_create(
  text, numeric, text, text, text, jsonb, date, date, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_objective_activate(uuid, date, date, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.control_objective_close(uuid, text, text) TO authenticated;

COMMIT;

-- ROLLBACK:
--   REVOKE EXECUTE ON FUNCTION public.control_objective_create(text, numeric, text, text, text, jsonb, date, date, numeric, text) FROM authenticated;
--   REVOKE EXECUTE ON FUNCTION public.control_objective_activate(uuid, date, date, text) FROM authenticated;
--   REVOKE EXECUTE ON FUNCTION public.control_objective_close(uuid, text, text) FROM authenticated;
